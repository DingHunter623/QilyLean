#!/usr/bin/env node
'use strict';

/* QilyLean terminology search authority materializer V1｜2026-08-26
 * Search engines index pages and entities, not a raw keyword list.
 * This materializer turns the existing visible 193-term glossary into stable, crawlable DefinedTerm entities,
 * anchor-addressable terminology records, internal search entries and current sitemap metadata.
 * No hidden text, no doorway pages, no keyword stuffing.
 */
const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
const checkOnly=process.argv.includes('--check');
const DATE='2026-08-26';
const ORIGIN='https://qilylean.com';
const PAGE='/knowledge/terminology.html';
const SET_ID=`${ORIGIN}${PAGE}#defined-term-set`;

function file(relative){return path.join(root,relative)}
function read(relative){return fs.readFileSync(file(relative),'utf8')}
function write(relative,value){fs.writeFileSync(file(relative),value.endsWith('\n')?value:`${value}\n`,'utf8')}
function decode(value){return value.replace(/&nbsp;/gi,' ').replace(/&amp;/gi,'&').replace(/&lt;/gi,'<').replace(/&gt;/gi,'>').replace(/&quot;/gi,'"').replace(/&#39;/gi,"'").replace(/&#x([0-9a-f]+);/gi,(_,hex)=>String.fromCodePoint(parseInt(hex,16))).replace(/&#(\d+);/g,(_,num)=>String.fromCodePoint(parseInt(num,10)))}
function text(value){return decode(value.replace(/<script\b[\s\S]*?<\/script>/gi,' ').replace(/<style\b[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim())}
function first(inner,className){const re=new RegExp(`<[^>]+class=["'][^"']*\\b${className}\\b[^"']*["'][^>]*>([\\s\\S]*?)<\\/[^>]+>`,'i');const match=inner.match(re);return match?text(match[1]):''}
function paragraphs(inner){return [...inner.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)].map(match=>text(match[1])).filter(Boolean)}
function baseSlug(value,index){const slug=value.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');return slug||`term-${index+1}`}

function materializeTerminology(source){
  const terms=[];
  const seen=new Map();
  const cardRe=/<article\b([^>]*class=["'][^"']*\bterm-card\b[^"']*["'][^>]*)>([\s\S]*?)<\/article>/gi;
  let index=0;
  let next=source.replace(cardRe,(whole,attrs,inner)=>{
    const code=first(inner,'term-code');
    const en=first(inner,'term-en');
    const h3=(inner.match(/<h3\b[^>]*>([\s\S]*?)<\/h3>/i)||[])[1];
    const name=h3?text(h3):code;
    if(!code&&!name)return whole;
    const parts=paragraphs(inner).filter(value=>!/^单点培训课件/.test(value));
    const description=(parts.join(' ').slice(0,420)||`${code} ${name} 制造管理与工业工程术语。`).trim();
    let slug=baseSlug(code||name,index);
    const count=(seen.get(slug)||0)+1;seen.set(slug,count);if(count>1)slug=`${slug}-${count}`;
    const id=`term-${slug}`;
    terms.push({code,name,en,description,id});
    let cleanAttrs=attrs.replace(/\s+id=["'][^"']*["']/i,'');
    cleanAttrs=cleanAttrs.replace(/\s+data-term-slug=["'][^"']*["']/i,'');
    index++;
    return `<article${cleanAttrs} id="${id}" data-term-slug="${slug}">${inner}</article>`;
  });

  if(terms.length<190)throw new Error(`Terminology extraction regression: expected at least 190 visible term cards, found ${terms.length}.`);
  const graph={
    '@context':'https://schema.org',
    '@type':'DefinedTermSet',
    '@id':SET_ID,
    name:'QilyLean制造管理与工业工程专业术语词典',
    description:`QilyLean公开制造管理、工业工程、精益生产、质量、设备、NPI、数字化与运营术语词典，共${terms.length}项可见术语及应用场景。`,
    url:`${ORIGIN}${PAGE}`,
    hasDefinedTerm:terms.map(term=>({
      '@type':'DefinedTerm',
      '@id':`${ORIGIN}${PAGE}#${term.id}`,
      name:term.name||term.code,
      termCode:term.code||undefined,
      alternateName:term.en||undefined,
      description:term.description,
      url:`${ORIGIN}${PAGE}#${term.id}`,
      inDefinedTermSet:{'@id':SET_ID}
    }))
  };
  const json=`<script id="qilyTerminologyDefinedTermSetV1" type="application/ld+json">${JSON.stringify(graph).replace(/</g,'\\u003c')}</script>`;
  next=next.replace(/\s*<script\b[^>]*id=["']qilyTerminologyDefinedTermSetV1["'][^>]*>[\s\S]*?<\/script>\s*/gi,'\n');
  if(!/<\/head>/i.test(next))throw new Error('Terminology page is missing </head>.');
  next=next.replace(/<\/head>/i,`${json}\n</head>`);
  return {html:next,terms};
}

function entriesOf(index){if(Array.isArray(index))return index;for(const key of ['entries','items','documents','pages'])if(Array.isArray(index&&index[key]))return index[key];throw new Error('Generated search index entries are missing.');}
function materializeSearch(source,terms){
  const index=JSON.parse(source);const entries=entriesOf(index);
  for(const term of terms){
    const url=`${PAGE}#${term.id}`;
    const entry={url,title:`${term.code}${term.name?`｜${term.name}`:''}`,code:term.code,description:term.description,headings:'全站术语｜精益生产｜工业工程｜制造运营',text:[term.code,term.en,term.name,term.description,'精益生产 工业工程 IE 现场改善 制造运营 QilyLean 启力精益'].filter(Boolean).join(' '),kind:'全站术语',date:DATE};
    const existing=entries.find(item=>item&&item.url===url);if(existing)Object.assign(existing,entry);else entries.push(entry);
  }
  if(!Array.isArray(index)){index.meta=index.meta||{};index.meta.generatedAt=DATE;index.meta.terminologyTotal=terms.length;index.meta.totalEntries=entries.length;}
  return `${JSON.stringify(index,null,2)}\n`;
}
function materializeSitemap(source){
  const loc=`${ORIGIN}${PAGE}`;const escaped=loc.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  const urlBlock=new RegExp(`(<url>\\s*<loc>${escaped}<\\/loc>[\\s\\S]*?<lastmod>)[^<]+(<\\/lastmod>[\\s\\S]*?<\\/url>)`,'i');
  if(urlBlock.test(source))return source.replace(urlBlock,`$1${DATE}$2`);
  if(!/<\/urlset>/i.test(source))throw new Error('Sitemap is missing </urlset>.');
  return source.replace(/<\/urlset>/i,`  <url><loc>${loc}</loc><lastmod>${DATE}</lastmod></url>\n</urlset>`);
}

const terminologySource=read('knowledge/terminology.html');
const result=materializeTerminology(terminologySource);
const outputs=new Map();
outputs.set('knowledge/terminology.html',result.html);
if(fs.existsSync(file('qilylean/site-search-index.json')))outputs.set('qilylean/site-search-index.json',materializeSearch(read('qilylean/site-search-index.json'),result.terms));
for(const sitemap of ['sitemap.xml','sitemap-core.xml'])if(fs.existsSync(file(sitemap)))outputs.set(sitemap,materializeSitemap(read(sitemap)));

const stale=[];
for(const [relative,next] of outputs){const current=read(relative);if(current===next)continue;stale.push(relative);if(!checkOnly)write(relative,next);}
if(checkOnly&&stale.length)throw new Error(`Terminology search authority is stale: ${stale.join(', ')}`);
process.stdout.write(`Terminology search authority ${checkOnly?'check passed':'materialized'}: ${result.terms.length} visible DefinedTerm entities; ${stale.length} file(s) ${checkOnly?'stale':'updated'}.\n`);
