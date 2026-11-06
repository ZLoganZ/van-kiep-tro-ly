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

---

## 5. CẨM NANG ĐIỀU TRA & THÍCH ỨNG KHI GAME CÓ BẢN UPDATE MỚI

Khi người dùng báo *"game mới có update, check kỹ lại source xem"* hoặc khi phát hiện game deploy bản build mới, AI Agent và lập trình viên **BẮT BUỘC** thực hiện quy trình điều tra 5 bước sau để biết chính xác game đã đổi gì và tìm kiếm ở đâu:

### Bước 1: Lấy Bundle JS Mới Nhất Của Game
1. Quét trang chủ để lấy tên file bundle mới:
   ```bash
   curl.exe -s https://van-kiep-tu-tien.vuhaiquan2k1.workers.dev/ | Select-String -Pattern "index-.*\.js"
   ```
2. Tải bundle mới về thư mục `scratch/latest_game_bundle.js`:
   ```bash
   curl.exe -s -o .\scratch\latest_game_bundle.js https://van-kiep-tu-tien.vuhaiquan2k1.workers.dev/assets/index-[hash].js
   ```
3. Kiểm tra mã commit build của game trong bundle:
   Tìm `version:"[hash]"` (ví dụ `version:"57bad5c99c0c8e9e"` so với build cũ `version:"6c44dc3ea63bb7dc"`).

### Bước 2: Tải & So Sánh Gói Mod Template (`tu-tien.d.ts`) - **CHÌA KHÓA VÀNG**
Game luôn phục vụ gói mod mẫu chính thức tại đường dẫn cố định:
- **URL tải template:** `https://van-kiep-tu-tien.vuhaiquan2k1.workers.dev/mod/template.zip`
- **Cách thực hiện:**
  1. Tải về:
     ```bash
     curl.exe -s -o .\scratch\latest_template.zip https://van-kiep-tu-tien.vuhaiquan2k1.workers.dev/mod/template.zip
     Expand-Archive -Path .\scratch\latest_template.zip -DestinationPath .\scratch\latest_template_extracted -Force
     ```
  2. So sánh file `vi_du/tu-tien.d.ts` mới vs cũ:
     - Đây là **tài liệu quan trọng nhất**: nhà phát triển game ghi chú toàn bộ thay đổi hệ thống, công thức mới, hằng số cân bằng mới, hàm API mới (kèm giải thích chi tiết trong docstring, ví dụ: tăng trần cấp văn Bản Mệnh lên 5, cơ chế Dị Văn, `tierSlack`, v.v.).
  3. Đọc các file hướng dẫn kèm theo:
     - `vi_du/doi-api.md`: Nhật ký đổi API của game (`apiVersion`, các hàm game mở riêng cho Tool Trợ Lý).
     - `vi_du/balance.md`: Danh mục hằng số cân bằng toàn bộ game.
     - `vi_du/tai-lieu-api.md` & `surface.txt`: Mặt mở API của `window.tuTien` và `window.tuTien.core`.

### Bước 3: Tải Gói Dữ Liệu Nội Dung Gốc (`content-[hash].json`)
1. Tìm tên file content JSON trong bundle JS:
   Tìm chuỗi `new URL("content-[hash].json", import.meta.url).href`.
2. Tải về file `scratch/new_content.json`:
   ```bash
   curl.exe -s -o .\scratch\new_content.json https://van-kiep-tu-tien.vuhaiquan2k1.workers.dev/assets/content-[hash].json
   ```
3. File này chứa **100% dữ liệu YAML gốc của game**:
   - `/content/encounters/*.yaml`: Toàn bộ sự kiện, Dị Bảo, bí cảnh, tỷ lệ ra bảo vật, điều kiện kích hoạt.
   - `/content/items/**/*.yaml`: Toàn bộ pháp khí, đan dược, phù lục, trận bàn, trận văn, công pháp mới.
   - `/content/enemies/**/*.yaml`: Quái, Boss, chỉ số, chiêu thức.
   - `/content/npc/**/*.yaml`: Nhân vật, sư phụ, thế lực.

### Bước 4: Chạy Script So Sánh Sai Khác (Diffing)
Viết script Node.js trong `scratch/` để trích xuất nhanh:
1. **Chuỗi tiếng Việt mới xuất hiện:** Quét chuỗi có dấu tiếng Việt trong bundle mới mà bundle cũ không có $\rightarrow$ biết ngay tên các tính năng, thông báo, cơ chế mới vừa thêm.
2. **Danh mục vật phẩm / ID mới:** Quét regex `"(phap_khi|dan_duoc|phu_luc|cong_phap|tran_ban|tran_van|ban_menh)/[a-z0-9_.-]+"` để tìm tất cả item/rune mới.
3. **Mô-đun lõi trong `window.tuTien.core`:** Kiểm tra danh sách export xem có module nào mới hoặc bị đổi tên không (đảm bảo Tool không bị crash).

### Bước 5: Thích Ứng Tool & Nâng Phiên Bản (SEMVER)
1. Cập nhật các enum, bộ lọc, từ điển loại vật phẩm (`LOAI_VI`, `GLUT_LOAI`, scanner chợ...), hệ thống Bản Mệnh (`bmRunes`), kinh mạch, luyện chế theo dữ liệu mới.
2. Nâng cấp các module tương ứng (như hỗ trợ hành động mới trong Combat AI, mở rộng cơ chế Auto...).
3. Nâng phiên bản theo đúng Quy tắc SEMVER (Mục 1 & 2):
   - Có thêm tính năng / hỗ trợ cơ chế game mới: **Nâng MINOR** (`x.Y.0`).
   - Sửa lỗi tương thích / tối ưu nhẹ: **Nâng PATCH** (`x.y.Z`).
4. Kiểm tra cú pháp: `node -c .\van_kiep_tro_ly_user.js` $\rightarrow$ commit và push `origin main`.
