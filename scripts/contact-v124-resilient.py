#!/usr/bin/env python3
from pathlib import Path
import re

JS_MARK='QILY-PHONE-CONTACT-V12.4:START'
CSS_MARK='QILY-CONTACT-V12.4-RESILIENT:START'
VERSION='20260814-contact-v124'

js_block=r'''

/* QILY-PHONE-CONTACT-V12.4:START */
(function(){
  'use strict';
  if(window.__qilyPhoneContactV124)return;
  window.__qilyPhoneContactV124=true;
  function copyTextV124(text){
    if(navigator.clipboard&&window.isSecureContext)return navigator.clipboard.writeText(text);
    var f=document.createElement('textarea');f.value=text;f.setAttribute('readonly','');f.style.position='fixed';f.style.left='-9999px';document.body.appendChild(f);f.select();document.execCommand('copy');f.remove();return Promise.resolve();
  }
  function promptBox(){
    var p=document.getElementById('qilyPhoneCallPrompt');if(p)return p;
    p=document.createElement('div');p.id='qilyPhoneCallPrompt';p.className='qily-phone-call-prompt-v124';p.setAttribute('role','status');p.setAttribute('aria-live','polite');
    p.innerHTML='<span></span><button type="button">立即拨打</button>';document.body.appendChild(p);
    p.querySelector('button').addEventListener('click',function(){var n=p.getAttribute('data-phone')||'';p.classList.remove('show');if(n)window.location.href='tel:'+n;});
    return p;
  }
  function place(anchor,p){
    var r=anchor.getBoundingClientRect();p.style.left='12px';p.style.top='12px';requestAnimationFrame(function(){var b=p.getBoundingClientRect(),x=r.right+10;if(x+b.width>innerWidth-12)x=Math.max(12,r.left-b.width-10);var y=Math.max(12,Math.min(r.top,innerHeight-b.height-12));p.style.left=Math.round(x)+'px';p.style.top=Math.round(y)+'px';});
  }
  function copyPhone(anchor,phone){
    phone=(phone||'').replace(/[^0-9+]/g,'');if(!phone)return;
    copyTextV124(phone).then(function(){var p=promptBox();p.setAttribute('data-phone',phone);p.querySelector('span').textContent='电话号码 '+phone+' 已复制，是否立即拨打？';place(anchor,p);p.classList.add('show');clearTimeout(copyPhone.timer);copyPhone.timer=setTimeout(function(){p.classList.remove('show');},9000);});
  }
  function normalizeCooperation(){
    var card=document.querySelector('.contact-card');if(!card)return;
    var phone=card.querySelector('a[href^="tel:"]');
    if(phone){phone.classList.add('contact-line');if(!phone.querySelector('strong')){var pv=(phone.textContent||'').replace(/^\s*电话\s*[：:]\s*/,'').trim();phone.replaceChildren();var pl=document.createElement('span');pl.textContent='电话：';var ps=document.createElement('strong');ps.textContent=pv;phone.append(pl,ps);}}
    var email=card.querySelector('a[href^="mailto:"]');
    if(email){email.classList.add('contact-line');if(!email.querySelector('strong')){var ev=(email.textContent||'').replace(/^\s*官网邮箱\s*[：:]\s*/,'').trim();email.replaceChildren();var el=document.createElement('span');el.textContent='官网邮箱：';var es=document.createElement('strong');es.textContent=ev;email.append(el,es);}}
    var wx=card.querySelector('#copyWechat,[data-qily-wechat-copy="Qily259"]');
    if(wx){wx.classList.add('wechat-contact-action');if(!wx.querySelector('strong')){wx.replaceChildren();var wl=document.createElement('span');wl.textContent='微信：';var ws=document.createElement('strong');ws.textContent='Qily259';wx.append(wl,ws);}}
  }
  document.addEventListener('click',function(e){var x=e.target.closest&&e.target.closest('.qily-phone-list a[href^="tel:"],.contact-card a[href^="tel:"],.term-opl-contact-lines a[href^="tel:"]');if(!x)return;e.preventDefault();e.stopPropagation();copyPhone(x,(x.getAttribute('href')||'').replace(/^tel:/,''));},true);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',normalizeCooperation,{once:true});else normalizeCooperation();
})();
/* QILY-PHONE-CONTACT-V12.4:END */
'''

css_block=r'''
/* QILY-CONTACT-V12.4-RESILIENT:START */
.qily-contact-panel .qily-phone-list a{cursor:pointer!important;transition:transform .16s ease,box-shadow .16s ease,background-color .16s ease,border-color .16s ease!important}
.qily-contact-panel .qily-phone-list a:hover,.qily-contact-panel .qily-phone-list a:focus-visible{transform:translateY(-2px)!important;border-color:#caa15f!important;background:#fff8e8!important;box-shadow:0 9px 20px rgba(15,75,90,.14)!important;outline:3px solid rgba(202,161,95,.18)!important;outline-offset:2px!important}
.qily-contact-panel .qily-phone-list a:active{transform:scale(.985)!important;background:#ffeab3!important}
.qily-contact-panel .qily-phone-city{text-decoration:none!important;text-decoration-line:none!important}
.qily-contact-panel .qily-phone-number{text-decoration:underline!important;text-decoration-thickness:2px!important;text-underline-offset:4px!important;text-decoration-skip-ink:none!important}
.qily-phone-call-prompt-v124{position:fixed;z-index:12060;display:flex;max-width:min(440px,calc(100vw - 24px));align-items:center;gap:10px;padding:11px 13px;border:1px solid #178b94;border-radius:12px;color:#17322d;background:#eef8f6;box-shadow:0 14px 34px rgba(7,60,71,.22);font-size:14px;font-weight:850;line-height:1.45;opacity:0;visibility:hidden;transform:translateY(4px);transition:opacity .16s ease,transform .16s ease,visibility .16s ease}
.qily-phone-call-prompt-v124.show{opacity:1;visibility:visible;transform:translateY(0)}
.qily-phone-call-prompt-v124 button{flex:0 0 auto;min-height:36px;padding:6px 10px;border:0;border-radius:8px;color:#fff;background:#0f4b5a;cursor:pointer;font:inherit;font-weight:900}
.contact-card .contact-line,.contact-card .wechat-contact-action{display:flex!important;align-items:center!important;justify-content:center!important;gap:7px!important;width:100%!important;min-height:46px!important;margin-top:10px!important;padding:9px 14px!important;border:1px solid rgba(255,227,155,.48)!important;color:#fff!important;-webkit-text-fill-color:#fff!important;background:rgba(255,255,255,.08)!important;text-decoration:none!important;cursor:pointer!important;font:inherit!important;font-weight:900!important;box-sizing:border-box!important}
.contact-card .contact-line span,.contact-card .wechat-contact-action span{text-decoration:none!important;text-decoration-line:none!important;color:inherit!important;-webkit-text-fill-color:inherit!important}
.contact-card .contact-line strong,.contact-card .wechat-contact-action strong{text-decoration:underline!important;text-decoration-thickness:2px!important;text-underline-offset:4px!important;text-decoration-skip-ink:none!important;color:inherit!important;-webkit-text-fill-color:inherit!important;font-weight:950!important}
.contact-card .contact-line:hover,.contact-card .contact-line:focus-visible,.contact-card .wechat-contact-action:hover,.contact-card .wechat-contact-action:focus-visible{transform:translateY(-2px)!important;border-color:#ffe39b!important;background:#12606f!important;box-shadow:0 8px 20px rgba(15,75,90,.22)!important;outline:none!important}
.contact-card .contact-line:active,.contact-card .wechat-contact-action:active{transform:scale(.99)!important;background:#073c47!important}
@media(max-width:620px){.qily-phone-call-prompt-v124{left:12px!important;right:12px!important;top:auto!important;bottom:18px!important;max-width:none!important;justify-content:space-between}}
/* QILY-CONTACT-V12.4-RESILIENT:END */
'''

for name in ('site-navigation.js','site-navigation-core.js'):
    p=Path(name)
    if not p.exists():
        continue
    t=p.read_text('utf-8')
    t=re.sub(r"var SHARED_ASSET_VERSION = '[^']+';",f"var SHARED_ASSET_VERSION = '{VERSION}';",t,count=1)
    if JS_MARK not in t:
        t += js_block
    p.write_text(t,'utf-8')

p=Path('site-shell.css')
t=p.read_text('utf-8')
if CSS_MARK not in t:
    t += '\n' + css_block + '\n'
p.write_text(t,'utf-8')

# Best-effort static normalization of cooperation card; runtime normalization above is authoritative.
p=Path('cooperation/index.html')
if p.exists():
    t=p.read_text('utf-8')
    t=re.sub(r'<a href="tel:13450014003">\s*电话：\s*134 5001 4003\s*</a>', '<a class="contact-line" href="tel:13450014003"><span>电话：</span><strong>134 5001 4003</strong></a>', t, count=1)
    t=re.sub(r'<a href="mailto:admin@qilylean.com">\s*官网邮箱：\s*admin@qilylean.com\s*</a>', '<a class="contact-line" href="mailto:admin@qilylean.com"><span>官网邮箱：</span><strong>admin@qilylean.com</strong></a>', t, count=1)
    p.write_text(t,'utf-8')

print('Contact V12.4 resilient layer materialized.')
