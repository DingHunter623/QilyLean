from pathlib import Path
import re

changed = []

def read(rel):
    return Path(rel).read_text(encoding='utf-8')

def write(rel, text):
    path = Path(rel)
    old = path.read_text(encoding='utf-8')
    if text != old:
        path.write_text(text, encoding='utf-8')
        changed.append(rel)

# 1) Active pricing runtime: six cooperation capabilities must be represented in the pricing architecture.
rel = 'site-navigation-legacy-20260802.js'
s = read(rel)

if 'var digitalPricing = [' not in s:
    insertion = r'''  var digitalPricing = [
    { code: 'BLUEPRINT｜数字化蓝图', title: '数字化工厂规划与需求定义', price: '按范围独立核价', description: '围绕ERP／MES／APS、设备数据、生产透明化与管理看板，先完成业务流程、主数据、系统边界和实施路线定义。', basis: '核价依据：业务流程范围、系统模块、主数据治理深度、接口数量、现场调研、Pilot及上线验收责任。' },
    { code: 'DATA｜数据治理与看板', title: '主数据治理／生产看板专项', price: '按范围独立核价', description: '围绕BOM、工艺、标准工时、产能、设备、质量、库存等数据口径及管理看板形成专项交付。', basis: '核价依据：数据对象数量、现状质量、清洗与映射工作量、指标口径、看板数量及验证周期。' },
    { code: 'IMPLEMENTATION｜实施协同', title: '数字化系统实施协同与Pilot', price: '按范围独立核价', description: '以业务方角色参与需求澄清、接口确认、测试、Pilot、上线验证和阶段验收；底层软件产品研发由相应厂商负责。', basis: '核价依据：实施周期、驻场投入、系统接口、测试轮次、供应商协同、上线范围及验收责任。' }
  ];

  var appPricing = [
    { code: 'MVP｜原型验证', title: 'APP原型／MVP开发', price: '按范围独立核价', description: '从明确使用场景开始，完成需求梳理、交互原型、关键流程和最小可运行版本验证。', basis: '核价依据：平台数量、页面与流程复杂度、数据来源、权限、通知、离线能力和原型迭代轮次。' },
    { code: 'RELEASE｜正式版本', title: 'APP正式版开发与发布资料', price: '按范围独立核价', description: '在已确认需求基础上完成正式版本、测试、打包、发布资料、使用说明与验收记录。', basis: '核价依据：Android／iOS／Web范围、功能模块、第三方接口、测试矩阵、发布材料及审核配合工作量。' },
    { code: 'ITERATION｜持续迭代', title: '版本迭代与使用支持', price: '按范围独立核价', description: '针对已交付版本进行缺陷修复、功能迭代、兼容适配和使用支持，按版本范围独立确认。', basis: '核价依据：迭代周期、需求数量、兼容范围、历史代码状态、测试回归及支持边界。' }
  ];

  var websitePricing = [
    { code: 'ARCHITECTURE｜策划', title: '品牌定位与官网信息架构', price: '按范围独立核价', description: '围绕目标客户、核心业务、项目证据、内容层级和咨询转化建立网站信息架构与页面策略。', basis: '核价依据：页面规模、内容基础、品牌梳理深度、证据资产、SEO结构和交互复杂度。' },
    { code: 'BUILD｜建设', title: '响应式官网建设与部署', price: '按范围独立核价', description: '完成页面开发、响应式适配、基础SEO、表单／邮箱／分享入口、部署和上线检查。', basis: '核价依据：页面与模板数量、功能模块、动效、表单、结构化数据、部署环境及测试范围。' },
    { code: 'OPERATIONS｜运维', title: '内容迭代与持续运维', price: '按范围独立核价', description: '围绕内容更新、案例沉淀、SEO维护、性能、链接与版本治理形成持续运维机制。', basis: '核价依据：更新频率、内容数量、功能迭代、监测范围、第三方服务与响应时效。' }
  ];

'''
    marker = '  function pricingGrid(items) {'
    if marker not in s:
        raise SystemExit('pricingGrid marker missing')
    s = s.replace(marker, insertion + marker, 1)

# Add family header styles without touching established responsive/price card styling.
style_marker = "      '.qily-pricing-group{margin-top:22px;padding:22px;border:1px solid #d5e4e3;background:#f7fbfa}',"
if '.qily-pricing-family{' not in s:
    style_add = "\n      '.qily-pricing-family{display:flex;align-items:flex-end;justify-content:space-between;gap:18px;margin:28px 0 12px;padding:14px 16px;border-left:5px solid #0f6570;background:#eaf6f3}',\n      '.qily-pricing-family:first-child{margin-top:0}',\n      '.qily-pricing-family strong{color:#073c47;font-size:18px}',\n      '.qily-pricing-family span{color:#5f7474;font-size:14px;text-align:right}',"
    if style_marker not in s:
        raise SystemExit('pricing style marker missing')
    s = s.replace(style_marker, style_marker + style_add, 1)

new_render = r'''  function renderCooperationPrices(ladder, note) {
    ladder.dataset.qilyPublicPricingV5 = '1';
    ladder.className = 'price-ladder qily-pricing-overview';
    ladder.innerHTML = [
      '<div class="qily-pricing-family"><strong>A｜三类核心项目交付</strong><span>01–03已形成参考价；最终仍以范围、投入、交付物和验收责任核价。</span></div>',
      '<section class="qily-pricing-group"><div class="qily-pricing-group-head"><h3>01｜新工厂／车间布局规划</h3><p>以实战项目基准为基础，按规划深度与责任边界分层核价。</p></div>', pricingGrid(factoryPricing), '</section>',
      '<section class="qily-pricing-group"><div class="qily-pricing-group-head"><h3>02｜精益生产项目交付</h3><p>不按培训天数售卖，以基线、Pilot、实绩验证、标准固化和复制成果定义项目。</p></div>', pricingGrid(leanPricing), '</section>',
      '<section class="qily-pricing-group"><div class="qily-pricing-group-head"><h3>03｜目视化项目设计与交付</h3><p>区分咨询设计费与制作施工费，按区域、图纸、材料清单、施工协同和验收责任核价。</p></div>', pricingGrid(visualPricing), '</section>',
      '<div class="qily-pricing-family"><strong>B｜三项数智化产品与技术能力</strong><span>04–06不擅自设置脱离需求的统一金额，按真实范围独立核价。</span></div>',
      '<section class="qily-pricing-group"><div class="qily-pricing-group-head"><h3>04｜数字化工厂</h3><p>以流程、数据和系统边界为核价基础，区分蓝图、数据治理、系统实施协同与Pilot。</p></div>', pricingGrid(digitalPricing), '</section>',
      '<section class="qily-pricing-group"><div class="qily-pricing-group-head"><h3>05｜APP软件开发</h3><p>以使用场景、平台、功能、数据、测试与发布边界核价，不用一句“做个APP”给出失真的统一价格。</p></div>', pricingGrid(appPricing), '</section>',
      '<section class="qily-pricing-group"><div class="qily-pricing-group-head"><h3>06｜官网建设</h3><p>以信息架构、页面规模、内容基础、功能、SEO、部署与持续运维责任核价。</p></div>', pricingGrid(websitePricing), '</section>'
    ].join('');
    note.hidden = false;
    note.innerHTML = '<strong>统一报价说明：</strong>本模块覆盖全部六类项目合作能力。01–03保留已建立的价格参考；04–06因功能、接口、页面／平台规模和交付责任差异较大，当前采用“按范围独立核价”，不编造脱离需求的统一公网金额。¥6,800起＋差旅仅对应双方约定范围内的小范围现场诊断与概念级方案构思，不代表任一完整项目总价。最终费用依据项目范围、技术复杂度、数据基础、现场／开发投入、交付深度、修改与测试轮次、实施周期和验收责任综合评估；制作、施工、设备、软件许可、云资源、第三方接口、检测、报审及其他外部费用按合同边界另计。';
  }
'''
pattern = r"  function renderCooperationPrices\(ladder, note\) \{[\s\S]*?\n  \}\n\n  function publishCooperationPricing\(\) \{"
s2, n = re.subn(pattern, new_render + "\n  function publishCooperationPricing() {", s, count=1)
if n != 1:
    raise SystemExit('renderCooperationPrices replacement failed')
s = s2

s = s.replace("if (title) title.textContent = '三类核心项目交付公开价格参考';", "if (title) title.textContent = '六类项目合作能力报价参考';")
s = s.replace("? '以下仅对应01–03三类核心项目交付；正式项目按成果范围、工艺复杂度、现场投入、实施周期和验收责任核价。'", "? '01–03展示已建立的价格参考；04–06按真实需求范围独立核价。六类能力均以正式范围、交付物和验收责任确认最终报价。'")
s = s.replace(": '价格方案尚在确认，当前模块已设置访问验证，未授权访客无法查看具体金额。';", ": '六类项目合作能力报价方案已纳入统一访问验证；未授权访客无法查看具体金额及核价明细。';")
s = s.replace("if (ladder.dataset.qilyPublicPricingV4 !== '1') renderCooperationPrices(ladder, note);", "if (ladder.dataset.qilyPublicPricingV5 !== '1') renderCooperationPrices(ladder, note);")
s = s.replace("ladder.innerHTML = pricingGateMarkup('三类核心项目交付价格方案');", "ladder.innerHTML = pricingGateMarkup('六类项目合作能力报价方案');")
s = s.replace("delete ladder.dataset.qilyPublicPricingV4;", "delete ladder.dataset.qilyPublicPricingV4;\n      delete ladder.dataset.qilyPublicPricingV5;")
s = s.replace("if (lead) lead.textContent = '正式项目按成果范围、工艺复杂度、现场投入、实施周期和验收责任核价。';", "if (lead) lead.textContent = '01–03展示已建立的价格参考；04–06按真实需求范围独立核价。六类能力均以正式范围、交付物和验收责任确认最终报价。';")
write(rel, s)

# 2) Canonical business taxonomy spec: pricing is also 3+3 and covers all six capabilities.
rel = 'docs/QilyLean全站业务口径规范_20260809.md'
s = read(rel)
s = s.replace('4. **价格参考**：如仅覆盖01–03，统一称“三类核心项目交付价格参考”，不得称“三大核心业务价格”。', '4. **报价体系**：统一称“六类项目合作能力报价参考”。A组01–03为三类核心项目交付，可展示已建立的参考价；B组04–06为三项数智化产品与技术能力，在缺少统一标准范围时必须标注“按范围独立核价”，不得擅自编造固定金额。')
if '## 报价体系统一规范' not in s:
    s += '''\n## 报价体系统一规范\n\n- **总标题**：六类项目合作能力报价参考。\n- **A组｜三类核心项目交付**：01新工厂／新产线规划、02精益改善项目交付、03目视化项目设计与交付；保留已建立的价格参考与核价依据。\n- **B组｜三项数智化产品与技术能力**：04数字化工厂、05 APP软件开发、06官网建设；没有经过正式标准化确认的统一金额时，采用“按范围独立核价＋核价依据”，不得为了页面完整而虚构价格。\n- **诊断级价格边界**：¥6,800起＋差旅仅对应双方约定范围内的小范围现场诊断与概念级方案构思，不代表任何一类完整项目的总价。\n- **运行时要求**：锁屏标题、解锁后分组、价格说明、详情页、生成脚本、缓存版本与CI必须使用同一报价口径。\n'''
write(rel, s)

# 3) Repair generator must not restore the previous 01-03-only pricing title.
rel = 'scripts/repair-business-architecture-20260809.py'
s = read(rel)
s = s.replace('# 5) Pricing only covers 01-03, so call it "core project delivery pricing".', '# 5) Pricing follows the full 3+3 architecture: all six capabilities are represented; 04-06 use scope-based pricing until standardized.')
s = s.replace("s = s.replace(\"title.textContent = '三大核心业务公开价格参考';\", \"title.textContent = '三类核心项目交付公开价格参考';\")", "s = s.replace(\"title.textContent = '三大核心业务公开价格参考';\", \"title.textContent = '六类项目合作能力报价参考';\")")
s = s.replace("\"? '以下仅对应01–03三类核心项目交付；正式项目按成果范围、工艺复杂度、现场投入、实施周期和验收责任核价。'\"", "\"? '01–03展示已建立的价格参考；04–06按真实需求范围独立核价。六类能力均以正式范围、交付物和验收责任确认最终报价。'\"")
s = s.replace("s = s.replace(\"'三大核心业务价格方案'\", \"'三类核心项目交付价格方案'\")", "s = s.replace(\"'三大核心业务价格方案'\", \"'六类项目合作能力报价方案'\")")
s = s.replace('4. **价格参考**：如仅覆盖01–03，统一称“三类核心项目交付价格参考”，不得称“三大核心业务价格”。', '4. **报价体系**：统一称“六类项目合作能力报价参考”；01–03可展示已建立参考价，04–06在未完成标准化前统一按范围独立核价。')
write(rel, s)

# 4) Future cache-bust source must preserve the six-capability pricing runtime version.
rel = 'scripts/publish-business-architecture-cache-bust-20260809.py'
s = read(rel)
s = s.replace("NEW_NAV = '/site-navigation.js?v=20260809-business-architecture-v2'", "NEW_NAV = '/site-navigation.js?v=20260809-six-capability-pricing-v3'")
s = s.replace("'/site-navigation-legacy-20260802.js?v=20260807-contact-label-v5', '/site-navigation-legacy-20260802.js?v=20260809-core-project-pricing-v2'", "'/site-navigation-legacy-20260802.js?v=20260807-contact-label-v5', '/site-navigation-legacy-20260802.js?v=20260809-six-capability-pricing-v3'")
s = s.replace("'/site-navigation-legacy-20260802.js?v=20260809-core-project-pricing-v2'", "'/site-navigation-legacy-20260802.js?v=20260809-six-capability-pricing-v3'")
write(rel, s)

# 5) Shared loader and all HTML references: force clients/CDN to fetch the new pricing runtime.
rel = 'site-navigation.js'
s = read(rel)
s = s.replace('/site-navigation-legacy-20260802.js?v=20260809-core-project-pricing-v2', '/site-navigation-legacy-20260802.js?v=20260809-six-capability-pricing-v3')
s = s.replace('/site-navigation-legacy-20260802.js?v=20260807-contact-label-v5', '/site-navigation-legacy-20260802.js?v=20260809-six-capability-pricing-v3')
write(rel, s)

old_nav = '/site-navigation.js?v=20260809-business-architecture-v2'
new_nav = '/site-navigation.js?v=20260809-six-capability-pricing-v3'
for path in Path('.').rglob('*.html'):
    if '.git' in path.parts:
        continue
    text = path.read_text(encoding='utf-8')
    new = text.replace(old_nav, new_nav)
    if new != text:
        path.write_text(new, encoding='utf-8')
        changed.append(str(path))

# 6) Long-term CI: enforce the six-capability pricing architecture, not the former 01-03-only title.
rel = '.github/workflows/validate-business-architecture-v2.yml'
s = read(rel)
s = s.replace("          grep -q '三类核心项目交付公开价格参考' site-navigation-legacy-20260802.js\n          grep -q '三类核心项目交付价格方案' site-navigation-legacy-20260802.js\n          ! grep -q '三大核心业务公开价格参考' site-navigation-legacy-20260802.js\n          ! grep -q '三大核心业务价格方案' site-navigation-legacy-20260802.js", "          grep -q '六类项目合作能力报价参考' site-navigation-legacy-20260802.js\n          grep -q '六类项目合作能力报价方案' site-navigation-legacy-20260802.js\n          grep -q 'var digitalPricing = \\[' site-navigation-legacy-20260802.js\n          grep -q 'var appPricing = \\[' site-navigation-legacy-20260802.js\n          grep -q 'var websitePricing = \\[' site-navigation-legacy-20260802.js\n          grep -q '04｜数字化工厂' site-navigation-legacy-20260802.js\n          grep -q '05｜APP软件开发' site-navigation-legacy-20260802.js\n          grep -q '06｜官网建设' site-navigation-legacy-20260802.js\n          ! grep -q \"title.textContent = '三类核心项目交付公开价格参考'\" site-navigation-legacy-20260802.js\n          ! grep -q \"pricingGateMarkup('三类核心项目交付价格方案')\" site-navigation-legacy-20260802.js\n          ! grep -q '三大核心业务公开价格参考' site-navigation-legacy-20260802.js\n          ! grep -q '三大核心业务价格方案' site-navigation-legacy-20260802.js")
s = s.replace("          grep -q '运行时一致性' docs/QilyLean全站业务口径规范_20260809.md", "          grep -q '运行时一致性' docs/QilyLean全站业务口径规范_20260809.md\n          grep -q '报价体系统一规范' docs/QilyLean全站业务口径规范_20260809.md\n          grep -q '/site-navigation-legacy-20260802.js?v=20260809-six-capability-pricing-v3' site-navigation.js\n          grep -q '/site-navigation.js?v=20260809-six-capability-pricing-v3' index.html\n          grep -q '/site-navigation.js?v=20260809-six-capability-pricing-v3' cooperation/index.html")
write(rel, s)

print(f'Updated {len(changed)} files')
for item in changed[:120]:
    print(' -', item)
if len(changed) > 120:
    print(f' - ... and {len(changed)-120} more')

# Hard assertions before CI commit.
runtime = read('site-navigation-legacy-20260802.js')
required = [
    '六类项目合作能力报价参考',
    '六类项目合作能力报价方案',
    'var digitalPricing = [',
    'var appPricing = [',
    'var websitePricing = [',
    '04｜数字化工厂',
    '05｜APP软件开发',
    '06｜官网建设',
    '按范围独立核价',
]
for token in required:
    if token not in runtime:
        raise SystemExit(f'Missing pricing architecture token: {token}')

if "title.textContent = '三类核心项目交付公开价格参考'" in runtime:
    raise SystemExit('Stale 01-03-only pricing title remains active')
if "pricingGateMarkup('三类核心项目交付价格方案')" in runtime:
    raise SystemExit('Stale 01-03-only pricing gate remains active')
if '/site-navigation-legacy-20260802.js?v=20260809-six-capability-pricing-v3' not in read('site-navigation.js'):
    raise SystemExit('Shared loader did not receive pricing cache-bust version')
