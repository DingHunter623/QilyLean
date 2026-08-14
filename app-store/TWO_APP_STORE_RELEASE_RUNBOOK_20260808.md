# QilyLean APP应用市场发布执行单｜2026-08-08

## 当前发布策略

国内应用市场**优先发布 Times26001**。QilyLean Home保留为后续候选，不与Times26001首发并行推进，避免同时增加备案、资质与审核工作量。

Times26001统一定位：

> **面向工业工程、现场改善与时间研究场景的专业测时工具，由 QilyLean｜启力精益开发。**

## 发布对象

| 优先级 | APP | 包名 | 候选版本 | Android目标 | 正式产物 |
| --- | --- | --- | ---: | ---: | --- |
| P0｜国内首发 | Times26001 | `com.qilylean.times26001` | `1.1.6 (9)` | API 36 | APK + AAB |
| P1｜后续评估 | QilyLean Home | `com.qilylean.home` | `2.3.1 (9)` | API 36 | APK + AAB |

## Gate 1｜Times26001名称与品牌统一

验收：

- 应用市场名称、Android安装名称、APP备案名称、软著简称、官网主标题统一为 `Times26001`；
- “思大时间管理”仅作为历史名称留档；
- 统一QilyLean Q图用于商店、安装包、安装确认界面及安装后桌面；
- APP底部保留QilyLean｜启力精益、官网与官网邮箱；
- 官网与官网邮箱作为品牌与技术支持入口，不作为国内商店版站外APK更新通道。

## Gate 2｜Times26001未签名验证

在Times26001仓库运行：`Validate Times26001 API 36 store packages`

必须通过：

- 包名`com.qilylean.times26001`；
- versionCode `9`；
- versionName `1.1.6`；
- targetSdk `36`；
- Android安装名称为`Times26001`；
- `android:icon`与`android:roundIcon`都指向`@drawable/qily_unified_app_icon`；
- 统一Q图三项色值及透明外围背景校验；
- 精确闹钟、隐私政策、用户协议、技术支持入口校验；
- 未签名APK/AAB能成功构建。

## Gate 3｜配置固定Release签名

Times26001仓库配置：

- `TIMES_ANDROID_KEYSTORE_BASE64`
- `TIMES_ANDROID_KEYSTORE_PASSWORD`
- `TIMES_ANDROID_KEY_ALIAS`
- `TIMES_ANDROID_KEY_PASSWORD`

规则：keystore、私钥、明文密码不得提交GitHub；第一次正式上架后永久保管同一上传密钥。

## Gate 4｜正式签名包

运行：`Release Times26001 signed store packages`

应得到：

- `Times26001_v1.1.6_API36_release.apk`
- `Times26001_v1.1.6_API36_release.aab`
- `CERTIFICATE_FINGERPRINTS.txt`
- `ICON_POLICY.txt`
- `SHA256SUMS.txt`

## Gate 5｜真机安装验收

至少一台Android设备完成：

- [ ] 安装确认页显示统一Q图；
- [ ] 安装名称显示`Times26001`；
- [ ] 安装后桌面、应用抽屉、系统“应用信息”显示统一Q图；
- [ ] APP主标题显示`Times26001`；
- [ ] APP底部显示统一产品定位；
- [ ] 官网`https://qilylean.com`可由用户主动打开；
- [ ] 官网邮箱`admin@qilylean.com`可正常唤起邮件；
- [ ] APP内无“官网下载最新版APK”等绕过应用市场的更新引导；
- [ ] IE秒表分段、累计总时长、数据复制正常；
- [ ] 倒计时、闹钟、通知与响铃正常；
- [ ] 隐私政策、用户协议、技术支持入口可打开。

## Gate 6｜软件著作权与APP备案

Times26001建议统一：

- 软件全称：`Times26001工业工程时间研究软件`；
- 软件简称：`Times26001`；
- APP名称：`Times26001`；
- 包名：`com.qilylean.times26001`；
- 服务定位：工业工程时间研究、现场测时、倒计时、闹钟及时间日历辅助。

以登记机构、接入商及目标应用市场当期实际审核要求为准。

## Gate 7｜应用市场资料

Times26001准备：

- 商店名称：Times26001；
- 一句话简介：工业工程时间研究与IE现场测时工具；
- 统一Q图512×512及目标商店要求的其他规格；
- 6—8张真实功能截图；
- 隐私政策、用户协议、技术支持网址；
- 内容分级、目标受众、广告/付费情况；
- 数据安全/隐私申报；
- 精确闹钟权限用途说明；
- 软件著作权、APP备案、开发者身份及目标商店要求的其他资质。

## Gate 8｜国内应用市场提交顺序

建议按以下顺序推进：

1. 华为应用市场；
2. 小米应用商店；
3. OPPO软件商店；
4. vivo应用商店；
5. 荣耀应用市场；
6. 应用宝。

每个平台均使用同一产品名称、定位、图标、隐私口径和固定Release签名链。

## Gate 9｜官网回写

1. 首次提交后记录平台、版本号、提交日期和审核状态；
2. 审核通过后再在官网标注对应“已上架”状态；
3. 官网继续承担QilyLean品牌、精益生产、工程改善、数智工厂内容及Times26001产品介绍；
4. APP可主动跳转官网形成品牌延伸，但国内商店版更新以应用市场为主；
5. 官网若保留历史APK，应明确其历史属性，不在APP内诱导安装；
6. 后续版本严格递增versionCode并沿用固定签名。

## 红线

- 未签名包、Debug签名包不得提交应用市场；
- 不得更换`com.qilylean.times26001`包名；
- 不得在“Times26001 / 思大时间管理 / 普通时间工具”等名称之间反复切换；
- APP不得引导用户绕过应用市场下载、更新或安装APK；
- 不得在仓库中提交keystore、私钥或明文密码；
- 商店隐私/权限申报不得与实际代码不一致。
