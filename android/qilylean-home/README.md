# QilyLean Home｜Galaxy C55 专属版 v0.2

面向三星 Galaxy C55 的免 Root 品牌桌面，基于现有 QilyLean Home 继续优化。

## 专属适配

- 使用 QilyLean｜启力精益官方 LOGO 与橄榄绿视觉；
- 针对三星竖屏与 One UI 使用习惯优化布局；
- 增加“设备维护、显示设置、壁纸与主题、应用管理”快捷入口；
- 首页显示实际设备型号与 Android 版本；
- 可设为系统默认桌面，也可随时切回 One UI 主屏幕；
- 官网、QilyLean AI、代表项目、知识分享、今日简报、项目合作快捷入口；
- 内置全部应用抽屉。

## 安装

1. 开启手机“开发者选项 → USB 调试”；
2. 手机连接 Mac 并允许 USB 调试；
3. 执行：

```bash
adb install -r QilyLean_Home_Galaxy_C55_v0.2.apk
```

4. 手机按 Home 键；
5. 选择 `QilyLean C55`，并选择“始终”。

## 回退

在桌面点击“默认桌面”，切换回 One UI 主屏幕；或执行：

```bash
adb uninstall com.qilylean.home
```

## 安全边界

本版本是应用层免 Root 定制，不解锁 Bootloader，不刷 Recovery，不修改系统分区、基带、IMEI、EFS、系统开机动画或通信底层。
