import { gWin, TOOL_VER, TT, MOD } from "./utils.js";
/**
 * Module: Cầu Nối Lõi Game (tuTien.core), Quản Lý State, Context (Memoized) & Mô Phỏng Trận
 */

// Hằng số săn cạn (được đồng bộ tự động từ balance/encounter của game qua K.sync)
let AU_T4 = 3,
  AU_ZAN = 2;

const S = { core: null, best: null, abort: false, kmAbort: false };
const body = UI.body,
  tabsEl = UI.tabs,
  groupsEl = UI.groups;

// ───────────────────────── 1. Nạp lõi game (qua tuTien.core, không còn dò regex hay nạp bản sao game) ─────────────────────────
// Mọi hàm lấy theo tên gốc trong mã nguồn game (tuTien.core['<module>'].<hàm>), nên không vỡ khi game đổi tên rút gọn sau mỗi bản build.
// Cột 1: khóa Tool dùng · cột 2: module · cột 3: tên hàm trong game. Bắt buộc: thiếu thì Tool báo rõ module.hàm nào mất.
const CORE_REQUIRED = [
  ["tinhTocChien", "combat/autoCombat", "tinhTocChien"],
  ["taoBenTa", "combat/setup", "taoBenTa"],
  ["taoBenDich", "combat/setup", "taoBenDich"],
  ["tinhKinhMach", "character/kinh_mach", "tinhKinhMach"],
  ["oCuaManh", "character/kinh_mach", "oCuaManh"],
  ["kiemTraDat", "character/kinh_mach", "kiemTraDat"],
  ["chuanBiDotPha", "progress/dot_pha", "chuanBiDotPha"],
  ["hangTong", "progress/tong_mon", "hangTong"],
  ["thieuDeThangCap", "progress/tong_mon", "thieuDeThangCap"],
  ["tongMonCua", "progress/tong_mon", "tongMonCua"],
  ["thoNguyenToiDa", "character/character", "thoNguyenToiDa"],
  ["trialOpponent", "progress/tournament", "trialOpponent"],
  ["timDich", "character/npc", "timDich"],
  ["tenCanhGioi", "kernel/realms", "tenCanhGioi"],
  ["travelYears", "world/travel", "travelYears"],
  ["canhGioi", "kernel/realms", "canhGioi"],
  ["Rng", "kernel/rng", "Rng"],
  ["giaMua", "world/phong_tho", "giaMua"],
  ["slotDaMo", "world/suong", "slotDaMo"],
  ["shelfStock", "encounter/shop/market", "shelfStock"],
];
// Tính năng phụ: thiếu thì chỉ tính năng đó tắt, phần còn lại vẫn chạy.
const CORE_OPTIONAL = [
  [
    "drugCapped",
    "character/character",
    "drugCapped",
    "kiểm tra trần đan dược cảnh giới",
  ],
  [
    "realmDrugUses",
    "character/character",
    "realmDrugUses",
    "số viên đan đã dùng trong cảnh giới",
  ],
  [
    "drugTargetsOf",
    "character/character",
    "drugTargetsOf",
    "mục tiêu bị dược kháng",
  ],
  [
    "DRUG_TARGETS",
    "character/character",
    "DRUG_TARGETS",
    "danh sách mục tiêu có dược kháng",
  ],
  [
    "atBottleneck",
    "character/character",
    "atBottleneck",
    "kiểm tra bình cảnh",
  ],
  [
    "binhCanhThreshold",
    "character/character",
    "binhCanhThreshold",
    "ngưỡng bình cảnh",
  ],
  [
    "facilitiesAt",
    "encounter/director",
    "facilitiesAt",
    "tiện ích ở một nơi",
  ],
  ["giaBan", "world/phong_tho", "giaBan", "giá bán"],
  [
    "tinhDiemKiep",
    "progress/luan_hoi",
    "tinhDiemKiep",
    "điểm luân hồi",
  ],
  ["xepBang", "character/nhan_vat", "xepBang", "bảng Thiên Kiêu"],
  [
    "chuanBiBeQuan",
    "progress/be_quan",
    "chuanBiBeQuan",
    "thông tin bế quan",
  ],
  [
    "retreatTargetGain",
    "progress/be_quan",
    "retreatTargetGain",
    "tu vi còn thiếu",
  ],
  [
    "retreatGain",
    "progress/be_quan",
    "retreatGain",
    "tu vi theo số năm",
  ],
  [
    "tocDoTuLuyen",
    "character/character",
    "tocDoTuLuyen",
    "tốc độ tu luyện",
  ],
  [
    "phanBoKhaoHach",
    "progress/luyen_che",
    "phanBoKhaoHach",
    "thi nghề",
  ],
  [
    "thieuDeKhaoHach",
    "progress/luyen_che",
    "thieuDeKhaoHach",
    "điều kiện thi nghề",
  ],
  ["chuanBiLuyen", "progress/luyen_che", "chuanBiLuyen", "luyện chế"],
  [
    "nguonDiemGoc",
    "progress/luyen_che",
    "nguonDiemGoc",
    "điểm luyện chế",
  ],
  [
    "bangTreoThuong",
    "world/bounty",
    "bangTreoThuong",
    "bảng treo thưởng",
  ],
  ["bongLoc", "progress/tong_mon", "bongLoc", "bổng lộc"],
  ["tienCuDuoc", "progress/tong_mon", "tienCuDuoc", "tiến cử"],
  [
    "revealedCombatRisk",
    "encounter/choice_risk",
    "revealedCombatRisk",
    "ước lượng trận của game",
  ],
  [
    "createRun",
    "kernel/run",
    "createRun",
    "tạo kiếp mới (Auto Reroll)",
  ],
  ["glutRoom", "world/market_glut", "glutRoom", "chợ ngập hàng"],
  [
    "doChenh",
    "encounter/do_hiem",
    "doChenh",
    "độ nguy hiểm (chênh cấp)",
  ],
  ["mucHiem", "encounter/do_hiem", "mucHiem", "độ nguy hiểm (mức)"],
  ["namLinhNgo", "character/kinh_mach", "namLinhNgo", "năm lĩnh ngộ"],
  [
    "masteryMult",
    "character/kinh_mach",
    "masteryMult",
    "hệ số lĩnh ngộ",
  ],
  [
    "effectiveStat",
    "character/stats",
    "effectiveStat",
    "chỉ số nhân vật",
  ],
  ["gradeMult", "character/pham", "gradeMult", "hệ số phẩm"],
  ["skillCap", "character/pham", "skillCap", "trần pháp lực của món"],
  [
    "spellPower",
    "balance/combat",
    "spellPower",
    "pháp lực theo cảnh giới",
  ],
  [
    "refineQuote",
    "character/natal",
    "refineQuote",
    "chi phí tế luyện bản mệnh",
  ],
  [
    "ascendQuote",
    "character/natal",
    "ascendQuote",
    "chi phí nâng giai bản mệnh",
  ],
  [
    "refineBlock",
    "character/natal",
    "refineBlock",
    "kiểm tra tế luyện",
  ],
  [
    "natalItemError",
    "character/natal",
    "natalItemError",
    "món làm bản mệnh",
  ],
  [
    "ascendBlock",
    "character/natal",
    "ascendBlock",
    "kiểm tra nâng giai",
  ],
  [
    "temperBlock",
    "character/natal",
    "temperBlock",
    "kiểm tra huyết luyện",
  ],
  [
    "devourCandidates",
    "progress/natal_act",
    "devourCandidates",
    "ứng viên văn khi nuốt",
  ],
  [
    "devourItemError",
    "progress/natal_act",
    "devourItemError",
    "kiểm tra nuốt món",
  ],
  [
    "innateRuneOf",
    "character/natalRunes",
    "innateRuneOf",
    "văn bẩm sinh của món",
  ],
  [
    "nextAutomatedAction",
    "combat/playerAutomation",
    "nextAutomatedAction",
    "AI tự đánh trong trận",
  ],
  [
    "chanChieu",
    "combat/actions",
    "chanChieu",
    "kiểm tra chiêu dùng được",
  ],
  [
    "chanDungDo",
    "combat/actions",
    "chanDungDo",
    "kiểm tra dùng đồ trong trận",
  ],
  [
    "estimatePillRestore",
    "combat/actions",
    "estimatePillRestore",
    "ước tính lượng hồi đan dược",
  ],
  [
    "pillWasted",
    "combat/actions",
    "pillWasted",
    "kiểm tra lãng phí đan",
  ],
  [
    "breakthroughGrade",
    "progress/dot_pha",
    "breakthroughGrade",
    "phẩm chất đột phá dự kiến",
  ],
  [
    "resolveBreakthrough",
    "progress/dot_pha",
    "resolveBreakthrough",
    "kết quả sau trận tâm ma",
  ],
  [
    "pillFitsRealm",
    "progress/dot_pha",
    "pillFitsRealm",
    "đan hợp cảnh giới",
  ],
  [
    "pillMaxRealm",
    "progress/dot_pha",
    "pillMaxRealm",
    "cảnh giới tối đa của đan",
  ],
  [
    "isRuneMaxed",
    "character/natal",
    "isRuneMaxed",
    "kiểm tra văn đầy cấp",
  ],
  [
    "isRuneHighTier",
    "character/natal",
    "isRuneHighTier",
    "văn bậc tỉ lệ",
  ],
  [
    "runeUpgradeChance",
    "character/natal",
    "runeUpgradeChance",
    "tỉ lệ nâng văn thành công",
  ],
  ["runeLore", "character/natal", "runeLore", "thông tin văn đã ngộ"],
  [
    "runeUpgradeBlock",
    "character/natal",
    "runeUpgradeBlock",
    "kiểm tra nâng văn",
  ],
  [
    "describeRune",
    "character/natalRunes",
    "describeRune",
    "mô tả chi tiết văn",
  ],
  [
    "collectRuneMods",
    "character/natalRunes",
    "collectRuneMods",
    "tổng hợp chỉ số văn",
  ],
  [
    "THONG_MACH_VUNG",
    "character/kinh_mach",
    "THONG_MACH_VUNG",
    "vùng thông mạch theo bậc",
  ],
  [
    "luotMo",
    "character/kinh_mach",
    "luotMo",
    "tổng lượt mở ô kinh mạch",
  ],
  [
    "vungCuaBac",
    "character/kinh_mach",
    "vungCuaBac",
    "vùng với tới theo bậc đan",
  ],
  ["oTrongTam", "character/kinh_mach", "oTrongTam", "ô trong tầm đan"],
  [
    "bountyRealm",
    "world/bounty",
    "bountyRealm",
    "cảnh giới việc treo thưởng",
  ],
  [
    "reforgeSources",
    "progress/grade",
    "reforgeSources",
    "nguồn cộng bậc trùng kết",
  ],
  [
    "shopItemsAt",
    "encounter/shop/market",
    "shopItemsAt",
    "danh sách hàng tiệm",
  ],
];
// Hằng số bản mệnh: khóa Tool → tên hằng trong core['balance/natal'].
const BM_CONST = {
  realmMin: "NATAL_MIN_REALM",
  gradeMin: "NATAL_MIN_GRADE",
  gradeMax: "NATAL_MAX_GRADE",
  pickMax: "NATAL_MAX_BASE_GRADE",
  teYears: "NATAL_REFINE_YEARS",
  teEss: "NATAL_ESSENCE_YEARS",
  upEss: "NATAL_ASCEND_YEARS",
  hoaYears: "NATAL_RELEASE_YEARS",
  tempEss: "NATAL_TEMPER_YEARS",
  stone: "NATAL_REFINE_COST",
  runeStone: "NATAL_ENGRAVE_COST",
  reserve: "NATAL_LIFESPAN_GUARD",
  ess: "NATAL_CRAFT_ESSENCE_MULT",
  fail: "NATAL_CRAFT_FAIL",
  byp: "NATAL_CRAFT_BYPRODUCT",
  failEss: "NATAL_FAIL_ESSENCE_RATIO",
  tier: "NATAL_TIER_EXP",
  mult: "NATAL_GRID_MULT",
  slotT: "NATAL_SLOTS_BY_TIER",
  slotMax: "NATAL_MAX_SLOTS",
  winExp: "NATAL_EXP_WIN",
  winGap: "NATAL_WIN_REALM_GAP",
  seatRate: "NATAL_EXP_YEAR",
  seatCap: "NATAL_EXP_YEAR_CAP",
  breakExp: "NATAL_EXP_BREAKTHROUGH",
  tempExp: "NATAL_EXP_TEMPER",
  tempMax: "NATAL_TEMPER_PER_REALM",
  loseKeep: "NATAL_LOSS_RATIO",
  upCap: "NATAL_GRADE_CAP",
  upExp: "NATAL_ASCEND_EXP",
  runeLv: "NATAL_RUNE_LEVEL_POINTS",
  devourMax: "NATAL_DEVOUR_PER_YEAR",
  weakGap: "NATAL_DEVOUR_LOW_GAP",
  weakMul: "NATAL_DEVOUR_LOW_RATIO",
  newGap: "NATAL_LEARN_GAP",
  cand: "NATAL_RUNE_CANDIDATES",
  runeMaxLv: "NATAL_RUNE_MAX_LEVEL",
  highChance: "NATAL_RUNE_HIGH_CHANCE",
  highGap: "NATAL_RUNE_HIGH_GAP",
  luckStep: "NATAL_RUNE_LUCK_STEP",
  failChance: "NATAL_RUNE_FAIL_CHANCE",
  mutantChance: "NATAL_RUNE_MUTANT_CHANCE",
  mutantMult: "NATAL_RUNE_MUTANT_MULT",
  winExpLower: "NATAL_EXP_WIN_LOWER",
  winYearCap: "NATAL_EXP_WIN_YEAR_CAP",
  gradeUyExp: "NATAL_GRADE_UY_EXPONENT",
  bloodPower: "NATAL_BLOOD_SACRIFICE_POWER",
};
const BM_RUNE_KEYS = [
  "liet",
  "phagiap",
  "lienhoan",
  "hothe",
  "kimchung",
  "hutmau",
  "tulinh",
  "effect_chance",
  "troi",
  "phan",
  "van",
  "quy",
  "nhiem",
  "uanbao",
  "inner_stat",
];

function buildCore(tt) {
  const R = tt.core;
  if (!R)
    throw new Error("Game chưa mở tuTien.core. Hãy cập nhật game.");
  const K = {
    gameVersion: tt.gameVersion,
    bundle: "v" + tt.gameVersion,
    healed: [],
    healFail: [],
    optMissing: [],
  };
  const miss = [];
  for (const [key, mod, name] of CORE_REQUIRED) {
    const f = R[mod] && R[mod][name];
    if (f === undefined) miss.push(mod + "." + name);
    else K[key] = f;
  }
  if (miss.length)
    throw new Error(
      "Game vừa cập nhật nên Tool chưa nhận ra: " +
        miss.join(", ") +
        ". Hãy chụp màn hình này gửi Claude để sửa Tool.",
    );
  for (const [key, mod, name, label] of CORE_OPTIONAL) {
    const f = R[mod] && R[mod][name];
    if (f !== undefined) K[key] = f;
    else K.optMissing.push(label + " (" + mod + "." + name + ")");
  }
  // Lưới kinh mạch: khuonCua(content, nhânVật). ctx có đủ .items nên truyền thẳng được.
  const KM = R["character/kinh_mach"];
  K.luoiKinhMach = (c, nv) => KM.khuonCua(c, nv);
  if (KM) {
    for (const fn of [
      "heTungO",
      "acupointsOf",
      "baseAcupoints",
      "doHop",
      "hopHe",
      "hopKinhLo",
      "sinh",
      "khac",
      "coTuongSinhNoiTai",
      "coTuongKhacNoiTai",
      "heDoiDuoc",
      "tayConLai",
    ]) {
      if (typeof KM[fn] === "function" && !K[fn]) {
        K[fn] = KM[fn].bind(KM);
      }
    }
  }
  // Ánh xạ trực tiếp các module và hàm chiến đấu từ lõi game để Siêu AI Tác Chiến 3.0 truy xuất 100% chính xác
  for (const modName of [
    "combat/actions",
    "combat/elements",
    "combat/playerAutomation",
    "combat/setup",
    "combat/autoCombat",
  ]) {
    if (R[modName]) K[modName] = R[modName];
  }
  const CA = R["combat/actions"];
  if (CA) {
    for (const fn of [
      "chanChieu",
      "chanDungDo",
      "estimatePillRestore",
      "pillWasted",
      "escapeBlock",
      "escapeRealmBlock",
      "chanThieuDot",
      "formationBlock",
      "heSoHe",
    ]) {
      if (typeof CA[fn] === "function" && !K[fn]) {
        K[fn] = CA[fn].bind(CA);
      }
    }
  }
  const CE = R["combat/elements"];
  if (CE && typeof CE.heTacDong === "function" && !K.heTacDong) {
    K.heTacDong = CE.heTacDong.bind(CE);
  }
  // Hằng đọc sống từ game (hằng khai 'export let' đổi theo độ khó), không chép ra biến lúc nạp.
  const live = (name, mod, key) =>
    Object.defineProperty(K, name, {
      enumerable: true,
      get() {
        try {
          const v = R[mod][key];
          return v === undefined ? undefined : v;
        } catch (e) {
          return undefined;
        }
      },
    });
  live(
    "AMBUSH_MIN_DISTANCE",
    "balance/encounter",
    "AMBUSH_MIN_DISTANCE",
  );
  live(
    "AUCTION_HAND_LOT_SHARE",
    "balance/economy",
    "AUCTION_HAND_LOT_SHARE",
  );
  live("DIFFICULTY", "balance/difficulty", "DIFFICULTY");
  live("DIFFICULTY_MODES", "balance/difficulty", "DIFFICULTY_MODES");
  live(
    "DIFFICULTY_KNOB_INFO",
    "balance/difficulty",
    "DIFFICULTY_KNOB_INFO",
  );
  live("SIEGE_MAX_ROUNDS", "balance/combat", "SIEGE_MAX_ROUNDS");
  live("SECT_GROUND_BONUS", "balance/sect", "SECT_GROUND_BONUS");
  live("CAP_BAC", "balance/sect", "CAP_BAC"); // tên cấp bậc tông môn: Tạp dịch … Trưởng lão
  if (!Array.isArray(K.CAP_BAC) || !K.CAP_BAC.length)
    throw new Error(
      "Game vừa cập nhật nên Tool chưa nhận ra: balance/sect.CAP_BAC (tên cấp bậc tông môn). Hãy chụp màn hình này gửi Claude để sửa Tool.",
    );
  const numArr = (a, n) =>
    Array.isArray(a) &&
    (n === undefined || a.length === n) &&
    a.every(Number.isFinite);
  Object.defineProperty(K, "bm", {
    enumerable: true,
    get() {
      try {
        const N = R["balance/natal"],
          o = {};
        for (const [k, nm] of Object.entries(BM_CONST)) o[k] = N[nm];
        const arr6 = [
          "teYears",
          "teEss",
          "upEss",
          "hoaYears",
          "tempEss",
          "ess",
          "fail",
          "byp",
        ];
        const ok =
          arr6.every((k) => numArr(o[k], 6)) &&
          numArr(o.tier, 4) &&
          numArr(o.mult, 4) &&
          numArr(o.slotT, 4) &&
          numArr(o.runeLv, 2) &&
          Object.entries(o).every(([k, v]) =>
            Array.isArray(v)
              ? v.every(Number.isFinite)
              : Number.isFinite(v),
          );
        return ok ? o : undefined;
      } catch (e) {
        return undefined;
      }
    },
  });
  Object.defineProperty(K, "bmRune", {
    enumerable: true,
    get() {
      try {
        const o = R["balance/natal"].NATAL_RUNE_VALUE;
        return o &&
          BM_RUNE_KEYS.every((k) => numArr(o[k], 5) || numArr(o[k], 3))
          ? o
          : undefined;
      } catch (e) {
        return undefined;
      }
    },
  });
  Object.defineProperty(K, "rare", {
    enumerable: true,
    get() {
      try {
        const C = R["balance/combat"],
          dH = C.RARE_DROP_CHANCE,
          rank = C.RARE_DROP_RANK_FACTOR;
        if (
          !numArr(dH) ||
          !rank ||
          !Object.values(rank).every(Number.isFinite)
        )
          return undefined;
        return { dH, rank, nhanHo: TC_RARE.nhanHo };
      } catch (e) {
        return undefined;
      }
    },
  });
  Object.defineProperty(K, "san", {
    enumerable: true,
    get() {
      try {
        const E = R["balance/encounter"],
          max = E.HUNTS_PER_SLOT,
          hoi = E.HUNT_RECOVERY_YEARS;
        return max > 0 && hoi > 0 ? { max, hoi } : undefined;
      } catch (e) {
        return undefined;
      }
    },
  });
  // Săn cạn: số lần tối đa mỗi nơi và số năm hồi một lần (đọc lại mỗi lần vẽ vì hằng có thể đổi theo độ khó).
  K.sync = () => {
    const s = K.san;
    if (s) {
      AU_T4 = s.max;
      AU_ZAN = s.hoi;
      gWin.AU_T4 = AU_T4;
      gWin.AU_ZAN = AU_ZAN;
    }
  };
  K.sync();
  return K;
}
// Nạp lõi: đồng bộ (tuTien.core có sẵn từ pha ready). Giữ dạng async để các chỗ gọi cũ không phải đổi.
async function loadCore(progress) {
  const g = G();
  if (!g || !g.env || !g.env.content)
    throw new Error(
      "Chưa thấy game. Hãy đợi game tải xong rồi bấm Thử Lại.",
    );
  progress("Đang nối lõi game…");
  const core = await buildCore(TT);
  try {
    syncDynamicGameData();
  } catch (e) {}
  return core;
}

// ───────────────────────── 2. Tiện ích ─────────────────────────
const G = () => TT.game;
const C = () => G().env.content;
const HUD = () => TT.hud;
const gamePanel = (name, open) =>
  TT.ui && TT.ui.gamePanel ? TT.ui.gamePanel(name, open) : false;
const clone = (x) => structuredClone(x);
// Dynamic Data Layer: Tự động quét và đồng bộ dữ liệu mới nhất từ game content gốc
let _dynamicDataSynced = false;
function syncDynamicGameData() {
  if (_dynamicDataSynced) return;
  try {
    const g = G();
    const content = g && g.env && g.env.content;
    if (!content) return;

    // 1. Đồng bộ NL_META
    if (
      content.items &&
      typeof content.items.values === "function" &&
      typeof NL_META === "object"
    ) {
      for (const it of content.items.values()) {
        if (!it || !it.id) continue;
        if (!NL_META[it.id]) {
          if (it.ngu_linh) {
            const loai = Array.isArray(it.ngu_linh.loai)
              ? it.ngu_linh.loai[0]
              : it.ngu_linh.loai || "thu";
            NL_META[it.id] = [it.loai || "lieu", loai];
          } else if (
            it.tag &&
            (it.tag.includes("hon") ||
              it.tag.includes("thi") ||
              it.tag.includes("trung") ||
              it.tag.includes("khoi_loi") ||
              it.tag.includes("thu"))
          ) {
            const tag =
              it.tag.find((t) =>
                ["hon", "thi", "trung", "khoi_loi", "thu"].includes(t),
              ) || "thu";
            NL_META[it.id] = [it.loai || "lieu", tag];
          }
        }
      }
    }

    // 2. Đồng bộ NL_ENEMY
    if (
      content.enemies &&
      typeof content.enemies.values === "function" &&
      Array.isArray(NL_ENEMY)
    ) {
      const knownEnemyIds = new Set(NL_ENEMY.map((e) => e.id));
      for (const en of content.enemies.values()) {
        if (!en || !en.id || knownEnemyIds.has(en.id)) continue;
        if (
          en.ngu_linh ||
          (en.loai &&
            (en.loai.includes("thu") || en.loai.includes("yeu_thu")))
        ) {
          NL_ENEMY.push({
            id: en.id,
            ten: en.ten || en.id,
            cg: en.canh_gioi ?? 1,
            he: en.he || [],
            loai: en.ngu_linh?.loai || ["thu"],
            dk: en.ngu_linh?.do_kho ?? 0.5,
            th: en.tien_hoa || [],
            hach: en.hach || null,
            dh: en.dia_hinh || [],
            mt: en.mo_ta || "",
          });
          knownEnemyIds.add(en.id);
        }
      }
    }

    // 3. Đồng bộ THE_CHAT_DB
    if (content.theChat && typeof THE_CHAT_DB === "object") {
      const tcEntries =
        typeof content.theChat.values === "function"
          ? content.theChat.values()
          : Object.values(content.theChat);
      for (const tc of tcEntries) {
        if (!tc || !tc.id || THE_CHAT_DB[tc.id]) continue;
        THE_CHAT_DB[tc.id] = {
          id: tc.id,
          ten: tc.ten || tc.id,
          mo_ta: tc.mo_ta || "",
          icon: tc.icon || "✨",
          khuon: tc.khuon || "",
          ti_le: tc.ti_le || 10,
          dac_tinh: tc.dac_tinh || {},
        };
      }
    }

    // 4. Đồng bộ DIBAO.ev & cập nhật evMap / evRelicMap
    if (
      content.encounters &&
      typeof content.encounters.values === "function" &&
      typeof DIBAO === "object" &&
      Array.isArray(DIBAO.ev)
    ) {
      // Dọn dẹp các phần tử rác / không có relic nếu từng bị thêm nhầm
      DIBAO.ev = DIBAO.ev.filter(
        (e) => e && typeof e.relic === "string" && e.relic.trim() !== "",
      );

      const knownDibaoIds = new Set(DIBAO.ev.map((e) => e.id));
      for (const enc of content.encounters.values()) {
        if (!enc || !enc.id) continue;
        if (knownDibaoIds.has(enc.id)) {
          const ex = DIBAO.evMap && DIBAO.evMap.get(enc.id);
          if (ex) {
            if (enc.ten) ex.ten = enc.ten;
            if (enc.limits && typeof enc.limits.hoi_chieu_nam === "number") {
              ex.hc = enc.limits.hoi_chieu_nam;
            }
          }
          continue;
        }
        // Chỉ nhận sự kiện có gắn dị bảo cố định thuộc phẩm 8 Nghịch Thiên (Bảo Lục)
        const relicId = enc.relic || enc.vat_pham || "";
        if (!relicId) continue;
        const isRank8 =
          (DIBAO.rel && DIBAO.rel[relicId]) ||
          (content.items &&
            content.items.get &&
            content.items.get(relicId) &&
            content.items.get(relicId).pham_cap === 8);
        if (!isRank8) continue;

        if (enc.id.startsWith("ev.di_bao_") || enc.di_bao) {
          const newEv = {
            id: enc.id,
            ten: enc.ten || enc.id,
            relic: relicId,
            gate: enc.gate || (enc.tags && enc.tags.canh_gioi) || [4, 5],
            hc: (enc.limits && enc.limits.hoi_chieu_nam) || enc.hc || 120,
            dia: enc.dia || null,
            marker: enc.marker || "",
            p: enc.ti_le || enc.p || 0.05,
            bv: enc.bv || null,
            bvcg: enc.bvcg || null,
            chk: enc.kiem_tra || null,
            noi: enc.loai_noi || "Di tích",
          };
          DIBAO.ev.push(newEv);
          knownDibaoIds.add(enc.id);
          if (DIBAO.evMap) DIBAO.evMap.set(newEv.id, newEv);
          if (newEv.relic && DIBAO.evRelicMap) {
            DIBAO.evRelicMap.set(newEv.relic, newEv);
          }
        }
      }

      // Chuẩn hóa loại bỏ các mục rỗng trong evMap và evRelicMap
      if (DIBAO.evMap) {
        for (const [k, v] of DIBAO.evMap.entries()) {
          if (!v || !v.relic || !String(v.relic).trim()) DIBAO.evMap.delete(k);
        }
      }
      if (DIBAO.evRelicMap) {
        for (const [k, v] of DIBAO.evRelicMap.entries()) {
          if (!k || !String(k).trim()) DIBAO.evRelicMap.delete(k);
        }
      }
    }
    _dynamicDataSynced = true;
  } catch (e) {
    console.warn("[VKX] Sync dynamic data err:", e);
  }
}

// ───────────────────────── 2.5. Quản lý Context (Đã sửa lỗi Memoization & Chống Nhân Bản Thừa) ─────────────────────────
let _cachedCtxBase = null;
let _cachedCtxSig = "";
let _cachedCtxTime = 0;

function _makeCtxSig(st) {
  if (!st || !st.run) return "";
  const r = st.run;
  const nv = r.nhanVat || {};
  const a = r.active;
  const tr = r.tran;
  return `${r.nam}_${r.thang}_${r.viTri}_${r.tuVi}_${r.canhGioi}_${r.tieuCanhGioi}_${r.oNoi || ""}_${r.rng || ""}_${a ? a.id + ":" + (a.done ? 1 : 0) + ":" + (a.waiting ? 1 : 0) : 0}_${tr ? (tr.hiep || 0) + ":" + (tr.ketThuc ? 1 : 0) : 0}_${nv.linhThach || 0}_${nv.thuongThe || 0}`;
}

function _wrapCtxSnapshot(base, K) {
  const F = K && K.Rng;
  const runCopy = {
    ...base.run,
    nhanVat: base.run.nhanVat
      ? {
          ...base.run.nhanVat,
          tuiDo: base.run.nhanVat.tuiDo ? { ...base.run.nhanVat.tuiDo } : {},
        }
      : base.run.nhanVat,
    rngKeys: base.run.rngKeys ? { ...base.run.rngKeys } : {},
  };
  const o = new Map();
  return {
    ...base,
    run: runCopy,
    enc: runCopy.active,
    noticeLines: [],
    rng: F ? new F(runCopy.rng) : base.rng,
    rngFor(r) {
      let u = o.get(r);
      if (!u && F) {
        const l = Object.hasOwn(runCopy.rngKeys, r)
          ? runCopy.rngKeys[r]
          : undefined;
        u =
          l === undefined
            ? F.fromSeed(`${runCopy.seed}|rng|${r}`)
            : new F(l);
        o.set(r, u);
      }
      return u;
    },
  };
}

function ctx(opts) {
  const g = G();
  const K = S.core;
  const st = g && g.state;
  if (!st || !st.run) return null;

  // Khi có opts đặc biệt, gọi trực tiếp readCtx của game
  if (opts) {
    if (g.readCtx) return g.readCtx(opts);
  } else {
    const now = Date.now();
    const sig = _makeCtxSig(st);
    if (_cachedCtxBase && _cachedCtxSig === sig && now - _cachedCtxTime < 300) {
      return _wrapCtxSnapshot(_cachedCtxBase, K);
    }
    if (g.readCtx) {
      const rc = g.readCtx();
      if (rc) {
        _cachedCtxBase = rc;
        _cachedCtxSig = sig;
        _cachedCtxTime = now;
        return _wrapCtxSnapshot(rc, K);
      }
    }
    const run = clone(st.run),
      meta = clone(st.meta),
      F = K.Rng,
      o = new Map();
    run.rngKeys ??= {};
    const out = {
      ...g.env,
      run,
      meta,
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
    _cachedCtxBase = out;
    _cachedCtxSig = sig;
    _cachedCtxTime = now;
    return _wrapCtxSnapshot(out, K);
  }
  return null;
}

// Bản nhẹ O(1) của ctx() cho các tác vụ CHỈ ĐỌC (đo đường, nguy hiểm, tên nơi, quét bản đồ)
let _cachedLite = null;
let _cachedLiteSig = "";
function ctxLite() {
  const g = G();
  const K = S.core;
  const st = g && g.state;
  if (!st || !st.run) return null;
  const sig = _makeCtxSig(st);
  if (_cachedLite && _cachedLiteSig === sig) {
    return _cachedLite;
  }
  const run = { ...st.run };
  const F = K && K.Rng;
  const o = new Map();
  run.rngKeys = run.rngKeys || {};
  _cachedLiteSig = sig;
  _cachedLite = {
    ...g.env,
    run,
    meta: st.meta,
    rng: F ? new F(run.rng) : null,
    enc: run.active,
    noticeLines: [],
    rngFor(r) {
      let u = o.get(r);
      if (!u && F) {
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
  return _cachedLite;
}

const nvNow = () => clone(G().state.run.nhanVat);
const realmName = (i) => {
  try {
    return S.core.canhGioi(i).ten;
  } catch {
    return REALM_TEN[i] || "Cảnh Giới " + i;
  }
};
const realmLabel = (cg, tc) => {
  try {
    return S.core.tenCanhGioi(cg, tc);
  } catch {
    return realmName(cg);
  }
};
const has = (...ks) => ks.every((k) => S.core && typeof S.core[k] === "function");
const needMsg = (what) =>
  `<div class="vk-mu">Phần "${what}" chưa dùng được với bản game này. Bấm "Tự kiểm tra" ở tab Tổng quan rồi chụp màn hình gửi Claude.</div>`;

// ───────────────────────── 3. Bản đồ, Nguy hiểm & Mô phỏng trận (Có Cache O(1)) ─────────────────────────
function withPlace(c, slot) {
  return {
    ...c,
    run: { ...c.run, viTri: slot, active: undefined },
    enc: undefined,
  };
}

let _dangerCacheWorld = null;
let _dangerCacheSig = "";
const _dangerCache = new Map();

const danger = (c, slot) => {
  try {
    const r = c && c.run;
    const nv = r && r.nhanVat;
    const W = c && c.world;
    const sig = `${r ? r.nam : 0}_${nv ? nv.canhGioi : 0}_${nv ? nv.tieuCanhGioi : 0}`;
    if (W !== _dangerCacheWorld || sig !== _dangerCacheSig) {
      _dangerCacheWorld = W;
      _dangerCacheSig = sig;
      _dangerCache.clear();
    }
    const key = String(slot);
    if (_dangerCache.has(key)) return _dangerCache.get(key);
    const res = S.core.mucHiem(S.core.doChenh(c, c.run, slot));
    _dangerCache.set(key, res);
    return res;
  } catch {
    return null;
  }
};

const dangerTag = (d) =>
  !d
    ? ""
    : `<span class="${d.id === "hiem" || d.id === "tu_dia" ? "vk-bad" : d.id === "ngang_suc" ? "" : "vk-ok"}">${esc(d.ten)}</span>`;

let _nearSlotsWorld = null;
let _nearSlotsSig = "";
const _nearSlotsCache = new Map();

function nearSlots(c, maxY) {
  const W = c.world,
    r = c.run,
    cur = r.viTri,
    nv = r.nhanVat || {};
  const pt = (nv.trangBi && nv.trangBi.phuong_tien) || "";
  const sig = `${cur}_${nv.canhGioi || 0}_${pt}`;
  if (W !== _nearSlotsWorld || sig !== _nearSlotsSig) {
    _nearSlotsWorld = W;
    _nearSlotsSig = sig;
    _nearSlotsCache.clear();
  }
  const cacheKey = String(maxY);
  if (_nearSlotsCache.has(cacheKey)) {
    return _nearSlotsCache.get(cacheKey);
  }
  let land;
  try {
    land = W.tho(cur);
  } catch {}
  const out = [];
  for (const s of W.slots) {
    if (s.an) continue;
    try {
      if (land !== undefined && W.tho(s.id) !== land) continue;
    } catch {
      continue;
    }
    let y;
    try {
      y = S.core.travelYears(c, s.id);
    } catch {
      continue;
    }
    if (!(y <= maxY)) continue;
    try {
      if (S.core.slotDaMo && !S.core.slotDaMo(c, s.id)) continue;
    } catch {}
    out.push({ slot: s.id, y });
  }
  out.sort((a, b) => a.y - b.y);
  _nearSlotsCache.set(cacheKey, out);
  return out;
}

const BENCH_IDS = [
  "enemy.de_tu_truc_co",
  "enemy.doc_hanh_kiem_khach",
  "enemy.ma_tu_hut_mau",
  "enemy.cuong_thi",
  "enemy.am_tuong",
  "enemy.lao_hoe_tinh",
  "enemy.hoa_tinh",
  "enemy.thuy_linh",
  "enemy.mao_cuong",
];
const _benchEnemiesCache = new Map();
function benchEnemies(cg, tcP = 0) {
  const cacheKey = `${cg}:${tcP}`;
  if (_benchEnemiesCache.has(cacheKey)) {
    return _benchEnemiesCache.get(cacheKey);
  }
  const K = S.core,
    c = C();
  const tcs = [Math.max(0, tcP - 1), tcP, Math.min(3, tcP + 1)];
  let ids = BENCH_IDS.filter((id) => c.enemies.has(id));
  if (ids.length < 6) {
    const all = [...c.enemies.keys()].sort();
    const step = Math.max(1, Math.floor(all.length / 9));
    ids = all.filter((_, i) => i % step === 0).slice(0, 9);
  }
  const res = ids.map((id, i) => ({
    id,
    E: K.taoBenDich(
      {
        ...c.enemies.get(id),
        canh_gioi: cg,
        tieu_canh_gioi: tcs[i % 3],
      },
      c,
      { muc: "thuong" },
    ),
  }));
  if (_benchEnemiesCache.size > 32) _benchEnemiesCache.clear();
  _benchEnemiesCache.set(cacheKey, res);
  return res;
}

function fight(P, E) {
  try {
    return S.core.tinhTocChien(clone(P), clone(E), {});
  } catch {
    return { thang: false, nHiep: 30, khiHuyetThapNhat: 0, stTa: 0 };
  }
}

function enemyAt(def, cg, tc, muc) {
  return S.core.taoBenDich(
    { ...def, canh_gioi: cg, tieu_canh_gioi: tc },
    C(),
    muc ? { muc } : {},
  );
}

// Mô phỏng nhanh 1 quái ở cảnh giới của nó, trả về chuỗi kết quả
function simFoe(P, def, tcs) {
  tcs =
    tcs ||
    (String(def.id || "").startsWith("npc.") &&
    def.tieu_canh_gioi !== undefined
      ? [def.tieu_canh_gioi]
      : [0, 2]);
  const res = tcs.map((tc) => {
    try {
      const E = S.core.taoBenDich(
        { ...def, tieu_canh_gioi: tc },
        C(),
        def.muc ? { muc: def.muc } : {},
      );
      return fight(P, E).thang;
    } catch {
      return null;
    }
  });
  if (res.every((r) => r === true))
    return { ok: 2, txt: '<span class="vk-ok">Thắng chắc</span>' };
  if (res.some((r) => r === true))
    return { ok: 1, txt: "<span>Có thể thắng</span>" };
  if (res.every((r) => r === null))
    return { ok: -1, txt: '<span class="vk-mu">?</span>' };
  return { ok: 0, txt: '<span class="vk-bad">Thua</span>' };
}

function foesOf(c, vars) {
  const out = [];
  for (const v of Object.values(vars || {})) {
    if (typeof v !== "string") continue;
    let def;
    try {
      def = S.core.timDich(c, v);
    } catch {}
    if (!def && C().enemies.has(v)) def = C().enemies.get(v);
    if (def && def.ten) out.push(def);
  }
  return out;
}

async function scanRetreat(c, maxY, prog) {
  const K = S.core,
    out = [];
  const list = nearSlots(c, maxY);
  for (let i = 0; i < list.length; i++) {
    if (S.abort) break;
    if (i % 15 === 0) {
      prog && prog(i / list.length, "Đang so chỗ bế quan…");
      await sleep0();
    }
    const { slot, y } = list[i];
    let info;
    try {
      info = K.chuanBiBeQuan(withPlace(c, slot));
    } catch {
      continue;
    }
    if (!info || info.chan || !(info.tuViNam > 0)) continue;
    out.push({ slot, y, info, d: danger(c, slot) });
  }
  const dr = (d) =>
    ({ an_toan: 0, ngang_suc: 1, hiem: 2, tu_dia: 3 })[d && d.id] ?? 1;
  return out.sort(
    (a, b) =>
      b.info.tuViNam - a.info.tuViNam || dr(a.d) - dr(b.d) || a.y - b.y,
  );
}

export {
  AU_T4,
  AU_ZAN,
  S,
  body,
  tabsEl,
  groupsEl,
  CORE_REQUIRED,
  CORE_OPTIONAL,
  BM_CONST,
  BM_RUNE_KEYS,
  buildCore,
  loadCore,
  G,
  C,
  HUD,
  gamePanel,
  clone,
  _dynamicDataSynced,
  syncDynamicGameData,
  _cachedCtxBase,
  _cachedCtxSig,
  _cachedCtxTime,
  _makeCtxSig,
  _wrapCtxSnapshot,
  ctx,
  _cachedLite,
  _cachedLiteSig,
  ctxLite,
  nvNow,
  realmName,
  realmLabel,
  has,
  needMsg,
  withPlace,
  _dangerCacheWorld,
  _dangerCacheSig,
  _dangerCache,
  danger,
  dangerTag,
  _nearSlotsWorld,
  _nearSlotsSig,
  _nearSlotsCache,
  nearSlots,
  BENCH_IDS,
  _benchEnemiesCache,
  benchEnemies,
  fight,
  enemyAt,
  simFoe,
  foesOf,
  scanRetreat,
};

Object.assign(gWin, {
  AU_T4,
  AU_ZAN,
  S,
  body,
  tabsEl,
  groupsEl,
  CORE_REQUIRED,
  CORE_OPTIONAL,
  BM_CONST,
  BM_RUNE_KEYS,
  buildCore,
  loadCore,
  G,
  C,
  HUD,
  gamePanel,
  clone,
  _dynamicDataSynced,
  syncDynamicGameData,
  _cachedCtxBase,
  _cachedCtxSig,
  _cachedCtxTime,
  _makeCtxSig,
  _wrapCtxSnapshot,
  ctx,
  _cachedLite,
  _cachedLiteSig,
  ctxLite,
  nvNow,
  realmName,
  realmLabel,
  has,
  needMsg,
  withPlace,
  _dangerCacheWorld,
  _dangerCacheSig,
  _dangerCache,
  danger,
  dangerTag,
  _nearSlotsWorld,
  _nearSlotsSig,
  _nearSlotsCache,
  nearSlots,
  BENCH_IDS,
  _benchEnemiesCache,
  benchEnemies,
  fight,
  enemyAt,
  simFoe,
  foesOf,
  scanRetreat,
});
