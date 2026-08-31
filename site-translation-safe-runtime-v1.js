/* QilyLean Safe In-Page Translation V7｜2026-08-31
 * Chinese static HTML remains the authoritative source and default display.
 * V5 is optimized for long, content-heavy manufacturing pages:
 * 1) translation is progressive and cache-first; visible content is prioritized;
 * 2) a failed batch NEVER rolls an already translated page back to Chinese;
 * 3) one bounded foreground task runs at a time; failed work is retried serially;
 * 4) partial translation is preserved and healed in the background;
 * 5) hero/title content has a dedicated first-readable lane before the rest of the viewport;
 * 6) late-rendered content is re-collected without overlapping scheduled sweeps;
 * 7) native language-pickers never start network or page scans until selection closes;
 * 8) translation is a header utility sibling, never part of the horizontally scrolling business navigation.
 */
(function(d,w){
  'use strict';
  if(w.__qilyTranslationSafeInPageV3)return;
  w.__qilyTranslationSafeInPageV3=true;
  w.__qilyTranslationSafeInPageV2=true;
  w.__qilyTranslationSafeInPageV1=true;

  w.__qilyGlobalTranslationDualRouteV2=true;
  w.__qilyGoogleTranslateOnDemandV1=true;
  w.__qilyGlobalLanguageV31=true;
  w.__qilyGlobalLanguageV3=true;
  w.__qilyGlobalLanguageV2=true;
  w.__qilyGlobalLanguageV1=true;

  var CONTROL_ID='qilyGlobalTranslationDualRouteV2';
  var SOURCE='zh-CN';
  var CACHE_PREFIX='qily_translation_safe_v1_';
  var ENDPOINT_KEY='qily_translation_preferred_endpoint_v3';
  var ENDPOINTS=['https://qilylean-ai.dinghunter623.workers.dev','https://api.qilylean.com','https://ai-api.qilylean.com'];
  var LANGUAGES=[
    ['zh-CN','中文简体'],['zh-TW','中文繁体'],['en','English']
  ];
  var SKIP=new Set(['SCRIPT','STYLE','NOSCRIPT','CODE','PRE','SVG','CANVAS','TEXTAREA','IFRAME']);
  var ATTRS=['title','aria-label','aria-description','placeholder','alt'];
  var originalText=new WeakMap(),originalAttrs=new WeakMap(),trackedText=new Set(),trackedAttr=new Set();
  var activeLanguage=SOURCE,activeAbort=null,sequence=0,chosenEndpoint='',delayed=[],dynamicObserver=null,dynamicTimer=0,followupRunning=false,changeTimer=0;

  function languageName(code){for(var i=0;i<LANGUAGES.length;i+=1)if(LANGUAGES[i][0]===code)return LANGUAGES[i][1];return code}
  function setAttributeIfChanged(element,name,value){if(element.getAttribute(name)!==value)element.setAttribute(name,value)}
  function setDocumentLanguage(code,mode){code=code||SOURCE;setAttributeIfChanged(d.documentElement,'lang',code);setAttributeIfChanged(d.documentElement,'dir',/^(ar|he|fa|ur|ps)(-|$)/i.test(code)?'rtl':'ltr');setAttributeIfChanged(d.documentElement,'data-qily-language',code);setAttributeIfChanged(d.documentElement,'data-qily-language-mode',mode||'source-default')}
  function emit(code,state,reason){try{d.dispatchEvent(new CustomEvent('qily:language-change',{detail:{language:code,state:state,reason:reason||'',runtime:'safe-inpage-v7'}}))}catch(error){}}
  function primaryNav(){return d.querySelector('header .qily-global-nav,header nav.site-nav,header nav.nav,header nav[aria-label="QilyLean核心导视"],header nav[aria-label="网站导航"],header nav')}
  function control(){return d.getElementById(CONTROL_ID)}
  function setState(state,message){var c=control();if(!c)return;setAttributeIfChanged(c,'data-state',state||'idle');setAttributeIfChanged(c,'data-qily-public-message',message||'')}
  function selectTarget(code){var c=control(),select=c&&c.querySelector('.qily-web-translate__select');if(select&&select.value!==code)select.value=code}
  function shouldSkip(element){if(!element||element.nodeType!==1)return false;if(SKIP.has(element.tagName))return true;if(element.closest&&element.closest('[data-qily-no-translate],#'+CONTROL_ID))return true;return element.getAttribute&&element.getAttribute('translate')==='no'}
  function meaningful(value){var text=String(value||'').replace(/\s+/g,' ').trim();if(!text)return false;if(text.length<2&&!/[\u3400-\u9fff]/.test(text))return false;if(/^(https?:\/\/|mailto:|tel:|www\.)/i.test(text))return false;if(/^[\d\s.,:;!?%+\-–—_/#|·•→←↑↓()（）\[\]{}<>]+$/.test(text))return false;return /[\u3400-\u9fff]/.test(text)}
  function rememberText(node){if(!originalText.has(node))originalText.set(node,node.nodeValue||'');trackedText.add(node);return originalText.get(node)||''}
  function rememberAttr(element,attr){var map=originalAttrs.get(element);if(!map){map={};originalAttrs.set(element,map)}if(!Object.prototype.hasOwnProperty.call(map,attr))map[attr]=element.getAttribute(attr)||'';trackedAttr.add(element);return map[attr]||''}
  function nearViewport(el){if(!el||!el.getBoundingClientRect)return false;var rect=el.getBoundingClientRect();var h=w.innerHeight||d.documentElement.clientHeight||800;return rect.bottom>=-220&&rect.top<=h*1.65}
  function translationPriority(el){if(!nearViewport(el))return 2;if(el&&el.closest&&el.closest('h1,.hero,.module-hero,.project-hero,.knowledge-hero,.capability-hero,.experience-hero,.improvement-hero,.cooperation-hero,[data-qily-translation-priority="critical"]'))return 0;return 1}
  function collect(root){
    root=root||d.body;if(!root)return[];var records=[],priorityCache=new WeakMap();
    function priorityFor(element){if(!element)return 2;if(priorityCache.has(element))return priorityCache.get(element);var value=translationPriority(element);priorityCache.set(element,value);return value}
    var walker=d.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode:function(node){var parent=node.parentElement;if(!parent||shouldSkip(parent))return NodeFilter.FILTER_REJECT;var source=rememberText(node);return meaningful(source)?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT}});
    var node;while((node=walker.nextNode()))records.push({type:'text',node:node,source:rememberText(node),priority:priorityFor(node.parentElement)});
    var elements=root.querySelectorAll?root.querySelectorAll('*'):[];
    for(var i=0;i<elements.length;i+=1){var el=elements[i];if(shouldSkip(el))continue;var priority=priorityFor(el);for(var j=0;j<ATTRS.length;j+=1){var attr=ATTRS[j];if(!el.hasAttribute(attr))continue;var sourceAttr=rememberAttr(el,attr);if(meaningful(sourceAttr))records.push({type:'attr',element:el,attr:attr,source:sourceAttr,priority:priority})}}
    var title=d.querySelector('title');if(root===d.body&&title&&title.firstChild){var titleSource=rememberText(title.firstChild);if(meaningful(titleSource))records.push({type:'text',node:title.firstChild,source:titleSource,priority:0})}
    return records;
  }
  function sourceMap(records){var map=new Map();records.forEach(function(record){var list=map.get(record.source);if(!list){list=[];map.set(record.source,list)}list.push(record)});return map}
  function uniqueByPriority(records){var seen=new Set(),critical=[],visible=[],background=[];records.forEach(function(record){if(seen.has(record.source))return;seen.add(record.source);if(record.priority===0)critical.push(record.source);else if(record.priority===1)visible.push(record.source);else background.push(record.source)});return{critical:critical,visible:visible,background:background,all:critical.concat(visible,background)}}
  function group(sources,maxItems,maxChars){var out=[],current=[],chars=0;sources.forEach(function(source){if(current.length&&(current.length>=maxItems||chars+source.length>maxChars)){out.push(current);current=[];chars=0}current.push(source);chars+=source.length});if(current.length)out.push(current);return out}
  function cacheKey(code){return CACHE_PREFIX+code}
  function readCache(code){try{return JSON.parse(w.localStorage.getItem(cacheKey(code))||'{}')||{}}catch(error){return{}}}
  function writeCache(code,cache){try{var keys=Object.keys(cache);if(keys.length>2200){var next={};keys.slice(keys.length-1800).forEach(function(key){next[key]=cache[key]});cache=next}w.localStorage.setItem(cacheKey(code),JSON.stringify(cache))}catch(error){}}
  function apply(record,value){if(!value||value===record.source)return;if(record.type==='text'&&record.node&&record.node.isConnected)record.node.nodeValue=value;if(record.type==='attr'&&record.element&&record.element.isConnected)record.element.setAttribute(record.attr,value)}
  function applySource(source,value,map){var list=map.get(source)||[];for(var i=0;i<list.length;i+=1)apply(list[i],value)}
  function applyCache(records,cache){var map=sourceMap(records);Object.keys(cache).forEach(function(source){if(map.has(source)&&cache[source])applySource(source,cache[source],map)})}
  function fetchTimeout(url,options,ms,parentSignal){var controller=new AbortController(),timer=w.setTimeout(function(){controller.abort()},ms);function parentAbort(){controller.abort()}if(parentSignal){if(parentSignal.aborted)controller.abort();else parentSignal.addEventListener('abort',parentAbort,{once:true})}options=options||{};options.signal=controller.signal;return fetch(url,options).finally(function(){w.clearTimeout(timer);if(parentSignal)parentSignal.removeEventListener('abort',parentAbort)})}
  function preferredEndpoint(){try{var raw=w.sessionStorage.getItem(ENDPOINT_KEY)||w.localStorage.getItem(ENDPOINT_KEY)||'';var parsed=JSON.parse(raw||'{}');if(parsed&&ENDPOINTS.indexOf(parsed.base)!==-1&&Date.now()-Number(parsed.time||0)<21600000)return parsed.base}catch(error){}return''}
  function rememberEndpoint(base){if(ENDPOINTS.indexOf(base)===-1)return;chosenEndpoint=base;var value=JSON.stringify({base:base,time:Date.now()});try{w.sessionStorage.setItem(ENDPOINT_KEY,value);w.localStorage.setItem(ENDPOINT_KEY,value)}catch(error){}}
  function forgetEndpoint(base){if(chosenEndpoint===base)chosenEndpoint='';try{var saved=preferredEndpoint();if(!base||saved===base){w.sessionStorage.removeItem(ENDPOINT_KEY);w.localStorage.removeItem(ENDPOINT_KEY)}}catch(error){}}
  async function resolveEndpoint(signal){
    if(signal&&signal.aborted)throw new Error('translation aborted');
    if(chosenEndpoint)return chosenEndpoint;var saved=preferredEndpoint();if(saved){chosenEndpoint=saved;return saved}
    chosenEndpoint=ENDPOINTS[0];return chosenEndpoint
  }
  async function requestBatch(base,target,texts,signal){var chars=texts.reduce(function(total,text){return total+text.length},0),timeout=Math.min(18000,9000+chars*5);var response=await fetchTimeout(base+'/translate',{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify({source_language:SOURCE,target_language:target,texts:texts,route:'site'}),cache:'no-store'},timeout,signal);var data=await response.json().catch(function(){return{}});if(!response.ok||!data.ok||!Array.isArray(data.translations)||data.translations.length!==texts.length){var error=new Error('translate '+response.status);error.status=response.status;throw error}rememberEndpoint(base);return data.translations}
  function retryableStatus(status){return !status||status===408||status===409||status===413||status===425||status===429||status>=500}
  async function requestBatchWithRetry(target,texts,signal){var first=await resolveEndpoint(signal);var order=[first].concat(ENDPOINTS.filter(function(base){return base!==first}));var lastError=null;for(var i=0;i<order.length;i+=1){try{return await requestBatch(order[i],target,texts,signal)}catch(error){lastError=error;if(signal.aborted)throw error;if(!retryableStatus(error&&error.status))throw error;forgetEndpoint(order[i]);if(i<order.length-1)await new Promise(function(resolve){w.setTimeout(resolve,120+i*120)})}}throw lastError||new Error('translation unavailable')}
  function yieldMainThread(){return new Promise(function(resolve){if(d.hidden||!w.requestAnimationFrame){w.setTimeout(resolve,0);return}w.requestAnimationFrame(function(){resolve()})})}
  async function restoreTracked(expectedSequence){
    var textNodes=Array.from(trackedText),elements=Array.from(trackedAttr),processed=0;
    for(var i=0;i<textNodes.length;i+=1){if(expectedSequence!==sequence)return false;var node=textNodes[i];if(node&&node.isConnected&&originalText.has(node))node.nodeValue=originalText.get(node);processed+=1;if(processed%120===0)await yieldMainThread()}
    for(var j=0;j<elements.length;j+=1){if(expectedSequence!==sequence)return false;var el=elements[j];if(el&&el.isConnected){var map=originalAttrs.get(el)||{};Object.keys(map).forEach(function(attr){el.setAttribute(attr,map[attr])})}processed+=1;if(processed%120===0)await yieldMainThread()}
    return expectedSequence===sequence
  }
  function stopDynamicObserver(){if(dynamicObserver){dynamicObserver.disconnect();dynamicObserver=null}if(dynamicTimer){w.clearTimeout(dynamicTimer);dynamicTimer=0}}
  function clearDelayed(){delayed.forEach(function(timer){w.clearTimeout(timer)});delayed=[]}
  async function restoreChinese(){
    sequence+=1;var mySequence=sequence;activeLanguage=SOURCE;followupRunning=false;if(activeAbort){try{activeAbort.abort()}catch(error){}activeAbort=null}if(changeTimer){w.clearTimeout(changeTimer);changeTimer=0}clearDelayed();stopDynamicObserver();selectTarget(SOURCE);setDocumentLanguage(SOURCE,'source-restoring');setState('working','正在恢复中文简体');
    await yieldMainThread();var restored=await restoreTracked(mySequence);if(!restored||mySequence!==sequence)return;
    setDocumentLanguage(SOURCE,'source-default');setState('idle','中文简体');emit(SOURCE,'source')
  }
  async function translateSources(target,sources,map,cache,mySequence,signal,maxItems,maxChars,concurrency){
    var missing=sources.filter(function(source){return!cache[source]});if(!missing.length)return[];var groups=group(missing,maxItems,maxChars),cursor=0,failed=[];
    async function worker(){while(cursor<groups.length){var texts=groups[cursor++];if(signal.aborted||mySequence!==sequence)return;try{var translated=await requestBatchWithRetry(target,texts,signal);for(var i=0;i<texts.length;i+=1){var value=String(translated[i]||'').trim();if(!value){failed.push(texts[i]);continue}cache[texts[i]]=value;applySource(texts[i],value,map)}writeCache(target,cache)}catch(error){if(signal.aborted||mySequence!==sequence)return;failed=failed.concat(texts)}}}
    var jobs=[];for(var n=0;n<Math.min(concurrency,groups.length);n+=1)jobs.push(worker());await Promise.all(jobs);return Array.from(new Set(failed))
  }
  function wait(ms,signal){return new Promise(function(resolve){var done=false,timer=0;function finish(){if(done)return;done=true;if(timer)w.clearTimeout(timer);if(signal)signal.removeEventListener('abort',finish);resolve()}timer=w.setTimeout(finish,ms);delayed.push(timer);if(signal){if(signal.aborted)finish();else signal.addEventListener('abort',finish,{once:true})}})}
  async function retryFailedAdaptive(target,failed,map,cache,mySequence,signal){
    var remaining=Array.from(new Set(failed||[]));if(!remaining.length)return[];
    var passes=[{wait:320,items:6,chars:1200},{wait:700,items:3,chars:650},{wait:1200,items:1,chars:320}];
    for(var i=0;i<passes.length&&remaining.length;i+=1){await wait(passes[i].wait,signal);if(signal.aborted||mySequence!==sequence)return remaining;remaining=await translateSources(target,remaining,map,cache,mySequence,signal,passes[i].items,passes[i].chars,1)}
    return remaining
  }
  function scheduleDynamic(target,mySequence){stopDynamicObserver();if(!w.MutationObserver||target===SOURCE)return;dynamicObserver=new MutationObserver(function(records){var changed=false;for(var i=0;i<records.length;i+=1){if(records[i].addedNodes&&records[i].addedNodes.length){changed=true;break}}if(!changed)return;if(dynamicTimer)w.clearTimeout(dynamicTimer);dynamicTimer=w.setTimeout(function(){dynamicTimer=0;translateNewContent(target,mySequence,'dom-added')},420)});dynamicObserver.observe(d.body,{childList:true,subtree:true})}
  function scheduleHealing(target,mySequence){[3000,10000].forEach(function(ms){delayed.push(w.setTimeout(function(){translateNewContent(target,mySequence,'scheduled-heal')},ms))})}
  async function translate(target){
    if(!target||target===SOURCE){await restoreChinese();return}
    sequence+=1;var mySequence=sequence,previous=activeLanguage;activeLanguage=target;followupRunning=false;if(activeAbort){try{activeAbort.abort()}catch(error){}}activeAbort=new AbortController();clearDelayed();stopDynamicObserver();selectTarget(target);
    setDocumentLanguage(target,'translation-working');setState('working','正在翻译 '+languageName(target));emit(target,'working');
    await yieldMainThread();if(mySequence!==sequence||activeAbort.signal.aborted)return;
    if(previous!==SOURCE&&previous!==target){var restored=await restoreTracked(mySequence);if(!restored||mySequence!==sequence||activeAbort.signal.aborted)return;await yieldMainThread()}
    var records=collect(d.body),map=sourceMap(records),order=uniqueByPriority(records),cache=readCache(target);applyCache(records,cache);
    var criticalMissing=order.critical.filter(function(source){return!cache[source]}),visibleMissing=order.visible.filter(function(source){return!cache[source]}),backgroundMissing=order.background.filter(function(source){return!cache[source]}),unresolved=[];
    try{
      var firstReadableEmitted=false;
      function markFirstReadable(reason){if(firstReadableEmitted||!order.critical.some(function(source){return!!cache[source]}))return;firstReadableEmitted=true;setState('working','首批内容已显示，正在完成其余内容');emit(target,'first-readable',reason||'critical-lane')}
      var failedCritical=await translateSources(target,criticalMissing,map,cache,mySequence,activeAbort.signal,8,1200,1);
      if(mySequence!==sequence||activeAbort.signal.aborted)return;
      markFirstReadable('critical-lane');
      if(!firstReadableEmitted)setState('working','正在优先生成首批可读内容');
      var failedCriticalRetry=failedCritical.length?await translateSources(target,failedCritical,map,cache,mySequence,activeAbort.signal,2,420,1):[];markFirstReadable('critical-retry');
      if(mySequence!==sequence||activeAbort.signal.aborted)return;
      var failedVisible=await translateSources(target,visibleMissing,map,cache,mySequence,activeAbort.signal,10,1800,2);
      if(mySequence!==sequence||activeAbort.signal.aborted)return;
      unresolved=unresolved.concat(failedCriticalRetry,failedVisible);setState('working',backgroundMissing.length?'正在后台完成剩余内容':languageName(target));
      await yieldMainThread();if(mySequence!==sequence||activeAbort.signal.aborted)return;
      var failedBackground=await translateSources(target,backgroundMissing,map,cache,mySequence,activeAbort.signal,12,2600,1);
      if(mySequence!==sequence||activeAbort.signal.aborted)return;unresolved=Array.from(new Set(unresolved.concat(failedBackground)));
      if(unresolved.length)unresolved=await retryFailedAdaptive(target,unresolved,map,cache,mySequence,activeAbort.signal);
      if(mySequence!==sequence||activeAbort.signal.aborted)return;
      if(unresolved.length){setDocumentLanguage(target,'translated-partial');setState('partial','已保留翻译结果，少量内容继续重试');emit(target,'translated-partial','unresolved:'+unresolved.length)}else{setDocumentLanguage(target,'translated');setState('idle',languageName(target));emit(target,'translated')}
      scheduleDynamic(target,mySequence);scheduleHealing(target,mySequence);
    }catch(error){
      if(mySequence!==sequence||activeAbort.signal.aborted)return;
      setDocumentLanguage(target,'translated-partial');setState('partial','翻译服务波动，已保留当前翻译并继续重试');emit(target,'translated-partial','service-temporary');scheduleDynamic(target,mySequence);scheduleHealing(target,mySequence)
    }
  }
  async function translateNewContent(target,mySequence,reason){
    if(followupRunning||mySequence!==sequence||activeLanguage!==target||target===SOURCE||!activeAbort)return;followupRunning=true;
    try{await yieldMainThread();if(mySequence!==sequence||activeAbort.signal.aborted)return;var records=collect(d.body),map=sourceMap(records),order=uniqueByPriority(records),cache=readCache(target);applyCache(records,cache);var missing=order.all.filter(function(source){return!cache[source]});if(!missing.length){setState('idle',languageName(target));setDocumentLanguage(target,'translated');return}setState('working',reason==='dom-added'?'正在翻译新增内容':'正在完善未翻译内容');var failed=await translateSources(target,missing,map,cache,mySequence,activeAbort.signal,8,1800,1);if(failed.length)failed=await retryFailedAdaptive(target,failed,map,cache,mySequence,activeAbort.signal);if(mySequence!==sequence||activeAbort.signal.aborted)return;if(failed.length){setState('partial','已保留翻译结果，少量内容稍后重试');setDocumentLanguage(target,'translated-partial')}else{setState('idle',languageName(target));setDocumentLanguage(target,'translated');emit(target,'translated')}}catch(error){if(mySequence===sequence&&!activeAbort.signal.aborted){setState('partial','翻译服务波动，当前结果已保留');setDocumentLanguage(target,'translated-partial')}}finally{followupRunning=false}
  }
  function buildControl(){
    var wrapper=d.createElement('div');wrapper.id=CONTROL_ID;wrapper.className='qily-web-translate';wrapper.setAttribute('data-qily-no-translate','true');wrapper.setAttribute('data-qily-header-utility','translation');wrapper.setAttribute('translate','no');wrapper.setAttribute('role','group');wrapper.setAttribute('aria-label','网页翻译');wrapper.title='默认中文简体；可切换中文繁体或 English。';wrapper.setAttribute('data-state','idle');
    var mark=d.createElement('span');mark.className='qily-web-translate__mark';mark.setAttribute('aria-hidden','true');mark.textContent='🌐';var brand=d.createElement('span');brand.className='qily-web-translate__brand';brand.textContent='网页翻译';var select=d.createElement('select');select.className='qily-web-translate__select';select.setAttribute('aria-label','网页翻译语言');LANGUAGES.forEach(function(item){var option=d.createElement('option');option.value=item[0];option.textContent=item[1];option.label=item[1];select.appendChild(option)});select.value=SOURCE;select.addEventListener('change',function(){var target=select.value;if(changeTimer)w.clearTimeout(changeTimer);changeTimer=w.setTimeout(function(){changeTimer=0;translate(target)},0)});wrapper.appendChild(mark);wrapper.appendChild(brand);wrapper.appendChild(select);return wrapper
  }
  function placeControl(controlNode,nav){
    var header=nav&&nav.closest&&nav.closest('header');
    if(!header){if(nav&&controlNode.parentNode!==nav)nav.appendChild(controlNode);return controlNode}
    var rail=header.querySelector('.qily-primary-nav-scroll-rail');
    if(controlNode.parentNode!==header||controlNode.nextElementSibling!==rail)header.insertBefore(controlNode,rail||null);
    return controlNode
  }
  function ensureControl(){var nav=primaryNav();if(!nav)return null;var existing=control();if(existing&&existing.getAttribute('data-qily-safe-runtime')==='v7'){placeControl(existing,nav);return existing}if(existing)existing.remove();var c=buildControl();c.setAttribute('data-qily-safe-runtime','v7');placeControl(c,nav);if(activeLanguage!==SOURCE)selectTarget(activeLanguage);return c}
  function boot(){setDocumentLanguage(SOURCE,'source-default');ensureControl();emit(SOURCE,'source')}
  if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',boot,{once:true});else boot();d.addEventListener('qily:shell-ready',ensureControl);w.addEventListener('pageshow',function(){ensureControl();if(activeLanguage!==SOURCE){selectTarget(activeLanguage);scheduleHealing(activeLanguage,sequence)}},{passive:true});
  w.QilyGlobalTranslation=Object.freeze({version:'safe-inpage-v7-header-utility',sourceLanguage:SOURCE,defaultDisplayLanguage:SOURCE,automaticTranslation:false,noExternalProxy:true,restoreChinese:restoreChinese,translateCurrentPage:function(target){translate(target);return true}})
})(document,window);
