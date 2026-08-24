import baseWorker from './worker.js';

const ALLOWED_ORIGINS = new Set([
  'https://qilylean.com',
  'https://www.qilylean.com'
]);

const TRANSLATION_CACHE_VERSION = 'v1';
const TRANSLATION_SYSTEM_INSTRUCTIONS = `You are the QilyLean website translation engine.
Translate every supplied source string faithfully into the requested target language/locale.
Return ONLY a JSON array of translated strings, in exactly the same order and with exactly the same number of items as the input array.
Do not add explanations, markdown, labels or commentary.
Preserve the following brand/product/engineering tokens exactly when they occur: QilyLean, QilyLean｜启力精益, 启力精益, Times26001, C919, IE, PE, ME, NPI, VSM, SMED, ECRS, OEE, UPPH, CT, TT, WIP, FPY, DPPM, COPQ, ERP, APS, MES, SOP, KPI, PQCD, IATF 16949, 5W2H, 6S, 7S.
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
    rating_average: ratingCount ? Math.round((ratingSum / ratingCount) * 10) / 10 : 0,
    rating_count: ratingCount,
    five_star_count: fiveStarCount,
    likes,
    dislikes,
    comments,
    interaction_count: ratingCount + likes + dislikes + comments,
    updated_at: summary.updated_at || ''
  };
}

async function readNumber(kv, key) {
  if (!kv) return 0;
  return Number((await kv.get(key)) || 0);
}

async function increment(kv, key, ttl) {
  if (!kv) return 0;
  const next = (await readNumber(kv, key)) + 1;
  await kv.put(key, String(next), ttl ? { expirationTtl: ttl } : undefined);
  return next;
}

async function getSummary(env, briefDate) {
  if (!env.QILY_STATS) return emptySummary(briefDate);
  return (await env.QILY_STATS.get(`brief-feedback:summary:${briefDate}`, 'json')) || emptySummary(briefDate);
}

async function voterKey(request, briefDate, action, clientToken) {
  const raw = `${clientId(request)}|${briefDate}|${action}|${clientToken}`;
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(raw));
  const hash = Array.from(new Uint8Array(digest)).map((value) => value.toString(16).padStart(2, '0')).join('');
  return `brief-feedback-voter:${briefDate}:${action}:${hash}`;
}

async function checkFeedbackRateLimit(request, env) {
  const limit = Math.max(1, Number(env.BRIEF_FEEDBACK_DAILY_IP_LIMIT || 30));
  if (!env.QILY_STATS) return { allowed: false, limit, storage: false };
  const key = `brief-feedback-limit:${todayUTC()}:${clientId(request)}`;
  const used = await readNumber(env.QILY_STATS, key);
  if (used >= limit) return { allowed: false, limit, storage: true };
  await increment(env.QILY_STATS, key, 60 * 60 * 48);
  return { allowed: true, limit, storage: true };
}

async function saveVote(payload, request, env) {
  if (!env.QILY_STATS) return { error: 'Brief feedback storage is not configured', status: 503 };
  const briefDate = normalizeBriefDate(payload.brief_date);
  const briefTitle = clean(payload.brief_title, 220);
  const briefUrl = clean(payload.brief_url, 300);
  const action = clean(payload.action, 20);
  const clientToken = clean(payload.client_token, 120);
  if (!briefDate || !briefTitle || !briefUrl) return { error: 'Brief source is incomplete', status: 400 };
  if (!['rating', 'sentiment'].includes(action)) return { error: 'Unsupported feedback action', status: 400 };
  if (clientToken.length < 8) return { error: 'Feedback client token is invalid', status: 400 };

  let value;
  if (action === 'rating') {
    value = Number(payload.value);
    if (!Number.isInteger(value) || value < 1 || value > 5) return { error: 'Rating must be from 1 to 5', status: 400 };
  } else {
    value = clean(payload.value, 10);
    if (!['good', 'bad'].includes(value)) return { error: 'Sentiment must be good or bad', status: 400 };
  }

  const rate = await checkFeedbackRateLimit(request, env);
  if (!rate.allowed) {
    return {
      error: rate.storage ? 'Brief feedback submission limit reached' : 'Brief feedback storage is not configured',
      status: rate.storage ? 429 : 503
    };
  }

  const key = await voterKey(request, briefDate, action, clientToken);
  const existing = await env.QILY_STATS.get(key);
  if (existing) return { duplicate: true, summary: publicSummary(await getSummary(env, briefDate)) };

  const summary = await getSummary(env, briefDate);
  summary.brief_date = briefDate;
  summary.brief_title = briefTitle;
  summary.brief_url = briefUrl;
  if (action === 'rating') {
    summary.rating_sum = Number(summary.rating_sum || 0) + value;
    summary.rating_count = Number(summary.rating_count || 0) + 1;
    if (value === 5) summary.five_star_count = Number(summary.five_star_count || 0) + 1;
  } else if (value === 'good') {
    summary.likes = Number(summary.likes || 0) + 1;
  } else {
    summary.dislikes = Number(summary.dislikes || 0) + 1;
  }
  summary.updated_at = new Date().toISOString();
  await Promise.all([
    env.QILY_STATS.put(`brief-feedback:summary:${briefDate}`, JSON.stringify(summary)),
    env.QILY_STATS.put(key, String(value), { expirationTtl: 60 * 60 * 24 * 400 })
  ]);
  return { duplicate: false, summary: publicSummary(summary) };
}

function briefDateFromComment(payload) {
  const source = `${payload.source_brief || ''} ${payload.timing || ''} ${payload.source_page || ''}`;
  const match = source.match(/\d{4}-\d{2}-\d{2}/);
  return match ? normalizeBriefDate(match[0]) : '';
}

async function recordComment(payload, env) {
  if (!env.QILY_STATS) return null;
  const briefDate = briefDateFromComment(payload);
  if (!briefDate) return null;
  const summary = await getSummary(env, briefDate);
  const sourceBrief = clean(payload.source_brief, 300);
  const derivedTitle = clean(sourceBrief.replace(briefDate, '').replace(/^[\s｜|·:：-]+/, ''), 220);
  summary.brief_date = briefDate;
  if (derivedTitle) summary.brief_title = derivedTitle;
  if (payload.source_page) summary.brief_url = clean(payload.source_page, 300);
  summary.comments = Number(summary.comments || 0) + 1;
  summary.updated_at = new Date().toISOString();
  await env.QILY_STATS.put(`brief-feedback:summary:${briefDate}`, JSON.stringify(summary));
  return publicSummary(summary);
}

async function listFeedback(env, limit) {
  if (!env.QILY_STATS) return [];
  const listed = await env.QILY_STATS.list({
    prefix: 'brief-feedback:summary:',
    limit: Math.min(Math.max(limit || 100, 1), 1000)
  });
  const values = await Promise.all(listed.keys.map((item) => env.QILY_STATS.get(item.name, 'json')));
  return values.filter(Boolean).map(publicSummary).sort((a, b) => {
    return b.interaction_count - a.interaction_count || String(b.updated_at).localeCompare(String(a.updated_at));
  });
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

  const provider = translationProvider(env);
  if (!provider) return { error: 'Translation service is not configured', status: 503 };

  const cacheKey = await translationCacheKey(targetLanguage, texts);
  if (env.QILY_STATS) {
    const cached = await env.QILY_STATS.get(cacheKey, 'json');
    if (Array.isArray(cached) && cached.length === texts.length) {
      return { translations: cached, cached: true, provider };
    }
  }

  const rate = await checkTranslationRateLimit(request, env);
  if (!rate.allowed) return { error: 'Daily translation limit reached', status: 429, limit: rate.limit };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 55000);
  try {
    const translations = provider === 'qwen'
      ? await callQwenTranslation(texts, targetLanguage, env, controller.signal)
      : await callOpenAITranslation(texts, targetLanguage, env, controller.signal);
    if (env.QILY_STATS) {
      await env.QILY_STATS.put(cacheKey, JSON.stringify(translations), { expirationTtl: 60 * 60 * 24 * 90 });
    }
    return { translations, cached: false, provider, rate_limit: { used: rate.used, limit: rate.limit } };
  } catch (error) {
    const timedOut = error && error.name === 'AbortError';
    return { error: timedOut ? 'Translation request timed out' : 'Translation service unavailable', status: timedOut ? 504 : 502 };
  } finally {
    clearTimeout(timeout);
  }
}

export default {
  async fetch(request, env, ctx) {
    const origin = request.headers.get('Origin') || '';
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors(origin) });
    }

    if (request.method === 'POST' && url.pathname === '/translate') {
      if (!ALLOWED_ORIGINS.has(origin)) return json({ error: 'Origin not allowed' }, 403, origin);
      let payload;
      try { payload = await request.json(); }
      catch { return json({ error: 'Invalid JSON' }, 400, origin); }
      const result = await translateBatch(payload, request, env);
      if (result.error) return json({ error: result.error, limit: result.limit }, result.status || 400, origin);
      return json({
        ok: true,
        target_language: clean(payload.target_language, 40),
        translations: result.translations,
        cached: result.cached,
        provider: result.provider,
        rate_limit: result.rate_limit || null
      }, 200, origin);
    }

    if (request.method === 'GET' && url.pathname === '/brief-feedback') {
      const briefDate = normalizeBriefDate(url.searchParams.get('brief'));
      if (!briefDate) return json({ error: 'Brief date is invalid' }, 400, origin);
      return json(publicSummary(await getSummary(env, briefDate)), 200, origin);
    }

    if (request.method === 'POST' && url.pathname === '/brief-feedback') {
      if (!ALLOWED_ORIGINS.has(origin)) return json({ error: 'Origin not allowed' }, 403, origin);
      let payload;
      try { payload = await request.json(); }
      catch { return json({ error: 'Invalid JSON' }, 400, origin); }
      const result = await saveVote(payload, request, env);
      if (result.error) return json({ error: result.error }, result.status || 400, origin);
      return json({ ok: true, duplicate: result.duplicate, summary: result.summary }, result.duplicate ? 200 : 201, origin);
    }

    if (request.method === 'GET' && url.pathname === '/admin/brief-feedback') {
      if (!isAdmin(request, env)) return json({ error: 'Unauthorized' }, 401, origin);
      const feedback = await listFeedback(env, Number(url.searchParams.get('limit') || 100));
      return json({ ok: true, feedback }, 200, origin);
    }

    if (request.method === 'POST' && url.pathname === '/consultations') {
      let payload = {};
      try { payload = await request.clone().json(); } catch {}
      const response = await baseWorker.fetch(request, env, ctx);
      if (!response.ok || clean(payload.website, 120) || payload.industry !== '今日简报留言交流') return response;
      const briefSummary = await recordComment(payload, env);
      if (!briefSummary) return response;
      const data = await response.clone().json().catch(() => ({}));
      return json({ ...data, brief_summary: briefSummary }, response.status, origin);
    }

    return baseWorker.fetch(request, env, ctx);
  }
};