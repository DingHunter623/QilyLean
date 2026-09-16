#!/usr/bin/env node
'use strict';

/**
 * Audit every public HTML page for a canonical 1180px content-axis authority.
 * 斗地主 is the only explicit visual-layout exception.
 */
const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
const reportFile=path.join(root,'maintenance','axis-1180-coverage.json');
const skipDirs=new Set(['.git','node_modules','docs','dist','build','.cache']);
const skipPrefix='tools/pure-ddz/';

function rel(p){return path.relative(root,p).split(path.sep).join('/');}
function walk(dir,out=[]){
  for(const ent of fs.readdirSync(dir,{withFileTypes:true})){
    if(ent.isDirectory()&&skipDirs.has(ent.name))continue;
    const full=path.join(dir,ent.name);
    if(ent.isDirectory())walk(full,out);
    else if(ent.isFile()&&ent.name.endsWith('.html'))out.push(full);
  }
  return out;
}
function isRedirect(html){
  return /http-equiv=["']refresh["']/i.test(html)||/location\.(?:replace|href)\s*=/.test(html);
}
function oldShellWidth(html){
  return /width\s*:\s*min\(\s*(?:1080|1160|1220|1240|1360|1560)px\s*,/i.test(html)||
    /--(?:qily-wide-content|qily-content-axis|qily-container|qily-r8-axis|qv2-axis)\s*:\s*(?:1080|1160|1220|1240|1360|1560)px/i.test(html);
}
function authority(html,r){
  if(r.startsWith('cn-site/')){
    if(/href=["']\/assets\/site\.css(?:\?|["'])/i.test(html)||/href=["'][^"']*assets\/site\.css(?:\?|["'])/i.test(html))return 'cn-site/assets/site.css';
  }
  if(html.includes('/site-content-axis-v1.css'))return 'site-content-axis-v1.css';
  if(html.includes('/site-header-project-integrity-v2.css'))return 'site-header-project-integrity-v2.css';
  if(html.includes('/site-navigation.js'))return 'site-navigation.js(runtime axis loader)';
  if(html.includes('/site-wide-layout-v1.css'))return 'site-wide-layout-v1.css';
  if(/(?:width|max-width)\s*:\s*(?:min\(\s*)?1180px/i.test(html)||html.includes('--qily-content-axis:1180px'))return 'inline-1180';
  return null;
}

const rows=[];
for(const file of walk(root)){
  const r=rel(file);
  if(r.startsWith(skipPrefix)){
    rows.push({path:r,status:'excluded-ddz',authority:'DDZ independent game layout'});
    continue;
  }
  const html=fs.readFileSync(file,'utf8');
  if(isRedirect(html)){
    rows.push({path:r,status:'redirect',authority:'redirect-only'});
    continue;
  }
  const a=authority(html,r);
  rows.push({path:r,status:a?'covered':'uncovered',authority:a,legacyShellWidth:oldShellWidth(html)});
}
const covered=rows.filter(x=>x.status==='covered');
const uncovered=rows.filter(x=>x.status==='uncovered');
const excluded=rows.filter(x=>x.status==='excluded-ddz');
const redirects=rows.filter(x=>x.status==='redirect');
const legacyCovered=covered.filter(x=>x.legacyShellWidth);
const report={
  generatedAt:new Date().toISOString(),
  rule:'International + China public page content frames = 1180px; tools/pure-ddz/** excluded.',
  totalHtml:rows.length,
  covered:covered.length,
  uncovered:uncovered.length,
  redirects:redirects.length,
  excludedDdz:excluded.length,
  coveredPagesWithLegacyLocalWidthsOverriddenByFinalAuthority:legacyCovered.length,
  uncoveredPages:uncovered.map(x=>x.path),
  legacyCoveredPages:legacyCovered.map(x=>x.path),
  rows
};
fs.mkdirSync(path.dirname(reportFile),{recursive:true});
fs.writeFileSync(reportFile,JSON.stringify(report,null,2)+'\n','utf8');
console.log(`1180 axis coverage: ${covered.length} covered / ${uncovered.length} uncovered / ${redirects.length} redirects / ${excluded.length} DDZ excluded.`);
if(uncovered.length)console.log('Uncovered pages:\n'+uncovered.map(x=>`- ${x.path}`).join('\n'));
