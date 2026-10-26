#!/usr/bin/env python3
"""Fail closed before China production switch if approved Qily259 VI is absent.

QILY-CN-CONTACT-VI-POKA-YOKE-20261026
Protects the user-accepted three-pillar contact layout, while Playwright remains
the authoritative pixel and click-to-copy production acceptance check.
"""
from __future__ import annotations

import argparse
from pathlib import Path
import re
import sys


class RegressionError(ValueError):
    pass


def verify(html: str, parity_css: str) -> None:
    def ensure(condition: bool, message: str) -> None:
        if not condition:
            raise RegressionError(message)

    ensure(html.count('id="qilyCnWechatPillAlignment20261026"') == 1,
           "Approved contact pill style missing or duplicated")
    match = re.search(
        r'<style id="qilyCnWechatPillAlignment20261026">([\s\S]*?)</style>', html
    )
    ensure(match is not None, "Contact pill CSS is not inline in the page head")
    style = re.sub(r'\s+', '', match.group(1))
    ensure('button#qilyCnWechatValue' in style and
           'a.qily-unified-qr-value' in style,
           "Approved pill CSS no longer targets all three labels")
    for rule in (
        'background-color:#0f4b5a!important',
        'color:#fff!important',
        'border-radius:24px!important',
        'min-height:44px!important',
        'display:inline-flex!important',
        'align-items:center!important',
        'justify-content:center!important',
    ):
        ensure(rule in style, "Approved pill style contract changed: " + rule)

    ensure(html.count('id="qilyCnWechatValue"') == 1,
           "Qily259 copy control missing or duplicated")
    ensure(html.count('class="qily-unified-qr-card"') == 3,
           "The About contact grid must contain exactly three cards")
    ensure(
        len(re.findall(r'class="qily-about-copy-feedback"', html)) == 1,
        "Hidden copy-feedback node missing or duplicated",
    )
    ensure(
        re.search(
            r'<button id="qilyCnWechatValue"[^>]*data-qily-copy="Qily259"'
            r'[^>]*>Qily259</button>\s*'
            r'<span class="qily-about-copy-feedback"',
            html,
        ) is not None,
        "Qily259 button/copy feedback order changed: risk of vertical shift",
    )
    ensure(
        html.find('>qilylean.com</a>') <
        html.find('>qilylean.cn</a>') <
        html.find('>Qily259</button>'),
        "The three contact labels changed their approved visual order",
    )
    ensure(
        'var feedback=card?card.querySelector(\'.qily-about-copy-feedback\')'
        in html,
        "Click-to-copy runtime no longer targets in-card feedback",
    )
    ensure(
        'qily-about-copy-feedback.is-visible' in style
        and 'position:absolute!important' in style,
        "Copy feedback may displace the aligned pill",
    )
    ensure(
        'QILY-CN-ABOUT-CONTACT-PARITY-20261025' in parity_css
        and '.qily-unified-qr-card' in parity_css,
        "Shared contact parity stylesheet missing approved rules",
    )


def self_test(html: str, css: str) -> None:
    verify(html, css)
    bad = [
        html.replace('id="qilyCnWechatPillAlignment20261026"', 'id="obsolete"'),
        html.replace('background-color:#0f4b5a!important',
                     'background-color:#f7fbfa!important'),
        html.replace('id="qilyCnWechatValue"', 'id="obsolete-button"'),
        html.replace('>Qily259</button><span class="qily-about-copy-feedback"',
                     '><span class="qily-about-copy-feedback"></span>Qily259</button>'),
    ]
    for case in bad:
        try:
            verify(case, css)
        except RegressionError:
            continue
        raise RegressionError("Regression guard failed to detect a broken fixture")
    print("PASS: four negative regression fixtures are rejected")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("site", nargs="?", default="cn-site", type=Path)
    parser.add_argument("--self-test", action="store_true")
    args = parser.parse_args()
    html_path = args.site / "about" / "index.html"
    css_path = args.site / "assets" / "cn-sitewide-visual-parity-v1.css"
    try:
        html = html_path.read_text(encoding="utf-8")
        css = css_path.read_text(encoding="utf-8")
        verify(html, css)
        if args.self_test:
            self_test(html, css)
    except (RegressionError, OSError) as exc:
        print("BLOCK CN DEPLOYMENT: approved contact VI regression: " + str(exc),
              file=sys.stderr)
        return 1
    print("PASS: protected Qily259 style, alignment and copy feedback "
          "are present in the release candidate.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
