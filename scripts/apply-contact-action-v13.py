from pathlib import Path
import re


def must_replace(text, old, new, label):
    if old not in text:
        raise SystemExit(f'missing anchor: {label}')
    return text.replace(old, new, 1)

# Shared active runtime
p=Path('site-navigation-core.js')
s=p.read_text(encoding='utf-8')
s=s.replace("var SHARED_ASSET_VERSION = '20260812-r2-stability-v1';","var SHARED_ASSET_VERSION = '20260814-contact-v13';")
s=s.replace("var SHARED_ASSET_VERSION = '20260814-contact-v12';","var SHARED_ASSET_VERSION = '20260814-contact-v13';")

old="  document.addEventListener('click',function(e){var x=e.target.closest&&e.target.closest('[data-qily-wechat-copy]');if(!x)return;e.preventDefault();copyWechatAndPrompt(x);});"
new=old+"""

  /* QILY-PHONE-COPY-PROMPT-V13 */
  function ensurePhoneCopyPrompt(){
    var p=document.getElementById('qilyPhoneCopyPrompt');if(p)return p;
    p=document.createElement('div');p.id='qilyPhoneCopyPrompt';p.className='qily-phone-copy-prompt';p.setAttribute('role','status');p.setAttribute('aria-live','polite');
    p.innerHTML='<span></span><button type="button" data-qily-call-now>立即拨打</button><button type="button" data-qily-call-cancel>取消</button>';document.body.appendChild(p);
    p.querySelector('[data-qily-call-cancel]').addEventListener('click',function(){p.classList.remove('show');});
    return p;
  }
  function copyPhoneAndPrompt(a,phone){return copyText(phone).then(function(){var p=ensurePhoneCopyPrompt();p.dataset.phone=phone;p.querySelector('span').textContent='号码 '+phone+' 已复制，是否立即拨打？';positionWechatCopyPrompt(a,p);p.classList.add('show');var call=p.querySelector('[data-qily-call-now]');call.onclick=function(){p.classList.remove('show');window.location.href='tel:'+phone;};clearTimeout(copyPhoneAndPrompt.timer);copyPhoneAndPrompt.timer=setTimeout(function(){p.classList.remove('show');},9000);});}
  window.__qilyCopyPhoneAndPrompt=copyPhoneAndPrompt;
  document.addEventListener('click',function(e){var x=e.target.closest&&e.target.closest('[data-qily-phone-copy]');if(!x)return;e.preventDefault();copyPhoneAndPrompt(x,x.getAttribute('data-qily-phone-copy'));});
"""
if 'QILY-PHONE-COPY-PROMPT-V13' not in s:
    s=must_replace(s,old,new,'wechat listener')

old_phone="PHONE_NUMBERS.map(function (item) { return '<a href=\"tel:' + item.number + '\"><span class=\"qily-phone-city\">' + item.city + '：</span><strong class=\"qily-phone-number\">' + item.number + '</strong></a>'; }).join('')"
new_phone="PHONE_NUMBERS.map(function (item) { return '<a href=\"tel:' + item.number + '\" data-qily-phone-copy=\"' + item.number + '\" aria-label=\"复制并拨打 ' + item.city + ' ' + item.number + '\"><span class=\"qily-phone-city\">' + item.city + '：</span><strong class=\"qily-phone-number\">' + item.number + '</strong></a>'; }).join('')"
if 'data-qily-phone-copy=\"' not in s:
    s=must_replace(s,old_phone,new_phone,'phone generator')
p.write_text(s,encoding='utf-8')

# Cooperation card
p=Path('cooperation/index.html')
s=p.read_text(encoding='utf-8')
if 'data-qily-phone-copy="13450014003"' not in s:
    s=must_replace(s,'<a href="tel:13450014003">电话：134 5001 4003</a>','<button type="button" class="contact-action contact-phone-action" data-qily-phone-copy="13450014003" aria-label="复制并拨打电话 13450014003"><span class="contact-action-label">电话：</span><strong class="contact-action-value">134 5001 4003</strong></button>','cooperation phone')
if 'class="contact-action"><span class="contact-action-label">官网邮箱：' not in s:
    s=must_replace(s,'<a href="mailto:admin@qilylean.com">官网邮箱：admin@qilylean.com</a>','<a href="mailto:admin@qilylean.com" class="contact-action"><span class="contact-action-label">官网邮箱：</span><strong class="contact-action-value">admin@qilylean.com</strong></a>','cooperation email')
if 'contact-action-value">Qily259' not in s:
    old='<button type="button" id="copyWechat" class="wechat-contact-action" data-qily-wechat-copy="Qily259" aria-label="复制微信 Qily259"><span>微信：</span><strong>Qily259</strong></button>'
    new='<button type="button" id="copyWechat" class="wechat-contact-action contact-action" data-qily-wechat-copy="Qily259" aria-label="复制微信 Qily259"><span class="contact-action-label">微信：</span><strong class="contact-action-value">Qily259</strong></button>'
    s=must_replace(s,old,new,'cooperation wechat')
marker='.contact-card button{color:#17322d;background:#ffe39b}'
css='''
    .contact-card .contact-action{display:flex!important;align-items:center!important;justify-content:center!important;width:100%!important;min-height:46px!important;margin-top:10px!important;padding:9px 14px!important;border:1px solid rgba(255,227,155,.48)!important;color:#fff!important;-webkit-text-fill-color:#fff!important;background:rgba(255,255,255,.08)!important;text-decoration:none!important;cursor:pointer!important;font:inherit!important;font-weight:900!important;box-sizing:border-box!important}
    .contact-card .contact-action:hover,.contact-card .contact-action:focus-visible{background:rgba(255,255,255,.16)!important;border-color:#ffe39b!important;box-shadow:0 8px 20px rgba(0,0,0,.16)!important;outline:2px solid rgba(255,227,155,.36)!important;outline-offset:2px!important;transform:translateY(-1px)!important}
    .contact-card .contact-action:active{transform:scale(.985)!important}
    .contact-action-label{text-decoration:none!important}
    .contact-action-value{text-decoration:underline!important;text-decoration-thickness:2px!important;text-underline-offset:4px!important;text-decoration-skip-ink:none!important}
'''
if '.contact-card .contact-action{' not in s:
    s=must_replace(s,marker,marker+css,'cooperation css marker')
p.write_text(s,encoding='utf-8')

# OPL label/value underline split
p=Path('knowledge/terminology.html')
s=p.read_text(encoding='utf-8')
if 'term-opl-contact-label">微信：' not in s:
    s=must_replace(s,'微信：<a href="#copy-wechat" class="term-opl-copy-wechat-v9"','<span class="term-opl-contact-label">微信：</span><a href="#copy-wechat" class="term-opl-copy-wechat-v9"','opl wechat label')
p.write_text(s,encoding='utf-8')

# Shared CSS
p=Path('site-shell.css')
s=p.read_text(encoding='utf-8')
s=re.sub(r'\n?/\* QILY-CONTACT-ACTION-V13:START \*/[\s\S]*?/\* QILY-CONTACT-ACTION-V13:END \*/\n?','\n',s)
block='''
/* QILY-CONTACT-ACTION-V13:START */
.qily-phone-list a{display:flex!important;align-items:center!important;justify-content:center!important;gap:8px!important;cursor:pointer!important;transition:background-color .16s ease,border-color .16s ease,box-shadow .16s ease,transform .16s ease!important}
.qily-phone-list a:hover,.qily-phone-list a:focus-visible{background:#e6f5f2!important;border-color:#178b94!important;box-shadow:0 8px 18px rgba(15,75,90,.16)!important;outline:2px solid rgba(23,139,148,.2)!important;outline-offset:2px!important;transform:translateY(-1px)!important}
.qily-phone-list a:active{background:#dff0ec!important;transform:scale(.985)!important}
.qily-phone-city{text-decoration:none!important}
.qily-phone-number{text-decoration:underline!important;text-decoration-thickness:2px!important;text-underline-offset:4px!important;text-decoration-skip-ink:none!important}
.qily-wechat-action span{text-decoration:none!important}
.qily-wechat-action strong{text-decoration:underline!important;text-decoration-thickness:2px!important;text-underline-offset:4px!important;text-decoration-skip-ink:none!important}
.qily-phone-copy-prompt{position:fixed;z-index:12040;display:flex;align-items:center;gap:8px;max-width:min(92vw,560px);padding:10px 12px;border:1px solid #b8d9d4;border-radius:12px;color:#073c47;background:#fff;box-shadow:0 16px 40px rgba(7,60,71,.22);opacity:0;visibility:hidden;transform:translateY(4px);transition:opacity .16s ease,transform .16s ease,visibility .16s ease}
.qily-phone-copy-prompt.show{opacity:1;visibility:visible;transform:none}
.qily-phone-copy-prompt span{font-size:14px;font-weight:850;line-height:1.45}
.qily-phone-copy-prompt button{min-height:34px;padding:6px 10px;border:1px solid #0f4b5a;border-radius:8px;color:#fff;background:#0f4b5a;cursor:pointer;font:inherit;font-size:13px;font-weight:900;white-space:nowrap}
.qily-phone-copy-prompt [data-qily-call-cancel]{color:#0f4b5a;background:#fff}
.term-opl-contact-label{text-decoration:none!important}
.term-opl-copy-wechat-v9{text-decoration:underline!important;text-decoration-thickness:2px!important;text-underline-offset:3px!important;text-decoration-skip-ink:none!important}
/* QILY-CONTACT-ACTION-V13:END */
'''
s += block
p.write_text(s,encoding='utf-8')

checks={
    'site-navigation-core.js':['QILY-PHONE-COPY-PROMPT-V13','data-qily-phone-copy','20260814-contact-v13'],
    'site-shell.css':['QILY-CONTACT-ACTION-V13:START','.qily-phone-number{text-decoration:underline'],
    'cooperation/index.html':['contact-action-value">Qily259','data-qily-phone-copy="13450014003"'],
    'knowledge/terminology.html':['term-opl-contact-label">微信：']
}
for name,tokens in checks.items():
    text=Path(name).read_text(encoding='utf-8')
    for token in tokens:
        if token not in text: raise SystemExit(f'{name}: missing {token}')
print('Contact Action V13 materialized and validated.')
