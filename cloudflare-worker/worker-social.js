import baseWorker from './worker.js';

const ALLOWED_ORIGINS = new Set([
  'https://qilylean.com',
  'https://www.qilylean.com'
]);

const TRANSLATION_CACHE_VERSION = 'v2';
const PROTECTED_TRANSLATION_TOKENS = [
  'QilyLean｜启力精益', 'IATF 16949', 'Times26001', '启力精益', 'QilyLean', 'C919',
  'UPPH', 'DPPM', 'COPQ', 'SMED', 'ECRS', 'PQCD', '5W2H', 'VSM', 'OEE', 'ERP', 'APS',
  'MES', 'SOP', 'KPI', 'WIP', 'FPY', 'NPI', 'IE', 'PE', 'ME', 'CT', 'TT', '6S', '7S'
];
const PROTECTED_TRANSLATION_SET = new Set(PROTECTED_TRANSLATION_TOKENS);
const TRANSLATION_SYSTEM_INSTRUCTIONS = `You are the QilyLean website translation engine.
Translate every supplied source string faithfully into the requested target language/locale.
Return ONLY a JSON array of translated strings, in exactly the same order and with exactly the same number of items as the input array.
Do not add explanations, markdown, labels or commentary.
Preserve placeholder tokens matching __QILY_TOKEN_*__ exactly, character-for-character.
Preserve URLs, email addresses, phone numbers, model numbers, file paths, units, numeric values, arrows and punctuation structure. Translate normal explanatory words around protected tokens naturally and professionally for manufacturing/industrial-engineering readers.`;

function cors(origin) {
  const allow = ALLOWED_ORIGINS.has(origin) ? origin : 'https://qilylean.com';
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin'
  };
}

function json(body, status, origin) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...cors(origin),
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store'
    }
  });
}

function clean(value, max = 500) {
  return String(value == null ? '' : value).replace(/\0/g, '').trim().slice(0, max);
}

function clientId(request) {
  return request.headers.get('CF-Connecting-IP') || 'unknown';
}

function todayUTC() {
  return new Date().toISOString().slice(0, 10);
}

function normalizeBriefDate(value) {
  const date = clean(value, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : '';
}

function emptySummary(date, title = '', url = '') {
  return {
    brief_date: date,
    brief_title: title,
    brief_url: url,
    rating_sum: 0,
    rating_count: 0,
    five_star_count: 0,
    likes: 0,
    dislikes: 0,
    comments: 0,
    updated_at: ''
  };
}

function publicSummary(summary) {
  const ratingCount = Math.max(0, Number(summary.rating_count || 0));
  const ratingSum = Math.max(0, Number(summary.rating_sum || 0));
  const fiveStarCount = Math.max(0, Number(summary.five_star_count || 0));
  const likes = Math.max(0, Number(summary.likes || 0));
  const dislikes = Math.max(0, Number(summary.dislikes || 0));
  const comments = Math.max(0, Number(summary.comments || 0));
  return {
    brief_date: summary.brief_date || '',
    brief_title: summary.brief_title || '',
    brief_url: summary.brief_url || '',
    rating_average: ratingCount > 0 ? Number((ratingSum / ratingCount).toFixed(2)) : 0,
    rating_count: ratingCount,
    five_star_count: fiveStarCount,
    likes,
    dislikes,
    comments,
    updated_at: summary.updated_at || ''
  };
}

async function getBriefSummary(env, date) {
  if (!env.QILY_STATS) return publicSummary(emptySummary(date));
  const raw = await env.QILY_STATS.get(`brief:${date}`, 'json');
  return publicSummary(raw || emptySummary(date));
}

async function putBriefSummary(env, date, summary) {
  if (!env.QILY_STATS) return false;
  await env.QILY_STATS.put(`brief:${date}`, JSON.stringify(summary));
  return true;
}

async function readNumber(store, key) {
  const raw = await store.get(key);
  const value = Number(raw || 0);
  return Number.isFinite(value) ? value : 0;
}

async function increment(store, key, ttl) {
  const next = (await readNumber(store, key)) + 1;
  await store.put(key, String(next), ttl ? { expirationTtl: ttl } : undefined);
  return next;
}

async function recordBriefFeedback(payload, request, env) {
  const date = normalizeBriefDate(payload.brief_date);
  if (!date) return { error: 'Invalid brief_date', status: 400 };
  const type = clean(payload.type, 20);
  if (!['rating', 'like', 'dislike', 'comment'].includes(type)) return { error: 'Invalid feedback type', status: 400 };
  if (!env.QILY_STATS) return { error: 'Feedback storage is not configured', status: 503 };
  const summaryKey = `brief:${date}`;
  const existing = await env.QILY_STATS.get(summaryKey, 'json');
  const summary = existing || emptySummary(date, clean(payload.brief_title, 180), clean(payload.brief_url, 500));
  summary.brief_title = summary.brief_title || clean(payload.brief_title, 180);
  summary.brief_url = summary.brief_url || clean(payload.brief_url, 500);
  summary.updated_at = new Date().toISOString();
  const visitor = clientId(request);

  if (type === 'rating') {
    const rating = Number(payload.rating);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) return { error: 'Rating must be 1 to 5', status: 400 };
    const onceKey = `brief-rating:${date}:${visitor}`;
    if (await env.QILY_STATS.get(onceKey)) return { error: 'Already rated', status: 409 };
    summary.rating_sum = Number(summary.rating_sum || 0) + rating;
    summary.rating_count = Number(summary.rating_count || 0) + 1;
    if (rating === 5) summary.five_star_count = Number(summary.five_star_count || 0) + 1;
    await env.QILY_STATS.put(onceKey, String(rating), { expirationTtl: 60 * 60 * 24 * 180 });
  } else if (type === 'like' || type === 'dislike') {
    const onceKey = `brief-vote:${date}:${visitor}`;
    if (await env.QILY_STATS.get(onceKey)) return { error: 'Already voted', status: 409 };
    summary[type === 'like' ? 'likes' : 'dislikes'] = Number(summary[type === 'like' ? 'likes' : 'dislikes'] || 0) + 1;
    await env.QILY_STATS.put(onceKey, type, { expirationTtl: 60 * 60 * 24 * 180 });
  } else {
    const comment = clean(payload.comment, 1000);
    if (!comment) return { error: 'Comment is required', status: 400 };
    const rateKey = `brief-comment-limit:${todayUTC()}:${visitor}`;
    const used = await readNumber(env.QILY_STATS, rateKey);
    if (used >= 5) return { error: 'Daily comment limit reached', status: 429 };
    await increment(env.QILY_STATS, rateKey, 60 * 60 * 48);
    const commentId = `${date}:${Date.now()}:${crypto.randomUUID()}`;
    await env.QILY_STATS.put(`brief-comment:${commentId}`, JSON.stringify({
      id: commentId,
      brief_date: date,
      brief_title: summary.brief_title,
      brief_url: summary.brief_url,
      comment,
      name: clean(payload.name, 80),
      email: clean(payload.email, 160),
      created_at: new Date().toISOString(),
      user_agent: clean(request.headers.get('User-Agent'), 260)
    }));
    summary.comments = Number(summary.comments || 0) + 1;
  }

  await putBriefSummary(env, date, summary);
  return { summary: publicSummary(summary), status: 200 };
}

async function listBriefFeedback(request, env) {
  if (!env.QILY_STATS) return { error: 'Feedback storage is not configured', status: 503 };
  if (!isAdmin(request, env)) return { error: 'Unauthorized', status: 401 };
  const url = new URL(request.url);
  const date = normalizeBriefDate(url.searchParams.get('brief') || '');
  const prefix = date ? `brief-comment:${date}:` : 'brief-comment:';
  const listed = await env.QILY_STATS.list({ prefix, limit: 100 });
  const comments = [];
  for (const key of listed.keys) {
    const value = await env.QILY_STATS.get(key.name, 'json');
    if (value) comments.push(value);
  }
  comments.sort((a, b) => String(b.created_at || '').localeCompare(String(a.created_at || '')));
  return { comments, status: 200 };
}

function isAdmin(request, env) {
  return Boolean(env.ADMIN_TOKEN) && (request.headers.get('Authorization') || '') === `Bearer ${env.ADMIN_TOKEN}`;
}

function translationProvider(env) {
  const requested = String(env.AI_PROVIDER || '').toLowerCase();
  if (requested === 'openai' && env.OPENAI_API_KEY) return 'openai';
  if ((requested === 'qwen' || requested === 'dashscope') && env.DASHSCOPE_API_KEY) return 'qwen';
  if (env.DASHSCOPE_API_KEY) return 'qwen';
  if (env.OPENAI_API_KEY) return 'openai';
  return '';
}

function parseTranslationArray(raw, expectedLength) {
  let text = String(raw || '').trim();
  if (text.startsWith('```')) text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  let parsed;
  try { parsed = JSON.parse(text); }
  catch {
    const start = text.indexOf('[');
    const end = text.lastIndexOf(']');
    if (start >= 0 && end > start) {
      try { parsed = JSON.parse(text.slice(start, end + 1)); } catch {}
    }
  }
  if (parsed && !Array.isArray(parsed) && Array.isArray(parsed.translations)) parsed = parsed.translations;
  if (!Array.isArray(parsed) || parsed.length !== expectedLength || parsed.some((item) => typeof item !== 'string')) {
    throw new Error('Translation response format is invalid');
  }
  return parsed;
}

function maskProtectedTranslationText(text, sourceIndex) {
  let masked = text;
  const replacements = [];
  PROTECTED_TRANSLATION_TOKENS.forEach((token, tokenIndex) => {
    if (!masked.includes(token)) return;
    const placeholder = `__QILY_TOKEN_${sourceIndex}_${tokenIndex}__`;
    masked = masked.split(token).join(placeholder);
    replacements.push([placeholder, token]);
  });
  return { masked, replacements };
}

function restoreProtectedTranslationText(text, replacements) {
  let restored = String(text || '');
  for (const [placeholder, token] of replacements) {
    if (!restored.includes(placeholder)) throw new Error('Protected translation placeholder changed');
    restored = restored.split(placeholder).join(token);
  }
  return restored;
}

function extractOpenAIText(data) {
  if (typeof data?.output_text === 'string' && data.output_text.trim()) return data.output_text.trim();
  const parts = [];
  for (const item of Array.isArray(data?.output) ? data.output : []) {
    for (const block of Array.isArray(item?.content) ? item.content : []) {
      if (typeof block?.text === 'string') parts.push(block.text);
    }
  }
  return parts.join('\n').trim();
}

async function callOpenAITranslation(texts, targetLanguage, env, signal) {
  const model = env.OPENAI_MODEL || 'gpt-5-mini';
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model,
      instructions: `${TRANSLATION_SYSTEM_INSTRUCTIONS}\nTarget language/locale: ${targetLanguage}`,
      input: JSON.stringify(texts),
      max_output_tokens: Math.max(1800, Number(env.TRANSLATE_MAX_OUTPUT_TOKENS || 6000))
    }),
    signal
  });
  const data = await response.json();
  if (!response.ok) throw new Error(`OpenAI translation upstream ${response.status}`);
  return parseTranslationArray(extractOpenAIText(data), texts.length);
}

async function callQwenTranslation(texts, targetLanguage, env, signal) {
  const model = env.QWEN_MODEL || 'qwen-plus';
  const response = await fetch('https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.DASHSCOPE_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: `${TRANSLATION_SYSTEM_INSTRUCTIONS}\nTarget language/locale: ${targetLanguage}` },
        { role: 'user', content: JSON.stringify(texts) }
      ],
      max_tokens: Math.max(1800, Number(env.TRANSLATE_MAX_OUTPUT_TOKENS || 6000)),
      temperature: 0.1
    }),
    signal
  });
  const data = await response.json();
  if (!response.ok) throw new Error(`Qwen translation upstream ${response.status}`);
  return parseTranslationArray(data?.choices?.[0]?.message?.content, texts.length);
}

async function hashTranslationBatch(targetLanguage, texts) {
  const raw = JSON.stringify([TRANSLATION_CACHE_VERSION, targetLanguage, texts]);
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(raw));
  return Array.from(new Uint8Array(digest)).map((value) => value.toString(16).padStart(2, '0')).join('');
}

async function translationCacheKey(targetLanguage, texts) {
  return `translate:${TRANSLATION_CACHE_VERSION}:${targetLanguage}:${await hashTranslationBatch(targetLanguage, texts)}`;
}

async function checkTranslationRateLimit(request, env) {
  const limit = Math.max(10, Number(env.TRANSLATE_DAILY_IP_LIMIT || 80));
  if (!env.QILY_STATS) return { allowed: true, limit, used: 0, storage: false };
  const key = `translate-limit:${todayUTC()}:${clientId(request)}`;
  const used = await readNumber(env.QILY_STATS, key);
  if (used >= limit) return { allowed: false, limit, used, storage: true };
  const next = await increment(env.QILY_STATS, key, 60 * 60 * 48);
  return { allowed: true, limit, used: next, storage: true };
}

async function translateBatch(payload, request, env) {
  const targetLanguage = clean(payload.target_language, 40);
  const texts = Array.isArray(payload.texts) ? payload.texts.map((value) => clean(value, 6000)) : [];
  if (!targetLanguage || targetLanguage === 'zh-CN') return { translations: texts, cached: true, provider: 'source' };
  if (!texts.length || texts.length > 24) return { error: 'Translation batch must contain 1 to 24 strings', status: 400 };
  if (texts.some((value) => !value)) return { error: 'Translation batch contains an empty string', status: 400 };
  const totalChars = texts.reduce((sum, value) => sum + value.length, 0);
  if (totalChars > 8000) return { error: 'Translation batch is too large', status: 413 };

  const cacheKey = await translationCacheKey(targetLanguage, texts);
  if (env.QILY_STATS) {
    const cached = await env.QILY_STATS.get(cacheKey, 'json');
    if (Array.isArray(cached) && cached.length === texts.length) {
      return { translations: cached, cached: true, provider: translationProvider(env) || 'cache' };
    }
  }

  const direct = texts.map((text) => PROTECTED_TRANSLATION_SET.has(text));
  const prepared = texts.map((text, index) => direct[index] ? null : maskProtectedTranslationText(text, index));
  const providerIndexes = [];
  const providerTexts = [];
  for (let index = 0; index < texts.length; index += 1) {
    if (direct[index]) continue;
    providerIndexes.push(index);
    providerTexts.push(prepared[index].masked);
  }

  const provider = translationProvider(env);
  if (providerTexts.length && !provider) return { error: 'Translation service is not configured', status: 503 };
  let translatedProvider = [];
  let rate = { allowed: true, limit: Math.max(10, Number(env.TRANSLATE_DAILY_IP_LIMIT || 80)), used: 0, storage: Boolean(env.QILY_STATS) };

  if (providerTexts.length) {
    rate = await checkTranslationRateLimit(request, env);
    if (!rate.allowed) return { error: 'Daily translation limit reached', status: 429, limit: rate.limit };
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 55000);
    try {
      translatedProvider = provider === 'qwen'
        ? await callQwenTranslation(providerTexts, targetLanguage, env, controller.signal)
        : await callOpenAITranslation(providerTexts, targetLanguage, env, controller.signal);
    } catch (error) {
      const timedOut = error && error.name === 'AbortError';
      return { error: timedOut ? 'Translation request timed out' : 'Translation service unavailable', status: timedOut ? 504 : 502 };
    } finally {
      clearTimeout(timeout);
    }
  }

  const translations = texts.slice();
  for (let i = 0; i < providerIndexes.length; i += 1) {
    const sourceIndex = providerIndexes[i];
    try {
      translations[sourceIndex] = restoreProtectedTranslationText(translatedProvider[i], prepared[sourceIndex].replacements);
    } catch {
      return { error: 'Translation service unavailable', status: 502 };
    }
  }
  if (env.QILY_STATS) {
    await env.QILY_STATS.put(cacheKey, JSON.stringify(translations), { expirationTtl: 60 * 60 * 24 * 90 });
  }
  return { translations, cached: false, provider: provider || 'protected', rate_limit: { used: rate.used, limit: rate.limit } };
}

async function handleBriefFeedback(request, env) {
  const origin = request.headers.get('Origin') || '';
  if (request.method === 'GET') {
    const date = normalizeBriefDate(new URL(request.url).searchParams.get('brief') || '');
    if (!date) return json({ ok: false, error: 'Missing brief date' }, 400, origin);
    return json({ ok: true, ...(await getBriefSummary(env, date)) }, 200, origin);
  }
  if (request.method !== 'POST') return json({ ok: false, error: 'Method Not Allowed' }, 405, origin);
  const payload = await request.json().catch(() => ({}));
  const result = await recordBriefFeedback(payload, request, env);
  if (result.error) return json({ ok: false, error: result.error }, result.status, origin);
  return json({ ok: true, ...result.summary }, 200, origin);
}

async function handleTranslation(request, env) {
  const origin = request.headers.get('Origin') || '';
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors(origin) });
  if (request.method !== 'POST') return json({ ok: false, error: 'Method Not Allowed' }, 405, origin);
  const payload = await request.json().catch(() => ({}));
  const result = await translateBatch(payload, request, env);
  if (result.error) return json({ ok: false, error: result.error, limit: result.limit }, result.status, origin);
  return json({ ok: true, ...result }, 200, origin);
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors(request.headers.get('Origin') || '') });
    }
    if (url.pathname === '/brief-feedback') return handleBriefFeedback(request, env);
    if (url.pathname === '/admin/brief-feedback') {
      const result = await listBriefFeedback(request, env);
      if (result.error) return json({ ok: false, error: result.error }, result.status, request.headers.get('Origin') || '');
      return json({ ok: true, comments: result.comments }, 200, request.headers.get('Origin') || '');
    }
    if (url.pathname === '/translate') return handleTranslation(request, env);
    return baseWorker.fetch(request, env, ctx);
  }
};
