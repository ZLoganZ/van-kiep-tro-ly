/**
 * Module: Tra Cứu Vật Phẩm & Quái Vật Toàn Diện
 */
// ═════════════════════════ TRA CỨU: VẬT PHẨM + QUÁI VẬT ═════════════════════════
// Đọc thẳng từ dữ liệu game đang chạy (items, enemies, encounters, donPhuong, enemyFamilies, tocYeu, chieuDich, lootTables, noiChon),
// nên game thêm / đổi món, quái, nơi xuất hiện là Tra Cứu tự khớp. Chỉ mục dựng một lần cho mỗi bản dữ liệu rồi dùng lại.
// Mô tả bổ sung: game (content-C_CF7zJj) chưa ghi mo_ta cho 17 mục dưới đây. Chỉ dùng khi game không có mô tả; hễ game thêm mo_ta thì lấy của game.
const DESC_BO_SUNG = {
  "enemy.tan_tu_tham_lam":
    "Tán tu không nương tựa tông môn nào, thấy người lạ mang đồ tốt là nổi lòng tham ra tay cướp. Có thể rơi Huyết Hỏa Châm, Long Phượng Hồng Chúc, Na Di Phù.",
  "enemy.ma_tu_hut_mau":
    "Ma tu sống nhờ hút máu người khác để thêm tu vi, không mang hệ nào. Hạ gục có thể rơi Huyết Đằng Tiên, Huyết Triều Quyết, Khai Khiếu Châu cùng các công pháp huyết đạo.",
  "enemy.truong_lao":
    "Trưởng lão một tông môn, giỏi pháp thuật, tu vi Kết Đan, thuộc hàng Tinh Anh. Rơi 300 Linh Thạch và một món riêng theo quốc gia nơi gặp: Thu Thủy Kiếm Quyết (Đại Ung), Khô Mộc Phùng Xuân Quyết (Thịnh Quốc), Ly Hỏa Hoàn Đao (Lương Quốc), Liệt Địa Quyền (Bắc Minh), Cửu Tiết Trúc Tiên (Viêm Quốc).",
  "enemy.ma_dau":
    "Ma đầu đã luyện huyết chú tới Kết Đan, thuộc hàng Tinh Anh. Chiêu: Huyết Ảnh Đoạt Mệnh, Huyết Chú, Huyết Tế Hồi Nguyên. Có thể rơi Huyết Thụ Ma Công, Xuyên Bích Giác, Nhiếp Hồn Linh.",
  "enemy.chuong_mon":
    "Chưởng môn đứng đầu một tông môn, tu vi Nguyên Anh, thuộc hàng Đầu Lĩnh. Chiêu: Pháp Tướng Thiên Địa, Lĩnh Vực Giáng Lâm. Rơi 1500 Linh Thạch và một món riêng theo quốc gia: Vĩnh Triều Chưởng (Đại Ung), Phù Tang Thần Mộc (Thịnh Quốc), Liệt Dương Thần Kích (Lương Quốc), Bàn Sơn Ấn (Bắc Minh), Bát Bảo Kim Chung (Viêm Quốc).",
  "enemy.truong_lao_nguyen_anh":
    "Trưởng lão tu vi Nguyên Anh, giỏi pháp thuật. Chiêu: Pháp Tướng Thiên Địa, Lĩnh Vực Giáng Lâm. Có thể rơi Hàn Tủy Đan.",
  "enemy.thai_thuong_truong_lao":
    "Bậc lão tổ ẩn mình trong tông môn, tu vi Hóa Thần, giỏi pháp thuật. Chiêu: Pháp Tướng Thiên Địa, Lĩnh Vực Giáng Lâm. Rơi Tam Nguyên Quy Nhất Công, Thiên Lôi Chính Pháp, Thương Long Đan.",
  "enemy.thiet_bi_hung":
    "Gấu yêu da dày như sắt, mang hệ Thổ và Kim, lảng vảng ở núi non và yêu vực. Chiêu: Yêu Nha Phệ, Mãnh Phác, Thiết Bì Hộ Thể. Có thể rơi Hàn Thiết, Tinh Nguyên Đan, Khai Khiếu Châu.",
  "enemy.huyet_nha_bao":
    "Báo yêu nanh nhuốm máu, mang hệ Hỏa, săn mồi ở yêu vực, núi non và hoang mạc. Chiêu: Yêu Nha Phệ, Mãnh Hổ Phác Sát, Hổ Khiếu Sơn Lâm. Có thể rơi Xuyên Bích Giác, Xích Long Quả.",
  "enemy.thanh_lan_mang":
    "Mãng xà vảy xanh, mang hệ Thủy và Mộc, ẩn trong rừng rậm và vùng sông hồ. Chiêu: Yêu Nha Phệ, Bàn Xà Triền. Rơi Yêu Bì.",
  "enemy.da_lang":
    "Sói hoang thường gặp ở rừng rậm, băng nguyên và núi non, chưa có tu vi. Rơi Yêu Bì, Khai Nguyên Đan.",
  "enemy.xich_diem_lang":
    "Sói yêu thấm hỏa khí, mang hệ Hỏa, đi săn ở núi non và rừng rậm. Rơi Yêu Bì, Ngưng Khí Đan.",
  "item.huyet_linh_chi":
    "Linh chi nhuốm màu huyết, mang cả hệ Hỏa lẫn Mộc, mọc ở núi non và rừng rậm. Linh dược phẩm 2, giá gốc 40 Linh Thạch.",
  "item.thanh_tam_thao":
    "Cỏ xanh mát mang hệ Mộc, mọc ở rừng rậm, băng nguyên và vùng sông hồ. Linh dược phẩm 2, giá gốc 15 Linh Thạch.",
  "item.bang_phach_lien":
    "Hoa sen sinh trong nước lạnh, mang hệ Thủy và Băng, chỉ thấy ở vùng sông hồ. Linh dược phẩm 3, giá gốc 120 Linh Thạch.",
  "item.xich_tinh_qua":
    "Quả đỏ thấm hỏa khí, mang hệ Hỏa, mọc ở núi non, hoang mạc và yêu vực. Linh dược phẩm 3, giá gốc 120 Linh Thạch.",
  "item.han_thiet":
    "Sắt lạnh mang hệ Kim, khai thác được ở núi non. Nguyên liệu phẩm 2, giá gốc 30 Linh Thạch.",
};
const tcMoTa = (o) => (o && (o.mo_ta || DESC_BO_SUNG[o.id])) || "";
const TC_LOAI = {
  dan_duoc: "Đan Dược",
  phu_luc: "Phù Lục",
  cong_phap: "Công Pháp",
  phap_khi: "Pháp Khí",
  linh_duoc: "Linh Dược",
  nguyen_lieu: "Nguyên Liệu",
  yeu_tai: "Yêu Tài",
  don_phuong: "Bí Phương (Đơn Phương)",
  tru_vat: "Trữ Vật",
  dung_cu: "Dụng Cụ",
  phuong_tien: "Phương Tiện",
  di_hoa: "Dị Hỏa",
  dac_san: "Hàng Buôn",
  lenh_bai: "Lệnh Bài",
  tran_van: "Trận Văn",
  trung_thu: "Trứng Thú",
  tran_ban: "Trận Bàn",
  khac: "Khác",
};
const TC_MUC = {
  thuong: "Thường",
  tinh_anh: "Tinh Anh",
  boss: "Đầu Lĩnh",
  lau_la: "Lâu La",
};
const TC_QCOL = [
  "#9ca3af",
  "#9ca3af",
  "#22c55e",
  "#3b82f6",
  "#a855f7",
  "#f59e0b",
  "#ef4444",
  "#ec4899",
  "#14b8a6",
];
const TC_MCOL = {
  thuong: "#9ca3af",
  tinh_anh: "#3b82f6",
  boss: "#ef4444",
  lau_la: "#9ca3af",
};
const TC_LMON = { yeu_thu: "Yêu Thú", tu_si: "Tu Sĩ" };
const TC_DH = {
  son_mach: "Sơn Mạch",
  rung_ram: "Rừng Rậm",
  ho_nuoc: "Vùng Sông Hồ",
  hoang_mac: "Hoang Mạc",
  hoang_nguyen: "Băng Nguyên",
  yeu_vuc: "Yêu Vực",
  di_tich: "Di Tích",
  thanh_tri: "Thành Trấn",
  hai_dao: "Hải Đảo",
  son_mon: "Sơn Môn",
};
const TC_QUOC = {
  ung: "Đại Ung",
  thinh: "Thịnh Quốc",
  luong: "Lương Quốc",
  viem: "Viêm Quốc",
  minh: "Bắc Minh",
};
const TC_NGHE = {
  luyen_dan: "Luyện Đan",
  che_phu: "Chế Phù",
  luyen_bao: "Luyện Bảo",
  tran_phap: "Trận Pháp",
};
const TC_HIEU = {
  bleed: "Chảy Máu",
  poison: "Trúng Độc",
  burn: "Thiêu Đốt",
  chill: "Giá Lạnh",
  haste: "Tăng Tốc",
  sunder: "Phá Giáp",
};
const TC_DANG = {
  cong: "Công",
  thu: "Thủ",
  khong_che: "Khống Chế",
  hoi_phuc: "Hồi Phục",
};
const TC_BANG = {
  "loot.yeu_thu": "Yêu Thú",
  "loot.tu_si": "Tu Sĩ",
  "loot.ta_vat": "Tà Vật",
};
// Tên đặc tính quái đúng như game gọi (trích từ bảng đặc tính trong code game).
const TC_TRAIT = {
  giap_da: "Thạch Bì",
  tron_chay: "Thoát Độn",
  hu_anh: "Hư Ảnh",
  hut_huyet: "Hút Huyết",
  nguyen_to: "Thân Nguyên Tố",
  cuong_bao: "Cuồng Bạo",
  phan_chan: "Phản Chấn",
  phan_than: "Phân Thân",
  hoi_sinh: "Sinh Sôi",
  goi_bay: "Hú Bầy",
  ket_tran: "Kết Trận",
  cau_vien: "Cầu Viện",
  bay_dan: "Bầy Đàn",
  kiem_y: "Kiếm Ý",
  niet_ban: "Niết Bàn",
  tu_bao: "Tự Bạo",
};
const TC_NOI_FIX = {
  thanh_tri: "Thành Trì",
  moi_noi: "Mọi Nơi",
  vo_nhai_uyen: "Vô Nhai Uyên",
};
// Số dự phòng; khi đã nạp lõi game thì lấy số thật từ code game (K.rare).
const TC_RARE = {
  dH: [1, 0.7, 0.4, 0.1, 0.07, 0.05, 0.03, 0.015],
  rank: { lau_la: 0.5, thuong: 1, tinh_anh: 1.5, boss: 2 },
  nhanHo: 0.4,
};
const TC_F0 = {
  v: {
    q: "",
    nhom: "",
    cg: "",
    he: "",
    own: false,
    desc: false,
    n: 40,
  },
  q: {
    q: "",
    loai: "",
    muc: "",
    cg: "",
    he: "",
    dh: "",
    desc: false,
    n: 40,
  },
};
S.tcs = S.tcs || { v: { ...TC_F0.v }, q: { ...TC_F0.q } };

const tcRare = () => (S.core && S.core.rare) || TC_RARE;
const tcRealm = (i) => realmName(i);
const tcRng = (r) =>
  !Array.isArray(r)
    ? ""
    : r[0] === r[1]
      ? tcRealm(r[0])
      : tcRealm(r[0]) + " – " + tcRealm(r[1]);
const tcBag = () => {
  try {
    return G().state.run.nhanVat.tuiDo || {};
  } catch (e) {
    return {};
  }
};
const tcNoi = (id) => {
  try {
    const d = C().noiChon.get("noi." + id);
    if (d && d.ten) return tcWord(d.ten);
  } catch (e) {
    /* bỏ qua */
  }
  return TC_NOI_FIX[id] || tcWord(String(id).replace(/_/g, " "));
};
const tcClean = (s) =>
  tcWord(
    String(s ?? "")
      .replace(/\{[^}]*\}/g, "…")
      .replace(/\s+/g, " ")
      .trim(),
  );
const tcLk = (k, id, label) =>
  `<a class="tc-lk" data-k="${k}" data-id="${esc(id)}">${esc(label)}</a>`;
const tcSec = (title, html) =>
  html ? `<div class="tc-sec"><b>${esc(title)}</b>${html}</div>` : "";
const tcPills = (arr) =>
  arr.map((s) => `<span class="tc-pill">${s}</span>`).join("");
const tcChance = (p) => pct(Math.min(1, p), p < 0.1 ? 1 : 0);
const tcRow = (a, b) =>
  `<div class="vk-row"><span>${esc(a)}</span><b style="text-align:right">${b}</b></div>`;
const tcItemName = (id) => {
  const it = C().items.get(id);
  return it
    ? tcWord(it.ten)
    : tcWord(
        String(id)
          .replace(/^item\./, "")
          .replace(/_/g, " "),
      );
};
const tcMonName = (id) => {
  const e = C().enemies.get(id);
  return e
    ? tcWord(e.ten)
    : tcWord(
        String(id)
          .replace(/^enemy\./, "")
          .replace(/_/g, " "),
      );
};
const tcAdd = (map, k, v) => {
  let a = map.get(k);
  if (!a) map.set(k, (a = []));
  a.push(v);
};
const tcMore = (arr, show, mk, label) => {
  const head = arr.slice(0, show).map(mk).join("<br>");
  if (arr.length <= show) return head;
  return (
    head +
    `<details style="margin-top:3px"><summary class="vk-mu" style="font-size:12px">Xem Thêm ${arr.length - show} ${esc(label)}</summary>${arr.slice(show).map(mk).join("<br>")}</details>`
  );
};

function tcBuild() {
  if (!G() || !G().env || !G().env.content)
    throw new Error(
      "Chưa thấy dữ liệu game. Hãy mở trang game, đợi tải xong rồi bấm ↻.",
    );
  const Cc = C();
  if (S.tcx && S.tcx.src === Cc) return S.tcx;
  const X = {
    src: Cc,
    items: [],
    mons: [],
    itemById: new Map(),
    monById: new Map(),
    drops: new Map(),
    evItem: new Map(),
    evMon: new Map(),
    shops: [],
    recOut: new Map(),
    recIn: new Map(),
    teach: new Map(),
    tower: new Set(),
    eggOf: new Map(),
    evoFrom: new Map(),
  };
  for (const it of Cc.items.values()) {
    const x = {
      it,
      id: it.id,
      name: tcWord(it.ten),
      cat: categorize(it),
      nameKey: fold(it.ten),
      key: fold(
        it.ten +
          " " +
          String(it.id)
            .replace(/^item\./, "")
            .replace(/_/g, " "),
      ),
      full: null,
      ord: (it.canh_gioi ?? 0) * 100 + (it.pham_cap || 0),
    };
    X.items.push(x);
    X.itemById.set(it.id, x);
  }
  X.items
    .sort((a, b) => a.ord - b.ord || a.name.localeCompare(b.name, "vi"))
    .forEach((x, i) => {
      x.ord = i;
    });
  for (const e of Cc.enemies.values()) {
    const x = {
      e,
      id: e.id,
      name: tcWord(e.ten),
      nameKey: fold(e.ten),
      key: fold(
        e.ten +
          " " +
          String(e.id)
            .replace(/^enemy\./, "")
            .replace(/_/g, " "),
      ),
      full: null,
      ord: (e.canh_gioi ?? 0) * 100 + (e.tieu_canh_gioi || 0),
    };
    X.mons.push(x);
    X.monById.set(e.id, x);
  }
  X.mons
    .sort((a, b) => a.ord - b.ord || a.name.localeCompare(b.name, "vi"))
    .forEach((x, i) => {
      x.ord = i;
    });
  // Rơi đồ: trực tiếp (roi) + theo họ quái (ho_quai.roi) + theo tộc yêu (toc.roi)
  for (const m of X.mons) {
    const e = m.e;
    for (const r of e.roi || []) {
      if (typeof r.roi_quy === "string")
        tcAdd(X.drops, r.roi_quy, {
          mon: m,
          kind: "quy",
          uu: typeof r.uu_tien === "number" ? r.uu_tien : 1,
        });
      else if (r.add_item) {
        const id =
            typeof r.add_item === "string" ? r.add_item : r.add_item.id,
          ng =
            r.if && typeof r.if.ngau_nhien === "number"
              ? r.if.ngau_nhien
              : null;
        if (typeof id === "string")
          tcAdd(
            X.drops,
            id,
            ng === null
              ? { mon: m, kind: "chac" }
              : { mon: m, kind: "ngau", p: ng },
          );
      }
    }
    const fam = e.ho_quai && Cc.enemyFamilies.get(e.ho_quai),
      toc = e.toc && Cc.tocYeu.get("toc." + e.toc);
    for (const [src, kind] of [
      [fam, "ho"],
      [toc, "toc"],
    ])
      for (const l of (src && src.roi) || []) {
        if (
          l.canh_gioi &&
          (e.canh_gioi < l.canh_gioi[0] || e.canh_gioi > l.canh_gioi[1])
        )
          continue;
        tcAdd(X.drops, l.id, { mon: m, kind, p: l.ti_le });
      }
  }
  // Tiệm, sự kiện, công thức, tháp
  const reItem =
      /"(add_item|roi_quy|mua|remove_item)":\s*(?:\{\s*"id":\s*)?"(item\.[a-z0-9_]+)"/g,
    reMon = /"(enemy\.[a-z0-9_]+)"/g;
  const RANK = { ban: 3, nhan: 2, can: 1 };
  for (const def of Cc.encounters.values()) {
    if (def.kind === "cua_hang" && def.ke_hang && def.ke_hang.length)
      X.shops.push({
        def,
        name: tcClean(def.ten),
        noi: ((def.tags && def.tags.noi) || []).map(tcNoi),
      });
    let txt;
    try {
      txt = JSON.stringify(def);
    } catch (e) {
      continue;
    }
    let m;
    reItem.lastIndex = 0;
    while ((m = reItem.exec(txt))) {
      const role =
        m[1] === "mua"
          ? "ban"
          : m[1] === "remove_item"
            ? "can"
            : "nhan";
      let mp = X.evItem.get(m[2]);
      if (!mp) X.evItem.set(m[2], (mp = new Map()));
      if (!mp.has(def.id) || RANK[role] > RANK[mp.get(def.id)])
        mp.set(def.id, role);
    }
    reMon.lastIndex = 0;
    while ((m = reMon.exec(txt))) {
      let s = X.evMon.get(m[1]);
      if (!s) X.evMon.set(m[1], (s = new Set()));
      s.add(def.id);
    }
    const rg = (def.tags && def.tags.canh_gioi) || [0, 5];
    for (const sp of Object.values(def.vars || {})) {
      if (
        !sp ||
        typeof sp !== "object" ||
        sp.from !== "enemy" ||
        !(sp.tag || sp.ho_quai || sp.toc)
      )
        continue;
      const rel = sp.canh_gioi || [0, 0],
        lo = rg[0] + rel[0],
        hi = rg[1] + rel[1];
      const tg = [].concat(sp.tag || []),
        hq = [].concat(sp.ho_quai || []),
        tc = [].concat(sp.toc || []),
        lo2 = sp.loai ? [].concat(sp.loai) : null;
      for (const mm of X.mons) {
        const e = mm.e;
        if (lo2 && !lo2.includes(e.loai)) continue;
        if (tg.length && !tg.some((t) => (e.tag || []).includes(t)))
          continue;
        if (hq.length && !hq.includes(e.ho_quai)) continue;
        if (
          tc.length &&
          !tc.includes(e.toc) &&
          !tc.includes("toc." + e.toc)
        )
          continue;
        if (e.canh_gioi < lo || e.canh_gioi > hi) continue;
        let s = X.evMon.get(e.id);
        if (!s) X.evMon.set(e.id, (s = new Set()));
        s.add(def.id);
      }
    }
  }
  for (const r of Cc.donPhuong.values()) {
    for (const id of [r.ra, r.ra_cuc]) if (id) tcAdd(X.recOut, id, r);
    for (const c of r.chu || []) tcAdd(X.recIn, c.id, r);
  }
  for (const it of Cc.items.values()) {
    if (it.loai === "don_phuong" && it.day)
      tcAdd(X.teach, it.day, it.id);
    if (typeof it.khuon === "string" && it.khuon.startsWith("enemy."))
      tcAdd(X.eggOf, it.khuon, it.id);
  }
  for (const m of X.mons)
    for (const t of m.e.tien_hoa || []) tcAdd(X.evoFrom, t.id, m.id);
  try {
    for (const t of Cc.towers.values())
      for (const m of JSON.stringify(t).matchAll(
        /"(enemy\.[a-z0-9_]+)"/g,
      ))
        X.tower.add(m[1]);
  } catch (e) {
    /* bỏ qua */
  }
  S.tcx = X;
  return X;
}
// Kệ hàng của tiệm: món có thể lên kệ theo loại (và nhãn nếu dòng kệ đòi nhãn). Gần đúng, ghi rõ là "có thể".
const tcShelfOK = (it) =>
  it.gia > 0 &&
  !it.theo_kiep &&
  !it.tran_phai &&
  !["lenh_bai", "dac_san", "di_hoa"].includes(it.loai) &&
  !(it.tag || []).some((t) =>
    [
      "nghich_thien",
      "di_bao",
      "chi_khai_bao",
      "ngu_linh",
      "chi_luyen",
      "tong_mon",
      "noi_bo",
      "khong_nguon",
    ].includes(t),
  );
const tcLineMatch = (l, it) =>
  [].concat(l.loai).includes(it.loai) &&
  (!l.tag || [].concat(l.tag).some((t) => (it.tag || []).includes(t)));
const TC_LAMMOI = {
  thuong_tru: "Thường Trú",
  ngu_canh: "Theo Ngữ Cảnh",
};
const tcEncLine = (def) => {
  const n = ((def.tags && def.tags.noi) || []).map(tcNoi).join(", "),
    r = def.tags && def.tags.canh_gioi ? tcRng(def.tags.canh_gioi) : "";
  const meta = [
    n,
    r,
    TC_LAMMOI[def.lam_moi] || "",
    def.hoi_nam ? "Làm Mới Sau " + def.hoi_nam + " Năm" : "",
  ]
    .filter(Boolean)
    .join(" · ");
  return `${esc(tcClean(def.ten))}${meta ? ` <span class="vk-mu">(${esc(meta)})</span>` : ""}`;
};
const tcDropP = (d, it) => {
  const R = tcRare();
  if (d.kind === "chac") return 1;
  if (d.kind === "ngau") return d.p;
  if (d.kind === "quy")
    return Math.min(
      1,
      (R.dH[Math.min(R.dH.length, Math.max(1, it.pham_cap || 1)) - 1] ??
        0.05) *
        (R.rank[d.mon.e.muc || "thuong"] ?? 1) *
        d.uu,
    );
  return Math.min(1, d.p * R.nhanHo);
};
const tcDropTxt = (d, it) =>
  d.kind === "chac"
    ? "Chắc Chắn"
    : d.kind === "ngau"
      ? tcChance(d.p)
      : d.kind === "quy"
        ? "≈ " + tcChance(tcDropP(d, it)) + " · Rơi Hiếm"
        : "≈ " +
          tcChance(tcDropP(d, it)) +
          (d.kind === "ho" ? " · Theo Họ" : " · Theo Tộc");

function tcItemHtml(x) {
  const X = tcBuild(),
    it = x.it,
    Cc = C(),
    own = tcBag()[it.id] || 0,
    out = [];
  const lo = TC_LOAI[it.loai] || tcWord(String(it.loai || "khac")),
    rows = [
      tcRow(
        "Loại",
        esc(lo) + (fold(lo) === fold(x.cat) ? "" : " · " + esc(x.cat)),
      ),
    ];
  if (it.pham_cap) rows.push(tcRow("Phẩm Cấp", String(it.pham_cap)));
  if (it.canh_gioi !== undefined)
    rows.push(tcRow("Dùng Từ Cảnh Giới", esc(tcRealm(it.canh_gioi))));
  if (it.he && it.he.length)
    rows.push(tcRow("Hệ", esc(it.he.map(heTen).join(" / "))));
  if (it.gia) rows.push(tcRow("Giá Gốc", it.gia + " Linh Thạch"));
  if (own)
    rows.push(
      tcRow("Đang Có Trong Túi", `<span class="vk-ok">${own}</span>`),
    );
  if (typeof it.khuon === "string" && Cc.enemies.has(it.khuon))
    rows.push(tcRow("Nở Ra", tcLk("q", it.khuon, tcMonName(it.khuon))));
  out.push(rows.join(""));
  if (typeof TT !== "undefined" && TT.yaml) {
    out.push(
      `<div style="margin:6px 0 2px"><button class="vk-btn sec tc-btn-copy-yaml" data-id="${esc(it.id)}" style="padding:3px 9px;font-size:11.5px;cursor:pointer;border-radius:4px;border:1px solid var(--line);background:var(--bg3);color:var(--acc)">📋 Copy YAML Gốc</button></div>`,
    );
  }
  if (tcMoTa(it))
    out.push(
      `<div style="margin:6px 0;font-size:13px;line-height:1.5">${esc(tcMoTa(it))}</div>`,
    );
  let full = "";
  try {
    full = itemFull(it);
  } catch (e) {
    full = "";
  }
  out.push(tcSec("Công Dụng", full ? `<div>${full}</div>` : ""));
  const note = sourceNote(it).filter((s) => !s.startsWith("mọc/có ở"));
  if ((it.tag || []).includes("trung_quy"))
    note.push(
      "món quý ngự linh: game không ghi nguồn bán / rơi cụ thể, xem thêm tab Ngự Linh",
    );
  if (note.length)
    out.push(
      tcSec("Ghi Chú Nguồn", tcPills(note.map((s) => esc(tcWord(s))))),
    );

  // ── Nơi xuất hiện
  const where = [];
  const best = new Map();
  for (const d of X.drops.get(it.id) || []) {
    const p = tcDropP(d, it),
      cur = best.get(d.mon.id);
    if (!cur || p > cur.p) best.set(d.mon.id, { d, p });
  }
  const arr = [...best.values()].sort(
    (a, b) => b.p - a.p || a.d.mon.ord - b.d.mon.ord,
  );
  if (arr.length) {
    const hasQuy = arr.some((o) => o.d.kind === "quy");
    where.push(
      tcSec(
        "Quái Rơi (" + arr.length + ")",
        tcMore(
          arr,
          8,
          ({ d }) =>
            `${tcLk("q", d.mon.id, d.mon.name)} <span class="vk-mu">${esc(tcRng([d.mon.e.canh_gioi, d.mon.e.canh_gioi]))}${d.mon.e.muc ? " · " + esc(TC_MUC[d.mon.e.muc] || d.mon.e.muc) : ""} · ${tcDropTxt(d, it)}</span>`,
          "Loài Khác",
        ) +
          (hasQuy
            ? '<div class="vk-mu" style="font-size:11.5px;margin-top:3px">Rơi Hiếm: mỗi kiếp chỉ rơi một lần. Tỉ lệ ước theo phẩm cấp món và mức quái.</div>'
            : ""),
      ),
    );
  }
  const evs = X.evItem.get(it.id),
    sells = [],
    gets = [],
    needs = [];
  if (evs)
    for (const [eid, role] of evs) {
      const def = Cc.encounters.get(eid);
      if (!def) continue;
      (role === "ban" ? sells : role === "nhan" ? gets : needs).push(
        def,
      );
    }
  if (sells.length)
    where.push(
      tcSec("Bán Trực Tiếp Ở", tcMore(sells, 6, tcEncLine, "Nơi Khác")),
    );
  if (tcShelfOK(it)) {
    const seen = new Set(),
      sh = X.shops.filter(
        (s) =>
          s.def.ke_hang.some((l) => tcLineMatch(l, it)) &&
          !sells.includes(s.def) &&
          !seen.has(s.name + "|" + s.noi.join()) &&
          seen.add(s.name + "|" + s.noi.join()),
      );
    if (sh.length)
      where.push(
        tcSec(
          "Có Thể Lên Kệ Ở (" + sh.length + " Tiệm)",
          tcMore(
            sh,
            6,
            (s) =>
              `${esc(s.name)}${s.noi.length ? ` <span class="vk-mu">(${esc(s.noi.join(", "))})</span>` : ""}`,
            "Tiệm Khác",
          ),
        ),
      );
  }
  if (gets.length)
    where.push(
      tcSec(
        "Nhận Được Từ Sự Kiện (" + gets.length + ")",
        tcMore(gets, 6, tcEncLine, "Sự Kiện Khác"),
      ),
    );
  const rec = (X.recOut.get(it.id) || []).map((r) => {
    const need = (r.chu || [])
      .map((c) => `${tcLk("v", c.id, tcItemName(c.id))} ×${c.so ?? 1}`)
      .join(", ");
    const teach = (X.teach.get(r.id) || [])
      .map((id) => tcLk("v", id, tcItemName(id)))
      .join(", ");
    return `<b>${esc(TC_NGHE[r.nghe] || tcWord(r.nghe))}</b>: ${esc(tcClean(r.ten))}${r.ra_cuc === it.id ? " (Hạng Cực)" : ""}<br><span class="vk-mu" style="font-size:12px">Cần: ${need || "—"}${teach ? "<br>Học Từ: " + teach : ""}</span>`;
  });
  if (rec.length)
    where.push(
      tcSec(
        "Luyện / Chế Từ",
        tcMore(rec, 3, (s) => s, "Công Thức Khác"),
      ),
    );
  const org = [];
  if (it.dia_hinh && it.dia_hinh.length)
    org.push(
      "Mọc / Có Ở: " +
        esc(it.dia_hinh.map((d) => TC_DH[d] || tcWord(d)).join(", ")),
    );
  if (it.xuat_xu)
    org.push(
      "Đặc Sản: " + esc(TC_QUOC[it.xuat_xu] || tcWord(it.xuat_xu)),
    );
  const hq = []
    .concat(it.ho_quai || [])
    .map((id) => {
      const f = Cc.enemyFamilies.get(id);
      return f ? tcWord(f.ten) : null;
    })
    .filter(Boolean);
  if (hq.length) org.push("Họ Quái: " + esc(hq.join(", ")));
  const tcs = []
    .concat(it.toc || [])
    .map((id) => {
      const f = Cc.tocYeu.get("toc." + id);
      return f ? tcWord(f.ten) : null;
    })
    .filter(Boolean);
  if (tcs.length) org.push("Tộc Yêu: " + esc(tcs.join(", ")));
  if (org.length) where.push(tcSec("Nguồn Gốc", org.join("<br>")));
  // Rơi ngẫu nhiên theo bảng rơi chung của game
  if (tcShelfOK(it) && it.canh_gioi !== undefined) {
    const g = [];
    for (const t of Cc.lootTables.values()) {
      const lines = [...(t.dong || []), ...(t.ngon || [])];
      if (lines.some((l) => [].concat(l.loai).includes(it.loai)))
        g.push(
          TC_BANG[t.id] ||
            tcClean(
              String(t.id)
                .replace(/^loot\./, "")
                .replace(/_/g, " "),
            ),
        );
    }
    if (g.length && !arr.length)
      where.push(
        tcSec(
          "Bảng Rơi Chung",
          `Có Thể Rơi Ngẫu Nhiên Từ ${esc([...new Set(g)].join(" / "))} Cảnh Giới ${esc(tcRealm(it.canh_gioi))} – ${esc(tcRealm(Math.min(5, it.canh_gioi + 1)))}.`,
        ),
      );
  }
  const use = [
    ...new Map(
      (X.recIn.get(it.id) || []).map((r) => [r.ra, r]),
    ).values(),
  ];
  if (use.length)
    where.push(
      tcSec(
        "Dùng Làm Nguyên Liệu Cho (" + use.length + ")",
        tcMore(
          use,
          6,
          (r) =>
            `${tcLk("v", r.ra, tcItemName(r.ra))} <span class="vk-mu">· ${esc(TC_NGHE[r.nghe] || r.nghe)}</span>`,
          "Món Khác",
        ),
      ),
    );
  if (needs.length)
    where.push(
      tcSec(
        "Cần Dùng Trong Sự Kiện",
        tcMore(needs, 4, tcEncLine, "Sự Kiện Khác"),
      ),
    );
  out.push(
    `<div style="margin-top:8px;border-top:1px dashed var(--line);padding-top:4px"><b style="color:var(--acc2)">Nơi Xuất Hiện</b></div>`,
  );
  out.push(
    where.length
      ? where.join("")
      : '<div class="vk-mu" style="font-size:13px">Dữ liệu game chưa ghi nguồn cụ thể cho món này.</div>',
  );
  return out.join("");
}

function tcMonHtml(m) {
  const X = tcBuild(),
    e = m.e,
    Cc = C(),
    out = [];
  const fam = e.ho_quai && Cc.enemyFamilies.get(e.ho_quai),
    toc = e.toc && Cc.tocYeu.get("toc." + e.toc);
  const rows = [
    tcRow(
      "Loại",
      esc(TC_LMON[e.loai] || tcWord(e.loai)) +
        (fam ? " · " + esc(tcWord(fam.ten)) : "") +
        (toc ? " · " + esc(tcWord(toc.ten)) : ""),
    ),
  ];
  rows.push(
    tcRow(
      "Cảnh Giới",
      esc(tcRealm(e.canh_gioi ?? 0)) +
        (e.tieu_canh_gioi !== undefined && e.canh_gioi > 0
          ? " · " + esc(STAGE[e.tieu_canh_gioi] || e.tieu_canh_gioi)
          : ""),
    ),
  );
  rows.push(
    tcRow("Mức", esc(TC_MUC[e.muc || "thuong"] || tcWord(e.muc))),
  );
  if (e.he && e.he.length)
    rows.push(tcRow("Hệ", esc(e.he.map(heTen).join(" / "))));
  const st = [];
  if (e.than_phap) st.push("Thân Pháp " + e.than_phap);
  if (typeof e.ho_the === "number") st.push("Hộ Thể " + pct(e.ho_the));
  if (e.he_so_suc && typeof e.he_so_suc === "object")
    st.push(
      "Khí Huyết ×" +
        num(e.he_so_suc.khi_huyet ?? 1, 2) +
        " · Sát Thương ×" +
        num(e.he_so_suc.sat_thuong ?? 1, 2),
    );
  if (st.length) rows.push(tcRow("Chỉ Số", esc(st.join(" · "))));
  if (e.dac_tinh && e.dac_tinh.length)
    rows.push(
      tcRow(
        "Đặc Tính",
        esc(
          e.dac_tinh
            .map(
              (d) =>
                TC_TRAIT[d] || tcWord(String(d).replace(/_/g, " ")),
            )
            .join(", "),
        ),
      ),
    );
  out.push(rows.join(""));
  if (typeof TT !== "undefined" && TT.yaml) {
    out.push(
      `<div style="margin:6px 0 2px"><button class="vk-btn sec tc-btn-copy-yaml" data-id="${esc(e.id)}" style="padding:3px 9px;font-size:11.5px;cursor:pointer;border-radius:4px;border:1px solid var(--line);background:var(--bg3);color:var(--acc)">📋 Copy YAML Gốc</button></div>`,
    );
  }
  if (tcMoTa(e))
    out.push(
      `<div style="margin:6px 0;font-size:13px;line-height:1.5">${esc(tcMoTa(e))}</div>`,
    );
  const ch = (e.chieu || [])
    .map((id) => Cc.chieuDich.get(id))
    .filter(Boolean);
  if (ch.length)
    out.push(
      tcSec(
        "Chiêu Thức (" + ch.length + ")",
        tcPills(
          ch.map(
            (c) =>
              `${esc(tcWord(c.ten))} <span class="vk-mu">${esc(TC_DANG[c.dang] || "")}${c.he ? " · " + esc(heTen(c.he)) : ""}${c.uy ? " · Uy " + num(c.uy, 1) : ""}${c.controlChance ? " · Khống Chế " + pct(c.controlChance) : ""}${(c.effects || []).length ? " · " + esc([...new Set(c.effects.map((f) => TC_HIEU[f.kind] || tcWord(f.kind)))].join("/")) : ""}</span>`,
          ),
        ),
      ),
    );
  // Nơi xuất hiện
  const where = [];
  const dh =
    (e.dia_hinh && e.dia_hinh.length
      ? e.dia_hinh
      : fam && fam.dia_hinh && fam.dia_hinh.length
        ? fam.dia_hinh
        : toc && toc.dia_hinh) || [];
  if (dh.length)
    where.push(
      tcSec(
        "Địa Hình",
        esc(dh.map((d) => TC_DH[d] || tcWord(d)).join(", ")),
      ),
    );
  if (toc && toc.lanh_dia && toc.lanh_dia.length)
    where.push(tcSec("Lãnh Địa Của Tộc", esc(toc.lanh_dia.join(", "))));
  const gen = Cc.encounters.get("ev.yeu_thu_lang_thang"),
    gsp = gen && gen.vars && gen.vars.yeu_thu;
  if (
    e.loai === "yeu_thu" &&
    gsp &&
    gsp.canh_gioi &&
    (e.canh_gioi ?? 0) >= 0
  ) {
    const rel = gsp.canh_gioi,
      a = Math.max(0, e.canh_gioi - rel[1]),
      b = Math.min(5, e.canh_gioi - rel[0]);
    where.push(
      tcSec(
        "Gặp Ngoài Đường",
        `Khi bạn ở ${esc(tcRng([a, b]))}, tại ${esc(((gen.tags && gen.tags.noi) || []).map(tcNoi).join(", ") || "nơi hoang dã")} có địa hình hợp.`,
      ),
    );
  }
  const evs = [...(X.evMon.get(e.id) || [])]
    .map((id) => Cc.encounters.get(id))
    .filter(Boolean);
  if (evs.length)
    where.push(
      tcSec(
        "Gặp Trong Sự Kiện (" + evs.length + ")",
        tcMore(evs, 6, tcEncLine, "Sự Kiện Khác"),
      ),
    );
  if (X.tower.has(e.id))
    where.push(tcSec("Thử Thách", "Xuất hiện ở Vô Nhai Uyên."));
  const eggs = X.eggOf.get(e.id) || [],
    pre = X.evoFrom.get(e.id) || [];
  if (eggs.length)
    where.push(
      tcSec(
        "Ấp Từ Trứng",
        eggs.map((id) => tcLk("v", id, tcItemName(id))).join(", "),
      ),
    );
  if (pre.length)
    where.push(
      tcSec(
        "Tiến Hóa Từ",
        pre.map((id) => tcLk("q", id, tcMonName(id))).join(", "),
      ),
    );
  if (e.bay && e.bay.id)
    where.push(
      tcSec(
        "Đi Theo Bầy",
        `${tcLk("q", e.bay.id, tcMonName(e.bay.id))} ×${[].concat(e.bay.so || 1).join(" – ")}`,
      ),
    );
  out.push(
    `<div style="margin-top:8px;border-top:1px dashed var(--line);padding-top:4px"><b style="color:var(--acc2)">Nơi Xuất Hiện</b></div>`,
  );
  out.push(
    where.length
      ? where.join("")
      : '<div class="vk-mu" style="font-size:13px">Dữ liệu game chưa ghi nơi cụ thể cho quái này.</div>',
  );
  // Rơi đồ
  const drop = [];
  for (const r of e.roi || []) {
    if (typeof r.roi_quy === "string")
      drop.push({
        id: r.roi_quy,
        d: {
          mon: m,
          kind: "quy",
          uu: typeof r.uu_tien === "number" ? r.uu_tien : 1,
        },
      });
    else if (r.add_item) {
      const id =
          typeof r.add_item === "string" ? r.add_item : r.add_item.id,
        ng =
          r.if && typeof r.if.ngau_nhien === "number"
            ? r.if.ngau_nhien
            : null;
      if (typeof id === "string")
        drop.push({
          id,
          d:
            ng === null
              ? { mon: m, kind: "chac" }
              : { mon: m, kind: "ngau", p: ng },
        });
    }
  }
  for (const [src, kind] of [
    [fam, "ho"],
    [toc, "toc"],
  ])
    for (const l of (src && src.roi) || []) {
      if (
        l.canh_gioi &&
        (e.canh_gioi < l.canh_gioi[0] || e.canh_gioi > l.canh_gioi[1])
      )
        continue;
      drop.push({ id: l.id, d: { mon: m, kind, p: l.ti_le } });
    }
  const lt = (e.roi || []).find((r) => r.linh_thach !== undefined),
    tv = (e.roi || []).find((r) => typeof r.tu_vi === "number");
  const top = [];
  if (lt)
    top.push(
      "Linh Thạch ≈ " +
        (typeof lt.linh_thach === "number"
          ? lt.linh_thach
          : esc(JSON.stringify(lt.linh_thach))),
    );
  if (tv) top.push("Tu Vi +" + tv.tu_vi);
  const bestD = new Map();
  for (const o of drop) {
    const it = Cc.items.get(o.id);
    if (!it) continue;
    const p = tcDropP(o.d, it),
      cur = bestD.get(o.id);
    if (!cur || p > cur.p) bestD.set(o.id, { ...o, it, p });
  }
  const dl = [...bestD.values()].sort((a, b) => b.p - a.p);
  const tab = Cc.lootTables.get(
    e.roi_bang ||
      (e.tag && e.tag.includes("ta_vat")
        ? "loot.ta_vat"
        : "loot." + e.loai),
  );
  const gl = tab
    ? [...(tab.dong || [])].map(
        (l) =>
          `${esc(
            tcWord(
              []
                .concat(l.loai)
                .map((k) => TC_LOAI[k] || k)
                .join(" / "),
            ),
          )}`,
      )
    : [];
  out.push(
    `<div style="margin-top:8px;border-top:1px dashed var(--line);padding-top:4px"><b style="color:var(--acc2)">Rơi Đồ</b></div>`,
  );
  out.push(
    top.length
      ? `<div style="font-size:13px">${top.join(" · ")}</div>`
      : "",
  );
  out.push(
    dl.length
      ? tcSec(
          "Vật Phẩm (" + dl.length + ")",
          tcMore(
            dl,
            8,
            (o) =>
              `${tcLk("v", o.id, tcWord(o.it.ten))} <span class="vk-mu">· ${tcDropTxt(o.d, o.it)}</span>`,
            "Món Khác",
          ),
        )
      : "",
  );
  if (gl.length)
    out.push(
      tcSec(
        "Bảng Rơi Chung",
        `Thêm Ngẫu Nhiên: ${[...new Set(gl)].join(", ")}.`,
      ),
    );
  if (e.ngu_linh) {
    const nl = e.ngu_linh,
      th = (e.tien_hoa || [])
        .map(
          (t) =>
            `→ ${tcLk("q", t.id, tcMonName(t.id))}${
              t.lieu
                ? ' <span class="vk-mu">(cần ' +
                  Object.entries(t.lieu)
                    .map(([id, n]) => esc(tcItemName(id)) + " ×" + n)
                    .join(", ") +
                  ")</span>"
                : ""
            }`,
        )
        .join("<br>");
    out.push(
      tcSec(
        "Ngự Linh",
        `Có Thể Thu Phục: ${esc((nl.loai || []).map((k) => NLW_TEN[k] || tcWord(k)).join(" / "))}${typeof nl.do_kho === "number" ? " · Độ Khó " + pct(nl.do_kho) : ""}${e.hach ? "<br>Lõi Khôi Lỗi: " + tcLk("v", e.hach, tcItemName(e.hach)) : ""}${th ? "<br>" + th : ""}`,
      ),
    );
  }
  return out.join("");
}

function tcFullKey(x, isV) {
  if (x.full === null) {
    try {
      if (isV)
        x.full = fold(
          tcMoTa(x.it) + " " + itemFull(x.it) + " " + x.cat,
        );
      else
        x.full = fold(
          [
            tcMoTa(x.e),
            ...(x.e.dia_hinh || []).map((d) => TC_DH[d] || d),
            ...(x.e.he || []).map(heTen),
            TC_LMON[x.e.loai],
          ].join(" "),
        );
    } catch (e) {
      x.full = "";
    }
  }
  return x.full;
}
function tcSearch(list, f, isV, accept) {
  const q = fold(f.q).trim(),
    toks = q.split(/\s+/).filter(Boolean),
    out = [];
  for (const x of list) {
    if (!accept(x)) continue;
    let sc = 0;
    if (toks.length) {
      let ok = true;
      for (const t of toks) {
        if (x.key.includes(t)) sc += x.key.startsWith(t) ? 3 : 2;
        else if (f.desc && tcFullKey(x, isV).includes(t)) sc += 1;
        else {
          ok = false;
          break;
        }
      }
      if (!ok) continue;
      if (x.nameKey === q) sc += 10;
    }
    out.push([x, sc]);
  }
  out.sort((a, b) => b[1] - a[1] || a[0].ord - b[0].ord);
  return out.map((o) => o[0]);
}
function tcGo(k, id) {
  const X = tcBuild(),
    x = k === "v" ? X.itemById.get(id) : X.monById.get(id);
  if (!x) return;
  S.tcs[k] = { ...TC_F0[k], q: x.name, focus: id };
  S.abort = true;
  S.tab = k === "v" ? "tcv" : "tcq";
  render();
}
const tcOpts = (list, cur, first) =>
  `<option value="">${first}</option>` +
  list
    .map(
      (o) =>
        `<option value="${esc(o[0])}" ${String(o[0]) === String(cur) ? "selected" : ""}>${esc(o[1])}</option>`,
    )
    .join("");

function tabTraCuu(k) {
  const isV = k === "v",
    f = S.tcs[k],
    X = tcBuild(),
    list = isV ? X.items : X.mons;
  const realms = [0, 1, 2, 3, 4, 5].map((i) => [i, tcRealm(i)]),
    hes = Object.keys(HE).map((h) => [h, HE[h]]);
  const cats = isV
    ? [...new Set(X.items.map((x) => x.cat))]
        .sort((a, b) => CAT_ORDER.indexOf(a) - CAT_ORDER.indexOf(b))
        .map((c) => [c, c])
    : [];
  const sel = isV
    ? `<select class="vk-sel" id="tc-nhom">${tcOpts(cats, f.nhom, "Mọi Nhóm")}</select><select class="vk-sel" id="tc-cg">${tcOpts(realms, f.cg, "Mọi Cảnh Giới")}</select><select class="vk-sel" id="tc-he">${tcOpts(hes, f.he, "Mọi Hệ")}</select>`
    : `<select class="vk-sel" id="tc-loai">${tcOpts(Object.entries(TC_LMON), f.loai, "Yêu Thú Và Tu Sĩ")}</select><select class="vk-sel" id="tc-muc">${tcOpts(
        Object.entries(TC_MUC).filter((o) => o[0] !== "lau_la"),
        f.muc,
        "Mọi Mức",
      )}</select><select class="vk-sel" id="tc-cg">${tcOpts(realms, f.cg, "Mọi Cảnh Giới")}</select><select class="vk-sel" id="tc-he">${tcOpts(hes, f.he, "Mọi Hệ")}</select><select class="vk-sel" id="tc-dh">${tcOpts(Object.entries(TC_DH), f.dh, "Mọi Địa Hình")}</select>`;
  const chipGroups = isV
    ? [["tc-nhom", [["", "Tất Cả"], ...cats]]]
    : [
        ["tc-loai", [["", "Tất Cả"], ...Object.entries(TC_LMON)]],
        [
          "tc-muc",
          [
            ["", "Mọi Mức"],
            ...Object.entries(TC_MUC).filter((o) => o[0] !== "lau_la"),
          ],
        ],
      ];
  body.innerHTML = `<div class="tc-top"><div class="tc-sb"><span class="tc-sb-ic">🔍</span><input type="text" id="tc-q" placeholder="${isV ? "Gõ tên món (không cần dấu): truc co dan, kiem, linh thao…" : "Gõ tên quái (không cần dấu): lang, nhen, oan linh…"}" value="${esc(f.q)}" autocomplete="off"><button class="tc-clear" id="tc-clr" title="Xóa">✕</button></div>
      <div class="tc-chips" id="tc-chips"></div>
      <details class="tc-filter" id="tc-flt"><summary id="tc-fsum">Bộ Lọc Nâng Cao</summary><div class="tc-row" style="margin-top:8px">${sel}</div>
      <div class="tc-opts">${isV ? '<label><input type="checkbox" id="tc-own"' + (f.own ? " checked" : "") + "> Chỉ Món Đang Có</label>" : ""}<label><input type="checkbox" id="tc-desc"${f.desc ? " checked" : ""}> Tìm Cả Trong Mô Tả</label></div></details>
      <div class="tc-cnt" id="tc-cnt"></div></div><div id="tc-list"></div>`;
  const $ = (id) => body.querySelector("#" + id);
  let shown = [];
  const draw = () => {
    f.q = $("tc-q").value;
    f.desc = $("tc-desc").checked;
    let acc;
    if (isV) {
      f.nhom = $("tc-nhom").value;
      f.cg = $("tc-cg").value;
      f.he = $("tc-he").value;
      f.own = $("tc-own").checked;
      const bag = tcBag();
      acc = (x) =>
        (!f.nhom || x.cat === f.nhom) &&
        (f.cg === "" || x.it.canh_gioi === +f.cg) &&
        (!f.he || (x.it.he || []).includes(f.he)) &&
        (!f.own || bag[x.id] > 0);
    } else {
      f.loai = $("tc-loai").value;
      f.muc = $("tc-muc").value;
      f.cg = $("tc-cg").value;
      f.he = $("tc-he").value;
      f.dh = $("tc-dh").value;
      acc = (x) =>
        (!f.loai || x.e.loai === f.loai) &&
        (!f.muc || (x.e.muc || "thuong") === f.muc) &&
        (f.cg === "" || x.e.canh_gioi === +f.cg) &&
        (!f.he || (x.e.he || []).includes(f.he)) &&
        (!f.dh || (x.e.dia_hinh || []).includes(f.dh));
    }
    const res = tcSearch(list, f, isV, acc);
    $("tc-chips").innerHTML = chipGroups
      .map(([sid, opts]) =>
        opts
          .map(
            ([v, lb]) =>
              `<button class="tc-chip${String($(sid).value) === String(v) ? " on" : ""}" data-sid="${sid}" data-v="${esc(v)}">${esc(lb)}</button>`,
          )
          .join(""),
      )
      .join('<i class="tc-gap"></i>');
    const act =
      [...body.querySelectorAll(".tc-row select")].filter(
        (el) => el.value,
      ).length +
      (f.desc ? 1 : 0) +
      (isV && f.own ? 1 : 0);
    $("tc-fsum").textContent =
      "Bộ Lọc Nâng Cao" + (act ? " · " + act + " Đang Bật" : "");
    if (f.focus) {
      const i = res.findIndex((x) => x.id === f.focus);
      if (i > 0) res.unshift(res.splice(i, 1)[0]);
    }
    shown = res.slice(0, f.n);
    $("tc-cnt").textContent =
      `${res.length} / ${list.length} ${isV ? "món" : "quái"} trong dữ liệu game hiện tại.`;
    const bag = isV ? tcBag() : null;
    $("tc-list").innerHTML =
      shown
        .map((x, i) => {
          const meta = isV
            ? [
                TC_LOAI[x.it.loai] || tcWord(String(x.it.loai)),
                x.it.pham_cap ? "Phẩm " + x.it.pham_cap : "",
                x.it.canh_gioi !== undefined
                  ? tcRealm(x.it.canh_gioi)
                  : "",
                (x.it.he || []).map(heTen).join("/"),
              ]
            : [
                TC_LMON[x.e.loai] || tcWord(x.e.loai),
                tcRealm(x.e.canh_gioi ?? 0),
                TC_MUC[x.e.muc || "thuong"],
                (x.e.he || []).map(heTen).join("/"),
              ];
          const own =
            isV && bag[x.id] > 0
              ? ` <span class="vk-ok" style="font-size:12px">có ×${bag[x.id]}</span>`
              : "";
          const qv = isV ? x.it.pham_cap || 0 : 0,
            col = isV
              ? TC_QCOL[Math.min(8, qv)]
              : TC_MCOL[x.e.muc || "thuong"] || "#9ca3af";
          const badge = isV
            ? qv
              ? "P" + qv
              : "·"
            : TC_MUC[x.e.muc || "thuong"] || "";
          return `<details class="vk-card tc-card" style="--tq:${col}" data-i="${i}" ${f.focus === x.id ? "open" : ""}><summary><span class="tc-q${isV ? "" : " tx"}">${esc(badge)}</span><span class="tc-nm"><b>${esc(x.name)}${own}</b><small>${esc(meta.filter(Boolean).join(" · "))}</small></span></summary><div class="tc-bd"></div></details>`;
        })
        .join("") +
        (res.length > shown.length
          ? `<button class="vk-btn sec" id="tc-more" style="width:100%">Xem Thêm ${Math.min(40, res.length - shown.length)} Kết Quả</button>`
          : "") ||
      '<div class="vk-card vk-mu">Không thấy kết quả nào.</div>';
    body.querySelectorAll("#tc-list details").forEach((el) => {
      const fill = () => {
        if (el.dataset.done) return;
        el.dataset.done = 1;
        const x = shown[+el.dataset.i];
        try {
          el.querySelector(".tc-bd").innerHTML = isV
            ? tcItemHtml(x)
            : tcMonHtml(x);
        } catch (e) {
          console.error(e);
          el.querySelector(".tc-bd").innerHTML = errBox(e);
        }
      };
      if (el.open) fill();
      el.addEventListener("toggle", () => el.open && fill());
    });
    const mb = $("tc-more");
    if (mb)
      mb.onclick = () => {
        f.n += 40;
        draw();
      };
  };
  $("tc-clr").onclick = () => {
    $("tc-q").value = "";
    f.focus = null;
    f.n = 40;
    draw();
    $("tc-q").focus();
  };
  $("tc-chips").onclick = (ev) => {
    const c = ev.target.closest && ev.target.closest(".tc-chip");
    if (!c) return;
    $(c.dataset.sid).value = c.dataset.v;
    f.focus = null;
    f.n = 40;
    draw();
  };
  $("tc-q").oninput = debounce(() => {
    f.focus = null;
    f.n = 40;
    draw();
  }, 150);
  body.querySelectorAll("#tc-desc, #tc-own").forEach((el) => {
    el.onchange = () => {
      f.focus = null;
      f.n = 40;
      draw();
    };
  });
  body.querySelectorAll(".tc-row select").forEach((el) => {
    el.onchange = () => {
      f.focus = null;
      f.n = 40;
      draw();
    };
  });
  body.onclick = (ev) => {
    const a = ev.target.closest && ev.target.closest(".tc-lk");
    if (a) {
      ev.preventDefault();
      tcGo(a.dataset.k, a.dataset.id);
      return;
    }
    const yb =
      ev.target.closest && ev.target.closest(".tc-btn-copy-yaml");
    if (yb) {
      ev.preventDefault();
      const id = yb.dataset.id;
      if (id && typeof TT !== "undefined" && TT.yaml) {
        try {
          if (typeof TT.yaml.copy === "function") {
            TT.yaml.copy(id);
            try {
              UI.notify("📋 Đã copy YAML của " + id);
            } catch (e) {}
            const prev = yb.textContent;
            yb.textContent = "✓ Đã Copy YAML";
            setTimeout(() => {
              yb.textContent = prev;
            }, 1500);
            return;
          }
          const str = typeof TT.yaml === "function" ? TT.yaml(id) : "";
          if (str && navigator.clipboard) {
            navigator.clipboard.writeText(str).then(() => {
              try {
                UI.notify("📋 Đã copy YAML của " + id);
              } catch (e) {}
              const prev = yb.textContent;
              yb.textContent = "✓ Đã Copy YAML";
              setTimeout(() => {
                yb.textContent = prev;
              }, 1500);
            });
          }
        } catch (err) {
          console.error("Copy YAML error", err);
        }
      }
    }
  };
  draw();
}
function tabVatPham() {
  tabTraCuu("v");
}
function tabQuaiVat() {
  tabTraCuu("q");
}

