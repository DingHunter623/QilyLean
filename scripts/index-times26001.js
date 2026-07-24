#!/usr/bin/env node
'use strict';

// One-time publication index update for the Times26001 app landing page.
const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');

const sitemapPath=path.join(root,'sitemap.xml');
let sitemap=fs.readFileSync(sitemapPath,'utf8');
const entry='  <url><loc>https://qilylean.com/tools/times26001/</loc><lastmod>2026-07-24</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>';
if(!sitemap.includes('https://qilylean.com/tools/times26001/')){
  const anchor='  <url><loc>https://qilylean.com/capabilities/</loc>';
  const index=sitemap.indexOf(anchor);
  if(index<0)throw new Error('Cannot locate sitemap insertion point');
  sitemap=sitemap.slice(0,index)+entry+'\n'+sitemap.slice(index);
}
sitemap=sitemap.replace('<url><loc>https://qilylean.com/</loc><lastmod>2026-07-23</lastmod>','<url><loc>https://qilylean.com/</loc><lastmod>2026-07-24</lastmod>');
fs.writeFileSync(sitemapPath,sitemap);

const searchPath=path.join(root,'site-search.js');
let search=fs.readFileSync(searchPath,'utf8');
if(!search.includes("'/tools/times26001/'")){
  const anchor="    '/capabilities/',";
  if(!search.includes(anchor))throw new Error('Cannot locate search fallback insertion point');
  search=search.replace(anchor,anchor+"\n    '/tools/times26001/',");
}
search=search.replace(/site-search-v2/g,'site-search-v3');
fs.writeFileSync(searchPath,search);

if(!sitemap.includes('https://qilylean.com/tools/times26001/'))throw new Error('Sitemap entry missing');
if(!search.includes("'/tools/times26001/'"))throw new Error('Search fallback entry missing');
console.log('Times26001 indexed in sitemap and site search.');
