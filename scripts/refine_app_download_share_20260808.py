from pathlib import Path

# 2026-08-08 corrected rule: download is primary; QR/share are auxiliary.
# This validator intentionally does not rewrite download buttons.

checks = {
    "APK exists": Path("Times26001-Android-v1.1.4-IE-Stopwatch.apk").is_file(),
    "Times page has direct download": "download>立即下载 APK</a>" in Path("tools/times26001/index.html").read_text(encoding="utf-8"),
    "Capabilities has direct download": "download>下载 Android APK</a>" in Path("capabilities/index.html").read_text(encoding="utf-8"),
    "Share logic points to download section": "tools/times26001/#android-download" in Path("app-download-share-v1.js").read_text(encoding="utf-8"),
    "QR dialog has direct APK download": "qilyAppShareDownload" in Path("app-download-share-v1.js").read_text(encoding="utf-8"),
}
failed = [name for name, ok in checks.items() if not ok]
if failed:
    raise SystemExit("validation failed: " + ", ".join(failed))
print("download-first APP flow validated")
