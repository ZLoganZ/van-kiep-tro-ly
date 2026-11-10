# ☯ Vạn Kiếp Tu Tiên Tool · Trợ Lý (Game Mod Chính Thức v7.23.0)

> **Tác giả:** LoganZ · Kỹ Sư  
> **Game mục tiêu:** [Vạn Kiếp Tu Tiên](https://van-kiep-tu-tien.vuhaiquan2k1.workers.dev/)  
> **Kiến trúc:** Multi-file Modular (`src/*` ➔ `main.js` + `mod.yaml`, đăng ký chuẩn `window.tuTienMods` `apiVersion: 1`)

---

## 📦 1. Cách Cài Đặt Mod Vào Game

### Cách 1: Cài trực tiếp gói `.zip` trong Game (Khuyên dùng)
1. Tải file **`van-kiep-tro-ly-mod.zip`** (chứa `mod.yaml` và `main.js`).
2. Mở game **Vạn Kiếp Tu Tiên**, vào **Cấu hình (⚙️) ➔ Mods ➔ Cài mod (Chọn file `.zip`)**.
3. Chọn file `van-kiep-tro-ly-mod.zip`.
4. Sau khi cài xong, nút nổi **☯** của Trợ Lý sẽ xuất hiện trên màn hình (hoặc mở qua nút **☯ Mod ➔ Vạn Kiếp Tu Tiên Tool · Trợ Lý** của game).

### Cách 2: Chỉnh sửa mã nguồn & tự đóng gói (Dành cho Developer)
Dự án đã được tách thành các module rõ ràng trong thư mục `src/` để dễ dàng bảo trì:
```bash
# 1. Biên dịch toàn bộ module trong src/ thành main.js và kiểm tra cú pháp
node build.js

# 2. Đóng gói lại file cài đặt mod (.zip)
zip -r van-kiep-tro-ly-mod.zip mod.yaml main.js
```

---

## 🗂️ 2. Cấu Trúc Thư Mục Mã Nguồn (`src/`)

```text
van-kiep-tro-ly/
├── mod.yaml                         # Manifest khai báo Mod chính thức của game (apiVersion: 1)
├── main.js                          # File Mod đã biên dịch sẵn từ src/ để game nạp trực tiếp
├── build.js                         # Script Node.js ghép nối & kiểm tra cú pháp (Zero-dependency)
├── package.json                     # Thông tin gói & script build
├── README.md                        # Hướng dẫn cài đặt & cấu trúc dự án
├── DEVELOPMENT_INSTRUCTIONS.md      # Tài liệu kiến trúc & quy trình phát triển
├── AGENTS.md                        # Quy chuẩn dành cho AI Agent & Developer
└── src/
    ├── index.js                     # Entrypoint khởi động Mod, gắn MOD.ui.addPanel & window.tuTienMods
    ├── styles/
    │   └── ui.css                   # Toàn bộ CSS Design System & 4 chủ đề tu tiên
    ├── ui/
    │   └── shell.js                 # Khung cửa sổ UI, nút nổi ☯, thanh trạng thái Auto & Responsive Fit
    ├── data/
    │   └── static-data.js           # Dữ liệu tĩnh & fallback (Ngự Linh, Thể Chất, Hướng Build)
    ├── core/
    │   └── bridge.js                # Cầu nối lõi game (tuTien.core), đồng bộ dữ liệu động & giả lập trận
    ├── modules/
    │   ├── kinh-mach-engine.js      # Thuật toán tối ưu Kinh Mạch 4.0 (Multi-Topology, LNS, Qi Cycle)
    │   ├── navigation.js            # Hệ thống Tab, Nhóm Tab & điều hướng giao diện
    │   ├── di-bao.js                # Hệ thống Dị Bảo (Nghịch Thiên P8), Bảo Lục, Pity 500 năm, Truyền Tống
    │   ├── kinh-mach-tab.js         # Giao diện Tab Nhân Vật & Tab Kinh Mạch
    │   ├── dot-pha-nghe.js          # Giao diện Tab Đột Phá & Tab Nghề/Chợ
    │   ├── ban-do-dia-danh.js       # Giao diện Tab Bản Đồ & Địa Danh, dịch chuyển & truyền tống
    │   ├── ngu-linh.js              # Giao diện Tab Ngự Linh (Linh Thú, Khôi Lỗi, Luyện Thi, Bách Trùng)
    │   ├── huong-build.js           # Giao diện Tab Hướng Build Đột Phá theo từng cảnh giới
    │   ├── tra-cuu.js               # Giao diện Tab Tra Cứu Vật Phẩm, Công Pháp, Yêu Thú, Sự Kiện
    │   ├── biet-doi-late-game.js    # Giao diện Tab Biệt Đội Late Game (Hóa Thần / Độ Kiếp)
    │   ├── luan-hoi-save.js         # Giao diện Tab Luân Hồi & Tab Lưu / Nạp Save (Tẩy Thiên Cơ)
    │   └── nhat-ky.js               # Nhật ký cập nhật phiên bản (Changelog)
    └── auto/
        ├── auto-core.js             # Hạ tầng Tự Động, cấu hình, phân tích sự kiện Tu Vi & Dị Bảo
        ├── combat-ai.js             # Siêu AI Tác Chiến 3.0, HUD chiến đấu nổi, xử lý trận & sự kiện
        ├── auto-kinh-mach.js        # Auto Xếp Kinh Mạch, Mở Ô & Tẩy Ô tự động
        ├── auto-tu-luyen.js         # Auto Tu Luyện, Đột Phá & Săn Yêu
        ├── auto-di-bao.js           # Auto Săn Dị Bảo (Nghịch Thiên P8) & Cắm Trại Đón Đầu Pity
        ├── auto-buon-ban.js         # Auto Buôn Bán xuyên thành trấn
        ├── auto-reroll.js           # Auto Reroll Khởi Đầu (Linh Căn, Thể Chất, Tiên Lộ)
        └── auto-tabs.js             # Giao diện các Tab điều khiển Tự Động
```

---

## 🛠️ 3. Các Sửa Lỗi Trọng Tâm Ở Phiên Bản 7.23.0
1. **Chuyển đổi sang Game Mod chính thức & bỏ Stealth Mode**: Đăng ký trực tiếp qua `window.tuTienMods` (`apiVersion: 1`) và `MOD.ui.addPanel`, loại bỏ hoàn toàn cơ chế ẩn Tampermonkey.
2. **Tái cấu trúc đa file (`src/*`)**: Tách file đơn nguyên hơn 40.700 dòng thành 25 file theo đúng miền chức năng kèm script `build.js`.
3. **Sửa triệt để lỗi Dị Bảo & Auto Săn Dị Bảo**:
   - **Tách biệt Dị Bảo trong kiếp (`sc.relics`) và Bảo Lục Luân Hồi (`sc.metaRelics`)**: Khắc phục lỗi từ Kiếp thứ 2 trở đi bị nhận nhầm đã sở hữu toàn bộ Dị Bảo từng ghi vào Bảo Lục ở kiếp trước.
   - **Sửa lỗi Truyền Tống (`checkCanTeleport` & `smartTeleportTo`)**: Kiểm tra chính xác trạng thái `!o.blocked` của Trận Truyền Tống, tự động dùng **Truyền Tống Phù** khi đứng ở hoang dã.
   - **Sửa lỗi Giả Lập Hộ Vệ (`simDiBaoGuard`) & Kiểm tra Cảnh Giới (`ev.gate`)**: Đồng bộ `winRate` (0–100%), kiểm tra cảnh giới tối thiểu và khả năng cắn đan bù chỉ số khảo nghiệm.
   - **Sửa lỗi kẹt vòng lặp trong `auSdbStep`, `auPending` và `auPick`**: Chống lặp vô hạn khi vào danh thắng `hoang:*`, chống lặp bay đi bay lại (ping-pong) khi điểm cắm trại không bế quan được, tự đóng trạng thái chờ `be_quan` sau khi nhập định, và ưu tiên chọn nhánh đoạt Dị Bảo bằng `findBestDiBaoChoice`.
