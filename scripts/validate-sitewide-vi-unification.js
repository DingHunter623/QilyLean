#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const root = path.resolve(__dirname, '..');

function read(rel){return fs.readFileSync(path.join(root,rel),'utf8');}
function assert(ok,msg){if(!ok){console.error('ERROR: '+msg);process.exitCode=1;}}
function tracked(pattern){
  return execFileSync('git',['ls-files',pattern],{cwd:root,encoding:'utf8'})
    .split(/\r?\n/).filter(Boolean);
}

// Filing follows the document's serving site, never the destination of its links.
for(const rel of tracked('*.html').filter(rel=>!rel.startsWith('cn-site/'))){
  assert(!/湘ICP备|湘公网安备|beian\.(?:miit|mps)\.gov\.cn/.test(read(rel)), rel+' international page must not expose China filing records.');
}

/* 1) International VI authority */
const readability=read('site-visual-readability-v5.css');
assert(readability.includes('--qily-r8-heading-ceiling:clamp(28px,2.25vw,38px)'), 'International H1 must match the CN 38px ceiling.');
assert(readability.includes('font-size:clamp(27px,7.2vw,33px)!important'), 'International mobile H1 must match the CN 33px ceiling.');

const interaction=read('site-interaction-semantics-v1.css');
assert(interaction.includes('QILY-ROUTE-CARD-FEEDBACK-V2'), 'International route-card feedback contract is missing.');
assert(interaction.includes('transform:translateY(-3px)!important'), 'International route-card hover lift is missing.');
assert(interaction.includes('outline:3px solid var(--qily-action-focus'), 'International route-card focus feedback is missing.');
assert(interaction.includes('transform:translateY(1px) scale(.985)!important'), 'International route-card active feedback is missing.');

/* 2) Global Knowledge must inherit the same visual hierarchy and interaction semantics */
const gkCss=read('global-knowledge/global-knowledge-vi-v2.css');
[
  'QILY-GK-TYPE-HIERARCHY-V2',
  'QILY-GK-ROUTE-FEEDBACK-V2',
  'QILY-GK-HEADER-ALIGN-V3',
  'QILY-GK-NAV-TYPE-PARITY-V4',
  '--qily-gk-primary-nav-font-size:20px',
  'grid-template-columns:max-content minmax(0,1fr) 206px!important',
  "content:'返回国际站'!important",
  '--qily-gk-h1:clamp(30px,2.65vw,44px)',
  '--qily-gk-h1:clamp(29px,8vw,38px)',
  'a.card[href]:hover',
  'a.brief[href]:hover',
  'a.card[href]:focus-visible',
  'a.brief[href]:active'
].forEach(m=>assert(gkCss.includes(m),'Global Knowledge VI missing: '+m));

/* QILY-HERO-LABEL-OUTSIDE-MAIN-REGRESSION-GUARD | 2026-10-07
 * Same VI across international training, Global Knowledge and China.
 * Catch the exact missing-main / stale-cache regression reported in visual QA. */
assert(read('site-visual-readability-v5.css').includes('QILY-FULL-SITE-HERO-LABEL-OUTSIDE-MAIN-V2'),
  'International direct-body Hero label parity rule missing.');
assert(read('qilylean/gbt2828.html').includes('site-visual-readability-v5.css?v=20261015-cn-parity-h1-38px-v6'),
  'GB/T 2828 live page must reference the corrected Hero label CSS cache version.');
assert(gkCss.includes('QILY-GK-DARK-HERO-SEMANTIC-LABEL-V6'),
  'Global Knowledge dark Hero label parity rule missing.');
assert(read('cn-site/assets/qilylean-vi-v2.css').includes('QILY-FULL-SITE-HERO-LABEL-VI-V1'),
  'China site must retain light-gold regular-weight dark Hero semantic labels.');

const gkReader=read('global-knowledge/view/index.html');
assert(gkReader.includes('qily-reader-link-cluster'), 'Global Knowledge reader imported-link cluster normalization is missing.');
assert(gkReader.includes('column-gap:3ch!important'), 'Global Knowledge reader link clusters must preserve a three-character gap.');
assert(gkReader.includes('data-qily-reader-source="weibo"'), 'Global Knowledge reader must visibly style approved Weibo source links.');
assert(gkReader.includes("a.setAttribute('data-qily-reader-source','weibo')"), 'Global Knowledge reader must preserve approved Weibo source links.');
assert(gkReader.includes('.content article[id^="lean-"]>small'), 'Global Knowledge Weibo module badge selector is missing.');
assert(gkReader.includes('font-size:18px!important'), 'Weibo module badges must use the visible 18px hierarchy.');
assert(gkReader.includes('.content #lean-tools-feature>ul:first-of-type>li'), 'Global Knowledge ten-tool grid visual rule is missing.');

const gkBriefs=read('global-knowledge/briefs/index.html');
assert(gkBriefs.includes('data-qily-imported-visual="normalized-v1"'), 'Global Knowledge brief reader normalized SVG visual contract is missing.');
assert(gkBriefs.includes('.vi-feedback-return{fill:none;stroke:var(--gold);stroke-width:6'), 'Global Knowledge brief reader feedback rail VI normalization is missing.');

const gkPages=[
  'global-knowledge/index.html',
  'global-knowledge/terminology/index.html',
  'global-knowledge/briefs/index.html',
  'global-knowledge/library/index.html',
  'global-knowledge/view/index.html'
];
for(const rel of gkPages){
  const html=read(rel);
  assert(html.includes('/global-knowledge/global-knowledge-vi-v2.css?v=20261007-gk-hero-gold-regular-v6'), rel+' must load shared Global Knowledge VI after its local skin.');
  if(rel==='global-knowledge/briefs/index.html'){
    assert(html.includes('/global-knowledge/cn-bridge-shell-v1.css?v=20260928-cn-parity-shell-v6-footer-nav-parity'), rel+' must load the China-parity bridge shell.');
    assert(html.includes('/global-knowledge/cn-bridge-shell-v1.js?v=20261007-international-home-v7'), rel+' must load the China-parity footer runtime.');
    assert(!html.includes('/global-knowledge/knowledge-dock-v1.js'), rel+' retired seven-action Global Knowledge dock returned.');
    assert(!html.includes('cn-bridge-footer-brand'), rel+' international bridge footer must not show the CN filing-name button.');
    assert(html.includes('data-qily-stable-order="top,previous,search,current"'), rel+' bridge footer must share four approved actions.');
    assert(/<a class="cn-bridge-brand" href="https:\/\/qilylean\.com\/" aria-label="返回国际站" title="返回国际站">[\s\S]*?<\/a>/.test(html), rel+' bridge logo must return to the international homepage.');
    for(const route of ['https://qilylean.cn/','https://qilylean.cn/lean/','https://qilylean.cn/notes/','https://qilylean.cn/knowledge/','https://qilylean.cn/briefs/','https://qilylean.cn/resources/','https://qilylean.cn/about/']) assert(html.includes('href="'+route+'"'), rel+' bridge navigation missing '+route);
  }else{
    assert(!html.includes('/global-knowledge/knowledge-dock-v1.js'), rel+' retired seven-action Global Knowledge dock returned.');
    assert(html.includes('/global-knowledge/cn-bridge-footer-v1.css?v=20261007-two-actions-no-filing-v4'), rel+' must load the shared selected-briefs footer stylesheet.');
    assert(html.includes('/global-knowledge/cn-bridge-shell-v1.js?v=20261007-international-home-v7'), rel+' must load the shared top/share runtime.');
    assert(/<header class="top">[\s\S]*?<a(?: class="brand")? href="https:\/\/qilylean\.com\/" aria-label="返回国际站" title="返回国际站">QilyLean Global Knowledge<\/a>/.test(html), rel+' Global Knowledge brand must return to the canonical qilylean.com home.');
    assert(html.includes('href="https://qilylean.cn/" rel="noopener">China Knowledge / 精益制造经验分享</a>'), rel+' must expose China Knowledge with the exact filed China-site name for the qilylean.cn route.');
  }
  assert(!html.includes('>中国知识站</a>'), rel+' must not expose the retired China-site name.');
}

const intlReadability=read('site-visual-readability-v5.css');
assert(intlReadability.includes('QILY-SITEWIDE-SMALL-TYPE-GOLD-PARITY-V1'), 'International small-type and gold-label parity authority missing.');
assert(intlReadability.includes('--qily-v5-small:20px'), 'International smallest content floor must be 18px.');
assert(intlReadability.includes('--qily-v5-small-strong:21px'), 'International emphasized small text must be 19px.');
assert(intlReadability.includes('--qily-v5-section-kicker:21px'), 'International chapter/module labels must be 21px.');
assert(intlReadability.includes('--qily-v5-gold-label:#b88b45'), 'International chapter/module labels must use the canonical light gold.');

const pricingLegacy=read('site-navigation-legacy-20260802.js');
const pricingBootstrap=read('site-navigation.js');
assert(pricingLegacy.includes('qilyPublicPricingStyleV5'), 'International pricing runtime V5 style authority missing.');
for(const marker of [
  '.qily-pricing-family strong{color:#073c47;font-size:20px}',
  '.qily-pricing-family span{color:#5f7474;font-size:20px;text-align:right}',
  '.qily-pricing-group-head p{max-width:760px;margin:0;color:#5f7474;font-size:20px;text-align:right}',
  '.qily-price-basis{margin-top:auto;padding-top:13px;color:#8d6a32;font-size:20px',
  '#entry .fine-print,.qily-pricing-note{margin-top:18px;padding:16px 18px;border-left:4px solid #caa15f;background:#eef8f6;color:#315f64;font-size:20px',
  '.qily-pricing-lock-form label{display:grid;flex:1;gap:6px;color:#0f4b5a;font-size:20px'
]) assert(pricingLegacy.includes(marker), 'International pricing small-type VI floor missing: '+marker);
assert(pricingBootstrap.includes('20260927-pricing-type-floor-v25'), 'International pricing runtime cache-bust missing.');

/* 3) China site: same international-style rail + controlled type hierarchy */
const cnCss=read('cn-site/assets/qilylean-vi-v2.css');
const cnBaseCss=read('cn-site/assets/qilylean-vi-v1.css');
const cnRail=read('cn-site/assets/cn-nav-rail-v1.js');
const cnTranslate=read('cn-site/assets/cn-translate-baidu-v1.js');
const cnTranslateCss=read('cn-site/assets/cn-translate-baidu-v1.css');
const workerSocial=read('cloudflare-worker/worker-social.js');
assert(workerSocial.includes("BAIDU_TRANSLATE_URL = 'https://fanyi-api.baidu.com/api/trans/vip/translate'"), 'Baidu translation API endpoint is missing from the translation worker.');
assert(workerSocial.includes("TRANSLATION_CACHE_VERSION = 'v5-provider-aware'"), 'Provider-aware translation cache generation is missing.');
assert(workerSocial.includes('callBaiduTranslation'), 'Baidu translation fallback implementation is missing.');
assert(workerSocial.includes('callYoudaoTranslation'), 'Youdao translation preferred implementation is missing.');
[
  'QILY-CN-NAV-RAIL-V7',
  'QILY-CN-STICKY-HEADER-V1',
  'position:sticky!important',
  'QILY-CN-ROUTE-FEEDBACK-V1',
  'QILY-CN-FILING-FEEDBACK-V2',
  '--qily-nav-scroll-track:#b9d9d4',
  '--qily-nav-scroll-thumb:#0f4b5a',
  '--qily-cn-h1:clamp(27px,7.2vw,33px)',
  '--qily-cn-h2:clamp(19px,5vw,21px)',
  '--qily-cn-h3:clamp(17px,4.5vw,19px)',
  'scrollbar-width:none!important',
  'background:#b9d9d4!important',
  'background:#0f4b5a!important',
  'min-width:104px!important',
  '.qily-primary-nav-scroll-thumb'
].forEach(m=>assert(cnCss.includes(m),'CN unified VI missing: '+m));
assert(!cnRail.includes("rail.type='range'"), 'CN nav rail must not depend on native range behavior.');
assert(cnRail.includes("role','scrollbar'"), 'CN nav rail must expose scrollbar semantics.');
assert(cnRail.includes('qily-primary-nav-scroll-thumb'), 'CN custom nav thumb runtime is missing.');
assert(cnRail.includes("qily-primary-nav-scroll-rail"), 'CN nav rail runtime class is missing.');
assert(cnRail.includes('qily-cn-nav-shell'), 'CN desktop/mobile nav shell is missing.');
assert(cnCss.includes('--qily-cn-primary-nav-font-size:20px'), 'CN primary nav type must match international 20px.');
assert(cnCss.includes('QILY-CN-TYPE-HIERARCHY-V5'), 'CN final typography authority V5 missing.');
assert(cnCss.includes('QILY-CN-ALL-SMALL-COPY-FLOOR-V46'), 'CN V46 small-type and gold-label parity authority missing.');
assert(cnCss.includes('--qily-cn-small:20px'), 'CN smallest content floor must be 18px.');
assert(cnCss.includes('--qily-cn-section-kicker:21px'), 'CN chapter/module labels must be 21px.');
assert(cnCss.includes('--qily-cn-label-gold:#b88b45'), 'CN chapter/module labels must use the canonical light gold.');
assert(cnCss.includes('--qily-cn-h2:clamp(20px,1.25vw,22px)'), 'CN desktop H2 must be capped at 22px.');
assert(cnCss.includes('--qily-cn-h3:clamp(17px,1vw,19px)'), 'CN desktop H3 must be capped at 19px.');
assert(cnBaseCss.includes('clamp(20px,1.25vw,22px)!important'), 'CN base VI must use the restrained 22px section H2 fallback.');
assert(!cnBaseCss.includes('clamp(32px,3vw,48px)!important'), 'CN legacy 48px section H2 regression detected.');
assert(cnCss.includes('QILY-CN-CURRENT-MODULE-V1'), 'CN current-module VI contract is missing.');
assert(cnCss.includes('--qily-cn-primary-nav-active:#0f4b5a'), 'CN current-module fill must match international deep teal.');
assert(cnCss.includes('--qily-cn-primary-nav-active-border:#ffe39b'), 'CN current-module boundary must match international gold.');
assert(cnCss.includes('a[href][aria-current="page"]'), 'CN current-module aria-current selector is missing.');
assert(cnRail.includes('QILY-CN-CURRENT-MODULE-RUNTIME-V1'), 'CN current-module route runtime is missing.');
assert(cnRail.includes("best.setAttribute('aria-current','page')"), 'CN current-module route runtime must set aria-current.');
assert(cnCss.includes('grid-template-areas:"brand nav translate"'), 'CN desktop header three-zone layout is missing.');
assert(cnCss.includes('grid-template-areas:"brand translate" "nav nav"'), 'CN mobile header nav row is missing.');
assert(cnCss.includes('QILY-CN-HEADER-SHELL-PARITY-V3'), 'CN desktop header shell parity marker is missing.');
assert(cnCss.includes('QILY-CN-CONTENT-AXIS-PARITY-V2'), 'CN content-axis parity V2 marker is missing.');
assert(cnCss.includes('QILY-CN-FOOTER-VISUAL-PARITY-V5'), 'CN footer must preserve fixed-bottom international-style visual parity without changing China actions.');
assert(cnCss.includes('--qily-cn-fixed-footer-h:58px'), 'CN fixed footer height must match the international 58px rhythm.');
assert(cnCss.includes('position:fixed!important'), 'CN footer visual parity requires a fixed-bottom footer bar.');
assert(cnCss.includes('min-height:83.4px!important'), 'CN desktop header shell must match the international measured geometry.');
assert(cnRail.includes('mousedown'), 'CN nav rail mouse drag is missing.');
assert(cnRail.includes('mousemove'), 'CN nav rail mouse move runtime is missing.');
assert(cnRail.includes('touchstart'), 'CN nav rail touch drag is missing.');
for(const [key,href,label] of [['capabilities','/archive/profile/capabilities/','能力体系'],['tools','/archive/profile/tools/','改善工具'],['lean','/lean/','精益生产'],['projects','/notes/','代表项目'],['trust','/trust/','信任中心'],['knowledge','/knowledge/','知识资产'],['resources','/resources/','资源协同']]){
  assert(cnRail.includes("key:'"+key+"',href:'"+href+"',label:'"+label+"'"), 'CN navigation must expose noncommercial global module '+label);
}
assert(!cnRail.includes("key:'briefs',href:'/briefs/'"), 'CN brief archive belongs inside knowledge assets, not as a competing primary menu.');
assert(cnRail.includes("data-qily-cn-nav-contract','20260926-v7-bridge'"), 'CN bridge navigation contract runtime is missing.');
assert(cnRail.includes("{key:'contact',href:'/about/',label:'关于我们'}"), 'CN About navigation must use its true page entry.');
assert(cnRail.includes('installNavMouseDrag'), 'CN primary nav direct mouse drag is missing.');
assert(!cnRail.includes('pointerdown'), 'CN nav rail must not depend on PointerEvent drag.');
assert(!cnRail.includes('data-qily-translation-provider'), 'CN nav rail must remain translation-neutral.');
assert(cnTranslate.includes('QilyLean CN In-Page Translation V7'), 'CN in-page translator V3 runtime is missing.');
assert(cnTranslate.includes("data-qily-translation-provider','qilylean-api'"), 'CN translator must declare the QilyLean in-page provider.');
assert(cnTranslate.includes("data-qily-translation-engine','youdao'"), 'CN translator must declare Youdao as its preferred backend engine.');
assert(cnTranslate.includes('concurrency=1'), 'CN translator batch concurrency optimization is missing.');
assert(cnTranslate.includes('API_BASES'), 'CN translator must use the in-page translation API.');
assert(cnTranslate.includes("option(select,'zh-CN','中文简体')"), 'CN translator Simplified Chinese option is missing.');
assert(cnTranslate.includes("option(select,'zh-TW','中文繁体')"), 'CN translator Traditional Chinese option is missing.');
assert(cnTranslate.includes("option(select,'en','English')"), 'CN translator English option is missing.');
assert(cnTranslate.includes("option(select,MORE,'其他')"), 'CN translator More option is missing.');
assert(cnTranslate.includes('target_language:target'), 'CN translator target-language request contract is missing.');
assert(cnTranslateCss.includes('QilyLean CN In-Page Translation UI V3'), 'CN translator V3 UI is missing.');

const cnPages=[...new Set([...tracked('cn-site/*.html'),...tracked('cn-site/**/*.html')])].filter(rel=>{
  if(/googleb7a|baidu_verify/.test(rel)) return false;
  const html=read(rel);
  return /<body/i.test(html)&&/<\/body>/i.test(html);
});
assert(cnPages.length>=17,'Expected at least 17 CN document pages.');
/* CN-FILED-NAME-GOVERNANCE-V1 | public China-site name must equal the ICP filing service name. */
const cnFiledName='精益制造经验分享';
const cnFooterName=cnFiledName;
const cnFooterLegacyName='QilyLean | 启力精益 · '+cnFiledName;
for(const rel of cnPages){
  const html=read(rel);
  assert(html.includes('/assets/site.css?v=20260923-cn-personal-v3-reading'), rel+' must use fresh CN base typography CSS.');
  assert(html.includes('/assets/portal.css?v=20260923-portal-v2-reading'), rel+' must use fresh CN portal typography CSS.');
  const cnViRevision=rel==='cn-site/about/index.html'
    ? '20261014-cn-contact-three-phones-v1'
    : '20261008-cn-vi-v50-cache-revalidation';
  assert(html.includes('/assets/qilylean-vi-v2.css?v='+cnViRevision), rel+' must use current CN VI resource version.');
  assert(html.includes('/assets/cn-nav-rail-v1.js?v=20261021-nav-rail-v23-about'), rel+' must load the international-style nav rail runtime.');
  assert(html.includes('/assets/cn-translate-baidu-v1.css?v=20261017-cn-mainland-nmt-v2'), rel+' must load exactly one CN translator stylesheet.');
  assert(html.includes('/assets/cn-translate-baidu-v1.js?v=20261017-cn-mainland-nmt-v2'), rel+' must load exactly one CN translator runtime.');
  assert(!html.includes(cnFooterLegacyName), rel+' footer must not repeat the QilyLean brand prefix.');
  assert(!html.includes('QilyLean | 启力精益 · 个人制造业知识与实践分享'), rel+' must not restore the retired footer name.');
  assert(!html.includes('个人制造业知识与实践分享'), rel+' must not expose the retired China-site name.');
  if(html.includes('aria-label="主导航"')){
    assert(html.includes('data-qily-cn-nav-contract="20260926-v7-bridge"'), rel+' must use the current CN navigation contract.');
    assert(/<a href="\/trust\/" data-qily-nav-key="trust"[^>]*>信任中心<\/a>/.test(html), rel+' CN trust center must be in the primary navigation.');
    assert(/<a href="\/knowledge\/" data-qily-nav-key="knowledge"[^>]*>知识资产<\/a>/.test(html), rel+' CN primary knowledge asset label must match the global site.');
    assert(!/data-qily-nav-key="experience"/.test(html), rel+' career history belongs inside About instead of primary navigation.');
    assert(/<a href="\/archive\/profile\/capabilities\/" data-qily-nav-key="capabilities"[^>]*>能力体系<\/a>/.test(html), rel+' CN capabilities must have a local entry.');
    assert(!/data-qily-nav-key="briefs"/.test(html), rel+' CN briefs must remain a secondary knowledge entry.');
    assert(/<a href="\/resources\/" data-qily-nav-key="resources"[^>]*>资源协同<\/a>/.test(html), rel+' CN resource entry must use the internal bridge route.');
    assert(!/data-qily-nav-key="(?:briefs|resources)"[^>]*data-qily-external="international"/.test(html), rel+' CN primary navigation must not bypass its internal bridge pages.');
  }
  const title=(html.match(/<title>([^<]*)<\/title>/i)||[])[1]||'';
  assert(title.includes(cnFiledName), rel+' title must include the filed China-site name.');
  // Single-source footer contract: no page-specific generated/destination-shell clones.
  assert(html.includes('id="qilyCnFooterActionsV1Stylesheet" rel="stylesheet" href="/assets/cn-footer-actions-v1.css?v=20261023-cn-public-footer-source-v1"'), rel+' must load the canonical public footer stylesheet.');
  // Checked-in source pages may still use the previous cache address until CN's
  // deterministic materializer refreshes them during deployment. Both point to
  // the same strictly checked local asset; production requires the new cache tag.
  assert(/src="\/assets\/cn-footer-actions-v1\.js\?v=20261023-cn-public-footer-source-v1(?:&share=20261028-cn-copy-first-v1)?"/.test(html), rel+' must load the canonical public footer behavior.');
  assert(!html.includes('destination-shell/assets/cn-footer-actions-v1.css'), rel+' must not load forked footer CSS.');
  const footerBlock=(html.match(/<footer class="footer"(?: data-qily-footer-filing="none")?>[\s\S]*?<\/footer>/)||[])[0]||'';
  assert(footerBlock, rel+' must keep the shared China footer component.');
  assert(!footerBlock.includes('class="footer-home"'), rel+' retired footer site label must be removed.');
  const footerActions=[...footerBlock.matchAll(/data-qily-footer-action="([^"]+)"/g)].map(m=>m[1]);
  assert(JSON.stringify(footerActions)===JSON.stringify(['top','previous','search','current']), rel+' China footer must retain exactly four approved buttons.');
  const filingLinks=[...footerBlock.matchAll(/<a\b[^>]*href=["']https:\/\/beian\.(?:miit|mps)\.gov\.cn\/[^"']*["'][^>]*>/g)];
  assert(!footerBlock.includes('data-qily-footer-filing="none"'), rel+' China-domain pages must not use a filing-free footer.');
  assert(filingLinks.length===2, rel+' must retain exactly two official filing links in the footer.');
  for(const [link] of filingLinks){
    assert(/target="_blank"/.test(link), rel+' filing query must open in a new tab.');
    assert(/rel="noopener noreferrer"/.test(link), rel+' filing query must isolate the external tab.');
    assert(/title="[^"]*新标签页打开[^"]*"/.test(link), rel+' filing query must explain its new-tab behavior.');
  }
}


const cnFooterCss=read('cn-site/assets/cn-footer-actions-v1.css');
const cnFooterJs=read('cn-site/assets/cn-footer-actions-v1.js');
assert(cnFooterCss.includes('QilyLean CN Footer Actions V10'), 'CN base footer stylesheet missing.');
assert(cnFooterCss.includes('QILY-CN-SHARED-SEVEN-ACTIONS-V2:START'), 'Shared footer visual owner missing.');
assert(cnFooterCss.includes('QILY-CN-FIVE-ACTIONS-PARITY-V1'), 'CN shared four-action geometry missing.');
assert(cnFooterCss.includes('display:flex!important;flex-wrap:nowrap!important;justify-content:flex-start!important;align-items:center!important;'), 'Four shared controls must use left-aligned intrinsic widths.');
assert(cnFooterCss.includes('font:500 14px/1.3'), 'CN filing font must remain readable below the controls.');
assert(cnFooterCss.includes('@media(max-width:760px)'), 'CN responsive footer not declared.');
// Mainland share uses the international copy-first semantics. The only approved
// byte-level runtime differences are derived and verified by the CN generator;
// geometry/order, source asset and all other actions remain shared.
const approvedCnFooterRuntime=require('./materialize-cn-footer-actions-v2.js').runtime;
assert(cnFooterJs===approvedCnFooterRuntime, 'China must deploy the exactly approved generated copy-first runtime.');
assert(cnFooterCss.includes('QILY-CN-FIVE-ACTIONS-PARITY-V1'), 'CN shared four-action footer VI missing.');
assert(cnFooterJs.includes("var CN_ORDER=['top','previous','search','current'];"), 'CN footer must expose exactly four actions.');
assert(cnFooterJs.includes("['回到顶部']"), 'CN top action must be labelled 回到顶部.');
assert(cnFooterJs.includes('activeOrder()'), 'CN runtime must not restore removed actions.');
assert(cnFooterJs.includes("'https://qilylean.com/contact/'"), 'China footer Contact must open international full contact experience.');

const cnHome=read('cn-site/index.html');
for(const marker of [
  '<title>精益制造经验分享｜QilyLean | 启力精益｜制造工程、精益生产与数智工厂知识站</title>',
  '"name":"精益制造经验分享"'
]) assert(cnHome.includes(marker),'CN home filed-name marker missing: '+marker);
if(cnHome.includes('data-cn-source-parity="v1"')){
  assert(cnHome.includes('data-cn-source-content="index.html"'),'CN cloned homepage must retain the source main.');
  assert(cnHome.includes('href="/knowledge/" data-qily-nav-key="knowledge"'),'CN cloned knowledge navigation must remain local.');
  assert(cnHome.includes('湘ICP备2026041143号-1')&&cnHome.includes('湘公网安备43020002000443号'),'CN cloned homepage must retain both filings.');
}else{
  for(const marker of ['<p class="eyebrow">LEAN MANUFACTURING EXPERIENCE | 精益制造经验分享</p>','<h2>精益制造经验分享</h2>']) assert(cnHome.includes(marker),'CN legacy home filed-name marker missing: '+marker);
  assert(cnHome.includes('<a href="/knowledge/" title="中国站制造知识索引">进入知识索引 →</a>'),'CN knowledge network must link to the local professional index without international business routing.');
}
assert(!cnHome.includes('QILYLEAN CHINA｜'),'CN home must not prefix the filed site name with a retired alias.');
assert(!cnHome.includes('个人制造业知识与实践分享'),'CN home retired site name returned.');

const cnAbout=read('cn-site/about/index.html');
assert(cnAbout.includes('<h1>关于“精益制造经验分享”</h1>'),'CN About must use the filed site name.');

const resourcePublic=read('links/cn-public/index.html');
assert(resourcePublic.includes('.wrap{width:min(1180px,calc(100% - 36px));max-width:1180px;margin:auto}'), 'Resource collaboration public entry must use the canonical 1180px content axis.');
assert(resourcePublic.includes('/site-content-axis-v1.css?v=20260822-sitewide-visual-axis-v5'), 'Resource collaboration public entry must load the sitewide 1180px axis authority.');
assert(resourcePublic.includes('/site-link-standard-v2.css?v=20260803-nav-four-border-v6'), 'Resource collaboration cross-site actions must inherit the shared global link/VI standard.');
assert(!resourcePublic.includes('.button.primary{background:#0f4b5a;color:#fff}'), 'Resource collaboration must not restore a page-specific primary-button visual.');
assert(resourcePublic.includes('id="qilyResourcePublicTypeAuthorityV2"'), 'Resource collaboration public entry final typography authority is missing.');
assert(resourcePublic.includes('data-qily-resource-public="v2"'), 'Resource collaboration public entry body authority marker is missing.');
assert(resourcePublic.includes('font-size:clamp(28px,2vw,34px)!important'), 'Resource collaboration public entry H1 must use the reduced restrained hierarchy.');
assert(resourcePublic.includes('.hero p{width:100%;max-width:none'), 'Resource collaboration hero copy must use the same content-frame width as the body.');
assert(resourcePublic.includes('font-size:clamp(18px,1.15vw,21px)!important'), 'Resource collaboration card headings must remain at or below 21px.');
assert(!resourcePublic.includes('font-size:clamp(30px,5vw,52px)'), 'Resource collaboration oversized H1 regression detected.');
assert(resourcePublic.includes('/global-knowledge/cn-bridge-shell-v1.css?v=20260928-cn-parity-shell-v6-footer-nav-parity'), 'Resource collaboration public entry must load the China-parity bridge shell.');
assert(resourcePublic.includes('/global-knowledge/cn-bridge-shell-v1.js?v=20261007-international-home-v7'), 'Resource collaboration public entry must load the China-parity footer runtime.');
assert(!resourcePublic.includes('cn-bridge-footer-brand'), 'Resource collaboration public footer must not show China filing name.');
assert(resourcePublic.includes('data-qily-stable-order="top,previous,search,current"'), 'Resource collaboration must share the four-action footer.');
assert(!resourcePublic.includes('class="cn-bridge-brand" href="https://qilylean.cn/"'), 'Resource collaboration logo must not jump to China site.');
assert(!resourcePublic.includes('data-action="home"'), 'Resource collaboration footer must not restore an international Home dock action.');
assert(/<a class="cn-bridge-brand" href="https:\/\/qilylean\.com\/" aria-label="返回国际站" title="返回国际站">[\s\S]*?<\/a>/.test(resourcePublic), 'Resource collaboration bridge logo must return to the international homepage.');
assert(resourcePublic.includes('/site-dock-share-runtime-v1.js?v=20260906-authority-v58-mobile-swipe-fixed-bottom&patch=20261022-four-actions-v1&share=20261031-copy-first-v1'), 'Resource collaboration must use the canonical four-action runtime.');
for(const route of ['https://qilylean.cn/','https://qilylean.cn/lean/','https://qilylean.cn/notes/','https://qilylean.cn/knowledge/','https://qilylean.cn/briefs/','https://qilylean.cn/resources/','https://qilylean.cn/about/']) assert(resourcePublic.includes('href="'+route+'"'), 'Resource collaboration China-parity navigation missing '+route);

const linksPage=read('links/index.html');
assert(linksPage.includes('<strong>精益制造经验分享（QilyLean | 启力精益中国站）：</strong>'),'International links page must expose the filed China-site name.');
assert(linksPage.includes('进入精益制造经验分享 ↗'),'International links page CTA must use the filed China-site name.');
assert(linksPage.includes('qilylean.cn 网站名称为“精益制造经验分享”'),'International links page description must state the filed China-site name.');

/* 4) Previous public-copy governance remains mandatory. */
assert(fs.existsSync(path.join(root,'scripts/validate-public-copy-governance.js')), 'Previous public-copy governance gate must remain present.');
assert(fs.existsSync(path.join(root,'.github/workflows/validate-public-copy-governance.yml')), 'Previous public-copy governance workflow must remain present.');

if(process.exitCode) process.exit(process.exitCode);
console.log('Sitewide VI governance passed: international interaction/type authority, Global Knowledge shared VI, and CN deep-teal rail and single-owner in-page translation header are aligned.');

// Public footers share one typography source across the international and CN deployments.
const publicFooterType=read('site-public-footer-type-v1.css');
assert(publicFooterType===read('cn-site/site-public-footer-type-v1.css'), 'CN public footer deployment copy must equal the canonical stylesheet.');
assert(publicFooterType.includes('-webkit-font-smoothing:antialiased!important'), 'Public footer must use international menu antialiasing.');
assert(publicFooterType.includes('text-rendering:auto!important'), 'Public footer must use international menu text rendering.');
const publicFooterLink='/site-public-footer-type-v1.css?v=20261021-footer-type-v4';
function checkPublicFooterLinks(dir){
  for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
    const rel=path.join(dir,entry.name);
    if(entry.isDirectory()) checkPublicFooterLinks(rel);
    else if(entry.name.endsWith('.html')){
      const html=read(rel);
      if(html.includes('<footer class="footer">')||html.includes('<footer class="cn-bridge-footer">')){
        assert(html.includes(publicFooterLink), rel+' must load the shared public footer typography version.');
        assert((html.match(/id="qilyPublicFooterTypeV1"/g)||[]).length===1, rel+' must load the public footer stylesheet exactly once.');
      }
    }
  }
}
checkPublicFooterLinks('cn-site');
checkPublicFooterLinks('global-knowledge');
checkPublicFooterLinks('links/cn-public');

// Dual-site contact authority and career section live inside About.
for(const [p,target] of [['about/index.html','/experience/'],['cn-site/about/index.html','/archive/profile/experience/']]){
 const html=read(p);
 for(const v of ['data-qily-contact-parity="dual-v1"','qilylean-com-qr.svg','qilylean-cn-qr.svg','qilylean-wechat-qr.png','admin@qilylean.com','id="experience"','href="'+target+'"'])
  assert(html.includes(v),p+' missing About authority '+v);
}
