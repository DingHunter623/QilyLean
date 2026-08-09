#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const target = path.join(root, 'qilylean', 'daily', '2026-08-09.html');
const assetDir = path.join(root, 'qilylean', 'assets');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function write(file, content) {
  fs.writeFileSync(file, content.endsWith('\n') ? content : `${content}\n`, 'utf8');
}

const teal = '#0f6f78';
const dark = '#12313a';
const green = '#1f653d';
const gold = '#c88d00';
const muted = '#526967';
const line = '#d5e4e3';
const pale = '#f7faf9';
const font = "Arial,'Microsoft YaHei','PingFang SC',sans-serif";

function baseSvg(title, subtitle, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1440" height="1080" viewBox="0 0 1440 1080" role="img" aria-label="${title}">
<style>text{font-family:${font};fill:${dark}}.title{font-size:58px;font-weight:900}.sub{font-size:25px;fill:${muted}}.h{font-size:29px;font-weight:850}.b{font-size:22px}.s{font-size:18px;fill:${muted}}.num{font-size:30px;font-weight:900}.white{fill:#fff}.teal{fill:${teal}}.green{fill:${green}}.gold{fill:${gold}}</style>
<rect width="1440" height="1080" fill="#fff"/>
<text x="720" y="76" text-anchor="middle" class="title">${title}</text>
<line x1="490" y1="111" x2="675" y2="111" stroke="${teal}" stroke-width="4"/><circle cx="720" cy="111" r="7" fill="${gold}"/><line x1="765" y1="111" x2="950" y2="111" stroke="${teal}" stroke-width="4"/>
<text x="720" y="158" text-anchor="middle" class="sub">${subtitle}</text>
${body}
<line x1="40" y1="1030" x2="520" y2="1030" stroke="${teal}" stroke-width="3"/><text x="720" y="1041" text-anchor="middle" font-size="26" font-weight="800">QilyLean｜启力精益</text><line x1="920" y1="1030" x2="1400" y2="1030" stroke="${teal}" stroke-width="3"/>
</svg>`;
}

function conceptSvg() {
  const cards = [
    {x:35,c:teal,n:'01',t:'天花板 Ceiling',icon:'▲',d:['既定条件下','可达到的上限'],m:['要突破，通常需要改变','资源、技术、流程','或组织约束。']},
    {x:382,c:green,n:'02',t:'标杆 Benchmark',icon:'⚑',d:['外部或内部优秀','参照水平'],m:['用于对标学习，','不等于本期','必达目标。']},
    {x:729,c:teal,n:'03',t:'目标 Target',icon:'◎',d:['本期必须达成的','结果值'],m:['应满足 SMART，','可检查、可追踪。']},
    {x:1076,c:gold,n:'04',t:'挑战目标',icon:'↗',d:['通过改善努力争取的','更高目标'],m:['通常高于常规目标，','但不应被误说成','天花板。']}
  ];
  const body = cards.map((c) => `<g transform="translate(${c.x},220)"><rect width="325" height="690" rx="20" fill="#fff" stroke="${c.c}" stroke-width="2"/><rect width="325" height="88" rx="20" fill="${c.c}"/><rect y="70" width="325" height="18" fill="${c.c}"/><circle cx="48" cy="44" r="29" fill="#fff"/><text x="48" y="54" text-anchor="middle" class="num" fill="${c.c}">${c.n}</text><text x="92" y="54" class="h white">${c.t}</text><text x="162" y="255" text-anchor="middle" font-size="125" font-weight="900" fill="${c.c}">${c.icon}</text><line x1="22" y1="330" x2="303" y2="330" stroke="${line}" stroke-width="2"/><rect x="22" y="350" width="76" height="48" rx="10" fill="${c.c}"/><text x="60" y="382" text-anchor="middle" class="b white" font-weight="800">定义</text><text x="118" y="372" class="b">${c.d[0]}</text><text x="118" y="404" class="b">${c.d[1]}</text><line x1="22" y1="440" x2="303" y2="440" stroke="${line}" stroke-width="2"/><rect x="22" y="466" width="76" height="76" rx="10" fill="${c.c}"/><text x="60" y="498" text-anchor="middle" class="b white" font-weight="800">管理</text><text x="60" y="528" text-anchor="middle" class="b white" font-weight="800">意义</text>${c.m.map((v,i)=>`<text x="118" y="${487+i*34}" class="b">${v}</text>`).join('')}</g>`).join('');
  return baseSvg('概念边界简图｜天花板、标杆、目标、挑战目标','把上限、对标、目标和挑战分开，管理口径才不会混乱。',`${body}<rect x="35" y="930" width="1370" height="70" rx="16" fill="#eef7f6" stroke="${teal}" stroke-width="2"/><text x="75" y="974" class="h teal">一句话：</text><text x="220" y="974" class="b">天花板是上限；标杆是参照；目标是必须达成；挑战目标是努力争取。</text>`);
}

function capacitySvg() {
  const rows = [
    ['当前 Current','800件/天',800,teal],['目标 Target','900件/天',900,teal],['挑战目标 Stretch','980件/天',980,gold],['天花板 Ceiling','1000件/天',1000,teal],['标杆 Benchmark','1100件/天',1100,green]
  ];
  const max=1200, x0=535, chartW=520;
  const content = rows.map((r,i)=>{const y=230+i*112; const w=r[2]/max*chartW; return `<rect x="35" y="${y}" width="480" height="92" rx="15" fill="#fff" stroke="${r[3]}" stroke-width="2"/><circle cx="82" cy="${y+46}" r="34" fill="${r[3]}"/><text x="82" y="${y+56}" text-anchor="middle" font-size="34" class="white" font-weight="900">${i+1}</text><text x="135" y="${y+39}" class="h" fill="${r[3]}">${r[0]}</text><text x="360" y="${y+58}" class="num" fill="${r[3]}">${r[1]}</text><rect x="${x0}" y="${y+10}" width="${w}" height="62" rx="4" fill="${r[3]}"/><text x="${x0+w+10}" y="${y+52}" class="b">${r[2]}</text>`}).join('');
  return baseSvg('场景简图｜产能与改善','当目标逼近或超过上限，管理动作必须从“优化”切换为“突破约束”。',`${content}<line x1="${x0+1000/max*chartW}" y1="205" x2="${x0+1000/max*chartW}" y2="790" stroke="${teal}" stroke-width="3" stroke-dasharray="9 9"/><text x="930" y="330" class="b" fill="${teal}">1000件/天</text><text x="930" y="360" class="s">现有人机料法条件下</text><line x1="${x0+1100/max*chartW}" y1="205" x2="${x0+1100/max*chartW}" y2="790" stroke="${green}" stroke-width="3" stroke-dasharray="9 9"/><text x="1010" y="665" class="b" fill="${green}">1100件/天</text><text x="1010" y="695" class="s">行业优秀线体参考</text><rect x="1125" y="220" width="280" height="570" rx="18" fill="#fff" stroke="${teal}" stroke-width="2"/><rect x="1140" y="238" width="250" height="54" rx="12" fill="${teal}"/><text x="1265" y="275" text-anchor="middle" class="h white">产线概览</text><text x="1160" y="330" class="b">OEE</text><path d="M1185 430 A80 80 0 0 1 1345 430" fill="none" stroke="#d8e5e5" stroke-width="25"/><path d="M1185 430 A80 80 0 0 1 1315 365" fill="none" stroke="${teal}" stroke-width="25"/><text x="1265" y="420" text-anchor="middle" font-size="40" font-weight="900">78%</text><text x="1160" y="485" class="b">产出趋势（件/天）</text><polyline points="1170,565 1205,545 1240,558 1275,530 1310,548 1345,515" fill="none" stroke="${teal}" stroke-width="6"/><circle cx="1170" cy="565" r="7" fill="${teal}"/><circle cx="1205" cy="545" r="7" fill="${teal}"/><circle cx="1240" cy="558" r="7" fill="${teal}"/><circle cx="1275" cy="530" r="7" fill="${teal}"/><circle cx="1310" cy="548" r="7" fill="${teal}"/><circle cx="1345" cy="515" r="7" fill="${teal}"/><text x="1160" y="630" class="b">生产线示意</text><rect x="1170" y="715" width="180" height="18" rx="8" fill="#738b8d"/><rect x="1190" y="685" width="35" height="30" fill="#aabbbc"/><rect x="1250" y="675" width="35" height="40" fill="#aabbbc"/><rect x="1310" y="660" width="50" height="55" fill="#6b8487"/><rect x="35" y="840" width="670" height="120" rx="18" fill="#eef7f6" stroke="${teal}" stroke-width="2"/><text x="75" y="885" class="h teal">当目标 ≤ 天花板：</text><text x="75" y="925" class="b">优先通过排程、线平衡、标准作业、换型改善推进。</text><rect x="735" y="840" width="670" height="120" rx="18" fill="#fff8e8" stroke="${gold}" stroke-width="2"/><text x="775" y="885" class="h gold">当目标 &gt; 天花板：</text><text x="775" y="925" class="b">需要增加设备、人力、工装、工艺或布局资源。</text>`);
}

function careerSvg() {
  const steps = [
    [120,820,250,80,teal,'01','当前：IE工程师'],
    [330,700,300,120,teal,'02','目标：高级工程师'],
    [560,570,330,130,teal,'03','挑战目标：工程主管'],
    [790,420,330,150,gold,'04','天花板：当前组织体系内可到达的上限'],
    [1010,270,260,150,green,'05','标杆：行业优秀同岗位能力标准']
  ];
  const stairs=steps.map(s=>`<rect x="${s[0]}" y="${s[1]}" width="${s[2]}" height="${s[3]}" fill="${s[4]}" opacity=".95"/><circle cx="${s[0]+30}" cy="${s[1]-20}" r="25" fill="${s[4]}"/><text x="${s[0]+30}" y="${s[1]-11}" text-anchor="middle" class="b white" font-weight="900">${s[5]}</text><text x="${s[0]+18}" y="${s[1]-58}" class="h" fill="${s[4]}">${s[6]}</text>`).join('');
  return baseSvg('场景简图｜职业发展','职场里的“天花板”通常不是努力一点就能达成的目标，而是当前体系内的晋升或能力上限。',`<rect x="35" y="220" width="1000" height="720" rx="20" fill="#fff" stroke="${teal}" stroke-width="2"/>${stairs}<circle cx="135" cy="735" r="35" fill="${teal}"/><line x1="135" y1="770" x2="135" y2="840" stroke="${teal}" stroke-width="18"/><line x1="135" y1="795" x2="200" y2="760" stroke="${teal}" stroke-width="15"/><line x1="135" y1="838" x2="90" y2="895" stroke="${teal}" stroke-width="15"/><line x1="135" y1="838" x2="190" y2="885" stroke="${teal}" stroke-width="15"/><rect x="1060" y="220" width="345" height="720" rx="20" fill="#fff" stroke="${teal}" stroke-width="2"/><rect x="1060" y="220" width="345" height="90" rx="20" fill="${teal}"/><rect x="1060" y="290" width="345" height="20" fill="${teal}"/><text x="1232" y="277" text-anchor="middle" class="h white">管理提醒</text><circle cx="1110" cy="380" r="28" fill="${teal}"/><text x="1110" y="389" text-anchor="middle" class="b white" font-weight="900">01</text><text x="1160" y="365" class="b">“目标”要写清时间、</text><text x="1160" y="399" class="b">标准和结果。</text><line x1="1090" y1="460" x2="1375" y2="460" stroke="${line}" stroke-width="2"/><circle cx="1110" cy="525" r="28" fill="${teal}"/><text x="1110" y="534" text-anchor="middle" class="b white" font-weight="900">02</text><text x="1160" y="510" class="b">“挑战目标”可以更高，</text><text x="1160" y="544" class="b">但仍需可争取。</text><line x1="1090" y1="605" x2="1375" y2="605" stroke="${line}" stroke-width="2"/><circle cx="1110" cy="670" r="28" fill="${teal}"/><text x="1110" y="679" text-anchor="middle" class="b white" font-weight="900">03</text><text x="1160" y="650" class="b">若已接近“天花板”，</text><text x="1160" y="684" class="b">应考虑岗位、组织或</text><text x="1160" y="718" class="b">能力结构升级。</text>`);
}

function judgementSvg() {
  return baseSvg('场景简图｜目标设定的管理判断','先判断目标是否在当前上限之内，再决定是做改善，还是先改约束。',`<rect x="350" y="210" width="380" height="78" rx="14" fill="#fff" stroke="${teal}" stroke-width="2"/><text x="540" y="260" text-anchor="middle" class="h">先定义目标值</text><line x1="540" y1="288" x2="540" y2="330" stroke="${teal}" stroke-width="4"/><polygon points="540,330 720,410 540,490 360,410" fill="#fff" stroke="${teal}" stroke-width="3"/><text x="540" y="400" text-anchor="middle" class="h">目标值 ≤</text><text x="540" y="438" text-anchor="middle" class="h">当前天花板？</text><line x1="360" y1="410" x2="245" y2="410" stroke="${teal}" stroke-width="4"/><circle cx="220" cy="410" r="30" fill="${teal}"/><text x="220" y="420" text-anchor="middle" class="h white">是</text><line x1="220" y1="440" x2="220" y2="505" stroke="${teal}" stroke-width="4"/><line x1="720" y1="410" x2="830" y2="410" stroke="${green}" stroke-width="4"/><circle cx="855" cy="410" r="30" fill="${green}"/><text x="855" y="420" text-anchor="middle" class="h white">否</text><line x1="855" y1="440" x2="855" y2="505" stroke="${green}" stroke-width="4"/>${['优化流程','标准化作业','培训与执行','达成目标'].map((t,i)=>`<rect x="70" y="${505+i*105}" width="300" height="72" rx="14" fill="#fff" stroke="${teal}" stroke-width="2"/><text x="220" y="${551+i*105}" text-anchor="middle" class="h">${t}</text>${i<3?`<line x1="220" y1="${577+i*105}" x2="220" y2="${610+i*105}" stroke="${teal}" stroke-width="4"/>`:''}`).join('')}${['识别瓶颈约束','增加资源/设备/工艺/组织支持','重设新天花板','再设目标'].map((t,i)=>`<rect x="705" y="${505+i*105}" width="300" height="72" rx="14" fill="#fff" stroke="${green}" stroke-width="2"/><text x="855" y="${551+i*105}" text-anchor="middle" font-size="${i===1?20:29}" font-weight="850">${t}</text>${i<3?`<line x1="855" y1="${577+i*105}" x2="855" y2="${610+i*105}" stroke="${green}" stroke-width="4"/>`:''}`).join('')}<rect x="1070" y="335" width="335" height="470" rx="20" fill="#fffaf0" stroke="${gold}" stroke-width="2"/><text x="1238" y="395" text-anchor="middle" class="h gold">标杆的作用</text><line x1="1100" y1="425" x2="1375" y2="425" stroke="${gold}" stroke-width="2" stroke-dasharray="8 8"/><rect x="1165" y="530" width="35" height="80" fill="${gold}"/><rect x="1215" y="490" width="35" height="120" fill="${gold}"/><rect x="1265" y="445" width="35" height="165" fill="${gold}"/><text x="1238" y="675" text-anchor="middle" class="b">标杆用于对标学习</text><text x="1238" y="710" text-anchor="middle" class="b">和寻找差距，</text><text x="1238" y="745" text-anchor="middle" class="b">不直接等于本期考核值。</text><rect x="35" y="930" width="1370" height="70" rx="16" fill="#eef7f6" stroke="${teal}" stroke-width="2"/><text x="75" y="974" class="h teal">一句话：</text><text x="220" y="974" class="b">能在天花板内解决的，先做改善；超过天花板的，先改约束。</text>`);
}

const assets = [
  ['daily-2026-08-09-concept-boundary.svg', conceptSvg()],
  ['daily-2026-08-09-capacity-improvement.svg', capacitySvg()],
  ['daily-2026-08-09-career-development.svg', careerSvg()],
  ['daily-2026-08-09-management-judgement.svg', judgementSvg()]
];
assets.forEach(([name, svg]) => write(path.join(assetDir, name), svg));

let html = fs.readFileSync(target, 'utf8');
const styleMarker = '<!-- QILY-20260809-SCENE-FIGURES:STYLE -->';
if (!html.includes(styleMarker)) {
  const styles = `${styleMarker}\n<style>\n.brief-scene-figure{margin:22px 0 30px;padding:14px;border:1px solid rgba(202,161,95,.34);border-radius:18px;background:#fff;box-shadow:0 10px 24px rgba(15,75,90,.07)}\n.brief-scene-figure a{display:block}\n.brief-scene-figure img{display:block;width:100%;height:auto;border-radius:12px;background:#f7f8f5}\n.brief-scene-figure figcaption{padding:10px 4px 2px;color:#526967;line-height:1.65}\n@media(max-width:760px){.brief-scene-figure{margin:16px 0 22px;padding:9px;border-radius:14px}.brief-scene-figure img{border-radius:9px}}\n</style>`;
  assert(html.includes('</head>'), 'Missing </head>');
  html = html.replace('</head>', `${styles}\n</head>`);
}

function insertBefore(anchor, marker, block) {
  if (html.includes(marker)) return;
  assert(html.includes(anchor), `Missing anchor: ${anchor}`);
  html = html.replace(anchor, `${block}\n${anchor}`);
}

insertBefore('<h3>3. “天花板＝行业标杆最高级”也要再精确一步</h3>','<!-- QILY-20260809-SCENE-CONCEPT -->',`<!-- QILY-20260809-SCENE-CONCEPT -->\n<figure class="brief-scene-figure" data-scene-figure="concept-boundary"><a href="/qilylean/assets/daily-2026-08-09-concept-boundary.svg" target="_blank" rel="noopener"><img src="/qilylean/assets/daily-2026-08-09-concept-boundary.svg" alt="概念边界简图：天花板、标杆、目标与挑战目标的定义和管理区别" width="1440" height="1080" loading="lazy"></a><figcaption><strong>概念边界简图：</strong>天花板是上限，标杆是参照，目标是本期必须达成，挑战目标是通过改善努力争取的更高结果。</figcaption></figure>`);

insertBefore('<h3>5. 为什么管理术语不能随意混用</h3>','<!-- QILY-20260809-SCENE-CAPACITY -->',`<!-- QILY-20260809-SCENE-CAPACITY -->\n<figure class="brief-scene-figure" data-scene-figure="capacity-improvement"><a href="/qilylean/assets/daily-2026-08-09-capacity-improvement.svg" target="_blank" rel="noopener"><img src="/qilylean/assets/daily-2026-08-09-capacity-improvement.svg" alt="产能与改善场景简图：当前、目标、挑战目标、天花板与标杆的关系" width="1440" height="1080" loading="lazy"></a><figcaption><strong>场景简图｜产能与改善：</strong>当目标仍在当前天花板内，优先做排程、线平衡、标准作业和换型改善；当目标超过天花板，就必须改变设备、人力、工装、工艺或布局等约束。</figcaption></figure>`);

insertBefore('<h3>7. 管理者真正要做的是识别约束，而不是喊高目标</h3>','<!-- QILY-20260809-SCENE-CAREER -->',`<!-- QILY-20260809-SCENE-CAREER -->\n<figure class="brief-scene-figure" data-scene-figure="career-development"><a href="/qilylean/assets/daily-2026-08-09-career-development.svg" target="_blank" rel="noopener"><img src="/qilylean/assets/daily-2026-08-09-career-development.svg" alt="职业发展场景简图：当前岗位、目标、挑战目标、职业天花板与行业标杆" width="1440" height="1080" loading="lazy"></a><figcaption><strong>场景简图｜职业发展：</strong>目标可以是下一个岗位层级，挑战目标可以更高；如果已经接近当前组织体系的天花板，就要考虑岗位、组织或能力结构升级。</figcaption></figure>`);

insertBefore('<div class="brief-takeaway">','<!-- QILY-20260809-SCENE-JUDGEMENT -->',`<!-- QILY-20260809-SCENE-JUDGEMENT -->\n<figure class="brief-scene-figure" data-scene-figure="management-judgement"><a href="/qilylean/assets/daily-2026-08-09-management-judgement.svg" target="_blank" rel="noopener"><img src="/qilylean/assets/daily-2026-08-09-management-judgement.svg" alt="目标设定管理判断流程图：目标在天花板内做改善，超过天花板先改变约束" width="1440" height="1080" loading="lazy"></a><figcaption><strong>场景简图｜目标设定的管理判断：</strong>能在天花板内解决的，先做改善；超过天花板的，先识别瓶颈、改变约束、重设能力上限，再设目标。</figcaption></figure>`);

assets.forEach(([name]) => assert(html.includes(name), `Missing figure reference: ${name}`));
write(target, html);
process.stdout.write('Generated and inserted four semantic SVG scene diagrams into 2026-08-09 brief.\n');
