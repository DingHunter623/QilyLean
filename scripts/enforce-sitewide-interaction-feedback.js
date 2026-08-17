#!/usr/bin/env node
'use strict';

/* QilyLean sitewide interaction feedback enforcer v1｜2026-08-17
 * Permanent rule:
 *   1) every public HTML page using the QilyLean shell loads the same interaction CSS;
 *   2) the CSS must expose hover / active / focus-visible / dock pressed feedback;
 *   3) cache version is normalized centrally, preventing old pages from silently drifting back.
 */
const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
const CSS_FILE='site-interaction-continuity-v1.css';
const CSS_VERSION='20260817-continuity-v2';
const CSS_HREF=`/${CSS_FILE}?v=${CSS_VERSION}`;
const LINK=`<link id="qilyInteractionContinuityV2" rel="stylesheet" href="${CSS_HREF}">`;

function read(rel){return fs.readFileSync(path.join(root,rel),'utf8');}
function write(rel,content){const file=path.join(root,rel);const out=content.endsWith('\n')?content:`${content}\n`;if(fs.readFileSync(file,'utf8')===out)return false;fs.writeFileSync(file,out,'utf8');return true;}
function assert(ok,msg){if(!ok)throw new Error(msg);}
function walk(dir,fn){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){if(['.git','node_modules','.cache','dist','build'].includes(entry.name))continue;const full=path.join(dir,entry.name);entry.isDirectory()?walk(full,fn):fn(full);}}
function isPublicShell(html){return /<head>/i.test(html)&&/<\/head>/i.test(html)&&/<body\b/i.test(html)&&/(?:site-navigation\.js|qily-global-nav|site-nav|qily-site-header|qily-global-header)/i.test(html);}
function normalize(html){
  let out=html.replace(/\s*<link\b[^>]*(?:id=["']qilyInteractionContinuityV\d+["']|href=["'][^"']*\/site-interaction-continuity-v1\.css(?:\?[^"']*)?["'])[^>]*>\s*/gi,'\n');
  out=out.replace(/<\/head>/i,`${LINK}\n</head>`);
  return out;
}
function validateCss(){
  const css=read(CSS_FILE);
  const markers=[
    'interaction continuity v2',
    '.qily-home-actions',
    '.qily-section-actions',
    '.qily-ia-actions',
    '.module-actions',
    '.article-actions',
    '.hero-actions',
    '.form-actions',
    'a.qily-ia-button',
    'a.resource-action',
    'a.service-contract-link',
    '.contact-card',
    '#floatDock',
    ':hover',
    ':active',
    ':focus-visible',
    '[data-qily-pressed="true"]',
    '@media (hover:hover) and (pointer:fine)',
    '@media(prefers-reduced-motion:reduce)'
  ];
  for(const marker of markers)assert(css.includes(marker),`interaction CSS missing permanent marker: ${marker}`);
  assert(/button:disabled/.test(css),'interaction CSS missing disabled-state protection');
  assert(/header\.qily-site-header[\s\S]*nav\.site-nav/.test(css),'interaction CSS missing primary-navigation feedback');
}
function main(){
  validateCss();
  let checked=0,changed=0;
  walk(root,file=>{
    if(!file.endsWith('.html'))return;
    const rel=path.relative(root,file).split(path.sep).join('/');
    const before=fs.readFileSync(file,'utf8');
    if(!isPublicShell(before))return;
    checked++;
    const after=normalize(before);
    if(after!==before){fs.writeFileSync(file,after.endsWith('\n')?after:`${after}\n`,'utf8');changed++;}
  });
  const keyPages=['index.html','capabilities/index.html','projects/index.html','improvements/index.html','knowledge/index.html','experience/index.html','cooperation/index.html','trust/index.html'];
  for(const rel of keyPages){
    if(!fs.existsSync(path.join(root,rel)))continue;
    const html=read(rel);
    assert(html.includes(CSS_HREF),`${rel}: permanent interaction CSS v2 missing`);
    assert((html.match(/site-interaction-continuity-v1\.css/g)||[]).length===1,`${rel}: interaction CSS duplicated`);
  }
  process.stdout.write(`Interaction feedback v2 enforced on ${checked} public pages; refreshed ${changed}.\n`);
}
main();
