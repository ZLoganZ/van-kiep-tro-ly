import { gWin, num, esc, yrs, safeYrs, fold } from "../core/utils.js";
import { UI } from "../ui/shell.js";
import { S, body, loadCore, G, C, HUD, ctxLite, realmName, has, dangerTag } from "../core/bridge.js";
import { errBox, progressHtml, bindProgress } from "../modules/navigation.js";
import { DIBAO, scanDiBao, placeName, findSlotByDiaDanh, checkOwnedRelic, scanMapActiveDiBao, checkCanTeleport, smartTeleportTo, calcDiBaoPity } from "../modules/di-bao.js";
import { ddDoTravel } from "../modules/ban-do-dia-danh.js";
import { AU_KT, auMauLabel, AU, auSave, auCall } from "./auto-core.js";
import { _lastAiDecisionText, updateCombatOverlay } from "./combat-ai.js";
import { auHuntSpots, auSkipColor, auHuntPower } from "./auto-tu-luyen.js";
import { auPlanTrade } from "./auto-buon-ban.js";
import { auReadCfg, auFld, auHiemSel, auTocSel, auTTSel, auControls, auBind, auMauHtml } from "./auto-runner.js";
/**
 * Module: Giao Diện Các Tab Tự Động (Auto Tu Luyện, Auto Tác Chiến, Auto Săn Dị Bảo, Auto Buôn Bán)
 */
// ═════════ TAB AUTO TU LUYỆN & ĐỘT PHÁ (atl) ═════════
function tabAutoTuLuyen() {
  const c = AU.cfg.tl;
  const isDanhQuai = c.mode === "danh_quai";
  body.innerHTML = `
    <div class="vk-card"><h3>Auto Tu Luyện & Đột Phá</h3>
      <div class="vk-mu" style="font-size:13px">
Tự động hóa hoàn toàn chu trình tu tiên: <b>Tích Lũy Tu Vi (Bế Quan hoặc Đánh Quái) → Đột Phá Xung Kích → Trấn Áp Tâm Ma → Lên Cảnh Giới Tiếp Theo</b>.
Hỗ trợ 2 phương thức tu luyện: <b>Bế Quan Nhập Định</b> (tự tính số năm tối ưu, nuốt đan tu luyện và đan phá bình cảnh) hoặc <b>Đánh Quái Săn Yêu</b> (tự động tới các bãi hoang dã quanh đây để săn yêu quái cày tu vi). Khi tu vi chạm trần hoặc Đại Viên Mãn, Tool tự động chọn combo đan có <b>tỉ lệ đột phá cao nhất</b>, kiểm tra ngưỡng an toàn, xung kích và dùng <b>Siêu AI Tác Chiến VIP</b> hạ gục Tâm Ma!
      </div>
      <label style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin:8px 0;font-size:13.5px">
<span><b>Phương Thức Tu Luyện (Tích Tu Vi)</b></span>
<select class="vk-sel" id="au-tl-mode" style="width:190px;font-weight:700">
  <option value="be_quan" ${!isDanhQuai ? "selected" : ""}>🧘 Bế Quan (Nhập Định)</option>
  <option value="danh_quai" ${isDanhQuai ? "selected" : ""}>⚔️ Đánh Quái (Săn Yêu)</option>
</select>
      </label>
      <label style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin:6px 0;font-size:13px">
<span><b>Mục Tiêu Đại Cảnh Giới</b></span>
<select class="vk-sel" id="au-tl-realm" style="width:190px;font-weight:600">
  <option value="0" ${c.targetRealm === 0 ? "selected" : ""}>♾️ Không Giới Hạn (Farm Liên Tục)</option>
  <option value="1" ${c.targetRealm === 1 ? "selected" : ""}>Luyện Khí</option>
  <option value="2" ${c.targetRealm === 2 ? "selected" : ""}>Trúc Cơ</option>
  <option value="3" ${c.targetRealm === 3 ? "selected" : ""}>Kim Đan (Kết Đan)</option>
  <option value="4" ${c.targetRealm === 4 ? "selected" : ""}>Nguyên Anh</option>
  <option value="5" ${c.targetRealm === 5 || c.targetRealm == null ? "selected" : ""}>Hóa Thần (Đỉnh Nhân Giới)</option>
</select>
      </label>
      <label id="au-tl-sub-realm-wrap" style="display:${c.targetRealm === 0 ? "none" : "flex"};justify-content:space-between;align-items:center;gap:8px;margin:6px 0;font-size:13px">
<span><b>Mục Tiêu Tiểu Cảnh Giới</b></span>
<select class="vk-sel" id="au-tl-sub-realm" style="width:190px">
  <option value="-1" ${c.targetSubRealm === -1 ? "selected" : ""}>Bất kỳ (Chạm cảnh giới là đạt)</option>
  <option value="0" ${c.targetSubRealm === 0 ? "selected" : ""}>Sơ kỳ</option>
  <option value="1" ${c.targetSubRealm === 1 ? "selected" : ""}>Trung kỳ</option>
  <option value="2" ${c.targetSubRealm === 2 ? "selected" : ""}>Hậu kỳ</option>
  <option value="3" ${c.targetSubRealm === 3 || c.targetSubRealm == null ? "selected" : ""}>Đại viên mãn</option>
  <option value="4" ${c.targetSubRealm === 4 ? "selected" : ""}>Đại viên mãn (Tu vi đầy 100%)</option>
</select>
      </label>
      ${auFld("au-tl-rate", "Tỉ Lệ Đột Phá An Toàn Tối Thiểu", c.minSafeRate, "(%)")}
      ${auFld("au-tl-tho", "Dừng Khi Thọ Nguyên Còn Dưới", c.minTho, "(năm)")}
      ${auTocSel(c.toc)}

      <!-- KHỐI TÙY CHỌN BẾ QUAN -->
      <div id="au-tl-be-quan-box" style="display:${!isDanhQuai ? "block" : "none"};border:1px solid rgba(255,255,255,0.08);background:rgba(255,255,255,0.02);border-radius:6px;padding:8px 10px;margin:8px 0">
<div style="font-weight:700;color:var(--acc);margin-bottom:6px">⚙️ Cài Đặt Bế Quan (Nhập Định)</div>
<label style="display:flex;gap:6px;align-items:center;margin:6px 0;font-size:13px"><input type="checkbox" id="au-tl-cult-pills" ${c.useCultPills !== false ? "checked" : ""}> Tự nuốt Đan Tu Luyện trong túi khi bế quan</label>
<label style="display:flex;gap:6px;align-items:flex-start;margin:6px 0;font-size:13px"><input type="checkbox" id="au-tl-song-tu" ${c.autoSongTu !== false ? "checked" : ""} style="margin-top:3px"><span><b>❤️ Tự Động Song Tu Cùng Đạo Lữ (Hồi Chiêu 5 Năm · +5% Tu Vi/Lần)</b> <span class="vk-mu" style="font-size:11px">(Khi có Đạo Lữ và hồi chiêu 5 năm hoàn tất, Auto sẽ tự động thực hiện Song Tu 1 năm để nhận lượng lớn tu vi, giảm 5 điểm Tâm Ma và thắt chặt tình cảm)</span></span></label>
      </div>

      <!-- KHỐI TÙY CHỌN ĐÁNH QUÁI (SĂN YÊU) -->
      <div id="au-tl-danh-quai-box" style="display:${isDanhQuai ? "block" : "none"};border:1px solid rgba(255,255,255,0.08);background:rgba(255,255,255,0.02);border-radius:6px;padding:8px 10px;margin:8px 0">
<div style="font-weight:700;color:var(--acc);margin-bottom:6px">⚔️ Cài Đặt Đánh Quái (Săn Yêu Thú Cày Tu Vi)</div>
<label class="vk-row" style="margin:6px 0"><span><b>Mục Tiêu Săn Yêu:</b></span>
  <select class="vk-sel" id="au-tl-san-target" style="width:230px;font-weight:600">
    <option value="uu_tien_dau_dan" ${c.sanMucTieu === "uu_tien_dau_dan" || !c.sanMucTieu ? "selected" : ""}>👑 Ưu Tiên Lùng Đầu Đàn (Tu Vi x3 · Rơi x1.5 · Tự lùi nếu nguy)</option>
    <option value="thuong" ${c.sanMucTieu === "thuong" ? "selected" : ""}>🐾 Chỉ Săn Yêu Thường (An toàn · 1 lượt)</option>
    <option value="chi_dau_dan" ${c.sanMucTieu === "chi_dau_dan" ? "selected" : ""}>🔥 Chỉ Săn Đầu Đàn (Bỏ qua thú thường)</option>
  </select>
</label>
${auFld("au-tl-maxy", "Mỗi Chặng Đi Tối Đa", c.maxY != null ? c.maxY : 3, "(năm)")}
<div style="margin:8px 0 4px">${auMauHtml(c.mau || ["an_toan", "ngang_suc", "hiem"], "au-tl-mau")}</div>
${auFld("au-tl-tran", "Dừng Sau Số Trận (0 = không giới hạn, đánh tới khi viên mãn)", c.tran != null ? c.tran : 20)}
${auTTSel(c.thuong != null ? c.thuong : 2, "au-tl-thuong")}
<label style="display:flex;gap:6px;align-items:flex-start;margin:6px 0;font-size:13px"><input type="checkbox" id="au-tl-auto-duong-thuong" ${c.autoDuongThuong !== false ? "checked" : ""} style="margin-top:3px"><span><b>🩺 Tự Động Trị Thương & Tĩnh Dưỡng (Không dừng Auto)</b> <span class="vk-mu" style="font-size:11px">(Tự nuốt đan dược chữa thương trong túi; nếu hết đan sẽ tự động bế quan ngắn 1 năm để vết thương tự lành lặn và tích thêm tu vi, sau đó tiếp tục đi săn)</span></span></label>
<label style="display:flex;gap:6px;align-items:flex-start;margin:6px 0;font-size:13px"><input type="checkbox" id="au-tl-uu-tien-cap-nen" ${c.uuTienCapNen !== false ? "checked" : ""} style="margin-top:3px"><span><b>🎯 Ưu Tiên Bãi Săn Sát Cảnh Giới Nhân Vật (Tối Ưu Tu Vi)</b> <span class="vk-mu" style="font-size:11px">(Chọn bãi hoang dã có cấp cảnh giới sát nhân vật nhất để nhận được lượng tu vi lớn nhất mỗi trận)</span></span></label>
<label style="display:flex;gap:6px;align-items:flex-start;margin:6px 0;font-size:13px"><input type="checkbox" id="au-tl-nehac" ${c.neHac !== false ? "checked" : ""} style="margin-top:3px"><span><b>Tránh Đánh Các Loại Hạc (Giữ Khí Vận)</b> <span class="vk-mu" style="font-size:11px">(Bạch Hạc Linh, Thanh Vũ Ấu Hạc... tự chọn Bỏ Đi khi gặp để không bị trừ Khí Vận)</span></span></label>
<label style="display:flex;gap:6px;align-items:flex-start;margin:6px 0;font-size:13px"><input type="checkbox" id="au-tl-danh-ai" ${c.danhAi !== false ? "checked" : ""} style="margin-top:3px"><span><b>Tự Đánh AI Khi Không Cho Tốc Chiến (Trận Thắng)</b> <span class="vk-mu" style="font-size:11px">(Dùng Siêu AI VIP tự đánh khi game khóa nút Tốc Chiến)</span></span></label>
<label style="display:flex;gap:6px;align-items:flex-start;margin:6px 0;font-size:13px"><input type="checkbox" id="au-tl-tu-vi-events" ${c.uuTienSuKienTuVi !== false ? "checked" : ""} style="margin-top:3px"><span><b>⚡ Ưu Tiên Tham Gia Sự Kiện Tăng Tu Vi (Kỳ Ngộ, Bí Cảnh, Di Tích, Song Tu...)</b> <span class="vk-mu" style="font-size:11px">(Khi phát hiện sự kiện / kỳ ngộ / bí cảnh / Song Tu quanh đây có thể nhận nhiều tu vi, Auto sẽ ưu tiên tới tham gia trước khi săn quái để tối ưu tốc độ tu luyện)</span></span></label>
<label style="display:flex;gap:6px;align-items:center;margin:6px 0;font-size:13px"><input type="checkbox" id="au-tl-kt" ${c.kt ? "checked" : ""}> Kiểm Tra Sức Trước Khi Chạy (thắng chắc từ ${Math.round(AU_KT * 100)}% yêu thú mẫu)</label>
<button class="vk-btn sec" id="au-tl-chk-hunt" style="margin-top:6px;width:100%">🔍 Xem Sức Đánh & Các Bãi Săn Quanh Đây</button>
<div id="au-tl-hunt-info" style="margin-top:6px"></div>
      </div>

      <!-- KHỐI ĐỘT PHÁ & AN TOÀN CHUNG -->
      <hr style="border:0;border-top:1px dashed var(--line);margin:10px 0">
      <div style="font-weight:700;color:var(--acc);margin-bottom:6px">🛡️ Đột Phá & Xử Trí An Toàn</div>
      <label style="display:flex;gap:6px;align-items:flex-start;margin:6px 0;font-size:13px"><input type="checkbox" id="au-tl-bottleneck" ${c.autoBreakBottleneck !== false ? "checked" : ""} style="margin-top:3px"><span><b>💊 Tự Động Uống Đan Phá Bình Cảnh Khi Chạm Nấc (Cả Bế Quan & Đánh Quái)</b> <span class="vk-mu" style="font-size:11px">(Khi tu vi chạm bình cảnh tiểu cảnh giới, nếu có Phá Chướng Đan, Toái Bích Đan, Thông Huyền Đan, Phá Hư Đan, Khai Khiếu Châu... trong túi sẽ tự động uống để lập tức thăng cấp)</span></span></label>
      <label style="display:flex;gap:6px;align-items:center;margin:6px 0;font-size:13px"><input type="checkbox" id="au-tl-break-pills" ${c.useBreakPills !== false ? "checked" : ""}> Tự chọn combo Đan Đột Phá có tỉ lệ cao nhất</label>
      <label style="display:flex;gap:6px;align-items:center;margin:6px 0;font-size:13px"><input type="checkbox" id="au-tl-demons" ${c.autoBeatDemons !== false ? "checked" : ""}> Tự đánh trấn áp Tâm Ma / Quái quấy bế quan (dùng Siêu AI VIP)</label>
      <label style="display:flex;gap:6px;align-items:center;margin:6px 0;font-size:13px"><input type="checkbox" id="au-tl-auto-tha" ${c.autoThaMang !== false ? "checked" : ""}> <b>Tự Động Tha Mạng Đối Thủ Bại Trận (xu_tri):</b> Tự tha mạng cho trộm cắp / kẻ đột kích động phủ khi bế quan, tránh bị dừng Auto</label>
      <label style="display:flex;gap:6px;align-items:center;margin:6px 0;font-size:13px"><input type="checkbox" id="au-tl-enemy-escape" ${c.autoEnemyEscape !== false ? "checked" : ""}> <b>Buông Tha Kẻ Tháo Chạy (enemy_escape):</b> Tự động chọn «Buông Tha / Bỏ Qua» khi kẻ địch tháo chạy, không dừng Auto</label>
      ${auControls()}
    </div>
    <div class="vk-card"><h3>Tiến Trình</h3><div id="au-st"></div></div>
    <div class="vk-card"><h3>Nhật Ký</h3><div id="au-lg"></div></div>`;
  auBind("tl");

  const modeSel = body.querySelector("#au-tl-mode");
  if (modeSel) {
    modeSel.onchange = () => {
      const isDq = modeSel.value === "danh_quai";
      const bqBox = body.querySelector("#au-tl-be-quan-box");
      const dqBox = body.querySelector("#au-tl-danh-quai-box");
      if (bqBox) bqBox.style.display = !isDq ? "block" : "none";
      if (dqBox) dqBox.style.display = isDq ? "block" : "none";
      auReadCfg("tl");
    };
  }

  const rSel = body.querySelector("#au-tl-realm");
  if (rSel) {
    rSel.onchange = () => {
      const val = Number(rSel.value);
      const subWrap = body.querySelector("#au-tl-sub-realm-wrap");
      if (subWrap) subWrap.style.display = val === 0 ? "none" : "flex";
      auReadCfg("tl");
    };
  }

  const chkBtn = body.querySelector("#au-tl-chk-hunt");
  if (chkBtn) {
    chkBtn.onclick = () => {
      auReadCfg("tl");
      const box = body.querySelector("#au-tl-hunt-info");
      try {
        const c2 = ctxLite(),
          cfg = AU.cfg.tl,
          pw = auHuntPower();
        const spots = auHuntSpots(c2, cfg, null).slice(0, 10);
        box.innerHTML =
          (pw
            ? `<div class="vk-mu" style="font-size:13px;margin:8px 0">Cảnh giới <b>${esc(pw.realm)}</b>: thắng chắc <b>${pw.win}</b> · có thể thắng ${pw.maybe} · dễ thua ${pw.lose} (trên ${pw.n} yêu thú mẫu).</div>`
            : '<div class="vk-mu" style="font-size:13px;margin:8px 0">Chưa đo được sức (thiếu dữ liệu yêu thú hoặc hàm mô phỏng).</div>') +
          (spots.length
            ? `<table class="vk-t"><tr><th>Nơi</th><th>Cấp Nền</th><th>Đường</th><th>Lượt Săn</th></tr>${spots.map((x) => `<tr><td>${esc(placeName(c2, x.slot))}<br>${dangerTag(x.d)}</td><td>${realmName(x.capNen || 0)} (Cấp ${x.capNen || 0})</td><td>${yrs(x.y)}</td><td>${Math.floor(x.left)}</td></tr>`).join("")}</table>`
            : '<div class="vk-mu" style="font-size:13px">Không có nơi hoang dã nào thuộc màu đã chọn (' +
              esc(auMauLabel(cfg.mau)) +
              ") trong bán kính đã đặt.</div>") +
          (() => {
            const sk = auSkipColor(c2, cfg, null);
            return sk
              ? `<div class="vk-mu" style="font-size:12px;margin-top:6px">Bỏ qua ${sk} nơi hoang dã ngoài màu đã chọn (Auto không tới).</div>`
              : "";
          })();
      } catch (e) {
        box.innerHTML = errBox(e);
      }
    };
  }
}

// ═════════ TAB SIÊU AI TÁC CHIẾN 3.0 (atc) ═════════
function tabAutoTacChien() {
  const c = AU.cfg.tc;
  const row = (lab, ctl) =>
    `<label style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin:6px 0;font-size:13px"><span>${lab}</span>${ctl}</label>`;
  const sel = (id, lab, opts, v) =>
    row(
      lab,
      `<select class="vk-sel" id="${id}" style="width:245px">${opts.map(([k, t]) => `<option value="${esc(k)}" ${String(v) === String(k) ? "selected" : ""}>${esc(t)}</option>`).join("")}</select>`,
    );

  const lastBattle = gWin.__vkLastCombat;
  const lastBattleHtml = lastBattle
    ? `<div style="margin-top:6px;padding:8px 11px;border-radius:10px;background:var(--bg3);border:1px solid var(--line);font-size:12.5px">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px">
          <span><b>📊 Trận Gần Nhất (${esc(lastBattle.time)}):</b> ${lastBattle.kq === "thang" ? '<b class="vk-ok">🏆 Chiến Thắng</b>' : '<b class="vk-bad">💀 Thất Bại / Rút Lui</b>'} sau <b>${lastBattle.hiep || 1}</b> hiệp</span>
          <span class="vk-mu">🤖 ${esc(_lastAiDecisionText)}</span>
        </div>
        ${
          lastBattle.dich && lastBattle.dich.length
            ? `<div class="vk-mu" style="margin-top:4px;font-size:12px">Đối thủ: ${lastBattle.dich.map((d) => `<b>${esc(d.ten)}</b> (${Math.max(0, d.hp || 0)}/${d.maxHp || "?"} HP)`).join(" · ")}</div>`
            : ""
        }
      </div>`
    : `<div class="vk-mu" style="font-size:12px;margin-top:4px">🤖 Trạng thái AI hiện tại: <b>${esc(_lastAiDecisionText)}</b></div>`;

  body.innerHTML = `
    <div class="vk-card">
      <h3>⚔️ Siêu AI Tác Chiến 3.0 (Bộ Não Chiến Thuật 5 Pha)</h3>
      <div class="vk-mu" style="font-size:13px">
Điều phối toàn diện <b>5 pha tác chiến chuẩn</b>: <i>Sinh Tồn Khẩn Cấp ➔ Khống Chế Ngắt Nộ ➔ Dàn Trận &amp; Buff/Phá Giáp ➔ Đại Chiêu Khắc Hệ &amp; Chống Tràn Sát Thương ➔ Dệt Quyền Cước 0 Mana</i>.
Áp dụng đồng bộ cho: <b>Thanh HUD trong trận</b>, <b>Auto Săn Yêu</b>, <b>Auto Dị Bảo</b>, <b>Tháp Vô Nhai Uyên</b> và <b>Độ Kiếp Tâm Ma</b>.
      </div>
      ${lastBattleHtml}
      <div style="margin-top:10px">
<div style="font-size:12px;font-weight:700;color:var(--acc);margin-bottom:6px">⚡ Bộ Cài Đặt Chiến Thuật Nhanh (1-Click Presets):</div>
<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(155px,1fr));gap:6px">
  <button class="vk-btn sec" data-tc-preset="balanced" style="padding:7px 9px;font-size:12px">⚖️ Cân Bằng Thực Chiến</button>
  <button class="vk-btn sec" data-tc-preset="boss" style="padding:7px 9px;font-size:12px">👑 Quyết Chiến Boss / Độ Kiếp</button>
  <button class="vk-btn sec" data-tc-preset="farm" style="padding:7px 9px;font-size:12px">💰 Cày Quái Tiết Kiệm</button>
  <button class="vk-btn sec" data-tc-preset="tank" style="padding:7px 9px;font-size:12px">🛡️ Thiết Bích Cầu Sinh</button>
</div>
      </div>
      <hr style="border:0;border-top:1px dashed var(--line);margin:10px 0">
      <label style="display:flex;gap:6px;align-items:center;margin:6px 0;font-size:13.5px"><input type="checkbox" id="au-tc-overlay" ${c.autoCombatOverlay !== false ? "checked" : ""}> <b>Hiển Thị Thanh HUD Chiến Thuật Nổi [⚔️ Siêu AI 3.0] Trong Trận (Kéo Thả &amp; Thu Gọn Được)</b></label>
      <label style="display:flex;gap:6px;align-items:center;margin:6px 0;font-size:13px"><input type="checkbox" id="au-tc-auto-in-combat" ${c.autoInCombat ? "checked" : ""}> Tự động bật Tự Đánh ngay khi vừa bước vào trận đấu</label>
      ${sel(
"au-tc-ai-mode",
"🧠 Chế Độ Bộ Não AI (AI Engine)",
[
  ["smart_v3", "🌟 Siêu AI 3.0 (Chuỗi 5 Pha Toàn Diện — Khuyên dùng)"],
  ["aggressive", "🔥 Tổng Công Kích Tốc Chiến (Dồn sát thương tối đa)"],
  [
    "defensive",
    "🛡️ Vững Như Bàn Thạch (Ưu tiên Khiên, Hồi Phục & Khóa)",
  ],
  ["game_core", "⚙️ AI Mặc Định Của Game (nextAutomatedAction)"],
],
c.aiEngineMode || "smart_v3",
      )}
      ${sel(
"au-tc-item-policy",
"🎒 Chính Sách Tiêu Hao Đan Dược & Phù Lục",
[
  ["auto", "✅ Tự Động Thông Minh (Theo cấu hình chi tiết bên dưới)"],
  ["boss_only", "👑 Chỉ Dùng Khi Gặp Boss / Tinh Anh (Hoặc HP < 20%)"],
  [
    "save_all",
    "🔒 Khóa Toàn Bộ Đan & Phù (Tiết kiệm 100% khi cày quái)",
  ],
],
c.itemPolicy || "auto",
      )}
      ${sel(
"au-tc-speed",
"⏱ Tốc Độ Nhịp Đánh Trong Trận",
[
  ["normal", "⏱ Tiêu Chuẩn (200ms — Quan sát rõ từng chiêu)"],
  ["fast", "🚀 Nhanh Mượt (80ms — Cân bằng tốc độ & hiệu ứng)"],
  ["instant", "⚡ Siêu Tốc (15ms — Xả toàn bộ combo tức thì)"],
],
c.speed || "normal",
      )}
      ${sel(
"au-tc-target-prio",
"🎯 Chiến Thuật Chọn Mục Tiêu (Targeting)",
[
  ["smart", "🧠 Tối Ưu Chiến Thuật (Dứt điểm nhanh + Diệt hồi máu/nộ)"],
  [
    "boss",
    "👑 Ưu Tiên Trùm / Thủ Lĩnh (Dồn sát thương Boss & Tinh Anh)",
  ],
  [
    "threat",
    "⚡ Ưu Tiên Mối Đe Dọa (Kẻ đang tụ đại chiêu / Triệu hồi)",
  ],
  [
    "weakest",
    "🎯 Diệt Kẻ Yếu Trước (Hạ nhanh quái thấp máu giảm sát thương)",
  ],
  [
    "counter",
    "🔥 Tương Khắc Ngũ Hành (Nhắm mục tiêu bị khắc hệ ×1.35)",
  ],
],
c.targetPrio || "smart",
      )}
      ${sel(
"au-tc-te-huyet",
"🩸 Tế Huyết Bản Mệnh (Đốt Thọ Nguyên & Khí Huyết)",
[
  ["off", "⛔ Tắt (Mặc định — Bảo toàn thọ nguyên tuyệt đối)"],
  [
    "boss",
    "👑 Chỉ Khi Gặp Boss / Kẻ Địch Mạnh (Xả sát thương bộc phát)",
  ],
  ["emergency", "🚨 Chỉ Khi Nguy Cấp (Khí huyết < 35% trước Boss)"],
  ["always", "🔥 Luôn Dùng (Mỗi trận 1 lần — Cảnh báo: Rất hao thọ)"],
],
c.teHuyetMode || "off",
      )}
    </div>

    <div class="vk-card">
      <h3>💊 Chiến Thuật Cắn Đan Dược Chi Tiết (Hồi Huyết · Linh Lực · Bộc Phát)</h3>
      <div class="vk-mu" style="font-size:12.5px;margin-bottom:6px">
Tự động tính chính xác lượng hồi sau khi trừ <b>Dược Kháng</b> (<code>estimatePillRestore</code>), khớp số viên cần uống để không lãng phí (<code>pillWasted</code>), và phân tách giới hạn phẩm đan giữa <b>Quái Thường</b> và <b>Boss</b>.
      </div>
      ${sel(
"au-tc-heal-mode",
"❤️ Chế Độ Cắn Đan Hồi Khí Huyết",
[
  ["smart", "🧠 Thông Minh (Tự nâng ngưỡng khi địch tụ Đại Chiêu)"],
  [
    "boss_only",
    "👑 Chỉ Đánh Boss / Tinh Anh (Hoặc khi nguy kịch < 18%)",
  ],
  ["always", "⚡ Luôn Cắn Theo Ngưỡng Cố Định"],
  ["off", "⛔ Tắt Tự Cắn Đan Hồi Huyết"],
],
c.healPillMode || "smart",
      )}
      ${auFld("au-tc-heal-hp", "Ngưỡng Máu Tự Cắn Đan Thường", c.healHpThreshold != null ? c.healHpThreshold : 35, "(% HP)")}
      ${auFld("au-tc-heal-panic-hp", "Ngưỡng Máu An Toàn Trước Đại Chiêu Boss", c.healBossPanicHp != null ? c.healBossPanicHp : 55, "(% HP — tự cắn đan sớm khi địch tụ nộ)")}
      ${sel(
"au-tc-spirit-mode",
"💧 Chế Độ Cắn Đan Hồi Linh Lực (Mana)",
[
  ["on_demand", "🧠 Khi Dưới Ngưỡng HOẶC Khi Cần Linh Lực Xuất Chiêu"],
  ["threshold_only", "📉 Chỉ Khi % Linh Lực Tụt Dưới Ngưỡng"],
  ["boss_only", "👑 Chỉ Cắn Đan Linh Lực Khi Đánh Boss / Tinh Anh"],
  ["off", "⛔ Tắt Tự Cắn Đan Linh Lực"],
],
c.spiritPillMode || "on_demand",
      )}
      ${auFld("au-tc-spirit-mp", "Ngưỡng Linh Lực Tự Cắn Đan Hồi Khí", c.spiritThreshold != null ? c.spiritThreshold : 20, "(% Linh Lực)")}
      ${sel(
"au-tc-burst-mode",
"🔥 Chế Độ Cắn Đan Bộc Phát (Tăng Sát Thương)",
[
  [
    "boss_combo",
    "🎯 Chuẩn Combo Boss (Gặp Boss + Có sẵn chiêu mạnh + Địch >30% HP)",
  ],
  ["boss_any", "👑 Gặp Boss / Tinh Anh Là Cắn Ngay Đầu Trận"],
  ["always", "⚔️ Dùng Ở Mọi Trận Đấu Khi Có Chiêu"],
  ["off", "⛔ Tắt Đan Bộc Phát"],
],
c.burstPillMode || "boss_combo",
      )}
      ${auFld("au-tc-max-resist", "Trần Dược Kháng Tối Đa Cho Phép", c.maxDrugResistance != null ? c.maxDrugResistance : 70, "(% Kháng — tự vượt trần nếu máu < 20%)")}
      ${auFld("au-tc-pill-grade-norm", "Phẩm Đan Tối Đa Khi Đánh Quái Thường", c.maxPillGradeNormal != null ? c.maxPillGradeNormal : 4, "(1: Phàm → 8: Nghịch Thiên — giữ đan quý)")}
      ${auFld("au-tc-pill-grade", "Phẩm Đan Tối Đa Khi Đánh Boss / Tâm Ma", c.maxPillGrade != null ? c.maxPillGrade : 6, "(1: Phàm → 8: Nghịch Thiên)")}
      <label style="display:flex;gap:6px;align-items:center;margin:6px 0;font-size:13px"><input type="checkbox" id="au-tc-cleanse-pill" ${c.cleansePillMode !== false ? "checked" : ""}> <b>Tự Dùng Đan Giải Độc / Thanh Tâm / Hộ Thể:</b> Xóa chồng độc, xuất huyết, thiêu đốt hoặc uống đan khiên khi nguy cấp</label>
    </div>

    <div class="vk-card">
      <h3>🧧 Chiến Thuật Dùng Phù Lục &amp; Trận Bàn Chi Tiết</h3>
      <div class="vk-mu" style="font-size:12.5px;margin-bottom:6px">
Điều phối chính xác thời điểm dán <b>Phù Hộ Thuẫn</b>, ném <b>Phù Khống Chế</b> ngắt đại chiêu, đan xen <b>Phù Công Kích Khắc Hệ</b> sau khi đã Phá Giáp, và khai triển <b>Trận Bàn</b>.
      </div>
      ${sel(
"au-tc-shield-tal-mode",
"🛡️ Chế Độ Dùng Phù Hộ Thuẫn (Giáp Phù)",
[
  [
    "predictive",
    "🧠 Dự Báo Đỡ Đòn (Khi địch tụ Đại Chiêu hoặc HP dưới ngưỡng)",
  ],
  ["always_keep", "🛡️ Luôn Duy Trì Lớp Khiên Phù Mỗi Khi Cạn"],
  ["boss_only", "👑 Chỉ Dùng Phù Hộ Thuẫn Trước Boss / Tinh Anh"],
  ["off", "⛔ Tắt Phù Hộ Thuẫn"],
],
c.shieldTalismanMode || "predictive",
      )}
      ${auFld("au-tc-shield-hp", "Ngưỡng Máu Tự Dán Phù Hộ Thuẫn", c.shieldHpThreshold != null ? c.shieldHpThreshold : 55, "(% HP khi chưa có khiên)")}
      ${sel(
"au-tc-cc-tal-mode",
"⛓️ Chế Độ Dùng Phù Khống Chế (Định Thân / Choáng)",
[
  [
    "interrupt",
    "⚡ Ngắt Đại Chiêu & Khóa Boss (Khi địch tụ nộ / Boss / HP < 48%)",
  ],
  ["boss_lock", "👑 Khóa Chặt Boss / Tinh Anh Ngay Khi Hết Miễn Khống"],
  ["emergency", "🚨 Chỉ Dùng Cứu Mạng Khi Máu Nguy Kịch (< 42% HP)"],
  ["always", "❄️ Luôn Dùng Khi Địch Chưa Bị Khống Chế"],
  ["off", "⛔ Tắt Phù Khống Chế"],
],
c.ccTalismanMode || "interrupt",
      )}
      ${sel(
"au-tc-atk-tal-mode",
"🗡️ Chế Độ Ném Phù Công Kích (Sát Thương 0 Mana)",
[
  [
    "smart_weave",
    "🧠 Đan Xen Thông Minh (Sau khi xả chiêu vào Boss / Khi hết mana / Kết liễu)",
  ],
  [
    "zero_mana",
    "💧 Tiết Kiệm: Chỉ Ném Khi Cạn Linh Lực Hoặc Toàn Bộ Chiêu Đang Hồi",
  ],
  [
    "boss_burst",
    "👑 Dồn Sát Thương Boss: Xả Phù Khắc Hệ Tối Đa Vào Boss / Tinh Anh",
  ],
  ["always", "🔥 Luôn Ném Ở Mọi Trận Đấu"],
  ["off", "⛔ Tắt Phù Công Kích"],
],
c.atkTalismanMode || "smart_weave",
      )}
      ${auFld("au-tc-talisman-grade-norm", "Phẩm Phù Tối Đa Khi Đánh Quái Thường", c.talismanGradeNormal != null ? c.talismanGradeNormal : 4, "(1: Phàm → 8: Nghịch Thiên)")}
      ${auFld("au-tc-talisman-grade", "Phẩm Phù Tối Đa Khi Đánh Boss / Tâm Ma", c.talismanGrade != null ? c.talismanGrade : 6, "(1: Phàm → 8: Nghịch Thiên)")}
      ${sel(
"au-tc-formation-mode",
"阵 Chế Độ Khai Triển Trận Bàn (bay_tran)",
[
  [
    "boss_or_danger",
    "🧠 Khi Gặp Boss/Tinh Anh Hoặc Khi Nguy Hiểm (HP < 65% / Địch >= 2)",
  ],
  ["boss_only", "👑 Chỉ Bày Trận Khi Gặp Boss / Tinh Anh"],
  ["always", "⚡ Luôn Bày Trận Đầu Mọi Trận Đấu"],
  ["off", "⛔ Tắt Tự Động Bày Trận Bàn"],
],
c.formationMode || "boss_or_danger",
      )}
    </div>

    <div class="vk-card">
      <h3>⚡ AI Dùng Chiêu Thông Minh &amp; Phối Hợp Liên Hoàn</h3>
      ${auFld("au-tc-heal-skill-hp", "Ngưỡng Máu Dùng Kỹ Năng Hồi Phục", c.healSkillThreshold != null ? c.healSkillThreshold : 75, "(% HP — tự hồi máu bằng chiêu)")}
      ${auFld("au-tc-shield-skill-hp", "Ngưỡng Khiên Duy Trì Kỹ Năng Hộ Thuẫn", c.shieldSkillThreshold != null ? c.shieldSkillThreshold : 40, "(% so với HP tối đa)")}
      <label style="display:flex;gap:6px;align-items:center;margin:6px 0;font-size:13px"><input type="checkbox" id="au-tc-combo" ${c.comboSequence !== false ? "checked" : ""}> <b>Chuỗi Liên Hoàn 5 Bước:</b> Buff Bộc Phát ➔ Phá Giáp / Ấn Ký ➔ Đại Chiêu Khắc Hệ / Kích Nổ ➔ Quyền Cước</label>
      <label style="display:flex;gap:6px;align-items:center;margin:6px 0;font-size:13px"><input type="checkbox" id="au-tc-prevent-overkill" ${c.preventOverkill !== false ? "checked" : ""}> <b>Chống Tràn Sát Thương (Anti-Overkill):</b> Tự chọn chiêu nhỏ tốn ít mana để kết liễu quái sắp chết, giữ lại Đại Chiêu</label>
      <label style="display:flex;gap:6px;align-items:center;margin:6px 0;font-size:13px"><input type="checkbox" id="au-tc-aoe-prio" ${c.aoePriority !== false ? "checked" : ""}> <b>Ưu Tiên Kỹ Năng Quần Thể (AoE):</b> Tự động ưu tiên chiêu diện rộng khi giao chiến với từ 2 kẻ địch trở lên</label>
      <label style="display:flex;gap:6px;align-items:center;margin:6px 0;font-size:13px"><input type="checkbox" id="au-tc-natal-prio" ${c.prioritizeNatal !== false ? "checked" : ""}> <b>Rèn Tâm Huyết Bản Mệnh:</b> Đảm bảo xuất chiêu Pháp Bảo Bản Mệnh ít nhất 1 lần mỗi trận (sau khi bật Buff)</label>
      <label style="display:flex;gap:6px;align-items:center;margin:6px 0;font-size:13px"><input type="checkbox" id="au-tc-smart-finisher" ${c.smartFinisher !== false ? "checked" : ""}> <b>Dứt Điểm 0 Mana Bằng Quyền Cước:</b> Hạ gục ngay mục tiêu tàn huyết không khiên bằng đòn đánh thường miễn phí</label>
      <label style="display:flex;gap:6px;align-items:center;margin:6px 0;font-size:13px"><input type="checkbox" id="au-tc-normal-attack" ${c.autoNormalAttack !== false ? "checked" : ""}> <b>Luôn Dệt Quyền Cước (danh_thuong) Mỗi Hiệp:</b> Đánh thường miễn phí sau khi tung hết chiêu để tối đa sát thương</label>
    </div>

    <div class="vk-card">
      <h3>🚨 Bảo Vệ Ngự Linh · Thoát Hiểm &amp; Xử Trí Hậu Chiến</h3>
      <label style="display:flex;gap:6px;align-items:center;margin:6px 0;font-size:13px"><input type="checkbox" id="au-tc-familiars" ${c.saveFamiliars !== false ? "checked" : ""}> <b>Bảo Vệ Ngự Linh Khẩn Cấp (thu_hoi):</b> Tự động thu hồi linh thú khi máu tụt xuống dưới ngưỡng</label>
      ${auFld("au-tc-recall-pet-hp", "Ngưỡng Máu Thu Hồi Ngự Linh", c.recallPetHp != null ? c.recallPetHp : 25, "(% HP Ngự Linh)")}
      <label style="display:flex;gap:6px;align-items:center;margin:6px 0;font-size:13px"><input type="checkbox" id="au-tc-thieu-dot" ${c.emergencyThieuDot !== false ? "checked" : ""}> <b>Thiêu Đốt Thọ Nguyên Cứu Mạng (thieu_dot):</b> Kích hoạt nghịch thiên phản kích khi máu chạm ngưỡng tử vong</label>
      ${auFld("au-tc-thieu-dot-hp", "Ngưỡng Máu Kích Hoạt Thiêu Đốt", c.thieuDotHp != null ? c.thieuDotHp : 20, "(% HP)")}
      <label style="display:flex;gap:6px;align-items:center;margin:6px 0;font-size:13px"><input type="checkbox" id="au-tc-emergency-escape" ${c.emergencyEscape ? "checked" : ""}> <b>Độn Thổ Thoát Thân Khẩn Cấp (bo_chay):</b> Tự dùng Thái Hư Độn Phù hoặc Huyết Độn đào tẩu trước khi tử trận</label>
      ${auFld("au-tc-escape-hp", "Ngưỡng Máu Kích Hoạt Độn Thổ Thoát Thân", c.escapeHp != null ? c.escapeHp : 16, "(% HP)")}
      <label style="display:flex;gap:6px;align-items:center;margin:6px 0;font-size:13px"><input type="checkbox" id="au-tc-auto-tha" ${c.autoThaMang !== false ? "checked" : ""}> <b>Tự Động Tha Mạng Đối Thủ Bại Trận (xu_tri):</b> Tự chọn «Tha Mạng» khi đối thủ quy phục để không ngắt mạch Auto</label>
      <label style="display:flex;gap:6px;align-items:center;margin:6px 0;font-size:13px"><input type="checkbox" id="au-tc-enemy-escape" ${c.autoEnemyEscape !== false ? "checked" : ""}> <b>Buông Tha Kẻ Tháo Chạy (enemy_escape):</b> Tự chọn «Buông Tha» (nhặt nửa chiến lợi phẩm) khi địch bỏ chạy</label>
      <button class="vk-btn" id="au-tc-save" style="margin-top:10px;width:100%">💾 Lưu Cấu Hình Siêu AI Tác Chiến 3.0</button>
    </div>`;

  // Xử lý 4 nút Preset Chiến Thuật 1-Click
  body.querySelectorAll("[data-tc-preset]").forEach((btn) => {
    btn.onclick = () => {
      const p = btn.dataset.tcPreset;
      if (p === "balanced") {
        Object.assign(AU.cfg.tc, {
          aiEngineMode: "smart_v3",
          itemPolicy: "auto",
          targetPrio: "smart",
          healPillMode: "smart",
          healHpThreshold: 35,
          healBossPanicHp: 55,
          spiritPillMode: "on_demand",
          spiritThreshold: 20,
          burstPillMode: "boss_combo",
          maxPillGradeNormal: 4,
          maxPillGrade: 6,
          shieldTalismanMode: "predictive",
          shieldHpThreshold: 55,
          ccTalismanMode: "interrupt",
          atkTalismanMode: "smart_weave",
          talismanGradeNormal: 4,
          talismanGrade: 6,
          formationMode: "boss_or_danger",
          preventOverkill: true,
          aoePriority: true,
          comboSequence: true,
        });
        UI.notify("⚖️ Đã áp dụng Preset: Cân Bằng Thực Chiến!");
      } else if (p === "boss") {
        Object.assign(AU.cfg.tc, {
          aiEngineMode: "smart_v3",
          itemPolicy: "auto",
          targetPrio: "boss",
          healPillMode: "smart",
          healHpThreshold: 45,
          healBossPanicHp: 65,
          spiritPillMode: "on_demand",
          spiritThreshold: 30,
          burstPillMode: "boss_combo",
          maxPillGradeNormal: 6,
          maxPillGrade: 8,
          shieldTalismanMode: "predictive",
          shieldHpThreshold: 65,
          ccTalismanMode: "boss_lock",
          atkTalismanMode: "boss_burst",
          talismanGradeNormal: 6,
          talismanGrade: 8,
          formationMode: "always",
          teHuyetMode: "boss",
          preventOverkill: true,
          aoePriority: true,
          comboSequence: true,
        });
        UI.notify("👑 Đã áp dụng Preset: Quyết Chiến Boss / Độ Kiếp!");
      } else if (p === "farm") {
        Object.assign(AU.cfg.tc, {
          aiEngineMode: "smart_v3",
          itemPolicy: "boss_only",
          targetPrio: "weakest",
          healPillMode: "boss_only",
          healHpThreshold: 25,
          healBossPanicHp: 45,
          spiritPillMode: "boss_only",
          spiritThreshold: 15,
          burstPillMode: "off",
          maxPillGradeNormal: 2,
          maxPillGrade: 5,
          shieldTalismanMode: "boss_only",
          ccTalismanMode: "emergency",
          atkTalismanMode: "off",
          talismanGradeNormal: 2,
          talismanGrade: 5,
          formationMode: "boss_only",
          teHuyetMode: "off",
          preventOverkill: true,
          aoePriority: true,
          comboSequence: true,
        });
        UI.notify("💰 Đã áp dụng Preset: Cày Quái Tiết Kiệm!");
      } else if (p === "tank") {
        Object.assign(AU.cfg.tc, {
          aiEngineMode: "defensive",
          itemPolicy: "auto",
          targetPrio: "threat",
          healPillMode: "smart",
          healHpThreshold: 50,
          healBossPanicHp: 70,
          spiritPillMode: "on_demand",
          spiritThreshold: 25,
          burstPillMode: "boss_combo",
          maxPillGradeNormal: 4,
          maxPillGrade: 7,
          shieldTalismanMode: "always_keep",
          shieldHpThreshold: 70,
          ccTalismanMode: "interrupt",
          atkTalismanMode: "smart_weave",
          formationMode: "boss_or_danger",
          healSkillThreshold: 85,
          shieldSkillThreshold: 55,
          emergencyThieuDot: true,
          emergencyEscape: true,
        });
        UI.notify("🛡️ Đã áp dụng Preset: Thiết Bích Cầu Sinh!");
      }
      auSave();
      updateCombatOverlay();
      tabAutoTacChien();
    };
  });

  body.querySelectorAll("input,select").forEach((el) => {
    el.onchange = () => {
      auReadCfg("tc");
      updateCombatOverlay();
    };
  });
  const sBtn = body.querySelector("#au-tc-save");
  if (sBtn)
    sBtn.onclick = () => {
      auReadCfg("tc");
      updateCombatOverlay();
      UI.notify("✅ Đã lưu cấu hình Siêu AI Tác Chiến 3.0.");
    };
}

// ═════════ TAB AUTO SĂN DỊ BẢO (asdb) ═════════
function tabAutoSdb() {
  const c = AU.cfg.sdb;
  const g = G(),
    run = g && g.state && g.state.run,
    nv = run && run.nhanVat;
  const sc = run ? scanDiBao([run, g.state.meta]) : null;
  const cLite = ctxLite();

  const safeYrs = (y) =>
    typeof yrs === "function"
      ? yrs(y)
      : y < 0.05
        ? "ngay đây"
        : num(y) + " năm";

  const validEvs = DIBAO.ev.filter(
    (e) => e && e.relic && typeof e.relic === "string" && e.relic.trim() !== "",
  );
  const selectedRelics = (
    Array.isArray(c.targetRelics)
      ? c.targetRelics
      : validEvs.map((e) => e.relic)
  ).filter((r) => r && typeof r === "string" && r.trim() !== "");
  const selSet = new Set(selectedRelics);

  const isOwnedItem = (id) => checkOwnedRelic(id, run, sc);
  const metaRelicsSet =
    sc && sc.metaRelics instanceof Set
      ? sc.metaRelics
      : new Set(
          (g &&
            g.state &&
            g.state.meta &&
            g.state.meta.tienLo &&
            g.state.meta.tienLo.relics) ||
            [],
        );

  const pity =
    run && nv && sc ? calcDiBaoPity(run, nv, sc, selectedRelics) : null;

  // Thống kê nhanh
  const totalRelics = validEvs.length;
  const ownedCount = validEvs.filter((e) =>
    isOwnedItem(e.relic),
  ).length;
  const metaCount = validEvs.filter((e) =>
    metaRelicsSet.has(e.relic),
  ).length;
  const baoLucPoints = metaRelicsSet.size * 5;

  // Quét Dị Bảo thực tế đang nở trên thế giới
  const activeMap = scanMapActiveDiBao(run, cLite);
  const onMapList = [];
  if (run && run.nam != null) {
    for (const item of activeMap.values()) {
      const ev = item.ev || DIBAO.evMap.get(item.encId);
      if (!ev) continue;
      if (item.hetHanNam !== undefined && item.hetHanNam <= run.nam)
        continue;
      const relInf = DIBAO.rel[ev.relic] || {};
      let y = Infinity;
      try {
        y = S.core.travelYears(cLite, item.slot);
      } catch (e) {}
      onMapList.push({
        item,
        ev,
        relInf,
        slot: item.slot,
        y,
        rem:
          item.hetHanNam != null
            ? Math.max(0, Math.floor(item.hetHanNam - run.nam))
            : null,
      });
    }
  }

  // Khối 1: Live Radar & Bản Đồ Săn Bảo
  let radarHtml = "";
  if (onMapList.length > 0) {
    radarHtml = `
      <div style="background:linear-gradient(145deg,rgba(255,51,102,0.15),var(--bg3));border:1px solid #ff3366;border-radius:10px;padding:10px 12px;margin-bottom:10px;box-shadow:0 0 12px rgba(255,51,102,0.22)">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:6px;margin-bottom:8px">
          <div style="display:flex;align-items:center;gap:6px">
            <span class="do-radar-pulse" style="width:10px;height:10px;border-radius:50%;background:#ff3366;box-shadow:0 0 8px #ff3366;display:inline-block"></span>
            <b style="color:#ff3366;font-size:13px">🔥 PHÁT HIỆN ${onMapList.length} DỊ BẢO ĐANG XUẤT THẾ TRÊN MAP!</b>
          </div>
          <span style="font-size:11px;color:var(--mut)">Tự động bay/truyền tống</span>
        </div>
        <div style="display:flex;flex-direction:column;gap:6px">
          ${onMapList
            .map((m) => {
              const isTgt = selSet.has(m.ev.relic);
              const willHunt = isTgt || c.sanMoiDiBaoXuatThe !== false;
              const canTele = checkCanTeleport(String(m.slot));
              const pName = placeName(cLite, m.slot);
              return `
              <div style="background:var(--bg2);border:1px solid var(--line);border-radius:8px;padding:7px 10px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px">
                <div>
                  <div style="display:flex;align-items:center;gap:6px">
                    <b style="font-size:13px;color:var(--txt)">${esc(m.relInf.ten || m.ev.relic)}</b>
                    ${isTgt ? '<span class="vk-ok" style="font-size:10.5px;font-weight:700;padding:1px 6px;border-radius:4px;background:rgba(61,220,151,0.15);border:1px solid var(--acc)">🎯 Mục Tiêu</span>' : willHunt ? '<span style="color:#3ddc97;font-size:10.5px;font-weight:700;padding:1px 6px;border-radius:4px;background:rgba(61,220,151,0.1)">⚡ Săn Ngay</span>' : '<span class="vk-mu" style="font-size:10.5px">○ Bỏ Qua</span>'}
                  </div>
                  <div class="vk-mu" style="font-size:11.5px;margin-top:2px">
                    📍 <b>${esc(pName)}</b> (Slot ${m.slot}) · Hạn: <b>${m.rem != null ? m.rem + " năm" : "—"}</b> · Đường: <b>${safeYrs(m.y)}</b>
                  </div>
                </div>
                <div style="display:flex;gap:4px">
                  ${canTele ? `<button type="button" class="vk-btn mini au-sdb-action-tele" data-slot="${m.slot}" style="background:#3ddc97;color:#05140d;margin:0;padding:3px 8px;font-size:11px;font-weight:700">⚡ Truyền Tống</button>` : ""}
                  <button type="button" class="vk-btn mini sec au-sdb-action-travel" data-slot="${m.slot}" style="margin:0;padding:3px 8px;font-size:11px">🚀 Bay Tới</button>
                </div>
              </div>
            `;
            })
            .join("")}
        </div>
      </div>
    `;
  } else if (pity) {
    const hasCamping = pity.topCamping && pity.topCamping.length > 0;
    radarHtml = `
      <div style="background:var(--bg3);border:1px solid var(--line);border-radius:10px;padding:10px 12px;margin-bottom:10px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;flex-wrap:wrap;gap:4px">
          <div style="display:flex;align-items:center;gap:6px">
            <span style="font-size:14px">⏳</span>
            <b style="font-size:12.5px;color:#f59e0b">Thiên Đạo Bù Dị Bảo (Pity 500 Năm):</b>
          </div>
          <span style="font-size:12px">
            ${pity.guaranteed ? '<b class="vk-ok" style="color:#ef4444">🔥 ĐÃ ĐỦ 500 NĂM — 100% LƯỢT KẾ XUẤT THẾ (Rơi: 7%)</b>' : `Đã tích lũy: <b>${pity.waitYears} / 500 năm</b> (Trọng số: <b>×${pity.mult}</b>)`}
          </span>
        </div>
        <div style="height:9px;background:var(--bg2);border-radius:5px;overflow:hidden;position:relative;margin-bottom:8px">
          <div style="width:${pity.pityPct}%;height:100%;background:linear-gradient(90deg,#ec4899,#8b5cf6,#f59e0b);border-radius:5px;transition:width 0.3s"></div>
        </div>
        ${
          hasCamping
            ? `
          <div style="font-size:12px;margin-top:6px" class="vk-mu">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
              <span>🏕️ <b>Top điểm cắm trại đón đầu tối ưu nhất:</b></span>
              <span style="font-size:11px">(Tự bế quan đẩy Pity)</span>
            </div>
            <div style="display:flex;gap:6px;flex-wrap:wrap">
              ${pity.topCamping
                .slice(0, 3)
                .map((cp) => {
                  const relInf = DIBAO.rel[cp.e.relic] || {};
                  const pctVal = Math.round((cp.w || 0) * 100);
                  const pctStr =
                    cp.wait >= 500
                      ? '<span style="color:#ef4444;font-weight:700">100% 🔥 Xuất Thế</span>'
                      : `xác suất <b>${pctVal}%</b>`;
                  const waitStr =
                    cp.wait > 0
                      ? ` (chờ ${cp.wait}n · ×${(cp.mult || 1).toFixed(1)})`
                      : "";
                  const s = findSlotByDiaDanh(
                    cp.e.marker,
                    cp.e.dia,
                    cLite,
                  );
                  const isHere =
                    run &&
                    s != null &&
                    (String(run.viTri) === String(s) ||
                      String(run.oNoi) === String(s));
                  return `
                  <div style="background:var(--bg2);padding:5px 8px;border-radius:6px;border:1px solid ${isHere ? "var(--acc)" : "var(--line)"};display:flex;align-items:center;justify-content:space-between;flex:1 1 200px;gap:6px">
                    <div>
                      <div><b>${esc(cp.e.dia)}</b> <span style="font-size:11px;color:var(--txt)">(${esc(relInf.ten || cp.e.relic)})</span></div>
                      <div style="font-size:11px;color:var(--mut);margin-top:1px">${pctStr}${waitStr} ${isHere ? '<b class="vk-ok" style="margin-left:4px">✓ Đang ở đây</b>' : ""}</div>
                    </div>
                    ${!isHere && s != null ? `<button type="button" class="vk-btn mini sec au-sdb-action-camp" data-slot="${s}" style="margin:0;padding:2px 6px;font-size:10.5px">🏕️ Cắm Trại</button>` : ""}
                  </div>
                `;
                })
                .join("")}
            </div>
          </div>
        `
            : '<div class="vk-mu" style="font-size:12px;text-align:center">Đã thu thập đủ tất cả Dị Bảo mục tiêu hoặc chưa đủ cảnh giới để kích hoạt Pity.</div>'
        }
      </div>
    `;
  }

  // Lưới thẻ Dị Bảo
  const relicItemsHtml = validEvs
    .map((e) => {
      const rel = DIBAO.rel[e.relic] || {};
      const isChecked = selSet.has(e.relic);
      const owned = isOwnedItem(e.relic);
      const inMeta = metaRelicsSet.has(e.relic);
      const isCarry = rel.bd === "Có";
      const isBoss = e.bv != null;
      return `
      <label class="au-sdb-relic-card ${isChecked ? "checked" : ""}" data-relic="${esc(e.relic)}" data-carry="${isCarry ? "1" : "0"}" data-owned="${owned ? "1" : "0"}" data-meta="${inMeta ? "1" : "0"}" data-boss="${isBoss ? "1" : "0"}">
        <input type="checkbox" class="au-sdb-relic-chk" data-relic="${esc(e.relic)}" ${isChecked ? "checked" : ""} style="margin:0;cursor:pointer;width:15px;height:15px;accent-color:var(--acc)">
        <div style="flex:1;min-width:0;overflow:hidden">
          <div class="au-sdb-relic-title">${esc(rel.ten || e.relic)}</div>
          <div class="au-sdb-relic-sub">
            ${isCarry ? '<span style="color:#f59e0b;font-weight:700">⭐ Hồn</span>' : '<span style="color:#a78bfa">Kiếp</span>'}
            <span>·</span>
            <span style="${isBoss ? "color:#f87171" : "color:#38bdf8"}">${isBoss ? "⚔️ 7%" : "🧠 3%"}</span>
            <span>·</span>
            <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(e.dia || "Hoang dã")}</span>
            ${owned ? '<span class="vk-ok" style="font-weight:700;margin-left:auto" title="Đã sở hữu trong kiếp này">✓ Có</span>' : inMeta ? '<span style="color:#10b981;font-weight:700;margin-left:auto" title="Đã ghi Bảo Lục từ kiếp trước (chưa có trong kiếp này)">📖 Lục</span>' : ""}
          </div>
        </div>
      </label>
    `;
    })
    .join("");

  body.innerHTML = `
    <div class="vk-card" style="padding:12px">
      <!-- Tiêu Đề & Huy Hiệu Tổng Quan -->
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;flex-wrap:wrap;gap:6px">
<div>
  <h3 style="margin:0;display:flex;align-items:center;gap:6px">
    <span>🎯</span>
    <span>Auto Săn Dị Bảo (Nghịch Thiên P8)</span>
  </h3>
  <div style="font-size:11.5px;color:var(--mut);margin-top:2px">
    Truyền Tống Trận · Siêu AI VIP · Bế Quan Pity 500 Năm · Auto Quick Save
  </div>
</div>
<div style="display:flex;gap:4px">
  <span class="do-badge-nt" style="padding:2px 8px;font-size:11px">19 Tối Thượng</span>
</div>
      </div>

      <!-- 4 Khung Thống Kê Nhanh (Dashboard Mini) -->
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(95px,1fr));gap:6px;margin-bottom:10px">
<div style="background:var(--bg3);padding:7px 8px;border-radius:6px;text-align:center;border:1px solid var(--line)">
  <div class="vk-mu" style="font-size:10.5px">Đã Có Trong Kiếp</div>
  <b style="font-size:16px;color:${ownedCount ? "var(--acc)" : "var(--mut)"}">${ownedCount}/${totalRelics}</b>
</div>
<div style="background:var(--bg3);padding:7px 8px;border-radius:6px;text-align:center;border:1px solid var(--line)">
  <div class="vk-mu" style="font-size:10.5px">Bảo Lục Luân Hồi</div>
  <b style="font-size:16px;color:#10b981">${metaCount}/${totalRelics} <span style="font-size:10.5px;font-weight:normal">(+${baoLucPoints}đ)</span></b>
</div>
<div style="background:var(--bg3);padding:7px 8px;border-radius:6px;text-align:center;border:1px solid var(--line)">
  <div class="vk-mu" style="font-size:10.5px">Đang Chọn Săn</div>
  <b style="font-size:16px;color:#f59e0b" id="au-sdb-stat-selected">${selSet.size}/${totalRelics}</b>
</div>
<div style="background:var(--bg3);padding:7px 8px;border-radius:6px;text-align:center;border:1px solid ${onMapList.length ? "#ff3366" : "var(--line)"}">
  <div class="vk-mu" style="font-size:10.5px">Đang Nở Trên Map</div>
  <b style="font-size:16px;color:${onMapList.length ? "#ff3366" : "var(--mut)"}">${onMapList.length} món</b>
</div>
      </div>

      <!-- Thanh Điều Khiển Auto Nổi Bật (Top Action Bar) -->
      <div style="background:var(--bg2);border:1px solid ${AU.run && AU.run.running && AU.run.kind === "sdb" ? "#3ddc97" : "var(--line)"};border-radius:10px;padding:9px 12px;margin-bottom:10px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px">
<div>
  <div style="display:flex;align-items:center;gap:6px">
    <b style="font-size:13px;color:var(--acc)">Trạng Thái Hoạt Động:</b>
    <span id="au-sdb-status-pill" style="font-size:11px;font-weight:700;padding:2px 8px;border-radius:999px;background:${AU.run && AU.run.running && AU.run.kind === "sdb" ? "rgba(61,220,151,0.2);color:#3ddc97;border:1px solid #3ddc97" : "rgba(255,255,255,0.08);color:var(--mut)"}">${AU.run && AU.run.running && AU.run.kind === "sdb" ? "● ĐANG SĂN BẢO" : "○ TẠM DỪNG"}</span>
  </div>
  <div class="vk-mu" style="font-size:11.5px;margin-top:2px" id="au-sdb-status-sub">
    ${AU.run && AU.run.running && AU.run.kind === "sdb" ? esc(AU.run.phaseDesc || AU.run.targetTitle || "Đang quét bản đồ & săn Dị Bảo...") : "Bấm [▶ Bắt Đầu Săn Bảo] để Auto tự động bay/truyền tống, vượt kiểm định & giao chiến Hộ Vệ."}
  </div>
</div>
<div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">
  ${auControls()}
  <button type="button" class="vk-btn mini sec" id="au-sdb-btn-quick-save" style="margin:0;padding:6px 10px;font-size:12px;border-radius:8px" title="Lưu nhanh trạng thái hiện tại để dự phòng">💾 Quick Save</button>
  <button type="button" class="vk-btn mini sec" id="au-sdb-btn-refresh-radar" style="margin:0;padding:6px 10px;font-size:12px;border-radius:8px" title="Quét lại bản đồ thế giới">🔄 Quét Lại</button>
</div>
      </div>

      <!-- Khối 1: Live Radar & Bản Đồ Săn Bảo -->
      <div id="au-sdb-radar-container">
${radarHtml}
      </div>

      <!-- Khối 2: Bộ Chọn Dị Bảo Muốn Săn (Target Relics Filter) -->
      <div style="background:var(--bg3);border:1px solid var(--line);border-radius:10px;padding:10px;margin-bottom:10px">
<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px;margin-bottom:8px">
  <div>
    <b style="font-size:13px;color:var(--acc)">🗡️ Chọn Dị Bảo Muốn Săn:</b>
    <span id="au-sdb-count-badge" style="font-size:11.5px;margin-left:6px" class="vk-mu">
      ${selSet.size === totalRelics ? "(Đang săn tất cả 19 món)" : selSet.size === 0 ? '<span class="vk-bad">(Chưa chọn món nào — Auto sẽ dừng)</span>' : `(Đang chọn <b>${selSet.size}</b>/19 món)`}
    </span>
  </div>
  <div style="display:flex;gap:4px;flex-wrap:wrap">
    <button type="button" class="vk-btn mini sec" id="au-sdb-btn-all" style="padding:2px 7px;font-size:11px;margin:0">✓ Tất Cả (19)</button>
    <button type="button" class="vk-btn mini sec" id="au-sdb-btn-none" style="padding:2px 7px;font-size:11px;margin:0">✕ Bỏ Hết</button>
    <button type="button" class="vk-btn mini sec" id="au-sdb-btn-carry" style="padding:2px 7px;font-size:11px;margin:0">⭐ 12 Món Hồn</button>
    <button type="button" class="vk-btn mini sec" id="au-sdb-btn-unowned" style="padding:2px 7px;font-size:11px;margin:0" title="Chọn các món chưa sở hữu trong kiếp hiện tại">📦 Chưa Có (Kiếp)</button>
    <button type="button" class="vk-btn mini sec" id="au-sdb-btn-unmeta" style="padding:2px 7px;font-size:11px;margin:0" title="Chọn các món chưa từng ghi vào Bảo Lục Luân Hồi (+5đ)">📖 Chưa Ghi Lục</button>
    <button type="button" class="vk-btn mini sec" id="au-sdb-btn-boss" style="padding:2px 7px;font-size:11px;margin:0">⚔️ 13 Boss (7%)</button>
    <button type="button" class="vk-btn mini sec" id="au-sdb-btn-test" style="padding:2px 7px;font-size:11px;margin:0">🧠 6 Trí (3%)</button>
  </div>
</div>
<div style="display:flex;gap:6px;align-items:center;margin-bottom:8px">
  <input type="text" id="au-sdb-filter-input" class="vk-inp" placeholder="🔍 Lọc nhanh tên bảo vật, địa danh..." style="flex:1;padding:5px 8px;font-size:12px;border-radius:6px">
</div>
<div id="au-sdb-relic-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:6px;max-height:260px;overflow-y:auto;padding-right:4px">
  ${relicItemsHtml}
</div>
      </div>

      <!-- Khối 3: Chiến Thuật & Cấu Hình Tự Động (Grouped Settings) -->
      <div style="background:var(--bg3);border:1px solid var(--line);border-radius:10px;padding:10px;margin-bottom:10px">
<div style="font-weight:700;font-size:13px;color:var(--acc);margin-bottom:8px">⚙️ Chiến Thuật & Cấu Hình Vận Hành</div>

<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:8px">
  <!-- Cụm A: Di chuyển & Cắm trại -->
  <div style="background:var(--bg2);padding:8px 10px;border-radius:8px;border:1px solid var(--line)">
    <div style="font-weight:600;font-size:12px;color:var(--txt);margin-bottom:6px">🚀 Di Chuyển & Cắm Trại</div>
    <label style="display:flex;gap:6px;align-items:center;margin:4px 0;font-size:12.5px"><input type="checkbox" id="au-sdb-tele" ${c.dungTruyenTong !== false ? "checked" : ""}> <b>Ưu Tiên Truyền Tống Trận/Phù (0 Năm)</b></label>
    <label style="display:flex;gap:6px;align-items:center;margin:4px 0;font-size:12.5px"><input type="checkbox" id="au-sdb-san-moi" ${c.sanMoiDiBaoXuatThe !== false ? "checked" : ""}> <b style="color:var(--acc)">Ưu Tiên Săn Mọi Dị Bảo Xuất Thế Trên Map</b></label>
    <label style="display:flex;gap:6px;align-items:center;margin:4px 0;font-size:12.5px"><input type="checkbox" id="au-sdb-uutien" ${c.uuTienTheoHon !== false ? "checked" : ""}> Ưu tiên săn 12 món Theo Hồn trước</label>
    <label style="display:flex;gap:6px;align-items:center;margin:4px 0;font-size:12.5px"><input type="checkbox" id="au-sdb-boda" ${c.boQuaDaCo !== false ? "checked" : ""}> Bỏ qua các món Dị Bảo đã sở hữu trong kiếp</label>
    <div style="margin-top:6px;font-size:12px;display:flex;align-items:center;justify-content:space-between;gap:6px">
      <span>Khi map chưa có Dị Bảo:</span>
      <select class="vk-sel" id="au-sdb-chedo" style="width:160px;padding:3px 6px;font-size:12px">
        <option value="camp" ${c.cheDoCho === "camp" ? "selected" : ""}>🏕️ Cắm Trại & Bế Quan</option>
        <option value="stop" ${c.cheDoCho === "stop" ? "selected" : ""}>⏹ Dừng Lại Chờ</option>
      </select>
    </div>
  </div>

  <!-- Cụm B: Tác chiến & Sự kiện -->
  <div style="background:var(--bg2);padding:8px 10px;border-radius:8px;border:1px solid var(--line)">
    <div style="font-weight:600;font-size:12px;color:var(--txt);margin-bottom:6px">⚔️ Tác Chiến & Đối Kháng</div>
    <label style="display:flex;gap:6px;align-items:center;margin:4px 0;font-size:12.5px"><input type="checkbox" id="au-sdb-danh-ai" ${c.danhAi !== false ? "checked" : ""}> <b>Tự Đánh AI Khi Không Cho Tốc Chiến</b></label>
    <label style="display:flex;gap:6px;align-items:center;margin:4px 0;font-size:12.5px"><input type="checkbox" id="au-sdb-auto-tha" ${c.autoThaMang !== false ? "checked" : ""}> <b>Tự Động Tha Mạng Đối Thủ Bại Trận (xu_tri)</b></label>
    <label style="display:flex;gap:6px;align-items:center;margin:4px 0;font-size:12.5px"><input type="checkbox" id="au-sdb-enemy-escape" ${c.autoEnemyEscape !== false ? "checked" : ""}> <b>Buông Tha Kẻ Tháo Chạy (enemy_escape)</b></label>
    <label style="display:flex;gap:6px;align-items:flex-start;margin:5px 0 3px;font-size:12.5px">
      <input type="checkbox" id="au-sdb-auto-qs" ${c.autoQuickSave ? "checked" : ""} style="margin-top:2px">
      <span><b style="color:#a78bfa">💾 Tự Lưu Nhanh (Quick Save) Trước Trận</b> <span class="vk-mu" style="font-size:11px;display:block">Tự lưu trước sự kiện. Nếu xịt 7%, bạn có thể bật "Tẩy Thiên Cơ" nạp lại gieo quẻ mới!</span></span>
    </label>
    <div style="margin-top:6px;font-size:12px;display:flex;align-items:center;justify-content:space-between;gap:6px">
      <span>Tỉ Lệ Thắng Tối Thiểu Đánh Boss:</span>
      <input type="number" id="au-sdb-winrate" class="vk-inp" value="${c.minWinRate || 70}" min="10" max="100" style="width:65px;padding:3px 6px;font-size:12px;text-align:center"> %
    </div>
  </div>
</div>

<!-- Cụm C: Giới hạn an toàn & Tốc độ -->
<div style="background:var(--bg2);padding:8px 10px;border-radius:8px;border:1px solid var(--line);margin-top:8px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px">
  <div style="display:flex;align-items:center;gap:6px;font-size:12px">
    <span>Tốc độ:</span>
    ${auTocSel(c.toc || "nhanh")}
  </div>
  <div style="display:flex;align-items:center;gap:6px;font-size:12px">
    <span>Dừng khi thọ &lt;:</span>
    <input type="number" id="au-sdb-tho" class="vk-inp" value="${c.minTho || 15}" min="1" max="1000" style="width:60px;padding:3px 6px;font-size:12px;text-align:center"> năm
  </div>
  <div style="display:flex;align-items:center;gap:6px;font-size:12px">
    <span>Dừng sau:</span>
    <input type="number" id="au-sdb-maxnam" class="vk-inp" value="${c.maxNam || 100}" min="1" max="1000" style="width:60px;padding:3px 6px;font-size:12px;text-align:center"> năm
  </div>
</div>
      </div>
    </div>

    <div class="vk-card"><h3>Tiến Trình Săn Bảo</h3><div id="au-st"></div></div>
    <div class="vk-card"><h3>Nhật Ký Tác Vụ</h3><div id="au-lg"></div></div>`;

  auBind("sdb");

  const updateGridUI = () => {
    const chks = body.querySelectorAll(".au-sdb-relic-chk");
    const checkedRelics = [];
    chks.forEach((chk) => {
      const rId = chk.getAttribute("data-relic");
      const label = chk.closest(".au-sdb-relic-card");
      if (chk.checked) {
        checkedRelics.push(rId);
        if (label) {
          label.classList.add("checked");
          label.style.borderColor = "";
          label.style.background = "";
          label.style.boxShadow = "";
        }
      } else {
        if (label) {
          label.classList.remove("checked");
          label.style.borderColor = "";
          label.style.background = "";
          label.style.boxShadow = "";
        }
      }
    });
    c.targetRelics = checkedRelics;
    auSave();
    const badge = body.querySelector("#au-sdb-count-badge");
    if (badge) {
      badge.innerHTML =
        checkedRelics.length === validEvs.length
          ? "(Đang săn tất cả 19 món)"
          : checkedRelics.length === 0
            ? '<span class="vk-bad">(Chưa chọn món nào — Auto sẽ dừng)</span>'
            : `(Đang chọn <b>${checkedRelics.length}</b>/19 món)`;
    }
    const statSel = body.querySelector("#au-sdb-stat-selected");
    if (statSel) {
      statSel.textContent = `${checkedRelics.length}/${totalRelics}`;
    }
  };

  body.querySelectorAll(".au-sdb-relic-chk").forEach((chk) => {
    chk.onchange = updateGridUI;
  });

  const btnAll = body.querySelector("#au-sdb-btn-all");
  if (btnAll) {
    btnAll.onclick = () => {
      body
        .querySelectorAll(".au-sdb-relic-chk")
        .forEach((chk) => (chk.checked = true));
      updateGridUI();
    };
  }

  const btnNone = body.querySelector("#au-sdb-btn-none");
  if (btnNone) {
    btnNone.onclick = () => {
      body
        .querySelectorAll(".au-sdb-relic-chk")
        .forEach((chk) => (chk.checked = false));
      updateGridUI();
    };
  }

  const btnCarry = body.querySelector("#au-sdb-btn-carry");
  if (btnCarry) {
    btnCarry.onclick = () => {
      body.querySelectorAll(".au-sdb-relic-chk").forEach((chk) => {
        const label = chk.closest(".au-sdb-relic-card");
        chk.checked = label && label.dataset.carry === "1";
      });
      updateGridUI();
    };
  }

  const btnUnowned = body.querySelector("#au-sdb-btn-unowned");
  if (btnUnowned) {
    btnUnowned.onclick = () => {
      body.querySelectorAll(".au-sdb-relic-chk").forEach((chk) => {
        const label = chk.closest(".au-sdb-relic-card");
        chk.checked = label && label.dataset.owned === "0";
      });
      updateGridUI();
    };
  }

  const btnUnmeta = body.querySelector("#au-sdb-btn-unmeta");
  if (btnUnmeta) {
    btnUnmeta.onclick = () => {
      body.querySelectorAll(".au-sdb-relic-chk").forEach((chk) => {
        const label = chk.closest(".au-sdb-relic-card");
        chk.checked = label && label.dataset.meta === "0";
      });
      updateGridUI();
    };
  }

  const btnBoss = body.querySelector("#au-sdb-btn-boss");
  if (btnBoss) {
    btnBoss.onclick = () => {
      body.querySelectorAll(".au-sdb-relic-chk").forEach((chk) => {
        const label = chk.closest(".au-sdb-relic-card");
        chk.checked = label && label.dataset.boss === "1";
      });
      updateGridUI();
    };
  }

  const btnTest = body.querySelector("#au-sdb-btn-test");
  if (btnTest) {
    btnTest.onclick = () => {
      body.querySelectorAll(".au-sdb-relic-chk").forEach((chk) => {
        const label = chk.closest(".au-sdb-relic-card");
        chk.checked = label && label.dataset.boss === "0";
      });
      updateGridUI();
    };
  }

  // Ô tìm kiếm / lọc nhanh tên Dị Bảo
  const filterInput = body.querySelector("#au-sdb-filter-input");
  if (filterInput) {
    filterInput.oninput = () => {
      const q = fold(filterInput.value).trim();
      body.querySelectorAll(".au-sdb-relic-card").forEach((card) => {
        const text = fold(card.textContent);
        card.style.display = !q || text.includes(q) ? "" : "none";
      });
    };
  }

  // Nút Quick Save
  const btnQs = body.querySelector("#au-sdb-btn-quick-save");
  if (btnQs) {
    btnQs.onclick = () => {
      const res = saveQuickSave("Thủ công từ Tab Auto Săn Dị Bảo");
      if (res.ok) {
        try {
          UI.notify("💾 Đã lưu Quick Save thành công!");
        } catch (e) {}
      } else {
        alert("⚠️ " + res.msg);
      }
    };
  }

  // Nút Quét lại Radar
  const btnRefresh = body.querySelector("#au-sdb-btn-refresh-radar");
  if (btnRefresh) {
    btnRefresh.onclick = () => {
      tabAutoSdb();
    };
  }

  // Nút hành động nhanh trên radar
  body.querySelectorAll(".au-sdb-action-tele").forEach((btn) => {
    btn.onclick = () => {
      const slot = btn.dataset.slot;
      const res = smartTeleportTo(slot);
      if (res.ok) {
        try {
          UI.notify("⚡ Đã truyền tống tới Slot " + slot);
        } catch (e) {}
        tabAutoSdb();
      } else {
        alert("⚠️ Truyền tống thất bại: " + res.msg);
      }
    };
  });

  body.querySelectorAll(".au-sdb-action-travel").forEach((btn) => {
    btn.onclick = () => {
      const slot = btn.dataset.slot;
      const err =
        typeof ddDoTravel === "function"
          ? ddDoTravel(slot)
          : auCall(() => g.travelTo(slot)).err;
      if (!err) {
        try {
          UI.notify("🚀 Đã bay tới Slot " + slot);
        } catch (e) {}
        tabAutoSdb();
      } else {
        alert("⚠️ Không bay tới được: " + err);
      }
    };
  });

  body.querySelectorAll(".au-sdb-action-camp").forEach((btn) => {
    btn.onclick = () => {
      const slot = btn.dataset.slot;
      if (checkCanTeleport(slot)) {
        smartTeleportTo(slot);
      } else if (typeof ddDoTravel === "function") {
        ddDoTravel(slot);
      } else {
        auCall(() => g.travelTo(slot));
      }
      tabAutoSdb();
    };
  });
}

function tabAutoSan() {
  S.tab = "atl";
  if (AU.cfg && AU.cfg.tl) {
    AU.cfg.tl.mode = "danh_quai";
    auSave();
  }
  tabAutoTuLuyen();
}
function tabAutoBuon() {
  const c = AU.cfg.buon;
  body.innerHTML = `
    <div class="vk-card"><h3>Auto Buôn Bán</h3>
      <div class="vk-mu" style="font-size:13px">Tool dò các tiệm quanh đây, tìm chuyến <b>mua rẻ ở nơi này, bán đắt ở nơi kia</b> (hàng buôn theo vùng, chênh giá theo quốc gia) rồi tự đi, mua, đi tiếp, bán. <b>Bán xuyên khoảng cách:</b> nơi bán không bị gói trong bán kính mua; mua xong, Auto dò lại mọi tiệm thu món đó trong <b>Phạm Vi Bán</b> (năm đường tính từ nơi mua), chọn tiệm lãi nhất mỗi năm đường, và nếu tiệm đó không thu, giá thật thấp hơn vốn hay chợ chỉ thu được một phần thì tự sang tiệm kế trong phạm vi để bán nốt. Tool tính cả <b>Chợ Ngập Hàng</b>: bán càng nhiều giá càng tụt và tiệm ngừng thu khi chợ đã ngập, nên chỉ mua số món tiệm bán còn thu nổi. Giá thật được kiểm lại ở từng tiệm; giá bán thấp hơn vốn thì dừng và giữ hàng. Mỗi chuyến tốn năm tuổi thọ theo đường đi.</div>
      ${auFld("au-maxy", "Đi Mua Tối Đa", c.maxY, "(năm đường từ chỗ đứng)")}
      ${auFld("au-bany", "Phạm Vi Bán Xuyên", c.banY, "(năm đường từ nơi mua)")}
      ${auHiemSel(c.hiem)}
      ${auTocSel(c.toc)}
      ${auFld("au-von", "Vốn Dùng Mỗi Chuyến", c.von, "(% Linh Thạch)")}
      ${auFld("au-giu", "Luôn Giữ Lại", c.giu, "(Linh Thạch)")}
      ${auFld("au-lai", "Lãi Tối Thiểu Mỗi Món", c.lai, "(%)")}
      ${auFld("au-chuyen", "Dừng Sau Số Chuyến", c.chuyen)}
      ${auFld("au-tho", "Dừng Khi Thọ Nguyên Còn Dưới", c.tho, "(năm)")}
      ${auControls()}
      <button class="vk-btn sec" id="au-plan" style="margin-top:6px">Xem Kế Hoạch (Không Đi)</button>${progressHtml("au-pr")}<div id="au-info"></div></div>
    <div class="vk-card"><h3>Tiến Trình</h3><div id="au-st"></div></div>
    <div class="vk-card"><h3>Nhật Ký</h3><div id="au-lg"></div></div>`;
  auBind("buon");
  body.querySelector("#au-plan").onclick = async (ev) => {
    auReadCfg("buon");
    ev.target.disabled = true;
    const box = body.querySelector("#au-info"),
      prog = bindProgress(body.querySelector("#au-pr"));
    try {
      if (!S.core)
        S.core = await loadCore((m) => {
          box.textContent = m;
        });
      const pl = await auPlanTrade(AU.cfg.buon, prog);
      body.querySelector("#au-pr").style.display = "none";
      box.innerHTML = pl.routes.length
        ? `<div class="vk-mu" style="font-size:13px;margin:8px 0">Vốn dùng được <b>${Math.floor(pl.budget)}</b> · đã xem <b>${pl.nShops}</b> tiệm. Xếp theo lãi mỗi năm đường (nơi bán trong ${num(AU.cfg.buon.banY)} năm đường tính từ nơi mua; lúc chạy thật Auto còn dò lại nơi bán tốt nhất sau khi mua):</div><table class="vk-t"><tr><th>Hàng</th><th>Mua → Bán</th><th>Lãi Ước</th></tr>${pl.routes
            .slice(0, 10)
            .map(
              (r) =>
                `<tr><td><b>${esc(r.it.ten)}</b><br><span class="vk-mu" style="font-size:12px">${r.q} món · giá ${r.price}</span></td><td>${esc(r.buy.name)}<br>→ ${esc(r.sell.name)}<br><span class="vk-mu" style="font-size:12px">${yrs(r.years)}</span></td><td class="vk-ok">+${Math.round(r.profit)}</td></tr>`,
            )
            .join(
              "",
            )}</table><div class="vk-mu" style="font-size:12px">Lãi ước theo mô hình giá của game; giá thật được kiểm lại khi tới tiệm.</div>`
        : `<div class="vk-mu" style="font-size:13px;margin:8px 0">${esc(pl.why || "Không có chuyến nào đủ lãi trong bán kính đã đặt. Thử tăng “Mỗi Chặng Đi Tối Đa” hoặc giảm “Lãi Tối Thiểu”.")}</div>`;
    } catch (e) {
      console.error(e);
      box.innerHTML = errBox(e);
    }
    ev.target.disabled = false;
  };
}

export {
  tabAutoTuLuyen,
  tabAutoTacChien,
  tabAutoSdb,
  tabAutoSan,
  tabAutoBuon,
};

Object.assign(gWin, {
  tabAutoTuLuyen,
  tabAutoTacChien,
  tabAutoSdb,
  tabAutoSan,
  tabAutoBuon,
});
