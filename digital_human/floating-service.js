(function(){
'use strict';
const WECHAT_ID='Qily259';
const EMAIL='dinghunter623@gmail.com';
const WECHAT_URL='https://u.wechat.com/MLB4bqkwRqFx4Olc1YASELw?s=2';
const QR_URL='https://api.qrserver.com/v1/create-qr-code/?size=320x320&data='+encodeURIComponent(WECHAT_URL);
const PWD='259';
function mergeStandardTimeUses(){
 const article=document.getElementById('standard-time');if(!article||article.dataset.stdMerged==='1')return;
 const ps=Array.from(article.querySelectorAll('p'));
 for(let i=0;i<ps.length-1;i++){
  const a=(ps[i].textContent||'').trim(),b=(ps[i+1].textContent||'').trim();
  if(a.includes('第一，用于产能测算')&&a.includes('第二，用于人机配置')&&a.includes('第三，用于线平衡改善')&&b.includes('第四，用于ERP/MES基础数据')&&b.includes('第五，用于经营改善分析')){
   ps[i].textContent=(a+' '+b).replace(/\s+/g,' ').trim();ps[i+1].remove();article.dataset.stdMerged='1';break;
  }
 }
}
function lockExperience(){
 const sec=document.getElementById('experience');if(!sec||sec.dataset.passwordManaged==='1')return;
 sec.dataset.passwordManaged='1';const original=sec.innerHTML;
 try{if(sessionStorage.getItem('experienceUnlocked')==='1')return;}catch(e){}
 sec.innerHTML='<div class="inner"><div class="experience-lock-card"><h2>履历主线（加密）</h2><p>详细履历主线已设置访问口令。</p><div class="experience-lock-form"><input class="experience-lock-input" id="experiencePasswordInput" type="password" inputmode="numeric" placeholder="请输入访问密码"><button class="experience-lock-btn" id="experienceUnlockBtn" type="button">查看履历主线</button></div><div class="experience-lock-msg" id="experienceLockMsg"></div></div></div>';
 const input=document.getElementById('experiencePasswordInput'),btn=document.getElementById('experienceUnlockBtn');
 const unlock=()=>{if((input.value||'').trim()===PWD){try{sessionStorage.setItem('experienceUnlocked','1')}catch(e){}sec.innerHTML=original;}else{document.getElementById('experienceLockMsg').textContent='密码不正确，请重新输入。';input.select();}};
 btn.addEventListener('click',unlock);input.addEventListener('keydown',e=>{if(e.key==='Enter')unlock();});
}
function copyText(t){if(navigator.clipboard&&window.isSecureContext)return navigator.clipboard.writeText(t);const i=document.createElement('textarea');i.value=t;i.style.position='fixed';i.style.left='-9999px';document.body.appendChild(i);i.select();document.execCommand('copy');i.remove();return Promise.resolve();}
function toast(t){let e=document.getElementById('floatToast');if(!e){e=document.createElement('div');e.id='floatToast';e.className='float-toast';document.body.appendChild(e);}e.textContent=t;e.classList.add('show');clearTimeout(e._t);e._t=setTimeout(()=>e.classList.remove('show'),1800);}
function clamp(el,left,top){const m=8;return{left:Math.min(Math.max(m,left),Math.max(m,innerWidth-el.offsetWidth-m)),top:Math.min(Math.max(m,top),Math.max(m,innerHeight-el.offsetHeight-m))};}
function initDock(){
 if(document.getElementById('floatDock'))return;
 const s=document.createElement('style');s.textContent='.float-dock{position:fixed;right:18px;bottom:86px;z-index:9999;display:flex;flex-direction:column;gap:10px;touch-action:none;user-select:none;cursor:grab}.float-dock.dragging{cursor:grabbing}.float-btn{width:62px;height:62px;border:1px solid rgba(255,232,173,.55);border-radius:50%;box-shadow:0 12px 30px rgba(15,75,90,.28);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:0;font:inherit;font-weight:900;cursor:pointer}.float-home{color:#fff;background:linear-gradient(135deg,#0f4b5a,#178b94)}.float-share{color:#fff;background:linear-gradient(135deg,#6e3f5f,#9e4a78)}.float-wx{color:#17322d;background:linear-gradient(135deg,#ffe39b,#f5c861)}.float-icon{font-size:18px}.float-text{font-size:10px}.wx-mask{position:fixed;inset:0;z-index:10000;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.42);padding:20px}.wx-mask.show{display:flex}.wx-panel{position:relative;width:min(92vw,460px);max-height:90vh;overflow:auto;padding:24px 20px 20px;border-radius:20px;background:#fff;box-shadow:0 24px 70px rgba(0,0,0,.24);border:1px solid #d5e4e3;color:#182420;text-align:center}.wx-close{position:absolute;right:12px;top:10px;width:34px;height:34px;border:0;border-radius:50%;font-size:21px}.wx-qr-image{display:block;width:min(68vw,300px);height:min(68vw,300px);margin:14px auto}.wx-copy-btn,.wx-link-btn{display:inline-block;margin:5px;padding:10px 14px;border:0;border-radius:12px;background:#0f4b5a;color:#fff;text-decoration:none;font:inherit;font-weight:850}.float-toast{position:fixed;left:50%;bottom:28px;z-index:11000;transform:translateX(-50%);opacity:0;pointer-events:none;padding:10px 15px;border-radius:999px;color:#fff;background:rgba(15,75,90,.94);font-size:14px;font-weight:850}.float-toast.show{opacity:1}@media(max-width:760px){.float-dock{right:12px;bottom:74px}.float-btn{width:56px;height:56px}}';document.head.appendChild(s);
 const dock=document.createElement('div');dock.className='float-dock';dock.id='floatDock';dock.innerHTML='<button class="float-btn float-home" data-action="home" type="button"><span class="float-icon">⌂</span><span class="float-text">回首页</span></button><button class="float-btn float-share" data-action="share" type="button"><span class="float-icon">↗</span><span class="float-text">分享</span></button><button class="float-btn float-wx" data-action="contact" type="button"><span class="float-icon">联</span><span class="float-text">联系交流</span></button>';document.body.appendChild(dock);
 const mask=document.createElement('div');mask.className='wx-mask';mask.id='wxMask';mask.innerHTML='<div class="wx-panel"><button class="wx-close" type="button">×</button><h3>联系交流</h3><p>欢迎就精益生产、IE、VSM、SMED、数智化工厂与项目改善进行交流。</p><img class="wx-qr-image" src="'+QR_URL+'" alt="微信二维码"><p><strong>'+WECHAT_ID+'</strong></p><button class="wx-copy-btn" type="button">复制微信号</button><a class="wx-link-btn" href="'+WECHAT_URL+'" target="_blank" rel="noopener">打开微信联系链接</a><a class="wx-link-btn" href="mailto:'+EMAIL+'">发送邮件</a></div>';document.body.appendChild(mask);
 try{const p=JSON.parse(localStorage.getItem('floatDockPos')||'null');if(p){const q=clamp(dock,p.left,p.top);dock.style.left=q.left+'px';dock.style.top=q.top+'px';dock.style.right='auto';dock.style.bottom='auto';}}catch(e){}
 let down=false,moved=false,sx=0,sy=0,sl=0,st=0,action='';
 dock.addEventListener('pointerdown',e=>{const b=e.target.closest('.float-btn');if(!b)return;down=true;moved=false;action=b.dataset.action||'';const r=dock.getBoundingClientRect();sx=e.clientX;sy=e.clientY;sl=r.left;st=r.top;dock.style.left=sl+'px';dock.style.top=st+'px';dock.style.right='auto';dock.style.bottom='auto';dock.classList.add('dragging');try{dock.setPointerCapture(e.pointerId)}catch(x){}});
 dock.addEventListener('pointermove',e=>{if(!down)return;const dx=e.clientX-sx,dy=e.clientY-sy;if(Math.abs(dx)>4||Math.abs(dy)>4)moved=true;if(!moved)return;e.preventDefault();const p=clamp(dock,sl+dx,st+dy);dock.style.left=p.left+'px';dock.style.top=p.top+'px';});
 dock.addEventListener('pointerup',e=>{if(!down)return;down=false;dock.classList.remove('dragging');try{dock.releasePointerCapture(e.pointerId)}catch(x){}if(moved){try{const r=dock.getBoundingClientRect();localStorage.setItem('floatDockPos',JSON.stringify({left:r.left,top:r.top}));}catch(x){}return;}if(action==='home'){if(/\/home\.html$|\/digital_human\/?$/i.test(location.pathname))scrollTo({top:0,behavior:'smooth'});else location.href='home.html';}else if(action==='share'){const u=location.href.split('#')[0];if(navigator.share)navigator.share({title:document.title,url:u}).catch(()=>{});else copyText(document.title+'\n'+u).then(()=>toast('链接已复制'));}else if(action==='contact'){mask.classList.add('show');}});
 mask.querySelector('.wx-close').addEventListener('click',()=>mask.classList.remove('show'));mask.addEventListener('click',e=>{if(e.target===mask)mask.classList.remove('show');});mask.querySelector('.wx-copy-btn').addEventListener('click',()=>copyText(WECHAT_ID).then(()=>toast('微信号已复制')));
}
function init(){mergeStandardTimeUses();initDock();setTimeout(lockExperience,1400);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();