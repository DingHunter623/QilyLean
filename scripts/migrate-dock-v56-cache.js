#!/usr/bin/env node
'use strict';

/* Controlled cache + compatibility migration for Dock V5.6.
 * Purpose: make the rectangular in-flow seven-action navigation runtime immediately
 * reachable on every tracked public page and migrate validators away from V5.5 URL assumptions.
 * Workflow files are deliberately excluded: GitHub Actions' GITHUB_TOKEN has contents
 * permission but may not rewrite workflow files. Workflow naming is maintained directly.
 */
const fs=require('fs');
const path=require('path');
const {execFileSync}=require('child_process');
const root=path.resolve(__dirname,'..');
const check=process.argv.includes('--check');
const SELF='scripts/migrate-dock-v56-cache.js';
const OLD_TOKENS=['20260902-authority-v55','20260902-public-dock-v55'];
const NEXT='20260906-authority-v56-flow-navigation';
const textExt=/\.(?:html?|js|mjs|cjs|css|json|md|ya?ml|xml|txt)$/i;
const tracked=execFileSync('git',['ls-files'],{cwd:root,encoding:'utf8',maxBuffer:64*1024*1024}).split(/\r?\n/).filter(Boolean);
const changed=[];
const excluded=file=>file===SELF||file.startsWith('.github/');

function writeIfChanged(file,source,next){
  if(next===source)return;
  fs.writeFileSync(path.join(root,file),next);
  if(!changed.includes(file))changed.push(file);
}

if(!check){
  for(const file of tracked){
    if(excluded(file)||!textExt.test(file))continue;
    const full=path.join(root,file);let source;
    try{source=fs.readFileSync(full,'utf8');}catch(error){continue;}
    let next=source;
    for(const old of OLD_TOKENS)next=next.split(old).join(NEXT);
    writeIfChanged(file,source,next);
  }

  /* These validators contain regex/string compatibility forms that do not include
   * the literal old cache token and therefore need a controlled semantic bridge. */
  const replacements={
    'scripts/validate-sitewide-remediation-20260822.js':[
      ['20260902-(?:authority|public-dock)-v55','20260906-authority-v56-flow-navigation'],
      ['Floating Dock Authoritative Runtime V5.5','Floating Dock Authoritative Runtime V5.6'],
      ['__qilyFloatingDockUnifiedV55','__qilyFloatingDockUnifiedV56'],
      ["ORDER=['home','top','back','search','current','contact']","ORDER=['home','top','back','previous','search','current','contact']"]
    ],
    'scripts/validate-contact-readability-ddz-20260824.js':[
      ['Floating Dock Authoritative Runtime V5.5','Floating Dock Authoritative Runtime V5.6'],
      ['__qilyFloatingDockUnifiedV55','__qilyFloatingDockUnifiedV56'],
      ["ORDER=['home','top','back','search','current','contact']","ORDER=['home','top','back','previous','search','current','contact']"],
      ['六按钮顺序漂移','七按钮顺序漂移']
    ],
    'scripts/validate-sitewide-safety-readability-v1.js':[
      ['Floating Dock Authoritative Runtime V5.5','Floating Dock Authoritative Runtime V5.6'],
      ['__qilyFloatingDockUnifiedV55','__qilyFloatingDockUnifiedV56'],
      ["ORDER=['home','top','back','search','current','contact']","ORDER=['home','top','back','previous','search','current','contact']"]
    ],
    'scripts/validate-global-language-runtime-compat-v1.js':[
      ['Floating Dock Authoritative Runtime V5.5','Floating Dock Authoritative Runtime V5.6'],
      ['__qilyFloatingDockUnifiedV55','__qilyFloatingDockUnifiedV56']
    ],
    'scripts/validate-sitewide-visual-closure-v27.js':[
      ['__qilyFloatingDockUnifiedV55','__qilyFloatingDockUnifiedV56']
    ],
    'scripts/validate-public-shell-v31.js':[
      ['six-action Dock remediation','seven-action in-flow Dock V5.6 remediation']
    ]
  };
  for(const [file,rules] of Object.entries(replacements)){
    const full=path.join(root,file);if(!fs.existsSync(full))continue;
    const source=fs.readFileSync(full,'utf8');let next=source;
    for(const [from,to] of rules)next=next.split(from).join(to);
    writeIfChanged(file,source,next);
  }

  const wordingFiles=[
    'scripts/materialize-global-language-v3.js',
    'scripts/materialize-contact-route-v6.js',
    'scripts/validate-sitewide-visual-closure-v27.js',
    'scripts/validate-global-language-runtime-compat-v1.js',
    'scripts/validate-sitewide-safety-readability-v1.js',
    'scripts/validate-sitewide-experience-v26.js',
    'scripts/validate-sitewide-remediation-20260822.js',
    'scripts/validate-contact-readability-ddz-20260824.js'
  ];
  for(const file of wordingFiles){
    const full=path.join(root,file);if(!fs.existsSync(full))continue;
    const source=fs.readFileSync(full,'utf8');
    const next=source.replace(/Dock V5\.5/g,'Dock V5.6').replace(/Dock V55/g,'Dock V56').replace(/six-action Dock/g,'seven-action flow Dock');
    writeIfChanged(file,source,next);
  }
}

if(check){
  const remaining=[];
  for(const file of tracked){
    if(excluded(file)||!textExt.test(file))continue;
    const full=path.join(root,file);let source='';try{source=fs.readFileSync(full,'utf8');}catch(error){continue;}
    for(const old of OLD_TOKENS)if(source.includes(old)){remaining.push(`${file}:${old}`);break;}
  }
  if(remaining.length)throw new Error(`Dock V5.6 cache migration incomplete: ${remaining.slice(0,30).join(', ')}${remaining.length>30?` (+${remaining.length-30})`:''}`);
  const materializer=fs.readFileSync(path.join(root,'scripts/materialize-global-language-v3.js'),'utf8');
  if(!materializer.includes(`DOCK_SHARE='/site-dock-share-runtime-v1.js?v=${NEXT}'`))throw new Error('Dock V5.6 cache migration: materializer does not own the V5.6 cache URL');
  const remediation=fs.readFileSync(path.join(root,'scripts/validate-sitewide-remediation-20260822.js'),'utf8');
  if(!remediation.includes('20260906-authority-v56-flow-navigation'))throw new Error('Dock V5.6 cache migration: remediation gate still lacks V5.6 cache contract');
  console.log(`PASS: Dock V5.6 cache URL ${NEXT} is authoritative across tracked public/content sources and compatibility gates.`);
}else{
  console.log(`Dock V5.6 cache migration updated ${changed.length} tracked file(s).`);
}
