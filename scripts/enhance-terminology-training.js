#!/usr/bin/env node
'use strict';
const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
const terminologyFile=path.join(root,'knowledge','terminology.html');
const knowledgeFile=path.join(root,'knowledge','index.html');
const formulas={
  TT:'客户需求节拍＝可用生产时间 ÷ 客户需求量。时间单位与需求周期必须一致。',
  PCE:'流程周期效率＝增值时间 ÷ 总交付周期 × 100%。总周期应包含加工、等待、库存和流动。',
  OEE:'设备综合效率＝可动率 × 性能效率 × 质量率。三项口径必须使用同一计划生产时间边界。',
  UPH:'每小时产出＝合格产出 ÷ 实际生产小时。该指标不除以投入人数，须明确统计对象是产线、设备、工序还是班组。',
  UPPH:'人均小时产出＝合格产出 ÷（直接人力 × 实际生产小时）。跨产品比较时应同步说明标准工时和工艺差异。',
  FPY:'一次通过率＝一次合格数量 ÷ 投入数量 × 100%。返工后合格不能计入一次合格。',
  ROI:'投资回报率＝期间净收益 ÷ 项目总投入 × 100%。净收益应扣除维护、能耗、耗材和持续运行成本。',
  'Inventory Turnover':'库存周转率＝期间销售成本 ÷ 平均库存；平均库存＝（期初库存＋期末库存）÷2。库存周转天数＝期间天数 ÷ 库存周转率。',
  'Line Balance Rate':'线平衡率＝工序总作业时间 ÷（工位数 × 瓶颈周期）×100%。',
  'Capacity Utilization':'产能利用率＝实际产出或实际工时 ÷ 可用产能或可用工时 ×100%。计算前须统一理论产能与计划产能边界。',
  Yield:'良率＝合格数量 ÷ 投入数量 ×100%。须明确是否包含返工、报废和重复检验。',
  DPPM:'DPPM＝缺陷品数量 ÷ 交付总数量 ×1,000,000。客户口径可能按缺陷数或不良品数统计，须先确认。',
  Cpk:'Cpk＝min[(USL－平均值)÷3σ，(平均值－LSL)÷3σ]，用于评价过程中心与规格界限之间的能力。',
  Cp:'Cp＝(USL－LSL)÷6σ，只反映过程波动宽度，不反映中心偏移。'
};
function plain(v){return String(v||'').replace(/<[^>]+>/g,'').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/\s+/g,' ').trim();}
function esc(v){return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function replaceCard(page,code,html){
  const pattern=new RegExp('<article class="term-card" data-term-card[^>]*>\\s*<div class="term-code">'+code.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'<\\/div>[\\s\\S]*?<\\/article>','i');
  if(!pattern.test(page))throw new Error(code+' terminology card was not found');
  return page.replace(pattern,html);
}
function addInventory(page){
  if(/class="term-code">Inventory Turnover</i.test(page))return page;
  const card=`<article class="term-card" data-term-card><div class="term-code">Inventory Turnover</div><div class="term-en">Inventory Turnover Ratio</div><h3>库存周转率</h3><p class="term-formula"><strong>计算公式／判定：</strong>${esc(formulas['Inventory Turnover'])}</p><p><strong>应用场景：</strong>用于衡量库存转化为销售成本或完成出货的速度，适合PMC、采购、仓储、财务与经营管理联合评估原材料、在制品和成品占用。周转率偏低通常提示积压、呆滞、批量过大或需求预测偏差；周转率过高也可能意味着安全库存不足或缺料风险，应与周转天数、呆滞金额、缺料次数、交付达成率和现金占用共同判断。</p></article>`;
  const wip=/(<article class="term-card" data-term-card>\s*<div class="term-code">WIP<\/div>[\s\S]*?<\/article>)/i;
  if(!wip.test(page))throw new Error('WIP terminology card was not found');
  return page.replace(wip,`$1\n${card}`);
}
function refineProductivity(page){
  page=replaceCard(page,'UPH',`<article class="term-card" data-term-card data-keywords="小时产能 单位小时产量 产线产出 设备产出"><div class="term-code">UPH</div><div class="term-en">Units Per Hour</div><h3>每小时产出／单位小时产量</h3><p class="term-formula"><strong>计算公式／判定：</strong>${esc(formulas.UPH)}</p><p><strong>应用场景：</strong>用于衡量产线、设备、工序或班组在单位时间内完成的合格产量，常用于小时产能监控、节拍验证、瓶颈分析和排产能力确认。UPH只反映单位时间产出，不考虑投入人数；即使增加人力后UPH提高，也不能据此判断人效同步提高，需要评价人工效率时应使用UPPH。</p></article>`);
  return replaceCard(page,'UPPH',`<article class="term-card" data-term-card data-keywords="人效 人均产出 单位人工小时产出 劳动生产率"><div class="term-code">UPPH</div><div class="term-en">Units Per Person Hour</div><h3>人均小时产出／单位人工小时产量</h3><p class="term-formula"><strong>计算公式／判定：</strong>${esc(formulas.UPPH)}</p><p><strong>应用场景：</strong>用于衡量投入人工后的生产效率，适合比较不同产线、班组、产品或改善前后的人效。UPPH的分母包含直接人数与生产小时；即使UPH相同，投入人数不同，UPPH也会不同。统计时须统一合格产出、直接人力、实际生产时间、辅助人员是否计入及异常停线口径。</p></article>`);
}
function ensureFormulas(page){return page.replace(/<article class="term-card" data-term-card([^>]*)>([\s\S]*?)<\/article>/g,(article,_a,inner)=>{const code=plain((inner.match(/<div class="term-code">([\s\S]*?)<\/div>/)||[])[1]);const formula=formulas[code];return !formula||/class="term-formula"/.test(article)?article:article.replace(/(<h3>[\s\S]*?<\/h3>)/,`$1\n<p class="term-formula"><strong>计算公式／判定：</strong>${esc(formula)}</p>`);});}
function styles(page){
  const css=`
/* terminology-search-v4 */
.term-card{display:flex;min-height:0;flex-direction:column;gap:0}.term-code::before,.term-en::before,.term-card h3::before{display:block;margin-bottom:5px;color:var(--qily-teal,#178b94);font-size:12px;font-weight:900;letter-spacing:.08em;text-transform:uppercase}.term-code::before{content:"术语代码"}.term-en::before{content:"英文全称"}.term-card h3::before{content:"中文名称"}.term-formula{margin-top:10px!important;padding:11px 13px;border-left:4px solid #caa15f;background:#fff8e8;color:#344845!important}.term-card>p:last-child{margin-top:10px;padding-top:12px;border-top:1px dashed var(--qily-line,#d5e4e3)}.term-card>p strong{display:inline-block;margin-right:2px}.term-search-results{display:none;margin-top:18px}.term-search-results.show{display:block}.term-search-results .module-heading{margin:0 0 14px}.term-search-results .module-heading p{margin-bottom:0}.term-search-hit{position:relative;cursor:pointer;transition:transform .16s ease,border-color .16s ease,box-shadow .16s ease}.term-search-hit:hover,.term-search-hit:focus-visible{transform:translateY(-2px);border-color:var(--qily-teal,#178b94);box-shadow:0 12px 30px rgba(15,75,90,.14);outline:none}.term-jump-hint{margin-top:auto;padding-top:12px;color:var(--qily-teal,#178b94);font-size:13px;font-weight:900}.term-focus{animation:term-focus 1.8s ease}@keyframes term-focus{0%,100%{box-shadow:0 8px 24px rgba(15,75,90,.06)}25%,70%{box-shadow:0 0 0 4px rgba(23,139,148,.2),0 14px 34px rgba(15,75,90,.16);border-color:var(--qily-teal,#178b94)}}@media(max-width:760px){.term-card{padding:18px}.term-code{font-size:24px}.term-card h3{font-size:20px}.term-card p{font-size:15.5px;line-height:1.68}}
`;
  const block=/\n*\/\* terminology-(?:training-v2|compact-v3|search-v4) \*\/[\s\S]*?(?=\/\* terminology-opl-v1 \*\/|<\/style>)/;
  return block.test(page)?page.replace(block,css):page.replace('</style>',css+'</style>');
}
function searchUpgrade(page){
  page=page.replace(/placeholder="[^"]*VSM[^"]*"/,'placeholder="输入术语代码、英文全称或中文名称，例如：UPH、UPPH、标准工时"').replace(/未找到[^<]*术语[^<]*。/,'未找到名称相符的术语，请检查代码或尝试更短的中文名称。');
  const script=`<script>
(function(){
var input=document.getElementById('termSearch'),cards=Array.prototype.slice.call(document.querySelectorAll('[data-term-card]')),count=document.getElementById('termCount'),empty=document.getElementById('termEmpty'),sections=[];
cards.forEach(function(card,index){var section=card.closest('.module-section[id]');if(section&&sections.indexOf(section)<0)sections.push(section);var code=(card.querySelector('.term-code')||{}).textContent||'';if(!card.id)card.id='term-'+String(code).toLowerCase().replace(/[^a-z0-9\\u4e00-\\u9fff]+/g,'-').replace(/^-|-$/g,'')+'-'+index;});
var results=document.createElement('div');results.className='term-search-results';results.setAttribute('aria-live','polite');results.innerHTML='<div class="module-heading"><h2>搜索结果</h2><p>匹配术语代码、英文全称、中文名称和专用别名，并按相关度排序；点击结果直接定位原词条。</p></div><div class="term-grid" id="termSearchGrid"></div>';empty.parentNode.insertBefore(results,empty.nextSibling);var grid=document.getElementById('termSearchGrid');
function norm(v){return String(v||'').normalize('NFKC').trim().toLocaleLowerCase('zh-CN').replace(/\\s+/g,' ');}function compact(v){return norm(v).replace(/[\\s\\-_/+()（）·,.，。:：]/g,'');}
function fields(card){return{code:norm((card.querySelector('.term-code')||{}).textContent),en:norm((card.querySelector('.term-en')||{}).textContent),zh:norm((card.querySelector('h3')||{}).textContent),aliases:norm(card.getAttribute('data-keywords')||'')};}
function score(card,q){var f=fields(card),qc=compact(q),cc=compact(f.code),tokens=f.code.split(/[^a-z0-9\\u4e00-\\u9fff]+/).filter(Boolean);if(f.code===q||cc===qc)return 1200;if(tokens.indexOf(q)>=0)return 1150;if(f.zh===q||f.en===q)return 1100;if(f.code.indexOf(q)===0||cc.indexOf(qc)===0)return 1000;if(f.zh.indexOf(q)===0)return 900;if(f.en.split(/\\s+/).some(function(w){return w.indexOf(q)===0;}))return 850;if(f.code.indexOf(q)>=0||cc.indexOf(qc)>=0)return 800;if(f.zh.indexOf(q)>=0)return 700;if(f.en.indexOf(q)>=0)return 600;if(f.aliases&&f.aliases.indexOf(q)>=0)return 500;return-1;}
function categories(show){sections.forEach(function(section){section.hidden=!show;});}
function locate(card){var code=(card.querySelector('.term-code')||{}).textContent||'';input.value='';render();try{history.replaceState(null,'',location.pathname+'?term='+encodeURIComponent(code)+'#'+card.id);}catch(error){}requestAnimationFrame(function(){card.scrollIntoView({behavior:'smooth',block:'center'});card.classList.remove('term-focus');void card.offsetWidth;card.classList.add('term-focus');setTimeout(function(){card.classList.remove('term-focus');},1900);});}
function clone(original){var hit=original.cloneNode(true);hit.removeAttribute('id');hit.classList.add('term-search-hit');hit.setAttribute('role','link');hit.setAttribute('tabindex','0');var hint=document.createElement('div');hint.className='term-jump-hint';hint.textContent='点击进入该词条的原分类位置';hit.appendChild(hint);hit.addEventListener('click',function(){locate(original);});hit.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();locate(original);}});return hit;}
function render(){var q=norm(input.value);grid.innerHTML='';if(!q){categories(true);results.classList.remove('show');empty.style.display='none';count.textContent='共收录 '+cards.length+' 项术语';return;}var matches=cards.map(function(card,index){return{card:card,index:index,score:score(card,q)};}).filter(function(x){return x.score>=0;}).sort(function(a,b){return b.score-a.score||a.index-b.index;});categories(false);results.classList.toggle('show',matches.length>0);empty.style.display=matches.length?'none':'block';matches.forEach(function(x){grid.appendChild(clone(x.card));});count.textContent=matches.length?'找到 '+matches.length+' 项相关术语（已按相关度排序）':'未找到相关术语';}
input.addEventListener('input',render,{passive:true});input.addEventListener('search',render,{passive:true});
var requested=new URLSearchParams(location.search).get('term')||'';if(requested){var target=cards.find(function(card){var f=fields(card);return f.code===norm(requested)||f.zh===norm(requested);});if(target)locate(target);}
})();
</script>`;
  const old=/<script>\s*\(function\(\)\{\s*var input=document\.getElementById\('termSearch'\)[\s\S]*?<\/script>/;
  if(!old.test(page))throw new Error('Terminology search script was not found');return page.replace(old,script);
}
function updateCounts(page){const count=(page.match(/<article class="term-card" data-term-card(?:\s[^>]*)?>/g)||[]).length;page=page.replace(/：\d+项英文、字母代码及标准编号/,`：${count}项英文、字母代码及标准编号`).replace(/共收录\s*\d+\s*项术语/g,`共收录 ${count} 项术语`);return{page,count};}
function main(){let page=fs.readFileSync(terminologyFile,'utf8');page=addInventory(page);page=refineProductivity(page);page=page.replace(/\s*<p class="term-overview">[\s\S]*?<\/p>/g,'');page=ensureFormulas(page);page=styles(page);page=searchUpgrade(page);page=page.replace(/<p class="module-lead">[\s\S]*?<\/p>/,'<p class="module-lead">集中解释制造管理、精益改善、工程开发、质量体系、生产计划、数智化系统与电子制造专业术语。每项保留术语代码、英文全称、中文名称和具体应用场景，并一对一匹配可展开、可打印、可分享的单点培训课件；关键指标同步提供计算公式、数据口径、现场案例与掌握检查。</p>');const result=updateCounts(page);fs.writeFileSync(terminologyFile,result.page);let index=fs.readFileSync(knowledgeFile,'utf8').replace(/\d+项英文、字母代码及标准编号/g,`${result.count}项英文、字母代码及标准编号`).replace(/\d+项术语/g,`${result.count}项术语`);fs.writeFileSync(knowledgeFile,index);process.stdout.write(`Terminology page upgraded with distinct UPH/UPPH definitions and ranked search across ${result.count} terms.\n`);}
main();
