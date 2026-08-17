#!/usr/bin/env python3
"""QilyLean six-core pricing architecture validator.

The historical filename is retained for compatibility, but the canonical
commercial architecture is six equal business categories, including APP
software development and website development.
"""
from pathlib import Path

runtime = Path('site-navigation-legacy-20260802.js').read_text(encoding='utf-8')
cooperation = Path('cooperation/index.html').read_text(encoding='utf-8')

def require(source, token, label):
    if token not in source:
        raise SystemExit(f'Missing {label}: {token}')

for token in (
    'var factoryPricing = [',
    'var leanPricing = [',
    'var visualPricing = [',
    'var digitalPricing = [',
    'var appPricing = [',
    'var websitePricing = [',
):
    require(runtime, token, 'six-core pricing group')

for token in (
    '新工厂／新产线规划',
    '精益改善项目交付',
    '目视化项目设计与交付',
    '数字化工厂',
    'APP软件开发',
    '官网建设',
):
    require(cooperation, f'<h3>{token}</h3>', 'cooperation business')

for forbidden in (
    '本模块只覆盖三大核心业务',
    '三大核心业务报价参考',
    '三大核心业务报价方案',
):
    if forbidden in runtime:
        raise SystemExit(f'Retired three-core pricing token remains: {forbidden}')

require(cooperation, 'data-qily-six-core-services="v2"', 'six-core cooperation marker')
print('Six-core pricing architecture validated: 01–06 remain commercial business categories.')
