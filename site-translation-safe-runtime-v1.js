/* QilyLean Safe In-Page Translation V4｜2026-08-28
 * Chinese static HTML remains the authoritative source and default display.
 * V4 is optimized for long, content-heavy manufacturing pages:
 * 1) translation is progressive and cache-first; visible content is prioritized;
 * 2) a failed batch NEVER rolls an already translated page back to Chinese;
 * 3) failed work is adaptively split into smaller serial batches and retried across all endpoints;
 * 4) partial translation is preserved and healed in the background;
 * 5) late-rendered content is re-collected and translated without forcing reloads.
 */
(function(d,w){
  'use strict';
  if(w.__qilyTranslationSafeInPageV2)return;
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
  var ENDPOINT_KEY='qily_translation_preferred_endpoint_v2';
  var ENDPOINTS=['https://api.qilylean.com','https://ai-api.qilylean.com','https://qilylean-ai.dinghunter623.workers.dev'];
  var LANGUAGES=[
    ['zh-CN','中文原文'],['en','English'],['zh-TW','中文（繁體）'],['ja','日本語'],['ko','한국어'],['vi','Tiếng Việt'],['th','ไทย'],
    ['id','Bahasa Indonesia'],['ms','Bahasa Melayu'],['fil','Filipino'],['my','မြန်မာ'],['km','ខ្មែរ'],['lo','ລາວ'],
    ['fr','Français'],['de','Deutsch'],['es','Español'],['pt','Português'],['it','Italiano'],['nl','Nederlands'],
    ['ru','Русский'],['uk','Українська'],['pl','Polski'],['cs','Čeština'],['sk','Slovenčina'],['hu','Magyar'],
    ['ro','Română'],['bg','Български'],['el','Ελληνικά'],['sr','Српски'],['hr','Hrvatski'],['bs','Bosanski'],
    ['sl','Slovenščina'],['mk','Македонски'],['sq','Shqip'],['sv','Svenska'],['no','Norsk'],['da','Dansk'],
    ['fi','Suomi'],['is','Íslenska'],['et','Eesti'],['lv','Latviešu'],['lt','Lietuvių'],['ga','Gaeilge'],
    ['cy','Cymraeg'],['ca','Català'],['eu','Euskara'],['gl','Galego'],['mt','Malti'],['tr','Türkçe'],
    ['ar','العربية'],['he','עברית'],['fa','فارسی'],['ur','اردو'],['ps','پښتو'],['hi','हिन्दी'],
    ['bn','বাংলা'],['pa','ਪੰਜਾਬੀ'],['gu','ગુજરાતી'],['mr','मराठी'],['ta','தமிழ்'],['te','తెలుగు'],
    ['kn','ಕನ್ನಡ'],['ml','മലയാളം'],['ne','नेपाली'],['si','සිංහල'],['mn','Монгол'],['kk','Қазақша'],
    ['uz','Oʻzbekcha'],['az','Azərbaycanca'],['ka','ქართული'],['hy','Հայերեն'],['sw','Kiswahili'],['af','Afrikaans'],
    ['zu','isiZulu'],['xh','isiXhosa'],['am','አማርኛ'],['so','Soomaali'],['ha','Hausa'],['yo','Yorùbá'],
    ['ig','Igbo'],['rw','Kinyarwanda'],['mg','Malagasy'],['sn','Shona'],['st','Sesotho']
  ];
  var SKIP=new Set(['SCRIPT','STYLE','NOSCRIPT','CODE','PRE','SVG','CANVAS','TEXTAREA','IFRAME']);
  var ATTRS=['title','aria-label','aria-description','placeholder','alt'];
  var originalText=new WeakMap(),originalAttrs=new WeakMap(),trackedText=new Set(),trackedAttr=new Set();
  var activeLanguage=SOURCE,activeAbort=null,sequence=0,chosenEndpoint='',delayed=[],dynamicObserver=null,dynamicTimer=0;

  function languageName(code){for(var i=0;i<LANGUAGES.length;i+=1)if(LANGUAGES[i][0]===code)return LANGUAGES[i][1];return code}
  function setDocumentLanguage(code,mode){d.documentElement.setAttribute('lang',code||SOURCE);d.documentElement.setAttribute('dir',/^(ar|he|fa|ur|ps)(-|$)/i.test(code||'')?'rtl':'ltr');d.documentElement.setAttribute('data-qily-language',code||SOURCE);d.documentElement.setAttribute('data-qily-language-mode',mode||'source-default')}
  function emit(code,state,reason){try{d.dispatchEvent(new CustomEvent('qily:language-change',{detail:{language:code,state:state,reason:reason||'',runtime:'safe-inpage-v4'}}))}catch(error){}}
  function primaryNav(){return d.querySelector('header .qily-global-nav,header nav.site-nav,header nav.nav,header nav[aria-label="QilyLean核心导视"],header nav[aria-label="网站导航"],header nav')}
  function control(){return d.getElementById(CONTROL_ID)}
  function setState(state,message){var c=control();if(!c)return;c.setAttribute('data-state',state||'idle');c.setAttribute('data-qily-public-message',message||'')}
  function selectTarget(code){var c=control(),select=c&&c.querySelector('.qily-web-translate__select');if(select&&select.value!==code)select.value=code}
  function shouldSkip(element){if(!element||element.nodeType!==1)return false;if(SKIP.has(element.tagName))return true;if(element.closest&&element.closest('[data-qily-no-translate],#'+CONTROL_ID))return true;return element.getAttribute&&element.getAttribute('translate')==='no'}
  function meaningful(value){var text=String(value||'').replace(/\s+/g,' ').trim();if(!text)return false;if(text.length<2&&!/[\u3400-\u9fff]/.test(text))return false;if(/^(https?:\/\/|mailto:|tel:|www\.)/i.test(text))return false;if(/^[\d\s.,:;!?%+\-–—_/#|·•→←↑↓()（）\[\]{}<>]+$/.test(text))return false;return /[\u3400-\u9fff]/.test(text)}
  function rememberText(node){if(!originalText.has(node))originalText.set(node,node.nodeValue||'');trackedText.add(node);return originalText.get(node)||''}
  function rememberAttr(element,attr){var map=originalAttrs.get(element);if(!map){map={};originalAttrs.set(element,map)}if(!Object.prototype.hasOwnProperty.call(map,attr))map[attr]=element.getAttribute(attr)||'';trackedAttr.add(element);return map[attr]||''}
  function nearViewport(el){if(!el||!el.getBoundingClientRect)return false;var rect=el.getBoundingClientRect();var h=w.innerHeight||d.documentElement.clientHeight||800;return rect.bottom>=-220&&rect.top<=h*1.65}
  function collect(root){
    root=root||d.body;if(!root)return[];var records=[];
    var walker=d.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode:function(node){var parent=node.parentElement;if(!parent||shouldSkip(parent))return NodeFilter.FILTER_REJECT;var source=rememberText(node);return meaningful(source)?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT}});
    var node;while((node=walker.nextNode()))records.push({type:'text',node:node,source:rememberText(node),priority:nearViewport(node.parentElement)?0:1});
    var elements=root.querySelectorAll?root.querySelectorAll('*'):[];
    for(var i=0;i<elements.length;i+=1){var el=elements[i];if(shouldSkip(el))continue;var priority=nearViewport(el)?0:1;for(var j=0;j<ATTRS.length;j+=1){var attr=ATTRS[j];if(!el.hasAttribute(attr))continue;var sourceAttr=rememberAttr(el,attr);if(meaningful(sourceAttr))records.push({type:'attr',element:el,attr:attr,source:sourceAttr,priority:priority})}}
    var title=d.querySelector('title');if(root===d.body&&title&&title.firstChild){var titleSource=rememberText(title.firstChild);if(meaningful(titleSource))records.push({type:'text',node:title.firstChild,source:titleSource,priority:0})}
    return records;
  }
  function sourceMap(records){var map=new Map();records.forEach(function(record){var list=map.get(record.source);if(!list){list=[];map.set(record.source,list)}list.push(record)});return map}
  function uniqueByPriority(records){var seen=new Set(),visible=[],background=[];records.forEach(function(record){if(seen.has(record.source))return;seen.add(record.source);(record.priority===0?visible:background).push(record.source)});return{visible:visible,background:background,all:visible.concat(background)}}
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
  async function healthy(base,signal){var response=await fetchTimeout(base+'/health',{method:'GET',headers:{Accept:'application/json'},cache:'no-store'},2800,signal);if(!response.ok)throw new Error('health '+response.status);return base}
  async function resolveEndpoint(signal){if(chosenEndpoint)return chosenEndpoint;var saved=preferredEndpoint();if(saved){chosenEndpoint=saved;return saved}var probes=ENDPOINTS.map(function(base){return healthy(base,signal)});try{var base=typeof Promise.any==='function'?await Promise.any(probes):(await Promise.all(probes.map(function(p){return p.catch(function(){return''})}))).find(Boolean);if(base){rememberEndpoint(base);return base}}catch(error){}chosenEndpoint=ENDPOINTS[ENDPOINTS.length-1];return chosenEndpoint}
  function warmEndpoint(){if(chosenEndpoint||preferredEndpoint())return;var controller=new AbortController();resolveEndpoint(controller.signal).catch(function(){})}
  async function requestBatch(base,target,texts,signal){var response=await fetchTimeout(base+'/translate',{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify({source_language:SOURCE,target_language:target,texts:texts,route:'site'}),cache:'no-store'},26000,signal);var data=await response.json().catch(function(){return{}});if(!response.ok||!data.ok||!Array.isArray(data.translations)||data.translations.length!==texts.length){var error=new Error('translate '+response.status);error.status=response.status;throw error}rememberEndpoint(base);return data.translations}
  function retryableStatus(status){return !status||status===408||status===409||status===413||status===425||status===429||status>=500}
  async function requestBatchWithRetry(target,texts,signal){var first=await resolveEndpoint(signal);var order=[first].concat(ENDPOINTS.filter(function(base){return base!==first}));var lastError=null;for(var i=0;i<order.length;i+=1){try{return await requestBatch(order[i],target,texts,signal)}catch(error){lastError=error;if(signal.aborted)throw error;if(!retryableStatus(error&&error.status))throw error;forgetEndpoint(order[i]);if(i<order.length-1)await new Promise(function(resolve){w.setTimeout(resolve,120+i*120)})}}throw lastError||new Error('translation unavailable')}
  function restoreTracked(){trackedText.forEach(function(node){if(node&&node.isConnected&&originalText.has(node))node.nodeValue=originalText.get(node)});trackedAttr.forEach(function(el){if(!el||!el.isConnected)return;var map=originalAttrs.get(el)||{};Object.keys(map).forEach(function(attr){el.setAttribute(attr,map[attr])})})}
  function stopDynamicObserver(){if(dynamicObserver){dynamicObserver.disconnect();dynamicObserver=null}if(dynamicTimer){w.clearTimeout(dynamicTimer);dynamicTimer=0}}
  function clearDelayed(){delayed.forEach(function(timer){w.clearTimeout(timer)});delayed=[]}
  function restoreChinese(){sequence+=1;activeLanguage=SOURCE;if(activeAbort){try{activeAbort.abort()}catch(error){}activeAbort=null}clearDelayed();stopDynamicObserver();restoreTracked();selectTarget(SOURCE);setDocumentLanguage(SOURCE,'source-default');setState('idle','中文原文');emit(SOURCE,'source')}
  async function translateSources(target,sources,map,cache,mySequence,signal,maxItems,maxChars,concurrency){
    var missing=sources.filter(function(source){return!cache[source]});if(!missing.length)return[];var groups=group(missing,maxItems,maxChars),cursor=0,failed=[];
    async function worker(){while(cursor<groups.length){var texts=groups[cursor++];if(signal.aborted||mySequence!==sequence)return;try{var translated=await requestBatchWithRetry(target,texts,signal);for(var i=0;i<texts.length;i+=1){var value=String(translated[i]||'').trim();if(!value){failed.push(texts[i]);continue}cache[texts[i]]=value;applySource(texts[i],value,map)}writeCache(target,cache)}catch(error){if(signal.aborted||mySequence!==sequence)return;failed=failed.concat(texts)}}}
    var jobs=[];for(var n=0;n<Math.min(concurrency,groups.length);n+=1)jobs.push(worker());await Promise.all(jobs);return Array.from(new Set(failed));
  }
  function wait(ms,signal){return new Promise(function(resolve){var done=false,timer=0;function finish(){if(done)return;done=true;if(timer)w.clearTimeout(timer);if(signal)signal.removeEventListener('abort',finish);resolve()}timer=w.setTimeout(finish,ms);delayed.push(timer);if(signal){if(signal.aborted)finish();else signal.addEventListener('abort',finish,{once:true})}})}
  async function retryFailedAdaptive(target,failed,map,cache,mySequence,signal){
    var remaining=Array.from(new Set(failed||[]));if(!remaining.length)return[];
    var passes=[{wait:320,items:6,chars:1200},{wait:700,items:3,chars:650},{wait:1200,items:1,chars:320}];
    for(var i=0;i<passes.length&&remaining.length;i+=1){await wait(passes[i].wait,signal);if(signal.aborted||mySequence!==sequence)return remaining;remaining=await translateSources(target,remaining,map,cache,mySequence,signal,passes[i].items,passes[i].chars,1)}
    return remaining;
  }
  function scheduleDynamic(target,mySequence){stopDynamicObserver();if(!w.MutationObserver||target===SOURCE)return;dynamicObserver=new MutationObserver(function(records){var changed=false;for(var i=0;i<records.length;i+=1){if(records[i].addedNodes&&records[i].addedNodes.length){changed=true;break}}if(!changed)return;if(dynamicTimer)w.clearTimeout(dynamicTimer);dynamicTimer=w.setTimeout(function(){dynamicTimer=0;translateNewContent(target,mySequence,'dom-added')},420)});dynamicObserver.observe(d.body,{childList:true,subtree:true})}
  function scheduleHealing(target,mySequence){[900,2600,6200,12000].forEach(function(ms){delayed.push(w.setTimeout(function(){translateNewContent(target,mySequence,'scheduled-heal')},ms))})}
  async function translate(target){
    if(!target||target===SOURCE){restoreChinese();return}
    sequence+=1;var mySequence=sequence,previous=activeLanguage;activeLanguage=target;if(activeAbort){try{activeAbort.abort()}catch(error){}}activeAbort=new AbortController();clearDelayed();stopDynamicObserver();if(previous!==target)restoreTracked();selectTarget(target);
    setDocumentLanguage(target,'translation-working');setState('working','正在翻译 '+languageName(target));emit(target,'working');
    var records=collect(d.body),map=sourceMap(records),order=uniqueByPriority(records),cache=readCache(target);applyCache(records,cache);
    var visibleMissing=order.visible.filter(function(source){return!cache[source]}),backgroundMissing=order.background.filter(function(source){return!cache[source]}),unresolved=[];
    try{
      var failedVisible=await translateSources(target,visibleMissing,map,cache,mySequence,activeAbort.signal,8,1400,2);
      if(mySequence!==sequence||activeAbort.signal.aborted)return;
      if(failedVisible.length)failedVisible=await retryFailedAdaptive(target,failedVisible,map,cache,mySequence,activeAbort.signal);
      if(mySequence!==sequence||activeAbort.signal.aborted)return;unresolved=unresolved.concat(failedVisible);
      setState('working',backgroundMissing.length?'正在完成剩余内容':languageName(target));
      var failedBackground=await translateSources(target,backgroundMissing,map,cache,mySequence,activeAbort.signal,12,2800,2);
      if(mySequence!==sequence||activeAbort.signal.aborted)return;
      if(failedBackground.length)failedBackground=await retryFailedAdaptive(target,failedBackground,map,cache,mySequence,activeAbort.signal);
      if(mySequence!==sequence||activeAbort.signal.aborted)return;unresolved=Array.from(new Set(unresolved.concat(failedBackground)));
      if(unresolved.length){setDocumentLanguage(target,'translated-partial');setState('partial','已保留翻译结果，少量内容继续重试');emit(target,'translated-partial','unresolved:'+unresolved.length)}else{setDocumentLanguage(target,'translated');setState('idle',languageName(target));emit(target,'translated')}
      scheduleDynamic(target,mySequence);scheduleHealing(target,mySequence);
    }catch(error){
      if(mySequence!==sequence||activeAbort.signal.aborted)return;
      setDocumentLanguage(target,'translated-partial');setState('partial','翻译服务波动，已保留当前翻译并继续重试');emit(target,'translated-partial','service-temporary');scheduleDynamic(target,mySequence);scheduleHealing(target,mySequence)
    }
  }
  async function translateNewContent(target,mySequence,reason){
    if(mySequence!==sequence||activeLanguage!==target||target===SOURCE||!activeAbort)return;var records=collect(d.body),map=sourceMap(records),order=uniqueByPriority(records),cache=readCache(target);applyCache(records,cache);var missing=order.all.filter(function(source){return!cache[source]});if(!missing.length){setState('idle',languageName(target));setDocumentLanguage(target,'translated');return}
    try{setState('working',reason==='dom-added'?'正在翻译新增内容':'正在完善未翻译内容');var failed=await translateSources(target,missing,map,cache,mySequence,activeAbort.signal,8,1800,1);if(failed.length)failed=await retryFailedAdaptive(target,failed,map,cache,mySequence,activeAbort.signal);if(mySequence!==sequence||activeAbort.signal.aborted)return;if(failed.length){setState('partial','已保留翻译结果，少量内容稍后重试');setDocumentLanguage(target,'translated-partial')}else{setState('idle',languageName(target));setDocumentLanguage(target,'translated');emit(target,'translated')}}catch(error){if(mySequence===sequence&&!activeAbort.signal.aborted){setState('partial','翻译服务波动，当前结果已保留');setDocumentLanguage(target,'translated-partial')}}
  }
  function buildControl(){
    var wrapper=d.createElement('div');wrapper.id=CONTROL_ID;wrapper.className='qily-web-translate';wrapper.setAttribute('data-qily-no-translate','true');wrapper.setAttribute('translate','no');wrapper.setAttribute('role','group');wrapper.setAttribute('aria-label','网页翻译');wrapper.title='本站默认显示中文原文；选择语言后在当前网页内分段翻译。';wrapper.setAttribute('data-state','idle');
    var mark=d.createElement('span');mark.className='qily-web-translate__mark';mark.setAttribute('aria-hidden','true');mark.textContent='🌐';var brand=d.createElement('span');brand.className='qily-web-translate__brand';brand.textContent='网页翻译';var select=d.createElement('select');select.className='qily-web-translate__select';select.setAttribute('aria-label','网页翻译语言');LANGUAGES.forEach(function(item){var option=d.createElement('option');option.value=item[0];option.textContent=item[1];select.appendChild(option)});select.value=SOURCE;select.addEventListener('pointerdown',warmEndpoint,{passive:true,once:true});select.addEventListener('focus',warmEndpoint,{passive:true,once:true});select.addEventListener('change',function(){translate(select.value)});wrapper.appendChild(mark);wrapper.appendChild(brand);wrapper.appendChild(select);return wrapper
  }
  function ensureControl(){var existing=control();if(existing&&existing.getAttribute('data-qily-safe-runtime')==='v4')return existing;if(existing)existing.remove();var nav=primaryNav();if(!nav)return null;var c=buildControl();c.setAttribute('data-qily-safe-runtime','v4');nav.appendChild(c);if(activeLanguage!==SOURCE)selectTarget(activeLanguage);return c}
  function boot(){setDocumentLanguage(SOURCE,'source-default');ensureControl();emit(SOURCE,'source')}
  if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',boot,{once:true});else boot();d.addEventListener('qily:shell-ready',ensureControl);w.addEventListener('pageshow',function(){ensureControl();if(activeLanguage!==SOURCE){selectTarget(activeLanguage);scheduleHealing(activeLanguage,sequence)}},{passive:true});
  w.QilyGlobalTranslation=Object.freeze({version:'safe-inpage-v4',sourceLanguage:SOURCE,defaultDisplayLanguage:SOURCE,automaticTranslation:false,noExternalProxy:true,restoreChinese:restoreChinese,translateCurrentPage:function(target){translate(target);return true}});
})(document,window);
