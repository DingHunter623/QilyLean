#!/usr/bin/env node
'use strict';

/* QilyLean six-core + Friend Links navigation permanent baseline｜2026-08-17 */
const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
function read(rel){return fs.readFileSync(path.join(root,rel),'utf8');}
function write(rel,content){const file=path.join(root,rel);const out=content.endsWith('\n')?content:content+'\n';if(fs.readFileSync(file,'utf8')===out)return false;fs.writeFileSync(file,out,'utf8');return true;}
function assert(ok,msg){if(!ok)throw new Error(msg);}

function patchCore(){
  let js=read('site-navigation-core.js');
  if(!js.includes("['友情链接', '/links/']"))js=js.replace("    ['项目合作', '/cooperation/'],","    ['友情链接', '/links/'],\n    ['项目合作', '/cooperation/'],");
  if(!js.includes("if (path.indexOf('/links/') === 0) return '/links/';"))js=js.replace("    if (path.indexOf('/cooperation/') === 0) return '/cooperation/';","    if (path.indexOf('/links/') === 0) return '/links/';\n    if (path.indexOf('/cooperation/') === 0) return '/cooperation/';");
  assert(js.includes("['友情链接', '/links/']"),'navigation core: Friend Links primary item missing');
  assert(js.includes("if (path.indexOf('/links/') === 0) return '/links/';"),'navigation core: Friend Links current-state route missing');
  write('site-navigation-core.js',js);
}

function patchConsistency(){
  let js=read('site-ui-consistency-v1.js');
  if(!js.includes("if(path.indexOf('/links/')===0)return '/links/';"))js=js.replace("    if(path.indexOf('/cooperation/')===0)return '/cooperation/';","    if(path.indexOf('/links/')===0)return '/links/';\n    if(path.indexOf('/cooperation/')===0)return '/cooperation/';");
  js=js.replace("return ['/','/capabilities/','/projects/','/improvements/','/knowledge/','/experience/','/cooperation/','/trust/'].indexOf(path)!==-1?path:'';","return ['/','/capabilities/','/projects/','/improvements/','/knowledge/','/experience/','/links/','/cooperation/','/trust/'].indexOf(path)!==-1?path:'';");
  js=js.replace(/\s*nav\.querySelectorAll\('a\[href="\\\/links\\\/"\],a\[href="\\\/links\\\/index\\\.html"\]'\)\.forEach\(function\(link\)\{\s*if\(path\.indexOf\('\\\/links\\\/'\)!==0\)link\.remove\(\);\s*\}\);/m,'');
  js=js.replace(/\s*nav\.querySelectorAll\('a\[href="\/links\/"\],a\[href="\/links\/index\.html"\]'\)\.forEach\(function\(link\)\{\s*if\(path\.indexOf\('\/links\/'\)!==0\)link\.remove\(\);\s*\}\);/m,'');
  assert(js.includes("if(path.indexOf('/links/')===0)return '/links/';"),'ui consistency: Friend Links primary module missing');
  assert(js.includes("'/links/'"),'ui consistency: Friend Links route missing');
  assert(!js.includes("if(path.indexOf('/links/')!==0)link.remove();"),'ui consistency: Friend Links removal rule still active');
  write('site-ui-consistency-v1.js',js);
}

function injectFriendLink(html,current){
  const currentMarkup=current?'<a href="/links/" aria-current="page" data-qily-primary-current="true">友情链接</a>':'<a href="/links/">友情链接</a>';
  const header=(html.match(/<header\b[\s\S]*?<\/header>/i)||[])[0]||'';
  if(!header)return html;
  let nextHeader=header;
  // Idempotent by design: remove every existing Friend Links anchor first, then insert exactly one.
  nextHeader=nextHeader.replace(/\s*<a\s+[^>]*href="\/links\/(?:index\.html)?"[^>]*>\s*友情链接\s*<\/a>/gi,'');
  const cooperation=/(\s*<a\s+[^>]*href="\/cooperation\/(?:index\.html)?"[^>]*>)/i;
  if(cooperation.test(nextHeader)){
    nextHeader=nextHeader.replace(cooperation,'\n      '+currentMarkup+'$1');
  }else{
    const navClose=/<\/nav>/i;
    nextHeader=nextHeader.replace(navClose,'      '+currentMarkup+'\n    </nav>');
  }
  const matches=nextHeader.match(/<a\s+[^>]*href="\/links\/(?:index\.html)?"[^>]*>\s*友情链接\s*<\/a>/gi)||[];
  assert(matches.length===1,'static header must contain exactly one Friend Links primary anchor');
  return html.replace(header,nextHeader);
}

function patchStaticHeaders(){
  const primary=['index.html','capabilities/index.html','projects/index.html','improvements/index.html','knowledge/index.html','experience/index.html','cooperation/index.html','trust/index.html'];
  for(const rel of primary){
    let html=read(rel);html=injectFriendLink(html,false);write(rel,html);
  }
  let links=read('links/index.html');links=injectFriendLink(links,true);write('links/index.html',links);
}

patchCore();
patchConsistency();
patchStaticHeaders();
process.stdout.write('Six-core navigation baseline applied: Friend Links restored exactly once as a primary module with consistent current-state styling.\n');
