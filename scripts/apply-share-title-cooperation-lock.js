#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

function read(file) {
  return fs.readFileSync(path.join(root, file), 'utf8');
}

function write(file, content) {
  fs.writeFileSync(path.join(root, file), content);
}

// 1) “分享当前页”复制网页标题 + 网址；项目合作页增加与履历主线相同的 259 口令门禁。
let navigation = read('site-navigation.js');

navigation = navigation
  .replace("var SHARED_ASSET_VERSION = '20260724-global-type-v1';", "var SHARED_ASSET_VERSION = '20260724-share-lock-v1';")
  .replace("var VISUAL_SCALE_VERSION = '20260724-global-type-v1';", "var VISUAL_SCALE_VERSION = '20260724-share-lock-v1';");

const oldShare = `  function shareCurrentPage() {
    var title = document.title || 'QilyLean';
    var url = location.href;
    if (isMobileDevice() && navigator.share) {
      return navigator.share({ title: title, text: title, url: url }).then(function () {
        showToast('已调起系统分享');
      }).catch(function (error) {
        if (error && error.name === 'AbortError') return;
        return copyText(url).then(function () { showToast('当前页网址已复制'); });
      });
    }
    return copyText(url).then(function () { showToast('当前页网址已复制'); });
  }
`;

const newShare = `  function shareCurrentPage() {
    var title = document.title || 'QilyLean';
    var url = location.href;
    var shareText = title + '\\n' + url;
    if (isMobileDevice() && navigator.share) {
      return navigator.share({ title: title, text: title, url: url }).then(function () {
        showToast('已调起系统分享');
      }).catch(function (error) {
        if (error && error.name === 'AbortError') return;
        return copyText(shareText).then(function () { showToast('网页标题及网址已复制'); });
      });
    }
    return copyText(shareText).then(function () { showToast('网页标题及网址已复制'); });
  }
`;

if (!navigation.includes(oldShare)) throw new Error('未找到“分享当前页”原始逻辑');
navigation = navigation.replace(oldShare, newShare);

const lockFunction = `
  function protectCooperationPage() {
    var path = normalizedPath(location.pathname);
    if (path.indexOf('/cooperation/') !== 0) return;

    try {
      if (sessionStorage.getItem('cooperationUnlocked') === '1') return;
    } catch (error) {}

    var main = document.querySelector('main');
    if (!main || document.getElementById('cooperationAccessGate')) return;
    var footer = document.querySelector('footer.module-footer,footer');
    main.hidden = true;
    if (footer) footer.hidden = true;

    var robots = document.head.querySelector('meta[name="robots"]');
    if (!robots) {
      robots = document.createElement('meta');
      robots.name = 'robots';
      document.head.appendChild(robots);
    }
    robots.content = 'noindex,nofollow,noarchive';

    var style = document.createElement('style');
    style.id = 'cooperationLockStyle';
    style.textContent = '.cooperation-access-gate{min-height:calc(100vh - 72px)}.cooperation-lock-card{max-width:760px;margin:0 auto;padding:30px;border:1px solid var(--qily-line,#d5e4e3);background:#fff;box-shadow:0 14px 36px rgba(15,75,90,.1)}.cooperation-lock-card h2{margin:0 0 12px;color:var(--qily-deep,#0f4b5a)}.cooperation-lock-card p{margin:0 0 18px;color:var(--qily-muted,#5f7474);font-size:19px;line-height:1.76}.cooperation-lock-form{display:flex;gap:10px;flex-wrap:wrap}.cooperation-lock-input{flex:1;min-width:220px;padding:12px 14px;border:1px solid var(--qily-line,#d5e4e3);font:inherit}.cooperation-lock-btn{padding:12px 18px;border:0;background:var(--qily-deep,#0f4b5a);color:#fff;font:inherit;font-weight:900;cursor:pointer}.cooperation-lock-msg{min-height:28px;margin-top:10px;color:#9e4a34;font-weight:850}@media(max-width:620px){.cooperation-lock-card{padding:22px}.cooperation-lock-input,.cooperation-lock-btn{width:100%;min-width:0}}';
    document.head.appendChild(style);

    var gate = document.createElement('main');
    gate.id = 'cooperationAccessGate';
    gate.className = 'cooperation-access-gate';
    gate.innerHTML = '<section class="module-hero"><div class="module-inner"><span class="module-eyebrow">Controlled Access / Project Cooperation</span><h1>项目合作（加密）</h1><p class="module-lead">项目合作内容暂为受控访问，输入与履历主线相同的访问口令后查看。</p></div></section><section class="module-section alt"><div class="module-inner"><div class="cooperation-lock-card"><h2>访问项目合作</h2><p>本页包含企业问题初筛、合作范围、服务边界、项目交付方式及联系入口。请输入访问口令后查看完整内容。</p><div class="cooperation-lock-form"><input id="cooperationPassword" class="cooperation-lock-input" type="password" inputmode="numeric" autocomplete="current-password" aria-label="项目合作访问口令" placeholder="请输入访问密码"><button id="cooperationUnlock" class="cooperation-lock-btn" type="button">查看项目合作</button></div><div id="cooperationLockMessage" class="cooperation-lock-msg" aria-live="polite"></div></div></div></section>';
    main.parentNode.insertBefore(gate, main);

    var input = document.getElementById('cooperationPassword');
    var button = document.getElementById('cooperationUnlock');
    var message = document.getElementById('cooperationLockMessage');

    function unlock() {
      if ((input.value || '').trim() !== '259') {
        message.textContent = '密码不正确，请重新输入。';
        input.select();
        return;
      }
      try { sessionStorage.setItem('cooperationUnlocked', '1'); } catch (error) {}
      gate.remove();
      main.hidden = false;
      if (footer) footer.hidden = false;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    button.addEventListener('click', unlock);
    input.addEventListener('keydown', function (event) { if (event.key === 'Enter') unlock(); });
  }
`;

const lockMarker = '\n  function loadWeChatQr() {';
if (!navigation.includes('function protectCooperationPage()')) {
  if (!navigation.includes(lockMarker)) throw new Error('未找到项目合作门禁插入位置');
  navigation = navigation.replace(lockMarker, lockFunction + lockMarker);
}

navigation = navigation.replace(
  "        if (target.origin !== location.origin || normalizedPath(target.pathname) === normalizedPath(location.pathname)) return;",
  "        if (target.origin !== location.origin || normalizedPath(target.pathname) === normalizedPath(location.pathname)) return;\n        if (normalizedPath(target.pathname) === '/cooperation/') return;"
);

navigation = navigation.replace(
  "    buildNavigation();\n    enableNavigationPrefetch();\n    buildDock();",
  "    buildNavigation();\n    protectCooperationPage();\n    enableNavigationPrefetch();\n    buildDock();"
);

if (!navigation.includes("var shareText = title + '\\n' + url;")) throw new Error('标题与网址复制逻辑未写入');
if (!navigation.includes('function protectCooperationPage()')) throw new Error('项目合作门禁未写入');
if (!navigation.includes('cooperationUnlocked')) throw new Error('项目合作会话解锁状态未写入');
write('site-navigation.js', navigation);

// 2) 项目合作不进入本站搜索索引。
let search = read('site-search.js');
search = search.replace("    '/cooperation/',\n", '');
search = search.replace(
  '    var all = uniqueUrls(fallback.concat(urls));',
  "    var all = uniqueUrls(fallback.concat(urls)).filter(function (url) { return url !== '/cooperation/'; });"
);
search = search.replace(/site-search-v1/g, 'site-search-v2');
if (search.includes("'/cooperation/'")) throw new Error('项目合作仍存在于本站搜索备用地址');
write('site-search.js', search);

// 3) 项目合作静态页面标记为不建立公开索引。
let cooperation = read('cooperation/index.html');
cooperation = cooperation.replace(
  '<meta name="robots" content="index,follow,max-image-preview:large">',
  '<meta name="robots" content="noindex,nofollow,noarchive">'
);
if (!cooperation.includes('noindex,nofollow,noarchive')) throw new Error('项目合作 noindex 未写入');
write('cooperation/index.html', cooperation);

// 4) 从公开 sitemap 移出项目合作。
let sitemap = read('sitemap.xml');
sitemap = sitemap.replace(/^\s*<url><loc>https:\/\/qilylean\.com\/cooperation\/<\/loc>.*<\/url>\s*\n/m, '');
if (sitemap.includes('https://qilylean.com/cooperation/')) throw new Error('项目合作仍存在于 sitemap');
write('sitemap.xml', sitemap);

process.stdout.write('Applied title+URL sharing and password-protected cooperation access.\n');
