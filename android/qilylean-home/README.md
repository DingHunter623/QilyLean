# QilyLean Home v2.2｜Android官网全导航通用版

面向常见安卓手机自主开发的免Root品牌桌面，不展示手机品牌、型号或其他设备身份信息。

## v2.2升级内容

- 桌面时钟升级为“小时：分钟：秒钟”格式，并按秒同步刷新；
- 日期同步显示公历日期、星期与年度周次；
- 同步显示中国农历月份、日期及闰月状态；
- 新增“思大时间管理”直达入口：检测到Times26001时直接启动，用于查看黄历、IE分段计时、闹钟与倒计时；未安装时自动进入官网安装与使用页；
- 保留官网首页全导航、重点内容直达、通用设置和全部应用抽屉；
- 继续采用统一Q图标，并保持免Root和设备信息保护边界。

## 发布校验

- APK：`QilyLean_Home_Universal_v2.2.apk`
- SHA-256：`19dad120e99b9577ab745a7f432444ea0304e788c27c27bd42fdcef45d5563c2`
- 官网下载：`https://qilylean.com/QilyLean_Home_Universal_v2.2.apk`

## 安装

```bash
adb install -r QilyLean_Home_Universal_v2.2.apk
```

如旧版本与新构建签名不同：

```bash
adb uninstall com.qilylean.home
adb install QilyLean_Home_Universal_v2.2.apk
```

按Home键后选择 `QilyLean Home`，并选择“始终”。

## 回退

进入“默认桌面”切回原系统桌面，或执行：

```bash
adb uninstall com.qilylean.home
```

## 安全边界

本版本是应用层免Root定制，不读取、不展示手机品牌、型号或设备名称；不解锁Bootloader，不刷Recovery，不修改系统分区、基带、IMEI、EFS、开机动画或通信底层。
