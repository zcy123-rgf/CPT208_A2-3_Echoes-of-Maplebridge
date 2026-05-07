import type { Fragment } from '../App';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.trim() || '/api';

export type AuthUser = {
  id: string;
  username: string;
  displayName: string;
};

export type ProgressResponse = {
  userId: string;
  userName: string;
  currentStoryPointIndex: number;
  collectedFragments: Fragment[];
  updatedAt: string;
};

export type CommunityPhoto = {
  id: string;
  userId: string;
  userName: string;
  caption: string;
  imageUrl: string;
  thumbnailUrl: string;
  storyPointId: string;
  storyPointTitle: string;
  likes: number;
  createdAt: string;
  width: number | null;
  height: number | null;
  originalSizeBytes: number | null;
  optimizedSizeBytes: number | null;
  isBookmarked?: boolean;
};

export type LeaderboardEntry = {
  id: string;
  user: string;
  totalLikes: number;
  photos: Array<{
    imageUrl: string;
    thumbnailUrl: string;
  }>;
  reward?: string;
  isCurrentUser: boolean;
  rank: number;
};

async function request<T>(path: string, init?: RequestInit & { token?: string }): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  let response: Response;

  try {
    response = await fetch(url, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(init?.token ? { Authorization: `Bearer ${init.token}` } : {}),
        ...(init?.headers ?? {}),
      },
    });
  } catch (error) {
    throw new Error(error instanceof Error ? `Network error for ${url}: ${error.message}` : `Network error for ${url}`);
  }

  const text = await response.text();
  let data: unknown = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    throw new Error(`Unexpected response from ${url}: ${response.status} ${text.slice(0, 80)}`);
  }

  if (!response.ok) {
    const message = data && typeof data === 'object' && 'message' in data
      ? String((data as { message?: unknown }).message)
      : `Request failed (${response.status}) for ${url}.`;
    throw new Error(message);
  }

  return data as T;
}

function fileToBase64(file: File) {
  return new Promise<{ base64: string; mimeType: string }>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result ?? '');
      const [, base64 = ''] = result.split(',');
      resolve({
        base64,
        mimeType: file.type || 'image/jpeg',
      });
    };
    reader.onerror = () => reject(new Error('Unable to read the selected image.'));
    reader.readAsDataURL(file);
  });
}

export function registerUser(payload: { username: string; displayName: string; password: string }) {
  return request<{ token: string; user: AuthUser }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function loginUser(payload: { username: string; password: string }) {
  return request<{ token: string; user: AuthUser }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function fetchSession(token: string) {
  return request<{ token: string; user: AuthUser }>('/auth/session', {
    method: 'GET',
    token,
  });
}

export function logoutUser(token: string) {
  return request<{ ok: boolean }>('/auth/logout', {
    method: 'POST',
    token,
  });
}

export function fetchProgress(token: string) {
  return request<ProgressResponse>('/progress', {
    token,
  });
}

export function completeCheckpoint(token: string, payload: { checkpointId: string; fragment: Fragment }) {
  return request<ProgressResponse>('/progress/checkpoint', {
    method: 'POST',
    token,
    body: JSON.stringify(payload),
  });
}

export async function fetchPhotos(storyPointId = 'all', token?: string) {
  const data = await request<{ photos: CommunityPhoto[] }>(
    `/community/photos?storyPointId=${encodeURIComponent(storyPointId)}`,
    { token }
  );
  return data.photos;
}

export async function createPhoto(token: string, payload: {
  caption: string;
  file: File;
  storyPointId: string;
  storyPointTitle: string;
}) {
  const encoded = await fileToBase64(payload.file);
  return request<CommunityPhoto>('/community/photos', {
    method: 'POST',
    token,
    body: JSON.stringify({
      caption: payload.caption,
      storyPointId: payload.storyPointId,
      storyPointTitle: payload.storyPointTitle,
      mimeType: encoded.mimeType,
      imageBase64: encoded.base64,
    }),
  });
}

export function likePhoto(token: string, photoId: string) {
  return request<CommunityPhoto>(`/community/photos/${encodeURIComponent(photoId)}/like`, {
    method: 'POST',
    token,
  });
}

export function bookmarkPhoto(token: string, photoId: string) {
  return request<CommunityPhoto>(`/community/photos/${encodeURIComponent(photoId)}/bookmark`, {
    method: 'POST',
    token,
  });
}

export async function fetchLeaderboard(token?: string) {
  const data = await request<{ entries: LeaderboardEntry[] }>('/community/leaderboard', {
    token,
  });
  return data.entries;
}

export async function fetchBookmarkedPhotos(token: string) {
  const data = await request<{ photos: CommunityPhoto[] }>('/community/bookmarks', {
    token,
  });
  return data.photos;
}
