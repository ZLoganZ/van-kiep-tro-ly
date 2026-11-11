import { gWin, sleep0, num, yrs } from "../core/utils.js";
import { S, G, C, ctx, ctxLite, has, nearSlots } from "../core/bridge.js";
import { placeName } from "../modules/di-bao.js";
import {
  AU_TT_MAX,
  AU_TT_TEN,
  AU,
  auYield,
  auShopKey,
  auLog,
  auCall,
  auLifeLeft,
  auBag,
  auDangerOK,
} from "./auto-core.js";
/**
 * Module: Auto Buôn Bán & Quản Lý Trạng Thái / Giao Diện Auto Chung
 */
// ═════════ AUTO BUÔN BÁN ═════════
// Mô hình giá: mua ở nơi xuất xứ rẻ, bán ở nước khác trả cao hơn; hệ số theo quốc gia nằm sẵn trong hàm giá của game.
function auAccepts(def, it) {
  const t = def.thu_mua;
  if (t === false) return false;
  const kind = (t && t.kieu) ?? (def.tien_ich ? "chuyen" : false);
  if (!kind) return false;
  const set = new Set((t && t.loai) || []);
  if (kind === "chuyen") {
    for (const h of def.ke_hang || []) set.add(h.loai);
    for (const ch of def.choices || [])
      for (const ef of ch.effects || []) {
        if (ef.if !== undefined) continue;
        if (ef.mua !== undefined) {
          const id = typeof ef.mua === "string" ? ef.mua : ef.mua.id;
          const x = C().items.get(id);
          if (x) set.add(x.loai);
        }
        if (ef.ban_dac_san !== undefined) set.add("dac_san");
        if (ef.ban_loai)
          for (const l of [ef.ban_loai.loai || []].flat()) set.add(l);
      }
  }
  return set.has(it.loai);
}
function auShopCtx(c, slot, y, id) {
  const run = c.run,
    arrive = run.nam + y;
  const runA = {
    ...run,
    nam: arrive,
    viTri: slot,
    active: { id, slot },
  };
  return { ...c, run: runA, noi: slot, enc: runA.active };
}
function auOffers(cc, slot, id, def) {
  const K = S.core,
    Cc = C(),
    rows = [];
  if (def.ke_hang && def.ke_hang.length && has("shelfStock", "giaMua")) {
    try {
      for (const e of K.shelfStock(cc, id, slot) || []) {
        const it = Cc.items.get(e.itemId);
        if (!it) continue;
        const pf = e.priceFactor ?? 1,
          gia =
            pf === 1 ? undefined : Math.max(1, Math.round((it.gia || 0) * pf));
        let price;
        try {
          price = K.giaMua(cc, e.itemId, gia, 0);
        } catch (err) {
          price = gia ?? it.gia;
        }
        rows.push({ itemId: e.itemId, it, price });
      }
    } catch (e) {
      /* tiệm này bỏ qua */
    }
  }
  for (const ch of def.choices || [])
    for (const ef of ch.effects || []) {
      if (ef.if !== undefined || ef.mua === undefined) continue;
      const m = typeof ef.mua === "string" ? { id: ef.mua } : ef.mua,
        it = Cc.items.get(m.id);
      if (!it) continue;
      let price;
      try {
        price = K.giaMua(cc, m.id, m.gia, 0);
      } catch (err) {
        price = m.gia ?? it.gia;
      }
      rows.push({ itemId: m.id, it, price });
    }
  return rows.filter((r) => r.price > 0);
}
// Chợ Ngập Hàng (game mới): mỗi món bán thêm làm giá tụt dần và tiệm ngừng thu khi chợ đã ngập; lF trả số món tiệm còn thu nổi.
function auSellCap(cc, it) {
  try {
    if (!S.core.glutRoom) return Infinity;
    const v = S.core.glutRoom(cc, it);
    return Number.isFinite(v) ? Math.max(0, Math.floor(v)) : Infinity;
  } catch (e) {
    return Infinity;
  }
}
const auSellEst = (cc, itemId, q) => {
  const n = Math.min(q, auSellCap(cc, C().items.get(itemId)));
  let s = 0;
  for (let o = 0; o < n; o++) {
    try {
      s += S.core.giaBan(cc, itemId, undefined, o);
    } catch (e) {
      return 0;
    }
  }
  return s;
};

async function auPlanTrade(cfg, prog) {
  const K = S.core,
    c = ctx(),
    run = c.run,
    W = c.world,
    Cc = C();
  if (!has("facilitiesAt", "giaMua", "giaBan", "travelYears"))
    throw new Error(
      "Bản game này Tool chưa đọc được giá mua bán (thiếu hàm giá). Bấm “Tự kiểm tra” ở tab Tổng Quan rồi chụp màn hình gửi Claude.",
    );
  const money = Math.floor(run.nhanVat.linhThach || 0);
  const budget = Math.max(
    0,
    Math.min(money - cfg.giu, Math.floor((money * cfg.von) / 100)),
  );
  if (budget < 1)
    return {
      routes: [],
      budget,
      nShops: 0,
      why:
        "Vốn dùng được bằng 0 (Linh Thạch " +
        money +
        ", giữ lại " +
        cfg.giu +
        ").",
    };
  // Bán xuyên khoảng cách: nơi MUA trong maxY năm đường từ chỗ đang đứng; nơi BÁN là mọi tiệm trong banY năm đường tính từ nơi mua.
  const banY = cfg.banY > 0 ? cfg.banY : cfg.maxY;
  const near = nearSlots(c, cfg.maxY + banY).filter(
    (x) => auDangerOK(c, x.slot, cfg.hiem) || x.slot === run.viTri,
  );
  let ypu = 0;
  for (const x of near) {
    const d = W.distance(run.viTri, x.slot);
    if (d > 0 && x.y > 0) {
      ypu = x.y / d;
      break;
    }
  }
  const shops = [];
  for (let k = 0; k < near.length; k++) {
    if (k % 4 === 0) {
      if (prog) prog((0.6 * k) / near.length, "Đang xem các tiệm…");
      await sleep0();
    }
    if (prog && S.abort)
      return {
        routes: [],
        budget,
        nShops: 0,
        why: "Đã dừng theo yêu cầu.",
      };
    const { slot, y } = near[k];
    let encs = [];
    try {
      encs = K.facilitiesAt(c, slot) || [];
    } catch (e) {
      continue;
    }
    for (const id of encs) {
      const def = Cc.encounters.get(id);
      if (
        !def ||
        def.kind !== "cua_hang" ||
        def.giao_dien === "dau_gia" ||
        def.giao_dien === "lua_chon"
      )
        continue;
      const cc = auShopCtx(c, slot, y, id);
      shops.push({
        slot,
        y,
        id,
        def,
        cc,
        name: placeName(c, slot),
        rows: y <= cfg.maxY ? auOffers(cc, slot, id, def) : [],
      });
    }
  }
  const pair = (a, b) => (ypu > 0 ? W.distance(a, b) * ypu : Infinity);
  const routes = [],
    CAP = 20;
  const buyShops = shops.filter((x) => x.rows.length);
  for (let bi = 0; bi < buyShops.length; bi++) {
    const b = buyShops[bi];
    if (prog)
      prog(0.6 + (0.4 * bi) / buyShops.length, "Đang so giá các chuyến…");
    await auYield();
    if (prog && S.abort)
      return {
        routes: [],
        budget,
        nShops: 0,
        why: "Đã dừng theo yêu cầu.",
      };
    for (const r of b.rows) {
      const maxQ = Math.min(CAP, Math.floor(budget / r.price));
      if (maxQ < 1) continue;
      for (const s of shops) {
        if (s.slot === b.slot || !auAccepts(s.def, r.it)) continue;
        const y2 = pair(b.slot, s.slot);
        if (!(y2 <= banY)) continue;
        const ccs = auShopCtx(c, s.slot, b.y + y2, s.id);
        const maxQs = Math.min(maxQ, auSellCap(ccs, r.it));
        if (maxQs < 1) continue; // chợ nơi đó đã ngập: tiệm không thu
        let best = { q: 0, profit: 0, rev: 0 },
          rev = 0;
        for (let q = 1; q <= maxQs; q++) {
          let m;
          try {
            m = S.core.giaBan(ccs, r.itemId, undefined, q - 1);
          } catch (e) {
            break;
          }
          if (m < r.price * (1 + cfg.lai / 100)) break; // món thứ q không còn đủ lãi tối thiểu
          rev += m;
          best = { q, profit: rev - r.price * q, rev };
        }
        if (best.q < 1 || best.profit <= 0) continue;
        const years = b.y + y2;
        routes.push({
          buy: b,
          sell: s,
          itemId: r.itemId,
          it: r.it,
          price: r.price,
          q: best.q,
          profit: best.profit,
          rev: best.rev,
          years,
          score: best.profit / Math.max(0.3, years),
          ccs,
        });
      }
    }
  }
  routes.sort((a, b) => b.score - a.score);
  return { routes, budget, nShops: shops.length };
}

// Dò nơi bán xuyên khoảng cách: mọi tiệm thu món này trong phạm vi banY năm đường tính từ chỗ đang đứng.
// Dùng giá thật theo mô hình của game (đã tính Chợ Ngập Hàng), bỏ tiệm bán lỗ, xếp theo lãi mỗi năm đường.
async function auSellScan(cfg, itemId, qty, costLeft, skip) {
  const K = S.core,
    c = ctx(),
    run = c.run,
    Cc = C(),
    it = Cc.items.get(itemId);
  if (!it || qty < 1 || !has("facilitiesAt", "giaBan", "travelYears"))
    return [];
  const banY = cfg.banY > 0 ? cfg.banY : cfg.maxY;
  const near = nearSlots(c, banY).filter(
    (x) => auDangerOK(c, x.slot, cfg.hiem) || x.slot === run.viTri,
  );
  const out = [];
  for (let k = 0; k < near.length; k++) {
    if (k % 6 === 0) await auYield();
    const { slot, y } = near[k];
    let encs = [];
    try {
      encs = K.facilitiesAt(c, slot) || [];
    } catch (e) {
      continue;
    }
    for (const id of encs) {
      if (skip && skip.has(auShopKey(slot, id))) continue;
      const def = Cc.encounters.get(id);
      if (
        !def ||
        def.kind !== "cua_hang" ||
        def.giao_dien === "dau_gia" ||
        def.giao_dien === "lua_chon" ||
        !auAccepts(def, it)
      )
        continue;
      const cc = auShopCtx(c, slot, y, id);
      const n = Math.min(qty, auSellCap(cc, it));
      if (n < 1) continue;
      const rev = auSellEst(cc, itemId, n),
        costPart = (costLeft * n) / qty;
      if (!(rev >= costPart)) continue; // bán lỗ thì bỏ
      out.push({
        slot,
        y,
        id,
        def,
        cc,
        name: placeName(c, slot),
        n,
        rev,
        profit: rev - costPart,
        score: (rev - costPart) / Math.max(0.3, y),
      });
    }
  }
  return out.sort((a, b) => b.score - a.score);
}
function auSetSell(st, cand) {
  st.route.sell = {
    slot: cand.slot,
    y: cand.y,
    id: cand.id,
    def: cand.def,
    name: cand.name,
  };
  st.route.ccs = cand.cc;
  st.skip.add(auShopKey(cand.slot, cand.id)); // đã chọn tiệm này rồi: lần dò lại sau không chọn nó nữa
  auLog(
    "Bán ở " +
      cand.name +
      " (" +
      yrs(cand.y) +
      " đường, dự kiến thu " +
      Math.round(cand.rev) +
      " Linh Thạch cho " +
      cand.n +
      " món).",
  );
}

// Đi tới một tiệm và mở nó ra. Trả về 'here' (đã mở), null (vừa làm một bước) hoặc { stop }.
function auGoStep(st, slot, encId) {
  const g = G(),
    run = g.state.run;
  if (run.active) {
    const v = g.shopView();
    if (v && v.encounterId === encId) return "here";
    if (v) {
      const r = auCall(() => g.leaveShop());
      return r.ok ? null : { stop: "Không rời được tiệm: " + r.err };
    }
    return null;
  }
  if (run.viTri !== slot || run.oNoi !== slot) {
    const r = auCall(() => g.enterNode(slot));
    const r2 = G().state.run;
    if (!r.ok)
      return {
        stop: "Không đi tới được " + placeName(ctxLite(), slot) + ": " + r.err,
      };
    if (r2.viTri !== slot && !r2.active && !r2.tran && !r2.bienCo)
      return {
        stop:
          "Không đi tới được " +
          placeName(ctxLite(), slot) +
          (r2.thongBao ? ": " + r2.thongBao : ""),
      };
    return null;
  }
  const r = auCall(() => g.chooseActivity(encId));
  if (!r.ok) return { stop: "Không mở được tiệm: " + r.err };
  const r3 = G().state.run;
  if (!r3.active)
    return {
      stop: "Tiệm không mở được" + (r3.thongBao ? ": " + r3.thongBao : ""),
    };
  return null;
}
function auTradeBudget(cfg) {
  const money = Math.floor(G().state.run.nhanVat.linhThach || 0);
  return Math.max(
    0,
    Math.min(money - cfg.giu, Math.floor((money * cfg.von) / 100)),
  );
}
async function auBuonStep(st) {
  const g = G(),
    cfg = AU.cfg.buon,
    K = S.core;
  const p = auPending(st, {
    danhAi: true,
    shopId:
      st.route && st.phase !== "plan"
        ? st.phase === "toSell" || st.phase === "sell"
          ? st.route.sell.id
          : st.route.buy.id
        : null,
  });
  if (p !== "idle") return p === "ok" ? null : p;
  const route = st.route;
  if (st.phase === "plan") {
    if (st.trips >= cfg.chuyen)
      return {
        stop: "Đã chạy đủ " + cfg.chuyen + " chuyến như đã đặt",
      };
    if (auLifeLeft() < cfg.tho)
      return {
        stop:
          "Thọ Nguyên còn dưới " + cfg.tho + " năm, dừng để bảo vệ Thọ Nguyên",
      };
    if ((g.state.run.nhanVat.thuongThe || 0) >= AU_TT_MAX)
      return {
        stop:
          "Đang " +
          AU_TT_TEN[AU_TT_MAX].toLowerCase() +
          ", dừng để bạn chữa thương",
      };
    if (g.state.run.active) {
      const r = auCall(() => g.leaveShop());
      return r.ok ? null : { stop: r.err };
    }
    const pl = await auPlanTrade(cfg);
    AU.plan = pl;
    if (!pl.routes.length)
      return {
        stop:
          pl.why ||
          "Không tìm thấy chuyến buôn nào đủ lãi " +
            cfg.lai +
            "% trong " +
            cfg.maxY +
            " năm đường",
      };
    st.route = pl.routes[0];
    st.phase = "toBuy";
    st.bought = 0;
    st.cost = 0;
    st.left = 0;
    st.rev = 0;
    st.sold = 0;
    st.skip = new Set();
    auLog(
      "Chuyến " +
        (st.trips + 1) +
        ": mua " +
        st.route.it.ten +
        " ở " +
        st.route.buy.name +
        ", dự kiến bán ở " +
        st.route.sell.name +
        " (lãi ước " +
        Math.round(st.route.profit) +
        " Linh Thạch / " +
        num(st.route.years) +
        " năm). Mua xong sẽ dò lại nơi bán tốt nhất trong " +
        num(cfg.banY) +
        " năm đường.",
    );
    return null;
  }
  if (st.phase === "toBuy") {
    const go = auGoStep(st, route.buy.slot, route.buy.id);
    if (go !== "here") return go;
    st.phase = "buy";
    return null;
  }
  if (st.phase === "buy") {
    const v = g.shopView();
    if (!v || v.encounterId !== route.buy.id) {
      st.phase = "toBuy";
      return null;
    }
    if (v.currency && v.currency !== "linh_thach")
      return { stop: "Tiệm này không dùng Linh Thạch, bỏ chuyến" };
    const offer = (v.offers || []).find(
      (o) =>
        o.itemId === route.itemId &&
        !o.lockedReason &&
        !o.fake &&
        !o.treasure &&
        o.stock >= o.perBuy,
    );
    if (!offer) {
      st.phase = "plan";
      st.route = null;
      auLog("Tiệm không còn bán " + route.it.ten + ", lập kế hoạch lại.");
      const r = auCall(() => g.leaveShop());
      return r.ok ? null : { stop: r.err };
    }
    const budget = auTradeBudget(cfg);
    const cap = auSellCap(route.ccs, route.it);
    if (cap < offer.perBuy) {
      st.phase = "plan";
      st.route = null;
      auLog(
        "Chợ ở " +
          route.sell.name +
          " đã ngập " +
          route.it.ten +
          ", tiệm không thu nữa, bỏ chuyến.",
      );
      const r = auCall(() => g.leaveShop());
      return r.ok ? null : { stop: r.err };
    }
    const qMax = Math.min(
      offer.maxQty,
      Math.floor(offer.stock / offer.perBuy),
      30,
      Number.isFinite(cap) ? Math.floor(cap / offer.perBuy) : 30,
    );
    let q = 0,
      bestProfit = 0;
    for (let k = 1; k <= qMax; k++) {
      const cost = g.shopBuyQuote(offer.index, k);
      if (!cost || cost > budget) break;
      const rev = auSellEst(route.ccs, route.itemId, k * offer.perBuy);
      if (rev - cost >= (cost * cfg.lai) / 100 && rev - cost > bestProfit) {
        q = k;
        bestProfit = rev - cost;
      }
    }
    if (q < 1) {
      st.phase = "plan";
      st.route = null;
      auLog(
        "Giá mua thực tế ở " + route.buy.name + " không còn đủ lãi, bỏ chuyến.",
      );
      const r = auCall(() => g.leaveShop());
      return r.ok ? null : { stop: r.err };
    }
    const m0 = Math.floor(g.state.run.nhanVat.linhThach),
      b0 = auBag(route.itemId);
    const r = auCall(() => g.shopBuy(offer.index, q));
    const bought = auBag(route.itemId) - b0;
    if (!r.ok || bought < 1)
      return {
        stop: "Mua không được " + route.it.ten + (r.err ? ": " + r.err : ""),
      };
    st.bought = bought;
    st.left = bought;
    st.rev = 0;
    st.sold = 0;
    st.cost = m0 - Math.floor(G().state.run.nhanVat.linhThach);
    auLog(
      "Đã mua " +
        bought +
        " " +
        route.it.ten +
        " hết " +
        st.cost +
        " Linh Thạch.",
    );
    const r2 = auCall(() => g.leaveShop());
    if (!r2.ok) return { stop: r2.err };
    st.phase = "pickSell";
    return null;
  }
  if (st.phase === "pickSell") {
    // bán xuyên khoảng cách: chọn tiệm bán tốt nhất trong phạm vi banY năm đường tính từ chỗ đang đứng
    const have = Math.min(auBag(route.itemId), st.left);
    if (have < 1) {
      st.phase = "plan";
      st.route = null;
      return null;
    }
    const cands = await auSellScan(
      cfg,
      route.itemId,
      have,
      (st.cost * have) / Math.max(1, st.bought),
      st.skip,
    );
    if (!cands.length)
      return {
        stop:
          "Không tiệm nào trong " +
          num(cfg.banY) +
          " năm đường chịu thu " +
          route.it.ten +
          " mà không lỗ. Hàng vẫn ở trong túi, bạn tự quyết định",
      };
    auSetSell(st, cands[0]);
    st.phase = "toSell";
    return null;
  }
  if (st.phase === "toSell") {
    const go = auGoStep(st, route.sell.slot, route.sell.id);
    if (go !== "here") return go;
    st.phase = "sell";
    return null;
  }
  if (st.phase === "sell") {
    const v = g.shopView();
    if (!v || v.encounterId !== route.sell.id) {
      st.phase = "toSell";
      return null;
    }
    const s = (v.sells || []).find((x) => x.itemId === route.itemId);
    const qty = Math.min(
      auBag(route.itemId),
      st.left,
      auSellCap(ctxLite(), route.it),
    ); // game chỉ thu tới mức Chợ Ngập Hàng cho phép
    const costPart = (st.cost * qty) / Math.max(1, st.bought);
    let why = "";
    if (!s || s.lockedReason || qty < 1)
      why =
        "Tiệm " +
        route.sell.name +
        " không thu " +
        route.it.ten +
        (s && s.lockedReason ? " (" + s.lockedReason + ")" : "");
    else {
      const quote = g.shopSellQuote(route.itemId, qty);
      if (quote < costPart)
        why =
          "Giá thu thực tế " + quote + " thấp hơn vốn " + Math.round(costPart);
    }
    if (why) {
      // bán xuyên: không dừng ngay, rời tiệm rồi dò tiệm khác trong phạm vi
      const r = auCall(() => g.leaveShop());
      if (!r.ok) return { stop: r.err };
      auLog(
        why + ". Dò nơi bán khác trong " + num(cfg.banY) + " năm đường.",
        "vk-bad",
      );
      st.phase = "pickSell";
      return null;
    }
    const m0 = Math.floor(g.state.run.nhanVat.linhThach);
    const r = auCall(() => g.shopSell(route.itemId, qty));
    if (!r.ok) return { stop: "Bán không được: " + r.err };
    const gain = Math.floor(G().state.run.nhanVat.linhThach) - m0;
    st.rev += gain;
    st.sold += qty;
    st.left = Math.max(0, st.left - qty);
    auLog(
      "Đã bán " +
        qty +
        " " +
        route.it.ten +
        " ở " +
        route.sell.name +
        " được " +
        gain +
        " Linh Thạch.",
      gain >= costPart ? "vk-ok" : "vk-bad",
    );
    const r2 = auCall(() => g.leaveShop());
    if (!r2.ok) return { stop: r2.err };
    if (st.left > 0 && auBag(route.itemId) > 0) {
      auLog("Còn " + st.left + " món chưa bán, bán tiếp xuyên khoảng cách.");
      st.phase = "pickSell";
      return null;
    }
    const profit = st.rev - (st.cost * st.sold) / Math.max(1, st.bought);
    st.profit += profit;
    st.trips++;
    auLog(
      "Xong chuyến " +
        st.trips +
        ": bán " +
        st.sold +
        "/" +
        st.bought +
        " món, lãi " +
        Math.round(profit) +
        " Linh Thạch.",
      profit >= 0 ? "vk-ok" : "vk-bad",
    );
    st.phase = "plan";
    st.route = null;
    return null;
  }
  return { stop: "Trạng thái không hợp lệ" };
}

export {
  auAccepts,
  auShopCtx,
  auOffers,
  auSellCap,
  auSellEst,
  auPlanTrade,
  auSellScan,
  auSetSell,
  auGoStep,
  auTradeBudget,
  auBuonStep,
};

Object.assign(gWin, {
  auAccepts,
  auShopCtx,
  auOffers,
  auSellCap,
  auSellEst,
  auPlanTrade,
  auSellScan,
  auSetSell,
  auGoStep,
  auTradeBudget,
  auBuonStep,
});
