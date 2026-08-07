from pathlib import Path

path = Path('cooperation/index.html')
s = path.read_text(encoding='utf-8')

old_heading = '<h2>三类项目合作边界</h2><p>新工厂／新产线规划、精益改善与目视化项目的输入条件、专业责任和验收口径不同，须分别判断，不以一套边界概括全部业务。</p>'
new_heading = '<h2>四类项目合作边界</h2><p>新工厂／新产线规划、数字化工厂、精益改善与目视化项目的输入条件、专业责任和验收口径不同，须分别判断，不以一套边界概括全部业务。</p>'
if old_heading not in s:
    raise SystemExit('未找到三类项目合作边界标题，停止修改')
s = s.replace(old_heading, new_heading, 1)

s = s.replace('data-qily-boundary-version="v2"', 'data-qily-boundary-version="v3"', 1)

lean_old = '<article class="boundary-service-card qily-static-card"><span class="boundary-type">02｜精益改善项目</span>'
lean_new = '<article class="boundary-service-card qily-static-card"><span class="boundary-type">03｜精益改善项目</span>'
visual_old = '<article class="boundary-service-card qily-static-card"><span class="boundary-type">03｜目视化项目</span>'
visual_new = '<article class="boundary-service-card qily-static-card"><span class="boundary-type">04｜目视化项目</span>'
if lean_old not in s or visual_old not in s:
    raise SystemExit('未找到原02/03合作边界卡，停止修改')
s = s.replace(lean_old, lean_new, 1)
s = s.replace(visual_old, visual_new, 1)

digital_card = '''<article class="boundary-service-card qily-static-card"><span class="boundary-type">02｜数字化工厂项目</span><h3>系统、数据与实施边界</h3><div class="boundary-split"><div><strong>适合启动</strong><ul><li>核心业务流程和管理痛点已有初步梳理，并存在ERP、MES、APS、设备数据采集或生产透明化需求。</li><li>可提供产品、BOM、工艺、工时、产能、设备、质量、库存等基础数据及现有系统接口信息。</li><li>企业能够指定业务与IT项目负责人，并协调软件厂商参与Pilot、接口确认、上线验证和阶段验收。</li></ul></div><div class="boundary-hold"><strong>暂缓启动</strong><ul><li>希望仅购买一套软件就自动解决流程、数据、执行和管理问题。</li><li>主数据、业务规则和责任边界尚未梳理，却要求直接承诺全系统上线效果、固定周期或绝对ROI。</li><li>要求QilyLean替代ERP／MES／APS厂商承担底层产品开发、许可证销售、网络安全、云资源或长期系统运维。</li></ul></div></div><p class="boundary-note"><strong>专业边界：</strong>交付现状诊断、业务流程与数据口径、数字化蓝图、功能与接口需求、看板需求、实施路线、Pilot验证及验收机制；不替代软件厂商承担底层产品研发、代码交付、许可证销售、信息安全及长期运维责任。</p></article>\n'''
insert_marker = '<article class="boundary-service-card qily-static-card"><span class="boundary-type">03｜精益改善项目</span>'
if digital_card.strip() not in s:
    if insert_marker not in s:
        raise SystemExit('未找到数字化工厂卡插入位置')
    s = s.replace(insert_marker, digital_card + insert_marker, 1)

# 四类边界采用桌面端2×2；移动端单列。放在正文后段，优先级高于前置全站样式。
style = '''<style id="qilyFourBoundaryGrid20260807">
.cooperation-page #boundary .boundary-service-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:22px!important}
.cooperation-page #boundary .boundary-service-card:nth-child(2){border-top-color:#caa15f!important;background:#fffaf0!important}
.cooperation-page #boundary .boundary-service-card:nth-child(2) h3{color:#6f5428!important}
@media(max-width:820px){.cooperation-page #boundary .boundary-service-grid{grid-template-columns:1fr!important}}
</style>\n'''
section_marker = '    <section class="module-section" id="boundary">'
if 'id="qilyFourBoundaryGrid20260807"' not in s:
    if section_marker not in s:
        raise SystemExit('未找到合作边界section')
    s = s.replace(section_marker, style + section_marker, 1)

# SEO与结构化描述同步，不让页面正文与搜索摘要脱节。
s = s.replace(
    'QilyLean面向制造企业提供新工厂与新产线规划、精益改善项目交付、目视化项目设计交付，以及IE产能、ERP/MES数据治理和月度改善顾问服务。',
    'QilyLean面向制造企业提供新工厂与新产线规划、数字化工厂规划与ERP/MES/APS数据治理、精益改善项目交付、目视化项目设计交付，以及IE产能和月度改善顾问服务。',
    1,
)
s = s.replace(
    '面向制造企业提供新工厂规划、精益改善、目视化项目交付与数智化制造数据治理服务。',
    '面向制造企业提供新工厂规划、数字化工厂规划与数据治理、精益改善及目视化项目交付服务。',
    1,
)

# 强校验：必须是四类且顺序完整。
checks = [
    '四类项目合作边界',
    '01｜新工厂／新产线规划',
    '02｜数字化工厂项目',
    '03｜精益改善项目',
    '04｜目视化项目',
    '系统、数据与实施边界',
    'ERP／MES／APS厂商',
    'data-qily-boundary-version="v3"',
    'qilyFourBoundaryGrid20260807',
]
for term in checks:
    if term not in s:
        raise SystemExit(f'校验失败，缺少：{term}')
if '三类项目合作边界' in s:
    raise SystemExit('校验失败：仍残留旧“三类项目合作边界”')

path.write_text(s, encoding='utf-8')
print('合作边界已升级为四类，新增数字化工厂项目。')
