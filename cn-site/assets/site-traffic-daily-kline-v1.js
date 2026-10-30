/* QilyLean China daily PV trend v1.1 | Beijing time UTC+08.
 * Each day records the first, highest, lowest and last observed 6-hour PV.
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
      '#traffic .qily-traffic-kline{margin-top:22px;padding:clamp(20px,2.4vw,28px);border:1px solid #cfe0dd;border-radius:15px;background:#f4f9f7;color:#365f62!important;-webkit-text-fill-color:#365f62!important;box-shadow:0 6px 18px rgba(15,75,90,.06);max-width:100%;min-width:0}',
      '#traffic .qily-traffic-kline__head{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px}',
      '#traffic .qily-traffic-kline__head h3{margin:0!important;font-size:23px!important;font-weight:750!important;color:#0f4b5a!important;-webkit-text-fill-color:#0f4b5a!important}',
      '#traffic .qily-traffic-kline__actions{display:flex;gap:10px}',
      '#traffic .qily-traffic-kline__actions button{padding:8px 16px;min-height:44px;cursor:pointer;border:1px solid #cfe0dd;border-radius:9px;background:#eaf2ef;color:#365f62!important;-webkit-text-fill-color:#365f62!important;font:inherit;font-size:20px!important;line-height:1.75}',
      '#traffic .qily-traffic-kline__actions button[aria-pressed="true"]{background:#0f4b5a!important;color:#ffe39b!important;-webkit-text-fill-color:#ffe39b!important;font-weight:750}',
      '#traffic .qily-traffic-kline__actions button:focus-visible{outline:2px solid #caa15f;outline-offset:2px}',
      '#traffic .qily-traffic-kline__info{display:none!important}',
      '#traffic .qily-traffic-kline__scroll{display:block!important;width:100%!important;max-width:100%!important;margin:0!important;padding:10px 0 6px!important;text-align:left!important;overflow-x:auto;overflow-y:hidden;-webkit-overflow-scrolling:touch;scrollbar-color:#caa15f #e6efec}',
      '#traffic .qily-traffic-kline__svg{display:block!important;width:auto!important;height:auto!important;max-width:none!important;margin:0!important;margin-left:0!important;margin-right:0!important;background:transparent;overflow:visible;font-family:inherit}',
      '#traffic .qily-traffic-kline__status{display:none!important}',
      '#traffic .qily-traffic-kline__legend{display:flex;align-items:flex-start;flex-wrap:wrap;gap:14px 28px;margin-top:18px;font-size:20px!important;line-height:1.75;color:#526f70!important;-webkit-text-fill-color:#526f70!important}',
      '#traffic .qily-traffic-kline__legend>span{display:inline-flex;align-items:flex-start;gap:8px;line-height:1.75}#traffic .qily-traffic-kline__swatch{display:inline-block;flex:0 0 12px;width:12px;height:12px;margin:8px 0 0;border-radius:2px}',
      '#traffic .qily-traffic-kline__foot{display:none!important}',
      '@media(max-width:620px){#traffic .qily-traffic-kline{padding:18px 14px}#traffic .qily-traffic-kline__head{align-items:flex-start}#traffic .qily-traffic-kline__legend{gap:12px 20px}}'
    ].join('');
    (d.head || d.documentElement).appendChild(s);
  }
  function mount() {
    style();
    shell = el('section', 'qily-traffic-kline');
    shell.setAttribute('aria-label', '中国站每日访问趋势图');
    var header = el('div', 'qily-traffic-kline__head');
    header.appendChild(el('h3', '', 'DAILY PV · 每日访问量趋势'));
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
    chartBox = el('div', 'qily-traffic-kline__scroll');
    chartBox.setAttribute('role', 'region');
    chartBox.setAttribute('aria-label','可横向浏览的中国站每日访问量趋势图');
    chartBox.tabIndex = 0;
    shell.appendChild(chartBox);
    statusBox = el('p', 'qily-traffic-kline__status', '正在读取分时访问数据…');
    statusBox.setAttribute('aria-live','off');
    statusBox.hidden = true;
    statusBox.setAttribute('aria-hidden','true');
    var legend = el('div','qily-traffic-kline__legend');
    [
      ['#c49a4e','金色：末时段访问量 ≥ 首时段'],
      ['#178b94','蓝绿色：末时段访问量 < 首时段'],
      ['#78a7a5','柱形：每日总访问量']
    ].forEach(function (v) {
      var item=el('span');var mark=el('span','qily-traffic-kline__swatch');mark.style.backgroundColor=v[0];item.appendChild(mark);item.appendChild(d.createTextNode(v[1]));legend.appendChild(item);
    });
    shell.appendChild(legend);
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
        // Today's trend must not include future 6-hour intervals:
        // missing future values must never count as an observed daily low.
        var observedSlots=day===dayClock()
          ? vals.slice(0,Math.floor(new Date(Date.now()+8*3600000).getUTCHours()/6)+1)
          : vals;
        return {date:day,slots:vals,error:error,has:has,
          firstSlot:observedSlots[0],peak:Math.max.apply(Math,observedSlots),
          trough:Math.min.apply(Math,observedSlots),
          lastSlot:observedSlots[observedSlots.length-1],
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
      statusBox.textContent=failed?'部分分时统计暂不可读取，请稍后刷新。':'尚无可绘制的真实分时访问量，首批访问会逐步形成趋势图。';
      return;
    }
    var availableWidth=Math.max(300,chartBox.clientWidth||host.clientWidth||360);
    var width=Math.max(availableWidth,days.length*(availableWidth<520?56:68)+160),height=460;
    var left=132,right=28,top=84,bottom=250,volumeTop=350,volumeBottom=398;
    var usable=width-left-right, step=usable/days.length;
    var valid=days.filter(function(p){return p.has&&!p.error;});
    var maxCount=Math.max.apply(Math,valid.map(function(p){return p.peak;}));
    var maxY=Math.max(4,Math.ceil(maxCount*1.18));
    var maxV=Math.max(1,Math.max.apply(Math,valid.map(function(p){return p.volume;})));
    var root=svg('svg',{viewBox:'0 0 '+width+' '+height,width:width,height:height,
      role:'img','aria-label':'近'+range+'日中国站访问量趋势图，展示6小时访问量与每日总访问量',
      class:'qily-traffic-kline__svg'},chartBox);
    svg('title',{},root,'中国站每日访问量趋势图');
    function y(val){return bottom-(val/maxY)*(bottom-top);}
    for(var t=0;t<=4;t++){
      var val=Math.round(maxY*t/4),yy=y(maxY*t/4);
      svg('line',{x1:left,y1:yy,x2:width-right,y2:yy,stroke:'#d3e1dd','stroke-opacity':'.9','stroke-dasharray':'3 5'},root);
      svg('text',{x:left-7,y:yy+4,'text-anchor':'end',fill:'#526f70','font-size':20,'data-qily-kline-tick':t===4?'top':String(t)},root,String(val));
    }
    svg('text',{x:0,y:24,'text-anchor':'start',fill:'#8a6331','font-size':20,'font-weight':650,'data-qily-kline-axis':'six-hour'},root,'6小时访问量');
    svg('text',{x:0,y:290,'text-anchor':'start',fill:'#8a6331','font-size':20,'font-weight':650,'data-qily-kline-axis':'daily-total'},root,'每日总访问量');
    svg('line',{x1:left,y1:volumeBottom,x2:width-right,y2:volumeBottom,stroke:'#708a8d'},root);
    days.forEach(function(p,i){
      var x=left+step*(i+.5),group=svg('g',{},root);
      var label=p.date.slice(5).replace('-','/');
      if(p.error||!p.has){
        svg('line',{x1:x-6,y1:bottom-4,x2:x+6,y2:bottom-4,stroke:'#769397','stroke-dasharray':'2 3'},group);
        svg('title',{},group,p.date+(p.error?' 部分时段读取失败':' 尚无采集记录'));
      } else {
        var lastY=y(p.lastSlot),firstY=y(p.firstSlot);
        var col=p.lastSlot>=p.firstSlot?'#c49a4e':'#178b94';
        svg('line',{x1:x,y1:y(p.peak),x2:x,y2:y(p.trough),stroke:col,'stroke-width':2.4},group);
        svg('rect',{x:x-10,y:Math.min(firstY,lastY)-.8,width:20,
          height:Math.max(3.5,Math.abs(lastY-firstY)+1.6),rx:1.8,
          fill:col,'fill-opacity':'.88',stroke:col,'stroke-width':1},group);
        // Direct labels make the graph readable without hover, including phones.
        // The interval peak label is the day's highest recorded 6-hour PV, not a daily total.
        svg('text',{x:x,y:Math.max(top+4,y(p.peak)-12),'text-anchor':'middle',
          fill:'#8a6331','font-size':20,'font-weight':750,
          'data-qily-kline-label':'high-pv','data-qily-kline-day':p.date},group,String(p.peak));
        var h=(p.volume/maxV)*(volumeBottom-volumeTop);
        svg('rect',{x:x-9,y:volumeBottom-h,width:18,height:Math.max(2,h),rx:1,
          fill:'#78a7a5','fill-opacity':'.98'},group);
        // Volume labels are observed daily PV, excluding presentation base.
        svg('text',{x:x,y:Math.max(volumeTop-12,volumeBottom-h-10),'text-anchor':'middle',
          fill:'#0f4b5a','font-size':20,'font-weight':750,
          'data-qily-kline-label':'daily-pv','data-qily-kline-day':p.date},group,String(p.volume));
        svg('title',{},group,p.date+'｜每日总访问量 '+p.volume+'；6小时访问量：首时段 '+p.firstSlot+'、最高 '+p.peak+'、最低 '+p.trough+'、末时段 '+p.lastSlot);
      }
      svg('text',{x:x,y:430,'text-anchor':'middle',fill:'#526f70','font-size':20},root,label);
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
