from pathlib import Path
import os, re, subprocess

ROOT = Path(__file__).resolve().parents[1]
BRIEF = ROOT / 'qilylean' / 'daily' / '2026-08-10.html'
INDEX = ROOT / 'qilylean' / 'daily' / 'index.json'


def read(path):
    return path.read_text(encoding='utf-8')


def write(path, text):
    path.write_text(text if text.endswith('\n') else text + '\n', encoding='utf-8')

brief = read(BRIEF)

# 1) Refocus the issue theme on role/function value, not personal project promotion.
brief = brief.replace('2026-08-10｜岗位价值与项目交付', '2026-08-10｜岗位价值与职能闭环')

# 2) Remove recruitment framing from the single-point lesson and explicitly state the editorial boundary.
brief = brief.replace(
    '用于岗位说明书评审、招聘面试、晋升答辩、干部述职和项目复盘。评价重点从“做过什么”转向“解决了什么问题、形成了什么结果、留下了什么机制”。',
    '用于岗位说明书评审、岗位履职复盘、干部述职、跨部门复盘和组织能力建设。评价重点从“做过什么”转向“解决了什么问题、形成了什么结果、留下了什么机制”。'
)

boundary = '<div class="brief-callout"><strong>本期边界：</strong>本文只讨论制造企业岗位职能的价值判断与组织能力建设，不用于个人履历包装、招聘宣传，也不对应任何具体个人项目或个人经历。</div>'
anchor = '<!-- QILY-DAILY-TERMINOLOGY:END -->'
if boundary not in brief:
    brief = brief.replace(anchor, anchor + '\n\n  ' + boundary, 1)

# 3) Replace section 6 entirely: generic manufacturing-role review, no user-specific project examples.
pattern = re.compile(r'  <h3>6\. 招聘、晋升和述职，建议统一改成“证据型表达”</h3>[\s\S]*?(?=\n  <h3>7\.)')
replacement = '''  <h3>6. 职能复盘与岗位价值表达，统一用“证据闭环”</h3>
  <p>岗位复盘不应停留在“负责什么、做了多少事务”，而应说明这个职能如何把业务问题转化为可验证结果。这里讨论的是<strong>组织内部的岗位价值与工作复盘</strong>，不用于个人履历包装，也不对应任何具体个人项目。</p>
  <table class="rule-table balanced-cols">
    <thead><tr><th>事务式表达</th><th>证据闭环表达</th></tr></thead>
    <tbody>
      <tr><td>IE／精益：做工时、画流程图、组织改善活动</td><td>围绕产能、效率与交付问题建立事实基线，识别瓶颈与损失，验证改善方案，并把有效方法固化为标准工时、标准作业和稽核机制。</td></tr>
      <tr><td>PMC：排计划、催物料、追欠产</td><td>打通需求、产能、物料、排程、生产实绩和异常处理，用负荷率、齐套率、OTD、WIP与库存结构验证计划质量。</td></tr>
      <tr><td>质量：检验、开异常单、追问题关闭</td><td>把风险前移到FMEA、控制计划、防错与过程能力，通过FPY、重复异常、客诉和过程稳定性验证质量职能是否真正产生价值。</td></tr>
      <tr><td>IT／数智化：上系统、做报表、维护账号</td><td>把流程、主数据、业务规则与现场执行贯通，使BOM、工艺、工时、计划、实绩和库存形成同一数据口径与异常闭环。</td></tr>
    </tbody>
  </table>
  <div class="brief-callout"><strong>复盘口径：</strong>不要问“这个岗位做了多少事”，要问“识别了什么问题、依据什么数据、采取什么方法、形成什么结果、留下什么标准或机制”。</div>
'''
brief, count = pattern.subn(replacement, brief, count=1)
if count != 1:
    raise SystemExit('Section 6 target block not found or not unique')

# 4) Hard guard against accidentally turning this brief into a personal project or recruitment page.
for forbidden in ['招聘面试', '招聘、晋升和述职', '300T冲压', '14h降至约7h', '大型模具换型改善']:
    if forbidden in brief:
        raise SystemExit(f'Forbidden personal/recruitment framing remains: {forbidden}')

write(BRIEF, brief)

# 5) Update the daily index theme so list/search metadata matches the corrected editorial scope.
idx = read(INDEX)
old_theme = '"theme": "岗位价值与项目交付"'
new_theme = '"theme": "岗位价值与职能闭环"'
if old_theme not in idx and new_theme not in idx:
    raise SystemExit('2026-08-10 theme field not found')
idx = idx.replace(old_theme, new_theme, 1)
write(INDEX, idx)

# 6) Rebuild shared metadata so homepage/knowledge/latest-card use the corrected theme.
env = dict(os.environ)
env['QILY_BUILD_DATE'] = '2026-08-10'
subprocess.run(['node', 'scripts/build-site-metadata.js'], cwd=ROOT, env=env, check=True)

# 7) Final source validation.
brief = read(BRIEF)
assert '2026-08-10｜岗位价值与职能闭环' in brief
assert '本期边界：' in brief
assert '6. 职能复盘与岗位价值表达，统一用“证据闭环”' in brief
assert 'IE／精益：做工时、画流程图、组织改善活动' in brief
assert 'PMC：排计划、催物料、追欠产' in brief
assert '质量：检验、开异常单、追问题关闭' in brief
assert 'IT／数智化：上系统、做报表、维护账号' in brief
for forbidden in ['招聘面试', '招聘、晋升和述职', '300T冲压', '14h降至约7h', '大型模具换型改善']:
    assert forbidden not in brief
print('2026-08-10 function-value brief scope corrected and validated')
