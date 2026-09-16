# QilyLean 中国大陆服务器运维 Runbook

状态：PRODUCTION / 已备案 / HTTPS 已启用 / 搜索入口已开放

## 当前生产边界

- `qilylean.com` 继续作为国际站，不改变其现有生产架构。
- `qilylean.cn` 为中国大陆个人制造业知识与实践分享站，备案服务名称：`精益制造经验分享`。
- 网站备案号：`湘ICP备2026041143号-1`。
- 中国站严禁项目合作、业务承接、报价、收费、咨询预约、交易、营销转化、直接联络入口以及潜藏商业导流。
- 中国站仅允许一个经过隔离的国际知识延伸入口：`https://qilylean.com/global-knowledge/`；该入口本身不得承担商业转化。
- 公网主域统一为 `https://qilylean.cn/`；HTTP 与 `www` 统一 301 到 HTTPS 根域。

## 服务器基线

- Ubuntu 24.04 LTS
- 腾讯云上海轻量应用服务器
- 公网 IPv4：`1.117.71.235`
- 登录用户：`ubuntu`
- 发布根目录：`/var/www/qilylean-cn`
- 版本目录：`/var/www/qilylean-cn/releases/<release-id>`
- 当前版本：`/var/www/qilylean-cn/current`
- 上一版本：`/var/www/qilylean-cn/previous`
- 防火墙：TCP 22 / 80 / 443 + ICMP

## DNS

- `@` A → `1.117.71.235`
- `www` CNAME → `qilylean.cn`
- TTL：600

## HTTPS

- 证书覆盖：`qilylean.cn`、`www.qilylean.cn`
- 证书目录：`/etc/letsencrypt/live/qilylean.cn/`
- 自动续期：Certbot timer
- Nginx 生产配置：`cn-site/nginx/qilylean.cn.conf`
- 每次发布后必须验证：
  - `http://qilylean.cn` → 301
  - `http://www.qilylean.cn` → 301
  - `https://qilylean.cn` → 200
  - `https://www.qilylean.cn` → 301

## GitHub Actions Secrets

仓库 Actions 使用以下 Secrets（禁止提交明文）：

- `CN_PREPROD_HOST`：大陆服务器公网 IPv4 / 主机名
- `CN_PREPROD_USER`：`ubuntu`
- `CN_PREPROD_SSH_KEY`：实例 SSH 私钥全文

历史 Secret 名称保留是为了兼容现有工作流；其实际用途已从预生产发布切换为中国站正式发布。

## 自动发布

工作流：`.github/workflows/deploy-cn-preprod.yml`

发布前强制执行：

1. 生产结构 Gate：首页、知识栏目、文章、样式、sitemap、robots、Nginx 配置必须存在；
2. ICP Gate：首页必须展示 `湘ICP备2026041143号-1`；
3. 中国个人站非商业内容 Gate：禁止商业词、直接联络钩子和未授权国际站 URL；
4. 完整递归打包站点，排除运维脚本、Nginx 配置和 Markdown 文档；
5. SSH 上传并执行 release 原子切换；
6. Nginx 配置测试与 reload；
7. 重新收敛所有旧 QilyLean Nginx listener，只保留生产 vhost；
8. 验证根域 HTTPS 200 及 HTTP / www 规范化 301。

失败时工作流必须报错，不以“页面能打开”为替代验收。

## 内容架构

中国站不再采用单页占位形式，目前核心结构包括：

- `/lean/` 精益生产
- `/ie/` 工业工程
- `/standardization/` 标准化
- `/factory/` 工厂与车间规划
- `/digital/` 数智工厂
- `/methods/` 方法框架
- `/notes/` 实践笔记
- `/knowledge/` 制造知识索引及专题文章
- `/about/` 站点说明与内容边界

## 搜索引擎入口

- 首页 robots meta：`index,follow`
- `robots.txt`：Allow `/`
- Sitemap：`https://qilylean.cn/sitemap.xml`
- 404 页面：`noindex`

搜索开放只代表允许抓取，不等于已被百度、Bing 等收录。搜索平台的站点验证、sitemap 提交和后续收录监测应单独执行。

## 公安联网备案

公安联网备案数据码仅用于备案流程，不得公开到网页、GitHub 或社交平台。网站正式开通后按适用要求完成公安联网备案；取得公安备案号后再把对应编号及合法链接写入页脚。
