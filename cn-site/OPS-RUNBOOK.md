# QilyLean 中国大陆服务器运维 Runbook

状态：PREPRODUCTION / 未对公网开放

## 当前生产边界

- 现有 `qilylean.com` GitHub Pages 生产站保持不动。
- `qilylean.cn` 大陆服务器先完成服务器初始化、版本发布、回滚和本机健康检查。
- 在备案与上线 Gate 未解除前，预生产 Nginx 仅监听 `127.0.0.1:8080`，不由本脚本开放公网 80/443。
- 中国站继续保持 `noindex,nofollow` 与 `robots.txt Disallow: /`。

## 服务器基线

- Ubuntu 24.04 LTS
- 腾讯云上海轻量应用服务器
- 登录用户：`ubuntu`
- 发布根目录：`/var/www/qilylean-cn`
- 版本目录：`/var/www/qilylean-cn/releases/<release-id>`
- 当前版本：`/var/www/qilylean-cn/current`
- 上一版本：`/var/www/qilylean-cn/previous`

## 一次性 GitHub Secrets

在仓库 Settings → Secrets and variables → Actions 中增加：

- `CN_PREPROD_HOST`：大陆服务器公网 IPv4，仅填写 IP/主机名，不带协议。
- `CN_PREPROD_USER`：`ubuntu`
- `CN_PREPROD_SSH_KEY`：与腾讯云实例绑定的 SSH 私钥全文。只存储在 GitHub Actions Secret，不提交到仓库。

## 首次服务器初始化

将 `cn-site/scripts/server-bootstrap.sh` 传到服务器后执行一次。该脚本：

1. 安装 Nginx、rsync、curl；
2. 创建标准发布目录；
3. 删除 Nginx 默认站点；
4. 建立只监听 `127.0.0.1:8080` 的预生产站；
5. 验证 Nginx 配置并启动服务。

## 自动发布

工作流：`.github/workflows/deploy-cn-preprod.yml`

发布前强制检查：

- `index.html` 必须存在；
- `assets/site.css` 必须存在；
- HTML 必须保留 `noindex,nofollow`；
- `robots.txt` 必须保留 `Disallow: /`。

通过后：

GitHub Actions → 打包站点 → SSH 上传 → 创建 release → `current` 原子切换 → Nginx reload → `127.0.0.1:8080` HTTP 200 健康检查 → 失败自动回滚 previous。

服务器仅保留最近 5 个 release。

## 正式开放 Gate

备案、域名、HTTPS、法定/主体信息和跨端验收全部通过后，再单独启用 `cn-site/nginx/qilylean.cn.conf` 的公网 80/443 生产配置，并解除 noindex/robots 阻断。禁止通过临时命令跳过该 Gate。
