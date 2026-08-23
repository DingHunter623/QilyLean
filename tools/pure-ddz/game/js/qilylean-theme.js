(() => {
  'use strict';

  const scriptUrl=document.currentScript?.src||'';
  const runtimeRoot=scriptUrl?new URL('../',scriptUrl):new URL('./',window.location.href);
  const largeCardCssUrl=new URL('css/card-size-v2.css?v=20260823-large-card-v2',runtimeRoot).href;

  const items = [
    ['01','现场事实'],
    ['02','工程数据'],
    ['03','精益改善'],
    ['04','质量保证'],
    ['05','数智固化'],
    ['06','知识资产']
  ];

  const overviewHtml = `
    <details class="qily-product-overview">
      <summary><strong>QilyLean 无广告斗地主｜简单娱乐，益智生活</strong><span>查看开发缘起与产品理念</span></summary>
      <div class="qily-product-overview-body">
        <p>几年前，我发现父母喜欢玩网页版斗地主，但实名注册、账号登录、验证码验证等流程，对于不熟悉智能设备操作的老年人来说并不友好。由于子女常年在外工作，很多时候需要等待家人回家才能协助完成登录。</p>
        <p>因此，我开发了这款<strong>无广告、无强制注册、操作简单的斗地主游戏</strong>，希望为我们父母辈老年人提供一个更加轻松、便捷、安全的休闲娱乐方式。</p>
        <p>游戏采用简洁直观的设计理念，无需复杂操作，不被广告打扰，打开即可畅玩。既适合家庭休闲，也适合老年人在娱乐过程中活跃思维、锻炼反应能力，让日常生活多一份乐趣。</p>
        <p>同时，工作中的我们长期面对复杂的问题分析、工程改善、项目管理和高强度思考，大脑也需要适度放松与调节。斗地主不仅是一种娱乐方式，也是一种简单的益智活动，在轻松游戏过程中保持思考、缓解压力，让工作与生活更加平衡。</p>
        <p>我希望通过这款小小的游戏，解决一个真实的家庭需求，也将自己多年工程实践中追求的简单、高效、友好的理念融入数字产品设计中。</p>
        <blockquote>愿每一次出牌，都带来轻松与快乐；<br>愿每一次思考，都保持活力与智慧。</blockquote>
        <p class="qily-product-support"><strong>统一开发者支持：</strong>官方网址 <a href="https://qilylean.com" target="_blank" rel="noopener">https://qilylean.com</a>；官网邮箱 <a href="mailto:admin@qilylean.com">admin@qilylean.com</a>。</p>
      </div>
    </details>`;

  function ensureLargeCardStyle(){
    if(document.getElementById('qily-large-card-readability-v2')) return;
    const link=document.createElement('link');
    link.id='qily-large-card-readability-v2';
    link.rel='stylesheet';
    link.href=largeCardCssUrl;
    document.head.appendChild(link);
  }

  function ensureStyle(){
    if(document.getElementById('qily-product-overview-style')) return;
    const style=document.createElement('style');
    style.id='qily-product-overview-style';
    style.textContent=`
      .qily-product-overview{margin:10px auto 14px;width:min(1100px,calc(100% - 24px));border:1px solid rgba(255,227,155,.34);border-radius:16px;background:rgba(3,47,52,.78);color:#eefaf7;box-shadow:0 8px 24px rgba(0,0,0,.14)}
      .qily-product-overview summary{cursor:pointer;display:flex;align-items:center;justify-content:space-between;gap:14px;padding:13px 16px;list-style:none}
      .qily-product-overview summary::-webkit-details-marker{display:none}
      .qily-product-overview summary strong{font-size:16px;color:#ffe39b}
      .qily-product-overview summary span{font-size:12px;color:#cfe9e3;white-space:nowrap}
      .qily-product-overview-body{padding:0 18px 16px;border-top:1px solid rgba(255,255,255,.12);font-size:14px;line-height:1.8;color:#e9f7f4}
      .qily-product-overview-body p{margin:12px 0}
      .qily-product-overview-body blockquote{margin:14px 0;padding:10px 14px;border-left:4px solid #ffe39b;background:rgba(255,255,255,.06);color:#fff4ce;font-weight:800}
      .qily-product-overview-body a{color:#ffe39b;font-weight:800}
      .qily-product-support{padding-top:8px;border-top:1px dashed rgba(255,255,255,.18)}
      @media(max-width:680px){.qily-product-overview summary{align-items:flex-start;flex-direction:column;gap:4px}.qily-product-overview summary span{white-space:normal}.qily-product-overview-body{padding:0 14px 14px;font-size:13px}}
    `;
    document.head.appendChild(style);
  }

  function mount(){
    ensureLargeCardStyle();

    const table=document.querySelector('.table-wrap');
    if(table && !table.querySelector('.qily-business-strip')){
      const strip=document.createElement('div');
      strip.className='qily-business-strip';
      strip.setAttribute('aria-label','QilyLean 六大业务主旨');
      strip.innerHTML=items.map(([n,t])=>`<span>${n}｜${t}</span>`).join('');
      table.appendChild(strip);
    }

    ensureStyle();
    const main=document.querySelector('.game-main');
    const promise=document.querySelector('.clean-promise');
    if(main && promise && !document.querySelector('.qily-product-overview')){
      promise.insertAdjacentHTML('afterend',overviewHtml);
    }

    const welcomeCopy=document.querySelector('.welcome-copy');
    if(welcomeCopy){
      welcomeCopy.innerHTML='这款游戏源于一个真实的家庭需求：减少实名注册、账号登录、验证码等操作门槛，让父母辈打开即可轻松娱乐；同时也为长期面对复杂分析、工程改善和项目管理的成年人提供一个保持思考、适度放松的益智方式。<strong>简单、高效、友好</strong>，是这款数字产品延续的设计理念。';
    }

    const eyebrow=document.querySelector('.welcome-modal .eyebrow');
    if(eyebrow) eyebrow.textContent='QilyLean 无广告斗地主｜简单娱乐，益智生活';
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',mount,{once:true});
  else mount();
})();
