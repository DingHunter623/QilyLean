# QilyLean Home v0.1

面向格力色界 G0245D（Android 6.0.1）的免 Root 品牌桌面。

## 功能

- 使用 QilyLean｜启力精益官方 LOGO；
- 可设为系统默认桌面；
- 官网、QilyLean AI、代表项目、知识分享、今日简报、项目合作快捷入口；
- 内置全部应用抽屉；
- 可进入系统设置与默认桌面设置；
- 不修改系统分区、Bootloader、Recovery、基带、IMEI 或 EFS。

## 安装

1. 开启手机“开发者选项 → USB 调试”；
2. 手机连接 Mac 并允许 USB 调试；
3. 执行：

```bash
adb install -r QilyLean_Home_G0245D_v0.1.apk
```

4. 手机按 Home 键；
5. 选择 `QilyLean Home`，并选择“始终”。

## 回退

进入 QilyLean Home 的“默认桌面”入口，切换回原系统桌面；或执行：

```bash
adb uninstall com.qilylean.home
```

## 限制

本版本是应用层免 Root 定制，不修改真正的开机第一屏、系统开机动画、系统名称或 IMS/VoLTE 通信底层。
