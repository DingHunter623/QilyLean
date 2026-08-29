#!/usr/bin/env node
'use strict';
const fs=require('fs'),path=require('path'),root=path.resolve(__dirname,'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8'),must=(s,t,m)=>{if(!s.includes(t))throw new Error(`${m}: missing ${t}`)},forbid=(s,t,m)=>{if(s.includes(t))throw new Error(`${m}: forbidden ${t}`)};
const nav=read('site-navigation.js'),dock=read('site-dock-share-runtime-v1.js'),route=read('site-contact-route-v1.js'),header=read('site-header-axis-v1.css'),css=read('site-interaction-semantics-v1.css'),js=read('site-interaction-semantics-v1.js'),home=read('index.html'),mat=read('scripts/materialize-global-language-v3.js');
must(nav,'navigation runtime v45','Navigation V45');must(nav,'r7DockSingleAuthority:true','Navigation Dock split');
must(dock,'Floating Dock Authoritative Runtime V5.4','Dock V5.4');must(dock,'setOwnedLabel','Dock label owner');must(dock,"w.open(url,'_blank','noopener,noreferrer')",'Contact new tab');forbid(dock,"mask.classList.add('show')",'Dock modal');
must(route,'Contact Route V13.4','Contact V13.4');must(route,'__qilyFloatingDockUnifiedV54','Contact V54 guard');
must(header,'Global Header Axis V1.2','Header Axis V1.1');must(header,'overflow-x:scroll!important','Mobile nav scroll');must(header,'white-space:nowrap!important','Complete nav labels');
must(css,'Interaction Semantics V1.4','Semantics V1.4');must(css,'.qily-primary-nav-scroll-rail','Persistent rail');must(css,'.brief-action-strip>span','Static vocabulary');forbid(css,'content:"回\\A顶部"','Duplicate top label');forbid(css,'content:"回\\A上一层"','Duplicate back label');must(js,'__qilyInteractionSemanticsV14','Semantics runtime');
must(mat,"const BASELINE_VERSION='20260829-sitewide-visual-closure-v27'",'V27 baseline');must(mat,"const CONTACT_ROUTE_JS='/site-contact-route-v1.js?v=20260829-dock-functional-public-v134'",'Contact V134 owner');must(mat,"const DOCK_SHARE='/site-dock-share-runtime-v1.js?v=20260829-authority-v54'",'Dock V54 owner');
const ready=t=>home.includes(t)||mat.includes(t);
for(const [token,label] of [['/site-navigation.js?v=20260828-r7-navigation-v45','Navigation'],['/site-dock-share-runtime-v1.js?v=20260829-authority-v54','Dock'],['/site-contact-route-v1.js?v=20260829-dock-functional-public-v134','Contact'],['/site-header-axis-v1.css?v=20260829-primary-navigation-safe-scroll-v7','Header'],['/site-interaction-semantics-v1.css?v=20260829-r11-semantics-v14','Semantics CSS'],['/site-interaction-semantics-v1.js?v=20260829-r11-semantics-v14','Semantics JS']])if(!ready(token))throw new Error(`${label} R11 resource neither materialized nor queued`);
must(home,'<!-- QILY-AIRCRAFT-BRAND-HERO-V1:START -->','Aircraft hero');must(home,'font-size:clamp(40px,3.6vw,52px)!important','Homepage headline tier');
console.log('PASS: V26 homepage guard protects aircraft hero, persistent nav rail, Dock V5.4 full-contact route and semantics V1.4.');
