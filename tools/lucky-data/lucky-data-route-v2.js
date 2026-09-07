/* Lucky Data route + game selector + detailed prize checker | QilyLean | 2026-09-07 */
(function(d,w){
  'use strict';
  if(w.__qilyLuckyDataRouteV2)return;
  w.__qilyLuckyDataRouteV2=true;
  var ROUTES={dlt:'/tools/lucky-data/dlt/',ssq:'/tools/lucky-data/ssq/',kl8:'/tools/lucky-data/kl8/',fc3d:'/tools/lucky-data/fc3d/'};
  var LABELS={dlt:'大乐透',ssq:'双色球',kl8:'快乐8',fc3d:'福彩3D'};
  var RULES={
    dlt:{primary:{label:'前区',min:1,max:35,pick:5},secondary:{label:'后区',min:1,max:12,pick:2},tiers:['一等奖','二等奖','三等奖','四等奖','五等奖','六等奖','七等奖']},
    ssq:{primary:{label:'红球',min:1,max:33,pick:6},secondary:{label:'蓝球',min:1,max:16,pick:1},tiers:['一等奖','二等奖','三等奖','四等奖','五等奖','六等奖']}
  };
  var drawCache={};

  function gameButtons(){return Array.prototype.slice.call(d.querySelectorAll('#gameTabs [data-game]'));}
  function selectors(){return Array.prototype.slice.call(d.querySelectorAll('[data-lucky-game-select],#aiGameSelect,#pageGameSelect'));}
  function currentGame(){
    var fixed=(d.body&&d.body.getAttribute('data-lucky-fixed-game')||'').trim();
    if(ROUTES[fixed])return fixed;
    var active=d.querySelector('#gameTabs [data-game].is-active');
    return active&&ROUTES[active.getAttribute('data-game')]?active.getAttribute('data-game'):'dlt';
  }
  function syncUi(game){
    gameButtons().forEach(function(btn){
      var on=btn.getAttribute('data-game')===game;
      btn.classList.toggle('is-active',on);
      btn.setAttribute('aria-selected',on?'true':'false');
    });
    selectors().forEach(function(sel){if(sel.value!==game)sel.value=game;});
    d.querySelectorAll('[data-lucky-current-game]').forEach(function(node){node.textContent=LABELS[game]||game;});
    w.setTimeout(upgradeCalculator,0);
  }
  function triggerGame(game){
    var btn=gameButtons().find(function(x){return x.getAttribute('data-game')===game;});
    if(btn){syncUi(game);btn.click();}
  }

  function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function pad(n){return String(n).padStart(2,'0');}
  function parseNumbers(value){
    return String(value||'').trim().split(/[\s,，、;；|/+]+/).filter(Boolean).map(Number);
  }
  function validSet(values,min,max,minCount,maxCount){
    if(values.length<minCount||values.length>maxCount)return false;
    if(new Set(values).size!==values.length)return false;
    return values.every(function(n){return Number.isInteger(n)&&n>=min&&n<=max;});
  }
  function comb(n,k){
    if(k<0||n<0||k>n)return 0;
    if(k===0||k===n)return 1;
    k=Math.min(k,n-k);
    var r=1;
    for(var i=1;i<=k;i++)r=r*(n-k+i)/i;
    return Math.round(r);
  }
  function hitDistribution(selected,winning,pick){
    var hits=selected.filter(function(n){return winning.indexOf(n)>=0;}).length;
    var misses=selected.length-hits;
    var out={};
    for(var x=0;x<=pick;x++)out[x]=comb(hits,x)*comb(misses,pick-x);
    return {hits:hits,counts:out};
  }
  function tierFor(game,a,b){
    if(game==='dlt'){
      if(a===5&&b===2)return '一等奖';
      if(a===5&&b===1)return '二等奖';
      if((a===5&&b===0)||(a===4&&b===2))return '三等奖';
      if(a===4&&b===1)return '四等奖';
      if((a===4&&b===0)||(a===3&&b===2))return '五等奖';
      if((a===3&&b===1)||(a===2&&b===2))return '六等奖';
      if((a===3&&b===0)||(a===2&&b===1)||(a===1&&b===2)||(a===0&&b===2))return '七等奖';
      return '';
    }
    if(a===6&&b===1)return '一等奖';
    if(a===6&&b===0)return '二等奖';
    if(a===5&&b===1)return '三等奖';
    if((a===5&&b===0)||(a===4&&b===1))return '四等奖';
    if((a===4&&b===0)||(a===3&&b===1))return '五等奖';
    if(b===1&&a<=2)return '六等奖';
    return '';
  }
  function tierConditions(game,tier){
    var map=game==='dlt'?{
      '一等奖':'5+2','二等奖':'5+1','三等奖':'5+0 / 4+2','四等奖':'4+1','五等奖':'4+0 / 3+2','六等奖':'3+1 / 2+2','七等奖':'3+0 / 2+1 / 1+2 / 0+2'
    }:{
      '一等奖':'6+1','二等奖':'6+0','三等奖':'5+1','四等奖':'5+0 / 4+1','五等奖':'4+0 / 3+1','六等奖':'2+1 / 1+1 / 0+1'
    };
    return map[tier]||'';
  }
  function officialAmount(draw,tier){
    var prizes=Array.isArray(draw&&draw.prizes)?draw.prizes:[];
    for(var i=0;i<prizes.length;i++){
      var p=prizes[i]||{},name=String(p.level||p.name||p.type||'').replace(/\s+/g,'');
      if(name.indexOf(tier)>=0){
        var n=Number(String(p.amount==null?'':p.amount).replace(/[^0-9.-]/g,''));
        if(Number.isFinite(n)&&n>0)return n;
      }
    }
    return null;
  }
  function money(n){return new Intl.NumberFormat('zh-CN',{maximumFractionDigits:2}).format(n)+'元';}
  function schemeSummary(){
    var game=currentGame(),rule=RULES[game];
    if(!rule)return;
    var a=parseNumbers((d.querySelector('#calcPrimary')||{}).value),b=parseNumbers((d.querySelector('#calcSecondary')||{}).value);
    var hint=d.querySelector('#calcComboHintV2');
    if(!hint)return;
    if(!a.length&&!b.length){hint.textContent='复式投注可直接输入多于基本注数量的号码，系统按实际 n+n 自动拆分为全部单注组合。';return;}
    var bets=comb(a.length,rule.primary.pick)*comb(b.length,rule.secondary.pick);
    var label=(a.length===rule.primary.pick&&b.length===rule.secondary.pick)?'单式':'复式 '+a.length+'+'+b.length;
    hint.textContent=label+'｜组合 '+bets+' 注｜基本投注金额 '+money(bets*2)+'。';
  }
  function upgradeCalculator(){
    var game=currentGame(),rule=RULES[game],inputs=d.querySelector('#calcInputs');
    if(!rule||!inputs)return;
    if(!d.querySelector('#calcModeV2')){
      var block=d.createElement('div');
      block.className='lucky-calc-inputs';
      block.innerHTML='<div class="lucky-input-group"><label>投注方式</label><select id="calcModeV2"><option value="auto">自动识别：单式 / 复式 n+n</option><option value="compound">复式 n+n</option><option value="single">单式</option></select><small id="calcComboHintV2">复式投注可直接输入多于基本注数量的号码，系统按实际 n+n 自动拆分为全部单注组合。</small></div></div>';
      inputs.insertBefore(block,inputs.firstChild);
      var mode=block.querySelector('#calcModeV2');
      mode.addEventListener('change',schemeSummary);
    }
    var p=d.querySelector('#calcPrimary'),s=d.querySelector('#calcSecondary');
    if(p){
      var pLabel=p.closest('.lucky-input-group')&&p.closest('.lucky-input-group').querySelector('label');
      var pSmall=p.closest('.lucky-input-group')&&p.closest('.lucky-input-group').querySelector('small');
      if(pLabel)pLabel.textContent=rule.primary.label+'号码（'+rule.primary.pick+'—'+rule.primary.max+'个）';
      if(pSmall)pSmall.textContent=pad(rule.primary.min)+'—'+pad(rule.primary.max)+'，号码不得重复；复式可输入多于'+rule.primary.pick+'个号码。';
      if(!p.dataset.comboBound){p.addEventListener('input',schemeSummary);p.dataset.comboBound='1';}
    }
    if(s){
      var sLabel=s.closest('.lucky-input-group')&&s.closest('.lucky-input-group').querySelector('label');
      var sSmall=s.closest('.lucky-input-group')&&s.closest('.lucky-input-group').querySelector('small');
      if(sLabel)sLabel.textContent=rule.secondary.label+'号码（'+rule.secondary.pick+'—'+rule.secondary.max+'个）';
      if(sSmall)sSmall.textContent=pad(rule.secondary.min)+'—'+pad(rule.secondary.max)+'，号码不得重复；复式可输入多于'+rule.secondary.pick+'个号码。';
      if(!s.dataset.comboBound){s.addEventListener('input',schemeSummary);s.dataset.comboBound='1';}
    }
    schemeSummary();
  }
  async function loadDraw(game,issue){
    var key=game+':'+issue;
    if(drawCache[key])return drawCache[key];
    var r=await fetch('/tools/lucky-data/data/'+game+'.json?v='+Date.now(),{cache:'no-store'});
    if(!r.ok)throw new Error('开奖数据读取失败 HTTP '+r.status);
    var data=await r.json(),rows=Array.isArray(data.draws)?data.draws:[];
    var draw=rows.find(function(x){return String(x.issue)===String(issue);});
    if(!draw)throw new Error('未找到第 '+issue+' 期开奖数据');
    drawCache[key]=draw;
    return draw;
  }
  function showResult(html,win){
    var el=d.querySelector('#calcResult');if(!el)return;
    el.className='lucky-calc-result '+(win?'is-win':'is-no-win');
    el.innerHTML=html;
  }
  async function calculateDetailed(e){
    var game=currentGame(),rule=RULES[game];
    if(!rule)return;
    e.preventDefault();e.stopImmediatePropagation();
    var issue=(d.querySelector('#calcIssue')||{}).value;
    var a=parseNumbers((d.querySelector('#calcPrimary')||{}).value),b=parseNumbers((d.querySelector('#calcSecondary')||{}).value);
    var mode=(d.querySelector('#calcModeV2')||{}).value||'auto';
    if(!issue){showResult('请选择有效开奖期号。',false);return;}
    if(!validSet(a,rule.primary.min,rule.primary.max,rule.primary.pick,rule.primary.max)||!validSet(b,rule.secondary.min,rule.secondary.max,rule.secondary.pick,rule.secondary.max)){
      showResult('号码格式不正确：'+rule.primary.label+'需 '+rule.primary.pick+'—'+rule.primary.max+' 个不重复号码，'+rule.secondary.label+'需 '+rule.secondary.pick+'—'+rule.secondary.max+' 个不重复号码。',false);return;
    }
    var isSingle=a.length===rule.primary.pick&&b.length===rule.secondary.pick;
    if(mode==='single'&&!isSingle){showResult('当前选择“单式”，请输入标准 '+rule.primary.pick+'+'+rule.secondary.pick+' 号码；如需多号码，请切换“复式 n+n”。',false);return;}
    if(mode==='compound'&&isSingle){showResult('当前选择“复式 n+n”，请至少在一个号码区增加选号数量。',false);return;}
    var bets=comb(a.length,rule.primary.pick)*comb(b.length,rule.secondary.pick);
    if(!bets||bets>10000000){showResult('复式组合注数异常或过大，请减少选号数量后重试。',false);return;}
    showResult('<span class="lucky-loading"></span>正在读取第 '+esc(issue)+' 期官方开奖数据并拆分复式组合…',false);
    try{
      var draw=await loadDraw(game,issue);
      var winA=(Array.isArray(draw.primary)?draw.primary:[]).map(Number),winB=(Array.isArray(draw.secondary)?draw.secondary:[]).map(Number);
      var distA=hitDistribution(a,winA,rule.primary.pick),distB=hitDistribution(b,winB,rule.secondary.pick);
      var counts={};rule.tiers.forEach(function(t){counts[t]=0;});
      Object.keys(distA.counts).forEach(function(x){Object.keys(distB.counts).forEach(function(y){
        var n=distA.counts[x]*distB.counts[y];if(!n)return;
        var tier=tierFor(game,Number(x),Number(y));if(tier)counts[tier]+=n;
      });});
      var winningBets=rule.tiers.reduce(function(sum,t){return sum+counts[t];},0),totalKnown=0,allKnown=true;
      var rows=rule.tiers.map(function(t){
        var amount=officialAmount(draw,t),subtotal=amount==null?null:amount*counts[t];
        if(counts[t]&&amount==null)allKnown=false;
        if(subtotal!=null)totalKnown+=subtotal;
        return '<tr><td>'+esc(t)+'</td><td>'+esc(tierConditions(game,t))+'</td><td>'+counts[t]+'注</td><td>'+(amount==null?'以当期官方公告为准':money(amount))+'</td><td>'+(subtotal==null?'—':money(subtotal))+'</td></tr>';
      }).join('');
      var scheme=isSingle?'单式 '+a.length+'+'+b.length:'复式 '+a.length+'+'+b.length;
      var head='<strong>'+esc(scheme)+'</strong>｜共 '+bets+' 注｜基本投注金额 '+money(bets*2)+'｜命中 '+rule.primary.label+' '+distA.hits+' 个、'+rule.secondary.label+' '+distB.hits+' 个。';
      var table='<div class="qily-table-scroll lucky-history-wrap"><table class="lucky-history-table"><thead><tr><th>奖级</th><th>中奖条件</th><th>中奖注数</th><th>单注奖金</th><th>奖金小计</th></tr></thead><tbody>'+rows+'</tbody></table></div>';
      var foot='<p class="lucky-fine">中奖组合合计 '+winningBets+' 注；'+(allKnown?'按当前已同步官方单注奖金计算，已知奖金合计 '+money(totalKnown)+'。':'部分奖级单注奖金未随当前官方数据返回，总奖金以该期开奖公告和彩票票面为准。')+'</p>';
      showResult(head+table+foot,winningBets>0);
    }catch(err){showResult('中奖查询暂时无法完成：'+esc(err&&err.message||err)+'。请确认该期官方数据已同步。',false);}
  }
  function installCalculatorUpgrade(){
    var btn=d.querySelector('#calcBtn');
    if(btn&&!btn.dataset.detailBound){btn.addEventListener('click',calculateDetailed,true);btn.dataset.detailBound='1';}
    var target=d.querySelector('#calcInputs');
    if(target){
      new MutationObserver(function(){w.setTimeout(upgradeCalculator,0);}).observe(target,{childList:true,subtree:true});
    }
    upgradeCalculator();
  }
  function install(){
    var fixed=(d.body&&d.body.getAttribute('data-lucky-fixed-game')||'').trim();
    var isFixed=!!ROUTES[fixed];
    var initial=isFixed?fixed:'dlt';
    try{
      var q=new URLSearchParams(w.location.search).get('game');
      if(!isFixed&&ROUTES[q])initial=q;
    }catch(_e){}

    gameButtons().forEach(function(btn){
      btn.addEventListener('click',function(e){
        var game=btn.getAttribute('data-game');
        if(isFixed&&e.isTrusted&&game!==fixed){
          e.preventDefault();
          e.stopImmediatePropagation();
          w.location.href=ROUTES[game];
          return;
        }
        syncUi(game);
      },true);
    });

    selectors().forEach(function(sel){
      sel.addEventListener('change',function(){
        var game=sel.value;
        if(!ROUTES[game])return;
        if(isFixed){w.location.href=ROUTES[game];return;}
        triggerGame(game);
      });
    });

    installCalculatorUpgrade();
    syncUi(initial);
    w.setTimeout(function(){triggerGame(initial);upgradeCalculator();},0);
  }

  if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',install,{once:true});else install();
})(document,window);
