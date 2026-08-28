#!/usr/bin/env node
'use strict';
const fs=require('fs'),path=require('path'),root=path.resolve(__dirname,'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const must=(s,t,m)=>{if(!s.includes(t))throw new Error(`${m}: missing ${t}`)};
const forbid=(s,t,m)=>{if(s.includes(t))throw new Error(`${m}: forbidden ${t}`)};
const nav=read('site-navigation.js'),dock=read('site-dock-share-runtime-v1.js'),route=read('site-contact-route-v1.js'),header=read('site-header-axis-v1.css'),css=read('site-interaction-semantics-v1.css'),home=read('index.html'),mat=read('scripts/materialize-global-language-v3.js');
must(nav,'navigation runtime v45','Navigation V45');must(nav,'r7DockSingleAuthority:true','Navigation Dock split');
must(dock,'Floating Dock Authoritative Runtime V5.2','Dock V5.2');must(dock,'setOwnedLabel','Dock label owner');must(dock,'--qily-dock-size:56px','Mobile Dock size');
must(route,'Contact Route V13.2','Contact V13.2');must(route,'__qilyFloatingDockUnifiedV52','Contact V52 guard');
must(header,'Global Header Axis V1.1','Header Axis V1.1');must(header,'overflow-x:scroll!important','Mobile nav scroll');must(header,'scrollbar-width:thin!important','Visible nav scrollbar');
must(css,'Interaction Semantics V1.2','Semantics V1.2');forbid(css,'content:"回\\A顶部"','Duplicate top label');forbid(css,'content:"回\\A上一层"','Duplicate back label');
must(mat,"const BASELINE_VERSION='20260829-r9-visual-remediation-v22'",'R9 V22 baseline');must(mat,"const CONTACT_ROUTE_JS='/site-contact-route-v1.js?v=20260829-dock-functional-public-v132'",'Contact V132 owner');must(mat,"const DOCK_SHARE='/site-dock-share-runtime-v1.js?v=20260829-authority-v52'",'Dock V52 owner');
const ready=t=>home.includes(t)||mat.includes(t);
for(const [token,label] of [['/site-navigation.js?v=20260828-r7-navigation-v45','Navigation'],['/site-dock-share-runtime-v1.js?v=20260829-authority-v52','Dock'],['/site-contact-route-v1.js?v=20260829-dock-functional-public-v132','Contact'],['/site-header-axis-v1.css?v=20260829-primary-navigation-scroll-v5','Header'],['/site-interaction-semantics-v1.css?v=20260829-r9-semantics-v12','Semantics CSS'],['/site-interaction-semantics-v1.js?v=20260829-r9-semantics-v12','Semantics JS']])if(!ready(token))throw new Error(`${label} R9 resource neither materialized nor queued`);
must(home,'<!-- QILY-AIRCRAFT-BRAND-HERO-V1:START -->','Aircraft hero');must(home,'font-size:clamp(40px,3.6vw,52px)!important','Homepage headline tier');
console.log('PASS: R9 V22 homepage guard protects aircraft hero, uniform Dock V5.2/Contact V13.2, visible nav scrolling and semantics V1.2.');
