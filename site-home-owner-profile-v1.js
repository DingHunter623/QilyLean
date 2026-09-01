/* QilyLean Homepage Owner Profile V1 | 2026-09-01
 * Home-only, one-shot public biography supplement for the owner/collaboration section.
 * No observer, polling, reload, navigation or translation ownership.
 */
(function(d,w){
  'use strict';
  if(w.__qilyHomeOwnerProfileV1)return;
  w.__qilyHomeOwnerProfileV1=true;

  function isHome(){
    var path=String(w.location.pathname||'/').replace(/\/index\.html$/i,'/').replace(/\/{2,}/g,'/');
    return path==='/'||path==='';
  }

  function apply(){
    if(!isHome())return false;
    var card=d.querySelector('#qily-home-collaboration .qily-home-role:first-child');
    if(!card||card.querySelector('.qily-home-owner-profile'))return !!card;
    var profile=d.createElement('div');
    profile.className='qily-home-owner-profile';
    profile.setAttribute('aria-label','QilyLean主理人职业履历概述');
    profile.innerHTML='<strong>丁启利｜20年制造业工程技术与精益改善履历</strong><p>QilyLean启力精益由丁启利发起，作为制造改善、项目交流与精益赋能窗口。其中9年任职欧美企业，先后从事TE、IE工程工作；4年担任上市公司工程部长；累计6年多从事咨询交付。长期聚焦PQCD改善、数智化工厂规划、目视化项目交付与精益体系建设。</p>';
    card.appendChild(profile);
    return true;
  }

  if(d.readyState!=='loading')apply();
  else d.addEventListener('DOMContentLoaded',apply,{once:true});
  d.addEventListener('qily:home-conversion-ready',apply,{once:true});
})(document,window);
