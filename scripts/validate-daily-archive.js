#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { archiveStart, archiveEnd, careerTimeline } = require('./daily-engineering-archive');
const { guides, resolveTopicKey, resolveIntegration, topicIntegrationProfiles } = require('./enhance-daily-archive');

const root = path.resolve(__dirname, '..');
const dailyDir = path.join(root, 'qilylean', 'daily');
const assetDir = path.join(root, 'qilylean', 'assets');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function dayCount(start, end) {
  return Math.round((new Date(`${end}T00:00:00Z`) - new Date(`${start}T00:00:00Z`)) / 86400000) + 1;
}

function previousDay(date) {
  const value = new Date(`${date}T00:00:00Z`);
  value.setUTCDate(value.getUTCDate() - 1);
  return value.toISOString().slice(0, 10);
}

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function main() {
  const index = JSON.parse(read('qilylean/daily/index.json'));
  const expectedArchive = dayCount(archiveStart, archiveEnd);
  const archive = index.filter((item) => item.date <= archiveEnd);
  const recent = index.filter((item) => item.date > archiveEnd);
  const productTerms = ['电子烟', '游戏机手柄', '电磁阀', '新能源负极材料', '负极材料', '逆变器', '汽车电子', '整流器', '继电器', '小家电', '汽车座椅开关总成', '汽车座椅开关', '座椅开关'];
  const requiredEngineeringThemes = ['PE工程', 'IE方法', 'ME工程', 'JIT', 'PDCA', 'PQCD', 'OEE', 'NPI四阶段', '精益物流', 'Kaizen'];

  assert(index.length > expectedArchive, 'Archive does not include the recent period');
  assert(index[0].date === '2026-07-29', `Latest daily brief must be 2026-07-29; found ${index[0].date}`);
  assert(archive.length === expectedArchive, `Expected ${expectedArchive} archive briefs; found ${archive.length}`);
  assert(index[index.length - 1].date === archiveStart, `Archive must begin on ${archiveStart}`);
  assert(archive[0].date === archiveEnd, `First archive period must end on ${archiveEnd}`);
  assert(recent[recent.length - 1].date === '2025-12-19', 'Recent period must begin on 2025-12-19');
  const publicFields = ['date', 'dayNo', 'summary', 'theme', 'title'];
  assert(index.every((item) => Object.keys(item).sort().join(',') === publicFields.join(',')), 'Public index contains unexpected classification fields');
  assert(new Set(index.map((item) => item.date)).size === index.length, 'Daily index contains duplicate dates');
  assert(new Set(archive.map((item) => item.title)).size === archive.length, 'Daily brief titles are not unique');
  assert(archive.every((item) => !item.title.includes('｜')), 'Archive titles still use the former uniform pipe pattern');
  assert(archive.every((item) => !productTerms.some((term) => `${item.title} ${item.summary} ${item.theme}`.includes(term))), 'Archive index still exposes product-led daily wording');
  requiredEngineeringThemes.forEach((theme) => {
    assert(archive.some((item) => item.theme === theme), `Engineering theme is missing from the long-term archive: ${theme}`);
  });
  assert(Object.keys(guides).every((theme) => topicIntegrationProfiles[theme]), 'A daily engineering theme has no cross-functional integration profile');
  assert(recent.every((item) => resolveTopicKey(item.theme)), 'A recent daily brief theme cannot be mapped to a professional training logic');
  const titleShape = (title) => title.replace(/[\u3400-\u9fffA-Za-z0-9／-]+/g, '字');
  let sameShapeRun = 1;
  let longestShapeRun = 1;
  for (let position = 1; position < archive.length; position += 1) {
    sameShapeRun = titleShape(archive[position].title) === titleShape(archive[position - 1].title) ? sameShapeRun + 1 : 1;
    longestShapeRun = Math.max(longestShapeRun, sameShapeRun);
  }
  assert(longestShapeRun <= 2, `Archive title sentence patterns repeat ${longestShapeRun} times consecutively`);

  for (let position = 1; position < index.length; position += 1) {
    assert(index[position].date === previousDay(index[position - 1].date), `Archive gap after ${index[position - 1].date}`);
  }

  archive.forEach((item) => {
    const pagePath = path.join(dailyDir, `${item.date}.html`);
    const assetPath = path.join(assetDir, `daily-${item.date}.svg`);
    assert(fs.existsSync(pagePath), `Daily page is missing: ${item.date}`);
    assert(fs.existsSync(assetPath), `Daily visual is missing: ${item.date}`);
    assert(fs.statSync(pagePath).size > 6500, `Daily page is unexpectedly shallow: ${item.date}`);
    assert(fs.statSync(assetPath).size > 1000, `Daily visual is unexpectedly small: ${item.date}`);
    assert(read(`qilylean/daily/${item.date}.html`).includes(`主责：${resolveIntegration(item.theme).owner}`), `Cross-functional owner does not match the topic: ${item.date}`);
  });

  const samples = [
    '2019-07-10',
    '2020-01-01',
    '2021-06-18',
    '2022-12-31',
    '2023-07-10',
    '2024-05-01',
    '2025-12-18'
  ];
  samples.forEach((date) => {
    const page = read(`qilylean/daily/${date}.html`);
    assert((page.match(/<h3>/g) || []).length >= 9, `Engineering depth is missing: ${date}`);
    assert(page.includes('class="owner-grid"') && page.includes('工程者手记'), `Professional closure is missing: ${date}`);
    assert(page.includes('/knowledge/') && page.includes('/projects/') && page.includes('/ai.html') && page.includes('/cooperation/'), `QilyLean module links are incomplete: ${date}`);
    assert(page.includes(`https://qilylean.com/qilylean/daily/${date}.html`), `Canonical URL is missing: ${date}`);
    assert(page.includes(`<img src="/qilylean/assets/daily-${date}.svg"`), `External share visual is missing: ${date}`);
    assert(page.includes('daily-briefs.css?v=20260729-engineering-system-v11'), `Responsive archive stylesheet is not pinned: ${date}`);
    assert(page.includes(`/qilylean/daily-insights.html?brief=${date}#brief-consultation`), `Brief consultation entry is missing: ${date}`);
    assert(!page.includes('评价本期简报') && page.includes('留言交流'), `Direct brief message-only entry is incomplete: ${date}`);
    assert(!page.includes('如需结合企业现场进一步判断'), `Enterprise-only brief message wording remains: ${date}`);
    assert(!page.includes('<div class="date">' + date + '｜' + index.find((item) => item.date === date).theme + ' ·'), `Daily date line contains an unexpected suffix: ${date}`);
  });

  index.forEach((item) => {
    const page = read(`qilylean/daily/${item.date}.html`);
    const assetPath = path.join(assetDir, `daily-${item.date}.svg`);
    assert(!productTerms.some((term) => page.includes(term)), `Product-led wording remains in daily brief: ${item.date}`);
    assert(!page.includes('每日工程版简报'), `Former public brief name remains: ${item.date}`);
    assert((page.match(/data-one-point-training="v1"/g) || []).length === 1, `Single-point training block is missing or duplicated: ${item.date}`);
    ['培训目标', '核心口径', '现场动作', '使用边界', '相关职能接口', '培训验收'].forEach((label) => {
      assert(page.includes(label), `Single-point training content is missing ${label}: ${item.date}`);
    });
    assert(page.includes('建议用10—15分钟完成一次班前会、工程例会或个人学习'), `Standalone training guidance is missing: ${item.date}`);
    assert(page.includes(`<meta property="og:image" content="https://qilylean.com/qilylean/assets/daily-${item.date}.svg">`), `Social share image is missing: ${item.date}`);
    assert(page.includes('<meta name="twitter:card" content="summary_large_image">'), `Large social card metadata is missing: ${item.date}`);
    assert(fs.existsSync(assetPath) && fs.statSync(assetPath).size > 1000, `Social share visual is missing or shallow: ${item.date}`);
    assert(!page.includes('<table class="rule-table">'), `A short-label table still uses equal-width columns: ${item.date}`);
    assert(page.includes('<section class="brief-feedback brief-message-only"'), `Brief message-only module is missing: ${item.date}`);
    assert(!page.includes('评价本期简报') && !page.includes('五星好评') && !page.includes('点赞好评') && !page.includes('data-brief-rating') && !page.includes('data-brief-sentiment'), `Obsolete public rating controls remain: ${item.date}`);
    assert(page.includes('data-brief-message-form') && page.includes('称谓（选填）') && page.includes('联系方式（选填）'), `Simple inline message form is incomplete: ${item.date}`);
    assert(page.includes('/qilylean/daily-feedback.js?v=20260729-message-only-v4'), `Shared message client is not loaded: ${item.date}`);
    assert(page.includes(`data-brief-date="${item.date}"`) && page.includes(`data-brief-url="https://qilylean.com/qilylean/daily/${item.date}.html"`), `Message source tracking is incomplete: ${item.date}`);
  });
  fs.readdirSync(assetDir).filter((name) => /^daily-.*\.svg$/.test(name)).forEach((name) => {
    assert(!fs.readFileSync(path.join(assetDir, name), 'utf8').includes('每日工程版简报'), `Former public brief name remains in visual: ${name}`);
  });

  const firstPublished = read('qilylean/daily/2025-12-19.html');
  assert(firstPublished.includes('/qilylean/daily/2025-12-18.html'), 'Adjacent navigation is not continuous at 2025-12-19');

  const directory = read('qilylean/daily-insights.html');
  assert(!directory.includes('每日工程版简报'), 'Former public brief name remains in the directory');
  assert(directory.includes('<h1>今日简报</h1>'), 'Unified public brief name is missing from the directory');
  assert(directory.includes('id="briefSearch"'), 'Archive keyword search is missing');
  assert(directory.includes('href="?year=2019#brief-directory"') && directory.includes('href="?year=2025#brief-directory"'), 'Career year links are missing');
  assert(!directory.includes('class="brief-year-filters"'), 'The duplicate year filter button module still exists');
  assert(!/<button[^>]*data-year-filter=/i.test(directory), 'Legacy year filter buttons still exist');
  assert(directory.includes(`共${index.length}期`), 'Archive directory total is incorrect');
  assert(!/<div class="brief-index-meta">[\s\S]*?<i>/i.test(directory), 'Public directory contains an unexpected classification badge');
  assert(directory.includes('<h2 id="careerTrackTitle">主要项目履历</h2>'), 'Renamed project timeline is missing');
  assert(!directory.includes('工程项目履历主线'), 'Former project timeline name remains');
  assert(directory.includes('<col class="career-year-col">'), 'Career timeline does not use the narrow year column');
  careerTimeline.forEach((item) => {
    assert(directory.includes(`${item.year}年`) && directory.includes(item.field), `Career timeline is incomplete for ${item.year}`);
    assert(directory.includes(`href="?year=${item.year}#brief-directory" data-year-filter="${item.year}"`), `Career year link is incomplete for ${item.year}`);
  });
  assert(
    careerTimeline.every((item, position) => position === 0 || Number(careerTimeline[position - 1].year) > Number(item.year)),
    'Career timeline is not ordered from newest to earliest'
  );
  assert(careerTimeline.find((item) => item.year === '2024').field === '汽车电子、整流器', 'The 2024 career field is not correct');
  const dailyCss = read('qilylean/daily-briefs.css');
  assert(/\.career-table \.career-year-col\{width:116px\}/.test(dailyCss), 'Desktop career year column is not narrowed');
  assert(/\.career-table \.career-year-col\{width:70px\}/.test(dailyCss), 'Mobile career year column is not narrowed');
  assert(dailyCss.includes('engineering-system-v11'), 'Daily archive stylesheet version is not current');
  assert(dailyCss.includes('font-size:clamp(20px,1.55vw,24px)!important'), 'Directory brief titles were not reduced or do not override the global heading rule');
  assert(dailyCss.includes('font-size:clamp(28px,2.7vw,34px)!important'), 'Single-page brief titles were not reduced or do not override the global heading rule');
  assert(dailyCss.includes('font-size:16px;font-weight:900;line-height:1.45'), 'Directory date and theme text were not enlarged');
  assert(dailyCss.includes('.daily-single-section .date{color:var(--daily-gold);font-size:18px'), 'Single-page date text was not enlarged');
  assert(dailyCss.includes('.brief-consultation-form{'), 'Brief consultation form styles are missing');
  assert(dailyCss.includes('.brief-one-point-training{') && dailyCss.includes('.brief-one-point-grid{'), 'Single-point training styles are missing');
  assert(dailyCss.includes('.brief-feedback{') && dailyCss.includes('.brief-inline-message{'), 'Brief message responsive styles are missing');
  assert(dailyCss.includes('.rule-table.compact-first-col{table-layout:auto}') && dailyCss.includes('width:1%;min-width:5.5em'), 'Compact first-column table rules are missing');
  assert(directory.includes('id="briefConsultationForm"') && directory.includes('id="brief-consultation"'), 'Brief consultation window is missing');
  assert(directory.includes('<h2 id="briefConsultationTitle">简报留言交流</h2>'), 'Generic brief message heading is missing');
  assert(directory.includes('name="name"') && directory.includes('name="contact"') && directory.includes('name="problem"'), 'Simple brief message fields are incomplete');
  assert(directory.includes('type="hidden" name="brief_reference"') && directory.includes('id="briefReferenceDisplay"'), 'Automatic brief source tracking is missing');
  assert(directory.includes('data-brief-date="2026-07-29"') && directory.includes('data-brief-title='), 'Brief source metadata is missing from directory cards');
  ['企业名称／姓名', 'name="industry"', 'name="location"', 'name="target"', '预约企业问题初筛', '本次问题初筛'].forEach((term) => {
    assert(!directory.includes(term), `Enterprise-only message field or wording remains: ${term}`);
  });
  assert(directory.includes('/^\\d{4}$/.test(requestedYear)') && directory.includes('/^\\d{4}$/.test(year)'), 'Year query validation was not emitted correctly');
  assert(directory.includes("consultationApi+'/consultations'"), 'Brief consultation does not use the QilyLean consultation backend');
  assert(directory.includes('formsubmit.co/ajax/'), 'Brief consultation email fallback is missing');
  assert(directory.includes("timing:'今日简报留言｜'+reference"), 'Brief message source classification is missing');
  assert(directory.includes("mail.append('来源简报',data.source_brief)"), 'Brief source is missing from the received email');
  assert(directory.includes("source_page:window.location.href,source_brief:reference"), 'Brief source URL and metadata are missing from the backend payload');

  const worker = read('cloudflare-worker/worker.js');
  const feedbackClient = read('qilylean/daily-feedback.js');
  const admin = read('admin.html');
  const adminScript = read('qily-admin.js');
  assert(worker.includes("url.pathname === '/brief-feedback'"), 'Public brief feedback endpoint is missing');
  assert(worker.includes("url.pathname === '/admin/brief-feedback'"), 'Admin brief feedback endpoint is missing');
  assert(worker.includes('brief-feedback-voter:') && worker.includes('BRIEF_FEEDBACK_DAILY_IP_LIMIT'), 'Brief feedback duplicate or rate-limit protection is missing');
  assert(worker.includes("recordMetric(env, 'brief_comments')"), 'Brief message conversion metric is missing');
  assert(worker.includes("record.industry === '今日简报留言交流'"), 'Brief messages are not separated from enterprise consultations');
  assert(feedbackClient.includes("api+'/consultations'") && feedbackClient.includes('formsubmit.co/ajax/'), 'Message client is not connected to the backend and email fallback');
  assert(!feedbackClient.includes("api+'/brief-feedback'") && !feedbackClient.includes('qilylean_feedback_client') && !feedbackClient.includes("marker('rating')") && !feedbackClient.includes("marker('sentiment')"), 'Obsolete public rating client remains');
  assert(admin.includes('id="briefFeedbackList"') && admin.includes('id="todayBriefRatings"') && admin.includes('id="todayBriefComments"'), 'Admin brief interaction overview is incomplete');
  assert(adminScript.includes("request('/admin/brief-feedback?limit=100')") && adminScript.includes('今日简报留言｜'), 'Admin feedback loading or message classification is incomplete');

  const latestPage = read('qilylean/daily/2026-07-29.html');
  assert((latestPage.match(/class="rule-table compact-first-col"/g) || []).length === 2, 'July 29 short-label tables were not compacted');
  ['PE', 'IE', 'NPI', 'ME', 'JIT', 'PDCA', 'PQCD', 'OEE', 'EVT', 'DVT', 'PVT', 'MP', '精益物流', 'Kaizen'].forEach((term) => {
    assert(latestPage.includes(term), `July 29 engineering brief is missing: ${term}`);
  });

  const sitemap = read('sitemap.xml');
  const dailyUrls = sitemap.match(/https:\/\/qilylean\.com\/qilylean\/daily\/\d{4}-\d{2}-\d{2}\.html/g) || [];
  assert(dailyUrls.length === index.length, `Sitemap daily URL count is ${dailyUrls.length}; expected ${index.length}`);
  assert(sitemap.includes(`/qilylean/daily/${archiveStart}.html`), 'Earliest daily page is missing from sitemap');
  assert(!/DAY\d{3}/.test(directory), 'Legacy DAY sequence remains in the archive directory');

  process.stdout.write(`Daily archive validation passed: ${archive.length} archive pages + ${recent.length} recent pages = ${index.length} independent URLs.\n`);
}

main();
