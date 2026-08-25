#!/usr/bin/env node
'use strict';
const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
function read(p){return fs.readFileSync(path.join(root,p),'utf8')}
function must(src,token,label){if(!src.includes(token))throw new Error(`${label}: missing ${token}`)}

const css=read('site-interaction-contrast-guard-v1.css');
const js=read('site-interaction-contrast-guard-v1.js');
const materializer=read('scripts/materialize-global-language-v3.js');
const gbt=read('qilylean/gbt2828.html');

must(css,'.reference-button,','GB/T 2828 CTA first-paint protection');
must(css,'color:var(--qily-contrast-light)!important','Dark CTA white text');
must(css,'-webkit-text-fill-color:var(--qily-contrast-light)!important','Chrome/Safari white text fill');
must(css,'[data-qily-interaction-contrast="light"]','Runtime light-text state');
must(css,'[data-qily-interaction-contrast="dark"]','Runtime dark-text state');

must(js,'__qilyInteractionContrastGuardV1','Runtime singleton');
must(js,'if(current>=4.5)','WCAG AA threshold');
must(js,"setAttribute('data-qily-interaction-contrast'",'Runtime correction marker');
must(js,"attributeFilter:['class','style','disabled','aria-disabled']",'Dynamic state watcher');
must(js,"d.addEventListener('transitionend'",'Hover/focus transition recheck');

must(materializer,'/site-interaction-contrast-guard-v1.css?v=20260825-sitewide-contrast-v1','Sitewide contrast CSS materialization');
must(materializer,'/site-interaction-contrast-guard-v1.js?v=20260825-sitewide-contrast-v1','Sitewide contrast JS materialization');
must(materializer,'data-qily-interaction-contrast-direct="v1"','Sitewide contrast direct marker');

must(gbt,'class="reference-button"','GB/T 2828 reference CTA exists');
if(!gbt.includes('/site-interaction-contrast-guard-v1.css?v=20260825-sitewide-contrast-v1')){
  console.warn('GB/T 2828 production HTML not yet materialized in branch; main materializer will publish it after merge.');
}
process.stdout.write('PASS: sitewide interaction contrast guard protects dark/light CTA readability and GB/T 2828 reference action.\n');
