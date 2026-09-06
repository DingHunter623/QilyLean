const ALLOWED_ORIGINS = new Set(['https://qilylean.com','https://www.qilylean.com']);
const UA_MOBILE='Mozilla/5.0 (Linux; Android 14; Pixel 9 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Mobile Safari/537.36';
const UA_DESKTOP='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36';
const GAMES={
  dlt:{sourceName:'中国体育彩票',sourceHomepage:'https://www.lottery.gov.cn/',type:'dlt'},
  ssq:{sourceName:'中国福利彩票',sourceHomepage:'https://www.cwl.gov.cn/',type:'cwl',name:'ssq',referer:'https://www.cwl.gov.cn/ygkj/wqkjgg/ssq/'},
  kl8:{sourceName:'中国福利彩票',sourceHomepage:'https://www.cwl.gov.cn/',type:'cwl',name:'kl8',referer:'https://www.cwl.gov.cn/ygkj/wqkjgg/kl8/'},
  fc3d:{sourceName:'中国福利彩票',sourceHomepage:'https://www.cwl.gov.cn/',type:'cwl',name:'3d',referer:'https://www.cwl.gov.cn/ygkj/wqkjgg/3d/'}
};
function cors(origin=''){
  const allow=ALLOWED_ORIGINS.has(origin)?origin:'https://qilylean.com';
  return {'Access-Control-Allow-Origin':allow,'Access-Control-Allow-Methods':'GET,OPTIONS','Access-Control-Allow-Headers':'Content-Type','Access-Control-Max-Age':'86400','Vary':'Origin'};
}
function json(body,status=200,origin='',cache='no-store'){
  return new Response(JSON.stringify(body),{status,headers:{...cors(origin),'Content-Type':'application/json; charset=utf-8','Cache-Control':cache}});
}
function splitNumbers(value){
  if(value==null)return [];
  const source=Array.isArray(value)?value:String(value).trim().split(/[\s,，、;；|/+\-]+/);
  return source.map(v=>String(v).match(/\d+/)?.[0]).filter(Boolean);
}
function numberValue(value){
  if(value==null||value==='')return null;
  const n=Number(String(value).replace(/[^0-9.-]/g,''));
  return Number.isFinite(n)?n:null;
}
function normalizeDate(value){
  const text=String(value||'').trim();
  const m=text.match(/(20\d{2})[-/.年](\d{1,2})[-/.月](\d{1,2})/);
  return m?`${m[1]}-${String(Number(m[2])).padStart(2,'0')}-${String(Number(m[3])).padStart(2,'0')}`:text.slice(0,10);
}
function normalizePrizes(items){
  if(!Array.isArray(items))return [];
  return items.map(item=>({
    level:String(item?.type||item?.prizeName||item?.name||item?.level||'').trim(),
    count:numberValue(item?.typenum??item?.count??item?.stakeCount),
    amount:numberValue(item?.typemoney??item?.amount??item?.stakeAmount)
  })).filter(x=>x.level||x.count!=null||x.amount!=null);
}
function normalizeDlt(row){
  const issue=String(row?.lotteryDrawNum||row?.issue||'').trim();
  const values=splitNumbers(row?.lotteryDrawResult||row?.drawResult||row?.result);
  if(!issue||values.length<7)return null;
  let officialUrl=String(row?.lotteryDrawUrl||row?.url||'').trim();
  if(officialUrl.startsWith('/'))officialUrl='https://www.lottery.gov.cn'+officialUrl;
  return {issue,date:normalizeDate(row?.lotteryDrawTime||row?.date),primary:values.slice(0,5),secondary:values.slice(5,7),sales:numberValue(row?.totalSaleAmount??row?.sales),pool:numberValue(row?.poolBalanceAfterdraw??row?.poolBalanceAfterDraw??row?.pool),prizes:normalizePrizes(row?.prizeLevelList||row?.prizegrades||row?.prizeGrades),officialUrl:officialUrl||'https://www.lottery.gov.cn/kj/kjlb.html?dlt'};
}
function normalizeCwl(game,row){
  const issue=String(row?.code||row?.issue||row?.lotteryDrawNum||'').trim();
  if(!issue)return null;
  const red=splitNumbers(row?.red||row?.lotteryDrawResult||row?.result),blue=splitNumbers(row?.blue);
  let primary=[],secondary=[];
  if(game==='ssq'){primary=red.slice(0,6);secondary=blue.slice(0,1);}else if(game==='kl8'){primary=red.slice(0,20);}else{primary=red.slice(0,3);}
  if(!primary.length)return null;
  let officialUrl=String(row?.detailsLink||row?.url||row?.detailsUrl||'').trim();
  if(officialUrl.startsWith('/'))officialUrl='https://www.cwl.gov.cn'+officialUrl;
  return {issue,date:normalizeDate(row?.date),primary,secondary,sales:numberValue(row?.sales),pool:numberValue(row?.poolmoney??row?.poolMoney),prizes:normalizePrizes(row?.prizegrades||row?.prizeGrades),officialUrl:officialUrl||'https://www.cwl.gov.cn/'};
}
function dltRows(payload){
  if(Array.isArray(payload?.value?.list))return payload.value.list;
  if(Array.isArray(payload?.data))return payload.data;
  return [];
}
function cwlRows(payload){
  if(Array.isArray(payload?.result))return payload.result;
  if(Array.isArray(payload?.data?.result))return payload.data.result;
  if(Array.isArray(payload?.value?.list))return payload.value.list;
  return [];
}
function cookieHeader(headers){
  let list=[];
  try{if(typeof headers.getSetCookie==='function')list=headers.getSetCookie();}catch{}
  if(!list.length){const single=headers.get('set-cookie');if(single)list=[single];}
  return list.map(v=>String(v).split(';',1)[0]).filter(Boolean).join('; ');
}
function parseJsonText(text,url){
  let clean=String(text||'').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g,'').trim();
  try{return JSON.parse(clean);}catch{}
  const start=clean.indexOf('{'),end=clean.lastIndexOf('}');
  if(start>=0&&end>start){try{return JSON.parse(clean.slice(start,end+1));}catch{}}
  throw new Error('official upstream returned non-JSON: '+url);
}
async function fetchJson(url,headers){
  const r=await fetch(url,{headers,redirect:'follow'});
  const text=await r.text();
  if(!r.ok)throw new Error(`official upstream ${r.status}: ${url}`);
  return parseJsonText(text,url);
}
async function fetchDlt(page,pageSize){
  const q=new URLSearchParams({gameNo:'85',provinceId:'0',pageSize:String(pageSize),isVerify:'1',pageNo:String(page)});
  const url='https://webapi.sporttery.cn/gateway/lottery/getHistoryPageListV1.qry?'+q;
  const attempts=[
    {'User-Agent':UA_MOBILE,'Accept':'application/json, text/plain, */*','Accept-Language':'zh-CN,zh;q=0.9','Referer':'https://m.lottery.gov.cn/','Cache-Control':'no-cache'},
    {'User-Agent':UA_DESKTOP,'Accept':'application/json, text/plain, */*','Accept-Language':'zh-CN,zh;q=0.9','Referer':'https://www.lottery.gov.cn/','Cache-Control':'no-cache'}
  ];
  let lastError;
  for(const headers of attempts){
    try{
      const payload=await fetchJson(url,headers),raw=dltRows(payload),rows=raw.map(normalizeDlt).filter(Boolean);
      if(rows.length)return {rows,upstreamCount:raw.length};
      lastError=new Error('大乐透官方接口返回空记录');
    }catch(error){lastError=error;}
  }
  throw lastError||new Error('大乐透官方接口不可用');
}
async function warmCwl(cfg){
  const urls=[cfg.referer,'https://www.cwl.gov.cn/'];
  let cookies=[];
  for(const url of urls){
    try{
      const r=await fetch(url,{headers:{'User-Agent':UA_DESKTOP,'Accept':'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8','Accept-Language':'zh-CN,zh;q=0.9'},redirect:'follow'});
      const cookie=cookieHeader(r.headers);if(cookie)cookies.push(cookie);
    }catch{}
  }
  return cookies.join('; ');
}
async function fetchCwl(game,cfg,page,pageSize){
  const cookie=await warmCwl(cfg);
  const base='https://www.cwl.gov.cn/cwl_admin/front/cwlkj/search/kjxx/findDrawNotice';
  const candidates=[];
  const q1=new URLSearchParams({name:cfg.name,issueCount:'',issueStart:'',issueEnd:'',dayStart:'',dayEnd:'',pageNo:String(page),pageSize:String(pageSize),week:'',systemType:'PC'});
  candidates.push(base+'?'+q1);
  if(page===1){const q2=new URLSearchParams({name:cfg.name,issueCount:String(pageSize),issueStart:'',issueEnd:'',dayStart:'',dayEnd:''});candidates.push(base+'?'+q2);}
  const headerVariants=[
    {'User-Agent':UA_DESKTOP,'Accept':'application/json, text/plain, */*','Accept-Language':'zh-CN,zh;q=0.9','Referer':cfg.referer,'Cache-Control':'no-cache'},
    {'User-Agent':UA_MOBILE,'Accept':'application/json, text/plain, */*','Accept-Language':'zh-CN,zh;q=0.9','Referer':'https://www.cwl.gov.cn/','Cache-Control':'no-cache'}
  ];
  let lastError;
  for(const url of candidates){
    for(const sourceHeaders of headerVariants){
      const headers={...sourceHeaders};if(cookie)headers.Cookie=cookie;
      try{
        const payload=await fetchJson(url,headers),raw=cwlRows(payload),rows=raw.map(row=>normalizeCwl(game,row)).filter(Boolean);
        if(rows.length)return {rows,upstreamCount:raw.length};
        lastError=new Error(`${game}官方接口返回空记录`);
      }catch(error){lastError=error;}
    }
  }
  throw lastError||new Error(`${game}官方接口不可用`);
}
async function handleDraws(request){
  const url=new URL(request.url),origin=request.headers.get('Origin')||'';
  const game=String(url.searchParams.get('game')||'').toLowerCase(),cfg=GAMES[game];
  if(!cfg)return json({ok:false,error:'Unsupported game'},400,origin);
  const page=Math.max(1,Math.min(120,Number(url.searchParams.get('page')||1)||1));
  const pageSize=Math.max(1,Math.min(100,Number(url.searchParams.get('pageSize')||100)||100));
  const cacheKey=new Request(`https://cache.qilylean.local/lucky-data/${game}/${page}/${pageSize}`,{method:'GET'}),cache=caches.default;
  const cached=await cache.match(cacheKey);
  if(cached){const headers=new Headers(cached.headers);Object.entries(cors(origin)).forEach(([k,v])=>headers.set(k,v));headers.set('X-QilyLean-Cache','HIT');return new Response(cached.body,{status:cached.status,headers});}
  try{
    const result=cfg.type==='dlt'?await fetchDlt(page,pageSize):await fetchCwl(game,cfg,page,pageSize);
    const body={ok:true,game,sourceName:cfg.sourceName,sourceHomepage:cfg.sourceHomepage,page,pageSize,upstreamCount:result.upstreamCount,fetchedAt:new Date().toISOString(),rows:result.rows};
    const response=json(body,200,origin,'public, max-age=120, s-maxage=900');
    if(result.rows.length){const cacheResponse=new Response(JSON.stringify(body),{status:200,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'public, max-age=120, s-maxage=900'}});await cache.put(cacheKey,cacheResponse);}
    return response;
  }catch(error){return json({ok:false,game,error:String(error?.message||error),sourceHomepage:cfg.sourceHomepage},502,origin);}
}
export default {
  async fetch(request){
    const url=new URL(request.url),origin=request.headers.get('Origin')||'';
    if(request.method==='OPTIONS')return new Response(null,{status:204,headers:cors(origin)});
    if(request.method!=='GET')return json({ok:false,error:'Method not allowed'},405,origin);
    if(url.pathname==='/'||url.pathname==='/health')return json({ok:true,service:'qilylean-lucky-data',build:'v1.1.0',officialSources:['中国体育彩票','中国福利彩票'],routes:['/health','/draws?game=dlt|ssq|kl8|fc3d&page=1&pageSize=100']},200,origin,'no-store');
    if(url.pathname==='/draws')return handleDraws(request);
    return json({ok:false,error:'Not found',path:url.pathname},404,origin);
  }
};
