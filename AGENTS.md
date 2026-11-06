# QUY TẮC PHÁT TRIỂN & ĐÁNH SỐ PHIÊN BẢN (INSTRUCTIONS CHO AI & DEVELOPER)

Tài liệu này là chỉ thị bắt buộc cho mọi AI Agent và lập trình viên khi làm việc trong dự án **Vạn Kiếp Trợ Lý** (`van-kiep-tro-ly`).

---

## 1. QUY TẮC ĐÁNH SỐ PHIÊN BẢN (SEMVER STANDARD)

Mỗi khi có bất kỳ thay đổi nào trong mã nguồn `van_kiep_tro_ly_user.js`, **BẮT BUỘC** phải nâng số phiên bản theo đúng 3 cấp độ sau:

| Loại Thay Đổi               | Cấp Phiên Bản | Quy Tắc Tăng                                                                | Ví Dụ                         |
| --------------------------- | ------------- | --------------------------------------------------------------------------- | ----------------------------- |
| **Enhance / Sửa Bug**       | **PATCH**     | Tăng số cuối (`x.y.Z` $\rightarrow$ `x.y.Z+1`)                              | `7.6.1` $\rightarrow$ `7.6.2` |
| **Tính Năng Mới (Feature)** | **MINOR**     | Tăng số giữa (`x.Y.0` $\rightarrow$ `x.Y+1.0`), reset patch về `0`          | `7.6.2` $\rightarrow$ `7.7.0` |
| **Đại Tu Kiến Trúc Lớn**    | **MAJOR**     | **CHỈ nâng khi NGƯỜI DÙNG YÊU CẦU TRỰC TIẾP**, reset minor & patch về `0.0` | `7.7.0` $\rightarrow$ `8.0.0` |

### Chi Tiết Cụ Thể:

1. **Nâng PATCH (`x.y.Z`):**
   - Áp dụng khi:
     - **Sửa bug (Bug fixes):** Sửa lỗi tính toán, sửa logic combat, sửa lỗi hiển thị UI, xử lý ngoại lệ undefined/null, fix lỗi tương thích API game.
     - **Enhance (Tối ưu & Cải tiến):** Tinh chỉnh logic hiện có, nâng cấp thuật toán, cải thiện hiệu năng (performance), làm đẹp giao diện/CSS có sẵn, bổ sung visual feedback / delay nhịp đánh.
2. **Nâng MINOR (`x.Y.0`):**
   - Áp dụng khi:
     - Bổ sung **chức năng mới hoàn toàn (New Features)**: Thêm Tab mới vào menu, thêm Module/Cơ chế mới (ví dụ: thêm Auto mới, thêm hệ thống gợi ý mới, thêm bảng phân tích mới).
3. **Nâng MAJOR (`X.0.0`):**
   - **TUYỆT ĐỐI KHÔNG TỰ Ý NÂNG MAJOR.**
   - Chỉ nâng khi **User yêu cầu rõ ràng** trong câu lệnh (ví dụ: _"hãy nâng lên bản 8.0.0"_, _"chuyển sang major version mới"_).

---

## 2. QUY TRÌNH BẮT BUỘC KHI CẬP NHẬT PHIÊN BẢN

Mỗi lần nâng version, phải cập nhật đồng bộ tại **tất cả các vị trí sau** trong file `van_kiep_tro_ly_user.js`:

1. **UserScript Header:**
   ```javascript
   // @version      x.y.z
   ```
2. **Tiêu đề Comment đầu file:**
   ```javascript
   /* Vạn Kiếp Tu Tiên Tool · Trợ Lý · Bản x.y.z
   ```
3. **Biến Hằng Số `TOOL_VER`:**
   ```javascript
   var TOOL_VER = "x.y.z";
   ```
4. **Nhật Ký Cập Nhật (`NhatKy` -> `LOG`):**
   - Thêm một object mới lên **ĐẦU mảng `LOG`**:
     ```javascript
     { t: 'Phiên Bản x.y.z · [Tên bản cập nhật ngắn gọn]', d: 'DD/MM/YYYY', now: true, pts: [
         '<b>Tiêu đề điểm 1:</b> Chi tiết mô tả...',
         '<b>Tiêu đề điểm 2:</b> Chi tiết mô tả...'
     ] },
     ```
   - Chuyển mục phiên bản liền trước thành `now: false`.

---

## 3. QUY TRÌNH KIỂM THỬ, COMMIT & PUSH

1. **Kiểm tra cú pháp JavaScript:**
   Luôn chạy lệnh sau trong terminal trước khi commit:

   ```bash
   node -c .\van_kiep_tro_ly_user.js
   ```

   Chỉ tiếp tục khi lệnh trả về mã thoát `0` (không có lỗi cú pháp).

2. **Commit Git:**
   Viết thông điệp commit rõ ràng theo chuẩn:
   - Bug fix / Enhance: `fix(combat): ...` hoặc `feat(ui): enhance ... bump to vx.y.z`
   - Feature mới: `feat: add [tên chức năng] bump to vx.y.0`

3. **Push Git:**
   Chạy `git push origin main` để Tampermonkey của người dùng tự động nhận diện và cập nhật phiên bản mới qua `@updateURL`.

---

## 4. NGUYÊN TẮC BẢO TOÀN KIẾN TRÚC & STEALTH

- **Stealth Mode (Tối quan trọng):** Tuyệt đối KHÔNG đăng ký vào `window.tuTienMods`. Luôn giữ cơ chế chạy độc lập Standalone để game không phát hiện dùng mod, không gắn cờ save game, không khóa lôi đài.
- **Toàn vẹn chú thích:** Giữ nguyên các chú thích code hiện có trừ khi có yêu cầu thay đổi.
