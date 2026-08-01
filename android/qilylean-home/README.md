# QilyLean Home v1.0｜Android通用版

面向常见安卓手机的免Root品牌桌面，不展示手机品牌、型号或其他设备身份信息。

## 功能

- 使用 QilyLean｜启力精益官方LOGO与橄榄绿视觉；
- 官网、QilyLean AI、代表项目、知识分享、今日简报、项目合作快捷入口；
- 网络与互联网、电池、显示、声音、壁纸、应用、安全、语言与输入等通用设置入口；
- 内置全部应用抽屉；
- 可设为系统默认桌面，并可随时切回原系统桌面；
- 首页不读取、不展示手机品牌、型号或设备名称。

## 安装

1. 开启手机“开发者选项 → USB调试”；
2. 手机解锁并连接Mac；
3. 执行：

```bash
adb install -r QilyLean_Home_Universal_v1.0.apk
```

4. 按Home键；
5. 选择 `QilyLean Home`，并选择“始终”。

## 回退

进入“默认桌面”切回原系统桌面，或执行：

```bash
adb uninstall com.qilylean.home
```

## 安全边界

本版本是应用层免Root定制，不解锁Bootloader，不刷Recovery，不修改系统分区、基带、IMEI、EFS、开机动画或通信底层。
