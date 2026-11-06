# Vạn Kiếp Trợ Lý (Tool Mod Vạn Kiếp Tu Tiên)

Script hỗ trợ và tự động hóa cho webgame **Vạn Kiếp Tu Tiên** (`https://van-kiep-tu-tien.vuhaiquan2k1.workers.dev/`).

## 📁 Cấu trúc thư mục

- **`van_kiep_tro_ly_user.js`**: Userscript chính chạy trên Tampermonkey (hoặc đóng gói mod game).
- **`DEVELOPMENT_INSTRUCTIONS.md`**: **👉 Tài liệu hướng dẫn phát triển, kiến trúc, bản đồ code và quy trình mở rộng tính năng.**
- **`vi_du/`**: Thư viện tài liệu mẫu & SDK chính thức tải từ web game (thư mục này **sẽ được tải lại từ web game và thay đổi khi game cập nhật**, không sửa trực tiếp vào đây mà dùng làm tài liệu đối soát API):
  - `tai-lieu-api.md`: Tra cứu chi tiết API, sự kiện, hook và bảng chuyển đổi tên hàm từ bản cũ sang `tuTien.core`.
  - `surface.txt`: Toàn bộ danh mục 176 methods của `tuTien.game` và các modules của `tuTien.core`.
  - `tu-tien.d.ts`: Định nghĩa kiểu TypeScript đầy đủ của engine game.
  - `balance.md`: Danh mục hằng số cân bằng trong game.
  - `huong-dan.md`: Hướng dẫn cơ bản đóng gói và tạo mod.

## 🚀 Cài Đặt & Tự Động Cập Nhật (Tampermonkey)

### Cách 1: Cài trực tiếp từ GitHub để tự động update

1. Mở link cài đặt trực tiếp trên trình duyệt (đã cài sẵn tiện ích Tampermonkey):
   👉 **[Cài đặt Vạn Kiếp Trợ Lý (Bản mới nhất)](https://raw.githubusercontent.com/ZLoganZ/van-kiep-tro-ly/main/van_kiep_tro_ly_user.js)**
2. Tampermonkey sẽ tự động mở màn hình xác nhận, bấm **Install (Cài đặt)** hoặc **Update (Cập nhật)**.
3. **Cơ chế tự động update:** Mỗi khi tác giả commit và push bản mới lên GitHub (có tăng `@version`), Tampermonkey sẽ tự động phát hiện và cập nhật bản mới nhất cho bạn (hoặc bạn có thể bấm _Check for updates_ trong Tampermonkey bất cứ lúc nào).

### Cách 2: Cài thủ công từ file mã nguồn

- Sao chép toàn bộ nội dung file [`van_kiep_tro_ly_user.js`](van_kiep_tro_ly_user.js) và dán vào script mới trong Tampermonkey.

---

## 🎮 Hướng Dẫn Sử Dụng

- Khi vào web game, bấm nút nổi Trợ Lý ở góc màn hình để mở giao diện.
- Truy cập tab **Tra Cứu → Dị Bảo** để kích hoạt Radar quét Dị Bảo, sự kiện xuất thế và tính toán cắm trại đón đầu.
- Quản lý Lưu & Nạp Save tại tab **Luân Hồi → Lưu & Nạp Save** (hoặc nút bấm nhanh ở **Nhân Vật → Tổng Quan**) để sao lưu tiến trình và miễn nhiễm hoàn toàn với cơ chế bắt lỗi của Thiên Đạo.
- Chi tiết phát triển xem file [`DEVELOPMENT_INSTRUCTIONS.md`](DEVELOPMENT_INSTRUCTIONS.md).
