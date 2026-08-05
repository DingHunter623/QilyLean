from pathlib import Path

DATE = '2026-08-06'


def replace_once(path: Path, old: str, new: str) -> None:
    text = path.read_text(encoding='utf-8')
    if new in text:
        return
    if old not in text:
        raise SystemExit(f'Expected source marker not found: {path}')
    path.write_text(text.replace(old, new, 1), encoding='utf-8')


def add_sitemap_urls(path: Path) -> None:
    text = path.read_text(encoding='utf-8')
    urls = [
        ('https://qilylean.com/legal/times26001/privacy/', '0.6'),
        ('https://qilylean.com/legal/times26001/terms/', '0.6'),
        ('https://qilylean.com/legal/qilylean-home/privacy/', '0.6'),
        ('https://qilylean.com/legal/qilylean-home/terms/', '0.6'),
        ('https://qilylean.com/app-support/', '0.7'),
    ]
    additions = []
    for url, priority in urls:
        if f'<loc>{url}</loc>' not in text:
            additions.append(
                f'  <url><loc>{url}</loc><lastmod>{DATE}</lastmod>'
                f'<changefreq>monthly</changefreq><priority>{priority}</priority></url>'
            )
    if additions:
        if '</urlset>' not in text:
            raise SystemExit(f'Invalid sitemap: {path}')
        text = text.replace('</urlset>', '\n'.join(additions) + '\n</urlset>')
        path.write_text(text, encoding='utf-8')


replace_once(
    Path('tools/times26001/index.html'),
    '<button id="copyUrl" type="button">复制本页网址</button><span class="status" id="copyStatus"></span>',
    '<button id="copyUrl" type="button">复制本页网址</button>'
    '<a href="/legal/times26001/privacy/">隐私政策</a>'
    '<a href="/legal/times26001/terms/">用户协议</a>'
    '<a href="/app-support/">技术支持</a>'
    '<span class="status" id="copyStatus"></span>'
)

replace_once(
    Path('capabilities/index.html'),
    '<a class="secondary" href="/Times26001-Android-v1.1.4-IE-Stopwatch.apk?build=af47a9ec" download>Android直接下载</a></div></article>',
    '<a class="secondary" href="/Times26001-Android-v1.1.4-IE-Stopwatch.apk?build=af47a9ec" download>Android直接下载</a>'
    '<a class="secondary" href="/legal/times26001/privacy/">隐私政策</a>'
    '<a class="secondary" href="/legal/times26001/terms/">用户协议</a>'
    '<a class="secondary" href="/app-support/">技术支持</a></div></article>'
)

replace_once(
    Path('capabilities/index.html'),
    '<a class="secondary" href="/trust/#data">查看资料保密说明</a></div></article>',
    '<a class="secondary" href="/trust/#data">查看资料保密说明</a>'
    '<a class="secondary" href="/legal/qilylean-home/privacy/">隐私政策</a>'
    '<a class="secondary" href="/legal/qilylean-home/terms/">用户协议</a>'
    '<a class="secondary" href="/app-support/">技术支持</a></div></article>'
)

for sitemap in (Path('sitemap.xml'), Path('sitemap-core.xml')):
    add_sitemap_urls(sitemap)

for required in (
    Path('legal/times26001/privacy/index.html'),
    Path('legal/times26001/terms/index.html'),
    Path('legal/qilylean-home/privacy/index.html'),
    Path('legal/qilylean-home/terms/index.html'),
    Path('app-support/index.html'),
):
    if not required.exists():
        raise SystemExit(f'Missing required legal page: {required}')

print('App store legal links and sitemaps materialized.')
