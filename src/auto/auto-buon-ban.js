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
  if (
    def.ke_hang &&
    def.ke_hang.length &&
    has("shelfStock", "giaMua")
  ) {
    try {
      for (const e of K.shelfStock(cc, id, slot) || []) {
        const it = Cc.items.get(e.itemId);
        if (!it) continue;
        const pf = e.priceFactor ?? 1,
          gia =
            pf === 1
              ? undefined
              : Math.max(1, Math.round((it.gia || 0) * pf));
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
      prog(
        0.6 + (0.4 * bi) / buyShops.length,
        "Đang so giá các chuyến…",
      );
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
        stop:
          "Không đi tới được " +
          placeName(ctxLite(), slot) +
          ": " +
          r.err,
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
      stop:
        "Tiệm không mở được" + (r3.thongBao ? ": " + r3.thongBao : ""),
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
          "Thọ Nguyên còn dưới " +
          cfg.tho +
          " năm, dừng để bảo vệ Thọ Nguyên",
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
      auLog(
        "Tiệm không còn bán " + route.it.ten + ", lập kế hoạch lại.",
      );
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
      if (
        rev - cost >= (cost * cfg.lai) / 100 &&
        rev - cost > bestProfit
      ) {
        q = k;
        bestProfit = rev - cost;
      }
    }
    if (q < 1) {
      st.phase = "plan";
      st.route = null;
      auLog(
        "Giá mua thực tế ở " +
          route.buy.name +
          " không còn đủ lãi, bỏ chuyến.",
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
        stop:
          "Mua không được " +
          route.it.ten +
          (r.err ? ": " + r.err : ""),
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
          "Giá thu thực tế " +
          quote +
          " thấp hơn vốn " +
          Math.round(costPart);
    }
    if (why) {
      // bán xuyên: không dừng ngay, rời tiệm rồi dò tiệm khác trong phạm vi
      const r = auCall(() => g.leaveShop());
      if (!r.ok) return { stop: r.err };
      auLog(
        why +
          ". Dò nơi bán khác trong " +
          num(cfg.banY) +
          " năm đường.",
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
      auLog(
        "Còn " + st.left + " món chưa bán, bán tiếp xuyên khoảng cách.",
      );
      st.phase = "pickSell";
      return null;
    }
    const profit =
      st.rev - (st.cost * st.sold) / Math.max(1, st.bought);
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

// ── Giao diện
function auReadCfg(kind) {
  const q = (id) => body.querySelector("#" + id);
  const num0 = (id, lo, hi, d) => {
    const el = q(id);
    return el ? auClamp(el.value, lo, hi, d) : d;
  };
  const sel = (id, d) => {
    const el = q(id);
    return el ? el.value : d;
  };
  const c = AU.cfg[kind];
  if (kind === "tl") {
    const ck = (id, d) => {
      const el = q(id);
      return el ? !!el.checked : d;
    };
    c.mode = sel("au-tl-mode", c.mode || "be_quan");
    c.targetRealm = Math.floor(
      num0(
        "au-tl-realm",
        0,
        5,
        c.targetRealm != null ? c.targetRealm : 5,
      ),
    );
    c.targetSubRealm = Math.floor(
      num0(
        "au-tl-sub-realm",
        -1,
        4,
        c.targetSubRealm != null ? c.targetSubRealm : 3,
      ),
    );
    c.minSafeRate = num0("au-tl-rate", 30, 100, c.minSafeRate);
    c.minTho = num0("au-tl-tho", 1, 1000, c.minTho);
    c.toc = sel("au-toc", c.toc);
    c.useCultPills = ck("au-tl-cult-pills", c.useCultPills);
    c.useBreakPills = ck("au-tl-break-pills", c.useBreakPills);
    c.autoBeatDemons = ck("au-tl-demons", c.autoBeatDemons);
    c.autoBreakBottleneck = ck(
      "au-tl-bottleneck",
      c.autoBreakBottleneck,
    );
    c.autoThaMang = ck("au-tl-auto-tha", c.autoThaMang !== false);
    c.autoEnemyEscape = ck(
      "au-tl-enemy-escape",
      c.autoEnemyEscape !== false,
    );
    // Các tùy chọn khi chọn chế độ Đánh Quái (Săn Yêu):
    c.maxY = num0("au-tl-maxy", 0.5, 30, c.maxY != null ? c.maxY : 3);
    c.tran = Math.floor(
      num0("au-tl-tran", 0, 9999, c.tran != null ? c.tran : 20),
    );
    c.thuong = Math.floor(
      num0(
        "au-tl-thuong",
        1,
        AU_TT_MAX,
        c.thuong != null ? c.thuong : 2,
      ),
    );
    const k = q("au-tl-kt");
    if (k) c.kt = k.checked;
    const nh = q("au-tl-nehac");
    if (nh) c.neHac = nh.checked;
    const da = q("au-tl-danh-ai");
    if (da) c.danhAi = da.checked;
    c.uuTienSuKienTuVi = ck(
      "au-tl-tu-vi-events",
      c.uuTienSuKienTuVi !== false,
    );
    c.autoSongTu = ck("au-tl-song-tu", c.autoSongTu !== false);
    c.sanMucTieu = sel(
      "au-tl-san-target",
      c.sanMucTieu || "uu_tien_dau_dan",
    );
    c.autoDuongThuong = ck(
      "au-tl-auto-duong-thuong",
      c.autoDuongThuong !== false,
    );
    c.uuTienCapNen = ck(
      "au-tl-uu-tien-cap-nen",
      c.uuTienCapNen !== false,
    );
    const m = AU_MAU_ID.filter((x) => {
      const el = q("au-tl-mau-" + x);
      return el ? el.checked : (c.mau || []).includes(x);
    });
    if (m.length > 0) c.mau = auMauNorm(m);
    if (AU.cfg.san) {
      Object.assign(AU.cfg.san, {
        maxY: c.maxY,
        tran: c.tran,
        thuong: c.thuong,
        kt: c.kt,
        neHac: c.neHac,
        danhAi: c.danhAi,
        mau: c.mau,
        toc: c.toc,
        sanMucTieu: c.sanMucTieu,
        autoDuongThuong: c.autoDuongThuong,
        uuTienCapNen: c.uuTienCapNen,
      });
    }
    auSave();
    return;
  }
  if (kind === "tc") {
    const ck = (id, d) => {
      const el = q(id);
      return el ? !!el.checked : d;
    };
    c.autoCombatOverlay = ck("au-tc-overlay", c.autoCombatOverlay);
    c.autoInCombat = ck("au-tc-auto-in-combat", c.autoInCombat);
    c.aiEngineMode = sel("au-tc-ai-mode", c.aiEngineMode || "smart_v3");
    c.itemPolicy = sel("au-tc-item-policy", c.itemPolicy || "auto");
    c.speed = sel("au-tc-speed", c.speed || "normal");
    c.targetPrio = sel("au-tc-target-prio", c.targetPrio || "smart");
    c.teHuyetMode = sel("au-tc-te-huyet", c.teHuyetMode || "off");
    c.healPillMode = sel("au-tc-heal-mode", c.healPillMode || "smart");
    c.healHpThreshold = num0(
      "au-tc-heal-hp",
      10,
      85,
      c.healHpThreshold,
    );
    c.healBossPanicHp = num0(
      "au-tc-heal-panic-hp",
      20,
      90,
      c.healBossPanicHp != null ? c.healBossPanicHp : 55,
    );
    c.spiritPillMode = sel(
      "au-tc-spirit-mode",
      c.spiritPillMode || "on_demand",
    );
    c.spiritThreshold = num0(
      "au-tc-spirit-mp",
      0,
      85,
      c.spiritThreshold != null ? c.spiritThreshold : 20,
    );
    c.burstPillMode = sel(
      "au-tc-burst-mode",
      c.burstPillMode || "boss_combo",
    );
    c.useBurstPill = c.burstPillMode !== "off";
    c.cleansePillMode = ck(
      "au-tc-cleanse-pill",
      c.cleansePillMode !== false,
    );
    c.maxDrugResistance = num0(
      "au-tc-max-resist",
      15,
      95,
      c.maxDrugResistance,
    );
    c.maxPillGradeNormal = Math.floor(
      num0(
        "au-tc-pill-grade-norm",
        1,
        8,
        c.maxPillGradeNormal != null ? c.maxPillGradeNormal : 4,
      ),
    );
    c.maxPillGrade = Math.floor(
      num0("au-tc-pill-grade", 1, 8, c.maxPillGrade || 6),
    );
    c.shieldTalismanMode = sel(
      "au-tc-shield-tal-mode",
      c.shieldTalismanMode || "predictive",
    );
    c.smartShield = c.shieldTalismanMode !== "off";
    c.shieldHpThreshold = num0(
      "au-tc-shield-hp",
      15,
      90,
      c.shieldHpThreshold != null ? c.shieldHpThreshold : 55,
    );
    c.ccTalismanMode = sel(
      "au-tc-cc-tal-mode",
      c.ccTalismanMode || "interrupt",
    );
    c.smartCc = c.ccTalismanMode !== "off";
    c.atkTalismanMode = sel(
      "au-tc-atk-tal-mode",
      c.atkTalismanMode || "smart_weave",
    );
    c.useAttackTalismans = c.atkTalismanMode !== "off";
    c.talismanGradeNormal = Math.floor(
      num0(
        "au-tc-talisman-grade-norm",
        1,
        8,
        c.talismanGradeNormal != null ? c.talismanGradeNormal : 4,
      ),
    );
    c.talismanGrade = Math.floor(
      num0("au-tc-talisman-grade", 1, 8, c.talismanGrade || 6),
    );
    c.formationMode = sel(
      "au-tc-formation-mode",
      c.formationMode || "boss_or_danger",
    );
    c.saveFamiliars = ck("au-tc-familiars", c.saveFamiliars !== false);
    c.recallPetHp = num0(
      "au-tc-recall-pet-hp",
      10,
      60,
      c.recallPetHp != null ? c.recallPetHp : 25,
    );
    c.healSkillThreshold = num0(
      "au-tc-heal-skill-hp",
      20,
      95,
      c.healSkillThreshold != null ? c.healSkillThreshold : 75,
    );
    c.shieldSkillThreshold = num0(
      "au-tc-shield-skill-hp",
      10,
      85,
      c.shieldSkillThreshold != null ? c.shieldSkillThreshold : 40,
    );
    c.preventOverkill = ck(
      "au-tc-prevent-overkill",
      c.preventOverkill !== false,
    );
    c.aoePriority = ck("au-tc-aoe-prio", c.aoePriority !== false);
    c.prioritizeNatal = ck(
      "au-tc-natal-prio",
      c.prioritizeNatal !== false,
    );
    c.autoNormalAttack = ck(
      "au-tc-normal-attack",
      c.autoNormalAttack !== false,
    );
    c.smartFinisher = ck(
      "au-tc-smart-finisher",
      c.smartFinisher !== false,
    );
    c.comboSequence = ck("au-tc-combo", c.comboSequence !== false);
    c.emergencyThieuDot = ck(
      "au-tc-thieu-dot",
      c.emergencyThieuDot !== false,
    );
    c.thieuDotHp = num0(
      "au-tc-thieu-dot-hp",
      10,
      50,
      c.thieuDotHp != null ? c.thieuDotHp : 20,
    );
    c.emergencyEscape = ck(
      "au-tc-emergency-escape",
      !!c.emergencyEscape,
    );
    c.escapeHp = num0(
      "au-tc-escape-hp",
      5,
      45,
      c.escapeHp != null ? c.escapeHp : 16,
    );
    c.autoThaMang = ck("au-tc-auto-tha", c.autoThaMang !== false);
    c.autoEnemyEscape = ck(
      "au-tc-enemy-escape",
      c.autoEnemyEscape !== false,
    );
    auSave();
    return;
  }
  if (kind === "km") {
    const ck = (id, d) => {
      const el = q(id);
      return el ? !!el.checked : d;
    };
    const pick = (id, ok, d) => {
      const v = sel(id, d);
      return ok.map(String).includes(String(v)) ? v : d;
    };
    c.mode = pick(
      "au-km-mode",
      AU_KM_MODE.map((x) => x[0]),
      c.mode,
    );
    c.dir = pick("au-km-dir", ["", "tien", "ma"], c.dir);
    c.kb = sel("au-km-kb", c.kb);
    if (c.kb && !BUILDS.some((x) => x.k === c.kb)) c.kb = "";
    c.iters = Number(
      pick(
        "au-km-it",
        AU_KM_IT.map((x) => x[0]),
        c.iters,
      ),
    );
    c.ratio = pick("au-km-ratio", Object.keys(HB_RATIO), c.ratio);
    c.maxSkills = pick(
      "au-km-maxskills",
      Object.keys(HB_MAX_SKILLS),
      c.maxSkills != null ? String(c.maxSkills) : "3",
    );
    c.bk = AU_KM_BK;
    c.prio = ck("au-km-prio", c.prio);
    c.two = ck("au-km-two", c.two);
    c.keep = pick("au-km-keep", ["tu", "danh"], c.keep);
    c.moBo = ck("au-km-mobo", c.moBo);
    c.mo = ck("au-km-mo", c.mo);
    c.moMax = Math.floor(num0("au-km-momax", 1, 20, c.moMax));
    c.tayO = ck("au-km-tayo", c.tayO);
    c.tayMax = Math.floor(
      num0("au-km-taymax", 1, 20, c.tayMax != null ? c.tayMax : 3),
    );
    c.watch = ck("au-km-watch", c.watch);
    auSave();
    return;
  }
  if (kind === "sdb") {
    const ck = (id, d) => {
      const el = q(id);
      return el ? !!el.checked : d;
    };
    c.uuTienTheoHon = ck("au-sdb-uutien", c.uuTienTheoHon !== false);
    c.boQuaDaCo = ck("au-sdb-boda", c.boQuaDaCo !== false);
    c.dungTruyenTong = ck("au-sdb-tele", c.dungTruyenTong !== false);
    c.danhAi = ck("au-sdb-danh-ai", c.danhAi !== false);
    c.autoThaMang = ck("au-sdb-auto-tha", c.autoThaMang !== false);
    c.autoEnemyEscape = ck(
      "au-sdb-enemy-escape",
      c.autoEnemyEscape !== false,
    );
    c.sanMoiDiBaoXuatThe = ck(
      "au-sdb-san-moi",
      c.sanMoiDiBaoXuatThe !== false,
    );
    c.autoQuickSave = ck("au-sdb-auto-qs", !!c.autoQuickSave);
    c.minWinRate = num0("au-sdb-winrate", 10, 100, c.minWinRate || 70);
    c.cheDoCho = sel("au-sdb-chedo", c.cheDoCho || "camp");
    c.minTho = num0("au-sdb-tho", 1, 1000, c.minTho || 15);
    c.tho = c.minTho;
    c.maxNam = num0("au-sdb-maxnam", 1, 1000, c.maxNam || 100);
    c.toc = sel("au-toc", c.toc || "nhanh");
    const relicChks = body.querySelectorAll(".au-sdb-relic-chk");
    if (relicChks.length > 0) {
      c.targetRelics = Array.from(relicChks)
        .filter((el) => el.checked)
        .map((el) => el.getAttribute("data-relic"));
    }
    auSave();
    return;
  }
  if (kind === "buon") {
    c.maxY = num0("au-maxy", 0.5, 30, c.maxY);
    c.banY = num0("au-bany", 0.5, 60, c.banY);
    c.von = num0("au-von", 1, 100, c.von);
    c.giu = num0("au-giu", 0, 1e9, c.giu);
    c.lai = num0("au-lai", 1, 500, c.lai);
    c.chuyen = Math.floor(num0("au-chuyen", 1, 999, c.chuyen));
    c.tho = num0("au-tho", 0, 1e4, c.tho);
    c.hiem = sel("au-hiem", c.hiem);
    c.toc = sel("au-toc", c.toc);
  } else {
    c.maxY = num0("au-maxy", 0.5, 30, c.maxY);
    c.tran = Math.floor(num0("au-tran", 1, 9999, c.tran));
    c.tho = num0("au-tho", 0, 1e4, c.tho);
    c.thuong = Math.floor(num0("au-thuong", 1, AU_TT_MAX, c.thuong));
    c.toc = sel("au-toc", c.toc);
    const k = q("au-kt");
    if (k) c.kt = k.checked;
    const nh = q("au-nehac");
    if (nh) c.neHac = nh.checked;
    const dai = q("au-danh-ai");
    if (dai) c.danhAi = dai.checked;
    const mau = AU_MAU_ID.filter((id) => {
      const el = q("au-mau-" + id);
      return el ? el.checked : (c.mau || AU_MAU_DEF).includes(id);
    });
    if (mau.length) c.mau = mau;
    else {
      // phải giữ ít nhất một màu: trả lại lựa chọn cũ
      c.mau = auMauNorm(c.mau);
      AU_MAU_ID.forEach((id) => {
        const el = q("au-mau-" + id);
        if (el) el.checked = c.mau.includes(id);
      });
      try {
        UI.notify("Cần giữ ít nhất một màu. Đã trả lại lựa chọn cũ.");
      } catch (e) {
        /* bỏ qua */
      }
    }
  }
  auSave();
}
const auFld = (id, lab, v, hint) =>
  `<label style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin:5px 0;font-size:13px"><span>${lab}${hint ? ` <span class="vk-mu" style="font-size:11px">${hint}</span>` : ""}</span><input class="vk-sel" id="${id}" type="number" step="any" value="${v}" style="width:92px;text-align:right"></label>`;
const auHiemSel = (v) =>
  `<label style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin:5px 0;font-size:13px"><span>Nơi Nguy Hiểm Tối Đa Được Đi</span><select class="vk-sel" id="au-hiem" style="width:150px"><option value="an_toan" ${v === "an_toan" ? "selected" : ""}>An Toàn</option><option value="ngang_suc" ${v === "ngang_suc" ? "selected" : ""}>Vừa Sức</option></select></label>`;
const auTocSel = (v) =>
  `<label style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin:5px 0;font-size:13px"><span>Tốc Độ Chạy <span class="vk-mu" style="font-size:11px">(Máy Yếu Chọn Vừa Hoặc Chậm)</span></span><select class="vk-sel" id="au-toc" style="width:150px">${Object.entries(
    AU_TOC,
  )
    .map(
      ([k, t]) =>
        `<option value="${k}" ${v === k ? "selected" : ""}>${t[0]}</option>`,
    )
    .join("")}</select></label>`;
const auTTSel = (v, id = "au-thuong") =>
  `<label style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin:5px 0;font-size:13px"><span>Dừng Khi Thương Thế Từ</span><select class="vk-sel" id="${id}" style="width:150px">${[
    1, 2, 3,
  ]
    .filter((i) => i <= AU_TT_MAX)
    .map(
      (i) =>
        `<option value="${i}" ${Number(v) === i ? "selected" : ""}>${esc(AU_TT_TEN[i])}</option>`,
    )
    .join("")}</select></label>`;
function auStatusHtml(kind) {
  const st = AU.run,
    run = G() && G().state.run;
  if (!st || st.kind !== kind)
    return '<div class="vk-mu" style="font-size:13px">Chưa chạy.</div>';
  if (kind === "km") return auKmStatus(st);
  const nv = run ? run.nhanVat : null;
  const rows = [
    [
      "Trạng Thái",
      st.running ? '<span class="vk-ok">Đang chạy…</span>' : "Đã dừng",
    ],
    ["Lý Do Dừng", st.running ? "—" : esc(st.msg || "—")],
  ];
  if (kind === "sdb") {
    const g2 = G(),
      run2 = g2 && g2.state && g2.state.run,
      nv2 = run2 && run2.nhanVat;
    const sc2 = run2 ? scanDiBao([run2, g2.state.meta]) : null;
    const metaRelics2 =
      g2 &&
      g2.state &&
      g2.state.meta &&
      g2.state.meta.tienLo &&
      g2.state.meta.tienLo.relics
        ? g2.state.meta.tienLo.relics
        : [];
    const pity2 =
      run2 && nv2 && sc2
        ? calcDiBaoPity(run2, nv2, sc2)
        : { waitYears: 0, mult: 1 };
    rows.push(["Dị Bảo Đoạt Được", (st.relicsWon || 0) + " món"]);
    rows.push([
      "Bảo Lục Luân Hồi",
      metaRelics2.length +
        " / 21 (+ " +
        metaRelics2.length * 5 +
        " điểm)",
    ]);
    rows.push([
      "Thiên Đạo Bù (Pity)",
      pity2.guaranteed
        ? '<b class="vk-ok" style="color:#ef4444">100% XUẤT THẾ (Rơi khi thắng: 7%)</b>'
        : pity2.waitYears + " / 500 năm (×" + pity2.mult + ")",
    ]);
    rows.push([
      "Mục Tiêu Đang Săn",
      esc(st.targetTitle || "Đang quét bản đồ…"),
    ]);
    rows.push([
      "Hành Động Hiện Tại",
      esc(
        st.phaseDesc ||
          (st.camping ? "Cắm trại tại " + st.camping : "—"),
      ),
    ]);
  } else if (kind === "tl") {
    const tr = Number(
      AU.cfg.tl.targetRealm != null ? AU.cfg.tl.targetRealm : 5,
    );
    const tsr = Number(
      AU.cfg.tl.targetSubRealm != null ? AU.cfg.tl.targetSubRealm : 3,
    );
    const subRealmNames = [
      "Sơ kỳ",
      "Trung kỳ",
      "Hậu kỳ",
      "Đại viên mãn",
      "Đại viên mãn (Đầy 100%)",
    ];
    let targetLabel = "♾️ Không Giới Hạn (Farm Liên Tục)";
    if (tr > 0) {
      targetLabel = realmName(tr);
      if (tsr >= 0 && tsr <= 4) {
        targetLabel += " · " + subRealmNames[tsr];
      }
    }
    rows.push(["Cảnh Giới Đích", esc(targetLabel)]);
    rows.push([
      "Phương Thức Tu Luyện",
      AU.cfg.tl.mode === "danh_quai"
        ? "⚔️ Đánh Quái (Săn Yêu Thú)"
        : "🧘 Bế Quan (Nhập Định)",
    ]);
    // Tính toán tổng lượng tu vi đã tăng trong phiên Auto
    try {
      const runNow = G().state && G().state.run;
      if (
        runNow &&
        runNow.nhanVat &&
        typeof calcTotalTuVi === "function"
      ) {
        const nowTotal = calcTotalTuVi(runNow.nhanVat);
        if (st.startTotalTuVi == null) st.startTotalTuVi = nowTotal;
        st.tuViGained = Math.max(0, nowTotal - st.startTotalTuVi);
      }
    } catch (e) {}
    rows.push([
      "Tu Vi Đã Tăng",
      '<b class="vk-ok" style="color:var(--acc, #10b981)">+' +
        num(Math.round((st.tuViGained || 0) * 10) / 10) +
        "</b>",
    ]);
    if (AU.cfg.tl.mode === "danh_quai") {
      rows.push([
        "Số Trận Đã Đánh",
        (st.fights || 0) + " (thắng " + (st.wins || 0) + ")",
      ]);
      if (st.tuViEventsDone) {
        rows.push(["Sự Kiện Tu Vi Đã Qua", st.tuViEventsDone + " lần"]);
      }
      if (st.hacSkipped) rows.push(["Số Lần Né Hạc", st.hacSkipped]);
    } else {
      rows.push([
        "Số Năm Đã Bế Quan",
        num(st.retreatYearsDone || 0) + " năm",
      ]);
    }
    rows.push(["Đột Phá Thành Công", (st.breakouts || 0) + " lần"]);
    if (st.breakoutFails)
      rows.push(["Đột Phá Thất Bại", st.breakoutFails + " lần"]);
    if (st.bottlenecksBroken)
      rows.push(["Bình Cảnh Đã Phá", st.bottlenecksBroken + " lần"]);
  } else if (kind === "san") {
    rows.push([
      "Số Trận Đã Đánh",
      st.fights + " (thắng " + st.wins + ")",
    ]);
    if (st.hacSkipped) rows.push(["Số Lần Né Hạc", st.hacSkipped]);
  } else {
    rows.push(["Số Chuyến Đã Xong", st.trips]);
    rows.push(["Lãi Ròng", Math.round(st.profit) + " Linh Thạch"]);
    if (st.running && st.route)
      rows.push([
        "Đang Làm",
        esc(st.route.it.ten) +
          " · " +
          esc(
            {
              plan: "Lập kế hoạch",
              toBuy: "Đi tới nơi mua",
              buy: "Đang mua",
              pickSell: "Dò nơi bán",
              toSell: "Đi tới nơi bán",
              sell: "Đang bán",
            }[st.phase] || st.phase,
          ),
      ]);
  }
  rows.push([
    "Tốc Độ Thực",
    num(
      st.steps /
        Math.max(
          0.001,
          ((st.tEnd || performance.now()) - st.t0) / 1000,
        ),
      1,
    ) + " bước/giây",
  ]);
  if (nv && run) {
    rows.push(["Năm Đã Trôi", num(run.nam - st.nam0)]);
    rows.push([
      "Linh Thạch Thay Đổi",
      (Math.floor(nv.linhThach) - st.lt0 >= 0 ? "+" : "") +
        (Math.floor(nv.linhThach) - st.lt0),
    ]);
    rows.push(["Thọ Nguyên Còn", Math.floor(auLifeLeft()) + " năm"]);
  }
  return rows
    .map(
      (r) =>
        `<div class="vk-row"><span>${r[0]}</span><b>${r[1]}</b></div>`,
    )
    .join("");
}
function auLogHtml() {
  return AU.log.length
    ? AU.log
        .slice(-30)
        .reverse()
        .map(
          (l) =>
            `<div class="${l.cls}" style="font-size:12px;margin:2px 0">${esc(l.msg)}</div>`,
        )
        .join("")
    : '<div class="vk-mu" style="font-size:12px">Chưa có nhật ký.</div>';
}
function auPaint() {
  refreshMiniStatus();
  if (!UI.isOpen()) return;
  if (S.tab === "arr") {
    rrPaint();
    return;
  }
  if (S.tab === "db") {
    const run = AU.run && AU.run.running && AU.run.kind === "sdb";
    const box = body.querySelector("#db-auto-box");
    const pill = body.querySelector("#db-auto-status-pill");
    const txt = body.querySelector("#db-auto-status-text");
    const btn = body.querySelector("#db-auto-toggle");
    if (box) box.style.borderColor = run ? "#3ddc97" : "var(--line)";
    if (pill) {
      pill.textContent = run ? "● ĐANG CHẠY" : "○ TẠM DỪNG";
      pill.style.background = run
        ? "rgba(61,220,151,0.2)"
        : "rgba(255,255,255,0.08)";
      pill.style.color = run ? "#3ddc97" : "var(--mut)";
      pill.style.border = run
        ? "1px solid #3ddc97"
        : "1px solid transparent";
    }
    if (txt) {
      if (run) {
        txt.textContent =
          AU.run.phaseDesc ||
          AU.run.targetTitle ||
          "Đang quét bản đồ & săn Dị Bảo...";
      } else if (AU.run && AU.run.kind === "sdb" && AU.run.msg) {
        txt.innerHTML = `<span class="vk-bad">Dừng: ${esc(AU.run.msg)}</span>`;
      } else {
        txt.textContent =
          "Tự động truyền tống/bay đến mục tiêu, vào sự kiện, vượt kiểm định & đánh Hộ Vệ.";
      }
    }
    if (btn) {
      btn.textContent = run ? "⏹ Dừng Auto" : "▶ Bắt Đầu Săn";
      btn.style.background = run ? "#f87171" : "var(--acc)";
    }
    const tgtEl = body.querySelector("#db-auto-target-text");
    if (tgtEl) {
      const sdbCfg = AU.cfg && AU.cfg.sdb ? AU.cfg.sdb : {};
      const validEvs = DIBAO.ev.filter(
        (e) => e && e.relic && typeof e.relic === "string" && e.relic.trim() !== "",
      );
      const targetRelics = (
        Array.isArray(sdbCfg.targetRelics)
          ? sdbCfg.targetRelics
          : validEvs.map((e) => e.relic)
      ).filter((r) => r && typeof r === "string" && r.trim() !== "");
      tgtEl.innerHTML =
        targetRelics.length === validEvs.length
          ? "Tất cả 19 Dị Bảo"
          : targetRelics.length === 0
            ? '<span class="vk-bad">Chưa chọn món nào</span>'
            : `<b>${targetRelics.length}</b>/19 Dị Bảo đã chọn`;
    }
    return;
  }
  const kind =
    S.tab === "abb"
      ? "buon"
      : S.tab === "asy"
        ? "san"
        : S.tab === "akm"
          ? "km"
          : S.tab === "atl"
            ? "tl"
            : S.tab === "asdb"
              ? "sdb"
              : null;
  if (!kind) return;
  const a = body.querySelector("#au-st"),
    b = body.querySelector("#au-lg");
  if (a) a.innerHTML = auStatusHtml(kind);
  if (b) b.innerHTML = auLogHtml();
  const run = AU.run && AU.run.running;
  body.querySelectorAll(".au-go").forEach((x) => {
    x.disabled = !!run;
  });
  const sp = body.querySelector("#au-stop");
  if (sp) sp.disabled = !run;
}
function auControls() {
  return `<div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px"><button class="vk-btn au-go" id="au-run">Chạy Tự Động</button><button class="vk-btn sec au-go" id="au-one">Chạy 1 Bước</button><button class="vk-btn sec" id="au-stop">Dừng</button></div>`;
}
function auBind(kind) {
  body.querySelectorAll("input,select").forEach((el) => {
    el.onchange = () => auReadCfg(kind);
  });
  body.querySelector("#au-run").onclick = () => auStart(kind, false);
  body.querySelector("#au-one").onclick = () => auStart(kind, true);
  body.querySelector("#au-stop").onclick = () => auStop("Bạn bấm Dừng");
  auPaint();
}
const AU_MAU_ACT = {
  an_toan: "Tự săn, tự Tốc Chiến.",
  ngang_suc: "Tự săn, tự Tốc Chiến (có thể mang thương).",
  hiem: "Tự tới nơi và chọn giao chiến. Game dự đoán thua nên không cho Tốc Chiến: Auto dừng ngay khi trận mở để bạn tự đánh.",
  tu_dia:
    "Như Đỏ (kể cả “thần thức không dò ra”) nhưng là tử địa, rủi ro chết rất cao: chỉ tích khi bạn chắc chắn.",
};
const auMauHtml = (mau, prefix = "au-mau") =>
  AU_MAU_ID.map((k) => {
    const m = AU_MAU[k];
    return `<label class="vk-lg" style="cursor:pointer;align-items:flex-start"><input type="checkbox" id="${prefix}-${k}" ${mau.includes(k) ? "checked" : ""} style="margin-top:5px"><span class="vk-sw" style="background:${m[1]}">${m[0].charAt(0)}</span><span><b>${m[0]}</b> · ${esc(m[2])}<br><span class="vk-mu" style="font-size:12px">${esc(AU_MAU_ACT[k])}</span></span></label>`;
  }).join("");
