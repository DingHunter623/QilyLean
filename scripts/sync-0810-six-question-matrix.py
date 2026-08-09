from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
GEN = ROOT / 'scripts' / 'patch-knowledge-stats-brief-visuals-20260809.py'
SVG = ROOT / 'qilylean' / 'daily' / 'assets' / '2026-08-10-04-six-question-check.svg'

entry = r''' '2026-08-10-04-six-question-check.svg': f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 520" role="img" aria-labelledby="t d" preserveAspectRatio="xMidYMid meet"><title id="t">职能含金量六问检核</title><desc id="d">以两行三列证据矩阵展示问题定义、数据基线、方案边界、跨部门协同、结果验收和固化复制六项检核，避免中心放射布局拥挤。</desc>{svg_common}<rect width="1200" height="520" rx="22" fill="#f7fbfa"/><text x="60" y="58" class="t" font-size="30">六问检核：不要问“忙不忙”，要问“证据在哪里”</text><text x="60" y="88" class="s" font-size="16">六项证据并列检核，避免把岗位价值压缩成单一中心指标。</text><g transform="translate(55 116)"><g transform="translate(0 0)"><rect class="box" width="340" height="122" rx="18"/><rect fill="#178b94" x="18" y="18" width="38" height="38" rx="19"/><text fill="#fff" font-weight="800" x="37" y="44" text-anchor="middle" font-size="19">1</text><text class="t" x="74" y="43" font-size="22">定义问题</text><text class="s" x="74" y="76" font-size="16">能否把模糊现象转成明确问题？</text><text class="s" x="74" y="101" font-size="16">不是只等别人派任务。</text></g><g transform="translate(375 0)"><rect class="box" width="340" height="122" rx="18"/><rect fill="#178b94" x="18" y="18" width="38" height="38" rx="19"/><text fill="#fff" font-weight="800" x="37" y="44" text-anchor="middle" font-size="19">2</text><text class="t" x="74" y="43" font-size="22">数据基线</text><text class="s" x="74" y="76" font-size="16">能否建立可信口径、版本与基线？</text><text class="s" x="74" y="101" font-size="16">不是凭感觉判断。</text></g><g transform="translate(750 0)"><rect class="box" width="340" height="122" rx="18"/><rect fill="#178b94" x="18" y="18" width="38" height="38" rx="19"/><text fill="#fff" font-weight="800" x="37" y="44" text-anchor="middle" font-size="19">3</text><text class="t" x="74" y="43" font-size="22">方案边界</text><text class="s" x="74" y="76" font-size="16">能否设计路径并说明边界与风险？</text><text class="s" x="74" y="101" font-size="16">不是只会喊口号。</text></g><g transform="translate(0 150)"><rect class="box" width="340" height="122" rx="18"/><rect fill="#caa15f" x="18" y="18" width="38" height="38" rx="19"/><text fill="#fff" font-weight="800" x="37" y="44" text-anchor="middle" font-size="19">4</text><text class="t" x="74" y="43" font-size="22">责任协同</text><text class="s" x="74" y="76" font-size="16">能否推动资源、接口和责任落位？</text><text class="s" x="74" y="101" font-size="16">不是把协调等同于转发信息。</text></g><g transform="translate(375 150)"><rect class="accent" width="340" height="122" rx="18"/><rect fill="#178b94" x="18" y="18" width="38" height="38" rx="19"/><text fill="#fff" font-weight="800" x="37" y="44" text-anchor="middle" font-size="19">5</text><text class="t" x="74" y="43" font-size="22">结果验收</text><text class="s" x="74" y="76" font-size="16">能否用结果、数据和证据完成验收？</text><text class="s" x="74" y="101" font-size="16">不是“做完了”就结束。</text></g><g transform="translate(750 150)"><rect class="accent" width="340" height="122" rx="18"/><rect fill="#178b94" x="18" y="18" width="38" height="38" rx="19"/><text fill="#fff" font-weight="800" x="37" y="44" text-anchor="middle" font-size="19">6</text><text class="t" x="74" y="43" font-size="22">固化复制</text><text class="s" x="74" y="76" font-size="16">能否沉淀标准、机制并横向复制？</text><text class="s" x="74" y="101" font-size="16">不是人一走成果就消失。</text></g></g><rect x="55" y="414" width="1090" height="66" rx="16" class="gold"/><text x="600" y="442" text-anchor="middle" class="t" font-size="21">证据型岗位价值 = 问题定义 + 数据基线 + 方案边界 + 责任协同 + 结果验收 + 固化复制</text><text x="600" y="466" text-anchor="middle" class="s" font-size="15">六项并列成立，才说明岗位从“忙碌”走向可验证、可复制的组织价值。</text></svg>''','''

s = GEN.read_text(encoding='utf-8')
pattern = re.compile(r"'2026-08-10-04-six-question-check\.svg': f'''<svg[\s\S]*?</svg>''',\n(?='2026-08-10-05-person-to-system\.svg')")
if not pattern.search(s):
    raise SystemExit('generator six-question entry not found')
s = pattern.sub(entry.lstrip(), s, count=1)
GEN.write_text(s, encoding='utf-8')

actual = SVG.read_text(encoding='utf-8')
checks = [
    '六项证据并列检核',
    'translate(375 150)',
    'translate(750 150)',
    '证据型岗位价值 = 问题定义',
]
for needle in checks:
    if needle not in actual:
        raise SystemExit(f'actual SVG missing: {needle}')
if '<circle r="96"' in actual or 'translate(600 280)' in actual:
    raise SystemExit('legacy radial layout still present')
print('0810 six-question matrix source synced and validated')
