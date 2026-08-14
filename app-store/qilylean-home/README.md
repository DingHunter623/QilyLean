# QilyLean Home 应用商店提交资料

更新时间：2026-08-14  
开发者：丁启利（QilyLean｜启力精益）  
包名：`com.qilylean.home`  
支持邮箱：`admin@qilylean.com`  
产品官方网址：`https://qilylean.com/capabilities#digital-tools`

## 0. 官网与应用市场版本关联

- 当前官网安装包 / 最新构建：`2.3.3` / versionCode `11` / Android API 36
- 应用市场候选版：`2.3.2` / versionCode `10` / Android API 36
- 包名：`com.qilylean.home`
- 开发者支持官方网址：`https://qilylean.com`
- 官网邮箱：`admin@qilylean.com`
- 规则：官网安装包、最新构建与应用市场候选版分别按统一发布清单管理；只有正式签名发布包完成并提交对应商店后，才更新“已上架/正式商店版”状态。

## 0.1 双APP统一图标规则

QilyLean Home与Times26001统一使用同一QilyLean Q图标：青绿色Q主体、深色内核、右上红点、外围透明。

- 商店图标唯一源：`assets/tools/qilylean-unified-app-icon.svg`
- QilyLean Home安装图标：`@drawable/ic_launcher`
- 安装包、Android安装确认界面、安装后桌面/应用抽屉、系统应用信息页必须保持同一Q图视觉；
- 两个APP通过应用名称和包名区分，不在主Q图上叠加Home/时间等第二角标；
- 商店PNG通过`Export unified QilyLean store icons`工作流统一输出，QilyLean Home与Times26001的同规格PNG必须字节一致；
- 详细规范见`app-store/UNIFIED_APP_ICON_POLICY.md`。

统一色值：Q主体`#126478`、深色内核`#081E20`、红点`#F03A39`、外围透明。

## 1. 商店名称与文案

### 应用名称
QilyLean Home

### 副标题／一句话简介
精益制造品牌桌面、秒级时钟与效率工具入口

### 80字以内简介
一款免Root Android桌面，提供秒级时钟、公历、星期、周次、农历、应用抽屉、系统设置、QilyLean官网导航及Times26001直达。

### 详细介绍
QilyLean Home是一款面向精益制造、工业工程与日常效率场景的Android桌面启动器。

核心功能：
- 小时：分钟：秒钟格式的秒级时钟；
- 公历日期、星期、年度周次与中国农历同步显示；
- 本机应用抽屉，快速启动已安装应用；
- 网络、电池、显示、声音、壁纸、安全、输入法和默认桌面设置入口；
- QilyLean首页、履历主线、能力体系、改善方法、代表项目、信任中心、项目合作与知识资产导航；
- “Times26001”直达：已安装时直接启动，未安装时进入官方说明页；
- 用户可随时切回系统原桌面；
- 免Root，不修改系统分区、基带、IMEI、EFS或通信底层；
- 不设账号、不投放广告、不集成第三方广告或统计SDK。

### 当前构建说明
- 当前官网安装包 / 最新构建：v2.3.3 / versionCode 11 / API 36；
- 应用市场候选版：v2.3.2 / versionCode 10 / API 36；
- 官网最新导航布局、官方网址与官网邮箱口径已同步；
- 双APP统一QilyLean Q图标；
- 提交应用市场前继续以对应候选包的固定Release签名与平台资料为准。

## 2. 分类与标签

- Google Play分类：个性化／工具（根据审核反馈二选一，优先“个性化”）
- 国内商店建议分类：主题桌面 / 实用工具 / 效率
- 关键词：桌面启动器、Launcher、秒级时钟、农历、周次、应用抽屉、精益生产、工业工程、QilyLean
- 广告：无
- 应用内购买：无
- 登录：无
- 建议年龄分级：3岁以上／Everyone

## 3. 隐私与Data Safety申报口径

### 开发者主动收集或共享的数据
- 当前版本：不主动上传本机应用列表、日期时间、桌面使用记录或设备身份信息；不出售或向广告商共享。

### 本地处理
- 当前日期、时间、星期、周次和农历：本地计算；
- 可启动应用名称、图标和包名：仅用于本机应用抽屉；
- “Times26001”安装状态：仅用于决定直接启动或打开官方网页。

### 权限与能力
- 网络：用户主动打开QilyLean官网和法律／支持网页；
- HOME类别：允许用户自主设置为默认桌面；
- 应用可见性查询：显示可启动应用和检测Times26001；
- 系统设置Intent：跳转Android官方设置页。

### 隐私政策网址
`https://qilylean.com/legal/qilylean-home/privacy`

### 用户协议网址
`https://qilylean.com/legal/qilylean-home/terms`

### 技术支持网址
`https://qilylean.com/app-support`

## 4. Google Play审核说明

核心价值说明：

> QilyLean Home不是仅封装网站的WebView。它注册为用户可选的Android桌面启动器，在本机提供秒级时钟、公历、周次、农历、应用抽屉、系统设置入口、默认桌面管理和已安装工具启动能力；官网导航是桌面功能的一部分，而不是应用唯一功能。

应用可见性说明：

> 应用仅查询具有Android LAUNCHER入口的可启动应用，用于生成用户主动打开的本机应用抽屉；同时仅明确查询`com.qilylean.times26001`，用于“Times26001”直达。查询结果不上传、不用于广告、画像或分析。

默认桌面说明：

> 是否设为默认桌面完全由用户在Android系统界面选择。应用提供“默认桌面”入口和明确恢复说明，不锁定、不阻止用户切回系统桌面。

## 5. 截图清单

建议至少准备6张1080×1920竖屏截图：
1. 首页全景：统一Q图标、秒级时钟、公历、周次、农历；
2. 官网首页导航卡片；
3. 数字工具直达及Times26001入口；
4. 通用快捷管理入口；
5. 全部应用抽屉；
6. 默认桌面设置与恢复说明；
7. 隐私政策、用户协议和技术支持入口。

## 6. 提交前硬性校验

- [ ] `compileSdk`和`targetSdk`为36；
- [ ] 官网安装包 / 最新构建为`versionCode 11`、`versionName 2.3.3`；
- [ ] 应用市场候选版为`versionCode 10`、`versionName 2.3.2`；
- [ ] Manifest包含LAUNCHER、HOME、DEFAULT及必要的`queries`声明；
- [ ] 不申请`QUERY_ALL_PACKAGES`；
- [ ] 正式商店AAB使用固定Release签名；
- [ ] 隐私政策、协议和支持页公网可访问；
- [ ] 商店文案明确第三方桌面属性和恢复方式；
- [ ] 商店图标使用统一Q图，且与APK安装界面、安装后桌面/应用抽屉图标一致；
- [ ] `ICON_POLICY.txt`、证书指纹与SHA-256随正式包留档；
- [ ] 在Android 12—16至少各验证一次Home键、应用抽屉、默认桌面切换和Times26001启动；
- [ ] 完成Data Safety、内容分级、目标受众和应用访问说明；
- [ ] 新个人账号按目标商店现行规则完成测试或资质审核。
