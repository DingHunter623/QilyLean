import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const config = JSON.parse(readFileSync(resolve(root, "src-tauri/tauri.conf.json"), "utf8"));
const capabilities = JSON.parse(readFileSync(resolve(root, "src-tauri/capabilities/desktop.json"), "utf8"));
const main = readFileSync(resolve(root, "src-tauri/src/main.rs"), "utf8");
const logo = readFileSync(resolve(root, "../../assets/tools/qilylean-unified-app-icon.svg"), "utf8");

assert.equal(config.build.frontendDist, "https://qilylean.cn/");
assert.equal(config.build.devUrl, "https://qilylean.cn/");
assert.deepEqual(config.app.windows, [], "Only Rust-governed webview windows allowed");
assert.equal(config.app.security.csp, null);
assert.ok(!capabilities.remote, "Remote website must not receive native IPC capability");
assert.ok(main.includes('Some("qilylean.cn")') && main.includes('Some("www.qilylean.cn")'));
assert.ok(main.includes("NewWindowResponse::Deny"));
assert.ok(main.includes("window.reload()"), "Network retry menu is required");
assert.ok(logo.includes('fill="#126478"') && logo.includes('fill="#081e20"') && logo.includes('fill="#f03a39"'));
console.log("QilyLean CN desktop static checks: PASS (website source unchanged)");
