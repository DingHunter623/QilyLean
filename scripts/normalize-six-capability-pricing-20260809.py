#!/usr/bin/env python3
"""Historical compatibility validator.

Public hierarchy is now:
- 3 core businesses
- digital factory as engineering/digital enabler
- APP software and website as digital product capabilities

Pricing groups may still exist for all capabilities, but they must not be used
to redefine all six as equal core businesses.
"""
from pathlib import Path

runtime = Path('site-navigation-legacy-20260802.js').read_text(encoding='utf-8')
cooperation = Path('cooperation/index.html').read_text(encoding='utf-8')

for token in ('var factoryPricing = [', 'var leanPricing = [', 'var visualPricing = ['):
    if token not in runtime:
        raise SystemExit(f'Missing core pricing group: {token}')

if '三大核心业务' not in cooperation:
    raise SystemExit('Public hierarchy must declare 三大核心业务')
if '<h2>六类核心业务</h2>' in cooperation:
    raise SystemExit('Six-core public classification regression detected')

print('Pricing compatibility validated without redefining six capabilities as equal core businesses.')
