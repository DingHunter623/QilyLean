#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const terminologyFile = path.join(root, 'knowledge', 'terminology.html');
const knowledgeFile = path.join(root, 'knowledge', 'index.html');

function text(value) {
  return String(value || '')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]);
}

const formulas = {
  'TT': '客户需求节拍＝可用生产时间 ÷ 客户需求量。时间单位与需求周期必须一致。',
  'PCE': '流程周期效率＝增值时间 ÷ 总交付周期 × 100%。总周期应包含加工、等待、库存和流动。',
  'OEE': '设备综合效率＝可动率 × 性能效率 × 质量率。三项口径必须使用同一计划生产时间边界。',
  'UPH': '每小时产出＝合格产出 ÷ 实际生产小时。该指标不除以投入人数，须明确统计对象是产线、设备、工序还是班组。',
  'UPPH': '人均小时产出＝合格产出 ÷（直接人力 × 实际生产小时）。跨产品比较时应同步说明标准工时和工艺差异。',
  'FPY': '一次通过率＝一次合格数量 ÷ 投入数量 × 100%。返工后合格不能计入一次合格。',
  'ROI': '投资回报率＝期间净收益 ÷ 项目总投入 × 100%。净收益应扣除维护、能耗、耗材和持续运行成本。',
  'Inventory Turnover': '库存周转率＝期间销售成本 ÷ 平均库存；平均库存＝（期初库存＋期末库存）÷2。库存周转天数＝期间天数 ÷ 库存周转率。',
  'Line Balance Rate': '线平衡率＝工序总作业时间 ÷（工位数 × 瓶颈周期）×100%。',
  'Capacity Utilization': '产能利用率＝实际产出或实际工时 ÷ 可用产能或可用工时 ×100%。计算前须统一理论产能与计划产能边界。',
  'Yield': '良率＝合格数量 ÷ 投入数量 ×100%。须明确是否包含返工、报废和重复检验。',
  'DPPM': 'DPPM＝缺陷品数量 ÷ 交付总数量 ×1,000,000。客户口径可能按缺陷数或不良品数统计，须先确认。',
  'Cpk': 'Cpk＝min[(USL－平均值)÷3σ，(平均值－LSL)÷3σ]，用于评价过程中心与规格界限之间的能力。',
  'Cp': 'Cp＝(USL－LSL)÷6σ，只反映过程波动宽度，不反映中心偏移。'
};

function addInventoryTurnover(page) {
  if (/class="term-code">Inventory Turnover</i.test(page)) return page;
  const card = `<article class="term-card" data-term-card>
  <div class="term-code">Inventory Turnover</div>
  <div class="term-en">Inventory Turnover Ratio</div>
  <h3>库存周转率</h3>
  <p class="term-formula"><strong>计算公式／判定：</strong>${escapeHtml(formulas['Inventory Turnover'])}</p>
  <p><strong>应用场景：</strong>用于衡量库存转化为销售成本或完成出货的速度，适合PMC、采购、仓储、财务与经营管理联合评估原材料、在制品和成品占用。周转率偏低通常提示积压、呆滞、批量过大或需求预测偏差；周转率过高也可能意味着安全库存不足或缺料风险，应与周转天数、呆滞金额、缺料次数、交付达成率和现金占用共同判断。</p>
</article>`;
  const wipPattern = /(<article class="term-card" data-term-card>\s*<div class="term-code">WIP<\/div>[\s\S]*?<\/article>)/i;
  if (!wipPattern.test(page)) throw new Error('WIP terminology card was not found');
  return page.replace(wipPattern, `$1\n${card}`);
}

function addUph(page) {
  if (/class="term-code">UPH<\/div>/i.test(page)) return page;
  const card = `<article class="term-card" data-term-card data-keywords="小时产能 单位小时产量 产线产出 设备产出">
  <div class="term-code">UPH</div>
  <div class="term-en">Units Per Hour</div>
  <h3>每小时产出／单位小时产量</h3>
  <p class="term-formula"><strong>计算公式／判定：</strong>${escapeHtml(formulas.UPH)}</p>
  <p><strong>应用场景：</strong>用于衡量产线、设备、工序或班组在单位时间内完成的合格产量，常用于小时产能监控、节拍验证、瓶颈分析和排产能力确认。UPH只反映单位时间产出，不考虑投入人数；需要评价人效时应使用UPPH。</p>
</article>`;
  const upphPattern = /(<article class="term-card" data-term-card[^>]*>\s*<div class="term-code">UPPH<\/div>[\s\S]*?<\/article>)/i;
  if (!upphPattern.test(page)) throw new Error('UPPH terminology card was not found');
  return page.replace(upphPattern, `${card}\n$1`);
}

function improveUpph(page) {
  const replacement = `<article class="term-card" data-term-card data-keywords="人效 人均产出 单位人工小时产出 劳动生产率">
  <div class="term-code">UPPH</div>
  <div class="term-en">Units Per Person Hour</div>
  <h3>人均小时产出／单位人工小时产量</h3>
  <p class="term-formula"><strong>计算公式／判定：</strong>${escapeHtml(formulas.UPPH)}</p>
  <p><strong>应用场景：</strong>用于衡量投入人工后的生产效率，适合比较不同产线、班组、产品或改善前后的人效。UPPH的分母包含直接人数与生产小时；即使UPH相同，投入人数不同，UPPH也会不同。统计时须统一合格产出、直接人力、实际生产时间、辅助人员是否计入及异常停线口径。</p>
</article>`;
  const pattern = /<article class="term-card" data-term-card[^>]*>\s*<div class="term-code">UPPH<\/div>[\s\S]*?<\/article>/i;
  if (!pattern.test(page)) throw new Error('UPPH terminology card was not found');
  return page.replace(pattern, replacement);
}

function removeBoilerplate(page) {
  return page.replace(/\s*<p class="term-overview">[\s\S]*?<\/p>/g, '');
}

function ensureFormulas(page) {
  return page.replace(/<article class="term-card" data-term-card([^>]*)>([\s\S]*?)<\/article>/g, (article, attributes, inner) => {
    const code = text((inner.match(/<div class="term-code">([\s\S]*?)<\/div>/) || [])[1]);
    const formula = formulas[code];
    if (!formula || /class="term-formula"/.test(article)) return article;
    return article.replace(/(<h3>[\s\S]*?<\/h3>)/, `$1\n  <p class="term-formula"><strong>计算公式／判定：</strong>${escapeHtml(formula)}</p>`);
  });
}

function updateStyles(page) {
  const styles = `
/* terminology-search-v4 */
.term-card{display:flex;min-height:0;flex-direction:column;gap:0}
.term-code::before,.term-en::before,.term-card h3::before{display:block;margin-bottom:5px;color:var(--qily-teal,#178b94);font-size:12px;font-weight:900;letter-spacing:.08em;text-transform:uppercase}
.term-code::before{content:"术语代码"}.term-en::before{content:"英文全称"}.term-card h3::before{content:"中文名称"}
.term-formula{margin-top:10px!important;padding:11px 13px;border-left:4px solid #caa15f;background:#fff8e8;color:#344845!important}
.term-card>p:last-child{margin-top:10px;padding-top:12px;border-top:1px dashed var(--qily-line,#d5e4e3)}
.term-card>p strong{display:inline-block;margin-right:2px}
.term-search-results{display:none;margin-top:18px}.term-search-results.show{display:block}
.term-search-results .module-heading{margin:0 0 14px}.term-search-results .module-heading p{margin-bottom:0}
.term-search-hit{position:relative;cursor:pointer;transition:transform .16s ease,border-color .16s ease,box-shadow .16s ease}
.term-search-hit:hover,.term-search-hit:focus-visible{transform:translateY(-2px);border-color:var(--qily-teal,#178b94);box-shadow:0 12px 30px rgba(15,75,90,.14);outline:none}
.term-jump-hint{margin-top:auto;padding-top:12px;color:var(--qily-teal,#178b94);font-size:13px;font-weight:900}
.term-focus{animation:term-focus 1.8s ease}
@keyframes term-focus{0%,100%{box-shadow:0 8px 24px rgba(15,75,90,.06)}25%,70%{box-shadow:0 0 0 4px rgba(23,139,148,.2),0 14px 34px rgba(15,75,90,.16);border-color:var(--qily-teal,#178b94)}}
@media(max-width:760px){.term-card{padding:18px}.term-code{font-size:24px}.term-card h3{font-size:20px}.term-card p{font-size:15.5px;line-height:1.68}}
`;
  if (/\/\* terminology-(?:training-v2|compact-v3|search-v4) \*\/[\s\S]*?<\/style>/.test(page)) {
    return page.replace(/\/\* terminology-(?:training-v2|compact-v3|search-v4) \*\/[\s\S]*?<\/style>/, `${styles}</style>`);
  }
  return page.replace('</style>', `${styles}</style>`);
}

function updateSearchExperience(page) {
  page = page
    .replace('placeholder="输入英文、代码或中文，例如：VSM、标准工时、抽样检验"', 'placeholder="输入术语代码、英文全称或中文名称，例如：UPH、UPPH、标准工时"')
    .replace('未找到对应术语，请尝试更短的代码或中文关键词。', '未找到名称相符的术语，请检查代码或尝试更短的中文名称。');

  const searchScript = `<script>
(function(){
  var input=document.getElementById('termSearch');
  var cards=Array.prototype.slice.call(document.querySelectorAll('[data-term-card]'));
  var count=document.getElementById('termCount');
  var empty=document.getElementById('termEmpty');
  var categorySections=[];
  cards.forEach(function(card,index){
    var section=card.closest('.module-section[id]');
    if(section&&categorySections.indexOf(section)===-1)categorySections.push(section);
    var code=(card.querySelector('.term-code')||{}).textContent||'';
    var id='term-'+String(code).toLowerCase().replace(/[^a-z0-9\\u4e00-\\u9fff]+/g,'-').replace(/^-|-$/g,'')+'-'+index;
    if(!card.id)card.id=id;
  });

  var results=document.createElement('div');
  results.className='term-search-results';
  results.id='termSearchResults';
  results.setAttribute('aria-live','polite');
  results.innerHTML='<div class="module-heading"><h2>搜索结果</h2><p>仅匹配术语代码、英文全称、中文名称和专用别名，并按相关度排序；点击词条可返回原分类位置。</p></div><div class="term-grid" id="termSearchGrid"></div>';
  empty.parentNode.insertBefore(results,empty.nextSibling);
  var resultGrid=document.getElementById('termSearchGrid');

  function normalize(value){
    return String(value||'').normalize('NFKC').trim().toLocaleLowerCase('zh-CN').replace(/\\s+/g,' ');
  }
  function compact(value){
    return normalize(value).replace(/[\\s\\-_/+()（）·,.，。:：]/g,'');
  }
  function values(card){
    return {
      code:normalize((card.querySelector('.term-code')||{}).textContent),
      en:normalize((card.querySelector('.term-en')||{}).textContent),
      zh:normalize((card.querySelector('h3')||{}).textContent),
      aliases:normalize(card.getAttribute('data-keywords')||'')
    };
  }
  function score(card,query){
    var field=values(card);
    var q=normalize(query);
    var qc=compact(q);
    var codeCompact=compact(field.code);
    var codeTokens=field.code.split(/[^a-z0-9\\u4e00-\\u9fff]+/).filter(Boolean);
    if(!q)return 0;
    if(field.code===q||codeCompact===qc)return 1200;
    if(codeTokens.indexOf(q)!==-1)return 1150;
    if(field.zh===q||field.en===q)return 1100;
    if(field.code.indexOf(q)===0||codeCompact.indexOf(qc)===0)return 1000;
    if(field.zh.indexOf(q)===0)return 900;
    if(field.en.split(/\\s+/).some(function(word){return word.indexOf(q)===0;}))return 850;
    if(field.code.indexOf(q)!==-1||codeCompact.indexOf(qc)!==-1)return 800;
    if(field.zh.indexOf(q)!==-1)return 700;
    if(field.en.indexOf(q)!==-1)return 600;
    if(field.aliases&&field.aliases.indexOf(q)!==-1)return 500;
    return -1;
  }
  function showCategories(visible){
    categorySections.forEach(function(section){section.hidden=!visible;});
  }
  function locate(card){
    input.value='';
    render();
    window.requestAnimationFrame(function(){
      card.scrollIntoView({behavior:'smooth',block:'center'});
      card.classList.remove('term-focus');
      void card.offsetWidth;
      card.classList.add('term-focus');
      window.setTimeout(function(){card.classList.remove('term-focus');},1900);
    });
  }
  function resultCard(original){
    var clone=original.cloneNode(true);
    clone.removeAttribute('id');
    clone.classList.add('term-search-hit');
    clone.setAttribute('role','button');
    clone.setAttribute('tabindex','0');
    var code=(original.querySelector('.term-code')||{}).textContent||'该术语';
    clone.setAttribute('aria-label','定位到 '+code+' 原词条');
    var hint=document.createElement('div');
    hint.className='term-jump-hint';
    hint.textContent='点击定位原词条';
    clone.appendChild(hint);
    clone.addEventListener('click',function(){locate(original);});
    clone.addEventListener('keydown',function(event){
      if(event.key==='Enter'||event.key===' '){event.preventDefault();locate(original);}
    });
    return clone;
  }
  function render(){
    var query=normalize(input.value);
    resultGrid.innerHTML='';
    if(!query){
      showCategories(true);
      results.classList.remove('show');
      empty.style.display='none';
      count.textContent='共收录 '+cards.length+' 项术语';
      return;
    }
    var matches=cards.map(function(card,index){return{card:card,index:index,score:score(card,query)};})
      .filter(function(item){return item.score>=0;})
      .sort(function(a,b){return b.score-a.score||a.index-b.index;});
    showCategories(false);
    results.classList.toggle('show',matches.length>0);
    empty.style.display=matches.length?'none':'block';
    matches.forEach(function(item){resultGrid.appendChild(resultCard(item.card));});
    count.textContent=matches.length?'找到 '+matches.length+' 项相关术语（已按相关度排序）':'未找到相关术语';
  }
  input.addEventListener('input',render,{passive:true});
  input.addEventListener('search',render,{passive:true});
})();
</script>`;

  const pattern = /<script>\s*\(function\(\)\{\s*var input=document\.getElementById\('termSearch'\);[\s\S]*?<\/script>/;
  if (!pattern.test(page)) throw new Error('Terminology search script was not found');
  return page.replace(pattern, searchScript);
}

function updateCounts(page) {
  const count = (page.match(/<article class="term-card" data-term-card(?:\s[^>]*)?>/g) || []).length;
  page = page
    .replace(/：\d+项英文、字母代码及标准编号/, `：${count}项英文、字母代码及标准编号`)
    .replace(/共收录\s*\d+\s*项术语/g, `共收录 ${count} 项术语`);
  return { page, count };
}

function improveLead(page) {
  return page.replace(
    /<p class="module-lead">[\s\S]*?<\/p>/,
    '<p class="module-lead">集中解释制造管理、精益改善、工程开发、质量体系、生产计划、数智化系统与电子制造专业术语。每项保留术语代码、英文全称、中文名称和具体应用场景；仅对关键指标补充计算公式或判定口径，便于快速查阅与培训引用。</p>'
  );
}

function updateKnowledgeIndex(count) {
  let page = fs.readFileSync(knowledgeFile, 'utf8');
  page = page.replace(/\d+项英文、字母代码及标准编号/g, `${count}项英文、字母代码及标准编号`);
  page = page.replace(/\d+项术语/g, `${count}项术语`);
  fs.writeFileSync(knowledgeFile, page);
}

function main() {
  let page = fs.readFileSync(terminologyFile, 'utf8');
  page = addInventoryTurnover(page);
  page = improveUpph(page);
  page = addUph(page);
  page = removeBoilerplate(page);
  page = ensureFormulas(page);
  page = updateStyles(page);
  page = updateSearchExperience(page);
  page = improveLead(page);
  const result = updateCounts(page);
  fs.writeFileSync(terminologyFile, result.page);
  updateKnowledgeIndex(result.count);
  process.stdout.write(`Terminology page upgraded with UPH/UPPH definitions and ranked search across ${result.count} terms.\n`);
}

main();
