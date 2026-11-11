import { gWin, pct, num, esc, heTen } from "../core/utils.js";
import { UI } from "../ui/shell.js";
import { S, body, loadCore, G, C, clone } from "../core/bridge.js";
import { drawTabs } from "../modules/navigation.js";
import {
  AU,
  AU_TOC,
  auYield,
  auSave,
  auSleep,
  auClamp,
  auLog,
  auPaintSoon,
  clearAuPaintTimer,
} from "./auto-core.js";
/**
 * Module: Auto Reroll Tư Chất (Linh Căn & Thể Chất Khởi Đầu)
 */
// ═════════ AUTO REROLL TƯ CHẤT (LINH CĂN + THỂ CHẤT) ═════════
// Game gieo Linh Căn và Thể Chất cùng lúc với cả kiếp mới, từ một "hạt giống" (seed): cùng hạt giống + cùng dữ liệu Vong Xuyên thì luôn ra đúng một nhân vật.
// Auto gọi chính hàm tạo kiếp của game (K.createRun) trên BẢN SAO dữ liệu để dò nhiều hạt giống mà không đụng bản lưu; gặp tư chất ưng ý
// mới gọi game.newRun({ seed }) đúng một lần. Vì vậy các lần dò hỏng không tốn gì, không để lại dấu vết trong game.
const RR_PHAM = [
  ["thien", "Thiên"],
  ["bien_di", "Biến Dị"],
  ["song", "Song"],
  ["tap", "Tạp"],
  ["vo", "Vô"],
];
const RR_HE = [
  "kim",
  "moc",
  "thuy",
  "hoa",
  "tho",
  "loi",
  "bang",
  "phong",
  "am",
];
const RR_HEMODE = [
  ["any", "Có Ít Nhất Một Hệ Trong Danh Sách"],
  ["all", "Có Đủ Mọi Hệ Trong Danh Sách"],
  ["main", "Hệ Đầu (Chủ Hệ) Thuộc Danh Sách"],
];
const RR_SAMPLE = 400; // số lần dò thử khi bấm “Dò Tỉ Lệ”
// Đạo Lộ = độ khó game chọn lúc vào kiếp (difficulty). Nhãn và hệ số điểm chuẩn theo game: easy (Thuận Thiên), normal (Trung Đạo), hardcore (Nghịch Thiên), oneLife (Tuyệt Mệnh).
const RR_DAOLO = [
  ["normal", "Trung Đạo"],
  ["easy", "Thuận Thiên"],
  ["hardcore", "Nghịch Thiên"],
  ["oneLife", "Tuyệt Mệnh (1 Mạng)"],
];
const RR_DAOLO_HINT = {
  easy: "điểm luân hồi ×0,75; đan không giới hạn",
  normal: "điểm luân hồi ×1; đan không giới hạn",
  hardcore:
    "điểm luân hồi ×1,25; trần đan 3 viên/cảnh giới; bỏ Thiên Mệnh; địch AI bậc 3",
  oneLife:
    "1 mạng duy nhất; trần đan 2 viên/cảnh giới; không điểm luân hồi; địch AI bậc 3",
};
const rrDlOk = (v) => (RR_DAOLO.some((x) => x[0] === v) ? v : "normal");
const rrDlTen = (v) => (RR_DAOLO.find((x) => x[0] === v) || RR_DAOLO[0])[1];
// Lộ Phí Qua Sông = các món nhóm lo_phi ở bến Vong Xuyên, mua bằng điểm luân hồi, chỉ dùng một kiếp (vào meta.nextLifeGoods).
function rrLoPhiList() {
  try {
    return [...C().moKhoa.values()]
      .filter(
        (m) =>
          m.nhom === "lo_phi" &&
          m.nac &&
          m.nac[0] &&
          Number.isFinite(Number(m.nac[0].gia)),
      )
      .map((m) => ({ id: m.id, ten: m.ten, gia: Number(m.nac[0].gia) }))
      .sort((a, b) => a.gia - b.gia);
  } catch (e) {
    return [];
  }
}
function rrLoPhiInfo() {
  const g = G(),
    meta = g && g.state && g.state.meta,
    ds = rrLoPhiList();
  if (!meta || !ds.length) return null;
  const have = new Set(meta.nextLifeGoods || []),
    todo = ds.filter((d) => !have.has(d.id));
  return {
    diem: Number(meta.diemLuanHoi) || 0,
    tong: todo.reduce((s, d) => s + d.gia, 0),
    con: todo.length,
    da: ds.length - todo.length,
  };
}
// Mua lần lượt từ món rẻ tới món đắt bằng chính hàm mua của game (nó tự kiểm điểm và điều kiện mở khóa); món nào bị từ chối thì bỏ qua.
function rrBuyLoPhi(g) {
  const res = { bought: [], skipped: [], spent: 0, err: "" };
  if (typeof g.muaMoKhoa !== "function") {
    res.err =
      "Tool chưa nhận ra hàm mua của bến Vong Xuyên (game vừa cập nhật).";
    return res;
  }
  const p0 = Number(g.state.meta.diemLuanHoi) || 0;
  for (const d of rrLoPhiList()) {
    if ((g.state.meta.nextLifeGoods || []).includes(d.id)) continue;
    let r;
    try {
      r = g.muaMoKhoa(d.id);
    } catch (e) {
      r = { loi: (e && e.message) || String(e) };
    }
    if (r && r.loi) res.skipped.push(d.ten + " (" + r.loi + ")");
    else res.bought.push(d.ten);
  }
  res.spent = p0 - (Number(g.state.meta.diemLuanHoi) || 0);
  return res;
}
const rrPhamTen = (p) => (RR_PHAM.find((x) => x[0] === p) || [p, String(p)])[1];
const rrHeStr = (he) =>
  he && he.length ? he.map(heTen).join(" · ") : "không hệ";
const rrTcTen = (id) => {
  try {
    const t = C().theChat.get(id);
    return t ? t.ten : String(id).replace(/^the_chat\./, "");
  } catch (e) {
    return String(id);
  }
};
const rrXtTen = (id) => {
  try {
    const o = C().origins.get("origin." + id);
    return o ? o.ten : String(id);
  } catch (e) {
    return String(id);
  }
};
const rrDesc = (r) =>
  "Linh Căn " +
  rrPhamTen(r.pham) +
  " (" +
  rrHeStr(r.he) +
  ") · Thể Chất " +
  rrTcTen(r.tc);
function rrTheChat() {
  try {
    return [...C().theChat.values()].map((t) => ({
      id: t.id,
      ten: t.ten,
      tl: Number(t.ti_le) || 0,
      mo: t.mo_ta || "",
    }));
  } catch (e) {
    return [];
  }
}
const rrPhamAll = (c) => c.pham.length === 0 || c.pham.length >= RR_PHAM.length;
const rrActive = (c) => ({
  lc: !rrPhamAll(c) || c.he.length > 0,
  tc: c.tc.length > 0,
});
// Một lần dò có đạt điều kiện không. Điều kiện nào chưa đặt thì coi như qua; nối “Một Trong Hai” chỉ có nghĩa khi cả hai điều kiện cùng được đặt.
function rrMatch(r, c) {
  const act = rrActive(c);
  let lcOk = true;
  if (act.lc) {
    lcOk = rrPhamAll(c) || c.pham.includes(r.pham);
    if (lcOk && c.he.length) {
      lcOk =
        c.heMode === "all"
          ? c.he.every((h) => r.he.includes(h))
          : c.heMode === "main"
            ? c.he.includes(r.he[0])
            : r.he.some((h) => c.he.includes(h));
    }
  }
  const tcOk = act.tc ? c.tc.includes(r.tc) : true;
  if (c.join === "or" && act.lc && act.tc) return lcOk || tcOk;
  return lcOk && tcOk;
}
function rrCriteria(c) {
  const act = rrActive(c),
    parts = [];
  if (act.lc) {
    const ph = rrPhamAll(c) ? "mọi phẩm" : c.pham.map(rrPhamTen).join("/");
    const he = c.he.length
      ? " · hệ " +
        (c.heMode === "all"
          ? "đủ "
          : c.heMode === "main"
            ? "đầu thuộc "
            : "có ") +
        c.he.map(heTen).join("/")
      : "";
    parts.push("Linh Căn " + ph + he);
  }
  if (act.tc) parts.push("Thể Chất " + c.tc.map(rrTcTen).join(" hoặc "));
  if (!parts.length) return "chưa đặt điều kiện nào.";
  return parts.join(c.join === "or" && parts.length === 2 ? " HOẶC " : " VÀ ");
}
// Lúc này Auto được phép làm gì: chưa vào kiếp (màn Luân Hồi) thì đổi thoải mái; kiếp vừa vào chưa trải gì thì đổi được nếu người dùng cho phép; còn lại không đụng.
function rrMode() {
  const g = G(),
    st = g && g.state;
  if (!st) return { ok: false, kind: "none", txt: "Chưa thấy game." };
  const run = st.run,
    c = AU.cfg.rr;
  if (!run)
    return {
      ok: true,
      kind: "new",
      txt: "Chưa vào kiếp nào (màn Luân Hồi hoặc Khởi Đầu). Auto dò tư chất rồi tạo thẳng kiếp mới đúng tư chất đã dò.",
    };
  if (run.ketThuc)
    return {
      ok: false,
      kind: "dead",
      txt: "Kiếp trước đã kết thúc. Hãy đóng bảng tổng kết, mua đồ ở bến Vong Xuyên nếu cần, tới màn Luân Hồi rồi mới chạy Auto Reroll; lúc đó đổi tư chất không mất gì.",
    };
  const nv = run.nhanVat;
  if (!(run.nam === run.namBatDau && nv.canhGioi === 0 && !nv.tuVi))
    return {
      ok: false,
      kind: "old",
      txt: "Kiếp đang chơi đã trải qua thời gian (năm đã trôi hoặc đã tu luyện) nên Auto không đổi tư chất, để khỏi xóa tiến trình của bạn. Muốn reroll hãy chạy ở màn Luân Hồi, ngay trước khi vào kiếp mới.",
    };
  if (!c.swap)
    return {
      ok: false,
      kind: "fresh",
      txt: "Kiếp này vừa mới vào, chưa trải gì. Auto có thể thay bằng kiếp có tư chất như ý, nhưng phải bật ô “Cho Phép Thay Kiếp Vừa Vào” bên dưới.",
    };
  return {
    ok: true,
    kind: "swap",
    txt: "Kiếp này vừa mới vào, chưa trải gì. Auto sẽ thay nó bằng kiếp mới có tư chất như ý (kiếp hiện tại bị xóa; đồ mua ở bến Vong Xuyên dành riêng cho kiếp này không theo sang kiếp thay).",
  };
}
const rrSeed = (i) =>
  "rr" +
  i +
  "-" +
  Date.now().toString(36) +
  "-" +
  Math.floor(Math.random() * 1e9).toString(36);
// Dò một hạt giống: chạy hàm tạo kiếp của game trên bản sao dữ liệu, chỉ đọc tư chất.
function rrRollOnce(env, meta0, seed, dl) {
  const run = S.core.createRun(env, clone(meta0), {
    seed,
    difficulty: dl,
  });
  const nv = run.nhanVat;
  return {
    seed,
    pham: nv.linhCan.pham,
    he: [...(nv.linhCan.he || [])],
    tc: nv.theChat,
    xt: nv.xuatThan,
  };
}
function rrReadCfg() {
  const q = (id) => body.querySelector("#" + id);
  if (!q("rr-max")) return; // tab chưa vẽ
  const c = AU.cfg.rr,
    picked = (cls) =>
      [...body.querySelectorAll("." + cls + ":checked")].map((x) => x.value);
  c.pham = picked("rr-pham").filter((x) => RR_PHAM.some((p) => p[0] === x));
  c.he = picked("rr-he").filter((x) => RR_HE.includes(x));
  c.tc = picked("rr-tc");
  const hm = q("rr-hemode").value;
  c.heMode = RR_HEMODE.some((x) => x[0] === hm) ? hm : "any";
  c.join = q("rr-join").value === "or" ? "or" : "and";
  c.max = Math.floor(auClamp(q("rr-max").value, 1, 200000, c.max));
  const tc = q("au-toc");
  if (tc && AU_TOC[tc.value]) c.toc = tc.value;
  c.swap = !!q("rr-swap").checked;
  const dl = q("rr-dl");
  if (dl) c.dl = rrDlOk(dl.value);
  const lp = q("rr-lp");
  if (lp) c.lp = !!lp.checked;
  const lh = q("rr-lh");
  if (lh) {
    c.lh = !!lh.checked;
    c.lhIds = picked("rr-lhi");
    c.lhKeep = Math.floor(auClamp(q("rr-lhk").value, 0, 1e9, c.lhKeep));
  }
  auSave();
}
function rrStart(sample) {
  if (AU.run && AU.run.running) {
    auPaint();
    return;
  }
  const g = G();
  if (!g || !g.state) {
    UI.notify("Chưa thấy game.");
    return;
  }
  rrReadCfg();
  const c = AU.cfg.rr,
    act = rrActive(c);
  if (!act.lc && !act.tc) {
    UI.notify(
      "Hãy đặt ít nhất một điều kiện (phẩm hoặc hệ Linh Căn, hoặc Thể Chất).",
    );
    return;
  }
  if (!sample) {
    const md = rrMode();
    if (!md.ok) {
      auLog(md.txt, "vk-bad");
      UI.notify(md.txt);
      auPaint();
      return;
    }
  }
  AU.run = {
    kind: "rr",
    running: true,
    stop: false,
    sample: sample ? RR_SAMPLE : 0,
    tries: 0,
    hits: 0,
    cnt: { p: {}, t: {} },
    last: null,
    found: null,
    ok: false,
    msg: "",
    t0: performance.now(),
    tEnd: 0,
    delay: (AU_TOC[c.toc] || AU_TOC.nhanh)[1],
  };
  auLog(
    (sample
      ? "Bắt đầu dò tỉ lệ (" + RR_SAMPLE + " lần, không đổi kiếp)"
      : "Bắt đầu Auto Reroll Tư Chất") +
      " · Đạo Lộ " +
      rrDlTen(c.dl) +
      (!sample && c.lp ? " · mua hết Lộ Phí Qua Sông khi tìm được" : "") +
      " · điều kiện: " +
      rrCriteria(c),
    "vk-ok",
  );
  drawTabs();
  auPaint();
  rrLoop(AU.run);
}
async function rrLoop(st) {
  const cfg = AU.cfg.rr;
  try {
    if (!S.core)
      S.core = await loadCore((m) => {
        st.msg = m;
        auPaintSoon();
      });
    if (typeof S.core.createRun !== "function")
      throw new Error(
        "Tool chưa nhận ra hàm tạo kiếp mới của game (game vừa cập nhật). Hãy chụp màn hình này gửi Claude để sửa Tool.",
      );
    const g = G(),
      env = g.env;
    let metaRef = g.state.meta,
      meta0 = clone(metaRef);
    if (!st.sample && cfg.lh && cfg.lhIds.length) {
      // Auto Luân Hồi: mua trước khi dò, vì các mục này đổi tỉ lệ ra tư chất
      const bl = rrBuyLuanHoi(g);
      st.lh = bl;
      if (bl.err) auLog("Auto Luân Hồi: " + bl.err, "vk-bad");
      else
        auLog(
          "Auto Luân Hồi: đã mua " +
            bl.bought.length +
            " bậc" +
            (bl.bought.length ? " (" + bl.bought.join(", ") + ")" : "") +
            ", tốn " +
            num(bl.spent, 0) +
            " điểm luân hồi" +
            (bl.skipped.length
              ? "; chưa mua được " +
                bl.skipped.length +
                ": " +
                bl.skipped.join("; ")
              : "") +
            ".",
          bl.bought.length ? "vk-ok" : undefined,
        );
      metaRef = g.state.meta;
      meta0 = clone(metaRef);
    }
    const runId0 = g.state.run ? g.state.run.seed : null;
    let slice = performance.now();
    while (!st.stop) {
      if (!st.sample) {
        if (st.tries >= cfg.max) {
          st.msg =
            "Đã thử đủ " +
            num(cfg.max, 0) +
            " lần mà chưa gặp tư chất như ý. Kiếp giữ nguyên, bạn nới điều kiện hoặc tăng số lần rồi chạy lại.";
          break;
        }
        const cur = g.state.run;
        if ((cur ? cur.seed : null) !== runId0) {
          st.msg =
            "Game vừa đổi kiếp trong lúc Auto chạy (bạn đã vào kiếp hoặc đổi kiếp). Dừng để không ghi đè nhầm.";
          break;
        }
      } else if (st.tries >= st.sample) {
        st.ok = true;
        st.msg =
          "Dò xong " +
          st.tries +
          " lần: khớp " +
          st.hits +
          (st.hits
            ? " (" +
              pct(st.hits / st.tries, 2) +
              "), trung bình cần khoảng " +
              num(st.tries / st.hits, 0) +
              " lần thử cho một kết quả."
            : " lần, nên cần hơn " +
              st.tries +
              " lần thử cho một kết quả (điều kiện khá hiếm).");
        break;
      }
      // Bến Vong Xuyên đổi giữa chừng thì bản dò cũ không còn đúng với game: lấy lại bản mới.
      if (g.state.meta !== metaRef) {
        metaRef = g.state.meta;
        meta0 = clone(metaRef);
        auLog("Dữ liệu Luân Hồi vừa đổi, Auto lấy lại bản mới để dò cho khớp.");
      }
      const r = rrRollOnce(env, meta0, rrSeed(st.tries), cfg.dl);
      st.tries++;
      st.last = r;
      st.cnt.p[r.pham] = (st.cnt.p[r.pham] || 0) + 1;
      st.cnt.t[r.tc] = (st.cnt.t[r.tc] || 0) + 1;
      if (rrMatch(r, cfg)) {
        st.hits++;
        if (!st.sample) {
          st.found = r;
          auLog(
            "Tìm được sau " +
              st.tries +
              " lần thử: " +
              rrDesc(r) +
              " · xuất thân " +
              rrXtTen(r.xt) +
              ".",
            "vk-ok",
          );
          if (cfg.lp) {
            const bp = rrBuyLoPhi(g);
            st.lp = bp;
            if (bp.err) auLog("Lộ Phí Qua Sông: " + bp.err, "vk-bad");
            else
              auLog(
                "Lộ Phí Qua Sông: đã mua " +
                  bp.bought.length +
                  " món" +
                  (bp.bought.length ? " (" + bp.bought.join(", ") + ")" : "") +
                  ", tốn " +
                  num(bp.spent, 0) +
                  " điểm luân hồi" +
                  (bp.skipped.length
                    ? "; bỏ qua " +
                      bp.skipped.length +
                      " món: " +
                      bp.skipped.join("; ")
                    : "") +
                  ".",
                bp.bought.length ? "vk-ok" : undefined,
              );
          }
          g.newRun({ seed: r.seed, difficulty: cfg.dl });
          const nr = G().state.run,
            nv = nr && nr.nhanVat;
          if (!nr || nr.seed !== r.seed) {
            st.msg =
              "Đã gọi game tạo kiếp nhưng không thấy kiếp mới mang đúng hạt giống. Kiểm tra lại trong game.";
            break;
          }
          const same =
            nv.theChat === r.tc &&
            nv.linhCan.pham === r.pham &&
            (nv.linhCan.he || []).join() === r.he.join();
          if (same) {
            st.ok = true;
            st.msg =
              "Xong sau " +
              st.tries +
              " lần thử. Đã vào kiếp " +
              nr.kiep +
              " (Đạo Lộ " +
              rrDlTen(nr.difficulty) +
              "): " +
              nv.ten +
              " · " +
              rrDesc(r) +
              (st.lp && st.lp.bought.length
                ? " · đã mua " + st.lp.bought.length + " món Lộ Phí Qua Sông"
                : "") +
              ".";
            auLog("Đã vào kiếp mới đúng tư chất đã dò.", "vk-ok");
          } else {
            st.msg =
              "Đã vào kiếp mới nhưng tư chất thật lệch bản dò (" +
              rrDesc({
                pham: nv.linhCan.pham,
                he: nv.linhCan.he || [],
                tc: nv.theChat,
              }) +
              "). Có thể game đã đổi cách tạo kiếp, hãy báo Claude.";
          }
          break;
        }
      }
      st.steps = (st.steps || 0) + 1;
      auPaintSoon();
      if (st.delay > 0) {
        await auSleep(st.delay);
        slice = performance.now();
      } else if (performance.now() - slice > 20) {
        await auYield();
        slice = performance.now();
      }
    }
  } catch (e) {
    console.error(e);
    st.msg = "Lỗi: " + ((e && e.message) || e);
  }
  st.running = false;
  st.stop = false;
  st.tEnd = performance.now();
  auLog(
    "Dừng: " + (st.msg || "theo yêu cầu") + ".",
    st.ok ? "vk-ok" : "vk-bad",
  );
  try {
    UI.notify("Auto Reroll dừng: " + (st.msg || "theo yêu cầu"));
  } catch (e) {
    /* bỏ qua */
  }
  clearAuPaintTimer();
  drawTabs();
  auPaint();
}
function rrStatusHtml(st) {
  if (!st || st.kind !== "rr")
    return '<div class="vk-mu" style="font-size:13px">Chưa chạy.</div>';
  const cfg = AU.cfg.rr,
    sec = Math.max(0.001, ((st.tEnd || performance.now()) - st.t0) / 1000);
  const tally = (o, f) =>
    Object.entries(o)
      .sort((a, b) => b[1] - a[1])
      .map(([k, v]) => esc(f(k)) + " " + v)
      .join(" · ") || "—";
  const rows = [
    [
      "Trạng Thái",
      st.running ? '<span class="vk-ok">Đang chạy…</span>' : "Đã dừng",
    ],
    ["Lý Do Dừng", st.running ? "—" : esc(st.msg || "—")],
    ["Chế Độ", st.sample ? "Dò tỉ lệ (không đổi kiếp)" : "Reroll thật"],
    ["Đạo Lộ", esc(rrDlTen(cfg.dl))],
    ["Số Lần Thử", num(st.tries, 0) + " / " + num(st.sample || cfg.max, 0)],
    [
      "Số Lần Khớp",
      num(st.hits, 0) +
        (st.tries ? " (" + pct(st.hits / st.tries, 2) + ")" : ""),
    ],
    ["Tốc Độ Thử", num(st.tries / sec, 1) + " lần/giây"],
  ];
  if (st.last) rows.push(["Lần Thử Gần Nhất", esc(rrDesc(st.last))]);
  if (st.found)
    rows.push([
      "Tư Chất Đã Chọn",
      '<span class="vk-ok">' + esc(rrDesc(st.found)) + "</span>",
    ]);
  if (st.lp)
    rows.push([
      "Lộ Phí Qua Sông",
      st.lp.err
        ? '<span class="vk-bad">' + esc(st.lp.err) + "</span>"
        : "Mua " +
          st.lp.bought.length +
          " món · tốn " +
          num(st.lp.spent, 0) +
          " điểm" +
          (st.lp.skipped.length ? " · bỏ qua " + st.lp.skipped.length : ""),
    ]);
  if (st.lh)
    rows.push([
      "Auto Luân Hồi",
      st.lh.err
        ? '<span class="vk-bad">' + esc(st.lh.err) + "</span>"
        : "Mua " +
          st.lh.bought.length +
          " bậc · tốn " +
          num(st.lh.spent, 0) +
          " điểm" +
          (st.lh.skipped.length ? " · chưa mua " + st.lh.skipped.length : ""),
    ]);
  rows.push(["Linh Căn Đã Gặp", tally(st.cnt.p, rrPhamTen)]);
  rows.push(["Thể Chất Đã Gặp", tally(st.cnt.t, rrTcTen)]);
  return rows
    .map(
      (r) =>
        `<div class="vk-row"><span>${r[0]}</span><b style="text-align:right">${r[1]}</b></div>`,
    )
    .join("");
}
function rrModePaint() {
  const el = body.querySelector("#rr-mode");
  if (!el) return;
  const md = rrMode();
  el.innerHTML = `<div style="border-left:3px solid ${md.ok ? "#3d8a4a" : "#c9a032"};padding:4px 8px;font-size:13px"><b>${md.ok ? "Sẵn Sàng" : "Chưa Chạy Được"}:</b> ${esc(md.txt)}</div><div class="vk-mu" style="font-size:12px;margin-top:4px">Điều Kiện Hiện Tại: ${esc(rrCriteria(AU.cfg.rr))}</div>`;
  const li = body.querySelector("#rr-lh-info");
  if (li) li.textContent = rrLhInfoText();
  const lp = body.querySelector("#rr-lp-info");
  if (lp) {
    const i = rrLoPhiInfo();
    lp.textContent = i
      ? "Hiện có " +
        num(i.diem, 0) +
        " điểm luân hồi; còn " +
        i.con +
        " món chưa mua, mua hết cần " +
        num(i.tong, 0) +
        " điểm" +
        (i.da ? " (đã mua sẵn " + i.da + " món)" : "") +
        (i.tong > i.diem && i.con
          ? "; không đủ điểm cho mọi món thì mua từ món rẻ trở lên tới khi hết điểm."
          : ".")
      : "Chưa đọc được danh sách Lộ Phí Qua Sông.";
  }
}
function rrPaint() {
  const a = body.querySelector("#au-st"),
    b = body.querySelector("#au-lg");
  if (a) a.innerHTML = rrStatusHtml(AU.run);
  if (b) b.innerHTML = auLogHtml();
  rrModePaint();
  const run = AU.run && AU.run.running;
  body.querySelectorAll(".au-go").forEach((x) => {
    x.disabled = !!run;
  });
  const sp = body.querySelector("#au-stop");
  if (sp) sp.disabled = !run;
}
function tabAutoReroll() {
  const c = AU.cfg.rr,
    tcs = rrTheChat();
  const ids = new Set(tcs.map((t) => t.id));
  c.tc = c.tc.filter((x) => ids.has(x));
  const sum = tcs.reduce((s, t) => s + t.tl, 0) || 1;
  const row = (lab, ctl) =>
    `<label style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin:5px 0;font-size:13px"><span>${lab}</span>${ctl}</label>`;
  const sel = (id, lab, opts, v) =>
    row(
      lab,
      `<select class="vk-sel" id="${id}" style="width:200px">${opts.map(([k, t]) => `<option value="${esc(k)}" ${String(v) === String(k) ? "selected" : ""}>${esc(t)}</option>`).join("")}</select>`,
    );
  const chk = (cls, val, lab, on, hint) =>
    `<label style="display:inline-flex;gap:5px;align-items:center;margin:3px 12px 3px 0;font-size:13px"><input type="checkbox" class="${cls}" value="${esc(val)}" ${on ? "checked" : ""}><span>${lab}${hint ? ` <span class="vk-mu" style="font-size:11px">${hint}</span>` : ""}</span></label>`;
  body.innerHTML = `
    <div class="vk-card"><h3>Auto Reroll Tư Chất</h3>
      <div class="vk-mu" style="font-size:13px">Tư chất gồm <b>Linh Căn</b> và <b>Thể Chất</b>, game gieo cùng lúc với kiếp mới. Tool dò thử nhiều hạt giống bằng chính hàm tạo kiếp của game <b>trên bản sao dữ liệu</b> (không đụng bản lưu, không tốn Linh Thạch hay điểm luân hồi), gặp tư chất đúng điều kiện mới tạo kiếp thật bằng hạt giống đó, nên kết quả giống y hệt bản dò. Chưa gặp thì kiếp của bạn giữ nguyên.</div>
      <div id="rr-mode" style="margin:8px 0"></div>
      <div style="margin:10px 0 2px"><b style="font-size:13px">Linh Căn</b></div>
      <div class="vk-mu" style="font-size:12px">Phẩm chấp nhận <span style="font-size:11px">(bỏ trống hoặc tích hết = mọi phẩm)</span></div>
      <div>${RR_PHAM.map(([k, t]) => chk("rr-pham", k, t, c.pham.includes(k))).join("")}</div>
      <div class="vk-mu" style="font-size:12px;margin-top:4px">Hệ muốn có <span style="font-size:11px">(bỏ trống = không xét hệ)</span></div>
      <div>${RR_HE.map((h) => chk("rr-he", h, heTen(h), c.he.includes(h))).join("")}</div>
      ${sel("rr-hemode", "Cách Xét Hệ", RR_HEMODE, c.heMode)}
      <div style="margin:10px 0 2px"><b style="font-size:13px">Thể Chất</b> <span class="vk-mu" style="font-size:11px">(bỏ trống = chấp nhận mọi thể chất; số % là tỉ lệ gốc, game còn đổi theo xuất thân và bến Vong Xuyên)</span></div>
      <div>${tcs.map((t) => chk("rr-tc", t.id, esc(t.ten), c.tc.includes(t.id), "~" + pct(t.tl / sum, 1))).join("") || '<span class="vk-mu">Không đọc được danh sách Thể Chất.</span>'}</div>
      <details style="margin-top:4px"><summary class="vk-mu" style="font-size:12px">Xem Mô Tả Các Thể Chất</summary>${tcs.map((t) => `<div style="font-size:12px;margin:4px 0"><b>${esc(t.ten)}</b>: <span class="vk-mu">${esc(t.mo)}</span></div>`).join("")}</details>
      ${sel(
        "rr-join",
        "Nối Hai Điều Kiện",
        [
          ["and", "Cả Hai (Linh Căn Và Thể Chất)"],
          ["or", "Một Trong Hai"],
        ],
        c.join,
      )}
      <div style="margin:10px 0 2px"><b style="font-size:13px">Chạy</b></div>
      ${auFld("rr-max", "Số Lần Thử Tối Đa", c.max, "(1 – 200.000)")}
      ${auTocSel(c.toc)}
      ${sel("rr-dl", "Đạo Lộ", RR_DAOLO, c.dl)}
      <div class="vk-mu" style="font-size:11px;margin:-2px 0 4px">Đạo Lộ chọn lúc vào kiếp, không đổi giữa chừng: Thuận Thiên (${RR_DAOLO_HINT.easy}), Trung Đạo (${RR_DAOLO_HINT.normal}), Nghịch Thiên (${RR_DAOLO_HINT.hardcore}), Tuyệt Mệnh (${RR_DAOLO_HINT.oneLife}). Dò và tạo kiếp thật đều theo Đạo Lộ này.</div>
      <label style="display:flex;gap:6px;align-items:flex-start;margin:6px 0;font-size:13px"><input type="checkbox" id="rr-lp" ${c.lp ? "checked" : ""} style="margin-top:3px"><span>Mua Hết Lộ Phí Qua Sông <span class="vk-mu" style="font-size:11px">(chỉ mua khi đã tìm được tư chất, ngay trước lúc vào kiếp mới; món chỉ dùng một kiếp, mua rồi không hoàn điểm; Dò Tỉ Lệ không mua)</span></span></label>
      <div class="vk-mu" id="rr-lp-info" style="font-size:12px;margin:0 0 4px 22px"></div>
      <label style="display:flex;gap:6px;align-items:flex-start;margin:6px 0;font-size:13px"><input type="checkbox" id="rr-lh" ${c.lh ? "checked" : ""} style="margin-top:3px"><span>Tự Mua Mục Mở Khóa Luân Hồi <span class="vk-mu" style="font-size:11px">(mua các mục tích bên dưới, từng bậc theo thứ tự trong danh sách, TRƯỚC khi dò tư chất vì Linh Căn, Thiên Tư… đổi tỉ lệ ra tư chất; điểm đã mua không hoàn lại; chỉ chạy ở Reroll thật, không chạy ở Dò Tỉ Lệ)</span></span></label>
      <details style="margin:0 0 4px 22px"><summary class="vk-mu" style="font-size:12px">Chọn Mục Muốn Mua</summary>${rrLhPickHtml()}</details>
      ${auFld("rr-lhk", "Giữ Lại Tối Thiểu", c.lhKeep, "(điểm luân hồi)")}
      <div class="vk-mu" id="rr-lh-info" style="font-size:12px;margin:0 0 4px 22px"></div>
      <label style="display:flex;gap:6px;align-items:flex-start;margin:6px 0;font-size:13px"><input type="checkbox" id="rr-swap" ${c.swap ? "checked" : ""} style="margin-top:3px"><span>Cho Phép Thay Kiếp Vừa Vào <span class="vk-mu" style="font-size:11px">(chỉ khi kiếp chưa trôi năm nào; kiếp hiện tại bị xóa và thay bằng kiếp mới)</span></span></label>
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px"><button class="vk-btn au-go" id="au-run">Chạy Auto Reroll</button><button class="vk-btn sec au-go" id="au-smp">Dò Tỉ Lệ (${RR_SAMPLE} Lần)</button><button class="vk-btn sec" id="au-stop">Dừng</button></div>
      <div class="vk-mu" style="font-size:12px;margin-top:6px">Nên bấm <b>Dò Tỉ Lệ</b> trước để biết điều kiện hiếm cỡ nào; Dò Tỉ Lệ không đổi kiếp và chạy được lúc nào cũng được.</div></div>
    <div class="vk-card"><h3>Tiến Trình</h3><div id="au-st"></div></div>
    <div class="vk-card"><h3>Nhật Ký</h3><div id="au-lg"></div></div>`;
  body.querySelectorAll("input,select").forEach((el) => {
    el.onchange = () => {
      rrReadCfg();
      rrModePaint();
    };
  });
  body.querySelector("#au-run").onclick = () => rrStart(false);
  body.querySelector("#au-smp").onclick = () => rrStart(true);
  body.querySelector("#au-stop").onclick = () => auStop("Bạn bấm Dừng");
  auPaint();
}

export {
  RR_PHAM,
  RR_HE,
  RR_HEMODE,
  RR_SAMPLE,
  RR_DAOLO,
  RR_DAOLO_HINT,
  rrDlOk,
  rrDlTen,
  rrLoPhiList,
  rrLoPhiInfo,
  rrBuyLoPhi,
  rrPhamTen,
  rrHeStr,
  rrTcTen,
  rrXtTen,
  rrDesc,
  rrTheChat,
  rrPhamAll,
  rrActive,
  rrMatch,
  rrCriteria,
  rrMode,
  rrSeed,
  rrRollOnce,
  rrReadCfg,
  rrStart,
  rrLoop,
  rrStatusHtml,
  rrModePaint,
  rrPaint,
  tabAutoReroll,
};

Object.assign(gWin, {
  RR_PHAM,
  RR_HE,
  RR_HEMODE,
  RR_SAMPLE,
  RR_DAOLO,
  RR_DAOLO_HINT,
  rrDlOk,
  rrDlTen,
  rrLoPhiList,
  rrLoPhiInfo,
  rrBuyLoPhi,
  rrPhamTen,
  rrHeStr,
  rrTcTen,
  rrXtTen,
  rrDesc,
  rrTheChat,
  rrPhamAll,
  rrActive,
  rrMatch,
  rrCriteria,
  rrMode,
  rrSeed,
  rrRollOnce,
  rrReadCfg,
  rrStart,
  rrLoop,
  rrStatusHtml,
  rrModePaint,
  rrPaint,
  tabAutoReroll,
});
