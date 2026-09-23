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
const cn=read('cn-site/assets/qilylean-vi-v2.css');

must(type,'--qily-type-h1:clamp(30px,2.65vw,44px);','COM typography authority');
must(type,'main h1,','COM all-module H1 coverage');
forbid(type,'--qily-type-h1:clamp(43px,4.25vw,66px);','COM legacy oversized H1');

must(home,'font-size:clamp(30px,2.65vw,44px)!important;','Homepage head-title authority');
forbid(home,'font-size:clamp(34px,3.25vw,62px)!important;','Homepage oversized regression');

must(cn,'--qily-cn-h1:clamp(28px,2.25vw,38px);','CN final VI page-heading sync');
forbid(cn,'--qily-cn-h1:clamp(34px,2.8vw,46px);','CN retired oversized hero');

process.stdout.write('PASS: R8.1 heading hierarchy locked — international primary titles are capped at 44px; CN final VI stays independently governed with a restrained 38px page-title ceiling.\n');
