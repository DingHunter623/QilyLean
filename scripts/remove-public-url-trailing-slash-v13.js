#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');

const TEXT_EXT = new Set(['.html','.htm','.js','.mjs','.cjs','.json','.md','.txt','.py','.java','.kt','.xml','.svg','.css','.yaml','.yml']);
const SKIP_DIR = new Set(['.git','.github','node_modules','.gradle','build','dist']);
const ROOT_WITH_SLASH = 'https://qilylean.com/';
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

// Standalone root URL only. Do not touch URL prefixes such as https://qilylean.com/assets/...
const standaloneRoot = /https:\/\/qilylean\.com\/(?=(?:["'`<>\s),;\]}]|$))/g;
for (const p of walk(root)) {
  let s;
  try { s=fs.readFileSync(p,'utf8'); } catch { continue; }
  const before=s;
  s=s.replace(standaloneRoot,()=>{literalReplacements++;return ROOT_NO_SLASH;});
  writeIfChanged(p,before,s);
}

// Public output runtime: all copy/share operations remove a trailing slash from QilyLean URLs,
// while internal routing remains untouched.
const corePath=path.join(root,'site-navigation-core.js');
if(fs.existsSync(corePath)){
  let s=fs.readFileSync(corePath,'utf8');
  const before=s;
  s=s.replace("var HOME_URL = 'https://qilylean.com/';","var HOME_URL = 'https://qilylean.com';");
  s=s.replace("var HOME_URL = 'https://qilylean.com';","var HOME_URL = 'https://qilylean.com';");

  if(!s.includes('QILY-PUBLIC-URL-NO-TRAILING-SLASH-V13')){
    const helper=`\n  /* QILY-PUBLIC-URL-NO-TRAILING-SLASH-V13 */\n  function normalizePublicUrl(value) {\n    var text = String(value == null ? '' : value).trim();\n    if (!text) return text;\n    try {\n      var u = new URL(text, location.origin);\n      if (u.hostname !== 'qilylean.com' && u.hostname !== 'www.qilylean.com') return text;\n      var pathname = u.pathname || '';\n      pathname = pathname === '/' ? '' : pathname.replace(/\\/+$/, '');\n      return u.protocol + '//' + u.host + pathname + u.search + u.hash;\n    } catch (error) {\n      return text.replace(/\\\/(?=(?:[?#]|$))/, '');\n    }\n  }\n  function normalizePublicUrlText(value) {\n    var text = String(value == null ? '' : value);\n    return text.replace(/https:\\/\\/(?:www\\.)?qilylean\\.com(?:\\/[^\\s<>'\"`]*)?/g, function (candidate) {\n      return normalizePublicUrl(candidate);\n    });\n  }\n  window.QilyLeanNormalizePublicUrl = normalizePublicUrl;\n  window.QilyLeanNormalizePublicUrlText = normalizePublicUrlText;\n`;
    const anchor='\n  function copyText(text) {';
    if(!s.includes(anchor)) throw new Error('site-navigation-core copyText anchor missing');
    s=s.replace(anchor,helper+anchor);
  }
  s=s.replace(/function copyText\(text\) \{\n(?!    text = normalizePublicUrlText\(text\);)/,
    "function copyText(text) {\n    text = normalizePublicUrlText(text);");
  s=s.replace(/function shareUrl\(title, url, successMessage\) \{\n(?!    url = normalizePublicUrl\(url\);)/,
    "function shareUrl(title, url, successMessage) {\n    url = normalizePublicUrl(url);");
  s=s.replace("var url = location.href;","var url = normalizePublicUrl(location.href);");
  // Current-page share QR/copy helpers elsewhere in this runtime may read location.href directly.
  s=s.replace(/(?<![\w.])location\.origin\s*\+\s*location\.pathname/g,'normalizePublicUrl(location.origin + location.pathname)');

  // Strongly normalize any user-visible root URLs materialized by this shared shell.
  s=s.replace(/href=\\?"https:\/\/qilylean\.com\/\\?"/g,'href="https://qilylean.com"');
  s=s.replace(/>https:\/\/qilylean\.com\/<\/g,'>https://qilylean.com</');
  s=s.replace(/https:\/\/qilylean\.com\/　/g,'https://qilylean.com　');
  writeIfChanged(corePath,before,s);
}

// Legacy/public share runtimes: fixed homepage target and current-page URL reads.
for(const file of [
  'site-navigation.js','qilylean/share-qr-fix.js','qilylean/floating-service.js',
  'qilylean/floating-ui-repair.js','app-download-share-v1.js','brand-identity.js',
  'qilylean/daily-insights-archive.js'
]){
  const p=path.join(root,file); if(!fs.existsSync(p)) continue;
  let s=fs.readFileSync(p,'utf8'); const before=s;
  s=s.replace(standaloneRoot,ROOT_NO_SLASH);
  // If a URL variable is explicitly sourced from the current page, trim only the final slash.
  s=s.replace(/(\b(?:var|let|const)\s+[A-Za-z_$][\w$]*(?:url|Url|URL)[\w$]*\s*=\s*)location\.href(\s*;)/g,
    '$1(location.href.replace(/\\\/(?=([?#]|$))/,\'\'))$2');
  s=s.replace(/url\s*:\s*location\.href/g,"url: location.href.replace(/\\\/(?=([?#]|$))/, '')");
  s=s.replace(/location\.origin\s*\+\s*location\.pathname/g,"(location.origin + location.pathname).replace(/\\\/(?=([?#]|$))/, '')");
  writeIfChanged(p,before,s);
}

// Public share page should never display/copy a slash-terminated homepage URL.
const sharePage=path.join(root,'share','index.html');
if(fs.existsSync(sharePage)){
  let s=fs.readFileSync(sharePage,'utf8');const before=s;
  s=s.replace(standaloneRoot,ROOT_NO_SLASH);
  s=s.replace(/location\.href(?=\s*[;,)]|\s*$)/g,"location.href.replace(/\\\/(?=([?#]|$))/, '')");
  writeIfChanged(sharePage,before,s);
}

// Validate app source: QilyLean Home must not keep a standalone slash-terminated official URL.
const qhome=path.join(root,'android','qilylean-home','app','src','main','java','com','qilylean','home','MainActivity.java');
if(fs.existsSync(qhome)){
  const s=fs.readFileSync(qhome,'utf8');
  if(standaloneRoot.test(s)) throw new Error('QilyLean Home MainActivity still contains slash-terminated official URL');
  standaloneRoot.lastIndex=0;
}

// Product-facing static text must no longer expose the slash-terminated root URL.
const forbidden=[];
for(const p of walk(root)){
  const r=rel(p);
  if(r.startsWith('scripts/') || r.startsWith('maintenance/')) continue;
  let s; try{s=fs.readFileSync(p,'utf8');}catch{continue;}
  standaloneRoot.lastIndex=0;
  if(standaloneRoot.test(s)) forbidden.push(r);
}
if(forbidden.length) throw new Error('Slash-terminated public root URL remains in: '+forbidden.slice(0,30).join(', '));

fs.writeFileSync(path.join(root,'maintenance','public-url-output-v13.json'),JSON.stringify({
  version:'2026-08-14-v13',
  policy:'user-visible, copied, QR and shared QilyLean URLs omit trailing slash; internal routes remain unchanged',
  root_url:ROOT_NO_SLASH,
  changed_files:[...new Set(changed)].sort(),
  changed_file_count:new Set(changed).size,
  standalone_root_replacements:literalReplacements
},null,2)+'\n','utf8');

console.log(`PASS URL Output V13: ${new Set(changed).size} files changed; ${literalReplacements} standalone root URL replacements.`);
