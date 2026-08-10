#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const cooperationFile = path.join(root, 'cooperation', 'index.html');

function qualityOnlyBlock() {
  return `<!-- QILY-CORE-PRICING-QUALITY:START -->
<!-- QILY-PRICING-PUBLIC-DISABLED｜完整项目价格不在公网展示。 -->
<!-- QILY-PRICING-POLICY｜仅公开诊断级入口价格；六类项目合作能力的完整合作均按范围、投入、交付物和验收标准独立报价，不在公网展示统一总价。 -->
<section class="module-section alt" id="quality-throughline" aria-labelledby="qualityThroughlineTitle">
  <div class="module-inner">
    <div class="qily-quality-throughline">
      <small>QUALITY THROUGHLINE｜PQCD的贯穿主线</small>
      <h3 id="qualityThroughlineTitle">质量不是PQCD中的一个并列数字，而是生产力、成本与交付成立的前提</h3>
      <p>所有效率、成本和交付改善，必须同时通过质量基线、一次合格率、过程能力、DPPM／COPQ、异常防再发与客户风险验证。QilyLean不接受以返工增加、判定放宽、检验后移或风险转嫁换取表面产量。相关方法持续关联至<a href="/qilylean/daily/2026-07-31.html">《品质不是检出来的：把客户要求转化为全过程质量闭环》</a>及<a href="/knowledge/terminology.html?opl=质量改善">质量改善术语与单点培训</a>。</p>
    </div>
  </div>
</section>
<!-- QILY-CORE-PRICING-QUALITY:END -->`;
}

function normalizeEntrySection(html) {
  return html
    .replace('<div class="module-heading"><h2>从小范围验证开始</h2><p>先判断问题是否匹配，再用诊断明确范围和收益逻辑；专项项目在范围、周期、人员投入和交付物确认后报价。</p></div>', '<div class="module-heading"><h2>合作启动路径与公开报价边界</h2><p>六类项目合作能力均按项目边界定义合作；官网仅公开前期合作入口及价格边界，正式项目须在明确范围、投入、交付物和验收标准后独立报价。</p></div>')
    .replace(/<div class="price">免费<\/div>/g, '')
    .replace(/<div class="price">¥6,800起\s*<span>＋差旅<\/span><\/div>/g, '<div class="price">¥6,800起 <span>＋差旅</span></div>')
    .replace(/<div class="price">按范围评估<\/div>/g, '')
    .replace(/<p class="fine-print">价格说明：[\s\S]*?<\/p>/g, '<p class="fine-print"><strong>价格边界：</strong>前期诊断与概念级方案构思不代表六类项目合作能力任一完整专项合作范围。具体费用须根据实际需求明确范围、周期、投入、技术复杂度、交付物、修改轮次及验收标准，并通过书面项目方案和正式合同独立报价。</p>')
    .replace(/<p class="fine-print">合作说明：[\s\S]*?<\/p>/g, '<p class="fine-print"><strong>价格边界：</strong>前期诊断与概念级方案构思不代表六类项目合作能力任一完整专项合作范围。具体费用须根据实际需求明确范围、周期、投入、技术复杂度、交付物、修改轮次及验收标准，并通过书面项目方案和正式合同独立报价。</p>')
    .replace(/<p class="fine-print">[\s\S]*?¥6,800[\s\S]*?<\/p>/g, '<p class="fine-print"><strong>价格边界：</strong>前期诊断与概念级方案构思不代表六类项目合作能力任一完整专项合作范围。具体费用须根据实际需求明确范围、周期、投入、技术复杂度、交付物、修改轮次及验收标准，并通过书面项目方案和正式合同独立报价。</p>');
}

function main() {
  let html = fs.readFileSync(cooperationFile, 'utf8');
  const pricingBlock = /<!-- QILY-CORE-PRICING-QUALITY:START -->[\s\S]*?<!-- QILY-CORE-PRICING-QUALITY:END -->/;
  if (!pricingBlock.test(html)) throw new Error('Commercial pricing and quality marker block is missing.');

  html = html.replace(pricingBlock, qualityOnlyBlock());
  html = normalizeEntrySection(html);

  const forbidden = [
    '¥80,000–300,000+／项目',
    '¥3,000–6,000／人日',
    '¥30,000–150,000／项目',
    '¥2,500–4,500／人日',
    '三大核心业务｜公开价格参考与报价依据',
    '公开报价不包含',
    'qily-pricing-basis-grid'
  ];
  forbidden.forEach((value) => {
    if (html.includes(value)) throw new Error(`Public core-project pricing content remains: ${value}`);
  });

  if (!html.includes('QILY-PRICING-POLICY')) throw new Error('Unified pricing policy marker is missing.');
  if (!html.includes('<h2>合作启动路径与公开报价边界</h2>')) throw new Error('Cooperation path was not normalized.');
  if (!html.includes('质量不是PQCD中的一个并列数字')) throw new Error('Quality-throughline module was removed unexpectedly.');

  fs.writeFileSync(cooperationFile, html.endsWith('\n') ? html : `${html}\n`, 'utf8');
  process.stdout.write('Diagnostic entry pricing retained; full project pricing remains scope-based and non-public.\n');
}

main();
