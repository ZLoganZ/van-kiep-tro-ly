# Làm mod cho Vạn Kiếp Tu Tiên

Mod chạy trong trang game (web hoặc app) và đi qua một cửa: `window.tuTien`. Không cần tải lại hay vá file `assets/index-[hash].js` nữa: tên hàm, tên lệnh đi qua cửa này không bị nén khi build nên giữ nguyên giữa các bản.

Mới bắt đầu: đọc [huong-dan.md](huong-dan.md) (làm mod đầu tiên từng bước). File này là bảng tra cứu.

Thiết kế đầy đủ (cả phần chưa làm): gdd 60.

## Bản này có gì (`apiVersion` 1)

| Thứ | Dùng để |
|---|---|
| `tuTien.game` | mọi lệnh và view HUD đang dùng (`travelTo`, `datManh`, `shopBuy`, `newRun`, `chuanBiDotPha`…) |
| `tuTien.state()`, `tuTien.subscribe(fn)` | đọc trạng thái (`run`, `meta`), theo dõi mỗi lần đổi |
| `tuTien.content` | nội dung game đã dựng (vật phẩm, địch, sự kiện…), chỉ đọc |
| `tuTien.map` | bản đồ |
| `tuTien.pixi` | PixiJS của game (`new tuTien.pixi.Graphics()`…), để vẽ vào lớp `mapLayer` |
| `tuTien.core['<module>'].<hàm>` | cả lõi game, theo tên trong mã nguồn (xem dưới) |
| `tuTien.game.readCtx()` | `ctx` dựng trên bản sao kiếp đang chơi, để gọi hàm lõi cần `ctx` |
| `tuTien.ui.toast(text)`, `ui.confirm` | dòng báo ngắn cuối màn hình, hộp xác nhận kiểu game |
| `mod.ui.addPanel`, `addDock`, `addSlot` | khung, ô nổi, chỗ cắm trong HUD ([dưới](#giao-diện)) |
| `tuTien.register(info)`, `tuTien.mods` | khai mod, xem mod đang chạy |
| `tuTien.apiVersion`, `tuTien.gameVersion` | phiên bản cửa mở / game |
| `tuTien.on(sự kiện, fn)` | nghe việc trong game, báo sau khi hành động đã ghi ([dưới](#sự-kiện)) |
| `mod.addAction`, `tuTien.game.modAction` | hành động riêng của mod, ghi được `modData` trong save ([dưới](#hành-động-và-moddata)) |
| `mod.setBalance` | đổi hằng cân bằng, pha `boot` ([dưới](#cân-bằng)) |
| `mod.modify` | đổi kết quả công thức (sát thương, tỉ lệ đột phá, giá…), pha `boot` ([dưới](#móc-đổi-luật)) |
| `mod.addEffect`, `addCondition`, `addTickHook`, `addFinishHook` | hiệu ứng / điều kiện mới, việc chạy mỗi nhịp thế giới / khi sự kiện kết thúc, pha `boot` |
| `mod.addContent`, `ModInfo.overrides` | thêm vật phẩm, sự kiện, địch… / thay cả mục gốc, pha `boot` ([dưới](#nội-dung)) |
| `mod.patchContent` | sửa vài trường của mục đã có, pha `boot` ([dưới](#sửa-dữ-liệu-gốc)) |
| `mod.addTranslation`, `mod.addUiStrings` | bản dịch nội dung / chữ giao diện cho một ngôn ngữ, pha `boot` ([dưới](#bản-dịch-mod-ngôn-ngữ)) |
| `tuTien.assets.set` | ảnh cho vật / địch / tranh / chiêu / chân dung ([dưới](#ảnh)) |
| `tuTien.yaml` | lấy YAML của mục gốc làm mẫu, gõ trong console ([dưới](#lấy-mẫu-nội-dung-gốc)) |

Gói nhiều file (`mod.yaml`, `content/*.yaml`, `img/`, không cần JS): xem [Gói mod](#gói-mod). Cài, bật / tắt, thứ tự, tùy chọn: **Cấu hình → Mods** trong game.

`window.game`, `window.map` vẫn còn, là bí danh của `tuTien.game`, `tuTien.map`.

## Gói mod

Gói là một thư mục (nén `.zip` để cài) như mod các game khác. Mẫu đầy đủ: app/mods/example/ (bản build phát `/mod/template.zip`, kèm `tu-tien.d.ts` và `balance.md`).

```
vi_du/
  mod.yaml            id, name, version, api_version, author, description, homepage, requires, conflicts,
                      overrides, patch, balance, options, script
  main.js             tùy: JS (boot / ready); import được file khác trong gói khi đã cài trong game
  content/**.yaml     tùy: nội dung mới / thay (như addContent); content/patch/*.yaml cùng dạng khóa patch:
  img/vat|dich|man|chieu/<tên>.webp   tùy: icon vật item.<tên>, ảnh địch enemy.<tên>, tranh cảnh, icon chiêu (webp / png ≤ 1 MB)
  ui/**               tùy: css, ảnh giao diện của mod, dùng ở /mods/<id>/ui/…
```

- Không có `main.js` vẫn làm đủ thêm nội dung, sửa dữ liệu, cân bằng, ảnh. Có `main.js` thì trong đó đẩy mục cùng `id` vào `window.tuTienMods` (như userscript): game gộp `boot` / `ready` của nó với phần dữ liệu của `mod.yaml`.
- `options`: `bool` / `choice` / `number` (`min`, `max`, `step`), đọc ở `mod.options`. `files` theo giá trị: file chỉ nạp khi người chơi chọn giá trị đó.
- `requires`: mod phải bật và đứng trước; `conflicts`: bật cùng thì mod này không nạp.
- Cài: một file `.js` lẻ cũng là gói (chỉ có `main.js`). Gói cài trong game nằm trong IndexedDB của trình duyệt, chạy cả điện thoại / offline; file trong gói phục vụ ở `/mods/<id>/…` qua service worker (lần mở đầu chưa có service worker thì game tự tải lại một lần; dev server không có, chỉ `main.js` nạp được).
- App: đặt thư mục / `.zip` vào `<dữ liệu app>/mods/` (mới thấy thì tắt, bật ở màn Mods).
- Khởi động cùng mod mà hỏng thì lần sau game tự chạy không mod. `?nomods` trên địa chỉ (app: `--no-mods`) cũng vậy.

## Mod mẫu (userscript)

```js
// ==UserScript==
// @name         Mod mẫu
// @match        https://van-kiep-tu-tien.vuhaiquan2k1.workers.dev/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(window.tuTienMods ??= []).push({
  id: 'mod_mau',            // chữ thường, số, gạch dưới; không trùng mod khác
  name: 'Mod mẫu',
  version: '1.0.0',
  author: 'Tên bạn',
  apiVersion: 1,
  boot(tt, mod) {
    // Tùy: móc, cân bằng, hành động (chạy trước khi game dựng nội dung)
  },
  ready(tt, mod) {
    const s = tt.state();
    mod.log('Đang ở', s.run?.viTri);
    tt.subscribe((s, prev) => {
      if (s.run && prev.run && s.run.nhanVat.canhGioi !== prev.run.nhanVat.canhGioi) tt.ui.toast('Lên cảnh giới mới!');
    });
    // Gọi hàm lõi cần ctx: dùng readCtx (bản sao, không đụng kiếp thật)
    const ctx = tt.game.readCtx();
    if (ctx) mod.log('Thọ nguyên tối đa', tt.core['character/character'].thoNguyenToiDa(ctx.run.nhanVat));
  },
});
```

- Đẩy vào hàng đợi `window.tuTienMods` lúc nào cũng được: game chạy `ready` khi đã khởi động xong (đẩy sau đó thì chạy ngay). Không phải chờ, không phải dò `window.game`.
- Pha `boot` chạy sau khi tải nội dung, **trước** khi game dựng nội dung và kiếp: `tuTien.game`, `content`, `state` chưa có; móc, cân bằng, hiệu ứng, điều kiện chỉ đăng ký được lúc này. Userscript có `boot` phải `@run-at document-start`; nạp trễ thì game báo "nạp trễ" và chỉ chạy `ready`.
- Lỗi trong `ready` không làm sập game: console ghi lỗi, cuối màn hình báo "Mod … gặp lỗi khi khởi động".
- Viết kiểu cũ (nghe `window` event `tutien:ready`, rồi gọi `tuTien.register`) vẫn chạy.

## Quy ước

- **Ghi trạng thái chỉ bằng lệnh `tuTien.game.*`.** Lệnh đi qua `Game.act`: chạy trên bản sao, tự lưu, hoàn tác khi lỗi, chống tải lại để đổi may rủi. Sửa thẳng object trong `state()` / `content` thì không bảo đảm gì: state bất biến, lần bấm sau đè mất, có thể hỏng save.
- Hàm lõi gọi trên `readCtx()` là chạy trên bản sao: tính thử thoải mái, không lọt vào kiếp thật. Mỗi lần gọi `readCtx()` sao một lần cả kiếp, nên tính nhiều thứ thì dùng chung một `ctx`.
- Hằng cân bằng khai `export let` (vd. `core['balance/encounter'].HUNTS_PER_SLOT`) có thể đổi theo độ khó: đọc lúc cần, đừng chép ra biến lúc nạp mod.
- Cài đặt, cache của mod để `localStorage` khóa `mod:<id>:…`.
- Không có hộp cát: mod chạy như mã của game. Chỉ cài mod của người tin tưởng.

## Sự kiện

`tuTien.on(tên, fn)` trả hàm hủy. Báo **sau khi** hành động đã ghi, payload là bản sao; muốn ghi thì gọi lệnh / `modAction`. Hành động bị hoàn tác (lỗi, "chưa làm được") thì không báo.

| Sự kiện | Payload |
|---|---|
| `runStart` | `{ origin, constitution }` (xuất thân, thể chất) |
| `lifeEnd` | `{ realm, stage, cause, years }` |
| `timePass` | `{ years, year }` |
| `travel` | `{ from, to, years }` |
| `cultivationGain` | `{ source: 'be_quan' \| 'su_kien', amount }` |
| `itemGained` / `itemLost` | `{ id, count }` (vào / rời túi, gồm cất kho, bán, dùng) |
| `encounterStart` / `encounterEnd` | `{ id, slot }` / `{ id }` |
| `choiceMade` | `{ encounter, index, success? }` |
| `combatStart` / `combatEnd` | `{ enemies, rank? }` / `{ result: 'win' \| 'lose' \| 'flee', enemies }` |
| `breakthrough` | `{ realm, success, grade? }` |
| `craft` | `{ recipe, result }` |
| `sectRankChange` | `{ sect, rank }` |
| `npcRealmUp` / `npcDied` | `{ npc, realm }` |
| `worldEvent` | `{ id, slot }` (thế cục bắt đầu) |
| `notice` | `{ text, kind }` (dòng nhật ký kiếp mới) |

Listener ném lỗi thì mod bị tạm tắt (xem [Lỗi](#lỗi)).

## Hành động và `modData`

```js
boot(tt, mod) {
  mod.addAction('dem_buoc', (ctx, args, h) => {
    h.setData((h.data() ?? 0) + 1);   // run.modData.<mod_id>
    return 'khong_tick';              // không tốn thời gian: bỏ tick thế giới
  });
},
ready(tt) {
  tt.game.modAction('mod_mau', 'dem_buoc', { tuy: 'gì cũng được' });
},
```

- Hành động chạy trong giao dịch như lệnh gốc: sửa `ctx.run` như hiệu ứng, gọi được hàm lõi (`core['kernel/effects'].applyEffects`…). Lỗi thì hoàn tác cả hành động. Muốn báo người chơi "chưa làm được" mà không tính là lỗi mod: `throw new tt.core['kernel/context'].LoiNguoiChoi('lý do')`.
- Chưa mở màn chờ (trận, tiệm) từ hành động mod; muốn đánh thì dùng hiệu ứng `combat` trong sự kiện.
- `h.data()` / `h.setData(v)`: `run.modData[mod_id]` (theo kiếp); `h.metaData()` / `h.setMetaData(v)`: `meta.modData[mod_id]` (xuyên kiếp). Giá trị JSON, trần **256 KB** mỗi mod (quá 64 KB thì nhật ký mod cảnh báo); quá trần là lỗi. Gỡ mod thì dữ liệu vẫn nằm trong save, cài lại là còn.
- Chỉ ghi thứ phải đi cùng kiếp (bộ đếm, tiến độ cơ chế của mod). Cài đặt, cache, nhật ký dài để `localStorage` khóa `mod:<id>:…`: save càng lớn thì mỗi lần bấm càng chậm.
- `h.random()`: số ngẫu nhiên từ luồng riêng của mod trong kiếp (tải lại save không đổi kết quả); dùng thay `Math.random()` trong hành động, hiệu ứng, tick.
- `addAction` gọi được cả ở `ready` (mod chỉ có `ready` vẫn có hành động riêng).

## Cân bằng

```js
boot(tt, mod) {
  mod.setBalance({ 'difficulty.DIFFICULTY.enemyHealth': 1.3, 'combat.REALM_JUMP': 1.8, 'combat.ENEMY_BASE_STAT.2': 120 });
},
```

Danh sách mọi khóa kèm giá trị hiện tại và ghi chú: [balance.md](balance.md) (bản JSON: `/mod/balance.json` của mỗi bản build). Khóa sai hoặc sai kiểu thì cả phần cân bằng của mod bị bỏ, báo cuối màn hình. Hai mod cùng khóa: mod nạp sau thắng. Hằng dẫn xuất từ hằng khác không tự tính lại: đổi cả hai.

## Nội dung

```js
(window.tuTienMods ??= []).push({
  id: 'hoa_son', name: 'Hoa Sơn', version: '1.0.0',
  overrides: ['item.thiet_kiem'],               // thay cả mục gốc thì phải khai
  boot(tt, mod) {
    mod.addContent({
      'items/kiem.yaml': [
        { id: 'item.hoa_son_kiem_go', ten: 'Kiếm Gỗ Hoa Sơn', loai: 'vu_khi', gia: 30 /* …như YAML gốc */ },
        { id: 'item.thiet_kiem', ten: 'Thiết Kiếm', /* bản thay cả mục */ },
      ],
      'encounters/hoa_son.yaml': [{ id: 'ev.hoa_son_bai_su', /* … */ }],
    });
  },
});
```

- Khóa là đường dẫn như trong `app/content/` (`items/…`, `encounters/…`), giá trị là danh sách mục cùng hình YAML gốc đã parse. Cách viết từng loại: xem YAML gốc trong `app/content/` và app/content/README.md.
- Id **mới** phải dạng `<tiền tố>.<mod_id>_<tên>` (`item.hoa_son_kiem_go`). Không thêm mới được `quoc.`, `toc.` (gắn bản đồ), chỉ thay.
- Trùng id đã có (gốc hoặc mod nạp trước) mà không khai `overrides`: lỗi. Hai mod cùng thay một id: mod nạp sau thắng.
- Cờ, biến mod đặt nên mang `<mod_id>_`.
- Nội dung lỗi (sai luật id, validator báo lỗi) thì **bỏ cả phần nội dung của mod**, mod vẫn chạy phần khác; lỗi ghi vào nhật ký mod và console. Kết quả kiểm lưu theo bộ mod + bản game, lần sau không kiểm lại.
- Save ghi bộ mod có nội dung (`run.mods`). Mở save mà mod đã gỡ / tắt / nội dung hỏng: game hỏi trước khi vào; vào tiếp thì chụp save cũ rồi bỏ vật, sự kiện, người… của mod khỏi kiếp. Mod đổi bản cũng dọn id bản mới không còn. Tiến trình xuyên kiếp (Bảo lục, mở khóa…) giữ nguyên.

## Lấy mẫu nội dung gốc

Mỗi loại mục (vật, địch, chiêu, sự kiện, đơn phương, NPC…) một dạng; cách nhanh nhất là chép mục gốc gần giống rồi sửa. Gõ trong console (F12) khi game đã vào:

| Lệnh | Trả |
|---|---|
| `tuTien.yaml(id)` | YAML của mục (mảng một phần tử, dán thẳng vào file `content/`), dòng đầu `# file: …` là file gốc. Mục bị mod sửa thì là bản sau gộp, có dòng `# đã sửa bởi mod`; `tuTien.yaml(id, { original: true })` cho bản gốc. Sai id thì in id gần đúng |
| `tuTien.yaml.copy(id)` | chép vào clipboard. Gõ trong console trình duyệt hay chặn: dùng `copy(tuTien.yaml(id))` của DevTools |
| `tuTien.yaml.find(chữ, tiền tố?)` | `{ id, ten, file }[]` khớp id hoặc tên, có dấu hay không dấu; tiền tố lọc loại (`'item.'`, `'ev.'`), tối đa 50 |
| `tuTien.yaml.list(tiền tố)` | mọi id của một loại |
| `tuTien.yaml.save(tiền tố)` | tải về `<loại>.yaml` chứa mọi mục của loại đó, chia theo file gốc |

Tiền tố id theo loại: `item.` vật phẩm, `enemy.` địch, `chieu.` chiêu của địch, `ev.` sự kiện, `chain.` chuỗi sự kiện, `dp.` đơn phương luyện chế, `npc.` khuôn nhân vật, `noi.` loại nơi chốn, `loot.` bảng rơi, `origin.` xuất thân, `the_chat.` thể chất, `thanh_tuu.` thành tựu, `mo_khoa.` mở khóa Bến Vong Xuyên. Comment trong YAML gốc không còn; nhớ đổi `id` sang id của mod.

## Sửa dữ liệu gốc

```js
mod.patchContent({
  'item.thiet_kiem': { gia: 50 },
  'enemy.cuong_thi': { canh_gioi: 3, chieu: ['chieu.cuong_thi_vo'] },   // mảng thay hẳn
  'ev.kiem_mo_ven_song': { choices: { 0: { cost: { linh_thach: 20 } } } }, // khóa số: sửa phần tử đó
  'item.dan_hoi_khi': { tag: null },                                   // null: xóa trường
});
```

Chạy sau khi mọi mod đã thêm / thay, theo thứ tự nạp. Id không có thì bỏ dòng đó (cảnh báo). Không cần `overrides`.

## Bản dịch (mod ngôn ngữ)

Mod chỉ gồm chữ, không đổi luật: không khóa Tỉ thí, không vào dấu mod của save (mở save không cần mod ngôn ngữ).

- Gói `mod.yaml`: đặt file ở `i18n/<lang>/<đường dẫn như file nội dung gốc>.yaml` (`i18n/en/items/dan_duoc/hoi_khi_dan.yaml`), mã ngôn ngữ `vi` / `zh` / `en`…
- Mod viết bằng JS: `mod.addTranslation('en', { 'items/dan_duoc/hoi_khi_dan.yaml': { ... } })`.
- Mỗi file là map `id` → { đường field → chữ dịch }; đường field chấm dấu, số là vị trí trong mảng:

```yaml
ev.bq_rung_hoi_am:
  ten: Breath on the Nape
  choices.0.text: Leave seclusion and fight
  choices.1.failure.0.log: …
```

- Chỉ ghi đè chữ đã có; id hay đường field không còn trong nội dung gốc (kể cả mục của mod khác) thì bị bỏ qua và báo ở nhật ký mod. Thiếu bản dịch thì hiện tiếng Việt.
- Chỉ có hiệu lực khi người chơi chọn đúng ngôn ngữ. Thứ tự: nội dung gốc, gộp nội dung mod, bản dịch chính thức, mod ngôn ngữ (nạp sau thắng). Dịch được cả mục do mod khác thêm.
- **Chữ giao diện** (từ điển cho `t()`): `mod.addUiStrings('en', { 'Phải trị trước': 'Treat first', 'Còn {n} năm': '{n} years left' })`, hoặc file phẳng `i18n/<lang>/_ui.yaml` trong gói. Khóa là câu tiếng Việt đúng như trong game, chỗ chen biến giữ `{tên}`. Chỉ màn nào game đã chuyển sang `t()` mới dịch được (đang chuyển dần); câu thiếu giữ tiếng Việt.
- Chưa dịch được chữ do engine tự ghép (log, lý do khóa…): chờ docs/to-chuc-code.md §4.3.

## Ảnh

```js
tt.assets.set('item', 'item.hoa_son_kiem_go', 'https://…/kiem.webp');
```

Loại: `item` (id vật), `enemy` (id địch), `scene` (tranh lớn các màn: `dot-pha`, `luyen-dan`…), `skill` (hình chiêu: `dang.<dạng>`, id vật / chiêu), `portrait` (chân dung: `toc.lang`, `tu_si.kiem`, `familiar.<khuôn>.<dạng>`). `url` là `data:`, `blob:`, `https:` hoặc `/mods/<id>/…`. Thay được ảnh gốc cùng id; mod sau thắng.

## Giao diện

Mod tự vẽ DOM vào `el`; HUD lo khung, tiêu đề, đóng / mở. `mount(el, tt)` trả hàm dọn (tùy). Ném lỗi thì chỗ đó hiện "Mod lỗi", HUD chạy tiếp, nhật ký mod ghi lại.

```js
ready(tt, mod) {
  // Khung: mở từ nút nổi "Mod" (góc dưới phải) hoặc dòng của mod ở màn Mods; mod.ui.openPanel('bang') mở bằng code
  mod.ui.addPanel({ id: 'bang', title: 'Trợ Lý', mount(el, tt) {
    el.innerHTML = '<button>Đi Thanh Khê</button>';
    el.querySelector('button').onclick = () => tt.game.travelTo('…');
  } });
  // Ô dock: nằm trong nút nổi "Mod", người chơi ghim được ra ngoài. Ô gập hiện tiêu đề + setValue
  const o = mod.ui.addDock({ id: 'linh_thach', title: 'Linh thạch', mount(el, tt) {
    const ve = () => (el.textContent = tt.state().run?.nhanVat.linhThach ?? '-');
    ve();
    return tt.subscribe(ve); // hàm hủy = hàm dọn
  } });
  tt.subscribe((s) => o.setValue(String(s.run?.nhanVat.linhThach ?? '')));
  // Chỗ cắm sẵn
  mod.ui.addSlot('itemTooltip', { id: 'gia', mount: (el, tt, itemId) => (el.textContent = `id ${itemId}`) });
  mod.ui.addSlot('characterTab', { id: 'thong_ke', title: 'Thống kê', mount: (el) => (el.textContent = '…') });
  mod.ui.addSlot('placeInfo', { id: 'ghi', title: 'Ghi chú', mount: (el) => (el.textContent = '…') });
  mod.ui.addSlot('mapLayer', { id: 'mach', mount(layer, tt) { /* Pixi Container, tọa độ thế giới */ tt.map.requestRender(); } });
}
```

| Chỗ cắm | Ở đâu | Ghi chú |
|---|---|---|
| `characterTab` | tab màn Nhân vật, sau vạch | từ 3 mod gom thành một tab "Mod" có ô chọn |
| `itemTooltip` | cuối tooltip / thẻ vật | `mount(el, tt, itemId)`; tối đa 3 mod, còn lại "+n mod" |
| `placeInfo` | cuối khung nơi chốn | mỗi mod một dòng gập; `title` tùy |
| `mapLayer` | lớp Pixi trên bản đồ | `mount(layer, tt)`; vẽ xong gọi `tt.map.requestRender()` |

- `tuTien.ui.addPanel / addDock / addSlot` chỉ gọi được trong `boot` / `ready` (game cần biết mod nào gọi); gọi sau đó (trong `setTimeout`, listener…) thì dùng `mod.ui`.
- `ui.confirm({ title, text, ok })` trả `Promise<boolean>`; hộp ghi nhỏ "<tên mod> hỏi". Lệnh `tt.game.*` không tự hỏi xác nhận, nên mod tự động hóa gọi thẳng lệnh là được (không cần bấm nút của HUD).
- Thanh công cụ không có chỗ cho mod: mọi khung đi qua nút nổi "Mod".

Biến CSS của HUD (dùng `var(--…)` để hợp giao diện):

| Biến | Nghĩa |
|---|---|
| `--giay` | nền giấy |
| `--nen-hud` | nền khung HUD (giấy hơi trong) |
| `--muc`, `--muc-nhat` | chữ chính, chữ phụ |
| `--chu-do` | son đỏ (nhấn, nút chính) |
| `--vien-hud`, `--vien-muc`, `--vien-trong` | viền nhạt, viền đậm, vạch kẻ |
| `--vang-kim`, `--ngoc-luc`, `--cam-do`, `--hong-dao`, `--xam-nhat` | màu phụ (cảnh báo, tốt, đổi luật…) |
| `--co-chu` | hệ số cỡ chữ người chơi chọn (`calc(13px * var(--co-chu, 1))`) |

Lớp có sẵn: `hud-phu` (chữ phụ), `chu-do`, `nut-chinh` / `nut-phu` / `nut-nho` (nút).

## Móc đổi luật

Đăng ký ở `boot`. Modifier là hàm thuần nhận đầu vào kèm `value` (kết quả của game hoặc của mod trước), trả giá trị mới; nhiều mod cùng móc thì xâu chuỗi theo thứ tự nạp.

```js
boot(tt, mod) {
  mod.modify('damage', ({ attacker, skill, value }) => (attacker.ma === 'ta' && skill.elements.includes('hoa') ? value * 1.2 : value));
  mod.modify('price', ({ side, value }) => (side === 'sell' ? value * 1.1 : value));
},
```

| Điểm móc | Đầu vào (ngoài `value`) | Trả |
|---|---|---|
| `damage` | `attacker`, `target` (`{ ma, ten }`, người chơi `ma: 'ta'`), `skill: { id?, elements, body }` | số ≥ 0 (sát thương một đòn trước hộ thuẫn; gọi cả khi HUD vẽ nút chiêu nên phải nhẹ) |
| `statFactor` | `stat` | số (lượng cộng / trừ chỉ số gốc) |
| `breakthroughChance` | `realm` (cảnh giới đích) | số trong [0, 1] |
| `encounterWeight` | `id`, `slot` | số ≥ 0 (trọng số Đạo Diễn rút sự kiện) |
| `itemUseBlock` | `id` | chuỗi lý do chặn dùng vật, hoặc rỗng; lý do đầu tiên thắng |
| `extraMeridianSlots` | (không) | số lượt khai thông kinh mạch khi lên tiểu cảnh |
| `dropChance` | `item`, `enemy?` | số trong [0, 1] (tỉ lệ rơi món quý) |
| `price` | `item`, `side: 'buy' \| 'sell'` | số ≥ 0 (giá một món, trước làm tròn) |

Modifier không có `h.random()` và không ghi `modData`. Trả sai (NaN, ngoài khoảng) tính là lỗi.

Hiệu ứng / điều kiện mới (dùng trong nội dung của mod ở đợt sau, hoặc gọi qua `applyEffects` trong hành động): tên bắt đầu `<mod_id>_`.

```js
mod.addEffect('mod_mau_hoi_khi', (value, ctx, effect, h) => { /* sửa ctx.run */ }, { validate: (v) => (typeof v === 'number' ? undefined : 'cần số') });
mod.addCondition('mod_mau_co_dem', (value, ctx, h) => (h.data() ?? 0) >= value, { describe: (v) => `cần đếm ${v}` });
mod.addTickHook((ctx, years, h) => { /* mỗi nhịp thế giới (5 năm) */ });
mod.addFinishHook((ctx, h) => { /* ctx.run.active là sự kiện vừa xong */ });
```

Mod có móc, hiệu ứng, điều kiện, cân bằng hoặc nội dung là **mod đổi luật**: đang nạp thì Tỉ thí khóa (hai bên khác luật).

## Lỗi

- Modifier / listener sự kiện ném lỗi: bỏ kết quả lần đó, hành động chạy tiếp, **mọi móc của mod tạm tắt tới lần tải lại**, cuối màn hình báo "Mod … gặp lỗi, đã tạm tắt".
- Hành động / hiệu ứng / điều kiện / tick / finish ném lỗi: hoàn tác cả hành động và tắt mod như trên (trừ `LoiNguoiChoi`). Mod đã tắt thì hiệu ứng của nó bỏ qua, điều kiện coi như không thỏa, Đạo Diễn thôi rút sự kiện dùng hiệu ứng / điều kiện của nó.
- Báo lỗi / góp ý trong game tự kèm danh sách mod đang nạp.

## Kiểu cho TypeScript / gợi ý trong trình soạn

Mỗi bản build có `/mod/tu-tien.d.ts` (vd. `https://van-kiep-tu-tien.vuhaiquan2k1.workers.dev/mod/tu-tien.d.ts`): kiểu `TuTienApi`, `Game`, `GameState`, `Content` và từng module của lõi. Tải về cạnh file mod rồi:

```js
/// <reference path="./tu-tien.d.ts" />
/** @type {TuTienCore} */
const core = window.tuTien.core;   // gợi ý đủ tên hàm, tham số
```

So hai bản `tu-tien.d.ts` là biết bản game mới đổi gì.

## Ổn định giữa các bản

- Thứ trong bảng "Bản này có gì" giữ theo `apiVersion`: đổi / bỏ thì `apiVersion` tăng và ghi [doi-api.md](doi-api.md). Mod khai `apiVersion` cao hơn game thì không nạp.
- `game.*`, state, `core`: không cam kết, nhưng đổi tên / bỏ thì ghi [doi-api.md](doi-api.md) và một dòng trong nhật ký cập nhật. Danh sách đầy đủ hiện có ở [surface.txt](surface.txt) (game tự kiểm mỗi lần sửa).

## Chuyển Tool Trợ Lý sang `tuTien.core`

Tool Trợ Lý 6.14.2 dò ~70 hàm / hằng trong bundle bằng regex, vá chỗ khởi động rồi nạp bản sao thứ hai của game. Thay bằng bảng dưới: không còn tải `index-[hash].js`, không regex, không vá. Dò lại ngày 2026-11-04 từ mã nguồn; khóa là tên Tool đang đặt.

### Hàm

| Khóa Tool | Việc | Thay bằng | Ghi chú |
|---|---|---|---|
| eJ | mô phỏng trận | `core['combat/autoCombat'].tinhTocChien(ta, dich, req)` | trả `{ thang, nHiep, khiHuyetThapNhat, stTa, … }`; trận đang mở thì có `game.duKienTran()` |
| Vr | chỉ số nhân vật khi đánh | `core['combat/setup'].taoBenTa(nv, content)` | |
| Ga | dựng quái | `core['combat/setup'].taoBenDich(def, content, { muc })` | |
| Rt | tính kinh mạch | `core['character/kinh_mach'].tinhKinhMach(nv, content)` | bản có cache (Tool đang dò lại hàm bọc này) |
| Tp | khuôn kinh mạch | `core['character/kinh_mach'].docKhuon` | |
| xo | lưới kinh mạch | `core['character/kinh_mach'].khuonCua(content, nv)` | chú ý thứ tự tham số |
| al | ô của mảnh | `core['character/kinh_mach'].oCuaManh(k, m, it)` | |
| Jh | kiểm tra chỗ đặt | `core['character/kinh_mach'].kiemTraDat(nv, content, m, boQua = -1)` | |
| kR | tỉ lệ đột phá | `core['progress/dot_pha'].chuanBiDotPha` | hoặc `game.chuanBiDotPha(lc)` |
| Hon | Tàng Kinh Các | `core['progress/tong_mon'].hangTong` | |
| wr | điều kiện thăng cấp | `core['progress/tong_mon'].thieuDeThangCap` | |
| Kn | sư môn | `core['progress/tong_mon'].tongMonCua` | |
| ke | thọ nguyên | `core['character/character'].thoNguyenToiDa(nv)` | |
| Rsn | đối thủ khảo hạch | `core['progress/tournament'].trialOpponent(ctx, slot, nextRank)` | mới export ở bản này |
| ko | quái từ nhân vật | `core['character/npc'].timDich(ctx, id)` | |
| Qn | tên cảnh giới | `core['kernel/realms'].tenCanhGioi(cg, tieu)` | |
| mf | thời gian đi đường | `core['world/travel'].travelYears(ctx, to)` | |
| Nin | tiện ích ở một nơi | `core['encounter/director'].placeActivities(ctx, slot)` | trả `{ id, loai }[]`, lấy `.map((h) => h.id)`; chưa chắc khớp hẳn cách Tool dùng, thử trước |
| H1 | hàng trong tiệm | `core['encounter/shop/market'].shelfStock(ctx, encounterId, slotId)` | |
| rn | bảng cảnh giới | `core['kernel/realms'].canhGioi` | |
| fn | bộ số ngẫu nhiên | `core['kernel/rng'].Rng` | class, có `Rng.fromSeed` |
| No | tên cấp bậc tông môn | `core['balance/sect'].CAP_BAC` | |
| E1 | giá mua | `core['world/phong_tho'].giaMua(ctx, itemId, goc?, extra = 0)` | |
| IP | giá bán | `core['world/phong_tho'].giaBan(ctx, itemId, goc?, banThem = 0)` | |
| gP | vùng đã khám phá | `core['world/suong'].slotDaMo(ctx, slot)` | |
| jd | điểm luân hồi khi hết kiếp | `core['progress/luan_hoi'].tinhDiemKiep` | |
| vx | bảng Thiên Kiêu | `core['character/nhan_vat'].xepBang` | |
| to | thông tin bế quan | `core['progress/be_quan'].chuanBiBeQuan(ctx, rieng, formation)` | |
| qw | tu vi còn thiếu | `core['progress/be_quan'].retreatTargetGain(ctx, lc)` | mới export ở bản này |
| Nb | tu vi theo số năm | `core['progress/be_quan'].retreatGain(ctx, cb, lc, years)` | mới export ở bản này |
| Di | tốc độ tu luyện | `core['character/character'].tocDoTuLuyen(nv, content)` | |
| sy | năm lĩnh ngộ | `core['character/kinh_mach'].namLinhNgo(it, ngoTinh = 0)` | |
| xl | hệ số lĩnh ngộ | `core['character/kinh_mach'].masteryMult(nv, itemId)` | |
| lt | chỉ số nhân vật (ngộ tính) | `core['character/stats'].effectiveStat(nv, key, content, meridian?)` | |
| qo | hệ số phẩm theo cảnh giới | `core['character/pham'].gradeMult(it, realm)` | |
| jan | thi nghề | `core['progress/luyen_che'].phanBoKhaoHach` | |
| bb | điều kiện thi nghề | `core['progress/luyen_che'].thieuDeKhaoHach` | |
| Lu | luyện chế | `core['progress/luyen_che'].chuanBiLuyen` | hoặc `game.chuanBiLuyen(lc)` |
| Pw | điểm luyện chế | `core['progress/luyen_che'].nguonDiemGoc` | mới export ở bản này |
| Rrn | bảng treo thưởng | `core['world/bounty'].bangTreoThuong(ctx, bang?, loai?)` | |
| KI | bổng lộc | `core['progress/tong_mon'].bongLoc` | |
| KS | tiến cử | `core['progress/tong_mon'].tienCuDuoc(ctx)` | mới export ở bản này |
| Uen | ước lượng trận (mức hiểm) | `core['encounter/choice_risk'].revealedCombatRisk(ctx, v, e)` | trả mức hiểm thật kèm `hidden: true` khi thần thức không dò ra (thay cho việc vá thêm cờ `an`); HUD vẫn chỉ báo `unknown` |
| c2n | tạo kiếp mới | `core['kernel/run'].createRun(env, meta, opts)` | hoặc `game.newRun(opts)` |
| lF | chợ ngập hàng | `core['world/market_glut'].glutRoom(ctx, item)` | |
| ua | độ nguy hiểm: chênh cấp | `core['encounter/do_hiem'].doChenh(env, run, slot)` | |
| is | độ nguy hiểm: mức | `core['encounter/do_hiem'].mucHiem(chenh)` | |
| bmGv | chi phí tế luyện bản mệnh | `core['character/natal'].refineQuote(nv, item)` | |
| bmUp | chi phí nâng giai | `core['character/natal'].ascendQuote(nv, n)` | |
| bmChk | kiểm tra tế luyện | `core['character/natal'].refineBlock(nv, item)` | |
| bmHl | món làm bản mệnh | `core['character/natal'].natalItemError` | |
| bmUpChk | kiểm tra nâng giai | `core['character/natal'].ascendBlock(nv)` | |
| bmTmp | kiểm tra huyết luyện | `core['character/natal'].temperBlock(nv)` | |
| bmDev | ứng viên văn khi nuốt | `core['progress/natal_act'].devourCandidates(ctx, itemId)` | trả `string[]` hoặc lý do chặn |
| bmDevChk | kiểm tra nuốt món | `core['progress/natal_act'].devourItemError(ctx, itemId)` | mới export ở bản này |
| bmIn | văn bẩm sinh của món | `core['character/natalRunes'].innateRuneOf(item)` | |

### Hằng

| Khóa Tool | Việc | Thay bằng |
|---|---|---|
| PO | ngưỡng chặn giữa đường | `core['balance/encounter'].AMBUSH_MIN_DISTANCE` |
| rare.dH | tỉ lệ rơi hiếm theo phẩm | `core['balance/combat'].RARE_DROP_CHANCE` |
| rare.rank | hệ số theo mức quái | `core['balance/combat'].RARE_DROP_RANK_FACTOR` |
| săn cạn: số lần | | `core['balance/encounter'].HUNTS_PER_SLOT` |
| săn cạn: năm hồi một lần | | `core['balance/encounter'].HUNT_RECOVERY_YEARS` |
| `K.bmRune` | trị số văn bản mệnh | `core['balance/natal'].NATAL_RUNE_VALUE` |

`K.bm` (đọc theo thứ tự trong `readBmConsts`) thay bằng tên hằng trong `core['balance/natal']`:

- `realmMin` `NATAL_MIN_REALM`, `gradeMin` `NATAL_MIN_GRADE`, `gradeMax` `NATAL_MAX_GRADE`, `pickMax` `NATAL_MAX_BASE_GRADE`
- `teYears` `NATAL_REFINE_YEARS`, `teEss` `NATAL_ESSENCE_YEARS`, `upEss` `NATAL_ASCEND_YEARS`, `hoaYears` `NATAL_RELEASE_YEARS`, `tempEss` `NATAL_TEMPER_YEARS`
- `stone` `NATAL_REFINE_COST`, `runeStone` `NATAL_ENGRAVE_COST`, `reserve` `NATAL_LIFESPAN_GUARD`
- `ess` `NATAL_CRAFT_ESSENCE_MULT`, `fail` `NATAL_CRAFT_FAIL`, `byp` `NATAL_CRAFT_BYPRODUCT`, `failEss` `NATAL_FAIL_ESSENCE_RATIO`
- `tier` `NATAL_TIER_EXP`, `mult` `NATAL_GRID_MULT`, `slotT` `NATAL_SLOTS_BY_TIER`, `slotMax` `NATAL_MAX_SLOTS`
- `winExp` `NATAL_EXP_WIN`, `winGap` `NATAL_WIN_REALM_GAP`, `seatRate` `NATAL_EXP_YEAR`, `seatCap` `NATAL_EXP_YEAR_CAP`, `breakExp` `NATAL_EXP_BREAKTHROUGH`, `tempExp` `NATAL_EXP_TEMPER`, `tempMax` `NATAL_TEMPER_PER_REALM`, `loseKeep` `NATAL_LOSS_RATIO`, `upCap` `NATAL_GRADE_CAP`, `upExp` `NATAL_ASCEND_EXP`
- `runeLv` `NATAL_RUNE_LEVEL_POINTS`
- `devourMax` `NATAL_DEVOUR_PER_YEAR`, `weakGap` `NATAL_DEVOUR_LOW_GAP`, `weakMul` `NATAL_DEVOUR_LOW_RATIO`, `newGap` `NATAL_LEARN_GAP`, `cand` `NATAL_RUNE_CANDIDATES`

`rare.nhanHo` (0,4) Tool đang ghi cứng, không đọc từ game.

### Bỏ được

- Tải `index-[hash].js`, ~70 regex, `patchBoot`, `import(blob:)` bản sao: không cần nữa. Bản sao thứ hai chạy song song từng là chỗ dễ lệch với game thật (hai bộ nội dung, hai bộ hằng).
- Bấm thẳng nút `.hud-xac-nhan-nut` để qua hộp xác nhận: tạm vẫn phải làm; cờ bỏ qua hộp xác nhận cho lệnh từ mod ở đợt sau (gdd 60 §9).
