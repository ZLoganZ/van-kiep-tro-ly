/**
 * Module: Khởi Động Mod Chính Thức & Tích Hợp Giao Diện Game (MOD.ui.addPanel)
 * Đã loại bỏ hoàn toàn chế độ Tampermonkey Stealth Standalone, đăng ký trực tiếp qua window.tuTienMods.
 */
/* ═══════════════ KHỞI ĐỘNG TRỢ LÝ & ĐĂNG KÝ MOD GAME ═══════════════ */
UI.onSectionChange(function (name) {
  if (name === "tl") Assist.render();
  else Assist.stop();
});

UI.onOpenChange(function (open) {
  if (!open) Assist.stop();
});

if (UI.isOpen() && UI._section === "tl") {
  Assist.render();
}

/* Đăng ký bảng điều khiển vào nút nổi “☯ Mod” chính thức của game */
if (MOD && MOD.ui && typeof MOD.ui.addPanel === "function") {
  try {
    MOD.ui.addPanel({
      id: "tro_ly",
      title: "Vạn Kiếp Tu Tiên Tool · Trợ Lý (v" + TOOL_VER + ")",
      mount: function (el) {
        el.innerHTML =
          '<p class="hud-phu">Trợ Lý tính toán &amp; Tự Động theo dữ liệu lõi game: Nhân Vật, Kinh Mạch 4.0, Đột Phá, Dị Bảo &amp; Auto Săn Dị Bảo (Nghịch Thiên P8), Siêu AI Tác Chiến 3.0, Biệt Đội Late Game, Ngự Linh, Luân Hồi, Hướng Build…</p>' +
          '<button class="nut-chinh" type="button">☯ Mở Vạn Kiếp Trợ Lý</button>';
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
    console.error("[van_kiep_tro_ly] addPanel error:", e);
  }
}

NhatKy.init();
