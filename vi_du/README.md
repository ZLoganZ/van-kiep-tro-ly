# Mod Mẫu (vi_du): bắt đầu từ đây

Gói mẫu để làm mod cho Vạn Kiếp Tu Tiên. Đã chạy được: cài thẳng vào game là thấy một vật, một yêu thú, một sự kiện đánh nhau và vài ô giao diện.

## Làm theo thứ tự này

1. Đọc `huong-dan.md` (10 phút): chọn cách làm, ba bài thực hành, bẫy thường gặp.
2. Cài thử gói nguyên bản: nén **cả thư mục** thành `.zip`, vào game → Cấu hình → Mods → Cài mod, bật, tải lại trang. Xem mod làm gì trong game rồi mới sửa.
3. Sửa từng file theo bảng dưới, cài lại zip (cùng `id` là cập nhật), tải lại trang xem kết quả.
4. Cần hàm / sự kiện / móc nào thì tra `tai-lieu-api.md`; khóa cân bằng tra `balance.md`.
5. Đổi `id` ở `mod.yaml` và `main.js` (phải trùng nhau) thành tên mod của bạn trước khi chia sẻ.

## Mỗi file làm gì

| File | Làm gì |
|---|---|
| `mod.yaml` | id, tên, phiên bản, `patch` (sửa trường mục gốc), `balance` (hằng cân bằng), `options` (tùy chọn ở màn Mods) |
| `content/**.yaml` | nội dung mới: vật, địch, sự kiện… Id mới phải là `<tiền tố>.vi_du_<tên>` |
| `content/patch/*.yaml` | patch tách file (cùng dạng khóa `patch:` của mod.yaml) |
| `img/vat/<tên>.webp` | icon vật `item.<tên>`; `img/dich/` ảnh địch, `img/man/` tranh cảnh, `img/chieu/` icon chiêu. Chỉ webp / png |
| `main.js` | JS tùy chọn: `boot` (móc, modifier…), `ready` (giao diện, theo dõi) |

Chỉ cần thêm / sửa nội dung thì không cần `main.js`: xóa nó và dòng `script:` ở `mod.yaml`.

## Tài liệu kèm trong gói

| File | Nội dung |
|---|---|
| `huong-dan.md` | làm mod đầu tiên từng bước, đọc trước |
| `tai-lieu-api.md` | tra cứu mọi hàm, sự kiện, móc |
| `doi-api.md` | API đổi gì giữa các bản |
| `balance.md` | mọi khóa cân bằng và giá trị hiện tại |
| `surface.txt` | danh sách đầy đủ `game.*`, state, `core` hiện có |
| `tu-tien.d.ts` | kiểu của `window.tuTien` để trình soạn gợi ý |

Lỗi của mod (YAML hỏng, id sai, trường sai) hiện ở màn Mods; mod lỗi chỉ bị bỏ phần nội dung, game vẫn chạy. Game hỏng vì mod thì mở lại với `?nomods` sau địa chỉ.
