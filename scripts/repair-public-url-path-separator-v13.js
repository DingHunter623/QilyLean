#!/usr/bin/env node
'use strict';

const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
const exts=new Set(['.html','.htm','.js','.mjs','.cjs','.json','.md','.txt','.py','.java','.kt','.xml','.svg','.css','.yaml','.yml']);
const skip=new Set(['.git','.github','node_modules','.gradle','build','dist']);
const self='scripts/repair-public-url-path-separator-v13.js';
const changed=[];
let replacements=0;

function walk(dir,out=[]){
  for(const e of fs.readdirSync(dir,{withFileTypes:true})){
    if(skip.has(e.name))continue;
    const p=path.join(dir,e.name);
    if(e.isDirectory())walk(p,out);
    else if(e.isFile()&&exts.has(path.extname(e.name).toLowerCase()))out.push(p);
  }
  return out;
}
function rel(p){return path.relative(root,p).replace(/\\/g,'/');}

// Repair only a missing separator immediately after the exact hostname.
// Root URL remains https://qilylean.com; real subpaths become https://qilylean.com/path.
const broken=/https:\/\/qilylean\.com(?=(?:[A-Za-z0-9_-]+\/|[A-Za-z0-9_-]+[.#?]|Times26001-|QilyLean_Home_))/g;
for(const p of walk(root)){
  const r=rel(p); if(r===self)continue;
  let s;try{s=fs.readFileSync(p,'utf8');}catch{continue;}
  const before=s;
  s=s.replace(broken,()=>{replacements++;return 'https://qilylean.com/';});
  if(s!==before){fs.writeFileSync(p,s,'utf8');changed.push(r);}
}

const explicit=[
  ['https://qilylean.comcapabilities/','https://qilylean.com/capabilities/'],
  ['https://qilylean.comapp-support/','https://qilylean.com/app-support/'],
  ['https://qilylean.comlegal/','https://qilylean.com/legal/'],
  ['https://qilylean.comtools/','https://qilylean.com/tools/'],
  ['https://qilylean.comassets/','https://qilylean.com/assets/'],
  ['https://qilylean.comshare/','https://qilylean.com/share/'],
  ['https://qilylean.comprojects/','https://qilylean.com/projects/'],
  ['https://qilylean.comknowledge/','https://qilylean.com/knowledge/'],
  ['https://qilylean.comQilyLean_Home_','https://qilylean.com/QilyLean_Home_'],
  ['https://qilylean.comTimes26001-','https://qilylean.com/Times26001-']
];
for(const p of walk(root)){
  const r=rel(p);if(r===self)continue;
  let s;try{s=fs.readFileSync(p,'utf8');}catch{continue;}
  const before=s;
  for(const [a,b] of explicit){if(s.includes(a)){const n=s.split(a).length-1;replacements+=n;s=s.split(a).join(b);}}
  if(s!==before){fs.writeFileSync(p,s,'utf8');if(!changed.includes(r))changed.push(r);}
}

// Hard QA: concrete URLs need a slash before a subpath. Runtime template variables are evaluated later
// and are intentionally not rewritten here because their route values already carry the separator.
const bad=[];
const suspicious=/https:\/\/qilylean\.com([^\s"'`<>]*)/g;
for(const p of walk(root)){
  const r=rel(p);if(r===self||r.startsWith('maintenance/'))continue;
  let s;try{s=fs.readFileSync(p,'utf8');}catch{continue;}
  let m;
  while((m=suspicious.exec(s))){
    const tail=m[1]||'';
    if(tail.startsWith('${'))continue;
    if(tail && !tail.startsWith('/') && !tail.startsWith('?') && !tail.startsWith('#')){
      bad.push(`${r}: ${m[0].slice(0,120)}`);break;
    }
  }
}
if(bad.length)throw new Error('Broken QilyLean URL path separators remain:\n'+bad.slice(0,40).join('\n'));

fs.mkdirSync(path.join(root,'maintenance'),{recursive:true});
fs.writeFileSync(path.join(root,'maintenance','public-url-path-integrity-v13.json'),JSON.stringify({
  version:'2026-08-14-v13.1',
  root_url:'https://qilylean.com',
  rule:'root has no trailing slash; concrete subpaths always keep the hostname/path separator slash; runtime template routes stay dynamic',
  changed_files:[...new Set(changed)].sort(),
  changed_file_count:new Set(changed).size,
  repaired_occurrences:replacements
},null,2)+'\n','utf8');
console.log(`PASS URL path integrity V13.1: ${new Set(changed).size} files; ${replacements} repairs.`);
