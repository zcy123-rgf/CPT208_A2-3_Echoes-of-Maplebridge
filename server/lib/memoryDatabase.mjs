import { readFileSync } from 'node:fs';

const DEFAULT_SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30;
const REWARD_BY_RANK = ['Suzhou sachet', 'Suzhou fan', 'Suzhou hairpin'];

function nowIso() {
  return new Date().toISOString();
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function publicUser(user) {
  return user
    ? {
        id: user.id,
        username: user.username,
        displayName: user.display_name,
      }
    : null;
}

function normalizePhoto(photo) {
  return {
    id: photo.id,
    userId: photo.userId ?? photo.user_id,
    userName: photo.userName ?? photo.user_name,
    caption: photo.caption,
    imageUrl: photo.imageUrl ?? photo.image_url,
    thumbnailUrl: photo.thumbnailUrl ?? photo.thumbnail_url ?? photo.imageUrl ?? photo.image_url,
    storyPointId: photo.storyPointId ?? photo.story_point_id,
    storyPointTitle: photo.storyPointTitle ?? photo.story_point_title,
    likes: Number(photo.likes ?? 0),
    createdAt: photo.createdAt ?? photo.created_at ?? nowIso(),
    width: photo.width ?? null,
    height: photo.height ?? null,
    originalSizeBytes: photo.originalSizeBytes ?? photo.original_size_bytes ?? null,
    optimizedSizeBytes: photo.optimizedSizeBytes ?? photo.optimized_size_bytes ?? null,
    uploadKind: photo.uploadKind ?? photo.upload_kind ?? null,
    moderationStatus: photo.moderationStatus ?? photo.moderation_status ?? 'approved',
    isBookmarked: Boolean(photo.isBookmarked ?? photo.is_bookmarked),
  };
}

export class MemoryDatabase {
  constructor({ legacyStorePath, storyPoints, sessionTtlMs = DEFAULT_SESSION_TTL_MS }) {
    this.legacyStorePath = legacyStorePath;
    this.storyPoints = storyPoints;
    this.sessionTtlMs = sessionTtlMs;
    this.usesVolatileStorage = true;
    this.ready = false;
  }

  async setup() {
    if (this.ready) return;

    let legacy = {};
    try {
      legacy = JSON.parse(readFileSync(this.legacyStorePath, 'utf8'));
    } catch {
      legacy = {};
    }

    this.storyPointRows = clone(legacy.storyPoints?.length ? legacy.storyPoints : this.storyPoints);
    this.users = new Map();
    this.sessions = new Map();
    this.progress = new Map();
    this.photos = Array.isArray(legacy.photos) ? legacy.photos.map(normalizePhoto) : [];
    this.bookmarks = new Set();

    for (const user of legacy.users ?? []) {
      this.users.set(user.id, {
        id: user.id,
        username: user.username,
        display_name: user.displayName ?? user.display_name,
        password_hash: user.passwordHash ?? user.password_hash,
        password_salt: user.passwordSalt ?? user.password_salt,
        created_at: user.createdAt ?? user.created_at ?? nowIso(),
        last_login_at: user.lastLoginAt ?? user.last_login_at ?? null,
      });
    }

    for (const [userId, value] of Object.entries(legacy.progress ?? {})) {
      this.progress.set(userId, {
        userId: value.userId ?? userId,
        userName: value.userName ?? userId,
        currentStoryPointIndex: Number(value.currentStoryPointIndex ?? 0),
        collectedFragments: Array.isArray(value.collectedFragments) ? value.collectedFragments : [],
        updatedAt: value.updatedAt ?? nowIso(),
      });
    }

    this.ready = true;
  }

  async cleanupExpiredSessions() {
    const now = Date.now();
    for (const [token, session] of this.sessions.entries()) {
      if (session.expiresAt <= now) {
        this.sessions.delete(token);
      }
    }
  }

  async getStoryPoints() {
    return clone(this.storyPointRows);
  }

  async createUser({ id, username, displayName, passwordHash, passwordSalt }) {
    const row = {
      id,
      username,
      display_name: displayName,
      password_hash: passwordHash,
      password_salt: passwordSalt,
      created_at: nowIso(),
      last_login_at: null,
    };
    this.users.set(id, row);
    this.progress.set(id, {
      userId: id,
      userName: displayName,
      currentStoryPointIndex: 0,
      collectedFragments: [],
      updatedAt: nowIso(),
    });
    return row;
  }

  async findUserByUsername(username) {
    return [...this.users.values()].find((user) => user.username === username) ?? null;
  }

  async findUserById(userId) {
    return this.users.get(userId) ?? null;
  }

  async touchUserLogin(userId) {
    const user = this.users.get(userId);
    if (user) user.last_login_at = nowIso();
  }

  async createSession(userId, token) {
    this.sessions.set(token, {
      userId,
      createdAt: Date.now(),
      expiresAt: Date.now() + this.sessionTtlMs,
    });
  }

  async revokeSession(token) {
    this.sessions.delete(token);
  }

  async getSessionUser(token) {
    await this.cleanupExpiredSessions();
    const session = this.sessions.get(token);
    return session ? publicUser(this.users.get(session.userId)) : null;
  }

  async getProgress(userId) {
    const user = await this.findUserById(userId);
    if (!user) return null;

    if (!this.progress.has(userId)) {
      this.progress.set(userId, {
        userId,
        userName: user.display_name,
        currentStoryPointIndex: 0,
        collectedFragments: [],
        updatedAt: nowIso(),
      });
    }

    return clone(this.progress.get(userId));
  }

  async completeCheckpoint({ userId, checkpointId, fragment, maxStoryPointIndex }) {
    const current = await this.getProgress(userId);
    if (!current) return null;

    const exists = current.collectedFragments.some((item) => item.id === fragment.id);
    const checkpointIndex = Math.max(0, maxStoryPointIndex.indexOf(checkpointId));
    const nextProgress = {
      ...current,
      currentStoryPointIndex: Math.min(
        Math.max(current.currentStoryPointIndex, checkpointIndex + 1),
        maxStoryPointIndex.length - 1
      ),
      collectedFragments: exists ? current.collectedFragments : [...current.collectedFragments, fragment],
      updatedAt: nowIso(),
    };

    this.progress.set(userId, nextProgress);
    return clone(nextProgress);
  }

  async listPhotos(storyPointId, currentUserId = '') {
    return this.photos
      .filter((photo) => storyPointId === 'all' || photo.storyPointId === storyPointId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .map((photo) => ({
        ...clone(photo),
        isBookmarked: currentUserId ? this.bookmarks.has(`${currentUserId}:${photo.id}`) : false,
      }));
  }

  async createPhoto(photo) {
    const normalized = normalizePhoto(photo);
    this.photos.unshift(normalized);
    return clone(normalized);
  }

  async incrementPhotoLikes(photoId) {
    const photo = this.photos.find((item) => item.id === photoId);
    if (!photo) return null;
    photo.likes += 1;
    return clone(photo);
  }

  async togglePhotoBookmark(userId, photoId) {
    const photo = this.photos.find((item) => item.id === photoId);
    if (!photo) return null;

    const key = `${userId}:${photoId}`;
    if (this.bookmarks.has(key)) {
      this.bookmarks.delete(key);
    } else {
      this.bookmarks.add(key);
    }

    return {
      ...clone(photo),
      isBookmarked: this.bookmarks.has(key),
    };
  }

  async listBookmarkedPhotos(userId) {
    return this.photos
      .filter((photo) => this.bookmarks.has(`${userId}:${photo.id}`))
      .map((photo) => ({
        ...clone(photo),
        isBookmarked: true,
      }));
  }

  async buildLeaderboard(currentUserId) {
    const totals = new Map();
    for (const photo of this.photos) {
      const entry = totals.get(photo.userId) ?? {
        id: photo.userId,
        user: photo.userName,
        totalLikes: 0,
        photos: [],
      };
      entry.totalLikes += Number(photo.likes ?? 0);
      if (entry.photos.length < 4) {
        entry.photos.push({
          imageUrl: photo.imageUrl,
          thumbnailUrl: photo.thumbnailUrl || photo.imageUrl,
        });
      }
      totals.set(photo.userId, entry);
    }

    return [...totals.values()]
      .sort((a, b) => b.totalLikes - a.totalLikes || a.user.localeCompare(b.user))
      .map((entry, index) => ({
        ...entry,
        reward: REWARD_BY_RANK[index],
        isCurrentUser: entry.id === currentUserId,
        rank: index + 1,
      }));
  }

  async getHealthStats() {
    return {
      users: this.users.size,
      sessions: this.sessions.size,
      photos: this.photos.length,
      progressRecords: this.progress.size,
      database: 'memory',
      persistence: 'volatile',
    };
  }

  async close() {}
}
