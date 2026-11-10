/**
 * Module: Trung Tâm Dị Bảo, Radar Bản Đồ, Pity 500 Năm & Cảnh Báo Nổi
 */
// ── Tab Dị Bảo (ý tưởng từ Di Bảo Companion: đọc trạng thái dị bảo thật trong save; dữ liệu 21 dị bảo kèm trong script)
const DIBAO = {
  ev: [
    {
      id: "ev.di_bao_u_hon_dien",
      ten: "Cửa U Hồn Điện",
      relic: "item.yeu_hoang_huyet_kinh",
      gate: [5, 5],
      hc: 120,
      dia: "U Hồn Điện",
      marker: "azgaar:marker:103",
      p: 0.07,
      bv: "Hạt Hoàng Thủ Lăng",
      bvcg: 5,
      chk: null,
      noi: "Di tích",
    },
    {
      id: "ev.di_bao_kiem_trach",
      ten: "Kiếm lành giữa đầm",
      relic: "item.bat_chiet_kiem",
      gate: [5, 5],
      hc: 120,
      dia: "Kiếm Trạch",
      marker: "hoang:394",
      p: 0.07,
      bv: "Vạn Kiếm Oán Hồn",
      bvcg: 5,
      chk: "than_thuc +65",
      noi: "Sơn thủy",
    },
    {
      id: "ev.di_bao_tien_van_dien",
      ten: "Đá ba mặt",
      relic: "item.tam_sinh_thach",
      gate: [4, 5],
      hc: 120,
      dia: "Tiên Vân Điện",
      marker: "azgaar:marker:102",
      p: 0.03,
      bv: null,
      bvcg: null,
      chk: "dao_tam +75",
      noi: "Di tích",
    },
    {
      id: "ev.di_bao_yeu_phong_mo",
      ten: "Lửa đen Yêu Phong Mộ",
      relic: "item.cuu_u_hoang_hoa",
      gate: [5, 5],
      hc: 120,
      dia: "Yêu Phong Mộ",
      marker: "azgaar:marker:34",
      p: 0.07,
      bv: "Hổ Hoàng Tàn Hồn",
      bvcg: 5,
      chk: null,
      noi: "Di tích",
    },
    {
      id: "ev.di_bao_han_giao_linh",
      ten: "Vảy rồng Giao tộc",
      relic: "item.thai_co_long_lan",
      gate: [5, 5],
      hc: 120,
      dia: null,
      marker: null,
      p: 0.07,
      bv: "Giao Hoàng",
      bvcg: 5,
      chk: null,
      noi: "Hoang dã",
    },
    {
      id: "ev.di_bao_kiem_dai",
      ten: "Chiến kỳ trên Kiếm Đài",
      relic: "item.doan_thien_chien_ky",
      gate: [5, 5],
      hc: 120,
      dia: "Kiếm Đài",
      marker: "azgaar:marker:35",
      p: 0.07,
      bv: "Đoạn Thiên Chiến Hồn",
      bvcg: 5,
      chk: null,
      noi: "Di tích",
    },
    {
      id: "ev.bien_trieu_khu",
      ten: "Đêm Triều Khư",
      relic: "item.phong_thien_an",
      gate: null,
      hc: 120,
      dia: null,
      marker: null,
      p: 0.07,
      bv: "Ngũ Tổ Tàn Trận",
      bvcg: 5,
      chk: null,
      noi: null,
    },
    {
      id: "ev.bien_thuyen_rong",
      ten: "Thuyền đầu rồng",
      relic: "item.thai_hu_chu",
      gate: null,
      hc: 120,
      dia: null,
      marker: null,
      p: 0.03,
      bv: null,
      bvcg: null,
      chk: "than_thuc +100",
      noi: null,
    },
    {
      id: "ev.di_bao_hon_thap",
      ten: "Kinh không tiếng",
      relic: "item.luan_hoi_chan_kinh",
      gate: [4, 5],
      hc: 120,
      dia: "Hồn Tháp",
      marker: "azgaar:marker:39",
      p: 0.03,
      bv: null,
      bvcg: null,
      chk: "ngo_tinh +70",
      noi: "Di tích",
    },
    {
      id: "ev.di_bao_u_dien",
      ten: "Đèn trong U Điện",
      relic: "item.van_kiep_hon_dang",
      gate: [4, 5],
      hc: 120,
      dia: "U Điện",
      marker: "azgaar:marker:40",
      p: 0.07,
      bv: "U Minh Quỷ Mẫu",
      bvcg: 4,
      chk: null,
      noi: "Di tích",
    },
    {
      id: "ev.di_bao_lan_dai",
      ten: "Nhẫn trên ngón xương",
      relic: "item.can_khon_gioi",
      gate: [4, 5],
      hc: 120,
      dia: "Lan Đài",
      marker: "azgaar:marker:141",
      p: 0.07,
      bv: "Cổ Chiến Khôi Lỗi",
      bvcg: 5,
      chk: null,
      noi: "Di tích",
    },
    {
      id: "ev.di_bao_tan_phong",
      ten: "Kiếm gãy trên Tàn Phong",
      relic: "item.toai_thien_kiem",
      gate: [4, 5],
      hc: 120,
      dia: "Tàn Phong",
      marker: "hoang:291",
      p: 0.07,
      bv: "Thái Cổ Lôi Linh",
      bvcg: 5,
      chk: null,
      noi: "Sơn thủy",
    },
    {
      id: "ev.di_bao_van_dan_trung",
      ten: "Mộ không đọng tuyết",
      relic: "item.nghich_menh_dan",
      gate: [4, 5],
      hc: 120,
      dia: "Vạn Đan Trủng",
      marker: "azgaar:marker:101",
      p: 0.07,
      bv: "Hạn Bạt",
      bvcg: 4,
      chk: null,
      noi: "Di tích",
    },
    {
      id: "ev.di_bao_tuyen_phong",
      ten: "Bình trên Tuyền Phong",
      relic: "item.cam_lo_tinh_binh",
      gate: [4, 5],
      hc: 120,
      dia: "Tuyền Phong",
      marker: "hoang:286",
      p: 0.03,
      bv: null,
      bvcg: null,
      chk: "dao_tam +68",
      noi: "Sơn thủy",
    },
    {
      id: "ev.di_bao_dan_coc",
      ten: "Mộ y gia Đan Cốc",
      relic: "item.than_nong_bach_thao_kinh",
      gate: [4, 5],
      hc: 120,
      dia: "Đan Cốc",
      marker: "hoang:204",
      p: 0.03,
      bv: null,
      bvcg: null,
      chk: "ngo_tinh +45",
      noi: "Sơn thủy",
    },
    {
      id: "ev.di_bao_xich_trung",
      ten: "Lò lửa Xích Trủng",
      relic: "item.hon_nguyen_dan_dinh",
      gate: [4, 5],
      hc: 120,
      dia: "Xích Trủng",
      marker: "azgaar:marker:94",
      p: 0.07,
      bv: "Âm Hỏa Hồn Vương",
      bvcg: 5,
      chk: null,
      noi: "Di tích",
    },
    {
      id: "ev.di_bao_van_son",
      ten: "Gấu ngủ Vân Sơn",
      relic: "item.tu_linh_chau",
      gate: [4, 5],
      hc: 120,
      dia: "Vân Sơn",
      marker: "hoang:262",
      p: 0.07,
      bv: "Thái Nhạc Hùng",
      bvcg: 5,
      chk: null,
      noi: "Sơn thủy",
    },
    {
      id: "ev.di_bao_kim_dao_dien",
      ten: "Nghìn chậu đồng",
      relic: "item.tu_bao_bon",
      gate: [4, 5],
      hc: 120,
      dia: "Kim Đao Điện",
      marker: "azgaar:marker:36",
      p: 0.03,
      bv: null,
      bvcg: null,
      chk: "than_thuc +100",
      noi: "Di tích",
    },
    {
      id: "ev.di_bao_bang_hon_trung",
      ten: "Chuông trong mộ băng",
      relic: "item.do_hon_linh",
      gate: [4, 5],
      hc: 120,
      dia: "Băng Hồn Trủng",
      marker: "azgaar:marker:90",
      p: 0.07,
      bv: "Vạn Oán Quỷ",
      bvcg: 5,
      chk: null,
      noi: "Di tích",
    },
  ],
  rel: {
    "item.luan_hoi_chan_kinh": {
      ten: "Luân Hồi Chân Kinh",
      loai: "cong_phap",
      gia: 5000,
      bd: "Có",
    },
    "item.nghich_menh_dan": {
      ten: "Nghịch Mệnh Đan",
      loai: "dan_duoc",
      gia: 6000,
      bd: "Không",
    },
    "item.yeu_hoang_huyet_kinh": {
      ten: "Yêu Hoàng Huyết Kinh",
      loai: "cong_phap",
      gia: 9000,
      bd: "Có",
    },
    "item.phong_thien_an": {
      ten: "Phong Thiên Ấn",
      loai: "cong_phap",
      gia: 8000,
      bd: "Có",
    },
    "item.bat_chiet_kiem": {
      ten: "Bất Chiết Kiếm",
      loai: "phap_khi",
      gia: 9000,
      bd: "Có",
    },
    "item.tam_sinh_thach": {
      ten: "Tam Sinh Thạch",
      loai: "phap_khi",
      gia: 10000,
      bd: "Có",
    },
    "item.thai_hu_chu": {
      ten: "Thái Hư Chu",
      loai: "phuong_tien",
      gia: 12000,
      bd: "Có",
    },
    "item.cuu_u_hoang_hoa": {
      ten: "Cửu U Hoàng Hỏa",
      loai: "di_hoa",
      gia: 15000,
      bd: "Có",
    },
    "item.thai_co_long_lan": {
      ten: "Thái Cổ Long Lân",
      loai: "phap_khi",
      gia: 12000,
      bd: "Có",
    },
    "item.doan_thien_chien_ky": {
      ten: "Đoạn Thiên Chiến Kỳ",
      loai: "phap_khi",
      gia: 8000,
      bd: "Không",
    },
    "item.nghich_lan_thuan": {
      ten: "Nghịch Lân Thuẫn",
      loai: "phap_khi",
      gia: 8000,
      bd: "Không",
    },
    "item.thien_dien_dan": {
      ten: "Thiên Diễn Đan",
      loai: "dan_duoc",
      gia: 9000,
      bd: "Không",
    },
    "item.cam_lo_tinh_binh": {
      ten: "Cam Lộ Tịnh Bình",
      loai: "phap_khi",
      gia: 7000,
      bd: "Có",
    },
    "item.than_nong_bach_thao_kinh": {
      ten: "Thần Nông Bách Thảo Kinh",
      loai: "cong_phap",
      gia: 7000,
      bd: "Không",
    },
    "item.hon_nguyen_dan_dinh": {
      ten: "Hỗn Nguyên Đan Đỉnh",
      loai: "dung_cu",
      gia: 12000,
      bd: "Không",
    },
    "item.tu_linh_chau": {
      ten: "Tụ Linh Châu",
      loai: "phap_khi",
      gia: 9000,
      bd: "Không",
    },
    "item.tu_bao_bon": {
      ten: "Tụ Bảo Bồn",
      loai: "tru_vat",
      gia: 8000,
      bd: "Không",
    },
    "item.do_hon_linh": {
      ten: "Độ Hồn Linh",
      loai: "phap_khi",
      gia: 9000,
      bd: "Có",
    },
    "item.van_kiep_hon_dang": {
      ten: "Vạn Kiếp Hồn Đăng",
      loai: "phap_khi",
      gia: 5000,
      bd: "Có",
    },
    "item.toai_thien_kiem": {
      ten: "Toái Thiên Kiếm",
      loai: "phap_khi",
      gia: 5000,
      bd: "Không",
    },
    "item.can_khon_gioi": {
      ten: "Càn Khôn Giới",
      loai: "tru_vat",
      gia: 8000,
      bd: "Có",
    },
  },
  boss: ["item.nghich_lan_thuan", "item.thien_dien_dan"],
};
DIBAO.evMap = new Map();
DIBAO.evRelicMap = new Map();
for (let i = 0; i < DIBAO.ev.length; i++) {
  const item = DIBAO.ev[i];
  DIBAO.evMap.set(item.id, item);
  if (item.relic) DIBAO.evRelicMap.set(item.relic, item);
}
const LOAI_VI = {
  cong_phap: "Công pháp",
  phap_khi: "Pháp khí",
  dan_duoc: "Đan dược",
  dung_cu: "Dụng cụ",
  phuong_tien: "Phương tiện",
  tru_vat: "Vật trữ đồ",
  di_hoa: "Dị hỏa",
  luyen_che: "Dụng cụ luyện chế",
  tran_ban: "Trận bàn",
  tran_van: "Trận văn",
};
const CHI_SO_VI = {
  than_thuc: "thần thức",
  ngo_tinh: "ngộ tính",
  dao_tam: "đạo tâm",
  can_cot: "căn cốt",
  khi_van: "khí vận",
  than_phap: "thân pháp",
};
// Quét cờ, lịch sử, bảo lục luân hồi trực tiếp từ dữ liệu game (O(1), tách biệt rõ sở hữu trong kiếp hiện tại và Bảo Lục Luân Hồi)
function scanDiBao(roots) {
  const flags = new Set(),
    history = new Map(),
    runRelics = new Set(),
    metaRelicSet = new Set();
  let nodes = null;

  function scanRunObj(o) {
    if (!o || typeof o !== "object") return;
    if (o.flags && typeof o.flags === "object") {
      for (const k of Object.keys(o.flags)) {
        if (k.startsWith("di_bao_xong_")) flags.add(k.slice(12));
      }
    }
    if (o.history && typeof o.history === "object") {
      for (const [k, v] of Object.entries(o.history)) {
        if (v && typeof v.namCuoi === "number") history.set(k, v);
      }
    }
    if (Array.isArray(o.newRelics)) {
      for (const r of o.newRelics) {
        if (typeof r === "string" && r.startsWith("item."))
          runRelics.add(r);
      }
    }
    if (!nodes && o.nodes && typeof o.nodes === "object") {
      nodes = o.nodes;
    }
  }

  function scanMetaObj(m) {
    if (!m || typeof m !== "object") return;
    if (m.tienLo && Array.isArray(m.tienLo.relics)) {
      for (const r of m.tienLo.relics) {
        if (typeof r === "string" && r.startsWith("item."))
          metaRelicSet.add(r);
      }
    }
    if (Array.isArray(m.relics)) {
      for (const r of m.relics) {
        if (typeof r === "string" && r.startsWith("item."))
          metaRelicSet.add(r);
      }
    }
  }

  for (const r of roots || []) {
    if (!r || typeof r !== "object") continue;
    // Phân biệt đối tượng run (có nhanVat hoặc nam/viTri) và đối tượng meta (có tienLo hoặc diemLuanHoi)
    if (r.tienLo || r.diemLuanHoi !== undefined || r.moKhoa) {
      scanMetaObj(r);
    } else {
      scanRunObj(r);
      if (r.nhanVat) scanRunObj(r.nhanVat);
      if (r.meta) scanMetaObj(r.meta);
    }
  }
  return {
    flags,
    history,
    relics: runRelics,
    runRelics,
    metaRelicSet,
    metaRelics: Array.from(metaRelicSet),
    nodes,
  };
}

// Quản lý bộ đệm địa danh theo tham chiếu thế giới (tự động xóa cache khi sang kiếp mới / nạp save khác)
let _lastDiBaoWorldRef = null;
const slotPlaceNameCache = new Map();
const diaDanhSlotCache = new Map();

function ensureDiBaoWorldCache(c) {
  try {
    const W = (c && c.world) || (G() && G().env && G().env.world);
    if (W && W !== _lastDiBaoWorldRef) {
      _lastDiBaoWorldRef = W;
      slotPlaceNameCache.clear();
      diaDanhSlotCache.clear();
    }
    return W;
  } catch (e) {
    return null;
  }
}

// Lấy tên địa danh của một slot (kèm cache O(1) theo thế giới hiện tại)
function placeName(c, slot) {
  if (slot == null) return "";
  const W = ensureDiBaoWorldCache(c);
  const key = String(slot);
  if (slotPlaceNameCache.has(key)) return slotPlaceNameCache.get(key);
  let res = "";
  try {
    if (W) {
      if (typeof W.info === "function") {
        const inf = W.info(slot);
        if (inf) {
          if (inf.ten) res = inf.ten;
          else if (inf.diaDanh && inf.diaDanh.ten)
            res = inf.diaDanh.ten;
        }
      }
      if (!res && typeof W.diaDanh === "function") {
        const s = W.slot
          ? W.slot(slot)
          : W.slots
            ? W.slots.find((x) => x && String(x.id) === key)
            : null;
        if (s && s.dia_danh) {
          const dd = W.diaDanh(s.dia_danh);
          if (dd && dd.ten) res = dd.ten;
        }
      }
    }
  } catch (e) {}
  if (!res) res = "Slot " + slot;
  slotPlaceNameCache.set(key, res);
  return res;
}

// Dò tìm ID slot từ marker hoặc tên địa danh (hỗ trợ cả s.id, s.dia_danh, s.marker và tên chuẩn hóa)
function findSlotByDiaDanh(diaDanhId, diaName, c) {
  const W = ensureDiBaoWorldCache(c);
  const cacheKey = (diaDanhId || "") + "::" + (diaName || "");
  if (diaDanhSlotCache.has(cacheKey))
    return diaDanhSlotCache.get(cacheKey);
  try {
    if (!W || !Array.isArray(W.slots)) return null;
    if (diaDanhId) {
      const targetId = String(diaDanhId);
      const byMarker = W.slots.find(
        (s) =>
          s &&
          (String(s.id) === targetId ||
            String(s.dia_danh) === targetId ||
            (s.marker != null && String(s.marker) === targetId)),
      );
      if (byMarker && byMarker.id != null) {
        const res = String(byMarker.id);
        diaDanhSlotCache.set(cacheKey, res);
        return res;
      }
    }
    if (diaName) {
      const fTarget = fold(diaName).trim();
      // 1. Ưu tiên khớp chính xác qua ddBuild nếu có
      try {
        if (typeof ddBuild === "function") {
          const X = ddBuild(c || ctxLite());
          if (X && Array.isArray(X.list)) {
            const exactDd = X.list.find((x) => fold(x.name).trim() === fTarget);
            if (exactDd && exactDd.id != null) {
              const res = String(exactDd.id);
              diaDanhSlotCache.set(cacheKey, res);
              return res;
            }
          }
        }
      } catch (e) {}

      // 2. Quét trên W.slots (ưu tiên khớp chính xác trước, khớp một phần sau)
      let partialMatch = null;
      for (const s of W.slots) {
        if (!s || s.id == null) continue;
        const names = [];
        if (typeof W.info === "function") {
          try {
            const inf = W.info(s.id);
            if (inf) {
              if (inf.diaDanh && inf.diaDanh.ten) names.push(inf.diaDanh.ten);
              if (inf.ten) names.push(inf.ten);
            }
          } catch (e) {}
        }
        if (s.dia_danh && typeof W.diaDanh === "function") {
          try {
            const dd = W.diaDanh(s.dia_danh);
            if (dd && dd.ten) names.push(dd.ten);
          } catch (e) {}
        }
        if (
          s.dia_danh &&
          W.diaDanhById &&
          typeof W.diaDanhById.get === "function"
        ) {
          try {
            const dd = W.diaDanhById.get(s.dia_danh);
            if (dd && dd.ten) names.push(dd.ten);
          } catch (e) {}
        }
        for (const nm of names) {
          const fNm = fold(nm).trim();
          if (!fNm) continue;
          if (fNm === fTarget) {
            const res = String(s.id);
            diaDanhSlotCache.set(cacheKey, res);
            return res;
          }
          if (!partialMatch && (fNm.includes(fTarget) || fTarget.includes(fNm))) {
            partialMatch = String(s.id);
          }
        }
      }
      if (partialMatch != null) {
        diaDanhSlotCache.set(cacheKey, partialMatch);
        return partialMatch;
      }
    }
  } catch (e) {}
  return null;
}

// Kiểm tra nhân vật có đang thực sự cầm/trang bị vật phẩm Dị Bảo trong kiếp này không
function hasRelicItemInRun(id, run) {
  if (!id) return false;
  if (!run) {
    const g = G();
    run = g && g.state && g.state.run;
  }
  if (!run) return false;
  const nv = run.nhanVat;
  if (!nv) return false;
  if (nv.tuiDo && nv.tuiDo[id] > 0) return true;
  if (
    nv.kinhMach &&
    Array.isArray(nv.kinhMach.manh) &&
    nv.kinhMach.manh.some((m) => m && m.item === id)
  )
    return true;
  if (
    nv.kinhMach &&
    Array.isArray(nv.kinhMach.loadouts) &&
    nv.kinhMach.loadouts.some(
      (bo) =>
        Array.isArray(bo) && bo.some((m) => m && m.item === id),
    )
  )
    return true;
  if (nv.trangBi && Object.values(nv.trangBi).includes(id)) return true;
  if (
    (nv.banMenh && (nv.banMenh.item === id || nv.banMenh.id === id)) ||
    (nv.natal && (nv.natal.item === id || nv.natal.id === id))
  )
    return true;
  if (Array.isArray(run.newRelics) && run.newRelics.includes(id)) return true;
  return false;
}

// Kiểm tra xem nhân vật đã sở hữu hoặc hoàn tất Dị Bảo trong KIẾP NÀY (run) chưa
function checkOwnedRelic(id, run) {
  if (!id) return false;
  if (!run) {
    const g = G();
    run = g && g.state && g.state.run;
  }
  if (!run) return false;
  if (hasRelicItemInRun(id, run)) return true;
  const relicBare = id.replace(/^item\./, "");
  if (run.flags && run.flags["di_bao_xong_" + relicBare]) return true;
  const sc = scanDiBao([run]);
  if (sc.runRelics && sc.runRelics.has(id)) return true;
  if (sc.flags && sc.flags.has(relicBare)) return true;
  return false;
}

// Quét Dị Bảo thực tế đang nở trên thế giới (run.nodes, director.placeActivities, di tích run.noiChon, theGioi.dangDien)
function scanMapActiveDiBao(run, c) {
  const map = new Map();
  if (!run) return map;
  const nam = typeof run.nam === "number" ? run.nam : null;
  const W = ensureDiBaoWorldCache(c);

  const isEventCompletedOrCooldown = (ev) => {
    if (!ev) return true;
    if (checkOwnedRelic(ev.relic, run)) return true;
    const relicBare = ev.relic.replace(/^item\./, "");
    if (
      run.flags &&
      (run.flags["di_bao_xong_" + relicBare] ||
        run.flags["di_bao_xong_" + ev.id])
    )
      return true;
    if (run.history && run.history[ev.id] && nam != null) {
      const h = run.history[ev.id];
      const hc = ev.hc || 120;
      if (typeof h.namCuoi === "number" && nam - h.namCuoi < hc) return true;
    }
    return false;
  };

  // 1. Quét từ run.nodes (tất cả các node sự kiện thực tế đang nở trên bản đồ)
  if (run.nodes) {
    for (const [slotStr, n] of Object.entries(run.nodes)) {
      if (!n || !n.encounter) continue;
      if (
        n.hetHanNam !== undefined &&
        nam != null &&
        n.hetHanNam <= nam
      )
        continue;
      const ev = DIBAO.evMap.get(n.encounter);
      if (!ev || isEventCompletedOrCooldown(ev)) continue;

      let slot = n.slot != null ? n.slot : slotStr;
      if (W && typeof W.slot === "function") {
        try {
          const ws = W.slot(slot);
          if (ws && ws.id != null) slot = ws.id;
        } catch (e) {}
      }
      map.set(ev.id, {
        encId: ev.id,
        slot,
        hetHanNam: n.hetHanNam,
        vars: n.vars,
        source: "node",
        ev,
      });
    }
  }

  // 2. Quét qua director.placeActivities và run.noiChon
  const director =
    typeof TT !== "undefined" && TT && TT.core && TT.core["encounter/director"];
  const hasPlaceActivities =
    director && typeof director.placeActivities === "function";

  if (run.noiChon) {
    for (const [slotKey, nc] of Object.entries(run.noiChon)) {
      if (!nc) continue;

      // Nếu có director.placeActivities: dùng chính hàm của game để kiểm tra hoạt động thực sự đang mở (không bị lockedReason) tại slotKey
      if (hasPlaceActivities) {
        try {
          const acts = director.placeActivities(c || ctxLite(), String(slotKey));
          if (Array.isArray(acts)) {
            for (const a of acts) {
              if (!a || !a.id || map.has(a.id) || a.lockedReason) continue;
              const ev = DIBAO.evMap.get(a.id);
              if (!ev || isEventCompletedOrCooldown(ev)) continue;

              let remYears = undefined;
              const isTemp =
                (Array.isArray(nc.suKien) && nc.suKien.includes(a.id)) ||
                (Array.isArray(nc.contextual) && nc.contextual.includes(a.id));
              if (
                isTemp &&
                nc.namLamMoi !== undefined &&
                nam != null &&
                nam >= nc.namLamMoi &&
                nam - nc.namLamMoi < 5
              ) {
                remYears = Math.max(0, 5 - (nam - nc.namLamMoi));
              }

              map.set(ev.id, {
                encId: ev.id,
                slot: slotKey,
                actId: a.id,
                hetHanNam:
                  remYears != null && nam != null
                    ? nam + remYears
                    : undefined,
                vars: nc.vars,
                source: "placeActivity",
                ev,
              });
            }
            continue;
          }
        } catch (e) {}
      }

      // Fallback khi không gọi được director.placeActivities: chỉ quét suKien và contextual (không quét standing tĩnh)
      const dynamicPlaceEncs = [
        ...(Array.isArray(nc.suKien) ? nc.suKien : []),
        ...(Array.isArray(nc.contextual) ? nc.contextual : []),
      ];
      if (!dynamicPlaceEncs.length) continue;

      for (const encId of dynamicPlaceEncs) {
        if (!encId || map.has(encId)) continue;
        const ev = DIBAO.evMap.get(encId);
        if (!ev || isEventCompletedOrCooldown(ev)) continue;
        if (
          ev.gate &&
          run.nhanVat &&
          (run.nhanVat.canhGioi ?? 0) < ev.gate[0]
        )
          continue;

        let remYears = undefined;
        if (nc.namLamMoi !== undefined && nam != null) {
          const elapsed = nam - nc.namLamMoi;
          if (elapsed >= 0 && elapsed < 5) {
            remYears = Math.max(0, 5 - elapsed);
          }
        }

        map.set(ev.id, {
          encId: ev.id,
          slot: slotKey,
          hetHanNam:
            remYears != null && nam != null
              ? nam + remYears
              : undefined,
          vars: nc.vars,
          source: "noiChon",
          ev,
        });
      }
    }
  }

  // 3. Quét từ theGioi.dangDien (thế cục thế giới đang diễn ra)
  if (run.theGioi && Array.isArray(run.theGioi.dangDien)) {
    for (const dd of run.theGioi.dangDien) {
      if (
        !dd ||
        (dd.denNam !== undefined && nam != null && dd.denNam <= nam)
      )
        continue;
      const slot = dd.slot;
      try {
        const cnt = C();
        const theCucContent =
          cnt && cnt.theCuc && cnt.theCuc.get
            ? cnt.theCuc.get(dd.id)
            : null;
        if (theCucContent && Array.isArray(theCucContent.encounter)) {
          for (const encId of theCucContent.encounter) {
            if (!encId || map.has(encId)) continue;
            const ev = DIBAO.evMap.get(encId);
            if (ev && !isEventCompletedOrCooldown(ev)) {
              const resolvedSlot =
                slot != null
                  ? slot
                  : findSlotByDiaDanh(ev.marker, ev.dia, c);
              if (resolvedSlot != null) {
                map.set(ev.id, {
                  encId: ev.id,
                  slot: resolvedSlot,
                  hetHanNam: dd.denNam,
                  source: "theCuc",
                  ev,
                });
              }
            }
          }
        }
      } catch (e) {}
    }
  }

  // 4. Quét trực tiếp director.placeActivities tại vị trí hiện tại của người chơi (nếu chưa có trong run.noiChon)
  if (hasPlaceActivities) {
    try {
      const curSlots = new Set(
        [run.oNoi, run.viTri]
          .filter((x) => x != null && x !== "")
          .map(String),
      );
      for (const curSlot of curSlots) {
        const acts = director.placeActivities(c || ctxLite(), curSlot);
        if (!Array.isArray(acts)) continue;
        for (const a of acts) {
          if (!a || !a.id || map.has(a.id) || a.lockedReason) continue;
          const ev = DIBAO.evMap.get(a.id);
          if (ev && !isEventCompletedOrCooldown(ev)) {
            map.set(ev.id, {
              encId: ev.id,
              slot: curSlot,
              actId: a.id,
              hetHanNam: undefined,
              source: "placeActivity",
              ev,
            });
          }
        }
      }
    } catch (e) {}
  }

  return map;
}

// Dò xem người chơi có đang đứng đón đầu tại đúng địa danh (hoặc slot tương đương) không
function checkIsHere(c, run, eDia, diaSlot) {
  if (!run) return false;
  const curSlot = run.viTri != null ? String(run.viTri) : "";
  const curONoi = run.oNoi != null ? String(run.oNoi) : "";
  if (diaSlot != null) {
    const sDia = String(diaSlot);
    if (curSlot === sDia || curONoi === sDia) return true;
  }
  if (!eDia) return false;
  const targetFold = fold(eDia).trim();
  if (!targetFold) return false;

  // 1. Kiểm tra qua chỉ mục ddBuild
  try {
    const X = ddBuild(c || ctxLite());
    if (X && X.byId) {
      if (curSlot && X.byId.has(curSlot)) {
        const item = X.byId.get(curSlot);
        if (item && item.name) {
          const fNm = fold(item.name).trim();
          if (
            fNm === targetFold ||
            fNm.includes(targetFold) ||
            targetFold.includes(fNm)
          )
            return true;
        }
      }
      if (curONoi && X.byId.has(curONoi)) {
        const item = X.byId.get(curONoi);
        if (item && item.name) {
          const fNm = fold(item.name).trim();
          if (
            fNm === targetFold ||
            fNm.includes(targetFold) ||
            targetFold.includes(fNm)
          )
            return true;
        }
      }
    }
  } catch (e) {}

  // 2. Kiểm tra qua World.info & World.diaDanh
  try {
    const W = ensureDiBaoWorldCache(c);
    if (W) {
      const slotsToCheck = [curSlot, curONoi].filter(Boolean);
      for (const sId of slotsToCheck) {
        if (typeof W.info === "function") {
          const inf = W.info(sId);
          if (inf) {
            if (inf.ten) {
              const fTen = fold(inf.ten).trim();
              if (
                fTen === targetFold ||
                fTen.includes(targetFold) ||
                targetFold.includes(fTen)
              )
                return true;
            }
            if (inf.diaDanh && inf.diaDanh.ten) {
              const fDd = fold(inf.diaDanh.ten).trim();
              if (
                fDd === targetFold ||
                fDd.includes(targetFold) ||
                targetFold.includes(fDd)
              )
                return true;
            }
          }
        }
        const s = W.slot
          ? W.slot(sId)
          : W.slots
            ? W.slots.find((x) => x && String(x.id) === String(sId))
            : null;
        if (s && s.dia_danh && typeof W.diaDanh === "function") {
          const dd = W.diaDanh(s.dia_danh);
          if (dd && dd.ten) {
            const fDd = fold(dd.ten).trim();
            if (
              fDd === targetFold ||
              fDd.includes(targetFold) ||
              targetFold.includes(fDd)
            )
              return true;
          }
        }
      }
    }
  } catch (e) {}

  // 3. Kiểm tra qua placeName
  try {
    if (curSlot) {
      const pn = fold(placeName(c, curSlot)).trim();
      if (
        pn &&
        (pn === targetFold ||
          pn.includes(targetFold) ||
          targetFold.includes(pn))
      )
        return true;
    }
  } catch (e) {}

  return false;
}

// Dò tọa độ slot của một địa danh trên thế giới (hỗ trợ truyền thêm marker)
function findDiaSlot(c, diaName, marker) {
  if (!diaName && !marker) return null;

  // 0. Nếu người chơi đang đứng ngay tại địa danh này thì ưu tiên lấy luôn slot hiện tại
  if (diaName) {
    try {
      const g = G(),
        run = (c && c.run) || (g && g.state && g.state.run);
      if (run && checkIsHere(c, run, diaName, null)) {
        return String(
          run.viTri != null
            ? run.viTri
            : run.oNoi != null
              ? run.oNoi
              : "",
        );
      }
    } catch (e) {}
  }

  // Nếu không truyền marker, thử tra marker từ DIBAO.ev theo tên địa danh
  let resolvedMarker = marker;
  if (!resolvedMarker && diaName && Array.isArray(DIBAO.ev)) {
    const fDia = fold(diaName).trim();
    const matchedEv = DIBAO.ev.find(
      (e) => e && e.dia && fold(e.dia).trim() === fDia && e.marker,
    );
    if (matchedEv) resolvedMarker = matchedEv.marker;
  }

  return findSlotByDiaDanh(resolvedMarker, diaName, c);
}

// Hàm chuẩn hóa việc tiến vào sự kiện Dị Bảo tại một slot (dùng chung cho nút UI và Auto Săn Dị Bảo)
function enterDiBaoEvent(slot, encId, source) {
  const g = G();
  if (!g || !g.state || !g.state.run) {
    return { ok: false, err: "Chưa có kiếp nào đang chơi." };
  }
  if (typeof ddCleanIdleEnc === "function") {
    ddCleanIdleEnc(g);
  }
  const slotStr = String(slot);
  let curRun = g.state.run;

  // 1. Nếu là node trên bản đồ (hoặc tại slot có run.nodes[slotStr]): gọi enterNode trước tiên
  const hasMapNode =
    source === "node" ||
    Boolean(curRun.nodes && (curRun.nodes[slotStr] || curRun.nodes[slot]));

  if (hasMapNode && typeof g.enterNode === "function") {
    let rNode = auCall(() => g.enterNode(slotStr));
    if (!rNode.ok && slot !== slotStr) {
      rNode = auCall(() => g.enterNode(slot));
    }
    curRun = G().state && G().state.run;
    if (curRun && (curRun.active || curRun.tran)) {
      return { ok: true };
    }
  }

  // 2. Nếu chưa ở trong nơi chốn (oNoi !== slotStr), thử tiến vào nơi chốn (bỏ qua lỗi nếu là ô hoang dã)
  curRun = G().state && G().state.run;
  if (curRun && String(curRun.oNoi) !== slotStr) {
    if (typeof g.enterNode === "function") {
      auCall(() => g.enterNode(slotStr));
    } else if (typeof g.enterPlace === "function") {
      auCall(() => g.enterPlace(slotStr));
    }
    curRun = G().state && G().state.run;
    if (curRun && (curRun.active || curRun.tran)) {
      return { ok: true };
    }
  }

  // 3. Tìm activity ID chuẩn xác từ director.placeActivities
  let actId = encId;
  try {
    const director =
      typeof TT !== "undefined" &&
      TT &&
      TT.core &&
      TT.core["encounter/director"];
    if (director && typeof director.placeActivities === "function") {
      const acts = director.placeActivities(ctxLite(), slotStr);
      if (Array.isArray(acts) && acts.length > 0) {
        const match = acts.find(
          (a) =>
            a &&
            !a.lockedReason &&
            (a.id === encId ||
              a.loai === "overlay" ||
              (a.id && a.id.startsWith("ev.di_bao")) ||
              (encId && a.id && a.id.includes(encId))),
        );
        if (match && match.id) actId = match.id;
      }
    }
  } catch (e) {}

  // 4. Kích hoạt qua chooseActivity -> fallback doAction -> fallback enterNode
  let rAct = { ok: false, err: "" };
  if (actId && typeof g.chooseActivity === "function") {
    rAct = auCall(() => g.chooseActivity(actId));
    curRun = G().state && G().state.run;
    if (curRun && (curRun.active || curRun.tran)) {
      return { ok: true };
    }
    if (actId !== encId && encId) {
      rAct = auCall(() => g.chooseActivity(encId));
      curRun = G().state && G().state.run;
      if (curRun && (curRun.active || curRun.tran)) {
        return { ok: true };
      }
    }
  }

  if (encId && typeof g.doAction === "function") {
    const rDo = auCall(() => g.doAction(encId));
    curRun = G().state && G().state.run;
    if (curRun && (curRun.active || curRun.tran)) {
      return { ok: true };
    }
    if (!rAct.err && rDo.err) rAct = rDo;
  }

  if (!hasMapNode && typeof g.enterNode === "function") {
    const rEn = auCall(() => g.enterNode(slotStr));
    curRun = G().state && G().state.run;
    if (curRun && (curRun.active || curRun.tran)) {
      return { ok: true };
    }
    if (!rAct.err && rEn.err) rAct = rEn;
  }

  return {
    ok: false,
    err: rAct.err || "Sự kiện chưa sẵn sàng hoặc đang bị khóa điều kiện.",
  };
}

// ── Hệ Thống Săn Dị Bảo & Bảo Lục Thông Minh (v7.3.0) ──
const DIBAO_EXTRA = {
  "item.luan_hoi_chan_kinh": {
    mota: "Kinh điển luân hồi tối thượng, bảo toàn kinh mạch & tăng mạnh ngộ tính qua mọi kiếp luân hồi.",
    he: "vo_sac",
    tier: "SSS",
  },
  "item.thai_hu_chu": {
    mota: "Phi chu thái hư viễn cổ, tốc độ di chuyển siêu việt, vượt biển khơi không tốn năm tuổi thọ.",
    he: "vo_sac",
    tier: "SSS",
  },
  "item.cuu_u_hoang_hoa": {
    mota: "Dị hỏa chí tôn cửu u, thiêu đốt nguyên thần địch, tăng cực lớn sát thương Hỏa và hỗ trợ Luyện Đan.",
    he: "hoa",
    tier: "SSS",
  },
  "item.tam_sinh_thach": {
    mota: "Thần thạch tam sinh nhìn thấu luân hồi, tăng mạnh Đạo Tâm, giảm nguy cơ tâm ma khi đột phá.",
    he: "vo_sac",
    tier: "SSS",
  },
  "item.bat_chiet_kiem": {
    mota: "Kiếm ý bất khuất ngàn năm không gãy, tăng mạnh bạo kích và kiếm khí công kích hệ Kim.",
    he: "kim",
    tier: "SSS",
  },
  "item.yeu_hoang_huyet_kinh": {
    mota: "Bí điển huyết mạch Yêu Hoàng, thể phách vô song, tăng cực lớn Khí Huyết và Hộ Thể tối đa.",
    he: "tho",
    tier: "SSS",
  },
  "item.phong_thien_an": {
    mota: "Bảo ấn phong tỏa càn khôn thiên địa, áp chế uy lực chiêu thức địch và tăng sát thương trấn áp.",
    he: "vo_sac",
    tier: "SSS",
  },
  "item.thai_co_long_lan": {
    mota: "Vảy Chân Long thái cổ hộ thể, giảm mạnh sát thương gánh chịu và phản chấn công kích địch.",
    he: "thuy",
    tier: "SSS",
  },
  "item.cam_lo_tinh_binh": {
    mota: "Bình ngọc chứa tiên lộ trị liệu bách thương, tự động hồi phục lượng lớn Khí Huyết mỗi hiệp đấu.",
    he: "thuy",
    tier: "SSS",
  },
  "item.do_hon_linh": {
    mota: "Chuông dẫn hồn hộ mệnh: TỰ ĐỘNG THEO HỒN QUA KIẾP MÀ KHÔNG CHIẾM Ô BẾN ĐÒ, bảo hộ chân linh.",
    he: "vo_sac",
    tier: "SSS",
    guide: true,
  },
  "item.van_kiep_hon_dang": {
    mota: "Đèn hồn soi sáng vạn kiếp u minh, khắc chế quỷ dị và miễn nhiễm suy yếu, kháng độc toàn diện.",
    he: "hoa",
    tier: "SSS",
  },
  "item.can_khon_gioi": {
    mota: "Nhẫn trữ vật nạp cả càn khôn thiên địa, mở rộng cực đại số ô túi đồ và kho đồ qua mọi kiếp.",
    he: "vo_sac",
    tier: "SSS",
  },
  "item.nghich_menh_dan": {
    mota: "Đan dược nghịch thiên cải mệnh, hồi sinh tức thì khi thọ nguyên cạn hoặc độ kiếp thất bại.",
    he: "vo_sac",
    tier: "SS",
  },
  "item.nghich_lan_thuan": {
    mota: "Khiên hộ thân đúc từ nghịch lân rồng (Rơi từ Boss Hóa Thần), ngăn chặn tuyệt đối đòn chí mạng.",
    he: "kim",
    tier: "SS",
  },
  "item.thien_dien_dan": {
    mota: "Đan dược diễn hóa thiên cơ huyền diệu (Rơi từ Boss Hóa Thần), bứt phá bình cảnh cảnh giới lập tức.",
    he: "vo_sac",
    tier: "SS",
  },
  "item.doan_thien_chien_ky": {
    mota: "Chiến kỳ cổ đại đoạn tuyệt thương thiên, tăng mạnh công phòng và kích phát chiến ý tốc chiến.",
    he: "kim",
    tier: "SS",
  },
  "item.toai_thien_kiem": {
    mota: "Cổ kiếm phong lôi toái thiên, công kích mang sấm sét xé toạc hộ thể của đối thủ.",
    he: "moc",
    tier: "SS",
  },
  "item.hon_nguyen_dan_dinh": {
    mota: "Lò luyện đan hỗn nguyên viễn cổ, đảm bảo 100% không bao giờ nổ lò và tăng phẩm chất đan dược.",
    he: "hoa",
    tier: "S",
  },
  "item.than_nong_bach_thao_kinh": {
    mota: "Kinh văn nông dược của Thần Nông, tăng tỷ lệ thu hoạch linh thảo quý và chế đan hoàn mỹ.",
    he: "moc",
    tier: "S",
  },
  "item.tu_linh_chau": {
    mota: "Hạt châu hội tụ tinh hoa linh khí của trời đất, tăng tốc độ hấp thu tu vi mỗi năm.",
    he: "thuy",
    tier: "S",
  },
  "item.tu_bao_bon": {
    mota: "Bồn tụ bảo thu hút tài lộc bốn phương, tự động sinh lời linh thạch và giảm giá khi mua sắm.",
    he: "kim",
    tier: "S",
  },
};

// Phát chuông báo âm thanh nhẹ bằng Web Audio API
function playDiBaoAlertSound() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const actx = new AudioCtx();
    if (actx.state === "suspended") actx.resume();
    const now = actx.currentTime;

    const osc1 = actx.createOscillator();
    const gain1 = actx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(587.33, now);
    osc1.frequency.exponentialRampToValueAtTime(880, now + 0.15);
    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(0.3, now + 0.05);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
    osc1.connect(gain1);
    gain1.connect(actx.destination);
    osc1.start(now);
    osc1.stop(now + 0.8);

    const osc2 = actx.createOscillator();
    const gain2 = actx.createGain();
    osc2.type = "triangle";
    osc2.frequency.setValueAtTime(880, now + 0.18);
    osc2.frequency.exponentialRampToValueAtTime(1174.66, now + 0.4);
    gain2.gain.setValueAtTime(0, now + 0.18);
    gain2.gain.linearRampToValueAtTime(0.25, now + 0.22);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
    osc2.connect(gain2);
    gain2.connect(actx.destination);
    osc2.start(now + 0.18);
    osc2.stop(now + 1.2);
  } catch (e) {}
}

const safeYrs = (y) =>
  typeof yrs === "function"
    ? yrs(y)
    : y < 0.05
      ? "ngay đây"
      : num(y) + " năm";

// Kiểm tra chỉ số kiểm định cho sự kiện Dị Bảo
function checkStat(chkStr, nvIn) {
  if (!chkStr) return { ok: true, text: "Không yêu cầu" };
  const m = chkStr.match(/^([a-z_]+)\s*\+(\d+)/);
  if (!m) return { ok: true, text: chkStr };
  const key = m[1],
    req = parseInt(m[2], 10);
  let cur = 0;
  const g = G(),
    run = g && g.state && g.state.run;
  const nv = nvIn || (run && run.nhanVat);
  const Cc = C(),
    K = S.core;
  try {
    if (K && K.effectiveStat && nv) cur = K.effectiveStat(nv, key, Cc);
    else if (nv && nv.chiSo && typeof nv.chiSo[key] === "number")
      cur = nv.chiSo[key];
    else if (nv && typeof nv[key] === "number") cur = nv[key];
  } catch (e) {}
  const name = CHI_SO_VI[key] || key;
  return {
    ok: cur >= req,
    cur,
    req,
    key,
    name,
    text: `${name}: ${cur}/${req}`,
  };
}

// Kiểm tra khả năng dịch chuyển tức thời tới slot (bắt buộc kiểm tra !o.blocked để không báo ảo khi chưa có trận hoặc ngoài tầm)
function checkCanTeleport(slot) {
  if (slot == null || slot === "") return null;
  try {
    const g = G();
    if (!g || !g.state || !g.state.run) return null;
    if (String(g.state.run.viTri) === String(slot)) return null;
    if (
      typeof ddTeleSources !== "function" ||
      typeof ddTeleOpts !== "function"
    )
      return null;
    const srcs = ddTeleSources(g);
    for (const src of srcs) {
      const opts = ddTeleOpts(g, src);
      const o =
        opts.get(slot) ||
        opts.get(String(slot)) ||
        (Number.isFinite(+slot) ? opts.get(+slot) : null);
      if (o && !o.blocked) {
        return { ...src, targetSlot: o.slot, cost: o.cost };
      }
    }
  } catch (e) {}
  return null;
}

// Dịch chuyển tức thời thông minh tới slot
function smartTeleportTo(slot) {
  if (slot == null || slot === "")
    return { ok: false, msg: "Tọa độ không hợp lệ." };
  const src = checkCanTeleport(slot);
  if (!src)
    return {
      ok: false,
      msg:
        "Hiện tại không có Trận Truyền Tống hoặc Phù Truyền Tống nào có thể đi thẳng tới slot " +
        slot +
        ".",
    };
  return ddDoTeleport(slot, src);
}

// Đánh giá tương thích Linh Căn kiếp này với Dị Bảo
function relicSynergy(relId, lc) {
  const extra = DIBAO_EXTRA[relId];
  if (!extra) return { txt: "Bình thường", cls: "vk-mu" };
  const rHe = extra.he;
  if (rHe === "vo_sac")
    return { txt: "✨ Vô Sắc (Hợp Mọi Linh Căn)", cls: "vk-ok" };
  let myHes = [];
  if (lc) {
    if (Array.isArray(lc)) myHes = lc.slice();
    else if (Array.isArray(lc.he)) myHes = lc.he.slice();
    else if (typeof lc === "string") myHes = [lc];
  }
  const goc = (h) =>
    typeof GOC_HE !== "undefined" && GOC_HE[h] ? GOC_HE[h] : h;
  const baseHes = myHes.map(goc);
  if (baseHes.includes(rHe)) {
    return {
      txt: `🔥 Khớp Bản Mệnh (Hệ ${heTen(rHe)}) · Tối Đa Uy Lực`,
      cls: "vk-ok",
    };
  }
  for (const h of baseHes) {
    if (
      typeof SINH_HE !== "undefined" &&
      (SINH_HE[h] === rHe || SINH_HE[rHe] === h)
    ) {
      return {
        txt: `⚡ Tương Sinh Bổ Trợ (Hệ ${heTen(rHe)})`,
        cls: "vk-ok",
      };
    }
  }
  for (const h of baseHes) {
    if (
      typeof KHAC_HE !== "undefined" &&
      (KHAC_HE[h] === rHe || KHAC_HE[rHe] === h)
    ) {
      return {
        txt: `⚠️ Tương Khắc (${heTen(rHe)}) · Cân Nhắc`,
        cls: "vk-bad",
      };
    }
  }
  return { txt: `Hệ ${heTen(rHe)}`, cls: "vk-mu" };
}

// Giả lập chiến đấu ảo với Hộ Vệ Dị Bảo
function simDiBaoGuard(nv, e) {
  try {
    const Cc = C(),
      K = S.core;
    if (
      !K ||
      !K.taoBenTa ||
      !K.taoBenDich ||
      typeof fight !== "function"
    )
      return null;
    const P = K.taoBenTa(nv, Cc);
    let foeDef = null;
    if (e.bv && Cc.enemies) {
      const fName = fold(e.bv).trim();
      foeDef = [...Cc.enemies.values()].find((x) => {
        const tn = fold(x.ten || "").trim();
        return tn === fName || tn.includes(fName) || fName.includes(tn);
      });
    }
    const cg = e.bvcg != null ? e.bvcg : 5;
    if (!foeDef && Cc.enemies) {
      foeDef =
        [...Cc.enemies.values()].find(
          (x) => (x.canh_gioi ?? 0) === cg && x.muc === "tinh_anh",
        ) ||
        [...Cc.enemies.values()].find((x) => (x.canh_gioi ?? 0) === cg);
    }
    if (!foeDef) return null;

    let wins = 0;
    let minHpPct = 100;
    const stages = [0, 1, 2, 3];
    for (const tc of stages) {
      try {
        const E = K.taoBenDich(
          { ...foeDef, canh_gioi: cg, tieu_canh_gioi: tc },
          Cc,
          { muc: "tinh_anh" },
        );
        const res = fight(P, E);
        if (res.thang) {
          wins++;
          const hpPct = Math.round(
            (res.khiHuyetThapNhat / Math.max(1, P.khiHuyetToiDa)) * 100,
          );
          if (hpPct < minHpPct) minHpPct = hpPct;
        }
      } catch (err) {}
    }
    const winrate = wins / stages.length;
    const winRate = Math.round(winrate * 100);
    return {
      winrate,
      winRate,
      wins,
      total: stages.length,
      minHpPct: wins > 0 ? minHpPct : 0,
      foeTen: foeDef.ten || e.bv,
      cg,
    };
  } catch (err) {
    return null;
  }
}

// Gợi ý vật phẩm / đan dược bù điểm chỉ số kiểm định
function findStatBoosters(statKey, gap) {
  try {
    const g = G(),
      run = g.state && g.state.run,
      nv = run && run.nhanVat,
      Cc = C();
    if (!nv) return { bagItems: [], recommendedPills: [] };
    const bag = nv.tuiDo || {};
    const bagItems = [];

    for (const [id, count] of Object.entries(bag)) {
      if (!(count > 0)) continue;
      const it = Cc.items ? Cc.items.get(id) : null;
      if (!it) continue;
      let val = 0;
      if (
        it.bi_dong &&
        it.bi_dong.chi_so &&
        typeof it.bi_dong.chi_so[statKey] === "number"
      ) {
        val = it.bi_dong.chi_so[statKey];
      } else if (it.dung && typeof it.dung === "object") {
        const s = JSON.stringify(it.dung);
        const m = s.match(new RegExp(`"${statKey}":\\s*(\\d+)`));
        if (m) val = parseInt(m[1], 10);
      }
      if (val > 0) {
        bagItems.push({
          id,
          ten: it.ten || id,
          count,
          val,
          loai: it.loai,
        });
      }
    }
    bagItems.sort((a, b) => b.val - a.val);

    const recommendedPills = [];
    if (Cc.items) {
      for (const it of Cc.items.values()) {
        if (it.loai !== "dan_duoc") continue;
        let val = 0;
        if (it.dung && typeof it.dung === "object") {
          const s = JSON.stringify(it.dung);
          const m = s.match(new RegExp(`"${statKey}":\\s*(\\d+)`));
          if (m) val = parseInt(m[1], 10);
        } else if (
          it.bi_dong &&
          it.bi_dong.chi_so &&
          typeof it.bi_dong.chi_so[statKey] === "number"
        ) {
          val = it.bi_dong.chi_so[statKey];
        }
        if (val > 0) {
          recommendedPills.push({
            id: it.id,
            ten: it.ten || it.id,
            val,
            gia: it.gia || 0,
            cg: it.canh_gioi ?? 0,
          });
        }
      }
      recommendedPills.sort((a, b) => b.val - a.val);
    }
    return { bagItems, recommendedPills: recommendedPills.slice(0, 3) };
  } catch (e) {
    return { bagItems: [], recommendedPills: [] };
  }
}

// Tính toán chỉ số bảo hiểm Thiên Đạo Bù Dị Bảo (Pity)
function calcDiBaoPity(run, nv, sc, targetRelics) {
  const nam = typeof run.nam === "number" ? run.nam : 0;
  const myCg = nv.canhGioi ?? 0;
  const isOwned = (id) => checkOwnedRelic(id, run);

  if (
    targetRelics === undefined &&
    typeof AU !== "undefined" &&
    AU.cfg &&
    AU.cfg.sdb &&
    Array.isArray(AU.cfg.sdb.targetRelics)
  ) {
    targetRelics = AU.cfg.sdb.targetRelics;
  }
  const relSet =
    Array.isArray(targetRelics) && targetRelics.length > 0
      ? new Set(targetRelics)
      : null;

  const eligibleEvents = DIBAO.ev.filter((e) => {
    if (relSet && !relSet.has(e.relic)) return false;
    if (isOwned(e.relic)) return false;
    const gateCg = e.gate ? e.gate[0] : 4;
    return myCg >= gateCg;
  });

  if (eligibleEvents.length === 0) {
    return {
      waitYears: 0,
      pityPct: 0,
      mult: "1.0",
      guaranteed: false,
      topCamping: [],
      allTargetOwned: relSet
        ? [...relSet].every((r) => isOwned(r))
        : false,
    };
  }

  let maxWait = 0;
  const eventWaits = [];

  for (const e of eligibleEvents) {
    const h = sc.history.get(e.id);
    let wait = 0;
    if (h && typeof h.namCuoi === "number") {
      const cdEnd = h.namCuoi + (e.hc || 120);
      if (nam >= cdEnd) wait = nam - cdEnd;
    } else {
      wait = Math.max(0, nam - (run.namBatDau || 0));
    }
    wait = Math.max(0, Math.floor(wait));
    eventWaits.push({ e, wait });
    if (wait > maxWait) maxWait = wait;
  }

  const pityPct = Math.min(100, Math.round((maxWait / 500) * 100));
  const mult = (1 + maxWait / 25).toFixed(1);
  const guaranteed = maxWait >= 500;

  // Tính toán trọng số xuất hiện & xác suất tương đối cho từng sự kiện
  const guaranteedEvents = eventWaits.filter((x) => x.wait >= 500);
  if (guaranteedEvents.length > 0) {
    const sumG = guaranteedEvents.reduce(
      (s, x) => s + (x.e.p || 0.05) * (1 + x.wait / 25),
      0,
    );
    eventWaits.forEach((x) => {
      const m = 1 + x.wait / 25;
      x.mult = m;
      x.weight = (x.e.p || 0.05) * m;
      if (x.wait >= 500) {
        x.w = sumG > 0 ? x.weight / sumG : 1 / guaranteedEvents.length;
      } else {
        x.w = 0;
      }
    });
  } else {
    const totalWeight = eventWaits.reduce(
      (sum, x) => sum + (x.e.p || 0.05) * (1 + x.wait / 25),
      0,
    );
    eventWaits.forEach((x) => {
      const m = 1 + x.wait / 25;
      x.mult = m;
      x.weight = (x.e.p || 0.05) * m;
      x.w =
        totalWeight > 0
          ? x.weight / totalWeight
          : 1 / Math.max(1, eventWaits.length);
    });
  }

  const topCamping = eventWaits
    .filter((x) => x.e.dia)
    .sort((a, b) => {
      const relA = DIBAO.rel[a.e.relic] || {};
      const relB = DIBAO.rel[b.e.relic] || {};
      const bdA = relA.bd === "Có" ? 1 : 0;
      const bdB = relB.bd === "Có" ? 1 : 0;
      return bdB - bdA || (b.w || 0) - (a.w || 0) || b.wait - a.wait;
    })
    .slice(0, 4);

  return {
    waitYears: Math.floor(maxWait),
    pityPct,
    mult,
    guaranteed,
    topCamping,
  };
}

// ── Global Live Alert & Live Mini Tracker: Thông báo nổi trên màn hình khi Dị Bảo nở trên map ──
var lastDismissedDiBao = null;
var lastDismissedMini = null;

function removeDiBaoAlert() {
  const alertEl = document.getElementById("vkx-dibao-alert");
  if (alertEl && alertEl.parentNode)
    alertEl.parentNode.removeChild(alertEl);
}

function removeDiBaoMini() {
  const miniEl = document.getElementById("vkx-dibao-mini");
  if (miniEl && miniEl.parentNode)
    miniEl.parentNode.removeChild(miniEl);
}

function makeMiniDraggable(el) {
  if (!el || el._dragInit) return;
  el._dragInit = true;
  let dragSt = null,
    moved = false;
  el.addEventListener("pointerdown", function (e) {
    if (e.target.closest("button") || e.target.closest("a")) return;
    const r = el.getBoundingClientRect();
    dragSt = { sx: e.clientX, sy: e.clientY, ox: r.left, oy: r.top };
    moved = false;
    try {
      el.setPointerCapture(e.pointerId);
    } catch (err) {}
  });
  el.addEventListener("pointermove", function (e) {
    if (!dragSt) return;
    const dx = e.clientX - dragSt.sx,
      dy = e.clientY - dragSt.sy;
    if (!moved && Math.abs(dx) + Math.abs(dy) < 5) return;
    moved = true;
    el._isDragging = true;
    el.style.transform = "none";
    el.style.left =
      Math.max(
        8,
        Math.min(
          window.innerWidth - el.offsetWidth - 8,
          dragSt.ox + dx,
        ),
      ) + "px";
    el.style.top =
      Math.max(
        8,
        Math.min(
          window.innerHeight - el.offsetHeight - 8,
          dragSt.oy + dy,
        ),
      ) + "px";
  });
  const endDrag = function () {
    if (dragSt && moved) {
      const r = el.getBoundingClientRect();
      try {
        localStorage.setItem(
          "vkx_dibao_mini_pos",
          JSON.stringify({
            left: Math.round(r.left),
            top: Math.round(r.top),
          }),
        );
      } catch (err) {}
    }
    dragSt = null;
    setTimeout(() => {
      el._isDragging = false;
    }, 50);
  };
  el.addEventListener("pointerup", endDrag);
  el.addEventListener("pointercancel", endDrag);
}

function showDiBaoMini(t, isHere) {
  if (!t) return;
  let miniEl = document.getElementById("vkx-dibao-mini");
  const isFirstCreate = !miniEl;
  if (isFirstCreate) {
    miniEl = document.createElement("div");
    miniEl.id = "vkx-dibao-mini";
    document.body.appendChild(miniEl);
    makeMiniDraggable(miniEl);

    let savedPos = null;
    try {
      const p = localStorage.getItem("vkx_dibao_mini_pos");
      if (p) savedPos = JSON.parse(p);
    } catch (e) {}
    if (
      savedPos &&
      typeof savedPos.left === "number" &&
      typeof savedPos.top === "number"
    ) {
      const maxL = Math.max(8, window.innerWidth - 180);
      const maxT = Math.max(8, window.innerHeight - 40);
      miniEl.style.transform = "none";
      miniEl.style.left =
        Math.min(Math.max(8, savedPos.left), maxL) + "px";
      miniEl.style.top =
        Math.min(Math.max(8, savedPos.top), maxT) + "px";
    } else {
      miniEl.style.top = "12px";
      miniEl.style.left = "50%";
      miniEl.style.transform = "translateX(-50%)";
    }
  }

  if (miniEl._isDragging) return;

  const safeY = isFinite(t.y)
    ? t.y < 0.05
      ? "ngay đây"
      : num(t.y) + "n"
    : "?";
  const relTitle = t.relName || t.title;
  const curSig = `${t.encId}|${t.slot}|${isHere}|${t.remYears}|${safeY}|${relTitle}|${t.isCarry}`;
  if (miniEl._lastSig === curSig) return;
  miniEl._lastSig = curSig;

  miniEl.innerHTML = `
    <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#ff3366;box-shadow:0 0 8px #ff3366;animation:doPulse 1.8s infinite;flex-shrink:0"></span>
    <span style="font-weight:700;color:#fff;display:inline-flex;align-items:center;gap:5px">
      <span>👑 ${esc(relTitle)}</span>
      ${t.isCarry ? `<span class="vkx-mini-badge hon">⭐ Hồn</span>` : ""}
    </span>
    <span style="color:#475569">|</span>
    <span style="color:#cbd5e1;display:inline-flex;align-items:center;gap:4px">
      <span>📍 <b>${esc(t.pName)}</b></span>
      <span style="color:#94a3b8;font-size:11px">(${t.slot})</span>
    </span>
    <span style="color:#475569">|</span>
    ${
      isHere
        ? `<span class="vkx-mini-badge here">Đang ở đây ✓</span>`
        : `<span style="color:#94a3b8;font-size:11.5px">Cách: <b>${safeY}</b></span>`
    }
    <span style="color:#f59e0b;font-weight:600;font-size:11.5px">⏳ ${t.remYears != null ? t.remYears + "n" : "∞"}</span>
    <div style="display:inline-flex;align-items:center;gap:3px;margin-left:3px;flex-shrink:0">
      <button class="vkx-mini-btn do-mini-view" title="Xem chi tiết tại Tab Dị Bảo">🔍 Xem</button>
      <button class="vkx-mini-close do-mini-close" title="Tắt thanh theo dõi">✕</button>
    </div>
  `;

  const viewBtn = miniEl.querySelector(".do-mini-view");
  if (viewBtn) {
    viewBtn.onclick = (e) => {
      e.stopPropagation();
      try {
        if (typeof UI !== "undefined" && UI) {
          if (typeof UI.open === "function") UI.open();
          if (typeof UI.setSection === "function") UI.setSection("tl");
        }
        S.tab = "db";
        if (typeof render === "function") render();
      } catch (err) {}
    };
  }

  const closeBtn = miniEl.querySelector(".do-mini-close");
  if (closeBtn) {
    closeBtn.onclick = (e) => {
      e.stopPropagation();
      lastDismissedMini = t.encId + "_" + t.slot;
      removeDiBaoMini();
    };
  }
}

function showDiBaoAlert(t) {
  let alertEl = document.getElementById("vkx-dibao-alert");
  if (!alertEl) {
    alertEl = document.createElement("div");
    alertEl.id = "vkx-dibao-alert";
    document.body.appendChild(alertEl);
  }
  const safeY = isFinite(t.y)
    ? t.y < 0.05
      ? "ngay đây"
      : num(t.y) + " năm"
    : "không rõ";
  const teleBtnHtml = t.canTeleport
    ? `<button class="vk-btn do-btn-teleport" data-slot="${t.slot}" style="background:#8b5cf6;color:#fff;font-weight:bold;padding:5px 12px;font-size:12px;border:none;border-radius:6px;cursor:pointer;white-space:nowrap;box-shadow:0 0 10px rgba(139,92,246,0.5)">⚡ Truyền Tống (0 năm)</button>`
    : "";
  const dangerWarn =
    t.remYears != null && isFinite(t.y) && t.remYears < t.y
      ? ` <b class="vk-bad">⚠️ Đi bộ (${num(t.y)} năm) > Hạn còn (${t.remYears} năm)!</b>`
      : "";
  const isSdbRunning =
    typeof AU !== "undefined" &&
    AU.run &&
    AU.run.running &&
    AU.run.kind === "sdb";
  const autoStatusHtml = isSdbRunning
    ? `<div style="font-size:11px;color:#3ddc97;margin-top:2px;font-weight:600">🎯 Auto Săn Dị Bảo đang tự động ngắt bế quan để đoạt bảo...</div>`
    : "";

  alertEl.innerHTML = `
      <div style="display:flex;align-items:center;gap:10px;flex:1;min-width:0">
<span class="do-radar-pulse" style="width:12px;height:12px;border-radius:50%;background:#ff3366;box-shadow:0 0 0 0 rgba(255,51,102,0.7);animation:doPulse 1.8s infinite;flex-shrink:0"></span>
<div style="flex:1;min-width:0">
  <div style="font-weight:bold;font-size:13px;color:#ff3366;display:flex;align-items:center;gap:6px;flex-wrap:wrap">
    <span>🔔 PHÁT HIỆN SỰ KIỆN DỊ BẢO!</span>
    <span style="color:#fff">${esc(t.title)}</span>
  </div>
  <div style="font-size:11.5px;color:#bbb;margin-top:2px">
    📍 <b>${esc(t.pName)}</b> (Slot ${t.slot}) · Hạn còn: <b style="color:#f59e0b">${t.remYears != null ? t.remYears + " năm" : "Vô hạn"}</b> · Đường đi: <b>${safeY}</b>${dangerWarn}
  </div>
  ${autoStatusHtml}
</div>
      </div>
      <div style="display:flex;align-items:center;gap:8px;flex-shrink:0">
${teleBtnHtml}
<button class="vk-btn do-btn-travel" data-slot="${t.slot}" style="background:#ff3366;color:#fff;font-weight:bold;padding:5px 12px;font-size:12px;border:none;border-radius:6px;cursor:pointer;white-space:nowrap;box-shadow:0 0 10px rgba(255,51,102,0.4)">🚀 Bay Đến Ngay</button>
<button id="vkx-dibao-close" style="background:rgba(255,255,255,0.1);border:none;color:#ddd;font-size:16px;width:24px;height:24px;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;line-height:1">✕</button>
      </div>
    `;

  const teleBtn = alertEl.querySelector(".do-btn-teleport");
  if (teleBtn) {
    teleBtn.onclick = () => {
      teleBtn.disabled = true;
      teleBtn.textContent = "⚡ Đang truyền tống...";
      setTimeout(() => {
        const res = smartTeleportTo(t.slot);
        if (!res.ok) {
          try {
            UI.notify("⚠️ " + res.msg);
          } catch (e) {}
          alert("⚠️ " + res.msg);
          teleBtn.disabled = false;
          teleBtn.textContent = "⚡ Truyền Tống (0 năm)";
        } else {
          try {
            UI.notify("⚡ " + res.msg);
          } catch (e) {}
          removeDiBaoAlert();
          showDiBaoMini(t, true);
          if (typeof render === "function") render();
        }
      }, 30);
    };
  }

  const btn = alertEl.querySelector(".do-btn-travel");
  if (btn) {
    btn.onclick = () => {
      btn.disabled = true;
      btn.textContent = "⏳ Đang đi...";
      setTimeout(() => {
        const res = ddDoTravel(t.slot);
        if (!res.ok) {
          try {
            UI.notify("⚠️ " + res.msg);
          } catch (e) {}
          alert("⚠️ " + res.msg);
          btn.disabled = false;
          btn.textContent = "🚀 Bay Đến Ngay";
        } else {
          try {
            UI.notify("🚀 " + res.msg);
          } catch (e) {}
          removeDiBaoAlert();
          showDiBaoMini(t, true);
          if (typeof render === "function") render();
        }
      }, 30);
    };
  }

  const closeBtn = alertEl.querySelector("#vkx-dibao-close");
  if (closeBtn) {
    closeBtn.onclick = () => {
      lastDismissedDiBao = t.encId + "_" + t.slot;
      removeDiBaoAlert();
      showDiBaoMini(t, false);
    };
  }
}

function checkDiBaoAlert() {
  try {
    const g = G();
    if (!g || !g.state || !g.state.run) return;
    const run = g.state.run,
      nv = run.nhanVat,
      nam = typeof run.nam === "number" ? run.nam : null;
    if (!run) {
      removeDiBaoAlert();
      removeDiBaoMini();
      return;
    }
    const sc = scanDiBao([run, g.state.meta]);
    const isOwned = (id) => checkOwnedRelic(id, run);

    const candidates = [];
    let c = null;
    try {
      c = ctx();
    } catch (e) {}
    const K = S.core;

    const activeMap = scanMapActiveDiBao(run, c);
    for (const item of activeMap.values()) {
      const encId = item.encId;
      const slot = item.slot;
      const hetHanNam = item.hetHanNam;
      if (hetHanNam !== undefined && nam != null && hetHanNam <= nam)
        continue;

      const ev = item.ev || DIBAO.evMap.get(encId);
      if (ev && !isOwned(ev.relic)) {
        let y = Infinity;
        if (c && K && K.travelYears) {
          try {
            y = K.travelYears(c, slot);
          } catch (e) {}
        }
        const remYears =
          hetHanNam !== undefined && nam != null
            ? Math.max(0, Math.floor(hetHanNam - nam))
            : null;
        const pName = c ? placeName(c, slot) : "Slot " + slot;
        const relInfo = DIBAO.rel[ev.relic] || {};
        const isCarry = relInfo.bd === "Có" || relInfo.theo_kiep;
        candidates.push({
          encId,
          slot,
          pName,
          y,
          remYears,
          title: `«${ev.ten}» (${relInfo.ten || ev.relic})`,
          relic: ev.relic,
          relName: relInfo.ten || ev.relic,
          evName: ev.ten,
          isCarry,
        });
      }
    }

    if (candidates.length === 0) {
      removeDiBaoAlert();
      removeDiBaoMini();
      return;
    }

    // Sắp xếp ưu tiên: Nếu đang ở cùng slot với dị bảo thì ưu tiên trước tiên
    candidates.sort((a, b) => {
      const aHere =
        String(run.viTri) === String(a.slot) ||
        String(run.oNoi) === String(a.slot);
      const bHere =
        String(run.viTri) === String(b.slot) ||
        String(run.oNoi) === String(b.slot);
      if (aHere && !bHere) return -1;
      if (!aHere && bHere) return 1;
      if (a.isCarry && !b.isCarry) return -1;
      if (!a.isCarry && b.isCarry) return 1;
      return a.y - b.y;
    });

    const activeTarget = candidates[0];
    const isHere =
      String(run.viTri) === String(activeTarget.slot) ||
      String(run.oNoi) === String(activeTarget.slot);

    const targetKey = activeTarget.encId + "_" + activeTarget.slot;

    // ĐÃ TỚI NƠI DỊ BẢO XUẤT THẾ:
    // Tự động tắt alert to đi để không che khuất màn hình / nút bấm của game,
    // đồng thời hiển thị Live Mini Tracker tinh gọn ở trên cùng để tiện theo dõi.
    if (isHere) {
      removeDiBaoAlert();
      if (lastDismissedMini !== targetKey) {
        showDiBaoMini(activeTarget, true);
      }
      return;
    }

    // CHƯA TỚI NƠI:
    if (lastDismissedDiBao === targetKey) {
      removeDiBaoAlert();
      if (lastDismissedMini !== targetKey) {
        showDiBaoMini(activeTarget, false);
      } else {
        removeDiBaoMini();
      }
      return;
    }

    activeTarget.canTeleport = !!checkCanTeleport(activeTarget.slot);
    playDiBaoAlertSound();
    if (
      typeof auStop === "function" &&
      typeof AU !== "undefined" &&
      AU.run &&
      AU.run.running &&
      AU.run.kind !== "sdb"
    ) {
      auStop(
        "🔔 Phát hiện Dị Bảo: " +
          activeTarget.title +
          " (Tự động tạm dừng để bạn xử lý)",
      );
    }
    showDiBaoAlert(activeTarget);
    removeDiBaoMini();
  } catch (e) {}
}

// Khởi động watcher tự động kiểm tra sự kiện Dị Bảo và cập nhật tab Dị Bảo theo thời gian thực
var lastRenderedViTri = null;
function onWorldOrPlayerStateChange() {
  // Khi Auto đang chạy (Săn Bảo, Tu Luyện...), Auto đã tự quản lý chu kỳ kiểm tra; bỏ qua event để tránh nghẽn luồng game
  if (typeof AU !== "undefined" && AU.run && AU.run.running) return;
  if (typeof document !== "undefined" && document.hidden) return;
  checkDiBaoAlert();
  if (S.tab === "db") {
    try {
      const curViTri =
        G().state && G().state.run ? String(G().state.run.viTri) : null;
      if (curViTri !== lastRenderedViTri) {
        lastRenderedViTri = curViTri;
        tabDiBao();
      }
    } catch (e) {}
  }
}

try {
  setInterval(onWorldOrPlayerStateChange, 2500);
  setInterval(combatWatcherTick, 400);
  if (typeof TT !== "undefined" && TT && typeof TT.on === "function") {
    TT.on("timePass", onWorldOrPlayerStateChange);
    TT.on("travel", onWorldOrPlayerStateChange);
    TT.on("worldEvent", onWorldOrPlayerStateChange);
    TT.on("encounterEnd", onWorldOrPlayerStateChange);
    TT.on("combatStart", combatWatcherTick);
    TT.on("combatRound", combatWatcherTick);
  }
  setTimeout(checkDiBaoAlert, 1500);
} catch (e) {}

// ── Tab Dị Bảo Toàn Diện (v7.3.0: Bảo Lục Luân Hồi · Thiên Đạo Bù Dị Bảo · Giả Lập Hộ Vệ · Trợ Lý Bù Điểm · Di Chuyển Thông Minh) ──
function tabDiBao() {
  const g = G(),
    st = g ? g.state : null;
  if (!st || !st.run) {
    body.innerHTML =
      '<div class="vk-card"><b class="vk-bad">Chưa có dữ liệu kiếp đang chơi.</b><br><span class="vk-mu">Hãy vào game tải màn chơi trước rồi mở lại tool.</span></div>';
    return;
  }
  const run = st.run,
    nv = run.nhanVat,
    nam = typeof run.nam === "number" ? run.nam : null;
  const sc = scanDiBao([run, st.meta]);
  const Cc = C();
  let c = null;
  try {
    c = ctx();
  } catch (e) {}
  const K = S.core;
  const safeYrs = (y) =>
    typeof yrs === "function"
      ? yrs(y)
      : y < 0.05
        ? "ngay đây"
        : num(y) + " năm";

  S.dibao = S.dibao || { filter: "all", q: "" };
  const f = S.dibao;

  // Map các node đang xuất hiện (Quét toàn diện từ run.nodes, di tích run.noiChon, theGioi, placeActivities)
  const nodeByEnc = scanMapActiveDiBao(run, c);

  // Kiểm tra đã sở hữu món đồ
  const isOwned = (id) => checkOwnedRelic(id, run);

  // Kiểm tra chỉ số kiểm định
  const checkStat = (chkStr) => {
    if (!chkStr) return { ok: true, text: "Không yêu cầu" };
    const m = chkStr.match(/^([a-z_]+)\s*\+(\d+)/);
    if (!m) return { ok: true, text: chkStr };
    const key = m[1],
      req = parseInt(m[2], 10);
    let cur = 0;
    try {
      if (K && K.effectiveStat) cur = K.effectiveStat(nv, key, Cc);
      else if (nv.chiSo && typeof nv.chiSo[key] === "number")
        cur = nv.chiSo[key];
      else if (typeof nv[key] === "number") cur = nv[key];
    } catch (e) {}
    const name = CHI_SO_VI[key] || key;
    return {
      ok: cur >= req,
      cur,
      req,
      key,
      name,
      text: `${name}: ${cur}/${req}`,
    };
  };

  // Chuẩn bị danh sách 21 Dị Bảo
  const allDb = [];
  for (const e of DIBAO.ev) {
    if (!e || !e.relic || typeof e.relic !== "string" || !e.relic.trim()) continue;
    const relInfo =
      DIBAO.rel[e.relic] ||
      (Cc && Cc.items ? Cc.items.get(e.relic) : null) ||
      {};
    const extra = DIBAO_EXTRA[e.relic] || {};
    const done = isOwned(e.relic);
    const gateOk = !e.gate || (nv && nv.canhGioi >= e.gate[0]);
    const statChk = checkStat(e.chk);
    const h = sc.history.get(e.id);
    let cdLeft = 0;
    if (h && e.hc && nam != null && nam < h.namCuoi + e.hc)
      cdLeft = Math.ceil(h.namCuoi + e.hc - nam);
    const nd = nodeByEnc.get(e.id);
    let nodeLeft = null;
    if (nd && typeof nd.hetHanNam === "number" && nam != null)
      nodeLeft = Math.max(0, Math.floor(nd.hetHanNam - nam));

    let stt = "ready";
    if (done) stt = "done";
    else if (nd) stt = "map";
    else if (cdLeft > 0) stt = "cd";
    else if (!gateOk || !statChk.ok) stt = "lock";

    const isCarry =
      relInfo.bd === "Có" || relInfo.theo_kiep || extra.tier === "SSS";
    const isGuide = !!extra.guide || e.relic === "item.do_hon_linh";

    allDb.push({
      id: e.relic,
      ten: relInfo.ten || e.relic,
      loai: relInfo.loai || "phap_khi",
      pham_cap: 8,
      gia: relInfo.gia || 0,
      bd: isCarry,
      guide: isGuide,
      nguon: "ev",
      e,
      relInfo,
      extra,
      done,
      gateOk,
      statChk,
      cdLeft,
      node: nd,
      nodeLeft,
      stt,
    });
  }

  // 2 Boss Hóa Thần Dị Bảo
  for (const bid of DIBAO.boss) {
    const relInfo =
      DIBAO.rel[bid] ||
      (Cc && Cc.items ? Cc.items.get(bid) : null) ||
      {};
    const extra = DIBAO_EXTRA[bid] || {};
    const done = isOwned(bid);
    const isCarry =
      relInfo.bd === "Có" || relInfo.theo_kiep || extra.tier === "SSS";

    allDb.push({
      id: bid,
      ten: relInfo.ten || bid,
      loai:
        relInfo.loai || (bid.includes("dan") ? "dan_duoc" : "phap_khi"),
      pham_cap: 8,
      gia: relInfo.gia || 0,
      bd: isCarry,
      guide: false,
      nguon: "boss",
      relInfo,
      extra,
      done,
      gateOk: nv && nv.canhGioi >= 5,
      statChk: { ok: true, text: "Hạ Boss Hóa Thần" },
      cdLeft: 0,
      node: null,
      nodeLeft: null,
      stt: done ? "done" : nv && nv.canhGioi >= 5 ? "ready" : "lock",
    });
  }

  // Thống kê Bảo Lục
  const totalCount = allDb.length;
  const doneCount = allDb.filter((x) => x.done).length;
  const carryTotal = allDb.filter((x) => x.bd).length;
  const carryDone = allDb.filter((x) => x.bd && x.done).length;
  const mapActive = allDb.filter((x) => x.stt === "map");

  // Số món đã lưu trong Bảo Lục meta
  const metaRelics =
    st.meta && st.meta.tienLo && st.meta.tienLo.relics
      ? st.meta.tienLo.relics
      : [];
  const baoLucPoints = metaRelics.length * 5;

  // Tính toán bảo hiểm Pity
  const sdbCfg =
    (typeof AU !== "undefined" && AU.cfg && AU.cfg.sdb) || {};
  const validEvs = DIBAO.ev.filter(
    (e) => e && e.relic && typeof e.relic === "string" && e.relic.trim() !== "",
  );
  if (Array.isArray(sdbCfg.targetRelics)) {
    sdbCfg.targetRelics = sdbCfg.targetRelics.filter(
      (r) => r && typeof r === "string" && r.trim() !== "",
    );
  }
  const targetRelics = Array.isArray(sdbCfg.targetRelics)
    ? sdbCfg.targetRelics
    : validEvs.map((e) => e.relic);
  const targetSummary =
    targetRelics.length === validEvs.length
      ? "Tất cả 19 Dị Bảo"
      : targetRelics.length === 0
        ? '<span class="vk-bad">Chưa chọn món nào</span>'
        : `<b>${targetRelics.length}</b>/19 Dị Bảo đã chọn`;

  const pity = calcDiBaoPity(run, nv, sc, targetRelics);

  // Render giao diện chính
  body.innerHTML = `
      <div class="vk-card do-radar-card" style="border:1px solid #ff3366;background:linear-gradient(180deg,rgba(255,51,102,0.12) 0%,rgba(15,12,26,0.5) 100%)">
<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
  <h3 style="margin:0;display:flex;align-items:center;gap:8px">
    <span class="do-radar-pulse" style="width:12px;height:12px;border-radius:50%;background:#ff3366;box-shadow:0 0 10px #ff3366"></span>
    <span>🏛️ BẢO LỤC & SĂN DỊ BẢO (NGHỊCH THIÊN P8)</span>
  </h3>
  <span class="do-badge-nt">21 Tối Thượng</span>
</div>

<!-- 4 Khung Chỉ Số Thống Kê -->
<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:8px;margin-bottom:10px">
  <div style="background:var(--bg3);padding:8px;border-radius:6px;text-align:center">
    <div class="vk-mu" style="font-size:11px">Đã Có Trong Kiếp</div>
    <b style="font-size:18px;color:${doneCount ? "var(--acc)" : "var(--mu)"}">${doneCount}/${totalCount}</b>
  </div>
  <div style="background:var(--bg3);padding:8px;border-radius:6px;text-align:center">
    <div class="vk-mu" style="font-size:11px">Bảo Lục Luân Hồi</div>
    <b style="font-size:18px;color:#10b981">${metaRelics.length}/${totalCount} <span style="font-size:12px;font-weight:normal">(+${baoLucPoints}đ)</span></b>
  </div>
  <div style="background:var(--bg3);padding:8px;border-radius:6px;text-align:center">
    <div class="vk-mu" style="font-size:11px">Theo Hồn Qua Kiếp</div>
    <b style="font-size:18px;color:#f59e0b">${carryDone}/${carryTotal}</b>
  </div>
  <div style="background:var(--bg3);padding:8px;border-radius:6px;text-align:center">
    <div class="vk-mu" style="font-size:11px">Đang Trên Bản Đồ</div>
    <b style="font-size:18px;color:${mapActive.length ? "#ff3366" : "var(--mu)"}">${mapActive.length}</b>
  </div>
</div>

<!-- Thanh Trạng Thái & Nút Bật Auto Săn Dị Bảo -->
<div id="db-auto-box" style="background:var(--bg3);border:1px solid ${AU.run && AU.run.running && AU.run.kind === "sdb" ? "#3ddc97" : "var(--line)"};border-radius:10px;padding:9px 12px;margin-bottom:10px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px">
  <div>
    <div style="display:flex;align-items:center;gap:6px">
      <span style="font-size:16px">🎯</span>
      <b style="font-size:13.5px;color:var(--acc)">Auto Săn Dị Bảo (Tự Động Đoạt Bảo)</b>
      <span id="db-auto-status-pill" style="font-size:11px;font-weight:700;padding:2px 8px;border-radius:999px;background:${AU.run && AU.run.running && AU.run.kind === "sdb" ? "rgba(61,220,151,0.2);color:#3ddc97;border:1px solid #3ddc97" : "rgba(255,255,255,0.08);color:var(--mut)"}">${AU.run && AU.run.running && AU.run.kind === "sdb" ? "● ĐANG CHẠY" : "○ TẠM DỪNG"}</span>
    </div>
    <div id="db-auto-status-text" class="vk-mu" style="font-size:12px;margin-top:3px">
      ${AU.run && AU.run.running && AU.run.kind === "sdb" ? esc(AU.run.phaseDesc || AU.run.targetTitle || "Đang quét bản đồ & săn Dị Bảo...") : AU.run && AU.run.kind === "sdb" && AU.run.msg ? `<span class="vk-bad">Dừng: ${esc(AU.run.msg)}</span>` : "Tự động truyền tống/bay đến mục tiêu, vào sự kiện, vượt kiểm định & đánh Hộ Vệ."}
    </div>
    <div style="font-size:11.5px;margin-top:3px" class="vk-mu">
      🎯 Mục tiêu săn: <span id="db-auto-target-text" style="color:var(--acc)">${targetSummary}</span>
      <a href="javascript:void(0)" id="db-btn-edit-target" style="margin-left:6px;color:var(--acc);text-decoration:underline;font-size:11px">[Chọn món muốn săn]</a>
    </div>
  </div>
  <div style="display:flex;gap:6px;align-items:center">
    <button class="vk-btn" id="db-auto-toggle" style="padding:6px 14px;font-size:12px;margin:0;border-radius:8px;background:${AU.run && AU.run.running && AU.run.kind === "sdb" ? "#f87171" : "var(--acc)"};color:var(--ink);font-weight:700">
      ${AU.run && AU.run.running && AU.run.kind === "sdb" ? "⏹ Dừng Auto" : "▶ Bắt Đầu Săn"}
    </button>
    <button class="vk-btn sec" id="db-auto-cfg" style="padding:6px 10px;font-size:12px;margin:0;border-radius:8px">⚙️ Cấu Hình</button>
  </div>
</div>

<!-- Thanh Bảo Hiểm Pity (Thiên Đạo Bù Dị Bảo) -->
<div style="background:var(--bg2);padding:10px;border-radius:8px;border:1px solid rgba(255,51,102,0.3);margin-bottom:8px">
  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;flex-wrap:wrap;gap:4px">
    <b style="font-size:12.5px;color:#f59e0b">⏳ Thiên Đạo Bù Dị Bảo (Bảo Hiểm Pity 500 Năm):</b>
    <span style="font-size:12px">${pity.guaranteed ? '<b class="vk-ok" style="color:#ef4444">🔥 ĐÃ TÍCH ĐỦ 500 NĂM — 100% LƯỢT KẾ XUẤT THẾ (Rơi khi thắng: 7%)</b>' : `Đã chờ: <b>${pity.waitYears} / 500 năm</b> (Trọng số: <b>×${pity.mult}</b>)`}</span>
  </div>
  <div style="height:10px;background:var(--bg3);border-radius:5px;overflow:hidden;position:relative">
    <div style="width:${pity.pityPct}%;height:100%;background:linear-gradient(90deg,#ec4899,#8b5cf6,#f59e0b);border-radius:5px;transition:width 0.3s"></div>
  </div>
  ${
    pity.topCamping.length > 0
      ? `
    <div style="margin-top:8px;font-size:12px" class="vk-mu">
      <span>🏕️ <b>Gợi ý cắm trại đón đầu tối ưu:</b></span>
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:4px">
        ${pity.topCamping
          .map((cp) => {
            const diaSlot = findDiaSlot(c, cp.e.dia);
            const isHere = checkIsHere(c, run, cp.e.dia, diaSlot);
            const relInf = DIBAO.rel[cp.e.relic] || {};
            const pctVal = Math.round((cp.w || 0) * 100);
            const pctStr =
              cp.wait >= 500
                ? " · 100% 🔥"
                : pctVal > 0
                  ? ` · ${pctVal}%`
                  : "";
            return `
            <div style="background:var(--bg3);padding:4px 8px;border-radius:4px;border:1px solid var(--line);display:flex;align-items:center;gap:6px">
              <span>📍 <b>${esc(cp.e.dia)}</b> (${esc(relInf.ten || cp.e.relic)}${pctStr})</span>
              ${isHere ? '<span class="vk-ok" style="font-size:11px">Đang ở đây ✓</span>' : diaSlot != null ? `<button class="vk-btn do-btn-travel" data-slot="${esc(diaSlot)}" data-name="${esc(cp.e.dia)}" style="padding:2px 6px;font-size:10.5px;margin:0">Đi đến</button>` : ""}
              <button type="button" class="vk-btn mini db-btn-hunt-nav" data-relic="${esc(cp.e.relic)}" style="background:#ff3366;color:#fff;font-weight:bold;padding:2px 6px;font-size:10.5px;margin:0;border:none;border-radius:3px;cursor:pointer" title="Chọn mục tiêu này và chuyển sang Auto Săn Dị Bảo">🎯 Săn</button>
            </div>
          `;
          })
          .join("")}
      </div>
    </div>
  `
      : ""
  }
</div>

<div class="vk-mu" style="font-size:12px;line-height:1.4">
  💡 Dị Bảo là bảo vật cấp 8 (Nghịch Thiên). Mỗi món lần đầu ghi vào Bảo Lục tặng <b>+5 Điểm Luân Hồi</b>. Món <b>[Theo Hồn Qua Kiếp]</b> sẽ vĩnh viễn theo bạn sang kiếp sau; riêng <b>Độ Hồn Linh</b> luôn tự theo hồn mà không tốn ô bến đò.
</div>
      </div>

      <!-- Mục tiêu Dị Bảo đang nở trên Map -->
      ${
mapActive.length > 0
  ? `
<div class="vk-card" style="border:1px solid #ff3366">
  <h3 style="margin:0 0 8px;color:#ff3366;display:flex;align-items:center;gap:6px">
    <span class="do-radar-pulse" style="width:10px;height:10px;border-radius:50%;background:#ff3366"></span>
    <span>🎯 DỊ BẢO ĐANG NỞ TRÊN BẢN ĐỒ (${mapActive.length})</span>
  </h3>
  ${mapActive
    .map((r) => {
      let y = Infinity;
      if (c && K && K.travelYears) {
        try {
          y = K.travelYears(c, r.node.slot);
        } catch (err) {}
      }
      const canTele = checkCanTeleport(r.node.slot);
      const walkRisk =
        r.nodeLeft != null && isFinite(y) && r.nodeLeft < y;
      const isHere =
        run &&
        (String(run.viTri) === String(r.node.slot) ||
          String(run.oNoi) === String(r.node.slot));
      const isInside = run && String(run.oNoi) === String(r.node.slot);
      return `
      <div style="background:var(--bg3);border:1px solid rgba(255,51,102,0.4);border-radius:6px;padding:8px;margin-bottom:6px">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:6px;flex-wrap:wrap">
          <div>
            <b style="font-size:14px;color:var(--acc)">👑 ${esc(r.ten)}</b>
            <span class="vk-mu" style="font-size:12px"> · Sự kiện «${esc(r.e.ten)}»</span><br>
            <span style="font-size:12px" class="vk-mu">📍 <b>${esc(c ? placeName(c, r.node.slot) : "Slot " + r.node.slot)}</b> (Slot ${r.node.slot}) · Hạn: <b style="color:#f59e0b">${r.nodeLeft != null ? r.nodeLeft + " năm" : "Vô hạn"}</b> · Đường đi: <b>${isHere ? "Ngay đây ✓" : safeYrs(y)}</b></span>
            ${walkRisk ? `<div class="vk-bad" style="font-size:11.5px;margin-top:2px">⚠️ Đi bộ (${num(y)} năm) sẽ quá hạn sự kiện (${r.nodeLeft} năm)! Hãy dùng truyền tống phù/trận.</div>` : ""}
          </div>
          <div style="display:flex;gap:4px;align-items:center">
            <button type="button" class="vk-btn mini db-btn-hunt-nav" data-relic="${esc(r.id)}" style="background:#ff3366;color:#fff;font-weight:bold;padding:4px 10px;font-size:12px;border:none;border-radius:4px;cursor:pointer;box-shadow:0 0 6px rgba(255,51,102,0.4)" title="Chọn mục tiêu này và chuyển sang Auto Săn Dị Bảo">🎯 Săn</button>
            ${
              isHere
                ? `<button class="vk-btn db-btn-enter-act" data-slot="${esc(r.node.slot)}" data-enc="${esc(r.node.encId)}" style="background:#10b981;color:#fff;font-weight:bold;padding:4px 10px;font-size:12px;border:none;border-radius:4px;cursor:pointer;box-shadow:0 0 8px rgba(16,185,129,0.4)">🚪 ${isInside ? "Vào Sự Kiện Ngay" : "Tiến Vào Nơi Chốn"}</button>`
                : `
              ${canTele ? `<button class="vk-btn do-btn-teleport" data-slot="${esc(r.node.slot)}" style="background:#8b5cf6;color:#fff;font-weight:bold;padding:4px 10px;font-size:12px;border:none;border-radius:4px;cursor:pointer;box-shadow:0 0 8px rgba(139,92,246,0.4)">⚡ Truyền Tống Ngay</button>` : ""}
              <button class="vk-btn do-btn-travel" data-slot="${esc(r.node.slot)}" data-name="${esc(c ? placeName(c, r.node.slot) : "Slot " + r.node.slot)}" style="background:#ff3366;color:#fff;font-weight:bold;padding:4px 10px;font-size:12px;border:none;border-radius:4px;cursor:pointer;box-shadow:0 0 8px rgba(255,51,102,0.4)">🚀 Bay Đến Ngay</button>
            `
            }
          </div>
        </div>
      </div>
    `;
    })
    .join("")}
</div>
      `
  : ""
      }

      <!-- Bộ lọc Dị Bảo -->
      <div class="vk-card">
<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
  <b>🔍 Danh Mục Dị Bảo & Sưu Tập</b>
  <span id="db-count" class="vk-mu" style="font-size:12px"></span>
</div>
<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:8px" id="db-chips">
  <button class="tc-chip${f.filter === "all" ? " on" : ""}" data-k="all">Tất Cả (21)</button>
  <button class="tc-chip${f.filter === "carry" ? " on" : ""}" data-k="carry">🌟 Theo Hồn (12)</button>
  <button class="tc-chip${f.filter === "single" ? " on" : ""}" data-k="single">🛡️ Dùng Trong Kiếp (9)</button>
  <button class="tc-chip${f.filter === "map" ? " on" : ""}" data-k="map">🟢 Đang Trên Map</button>
  <button class="tc-chip${f.filter === "ready" ? " on" : ""}" data-k="ready">⚡ Đủ Điều Kiện</button>
  <button class="tc-chip${f.filter === "lock" ? " on" : ""}" data-k="lock">🔒 Chưa Đạt</button>
  <button class="tc-chip${f.filter === "unowned" ? " on" : ""}" data-k="unowned">Chưa Sở Hữu</button>
  <button class="tc-chip${f.filter === "done" ? " on" : ""}" data-k="done">✨ Đã Có</button>
</div>
<div style="display:flex;gap:6px">
  <input class="vk-inp" id="db-q" style="flex:1" placeholder="Tìm theo tên dị bảo, sự kiện, hộ vệ, hiệu ứng..." value="${esc(f.q)}">
  <button class="vk-btn sec" id="db-clr" style="padding:4px 10px">Xóa</button>
</div>
      </div>

      <!-- Danh Sách Thẻ Dị Bảo -->
      <div id="db-list"></div>

      <!-- Bí kíp Săn Dị Bảo -->
      <details class="vk-card" style="margin-top:10px">
<summary style="cursor:pointer;font-weight:bold;color:var(--acc)">📘 Bí Kíp Đoạt Dị Bảo & Đạt Thành Tựu Bảo Lục</summary>
<div style="margin-top:8px;font-size:13px;line-height:1.5" class="vk-mu">
  <p><b>1. Giá Trị Của Bảo Lục:</b> Khi bạn cầm bất kỳ món Dị Bảo nào vào túi lần đầu trong kiếp, nó sẽ được ghi nhận vào Bảo Lục vĩnh viễn và tặng ngay <b>+5 Điểm Luân Hồi</b>. Gom đủ 21 món sẽ mở khóa thành tựu ẩn <code>thanh_tuu.bao_luc.du_bo</code>.</p>
  <p><b>2. Món Dẫn Hồn (Độ Hồn Linh):</b> Là món bảo vật đặc biệt nhất, luôn tự động theo hồn qua mọi kiếp mà hoàn toàn không tốn ô bến đò chọn mang đồ!</p>
  <p><b>3. Thử Thách Kiểm Định (Ăn chắc 100%):</b> Có 6 món Dị Bảo không cần đánh nhau: <i>Thái Hư Chu (Thần thức 100), Tụ Bảo Bồn (Thần thức 100), Tam Sinh Thạch (Đạo tâm 75), Luân Hồi Chân Kinh (Ngộ tính 70), Cam Lộ Tịnh Bình (Đạo tâm 68), Thần Nông Bách Thảo Kinh (Ngộ tính 45)</i>. Nếu thiếu điểm, hãy xem mục gợi ý bù điểm (cắn đan hoặc tạm đổi trang bị) để đạt chuẩn.</p>
  <p><b>4. Mô Phỏng Chiến Đấu Ảo:</b> Công cụ mô phỏng chiến đấu thực tế qua 4 tiểu cảnh giới của Hộ Vệ bằng kinh mạch hiện tại của bạn. Nếu tỷ lệ thắng $\ge 75\%$, bạn hoàn toàn có thể vượt cấp đoạt bảo an toàn.</p>
  <p><b>5. Hồi Chiêu 120 Năm & Bảo Hiểm 500 Năm:</b> Sau khi sự kiện kết thúc, cần 120 năm để có thể nở lại. Nếu cảnh giới đã đủ mà chờ quá 500 năm chưa gặp Dị Bảo, hệ thống Thiên Đạo Bù Dị Bảo sẽ kích hoạt bảo hiểm 100% xuất thế sự kiện! <i>(Lưu ý cơ chế game: Hạ Boss xong chỉ có tỉ lệ <b>7% (hoặc 3%)</b> đoạt được bảo vật; 93% trường hợp bảo vật sẽ nứt vỡ/tiêu tán theo cốt truyện và địa danh bước vào hồi chiêu 120 năm tiếp theo).</i></p>
</div>
      </details>
    `;

  // Hàm vẽ danh sách
  const draw = () => {
    const qStr = fold(f.q).trim();
    const countEl = body.querySelector("#db-count");
    const listEl = body.querySelector("#db-list");

    let res = allDb.filter((x) => {
      if (f.filter === "carry" && !x.bd) return false;
      if (f.filter === "single" && x.bd) return false;
      if (f.filter === "map" && x.stt !== "map") return false;
      if (f.filter === "ready" && x.stt !== "ready") return false;
      if (f.filter === "lock" && x.stt !== "lock") return false;
      if (f.filter === "unowned" && x.done) return false;
      if (f.filter === "done" && !x.done) return false;

      if (qStr) {
        const matchName = fold(x.ten).includes(qStr);
        const matchEv =
          x.e &&
          (fold(x.e.ten).includes(qStr) ||
            fold(x.e.dia || "").includes(qStr) ||
            fold(x.e.bv || "").includes(qStr));
        const matchMota =
          x.extra && fold(x.extra.mota || "").includes(qStr);
        if (!matchName && !matchEv && !matchMota) return false;
      }
      return true;
    });

    const ORD = { map: 0, ready: 1, cd: 2, lock: 3, done: 4 };
    res.sort(
      (a, b) =>
        ORD[a.stt] - ORD[b.stt] ||
        (b.bd ? 1 : 0) - (a.bd ? 1 : 0) ||
        a.ten.localeCompare(b.ten, "vi"),
    );

    countEl.textContent = `${res.length} / ${allDb.length} Dị Bảo`;

    if (res.length === 0) {
      listEl.innerHTML =
        '<div class="vk-card vk-mu">Không tìm thấy Dị Bảo nào phù hợp với bộ lọc.</div>';
      return;
    }

    listEl.innerHTML = res
      .map((r) => {
        const e = r.e,
          extra = r.extra || {};
        const syn = relicSynergy(r.id, nv.linhCan);
        const isTarget = targetRelics.includes(r.id);

        // Huy hiệu
        const badges = [];
        badges.push(
          '<span class="do-badge-nt">Phẩm 8 Nghịch Thiên</span>',
        );
        if (r.guide)
          badges.push(
            '<span class="do-badge-guide">🔔 Dẫn Hồn (Không Tốn Ô Bến Đò)</span>',
          );
        else if (r.bd)
          badges.push(
            '<span class="do-badge-carry">🌟 Theo Hồn Qua Kiếp</span>',
          );
        else
          badges.push(
            '<span class="do-badge-single">🛡️ Dùng Trong Kiếp</span>',
          );

        // Trạng thái sự kiện
        let sttBadge = "";
        if (r.stt === "map")
          sttBadge = `<span class="vk-ok" style="font-weight:bold">🟢 Đang trên bản đồ${r.nodeLeft != null ? " · còn " + r.nodeLeft + " năm" : ""}</span>`;
        else if (r.stt === "ready")
          sttBadge =
            '<span class="vk-ok">⚡ Đủ điều kiện · Chờ xuất hiện</span>';
        else if (r.stt === "cd")
          sttBadge = `<span class="vk-bad">⏳ Hồi chiêu còn ${r.cdLeft} năm</span>`;
        else if (r.stt === "lock")
          sttBadge = `<span class="vk-bad">🔒 Chưa đủ điều kiện (${!r.gateOk ? "Cần " + realmName(e ? e.gate[0] : 5) : r.statChk.text})</span>`;
        else sttBadge = '<span class="vk-mu">✨ Đã sở hữu</span>';

        // Đánh giá đoạt bảo
        let evalHtml = "";
        if (r.nguon === "ev" && e) {
          if (!e.bv && e.chk) {
            if (r.statChk.ok) {
              evalHtml =
                '<div style="margin-top:4px" class="vk-ok"><b>🎯 Thuần Kiểm Định:</b> ĐÃ ĐẠT CHỈ SỐ — ĂN CHẮC 100% (Không cần giao tranh) ✓</div>';
            } else {
              const gap = r.statChk.req - r.statChk.cur;
              const boosters = findStatBoosters(r.statChk.key, gap);
              let boostAdvice = "";
              if (boosters.bagItems.length > 0) {
                boostAdvice += `<div style="margin-top:2px;color:#f59e0b">🎒 <b>Trong túi có:</b> ${boosters.bagItems.map((b) => `${esc(b.ten)} (+${b.val})`).join(", ")}</div>`;
              }
              if (boosters.recommendedPills.length > 0) {
                boostAdvice += `<div style="margin-top:2px" class="vk-mu">💊 <b>Đan dược khuyên cắn:</b> ${boosters.recommendedPills.map((p) => `${esc(p.ten)} (+${p.val} điểm)`).join(", ")}</div>`;
              }
              evalHtml = `
        <div style="margin-top:4px" class="vk-bad">
          <b>🎯 Thuần Kiểm Định:</b> THIẾU CHỈ SỐ (${esc(r.statChk.text)}) ✗
          ${boostAdvice}
        </div>
      `;
            }
          } else if (e.bv) {
            const sim = simDiBaoGuard(nv, e);
            let simText = "";
            if (sim) {
              const winPct = Math.round(sim.winrate * 100);
              const isSafe = sim.winrate >= 0.75;
              const isRisky = sim.winrate < 0.5;
              simText = `
        <div style="margin-top:4px;padding:6px;background:var(--bg3);border-radius:4px;border-left:3px solid ${isSafe ? "#10b981" : isRisky ? "#ef4444" : "#f59e0b"}">
          <b>⚔️ Giả Lập Đấu Hộ Vệ:</b> ${esc(sim.foeTen)} (${realmName(sim.cg)})<br>
          Tỉ lệ thắng: <b style="color:${isSafe ? "#10b981" : isRisky ? "#ef4444" : "#f59e0b"}">${winPct}%</b> (${sim.wins}/${sim.total} trận) · Máu còn lại thấp nhất: ~${sim.minHpPct}%
          <div style="font-size:11.5px;margin-top:2px" class="${isSafe ? "vk-ok" : isRisky ? "vk-bad" : "vk-mu"}">
            ${isSafe ? "✓ Chiến lực đủ mạnh, hoàn toàn có thể khiêu chiến an toàn" : isRisky ? "⚠️ Nguy hiểm! Cần tăng thêm tu vi hoặc điều chỉnh kinh mạch trước khi đánh" : "⚡ Có thể thắng nhưng còn rủi ro mang thương"}
          </div>
        </div>
      `;
            } else {
              simText = `<div style="margin-top:4px"><b>⚔️ Hộ Vệ Trấn Giữ:</b> ${esc(e.bv)} (${realmName(e.bvcg ?? 5)})</div>`;
            }
            evalHtml = simText;
          }
        } else if (r.nguon === "boss") {
          evalHtml = `<div style="margin-top:4px" class="vk-mu"><b>👑 Nguồn Gốc:</b> Rơi độc quyền từ Boss Hóa Thần thế giới (CG 5)</div>`;
        }

        // Khung di chuyển / đón đầu
        let travelBox = "";
        if (r.node) {
          let y = Infinity;
          if (c && K && K.travelYears) {
            try {
              y = K.travelYears(c, r.node.slot);
            } catch (err) {}
          }
          const canTele = checkCanTeleport(r.node.slot);
          const isHere =
            run &&
            (String(run.viTri) === String(r.node.slot) ||
              String(run.oNoi) === String(r.node.slot));
          const isInside =
            run && String(run.oNoi) === String(r.node.slot);
          travelBox = `
    <div style="margin-top:8px;padding:6px;background:rgba(255,51,102,0.1);border:1px solid #ff3366;border-radius:4px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:4px">
      <span style="font-size:12px">📍 <b>${esc(c ? placeName(c, r.node.slot) : "Slot " + r.node.slot)}</b> · Hạn: <b style="color:#f59e0b">${r.nodeLeft != null ? r.nodeLeft + " năm" : "Vô hạn"}</b> · Đi: <b>${isHere ? "Ngay đây ✓" : safeYrs(y)}</b></span>
      <div style="display:flex;gap:4px;align-items:center">
        <button type="button" class="vk-btn mini db-btn-hunt-nav" data-relic="${esc(r.id)}" style="background:#ff3366;color:#fff;font-weight:bold;padding:4px 8px;font-size:11px;border:none;border-radius:4px;cursor:pointer;box-shadow:0 0 6px rgba(255,51,102,0.3)" title="Chọn mục tiêu này và chuyển sang Auto Săn Dị Bảo">🎯 Săn Món Này</button>
        ${
          isHere
            ? `<button class="vk-btn db-btn-enter-act" data-slot="${esc(r.node.slot)}" data-enc="${esc(r.node.encId)}" style="background:#10b981;color:#fff;font-weight:bold;padding:4px 8px;font-size:11px;border:none;border-radius:4px;cursor:pointer;box-shadow:0 0 8px rgba(16,185,129,0.4)">🚪 ${isInside ? "Vào Sự Kiện Ngay" : "Tiến Vào Nơi Chốn"}</button>`
            : `
          ${canTele ? `<button class="vk-btn do-btn-teleport" data-slot="${esc(r.node.slot)}" style="background:#8b5cf6;color:#fff;font-weight:bold;padding:4px 8px;font-size:11px;border:none;border-radius:4px;cursor:pointer">⚡ Truyền Tống Ngay</button>` : ""}
          <button class="vk-btn do-btn-travel" data-slot="${esc(r.node.slot)}" data-name="${esc(c ? placeName(c, r.node.slot) : "Slot " + r.node.slot)}" style="background:#ff3366;color:#fff;font-weight:bold;padding:4px 8px;font-size:11px;border:none;border-radius:4px;cursor:pointer">🚀 Bay Đến Ngay</button>
        `
        }
      </div>
    </div>
  `;
        } else if (!r.done && e && e.dia) {
          const diaSlot = findDiaSlot(c, e.dia);
          const isHere = checkIsHere(c, run, e.dia, diaSlot);
          if (isHere) {
            travelBox = `
      <div style="margin-top:6px;padding:6px;background:rgba(34,197,94,0.12);border:1px solid #22c55e;border-radius:4px;font-size:12px;color:#22c55e;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:6px">
        <div>
          <b>📍 Đang đứng đón đầu tại ${esc(e.dia)} ✓</b>
          <div class="vk-mu" style="font-size:11px;margin-top:2px">Đứng tại địa danh này giúp tăng xác suất Đạo Diễn rút trúng sự kiện sớm nhất!</div>
        </div>
        <button type="button" class="vk-btn mini db-btn-hunt-nav" data-relic="${esc(r.id)}" style="background:#ff3366;color:#fff;font-weight:bold;padding:3px 8px;font-size:11px;border:none;border-radius:4px;cursor:pointer;box-shadow:0 0 6px rgba(255,51,102,0.3)" title="Chọn mục tiêu này và chuyển sang Auto Săn Dị Bảo">🎯 Săn Món Này</button>
      </div>
    `;
          } else if (diaSlot != null) {
            let y = Infinity;
            if (c && K && K.travelYears) {
              try {
                y = K.travelYears(c, diaSlot);
              } catch (err) {}
            }
            travelBox = `
      <div style="margin-top:6px;padding:6px;background:var(--bg2);border-radius:4px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:4px">
        <span style="font-size:12px">📍 Điểm đón đầu: <b>${esc(e.dia)}</b> (Slot ${esc(diaSlot)}) · Cách: <b>${safeYrs(y)}</b></span>
        <div style="display:flex;gap:4px;align-items:center">
          <button type="button" class="vk-btn mini db-btn-hunt-nav" data-relic="${esc(r.id)}" style="background:#ff3366;color:#fff;font-weight:bold;padding:3px 8px;font-size:11px;border:none;border-radius:4px;cursor:pointer;box-shadow:0 0 6px rgba(255,51,102,0.3)" title="Chọn mục tiêu này và chuyển sang Auto Săn Dị Bảo">🎯 Săn Món Này</button>
          <button class="vk-btn do-btn-travel" data-slot="${esc(diaSlot)}" data-name="${esc(e.dia)}" style="background:var(--acc2);color:#fff;font-weight:bold;padding:3px 8px;font-size:11px;border:none;border-radius:4px;cursor:pointer">📍 Đi Đến Đón Đầu</button>
        </div>
      </div>
    `;
          }
        }

        return `
  <div class="vk-card" style="border-left:4px solid ${r.bd ? "#10b981" : "#ff3366"};margin-bottom:8px">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;flex-wrap:wrap;gap:4px">
      <div style="display:flex;align-items:center;gap:6px">
        <h3 style="margin:0;font-size:15px;color:var(--acc)">${esc(r.ten)}</h3>
        ${
          r.nguon === "ev"
            ? `
          <button type="button" class="vk-btn mini db-btn-toggle-target" data-relic="${esc(r.id)}" style="padding:1px 6px;font-size:10.5px;margin:0;border-radius:4px;border:1px solid ${isTarget ? "#10b981" : "var(--line)"};background:${isTarget ? "rgba(16,185,129,0.18)" : "rgba(255,255,255,0.05)"};color:${isTarget ? "#10b981" : "var(--mu)"};cursor:pointer" title="Bật/tắt đưa vào mục tiêu Auto Săn Dị Bảo">
            ${isTarget ? "🎯 Săn" : "○ Bỏ qua"}
          </button>
        `
            : ""
        }
      </div>
      <div style="display:flex;gap:4px;flex-wrap:wrap">${badges.join("")}</div>
    </div>
    <div style="margin-bottom:6px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:4px">
      <div>${sttBadge}</div>
      <span class="${syn.cls}" style="font-size:12px;font-weight:600">${syn.txt}</span>
    </div>
    ${extra.mota ? `<div style="font-size:12.5px;color:#ddd;margin-bottom:6px;line-height:1.4"><b>✨ Hiệu Ứng:</b> ${esc(extra.mota)}</div>` : ""}
    <div class="vk-mu" style="font-size:12px;line-height:1.5">
      <b>Loại:</b> ${esc(LOAI_VI[r.loai] || r.loai)} · <b>Giá trị:</b> ${num(r.gia)} linh thạch<br>
      ${e ? `<b>Sự kiện:</b> «${esc(e.ten)}» ${e.dia ? "· <b>Nơi:</b> " + esc(e.dia) : ""} · <b>Cảnh giới:</b> ${realmName(e.gate ? e.gate[0] : 4)}<br>` : ""}
      ${evalHtml}
    </div>
    ${travelBox}
  </div>
`;
      })
      .join("");
  };

  // Gắn sự kiện bộ lọc
  const chips = body.querySelectorAll("#db-chips button");
  chips.forEach((btn) => {
    btn.onclick = () => {
      chips.forEach((b) => b.classList.remove("on"));
      btn.classList.add("on");
      f.filter = btn.dataset.k;
      draw();
    };
  });

  const qInp = body.querySelector("#db-q");
  let qTmr = null;
  if (qInp) {
    qInp.oninput = () => {
      clearTimeout(qTmr);
      qTmr = setTimeout(() => {
        f.q = qInp.value;
        draw();
      }, 200);
    };
  }

  const clrBtn = body.querySelector("#db-clr");
  if (clrBtn) {
    clrBtn.onclick = () => {
      f.q = "";
      if (qInp) qInp.value = "";
      draw();
    };
  }

  // Gắn sự kiện click di chuyển & truyền tống
  body.onclick = (ev) => {
    const autoToggleBtn =
      ev.target.closest && ev.target.closest("#db-auto-toggle");
    if (autoToggleBtn) {
      ev.preventDefault();
      ev.stopPropagation();
      if (AU.run && AU.run.running && AU.run.kind === "sdb") {
        auStop("Dừng Auto từ tab Dị Bảo");
      } else {
        auStart("sdb", false);
      }
      tabDiBao();
      return;
    }

    const editTargetLink =
      ev.target.closest && ev.target.closest("#db-btn-edit-target");
    if (editTargetLink) {
      ev.preventDefault();
      ev.stopPropagation();
      S.tab = "asdb";
      render();
      return;
    }

    const huntNavBtn =
      ev.target.closest && ev.target.closest(".db-btn-hunt-nav");
    if (huntNavBtn) {
      ev.preventDefault();
      ev.stopPropagation();
      const rId = huntNavBtn.getAttribute("data-relic");
      if (rId) {
        const sdbCfg = AU.cfg.sdb;
        sdbCfg.targetRelics = [rId];
        auSave();
        const relName = (DIBAO.rel[rId] && DIBAO.rel[rId].ten) || rId;
        try {
          UI.notify(
            "🎯 Đã chọn mục tiêu: " +
              relName +
              " trong Auto Săn Dị Bảo.",
          );
        } catch (e) {}
        S.tab = "asdb";
        render();
        setTimeout(() => {
          try {
            const card = document.querySelector(
              `.au-sdb-relic-card[data-relic="${rId}"]`,
            );
            if (card) {
              card.scrollIntoView({
                behavior: "smooth",
                block: "center",
              });
              card.style.transition = "all 0.4s ease";
              card.style.outline = "2px solid #ff3366";
              card.style.boxShadow = "0 0 14px rgba(255, 51, 102, 0.7)";
              setTimeout(() => {
                card.style.outline = "";
                card.style.boxShadow = "";
              }, 3000);
            }
          } catch (err) {}
        }, 150);
      }
      return;
    }

    const toggleTargetBtn =
      ev.target.closest && ev.target.closest(".db-btn-toggle-target");
    if (toggleTargetBtn) {
      ev.preventDefault();
      ev.stopPropagation();
      const rId = toggleTargetBtn.getAttribute("data-relic");
      if (rId && rId.trim()) {
        const sdbCfg = AU.cfg.sdb;
        const validEvs = DIBAO.ev.filter(
          (e) => e && e.relic && typeof e.relic === "string" && e.relic.trim() !== "",
        );
        if (!Array.isArray(sdbCfg.targetRelics)) {
          sdbCfg.targetRelics = validEvs.map((e) => e.relic);
        } else {
          sdbCfg.targetRelics = sdbCfg.targetRelics.filter(
            (r) => r && typeof r === "string" && r.trim() !== "",
          );
        }
        const idx = sdbCfg.targetRelics.indexOf(rId);
        if (idx >= 0) {
          sdbCfg.targetRelics.splice(idx, 1);
        } else {
          sdbCfg.targetRelics.push(rId);
        }
        auSave();
        draw();
        const tgtEl = body.querySelector("#db-auto-target-text");
        if (tgtEl) {
          tgtEl.innerHTML =
            sdbCfg.targetRelics.length === validEvs.length
              ? "Tất cả 19 Dị Bảo"
              : sdbCfg.targetRelics.length === 0
                ? '<span class="vk-bad">Chưa chọn món nào</span>'
                : `<b>${sdbCfg.targetRelics.length}</b>/19 Dị Bảo đã chọn`;
        }
      }
      return;
    }

    const autoCfgBtn =
      ev.target.closest && ev.target.closest("#db-auto-cfg");
    if (autoCfgBtn) {
      ev.preventDefault();
      ev.stopPropagation();
      S.tab = "asdb";
      render();
      return;
    }

    const enterActBtn =
      ev.target.closest && ev.target.closest(".db-btn-enter-act");
    if (enterActBtn) {
      ev.preventDefault();
      ev.stopPropagation();
      const slot = enterActBtn.dataset.slot;
      const encId = enterActBtn.dataset.enc;
      enterActBtn.disabled = true;
      const oldTxt = enterActBtn.textContent;
      enterActBtn.textContent = "⏳ Đang vào...";
      setTimeout(() => {
        const res = enterDiBaoEvent(slot, encId);
        if (res.ok) {
          try {
            UI.notify("🚪 Đã tiến vào sự kiện Dị Bảo!");
          } catch (e) {}
          removeDiBaoAlert();
          tabDiBao();
        } else {
          try {
            UI.notify("⚠️ " + (res.err || "Không thể mở sự kiện."));
          } catch (e) {}
          enterActBtn.disabled = false;
          enterActBtn.textContent = oldTxt;
          draw();
        }
      }, 50);
      return;
    }

    const travelBtn =
      ev.target.closest && ev.target.closest(".do-btn-travel");
    if (travelBtn) {
      ev.preventDefault();
      ev.stopPropagation();
      const slot = travelBtn.dataset.slot;
      if (!slot) return;
      travelBtn.disabled = true;
      const oldTxt = travelBtn.textContent;
      travelBtn.textContent = "⏳ Đang đi...";
      setTimeout(() => {
        try {
          const res = ddDoTravel(slot);
          if (!res.ok) {
            try {
              UI.notify("⚠️ " + res.msg);
            } catch (e) {}
            alert("⚠️ " + res.msg);
            travelBtn.disabled = false;
            travelBtn.textContent = oldTxt;
          } else {
            try {
              UI.notify("🚀 " + res.msg);
            } catch (e) {}
            if (S.core && S.core.sync)
              try {
                S.core.sync();
              } catch (e) {}
            lastRenderedViTri = String(slot);
            tabDiBao();
          }
        } catch (err) {
          try {
            UI.notify("⚠️ Lỗi: " + (err.message || err));
          } catch (e) {}
          travelBtn.disabled = false;
          travelBtn.textContent = oldTxt;
        }
      }, 30);
      return;
    }

    const teleBtn =
      ev.target.closest && ev.target.closest(".do-btn-teleport");
    if (teleBtn) {
      ev.preventDefault();
      ev.stopPropagation();
      const slot = teleBtn.dataset.slot;
      if (!slot) return;
      teleBtn.disabled = true;
      const oldTxt = teleBtn.textContent;
      teleBtn.textContent = "⚡ Đang truyền tống...";
      setTimeout(() => {
        try {
          const res = smartTeleportTo(slot);
          if (!res.ok) {
            try {
              UI.notify("⚠️ " + res.msg);
            } catch (e) {}
            alert("⚠️ " + res.msg);
            teleBtn.disabled = false;
            teleBtn.textContent = oldTxt;
          } else {
            try {
              UI.notify("⚡ " + res.msg);
            } catch (e) {}
            if (S.core && S.core.sync)
              try {
                S.core.sync();
              } catch (e) {}
            lastRenderedViTri = String(slot);
            tabDiBao();
          }
        } catch (err) {
          try {
            UI.notify("⚠️ Lỗi: " + (err.message || err));
          } catch (e) {}
          teleBtn.disabled = false;
          teleBtn.textContent = oldTxt;
        }
      }, 30);
      return;
    }
  };

  draw();
}

