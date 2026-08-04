# QilyLean Home v2.0｜Android官网全导航通用版

面向常见安卓手机自主开发的免Root品牌桌面，不展示手机品牌、型号或其他设备身份信息。

## v2.0升级内容

- 按QilyLean官网当前首页导航重构移动端入口；
- 完整纳入：首页、能力画像、履历主线、代表项目、改善经验、QilyLean AI、知识分享、行走印记、项目合作；
- 保留今日简报、全站术语和友情链接等重点直达入口；
- 保留网络、电池、显示、声音、壁纸、应用、安全、语言与输入等通用设置；
- 保留全部应用抽屉、系统设置和默认桌面切换；
- 优化卡片密度与长标题排布，避免词组被拆成孤立单字换行。

## 安装

1. 开启手机“开发者选项 → USB调试”；
2. 手机解锁并连接Mac；
3. 执行：

```bash
adb install -r QilyLean_Home_Universal_v2.0.apk
```

如旧版本与新构建签名不同，先卸载旧版：

```bash
adb uninstall com.qilylean.home
adb install QilyLean_Home_Universal_v2.0.apk
```

4. 按Home键；
5. 选择 `QilyLean Home`，并选择“始终”。

## 回退

进入“默认桌面”切回原系统桌面，或执行：

```bash
adb uninstall com.qilylean.home
```

## 安全边界

本版本是应用层免Root定制，不读取、不展示手机品牌、型号或设备名称；不解锁Bootloader，不刷Recovery，不修改系统分区、基带、IMEI、EFS、开机动画或通信底层。
