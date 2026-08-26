#!/usr/bin/env node
'use strict';

const fs=require('fs');
const path=require('path');
const {execFileSync}=require('child_process');
const root=path.resolve(__dirname,'..');
const materialized=process.argv.includes('--materialized');
function read(file){return fs.readFileSync(path.join(root,file),'utf8')}
function must(source,token,label){if(!source.includes(token))throw new Error(`${label}: missing ${token}`)}

const css=read('site-unified-visual-governance-v1.css');
const materializer=read('scripts/materialize-global-language-v3.js');

for(const token of ['--qily-ui-forest:#0f4b5a','--qily-ui-teal:#178b94','--qily-ui-gold:#caa15f','--qily-ui-ink:#17322d','--qily-ui-page:#eef7f5','--qily-ui-surface:#fff','--qily-ui-alt:#f4faf8','--qily-ui-nav-size:20px','--qily-ui-action-height:48px']){
  must(css,token,'Unified visual token contract');
}
must(css,'>a[href][aria-current="page"]','Primary current-item visual contract');
must(css,'font-size:20px!important','Readable mobile type floor');
must(css,'@media(max-width:900px)','Mobile visual breakpoint');
must(css,'>a[href]:active','Mobile navigation pressed selector');
must(css,'transform:none!important','Mobile navigation must not shrink on press/current');
must(css,'min-height:var(--qily-ui-action-height)!important','Action geometry contract');
must(css,'background:var(--qily-ui-forest)!important','Primary action background contract');
must(css,'background:var(--qily-ui-surface)!important','Secondary/light surface contract');
must(css,'border-radius:var(--qily-ui-radius)!important','Card/action radius contract');
must(css,'font-size:max(19.5px,1em)!important','Body readability floor');

must(materializer,"const UNIFIED_VISUAL_CSS = '/site-unified-visual-governance-v1.css?v=20260826-unified-visual-closure-v1'",'Unified visual cache owner');
must(materializer,'qilyUnifiedVisualGovernanceV1Stylesheet','Unified visual stylesheet materialization');
must(materializer,'site-unified-visual-governance-v1\\.css','Unified visual de-duplication');

if(materialized){
  const html=execFileSync('git',['ls-files','*.html'],{cwd:root,encoding:'utf8',maxBuffer:64*1024*1024}).split(/\r?\n/).filter(Boolean);
  const missing=[];
  const duplicates=[];
  for(const file of html){
    const source=read(file);
    if(!/<\/head>/i.test(source))continue;
    const hits=(source.match(/id=["']qilyUnifiedVisualGovernanceV1Stylesheet["']/g)||[]).length;
    if(hits===0)missing.push(file);
    if(hits>1)duplicates.push(file);
  }
  if(missing.length)throw new Error(`Unified visual stylesheet missing from ${missing.length} HTML file(s): ${missing.slice(0,20).join(', ')}`);
  if(duplicates.length)throw new Error(`Unified visual stylesheet duplicated in ${duplicates.length} HTML file(s): ${duplicates.slice(0,20).join(', ')}`);
}

process.stdout.write(`PASS: unified visual governance keeps navigation typography, action geometry, colour roles, surfaces and readable floors consistent${materialized?' across every tracked HTML page':''}.\n`);
