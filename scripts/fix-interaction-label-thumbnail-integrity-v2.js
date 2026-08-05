const fs = require('fs');

function read(path) { return fs.readFileSync(path, 'utf8'); }
function write(path, content) { fs.writeFileSync(path, content.replace(/\r\n/g, '\n'), 'utf8'); }
function escapeRegExp(value) { return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
function replaceMarked(content, start, end, block) {
  const pattern = new RegExp(`${escapeRegExp(start)}[\\s\\S]*?${escapeRegExp(end)}\\n?`, 'g');
  return `${content.replace(pattern, '').trimEnd()}\n\n${block.trim()}\n`;
}
function extractTemplate(source, name) {
  const startMarker = 'const ' + name + ' = `';
  const start = source.indexOf(startMarker);
  if (start < 0) throw new Error(`Unable to locate ${name}`);
  const contentStart = start + startMarker.length;
  const end = source.indexOf('`;', contentStart);
  if (end < 0) throw new Error(`Unable to close ${name}`);
  return source.slice(contentStart, end);
}

const source = read('scripts/fix-interaction-label-thumbnail-integrity.js');
const trustBlock = extractTemplate(source, 'trustBlock');
const projectBlock = extractTemplate(source, 'projectBlock');

const trustPath = 'site-trust-conversion-v2.css';
write(trustPath, replaceMarked(
  read(trustPath),
  '/* QILY-SITEWIDE-TEXT-CONTRAST-INTEGRITY:START',
  '/* QILY-SITEWIDE-TEXT-CONTRAST-INTEGRITY:END */',
  trustBlock
));

const projectPath = 'projects/project-pages.css';
write(projectPath, replaceMarked(
  read(projectPath),
  '/* QILY-FACTORY-THUMBNAIL-LABEL-SEPARATION:START */',
  '/* QILY-FACTORY-THUMBNAIL-LABEL-SEPARATION:END */',
  projectBlock
));

const visualPath = 'site-visual-closure-v1.js';
let visual = read(visualPath);
const primaryOld = `    d.querySelectorAll('a[href="/projects/qilylean-commercial-deliveries/"]').forEach(function(link){
      link.classList.add('qily-action-primary');
    });`;
const primaryNew = `    d.querySelectorAll('a[href="/projects/qilylean-commercial-deliveries/"]').forEach(function(link){
      if(!link.classList.contains('qtc-action'))link.classList.add('qily-action-primary');
    });`;
const secondaryOld = `    d.querySelectorAll('a[href*="/projects/qilylean-commercial-deliveries/review-authorization-template"]').forEach(function(link){
      link.classList.add('qily-action-secondary');
    });`;
const secondaryNew = `    d.querySelectorAll('a[href*="/projects/qilylean-commercial-deliveries/review-authorization-template"]').forEach(function(link){
      if(!link.classList.contains('qtc-action'))link.classList.add('qily-action-secondary');
    });`;
if (visual.includes(primaryOld)) visual = visual.replace(primaryOld, primaryNew);
if (visual.includes(secondaryOld)) visual = visual.replace(secondaryOld, secondaryNew);
write(visualPath, visual);

const navigationPath = 'site-navigation.js';
let navigation = read(navigationPath)
  .replace(/global VI, navigation, trust and contrast loader v\d+/, 'global VI, navigation, trust and contrast loader v10')
  .replace(/__qilyGlobalAssetLoaderV\d+/g, '__qilyGlobalAssetLoaderV10')
  .replace(/__qilyNavigationWrapper20260805V\d+/g, '__qilyNavigationWrapper20260805V16')
  .replace(/site-trust-conversion-v2\.css\?v=[^'"\s]+/g, 'site-trust-conversion-v2.css?v=20260805-action-label-v4')
  .replace(/site-trust-conversion-v2\.js\?v=[^'"\s]+/g, 'site-trust-conversion-v2.js?v=20260805-action-label-v3');

const ensureAudit = `    ensureScript('data-qily-text-contrast-audit','v1','/site-text-contrast-audit-v1.js?v=20260805-runtime-audit-v1');`;
if (!navigation.includes("ensureScript('data-qily-text-contrast-audit'")) {
  navigation = navigation.replace(
    /(\s+ensureScript\('data-qily-trust-conversion-loader','v2','\/site-trust-conversion-v2\.js\?v=20260805-action-label-v3'\);)/g,
    `$1\n${ensureAudit}`
  );
}
if (!navigation.includes("'site-text-contrast-audit-v1.js?v=20260805-runtime-audit-v1'")) {
  navigation = navigation.replace(
    /('site-trust-conversion-v2\.js\?v=20260805-action-label-v3')/,
    `$1,\n    'site-text-contrast-audit-v1.js?v=20260805-runtime-audit-v1'`
  );
}
write(navigationPath, navigation);

const checks = [
  [trustPath, 'qtc-action-label'],
  [trustPath, 'data-qily-auto-contrast'],
  [projectPath, 'QILY-FACTORY-THUMBNAIL-LABEL-SEPARATION'],
  [visualPath, "if(!link.classList.contains('qtc-action'))"],
  [navigationPath, "ensureScript('data-qily-text-contrast-audit'"],
  [navigationPath, '20260805-action-label-v4'],
  ['site-text-contrast-audit-v1.js', 'normalizeQtcActions']
];
checks.forEach(([path, marker]) => {
  if (!read(path).includes(marker)) throw new Error(`${path} missing ${marker}`);
});

console.log('Interaction labels, runtime contrast audit and thumbnail separation materialized.');
