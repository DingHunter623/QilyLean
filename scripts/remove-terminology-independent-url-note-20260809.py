from pathlib import Path
import re

TERM = Path('knowledge/terminology.html')
SPONSOR = Path('knowledge/terminology-sponsor-v1.js')
PATCH = Path('scripts/sitewide_contact_core_patch_20260807.py')
AUDIT = Path('scripts/audit-official-contact-association.py')

for p in (TERM, SPONSOR, PATCH, AUDIT):
    if not p.exists():
        raise SystemExit(f'missing required file: {p}')

# 1) Current terminology page: remove the visible per-card note in both punctuation variants.
s = TERM.read_text(encoding='utf-8')
s = re.sub(r'<span class=\\?"term-opl-note\\?">独立网址\s*[：·]\s*在线阅览</span>', '', s)
# Embedded JS strings may contain escaped quotes but no literal span after regex depending on serialization.
s = s.replace('<span class="term-opl-note">独立网址：在线阅览</span>', '')
s = s.replace('<span class="term-opl-note">独立网址 · 在线阅览</span>', '')
# Also remove the redundant hero wording pairing the two concepts; keep the useful lesson/link-sharing message.
s = s.replace('并一对一匹配独立网址、仅供在线阅览与分享的单点培训课件；', '并一对一匹配可直接打开与分享的单点培训课件；')
s = s.replace('每个术语代码配套独立网址单点培训课件，支持在线阅览、链接分享与下载/保存PDF。', '每个术语代码配套单点培训课件，支持直接打开、链接分享与下载/保存PDF。')
TERM.write_text(s, encoding='utf-8')

# 2) Sponsor runtime card: remove its visible variant as well.
s = SPONSOR.read_text(encoding='utf-8')
s = s.replace('<span class="term-opl-note">独立网址 · 在线阅览</span>', '')
s = s.replace('<span class="term-opl-note">独立网址：在线阅览</span>', '')
SPONSOR.write_text(s, encoding='utf-8')

# 3) Legacy maintenance patch must no longer restore the phrase.
s = PATCH.read_text(encoding='utf-8')
s = s.replace("s=s.replace('独立网址 · 在线阅览','独立网址：在线阅览')", "s=s.replace('独立网址 · 在线阅览','').replace('独立网址：在线阅览','')")
s = s.replace("if '独立网址：在线阅览' not in term: errors.append('OPL入口说明未统一')", "if '独立网址：在线阅览' in term or '独立网址 · 在线阅览' in term: errors.append('OPL入口仍残留独立网址/在线阅览说明')")
PATCH.write_text(s, encoding='utf-8')

# 4) Persistent audit flips from requiring the phrase to forbidding both variants.
s = AUDIT.read_text(encoding='utf-8')
s = s.replace("if '独立网址：在线阅览' not in term: errors.append('OPL入口说明未统一')", "if '独立网址：在线阅览' in term or '独立网址 · 在线阅览' in term: errors.append('术语页仍残留独立网址/在线阅览说明')")
if "sponsor=Path('knowledge/terminology-sponsor-v1.js')" not in s:
    needle = "term=Path('knowledge/terminology.html').read_text(encoding='utf-8')\n"
    insert = needle + "sponsor=Path('knowledge/terminology-sponsor-v1.js').read_text(encoding='utf-8')\n"
    s = s.replace(needle, insert)
    marker = "if '独立网址：在线阅览' in term or '独立网址 · 在线阅览' in term: errors.append('术语页仍残留独立网址/在线阅览说明')\n"
    s = s.replace(marker, marker + "if '独立网址：在线阅览' in sponsor or '独立网址 · 在线阅览' in sponsor: errors.append('Sponsor术语入口仍残留独立网址/在线阅览说明')\n")
AUDIT.write_text(s, encoding='utf-8')

# Hard verification across active sources.
checks = [TERM, SPONSOR, PATCH, AUDIT]
for p in checks:
    text = p.read_text(encoding='utf-8')
    if p in (TERM, SPONSOR) and ('独立网址：在线阅览' in text or '独立网址 · 在线阅览' in text):
        raise SystemExit(f'visible/runtime phrase remains: {p}')

print('Terminology independent URL / online reading note cleanup applied.')
