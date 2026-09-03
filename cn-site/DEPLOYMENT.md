# qilylean.cn｜中国大陆企业站部署说明

状态：建设中 / 未上线 / 未开放索引

## 一、生产拓扑

GitHub `DingHunter623/QilyLean`
→ 分支/发布流程
→ `cn-site/` 静态发布包
→ 中国大陆云服务器
→ Nginx
→ `qilylean.cn` / `www.qilylean.cn`
→ ICP 备案通过后正式开放索引

## 二、上线前置 Gate

以下任一项未完成，不解除 `robots.txt` 的 `Disallow: /`：

1. 公司主体正式登记完成；
2. `qilylean.cn` 注册完成并完成适配备案的实名信息；
3. 国内服务器/静态托管资源满足备案条件；
4. ICP 备案审核通过；
5. HTTPS 正常；
6. 企业法定信息写入 Trust / Footer；
7. PC、平板、手机、微信环境回归通过；
8. 百度抓取、robots、sitemap、canonical 策略验收；
9. `.com` 与 `.cn` 双向品牌关联完成。

## 三、服务器目录

建议：

```text
/var/www/qilylean-cn/
├── releases/
│   └── YYYYMMDD-HHMMSS/
├── current -> releases/当前版本
└── previous -> releases/上一版本
```

使用软链接切换版本，确保发布可快速回滚。

## 四、发布原则

- `qilylean.com` 生产链保持不动；
- `.cn` 不直接复制 `.com` 全站；
- 首屏不得使用长时间隐藏、强制刷新或运行时重建页面；
- 静态资源优先、本地资源优先，避免中国站依赖海外 CDN 才能正常渲染；
- HTML 短缓存，CSS/JS/图片按内容指纹或版本号长缓存；
- 生产发布必须先通过视觉、功能、性能与合规 Gate。

## 五、DNS 目标（购买云资源后填写真实值）

```text
@     A      <大陆服务器IPv4>
www   CNAME  qilylean.cn
```

若最终使用云 CDN/静态托管，则按供应商备案与接入要求替换为其指定记录。

## 六、正式上线 SEO 切换

备案通过并完成生产验收后：

1. 将首页 `meta robots` 从 `noindex,nofollow,noarchive` 改为 `index,follow,max-image-preview:large`；
2. 将 `robots.txt` 改为允许抓取；
3. 生成 `sitemap.xml`；
4. `canonical` 保持 `https://qilylean.cn/`；
5. 提交百度搜索资源平台；
6. 在 `qilylean.com` 增加中国大陆企业站入口；
7. `.cn` 明确保留全球主站链接。
