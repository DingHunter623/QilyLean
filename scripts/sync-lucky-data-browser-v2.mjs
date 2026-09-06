import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const FULL = process.argv.includes('--full');
const LIMIT = FULL ? 10000 : 300;
const PAGE_SIZE = 100;
const root = path.resolve('tools/lucky-data/data');

const META = {
  dlt:{gameName:'超级大乐透',sourceName:'中国体育彩票',sourceHomepage:'https://www.lottery.gov.cn/'},
  ssq:{gameName:'双色球',sourceName:'中国福利彩票',sourceHomepage:'https://www.cwl.gov.cn/'},
  kl8:{gameName:'快乐8',sourceName:'中国福利彩票',sourceHomepage:'https://www.cwl.gov.cn/'},
  fc3d:{gameName:'福彩3D',sourceName:'中国福利彩票',sourceHomepage:'https://www.cwl.gov.cn/'}
};
const CWL = {
  ssq:{name:'ssq',referer:'https://www.cwl.gov.cn/ygkj/wqkjgg/ssq/'},
  kl8:{name:'kl8',referer:'https://www.cwl.gov.cn/ygkj/wqkjgg/kl8/'},
  fc3d:{name:'3d',referer:'https://www.cwl.gov.cn/ygkj/wqkjgg/fc3d/'}
};
const UA_DESKTOP='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36';
const UA_MOBILE='Mozilla/5.0 (Linux; Android 14; Pixel 9 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Mobile Safari/537.36';

const nums = value => String(value ?? '').match(/\d+/g) || [];
const num = value => {
  if(value == null || value === '') return null;
  const n=Number(String(value).replace(/[^0-9.-]/g,''));
  return Number.isFinite(n)?n:null;
};
const dateOnly = value => {
  const m=String(value||'').match(/(20\d{2})[-/.年](\d{1,2})[-/.月](\d{1,2})/);
  return m?`${m[1]}-${String(+m[2]).padStart(2,'0')}-${String(+m[3]).padStart(2,'0')}`:String(value||'').slice(0,10);
};
const prizes = items => Array.isArray(items)?items.map(x=>({
  level:String(x?.type||x?.prizeName||x?.name||x?.level||'').trim(),
  count:num(x?.typenum??x?.count??x?.stakeCount),
  amount:num(x?.typemoney??x?.amount??x?.stakeAmount)
})).filter(x=>x.level||x.count!=null||x.amount!=null):[];

function normalizeDlt(row){
  const issue=String(row?.lotteryDrawNum||row?.issue||'').trim();
  const all=nums(row?.lotteryDrawResult||row?.drawResult||row?.result);
  if(!issue||all.length<7)return null;
  return {issue,date:dateOnly(row?.lotteryDrawTime||row?.date),primary:all.slice(0,5),secondary:all.slice(5,7),sales:num(row?.totalSaleAmount??row?.sales),pool:num(row?.poolBalanceAfterdraw??row?.poolBalanceAfterDraw??row?.pool),prizes:prizes(row?.prizeLevelList||row?.prizegrades),officialUrl:'https://www.lottery.gov.cn/kj/kjlb.html?dlt'};
}
function normalizeCwl(game,row){
  const issue=String(row?.code||row?.issue||'').trim();
  if(!issue)return null;
  const red=nums(row?.red||row?.result),blue=nums(row?.blue);
  let primary=[],secondary=[];
  if(game==='ssq'){primary=red.slice(0,6);secondary=blue.slice(0,1);}
  else if(game==='kl8')primary=red.slice(0,20);
  else primary=red.slice(0,3);
  const expected=game==='ssq'?7:game==='kl8'?20:3;
  if(primary.length+secondary.length!==expected)return null;
  let officialUrl=String(row?.detailsLink||row?.url||'').trim();
  if(officialUrl.startsWith('/'))officialUrl='https://www.cwl.gov.cn'+officialUrl;
  return {issue,date:dateOnly(row?.date),primary,secondary,sales:num(row?.sales),pool:num(row?.poolmoney??row?.poolMoney),prizes:prizes(row?.prizegrades||row?.prizeGrades),officialUrl:officialUrl||'https://www.cwl.gov.cn/'};
}
function dltRaw(payload){return Array.isArray(payload?.value?.list)?payload.value.list:Array.isArray(payload?.data)?payload.data:[];}
function cwlRaw(payload){return Array.isArray(payload?.result)?payload.result:Array.isArray(payload?.data?.result)?payload.data.result:[];}
function uniqueSort(rows){
  const seen=new Set();
  return rows.filter(r=>r&&r.issue&&!seen.has(r.issue)&&seen.add(r.issue)).sort((a,b)=>String(b.issue).localeCompare(String(a.issue),undefined,{numeric:true}));
}
function writeGame(game,rows,complete=false){
  rows=uniqueSort(rows).slice(0,LIMIT);
  if(!rows.length)throw new Error(`${game}: no official records captured`);
  const meta=META[game];
  const payload={schemaVersion:1,game,gameName:meta.gameName,sourceName:meta.sourceName,sourceHomepage:meta.sourceHomepage,generatedAt:new Date().toISOString(),recordCount:rows.length,historyComplete:Boolean(complete),syncWarning:complete?'':'当前已关联官方开奖数据；后台继续补齐更早历史期次。',draws:rows};
  fs.mkdirSync(root,{recursive:true});
  fs.writeFileSync(path.join(root,`${game}.json`),JSON.stringify(payload,null,2)+'\n','utf8');
  console.log(`WROTE ${game}: ${rows.length} official records; latest=${rows[0].issue}`);
}
async function parseResponseJson(response){
  try{
    const text=await response.text();
    const clean=text.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g,'').trim();
    return JSON.parse(clean);
  }catch{return null;}
}

async function fetchDlt(browser){
  const context=await browser.newContext({
    locale:'zh-CN',userAgent:UA_MOBILE,viewport:{width:412,height:915},
    extraHTTPHeaders:{'Accept-Language':'zh-CN,zh;q=0.9','Cache-Control':'no-cache'}
  });
  const page=await context.newPage();
  const rows=[];
  page.on('response',async response=>{
    if(!response.url().includes('getHistoryPageListV1.qry'))return;
    const payload=await parseResponseJson(response),raw=dltRaw(payload);
    if(raw.length){rows.push(...raw.map(normalizeDlt).filter(Boolean));console.log(`dlt intercepted ${raw.length}: ${response.status()} ${response.url()}`);}
  });
  try{
    await page.goto('https://m.lottery.gov.cn/zst/dlt/?tt_force_outside=1',{waitUntil:'domcontentloaded',timeout:60000});
    await page.waitForTimeout(4500);
    const hundred=page.getByText('最近100期',{exact:true});
    if(await hundred.count()){
      await hundred.first().click({timeout:5000}).catch(()=>{});
      await page.waitForTimeout(4000);
    }
  }catch(error){console.log('dlt official page navigation:',error.message);}

  for(let p=1;p<=60 && rows.length<LIMIT;p++){
    try{
      const payload=await page.evaluate(async ({p,pageSize})=>{
        const q=new URLSearchParams({gameNo:'85',provinceId:'0',pageSize:String(pageSize),isVerify:'1',pageNo:String(p)});
        const r=await fetch('https://webapi.sporttery.cn/gateway/lottery/getHistoryPageListV1.qry?'+q,{credentials:'omit',headers:{Accept:'application/json, text/plain, */*'}});
        const text=await r.text();
        if(!r.ok)throw new Error(`HTTP ${r.status} ${text.slice(0,80)}`);
        return JSON.parse(text.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g,''));
      },{p,pageSize:PAGE_SIZE});
      const raw=dltRaw(payload);
      if(!raw.length)break;
      rows.push(...raw.map(normalizeDlt).filter(Boolean));
      console.log(`dlt browser-fetch page ${p}: ${raw.length}`);
      if(raw.length<PAGE_SIZE)break;
      await page.waitForTimeout(500);
    }catch(error){
      console.log(`dlt browser-fetch page ${p} failed: ${error.message}`);
      break;
    }
  }

  if(!rows.length){
    try{
      const api=await context.newPage();
      await api.setExtraHTTPHeaders({'Referer':'https://www.lottery.gov.cn/','Accept':'application/json, text/plain, */*','Accept-Language':'zh-CN,zh;q=0.9'});
      const q=new URLSearchParams({gameNo:'85',provinceId:'0',pageSize:'100',isVerify:'1',pageNo:'1'});
      const response=await api.goto('https://webapi.sporttery.cn/gateway/lottery/getHistoryPageListV1.qry?'+q,{waitUntil:'domcontentloaded',timeout:60000});
      if(response){const payload=await parseResponseJson(response),raw=dltRaw(payload);rows.push(...raw.map(normalizeDlt).filter(Boolean));console.log(`dlt direct-browser navigation: status=${response.status()} rows=${raw.length}`);}
      await api.close();
    }catch(error){console.log('dlt direct-browser navigation failed:',error.message);}
  }
  await context.close();
  return uniqueSort(rows);
}

async function fetchCwl(browser,game){
  const cfg=CWL[game];
  const context=await browser.newContext({
    locale:'zh-CN',userAgent:UA_DESKTOP,viewport:{width:1365,height:900},
    extraHTTPHeaders:{'Accept-Language':'zh-CN,zh;q=0.9','Cache-Control':'no-cache'}
  });
  const page=await context.newPage();
  const rows=[];
  page.on('response',async response=>{
    if(!response.url().includes('findDrawNotice'))return;
    const payload=await parseResponseJson(response),raw=cwlRaw(payload);
    if(raw.length){rows.push(...raw.map(r=>normalizeCwl(game,r)).filter(Boolean));console.log(`${game} intercepted ${raw.length}: ${response.status()}`);}
  });
  try{
    await page.goto(cfg.referer,{waitUntil:'domcontentloaded',timeout:60000});
    await page.waitForTimeout(4500);
  }catch(error){console.log(`${game} official page navigation: ${error.message}`);}

  for(let p=1;p<=100 && rows.length<LIMIT;p++){
    try{
      const payload=await page.evaluate(async ({name,p,pageSize})=>{
        const q=new URLSearchParams({name,issueCount:'',issueStart:'',issueEnd:'',dayStart:'',dayEnd:'',pageNo:String(p),pageSize:String(pageSize),week:'',systemType:'PC'});
        const r=await fetch('/cwl_admin/front/cwlkj/search/kjxx/findDrawNotice?'+q,{credentials:'include',headers:{Accept:'application/json, text/javascript, */*; q=0.01','X-Requested-With':'XMLHttpRequest'}});
        const text=await r.text();
        if(!r.ok)throw new Error(`HTTP ${r.status} ${text.slice(0,80)}`);
        return JSON.parse(text);
      },{name:cfg.name,p,pageSize:PAGE_SIZE});
      const raw=cwlRaw(payload);
      if(!raw.length){console.log(`${game} browser-fetch page ${p}: empty`);break;}
      rows.push(...raw.map(r=>normalizeCwl(game,r)).filter(Boolean));
      console.log(`${game} browser-fetch page ${p}: ${raw.length}`);
      if(raw.length<PAGE_SIZE)break;
      await page.waitForTimeout(500);
    }catch(error){console.log(`${game} browser-fetch page ${p} failed: ${error.message}`);break;}
  }
  await context.close();
  return uniqueSort(rows);
}

const browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--disable-blink-features=AutomationControlled']});
const failures=[];
try{
  for(const game of ['dlt','ssq','kl8','fc3d']){
    try{
      const rows=game==='dlt'?await fetchDlt(browser):await fetchCwl(browser,game);
      writeGame(game,rows,false);
    }catch(error){failures.push(`${game}: ${error.message}`);console.error(`ERROR ${game}:`,error.message);}
  }
} finally { await browser.close(); }
if(failures.length){console.error('Lucky Data partial sync failures:',failures.join(' | '));process.exitCode=1;}
