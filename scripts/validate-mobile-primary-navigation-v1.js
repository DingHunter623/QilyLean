#!/usr/bin/env node
'use strict';

const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
function read(relative){return fs.readFileSync(path.join(root,relative),'utf8')}
function must(source,token,label){if(!source.includes(token))throw new Error(`${label}: missing ${token}`)}
function mustNot(source,token,label){if(source.includes(token))throw new Error(`${label}: forbidden ${token}`)}

const header=read('site-header-axis-v1.css');
const publicCss=read('site-translation-public-ui-v1.css');
const materializer=read('scripts/materialize-global-language-v3.js');
const shell=read('site-ui-consistency-v1.js');
const navigation=read('site-navigation.js');

must(header,'Global Header Axis V1.1','R9 header-axis version');
must(header,'--qily-primary-nav-font-size:20px','Primary nav canonical font size');
must(header,'--qily-primary-nav-font-weight:900','Primary nav canonical weight');
must(header,'--qily-primary-nav-color:#182420','Primary nav canonical text color');
must(header,'--qily-nav-scroll-thumb:#0f4b5a','VI scrollbar thumb');
must(header,'font-size:var(--qily-primary-nav-font-size)!important','Header axis uses canonical primary nav size');
must(header,'overflow-x:auto!important','Desktop horizontal navigation scrolling');
must(header,'scrollbar-width:thin!important','Desktop visible scrollbar');
must(header,'::-webkit-scrollbar','WebKit scrollbar styling');
must(header,'@media (max-width:900px){','Mobile header breakpoint');
must(header,'flex-direction:column!important','Mobile header column layout');
must(header,'overflow-x:scroll!important','Mobile explicit horizontal navigation scrolling');
must(header,'touch-action:pan-x pan-y!important','Mobile nav touch panning');
must(header,'-webkit-overflow-scrolling:touch!important','iOS momentum scrolling');
must(header,'-webkit-mask-image:none!important','Mobile nav no clipping mask');

must(publicCss,'--qily-primary-nav-font-size:20px','Final cascade canonical primary nav size');
must(publicCss,'--qily-primary-nav-font-weight:900','Final cascade canonical primary nav weight');
must(publicCss,'font-size:var(--qily-primary-nav-font-size)!important','Final cascade enforces canonical primary nav size');
mustNot(publicCss,'font-size:17.5px!important','Final primary navigation must never shrink to legacy 17.5px');

must(shell,'__qilyUiConsistencyV7','Shared shell V7');
must(shell,'__qilyUiSingleResponsibilityV7','Shared shell single responsibility');
must(navigation,'navigation runtime v45','Navigation V45');
must(navigation,'primaryNavigationUnifiedVisualContract:true','Navigation build contract declares visual parity');
must(navigation,'mobilePrimaryNavigationMayShrinkTypography:false','Navigation build forbids mobile type shrinking');

must(materializer,"const BASELINE_VERSION='20260829-r9-visual-remediation-v21'",'R9 public baseline owner');
must(materializer,"const NAVIGATION='/site-navigation.js?v=20260828-r7-navigation-v45'",'Navigation cache owner');
must(materializer,"const CONSISTENCY='/site-ui-consistency-v1.js?v=20260828-r7-single-responsibility-v7'",'Shared-shell cache owner');
must(materializer,"const HEADER_AXIS='/site-header-axis-v1.css?v=20260829-primary-navigation-scroll-v5'",'Header-axis scrollbar cache owner');
must(materializer,"const PUBLIC_UI_CSS='/site-translation-public-ui-v1.css?v=20260827-primary-navigation-unified-v8'",'Final public CSS cache owner');

process.stdout.write('PASS: R9 primary navigation keeps 20px/900 visual parity while desktop/mobile use a visible VI-consistent horizontal scrollbar instead of clipping or shrinking.\n');
