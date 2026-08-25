/* QilyLean Safe In-Page Translation V1｜2026-08-25
 * Chinese static HTML remains the authoritative source and default display.
 * User-initiated translation stays inside qilylean.com: no translate.goog redirect,
 * no external proxy page, no third-party translation toolbar.
 */
(function(d,w){
  'use strict';
  if(w.__qilyTranslationSafeInPageV1)return;
  w.__qilyTranslationSafeInPageV1=true;

  /* Pre-empt retired runtimes before deferred shell scripts execute. */
  w.__qilyGlobalTranslationDualRouteV2=true;
  w.__qilyGoogleTranslateOnDemandV1=true;
  w.__qilyGlobalLanguageV31=true;
  w.__qilyGlobalLanguageV3=true;
  w.__qilyGlobalLanguageV2=true;
  w.__qilyGlobalLanguageV1=true;

  var CONTROL_ID='qilyGlobalTranslationDualRouteV2';
  var SOURCE='zh-CN';
  var CACHE_PREFIX='qily_translation_safe_v1_';
  var ENDPOINTS=[
    'https://api.qilylean.com',
    'https://ai-api.qilylean.com',
    'https://qilylean-ai.dinghunter623.workers.dev'
  ];
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
  var originalText=new WeakMap();
  var originalAttrs=new WeakMap();
  var trackedText=new Set();
  var trackedAttr=new Set();
  var activeLanguage=SOURCE;
  var activeAbort=null;
  var sequence=0;
  var chosenEndpoint='';
  var delayed=[];

  function languageName(code){for(var i=0;i<LANGUAGES.length;i+=1)if(LANGUAGES[i][0]===code)return LANGUAGES[i][1];return code}
  function setDocumentLanguage(code,mode){
    d.documentElement.setAttribute('lang',code||SOURCE);
    d.documentElement.setAttribute('dir',/^(ar|he|fa|ur|ps)(-|$)/i.test(code||'')?'rtl':'ltr');
    d.documentElement.setAttribute('data-qily-language',code||SOURCE);
    d.documentElement.setAttribute('data-qily-language-mode',mode||'source-default');
  }
  function emit(code,state){
    try{d.dispatchEvent(new CustomEvent('qily:language-change',{detail:{language:code,state:state,runtime:'safe-inpage-v1'}}))}catch(error){}
  }
  function primaryNav(){return d.querySelector('header .qily-global-nav,header nav.site-nav,header nav.nav,header nav[aria-label="QilyLean核心导视"],header nav[aria-label="网站导航"],header nav')}
  function control(){return d.getElementById(CONTROL_ID)}
  function setState(state,message){
    var c=control();if(!c)return;
    c.setAttribute('data-state',state||'idle');
    c.setAttribute('data-qily-public-message',message||'');
  }
  function shouldSkip(element){
    if(!element||element.nodeType!==1)return false;
    if(SKIP.has(element.tagName))return true;
    if(element.closest&&element.closest('[data-qily-no-translate],#'+CONTROL_ID))return true;
    return element.getAttribute&&element.getAttribute('translate')==='no';
  }
  function meaningful(value){
    var text=String(value||'').replace(/\s+/g,' ').trim();
    if(!text||text.length<2)return false;
    if(/^(https?:\/\/|mailto:|tel:|www\.)/i.test(text))return false;
    if(/^[\d\s.,:;!?%+\-–—_/#|·•→←↑↓()（）\[\]{}<>]+$/.test(text))return false;
    return /[\u3400-\u9fff]/.test(text);
  }
  function rememberText(node){if(!originalText.has(node))originalText.set(node,node.nodeValue||'');trackedText.add(node);return originalText.get(node)||''}
  function rememberAttr(element,attr){var map=originalAttrs.get(element);if(!map){map={};originalAttrs.set(element,map)}if(!Object.prototype.hasOwnProperty.call(map,attr))map[attr]=element.getAttribute(attr)||'';trackedAttr.add(element);return map[attr]||''}
  function collect(root){
    root=root||d.body;if(!root)return[];
    var records=[];
    var walker=d.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode:function(node){var parent=node.parentElement;if(!parent||shouldSkip(parent))return NodeFilter.FILTER_REJECT;var source=rememberText(node);return meaningful(source)?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT}});
    var node;while((node=walker.nextNode()))records.push({type:'text',node:node,source:rememberText(node)});
    var elements=root.querySelectorAll?root.querySelectorAll('*'):[];
    for(var i=0;i<elements.length;i+=1){var el=elements[i];if(shouldSkip(el))continue;for(var j=0;j<ATTRS.length;j+=1){var attr=ATTRS[j];if(!el.hasAttribute(attr))continue;var sourceAttr=rememberAttr(el,attr);if(meaningful(sourceAttr))records.push({type:'attr',element:el,attr:attr,source:sourceAttr})}}
    var title=d.querySelector('title');
    if(root===d.body&&title&&title.firstChild&&!shouldSkip(title)){var titleSource=rememberText(title.firstChild);if(meaningful(titleSource))records.push({type:'text',node:title.firstChild,source:titleSource})}
    return records;
  }
  function unique(records){var seen=new Set(),out=[];records.forEach(function(record){if(!seen.has(record.source)){seen.add(record.source);out.push(record.source)}});return out}
  function group(sources){var out=[],current=[],chars=0;sources.forEach(function(source){if(current.length&&(current.length>=16||chars+source.length>3200)){out.push(current);current=[];chars=0}current.push(source);chars+=source.length});if(current.length)out.push(current);return out}
  function cacheKey(code){return CACHE_PREFIX+code}
  function readCache(code){try{return JSON.parse(w.localStorage.getItem(cacheKey(code))||'{}')||{}}catch(error){return{}}}
  function writeCache(code,cache){try{var keys=Object.keys(cache);if(keys.length>1400){var next={};keys.slice(keys.length-1000).forEach(function(key){next[key]=cache[key]});cache=next}w.localStorage.setItem(cacheKey(code),JSON.stringify(cache))}catch(error){}}
  function apply(record,value){if(!value||value===record.source)return;if(record.type==='text'&&record.node&&record.node.isConnected)record.node.nodeValue=value;if(record.type==='attr'&&record.element&&record.element.isConnected)record.element.setAttribute(record.attr,value)}
  function applyCache(records,cache){records.forEach(function(record){if(cache[record.source])apply(record,cache[record.source])})}
  function fetchTimeout(url,options,ms,parentSignal){
    var controller=new AbortController();var timer=w.setTimeout(function(){controller.abort()},ms);function parentAbort(){controller.abort()}
    if(parentSignal){if(parentSignal.aborted)controller.abort();else parentSignal.addEventListener('abort',parentAbort,{once:true})}
    options=options||{};options.signal=controller.signal;
    return fetch(url,options).finally(function(){w.clearTimeout(timer);if(parentSignal)parentSignal.removeEventListener('abort',parentAbort)})
  }
  async function healthy(base,signal){var response=await fetchTimeout(base+'/health',{method:'GET',headers:{Accept:'application/json'},cache:'no-store'},5000,signal);if(!response.ok)throw new Error('health '+response.status);return base}
  async function resolveEndpoint(signal){
    if(chosenEndpoint)return chosenEndpoint;
    var probes=ENDPOINTS.map(function(base){return healthy(base,signal)});
    if(typeof Promise.any==='function')chosenEndpoint=await Promise.any(probes);
    else{var settled=await Promise.all(probes.map(function(p){return p.then(function(v){return v},function(){return''})}));chosenEndpoint=settled.find(Boolean)||'';if(!chosenEndpoint)throw new Error('translation unavailable')}
    return chosenEndpoint;
  }
  async function requestBatch(base,target,texts,signal){
    var response=await fetchTimeout(base+'/translate',{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify({source_language:SOURCE,target_language:target,texts:texts,route:'site'})},32000,signal);
    var data=await response.json().catch(function(){return{}});
    if(!response.ok||!data.ok||!Array.isArray(data.translations)||data.translations.length!==texts.length)throw new Error('translate '+response.status);
    return data.translations;
  }
  async function requestBatchWithRetry(target,texts,signal){
    var first=await resolveEndpoint(signal);
    try{return await requestBatch(first,target,texts,signal)}catch(error){chosenEndpoint='';var second=await resolveEndpoint(signal);return requestBatch(second,target,texts,signal)}
  }
  function restoreChinese(){
    sequence+=1;activeLanguage=SOURCE;if(activeAbort){try{activeAbort.abort()}catch(error){}activeAbort=null}
    delayed.forEach(function(timer){w.clearTimeout(timer)});delayed=[];
    trackedText.forEach(function(node){if(node&&node.isConnected&&originalText.has(node))node.nodeValue=originalText.get(node)});
    trackedAttr.forEach(function(el){if(!el||!el.isConnected)return;var map=originalAttrs.get(el)||{};Object.keys(map).forEach(function(attr){el.setAttribute(attr,map[attr])})});
    var select=control()&&control().querySelector('.qily-web-translate__select');if(select)select.value=SOURCE;
    setDocumentLanguage(SOURCE,'source-default');setState('idle','中文原文');emit(SOURCE,'source');
  }
  async function translateRecords(target,records,mySequence,signal){
    var cache=readCache(target);applyCache(records,cache);
    var all=unique(records);var missing=all.filter(function(source){return!cache[source]});if(!missing.length)return{total:all.length,done:all.length,failures:0};
    var groups=group(missing),cursor=0,done=0,failures=0;
    async function worker(){while(cursor<groups.length){var index=cursor++;var texts=groups[index];if(signal.aborted||mySequence!==sequence)return;try{var translated=await requestBatchWithRetry(target,texts,signal);for(var i=0;i<texts.length;i+=1)cache[texts[i]]=translated[i]||texts[i];writeCache(target,cache);records.forEach(function(record){if(texts.indexOf(record.source)!==-1)apply(record,cache[record.source])});done+=texts.length;setState('working','正在翻译 '+Math.min(all.length,done)+'/'+all.length)}catch(error){if(signal.aborted||mySequence!==sequence)return;failures+=texts.length}}}
    await Promise.all([worker(),worker()]);return{total:all.length,done:all.length-failures,failures:failures};
  }
  async function translate(target){
    if(!target||target===SOURCE){restoreChinese();return}
    sequence+=1;var mySequence=sequence;activeLanguage=target;if(activeAbort){try{activeAbort.abort()}catch(error){}}activeAbort=new AbortController();
    delayed.forEach(function(timer){w.clearTimeout(timer)});delayed=[];
    trackedText.forEach(function(node){if(node&&node.isConnected&&originalText.has(node))node.nodeValue=originalText.get(node)});
    trackedAttr.forEach(function(el){if(!el||!el.isConnected)return;var map=originalAttrs.get(el)||{};Object.keys(map).forEach(function(attr){el.setAttribute(attr,map[attr])})});
    setDocumentLanguage(SOURCE,'translation-working');setState('working','正在翻译 '+languageName(target));emit(target,'working');
    var records=collect(d.body);
    try{
      var result=await translateRecords(target,records,mySequence,activeAbort.signal);
      if(mySequence!==sequence||activeAbort.signal.aborted)return;
      if(!result.done){restoreChinese();setState('error','翻译服务暂不可用，已保留中文');emit(SOURCE,'error');return}
      setDocumentLanguage(target,result.failures?'translated-partial':'translated');
      setState(result.failures?'partial':'idle',result.failures?'部分内容暂未翻译':languageName(target));emit(target,result.failures?'partial':'translated');
      delayed.push(w.setTimeout(function(){translateNewContent(target,mySequence)},1100));
      delayed.push(w.setTimeout(function(){translateNewContent(target,mySequence)},3200));
    }catch(error){if(mySequence!==sequence||activeAbort.signal.aborted)return;restoreChinese();setState('error','翻译服务暂不可用，已保留中文');emit(SOURCE,'error')}
  }
  async function translateNewContent(target,mySequence){
    if(mySequence!==sequence||activeLanguage!==target||target===SOURCE)return;
    var records=collect(d.body);if(!records.length)return;
    try{await translateRecords(target,records,mySequence,activeAbort&&activeAbort.signal);if(mySequence===sequence)setDocumentLanguage(target,'translated')}catch(error){}
  }
  function buildControl(){
    var wrapper=d.createElement('div');wrapper.id=CONTROL_ID;wrapper.className='qily-web-translate';wrapper.setAttribute('data-qily-no-translate','true');wrapper.setAttribute('translate','no');wrapper.setAttribute('role','group');wrapper.setAttribute('aria-label','网页翻译');wrapper.title='本站默认显示中文原文；选择语言后在当前网页内翻译。';wrapper.setAttribute('data-state','idle');
    var mark=d.createElement('span');mark.className='qily-web-translate__mark';mark.setAttribute('aria-hidden','true');mark.textContent='🌐';
    var brand=d.createElement('span');brand.className='qily-web-translate__brand';brand.textContent='网页翻译';
    var select=d.createElement('select');select.className='qily-web-translate__select';select.setAttribute('aria-label','网页翻译语言');LANGUAGES.forEach(function(item){var option=d.createElement('option');option.value=item[0];option.textContent=item[1];select.appendChild(option)});select.value=SOURCE;
    select.addEventListener('change',function(){translate(select.value)});
    wrapper.appendChild(mark);wrapper.appendChild(brand);wrapper.appendChild(select);return wrapper;
  }
  function ensureControl(){
    var existing=control();if(existing&&existing.getAttribute('data-qily-safe-runtime')==='v1')return existing;
    if(existing)existing.remove();var nav=primaryNav();if(!nav)return null;var c=buildControl();c.setAttribute('data-qily-safe-runtime','v1');nav.appendChild(c);return c;
  }
  function boot(){setDocumentLanguage(SOURCE,'source-default');ensureControl();emit(SOURCE,'source')}
  if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
  d.addEventListener('qily:shell-ready',ensureControl);w.addEventListener('pageshow',ensureControl,{passive:true});
  if(w.MutationObserver){var queued=false;new MutationObserver(function(){if(queued)return;queued=true;w.requestAnimationFrame(function(){queued=false;ensureControl()})}).observe(d.documentElement,{childList:true,subtree:true})}
  w.QilyGlobalTranslation=Object.freeze({version:'safe-inpage-v1',sourceLanguage:SOURCE,defaultDisplayLanguage:SOURCE,automaticTranslation:false,noExternalProxy:true,restoreChinese:restoreChinese,translateCurrentPage:function(target){translate(target);return true}});
})(document,window);
