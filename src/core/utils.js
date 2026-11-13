/**
 * Module: Tiện Ích Nền Tảng (Utils, Formatting, Vietnamese Fold, Storage & Lifecycle)
 */

export const gWin = typeof window !== "undefined" ? window : globalThis;
export const TOOL_VER = "8.1.0";
export let TT = gWin.tuTien || null;
export let MOD = null;

export function setGameContext(tt, mod) {
  TT = tt || gWin.tuTien || null;
  MOD = mod || null;
  gWin.TT = TT;
  gWin.MOD = MOD;
}

gWin.gWin = gWin;
gWin.TOOL_VER = TOOL_VER;
gWin.TT = TT;
gWin.MOD = MOD;

// Quản lý vòng đời Tab (dọn dẹp polling timer/listeners khi chuyển tab)
export const TabLifecycle = {
  _cleaners: [],
  onUnmount(fn) {
    if (typeof fn === "function") this._cleaners.push(fn);
  },
  cleanup() {
    while (this._cleaners.length) {
      try {
        this._cleaners.pop()();
      } catch (e) {
        console.warn("[VKX] Tab cleanup err:", e);
      }
    }
  },
};

// Quản lý Storage tập trung
export const StorageManager = {
  get(k, def) {
    try {
      const v = localStorage.getItem(k);
      return v !== null ? v : def;
    } catch (e) {
      return def;
    }
  },
  getJson(k, def) {
    try {
      const v = localStorage.getItem(k);
      return v ? JSON.parse(v) : def;
    } catch (e) {
      return def;
    }
  },
  set(k, v) {
    try {
      localStorage.setItem(k, v);
      return true;
    } catch (e) {
      return false;
    }
  },
  setJson(k, v) {
    try {
      localStorage.setItem(k, JSON.stringify(v));
      return true;
    } catch (e) {
      return false;
    }
  },
  remove(k) {
    try {
      localStorage.removeItem(k);
    } catch (e) {}
  },
};

export const sleep0 = () => new Promise((r) => setTimeout(r, 0));

// Background Non-blocking Scheduler: MessageChannel chống throttle khi ẩn tab
export const yieldToMain = (function () {
  if (typeof MessageChannel !== "undefined") {
    const ch = new MessageChannel();
    let curResolve = null;
    ch.port1.onmessage = () => {
      const fn = curResolve;
      curResolve = null;
      if (fn) fn();
    };
    return () =>
      new Promise((resolve) => {
        curResolve = resolve;
        ch.port2.postMessage(null);
      });
  }
  return () => new Promise((resolve) => setTimeout(resolve, 0));
})();

// Bộ sinh số giả ngẫu nhiên PRNG mulberry32 tốc độ cao
export function createMulberry32(seed0) {
  let a = seed0 >>> 0 || 12345;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Helper Debounce cho các ô tìm kiếm & sự kiện
export function debounce(fn, ms = 150) {
  let t;
  return function (...args) {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), ms);
  };
}

export const pct = (x, d = 0) => (x * 100).toFixed(d).replace(".", ",") + "%";
export const num = (x, d = 1) =>
  (Math.round(x * 10 ** d) / 10 ** d).toString().replace(".", ",");
export const esc = (s) =>
  String(s ?? "").replace(
    /[&<>"]/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c],
  );
export const yrs = (y) => (y < 0.05 ? "ngay đây" : num(y) + " năm");
export const safeYrs = (y) => (y < 0.05 ? "ngay đây" : num(y) + " năm");

export const cleanTxt = (x) =>
  String(x ?? "")
    .replace(/[\ue000-\uf8ff]/g, "")
    .replace(/\{[^}]*\}/g, "…")
    .replace(/\s+/g, " ")
    .trim();

export const tcWord = (s) =>
  String(s || "").replace(
    /(^|[\s(\-\/])(\p{L})/gu,
    (m, a, b) => a + b.toUpperCase(),
  );

// Chuẩn hóa chuỗi tiếng Việt không dấu (kèm bộ nhớ đệm & đường tắt ASCII O(1))
export const foldCache = new Map();
export const fold = (x) => {
  if (!x) return "";
  const s = String(x);
  if (!/[^\x00-\x7F]/.test(s)) return s.toLowerCase();
  const cached = foldCache.get(s);
  if (cached !== undefined) return cached;
  const res = s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();
  if (foldCache.size < 4000) {
    foldCache.set(s, res);
  }
  return res;
};

export const HE = {
  kim: "Kim",
  moc: "Mộc",
  thuy: "Thủy",
  hoa: "Hỏa",
  tho: "Thổ",
  bang: "Băng",
  loi: "Lôi",
  phong: "Phong",
  am: "Ám",
  vo_sac: "Vô sắc",
};
export const heTen = (h) => HE[h] ?? h;
export const STAGE = ["Sơ", "Trung", "Hậu", "ĐVM"];
export const REALM_TEN = [
  "Phàm Nhân",
  "Luyện Khí",
  "Trúc Cơ",
  "Kết Đan",
  "Nguyên Anh",
  "Hóa Thần",
];

// Số dự phòng tỉ lệ rơi đồ hiếm; khi đã nạp lõi game thì lấy số thật từ code game (K.rare)
export const TC_RARE = {
  dH: [1, 0.7, 0.4, 0.1, 0.07, 0.05, 0.03, 0.015],
  rank: { lau_la: 0.5, thuong: 1, tinh_anh: 1.5, boss: 2 },
  nhanHo: 0.4,
};

Object.assign(gWin, {
  TabLifecycle,
  StorageManager,
  sleep0,
  yieldToMain,
  createMulberry32,
  debounce,
  pct,
  num,
  esc,
  yrs,
  safeYrs,
  cleanTxt,
  tcWord,
  foldCache,
  fold,
  HE,
  heTen,
  STAGE,
  REALM_TEN,
  TC_RARE,
});
