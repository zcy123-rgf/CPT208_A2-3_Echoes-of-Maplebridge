import { readFileSync } from 'node:fs';
import pg from 'pg';

const { Pool } = pg;

const DEFAULT_SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30;
const REWARD_BY_RANK = ['Suzhou sachet', 'Suzhou fan', 'Suzhou hairpin'];

function nowIso() {
  return new Date().toISOString();
}

function pgDate(date = new Date()) {
  return date;
}

function parseFragments(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;

  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function publicUser(row) {
  return {
    id: row.id,
    username: row.username,
    displayName: row.display_name,
  };
}

function slugifyLegacyValue(value) {
  return String(value ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 24) || 'legacy-user';
}

function photoRowToResponse(row) {
  return {
    id: row.id,
    userId: row.user_id,
    userName: row.user_name,
    caption: row.caption,
    imageUrl: row.image_url,
    thumbnailUrl: row.thumbnail_url || row.image_url,
    storyPointId: row.story_point_id,
    storyPointTitle: row.story_point_title,
    likes: Number(row.likes ?? 0),
    createdAt: new Date(row.created_at).toISOString(),
    width: row.width ?? null,
    height: row.height ?? null,
    originalSizeBytes: row.original_size_bytes ?? null,
    optimizedSizeBytes: row.optimized_size_bytes ?? null,
    uploadKind: row.upload_kind ?? null,
    moderationStatus: row.moderation_status ?? null,
    isBookmarked: Boolean(row.is_bookmarked),
  };
}

export class PostgresDatabase {
  constructor({ connectionString, legacyStorePath, storyPoints, sessionTtlMs = DEFAULT_SESSION_TTL_MS }) {
    const parsedConnectionString = new URL(connectionString);
    parsedConnectionString.searchParams.delete('sslmode');

    this.pool = new Pool({
      connectionString: parsedConnectionString.toString(),
      max: Number(process.env.POSTGRES_CONNECTION_LIMIT ?? process.env.MYSQL_CONNECTION_LIMIT ?? 5),
      ssl: {
        rejectUnauthorized: false,
      },
    });
    this.legacyStorePath = legacyStorePath;
    this.storyPoints = storyPoints;
    this.sessionTtlMs = sessionTtlMs;
  }

  async setup() {
    await this.bootstrapSchema();
    await this.seedStoryPoints();
    await this.migrateLegacyJsonIfNeeded();
    await this.cleanupExpiredSessions();
  }

  async bootstrapSchema() {
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS story_points (
        id VARCHAR(20) PRIMARY KEY,
        short_title VARCHAR(120) NOT NULL,
        title VARCHAR(255) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(80) PRIMARY KEY,
        username VARCHAR(80) NOT NULL UNIQUE,
        display_name VARCHAR(120) NOT NULL,
        password_hash CHAR(128) NOT NULL,
        password_salt CHAR(32) NOT NULL,
        created_at TIMESTAMPTZ NOT NULL,
        last_login_at TIMESTAMPTZ NULL
      );

      CREATE TABLE IF NOT EXISTS sessions (
        token CHAR(48) PRIMARY KEY,
        user_id VARCHAR(80) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ NOT NULL,
        expires_at TIMESTAMPTZ NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
      CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);

      CREATE TABLE IF NOT EXISTS progress (
        user_id VARCHAR(80) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        current_story_point_index INTEGER NOT NULL DEFAULT 0,
        collected_fragments_json JSONB NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL
      );

      CREATE TABLE IF NOT EXISTS photos (
        id VARCHAR(80) PRIMARY KEY,
        user_id VARCHAR(80) NOT NULL REFERENCES users(id),
        user_name VARCHAR(120) NOT NULL,
        caption VARCHAR(255) NOT NULL,
        image_url TEXT NOT NULL,
        thumbnail_url TEXT NOT NULL,
        story_point_id VARCHAR(20) NOT NULL,
        story_point_title VARCHAR(255) NOT NULL,
        likes INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL,
        width INTEGER NULL,
        height INTEGER NULL,
        original_size_bytes INTEGER NULL,
        optimized_size_bytes INTEGER NULL,
        upload_kind VARCHAR(64) NOT NULL DEFAULT 'optimized',
        moderation_status VARCHAR(64) NOT NULL DEFAULT 'approved'
      );

      CREATE INDEX IF NOT EXISTS idx_photos_story_point_id ON photos(story_point_id);
      CREATE INDEX IF NOT EXISTS idx_photos_created_at ON photos(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_photos_user_id ON photos(user_id);

      CREATE TABLE IF NOT EXISTS photo_bookmarks (
        user_id VARCHAR(80) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        photo_id VARCHAR(80) NOT NULL REFERENCES photos(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ NOT NULL,
        PRIMARY KEY (user_id, photo_id)
      );

      CREATE INDEX IF NOT EXISTS idx_photo_bookmarks_photo_id ON photo_bookmarks(photo_id);
    `);
  }

  async seedStoryPoints() {
    const { rows } = await this.pool.query('SELECT COUNT(*)::int AS count FROM story_points');
    if (rows[0].count > 0) return;

    for (const point of this.storyPoints) {
      await this.pool.query(
        `
          INSERT INTO story_points (id, short_title, title)
          VALUES ($1, $2, $3)
          ON CONFLICT (id) DO NOTHING
        `,
        [point.id, point.shortTitle, point.title]
      );
    }
  }

  async migrateLegacyJsonIfNeeded() {
    const usersCount = await this.pool.query('SELECT COUNT(*)::int AS count FROM users');
    const photosCount = await this.pool.query('SELECT COUNT(*)::int AS count FROM photos');
    if (usersCount.rows[0].count > 0 || photosCount.rows[0].count > 0) return;

    let legacy;
    try {
      legacy = JSON.parse(readFileSync(this.legacyStorePath, 'utf8'));
    } catch {
      return;
    }

    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      const ensureLegacyUser = async (userId, userName) => {
        if (!userId) return;
        await client.query(
          `
            INSERT INTO users (
              id, username, display_name, password_hash, password_salt, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (id) DO NOTHING
          `,
          [
            userId,
            `legacy-${slugifyLegacyValue(userId)}`,
            userName || userId,
            '00'.repeat(64),
            '00'.repeat(16),
            pgDate(),
          ]
        );
      };

      for (const photo of legacy.photos ?? []) {
        await ensureLegacyUser(photo.userId, photo.userName);
        await client.query(
          `
            INSERT INTO photos (
              id, user_id, user_name, caption, image_url, thumbnail_url,
              story_point_id, story_point_title, likes, created_at,
              width, height, original_size_bytes, optimized_size_bytes,
              upload_kind, moderation_status
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
            ON CONFLICT (id) DO NOTHING
          `,
          [
            photo.id,
            photo.userId,
            photo.userName,
            photo.caption,
            photo.imageUrl,
            photo.thumbnailUrl || photo.imageUrl,
            photo.storyPointId,
            photo.storyPointTitle,
            Number(photo.likes ?? 0),
            pgDate(new Date(photo.createdAt ?? nowIso())),
            photo.width ?? null,
            photo.height ?? null,
            photo.originalSizeBytes ?? null,
            photo.optimizedSizeBytes ?? null,
            'legacy',
            'approved',
          ]
        );
      }

      for (const value of Object.values(legacy.progress ?? {})) {
        if (!value?.userId) continue;
        await ensureLegacyUser(value.userId, value.userName);
        await client.query(
          `
            INSERT INTO progress (
              user_id, current_story_point_index, collected_fragments_json, updated_at
            ) VALUES ($1, $2, $3::jsonb, $4)
            ON CONFLICT (user_id) DO UPDATE SET
              current_story_point_index = EXCLUDED.current_story_point_index,
              collected_fragments_json = EXCLUDED.collected_fragments_json,
              updated_at = EXCLUDED.updated_at
          `,
          [
            value.userId,
            Number(value.currentStoryPointIndex ?? 0),
            JSON.stringify(Array.isArray(value.collectedFragments) ? value.collectedFragments : []),
            pgDate(new Date(value.updatedAt ?? nowIso())),
          ]
        );
      }

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async cleanupExpiredSessions() {
    await this.pool.query('DELETE FROM sessions WHERE expires_at <= $1', [pgDate()]);
  }

  async getStoryPoints() {
    const { rows } = await this.pool.query(
      `
        SELECT id, short_title AS "shortTitle", title
        FROM story_points
        ORDER BY id::int
      `
    );
    return rows;
  }

  async createUser({ id, username, displayName, passwordHash, passwordSalt }) {
    const client = await this.pool.connect();
    const createdAt = pgDate();
    try {
      await client.query('BEGIN');
      await client.query(
        `
          INSERT INTO users (id, username, display_name, password_hash, password_salt, created_at)
          VALUES ($1, $2, $3, $4, $5, $6)
        `,
        [id, username, displayName, passwordHash, passwordSalt, createdAt]
      );
      await client.query(
        `
          INSERT INTO progress (user_id, current_story_point_index, collected_fragments_json, updated_at)
          VALUES ($1, 0, $2::jsonb, $3)
        `,
        [id, '[]', createdAt]
      );
      await client.query('COMMIT');
      return { id, username, display_name: displayName };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async findUserByUsername(username) {
    const { rows } = await this.pool.query('SELECT * FROM users WHERE username = $1 LIMIT 1', [username]);
    return rows[0] ?? null;
  }

  async findUserById(userId) {
    const { rows } = await this.pool.query('SELECT * FROM users WHERE id = $1 LIMIT 1', [userId]);
    return rows[0] ?? null;
  }

  async touchUserLogin(userId) {
    await this.pool.query('UPDATE users SET last_login_at = $1 WHERE id = $2', [pgDate(), userId]);
  }

  async createSession(userId, token) {
    const createdAt = new Date();
    const expiresAt = new Date(createdAt.getTime() + this.sessionTtlMs);
    await this.pool.query(
      `
        INSERT INTO sessions (token, user_id, created_at, expires_at)
        VALUES ($1, $2, $3, $4)
      `,
      [token, userId, pgDate(createdAt), pgDate(expiresAt)]
    );
  }

  async revokeSession(token) {
    await this.pool.query('DELETE FROM sessions WHERE token = $1', [token]);
  }

  async getSessionUser(token) {
    await this.cleanupExpiredSessions();
    const { rows } = await this.pool.query(
      `
        SELECT users.id, users.username, users.display_name
        FROM sessions
        JOIN users ON users.id = sessions.user_id
        WHERE sessions.token = $1
          AND sessions.expires_at > $2
        LIMIT 1
      `,
      [token, pgDate()]
    );
    return rows[0] ? publicUser(rows[0]) : null;
  }

  async getProgress(userId) {
    const user = await this.findUserById(userId);
    if (!user) return null;

    const { rows } = await this.pool.query(
      `
        SELECT current_story_point_index, collected_fragments_json, updated_at
        FROM progress
        WHERE user_id = $1
        LIMIT 1
      `,
      [userId]
    );

    if (!rows[0]) {
      const createdAt = pgDate();
      await this.pool.query(
        `
          INSERT INTO progress (user_id, current_story_point_index, collected_fragments_json, updated_at)
          VALUES ($1, 0, $2::jsonb, $3)
        `,
        [userId, '[]', createdAt]
      );

      return {
        userId: user.id,
        userName: user.display_name,
        currentStoryPointIndex: 0,
        collectedFragments: [],
        updatedAt: createdAt.toISOString(),
      };
    }

    return {
      userId: user.id,
      userName: user.display_name,
      currentStoryPointIndex: Number(rows[0].current_story_point_index ?? 0),
      collectedFragments: parseFragments(rows[0].collected_fragments_json),
      updatedAt: new Date(rows[0].updated_at).toISOString(),
    };
  }

  async completeCheckpoint({ userId, checkpointId, fragment, maxStoryPointIndex }) {
    const user = await this.findUserById(userId);
    if (!user) return null;

    const current = await this.getProgress(userId);
    const exists = current.collectedFragments.some((item) => item.id === fragment.id);
    const checkpointIndex = Math.max(0, maxStoryPointIndex.indexOf(checkpointId));
    const nextProgress = {
      userId: user.id,
      userName: user.display_name,
      currentStoryPointIndex: Math.min(
        Math.max(current.currentStoryPointIndex, checkpointIndex + 1),
        maxStoryPointIndex.length - 1
      ),
      collectedFragments: exists ? current.collectedFragments : [...current.collectedFragments, fragment],
      updatedAt: nowIso(),
    };

    await this.pool.query(
      `
        INSERT INTO progress (user_id, current_story_point_index, collected_fragments_json, updated_at)
        VALUES ($1, $2, $3::jsonb, $4)
        ON CONFLICT (user_id) DO UPDATE SET
          current_story_point_index = EXCLUDED.current_story_point_index,
          collected_fragments_json = EXCLUDED.collected_fragments_json,
          updated_at = EXCLUDED.updated_at
      `,
      [
        userId,
        nextProgress.currentStoryPointIndex,
        JSON.stringify(nextProgress.collectedFragments),
        pgDate(new Date(nextProgress.updatedAt)),
      ]
    );

    return nextProgress;
  }

  async listPhotos(storyPointId, currentUserId = '') {
    const params = [];
    let bookmarkProjection = 'false AS is_bookmarked';
    let bookmarkJoin = '';
    let whereClause = '';

    if (currentUserId) {
      params.push(currentUserId);
      bookmarkProjection = 'CASE WHEN pb.user_id IS NULL THEN false ELSE true END AS is_bookmarked';
      bookmarkJoin = 'LEFT JOIN photo_bookmarks pb ON pb.photo_id = photos.id AND pb.user_id = $1';
    }

    if (storyPointId !== 'all') {
      params.push(storyPointId);
      whereClause = `WHERE photos.story_point_id = $${params.length}`;
    }

    const { rows } = await this.pool.query(
      `
        SELECT photos.*, ${bookmarkProjection}
        FROM photos
        ${bookmarkJoin}
        ${whereClause}
        ORDER BY photos.created_at DESC
      `,
      params
    );

    return rows.map(photoRowToResponse);
  }

  async createPhoto(photo) {
    await this.pool.query(
      `
        INSERT INTO photos (
          id, user_id, user_name, caption, image_url, thumbnail_url,
          story_point_id, story_point_title, likes, created_at,
          width, height, original_size_bytes, optimized_size_bytes, upload_kind, moderation_status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      `,
      [
        photo.id,
        photo.userId,
        photo.userName,
        photo.caption,
        photo.imageUrl,
        photo.thumbnailUrl,
        photo.storyPointId,
        photo.storyPointTitle,
        photo.likes,
        pgDate(new Date(photo.createdAt)),
        photo.width ?? null,
        photo.height ?? null,
        photo.originalSizeBytes ?? null,
        photo.optimizedSizeBytes ?? null,
        photo.uploadKind ?? 'optimized',
        photo.moderationStatus ?? 'approved',
      ]
    );

    return photo;
  }

  async incrementPhotoLikes(photoId) {
    const { rows } = await this.pool.query(
      `
        UPDATE photos
        SET likes = likes + 1
        WHERE id = $1
        RETURNING *
      `,
      [photoId]
    );
    return rows[0] ? photoRowToResponse(rows[0]) : null;
  }

  async togglePhotoBookmark(userId, photoId) {
    const existing = await this.pool.query(
      'SELECT photo_id FROM photo_bookmarks WHERE user_id = $1 AND photo_id = $2 LIMIT 1',
      [userId, photoId]
    );

    if (existing.rows[0]) {
      await this.pool.query('DELETE FROM photo_bookmarks WHERE user_id = $1 AND photo_id = $2', [userId, photoId]);
    } else {
      await this.pool.query(
        `
          INSERT INTO photo_bookmarks (user_id, photo_id, created_at)
          VALUES ($1, $2, $3)
          ON CONFLICT (user_id, photo_id) DO NOTHING
        `,
        [userId, photoId, pgDate()]
      );
    }

    const { rows } = await this.pool.query(
      `
        SELECT photos.*, CASE WHEN pb.user_id IS NULL THEN false ELSE true END AS is_bookmarked
        FROM photos
        LEFT JOIN photo_bookmarks pb ON pb.photo_id = photos.id AND pb.user_id = $1
        WHERE photos.id = $2
        LIMIT 1
      `,
      [userId, photoId]
    );
    return rows[0] ? photoRowToResponse(rows[0]) : null;
  }

  async listBookmarkedPhotos(userId) {
    const { rows } = await this.pool.query(
      `
        SELECT photos.*, true AS is_bookmarked
        FROM photo_bookmarks
        JOIN photos ON photos.id = photo_bookmarks.photo_id
        WHERE photo_bookmarks.user_id = $1
        ORDER BY photo_bookmarks.created_at DESC
      `,
      [userId]
    );

    return rows.map(photoRowToResponse);
  }

  async buildLeaderboard(currentUserId) {
    const { rows } = await this.pool.query(
      `
        SELECT user_id, user_name, SUM(likes)::int AS total_likes
        FROM photos
        GROUP BY user_id, user_name
        ORDER BY total_likes DESC, user_name ASC
      `
    );

    const entries = [];
    for (const row of rows) {
      const photos = await this.pool.query(
        `
          SELECT image_url, thumbnail_url
          FROM photos
          WHERE user_id = $1
          ORDER BY created_at DESC
          LIMIT 4
        `,
        [row.user_id]
      );

      entries.push({
        id: row.user_id,
        user: row.user_name,
        totalLikes: Number(row.total_likes ?? 0),
        photos: photos.rows.map((photo) => ({
          imageUrl: photo.image_url,
          thumbnailUrl: photo.thumbnail_url || photo.image_url,
        })),
        reward: REWARD_BY_RANK[entries.length],
        isCurrentUser: row.user_id === currentUserId,
        rank: entries.length + 1,
      });
    }

    return entries;
  }

  async getHealthStats() {
    const users = await this.pool.query('SELECT COUNT(*)::int AS count FROM users');
    const sessions = await this.pool.query('SELECT COUNT(*)::int AS count FROM sessions');
    const photos = await this.pool.query('SELECT COUNT(*)::int AS count FROM photos');
    const progress = await this.pool.query('SELECT COUNT(*)::int AS count FROM progress');

    return {
      users: users.rows[0].count,
      sessions: sessions.rows[0].count,
      photos: photos.rows[0].count,
      progressRecords: progress.rows[0].count,
      database: 'postgres',
    };
  }

  async close() {
    await this.pool.end();
  }
}
