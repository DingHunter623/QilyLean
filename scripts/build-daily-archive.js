#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const {
  archiveStart,
  archiveEnd,
  careerTimeline,
  collectArchiveBriefs
} = require('./daily-engineering-archive');

const root = path.resolve(__dirname, '..');
const qily = path.join(root, 'qilylean');
const dailyDir = path.join(qily, 'daily');
const baseUrl = 'https://qilylean.com';

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]);
}

function textFromHtml(value) {
  return String(value).replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'").replace(/\s+/g, ' ').trim();
}

function capture(value, expression, label) {
  const match = value.match(expression);
  if (!match) throw new Error(`Cannot extract ${label}`);
  return match[1];
}

function visual(theme, index) {
  const c1 = ['#0f4b5a', '#153f4c', '#17443b', '#264f61'][index % 4];
  const c2 = ['#177f87', '#2d8c84', '#3b7f91', '#4a786e'][index % 4];
  const accent = ['#caa15f', '#ffe39b', '#d7b56d', '#e4ca91'][index % 4];
  const mode = index % 6;
  let shape = '';
  if (mode === 0) shape = `<rect x="120" y="180" width="560" height="360" rx="26" fill="${c2}"/><path d="M170 470h460M210 390h380M250 310h300" stroke="#fff" stroke-width="20" stroke-linecap="round"/>`;
  if (mode === 1) shape = `<circle cx="400" cy="350" r="210" fill="${c2}"/><path d="M250 350h300M400 200v300" stroke="#fff" stroke-width="24" stroke-linecap="round"/><circle cx="400" cy="350" r="62" fill="${accent}"/>`;
  if (mode === 2) shape = `<rect x="130" y="470" width="540" height="130" rx="18" fill="${accent}"/><rect x="200" y="310" width="400" height="160" rx="18" fill="${c2}"/><rect x="285" y="170" width="230" height="140" rx="18" fill="#fff"/>`;
  if (mode === 3) shape = `<path d="M145 500L285 340l115 90 150-210 105 120" fill="none" stroke="${accent}" stroke-width="32" stroke-linecap="round" stroke-linejoin="round"/><circle cx="145" cy="500" r="28" fill="#fff"/><circle cx="285" cy="340" r="28" fill="#fff"/><circle cx="400" cy="430" r="28" fill="#fff"/><circle cx="550" cy="220" r="28" fill="#fff"/>`;
  if (mode === 4) shape = `<g fill="${c2}"><rect x="130" y="180" width="150" height="420" rx="18"/><rect x="325" y="280" width="150" height="320" rx="18"/><rect x="520" y="380" width="150" height="220" rx="18"/></g><path d="M150 145h500" stroke="${accent}" stroke-width="22" stroke-linecap="round"/>`;
  if (mode === 5) shape = `<path d="M170 240h460v310H170z" fill="${c2}"/><path d="M220 300h360M220 380h360M220 460h220" stroke="#fff" stroke-width="22" stroke-linecap="round"/><circle cx="560" cy="470" r="62" fill="${accent}"/>`;
  return `<svg viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${escapeHtml(theme.title)}"><rect width="800" height="800" rx="36" fill="${c1}"/>${shape}<text x="400" y="675" fill="#fff" font-size="46" font-weight="850" text-anchor="middle">${escapeHtml(theme.cat)}</text><text x="400" y="727" fill="#d8efeb" font-size="26" text-anchor="middle">制造改善 · 方法沉淀 · 现场实践</text></svg>`;
}

const productNeutralReplacements = [
  [/汽车座椅开关总成/g, '高可靠控制组件'],
  [/汽车座椅开关/g, '高可靠控制组件'],
  [/游戏机手柄/g, '多部件电子产品'],
  [/新能源负极材料/g, '新能源材料'],
  [/负极材料/g, '新能源材料'],
  [/电子烟/g, '短周期电子产品'],
  [/电磁阀/g, '机电部件'],
  [/逆变器/g, '功率电子产品'],
  [/汽车电子/g, '高可靠电子'],
  [/整流器/g, '功率器件'],
  [/继电器/g, '机电器件'],
  [/座椅开关/g, '控制组件'],
  [/小家电/g, '多品种消费产品']
];

function neutralizeProductTerms(value) {
  return productNeutralReplacements.reduce(
    (text, [expression, replacement]) => text.replace(expression, replacement),
    String(value)
  );
}

function collectPublishedBriefs() {
  return fs.readdirSync(dailyDir).filter((name) => /^\d{4}-\d{2}-\d{2}\.html$/.test(name) && name.slice(0, 10) > archiveEnd).map((name) => {
    const page = fs.readFileSync(path.join(dailyDir, name), 'utf8');
    const date = name.replace('.html', '');
    const article = neutralizeProductTerms(capture(page, /(<article class="post(?: [^"]*)?"[\s\S]*?<\/article>)/, `${date} article`));
    const dateLine = textFromHtml(capture(article, /<div class="date">([\s\S]*?)<\/div>/, `${date} date line`));
    const title = textFromHtml(capture(article, /<h2>([\s\S]*?)<\/h2>/, `${date} title`));
    const summary = textFromHtml(capture(article, /<p>([\s\S]*?)<\/p>/, `${date} summary`));
    const dayNo = (dateLine.match(/DAY\d+/) || [''])[0];
    const theme = dateLine.replace(date, '').replace(dayNo, '').replace(/[｜|]/g, '').trim();
    return { date, article, title, summary, dayNo, theme, archive: false };
  });
}

function buildCareerTimeline() {
  const rows = careerTimeline.map((item) => `<tr><td><a class="career-year-link" href="?year=${escapeHtml(item.year)}#brief-directory" data-year-filter="${escapeHtml(item.year)}" aria-label="查看${escapeHtml(item.year)}年全部简报">${escapeHtml(item.year)}年</a></td><td>${escapeHtml(item.field)}</td></tr>`).join('');
  return `<section class="engineering-checklist career-track" aria-labelledby="careerTrackTitle">
  <h2 id="careerTrackTitle">主要项目履历</h2>
  <p>以下按最近至最早汇总制造项目领域；每日简报贯通PE、IE、NPI、ME、精益运营与项目交付方法。</p>
  <table class="rule-table career-table"><colgroup><col class="career-year-col"><col></colgroup><thead><tr><th>年份</th><th>主要制造项目</th></tr></thead><tbody>${rows}</tbody></table>
</section>`;
}

function pageHeader(title, description, canonical, ogType = 'article') {
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <meta name="robots" content="index,follow,max-image-preview:large">
  <link rel="canonical" href="${canonical}">
  <meta property="og:type" content="${ogType}">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${canonical}">
  <link rel="stylesheet" href="/site-shell.css?v=20260725-compact-hero-v1">
  <link rel="stylesheet" href="/qilylean/daily-briefs.css?v=20260729-engineering-system-v9">
</head>`;
}

function siteHeader() {
  return `<header class="qily-site-header">
  <a class="qily-brand" href="/">QilyLean｜启力精益</a>
  <nav class="site-nav" aria-label="网站导航"><a href="/">首页</a><a href="/knowledge/">知识分享</a></nav>
</header>`;
}

function pageScripts() {
  return `<script src="/site-navigation.js?v=20260728-layout-type-v3"></script>
<script src="/homepage-music.js?v=20260722-continuous-v3"></script>`;
}

function buildIndex(briefs) {
  const byMonth = new Map();
  briefs.forEach((brief) => {
    const month = brief.date.slice(0, 7);
    if (!byMonth.has(month)) byMonth.set(month, []);
    byMonth.get(month).push(brief);
  });
  const monthNames = { '01': '1月', '02': '2月', '03': '3月', '04': '4月', '05': '5月', '06': '6月', '07': '7月', '08': '8月', '09': '9月', '10': '10月', '11': '11月', '12': '12月' };
  const months = Array.from(byMonth.entries()).map(([month, list], monthIndex) => {
    const cards = list.map((brief, index) => {
      const url = `/qilylean/daily/${brief.date}.html`;
      const searchText = `${brief.date} ${brief.theme} ${brief.title} ${brief.summary}`;
      return `<article class="brief-index-card${monthIndex === 0 && index === 0 ? ' latest' : ''}" data-brief-year="${brief.date.slice(0, 4)}" data-brief-search="${escapeHtml(searchText)}">
  <div class="brief-index-meta"><time datetime="${brief.date}">${brief.date}</time><span>${escapeHtml(brief.theme)}</span></div>
  <h2><a href="${url}">${escapeHtml(brief.title)}</a></h2>
  <div class="brief-index-actions"><a class="brief-open" href="${url}">打开本期简报</a><button type="button" data-brief-url="${baseUrl}${url}" data-brief-title="${escapeHtml(brief.title)}">分享本期网址</button><span class="brief-share-status" aria-live="polite"></span></div>
</article>`;
    }).join('\n');
    const [year, number] = month.split('-');
    return `<details class="brief-month" data-brief-month="${month}"${monthIndex === 0 ? ' open' : ''}><summary><span>${year}年${monthNames[number]}</span><b>${list.length}期</b></summary><div class="brief-grid">${cards}</div></details>`;
  }).join('\n');
  const latest = briefs[0];
  const earliest = briefs[briefs.length - 1];
  return `${pageHeader('今日简报｜QilyLean', `自${archiveStart}起，贯通PE、IE、NPI、ME、JIT、PDCA、PQCD、OEE、精益物流、Kaizen、数智化工厂与项目交付的今日简报。`, `${baseUrl}/qilylean/daily-insights.html`, 'website')}
<body class="module-page daily-index-page">
${siteHeader()}
<main>
  <section class="daily-hero"><div class="daily-inner"><span>DAILY ENGINEERING BRIEF</span><h1>今日简报</h1><p>自2019年7月10日起，以现场事实贯通PE、IE、NPI、ME、精益运营、数据闭环与项目交付；每一天对应一个独立网址，可单独打开、连续翻阅与直接分享。</p></div></section>
  <section class="daily-index-section"><div class="daily-inner">
    <div class="daily-index-heading"><div><h2>简报目录</h2><p>${earliest.date}—${latest.date}｜共${briefs.length}期｜按月份收纳、最新优先</p></div><a href="/qilylean/daily/${latest.date}.html">打开最新简报</a></div>
    ${buildCareerTimeline()}
    <div class="brief-directory-tools" id="brief-directory">
      <label><span>搜索日期、主题或关键词</span><input type="search" id="briefSearch" placeholder="例如：标准工时、NPI、2021-05" autocomplete="off"></label>
      <p id="briefFilterStatus" aria-live="polite"><span id="briefFilterText">当前显示全部 ${briefs.length} 期</span><a id="briefFilterReset" href="/qilylean/daily-insights.html#brief-directory" hidden>查看全部简报</a></p>
    </div>
    <section class="brief-consultation" id="brief-consultation" aria-labelledby="briefConsultationTitle">
      <div class="brief-consultation-heading"><span>MESSAGE / CONSULTATION</span><h2 id="briefConsultationTitle">简报留言咨询</h2><p>可针对某一期简报、制造现场问题或项目需求留言。信息将提交至QilyLean咨询后台，并同步向项目初筛的同一接收邮箱发送通知。</p></div>
      <form class="brief-consultation-form" id="briefConsultationForm">
        <label>企业名称／姓名<input name="company" autocomplete="organization" placeholder="企业简称或您的姓名" maxlength="120" required></label>
        <label>行业<input name="industry" placeholder="如汽车电子、家电、半导体" maxlength="120" required></label>
        <label>所在地区<input name="location" placeholder="省／市" maxlength="120" required></label>
        <label>联系方式<input name="contact" autocomplete="name" placeholder="姓名＋手机或微信" maxlength="180" required></label>
        <label class="full">关联简报<input name="brief_reference" id="briefReference" placeholder="可填写日期或标题，例如：2026-07-29" maxlength="220"></label>
        <label class="full">留言咨询内容<textarea name="problem" placeholder="请描述想咨询的简报内容、现场问题或项目需求" minlength="8" maxlength="1800" required></textarea></label>
        <label class="full">希望达到的目标<textarea name="target" placeholder="可填写期望获得的判断、改善方向或项目目标" maxlength="1200"></textarea></label>
        <label class="brief-website-field" aria-hidden="true">网站<input name="website" tabindex="-1" autocomplete="off"></label>
        <div class="brief-consultation-actions"><button id="submitBriefConsultation" type="submit">提交留言咨询</button><a href="/cooperation/#diagnosis">预约企业问题初筛</a></div>
        <div class="brief-consultation-status" id="briefConsultationStatus" role="status" aria-live="polite"></div>
        <p class="brief-consultation-privacy">提交即表示同意将上述资料用于本次问题初筛与联系沟通。信息不会在公开页面展示。</p>
      </form>
    </section>
    <div class="brief-months">${months}</div>
  </div></section>
</main>
<footer class="module-footer"><div class="module-inner"><span>丁启利｜今日简报</span><span>PE · IE · NPI · ME · 精益运营 · 数智化工厂</span></div></footer>
<script>
(function(){
var legacy=(location.hash||'').slice(1);if(/^\\d{4}-\\d{2}-\\d{2}$/.test(legacy)){location.replace('/qilylean/daily/'+legacy+'.html');return;}
var input=document.getElementById('briefSearch'),statusText=document.getElementById('briefFilterText'),reset=document.getElementById('briefFilterReset'),directory=document.getElementById('brief-directory'),selectedYear='',cards=Array.prototype.slice.call(document.querySelectorAll('.brief-index-card')),months=Array.prototype.slice.call(document.querySelectorAll('.brief-month'));
var requestedYear=new URLSearchParams(location.search).get('year')||'';if(/^\\d{4}$/.test(requestedYear)&&cards.some(function(card){return card.getAttribute('data-brief-year')===requestedYear;}))selectedYear=requestedYear;
function applyFilter(){var query=(input&&input.value||'').trim().toLowerCase(),visible=0;cards.forEach(function(card){var matchYear=!selectedYear||card.getAttribute('data-brief-year')===selectedYear;var matchQuery=!query||(card.getAttribute('data-brief-search')||'').toLowerCase().indexOf(query)>=0;card.hidden=!(matchYear&&matchQuery);if(!card.hidden)visible+=1;});months.forEach(function(month,index){var hasVisible=!!month.querySelector('.brief-index-card:not([hidden])');month.hidden=!hasVisible;if(query||selectedYear)month.open=hasVisible;else month.open=index===0;});document.querySelectorAll('[data-year-filter]').forEach(function(link){var active=!!selectedYear&&link.getAttribute('data-year-filter')===selectedYear;link.classList.toggle('active',active);if(active)link.setAttribute('aria-current','true');else link.removeAttribute('aria-current');});if(statusText)statusText.textContent='当前显示 '+visible+' 期'+(selectedYear?'｜'+selectedYear+'年':'')+(query?'｜关键词：'+query:'');if(reset)reset.hidden=!selectedYear;}
function selectYear(year,updateHistory){selectedYear=year||'';applyFilter();if(updateHistory&&history.pushState){var next=location.pathname+(selectedYear?'?year='+encodeURIComponent(selectedYear):'')+'#brief-directory';history.pushState(null,'',next);}if(directory)directory.scrollIntoView({behavior:'smooth',block:'start'});}
if(input)input.addEventListener('input',applyFilter);
document.addEventListener('click',function(event){var yearLink=event.target.closest&&event.target.closest('[data-year-filter]');if(yearLink){event.preventDefault();selectYear(yearLink.getAttribute('data-year-filter')||'',true);return;}var button=event.target.closest&&event.target.closest('[data-brief-url]');if(!button)return;var url=button.getAttribute('data-brief-url');var title=button.getAttribute('data-brief-title')||document.title;var shareStatus=button.parentNode.querySelector('.brief-share-status');function copy(text){if(navigator.clipboard&&window.isSecureContext)return navigator.clipboard.writeText(text);var area=document.createElement('textarea');area.value=text;area.style.position='fixed';area.style.left='-9999px';document.body.appendChild(area);area.select();document.execCommand('copy');area.remove();return Promise.resolve();}function done(text){if(shareStatus)shareStatus.textContent=text;setTimeout(function(){if(shareStatus)shareStatus.textContent='';},2200);}var mobile=/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent||'')||!!(window.matchMedia&&window.matchMedia('(pointer: coarse)').matches&&innerWidth<=820);if(mobile&&navigator.share){navigator.share({title:title,text:title,url:url}).then(function(){done('已调起分享');}).catch(function(error){if(error&&error.name==='AbortError')return;copy(url).then(function(){done('网址已复制');});});}else copy(url).then(function(){done('网址已复制');});});
if(reset)reset.addEventListener('click',function(event){event.preventDefault();if(input)input.value='';selectYear('',true);});
window.addEventListener('popstate',function(){var year=new URLSearchParams(location.search).get('year')||'';selectedYear=/^\\d{4}$/.test(year)?year:'';applyFilter();});
applyFilter();
var consultationForm=document.getElementById('briefConsultationForm'),consultationStatus=document.getElementById('briefConsultationStatus'),consultationButton=document.getElementById('submitBriefConsultation'),briefReference=document.getElementById('briefReference'),consultationApi='https://qilylean-ai.dinghunter623.workers.dev',consultationEmail='https://formsubmit.co/ajax/396767769@qq.com';
var requestedBrief=new URLSearchParams(location.search).get('brief')||'';if(briefReference&&requestedBrief)briefReference.value=requestedBrief;
function consultationSetStatus(text,type){if(!consultationStatus)return;consultationStatus.textContent=text;consultationStatus.className='brief-consultation-status'+(type?' '+type:'');}
function consultationPayload(){var formData=new FormData(consultationForm),reference=String(formData.get('brief_reference')||'').trim(),message=String(formData.get('problem')||'').trim();return{company:String(formData.get('company')||'').trim(),industry:String(formData.get('industry')||'').trim(),location:String(formData.get('location')||'').trim(),scale:'',problem:(reference?'关联简报：'+reference+'\\n':'')+message,target:String(formData.get('target')||'').trim(),timing:'今日简报留言咨询',contact:String(formData.get('contact')||'').trim(),website:String(formData.get('website')||'').trim(),source_page:window.location.href};}
async function sendConsultationEmail(data,id){var mail=new FormData();mail.append('_subject','【QilyLean简报留言】'+data.company+'｜'+data.industry);mail.append('_template','table');mail.append('_captcha','false');mail.append('咨询编号',id||'后台处理中');mail.append('企业名称／姓名',data.company);mail.append('行业',data.industry);mail.append('所在地区',data.location);mail.append('留言咨询内容',data.problem);mail.append('希望达到的目标',data.target||'未填写');mail.append('联系方式',data.contact);mail.append('来源页面',data.source_page);var response=await fetch(consultationEmail,{method:'POST',headers:{Accept:'application/json'},body:mail});if(!response.ok)throw new Error('email_'+response.status);return true;}
if(consultationForm)consultationForm.addEventListener('submit',async function(event){event.preventDefault();if(!consultationForm.reportValidity())return;var data=consultationPayload();if(data.website){consultationSetStatus('留言已提交。','success');return;}consultationButton.disabled=true;consultationButton.textContent='正在提交…';consultationSetStatus('正在提交至QilyLean咨询后台…','');var emailSent=false,id='';try{var response=await fetch(consultationApi+'/consultations',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});var result=await response.json().catch(function(){return{};});if(!response.ok)throw new Error(result.error||('submit_'+response.status));id=result.id||'';emailSent=Boolean(result.email_sent);if(!emailSent){try{emailSent=await sendConsultationEmail(data,id);}catch(emailError){console.warn('Brief consultation email fallback unavailable',emailError);}}consultationSetStatus(emailSent?'留言咨询已提交成功，后台已保存并发送邮件通知。':'留言咨询已提交成功，后台已保存；邮件通知暂未确认，请稍后通过项目合作页联系。','success');consultationForm.reset();}catch(error){try{emailSent=await sendConsultationEmail(data,id);}catch(emailError){console.warn('Brief consultation email unavailable',emailError);}consultationSetStatus(emailSent?'后台暂时繁忙，但留言已发送至接收邮箱。':'提交暂未完成，请稍后重试或进入项目合作页联系。','error');}finally{consultationButton.disabled=false;consultationButton.textContent='提交留言咨询';}});
})();
</script>
${pageScripts()}
</body>
</html>
`;
}

function buildBriefPage(brief, briefs, index) {
  const older = briefs[index + 1];
  const newer = briefs[index - 1];
  const canonical = `${baseUrl}/qilylean/daily/${brief.date}.html`;
  const article = brief.article.replace(/<button class="share"[^>]*>[^<]*<\/button>/, '<button class="share" type="button">分享本期网址</button>');
  const adjacent = [older ? `<a href="/qilylean/daily/${older.date}.html">← 上一期</a>` : '<span>已是最早一期</span>', '<a class="directory" href="/qilylean/daily-insights.html">返回简报目录</a>', newer ? `<a href="/qilylean/daily/${newer.date}.html">下一期 →</a>` : '<span>已是最新一期</span>'].join('');
  return `${pageHeader(`${brief.title}｜今日简报`, brief.summary, canonical)}
<body class="module-page daily-single-page">
${siteHeader()}
<main>
  <section class="daily-hero compact"><div class="daily-inner"><span>DAILY ENGINEERING BRIEF${brief.dayNo ? ` · ${brief.dayNo}` : ''}</span><h1>今日简报</h1><p>${brief.date}｜${escapeHtml(brief.theme)}</p></div></section>
  <section class="daily-single-section"><div class="daily-inner"><nav class="brief-adjacent top" aria-label="简报翻页">${adjacent}</nav>${article}<aside class="brief-consultation-cta"><div><span>MESSAGE / CONSULTATION</span><h2>针对本期内容留言咨询</h2><p>如需结合企业现场进一步判断，可携带本期日期直接留言，提交至QilyLean咨询后台与项目初筛接收邮箱。</p></div><a href="/qilylean/daily-insights.html?brief=${brief.date}#brief-consultation">进入留言咨询窗口</a></aside><nav class="brief-adjacent" aria-label="简报翻页">${adjacent}</nav></div></section>
</main>
<footer class="module-footer"><div class="module-inner"><span>丁启利｜今日简报</span><span>${brief.date} · ${escapeHtml(brief.theme)}</span></div></footer>
<script>
(function(){var button=document.querySelector('.share');if(!button)return;var status=document.querySelector('.status');function copy(text){if(navigator.clipboard&&window.isSecureContext)return navigator.clipboard.writeText(text);var area=document.createElement('textarea');area.value=text;area.style.position='fixed';area.style.left='-9999px';document.body.appendChild(area);area.select();document.execCommand('copy');area.remove();return Promise.resolve();}function done(text){if(status)status.textContent=text;setTimeout(function(){if(status)status.textContent='';},2200);}button.addEventListener('click',function(){var url=location.href;var title=document.title;if((/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent||'')||!!(window.matchMedia&&window.matchMedia('(pointer: coarse)').matches&&innerWidth<=820))&&navigator.share){navigator.share({title:title,text:title,url:url}).then(function(){done('已调起分享');}).catch(function(error){if(error&&error.name==='AbortError')return;copy(url).then(function(){done('网址已复制');});});}else copy(url).then(function(){done('网址已复制');});});})();
</script>
${pageScripts()}
</body>
</html>
`;
}

function updateSitemap(briefs) {
  const file = path.join(root, 'sitemap.xml');
  let sitemap = fs.readFileSync(file, 'utf8');
  sitemap = sitemap.replace(
    /(<url><loc>https:\/\/qilylean\.com\/qilylean\/daily-insights\.html<\/loc><lastmod>)\d{4}-\d{2}-\d{2}(<\/lastmod>)/,
    `$1${briefs[0].date}$2`
  );
  sitemap = sitemap.replace(/\n  <url><loc>https:\/\/qilylean\.com\/qilylean\/daily\/\d{4}-\d{2}-\d{2}\.html<\/loc>[\s\S]*?<\/url>/g, '');
  const urls = briefs.map((brief) => `  <url><loc>${baseUrl}/qilylean/daily/${brief.date}.html</loc><lastmod>${brief.date}</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>`).join('\n');
  sitemap = sitemap.replace(/(  <url><loc>https:\/\/qilylean\.com\/qilylean\/daily-insights\.html<\/loc>[^\n]*<\/url>)/, `$1\n${urls}`);
  fs.writeFileSync(file, sitemap);
}

function updateKnowledgeLatest(latest) {
  const file = path.join(root, 'knowledge', 'index.html');
  let page = fs.readFileSync(file, 'utf8');
  const card = `<article class="module-card" data-latest-brief-card><small data-latest-brief-meta>最新：${latest.date}｜${escapeHtml(latest.theme)}</small><h3 data-latest-brief-title>${escapeHtml(latest.title)}</h3><p data-latest-brief-summary>${escapeHtml(latest.summary)}</p><div class="module-actions"><a href="/qilylean/daily-insights.html">查看简报目录</a><a class="secondary" data-latest-brief-link href="/qilylean/daily/${latest.date}.html">查看最新简报</a></div></article>`;
  const pattern = /<article class="module-card" data-latest-brief-card>[\s\S]*?<\/article>/;
  if (!pattern.test(page)) throw new Error('Knowledge latest brief card marker is missing');
  page = page.replace(pattern, card);
  fs.writeFileSync(file, page);
}

function assertContinuousArchive(briefs) {
  const dates = briefs.map((brief) => brief.date);
  if (dates[dates.length - 1] !== archiveStart) {
    throw new Error(`Daily archive must start on ${archiveStart}; found ${dates[dates.length - 1]}`);
  }
  if (new Set(dates).size !== dates.length) throw new Error('Daily archive contains duplicate dates');
  for (let index = 1; index < dates.length; index += 1) {
    const newer = new Date(`${dates[index - 1]}T00:00:00Z`);
    const older = new Date(`${dates[index]}T00:00:00Z`);
    if ((newer - older) !== 86400000) {
      throw new Error(`Daily archive date gap between ${dates[index - 1]} and ${dates[index]}`);
    }
  }
}

function main() {
  const published = collectPublishedBriefs();
  const archive = collectArchiveBriefs(visual);
  const briefs = [...published, ...archive].sort((a, b) => b.date.localeCompare(a.date));
  assertContinuousArchive(briefs);
  fs.writeFileSync(path.join(qily, 'daily-insights.html'), buildIndex(briefs));
  briefs.forEach((brief, index) => fs.writeFileSync(path.join(dailyDir, `${brief.date}.html`), buildBriefPage(brief, briefs, index)));
  fs.writeFileSync(path.join(dailyDir, 'index.json'), `${JSON.stringify(briefs.map(({ date, title, summary, dayNo, theme }) => ({ date, title, summary, dayNo, theme })), null, 2)}\n`);
  updateSitemap(briefs);
  updateKnowledgeLatest(briefs[0]);
  process.stdout.write(`Built ${briefs.length} independent daily engineering brief pages from ${archiveStart} through ${briefs[0].date}.\n`);
}

main();
