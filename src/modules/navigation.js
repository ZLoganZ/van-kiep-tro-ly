import {
  gWin,
  TOOL_VER,
  TabLifecycle,
  sleep0,
  pct,
  num,
  esc,
  fold,
  heTen,
  STAGE,
} from "../core/utils.js";
import { UI } from "../ui/shell.js";
import {
  S,
  body,
  tabsEl,
  groupsEl,
  loadCore,
  G,
  C,
  ctx,
  nvNow,
  realmName,
  realmLabel,
  fight,
  enemyAt,
} from "../core/bridge.js";
/**
 * Module: Điều Hướng Tab (TABS, GROUPS, Router) & Tab Tổng Quan
 */
// ───────────────────────── 6. Gắn vào giao diện chung ─────────────────────────
UI.refreshBtn.onclick = () => {
  S.best = null;
  S.cho = null;
  render();
};

const TABS = [
  ["tq", "Tổng Quan"],
  ["tkc", "Tàng Kinh Các"],
  ["dp", "Đột Phá & Thọ"],
  ["tr", "Trận"],
  ["tien", "Kiếm Linh Thạch"],
  ["cho", "Chợ Quanh Đây"],
  ["ld", "Luyện Đan"],
  ["cph", "Chế Phù"],
  ["lbo", "Luyện Bảo"],
  ["tph", "Trận Pháp"],
  ["tt", "Treo Thưởng"],
  ["db", "Dị Bảo"],
  ["san", "Đồ Nên Săn"],
  ["tcv", "Vật Phẩm"],
  ["tcq", "Quái Vật"],
  ["tcd", "Địa Danh"],
  ["bd", "Bản Đồ"],
];
TABS.push(["bm", "Bản Mệnh Pháp Bảo"]);
TABS.push(
  ["nlw", "Tổng Quan"],
  ["nlm", "Của Tôi"],
  ["nls", "Sinh Vật"],
  ["nlv", "Vật Phẩm"],
  ["nlc", "Cơ Duyên"],
);
TABS.push(
  ["atl", "Auto Tu Luyện"],
  ["atc", "Auto Tác Chiến"],
  ["asdb", "Auto Săn Dị Bảo"],
  ["asy", "Auto Săn Yêu"],
  ["abb", "Auto Buôn Bán"],
  ["akm", "Hướng Build"],
  ["bis", "Biệt Đội Late Game"],
  ["arr", "Auto Reroll Tư Chất"],
);
TABS.push(
  ["lhs", "Mở Khóa"],
  ["lht", "Thành Tựu"],
  ["lhd", "Dự Tính Điểm"],
  ["sv", "Lưu & Nạp Save"],
  ["tkb", "Thiên Kiêu Bảng"],
  ["nmn", "Nhân Mạch"],
);
const TNAME = Object.fromEntries(TABS);
const GROUPS = [
  ["nv", "Nhân Vật", ["tq", "tkc", "bm"]],
  ["cd", "Đột Phá", ["dp", "tr"]],
  ["kl", "Kiếm Lời", ["tien", "cho", "ld", "cph", "lbo", "tph", "tt"]],
  ["tc", "Tra Cứu", ["db", "san", "tcv", "tcq", "tcd", "bd"]],
  ["nl", "Ngự Linh", ["nlw", "nlm", "nls", "nlv", "nlc"]],
  ["lh", "Luân Hồi", ["lhs", "lht", "lhd", "sv"]],
  ["nm", "Nhân Mạch", ["tkb", "nmn"]],
  ["au", "Tự Động", ["atl", "atc", "asdb", "abb", "akm", "bis", "arr"]],
];
const grpOf = (k) => GROUPS.find((g) => g[2].includes(k)) || GROUPS[0];
S.tab = "tq";
// Dựng lại thanh tab nhưng giữ nguyên vị trí vuốt (trước đây mỗi lần bấm tab là thanh nhảy về đầu) và cuộn nút đang chọn vào vùng nhìn thấy.
function keepVisible(strip) {
  const b = strip.querySelector(".on");
  if (!b) return;
  const k = (UI.fit && UI.fit.k) || 1,
    r = b.getBoundingClientRect(),
    s = strip.getBoundingClientRect();
  if (!r.width || !s.width) return;
  if (r.left < s.left) strip.scrollLeft -= (s.left - r.left + 8) / k;
  else if (r.right > s.right) strip.scrollLeft += (r.right - s.right + 8) / k;
}
function drawTabs() {
  const g = grpOf(S.tab),
    gl = groupsEl.scrollLeft,
    tl = tabsEl.scrollLeft;

  // 1. Quản lý Nhóm Cấp 1 (Chỉ dựng lần đầu, giữ nguyên DOM các lần sau)
  let groupGlider = groupsEl.querySelector(".vkx-tab-glider");
  if (!groupGlider) {
    groupGlider = document.createElement("div");
    groupGlider.className = "vkx-tab-glider";
    groupsEl.prepend(groupGlider);
  }

  const GRP_ICONS = {
    nv: "🧘",
    cd: "⚡",
    kl: "💰",
    tc: "🧭",
    nl: "🐉",
    lh: "☸️",
    nm: "🤝",
    au: "🤖",
  };
  const TAB_ICONS = {
    tq: "☯",
    tkc: "📚",
    bm: "🗡️",
    dp: "⚡",
    tr: "🛡️",
    tien: "💎",
    cho: "🏪",
    ld: "⚗️",
    cph: "📜",
    lbo: "🔨",
    tph: "🕸️",
    tt: "🎯",
    db: "👑",
    san: "🏹",
    tcv: "🎒",
    tcq: "👹",
    tcd: "🗺️",
    bd: "🧭",
    nlw: "🐾",
    nlm: "🦊",
    nls: "🦅",
    nlv: "🌿",
    nlc: "✨",
    lhs: "🔓",
    lht: "🏅",
    lhd: "🧮",
    sv: "💾",
    tkb: "🌟",
    nmn: "💞",
    atl: "🧘",
    atc: "⚔️",
    asdb: "🔥",
    asy: "🏹",
    abb: "⚖️",
    akm: "🧬",
    bis: "🏆",
    arr: "🎲",
  };

  let groupBtns = groupsEl.querySelectorAll("button");
  if (groupBtns.length !== GROUPS.length) {
    const gh = GROUPS.map(
      (x) =>
        `<button data-g="${x[0]}" class="${x === g ? "on" : ""}"><span class="vkx-g-ic">${GRP_ICONS[x[0]] || "❖"}</span><span class="vkx-g-tx">${x[1]}</span><em class="vkx-g-cnt">${x[2].length}</em></button>`,
    ).join("");
    groupsEl.innerHTML = '<div class="vkx-tab-glider"></div>' + gh;
    groupGlider = groupsEl.querySelector(".vkx-tab-glider");
    groupBtns = groupsEl.querySelectorAll("button");
  } else {
    for (let i = 0; i < groupBtns.length; i++) {
      const b = groupBtns[i];
      b.classList.toggle("on", b.dataset.g === g[0]);
    }
  }

  // 2. Quản lý Tab Con Cấp 2
  let tabGlider = tabsEl.querySelector(".vkx-tab-glider");
  if (!tabGlider) {
    tabGlider = document.createElement("div");
    tabGlider.className = "vkx-tab-glider";
    tabsEl.prepend(tabGlider);
  }

  const isSameGroup = S.tabGrp === g[0];
  let tabBtns = tabsEl.querySelectorAll("button");

  if (isSameGroup && tabBtns.length === g[2].length) {
    for (let i = 0; i < tabBtns.length; i++) {
      const b = tabBtns[i];
      b.classList.toggle("on", b.dataset.k === S.tab);
    }
  } else {
    const th = g[2]
      .map(
        (k) =>
          `<button data-k="${k}" class="${k === S.tab ? "on" : ""}"><span class="vkx-t-ic">${TAB_ICONS[k] || "•"}</span><span class="vkx-t-tx">${TNAME[k] || k}</span></button>`,
      )
      .join("");
    tabsEl.innerHTML = '<div class="vkx-tab-glider"></div>' + th;
    tabGlider = tabsEl.querySelector(".vkx-tab-glider");
    tabBtns = tabsEl.querySelectorAll("button");
  }

  // 3. Giữ nguyên vị trí cuộn
  groupsEl.scrollLeft = gl;
  if (isSameGroup) tabsEl.scrollLeft = tl;
  else tabsEl.scrollLeft = 0;
  S.tabGrp = g[0];

  keepVisible(groupsEl);
  keepVisible(tabsEl);

  // 4. Kích hoạt hiệu ứng trượt Glider
  const activeGroupBtn = groupsEl.querySelector("button.on");
  if (activeGroupBtn && groupGlider && UI && UI.updateGlider) {
    const isWide = UI.win && UI.win.classList.contains("vkx-wide");
    UI.updateGlider(activeGroupBtn, groupGlider, isWide, false);
  }
  const activeTabBtn = tabsEl.querySelector("button.on");
  if (activeTabBtn && tabGlider && UI && UI.updateGlider) {
    UI.updateGlider(activeTabBtn, tabGlider, false, !isSameGroup);
  }
}
groupsEl.onclick = (e) => {
  const btn = e.target.closest && e.target.closest("button");
  const gk = btn && btn.dataset && btn.dataset.g;
  const g = gk && GROUPS.find((x) => x[0] === gk);
  if (g) {
    S.abort = true;
    S.tab = g[2][0];
    render();
  }
};
tabsEl.onclick = (e) => {
  const btn = e.target.closest && e.target.closest("button");
  const k = btn && btn.dataset && btn.dataset.k;
  if (k) {
    S.abort = true;
    S.tab = k;
    render();
  }
};

// Kết nối Tìm Nhanh Tab (Ctrl+K / 🔎)
if (UI) {
  UI._onQuickSearch = function (query) {
    const hitsEl = UI.qHits;
    if (!hitsEl) return;
    const q = fold(String(query || "").trim());
    const allTabs = [];
    for (const gArr of GROUPS) {
      const gId = gArr[0],
        gTitle = gArr[1],
        tabKeys = gArr[2] || [];
      for (const tk of tabKeys) {
        allTabs.push({ k: tk, t: TNAME[tk] || tk, gId, gTitle });
      }
    }
    const list = !q
      ? allTabs.slice(0, 10)
      : allTabs
          .filter(
            (item) =>
              fold(item.t).includes(q) ||
              fold(item.k).includes(q) ||
              fold(item.gTitle).includes(q),
          )
          .slice(0, 12);
    if (!list.length) {
      hitsEl.innerHTML =
        '<span class="vk-mu" style="font-size:11.5px">Không tìm thấy tab phù hợp.</span>';
      return;
    }
    hitsEl.innerHTML = list
      .map(
        (item) =>
          `<button type="button" class="vkx-qhit" data-tid="${esc(item.k)}"><span style="opacity:0.75">${esc(item.gTitle)} ▸</span> <b>${esc(item.t)}</b></button>`,
      )
      .join("");
    hitsEl.querySelectorAll(".vkx-qhit").forEach((btn) => {
      btn.onclick = function () {
        const tid = btn.getAttribute("data-tid");
        if (tid) {
          S.abort = true;
          S.tab = tid;
          render();
          if (typeof UI.toggleQuickSearch === "function")
            UI.toggleQuickSearch(false);
        }
      };
    });
  };
}

const errBox = (e) =>
  `<div class="vk-err"><b>Có lỗi:</b> ${esc((e && e.message) || e)}<br><span class="vk-mu" style="font-size:12px">Tool ${TOOL_VER}${S.core ? " · game " + esc(S.core.bundle) : ""}. Nếu lỗi lặp lại, chụp màn hình gửi Claude.</span></div>`;

// Đồng bộ Thanh Linh Giác Nhân Vật (#vkx-char-hud) theo thời gian thực
function syncCharHudBar() {
  if (!UI || typeof UI.updateCharHud !== "function") return;
  try {
    const g = G();
    if (!g || !g.state || !g.state.run || !S.core) {
      UI.updateCharHud(
        '<span class="vkx-hud-pill realm">☯ Thiên Cơ Tinh Bàn</span><span class="vkx-hud-pill">Chưa vào kiếp tu luyện</span>',
        null,
      );
      return;
    }
    const c = ctx();
    const run = c.run;
    const nv = run.nhanVat;
    const K = S.core;
    const tho = K.thoNguyenToiDa(nv);
    const rem = Math.max(0, Math.floor(tho - nv.tuoi));
    const realmStr = realmLabel(nv.canhGioi, nv.tieuCanhGioi);
    let curPlace = run.viTri || "—";
    try {
      curPlace =
        (typeof gWin.placeName === "function"
          ? gWin.placeName(c, run.viTri)
          : run.viTri) || run.viTri;
    } catch (e) {}
    const pillRealm = `<span class="vkx-hud-pill realm" title="Đạo hiệu & Cảnh giới hiện tại">☯ ${esc(nv.ten)} · ${esc(realmStr)}</span>`;
    const pillAge = `<span class="vkx-hud-pill ${rem < 15 ? "warn" : ""}" title="Tuổi / Thọ nguyên tối đa">⏳ ${Math.floor(nv.tuoi)}/${tho} (${rem}n)</span>`;
    const pillStone = `<span class="vkx-hud-pill ok" title="Linh thạch hiện có">💎 ${num(Math.floor(nv.linhThach || 0))}</span>`;
    const pillLoc = `<span class="vkx-hud-pill" title="Vị trí hiện tại">📍 ${esc(curPlace)}</span>`;
    const pillInj = nv.thuongThe
      ? `<span class="vkx-hud-pill warn" title="Thương thế">🩸 Thương ${nv.thuongThe}</span>`
      : "";
    UI.updateCharHud(
      pillRealm + pillAge + pillStone + pillLoc + pillInj,
      () => {
        const res =
          typeof gWin.saveQuickSave === "function"
            ? gWin.saveQuickSave("Lưu nhanh từ Thanh Linh Giác")
            : { ok: false, msg: "Mô-đun Save chưa sẵn sàng" };
        if (res && res.ok) {
          UI.notify("⚡ " + res.msg);
        } else if (res) {
          UI.notify("⚠️ " + res.msg);
        }
      },
    );
  } catch (e) {}
}

// Cập nhật Mini Status Bar toàn cục theo trạng thái các tác vụ Auto
function refreshMiniStatus() {
  syncCharHudBar();
  if (!UI || typeof UI.updateMiniStatus !== "function") return;
  const runningList = [];
  if (AU.run && AU.run.running) {
    const kNames = {
      buon: "Auto Buôn Bán",
      san: "Auto Săn Yêu",
      km: "Auto Kinh Mạch",
      tl: "Auto Tu Luyện",
      sdb: "Auto Săn Dị Bảo",
      rr: "Auto Reroll",
    };
    runningList.push(kNames[AU.run.kind] || "Tác vụ Tự Động");
  }
  if (typeof combatAutoActive !== "undefined" && combatAutoActive) {
    runningList.push("Auto Tác Chiến");
  }
  if (runningList.length > 0) {
    UI.updateMiniStatus("Đang chạy: " + runningList.join(" | "), () => {
      if (AU.run && AU.run.running) auStop("Dừng từ thanh trạng thái");
      if (typeof setCombatAutoActive === "function") setCombatAutoActive(false);
      refreshMiniStatus();
    });
  } else {
    UI.updateMiniStatus(null);
  }
}

async function render() {
  TabLifecycle.cleanup();
  const prevScrollTop = body ? body.scrollTop : 0;
  const restoreScroll = () => {
    if (prevScrollTop > 0) {
      requestAnimationFrame(() => {
        if (body && body.scrollTop === 0 && prevScrollTop > 0) {
          body.scrollTop = prevScrollTop;
        }
      });
    }
  };
  if (S.tab === "km" || S.tab === "bld") S.tab = "akm"; // hai tab cũ đã gộp vào Hướng Build
  if (S.tab === "do") S.tab = "db"; // tab Dò Đồ Quý cũ đã quy về Dị Bảo
  drawTabs();
  refreshMiniStatus();
  body.onclick = null;
  try {
    if (S.tab === "tcv" || S.tab === "tcq") {
      S.abort = false;
      (S.tab === "tcv" ? tabVatPham : tabQuaiVat)();
      return;
    }
    if (S.tab === "arr") {
      S.abort = false;
      tabAutoReroll();
      return;
    }
    if (S.tab === "lhs") {
      S.abort = false;
      tabLuanHoi();
      return;
    } // Luân Hồi chạy được cả khi chưa vào kiếp nào
    if (S.tab === "lht") {
      S.abort = false;
      tabThanhTuu();
      return;
    }
    if (S.tab === "sv") {
      S.abort = false;
      tabLuuNapSave();
      return;
    } // Lưu & Nạp Save chạy được cả khi chưa vào kiếp nào
    if (!S.core) {
      const myTab = S.tab;
      body.innerHTML = `<div class="vk-card">⏳ <span id="vk-pg">Đang chuẩn bị…</span></div>`;
      // chỉ nạp code game MỘT lần dù người dùng bấm tab/làm mới liên tục trong lúc chờ (trước đây mỗi lần bấm nạp thêm một bản → nặng, đứng hình)
      if (!S.coreP)
        S.coreP = loadCore((m) => {
          const el = body.querySelector("#vk-pg");
          if (el) el.textContent = m;
        }).then(
          (k) => {
            S.core = k;
            return k;
          },
          (e) => {
            S.coreP = null;
            throw e;
          },
        );
      const wd = setTimeout(() => {
        const el = body.querySelector("#vk-pg");
        if (el && !S.core)
          el.parentElement.insertAdjacentHTML(
            "beforeend",
            '<div class="vk-mu" style="font-size:12px;margin-top:6px">Đang lâu hơn bình thường. Nếu quá 30 giây, bấm ↻ để thử lại.</div>',
          );
      }, 15000);
      try {
        await S.coreP;
      } finally {
        clearTimeout(wd);
      }
      if (S.tab !== myTab) return; // người dùng đã chuyển tab trong lúc chờ: lượt render của tab mới lo phần còn lại
    }
    if (!G().state.run) {
      body.innerHTML = `<div class="vk-card">Chưa có kiếp nào đang chơi. Vào game (tạo hoặc nạp kiếp) rồi bấm <b>Làm mới</b>.</div>`;
      return;
    }
    S.abort = false;
    if (S.core && S.core.sync) S.core.sync();
    syncCharHudBar();
    ({
      tq: () => {
        tabTongQuan();
        if (typeof gWin.tongQuanExtra === "function") gWin.tongQuanExtra();
      },
      sv: tabLuuNapSave,
      dp: tabDotPha2,
      tr: tabTran,
      tkc: tabTKC,
      bm: tabBanMenh,
      cho: tabCho,
      ld: tabLuyenDan,
      cph: tabCheePhu,
      lbo: tabLuyenBao,
      tph: tabTranPhap,
      tien: tabTien,
      bd: tabBanDo,
      tt: tabTreoThuong,
      db: tabDiBao,
      san: tabSan,
      tcv: tabVatPham,
      tcq: tabQuaiVat,
      tcd: tabDiaDanh,
      nlw: tabNLW,
      nlm: tabNLM,
      nls: tabNLS,
      nlv: tabNLV,
      nlc: tabNLC,
      lhd: tabDuTinhDiem,
      tkb: tabThienKieu,
      nmn: tabNhanMach,
      atl: tabAutoTuLuyen,
      atc: tabAutoTacChien,
      asdb: tabAutoSdb,
      abb: tabAutoBuon,
      asy: () => {
        S.tab = "atl";
        if (AU.cfg && AU.cfg.tl) {
          AU.cfg.tl.mode = "danh_quai";
          auSave();
        }
        tabAutoTuLuyen();
      },
      akm: tabAutoKm,
      bis: tabBis,
      arr: tabAutoReroll,
    })[S.tab]();
  } catch (e) {
    console.error(e);
    body.innerHTML =
      errBox(e) + '<button class="vk-btn sec" id="vk-retry">↻ Thử Lại</button>';
    const rb = body.querySelector("#vk-retry");
    if (rb)
      rb.onclick = () => {
        S.core = null;
        S.coreP = null;
        render();
      };
  } finally {
    restoreScroll();
  }
}

const progressHtml = (id) =>
  `<div id="${id}" style="display:none"><div class="vk-bar"><i></i></div><div class="vk-mu" style="font-size:13px"></div><button class="vk-btn sec vk-stop">Dừng</button></div>`;
function bindProgress(box) {
  box.style.display = "block";
  box.querySelector(".vk-stop").onclick = () => {
    S.abort = true;
  };
  return (f, label) => {
    box.querySelector("i").style.width = Math.round(f * 100) + "%";
    box.querySelector(".vk-mu").textContent =
      (label || "") + " " + Math.round(f * 100) + "%";
  };
}

// ── Tab Tổng quan
function tabTongQuan() {
  const K = S.core,
    c = ctx(),
    run = c.run,
    nv = run.nhanVat;
  const tho = K.thoNguyenToiDa(nv);
  const lc = nv.linhCan
    ? `${{ thien: "Thiên", bien_di: "Biến dị", song: "Song", tap: "Tạp", vo: "Vô" }[nv.linhCan.pham] || nv.linhCan.pham} linh căn (${(nv.linhCan.he || []).map(heTen).join(", ")})`
    : "—";
  let sect = '<div class="vk-mu">Chưa vào tông môn.</div>';
  const tm = K.tongMonCua(c);
  if (tm) {
    let ten = tm.slot;
    try {
      ten = c.world.info(tm.slot).diaDanh.ten;
    } catch {}
    const reasons = K.thieuDeThangCap(c);
    const next = K.CAP_BAC[tm.capBac + 1];
    sect = `<div class="vk-row"><span>Tông môn</span><b>${esc(ten)}</b></div>
      <div class="vk-row"><span>Cấp bậc</span><b>${esc(K.CAP_BAC[tm.capBac])}</b></div>
      <div class="vk-row"><span>Công tích</span><b>${Math.floor(tm.congTich)}</b></div>
      ${next ? `<div class="vk-row"><span>Lên ${esc(next)}</span>${reasons.length ? `<span class="vk-bad">${esc(reasons.join("; "))}</span>` : '<span class="vk-ok">Đủ điều kiện xin khảo hạch — xem tab Trận</span>'}</div>` : ""}`;
  }
  const nghe =
    Object.entries(nv.nghe || {})
      .map(
        ([k, v]) =>
          `${{ luyen_dan: "Luyện đan", che_phu: "Chế phù", luyen_bao: "Luyện bảo", tran_phap: "Trận pháp" }[k] || k}: bậc ${v.bac}, ${Math.floor(v.kinhNghiem)} kinh nghiệm`,
      )
      .join("<br>") || "—";
  // cơ duyên sắp hết hạn
  const seen = new Map();
  for (const l of run.log || []) if (l.expiresAt && l.key) seen.set(l.key, l);
  const dip =
    [...seen.values()]
      .filter((l) => l.expiresAt - run.nam >= 0.05)
      .sort((a, b) => a.expiresAt - b.expiresAt)
      .map(
        (l) =>
          `<div class="vk-row"><span>${esc(
            String(l.text)
              .replace(/còn [\d.,]+ năm\.?/, "")
              .replace(/[-]/g, ""),
          )}</span><b>${num(l.expiresAt - run.nam)} năm</b></div>`,
      )
      .join("") || '<div class="vk-mu">Không có.</div>';
  const thoPct = Math.min(
    100,
    Math.max(0, Math.round((nv.tuoi / Math.max(1, tho)) * 100)),
  );
  const remTho = Math.max(0, Math.floor(tho - nv.tuoi));
  body.innerHTML = `
    <div class="vkx-quick-bar">
      <button type="button" class="vkx-qact" data-qtab="atl"><span>🧘</span><div><b>Auto Tu Luyện</b><small>Bế quan & Đột phá</small></div></button>
      <button type="button" class="vkx-qact" data-qtab="db"><span>👑</span><div><b>Radar Dị Bảo</b><small>Dò & Săn Bảo Lục</small></div></button>
      <button type="button" class="vkx-qact" data-qtab="akm"><span>🧬</span><div><b>Hướng Build</b><small>Tối ưu Kinh Mạch</small></div></button>
      <button type="button" class="vkx-qact" data-qtab="dp"><span>⚡</span><div><b>Đột Phá & Thọ</b><small>Chuẩn bị Độ Kiếp</small></div></button>
      <button type="button" class="vkx-qact" data-qtab="atc"><span>⚔️</span><div><b>Siêu AI 3.0</b><small>Chiến thuật 5 pha</small></div></button>
    </div>

    <div class="vkx-dash-2col">
      <div class="vkx-dash-col">
        <div class="vk-card vkx-hero-card">
          <div class="vkx-hero-top">
            <div>
              <div class="vk-mu" style="font-size:11px;text-transform:uppercase;letter-spacing:0.6px">Đạo Hiệu Tu Chân Giả</div>
              <h3 style="margin:2px 0 0;font-size:17px">${esc(nv.ten)}</h3>
            </div>
            <span class="pl pl-pick" style="margin:0;font-size:12.5px;padding:5px 12px">☯ ${esc(realmLabel(nv.canhGioi, nv.tieuCanhGioi))}</span>
          </div>

          <div class="vkx-life-meter">
            <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px">
              <span>⏳ <b>Thọ Nguyên:</b> ${Math.floor(nv.tuoi)} / ${tho} năm</span>
              <b class="${remTho < 20 ? "vk-bad" : "vk-ok"}">Còn ${remTho} năm (${100 - thoPct}%)</b>
            </div>
            <div class="vk-bar" style="height:10px"><i style="width:${thoPct}%"></i></div>
          </div>

          <div class="vk-bento-grid">
            <div class="vk-bento-tile">
              <span class="vk-bento-lbl">🧬 Tư Chất Linh Căn</span>
              <span class="vk-bento-val" style="font-size:12.5px;color:var(--acc2)">${esc(lc)}</span>
            </div>
            <div class="vk-bento-tile">
              <span class="vk-bento-lbl">💎 Linh Thạch · Cống Hiến</span>
              <span class="vk-bento-val" style="color:var(--ok)">${num(Math.floor(nv.linhThach || 0))} <small class="vk-mu">/ ${num(Math.floor(nv.congHien || 0))}</small></span>
            </div>
            <div class="vk-bento-tile">
              <span class="vk-bento-lbl">⚔️ Lịch Luyện · Thương Thế</span>
              <span class="vk-bento-val">${num(nv.lichLuyen || 0)} · ${nv.thuongThe ? `<span class="vk-bad">Thương ${nv.thuongThe}</span>` : '<span class="vk-ok">Lành lặn</span>'}</span>
            </div>
            <div class="vk-bento-tile">
              <span class="vk-bento-lbl">🌀 Khai Thông Kinh Mạch</span>
              <span class="vk-bento-val" style="color:var(--acc)">${(nv.kinhMach.cho && nv.kinhMach.cho.mo) || 0} lượt chờ</span>
            </div>
          </div>

          <div style="margin-top:10px;padding-top:8px;border-top:1px dashed var(--line)">
            <div class="vk-bento-lbl" style="margin-bottom:4px">🛠️ Bậc Nghề Tu Chân</div>
            <div style="font-size:12.5px;line-height:1.5">${nghe}</div>
          </div>
          ${(nv.lichLuyen || 0) < 2 ? '<div class="vk-note" style="border-left-color:var(--bad);color:#fda4af">⚠️ Lịch luyện sắp cạn — hãy đi đánh quái hoặc du lịch xa để hồi phục.</div>' : ""}
        </div>

        <div class="vk-card" style="border-left:3px solid var(--acc)">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
            <h3 style="margin:0">💾 Hộ Pháp Lưu & Nạp Save (Tránh Thiên Đạo)</h3>
            <button class="vk-btn sec" id="tq-btn-to-sv" style="padding:4px 10px;font-size:11.5px;margin:0">Mở Tab Save ➜</button>
          </div>
          <div style="font-size:12px;color:var(--mut);margin-bottom:8px">
            Lưu điểm dự phòng tức thì trước khi Xung Kích Cảnh Giới / Đoạt Bảo, hoặc tẩy dấu vết Thiên Đạo.
          </div>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:6px">
            <button class="vk-btn" id="tq-btn-quicksave" style="margin:0;padding:7px 10px;font-size:12px">⚡ Quick Save</button>
            <button class="vk-btn sec" id="tq-btn-export" style="margin:0;padding:7px 10px;font-size:12px">💾 Tải Save (.txt)</button>
            <button class="vk-btn sec" id="tq-btn-cleantd" style="margin:0;padding:7px 10px;font-size:12px" title="Xóa toàn bộ bộ nhớ theo dõi của Thiên Đạo">🧹 Tẩy Thiên Đạo</button>
          </div>
        </div>
      </div>

      <div class="vkx-dash-col">
        <div class="vk-card"><h3>🏛️ Sư Môn & Khảo Hạch</h3><div class="vkx-kv-list">${sect}</div></div>
        <div class="vk-card"><h3>⏳ Cơ Duyên Sắp Hết Hạn</h3><div class="vkx-kv-list">${dip}</div></div>
        <div class="vk-card">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:6px">
            <h3 style="margin:0">⚔️ Đài Thử Sức Chiến Lực</h3>
            <button class="vk-btn" id="vk-dmb" style="margin:0;padding:5px 12px;font-size:12px">⚡ Đánh Thử Ngay</button>
          </div>
          <div id="vk-dm" class="vk-mu" style="font-size:12.5px">Mô phỏng thực chiến với toàn bộ quái cùng cảnh giới và vượt cấp dựa trên Kinh Mạch hiện tại.</div>
        </div>
      </div>
    </div>
    <div class="vk-mu" style="font-size:11.5px;text-align:center;margin-top:4px">Huyền Thiên Đạo Đài OS v${TOOL_VER} · Lõi Game ${esc(K.bundle)}</div>`;

  body.querySelectorAll(".vkx-qact").forEach((btn) => {
    btn.onclick = () => {
      const qt = btn.getAttribute("data-qtab");
      if (qt) {
        S.abort = true;
        S.tab = qt;
        render();
      }
    };
  });
  const tqToSv = body.querySelector("#tq-btn-to-sv");
  if (tqToSv) {
    tqToSv.onclick = () => {
      S.tab = "sv";
      render();
    };
  }
  const tqQs = body.querySelector("#tq-btn-quicksave");
  if (tqQs) {
    tqQs.onclick = () => {
      const note = prompt(
        "Nhập ghi chú cho bản lưu nhanh (hoặc để trống):",
        "",
      );
      if (note === null) return;
      const res = gWin.saveQuickSave(note);
      if (res.ok) {
        try {
          UI.notify(res.msg);
        } catch (e) {}
      } else {
        alert("⚠️ " + res.msg);
      }
    };
  }
  const tqExp = body.querySelector("#tq-btn-export");
  if (tqExp) {
    tqExp.onclick = () => {
      const exp = gWin.doExportSave();
      if (exp.ok) {
        gWin.downloadSaveFile(exp.data, exp.fileName);
        try {
          UI.notify("💾 Đã tải tệp save: " + exp.fileName);
        } catch (e) {}
      } else {
        alert("⚠️ " + exp.msg);
      }
    };
  }
  const tqClean = body.querySelector("#tq-btn-cleantd");
  if (tqClean) {
    tqClean.onclick = () => {
      gWin.cleanseThienDao();
      try {
        UI.notify("🧹 Đã thanh tẩy sạch sẽ mọi dấu vết Thiên Đạo!");
      } catch (e) {}
      alert(
        "🧹 Đã thanh tẩy thành công toàn bộ dữ liệu theo dõi của Thiên Đạo!",
      );
    };
  }
  body.querySelector("#vk-dmb").onclick = async (ev) => {
    ev.target.disabled = true;
    const out = body.querySelector("#vk-dm");
    out.textContent = "Đang đánh thử…";
    await sleep0();
    const P = K.taoBenTa(nvNow(), C());
    const res = [];
    for (const tc of [0, 1, 2, 3]) {
      let w = 0,
        n = 0;
      for (const def of C().enemies.values()) {
        let E;
        try {
          E = enemyAt(def, nv.canhGioi, tc);
        } catch {
          continue;
        }
        n++;
        if (fight(P, E).thang) w++;
      }
      res.push(
        `<div class="vk-row"><span>Quái ${esc(realmName(nv.canhGioi))} ${STAGE[tc]}</span><b>thắng ${w}/${n} (${pct(w / Math.max(1, n))})</b></div>`,
      );
      out.innerHTML = res.join("");
      await sleep0();
    }
    let w = 0,
      n = 0;
    for (const def of C().enemies.values()) {
      let E;
      try {
        E = enemyAt(def, nv.canhGioi + 1, 0);
      } catch {
        continue;
      }
      n++;
      if (fight(P, E).thang) w++;
    }
    res.push(
      `<div class="vk-row"><span>Quái ${esc(realmName(nv.canhGioi + 1))} Sơ</span><b>thắng ${w}/${n} (${pct(w / Math.max(1, n))})</b></div>`,
    );
    out.innerHTML =
      res.join("") +
      '<div class="vk-mu" style="font-size:12px">Tính với kinh mạch đang xếp trong game.</div>';
  };
}

// Xuất giao diện điều khiển Assist cho Mod Entrypoint
const Assist = {
  render: () => render(),
  stop: () => {
    if (!kmAutoRunning()) S.abort = true;
  },
};

export {
  TABS,
  TNAME,
  GROUPS,
  grpOf,
  keepVisible,
  drawTabs,
  errBox,
  refreshMiniStatus,
  render,
  progressHtml,
  bindProgress,
  tabTongQuan,
  Assist,
};

Object.assign(gWin, {
  TABS,
  TNAME,
  GROUPS,
  grpOf,
  keepVisible,
  drawTabs,
  errBox,
  refreshMiniStatus,
  render,
  progressHtml,
  bindProgress,
  tabTongQuan,
  Assist,
});
