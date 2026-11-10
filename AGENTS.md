# 🤖 Quy Chuẩn Dành Cho AI Agent & Kỹ Sư (AGENTS.md)

1. **Kiến trúc Native Multi-File ES Modules (`main.js` + `src/**/\*.js`)\*\*:
   - Không gộp/nối (bundle/concatenate) toàn bộ code vào `main.js` nữa.
   - `main.js` ở thư mục gốc chỉ là file entrypoint nhỏ gọn (~122 dòng) dùng `import` để nạp các module con từ `./src/...` (tương tự chuẩn `su_do.zip` của tác giả game).
   - Mọi logic tính năng đặt trong các module tương ứng tại `src/core/`, `src/data/`, `src/ui/`, `src/modules/`, `src/auto/`. Sau khi sửa code hoặc sửa `src/styles/ui.css`, chạy `node build.js` để đồng bộ `ui-css.js`, `version` và đóng gói `van-kiep-tro-ly-mod.zip`.
2. **Chuẩn Game Mod Chính Thức (`window.tuTienMods`)**:
   - Không tái sử dụng cơ chế Stealth (`waitForGameReady`) của Tampermonkey.
   - Luôn giữ cấu trúc đăng ký qua `window.tuTienMods` (`apiVersion: 1`, `id: "van_kiep_tro_ly"`) trong `main.js`, kèm `mod.yaml` hợp lệ ở thư mục gốc.
3. **Quy tắc bảo toàn logic Dị Bảo**:
   - Luôn phân biệt rõ `sc.relics` (Dị Bảo sở hữu trong kiếp hiện tại `run`) và `sc.metaRelics` (Bảo Lục Luân Hồi trong `meta.tienLo.relics`).
   - Khi kiểm tra nhân vật đã có Dị Bảo trong kiếp hiện tại hay chưa, bắt buộc dùng `checkOwnedRelic(id, run, sc)` (hoặc `hasRelicItemInRun(id, run)` khi kiểm tra vật phẩm vừa rớt sau sự kiện).
   - Khi kiểm tra khả năng truyền tống bằng `ddTeleOpts`, bắt buộc kiểm tra `!o.blocked`.
4. **Kiểm tra trước khi bàn giao**:
   - Luôn chạy `node build.js` và kiểm tra nạp ES Module (`import("./main.js")`) để đảm bảo không có lỗi cú pháp hay thiếu export ở bất kỳ module nào trong `src/` cũng như `main.js`.
5. **Đóng gói file cài đặt Mod (`van-kiep-tro-ly-mod.zip`) & Push lên cùng commit (BẮT BUỘC)**:
   - File `van-kiep-tro-ly-mod.zip` (chứa `mod.yaml`, `main.js` và `src/**/*.js` giữ nguyên đường dẫn tương đối) là gói cài đặt chính thức người chơi dùng để import trực tiếp vào game (Cấu hình ➔ Mods ➔ Cài mod).
   - Script `node build.js` tự động đóng gói `van-kiep-tro-ly-mod.zip`.
   - Mỗi khi commit mã nguồn hoặc nâng version, **BẮT BUỘC** phải stage cả file zip (`git add .` hoặc bao gồm `van-kiep-tro-ly-mod.zip`), commit và push lên remote trong **CÙNG MỘT COMMIT**.

## 1. QUY TẮC ĐÁNH SỐ PHIÊN BẢN (SEMVER STANDARD)

Mỗi khi có bất kỳ thay đổi nào trong mã nguồn dự án, **BẮT BUỘC** phải nâng số phiên bản theo đúng 3 cấp độ sau:

| Loại Thay Đổi               | Cấp Phiên Bản | Quy Tắc Tăng                                                                | Ví Dụ                         |
| --------------------------- | ------------- | --------------------------------------------------------------------------- | ----------------------------- |
| **Enhance / Sửa Bug**       | **PATCH**     | Tăng số cuối (`x.y.Z` $\rightarrow$ `x.y.Z+1`)                              | `7.6.1` $\rightarrow$ `7.6.2` |
| **Tính Năng Mới (Feature)** | **MINOR**     | Tăng số giữa (`x.Y.0` $\rightarrow$ `x.Y+1.0`), reset patch về `0`          | `7.6.2` $\rightarrow$ `7.7.0` |
| **Đại Tu Kiến Trúc Lớn**    | **MAJOR**     | **CHỈ nâng khi NGƯỜI DÙNG YÊU CẦU TRỰC TIẾP**, reset minor & patch về `0.0` | `7.7.0` $\rightarrow$ `8.0.0` |

---

## 2. QUY TRÌNH BẮT BUỘC KHI CẬP NHẬT PHIÊN BẢN

Mỗi lần nâng version, phải cập nhật đồng bộ tại **tất cả các vị trí sau**:

1. **Cập nhật Version trong `package.json`:**
   ```json
   "version": "x.y.z"
   ```
2. **Nhật Ký Cập Nhật (`src/modules/nhat-ky.js` -> `LOG`):**
   - Thêm một object mới lên **ĐẦU mảng `LOG`**:
     ```javascript
     { t: 'Phiên Bản x.y.z · [Tên bản cập nhật ngắn gọn]', d: 'DD/MM/YYYY', now: true, pts: [
         '<b>Tiêu đề điểm 1:</b> Chi tiết mô tả...',
         '<b>Tiêu đề điểm 2:</b> Chi tiết mô tả...'
     ] },
     ```
   - Chuyển mục phiên bản liền trước thành `now: false`.
3. **Đồng bộ & Đóng gói file Mod:**
   - Chạy lệnh:
     ```bash
     node build.js
     ```
   - Script sẽ tự động:
     - Đồng bộ `TOOL_VER = "x.y.z"` trong `src/core/utils.js` và `version` trong `mod.yaml`.
     - Đồng bộ `src/styles/ui.css` sang `src/styles/ui-css.js`.
     - Đóng gói file cài đặt `van-kiep-tro-ly-mod.zip` (gồm `mod.yaml`, `main.js` và `src/**/*.js`).
4. **Commit Git & Push Lên Remote:**
   - Stage toàn bộ thay đổi bao gồm cả file zip (`git add .`), commit và push lên GitHub.

## 3. CẨM NANG ĐIỀU TRA & THÍCH ỨNG KHI GAME CÓ BẢN UPDATE MỚI

Khi người dùng báo _"game mới có update, check kỹ lại source xem"_ hoặc khi phát hiện game deploy bản build mới, AI Agent và lập trình viên **BẮT BUỘC** thực hiện quy trình điều tra 6 bước sau để biết chính xác game đã đổi gì và tìm kiếm ở đâu:

### Bước 0: Dọn Dẹp File Cũ Trong `scratch/` (BẮT BUỘC TRƯỚC KHI TẢI MỚI)

Tuyệt đối không tải đè hoặc tích lũy nhiều file bundle/zip/script nháp trong thư mục `scratch/`. Trước khi kéo source mới về, phải dọn dẹp sạch sẽ:

1. **Lưu bản hiện hành làm mốc so sánh (diffing):**
   - Đổi tên `latest_game_bundle.js` $\rightarrow$ `old_game_bundle.js` (chỉ giữ đúng 1 bản liền trước để so sánh).
   - Đổi tên thư mục `latest_template_extracted` $\rightarrow$ `old_template_extracted`.
   - Đổi tên `latest_content.json` (hoặc `new_content.json`) $\rightarrow$ `old_content.json`.
2. **Xóa sạch toàn bộ file rác và script nháp cũ:**
   - Xóa bỏ các file bundle thừa thãi (`game_bundle.js`, `newest_bundle.js`, v.v.), các file nén `*.zip`, file json trùng lặp (`new_content_downloaded.json`...), các thư mục giải nén cũ (`template_extracted`...).
   - Xóa sạch toàn bộ các script tạm một lần (`check_*.js`, `find_*.js`, `inspect_*.js`, `diff_*.js`, `show_*.js`, `*.txt`) của các đợt điều tra trước. Thư mục `scratch/` chỉ chứa duy nhất bộ mốc `old_*` sẵn sàng cho việc so sánh.

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
     - So sánh giữa `scratch/latest_template_extracted/vi_du/tu-tien.d.ts` và `scratch/old_template_extracted/vi_du/tu-tien.d.ts`.
     - Đây là **tài liệu quan trọng nhất**: nhà phát triển game ghi chú toàn bộ thay đổi hệ thống, công thức mới, hằng số cân bằng mới, hàm API mới (kèm giải thích chi tiết trong docstring, ví dụ: tăng trần cấp văn Bản Mệnh lên 5, cơ chế Dị Văn, `tierSlack`, v.v.).
  3. Đọc các file hướng dẫn kèm theo:
     - `vi_du/doi-api.md`: Nhật ký đổi API của game (`apiVersion`, các hàm game mở riêng cho Tool Trợ Lý).
     - `vi_du/balance.md`: Danh mục hằng số cân bằng toàn bộ game.
     - `vi_du/tai-lieu-api.md` & `surface.txt`: Mặt mở API của `window.tuTien` và `window.tuTien.core`.

### Bước 3: Tải Gói Dữ Liệu Nội Dung Gốc (`content-[hash].json`)

1. Tìm tên file content JSON trong bundle JS:
   Tìm chuỗi `new URL("content-[hash].json", import.meta.url).href`.
2. Tải về file `scratch/latest_content.json`:
   ```bash
   curl.exe -s -o .\scratch\latest_content.json https://van-kiep-tu-tien.vuhaiquan2k1.workers.dev/assets/content-[hash].json
   ```
3. File này chứa **100% dữ liệu YAML gốc của game**:
   - `/content/encounters/*.yaml`: Toàn bộ sự kiện, Dị Bảo, bí cảnh, tỷ lệ ra bảo vật, điều kiện kích hoạt.
   - `/content/items/**/*.yaml`: Toàn bộ pháp khí, đan dược, phù lục, trận bàn, trận văn, công pháp mới.
   - `/content/enemies/**/*.yaml`: Quái, Boss, chỉ số, chiêu thức.
   - `/content/npc/**/*.yaml`: Nhân vật, sư phụ, thế lực.

### Bước 4: Chạy Script So Sánh Sai Khác (Diffing)

Viết script Node.js trong `scratch/` để trích xuất nhanh giữa `latest_*` và `old_*`:

1. **Chuỗi tiếng Việt mới xuất hiện:** Quét chuỗi có dấu tiếng Việt trong bundle mới mà bundle cũ không có $\rightarrow$ biết ngay tên các tính năng, thông báo, cơ chế mới vừa thêm.
2. **Danh mục vật phẩm / ID mới:** Quét regex `"(phap_khi|dan_duoc|phu_luc|cong_phap|tran_ban|tran_van|ban_menh)/[a-z0-9_.-]+"` để tìm tất cả item/rune mới.
3. **Mô-đun lõi trong `window.tuTien.core`:** Kiểm tra danh sách export xem có module nào mới hoặc bị đổi tên không (đảm bảo Tool không bị crash).

### Bước 5: Thích Ứng Tool, Nâng Phiên Bản & Dọn Dẹp Sau Cùng

1. Cập nhật các enum, bộ lọc, từ điển loại vật phẩm (`LOAI_VI`, `GLUT_LOAI`, scanner chợ...), hệ thống Bản Mệnh (`bmRunes`), kinh mạch, luyện chế theo dữ liệu mới.
2. Nâng cấp các module tương ứng (như hỗ trợ hành động mới trong Combat AI, mở rộng cơ chế Auto...).
3. Nâng phiên bản theo đúng Quy tắc SEMVER (Mục 1 & 2):
   - Có thêm tính năng / hỗ trợ cơ chế game mới: **Nâng MINOR** (`x.Y.0`).
   - Sửa lỗi tương thích / tối ưu nhẹ: **Nâng PATCH** (`x.y.Z`).
4. Kiểm tra cú pháp: `node -c .\van_kiep_tro_ly_user.js` $\rightarrow$ commit và push `origin main`.
5. **Dọn dẹp sau cùng (BẮT BUỘC):**
   - Xóa bỏ toàn bộ các script tạm (`*.js`, `*.txt`) và bộ mốc `old_*` sinh ra trong đợt điều tra.
   - Chỉ giữ lại bộ source chuẩn hiện hành (`latest_game_bundle.js`, `latest_template_extracted`, `latest_template.zip`, `latest_content.json`) để làm mốc so sánh cho lần cập nhật sau, giữ thư mục làm việc luôn gọn gàng và tinh gọn.

## 4. Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

### 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:

- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

### 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

### 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:

- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:

- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

### 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:

- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:

```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.
