/* QilyLean Global Language V3.1｜2026-08-25
 * Chinese static HTML remains the authoritative source; English is the default visitor display language.
 * V3.1 closes runtime conflicts where other sitewide self-healing scripts rewrite translated DOM text back to Chinese.
 */
(function (d, w) {
  'use strict';
  if (w.__qilyGlobalLanguageV31) return;
  w.__qilyGlobalLanguageV31 = true;
  w.__qilyGlobalLanguageV3 = true;
  w.__qilyGlobalLanguageV2 = true;
  w.__qilyGlobalLanguageV1 = true;

  var TRANSLATE_API = 'https://qilylean-ai.dinghunter623.workers.dev/translate';
  var CHAT_API = 'https://qilylean-ai.dinghunter623.workers.dev/chat';
  var SOURCE_LANGUAGE = 'zh-CN';
  var DEFAULT_LANGUAGE = 'en';
  var STORAGE_KEY = 'qily_global_language_v3';
  var CACHE_PREFIX = 'qily_translation_cache_v3_';
  var SWITCHER_ID = 'qilyGlobalLanguageV1';
  var STATUS_ID = 'qilyGlobalLanguageStatusV1';
  var RUNTIME_VERSION = 'v3.1';
  var TEXT_ORIGINAL = new WeakMap();
  var ATTR_ORIGINAL = new WeakMap();
  var TRACKED_TEXT = new Set();
  var TRACKED_ATTR = [];
  var OBSERVED_ROOTS = new WeakSet();
  var OBSERVERS = [];
  var translationGeneration = 0;
  var activeLanguage = DEFAULT_LANGUAGE;
  var dynamicTimer = 0;

  var LANGUAGES = [
    ['en','English'], ['zh-CN','中文（简体）'], ['zh-TW','中文（繁體）'], ['ja','日本語'], ['ko','한국어'],
    ['fr','Français'], ['de','Deutsch'], ['es','Español'], ['pt','Português'], ['it','Italiano'], ['nl','Nederlands'],
    ['ru','Русский'], ['uk','Українська'], ['pl','Polski'], ['cs','Čeština'], ['sk','Slovenčina'], ['hu','Magyar'],
    ['ro','Română'], ['bg','Български'], ['el','Ελληνικά'], ['sr','Српски'], ['hr','Hrvatski'], ['bs','Bosanski'],
    ['sl','Slovenščina'], ['mk','Македонски'], ['sq','Shqip'], ['sv','Svenska'], ['no','Norsk'], ['da','Dansk'],
    ['fi','Suomi'], ['is','Íslenska'], ['et','Eesti'], ['lv','Latviešu'], ['lt','Lietuvių'], ['ga','Gaeilge'],
    ['cy','Cymraeg'], ['ca','Català'], ['eu','Euskara'], ['gl','Galego'], ['mt','Malti'], ['tr','Türkçe'],
    ['ar','العربية'], ['he','עברית'], ['fa','فارسی'], ['ur','اردو'], ['ps','پښتو'], ['hi','हिन्दी'],
    ['bn','বাংলা'], ['pa','ਪੰਜਾਬੀ'], ['gu','ગુજરાતી'], ['mr','मराठी'], ['ta','தமிழ்'], ['te','తెలుగు'],
    ['kn','ಕನ್ನಡ'], ['ml','മലയാളം'], ['ne','नेपाली'], ['si','සිංහල'], ['th','ไทย'], ['vi','Tiếng Việt'],
    ['id','Bahasa Indonesia'], ['ms','Bahasa Melayu'], ['fil','Filipino'], ['my','မြန်မာ'], ['km','ខ្មែរ'], ['lo','ລາວ'],
    ['mn','Монгол'], ['kk','Қазақша'], ['uz','Oʻzbekcha'], ['az','Azərbaycanca'], ['ka','ქართული'], ['hy','Հայերեն'],
    ['sw','Kiswahili'], ['af','Afrikaans'], ['zu','isiZulu'], ['xh','isiXhosa'], ['am','አማርኛ'], ['so','Soomaali'],
    ['ha','Hausa'], ['yo','Yorùbá'], ['ig','Igbo'], ['rw','Kinyarwanda'], ['mg','Malagasy'], ['sn','Shona'],
    ['st','Sesotho'], ['eo','Esperanto'], ['la','Latina']
  ];

  var RTL = new Set(['ar','he','fa','ur','ps']);
  var EXCLUDED = 'script,style,noscript,code,pre,kbd,samp,textarea,[contenteditable="true"],[data-qily-no-translate],[translate="no"],.qily-language-switcher';
  var TRANSLATABLE_ATTRS = ['title','aria-label','aria-description','placeholder','alt'];
  var BUILTIN_EN = Object.freeze({
    '首页':'Home','履历主线':'Experience','能力体系':'Capabilities','改善方法':'Improvement Methods','代表项目':'Projects',
    '信任中心':'Trust Center','项目合作':'Project Cooperation','知识资产':'Knowledge Assets','友情链接':'Resources','资源协同':'Resources',
    '精益生产':'Lean Manufacturing','精益生产专题':'Lean Manufacturing','数字化工厂':'Digital Factory','标准工时':'Standard Time','单件流':'One-Piece Flow','线平衡':'Line Balancing',
    '回顶部':'Back to Top','回上一层':'Up One Level','回到当前页面所属的上一级有效页面':'Go to the parent page','本站搜索':'Site Search',
    '分享当前页':'Share Page','分享官网':'Share Website','交流':'Contact','查看能力体系':'View Capabilities',
    '查看代表项目与证据':'View Projects & Evidence','进入项目合作':'Project Cooperation','了解责任与证据边界':'Responsibility & Evidence Boundaries'
  });

  function languageExists(code) { return LANGUAGES.some(function (item) { return item[0] === code; }); }
  function getStoredLanguage() {
    try {
      var value = w.localStorage.getItem(STORAGE_KEY) || DEFAULT_LANGUAGE;
      return languageExists(value) ? value : DEFAULT_LANGUAGE;
    } catch (error) { return DEFAULT_LANGUAGE; }
  }
  function storeLanguage(value) { try { w.localStorage.setItem(STORAGE_KEY, value); } catch (error) {} }
  function languageLabel(code) {
    for (var i=0;i<LANGUAGES.length;i+=1) if (LANGUAGES[i][0]===code) return LANGUAGES[i][1];
    return code;
  }
  function primaryNav() {
    return d.querySelector('header .qily-global-nav,header nav.site-nav,header nav.nav,header nav[aria-label="QilyLean核心导视"],header nav[aria-label="网站导航"],header nav');
  }

  function ensureSwitcher() {
    var nav = primaryNav();
    if (!nav) return false;
    var wrapper = d.getElementById(SWITCHER_ID);
    if (wrapper && wrapper.getAttribute('data-qily-language-runtime') !== RUNTIME_VERSION) { wrapper.remove(); wrapper = null; }
    if (!wrapper) {
      wrapper = d.createElement('div');
      wrapper.id = SWITCHER_ID;
      wrapper.className = 'qily-language-switcher';
      wrapper.setAttribute('data-qily-no-translate','true');
      wrapper.setAttribute('data-qily-language-runtime',RUNTIME_VERSION);
      wrapper.setAttribute('role','group');
      wrapper.setAttribute('aria-label','Website language');
      var globe = d.createElement('span');
      globe.className = 'qily-language-switcher__globe';
      globe.setAttribute('aria-hidden','true');
      globe.textContent = '🌐';
      var select = d.createElement('select');
      select.className = 'qily-language-switcher__select';
      select.setAttribute('aria-label','Select website language');
      LANGUAGES.forEach(function (item) {
        var option = d.createElement('option'); option.value=item[0]; option.textContent=item[1]; select.appendChild(option);
      });
      select.value = activeLanguage;
      select.addEventListener('change',function(){ setLanguage(select.value,true); });
      var status = d.createElement('span');
      status.id = STATUS_ID;
      status.className='qily-language-switcher__status';
      status.setAttribute('role','status');
      status.setAttribute('aria-live','polite');
      wrapper.appendChild(globe); wrapper.appendChild(select); wrapper.appendChild(status);
    }
    if (nav.lastElementChild !== wrapper) nav.appendChild(wrapper);
    return true;
  }

  function setUiState(state,message) {
    var wrapper=d.getElementById(SWITCHER_ID); if(!wrapper)return;
    wrapper.setAttribute('data-state',state||'idle');
    var select=wrapper.querySelector('select');
    if(select){ select.value=activeLanguage; select.disabled=state==='loading'; select.setAttribute('aria-busy',state==='loading'?'true':'false'); }
    var status=d.getElementById(STATUS_ID); if(status)status.textContent=message||'';
  }
  function isExcluded(element){ return !element || (element.closest && element.closest(EXCLUDED)); }
  function isProtectedText(value){ return /^(?:QilyLean|QilyLean｜启力精益|启力精益|Times26001|C919)$/i.test(String(value||'').trim()); }
  function shouldTranslate(text){
    var value=String(text||'').trim(); if(!value||isProtectedText(value))return false;
    if(/^(?:https?:\/\/|www\.|mailto:|tel:)/i.test(value))return false;
    if(/^[\d\s.,:;!?+\-–—/%‰℃°×→←↔|()（）【】\[\]{}<>_=*&^$#@~`'"·…]+$/.test(value))return false;
    if(/^[A-Z0-9][A-Z0-9_.:/+\-]{1,48}$/.test(value))return false;
    return /[A-Za-z\u00c0-\u024f\u0370-\u03ff\u0400-\u04ff\u0600-\u06ff\u0900-\u0d7f\u0e00-\u0eff\u3040-\u30ff\u3400-\u9fff\uac00-\ud7af]/.test(value);
  }

  function textRecord(node){
    if(!TEXT_ORIGINAL.has(node)){ TEXT_ORIGINAL.set(node,node.nodeValue||''); TRACKED_TEXT.add(node); }
    var full=TEXT_ORIGINAL.get(node)||'', source=full.trim(); if(!shouldTranslate(source))return null;
    var start=full.indexOf(source), leading=start>0?full.slice(0,start):'', trailing=start>=0?full.slice(start+source.length):'';
    return {source:source,apply:function(translated){
      if(!node.isConnected)return;
      var next=leading+translated+trailing;
      if(node.nodeValue!==next)node.nodeValue=next;
    }};
  }
  function attributeRecord(element,attribute){
    if(isExcluded(element)||!element.hasAttribute(attribute))return null;
    var map=ATTR_ORIGINAL.get(element); if(!map){ map=new Map(); ATTR_ORIGINAL.set(element,map); }
    if(!map.has(attribute)){ map.set(attribute,element.getAttribute(attribute)||''); TRACKED_ATTR.push([element,attribute]); }
    var source=map.get(attribute)||''; if(!shouldTranslate(source))return null;
    return {source:source,apply:function(translated){ if(element.isConnected&&element.getAttribute(attribute)!==translated)element.setAttribute(attribute,translated); }};
  }

  function collectRecords(root){
    var records=[]; if(!root)return records;
    var doc=root.nodeType===9?root:(root.ownerDocument||d);
    var scope=root.nodeType===9?(root.body||root.documentElement):root;
    if(!scope)return records;
    if(scope.nodeType===3){
      var direct=textRecord(scope); if(direct)records.push(direct); return records;
    }
    var walker=doc.createTreeWalker(scope,w.NodeFilter.SHOW_TEXT,{acceptNode:function(node){
      var parent=node.parentElement; if(!parent||isExcluded(parent))return w.NodeFilter.FILTER_REJECT;
      return shouldTranslate((node.nodeValue||'').trim())?w.NodeFilter.FILTER_ACCEPT:w.NodeFilter.FILTER_REJECT;
    }});
    var node; while((node=walker.nextNode())){ var record=textRecord(node); if(record)records.push(record); }
    var elements=[]; if(scope.nodeType===1)elements.push(scope);
    if(scope.querySelectorAll)elements=elements.concat(Array.prototype.slice.call(scope.querySelectorAll('[title],[aria-label],[aria-description],[placeholder],[alt]')));
    elements.forEach(function(element){ TRANSLATABLE_ATTRS.forEach(function(attribute){ var record=attributeRecord(element,attribute); if(record)records.push(record); }); });
    return records;
  }

  function collectWholePage(){
    var records=[], seen=new WeakSet();
    function visit(root){
      if(!root||seen.has(root))return; seen.add(root); records=records.concat(collectRecords(root));
      var scope=root.nodeType===9?(root.body||root.documentElement):root; if(!scope||!scope.querySelectorAll)return;
      Array.prototype.forEach.call(scope.querySelectorAll('*'),function(element){ if(element.shadowRoot)visit(element.shadowRoot); });
      Array.prototype.forEach.call(scope.querySelectorAll('iframe'),function(frame){
        try{ var fd=frame.contentDocument; if(fd&&fd.body)visit(fd); bindFrame(frame); }catch(error){}
      });
    }
    visit(d); return records;
  }

  function groupRecords(records){ var grouped=new Map(); records.forEach(function(record){ if(!grouped.has(record.source))grouped.set(record.source,[]); grouped.get(record.source).push(record); }); return grouped; }
  function applyTranslation(grouped,source,value){ (grouped.get(source)||[]).forEach(function(record){ record.apply(value); }); }
  function makeBatches(sources){
    var batches=[],batch=[],chars=0;
    sources.forEach(function(source){ var next=source.length+8; if(batch.length&&(batch.length>=24||chars+next>5200)){ batches.push(batch); batch=[]; chars=0; } batch.push(source); chars+=next; });
    if(batch.length)batches.push(batch); return batches;
  }
  function cacheKey(code){ return CACHE_PREFIX+code; }
  function readCache(code){ try{ var parsed=JSON.parse(w.localStorage.getItem(cacheKey(code))||'{}'); return parsed&&typeof parsed==='object'?parsed:{}; }catch(error){return{};} }
  function writeCache(code,cache){
    try{ var keys=Object.keys(cache); if(keys.length>1200){ var compact={}; keys.slice(keys.length-900).forEach(function(key){compact[key]=cache[key];}); cache=compact; } w.localStorage.setItem(cacheKey(code),JSON.stringify(cache)); }catch(error){}
  }
  function fetchWithTimeout(url,options,timeoutMs){
    var controller=new AbortController(),timer=w.setTimeout(function(){controller.abort();},timeoutMs||18000); options=options||{}; options.signal=controller.signal;
    return fetch(url,options).finally(function(){w.clearTimeout(timer);});
  }
  function parseTranslationArray(raw,expectedLength){
    var text=String(raw||'').trim(); if(text.indexOf('```')===0)text=text.replace(/^```(?:json)?\s*/i,'').replace(/\s*```$/,''); var parsed;
    try{parsed=JSON.parse(text);}catch(error){var start=text.indexOf('['),end=text.lastIndexOf(']');if(start>=0&&end>start){try{parsed=JSON.parse(text.slice(start,end+1));}catch(ignore){}}}
    if(!Array.isArray(parsed)||parsed.length!==expectedLength||parsed.some(function(item){return typeof item!=='string';}))throw new Error('translation_format_invalid'); return parsed;
  }
  async function requestDedicatedBatch(targetLanguage,texts){
    var response=await fetchWithTimeout(TRANSLATE_API,{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify({source_language:SOURCE_LANGUAGE,target_language:targetLanguage,texts:texts,page:w.location.pathname}),credentials:'omit',mode:'cors'},18000);
    var data=await response.json().catch(function(){return{};}); if(!response.ok||!data.ok||!Array.isArray(data.translations)||data.translations.length!==texts.length)throw new Error(data.error||('translate_http_'+response.status)); return data.translations;
  }
  async function requestChatFallback(targetLanguage,texts){
    var prompt='Translate this JSON array from Chinese to '+targetLanguage+'. Return ONLY a JSON array with exactly the same number and order of strings. Preserve QilyLean, 启力精益, Times26001, C919, IE, PE, ME, NPI, VSM, SMED, ECRS, OEE, UPPH, ERP, APS, MES, SOP, KPI, PQCD, IATF 16949, URLs, emails, phone numbers, units and numeric values exactly. Input: '+JSON.stringify(texts);
    var response=await fetchWithTimeout(CHAT_API,{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify({message:prompt}),credentials:'omit',mode:'cors'},36000);
    var data=await response.json().catch(function(){return{};}); if(!response.ok||!data.answer)throw new Error(data.error||('chat_http_'+response.status)); return parseTranslationArray(data.answer,texts.length);
  }
  async function requestResilient(targetLanguage,batch){
    try{ return {ok:true,batch:batch,values:await requestDedicatedBatch(targetLanguage,batch)}; }
    catch(error){
      if(batch.length>6){ var middle=Math.ceil(batch.length/2),parts=await Promise.all([requestResilient(targetLanguage,batch.slice(0,middle)),requestResilient(targetLanguage,batch.slice(middle))]); return {ok:true,parts:parts,batch:batch}; }
      try{ return {ok:true,batch:batch,values:await requestChatFallback(targetLanguage,batch)}; }
      catch(fallback){ return {ok:false,batch:batch,error:fallback||error}; }
    }
  }
  function flattenResults(result,out){ out=out||[]; if(result.parts){ result.parts.forEach(function(part){flattenResults(part,out);}); }else out.push(result); return out; }
  async function runPool(tasks,limit,worker){
    var index=0; async function runner(){ while(index<tasks.length){ var current=index++; await worker(tasks[current]); } }
    var runners=[]; for(var i=0;i<Math.min(limit,tasks.length);i+=1)runners.push(runner()); await Promise.all(runners);
  }

  async function translateRecords(records,targetLanguage,generation,statusPrefix){
    var grouped=groupRecords(records),sources=Array.from(grouped.keys()); if(!sources.length)return{total:0,failed:0};
    var cache=readCache(targetLanguage),pending=[],completed=0,failed=0;
    sources.forEach(function(source){
      var builtin=targetLanguage==='en'?BUILTIN_EN[source]:null;
      if(builtin){ cache[source]=builtin; applyTranslation(grouped,source,builtin); completed+=1; }
      else if(typeof cache[source]==='string'&&cache[source]){ applyTranslation(grouped,source,cache[source]); completed+=1; }
      else pending.push(source);
    });
    if(generation!==translationGeneration)return{total:sources.length,failed:0};
    if(completed)setUiState('loading',(statusPrefix||'Translating')+' '+completed+'/'+sources.length);
    var batches=makeBatches(pending);
    await runPool(batches,6,async function(batch){
      if(generation!==translationGeneration)return;
      var tree=await requestResilient(targetLanguage,batch),leaves=flattenResults(tree,[]);
      leaves.forEach(function(result){
        if(!result.ok){ failed+=result.batch.length; completed+=result.batch.length; return; }
        result.batch.forEach(function(source,index){ var value=result.values[index]; if(typeof value==='string'&&value){ cache[source]=value; applyTranslation(grouped,source,value); }else failed+=1; });
        completed+=result.batch.length;
      });
      writeCache(targetLanguage,cache);
      setUiState('loading',(statusPrefix||'Translating')+' '+Math.min(completed,sources.length)+'/'+sources.length);
    });
    return{total:sources.length,failed:failed};
  }

  function restoreChinese(){
    TRACKED_TEXT.forEach(function(node){ if(node.isConnected&&TEXT_ORIGINAL.has(node)){ var value=TEXT_ORIGINAL.get(node); if(node.nodeValue!==value)node.nodeValue=value; } });
    TRACKED_ATTR.forEach(function(pair){ var element=pair[0],attribute=pair[1],map=ATTR_ORIGINAL.get(element); if(element.isConnected&&map&&map.has(attribute)){ var value=map.get(attribute); if(element.getAttribute(attribute)!==value)element.setAttribute(attribute,value); } });
  }
  function applyLanguageSemantics(code){
    d.documentElement.setAttribute('lang',code);
    d.documentElement.setAttribute('data-qily-language',code);
    d.documentElement.setAttribute('data-qily-language-runtime','v3.1');
    if(RTL.has(code))d.documentElement.setAttribute('dir','rtl'); else d.documentElement.removeAttribute('dir');
  }
  function announceLanguage(code){
    try{ d.dispatchEvent(new CustomEvent('qily:language-change',{detail:{language:code,sourceLanguage:SOURCE_LANGUAGE,runtime:'v3.1'}})); }catch(error){}
  }

  function scheduleQualitySweeps(code,generation){
    [500,1400,3200,6500].forEach(function(delay){ w.setTimeout(async function(){
      if(code===SOURCE_LANGUAGE||generation!==translationGeneration||activeLanguage!==code)return;
      try{ await translateRecords(collectWholePage(),code,generation,'Optimizing'); if(generation===translationGeneration)setUiState('ready',languageLabel(code)); }catch(error){}
    },delay); });
  }

  async function setLanguage(code,persist){
    if(!languageExists(code))code=DEFAULT_LANGUAGE;
    translationGeneration+=1;
    var generation=translationGeneration;
    activeLanguage=code;
    ensureSwitcher();
    if(code===SOURCE_LANGUAGE){
      restoreChinese(); applyLanguageSemantics(code); if(persist)storeLanguage(code); setUiState('ready','中文'); announceLanguage(code); return;
    }
    restoreChinese();
    applyLanguageSemantics(code);
    announceLanguage(code);
    setUiState('loading',code==='en'?'Loading English…':'Translating to '+languageLabel(code)+'…');
    try{
      var result=await translateRecords(collectWholePage(),code,generation,code==='en'?'Loading English':'Translating');
      if(generation!==translationGeneration)return;
      activeLanguage=code; applyLanguageSemantics(code); if(persist)storeLanguage(code);
      if(result.total&&result.failed>=result.total){
        restoreChinese(); activeLanguage=SOURCE_LANGUAGE; applyLanguageSemantics(SOURCE_LANGUAGE); announceLanguage(SOURCE_LANGUAGE);
        var failedSelect=d.querySelector('#'+SWITCHER_ID+' select'); if(failedSelect)failedSelect.value=SOURCE_LANGUAGE;
        setUiState('error','Translation service unavailable'); return;
      }
      setUiState('ready',result.failed?languageLabel(code)+' · partial':languageLabel(code));
      announceLanguage(code);
      scheduleQualitySweeps(code,generation);
    }catch(error){
      if(generation!==translationGeneration)return;
      restoreChinese(); activeLanguage=SOURCE_LANGUAGE; applyLanguageSemantics(SOURCE_LANGUAGE); announceLanguage(SOURCE_LANGUAGE);
      var select=d.querySelector('#'+SWITCHER_ID+' select'); if(select)select.value=SOURCE_LANGUAGE;
      setUiState('error','Translation service unavailable'); console.warn('QilyLean Global Language V3.1:',error&&error.message?error.message:error);
    }
  }

  function scheduleDynamic(nodes){
    if(activeLanguage===SOURCE_LANGUAGE||!nodes||!nodes.length)return;
    w.clearTimeout(dynamicTimer);
    dynamicTimer=w.setTimeout(function(){
      var generation=translationGeneration,records=[];
      nodes.forEach(function(node){
        if(!node||!node.isConnected)return;
        if(node.nodeType===1&&isExcluded(node))return;
        records=records.concat(collectRecords(node));
        if(node.nodeType===1&&node.shadowRoot)records=records.concat(collectRecords(node.shadowRoot));
      });
      if(records.length)translateRecords(records,activeLanguage,generation,'').catch(function(){});
    },120);
  }

  function observerCallback(mutations){
    var changed=[];
    mutations.forEach(function(mutation){
      Array.prototype.forEach.call(mutation.addedNodes||[],function(node){
        if(node.nodeType===1&&node.id===SWITCHER_ID)return;
        changed.push(node);
        if(node.nodeType===1&&node.matches&&node.matches('iframe'))bindFrame(node);
      });
      if(mutation.type==='attributes'&&mutation.target)changed.push(mutation.target);
      if(mutation.type==='characterData'&&mutation.target){
        var parent=mutation.target.parentElement;
        if(parent&&!isExcluded(parent))changed.push(parent);
      }
    });
    ensureSwitcher();
    if(activeLanguage!==SOURCE_LANGUAGE)scheduleDynamic(changed);
  }

  function observeRoot(root){
    if(!root||OBSERVED_ROOTS.has(root)||!w.MutationObserver)return;
    OBSERVED_ROOTS.add(root);
    var observer=new MutationObserver(observerCallback);
    observer.observe(root,{childList:true,subtree:true,attributes:true,attributeFilter:TRANSLATABLE_ATTRS,characterData:true});
    OBSERVERS.push(observer);
  }
  function bindFrame(frame){
    if(!frame||frame.dataset.qilyLanguageBound==='v31')return;
    frame.dataset.qilyLanguageBound='v31';
    frame.addEventListener('load',function(){
      try{ if(frame.contentDocument&&frame.contentDocument.body){ observeRoot(frame.contentDocument.body); if(activeLanguage!==SOURCE_LANGUAGE)translateRecords(collectRecords(frame.contentDocument),activeLanguage,translationGeneration,'').catch(function(){}); } }catch(error){}
    });
    try{ if(frame.contentDocument&&frame.contentDocument.body)observeRoot(frame.contentDocument.body); }catch(error){}
  }
  function bindNestedRoots(){
    observeRoot(d.body||d.documentElement);
    Array.prototype.forEach.call(d.querySelectorAll('iframe'),bindFrame);
    Array.prototype.forEach.call(d.querySelectorAll('*'),function(element){ if(element.shadowRoot)observeRoot(element.shadowRoot); });
  }
  function boot(){ activeLanguage=getStoredLanguage(); ensureSwitcher(); bindNestedRoots(); setLanguage(activeLanguage,false); }
  d.addEventListener('qily:shell-ready',function(){ ensureSwitcher(); bindNestedRoots(); });
  w.addEventListener('pageshow',function(){ ensureSwitcher(); bindNestedRoots(); if(activeLanguage!==SOURCE_LANGUAGE)scheduleQualitySweeps(activeLanguage,translationGeneration); });
  if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',boot,{once:true}); else boot();
})(document,window);
