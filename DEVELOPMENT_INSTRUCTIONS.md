# 📘 Hướng Dẫn Phát Triển (Development Instructions) — v7.23.0

## 1. Tổng Quan Kiến Trúc
Từ phiên bản **7.23.0**, **Vạn Kiếp Tu Tiên Tool · Trợ Lý** hoạt động dưới dạng **Game Mod chính thức** của Vạn Kiếp Tu Tiên (đăng ký qua `window.tuTienMods` với `mod.yaml` + `main.js`, đã gỡ bỏ hoàn toàn chế độ Tampermonkey Stealth).

Mã nguồn được chia thành **25 module độc lập** trong thư mục `src/` và biên dịch thành `main.js` thông qua script `build.js` (không phụ thuộc thư viện ngoài).

## 2. Quy Trình Sửa Code & Biên Dịch
1. **Chỉnh sửa mã nguồn trong `src/`**:
   - Giao diện & CSS: `src/styles/ui.css`, `src/ui/shell.js`
   - Cầu nối lõi game & đồng bộ dữ liệu: `src/core/bridge.js`, `src/data/static-data.js`
   - Tính năng Dị Bảo: `src/modules/di-bao.js` (giao diện, quét bản đồ, Pity, truyền tống) và `src/auto/auto-di-bao.js` (vòng lặp Auto Săn Dị Bảo)
   - Hệ thống Tự Động & AI Chiến Đấu: `src/auto/auto-core.js`, `src/auto/combat-ai.js`, `src/auto/auto-tu-luyen.js`, `src/auto/auto-tabs.js`
   - Các tab tính năng khác: `src/modules/*.js`
   - Khởi động Mod & tích hợp `MOD.ui.addPanel`: `src/index.js`
2. **Cập nhật phiên bản & Nhật Ký**:
   - Tăng số `version` trong `package.json` (script `build.js` sẽ tự động đồng bộ sang `TOOL_VER` trong `main.js` và `version` trong `mod.yaml`).
   - Thêm mục mới lên đầu mảng `LOG` trong `src/modules/nhat-ky.js` với `now: true` (và đổi mục cũ thành `now: false`).
3. **Biên dịch & Kiểm tra cú pháp**:
   ```bash
   node build.js
   ```
   Script `build.js` sẽ kiểm tra cú pháp từng file trong `src/` bằng `vm.Script`, ghép nối theo thứ tự chuẩn vào `main.js`, và kiểm tra cú pháp tổng thể của `main.js`.
