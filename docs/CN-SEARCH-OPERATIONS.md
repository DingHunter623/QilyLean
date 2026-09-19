# QilyLean 中国站搜索接入

目标域名为 `https://qilylean.cn/`。官网版式和知识分享定位由原发布流程维护。

## 验收口径

- 可抓取：线上 Sitemap 与源文件一致，16个当前网址（数量随 Sitemap 更新）返回200、正文包含标题和H1、规范网址指向自身、没有禁止索引标记。
- 模拟抓取：百度、必应、360、搜狗的UA请求能读取首页。此检查不证明真实搜索爬虫到访。
- 已提交：保存接口状态与接收回执。IndexNow HTTP 200只代表接收，202代表密钥验证待完成。
- 已收录：需在相应站长平台读取索引数据，不能从提交成功或一次`site:`查询推断完整收录量。

## 已有配置与待办

- 百度验证文件、Google验证文件、IndexNow密钥文件已在中国站发布。
- 2026-09-19部署任务35444861535的IndexNow回执为HTTP 200、16个网址。
- 同次部署日志明确显示`BAIDU_CN_PUSH_TOKEN`缺失，因此没有执行百度API推送。
- 必应站长后台的站点验证、搜索展现和索引数据仍需账号登录核实。IndexNow接收不等于已绑定必应站长后台。
- 360、搜狗的账号验证与资源提交权限尚待核实。不得填入虚构验证码。搜狗公开文档说明Sitemap采用邀请制。

## 操作方式

发布流程在生产验证完成后执行国内搜索检查与IndexNow/百度推送，并保存JSON回执及URL清单。缺少百度凭据会在摘要明确显示`not_configured`，不会冒充提交成功。

独立补交无需重新部署：在GitHub Actions运行 **QilyLean CN search discovery**，选择`none`仅检查，或`indexnow`、`baidu`、`both`。

百度专用Token必须从中国站对应的百度搜索资源平台获取，存入仓库Actions Secret `BAIDU_CN_PUSH_TOKEN`。不要写入网页、仓库文件、PR或聊天。不得以国际站Token代替。配置完成后先选择`baidu`进行一次补交，并检查回执。

百度按单个网址确认回执；遇到实际额度耗尽停止，剩余网址记录于`pending_urls`。待额度恢复后，核对Sitemap顺序没有变化，以回执中的`next_start_index`填写独立流程的`baidu_start_index`，从剩余队列继续。出现传输中断时不会自动重试不确定的提交。重新提交前检查平台状态和剩余额度。

结果文件：`report.json`、`urls.txt`、`summary.md`。报告只保存状态及公开网址，不保存Token。

## 每周复核

在各平台记录索引量、搜索展现、点击、访问关键词，并与上周比较。先跟踪QilyLean/启力精益品牌词，再跟踪标准工时、线平衡、模具管理、工厂布局等具体知识主题。本任务不增加自动定时提交；内容发布时使用原有触发流程。

官方入口：

- [百度站点管理](https://ziyuan.baidu.com/site/index)
- [百度普通收录](https://ziyuan.baidu.com/linksubmit/index)
- [必应站长平台](https://www.bing.com/webmasters/)
- [360站长平台](https://zhanzhang.so.com/)
- [搜狗网站验证](https://zhanzhang.sogou.com/index.php/help/siteVerify)
- [搜狗Sitemap说明](https://zhanzhang.sogou.com/index.php/help/sitemap)
