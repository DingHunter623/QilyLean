#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const pagePath = path.join(root, 'qilylean', 'daily', '2026-08-11.html');
const assetPath = path.join(root, 'qilylean', 'daily', 'assets', '2026-08-11-01-visual-loop.svg');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="540" viewBox="0 0 1280 540" role="img" aria-labelledby="t d">
<title id="t">目视化管理闭环</title><desc id="d">从目标标准到现状显示、异常判定、责任响应、验证关闭和标准更新的闭环。</desc>
<rect width="1280" height="540" rx="30" fill="#f3f8f7"/>
<text x="640" y="66" text-anchor="middle" font-family="Arial,'Microsoft YaHei',sans-serif" font-size="31" font-weight="800" fill="#073c47">目视化管理不是展示，而是缩短“发现—判断—响应—关闭”的时间</text>
<g font-family="Arial,'Microsoft YaHei',sans-serif" text-anchor="middle">
<g><rect x="26" y="150" width="190" height="158" rx="20" fill="#ffffff" stroke="#74aca4" stroke-width="3"/><text x="121" y="202" font-size="23" font-weight="800" fill="#073c47">① 目标/标准</text><text x="121" y="243" font-size="18" font-weight="600" fill="#365b58">正常是什么</text><text x="121" y="278" font-size="18" font-weight="600" fill="#365b58">阈值在哪里</text></g>
<g><rect x="276" y="150" width="190" height="158" rx="20" fill="#ffffff" stroke="#74aca4" stroke-width="3"/><text x="371" y="202" font-size="23" font-weight="800" fill="#073c47">② 现状显示</text><text x="371" y="243" font-size="18" font-weight="600" fill="#365b58">当前值/趋势</text><text x="371" y="278" font-size="18" font-weight="600" fill="#365b58">更新时间</text></g>
<g><rect x="526" y="150" width="190" height="158" rx="20" fill="#fff3d8" stroke="#c58a24" stroke-width="3"/><text x="621" y="202" font-size="23" font-weight="800" fill="#684300">③ 异常判定</text><text x="621" y="243" font-size="18" font-weight="700" fill="#5d4a28">差距/越界</text><text x="621" y="278" font-size="18" font-weight="700" fill="#5d4a28">影响等级</text></g>
<g><rect x="776" y="150" width="190" height="158" rx="20" fill="#ffffff" stroke="#74aca4" stroke-width="3"/><text x="871" y="202" font-size="23" font-weight="800" fill="#073c47">④ 责任响应</text><text x="871" y="243" font-size="18" font-weight="600" fill="#365b58">Owner/措施</text><text x="871" y="278" font-size="18" font-weight="600" fill="#365b58">截止时间</text></g>
<g><rect x="1026" y="150" width="190" height="158" rx="20" fill="#ffffff" stroke="#74aca4" stroke-width="3"/><text x="1121" y="202" font-size="23" font-weight="800" fill="#073c47">⑤ 验证关闭</text><text x="1121" y="243" font-size="18" font-weight="600" fill="#365b58">实绩/证据</text><text x="1121" y="278" font-size="18" font-weight="600" fill="#365b58">标准更新</text></g>
<g fill="#467d75" font-size="36" font-weight="700"><text x="246" y="246">→</text><text x="496" y="246">→</text><text x="746" y="246">→</text><text x="996" y="246">→</text></g>
<path d="M1121 337 C1121 405 121 405 121 337" fill="none" stroke="#5f948c" stroke-width="4" stroke-dasharray="12 9"/>
<text x="640" y="455" font-size="20" font-weight="800" fill="#284f4b">关闭后的有效做法回写到标准，下一轮“正常/异常”判定才会更快、更准</text>
</g></svg>`;
fs.writeFileSync(assetPath, svg + '\n', 'utf8');

let page = fs.readFileSync(pagePath, 'utf8');
const style = `<style>
#2026-08-11 .brief-scene-figure-v1{width:calc(100% + 48px);margin:22px -24px 12px;overflow:hidden}
#2026-08-11 .brief-scene-figure-v1 img{display:block;width:100%;height:auto;border:1px solid #bdd8d3;border-radius:22px;background:#f3f8f7}
#2026-08-11 .brief-scene-figure-v1 figcaption{padding:12px 14px 0}
.visual-loop{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:16px;margin:20px 0 28px}.visual-loop>div{padding:18px 14px;border:2px solid #b7d3cf;border-radius:15px;background:#f7faf9;text-align:center}.visual-loop b{display:block;color:#073c47;margin-bottom:8px;font-weight:800}.visual-loop span{display:block;color:#385d59;line-height:1.6;font-size:15px;font-weight:600}.visual-loop>div:nth-child(3){background:#fff5df;border-color:#d3a14b}.visual-loop>div:nth-child(3) b{color:#684300}.visual-loop>div:nth-child(3) span{color:#5d4a28}.brief-callout{margin:20px 0;padding:18px 20px;border-left:4px solid #caa15f;background:#f8fbfa;line-height:1.75}.visual-rule td:first-child{font-weight:800;color:#0f4b5a;white-space:nowrap}.signal-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px;margin:18px 0 26px}.signal-grid>div{padding:17px;border:1px solid #c7dcd8;border-radius:15px;background:#fff}.signal-grid strong{display:block;color:#073c47;margin-bottom:8px}.signal-grid p{margin:0;color:#3f625f;line-height:1.7}
@media(max-width:820px){#2026-08-11 .brief-scene-figure-v1{width:100%;margin:20px 0 12px;overflow-x:auto;overflow-y:hidden;-webkit-overflow-scrolling:touch;overscroll-behavior-inline:contain;scrollbar-width:thin}#2026-08-11 .brief-scene-figure-v1 img{width:900px;max-width:none;border-radius:18px}#2026-08-11 .brief-scene-figure-v1 figcaption{padding:10px 2px 0;max-width:100%}.visual-loop,.signal-grid{grid-template-columns:1fr 1fr;gap:14px}.visual-loop>div{padding:17px 14px}.visual-loop b{font-size:17px}.visual-loop span{font-size:15px}}
@media(max-width:560px){.visual-loop,.signal-grid{grid-template-columns:1fr;gap:12px}.visual-loop>div{padding:16px 14px}.visual-loop b{font-size:18px}.visual-loop span{font-size:15px}}
</style>`;
const stylePattern = /<style>\s*\.visual-loop\{[\s\S]*?<\/style>/;
if (!stylePattern.test(page)) throw new Error('2026-08-11 inline visual style block not found');
page = page.replace(stylePattern, style);
page = page.replace(/src="\/qilylean\/daily\/assets\/2026-08-11-01-visual-loop\.svg(?:\?[^\"]*)?"/, 'src="/qilylean/daily/assets/2026-08-11-01-visual-loop.svg?v=20260811-readability-v2"');
page = page.replace(/(<img src="\/qilylean\/daily\/assets\/2026-08-11-01-visual-loop\.svg\?v=20260811-readability-v2"[^>]*?)width="\d+" height="\d+"/, '$1width="1280" height="540"');
fs.writeFileSync(pagePath, page.endsWith('\n') ? page : page + '\n', 'utf8');

const checkPage = fs.readFileSync(pagePath, 'utf8');
if (!checkPage.includes('width:calc(100% + 48px)')) throw new Error('desktop widened figure rule missing');
if (!checkPage.includes('width:900px;max-width:none')) throw new Error('mobile readable scroll rule missing');
if (!checkPage.includes('20260811-readability-v2')) throw new Error('visual-loop cache version missing');
if (!checkPage.includes('width="1280" height="540"')) throw new Error('updated visual-loop dimensions missing');
process.stdout.write('2026-08-11 visual-loop readability closure applied.\n');
