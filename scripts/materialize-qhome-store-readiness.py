from pathlib import Path

path = Path('android/qilylean-home/app/src/main/java/com/qilylean/home/MainActivity.java')
text = path.read_text(encoding='utf-8')

text = text.replace(
    'QilyLean Home v2.2 · 秒级时钟＋农历＋周次',
    'QilyLean Home v2.3.0 · Android 16 / API 36商店版'
)

marker = '''        TextView footer = text(
                "启精益之智，聚企业之力。\\n免Root通用版，不读取、不展示手机品牌或型号。",
'''
insert = '''        addSectionTitle(content, "隐私与支持");
        addCardRow(content,
                webCard("隐私政策", "本地数据、应用可见性与网络说明", "https://qilylean.com/legal/qilylean-home/privacy/"),
                webCard("用户协议", "默认桌面、第三方应用与责任边界", "https://qilylean.com/legal/qilylean-home/terms/"));
        addCardRow(content,
                webCard("技术支持", "安装、恢复系统桌面与问题反馈", "https://qilylean.com/app-support/"),
                webCard("信任中心", "主体、隐私、证据与合作边界", "https://qilylean.com/trust/"));

        TextView footer = text(
                "启精益之智，聚企业之力。\\n免Root通用版，不读取、不展示手机品牌或型号；可随时切回系统桌面。",
'''

if 'addSectionTitle(content, "隐私与支持")' not in text:
    if marker not in text:
        raise SystemExit('Unable to locate QilyLean Home footer marker')
    text = text.replace(marker, insert)

required = [
    'QilyLean Home v2.3.0',
    'https://qilylean.com/legal/qilylean-home/privacy/',
    'https://qilylean.com/legal/qilylean-home/terms/',
    'https://qilylean.com/app-support/',
]
for token in required:
    if token not in text:
        raise SystemExit(f'Missing expected token after materialization: {token}')

path.write_text(text, encoding='utf-8')
print('QilyLean Home store-readiness UI materialized.')
