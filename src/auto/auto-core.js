/**
 * Module: Hạ Tầng Tự Động (Auto Core Engine, Cấu Hình, Sự Kiện Tu Vi & Bảng Xác Nhận)
 */
// ═══════════════ TỰ ĐỘNG: AUTO BUÔN BÁN · AUTO SĂN YÊU ═══════════════
// Điều khiển game bằng chính các hàm công khai của game (travelTo, doAction, tocChienTran, shopBuy, shopSell…),
// nên không phụ thuộc tên hàm bị rút gọn. Việc nguy hiểm hoặc cần người chơi quyết định thì Auto dừng lại.
const AU_KEY = "vkx_auto_cfg";
const AU_DEF = {
  buon: {
    maxY: 3,
    banY: 5,
    von: 60,
    giu: 100,
    lai: 20,
    chuyen: 5,
    hiem: "ngang_suc",
    tho: 15,
    toc: "nhanh",
  },
  san: {
    maxY: 3,
    mau: ["an_toan", "ngang_suc", "hiem"],
    tran: 20,
    thuong: 2,
    tho: 15,
    kt: true,
    neHac: true,
    danhAi: true,
    sanMucTieu: "uu_tien_dau_dan",
    autoDuongThuong: true,
    uuTienCapNen: true,
    toc: "nhanh",
  },
  km: {
    mode: "bal",
    dir: "tien",
    kb: "",
    prio: true,
    bk: 5,
    ratio: "64",
    maxSkills: "3",
    iters: 3000,
    mo: false,
    moMax: 1,
    two: false,
    keep: "tu",
    moBo: false,
    watch: false,
    tayO: false,
    tayMax: 3,
  },
  rr: {
    pham: ["thien", "bien_di"],
    he: [],
    heMode: "any",
    tc: [],
    join: "and",
    max: 3000,
    toc: "nhanh",
    swap: false,
    lp: false,
    dl: "normal",
    lh: false,
    lhIds: [],
    lhKeep: 0,
  },
  tl: {
    mode: "be_quan", // "be_quan" | "danh_quai"
    targetRealm: 5,
    targetSubRealm: 3,
    minSafeRate: 65,
    minTho: 10,
    useCultPills: true,
    useBreakPills: true,
    autoBeatDemons: true,
    autoBreakBottleneck: true,
    autoThaMang: true,
    autoEnemyEscape: true,
    toc: "nhanh",
    // Cấu hình khi chọn chế độ Đánh Quái (Săn Yêu):
    maxY: 3,
    mau: ["an_toan", "ngang_suc", "hiem"],
    tran: 20,
    thuong: 2,
    kt: true,
    neHac: true,
    danhAi: true,
    uuTienSuKienTuVi: true,
    autoSongTu: true,
    sanMucTieu: "uu_tien_dau_dan",
    autoDuongThuong: true,
    uuTienCapNen: true,
  },
  tc: {
    autoCombatOverlay: true,
    autoInCombat: false,
    aiEngineMode: "smart_v3",
    itemPolicy: "auto",
    speed: "normal",
    targetPrio: "smart",
    healPillMode: "smart",
    healHpThreshold: 35,
    healBossPanicHp: 55,
    spiritPillMode: "on_demand",
    spiritThreshold: 20,
    burstPillMode: "boss_combo",
    cleansePillMode: true,
    maxDrugResistance: 70,
    maxPillGradeNormal: 4,
    maxPillGrade: 6,
    shieldTalismanMode: "predictive",
    shieldHpThreshold: 55,
    ccTalismanMode: "interrupt",
    atkTalismanMode: "smart_weave",
    talismanGradeNormal: 4,
    talismanGrade: 6,
    formationMode: "boss_or_danger",
    useBurstPill: true,
    saveFamiliars: true,
    recallPetHp: 25,
    healSkillThreshold: 75,
    shieldSkillThreshold: 40,
    preventOverkill: true,
    aoePriority: true,
    prioritizeNatal: true,
    autoNormalAttack: true,
    smartFinisher: true,
    useAttackTalismans: true,
    smartShield: true,
    smartCc: true,
    comboSequence: true,
    teHuyetMode: "off",
    emergencyThieuDot: true,
    thieuDotHp: 20,
    emergencyEscape: false,
    escapeHp: 16,
    autoThaMang: true,
    autoEnemyEscape: true,
  },
  sdb: {
    uuTienTheoHon: true,
    boQuaDaCo: true,
    dungTruyenTong: true,
    minWinRate: 70,
    danhAi: true,
    autoThaMang: true,
    autoEnemyEscape: true,
    sanMoiDiBaoXuatThe: true,
    autoQuickSave: false,
    cheDoCho: "camp",
    minTho: 15,
    maxNam: 100,
    toc: "nhanh",
    targetRelics: [],
  },
};
// Hằng số lấy từ code game; mô tả trên giao diện đọc lại từ đây nên đổi một chỗ là khớp hết.
let AU_T4 = 3,
  AU_ZAN = 2; // Săn cạn: tối đa AU_T4 lần mỗi nơi, hồi 1 lần mỗi AU_ZAN năm
const AU_KT = 0.8; // Kiểm Tra Sức: cần thắng chắc từ 80% yêu thú mẫu cùng cảnh giới
const AU_TT_MAX = 3; // Thương Thế cao nhất, game giới hạn bằng Math.min(3, …)
const AU_TT_TEN = [
  "Lành lặn",
  "Thương nhẹ",
  "Thương nặng",
  "Trọng thương",
]; // đúng bảng Lh của game
const AU_HIEM = { an_toan: 0, ngang_suc: 1, hiem: 2, tu_dia: 3 };
// Màu mức nguy hiểm đúng như game: Xanh (an toàn) · Vàng (ngang sức) · Đỏ (nguy hiểm) · Tím (tử địa; “thần thức không dò ra” game cũng tô tím).
const AU_MAU = {
  an_toan: ["Xanh", "#3d8a4a", "dễ thắng"],
  ngang_suc: ["Vàng", "#c9a032", "thắng được nhưng mang thương"],
  hiem: ["Đỏ", "#c4472c", "khó thắng"],
  tu_dia: ["Tím", "#6a1b7a", "tử địa"],
  unknown: ["Tím", "#6a1b7a", "thần thức không dò ra"],
};
const auMauOf = (lv) => AU_MAU[lv] || AU_MAU.unknown;
// Auto Săn Yêu: người dùng tích các màu được phép đi tới và giao chiến. Mức không đọc được (“thần thức không dò ra”, game tô tím) tính là Tím.
const AU_MAU_ID = ["an_toan", "ngang_suc", "hiem", "tu_dia"];
const AU_MAU_DEF = ["an_toan", "ngang_suc", "hiem"];
const auMauNorm = (a) => {
  const s = new Set(Array.isArray(a) ? a : []);
  const r = AU_MAU_ID.filter((k) => s.has(k));
  return r.length ? r : AU_MAU_DEF.slice();
};
const auColorOK = (lv, mau) =>
  mau.includes(AU_MAU_ID.includes(lv) ? lv : "tu_dia");
const auMauLabel = (mau) => {
  const n = mau.map((k) => AU_MAU[k][0]);
  return n.length > 1
    ? n.slice(0, -1).join(", ") + " và " + n[n.length - 1]
    : n[0];
};
const auRedPurple = (id) => id === "hiem" || id === "tu_dia";
// Các loại yêu thú / linh thú Hạc (giết bị trừ Khí Vận / gánh nhân quả): Bạch Hạc Linh, Thanh Vũ Ấu Hạc, Thanh Vũ Hạc, Lăng Vân Hạc, Đan Đỉnh Hạc, Cửu Cao Tiên Hạc…
// Không tính Đồng Hạc Khôi (khôi lỗi) hay các từ khác dấu như Hắc / Thạch / Nhạc / Hạch.
const AU_HAC_IDS = new Set([
  "enemy.bach_hac_linh",
  "enemy.thanh_vu_au_hac",
  "enemy.thanh_vu_hac",
  "enemy.lang_van_hac",
  "enemy.dan_dinh_hac",
  "enemy.cuu_cao_tien_hac",
]);
function auIsHacText(s) {
  if (!s) return false;
  const str = String(s);
  if (!/hạc/i.test(str)) return false;
  const n = str.normalize("NFC");
  if (/đồng\s+hạc\s+khôi/i.test(n)) return false;
  return /(^|[^\p{L}])hạc($|[^\p{L}])/iu.test(n);
}
function auIsHacEnemy(id, tenFallback) {
  if (id === "enemy.dong_hac_khoi") return false;
  if (id && AU_HAC_IDS.has(id)) return true;
  try {
    const Cc = C(),
      e = id && Cc.enemies && Cc.enemies.get(id);
    if (e) {
      if (
        e.ho_quai === "ho_quai.khoi_loi" ||
        (e.ngu_linh && (e.ngu_linh.loai || []).includes("khoi_loi"))
      )
        return false;
      if (auIsHacText(e.ten)) return true;
      if (e.ho_quai && Cc.enemyFamilies) {
        const f = Cc.enemyFamilies.get(e.ho_quai);
        if (f && auIsHacText(f.ten)) return true;
      }
      if (
        (e.roi || []).some(
          (r) => typeof r.khi_van === "number" && r.khi_van < 0,
        )
      )
        return true;
    }
  } catch (e) {
    /* bỏ qua */
  }
  return !!(tenFallback && auIsHacText(tenFallback));
}
function auEnemyName(id) {
  try {
    const e = C().enemies.get(id);
    if (e && e.ten) return e.ten;
  } catch (e) {
    /* bỏ qua */
  }
  const f = NL_ENEMY.find((x) => x.id === id);
  return (f && f.ten) || id;
}
function auEncounterHac(a, v, fightChoice) {
  try {
    if (a && a.vars) {
      for (const val of Object.values(a.vars)) {
        if (typeof val === "string" && auIsHacEnemy(val))
          return auEnemyName(val);
      }
    }
    if (
      fightChoice &&
      fightChoice.risk &&
      auIsHacText(fightChoice.risk.enemy)
    )
      return fightChoice.risk.enemy;
    if (fightChoice && auIsHacText(fightChoice.text))
      return (
        (fightChoice.risk && fightChoice.risk.enemy) || "Yêu thú Hạc"
      );
    if (
      v &&
      (v.id === "ev.san_yeu" ||
        v.id === "ev.yeu_thu_lang_thang" ||
        v.id === "ev.truy_tim_yeu" ||
        v.id === "ev.truy_tim_dau_dan") &&
      auIsHacText(v.text)
    ) {
      return (
        (fightChoice && fightChoice.risk && fightChoice.risk.enemy) ||
        "Yêu thú Hạc"
      );
    }
  } catch (e) {
    /* bỏ qua */
  }
  return null;
}
const AU = { cfg: null, run: null, log: [], plan: null };
// Tốc độ chạy: số mili giây nghỉ giữa hai bước. 0 = chạy liền, chỉ nhường giao diện game vẽ sau mỗi ~20 ms làm việc.
const AU_TOC = {
  nhanh: ["Nhanh", 0],
  vua: ["Vừa", 40],
  cham: ["Chậm", 120],
};
// ── Tính toán tổng tu vi lũy kế của nhân vật xuyên suốt mọi cảnh giới
function calcTotalTuVi(nv) {
  if (!nv) return 0;
  let total = 0;
  try {
    const K = S.core;
    const step =
      K && K.MINOR_REALM_STEP != null ? K.MINOR_REALM_STEP : 0.35;
    const yuFallback = [20, 40, 130, 800, 2000, 4000];
    const cgIndex = Number(nv.canhGioi || 0);
    const tcIndex = Number(nv.tieuCanhGioi || 0);

    for (let r = 0; r < cgIndex; r++) {
      const cg = K && K.canhGioi ? K.canhGioi(r) : null;
      const base =
        cg && cg.tuViMoiTieu ? cg.tuViMoiTieu : yuFallback[r] || 20;
      for (let t = 0; t <= 3; t++) {
        total += Math.round(base * (1 + step * t));
      }
    }
    const curCg = K && K.canhGioi ? K.canhGioi(cgIndex) : null;
    const curBase =
      curCg && curCg.tuViMoiTieu
        ? curCg.tuViMoiTieu
        : yuFallback[cgIndex] || 20;
    for (let t = 0; t < tcIndex; t++) {
      total += Math.round(curBase * (1 + step * t));
    }
    total += Number(nv.tuVi || 0);
    if (typeof nv.binhCanh === "number" && nv.binhCanh > 0) {
      total += nv.binhCanh;
    }
  } catch (e) {
    total = Number((nv && nv.tuVi) || 0);
  }
  return total;
}

// ── Kiểm tra và phân tích sự kiện tăng tu vi (Kỳ ngộ, Bí cảnh, Di tích, Song Tu...)
// Helper kiểm tra xem sự kiện có phải "lỏ", tiện ích lặp lại, mua bán, cạm bẫy hoặc tốn linh thạch không
function isLoTuViEnc(encId, encDef) {
  if (!encId) return true;
  // Sự kiện Dị Bảo có cơ chế xử lý riêng biệt (findBestDiBaoChoice), tuyệt đối không xếp vào sự kiện cày Tu Vi thông thường
  if (
    encId.startsWith("ev.di_bao") ||
    (typeof DIBAO !== "undefined" && DIBAO.evMap && DIBAO.evMap.has(encId))
  )
    return true;
  // Các loại sự kiện dịch vụ thường trực, lừa đảo, cạm bẫy hoặc tốn phí
  if (
    /^ev\.(cho_|tiem_|quan_|trang_|hoc_duong_|bd_|loi_tat_|lam_cong_|mua_tin_|dau_gia_|pn_|tm_|bq_)/i.test(
      encId,
    )
  )
    return true;
  if (
    encId === "ev.son_mon_dong_kin" ||
    encId === "ev.nhiem_vu_tong_mon" ||
    encId === "ev.ngoa_son_ngo_dao" ||
    encId === "ev.the_gia_bong_loc" ||
    encId === "ev.thinh_giao" ||
    encId === "ev.tham_ban_cu"
  )
    return true;
  try {
    const def =
      encDef || (C() && C().encounters && C().encounters.get(encId));
    if (def) {
      if (
        def.tien_ich ||
        def.kind === "cua_hang" ||
        def.nhom === "mua_ban" ||
        def.nhom === "su_vu" ||
        def.dia_diem === true
      ) {
        // Ngoại trừ các bí cảnh, dị bảo, di tích thực sự
        if (
          def.kind !== "bi_canh" &&
          def.kind !== "di_tich" &&
          !def.id?.startsWith("ev.ditich_") &&
          !def.id?.startsWith("ev.di_bao")
        ) {
          return true;
        }
      }
      const f = def.file || "";
      if (
        f.includes("/thanh_tran/lam_cong") ||
        f.includes("/thanh_tran/mua_tin") ||
        f.includes("/thanh_tran/cho_den") ||
        f.includes("/thanh_tran/dau_gia") ||
        f.includes("/thanh_tran/pham_nhan") ||
        f.includes("/bien_co/be_quan") ||
        f.includes("/tong_mon_noi")
      ) {
        return true;
      }
    }
  } catch (e) {}
  return false;
}

const _tuViEncCache = new Map();
function encGivesTuVi(encId) {
  if (!encId) return 0;
  if (_tuViEncCache.has(encId)) return _tuViEncCache.get(encId);
  let enc = null;
  let Cc = null;
  try {
    Cc = C();
    enc = Cc && Cc.encounters && Cc.encounters.get(encId);
  } catch (e) {}
  if (!enc) {
    _tuViEncCache.set(encId, 0);
    return 0;
  }

  // 1. Loại bỏ triệt để các sự kiện "lỏ", tiện ích lặp lại, bế quan trả phí, mua bán
  if (isLoTuViEnc(encId, enc)) {
    _tuViEncCache.set(encId, 0);
    return 0;
  }

  let maxTv = 0;
  const visitedChains = new Set();

  function evalEffs(effs) {
    if (!Array.isArray(effs)) return { tv: 0, lt: 0, bad: false };
    let tv = 0,
      lt = 0,
      bad = false;
    for (const eff of effs) {
      if (!eff || typeof eff !== "object") continue;
      if (eff.tu_vi !== undefined || eff.tuVi !== undefined) {
        const v = Number(
          eff.tu_vi !== undefined ? eff.tu_vi : eff.tuVi,
        );
        if (Number.isFinite(v) && v > 0) tv += v;
      }
      if (eff.song_tu) tv += 5.0; // Song Tu tăng ~5% tiểu cảnh giới (rất lớn)
      if (eff.be_quan_linh_mach) tv += 2.0;
      if (eff.thai_bo) tv += 3.0;
      // Tuyệt đối KHÔNG tính tu_luyen vụn vặt thời gian ngắn (như đọc sách, bế quan ngắn mùa)
      if (eff.linh_thach !== undefined) {
        const ltv =
          typeof eff.linh_thach === "number"
            ? eff.linh_thach
            : eff.linh_thach?.bac
              ? eff.linh_thach.bac * 10
              : 0;
        if (ltv < 0) lt += ltv;
      }
      if (eff.injury || eff.thuong_the || eff.tam_ma) bad = true;
      if (
        eff.start_chain &&
        typeof eff.start_chain === "string" &&
        !visitedChains.has(eff.start_chain) &&
        Cc &&
        Cc.chains
      ) {
        visitedChains.add(eff.start_chain);
        const chDef = Cc.chains.get(eff.start_chain);
        if (chDef && chDef.steps) {
          for (const stp of Object.values(chDef.steps)) {
            if (stp && stp.encounter && stp.encounter !== encId) {
              const stpTv = encGivesTuVi(stp.encounter);
              if (stpTv > tv) tv = stpTv;
            }
          }
        }
      }
    }
    return { tv, lt, bad };
  }

  function scanChoice(ch) {
    if (!ch || typeof ch !== "object") return 0;
    if (ch.thoat) return 0;
    // Bỏ qua nếu lựa chọn đòi trả phí linh thạch
    if (ch.requires && ch.requires.linh_thach) return 0;

    const base = evalEffs(ch.effects);
    if (base.lt < 0 || base.bad) return 0; // Nhánh mất linh thạch hoặc hại thân

    const hasCheck = Boolean(
      ch.check || ch.chance || ch.success || ch.partial,
    );
    if (!hasCheck) {
      return base.tv;
    }

    const sEff = evalEffs(
      Array.isArray(ch.success) ? ch.success : ch.success?.effects,
    );
    const fEff = evalEffs(
      Array.isArray(ch.failure) ? ch.failure : ch.failure?.effects,
    );
    const pEff = evalEffs(
      Array.isArray(ch.partial) ? ch.partial : ch.partial?.effects,
    );

    // Kiểm định thất bại: Nếu bị mất tiền hoặc hại thân -> không an toàn, bỏ qua
    if (fEff.lt < 0 || fEff.bad) return 0;

    return Math.max(base.tv, sEff.tv, pEff.tv);
  }

  if (Array.isArray(enc.choices)) {
    for (const ch of enc.choices) {
      const v = scanChoice(ch);
      if (v > maxTv) maxTv = v;
    }
  }
  if (enc.scenes && typeof enc.scenes === "object") {
    for (const sc of Object.values(enc.scenes)) {
      if (sc && Array.isArray(sc.choices)) {
        for (const ch of sc.choices) {
          const v = scanChoice(ch);
          if (v > maxTv) maxTv = v;
        }
      }
    }
  }

  // Ngưỡng tối thiểu: Phải có ít nhất 1.0 tu vi thực tế mới bõ công tới tham gia
  if (maxTv < 1.0) maxTv = 0;

  _tuViEncCache.set(encId, maxTv);
  return maxTv;
}

function findBestTuViChoice(
  encDef,
  availableChoices,
  activeScene,
  opt,
) {
  if (!encDef || !availableChoices || !availableChoices.length)
    return null;

  const nonThoat = availableChoices.filter((c) => !c.thoat);
  if (!nonThoat.length) return null;

  // Xử lý đặc thù cho Song Tu: Ưu tiên chọn "Song tu một năm" nhận tu vi trực tiếp
  if (encDef.id === "ev.song_tu") {
    const isHuntingMode =
      (opt && (opt.hunt || opt.isDanhQuai)) ||
      (AU.cfg && AU.cfg.tl && AU.cfg.tl.mode === "danh_quai");
    const cYear = nonThoat.find((c) =>
      /song tu một năm|song tu.*1 năm/i.test(c.text),
    );
    if (cYear && cYear.available !== false)
      return { choice: cYear, tv: 50 };

    // Ở chế độ Đánh Quái: Tuyệt đối KHÔNG chọn "Song tu, cùng nhập định" (tránh bị kẹt vào màn hình bế quan)
    if (isHuntingMode) {
      return null;
    }

    const cNhapDinh = nonThoat.find((c) => /nhập định/i.test(c.text));
    if (cNhapDinh && cNhapDinh.available !== false)
      return { choice: cNhapDinh, tv: 20 };
  }

  // Xác định chính xác scene hiện tại (nếu caller chưa truyền thì lấy trực tiếp từ state game)
  const curScene =
    activeScene ||
    (G().state &&
      G().state.run &&
      G().state.run.active &&
      G().state.run.active.scene) ||
    null;

  const sceneChoices =
    curScene && encDef.scenes && encDef.scenes[curScene]
      ? encDef.scenes[curScene].choices
      : null;
  const choiceDefs = sceneChoices || encDef.choices || [];

  function evalObjScore(obj) {
    if (!obj || typeof obj !== "object") return 0;
    let sc = 0;
    if (Array.isArray(obj)) {
      for (const it of obj) sc += evalObjScore(it);
      return sc;
    }
    if (obj.tu_vi !== undefined || obj.tuVi !== undefined) {
      const v = Number(obj.tu_vi !== undefined ? obj.tu_vi : obj.tuVi);
      if (Number.isFinite(v)) {
        // Thưởng điểm cao cho tu vi dương, phạt rất nặng tu vi âm (tránh các nhánh trừ tu vi)
        sc += v > 0 ? v * 100 : v * 600;
      }
    }
    if (obj.song_tu) sc += 500;
    if (obj.be_quan_linh_mach) sc += 200;
    if (obj.thai_bo) sc += 300;
    // Phạt cực nặng nếu tốn linh thạch hoặc yêu cầu linh thạch
    if (obj.linh_thach !== undefined) {
      const lt =
        typeof obj.linh_thach === "number"
          ? obj.linh_thach
          : obj.linh_thach?.bac
            ? obj.linh_thach.bac * 10
            : 0;
      if (lt < 0) sc -= 99999;
    }
    if (obj.tam_ma) sc -= Number(obj.tam_ma) * 5000;
    if (obj.injury || obj.thuong_the) sc -= 50000;
    return sc;
  }

  function scoreChoiceDef(def) {
    if (!def || typeof def !== "object") return 0;
    // Kiểm tra yêu cầu đòi nộp linh thạch
    if (def.requires && def.requires.linh_thach) {
      return -99999;
    }
    let sc = evalObjScore(def.effects);
    if (def.success) {
      const sEff = Array.isArray(def.success)
        ? def.success
        : def.success.effects;
      sc = Math.max(sc, evalObjScore(sEff));
    }
    if (def.partial) {
      const pEff = Array.isArray(def.partial)
        ? def.partial
        : def.partial.effects;
      sc = Math.max(sc, evalObjScore(pEff));
    }
    if (def.failure) {
      const fEff = Array.isArray(def.failure)
        ? def.failure
        : def.failure.effects;
      const scFail = evalObjScore(fEff);
      if (scFail < 0) sc += scFail; // Phạt nặng nếu thất bại gây trừ tu vi/chấn thương/mất tiền
    }
    // Nếu dẫn sang scene kế tiếp, quét các nhánh scene đó tìm tu vi tiềm năng
    if (def.scene && encDef.scenes && encDef.scenes[def.scene]) {
      const nextSc = encDef.scenes[def.scene];
      if (Array.isArray(nextSc.choices)) {
        let maxNext = 0;
        for (const nc of nextSc.choices) {
          let nsc = evalObjScore(nc.effects);
          if (nc.success) {
            const nsEff = Array.isArray(nc.success)
              ? nc.success
              : nc.success.effects;
            nsc = Math.max(nsc, evalObjScore(nsEff));
          }
          if (nsc > maxNext) maxNext = nsc;
        }
        sc += maxNext * 0.8;
      }
    }
    return sc;
  }

  let bestChoice = null;
  let bestScore = -Infinity;

  for (const ch of nonThoat) {
    const defChoice = choiceDefs[ch.index];
    if (!defChoice) continue;

    const score = scoreChoiceDef(defChoice);
    if (score > bestScore) {
      bestScore = score;
      bestChoice = ch;
    }
  }

  // Chỉ chọn nếu nhánh đó mang lại điểm dương (tu vi thực sự và an toàn)
  if (bestChoice && bestScore > 0) {
    return { choice: bestChoice, tv: bestScore };
  }

  // Nếu mọi nhánh khảo nghiệm đều là cạm bẫy / tốn tiền / nguy hiểm:
  // Ưu tiên chọn nhánh thoát (thoat) nếu có để an toàn rút lui!
  const leaveChoice = availableChoices.find(
    (c) =>
      c.thoat ||
      /rời|thôi|bỏ|hẹn|quay về|trở về|không làm phiền/i.test(
        c.text || "",
      ),
  );
  if (leaveChoice) {
    return { choice: leaveChoice, tv: 0 };
  }

  // 2. Nếu chưa có nhánh nào có tu_vi trực tiếp ngay ở bước này (hoặc là bước dẫn tới scene khác):
  // Ưu tiên các lựa chọn tiến lên / khảo nghiệm an toàn (không có chữ phí/mua/linh thạch)
  const advanceChoice = nonThoat.find((c) => {
    const txt = c.text || "";
    if (/phí|linh thạch|mua|trả tiền|cống nạp/i.test(txt)) return false;
    return (
      c.check ||
      /kiểm định|khảo nghiệm|thử|tiến|vào|nhận|lấy|hái|mở|luyện|uống|nghênh|bước|quan sát|chiêm ngưỡng|soi|xem xét|nhập định|dưỡng|hộ pháp/i.test(
        txt,
      )
    );
  });
  if (advanceChoice) return { choice: advanceChoice, tv: 0 };

  // 3. Tránh các lựa chọn tốn phí linh thạch
  const safeChoice = nonThoat.find((c) => {
    const txt = c.text || "";
    return !/phí|linh thạch|mua|trả tiền/i.test(txt);
  });

  return { choice: safeChoice || nonThoat[0], tv: 0 };
}

// ── Phân tích lựa chọn tối ưu trong sự kiện Dị Bảo (Nghịch Thiên P8)
function findBestDiBaoChoice(v, cs) {
  if (!v || !Array.isArray(cs) || !cs.length) return null;
  const nonThoat = cs.filter((c) => !c.thoat);
  if (!nonThoat.length) return cs.find((x) => x.thoat) || null;

  let encDef = null;
  let activeScene = null;
  let evMeta = null;
  try {
    const Cc = C();
    encDef = Cc && Cc.encounters && Cc.encounters.get(v.id);
    evMeta = typeof DIBAO !== "undefined" && DIBAO.evMap ? DIBAO.evMap.get(v.id) : null;
    activeScene =
      (G().state &&
        G().state.run &&
        G().state.run.active &&
        G().state.run.active.scene) ||
      null;
  } catch (e) {}

  const sceneChoices =
    activeScene && encDef && encDef.scenes && encDef.scenes[activeScene]
      ? encDef.scenes[activeScene].choices
      : null;
  const choiceDefs = sceneChoices || (encDef && encDef.choices) || [];
  const targetRelicId = evMeta && evMeta.relic ? evMeta.relic : null;

  function evalRelicEffs(effs) {
    if (!effs) return 0;
    const arr = Array.isArray(effs) ? effs : effs.effects ? effs.effects : [effs];
    let score = 0;
    for (const ef of arr) {
      if (!ef || typeof ef !== "object") continue;
      const itemStr = String(
        ef.item || ef.add_item || ef.id || ef.relic || ef.vat_pham || "",
      );
      if (targetRelicId && itemStr === targetRelicId) score += 2000;
      else if (itemStr.startsWith("item.") || ef.add_item || ef.item) score += 800;
      if (ef.di_bao_xong || ef.roll_di_bao || ef.relic_roll) score += 1200;
      if (ef.combat || ef.enemy || ef.boss || ef.tran) score += 700;
      if (ef.scene && typeof ef.scene === "string") score += 350;
      if (ef.flag && String(ef.flag).includes("di_bao")) score += 500;
    }
    return score;
  }

  let bestDefChoice = null;
  let bestDefScore = -Infinity;

  for (const ch of nonThoat) {
    const def = choiceDefs[ch.index];
    let sc = 0;
    if (def && typeof def === "object") {
      sc += evalRelicEffs(def.effects);
      sc += evalRelicEffs(def.success);
      sc += evalRelicEffs(def.partial);
      if (def.combat || def.enemy || def.boss) sc += 750;
      if (def.check || def.stat || def.khao_nghiem) sc += 500;
      if (def.scene) sc += 300;
    }
    const txt = ch.text || "";
    if (
      /thu nhận|đoạt|nhận lấy|thu phục|lấy|thu|hái|nhặt|nhổ|rút|nhận|gỡ|tháo|lục soát|luyện hóa|khế ước|cầm|lượm|đeo|giữ/i.test(
        txt,
      )
    )
      sc += 600;
    if (
      ch.check ||
      /kiểm định|khảo nghiệm|thử thách|dò xét|tiến vào|mở|khai|khám phá|bước vào|quan sát|tiến đến|tiến lại|đến gần|dò tìm|tìm kiếm|xem xét|nhìn thẳng|chiêm ngưỡng|soi|chạm vào|đặt tay|thử/i.test(
        txt,
      )
    )
      sc += 450;
    if (
      ch.risk ||
      /giao chiến|chiến đấu|nghênh chiến|khiêu chiến|đánh|quyết đấu|tiễu trừ|hạ gục|ra tay|trảm|phá trận/i.test(
        txt,
      )
    )
      sc += 550;
    if (/bỏ đi|rời khỏi|rút lui|thôi|quay đầu|lùi lại/i.test(txt)) sc -= 1000;

    if (sc > bestDefScore) {
      bestDefScore = sc;
      bestDefChoice = ch;
    }
  }

  if (bestDefChoice && bestDefScore > 0) return bestDefChoice;
  return nonThoat[0];
}

function getItemPhaBinhCanh(it) {
  if (!it) return null;
  if (it.pha_binh_canh) return it.pha_binh_canh;
  if (Array.isArray(it.dung)) {
    for (const d of it.dung) {
      if (d && d.pha_binh_canh) return d.pha_binh_canh;
    }
  }
  return null;
}

function isAtBottleneck(nv) {
  if (!nv) return false;
  try {
    const atB =
      (S.core && S.core.atBottleneck) ||
      (TT.core &&
        TT.core["character/character"] &&
        TT.core["character/character"].atBottleneck);
    if (typeof atB === "function") return atB(nv);
  } catch (e) {}
  if (typeof nv.binhCanh === "number" && nv.binhCanh > 0) return true;
  try {
    const cg =
      S.core && S.core.canhGioi && S.core.canhGioi(nv.canhGioi);
    if (cg && cg.tieu && cg.tieu[nv.tieuCanhGioi]) {
      const cap = cg.tieu[nv.tieuCanhGioi].tuVi;
      if (cap && nv.tuVi >= cap && nv.tieuCanhGioi < 3) return true;
    }
  } catch (e) {}
  return false;
}

function findPhaBinhCanhPills(nv) {
  const pills = [];
  if (!nv || !nv.tuiDo) return pills;
  let Cc = null;
  try {
    Cc = C();
  } catch (e) {}
  if (!Cc || !Cc.items) return pills;
  for (const [id, count] of Object.entries(nv.tuiDo)) {
    if (!count || count <= 0) continue;
    const it = Cc.items.get(id);
    if (!it) continue;
    const pbc = getItemPhaBinhCanh(it);
    if (pbc && pbc.canh_gioi === nv.canhGioi) {
      const isCapped =
        S.core && typeof S.core.drugCapped === "function"
          ? S.core.drugCapped(nv, id)
          : false;
      if (!isCapped) {
        pills.push({
          id,
          it,
          ten: it.ten || id,
          phan: pbc.phan || 1,
          count,
        });
      }
    }
  }
  return pills.sort((a, b) => b.phan - a.phan);
}

const auYield = (() => {
  if (typeof MessageChannel !== "function")
    return () => new Promise((r) => setTimeout(r, 0));
  const ch = new MessageChannel(),
    q = [];
  ch.port1.onmessage = () => {
    const f = q.shift();
    if (f) f();
  };
  return () =>
    new Promise((r) => {
      q.push(r);
      ch.port2.postMessage(0);
    });
})();
// Bản nhẹ của ctx() cho vòng Auto: không sao chép cả kiếp chơi (game đã tự sao chép ở mỗi thao tác).
// Chỉ dùng cho hàm CHỈ ĐỌC (đo đường, nguy hiểm, tên nơi, nơi hoang dã, mức chợ ngập); mô phỏng hay ghi thì vẫn dùng ctx().
function ctxLite() {
  const K = S.core,
    st = G().state,
    run = { ...st.run },
    F = K.Rng,
    o = new Map();
  run.rngKeys = run.rngKeys || {};
  return {
    ...G().env,
    run,
    meta: st.meta,
    rng: new F(run.rng),
    enc: run.active,
    noticeLines: [],
    rngFor(r) {
      let u = o.get(r);
      if (!u) {
        const l = Object.hasOwn(run.rngKeys, r)
          ? run.rngKeys[r]
          : undefined;
        u =
          l === undefined
            ? F.fromSeed(`${run.seed}|rng|${r}`)
            : new F(l);
        o.set(r, u);
      }
      return u;
    },
  };
}

function auLoad() {
  let o = {};
  try {
    o = JSON.parse(localStorage.getItem(AU_KEY) || "{}") || {};
  } catch (e) {
    o = {};
  }
  AU.cfg = {
    buon: { ...AU_DEF.buon, ...(o.buon || {}) },
    san: { ...AU_DEF.san, ...(o.san || {}) },
    km: { ...AU_DEF.km, ...(o.km || {}) },
    rr: { ...AU_DEF.rr, ...(o.rr || {}) },
    tl: { ...AU_DEF.tl, ...(o.tl || {}) },
    tc: { ...AU_DEF.tc, ...(o.tc || {}) },
    sdb: { ...AU_DEF.sdb, ...(o.sdb || {}) },
  };
  for (const k of ["pham", "he", "tc"])
    if (!Array.isArray(AU.cfg.rr[k]))
      AU.cfg.rr[k] = AU_DEF.rr[k].slice();
  if (!["easy", "normal", "hardcore"].includes(AU.cfg.rr.dl))
    AU.cfg.rr.dl = "normal";
  AU.cfg.rr.lp = !!AU.cfg.rr.lp;
  // 6.19: một lần duy nhất, đưa Auto Kinh Mạch về mặc định mới (ép hướng Mạnh, hướng xếp Tiên Tu) cho cả máy đã lưu cấu hình cũ.
  if (AU.cfg.km.v619 !== 1) {
    AU.cfg.km.v619 = 1;
    AU.cfg.km.bk = 5;
    if (!AU.cfg.km.dir) AU.cfg.km.dir = "tien";
  }
  if (AU.cfg.km.v715 !== 1) {
    AU.cfg.km.v715 = 1;
    if (!AU.cfg.km.ratio || AU.cfg.km.ratio === "55")
      AU.cfg.km.ratio = "64";
    if (AU.cfg.km.maxSkills == null) AU.cfg.km.maxSkills = "3";
  }
  AU.cfg.rr.lh = !!AU.cfg.rr.lh;
  if (!Array.isArray(AU.cfg.rr.lhIds)) AU.cfg.rr.lhIds = [];
  AU.cfg.rr.lhKeep = Math.max(0, Number(AU.cfg.rr.lhKeep) || 0);
  AU.cfg.san.mau = auMauNorm(AU.cfg.san.mau);
  delete AU.cfg.san.hiem; // Auto Săn Yêu: màu được phép do người dùng tích (mặc định Xanh, Vàng và Đỏ; Tím dừng)
  if (typeof AU.cfg.san.neHac !== "boolean") AU.cfg.san.neHac = true;
  if (typeof AU.cfg.san.danhAi !== "boolean") AU.cfg.san.danhAi = true;
  if (!Array.isArray(AU.cfg.sdb.targetRelics)) {
    AU.cfg.sdb.targetRelics = DIBAO.ev.map((e) => e.relic);
  }
  if (typeof AU.cfg.sdb.sanMoiDiBaoXuatThe !== "boolean") {
    AU.cfg.sdb.sanMoiDiBaoXuatThe = true;
  }
  if (typeof AU.cfg.tc.autoThaMang !== "boolean") {
    AU.cfg.tc.autoThaMang = true;
  }
  if (typeof AU.cfg.tc.autoEnemyEscape !== "boolean") {
    AU.cfg.tc.autoEnemyEscape = true;
  }
  if (!AU.cfg.tc.teHuyetMode) {
    AU.cfg.tc.teHuyetMode = "off";
  }
  if (!AU.cfg.tc.aiEngineMode) AU.cfg.tc.aiEngineMode = "smart_v3";
  if (!AU.cfg.tc.itemPolicy) AU.cfg.tc.itemPolicy = "auto";
  if (!AU.cfg.tc.healPillMode) AU.cfg.tc.healPillMode = "smart";
  if (AU.cfg.tc.healBossPanicHp == null) AU.cfg.tc.healBossPanicHp = 55;
  if (!AU.cfg.tc.spiritPillMode) AU.cfg.tc.spiritPillMode = "on_demand";
  if (!AU.cfg.tc.burstPillMode) {
    AU.cfg.tc.burstPillMode =
      AU.cfg.tc.useBurstPill === false ? "off" : "boss_combo";
  }
  if (typeof AU.cfg.tc.cleansePillMode !== "boolean")
    AU.cfg.tc.cleansePillMode = true;
  if (AU.cfg.tc.maxPillGradeNormal == null) {
    AU.cfg.tc.maxPillGradeNormal = Math.min(
      4,
      AU.cfg.tc.maxPillGrade || 5,
    );
  }
  if (!AU.cfg.tc.shieldTalismanMode) {
    AU.cfg.tc.shieldTalismanMode =
      AU.cfg.tc.smartShield === false ? "off" : "predictive";
  }
  if (AU.cfg.tc.shieldHpThreshold == null)
    AU.cfg.tc.shieldHpThreshold = 55;
  if (!AU.cfg.tc.ccTalismanMode) {
    AU.cfg.tc.ccTalismanMode =
      AU.cfg.tc.smartCc === false ? "off" : "interrupt";
  }
  if (!AU.cfg.tc.atkTalismanMode) {
    AU.cfg.tc.atkTalismanMode =
      AU.cfg.tc.useAttackTalismans === false ? "off" : "smart_weave";
  }
  if (AU.cfg.tc.talismanGradeNormal == null) {
    AU.cfg.tc.talismanGradeNormal = Math.min(
      4,
      AU.cfg.tc.talismanGrade || 5,
    );
  }
  if (!AU.cfg.tc.formationMode)
    AU.cfg.tc.formationMode = "boss_or_danger";
  if (AU.cfg.tc.recallPetHp == null) AU.cfg.tc.recallPetHp = 25;
  if (AU.cfg.tc.healSkillThreshold == null)
    AU.cfg.tc.healSkillThreshold = 75;
  if (AU.cfg.tc.shieldSkillThreshold == null)
    AU.cfg.tc.shieldSkillThreshold = 40;
  if (typeof AU.cfg.tc.preventOverkill !== "boolean")
    AU.cfg.tc.preventOverkill = true;
  if (typeof AU.cfg.tc.aoePriority !== "boolean")
    AU.cfg.tc.aoePriority = true;
  if (typeof AU.cfg.tc.prioritizeNatal !== "boolean")
    AU.cfg.tc.prioritizeNatal = true;
  if (AU.cfg.tc.thieuDotHp == null) AU.cfg.tc.thieuDotHp = 20;
  if (AU.cfg.tc.escapeHp == null) AU.cfg.tc.escapeHp = 16;
  if (typeof AU.cfg.sdb.autoThaMang !== "boolean") {
    AU.cfg.sdb.autoThaMang = true;
  }
  if (typeof AU.cfg.sdb.autoEnemyEscape !== "boolean") {
    AU.cfg.sdb.autoEnemyEscape = true;
  }
  if (typeof AU.cfg.tl.autoThaMang !== "boolean") {
    AU.cfg.tl.autoThaMang = true;
  }
  if (typeof AU.cfg.tl.autoEnemyEscape !== "boolean") {
    AU.cfg.tl.autoEnemyEscape = true;
  }
  if (!["be_quan", "danh_quai"].includes(AU.cfg.tl.mode)) {
    AU.cfg.tl.mode = "be_quan";
  }
  if (AU.cfg.tl.targetSubRealm === undefined) {
    AU.cfg.tl.targetSubRealm = 3;
  }
  if (typeof AU.cfg.tl.uuTienSuKienTuVi !== "boolean") {
    AU.cfg.tl.uuTienSuKienTuVi = true;
  }
  if (typeof AU.cfg.tl.autoBreakBottleneck !== "boolean") {
    AU.cfg.tl.autoBreakBottleneck = true;
  }
  if (o.san) {
    if (o.tl && o.tl.maxY === undefined && o.san.maxY !== undefined)
      AU.cfg.tl.maxY = o.san.maxY;
    if (o.tl && o.tl.tran === undefined && o.san.tran !== undefined)
      AU.cfg.tl.tran = o.san.tran;
    if (o.tl && o.tl.thuong === undefined && o.san.thuong !== undefined)
      AU.cfg.tl.thuong = o.san.thuong;
    if (o.tl && o.tl.kt === undefined && o.san.kt !== undefined)
      AU.cfg.tl.kt = o.san.kt;
    if (o.tl && o.tl.neHac === undefined && o.san.neHac !== undefined)
      AU.cfg.tl.neHac = o.san.neHac;
    if (o.tl && o.tl.danhAi === undefined && o.san.danhAi !== undefined)
      AU.cfg.tl.danhAi = o.san.danhAi;
    if (o.tl && !o.tl.mau && o.san.mau) AU.cfg.tl.mau = o.san.mau;
  }
  AU.cfg.tl.mau = auMauNorm(AU.cfg.tl.mau || AU_DEF.tl.mau);
  if (typeof AU.cfg.tl.neHac !== "boolean") AU.cfg.tl.neHac = true;
  if (typeof AU.cfg.tl.danhAi !== "boolean") AU.cfg.tl.danhAi = true;
  AU.cfg.tl.sanMucTieu = AU.cfg.tl.sanMucTieu || "uu_tien_dau_dan";
  if (typeof AU.cfg.tl.autoDuongThuong !== "boolean")
    AU.cfg.tl.autoDuongThuong = true;
  if (typeof AU.cfg.tl.uuTienCapNen !== "boolean")
    AU.cfg.tl.uuTienCapNen = true;
  if (AU.cfg.san) {
    AU.cfg.san.sanMucTieu =
      AU.cfg.san.sanMucTieu ||
      AU.cfg.tl.sanMucTieu ||
      "uu_tien_dau_dan";
    if (typeof AU.cfg.san.autoDuongThuong !== "boolean")
      AU.cfg.san.autoDuongThuong = true;
    if (typeof AU.cfg.san.uuTienCapNen !== "boolean")
      AU.cfg.san.uuTienCapNen = true;
  }
}
function auSave() {
  try {
    localStorage.setItem(AU_KEY, JSON.stringify(AU.cfg));
  } catch (e) {
    /* bỏ qua */
  }
}
auLoad();

const auSleep = (ms) => new Promise((r) => setTimeout(r, ms));
const auShopKey = (slot, id) => slot + "|" + id;
const auClamp = (v, lo, hi, d) => {
  v = Number(v);
  return Number.isFinite(v) ? Math.min(hi, Math.max(lo, v)) : d;
};
function auLog(msg, cls) {
  AU.log.push({ msg: String(msg), cls: cls || "" });
  if (AU.log.length > 80) AU.log.splice(0, AU.log.length - 80);
  auPaintSoon();
}
// Vẽ giãn nhịp (tối đa 4 lần/giây) để vòng chạy nhanh không bị kéo chậm bởi việc dựng lại giao diện.
let auPT = 0;
function auPaintSoon() {
  if (auPT) return;
  auPT = setTimeout(() => {
    auPT = 0;
    auPaint();
  }, 250);
}

// Gọi một hàm của game rồi kiểm tra có lỗi không (game nuốt lỗi vào state.error, không ném ra ngoài).
function auCall(fn) {
  const g = G(),
    e0 = g.state.error,
    r0 = g.state.run;
  try {
    fn(g);
  } catch (e) {
    return { ok: false, err: String((e && e.message) || e) };
  }
  const s = g.state,
    e1 = s.error;
  if (e1 && (e1 !== e0 || s.run === r0))
    return { ok: false, err: String(e1) };
  return { ok: true };
}
function auSig() {
  const r = G().state.run;
  if (!r) return "x";
  const a = r.active;
  return [
    r.nam,
    r.viTri,
    r.oNoi || "",
    r.rng,
    a
      ? a.id +
        ":" +
        (a.done ? 1 : 0) +
        ":" +
        (a.waiting ? 1 : 0) +
        ":" +
        ((a.transcript && a.transcript.length) || 0)
      : "",
    r.tran
      ? "t" +
        (r.tran.ketThuc ? 1 : 0) +
        ":" +
        (r.tran.daGiaoChien ? 1 : 0) +
        ":" +
        (r.tran.hiep || 0) +
        ":" +
        ((r.tran.ta && r.tran.ta.khiHuyet) || 0) +
        ":" +
        (r.tran.rng || 0)
      : "",
    r.nhanVat.linhThach,
    r.thongBao || "",
    AU.run ? AU.run.hacSkipped || 0 : 0,
  ].join("|");
}
const auLifeLeft = () => {
  try {
    const nv = G().state.run.nhanVat;
    return S.core.thoNguyenToiDa(nv) - nv.tuoi;
  } catch (e) {
    return Infinity;
  }
};
const auBag = (id) =>
  (G().state.run.nhanVat.tuiDo && G().state.run.nhanVat.tuiDo[id]) || 0;
const auItemName = (id) => {
  try {
    const it = C().items.get(id);
    return it ? it.ten : id;
  } catch (e) {
    return id;
  }
};

// Khớp de()/vb() của game: nơi chốn = nơi cố định có địa danh mà loại đó nằm trong danh mục nơi chốn (content.noiChon),
// điểm biển tương tự, hoặc nơi đã có chủ nhận. Còn lại (chưa ẩn) là hoang dã, săn yêu được.
let auSettle = null;
function auSettleLoai() {
  let map;
  try {
    map = C().noiChon;
  } catch (e) {
    return null;
  }
  if (!map || typeof map.values !== "function") return null;
  if (auSettle && auSettle.map === map) return auSettle.set;
  const set = new Set();
  for (const d of map.values())
    for (const l of (d && d.loai) || []) set.add(l);
  auSettle = { map, set };
  return set;
}
function auIsWild(c, slot) {
  try {
    const W = c.world,
      sl = W.slot(slot);
    if (!sl || sl.an) return false;
    const nc = c.run.noiChon && c.run.noiChon[slot];
    if (nc && nc.chuNhan) return false;
    const set = auSettleLoai(),
      sea = W.seaPoint && W.seaPoint(slot);
    if (sea) return set ? !set.has(sea.loai) : false;
    const i = W.info(slot);
    if (!i.slot || !i.slot.co_dinh || !i.diaDanh) return true;
    return set ? !set.has(i.diaDanh.loai) : false; // không đọc được danh mục thì coi là nơi chốn cho an toàn
  } catch (e) {
    return false;
  }
}
// Mức nguy hiểm của một nơi so với giới hạn người dùng đặt; không đọc được thì coi là không an toàn.
function auDangerOK(c, slot, max) {
  const d = danger(c, slot);
  if (!d) return false;
  return (AU_HIEM[d.id] ?? 9) <= (AU_HIEM[max] ?? 1);
}
function auHuntLeft(run, slot) {
  const e = run.sanYeu && run.sanYeu[slot];
  const sy = e ? Math.max(0, e[0] - (run.nam - e[1]) / AU_ZAN) : 0;
  return AU_T4 - sy;
}

// ── Bảng xác nhận của game (Tử Địa, Huyết Độn, Ném Đồ Bỏ Chạy, xác nhận của lựa chọn…).
// Bảng là phần giao diện của game (role=alertdialog, nút đầu = Hủy, nút “nut-chinh” = Đồng ý). Auto điều khiển thẳng engine nên
// tự nó không bật bảng; nhưng bảng đang hiện thì Auto phải đóng được. Chỉ đi đường HỦY, tuyệt đối không bấm nút đồng ý.
const AU_PANEL =
  '.hud-man-hoi [role="alertdialog"], [role="alertdialog"].hud-xac-nhan';
function auConfirmPanel() {
  try {
    return document.querySelector(AU_PANEL);
  } catch (e) {
    return null;
  }
}
async function auDismissConfirm() {
  const p = auConfirmPanel();
  if (!p) return null;
  const info = {
    title: String(
      p.getAttribute("aria-label") ||
        (p.querySelector("h1") || {}).textContent ||
        "",
    ).trim(),
    nguy: p.classList.contains("nguy"),
    closed: false,
  };
  const tries = [
    () => {
      const b = [
        ...p.querySelectorAll(".hud-xac-nhan-nut button"),
      ].find((x) => !x.classList.contains("nut-chinh"));
      if (b) b.click();
    }, // nút Hủy / Thôi
    () =>
      window.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "Escape",
          bubbles: true,
          cancelable: true,
        }),
      ), // phím Esc
    () => {
      const bg = p.closest(".hud-man-hoi");
      if (bg) bg.click();
    }, // bấm nền
  ];
  for (const f of tries) {
    try {
      f();
    } catch (e) {
      /* thử đường kế */
    }
    await auSleep(0);
    if (!auConfirmPanel()) {
      info.closed = true;
      break;
    }
  }
  return info;
}
// Trả về thông tin bảng vừa đóng (hoặc null nếu không có bảng), có ghi nhật ký.
async function auBypassConfirm() {
  if (!auConfirmPanel()) return null;
  const r = await auDismissConfirm();
  if (r)
    auLog(
      "Phát hiện bảng xác nhận “" +
        (r.title || "không tên") +
        "”" +
        (r.nguy ? " (cảnh báo nguy hiểm)" : "") +
        ": " +
        (r.closed
          ? "đã đóng theo đường Hủy, không đồng ý."
          : "chưa đóng hẳn được, bạn đóng giúp."),
      "vk-bad",
    );
  return r;
}
// Mức rủi ro của trận đang mở, tính y như game tô màu lựa chọn giao chiến (thắng → Xanh/Vàng; thua → Đỏ, cách ≥ 4 bậc → Tím).
function auBattleLevel(run, p) {
  if (!p) return "unknown";
  if (p.thang)
    return p.ketQua && p.ketQua.thuongThe ? "ngang_suc" : "an_toan";
  try {
    const t = run.tran,
      d = Math.max(...t.dich.map((x) => x.bac)) - t.ta.bac;
    if (d >= 4) return "tu_dia";
  } catch (e) {
    /* bỏ qua */
  }
  return "hiem";
}

