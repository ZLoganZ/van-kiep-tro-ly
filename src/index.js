/**
 * Module: Khởi Động Mod Chính Thức & Tích Hợp Giao Diện Game (MOD.ui.addPanel)
 * Đã loại bỏ hoàn toàn chế độ Tampermonkey Stealth Standalone, đăng ký trực tiếp qua window.tuTienMods.
 */
/* ═══════════════ KHỞI ĐỘNG TRỢ LÝ & ĐĂNG KÝ MOD GAME ═══════════════ */
gWin.__vkxMerged = UI;

/* Trợ Lý: chỉ tính toán khi đang xem tab Trợ Lý; rời tab / đóng cửa sổ thì dừng. */
UI.onSection(function (name, open) {
  if (!open) return;
  if (name === "tl") Assist.render();
  else Assist.stop();
});

UI.onOpenChange(function (open) {
  if (!open) Assist.stop();
});

if (UI.isOpen() && UI._section === "tl") {
  Assist.render();
}

/* Khung “Trợ Lý” trong nút nổi Mod của game */
if (MOD && MOD.ui && typeof MOD.ui.addPanel === "function") {
  try {
    MOD.ui.addPanel({
      id: "tro_ly",
      title: "Vạn Kiếp Tu Tiên Tool · Trợ Lý",
      mount: function (el) {
        el.innerHTML =
          '<p class="hud-phu">Trợ Lý tính toán theo dữ liệu game: kinh mạch, đột phá, kiếm lời, tra cứu, Dị Bảo, Ngự Linh, Luân Hồi…</p><button class="nut-chinh" type="button">Mở Trợ Lý</button>';
        var btn = el.querySelector("button");
        if (btn) {
          btn.onclick = function () {
            try {
              UI.open();
            } catch (e) {
              console.error(e);
            }
          };
        }
      },
    });
  } catch (e) {
    console.error("[tro_ly] addPanel", e);
  }
}

NhatKy.init();
