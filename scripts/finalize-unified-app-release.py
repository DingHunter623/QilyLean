from pathlib import Path
import os
import re

TIMES_APK = 'Times26001-Android-v1.1.4-IE-Stopwatch.apk'
HOME_APK = 'QilyLean_Home_Universal_v2.1.apk'
TIMES_HASH = os.environ['TIMES_SHA256'][:8]
HOME_HASH = os.environ['HOME_SHA256'][:12]

for path in [
    Path('times26001-home-card.js'),
    Path('tools/times26001/index.html'),
    Path('capabilities/index.html'),
]:
    text = path.read_text(encoding='utf-8')
    text = text.replace('Times26001-Android-v1.1.3-IE-Stopwatch.apk', TIMES_APK)
    text = text.replace('build=9e5930e', f'build={TIMES_HASH}')
    text = text.replace('20260805-android-v113', '20260805-android-v114')
    text = text.replace('v1.1.3', 'v1.1.4')
    path.write_text(text, encoding='utf-8')

capabilities = Path('capabilities/index.html')
text = capabilities.read_text(encoding='utf-8')
text = text.replace(
    '.capability-home-icon svg{display:block;width:100%;height:100%}',
    '.capability-home-icon svg,.capability-home-icon img{display:block;width:100%;height:100%;object-fit:contain}',
)
text = re.sub(
    r'<div class="capability-home-icon" aria-hidden="true"><svg.*?</svg></div>',
    '<div class="capability-home-icon" aria-hidden="true"><img src="/assets/tools/qilylean-unified-app-icon.svg?v=20260805-unified-app-icon-v1" alt=""></div>',
    text,
    count=1,
    flags=re.S,
)
text = text.replace('QilyLean_Home_Universal_v2.0.apk', HOME_APK)
text = text.replace('build=dc8ba9ddff23', f'build={HOME_HASH}')
text = text.replace('Android官网全导航通用版 v2.0', 'Android官网全导航通用版 v2.1')
text = text.replace('Android通用版 v2.0｜', 'Android通用版 v2.1｜')
text = text.replace('Android通用版 v2.0下载', 'Android通用版 v2.1下载')
capabilities.write_text(text, encoding='utf-8')

readme = Path('android/qilylean-home/README.md')
readme_text = readme.read_text(encoding='utf-8')
readme_text = readme_text.replace('QilyLean_Home_Universal_v2.0.apk', HOME_APK)
readme_text = readme_text.replace('v2.0', 'v2.1')
readme.write_text(readme_text, encoding='utf-8')

publisher = Path('scripts/publish-qilylean-home-v2.py')
if publisher.exists():
    publisher_text = publisher.read_text(encoding='utf-8')
    publisher_text = publisher_text.replace('QilyLean_Home_Universal_v2.0.apk', HOME_APK)
    publisher_text = publisher_text.replace('v2.0', 'v2.1')
    publisher.write_text(publisher_text, encoding='utf-8')

checks = {
    'capabilities/index.html': [
        TIMES_APK,
        HOME_APK,
        'qilylean-unified-app-icon.svg',
        'Android通用版 v2.1',
    ],
    'tools/times26001/index.html': [TIMES_APK, 'v1.1.4'],
    'times26001-home-card.js': [TIMES_APK, 'v1.1.4'],
}
for name, needles in checks.items():
    content = Path(name).read_text(encoding='utf-8')
    for needle in needles:
        if needle not in content:
            raise SystemExit(f'Missing {needle!r} in {name}')

print('Unified app release website references updated successfully.')
