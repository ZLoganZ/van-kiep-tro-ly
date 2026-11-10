import { gWin, TOOL_VER, TT, MOD } from "../core/utils.js";
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
  else if (r.right > s.right)
    strip.scrollLeft += (r.right - s.right + 8) / k;
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

  let groupBtns = groupsEl.querySelectorAll("button");
  if (groupBtns.length !== GROUPS.length) {
    const gh = GROUPS.map(
      (x) =>
        `<button data-g="${x[0]}" class="${x === g ? "on" : ""}">${x[1]}</button>`,
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
    // Chuyển tab trong cùng một nhóm: KHÔNG đụng vào innerHTML!
    for (let i = 0; i < tabBtns.length; i++) {
      const b = tabBtns[i];
      b.classList.toggle("on", b.dataset.k === S.tab);
    }
  } else {
    // Chuyển sang nhóm khác hoặc lần đầu khởi tạo: tạo mới các nút của nhóm mới
    const th = g[2]
      .map(
        (k) =>
          `<button data-k="${k}" class="${k === S.tab ? "on" : ""}">${TNAME[k] || k}</button>`,
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

// Cập nhật Mini Status Bar toàn cục theo trạng thái các tác vụ Auto
function refreshMiniStatus() {
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
    ({
      tq: () => {
        tabTongQuan();
        tongQuanExtra();
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
      errBox(e) +
      '<button class="vk-btn sec" id="vk-retry">↻ Thử Lại</button>';
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
  for (const l of run.log || [])
    if (l.expiresAt && l.key) seen.set(l.key, l);
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
  body.innerHTML = `
    <div class="vk-card"><h3>${esc(nv.ten)}</h3>
      <div class="vk-row"><span>Cảnh giới</span><b>${esc(realmLabel(nv.canhGioi, nv.tieuCanhGioi))}</b></div>
      <div class="vk-row"><span>Tuổi / thọ</span><b>${Math.floor(nv.tuoi)} / ${tho} <span class="vk-mu">(còn ${Math.floor(tho - nv.tuoi)} năm)</span></b></div>
      <div class="vk-row"><span>Linh căn</span><b>${esc(lc)}</b></div>
      <div class="vk-row"><span>Thương thế</span><b>${nv.thuongThe ? `<span class="vk-bad">${nv.thuongThe} bậc</span>` : "Lành lặn"}</b></div>
      <div class="vk-row"><span>Lịch luyện</span><b>${num(nv.lichLuyen || 0)}${(nv.lichLuyen || 0) < 2 ? ' <span class="vk-bad">sắp cạn — đi đánh/đi xa để hồi</span>' : ""}</b></div>
      <div class="vk-row"><span>Linh thạch · Cống hiến</span><b>${Math.floor(nv.linhThach || 0)} · ${Math.floor(nv.congHien || 0)}</b></div>
      <div class="vk-row"><span>Nghề</span><b style="text-align:right">${nghe}</b></div>
      <div class="vk-row"><span>Lượt khai thông kinh mạch</span><b>${(nv.kinhMach.cho && nv.kinhMach.cho.mo) || 0}</b></div>
    </div>
    <div class="vk-card"><h3>Sư môn</h3>${sect}</div>
    <div class="vk-card"><h3>Cơ duyên sắp hết hạn</h3>${dip}</div>
    <div class="vk-card" style="border-left:3px solid #8b5cf6">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
<h3 style="margin:0;color:#a78bfa">💾 Lưu & Nạp Save (Tránh Thiên Đạo)</h3>
<button class="vk-btn sec" id="tq-btn-to-sv" style="padding:3px 10px;font-size:12px;margin:0">Mở Tab Save ➜</button>
      </div>
      <div style="font-size:12px;color:var(--mut);margin-bottom:8px">
Lưu điểm dự phòng nhanh trước khi Đột Phá / Giao Chiến, hoặc nạp file save mà không lo Thiên Đạo phạt.
      </div>
      <div style="display:flex;gap:6px;flex-wrap:wrap">
<button class="vk-btn" id="tq-btn-quicksave" style="padding:5px 12px;font-size:12px;background:#3ddc97;color:#05140d">⚡ Quick Save Ngay</button>
<button class="vk-btn sec" id="tq-btn-export" style="padding:5px 12px;font-size:12px">💾 Tải File Save (.txt)</button>
<button class="vk-btn sec" id="tq-btn-cleantd" style="padding:5px 12px;font-size:12px" title="Xóa toàn bộ bộ nhớ theo dõi của Thiên Đạo">🧹 Tẩy Thiên Đạo</button>
      </div>
    </div>
    <div class="vk-card"><h3>Độ mạnh chung</h3><div id="vk-dm" class="vk-mu">Bấm để đánh thử với mọi loại quái cùng cảnh giới.</div><button class="vk-btn" id="vk-dmb">Đánh thử</button></div>
    <div class="vk-mu" style="font-size:12px;text-align:center">Tool ${TOOL_VER} · game ${esc(K.bundle)}</div>`;
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
      const res = saveQuickSave(note);
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
      const exp = doExportSave();
      if (exp.ok) {
        downloadSaveFile(exp.data, exp.fileName);
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
      cleanseThienDao();
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
