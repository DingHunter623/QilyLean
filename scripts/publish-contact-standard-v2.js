'use strict';

const fs = require('fs');
const path = require('path');

const EMAIL = 'admin@qilylean.com';
const VERSION = '20260807-enterprise-contact-standard-v2';

function read(file){ return fs.readFileSync(file,'utf8'); }
function write(file,text){ fs.writeFileSync(file,text,'utf8'); }
function assert(cond,msg){ if(!cond) throw new Error(msg); }

function replaceOnce(text, oldValue, newValue, label){
  if (text.includes(newValue)) return text;
  assert(text.includes(oldValue), label + ' anchor not found');
  return text.replace(oldValue, newValue);
}

// 1) Related contact modules shown on public cooperation/onboarding pages.
{
  const file='cooperation/index.html';
  let text=read(file);
  const oldValue='<a href="tel:13450014003">电话：134 5001 4003</a><button type="button" id="copyWechat">复制微信号：Qily259</button>';
  const newValue='<a href="tel:13450014003">电话：134 5001 4003</a><a href="mailto:'+EMAIL+'">企业邮箱：'+EMAIL+'</a><button type="button" id="copyWechat">复制微信号：Qily259</button>';
  text=replaceOnce(text,oldValue,newValue,'cooperation contact card');
  write(file,text);
}
{
  const file='links/onboarding/index.html';
  let text=read(file);
  const oldValue='<a href="tel:13450014003">电话：134 5001 4003</a><button type="button" id="copyWechat">复制微信号：Qily259</button>';
  const newValue='<a href="tel:13450014003">电话：134 5001 4003</a><a href="mailto:'+EMAIL+'">企业邮箱：'+EMAIL+'</a><button type="button" id="copyWechat">复制微信号：Qily259</button>';
  text=replaceOnce(text,oldValue,newValue,'onboarding contact card');
  write(file,text);
}

// 2) Global footer contact standard: one accurate, non-overclaiming international contact line.
{
  const file='site-navigation-core.js';
  let text=read(file);
  text=text.replace(/var SHARED_ASSET_VERSION = '[^']+';/, "var SHARED_ASSET_VERSION = '"+VERSION+"';");
  assert(text.includes("var CONTACT_EMAIL = '"+EMAIL+"';"),'CONTACT_EMAIL constant missing');

  if(!text.includes('function ensureGlobalContactFooter()')){
    const anchor='  function revealCurrentShell() {';
    assert(text.includes(anchor),'revealCurrentShell anchor not found');
    const fn=`  function ensureGlobalContactFooter() {\n    if (document.getElementById('qilyGlobalContactFooter')) return;\n    var block = document.createElement('div');\n    block.id = 'qilyGlobalContactFooter';\n    block.className = 'qily-global-contact-footer';\n    block.innerHTML = '<span>QilyLean｜技术与项目联系 / Technical &amp; Project Contact</span><a href="mailto:' + CONTACT_EMAIL + '">' + CONTACT_EMAIL + '</a>';\n    var footer = document.querySelector('footer');\n    if (footer) footer.appendChild(block);\n    else {\n      var shell = document.createElement('div');\n      shell.className = 'qily-global-contact-footer-shell';\n      shell.appendChild(block);\n      document.body.appendChild(shell);\n    }\n  }\n\n`;
    text=text.replace(anchor,fn+anchor);
  }
  if(!text.includes('      ensureGlobalContactFooter();')){
    const bootAnchor='      buildNavigation();\n      protectControlledPage();';
    assert(text.includes(bootAnchor),'boot anchor not found');
    text=text.replace(bootAnchor,'      buildNavigation();\n      ensureGlobalContactFooter();\n      protectControlledPage();');
  }
  write(file,text);
}

// 3) Shared footer visual standard.
{
  const file='site-shell.css';
  let text=read(file);
  if(!text.includes('QILY-GLOBAL-CONTACT-FOOTER:START')){
    text += `\n\n/* QILY-GLOBAL-CONTACT-FOOTER:START */\n.qily-global-contact-footer-shell{background:#101916}\n.qily-global-contact-footer{display:flex;align-items:center;justify-content:center;gap:12px;flex-wrap:wrap;margin-top:14px;padding:14px clamp(16px,3vw,34px);border-top:1px solid rgba(255,227,155,.28);color:#d6e5df;background:#101916;font-size:14px;line-height:1.55;text-align:center}\n.qily-global-contact-footer span{font-weight:800;letter-spacing:.01em}\n.qily-global-contact-footer a{display:inline-flex;align-items:center;justify-content:center;min-height:34px;padding:5px 10px;border:1px solid rgba(255,227,155,.48);border-radius:8px;color:#ffe39b!important;background:rgba(255,255,255,.05);font-weight:900;text-decoration:none!important;white-space:nowrap}\n.qily-global-contact-footer a:hover,.qily-global-contact-footer a:focus-visible{color:#17322d!important;background:#ffe39b;outline:none}\n@media(max-width:620px){.qily-global-contact-footer{gap:8px;padding:13px 12px;font-size:13px}.qily-global-contact-footer span,.qily-global-contact-footer a{width:100%}}\n/* QILY-GLOBAL-CONTACT-FOOTER:END */\n`;
  }
  write(file,text);
}

// 4) Bust the full loader chain so browsers do not keep the previous contact UI.
{
  const file='site-navigation-legacy-20260802.js';
  let text=read(file);
  text=text.replace(/var CORE_SRC = '\/site-navigation-core\.js\?v=[^']+';/,"var CORE_SRC = '/site-navigation-core.js?v="+VERSION+"';");
  assert(text.includes('/site-navigation-core.js?v='+VERSION),'legacy core version bump failed');
  write(file,text);
}
{
  const file='site-navigation.js';
  let text=read(file);
  text=text.replace(/legacy\.src = '\/site-navigation-legacy-20260802\.js\?v=[^']+';/,"legacy.src = '/site-navigation-legacy-20260802.js?v="+VERSION+"';");
  assert(text.includes('/site-navigation-legacy-20260802.js?v='+VERSION),'outer loader version bump failed');
  write(file,text);
}
function walk(dir){
  for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
    if(entry.name==='.git'||entry.name==='node_modules') continue;
    const full=path.join(dir,entry.name);
    if(entry.isDirectory()) walk(full);
    else if(entry.isFile() && entry.name.endsWith('.html')){
      let text; try{text=read(full);}catch{continue;}
      if(!text.includes('/site-navigation.js?v=')) continue;
      const next=text.replace(/\/site-navigation\.js\?v=[^"'<>\s]+/g,'/site-navigation.js?v='+VERSION);
      if(next!==text) write(full,next);
    }
  }
}
walk('.');

// 5) Audit public contact consistency.
const cooperation=read('cooperation/index.html');
const onboarding=read('links/onboarding/index.html');
const core=read('site-navigation-core.js');
const siteData=JSON.parse(read('qilylean/site-data.json'));
assert(cooperation.includes('企业邮箱：'+EMAIL),'cooperation email not visible');
assert(onboarding.includes('企业邮箱：'+EMAIL),'onboarding email not visible');
assert(core.includes('Technical &amp; Project Contact'),'global footer contact line missing');
assert(siteData.compliance && siteData.compliance.contactEmail===EMAIL,'site-data contactEmail is not standardized');

const forbidden=['396767769'+'@qq.com','DingHunter623'+'@gmail.com','dinghunter623'+'@gmail.com'];
const publicExt=new Set(['.html','.js','.json','.md']);
let leaks=[];
function audit(dir){
  for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
    if(entry.name==='.git'||entry.name==='node_modules'||entry.name==='.github') continue;
    const full=path.join(dir,entry.name);
    if(entry.isDirectory()) audit(full);
    else if(entry.isFile() && publicExt.has(path.extname(entry.name))){
      let text; try{text=read(full);}catch{continue;}
      for(const oldEmail of forbidden){ if(text.includes(oldEmail)) leaks.push(full+': '+oldEmail); }
    }
  }
}
audit('.');
assert(leaks.length===0,'legacy personal email remains in public files: '+leaks.join(', '));

console.log('QilyLean enterprise contact standard v2 published successfully.');
