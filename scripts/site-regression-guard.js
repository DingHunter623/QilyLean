#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');

function read(rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8');
}
function assert(condition, message) {
  if (!condition) throw new Error(message);
}
function includesAll(content, markers, label) {
  markers.forEach((marker) => assert(content.includes(marker), `${label}: missing ${marker}`));
}

const experience = read('experience/index.html');
const earlyCareer = read('site-early-career-history-v1.js');
const darkCss = read('site-dark-surface-contrast-v1.css');
const music = read('homepage-music-v5.js');
const softNav = read('site-music-persistent-navigation-v1.js');
const careerPublisher = read('scripts/publish-early-career-history.js');
const musicPublisher = read('scripts/publish-primary-contrast-music-continuity.js');

// 1) 履历是“静态源数据”，不允许再依赖客户端 JS 才能出现。
includesAll(experience, [
  'id="career-2019-2025"',
  'id="career-2015-2019"',
  'id="career-2009-2015"',
  'id="career-2006-2009"',
  '2019.07—2025.08｜广东精工智能系统 / 广东高胜互联科技（集团内调动）',
  '2015.07—2019.06｜深圳万润科技·广东恒润光电有限公司（上市公司：万润科技）',
  '2009.07—2015.06｜Cooper Bussmann（现 Eaton Bussmann）保险丝制造',
  '2006.07—2009.06｜PCBA TE工程／IE工程',
  'QILY-STATIC-CAREER-BASELINE:v1'
], 'experience');
assert(!experience.includes('2006.07—2015.06｜东莞库柏电子 / 珠海伟创力制造（欧美企业）'), 'experience: combined 2006-2015 fallback card returned');
includesAll(earlyCareer, ['career-2019-2025', 'career-2015-2019', 'career-2009-2015', 'career-2006-2009'], 'early-career enhancer');
includesAll(careerPublisher, ['QILY-STATIC-CAREER-BASELINE:v1', 'materializeExperienceCareerBaseline'], 'career publisher');

// 2) 深色区域必须强制保持可读，不允许全站文字色阶覆盖深色面板。
includesAll(darkCss, [
  'QILY-REGRESSION-DARK-SURFACE-GUARD:START',
  '.career-chain',
  '[data-qily-dark-surface="true"]',
  '-webkit-text-fill-color:#fff!important',
  '-webkit-text-fill-color:#ffe39b!important'
], 'dark-surface contrast');
includesAll(experience, ['.career-chain strong{color:#ffe39b!important;-webkit-text-fill-color:#ffe39b!important}'], 'career-chain contrast');

// 3) 音乐播放时模块跳转必须走同文档软导航，audio 元素不得因页面卸载而重建。
includesAll(music, [
  'window.__qilyLeanBackgroundMusicV5 = true',
  "var STATE_KEY = 'qilyleanBackgroundMusicStateV2'",
  'window.__qilyLeanMusicWriteState = writeState'
], 'music state');
includesAll(softNav, [
  'window.__qilySoftNavigationV3',
  'siteBackgroundMusic',
  'fetch(url.href',
  'history.pushState',
  "new CustomEvent('qily:softnavigate'",
  'window.__qilyPersistentNavigate'
], 'soft navigation');
includesAll(musicPublisher, [
  "const NAV_VERSION = '20260811-soft-navigation-v3'",
  'qilyPersistentMusicNavigationScript',
  'data-qily-persistent-music-navigation="v3"',
  'soft-navigation marker missing'
], 'music publisher');

// 4) 防呆工作流本身必须存在，形成 push + 定时复检双保险。
const workflow = read('.github/workflows/site-regression-poka-yoke.yml');
includesAll(workflow, [
  'node scripts/apply-site-poka-yoke-v1.js',
  'node scripts/site-regression-guard.js',
  'cron:',
  'contents: write'
], 'poka-yoke workflow');

process.stdout.write('QilyLean regression guard passed: career static baseline, dark-surface readability, music continuity and self-heal workflow are intact.\n');
