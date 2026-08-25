#!/usr/bin/env node
'use strict';

const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
function read(relative){return fs.readFileSync(path.join(root,relative),'utf8')}
function must(source,token,label){if(!source.includes(token))throw new Error(`${label}: missing ${token}`)}

const header=read('site-header-axis-v1.css');
const publicCss=read('site-translation-public-ui-v1.css');
const materializer=read('scripts/materialize-global-language-v3.js');
const shell=read('site-ui-consistency-v1.js');

/* Root cause guard: desktop flex:1 1 0 is valid only while header main axis is horizontal.
 * The phone header is a column, so navigation must explicitly reset flex-basis and own real height.
 */
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

/* Final-cascade guard: translation/public UI is loaded after header-axis and must not re-collapse it. */
must(publicCss,'@media (max-width:900px){','Final mobile override breakpoint');
must(publicCss,'flex:0 0 auto!important','Final mobile nav flex reset');
must(publicCss,'min-height:46px!important','Final mobile nav height floor');
must(publicCss,'touch-action:pan-x pan-y!important','Final mobile touch panning');
must(publicCss,'mask-image:none!important','Final mobile clipping-mask removal');
must(publicCss,'::before{display:none!important}','Mobile spacer removal');
must(publicCss,'html body header.qily-global-header::after{display:none!important}','Mobile swipe-hint removal');

/* Cache/materialization ownership: phones must receive the new CSS rather than stale v2/v6 assets. */
must(materializer,"const BASELINE_VERSION = '20260825-mobile-navigation-recovery-v1'",'Mobile recovery baseline owner');
must(materializer,"const HEADER_AXIS = '/site-header-axis-v1.css?v=20260825-mobile-navigation-recovery-v3'",'Header-axis mobile cache owner');
must(materializer,"const PUBLIC_UI_CSS = '/site-translation-public-ui-v1.css?v=20260825-mobile-navigation-recovery-v7'",'Final public CSS cache owner');
must(shell,"BUILD_ID='20260825-mobile-navigation-recovery-v1'",'Shared shell mobile recovery build');
must(shell,"publicCss:'/site-translation-public-ui-v1.css?v=20260825-mobile-navigation-recovery-v7'",'Shared shell public CSS recovery');
must(shell,"headerCss:'/site-header-axis-v1.css?v=20260825-mobile-navigation-recovery-v3'",'Shared shell header CSS recovery');

process.stdout.write('PASS: mobile primary navigation keeps real height, full-width touch scrolling, and no clipping hint/mask across the final cascade.\n');
