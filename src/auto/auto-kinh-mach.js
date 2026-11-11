import { gWin, num, esc } from "../core/utils.js";
import { UI } from "../ui/shell.js";
import { S, body, loadCore, G, C, clone, nvNow, has } from "../core/bridge.js";
import { evalCurrent, drawGrid } from "../modules/kinh-mach-engine.js";
import { drawTabs, errBox } from "../modules/navigation.js";
import { isKmItem, kmAborted, kmApplyDiff, kmApplyLoadouts, kmSolve, kmOpenSearch, HE_VI, findOptimalRecolors, statRows } from "../modules/kinh-mach-tab.js";
import { BUILDS, HB_RATIO, HB_RATIO_W, hbScanBuilds } from "../modules/huong-build.js";
import { AU, auSleep, auLog, auPaintSoon, clearAuPaintTimer, auCall } from "./auto-core.js";
/**
 * Module: Auto Kinh Mạch (Tự Động Mở Ô, Tẩy Tủy & Xếp Mạch)
 */
// ═════════ AUTO KINH MẠCH ═════════
// Tìm cách xếp tốt nhất rồi ÁP DỤNG BẰNG HÀM CỦA GAME (gỡ, đặt, đổi bộ, mở ô). Không đụng việc nguy hiểm: game bận (đang có sự kiện / trận) thì đợi hoặc dừng.
// Đổi cách xếp cũng làm món mới phải Lĩnh Ngộ lại từ đầu, nên chỉ đổi khi điểm tăng đủ lớn.
const AU_KM_MO_MIN = 10; // chỉ tự mở ô khi lợi từ ngần này điểm (1 trận mẫu thắng thêm ≈ 11 điểm)
const AU_KM_MIN_GAIN = 2; // chỉ đổi cách xếp khi tốt hơn ngần này điểm
const AU_KM_MODE = [
  ["bal", "🎯 Cân Bằng (Chiến Đấu + Tu Luyện)"],
  ["danh", "⚔️ Ưu Tiên Chiến Đấu (PvP / PvE Đi Ải)"],
  ["tu", "🧘 Ưu Tiên Tu Luyện (AFK Treo Máy)"],
  ["dot_pha", "⚡ Ưu Tiên Đột Phá Cảnh Giới"],
  ["tank", "🛡️ Thể Tu Thiết Bích (Thủ Trâu · Phản Đòn)"],
  ["burst", "🗡️ Kiếm Tu Bạo Kích (Nhất Kích Tất Sát)"],
];
const AU_KM_IT = [
  [1500, "Nhanh (1.500 vòng)"],
  [3000, "Vừa (3.000 vòng)"],
  [6000, "Kỹ (6.000 vòng)"],
  [12000, "Rất Kỹ (12.000 vòng)"],
  [24000, "Cực Hạn (24.000 vòng)"],
];
const AU_KM_BK = 5; // 6.19: bỏ ô chọn Độ Ép Hướng Sinh / Khắc, cố định ở mức Mạnh

// Đặt các thiết lập chung của bộ xếp theo cấu hình Auto, trả về hàm khôi phục.
function auKmPin(c) {
  const old = {
    dir: S.dir,
    prio: S.prio,
    full: S.full,
    biasK: S.biasK,
    kmBuild: S.kmBuild,
    hbRatio: S.hbRatio,
    hbMaxSkills: S.hbMaxSkills,
    hbLite: S.hbLite,
  };
  try {
    hbScanBuilds();
  } catch (e) {
    /* dùng danh sách tĩnh */
  }
  const b = c.kb ? BUILDS.find((x) => x.k === c.kb) : null;
  S.dir = c.dir || (b ? (b.nhom === "Tà đạo" ? "ma" : "tien") : "");
  S.prio = !!c.prio;
  S.full = false;
  S.biasK = AU_KM_BK;
  S.kmBuild = b ? b.k : "";
  const rt = HB_RATIO[c.ratio];
  S.hbRatio = rt && rt[1] != null ? { t: rt[1], w: HB_RATIO_W } : null;
  S.hbMaxSkills =
    c.maxSkills != null
      ? Number(c.maxSkills)
      : rt && rt[1] >= 0.6
        ? 3
        : 4;
  S.hbLite = false;
  return () => {
    Object.assign(S, old);
  };
}
// Dấu hiệu "có gì đổi đáng xếp lại": công pháp / pháp khí trong túi, trạng thái và màu ô, cảnh giới, thể chất. Độ Lĩnh Ngộ trôi theo năm nên không tính.
const auKmSig = (nv) =>
  JSON.stringify([
    Object.keys(nv.tuiDo || {})
      .filter((id) => nv.tuiDo[id] > 0 && isKmItem(C().items.get(id)))
      .sort(),
    nv.kinhMach.trangThai,
    nv.kinhMach.mau,
    nv.kinhMach.huyetGoc || [],
    nv.kinhMach.huyetThem || [],
    nv.canhGioi,
    nv.tieuCanhGioi,
    nv.theChat,
  ]);

// 7.15.3: Hàm áp dụng toàn diện cách xếp kinh mạch (Tẩy ô + Đặt mảnh / 2 bộ) dùng chung cho cả Auto và nút Áp Dụng Xem Trước
async function auKmApplySolution(sols, cfg, st = null, force = false) {
  const K = S.core;
  let nv = nvNow();
  if (!nv || !nv.kinhMach)
    return { ok: false, msg: "Chưa có kinh mạch." };
  if (!sols || !sols.length)
    return { ok: false, msg: "Chưa có cách xếp để áp dụng." };

  // 1. Tẩy ô nếu bật cfg.tayO
  if (cfg && cfg.tayO) {
    const allPlans = [];
    const seenPlanCells = new Set();
    for (const s of sols) {
      const plans = s.recolorPlan || (s.best && s.best.recolorPlan);
      if (Array.isArray(plans)) {
        for (const p of plans) {
          if (!seenPlanCells.has(p.cell)) {
            seenPlanCells.add(p.cell);
            allPlans.push(p);
          }
        }
      }
    }
    for (const p of allPlans) {
      if (st && st.stop) break;
      let curDoiMau = (nv.kinhMach.cho && nv.kinhMach.cho.doiMau) || 0;
      if (curDoiMau <= 0) {
        const pillOrder = [
          { id: "item.tay_tuy_dan", bac: 1, name: "Tẩy Tủy Đan" },
          { id: "item.cai_menh_dan", bac: 2, name: "Cải Mệnh Đan" },
          { id: "item.dich_cot_dan", bac: 3, name: "Dịch Cốt Đan" },
        ];
        for (const pill of pillOrder) {
          const countInBag = (nv.tuiDo && nv.tuiDo[pill.id]) || 0;
          const canUse =
            K && K.tayConLai ? K.tayConLai(nv, pill.bac) : 1;
          if (countInBag > 0 && canUse > 0) {
            const useRes = auCall((gg) => gg.useItem(pill.id));
            if (useRes.ok) {
              auLog(
                `Đã dùng 1 viên ${pill.name} để nhận lượt chuyển hệ.`,
                "vk-ok",
              );
              nv = nvNow();
              curDoiMau =
                (nv.kinhMach.cho && nv.kinhMach.cho.doiMau) || 0;
              break;
            }
          }
        }
      }
      if (curDoiMau <= 0) {
        auLog(
          "Không còn lượt chuyển hệ và không có đan tẩy tủy trong túi để dùng.",
          "vk-mu",
        );
        break;
      }
      const r = auCall((gg) => gg.doiMauO(p.cell, p.toHe));
      if (r.ok) {
        if (st) st.recolorsDone = (st.recolorsDone || 0) + 1;
        auLog(
          `🎨 Đã tẩy ô (Cột ${p.col}, Hàng ${p.row}) từ hệ ${HE_VI[p.fromHe] || p.fromHe} sang ${HE_VI[p.toHe] || p.toHe} để khớp công pháp «${p.itTen}».`,
          "vk-ok",
        );
        nv = nvNow();
      } else {
        auLog(
          `Không tẩy được ô (Cột ${p.col}, Hàng ${p.row}): ${r.err || "thất bại"}`,
          "vk-mu",
        );
        break;
      }
    }
    nv = nvNow();
  }

  // 2. Áp dụng kinh mạch (Hai bộ hoặc Một bộ)
  if (cfg && cfg.two) {
    const r = await kmApplyLoadouts(
      sols.map((s) => s.best.manh),
      { mo: !!cfg.moBo, keep: cfg.keep === "danh" ? 1 : 0 },
    );
    if (!r.ok) return r;
    if (st) st.applied++;
    auLog(r.msg, "vk-ok");
    return { ok: true, msg: r.msg };
  }

  const s0 = sols[0];
  const gain = (s0.bestSim || s0.best).score - s0.cur.score;
  if (!force && (s0.best.same || gain < AU_KM_MIN_GAIN)) {
    auLog(
      "Cách đang xếp đã là tốt nhất Tool tìm được (điểm " +
        num(s0.cur.score, 0) +
        ").",
      "vk-ok",
    );
    return { ok: true, msg: "Cách đang xếp đã là tốt nhất." };
  }

  const r = await kmApplyDiff(s0.best.manh);
  if (!r.ok) return r;
  if (st) st.applied++;
  if (r.same) {
    const txtSame =
      "Kinh mạch đã chuẩn xác như cách xếp, không cần đổi.";
    auLog(txtSame, "vk-ok");
    return { ok: true, msg: txtSame };
  }
  const txt =
    "Đã xếp lại kinh mạch: điểm " +
    num(s0.cur.score, 0) +
    " → " +
    num((s0.bestSim || s0.best).score, 0) +
    ", thắng trận mẫu " +
    s0.cur.wins +
    "/" +
    s0.cur.n +
    " → " +
    s0.best.wins +
    "/" +
    s0.best.n +
    " (gỡ " +
    r.removed +
    ", đặt " +
    r.added +
    ").";
  auLog(txt, "vk-ok");
  return { ok: true, msg: txt };
}

// Một lượt: (mở ô nếu bật) → tìm cách xếp → áp dụng. Trả về { ok, note } | { stop } | { retry }.
async function auKmPass(st) {
  const cfg = AU.cfg.km,
    K = S.core,
    restore = auKmPin(cfg);
  const P = (a, b, lab) => (f, l) => {
    st.prog = a + (b - a) * Math.max(0, Math.min(1, f));
    st.label = l || lab;
    auPaintSoon();
  };
  try {
    S.abort = false;
    S.kmAbort = false;
    let nv = nvNow();
    if (!nv.kinhMach) return { stop: "Nhân vật chưa có kinh mạch." };
    if (
      !Object.keys(nv.tuiDo || {}).some(
        (id) => nv.tuiDo[id] > 0 && isKmItem(C().items.get(id)),
      )
    )
      return {
        stop: "Trong túi chưa có công pháp hay pháp khí nào để xếp.",
      };
    const modes = cfg.two ? ["tu", "danh"] : [cfg.mode];
    const useOpen = !!cfg.mo && !st.dry;
    // 1) Mở ô
    if (useOpen) {
      let n = 0;
      while (
        n < cfg.moMax &&
        !st.stop &&
        !kmAborted() &&
        ((nv.kinhMach.cho || {}).mo || 0) > 0
      ) {
        st.phase = "open";
        const { res } = await kmOpenSearch(
          nv,
          cfg.two ? "bal" : cfg.mode,
          P(0, 0.25, "Dò Ô Nên Mở"),
        );
        if (st.stop || kmAborted()) return { stop: "Bạn bấm Dừng" };
        const top = res[0];
        if (!top || top.gain < AU_KM_MO_MIN) {
          auLog(
            "Chưa có ô nào đáng mở (cần lợi từ " +
              AU_KM_MO_MIN +
              " điểm); giữ lại lượt khai thông.",
          );
          break;
        }
        const g = K.luoiKinhMach(C(), nv),
          where =
            "cột " +
            ((top.i % g.rong) + 1) +
            ", hàng " +
            (Math.floor(top.i / g.rong) + 1);
        const r = auCall((gg) => gg.moO(top.i));
        if (!r.ok) {
          auLog("Không mở được ô " + where + ": " + r.err, "vk-bad");
          if (/bận/i.test(r.err)) return { retry: r.err };
          break;
        }
        n++;
        st.opened++;
        auLog(
          "Đã mở ô " +
            where +
            " (lợi ≈ +" +
            Math.round(top.gain) +
            " điểm).",
          "vk-ok",
        );
        nv = nvNow();
      }
    }
    // 2) Tìm cách xếp
    const sols = [],
      a0 = useOpen ? 0.25 : 0;
    for (let k = 0; k < modes.length; k++) {
      st.phase = "solve";
      const lab = cfg.two
        ? modes[k] === "tu"
          ? "Bộ Tu Luyện"
          : "Bộ Đánh"
        : "Tìm Cách Xếp";
      const sol = await kmSolve(
        nv,
        modes[k],
        cfg.iters,
        P(
          a0 + ((1 - a0) * k) / modes.length,
          a0 + ((1 - a0) * (k + 1)) / modes.length,
          lab,
        ),
      );
      if (!sol) return { stop: "Bạn bấm Dừng" };

      // Lập kế hoạch tẩy ô nếu bật cfg.tayO
      if (cfg.tayO) {
        const recolors = findOptimalRecolors(
          nv,
          sol.best.manh,
          cfg.tayMax,
        );
        if (recolors.length > 0) {
          sol.recolorPlan = recolors;
          sol.best.recolorPlan = recolors;
          try {
            const nvSim = clone(nv);
            for (const r of recolors) {
              nvSim.kinhMach.mau[r.cell] = r.toHe;
            }
            nvSim.kinhMach.manh = sol.best.manh;
            const simBest = evalCurrent(nvSim, modes[k]);
            if (simBest) {
              simBest.recolorPlan = recolors;
              sol.bestSim = simBest;
            }
          } catch (e) {}
        }
      }

      sols.push(sol);
    }
    st.last = sols.map((s) => ({
      cur: s.cur.score,
      best: (s.bestSim || s.best).score,
    }));
    AU.kmPrev = { nv, modes, sols };
    if (st.dry) {
      st.phase = "done";
      return {
        ok: true,
        note: "Đã tính xong, chưa áp dụng (xem trước).",
      };
    }
    // 3) Áp dụng
    st.phase = "apply";
    st.label = "Áp dụng vào game";
    auPaintSoon();

    const appRes = await auKmApplySolution(sols, cfg, st, false);
    if (!appRes.ok) {
      return /bận/i.test(appRes.msg)
        ? { retry: appRes.msg }
        : { stop: appRes.msg };
    }
    return { ok: true, note: appRes.msg };
  } finally {
    restore();
  }
}

function auStartKm(dry) {
  if (AU.run && AU.run.running) {
    auPaint();
    return;
  }
  const g = G();
  if (!g || !g.state || !g.state.run) {
    UI.notify("Chưa có kiếp nào đang chơi.");
    return;
  }
  if (g.state.run.ketThuc) {
    UI.notify("Kiếp này đã kết thúc.");
    return;
  }
  auReadCfg("km");
  AU.run = {
    kind: "km",
    running: true,
    stop: false,
    dry: !!dry,
    steps: 0,
    passes: 0,
    opened: 0,
    recolorsDone: 0,
    applied: 0,
    msg: "",
    phase: "plan",
    prog: 0,
    label: "",
    ok: false,
    t0: performance.now(),
    tEnd: 0,
  };
  S.kmAbort = false;
  auLog(
    dry
      ? "Bắt đầu Auto Kinh Mạch (xem trước, không áp dụng)."
      : "Bắt đầu Auto Kinh Mạch.",
    "vk-ok",
  );
  drawTabs();
  auKmLoop(AU.run);
}
async function auKmLoop(st) {
  const cfg = AU.cfg.km;
  try {
    if (!S.core)
      S.core = await loadCore((m) => {
        st.label = m;
        auPaintSoon();
      });
    let lastSig = null;
    while (!st.stop) {
      const run = G().state.run;
      if (!run || run.ketThuc) {
        st.msg = "Kiếp đã kết thúc.";
        break;
      }
      const sig = auKmSig(nvNow());
      if (lastSig === null || sig !== lastSig) {
        st.phase = "plan";
        st.prog = 0;
        st.label = "";
        const res = await auKmPass(st);
        st.passes++;
        if (st.stop) {
          st.msg = st.msg || "Bạn bấm Dừng";
          break;
        }
        if (res && res.stop) {
          st.msg = res.stop;
          break;
        }
        if (res && res.retry) {
          if (!cfg.watch) {
            st.msg =
              "Game đang bận (" +
              res.retry +
              "). Xử lý xong việc đang dở rồi chạy lại.";
            break;
          }
          st.phase = "wait";
          st.label = "Game đang bận, đợi rồi thử lại";
          auPaintSoon();
          await auSleep(3000);
          continue;
        }
        st.ok = true;
        if (st.dry || !cfg.watch) {
          st.msg = (res && res.note) || "Đã xong.";
          break;
        }
        lastSig = auKmSig(nvNow());
        st.phase = "watch";
        st.label = "Đang theo dõi: đồ hoặc ô đổi sẽ tự xếp lại";
        auPaintSoon();
      }
      await auSleep(1500);
    }
  } catch (e) {
    console.error(e);
    st.msg = "Lỗi: " + ((e && e.message) || e);
    st.ok = false;
  }
  S.kmAbort = false;
  st.running = false;
  st.stop = false;
  st.tEnd = performance.now();
  st.phase = "done";
  auLog(
    "Dừng: " + (st.msg || "theo yêu cầu") + ".",
    st.ok ? "vk-ok" : "vk-bad",
  );
  try {
    UI.notify("Auto Kinh Mạch dừng: " + (st.msg || "theo yêu cầu"));
  } catch (e) {
    /* bỏ qua */
  }
  clearAuPaintTimer();
  drawTabs();
  auPaint();
  auKmPreview();
}
function auKmStatus(st) {
  const PH = {
    plan: "Chuẩn Bị",
    open: "Dò Ô Nên Mở",
    solve: "Tìm Cách Xếp",
    apply: "Áp Dụng Vào Game",
    watch: "Theo Dõi",
    wait: "Đợi Game Rảnh",
    done: "Xong",
  };
  const rows = [
    [
      "Trạng Thái",
      st.running
        ? '<span class="vk-ok">Đang chạy…</span> · ' +
          esc(PH[st.phase] || st.phase)
        : "Đã dừng",
    ],
  ];
  if (st.running)
    rows.push([
      "Tiến Độ",
      esc(st.label || "") +
        " " +
        Math.round((st.prog || 0) * 100) +
        "%",
    ]);
  else rows.push(["Lý Do Dừng", esc(st.msg || "—")]);
  rows.push(
    ["Số Lần Xếp Lại", st.applied || 0],
    ["Số Ô Đã Mở", st.opened || 0],
    ["Số Ô Đã Tẩy", st.recolorsDone || 0],
  );
  if (st.last && st.last.length)
    rows.push([
      "Điểm Trước → Sau",
      st.last
        .map((x) => num(x.cur, 0) + " → " + num(x.best, 0))
        .join(" · "),
    ]);
  return rows
    .map(
      (r) =>
        `<div class="vk-row"><span>${r[0]}</span><b>${r[1]}</b></div>`,
    )
    .join("");
}
function auKmPreview() {
  const box = body.querySelector("#au-info"),
    Pv = AU.kmPrev;
  if (!box || !Pv || S.tab !== "akm") return;
  try {
    const nm = {
      bal: "Cách Xếp Tốt Nhất",
      danh: "Bộ Đánh",
      tu: "Bộ Tu Luyện",
    };
    const cfg = AU.cfg.km;
    let recolorHtml = "";
    const allPlans = [];
    const seenCells = new Set();
    for (const s of Pv.sols) {
      const plans = s.recolorPlan || (s.best && s.best.recolorPlan);
      if (Array.isArray(plans)) {
        for (const p of plans) {
          if (!seenCells.has(p.cell)) {
            seenCells.add(p.cell);
            allPlans.push(p);
          }
        }
      }
    }
    if (allPlans.length > 0) {
      recolorHtml = `
        <div style="margin-top:10px;background:rgba(59,130,246,0.08);border:1px solid rgba(59,130,246,0.3);border-radius:8px;padding:8px 12px">
          <div style="display:flex;align-items:center;gap:6px;font-weight:700;color:#3b82f6;font-size:13px">
            <span>🎨</span> <span>Kế Hoạch Tẩy Ô Đề Xuất (${allPlans.length} ô):</span>
          </div>
          <div class="vk-mu" style="font-size:11.5px;margin-top:2px">Sẽ tự động chuyển hệ khi bấm Áp Dụng (tự cắn đan trong túi nếu hết lượt):</div>
          <div style="margin-top:6px;display:flex;flex-direction:column;gap:5px">
            ${allPlans
              .map(
                (p) => `
              <div style="font-size:12px;display:flex;align-items:center;gap:6px;flex-wrap:wrap">
                <span style="font-weight:600">📍 Ô Cột ${p.col}, Hàng ${p.row}:</span>
                <span style="color:var(--mut)">Hệ ${esc(HE_VI[p.fromHe] || p.fromHe)}</span>
                <span>➜</span>
                <b style="color:#10b981">Hệ ${esc(HE_VI[p.toHe] || p.toHe)}</b>
                <span class="vk-mu">(khớp «${esc(p.itTen)}»)</span>
              </div>
            `,
              )
              .join("")}
          </div>
        </div>
      `;
    }

    const isAlreadyBest =
      Pv.sols.every((s) => s.best.same) && allPlans.length === 0;
    const applyBtnHtml = `
      <div style="margin-top:12px">
        <button class="vk-btn au-go" id="au-km-apply-prev" style="width:100%;padding:10px 14px;font-size:13.5px;font-weight:bold;background:linear-gradient(135deg,#10b981,#059669);box-shadow:0 2px 8px rgba(16,185,129,0.3);display:flex;align-items:center;justify-content:center;gap:8px">
          <span>✅</span> <span>${isAlreadyBest ? "Kinh Mạch Đã Tối Ưu (Bấm Để Áp Dụng Lại)" : "Áp Dụng Ngay Cách Xếp Này Vào Game"}</span>
        </button>
      </div>
    `;

    box.innerHTML =
      '<div class="vk-mu" style="font-size:12px;margin-top:8px">Kết quả lần tính gần nhất (ảnh là cách xếp Tool chọn; "Đang xếp" là lúc bắt đầu tính).</div>' +
      recolorHtml +
      Pv.sols
        .map(
          (s, k) =>
            `<div style="margin-top:10px"><b>${Pv.modes.length > 1 ? k + 1 + ". " : ""}${esc(nm[Pv.modes[k]] || Pv.modes[k])}</b>${s.best.same ? ' <span class="vk-mu" style="font-size:12px">(giữ nguyên cách đang xếp)</span>' : ""}${drawGrid(Pv.nv, s.best.manh)}${statRows(s.cur, s.bestSim || s.best)}</div>`,
        )
        .join("") +
      applyBtnHtml;

    const applyBtn = box.querySelector("#au-km-apply-prev");
    if (applyBtn) {
      applyBtn.onclick = async () => {
        applyBtn.disabled = true;
        applyBtn.innerHTML =
          "<span>⏳</span> <span>Đang áp dụng vào game…</span>";
        try {
          const res = await auKmApplySolution(Pv.sols, cfg, null, true);
          if (res && res.ok) {
            UI.notify("Đã áp dụng thành công cách xếp vào game!");
            const nvAfter = nvNow();
            Pv.nv = nvAfter;
            for (let idx = 0; idx < Pv.sols.length; idx++) {
              try {
                Pv.sols[idx].cur = evalCurrent(nvAfter, Pv.modes[idx]);
                Pv.sols[idx].best.same = true;
              } catch (e) {}
            }
            drawTabs();
            auPaintSoon();
            auKmPreview();
          } else {
            UI.notify(
              "Không thể áp dụng: " +
                ((res && (res.msg || res.err)) || "Game bận"),
            );
          }
        } catch (err) {
          UI.notify("Lỗi khi áp dụng: " + (err.message || err));
        } finally {
          if (applyBtn) {
            applyBtn.disabled = false;
            applyBtn.innerHTML =
              "<span>✅</span> <span>Áp Dụng Ngay Cách Xếp Này Vào Game</span>";
          }
        }
      };
    }
  } catch (e) {
    box.innerHTML = errBox(e);
  }
}

export {
  AU_KM_MO_MIN,
  AU_KM_MIN_GAIN,
  AU_KM_MODE,
  AU_KM_IT,
  AU_KM_BK,
  auKmPin,
  auKmSig,
  auKmApplySolution,
  auKmPass,
  auStartKm,
  auKmLoop,
  auKmStatus,
  auKmPreview,
};

Object.assign(gWin, {
  AU_KM_MO_MIN,
  AU_KM_MIN_GAIN,
  AU_KM_MODE,
  AU_KM_IT,
  AU_KM_BK,
  auKmPin,
  auKmSig,
  auKmApplySolution,
  auKmPass,
  auStartKm,
  auKmLoop,
  auKmStatus,
  auKmPreview,
});
