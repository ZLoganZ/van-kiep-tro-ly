/**
 * build.js — Trình đồng bộ & đóng gói Mod Vạn Kiếp Trợ Lý (Native Multi-File ES Modules)
 *
 * Kiến trúc (tương tự chuẩn su_do.zip của game author):
 * - Game Mod Loader hỗ trợ trực tiếp ES Module (`import` / `export`) từ file `main.js`.
 * - Không nối (bundle/concatenate) toàn bộ mã nguồn vào một file `main.js` khổng lồ nữa.
 * - `main.js` ở thư mục gốc chỉ dài ~120 dòng, đóng vai trò Entrypoint và `import` trực tiếp
 *   các module con từ `./src/...`.
 * - Gói cài đặt `van-kiep-tro-ly-mod.zip` chứa `mod.yaml`, `main.js` (nhỏ gọn) và toàn bộ
 *   cây thư mục `src/.../*.js` giữ nguyên đường dẫn tương đối.
 *
 * Chạy:
 *   node build.js          → Đồng bộ CSS/version, kiểm tra ES Module & đóng gói van-kiep-tro-ly-mod.zip
 */

import fs from "fs";
import path from "path";
import zlib from "zlib";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const ROOT = path.dirname(__filename);

const SRC_MODULES = [
  "src/core/utils.js",
  "src/styles/ui-css.js",
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
  "src/auto/auto-runner.js",
  "src/auto/auto-tabs.js",
  "src/modules/luan-hoi-save.js",
  "src/modules/nhat-ky.js"
];

// ── Tạo file ZIP chuẩn PKZIP (Deflate + CRC32) giữ nguyên đường dẫn tương đối ──
const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    table[i] = c >>> 0;
  }
  return table;
})();

function crc32(buf) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    crc = CRC_TABLE[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function createZipArchive(outZipPath, fileEntries) {
  const localParts = [];
  const centralParts = [];
  let offset = 0;

  for (const entry of fileEntries) {
    // Giữ nguyên đường dẫn tương đối chuẩn POSIX (vd: "src/core/utils.js")
    const relName = entry.zipPath.replace(/\\/g, "/");
    const nameBuf = Buffer.from(relName, "utf8");
    const rawData = fs.readFileSync(entry.absPath);
    const compressed = zlib.deflateRawSync(rawData, { level: 9 });
    const crc = crc32(rawData);

    const localHeader = Buffer.alloc(30);
    localHeader.writeUInt32LE(0x04034b50, 0);
    localHeader.writeUInt16LE(20, 4);
    localHeader.writeUInt16LE(0x0800, 6); // UTF-8 filename flag
    localHeader.writeUInt16LE(8, 8);      // Deflate
    localHeader.writeUInt16LE(0, 10);
    localHeader.writeUInt16LE(0, 12);
    localHeader.writeUInt32LE(crc, 14);
    localHeader.writeUInt32LE(compressed.length, 18);
    localHeader.writeUInt32LE(rawData.length, 22);
    localHeader.writeUInt16LE(nameBuf.length, 26);
    localHeader.writeUInt16LE(0, 28);

    localParts.push(localHeader, nameBuf, compressed);

    const centralHeader = Buffer.alloc(46);
    centralHeader.writeUInt32LE(0x02014b50, 0);
    centralHeader.writeUInt16LE(20, 4);
    centralHeader.writeUInt16LE(20, 6);
    centralHeader.writeUInt16LE(0x0800, 8);
    centralHeader.writeUInt16LE(8, 10);
    centralHeader.writeUInt16LE(0, 12);
    centralHeader.writeUInt16LE(0, 14);
    centralHeader.writeUInt32LE(crc, 16);
    centralHeader.writeUInt32LE(compressed.length, 20);
    centralHeader.writeUInt32LE(rawData.length, 24);
    centralHeader.writeUInt16LE(nameBuf.length, 28);
    centralHeader.writeUInt16LE(0, 30);
    centralHeader.writeUInt16LE(0, 32);
    centralHeader.writeUInt16LE(0, 34);
    centralHeader.writeUInt16LE(0, 36);
    centralHeader.writeUInt32LE(0, 38);
    centralHeader.writeUInt32LE(offset, 42);

    centralParts.push(centralHeader, nameBuf);
    offset += localHeader.length + nameBuf.length + compressed.length;
  }

  const centralSize = centralParts.reduce((s, b) => s + b.length, 0);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(0, 4);
  eocd.writeUInt16LE(0, 6);
  eocd.writeUInt16LE(fileEntries.length, 8);
  eocd.writeUInt16LE(fileEntries.length, 10);
  eocd.writeUInt32LE(centralSize, 12);
  eocd.writeUInt32LE(offset, 16);
  eocd.writeUInt16LE(0, 20);

  fs.writeFileSync(outZipPath, Buffer.concat([...localParts, ...centralParts, eocd]));
}

function syncVersionAndCss() {
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, "package.json"), "utf8"));
  const version = pkg.version;

  // 1. Đồng bộ version vào mod.yaml
  const modYamlPath = path.join(ROOT, "mod.yaml");
  if (fs.existsSync(modYamlPath)) {
    let modYaml = fs.readFileSync(modYamlPath, "utf8");
    modYaml = modYaml.replace(/^version:\s*["']?[^"'\r\n]+["']?/m, `version: "${version}"`);
    fs.writeFileSync(modYamlPath, modYaml, "utf8");
  }

  // 2. Đồng bộ version vào src/core/utils.js
  const utilsPath = path.join(ROOT, "src/core/utils.js");
  if (fs.existsSync(utilsPath)) {
    let utilsCode = fs.readFileSync(utilsPath, "utf8");
    utilsCode = utilsCode.replace(
      /export var TOOL_VER\s*=\s*["'][^"']+["'];/,
      `export var TOOL_VER = "${version}";`
    );
    fs.writeFileSync(utilsPath, utilsCode, "utf8");
  }

  // 3. Đồng bộ src/styles/ui.css -> src/styles/ui-css.js
  const cssPath = path.join(ROOT, "src/styles/ui.css");
  const cssJsPath = path.join(ROOT, "src/styles/ui-css.js");
  if (fs.existsSync(cssPath)) {
    const cssText = fs.readFileSync(cssPath, "utf8").trim();
    const cssJsContent = [
      "// ══════════════════════════════════════════════════════════════════════",
      "// MODULE: UI_CSS — Chuỗi CSS giao diện được đồng bộ từ src/styles/ui.css",
      "// ══════════════════════════════════════════════════════════════════════",
      `import { gWin } from "../core/utils.js";`,
      "",
      `export const UI_CSS = ${JSON.stringify(cssText)};`,
      "",
      `Object.assign(gWin, { UI_CSS });`,
      ""
    ].join("\n");
    fs.writeFileSync(cssJsPath, cssJsContent, "utf8");
  }

  return version;
}

function build() {
  const ver = syncVersionAndCss();
  console.log(`🔨 Đồng bộ & kiểm tra kiến trúc Native ES Modules (v${ver})...\n`);

  const mainPath = path.join(ROOT, "main.js");
  if (!fs.existsSync(mainPath)) {
    console.error("❌ Không tìm thấy file main.js tại thư mục gốc!");
    process.exit(1);
  }

  const allFiles = ["main.js", ...SRC_MODULES];
  let totalLines = 0;
  let totalBytes = 0;

  for (const rel of allFiles) {
    const abs = path.join(ROOT, rel);
    if (!fs.existsSync(abs)) {
      console.error(`❌ Thiếu module: ${rel}`);
      process.exit(1);
    }
    const content = fs.readFileSync(abs, "utf8");
    const lines = content.split("\n").length;
    const sizeKB = (Buffer.byteLength(content, "utf8") / 1024).toFixed(1);
    totalLines += lines;
    totalBytes += Buffer.byteLength(content, "utf8");
    console.log(`  ✓ ${rel.padEnd(32)} (${String(lines).padStart(5)} dòng, ${sizeKB.padStart(6)} KB)`);
  }

  const mainLines = fs.readFileSync(mainPath, "utf8").split("\n").length;
  console.log(`\n✅ Hoàn tất kiểm tra ${allFiles.length} file ES Module (${totalLines} dòng, ${(totalBytes / 1024).toFixed(1)} KB).`);
  console.log(`   File main.js gốc chỉ dài ${mainLines} dòng (import trực tiếp từ ./src/...).`);

  if (!process.argv.includes("--check")) {
    const zipName = "van-kiep-tro-ly-mod.zip";
    const zipPath = path.join(ROOT, zipName);
    const entries = [
      { zipPath: "mod.yaml", absPath: path.join(ROOT, "mod.yaml") },
      { zipPath: "main.js", absPath: mainPath },
      ...SRC_MODULES.map((rel) => ({ zipPath: rel, absPath: path.join(ROOT, rel) }))
    ];
    createZipArchive(zipPath, entries);
    const zipSizeKB = (fs.statSync(zipPath).size / 1024).toFixed(1);
    console.log(`📦 Đã đóng gói Mod đa file ES Module: ${zipName} (${entries.length} files, ${zipSizeKB} KB)`);
  }
}

build();
