#!/usr/bin/env python3
"""Compatibility validator for the retired six-capability pricing publisher.

The historical filename is retained because old documentation and workflow links
may still reference it. It must never recreate 04–06 pricing groups.
"""

from pathlib import Path


runtime = Path("site-navigation-legacy-20260802.js").read_text(encoding="utf-8")
cooperation = Path("cooperation/index.html").read_text(encoding="utf-8")

required_runtime = (
    "三大核心业务报价参考",
    "三大核心业务报价方案",
    "<strong>三大核心业务</strong>",
    "本模块只覆盖三大核心业务",
    "01｜新工厂／车间布局规划",
    "02｜精益生产项目交付",
    "03｜目视化项目设计与交付",
)

for token in required_runtime:
    if token not in runtime:
        raise SystemExit(f"Missing three-core pricing token: {token}")

for token in (
    "var digitalPricing =",
    "var appPricing =",
    "var websitePricing =",
    "<h3>04｜",
    "<h3>05｜",
    "<h3>06｜",
    "六类项目合作能力报价",
):
    if token in runtime:
        raise SystemExit(f"Retired six-capability pricing token remains: {token}")

if "QILY-PRICING-POLICY" not in cooperation:
    raise SystemExit("Static pricing policy marker is missing")
if "三大核心业务按范围、投入、交付物和验收标准独立报价" not in cooperation:
    raise SystemExit("Static three-core pricing boundary is missing")

print("Three-core pricing architecture validated; retired filename kept for compatibility.")
