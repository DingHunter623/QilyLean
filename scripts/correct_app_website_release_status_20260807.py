from pathlib import Path
import json

MANIFEST = Path('app-release-manifest.json')
m = json.loads(MANIFEST.read_text(encoding='utf-8'))
m['updatedAt'] = '2026-08-07'
for key, oldv, newv, code in [
    ('times26001','1.1.4','1.1.6',9),
    ('qilyleanHome','2.2','2.3.1',9),
]:
    app=m['apps'][key]
    app['publicRelease']['label']='历史官网安装包（旧Debug签名）'
    app['latestBuild']={
        'versionName':newv,
        'versionCode':code,
        'targetSdk':36,
        'label':'最新构建',
        'status':'构建与企业联系信息校验完成；生产签名待启用',
        'upgradeFromHistoricalPublicApk':'旧官网Debug签名与当前构建签名不同，不作为覆盖升级包发布'
    }
    app['storeCandidate']={
        'versionName':newv,
        'versionCode':code,
        'targetSdk':36,
        'label':'应用市场候选版',
        'status':'生产签名待启用；签名完成后官网与应用市场共用稳定发布链'
    }
MANIFEST.write_text(json.dumps(m,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')


def replace(path, pairs):
    p=Path(path); s=p.read_text(encoding='utf-8'); old=s
    for a,b in pairs: s=s.replace(a,b)
    if s!=old: p.write_text(s,encoding='utf-8')

replace('times26001-home-card.js',[
('官网公开版 v1.1.4 可直接下载，应用市场候选版 v1.1.5 / API 36 正在发布准备。','历史官网安装包 v1.1.4 仍保留；最新构建 v1.1.6 / API 36 已完成企业官网与官网邮箱升级，生产签名完成后切换官网正式下载。'),
('官网公开版 v1.1.4｜应用市场候选 v1.1.5 / API 36','历史官网包 v1.1.4｜最新构建 / 商店候选 v1.1.6 / API 36'),
('官网下载公开版 v1.1.4','历史版 v1.1.4（不建议新装）'),
('Times26001 官网公开版 v1.1.4 支持闹钟响铃、秒表分段、总时长汇总、按秒倒计时及结束响铃通知；应用市场候选版为 v1.1.5 / API 36。','Times26001 历史官网安装包为 v1.1.4；最新构建 / 应用市场候选版为 v1.1.6 / API 36，已加入官网与官网邮箱，待生产签名后切换正式下载。')])

replace('tools/times26001/index.html',[
('官网公开版 v1.1.4 已开放直接下载；应用市场候选版 v1.1.5 / API 36 正在发布准备。','历史官网安装包 v1.1.4 仍保留；最新构建 v1.1.6 / API 36 已完成，已加入官网与官网邮箱，待生产签名后切换正式下载。'),
('官网公开版 v1.1.4 可直接下载；应用市场候选版 v1.1.5 / API 36 正在发布准备。','历史官网安装包为 v1.1.4；最新构建 / 应用市场候选版为 v1.1.6 / API 36，生产签名完成后切换官网正式下载。'),
('官网下载公开版 v1.1.4','历史版 v1.1.4（不建议新装）'),
('<h2>官网公开下载版</h2><p>当前官网核验公开包为 Android v1.1.4，可直接下载；应用市场候选版单独管理，避免把商店候选源码与官网公开APK混为同一版本。</p>','<h2>Android 下载与发布状态</h2><p>历史官网安装包 v1.1.4 仍保留用于追溯，但不再作为最新版推荐；最新构建 v1.1.6 / versionCode 9 / API 36 已完成企业官网与官网邮箱升级，待生产签名启用后切换为官网正式下载包。</p>'),
('<h3>Times26001 官网公开版 v1.1.4</h3>','<h3>Times26001 历史官网安装包 v1.1.4</h3>'),
('该文件是当前官网公开核验版，不等同于应用市场候选版。','该文件采用历史Debug签名，仅作为旧版留档，不建议新安装；不能与后续生产签名版视为同一升级链。'),
('Times26001 v1.1.5｜versionCode 8｜targetSdk 36。正式签名发布包完成后再更新为可提交商店包','Times26001 v1.1.6｜versionCode 9｜targetSdk 36。最新构建已完成官网与官网邮箱升级；生产签名发布包完成后切换官网正式下载并提交应用市场')])

replace('capabilities/index.html',[
('官网公开版 v1.1.4｜应用市场候选版 v1.1.5 / API 36','历史官网包 v1.1.4｜最新构建 / 应用市场候选 v1.1.6 / API 36'),
('官网下载公开版 v1.1.4','历史版 v1.1.4'),
('Android 官网公开版 v2.2｜应用市场候选版 v2.3.0 / API 36','Android 历史官网包 v2.2｜最新构建 / 应用市场候选 v2.3.1 / API 36'),
('官网公开版 v2.2｜应用市场候选版 v2.3.0 / API 36','历史官网包 v2.2｜最新构建 / 应用市场候选 v2.3.1 / API 36'),
('官网下载公开版 v2.2','历史版 v2.2（不建议新装）')])

replace('app-support/index.html',[
('官网公开版 v1.1.4；应用市场候选版 v1.1.5 / targetSdk 36。','历史官网安装包 v1.1.4；最新构建 / 应用市场候选版 v1.1.6 / versionCode 9 / targetSdk 36。'),
('官网公开版 v2.2；应用市场候选版 v2.3.0 / targetSdk 36。','历史官网安装包 v2.2；最新构建 / 应用市场候选版 v2.3.1 / versionCode 9 / targetSdk 36。'),
('“官网公开版”表示当前官网提供并可核验下载的APK；“应用市场候选版”表示面向商店提交准备的源码/构建版本。未正式上架前，不把候选版描述为已上市版本。','历史官网安装包采用旧Debug签名，仅用于追溯；最新构建已完成官网与官网邮箱升级，但在生产签名启用前不替换官网安装包，避免造成错误的覆盖升级链。正式生产签名启用后，官网APK与应用市场包统一进入同一稳定签名链。')])

replace('app-store/times26001/README.md',[
('官网公开版：`1.1.4`','历史官网安装包：`1.1.4`（旧Debug签名）'),
('应用市场候选版：`1.1.5` / Android API 36','最新构建 / 应用市场候选版：`1.1.6` / versionCode `9` / Android API 36')])
replace('app-store/qilylean-home/README.md',[
('官网公开版：`2.2`','历史官网安装包：`2.2`（旧Debug签名）'),
('应用市场候选版：`2.3.0` / Android API 36','最新构建 / 应用市场候选版：`2.3.1` / versionCode `9` / Android API 36')])

replace('assets/tools/times26001-overview.svg',[
('官网公开版 Android v1.1.4','历史官网 Android v1.1.4'),
('应用市场候选版为v1.1.5 / API 36','最新构建 / 应用市场候选版为v1.1.6 / API 36'),
('官网公开 v1.1.4 · 商店候选 v1.1.5 / API36','历史官网 v1.1.4 · 最新构建 v1.1.6 / API36')])

print('website release status corrected')
