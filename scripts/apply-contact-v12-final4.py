#!/usr/bin/env python3
from pathlib import Path
import re

root = Path(__file__).resolve().parent.parent
ASSET_VERSION = '20260814-contact-v124'

PHONE_HELPER = r'''
  /* QILY-PHONE-COPY-CALL-PROMPT-V12.4 */
  function ensurePhoneCallPrompt(){
    var p=document.getElementById('qilyPhoneCallPrompt');if(p)return p;
    p=document.createElement('div');
    p.id='qilyPhoneCallPrompt';
    p.className='qily-wechat-copy-prompt qily-phone-call-prompt';
    p.setAttribute('role','status');
    p.setAttribute('aria-live','polite');
    p.innerHTML='<span></span><button type="button" data-qily-call-now>立即拨打</button>';
    document.body.appendChild(p);
    p.querySelector('[data-qily-call-now]').addEventListener('click',function(){
      var phone=p.getAttribute('data-phone')||'';
      p.classList.remove('show');
      if(phone)window.location.href='tel:'+phone;
    });
    return p;
  }
  function copyPhoneAndPrompt(anchor,phone){
    phone=(phone||'').replace(/[^0-9+]/g,'');
    if(!phone)return Promise.resolve();
    return copyText(phone).then(function(){
      var p=ensurePhoneCallPrompt();
      p.setAttribute('data-phone',phone);
      p.querySelector('span').textContent='电话号码 '+phone+' 已复制，是否立即拨打？';
      positionWechatCopyPrompt(anchor,p);
      p.classList.add('show');
      clearTimeout(copyPhoneAndPrompt.timer);
      copyPhoneAndPrompt.timer=setTimeout(function(){p.classList.remove('show');},9000);
    });
  }
  window.__qilyCopyPhoneAndPrompt=copyPhoneAndPrompt;
  document.addEventListener('click',function(e){
    var x=e.target.closest&&e.target.closest('[data-qily-phone-call]');
    if(!x)return;
    e.preventDefault();
    e.stopPropagation();
    copyPhoneAndPrompt(x,x.getAttribute('data-qily-phone-call'));
  });

'''

def patch_navigation(path: Path):
    t = path.read_text('utf-8')
    t = re.sub(r"var SHARED_ASSET_VERSION = '[^']+';", f"var SHARED_ASSET_VERSION = '{ASSET_VERSION}';", t, count=1)
    old = "return '<a href=\"tel:' + item.number + '\"><span class=\"qily-phone-city\">' + item.city + '：</span><strong class=\"qily-phone-number\">' + item.number + '</strong></a>';"
    new = "return '<a href=\"tel:' + item.number + '\" data-qily-phone-call=\"' + item.number + '\" aria-label=\"复制电话号码 ' + item.number + ' 并确认拨打\"><span class=\"qily-phone-city\">' + item.city + '：</span><strong class=\"qily-phone-number\">' + item.number + '</strong></a>';"
    if old in t:
        t = t.replace(old, new, 1)
    else:
        t = re.sub(
            r"return '<a href=\"tel:' \+ item\.number \+ '\"><span class=\"qily-phone-city\">' \+ item\.city \+ '：</span><strong class=\"qily-phone-number\">' \+ item\.number \+ '</strong></a>';",
            new,
            t,
            count=1
        )
    if 'QILY-PHONE-COPY-CALL-PROMPT-V12.4' not in t:
        anchor = '  function shareUrl('
        assert anchor in t, f'{path.name}: shareUrl anchor missing'
        t = t.replace(anchor, PHONE_HELPER + anchor, 1)
    assert 'data-qily-phone-call' in t, f'{path.name}: phone row hook missing'
    assert 'QILY-PHONE-COPY-CALL-PROMPT-V12.4' in t, f'{path.name}: phone helper missing'
    path.write_text(t, 'utf-8')

for name in ['site-navigation-core.js','site-navigation.js']:
    p=root/name
    if p.exists(): patch_navigation(p)

# Shared visual layer: default rows remain calm; hover/focus/click give clear feedback.
p=root/'site-shell.css';t=p.read_text('utf-8')
start='/* QILY-CONTACT-INTERACTION-V12.4:START */';end='/* QILY-CONTACT-INTERACTION-V12.4:END */'
block=r'''/* QILY-CONTACT-INTERACTION-V12.4:START */
.qily-contact-panel .qily-phone-list a{cursor:pointer!important;transition:transform .16s ease,box-shadow .16s ease,background-color .16s ease,border-color .16s ease!important}
.qily-contact-panel .qily-phone-list a:hover,.qily-contact-panel .qily-phone-list a:focus-visible{transform:translateY(-2px)!important;border-color:#caa15f!important;background:#fff8e8!important;box-shadow:0 9px 20px rgba(15,75,90,.14)!important;outline:3px solid rgba(202,161,95,.18)!important;outline-offset:2px!important}
.qily-contact-panel .qily-phone-list a:active{transform:scale(.985)!important;background:#ffeab3!important}
.qily-contact-panel .qily-phone-city{text-decoration:none!important;text-decoration-line:none!important}
.qily-contact-panel .qily-phone-number{text-decoration:underline!important;text-decoration-thickness:2px!important;text-underline-offset:4px!important;text-decoration-skip-ink:none!important}
.qily-phone-call-prompt{border-color:#178b94!important;background:#eef8f6!important}
.qily-phone-call-prompt button{background:#0f4b5a!important}
.contact-card .contact-line,.contact-card .wechat-contact-action{display:flex!important;align-items:center!important;justify-content:center!important;gap:7px!important;width:100%!important;min-height:46px!important;margin-top:10px!important;padding:9px 14px!important;border:1px solid rgba(255,227,155,.48)!important;color:#fff!important;-webkit-text-fill-color:#fff!important;background:rgba(255,255,255,.08)!important;text-decoration:none!important;cursor:pointer!important;font:inherit!important;font-weight:900!important;box-sizing:border-box!important}
.contact-card .contact-line span,.contact-card .wechat-contact-action span{text-decoration:none!important;text-decoration-line:none!important;color:inherit!important;-webkit-text-fill-color:inherit!important}
.contact-card .contact-line strong,.contact-card .wechat-contact-action strong{text-decoration:underline!important;text-decoration-thickness:2px!important;text-underline-offset:4px!important;text-decoration-skip-ink:none!important;color:inherit!important;-webkit-text-fill-color:inherit!important;font-weight:950!important}
.contact-card .contact-line:hover,.contact-card .contact-line:focus-visible,.contact-card .wechat-contact-action:hover,.contact-card .wechat-contact-action:focus-visible{transform:translateY(-2px)!important;border-color:#ffe39b!important;background:#12606f!important;box-shadow:0 8px 20px rgba(15,75,90,.22)!important;outline:none!important}
.contact-card .contact-line:active,.contact-card .wechat-contact-action:active{transform:scale(.99)!important;background:#073c47!important}
/* QILY-CONTACT-INTERACTION-V12.4:END */'''
if start in t and end in t:
    t=re.sub(re.escape(start)+r'.*?'+re.escape(end),block,t,count=1,flags=re.S)
else:
    t+='\n\n'+block+'\n'
p.write_text(t,'utf-8')

# Project cooperation: all label text remains plain; only values are underlined.
p=root/'cooperation/index.html';t=p.read_text('utf-8')
t=t.replace('<a href="tel:13450014003">电话：134 5001 4003</a>',
            '<a class="contact-line" href="tel:13450014003" data-qily-phone-call="13450014003" aria-label="复制电话号码13450014003并确认拨打"><span>电话：</span><strong>134 5001 4003</strong></a>')
t=t.replace('<a href="mailto:admin@qilylean.com">官网邮箱：admin@qilylean.com</a>',
            '<a class="contact-line" href="mailto:admin@qilylean.com"><span>官网邮箱：</span><strong>admin@qilylean.com</strong></a>')
# normalize existing WeChat action regardless of earlier formatting
wechat='<button type="button" id="copyWechat" class="wechat-contact-action" data-qily-wechat-copy="Qily259" aria-label="复制微信 Qily259"><span>微信：</span><strong>Qily259</strong></button>'
t=re.sub(r'<button type="button" id="copyWechat"[^>]*>.*?</button>',wechat,t,count=1,flags=re.S)
assert 'class="wechat-contact-action"' in t
assert '<span>微信：</span><strong>Qily259</strong>' in t
assert 'data-qily-phone-call="13450014003"' in t
p.write_text(t,'utf-8')

# OPL: the three phone values use the same copy/confirm-dial interaction.
p=root/'knowledge/terminology.html';t=p.read_text('utf-8')
for num,display in [('13450014003','134 5001 4003'),('15168120722','151 6812 0722'),('17681788259','176 8178 8259')]:
    old=f'<a href="tel:{num}">{display}</a>'
    new=f'<a href="tel:{num}" data-qily-phone-call="{num}" aria-label="复制电话号码{num}并确认拨打">{display}</a>'
    t=t.replace(old,new)
p.write_text(t,'utf-8')

# QA
for f in [root/'site-navigation.js',root/'site-shell.css',root/'cooperation/index.html']:
    assert f.exists()
nav=(root/'site-navigation.js').read_text('utf-8')
css=(root/'site-shell.css').read_text('utf-8')
coop=(root/'cooperation/index.html').read_text('utf-8')
assert ASSET_VERSION in nav
assert '电话号码 '+"'+phone+'" not in nav  # syntax sanity only
assert 'QILY-PHONE-COPY-CALL-PROMPT-V12.4' in nav
assert 'data-qily-phone-call' in nav
assert 'QILY-CONTACT-INTERACTION-V12.4:START' in css
assert '.qily-phone-city{text-decoration:none' in css
assert '.qily-phone-number{text-decoration:underline' in css
assert '<span>微信：</span><strong>Qily259</strong>' in coop
assert '<span>电话：</span><strong>134 5001 4003</strong>' in coop
print('Contact V12.4 PASS: phone copy/call prompt, full-row WeChat, value-only underlines.')
