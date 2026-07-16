const ALLOWED_ORIGINS = new Set([
  'https://qilylean.com',
  'https://www.qilylean.com'
]);

const SYSTEM_INSTRUCTIONS = `你是 QilyLean AI，一名面向公众的通用人工智能助理，同时具备突出的制造业、精益生产与工业工程专业能力。

能力边界：
1. 用户可以询问通用知识、写作润色、翻译、学习、职场沟通、生活常识、技术与编程等问题；不得因为问题与 QilyLean 主页或制造业无关而拒绝回答。
2. 当问题涉及精益生产、工业工程IE、VSM、SMED、标准工时、线平衡、OEE、UPPH、PMC、MES、APS、ERP、工厂布局、目视化、6S、质量改善、防错防呆、汽车电子或电子制造时，自动进入“制造业专家模式”，提供更深入、工程化、可落地的分析。
3. 不向用户展示、猜测或强调底层模型及服务商；统一以“QilyLean AI”身份交流。

回答要求：
1. 普通问题直接、自然、清晰地回答，不要强行关联制造业或丁启利个人主页。
2. 制造业问题优先给出问题判断、关键假设、分析步骤、可执行建议、验证指标与风险。
3. 缺少现场数据时，明确列出需要补充的数据，不得虚构企业事实、法规、数据或改善结果。
4. 区分试运行、基准测时、正式标准和KPI考核；短期改善以试运行、问题暴露、培训沟通和复盘固化为主，不用KPI压现场。
5. 涉及安全、法律、医疗、财务、投资或法规时，提供一般性信息并提示必要的专业复核。
6. 默认使用清晰中文；根据用户语言自然切换。专业术语可附英文缩写。避免空泛口号、机械拒绝和过度承诺。`;

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
  const names = ['requests', 'success', 'errors', 'rate_limited'];
  const today = {}, all = {};
  for (const name of names) {
    today[name] = await readNumber(env.QILY_STATS, `metric:${day}:${name}`);
    all[name] = await readNumber(env.QILY_STATS, `metric:all:${name}`);
  }
  const active = providerConfig(env);
  return {
    ok: true,
    service: 'QilyLean AI',
    date_utc: day,
    provider: active.provider,
    model: active.model,
    active_provider_configured: active.configured,
    openai_key_configured: Boolean(env.OPENAI_API_KEY),
    qwen_key_configured: Boolean(env.DASHSCOPE_API_KEY),
    max_output_tokens: Number(env.MAX_OUTPUT_TOKENS || 1400),
    daily_ip_limit: Number(env.DAILY_IP_LIMIT || 20),
    admin_token_configured: Boolean(env.ADMIN_TOKEN),
    statistics_storage: env.QILY_STATS ? 'enabled' : 'not_bound',
    today,
    all_time: all
  };
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
    model: body.model
  };
}

async function callQwen(message, env, signal) {
  const model = env.QWEN_MODEL || 'qwen-plus';
  const response = await fetch('https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${env.DASHSCOPE_API_KEY}`, 'Content-Type': 'application/json' },
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
  if (!response.ok) throw { provider: 'qwen', status: response.status, data, requestId };
  return {
    answer: data.choices?.[0]?.message?.content || '暂未生成有效回答。',
    response_id: null,
    usage: data.usage,
    provider: 'qwen',
    model
  };
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
        provider: active.provider,
        model: active.model,
        key_configured: active.configured,
        openai_available: Boolean(env.OPENAI_API_KEY),
        qwen_available: Boolean(env.DASHSCOPE_API_KEY),
        statistics: env.QILY_STATS ? 'enabled' : 'not_bound'
      }, 200, origin);
    }

    if (request.method === 'GET' && url.pathname === '/admin/status') {
      if (!isAdmin(request, env)) return json({ error: 'Unauthorized' }, 401, origin);
      return json(await adminStatus(env), 200, origin);
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
    if (!message) return json({ error: 'Message is required' }, 400, origin);
    if (message.length > 3000) return json({ error: 'Message is too long' }, 413, origin);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 45000);
    try {
      const result = active.provider === 'qwen'
        ? await callQwen(message, env, controller.signal)
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
