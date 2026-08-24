(() => {
  'use strict';

  const form = document.querySelector('[data-qily-diagnosis-form]');
  const result = document.querySelector('[data-qily-diagnosis-result]');
  if (!form || !result) return;

  const dimensions = ['现场事实', '工程数据', '精益改善', '质量保证', '数智固化', '知识资产'];
  const suggestions = {
    '现场事实': '先统一问题定义、产品／工序／班次／设备与统计周期，建立可复现的Gemba记录和异常边界。',
    '工程数据': '优先补齐CT、TT、WIP、标准工时、瓶颈、产能与损失数据，固定口径、版本和责任人。',
    '精益改善': '围绕瓶颈选择Pilot，使用VSM、ECRS、SMED、线平衡、OEE等方法，以改善前后实绩验证。',
    '质量保证': '把FPY、DPPM、COPQ、防错、控制计划和异常关闭链纳入改善验收，避免效率以质量风险为代价。',
    '数智固化': '先稳定流程和主数据，再将计划、执行、设备、质量与看板规则固化到ERP／APS／MES及现场系统。',
    '知识资产': '把有效做法转化为SOP、程序文件、模板、课件和审核机制，明确版本、维护责任与横向复制范围。'
  };

  const scoreEl = result.querySelector('[data-qily-score]');
  const levelEl = result.querySelector('[data-qily-level]');
  const summaryEl = result.querySelector('[data-qily-summary]');
  const errorEl = form.querySelector('[data-qily-diagnosis-error]');
  const bars = result.querySelector('[data-qily-dimension-bars]');
  const priorities = result.querySelector('[data-qily-priorities]');
  const radar = result.querySelector('[data-qily-radar-value]');

  function levelFor(percent) {
    if (percent < 26) return ['L1｜现场依赖型', '关键机制更多依赖个人经验与临时推动，先建立事实、口径和最小标准。'];
    if (percent < 51) return ['L2｜标准建立型', '已有部分标准与数据，但执行稳定性和跨部门闭环仍是主要改善空间。'];
    if (percent < 76) return ['L3｜数据运行型', '主要机制已进入数据运行阶段，应重点强化异常闭环、系统固化与跨场景复制。'];
    return ['L4｜系统复制型', '体系成熟度较高，下一步重点是经营结果验证、持续改善和跨产品／产线／工厂复制。'];
  }

  function radarPoints(values) {
    const cx = 160;
    const cy = 160;
    const maxR = 104;
    return values.map((value, index) => {
      const angle = (-Math.PI / 2) + (Math.PI * 2 * index / values.length);
      const r = maxR * (value / 4);
      return `${(cx + Math.cos(angle) * r).toFixed(1)},${(cy + Math.sin(angle) * r).toFixed(1)}`;
    }).join(' ');
  }

  function renderBars(scores) {
    bars.innerHTML = dimensions.map((dimension) => {
      const value = scores[dimension];
      const percent = Math.round((value / 4) * 100);
      return `<div class="qily-diagnosis-bar"><strong>${dimension}</strong><div class="qily-diagnosis-track" aria-hidden="true"><div class="qily-diagnosis-fill" style="width:${percent}%"></div></div><b>${value.toFixed(1)}</b></div>`;
    }).join('');
  }

  function renderPriorities(scores) {
    const ordered = dimensions.slice().sort((a, b) => scores[a] - scores[b]).slice(0, 3);
    priorities.innerHTML = ordered.map((dimension, index) => `<article class="qily-diagnosis-priority"><small>PRIORITY｜0${index + 1}</small><h3>${dimension}</h3><p>${suggestions[dimension]}</p></article>`).join('');
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const selects = Array.from(form.querySelectorAll('select[data-dimension]'));
    const incomplete = selects.find((select) => select.value === '');
    if (incomplete) {
      errorEl.textContent = '请完成全部24项评价后再生成结果。';
      incomplete.focus();
      return;
    }
    errorEl.textContent = '';

    const buckets = Object.fromEntries(dimensions.map((dimension) => [dimension, []]));
    selects.forEach((select) => buckets[select.dataset.dimension].push(Number(select.value)));
    const scores = {};
    dimensions.forEach((dimension) => {
      const values = buckets[dimension];
      scores[dimension] = values.reduce((sum, value) => sum + value, 0) / values.length;
    });

    const total = selects.reduce((sum, select) => sum + Number(select.value), 0);
    const percent = Math.round((total / (selects.length * 4)) * 100);
    const [level, summary] = levelFor(percent);

    scoreEl.textContent = `${percent}`;
    levelEl.textContent = level;
    summaryEl.textContent = summary;
    renderBars(scores);
    renderPriorities(scores);
    radar.setAttribute('points', radarPoints(dimensions.map((dimension) => scores[dimension])));
    result.hidden = false;
    result.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
  });

  form.addEventListener('reset', () => {
    window.setTimeout(() => {
      result.hidden = true;
      errorEl.textContent = '';
    }, 0);
  });
})();
