#!/usr/bin/env node
'use strict';
const fs=require('fs'),path=require('path'),{execFileSync}=require('child_process'),root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const must=(source,token,label)=>{if(!source.includes(token))throw new Error(`${label}: missing ${token}`)};
const forbid=(source,token,label)=>{if(source.includes(token))throw new Error(`${label}: forbidden ${token}`)};
const materialized=process.argv.includes('--materialized');
const css=read('site-responsive-containment-v1.css');
for(const token of ['QilyLean Responsive Containment V1','@media (max-width:1179px)','@media (max-width:767px)','overscroll-behavior-inline:contain','-webkit-overflow-scrolling:touch','html body main table','display:block!important','.flow-wrap','.diagram-wrap','.opl-table-wrap','.opl-flow-wrap','max-width:100%!important'])must(css,token,'Responsive containment');
for(const token of ['position:fixed','width:100vw','min-width:680px','min-width:980px'])forbid(css,token,'Responsive containment');
const components=read('site-visual-components-v1.css');
must(components,'qily-diagram-frame','Unified diagram frame');must(components,'table.qily-table','Unified Qily Table');must(components,'@media (max-width:767px)','Unified component mobile composition');
const materializer=read('scripts/materialize-global-language-v3.js');
must(materializer,"BASELINE_VERSION='20260831-safe-translation-nav-range-v30'",'V30 public baseline');must(materializer,"RESPONSIVE_CONTAINMENT_CSS='/site-responsive-containment-v1.css?v=20260830-header-integrity-v2'",'Responsive containment cache owner');must(materializer,"VISUAL_COMPONENTS_CSS='/site-visual-components-v1.css?v=20260831-unified-components-v29-native-range'",'Unified visual components cache owner');must(materializer,'qilyResponsiveContainmentV1','Responsive containment materialization');must(materializer,'qilyVisualComponentsV1','Unified visual components materialization');
if(materialized){
  const html=execFileSync('git',['ls-files','*.html'],{cwd:root,encoding:'utf8',maxBuffer:64*1024*1024}).split(/\r?\n/).filter(Boolean);const ownership=file=>/^(?:baidu_verify_|google[^/]*\.html$|zohoverify\/)/i.test(file),missing=[],duplicates=[],componentMissing=[],componentDuplicates=[];let audited=0;
  for(const file of html){const source=read(file);if(ownership(file)||!/<\/head>/i.test(source))continue;audited++;const count=(source.match(/site-responsive-containment-v1\.css/g)||[]).length;if(count===0)missing.push(file);if(count>1)duplicates.push(file);const ccount=(source.match(/site-visual-components-v1\.css/g)||[]).length;if(ccount===0)componentMissing.push(file);if(ccount>1)componentDuplicates.push(file);}
  if(audited<460)throw new Error(`Responsive containment public-page coverage unexpectedly low: ${audited}`);if(missing.length)throw new Error(`Responsive containment missing in ${missing.length} public HTML file(s)`);if(duplicates.length)throw new Error(`Responsive containment duplicated in ${duplicates.length} public HTML file(s)`);if(componentMissing.length)throw new Error(`Unified visual components missing in ${componentMissing.length} public HTML file(s)`);if(componentDuplicates.length)throw new Error(`Unified visual components duplicated in ${componentDuplicates.length} public HTML file(s)`);
}
process.stdout.write(`PASS: responsive containment and unified visual components keep tablet/mobile tables, flows and diagrams inside the page shell${materialized?' across every public HTML page':''}.\n`);
