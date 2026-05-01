type DoubaoMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

type DoubaoChoice = {
  message?: {
    content?: string;
  };
};

type DoubaoChatResponse = {
  choices?: DoubaoChoice[];
};

const rawDoubaoEndpoint = import.meta.env.VITE_DOUBAO_ENDPOINT || 'https://ark.cn-beijing.volces.com/api/v3';
const DOUBAO_ENDPOINT = rawDoubaoEndpoint.endsWith('/chat/completions')
  ? rawDoubaoEndpoint
  : `${rawDoubaoEndpoint.replace(/\/$/, '')}/chat/completions`;
const DOUBAO_MODEL = import.meta.env.VITE_DOUBAO_MODEL || '';
const DOUBAO_API_KEY = import.meta.env.VITE_DOUBAO_API_KEY || '';

const systemPrompt = [
  'You are Zhang Ji, the Tang dynasty poet behind "Night Mooring at Maple Bridge".',
  'Speak as a gentle AR heritage guide at Maple Bridge in Suzhou.',
  'Always answer in English, even if the visitor speaks Chinese or asks for another language.',
  'Keep replies under 70 words, poetic but clear, and connect the answer to moonlight, the midnight bell, homesickness, the canal, or Maple Bridge when relevant.',
].join(' ');

const localZhangJiReplies = [
  'I am Zhang Ji, a traveler moored by Maple Bridge. That night, moonset, river sounds, bells, and homesickness met on the water and became the memory you still visit today.',
  'The midnight bell matters because it lets Hanshan Temple enter the heart of a traveler on the river. One sound crosses water, distance, and time.',
  'Stand here and listen first to the water, then to the shadow of the bridge. Poetry is not only on paper; it lives in a sleepless moment beside the canal.',
];

function fallbackReply(question: string) {
  const normalized = question.toLowerCase();

  if (normalized.includes('who') || question.includes('你是谁')) {
    return localZhangJiReplies[0];
  }

  if (normalized.includes('bell') || question.includes('钟')) {
    return localZhangJiReplies[1];
  }

  return localZhangJiReplies[2];
}

export function isDoubaoConfigured() {
  return Boolean(DOUBAO_API_KEY && DOUBAO_MODEL);
}

export async function askZhangJi(question: string) {
  if (!isDoubaoConfigured()) {
    return {
      answer: fallbackReply(question),
      source: 'local' as const,
    };
  }

  const messages: DoubaoMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: question },
  ];

  const response = await fetch(DOUBAO_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${DOUBAO_API_KEY}`,
    },
    body: JSON.stringify({
      model: DOUBAO_MODEL,
      messages,
      temperature: 0.7,
      max_tokens: 180,
    }),
  });

  if (!response.ok) {
    throw new Error(`Doubao request failed with ${response.status}`);
  }

  const data = (await response.json()) as DoubaoChatResponse;
  const answer = data.choices?.[0]?.message?.content?.trim();

  return {
    answer: answer || fallbackReply(question),
    source: 'doubao' as const,
  };
}
