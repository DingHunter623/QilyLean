import baseWorker from './worker.js';

const ALLOWED_ORIGINS = new Set([
  'https://qilylean.com',
  'https://www.qilylean.com'
]);

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

export default {
  async fetch(request, env, ctx) {
    const origin = request.headers.get('Origin') || '';
    const url = new URL(request.url);

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
