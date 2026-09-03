(() => {
  'use strict';

  if(window.__qilyDdzFastSiteShellV155)return;
  window.__qilyDdzFastSiteShellV155=true;

  const ROUTES=[
    ['首页','/'],
    ['履历主线','/experience/'],
    ['能力体系','/capabilities/'],
    ['改善方法','/improvements/'],
    ['精益生产','/lean-production/'],
    ['代表项目','/projects/'],
    ['信任中心','/trust/'],
    ['项目合作','/cooperation/'],
    ['知识资产','/knowledge/'],
    ['资源协同','/links/']
  ];
  const TRANSLATION_RUNTIME='/site-translation-safe-runtime-v1.js?v=20260901-google-translate-single-runtime-v16&fast=20260903-ddz-idle-v155';
  const TRANSLATION_CSS='/site-translation-public-ui-v1.css?v=20260901-google-translate-mobile-ui-v16';
  let translationRequested=false;

  function addShellStyle(){
    if(document.getElementById('qilyDdzFastShellV155Style'))return;
    const style=document.createElement('style');
    style.id='qilyDdzFastShellV155Style';
    style.textContent=`
      :root{--qily-content-axis:1560px;--qily-content-axis-gutter:clamp(18px,2.2vw,56px)}
      .qily-site-header.qily-global-header{position:sticky;top:0;z-index:8000;display:grid;grid-template-columns:auto minmax(0,1fr) auto;align-items:center;gap:18px;min-height:72px;padding:8px max(18px,calc((100vw - 1560px)/2));box-sizing:border-box;color:#182420;background:rgba(255,255,255,.985);border-bottom:1px solid #d5e4e3;box-shadow:0 5px 16px rgba(15,75,90,.055);font-family:"Microsoft YaHei","PingFang SC",Arial,sans-serif}
      .qily-global-header>.qily-brand{display:block;flex:0 0 auto;width:190px;height:38px;margin:0;overflow:hidden;background:url('/assets/brand/qilylean-logo.svg?v=20260724-logo-red-dot-v5') left center/contain no-repeat;text-indent:-9999px;white-space:nowrap;text-decoration:none}
      .qily-global-header>.qily-global-nav{display:flex;align-items:center;justify-content:flex-start;gap:4px;min-width:0;overflow-x:auto;overflow-y:hidden;white-space:nowrap;scrollbar-width:thin;-webkit-overflow-scrolling:touch;overscroll-behavior-inline:contain}
      .qily-global-header>.qily-global-nav a{display:inline-flex;flex:0 0 auto;align-items:center;justify-content:center;min-height:42px;padding:6px 10px;border:1px solid transparent;border-radius:9px;color:#182420;background:transparent;font-size:18px;font-weight:900;line-height:1.2;text-decoration:none;touch-action:manipulation;transition:background-color .15s ease,color .15s ease,border-color .15s ease,transform .15s ease}
      @media (hover:hover) and (pointer:fine){.qily-global-header>.qily-global-nav a:hover{color:#fff;background:#0f4b5a;border-color:#0f4b5a;transform:translateY(-1px)}}
      .qily-global-header>.qily-global-nav a:focus-visible{outline:3px solid rgba(202,161,95,.28);outline-offset:1px;color:#fff;background:#0f4b5a;border-color:#caa15f}
      .qily-global-header>.qily-global-nav a:active{transform:translateY(1px) scale(.985)}
      .qily-ddz-translate-wake{display:inline-flex;align-items:center;justify-content:center;min-width:188px;min-height:54px;padding:6px 12px;border:2px solid #2f7bff;border-radius:10px;color:#173c45;background:#fff;font:850 14px/1.15 "Microsoft YaHei","PingFang SC",Arial,sans-serif;white-space:nowrap;cursor:pointer;touch-action:manipulation}
      .qily-ddz-translate-wake:focus-visible{outline:3px solid rgba(47,123,255,.25);outline-offset:2px}
      .qily-ddz-translate-wake:active{transform:scale(.985)}
      @media(max-width:1100px){.qily-site-header.qily-global-header{grid-template-columns:auto minmax(0,1fr);gap:7px;padding:7px 10px}.qily-global-header>.qily-brand{width:154px;height:30px}.qily-ddz-translate-wake{grid-column:1/-1;justify-self:end;min-width:164px;min-height:40px}.qily-global-header>.qily-global-nav a{font-size:16.5px;min-height:36px;padding:5px 8px}}
      @media(max-width:620px){.qily-site-header.qily-global-header{display:grid;grid-template-columns:1fr auto;gap:5px;padding:6px 8px}.qily-global-header>.qily-brand{width:132px;height:25px;margin-left:38px}.qily-global-header>.qily-global-nav{grid-column:1/-1;grid-row:2;width:100%;gap:4px}.qily-global-header>.qily-global-nav a{font-size:16px;min-height:34px;padding:5px 7px}.qily-ddz-translate-wake{grid-column:2;grid-row:1;min-width:0;min-height:34px;padding:4px 8px;border-width:1.5px;font-size:12px}}
    `;
    document.head.appendChild(style);
  }

  function buildHeader(){
    let header=document.querySelector('header.qily-site-header');
    if(!header){
      header=document.createElement('header');
      header.className='qily-site-header qily-global-header';
      (document.body||document.documentElement).insertBefore(header,(document.body||document.documentElement).firstChild);
    }
    header.className='qily-site-header qily-global-header';
    header.setAttribute('data-qily-ddz-fast-shell','v155');

    const brand=document.createElement('a');
    brand.className='qily-brand';
    brand.href='/';
    brand.textContent='QilyLean｜启力精益';
    brand.setAttribute('aria-label','返回QilyLean首页');

    const nav=document.createElement('nav');
    nav.className='site-nav qily-global-nav';
    nav.setAttribute('aria-label','网站导航');
    ROUTES.forEach(([label,href])=>{
      const link=document.createElement('a');
      link.href=href;
      link.textContent=label;
      link.setAttribute('data-qily-ddz-nav','v155');
      nav.appendChild(link);
    });

    const wake=document.createElement('button');
    wake.id='qilyDdzTranslationWakeV155';
    wake.className='qily-ddz-translate-wake';
    wake.type='button';
    wake.textContent='🌐 中文简体';
    wake.setAttribute('aria-label','加载网站翻译器');
    wake.addEventListener('click',()=>loadTranslation('user'),{once:true});

    header.replaceChildren(brand,nav,wake);
    document.dispatchEvent(new CustomEvent('qily:shell-ready',{detail:{source:'ddz-fast-v155'}}));
  }

  function ensureTranslationCss(){
    if(document.querySelector('link[href^="/site-translation-public-ui-v1.css"]'))return;
    const link=document.createElement('link');
    link.rel='stylesheet';
    link.href=TRANSLATION_CSS;
    link.dataset.qilyDdzDeferredTranslation='v155';
    document.head.appendChild(link);
  }

  function loadTranslation(source){
    if(translationRequested)return;
    translationRequested=true;
    const wake=document.getElementById('qilyDdzTranslationWakeV155');
    if(wake){wake.disabled=true;wake.textContent='🌐 翻译加载中…';}
    ensureTranslationCss();
    const script=document.createElement('script');
    script.id='qilyDdzDeferredTranslationV155';
    script.src=TRANSLATION_RUNTIME;
    script.async=true;
    script.dataset.qilyDdzTranslationSource=source;
    script.addEventListener('load',()=>{
      setTimeout(()=>{
        if(document.getElementById('qilyGlobalTranslationDualRouteV2'))document.getElementById('qilyDdzTranslationWakeV155')?.remove();
        else if(wake){wake.disabled=false;wake.textContent='🌐 中文简体';}
      },80);
    },{once:true});
    script.addEventListener('error',()=>{
      translationRequested=false;
      if(wake){wake.disabled=false;wake.textContent='🌐 翻译稍后重试';}
    },{once:true});
    document.head.appendChild(script);
  }

  function scheduleDeferredTranslation(){
    const connection=navigator.connection||navigator.mozConnection||navigator.webkitConnection;
    const slow=Boolean(connection&&(connection.saveData||/(?:^|-)2g$/.test(connection.effectiveType||'')));
    const start=()=>{
      if('requestIdleCallback' in window){
        window.requestIdleCallback(()=>loadTranslation('idle'),{timeout:slow?10000:6000});
      }else{
        window.setTimeout(()=>loadTranslation('idle'),slow?9000:4500);
      }
    };
    if(document.readyState==='complete')start();else window.addEventListener('load',start,{once:true,passive:true});
  }

  addShellStyle();
  buildHeader();
  scheduleDeferredTranslation();

  window.QilyLeanDdzFastShell=Object.freeze({version:'1.5.5',loadTranslation});
})();
