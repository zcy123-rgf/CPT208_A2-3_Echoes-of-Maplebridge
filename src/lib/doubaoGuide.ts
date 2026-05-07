const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.trim() || '/api';

export function isDoubaoConfigured() {
  return true;
}

export async function askZhangJi(question: string) {
  const response = await fetch(`${API_BASE_URL}/guide/ask`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ question }),
  });

  if (!response.ok) {
    throw new Error(`Guide request failed with ${response.status}`);
  }

  return response.json() as Promise<{
    answer: string;
    source: 'doubao' | 'local';
  }>;
}
