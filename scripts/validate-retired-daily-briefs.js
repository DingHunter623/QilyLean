#!/usr/bin/env node
'use strict';

const fs=require('fs');
const path=require('path');
const {execFileSync}=require('child_process');
const ROOT=path.resolve(__dirname,'..');
const manifest=JSON.parse(fs.readFileSync(path.join(ROOT,'data/retired-daily-briefs-v1.json'),'utf8'));
const routes=manifest.routes||{};
const entries=Object.entries(routes);
const errors=[];

function exists(rel){return fs.existsSync(path.join(ROOT,rel));}
function read(rel){return fs.readFileSync(path.join(ROOT,rel),'utf8');}

if(manifest.source?.total_before!==2591) errors.push('retirement manifest total_before must be 2591');
if(manifest.source?.total_kept_at_curation!==372) errors.push('retirement manifest total_kept_at_curation must be 372');
if(manifest.source?.total_retired!==2219||entries.length!==2219) errors.push('retirement manifest must contain exactly 2219 retired daily URLs');

const sitemapText=['sitemap.xml','sitemap-core.xml','sitemap-topics.xml'].filter(exists).map(read).join('\n');
for(const [source,target] of entries){
  const srcFile=source.replace(/^\//,'');
  const dstFile=target.replace(/^\//,'');
  if(exists(srcFile)) errors.push('retired source unexpectedly exists: '+srcFile);
  if(!exists(dstFile)) errors.push('retired source target is missing: '+source+' -> '+target);
  if(sitemapText.includes('<loc>https://qilylean.com'+source+'</loc>')) errors.push('retired URL leaked into sitemap: '+source);
}

const tracked=execFileSync('git',['ls-files','*.html'],{cwd:ROOT,encoding:'utf8',maxBuffer:64*1024*1024}).split(/\r?\n/).filter(Boolean);
const retiredSet=new Set(Object.keys(routes));
for(const file of tracked){
  const html=read(file);
  for(const m of html.matchAll(/href=["'](\/qilylean\/daily\/\d{4}-\d{2}-\d{2}\.html)(?:[?#][^"']*)?["']/g)){
    if(retiredSet.has(m[1])) errors.push('current page links to retired daily URL: '+file+' -> '+m[1]);
  }
}

const notFound=read('404.html');
if(!notFound.includes('name="robots" content="noindex,follow"')) errors.push('404 page must remain noindex,follow');
if(!notFound.includes('/data/retired-daily-briefs-v1.json')) errors.push('404 page must resolve retired daily URLs through the retirement manifest');
if(!notFound.includes('data-qily-retired-brief-404="v1"')) errors.push('retired brief 404 UI marker missing');

if(errors.length){
  console.error('Retired daily brief governance failed:');
  for(const e of errors.slice(0,200)) console.error('- '+e);
  if(errors.length>200) console.error('- ... '+(errors.length-200)+' additional errors');
  process.exit(1);
}
console.log('Retired daily brief governance PASS: '+entries.length+' retired URLs are absent from current content/sitemaps and map to existing weekly curated briefs.');
