import { createHash } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_UPLOAD_SIZE_BYTES = 8 * 1024 * 1024;

export async function ensureUploadDirectories(baseDir) {
  await fs.mkdir(path.join(baseDir, 'images'), { recursive: true });
  await fs.mkdir(path.join(baseDir, 'thumbnails'), { recursive: true });
}

export function getUploadUrls(req, fileNames) {
  const host = req.headers.host || '127.0.0.1:3001';
  return {
    imageUrl: `http://${host}/uploads/images/${fileNames.optimizedFileName}`,
    thumbnailUrl: `http://${host}/uploads/thumbnails/${fileNames.thumbnailFileName}`,
  };
}

export async function processUploadedImage({ baseDir, buffer, mimeType }) {
  if (!ALLOWED_MIME_TYPES.has(mimeType)) {
    throw new Error('Only JPG, PNG, and WEBP images are supported.');
  }

  if (!buffer.length) {
    throw new Error('Uploaded image is empty.');
  }

  if (buffer.length > MAX_UPLOAD_SIZE_BYTES) {
    throw new Error('Uploaded image must be smaller than 8MB.');
  }

  await ensureUploadDirectories(baseDir);

  const digest = createHash('sha1').update(buffer).digest('hex').slice(0, 12);
  const baseName = `${Date.now()}-${digest}`;
  const optimizedFileName = `${baseName}.webp`;
  const thumbnailFileName = `${baseName}-thumb.webp`;

  const image = sharp(buffer, { failOn: 'none' }).rotate();
  const metadata = await image.metadata();
  const width = metadata.width ?? null;
  const height = metadata.height ?? null;

  const optimizedBuffer = await image
    .clone()
    .resize({
      width: 1600,
      height: 1600,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({ quality: 82, effort: 4 })
    .toBuffer();

  const thumbnailBuffer = await image
    .clone()
    .resize({
      width: 480,
      height: 480,
      fit: 'cover',
      position: 'attention',
    })
    .webp({ quality: 72, effort: 4 })
    .toBuffer();

  await fs.writeFile(path.join(baseDir, 'images', optimizedFileName), optimizedBuffer);
  await fs.writeFile(path.join(baseDir, 'thumbnails', thumbnailFileName), thumbnailBuffer);

  return {
    optimizedFileName,
    thumbnailFileName,
    width,
    height,
    originalSizeBytes: buffer.length,
    optimizedSizeBytes: optimizedBuffer.length,
  };
}

export async function processUploadedImageToDataUrls({ buffer, mimeType }) {
  if (!ALLOWED_MIME_TYPES.has(mimeType)) {
    throw new Error('Only JPG, PNG, and WEBP images are supported.');
  }

  if (!buffer.length) {
    throw new Error('Uploaded image is empty.');
  }

  if (buffer.length > MAX_UPLOAD_SIZE_BYTES) {
    throw new Error('Uploaded image must be smaller than 8MB.');
  }

  const image = sharp(buffer, { failOn: 'none' }).rotate();
  const metadata = await image.metadata();
  const width = metadata.width ?? null;
  const height = metadata.height ?? null;

  const optimizedBuffer = await image
    .clone()
    .resize({
      width: 1200,
      height: 1200,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({ quality: 76, effort: 4 })
    .toBuffer();

  const thumbnailBuffer = await image
    .clone()
    .resize({
      width: 420,
      height: 420,
      fit: 'cover',
      position: 'attention',
    })
    .webp({ quality: 70, effort: 4 })
    .toBuffer();

  return {
    imageUrl: `data:image/webp;base64,${optimizedBuffer.toString('base64')}`,
    thumbnailUrl: `data:image/webp;base64,${thumbnailBuffer.toString('base64')}`,
    width,
    height,
    originalSizeBytes: buffer.length,
    optimizedSizeBytes: optimizedBuffer.length,
  };
}
