/* QilyLean certificate fact guard v2 | 2026-08-24 */
(function(d,w){
  'use strict';
  if(w.__qilyCertificateFactsV2)return;
  w.__qilyCertificateFactsV2=true;
  function apply(){
    var section=d.getElementById('ai-certificate');
    if(!section)return;
    var img=section.querySelector('.capability-certificate-visual img');
    var link=section.querySelector('.capability-certificate-visual a');
    if(img){img.src='/qilylean/chatgpt-lean-certificate-web.jpg?v=20260824-certificate-facts-v2';img.alt='丁启利ChatGPT应用与精益生产实践学习成果纪念证书';}
    if(link)link.href='/qilylean/chatgpt-lean-certificate.png';
    var panel=section.querySelector('[data-qily-certificate-verification]');
    if(panel){
      panel.setAttribute('data-qily-certificate-verification','v2');
      panel.innerHTML='<span class="module-eyebrow">VERIFICATION | 证书信息</span><h3>证书事实与关联平台</h3><div class="module-grid module-grid-3">'
        +'<article class="module-card"><small>关联平台 / 工具</small><h3>OpenAI · ChatGPT / Codex</h3></article>'
        +'<article class="module-card"><small>证书编号</small><h3>GPT-LE-2025-0422</h3></article>'
        +'<article class="module-card"><small>日期</small><h3>2025年4月22日</h3></article>'
        +'<article class="module-card"><small>OpenAI 官方网站</small><h3><a href="https://openai.com/" target="_blank" rel="noopener noreferrer">openai.com</a></h3><p>平台官方网站，非本证书核验入口。</p></article>'
        +'<article class="module-card"><small>证书原图</small><h3><a href="/qilylean/chatgpt-lean-certificate.png" target="_blank" rel="noopener">官网已公开展示</a></h3></article>'
        +'<article class="module-card"><small>公开定位</small><h3>学习纪念 / 能力佐证</h3></article>'
        +'</div><p class="evidence-note" style="margin:18px 0 0"><strong>公开边界：</strong>OpenAI 为所使用 ChatGPT / Codex 的关联平台；本证书不表述为 OpenAI 官方颁发、认证或授权。</p>';
    }
  }
  if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',apply,{once:true});else apply();
  w.addEventListener('pageshow',apply,{passive:true});
  setTimeout(apply,1200);
})(document,window);
