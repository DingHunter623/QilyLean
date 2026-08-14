#!/usr/bin/env node
'use strict';
const fs=require('fs');
const path=require('path');
const file=path.resolve(__dirname,'..','cooperation','index.html');
let html=fs.readFileSync(file,'utf8');
html=html.replace('复制微信号：Qily259','微信号：Qily259').replace('复制微信：Qily259','微信号：Qily259');
fs.writeFileSync(file,html,'utf8');
console.log('V12 preflight: cooperation WeChat label normalized for structural migration.');
