# QilyLean双APP应用市场发布执行单｜2026-08-08

## 发布对象

| APP | 包名 | 候选版本 | Android目标 | 正式产物 |
| --- | --- | ---: | ---: | --- |
| QilyLean Home | `com.qilylean.home` | `2.3.1 (9)` | API 36 | APK + AAB |
| 思大时间管理｜Times26001 | `com.qilylean.times26001` | `1.1.6 (9)` | API 36 | APK + AAB |

## Gate 1｜统一图标

先运行QilyLean仓库工作流：`Export unified QilyLean store icons`。

验收：

- `QilyLean_Home_store_icon_512.png`与`Times26001_store_icon_512.png`字节一致；
- `QilyLean_Home_store_icon_1024.png`与`Times26001_store_icon_1024.png`字节一致；
- 商店图标源为`assets/tools/qilylean-unified-app-icon.svg`；
- APK安装图标与安装后图标分别由两个APP的构建工作流自动校验。

## Gate 2｜QilyLean Home未签名验证

运行：`Build QilyLean Home API 36 packages`

必须通过：

- 包名`com.qilylean.home`；
- versionCode `9`；
- versionName `2.3.1`；
- targetSdk `36`；
- `android:icon`与`android:roundIcon`都指向`@drawable/ic_launcher`；
- 统一Q图三项色值及透明外围背景校验；
- 未签名APK/AAB能成功构建。

## Gate 3｜Times26001未签名验证

在Times26001仓库运行：`Validate Times26001 API 36 store packages`

必须通过：

- 包名`com.qilylean.times26001`；
- versionCode `9`；
- versionName `1.1.6`；
- targetSdk `36`；
- `android:icon`与`android:roundIcon`都指向`@drawable/qily_unified_app_icon`；
- 统一Q图三项色值及透明外围背景校验；
- 精确闹钟、隐私政策、用户协议、技术支持入口校验；
- 未签名APK/AAB能成功构建。

## Gate 4｜配置固定Release签名

### QilyLean Home仓库Secrets

- `QHOME_ANDROID_KEYSTORE_BASE64`
- `QHOME_ANDROID_KEYSTORE_PASSWORD`
- `QHOME_ANDROID_KEY_ALIAS`
- `QHOME_ANDROID_KEY_PASSWORD`

### Times26001仓库Secrets

- `TIMES_ANDROID_KEYSTORE_BASE64`
- `TIMES_ANDROID_KEYSTORE_PASSWORD`
- `TIMES_ANDROID_KEY_ALIAS`
- `TIMES_ANDROID_KEY_PASSWORD`

规则：keystore、私钥、明文密码不得提交GitHub；第一次正式上架后永久保管同一上传密钥。

## Gate 5｜正式签名包

### QilyLean Home

运行：`Release QilyLean Home signed store packages`

应得到：

- `QilyLean_Home_v2.3.1_API36_release.apk`
- `QilyLean_Home_v2.3.1_API36_release.aab`
- `CERTIFICATE_FINGERPRINTS.txt`
- `ICON_POLICY.txt`
- `SHA256SUMS.txt`

### Times26001

运行：`Release Times26001 signed store packages`

应得到：

- `Times26001_v1.1.6_API36_release.apk`
- `Times26001_v1.1.6_API36_release.aab`
- `CERTIFICATE_FINGERPRINTS.txt`
- `ICON_POLICY.txt`
- `SHA256SUMS.txt`

## Gate 6｜真机安装验收

两个APP分别在至少一台Android 12—16设备完成：

- [ ] APK文件/安装确认页显示统一Q图；
- [ ] 安装后桌面显示统一Q图；
- [ ] 应用抽屉显示统一Q图；
- [ ] 系统“应用信息”显示统一Q图；
- [ ] 两APP名称清晰可区分；
- [ ] QilyLean Home可正常设为/退出默认桌面；
- [ ] Times26001闹钟、倒计时、通知、响铃、秒表核心功能正常；
- [ ] 隐私政策、用户协议、技术支持入口可打开。

## Gate 7｜应用市场资料

两个APP分别准备：

- 商店名称、简介、详细介绍、更新说明；
- 统一Q图512×512；
- 6—8张真实功能截图；
- 隐私政策、用户协议、技术支持网址；
- 内容分级、目标受众、广告/付费情况；
- 数据安全/隐私申报；
- Times26001精确闹钟权限用途说明；
- QilyLean Home桌面启动器、应用可见性与恢复系统桌面说明；
- 开发者身份/主体与目标商店要求的其他资质。

## Gate 8｜提交与官网回写

顺序建议：

1. 先提交商店测试/审核轨道；
2. 记录商店后台版本号、审核状态和提交日期；
3. 审核通过后再将“商店已上架”状态回写官网；
4. 官网若继续提供APK，必须使用同一正式Release签名体系，禁止再发布Debug签名包；
5. 后续版本严格递增versionCode，并沿用统一Q图与固定签名。

## 红线

- 未签名包、Debug签名包不得提交应用市场；
- 两个APP不得各做一套Q图；
- 安装包、安装过程、安装后不得出现图标切换；
- 不得在仓库中提交keystore、私钥或明文密码；
- 商店隐私/权限申报不得与实际代码不一致。
