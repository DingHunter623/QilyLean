#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const exactSummary = '职业生涯多年度参与、主导及组织推进的累计改善贡献，包含跨部门团队共同成果。';
const exactBoundary = '“超千万元”为多年度累计口径，非QilyLean品牌独立营收；已核定、已验证、阶段估算及职责边界分级披露，不构成新项目收益承诺。';

function read(file) {
  return fs.readFileSync(path.join(root, file), 'utf8');
}

function write(file, content) {
  const target = path.join(root, file);
  const normalized = content.endsWith('\n') ? content : `${content}\n`;
  if (fs.readFileSync(target, 'utf8') !== normalized) fs.writeFileSync(target, normalized, 'utf8');
}

function replaceMarker(content, start, end, block) {
  const expression = new RegExp(`<!-- ${start} -->[\\s\\S]*?<!-- ${end} -->`, 'm');
  if (expression.test(content)) return content.replace(expression, block);
  if (/<\/main>/i.test(content)) return content.replace(/<\/main>/i, `${block}\n</main>`);
  return content.replace(/<\/body>/i, `${block}\n</body>`);
}

function patchHome() {
  const file = 'index.html';
  let html = read(file);
  const metric = `<div class="metric"><strong>超千万元*</strong><span>${exactSummary}</span><em>${exactBoundary}</em></div>`;
  html = html.replace(/<div class="metric"><strong>超千万元\*?<\/strong><span>[\s\S]*?<\/span><em>[\s\S]*?<\/em><\/div>/g, metric);

  const block = `<!-- QILY-CUMULATIVE-CONTRIBUTION-DISCLOSURE:START -->
<section class="section" id="cumulative-contribution-disclosure"><div class="inner"><div class="metric-display-note" role="note"><strong>“超千万元”口径：</strong><span>${exactSummary}${exactBoundary}</span></div></div></section>
<!-- QILY-CUMULATIVE-CONTRIBUTION-DISCLOSURE:END -->`;
  html = replaceMarker(html, 'QILY-CUMULATIVE-CONTRIBUTION-DISCLOSURE:START', 'QILY-CUMULATIVE-CONTRIBUTION-DISCLOSURE:END', block);
  write(file, html);
}

function patchCooperation() {
  const file = 'cooperation/index.html';
  let html = read(file);
  html = html.replace(/<div><strong>超千万元\*?<\/strong><span>[\s\S]*?<\/span><\/div>/g, `<div><strong>超千万元*</strong><span>职业生涯累计改善贡献；非QilyLean品牌独立营收</span></div>`);

  const block = `<!-- QILY-CUMULATIVE-CONTRIBUTION-DISCLOSURE:START -->
<section class="module-section alt" id="cumulative-contribution-disclosure"><div class="module-inner"><div class="module-heading"><h2>累计成果口径与责任边界</h2><p>${exactSummary}${exactBoundary}</p></div></div></section>
<!-- QILY-CUMULATIVE-CONTRIBUTION-DISCLOSURE:END -->`;
  html = replaceMarker(html, 'QILY-CUMULATIVE-CONTRIBUTION-DISCLOSURE:START', 'QILY-CUMULATIVE-CONTRIBUTION-DISCLOSURE:END', block);
  write(file, html);
}

function validate() {
  const home = read('index.html');
  const cooperation = read('cooperation/index.html');
  if (!home.includes(exactSummary) || !home.includes('非QilyLean品牌独立营收')) throw new Error('Homepage static cumulative disclosure missing');
  if (!cooperation.includes(exactSummary) || !cooperation.includes('非QilyLean品牌独立营收')) throw new Error('Cooperation static cumulative disclosure missing');
}

patchHome();
patchCooperation();
validate();
process.stdout.write('Enforced final static cumulative-contribution disclosures after all upstream generators.\n');
