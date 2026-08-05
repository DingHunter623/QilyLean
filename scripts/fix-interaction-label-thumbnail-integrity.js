const fs = require('fs');

function read(path) {
  return fs.readFileSync(path, 'utf8');
}

function write(path, content) {
  fs.writeFileSync(path, content.replace(/\r\n/g, '\n'), 'utf8');
}

function replaceMarked(content, start, end, block) {
  const pattern = new RegExp(`${start.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s\\S]*?${end.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\n?`, 'g');
  content = content.replace(pattern, '').trimEnd();
  return `${content}\n\n${block.trim()}\n`;
}

const trustPath = 'site-trust-conversion-v2.css';
const trustStart = '/* QILY-SITEWIDE-TEXT-CONTRAST-INTEGRITY:START';
const trustEnd = '/* QILY-SITEWIDE-TEXT-CONTRAST-INTEGRITY:END */';
const trustBlock = `/* QILY-SITEWIDE-TEXT-CONTRAST-INTEGRITY:START
 * v4：组件自治＋运行时对比巡检。QTC按钮不再继承旧商业交付按钮分类；
 * 所有真实文字控件必须保留可见字号、正常缩进、有效文字填充和足够前景／背景对比。
 */
html body [data-qily-textual-control="true"]{
  opacity:1!important;
  visibility:visible!important;
  filter:none!important;
  mix-blend-mode:normal!important;
  text-shadow:none!important;
  text-indent:0!important;
  clip:auto!important;
  clip-path:none!important;
}
html body [data-qily-textual-control="true"]> :is(span,strong,b,small,em,i,label){
  color:inherit!important;
  -webkit-text-fill-color:currentColor!important;
  opacity:1!important;
  visibility:visible!important;
  filter:none!important;
  text-shadow:none!important;
}
html body [data-qily-auto-contrast="dark"]{
  color:#fff!important;
  -webkit-text-fill-color:#fff!important;
}
html body [data-qily-auto-contrast="light"]{
  color:#073c47!important;
  -webkit-text-fill-color:#073c47!important;
}

/* QTC操作入口由本组件独立管理，禁止旧qily-action-primary规则二次接管。 */
html body .qtc-actions .qtc-action,
html body .qtc-actions .qtc-action.qily-action-primary,
html body .qtc-actions .qtc-action.qily-action-secondary{
  position:relative!important;
  isolation:isolate!important;
  display:inline-flex!important;
  align-items:center!important;
  justify-content:center!important;
  min-width:max-content!important;
  min-height:44px!important;
  padding:9px 17px!important;
  overflow:visible!important;
  border:2px solid var(--qtc-forest)!important;
  border-radius:999px!important;
  color:#fff!important;
  -webkit-text-fill-color:#fff!important;
  background-color:var(--qtc-forest)!important;
  background-image:none!important;
  font-size:15.5px!important;
  font-weight:900!important;
  line-height:1.35!important;
  letter-spacing:normal!important;
  text-indent:0!important;
  text-decoration:none!important;
  white-space:nowrap!important;
  opacity:1!important;
  visibility:visible!important;
  filter:none!important;
  mix-blend-mode:normal!important;
  text-shadow:none!important;
}
html body .qtc-actions .qtc-action.secondary,
html body .qtc-actions .qtc-action.secondary.qily-action-secondary{
  color:var(--qtc-forest)!important;
  -webkit-text-fill-color:var(--qtc-forest)!important;
  background-color:#fff!important;
}
html body .qtc-actions .qtc-action::before,
html body .qtc-actions .qtc-action::after{
  content:none!important;
  display:none!important;
}
html body .qtc-actions .qtc-action>.qtc-action-label{
  position:relative!important;
  z-index:2!important;
  display:inline-flex!important;
  align-items:center!important;
  justify-content:center!important;
  width:auto!important;
  height:auto!important;
  min-width:0!important;
  margin:0!important;
  padding:0!important;
  color:inherit!important;
  -webkit-text-fill-color:currentColor!important;
  background:transparent!important;
  border:0!important;
  font:inherit!important;
  line-height:inherit!important;
  letter-spacing:inherit!important;
  text-indent:0!important;
  white-space:inherit!important;
  opacity:1!important;
  visibility:visible!important;
  filter:none!important;
  transform:none!important;
}
html body .qtc-actions .qtc-action:is(:hover,:focus-visible){
  color:#17322d!important;
  -webkit-text-fill-color:#17322d!important;
  background-color:#ffe39b!important;
  border-color:#c99a3e!important;
  box-shadow:0 10px 24px rgba(202,161,95,.28)!important;
  transform:translateY(-2px)!important;
}
html body .qtc-actions .qtc-action:active{
  color:#fff!important;
  -webkit-text-fill-color:#fff!important;
  background-color:#073c47!important;
  border-color:#073c47!important;
  transform:translateY(0) scale(.98)!important;
}
@media(max-width:560px){
  html body .qtc-actions .qtc-action{width:100%!important;min-width:0!important;white-space:normal!important;text-align:center!important}
}
/* QILY-SITEWIDE-TEXT-CONTRAST-INTEGRITY:END */`;
write(trustPath, replaceMarked(read(trustPath), trustStart, trustEnd, trustBlock));

const projectPath = 'projects/project-pages.css';
const projectStart = '/* QILY-FACTORY-THUMBNAIL-LABEL-SEPARATION:START */';
const projectEnd = '/* QILY-FACTORY-THUMBNAIL-LABEL-SEPARATION:END */';
const projectBlock = `/* QILY-FACTORY-THUMBNAIL-LABEL-SEPARATION:START */
/* 图纸缩略标题与图片物理分离：不使用整块深色底，不与上下行图片边框粘连。 */
.factory-plan-thumb-grid,
.factory-plan-thumb-grid-two{
  column-gap:14px!important;
  row-gap:16px!important;
}
.factory-plan-thumb-grid .factory-plan-preview{
  display:grid!important;
  grid-template-rows:var(--project-thumb-size) auto!important;
  row-gap:7px!important;
  align-content:start!important;
  justify-items:center!important;
  width:var(--project-thumb-size)!important;
  height:auto!important;
  min-height:0!important;
  padding:0 0 2px!important;
  overflow:visible!important;
  color:#0f4b5a!important;
  -webkit-text-fill-color:#0f4b5a!important;
  background:transparent!important;
  border:0!important;
  box-shadow:none!important;
}
.factory-plan-thumb-grid .factory-plan-preview img{
  grid-row:1!important;
  display:block!important;
  width:var(--project-thumb-size)!important;
  height:var(--project-thumb-size)!important;
  margin:0!important;
  border:1px solid var(--qily-line)!important;
  background:#fff!important;
  box-shadow:0 7px 18px rgba(15,75,90,.10)!important;
}
.factory-plan-thumb-grid .factory-plan-preview span{
  position:static!important;
  inset:auto!important;
  grid-row:2!important;
  justify-self:center!important;
  display:inline-flex!important;
  align-items:center!important;
  justify-content:center!important;
  width:max-content!important;
  max-width:calc(var(--project-thumb-size) + 20px)!important;
  min-width:0!important;
  min-height:26px!important;
  margin:0!important;
  padding:4px 9px!important;
  border:1.5px solid #178b94!important;
  border-radius:999px!important;
  color:#0f4b5a!important;
  -webkit-text-fill-color:#0f4b5a!important;
  background:#fff!important;
  box-shadow:0 3px 9px rgba(15,75,90,.07)!important;
  font-size:12px!important;
  font-weight:900!important;
  line-height:1.2!important;
  text-align:center!important;
  white-space:nowrap!important;
  opacity:1!important;
  visibility:visible!important;
  transform:none!important;
}
.factory-plan-thumb-grid .factory-plan-preview:is(:hover,:focus-visible) span{
  color:#17322d!important;
  -webkit-text-fill-color:#17322d!important;
  background:#ffe39b!important;
  border-color:#c99a3e!important;
}
.factory-plan-thumb-grid .factory-plan-preview:active span{
  color:#fff!important;
  -webkit-text-fill-color:#fff!important;
  background:#073c47!important;
  border-color:#073c47!important;
}
/* QILY-FACTORY-THUMBNAIL-LABEL-SEPARATION:END */`;
write(projectPath, replaceMarked(read(projectPath), projectStart, projectEnd, projectBlock));

const visualPath = 'site-visual-closure-v1.js';
let visual = read(visualPath);
visual = visual.replace(
  /d\.querySelectorAll\('a\[href="\\\/projects\\\/qilylean-commercial-deliveries\\\/"\]'\)\.forEach\(function\(link\)\{\s*link\.classList\.add\('qily-action-primary'\);\s*\}\);/,
  `d.querySelectorAll('a[href="/projects/qilylean-commercial-deliveries/"]').forEach(function(link){\n      if(!link.classList.contains('qtc-action'))link.classList.add('qily-action-primary');\n    });`
);
visual = visual.replace(
  /d\.querySelectorAll\('a\[href\*="\\\/projects\\\/qilylean-commercial-deliveries\\\/review-authorization-template"\]'\)\.forEach\(function\(link\)\{\s*link\.classList\.add\('qily-action-secondary'\);\s*\}\);/,
  `d.querySelectorAll('a[href*="/projects/qilylean-commercial-deliveries/review-authorization-template"]').forEach(function(link){\n      if(!link.classList.contains('qtc-action'))link.classList.add('qily-action-secondary');\n    });`
);
write(visualPath, visual);

const navigationPath = 'site-navigation.js';
let navigation = read(navigationPath);
navigation = navigation
  .replace(/global VI, navigation, trust and contrast loader v\d+/, 'global VI, navigation, trust and contrast loader v10')
  .replace(/__qilyGlobalAssetLoaderV\d+/g, '__qilyGlobalAssetLoaderV10')
  .replace(/__qilyNavigationWrapper20260805V\d+/g, '__qilyNavigationWrapper20260805V16')
  .replace(/site-trust-conversion-v2\.css\?v=[^'"\s]+/g, 'site-trust-conversion-v2.css?v=20260805-action-label-v4')
  .replace(/site-trust-conversion-v2\.js\?v=[^'"\s]+/g, 'site-trust-conversion-v2.js?v=20260805-action-label-v3');

const auditEnsure = `    ensureScript('data-qily-text-contrast-audit','v1','/site-text-contrast-audit-v1.js?v=20260805-runtime-audit-v1');`;
if (!navigation.includes("data-qily-text-contrast-audit")) {
  navigation = navigation.replace(
    /(\s+ensureScript\('data-qily-trust-conversion-loader','v2','\/site-trust-conversion-v2\.js\?v=20260805-action-label-v3'\);)/g,
    `$1\n${auditEnsure}`
  );
}
if (!navigation.includes("'site-text-contrast-audit-v1.js?v=20260805-runtime-audit-v1'")) {
  navigation = navigation.replace(
    /('site-trust-conversion-v2\.js\?v=20260805-action-label-v3')/,
    `$1,\n    'site-text-contrast-audit-v1.js?v=20260805-runtime-audit-v1'`
  );
}
write(navigationPath, navigation);

const audit = read('site-text-contrast-audit-v1.js');
if (!audit.includes('normalizeQtcActions') || !audit.includes('data-qily-auto-contrast')) {
  throw new Error('Runtime audit contract is incomplete.');
}
[
  [trustPath, 'qtc-action-label'],
  [trustPath, 'data-qily-auto-contrast'],
  [projectPath, 'QILY-FACTORY-THUMBNAIL-LABEL-SEPARATION'],
  [visualPath, "if(!link.classList.contains('qtc-action'))"],
  [navigationPath, 'data-qily-text-contrast-audit'],
  [navigationPath, '20260805-action-label-v4']
].forEach(function (check) {
  if (!read(check[0]).includes(check[1])) throw new Error(`${check[0]} missing ${check[1]}`);
});

console.log('Interaction labels, runtime text contrast and factory thumbnail separation normalized.');
