# Vạn Kiếp Trợ Lý (Tool Mod Vạn Kiếp Tu Tiên)

Script hỗ trợ và tự động hóa cho webgame **Vạn Kiếp Tu Tiên** (`https://van-kiep-tu-tien.vuhaiquan2k1.workers.dev/`).

## 📁 Cấu trúc thư mục

* **`van_kiep_tro_ly_user.js`**: Userscript chính chạy trên Tampermonkey (hoặc đóng gói mod game).
* **`DEVELOPMENT_INSTRUCTIONS.md`**: **👉 Tài liệu hướng dẫn phát triển, kiến trúc, bản đồ code và quy trình mở rộng tính năng.**
* **`vi_du/`**: Thư viện tài liệu mẫu & SDK chính thức tải từ web game (thư mục này **sẽ được tải lại từ web game và thay đổi khi game cập nhật**, không sửa trực tiếp vào đây mà dùng làm tài liệu đối soát API):
  * `tai-lieu-api.md`: Tra cứu chi tiết API, sự kiện, hook và bảng chuyển đổi tên hàm từ bản cũ sang `tuTien.core`.
  * `surface.txt`: Toàn bộ danh mục 176 methods của `tuTien.game` và các modules của `tuTien.core`.
  * `tu-tien.d.ts`: Định nghĩa kiểu TypeScript đầy đủ của engine game.
  * `balance.md`: Danh mục hằng số cân bằng trong game.
  * `huong-dan.md`: Hướng dẫn cơ bản đóng gói và tạo mod.

## 🚀 Bắt đầu nhanh

* Cài đặt Userscript vào Tampermonkey từ file `van_kiep_tro_ly_user.js`.
* Khi vào game, bấm nút nổi Trợ Lý hoặc vào **Cấu hình → Mods** để mở giao diện.
* Chi tiết phát triển xem file [`DEVELOPMENT_INSTRUCTIONS.md`](DEVELOPMENT_INSTRUCTIONS.md).

