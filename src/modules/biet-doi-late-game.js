/**
 * Module: Biệt Đội Late Game · Kinh Mạch Tối Thượng (Best-in-Slot Solver)
 */
// ───────────────────────── Biệt Đội Late Game · Kinh Mạch Tối Thượng (Bản 7.2.0) ─────────────────────────
// Phân tích toàn diện Linh Căn của kiếp hiện tại (Đơn Linh Căn, Song Linh Căn, Tam/Tứ/Ngũ Linh Căn, Dị Căn hay Phàm Căn).
// Quét toàn bộ kho dữ liệu game (c.items), suy diễn chuỗi Ngũ Hành Tương Sinh (Mẹ dưỡng & Con trợ, Cầu nối) và khóa chặt các hệ tương khắc.
// Giả định full lượt tẩy tủy cho toàn bộ ô kinh mạch late game để tìm cấu hình Best-in-Slot (BIS) mạnh nhất cho đúng Linh Căn đó.
// Sinh cẩm nang săn đồ chi tiết (quái/boss rơi, tiệm bán, sự kiện Dị Bảo, công thức luyện).

function bisDeduceElements(lc) {
  let baseHe = [];
  if (lc) {
    if (Array.isArray(lc.he)) baseHe = lc.he;
    else if (Array.isArray(lc)) baseHe = lc;
    else if (typeof lc.he === "string") baseHe = [lc.he];
    else if (typeof lc === "string") baseHe = [lc];
  }
  baseHe = baseHe
    .map((h) => String(h).toLowerCase().trim())
    .filter((h) => h && h !== "vo" && h !== "vo_sac");

  const SINH = {
    kim: "thuy",
    thuy: "moc",
    moc: "hoa",
    hoa: "tho",
    tho: "kim",
  };
  const KHAC = {
    kim: "moc",
    moc: "tho",
    tho: "thuy",
    thuy: "hoa",
    hoa: "kim",
  };
  const ME = {
    thuy: "kim",
    moc: "thuy",
    hoa: "moc",
    tho: "hoa",
    kim: "tho",
  };
  const GOC = { loi: "moc", phong: "moc", bang: "thuy", am: "thuy" };
  const ALL_ROOTS = ["kim", "moc", "thuy", "hoa", "tho"];

  const baseRoots = [...new Set(baseHe.map((h) => GOC[h] || h))];
  const relatedRoots = new Set(baseRoots);
  const bridges = [];
  const forbiddenRoots = new Set();

  if (baseRoots.length === 1) {
    // Đơn Linh Căn (hoặc Dị Linh Căn 1 hệ):
    // Hệ bản mệnh r; tương sinh hỗ trợ: Mẹ sinh ra r (sinh nhập) và r sinh ra Con (sinh xuất)
    const r = baseRoots[0];
    const me = ME[r];
    const con = SINH[r];
    relatedRoots.add(me);
    relatedRoots.add(con);

    // Khóa chặt 2 hệ tương khắc trực tiếp với r để triệt tiêu điểm nghịch:
    forbiddenRoots.add(KHAC[r]); // Hệ bị r khắc
    for (const [k, v] of Object.entries(KHAC)) {
      if (v === r) forbiddenRoots.add(k); // Hệ khắc r
    }
  } else if (baseRoots.length === 2) {
    const [a, b] = baseRoots;
    if (SINH[a] === b || SINH[b] === a) {
      // Hai hệ đã tương sinh trực tiếp (ví dụ Thổ sinh Kim, Kim sinh Thủy...)
      const allowed = new Set([a, b]);
      ALL_ROOTS.forEach((x) => {
        if (!allowed.has(x)) forbiddenRoots.add(x);
      });
    } else {
      // Hai hệ cách nhau 1 bước trong chuỗi tương sinh -> Cần cầu nối tương sinh ở giữa
      for (const x of baseRoots) {
        const c = SINH[x];
        if (c && !baseRoots.includes(c)) {
          const d = SINH[c];
          if (baseRoots.includes(d)) {
            relatedRoots.add(c);
            bridges.push({ from: x, bridge: c, to: d });
          }
        }
      }
      ALL_ROOTS.forEach((x) => {
        if (!relatedRoots.has(x)) forbiddenRoots.add(x);
      });
    }
  } else if (baseRoots.length >= 3) {
    // Tam Linh Căn / Tứ Linh Căn
    for (const x of baseRoots) {
      const c = SINH[x];
      if (c && !baseRoots.includes(c)) {
        const d = SINH[c];
        if (baseRoots.includes(d)) {
          relatedRoots.add(c);
          bridges.push({ from: x, bridge: c, to: d });
        }
      }
    }
    ALL_ROOTS.forEach((x) => {
      if (!relatedRoots.has(x)) forbiddenRoots.add(x);
    });
  } else {
    // Phàm Căn (không có linh căn): Cho phép toàn bộ hệ tự do, không cấm hệ nào
    ALL_ROOTS.forEach((x) => relatedRoots.add(x));
  }

  // Mở rộng các dị linh căn nhánh tương ứng
  const allElements = new Set(relatedRoots);
  for (const [sub, root] of Object.entries(GOC)) {
    if (relatedRoots.has(root)) allElements.add(sub);
  }
  allElements.add("vo_sac");

  // Khóa các dị linh căn thuộc nhánh tương khắc
  const forbidden = new Set(forbiddenRoots);
  for (const [sub, root] of Object.entries(GOC)) {
    if (forbiddenRoots.has(root)) forbidden.add(sub);
  }

  const lcPhamRaw =
    (lc && lc.pham) ||
    (baseHe.length === 1
      ? "thien"
      : baseHe.length === 2
        ? "song"
        : baseHe.length === 3
          ? "tam"
          : baseHe.length === 4
            ? "tu"
            : baseHe.length === 5
              ? "hon_don"
              : "vo");

  return {
    lcPham: lcPhamRaw,
    baseHe,
    baseRoots,
    relatedRoots: [...relatedRoots],
    bridges,
    forbiddenRoots: [...forbiddenRoots],
    forbidden: [...forbidden],
    allElements: [...allElements],
  };
}

function bisSelectPool(deduced, targetRealm, mode) {
  const c = C();
  if (!c || !c.items) return [];
  const setHe = new Set(
    deduced.allElements.map((h) => String(h).toLowerCase()),
  );
  const setForbidden = new Set(
    deduced.forbidden.map((h) => String(h).toLowerCase()),
  );
  const baseHeSet = new Set(
    deduced.baseHe.map((h) => String(h).toLowerCase()),
  );
  const baseRootSet = new Set(
    deduced.baseRoots.map((h) => String(h).toLowerCase()),
  );
  const relRootSet = new Set(
    deduced.relatedRoots.map((h) => String(h).toLowerCase()),
  );

  const cpList = [];
  const pkList = [];

  for (const it of c.items.values()) {
    if (!it || (!it.hinh && !it.manh)) continue;
    if (it.loai !== "cong_phap" && it.loai !== "phap_khi") continue;
    if ((it.canh_gioi ?? 0) > targetRealm) continue;

    const pham = it.pham_cap || it.pham || 0;
    if (pham < 3 && (it.canh_gioi ?? 0) < targetRealm - 1) continue;

    const heRaw = it.he || ["vo_sac"];
    const heArr = (Array.isArray(heRaw) ? heRaw : [heRaw]).map((h) =>
      String(h).toLowerCase(),
    );

    // 1. Tuyệt đối loại bỏ nếu chứa hệ tương khắc:
    if (heArr.some((h) => setForbidden.has(h))) continue;

    // 2. Phải có ít nhất 1 hệ nằm trong tập hợp cho phép hoặc là vô sắc:
    const hasAllowed = heArr.some(
      (h) => setHe.has(h) || h === "vo" || h === "vo_sac",
    );
    if (!hasAllowed) continue;

    // 3. Tính điểm chất lượng và độ hợp với Linh Căn hiện tại của kiếp này:
    let score = pham * 32 + (it.canh_gioi ?? 0) * 16;
    if (pham >= 7) score += 65; // Nghịch thiên / Thần phẩm

    // Thưởng tương thích Linh Căn hiện tại:
    const matchesBaseHe = heArr.some((h) => baseHeSet.has(h));
    const matchesBaseRoot = heArr.some((h) =>
      baseRootSet.has(gocHe(h)),
    );
    const matchesRelRoot = heArr.some((h) => relRootSet.has(gocHe(h)));

    if (matchesBaseHe) {
      score += 90; // Trùng khớp Linh Căn bản mệnh của kiếp này!
    } else if (matchesBaseRoot) {
      score += 65; // Dị căn cùng gốc với Linh Căn kiếp này!
    } else if (matchesRelRoot) {
      score += 35; // Hệ tương sinh tiếp sức
    } else {
      score += 20; // Vô sắc trung tính
    }

    // Điểm theo chiến thuật:
    if (mode === "danh") {
      if (it.chieu && it.chieu.length) {
        score += 35;
        const totalUy = it.chieu.reduce(
          (a, x) => a + (x.uyLuc || x.uy || 0),
          0,
        );
        score += Math.min(30, Math.round(totalUy / 10));
      }
    } else if (mode === "tu") {
      if (it.biDong && (it.biDong.toc_do || it.biDong.dot_pha))
        score += 55;
    } else {
      // bal
      if (it.biDong && (it.biDong.hp || it.biDong.giap)) score += 40;
      if (it.chieu && it.chieu.length) score += 20;
    }

    // Dị bảo thế giới hoặc Boss rơi:
    if (
      DIBAO.ev.some((e) => e.relic === it.id) ||
      DIBAO.boss.includes(it.id)
    ) {
      score += 30;
    }

    const entry = { it, id: it.id, score };
    if (it.loai === "cong_phap") cpList.push(entry);
    else pkList.push(entry);
  }

  cpList.sort((a, b) => b.score - a.score);
  pkList.sort((a, b) => b.score - a.score);

  // Cân bằng tỉ lệ: lấy top Công Pháp (để dẫn truyền thông mạch) và top Pháp Khí (để chiến đấu)
  const pool = [];
  const seenNames = new Set();
  const addEntry = (entry) => {
    if (!entry || seenNames.has(entry.it.ten)) return;
    seenNames.add(entry.it.ten);
    pool.push(entry.it);
  };

  const maxCp = 18;
  const maxPk = 20;
  for (let i = 0; i < Math.max(cpList.length, pkList.length); i++) {
    if (
      i < cpList.length &&
      pool.filter((x) => x.loai === "cong_phap").length < maxCp
    ) {
      addEntry(cpList[i]);
    }
    if (
      i < pkList.length &&
      pool.filter((x) => x.loai === "phap_khi").length < maxPk
    ) {
      addEntry(pkList[i]);
    }
    if (pool.length >= 38) break;
  }

  // Nếu thiếu, bù thêm các món còn lại có điểm cao nhất
  if (pool.length < 32) {
    const remaining = [...cpList, ...pkList].sort(
      (a, b) => b.score - a.score,
    );
    for (const entry of remaining) {
      addEntry(entry);
      if (pool.length >= 36) break;
    }
  }

  return pool;
}

function createBisMockNv(nvReal, targetRealm, pool) {
  const nvMock = clone(nvReal);
  const K = S.core,
    c = C();
  nvMock.canhGioi = targetRealm;
  nvMock.tieuCanhGioi = 3;

  nvMock.tuiDo = {};
  for (const it of pool) {
    nvMock.tuiDo[it.id] = 1;
  }

  const g = K.luoiKinhMach(c, nvMock);
  const km = nvMock.kinhMach || {};
  const totalCells = g.rong * g.cao;
  km.mau = Array.isArray(km.mau)
    ? [...km.mau]
    : new Array(totalCells).fill("vo_sac");
  while (km.mau.length < totalCells) km.mau.push("vo_sac");

  km.trangThai = new Array(totalCells).fill("an");
  for (let i = 0; i < totalCells; i++) {
    if (g.vung && g.vung[i] >= 0 && g.vung[i] <= targetRealm) {
      km.trangThai[i] = "thong";
    }
  }
  km.manh = [];
  nvMock.kinhMach = km;
  return nvMock;
}

function makeBisEval(nv0, enemies, mode, deduced) {
  const K = S.core,
    c = C();
  const cache = new Map();
  const g = K.luoiKinhMach(c, nv0);
  const baseHeSet = new Set(
    deduced.baseHe.map((h) => String(h).toLowerCase()),
  );
  const baseRootSet = new Set(
    deduced.baseRoots.map((h) => String(h).toLowerCase()),
  );
  const relRootSet = new Set(
    deduced.relatedRoots.map((h) => String(h).toLowerCase()),
  );

  return (input) => {
    const rawList = Array.isArray(input)
      ? input
      : input && Array.isArray(input.manh)
        ? input.manh
        : [];
    const manh = rawList
      .map((p) => {
        if (!p) return null;
        if (p.m) return p;
        const it = c.items.get(p.item);
        const cells = K.oCuaManh(g, p, it) || [];
        return {
          m: p,
          cells,
          key: p.item + ":" + p.x + "," + p.y + "," + p.xoay,
        };
      })
      .filter(Boolean);

    const key = manh
      .map((p) => p.m.item + "@" + p.m.x + "," + p.m.y + "," + p.m.xoay)
      .sort()
      .join("|");
    if (cache.has(key)) return cache.get(key);

    const nv = clone(nv0);
    nv.kinhMach.manh = manh.map((p) => ({ ...p.m }));

    // Giả định tẩy tủy: Đổi màu các ô mà món đó chiếm giữ sang hệ tương thích nhất của món theo Linh Căn
    manh.forEach((p) => {
      const it = c.items.get(p.m.item);
      if (!it) return;
      const heRaw = it.he || ["vo_sac"];
      const heArr = Array.isArray(heRaw) ? heRaw : [heRaw];
      let chosenHe =
        heArr.find((h) => baseHeSet.has(String(h).toLowerCase())) ||
        heArr.find((h) =>
          baseRootSet.has(gocHe(String(h).toLowerCase())),
        ) ||
        heArr.find((h) =>
          relRootSet.has(gocHe(String(h).toLowerCase())),
        ) ||
        heArr[0] ||
        "vo_sac";
      chosenHe = String(chosenHe).toLowerCase();

      const cells = p.cells || K.oCuaManh(g, p.m, it) || [];
      for (const idx of cells) {
        if (idx >= 0 && idx < nv.kinhMach.mau.length) {
          if (chosenHe !== "vo" && chosenHe !== "vo_sac") {
            nv.kinhMach.mau[idx] = chosenHe;
          }
        }
      }
    });

    const R = K.tinhKinhMach(nv, c),
      P = K.taoBenTa(nv, c);
    let fightScore = 0,
      wins = 0;
    for (const { E } of enemies) {
      const r = fight(P, E);
      const hpLeft = r.khiHuyetThapNhat / Math.max(1, P.khiHuyetToiDa);
      const dealt = Math.min(
        1,
        ((r.stTa || 0) * Math.max(1, r.nHiep)) /
          Math.max(1, E.khiHuyetToiDa),
      );
      if (r.thang) {
        wins++;
        fightScore +=
          mode === "danh"
            ? 100 + 20 * hpLeft + 60 / Math.max(1, r.nHiep)
            : 100 + 50 * hpLeft + 25 / Math.max(1, r.nHiep);
      } else {
        fightScore += 50 * dealt;
      }
    }

    const thong = R.manh.filter((m) => m && m.thong).length;
    const dead = R.manh.filter((m) => m && !m.thong).length;
    const toc = R.biDong.toc_do || 0,
      dp = R.biDong.dot_pha || 0;
    const ng = (R.diemNghich || 0) * 20; // Phạt nặng điểm nghịch hệ
    const ll = P.linhLucMoiLuot || 0;
    const atk = (P.chieu || [])
      .filter((x) => x.dang && x.phi > 0)
      .map((x) => x.phi);
    const minCost = atk.length ? Math.min(...atk) : 0;
    const llScore =
      (mode === "tu" ? 1 : mode === "danh" ? 6 : 4) * ll -
      (minCost && ll < minCost ? 35 : 0);

    // Thưởng tương thích bản mệnh Linh Căn kiếp này:
    let lcBonus = 0;
    manh.forEach((p) => {
      const it = c.items.get(p.m.item);
      if (!it) return;
      const itHeArr = (
        Array.isArray(it.he) ? it.he : [it.he || "vo_sac"]
      ).map((h) => String(h).toLowerCase());
      if (itHeArr.some((h) => baseHeSet.has(h))) lcBonus += 25;
      else if (itHeArr.some((h) => baseRootSet.has(gocHe(h))))
        lcBonus += 15;
      else if (itHeArr.some((h) => relRootSet.has(gocHe(h))))
        lcBonus += 8;
    });

    let s;
    if (mode === "tu")
      s =
        0.3 * fightScore +
        500 * toc +
        400 * dp +
        thong * 5 -
        ng +
        llScore;
    else if (mode === "danh")
      s = fightScore * 1.5 + thong * 2 - ng + llScore;
    else s = fightScore + 35 * toc + 25 * dp + thong * 2 - ng + llScore;

    s += lcBonus;
    s -= dead * 80; // Phạt nặng mảnh không thông
    s +=
      12 * manh.reduce((a, p) => a + (p.cells ? p.cells.length : 0), 0);

    const out = { s, wins, P, R, nvFinal: nv };
    cache.set(key, out);
    return out;
  };
}

async function bisGreedy(mockNv, customEval, onProg) {
  const K = S.core,
    c = C();
  const { cand, g } = buildCandidates(mockNv);
  const ids = Object.keys(cand).filter((k) => cand[k].length);
  const items = c.items;

  let cur = [];
  let curS = customEval(cur).s;
  const usedCells = new Set();

  for (let round = 0; round < 35; round++) {
    let best = null;
    const validCands = [];

    for (const id of ids) {
      if (cur.some((p) => p.m.item === id)) continue;
      const it = items.get(id);
      const isCp = it && it.loai === "cong_phap";

      for (const cn of cand[id]) {
        if (cn.cells.some((x) => usedCells.has(x))) continue;

        if (round === 0) {
          const touchesDanDien = cn.cells.some((x) => {
            const cx = x % g.rong;
            return (
              [
                cx > 0 ? x - 1 : -1,
                cx < g.rong - 1 ? x + 1 : -1,
                x - g.rong,
                x + g.rong,
              ].some((n) => n === g.danDien) || x === g.danDien
            );
          });
          if (!touchesDanDien) continue;
          validCands.push({ cn, prio: isCp ? 100 : 30 });
        } else {
          const isAdj = cn.cells.some((x) => {
            const cx = x % g.rong;
            return [
              cx > 0 ? x - 1 : -1,
              cx < g.rong - 1 ? x + 1 : -1,
              x - g.rong,
              x + g.rong,
            ].some((n) => n === g.danDien || usedCells.has(n));
          });
          if (isAdj) {
            validCands.push({ cn, prio: isCp ? 20 : 10 });
          }
        }
      }
    }

    if (!validCands.length) break;

    validCands.sort(
      (a, b) =>
        b.prio +
        b.cn.cells.length * 2 -
        (a.prio + a.cn.cells.length * 2),
    );
    const topCandidates = validCands.slice(0, 15);
    for (const { cn } of topCandidates) {
      const next = [...cur, cn];
      const evRes = customEval(next);
      if (!best || evRes.s > best.s) {
        best = { s: evRes.s, cn };
      }
    }

    if (!best || best.s <= curS) break;

    cur.push(best.cn);
    curS = best.s;
    best.cn.cells.forEach((x) => usedCells.add(x));

    if (round % 3 === 0) await sleep0();
  }

  return cur.map((p) => ({ ...p.m }));
}

function bisGetItemHuntingGuide(it) {
  if (!it) return null;
  const tc = tcBuild();
  const id = it.id;
  const res = { dibao: null, drops: [], shops: [], craft: null };

  // 1. Dị bảo thế giới
  const dbEv = DIBAO.evRelicMap.get(id);
  if (dbEv) {
    res.dibao = {
      name: dbEv.ten,
      place: dbEv.dia || dbEv.noi || "Hoang dã",
      check: dbEv.chk ? dbEv.chk.replace(/_/g, " ") : null,
      boss: dbEv.bv
        ? `${dbEv.bv} (${realmName(dbEv.bvcg ?? 5)})`
        : null,
    };
  }

  // 2. Quái / Boss rơi
  const drops = tc.drops.get(id) || [];
  for (const d of drops) {
    if (d.mon && d.mon.e) {
      const e = d.mon.e;
      res.drops.push({
        name: d.mon.name,
        cg: realmName(e.canh_gioi ?? 0),
        rate:
          d.kind === "chac"
            ? "100%"
            : d.p
              ? `${Math.round(d.p * 100)}%`
              : "Hiếm",
      });
    }
    if (res.drops.length >= 3) break;
  }

  // 3. Tiệm mua bán
  const shops = (tc.shops || []).filter((s) => s.it && s.it.id === id);
  for (const s of shops) {
    res.shops.push({
      shop: s.name,
      price: s.price ? `${num(s.price)} LT` : "Chưa rõ",
    });
    if (res.shops.length >= 2) break;
  }

  // 4. Luyện chế
  const rec = tc.recOut.get(id);
  if (rec) {
    res.craft = {
      name: rec.ten || "Bí phương luyện chế",
      type: rec.loai || "",
    };
  }

  return res;
}

async function bisSolve(nvReal, targetRealm, mode, onProg) {
  const lc = nvReal.linhCan;
  const deduced = bisDeduceElements(lc);
  const pool = bisSelectPool(deduced, targetRealm, mode);
  if (!pool.length)
    throw new Error(
      "Không tìm thấy đủ vật phẩm phù hợp trong dữ liệu game theo Linh Căn này.",
    );

  const mockNv = createBisMockNv(nvReal, targetRealm, pool);
  const enemies = benchEnemies(targetRealm, 3);
  const customEval = makeBisEval(mockNv, enemies, mode, deduced);

  onProg(10, "Quét toàn bộ data game & phân tích chuỗi tương sinh...");
  const init = await bisGreedy(mockNv, customEval, onProg);

  onProg(30, "Luyện kim mô phỏng (Simulated Annealing) tối ưu hóa...");
  const annealed = await anneal({
    nv0: mockNv,
    mode,
    iters: 400,
    init,
    onProg: (pct, best) =>
      onProg(30 + pct * 45, "Đang hoán vị tối ưu vị trí mảnh ghép..."),
    label: "Đang giải ma trận kinh mạch...",
    seed: 8888,
    customEval,
  });

  onProg(75, "Tinh chỉnh leo đồi lần cuối (Hill Climbing Polish)...");
  const polished = await polish(
    mockNv,
    mode,
    annealed,
    (pct) => onProg(75 + pct * 23, "Đang lấp đầy các ô kề cạnh..."),
    customEval,
  );
  onProg(100, "Hoàn thành!");

  const finalManh =
    polished && Array.isArray(polished.manh) && polished.manh.length
      ? polished.manh
      : annealed && Array.isArray(annealed.manh) && annealed.manh.length
        ? annealed.manh
        : init && init.length
          ? init
          : [];

  const evalFinal = customEval(finalManh);
  return {
    deduced,
    pool,
    mockNv,
    evalFinal,
    manh: finalManh,
    nvFinal: evalFinal.nvFinal || mockNv,
  };
}

function tabBis() {
  const g = G(),
    run = g && g.state && g.state.run,
    nv = run && run.nhanVat;
  if (!nv) {
    body.innerHTML = `
<div class="vk-card">
  <h2 style="margin:0 0 6px;color:var(--acc);font-size:16px">🌌 Biệt Đội Late Game · Kinh Mạch Tối Thượng</h2>
  <div class="vk-mu" style="font-size:13px;line-height:1.5">
    Chưa tìm thấy dữ liệu nhân vật của kiếp hiện tại. Hãy vào một ván chơi (hoặc tiếp tục kiếp đang tu luyện) để Trợ Lý quét dữ liệu Linh Căn và thiết lập Biệt Đội Late Game tối ưu!
  </div>
</div>
      `;
    return;
  }

  const lc = nv.linhCan;
  const deduced = bisDeduceElements(lc);
  const c = C();
  const K = S.core;

  if (S.bisRealm === undefined) S.bisRealm = 5;
  if (!S.bisMode) S.bisMode = "danh";

  const SINH = {
    kim: "thuy",
    thuy: "moc",
    moc: "hoa",
    hoa: "tho",
    tho: "kim",
  };
  const ME = {
    thuy: "kim",
    moc: "thuy",
    hoa: "moc",
    tho: "hoa",
    kim: "tho",
  };

  let analysisHtml = "";
  if (deduced.baseRoots.length === 1) {
    const r = deduced.baseRoots[0];
    const me = ME[r],
      con = SINH[r];
    analysisHtml = `
<div style="font-size:12.5px;margin-bottom:6px">
  <span>Hệ Bản Mệnh: </span><b style="color:var(--acc)">${heTen(r)}</b>
  <span class="vk-mu">· Tương sinh hỗ trợ: </span><b>${heTen(me)}</b> (Mẹ dưỡng) & <b>${heTen(con)}</b> (Con trợ)
</div>
<div style="font-size:12.5px;margin-bottom:6px">
  <span style="color:var(--bad)">Đã khóa hệ tương khắc: </span>
  ${deduced.forbiddenRoots.map((h) => `<span class="vk-pill" style="margin:1px;background:rgba(248,113,113,0.15);color:var(--bad);border:1px solid rgba(248,113,113,0.3)">🚫 ${heTen(h)}</span>`).join(" ")}
  <span class="vk-mu" style="font-size:11.5px">(Triệt tiêu 100% điểm nghịch hệ)</span>
</div>
      `;
  } else if (deduced.baseRoots.length === 2) {
    const [a, b] = deduced.baseRoots;
    const isDirect = SINH[a] === b || SINH[b] === a;
    const dirText =
      SINH[a] === b
        ? `${heTen(a)} ➔ ${heTen(b)}`
        : SINH[b] === a
          ? `${heTen(b)} ➔ ${heTen(a)}`
          : "";
    analysisHtml = `
<div style="font-size:12.5px;margin-bottom:6px">
  <span>Song Hệ Bản Mệnh: </span><b style="color:var(--acc)">${heTen(a)} - ${heTen(b)}</b>
  ${isDirect ? `— <span class="vk-ok" style="font-weight:bold">Đã tương sinh trực tiếp (${dirText}) ✓</span>` : ""}
</div>
${
  deduced.bridges.length
    ? `
  <div style="font-size:12.5px;margin-bottom:6px">
    <span>Cầu Nối Tương Sinh: </span>
    ${deduced.bridges.map((br) => `<b>${heTen(br.from)}</b> ➔ <span class="vk-ok" style="font-weight:bold;text-decoration:underline">${heTen(br.bridge)}</span> ➔ <b>${heTen(br.to)}</b>`).join(" &bull; ")}
  </div>
`
    : ""
}
<div style="font-size:12.5px;margin-bottom:6px">
  <span style="color:var(--bad)">Đã khóa hệ tương khắc: </span>
  ${deduced.forbiddenRoots.map((h) => `<span class="vk-pill" style="margin:1px;background:rgba(248,113,113,0.15);color:var(--bad);border:1px solid rgba(248,113,113,0.3)">🚫 ${heTen(h)}</span>`).join(" ")}
  <span class="vk-mu" style="font-size:11.5px">(Triệt tiêu 100% điểm nghịch hệ)</span>
</div>
      `;
  } else if (deduced.baseRoots.length >= 3) {
    analysisHtml = `
<div style="font-size:12.5px;margin-bottom:6px">
  <span>Đa Hệ Bản Mệnh: </span><b style="color:var(--acc)">${deduced.baseRoots.map(heTen).join(" - ")}</b>
  <span class="vk-ok">· Chuỗi tuần hoàn ngũ hành</span>
</div>
      `;
  } else {
    analysisHtml = `
<div style="font-size:12.5px;margin-bottom:6px">
  <span>Phàm Thể Tự Do: </span><b style="color:var(--acc)">Không bị giới hạn bởi linh căn</b>
  <span class="vk-mu">· Quét toàn bộ kho game để chọn combo tương sinh mạnh nhất</span>
</div>
      `;
  }

  const allHeHtml = deduced.allElements
    .map(
      (h) =>
        `<span class="vk-pill" style="margin:2px;background:var(--bg3);border:1px solid var(--line)">${heTen(h)}</span>`,
    )
    .join("");

  const currentLcKey = deduced.baseHe.join("-");
  const currentLcName =
    deduced.baseHe.map(heTen).join(" - ") || "Phàm Căn";
  const res = S.bisResult;

  let outdatedHtml = "";
  if (res && res.lcKey !== undefined && res.lcKey !== currentLcKey) {
    outdatedHtml = `
<div class="vk-card" style="border-left:4px solid var(--warn);background:rgba(251,191,36,0.1);margin-bottom:12px">
  <b style="color:var(--warn)">⚠️ Lưu ý: Kết quả hiển thị bên dưới thuộc Linh Căn của kiếp trước (${esc(res.lcText || res.lcKey)}).</b>
  <div class="vk-mu" style="font-size:12px;margin-top:4px">Linh Căn hiện tại của kiếp này là <b>${esc(currentLcName)}</b>. Hãy bấm <b>[⚡ Bắt Đầu Tính Toán]</b> bên dưới để quét toàn bộ game data và thiết lập cấu hình chuẩn nhất cho kiếp này!</div>
</div>
      `;
  }

  let progressHtml = "";
  if (S.bisRunning) {
    progressHtml = `
<div class="vk-card" style="border-left:4px solid var(--acc);background:var(--bg2);margin-bottom:12px">
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
    <b>⏳ ${esc(S.bisMsg || "Đang giải ma trận...")}</b>
    <b>${Math.round(S.bisPct || 0)}%</b>
  </div>
  <div style="background:var(--bg3);height:8px;border-radius:4px;overflow:hidden">
    <div style="background:var(--acc);height:100%;width:${Math.round(S.bisPct || 0)}%;transition:width .2s ease"></div>
  </div>
</div>
      `;
  }

  let resultHtml = "";
  if (res && res.manh) {
    const ef = res.evalFinal;
    const R = ef.R,
      P = ef.P;
    const totalChieuUy = Math.round(
      (R.chieu || []).reduce((a, x) => a + (x.uyLuc || x.uy || 0), 0),
    );
    const thongCount = R.manh.filter((m) => m && m.thong).length;

    // Đếm số ô cần tẩy tủy theo từng hệ (không đếm trùng ô)
    const g = K.luoiKinhMach(c, res.nvFinal);
    const tayTuyCounts = {};
    let totalTayTuy = 0;
    const seenCells = new Set();
    res.manh.forEach((m) => {
      const it = c.items.get(m.item);
      if (!it) return;
      const he = (Array.isArray(it.he) ? it.he[0] : it.he) || "vo_sac";
      const cells = K.oCuaManh(g, m, it) || [];
      cells.forEach((cellIdx) => {
        if (!seenCells.has(cellIdx)) {
          seenCells.add(cellIdx);
          tayTuyCounts[he] = (tayTuyCounts[he] || 0) + 1;
          totalTayTuy++;
        }
      });
    });

    const tayTuyPills = Object.entries(tayTuyCounts)
      .map(([h, cnt]) => {
        return `<span class="vk-pill" style="margin:3px;font-size:12.5px;padding:3px 8px;background:var(--bg3);border:1px solid var(--line)"><b>${heTen(h)}</b>: <b>${cnt}</b> ô</span>`;
      })
      .join(" ");

    // Checklist săn đồ
    const bag = nv.tuiDo || {};
    const kmCurrent = new Set(
      (nv.kinhMach && nv.kinhMach.manh ? nv.kinhMach.manh : []).map(
        (m) => m.item,
      ),
    );

    let huntingRows = "";
    const checklistTextLines = [];
    checklistTextLines.push(
      `=== CẨM NANG SĂN ĐỒ LATE GAME CHO LINH CĂN ${currentLcName.toUpperCase()} (${realmName(res.targetRealm)} - ${res.mode === "danh" ? "Thuần Sát Thương" : res.mode === "tu" ? "Tu Luyện" : "Công Thủ Toàn Diện"}) ===`,
    );

    res.manh.forEach((m, idx) => {
      const it = c.items.get(m.item);
      if (!it) return;
      const owned = bag[it.id] > 0 || kmCurrent.has(it.id);
      const guide = bisGetItemHuntingGuide(it);
      const he = (Array.isArray(it.he) ? it.he[0] : it.he) || "vo_sac";
      const pham = it.pham_cap || it.pham || 0;

      let srcBits = [];
      if (guide.dibao) {
        srcBits.push(
          `<span class="vk-ok">🌟 Dị Bảo Thế Giới: <b>${esc(guide.dibao.name)}</b> (${esc(guide.dibao.place)})${guide.dibao.boss ? " · Canh giữ: " + esc(guide.dibao.boss) : ""}${guide.dibao.check ? " · Yêu cầu: " + esc(guide.dibao.check) : ""}</span>`,
        );
      }
      if (guide.drops.length) {
        srcBits.push(
          `👹 Quái/Boss rơi: ${guide.drops.map((d) => `<b>${esc(d.name)}</b> (${esc(d.cg)} - ${d.rate})`).join(", ")}`,
        );
      }
      if (guide.shops.length) {
        srcBits.push(
          `🏪 Tiệm bán: ${guide.shops.map((s) => `<b>${esc(s.shop)}</b> (${s.price})`).join(", ")}`,
        );
      }
      if (guide.craft) {
        srcBits.push(
          `📜 Luyện chế: <b>${esc(guide.craft.name)}</b> (${esc(guide.craft.type)})`,
        );
      }
      if (!srcBits.length) {
        srcBits.push(
          `<span class="vk-mu">Rương báu hoang dã / Tàng Kinh Các / Luân hồi</span>`,
        );
      }

      const srcSummary = srcBits.join("<br>");
      checklistTextLines.push(
        `[${owned ? "ĐÃ CÓ" : "CẦN SĂN"}] ${it.ten} (${heTen(he)} - Phẩm ${pham}) -> ${srcBits.map((s) => s.replace(/<[^>]+>/g, "")).join(" | ")}`,
      );

      huntingRows += `
  <tr style="border-bottom:1px solid var(--line)">
    <td style="padding:8px 6px;vertical-align:top;width:40px;text-align:center">
      ${owned ? '<span class="vk-ok" style="font-size:16px" title="Đã có trong túi hoặc kinh mạch">✓</span>' : '<span class="vk-bad" style="font-size:14px;font-weight:bold" title="Chưa sở hữu, cần đi săn!">⚠️</span>'}
    </td>
    <td style="padding:8px 6px;vertical-align:top">
      <div style="font-size:13.5px;font-weight:bold;color:var(--acc)">${idx + 1}. ${esc(it.ten)}</div>
      <div class="vk-mu" style="font-size:12px;margin:2px 0">
        ${esc(TC_LOAI[it.loai] || it.loai)} · Hệ: <b>${heTen(he)}</b> · Phẩm ${pham} · Cảnh giới: ${realmName(it.canh_gioi ?? 0)}
      </div>
      <div style="font-size:12px;line-height:1.45;margin-top:4px">${srcSummary}</div>
    </td>
    <td style="padding:8px 6px;vertical-align:middle;text-align:right;white-space:nowrap;width:75px">
      <button class="vk-btn sec bis-btn-tc" data-id="${esc(it.id)}" style="font-size:11.5px;padding:3px 8px">🔍 Tra Cứu</button>
    </td>
  </tr>
`;
    });

    resultHtml = `
<div class="vk-card" style="margin-top:14px">
  <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:8px">
    <h3 style="margin:0">🏆 Ma Trận Kinh Mạch Tối Thượng (${realmName(res.targetRealm)} - ${esc(res.lcText || currentLcName)})</h3>
    <button class="vk-btn sec" id="bis-copy-list" style="font-size:12px;padding:4px 10px">📋 Copy Danh Sách Săn Đồ</button>
  </div>

  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:8px;margin:10px 0;background:var(--bg2);padding:10px;border-radius:6px;border:1px solid var(--line)">
    <div><span class="vk-mu" style="font-size:12px">Quái ${realmName(res.targetRealm)} Thắng:</span><br><b class="vk-ok" style="font-size:15px">${ef.wins}/3</b></div>
    <div><span class="vk-mu" style="font-size:12px">Tổng Uy Lực:</span><br><b style="font-size:15px">${totalChieuUy}</b></div>
    <div><span class="vk-mu" style="font-size:12px">Hồi Linh Lực:</span><br><b style="font-size:15px">+${P.linhLucMoiLuot || 0}/hiệp</b></div>
    <div><span class="vk-mu" style="font-size:12px">Tốc Độ Di Chuyển:</span><br><b style="font-size:15px">+${R.biDong.toc_do || 0}%</b></div>
    <div><span class="vk-mu" style="font-size:12px">Hỗ Trợ Đột Phá:</span><br><b style="font-size:15px">+${R.biDong.dot_pha || 0}%</b></div>
    <div><span class="vk-mu" style="font-size:12px">Mảnh Đã Thông:</span><br><b class="vk-ok" style="font-size:15px">${thongCount}/${res.manh.length}</b></div>
    <div><span class="vk-mu" style="font-size:12px">Điểm Nghịch Hệ:</span><br><b class="vk-ok" style="font-size:15px">0 (Chuẩn Tẩy Tủy)</b></div>
  </div>

  <div style="margin:14px 0 6px">
    <b>Sơ Đồ Kinh Mạch Tối Ưu:</b>
    <div class="vk-mu" style="font-size:12px;margin-bottom:6px">Các ô màu đã được giả định tẩy tủy tương thích 100% với từng món đặt lên theo Linh Căn.</div>
    <div id="bis-canvas-box" style="overflow-x:auto;text-align:center;background:var(--bg3);padding:10px;border-radius:6px;border:1px solid var(--line)"></div>
  </div>

  <div style="margin:14px 0 8px;background:var(--bg2);padding:10px;border-radius:6px;border:1px solid var(--line)">
    <b style="color:var(--acc)">🧪 Kế Hoạch Tẩy Tủy Ô Kinh Mạch:</b>
    <div class="vk-mu" style="font-size:12px;margin:4px 0 8px">Tổng cộng cần chuyển hệ <b>${totalTayTuy}</b> ô trên lưới (Dùng Tẩy Tủy Đan / Cải Mệnh Đan / Dịch Cốt Đan):</div>
    <div style="display:flex;flex-wrap:wrap;gap:4px">${tayTuyPills}</div>
  </div>

  <div style="margin-top:16px">
    <h3 style="margin:0 0 6px">🎯 Cẩm Nang Săn Đồ & Thu Thập Chi Tiết</h3>
    <div class="vk-mu" style="font-size:12px;margin-bottom:8px">Đánh dấu <span class="vk-ok">✓</span> là bạn đã có trong túi/kinh mạch, <span class="vk-bad">⚠️</span> là món cần đi săn ở thế giới. Bấm <b>🔍 Tra Cứu</b> để xem chi tiết.</div>
    <table class="vk-t" style="width:100%">
      <thead>
        <tr style="border-bottom:1.5px solid var(--line)">
          <th style="width:40px;text-align:center">Có?</th>
          <th>Món Đồ & Nguồn Săn Lùng</th>
          <th style="width:75px;text-align:right">Chi Tiết</th>
        </tr>
      </thead>
      <tbody>
        ${huntingRows}
      </tbody>
    </table>
  </div>
</div>
      `;

    S.bisChecklistText = checklistTextLines.join("\n");
  }

  body.innerHTML = `
      <div class="vk-card">
<h2 style="margin:0 0 6px;color:var(--acc);font-size:16px">🌌 Biệt Đội Late Game · Kinh Mạch Tối Thượng (BIS & Săn Đồ)</h2>
<div class="vk-mu" style="font-size:12.5px;line-height:1.45;margin-bottom:10px">
  Tự động phân tích <b>Linh Căn hiện tại của kiếp này</b> (${esc(currentLcName)}), quét toàn bộ kho dữ liệu game (tất cả công pháp & pháp khí), phân tích chuỗi <b>Ngũ Hành Tương Sinh</b> tương thích và loại trừ triệt để các hệ tương khắc. Giả định <b>full lượt tẩy tủy cho tất cả các ô</b> late game (đạt 100% độ hợp hệ, 0 điểm nghịch) để tạo cấu hình kinh mạch mạnh nhất và lập <b>Cẩm nang săn đồ</b> chi tiết!
</div>

<div style="background:var(--bg2);padding:10px;border-radius:6px;border:1px solid var(--line);margin-bottom:12px">
  <div style="margin-bottom:6px">
    <span>Linh Căn Hiện Tại Của Kiếp Này: </span>
    <b class="vk-ok" style="font-size:14px">${esc(currentLcName)}</b>
    <span class="vk-mu">(${{ don: "Đơn Linh Căn", song: "Song Linh Căn", tam: "Tam Linh Căn", tu: "Tứ Linh Căn", hon_don: "Hỗn Độn", thien: "Thiên Linh Căn", bien_di: "Dị Linh Căn" }[deduced.lcPham] || deduced.lcPham || "Thường"})</span>
  </div>
  ${analysisHtml}
  <div style="font-size:12.5px">
    <span style="display:inline-block;margin-bottom:4px">Tất Cả Hệ Khai Phóng (+ Vô Sắc & Dị Căn):</span><br>
    <div style="display:flex;flex-wrap:wrap;gap:2px">${allHeHtml}</div>
  </div>
</div>

<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px">
  <div>
    <label style="display:block;font-size:12px;margin-bottom:4px">Cảnh giới đích:</label>
    <select class="vk-sel" id="bis-sel-cg" style="width:100%" ${S.bisRunning ? "disabled" : ""}>
      <option value="5" ${S.bisRealm === 5 ? "selected" : ""}>Hóa Thần (Đỉnh Phong)</option>
      <option value="4" ${S.bisRealm === 4 ? "selected" : ""}>Nguyên Anh (Thượng Thừa)</option>
      <option value="3" ${S.bisRealm === 3 ? "selected" : ""}>Kim Đan (Trung Kỳ)</option>
    </select>
  </div>
  <div>
    <label style="display:block;font-size:12px;margin-bottom:4px">Case chiến thuật:</label>
    <select class="vk-sel" id="bis-sel-mode" style="width:100%" ${S.bisRunning ? "disabled" : ""}>
      <option value="danh" ${S.bisMode === "danh" ? "selected" : ""}>⚔️ Thuần Sát Thương (DPS Tối Đa)</option>
      <option value="bal" ${S.bisMode === "bal" ? "selected" : ""}>🛡️ Công Thủ Toàn Diện (Cân Bằng)</option>
      <option value="tu" ${S.bisMode === "tu" ? "selected" : ""}>🚀 Tu Luyện & Bứt Tốc (Đột Phá Nhanh)</option>
    </select>
  </div>
</div>

<button class="vk-btn" id="bis-btn-run" style="width:100%;font-size:14px;padding:8px" ${S.bisRunning ? "disabled" : ""}>
  ${S.bisRunning ? "⏳ Đang Quét Dữ Liệu & Giải Ma Trận..." : "⚡ Bắt Đầu Tính Toán Kinh Mạch Tối Thượng"}
</button>
      </div>

      ${progressHtml}
      ${outdatedHtml}
      ${resultHtml}
    `;

  if (res && res.manh) {
    const box = body.querySelector("#bis-canvas-box");
    if (box) {
      try {
        box.innerHTML = drawGrid(res.nvFinal, res.manh);
      } catch (e) {
        console.error(e);
        box.innerHTML = `<span class="vk-bad">Không thể vẽ lưới: ${esc(e.message)}</span>`;
      }
    }

    const copyBtn = body.querySelector("#bis-copy-list");
    if (copyBtn) {
      copyBtn.onclick = async () => {
        if (!S.bisChecklistText) return;
        const ok = await copyText(S.bisChecklistText);
        UI.notify(
          ok
            ? "📋 Đã copy toàn bộ Cẩm Nang Săn Đồ vào bộ nhớ tạm!"
            : "❌ Không thể copy!",
        );
      };
    }

    body.querySelectorAll(".bis-btn-tc").forEach((btn) => {
      btn.onclick = (e) => {
        const id = e.currentTarget.dataset.id;
        if (id) tcGo("v", id);
      };
    });
  }

  const selCg = body.querySelector("#bis-sel-cg");
  if (selCg) {
    selCg.onchange = () => {
      S.bisRealm = parseInt(selCg.value, 10) || 5;
    };
  }
  const selMode = body.querySelector("#bis-sel-mode");
  if (selMode) {
    selMode.onchange = () => {
      S.bisMode = selMode.value || "danh";
    };
  }

  const runBtn = body.querySelector("#bis-btn-run");
  if (runBtn) {
    runBtn.onclick = async () => {
      if (S.bisRunning) return;
      S.bisRunning = true;
      S.bisPct = 0;
      S.bisMsg =
        "Bắt đầu quét toàn bộ data game theo Linh Căn " +
        currentLcName +
        "...";
      render();

      try {
        const targetRealm = S.bisRealm || 5;
        const mode = S.bisMode || "danh";
        const out = await bisSolve(
          nv,
          targetRealm,
          mode,
          (pct, msg) => {
            S.bisPct = pct;
            if (msg) S.bisMsg = msg;
            render();
          },
        );
        S.bisResult = {
          ...out,
          targetRealm,
          mode,
          lcKey: currentLcKey,
          lcText: currentLcName,
          date: new Date().toLocaleTimeString("vi-VN"),
        };
        UI.notify(
          "🎉 Đã giải xong Ma Trận Late Game & Cẩm Nang Săn Đồ cho Linh Căn " +
            currentLcName +
            "!",
        );
      } catch (err) {
        console.error(err);
        UI.notify("❌ Lỗi tính toán: " + ((err && err.message) || err));
      } finally {
        S.bisRunning = false;
        render();
      }
    };
  }
}

