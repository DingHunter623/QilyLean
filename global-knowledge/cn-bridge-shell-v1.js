/* QilyLean international bridge V4 | 2026-10-07 | logo to international home; footer only top/share */
(function(d,w){'use strict';
if(w.__qilyCnBridgeShellV1)return;w.__qilyCnBridgeShellV1=true;
function copyText(text){if(navigator.clipboard&&w.isSecureContext)return navigator.clipboard.writeText(text);var a=d.createElement('textarea');a.value=text;a.setAttribute('readonly','');a.style.position='fixed';a.style.left='-9999px';(d.body||d.documentElement).appendChild(a);a.select();try{d.execCommand('copy')}catch(e){}a.remove();return Promise.resolve();}
function toast(msg){var n=d.getElementById('qilyCnBridgeShareToast');if(!n){n=d.createElement('div');n.id='qilyCnBridgeShareToast';n.setAttribute('role','status');n.setAttribute('aria-live','polite');(d.body||d.documentElement).appendChild(n);}n.textContent=msg;n.hidden=false;clearTimeout(toast.t);toast.t=setTimeout(function(){n.hidden=true;},2300);}
function top(){d.documentElement.scrollTop=0;if(d.body)d.body.scrollTop=0;try{w.scrollTo({top:0,left:0,behavior:'smooth'});}catch(e){w.scrollTo(0,0);}}
function share(b){var title=d.title||'QilyLean',url=w.location.href,text=title+'\n'+url;copyText(text).then(function(){b&&b.classList.add('is-copied');setTimeout(function(){b&&b.classList.remove('is-copied');},1500);if(navigator.share){toast('标题与网址已复制，正在打开系统分享');return navigator.share({title:title,text:title,url:url}).catch(function(e){if(e&&e.name==='AbortError')toast('已复制，可直接粘贴分享');});}toast('标题与网址已复制，可直接粘贴分享');});}
function revealCurrentNav(){var nav=d.querySelector('.cn-bridge-nav');if(!nav)return;var active=nav.querySelector('a[aria-current="page"]');if(!active)return;w.requestAnimationFrame(function(){var left=active.offsetLeft,right=left+active.offsetWidth,viewLeft=nav.scrollLeft,viewRight=viewLeft+nav.clientWidth;if(left>=viewLeft+8&&right<=viewRight-8)return;var max=Math.max(0,nav.scrollWidth-nav.clientWidth);nav.scrollLeft=Math.min(max,Math.max(0,left-(nav.clientWidth-active.offsetWidth)/2));});}
function scheduleCurrentNavReveal(){revealCurrentNav();[80,250,700].forEach(function(delay){w.setTimeout(revealCurrentNav,delay);});}
function enforceChinaParityShell(){
  var internationalHome='https://qilylean.com/';
  var brand=d.querySelector('.cn-bridge-brand');
  if(brand){
    brand.setAttribute('href',internationalHome);
    brand.setAttribute('aria-label','返回国际站');
    brand.setAttribute('title','返回国际站');
  }
  d.querySelectorAll('.cn-bridge-footer-brand,.cn-bridge-footer-records,[data-action="home"],[data-action="previous"]').forEach(function(node){node.remove();});
  var g=d.querySelector('.cn-bridge-footer-actions');
  if(g){
    var expected=[['top','顶部'],['share','分享当前']];
    var buttons=Array.prototype.slice.call(g.querySelectorAll('button[data-action]'));
    var same=buttons.length===2&&buttons.every(function(b,i){return b.getAttribute('data-action')===expected[i][0]&&b.textContent.trim()===expected[i][1];});
    if(!same){
      g.textContent='';
      expected.forEach(function(item){var b=d.createElement('button');b.type='button';b.setAttribute('data-action',item[0]);b.textContent=item[1];g.appendChild(b);});
    }
    g.setAttribute('data-qily-cn-bridge-footer-contract','top,share,no-filing');
  }
  d.documentElement.setAttribute('data-qily-cn-bridge-home','qilylean.com');
}
function bind(){var g=d.querySelector('.cn-bridge-footer-actions');if(!g||g.dataset.bound==='v1')return;g.dataset.bound='v1';g.addEventListener('click',function(e){var b=e.target.closest('button[data-action]');if(!b)return;e.preventDefault();var a=b.dataset.action;if(a==='top')top();else if(a==='share')share(b);});}
var footerResizeObserver;
function reserveFooterSpace(){
  var footer=d.querySelector('.cn-bridge-footer');if(!footer)return;
  d.documentElement.style.setProperty('--qily-bridge-footer-space',Math.ceil(footer.getBoundingClientRect().height)+'px');
  if(!footerResizeObserver&&w.ResizeObserver){footerResizeObserver=new w.ResizeObserver(reserveFooterSpace);footerResizeObserver.observe(footer,{box:'border-box'});}
}
function boot(){enforceChinaParityShell();bind();scheduleCurrentNavReveal();reserveFooterSpace();}
if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',boot,{once:true});else boot();w.addEventListener('pageshow',boot,{passive:true});
w.addEventListener('resize',reserveFooterSpace,{passive:true});
})(document,window);
