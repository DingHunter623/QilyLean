# QilyLean Home v2.3.0｜Android 16 / API 36商店准备版

面向常见Android手机自主开发的免Root品牌桌面，不读取、不展示IMEI、序列号、手机品牌、型号或其他设备身份信息。

## v2.3.0升级内容

- `compileSdk`与`targetSdk`统一升级至Android 16 / API 36；
- 版本升级为`versionCode 8`、`versionName 2.3.0`；
- 桌面时钟保持“小时：分钟：秒钟”格式，并按秒同步刷新；
- 日期同步显示公历、星期、年度周次和中国农历；
- 保留“Times26001”直达入口，用于黄历、IE分段计时、闹钟与倒计时；
- 为Android 11及以上补充应用可见性声明，仅查询可启动应用和`com.qilylean.times26001`；
- 不申请`QUERY_ALL_PACKAGES`，应用抽屉信息仅在本机使用；
- 新增隐私政策、用户协议、技术支持与信任中心入口；
- 继续采用统一Q图标，并明确可随时切回系统原桌面；
- 增加AAB、Release APK、固定签名和证书指纹自动验证流水线。

## 应用标识

- 包名：`com.qilylean.home`
- 最低Android版本：Android 6.0 / API 23
- 目标Android版本：Android 16 / API 36
- 版本：`2.3.0 (8)`

## 法律与支持页面

- 隐私政策：`https://qilylean.com/legal/qilylean-home/privacy/`
- 用户协议：`https://qilylean.com/legal/qilylean-home/terms/`
- 技术支持：`https://qilylean.com/app-support/`

## 构建层级

### PR自动验证

`.github/workflows/build-qilylean-home.yml`会生成未签名的Release APK和AAB，仅用于编译、元数据和API 36兼容性验证，不得直接提交应用商店。

### 正式签名发行

`.github/workflows/release-qilylean-home-store.yml`通过手动触发，并从GitHub Actions Secrets读取固定Release密钥，生成：

- `QilyLean_Home_v2.3.0_API36_release.apk`
- `QilyLean_Home_v2.3.0_API36_release.aab`
- `CERTIFICATE_FINGERPRINTS.txt`
- `SHA256SUMS.txt`

所需Secrets：

- `QHOME_ANDROID_KEYSTORE_BASE64`
- `QHOME_ANDROID_KEYSTORE_PASSWORD`
- `QHOME_ANDROID_KEY_ALIAS`
- `QHOME_ANDROID_KEY_PASSWORD`

密钥文件和密码不得提交到GitHub仓库。

## 安装与恢复

正式APK生成后可执行：

```bash
adb install -r QilyLean_Home_v2.3.0_API36_release.apk
```

按Home键后选择`QilyLean Home`并选择“始终”。需要恢复时，进入应用内“默认桌面”或Android系统“默认应用／主屏幕应用”切回原系统桌面，也可卸载：

```bash
adb uninstall com.qilylean.home
```

## 安全边界

本版本是应用层免Root定制，不解锁Bootloader、不刷Recovery、不修改系统分区、基带、IMEI、EFS、开机动画或通信底层。应用可见性仅用于本机应用抽屉和Times26001直达，不上传、不用于广告或用户画像。
