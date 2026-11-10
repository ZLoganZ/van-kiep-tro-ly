import { gWin, TOOL_VER, TT, MOD } from "../core/utils.js";
/**
 * Module: Động Cơ Tối Ưu Hóa Kinh Mạch 4.0 & Kết Xuất Sơ Đồ Lưới
 */
// ───────────────────────── 4. Tối ưu kinh mạch ─────────────────────────
// ───────────────────────── Hướng xếp: Tiên Tu (tương sinh) / Ma Tu (tương khắc) + ưu tiên linh căn & huyệt ─────────────────────────
// Điểm cộng thêm ngoài điểm do chính code game tính (K.tinhKinhMach/K.taoBenTa). Trọng số là ước lượng của tool, không phải số liệu game.
const SINH_HE = {
  kim: "thuy",
  thuy: "moc",
  moc: "hoa",
  hoa: "tho",
  tho: "kim",
};
const KHAC_HE = {
  kim: "moc",
  moc: "tho",
  tho: "thuy",
  thuy: "hoa",
  hoa: "kim",
};
const GOC_HE = { loi: "moc", phong: "moc", bang: "thuy", am: "thuy" };
const gocHe = (h) => GOC_HE[h] || h;
const heTacDong = (a, b) => {
  const x = gocHe(a),
    y = gocHe(b);
  return SINH_HE[x] === y ? 1 : KHAC_HE[x] === y ? -1 : 0;
};
// 7.13.6: Chuẩn hóa bậc phẩm tương sinh (generationRank) & độ suy giảm tương sinh zD [1, 2/3, 1/3, 0] theo code lõi game
const genRank = (it) => {
  if (!it) return 1;
  if (it.tag && it.tag.includes("nghich")) return 5;
  if (it.tran_phai) return 5;
  return it.pham_cap || 1;
};
const genSlack = (recIt, genIt) => {
  if (!recIt || !genIt) return 0;
  if (genIt.tag && genIt.tag.includes("nghich")) return 1.0;
  const k = Math.max(0, genRank(recIt) - genRank(genIt));
  return k === 0 ? 1.0 : k === 1 ? 2 / 3 : k === 2 ? 1 / 3 : 0;
};
/* ═════ BẢN 6.14: Ô KINH MẠCH HỢP HỆ (sinh · được sinh · cùng gốc) ═════
     Ô hệ X dùng được: X và hệ cùng gốc (Băng ~ Thủy; Lôi, Phong ~ Mộc), hệ sinh ra X, hệ mà X sinh ra (cùng với các hệ cùng gốc của chúng).
     Ví dụ ô Thủy: Thủy, Băng (cùng gốc) · Kim (Kim sinh Thủy) · Mộc, Lôi, Phong (Thủy sinh Mộc). */
const HOP_W = { dung: 1, goc: 0.5, sinh: 0 }; // 6.19: đúng hàm l0n của game: đúng hệ 1, cùng gốc 0,5, còn lại 0 (tương sinh với ô KHÔNG được tính)
const sinhRa = (h) => SINH_HE[gocHe(h)];
const sinhBoi = (h) =>
  Object.keys(SINH_HE).find((k) => SINH_HE[k] === gocHe(h));
const khacBoi = (h) =>
  Object.keys(KHAC_HE).find((k) => KHAC_HE[k] === gocHe(h));
const hoHe = (g) =>
  [
    "kim",
    "moc",
    "thuy",
    "hoa",
    "tho",
    "bang",
    "loi",
    "phong",
    "am",
  ].filter((h) => gocHe(h) === g);
function oHop(cell, he) {
  if (!cell || !he || cell === "vo_sac" || he === "vo_sac") return 0;
  if (cell === he) return HOP_W.dung;
  const c = gocHe(cell),
    h = gocHe(he);
  if (c === h) return HOP_W.goc;
  return SINH_HE[c] === h || SINH_HE[h] === c ? HOP_W.sinh : 0;
}
// Ô khắc hệ món (đúng hàm ja của game): món nằm quá nửa trên ô khắc nó thì +1 điểm nghịch.
const oKhac = (cell, he) =>
  !!cell &&
  !!he &&
  cell !== "vo_sac" &&
  he !== "vo_sac" &&
  KHAC_HE[gocHe(cell)] === gocHe(he);
function oDungDuoc(cell) {
  const c = gocHe(cell);
  return hoHe(c); // 6.19: chỉ đúng hệ và cùng gốc; game không tính tương sinh giữa món và ô
}
S.dir = S.dir || "";
if (S.prio === undefined) S.prio = true;
S.full = false;
/* đã bỏ Xếp Full Ô */ if (S.biasK === undefined) S.biasK = 5;
// Tập huyệt đúng code game mới (hV / sV): vị trí huyệt thật = km.huyetGoc (game xê dịch huyệt của khuôn sang ô kề cùng vòng khi tạo kiếp;
// kiếp cũ chưa có huyetGoc thì dùng huyệt của khuôn) cộng huyệt phụ km.huyetThem. Bản game cũ chỉ tính huyệt phụ khi khuôn có huyệt tự nhiên và
// không có huyetGoc; luật đó đã bỏ, nên Hoang Cổ Thánh Thể (khuôn không huyệt) nay vẫn nhận huyệt phụ.
function hySet(g, km) {
  if (S.core && S.core.acupointsOf && g && km) {
    try {
      const res = S.core.acupointsOf(g, km);
      if (res instanceof Set) return res;
      if (Array.isArray(res)) return new Set(res);
    } catch (e) {}
  }
  const base = Array.isArray(km && km.huyetGoc)
    ? km.huyetGoc
    : ((g && g.huyet) || []).flatMap((v, i) => (v ? [i] : []));
  return new Set([...base, ...((km && km.huyetThem) || [])]);
}
function biasCtx(nv0, g) {
  const dir = S.dir || "",
    prio = !!S.prio,
    bk = S.kmBuild || "";
  if (!dir && !prio && !bk) return null;
  const km = nv0.kinhMach;
  const hy = hySet(g, km); // đúng code game mới (hV / sV), xem hySet
  return {
    dir,
    prio,
    rong: g.rong,
    mau: km.mau || [],
    hy,
    lc: new Set((nv0.linhCan && nv0.linhCan.he) || []),
    lcRoot: new Set(((nv0.linhCan && nv0.linhCan.he) || []).map(gocHe)),
    items: C().items,
    build: bk ? BUILDS.find((x) => x.k === bk) || null : null,
  };
}
function biasInfo(B, manh, R) {
  const f = {
    sinh: 0,
    sinhVal: 0,
    bSinh: 0,
    khac: 0,
    hop: 0,
    lech: 0,
    trungTinh: 0,
    lc: 0,
    lcGoc: 0,
    lcKhac: 0,
    huyet: 0,
    build: 0,
    bhuyet: 0,
    bCore: 0,
  };
  const own = new Map();
  manh.forEach((p, i) => p.cells.forEach((x) => own.set(x, i)));
  const hes = manh.map((p) => {
    const it = B.items.get(p.m.item);
    return ((it && it.he) || []).filter((h) => h && h !== "vo_sac");
  });
  const thong = (i) => !R || !R.manh || !R.manh[i] || R.manh[i].thong;
  manh.forEach((p, i) => {
    if (!thong(i)) return;
    const it_i = B.items.get(p.m.item);
    const isSkill_i = !!(it_i && it_i.chieu);
    const isBuild_i = !!(B.build && it_i && buildMatch(B.build, it_i));
    const onHuyet_i = p.cells.some((c) => B.hy.has(c));
    const pwr_i = kmItemPower(it_i);

    // Hệ số giá trị thực chiến của tương sinh dồn vào mảnh này
    let synWeight = 1.0;
    if (isSkill_i) synWeight += Math.min(4.5, pwr_i / 30);
    if (isBuild_i) synWeight *= 2.2;
    if (onHuyet_i) synWeight *= 1.6;

    const nb = new Set();
    for (const c of p.cells) {
      const x = c % B.rong;
      for (const n of [
        x > 0 ? c - 1 : -1,
        x < B.rong - 1 ? c + 1 : -1,
        c - B.rong,
        c + B.rong,
      ]) {
        const j = own.get(n);
        if (n >= 0 && j !== undefined && j !== i) nb.add(j);
      }
    }
    // Ưu tiên số liệu chính game tính (theo từng ô chạm nhau, có xét chênh phẩm zD); thiếu thì dùng cách ước lượng theo hệ cả món.
    const gm = R && R.manh && R.manh[i];
    if (gm && typeof gm.generators === "number") {
      const ct =
        typeof gm.sinhKhac === "number"
          ? Math.max(
              0,
              (gm.sinhKhac - 1 + 0.15 * (gm.restrainers || 0)) / 0.15,
            )
          : Math.max(0, gm.generators - (gm.weakGenerators || 0));
      f.sinh += ct;
      f.sinhVal += ct * synWeight;
      if (isBuild_i && ct > 0) f.bSinh += ct;
      f.khac += gm.restrainers || 0;
      if (gm.noiTai && gm.noiTai > 1) {
        f.sinh += 0.67;
        f.sinhVal += 0.67 * synWeight;
      }
    } else {
      let itemSinh = 0,
        itemKhac = 0;
      for (const j of nb) {
        if (!thong(j)) continue;
        const it_j = B.items.get(manh[j].m.item);
        let sinh = 0,
          khac = 0;
        for (const a of hes[j])
          for (const b of hes[i]) {
            const d = heTacDong(a, b);
            if (d > 0) {
              const mult = genSlack(it_i, it_j);
              if (mult > sinh) sinh = mult;
            } else if (d < 0) khac = 1;
          }
        itemSinh += sinh;
        itemKhac += khac;
      }
      f.sinh += itemSinh;
      f.sinhVal += itemSinh * synWeight;
      if (isBuild_i && itemSinh > 0) f.bSinh += itemSinh;
      f.khac += itemKhac;
      if (hes[i].length > 1) {
        for (const a of hes[i])
          for (const b of hes[i])
            if (heTacDong(a, b) > 0) {
              f.sinh += 0.67;
              f.sinhVal += 0.67 * synWeight;
              break;
            }
      }
    }
    for (const c of p.cells) {
      const m = B.mau[c];
      if (m && m !== "vo_sac" && hes[i].length) {
        const w = Math.max(...hes[i].map((h) => oHop(m, h)));
        f.hop += w;
        if (!w) {
          if (hes[i].some((h) => oKhac(m, h))) f.lech++;
          else f.trungTinh++;
        }
      }
    }
    {
      let k = 0;
      for (const c of p.cells) if (B.hy.has(c)) k++;
      if (k) f.huyet += 1 + 0.125 * (k - 1);
    }
    // 6.19: ba tầng theo linh căn: trùng hệ linh căn > dị linh căn cùng gốc > hệ không bị linh căn khắc (trung tính); hệ bị linh căn khắc bị trừ nhẹ.
    if (hes[i].some((h) => B.lc.has(h))) f.lc++;
    else if (hes[i].some((h) => B.lcRoot.has(gocHe(h)))) f.lcGoc++;
    else if (
      hes[i].length &&
      hes[i].every((h) => [...B.lc].some((l) => oKhac(l, h)))
    )
      f.lcKhac++;
    // Hướng build: chỉ tính món ĐANG THÔNG và đúng lưu phái / hệ của hướng; món đó nằm trên huyệt được cộng thêm.
    if (B.build) {
      const itB = B.items.get(p.m.item);
      if (itB && buildMatch(B.build, itB)) {
        f.build++;
        for (const c of p.cells) if (B.hy.has(c)) f.bhuyet++;
        const isCore =
          itB.tran_phai ||
          (itB.pham_cap || 1) >= 4 ||
          (itB.tag || []).includes(B.build.k);
        if (isCore) f.bCore++;
      }
    }
  });
  return f;
}
function biasScore(B, manh, R) {
  if (!B) return 0;
  try {
    const f = biasInfo(B, manh, R);
    let s = 0;
    const synEff = f.sinhVal || f.sinh;
    if (B.dir === "tien" || !B.dir) {
      s += 10 * synEff - 12 * f.khac + 8 * (f.bSinh || 0);
    } else if (B.dir === "ma") {
      s += 10 * f.khac - 4 * synEff;
    }
    if (B.prio)
      s +=
        2 * f.hop -
        1.5 * f.lech +
        4 * f.lc +
        2.4 * f.lcGoc -
        1.5 * f.lcKhac +
        5 * f.huyet;
    if (B.build) s += 14 * f.build + 5 * f.bhuyet + 20 * (f.bCore || 0);
    return s * (S.biasK || 1);
  } catch (e) {
    return 0;
  }
}
const DIR_TEN = {
  "": "Theo Hệ Số Game",
  tien: "Tiên Tu · Tương Sinh",
  ma: "Ma Tu · Tương Khắc",
};
function biasSummary(nv, best) {
  if (!S.dir && !S.prio && !S.kmBuild) return "";
  try {
    const K = S.core,
      c = C(),
      nv2 = clone(nv);
    nv2.kinhMach.manh = best.manh;
    const g = K.luoiKinhMach(c, nv2),
      B = biasCtx(nv2, g);
    const manh = best.manh.map((m) => ({
      m,
      cells: K.oCuaManh(g, m, c.items.get(m.item)) || [],
    }));
    const f = biasInfo(B, manh, best.R);
    return `<div class="vk-mu" style="font-size:12px;margin-top:6px">Hướng xếp: <b>${DIR_TEN[S.dir || ""]}</b>${S.prio ? " · ưu tiên linh căn &amp; huyệt" : ""}${B.build ? " · Hướng Build: <b>" + esc(B.build.ten) + "</b> (" + f.build + " món đúng hướng đang thông, " + f.bhuyet + " ô trên huyệt" + (f.bCore ? ', <b class="vk-ok">' + f.bCore + " món cốt lõi</b>" : "") + ")" : ""}. Đường nối tương sinh: ${f.sinh} · tương khắc: ${f.khac} · ô hợp màu: ${num(f.hop, 1)} · ô đặt lên huyệt: ${f.huyet} · món cùng hệ linh căn: ${f.lc}.</div>`;
  } catch (e) {
    return "";
  }
}

// ═════ BẢN 6.19: TRẦN PHÁP LỰC · PHẨM BẰNG CẢNH GIỚI ═════
/* Luật game (đọc từ code): uy lực chiêu của món nhân thêm min(1, trần pháp lực của món / pháp lực của người chơi).
     Trần của món = pháp lực ở đầu cảnh giới kế tiếp của phẩm đó; Nghịch Thiên không có trần. Món chưa chạm trần giữ nguyên uy lực;
     "phẩm bằng cảnh giới" là món có trần đúng bằng pháp lực đầu cảnh giới kế của người chơi (vừa sức, dùng được lâu nhất trước khi chạm trần). */
const CAP_W = 14; // trừ cho mỗi chiêu bị kẹp hẳn (1 trận mẫu thắng thêm ≈ 11 điểm); kẹp một phần trừ theo tỉ lệ
const TIER_W = 2.5; // cộng cho mỗi món đang thông mà phẩm bằng cảnh giới
function capCtxOf(nv) {
  const K = S.core;
  if (!K || !K.skillCap || !K.spellPower) return null;
  try {
    const base = K.spellPower(nv.canhGioi, nv.tieuCanhGioi || 0),
      next = K.spellPower(nv.canhGioi + 1, 0);
    return base > 0 ? { K, base, next } : null;
  } catch (e) {
    return null;
  }
}
function capUp(X, it) {
  try {
    const hb = X.K.skillCap(it);
    return !(hb > 0) || hb === Infinity ? 1 : Math.min(1, hb / X.base);
  } catch (e) {
    return 1;
  }
}
function capTierMatch(X, it) {
  try {
    const hb = X.K.skillCap(it);
    return (
      Number.isFinite(hb) &&
      Number.isFinite(X.next) &&
      Math.abs(hb - X.next) < 1e-6 * Math.max(1, X.next)
    );
  } catch (e) {
    return false;
  }
}
function capScore(X, R) {
  if (!X || !R || !R.manh) return 0;
  let s = 0;
  for (const m of R.manh) {
    if (!m || !m.thong || !m.item) continue;
    if (m.item.chieu) s -= CAP_W * (1 - capUp(X, m.item));
    if (capTierMatch(X, m.item)) s += TIER_W;
  }
  return s;
}

// ── ĐỘNG CƠ KINH MẠCH 4.0 (MULTI-TOPOLOGY · LNS RUIN & RECREATE · EXACT CORE MECHANICS) ──
// Kiểm tra tương thích Kinh Lộ chuẩn hàm dGt / hopKinhLo của mã nguồn game:
// Hai mảnh hợp kinh lộ khi trùng hệ gốc HOẶC hệ mảnh trước tương sinh ra hệ mảnh sau.
function hopHeGame(a, b) {
  if (!a || !b) return false;
  if (S.core && typeof S.core.hopHe === "function") {
    try {
      return !!S.core.hopHe(a, b);
    } catch (e) {}
  }
  if (a === "vo_sac" || b === "vo_sac") return a === b;
  const ga = gocHe(a),
    gb = gocHe(b);
  return ga === gb || SINH_HE[ga] === gb;
}
function hopKinhLoHe(heArrA, heArrB) {
  if (!heArrA || !heArrB || !heArrA.length || !heArrB.length)
    return false;
  if (S.core && typeof S.core.hopKinhLo === "function") {
    try {
      return !!S.core.hopKinhLo(heArrA, heArrB);
    } catch (e) {}
  }
  return heArrA.some((a) => heArrB.some((b) => hopHeGame(a, b)));
}
function doHopCellGame(cellHe, pieceHe) {
  const c = cellHe || "vo_sac",
    p = pieceHe || "vo_sac";
  if (S.core && typeof S.core.doHop === "function") {
    try {
      const v = S.core.doHop(c, p);
      if (Number.isFinite(v)) return v;
    } catch (e) {}
  }
  if (c === "vo_sac") return p === "vo_sac" ? 1.0 : 0.5;
  if (p === "vo_sac") return 0.5;
  if (c === p) return 1.0;
  return gocHe(c) === gocHe(p) ? 0.5 : 0.0;
}

// Đánh giá tổng giá trị mảnh khi ĐƯỢC THÔNG trên bàn kinh mạch
function kmItemPower(it, mode = "bal") {
  if (!it) return 0;
  let p = 0;
  const ph = it.pham_cap || 1;
  const phTable = [0, 8, 22, 48, 95, 165, 260, 380, 520];
  p += phTable[Math.min(ph, phTable.length - 1)] || ph * 18;
  if (it.tag && it.tag.includes("nghich")) p += 170;
  if (it.tran_phai) p += 95;
  if (it.loai === "cong_phap") p += 24;

  const hs = ((it && it.he) || []).filter((h) => h && h !== "vo_sac");
  if (hs.length > 1) {
    let noiSinh = false;
    if (S.core && typeof S.core.coTuongSinhNoiTai === "function") {
      try {
        noiSinh = !!S.core.coTuongSinhNoiTai(hs);
      } catch (e) {}
    } else {
      noiSinh = hs.some((a) => hs.some((b) => heTacDong(a, b) > 0));
    }
    if (noiSinh) p += 35;
  }

  if (it.chieu) {
    const ch = it.chieu;
    let dmgW = 85;
    if (mode === "tu") dmgW = 24;
    else if (mode === "dot_pha") dmgW = 38;
    else if (mode === "tank") dmgW = 65;
    else if (mode === "burst") dmgW = 195;
    else if (mode === "danh") dmgW = 145;

    let ctrlW = 50;
    if (mode === "tank") ctrlW = 85;
    else if (mode === "danh") ctrlW = 72;

    p += (ch.uy || 1) * (ch.dang === "cong" ? dmgW : ctrlW);
    p += (ch.effects || []).length * 18;
    if (ch.controlTurns)
      p += ch.controlTurns * (mode === "tank" ? 55 : 38);
    if (ch.shieldTurns)
      p +=
        ch.shieldTurns *
        (mode === "tank" || mode === "dot_pha" ? 65 : 35);
    if (ch.scope === "spread" || ch.scope === "all") p += 38;
    const phiCost = ch.phi || 0;
    p -= phiCost * (mode === "tu" ? 4.5 : 2.2);
    if (ch.hoi > 0) p += 10;
  }

  const bd = it.bi_dong || {};
  let tocW = 140,
    dpW = 100,
    hpW = 115,
    hoTheW = 150,
    ktmW = 65,
    qiW = 62;
  if (mode === "tu") {
    tocW = 520;
    dpW = 90;
    qiW = 95;
    hpW = 45;
    hoTheW = 45;
    ktmW = 45;
  } else if (mode === "dot_pha") {
    dpW = 620;
    ktmW = 250;
    hpW = 150;
    hoTheW = 175;
    tocW = 85;
    qiW = 50;
  } else if (mode === "tank") {
    hpW = 300;
    hoTheW = 350;
    tocW = 45;
    dpW = 35;
    qiW = 58;
  } else if (mode === "burst") {
    tocW = 65;
    dpW = 25;
    qiW = 55;
    hpW = 85;
    hoTheW = 95;
  } else if (mode === "danh") {
    tocW = 50;
    dpW = 40;
    qiW = 65;
  }

  p += (bd.toc_do || 0) * tocW;
  p += (bd.dot_pha || 0) * dpW;
  p += (bd.khi_huyet || 0) * hpW;
  p += Math.min(0.35, bd.ho_the || 0) * hoTheW;
  p += (bd.phap_luc || 0) * (mode === "burst" ? 190 : 120);
  if (bd.khang_tam_ma) p += bd.khang_tam_ma * ktmW;
  if (it.linh_luc) p += it.linh_luc * qiW;

  const cs = bd.chi_so || {};
  for (const [k, val] of Object.entries(cs)) {
    if (!val) continue;
    let cw = 10;
    if (
      mode === "tu" &&
      (k === "ngo_tinh" || k === "can_cot" || k === "khi_van")
    )
      cw = 28;
    else if (
      mode === "dot_pha" &&
      (k === "dao_tam" ||
        k === "can_cot" ||
        k === "than_thuc" ||
        k === "khi_van")
    )
      cw = 32;
    else if (mode === "tank" && (k === "can_cot" || k === "dao_tam"))
      cw = 24;
    else if (
      (mode === "danh" || mode === "burst") &&
      (k === "than_phap" || k === "than_thuc" || k === "can_cot")
    )
      cw = 20;
    p += val * cw;
  }
  return p;
}

// Đánh giá RIÊNG phần sức mạnh ĐƯỢC NHÂN HỆ SỐ (heSo = mau * huyet * sinhKhac * noiTai * kinhLo * fit)
// Theo đúng code lõi game (character/kinh_mach):
// - NHÂN heSo: linh_luc, chieu (uy lực, khiên, khống chế), bi_dong.khi_huyet, bi_dong.ho_the, bi_dong.phap_luc, bi_dong.chi_so.
// - KHÔNG NHÂN heSo (chỉ cần thông): bi_dong.toc_do, bi_dong.dot_pha, bi_dong.khang_tam_ma, bi_dong.an_tuc.
function kmScalablePower(it, mode = "bal", build = null) {
  if (!it) return 0;
  let sp = 0;
  const bd = it.bi_dong || {};
  const cs = bd.chi_so || {};

  // 1. Linh lực (luôn nhân heSo và quyết định cả vòng chiêu lẫn tốc độ vận hành)
  if (it.linh_luc > 0) {
    const llW =
      mode === "tu"
        ? 75
        : mode === "dot_pha"
          ? 55
          : mode === "burst" || mode === "danh"
            ? 62
            : 58;
    sp += it.linh_luc * llW;
  }

  // 2. Chiêu thức chủ động (uy lực nhân trực tiếp với heSo)
  if (it.chieu && ((it.chieu.uy || 0) > 0 || (it.chieu.phi || 0) > 0)) {
    const ch = it.chieu;
    let uyW = 140;
    if (mode === "burst") uyW = 260;
    else if (mode === "danh") uyW = 210;
    else if (mode === "tank") uyW = 115;
    else if (mode === "tu") uyW = 65;
    else if (mode === "dot_pha") uyW = 80;

    const isAtk = ch.dang === "cong";
    sp += (ch.uy || 0.8) * (isAtk ? uyW : uyW * 0.72);
    if (ch.shieldTurns)
      sp +=
        ch.shieldTurns *
        (mode === "tank" || mode === "dot_pha" ? 70 : 35);
    if (ch.controlTurns)
      sp +=
        ch.controlTurns *
        (mode === "tank" || mode === "danh" ? 55 : 30);
    sp += (ch.effects || []).length * 22;
  }

  // 3. Chỉ số bị động nhân heSo (khi_huyet, ho_the, phap_luc)
  if (bd.khi_huyet) {
    const hpW = mode === "tank" ? 340 : mode === "dot_pha" ? 190 : 140;
    sp += bd.khi_huyet * hpW;
  }
  if (bd.ho_the) {
    const htW = mode === "tank" ? 680 : mode === "dot_pha" ? 420 : 260;
    sp += Math.min(0.4, bd.ho_the) * htW;
  }
  if (bd.phap_luc) {
    const plW = mode === "burst" ? 380 : mode === "danh" ? 310 : 220;
    sp += bd.phap_luc * plW;
  }

  // 4. Lục duy chi_so (nhân heSo, cực kỳ quan trọng cho cả Tu Luyện, Đột Phá và Chiến Đấu)
  for (const [k, val] of Object.entries(cs)) {
    if (!val) continue;
    let cw = 18;
    if (mode === "tu") {
      if (k === "ngo_tinh") cw = 55;
      else if (k === "can_cot" || k === "khi_van") cw = 32;
    } else if (mode === "dot_pha") {
      if (k === "dao_tam" || k === "can_cot") cw = 52;
      else if (k === "than_thuc" || k === "khi_van") cw = 38;
    } else if (mode === "tank") {
      if (k === "can_cot" || k === "dao_tam") cw = 36;
    } else {
      if (k === "than_phap" || k === "than_thuc" || k === "can_cot")
        cw = 28;
    }
    sp += val * cw;
  }

  // Nếu mảnh hoàn toàn KHÔNG có thuộc tính nào nhân heSo (chỉ thuần toc_do / dot_pha / khang_tam_ma),
  // trả về giá trị rất nhỏ để nhường Huyệt Đạo và ô màu đẹp cho mảnh có nhân hệ số!
  if (sp <= 1e-3) return 2;

  // Thưởng bậc phẩm và hướng build CHỈ KHI mảnh thực sự có thuộc tính nhân heSo
  const ph = it.pham_cap || 1;
  sp *= 0.85 + 0.18 * ph;
  if (it.tag && it.tag.includes("nghich")) sp += 120;
  if (it.tran_phai) sp += 90;
  if (build && buildMatch(build, it)) {
    sp *= 1.35;
    if (it.tag && it.tag.includes(build.k)) sp += 75;
  }
  return sp;
}

// 1. Acupoint Priority 4.0: Chỉ ưu tiên đặt lên Huyệt Đạo (×2.0 + 0.25*(k-1)) những mảnh thực sự NHÂN HỆ SỐ!
function acupointPriority(it, mode, build) {
  if (!it) return 0;
  const sp = kmScalablePower(it, mode, build);
  if (sp <= 10) {
    // Mảnh thuần tốc độ tu luyện / đột phá / kháng tâm ma không nhân hệ số:
    // chỉ giữ độ ưu tiên tối thiểu để không bao giờ tranh Huyệt với mảnh nhân hệ số!
    return 8 + (it.pham_cap || 1) * 1.5;
  }
  const cellCnt = Math.max(1, hbCells(it) || 3);
  const densityMult = 1 / Math.pow(cellCnt, 0.22);
  return sp * densityMult;
}

// 2. 15-Turn Qi Cycle Simulator (Multi-Skill Per Turn):
// Trong Vạn Kiếp Tu Tiên, mỗi hiệp người chơi tung TẤT CẢ các chiêu đã hồi xong (chứ không phải chỉ 1 chiêu/hiệp!).
function simulateQiCycle(P, sortedSkills, turns = 15) {
  const maxQi = P.linhLucToiDa || 0;
  const regen = P.linhLucMoiLuot || 0;
  let qi = maxQi;
  const skills = (sortedSkills || []).filter(
    (x) =>
      x && ((x.phi || 0) > 0 || (x.uy || 0) > 0 || (x.uyLuc || 0) > 0),
  );
  const numSkills = skills.length;
  const cd = new Int32Array(numSkills);
  let qiStallTurns = 0;
  let qiDeficit = 0;
  let cycleTotalDmg = 0;
  let skillsCast = 0;

  // Mức tiêu hao Linh Lực trung bình mỗi hiệp (khớp chính xác 100% với llBalanceStr trong bảng so sánh statRows)
  let drainPerTurn = 0;
  for (let i = 0; i < numSkills; i++) {
    const phi = skills[i].phi || 0;
    if (phi > 0) {
      drainPerTurn += phi / Math.max(1, (skills[i].hoi || 0) + 1);
    }
  }

  for (let t = 1; t <= turns; t++) {
    if (t > 1) {
      qi = Math.min(maxQi, qi + regen);
      for (let i = 0; i < numSkills; i++) {
        if (cd[i] > 0) cd[i]--;
      }
    }

    let stalledThisTurn = false;
    for (let i = 0; i < numSkills; i++) {
      if (cd[i] === 0) {
        const sk = skills[i];
        const cost = sk.phi || 0;
        if (cost > 0 && qi < cost) {
          stalledThisTurn = true;
          qiDeficit += cost - qi;
        } else {
          if (cost > 0) qi -= cost;
          cd[i] = Math.max(1, (sk.hoi || 0) + 1);
          const dmg = sk.uyLuc || (sk.uy || 0) * (P.phapLuc || 1);
          cycleTotalDmg += dmg;
          skillsCast++;
        }
      }
    }
    if (stalledThisTurn) qiStallTurns++;
  }

  return {
    qiStallTurns,
    qiDeficit,
    drainPerTurn,
    cycleTotalDmg,
    skillsCast,
    turns,
    finalQi: qi,
  };
}

// 3. Chấm điểm chân khí chuẩn xác 4.1: Triệt tiêu hoàn toàn "🔴 Thiếu Hụt Chân Khí" & Tuân thủ nghiêm Giới Hạn Chiêu Chủ Động
function calcQiScore(P, sortedSkills, mode, turns = 15) {
  const sim = simulateQiCycle(P, sortedSkills, turns);
  const costSkills = (sortedSkills || []).filter(
    (x) => (x.phi || 0) > 0,
  );
  const maxPhi = costSkills.length
    ? Math.max(...costSkills.map((x) => x.phi || 0))
    : 0;
  const regen = P.linhLucMoiLuot || 0;
  const maxQi = P.linhLucToiDa || 0;
  const drain = sim.drainPerTurn || 0;

  let llPenalty = 0;
  const isCombat =
    mode === "danh" || mode === "burst" || mode === "bal";

  // Phạt cực nặng khi tổng tiêu hao/lượt vượt quá hồi phục/lượt (nguyên nhân trực tiếp gây "🔴 Thiếu Hụt Chân Khí" trên bảng!)
  if (drain > regen) {
    const drainDef = drain - regen;
    llPenalty += 520 + drainDef * 42 + Math.pow(drainDef, 1.55) * 20;
  } else if (drain > 0 && regen < drain * 1.15) {
    // Chưa đạt ngưỡng dư dả 1.15x ("🟢 Tự Cấp Tự Túc")
    llPenalty += (drain * 1.15 - regen) * 24;
  }

  // Phạt khi xảy ra kẹt chiêu trong mô phỏng đa chiêu/hiệp
  if (sim.qiStallTurns > 0 || sim.qiDeficit > 0) {
    const stallMult = isCombat ? 150 : 110;
    const defMult = isCombat ? 16 : 11;
    llPenalty +=
      sim.qiStallTurns * stallMult +
      Math.pow(sim.qiStallTurns, 1.75) * 70 +
      sim.qiDeficit * defMult;
  }

  // Phạt khi Linh Lực hồi/lượt thấp hơn chi phí của chiêu đắt nhất
  if (maxPhi > 0) {
    if (regen < maxPhi * 0.95) {
      llPenalty += (maxPhi * 0.95 - regen) * (isCombat ? 32.0 : 20.0);
    }
    if (maxQi < maxPhi * 1.5) {
      llPenalty += (maxPhi * 1.5 - maxQi) * 10.0;
    }
  }

  // Tuân thủ nghiêm ngặt Giới Hạn Chiêu Thức Chủ Động (ví dụ: 2–3 Chiêu Tinh Hoa)
  const skillCap =
    S.hbMaxSkills !== undefined && S.hbMaxSkills > 0
      ? S.hbMaxSkills
      : mode === "tu"
        ? 2
        : S.hbRatio && S.hbRatio.t >= 0.6
          ? 3
          : 4;

  if (skillCap > 0 && costSkills.length > skillCap) {
    const ex = costSkills.length - skillCap;
    llPenalty += ex * 380 + Math.pow(ex, 2) * 240;
  } else if (costSkills.length > 4) {
    const ex = costSkills.length - 4;
    llPenalty += ex * 280 + Math.pow(ex, 2) * 180;
  }

  // Thưởng lớn khi đạt chuẩn "🟢 Tự Cấp Tự Túc" (regen >= drain * 1.15, regen >= maxPhi * 0.95, số chiêu <= skillCap)
  let llBonus = 0;
  if (
    costSkills.length >= 1 &&
    costSkills.length <= Math.max(3, skillCap)
  ) {
    if (
      regen >= drain * 1.15 &&
      regen >= maxPhi * 0.95 &&
      sim.qiStallTurns === 0
    ) {
      llBonus += 360;
    } else if (regen >= drain && sim.qiStallTurns === 0) {
      llBonus += 180;
    }
  }

  const baseLl =
    (mode === "tu" ? 13.5 : isCombat ? 11.5 : 9.0) * regen +
    (mode === "tu" ? 2.6 : 2.1) * Math.min(400, maxQi);

  return {
    score: baseLl - llPenalty + llBonus,
    llPenalty,
    llBonus,
    sim,
  };
}

// Hàm tính điểm đồng bộ giữa Tầng 1 (Fast Proxy) và Tầng 2 (Full Combat Simulation)
function computeMeridianCommonScore(
  nv0,
  nvWork,
  g0,
  hy0,
  B,
  capX,
  maxHoThe,
  ngW,
  mode,
  manh,
  R,
  P,
  c,
) {
  const isTayO = !!(AU.cfg && AU.cfg.km && AU.cfg.km.tayO);
  const thong = R.manh.filter((m) => m && m.thong).length;
  const dead = R.manh.filter((m) => m && !m.thong).length;
  const toc = R.biDong.toc_do || 0,
    dp = R.biDong.dot_pha || 0;
  const ng = (R.diemNghich || 0) * ngW;

  // Đánh giá chiêu thức thực tế (Rotation): Chỉ cộng điểm sát thương cho tối đa skillCap chiêu mạnh nhất!
  const chieuList = (P.chieu || []).filter(
    (x) =>
      x && ((x.phi || 0) > 0 || (x.uy || 0) > 0 || (x.uyLuc || 0) > 0),
  );
  const sortedSkills = chieuList.slice().sort((a, b) => {
    const uyA = a.uyLuc || (a.uy || 0) * (P.phapLuc || 1);
    const uyB = b.uyLuc || (b.uy || 0) * (P.phapLuc || 1);
    return uyB - uyA;
  });

  const skillCap =
    S.hbMaxSkills !== undefined && S.hbMaxSkills > 0
      ? S.hbMaxSkills
      : mode === "tu"
        ? 2
        : S.hbRatio && S.hbRatio.t >= 0.6
          ? 3
          : 4;

  const baseRotWeights = [1.0, 0.68, 0.35, 0.12];
  let effectiveRotDmg = 0;
  const maxCountedSkills = Math.min(
    sortedSkills.length,
    skillCap > 0 ? skillCap : 4,
  );
  for (let i = 0; i < maxCountedSkills; i++) {
    const w = i < baseRotWeights.length ? baseRotWeights[i] : 0.0;
    const skillDmg =
      sortedSkills[i].uyLuc ||
      (sortedSkills[i].uy || 0) * (P.phapLuc || 1);
    effectiveRotDmg += skillDmg * w;
  }
  const uyMax = sortedSkills.length
    ? sortedSkills[0].uyLuc ||
      (sortedSkills[0].uy || 0) * (P.phapLuc || 1)
    : 0;

  const qiRes = calcQiScore(P, sortedSkills, mode, 15);
  const llScore = qiRes.score;

  // Sát thương chuẩn hóa theo Pháp Lực cơ sở của cảnh giới (Tuyệt đối không cộng uyMax thô chưa chuẩn hóa!)
  const baseSp = Math.max(20, (capX && capX.base) || P.phapLuc || 50);
  const relRot = effectiveRotDmg / baseSp;
  const relMax = uyMax / baseSp;
  const relCycle = (qiRes.sim.cycleTotalDmg || 0) / (baseSp * 8);
  const dmgScore =
    Math.log10(Math.max(10, effectiveRotDmg)) * 36 +
    Math.log10(Math.max(10, uyMax)) * 24 +
    Math.min(260, relRot * 22 + relMax * 18 + relCycle * 25);

  // Huyệt đạo & Khuếch đại hệ số thực tế (heSo Amplification)
  let hyScore = 0;
  let heSoAmpScore = 0;
  let connectedCells = 0;
  const usedCells = new Set();
  const bBuild = B ? B.build : null;

  // Xác định danh sách ID của top skillCap chiêu mạnh nhất để không thưởng heSoAmp cho chiêu thừa
  const topSkillNames = new Set(
    sortedSkills.slice(0, maxCountedSkills).map((s) => s.ten || s.id),
  );

  manh.forEach((p, idx) => {
    p.cells.forEach((x) => usedCells.add(x));
    const rm = R.manh && R.manh[idx];
    const isThong = !!(rm && rm.thong);
    const it = c.items.get(p.m.item);
    if (isThong && it) {
      connectedCells += p.cells.length;
      const isExtraSkill =
        it.chieu &&
        (it.chieu.phi || 0) > 0 &&
        !topSkillNames.has(it.chieu.ten) &&
        !topSkillNames.has(it.id);
      if (!isExtraSkill) {
        let scPwr = kmScalablePower(it, mode, bBuild);
        // Thưởng thêm cho mảnh có Linh Lực khi xếp theo tỉ lệ Tâm Pháp cao (6:4 / 7:3)
        if (it.linh_luc > 0) {
          const ratioBoost =
            S.hbRatio && S.hbRatio.t >= 0.65 ? 1.55 : 1.25;
          scPwr += it.linh_luc * 45 * ratioBoost;
        }
        const heSo = (rm && rm.heSo) || 1.0;
        heSoAmpScore += (heSo - 0.85) * scPwr * 0.38;
      }
    }
    const q =
      p.hyCount !== undefined
        ? p.hyCount
        : p.cells.filter((x) => hy0.has(x)).length;
    if (q > 0) {
      if (isThong) {
        const pwr = acupointPriority(it, mode, bBuild);
        if (pwr <= 20) {
          hyScore -= 15 * q;
        } else {
          hyScore += 32 * q + 0.34 * pwr * (1 + 0.25 * (q - 1));
        }
      } else {
        hyScore -= 95 * q;
      }
    }
  });
  for (const h of hy0) {
    if (
      g0.vung[h] >= 0 &&
      nv0.kinhMach.trangThai[h] === "thong" &&
      !usedCells.has(h)
    ) {
      hyScore -= 48;
    }
  }

  const curHoThe = (R.biDong && R.biDong.ho_the) || 0;
  let hoThePenalty = 0;
  if (curHoThe > maxHoThe) {
    const excess = curHoThe - maxHoThe;
    hoThePenalty =
      200 * excess + (excess > 0.08 ? 350 * (excess - 0.08) : 0);
  }

  // Điểm nền tảng phòng thủ (Hộ Thể + Khí Huyết) để chế độ Burst / Đánh không bao giờ vứt bỏ 60% Hộ Thể và 20k Máu chỉ để lấy vài trăm sát thương lẻ!
  const effHoThe = Math.min(maxHoThe, curHoThe);
  const effHp = (P.khiHuyetToiDa || 100) / Math.max(0.15, 1 - effHoThe);
  const defFoundationScore =
    effHoThe * (mode === "tank" ? 380 : 240) +
    Math.log10(Math.max(10, effHp)) * 48;

  let kinhLoBonus = 0;
  (R.manh || []).forEach((m) => {
    if (
      m &&
      m.thong &&
      m.item &&
      m.item.loai === "phap_khi" &&
      m.kinhLo > 1
    ) {
      const pkScale = Math.max(
        1,
        kmScalablePower(m.item, mode, bBuild) / 80,
      );
      kinhLoBonus += (m.kinhLo - 1) * (55 + 18 * Math.min(4, pkScale));
    }
  });

  let colorScore = 0;
  (R.manh || []).forEach((m, idx) => {
    if (m && m.thong) {
      const p = manh[idx];
      const it = m.item;
      const scPwr = kmScalablePower(it, mode, bBuild);
      const scaleFactor =
        scPwr > 20 ? 1.0 + Math.min(1.5, scPwr / 250) : 0.25;
      const canRecolor =
        isTayO &&
        p &&
        p.recolorableCount > 0 &&
        (p.unfixableCount || 0) === 0;
      if (m.mau >= 1.25 || canRecolor) {
        colorScore += (canRecolor ? 22 : 30) * scaleFactor;
      } else if (m.mau < 1.0) {
        colorScore -= 16 * (1.075 - m.mau) * scaleFactor;
      }
      if (p && p.causesCellNghich && S.dir !== "ma") {
        colorScore -= mode === "dot_pha" ? 75 : 35;
      }
    }
  });

  const deadPenalty = S.full ? 0 : dead * 95;
  const densityBonus = connectedCells * 3.0 + thong * 8.0;

  return {
    thong,
    dead,
    toc,
    dp,
    ng,
    dmgScore,
    uyMax,
    relMax,
    effectiveRotDmg,
    llScore,
    hyScore,
    heSoAmpScore,
    hoThePenalty,
    defFoundationScore,
    kinhLoBonus,
    colorScore,
    deadPenalty,
    densityBonus,
    curHoThe,
  };
}

// Tầng 1 (Fast Proxy Evaluation): Tính nhanh điểm số qua chỉ số thực của P và R + Ước lượng đối kháng chuẩn xác
function makeFastEval(nv0, mode) {
  nv0 = lnPrep(nv0);
  const K = S.core,
    c = C(),
    cache = new Map();
  const g0 = K.luoiKinhMach(c, nv0),
    hy0 = hySet(g0, nv0.kinhMach),
    B = biasCtx(nv0, g0),
    capX = capCtxOf(nv0),
    ngW = S.dir === "ma" ? 0.35 : 1,
    maxHoThe =
      0.6 +
      ((nv0.theChat &&
        nv0.theChat.dac_tinh &&
        nv0.theChat.dac_tinh.ho_the_tran) ||
        0);
  const enemies = benchEnemies(nv0.canhGioi, nv0.tieuCanhGioi || 0);
  let avgEnemyHp = 500,
    avgEnemyDps = 50;
  if (enemies && enemies.length) {
    avgEnemyHp =
      enemies.reduce(
        (a, x) => a + ((x.E && x.E.khiHuyetToiDa) || 500),
        0,
      ) / enemies.length;
    avgEnemyDps =
      enemies.reduce((a, x) => a + ((x.E && x.E.phapLuc) || 50), 0) /
      enemies.length;
  }

  const nvWork = Object.assign({}, nv0, {
    kinhMach: Object.assign({}, nv0.kinhMach, { manh: [] }),
  });

  return (manh) => {
    const key = manh
      .map((p) => p.key)
      .sort()
      .join("|");
    if (cache.has(key)) return cache.get(key);

    nvWork.kinhMach.manh = manh.map((p) => p.m);
    const R = K.tinhKinhMach(nvWork, c),
      P = K.taoBenTa(nvWork, c);

    const cm = computeMeridianCommonScore(
      nv0,
      nvWork,
      g0,
      hy0,
      B,
      capX,
      maxHoThe,
      ngW,
      mode,
      manh,
      R,
      P,
      c,
    );

    // Combat Power Proxy: Ước tính tỉ lệ thắng & trao đổi sát thương với chuẩn địch cùng cảnh giới
    const effHoThe = Math.min(maxHoThe, cm.curHoThe);
    const effHp =
      (P.khiHuyetToiDa || 100) / Math.max(0.15, 1 - effHoThe);
    const hpLog = Math.log10(Math.max(10, effHp)) * 55;
    const ttkEnemy =
      avgEnemyHp / Math.max(1, cm.effectiveRotDmg || P.phapLuc || 10);
    const ttkSelf = effHp / Math.max(1, avgEnemyDps * 1.35);
    const duelRatio = Math.min(3.5, ttkSelf / Math.max(0.5, ttkEnemy));
    const duelProxy = duelRatio * 180;

    let proxyFight = 0;
    if (mode === "danh" || mode === "burst") {
      proxyFight =
        1.2 * cm.dmgScore +
        0.95 * hpLog +
        0.85 * duelProxy +
        (P.tocDo || 0) * 0.25;
    } else if (mode === "tank") {
      proxyFight =
        0.55 * cm.dmgScore +
        1.75 * hpLog +
        0.75 * duelProxy +
        320 * effHoThe;
    } else if (mode === "tu") {
      proxyFight = 0.22 * cm.dmgScore + 0.35 * hpLog + 0.25 * duelProxy;
    } else if (mode === "dot_pha") {
      proxyFight = 0.28 * cm.dmgScore + 0.45 * hpLog + 0.3 * duelProxy;
    } else {
      proxyFight = cm.dmgScore + hpLog + 0.7 * duelProxy;
    }

    let s;
    if (mode === "tu") {
      const realSpd =
        K.tocDoTuLuyen && typeof K.tocDoTuLuyen === "function"
          ? K.tocDoTuLuyen(nvWork, c) || 0
          : 0;
      s =
        0.15 * proxyFight +
        0.15 * cm.dmgScore +
        720 * cm.toc +
        (realSpd > 0 ? realSpd * 180 : 0) +
        130 * cm.dp +
        cm.thong -
        65 * cm.ng +
        cm.llScore;
    } else if (mode === "dot_pha") {
      const ktm = (R.biDong && R.biDong.khang_tam_ma) || 0;
      const hpSafe =
        Math.min(1.6, (P.khiHuyetToiDa || 100) / 1000) * 45;
      s =
        0.22 * proxyFight +
        0.2 * cm.dmgScore +
        1050 * cm.dp +
        280 * ktm +
        hpSafe +
        cm.thong -
        110 * cm.ng +
        0.65 * cm.llScore;
    } else if (mode === "tank") {
      const hoTheVal = Math.min(maxHoThe, cm.curHoThe);
      const bodyHpVal = (R.bodyHp || 0) * 0.65;
      s =
        1.3 * proxyFight +
        0.5 * cm.dmgScore +
        hpLog +
        bodyHpVal +
        380 * hoTheVal +
        cm.thong -
        18 * cm.ng +
        cm.llScore;
    } else if (mode === "burst") {
      // Sửa triệt để lỗi cộng 0.9 * uyMax thô (gây lệch hàng nghìn điểm ở cảnh giới cao): dùng relMax đã chuẩn hóa!
      s =
        proxyFight +
        1.45 * cm.dmgScore +
        28 * Math.min(15, cm.relMax || 0) +
        cm.defFoundationScore +
        0.5 * cm.thong -
        14 * cm.ng +
        cm.llScore;
    } else if (mode === "danh") {
      s =
        proxyFight +
        1.1 * cm.dmgScore +
        cm.defFoundationScore +
        0.5 * cm.thong -
        10 * cm.ng +
        cm.llScore;
    } else {
      const realSpd =
        K.tocDoTuLuyen && typeof K.tocDoTuLuyen === "function"
          ? K.tocDoTuLuyen(nvWork, c) || 0
          : 0;
      s =
        proxyFight +
        0.55 * cm.dmgScore +
        0.85 * cm.defFoundationScore +
        65 * cm.toc +
        (realSpd > 0 ? realSpd * 25 : 0) +
        50 * cm.dp +
        0.5 * cm.thong -
        12 * cm.ng +
        cm.llScore;
    }
    s +=
      cm.hyScore +
      cm.heSoAmpScore -
      cm.hoThePenalty +
      cm.kinhLoBonus +
      cm.colorScore +
      cm.densityBonus -
      cm.deadPenalty;
    s += biasScore(B, manh, R) + capScore(capX, R);
    if (S.hbRatio) s -= hbRatioPenalty(manh, R, nv0);
    if (S.full) s += 20 * manh.reduce((a, p) => a + p.cells.length, 0);

    const out = { s, proxyFight, P, R };
    cache.set(key, out);
    return out;
  };
}

// Tầng 2 (Full Simulation Evaluation): Đánh thật fight(P, E) với tập benchEnemies
function makeEval(nv0, enemies, mode) {
  nv0 = lnPrep(nv0);
  const K = S.core,
    c = C(),
    cache = new Map();
  const g0 = K.luoiKinhMach(c, nv0),
    hy0 = hySet(g0, nv0.kinhMach),
    B = biasCtx(nv0, g0),
    capX = capCtxOf(nv0),
    ngW = S.dir === "ma" ? 0.35 : 1,
    maxHoThe =
      0.6 +
      ((nv0.theChat &&
        nv0.theChat.dac_tinh &&
        nv0.theChat.dac_tinh.ho_the_tran) ||
        0);

  const nvWork = Object.assign({}, nv0, {
    kinhMach: Object.assign({}, nv0.kinhMach, { manh: [] }),
  });

  return (manh) => {
    const key = manh
      .map((p) => p.key)
      .sort()
      .join("|");
    if (cache.has(key)) return cache.get(key);

    nvWork.kinhMach.manh = manh.map((p) => p.m);
    const R = K.tinhKinhMach(nvWork, c),
      P = K.taoBenTa(nvWork, c);
    let fightScore = 0,
      wins = 0;
    for (const { E } of enemies) {
      const r = fight(P, E);
      const hpLeft = Math.max(
        0,
        (r.khiHuyetThapNhat || 0) / Math.max(1, P.khiHuyetToiDa || 1),
      );
      const dealt = Math.min(
        1,
        ((r.stTa || 0) * Math.max(1, r.nHiep)) /
          Math.max(1, E.khiHuyetToiDa || 1),
      );
      if (r.thang) {
        wins++;
        fightScore +=
          mode === "danh" || mode === "burst"
            ? 105 + 22 * hpLeft + 65 / Math.max(1, r.nHiep)
            : mode === "tank"
              ? 105 + 85 * hpLeft + 22 / Math.max(1, r.nHiep)
              : 105 + 52 * hpLeft + 28 / Math.max(1, r.nHiep);
      } else fightScore += 52 * dealt;
    }

    const cm = computeMeridianCommonScore(
      nv0,
      nvWork,
      g0,
      hy0,
      B,
      capX,
      maxHoThe,
      ngW,
      mode,
      manh,
      R,
      P,
      c,
    );

    let s;
    if (mode === "tu") {
      const realSpd =
        K.tocDoTuLuyen && typeof K.tocDoTuLuyen === "function"
          ? K.tocDoTuLuyen(nvWork, c) || 0
          : 0;
      s =
        0.15 * fightScore +
        0.15 * cm.dmgScore +
        720 * cm.toc +
        (realSpd > 0 ? realSpd * 180 : 0) +
        130 * cm.dp +
        cm.thong -
        65 * cm.ng +
        cm.llScore;
    } else if (mode === "dot_pha") {
      const ktm = (R.biDong && R.biDong.khang_tam_ma) || 0;
      const hpSafe =
        Math.min(1.6, (P.khiHuyetToiDa || 100) / 1000) * 45;
      s =
        0.22 * fightScore +
        0.2 * cm.dmgScore +
        1050 * cm.dp +
        280 * ktm +
        hpSafe +
        cm.thong -
        110 * cm.ng +
        0.65 * cm.llScore;
    } else if (mode === "tank") {
      const hoTheVal = Math.min(maxHoThe, cm.curHoThe);
      const hpLog =
        Math.log10(Math.max(10, P.khiHuyetToiDa || 100)) * 70;
      const bodyHpVal = (R.bodyHp || 0) * 0.65;
      s =
        1.3 * fightScore +
        0.5 * cm.dmgScore +
        hpLog +
        bodyHpVal +
        380 * hoTheVal +
        cm.thong -
        18 * cm.ng +
        cm.llScore;
    } else if (mode === "burst") {
      s =
        fightScore +
        1.45 * cm.dmgScore +
        28 * Math.min(15, cm.relMax || 0) +
        cm.defFoundationScore +
        0.5 * cm.thong -
        14 * cm.ng +
        cm.llScore;
    } else if (mode === "danh") {
      s =
        fightScore +
        1.1 * cm.dmgScore +
        cm.defFoundationScore +
        0.5 * cm.thong -
        10 * cm.ng +
        cm.llScore;
    } else {
      const realSpd =
        K.tocDoTuLuyen && typeof K.tocDoTuLuyen === "function"
          ? K.tocDoTuLuyen(nvWork, c) || 0
          : 0;
      s =
        fightScore +
        0.55 * cm.dmgScore +
        0.85 * cm.defFoundationScore +
        65 * cm.toc +
        (realSpd > 0 ? realSpd * 25 : 0) +
        50 * cm.dp +
        0.5 * cm.thong -
        12 * cm.ng +
        cm.llScore;
    }
    s +=
      cm.hyScore +
      cm.heSoAmpScore -
      cm.hoThePenalty +
      cm.kinhLoBonus +
      cm.colorScore +
      cm.densityBonus -
      cm.deadPenalty;
    s += biasScore(B, manh, R) + capScore(capX, R);
    if (S.hbRatio) s -= hbRatioPenalty(manh, R, nv0);
    if (S.full) s += 20 * manh.reduce((a, p) => a + p.cells.length, 0);
    const out = { s, wins, P, R };
    cache.set(key, out);
    return out;
  };
}

// Bitmask O(1), Khắc phục góc xoay đa hệ (heTungO) & Bộ nhớ đệm chữ ký trạng thái (Candidate Cache)
let _candCacheSig = "";
let _candCacheVal = null;
function buildCandidates(nv0) {
  const K = S.core,
    c = C();
  const km0 = (nv0 && nv0.kinhMach) || {};
  const bagKeys = Object.keys((nv0 && nv0.tuiDo) || {})
    .filter((k) => nv0.tuiDo[k] > 0)
    .sort()
    .join(",");
  const sig =
    (nv0.canhGioi ?? 0) +
    "|" +
    (nv0.tieuCanhGioi ?? 0) +
    "|" +
    (nv0.theChat || "") +
    "|" +
    ((nv0.linhCan && nv0.linhCan.he) || []).join(",") +
    "|" +
    (km0.trangThai || []).join(",") +
    "|" +
    (km0.mau || []).join(",") +
    "|" +
    ((km0.huyetGoc || []).join(",") +
      ":" +
      (km0.huyetThem || []).join(",")) +
    "|" +
    bagKeys;
  if (_candCacheVal && _candCacheSig === sig) {
    return _candCacheVal;
  }
  const pool = Object.keys(nv0.tuiDo).filter((id) => {
    const it = c.items.get(id);
    return (
      it &&
      (it.loai === "cong_phap" || it.loai === "phap_khi") &&
      it.hinh &&
      (it.canh_gioi ?? 0) <= nv0.canhGioi
    );
  });
  const g = K.luoiKinhMach(c, nv0);
  const hy0 = hySet(g, nv0.kinhMach);
  const mauK = (nv0.kinhMach && nv0.kinhMach.mau) || [];
  const cand = {};
  const ddX = g.danDien % g.rong;
  const ddY = Math.floor(g.danDien / g.rong);

  for (const id of pool) {
    const it = c.items.get(id),
      seen = new Set();
    cand[id] = [];
    const isCP = it.loai === "cong_phap";
    const hs = ((it && it.he) || []).filter((h) => h && h !== "vo_sac");
    const pwr = kmItemPower(it);
    const scalablePwr = kmScalablePower(it, "bal", null);

    for (let xoay = 0; xoay < 4; xoay++) {
      let cellElements = null;
      try {
        cellElements = K.heTungO ? K.heTungO(it, xoay) : null;
      } catch (e) {}
      for (let y = 0; y < g.cao; y++)
        for (let x = 0; x < g.rong; x++) {
          const m = { item: id, x, y, xoay };
          let err;
          try {
            err = K.kiemTraDat(nv0, c, m);
          } catch (e) {
            err = "x";
          }
          if (err) continue;
          const cells = K.oCuaManh(g, m, it);
          if (!cells || !cells.length) continue;

          // Khóa chống trùng bảo toàn góc xoay đa hệ
          const cellPairs = cells.map((cellIdx, idx) => ({
            cellIdx,
            he:
              cellElements && cellElements[idx]
                ? cellElements[idx]
                : hs[0] || "vo_sac",
          }));
          cellPairs.sort((a, b) => a.cellIdx - b.cellIdx);
          const sigKey =
            id +
            ":" +
            cellPairs.map((cp) => cp.cellIdx + "." + cp.he).join(",");
          if (seen.has(sigKey)) continue;
          seen.add(sigKey);

          const key = id + ":" + x + "," + y + "," + xoay;

          // Tiền tính toán thuộc tính hình học, hệ từng ô & liên thông
          const hyCount = cells.filter((cIdx) => hy0.has(cIdx)).length;
          let touchesDanDien = false;
          let matchCount = 0,
            partialCount = 0,
            conflictCount = 0,
            khacCellCount = 0,
            recolorableCount = 0,
            unfixableCount = 0;
          let hopSum = 0;
          let minDanDienDist = 999;
          const adj = new Set();
          const cellHe = new Array(cells.length);
          const cellHeByIdx = new Map();
          const lcHe = (nv0.linhCan && nv0.linhCan.he) || [];

          for (let i = 0; i < cells.length; i++) {
            const cellIdx = cells[i];
            const cx = cellIdx % g.rong;
            const cy = Math.floor(cellIdx / g.rong);
            const dist = Math.abs(cx - ddX) + Math.abs(cy - ddY);
            if (dist < minDanDienDist) minDanDienDist = dist;

            if (cx > 0) adj.add(cellIdx - 1);
            if (cx < g.rong - 1) adj.add(cellIdx + 1);
            if (cy > 0) adj.add(cellIdx - g.rong);
            if (cy < g.cao - 1) adj.add(cellIdx + g.rong);

            if (
              (cx > 0 && cellIdx - 1 === g.danDien) ||
              (cx < g.rong - 1 && cellIdx + 1 === g.danDien) ||
              (cy > 0 && cellIdx - g.rong === g.danDien) ||
              (cy < g.cao - 1 && cellIdx + g.rong === g.danDien)
            ) {
              touchesDanDien = true;
            }

            const mColor = mauK[cellIdx] || "vo_sac";
            const pieceHe =
              cellElements && cellElements[i]
                ? cellElements[i]
                : hs[0] || "vo_sac";
            cellHe[i] = pieceHe;
            cellHeByIdx.set(cellIdx, pieceHe);

            const hopVal = doHopCellGame(mColor, pieceHe);
            hopSum += hopVal;
            if (hopVal >= 0.99) {
              matchCount++;
            } else if (hopVal >= 0.49) {
              partialCount++;
            } else {
              conflictCount++;
              if (oKhac(mColor, pieceHe)) khacCellCount++;
              const canRecolor =
                cellIdx !== g.danDien &&
                g.vung[cellIdx] >= 0 &&
                nv0.kinhMach.trangThai &&
                nv0.kinhMach.trangThai[cellIdx] !== "an" &&
                (lcHe.includes(pieceHe) || pieceHe === "vo_sac");
              if (canRecolor) {
                recolorableCount++;
              } else {
                unfixableCount++;
              }
            }
          }
          for (const cellIdx of cells) adj.delete(cellIdx);

          // Bitmask O(1) BigInt
          let cellMask = 0n;
          for (let i = 0; i < cells.length; i++) {
            cellMask |= 1n << BigInt(cells[i]);
          }
          let adjMask = 0n;
          for (const adjCell of adj) {
            adjMask |= 1n << BigInt(adjCell);
          }

          const aff = cells.length ? hopSum / cells.length : 0.5;
          const exactMauMult = 0.85 + 0.45 * aff;
          // Luật game (ja): mảnh nằm QUÁ NỬA trên ô khắc nó thì +1 điểm nghịch
          const causesCellNghich = khacCellCount * 2 > cells.length;
          const isKhacPha = conflictCount > 0;

          cand[id].push({
            m,
            rong: g.rong,
            cells,
            cellHe,
            cellHeByIdx,
            hs,
            key,
            id,
            isCP,
            pwr,
            scalablePwr,
            hyCount,
            touchesDanDien,
            danDienDist: minDanDienDist,
            adj: [...adj],
            cellMask,
            adjMask,
            aff,
            exactMauMult,
            matchCount,
            partialCount,
            conflictCount,
            khacCellCount,
            causesCellNghich,
            recolorableCount,
            unfixableCount,
            isKhacPha,
          });
        }
    }
  }
  _candCacheSig = sig;
  _candCacheVal = { cand, g };
  return _candCacheVal;
}

// Helper tính nhanh mặt nạ liên thông (thong) và điểm khớp (Articulation Points) bằng BigInt Bitmask O(N)
function getDanDienAdjMask(g, st) {
  let mask = 0n;
  const dX = g.danDien % g.rong;
  const dY = Math.floor(g.danDien / g.rong);
  const nbs = [];
  if (dX > 0) nbs.push(g.danDien - 1);
  if (dX < g.rong - 1) nbs.push(g.danDien + 1);
  if (dY > 0) nbs.push(g.danDien - g.rong);
  if (dY < g.cao - 1) nbs.push(g.danDien + g.rong);
  for (const nb of nbs) {
    if (g.vung[nb] >= 0 && (!st || st[nb] === "thong")) {
      mask |= 1n << BigInt(nb);
    }
  }
  return mask;
}

function computeFlowBitmask(manh, ddAdjMask, skipIdx = -1) {
  let reachMask = ddAdjMask;
  const n = manh.length;
  let added = true;
  const cpConnected = new Uint8Array(n);
  while (added) {
    added = false;
    for (let i = 0; i < n; i++) {
      if (i === skipIdx || cpConnected[i]) continue;
      const p = manh[i];
      if (p.isCP && (p.cellMask & reachMask) !== 0n) {
        cpConnected[i] = 1;
        reachMask |= p.adjMask;
        added = true;
      }
    }
  }
  let connectedCount = 0,
    deadCount = 0;
  for (let i = 0; i < n; i++) {
    if (i === skipIdx) continue;
    const p = manh[i];
    if (cpConnected[i] || (p.cellMask & reachMask) !== 0n) {
      connectedCount++;
    } else {
      deadCount++;
    }
  }
  return { reachMask, connectedCount, deadCount };
}

// Tính điểm tương sinh / tương khắc theo TỪNG Ô CHẠM NHAU giữa hai mảnh cA và cB (chuẩn hàm tinhKinhMach của game)
function calcPairCellSynergy(cA, itA, cB, itB) {
  if (!cA || !cB || (cA.adjMask & cB.cellMask) === 0n) {
    return { aGenB: 0, bGenA: 0, aKhacB: 0, bKhacA: 0, touches: 0 };
  }
  let aGenB = 0,
    bGenA = 0,
    aKhacB = 0,
    bKhacA = 0,
    touches = 0;
  const slackForB = genSlack(itB, itA);
  const slackForA = genSlack(itA, itB);
  const mapB = cB.cellHeByIdx;
  const rong = cA.rong || 9;
  if (!mapB) return { aGenB, bGenA, aKhacB, bKhacA, touches };

  for (let i = 0; i < cA.cells.length; i++) {
    const cellA = cA.cells[i];
    const heA = (cA.cellHe && cA.cellHe[i]) || "vo_sac";
    if (heA === "vo_sac") continue;
    const cx = cellA % rong;
    const nbs = [
      cx > 0 ? cellA - 1 : -1,
      cx < rong - 1 ? cellA + 1 : -1,
      cellA - rong,
      cellA + rong,
    ];
    for (let k = 0; k < 4; k++) {
      const nb = nbs[k];
      if (nb < 0) continue;
      const heB = mapB.get(nb);
      if (!heB || heB === "vo_sac") continue;
      touches++;
      const dAB = heTacDong(heA, heB);
      if (dAB > 0) {
        if (slackForB > aGenB) aGenB = slackForB;
      } else if (dAB < 0) {
        aKhacB = 1;
      }
      const dBA = heTacDong(heB, heA);
      if (dBA > 0) {
        if (slackForA > bGenA) bGenA = slackForA;
      } else if (dBA < 0) {
        bKhacA = 1;
      }
    }
  }
  return { aGenB, bGenA, aKhacB, bKhacA, touches };
}

// Thuật toán BFS đa nguồn tìm đường nối ngắn nhất từ tập ô đã thông (startSet) tới tập ô đích (targetAdjSet)
function findBridgePathBFS(
  g,
  st,
  startCells,
  targetAdjSet,
  blockedMask,
) {
  const starts = Array.isArray(startCells) ? startCells : [startCells];
  const queue = [];
  const visited = new Set();
  const parent = new Map();
  for (const s of starts) {
    if (s >= 0 && !visited.has(s)) {
      visited.add(s);
      queue.push(s);
    }
  }
  let foundTarget = -1;

  while (queue.length > 0) {
    const curr = queue.shift();
    if (targetAdjSet.has(curr)) {
      foundTarget = curr;
      break;
    }

    const cx = curr % g.rong;
    const cy = Math.floor(curr / g.rong);
    const neighbors = [];
    if (cx > 0) neighbors.push(curr - 1);
    if (cx < g.rong - 1) neighbors.push(curr + 1);
    if (cy > 0) neighbors.push(curr - g.rong);
    if (cy < g.cao - 1) neighbors.push(curr + g.rong);

    for (const nb of neighbors) {
      if (visited.has(nb)) continue;
      if (g.vung[nb] < 0 || st[nb] !== "thong") continue;
      if (
        (blockedMask & (1n << BigInt(nb))) !== 0n &&
        !targetAdjSet.has(nb)
      )
        continue;

      visited.add(nb);
      parent.set(nb, curr);
      queue.push(nb);
    }
  }

  if (foundTarget === -1) return null;

  const startSet = new Set(starts);
  const path = [];
  let curr = foundTarget;
  while (!startSet.has(curr) && parent.has(curr)) {
    path.push(curr);
    curr = parent.get(curr);
  }
  if (!startSet.has(curr) && curr !== g.danDien) {
    path.push(curr);
  }
  path.reverse();
  return path;
}

// Khởi tạo Đa Hạt Giống (Multi-Topology Seeding Engine: 5 chiến lược hình học khác nhau)
async function greedy(nv0, mode, seedVariant = 0) {
  nv0 = lnPrep(nv0);
  const vIdx =
    typeof seedVariant === "boolean"
      ? seedVariant
        ? 1
        : 0
      : Number(seedVariant) || 0;
  const isTayO = !!(AU.cfg && AU.cfg.km && AU.cfg.km.tayO);
  const K = S.core,
    c = C(),
    { cand, g } = buildCandidates(nv0),
    B = biasCtx(nv0, g),
    bBuild = B ? B.build : null,
    hy0 = hySet(g, nv0.kinhMach),
    fastEv = makeFastEval(nv0, mode);

  const quick = (manh) => fastEv(manh).s;

  let cur = [];
  const flowAccessible = new Set();
  let flowMask = 0n;
  let usedMask = 0n;
  const ddAdjMask = getDanDienAdjMask(g, nv0.kinhMach.trangThai);

  const resetFlow = () => {
    cur = [];
    flowAccessible.clear();
    flowMask = ddAdjMask;
    usedMask = 0n;
    const dX = g.danDien % g.rong;
    const dY = Math.floor(g.danDien / g.rong);
    if (dX > 0) flowAccessible.add(g.danDien - 1);
    if (dX < g.rong - 1) flowAccessible.add(g.danDien + 1);
    if (dY > 0) flowAccessible.add(g.danDien - g.rong);
    if (dY < g.cao - 1) flowAccessible.add(g.danDien + g.rong);
  };
  resetFlow();

  const addPieceToFlow = (p) => {
    usedMask |= p.cellMask;
    if (p.isCP) {
      for (const adjCell of p.adj || []) {
        if (
          g.vung[adjCell] >= 0 &&
          nv0.kinhMach.trangThai[adjCell] === "thong"
        ) {
          flowAccessible.add(adjCell);
          flowMask |= 1n << BigInt(adjCell);
        }
      }
    }
  };

  const openHy = [...hy0].filter(
    (h) => g.vung[h] >= 0 && nv0.kinhMach.trangThai[h] === "thong",
  );
  let seedSuccess = false;

  // CHIẾN LƯỢC 0 & 2: Acupoint-Steiner Multi-Bridge (Đặt mảnh nhân hệ số cao nhất lên Huyệt Đạo trước, bắc cầu Steiner từ Đan Điền)
  if ((vIdx === 0 || vIdx === 2) && openHy.length > 0) {
    const sortedPool = Object.keys(cand)
      .filter((id) => cand[id].length > 0)
      .sort((a, b) => {
        const itA = c.items.get(a),
          itB = c.items.get(b);
        return (
          acupointPriority(itB, mode, bBuild) -
          acupointPriority(itA, mode, bBuild)
        );
      });

    // Chỉ lấy các món thực sự có thuộc tính nhân heSo lên Huyệt
    const scalablePool = sortedPool.filter((id) => {
      const it = c.items.get(id);
      return kmScalablePower(it, mode, bBuild) > 20;
    });
    const huyetPool = scalablePool.length ? scalablePool : sortedPool;

    const placedHuyet = [];
    let placedHuyetMask = 0n;
    const placedHuyetIds = new Set();

    // Sắp xếp Huyệt gần Đan Điền trước để dễ bắc cầu liên hoàn
    const sortedHy = openHy.slice().sort((a, b) => {
      const da =
        Math.abs((a % g.rong) - (g.danDien % g.rong)) +
        Math.abs(
          Math.floor(a / g.rong) - Math.floor(g.danDien / g.rong),
        );
      const db =
        Math.abs((b % g.rong) - (g.danDien % g.rong)) +
        Math.abs(
          Math.floor(b / g.rong) - Math.floor(g.danDien / g.rong),
        );
      return vIdx === 2 ? db - da : da - db;
    });

    const maxHyTargets =
      vIdx === 2
        ? Math.min(2, sortedHy.length)
        : Math.min(4, sortedHy.length);

    for (const h of sortedHy) {
      if ((placedHuyetMask & (1n << BigInt(h))) !== 0n) continue;
      let bestCnd = null;
      let bestScore = -1e9;

      for (const id of huyetPool) {
        if (placedHuyetIds.has(id)) continue;
        const itCnd = c.items.get(id);
        const basePrio = acupointPriority(itCnd, mode, bBuild);
        if (basePrio < bestScore * 0.45) break;

        for (const cnd of cand[id]) {
          if (!cnd.cells.includes(h)) continue;
          if ((placedHuyetMask & cnd.cellMask) !== 0n) continue;

          // Không còn lọc cứng conflictCount > 0! Thay bằng điểm hệ số thực tế:
          const hyMult = 2.0 + 0.25 * (cnd.hyCount - 1);
          const effMau =
            isTayO && (cnd.unfixableCount || 0) === 0
              ? 1.3
              : cnd.exactMauMult;
          const nghichPen =
            cnd.causesCellNghich && S.dir !== "ma"
              ? mode === "dot_pha"
                ? 320
                : 140
              : 0;
          const distBonus = Math.max(0, 10 - cnd.danDienDist) * 4;
          const prio =
            basePrio * (effMau * (hyMult / 2.0)) +
            cnd.hyCount * 55 +
            distBonus -
            nghichPen -
            (isTayO ? cnd.unfixableCount * 15 : cnd.conflictCount * 8);

          if (prio > bestScore) {
            bestScore = prio;
            bestCnd = cnd;
          }
        }
      }

      if (bestCnd) {
        placedHuyet.push(bestCnd);
        placedHuyetMask |= bestCnd.cellMask;
        placedHuyetIds.add(bestCnd.id);
        if (placedHuyet.length >= maxHyTargets) break;
      }
    }

    if (placedHuyet.length > 0) {
      // Bắc cầu tuần tự từ mạng lưới Đan Điền tới từng mảnh Huyệt Đạo
      let bridgePieces = [];
      let bridgeMask = 0n;
      let bridgeFlow = new Set(flowAccessible);
      let currentStarts = [g.danDien];

      const cpPool = Object.keys(cand)
        .filter((id) => {
          const it = c.items.get(id);
          return (
            it && it.loai === "cong_phap" && !placedHuyetIds.has(id)
          );
        })
        .sort((a, b) => {
          const itA = c.items.get(a),
            itB = c.items.get(b);
          return kmItemPower(itB, mode) - kmItemPower(itA, mode);
        });

      for (const hPiece of placedHuyet) {
        if (
          hPiece.touchesDanDien ||
          hPiece.cells.some((x) => bridgeFlow.has(x))
        ) {
          if (hPiece.isCP) {
            for (const a of hPiece.adj) bridgeFlow.add(a);
            currentStarts.push(...hPiece.cells);
          }
          continue;
        }

        const targetAdjSet = new Set();
        for (const a of hPiece.adj) {
          if (g.vung[a] >= 0 && nv0.kinhMach.trangThai[a] === "thong") {
            targetAdjSet.add(a);
          }
        }
        const path = findBridgePathBFS(
          g,
          nv0.kinhMach.trangThai,
          currentStarts,
          targetAdjSet,
          placedHuyetMask | bridgeMask,
        );
        if (!path || !path.length) continue;

        const itTarget = c.items.get(hPiece.m.item);
        for (let stepIdx = 0; stepIdx < path.length; stepIdx++) {
          const stepCell = path[stepIdx];
          if ((bridgeMask & (1n << BigInt(stepCell))) !== 0n) continue;

          let bestBridge = null;
          let bestBScore = -1e9;

          for (const id of cpPool) {
            if (bridgePieces.some((p) => p.m.item === id)) continue;
            const itCnd = c.items.get(id);
            const isKinhLoMatch = hopKinhLoHe(
              itCnd.he || [],
              hPiece.hs || [],
            );
            for (const cnd of cand[id]) {
              if (!cnd.cells.includes(stepCell)) continue;
              if ((placedHuyetMask & cnd.cellMask) !== 0n) continue;
              if ((bridgeMask & cnd.cellMask) !== 0n) continue;
              const canConnect =
                cnd.touchesDanDien ||
                cnd.cells.some((x) => bridgeFlow.has(x));
              if (!canConnect) continue;

              // Đếm xem mảnh cầu nối này phủ được bao nhiêu bước trên path
              let stepsCovered = 0;
              for (let k = stepIdx; k < path.length; k++) {
                if (cnd.cells.includes(path[k])) stepsCovered++;
              }
              const touchesTarget =
                (cnd.adjMask & hPiece.cellMask) !== 0n;
              const syn = touchesTarget
                ? calcPairCellSynergy(cnd, itCnd, hPiece, itTarget)
                : { aGenB: 0, aKhacB: 0 };

              let sc =
                kmItemPower(itCnd, mode) * 0.25 +
                cnd.exactMauMult * 30 +
                stepsCovered * 28 +
                (touchesTarget ? 65 : 0) +
                (isKinhLoMatch ? 35 : 0) +
                syn.aGenB * 55 -
                syn.aKhacB * (S.dir === "ma" ? -30 : 45) -
                (cnd.causesCellNghich && S.dir !== "ma" ? 60 : 0);

              if (sc > bestBScore) {
                bestBScore = sc;
                bestBridge = cnd;
              }
            }
          }

          if (bestBridge) {
            bridgePieces.push(bestBridge);
            bridgeMask |= bestBridge.cellMask;
            for (const a of bestBridge.adj) bridgeFlow.add(a);
            currentStarts.push(...bestBridge.cells);
            if (hPiece.cells.some((x) => bridgeFlow.has(x))) {
              if (hPiece.isCP) {
                for (const a of hPiece.adj) bridgeFlow.add(a);
                currentStarts.push(...hPiece.cells);
              }
              break;
            }
          }
        }
      }

      for (const b of bridgePieces) {
        cur.push(b);
        addPieceToFlow(b);
      }
      for (const hP of placedHuyet) {
        if (
          hP.touchesDanDien ||
          (flowMask & hP.cellMask) !== 0n ||
          (flowMask & hP.adjMask) !== 0n
        ) {
          cur.push(hP);
          addPieceToFlow(hP);
        }
      }
      if (cur.length > 0) seedSuccess = true;
    }
  }

  // CHIẾN LƯỢC 1, 3, 4 (hoặc Fallback): Spine-First / Non-Scaling Trunk / Randomized Anchor
  if (!seedSuccess) {
    resetFlow();
    const anchorCandidates = [];
    for (const id of Object.keys(cand)) {
      const itAnchor = c.items.get(id);
      for (const cnd of cand[id]) {
        if (cnd.touchesDanDien && cnd.isCP) {
          let v = quick([cnd]);
          if (vIdx === 3) {
            // Chiến lược 3: Ưu tiên công pháp không nhân hệ số (toc_do / dot_pha) hoặc nhiều nhánh làm thân cây quanh Đan Điền, chừa Huyệt Đạo lại!
            const isPurePassive =
              kmScalablePower(itAnchor, mode, bBuild) <= 15;
            if (isPurePassive && cnd.hyCount === 0) v += 140;
            if (cnd.hyCount > 0 && isPurePassive) v -= 120;
            v += cnd.adj.length * 8;
          }
          if (!cnd.causesCellNghich) v += 35;
          anchorCandidates.push({ cnd, v });
        }
      }
    }
    anchorCandidates.sort((a, b) => b.v - a.v);
    if (anchorCandidates.length > 0) {
      const pickIdx =
        vIdx === 4 && anchorCandidates.length > 2
          ? 2
          : vIdx === 1 && anchorCandidates.length > 1
            ? 1
            : 0;
      const anchor = anchorCandidates[pickIdx].cnd;
      cur.push(anchor);
      addPieceToFlow(anchor);
    }
  }

  // Lan tỏa mạng lưới lấp kín ma trận (nhanh & tuân thủ nghiêm giới hạn chiêu chủ động + tỉ lệ Tâm Pháp)
  const rndG = createMulberry32(1000 + vIdx * 7919);
  const skillCapG =
    S.hbMaxSkills !== undefined && S.hbMaxSkills > 0
      ? S.hbMaxSkills
      : mode === "tu"
        ? 2
        : S.hbRatio && S.hbRatio.t >= 0.6
          ? 3
          : 4;
  let curS = quick(cur);
  for (let round = 0; round < 48; round++) {
    const topChoices = [];
    const curActiveSkills = cur.reduce((acc, p) => {
      const itP = c.items.get(p.m.item);
      return (
        acc + (itP && itP.chieu && (itP.chieu.phi || 0) > 0 ? 1 : 0)
      );
    }, 0);

    for (const id of Object.keys(cand)) {
      if (cur.some((p) => p.m.item === id)) continue;
      const itCnd = c.items.get(id);
      const isCostSkill = !!(
        itCnd &&
        itCnd.chieu &&
        (itCnd.chieu.phi || 0) > 0
      );
      if (skillCapG > 0 && curActiveSkills >= skillCapG && isCostSkill)
        continue;
      const acPrio = acupointPriority(itCnd, mode, bBuild);
      const isNonScaling = acPrio <= 20;

      // Tiền lọc tối đa 8 vị trí tốt nhất của mỗi món để tăng tốc độ lan tỏa
      const validForItem = [];
      for (const cnd of cand[id]) {
        if ((usedMask & cnd.cellMask) !== 0n) continue;
        const canConnect =
          cnd.touchesDanDien ||
          (flowMask & cnd.cellMask) !== 0n ||
          (flowMask & cnd.adjMask) !== 0n;
        if (!canConnect && !S.full) continue;

        // Tránh đặt mảnh không nhân hệ số đè lên Huyệt Đạo ở những vòng đầu
        if (isNonScaling && cnd.hyCount > 0 && round < 12) continue;

        const preSc =
          cnd.hyCount * (isNonScaling ? -25 : acPrio * 0.4 + 45) +
          cnd.exactMauMult * 30 +
          (cnd.isCP ? cnd.adj.length * 2.5 : 0) -
          (cnd.causesCellNghich && S.dir !== "ma" ? 55 : 0);
        validForItem.push({ cnd, preSc });
      }
      if (!validForItem.length) continue;
      validForItem.sort((a, b) => b.preSc - a.preSc);
      const limitK = vIdx === 4 ? 4 : 3;

      for (let k = 0; k < Math.min(limitK, validForItem.length); k++) {
        const cnd = validForItem[k].cnd;
        let v = quick([...cur, cnd]);
        if (vIdx === 2 && cur.length > 0) {
          // Chiến lược 2: Thưởng đậm cho tương sinh trực tiếp vào mảnh chủ lực đầu tiên
          const carry = cur[0];
          const itCarry = c.items.get(carry.m.item);
          const syn = calcPairCellSynergy(cnd, itCnd, carry, itCarry);
          v += syn.aGenB * 65;
        } else if (vIdx === 3) {
          // Chiến lược 3: Thưởng mật độ diện tích ô để xếp kín khít các mảnh lớn
          v += cnd.cells.length * 8;
        }
        topChoices.push({ v, cnd });
      }
    }

    if (!topChoices.length) break;
    topChoices.sort((a, b) => b.v - a.v);
    const best =
      vIdx === 4 && topChoices.length > 1 && rndG() < 0.35
        ? topChoices[1].v > curS
          ? topChoices[1]
          : topChoices[0]
        : topChoices[0];

    if (!best || best.v <= curS - 2.0) break;
    cur.push(best.cnd);
    addPieceToFlow(best.cnd);
    curS = best.v;
    if (round % 4 === 0) await sleep0();
  }

  return cur.map((p) => ({ ...p.m }));
}

// Tối ưu hóa luyện kim Simulated Annealing 4.0:
// Tích hợp LNS Ruin & Recreate, Displace & Insert (Ejection Chain), Acupoint Promotion & Per-Cell Synergy
async function anneal({
  nv0,
  mode,
  iters,
  init,
  onProg,
  label,
  seed: seed0,
  customEval,
}) {
  const enemies = benchEnemies(nv0.canhGioi, nv0.tieuCanhGioi || 0);
  const fastEv = customEval || makeFastEval(nv0, mode);
  const fullEv = customEval || makeEval(nv0, enemies, mode);
  const ev = fastEv;
  const { cand, g } = buildCandidates(nv0);
  const B = biasCtx(nv0, g);
  const bBuild = B ? B.build : null;
  const ids = Object.keys(cand).filter((k) => cand[k].length);
  const hy0 = hySet(g, nv0.kinhMach);
  const ddAdjMask = getDanDienAdjMask(g, nv0.kinhMach.trangThai);
  const hyOf = (cn) =>
    cn.hyCount !== undefined
      ? cn.hyCount
      : cn.cells.filter((x) => hy0.has(x)).length;
  const rnd = createMulberry32(seed0 || 12345);
  const topCandidates = [];
  const pushTopCandidate = (cfg, score) => {
    if (!cfg || !cfg.length) return;
    const k = cfg
      .map((p) => p.key)
      .sort()
      .join("|");
    if (topCandidates.some((x) => x.k === k)) return;
    topCandidates.push({ cfg: cfg.slice(), score, k });
    topCandidates.sort((a, b) => b.score - a.score);
    if (topCandidates.length > 24) topCandidates.pop();
  };

  const getUsedMask = (manh, skip = -1) => {
    let usedMask = 0n;
    for (let i = 0; i < manh.length; i++) {
      if (i !== skip) usedMask |= manh[i].cellMask;
    }
    return usedMask;
  };
  const overlaps = (manh, c, skip = -1) => {
    return (getUsedMask(manh, skip) & c.cellMask) !== 0n;
  };

  const itemsK = C().items;

  const itemWeights = new Map();
  const itemAcPrio = new Map();
  for (const id of ids) {
    const it = itemsK.get(id);
    const pwr = kmItemPower(it, mode);
    const acP = acupointPriority(it, mode, bBuild);
    itemAcPrio.set(id, acP);
    const ph = it.pham_cap || 1;
    let w = Math.pow(ph, 1.85) * 9 + pwr * 0.48 + acP * 0.15;
    if (it.chieu && (it.pham_cap || 1) >= 3) w += 18;
    if (it.linh_luc) w += it.linh_luc * 18;
    if (it.tag && it.tag.includes("nghich")) w += 50;
    if (bBuild && buildMatch(bBuild, it)) {
      w += 40;
      const isCore =
        it.tran_phai ||
        (it.pham_cap || 1) >= 4 ||
        (it.tag || []).includes(bBuild.k);
      if (isCore) w += 55;
    }
    itemWeights.set(id, Math.max(5, w));
  }

  // Tổng số ô Tâm Pháp tối đa thực có trong túi đồ (để không ép tỉ lệ ảo vượt quá túi đồ)
  const totalBagTamCells = ids.reduce((acc, id) => {
    const it = itemsK.get(id);
    return acc + (it && hbCls(it) === "tam" ? hbCells(it) : 0);
  }, 0);

  const pickWeightedFree = (fList, currentPieces) => {
    if (!fList.length) return null;
    if (fList.length === 1) return fList[0];

    let curTamCells = 0,
      curTotCells = 0,
      curSkills = 0,
      estDrain = 0,
      estRegen = 0;
    if (currentPieces && currentPieces.length) {
      for (const p of currentPieces) {
        const itP = itemsK.get(p.m.item);
        if (!itP) continue;
        curTotCells += p.cells.length;
        if (hbCls(itP) === "tam") curTamCells += p.cells.length;
        else if (hbCls(itP) === "bv")
          curTamCells += p.cells.length * 0.35;
        if (itP.linh_luc > 0) {
          estRegen +=
            itP.linh_luc * ((p.hyCount || 0) > 0 ? 2.4 : 1.35);
        }
        if (itP.chieu && (itP.chieu.phi || 0) > 0) {
          curSkills++;
          estDrain +=
            (itP.chieu.phi || 0) /
            Math.max(1, (itP.chieu.hoi || 0) + 1);
        }
      }
    }
    const rawTargetRatio =
      S.hbRatio && S.hbRatio.t != null ? S.hbRatio.t : 0.6;
    const needTam =
      curTotCells === 0 ||
      (curTamCells < totalBagTamCells &&
        curTamCells / curTotCells < rawTargetRatio);
    const needQi = estDrain > estRegen * 0.82;
    const skillCap =
      S.hbMaxSkills !== undefined && S.hbMaxSkills > 0
        ? S.hbMaxSkills
        : rawTargetRatio >= 0.6
          ? 3
          : 4;
    const skillsFull = skillCap > 0 && curSkills >= skillCap;

    let sum = 0;
    const weights = [];
    for (const id of fList) {
      const it = itemsK.get(id);
      let w = itemWeights.get(id) || 5;
      const cls = hbCls(it);
      if (needTam) {
        if (cls === "tam") w *= rawTargetRatio >= 0.68 ? 4.2 : 2.8;
        else if (cls === "bv") w *= 1.6;
      }
      if (needQi && it && (it.linh_luc || 0) > 0) {
        w *= 2.8 + Math.min(2.5, (it.linh_luc || 0) * 0.25);
      }
      if (skillsFull && it && it.chieu && (it.chieu.phi || 0) > 0) {
        w *= 0.015;
      }
      weights.push(w);
      sum += w;
    }
    let rVal = rnd() * sum;
    for (let i = 0; i < fList.length; i++) {
      rVal -= weights[i];
      if (rVal <= 0) return fList[i];
    }
    return fList[fList.length - 1];
  };

  // Hàm định vị mảnh thông minh 4.0: Tính đúng tương sinh từng ô (cellHe), Kinh Lộ (hopKinhLoHe), và giữ Huyệt cho mảnh nhân hệ số
  const smart = (id, currentPieces) => {
    const pool = cand[id] || [];
    if (!pool.length) return null;
    const itSmart = itemsK.get(id);
    const isSkillSmart = !!(
      itSmart &&
      itSmart.chieu &&
      (itSmart.chieu.phi || 0) > 0
    );
    const isBuildSmart = !!(
      bBuild &&
      itSmart &&
      buildMatch(bBuild, itSmart)
    );
    const acPrioSmart = itemAcPrio.get(id) || 0;
    const isNonScalingSmart = acPrioSmart <= 20;

    const curUsedMask = getUsedMask(currentPieces);
    const flowState = computeFlowBitmask(currentPieces, ddAdjMask);
    const reachMask = flowState.reachMask;

    // Mặt nạ các mảnh hiện đang đứt mạch (nếu mảnh mới là CP và chạm cả reachMask lẫn mảnh đứt mạch thì thưởng lớn vì nối thông cầu!)
    let disconnectedMask = 0n;
    for (const p of currentPieces) {
      if ((p.cellMask & reachMask) === 0n) {
        disconnectedMask |= p.cellMask;
      }
    }

    let best = null,
      bs = -1e9;
    for (const c of pool) {
      if ((curUsedMask & c.cellMask) !== 0n) continue;
      const q = hyOf(c);
      const onHuyetSmart = q > 0;
      let hyPref = 0;
      if (q > 0) {
        if (isNonScalingSmart) {
          // Tránh đặt mảnh thuần tốc độ/đột phá (không nhân hệ số) chiếm Huyệt Đạo
          hyPref -= 38 * q;
        } else {
          hyPref += 28 * q + acPrioSmart * 0.32 * (1 + 0.25 * (q - 1));
        }
      }

      let conn = 0;
      const isConnectedNow = (c.cellMask & reachMask) !== 0n;
      if (c.touchesDanDien) {
        conn += c.isCP ? 18.0 : 8.0;
      } else if (isConnectedNow) {
        conn += c.isCP ? 12.0 : 9.0;
      } else {
        conn -= 45.0;
      }

      // Thưởng đặc biệt nếu công pháp này cứu (bắc cầu nối thông) các mảnh đang bị đứt mạch!
      if (
        c.isCP &&
        isConnectedNow &&
        disconnectedMask !== 0n &&
        (c.adjMask & disconnectedMask) !== 0n
      ) {
        conn += 65.0;
      }

      let colorAndNghich = (c.exactMauMult - 0.85) * 42.0;
      if (c.causesCellNghich && S.dir !== "ma") {
        colorAndNghich -= mode === "dot_pha" ? 55.0 : 28.0;
      }

      let synBonus = 0;
      const hsSmart = c.hs || [];
      for (const p of currentPieces) {
        if ((c.adjMask & p.cellMask) === 0n) continue;
        const itP = itemsK.get(p.m.item);
        const syn = calcPairCellSynergy(c, itSmart, p, itP);

        if (S.dir === "tien" || !S.dir) {
          let recvMult = 6.0;
          if (isSkillSmart) recvMult += 6.5;
          if (mode === "burst") recvMult += 7.0;
          if (isBuildSmart) recvMult += 8.0;
          if (onHuyetSmart) recvMult *= 1.65;

          let giveMult = 4.5;
          if (itP && itP.chieu) giveMult += 5.5;
          if ((p.hyCount || 0) > 0) giveMult *= 1.5;
          if (bBuild && itP && buildMatch(bBuild, itP)) giveMult += 6.5;

          const khacPen =
            mode === "dot_pha" || mode === "tu" ? 16.0 : 10.0;
          synBonus +=
            recvMult * syn.bGenA +
            giveMult * syn.aGenB -
            khacPen * (syn.aKhacB + syn.bKhacA);
        } else if (S.dir === "ma") {
          const isNghichA = !!(
            itSmart &&
            itSmart.tag &&
            itSmart.tag.includes("nghich")
          );
          const isNghichB = !!(
            itP &&
            itP.tag &&
            itP.tag.includes("nghich")
          );
          synBonus +=
            (isNghichA ? 14.0 : 6.0) * syn.bKhacA +
            (isNghichB ? 14.0 : 6.0) * syn.aKhacB +
            4.0 * (syn.aGenB + syn.bGenA);
        }

        // Thưởng chuẩn Kinh Lộ (hopKinhLoHe: trùng hệ gốc hoặc tương sinh giữa Công Pháp và Pháp Khí)
        if (!c.isCP && p.isCP && hopKinhLoHe(p.hs, hsSmart)) {
          synBonus += 14.0;
        } else if (c.isCP && !p.isCP && hopKinhLoHe(hsSmart, p.hs)) {
          synBonus += 14.0;
        } else if (c.isCP && p.isCP && hopKinhLoHe(p.hs, hsSmart)) {
          synBonus += 5.5;
        }
      }

      const sc =
        colorAndNghich + conn + hyPref + synBonus + 0.8 * rnd();
      if (sc > bs) {
        bs = sc;
        best = c;
      }
    }
    return best || pool[Math.floor(rnd() * pool.length)];
  };

  let cur = [];
  if (init)
    for (const m of init) {
      const c = (cand[m.item] || []).find(
        (c) => c.m.x === m.x && c.m.y === m.y && c.m.xoay === m.xoay,
      );
      if (c && !overlaps(cur, c)) cur.push(c);
    }
  let curS = ev(cur).s,
    best = cur,
    bestS = curS;
  const T0 = init && init.length ? 22 : 60;
  let stagnantCount = 0;
  let reheatTempBonus = 0;
  pushTopCandidate(best, bestS);

  for (let it = 0; it < iters; it++) {
    if (S.kmAbort) break;
    if (it % 25 === 0) {
      onProg && onProg(it / iters, label);
      await yieldToMain();
    }
    let T = Math.max(0.35, T0 * (1 - it / iters)) + reheatTempBonus;
    if (reheatTempBonus > 0) reheatTempBonus *= 0.94;

    const next = cur.slice();
    const r = rnd();
    const free = () =>
      ids.filter((id) => !next.some((p) => p.m.item === id));

    if (next.length === 0 || r < 0.14) {
      // OP 1: Smart Insert Free Piece
      const f = free();
      if (!f.length) continue;
      const id = pickWeightedFree(f, next);
      const c = smart(id, next);
      if (!c || overlaps(next, c)) continue;
      next.push(c);
    } else if (r < 0.3) {
      // OP 2: Displace & Insert (Ejection Chain) — Đẩy mảnh vướng ra để nhét mảnh xịn vào, rồi xếp lại mảnh bị đẩy!
      const f = free();
      if (!f.length) continue;
      const id = pickWeightedFree(f, next);
      const pool = cand[id] || [];
      if (!pool.length) continue;

      // Chọn 1 vị trí tốt của món mới (ưu tiên phủ huyệt hoặc hợp màu cao, chỉ đè lên tối đa 2 mảnh hiện tại)
      const acP = itemAcPrio.get(id) || 0;
      const goodPlacements = [];
      for (const cnd of pool) {
        let ovCount = 0;
        for (let k = 0; k < next.length; k++) {
          if ((next[k].cellMask & cnd.cellMask) !== 0n) {
            ovCount++;
            if (ovCount > 2) break;
          }
        }
        if (ovCount <= 2) {
          const sc =
            cnd.hyCount * (acP > 20 ? 60 : -15) +
            cnd.exactMauMult * 35 -
            ovCount * 12;
          goodPlacements.push({ cnd, sc });
        }
      }
      if (!goodPlacements.length) continue;
      goodPlacements.sort((a, b) => b.sc - a.sc);
      const pickK = Math.min(5, goodPlacements.length);
      const chosen = goodPlacements[Math.floor(rnd() * pickK)].cnd;

      const evictedIds = [];
      const kept = [];
      for (const p of next) {
        if ((p.cellMask & chosen.cellMask) !== 0n) {
          evictedIds.push(p.m.item);
        } else {
          kept.push(p);
        }
      }
      kept.push(chosen);
      // Lắp lại các mảnh vừa bị đẩy ra (nếu mảnh bị đẩy là chiêu thừa vượt skillCap thì thay bằng Tâm Pháp!)
      const skillCapOp2 =
        S.hbMaxSkills !== undefined && S.hbMaxSkills > 0
          ? S.hbMaxSkills
          : S.hbRatio && S.hbRatio.t >= 0.6
            ? 3
            : 4;
      for (const evId of evictedIds) {
        const itEv = itemsK.get(evId);
        const isEvSkill = !!(
          itEv &&
          itEv.chieu &&
          (itEv.chieu.phi || 0) > 0
        );
        const curSk = kept.reduce((acc, p) => {
          const ip = itemsK.get(p.m.item);
          return (
            acc + (ip && ip.chieu && (ip.chieu.phi || 0) > 0 ? 1 : 0)
          );
        }, 0);
        if (isEvSkill && skillCapOp2 > 0 && curSk >= skillCapOp2) {
          const tamFree = ids.filter((fid) => {
            if (kept.some((p) => p.m.item === fid)) return false;
            const itF = itemsK.get(fid);
            return itF && hbCls(itF) === "tam";
          });
          if (tamFree.length > 0) {
            const tid = pickWeightedFree(tamFree, kept);
            const reT = tid ? smart(tid, kept) : null;
            if (reT && !overlaps(kept, reT)) kept.push(reT);
          }
          continue;
        }
        const reC = smart(evId, kept);
        if (reC && !overlaps(kept, reC)) {
          kept.push(reC);
        }
      }
      next.length = 0;
      next.push(...kept);
    } else if (r < 0.45) {
      // OP 3: Ruin & Recreate (Large Neighborhood Search - LNS) — Giải tỏa cụm 2–3 mảnh kề nhau và tái cấu trúc cục bộ!
      if (next.length < 2) continue;
      const pivotIdx = Math.floor(rnd() * next.length);
      const pivot = next[pivotIdx];
      const removeSet = new Set([pivotIdx]);

      // Tìm các mảnh kề hoặc gần pivot
      const nearList = [];
      for (let k = 0; k < next.length; k++) {
        if (k === pivotIdx) continue;
        const p = next[k];
        const isAdj = (pivot.adjMask & p.cellMask) !== 0n;
        const dist =
          Math.abs(pivot.m.x - p.m.x) + Math.abs(pivot.m.y - p.m.y);
        nearList.push({ k, d: isAdj ? 0 : dist });
      }
      nearList.sort((a, b) => a.d - b.d);
      const ruinCount = Math.min(nearList.length, rnd() < 0.5 ? 1 : 2);
      for (let u = 0; u < ruinCount; u++) {
        removeSet.add(nearList[u].k);
      }

      const rebuilt = next.filter((_, idx) => !removeSet.has(idx));
      const availIds = ids.filter(
        (id) => !rebuilt.some((p) => p.m.item === id),
      );
      // Sắp xếp ngẫu nhiên có trọng số để lấp đầy vùng vừa giải tỏa bằng tổ hợp mảnh mới tối ưu hơn
      const candidatesToPack = [];
      const tempPool = availIds.slice();
      const maxPack = Math.min(tempPool.length, ruinCount + 3);
      for (let u = 0; u < maxPack; u++) {
        const pid = pickWeightedFree(tempPool, rebuilt);
        if (!pid) break;
        candidatesToPack.push(pid);
        const idxRm = tempPool.indexOf(pid);
        if (idxRm >= 0) tempPool.splice(idxRm, 1);
      }
      for (const pid of candidatesToPack) {
        const c = smart(pid, rebuilt);
        if (c && !overlaps(rebuilt, c)) {
          rebuilt.push(c);
        }
      }
      next.length = 0;
      next.push(...rebuilt);
    } else if (r < 0.58) {
      // OP 4: Acupoint Promotion & Carry Upgrade — Đưa mảnh nhân hệ số cao (trong túi hoặc ngoài huyệt) lên thẳng Huyệt Đạo!
      const onHuyetLower = [];
      for (let idx = 0; idx < next.length; idx++) {
        const p = next[idx];
        if ((p.hyCount || 0) > 0) {
          const prio = itemAcPrio.get(p.m.item) || 0;
          onHuyetLower.push({ idx, p, prio });
        }
      }
      // Tìm ứng viên mạnh chưa lên huyệt (cả trên bàn lẫn trong túi)
      const elitePool = [];
      for (let idx = 0; idx < next.length; idx++) {
        const p = next[idx];
        if ((p.hyCount || 0) === 0) {
          const prio = itemAcPrio.get(p.m.item) || 0;
          if (prio > 40) elitePool.push({ id: p.m.item, idx, prio });
        }
      }
      for (const fid of free()) {
        const prio = itemAcPrio.get(fid) || 0;
        if (prio > 40) elitePool.push({ id: fid, idx: -1, prio });
      }

      if (elitePool.length > 0 && onHuyetLower.length > 0) {
        elitePool.sort((a, b) => b.prio - a.prio);
        onHuyetLower.sort((a, b) => a.prio - b.prio);
        const targetElite =
          elitePool[Math.floor(rnd() * Math.min(3, elitePool.length))];
        const targetLower = onHuyetLower[0];

        if (targetElite.prio > targetLower.prio * 1.05) {
          const lowerHyCells = targetLower.p.cells.filter((x) =>
            hy0.has(x),
          );
          const testNext = next.filter(
            (_, idx) =>
              idx !== targetElite.idx && idx !== targetLower.idx,
          );
          const eliteCands = (cand[targetElite.id] || []).filter(
            (cnd) =>
              cnd.cells.some((x) => lowerHyCells.includes(x)) &&
              !overlaps(testNext, cnd),
          );
          if (eliteCands.length > 0) {
            eliteCands.sort(
              (a, b) =>
                b.exactMauMult * b.hyCount - a.exactMauMult * a.hyCount,
            );
            const chosenElite = eliteCands[0];
            const rebuilt = [...testNext, chosenElite];
            const reLower = smart(targetLower.p.m.item, rebuilt);
            if (reLower && !overlaps(rebuilt, reLower)) {
              rebuilt.push(reLower);
            }
            next.length = 0;
            next.push(...rebuilt);
          }
        }
      }
    } else if (r < 0.7) {
      // OP 5: Pairwise Swap — Hoán đổi vùng vị trí giữa 2 mảnh
      if (next.length < 2) continue;
      const i = Math.floor(rnd() * next.length);
      let j = Math.floor(rnd() * next.length);
      if (i === j) j = (j + 1) % next.length;
      const cA = next[i],
        cB = next[j];
      const candA = (cand[cA.m.item] || []).filter(
        (c) =>
          Math.abs(c.m.x - cB.m.x) <= 3 &&
          Math.abs(c.m.y - cB.m.y) <= 3,
      );
      const candB = (cand[cB.m.item] || []).filter(
        (c) =>
          Math.abs(c.m.x - cA.m.x) <= 3 &&
          Math.abs(c.m.y - cA.m.y) <= 3,
      );
      if (candA.length && candB.length) {
        const newB = candA[Math.floor(rnd() * candA.length)];
        const newA = candB[Math.floor(rnd() * candB.length)];
        const testNext = next.filter(
          (_, idx) => idx !== i && idx !== j,
        );
        if (
          !overlaps(testNext, newA) &&
          !overlaps([...testNext, newA], newB)
        ) {
          next[i] = newA;
          next[j] = newB;
        }
      }
    } else if (r < 0.8) {
      // OP 6: In-Place Rotation & Micro-Slide (tối ưu hệ từng ô heTungO và màu ô lân cận)
      const i = Math.floor(rnd() * next.length);
      const c0 = next[i];
      const nb = (cand[c0.m.item] || []).filter(
        (c) =>
          c !== c0 &&
          Math.abs(c.m.x - c0.m.x) <= 2 &&
          Math.abs(c.m.y - c0.m.y) <= 2 &&
          !overlaps(next, c, i),
      );
      if (!nb.length) continue;
      const c = nb[Math.floor(rnd() * nb.length)];
      next[i] = c;
    } else if (r < 0.92) {
      // OP 7: Articulation-Safe Replace & Excess-Skill-to-Tâm-Pháp Pruning
      const skillCapOp7 =
        S.hbMaxSkills !== undefined && S.hbMaxSkills > 0
          ? S.hbMaxSkills
          : S.hbRatio && S.hbRatio.t >= 0.6
            ? 3
            : 4;
      const activeSkillIndices = [];
      const nonCutIndices = [];
      const baseFlow = computeFlowBitmask(next, ddAdjMask);
      for (let k = 0; k < next.length; k++) {
        const itK = itemsK.get(next[k].m.item);
        if (itK && itK.chieu && (itK.chieu.phi || 0) > 0) {
          activeSkillIndices.push(k);
        }
        const fSkip = computeFlowBitmask(next, ddAdjMask, k);
        if (fSkip.deadCount <= baseFlow.deadCount) {
          nonCutIndices.push(k);
        }
      }

      // Nếu đang thừa chiêu chủ động (> skillCapOp7), ưu tiên nhắm thẳng vào các chiêu thừa để đổi sang Tâm Pháp!
      let i;
      if (
        skillCapOp7 > 0 &&
        activeSkillIndices.length > skillCapOp7 &&
        rnd() < 0.85
      ) {
        activeSkillIndices.sort((a, b) => {
          const itA = itemsK.get(next[a].m.item),
            itB = itemsK.get(next[b].m.item);
          return kmItemPower(itA, mode) - kmItemPower(itB, mode);
        });
        i = activeSkillIndices[0];
      } else {
        i =
          nonCutIndices.length > 0 && rnd() < 0.8
            ? nonCutIndices[Math.floor(rnd() * nonCutIndices.length)]
            : Math.floor(rnd() * next.length);
      }

      const f = free();
      const testNext = next.filter((_, idx) => idx !== i);
      if (f.length > 0 && rnd() < 0.75) {
        const id = pickWeightedFree(f, testNext);
        const c = smart(id, testNext);
        if (!c || overlaps(testNext, c)) continue;
        testNext.push(c);
        // Chỉ nhét lại mảnh cũ nếu mảnh cũ KHÔNG làm vượt trần skillCapOp7!
        const oldIt = itemsK.get(next[i].m.item);
        const oldIsSkill = !!(
          oldIt &&
          oldIt.chieu &&
          (oldIt.chieu.phi || 0) > 0
        );
        const newSkCount = testNext.reduce((acc, p) => {
          const ip = itemsK.get(p.m.item);
          return (
            acc + (ip && ip.chieu && (ip.chieu.phi || 0) > 0 ? 1 : 0)
          );
        }, 0);
        if (
          !oldIsSkill ||
          !(skillCapOp7 > 0 && newSkCount >= skillCapOp7)
        ) {
          const cOld = smart(next[i].m.item, testNext);
          if (cOld && !overlaps(testNext, cOld)) testNext.push(cOld);
        } else {
          // Thay vì nhét lại chiêu thừa, nhét thêm 1 Tâm Pháp nữa nếu vừa chỗ!
          const tamPool = free().filter((fid) => {
            if (testNext.some((p) => p.m.item === fid)) return false;
            const itF = itemsK.get(fid);
            return itF && hbCls(itF) === "tam";
          });
          if (tamPool.length > 0) {
            const tid2 = pickWeightedFree(tamPool, testNext);
            const cTam2 = tid2 ? smart(tid2, testNext) : null;
            if (cTam2 && !overlaps(testNext, cTam2))
              testNext.push(cTam2);
          }
        }
        next.length = 0;
        next.push(...testNext);
      } else {
        const id = next[i].m.item;
        const c = smart(id, testNext);
        if (!c || overlaps(testNext, c)) continue;
        next[i] = c;
      }
    } else {
      // OP 8: Connectivity Repair hoặc Prune mảnh lá yếu nhất
      const flowNow = computeFlowBitmask(next, ddAdjMask);
      if (flowNow.deadCount > 0) {
        // Nếu có mảnh đứt mạch, tìm 1 công pháp trong túi bắc cầu hoặc dịch mảnh đứt mạch về vùng thông
        const cpFree = free().filter((id) => {
          const it = itemsK.get(id);
          return it && it.loai === "cong_phap";
        });
        if (cpFree.length > 0) {
          const id = pickWeightedFree(cpFree, next);
          const c = smart(id, next);
          if (c && !overlaps(next, c)) next.push(c);
        } else {
          const deadIdx = next.findIndex(
            (p) => (p.cellMask & flowNow.reachMask) === 0n,
          );
          if (deadIdx >= 0) {
            const id = next[deadIdx].m.item;
            const testNext = next.filter((_, idx) => idx !== deadIdx);
            const c = smart(id, testNext);
            if (c && !overlaps(testNext, c)) testNext.push(c);
            next.length = 0;
            next.push(...testNext);
          }
        }
      } else if (next.length > 1) {
        // Xóa thử 1 mảnh lá không làm đứt mạch
        const leafIndices = [];
        for (let k = 0; k < next.length; k++) {
          const fSkip = computeFlowBitmask(next, ddAdjMask, k);
          if (fSkip.deadCount === 0) leafIndices.push(k);
        }
        const rmIdx = leafIndices.length
          ? leafIndices[Math.floor(rnd() * leafIndices.length)]
          : Math.floor(rnd() * next.length);
        next.splice(rmIdx, 1);
      }
    }

    const e = ev(next);
    if (e.s >= curS || rnd() < Math.exp((e.s - curS) / T)) {
      cur = next;
      curS = e.s;
      if (e.s > bestS) {
        best = next;
        bestS = e.s;
        stagnantCount = 0;
        pushTopCandidate(best, bestS);
      } else {
        stagnantCount++;
      }
    } else {
      stagnantCount++;
    }

    if (stagnantCount >= 40) {
      reheatTempBonus = Math.min(
        T0 * 0.5,
        (T0 * (1 - it / iters) + 6) * 1.5,
      );
      stagnantCount = 0;
    }
  }

  pushTopCandidate(best, bestS);

  // TẦNG 2: Full Simulation trên toàn bộ 24 Top Candidates để chọn cấu hình thực chiến mạnh nhất
  let finalBest = best;
  let finalEval = fullEv(best);
  let finalBestScore = finalEval.s;

  for (const candItem of topCandidates) {
    if (candItem.cfg === best) continue;
    const fullRes = fullEv(candItem.cfg);
    if (fullRes.s > finalBestScore) {
      finalBestScore = fullRes.s;
      finalBest = candItem.cfg;
      finalEval = fullRes;
    }
  }

  return {
    manh: finalBest.map((p) => ({ ...p.m })),
    score: finalEval.s,
    wins: finalEval.wins || 0,
    n: enemies.length,
    P: finalEval.P,
    R: finalEval.R,
  };
}

// Pha lấp đầy thông minh 4.0: Quét sạch các ô trống + Trượt 1 bước (1-Step Slide-and-Pack) để nhét thêm mọi món hợp lệ
function smartFillRemainingGaps(nv0, cur, ev) {
  const K = S.core,
    c = C(),
    g = K.luoiKinhMach(c, nv0);
  const itemsK = c.items;
  const isTayO = !!(AU.cfg && AU.cfg.km && AU.cfg.km.tayO);

  let currentPieces = cur.slice();
  let currentEval = ev(currentPieces);
  let currentScore = currentEval.s;
  let currentWins = currentEval.wins || 0;

  const { cand } = buildCandidates(nv0);
  const allIds = Object.keys(cand).filter((k) => cand[k].length);
  const ddAdjMask = getDanDienAdjMask(g, nv0.kinhMach.trangThai);

  let usedMask = 0n;
  for (const p of currentPieces) {
    usedMask |= p.cellMask;
  }

  const getFlowAccessibleMask = (pieces = currentPieces) => {
    let mask = ddAdjMask;
    for (const p of pieces) {
      if (p.isCP) {
        mask |= p.adjMask;
      }
    }
    return mask;
  };

  let flowMask = getFlowAccessibleMask();

  const skillCapGap =
    S.hbMaxSkills !== undefined && S.hbMaxSkills > 0
      ? S.hbMaxSkills
      : S.hbRatio && S.hbRatio.t >= 0.6
        ? 3
        : 4;

  const isDrainSafe = (P) => {
    if (!P) return true;
    const cList = (P.chieu || []).filter((x) => (x.phi || 0) > 0);
    if (!cList.length) return true;
    if (skillCapGap > 0 && cList.length > skillCapGap) return false;
    const ll = P.linhLucMoiLuot || 0;
    let drain = 0;
    for (const sk of cList) {
      drain += (sk.phi || 0) / Math.max(1, (sk.hoi || 0) + 1);
    }
    return ll >= drain;
  };

  // Vòng 1: Lấp trực tiếp các món vừa khít vào ô trống (Ưu tiên tuyệt đối Tâm Pháp hồi Linh Lực & bị động, cấm nhồi thừa chiêu gây thiếu khí!)
  for (let pass = 0; pass < 24; pass++) {
    const placedItemIds = new Set(currentPieces.map((p) => p.m.item));
    const curActiveSkills = currentPieces.reduce((acc, p) => {
      const itP = itemsK.get(p.m.item);
      return (
        acc + (itP && itP.chieu && (itP.chieu.phi || 0) > 0 ? 1 : 0)
      );
    }, 0);
    const remainingIds = allIds.filter((id) => {
      if (placedItemIds.has(id)) return false;
      const it = itemsK.get(id);
      if (
        skillCapGap > 0 &&
        curActiveSkills >= skillCapGap &&
        it &&
        it.chieu &&
        (it.chieu.phi || 0) > 0
      ) {
        return false;
      }
      return true;
    });
    if (!remainingIds.length) break;

    remainingIds.sort((a, b) => {
      const itA = itemsK.get(a),
        itB = itemsK.get(b);
      const tamBonusA =
        (hbCls(itA) === "tam" ? 180 : hbCls(itA) === "bv" ? 90 : 0) +
        (itA.linh_luc || 0) * 65;
      const tamBonusB =
        (hbCls(itB) === "tam" ? 180 : hbCls(itB) === "bv" ? 90 : 0) +
        (itB.linh_luc || 0) * 65;
      return (
        kmItemPower(itB) + tamBonusB - (kmItemPower(itA) + tamBonusA)
      );
    });

    let bestCandidate = null;
    let bestCandidateScore = -1e9;
    let bestCandidateEval = null;

    for (const id of remainingIds) {
      const pool = cand[id] || [];
      const sortedCandidates = pool
        .filter((cnd) => (usedMask & cnd.cellMask) === 0n)
        .filter(
          (cnd) =>
            cnd.touchesDanDien ||
            (flowMask & cnd.cellMask) !== 0n ||
            (flowMask & cnd.adjMask) !== 0n,
        )
        .sort((a, b) => {
          const scA =
            a.hyCount * 40 +
            a.exactMauMult * 25 -
            (a.causesCellNghich ? 35 : 0) -
            (isTayO ? a.unfixableCount * 15 : a.conflictCount * 8);
          const scB =
            b.hyCount * 40 +
            b.exactMauMult * 25 -
            (b.causesCellNghich ? 35 : 0) -
            (isTayO ? b.unfixableCount * 15 : b.conflictCount * 8);
          return scB - scA;
        })
        .slice(0, 32);

      for (const cnd of sortedCandidates) {
        const testPieces = [...currentPieces, cnd];
        const nextEval = ev(testPieces);

        const lastIdx = testPieces.length - 1;
        const isThong =
          nextEval.R &&
          nextEval.R.manh &&
          nextEval.R.manh[lastIdx] &&
          nextEval.R.manh[lastIdx].thong;

        if (!isThong) continue;
        const itCndObj = itemsK.get(cnd.id);
        if (
          itCndObj &&
          itCndObj.chieu &&
          (itCndObj.chieu.phi || 0) > 0 &&
          !isDrainSafe(nextEval.P)
        ) {
          continue;
        }

        const isScoreBetter = nextEval.s > currentScore + 1e-4;
        const isSideStatBetter =
          (nextEval.wins || 0) >= currentWins &&
          nextEval.s >= currentScore - 3.0 &&
          ((nextEval.P?.linhLucMoiLuot || 0) >
            (currentEval.P?.linhLucMoiLuot || 0) ||
            (nextEval.P?.khiHuyetToiDa || 0) >
              (currentEval.P?.khiHuyetToiDa || 0) ||
            (nextEval.R?.biDong?.toc_do || 0) >
              (currentEval.R?.biDong?.toc_do || 0) ||
            (nextEval.R?.biDong?.dot_pha || 0) >
              (currentEval.R?.biDong?.dot_pha || 0));

        if (isScoreBetter || isSideStatBetter) {
          const evalDiff = nextEval.s - currentScore;
          if (evalDiff > bestCandidateScore) {
            bestCandidateScore = evalDiff;
            bestCandidate = cnd;
            bestCandidateEval = nextEval;
          }
        }
      }

      if (bestCandidate) break;
    }

    if (!bestCandidate) break;

    currentPieces.push(bestCandidate);
    usedMask |= bestCandidate.cellMask;
    flowMask = getFlowAccessibleMask();
    currentScore = bestCandidateEval.s;
    currentWins = bestCandidateEval.wins || 0;
    currentEval = bestCandidateEval;
  }

  // Vòng 2: 1-Step Slide-and-Pack — Trượt nhẹ 1 mảnh đang đặt sang ô trống kề bên để mở chỗ nhét thêm 1 món mới từ túi!
  for (let slidePass = 0; slidePass < 6; slidePass++) {
    const placedItemIds = new Set(currentPieces.map((p) => p.m.item));
    const curActiveSlide = currentPieces.reduce((acc, p) => {
      const itP = itemsK.get(p.m.item);
      return (
        acc + (itP && itP.chieu && (itP.chieu.phi || 0) > 0 ? 1 : 0)
      );
    }, 0);
    const remainingIds = allIds
      .filter((id) => {
        if (placedItemIds.has(id)) return false;
        const it = itemsK.get(id);
        if (
          skillCapGap > 0 &&
          curActiveSlide >= skillCapGap &&
          it &&
          it.chieu &&
          (it.chieu.phi || 0) > 0
        ) {
          return false;
        }
        return true;
      })
      .sort(
        (a, b) =>
          kmItemPower(itemsK.get(b)) - kmItemPower(itemsK.get(a)),
      )
      .slice(0, 8);
    if (!remainingIds.length) break;

    let slideImproved = false;
    for (const newId of remainingIds) {
      const newPool = (cand[newId] || []).slice(0, 45);
      for (const newCnd of newPool) {
        // Tìm mảnh duy nhất đang bị chồng lấn với newCnd
        let ovIdx = -1,
          ovCount = 0;
        for (let i = 0; i < currentPieces.length; i++) {
          if ((currentPieces[i].cellMask & newCnd.cellMask) !== 0n) {
            ovIdx = i;
            ovCount++;
            if (ovCount > 1) break;
          }
        }
        if (ovCount !== 1 || ovIdx < 0) continue;

        const movingPiece = currentPieces[ovIdx];
        const maskWithoutMoving =
          (usedMask & ~movingPiece.cellMask) | newCnd.cellMask;
        const altMoves = (cand[movingPiece.m.item] || []).filter(
          (alt) =>
            alt !== movingPiece &&
            (alt.cellMask & maskWithoutMoving) === 0n &&
            Math.abs(alt.m.x - movingPiece.m.x) <= 3 &&
            Math.abs(alt.m.y - movingPiece.m.y) <= 3,
        );
        if (!altMoves.length) continue;

        for (let k = 0; k < Math.min(8, altMoves.length); k++) {
          const testPieces = currentPieces.slice();
          testPieces[ovIdx] = altMoves[k];
          testPieces.push(newCnd);
          const flowCheck = computeFlowBitmask(testPieces, ddAdjMask);
          if (flowCheck.deadCount > 0) continue;

          const nextEval = ev(testPieces);
          if (
            nextEval.s > currentScore + 0.5 &&
            (nextEval.wins || 0) >= currentWins
          ) {
            currentPieces = testPieces;
            usedMask = 0n;
            for (const p of currentPieces) usedMask |= p.cellMask;
            flowMask = getFlowAccessibleMask();
            currentScore = nextEval.s;
            currentWins = nextEval.wins || 0;
            currentEval = nextEval;
            slideImproved = true;
            break;
          }
        }
        if (slideImproved) break;
      }
      if (slideImproved) break;
    }
    if (!slideImproved) break;
  }

  return currentPieces;
}

// Tinh chỉnh cuối (Leo Đồi Chuyên Sâu 4.0): Xoay, Dịch toàn bản đồ, Hoán đổi mọi cặp Huyệt/Kề, Thay thế Đồ Trong Túi & Lấp Kín Khe Hở
async function polish(nv0, mode, res, onProg, customEval) {
  const isTayO = !!(AU.cfg && AU.cfg.km && AU.cfg.km.tayO);
  const enemies = benchEnemies(nv0.canhGioi, nv0.tieuCanhGioi || 0),
    ev = customEval || makeEval(nv0, enemies, mode);
  const { cand, g } = buildCandidates(nv0),
    ids = Object.keys(cand).filter((k) => cand[k].length);
  const itemsK = C().items;
  const ddAdjMask = getDanDienAdjMask(g, nv0.kinhMach.trangThai);
  const toP = (m) =>
    (cand[m.item] || []).find(
      (c) => c.m.x === m.x && c.m.y === m.y && c.m.xoay === m.xoay,
    );
  const overl = (arr, cn, skip = -1) => {
    let usedMask = 0n;
    for (let i = 0; i < arr.length; i++) {
      if (i !== skip) usedMask |= arr[i].cellMask;
    }
    return (usedMask & cn.cellMask) !== 0n;
  };
  let cur = res.manh.map(toP).filter(Boolean),
    curS = ev(cur).s;
  const t0 = Date.now(),
    over = () => Date.now() - t0 > 25000 || S.kmAbort;

  for (let round = 0; round < 6 && !over(); round++) {
    let improved = false;
    onProg && onProg(round / 6);

    // 1. Xoay & Dịch chuyển vi mô từng mảnh tại chỗ
    for (let i = 0; i < cur.length && !over(); i++) {
      const c0 = cur[i];
      const rots = (cand[c0.m.item] || []).filter(
        (c) =>
          c !== c0 &&
          Math.abs(c.m.x - c0.m.x) <= 2 &&
          Math.abs(c.m.y - c0.m.y) <= 2 &&
          !overl(cur, c, i),
      );
      for (const cn of rots) {
        const nx = cur.slice();
        nx[i] = cn;
        if (computeFlowBitmask(nx, ddAdjMask).deadCount > 0) continue;
        const e = ev(nx);
        if (e.s > curS + 1e-9) {
          cur = nx;
          curS = e.s;
          improved = true;
          break;
        }
      }
      await yieldToMain();
    }

    // 2. Dịch chuyển toàn bản đồ cho từng mảnh
    for (let i = 0; i < cur.length && !over(); i++) {
      const cands = (cand[cur[i].m.item] || [])
        .filter((cn) => cn !== cur[i] && !overl(cur, cn, i))
        .sort((a, b) => {
          const scA =
            a.hyCount * 40 +
            a.exactMauMult * 25 -
            (a.causesCellNghich ? 35 : 0) -
            (isTayO ? a.unfixableCount * 15 : a.conflictCount * 8);
          const scB =
            b.hyCount * 40 +
            b.exactMauMult * 25 -
            (b.causesCellNghich ? 35 : 0) -
            (isTayO ? b.unfixableCount * 15 : b.conflictCount * 8);
          return scB - scA;
        })
        .slice(0, 32);

      for (const cn of cands) {
        const nx = cur.slice();
        nx[i] = cn;
        if (computeFlowBitmask(nx, ddAdjMask).deadCount > 0) continue;
        const e = ev(nx);
        if (e.s > curS + 1e-9) {
          cur = nx;
          curS = e.s;
          improved = true;
        }
      }
      await yieldToMain();
    }

    // 3. Hoán đổi toàn diện các cặp mảnh (ưu tiên cặp có Huyệt Đạo hoặc kề nhau)
    if (cur.length >= 2 && !over()) {
      for (let i = 0; i < cur.length && !over(); i++) {
        for (let j = i + 1; j < cur.length && !over(); j++) {
          const cA = cur[i],
            cB = cur[j];
          const isRelevantPair =
            (cA.hyCount || 0) > 0 ||
            (cB.hyCount || 0) > 0 ||
            (cA.adjMask & cB.cellMask) !== 0n;
          if (!isRelevantPair && round > 1) continue;

          const testCur = cur.filter(
            (_, idx) => idx !== i && idx !== j,
          );
          const baseMask = testCur.reduce(
            (acc, p) => acc | p.cellMask,
            0n,
          );
          const candAAtB = (cand[cA.m.item] || [])
            .filter(
              (c) =>
                (c.cellMask & baseMask) === 0n &&
                Math.abs(c.m.x - cB.m.x) <= 2 &&
                Math.abs(c.m.y - cB.m.y) <= 2,
            )
            .slice(0, 8);
          const candBAtA = (cand[cB.m.item] || [])
            .filter(
              (c) =>
                (c.cellMask & baseMask) === 0n &&
                Math.abs(c.m.x - cA.m.x) <= 2 &&
                Math.abs(c.m.y - cA.m.y) <= 2,
            )
            .slice(0, 8);

          let pairSwapped = false;
          for (const nB of candAAtB) {
            for (const nA of candBAtA) {
              if ((nA.cellMask & nB.cellMask) !== 0n) continue;
              const nx = cur.slice();
              nx[i] = nA;
              nx[j] = nB;
              if (computeFlowBitmask(nx, ddAdjMask).deadCount > 0)
                continue;
              const e = ev(nx);
              if (e.s > curS + 1e-9) {
                cur = nx;
                curS = e.s;
                improved = true;
                pairSwapped = true;
                break;
              }
            }
            if (pairSwapped) break;
          }
        }
        await yieldToMain();
      }
    }

    // 4. Thay thế mảnh đang đặt bằng mảnh tốt hơn còn dư trong túi (Ưu tiên đổi chiêu thừa/ngốn mana sang Tâm Pháp hồi Linh Lực!)
    if (!over()) {
      const placedSet = new Set(cur.map((p) => p.m.item));
      const allUnplaced = ids.filter((id) => !placedSet.has(id));
      const topGen = allUnplaced
        .slice()
        .sort(
          (a, b) =>
            kmItemPower(itemsK.get(b), mode) -
            kmItemPower(itemsK.get(a), mode),
        )
        .slice(0, 10);
      const topTam = allUnplaced
        .filter((id) => {
          const it = itemsK.get(id);
          return it && (hbCls(it) === "tam" || (it.linh_luc || 0) > 0);
        })
        .sort((a, b) => {
          const itA = itemsK.get(a),
            itB = itemsK.get(b);
          return (
            (itB.linh_luc || 0) * 60 +
            kmItemPower(itB, mode) -
            ((itA.linh_luc || 0) * 60 + kmItemPower(itA, mode))
          );
        })
        .slice(0, 10);
      const unplacedIds = [...new Set([...topTam, ...topGen])];

      for (let i = 0; i < cur.length && !over(); i++) {
        const oldP = cur[i];
        const maskWithoutI = cur.reduce(
          (acc, p, idx) => (idx === i ? acc : acc | p.cellMask),
          0n,
        );
        for (const uid of unplacedIds) {
          if (cur.some((p) => p.m.item === uid)) continue;
          const topForUid = (cand[uid] || [])
            .filter(
              (c) =>
                (c.cellMask & maskWithoutI) === 0n &&
                Math.abs(c.m.x - oldP.m.x) <= 3 &&
                Math.abs(c.m.y - oldP.m.y) <= 3,
            )
            .sort(
              (a, b) =>
                b.hyCount * 40 +
                b.exactMauMult * 25 -
                (a.hyCount * 40 + a.exactMauMult * 25),
            )
            .slice(0, 6);

          let upgraded = false;
          for (const newC of topForUid) {
            let nx = cur.slice();
            nx[i] = newC;
            if (computeFlowBitmask(nx, ddAdjMask).deadCount > 0)
              continue;
            // Nếu thay 1 mảnh lớn bằng 1 Tâm Pháp gọn hơn, lấp luôn khoảng trống dư ra bằng Tâm Pháp khác trước khi chấm điểm!
            nx = smartFillRemainingGaps(nv0, nx, ev);
            const e = ev(nx);
            if (e.s > curS + 1e-9) {
              cur = nx;
              curS = e.s;
              improved = true;
              upgraded = true;
              break;
            }
          }
          if (upgraded) break;
        }
      }
      await yieldToMain();
    }

    // 5. Lấp kín các ô trống mở ra sau mỗi vòng tinh chỉnh
    const packed = smartFillRemainingGaps(nv0, cur, ev);
    if (packed.length !== cur.length) {
      const ePack = ev(packed);
      if (ePack.s >= curS - 1e-4) {
        cur = packed;
        curS = ePack.s;
        improved = true;
      }
    }

    if (!improved) break;
  }

  // Lấp kín lần cuối bằng Smart Gap-Packing
  cur = smartFillRemainingGaps(nv0, cur, ev);

  const e = ev(cur);
  return {
    manh: cur.map((p) => ({ ...p.m })),
    score: e.s,
    wins: e.wins || 0,
    n: enemies.length,
    P: e.P,
    R: e.R,
  };
}

// Xếp Full Ô
function fillRest(nv, res, mode) {
  const K = S.core,
    c = C(),
    nv0 = clone(nv);
  nv0.kinhMach.manh = [];
  const { cand, g } = buildCandidates(nv0);
  const manh = res.manh.map((m) => ({ ...m }));
  const used = new Set();
  manh.forEach((m) =>
    (K.oCuaManh(g, m, c.items.get(m.item)) || []).forEach((x) =>
      used.add(x),
    ),
  );
  for (let guard = 0; guard < 60; guard++) {
    let best = null;
    for (const id of Object.keys(cand)) {
      if (manh.some((m) => m.item === id)) continue;
      for (const cn of cand[id]) {
        if (cn.cells.some((x) => used.has(x))) continue;
        const score =
          cn.cells.length * 10 +
          (cn.touchesDanDien ? 15 : 0) +
          (cn.hyCount ? 8 : 0);
        if (!best || score > best.score) best = { cn, score };
      }
    }
    if (!best) break;
    manh.push({ ...best.cn.m });
    best.cn.cells.forEach((x) => used.add(x));
  }
  if (manh.length === res.manh.length) return res;
  const nv3 = clone(nv);
  nv3.kinhMach.manh = manh;
  return { ...evalCurrent(nv3, mode), manh };
}

// Thống kê độ phủ lưới: số ô đã phủ / số ô có thể phủ bằng các món đang có trong túi.
function coverNote(nv, best) {
  try {
    const K = S.core,
      c = C(),
      nv0 = clone(nv);
    nv0.kinhMach.manh = [];
    const { cand, g } = buildCandidates(nv0),
      tot = new Set();
    for (const id of Object.keys(cand))
      for (const cn of cand[id]) cn.cells.forEach((x) => tot.add(x));
    const used = new Set();
    best.manh.forEach((m) =>
      (K.oCuaManh(g, m, c.items.get(m.item)) || []).forEach((x) =>
        used.add(x),
      ),
    );
    for (const x of used) tot.add(x);
    const pct =
      tot.size > 0 ? Math.round((used.size / tot.size) * 100) : 100;
    return `<div class="vk-mu" style="font-size:12px;margin-top:6px">Độ phủ lưới: <b>${used.size}/${tot.size}</b> ô (<b>${pct}%</b>)${used.size < tot.size ? " · túi chưa đủ món vừa hình để lấp hết ô còn lại" : " · đã lấp đầy hoàn hảo"}.</div>`;
  } catch (e) {
    return "";
  }
}

function stripDead(nv, res, mode) {
  if (S.full) return fillRest(nv, res, mode);
  const sigOf = (arr) =>
    (arr || [])
      .map((m) => `${m.item}:${m.x},${m.y},${m.xoay}`)
      .sort()
      .join("|");
  const origSig = sigOf(res.manh);
  let manh = res.manh.slice();
  for (let k = 0; k < 5; k++) {
    const nv2 = clone(nv);
    nv2.kinhMach.manh = manh;
    const R = S.core.tinhKinhMach(nv2, C());
    const keep = manh.filter((m, i) => R.manh[i] && R.manh[i].thong);
    if (keep.length === manh.length) break;
    manh = keep;
  }

  // Đóng kín các khe hở mở ra sau khi lọc mảnh chết bằng Smart Gap-Packing
  try {
    const enemies = benchEnemies(nv.canhGioi, nv.tieuCanhGioi || 0);
    const ev = makeEval(nv, enemies, mode);
    const { cand } = buildCandidates(nv);
    const toP = (m) =>
      (cand[m.item] || []).find(
        (c) => c.m.x === m.x && c.m.y === m.y && c.m.xoay === m.xoay,
      );
    let curPieces = manh.map(toP).filter(Boolean);
    curPieces = smartFillRemainingGaps(nv, curPieces, ev);
    manh = curPieces.map((p) => ({ ...p.m }));
  } catch (e) {}

  if (sigOf(manh) === origSig) return res;
  const nv3 = clone(nv);
  nv3.kinhMach.manh = manh;
  return { ...evalCurrent(nv3, mode), manh };
}
function evalCurrent(nv, mode) {
  const Kc = S.core,
    Cc2 = C();
  const R_real = Kc.tinhKinhMach(nv, Cc2);
  const P_real = Kc.taoBenTa(nv, Cc2);
  const speed_real = Kc.tocDoTuLuyen ? Kc.tocDoTuLuyen(nv, Cc2) : null;

  const enemies = benchEnemies(nv.canhGioi, nv.tieuCanhGioi || 0);
  const ev = makeEval(
    { ...clone(nv), kinhMach: { ...clone(nv.kinhMach), manh: [] } },
    enemies,
    mode,
  );
  const g2 = Kc.luoiKinhMach(Cc2, nv);
  const manh = (nv.kinhMach.manh || []).map((m) => ({
    m,
    key: m.item + ":" + m.x + "," + m.y + "," + m.xoay,
    cells: Kc.oCuaManh(g2, m, Cc2.items.get(m.item)) || [],
  }));
  const e = ev(manh);

  // Tính số trận thắng theo đúng chỉ số thực P_real của nhân vật
  let realWins = 0;
  for (const { E } of enemies) {
    const r = fight(P_real, E);
    if (r.thang) realWins++;
  }

  return {
    manh: clone(nv.kinhMach.manh),
    score: e.s,
    wins: realWins,
    n: enemies.length,
    P: P_real,
    R: R_real,
    speed: speed_real,
    simP: e.P,
    simR: e.R,
  };
}

// ───────────────────────── 5. Vẽ kinh mạch ─────────────────────────
const BASE = {
  thuy: ["#3f6fb5", "#5a8fd6", "#2c5592", "#6f9fd0"],
  bang: ["#5fb8c9", "#86cfdc", "#3e9db0"],
  vo_sac: ["#7d7a76", "#9a958e", "#5f5c58"],
  hoa: ["#c0392b", "#d9622b", "#a8321f"],
  tho: ["#8a6a2e", "#a07a3a", "#6e5524"],
  kim: ["#c9a227", "#8f7a2a", "#e0b84a", "#a8892c", "#d4a017"],
  moc: ["#3f8f4a", "#5aa865", "#2f6f38"],
  loi: ["#7a4fb5", "#9a6fd0"],
  phong: ["#3fa08f", "#5cbfae"],
  am: ["#4a3a6a", "#5d4a82"],
};
const TINT = {
  thuy: "#cfdcef",
  bang: "#d3ecf0",
  vo_sac: "#dcd6cc",
  hoa: "#efc2b4",
  kim: "#f1e3b0",
  tho: "#e3d2b0",
  moc: "#cfe6c8",
  loi: "#d6c6f3",
  phong: "#cdebe5",
  am: "#d9d0e4",
};

// Chữ Hán của hệ trong game (CHn): hiện ở góc ô để khỏi nhầm các màu gần nhau (Lôi / Ám, Mộc / Phong, Thủy / Băng).
const HE_HAN = {
  kim: "金",
  moc: "木",
  thuy: "水",
  hoa: "火",
  tho: "土",
  loi: "雷",
  bang: "冰",
  phong: "風",
  am: "暗",
  vo_sac: "無",
};

// Đường nối kinh lộ vẽ đúng như game (thành phần q6n): từ đan điền → tâm món thông đầu tiên → tâm món kế tiếp.
// Mỗi món thông có R.manh[i].nguon = { manh: món nguồn (-1 = đan điền), tu: ô bên nguồn, den: ô bên món này }.
// Tâm món = ô gần trọng tâm nhất (hàm SL); trong một món đường đi theo các ô kề nhau (BFS) từ tâm tới ô chạm.
// cells[i] = ô của món i; isCP(i) = món i có phải tâm pháp / đấu pháp (chỉ loại này mới truyền mạch).
function linkPaths(g, cells, R, isCP) {
  const nb = (i) => {
    const x = i % g.rong,
      y = Math.floor(i / g.rong),
      a = [];
    if (x > 0) a.push(i - 1);
    if (x < g.rong - 1) a.push(i + 1);
    if (y > 0) a.push(i - g.rong);
    if (y < g.cao - 1) a.push(i + g.rong);
    return a.filter((o) => g.vung[o] >= 0);
  };
  const anchor = (cs) => {
    const pts = cs.map((q) => [
      (q % g.rong) + 0.5,
      Math.floor(q / g.rong) + 0.5,
    ]);
    const mx = pts.reduce((a, p) => a + p[0], 0) / pts.length,
      my = pts.reduce((a, p) => a + p[1], 0) / pts.length;
    let b = 0,
      bd = Infinity;
    pts.forEach((p, k) => {
      const dd = (p[0] - mx) ** 2 + (p[1] - my) ** 2;
      if (dd < bd) {
        bd = dd;
        b = k;
      }
    });
    return cs[b];
  };
  const walk = (cs, from, to) => {
    const set = new Set(cs),
      prev = new Map([[from, -1]]),
      q = [from];
    while (q.length && !prev.has(to)) {
      const y = q.shift();
      for (const f of nb(y))
        if (set.has(f) && !prev.has(f)) {
          prev.set(f, y);
          q.push(f);
        }
    }
    if (!prev.has(to)) return [from, to];
    const out = [];
    for (let y = to; y >= 0; y = prev.get(y)) out.unshift(y);
    return out;
  };
  const rm = (i) => (R && R.manh && R.manh[i]) || null;
  const nguon = cells.map((_, i) => {
    const r = rm(i);
    return r && r.thong && r.nguon ? r.nguon : null;
  });
  if (!nguon.some(Boolean) && R && R.manh) {
    // Phòng hờ nếu game đổi tên trường nguon: dựng lại bằng BFS từ đan điền qua các món thông kề nhau (cùng thứ tự duyệt như game).
    const owner = new Map();
    cells.forEach((cs, i) => cs.forEach((q) => owner.set(q, i)));
    const touch = (L, I) => {
      for (const B of cells[I])
        for (const U of nb(B))
          if (L < 0 ? U === g.danDien : owner.get(U) === L)
            return { manh: L, tu: U, den: B };
      return null;
    };
    const th = (i) => !!(rm(i) && rm(i).thong && isCP(i));
    const q = [];
    cells.forEach((_, i) => {
      const t = th(i) && touch(-1, i);
      if (t) {
        nguon[i] = t;
        q.push(i);
      }
    });
    while (q.length) {
      const L = q.shift();
      cells.forEach((_, I) => {
        if (nguon[I] || !th(I)) return;
        const t = touch(L, I);
        if (t) {
          nguon[I] = t;
          q.push(I);
        }
      });
    }
  }
  const seen = new Set(),
    segs = [],
    dots = [];
  cells.forEach((cs, i) => {
    const ng = nguon[i];
    if (!ng || !cs.length) return;
    const p = anchor(cs),
      src =
        ng.manh >= 0 && cells[ng.manh] && cells[ng.manh].length
          ? cells[ng.manh]
          : null;
    const seq = [
      ...(src ? walk(src, anchor(src), ng.tu) : [g.danDien]),
      ...walk(cs, ng.den, p),
    ];
    for (let y = 1; y < seq.length; y++) {
      const a = seq[y - 1],
        b = seq[y],
        key = a < b ? a + "-" + b : b + "-" + a;
      if (!seen.has(key)) {
        seen.add(key);
        segs.push([a, b]);
      }
    }
    dots.push(p);
  });
  return { segs, dots };
}

function drawGrid(nv, manh, mark) {
  const K = S.core,
    c = C();
  const nv2 = clone(nv);
  nv2.kinhMach.manh = manh;
  const g = K.luoiKinhMach(c, nv2),
    km = nv2.kinhMach;
  const hy = hySet(g, km); // vị trí huyệt thật của kiếp này (huyetGoc + huyetThem), không phải huyệt gốc của khuôn
  const own = {},
    cols = [],
    used = {},
    pieces = [];
  const R = K.tinhKinhMach(nv2, c);
  manh.forEach((m, n) => {
    const it = c.items.get(m.item);
    const he = (it.he || ["vo_sac"])[0];
    const pal = BASE[he] || ["#888"];
    cols.push(pal[(used[he] = (used[he] || 0) + 1) % pal.length]);
    const cells = K.oCuaManh(g, m, it) || [];
    cells.forEach((x) => (own[x] = n));
    const rm = R.manh[n];
    pieces.push({
      it,
      cells,
      thong: rm ? rm.thong : false,
      heSo: rm ? rm.heSo : 0,
      onHuyet: cells.some((x) => hy.has(x)),
    });
  });
  const inGrid = (i) => g.vung[i] >= 0; // ô ngoài khuôn thể chất (dấu "." trong khuôn) không phải ô kinh mạch: không vẽ
  // chỉ vẽ vùng có ô mở (kèm một vòng ô ẩn viền quanh như game)
  let x0 = 99,
    y0 = 99,
    x1 = -1,
    y1 = -1;
  for (let i = 0; i < g.rong * g.cao; i++)
    if (
      inGrid(i) &&
      (km.trangThai[i] !== "an" || own[i] !== undefined)
    ) {
      const x = i % g.rong,
        y = Math.floor(i / g.rong);
      x0 = Math.min(x0, x);
      y0 = Math.min(y0, y);
      x1 = Math.max(x1, x);
      y1 = Math.max(y1, y);
    }
  if (x1 < 0) {
    x0 = x1 = g.danDien % g.rong;
    y0 = y1 = Math.floor(g.danDien / g.rong);
  }
  x0 = Math.max(0, x0 - 1);
  y0 = Math.max(0, y0 - 1);
  x1 = Math.min(g.rong - 1, x1 + 1);
  y1 = Math.min(g.cao - 1, y1 + 1);
  const Sz = 84,
    M = 10,
    W = (x1 - x0 + 1) * Sz + 2 * M,
    H = (y1 - y0 + 1) * Sz + 2 * M;
  const cx = (i) => i % g.rong,
    cy = (i) => Math.floor(i / g.rong);
  const ctr = (i) => [
    M + (cx(i) - x0 + 0.5) * Sz,
    M + (cy(i) - y0 + 0.5) * Sz,
  ];
  const cv = document.createElement("canvas");
  cv.width = W;
  cv.height = H;
  const d = cv.getContext("2d");
  d.fillStyle = "#f3ece0";
  d.fillRect(0, 0, W, H);
  for (let y = y0; y <= y1; y++)
    for (let x = x0; x <= x1; x++) {
      const i = y * g.rong + x;
      if (!inGrid(i)) continue;
      const px = M + (x - x0) * Sz,
        py = M + (y - y0) * Sz,
        st = km.trangThai[i];
      if (st === "an" && own[i] === undefined) {
        // ô chưa mở: khung đứt nét như game
        d.setLineDash([7, 6]);
        d.strokeStyle = "#cdc2b0";
        d.lineWidth = 2;
        d.strokeRect(px + 3, py + 3, Sz - 6, Sz - 6);
        d.setLineDash([]);
        if (hy.has(i)) {
          d.beginPath();
          d.arc(px + Sz - 16, py + 16, 9, 0, 7);
          d.fillStyle = "#d9b228";
          d.fill();
          d.strokeStyle = "#7a5c00";
          d.lineWidth = 1.5;
          d.stroke();
        }
        continue;
      }
      let fill = TINT[km.mau[i]] || "#ddd";
      if (own[i] !== undefined) fill = cols[own[i]];
      d.fillStyle = fill;
      d.fillRect(px + 2, py + 2, Sz - 4, Sz - 4);
      d.strokeStyle = "#bdb2a3";
      d.lineWidth = 2;
      d.strokeRect(px + 2, py + 2, Sz - 4, Sz - 4);
      if (st === "ton") {
        // ô tổn: gạch chéo
        d.save();
        d.beginPath();
        d.rect(px + 2, py + 2, Sz - 4, Sz - 4);
        d.clip();
        d.strokeStyle = "rgba(168,70,20,.55)";
        d.lineWidth = 5;
        for (let k = -Sz; k < Sz * 2; k += 14) {
          d.beginPath();
          d.moveTo(px + k, py + Sz);
          d.lineTo(px + k + Sz, py);
          d.stroke();
        }
        d.restore();
      }
      if (st === "tac") {
        d.fillStyle = "#7a1f1a";
        d.font = "bold 38px sans-serif";
        d.textAlign = "center";
        d.textBaseline = "middle";
        d.fillText("×", px + Sz / 2, py + Sz / 2);
      }
      const hz = i === g.danDien ? "" : HE_HAN[km.mau[i]];
      if (hz) {
        d.font = "600 17px serif";
        d.textAlign = "left";
        d.textBaseline = "top";
        d.fillStyle =
          own[i] !== undefined
            ? "rgba(255,255,255,.8)"
            : "rgba(30,21,18,.45)";
        d.fillText(hz, px + 7, py + 5);
      }
      if (i === g.danDien && own[i] === undefined) {
        d.fillStyle = "#fbf7ef";
        d.fillRect(px + 5, py + 5, Sz - 10, Sz - 10);
        d.strokeStyle = "#7a1f1a";
        d.lineWidth = 4;
        d.strokeRect(px + 5, py + 5, Sz - 10, Sz - 10);
        d.fillStyle = "#7a1f1a";
        d.font = "bold 40px serif";
        d.textAlign = "center";
        d.textBaseline = "middle";
        d.fillText("丹", px + Sz / 2, py + Sz / 2 + 2);
      }
      if (hy.has(i)) {
        d.beginPath();
        d.arc(px + Sz - 16, py + 16, 9, 0, 7);
        d.fillStyle = "#d9b228";
        d.fill();
        d.strokeStyle = "#7a5c00";
        d.lineWidth = 1.5;
        d.stroke();
      }
      if (mark && mark.has(i)) {
        d.strokeStyle = "#1a7f37";
        d.lineWidth = 7;
        d.strokeRect(px + 8, py + 8, Sz - 16, Sz - 16);
        d.fillStyle = "#1a7f37";
        d.font = "bold 18px sans-serif";
        d.textAlign = "left";
        d.textBaseline = "alphabetic";
        d.fillText("MỞ", px + 12, py + Sz - 12);
      }
    }
  // viền từng món
  pieces.forEach((p) => {
    const cs = new Set(p.cells);
    d.strokeStyle = "#1e1512";
    d.lineWidth = 7;
    for (const cI of cs) {
      const x = cI % g.rong,
        y = Math.floor(cI / g.rong),
        px = M + (x - x0) * Sz,
        py = M + (y - y0) * Sz;
      const L = (a, b, e, f) => {
        d.beginPath();
        d.moveTo(a, b);
        d.lineTo(e, f);
        d.stroke();
      };
      if (!cs.has(cI - g.rong)) L(px, py, px + Sz, py);
      if (!cs.has(cI + g.rong)) L(px, py + Sz, px + Sz, py + Sz);
      if (!cs.has(cI - 1) || x === 0) L(px, py, px, py + Sz);
      if (!cs.has(cI + 1) || x === g.rong - 1)
        L(px + Sz, py, px + Sz, py + Sz);
    }
  });
  // nối ô: đường kinh lộ như game (trắng, quầng xanh), chấm tròn ở tâm mỗi món thông
  try {
    const lk = linkPaths(
      g,
      pieces.map((p) => p.cells),
      R,
      (i) => pieces[i].it.loai === "cong_phap",
    );
    if (lk.segs.length) {
      const trace = () => {
        d.beginPath();
        lk.segs.forEach(([a, b]) => {
          const A = ctr(a),
            B = ctr(b);
          d.moveTo(A[0], A[1]);
          d.lineTo(B[0], B[1]);
        });
      };
      d.save();
      d.lineCap = "round";
      d.lineJoin = "round";
      [
        ["rgba(79,179,255,.30)", 0.36],
        ["rgba(143,214,255,.70)", 0.16],
        ["#ffffff", 0.06],
      ].forEach(([col, w]) => {
        trace();
        d.strokeStyle = col;
        d.lineWidth = Sz * w;
        d.stroke();
      });
      lk.dots.forEach((cI) => {
        const q = ctr(cI);
        d.beginPath();
        d.arc(q[0], q[1], Sz * 0.12, 0, 7);
        d.shadowColor = "#4fb3ff";
        d.shadowBlur = 14;
        d.fillStyle = "#fff";
        d.fill();
        d.shadowBlur = 0;
        d.lineWidth = 3;
        d.strokeStyle = "#7cc8ff";
        d.stroke();
      });
      d.restore();
    }
  } catch (e) {
    /* lỗi vẽ đường nối không được làm mất cả ảnh lưới */
  }
  // số thứ tự món: huy hiệu ở góc dưới trái ô đầu của món (không đè đường nối ở tâm món)
  pieces.forEach((p, n) => {
    if (!p.cells.length) return;
    const c0 = Math.min(...p.cells),
      px = M + (cx(c0) - x0) * Sz + 20,
      py = M + (cy(c0) - y0) * Sz + Sz - 20;
    d.beginPath();
    d.arc(px, py, 14, 0, 7);
    d.fillStyle = "#1e1512";
    d.fill();
    d.lineWidth = 2;
    d.strokeStyle = "#fff";
    d.stroke();
    d.font = "bold 17px sans-serif";
    d.textAlign = "center";
    d.textBaseline = "middle";
    d.fillStyle = "#fff";
    d.fillText(String(n + 1), px, py + 1);
  });
  const legend = pieces
    .map(
      (p, n) =>
        `<div class="vk-lg"><span class="vk-sw" style="background:${cols[n]}">${n + 1}</span><b>${esc(p.it.ten)}</b> <span class="vk-mu">· ${esc((p.it.he || ["vo_sac"]).map(heTen).join("/"))}${p.onHuyet ? " · trên huyệt" : ""}${p.thong ? "" : ' · <span class="vk-bad">không thông</span>'}</span></div>`,
    )
    .join("");
  return `<img class="vk-img" src="${cv.toDataURL("image/png")}" alt="kinh mạch"><div class="vk-note">Chấm vàng = huyệt (vị trí thật của kiếp này) · 丹 = đan điền · × = ô tắc · gạch chéo = ô tổn · chữ Hán ở góc ô = hệ linh căn của ô · đường sáng = mạch thông nối từ đan điền. Giữ tay lên ảnh để lưu.</div>${legend}`;
}

export {
  SINH_HE,
  KHAC_HE,
  GOC_HE,
  gocHe,
  heTacDong,
  genRank,
  genSlack,
  HOP_W,
  sinhRa,
  sinhBoi,
  khacBoi,
  hoHe,
  oHop,
  oKhac,
  oDungDuoc,
  hySet,
  biasCtx,
  biasInfo,
  biasScore,
  DIR_TEN,
  biasSummary,
  CAP_W,
  TIER_W,
  capCtxOf,
  capUp,
  capTierMatch,
  capScore,
  hopHeGame,
  hopKinhLoHe,
  doHopCellGame,
  kmItemPower,
  kmScalablePower,
  acupointPriority,
  simulateQiCycle,
  calcQiScore,
  computeMeridianCommonScore,
  makeFastEval,
  makeEval,
  _candCacheSig,
  _candCacheVal,
  buildCandidates,
  getDanDienAdjMask,
  computeFlowBitmask,
  calcPairCellSynergy,
  findBridgePathBFS,
  greedy,
  anneal,
  smartFillRemainingGaps,
  polish,
  fillRest,
  coverNote,
  stripDead,
  evalCurrent,
  BASE,
  TINT,
  HE_HAN,
  linkPaths,
  drawGrid,
};

Object.assign(gWin, {
  SINH_HE,
  KHAC_HE,
  GOC_HE,
  gocHe,
  heTacDong,
  genRank,
  genSlack,
  HOP_W,
  sinhRa,
  sinhBoi,
  khacBoi,
  hoHe,
  oHop,
  oKhac,
  oDungDuoc,
  hySet,
  biasCtx,
  biasInfo,
  biasScore,
  DIR_TEN,
  biasSummary,
  CAP_W,
  TIER_W,
  capCtxOf,
  capUp,
  capTierMatch,
  capScore,
  hopHeGame,
  hopKinhLoHe,
  doHopCellGame,
  kmItemPower,
  kmScalablePower,
  acupointPriority,
  simulateQiCycle,
  calcQiScore,
  computeMeridianCommonScore,
  makeFastEval,
  makeEval,
  _candCacheSig,
  _candCacheVal,
  buildCandidates,
  getDanDienAdjMask,
  computeFlowBitmask,
  calcPairCellSynergy,
  findBridgePathBFS,
  greedy,
  anneal,
  smartFillRemainingGaps,
  polish,
  fillRest,
  coverNote,
  stripDead,
  evalCurrent,
  BASE,
  TINT,
  HE_HAN,
  linkPaths,
  drawGrid,
});
