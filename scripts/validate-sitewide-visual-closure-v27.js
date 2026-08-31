#!/usr/bin/env node
'use strict';

const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const must=(source,token,label)=>{if(!source.includes(token))throw new Error(`${label}: missing ${token}`)};
const forbid=(source,token,label)=>{if(source.includes(token))throw new Error(`${label}: forbidden ${token}`)};

const visual=read('site-visual-system-v2.css');
for(const token of ['V27 public visual closure','.qily-system-axis__step:not(:last-child)::after','right:-16px!important','z-index:8!important','.hero + .authority-strip','calc(100% - var(--qv2-gutter) - var(--qv2-gutter))','#boundary .boundary-split li{font-size:17.5px!important','section#contact .trust-contact>a[href]:is(:hover,:focus-visible,:active)','#evidence-levels .trust-level>span{min-height:calc(1.65em * 4)!important','.qily-web-translate__select','background-clip:padding-box!important'])must(visual,token,'V27 visual authority');
const capabilities=read('capabilities/index.html');for(const token of ['PDCA项目机制','P｜计划 Plan','D｜执行 Do','C｜检查 Check','A｜处置 Act','class="module-grid four"'])must(capabilities,token,'Capability PDCA');
const semantics=read('site-interaction-semantics-v1.css');for(const token of ['[data-qily-interaction="static"]','cursor:default!important','transform:none!important'])must(semantics,token,'Static interaction semantics');
const ddz=read('tools/pure-ddz/index.html');for(const token of ['20260829-ddz-mobile-ready-v132','20260829-r12-v132'])must(ddz,token,'DDZ V132');forbid(ddz,'name="screen-orientation"','DDZ forced orientation');forbid(ddz,'name="x5-orientation"','DDZ forced X5 orientation');
const ddzMaterializer=read('scripts/materialize-ddz-public-ui-20260824.js');must(ddzMaterializer,'20260829-ddz-mobile-ready-v132','DDZ materializer');must(ddzMaterializer,'forced-orientation metadata must stay removed','DDZ materializer');
const materializer=read('scripts/materialize-global-language-v3.js');must(materializer,"BASELINE_VERSION='20260831-native-picker-grade-readability-v29'",'V29 sitewide baseline');must(materializer,"VISUAL_SYSTEM_V2='/site-visual-system-v2.css?v=20260830-visual-system-v2-r7'",'V29 visual cache');must(materializer,"FINAL_INTEGRITY_CSS='/site-header-project-integrity-v2.css?v=20260831-project-grade-readability-v3'",'Project grade integrity cache');
console.log('PASS: V27 compatibility checks remain satisfied on the V29 sitewide baseline, including arrows, PDCA semantics, governed axes, readable boundary cards, static-token feedback, contact underlines, evidence alignment, translation borders and portrait-ready DDZ automation.');