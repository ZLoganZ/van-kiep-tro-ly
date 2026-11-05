# HƯỚNG DẪN PHÁT TRIỂN & BẢO TRÌ MOD "VẠN KIẾP TRỢ LÝ"
*(Dành cho lập trình viên và AI phát triển tiếp)*

Tài liệu này tổng hợp toàn bộ kiến trúc, nguyên tắc thiết kế, bản đồ mã nguồn và quy trình từng bước để phát triển, sửa lỗi hoặc mở rộng script **Vạn Kiếp Trợ Lý** (UserScript Tampermonkey & Mod game) cho webgame **Vạn Kiếp Tu Tiên** (`https://van-kiep-tu-tien.vuhaiquan2k1.workers.dev/`).

---

## 1. TỔNG QUAN HỆ THỐNG & NGUYÊN TẮC CỐT LÕI

### 1.1. Cổng giao tiếp API của Game (`window.tuTien`) & Cơ chế Stealth (Không Bị Phát Hiện)
Kể từ bản game có Mod API (`apiVersion: 1`, cập nhật tháng 11/2026), game mở cổng kết nối chính thức qua `window.tuTien` (hoặc mảng chờ `window.tuTienMods`).
* **Không quét regex / không tải bản sao / không vá bundle:** Tuyệt đối không quay lại cách làm cũ (bản 6.x) là fetch `index-[hash].js`, regex tìm hàm bị nén rồi import blob. Mọi hàm logic game đã được mở chính thức qua `tuTien.core`.
* **Cơ chế Stealth Mode (Chống phát hiện mod khi chạy Tampermonkey):**
  * Nếu Userscript đẩy cấu hình mod vào `window.tuTienMods`, engine game sẽ nhận diện có mod nạp từ `"user"` (Userscript), hiển thị trong menu *Cấu hình → Mods*, gắn mác dùng mod vào save game (`run.mods`), báo toast "Kiếp này bắt đầu dùng mod...", và có nguy cơ khóa tính năng Tỉ thí lôi đài.
  * **Giải pháp Stealth Standalone (Bản 7.0.3):** Khi chạy qua Tampermonkey, script **KHÔNG đẩy vào `window.tuTienMods`**. Thay vào đó, script lắng nghe sự kiện `tutien:ready` (hoặc kiểm tra `window.__tuTienReady` / `window.tuTien.phase === 'ready'`). Khi game sẵn sàng, Trợ Lý trực tiếp sử dụng `window.tuTien` để kết nối lõi `core` và `game`.
  * Kết quả: Tool hoạt động 100% đầy đủ chức năng nhưng **hoàn toàn vô hình đối với engine mod của game** (menu Mods trống, save không bị gắn cờ, không khóa Tỉ thí).
* **Hai pha vòng đời của Mod (khi chạy dạng mod zip chính thức):**
  * **`boot(tt, mod)`**: Chạy trước khi nạp dữ liệu kiếp chơi. Chỉ dùng khi cần đổi công thức (`mod.modify`), sửa hằng cân bằng (`mod.setBalance`), thêm hiệu ứng/điều kiện (`mod.addEffect`, `mod.addCondition`), sửa nội dung gốc (`mod.patchContent`), đăng ký hành động mod (`mod.addAction`).
  * **`ready(tt, mod)`**: Chạy khi game đã nạp xong toàn bộ (UI, state, core, content đều sẵn sàng). Trợ Lý khởi chạy toàn bộ giao diện và logic tại pha này.

### 1.2. Nguyên tắc An toàn dữ liệu & Save game
1. **Ghi trạng thái CHỈ qua `tuTien.game.*`:** Game chạy qua `Game.act`, tự quản lý giao dịch, tự lưu IndexedDB, tự rollback nếu lỗi. Không bao giờ gán thẳng vào `tuTien.state()`.
2. **Tính toán thử nghiệm qua `tuTien.game.readCtx()`:** Hàm này tạo một bản sao `ctx` (clone) của kiếp đang chơi. Dùng nó để tính thử sát thương, thử ghép kinh mạch, xem trước giá cả... mà không ảnh hưởng kiếp thật.
3. **Giảm tải hiệu năng (`ctxLite()`):** Trong các vòng lặp tự động (Auto Loop chạy mili-giây), không gọi liên tục `readCtx()` vì sẽ clone toàn bộ kiếp gây giật lag. Chỉ dùng `ctxLite()` (chỉ shallow copy `run` và nạp RNG) cho các tác vụ chỉ đọc.

---

## 2. BẢN ĐỒ MÃ NGUỒN `van_kiep_tro_ly_user.js`

File có độ dài ~6.400 dòng, được tổ chức thành các phân vùng logic chặt chẽ:

| Dòng | Phân vùng | Mô tả & Trách nhiệm |
|---|---|---|
| **1 - 25** | **Tampermonkey Header & Khai báo Mod** | Metadata `@match`, `@run-at document-start`, đẩy cấu hình mod vào `window.tuTienMods`. |
| **26 - 215** | **CSS & Giao diện giao diện (Themes & Responsive)** | `MOD_CSS_EXTRA`, `THEME_CSS`, `UI_V2_CSS`, `UI_V7_CSS`. Hỗ trợ 4 theme: Mực Ngọc, Tử Tiêu, Giấy Cổ, Huyền Ảnh. |
| **216 - 577** | **Module UI Shell (`UI` & `Fit`)** | Quản lý khung cửa sổ kéo thả `#vkx-win`, nút mở FAB `#vkx-fab`, hệ thống co giãn responsive `Fit` (tự tính tỉ lệ theo màn hình điện thoại / máy tính), Toast thông báo. |
| **578 - 585** | **Dữ liệu Ngự Linh cố định** | Thư viện fallback các loài yêu thú / linh thú. |
| **586 - 706** | **Cầu nối Lõi Game (`buildCore` / `loadCore`)** | Kết nối `tuTien.core`. Định nghĩa `CORE_REQUIRED` (bắt buộc) và `CORE_OPTIONAL` (tính năng phụ), đọc hằng số động từ `balance/*`. |
| **707 - 754** | **Tiện ích & Mô phỏng Combat** | `G()` (lấy `tuTien.game`), `C()` (lấy `content`), `ctx()`, `fight()` gọi `tinhTocChien`, dựng quái `taoBenDich`. |
| **755 - 1200** | **Tối ưu hóa Kinh Mạch** | Quy tắc ngũ hành tương sinh / tương khắc (Tiên Tu / Ma Tu), giải thuật tìm cách xếp `kmSolve`, thuật toán gợi ý mở ô `kmOpenSearch`, áp dụng vào game `kmApplyDiff`. |
| **1201 - 2204** | **Tính toán Đột Phá, Thọ Nguyên, Nghề Nghiệp** | Tính tỷ lệ đột phá `chuanBiDotPha`, chuẩn bị bế quan, Tàng Kinh Các, khảo hạch môn phái, luyện đan, chế phù, luyện bảo, trận pháp, bản mệnh. |
| **2205 - 2864** | **Tính toán Kiếm Lời & Giao Thương** | Khảo sát tiệm buôn gần (`facilitiesAt`), so sánh giá mua (`giaMua`) và bán (`giaBan`), tính mức ngập chợ (`glutRoom`). |
| **2865 - 3500** | **Tra Cứu & Bản Đồ & Đánh Thử** | Tra cứu địa danh, khoảng cách và thời gian đi đường `travelYears`, ước lượng nguy hiểm `revealedCombatRisk`, đồ nên săn. |
| **3501 - 4722** | **Wiki Ngự Linh, Hướng Build & Tra Cứu Item/Quái** | Danh mục linh thú, phân tích hướng build theo lưu phái (Kiếm, Đan, Phù...), tra cứu chỉ số vật phẩm và yêu quái. |
| **4723 - 5054** | **Hạ tầng Tự Động (Auto Core Engine)** | Quản lý cấu hình `AU_DEF`, cơ chế đóng popup nguy hiểm `auBypassConfirm` (luôn bấm Hủy/Esc), xử lý việc dở `auPending`, signature chống kẹt vòng lặp `auSig`, bộ lọc né Hạc `auIsHacEnemy`. |
| **5055 - 5200** | **Auto Kinh Mạch (`akm`)** | Tự động dò và mở ô có lợi, tự động xếp lại mảnh công pháp/pháp khí bằng hàm game. |
| **5201 - 5296** | **Auto Săn Yêu (`asy`)** | Quét bãi hoang dã an toàn theo màu (Xanh, Vàng, Đỏ), kiểm tra sức trước khi chạy, tự động né Hạc, gọi `tocChienTran`. |
| **5297 - 5490** | **Auto Buôn Bán (`abb`)** | Tìm lộ trình buôn có lời nhất (`auPlanTrade`), tự di chuyển giữa các thành, tự mua và bán hàng. |
| **5491 - 6149** | **Auto Reroll (`arr`) & Luân Hồi** | Tự động quét hạt giống tạo kiếp ảo (`createRun`) tìm Linh Căn & Thể Chất mong muốn, tự mua Lộ Phí / Luân Hồi, kích hoạt kiếp mới. |
| **6150 - 6403** | **Module Nhật Ký Cập Nhật (`NhatKy`)** | Hiển thị lịch sử các bản cập nhật của Trợ Lý. |
| **6404 - 6427** | **Khởi Động & Đăng ký UI Panel** | Gắn `mod.ui.addPanel` vào nút Mod gốc của game, lắng nghe đóng mở cửa sổ. |

---

## 3. CÁC TÀI LIỆU API THAM KHẢO TRONG WORKSPACE (`vi_du/`)

> [!IMPORTANT]
> **Thư mục `vi_du/` là gói SDK / template tải trực tiếp từ web game (`https://van-kiep-tu-tien.vuhaiquan2k1.workers.dev/mod/template.zip`).**
> Thư mục này **sẽ được tải lại từ web game và thay đổi khi game cập nhật**.
> Tuyệt đối không viết code logic của Tool phụ thuộc vào file nội bộ bên trong `vi_du/`, mà chỉ dùng nó làm nguồn tham chiếu API (SDK Reference) giữa các phiên bản.

Khi cần tra cứu API, kiểu dữ liệu hay hằng số, hãy xem các file trong thư mục `vi_du/`:
1. **`vi_du/doi-api.md`**: Bảng nhật ký thay đổi API. Mỗi khi game cập nhật và đổi/bỏ/thêm hàm nào, tác giả game sẽ ghi lại ở đây. **Luôn đọc file này đầu tiên khi `vi_du` được cập nhật.**
2. **`vi_du/surface.txt`**: Danh sách toàn bộ 176 phương thức của `tuTien.game` và các hàm được export trong `tuTien.core` (được game sinh tự động từ test suite).
3. **`vi_du/tu-tien.d.ts`**: Toàn bộ định nghĩa TypeScript types của engine game. Mở file này để tra cứu chính xác tham số truyền vào và kiểu trả về của bất kỳ hàm nào.
4. **`vi_du/balance.md`**: Danh mục hằng số cân bằng trong game (`difficulty.*`, `combat.*`, `natal.*`...).
5. **`vi_du/tai-lieu-api.md`**: Bảng tra cứu chi tiết hướng dẫn làm mod, kèm bảng mapping tên hàm cũ 6.x sang `tuTien.core`.

---

## 4. HƯỚNG DẪN THỰC HIỆN CÁC TÁC VỤ PHÁT TRIỂN THƯỜNG GẶP

### 4.1. Cách thêm một Tab chức năng mới vào Trợ Lý
Hệ thống tab của Trợ Lý được chia thành 2 cấp: Nhóm lớn (`GROUPS`) và Tab con (`TABS`).

1. **Bước 1: Khai báo Tab ID và Tiêu đề**
   * Tìm biến `GROUPS` (khoảng dòng 120):
     ```javascript
     GROUPS = [
       ['nv', 'Nhân Vật', ['tq', 'tkc', 'bm']],
       ['au', 'Tự Động', ['abb', 'asy', 'akm', 'arr', 'ten_tab_moi']], // thêm vào nhóm mong muốn
     ];
     ```
   * Tìm biến `TABS`:
     ```javascript
     TABS = [
       ...
       ['ten_tab_moi', 'Tiêu Đề Tab Mới'],
     ];
     ```

2. **Bước 2: Viết hàm render nội dung tab**
   ```javascript
   function tabTenTabMoi() {
     const g = G(), run = g.state.run;
     if (!run) {
       body.innerHTML = '<div class="vk-card">Chưa vào kiếp nào.</div>';
       return;
     }
     
     let html = '<div class="vk-card"><h3>Tiêu Đề</h3>';
     html += `<div class="vk-row"><span>Thông tin:</span><b>${num(run.nhanVat.linhThach)}</b></div>`;
     html += '<button class="vk-btn" id="btn-thuc-hien">Thực hiện</button>';
     html += '</div>';
     
     body.innerHTML = html;
     
     // Gắn sự kiện sau khi render HTML:
     const btn = body.querySelector('#btn-thuc-hien');
     if (btn) btn.onclick = () => {
       // Thao tác an toàn
       UI.notify('Đã bấm!');
     };
   }
   ```

3. **Bước 3: Đăng ký hàm render vào switch-case**
   * Tìm hàm `renderTab(tabName)` trong `Assist`:
     ```javascript
     switch (S.tab) {
       case 'ten_tab_moi': tabTenTabMoi(); break;
       ...
     }
     ```

---

### 4.2. Cách thêm hoặc sử dụng thêm hàm từ `tuTien.core`
Nếu cần một hàm lõi chưa có sẵn trong `S.core`:
1. Tra cứu module và tên hàm trong `vi_du/surface.txt` hoặc `vi_du/tai-lieu-api.md`. Ví dụ hàm `travelYears` thuộc module `world/travel`.
2. Mở `van_kiep_tro_ly_user.js`, tìm mảng `CORE_OPTIONAL` (khoảng dòng 604):
   ```javascript
   const CORE_OPTIONAL = [
     ...
     ['tenKhoaTool', 'ten/module', 'tenHamGoc', 'mô tả hiển thị khi thiếu'],
   ];
   ```
3. Sau khi khai báo, trong code gọi qua:
   ```javascript
   if (S.core.tenKhoaTool) {
     const kq = S.core.tenKhoaTool(tham_so);
   }
   ```

---

### 4.3. Cách mở rộng một tác vụ Tự Động (Auto Feature)
Khi viết logic tự động mới, bắt buộc phải tuân theo các quy tắc an toàn sau:

1. **Bọc lệnh gọi qua `auCall`:**
   ```javascript
   const res = auCall((g) => g.travelTo(targetSlot));
   if (!res.ok) {
     auLog('Lỗi di chuyển: ' + res.err, 'vk-bad');
   }
   ```
   *Lý do:* Engine game lưu lỗi vào `state.error` thay vì ném exception. `auCall` phát hiện lỗi này để dừng loop an toàn.

2. **Luôn gọi `auBypassConfirm`:**
   ```javascript
   const cp = await auBypassConfirm();
   if (cp) return { stop: 'Phát hiện popup cảnh báo ' + cp.title + ', đã đóng bằng nút Hủy để bảo đảm an toàn.' };
   ```
   *Lý do:* Tuyệt đối không để script tự bấm "Đồng ý" trên các popup nguy hiểm (như vào Tử Địa, đốt thọ nguyên, ném đồ bỏ chạy).

3. **Giữ gìn Khí Vận (Né yêu thú Hạc):**
   Trong game, giết các loài Hạc sẽ bị trừ điểm Khí Vận ẩn và chịu nghiệp báo:
   ```javascript
   if (auIsHacEnemy(enemyId, enemyName)) {
     // Bỏ qua hoặc chọn lối thoát
   }
   ```

4. **Tránh nghẽn luồng giao diện (Non-blocking):**
   Trong vòng lặp `while`, nếu chạy tác vụ nặng hoặc lặp nhanh, cần chèn:
   ```javascript
   if (performance.now() - slice > 20) {
     await auYield(); // Trả quyền render cho browser và game
     slice = performance.now();
   }
   ```

---

### 4.4. Cách đóng gói thành Mod ZIP cài trực tiếp vào Game
Người dùng có thể không muốn dùng Tampermonkey mà muốn cài file `.zip` vào game thông qua mục *Cấu hình → Mods*:

1. Chuẩn bị thư mục mod:
   * `mod.yaml`: Khai báo metadata (`id: van_kiep_tro_ly`, `name`, `version`, `script: main.js`).
   * `main.js`: Mã nguồn JS (chính là toàn bộ phần ruột bên trong file userscript, bỏ phần Tampermonkey header `// ==UserScript==`).
2. Nén **toàn bộ nội dung thư mục** thành file `.zip`.
3. Trong game: Vào **Cấu hình → Mods → Cài mod**, chọn file zip, bật mod và F5 tải lại trang.

### 4.5. Chức năng Dò Đồ Quý (`tabDoDo`) - Radar & Săn vật phẩm Nghịch Thiên (Cấp 8) & Thần Phẩm (Cấp 7)
Tính năng mới được bổ sung từ bản 7.0.4 để phục vụ nhu cầu săn lùng đồ cấp cao tối thượng:
* **Hệ thống phẩm cấp trong game:**
  * Cấp 1-6: Phàm, Hoàng, Huyền, Địa, Thiên, Tiên.
  * Cấp 7: **Thần Phẩm** (màu vàng hổ phách).
  * Cấp 8: **Nghịch Thiên / Dị Bảo** (màu đỏ ánh hồng, biểu tượng vương miện 👑). Đây là phẩm cấp tối thượng, không bị trần pháp lực kẹp theo cảnh giới mà nhân thẳng theo cảnh giới hiện tại.
* **Cơ chế Dị Bảo (21 món):**
  * 19 món từ **Sự Kiện Thế Giới (`DIBAO.ev`)**: Có điều kiện cảnh giới (`gate`), bài kiểm định chỉ số (`chk`: Thần thức, Ngộ tính, Đạo tâm), quái hộ vệ (`bv`) và thời gian hồi chiêu (`hc`: thường là 120 năm).
  * 2 món từ **Boss Hóa Thần (`DIBAO.boss`)**: *Nghịch Lân Thuẫn* và *Thiên Diễn Đan* chỉ rơi khi đánh bại Boss Hóa Thần.
  * 12 món có đặc tính **«Theo Hồn Qua Kiếp» (`bd: 'Có'`)**: Vĩnh viễn bám theo linh hồn sang các kiếp sau sau khi đã nhận lần đầu.
* **Radar Quét Bản Đồ Thời Gian Thực (Live World Radar):**
  * Hàm `tabDoDo` quét trực tiếp danh sách node đang hoạt động trong kiếp chơi (`run.nodes`).
  * Phát hiện ngay lập tức các node sự kiện Dị Bảo đang mở, các boss và sự kiện có rơi đồ Thần Phẩm/Nghịch Thiên.
  * Tính toán chính xác khoảng cách năm đi đường `travelYears`, thời hạn còn lại `hetHanNam - nam`, mức nguy hiểm `danger(c, slot)`.
  * Nút bấm **`[🚀 Bay Đến Ngay]`** kích hoạt lệnh di chuyển `ddDoTravel(slot)` / `G().travelTo(slot)` để người chơi bay thẳng tới vị trí cơ duyên.
* **Bộ lọc và Danh mục đa năng:**
  * Lọc theo phẩm: Nghịch Thiên (P8), Thần Phẩm (P7), Tiên Phẩm (P6), Tất cả.
  * Lọc theo trạng thái: Đang trên Map, Đủ điều kiện, Đang hồi chiêu, Chưa đủ điều kiện, Đã sở hữu, Chưa có.
  * Lọc theo loại vật phẩm và tìm kiếm tự do theo từ khóa.

---

## 5. QUY TRÌNH ĐỒNG BỘ KHI GAME CẬP NHẬT (KHI THƯ MỤC `vi_du/` ĐƯỢC TẢI MỚI)

Mỗi khi web game ra bản cập nhật mới, người dùng sẽ tải gói template mới đè vào thư mục `vi_du/`. Để kiểm tra và điều chỉnh `van_kiep_tro_ly_user.js` tương thích với bản game mới, hãy thực hiện theo đúng 5 bước sau:

### Bước 1: Đọc `vi_du/doi-api.md`
* Xem các dòng trên cùng của file `doi-api.md`. Tác giả game sẽ ghi rõ:
  * `apiVersion` có tăng không? (Nếu tăng tức là có thay đổi kiến trúc lớn).
  * Hàm nào bị đổi tên, bị di dời sang module khác hoặc bị loại bỏ?
  * Hàm mới nào được export thêm cho Tool / Mod?

### Bước 2: So sánh `surface.txt` và `tu-tien.d.ts` (Diff)
* Dùng git diff hoặc so sánh nội dung mới của `surface.txt`:
  * Xem danh sách methods của `tuTien.game` có thay đổi hay đổi tham số không.
  * Xem các modules trong `tuTien.core` mà Tool đang dùng có bị thay đổi đường dẫn không.

### Bước 3: Rà soát danh sách hàm kết nối trong Tool
* Mở `van_kiep_tro_ly_user.js`, tìm đến:
  * `CORE_REQUIRED` (dòng ~594): Các hàm bắt buộc phải có để Tool chạy.
  * `CORE_OPTIONAL` (dòng ~604): Các hàm tính năng phụ.
  * `BM_CONST` (dòng ~625): Các hằng số cân bằng bản mệnh `balance/natal`.
* Nếu game đổi tên hàm (ví dụ hàm `chuanBiDotPha` chuyển sang module khác), cập nhật lại đúng `[keyTool, moduleMoi, tenHamMoi]`.

### Bước 4: Kiểm tra hằng số cân bằng trong `vi_du/balance.md`
* Nếu game cập nhật cơ chế tính sát thương, tỷ lệ rơi đồ, hoặc số lượt săn yêu (`HUNTS_PER_SLOT`, `HUNT_RECOVERY_YEARS`), đối chiếu với các thuộc tính getter động trong hàm `buildCore` (dòng ~656 - 694) để đảm bảo Tool không bị lệch số liệu với game.

### Bước 5: Cập nhật phiên bản Tool & Phát hành (Tự động Update trên Tampermonkey)
* **Tăng phiên bản:** Nâng `@version` trong UserScript header và `TOOL_VER` trong mã nguồn `van_kiep_tro_ly_user.js` (ví dụ từ `7.0.4` lên `7.0.5`).
* **Thêm nhật ký:** Thêm mục ghi chú vào mảng `LOG` trong module `NhatKy`.
* **Cơ chế Auto-Update của Tampermonkey:**
  * Header của `van_kiep_tro_ly_user.js` đã được gắn:
    ```javascript
    // @updateURL    https://raw.githubusercontent.com/ZLoganZ/van-kiep-tro-ly/main/van_kiep_tro_ly_user.js
    // @downloadURL  https://raw.githubusercontent.com/ZLoganZ/van-kiep-tro-ly/main/van_kiep_tro_ly_user.js
    ```
  * Khi bạn chạy lệnh `git push origin main`, GitHub sẽ cập nhật file raw. Tampermonkey trên trình duyệt của người dùng sẽ định kỳ kiểm tra `@updateURL`, so sánh nếu thấy `@version` trên GitHub cao hơn bản đang cài thì sẽ tự động tải bản mới nhất về và cập nhật không cần người dùng phải copy-paste lại mã nguồn!

---

## 6. MẸO GỠ LỖI & KIỂM TRA (DEBUGGING TIPS)

1. **Kiểm tra trực tiếp trên Console trình duyệt (F12):**
   * Kiểm tra xem game đã gắn API chưa: gõ `window.tuTien`.
   * Thử nghiệm gọi lệnh game: gõ `window.tuTien.game.state()`.
   * Thử nghiệm tính năng lõi: gõ `window.tuTien.core['progress/dot_pha'].chuanBiDotPha(tuTien.game.readCtx())`.
2. **Khởi động Game chế độ sạch (Safe Mode):**
   * Nếu mod bị lỗi làm treo trang: Truy cập link game kèm tham số `?nomods`:
     `https://van-kiep-tu-tien.vuhaiquan2k1.workers.dev/?nomods`
   * Game sẽ bỏ qua toàn bộ mod trong IndexedDB để bạn có thể vào giao diện tắt mod lỗi.
3. **Quản lý phiên bản lưu cấu hình LocalStorage:**
   * Cấu hình Auto lưu tại key `localStorage.getItem('vkx_auto_cfg')`.
   * Giao diện lưu tại key `localStorage.getItem('vkx_theme')`.
   * Khi thay đổi cấu trúc config, nhớ kiểm tra fallback merge với `AU_DEF` để tránh vỡ giao diện của người dùng cũ.

---
*Tài liệu này được tạo tự động để chuẩn hóa quy trình phát triển dự án "Vạn Kiếp Trợ Lý". Cập nhật tài liệu này mỗi khi nâng cấp phiên bản kiến trúc mới.*

