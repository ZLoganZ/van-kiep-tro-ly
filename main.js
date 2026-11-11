/**
 * main.js - Vạn Kiếp Tu Tiên Tool · Trợ Lý (v7.23.2)
 * Tác giả: LoganZ · Kỹ Sư
 * Kiến trúc: Multi-module ES Architecture (Chuẩn Mod Chính Thức window.tuTienMods apiVersion: 1)
 */

// 1. Tiện ích nền tảng, CSS & Giao diện khung (UI Shell)
import { gWin, TOOL_VER, setGameContext } from "./src/core/utils.js";
import "./src/styles/ui-css.js";
import { UI } from "./src/ui/shell.js";
import "./src/data/static-data.js";

// 2. Cầu nối lõi game (tuTien.core), Context Memoization & Mô phỏng trận
import "./src/core/bridge.js";

// 3. Các Module Tính Toán & Giao Diện Chức Năng
import "./src/modules/kinh-mach-engine.js";
import { Assist } from "./src/modules/navigation.js";
import { initDiBaoWatchers } from "./src/modules/di-bao.js";
import "./src/modules/kinh-mach-tab.js";
import "./src/modules/dot-pha-nghe.js";
import "./src/modules/ban-do-dia-danh.js";
import "./src/modules/ngu-linh.js";
import "./src/modules/huong-build.js";
import "./src/modules/tra-cuu.js";

// 4. Hệ Thống Tự Động (Auto) & Siêu AI Tác Chiến 3.0
import "./src/auto/auto-core.js";
import "./src/auto/combat-ai.js";
import "./src/auto/auto-kinh-mach.js";
import "./src/auto/auto-tu-luyen.js";
import "./src/auto/auto-di-bao.js";
import "./src/auto/auto-buon-ban.js";
import "./src/auto/auto-reroll.js";
import "./src/auto/auto-runner.js";
import "./src/auto/auto-tabs.js";

// 5. Biệt Đội Late Game, Luân Hồi / Save & Nhật Ký Cập Nhật
import "./src/modules/biet-doi-late-game.js";
import "./src/modules/luan-hoi-save.js";
import { NhatKy } from "./src/modules/nhat-ky.js";

let _modBooted = false;

function runTroLy(tt, mod) {
  setGameContext(tt, mod);

  if (_modBooted && gWin.__vkxMerged) {
    try {
      gWin.__vkxMerged.open();
    } catch (e) {}
    return;
  }
  _modBooted = true;
  gWin.__vkxMerged = UI;

  // Trợ Lý: chỉ tính toán khi đang xem tab Trợ Lý; Nhật Ký chỉ khởi tạo (Lazy Init) khi mở tab Nhật Ký
  UI.onSection(function (name, open) {
    if (!open) return;
    if (name === "tl") {
      Assist.render();
    } else {
      Assist.stop();
      if (name === "nk" && NhatKy && typeof NhatKy.init === "function") {
        NhatKy.init();
      }
    }
  });

  UI.onOpenChange(function (open) {
    if (!open) Assist.stop();
  });

  if (UI.isOpen()) {
    if (UI._section === "tl") Assist.render();
    else if (
      UI._section === "nk" &&
      NhatKy &&
      typeof NhatKy.init === "function"
    ) {
      NhatKy.init();
    }
  }

  // Khởi động bộ theo dõi Dị Bảo & HUD Tác Chiến sau khi đã nhận đối tượng `tt` từ game
  initDiBaoWatchers();

  // Gắn khung “Trợ Lý” vào nút nổi Mod của game (MOD.ui.addPanel)
  if (mod && mod.ui && typeof mod.ui.addPanel === "function") {
    try {
      mod.ui.addPanel({
        id: "tro_ly",
        title: "Vạn Kiếp Tu Tiên Tool · Trợ Lý",
        mount(el) {
          el.innerHTML =
            '<p class="hud-phu">Trợ Lý tính toán theo dữ liệu game: kinh mạch, đột phá, kiếm lời, tra cứu, Dị Bảo, Ngự Linh, Luân Hồi…</p><button class="nut-chinh" type="button">Mở Trợ Lý</button>';
          const btn = el.querySelector("button");
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
}

// Đăng ký Mod chính thức vào hệ thống Mod của Vạn Kiếp Tu Tiên (window.tuTienMods)
(gWin.tuTienMods ??= []).push({
  id: "van_kiep_tro_ly",
  name: "Vạn Kiếp Tu Tiên Tool · Trợ Lý",
  version: TOOL_VER,
  author: "LoganZ · Kỹ Sư",
  apiVersion: 1,
  ready(tt, mod) {
    runTroLy(tt || gWin.tuTien, mod);
  },
});
