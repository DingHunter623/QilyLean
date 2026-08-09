from pathlib import Path

URL='https://qilylean.com/'
EMAIL='admin@qilylean.com'

p=Path('site-navigation-core.js')
s=p.read_text(encoding='utf-8')
s=s.replace(
    "block.innerHTML = '<span>QilyLean｜技术与项目联系 / Technical &amp; Project Contact</span><a href=\"mailto:' + CONTACT_EMAIL + '\">' + CONTACT_EMAIL + '</a>';",
    "block.innerHTML = '<span>QilyLean｜技术与项目联系 / Technical &amp; Project Contact</span><span>官网网址：</span><a href=\"https://qilylean.com/\">https://qilylean.com/</a><span>企业邮箱：</span><a href=\"mailto:' + CONTACT_EMAIL + '\">' + CONTACT_EMAIL + '</a>';"
)
s=s.replace(
    "<div class=\"qily-email-list\"><div>企业邮箱</div><a class=\"qily-contact-email\" href=\"mailto:' + CONTACT_EMAIL + '\">' + CONTACT_EMAIL + '</a>",
    "<div class=\"qily-email-list\"><div>官网</div><a class=\"qily-contact-email\" href=\"https://qilylean.com/\">https://qilylean.com/</a></div><div class=\"qily-email-list\"><div>企业邮箱</div><a class=\"qily-contact-email\" href=\"mailto:' + CONTACT_EMAIL + '\">' + CONTACT_EMAIL + '</a>"
)
s=s.replace(
    "tail.innerHTML='官网：https://qilylean.com　｜　企业邮箱：<a href=\"mailto:'+CONTACT_EMAIL+'\">'+CONTACT_EMAIL+'</a>';",
    "tail.innerHTML='官网网址：https://qilylean.com/　｜　企业邮箱：<a href=\"mailto:'+CONTACT_EMAIL+'\">'+CONTACT_EMAIL+'</a>';"
)
p.write_text(s,encoding='utf-8')

p=Path('knowledge/terminology.html')
s=p.read_text(encoding='utf-8')
s=s.replace('独立网址 · 在线阅览','').replace('独立网址：在线阅览','')
p.write_text(s,encoding='utf-8')

# Extend persistent audit to cover core associations.
a=Path('scripts/audit-official-contact-association.py')
if a.exists():
    s=a.read_text(encoding='utf-8')
    extra="""\ncore=Path('site-navigation-core.js').read_text(encoding='utf-8')\nif '官网网址：https://qilylean.com/' not in core: errors.append('核心导航/文档尾注缺官网网址标准字段')\nif '企业邮箱' not in core or 'admin@qilylean.com' not in core: errors.append('核心导航缺企业邮箱')\nterm=Path('knowledge/terminology.html').read_text(encoding='utf-8')\nif '独立网址：在线阅览' in term or '独立网址 · 在线阅览' in term: errors.append('OPL入口仍残留独立网址/在线阅览说明')\n"""
    if '核心导航/文档尾注缺官网网址标准字段' not in s:
        s=s.replace("if errors:\n", extra+"if errors:\n")
        a.write_text(s,encoding='utf-8')

print('Core navigation/contact/OPL association patch applied.')
