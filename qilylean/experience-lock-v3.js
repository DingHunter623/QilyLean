(function(){
  'use strict';

  const PASSWORD='259';

  function boot(){
    const sec=document.getElementById('experience');
    if(!sec||sec.dataset.lockGuard==='1')return;

    const originalHTML=sec.innerHTML;
    sec.dataset.lockGuard='1';
    sec.innerHTML='<div class="inner"><div class="experience-lock-card"><h2>履历主线（加密）</h2><p>完整履历主线包含各阶段职责范围、项目方法、关键成果与能力递进，输入访问口令后查看。</p><div class="experience-lock-form"><input id="experiencePasswordInput" class="experience-lock-input" type="password" inputmode="numeric" autocomplete="off" aria-label="履历访问口令" placeholder="请输入访问密码"><button id="experienceUnlockBtn" class="experience-lock-btn" type="button">查看完整履历主线</button></div><div id="experienceLockMsg" class="experience-lock-msg" aria-live="polite"></div></div></div>';

    const style=document.createElement('style');
    style.id='experienceLockGuardStyle';
    style.textContent='.experience-lock-card{max-width:760px;margin:0 auto;padding:28px;border:1px solid var(--line,#d5e4e3);background:#fff;box-shadow:0 14px 36px rgba(15,75,90,.1)}.experience-lock-card h2{margin-top:0;color:var(--forest,#0f4b5a)}.experience-lock-card p{color:var(--muted,#5f7474);font-size:18.5px;line-height:1.75}.experience-lock-form{display:flex;gap:10px;flex-wrap:wrap}.experience-lock-input{flex:1;min-width:220px;padding:12px 14px;border:1px solid var(--line,#d5e4e3);font:inherit}.experience-lock-btn{padding:12px 18px;border:0;background:var(--forest,#0f4b5a);color:#fff;font:inherit;font-weight:850;cursor:pointer}.experience-lock-msg{margin-top:10px;color:#9e4a34;font-weight:800}';
    if(!document.getElementById(style.id))document.head.appendChild(style);
    sec.style.visibility='visible';

    const input=document.getElementById('experiencePasswordInput');
    const btn=document.getElementById('experienceUnlockBtn');
    const msg=document.getElementById('experienceLockMsg');
    function unlock(){
      if((input.value||'').trim()===PASSWORD){
        sec.innerHTML=originalHTML;
        const heading=sec.querySelector('h2');
        if(heading)heading.focus({preventScroll:true});
        sec.scrollIntoView({behavior:'smooth',block:'start'});
      }else{
        msg.textContent='密码不正确，请重新输入。';
        input.select();
      }
    }
    btn.addEventListener('click',unlock);
    input.addEventListener('keydown',function(e){if(e.key==='Enter')unlock();});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();
