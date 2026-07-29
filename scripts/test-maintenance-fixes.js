#!/usr/bin/env node
'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const vm = require('vm');
const { spawnSync } = require('child_process');
const { TextEncoder } = require('util');

const root = path.resolve(__dirname, '..');

function read(file) {
  return fs.readFileSync(path.join(root, file), 'utf8');
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function mockElement() {
  return {
    children: [],
    className: '',
    style: {},
    textContent: '',
    appendChild(child) { this.children.push(child); return child; },
    addEventListener() {},
    setAttribute() {},
    remove() {},
    querySelectorAll() { return []; }
  };
}

async function validateOfficePackages() {
  const messages = { querySelectorAll() { return []; } };
  const bar = {
    querySelectorAll() { return []; },
    insertBefore() {}
  };
  const clearButton = mockElement();
  const document = {
    head: mockElement(),
    body: mockElement(),
    getElementById(id) {
      if (id === 'messages') return messages;
      if (id === 'clearBtn') return clearButton;
      return null;
    },
    querySelector(selector) {
      if (selector === '.chat .bar') return bar;
      return null;
    },
    createElement() { return mockElement(); }
  };
  const source = read('qilylean-ai-export.js').replace(
    /\}\)\(\);\s*$/,
    'globalThis.__qilyExportBuilders={buildDocx:buildDocx,buildXlsx:buildXlsx};})();'
  );
  const context = {
    document,
    console,
    TextEncoder,
    Blob,
    Uint8Array,
    DataView,
    atob,
    setTimeout,
    clearTimeout
  };
  vm.runInNewContext(source, context, { filename: 'qilylean-ai-export.js' });
  assert(context.__qilyExportBuilders, 'Office export builders were not exposed to the test harness');

  const png = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';
  const items = [
    { role: 'user', text: '请分析附件 A 与附件 B。\n附件 A · 1.0 KB\n附件 B · 2.0 KB' },
    { role: 'assistant', text: '结论：两个素材均已识别。\n1. 先验证\n2. 再固化' },
    { role: 'user', text: '请把现场问题整理为可执行的改善方案，并明确验证口径。' },
    { role: 'assistant', text: '建议按“现场观察—数据记录—问题分层—方案试点—效果验证—标准化—横向复制”推进。\n\n先确认问题对象、流程边界和基准数据，再分别明确责任人、完成节点、How do 与 How much。验证时同时检查效率、质量、成本、交付和安全，不能只看单一指标。' },
    { role: 'user', text: '如果改善结果没有达到目标，应当如何闭环？' },
    { role: 'assistant', text: '未达目标时回到事实和原因验证：复核数据口径，检查措施是否按标准执行，确认人员、设备、物料、方法、环境与测量条件是否发生变化。原因未验证前不强行结案；验证有效后再更新标准作业、点检表、系统字段和培训材料。' }
  ];
  const assets = { homeQr: png, contactQr: png };
  const time = { display: '2026-07-27 12:00', file: '20260727_1200', iso: '2026-07-27T12:00:00.000Z' };
  const docx = context.__qilyExportBuilders.buildDocx(items, assets, time);
  const xlsx = context.__qilyExportBuilders.buildXlsx(items, assets, time);
  assert(docx.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'DOCX MIME type is invalid');
  assert(xlsx.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'XLSX MIME type is invalid');

  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'qilylean-office-test-'));
  const docxPath = path.join(directory, 'conversation.docx');
  const xlsxPath = path.join(directory, 'conversation.xlsx');
  const docxBytes = Buffer.from(await docx.arrayBuffer());
  fs.writeFileSync(docxPath, docxBytes);
  if (process.env.QILY_DOCX_FIXTURE) fs.writeFileSync(process.env.QILY_DOCX_FIXTURE, docxBytes);
  fs.writeFileSync(xlsxPath, Buffer.from(await xlsx.arrayBuffer()));
  const python = `
import sys, zipfile
import xml.etree.ElementTree as ET
required = {
  '.docx': {'[Content_Types].xml', 'word/document.xml', 'word/styles.xml', 'word/settings.xml', 'word/header1.xml', 'word/footer1.xml'},
  '.xlsx': {'[Content_Types].xml', 'xl/workbook.xml', 'xl/worksheets/sheet1.xml', 'xl/styles.xml'},
}
for filename in sys.argv[1:]:
    with zipfile.ZipFile(filename) as archive:
        assert archive.testzip() is None
        names = set(archive.namelist())
        assert required[next(key for key in required if filename.endswith(key))] <= names
        if filename.endswith('.docx'):
            document = archive.read('word/document.xml').decode('utf-8')
            styles = archive.read('word/styles.xml').decode('utf-8')
            relationships = archive.read('word/_rels/document.xml.rels').decode('utf-8')
            assert '<w:pgMar w:top="907" w:right="907" w:bottom="907" w:left="907"' in document
            assert '<w:tblW w:w="10092" w:type="dxa"/>' in document
            assert '<w:gridCol w:w="3500"/><w:gridCol w:w="6592"/>' in document
            assert '<w:noWrap/>' in document
            assert '微信：Qily259　手机：13450014003 / 15168120722 / 17681788259' in document
            assert '<w:headerReference w:type="default" r:id="rId3"/>' in document
            assert '<w:footerReference w:type="default" r:id="rId4"/>' in document
            assert all(style in styles for style in ('QLTitle', 'QLHeading1', 'QLSectionHeading', 'QLProcedureBody'))
            assert all(target in relationships for target in ('Target="styles.xml"', 'Target="settings.xml"', 'Target="header1.xml"', 'Target="footer1.xml"'))
            assert 'FFFDF7' not in document and 'EDF6F4' not in document
        for name in names:
            if name.endswith('.xml') or name.endswith('.rels'):
                ET.fromstring(archive.read(name))
`;
  const result = spawnSync('python3', ['-c', python, docxPath, xlsxPath], { encoding: 'utf8' });
  fs.rmSync(directory, { recursive: true, force: true });
  assert(result.status === 0, `Office package validation failed: ${result.stderr || result.stdout}`);
}

function validateProductionOrganizationResource() {
  const page = read('qilylean/production-operations-organization.html');
  const knowledge = read('knowledge/index.html');
  const pptx = path.join(root, 'downloads/production-operations-organization/QilyLean-Production-Operations-Organization-1000-2000.pptx');
  const xlsx = path.join(root, 'downloads/production-operations-organization/QilyLean-Production-Operations-Staffing-KPI-1000-2000.xlsx');

  assert(page.includes('QilyLean｜启力精益'), 'Organization resource page is missing QilyLean branding');
  assert(page.includes('qilylean-home-qr.png') && page.includes('qilylean-wechat-qr.png'), 'Organization resource QR assets are missing');
  assert(new Set(page.match(/slides\/slide-\d{2}\.webp/g) || []).size === 21, 'Organization resource does not expose all 21 slide previews');
  assert(new Set(page.match(/sheets\/sheet-\d{2}\.webp/g) || []).size === 10, 'Organization resource does not expose all 10 workbook previews');
  assert(page.includes('QilyLean-Production-Operations-Organization-1000-2000.pptx'), 'Organization PPT download is missing');
  assert(page.includes('QilyLean-Production-Operations-Staffing-KPI-1000-2000.xlsx'), 'Organization workbook download is missing');
  assert(knowledge.includes('/qilylean/production-operations-organization.html'), 'Knowledge hub entry for the organization resource is missing');
  assert(fs.statSync(pptx).size > 100000, 'Organization PPT package is unexpectedly small');
  assert(fs.statSync(xlsx).size > 50000, 'Organization workbook package is unexpectedly small');

  for (let i = 1; i <= 21; i += 1) {
    assert(fs.existsSync(path.join(root, `assets/knowledge/production-operations-organization/slides/slide-${String(i).padStart(2, '0')}.webp`)), `Slide preview ${i} is missing`);
  }
  for (let i = 1; i <= 10; i += 1) {
    assert(fs.existsSync(path.join(root, `assets/knowledge/production-operations-organization/sheets/sheet-${String(i).padStart(2, '0')}.webp`)), `Workbook preview ${i} is missing`);
  }
}

async function main() {
  const homePage = read('index.html');
  const aiPage = read('ai.html');
  const aiClient = read('qilylean-ai.js');
  const worker = read('cloudflare-worker/worker.js');
  const exportCode = read('qilylean-ai-export.js');
  const navigation = read('site-navigation.js');
  const wrangler = read('wrangler.toml');
  const projectViewer = read('projects/project-image-viewer.js');
  const projectStyles = read('projects/project-pages.css');
  const projectIndex = read('projects/index.html');
  const knowledge = read('knowledge/index.html');
  const latest = read('qilylean/latest-brief.js');
  const brief = read('qilylean/daily/2026-07-27.html');
  const index = JSON.parse(read('qilylean/daily/index.json'));

  assert(/id="materialInput"[^>]*\bmultiple\b/.test(aiPage), 'Material input is not configured for multiple files');
  assert(/MAX_ATTACHMENT_COUNT=5/.test(aiClient), 'Client attachment count limit is missing');
  assert(/payload\.attachments=/.test(aiClient), 'Client does not submit the attachments array');
  assert(/https:\/\/api\.qilylean\.com/.test(aiClient), 'AI client primary custom domain is missing');
  assert(/https:\/\/ai-api\.qilylean\.com/.test(aiClient), 'AI client backup custom domain is missing');
  assert(/https:\/\/qilylean-ai\.dinghunter623\.workers\.dev/.test(aiClient), 'AI client disaster-recovery endpoint is missing');
  assert(/orderedApiBases/.test(aiClient), 'AI client multi-route retry sequence is missing');
  assert(!/主链路与备用链路均未能连接/.test(aiClient), 'Legacy two-route Android connection error remains');
  assert(/workers_dev = true/.test(wrangler), 'Cloudflare Workers production endpoint is disabled');
  assert(!/custom_domain = true/.test(wrangler), 'Unprovisioned custom-domain routes must not block Worker deployment');
  assert(/v1\.6\.0-brief-engagement/.test(worker), 'Brief engagement Worker build version is missing');
  assert(/url\.pathname === '\/brief-feedback'/.test(worker), 'Brief rating and sentiment endpoint is missing');
  assert(/url\.pathname === '\/admin\/brief-feedback'/.test(worker), 'Admin brief feedback endpoint is missing');
  assert(/brief-feedback-voter:/.test(worker) && /BRIEF_FEEDBACK_DAILY_IP_LIMIT/.test(worker), 'Brief feedback duplicate or abuse protection is missing');
  assert(/validateAttachments\(payload\.attachments, payload\.attachment\)/.test(worker), 'Worker does not validate multiple attachments');
  assert(/callQwenMixed/.test(worker), 'Worker mixed-material analysis path is missing');
  assert(!/application\/msword|application\/vnd\.ms-excel/.test(exportCode), 'Legacy HTML-disguised Office MIME types remain');
  assert(/\.docx'/.test(exportCode), 'Standard Word extension is missing');
  assert(!/导出 Excel|excel\.textContent|tools\.appendChild\(excel\)/.test(exportCode), 'Excel export menu still exists');
  assert(/--forest:var\(--qily-forest,#0f4b5a\)/.test(homePage), 'Homepage is not bound to the global forest color');
  assert(/--forest:var\(--qily-forest,#0f4b5a\)/.test(aiPage), 'AI page is not bound to the global forest color');
  assert(/\.user \.bubble\{[^}]*background:var\(--qily-forest,#0f4b5a\)/.test(aiPage), 'User message background is not using the global homepage color');
  assert(/word-procedure-v3/.test(aiPage), 'AI page is not loading the revised procedure-style Word exporter');
  const controlledRoutes = navigation.match(/CONTROLLED_ROUTE_PATHS = \[([^\]]*)\]/);
  assert(controlledRoutes, 'Controlled navigation route declaration is missing');
  if (controlledRoutes[1].trim()) {
    assert(/ACCESS_PASSWORD = '259'/.test(navigation), 'Controlled modules are not using the established access password');
    assert(!/function controlledPageConfig\(\) \{ return null; \}/.test(navigation), 'Controlled routes are configured without an access gate');
  } else {
    assert(/function controlledPageConfig\(\) \{ return null; \}/.test(navigation), 'Public page access state is inconsistent');
  }
  ['index.html','moments/index.html','moments/work/index.html','moments/team/index.html','moments/business/index.html','moments/life/index.html'].forEach((file) => {
    assert(/site-navigation\.js\?v=/.test(read(file)), `Global navigation bootstrap is missing: ${file}`);
  });
  assert(/手机长按原图可保存或转发高清版/.test(projectViewer), 'Project image viewer long-press guidance is missing');
  assert(/-webkit-touch-callout:default/.test(projectStyles), 'Project original-image long-press support is missing');
  assert(!/-webkit-user-drag:none/.test(projectStyles), 'Project original-image dragging is still disabled');
  assert(/--project-thumb-size:2cm/.test(projectStyles), 'Project thumbnails are not standardized to 2cm square');
  assert(/project-list-page \.project-list-thumb img/.test(projectViewer), 'Project list thumbnails are not connected to the image viewer');
  assert(/data-image-action="save"/.test(projectViewer), 'Project image viewer save-original action is missing');
  assert(/touchstart/.test(projectViewer) && /touchend/.test(projectViewer), 'Project image viewer swipe navigation is missing');
  assert(/project-pages\.css\?v=20260728-project-thumbnails-v4/.test(projectIndex), 'Project list is not loading the 2cm thumbnail styles');
  assert(/project-image-viewer\.js\?v=20260728-project-thumbnails-v4/.test(projectIndex), 'Project list is not loading the continuous image viewer');
  [
    'projects/automotive-lean/index.html',
    'projects/smed-300t/index.html',
    'projects/mold-warehouse/index.html',
    'projects/fuse-improvement/index.html',
    'projects/factory-layout/index.html',
    'projects/digital-factory/index.html'
  ].forEach((file) => {
    const page = read(file);
    assert(/project-pages\.css\?v=20260728-project-thumbnails-v4/.test(page), `Unified project thumbnail styles are missing: ${file}`);
    assert(/project-image-viewer\.js\?v=20260728-project-thumbnails-v4/.test(page), `Unified project image viewer is missing: ${file}`);
  });
  assert(/data-latest-brief-card/.test(knowledge) && /daily\/index\.json/.test(latest), 'Knowledge page is not bound to the latest brief index');
  assert(index.length > 0 && index.every((item, position) => position === 0 || index[position - 1].date >= item.date), 'Daily brief index is not newest-first');
  assert(knowledge.includes(`/qilylean/daily/${index[0].date}.html`), 'Knowledge hub does not link to the newest daily brief');
  ['防呆法','动改法','双手法','人机法','五五法','流程法','抽样法'].forEach((method) => {
    assert(brief.includes(method), `The July 27 brief is missing ${method}`);
  });
  assert(/五五法（5×5W2H Questioning）/.test(brief), 'The Five-by-Five method is not defined as 5×5W2H');
  assert(/How do？/.test(brief) && /How much？/.test(brief), 'The two H questions are not standardized');
  assert(brief.length > 6000, 'The July 27 IE article is still too shallow');

  validateProductionOrganizationResource();
  await validateOfficePackages();
  process.stdout.write('QilyLean maintenance validation passed.\n');
}

main().catch((error) => {
  console.error(error.stack || error);
  process.exit(1);
});
