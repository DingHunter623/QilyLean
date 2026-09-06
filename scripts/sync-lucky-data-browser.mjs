import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const FULL = process.argv.includes('--full');
const LIMIT = FULL ? 10000 : 300;
const PAGE_SIZE = 100;
const root = path.resolve('tools/lucky-data/data');
const GAME_META = {
  dlt:{gameName:'大乐透',sourceName:'中国体育彩票',sourceHomepage:'https://www.lottery.gov.cn/'},
  ssq:{gameName:'双色球',sourceName:'中国福利彩票',sourceHomepage:'https://www.cwl.gov.cn/'},
  kl8:{gameName:'快乐8',sourceName:'中国福利彩票',sourceHomepage:'https://www.cwl.gov.cn/'},
  fc3d:{gameName:'福彩3D',sourceName:'中国福利彩票',sourceHomepage:'https://www.cwl.gov.cn/'}
};
const CWL = {
  ssq:{name:'ssq',referer:'https://www.cwl.gov.cn/ygkj/wqkjgg/ssq/'},
  kl8:{name:'kl8',referer:'https://www.cwl.gov.cn/ygkj/wqkjgg/kl8/'},
  fc3d:{name:'3d',referer:'https://www.cwl.gov.cn/ygkj/wqkjgg/3d/'}
};

const wait = ms => new Promise(r => setTimeout(r, ms));
const nums = value => String(value ?? '').match(/\d+/g) || [];
const num = value => {
  if(value == null || value === '') return null;
  const n = Number(String(value).replace(/[^0-9.-]/g,''));
  return Number.isFinite(n) ? n : null;
};
const dateOnly = value => {
  const m=String(value||'').match(/(20\d{2})[-/.年](\d{1,2})[-/.月](\d{1,2})/);
  return m ? `${m[1]}-${String(+m[2]).padStart(2,'0')}-${String(+m[3]).padStart(2,'0')}` : String(value||'').slice(0,10);
};
const prizes = items => Array.isArray(items) ? items.map(x=>({
  level:String(x?.type||x?.prizeName||x?.name||x?.level||'').trim(),
  count:num(x?.typenum??x?.count??x?.stakeCount),
  amount:num(x?.typemoney??x?.amount??x?.stakeAmount)
})).filter(x=>x.level||x.count!=null||x.amount!=null) : [];

function normalizeDlt(row){
  const issue=String(row?.lotteryDrawNum||'').trim();
  const all=nums(row?.lotteryDrawResult);
  if(!issue||all.length<7)return null;
  return {issue,date:dateOnly(row?.lotteryDrawTime),primary:all.slice(0,5),secondary:all.slice(5,7),sales:num(row?.totalSaleAmount),pool:num(row?.poolBalanceAfterdraw??row?.poolBalanceAfterDraw),prizes:prizes(row?.prizeLevelList),officialUrl:'https://www.lottery.gov.cn/kj/kjlb.html?dlt'};
}
function normalizeCwl(game,row){
  const issue=String(row?.code||'').trim();
  if(!issue)return null;
  const red=nums(row?.red), blue=nums(row?.blue);
  let primary=[],secondary=[];
  if(game==='ssq'){primary=red.slice(0,6);secondary=blue.slice(0,1);}
  else if(game==='kl8') primary=red.slice(0,20);
  else primary=red.slice(0,3);
  const expected=game==='ssq'?7:game==='kl8'?20:3;
  if(primary.length+secondary.length!==expected)return null;
  let officialUrl=String(row?.detailsLink||'').trim();
  if(officialUrl.startsWith('/')) officialUrl='https://www.cwl.gov.cn'+officialUrl;
  return {issue,date:dateOnly(row?.date),primary,secondary,sales:num(row?.sales),pool:num(row?.poolmoney),prizes:prizes(row?.prizegrades),officialUrl:officialUrl||'https://www.cwl.gov.cn/'};
}
function uniqueSort(rows){
  const seen=new Set();
  return rows.filter(r=>r&&r.issue&&!seen.has(r.issue)&&seen.add(r.issue)).sort((a,b)=>String(b.issue).localeCompare(String(a.issue),undefined,{numeric:true}));
}
function writeGame(game,rows,complete){
  rows=uniqueSort(rows).slice(0,LIMIT);
  if(!rows.length) throw new Error(`${game}: no official records`);
  const meta=GAME_META[game];
  const payload={schemaVersion:1,game,gameName:meta.gameName,sourceName:meta.sourceName,sourceHomepage:meta.sourceHomepage,generatedAt:new Date().toISOString(),recordCount:rows.length,historyComplete:Boolean(complete),syncWarning:complete?'':'当前保留最近已同步官方期次；后台继续补齐历史记录。',draws:rows};
  fs.mkdirSync(root,{recursive:true});
  fs.writeFileSync(path.join(root,`${game}.json`),JSON.stringify(payload,null,2)+'\n','utf8');
  console.log(`WROTE ${game}: ${rows.length} records, latest ${rows[0].issue}`);
}

async function cwlFetch(page, game, pageNo){
  const cfg=CWL[game];
  return page.evaluate(async ({name,pageNo,pageSize})=>{
    const q=new URLSearchParams({name,issueCount:'',issueStart:'',issueEnd:'',dayStart:'',dayEnd:'',pageNo:String(pageNo),pageSize:String(pageSize),week:'',systemType:'PC'});
    const r=await fetch('/cwl_admin/front/cwlkj/search/kjxx/findDrawNotice?'+q,{credentials:'include',headers:{Accept:'application/json, text/javascript, */*; q=0.01','X-Requested-With':'XMLHttpRequest'}});
    const text=await r.text();
    if(!r.ok)throw new Error(`HTTP ${r.status}: ${text.slice(0,120)}`);
    return JSON.parse(text);
  },{name:cfg.name,pageNo,pageSize:PAGE_SIZE});
}

async function fetchCwl(browser, game){
  const cfg=CWL[game];
  const context=await browser.newContext({locale:'zh-CN',userAgent:'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36'});
  const page=await context.newPage();
  await page.goto(cfg.referer,{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForTimeout(2500);
  let rows=[];
  for(let p=1;p<=100;p++){
    let payload;
    for(let attempt=1;attempt<=3;attempt++){
      try{ payload=await cwlFetch(page,game,p); break; }
      catch(error){ if(attempt===3)throw error; await page.waitForTimeout(1500*attempt); await page.reload({waitUntil:'domcontentloaded',timeout:60000}).catch(()=>{}); }
    }
    const raw=Array.isArray(payload?.result)?payload.result:[];
    if(!raw.length)break;
    rows.push(...raw.map(r=>normalizeCwl(game,r)).filter(Boolean));
    console.log(`${game} page ${p}: ${raw.length}`);
    if(!FULL && rows.length>=LIMIT)break;
    if(raw.length<PAGE_SIZE)break;
    await page.waitForTimeout(350);
  }
  await context.close();
  return uniqueSort(rows);
}

async function dltBrowserFetch(page,pageNo){
  return page.evaluate(async ({pageNo,pageSize})=>{
    const q=new URLSearchParams({gameNo:'85',provinceId:'0',pageSize:String(pageSize),isVerify:'1',pageNo:String(pageNo)});
    const url='https://webapi.sporttery.cn/gateway/lottery/getHistoryPageListV1.qry?'+q;
    const r=await fetch(url,{credentials:'include',headers:{Accept:'application/json, text/plain, */*'}});
    const text=await r.text();
    if(!r.ok)throw new Error(`HTTP ${r.status}: ${text.slice(0,120)}`);
    const cleaned=text.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g,'').trim();
    return JSON.parse(cleaned);
  },{pageNo,pageSize:PAGE_SIZE});
}
async function fetchDlt(browser){
  const context=await browser.newContext({locale:'zh-CN',userAgent:'Mozilla/5.0 (Linux; Android 14; Pixel 9 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Mobile Safari/537.36'});
  const page=await context.newPage();
  await page.goto('https://m.lottery.gov.cn/zst/dlt/',{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForTimeout(2500);
  let rows=[];
  for(let p=1;p<=60;p++){
    let payload;
    for(let attempt=1;attempt<=3;attempt++){
      try{ payload=await dltBrowserFetch(page,p); break; }
      catch(error){
        console.log(`dlt page ${p} attempt ${attempt}: ${error.message}`);
        if(attempt===3)throw error;
        await page.waitForTimeout(1600*attempt);
      }
    }
    const raw=Array.isArray(payload?.value?.list)?payload.value.list:[];
    if(!raw.length)break;
    rows.push(...raw.map(normalizeDlt).filter(Boolean));
    console.log(`dlt page ${p}: ${raw.length}`);
    if(!FULL && rows.length>=LIMIT)break;
    if(raw.length<PAGE_SIZE)break;
    await page.waitForTimeout(350);
  }
  await context.close();
  return uniqueSort(rows);
}

const browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
try{
  const results={};
  results.dlt=await fetchDlt(browser);
  for(const game of ['ssq','kl8','fc3d']) results[game]=await fetchCwl(browser,game);
  for(const game of Object.keys(results)) writeGame(game,results[game],FULL);
} finally {
  await browser.close();
}
