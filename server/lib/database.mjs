import { readFileSync } from 'node:fs';
import mysql from 'mysql2/promise';

const DEFAULT_SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30;
const REWARD_BY_RANK = ['Suzhou sachet', 'Suzhou fan', 'Suzhou hairpin'];

function nowIso() {
  return new Date().toISOString();
}

function mysqlDateTime(date = new Date()) {
  return date.toISOString().slice(0, 23).replace('T', ' ');
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
    likes: row.likes,
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

export class AppDatabase {
  constructor({ config, legacyStorePath, schemaPath, storyPoints, sessionTtlMs = DEFAULT_SESSION_TTL_MS }) {
    this.pool = mysql.createPool(config.url || {
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      database: config.database,
      connectionLimit: config.connectionLimit,
      waitForConnections: true,
      namedPlaceholders: false,
      charset: 'utf8mb4',
      ssl: config.ssl ? { rejectUnauthorized: true } : undefined,
    });
    this.legacyStorePath = legacyStorePath;
    this.schemaPath = schemaPath;
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
    const sql = readFileSync(this.schemaPath, 'utf8');
    const connection = await this.pool.getConnection();
    try {
      const statements = sql
        .split(/;\s*\n/)
        .map((statement) => statement.trim())
        .filter(Boolean)
        .filter((statement) => !/^(CREATE\s+DATABASE|USE)\b/i.test(statement));

      for (const statement of statements) {
        await connection.query(statement);
      }
    } finally {
      connection.release();
    }
  }

  async seedStoryPoints() {
    const [rows] = await this.pool.query('SELECT COUNT(*) AS count FROM story_points');
    if (rows[0].count > 0) {
      return;
    }

    await this.pool.query(
      'INSERT INTO story_points (id, short_title, title) VALUES ?',
      [this.storyPoints.map((point) => [point.id, point.shortTitle, point.title])]
    );
  }

  async migrateLegacyJsonIfNeeded() {
    const [[usersRow]] = await this.pool.query('SELECT COUNT(*) AS count FROM users');
    const [[photosRow]] = await this.pool.query('SELECT COUNT(*) AS count FROM photos');

    if (usersRow.count > 0 || photosRow.count > 0) {
      return;
    }

    try {
      const legacy = JSON.parse(readFileSync(this.legacyStorePath, 'utf8'));
      const connection = await this.pool.getConnection();
      try {
        await connection.beginTransaction();

        const ensureLegacyUser = async (userId, userName) => {
          if (!userId) return;
          await connection.query(
            `
              INSERT IGNORE INTO users (
                id, username, display_name, password_hash, password_salt, created_at
              ) VALUES (?, ?, ?, ?, ?, ?)
            `,
            [
              userId,
              `legacy-${slugifyLegacyValue(userId)}`,
              userName || userId,
              '00'.repeat(64),
              '00'.repeat(16),
              mysqlDateTime(),
            ]
          );
        };

        if (Array.isArray(legacy.photos)) {
          for (const photo of legacy.photos) {
            await ensureLegacyUser(photo.userId, photo.userName);
            await connection.query(
              `
                INSERT INTO photos (
                  id, user_id, user_name, caption, image_url, thumbnail_url,
                  story_point_id, story_point_title, likes, created_at,
                  width, height, original_size_bytes, optimized_size_bytes,
                  upload_kind, moderation_status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
                mysqlDateTime(new Date(photo.createdAt ?? nowIso())),
                photo.width ?? null,
                photo.height ?? null,
                photo.originalSizeBytes ?? null,
                photo.optimizedSizeBytes ?? null,
                'legacy',
                'approved',
              ]
            );
          }
        }

        if (legacy.progress && typeof legacy.progress === 'object') {
          for (const value of Object.values(legacy.progress)) {
            if (!value?.userId) continue;
            await ensureLegacyUser(value.userId, value.userName);
            await connection.query(
              `
                INSERT INTO progress (
                  user_id, current_story_point_index, collected_fragments_json, updated_at
                ) VALUES (?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                  current_story_point_index = VALUES(current_story_point_index),
                  collected_fragments_json = VALUES(collected_fragments_json),
                  updated_at = VALUES(updated_at)
              `,
              [
                value.userId,
                Number(value.currentStoryPointIndex ?? 0),
                JSON.stringify(Array.isArray(value.collectedFragments) ? value.collectedFragments : []),
                mysqlDateTime(new Date(value.updatedAt ?? nowIso())),
              ]
            );
          }
        }

        await connection.commit();
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    } catch {
      // Keep MySQL empty if legacy JSON is missing or invalid.
    }
  }

  async cleanupExpiredSessions() {
    await this.pool.query('DELETE FROM sessions WHERE expires_at <= ?', [mysqlDateTime()]);
  }

  async getStoryPoints() {
    const [rows] = await this.pool.query(
      `
        SELECT id, short_title AS shortTitle, title
        FROM story_points
        ORDER BY CAST(id AS UNSIGNED)
      `
    );
    return rows;
  }

  async createUser({ id, username, displayName, passwordHash, passwordSalt }) {
    const connection = await this.pool.getConnection();
    const createdAt = mysqlDateTime();
    try {
      await connection.beginTransaction();
      await connection.query(
        `
          INSERT INTO users (id, username, display_name, password_hash, password_salt, created_at)
          VALUES (?, ?, ?, ?, ?, ?)
        `,
        [id, username, displayName, passwordHash, passwordSalt, createdAt]
      );
      await connection.query(
        `
          INSERT INTO progress (user_id, current_story_point_index, collected_fragments_json, updated_at)
          VALUES (?, 0, ?, ?)
        `,
        [id, '[]', createdAt]
      );
      await connection.commit();
      return { id, username, display_name: displayName };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async findUserByUsername(username) {
    const [rows] = await this.pool.query('SELECT * FROM users WHERE username = ? LIMIT 1', [username]);
    return rows[0] ?? null;
  }

  async findUserById(userId) {
    const [rows] = await this.pool.query('SELECT * FROM users WHERE id = ? LIMIT 1', [userId]);
    return rows[0] ?? null;
  }

  async touchUserLogin(userId) {
    await this.pool.query('UPDATE users SET last_login_at = ? WHERE id = ?', [mysqlDateTime(), userId]);
  }

  async createSession(userId, token) {
    const createdAt = new Date();
    const expiresAt = new Date(createdAt.getTime() + this.sessionTtlMs);
    await this.pool.query(
      `
        INSERT INTO sessions (token, user_id, created_at, expires_at)
        VALUES (?, ?, ?, ?)
      `,
      [token, userId, mysqlDateTime(createdAt), mysqlDateTime(expiresAt)]
    );
  }

  async revokeSession(token) {
    await this.pool.query('DELETE FROM sessions WHERE token = ?', [token]);
  }

  async getSessionUser(token) {
    await this.cleanupExpiredSessions();
    const [rows] = await this.pool.query(
      `
        SELECT users.id, users.username, users.display_name
        FROM sessions
        JOIN users ON users.id = sessions.user_id
        WHERE sessions.token = ?
          AND sessions.expires_at > ?
        LIMIT 1
      `,
      [token, mysqlDateTime()]
    );
    return rows[0] ? publicUser(rows[0]) : null;
  }

  async getProgress(userId) {
    const user = await this.findUserById(userId);
    if (!user) return null;

    const [rows] = await this.pool.query(
      `
        SELECT current_story_point_index, collected_fragments_json, updated_at
        FROM progress
        WHERE user_id = ?
        LIMIT 1
      `,
      [userId]
    );

    if (!rows[0]) {
      const createdAt = mysqlDateTime();
      await this.pool.query(
        `
          INSERT INTO progress (user_id, current_story_point_index, collected_fragments_json, updated_at)
          VALUES (?, 0, ?, ?)
        `,
        [userId, '[]', createdAt]
      );

      return {
        userId: user.id,
        userName: user.display_name,
        currentStoryPointIndex: 0,
        collectedFragments: [],
        updatedAt: new Date(createdAt.replace(' ', 'T') + 'Z').toISOString(),
      };
    }

    return {
      userId: user.id,
      userName: user.display_name,
      currentStoryPointIndex: Number.isInteger(rows[0].current_story_point_index)
        ? rows[0].current_story_point_index
        : 0,
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
    const nextFragments = exists ? current.collectedFragments : [...current.collectedFragments, fragment];
    const nextProgress = {
      userId: user.id,
      userName: user.display_name,
      currentStoryPointIndex: Math.min(
        Math.max(current.currentStoryPointIndex, checkpointIndex + 1),
        maxStoryPointIndex.length - 1
      ),
      collectedFragments: nextFragments,
      updatedAt: nowIso(),
    };

    await this.pool.query(
      `
        INSERT INTO progress (user_id, current_story_point_index, collected_fragments_json, updated_at)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          current_story_point_index = VALUES(current_story_point_index),
          collected_fragments_json = VALUES(collected_fragments_json),
          updated_at = VALUES(updated_at)
      `,
      [
        userId,
        nextProgress.currentStoryPointIndex,
        JSON.stringify(nextProgress.collectedFragments),
        mysqlDateTime(new Date(nextProgress.updatedAt)),
      ]
    );

    return nextProgress;
  }

  async listPhotos(storyPointId, currentUserId = '') {
    const bookmarkProjection = currentUserId
      ? 'CASE WHEN pb.user_id IS NULL THEN 0 ELSE 1 END AS is_bookmarked'
      : '0 AS is_bookmarked';
    const bookmarkJoin = currentUserId
      ? 'LEFT JOIN photo_bookmarks pb ON pb.photo_id = photos.id AND pb.user_id = ?'
      : '';
    const params = currentUserId ? [currentUserId] : [];
    const whereClause = storyPointId === 'all' ? '' : 'WHERE photos.story_point_id = ?';
    const queryParams = storyPointId === 'all' ? params : [...params, storyPointId];
    const [rows] = await this.pool.query(
      `
        SELECT photos.*, ${bookmarkProjection}
        FROM photos
        ${bookmarkJoin}
        ${whereClause}
        ORDER BY photos.created_at DESC
      `,
      queryParams
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
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
        mysqlDateTime(new Date(photo.createdAt)),
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
    await this.pool.query('UPDATE photos SET likes = likes + 1 WHERE id = ?', [photoId]);
    const [rows] = await this.pool.query('SELECT * FROM photos WHERE id = ? LIMIT 1', [photoId]);
    return rows[0] ? photoRowToResponse(rows[0]) : null;
  }

  async togglePhotoBookmark(userId, photoId) {
    const [existingRows] = await this.pool.query(
      'SELECT photo_id FROM photo_bookmarks WHERE user_id = ? AND photo_id = ? LIMIT 1',
      [userId, photoId]
    );

    if (existingRows[0]) {
      await this.pool.query('DELETE FROM photo_bookmarks WHERE user_id = ? AND photo_id = ?', [userId, photoId]);
    } else {
      await this.pool.query(
        'INSERT INTO photo_bookmarks (user_id, photo_id, created_at) VALUES (?, ?, ?)',
        [userId, photoId, mysqlDateTime()]
      );
    }

    const [rows] = await this.pool.query(
      `
        SELECT photos.*, CASE WHEN pb.user_id IS NULL THEN 0 ELSE 1 END AS is_bookmarked
        FROM photos
        LEFT JOIN photo_bookmarks pb ON pb.photo_id = photos.id AND pb.user_id = ?
        WHERE photos.id = ?
        LIMIT 1
      `,
      [userId, photoId]
    );
    return rows[0] ? photoRowToResponse(rows[0]) : null;
  }

  async listBookmarkedPhotos(userId) {
    const [rows] = await this.pool.query(
      `
        SELECT photos.*, 1 AS is_bookmarked
        FROM photo_bookmarks
        JOIN photos ON photos.id = photo_bookmarks.photo_id
        WHERE photo_bookmarks.user_id = ?
        ORDER BY photo_bookmarks.created_at DESC
      `,
      [userId]
    );

    return rows.map(photoRowToResponse);
  }

  async buildLeaderboard(currentUserId) {
    const [rows] = await this.pool.query(
      `
        SELECT user_id, user_name, SUM(likes) AS total_likes
        FROM photos
        GROUP BY user_id, user_name
        ORDER BY total_likes DESC, user_name ASC
      `
    );

    const entries = [];
    for (const row of rows) {
      const [photos] = await this.pool.query(
        `
          SELECT image_url, thumbnail_url
          FROM photos
          WHERE user_id = ?
          ORDER BY created_at DESC
          LIMIT 4
        `,
        [row.user_id]
      );

      entries.push({
        id: row.user_id,
        user: row.user_name,
        totalLikes: Number(row.total_likes ?? 0),
        photos: photos.map((photo) => ({
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
    const [[usersRow]] = await this.pool.query('SELECT COUNT(*) AS count FROM users');
    const [[sessionsRow]] = await this.pool.query('SELECT COUNT(*) AS count FROM sessions');
    const [[photosRow]] = await this.pool.query('SELECT COUNT(*) AS count FROM photos');
    const [[progressRow]] = await this.pool.query('SELECT COUNT(*) AS count FROM progress');

    return {
      users: usersRow.count,
      sessions: sessionsRow.count,
      photos: photosRow.count,
      progressRecords: progressRow.count,
      database: 'mysql',
    };
  }

  async close() {
    await this.pool.end();
  }
}
