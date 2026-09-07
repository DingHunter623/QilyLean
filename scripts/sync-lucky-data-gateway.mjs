import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const ROOT = resolve('tools/lucky-data/data');
const BASES = [
  process.env.LUCKY_DATA_GATEWAY || 'https://qilylean-lucky-data.dinghunter623.workers.dev',
  'https://api.qilylean.com/lucky-data'
].filter((v, i, a) => v && a.indexOf(v) === i);

const FULL = process.argv.includes('--full');
const PAGE_SIZE = 100;
const MAX_PAGES = FULL ? 120 : 3;
const GAMES = {
  dlt: { gameName: '超级大乐透', sourceName: '中国体育彩票', sourceHomepage: 'https://www.lottery.gov.cn/', total: 7 },
  ssq: { gameName: '中国福利彩票双色球', sourceName: '中国福利彩票', sourceHomepage: 'https://www.cwl.gov.cn/', total: 7 },
  kl8: { gameName: '中国福利彩票快乐8', sourceName: '中国福利彩票', sourceHomepage: 'https://www.cwl.gov.cn/', total: 20 },
  fc3d: { gameName: '中国福利彩票福彩3D', sourceName: '中国福利彩票', sourceHomepage: 'https://www.cwl.gov.cn/', total: 3 }
};

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
function issueNumber(v) { const n = Number(String(v || '').replace(/\D/g, '')); return Number.isFinite(n) ? n : 0; }
function sortRows(a, b) { return issueNumber(b.issue) - issueNumber(a.issue) || String(b.date || '').localeCompare(String(a.date || '')); }
function validRow(game, row) {
  if (!row || !String(row.issue || '').trim()) return false;
  const count = (Array.isArray(row.primary) ? row.primary.length : 0) + (Array.isArray(row.secondary) ? row.secondary.length : 0);
  return count === GAMES[game].total;
}
async function fetchJson(url, attempts = 4) {
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
      if (i < attempts - 1) await sleep(1800 * (i + 1));
    }
  }
  throw last;
}
async function readExisting(game) {
  try { return JSON.parse(await readFile(resolve(ROOT, `${game}.json`), 'utf8')); }
  catch { return { draws: [] }; }
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
  throw lastError || new Error(`${game}: all gateways unavailable`);
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
      syncWarning: result.exhausted && FULL ? '' : '官方数据经 QilyLean 数据网关持续同步；历史期次仍在滚动回填。',
      gateway: result.base,
      draws
    };
    await writeFile(resolve(ROOT, `${game}.json`), JSON.stringify(data), 'utf8');
    console.log(`PASS ${game}: ${draws.length} records; latest=${draws[0]?.issue || 'n/a'}; historyComplete=${data.historyComplete}`);
  } catch (error) {
    failures.push(`${game}: ${error.message}`);
    console.error(`ERROR ${game}: ${error.message}`);
  }
}

if (failures.length) {
  throw new Error(`Lucky Data gateway sync failures: ${failures.join(' | ')}`);
}
