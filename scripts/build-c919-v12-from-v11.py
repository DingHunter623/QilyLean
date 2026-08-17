#!/usr/bin/env python3
from pathlib import Path
from statistics import median
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / 'qilylean' / 'c919-strategy-hero-v11.png'
OUT = ROOT / 'qilylean' / 'c919-strategy-hero-v12.webp'

if not SRC.exists():
    raise SystemExit(f'missing source image: {SRC}')

im = Image.open(SRC).convert('RGB')
if im.size != (1672, 941):
    raise SystemExit(f'unexpected C919 source dimensions: {im.size}')

px = im.load()

def median_rgb(values):
    if not values:
        return None
    return tuple(int(median([v[i] for v in values])) for i in range(3))

def erase_icon(box, sample=8):
    """Rebuild a small header background from the clean pixels immediately beside it.
    The boxes are deliberately restricted to the two decorative category icons;
    business text, borders, aircraft, brand marks and all other pixels stay untouched.
    """
    x0, y0, x1, y1 = box
    for y in range(y0, y1):
        left = [px[x, y] for x in range(max(0, x0-sample), x0)]
        right = [px[x, y] for x in range(x1, min(im.width, x1+sample))]
        # Exclude very dark foreground strokes when estimating the bar background.
        lclean = [v for v in left if sum(v) > 300] or left
        rclean = [v for v in right if sum(v) > 300] or right
        lc = median_rgb(lclean) or px[max(0, x0-1), y]
        rc = median_rgb(rclean) or px[min(im.width-1, x1), y]
        span = max(1, x1-x0-1)
        for x in range(x0, x1):
            t = (x-x0)/span
            px[x, y] = tuple(round(lc[i]*(1-t)+rc[i]*t) for i in range(3))

# Decorative icons only: left "数字化／智能化业务" and right "制造／精益工程业务".
# Keep both category texts exactly as they are.
erase_icon((47, 158, 108, 200), sample=10)
erase_icon((1343, 158, 1405, 200), sample=10)

OUT.parent.mkdir(parents=True, exist_ok=True)
im.save(OUT, 'WEBP', quality=92, method=6)
size = OUT.stat().st_size
if size < 120_000:
    raise SystemExit(f'generated v12 image unexpectedly small: {size} bytes')
print(f'C919 v12 built from standalone v11: {OUT} ({size} bytes); only two category icons removed.')
