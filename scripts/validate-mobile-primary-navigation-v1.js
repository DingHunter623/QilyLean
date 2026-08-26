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

must(header,'--qily-primary-nav-font-size:20px','Primary nav canonical font size');
must(header,'--qily-primary-nav-font-weight:900','Primary nav canonical weight');
must(header,'--qily-primary-nav-color:#182420','Primary nav canonical text color');
must(header,'--qily-primary-nav-active:#0f4b5a','Primary nav active color');
must(header,'font-size:var(--qily-primary-nav-font-size)!important','Header axis uses canonical primary nav size');
must(header,'flex:1 1 0!important','Desktop header-axis flex contract');
must(header,'@media (max-width:900px){','Mobile header breakpoint');
must(header,'flex-direction:column!important','Mobile header column layout');
must(header,'flex:0 0 auto!important','Mobile nav flex reset');
must(header,'min-height:46px!important','Mobile nav finger-height floor');
must(header,'width:100%!important','Mobile nav full width');
must(header,'overflow-x:auto!important','Mobile nav horizontal scrolling');
must(header,'touch-action:pan-x pan-y!important','Mobile nav touch panning');
must(header,'-webkit-overflow-scrolling:touch!important','iOS momentum scrolling');
must(header,'-webkit-mask-image:none!important','Mobile nav no clipping mask');
must(header,'html body header.qily-global-header::after{display:none!important}','Retired swipe-hint removal');

must(publicCss,'--qily-primary-nav-font-size:20px','Final cascade canonical primary nav size');
must(publicCss,'--qily-primary-nav-font-weight:900','Final cascade canonical primary nav weight');
must(publicCss,'--qily-primary-nav-color:#182420','Final cascade canonical primary nav color');
must(publicCss,'font-size:var(--qily-primary-nav-font-size)!important','Final cascade enforces canonical primary nav size');
must(publicCss,'font-weight:var(--qily-primary-nav-font-weight)!important','Final cascade enforces canonical primary nav weight');
must(publicCss,'color:var(--qily-primary-nav-color)!important','Final cascade enforces canonical primary nav color');
must(publicCss,'@media (max-width:900px){','Final mobile override breakpoint');
must(publicCss,'flex:0 0 auto!important','Final mobile nav flex reset');
must(publicCss,'min-height:46px!important','Final mobile nav height floor');
must(publicCss,'touch-action:pan-x pan-y!important','Final mobile touch panning');
must(publicCss,'mask-image:none!important','Final mobile clipping-mask removal');
must(publicCss,'::before{display:none!important}','Mobile spacer removal');
must(publicCss,'html body header.qily-global-header::after{display:none!important}','Mobile swipe-hint removal');
mustNot(publicCss,'font-size:17.5px!important','Final primary navigation must never shrink to legacy 17.5px');

must(shell,"BUILD_ID='20260827-primary-navigation-unified-v4'",'Shared shell unified primary-nav build');
must(shell,"publicCss:'/site-translation-public-ui-v1.css?v=20260827-primary-navigation-unified-v8'",'Shared shell unified public CSS');
must(shell,"headerCss:'/site-header-axis-v1.css?v=20260827-primary-navigation-unified-v4'",'Shared shell unified header CSS');
must(navigation,"var HEADER_AXIS_HREF = '/site-header-axis-v1.css?v=20260827-primary-navigation-unified-v4'",'Navigation runtime unified header owner');
must(navigation,"var CONSISTENCY_SRC = '/site-ui-consistency-v1.js?v=20260827-primary-navigation-unified-v45'",'Navigation runtime unified shell owner');
must(navigation,'primaryNavigationUnifiedVisualContract: true','Navigation build contract declares visual parity');
must(navigation,'mobilePrimaryNavigationMayShrinkTypography: false','Navigation build forbids mobile type shrinking');

must(materializer,"const BASELINE_VERSION='20260827-primary-navigation-unified-v14'",'Primary navigation baseline owner');
must(materializer,"const NAVIGATION = '/site-navigation.js?v=20260827-primary-navigation-unified-v45'",'Navigation cache owner');
must(materializer,"const CONSISTENCY = '/site-ui-consistency-v1.js?v=20260827-primary-navigation-unified-v45'",'Shared-shell cache owner');
must(materializer,"const HEADER_AXIS='/site-header-axis-v1.css?v=20260827-primary-navigation-unified-v4'",'Header-axis unified cache owner');
must(materializer,"const PUBLIC_UI_CSS='/site-translation-public-ui-v1.css?v=20260827-primary-navigation-unified-v8'",'Final public CSS unified cache owner');

process.stdout.write('PASS: primary navigation keeps one 20px/900/global-color visual contract across desktop, mobile and every module; mobile only scrolls/reflows and never shrinks typography.\n');
