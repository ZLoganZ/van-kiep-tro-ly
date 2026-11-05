# Đổi API cho mod

Mỗi lần đổi / bỏ thứ mod dùng (`window.tuTien`, `game.*`, state, `core`) ghi một dòng ở đây, mới nhất ở trên. Đổi phần trong bảng "Bản này có gì" của [README](tai-lieu-api.md) thì tăng `apiVersion` (`app/src/game/mod/gate.ts`). Thêm mới không cần ghi.

## apiVersion 1 (2026-11-04)

- Thêm `tuTien.pixi` (PixiJS của game) cho mod vẽ lớp `mapLayer`; mod mẫu dùng đủ 4 chỗ cắm.
- Đợt 4 phần nạp (thêm, không tăng `apiVersion`): gói `mod.yaml` + `content/` + `img/` + `main.js`, cài trong game (IndexedDB), thư mục `mods/` của app; `ModInfo.description`; `mod.options` nhận giá trị người chơi chọn; lõi `core['mod/manifest']` (`parseManifest`, `optionValues`, `excludedByOptions`).

- Bản dịch (thêm, không tăng `apiVersion`): `mod.addTranslation(lang, files)`, `mod.addUiStrings(lang, strings)`, gói `i18n/<lang>/` (+ `_ui.yaml`); nằm ngoài `hasContent` / dấu mod.
- Đợt 3 (thêm, không tăng `apiVersion`): `mod.addContent`, `mod.patchContent`, `ModInfo.overrides`, `tuTien.assets.set`; `run.mods` / `meta.mods`; `game.missingMods`, `game.dropMissingMods()`, `game.modReport`; lõi `core['mod/merge']`, `core['mod/stamp']`, `core['mod/prune']`.

- Mở `window.tuTien`: `game`, `state`, `subscribe`, `content`, `map`, `core`, `ui.toast`, `register`, hàng đợi `window.tuTienMods` (pha `ready`).
- Thêm `game.readCtx()`, `core['encounter/choice_risk'].revealedCombatRisk`.
- Export thêm cho Tool Trợ Lý: `progress/tournament.trialOpponent`, `progress/be_quan.retreatTargetGain`, `progress/be_quan.retreatGain`, `progress/luyen_che.nguonDiemGoc`, `progress/tong_mon.tienCuDuoc`, `progress/natal_act.devourItemError`.
