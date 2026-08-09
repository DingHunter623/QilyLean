from pathlib import Path

changed=[]

def rw(path, fn):
    p=Path(path)
    old=p.read_text(encoding='utf-8')
    new=fn(old)
    if new!=old:
        p.write_text(new,encoding='utf-8')
        changed.append(path)

APK='/QilyLean_Home_Universal_v2.2.apk?build=20260809-qilylean-home-download-v1'
APK_ABS='https://qilylean.com/QilyLean_Home_Universal_v2.2.apk?build=20260809-qilylean-home-download-v1'
SHA='/QilyLean_Home_Universal_v2.2.sha256.txt'

# 1) Fix active share/download runtime: QilyLean Home must have the same direct-download affordance as Times26001.
def patch_share(s):
    old="""    qilyleanHome:{\n      name:'QilyLean Home｜安卓通用品牌桌面',\n      url:'https://qilylean.com/capabilities/#digital-tools',\n      qr:'/assets/tools/qr-qilylean-home-download.svg?v=20260808-share-v1'\n    }"""
    new="""    qilyleanHome:{\n      name:'QilyLean Home｜官网通用安装包',\n      url:'https://qilylean.com/capabilities/#digital-tools',\n      download:'https://qilylean.com/QilyLean_Home_Universal_v2.2.apk?build=20260809-qilylean-home-download-v1',\n      qr:'/assets/tools/qr-qilylean-home-download.svg?v=20260809-download-v2'\n    }"""
    if old not in s and "download:'https://qilylean.com/QilyLean_Home_Universal_v2.2.apk" not in s:
        raise SystemExit('QilyLean Home app config block not found')
    s=s.replace(old,new)

    marker="""    replaceLeafText(section,'Times26001｜思大时间管理','Times26001');"""
    inject="""    var homeCard=cards[1];\n    if(homeCard){\n      var homeActions=homeCard.querySelector('.module-actions');\n      if(homeActions){\n        var direct=homeActions.querySelector('[data-qilylean-home-direct-download]');\n        if(!direct){\n          direct=document.createElement('a');\n          direct.setAttribute('data-qilylean-home-direct-download','1');\n          direct.href='/QilyLean_Home_Universal_v2.2.apk?build=20260809-qilylean-home-download-v1';\n          direct.setAttribute('download','');\n          direct.textContent='下载 Android APK（v2.2）';\n          homeActions.insertBefore(direct,homeActions.firstChild);\n        }\n        homeActions.querySelectorAll('[data-app-share-qr=\"qilyleanHome\"]').forEach(function(btn){btn.textContent='扫码下载';});\n        homeActions.querySelectorAll('[data-app-share-link=\"qilyleanHome\"]').forEach(function(btn){btn.textContent='分享下载页';});\n      }\n      var homeResult=homeCard.querySelector('.module-result');\n      if(homeResult)homeResult.textContent='当前官网可下载APK：v2.2（历史归档／旧Debug签名）｜最新构建：v2.3.1 / API 36（待正式签名发布，不作为当前覆盖升级包）｜秒级时钟｜公历＋农历＋周次｜Times26001直达｜免Root';\n    }\n\n    replaceLeafText(section,'Times26001｜思大时间管理','Times26001');"""
    if 'data-qilylean-home-direct-download' not in s:
        if marker not in s:
            raise SystemExit('Capabilities normalization insertion marker not found')
        s=s.replace(marker,inject)
    return s
rw('app-download-share-v1.js', patch_share)

# 2) Fix the static/no-JS source so the download exists even before runtime JS executes.
def patch_capabilities(s):
    old='''<div class="module-result">当前官网APK：v2.2（历史归档）｜最新构建：v2.3.1 / API 36（待正式签名发布）｜秒级时钟｜公历＋农历＋周次｜Times26001直达｜免Root</div><div class="module-actions"><button type="button" class="app-share-trigger" data-app-share-qr="qilyleanHome">二维码分享</button><button type="button" class="app-link-share-trigger" data-app-share-link="qilyleanHome">分享下载链接</button><a class="secondary" href="/trust/#data">查看资料保密说明</a><a class="secondary" href="/legal/qilylean-home/privacy/">隐私政策</a><a class="secondary" href="/legal/qilylean-home/terms/">用户协议</a><a class="secondary" href="/app-support/">技术支持</a></div>'''
    new=f'''<div class="module-result">当前官网可下载APK：v2.2（历史归档／旧Debug签名）｜最新构建：v2.3.1 / API 36（待正式签名发布，不作为当前覆盖升级包）｜秒级时钟｜公历＋农历＋周次｜Times26001直达｜免Root</div><div class="module-actions"><a href="{APK}" download data-qilylean-home-direct-download="1">下载 Android APK（v2.2）</a><button type="button" class="app-share-trigger" data-app-share-qr="qilyleanHome">扫码下载</button><button type="button" class="app-link-share-trigger" data-app-share-link="qilyleanHome">分享下载页</button><a class="secondary" href="{SHA}">SHA-256校验</a><a class="secondary" href="/trust/#data">查看资料保密说明</a><a class="secondary" href="/legal/qilylean-home/privacy/">隐私政策</a><a class="secondary" href="/legal/qilylean-home/terms/">用户协议</a><a class="secondary" href="/app-support/">技术支持</a></div>'''
    if old not in s and 'data-qilylean-home-direct-download="1"' not in s:
        raise SystemExit('QilyLean Home static action block not found')
    s=s.replace(old,new)
    s=s.replace('/app-download-share-v1.js?v=20260808-times26001-unified-v2','/app-download-share-v1.js?v=20260809-qilylean-home-download-v3')
    return s
rw('capabilities/index.html', patch_capabilities)

# 3) Strengthen validator: Times26001 and QilyLean Home both require direct download + QR + share.
def patch_validator(s):
    s=s.replace(
        '    "Capabilities has direct download": "download>下载 Android APK</a>" in Path("capabilities/index.html").read_text(encoding="utf-8"),',
        '    "Times26001 capabilities direct download": "download>下载 Android APK</a>" in Path("capabilities/index.html").read_text(encoding="utf-8"),\n    "QilyLean Home capabilities direct download": "data-qilylean-home-direct-download=\\"1\\"" in Path("capabilities/index.html").read_text(encoding="utf-8"),\n    "QilyLean Home runtime direct download": "QilyLean_Home_Universal_v2.2.apk?build=20260809-qilylean-home-download-v1" in Path("app-download-share-v1.js").read_text(encoding="utf-8"),\n    "QilyLean Home scan download": "data-app-share-qr=\\"qilyleanHome\\">扫码下载" in Path("capabilities/index.html").read_text(encoding="utf-8"),\n    "QilyLean Home share download page": "data-app-share-link=\\"qilyleanHome\\">分享下载页" in Path("capabilities/index.html").read_text(encoding="utf-8"),'
    )
    return s
rw('scripts/refine_app_download_share_20260808.py', patch_validator)

# 4) Clarify the release manifest so visitors and maintenance scripts do not confuse latest unsigned build with downloadable public APK.
def patch_manifest(s):
    s=s.replace('"label": "历史官网安装包（旧Debug签名）"','"label": "当前官网可下载历史归档包（旧Debug签名）"')
    return s
rw('app-release-manifest.json', patch_manifest)

# 5) Hard validation before commit.
cap=Path('capabilities/index.html').read_text(encoding='utf-8')
share=Path('app-download-share-v1.js').read_text(encoding='utf-8')
manifest=Path('app-release-manifest.json').read_text(encoding='utf-8')
required=[
    ('static direct apk','data-qilylean-home-direct-download="1"' in cap and '/QilyLean_Home_Universal_v2.2.apk?build=20260809-qilylean-home-download-v1' in cap),
    ('scan label','data-app-share-qr="qilyleanHome">扫码下载' in cap),
    ('share label','data-app-share-link="qilyleanHome">分享下载页' in cap),
    ('runtime download',"download:'https://qilylean.com/QilyLean_Home_Universal_v2.2.apk?build=20260809-qilylean-home-download-v1'" in share),
    ('cache bust','/app-download-share-v1.js?v=20260809-qilylean-home-download-v3' in cap),
    ('manifest clarity','当前官网可下载历史归档包（旧Debug签名）' in manifest),
    ('apk exists',Path('QilyLean_Home_Universal_v2.2.apk').exists()),
    ('sha exists',Path('QilyLean_Home_Universal_v2.2.sha256.txt').exists()),
]
failed=[name for name,ok in required if not ok]
if failed:
    raise SystemExit('validation failed: '+', '.join(failed))

print('QilyLean Home download/share closure completed')
for item in changed:
    print(' -',item)
