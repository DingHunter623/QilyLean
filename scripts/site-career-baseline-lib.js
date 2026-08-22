'use strict';

const MARKER = '<!-- QILY-STATIC-CAREER-BASELINE:v1 -->';

const career2019Companies = `<div class="career-company-group" aria-label="任职公司与官方网站"><p class="career-company-line"><b>任职公司：</b><span class="career-company-name"><span lang="en">Guangdong Jinggon Intelligence System Co., Ltd.</span><span aria-hidden="true">｜</span><span>广东精工智能系统有限公司</span></span><a class="career-company-official" href="https://www.jinggon.com/" target="_blank" rel="noopener noreferrer external">官方网站：JINGGON｜精工智能（www.jinggon.com） ↗</a></p><p class="career-company-line"><b>任职公司：</b><span class="career-company-name"><span lang="en">GO-think（官方英文品牌）</span><span aria-hidden="true">｜</span><span>广东高胜互联科技有限公司</span></span><a class="career-company-official" href="https://www.gdgaosheng.cn/" target="_blank" rel="noopener noreferrer external">官方网站：GO-think｜高胜咨询（www.gdgaosheng.cn） ↗</a></p></div>`;

const career2015Companies = `<div class="career-company-group" aria-label="任职公司与官方网站"><p class="career-company-line"><b>任职公司：</b><span class="career-company-name"><span lang="en">Shenzhen Mason Technologies Co., Ltd.</span><span aria-hidden="true">｜</span><span>深圳万润科技股份有限公司</span></span><a class="career-company-official" href="https://www.masonled.com/" target="_blank" rel="noopener noreferrer external">上市公司官方网站：MASON｜万润科技（www.masonled.com） ↗</a></p><p class="career-company-line"><b>任职公司：</b><span class="career-company-name"><span lang="en">MASON LED（官方品牌）</span><span aria-hidden="true">｜</span><span>广东恒润光电有限公司</span></span><a class="career-company-official" href="https://www.mason-led.com/" target="_blank" rel="noopener noreferrer external">子公司官方网站：MASON LED｜恒润光电（www.mason-led.com） ↗</a></p></div>`;

const career2009 = `<article class="career-full-card" id="career-2009-2015" data-qily-baseline="career"><small>2009.07—2015.06｜Cooper Bussmann（现 Eaton Bussmann）保险丝制造｜生产技术、先后PE工程、IE工程（美资企业：东莞库柏电子）</small><h3>Cooper Bussmann保险丝｜生产技术／先后PE工程、IE工程</h3><div class="career-company-group" aria-label="任职公司与官方网站"><p class="career-company-line"><b>任职公司：</b><span class="career-company-name"><span lang="en">Dongguan Cooper Electronics Co., Ltd.</span><span aria-hidden="true">｜</span><span>东莞库柏电子有限公司｜Cooper Bussmann（现 Eaton Bussmann）保险丝制造</span></span><a class="career-company-official" href="https://www.eaton.com.cn/cn/zh-cn.html" target="_blank" rel="noopener noreferrer external">现集团官方网站：Eaton｜伊顿（Bussmann 系列） ↗</a></p></div><p class="career-stage-summary">长期在东莞库柏电子从事 Cooper Bussmann（现 Eaton Bussmann）保险丝制造相关生产技术与PE工程，产品工艺涵盖SMD、DIP、砖块保险丝、陶瓷管／玻璃管保险丝及汽车插片保险丝，负责工艺优化、设备与品质异常处理及量产稳定性改善。随后逐步转向IE工程，围绕标准工时、产能分析、工序平衡、人员配置、效率提升与现场改善，形成由生产技术、PE工程向IE工程延伸的能力路径。该国际品牌制造经历也成为后续进入上市公司并晋升工程管理岗位的重要职业背书之一。</p><p class="career-industry"><b>制造与工程场景：</b>覆盖SMD、DIP、砖块保险丝、陶瓷管／玻璃管保险丝及汽车插片保险丝等产品与工艺形态。</p><h4>职责范围</h4><ul><li>负责保险丝制程参数、设备与工装、品质异常、量产稳定性及工艺标准维护，推动现场问题由临时处理转为参数、方法和标准闭环。</li><li>先后承担PE工程与IE工程职责，开展Time Study、标准工时、产能分析、工序平衡、人员配置、动作改善及效率提升。</li><li>围绕玻璃管切割、烧口、夹脚、沾银、镀铜及DAP真空熔炉等关键环节开展制程分析、试验验证和标准固化。</li></ul><h4>关键成果与能力沉淀</h4><ul><li>保险丝玻璃管切口与夹脚断裂问题经刀具、参数和定位改善后，断裂率由约12%降至1%以内。</li><li>DAP真空熔炉程序与沾银陶瓷管工艺优化后，关键制程直通率提升至96%以上。</li><li>建立由生产技术与PE工程向标准工时、产能、人力和线平衡管理延伸的IE工作基础。</li><li>Cooper Bussmann国际品牌制造经历成为后续进入上市公司并晋升工程管理岗位的重要职业背书之一。</li></ul><div class="career-result">能力沉淀：Cooper Bussmann保险丝多工艺制程技术、PE异常闭环、Time Study、标准工时、产能与人力配置，以及生产技术、PE工程向IE工程的完整能力转化。</div></article>`;

const career2006 = `<article class="career-full-card" id="career-2006-2009" data-qily-baseline="career"><small>2006.07—2009.06｜PCBA TE工程／IE工程（欧美合资企业：珠海伟创力制造）</small><h3>PCBA TE工程／IE工程</h3><div class="career-company-group" aria-label="任职公司与官方网站"><p class="career-company-line"><b>任职公司：</b><span class="career-company-name"><span lang="en">Flextronics Manufacturing (Zhuhai) Co., Ltd.</span><span aria-hidden="true">｜</span><span>伟创力制造（珠海）有限公司</span></span><a class="career-company-official" href="https://flex.com/zh/" target="_blank" rel="noopener noreferrer external">官方网站：Flex｜伟创力 ↗</a></p></div><p class="career-stage-summary">参与摩托罗拉、诺基亚、华为等品牌手机，以及戴尔、华硕、联想等品牌电脑与服务器产品的PCBA测试、异常分析、维修验证和量产支持。随后延伸至工业工程领域，围绕标准工时、生产效率、工序平衡、流程优化与现场改善，建立制造工程与IE改善基础。</p><p class="career-industry"><b>制造与工程场景：</b>涵盖摩托罗拉、诺基亚、华为等品牌手机，以及戴尔、华硕、联想等品牌电脑与服务器产品。</p><h4>职责范围</h4><ul><li>参与PCBA测试、故障定位、异常分析、维修验证、测试结果确认及量产支持，协同生产、品质和工程人员关闭现场问题。</li><li>由TE工程逐步延伸至IE工程，开展作业观察、时间研究、标准工时、工序平衡、产能评估和现场流程优化。</li><li>参与SOP／SWI整理、测试与作业方法标准化、制程效率改善及量产异常的5M2E分析。</li></ul><h4>关键成果与能力沉淀</h4><ul><li>形成从测试现象、故障定位、维修验证到量产恢复的基础工程闭环。</li><li>建立Time Study、标准工时、线平衡、流程优化与现场改善的工业工程基础。</li><li>积累手机、电脑及服务器PCBA多产品制造与测试场景经验。</li></ul><div class="career-result">基础沉淀：PCBA TE测试与异常分析、维修验证、标准工时、工序平衡、产能评估及制造现场IE方法。</div></article>`;

function materializeExperienceCareerBaseline(source) {
  let next = source;

  if (!next.includes(MARKER)) {
    next = next.replace('<div class="career-full-grid">', `${MARKER}\n  <div class="career-full-grid">`);
  }

  next = next.replace(
    /<article class="career-full-card"(?:\s+id="career-2019-2025")?(?:\s+data-qily-baseline="career")?><small>2019\.07—2025\.08｜广东精工智能系统 \/ 广东高胜互联科技（集团内调动）<\/small>/,
    '<article class="career-full-card" id="career-2019-2025" data-qily-baseline="career"><small>2019.07—2025.08｜广东精工智能系统 / 广东高胜互联科技（集团内调动）</small>'
  );

  next = next.replace(
    /<article class="career-full-card"(?:\s+id="career-2015-2019")?(?:\s+data-qily-baseline="career")?><small>2015\.07—2019\.06｜深圳万润科技·广东恒润光电有限公司(?:（上市公司：万润科技）)?<\/small>/,
    '<article class="career-full-card" id="career-2015-2019" data-qily-baseline="career"><small>2015.07—2019.06｜深圳万润科技·广东恒润光电有限公司（上市公司：万润科技）</small>'
  );

  next = next.replace(
    /(<article class="career-full-card" id="career-2019-2025" data-qily-baseline="career"><small>[\s\S]*?<h3>精益管理咨询顾问 \/ Lean项目交付负责人<\/h3>)(?!<div class="career-company-group")/,
    `$1${career2019Companies}`
  );

  next = next.replace(
    /(<article class="career-full-card" id="career-2015-2019" data-qily-baseline="career"><small>[\s\S]*?<h3>工程部部长（Light Bar事业部）<\/h3>)(?!<div class="career-company-group")/,
    `$1${career2015Companies}`
  );

  if (!next.includes('id="career-2009-2015"') || !next.includes('id="career-2006-2009"')) {
    next = next.replace(
      /<article class="career-full-card"><small>2006\.07—2015\.06｜东莞库柏电子 \/ 珠海伟创力制造（欧美企业）<\/small>[\s\S]*?<\/article>/,
      `${career2009}\n    ${career2006}`
    );
  }

  next = next.replace(
    '.career-chain strong{color:#ffe39b}',
    '.career-chain strong{color:#ffe39b!important;-webkit-text-fill-color:#ffe39b!important}'
  );

  next = next.replaceAll(
    'https://www.eaton.com.cn/cn/zh-cn.html',
    'https://www.eaton.com.cn/cn/zh-cn/products/electronic-components/circuit-protection/fuses.html'
  );

  return next;
}

module.exports = { MARKER, materializeExperienceCareerBaseline };
