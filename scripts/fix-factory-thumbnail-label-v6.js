#!/usr/bin/env node
'use strict';
const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
const file=path.join(root,'projects','factory-layout','index.html');
const START='<!-- QILY-FACTORY-THUMB-CONTRAST-V6:START -->';
const END='<!-- QILY-FACTORY-THUMB-CONTRAST-V6:END -->';
let html=fs.readFileSync(file,'utf8');
html=html.replace(new RegExp(`${START}[\\s\\S]*?${END}\\s*`,'g'),'');
const style=`${START}\n<style id="qilyFactoryThumbContrastV6">\n/* 2026-08-13｜factory thumbnail visual hard stop: no dark-teal label background */\nhtml body.factory-layout-page .factory-plan-thumb-grid{background:#fff!important;}\nhtml body.factory-layout-page .factory-plan-thumb-grid .factory-plan-preview,\nhtml body.factory-layout-page .factory-plan-thumb-grid .factory-plan-preview:hover,\nhtml body.factory-layout-page .factory-plan-thumb-grid .factory-plan-preview:focus-visible,\nhtml body.factory-layout-page .factory-plan-thumb-grid .factory-plan-preview:active{\n  background:#fff!important;background-image:none!important;color:#073c47!important;-webkit-text-fill-color:#073c47!important;\n  border:0!important;box-shadow:none!important;text-shadow:none!important;filter:none!important;opacity:1!important;\n}\nhtml body.factory-layout-page .factory-plan-thumb-grid .factory-plan-preview::before,\nhtml body.factory-layout-page .factory-plan-thumb-grid .factory-plan-preview::after{content:none!important;display:none!important;background:none!important;}\nhtml body.factory-layout-page .factory-plan-thumb-grid .factory-plan-preview img{\n  display:block!important;width:var(--project-thumb-size)!important;height:var(--project-thumb-size)!important;\n  background:#fff!important;border:1px solid #c8dcda!important;box-shadow:none!important;\n}\nhtml body.factory-layout-page .factory-plan-thumb-grid .factory-plan-preview>span{\n  position:static!important;display:flex!important;align-items:center!important;justify-content:center!important;\n  width:var(--project-thumb-size)!important;max-width:var(--project-thumb-size)!important;min-height:30px!important;\n  margin:5px 0 0!important;padding:5px 4px!important;box-sizing:border-box!important;\n  color:#073c47!important;-webkit-text-fill-color:#073c47!important;background:#f7fbfa!important;background-image:none!important;\n  border:1px solid #9fc8c4!important;border-top:2px solid #c99a3e!important;border-radius:5px!important;\n  box-shadow:none!important;text-shadow:none!important;font-size:12px!important;font-weight:950!important;line-height:1.18!important;\n  opacity:1!important;visibility:visible!important;white-space:normal!important;overflow-wrap:anywhere!important;\n}\nhtml body.factory-layout-page .factory-plan-thumb-grid .factory-plan-preview:is(:hover,:focus-visible,:active)>span{\n  color:#073c47!important;-webkit-text-fill-color:#073c47!important;background:#fff9e9!important;border-color:#c99a3e!important;\n}\n</style>\n${END}`;
if(!html.includes('</head>')) throw new Error('head close not found');
html=html.replace('</head>',style+'\n</head>');
fs.writeFileSync(file,html,'utf8');
const out=fs.readFileSync(file,'utf8');
for(const token of ['qilyFactoryThumbContrastV6','background:#f7fbfa!important','border-top:2px solid #c99a3e!important','color:#073c47!important']){
 if(!out.includes(token)) throw new Error('V6 guard missing '+token);
}
console.log('Factory thumbnail V6 hard-stop visual rule injected.');
