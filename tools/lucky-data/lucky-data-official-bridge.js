/* Lucky Data official-source bridge | QilyLean | 2026-09-06
 * Keeps the page contract unchanged while resolving official draw JSON through
 * the QilyLean same-product gateway. Local JSON remains the offline fallback.
 */
(function(w){
  'use strict';
  if(w.__qilyLuckyDataOfficialBridgeV1)return;
  w.__qilyLuckyDataOfficialBridgeV1=true;
  var nativeFetch=w.fetch.bind(w);
  var GATEWAYS=[
    'https://qilylean-lucky-data.dinghunter623.workers.dev',
    'https://api.qilylean.com/lucky-data'
  ];
  var GAME_RE=/\/tools\/lucky-data\/data\/(dlt|ssq|kl8|fc3d)\.json(?:\?|$)/i;
  var memory={};
  function sourceMeta(game){
    if(game==='dlt')return {sourceName:'中国体育彩票',sourceHomepage:'https://www.lottery.gov.cn/'};
    return {sourceName:'中国福利彩票',sourceHomepage:'https://www.cwl.gov.cn/'};
  }
  function withTimeout(url,ms){
    var controller=new AbortController();
    var timer=setTimeout(function(){controller.abort();},ms);
    return nativeFetch(url,{method:'GET',mode:'cors',cache:'no-store',headers:{Accept:'application/json'},signal:controller.signal})
      .finally(function(){clearTimeout(timer);});
  }
  async function fetchGatewayPage(base,game,page){
    var join=base.indexOf('?')>=0?'&':'?';
    var url=base.replace(/\/$/,'')+'/draws'+join+'game='+encodeURIComponent(game)+'&page='+page+'&pageSize=100';
    var response=await withTimeout(url,18000);
    if(!response.ok)throw new Error('gateway '+response.status);
    var data=await response.json();
    if(!data||data.ok!==true||!Array.isArray(data.rows)||!data.rows.length)throw new Error('gateway empty');
    return data;
  }
  async function resolveOfficial(game){
    if(memory[game])return memory[game];
    var lastError=null;
    for(var g=0;g<GATEWAYS.length;g++){
      try{
        var rows=[];
        var meta=null;
        for(var page=1;page<=3;page++){
          var payload=await fetchGatewayPage(GATEWAYS[g],game,page);
          meta=payload;
          rows=rows.concat(payload.rows||[]);
          if(Number(payload.upstreamCount||0)<100)break;
        }
        var seen=new Set();
        rows=rows.filter(function(row){var issue=String(row&&row.issue||'');if(!issue||seen.has(issue))return false;seen.add(issue);return true;});
        if(!rows.length)throw new Error('official rows empty');
        var defaults=sourceMeta(game);
        var normalized={
          schemaVersion:1,
          game:game,
          gameName:game,
          sourceName:(meta&&meta.sourceName)||defaults.sourceName,
          sourceHomepage:(meta&&meta.sourceHomepage)||defaults.sourceHomepage,
          generatedAt:(meta&&meta.fetchedAt)||new Date().toISOString(),
          recordCount:rows.length,
          historyComplete:false,
          syncWarning:'页面优先读取官方数据网关；完整历史数据由后台持续归档。',
          draws:rows
        };
        memory[game]=normalized;
        return normalized;
      }catch(error){lastError=error;}
    }
    throw lastError||new Error('official gateway unavailable');
  }
  w.fetch=async function(input,init){
    var url=typeof input==='string'?input:(input&&input.url)||'';
    var match=GAME_RE.exec(url);
    if(!match)return nativeFetch(input,init);
    var game=match[1].toLowerCase();
    try{
      var data=await resolveOfficial(game);
      return new Response(JSON.stringify(data),{status:200,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-QilyLean-Lucky-Source':'official-gateway'}});
    }catch(error){
      console.warn('[Lucky Data] official gateway fallback:',game,error&&error.message||error);
      return nativeFetch(input,init);
    }
  };
})(window);
