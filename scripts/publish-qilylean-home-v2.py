#!/usr/bin/env python3
from pathlib import Path
import re

page = Path("capabilities/index.html")
text = page.read_text(encoding="utf-8")

home_block = '''      <article class="module-card capability-digital-tool" id="qilylean-home" data-qily-home-card="v2.3.3-full">
        <div class="capability-digital-visual capability-home-visual">
          <div class="capability-home-screen">
            <div class="capability-home-icon"><img src="/assets/tools/qilylean-unified-app-icon.svg?v=20260824-home-card-restore-v1" alt="QilyLean Home 正式统一桌面图标" width="94" height="94" loading="lazy" decoding="async"></div>
            <h3>QilyLean Home</h3>
            <p>Android 官网全导航通用版 · v2.3.3</p>
            <div class="capability-home-clock">10:28:36</div>
            <div class="capability-home-date">实时 HH:mm:ss · 公历 / 星期 / 年度周次 / 中国农历</div>
            <div class="capability-home-shortcuts" aria-label="QilyLean Home当前主要入口"><span>首页</span><span>履历主线</span><span>能力体系</span><span>改善方法</span><span>代表项目</span><span>信任中心</span><span>项目合作</span><span>知识资产</span><span>全站术语</span><span>友情链接</span><span>Times26001</span><span>系统设置</span><span>应用抽屉</span></div>
          </div>
        </div>
        <div class="capability-digital-content">
          <span class="module-eyebrow">数字工具作品 | 安卓通用品牌桌面</span>
          <h3>QilyLean Home | 官网通用安装包</h3>
          <p><strong>“QilyLean｜启力精益”面向常见安卓手机自主开发的免 Root 品牌桌面。</strong> 按照官网当前 R5 导航顺序，将首页、履历主线、能力体系、改善方法、代表项目、信任中心、项目合作、知识资产完整集中到手机桌面；同时保留全站术语、友情链接等知识重点直达入口，并与 Times26001 数字工具联动。</p>
          <p><strong>桌面与系统能力：</strong>实时显示 HH:mm:ss、公历日期、星期、年度周次与中国农历；提供网络、电池、显示、声音、壁纸、应用、安全、语言与输入、默认桌面等系统入口，以及本机全部应用抽屉。Times26001 已安装时可直接启动，未安装时进入官方说明页。</p>
          <p><strong>安全边界：</strong>免 Root；不读取、不展示手机品牌、型号或设备名称；不解锁 Bootloader、不刷 Recovery，不修改系统分区、基带、IMEI、EFS 或通信底层；用户可随时切回原系统桌面。</p>
          <p class="module-result">当前版本：v2.3.3 | versionCode 11 | Android 16 / API 36 | R5官网最新导航 | 实时时钟 + 农历 | Times26001直达 | 通用设置 + 全部应用抽屉</p>
          <div class="module-actions"><a href="/QilyLean_Home_v2.3.3_API36_INSTALL.apk" download>下载 Android APK</a><a href="/app-support/">安装与技术支持</a><a href="/legal/qilylean-home/privacy/">隐私政策</a><a href="/legal/qilylean-home/terms/">用户协议</a></div>
        </div>
      </article>
'''

pattern = re.compile(
    r'\s*<article class="module-card capability-digital-tool" id="qilylean-home"[\s\S]*?(?=\s*<article class="module-card capability-digital-tool" id="pure-ddz-digital-tool")'
)

matches = pattern.findall(text)
if len(matches) != 1:
    raise SystemExit(f"Unexpected QilyLean Home capability state: {len(matches)} blocks")

text = pattern.sub("\n" + home_block, text, count=1)
page.write_text(text, encoding="utf-8")
print("QilyLean Home capability card synchronized to v2.3.3 full presentation")
