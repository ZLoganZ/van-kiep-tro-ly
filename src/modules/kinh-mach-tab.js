import { gWin, TOOL_VER, TT, MOD } from "../core/utils.js";
/**
 * Module: Tab Kinh Mạch, Lĩnh Ngộ, Phép Tính Giả Định & Tẩy Ô
 */
// ═════════════ KINH MẠCH 6.5: Lĩnh Ngộ · áp dụng bằng hàm của game · ô mở được ═════════════
// Lĩnh Ngộ (đọc từ code game): món LẦN ĐẦU đặt lên kinh mạch bắt đầu ở độ thông 0 và nhân sức ×(0,5 + 0,5 × độ thông), đầy dần theo số năm
// (phẩm càng cao càng lâu, ngộ tính cao thì nhanh hơn); đủ thông và đeo ≥ 500 năm thì Viên Mãn ×1,1. Hệ số này nằm sẵn trong hàm tính của game,
// nên Tool chỉ cần nạp đúng độ thông (mastery) vào nhân vật thử là mọi phép tính khớp game.
const isKmItem = (it) =>
  !!it &&
  (it.loai === "cong_phap" || it.loai === "phap_khi") &&
  !!(it.hinh && it.hinh.length);
function lnApply(nv) {
  // Đã bỏ chế độ xếp theo Lĩnh Ngộ: mọi phép tính dùng sức đã Lĩnh Ngộ đầy (×1).
  if (nv && nv.kinhMach) nv.kinhMach.mastery = {};
  return nv;
}
const lnPrep = (nv) => lnApply(clone(nv));
function lnYears(it) {
  try {
    const K = S.core,
      nv = G().state.run.nhanVat;
    if (!K || !K.namLinhNgo) return null;
    const y = K.namLinhNgo(
      it,
      K.effectiveStat ? K.effectiveStat(nv, "ngo_tinh", C()) : 0,
    );
    return Number.isFinite(y) ? y : null;
  } catch (e) {
    return null;
  }
}
// Nhãn Lĩnh Ngộ của một món: chỉ hiện khi món chưa đầy (chưa từng đặt, hoặc đang lĩnh ngộ dở).
function lnTag(it) {
  try {
    if (!isKmItem(it)) return "";
    const km = G().state.run.nhanVat.kinhMach;
    if (
      (km.manh || []).some((m) => m.item === it.id) &&
      !(km.mastery && km.mastery[it.id] !== undefined)
    )
      return "";
    const m = km.mastery && km.mastery[it.id],
      y = lnYears(it);
    if (m !== undefined && m < 1)
      return `<span class="vk-mu" style="font-size:12px"> · đang lĩnh ngộ ${pct(m)}${y == null ? "" : " (~" + num(Math.max(0, (1 - m) * y), 1) + " năm nữa)"}</span>`;
    if (!(km.daLinhNgo || []).includes(it.id))
      return `<span class="vk-mu" style="font-size:12px"> · chưa lĩnh ngộ${y == null ? "" : " (đủ sau ~" + num(y, y < 1 ? 2 : 1) + " năm)"}</span>`;
    return "";
  } catch (e) {
    return "";
  }
}
// Câu mô tả hệ số "độ hợp phẩm" đọc từ game (Phàm phẩm và Nghịch Thiên có hệ số riêng theo cảnh giới).
function fitNote() {
  const K = S.core,
    f = (cg, ph) => {
      try {
        return K && K.gradeMult
          ? K.gradeMult({ pham_cap: ph }, cg)
          : null;
      } catch (e) {
        return null;
      }
    };
  const a = f(0, 8),
    b = f(3, 8),
    d = f(4, 8),
    p = f(0, 1);
  if ([a, b, d, p].some((x) => !(x > 0)))
    return "Nghịch Thiên không bị kẹp uy lực nhưng sức còn nhân theo cảnh giới của bạn (thấp ở cảnh giới đầu, cao hơn từ Nguyên Anh); Phàm phẩm luôn bị giảm sức.";
  return `Nghịch Thiên không bị kẹp uy lực nhưng sức nhân theo cảnh giới của bạn: ×${num(a, 2)} (Phàm Nhân – Trúc Cơ), ×${num(b, 2)} (Kết Đan), ×${num(d, 2)} (Nguyên Anh – Hóa Thần); Phàm phẩm luôn ×${num(p, 2)}.`;
}

// Ô tắc mà game cho mở ngay: ô tắc kề ít nhất một ô đã thông (đúng hàm y6 của game).
function kmOpenable(nv) {
  const g = S.core.luoiKinhMach(C(), nv),
    st = nv.kinhMach.trangThai,
    out = [];
  st.forEach((s, i) => {
    if (s !== "tac") return;
    const x = i % g.rong,
      y = Math.floor(i / g.rong);
    const nb = [
      x > 0 ? i - 1 : -1,
      x < g.rong - 1 ? i + 1 : -1,
      y > 0 ? i - g.rong : -1,
      y < g.cao - 1 ? i + g.rong : -1,
    ].filter((o) => o >= 0 && g.vung[o] >= 0);
    if (nb.some((o) => st[o] === "thong")) out.push(i);
  });
  return out;
}
const kmAutoRunning = () =>
  !!(AU.run && AU.run.running && AU.run.kind === "km");
const kmAborted = () => !!S.kmAbort;

// Áp dụng cách xếp bằng chính hàm của game (gỡ mảnh sai, đặt mảnh mới) nên Lĩnh Ngộ, bảng ghi và các móc của game chạy đúng như bạn tự đặt.
// Kiểm trước trên bản sao bằng hàm kiểm tra chỗ đặt của game; giữa chừng lỗi thì hoàn lại.
async function kmApplyDiff(manh) {
  const g = G(),
    K = S.core,
    c = C();
  if (!g || !g.state.run || !g.state.run.nhanVat)
    return { ok: false, msg: "Chưa vào kiếp tu tiên." };
  for (const fn of ["datManh", "goManh"])
    if (typeof g[fn] !== "function")
      return {
        ok: false,
        msg: "Game không có hàm " + fn + " để điều khiển kinh mạch.",
      };
  const nv0 = clone(g.state.run.nhanVat);
  const same = (a, b) =>
    a.item === b.item &&
    a.x === b.x &&
    a.y === b.y &&
    a.xoay === b.xoay;
  const cur = nv0.kinhMach.manh;
  const keep = cur.filter((m) => manh.some((t) => same(m, t)));
  const rem = cur
    .map((m, i) => ({ m, i }))
    .filter((r) => !manh.some((t) => same(r.m, t)))
    .sort((a, b) => b.i - a.i);
  const add = manh
    .filter((t) => !cur.some((m) => same(m, t)))
    .map((t) => ({ item: t.item, x: t.x, y: t.y, xoay: t.xoay }));
  if (!rem.length && !add.length)
    return {
      ok: true,
      same: true,
      added: 0,
      removed: 0,
      msg: "Kinh mạch đã đúng như cách xếp, không cần đổi.",
    };
  const sim = clone(nv0);
  sim.kinhMach.manh = keep.map((m) => ({ ...m }));
  for (const t of add) {
    let err;
    try {
      err = K.kiemTraDat(sim, c, t);
    } catch (e) {
      err = "lỗi kiểm tra";
    }
    if (err)
      return {
        ok: false,
        msg:
          "Game không cho đặt " +
          auItemName(t.item) +
          " ở vị trí đó (" +
          err +
          "). Hãy xếp lại.",
      };
    sim.kinhMach.manh.push({ ...t });
  }
  const done = { rem: [], add: [] };
  const restore = () => {
    for (const t of done.add.slice().reverse()) {
      const i = G().state.run.nhanVat.kinhMach.manh.findIndex((m) =>
        same(m, t),
      );
      if (i >= 0) auCall((gg) => gg.goManh(i));
    }
    for (const m of done.rem)
      auCall((gg) =>
        gg.datManh({ item: m.item, x: m.x, y: m.y, xoay: m.xoay }),
      );
  };
  for (const r of rem) {
    const res = auCall((gg) => gg.goManh(r.i));
    if (!res.ok) {
      restore();
      return {
        ok: false,
        msg:
          "Không gỡ được " +
          auItemName(r.m.item) +
          ": " +
          res.err +
          (done.rem.length ? " (đã hoàn lại)" : ""),
      };
    }
    done.rem.push(r.m);
  }
  for (const t of add) {
    const res = auCall((gg) => gg.datManh(t));
    if (!res.ok) {
      restore();
      return {
        ok: false,
        msg:
          "Không đặt được " +
          auItemName(t.item) +
          ": " +
          res.err +
          " (đã hoàn lại)",
      };
    }
    done.add.push(t);
  }
  const fin = G().state.run.nhanVat.kinhMach.manh;
  if (
    fin.length !== manh.length ||
    !manh.every((t) => fin.some((m) => same(m, t)))
  )
    return {
      ok: false,
      msg: "Kinh mạch sau khi đặt chưa khớp cách xếp (game đã chặn một số món). Kiểm tra lại trong game.",
    };
  return {
    ok: true,
    added: add.length,
    removed: rem.length,
    msg:
      "Đã xếp " +
      manh.length +
      " món vào kinh mạch (gỡ " +
      rem.length +
      ", đặt " +
      add.length +
      ").",
  };
}
async function applyManh(manh) {
  try {
    const r = await kmApplyDiff(manh);
    UI.notify((r.ok ? "✅ " : "❌ ") + r.msg);
    return r.ok;
  } catch (e) {
    console.error(e);
    UI.notify("❌ " + ((e && e.message) || e));
    return false;
  }
}
// Áp dụng nhiều bộ kinh mạch: sets[k] là cách xếp của bộ k+1. Mở ô bộ thiếu nếu opt.mo (game tính linh thạch), cuối cùng đổi về bộ opt.keep.
async function kmApplyLoadouts(sets, opt) {
  opt = opt || {};
  const g = G();
  for (const fn of ["switchLoadout", "unlockLoadoutSlot"])
    if (typeof g[fn] !== "function")
      return { ok: false, msg: "Game không có hàm " + fn + "." };
  const nSlots = () =>
    (G().state.run.nhanVat.kinhMach.loadouts || [1]).length;
  const active = () =>
    G().state.run.nhanVat.kinhMach.activeLoadout || 0;
  const notes = [];
  for (let k = 0; k < sets.length; k++) {
    while (nSlots() <= k) {
      if (!opt.mo)
        return {
          ok: false,
          msg:
            "Chưa có ô bộ " +
            (k + 1) +
            "; hãy cho phép mở thêm bộ (tốn Linh Thạch).",
        };
      const r = auCall((gg) => gg.unlockLoadoutSlot());
      if (!r.ok)
        return {
          ok: false,
          msg: "Không mở được bộ " + (k + 1) + ": " + r.err,
        };
      notes.push("mở bộ " + nSlots());
    }
    if (active() !== k) {
      const r = auCall((gg) => gg.switchLoadout(k));
      if (!r.ok)
        return {
          ok: false,
          msg: "Không đổi sang bộ " + (k + 1) + ": " + r.err,
        };
    }
    const rr = await kmApplyDiff(sets[k]);
    if (!rr.ok)
      return { ok: false, msg: "Bộ " + (k + 1) + ": " + rr.msg };
    notes.push(
      "bộ " +
        (k + 1) +
        (rr.same
          ? " giữ nguyên"
          : " (gỡ " + rr.removed + ", đặt " + rr.added + ")"),
    );
  }
  const want = Math.min(opt.keep || 0, nSlots() - 1);
  if (active() !== want) {
    const r = auCall((gg) => gg.switchLoadout(want));
    if (!r.ok)
      return {
        ok: false,
        msg:
          "Đã xếp xong nhưng không đổi về bộ " +
          (want + 1) +
          ": " +
          r.err,
      };
  }
  return {
    ok: true,
    msg:
      "Đã xếp " +
      sets.length +
      " bộ kinh mạch: " +
      notes.join(" · ") +
      ". Đang dùng bộ " +
      (want + 1) +
      ".",
  };
}
// 7.21.0: Tìm cách xếp tối ưu toàn diện 4.0 (5-Topology Seeding + Multi-Start LNS Annealing + Deep Polish)
async function kmSolve(nv, mode, iters, prog) {
  const nv0 = clone(nv);
  nv0.kinhMach.manh = [];
  const cur = evalCurrent(nv, mode);
  prog(0.02, "Khởi tạo 5 cấu trúc hình học…");

  // Khởi tạo 5 hạt giống hình học đa dạng (Huyệt-Steiner, Xương Sống Kinh Lộ, Cụm Tương Sinh, Thân Cây Mật Độ Cao, GRASP Đa Điểm Neo)
  const seedConfigs = [];
  const seenSigs = new Set();
  const sigOfManh = (arr) =>
    (arr || [])
      .map((m) => `${m.item}:${m.x},${m.y},${m.xoay}`)
      .sort()
      .join("|");

  for (let sv = 0; sv < 5; sv++) {
    const gSeed = await greedy(nv0, mode, sv);
    if (kmAborted()) return null;
    const sKey = sigOfManh(gSeed);
    if (gSeed && gSeed.length && !seenSigs.has(sKey)) {
      seenSigs.add(sKey);
      const nvTmp = clone(nv0);
      nvTmp.kinhMach.manh = gSeed;
      const evSeed = evalCurrent(nvTmp, mode);
      seedConfigs.push({ manh: gSeed, score: evSeed.score, sv });
    }
  }

  if (
    cur &&
    cur.manh &&
    cur.manh.length &&
    !(cur.R.manh || []).some((m) => m && !m.thong)
  ) {
    const cKey = sigOfManh(cur.manh);
    if (!seenSigs.has(cKey)) {
      seenSigs.add(cKey);
      seedConfigs.push({ manh: cur.manh, score: cur.score, sv: 99 });
    }
  }

  seedConfigs.sort((a, b) => b.score - a.score);
  const topSeeds = seedConfigs.slice(0, 3);
  while (topSeeds.length < 3) {
    topSeeds.push({
      manh: topSeeds[0] ? topSeeds[0].manh : [],
      score: -1e9,
      sv: topSeeds.length,
    });
  }

  prog(0.08, "Luyện kim nhánh 1 (Huyệt & Cầu Nối)…");
  const a1 = await anneal({
    nv0,
    mode,
    iters: Math.round(iters * 0.45),
    init: topSeeds[0].manh,
    seed: 12345,
    onProg: (f) =>
      prog(0.08 + f * 0.24, "Luyện kim nhánh 1 (Huyệt & Cầu Nối)…"),
  });
  if (kmAborted()) return null;

  prog(0.32, "Luyện kim nhánh 2 (Kinh Lộ & Tương Sinh)…");
  const a2 = await anneal({
    nv0,
    mode,
    iters: Math.round(iters * 0.45),
    init: topSeeds[1].manh,
    seed: 987654321,
    onProg: (f) =>
      prog(
        0.32 + f * 0.24,
        "Luyện kim nhánh 2 (Kinh Lộ & Tương Sinh)…",
      ),
  });
  if (kmAborted()) return null;

  prog(0.56, "Luyện kim nhánh 3 (Mật Độ & Đa Hướng)…");
  const a3 = await anneal({
    nv0,
    mode,
    iters: Math.round(iters * 0.35),
    init: topSeeds[2].manh,
    seed: 27182818,
    onProg: (f) =>
      prog(0.56 + f * 0.18, "Luyện kim nhánh 3 (Mật Độ & Đa Hướng)…"),
  });
  if (kmAborted()) return null;

  const top = [a1, a2, a3, cur].sort((x, y) => y.score - x.score)[0];
  const b = await anneal({
    nv0,
    mode,
    iters: Math.round(iters * 0.45),
    init: top.manh,
    seed: 424243,
    onProg: (f) =>
      prog(0.74 + f * 0.18, "Hội tụ đỉnh cao (LNS & Tương Sinh)…"),
  });
  if (kmAborted()) return null;

  let best = [a1, a2, a3, b].sort((x, y) => y.score - x.score)[0];
  prog(0.92, "Leo đồi & hoàn thiện hình học…");
  {
    const pl = await polish(nv0, mode, best, (f) =>
      prog(0.92 + 0.08 * f, "Leo đồi & hoàn thiện hình học…"),
    );
    if (pl.score >= best.score) best = pl;
  }
  if (kmAborted()) return null;
  best = stripDead(nv, best, mode);
  if (
    cur.score >= best.score &&
    (S.full || !(cur.R.manh || []).some((m) => m && !m.thong))
  ) {
    best = { ...cur, same: true };
  } else {
    const nvNew = clone(nv);
    nvNew.kinhMach.manh = best.manh;
    const evalNew = evalCurrent(nvNew, mode);
    best = {
      ...best,
      P: evalNew.P,
      R: evalNew.R,
      speed: evalNew.speed,
      wins: evalNew.wins,
      n: evalNew.n,
    };
  }
  if (AU.cfg && AU.cfg.km && AU.cfg.km.tayO) {
    const recolors = findOptimalRecolors(
      nv,
      best.manh,
      AU.cfg.km.tayMax || 3,
    );
    if (recolors.length > 0) {
      best.recolorPlan = recolors;
      try {
        const nvRecolor = clone(nv);
        for (const r of recolors) {
          nvRecolor.kinhMach.mau[r.cell] = r.toHe;
        }
        nvRecolor.kinhMach.manh = best.manh;
        const evalRecolor = evalCurrent(nvRecolor, mode);
        if (evalRecolor) {
          best.P = evalRecolor.P;
          best.R = evalRecolor.R;
          best.speed = evalRecolor.speed;
          best.wins = evalRecolor.wins;
          best.n = evalRecolor.n;
          best.score = evalRecolor.score;
        }
      } catch (e) {}
    }
  }
  prog(1, "Xong");
  return { cur, best };
}
// 7.21.0: Đánh giá nhanh độ tiềm năng của ô chuẩn bị mở (xét cả khoảng cách tới Huyệt Đạo bị cô lập & hệ đồ trong túi)
function rankOpenCandidate(i, g, nv, hySet0) {
  let score = 0;
  if (hySet0 && hySet0.has(i)) score += 95;
  const x = i % g.rong;
  const y = Math.floor(i / g.rong);
  const st = nv.kinhMach.trangThai;
  const nb = [
    x > 0 ? i - 1 : -1,
    x < g.rong - 1 ? i + 1 : -1,
    y > 0 ? i - g.rong : -1,
    y < g.cao - 1 ? i + g.rong : -1,
  ].filter((o) => o >= 0 && g.vung[o] >= 0);
  let thongCount = 0;
  for (const o of nb) {
    if (st[o] === "thong") thongCount++;
    if (o === g.danDien) score += 50;
    if (hySet0 && hySet0.has(o) && st[o] !== "thong") score += 35;
  }
  score += thongCount * 16;

  // Thưởng nếu ô này nằm trên đường tiến về một Huyệt Đạo chưa mở
  if (hySet0) {
    for (const h of hySet0) {
      if (g.vung[h] >= 0 && st[h] !== "thong") {
        const hx = h % g.rong,
          hy = Math.floor(h / g.rong);
        const dist = Math.abs(x - hx) + Math.abs(y - hy);
        if (dist <= 3) score += (4 - dist) * 14;
      }
    }
  }

  const cellMau = (nv.kinhMach.mau && nv.kinhMach.mau[i]) || "vo_sac";
  const lc = (nv.linhCan && nv.linhCan.he) || [];
  if (cellMau === "vo_sac") {
    score += 18;
  } else if (lc.includes(cellMau)) {
    score += 28;
  } else if (lc.some((h) => gocHe(h) === gocHe(cellMau))) {
    score += 18;
  } else if (lc.some((h) => heTacDong(h, cellMau) < 0)) {
    score -= 12;
  }
  return score;
}

// Thử mở từng ô mở được rồi xếp lại để đo ô nào lợi nhất (tối ưu hóa v7.15.3).
async function kmOpenSearch(nv, mode, prog) {
  const open = kmOpenable(nv);
  if (!open.length) return { base: null, res: [] };
  const K = S.core,
    c = C();
  const g = K.luoiKinhMach(c, nv);
  const hy0 = hySet(g, nv.kinhMach);

  // Sắp xếp các ô mở được theo tiềm năng thực tế
  const scored = open
    .map((i) => ({
      i,
      pot: rankOpenCandidate(i, g, nv, hy0),
    }))
    .sort((a, b) => b.pot - a.pot);

  // Nếu có nhiều hơn 5 ô mở được, lọc top 5 ô tiềm năng nhất để tôi luyện sâu
  const candidatesToTest =
    scored.length > 5 ? scored.slice(0, 5) : scored;

  const nv0 = clone(nv);
  nv0.kinhMach.manh = [];
  const base = await anneal({
    nv0,
    mode,
    iters: 800,
    init: nv.kinhMach.manh,
    onProg: (f) =>
      prog(f / (candidatesToTest.length + 1), "Mốc hiện tại…"),
  });
  const res = [];
  for (let k = 0; k < candidatesToTest.length && !kmAborted(); k++) {
    const { i } = candidatesToTest[k],
      nvO = clone(nv0);
    nvO.kinhMach.trangThai[i] = "thong";
    const r = await anneal({
      nv0: nvO,
      mode,
      iters: 600,
      init: base.manh,
      onProg: (f) =>
        prog(
          (k + 1 + f) / (candidatesToTest.length + 1),
          `Thử ô ${k + 1}/${candidatesToTest.length}…`,
        ),
    });
    res.push({ i, r, gain: r.score - base.score });
  }
  res.sort((x, y) => y.gain - x.gain);
  return { base, res };
}

// ═════ BẢN 6.19: PHÉP TÍNH GIẢ ĐỊNH (tính thử trên bản sao nhân vật, không đụng game) ═════
function wiManh(nv) {
  const Kc = S.core,
    Cc2 = C(),
    g2 = Kc.luoiKinhMach(Cc2, nv);
  return nv.kinhMach.manh.map((m) => ({
    m,
    key: m.item + ":" + m.x + "," + m.y + "," + m.xoay,
    cells: Kc.oCuaManh(g2, m, Cc2.items.get(m.item)) || [],
  }));
}
function wiEval(nvX, enemies, mode) {
  const ev = makeEval(
    { ...clone(nvX), kinhMach: { ...clone(nvX.kinhMach), manh: [] } },
    enemies,
    mode,
  );
  const e = ev(wiManh(nvX));
  return { s: e.s, wins: e.wins, n: enemies.length, R: e.R, P: e.P };
}
// Nếu lên tiểu cảnh giới kế: trần pháp lực của từng chiêu đang xếp, và đồ trong túi nào vẫn chưa chạm trần.
function kmWhatIfRealm(nv, mode) {
  const tc = nv.tieuCanhGioi || 0,
    nx =
      tc < 3
        ? { cg: nv.canhGioi, tc: tc + 1 }
        : { cg: nv.canhGioi + 1, tc: 0 };
  const nv2 = clone(nv);
  nv2.canhGioi = nx.cg;
  nv2.tieuCanhGioi = nx.tc;
  const X1 = capCtxOf(nv),
    X2 = capCtxOf(nv2);
  if (!X1 || !X2) return { nx, na: true };
  const a = wiEval(nv, benchEnemies(nv.canhGioi, tc), mode),
    b = wiEval(nv2, benchEnemies(nx.cg, nx.tc), mode);
  const rows = [];
  (a.R.manh || []).forEach((m) => {
    if (m && m.thong && m.item && m.item.chieu)
      rows.push({
        ten: m.item.ten,
        up1: capUp(X1, m.item),
        up2: capUp(X2, m.item),
        tier: capTierMatch(X2, m.item),
      });
  });
  const c = C(),
    have = new Set(nv.kinhMach.manh.map((m) => m.item));
  const bag = Object.keys(nv.tuiDo || {})
    .filter((id) => nv.tuiDo[id] > 0)
    .map((id) => c.items.get(id))
    .filter(
      (it) =>
        isKmItem(it) &&
        it.chieu &&
        (it.canh_gioi ?? 0) <= nv.canhGioi &&
        !have.has(it.id),
    )
    .map((it) => ({
      it,
      up2: capUp(X2, it),
      tier: capTierMatch(X2, it),
    }))
    .filter((x) => x.up2 >= 0.999)
    .sort(
      (x, y) =>
        y.tier - x.tier || (y.it.pham_cap || 0) - (x.it.pham_cap || 0),
    )
    .slice(0, 6);
  return { nx, a, b, rows, bag };
}
// Nếu gỡ từng món khỏi cách đang xếp: món nào đáng giữ nhất.
async function kmWhatIfRemove(nv, mode, prog) {
  const enemies = benchEnemies(nv.canhGioi, nv.tieuCanhGioi || 0),
    base = wiEval(nv, enemies, mode),
    c = C(),
    list = nv.kinhMach.manh,
    out = [];
  for (let k = 0; k < list.length && !S.abort; k++) {
    const nv2 = clone(nv);
    nv2.kinhMach.manh = list
      .filter((_, j) => j !== k)
      .map((m) => ({ ...m }));
    const e = wiEval(nv2, enemies, mode),
      it = c.items.get(list[k].item);
    out.push({
      ten: it ? it.ten : list[k].item,
      loss: base.s - e.s,
      dw: e.wins - base.wins,
      thong: !!(base.R.manh[k] && base.R.manh[k].thong),
    });
    prog(
      (k + 1) / list.length,
      "Gỡ thử " + (k + 1) + "/" + list.length + "…",
    );
    await sleep0();
  }
  out.sort((x, y) => y.loss - x.loss);
  return { base, out };
}
// Nếu đổi màu một ô (theo hệ linh căn): chỉ thử ô nằm dưới món đang thông và màu mới hợp món hơn màu cũ; tối đa 160 phép thử.
async function kmWhatIfRecolor(nv, mode, prog) {
  const enemies = benchEnemies(nv.canhGioi, nv.tieuCanhGioi || 0),
    base = wiEval(nv, enemies, mode),
    g = S.core.luoiKinhMach(C(), nv),
    km = nv.kinhMach,
    c = C();
  const lc = ((nv.linhCan && nv.linhCan.he) || []).filter(
    (h) => h && h !== "vo_sac",
  );
  const own = new Map();
  wiManh(nv).forEach((p, i) => {
    if (base.R.manh[i] && base.R.manh[i].thong)
      p.cells.forEach((x) => {
        if (x !== g.danDien) own.set(x, c.items.get(p.m.item));
      });
  });
  const jobs = [];
  for (const [x, it] of own) {
    const hs = ((it && it.he) || []).filter((h) => h && h !== "vo_sac");
    if (!hs.length) continue;
    const w0 = Math.max(...hs.map((h) => oHop(km.mau[x], h)));
    for (const h of lc) {
      if (km.mau[x] === h) continue;
      const d =
        Math.max(...hs.map((q) => oHop(h, q))) -
        w0 +
        (hs.some((q) => oKhac(km.mau[x], q)) ? 0.25 : 0);
      if (d > 0) jobs.push({ x, h, d });
    }
  }
  jobs.sort((p, q) => q.d - p.d);
  const list = jobs.slice(0, 160),
    out = [];
  for (let k = 0; k < list.length && !S.abort; k++) {
    const nvC = clone(nv);
    nvC.kinhMach.mau[list[k].x] = list[k].h;
    const e = wiEval(nvC, enemies, mode);
    out.push({
      x: list[k].x,
      from: km.mau[list[k].x],
      to: list[k].h,
      gain: e.s - base.s,
      dw: e.wins - base.wins,
      ten: (own.get(list[k].x) || {}).ten || "",
    });
    if (k % 4 === 0) {
      prog(
        (k + 1) / list.length,
        "Thử đổi màu " + (k + 1) + "/" + list.length + "…",
      );
      await sleep0();
    }
  }
  out.sort((x, y) => y.gain - x.gain);
  return {
    base,
    out: out.slice(0, 8),
    tried: list.length,
    total: jobs.length,
    g,
    left: (km.cho && km.cho.doiMau) || 0,
  };
}

const HE_VI = {
  kim: "Kim",
  moc: "Mộc",
  thuy: "Thủy",
  hoa: "Hỏa",
  tho: "Thổ",
  loi: "Lôi",
  bang: "Băng",
  phong: "Phong",
  am: "Ám",
  vo_sac: "Vô Sắc",
};

// ── Tìm danh sách các ô kinh mạch nên tẩy (đổi hệ) để khớp các mảnh đã xếp tối đa
function findOptimalRecolors(nv, bestPieces, maxCount) {
  if (!nv || !nv.kinhMach) return [];
  const K = S.core,
    c = C();
  if (!K || !c) return [];

  const g = K.luoiKinhMach(c, nv);
  if (!g) return [];
  const mauK = nv.kinhMach.mau || [];
  const maxLimit =
    maxCount != null
      ? maxCount
      : (AU.cfg && AU.cfg.km && AU.cfg.km.tayMax) || 3;
  const limit = Math.max(1, maxLimit);

  const candidates = [];
  const seenCandCells = new Set();

  const evaluatePieces = (pieceList) => {
    if (!Array.isArray(pieceList)) return;
    for (const m of pieceList) {
      if (!m || !m.item) continue;
      const it = c.items.get(m.item);
      if (!it) continue;
      let cells, cellElements;
      try {
        cells = K.oCuaManh(g, m, it);
        cellElements = K.heTungO ? K.heTungO(it, m.xoay) : null;
      } catch (e) {
        continue;
      }
      if (!cells) continue;
      const hs = ((it && it.he) || []).filter(
        (h) => h && h !== "vo_sac",
      );

      for (let idx = 0; idx < cells.length; idx++) {
        const cell = cells[idx];
        if (seenCandCells.has(cell)) continue;
        if (cell === g.danDien) continue;
        if (
          nv.kinhMach.trangThai &&
          nv.kinhMach.trangThai[cell] === "an"
        )
          continue;

        const wantedHe =
          cellElements && cellElements[idx]
            ? cellElements[idx]
            : hs[0] || "vo_sac";
        const curMau = mauK[cell] || "vo_sac";
        if (!wantedHe || wantedHe === "vo_sac" || curMau === wantedHe)
          continue;

        let availHe = [];
        try {
          availHe = (K.heDoiDuoc && K.heDoiDuoc(nv, c, cell)) || [];
        } catch (e) {
          availHe = [];
        }
        if (!availHe.length) {
          const lcHe = (nv.linhCan && nv.linhCan.he) || [];
          availHe = lcHe.filter((h) => h !== curMau);
        }
        if (!availHe.length) continue;

        let targetHe = null;
        let gain = 0;
        if (availHe.includes(wantedHe)) {
          targetHe = wantedHe;
          gain = curMau === "vo_sac" ? 0.5 : 1.0;
        } else if (curMau !== "vo_sac" && availHe.includes("vo_sac")) {
          targetHe = "vo_sac";
          gain = 0.5;
        }

        if (targetHe) {
          seenCandCells.add(cell);
          const scPwr = kmScalablePower(
            it,
            (AU.cfg && AU.cfg.km && AU.cfg.km.mode) || "bal",
            null,
          );
          const hySetNow = hySet(g, nv.kinhMach);
          const hyCnt = cells.filter((cIdx) =>
            hySetNow.has(cIdx),
          ).length;
          const hyAmp = hyCnt > 0 ? 2.0 + 0.25 * (hyCnt - 1) : 1.0;
          const wasKhac = oKhac(curMau, wantedHe);
          const totalKhacBefore = cells.filter((cIdx, kIdx) => {
            const mC = mauK[cIdx] || "vo_sac";
            const pH =
              cellElements && cellElements[kIdx]
                ? cellElements[kIdx]
                : hs[0] || "vo_sac";
            return oKhac(mC, pH);
          }).length;
          // Nếu đổi màu ô này giúp thoát ngưỡng quá nửa ô khắc (> cells.length / 2), triệt tiêu ngay +1 Điểm Nghịch!
          const eliminatesNghich =
            wasKhac &&
            totalKhacBefore * 2 > cells.length &&
            (totalKhacBefore - 1) * 2 <= cells.length;
          const effectivePwr =
            (scPwr * hyAmp) / Math.max(1, cells.length) +
            (eliminatesNghich ? 600 : wasKhac ? 45 : 0);
          candidates.push({
            cell,
            fromHe: curMau,
            toHe: targetHe,
            itId: it.id,
            itTen: it.ten || it.id,
            col: (cell % g.rong) + 1,
            row: Math.floor(cell / g.rong) + 1,
            score: gain * effectivePwr,
          });
        }
      }
    }
  };

  if (Array.isArray(bestPieces) && bestPieces.length)
    evaluatePieces(bestPieces);
  if (Array.isArray(nv.kinhMach.manh) && nv.kinhMach.manh.length)
    evaluatePieces(nv.kinhMach.manh);

  candidates.sort((a, b) => b.score - a.score);

  const chosen = [];
  const chosenCells = new Set();
  for (const cand of candidates) {
    if (!chosenCells.has(cand.cell)) {
      chosenCells.add(cand.cell);
      chosen.push(cand);
      if (chosen.length >= limit) break;
    }
  }
  return chosen;
}

// ── Tab Kinh mạch
function statRows(a, b) {
  const ch = (r) =>
    r.P.chieu
      .filter((x) => x.dang !== undefined)
      .map((x) => `${esc(x.ten)} (${Math.round(x.uy)})`)
      .join(", ");
  const nv = nvNow(),
    c = C(),
    K = S.core,
    g = K.luoiKinhMach(c, nv),
    hy = hySet(g, nv.kinhMach),
    maxHoThe =
      0.6 +
      ((nv.theChat &&
        nv.theChat.dac_tinh &&
        nv.theChat.dac_tinh.ho_the_tran) ||
        0);
  const curHy = (a.R.manh || [])
    .filter((m) => m && m.thong && m.acupoints > 0)
    .reduce((x, m) => x + m.acupoints, 0);
  const newHy = (b.R.manh || [])
    .filter((m) => m && m.thong && m.acupoints > 0)
    .reduce((x, m) => x + m.acupoints, 0);
  const curHt = (a.R.biDong && a.R.biDong.ho_the) || 0,
    newHt = (b.R.biDong && b.R.biDong.ho_the) || 0;
  const curKtm = (a.R.biDong && a.R.biDong.khang_tam_ma) || 0,
    newKtm = (b.R.biDong && b.R.biDong.khang_tam_ma) || 0;

  // ── Tính toán các chỉ số chiến đấu chuyên sâu
  const ctrlRatio =
    K && K.CONTROL_DAMAGE_RATIO != null ? K.CONTROL_DAMAGE_RATIO : 0.6;
  const shieldMult =
    K && K.SHIELD_UY_MULT != null ? K.SHIELD_UY_MULT : 1.0;
  const shieldCapRatio =
    K && K.SHIELD_CAP_RATIO != null ? K.SHIELD_CAP_RATIO : 0.6;
  const burstMult =
    K && K.BURST_DAMAGE_MULT != null ? K.BURST_DAMAGE_MULT : 1.5;

  const getSkillDmg = (s) => {
    if (!s || !s.uy) return 0;
    if (s.dang === "cong") return s.uy;
    if (s.dang === "khong_che") return s.uy * ctrlRatio;
    if (s.dang !== "thu" && s.dang !== "hoi_phuc" && s.uy > 0)
      return s.uy;
    return 0;
  };

  const parseSkills = (r) => {
    const list = (r && r.P && r.P.chieu) || [];
    let strongest = null,
      maxD = 0,
      totalD = 0,
      shieldSum = 0;
    for (const s of list) {
      const d = getSkillDmg(s);
      totalD += d;
      if (d > maxD) {
        maxD = d;
        strongest = s;
      }
      if (
        s.dang === "thu" ||
        (s.effects &&
          s.effects.some(
            (e) => e.kind === "ho_thuan" || e.loai === "ho_thuan",
          ))
      ) {
        shieldSum += (s.uy || 0) * shieldMult;
      }
    }
    const hpMax = (r && r.P && r.P.khiHuyetToiDa) || 0;
    const shieldCap = Math.round(hpMax * shieldCapRatio);
    return {
      spellPower: Math.round(
        (r && r.P && (r.P.spellPower ?? r.P.phapLuc)) || 0,
      ),
      bodyPower:
        r && r.P && r.P.bodyPower ? Math.round(r.P.bodyPower) : null,
      strongest: strongest
        ? `${esc(strongest.ten)} (${num(Math.round(maxD))})`
        : "—",
      strongestDmg: maxD,
      totalDmg: Math.round(totalD),
      shieldText:
        shieldSum > 0
          ? `${num(Math.round(shieldSum))} (trần ${num(shieldCap)})`
          : `0 (trần ${num(shieldCap)})`,
      burstText:
        maxD > 0
          ? `×${num(burstMult, 1)} (tới ${num(Math.round(maxD * burstMult))})`
          : `×${num(burstMult, 1)}`,
    };
  };

  const skA = parseSkills(a),
    skB = parseSkills(b);
  const spStrA =
    num(skA.spellPower) +
    (skA.bodyPower ? ` (Thể: ${num(skA.bodyPower)})` : "");
  const spStrB =
    num(skB.spellPower) +
    (skB.bodyPower ? ` (Thể: ${num(skB.bodyPower)})` : "");

  const spdA =
    a.speed != null
      ? a.speed
      : K && K.tocDoTuLuyen
        ? K.tocDoTuLuyen(nv, c)
        : null;
  let spdB = b.speed;
  if (spdB == null) {
    if (b.same) spdB = spdA;
    else {
      try {
        const nvB = clone(nv);
        nvB.kinhMach.manh = b.manh.map((m) => ({ ...m }));
        spdB = K && K.tocDoTuLuyen ? K.tocDoTuLuyen(nvB, c) : null;
      } catch (e) {
        spdB = null;
      }
    }
  }
  const tuStr = (s, r) =>
    s != null
      ? `×${num(s, 2)} (+${pct((r && r.biDong && r.biDong.toc_do) || 0)})`
      : `+${pct((r && r.biDong && r.biDong.toc_do) || 0)}`;

  const llBalanceStr = (P) => {
    if (!P) return "—";
    const cList = (P.chieu || []).filter((x) => (x.phi || 0) > 0);
    if (!cList.length)
      return `<span class="vk-ok">0 chiêu tiêu hao · Chân khí thuần bị động</span>`;
    const ll = P.linhLucMoiLuot || 0;
    const mPhi = Math.max(...cList.map((x) => x.phi || 0));
    let drain = 0;
    for (const sk of cList) {
      drain += (sk.phi || 0) / Math.max(1, (sk.hoi || 0) + 1);
    }
    drain = Math.round(drain * 10) / 10;
    if (ll >= drain * 1.15 && ll >= mPhi * 0.95 && cList.length <= 3) {
      return `<span class="vk-ok" style="font-weight:bold">🟢 Tự Cấp Tự Túc (${cList.length} chiêu · hồi +${num(ll)}/lượt vs dùng ~${num(drain)}/lượt · Không cần cắn đan)</span>`;
    }
    if (ll >= drain && cList.length <= 4) {
      return `<span class="vk-ok">🟡 Cân Bằng (${cList.length} chiêu · hồi +${num(ll)}/lượt vs dùng ~${num(drain)}/lượt)</span>`;
    }
    if (drain > ll) {
      const def = Math.round((drain - ll) * 10) / 10;
      return `<span style="color:#ef4444;font-weight:bold">🔴 Thiếu Hụt Chân Khí (thiếu ~${num(def)}/lượt · Nguy cơ cắn đan)</span>`;
    }
    return `<span style="color:#f59e0b">⚠️ Dồn Chiêu (${cList.length} chiêu)</span>`;
  };

  const rows = [
    ["Thắng trận mẫu", `${a.wins}/${a.n}`, `${b.wins}/${b.n}`],
    ["Pháp lực", spStrA, spStrB],
    ["Chiêu mạnh nhất", skA.strongest, skB.strongest],
    ["Tổng sát thương chiêu", num(skA.totalDmg), num(skB.totalDmg)],
    ["Tạo hộ thuẫn", skA.shieldText, skB.shieldText],
    ["Bột phát sát thương", skA.burstText, skB.burstText],
    [
      "Tận dụng huyệt đạo",
      `${curHy}/${hy.size} ô`,
      `${newHy}/${hy.size} ô`,
    ],
    [
      "Hộ thể (giảm sát thương)",
      `+${pct(curHt)}${curHt >= maxHoThe ? " (trần)" : ""}`,
      `+${pct(newHt)}${newHt >= maxHoThe ? " (trần " + Math.round(maxHoThe * 100) + "%)" : ""}`,
    ],
    [
      "Khí huyết",
      num(Math.round(a.P.khiHuyetToiDa)),
      num(Math.round(b.P.khiHuyetToiDa)),
    ],
    [
      "Linh lực hồi / lượt",
      num(a.P.linhLucMoiLuot ?? a.R.linhLuc),
      num(b.P.linhLucMoiLuot ?? b.R.linhLuc),
    ],
    [
      "Linh lực",
      num(
        a.R.linhLucToiDa ??
          a.P.linhLucToiDa ??
          a.P.linhLuc ??
          a.P.linhLucMoiLuot * 3,
      ),
      num(
        b.R.linhLucToiDa ??
          b.P.linhLucToiDa ??
          b.P.linhLuc ??
          b.P.linhLucMoiLuot * 3,
      ),
    ],
    [
      "Chiêu tốn nhiều nhất",
      num(Math.max(0, ...(a.P.chieu || []).map((x) => x.phi || 0))),
      num(Math.max(0, ...(b.P.chieu || []).map((x) => x.phi || 0))),
    ],
    ["Vòng chiêu & Linh lực", llBalanceStr(a.P), llBalanceStr(b.P)],
    ["Tu luyện", tuStr(spdA, a.R), tuStr(spdB, b.R)],
    [
      "Đột phá",
      "+" + pct(a.R.biDong.dot_pha || 0, 1),
      "+" + pct(b.R.biDong.dot_pha || 0, 1),
    ],
    ["Kháng tâm ma", "+" + pct(curKtm), "+" + pct(newKtm)],
    ["Điểm nghịch", a.R.diemNghich || 0, b.R.diemNghich || 0],
  ];

  let recolorHtml = "";
  const plan =
    (b && (b.recolorPlan || (b.best && b.best.recolorPlan))) || null;
  if (Array.isArray(plan) && plan.length > 0) {
    const doiMauLeft = (nv.kinhMach.cho && nv.kinhMach.cho.doiMau) || 0;
    const pillsInBag =
      (nv.tuiDo &&
        (nv.tuiDo["item.tay_tuy_dan"] || 0) +
          (nv.tuiDo["item.cai_menh_dan"] || 0) +
          (nv.tuiDo["item.dich_cot_dan"] || 0)) ||
      0;
    let pillStatus = "";
    if (doiMauLeft >= plan.length) {
      pillStatus = `<span class="vk-ok" style="font-size:11.5px"> · Đang có sẵn <b>${doiMauLeft}</b> lượt chuyển hệ</span>`;
    } else {
      const need = plan.length - doiMauLeft;
      if (pillsInBag >= need) {
        pillStatus = `<span class="vk-ok" style="font-size:11.5px"> · Túi có sẵn <b>${pillsInBag}</b> viên đan tẩy tủy (Auto sẽ tự dùng khi chạy)</span>`;
      } else {
        pillStatus = `<span class="vk-mu" style="font-size:11.5px"> · Cần thêm <b>${need}</b> viên Tẩy Tủy / Cải Mệnh Đan (túi có ${pillsInBag} viên)</span>`;
      }
    }

    const planItems = plan
      .map(
        (p) =>
          `• Cột ${p.col}, Hàng ${p.row}: ${HE_VI[p.fromHe] || p.fromHe} ➔ <b style="color:var(--acc, #3ddc97)">${HE_VI[p.toHe] || p.toHe}</b> (phù hợp «${esc(p.itTen)}»)`,
      )
      .join("<br>");
    recolorHtml = `<div style="margin-top:8px;padding:7px 11px;background:rgba(61,220,151,0.08);border:1px solid var(--acc, #3ddc97);border-radius:8px;font-size:12px;line-height:1.45">
      <b style="color:var(--acc, #3ddc97)">🎨 Kế Hoạch Tẩy Ô Tối Ưu (${plan.length} ô):</b>${pillStatus}<br>${planItems}
    </div>`;
  }

  return `<table class="vk-t"><tr><th></th><th>Đang xếp</th><th>Bản mới</th></tr>${rows.map((r) => `<tr><td>${r[0]}</td><td>${r[1]}</td><td><b>${r[2]}</b></td></tr>`).join("")}
    <tr><td>Chiêu</td><td>${ch(a)}</td><td>${ch(b)}</td></tr></table>${recolorHtml}`;
}

async function optimizeMode(nv, mode, iters, prog, f0, f1, label) {
  const P = (f, l) =>
    prog(f0 + (f1 - f0) * Math.max(0, Math.min(1, f)), l || label);
  const sol = await kmSolve(nv, mode, iters, P);
  return sol ? sol.best : null;
}
function kmManualHtml(nv) {
  const tacAll = nv.kinhMach.trangThai.filter(
      (s) => s === "tac",
    ).length,
    tac = kmOpenable(nv);
  const mo = (nv.kinhMach.cho && nv.kinhMach.cho.mo) || 0;
  return `
    <div class="vk-card"><h3>Xếp Từ Đồ Trong Túi</h3>
      <div class="vk-mu" style="font-size:13px">Tool thử hàng nghìn cách xếp các món trong túi, đánh thử 9 trận mẫu cùng cảnh giới cho mỗi cách và giữ cách tốt nhất, theo Cài Đặt Chung ở trên. Kết quả hiện ở đây, bạn bấm Áp Dụng Vào Game khi ưng; muốn Tool tự làm hết thì dùng Auto Kinh Mạch.</div>
      <button class="vk-btn" id="vk-go" style="margin-top:8px">Bắt Đầu Xếp</button>
      ${progressHtml("vk-pr")}<div id="vk-out"></div></div>
    <div class="vk-card"><h3>Hai bộ kinh mạch: bế quan và đánh</h3>
      <div class="vk-mu" style="font-size:13px">Game cho lưu tới 3 bộ kinh mạch và đổi bộ miễn phí (mở bộ 2 tốn 1.000 linh thạch, bộ 3 tốn 15.000). Bạn đang có <b>${(nv.kinhMach.loadouts || []).length || 1}</b> bộ. Nên lưu 1 bộ <b>Tu luyện</b> (dùng khi bế quan, đột phá) và 1 bộ <b>Đánh</b> (dùng khi đi đánh, làm nhiệm vụ, khảo hạch). Tool xếp sẵn cả hai và áp dụng thẳng vào game bằng nút bên dưới.</div>
      <button class="vk-btn" id="vk-2b">Xếp 2 bộ</button>${progressHtml("vk-pr2b")}<div id="vk-2o"></div></div>
    <div class="vk-card"><h3>Ô kinh mạch nên mở</h3>
      <div class="vk-mu" style="font-size:13px">Có ${tacAll} ô tắc, trong đó ${tac.length} ô mở được ngay (kề ô đã thông) · còn ${mo} lượt khai thông. Tool thử mở từng ô rồi xếp lại để xem ô nào lợi nhất.</div>
      <button class="vk-btn" id="vk-op" ${tac.length ? "" : "disabled"}>Tìm ô nên mở</button>
      ${progressHtml("vk-pr2")}<div id="vk-out2"></div></div>
    <div class="vk-card"><h3>Phép Tính Giả Định</h3>
      <div class="vk-mu" style="font-size:13px">Tính thử trên bản sao nhân vật, không đụng game, dựa trên cách bạn đang xếp. Trận mẫu luôn là đối thủ cùng cảnh giới với nhân vật giả định.</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px"><button class="vk-btn sec" id="vk-wi-up">Nếu Lên Tiểu Cảnh Giới Kế</button><button class="vk-btn sec" id="vk-wi-rm">Nếu Gỡ Từng Món</button><button class="vk-btn sec" id="vk-wi-col">Nếu Đổi Màu Một Ô</button></div>
      ${progressHtml("vk-prw")}<div id="vk-outw"></div></div>
    <div class="vk-card"><h3>Đang xếp trong game</h3><div id="vk-cur"></div></div>
    <div class="vk-card"><h3>Nguyên lý kinh mạch (đọc từ code game)</h3><ul style="margin:0;padding-left:18px;font-size:14px">
      <li><b>Thông:</b> tâm pháp/đấu pháp thông khi chạm đan điền hoặc chạm một công pháp đã thông (nối thành chuỗi). Pháp khí thông khi chạm đan điền hoặc chạm công pháp đã thông. Món không thông = không có tác dụng.</li>
      <li><b>Màu ô:</b> hệ số = 0,85 + 0,45 × độ hợp trung bình các ô (đúng hệ = 1; cùng gốc như Băng–Thủy hoặc có Vô sắc = 0,5; khác hệ = 0). Đặt đúng màu tối đa ×1,3.</li>
      <li><b>Huyệt:</b> phủ 1 huyệt ×2, mỗi huyệt thêm +0,25. Nên đặt món mạnh nhất (chiêu chính, pháp khí thủ) lên huyệt.</li>
      <li><b>Sinh khắc:</b> game tính theo từng ô chạm nhau (hệ của ô, không chỉ hệ cả món). Mỗi món kề bên đã thông sinh ra hệ món này +15%, nhưng món sinh kém phẩm thì yếu đi (kém 1 phẩm ×2/3, kém 2 phẩm ×1/3, kém từ 3 phẩm không tính; món Nghịch Thiên luôn đủ); mỗi món khắc −15% (thấp nhất ×0,4). Tà công (nghịch): sinh +15% như trên và <b>mỗi món khắc kề bên +25%</b>.</li>
      <li><b>Độ hợp phẩm &amp; Lĩnh Ngộ:</b> sức mỗi món còn nhân thêm độ hợp phẩm theo cảnh giới (${fitNote()}) và độ Lĩnh Ngộ trong game (món mới đặt lên bắt đầu ở ×0,5 rồi đầy dần tới ×1; Viên Mãn ×1,1). Tool chỉ tính ở mức đã đầy, không xếp theo Lĩnh Ngộ.</li>
      <li><b>Mở ô:</b> chỉ mở được ô tắc kề một ô đã thông, mỗi lần tốn 1 lượt khai thông.</li>
      <li><b>Kinh lộ (pháp khí):</b> chuỗi công pháp từ đan điền tới pháp khí, mỗi công pháp cùng họ hệ +10% (tối đa 5).</li>
      <li><b>Hướng xếp của Tool:</b> Tiên Tu cộng điểm cho các món kề nhau tương sinh và trừ khi kề nhau tương khắc; Ma Tu ngược lại (tà công cần kề món khắc mới vận hành, điểm nghịch chỉ bị tính nhẹ hơn). Ưu tiên linh căn &amp; huyệt cộng thêm cho ô đúng màu (và cùng gốc), theo thứ tự món trùng hệ linh căn &gt; dị linh căn cùng gốc &gt; hệ không bị khắc; món nằm trên ô khắc nó bị trừ, món thông nằm trên huyệt được cộng. Tương sinh giữa món và ô không được thưởng vì game không tính. Tool còn trừ điểm cho chiêu đã chạm trần pháp lực và cộng nhẹ món phẩm bằng cảnh giới. Độ ép hướng cố định ở mức Mạnh. Các điểm cộng này do Tool tự ước lượng, kết quả thật vẫn do hệ số game quyết định.</li>
      <li><b>Nội tại:</b> món nhiều hệ mà các hệ sinh nhau ×1,1.</li>
      <li><b>Điểm nghịch</b> (+1 mỗi cặp món kề nhau khắc nhau, +1 mỗi món đặt quá nửa trên ô khắc nó, +1 mỗi món tự có hệ khắc nhau): mỗi điểm −3% tỉ lệ đột phá (tối đa −15%) và gây phản phệ trong trận. Tool trừ điểm nghịch khi xếp.</li>
      <li><b>Tâm pháp:</b> tốc độ tu luyện/đột phá/kháng tâm ma không nhân hệ số, chỉ cần thông; linh lực và chỉ số thì nhân hệ số. Món Vô sắc cho linh lực ×0,85.</li>
    </ul></div>`;
}
function kmManualBind(nv) {
  const tac = kmOpenable(nv),
    mo = (nv.kinhMach.cho && nv.kinhMach.cho.mo) || 0;
  try {
    body.querySelector("#vk-cur").innerHTML = drawGrid(
      nv,
      nv.kinhMach.manh,
    );
  } catch (e) {
    body.querySelector("#vk-cur").innerHTML = errBox(e);
  }
  if (
    S.best &&
    S.best.nvKey ===
      JSON.stringify([
        nv.tuiDo,
        nv.kinhMach.trangThai,
        nv.canhGioi,
        nv.tieuCanhGioi,
      ])
  )
    showBest(nv);
  body.querySelector("#vk-go").onclick = async (ev) => {
    if (kmAutoRunning()) {
      UI.notify("Auto Kinh Mạch đang chạy, hãy dừng trước.");
      return;
    }
    ev.target.disabled = true;
    S.abort = false;
    const kmRestore = auKmPin(AU.cfg.km);
    const mode = AU.cfg.km.mode,
      iters = AU.cfg.km.iters;
    const prog = bindProgress(body.querySelector("#vk-pr"));
    try {
      const sol = await kmSolve(nv, mode, iters, (f, l) => prog(f, l));
      if (!sol) return;
      const { cur, best } = sol;
      S.best = {
        nvKey: JSON.stringify([
          nv.tuiDo,
          nv.kinhMach.trangThai,
          nv.canhGioi,
          nv.tieuCanhGioi,
        ]),
        cur,
        best,
        mode,
      };
      body.querySelector("#vk-pr").style.display = "none";
      showBest(nv);
    } catch (e) {
      console.error(e);
      body.querySelector("#vk-out").innerHTML = errBox(e);
    }
    kmRestore();
    ev.target.disabled = false;
  };
  body.querySelector("#vk-2b").onclick = async (ev) => {
    if (kmAutoRunning()) {
      UI.notify("Auto Kinh Mạch đang chạy, hãy dừng trước.");
      return;
    }
    ev.target.disabled = true;
    S.abort = false;
    const kmRestore = auKmPin(AU.cfg.km);
    const prog = bindProgress(body.querySelector("#vk-pr2b"));
    try {
      const res = {};
      for (const [k, mode, f0, f1] of [
        ["tu", "tu", 0, 0.5],
        ["danh", "danh", 0.5, 1],
      ])
        res[k] = await optimizeMode(
          nv,
          mode,
          2400,
          prog,
          f0,
          f1,
          mode === "tu" ? "Bộ tu luyện…" : "Bộ đánh…",
        );
      body.querySelector("#vk-pr2b").style.display = "none";
      const box = (
        title,
        r,
        note,
      ) => `<div style="margin-top:12px"><b>${title}</b> <span class="vk-mu" style="font-size:13px">${note}</span>
  <div style="font-size:14px;margin:4px 0">Thắng ${r.wins}/${r.n} trận mẫu · tu luyện +${pct(r.R.biDong.toc_do || 0)} · đột phá +${pct(r.R.biDong.dot_pha || 0, 1)} · linh lực hồi ${num(r.P ? r.P.linhLucMoiLuot || 0 : 0)}/lượt · điểm nghịch ${r.R.diemNghich || 0}</div>${drawGrid(nv, r.manh)}</div>`;
      body.querySelector("#vk-2o").innerHTML =
        box("Bộ 1 · Tu luyện", res.tu, "dùng khi bế quan, đột phá") +
        box("Bộ 2 · Đánh", res.danh, "dùng khi ra ngoài đánh") +
        `<div class="vk-mu" style="font-size:12px;margin-top:6px">Cách lưu trong game: ở màn kinh mạch bấm ô Bộ 1, xếp theo ảnh thứ nhất; bấm Bộ 2 (mở nếu chưa có), xếp theo ảnh thứ hai. Trước khi bế quan đổi sang Bộ 1, trước khi đi đánh đổi sang Bộ 2.</div><div style="margin-top:8px"><button class="vk-btn" id="vk-2apply">Áp Dụng 2 Bộ Vào Game</button></div>`;
      {
        const b2 = body.querySelector("#vk-2apply");
        if (b2)
          b2.onclick = async (e2) => {
            if (kmAutoRunning()) {
              UI.notify("Auto Kinh Mạch đang chạy, hãy dừng trước.");
              return;
            }
            const have = (nvNow().kinhMach.loadouts || [1]).length;
            let mo = false;
            if (have < 2) {
              mo = window.confirm(
                "Bạn mới có " +
                  have +
                  " bộ kinh mạch. Mở thêm bộ 2 sẽ tốn Linh Thạch (bộ 2: 1.000, bộ 3: 15.000; game báo giá thật). Tiếp tục?",
              );
              if (!mo) return;
            }
            e2.target.disabled = true;
            const r2 = await kmApplyLoadouts(
              [res.tu.manh, res.danh.manh],
              { mo, keep: 0 },
            );
            UI.notify((r2.ok ? "✅ " : "❌ ") + r2.msg);
            e2.target.disabled = false;
            if (r2.ok) await render();
          };
      }
    } catch (e) {
      console.error(e);
      body.querySelector("#vk-2o").innerHTML = errBox(e);
    }
    kmRestore();
    ev.target.disabled = false;
  };
  body.querySelector("#vk-op").onclick = async (ev) => {
    if (kmAutoRunning()) {
      UI.notify("Auto Kinh Mạch đang chạy, hãy dừng trước.");
      return;
    }
    ev.target.disabled = true;
    S.abort = false;
    const prog = bindProgress(body.querySelector("#vk-pr2"));
    const kmRestore = auKmPin(AU.cfg.km);
    const mode = AU.cfg.km.mode;
    try {
      const nv0 = clone(nv);
      nv0.kinhMach.manh = [];
      const base = await anneal({
        nv0,
        mode,
        iters: 800,
        init: nv.kinhMach.manh,
        onProg: (f) => prog(f / (tac.length + 1), "Mốc hiện tại…"),
      });
      const res = [];
      for (let k = 0; k < tac.length && !S.abort; k++) {
        const i = tac[k];
        const nvO = clone(nv0);
        nvO.kinhMach.trangThai[i] = "thong";
        const r = await anneal({
          nv0: nvO,
          mode,
          iters: 600,
          init: base.manh,
          onProg: (f) =>
            prog(
              (k + 1 + f) / (tac.length + 1),
              `Thử ô ${k + 1}/${tac.length}…`,
            ),
        });
        res.push({ i, r, gain: r.score - base.score });
      }
      res.sort((x, y) => y.gain - x.gain);
      body.querySelector("#vk-pr2").style.display = "none";
      const top = res[0];
      const g = S.core.luoiKinhMach(C(), nv);
      const pos = (i) =>
        `cột ${(i % g.rong) + 1}, hàng ${Math.floor(i / g.rong) + 1}`;
      let html =
        `<table class="vk-t"><tr><th>Ô (tính từ góc trên trái)</th><th>Hệ</th><th>Thắng</th><th>Lợi</th><th></th></tr>` +
        res
          .map(
            (x) =>
              `<tr><td>${pos(x.i)}</td><td>${heTen(nv.kinhMach.mau[x.i])}</td><td>${x.r.wins}/${x.r.n}</td><td>${x.gain > 1 ? '<span class="vk-ok">+' + Math.round(x.gain) + "</span>" : '<span class="vk-mu">≈0</span>'}</td><td>${mo > 0 ? `<button class="vk-btn sec" data-open="${x.i}" style="padding:4px 8px">Mở</button>` : ""}</td></tr>`,
          )
          .join("") +
        "</table>";
      if (top && top.gain > 1) {
        const nvO = clone(nv);
        nvO.kinhMach.trangThai[top.i] = "thong";
        html =
          `<div class="vk-ok" style="margin:6px 0">Nên mở ô có khung xanh "MỞ" (${pos(top.i)}). Xếp như ảnh sau khi mở:</div>` +
          drawGrid(nvO, top.r.manh, new Set([top.i])) +
          html;
      } else
        html =
          `<div class="vk-mu" style="margin:6px 0">Với đồ hiện có, mở ô nào cũng chưa lợi thêm. Giữ lượt khai thông lại.</div>` +
          html;
      body.querySelector("#vk-out2").innerHTML = html;
      body.querySelectorAll("#vk-out2 [data-open]").forEach((b) => {
        b.onclick = async () => {
          const r = auCall((gg) => gg.moO(+b.dataset.open));
          UI.notify(r.ok ? "✅ Đã mở ô." : "❌ " + r.err);
          if (r.ok) await render();
        };
      });
    } catch (e) {
      console.error(e);
      body.querySelector("#vk-out2").innerHTML = errBox(e);
    }
    kmRestore();
    ev.target.disabled = false;
  };
  // 6.19: Phép tính giả định
  const wiRun = async (btn, work) => {
    if (kmAutoRunning()) {
      UI.notify("Auto Kinh Mạch đang chạy, hãy dừng trước.");
      return;
    }
    btn.disabled = true;
    S.abort = false;
    const box = body.querySelector("#vk-prw"),
      out = body.querySelector("#vk-outw"),
      prog = bindProgress(box),
      kmRestore = auKmPin(AU.cfg.km);
    try {
      out.innerHTML = "";
      await work(prog, out, AU.cfg.km.mode);
      box.style.display = "none";
    } catch (e) {
      console.error(e);
      out.innerHTML = errBox(e);
    }
    kmRestore();
    btn.disabled = false;
  };
  const wiPct = (x) => Math.round(x * 100) + "%";
  body.querySelector("#vk-wi-up").onclick = (ev) =>
    wiRun(ev.target, async (prog, out, mode) => {
      prog(0.4, "Tính thử…");
      await sleep0();
      const r = kmWhatIfRealm(nv, mode),
        nm = realmLabel(r.nx.cg, r.nx.tc);
      if (r.na) {
        out.innerHTML =
          '<div class="vk-mu" style="margin-top:6px">Tool chưa đọc được trần pháp lực của món ở bản game này nên chưa tính được.</div>';
        return;
      }
      const rows = r.rows.length
        ? r.rows
            .map(
              (x) =>
                `<tr><td>${esc(x.ten)}${x.tier ? ' <span class="vk-ok" style="font-size:11px">phẩm bằng cảnh giới</span>' : ""}</td><td>${wiPct(x.up1)}</td><td class="${x.up2 < 0.999 ? "vk-bad" : "vk-ok"}">${wiPct(x.up2)}${x.up2 < x.up1 - 0.001 ? " (chạm trần)" : ""}</td></tr>`,
            )
            .join("")
        : '<tr><td colspan="3" class="vk-mu">Chưa có món có chiêu nào đang thông.</td></tr>';
      const bag = r.bag.length
        ? `<div style="margin-top:8px;font-size:13px"><b>Đồ trong túi chưa chạm trần ở ${esc(nm)}</b> (chưa xếp): ${r.bag.map((x) => esc(x.it.ten) + (x.tier ? " ★" : "")).join(" · ")}<br><span class="vk-mu" style="font-size:11px">★ phẩm bằng cảnh giới.</span></div>`
        : "";
      out.innerHTML = `<div style="margin-top:8px;font-size:14px">Lên <b>${esc(nm)}</b>: thắng trận mẫu <b>${r.a.wins}/${r.a.n}</b> → <b>${r.b.wins}/${r.b.n}</b> (giữ nguyên cách xếp).</div>
<table class="vk-t"><tr><th>Món có chiêu</th><th>Uy lực giữ được hiện tại</th><th>Sau khi lên</th></tr>${rows}</table>${bag}
<div class="vk-mu" style="font-size:11px;margin-top:6px">Uy lực giữ được = min(1, trần pháp lực của món / pháp lực của bạn), đọc từ code game.</div>`;
    });
  body.querySelector("#vk-wi-rm").onclick = (ev) =>
    wiRun(ev.target, async (prog, out, mode) => {
      if (!nv.kinhMach.manh.length) {
        out.innerHTML =
          '<div class="vk-mu" style="margin-top:6px">Chưa xếp món nào.</div>';
        return;
      }
      const r = await kmWhatIfRemove(nv, mode, prog);
      out.innerHTML = `<div class="vk-mu" style="font-size:13px;margin-top:8px">Điểm đang xếp: <b>${num(r.base.s, 0)}</b>. Gỡ món nào mất nhiều điểm nhất là món nên giữ trên huyệt hoặc gần đan điền.</div>
<table class="vk-t"><tr><th>Món</th><th>Mất khi gỡ</th><th>Thắng</th></tr>${r.out.map((x) => `<tr><td>${esc(x.ten)}${x.thong ? "" : ' <span class="vk-bad" style="font-size:11px">không thông</span>'}</td><td>${x.loss > 1 ? "<b>−" + Math.round(x.loss) + "</b>" : '<span class="vk-mu">≈0</span>'}</td><td>${x.dw ? (x.dw > 0 ? "+" : "") + x.dw : "—"}</td></tr>`).join("")}</table>`;
    });
  body.querySelector("#vk-wi-col").onclick = (ev) =>
    wiRun(ev.target, async (prog, out, mode) => {
      const r = await kmWhatIfRecolor(nv, mode, prog),
        pos = (i) =>
          `cột ${(i % r.g.rong) + 1}, hàng ${Math.floor(i / r.g.rong) + 1}`;
      if (!r.out.length) {
        out.innerHTML =
          '<div class="vk-mu" style="margin-top:8px">Không có ô nào đổi sang hệ linh căn khác mà hợp món đang đặt hơn. Giữ nguyên màu ô.</div>';
        return;
      }
      out.innerHTML = `<div class="vk-mu" style="font-size:13px;margin-top:8px">Còn <b>${r.left}</b> lượt chuyển hệ. Thử ${r.tried}${r.total > r.tried ? "/" + r.total : ""} cách đổi trên cách xếp hiện tại (chưa xếp lại món). Điểm hiện tại: <b>${num(r.base.s, 0)}</b>.</div>
<table class="vk-t"><tr><th>Ô</th><th>Món đang đè</th><th>Đổi</th><th>Lợi</th></tr>${r.out.map((x) => `<tr><td>${pos(x.x)}</td><td>${esc(x.ten)}</td><td>${esc(heTen(x.from))} → <b>${esc(heTen(x.to))}</b></td><td>${x.gain > 1 ? '<span class="vk-ok">+' + Math.round(x.gain) + "</span>" : '<span class="vk-mu">≈0</span>'}${x.dw ? " · thắng " + (x.dw > 0 ? "+" : "") + x.dw : ""}</td></tr>`).join("")}</table>`;
    });
}
function copyText(t) {
  const fallback = () => {
    const ta = document.createElement("textarea");
    ta.value = t;
    ta.style.cssText = "position:fixed;opacity:0";
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try {
      ok = document.execCommand("copy");
    } catch (e) {}
    ta.remove();
    return ok;
  };
  if (navigator.clipboard && navigator.clipboard.writeText)
    return navigator.clipboard.writeText(t).then(
      () => true,
      () => fallback(),
    );
  return Promise.resolve(fallback());
}
function showBest(nv) {
  const { cur, best } = S.best;
  const out = body.querySelector("#vk-out");
  if (!out) return;
  out.innerHTML =
    (best.same
      ? '<div class="vk-ok" style="margin:6px 0">Cách đang xếp đã là cách tốt nhất Tool tìm được.</div>'
      : '<div class="vk-ok" style="margin:6px 0">Xếp lại trong game theo ảnh dưới:</div>' +
        drawGrid(nv, best.manh)) +
    statRows(cur, best) +
    (best.R && best.R.diemNghich
      ? `<div class="vk-mu" style="font-size:12px;margin-top:6px">Cách này còn ${best.R.diemNghich} điểm nghịch (−${Math.min(15, 3 * best.R.diemNghich)}% tỉ lệ đột phá). Lúc chuẩn bị đột phá, chọn chế độ "Ưu tiên tu luyện / đột phá" để Tool ưu tiên xóa điểm nghịch.</div>`
      : "") +
    biasSummary(nv, best) +
    (S.full ? coverNote(nv, best) : "") +
    '<div class="vk-mu" style="font-size:12px;margin-top:6px">Trận mẫu: 9 loại quái cùng cảnh giới với bạn, ở tiểu cảnh giới quanh mức của bạn (thấp hơn 1, bằng, cao hơn 1).</div>' +
    pieceTable(best.R) +
    sellAdvice(nv, best);
  if (!best.same) {
    out.insertAdjacentHTML(
      "afterbegin",
      '<div style="display:flex;gap:8px;flex-wrap:wrap;margin:8px 0"><button class="vk-btn" id="vk-apply">Áp dụng vào game</button><button class="vk-btn sec" id="vk-copy">Sao chép cách xếp</button></div>',
    );
    out.querySelector("#vk-apply").onclick = async (e) => {
      if (kmAutoRunning()) {
        UI.notify("Auto Kinh Mạch đang chạy, hãy dừng trước.");
        return;
      }
      e.target.disabled = true;
      if (await applyManh(best.manh)) await render();
      else e.target.disabled = false;
    };
    out.querySelector("#vk-copy").onclick = async () => {
      const ok = await copyText(
        JSON.stringify({
          vktt: "manh",
          manh: best.manh.map((m) => ({
            item: m.item,
            x: m.x,
            y: m.y,
            xoay: m.xoay,
          })),
        }),
      );
      UI.notify(
        ok
          ? "📋 Đã chép. Dán vào trang sửa save, mục Kinh mạch."
          : "❌ Không chép được.",
      );
    };
  }
}
// Từ bản game mới, mỗi đơn vị bán thêm làm chợ ngập hàng: giá tụt dần, và tiệm ngừng thu khi chợ đã ngập.
// Trả về tổng tiền thật khi bán qty món, giá món đầu, và số món tiệm không thu nổi.
function sellTotal(c, id, it, qty) {
  const K = S.core,
    q = Math.max(0, qty || 0),
    whole = Math.floor(q + 1e-9);
  const unit = (k) => {
    try {
      return K.giaBan
        ? K.giaBan(c, id, undefined, k)
        : Math.round(((it && it.gia) || 0) * 0.6);
    } catch {
      return Math.round(((it && it.gia) || 0) * 0.6);
    }
  };
  const first = unit(0);
  if (!K.glutRoom) return { total: q * first, first, left: 0 };
  let cap = Infinity;
  try {
    cap = K.glutRoom(c, it);
  } catch {}
  const n = Math.min(whole, cap);
  let total = 0;
  for (let k = 0; k < n; k++) total += unit(k);
  if (n === whole && q > whole && n < cap)
    total += (q - whole) * unit(n);
  return { total, first, left: Math.max(0, whole - n) };
}

export {
  isKmItem,
  lnApply,
  lnPrep,
  lnYears,
  lnTag,
  fitNote,
  kmOpenable,
  kmAutoRunning,
  kmAborted,
  kmApplyDiff,
  applyManh,
  kmApplyLoadouts,
  kmSolve,
  rankOpenCandidate,
  kmOpenSearch,
  wiManh,
  wiEval,
  kmWhatIfRealm,
  kmWhatIfRemove,
  kmWhatIfRecolor,
  HE_VI,
  findOptimalRecolors,
  statRows,
  optimizeMode,
  kmManualHtml,
  kmManualBind,
  copyText,
  showBest,
  sellTotal,
};

Object.assign(gWin, {
  isKmItem,
  lnApply,
  lnPrep,
  lnYears,
  lnTag,
  fitNote,
  kmOpenable,
  kmAutoRunning,
  kmAborted,
  kmApplyDiff,
  applyManh,
  kmApplyLoadouts,
  kmSolve,
  rankOpenCandidate,
  kmOpenSearch,
  wiManh,
  wiEval,
  kmWhatIfRealm,
  kmWhatIfRemove,
  kmWhatIfRecolor,
  HE_VI,
  findOptimalRecolors,
  statRows,
  optimizeMode,
  kmManualHtml,
  kmManualBind,
  copyText,
  showBest,
  sellTotal,
});
