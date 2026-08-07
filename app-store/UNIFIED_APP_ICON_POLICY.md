# QilyLean双APP统一图标与安装交付规范

更新时间：2026-08-08

适用应用：

| 应用 | 包名 | 应用市场候选版 |
| --- | --- | --- |
| QilyLean Home | `com.qilylean.home` | `2.3.1 (9)` |
| 思大时间管理｜Times26001 | `com.qilylean.times26001` | `1.1.6 (9)` |

## 1. 唯一视觉基线

两个APP统一使用QilyLean Q图标：青绿色Q主体、深色内核、右上红色圆点、外围透明。

仓库唯一商店图标源：

`assets/tools/qilylean-unified-app-icon.svg`

统一色值：

- Q主体：`#126478`
- 深色内核：`#081E20`
- 红色圆点：`#F03A39`
- 外围背景：透明

禁止：

- 为Times26001额外叠加“时间/秒表”等角标；
- 为QilyLean Home额外叠加“Home/桌面”等角标；
- APK与应用市场分别使用不同颜色、不同背景或不同Q图；
- 安装前后切换另一套图标。

两个APP通过“应用名称 + 包名”区分，而不是通过修改主品牌图标区分。

## 2. 图标一致性链路

发布前必须确保以下五处使用同一Q图视觉：

1. 应用市场商店图标；
2. APK/AAB内置应用图标；
3. Android安装确认界面显示的应用图标；
4. 安装后桌面、应用抽屉图标；
5. Android系统“应用信息/权限/通知”页面图标。

### QilyLean Home

- Manifest：`android:icon="@drawable/ic_launcher"`
- Round icon：`android:roundIcon="@drawable/ic_launcher"`
- Drawable：`android/qilylean-home/app/src/main/res/drawable/ic_launcher.xml`

### Times26001

- Manifest：`android:icon="@drawable/qily_unified_app_icon"`
- Round icon：`android:roundIcon="@drawable/qily_unified_app_icon"`
- Drawable：由`Times26001/scripts/apply-unified-app-icon.mjs`在构建时写入。

## 3. 应用市场图标输出

运行GitHub Actions：

`Export unified QilyLean store icons`

将从唯一SVG源生成：

- `QilyLean_Unified_App_Icon_512.png`：Google Play等商店提交；
- `QilyLean_Unified_App_Icon_1024.png`：高分辨率商店素材/国内市场备用；
- `SHA256SUMS.txt`：交付校验。

两个APP提交商店时必须复用同一份PNG，不重复另做一套。

## 4. 安装包交付命名

### QilyLean Home

- `QilyLean_Home_v2.3.1_API36_release.apk`
- `QilyLean_Home_v2.3.1_API36_release.aab`

### Times26001

- `Times26001_v1.1.6_API36_release.apk`
- `Times26001_v1.1.6_API36_release.aab`

每套正式产物同时交付：

- `CERTIFICATE_FINGERPRINTS.txt`
- `ICON_POLICY.txt`
- `SHA256SUMS.txt`

## 5. 发布前验收

- [ ] 两个APP的商店图标肉眼一致；
- [ ] 两个APP安装确认页图标与商店图标一致；
- [ ] 两个APP安装后桌面/应用抽屉图标与安装确认页一致；
- [ ] QilyLean Home版本为`2.3.1 (9)`；
- [ ] Times26001版本为`1.1.6 (9)`；
- [ ] 两个APP均为API 36目标版本；
- [ ] AAB/APK使用各自固定Release签名，不使用Debug签名；
- [ ] `ICON_POLICY.txt`与SHA-256随正式包留档；
- [ ] 隐私政策、用户协议、技术支持网址均可公网访问；
- [ ] 商店截图、名称、文案与实际功能一致。

## 6. 版本迭代纪律

后续任何版本升级，只允许变更应用版本、功能与必要的商店素材；除非QilyLean品牌图标正式换版，否则两个APP不得各自修改主图标。若品牌图标换版，必须在同一次发布周期同时更新：商店图标源、两个APP原生图标、安装包、应用市场素材与官网展示。
