(() => {
  'use strict';
  const items = [
    ['01','现场事实'],
    ['02','工程数据'],
    ['03','精益改善'],
    ['04','质量保证'],
    ['05','数智固化'],
    ['06','知识资产']
  ];
  function mount(){
    const table=document.querySelector('.table-wrap');
    if(!table || table.querySelector('.qily-business-strip')) return;
    const strip=document.createElement('div');
    strip.className='qily-business-strip';
    strip.setAttribute('aria-label','QilyLean 六大业务主旨');
    strip.innerHTML=items.map(([n,t])=>`<span>${n}｜${t}</span>`).join('');
    table.appendChild(strip);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',mount,{once:true});
  else mount();
})();
