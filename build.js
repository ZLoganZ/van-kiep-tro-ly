#!/usr/bin/env node
/**
 * Trình biên dịch & đóng gói Mod Vạn Kiếp Tu Tiên Tool · Trợ Lý
 * Ghép các module trong thư mục src/ thành file main.js duy nhất chuẩn Game Mod (window.tuTienMods).
 * Không cần cài đặt thư viện bên thứ ba (Zero-dependency Node.js script).
 *
 * Cách dùng:
 *   node build.js          -> Biên dịch src/* thành main.js và kiểm tra cú pháp
 *   node build.js --check  -> Kiểm tra cú pháp từng file trong src/ và main.js
 */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = __dirname;
const PKG = JSON.parse(fs.readFileSync(path.join(ROOT, "package.json"), "utf8"));
const VERSION = PKG.version || "7.23.0";

// Thứ tự nạp các module trong src/
const JS_MODULES = [
  "src/ui/shell.js",
  "src/data/static-data.js",
  "src/core/bridge.js",
  "src/modules/kinh-mach-engine.js",
  "src/modules/navigation.js",
  "src/modules/di-bao.js",
  "src/modules/kinh-mach-tab.js",
  "src/modules/dot-pha-nghe.js",
  "src/modules/ban-do-dia-danh.js",
  "src/modules/ngu-linh.js",
  "src/modules/huong-build.js",
  "src/modules/tra-cuu.js",
  "src/auto/auto-core.js",
  "src/auto/combat-ai.js",
  "src/auto/auto-kinh-mach.js",
  "src/auto/auto-tu-luyen.js",
  "src/auto/auto-di-bao.js",
  "src/auto/auto-buon-ban.js",
  "src/auto/auto-reroll.js",
  "src/auto/auto-tabs.js",
  "src/modules/biet-doi-late-game.js",
  "src/modules/luan-hoi-save.js",
  "src/modules/nhat-ky.js",
  "src/index.js",
];

function checkSyntax(code, filename) {
  try {
    new vm.Script(code, { filename });
    return true;
  } catch (err) {
    console.error(`[LỖI CÚ PHÁP] tại ${filename}:`);
    console.error(err);
    process.exit(1);
  }
}

function build() {
  const cssPath = path.join(ROOT, "src/styles/ui.css");
  if (!fs.existsSync(cssPath)) {
    throw new Error("Không tìm thấy file CSS: " + cssPath);
  }
  const rawCss = fs.readFileSync(cssPath, "utf8");
  const escapedCss = rawCss.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${");

  const chunks = [];
  for (const relPath of JS_MODULES) {
    const fullPath = path.join(ROOT, relPath);
    if (!fs.existsSync(fullPath)) {
      throw new Error("Không tìm thấy module: " + relPath);
    }
    const content = fs.readFileSync(fullPath, "utf8");
    checkSyntax(content, relPath);
    chunks.push(
      `/* ══════════════════════════════════════════════════════════════════════════\n` +
      ` * FILE: ${relPath}\n` +
      ` * ══════════════════════════════════════════════════════════════════════════ */\n` +
      content.trim()
    );
  }

  const banner = `/* ══════════════════════════════════════════════════════════════════════════
 * Vạn Kiếp Tu Tiên Tool · Trợ Lý · Bản Mod Chính Thức v${VERSION}
 * Tác giả: LoganZ · Kỹ Sư
 * Kiến trúc: Multi-file Modular (Biên dịch tự động từ thư mục src/ qua build.js)
 * Đăng ký trực tiếp qua window.tuTienMods (apiVersion: 1) · Đã loại bỏ Stealth Mode
 * ══════════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";
  var gWin = typeof window !== "undefined" ? window : globalThis;
  var TOOL_VER = ${JSON.stringify(VERSION)};
  var _modBooted = false;

  function runTroLy(TT, MOD) {
    if (_modBooted && gWin.__vkxMerged) {
      try {
        gWin.__vkxMerged.open();
      } catch (e) {}
      return;
    }
    _modBooted = true;
    (function (TT, MOD) {
      if (gWin.__vkxMerged) {
        try {
          gWin.__vkxMerged.open();
        } catch (e) {}
        return;
      }
      var UI_CSS = \`\n${escapedCss}\n\`;

${chunks.join("\n\n")}
    })(TT, MOD);
  }

  // Đăng ký Mod chính thức vào hệ thống Mod của Vạn Kiếp Tu Tiên (window.tuTienMods)
  (gWin.tuTienMods ??= []).push({
    id: "van_kiep_tro_ly",
    name: "Vạn Kiếp Tu Tiên Tool · Trợ Lý",
    version: TOOL_VER,
    author: "LoganZ · Kỹ Sư",
    apiVersion: 1,
    ready: function (tt, mod) {
      runTroLy(tt || gWin.tuTien, mod);
    },
  });
})();
`;

  const outPath = path.join(ROOT, "main.js");
  checkSyntax(banner, "main.js");
  fs.writeFileSync(outPath, banner, "utf8");

  // Đồng bộ version trong mod.yaml
  const yamlPath = path.join(ROOT, "mod.yaml");
  if (fs.existsSync(yamlPath)) {
    let yml = fs.readFileSync(yamlPath, "utf8");
    yml = yml.replace(/^version:\s*".*"/m, `version: "${VERSION}"`);
    fs.writeFileSync(yamlPath, yml, "utf8");
  }

  const lines = banner.split("\n").length;
  console.log(
    `✅ Đã biên dịch thành công ${JS_MODULES.length} modules + CSS -> main.js (v${VERSION}, ${lines} dòng).`
  );
}

build();
