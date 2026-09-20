#!/usr/bin/env node
'use strict';

/* R8 authoritative heading hierarchy guard: homepage H1 is the sitewide ceiling. */
const fs=require('fs');
const path=require('path');
const ROOT=path.resolve(__dirname,'..');

function read(rel){return fs.readFileSync(path.join(ROOT,rel),'utf8')}
function must(source,token,label){if(!source.includes(token))throw new Error(`${label}: missing ${token}`)}
function forbid(source,token,label){if(source.includes(token))throw new Error(`${label}: forbidden ${token}`)}

const type=read('site-typography-v1.css');
const home=read('styles/qily-home-conversion-v1.css');
const cn=read('cn-site/assets/site.css');

must(type,'--qily-type-h1:clamp(30px,2.65vw,44px);','COM typography authority');
must(type,'main h1,','COM all-module H1 coverage');
forbid(type,'--qily-type-h1:clamp(43px,4.25vw,66px);','COM legacy oversized H1');

must(home,'font-size:clamp(30px,2.65vw,44px)!important;','Homepage head-title authority');
forbid(home,'font-size:clamp(34px,3.25vw,62px)!important;','Homepage oversized regression');

must(cn,'.hero h1{max-width:980px;margin:0;font-size:clamp(34px,3.25vw,52px);','CN legacy base remains overridden by VI v2');
forbid(cn,'.hero h1{max-width:980px;margin:0;font-size:clamp(38px,6vw,74px);','CN legacy oversized hero');

process.stdout.write('PASS: R8.1 heading hierarchy locked — international primary titles are capped at 44px; CN final VI stays independently governed.\n');
