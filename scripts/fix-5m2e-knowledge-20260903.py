from pathlib import Path
import re

HTML = Path('knowledge/terminology.html')
JS = Path('knowledge/terminology-sponsor-v1.js')

NEW_EN = 'Man / Machine / Material / Method / Measurement / Environment / Energy'
NEW_ZH = '人、机、料、法、测、环、能'
NEW_APP = '用于从人员、设备、材料、方法、测量、环境、能源／动力七类要素系统展开可能原因，是质量异常、设备故障、工艺波动、效率损失与现场排查的结构化要因分析框架。能源／动力可包括电力、压缩空气、真空、冷却水、蒸汽等公用工程条件。'
NEW_CASE = '某自动化工位出现间歇性停机，团队按5M2E逐项核查人员操作与培训、设备报警与保全、物料批次、工艺参数、测量／传感器校准、环境温湿度，以及电源、压缩空气与真空等能源条件，最终用数据锁定气压波动，并将供气阈值、点检与异常反应纳入标准。'
VERSION = '20260903-5m2e-knowledge-v1'


def replace_5m2e_card(html: str) -> str:
    pattern = re.compile(
        r'(<article class="term-card" data-term-card id="term-5m2e" data-term-slug="5m2e">)(.*?)(</article>)',
        re.S,
    )
    m = pattern.search(html)
    if not m:
        raise SystemExit('ERROR: 5M2E term card not found')
    body = m.group(2)
    body, n1 = re.subn(r'<div class="term-en">.*?</div>', f'<div class="term-en">{NEW_EN}</div>', body, count=1, flags=re.S)
    body, n2 = re.subn(r'<h3>.*?</h3>', f'<h3>{NEW_ZH}</h3>', body, count=1, flags=re.S)
    body, n3 = re.subn(
        r'<p><strong>应用场景：</strong>.*?</p>',
        f'<p><strong>应用场景：</strong>{NEW_APP}</p>',
        body,
        count=1,
        flags=re.S,
    )
    if (n1, n2, n3) != (1, 1, 1):
        raise SystemExit(f'ERROR: incomplete 5M2E card replacement: {(n1, n2, n3)}')
    return html[:m.start()] + m.group(1) + body + m.group(3) + html[m.end():]


def replace_5m2e_jsonld(html: str) -> str:
    old_re = re.compile(
        r'"name":"人、机、料、法、测、环(?:、能)?","termCode":"5M2E","alternateName":"[^"]*","description":"[^"]*"'
    )
    new = (
        f'"name":"{NEW_ZH}","termCode":"5M2E",'
        f'"alternateName":"{NEW_EN}",'
        f'"description":"应用场景： {NEW_APP}"'
    )
    html, n = old_re.subn(new, html, count=1)
    if n != 1:
        raise SystemExit('ERROR: 5M2E JSON-LD entry not found')
    return html


def update_html() -> None:
    html = HTML.read_text(encoding='utf-8')
    html = replace_5m2e_card(html)
    html = replace_5m2e_jsonld(html)
    html, n = re.subn(
        r'/knowledge/terminology-sponsor-v1\.js\?v=[^"\']+',
        f'/knowledge/terminology-sponsor-v1.js?v={VERSION}',
        html,
        count=1,
    )
    if n != 1:
        raise SystemExit('ERROR: terminology sponsor cache-buster reference not found')
    HTML.write_text(html, encoding='utf-8')


def update_js() -> None:
    js = JS.read_text(encoding='utf-8')
    js, n = re.subn(r"var VERSION = '[^']+';", f"var VERSION = '{VERSION}';", js, count=1)
    if n != 1:
        raise SystemExit('ERROR: VERSION declaration not found')

    if "'5M2E':" not in js.partition('var RELATIONS = {')[0]:
        anchor = "    'SPONSOR':'某自动化项目在SAT后出现安全、节拍与资源冲突，项目经理权限不足。Sponsor组织重大里程碑评审，明确风险红线、资源与再验证条件，证据齐套后再批准进入Pilot。'"
        if anchor not in js:
            raise SystemExit('ERROR: SPECIFIC_CASES insertion anchor not found')
        js = js.replace(anchor, f"    '5M2E':'{NEW_CASE}',\n" + anchor, 1)

    head, sep, tail = js.partition('  var RELATIONS = {')
    if not sep:
        raise SystemExit('ERROR: RELATIONS block not found')
    if "'5M2E':" not in tail:
        anchor = "    'SPONSOR':[['/knowledge/pdca-gantt-milestone-opl.html','专题｜项目里程碑管理'],['/qilylean/daily/2026-08-19.html','精选简报｜工程交付闭环'],['/cooperation/','相关项目能力']]"
        if anchor not in tail:
            raise SystemExit('ERROR: RELATIONS insertion anchor not found')
        tail = tail.replace(
            anchor,
            "    '5M2E':[['/improvements/','改善方法｜要因分析与现场改善'],['/projects/','代表项目｜问题诊断与改善验证'],['/qilylean/daily-insights.html','精选简报｜制造问题解决']],\n" + anchor,
            1,
        )
    js = head + sep + tail
    JS.write_text(js, encoding='utf-8')


def validate() -> None:
    html = HTML.read_text(encoding='utf-8')
    js = JS.read_text(encoding='utf-8')
    must_html = [NEW_EN, NEW_ZH, NEW_APP, f'terminology-sponsor-v1.js?v={VERSION}']
    must_js = [f"var VERSION = '{VERSION}';", "'5M2E':'" + NEW_CASE, "'5M2E':[['/improvements/'"]
    for needle in must_html:
        if needle not in html:
            raise SystemExit(f'ERROR: HTML validation missing: {needle[:60]}')
    for needle in must_js:
        if needle not in js:
            raise SystemExit(f'ERROR: JS validation missing: {needle[:60]}')
    if '<div class="term-en">Man-Machine-Material-Method-Measurement-Environment</div>' in html:
        raise SystemExit('ERROR: stale visible 5M2E English definition remains')
    old_card = '<h3>人、机、料、法、测、环</h3>'
    card = re.search(r'id="term-5m2e".*?</article>', html, re.S)
    if card and old_card in card.group(0):
        raise SystemExit('ERROR: stale visible 5M2E Chinese definition remains')


if __name__ == '__main__':
    update_html()
    update_js()
    validate()
    print('5M2E knowledge correction completed and validated.')
