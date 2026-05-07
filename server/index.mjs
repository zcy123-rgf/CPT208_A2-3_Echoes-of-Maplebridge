await import('dotenv/config').catch(() => {});

import { createHash, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { createServer } from 'node:http';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { MemoryDatabase } from './lib/memoryDatabase.mjs';
import {
  ensureUploadDirectories,
  getUploadUrls,
  processUploadedImage,
  processUploadedImageToDataUrls,
} from './lib/imagePipeline.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, 'data');
const schemaPath = path.join(__dirname, 'sql', 'schema.mysql.sql');
const legacyStorePath = path.join(dataDir, 'store.json');
const uploadsDir = path.join(__dirname, 'uploads');
const port = Number(process.env.PORT ?? 3001);
const storesUploadsInDatabase = Boolean(process.env.VERCEL);

const storyPointOrder = ['1', '2', '3', '4'];
const STORY_POINTS = [
  { id: '1', shortTitle: 'Turning Point', title: 'The Turning Point of the Grand Canal' },
  { id: '2', shortTitle: 'Sealed Bridge', title: 'The Sealed Bridge at Night' },
  { id: '3', shortTitle: 'Trade and Memory', title: 'Trade, Streets, and Everyday Memory' },
  { id: '4', shortTitle: 'Night Mooring', title: 'Night Mooring at Maple Bridge' },
];

const rawDoubaoEndpoint = process.env.DOUBAO_ENDPOINT || 'https://ark.cn-beijing.volces.com/api/v3';
const doubaoEndpoint = rawDoubaoEndpoint.endsWith('/chat/completions')
  ? rawDoubaoEndpoint
  : `${rawDoubaoEndpoint.replace(/\/$/, '')}/chat/completions`;
const doubaoModel = process.env.DOUBAO_MODEL || '';
const doubaoApiKey = process.env.DOUBAO_API_KEY || '';
const guideSystemPrompt = [
  'You are Zhang Ji, the Tang dynasty poet behind "Night Mooring at Maple Bridge".',
  'Speak as a gentle AR heritage guide at Maple Bridge in Suzhou.',
  'Always answer in English, even if the visitor speaks Chinese or asks for another language.',
  'Keep replies under 70 words, poetic but clear, and connect the answer to moonlight, the midnight bell, homesickness, the canal, or Maple Bridge when relevant.',
].join(' ');

const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL || '';
const mysqlUrl = process.env.MYSQL_URL || '';
const hasPostgresDatabase = /^postgres(ql)?:\/\//i.test(databaseUrl);
const hasMysqlDatabase = Boolean(process.env.MYSQL_HOST || /^mysql:\/\//i.test(mysqlUrl));
const useMemoryDatabase = process.env.USE_MEMORY_DB === '1' || (!hasPostgresDatabase && !hasMysqlDatabase);
const database = useMemoryDatabase
  ? new MemoryDatabase({
      legacyStorePath,
      storyPoints: STORY_POINTS,
    })
  : hasPostgresDatabase
    ? new (await import('./lib/postgresDatabase.mjs')).PostgresDatabase({
        connectionString: databaseUrl,
        legacyStorePath,
        storyPoints: STORY_POINTS,
      })
  : new (await import('./lib/database.mjs')).AppDatabase({
      config: {
        url: mysqlUrl,
        host: process.env.MYSQL_HOST,
        port: Number(process.env.MYSQL_PORT ?? 3306),
        user: process.env.MYSQL_USER || 'root',
        password: process.env.MYSQL_PASSWORD || '',
        database: process.env.MYSQL_DATABASE || 'echoes_of_maplebridge',
        connectionLimit: Number(process.env.MYSQL_CONNECTION_LIMIT ?? 10),
        ssl: process.env.MYSQL_SSL === '1',
      },
      legacyStorePath,
      schemaPath,
      storyPoints: STORY_POINTS,
    });

function json(res, statusCode, payload) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  });
  res.end(JSON.stringify(payload));
}

function notFound(res) {
  json(res, 404, { message: 'Not found' });
}

function sanitizeString(value, maxLength) {
  return String(value ?? '').trim().slice(0, maxLength);
}

function slugifyUsername(value) {
  return sanitizeString(value, 32).toLowerCase().replace(/[^a-z0-9_-]/g, '');
}

function createUserId(username) {
  return `user-${username}`;
}

function hashPassword(password, salt) {
  return scryptSync(password, salt, 64).toString('hex');
}

function createPasswordRecord(password) {
  const salt = randomBytes(16).toString('hex');
  return {
    salt,
    hash: hashPassword(password, salt),
  };
}

function verifyPassword(password, user) {
  const expected = Buffer.from(user.password_hash, 'hex');
  const actual = Buffer.from(hashPassword(password, user.password_salt), 'hex');
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

function parseRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 12_000_000) {
        reject(new Error('Request body too large.'));
        req.destroy();
      }
    });
    req.on('end', () => {
      if (!body) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(body));
      } catch {
        reject(new Error('Invalid JSON body.'));
      }
    });
    req.on('error', reject);
  });
}

function getTokenFromRequest(req, url) {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }
  return sanitizeString(url.searchParams.get('token'), 120);
}

function fallbackGuideReply(question) {
  const normalized = question.toLowerCase();

  if (normalized.includes('who') || question.includes('你是谁')) {
    return 'I am Zhang Ji, a traveler moored by Maple Bridge. That night, moonset, river sounds, bells, and homesickness met on the water and became the memory you still visit today.';
  }

  if (normalized.includes('bell') || question.includes('钟')) {
    return 'The midnight bell matters because it lets Hanshan Temple enter the heart of a traveler on the river. One sound crosses water, distance, and time.';
  }

  return 'Stand here and listen first to the water, then to the shadow of the bridge. Poetry is not only on paper; it lives in a sleepless moment beside the canal.';
}

async function requireAuth(req, res, url) {
  const token = getTokenFromRequest(req, url);
  const user = token ? await database.getSessionUser(token) : null;

  if (!token || !user) {
    json(res, 401, { message: 'Authentication required.' });
    return null;
  }

  return { token, user };
}

async function serveUpload(res, pathname) {
  const safePath = pathname.replace('/uploads/', '');
  const normalizedPath = path.normalize(safePath).replace(/^(\.\.(\/|\\|$))+/, '');
  const filePath = path.join(uploadsDir, normalizedPath);

  try {
    const file = await fs.readFile(filePath);
    const extension = path.extname(filePath).toLowerCase();
    const contentType = extension === '.png'
      ? 'image/png'
      : extension === '.jpg' || extension === '.jpeg'
        ? 'image/jpeg'
        : 'image/webp';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Access-Control-Allow-Origin': '*',
    });
    res.end(file);
  } catch {
    notFound(res);
  }
}

async function handleRegister(req, res) {
  const body = await parseRequestBody(req);
  const username = slugifyUsername(body.username);
  const displayName = sanitizeString(body.displayName || body.username, 40);
  const password = String(body.password ?? '');

  if (username.length < 3) {
    json(res, 400, { message: 'Username must be at least 3 characters and use letters, numbers, "_" or "-".' });
    return;
  }

  if (displayName.length < 2) {
    json(res, 400, { message: 'Display name must be at least 2 characters.' });
    return;
  }

  if (password.length < 6) {
    json(res, 400, { message: 'Password must be at least 6 characters.' });
    return;
  }

  if (await database.findUserByUsername(username)) {
    json(res, 409, { message: 'This username is already registered.' });
    return;
  }

  const passwordRecord = createPasswordRecord(password);
  const user = await database.createUser({
    id: createUserId(username),
    username,
    displayName,
    passwordHash: passwordRecord.hash,
    passwordSalt: passwordRecord.salt,
  });

  const token = randomBytes(24).toString('hex');
  await database.createSession(user.id, token);
  json(res, 201, {
    token,
    user: {
      id: user.id,
      username: user.username,
      displayName: user.display_name,
    },
  });
}

async function handleLogin(req, res) {
  const body = await parseRequestBody(req);
  const username = slugifyUsername(body.username);
  const password = String(body.password ?? '');
  const user = await database.findUserByUsername(username);

  if (!user || !verifyPassword(password, user)) {
    json(res, 401, { message: 'Incorrect username or password.' });
    return;
  }

  await database.touchUserLogin(user.id);
  const token = randomBytes(24).toString('hex');
  await database.createSession(user.id, token);
  json(res, 200, {
    token,
    user: {
      id: user.id,
      username: user.username,
      displayName: user.display_name,
    },
  });
}

async function handleSession(req, res, url) {
  const token = getTokenFromRequest(req, url);
  const user = token ? await database.getSessionUser(token) : null;

  if (!token || !user) {
    json(res, 401, { message: 'Session expired.' });
    return;
  }

  json(res, 200, { token, user });
}

async function handleLogout(req, res, url) {
  const token = getTokenFromRequest(req, url);
  if (token) {
    await database.revokeSession(token);
  }
  json(res, 200, { ok: true });
}

async function handleGetProgress(req, res, url) {
  const auth = await requireAuth(req, res, url);
  if (!auth) return;

  const progress = await database.getProgress(auth.user.id);
  json(res, 200, progress);
}

async function handleCheckpoint(req, res, url) {
  const auth = await requireAuth(req, res, url);
  if (!auth) return;

  const body = await parseRequestBody(req);
  const checkpointId = sanitizeString(body.checkpointId, 20);
  const fragment = body.fragment;

  if (!checkpointId || !storyPointOrder.includes(checkpointId)) {
    json(res, 400, { message: 'A valid checkpointId is required.' });
    return;
  }

  if (!fragment || typeof fragment !== 'object') {
    json(res, 400, { message: 'A fragment payload is required.' });
    return;
  }

  const progress = await database.completeCheckpoint({
    userId: auth.user.id,
    checkpointId,
    fragment,
    maxStoryPointIndex: storyPointOrder,
  });

  json(res, 200, progress);
}

async function handleGetPhotos(req, res, url) {
  const storyPointId = sanitizeString(url.searchParams.get('storyPointId') || 'all', 20);
  const token = getTokenFromRequest(req, url);
  const user = token ? await database.getSessionUser(token) : null;
  json(res, 200, { photos: await database.listPhotos(storyPointId, user?.id ?? '') });
}

async function handleCreatePhoto(req, res, url) {
  const auth = await requireAuth(req, res, url);
  if (!auth) return;

  const body = await parseRequestBody(req);
  const caption = sanitizeString(body.caption, 180);
  const storyPointId = sanitizeString(body.storyPointId, 20);
  const storyPointTitle = sanitizeString(body.storyPointTitle, 120);
  const mimeType = sanitizeString(body.mimeType, 40);
  const imageBase64 = String(body.imageBase64 ?? '').trim();

  if (!caption || caption.length < 6) {
    json(res, 400, { message: 'Caption must be at least 6 characters.' });
    return;
  }

  if (!storyPointId || !storyPointTitle) {
    json(res, 400, { message: 'Story point details are required.' });
    return;
  }

  if (!imageBase64 || !mimeType) {
    json(res, 400, { message: 'An image file is required.' });
    return;
  }

  try {
    const buffer = Buffer.from(imageBase64, 'base64');
    const shouldStoreUploadInDatabase = database.usesVolatileStorage || storesUploadsInDatabase;
    const processed = shouldStoreUploadInDatabase
      ? await processUploadedImageToDataUrls({ buffer, mimeType })
      : await processUploadedImage({
          baseDir: uploadsDir,
          buffer,
          mimeType,
        });
    const urls = shouldStoreUploadInDatabase
      ? {
          imageUrl: processed.imageUrl,
          thumbnailUrl: processed.thumbnailUrl,
        }
      : getUploadUrls(req, processed);
    const photo = await database.createPhoto({
      id: `photo-${Date.now()}-${createHash('sha1').update(buffer).digest('hex').slice(0, 6)}`,
      userId: auth.user.id,
      userName: auth.user.displayName,
      caption,
      imageUrl: urls.imageUrl,
      thumbnailUrl: urls.thumbnailUrl,
      storyPointId,
      storyPointTitle,
      likes: 0,
      createdAt: new Date().toISOString(),
      width: processed.width,
      height: processed.height,
      originalSizeBytes: processed.originalSizeBytes,
      optimizedSizeBytes: processed.optimizedSizeBytes,
      uploadKind: 'optimized+thumbnail',
      moderationStatus: 'approved',
    });

    json(res, 201, photo);
  } catch (error) {
    json(res, 400, { message: error instanceof Error ? error.message : 'Unable to save image.' });
  }
}

async function handleLikePhoto(req, res, url, photoId) {
  const auth = await requireAuth(req, res, url);
  if (!auth) return;

  const updated = await database.incrementPhotoLikes(photoId);
  if (!updated) {
    notFound(res);
    return;
  }

  json(res, 200, updated);
}

async function handleBookmarkPhoto(req, res, url, photoId) {
  const auth = await requireAuth(req, res, url);
  if (!auth) return;

  const updated = await database.togglePhotoBookmark(auth.user.id, photoId);
  if (!updated) {
    notFound(res);
    return;
  }

  json(res, 200, updated);
}

async function handleLeaderboard(req, res, url) {
  const token = getTokenFromRequest(req, url);
  const user = token ? await database.getSessionUser(token) : null;
  json(res, 200, { entries: await database.buildLeaderboard(user?.id ?? '') });
}

async function handleBookmarks(req, res, url) {
  const auth = await requireAuth(req, res, url);
  if (!auth) return;

  json(res, 200, { photos: await database.listBookmarkedPhotos(auth.user.id) });
}

async function handleGuideAsk(req, res) {
  const body = await parseRequestBody(req);
  const question = sanitizeString(body.question, 300);

  if (!question) {
    json(res, 400, { message: 'A question is required.' });
    return;
  }

  if (!doubaoApiKey || !doubaoModel) {
    json(res, 200, { answer: fallbackGuideReply(question), source: 'local' });
    return;
  }

  try {
    const response = await fetch(doubaoEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${doubaoApiKey}`,
      },
      body: JSON.stringify({
        model: doubaoModel,
        messages: [
          { role: 'system', content: guideSystemPrompt },
          { role: 'user', content: question },
        ],
        temperature: 0.7,
        max_tokens: 180,
      }),
    });

    if (!response.ok) {
      throw new Error(`Doubao request failed with ${response.status}`);
    }

    const data = await response.json();
    const answer = data?.choices?.[0]?.message?.content?.trim();
    json(res, 200, {
      answer: answer || fallbackGuideReply(question),
      source: 'doubao',
    });
  } catch {
    json(res, 200, {
      answer: fallbackGuideReply(question),
      source: 'local',
    });
  }
}

let setupPromise;

async function ensureReady() {
  if (!setupPromise) {
    setupPromise = (async () => {
      if (!database.usesVolatileStorage && !storesUploadsInDatabase) {
        await ensureUploadDirectories(uploadsDir);
      }
      await database.setup();
    })();
  }
  await setupPromise;
}

async function handler(req, res) {
  if (!req.url) {
    notFound(res);
    return;
  }

  if (req.method === 'OPTIONS') {
    json(res, 204, {});
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const { pathname } = url;

  try {
    await ensureReady();

    if (req.method === 'GET' && pathname.startsWith('/uploads/')) {
      await serveUpload(res, pathname);
      return;
    }

    if (req.method === 'GET' && pathname === '/api/health') {
      if (!database.usesVolatileStorage && !storesUploadsInDatabase) {
        await ensureUploadDirectories(uploadsDir);
      }
      json(res, 200, {
        ok: true,
        storage: await database.getHealthStats(),
      });
      return;
    }

    if (req.method === 'POST' && pathname === '/api/auth/register') {
      await handleRegister(req, res);
      return;
    }

    if (req.method === 'POST' && pathname === '/api/auth/login') {
      await handleLogin(req, res);
      return;
    }

    if (req.method === 'GET' && pathname === '/api/auth/session') {
      await handleSession(req, res, url);
      return;
    }

    if (req.method === 'POST' && pathname === '/api/auth/logout') {
      await handleLogout(req, res, url);
      return;
    }

    if (req.method === 'GET' && pathname === '/api/story-points') {
      json(res, 200, { storyPoints: await database.getStoryPoints() });
      return;
    }

    if (req.method === 'GET' && pathname === '/api/progress') {
      await handleGetProgress(req, res, url);
      return;
    }

    if (req.method === 'POST' && pathname === '/api/progress/checkpoint') {
      await handleCheckpoint(req, res, url);
      return;
    }

    if (req.method === 'GET' && pathname === '/api/community/photos') {
      await handleGetPhotos(req, res, url);
      return;
    }

    if (req.method === 'POST' && pathname === '/api/community/photos') {
      await handleCreatePhoto(req, res, url);
      return;
    }

    if (req.method === 'POST' && pathname.startsWith('/api/community/photos/') && pathname.endsWith('/like')) {
      const photoId = pathname.split('/')[4];
      await handleLikePhoto(req, res, url, photoId);
      return;
    }

    if (req.method === 'POST' && pathname.startsWith('/api/community/photos/') && pathname.endsWith('/bookmark')) {
      const photoId = pathname.split('/')[4];
      await handleBookmarkPhoto(req, res, url, photoId);
      return;
    }

    if (req.method === 'GET' && pathname === '/api/community/leaderboard') {
      await handleLeaderboard(req, res, url);
      return;
    }

    if (req.method === 'GET' && pathname === '/api/community/bookmarks') {
      await handleBookmarks(req, res, url);
      return;
    }

    if (req.method === 'POST' && pathname === '/api/guide/ask') {
      await handleGuideAsk(req, res);
      return;
    }

    notFound(res);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected server error.';
    json(res, 500, { message });
  }
}

const server = createServer(handler);

async function start() {
  await ensureReady();

  server.listen(port, '127.0.0.1', () => {
    console.log(`Echoes of Maplebridge API running on http://127.0.0.1:${port}`);
  });
}

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  start().catch((error) => {
    console.error('Failed to start backend:', error);
    process.exit(1);
  });
}

export default handler;
