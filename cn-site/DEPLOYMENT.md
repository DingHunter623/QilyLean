# qilylean.cn｜中国大陆站部署说明

状态：PREPRODUCTION / 未上线 / 未开放索引

## 一、生产拓扑

GitHub `DingHunter623/QilyLean`
→ `main` 中 `cn-site/` 权威代码
→ GitHub Actions 校验与打包
→ SSH 自动发布
→ 腾讯云上海轻量应用服务器
→ Nginx 预生产监听 `127.0.0.1:8080`
→ `qilylean.cn` / `www.qilylean.cn`
→ ICP 备案与上线 Gate 全部通过后，才开放公网 80/443 与搜索索引

## 二、当前主体边界

截至 2026-09-03：

- 当前未注册公司、无营业执照；
- `qilylean.cn` 已注册并完成个人实名认证，注册局 ServerHold 正在等待解除；
- 当前 QilyLean 中国站内容属于制造工程、精益改善、数字化与官网建设等业务型展示；
- 因此中国站继续作为预生产资产建设，不以“个人备案网站”名义直接开放现有业务型内容。

正式上线前必须先确认“备案主体性质”与“网站内容性质”一致。禁止为了通过备案临时伪装内容、备案后再切回不匹配内容。

## 三、上线前置 Gate

以下任一项未完成，不开放公网 80/443，也不解除 `robots.txt` 的 `Disallow: /`：

1. `qilylean.cn` ServerHold 已解除且域名状态正常；
2. 备案主体路径已确定，且与网站实际内容性质一致；
3. 国内云资源满足备案要求；
4. ICP 备案审核通过；
5. HTTPS 正常；
6. 主体/备案信息按实际情况写入 Trust / Footer，禁止虚构企业或备案信息；
7. PC、平板、手机、微信环境回归通过；
8. 百度抓取、robots、sitemap、canonical 策略验收；
9. `.com` 与 `.cn` 的品牌与 canonical/互链策略完成。

## 四、服务器目录

```text
/var/www/qilylean-cn/
├── releases/
│   └── <release-id>/
├── current -> releases/当前版本
└── previous -> releases/上一版本
```

使用软链接原子切换版本；健康检查失败时自动回滚 `previous`。服务器仅保留最近 5 个 release。

## 五、发布原则

- `qilylean.com` 现有 GitHub Pages 生产链保持不动；
- `.cn` 不做 `.com` 的机械镜像；
- 备案前预生产 Nginx 仅监听本机 `127.0.0.1:8080`；
- 首屏不得依赖长时间隐藏、强制刷新或运行时重建；
- 静态资源优先、本地资源优先，避免中国站依赖海外 CDN 才能正常渲染；
- HTML 短缓存；CSS/JS/图片按内容指纹或版本号长缓存；
- 每次发布必须经过 Gate、健康检查与可回滚验证。

## 六、DNS 目标（ServerHold 解除且备案流程允许后执行）

```text
@     A      <大陆服务器公网IPv4>
www   CNAME  qilylean.cn
```

DNS 不在备案/上线 Gate 之前抢跑。若最终采用 CDN/静态托管，则按接入商要求替换记录。

## 七、正式上线 SEO 切换

只有 ICP 备案与生产验收全部完成后才执行：

1. 首页 `meta robots` 从 `noindex,nofollow,noarchive` 改为 `index,follow,max-image-preview:large`；
2. `robots.txt` 改为允许抓取；
3. 生成并验证 `sitemap.xml`；
4. `canonical` 保持 `https://qilylean.cn/`；
5. 提交百度搜索资源平台；
6. 在 `qilylean.com` 增加中国大陆站入口；
7. `.cn` 保留对全球主站的明确入口；
8. 上线后继续执行速度、视觉、交互和 SEO 回归。
