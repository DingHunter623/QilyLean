#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{
    menu::{Menu, MenuItem},
    webview::{NewWindowResponse, WebviewWindowBuilder},
    Manager, WebviewUrl,
};

const HOME: &str = "https://qilylean.cn/";

fn is_china_site(url: &url::Url) -> bool {
    url.scheme() == "https"
        && matches!(url.host_str(), Some("qilylean.cn") | Some("www.qilylean.cn"))
}

fn may_open_external(url: &url::Url) -> bool {
    matches!(url.scheme(), "https" | "mailto" | "tel")
}

fn open_external(url: &url::Url) {
    if may_open_external(url) {
        let _ = open::that(url.as_str());
    }
}

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            let home = MenuItem::with_id(app, "home", "返回中国站首页", true, None::<&str>)?;
            let back = MenuItem::with_id(app, "back", "后退", true, Some("Alt+Left"))?;
            let forward = MenuItem::with_id(app, "forward", "前进", true, Some("Alt+Right"))?;
            let reload = MenuItem::with_id(
                app,
                "reload",
                "刷新页面 / 网络恢复后重试",
                true,
                Some("CmdOrCtrl+R"),
            )?;
            let browser = MenuItem::with_id(
                app,
                "browser",
                "在系统浏览器打开中国站",
                true,
                None::<&str>,
            )?;

            app.set_menu(Menu::with_items(
                app,
                &[&home, &back, &forward, &reload, &browser],
            )?)?;

            WebviewWindowBuilder::new(
                app,
                "main",
                WebviewUrl::External(HOME.parse().expect("valid fixed HTTPS URL")),
            )
            .title("QilyLean｜启力精益 · 中国站")
            .inner_size(1280.0, 850.0)
            .min_inner_size(960.0, 640.0)
            .center()
            .on_navigation(|url| {
                if is_china_site(url) {
                    true
                } else {
                    open_external(url);
                    false
                }
            })
            .on_new_window(|url, _features| {
                // Target=_blank never becomes an ungoverned second application window.
                open_external(&url);
                NewWindowResponse::Deny
            })
            .build()?;

            Ok(())
        })
        .on_menu_event(|app, event| {
            if let Some(window) = app.get_webview_window("main") {
                if event.id() == "home" {
                    let _ = window.navigate(HOME.parse().expect("valid fixed HTTPS URL"));
                } else if event.id() == "back" {
                    let _ = window.go_back();
                } else if event.id() == "forward" {
                    let _ = window.go_forward();
                } else if event.id() == "reload" {
                    let _ = window.reload();
                } else if event.id() == "browser" {
                    let _ = open::that(HOME);
                }
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running QilyLean China desktop application");
}
