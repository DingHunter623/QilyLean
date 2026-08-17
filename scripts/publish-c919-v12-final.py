#!/usr/bin/env python3
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
INDEX = ROOT / 'index.html'
IMAGE = '/qilylean/c919-strategy-hero-v12.webp'
PUBLIC = 'https://qilylean.com/qilylean/c919-strategy-hero-v12.webp'

html = INDEX.read_text(encoding='utf-8')

# Lock the homepage hero, preload and social cards to the same standalone v12 WebP.
html = re.sub(r'/qilylean/c919-strategy-hero(?:-v\d+)?\.(?:png|svg|webp)', IMAGE, html)
html = re.sub(r'https://qilylean\.com/qilylean/c919-strategy-hero(?:-v\d+)?\.(?:png|svg|webp)', PUBLIC, html)

# Correct MIME type for the preload after a format migration.
html = re.sub(
    r'(<link[^>]+rel=["\']preload["\'][^>]+href=["\']' + re.escape(IMAGE) + r'["\'][^>]*type=["\'])(?:image/png|image/svg\+xml|image/webp)(["\'][^>]*>)',
    r'\1image/webp\2', html, flags=re.I)

# If the existing hero img tag carries the old explicit dimensions, retain 1672×941.
hero_start = html.find('<!-- QILY-C919-STRATEGY-HERO:START -->')
hero_end = html.find('<!-- QILY-C919-STRATEGY-HERO:END -->')
if hero_start < 0 or hero_end < 0 or hero_end <= hero_start:
    raise SystemExit('C919 homepage hero markers missing')
hero = html[hero_start:hero_end]
if IMAGE not in hero:
    raise SystemExit('C919 v12 path not present in hero after rewrite')

# Semantic website rule remains fixed regardless of visual perspective.
left = '左翼承载<strong>1～3：新工厂／新产线规划、精益改善项目交付、目视化项目设计与交付</strong>'
right = '右翼承载<strong>4～6：数字化工厂、APP软件开发、官网建设</strong>'
if left not in html or right not in html:
    raise SystemExit('C919 semantic left/right business rule drifted')

INDEX.write_text(html if html.endswith('\n') else html + '\n', encoding='utf-8')
print('Homepage C919 hero locked to final standalone v12 WebP; semantic business rule unchanged.')
