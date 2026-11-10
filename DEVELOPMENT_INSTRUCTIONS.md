# 📘 Hướng Dẫn Phát Triển (Development Instructions) — v7.23.2

## 1. Kiến Trúc Native Multi-File ES Modules (Chuẩn Mod `su_do.zip`)

### Cơ chế nạp Mod đa file của Game:
Trình nạp Mod chính thức của game **Vạn Kiếp Tu Tiên** (`mod.yaml` với `api_version: 1` và `script: main.js`) giải nén toàn bộ các file `.js` trong gói `.zip` và hỗ trợ trực tiếp cú pháp **ES Modules (`import` / `export`)** giữa các file theo đường dẫn tương đối (tương tự như cách `su_do.zip` dùng `main.js` import từ `./lib/...`).

Nhờ vậy, dự án **không cần nối (concatenate) toàn bộ code vào một file `main.js` 40.000 dòng nữa**:
1. **File `main.js` ở thư mục gốc chỉ dài 122 dòng (~3.9 KB)**:
   - Dùng `import` trực tiếp các module con từ `./src/core/...`, `./src/ui/...`, `./src/modules/...`, `./src/auto/...`.
   - Khởi tạo giao diện khi `ready(tt, mod)` được gọi, gắn `mod.ui.addPanel` và đăng ký vào `window.tuTienMods`.
2. **Phân tách rõ trách nhiệm từng module trong `src/` (26 modules)**:
   - `src/core/utils.js`: Biến ngữ cảnh (`TT`, `MOD`, `setGameContext`), tiện ích nền tảng (`StorageManager`, `TabLifecycle`, chuẩn hóa chuỗi tiếng Việt `fold`, định dạng số `pct`/`num`/`yrs`, `debounce`, `yieldToMain`).
   - `src/core/bridge.js`: Cầu nối `tuTien.core`, quản lý `ctx()` / `ctxLite()` (có bộ nhớ đệm chống nhân bản sâu `structuredClone`), hàm bản đồ (`nearSlots`, `danger`, `withPlace`) và mô phỏng trận (`fight`, `simFoe`, `benchEnemies`).
   - `src/auto/auto-runner.js`: Bộ điều phối vòng lặp Auto chung (`auStart`, `auStop`, `auLoop`, `auPending`, `auPick`) và đồng bộ cấu hình/UI Auto (`auReadCfg`, `auPaint`, `auStatusHtml`), tách biệt hoàn toàn khỏi logic AI đánh trận (`combat-ai.js`) và logic buôn bán (`auto-buon-ban.js`).
   - Mỗi module trong `src/` vừa `export` tường minh các hàm/hằng số của mình, vừa đồng bộ qua `gWin` để các module gọi chéo nhau mà không bao giờ bị lỗi phụ thuộc vòng (circular dependency).
3. **Trình đóng gói `build.js`**:
   - Đồng bộ `version` từ `package.json` vào `mod.yaml` và `src/core/utils.js`.
   - Đồng bộ `src/styles/ui.css` sang `src/styles/ui-css.js` (`export const UI_CSS`).
   - Đóng gói `van-kiep-tro-ly-mod.zip` chứa `mod.yaml`, `main.js` (122 dòng) và toàn bộ `src/**/*.js` với đường dẫn tương đối được giữ nguyên.

---

## 2. Quy Trình Sửa Code & Đóng Gói
1. **Chỉnh sửa mã nguồn trực tiếp trong `main.js` hoặc `src/`**:
   - Entrypoint khởi tạo Mod: `main.js`
   - Giao diện & CSS: `src/styles/ui.css`, `src/ui/shell.js`
   - Tiện ích & Cầu nối lõi game: `src/core/utils.js`, `src/core/bridge.js`, `src/data/static-data.js`
   - Tính năng Dị Bảo: `src/modules/di-bao.js` và `src/auto/auto-di-bao.js`
   - Hệ thống Tự Động & AI Chiến Đấu: `src/auto/auto-core.js`, `src/auto/auto-runner.js`, `src/auto/combat-ai.js`, `src/auto/auto-tu-luyen.js`, `src/auto/auto-tabs.js`
   - Các tab tính năng khác: `src/modules/*.js`
2. **Cập nhật phiên bản & Nhật Ký**:
   - Tăng số `version` trong `package.json`.
   - Thêm mục mới lên đầu mảng `LOG` trong `src/modules/nhat-ky.js` với `now: true` (và đổi mục cũ thành `now: false`).
3. **Đồng bộ & Đóng gói `.zip`**:
   ```bash
   node build.js           # Đồng bộ CSS/version và tạo gói van-kiep-tro-ly-mod.zip đa file
   node build.js --check   # Chỉ kiểm tra danh sách module và đồng bộ version/CSS
   ```
