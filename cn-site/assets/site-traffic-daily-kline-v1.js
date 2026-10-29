/* QilyLean China daily PV candlesticks v1.0 | Beijing time UTC+08.
 * OHLC = the first/maximum/minimum/last observed 6-hour bucket PV of each day.
 * Volume = total of all four buckets. No historical interpolation and no use of
 * the independently disclosed 10,000 presentation starting baseline.
 */
(function (d, w) {
  'use strict';
  if (w.__qilyCnDailyKlineLoaded) return;
  if (!/^(www\.)?qilylean\.cn$/i.test((w.location && w.location.hostname) || '')) return;
  var host = d.querySelector('#traffic[data-qily-traffic-stats="v1"]');
  if (!host) return;
  w.__qilyCnDailyKlineLoaded = true;

  var START = '2026-10-29';
  var PREFIX = 'qilylean_cn_pv6h_v1_';
  var BASE = 'https://countapi.mileshilliard.com/api/v1/get/';
  var NS = 'http://www.w3.org/2000/svg';
  var range = 7;
  var requestId = 0;
  var slotCache = {};
  var overrides = {};
  var records = [];
  var shell, chartBox, statusBox, seven, fourteen;

  function dayClock() {
    return new Date(Date.now() + 8 * 3600000).toISOString().slice(0, 10);
  }
  function dayList(days) {
    var now = dayClock();
    var end = Date.parse(now + 'T00:00:00Z');
    var start = Math.max(Date.parse(START + 'T00:00:00Z'), end - (days - 1) * 86400000);
    var result = [];
    for (var t = start; t <= end; t += 86400000) result.push(new Date(t).toISOString().slice(0, 10));
    return result;
  }
  function keyFor(date, slot) {
    return PREFIX + date.replace(/-/g, '') + '_s' + slot;
  }
  function number(value) {
    return Math.max(0, Math.floor(Number(value) || 0));
  }
  function el(tag, cls, content) {
    var node = d.createElement(tag);
    if (cls) node.className = cls;
    if (content !== undefined) node.textContent = content;
    return node;
  }
  function svg(tag, attrs, parent, content) {
    var node = d.createElementNS(NS, tag);
    Object.keys(attrs || {}).forEach(function (key) { node.setAttribute(key, String(attrs[key])); });
    if (content !== undefined) node.textContent = content;
    if (parent) parent.appendChild(node);
    return node;
  }
  function style() {
    if (d.getElementById('qily-traffic-kline-style')) return;
    var s = el('style');
    s.id = 'qily-traffic-kline-style';
    s.textContent = [
      '#traffic .qily-traffic-kline{margin-top:20px;padding:clamp(14px,2.2vw,22px);border:1px solid rgba(232,192,113,.35);border-radius:15px;background:rgba(2,21,26,.5);color:#ecf4ee!important;-webkit-text-fill-color:#ecf4ee!important;max-width:100%;min-width:0}',
      '#traffic .qily-traffic-kline__head{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px}',
      '#traffic .qily-traffic-kline__head h3{margin:0!important;font-size:clamp(17px,2vw,21px)!important;font-weight:700!important;color:#ffe39b!important;-webkit-text-fill-color:#ffe39b!important}',
      '#traffic .qily-traffic-kline__actions{display:flex;gap:7px}',
      '#traffic .qily-traffic-kline__actions button{padding:6px 12px;min-height:36px;cursor:pointer;border:1px solid rgba(255,227,155,.45);border-radius:8px;background:#113a42;color:#ecf4ee!important;-webkit-text-fill-color:#ecf4ee!important;font:inherit;font-size:13px;line-height:1.2}',
      '#traffic .qily-traffic-kline__actions button[aria-pressed="true"]{background:#ffe39b!important;color:#113239!important;-webkit-text-fill-color:#113239!important;font-weight:750}',
      '#traffic .qily-traffic-kline__actions button:focus-visible{outline:2px solid #ffe39b;outline-offset:2px}',
      '#traffic .qily-traffic-kline__info{margin:9px 0 8px!important;font-size:13px!important;line-height:1.65!important;color:#dceae3!important;-webkit-text-fill-color:#dceae3!important}',
      '#traffic .qily-traffic-kline__scroll{max-width:100%;overflow-x:auto;overflow-y:hidden;-webkit-overflow-scrolling:touch;padding:4px 0;scrollbar-color:#bc9856 #11353c}',
      '#traffic .qily-traffic-kline__svg{display:block;max-width:none;background:transparent;overflow:visible}',
      '#traffic .qily-traffic-kline__status{margin:8px 0 0!important;color:#e0ebe5!important;-webkit-text-fill-color:#e0ebe5!important;font-size:13px!important;line-height:1.6!important}',
      '#traffic .qily-traffic-kline__legend{display:flex;align-items:center;flex-wrap:wrap;gap:8px 18px;margin-top:12px;font-size:12px;color:#deebe4!important;-webkit-text-fill-color:#deebe4!important}',
      '#traffic .qily-traffic-kline__swatch{display:inline-block;width:10px;height:10px;margin-right:6px;border-radius:2px;vertical-align:-1px}',
      '#traffic .qily-traffic-kline__foot{margin:10px 0 0!important;font-size:12px!important;line-height:1.6!important;color:#d4e4de!important;-webkit-text-fill-color:#d4e4de!important}',
      '@media(max-width:620px){#traffic .qily-traffic-kline{padding:14px 12px}#traffic .qily-traffic-kline__head{align-items:flex-start}}'
    ].join('');
    (d.head || d.documentElement).appendChild(s);
  }
  function mount() {
    style();
    shell = el('section', 'qily-traffic-kline');
    shell.setAttribute('aria-label', '中国站每日真实页面浏览量 K 线趋势');
    var header = el('div', 'qily-traffic-kline__head');
    header.appendChild(el('h3', '', 'DAILY PV · 日流量 K 线'));
    var actions = el('div', 'qily-traffic-kline__actions');
    actions.setAttribute('aria-label', '选择统计区间');
    seven = el('button', '', '近7日');
    fourteen = el('button', '', '近14日');
    seven.type = 'button'; fourteen.type = 'button';
    seven.setAttribute('aria-pressed', 'true');
    fourteen.setAttribute('aria-pressed', 'false');
    seven.addEventListener('click', function () { changeRange(7); });
    fourteen.addEventListener('click', function () { changeRange(14); });
    actions.appendChild(seven);
    actions.appendChild(fourteen);
    header.appendChild(actions);
    shell.appendChild(header);
    shell.appendChild(el('p','qily-traffic-kline__info','实际分时PV构成K线：开/收＝首末6小时时段；高/低＝四时段最大/最小值。下方柱状＝全天PV。'));
    chartBox = el('div', 'qily-traffic-kline__scroll');
    chartBox.setAttribute('role', 'region');
    chartBox.setAttribute('aria-label','可横向浏览的中国站日流量K线图');
    chartBox.tabIndex = 0;
    shell.appendChild(chartBox);
    statusBox = el('p', 'qily-traffic-kline__status', '正在读取分时访问数据…');
    statusBox.setAttribute('aria-live','polite');
    shell.appendChild(statusBox);
    var legend = el('div','qily-traffic-kline__legend');
    [
      ['#D8B36A','收盘时段PV ≥ 开盘时段PV'],
      ['#65C8C5','收盘时段PV < 开盘时段PV'],
      ['#709C9D','下方柱图：当日累计PV']
    ].forEach(function (v) {
      var item=el('span');var mark=el('span','qily-traffic-kline__swatch');mark.style.backgroundColor=v[0];item.appendChild(mark);item.appendChild(d.createTextNode(v[1]));legend.appendChild(item);
    });
    shell.appendChild(legend);
    shell.appendChild(el('p','qily-traffic-kline__foot','北京时间（UTC+8）；自2026-10-29起采集，历史空白不回填。仅包含真实采集的页面浏览量，不含10,000次初始展示基数。数据可能因第三方计数接口中断而缺失。'));
    var grid=host.querySelector('.qily-traffic-grid');
    if (grid && grid.parentNode) grid.parentNode.insertBefore(shell,grid.nextSibling);
    else host.appendChild(shell);
    load();
  }
  function changeRange(next) {
    if (range === next) return;
    range=next;
    seven.setAttribute('aria-pressed',String(range===7));
    fourteen.setAttribute('aria-pressed',String(range===14));
    load();
  }
  function fetchSlot(key) {
    var cached=slotCache[key];
    if (cached && Date.now()-cached.time < 45000) return Promise.resolve(cached.data);
    var controller=typeof AbortController==='function' ? new AbortController() : null;
    var timeout=controller ? w.setTimeout(function(){ controller.abort(); },7500) : null;
    return w.fetch(BASE + encodeURIComponent(key), {
      method:'GET',mode:'cors',credentials:'omit',cache:'no-store',
      signal:controller ? controller.signal : undefined
    }).then(function(res){
      if(res.status===404) return {value:0,exists:false,error:false};
      if(!res.ok) throw new Error('HTTP '+res.status);
      return res.json().then(function(payload){
        var n=Number(payload && payload.value);
        if(!isFinite(n)||n<0) throw new Error('Invalid bucket data');
        return {value:Math.floor(n),exists:true,error:false};
      });
    }).catch(function(){
      return {value:0,exists:false,error:true};
    }).then(function(data){
      if(timeout) w.clearTimeout(timeout);
      if(overrides[key]!==undefined && !data.error) data={value:Math.max(data.value,overrides[key]),exists:true,error:false};
      if(!data.error) slotCache[key]={time:Date.now(),data:data};
      return data;
    });
  }
  function limited(tasks,max) {
    var outputs=new Array(tasks.length), next=0, workers=[];
    for(var wnum=0;wnum<Math.min(max,tasks.length);wnum++) workers.push((function(){
      function work(){
        if(next>=tasks.length) return Promise.resolve();
        var i=next++;
        return tasks[i]().then(function(v){outputs[i]=v;return work();});
      }
      return work();
    })());
    return Promise.all(workers).then(function(){return outputs;});
  }
  function load() {
    var thisRequest=++requestId, days=dayList(range);
    statusBox.textContent='正在读取 '+days.length+' 日的实际分时PV…';
    var tasks=[];
    days.forEach(function(day){
      for(var slot=0;slot<4;slot++) (function(day,slot){
        tasks.push(function(){return fetchSlot(keyFor(day,slot));});
      })(day,slot);
    });
    limited(tasks,6).then(function(results){
      if(thisRequest!==requestId) return;
      records=days.map(function(day,index){
        var four=results.slice(index*4,index*4+4);
        var error=four.some(function(p){return p.error;});
        var has=four.some(function(p){return p.exists;});
        var vals=four.map(function(p){return p.value;});
        // Today's candle cannot include future 6-hour intervals:
        // missing future values must never count as an observed daily low.
        var observedSlots=day===dayClock()
          ? vals.slice(0,Math.floor(new Date(Date.now()+8*3600000).getUTCHours()/6)+1)
          : vals;
        return {date:day,slots:vals,error:error,has:has,
          open:observedSlots[0],high:Math.max.apply(Math,observedSlots),
          low:Math.min.apply(Math,observedSlots),
          close:observedSlots[observedSlots.length-1],
          volume:vals.reduce(function(a,b){return a+b;},0)};
      });
      draw();
    }).catch(function(){
      if(thisRequest===requestId) statusBox.textContent='分时统计暂不可读取，请稍后刷新重试。';
    });
  }
  function draw() {
    while(chartBox.firstChild) chartBox.removeChild(chartBox.firstChild);
    var days=records;
    var count=days.filter(function(p){return p.has&&!p.error;}).length;
    var failed=days.some(function(p){return p.error;});
    if(!count) {
      statusBox.textContent=failed?'部分分时统计暂不可读取，请稍后刷新。':'尚无可绘制的真实分时PV，首批访问会逐步形成K线。';
      return;
    }
    var width=Math.max(330,days.length*55+70),height=302;
    var left=49,right=18,top=20,bottom=184,volumeTop=218,volumeBottom=258;
    var usable=width-left-right, step=usable/days.length;
    var valid=days.filter(function(p){return p.has&&!p.error;});
    var maxCount=Math.max.apply(Math,valid.map(function(p){return p.high;}));
    var maxY=Math.max(4,Math.ceil(maxCount*1.18));
    var maxV=Math.max(1,Math.max.apply(Math,valid.map(function(p){return p.volume;})));
    var root=svg('svg',{viewBox:'0 0 '+width+' '+height,width:width,height:height,
      role:'img','aria-label':'近'+range+'日中国站分时浏览量K线，底部柱状为每天真实PV',
      class:'qily-traffic-kline__svg'},chartBox);
    svg('title',{},root,'中国站日流量 K 线（真实采集，自2026年10月29日起）');
    function y(val){return bottom-(val/maxY)*(bottom-top);}
    for(var t=0;t<=4;t++){
      var val=Math.round(maxY*t/4),yy=y(maxY*t/4);
      svg('line',{x1:left,y1:yy,x2:width-right,y2:yy,stroke:'#476971','stroke-opacity':'.65','stroke-dasharray':'3 5'},root);
      svg('text',{x:left-7,y:yy+4,'text-anchor':'end',fill:'#d9e6df','font-size':11},root,String(val));
    }
    svg('text',{x:2,y:12,fill:'#e4d3a5','font-size':11},root,'PV/6h');
    svg('text',{x:2,y:214,fill:'#e4d3a5','font-size':11},root,'日PV');
    svg('line',{x1:left,y1:volumeBottom,x2:width-right,y2:volumeBottom,stroke:'#708a8d'},root);
    days.forEach(function(p,i){
      var x=left+step*(i+.5),group=svg('g',{},root);
      var label=p.date.slice(5).replace('-','/');
      if(p.error||!p.has){
        svg('line',{x1:x-6,y1:bottom-4,x2:x+6,y2:bottom-4,stroke:'#769397','stroke-dasharray':'2 3'},group);
        svg('title',{},group,p.date+(p.error?' 部分时段读取失败':' 尚无采集记录'));
      } else {
        var closeY=y(p.close),openY=y(p.open);
        var col=p.close>=p.open?'#D8B36A':'#65C8C5';
        svg('line',{x1:x,y1:y(p.high),x2:x,y2:y(p.low),stroke:col,'stroke-width':2.4},group);
        svg('rect',{x:x-10,y:Math.min(openY,closeY)-.8,width:20,
          height:Math.max(3.5,Math.abs(closeY-openY)+1.6),rx:1.8,
          fill:col,'fill-opacity':'.88',stroke:col,'stroke-width':1},group);
        var h=(p.volume/maxV)*(volumeBottom-volumeTop);
        svg('rect',{x:x-9,y:volumeBottom-h,width:18,height:Math.max(2,h),rx:1,
          fill:'#709C9D','fill-opacity':'.95'},group);
        svg('title',{},group,p.date+'｜日PV '+p.volume+'；开 '+p.open+'，高 '+p.high+'，低 '+p.low+'，收 '+p.close+'（6小时PV）');
      }
      svg('text',{x:x,y:281,'text-anchor':'middle',fill:'#dceae3','font-size':11},root,label);
    });
    var realSum=valid.reduce(function(sum,p){return sum+p.volume;},0);
    var last=valid[valid.length-1];
    statusBox.textContent='已采集 '+count+' 日｜所示期间实测分时PV合计 '+realSum+'｜最新 '+last.date.slice(5)+'：'+last.volume+' PV'+(failed?'｜部分日期接口不可读':'');
  }
  w.addEventListener('qily:pv6h-updated',function(event){
    var detail=event && event.detail;
    if(!detail||!detail.date||!isFinite(Number(detail.value))) return;
    var key=keyFor(detail.date,detail.slot), val=number(detail.value);
    overrides[key]=Math.max(overrides[key]||0,val);
    slotCache[key]={time:Date.now(),data:{value:overrides[key],exists:true,error:false}};
    // Refresh the chart after the successful sitewide pageview's timeslot hit.
    if(shell) load();
  });
  mount();
})(document,window);
