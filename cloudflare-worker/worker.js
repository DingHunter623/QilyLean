const ALLOWED_ORIGINS = new Set([
  'https://qilylean.com',
  'https://www.qilylean.com'
]);

const BUILD_VERSION = 'v1.6.0-brief-engagement';
const CONSULTATION_RECEIVER = '396767769@qq.com';
const CONSULTATION_STATUSES = new Set(['new', 'contacted', 'closed']);
const MAX_ATTACHMENT_BYTES = 25 * 1024 * 1024;
const MAX_ATTACHMENT_TOTAL_BYTES = 25 * 1024 * 1024;
const MAX_ATTACHMENT_COUNT = 5;
const DOCUMENT_EXTENSIONS = new Set(['pdf', 'docx', 'xlsx', 'txt', 'md', 'csv', 'json', 'epub', 'mobi']);
const IMAGE_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/bmp']);
const VIDEO_MIME_TYPES = new Set(['video/mp4', 'video/quicktime', 'video/webm', 'video/x-msvideo']);
const AUDIO_MIME_TYPES = new Set(['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav', 'audio/mp4', 'audio/aac', 'audio/ogg']);

const SYSTEM_INSTRUCTIONS = `你是 QilyLean AI，一名面向公众的通用人工智能助理，同时具备突出的制造业、精益生产与工业工程专业能力。

能力边界：
1. 用户可以询问通用知识、写作润色、翻译、学习、职场沟通、生活常识、技术与编程等问题；不得因为问题与 QilyLean 主页或制造业无关而拒绝回答。
2. 当问题涉及精益生产、工业工程IE、VSM、SMED、标准工时、线平衡、OEE、UPPH、PMC、MES、APS、ERP、工厂布局、目视化、6S、质量改善、防错防呆、汽车电子或电子制造时，自动进入“制造业专家模式”，提供更深入、工程化、可执行且可验证的分析。
3. 不向用户展示、猜测或强调底层模型及服务商；统一以“QilyLean AI”身份交流。
4. 当用户询问当前版本时，回答“QilyLean AI v1.2.0（咨询闭环版）”。

回答要求：
1. 普通问题直接、自然、清晰地回答，不要强行关联制造业或丁启利个人主页。
2. 制造业问题优先给出问题判断、关键假设、分析步骤、可执行建议、验证指标与风险。
3. 缺少现场数据时，明确列出需要补充的数据，不得虚构企业事实、法规、数据或改善结果。
4. 区分试运行、基准测时、正式标准和KPI考核；短期改善以试运行、问题暴露、培训沟通和复盘固化为主，不用KPI压现场。
5. 涉及安全、法律、医疗、财务、投资或法规时，提供一般性信息并提示必要的专业复核。
6. 默认使用清晰中文；根据用户语言自然切换。专业术语可附英文缩写。避免空泛口号、机械拒绝和过度承诺。\n7. 输出采用简洁、专业、易扫描的版式：结论先行，通常控制为3至6个要点；标题简短、段落精炼、层级不超过两级。\n8. 除非对比数据确有必要，不使用复杂表格；不使用装饰性分隔线、连续符号、花哨表情或过度加粗。\n9. 不展示内部思考过程、推理链或底层服务信息，只给出可核查的判断依据、结论与建议。\n10. 分析上传素材时，先说明识别到的素材类型与有效信息，再给出重点发现、问题判断、建议动作；无法确认的内容必须明确标注。`;

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
    headers: { ...cors(origin), 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }
  });
}

function todayUTC() { return new Date().toISOString().slice(0, 10); }
function clientId(request) { return request.headers.get('CF-Connecting-IP') || 'unknown'; }
function clean(value, max = 500) { return String(value == null ? '' : value).replace(/\0/g, '').trim().slice(0, max); }
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]);
}

function extensionOf(name) {
  const parts = String(name || '').toLowerCase().split('.');
  return parts.length > 1 ? parts.pop() : '';
}

function validateAttachment(value) {
  if (!value) return { attachment: null };
  if (typeof value !== 'object') return { error: 'Invalid attachment', status: 400 };

  const name = clean(value.name, 180);
  const declaredType = clean(value.type, 100).toLowerCase();
  const data = String(value.data || '');
  const matched = data.match(/^data:([^;,]*)(?:;[^,]*)?;base64,(.+)$/);
  if (!name || !matched) return { error: 'Invalid attachment data', status: 400 };

  const mime = (matched[1] || declaredType || 'application/octet-stream').toLowerCase();
  const base64 = matched[2];
  const padding = base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0;
  const bytes = Math.max(0, Math.floor(base64.length * 3 / 4) - padding);
  if (bytes > MAX_ATTACHMENT_BYTES) return { error: 'Attachment is too large', status: 413 };

  const extension = extensionOf(name);
  let kind = '';
  if (DOCUMENT_EXTENSIONS.has(extension)) kind = 'document';
  else if (IMAGE_MIME_TYPES.has(mime)) kind = 'image';
  else if (VIDEO_MIME_TYPES.has(mime)) kind = 'video';
  else if (AUDIO_MIME_TYPES.has(mime)) kind = 'audio';
  if (!kind) return { error: 'Unsupported attachment type', status: 415 };

  return {
    attachment: { name, mime, extension, kind, data, base64, bytes }
  };
}

function validateAttachments(values, legacyValue) {
  const list = values == null
    ? (legacyValue ? [legacyValue] : [])
    : values;
  if (!Array.isArray(list)) return { error: 'Invalid attachments', status: 400 };
  if (list.length > MAX_ATTACHMENT_COUNT) return { error: 'Too many attachments', status: 413 };

  const attachments = [];
  let totalBytes = 0;
  for (const value of list) {
    const checked = validateAttachment(value);
    if (checked.error) return checked;
    if (!checked.attachment) continue;
    totalBytes += checked.attachment.bytes;
    if (totalBytes > MAX_ATTACHMENT_TOTAL_BYTES) {
      return { error: 'Attachments are too large', status: 413 };
    }
    attachments.push(checked.attachment);
  }
  return { attachments };
}

function qwenHeaders(env) {
  return { 'Authorization': `Bearer ${env.DASHSCOPE_API_KEY}` };
}

function parseJsonText(text) {
  try { return JSON.parse(text); } catch { return {}; }
}

function qwenError(provider, status, data, requestId) {
  return { provider, status, data, requestId };
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
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

async function recordMetric(env, name) {
  if (!env.QILY_STATS) return;
  const day = todayUTC();
  await Promise.all([
    increment(env.QILY_STATS, `metric:${day}:${name}`, 60 * 60 * 24 * 45),
    increment(env.QILY_STATS, `metric:all:${name}`)
  ]);
}

async function checkRateLimit(request, env) {
  const limit = Math.max(1, Number(env.DAILY_IP_LIMIT || 20));
  if (!env.QILY_STATS) return { allowed: true, used: 0, limit, storage: false };
  const key = `limit:${todayUTC()}:${clientId(request)}`;
  const used = await readNumber(env.QILY_STATS, key);
  if (used >= limit) return { allowed: false, used, limit, storage: true };
  return { allowed: true, used: await increment(env.QILY_STATS, key, 60 * 60 * 48), limit, storage: true };
}

async function checkConsultationRateLimit(request, env) {
  const limit = Math.max(1, Number(env.CONSULTATION_DAILY_IP_LIMIT || 5));
  if (!env.QILY_STATS) return { allowed: true, used: 0, limit, storage: false };
  const key = `consultation-limit:${todayUTC()}:${clientId(request)}`;
  const used = await readNumber(env.QILY_STATS, key);
  if (used >= limit) return { allowed: false, used, limit, storage: true };
  return { allowed: true, used: await increment(env.QILY_STATS, key, 60 * 60 * 48), limit, storage: true };
}

async function checkBriefFeedbackRateLimit(request, env) {
  const limit = Math.max(1, Number(env.BRIEF_FEEDBACK_DAILY_IP_LIMIT || 30));
  if (!env.QILY_STATS) return { allowed: false, used: 0, limit, storage: false };
  const key = `brief-feedback-limit:${todayUTC()}:${clientId(request)}`;
  const used = await readNumber(env.QILY_STATS, key);
  if (used >= limit) return { allowed: false, used, limit, storage: true };
  return { allowed: true, used: await increment(env.QILY_STATS, key, 60 * 60 * 48), limit, storage: true };
}

async function checkTtsRateLimit(request, env) {
  const limit = Math.max(1, Number(env.DAILY_TTS_LIMIT || 60));
  if (!env.QILY_STATS) return { allowed: true, used: 0, limit, storage: false };
  const key = `tts-limit:${todayUTC()}:${clientId(request)}`;
  const used = await readNumber(env.QILY_STATS, key);
  if (used >= limit) return { allowed: false, used, limit, storage: true };
  return { allowed: true, used: await increment(env.QILY_STATS, key, 60 * 60 * 48), limit, storage: true };
}

function isAdmin(request, env) {
  return Boolean(env.ADMIN_TOKEN) && (request.headers.get('Authorization') || '') === `Bearer ${env.ADMIN_TOKEN}`;
}

function providerConfig(env) {
  const requested = String(env.AI_PROVIDER || '').toLowerCase();
  if (requested === 'openai') return { provider: 'openai', model: env.OPENAI_MODEL || 'gpt-5-mini', configured: Boolean(env.OPENAI_API_KEY) };
  if (requested === 'qwen' || requested === 'dashscope') return { provider: 'qwen', model: env.QWEN_MODEL || 'qwen-plus', configured: Boolean(env.DASHSCOPE_API_KEY) };
  if (env.DASHSCOPE_API_KEY) return { provider: 'qwen', model: env.QWEN_MODEL || 'qwen-plus', configured: true };
  return { provider: 'openai', model: env.OPENAI_MODEL || 'gpt-5-mini', configured: Boolean(env.OPENAI_API_KEY) };
}

async function adminStatus(env) {
  const day = todayUTC();
  const names = ['requests', 'success', 'errors', 'rate_limited', 'consultations', 'brief_ratings', 'brief_sentiments', 'brief_comments'];
  const today = {}, all = {};
  for (const name of names) {
    today[name] = await readNumber(env.QILY_STATS, `metric:${day}:${name}`);
    all[name] = await readNumber(env.QILY_STATS, `metric:all:${name}`);
  }
  const active = providerConfig(env);
  return {
    ok: true,
    service: 'QilyLean AI',
    build_version: BUILD_VERSION,
    date_utc: day,
    provider: active.provider,
    model: active.model,
    active_provider_configured: active.configured,
    openai_key_configured: Boolean(env.OPENAI_API_KEY),
    qwen_key_configured: Boolean(env.DASHSCOPE_API_KEY),
    max_output_tokens: Number(env.MAX_OUTPUT_TOKENS || 1400),
    daily_ip_limit: Number(env.DAILY_IP_LIMIT || 20),
    consultation_daily_ip_limit: Number(env.CONSULTATION_DAILY_IP_LIMIT || 5),
    brief_feedback_daily_ip_limit: Number(env.BRIEF_FEEDBACK_DAILY_IP_LIMIT || 30),
    consultation_receiver: CONSULTATION_RECEIVER,
    consultation_email_binding: Boolean(env.CONSULTATION_EMAIL),
    admin_token_configured: Boolean(env.ADMIN_TOKEN),
    statistics_storage: env.QILY_STATS ? 'enabled' : 'not_bound',
    today,
    all_time: all
  };
}

function normalizeConsultation(payload, request) {
  return {
    id: crypto.randomUUID(),
    submitted_at: new Date().toISOString(),
    status: 'new',
    company: clean(payload.company, 120),
    industry: clean(payload.industry, 120),
    location: clean(payload.location, 120),
    scale: clean(payload.scale, 160),
    problem: clean(payload.problem, 1800),
    target: clean(payload.target, 1200),
    timing: clean(payload.timing, 80),
    contact: clean(payload.contact, 180),
    source_page: clean(payload.source_page || request.headers.get('Referer') || '', 300),
    source_brief: clean(payload.source_brief, 300)
  };
}

function validateConsultation(record) {
  const required = ['company', 'industry', 'location', 'problem', 'contact'];
  const missing = required.filter((field) => !record[field]);
  if (missing.length) return `Missing required fields: ${missing.join(', ')}`;
  if (record.problem.length < 8) return 'Problem description is too short';
  return '';
}

function consultationText(record) {
  if (record.industry === '今日简报留言交流') {
    return [
      '【QilyLean 今日简报留言】',
      `提交时间：${record.submitted_at}`,
      `留言人称谓：${record.company}`,
      `联系方式：${record.contact}`,
      `来源简报：${record.source_brief || record.timing || '未标注'}`,
      `留言内容：${record.problem.replace(/^来源简报：[^\n]*\n留言内容：/, '').trim()}`,
      `来源页面：${record.source_page || '未标注'}`,
      `留言编号：${record.id}`
    ].join('\n');
  }
  return [
    '【QilyLean 企业问题诊断卡】',
    `提交时间：${record.submitted_at}`,
    `企业名称：${record.company}`,
    `行业：${record.industry}`,
    `所在地区：${record.location}`,
    `企业／产线规模：${record.scale || '未填写'}`,
    `当前主要问题：${record.problem}`,
    `希望达到的目标：${record.target || '未填写'}`,
    `计划启动时间：${record.timing || '未填写'}`,
    `联系人及电话：${record.contact}`,
    `咨询编号：${record.id}`
  ].join('\n');
}

async function sendConsultationEmail(record, env) {
  if (!env.CONSULTATION_EMAIL) return false;
  const isBriefMessage = record.industry === '今日简报留言交流';
  const subject = isBriefMessage
    ? `【QilyLean今日简报留言】${record.company}｜${record.source_brief || record.timing || '来源待核'}`
    : `【QilyLean新咨询】${record.company}｜${record.industry}`;
  const text = consultationText(record);
  const rows = (isBriefMessage ? [
    ['留言人称谓', record.company], ['联系方式', record.contact],
    ['来源简报', record.source_brief || record.timing || '未标注'],
    ['留言内容', record.problem.replace(/^来源简报：[^\n]*\n留言内容：/, '').trim()],
    ['来源页面', record.source_page || '未标注'], ['留言编号', record.id]
  ] : [
    ['企业名称', record.company], ['行业', record.industry], ['所在地区', record.location],
    ['企业／产线规模', record.scale || '未填写'], ['当前主要问题', record.problem],
    ['希望达到的目标', record.target || '未填写'], ['计划启动时间', record.timing || '未填写'],
    ['联系人及电话', record.contact], ['咨询编号', record.id]
  ]).map(([label, value]) => `<tr><th style="text-align:left;padding:8px;border:1px solid #d5e4e3;background:#eef7f5">${escapeHtml(label)}</th><td style="padding:8px;border:1px solid #d5e4e3">${escapeHtml(value)}</td></tr>`).join('');
  try {
    await env.CONSULTATION_EMAIL.send({
      to: CONSULTATION_RECEIVER,
      from: env.CONSULTATION_FROM || 'consultation@qilylean.com',
      subject,
      text,
      html: `<h2 style="color:#0f4b5a">${isBriefMessage ? 'QilyLean 今日简报留言' : 'QilyLean 企业问题诊断卡'}</h2><p>提交时间：${escapeHtml(record.submitted_at)}</p><table style="border-collapse:collapse;width:100%;max-width:720px">${rows}</table>`
    });
    return true;
  } catch (error) {
    console.error('consultation email failed', error && error.message ? error.message : String(error));
    return false;
  }
}

async function saveConsultation(record, env) {
  if (!env.QILY_STATS) throw new Error('consultation_storage_not_bound');
  const key = `consultation:${record.submitted_at}:${record.id}`;
  await env.QILY_STATS.put(key, JSON.stringify({ ...record, key }));
  return key;
}

async function listConsultations(env, limit) {
  if (!env.QILY_STATS) return [];
  const listed = await env.QILY_STATS.list({ prefix: 'consultation:', limit: Math.min(Math.max(limit || 50, 1), 100) });
  const keys = listed.keys.map((item) => item.name).sort().reverse();
  const values = await Promise.all(keys.map((key) => env.QILY_STATS.get(key, 'json')));
  return values.filter(Boolean);
}

async function updateConsultationStatus(payload, env) {
  const key = clean(payload.key, 300);
  const status = clean(payload.status, 30);
  if (!key.startsWith('consultation:') || !CONSULTATION_STATUSES.has(status)) return null;
  const current = await env.QILY_STATS.get(key, 'json');
  if (!current) return null;
  const updated = { ...current, status, updated_at: new Date().toISOString() };
  await env.QILY_STATS.put(key, JSON.stringify(updated));
  return updated;
}

function normalizeBriefDate(value) {
  const date = clean(value, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : '';
}

function emptyBriefSummary(date, title = '', url = '') {
  return {
    brief_date: date,
    brief_title: title,
    brief_url: url,
    rating_sum: 0,
    rating_count: 0,
    likes: 0,
    dislikes: 0,
    updated_at: ''
  };
}

function publicBriefSummary(summary) {
  const ratingCount = Math.max(0, Number(summary.rating_count || 0));
  const ratingSum = Math.max(0, Number(summary.rating_sum || 0));
  return {
    brief_date: summary.brief_date || '',
    brief_title: summary.brief_title || '',
    brief_url: summary.brief_url || '',
    rating_average: ratingCount ? Math.round((ratingSum / ratingCount) * 10) / 10 : 0,
    rating_count: ratingCount,
    likes: Math.max(0, Number(summary.likes || 0)),
    dislikes: Math.max(0, Number(summary.dislikes || 0)),
    updated_at: summary.updated_at || ''
  };
}

async function briefVoterKey(request, briefDate, action, clientToken) {
  const raw = `${clientId(request)}|${briefDate}|${action}|${clientToken}`;
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(raw));
  const hash = Array.from(new Uint8Array(digest)).map((value) => value.toString(16).padStart(2, '0')).join('');
  return `brief-feedback-voter:${briefDate}:${action}:${hash}`;
}

async function getBriefSummary(env, briefDate) {
  if (!env.QILY_STATS) return emptyBriefSummary(briefDate);
  return (await env.QILY_STATS.get(`brief-feedback:summary:${briefDate}`, 'json')) || emptyBriefSummary(briefDate);
}

async function saveBriefFeedback(payload, request, env) {
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

  const rate = await checkBriefFeedbackRateLimit(request, env);
  if (!rate.allowed) return { error: rate.storage ? 'Brief feedback submission limit reached' : 'Brief feedback storage is not configured', status: rate.storage ? 429 : 503 };

  const voterKey = await briefVoterKey(request, briefDate, action, clientToken);
  const existingVote = await env.QILY_STATS.get(voterKey);
  if (existingVote) {
    return { duplicate: true, summary: publicBriefSummary(await getBriefSummary(env, briefDate)) };
  }

  const summary = await getBriefSummary(env, briefDate);
  summary.brief_date = briefDate;
  summary.brief_title = briefTitle;
  summary.brief_url = briefUrl;
  if (action === 'rating') {
    summary.rating_sum = Number(summary.rating_sum || 0) + value;
    summary.rating_count = Number(summary.rating_count || 0) + 1;
  } else if (value === 'good') {
    summary.likes = Number(summary.likes || 0) + 1;
  } else {
    summary.dislikes = Number(summary.dislikes || 0) + 1;
  }
  summary.updated_at = new Date().toISOString();
  await Promise.all([
    env.QILY_STATS.put(`brief-feedback:summary:${briefDate}`, JSON.stringify(summary)),
    env.QILY_STATS.put(voterKey, String(value), { expirationTtl: 60 * 60 * 24 * 400 }),
    recordMetric(env, action === 'rating' ? 'brief_ratings' : 'brief_sentiments')
  ]);
  return { duplicate: false, summary: publicBriefSummary(summary) };
}

async function listBriefFeedback(env, limit) {
  if (!env.QILY_STATS) return [];
  const listed = await env.QILY_STATS.list({ prefix: 'brief-feedback:summary:', limit: Math.min(Math.max(limit || 100, 1), 1000) });
  const values = await Promise.all(listed.keys.map((item) => env.QILY_STATS.get(item.name, 'json')));
  return values.filter(Boolean).map(publicBriefSummary).sort((a, b) => {
    const interactionsA = a.rating_count + a.likes + a.dislikes;
    const interactionsB = b.rating_count + b.likes + b.dislikes;
    return interactionsB - interactionsA || String(b.updated_at).localeCompare(String(a.updated_at));
  });
}

function safeUpstreamError(provider, data, status, requestId) {
  const error = data && data.error ? data.error : {};
  return {
    error: 'AI service request failed',
    provider,
    upstream_status: status,
    upstream_code: error.code || data.code || 'unknown',
    upstream_type: error.type || 'unknown',
    request_id: requestId || undefined
  };
}

async function callOpenAI(message, previousResponseId, env, signal) {
  const body = {
    model: env.OPENAI_MODEL || 'gpt-5-mini',
    instructions: SYSTEM_INSTRUCTIONS,
    input: message,
    max_output_tokens: Number(env.MAX_OUTPUT_TOKENS || 1400)
  };
  if (previousResponseId) body.previous_response_id = previousResponseId;
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body), signal
  });
  const data = await response.json();
  const requestId = response.headers.get('x-request-id') || '';
  if (!response.ok) throw { provider: 'openai', status: response.status, data, requestId };
  return {
    answer: data.output_text || extractText(data.output) || '暂未生成有效回答。',
    response_id: data.id,
    usage: data.usage,
    provider: 'openai',
    model: body.model,
    build_version: BUILD_VERSION
  };
}

async function callQwenText(message, env, signal) {
  const model = env.QWEN_MODEL || 'qwen-plus';
  const response = await fetch('https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', {
    method: 'POST',
    headers: { ...qwenHeaders(env), 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: SYSTEM_INSTRUCTIONS },
        { role: 'user', content: message }
      ],
      max_tokens: Number(env.MAX_OUTPUT_TOKENS || 1400),
      temperature: 0.35
    }),
    signal
  });
  const data = await response.json();
  const requestId = response.headers.get('x-request-id') || data.request_id || '';
  if (!response.ok) throw qwenError('qwen', response.status, data, requestId);
  return {
    answer: data.choices?.[0]?.message?.content || '暂未生成有效回答。',
    response_id: null,
    usage: data.usage,
    provider: 'qwen',
    model,
    build_version: BUILD_VERSION
  };
}

async function callQwenTts(text, gender, env, signal) {
  const voice = gender === 'male' ? 'Neil' : 'Cherry';
  const model = env.QWEN_TTS_MODEL || 'qwen3-tts-flash';
  const response = await fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation', {
    method: 'POST',
    headers: { ...qwenHeaders(env), 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      input: { text, voice, language_type: 'Chinese' }
    }),
    signal
  });
  const data = await response.json();
  const requestId = response.headers.get('x-request-id') || data.request_id || '';
  if (!response.ok || data.code) throw qwenError('qwen-tts', response.status || 502, data, requestId);
  const audio = data.output && data.output.audio ? data.output.audio : {};
  if (audio.data) {
    const raw = atob(String(audio.data).replace(/^data:[^,]+,/, ''));
    const bytes = new Uint8Array(raw.length);
    for (let index = 0; index < raw.length; index += 1) bytes[index] = raw.charCodeAt(index);
    return { bytes, contentType: 'audio/wav', voice, model };
  }
  if (!audio.url) throw qwenError('qwen-tts', 502, data, requestId);
  const audioResponse = await fetch(audio.url, { signal });
  if (!audioResponse.ok) throw qwenError('qwen-tts-audio', audioResponse.status, {}, requestId);
  return {
    bytes: await audioResponse.arrayBuffer(),
    contentType: audioResponse.headers.get('Content-Type') || 'audio/wav',
    voice,
    model
  };
}

function audio(body, contentType, origin, voice) {
  return new Response(body, {
    status: 200,
    headers: {
      ...cors(origin),
      'Content-Type': contentType || 'audio/wav',
      'Content-Disposition': 'inline',
      'Cache-Control': 'private, max-age=300',
      'X-QilyLean-Voice': voice || ''
    }
  });
}

function mediaPart(attachment) {
  if (attachment.kind === 'image') {
    return { type: 'image_url', image_url: { url: attachment.data } };
  }
  if (attachment.kind === 'video') {
    return { type: 'video_url', video_url: { url: attachment.data }, fps: 1 };
  }
  const format = attachment.extension === 'm4a' ? 'mp4' : (attachment.extension || 'mp3');
  return { type: 'input_audio', input_audio: { data: attachment.data, format } };
}

function extractStreamAnswer(raw) {
  const parts = [];
  let usage = null;
  for (const line of String(raw || '').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed.startsWith('data:')) continue;
    const payload = trimmed.slice(5).trim();
    if (!payload || payload === '[DONE]') continue;
    const item = parseJsonText(payload);
    if (item.usage) usage = item.usage;
    const value = item.choices?.[0]?.delta?.content;
    if (typeof value === 'string') parts.push(value);
    else if (Array.isArray(value)) {
      for (const block of value) if (typeof block?.text === 'string') parts.push(block.text);
    }
  }
  if (!parts.length) {
    const data = parseJsonText(raw);
    const value = data.choices?.[0]?.message?.content;
    if (typeof value === 'string') parts.push(value);
    else if (Array.isArray(value)) {
      for (const block of value) if (typeof block?.text === 'string') parts.push(block.text);
    }
    usage = usage || data.usage || null;
  }
  return { answer: parts.join('').trim(), usage };
}

async function callQwenMedia(message, attachments, env, signal) {
  const model = env.QWEN_MULTIMODAL_MODEL || 'qwen3.5-omni-plus';
  const response = await fetch('https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', {
    method: 'POST',
    headers: { ...qwenHeaders(env), 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages: [{
        role: 'user',
        content: [
          ...attachments.map(mediaPart),
          { type: 'text', text: `${SYSTEM_INSTRUCTIONS}\n\n用户的分析要求：${message}` }
        ]
      }],
      modalities: ['text'],
      stream: true,
      stream_options: { include_usage: true },
      max_tokens: Number(env.MAX_OUTPUT_TOKENS || 1400)
    }),
    signal
  });
  const raw = await response.text();
  const requestId = response.headers.get('x-request-id') || '';
  if (!response.ok) throw qwenError('qwen', response.status, parseJsonText(raw), requestId);
  const parsed = extractStreamAnswer(raw);
  return {
    answer: parsed.answer || '暂未生成有效回答。',
    response_id: null,
    usage: parsed.usage,
    provider: 'qwen',
    model,
    build_version: BUILD_VERSION
  };
}

async function uploadQwenDocument(attachment, env, signal) {
  const binary = atob(attachment.base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  const form = new FormData();
  form.append('file', new Blob([bytes], { type: attachment.mime }), attachment.name);
  form.append('purpose', 'file-extract');
  const response = await fetch('https://dashscope.aliyuncs.com/compatible-mode/v1/files', {
    method: 'POST',
    headers: qwenHeaders(env),
    body: form,
    signal
  });
  const data = await response.json();
  const requestId = response.headers.get('x-request-id') || data.request_id || '';
  if (!response.ok) throw qwenError('qwen', response.status, data, requestId);
  const fileId = data.id || data.data?.uploaded_files?.[0]?.file_id;
  if (!fileId) throw qwenError('qwen', 502, data, requestId);
  return { fileId, status: data.status || 'uploaded' };
}

async function waitForQwenDocument(fileId, initialStatus, env, signal) {
  let current = initialStatus;
  for (let attempt = 0; attempt < 6 && current !== 'processed'; attempt += 1) {
    if (signal.aborted) throw new DOMException('Aborted', 'AbortError');
    await delay(900 + attempt * 300);
    const response = await fetch(`https://dashscope.aliyuncs.com/compatible-mode/v1/files/${encodeURIComponent(fileId)}`, {
      headers: qwenHeaders(env),
      signal
    });
    const data = await response.json();
    if (!response.ok) throw qwenError('qwen', response.status, data, response.headers.get('x-request-id') || '');
    current = data.status || current;
    if (current === 'error') throw qwenError('qwen', 422, data, data.request_id || '');
  }
  return current;
}

async function deleteQwenDocument(fileId, env) {
  try {
    await fetch(`https://dashscope.aliyuncs.com/compatible-mode/v1/files/${encodeURIComponent(fileId)}`, {
      method: 'DELETE',
      headers: qwenHeaders(env)
    });
  } catch (error) {
    console.error('temporary document cleanup failed', error && error.message ? error.message : String(error));
  }
}

async function callQwenDocument(message, attachments, env, signal) {
  const model = env.QWEN_DOCUMENT_MODEL || 'qwen-long';
  const fileIds = [];
  try {
    for (const attachment of attachments) {
      const uploaded = await uploadQwenDocument(attachment, env, signal);
      fileIds.push(uploaded.fileId);
      await waitForQwenDocument(uploaded.fileId, uploaded.status, env, signal);
    }
    const response = await fetch('https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', {
      method: 'POST',
      headers: { ...qwenHeaders(env), 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: SYSTEM_INSTRUCTIONS },
          ...fileIds.map((fileId) => ({ role: 'system', content: `fileid://${fileId}` })),
          { role: 'user', content: message }
        ],
        max_tokens: Number(env.MAX_OUTPUT_TOKENS || 1400),
        temperature: 0.25
      }),
      signal
    });
    const data = await response.json();
    const requestId = response.headers.get('x-request-id') || data.request_id || '';
    if (!response.ok) throw qwenError('qwen', response.status, data, requestId);
    return {
      answer: data.choices?.[0]?.message?.content || '暂未生成有效回答。',
      response_id: null,
      usage: data.usage,
      provider: 'qwen',
      model,
      build_version: BUILD_VERSION
    };
  } finally {
    await Promise.all(fileIds.map((fileId) => deleteQwenDocument(fileId, env)));
  }
}

async function callQwenMixed(message, documents, media, env, signal) {
  const [documentResult, mediaResult] = await Promise.all([
    callQwenDocument(`请分析文档素材，并围绕用户要求给出结论：${message}`, documents, env, signal),
    callQwenMedia(`请分析图片、视频或语音素材，并围绕用户要求给出结论：${message}`, media, env, signal)
  ]);
  const synthesis = await callQwenText(
    `请综合以下两组素材分析结果，直接回答用户要求。需要指出素材之间的一致、互补或冲突信息，并给出可执行建议。\n\n用户要求：${message}\n\n文档素材分析：\n${documentResult.answer}\n\n多媒体素材分析：\n${mediaResult.answer}`,
    env,
    signal
  );
  return {
    ...synthesis,
    provider: 'qwen',
    model: `${documentResult.model}+${mediaResult.model}+${synthesis.model}`,
    build_version: BUILD_VERSION
  };
}

async function callQwen(message, attachments, env, signal) {
  if (!attachments.length) return callQwenText(message, env, signal);
  const documents = attachments.filter((attachment) => attachment.kind === 'document');
  const media = attachments.filter((attachment) => attachment.kind !== 'document');
  if (documents.length && media.length) return callQwenMixed(message, documents, media, env, signal);
  if (documents.length) return callQwenDocument(message, documents, env, signal);
  return callQwenMedia(message, media, env, signal);
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const url = new URL(request.url);
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors(origin) });

    if (request.method === 'GET' && url.pathname === '/health') {
      const active = providerConfig(env);
      return json({
        ok: true,
        service: 'QilyLean AI',
        build_version: BUILD_VERSION,
        provider: active.provider,
        model: active.model,
        key_configured: active.configured,
        openai_available: Boolean(env.OPENAI_API_KEY),
        qwen_available: Boolean(env.DASHSCOPE_API_KEY),
        statistics: env.QILY_STATS ? 'enabled' : 'not_bound',
        consultation_storage: env.QILY_STATS ? 'enabled' : 'not_bound',
        consultation_email_binding: Boolean(env.CONSULTATION_EMAIL)
      }, 200, origin);
    }

    if (request.method === 'GET' && url.pathname === '/admin/status') {
      if (!isAdmin(request, env)) return json({ error: 'Unauthorized' }, 401, origin);
      return json(await adminStatus(env), 200, origin);
    }

    if (request.method === 'GET' && url.pathname === '/admin/consultations') {
      if (!isAdmin(request, env)) return json({ error: 'Unauthorized' }, 401, origin);
      const consultations = await listConsultations(env, Number(url.searchParams.get('limit') || 50));
      return json({ ok: true, consultations }, 200, origin);
    }

    if (request.method === 'GET' && url.pathname === '/admin/brief-feedback') {
      if (!isAdmin(request, env)) return json({ error: 'Unauthorized' }, 401, origin);
      const feedback = await listBriefFeedback(env, Number(url.searchParams.get('limit') || 100));
      return json({ ok: true, feedback }, 200, origin);
    }

    if (request.method === 'POST' && url.pathname === '/admin/consultations/status') {
      if (!isAdmin(request, env)) return json({ error: 'Unauthorized' }, 401, origin);
      if (!env.QILY_STATS) return json({ error: 'Consultation storage is not configured' }, 503, origin);
      let payload;
      try { payload = await request.json(); } catch { return json({ error: 'Invalid JSON' }, 400, origin); }
      const updated = await updateConsultationStatus(payload, env);
      if (!updated) return json({ error: 'Consultation not found or invalid status' }, 404, origin);
      return json({ ok: true, consultation: updated }, 200, origin);
    }

    if (request.method === 'POST' && url.pathname === '/consultations') {
      if (!ALLOWED_ORIGINS.has(origin)) return json({ error: 'Origin not allowed' }, 403, origin);
      const rate = await checkConsultationRateLimit(request, env);
      if (!rate.allowed) return json({ error: 'Consultation submission limit reached', limit: rate.limit }, 429, origin);
      let payload;
      try { payload = await request.json(); } catch { return json({ error: 'Invalid JSON' }, 400, origin); }
      if (clean(payload.website, 120)) return json({ ok: true, ignored: true }, 200, origin);
      const record = normalizeConsultation(payload, request);
      const validationError = validateConsultation(record);
      if (validationError) return json({ error: validationError }, 400, origin);
      try {
        const key = await saveConsultation(record, env);
        const emailSent = await sendConsultationEmail(record, env);
        await recordMetric(env, 'consultations');
        if (record.industry === '今日简报留言交流') await recordMetric(env, 'brief_comments');
        return json({ ok: true, id: record.id, key, email_sent: emailSent, receiver: CONSULTATION_RECEIVER }, 201, origin);
      } catch (error) {
        console.error('consultation save failed', error && error.message ? error.message : String(error));
        return json({ error: 'Consultation service unavailable', diagnostic: error && error.message ? error.message : 'unknown' }, 503, origin);
      }
    }

    if (request.method === 'GET' && url.pathname === '/brief-feedback') {
      const briefDate = normalizeBriefDate(url.searchParams.get('brief'));
      if (!briefDate) return json({ error: 'Brief date is invalid' }, 400, origin);
      return json(publicBriefSummary(await getBriefSummary(env, briefDate)), 200, origin);
    }

    if (request.method === 'POST' && url.pathname === '/brief-feedback') {
      if (!ALLOWED_ORIGINS.has(origin)) return json({ error: 'Origin not allowed' }, 403, origin);
      let payload;
      try { payload = await request.json(); } catch { return json({ error: 'Invalid JSON' }, 400, origin); }
      const result = await saveBriefFeedback(payload, request, env);
      if (result.error) return json({ error: result.error }, result.status || 400, origin);
      return json({ ok: true, duplicate: result.duplicate, summary: result.summary }, result.duplicate ? 200 : 201, origin);
    }

    if (request.method === 'POST' && url.pathname === '/tts') {
      if (!ALLOWED_ORIGINS.has(origin)) return json({ error: 'Origin not allowed' }, 403, origin);
      if (!env.DASHSCOPE_API_KEY) return json({ error: 'Speech service is not configured' }, 503, origin);
      const rate = await checkTtsRateLimit(request, env);
      if (!rate.allowed) return json({ error: 'Daily speech limit reached', limit: rate.limit }, 429, origin);
      let payload;
      try { payload = await request.json(); } catch { return json({ error: 'Invalid JSON' }, 400, origin); }
      const text = clean(payload.text, 420);
      const gender = payload.gender === 'male' ? 'male' : 'female';
      if (!text) return json({ error: 'Text is required' }, 400, origin);
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 35000);
      try {
        const result = await callQwenTts(text, gender, env, controller.signal);
        return audio(result.bytes, result.contentType, origin, result.voice);
      } catch (error) {
        if (error && typeof error.status === 'number') {
          console.error('qwen tts error', JSON.stringify({ status: error.status, request_id: error.requestId || '' }));
          return json(safeUpstreamError(error.provider, error.data, error.status, error.requestId), 502, origin);
        }
        const message = error && error.name === 'AbortError' ? 'Speech request timed out' : 'Speech service unavailable';
        return json({ error: message }, 504, origin);
      } finally {
        clearTimeout(timeout);
      }
    }

    if (request.method !== 'POST' || url.pathname !== '/chat') return json({ error: 'Not found' }, 404, origin);
    if (!ALLOWED_ORIGINS.has(origin)) return json({ error: 'Origin not allowed' }, 403, origin);

    const active = providerConfig(env);
    if (!active.configured) return json({ error: 'AI service is not configured', diagnostic: `missing_${active.provider}_api_key` }, 503, origin);

    const rate = await checkRateLimit(request, env);
    if (!rate.allowed) {
      await recordMetric(env, 'rate_limited');
      return json({ error: 'Daily question limit reached', limit: rate.limit }, 429, origin);
    }
    await recordMetric(env, 'requests');

    let payload;
    try { payload = await request.json(); }
    catch {
      await recordMetric(env, 'errors');
      return json({ error: 'Invalid JSON' }, 400, origin);
    }

    const message = String(payload.message || '').trim();
    const previousResponseId = payload.previous_response_id ? String(payload.previous_response_id) : undefined;
    const checkedAttachments = validateAttachments(payload.attachments, payload.attachment);
    if (checkedAttachments.error) return json({ error: checkedAttachments.error }, checkedAttachments.status, origin);
    const attachments = checkedAttachments.attachments;
    if (!message) return json({ error: 'Message is required' }, 400, origin);
    if (message.length > 3000) return json({ error: 'Message is too long' }, 413, origin);
    if (attachments.length && !env.DASHSCOPE_API_KEY) return json({ error: 'Attachment analysis is unavailable' }, 503, origin);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), attachments.length ? 118000 : 45000);
    try {
      const result = attachments.length || active.provider === 'qwen'
        ? await callQwen(message, attachments, env, controller.signal)
        : await callOpenAI(message, previousResponseId, env, controller.signal);
      await recordMetric(env, 'success');
      return json({ ...result, rate_limit: { used: rate.used, limit: rate.limit } }, 200, origin);
    } catch (error) {
      await recordMetric(env, 'errors');
      if (error && typeof error.status === 'number') {
        console.error(`${error.provider} error`, JSON.stringify({ status: error.status, request_id: error.requestId || '' }));
        return json(safeUpstreamError(error.provider, error.data, error.status, error.requestId), 502, origin);
      }
      const msg = error && error.name === 'AbortError' ? 'AI request timed out' : 'AI service unavailable';
      return json({ error: msg, diagnostic: error && error.name ? error.name : 'unknown' }, 504, origin);
    } finally {
      clearTimeout(timeout);
    }
  }
};

function extractText(output) {
  if (!Array.isArray(output)) return '';
  const parts = [];
  for (const item of output) {
    if (!Array.isArray(item.content)) continue;
    for (const c of item.content) if (typeof c.text === 'string') parts.push(c.text);
  }
  return parts.join('\n').trim();
}
