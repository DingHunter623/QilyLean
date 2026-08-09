from pathlib import Path
import os, re, subprocess

ROOT = Path(__file__).resolve().parents[1]
BUILD = ROOT / 'scripts' / 'build-site-metadata.js'
KNOWLEDGE = ROOT / 'knowledge' / 'index.html'
BRIEF = ROOT / 'qilylean' / 'daily' / '2026-08-10.html'
ASSET_DIR = ROOT / 'qilylean' / 'daily' / 'assets'
ASSET_DIR.mkdir(parents=True, exist_ok=True)


def read(p):
    return p.read_text(encoding='utf-8')


def write(p, s):
    p.write_text(s if s.endswith('\n') else s + '\n', encoding='utf-8')

# 1) Make generated knowledge statistics cards clickable at the source.
s = read(BUILD)
old = '''<div class="module-grid four">
<article class="module-card"><small>知识架构</small><h3>${data.knowledge.moduleCount} 大模块</h3><p>术语词典、今日简报、工具库、精益专题及程序文件／参考资料。</p></article>
<article class="module-card"><small>术语与培训</small><h3>${data.terminology.total} 项</h3><p>每项术语一对一匹配独立网址单点培训课件。</p></article>
<article class="module-card"><small>今日简报</small><h3>${data.briefs.total} 期</h3><p>最新更新至 ${escapeHtml(data.briefs.latestDate)}，按日期连续归档。</p></article>
<article class="module-card"><small>工具／专题／资料</small><h3>${data.knowledge.resourceCount} 项</h3><p>${data.knowledge.toolCount} 项工具、${data.knowledge.topicCount} 项专题、${data.knowledge.documentCount} 项程序文件与参考资料入口。</p></article>
</div>'''
new = '''<div class="module-grid four knowledge-stat-grid">
<a class="module-card knowledge-stat-card" href="/knowledge/#terminology" aria-label="查看知识架构与六大知识模块"><small>知识架构</small><h3>${data.knowledge.moduleCount} 大模块</h3><p>术语词典、今日简报、工具库、精益专题及程序文件／参考资料。</p><span class="knowledge-stat-jump">进入知识架构 →</span></a>
<a class="module-card knowledge-stat-card" href="/knowledge/terminology.html" aria-label="进入全站术语中文诠释与单点培训课件"><small>术语与培训</small><h3>${data.terminology.total} 项</h3><p>每项术语一对一匹配独立网址单点培训课件。</p><span class="knowledge-stat-jump">进入术语词典 →</span></a>
<a class="module-card knowledge-stat-card" href="/qilylean/daily-insights.html" aria-label="进入今日简报目录"><small>今日简报</small><h3>${data.briefs.total} 期</h3><p>最新更新至 ${escapeHtml(data.briefs.latestDate)}，按日期连续归档。</p><span class="knowledge-stat-jump">进入简报目录 →</span></a>
<a class="module-card knowledge-stat-card" href="/knowledge/#tools" aria-label="进入工具专题与资料入口"><small>工具／专题／资料</small><h3>${data.knowledge.resourceCount} 项</h3><p>${data.knowledge.toolCount} 项工具、${data.knowledge.topicCount} 项专题、${data.knowledge.documentCount} 项程序文件与参考资料入口。</p><span class="knowledge-stat-jump">进入工具与资料 →</span></a>
</div>'''
if old not in s:
    raise SystemExit('renderKnowledgeStats source block not found')
s = s.replace(old, new, 1)
write(BUILD, s)

# 2) Add durable card interaction styling, then regenerate current knowledge statistics from source.
k = read(KNOWLEDGE)
style = '''\n<style id="qilyKnowledgeStatsClickableV1">\n#knowledge-stats .knowledge-stat-card{display:flex;min-height:205px;flex-direction:column;color:inherit;text-decoration:none;cursor:pointer;transition:transform .16s ease,border-color .16s ease,box-shadow .16s ease,background .16s ease}\n#knowledge-stats .knowledge-stat-card:hover,#knowledge-stats .knowledge-stat-card:focus-visible{transform:translateY(-3px);border-color:var(--qily-teal,#178b94);background:#f4fbfa;box-shadow:0 14px 30px rgba(15,75,90,.14);outline:none}\n#knowledge-stats .knowledge-stat-card:active{transform:translateY(-1px)}\n#knowledge-stats .knowledge-stat-jump{display:block;margin-top:auto;padding-top:14px;color:var(--qily-teal,#178b94);font-size:13px;font-weight:900;letter-spacing:.01em}\n#knowledge-stats .knowledge-stat-card:hover .knowledge-stat-jump,#knowledge-stats .knowledge-stat-card:focus-visible .knowledge-stat-jump{text-decoration:underline;text-underline-offset:4px}\n@media(max-width:760px){#knowledge-stats .knowledge-stat-card{min-height:0}}\n</style>\n'''
if 'qilyKnowledgeStatsClickableV1' not in k:
    k = k.replace('</head>', style + '</head>', 1)
    write(KNOWLEDGE, k)

env = dict(os.environ)
env['QILY_BUILD_DATE'] = '2026-08-10'
subprocess.run(['node', 'scripts/build-site-metadata.js'], cwd=ROOT, env=env, check=True)

# Verify generated knowledge page now has four link cards.
k = read(KNOWLEDGE)
for href in ['/knowledge/#terminology', '/knowledge/terminology.html', '/qilylean/daily-insights.html', '/knowledge/#tools']:
    if f'class="module-card knowledge-stat-card" href="{href}"' not in k:
        raise SystemExit(f'missing clickable knowledge stat target: {href}')
if k.count('class="module-card knowledge-stat-card"') != 4:
    raise SystemExit('knowledge stats must contain exactly four clickable cards')

# 3) Create five lightweight SVG scene diagrams for the 2026-08-10 brief.
svg_common = '''<style>text{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Microsoft YaHei",sans-serif}.t{fill:#0f4b5a;font-weight:800}.s{fill:#56706d}.box{fill:#fff;stroke:#b8d0cc;stroke-width:2}.accent{fill:#e9f6f4;stroke:#178b94;stroke-width:2}.gold{fill:#fff8e8;stroke:#caa15f;stroke-width:2}.line{stroke:#178b94;stroke-width:3;fill:none;stroke-linecap:round;stroke-linejoin:round}.muted{stroke:#9bb7b2;stroke-width:2;fill:none}</style>'''
svgs = {
'2026-08-10-01-position-function-value.svg': f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 420" role="img" aria-labelledby="t d"><title id="t">职位、职责、职能、价值四层关系</title><desc id="d">从职位到职责，再到职能与可验证价值的递进关系。</desc>{svg_common}<rect width="1200" height="420" fill="#f7fbfa"/><text x="60" y="68" class="t" font-size="30">从“岗位名称”走到“可验证价值”</text><g transform="translate(70 115)"><rect class="box" x="0" y="0" width="220" height="190" rx="22"/><text class="t" x="110" y="58" text-anchor="middle" font-size="25">职位</text><text class="s" x="110" y="98" text-anchor="middle" font-size="17">组织位置</text><text class="s" x="110" y="128" text-anchor="middle" font-size="17">叫什么岗位</text><path class="line" d="M220 95h50"/><path class="line" d="M258 82l14 13-14 13"/><rect class="box" x="270" y="0" width="220" height="190" rx="22"/><text class="t" x="380" y="58" text-anchor="middle" font-size="25">职责</text><text class="s" x="380" y="98" text-anchor="middle" font-size="17">责任边界</text><text class="s" x="380" y="128" text-anchor="middle" font-size="17">组织要求做什么</text><path class="line" d="M490 95h50"/><path class="line" d="M528 82l14 13-14 13"/><rect class="accent" x="540" y="0" width="220" height="190" rx="22"/><text class="t" x="650" y="58" text-anchor="middle" font-size="25">职能</text><text class="s" x="650" y="98" text-anchor="middle" font-size="17">解决业务问题</text><text class="s" x="650" y="128" text-anchor="middle" font-size="17">建立专业能力</text><path class="line" d="M760 95h50"/><path class="line" d="M798 82l14 13-14 13"/><rect class="gold" x="810" y="0" width="250" height="190" rx="22"/><text class="t" x="935" y="58" text-anchor="middle" font-size="25">价值</text><text class="s" x="935" y="98" text-anchor="middle" font-size="17">PQCD / 周期 / 风险</text><text class="s" x="935" y="128" text-anchor="middle" font-size="17">结果 + 证据 + 固化</text></g></svg>''',
'2026-08-10-02-seven-step-value-chain.svg': f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 430" role="img" aria-labelledby="t d"><title id="t">岗位价值七步闭环</title><desc id="d">问题识别、数据基线、方案设计、责任协同、Pilot验证、结果验收和机制固化。</desc>{svg_common}<rect width="1200" height="430" fill="#f7fbfa"/><text x="60" y="66" class="t" font-size="30">高含金量职能：跑通七步价值闭环</text><path class="muted" d="M110 222H1090"/><g font-size="16" text-anchor="middle"><g transform="translate(120 215)"><circle r="48" class="accent"/><text class="t" y="-4">① 问题</text><text class="s" y="23">识别差距</text></g><g transform="translate(280 215)"><circle r="48" class="box"/><text class="t" y="-4">② 基线</text><text class="s" y="23">统一事实</text></g><g transform="translate(440 215)"><circle r="48" class="box"/><text class="t" y="-4">③ 方案</text><text class="s" y="23">路径边界</text></g><g transform="translate(600 215)"><circle r="48" class="box"/><text class="t" y="-4">④ 协同</text><text class="s" y="23">RACI资源</text></g><g transform="translate(760 215)"><circle r="48" class="accent"/><text class="t" y="-4">⑤ Pilot</text><text class="s" y="23">受控试点</text></g><g transform="translate(920 215)"><circle r="48" class="gold"/><text class="t" y="-4">⑥ 验收</text><text class="s" y="23">结果证据</text></g><g transform="translate(1080 215)"><circle r="48" class="gold"/><text class="t" y="-4">⑦ 固化</text><text class="s" y="23">标准复制</text></g></g><path class="line" d="M106 340h980"/><path class="line" d="M1070 327l18 13-18 13"/><text x="600" y="382" text-anchor="middle" class="s" font-size="18">忙碌不是价值；从问题到验收、再到可复制机制，才是完整交付。</text></svg>''',
'2026-08-10-03-capacity-80-to-95.svg': f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 470" role="img" aria-labelledby="t d"><title id="t">装配线UPPH从80提升到95的正确改善路径</title><desc id="d">先识别瓶颈与损失，再平衡工位和Pilot验证，最后稳定达到UPPH 95并控制质量和在制品。</desc>{svg_common}<rect width="1200" height="470" fill="#f7fbfa"/><text x="60" y="65" class="t" font-size="30">现场案例：不是“催快一点”，而是把损失结构做清楚</text><g transform="translate(70 120)"><rect class="box" x="0" y="40" width="250" height="210" rx="22"/><text class="t" x="125" y="88" text-anchor="middle" font-size="24">现状 UPPH 80</text><text class="s" x="125" y="128" text-anchor="middle" font-size="17">瓶颈工位 / 换型</text><text class="s" x="125" y="160" text-anchor="middle" font-size="17">缺料等待 / 返工</text><text class="s" x="125" y="192" text-anchor="middle" font-size="17">线平衡 / 人员配置</text><path class="line" d="M250 145h95"/><path class="line" d="M328 132l18 13-18 13"/><rect class="accent" x="345" y="0" width="360" height="290" rx="24"/><text class="t" x="525" y="54" text-anchor="middle" font-size="24">工程化改善</text><g class="s" font-size="17"><text x="390" y="105">① CT + 标工基线</text><text x="390" y="140">② 瓶颈与损失Pareto</text><text x="390" y="175">③ 工位平衡 / SMED / 供料</text><text x="390" y="210">④ 小范围Pilot</text><text x="390" y="245">⑤ FPY / WIP / OEE同步验证</text></g><path class="line" d="M705 145h95"/><path class="line" d="M783 132l18 13-18 13"/><rect class="gold" x="800" y="40" width="270" height="210" rx="22"/><text class="t" x="935" y="88" text-anchor="middle" font-size="24">稳定 UPPH 95</text><text class="s" x="935" y="130" text-anchor="middle" font-size="17">质量不下降</text><text class="s" x="935" y="162" text-anchor="middle" font-size="17">WIP不恶化</text><text class="s" x="935" y="194" text-anchor="middle" font-size="17">人力/设备不过载</text></g><text x="600" y="430" text-anchor="middle" class="s" font-size="18">真正的产能提升 = 吞吐提升，同时守住质量、在制品、资源与安全边界。</text></svg>''',
'2026-08-10-04-six-question-check.svg': f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 520" role="img" aria-labelledby="t d"><title id="t">职能含金量六问检核</title><desc id="d">从问题定义、数据基线、方案边界、跨部门协同、结果验收和固化复制六方面进行证据型检核。</desc>{svg_common}<rect width="1200" height="520" fill="#f7fbfa"/><text x="60" y="65" class="t" font-size="30">六问检核：不要问“忙不忙”，要问“证据在哪里”</text><g transform="translate(600 280)"><circle r="96" class="gold"/><text text-anchor="middle" class="t" font-size="28" y="-5">证据型</text><text text-anchor="middle" class="t" font-size="28" y="30">岗位价值</text><g font-size="17" text-anchor="middle"><g transform="translate(-340 -120)"><rect x="-120" y="-48" width="240" height="96" rx="18" class="box"/><text class="t" y="-5">① 定义问题</text><text class="s" y="25">不是只等派单</text></g><g transform="translate(0 -175)"><rect x="-120" y="-48" width="240" height="96" rx="18" class="box"/><text class="t" y="-5">② 数据基线</text><text class="s" y="25">不是凭感觉</text></g><g transform="translate(340 -120)"><rect x="-120" y="-48" width="240" height="96" rx="18" class="box"/><text class="t" y="-5">③ 方案边界</text><text class="s" y="25">不是喊口号</text></g><g transform="translate(-340 120)"><rect x="-120" y="-48" width="240" height="96" rx="18" class="box"/><text class="t" y="-5">④ 责任协同</text><text class="s" y="25">不是转发信息</text></g><g transform="translate(0 175)"><rect x="-120" y="-48" width="240" height="96" rx="18" class="accent"/><text class="t" y="-5">⑤ 结果验收</text><text class="s" y="25">数据 + 证据</text></g><g transform="translate(340 120)"><rect x="-120" y="-48" width="240" height="96" rx="18" class="accent"/><text class="t" y="-5">⑥ 固化复制</text><text class="s" y="25">标准 + 机制</text></g></g><path class="muted" d="M-245-83L-88-25M0-127V-96M245-83L88-25M-245 83L-88 25M0 127V96M245 83L88 25"/></g></svg>''',
'2026-08-10-05-person-to-system.svg': f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 430" role="img" aria-labelledby="t d"><title id="t">从个人经验到组织能力</title><desc id="d">将个人经验沉淀为标准、流程、数据规则和培训，最终形成组织可复制能力。</desc>{svg_common}<rect width="1200" height="430" fill="#f7fbfa"/><text x="60" y="65" class="t" font-size="30">职能的最高级：把“能人能力”变成“组织机制”</text><g transform="translate(70 145)" font-size="17" text-anchor="middle"><rect class="box" x="0" y="0" width="180" height="150" rx="22"/><text class="t" x="90" y="58" font-size="23">个人经验</text><text class="s" x="90" y="92">只有少数人会</text><path class="line" d="M180 75h48"/><path class="line" d="M214 62l16 13-16 13"/><rect class="accent" x="230" y="0" width="180" height="150" rx="22"/><text class="t" x="320" y="58" font-size="23">标准</text><text class="s" x="320" y="92">SOP / OPL</text><path class="line" d="M410 75h48"/><path class="line" d="M444 62l16 13-16 13"/><rect class="accent" x="460" y="0" width="180" height="150" rx="22"/><text class="t" x="550" y="58" font-size="23">流程与数据</text><text class="s" x="550" y="92">规则 / 版本 / 稽核</text><path class="line" d="M640 75h48"/><path class="line" d="M674 62l16 13-16 13"/><rect class="accent" x="690" y="0" width="180" height="150" rx="22"/><text class="t" x="780" y="58" font-size="23">培训复制</text><text class="s" x="780" y="92">多数人做对</text><path class="line" d="M870 75h48"/><path class="line" d="M904 62l16 13-16 13"/><rect class="gold" x="920" y="0" width="190" height="150" rx="22"/><text class="t" x="1015" y="58" font-size="23">组织能力</text><text class="s" x="1015" y="92">稳定 / 可复制</text></g><text x="600" y="365" text-anchor="middle" class="s" font-size="18">“离不开我”是单点风险；“按机制也能稳定做对”才是能力沉淀。</text></svg>'''
}
for name, content in svgs.items():
    write(ASSET_DIR / name, content)

# 4) Patch brief with responsive figures tied to the five actual dialogue scenes.
b = read(BRIEF)
if 'brief-scene-figure-v1' not in b:
    css = '''\n.brief-scene-figure-v1{margin:18px 0 28px;padding:14px;border:1px solid #d5e4e1;border-radius:18px;background:#fbfdfc;box-shadow:0 10px 26px rgba(15,75,90,.06)}.brief-scene-figure-v1 img{display:block;width:100%;height:auto;border-radius:12px;background:#f7fbfa}.brief-scene-figure-v1 figcaption{margin-top:10px;color:#607572;font-size:13px;line-height:1.65;text-align:center}.brief-scene-figure-v1 strong{color:#0f4b5a}@media(max-width:620px){.brief-scene-figure-v1{margin:14px 0 22px;padding:8px;border-radius:14px}.brief-scene-figure-v1 figcaption{font-size:12px}}\n'''
    b = b.replace('</style>', css + '</style>', 1)

if '2026-08-10-01-position-function-value.svg' not in b:
    b = b.replace('<h3>1. 先把“职位、职责、职能、价值”四件事拆开</h3>', '<h3>1. 先把“职位、职责、职能、价值”四件事拆开</h3>\n  <figure class="brief-scene-figure-v1"><img src="/qilylean/daily/assets/2026-08-10-01-position-function-value.svg" alt="职位、职责、职能、价值四层关系简图" width="1200" height="420" loading="eager" decoding="async"><figcaption><strong>场景简图 01｜四层关系：</strong>职位说明组织位置，职责明确责任边界，职能解决业务问题，价值最终用结果与证据验证。</figcaption></figure>', 1)
    b = b.replace('<h3>2. 真正高含金量的岗位，都跑得通这条“七步价值链”</h3>', '<h3>2. 真正高含金量的岗位，都跑得通这条“七步价值链”</h3>\n  <figure class="brief-scene-figure-v1"><img src="/qilylean/daily/assets/2026-08-10-02-seven-step-value-chain.svg" alt="岗位价值七步闭环简图" width="1200" height="430" loading="lazy" decoding="async"><figcaption><strong>场景简图 02｜七步价值链：</strong>从问题识别到机制固化，任何一环缺失，都可能让“做过”停留在过程而不是交付。</figcaption></figure>', 1)
    b = b.replace('<h3>4. 一个制造现场案例：同样叫“提升产能”，职能含金量完全不同</h3>', '<h3>4. 一个制造现场案例：同样叫“提升产能”，职能含金量完全不同</h3>\n  <figure class="brief-scene-figure-v1"><img src="/qilylean/daily/assets/2026-08-10-03-capacity-80-to-95.svg" alt="装配线UPPH从80提升到95的工程化改善路径简图" width="1200" height="470" loading="lazy" decoding="async"><figcaption><strong>场景简图 03｜产能改善：</strong>UPPH 80→95不是靠催产，而是先识别瓶颈与损失，再通过工程化改善和Pilot验证拿到稳定结果。</figcaption></figure>', 1)
    b = b.replace('<h3>5. 判断“职能含金量”，不要问他忙不忙，要问这六个问题</h3>', '<h3>5. 判断“职能含金量”，不要问他忙不忙，要问这六个问题</h3>\n  <figure class="brief-scene-figure-v1"><img src="/qilylean/daily/assets/2026-08-10-04-six-question-check.svg" alt="职能含金量六问检核简图" width="1200" height="520" loading="lazy" decoding="async"><figcaption><strong>场景简图 04｜六问检核：</strong>把“忙碌感”换成问题定义、数据、方案、协同、验收和固化六类证据。</figcaption></figure>', 1)
    b = b.replace('<h3>7. 职能的最高级，不是“不可替代”，而是“让组织不再依赖个人”</h3>', '<h3>7. 职能的最高级，不是“不可替代”，而是“让组织不再依赖个人”</h3>\n  <figure class="brief-scene-figure-v1"><img src="/qilylean/daily/assets/2026-08-10-05-person-to-system.svg" alt="从个人经验沉淀为组织能力的机制化路径简图" width="1200" height="430" loading="lazy" decoding="async"><figcaption><strong>场景简图 05｜机制沉淀：</strong>把个人经验转成标准、流程、数据规则与培训，最终形成不依赖单个人的组织能力。</figcaption></figure>', 1)

if '<meta property="og:image"' not in b:
    b = b.replace('<meta property="og:site_name" content="QilyLean｜启力精益">', '<meta property="og:site_name" content="QilyLean｜启力精益">\n  <meta property="og:image" content="https://qilylean.com/qilylean/daily/assets/2026-08-10-01-position-function-value.svg">', 1)
write(BRIEF, b)

# 5) Strict validation.
b = read(BRIEF)
for i in range(1, 6):
    token = f'2026-08-10-0{i}-'
    if token not in b:
        raise SystemExit(f'brief visual {i} missing')
if b.count('class="brief-scene-figure-v1"') != 5:
    raise SystemExit('brief must contain exactly five scene figures')
for p in ASSET_DIR.glob('2026-08-10-0*.svg'):
    if p.stat().st_size < 500:
        raise SystemExit(f'SVG too small: {p}')
print('knowledge clickable cards + 2026-08-10 five scene diagrams: validated')
