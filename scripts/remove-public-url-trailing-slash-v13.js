#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');

const TEXT_EXT = new Set(['.html','.htm','.js','.mjs','.cjs','.json','.md','.txt','.py','.java','.kt','.xml','.svg','.css','.yaml','.yml']);
const SKIP_DIR = new Set(['.git','.github','node_modules','.gradle','build','dist']);
const ROOT_NO_SLASH = 'https://qilylean.com';
const changed = [];
let literalReplacements = 0;

function walk(dir, out=[]) {
  for (const ent of fs.readdirSync(dir,{withFileTypes:true})) {
    if (SKIP_DIR.has(ent.name)) continue;
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p,out);
    else if (ent.isFile() && TEXT_EXT.has(path.extname(ent.name).toLowerCase())) out.push(p);
  }
  return out;
}
function rel(p){ return path.relative(root,p).replace(/\\/g,'/'); }
function writeIfChanged(p, before, after){
  if(after!==before){ fs.writeFileSync(p,after,'utf8'); changed.push(rel(p)); }
}

// Standalone root URL only. URL prefixes used for assets/routes are deliberately untouched.
const standaloneRoot = /https:\/\/qilylean\.com\/(?=(?:["'`<>\s),;\]}]|$))/g;
for (const p of walk(root)) {
  const r=rel(p);
  if(r === 'scripts/remove-public-url-trailing-slash-v13.js') continue;
  let s;
  try { s=fs.readFileSync(p,'utf8'); } catch { continue; }
  const before=s;
  s=s.replace(standaloneRoot,()=>{literalReplacements++;return ROOT_NO_SLASH;});
  writeIfChanged(p,before,s);
}

// Shared public runtime. It owns current-page sharing and the share/contact modal.
const corePath=path.join(root,'site-navigation-core.js');
if(fs.existsSync(corePath)){
  let s=fs.readFileSync(corePath,'utf8');
  const before=s;
  s=s.replace("var HOME_URL = 'https://qilylean.com/';","var HOME_URL = 'https://qilylean.com';");

  if(!s.includes('QILY-PUBLIC-URL-NO-TRAILING-SLASH-V13')){
    const helper=[
      '',
      '  /* QILY-PUBLIC-URL-NO-TRAILING-SLASH-V13 */',
      '  function normalizePublicUrl(value) {',
      "    var text = String(value == null ? '' : value).trim();",
      '    if (!text) return text;',
      '    try {',
      '      var u = new URL(text, location.origin);',
      "      if (u.hostname !== 'qilylean.com' && u.hostname !== 'www.qilylean.com') return text;",
      "      var pathname = u.pathname || '';",
      "      pathname = pathname === '/' ? '' : pathname.replace(/\\/+$/, '');",
      "      return u.protocol + '//' + u.host + pathname + u.search + u.hash;",
      '    } catch (error) {',
      "      return text.replace(/\\\/(?=(?:[?#]|$))/, '');",
      '    }',
      '  }',
      '  function normalizePublicUrlText(value) {',
      "    var text = String(value == null ? '' : value);",
      "    return text.replace(/https:\\/\\/(?:www\\.)?qilylean\\.com(?:\\/[^\\s<>\"']*)?/g, function (candidate) {",
      '      return normalizePublicUrl(candidate);',
      '    });',
      '  }',
      '  window.QilyLeanNormalizePublicUrl = normalizePublicUrl;',
      '  window.QilyLeanNormalizePublicUrlText = normalizePublicUrlText;',
      ''
    ].join('\n');
    const anchor='\n  function copyText(text) {';
    if(!s.includes(anchor)) throw new Error('site-navigation-core copyText anchor missing');
    s=s.replace(anchor,helper+anchor);
  }

  s=s.replace(/function copyText\(text\) \{\n(?!    text = normalizePublicUrlText\(text\);)/,
    "function copyText(text) {\n    text = normalizePublicUrlText(text);");
  s=s.replace(/function shareUrl\(title, url, successMessage\) \{\n(?!    url = normalizePublicUrl\(url\);)/,
    "function shareUrl(title, url, successMessage) {\n    url = normalizePublicUrl(url);");
  s=s.replace('var url = location.href;','var url = normalizePublicUrl(location.href);');
  s=s.replace(/(?<![\w.])location\.origin\s*\+\s*location\.pathname/g,'normalizePublicUrl(location.origin + location.pathname)');

  // Share/contact/footer/document-tail roots are user-visible output, not internal routing.
  s=s.replace(/https:\/\/qilylean\.com\/(?=(?:["'<>\s),;\]}]|$))/g,ROOT_NO_SLASH);
  writeIfChanged(corePath,before,s);
}

// Older public share runtimes kept for compatibility.
for(const file of [
  'site-navigation.js','qilylean/share-qr-fix.js','qilylean/floating-service.js',
  'qilylean/floating-ui-repair.js','app-download-share-v1.js','brand-identity.js',
  'qilylean/daily-insights-archive.js'
]){
  const p=path.join(root,file); if(!fs.existsSync(p)) continue;
  let s=fs.readFileSync(p,'utf8'); const before=s;
  s=s.replace(/https:\/\/qilylean\.com\/(?=(?:["'`<>\s),;\]}]|$))/g,ROOT_NO_SLASH);
  s=s.replace(/(\b(?:var|let|const)\s+[A-Za-z_$][\w$]*(?:url|Url|URL)[\w$]*\s*=\s*)location\.href(\s*;)/g,
    "$1(location.href.replace(/\\\/(?=([?#]|$))/, ''))$2");
  s=s.replace(/url\s*:\s*location\.href/g,"url: location.href.replace(/\\\/(?=([?#]|$))/, '')");
  s=s.replace(/location\.origin\s*\+\s*location\.pathname/g,"(location.origin + location.pathname).replace(/\\\/(?=([?#]|$))/, '')");
  writeIfChanged(p,before,s);
}

const sharePage=path.join(root,'share','index.html');
if(fs.existsSync(sharePage)){
  let s=fs.readFileSync(sharePage,'utf8');const before=s;
  s=s.replace(/https:\/\/qilylean\.com\/(?=(?:["'`<>\s),;\]}]|$))/g,ROOT_NO_SLASH);
  s=s.replace(/location\.href(?=\s*[;,)]|\s*$)/g,"location.href.replace(/\\\/(?=([?#]|$))/, '')");
  writeIfChanged(sharePage,before,s);
}

const qhome=path.join(root,'android','qilylean-home','app','src','main','java','com','qilylean','home','MainActivity.java');
if(fs.existsSync(qhome)){
  const s=fs.readFileSync(qhome,'utf8');
  standaloneRoot.lastIndex=0;
  if(standaloneRoot.test(s)) throw new Error('QilyLean Home MainActivity still contains slash-terminated official URL');
}

// Product-facing text must no longer expose a standalone slash-terminated root URL.
const forbidden=[];
for(const p of walk(root)){
  const r=rel(p);
  if(r.startsWith('scripts/') || r.startsWith('maintenance/')) continue;
  let s; try{s=fs.readFileSync(p,'utf8');}catch{continue;}
  standaloneRoot.lastIndex=0;
  if(standaloneRoot.test(s)) forbidden.push(r);
}
if(forbidden.length) throw new Error('Slash-terminated public root URL remains in: '+forbidden.slice(0,30).join(', '));

fs.mkdirSync(path.join(root,'maintenance'),{recursive:true});
fs.writeFileSync(path.join(root,'maintenance','public-url-output-v13.json'),JSON.stringify({
  version:'2026-08-14-v13',
  policy:'user-visible, copied, QR and shared QilyLean URLs omit trailing slash; internal routes remain unchanged',
  root_url:ROOT_NO_SLASH,
  changed_files:[...new Set(changed)].sort(),
  changed_file_count:new Set(changed).size,
  standalone_root_replacements:literalReplacements
},null,2)+'\n','utf8');

console.log(`PASS URL Output V13: ${new Set(changed).size} files changed; ${literalReplacements} standalone root URL replacements.`);
