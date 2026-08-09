from pathlib import Path
import re

changed = []


def read(rel):
    return Path(rel).read_text(encoding='utf-8')


def write(rel, text):
    p = Path(rel)
    old = p.read_text(encoding='utf-8')
    if text != old:
        p.write_text(text, encoding='utf-8')
        changed.append(rel)


# 1) Homepage runtime: replace duplicate "three core businesses" definition with project-start strategy.
rel = 'site-brand-trust-v1.js'
s = read(rel)
s = s.replace("var VERSION='20260808-diagnostic-scope-v1';", "var VERSION='20260809-project-delivery-strategy-v2';")
new_homepage = """function homepageModule(){
    if(path!=='/'||document.getElementById('qlProjectDeliveryStrategy'))return;
    var section=node([
      '<span class=\"ql-trust-kicker\">PROJECT DELIVERY STRATEGY｜项目合作从哪里开始</span>',
      '<h2>从一个具体制造问题开始｜先验证，再扩大</h2>',
      '<p class=\"ql-trust-lead\">QilyLean现阶段采用丁启利本人直接诊断、直接设计并参与交付的个人专家模式。项目优先从一条产线、一个车间、一个产品族或一个明确课题开始，以事实基线、标准交付物和验收口径验证合作效果，再决定是否扩大范围。</p>',
      '<div class=\"ql-path-grid\">',
        '<article class=\"ql-path-card\"><small>STEP 01｜问题界定</small><h3>明确问题与事实基线</h3><p>确认目标、对象、数据口径、现场约束、责任人及决策边界，避免一开始就把模糊需求包装成大项目。</p></article>',
        '<article class=\"ql-path-card\"><small>STEP 02｜小范围验证</small><h3>诊断／Pilot验证</h3><p>通过现场诊断、方案／原型和小范围试点验证方法是否有效，保留过程记录、风险条件与阶段结论。</p></article>',
        '<article class=\"ql-path-card\"><small>STEP 03｜验收与扩展</small><h3>验证有效后再扩大范围</h3><p>按书面交付物和验收标准确认阶段成果；条件成立后再复制到更多产线、区域、系统或后续开发范围。</p></article>',
      '</div>',
      '<div class=\"ql-proof-note\"><strong>业务架构：</strong>六类项目合作能力＝三类核心项目交付＋三项数智化产品与技术能力。本模块只解释“项目如何启动”，不再重复定义另一套“核心业务”。</div>',
      '<div class=\"ql-trust-actions\"><a href=\"/cooperation/\">查看六类项目合作能力</a><a href=\"/cooperation/#diagnosis\">预约问题初筛</a><a href=\"/projects/\">查看代表项目与证据</a></div>'
    ].join(''),'ql-trust-module');
    section.id='qlProjectDeliveryStrategy';
    var overview=document.getElementById('qily-core-services');
    if(overview){insertAfter(overview,section);return;}
    var hero=document.querySelector('main .hero');
    if(!insertAfter(hero,section))mainElement().insertBefore(section,mainElement().firstChild);
  }

  """
s2, n = re.subn(r"function homepageModule\(\)\{[\s\S]*?\n  \}\n\n  function cooperationModule\(\)\{", new_homepage + "function cooperationModule(){", s, count=1)
if n != 1:
    raise SystemExit('site-brand-trust homepageModule replacement failed')
s = s2.replace(
    '核心业务页已经配置合同和标准交付清单；新增此说明用于帮助客户快速理解每类文件在项目闭环中的作用。',
    '核心项目交付页已经配置合同和标准交付清单；新增此说明用于帮助客户快速理解每类文件在项目闭环中的作用。'
)
write(rel, s)


# 2) Homepage IA fallback: a six-capability heading must actually render all six capabilities.
rel = 'site-information-architecture-v1.js'
s = read(rel)
fallback = """var servicesBody=el('div','');
    servicesBody.innerHTML='<div class=\"qily-ia-grid\">'+
      '<article class=\"qily-ia-card\"><small>CORE PROJECT DELIVERY 01</small><h3>新工厂／新产线规划</h3><p>从产品、工艺、产能、设备、物流、公辅、品质和扩展边界出发，形成可评审、可实施的规划资产。</p><div class=\"qily-ia-result\">产能模型、Layout、物流与库位、公辅接口、实施路线图</div></article>'+
      '<article class=\"qily-ia-card\"><small>CORE PROJECT DELIVERY 02</small><h3>精益改善项目交付</h3><p>围绕VSM、标准工时、线平衡、SMED、OEE、质量异常和计划实绩闭环，先验证再固化。</p><div class=\"qily-ia-result\">基线诊断、Pilot方案、改善数据、标准文件、结案验收</div></article>'+
      '<article class=\"qily-ia-card\"><small>CORE PROJECT DELIVERY 03</small><h3>目视化项目设计与交付</h3><p>把区域、状态、责任、标准和异常转化为现场共同语言，兼顾设计、材料、施工协同和验收。</p><div class=\"qily-ia-result\">现场勘查、设计图、材料预算、打样、实施清单与验收</div></article>'+
      '<article class=\"qily-ia-card\"><small>DIGITAL PRODUCT & TECH 04</small><h3>数字化工厂</h3><p>以业务流程和可信主数据为底座，规划ERP／MES／APS、设备数据、生产透明化、管理看板与实施路线。</p><div class=\"qily-ia-result\">数字化蓝图、数据口径、功能／接口需求、看板原型、Pilot与验收机制</div></article>'+
      '<article class=\"qily-ia-card\"><small>DIGITAL PRODUCT & TECH 05</small><h3>APP软件开发</h3><p>面向IE测时、现场采集、异常管理、移动看板和轻量化管理场景，形成需求、原型、开发、测试、发布与迭代闭环。</p><div class=\"qily-ia-result\">需求清单、交互原型、可运行版本、测试记录、安装／发布包与版本记录</div></article>'+
      '<article class=\"qily-ia-card\"><small>DIGITAL PRODUCT & TECH 06</small><h3>官网建设</h3><p>围绕品牌定位、信息架构、可信证据、内容体系、SEO、咨询转化、响应式适配及持续运维建设专业官网。</p><div class=\"qily-ia-result\">信息架构、页面模板、响应式官网、SEO基础、咨询入口、部署与运维规范</div></article>'+
      '</div><div class=\"qily-ia-actions\"><a class=\"qily-ia-button primary\" href=\"/cooperation/\">进入项目合作</a><a class=\"qily-ia-button\" href=\"/cooperation/#services\">查看六类项目合作能力与交付边界</a></div>';
    var services=buildSection({id:'qily-core-services',kicker:'COOPERATION CAPABILITIES｜核心项目交付 + 数智化技术能力',title:'六类项目合作能力｜三类核心项目交付 + 三项数智化产品与技术能力',lead:'先说明解决什么问题、交付什么资产，再逐层展示个人履历、方法体系和知识沉淀。',body:servicesBody});
    insertAfter(homeHero,services);"""
s2, n = re.subn(r"var servicesBody=el\('div',''\);[\s\S]*?insertAfter\(homeHero,services\);", fallback, s, count=1)
if n != 1:
    raise SystemExit('site-information-architecture fallback replacement failed')
write(rel, s2)


# 3) Cooperation runtime wording: total term is "six cooperation capabilities", not "six businesses".
rel = 'site-core-service-dock-closure-v1.js'
s = read(rel)
s = s.replace(
    '六项业务形成“三类核心项目交付 + 三项数智化产品与技术能力”的3+3结构：01–03聚焦制造现场与工程改善，04–06聚焦数字化、软件与官网载体；共同遵循问题定义、方案／原型、Pilot／测试、交付验收与持续迭代的闭环逻辑。',
    '六类项目合作能力采用“三类核心项目交付 + 三项数智化产品与技术能力”的3+3结构：01–03聚焦制造现场与工程改善，04–06聚焦数字化、软件与官网载体；共同遵循问题定义、方案／原型、Pilot／测试、交付验收与持续迭代的闭环逻辑。'
)
s = s.replace('不以一套边界概括全部业务。', '不以一套边界概括全部合作能力。')
write(rel, s)


# 4) Detail pages 01-03 are "core project delivery" pages; their back-link returns to the six-capability overview.
detail_pages = {
    'cooperation/factory-planning/index.html': ('新工厂／新产线规划', '01', 'FACTORY PLANNING'),
    'cooperation/lean-improvement/index.html': ('精益改善项目交付', '02', 'LEAN IMPROVEMENT'),
    'cooperation/visual-management/index.html': ('目视化项目设计与交付', '03', 'VISUAL MANAGEMENT DELIVERY'),
}
for rel, (title, num, en) in detail_pages.items():
    s = read(rel)
    s = s.replace(f'<title>{title}｜QilyLean核心业务</title>', f'<title>{title}｜QilyLean核心项目交付</title>')
    s = s.replace(f'content=\"{title}｜QilyLean核心业务\"', f'content=\"{title}｜QilyLean核心项目交付\"')
    s = s.replace(f'CORE BUSINESS {num} / {en}', f'CORE PROJECT DELIVERY {num} / {en}')
    s = s.replace('返回三大核心业务', '返回六类项目合作能力')
    s = s.replace('aria-label=\"核心业务导航\"', 'aria-label=\"核心项目交付导航\"')
    write(rel, s)


# 5) Pricing only covers 01-03, so call it "core project delivery pricing".
rel = 'site-navigation-legacy-20260802.js'
s = read(rel)
s = s.replace("title.textContent = '三大核心业务公开价格参考';", "title.textContent = '三类核心项目交付公开价格参考';")
s = s.replace(
    "? '正式项目按成果范围、工艺复杂度、现场投入、实施周期和验收责任核价。'",
    "? '以下仅对应01–03三类核心项目交付；正式项目按成果范围、工艺复杂度、现场投入、实施周期和验收责任核价。'"
)
s = s.replace("'三大核心业务价格方案'", "'三类核心项目交付价格方案'")
write(rel, s)


# 6) Legacy generator must not reintroduce stale pricing taxonomy.
rel = 'scripts/apply-commercial-quality-closure-20260804.js'
s = read(rel).replace('三大核心业务｜公开价格参考与报价依据', '三类核心项目交付｜公开价格参考与报价依据')
write(rel, s)


# 7) Maintenance comments only; selectors/classes stay untouched for compatibility.
rel = 'site-commercial-quality-closure-v1.css'
s = read(rel)
s = s.replace('/* 三大核心业务：模块背景、边框、阴影及内部方框全部回退原样，仅强化圆圈序号。 */', '/* 六类项目合作能力：模块背景、边框、阴影及内部方框全部回退原样，仅强化圆圈序号。 */')
s = s.replace('/* 三类核心业务公开价格参考。 */', '/* 三类核心项目交付公开价格参考。 */')
write(rel, s)


# 8) Canonical taxonomy spec: document the hierarchy and runtime constraint.
rel = 'docs/QilyLean全站业务口径规范_20260809.md'
s = read(rel)
if '## 首页信息层级' not in s:
    s += """
## 首页信息层级

1. **唯一业务总览**：六类项目合作能力＝三类核心项目交付＋三项数智化产品与技术能力。
2. **项目启动逻辑**：只解释“明确问题 → 小范围诊断／Pilot → 验收 → 扩大范围”，不得再次定义“三项核心业务”。
3. **独立业务页01–03**：统一标识为“核心项目交付 / CORE PROJECT DELIVERY”。
4. **价格参考**：如仅覆盖01–03，统一称“三类核心项目交付价格参考”，不得称“三大核心业务价格”。
5. **运行时一致性**：静态HTML、客户端JS注入、SEO/Schema、生成脚本和CI必须使用同一业务口径；任何一层不得二次写回旧口径。

内部技术类名、历史文件名（如 `core-business-*`）可保留以维持兼容性，但不得作为用户可见业务定义。
"""
write(rel, s)


print('Changed files:')
for item in changed:
    print(' -', item)
if len(changed) < 8:
    raise SystemExit(f'Expected broad repair, only {len(changed)} files changed')
