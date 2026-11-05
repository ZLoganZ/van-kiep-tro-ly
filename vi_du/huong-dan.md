# Làm mod đầu tiên

Hướng dẫn từng bước cho người mới. File này nằm trong gói mod mẫu tải về, cạnh `tai-lieu-api.md` (tra cứu đầy đủ: mọi hàm, bảng sự kiện, điểm móc), `balance.md` và `doi-api.md`.

## 1. Chọn cách làm

| Bạn muốn | Làm bằng | Cần JS? |
|---|---|---|
| Thêm vật, địch, sự kiện | `content/*.yaml` | không |
| Sửa vài số của vật / địch / sự kiện gốc | `patch:` trong `mod.yaml` | không |
| Chỉnh độ khó (máu địch, sức mạnh…) | `balance:` trong `mod.yaml` | không |
| Thêm ảnh / icon | `img/vat/…`, `img/dich/…` | không |
| Cho người chơi tùy chọn | `options:` trong `mod.yaml` | không |
| Đổi công thức (sát thương, giá, tỉ lệ đột phá…) | `mod.modify` trong `main.js` | có |
| Thêm nút, bảng, ô thông tin vào HUD | `mod.ui.*` trong `main.js` | có |
| Làm việc khi game có biến cố (lên cảnh giới, hết trận…) | `tuTien.on` trong `main.js` | có |

Bắt đầu bằng YAML: ít lỗi nhất, game tự kiểm và báo lỗi ở màn Mods.

## 2. Lấy gói mẫu

Hai cách:
- Tải `/mod/template.zip` từ trang game (kèm `tu-tien.d.ts` để trình soạn gợi ý và `balance.md`).
- Chép thư mục app/mods/example/ trong repo.

Đổi tên thư mục và **đổi `id` ở `mod.yaml`** (chữ thường, số, gạch dưới). `main.js` cũng phải đổi `id` cho khớp. Id mod là tiền tố cho mọi id mới bạn tạo.

## 3. Bài 1: thêm một vật

Tạo `content/items/kiem_go.yaml` (giả sử id mod là `hoa_son`):

```yaml
- id: item.hoa_son_kiem_go
  ten: Kiếm Gỗ Hoa Sơn
  loai: phap_khi
  pham_cap: 1
  canh_gioi: 0
  he: [moc]
  hinh: ["X"]
  tag: [kiem]
  chieu: { ten: Mộc Ảnh Trảm, phi: 1, hoi: 0, uy: 0.9, dang: cong }
  gia: 12
  mo_ta: Kiếm gỗ luyện tay của đệ tử mới nhập môn.
```

Thêm icon `img/vat/hoa_son_kiem_go.webp` (tên file là phần sau `item.`; webp / png, tối đa 1 MB).

Luật id: id mới phải là `<tiền tố>.<id_mod>_<tên>`. Sai là cả phần nội dung của mod bị bỏ.

Cách viết từng loại mục (địch, sự kiện, cửa hàng…): **chép một mục gốc gần giống rồi sửa**. Lấy mẫu ngay trong game: mở console (F12 → Console) rồi gõ

```js
tuTien.yaml.find('kiếm')              // tìm id theo tên, có dấu hay không đều được; thêm 'ev.' để lọc sự kiện…
tuTien.yaml('item.thiet_kiem')        // xem YAML của mục, dòng đầu ghi file gốc
copy(tuTien.yaml('item.thiet_kiem'))  // chép vào clipboard, dán vào content/ của mod
tuTien.yaml.save('ev.')               // tải về mọi sự kiện thành một file để đọc
```

Dán xong nhớ **đổi `id`** sang id của mod (`item.hoa_son_…`). Chi tiết ở `tai-lieu-api.md` mục "Lấy mẫu nội dung gốc".

## 4. Bài 2: chỉnh số có sẵn

Trong `mod.yaml`:

```yaml
# Sửa vài trường, không chép cả mục. Mảng thay hẳn, null xóa trường.
patch:
  item.thiet_kiem: { gia: 14 }

# Hằng cân bằng, khóa tra ở balance.md
balance:
  difficulty.DIFFICULTY.enemyHealth: 1.3
```

Khóa `balance` sai tên hoặc sai kiểu thì cả phần cân bằng của mod bị bỏ. Luôn đối chiếu `balance.md`.

## 5. Bài 3: thêm nút, nghe biến cố (JS)

Sửa `main.js` (đổi `id` cho khớp `mod.yaml`):

```js
(window.tuTienMods ??= []).push({
  id: 'hoa_son',
  ready(tt, mod) {
    // Nghe: báo sau khi hành động đã ghi
    tt.on('breakthrough', (e) => {
      if (e.success) tt.ui.toast('Đột phá thành công!');
    });

    // Ô nhỏ trong nút nổi "Mod" (góc dưới phải)
    const o = mod.ui.addDock({
      id: 'linh_thach',
      title: 'Linh thạch',
      mount(el, tt) {
        const draw = () => (el.textContent = `${tt.state().run?.nhanVat.linhThach ?? '-'}`);
        draw();
        return tt.subscribe(draw); // trả hàm hủy để HUD dọn
      },
    });
    tt.subscribe((s) => o.setValue(String(s.run?.nhanVat.linhThach ?? '')));
  },
});
```

Hai nguyên tắc:
- **Chỉ ghi trạng thái bằng lệnh `tuTien.game.*`** (hoặc `mod.addAction`). Sửa thẳng object trong `tt.state()` có thể hỏng save. Xem [Quy ước](tai-lieu-api.md#quy-ước).
- Muốn tính thử một hàm lõi thì dùng `tt.game.readCtx()` (bản sao, không đụng kiếp thật).

Đổi công thức thì dùng `boot`, không phải `ready`:

```js
boot(tt, mod) {
  mod.modify('price', ({ side, value }) => (side === 'sell' ? value * 1.1 : value));
},
```

## 6. Đóng gói và thử

1. Nén **cả thư mục** (không phải ruột bên trong) thành `.zip`.
2. Trong game: **Cấu hình → Mods → Cài mod**, chọn zip, bật mod.
3. Tải lại trang. Đổi gì thì cài lại zip (cùng id là cập nhật), rồi tải lại.
4. Lỗi YAML / id / trường sai hiện ở màn Mods; mod lỗi chỉ mất phần nội dung, game vẫn chạy. Lỗi JS ghi ở console trình duyệt (`mod.log(…)` cũng ra đó).
5. Game hỏng vì mod: mở lại với `?nomods` sau địa chỉ (app: `--no-mods`).

## 7. Bẫy thường gặp

| Bẫy | Cách tránh |
|---|---|
| `main.js` khác `id` với `mod.yaml` | hai `id` phải trùng, game mới gộp làm một mod |
| Đăng ký móc / cân bằng trong `ready` | móc, `setBalance`, `modify`, `addEffect`… chỉ đăng ký được ở `boot` |
| Gọi `tt.game` hoặc `tt.state()` trong `boot` | chưa có; đọc ở `ready` |
| Id mới không có tiền tố mod | `item.hoa_son_…`, `enemy.hoa_son_…`, `ev.hoa_son_…` |
| Trùng id gốc mà không khai | thêm vào `overrides:` hoặc dùng `patch:` nếu chỉ sửa vài trường |
| Chép giá trị cân bằng ra biến lúc nạp | hằng có thể đổi theo độ khó, đọc lúc cần |
| Ghi dữ liệu lớn vào `modData` | trần 256 KB; cài đặt, cache để `localStorage` khóa `mod:<id>:…` |
| `Math.random()` trong hành động | dùng `h.random()` để tải lại save không đổi kết quả |
| `apiVersion` cao hơn game | mod không nạp |
| Mod đổi luật làm Tỉ thí bị khóa | mod có nội dung, móc, cân bằng, hiệu ứng thì khóa Tỉ thí; mod chỉ UI thì không |

## 8. Đọc tiếp

- [README.md](tai-lieu-api.md): bảng tra mọi `tuTien.*` và `mod.*`, sự kiện, điểm móc, ảnh, chỗ cắm giao diện.
- [balance.md](balance.md): mọi khóa cân bằng.
- [doi-api.md](doi-api.md): thay đổi API giữa các bản.
- app/mods/example/: mod mẫu dùng đủ các chỗ cắm.
