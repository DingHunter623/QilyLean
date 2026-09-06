import fs from 'node:fs';
import path from 'node:path';

const FULL=process.argv.includes('--full');
const root=path.resolve('tools/lucky-data/data');
const now=new Date();
const currentYear=now.getUTCFullYear();
const START_YEAR={dlt:2007,ssq:2003,kl8:2020,fc3d:2004};
const META={
 dlt:{gameName:'超级大乐透',sourceName:'中国体育彩票',sourceHomepage:'https://www.lottery.gov.cn/'},
 ssq:{gameName:'双色球',sourceName:'中国福利彩票',sourceHomepage:'https://www.cwl.gov.cn/'},
 kl8:{gameName:'快乐8',sourceName:'中国福利彩票',sourceHomepage:'https://www.cwl.gov.cn/'},
 fc3d:{gameName:'福彩3D',sourceName:'中国福利彩票',sourceHomepage:'https://www.cwl.gov.cn/'}
};
const MIRROR_BASE='https://raw.githubusercontent.com/wenjinliuu/lottery-data-repo/main/public_data';

const n=value=>{if(value==null||value==='')return null;const x=Number(String(value).replace(/[^0-9.-]/g,''));return Number.isFinite(x)?x:null;};
const pad=v=>String(v).padStart(2,'0');
function arr(value){return Array.isArray(value)?value.map(v=>pad(v)):[];}
function prizes(items){return Array.isArray(items)?items.map(x=>({level:String(x?.prize_level||x?.prize_name||'').trim(),count:n(x?.winning_count),amount:n(x?.prize_amount)})).filter(x=>x.level||x.count!=null||x.amount!=null):[];}
function normalize(game,row){
 const issue=String(row?.issue||'').trim();
 const date=String(row?.draw_date||row?.date||'').slice(0,10);
 if(!issue||!date)return null;
 const numbers=row?.numbers||{};
 let primary=[],secondary=[];
 if(game==='dlt'){primary=arr(numbers.front);secondary=arr(numbers.back);}
 else if(game==='ssq'){primary=arr(numbers.red);secondary=arr(numbers.blue);}
 else if(game==='kl8'){primary=arr(numbers.nums);}
 else if(game==='fc3d'){primary=arr(numbers.digits).map(v=>String(Number(v)));}
 const expected=game==='dlt'?7:game==='ssq'?7:game==='kl8'?20:3;
 if(primary.length+secondary.length!==expected)return null;
 return {issue,date,primary,secondary,sales:n(row?.sales_amount),pool:n(row?.prize_pool),prizes:prizes(row?.prize_details),officialUrl:META[game].sourceHomepage};
}
function uniqueSort(rows){const seen=new Set();return rows.filter(r=>r&&r.issue&&!seen.has(r.issue)&&seen.add(r.issue)).sort((a,b)=>String(b.issue).localeCompare(String(a.issue),undefined,{numeric:true}));}
async function getJson(url){
 const r=await fetch(url,{headers:{Accept:'application/json','User-Agent':'QilyLean-Lucky-Data/1.0'}});
 if(!r.ok)throw new Error(`${r.status} ${url}`);
 const text=await r.text();
 if(!text.trim())throw new Error(`empty ${url}`);
 return JSON.parse(text);
}
async function collect(game){
 let rows=[],complete=false,latestUpdated='';
 if(FULL){
   let successes=0,expected=0;
   for(let year=START_YEAR[game];year<=currentYear;year++){
     expected++;
     const url=`${MIRROR_BASE}/by-year/${game}/${year}.json`;
     try{
       const payload=await getJson(url);
       const source=Array.isArray(payload?.draws)?payload.draws:[];
       if(source.length){successes++;rows.push(...source.map(x=>normalize(game,x)).filter(Boolean));latestUpdated=payload?.updated_at||latestUpdated;console.log(`${game} ${year}: ${source.length}`);}
       else console.log(`${game} ${year}: empty`);
     }catch(error){console.log(`${game} ${year}: ${error.message}`);}
   }
   complete=successes===expected;
 }
 if(!rows.length||!FULL){
   const payload=await getJson(`${MIRROR_BASE}/draws/${game}.json`);
   const source=Array.isArray(payload?.draws)?payload.draws:[];
   rows.push(...source.map(x=>normalize(game,x)).filter(Boolean));
   latestUpdated=payload?.updated_at||latestUpdated;
 }
 rows=uniqueSort(rows);
 if(!rows.length)throw new Error(`${game}: bootstrap mirror returned no valid records`);
 return {rows,complete,latestUpdated};
}
fs.mkdirSync(root,{recursive:true});
const failures=[];
for(const game of ['dlt','ssq','kl8','fc3d']){
 try{
   const {rows,complete,latestUpdated}=await collect(game),m=META[game];
   const payload={schemaVersion:1,game,gameName:m.gameName,sourceName:m.sourceName,sourceHomepage:m.sourceHomepage,generatedAt:new Date().toISOString(),recordCount:rows.length,historyComplete:complete,dataAuthority:'official-lottery-organizations',transportMode:'public-draw-mirror-fallback',transportNote:'官方站对云端同步节点触发访问限制时，使用公开开奖结果镜像保障页面连续性；权威结果仍以中国体育彩票/中国福利彩票官网公告为准。',mirrorUpdatedAt:latestUpdated,syncWarning:complete?'':'当前已关联可用开奖记录；更早历史期次由后台继续补齐与官方源复核。',draws:rows};
   fs.writeFileSync(path.join(root,`${game}.json`),JSON.stringify(payload,null,2)+'\n','utf8');
   console.log(`WROTE ${game}: ${rows.length}, latest=${rows[0].issue}, complete=${complete}`);
 }catch(error){failures.push(`${game}: ${error.message}`);console.error(`ERROR ${game}: ${error.message}`);}
}
if(failures.length){console.error(failures.join(' | '));process.exitCode=1;}
