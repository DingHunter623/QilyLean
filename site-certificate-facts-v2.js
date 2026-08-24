/* QilyLean certificate fact guard v2 | 2026-08-24 */
(function(d,w){
  'use strict';
  if(w.__qilyCertificateFactsV2)return;
  w.__qilyCertificateFactsV2=true;
  function apply(){
    var section=d.getElementById('ai-certificate');
    if(!section)return;
    var title=section.querySelector('h2');
    if(title)title.textContent='AI应用专项证书展示';
    var lead=section.querySelector('.module-lead');
    if(lead)lead.textContent='证书用于记录AI工具学习与制造改善实践经历。证书编号、日期与原图按现有证书事实公开；关联平台为 OpenAI 的 ChatGPT / Codex，但该证书并非 OpenAI 官方颁发或官方认证。';
    var figure=section.querySelector('.capability-certificate-visual');
    var img=figure&&figure.querySelector('img');
    var link=figure&&figure.querySelector('a');
    var caption=figure&&figure.querySelector('figcaption');
    if(img){img.src='/qilylean/chatgpt-lean-certificate-web.jpg?v=20260824-certificate-facts-v2';img.alt='丁启利ChatGPT应用与精益生产实践学习成果纪念证书';}
    if(link)link.href='/qilylean/chatgpt-lean-certificate.png';
    if(caption)caption.textContent='ChatGPT应用与精益生产实践学习成果纪念证书｜点击查看高清原图';
    var card=section.querySelector('.capability-certificate .evidence-card');
    if(card){
      var heading=card.querySelector('h3');
      if(heading)heading.textContent='ChatGPT应用与精益生产实践';
      var paras=card.querySelectorAll('p');
      if(paras[0])paras[0].textContent='持续学习并实践 OpenAI ChatGPT、Codex 等人工智能工具，将AI能力用于流程优化、效率提升、数据分析、程序文件编制、代码与网页资产生成，以及制造改善知识沉淀。';
      var result=card.querySelector('.module-result');
      if(result)result.textContent='证书编号：GPT-LE-2025-0422｜日期：2025年4月22日｜关联平台：OpenAI（ChatGPT / Codex）';
      var meta=card.querySelector('.evidence-meta');
      if(meta)meta.textContent='能力边界 | 该证书属于学习纪念与能力佐证材料，不构成 OpenAI 官方认证、授权、政府资质或行业认证；制造结论仍以现场数据、工程标准、过程验证和人工复核为准。';
    }
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
  [300,900,1800].forEach(function(ms){setTimeout(apply,ms);});
})(document,window);
