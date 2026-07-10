(function(){
'use strict';
const SITE_TITLE='制造改善与项目实践主页';
const WECHAT_ID='Qily259';
const EMAIL='dinghunter623@gmail.com';
const WECHAT_URL='https://u.wechat.com/MLB4bqkwRqFx4Olc1YASELw?s=2';
const HOME_PAGE='home.html';
const PWD='259';
const QR_URL='https://api.qrserver.com/v1/create-qr-code/?size=320x320&data='+encodeURIComponent(WECHAT_URL);
function cleanText(s){return String(s||'')
.replace(/制造改善实践论文合集/g,'制造改善经验合集')
.replace(/制造改善实践论文/g,'制造改善经验')
.replace(/方法论文章/g,'方法经验')
.replace(/论文目录/g,'经验目录')
.replace(/论文库/g,'经验库')
.replace(/阅读全文/g,'查看详情')
.replace(/项目主页/g,'返回主页')
.replace(/丁启利 AI 数字人/g,SITE_TITLE)
.replace(/AI 数字人|AI数字人/g,'专业交流助手')
.replace(/岗位匹配/g,'应用场景')
.replace(/求职定位：/g,'能力适配场景：')
.replace(/面试深度沟通|面试沟通/g,'项目交流')
.replace(/个人职业能力/g,'制造改善能力')
.replace(/天星电子有限公司|天星电子/g,'某汽车电子企业')
.replace(/优化真空熔炉升温/g,'优化DAP真空熔炉升温')
.replace(/新工厂规划/g,'新工厂设计规划')
.replace(/仓储/g,'物控')
.replace(/人、机、料、法、环、测/g,'人、机、料、法、测、能\/源、环');}
function cleanBody(){
 if(!document.body)return;
 document.title=cleanText(document.title);
 const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT,{acceptNode(n){const p=n.parentElement;if(!p||p.closest('script,style'))return NodeFilter.FILTER_REJECT;return NodeFilter.FILTER_ACCEPT;}});
 const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
 nodes.forEach(n=>{const v=cleanText(n.nodeValue);if(v!==n.nodeValue)n.nodeValue=v;});
}
function mergeStandardTimeUses(){
 const article=document.getElementById('standard-time');if(!article)return;
 const ps=Array.from(article.querySelectorAll('p'));
 for(let i=0;i<ps.length-1;i++){
  const a=(ps[i].textContent||'').trim(),b=(ps[i+1].textContent||'').trim();
  if(a.includes('第一，用于产能测算')&&a.includes('第二，用于人机配置')&&a.includes('第三，用于线平衡改善')&&b.includes('第四，用于ERP/MES基础数据')&&b.includes('第五，用于经营改善分析')){
   ps[i].textContent=(a+' '+b).replace(/\s+/g,' ').trim();
   ps[i+1].remove();break;
  }
 }
}
function lockExperience(){
 const sec=document.getElementById('experience');if(!sec||sec.dataset.passwordManaged==='1')return;
 sec.dataset.passwordManaged='1';const original=sec.innerHTML;
 try{if(sessionStorage.getItem('experienceUnlocked')==='1')return;}catch(e){}
 sec.innerHTML='<div class="inner"><div class="experience-lock-card"><h2>履历主线（加密）</h2><p>详细履历主线已设置访问口令，公开部分重点展示制造改善、代表项目与方法沉淀。</p><div class="experience-lock-form"><input class="experience-lock-input" id="experiencePasswordInput" type="password" inputmode="numeric" placeholder="请输入访问密码"><button class="experience-lock-btn" id="experienceUnlockBtn" type="button">查看履历主线</button></div><div class="experience-lock-msg" id="experienceLockMsg"></div></div></div>';
 const input=document.getElementById('experiencePasswordInput'),btn=document.getElementById('experienceUnlockBtn');
 const unlock=()=>{if((input.value||'').trim()===PWD){try{sessionStorage.setItem('experienceUnlocked','1')}catch(e){}sec.innerHTML=original;cleanBody();}else{document.getElementById('experienceLockMsg').textContent='密码不正确，请重新输入。';input.select();}};
 btn.addEventListener('click',unlock);input.addEventListener('keydown',e=>{if(e.key==='Enter')unlock();});
}
function copyText(t){if(navigator.clipboard&&window.isSecureContext)return navigator.clipboard.writeText(t);const i=document.createElement('textarea');i.value=t;i.style.position='fixed';i.style.left='-9999px';document.body.appendChild(i);i.select();document.execCommand('copy');i.remove();return Promise.resolve();}
function initDock(){
 if(document.getElementById('floatDock'))return;
 const style=document.createElement('style');style.textContent='.float-dock{position:fixed;right:18px;bottom:86px;z-index:9999;display:flex;flex-direction:column;gap:10px}.float-btn{width:58px;height:58px;border:0;border-radius:50%;color:#fff;background:#0f4b5a;box-shadow:0 10px 28px rgba(15,75,90,.3);font-weight:900;cursor:pointer}.float-share{background:#6e3f5f}.float-wx{background:#f5c861;color:#17322d}.wx-mask{position:fixed;inset:0;z-index:10000;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.42);padding:20px}.wx-mask.show{display:flex}.wx-panel{position:relative;width:min(92vw,450px);padding:24px;background:#fff;border-radius:18px;text-align:center}.wx-close{position:absolute;right:12px;top:10px;border:0;border-radius:50%;width:34px;height:34px;font-size:20px}.wx-qr-image{width:min(68vw,280px);height:min(68vw,280px)}.wx-copy-btn,.wx-link-btn{display:inline-block;margin:6px;padding:10px 14px;border:0;border-radius:10px;background:#0f4b5a;color:#fff;text-decoration:none;font-weight:850}@media(max-width:760px){.float-dock{right:12px;bottom:72px}.float-btn{width:54px;height:54px}}';document.head.appendChild(style);
 const dock=document.createElement('div');dock.className='float-dock';dock.id='floatDock';dock.innerHTML='<button class="float-btn" data-action="home" type="button">首页</button><button class="float-btn float-share" data-action="share" type="button">分享</button><button class="float-btn float-wx" data-action="contact" type="button">联系</button>';document.body.appendChild(dock);
 const mask=document.createElement('div');mask.className='wx-mask';mask.id='wxMask';mask.innerHTML='<div class="wx-panel"><button class="wx-close" type="button">×</button><h3>联系交流</h3><p>欢迎就精益生产、IE、VSM、SMED、数智化工厂与新工厂设计规划进行交流。</p><img class="wx-qr-image" src="'+QR_URL+'" alt="微信二维码"><p><strong>'+WECHAT_ID+'</strong></p><button class="wx-copy-btn" type="button">复制微信号</button><a class="wx-link-btn" href="'+WECHAT_URL+'" target="_blank" rel="noopener">打开微信链接</a><a class="wx-link-btn" href="mailto:'+EMAIL+'">发送邮件</a></div>';document.body.appendChild(mask);
 dock.addEventListener('click',e=>{const b=e.target.closest('button[data-action]');if(!b)return;const a=b.dataset.action;if(a==='home'){if(/home\.html$|digital_human\/?$/i.test(location.pathname))window.scrollTo({top:0,behavior:'smooth'});else location.href=HOME_PAGE;}else if(a==='share'){const u=location.href.split('#')[0];if(navigator.share)navigator.share({title:document.title,url:u}).catch(()=>{});else copyText(document.title+'\n'+u);}else mask.classList.add('show');});
 mask.querySelector('.wx-close').addEventListener('click',()=>mask.classList.remove('show'));mask.addEventListener('click',e=>{if(e.target===mask)mask.classList.remove('show');});mask.querySelector('.wx-copy-btn').addEventListener('click',()=>copyText(WECHAT_ID));
}
function init(){cleanBody();mergeStandardTimeUses();lockExperience();initDock();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
