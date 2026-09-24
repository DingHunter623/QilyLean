# QilyLean Home｜腾讯应用宝首发提交清单

更新时间：2026-09-24

## 1. 固定提交口径

- 应用名称：QilyLean Home
- 包名：`com.qilylean.home`
- 版本：`2.3.3`
- versionCode：`11`
- minSdk：23
- targetSdk / compileSdk：36
- 开发者：丁启利（QilyLean｜启力精益）
- 官方网站：https://qilylean.com
- 支持邮箱：admin@qilylean.com
- 隐私政策：https://qilylean.com/legal/qilylean-home/privacy
- 用户协议：https://qilylean.com/legal/qilylean-home/terms
- 技术支持：https://qilylean.com/app-support
- 登录：无
- 广告：无
- 应用内购买：无
- 推荐分类：实用工具 / 主题桌面 / 效率（以后台实际分类为准）

## 2. 应用宝文案

### 一句话简介
精益制造效率桌面

### 应用简介
QilyLean Home是一款面向精益制造、工业工程与日常效率场景的Android桌面启动器，提供秒级时钟、公历、星期、年度周次、农历、应用抽屉、系统设置入口、QilyLean官网导航和Times26001直达。应用免Root，不修改系统分区，不设账号，不投放广告，不集成第三方广告或统计SDK；用户可随时在Android系统中切回原桌面。

### 版本说明
统一至v2.3.3 / versionCode 11 / Android API 36；完善官网导航、官方邮箱和URL口径，继续使用QilyLean统一Q图标并保持桌面、安装界面与商店素材一致。

## 3. 正式提交产物

签名工作流：`.github/workflows/release-qilylean-home-store.yml`

预期产物：
- `QilyLean_Home_v2.3.3_API36_release.apk`
- `QilyLean_Home_v2.3.3_API36_release.aab`
- `CERTIFICATE_FINGERPRINTS.txt`
- `ICON_POLICY.txt`
- `YINGYONGBAO_RELEASE_INFO.txt`
- `SHA256SUMS.txt`

应用宝首发使用APK；AAB仅留作其他商店/归档。

## 4. 商店素材

- 统一图标源：`assets/tools/qilylean-unified-app-icon.svg`
- 商店512×512 PNG：使用“Export unified QilyLean store icons”工作流导出
- 截图：使用真实APP界面，建议4—6张竖屏截图；不得用与真实APP不一致的概念图替代
- 隐私截图：首次隐私告知/隐私政策常驻入口等，以应用宝后台实际要求为准

## 5. 资质状态

### 已具备/仓库已准备
- [x] Android正式工程
- [x] 包名和版本统一
- [x] 隐私政策
- [x] 用户协议
- [x] 技术支持页
- [x] 商店文案
- [x] 固定Release签名工作流
- [x] 统一品牌图标源

### 外部资料仍需真实凭证
- [ ] 腾讯开放平台开发者实名认证
- [ ] 软件著作权登记证书或平台认可的电子版权凭证
- [ ] 工信部APP备案号/备案证明（联网APP）
- [ ] 应用宝后台要求的承诺函或其他最新资质
- [ ] 真实APP商店截图最终上传版

不得虚构证书号、备案号、主体资质或审核状态。

## 6. 提交前红线核验

1. 应用名称、包名、软著简称、APP备案名称保持一致。
2. APK必须为固定Release签名，不使用Debug签名。
3. 隐私政策、用户协议、支持页面必须公网可访问。
4. 商店截图必须与真实版本v2.3.3一致。
5. 不在APP内诱导绕过应用商店下载或更新APK。
6. 不声明未实际取得的备案、软著或商店审核结果。
