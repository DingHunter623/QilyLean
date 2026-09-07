import { readFile, writeFile, unlink } from 'node:fs/promises';
import { resolve } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const ROOT = resolve('tools/lucky-data/data');
const BASES = [
  process.env.LUCKY_DATA_GATEWAY || 'https://qilylean-lucky-data.dinghunter623.workers.dev',
  'https://api.qilylean.com/lucky-data'
].filter((v, i, a) => v && a.indexOf(v) === i);

const FULL = process.argv.includes('--full');
const PAGE_SIZE = 100;
const MAX_PAGES = FULL ? 120 : 3;
const UA_MOBILE = 'Mozilla/5.0 (Linux; Android 14; Pixel 9 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36';
const UA_DESKTOP = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const GAMES = {
  dlt: { gameName: '超级大乐透', sourceName: '中国体育彩票', sourceHomepage: 'https://www.lottery.gov.cn/', total: 7, source: 'dlt' },
  ssq: { gameName: '中国福利彩票双色球', sourceName: '中国福利彩票', sourceHomepage: 'https://www.cwl.gov.cn/', total: 7, source: 'cwl', cwlName: 'ssq', referer: 'https://www.cwl.gov.cn/ygkj/wqkjgg/ssq/' },
  kl8: { gameName: '中国福利彩票快乐8', sourceName: '中国福利彩票', sourceHomepage: 'https://www.cwl.gov.cn/', total: 20, source: 'cwl', cwlName: 'kl8', referer: 'https://www.cwl.gov.cn/ygkj/wqkjgg/kl8/' },
  fc3d: { gameName: '中国福利彩票福彩3D', sourceName: '中国福利彩票', sourceHomepage: 'https://www.cwl.gov.cn/', total: 3, source: 'cwl', cwlName: '3d', referer: 'https://www.cwl.gov.cn/ygkj/wqkjgg/3d/' }
};

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
function issueNumber(v) { const n = Number(String(v || '').replace(/\D/g, '')); return Number.isFinite(n) ? n : 0; }
function sortRows(a, b) { return issueNumber(b.issue) - issueNumber(a.issue) || String(b.date || '').localeCompare(String(a.date || '')); }
function splitNumbers(v) { return String(v ?? '').trim().split(/[\s,，、;；|/+\-]+/).map(x => String(x).match(/\d+/)?.[0]).filter(Boolean); }
function numberValue(v) { if (v == null || v === '') return null; const n = Number(String(v).replace(/[^0-9.-]/g, '')); return Number.isFinite(n) ? n : null; }
function normalizeDate(v) { const text = String(v || '').trim(); const m = text.match(/(20\d{2})[-/.年](\d{1,2})[-/.月](\d{1,2})/); return m ? `${m[1]}-${String(Number(m[2])).padStart(2,'0')}-${String(Number(m[3])).padStart(2,'0')}` : text.slice(0,10); }
function normalizePrizes(items) {
  if (!Array.isArray(items)) return [];
  return items.map(item => ({
    level: String(item?.type || item?.prizeName || item?.name || item?.level || '').trim(),
    count: numberValue(item?.typenum ?? item?.count ?? item?.stakeCount),
    amount: numberValue(item?.typemoney ?? item?.amount ?? item?.stakeAmount)
  })).filter(x => x.level || x.count != null || x.amount != null);
}
function validRow(game, row) {
  if (!row || !String(row.issue || '').trim()) return false;
  const count = (Array.isArray(row.primary) ? row.primary.length : 0) + (Array.isArray(row.secondary) ? row.secondary.length : 0);
  return count === GAMES[game].total;
}
function dltRows(payload) { if (Array.isArray(payload?.value?.list)) return payload.value.list; if (Array.isArray(payload?.data)) return payload.data; return []; }
function cwlRows(payload) { if (Array.isArray(payload?.result)) return payload.result; if (Array.isArray(payload?.data?.result)) return payload.data.result; if (Array.isArray(payload?.value?.list)) return payload.value.list; return []; }
function normalizeDlt(row) {
  const issue = String(row?.lotteryDrawNum || row?.issue || '').trim();
  const values = splitNumbers(row?.lotteryDrawResult || row?.drawResult || row?.result);
  if (!issue || values.length < 7) return null;
  let officialUrl = String(row?.lotteryDrawUrl || row?.url || '').trim();
  if (officialUrl.startsWith('/')) officialUrl = 'https://www.lottery.gov.cn' + officialUrl;
  return { issue, date: normalizeDate(row?.lotteryDrawTime || row?.date), primary: values.slice(0,5), secondary: values.slice(5,7), sales: numberValue(row?.totalSaleAmount ?? row?.sales), pool: numberValue(row?.poolBalanceAfterdraw ?? row?.poolBalanceAfterDraw ?? row?.pool), prizes: normalizePrizes(row?.prizeLevelList || row?.prizegrades || row?.prizeGrades), officialUrl: officialUrl || 'https://www.lottery.gov.cn/kj/kjlb.html?dlt' };
}
function normalizeCwl(game, row) {
  const issue = String(row?.code || row?.issue || row?.lotteryDrawNum || '').trim();
  if (!issue) return null;
  const red = splitNumbers(row?.red || row?.lotteryDrawResult || row?.result), blue = splitNumbers(row?.blue);
  let primary = [], secondary = [];
  if (game === 'ssq') { primary = red.slice(0,6); secondary = blue.slice(0,1); }
  else if (game === 'kl8') primary = red.slice(0,20);
  else primary = red.slice(0,3);
  if (!primary.length) return null;
  let officialUrl = String(row?.detailsLink || row?.url || row?.detailsUrl || '').trim();
  if (officialUrl.startsWith('/')) officialUrl = 'https://www.cwl.gov.cn' + officialUrl;
  return { issue, date: normalizeDate(row?.date), primary, secondary, sales: numberValue(row?.sales), pool: numberValue(row?.poolmoney ?? row?.poolMoney), prizes: normalizePrizes(row?.prizegrades || row?.prizeGrades), officialUrl: officialUrl || 'https://www.cwl.gov.cn/' };
}

async function curlText(url, headers = [], extra = []) {
  const args = ['-sS', '--compressed', '--connect-timeout', '15', '--max-time', '35', '--retry', '1', '--retry-delay', '1', ...extra, url];
  for (const h of headers) args.push('-H', h);
  try {
    const { stdout } = await execFileAsync('curl', args, { maxBuffer: 30 * 1024 * 1024 });
    return stdout;
  } catch (error) {
    const out = String(error?.stdout || error?.stderr || error?.message || '').slice(0,500);
    throw new Error(`curl failed: ${out}`);
  }
}
function parseJsonText(text, label) {
  const clean = String(text || '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim();
  try { return JSON.parse(clean); } catch {}
  const start = clean.indexOf('{'), end = clean.lastIndexOf('}');
  if (start >= 0 && end > start) { try { return JSON.parse(clean.slice(start, end + 1)); } catch {} }
  throw new Error(`${label} returned non-JSON: ${clean.slice(0,240)}`);
}
async function fetchJson(url, attempts = 3) {
  let last;
  for (let i = 0; i < attempts; i++) {
    try {
      const r = await fetch(url, { headers: { Accept: 'application/json', Origin: 'https://qilylean.com' }, signal: AbortSignal.timeout(25000) });
      const text = await r.text();
      if (!r.ok) throw new Error(`HTTP ${r.status}: ${text.slice(0, 240)}`);
      const json = JSON.parse(text);
      if (!json || json.ok !== true || !Array.isArray(json.rows)) throw new Error(`invalid gateway response: ${text.slice(0, 240)}`);
      return json;
    } catch (error) {
      last = error;
      if (i < attempts - 1) await sleep(1200 * (i + 1));
    }
  }
  throw last;
}
async function readExisting(game) {
  try { return JSON.parse(await readFile(resolve(ROOT, `${game}.json`), 'utf8')); }
  catch { return { draws: [] }; }
}

async function fetchDltCurl(page) {
  const q = new URLSearchParams({ gameNo:'85', provinceId:'0', pageSize:String(PAGE_SIZE), isVerify:'1', pageNo:String(page) });
  const url = 'https://webapi.sporttery.cn/gateway/lottery/getHistoryPageListV1.qry?' + q;
  const variants = [
    [`User-Agent: ${UA_MOBILE}`, 'Accept: application/json, text/plain, */*', 'Accept-Language: zh-CN,zh;q=0.9', 'Referer: https://m.lottery.gov.cn/', 'Cache-Control: no-cache'],
    [`User-Agent: ${UA_DESKTOP}`, 'Accept: application/json, text/plain, */*', 'Accept-Language: zh-CN,zh;q=0.9', 'Referer: https://www.lottery.gov.cn/', 'Cache-Control: no-cache']
  ];
  let last;
  for (const headers of variants) {
    try {
      const text = await curlText(url, headers, ['--http1.1']);
      const payload = parseJsonText(text, '大乐透官方接口');
      const raw = dltRows(payload), rows = raw.map(normalizeDlt).filter(Boolean);
      if (rows.length) return { rows, upstreamCount: raw.length };
      last = new Error('大乐透官方接口返回空记录');
    } catch (error) { last = error; }
  }
  throw last || new Error('大乐透官方接口不可用');
}
async function fetchCwlCurl(game, page) {
  const cfg = GAMES[game];
  const cookie = `/tmp/qilylean-cwl-${process.pid}-${game}.cookies`;
  try {
    try {
      await curlText(cfg.referer, [`User-Agent: ${UA_DESKTOP}`, 'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8', 'Accept-Language: zh-CN,zh;q=0.9'], ['-c', cookie, '--http1.1']);
    } catch (e) { console.warn(`${game} CWL warm-up warning: ${e.message}`); }
    const base = 'https://www.cwl.gov.cn/cwl_admin/front/cwlkj/search/kjxx/findDrawNotice';
    const queries = [
      new URLSearchParams({ name:cfg.cwlName, issueCount:'', issueStart:'', issueEnd:'', dayStart:'', dayEnd:'', pageNo:String(page), pageSize:String(PAGE_SIZE), week:'', systemType:'PC' }),
      new URLSearchParams({ name:cfg.cwlName, issueCount:String(PAGE_SIZE), issueStart:'', issueEnd:'', dayStart:'', dayEnd:'' })
    ];
    let last;
    for (const q of queries) {
      if (page > 1 && q === queries[1]) continue;
      const url = base + '?' + q;
      const headerVariants = [
        [`User-Agent: ${UA_DESKTOP}`, 'Accept: application/json, text/plain, */*', 'Accept-Language: zh-CN,zh;q=0.9', `Referer: ${cfg.referer}`, 'Origin: https://www.cwl.gov.cn', 'X-Requested-With: XMLHttpRequest', 'Sec-Fetch-Dest: empty', 'Sec-Fetch-Mode: cors', 'Sec-Fetch-Site: same-origin', 'Cache-Control: no-cache'],
        [`User-Agent: ${UA_MOBILE}`, 'Accept: application/json, text/plain, */*', 'Accept-Language: zh-CN,zh;q=0.9', 'Referer: https://www.cwl.gov.cn/', 'Cache-Control: no-cache']
      ];
      for (const headers of headerVariants) {
        try {
          const text = await curlText(url, headers, ['-b', cookie, '-c', cookie, '--http1.1']);
          const payload = parseJsonText(text, `${game}官方接口`);
          const raw = cwlRows(payload), rows = raw.map(row => normalizeCwl(game, row)).filter(Boolean);
          if (rows.length) return { rows, upstreamCount: raw.length };
          last = new Error(`${game}官方接口返回空记录`);
        } catch (error) { last = error; }
      }
    }
    throw last || new Error(`${game}官方接口不可用`);
  } finally {
    try { await unlink(cookie); } catch {}
  }
}

async function fetchDirectOfficial(game) {
  const cfg = GAMES[game], rows = [];
  let exhausted = false;
  for (let page = 1; page <= MAX_PAGES; page++) {
    const result = cfg.source === 'dlt' ? await fetchDltCurl(page) : await fetchCwlCurl(game, page);
    const batch = result.rows.filter(row => validRow(game, row));
    if (!batch.length) {
      if (page === 1) throw new Error(`${game}: direct official source returned no valid rows`);
      exhausted = true;
      break;
    }
    rows.push(...batch);
    console.log(`${game} direct official curl page ${page}: ${batch.length} rows`);
    if (Number(result.upstreamCount || 0) < PAGE_SIZE) { exhausted = true; break; }
    if (page < MAX_PAGES) await sleep(2200);
  }
  if (!rows.length) throw new Error(`${game}: direct official curl returned no rows`);
  return { rows, meta:{ sourceName:cfg.sourceName, sourceHomepage:cfg.sourceHomepage, fetchedAt:new Date().toISOString() }, exhausted, base:'direct-official-curl' };
}

async function fetchGame(game) {
  let lastError;
  for (const base of BASES) {
    try {
      const rows = [];
      let meta = null;
      let exhausted = false;
      for (let page = 1; page <= MAX_PAGES; page++) {
        const url = `${base.replace(/\/$/, '')}/draws?game=${encodeURIComponent(game)}&page=${page}&pageSize=${PAGE_SIZE}`;
        const payload = await fetchJson(url);
        meta = payload;
        const batch = payload.rows.filter(row => validRow(game, row));
        if (!batch.length) {
          if (page === 1) throw new Error(`${game}: gateway returned no valid rows`);
          exhausted = true;
          break;
        }
        rows.push(...batch);
        console.log(`${game} ${base} page ${page}: ${batch.length} rows`);
        if (Number(payload.upstreamCount || 0) < PAGE_SIZE) { exhausted = true; break; }
      }
      if (!rows.length) throw new Error(`${game}: no rows captured from ${base}`);
      return { rows, meta, exhausted, base };
    } catch (error) {
      lastError = error;
      console.warn(`${game} gateway failed: ${base}: ${error.message}`);
    }
  }
  try { return await fetchDirectOfficial(game); }
  catch (error) {
    console.warn(`${game} direct official curl failed: ${error.message}`);
    throw lastError ? new Error(`${lastError.message}; curl fallback: ${error.message}`) : error;
  }
}

const failures = [];
for (const game of Object.keys(GAMES)) {
  try {
    const cfg = GAMES[game];
    const existing = await readExisting(game);
    const result = await fetchGame(game);
    const merged = [...result.rows, ...(Array.isArray(existing.draws) ? existing.draws : [])];
    const seen = new Set();
    const draws = merged.filter(row => {
      const issue = String(row?.issue || '').trim();
      if (!issue || seen.has(issue) || !validRow(game, row)) return false;
      seen.add(issue);
      return true;
    }).sort(sortRows);
    const generatedAt = result.meta?.fetchedAt || new Date().toISOString();
    const data = {
      schemaVersion: 1,
      game,
      gameName: cfg.gameName,
      sourceName: result.meta?.sourceName || cfg.sourceName,
      sourceHomepage: result.meta?.sourceHomepage || cfg.sourceHomepage,
      generatedAt,
      recordCount: draws.length,
      historyComplete: FULL ? result.exhausted : Boolean(existing.historyComplete),
      syncWarning: result.exhausted && FULL ? '' : '官方数据由 QilyLean 自动同步；历史期次仍在滚动回填。',
      transport: result.base,
      draws
    };
    await writeFile(resolve(ROOT, `${game}.json`), JSON.stringify(data), 'utf8');
    console.log(`PASS ${game}: ${draws.length} records; latest=${draws[0]?.issue || 'n/a'}; transport=${result.base}; historyComplete=${data.historyComplete}`);
  } catch (error) {
    failures.push(`${game}: ${error.message}`);
    console.error(`ERROR ${game}: ${error.message}`);
  }
}

if (failures.length) throw new Error(`Lucky Data official sync failures: ${failures.join(' | ')}`);
