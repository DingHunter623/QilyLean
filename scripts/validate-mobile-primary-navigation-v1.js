#!/usr/bin/env node
'use strict';
const fs=require('fs'),path=require('path'),root=path.resolve(__dirname,'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const must=(s,t,m)=>{if(!s.includes(t))throw new Error(`${m}: missing ${t}`)};
const forbid=(s,t,m)=>{if(s.includes(t))throw new Error(`${m}: forbidden ${t}`)};
const header=read('site-header-axis-v1.css'),publicCss=read('site-translation-public-ui-v1.css'),mat=read('scripts/materialize-global-language-v3.js'),nav=read('site-navigation.js');
must(header,'Global Header Axis V1.1','R9 header-axis');must(header,'--qily-primary-nav-font-size:20px','Nav 20px');must(header,'--qily-primary-nav-font-weight:900','Nav 900');must(header,'--qily-nav-scroll-thumb:#0f4b5a','Scrollbar VI');must(header,'overflow-x:auto!important','Desktop scroll');must(header,'overflow-x:scroll!important','Mobile explicit scroll');must(header,'scrollbar-width:thin!important','Visible scrollbar');must(header,'::-webkit-scrollbar','WebKit scrollbar');must(header,'touch-action:pan-x pan-y!important','Touch panning');must(header,'-webkit-overflow-scrolling:touch!important','iOS scrolling');must(header,'-webkit-mask-image:none!important','No mobile mask');
must(publicCss,'--qily-primary-nav-font-size:20px','Public nav 20px');must(publicCss,'--qily-primary-nav-font-weight:900','Public nav 900');forbid(publicCss,'font-size:17.5px!important','Legacy nav shrink');must(nav,'navigation runtime v45','Navigation V45');must(nav,'mobilePrimaryNavigationMayShrinkTypography:false','No mobile shrink');
must(mat,"const BASELINE_VERSION='20260829-r9-visual-remediation-v22'",'R9 V22 baseline');must(mat,"const HEADER_AXIS='/site-header-axis-v1.css?v=20260829-primary-navigation-scroll-v5'",'Header cache');must(mat,"const CONTACT_ROUTE_JS='/site-contact-route-v1.js?v=20260829-dock-functional-public-v132'",'Contact V132 cache');
console.log('PASS: R9 V22 primary navigation keeps 20px/900 parity and a visible horizontal scrollbar on desktop/mobile without clipping or typography shrink.');
