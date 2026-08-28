/* QilyLean Site Shell Recovery + Contact Route V9｜2026-08-28
 * V9 retires the obsolete lower-right floating Dock sitewide.
 * Contact-page map sanitation and native outbound navigation remain unchanged.
 */
(function(d,w){
  'use strict';
  if(w.__qilySiteShellRecoveryV9)return;
  w.__qilySiteShellRecoveryV9=true;
  w.__qilySiteShellRecoveryV8=true;
  w.__qilySiteShellRecoveryV7=true;
  w.__qilySiteShellRecoveryV6=true;
  w.__qilySiteShellRecoveryV5=true;
  w.__qilySiteShellRecoveryV4=true;
  w.__qilyDedicatedContactRouteV4=true;
  w.__qilyDedicatedContactRouteV3=true;
  w.__qilyDedicatedContactRouteV2=true;
  w.__qilyDedicatedContactRouteV1=true;

  function injectRecoveryCss(){
    if(d.getElementById('qilySiteShellRecoveryV9Style'))return;
    var style=d.createElement('style');
    style.id='qilySiteShellRecoveryV9Style';
    style.textContent=[
      'html,html body{height:auto!important;min-height:0!important}',
      'html body{display:block!important}',
      'html body>main{height:auto!important;min-height:0!important;flex:none!important;margin-bottom:0!important;padding-bottom:0!important}',
      'html body>footer,html body>.footer,html body>.module-footer{flex:none!important;margin-top:0!important;margin-bottom:0!important}',
      '#floatDock,.qily-float-dock,.qily-floating-dock{display:none!important;visibility:hidden!important;opacity:0!important;pointer-events:none!important}',
      'html body .contact-page-v3 .map-preview iframe{display:none!important;visibility:hidden!important;opacity:0!important}',
      'html body .contact-page-v3 .qily-map-nav-panel{padding:18px 20px;border-top:1px solid #cfe0dd;background:#f7fbfa}',
      'html body .contact-page-v3 .qily-map-nav-copy strong{display:block;color:#0f4b5a!important;-webkit-text-fill-color:#0f4b5a!important;font-size:18px;font-weight:950}',
      'html body .contact-page-v3 .qily-map-nav-copy span{display:block;margin-top:5px;color:#607574!important;-webkit-text-fill-color:#607574!important;font-size:14px;line-height:1.55}',
      'html body .contact-page-v3 .qily-map-nav-actions{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:9px;margin-top:14px}',
      'html body .contact-page-v3 .qily-map-nav-action{display:flex;align-items:center;justify-content:center;min-height:46px;padding:9px 8px;border:1px solid #a9cbc7;border-radius:999px;color:#0f4b5a!important;-webkit-text-fill-color:#0f4b5a!important;background:#fff;font-size:14px;font-weight:950;line-height:1.2;text-align:center;text-decoration:none!important}',
      'html body .contact-page-v3 .qily-map-nav-action.primary{color:#fff!important;-webkit-text-fill-color:#fff!important;background:#0f4b5a;border-color:#0f4b5a}',
      'html body .contact-page-v3 .qily-map-nav-action:hover,html body .contact-page-v3 .qily-map-nav-action:focus-visible{color:#fff!important;-webkit-text-fill-color:#fff!important;background:#178b94;border-color:#178b94;outline:3px solid rgba(202,161,95,.24);outline-offset:2px}',
      '@media(max-width:920px){html body .contact-page-v3 .qily-map-nav-actions{grid-template-columns:repeat(3,minmax(0,1fr))}}',
      '@media(max-width:620px){html body .contact-page-v3 .qily-map-nav-panel{padding:16px 14px}html body .contact-page-v3 .qily-map-nav-actions{grid-template-columns:repeat(2,minmax(0,1fr));gap:7px}html body .contact-page-v3 .qily-map-nav-action{min-height:44px;padding:8px 7px;font-size:14px}html body .contact-page-v3 .qily-map-nav-action[data-qily-map-provider="apple"]{grid-column:1/-1}}'
    ].join('');
    (d.head||d.documentElement).appendChild(style);
  }

  function removeLegacyContactModal(){var mask=d.getElementById('wxMask');if(mask)mask.remove();}

  function removeRetiredDock(root){
    if(root&&root.nodeType===1&&(root.id==='floatDock'||(root.classList&&(root.classList.contains('qily-float-dock')||root.classList.contains('qily-floating-dock')))))root.remove();
    if(root&&root.querySelectorAll)root.querySelectorAll('#floatDock,.qily-float-dock,.qily-floating-dock').forEach(function(node){node.remove();});
  }

  function retireDock(){removeRetiredDock(d);}

  function installRetirementObserver(){
    if(w.__qilyFloatingDockRetirementObserverV1||!d.documentElement)return;
    w.__qilyFloatingDockRetirementObserverV1=new MutationObserver(function(records){
      records.forEach(function(record){record.addedNodes.forEach(removeRetiredDock);});
    });
    w.__qilyFloatingDockRetirementObserverV1.observe(d.documentElement,{childList:true,subtree:true});
  }

  function mapUrls(keyword,region){
    var destination=[keyword||'',region||''].filter(Boolean).join(' ');
    var q=encodeURIComponent(keyword||'');
    var r=encodeURIComponent(region||'');
    var daddr=encodeURIComponent(destination);
    return {
      amap:'https://uri.amap.com/search?keyword='+q+'&city='+r+'&callnative=1',
      baidu:'https://api.map.baidu.com/place/search?query='+q+'&region='+r+'&output=html&src=QilyLean',
      tencent:'https://apis.map.qq.com/uri/v1/search?keyword='+q+'&region='+r+'&referer=QilyLean',
      google:'https://www.google.com/maps/dir/?api=1&destination='+daddr,
      apple:'https://maps.apple.com/?daddr='+daddr+'&dirflg=d'
    };
  }

  function inferRegion(card){
    var title=card&&card.querySelector('.address-copy strong');
    var text=title?title.textContent:'';
    if(text.indexOf('温州')>=0||text.indexOf('乐清')>=0)return '温州';
    if(text.indexOf('东莞')>=0)return '东莞';
    if(text.indexOf('宁波')>=0)return '宁波';
    return '';
  }

  function createCleanMapPanel(keyword,region){
    var urls=mapUrls(keyword,region);
    var panel=d.createElement('div');
    panel.className='qily-map-nav-panel';
    panel.setAttribute('data-qily-clean-map-nav','v2');
    panel.setAttribute('aria-label',(keyword||'联系地址')+'地图导航');
    var copy=d.createElement('div');copy.className='qily-map-nav-copy';
    var title=d.createElement('strong');title.textContent='地图导航';
    var note=d.createElement('span');note.textContent='默认高德；也可选择百度、腾讯、Google Maps 或 Apple Maps。本站不嵌入第三方地图页面，避免广告弹层。';
    copy.appendChild(title);copy.appendChild(note);panel.appendChild(copy);
    var actions=d.createElement('div');actions.className='qily-map-nav-actions';
    [
      ['amap','高德导航',urls.amap,true],
      ['baidu','百度导航',urls.baidu,false],
      ['tencent','腾讯导航',urls.tencent,false],
      ['google','Google Maps',urls.google,false],
      ['apple','Apple Maps',urls.apple,false]
    ].forEach(function(item){
      var link=d.createElement('a');
      link.className='qily-map-nav-action'+(item[3]?' primary':'');
      link.href=item[2];link.target='_blank';link.rel='noopener noreferrer';
      link.setAttribute('data-qily-map-provider',item[0]);
      link.setAttribute('aria-label',item[1]+'导航到'+(keyword||'联系地址'));
      link.textContent=item[1];actions.appendChild(link);
    });
    panel.appendChild(actions);
    return panel;
  }

  function sanitizeContactMaps(){
    var page=d.querySelector('.contact-page-v3');
    if(!page)return;
    page.querySelectorAll('.map-preview iframe').forEach(function(frame){frame.removeAttribute('src');frame.remove();});
    page.querySelectorAll('.map-preview').forEach(function(preview){
      var card=preview.closest('.address-card');
      var keyword=card?card.getAttribute('data-qily-map-address')||'':'';
      preview.replaceWith(createCleanMapPanel(keyword,inferRegion(card)));
    });
    page.querySelectorAll('.qily-map-nav-panel').forEach(function(panel){
      if(panel.getAttribute('data-qily-clean-map-nav')==='v2'&&panel.querySelector('[data-qily-map-provider="google"]')&&panel.querySelector('[data-qily-map-provider="apple"]'))return;
      var card=panel.closest('.address-card');
      var keyword=card?card.getAttribute('data-qily-map-address')||'':'';
      panel.replaceWith(createCleanMapPanel(keyword,inferRegion(card)));
    });
    page.querySelectorAll('iframe[src*="api.map.baidu.com"]').forEach(function(frame){frame.removeAttribute('src');frame.remove();});
  }

  function recover(){
    injectRecoveryCss();
    d.documentElement.classList.remove('qily-stale-document','qily-shell-pending','qily-first-paint-pending','qily-r2-first-paint-pending');
    if(d.body)d.body.style.removeProperty('visibility');
    removeLegacyContactModal();
    sanitizeContactMaps();
    retireDock();
    installRetirementObserver();
  }

  if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',recover,{once:true});else recover();
  d.addEventListener('qily:shell-ready',recover);
  d.addEventListener('qily:softnavigate',retireDock);
  w.addEventListener('pageshow',recover,{passive:true});
})(document,window);
