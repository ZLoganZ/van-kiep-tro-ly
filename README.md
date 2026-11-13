# ☯ Vạn Kiếp Tu Tiên Tool · Trợ Lý (Game Mod Chính Thức v8.1.0)

> **Tác giả:** LoganZ · Kỹ Sư  
> **Game mục tiêu:** [Vạn Kiếp Tu Tiên](https://van-kiep-tu-tien.vuhaiquan2k1.workers.dev/)  
> **Kiến trúc:** Native Multi-File ES Modules (`main.js` ~120 dòng dùng `import` trực tiếp các module nhỏ trong `./src/...`, đóng gói đa file trong `.zip` giống chuẩn `su_do.zip`, `window.tuTienMods` `apiVersion: 1`)

---

## 📦 1. Cách Cài Đặt Mod Vào Game

### Cách 1: Cài trực tiếp gói `.zip` trong Game (Khuyên dùng)
1. Tải file **`van-kiep-tro-ly-mod.zip`** (gồm `mod.yaml`, `main.js` ~120 dòng và thư mục `src/**/*.js`).
2. Mở game **Vạn Kiếp Tu Tiên**, vào **Cấu hình (⚙️) ➔ Mods ➔ Cài mod (Chọn file `.zip`)**.
3. Chọn file `van-kiep-tro-ly-mod.zip`.
4. Sau khi cài xong, nút nổi **☯** của Trợ Lý sẽ xuất hiện trên màn hình (hoặc mở qua nút **☯ Mod ➔ Vạn Kiếp Tu Tiên Tool · Trợ Lý** của game).

### Cách 2: Chỉnh sửa mã nguồn & đóng gói (Dành cho Developer)
Mã nguồn sử dụng kiến trúc **Native ES Modules đa file** (không nối/bundle thành 1 file `main.js` khổng lồ). File **`main.js`** ở thư mục gốc chỉ dài **122 dòng** và `import` trực tiếp các module con từ `./src/...`:
```bash
# Đồng bộ CSS/version, kiểm tra các ES Module và đóng gói van-kiep-tro-ly-mod.zip
node build.js
```

---

## 🗂️ 2. Cấu Trúc Thư Mục Mã Nguồn

```text
van-kiep-tro-ly/
├── mod.yaml                         # Manifest khai báo Mod chính thức của game (api_version: 1, script: main.js)
├── main.js                          # ⭐ ENTRYPOINT CHÍNH (122 dòng): import trực tiếp các module ./src/... & đăng ký Mod
├── build.js                         # Script đồng bộ CSS/version & đóng gói ZIP đa file ES Module
├── package.json                     # Thông tin gói ("type": "module", version: "7.23.2")
├── README.md                        # Hướng dẫn cài đặt & cấu trúc dự án
├── DEVELOPMENT_INSTRUCTIONS.md      # Giải thích kiến trúc Native Multi-File ES Modules & quy trình phát triển
├── AGENTS.md                        # Quy chuẩn dành cho AI Agent & Developer
└── src/
    ├── styles/
    │   ├── ui.css                   # Nguồn CSS Design System & 4 chủ đề tu tiên
    │   └── ui-css.js                # ES Module xuất chuỗi UI_CSS (đồng bộ tự động từ ui.css)
    ├── ui/
    │   └── shell.js                 # Khung cửa sổ UI, nút nổi ☯, thanh trạng thái Auto & Responsive Fit
    ├── data/
    │   └── static-data.js           # Dữ liệu tĩnh & fallback (Ngự Linh, Thể Chất, Hướng Build)
    ├── core/
    │   ├── utils.js                 # Tiện ích nền tảng (Storage, Lifecycle, fold tiếng Việt, format, debounce)
    │   ├── auto-update.js           # Hệ thống Tự Động Cập Nhật OTA qua GitHub (IndexedDB Hot-Patch & Browser ZIP)
    │   └── bridge.js                # Cầu nối lõi game (tuTien.core), Context Memoization, Bản đồ & Mô phỏng trận
    ├── modules/
    │   ├── kinh-mach-engine.js      # Thuật toán tối ưu Kinh Mạch 4.0 (Multi-Topology, LNS, Qi Cycle)
    │   ├── navigation.js            # Hệ thống Tab, Nhóm Tab, điều hướng giao diện & Assist Controller
    │   ├── di-bao.js                # Hệ thống Dị Bảo (Nghịch Thiên P8), Bảo Lục, Pity 500 năm, Truyền Tống
    │   ├── kinh-mach-tab.js         # Giao diện Tab Nhân Vật & Tab Kinh Mạch
    │   ├── dot-pha-nghe.js          # Giao diện Tab Đột Phá & Tab Nghề/Chợ
    │   ├── ban-do-dia-danh.js       # Giao diện Tab Bản Đồ & Địa Danh, dịch chuyển & truyền tống
    │   ├── ngu-linh.js              # Giao diện Tab Ngự Linh (Linh Thú, Khôi Lỗi, Luyện Thi, Bách Trùng)
    │   ├── huong-build.js           # Giao diện Tab Hướng Build Đột Phá theo từng cảnh giới
    │   ├── tra-cuu.js               # Giao diện Tab Tra Cứu Vật Phẩm, Công Pháp, Yêu Thú, Sự Kiện
    │   ├── biet-doi-late-game.js    # Giao diện Tab Biệt Đội Late Game (Hóa Thần / Độ Kiếp)
    │   ├── luan-hoi-save.js         # Giao diện Tab Luân Hồi & Tab Lưu / Nạp Save (Tẩy Thiên Cơ)
    │   └── nhat-ky.js               # Nhật ký cập nhật phiên bản (Changelog - Lazy Init)
    └── auto/
        ├── auto-core.js             # Hạ tầng Tự Động, cấu hình, phân tích sự kiện Tu Vi & Dị Bảo
        ├── auto-runner.js           # Bộ điều phối vòng lặp Auto chung (auStart/auLoop/auPending/auPick & UI Auto)
        ├── combat-ai.js             # Siêu AI Tác Chiến 3.0 & HUD chiến đấu nổi
        ├── auto-kinh-mach.js        # Auto Xếp Kinh Mạch, Mở Ô & Tẩy Ô tự động
        ├── auto-tu-luyen.js         # Auto Tu Luyện, Đột Phá & Săn Yêu
        ├── auto-di-bao.js           # Auto Săn Dị Bảo (Nghịch Thiên P8) & Cắm Trại Đón Đầu Pity
        ├── auto-buon-ban.js         # Auto Buôn Bán xuyên thành trấn
        ├── auto-reroll.js           # Auto Reroll Khởi Đầu (Linh Căn, Thể Chất, Tiên Lộ)
        └── auto-tabs.js             # Giao diện các Tab điều khiển Tự Động
```

---

## 🚀 3. Cải Tiến Kiến Trúc & Đại Tu Hiệu Năng Ở Phiên Bản 7.23.2
1. **Chuyển đổi hoàn toàn sang Native Multi-File ES Modules (chuẩn `su_do.zip`) & Gom nhóm lại mã nguồn rời rạc**:
   - Loại bỏ hoàn toàn cơ chế nối chuỗi (concatenation) sinh ra file `main.js` 40.700 dòng trước đây.
   - Giữ **`main.js`** ở thư mục gốc chỉ **122 dòng (~3.9 KB)**, sử dụng `import` nguyên bản của ES Module để nạp 26 module con từ `./src/...`, và đóng gói nguyên cây thư mục `src/` vào `van-kiep-tro-ly-mod.zip`.
   - Tách riêng **`src/core/utils.js`** và **`src/auto/auto-runner.js`**, đưa toàn bộ các hàm từng bị cắt nhầm chỗ (`fold`, `tcWord`, `nearSlots`, `danger`, `simFoe`, `auStart`, `auLoop`, `auPending`, `auPick`, `auReadCfg`, `auPaint`, `Assist`) về đúng module chức năng.
2. **Khắc phục triệt để 7 nguyên nhân gây lag game**:
   - **Sửa lỗi nhân bản sâu `ctx()` (`src/core/bridge.js`)**: Kiểm tra bộ nhớ đệm `_cachedCtxBase` trước khi gọi `G().readCtx()`, kết hợp lớp vỏ cô lập nhẹ (shallow isolation wrapper) giúp giảm 95% chi phí `structuredClone` và Garbage Collection trên luồng chính.
   - **Tối ưu quét bản đồ Dị Bảo (`scanMapActiveDiBao`)**: Chỉ gọi `director.placeActivities()` tại những địa danh thực sự có sự kiện Dị Bảo thay vì quét toàn bộ hàng trăm thành trấn trong `run.noiChon`; bổ sung cache 350ms và debounce 350ms cho watcher sự kiện thế giới.
   - **Lưu đệm mô phỏng Hộ Vệ (`simDiBaoGuard`) & Truyền Tống (`checkCanTeleport`)**: Không còn chạy lại 52 trận mô phỏng và khởi tạo lại nhân vật (`taoBenTa`) 13 lần mỗi khi lọc hoặc gõ tìm kiếm trong tab Dị Bảo.
   - **Tối ưu `combatWatcherTick()` & HUD Chiến Đấu**: Thoát sớm O(1) khi ngoài trận, chỉ đồng bộ `localStorage` khi cấu hình đổi, và đối sánh chữ ký trạng thái HUD trước khi cập nhật DOM.
   - **Lưu đệm bản đồ (`nearSlots`, `danger`, `auFindTuViSpots`)**: Triệt tiêu việc tính lại khoảng cách hàng trăm ô bản đồ ở mỗi bước chạy Auto Tu Luyện / Săn Yêu.
   - **Sửa rò rỉ bộ nhớ (Memory Leak) trong `tabAutoKm()` (`src/modules/huong-build.js`)**: Thay `body.addEventListener("click")` bị gắn chồng mỗi lần render bằng `body.onclick`, đồng thời lưu đệm `hbCatalog` và `buildFit`.
   - **Lazy Init cho `NhatKy` & Tối ưu bộ chọn `:not([data-tc])`**: Chỉ dựng 200KB HTML Nhật Ký khi người dùng bấm mở tab Nhật Ký Cập Nhật.

---

## 🔄 4. Cơ Chế Tự Động Cập Nhật Qua GitHub (Auto Update OTA — v8.1.0)
1. **Tự động kiểm tra phiên bản & mã Commit SHA mới nhất**:
   - Ngay khi mở game (và định kỳ mỗi 5–60 phút), mô-đun `src/core/auto-update.js` tự động kiểm tra `package.json`, `mod.yaml` và mã Commit SHA trên nhánh `main` của repo `zloganz/van-kiep-tro-ly`.
2. **Cập nhật trực tiếp vào IndexedDB của Game (Zero-Click Hot-Update)**:
   - Khi có bản cập nhật mới, Mod tự động tải `van-kiep-tro-ly-mod.zip` (hoặc tự kéo toàn bộ mã nguồn ES Modules từ GitHub và đóng gói ZIP ngay trong trình duyệt nếu file zip trên repo chưa kịp build), giải nén và ghi đè trực tiếp vào **IndexedDB Mod Store** của game, xóa cache Service Worker (`/mods/van_kiep_tro_ly/...`), tự động tạo bản **Quick Save** dự phòng rồi tải lại trang.
3. **GitHub Actions Tự Động Đóng Gói (`.github/workflows/auto-build-mod.yml`)**:
   - Mỗi khi push code mới lên nhánh `main`, GitHub Actions sẽ tự động chạy `node build.js` để đồng bộ `version`, `ui-css.js` và đóng gói lại `van-kiep-tro-ly-mod.zip`.
