#!/usr/bin/env node
'use strict';

/* QilyLean Dock V5.8 state-ownership closer R2 | 2026-09-06
 * Removes the last legacy hover/focus geometry that translated the first Dock
 * button outside its visible edge. The Dock runtime remains the functional owner;
 * this closer only neutralizes historical high-specificity presentation rules.
 */
const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
const apply=process.argv.includes('--apply');
const marker='/* QILY-DOCK-V58-STATE-OWNERSHIP-R2 */';
const targets=['site-interactive-hover-contrast-v1.css','site-closure-bundle-v24.css'];
const block=`${marker}
/* Dock state geometry is authoritative: never translate/scale an edge button out of frame. */
html:root:root body #floatDock.qily-float-dock
.qily-float-btn:not(#qily-float-state-priority):not(#qily-float-state-override):is(:hover:hover,:focus:focus,:focus-visible:focus-visible){
  outline:none!important;
  outline-offset:0!important;
  transform:none!important;
  box-shadow:inset 0 0 0 2px rgba(202,161,95,.55)!important;
}
html:root:root body #floatDock.qily-float-dock
.qily-float-btn:not(#qily-float-state-priority):not(#qily-float-state-override):is(:active:active,[data-qily-pressed="true"]){
  outline:none!important;
  outline-offset:0!important;
  transform:none!important;
  box-shadow:inset 0 0 0 1px rgba(202,161,95,.38)!important;
}
html:root:root body #floatDock.qily-float-dock
.qily-float-btn:not(#qily-float-state-priority):not(#qily-float-state-override):first-child{
  margin-left:0!important;
  border-left-width:1px!important;
  border-left-style:solid!important;
  transform:none!important;
}
html:root:root body #floatDock.qily-float-dock
.qily-float-btn:not(#qily-float-state-priority):not(#qily-float-state-override):last-child{
  margin-right:0!important;
  border-right-width:1px!important;
  border-right-style:solid!important;
  transform:none!important;
}
`;

function rewrite(source){
  const i=source.indexOf(marker);
  if(i>=0)source=source.slice(0,i).trimEnd()+'\n';
  return source.trimEnd()+'\n\n'+block;
}
let changed=0;
for(const rel of targets){
  const file=path.join(root,rel);
  if(!fs.existsSync(file))throw new Error(`missing Dock interaction source: ${rel}`);
  const before=fs.readFileSync(file,'utf8');
  const after=rewrite(before);
  if(after!==before){changed++;if(apply)fs.writeFileSync(file,after,'utf8');}
}
for(const rel of targets){
  const source=apply?fs.readFileSync(path.join(root,rel),'utf8'):rewrite(fs.readFileSync(path.join(root,rel),'utf8'));
  if(!source.includes(marker))throw new Error(`${rel}: ownership marker missing`);
  if(!source.includes('transform:none!important'))throw new Error(`${rel}: Dock transform neutralizer missing`);
  if(!source.includes('box-shadow:inset 0 0 0 2px rgba(202,161,95,.55)!important'))throw new Error(`${rel}: internal focus ring missing`);
  if(!source.includes('border-left-width:1px!important'))throw new Error(`${rel}: first-edge border lock missing`);
  if(!source.includes('border-right-width:1px!important'))throw new Error(`${rel}: last-edge border lock missing`);
}
console.log(`${apply?'APPLY':'CHECK'} PASS: Dock V5.8 state ownership R2; changed=${changed}.`);
