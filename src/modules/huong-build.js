import { gWin, TOOL_VER, TT, MOD } from "../core/utils.js";
/**
 * Module: Phân Tích Hướng Build, 6 Meta Presets & Động Cơ Bền Vững Chân Khí
 */
// ═════════════════════════ BẢN 2.5: Hướng build theo lưu phái (2.6: nối vào Kinh mạch) ═════════════════════════
const SCHOOLS = [
  "kiem",
  "phat",
  "the",
  "ngu_thu",
  "khoi_loi",
  "ma",
  "thi",
  "doc",
  "hop_hoan",
  "quy",
];
const NL2S = {
  thu: "ngu_thu",
  khoi_loi: "khoi_loi",
  trung: "doc",
  thi: "thi",
  hon: "quy",
};
const schoolsOf = (it) => {
  const t = (it.tag || []).filter((x) => SCHOOLS.includes(x));
  const nl = it.ngu_linh && NL2S[it.ngu_linh.loai];
  if (nl && !t.includes(nl)) t.push(nl);
  if ((it.tag || []).includes("nghich") && !t.includes("ma"))
    t.push("ma");
  return t;
};
// Phẩm → cảnh giới mà món còn đủ sức (code game: uy bị kẹp khi vượt quá cảnh giới (bậc phẩm)+1; hiệu ứng giảm nửa khi vượt 2, mất khi vượt 3)
const TIER_CG = [0, 0, 1, 2, 3, 4, 5, 99];
const PHAM_TEN = [
  "Phàm",
  "Hoàng",
  "Huyền",
  "Địa",
  "Thiên",
  "Tiên",
  "Thần",
  "Nghịch Thiên",
];
const tierCg = (it) =>
  it.tran_phai
    ? 4
    : TIER_CG[Math.max(1, Math.min(8, it.pham_cap || 2)) - 1];
const freshAt = (it, R) => R <= tierCg(it) + 1;
const DIHOA_PCT = [0, 0, 6, 8, 10, 12, 15, 20];

const REALM_STEPS = {
  1: [
    "Tìm tâm pháp Huyền phẩm đầu tiên và đặt cho thông mạch (chạm đan điền hoặc nối chuỗi công pháp đã thông).",
    "Đánh trận, đi xa để giữ lịch luyện; bế quan khi lịch luyện cạn chỉ được khoảng 3/10 tu vi.",
    "Gom Trúc Cơ Đan (+15%) trước khi tới Đại viên mãn; đột phá sớm bị trừ rất nặng.",
    "Vào tông môn nếu chưa có: có Tàng Kinh Các đổi công pháp bằng cống hiến.",
  ],
  2: [
    "Đồ Phàm/Hoàng phẩm từ đây bắt đầu yếu đi (uy bị kẹp): thay dần sang Huyền rồi Địa phẩm.",
    "Uống đan nâng phẩm đạo cơ (Cố Cơ Đan) trong thời gian Trúc Cơ: đạo cơ tốt thì đường sau dễ.",
    "Từ Trúc Cơ: phương tiện vượt biển cho qua biển sớm; mở bộ kinh mạch thứ 2 (1.000 linh thạch) để có bộ đánh và bộ bế quan riêng.",
    "Gom Kết Kim Đan (+12%) cho lần lên Kết Đan.",
  ],
  3: [
    "Từ Kết Đan có bình cảnh: mọi khoản cộng đột phá (trừ gốc và đạo tâm) chỉ còn 85% khi lên Kết Đan, 65% khi lên Nguyên Anh.",
    "Thay đồ sang Địa/Thiên phẩm; Huyền phẩm hết hiệu ứng phụ (chảy máu, phá giáp…) giảm một nửa.",
    "Gom Dưỡng Anh Đan / Hóa Anh Đan, chú ý tâm ma (mỗi điểm −1% đột phá).",
    "Thọ ~500 năm: lên kế hoạch bế quan ngay khi đủ lịch luyện, đừng để dư.",
  ],
  4: [
    "Từ Nguyên Anh có uy áp: chênh cảnh giới làm bên thấp gây ít, chịu nhiều (cả độc, thiêu, khống chế). Đừng đánh vượt cấp.",
    "Muốn lên Hóa Thần phải ngộ đạo: chỉ có khi bế quan ở Nguyên Anh Đại viên mãn, mỗi năm 2% × (1 + ngộ tính/100). Gom đồ ngộ tính.",
    "Thay đồ sang Thiên/Tiên phẩm.",
    "Ngộ Đạo Trà, Thiên Nhất Đan cho lần lên Hóa Thần.",
  ],
  5: [
    "Đồ Tiên/Thần phẩm; Nghịch Thiên không bị kẹp uy lực nhưng sức nhân theo cảnh giới (xem Luật chung).",
    "Hóa Thần là đỉnh nhân gian: dồn vào đồ mạnh nhất và tích điểm luân hồi cho kiếp sau.",
  ],
};

const BUILDS = [
  {
    k: "kiem",
    ten: "Kiếm Tu",
    nhom: "Chính đạo",
    he: ["kim"],
    core: [
      "Đồ có nhãn kiếm: chiêu × (1 + kiếm uy lực). Thể chất hợp: {tc:the_chat.kiem_cot} — chuỗi kinh lộ dài hơn người thường, nên pháp khí kiếm cuối chuỗi được cộng nhiều hơn.",
      "Kiếm phần lớn hệ Kim; đặt kiếm lên huyệt, nối chuỗi tâm pháp Kim từ đan điền tới kiếm (mỗi công pháp cùng họ hệ +10%).",
      "Tông kiếm: mảnh kiếm trong sơn môn rẻ hơn.",
      "Dị hỏa trang bị cùng hệ với chiêu (vd Kim) cho chiêu +6% → +20% theo phẩm dị hỏa.",
    ],
  },
  {
    k: "the",
    ten: "Thể Tu",
    nhom: "Chính đạo",
    he: ["tho", "kim"],
    core: [
      "Bắt buộc: một <b>tâm pháp luyện thể</b> (nhãn thể) đang thông. Có rồi thì quyền cước và chiêu công của đồ thể tu đánh bằng sức thân: sức = sức pháp × 1,15 × √((1 + 1%×căn cốt) × (1 + khí huyết thân)). Chưa có thì đồ thể tu chỉ như món thường.",
      "Gom căn cốt và đồ tăng khí huyết; càng về sau tăng càng chậm (căn bậc hai).",
      "Thể chất hợp: {tc:the_chat.thiet_cot}; {tc:the_chat.huyen_vu}; {tc:the_chat.hoang_co}.",
      "Coi chừng địch có Thạch Bì (đòn thường, thể tu bị giảm) và Phản Chấn (phản lại sát thương thể tu): gặp chúng nên dùng pháp thuật.",
    ],
  },
  {
    k: "phat",
    ten: "Phật Tu",
    nhom: "Chính đạo",
    he: ["kim"],
    core: [
      "Đồ Phật nhiều kháng tâm ma, chiêu thủ và khống chế: lối chậm mà chắc, đột phá ít hụt.",
      "Tông Phật: tâm ma tăng chỉ còn một nửa (perk chùa −25% nữa). Nhưng giết tu sĩ người là phạm sát giới, bị trừ cống hiến.",
      "Chính đạo: mỗi điểm tâm ma −1% đột phá; hóa giải bằng đan tĩnh tâm, tĩnh tâm ở chùa, sư phụ áp chế.",
    ],
  },
  {
    k: "ma",
    ten: "Ma Tu",
    nhom: "Tà đạo",
    he: ["hoa"],
    core: [
      "Mảnh tà chiếm ≥ 1/3 số ô đang thông thì lưới ngả tà; giữ đủ số năm (5/5/10/20/40/60 năm theo cảnh giới) thì đạo cơ đổi sang tà.",
      "<b>Ma niệm</b>: chiêu tà ×(1 + 3% mỗi 10 ma niệm), tu nhanh hơn, đột phá không bị trừ. Trần = 30 + 10×cảnh giới + bản tâm; vượt trần mỗi điểm +2% mất kiểm soát trong trận (tối đa 50%), đột phá dễ tẩu hỏa.",
      'Ma công hút máu 10% + 1% mỗi 10 ma niệm; khi ma niệm ≥ 80% trần và chiêu có \"ma hóa\" thì hút gấp đôi.',
      "Mang mảnh tà là có ma khí: vào đất chính đạo dễ bị nhận ra (tới 80% mỗi lần), thành lớn, sơn môn, chùa soi kỹ nhất. Liễm Tức giảm nguy cơ.",
      "Thể chất: {tcn:the_chat.huyen_vu} (phản phệ {pp:the_chat.huyen_vu}) và {tcn:the_chat.hoang_co} (phản phệ {pp:the_chat.hoang_co}) hợp tà công; {tcn:the_chat.liet_duong} (phản phệ {pp:the_chat.liet_duong}) thì tránh.",
    ],
  },
  {
    k: "doc",
    ten: "Độc Cổ Tu",
    nhom: "Tà đạo",
    he: ["moc", "thuy"],
    core: [
      "Chiêu độc mạnh theo ma niệm: tỉ lệ độc ×(1 + 1% mỗi 10 ma niệm); khi ma hóa độc kéo dài thêm 2 lượt.",
      "Nuôi <b>cổ trùng</b> (nghi thức Luyện cổ: độc nang, cổ huyết tinh…): cần công pháp triệu trùng trên kinh mạch mới mở ô ngự linh.",
      "Thể chất hợp: {tc:the_chat.van_doc} — độc của bạn gây thêm sức, giữ thêm bản độc cùng phát tác và hồi lại một phần độc phát tác; đổi lại thuốc thang vào người kém hiệu quả.",
      "Luật tà đạo, ma niệm, ma khí giống Ma Tu.",
    ],
  },
  {
    k: "hop_hoan",
    ten: "Hợp Hoan Tu",
    nhom: "Tà đạo",
    he: ["moc", "thuy"],
    core: [
      "Chiêu khống chế tỉ lệ +1% mỗi 10 ma niệm; ma hóa khống thêm 1 lượt.",
      "Song tu kiểu hợp hoan: phải là tà tu và có công pháp hợp hoan đang vận hành.",
      "Luật tà đạo, ma niệm, ma khí giống Ma Tu.",
    ],
  },
  {
    k: "thi",
    ten: "Luyện Thi Tu",
    nhom: "Tà đạo",
    he: ["tho", "kim"],
    core: [
      "<b>Thi khôi</b> từ nghi thức Luyện thi (thi du, bạch cốt phấn, thi hạch…): chỉ lớn khi chủ luyện, không ham đồ khi bị ném dụ. Cần công pháp triệu thi để mở ô (tối đa 3 ô ngự linh).",
      "Ma hóa: thi khí bồi thân, cộng khí huyết cho thi khôi.",
      "Thể chất hợp: {tc:the_chat.am_hon} — giữ thêm 1 thi khôi/quỷ hồn. Tông ma/thi: thắng trận được thêm cống hiến.",
    ],
  },
  {
    k: "quy",
    ten: "Quỷ Tu",
    nhom: "Tà đạo",
    he: ["hoa", "thuy"],
    core: [
      "<b>Quỷ hồn</b> từ nghi thức Luyện hồn (oán hồn ty, âm phù chỉ…). Tâm pháp quỷ (Dưỡng Hồn, Dưỡng Quỷ, Bách Quỷ…) mở 1–2 ô hồn.",
      "Ma hóa: chiêu quỷ gắn ấn hồn lên địch.",
      "Thể chất hợp: {tc:the_chat.am_hon} — giữ thêm 1 hồn; {tc:the_chat.cuu_u} — thân mang âm khí hợp lối quỷ. Trận Câu Hồn: địch ngã đứng dậy đánh cho mình 2 lượt (trận tà, +1 tâm ma mỗi lần bày).",
    ],
  },
  {
    k: "ngu_thu",
    ten: "Ngự Thú Tu",
    nhom: "Ngự linh",
    he: ["moc", "tho"],
    core: [
      "Ai cũng có 1 ô linh thú. Công pháp ngự thú mở thêm ô (tối đa 3); tháo công pháp thì ô đóng, con về túi.",
      "Thú ấp từ trứng (Ấp thú: yêu đan, huyết linh chi…), lớn theo năm và khi cho ăn; tới bình cảnh phải tiến hóa mới lên tiếp.",
      "Trận Khốn: hạ địch bằng đòn nào cũng xét thu phục (cần công pháp triệu hồi đúng loại).",
      "Đồ nhãn Ngự Thú gồm cả tâm pháp lẫn chiêu công, nhưng lực chiến chính vẫn nằm ở linh thú và trứng: kinh mạch lo mở ô và nâng chỉ số.",
    ],
  },
  {
    k: "khoi_loi",
    ten: "Khôi Lỗi Tu",
    nhom: "Ngự linh",
    he: ["kim", "tho"],
    core: [
      "Cần <b>đồ phổ khôi lỗi</b> + nghi thức Luyện khôi (hàn thiết, linh kim, yêu đan, khôi hạch…). Khôi lỗi chỉ lớn khi chủ luyện, không ăn, không ham đồ.",
      "Công pháp khôi lỗi (Nhiếp Hạch Thuật…) mở ô; khôi lỗi hỏng có thể sửa, thu hồi không tốn lượt.",
      "Hợp với nghề Luyện bảo (thần thức, căn cốt) để tự làm vật liệu.",
      "Đồ nhãn Khôi Lỗi gồm tâm pháp, chiêu công và bảo vật (nhiều nhất hệ Kim, rồi Thổ); lực chiến chính vẫn nằm ở khôi lỗi.",
    ],
  },
];
for (const [h, ten] of [
  ["kim", "Kim Tu"],
  ["moc", "Mộc Tu"],
  ["thuy", "Thủy Tu"],
  ["hoa", "Hỏa Tu"],
  ["tho", "Thổ Tu"],
  ["bang", "Băng Tu"],
  ["phong", "Phong Tu"],
  ["loi", "Lôi Tu"],
  ["am", "Ám Tu"],
]) {
  BUILDS.push({
    k: "he_" + h,
    ten,
    nhom: "Theo hệ",
    he: [h],
    elem: h,
    core: [
      `Dồn công pháp, pháp khí hệ ${heTen(h)}; linh căn có ${heTen(h)} thì ô kinh mạch màu ${heTen(h)} nhiều, đặt đúng màu tối đa ×1,3.`,
      `Trang bị <b>dị hỏa</b> hệ ${heTen(h)} (nếu có): mọi chiêu hệ ${heTen(h)} +6% (Huyền) → +20% (Nghịch Thiên).`,
      `Trận bàn Ngũ hành hệ ${heTen(h)}: đòn đúng hệ +20% khi bày.`,
      "Sinh khắc: món kề nhau mà hệ này sinh hệ kia +15%, khắc −15%; chọn hệ phụ là hệ sinh ra hệ chính để nối chuỗi.",
    ],
  });
}
BUILDS.find((x) => x.k === "he_hoa").core.push(
  "Thể chất hợp: {tc:the_chat.liet_duong} — hợp Hỏa Tu chính đạo; tà công thì tránh (phản phệ {pp:the_chat.liet_duong}).",
);
BUILDS.find((x) => x.k === "he_bang").core.push(
  "Thể chất hợp: {tc:the_chat.cuu_am} — dồn băng công, nhưng phải bước vào Luyện Khí sớm vì thọ phàm nhân ngắn.",
);
BUILDS.find((x) => x.k === "he_am").core.push(
  "Ám là hệ biến dị gốc Thủy (Kim sinh Thủy, Thủy sinh Mộc): món Ám ngồi được ô Thủy và nối chuỗi với Kim, Mộc.",
);
BUILDS.find((x) => x.k === "he_am").core.push(
  "Thể chất hợp: {tc:the_chat.cuu_u} — dồn chiêu Ám; lôi hỏa đánh vào thân này đau gấp bội nên tránh kẻ địch hệ Lôi.",
);
/* Bản đầy đủ của danh sách hướng (trước khi lọc theo dữ liệu game). hbScanBuilds dựng lại BUILDS từ đây mỗi lần quét: hướng thiếu đồ bị ẩn (HB_DROP), hướng game thêm mới được nối vào. */
const BUILDS_FULL = BUILDS.slice();
const HB_DROP = [];
// ═════════════ BẢN 2.6: Hướng build ↔ Kinh mạch · mô tả thể chất đọc thẳng từ kho dữ liệu game ═════════════
// Ưu tiên dữ liệu game đang chạy (C().theChat); thiếu thì dùng THE_CHAT_DB đóng gói sẵn. Số liệu không gõ cứng trong chữ.
function tcMap() {
  const out = {};
  try {
    for (const k of Object.keys(THE_CHAT_DB)) out[k] = THE_CHAT_DB[k];
  } catch (e) {}
  try {
    const live = C().theChat;
    if (live) {
      const ents =
        typeof live.entries === "function"
          ? [...live.entries()]
          : Object.entries(live);
      for (const [k, v] of ents)
        if (v && typeof v === "object" && v.ten)
          out[k] = { ...(out[k] || {}), ...v };
    }
  } catch (e) {}
  return out;
}
const TC_NHAN = {
  khi_huyet: "Khí huyết",
  hoan_my_khi_huyet: "Khí huyết hoàn mỹ",
  ho_the: "Hộ thể",
  ho_the_tran: "Hộ thể trong trận",
  the_uy_luc: "Uy lực thể tu",
  kiem_uy_luc: "Kiếm uy lực",
  duoc_khang: "Kháng dược",
  dan_tran: "Đan hồi trong trận",
  toc_do: "Tốc độ",
  khang_doc: "Kháng độc",
  khang_hoa: "Kháng lửa",
  khang_bang: "Kháng băng",
  khang_hieu_ung: "Kháng hiệu ứng",
  doc_uy_luc: "Uy lực độc",
};
const tcSgn = (v) =>
  (v >= 0 ? "+" : "-") +
  String(Math.round(Math.abs(v) * 1000) / 10).replace(".", ",") +
  "%";
function tcBuff(t) {
  const d = t && t.dac_tinh;
  if (!d || !Object.keys(d).length)
    return (t && t.buff) || "Không có buff đặc thù";
  const out = [];
  for (const [k, v] of Object.entries(d)) {
    if (k === "uy_luc_he" && v && typeof v === "object") {
      for (const [h, x] of Object.entries(v))
        out.push("Uy lực " + heTen(h) + " " + tcSgn(x));
    } else if (k === "ep_bang")
      out.push("Ép " + Math.round(v * 100) + "% Băng");
    else if (k === "ep_am")
      out.push("Ép " + Math.round(v * 100) + "% Ám");
    else if (k === "doc_tang")
      out.push("Giữ thêm " + v + " bản độc phát tác");
    else if (k === "doc_duong")
      out.push(
        "Dưỡng độc: hồi " + Math.round(v * 100) + "% độc phát tác",
      );
    else if (k === "doat_sinh")
      out.push("Đoạt sinh " + Math.round(v * 100) + "%");
    else if (k === "than_am") {
      if (v) out.push("Thân âm khí (chịu đòn như Thủy, Lôi đánh ×1,3)");
    } else if (k === "phan_phe")
      out.push("Phản phệ " + Math.round(v * 100) + "%");
    else if (k === "tho_pham_nhan") out.push("Thọ phàm nhân " + v);
    else if (k === "kinh_lo_toi_da") out.push("Kinh lộ tối đa " + v);
    else if (typeof v === "number")
      out.push((TC_NHAN[k] || k) + " " + tcSgn(v));
  }
  return out.join(" · ");
}
// Ô dùng được và số huyệt khiếu đọc từ khuôn kinh mạch (chữ b–f = huyệt khiếu, "." = ô trống).
function tcShape(t) {
  const toks = String((t && t.khuon) || "")
    .trim()
    .split("\n")
    .flatMap((r) => r.trim().split(/\s+/))
    .filter(Boolean);
  const cells = toks.filter((x) => x !== ".");
  return {
    o: cells.length,
    huyet: cells.filter((x) => /^[b-f]$/.test(x)).length,
  };
}
const tcTen = (k) => {
  const t = tcMap()[k];
  return t ? t.ten : k;
};
const tcPP = (k) => {
  const t = tcMap()[k];
  const v = t && t.dac_tinh && t.dac_tinh.phan_phe;
  return v == null ? "?" : "×" + num(v, 2);
};
// {tc:khóa} = tên + buff · {tcn:khóa} = chỉ tên · {pp:khóa} = hệ số phản phệ
function resolveTC(str) {
  if (typeof str !== "string" || str.indexOf("{") < 0) return str;
  const M = tcMap();
  return str.replace(/\{(tc|tcn|pp):([\w.]+)\}/g, (_, kind, key) => {
    const t = M[key];
    if (!t) return key;
    if (kind === "pp") return tcPP(key);
    if (kind === "tcn") return "<b>" + esc(t.ten) + "</b>";
    return "<b>" + esc(t.ten) + "</b> (" + esc(tcBuff(t)) + ")";
  });
}
const BUILD_TC = {
  kiem: ["the_chat.kiem_cot"],
  the: ["the_chat.thiet_cot", "the_chat.huyen_vu", "the_chat.hoang_co"],
  thi: ["the_chat.am_hon"],
  quy: ["the_chat.am_hon", "the_chat.cuu_u"],
  ma: ["the_chat.huyen_vu", "the_chat.hoang_co"],
  doc: ["the_chat.van_doc", "the_chat.huyen_vu", "the_chat.hoang_co"],
  he_hoa: ["the_chat.liet_duong"],
  he_bang: ["the_chat.cuu_am"],
  he_am: ["the_chat.cuu_u"],
};
const BUILD_TC_TRANH = {
  ma: ["the_chat.liet_duong"],
  doc: ["the_chat.liet_duong"],
  hop_hoan: ["the_chat.liet_duong"],
  thi: ["the_chat.liet_duong"],
  quy: ["the_chat.liet_duong"],
};
const TA_DAO_KM =
  "Luật tà đạo: mảnh tà chiếm ≥ 1/3 số ô đang thông thì lưới ngả tà; nên chọn hướng xếp <b>Ma Tu · Tương Khắc</b> (tà công cần kề món khắc mới vận hành, điểm nghịch chỉ bị tính nhẹ hơn).";
const BUILD_KM = {
  kiem: [
    "Đặt pháp khí kiếm lên huyệt (huyệt phủ 1 ô ×2, mỗi huyệt thêm +0,25) và ở cuối chuỗi kinh lộ: đan điền → các tâm pháp Kim nối liền → kiếm. Mỗi công pháp cùng họ hệ trong chuỗi +10% (tối đa 5; Kiếm Cốt tối đa 7).",
    "Giữ chuỗi toàn hệ Kim hoặc hệ sinh Kim (Thổ sinh Kim): món kề nhau tương sinh +15%, tương khắc −15%.",
    "Bộ 2 · Đánh: kiếm chính và chiêu công trên huyệt. Bộ 1 · Tu luyện: giữ tâm pháp tu luyện để bế quan.",
  ],
  the: [
    "Việc đầu tiên: tâm pháp luyện thể (nhãn thể) phải thông — chạm đan điền hoặc nối chuỗi. Không thông thì đồ thể tu chỉ như món thường.",
    "Khí huyết, hộ thể, căn cốt nhân hệ số màu ô: đặt đồ tăng chỉ số lên ô đúng màu (tối đa ×1,3). Riêng tốc độ tu luyện / đột phá / kháng tâm ma chỉ cần thông.",
    "Bộ 2 · Đánh: dồn đồ thể tu lên huyệt. {tcn:the_chat.hoang_co} và {tcn:the_chat.huyen_vu} gần như không có huyệt khiếu, nên trông vào màu ô và số món thay vì huyệt.",
  ],
  phat: [
    "Đồ Phật nhiều kháng tâm ma: đặt tâm pháp lên chuỗi thông (kháng tâm ma không nhân hệ số, chỉ cần thông); dành huyệt cho chiêu thủ và khống chế.",
    "Bộ 1 · Tu luyện khi bế quan, đột phá để tâm ma thấp; bộ 2 · Đánh mới đưa chiêu khống chế lên huyệt.",
  ],
  ma: [
    TA_DAO_KM,
    "Giữ nguyên lưới đủ 5/5/10/20/40/60 năm (Phàm Nhân → Hóa Thần) thì đạo cơ mới đổi sang tà; đổi lưới giữa chừng là mất số năm đã dồn.",
    "Điểm nghịch vẫn trừ 3% tỉ lệ đột phá mỗi điểm (tối đa −15%) và gây phản phệ — xem lại điểm nghịch sau khi xếp.",
  ],
  doc: [
    "Công pháp triệu trùng phải thông trên kinh mạch thì mới mở ô ngự linh (ô thú, trùng, khôi lỗi, thi, hồn tối đa 3).",
    TA_DAO_KM,
  ],
  hop_hoan: [
    "Công pháp hợp hoan phải đang thông (đang vận hành) thì mới song tu được.",
    TA_DAO_KM,
  ],
  thi: [
    "Công pháp triệu thi phải thông trên kinh mạch thì mới mở ô ngự linh (tối đa 3 ô).",
    TA_DAO_KM,
  ],
  quy: [
    "Tâm pháp quỷ (Dưỡng Hồn, Dưỡng Quỷ, Bách Quỷ…) phải thông thì mới mở 1–2 ô hồn (tối đa 3 ô ngự linh).",
    TA_DAO_KM,
  ],
  ngu_thu: [
    "Mọi người đều có sẵn 1 ô linh thú; công pháp ngự thú phải thông trên kinh mạch thì mới mở thêm ô (tối đa 3). Tháo công pháp thì ô đóng, con về túi.",
  ],
  khoi_loi: [
    "Công pháp khôi lỗi (Nhiếp Hạch Thuật…) phải thông trên kinh mạch thì mới mở ô khôi lỗi (tối đa 3 ô ngự linh).",
  ],
};
/* ═════ BẢN 6.14: PHƯƠNG ÁN HƯỚNG BUILD (đối chiếu content game v8.8) ═════ */
const BUILD_PLAN = {
  kiem: {
    sum: "",
    opts: [
      [
        "A · Kim Thuần",
        "Ô Kim ×1,3, chuỗi kinh lộ cùng hệ tới kiếm cuối.",
        "Tâm pháp kiếm rất ít, phải mượn tâm pháp chung.",
      ],
      [
        "B · Kim + Thổ Nền",
        "Thổ sinh Kim: tâm pháp Thổ đặt đầu chuỗi, +15% cặp sinh, thân bền hơn.",
        "Chia tài nguyên cho hai hệ.",
      ],
      [
        "C · Kiếm Hàn (Kim + Băng / Ám)",
        "Băng và Ám cùng gốc Thủy nên ngồi được ô Kim lẫn ô Thủy; Kim sinh Thủy nên cặp kề nhau +15%; chiêu lạ, ít bị đọc bài.",
        "Mỗi hệ phụ chỉ có vài món, dễ thiếu chiêu khi lên cảnh giới.",
      ],
    ],
    pick: "A, lấy tâm pháp Thổ làm gốc chuỗi (nửa B). Chỉ sang C khi gặp kiếm Băng hoặc Ám phẩm cao.",
  },
  the: {
    sum: "",
    opts: [
      [
        "A · Thổ Thuần",
        "Nhiều tâm pháp thể nhất, ô Thổ ×1,3, khí huyết dày; Hỏa sinh Thổ nên tâm pháp Hỏa vẫn đặt được.",
        "Sát thương chậm, cần chiêu công từ hệ khác.",
      ],
      [
        "B · Kim Thể (Kim + Thổ)",
        "Thổ sinh Kim: công tăng mà vẫn có thân thể.",
        "Gặp Thạch Bì hoặc Phản Chấn thì cụt đòn.",
      ],
      [
        "C · Thể + Pháp Thuật",
        "Đổi sang pháp thuật khi gặp địch Thạch Bì.",
        "Phân tán, bỏ phí chỉ số căn cốt.",
      ],
    ],
    pick: "A đến Kết Đan, rồi thêm vài chiêu Kim của B làm đòn chủ lực.",
  },
  phat: {
    sum: "",
    opts: [
      [
        "A · Kim Cương (Kim + Thổ)",
        "Phòng thủ và kháng tâm ma cao; Kim Cương Bất Hoại Thân (Kim, Kết Đan) là mảnh chốt.",
        "Giết chậm, dễ bị hết giờ khi đánh chiến dài.",
      ],
      [
        "B · Phật Nộ (Kim + Hỏa)",
        "Hỏa cho thêm chiêu công, tiêu diệt nhanh.",
        "Hỏa khắc Kim: đặt kề nhau bị −15%.",
      ],
      [
        "C · Vô Sắc Làm Nền",
        "Món Vô Sắc luôn ×1,075 trên mọi ô màu.",
        "Mất bonus ×1,3.",
      ],
    ],
    pick: "A; chỉ thêm B khi đã có mảnh Hỏa phẩm cao và đặt cách ô Kim.",
  },
  ma: {
    sum: "",
    opts: [
      [
        "A · Huyết Hỏa (Hỏa + Mộc)",
        "Mộc sinh Hỏa nối chuỗi; Hỏa nhiều chiêu công nhất.",
        "Mộc ít chiêu tà; Hỏa chạm Kim bị khắc.",
      ],
      [
        "B · Vô Sắc Ma Công",
        "Không bị khắc, ×1,075 mọi ô; hợp lúc ô lệch màu.",
        "Không bao giờ chạm ×1,3.",
      ],
      [
        "C · Nghịch Mạch",
        "Món nhãn Nghịch có sớm (Luyện Khí đến Kết Đan), mạnh nhanh.",
        "Chỉ vài món, hụt khi lên cảnh giới cao.",
      ],
    ],
    pick: "A, chèn 1–2 món Vô Sắc ở ô lệch màu; dùng C làm đòn mở đầu.",
  },
  doc: {
    sum: "",
    opts: [
      [
        "A · Mộc Độc",
        "Mộc ×1,3, nhiều món nhất; Thủy sinh Mộc nên mảnh Thủy đặt trước.",
        "Kim khắc Mộc: tránh đặt đồ Kim kề món Mộc (−15%).",
      ],
      [
        "B · Thủy Độc",
        "Thủy dễ ngồi hai loại ô (Thủy và Mộc).",
        "Chiêu độc ít hơn.",
      ],
      [
        "C · Độc + Cổ Trùng",
        "Nuôi cổ tăng sát thương theo ma niệm; hợp Vạn Độc Thể.",
        "Cần công pháp triệu trùng chiếm ô.",
      ],
    ],
    pick: "A với Thủy làm hệ phụ nối chuỗi.",
  },
  hop_hoan: {
    sum: "",
    opts: [
      [
        "A · Khống Chế Thuần",
        "Dựa vào chiêu khống chế (hướng này nhiều khống chế nhất), địch ít cơ hội ra tay.",
        "Giết chậm, cần phù hoặc trận hỗ trợ.",
      ],
      [
        "B · Hợp Hoan + Mộc Độc",
        "Mộc cho thêm độc gây dần.",
        "Hai bộ tà chồng chéo ma niệm.",
      ],
      [
        "C · Hợp Hoan + Phù",
        "Phù chen sát thương khi khống.",
        "Cần nghề Chế Phù.",
      ],
    ],
    pick: "A + 1 chiêu độc (B).",
  },
  thi: {
    sum: "",
    opts: [
      [
        "A · Thi Khôi Chủ Lực",
        "Thi khôi đánh thay, bạn lo hỗ trợ.",
        "Cần công pháp triệu thi mở ô.",
      ],
      [
        "B · Thi + Thổ Thể",
        "Thổ có tâm pháp thể nên chắc người.",
        "Thiếu chiêu công của chính bạn.",
      ],
    ],
    pick: "A, tâm pháp mượn từ nhóm thể. Thể chất Âm Hồn giữ thêm 1 thi khôi.",
  },
  quy: {
    sum: "",
    opts: [
      [
        "A · Quỷ Hồn Chủ Lực",
        "Hồn tốn ít ngự lực với Âm Hồn Thể.",
        "Nặng nghi thức Luyện Hồn.",
      ],
      [
        "B · Quỷ + Thủy",
        "Thủy dễ nối ô và hợp Liễm Tức giấu ma khí.",
        "Công thấp.",
      ],
      [
        "C · Quỷ + Ám",
        "Ám gốc Thủy nên nối chuỗi như B; Cửu U Thể tăng chiêu Ám và đoạt sinh.",
        "Kho Ám mới, ít món cho tà đạo; Lôi đánh vào thân Cửu U đau gấp bội.",
      ],
    ],
    pick: "A nếu có Âm Hồn Thể; có Cửu U Thể thì C; còn lại B.",
  },
  ngu_thu: {
    sum: "",
    opts: [
      [
        "A · Mộc Thuần",
        "Ô Mộc ×1,3, đồ Ngự Thú nhiều nhất hệ Mộc, rồi Thổ.",
        "Kinh mạch bạn yếu, thú chịu mọi sát thương.",
      ],
      [
        "B · Thổ Bền",
        "Thổ cho tâm pháp thể, giữ bạn sống để thú ra đòn.",
        "Công của bạn thấp.",
      ],
    ],
    pick: "A ghép hướng Mộc Tu; chiêu công mượn từ hệ khác.",
  },
  khoi_loi: {
    sum: "",
    opts: [
      [
        "A · Kim Thổ Khôi",
        "Đồ khôi lỗi phần lớn hệ Kim và Thổ; Thổ sinh Kim nên chuỗi tâm pháp nối tự nhiên.",
        "Hỏa khắc Kim, Mộc khắc Thổ: đồ Hỏa hoặc Mộc kề đồ Kim, Thổ bị −15%.",
      ],
      [
        "B · Khôi Lỗi + Mộc",
        "Có vài món Mộc làm hệ phụ, Mộc không khắc Kim nhưng khắc Thổ nên tách khỏi ô Thổ.",
        "Kho Mộc nhỏ, dễ thiếu chiêu.",
      ],
    ],
    pick: "A ghép Kim Tu hoặc Thể Tu để bạn có thêm chiêu công của chính mình.",
  },
};
function elemPlan(b) {
  const h = b.elem,
    g = gocHe(h),
    me = sinhBoi(g),
    con = sinhRa(g),
    kh = khacBoi(g),
    ban = hbElemBan(h)
      .map((k) => (BUILDS.find((x) => x.k === k) || {}).ten)
      .filter(Boolean)
      .join(" · "),
    nEl = hbElemN(h);
  const dd = oDungDuoc(g).map(heTen).join(" · ");
  return {
    sum:
      nEl +
      " món mang hệ " +
      heTen(h) +
      (nEl < 35 ? " (kho nhỏ, nên chọn cả hệ cùng gốc)" : "") +
      ". Ô " +
      heTen(g) +
      " dùng được: " +
      dd +
      "." +
      (ban ? " Ghép tốt: " + ban + "." : ""),
    opts: [
      [
        "A · " + heTen(h) + " Thuần",
        "Ô " + heTen(g) + " ×1,3, ít lỗi sinh khắc.",
        "Kho đồ hẹp, dễ thiếu chiêu.",
      ],
      [
        "B · Chuỗi Sinh (" + heTen(me) + " → " + heTen(g) + ")",
        heTen(me) +
          " sinh " +
          heTen(g) +
          ": đặt " +
          heTen(me) +
          " gần đan điền nối tới món chính, +15% mỗi cặp sinh.",
        "Phải gom thêm đồ " + heTen(me) + ".",
      ],
      [
        "C · Tiết Hệ (" + heTen(g) + " → " + heTen(con) + ")",
        "Thêm đồ " +
          heTen(con) +
          " làm chiêu phụ khi thiếu đồ " +
          heTen(h) +
          ".",
        "Chạm " + heTen(kh) + " ở sau chuỗi bị khắc −15%.",
      ],
    ],
    pick:
      "B nếu có ≥ 2 món " +
      heTen(me) +
      " phẩm tương đương; còn không thì A.",
  };
}
const HB_NOTE = {};
function planOf(b) {
  const p = BUILD_PLAN[b.k] || (b.elem ? elemPlan(b) : null);
  if (!p) return null;
  if (b.elem) return p;
  let sum = hbSumLine(b);
  const h0 = (b.he || []).find((h) => h !== "vo_sac");
  if (h0)
    sum +=
      " Ô " +
      heTen(gocHe(h0)) +
      " dùng được: " +
      oDungDuoc(gocHe(h0)).map(heTen).join(", ") +
      ".";
  if (b.k === "ma") {
    let ng = 0;
    for (const it of C().items.values())
      if (
        isKmItem(it) &&
        !it.theo_kiep &&
        (it.tag || []).includes("nghich")
      )
        ng++;
    if (ng) sum += " Có " + ng + " món nhãn Nghịch.";
  }
  return Object.assign({}, p, {
    sum:
      sum +
      (HB_NOTE[b.k] || "") +
      (b.thin
        ? " ⚠ Kho kinh mạch mỏng (" +
          b.thin +
          "): lực chiến của hướng này nằm ở nghi thức, linh vật và đồ mượn từ hướng khác."
        : ""),
  });
}
const HE_CLS = {
  kim: "#d4af37",
  moc: "#3fb86a",
  thuy: "#3b82f6",
  hoa: "#ef4444",
  tho: "#a16207",
  bang: "#22d3ee",
  loi: "#a78bfa",
  phong: "#2dd4bf",
  am: "#8b5cf6",
  vo_sac: "#94a3b8",
};
const heChip = (h) =>
  `<span class="hc" style="--hc:${HE_CLS[h] || "#94a3b8"}">${esc(heTen(h))}</span>`;
function planHtml(b) {
  const p = planOf(b);
  if (!p) return "";
  return (
    `<div class="pl"><b>Phương án (dữ liệu v8.8)</b><div class="vk-mu" style="font-size:12.5px;margin:2px 0 6px">${esc(p.sum)}</div>` +
    p.opts
      .map(
        (o) =>
          `<div class="pl-o"><b>${esc(o[0])}</b><div><span class="vk-ok">✔</span> ${esc(o[1])}</div><div><span class="vk-bad">✘</span> ${esc(o[2])}</div></div>`,
      )
      .join("") +
    `<div class="pl-pick">★ Nghiêng về: ${esc(p.pick)}</div></div>`
  );
}
function oHopHtml(b) {
  const rows = ["kim", "moc", "thuy", "hoa", "tho"]
    .map(
      (c) =>
        `<div class="vk-row"><span>Ô ${heChip(c)}</span><span class="hcs">${oDungDuoc(c).map(heChip).join("")}</span></div>`,
    )
    .join("");
  return `<details class="vk-card" style="margin:10px 0 0"><summary><b>Ô màu nào dùng được hệ nào</b></summary>${rows}<div class="vk-mu" style="font-size:12px;margin-top:6px">Ưu tiên: đúng hệ (1) &gt; cùng gốc (0,75) &gt; sinh / được sinh (0,5); lệch hẳn bị trừ điểm. Lưu ý: hệ số màu game chỉ tính ×1,3 (đúng hệ), ×1,075 (cùng gốc hoặc món Vô Sắc), ×0,85 (khác). Phần nới theo sinh khắc là ưu tiên của Tool; số liệu thật luôn do hàm tính của game xác nhận.</div></details>`;
}
function kmTips(b) {
  if (BUILD_KM[b.k]) return BUILD_KM[b.k];
  if (!b.elem) return [];
  const h = b.elem,
    me = sinhBoi(h);
  const t = [
    'Bật \"Ưu tiên theo hệ linh căn & huyệt đạo\" và chọn hướng <b>Tiên Tu · Tương Sinh</b>: ô đúng màu ' +
      heTen(h) +
      " cho hệ số tối đa ×1,3, món kề nhau tương sinh +15%.",
  ];
  if (me)
    t.push(
      "Chọn hệ phụ là " +
        heTen(me) +
        " (" +
        heTen(me) +
        " sinh " +
        heTen(h) +
        ") để nối chuỗi từ đan điền tới món chính.",
    );
  t.push(
    "Ô " +
      heTen(gocHe(h)) +
      " dùng được: " +
      oDungDuoc(gocHe(h)).map(heTen).join(", ") +
      " (đúng hệ ×1 > cùng gốc ×0,5; tương sinh với ô game không tính).",
  );
  return t;
}
function buildMatch(b, it) {
  if (b.elem) return (it.he || []).includes(b.elem);
  return schoolsOf(it).includes(b.k);
}
function itemGroup(it) {
  if (it.loai === "cong_phap" || it.loai === "phap_khi") {
    if (it.ngu_linh && !it.chieu) return "ngulinh";
    if (!it.chieu) return it.loai === "cong_phap" ? "tam" : "bd";
    const d = it.chieu.dang;
    return d === "cong" ? "cong" : d === "khong_che" ? "kc" : "thu";
  }
  if (it.loai === "tran_ban") return "tran";
  if (it.loai === "phu_luc") return "phu";
  if (it.loai === "trung_thu") return "trung";
  if (it.loai === "nguyen_lieu" && (it.tag || []).includes("khoi_loi"))
    return "dopho";
  if (it.loai === "di_hoa") return "dihoa";
  if (it.loai === "dung_cu") return "dungcu";
  return null;
}
const GROUP_TEN = {
  liemtuc: "Công pháp Liễm Tức (giấu ma khí khi vào đất chính đạo)",
  tam: "Tâm pháp (đặt cho thông, cộng tu luyện/chỉ số)",
  ngulinh: "Công pháp ngự linh (mở ô linh vật)",
  cong: "Chiêu công",
  kc: "Chiêu khống chế",
  thu: "Chiêu thủ / hồi",
  bd: "Pháp bảo bị động",
  trung: "Trứng linh thú",
  dopho: "Đồ phổ khôi lỗi",
  tran: "Trận bàn",
  phu: "Phù lục",
  dihoa: "Dị hỏa (trang bị)",
  dungcu: "Dụng cụ nghề",
};
const BUILD_EXTRA = {
  ngu_thu: ["trung"],
  khoi_loi: ["dopho"],
  ma: ["tran"],
  quy: ["tran"],
};

// ═════════════════════════ ĐÁNH GIÁ TƯƠNG THÍCH HƯỚNG BUILD (v7.5.0 TOÀN DIỆN) ═════════════════════════
// Phân tích sâu: Linh căn bản mệnh, Ngũ hành Tương sinh (Mẹ dưỡng / Con trợ), Tương khắc cảnh báo,
// Thể chất phù trợ vs Phản phệ, Kho đồ trong túi & bảo vật phẩm cao / trấn phái, Xếp hạng chuẩn S/A/B/C/D.
function buildFit(b, nv, R0) {
  const Cc = C();
  let s = 0;
  const why = [],
    pros = [],
    cons = [];
  let onKm = 0,
    inBag = 0,
    highTierBag = 0;
  for (const m of (nv.kinhMach && nv.kinhMach.manh) || []) {
    const it = Cc.items.get(m.item);
    if (it && buildMatch(b, it)) onKm++;
  }
  for (const [id, n] of Object.entries(nv.tuiDo || {})) {
    const it = Cc.items.get(id);
    if (
      n > 0 &&
      it &&
      (it.loai === "cong_phap" || it.loai === "phap_khi") &&
      buildMatch(b, it)
    ) {
      inBag++;
      if ((it.pham_cap || 1) >= 4 || it.tran_phai) highTierBag++;
    }
  }
  if (onKm) {
    s += 4 * onKm;
    why.push(`${onKm} món trên kinh mạch`);
  }
  if (inBag) {
    s += 1.5 * inBag;
    why.push(`${inBag} món trong túi`);
  }
  if (highTierBag) {
    s += 3.5 * highTierBag;
    pros.push(`${highTierBag} bảo vật phẩm cao/trấn phái`);
  }

  // 1. Linh căn tương tác (Bản mệnh / Tương sinh / Tương khắc)
  const lc = (nv.linhCan && nv.linhCan.he) || [];
  const bElems = b.he || (b.elem ? [b.elem] : []);
  const banMenh = bElems.filter((h) => lc.includes(h));
  if (banMenh.length) {
    s += 7 * banMenh.length;
    why.push("bản mệnh " + banMenh.map(heTen).join("/"));
    pros.push(
      "Linh căn bản mệnh " +
        banMenh.map(heTen).join("/") +
        " (ô đúng màu ×1,3 uy lực)",
    );
  }

  bElems.forEach((bh) => {
    const g = gocHe(bh),
      me = sinhBoi(g),
      con = sinhRa(g);
    if (me && lc.includes(me) && !banMenh.includes(bh)) {
      s += 3.5;
      why.push(heTen(me) + " sinh " + heTen(bh) + " (Mẹ dưỡng)");
      pros.push(
        "Linh căn " +
          heTen(me) +
          " tương sinh " +
          heTen(bh) +
          " (+15% cặp nối)",
      );
    }
    if (con && lc.includes(con) && !banMenh.includes(bh)) {
      s += 2;
      why.push(heTen(bh) + " sinh " + heTen(con) + " (Con trợ)");
    }
  });

  bElems.forEach((bh) => {
    const g = gocHe(bh),
      kh = khacBoi(g);
    if (kh && lc.includes(kh) && !banMenh.includes(bh)) {
      s -= 4;
      cons.push(
        "Khắc hệ: " +
          heTen(kh) +
          " khắc " +
          heTen(bh) +
          " (−15% nếu kề nhau)",
      );
    }
  });

  // 2. Thể chất phù hợp & phản phệ
  const tc = String(nv.theChat || "");
  const hopTC = (BUILD_TC[b.k] || []).filter((x) =>
    tc.includes(x.replace("the_chat.", "")),
  );
  if (hopTC.length) {
    s += 10;
    why.push("thể chất đắc đạo");
    pros.push(
      "Thể chất " +
        hopTC.map(tcTen).join(", ") +
        " kích hoạt tiềm năng tối đa",
    );
  }
  const trTC = (BUILD_TC_TRANH[b.k] || []).find((x) =>
    tc.includes(x.replace("the_chat.", "")),
  );
  if (trTC) {
    s -= 8;
    why.push(tcTen(trTC) + " phản phệ");
    cons.push(tcTen(trTC) + " phản phệ tà công " + tcPP(trTC));
  }

  // 3. Đạo cơ (Chính vs Tà)
  const isTa = HB_TA.includes(b.k);
  const isChinhDao = nv.daoCo && nv.daoCo.loai === "chinh";
  if (isTa && isChinhDao) {
    s -= 3;
    cons.push(
      "Đạo cơ Chính Đạo: cần giữ ≥1/3 mảnh tà nhiều năm để đổi sang tà",
    );
  }

  // 4. Xếp hạng (Tier)
  let tier = "C",
    badge = "Khả Dụng (C)",
    color = "#94a3b8";
  if (s >= 18) {
    tier = "S";
    badge = "⭐ Thiên Đạo Hợp Nhất (S)";
    color = "#f59e0b";
  } else if (s >= 10) {
    tier = "A";
    badge = "🌿 Đại Đạo Tương Sinh (A)";
    color = "#22c55e";
  } else if (s >= 4) {
    tier = "B";
    badge = "🔷 Tương Hợp (B)";
    color = "#3b82f6";
  } else if (s < 0) {
    tier = "D";
    badge = "⚠️ Xung Khắc / Nghịch Mệnh (D)";
    color = "#ef4444";
  }

  return {
    s,
    why,
    pros,
    cons,
    tier,
    badge,
    color,
    onKm,
    inBag,
    highTierBag,
  };
}

// Thẻ "Kinh mạch · <hướng build>" trong tab Hướng build
function kmCard(b, nv) {
  const M = tcMap(),
    cur = String(nv.theChat || "the_chat.pham_the"),
    Cc = C();
  const hop = (BUILD_TC[b.k] || []).filter((k) => M[k]),
    tranh = (BUILD_TC_TRANH[b.k] || []).filter((k) => M[k]);
  const line = (k, tag) => {
    const t = M[k],
      sh = tcShape(t);
    return `<li>${esc(t.icon || "")} <b>${esc(t.ten)}</b>${k === cur ? ' <span class=\"vk-ok\" style=\"font-size:12px\">đang dùng</span>' : ""}${tag ? ' <span class=\"vk-mu\" style=\"font-size:12px\">' + esc(tag) + "</span>" : ""}<br><span class=\"vk-mu\" style=\"font-size:12px\">${esc(tcBuff(t))}${sh.o ? ` · ${sh.o} ô dùng được · ${sh.huyet} huyệt khiếu` : ""}</span></li>`;
  };
  const fit = buildFit(b, nv, nv.canhGioi || 0);

  return `<div class=\"vk-card\"><h3>Kinh mạch · ${esc(b.ten)}</h3>
      <div style=\"display:flex;align-items:center;gap:8px;margin-bottom:6px;flex-wrap:wrap\">
<span style=\"display:inline-block;padding:2px 10px;border-radius:999px;font-weight:700;font-size:12.5px;background:${fit.color}22;color:${fit.color};border:1px solid ${fit.color}66\">${fit.badge}</span>
<span class=\"vk-mu\" style=\"font-size:13px\">Điểm tương thích: <b>${fit.s > 0 ? "+" : ""}${Math.round(fit.s)}đ</b></span>
      </div>
      <div class=\"vk-mu\" style=\"font-size:13px\">Đang xếp: <b>${fit.onKm}/${nv.kinhMach.manh.length}</b> món trên kinh mạch thuộc hướng này · <b>${fit.inBag}</b> món trong túi${fit.highTierBag ? ` (có <b style=\"color:#f59e0b\">${fit.highTierBag}</b> món phẩm cao/trấn phái)` : ""}.</div>
      ${fit.pros.length ? `<div style=\"margin-top:6px;font-size:13px;color:#22c55e\"><b>🌿 Thế mạnh:</b> ${esc(fit.pros.join(" · "))}</div>` : ""}
      ${fit.cons.length ? `<div style=\"margin-top:4px;font-size:13px;color:#ef4444\"><b>⚠️ Lưu ý:</b> ${esc(fit.cons.join(" · "))}</div>` : ""}
      ${hop.length ? `<div style=\"margin-top:8px\"><b>Thể chất hợp</b> <span class=\"vk-mu\" style=\"font-size:12px\">(đọc từ dữ liệu game)</span><ul style=\"margin:4px 0 0;padding-left:18px;font-size:14px\">${hop.map((k) => line(k)).join("")}</ul></div>` : '<div class=\"vk-mu\" style=\"font-size:13px;margin-top:8px\">Hướng này không đòi thể chất đặc thù: thể chất nào cũng chơi được, dồn vào đồ và cách xếp.</div>'}
      ${tranh.length ? `<div style=\"margin-top:8px\"><b>Nên tránh</b><ul style=\"margin:4px 0 0;padding-left:18px;font-size:14px\">${tranh.map((k) => line(k, "phản phệ " + tcPP(k))).join("")}</ul></div>` : ""}
      ${tranh.includes(cur) ? '<div style=\"color:#b45309;font-size:13px;margin-top:6px\">⚠️ Thể chất hiện tại của bạn thuộc nhóm nên tránh với hướng này.</div>' : ""}
      <div style=\"margin-top:8px\"><b>Cách xếp lên kinh mạch</b><ul style=\"margin:4px 0 0;padding-left:18px;font-size:14px\">${kmTips(
b,
      )
.map((x) => `<li>${resolveTC(x)}</li>`)
.join("")}</ul></div>${planHtml(b)}${oHopHtml(b)}</div>`;
}

// ═════════════════════════ HƯỚNG BUILD 6.9.0 ═════════════════════════
// Quét hướng build từ dữ liệu game · chọn theo Cảnh Giới, Phẩm, Nguyên Tố, Đặc Tính · xếp kinh mạch theo tỉ lệ Tâm Pháp : Chiến Pháp (mặc định 5 : 5).
// Phân loại đúng như game (hàm ye trong code game): Tâm Pháp = công pháp không có chiêu · Đấu Pháp = công pháp có chiêu · Pháp Khí = pháp khí có chiêu · Bảo Vật = pháp khí không có chiêu.
// Chủ động = có chiêu (Đấu Pháp, Pháp Khí). Bị động = không chiêu (Tâm Pháp, Bảo Vật). Chiến Pháp = Đấu Pháp + Pháp Khí + Bảo Vật.
const HB_CLS = {
  tam: "Tâm Pháp",
  dau: "Đấu Pháp",
  pk: "Pháp Khí",
  bv: "Bảo Vật",
};
const HB_ACT = {
  tam: "Bị Động",
  dau: "Chủ Động",
  pk: "Chủ Động",
  bv: "Bị Động",
};
const HB_PH = [
  "Phàm Phẩm",
  "Hoàng Phẩm",
  "Huyền Phẩm",
  "Địa Phẩm",
  "Thiên Phẩm",
  "Tiên Phẩm",
  "Thần Phẩm",
  "Nghịch Thiên",
];
const HB_RATIO = {
  64: ["6 : 4 (Nghiêng Tâm Pháp · Tự Cấp Chân Khí) [Khuyên Dùng]", 0.6],
  73: ["7 : 3 (Đại Tu Tâm Pháp · Tối Đa Tốc Tu & Chân Khí)", 0.7],
  55: ["5 : 5 (Cân Bằng Tiêu Chuẩn)", 0.5],
  46: ["4 : 6 (Nghiêng Chiến Pháp · Dồn Đòn Tấn Công)", 0.4],
  0: ["Không Ép Tỉ Lệ", null],
};
const HB_MAX_SKILLS = {
  3: [
    "2–3 Chiêu (Tinh Hoa · Tự Cung Chân Khí · Không Cắn Đan) [Khuyên Dùng]",
    3,
  ],
  4: ["3–4 Chiêu (Đa Năng · Công Thủ Toàn Diện)", 4],
  0: ["Không Giới Hạn (Tự Do)", 0],
};
const HB_MODE = {
  bal: "🎯 Cân Bằng (Chiến Đấu + Tu Luyện)",
  danh: "⚔️ Ưu Tiên Chiến Đấu (PvP / PvE Đi Ải)",
  tu: "🧘 Ưu Tiên Tu Luyện (AFK Treo Máy)",
  dot_pha: "⚡ Ưu Tiên Đột Phá Cảnh Giới",
  tank: "🛡️ Thể Tu Thiết Bích (Thủ Trâu · Phản Đòn)",
  burst: "🗡️ Kiếm Tu Bạo Kích (Nhất Kích Tất Sát)",
};
const HB_ITERS = [
  [800, "Nhanh"],
  [1500, "Vừa"],
  [3000, "Kỹ (Lâu)"],
];
const HB_PRESETS = [
  {
    id: "all",
    name: "🎯 Cân Bằng Chuẩn Mực",
    desc: "Tâm:Chiến 6:4, 2–3 chiêu tinh hoa, tự cấp chân khí không cắn đan, tu luyện + chiến đấu song toàn",
    mode: "bal",
    ratio: "64",
    maxSkills: "3",
    dt: "",
  },
  {
    id: "pvp",
    name: "⚔️ Chiến Đấu (PvP / PvE Đi Ải)",
    desc: "Tối đa sát thương vòng chiêu, khống chế, kháng tính, bảo toàn chân khí bền vững",
    mode: "danh",
    ratio: "64",
    maxSkills: "3",
    dt: "",
  },
  {
    id: "cultivate",
    name: "🧘 Tu Luyện (AFK Treo Máy)",
    desc: "Tối đa tốc độ hấp thụ linh khí & tu vi, dồn toàn bộ huyệt vị cho exp, thông chuỗi tương sinh",
    mode: "tu",
    ratio: "73",
    maxSkills: "0",
    dt: "toc_do",
  },
  {
    id: "breakthrough",
    name: "⚡ Đột Phá Cảnh Giới",
    desc: "Tối đa tỉ lệ đột phá thành công, triệt hạ tâm ma (0 điểm nghịch), hộ thể độ kiếp",
    mode: "dot_pha",
    ratio: "73",
    maxSkills: "3",
    dt: "dot_pha",
  },
  {
    id: "tank",
    name: "🛡️ Thể Tu Thiết Bích",
    desc: "Dày hộ thể 60%, khí huyết dồi dào, hồi máu, thủ hộ trường sinh phản kích",
    mode: "tank",
    ratio: "64",
    maxSkills: "3",
    dt: "ho_the",
  },
  {
    id: "burst",
    name: "🗡️ Kiếm Tu Bạo Kích",
    desc: "Định tuyến kinh lộ từ đan điền ra kiếm pháp khí, nhất kích tất sát",
    mode: "burst",
    ratio: "55",
    maxSkills: "3",
    dt: "ef.sunder",
  },
  {
    id: "control",
    name: "❄️ Khống Chế Phong Tỏa",
    desc: "Đóng băng, choáng, giảm tốc độ, khóa chết lượt hành động của địch",
    mode: "danh",
    ratio: "64",
    maxSkills: "3",
    dt: "dg.khong_che",
  },
  {
    id: "drain",
    name: "🩸 Ma Đạo Hút Huyết",
    desc: "Tối đa ma niệm, hút máu liên tục, bồi đắp độc và tà công ma hóa",
    mode: "danh",
    ratio: "64",
    maxSkills: "3",
    dt: "ma_hoa",
  },
];
const HB_RATIO_W = 22; // điểm trừ cho mỗi ô lệch khỏi tỉ lệ (1 trận mẫu thắng thêm ≈ 11 điểm)
const HB_MIN_ITEMS = 10; // hướng có ít hơn số món này (hoặc không có tâm pháp / không có chiêu) không đủ đồ để xếp kinh mạch
const HB_TA = ["ma", "doc", "hop_hoan", "thi", "quy"];
const HB_TR_TEN = {
  toc_do: "Tốc Độ Tu Luyện",
  dot_pha: "Đột Phá",
  khi_huyet: "Khí Huyết",
  ho_the: "Hộ Thể",
  khang_tam_ma: "Kháng Tâm Ma",
  an_tuc: "Ẩn Tức",
  "cs.than_phap": "Thân Pháp",
  "cs.than_thuc": "Thần Thức",
  "cs.dao_tam": "Đạo Tâm",
  "cs.can_cot": "Căn Cốt",
  "cs.ngo_tinh": "Ngộ Tính",
  "cs.khi_van": "Khí Vận",
  "ef.bleed": "Chảy Máu",
  "ef.poison": "Trúng Độc",
  "ef.burn": "Thiêu Đốt",
  "ef.chill": "Giá Lạnh",
  "ef.sunder": "Phá Giáp",
  "ef.haste": "Tăng Tốc",
  "ef.regen": "Hồi Dần",
  "ef.mark": "Ấn Ký",
  "ef.empower": "Cường Hóa",
  "dg.cong": "Chiêu Công",
  "dg.khong_che": "Chiêu Khống Chế",
  "dg.thu": "Chiêu Thủ",
  "dg.hoi_phuc": "Chiêu Hồi Phục",
  ma_hoa: "Ma Hóa",
};
const hbCls = (it) =>
  it.loai === "cong_phap"
    ? it.chieu
      ? "dau"
      : "tam"
    : it.chieu
      ? "pk"
      : "bv";
const hbCells = (it) =>
  (it.hinh || []).reduce(
    (a, r) => a + [...String(r)].filter((ch) => ch !== ".").length,
    0,
  );
const hbTrLabel = (k) =>
  HB_TR_TEN[k] ||
  tcWord(
    String(k)
      .replace(/^\w+\./, "")
      .replace(/_/g, " "),
  );
function hbTraits(it) {
  const t = new Set(),
    bd = it.bi_dong || {};
  for (const [k, v] of Object.entries(bd)) {
    if (k === "chi_so") {
      for (const s of Object.keys(v || {})) t.add("cs." + s);
    } else if (v) t.add(k);
  }
  const ch = it.chieu;
  if (ch) {
    t.add("dg." + ch.dang);
    for (const e of ch.effects || []) t.add("ef." + e.kind);
    if (ch.ma_hoa) t.add("ma_hoa");
  }
  return t;
}

// ── 1) Quét và cập nhật các hướng build từ dữ liệu game đang chạy (Có Cache O(1) theo bộ dữ liệu game)
let _hbScannedItemsCount = -1;
function hbScanBuilds() {
  const Cc = C();
  if (_hbScannedItemsCount === Cc.items.size && BUILDS.length === BUILDS_FULL.length) {
    return [];
  }
  _hbScannedItemsCount = Cc.items.size;
  const items = [...Cc.items.values()].filter(
      (it) => isKmItem(it) && !it.theo_kiep,
    );
  BUILDS.length = 0;
  BUILDS.push(...BUILDS_FULL);
  HB_DROP.length = 0;
  // Hệ nổi bật của một nhóm món: tối đa 2 hệ, hệ thứ hai phải chiếm ≥ 20% (Vô Sắc không phải nguyên tố nên không tính).
  const topHe = (arr) => {
    const m = {};
    arr.forEach((it) =>
      (it.he || []).forEach((h) => {
        if (h !== "vo_sac") m[h] = (m[h] || 0) + 1;
      }),
    );
    return Object.entries(m)
      .sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1))
      .slice(0, 2)
      .filter(([, n], i) => i === 0 || n >= arr.length * 0.2)
      .map((x) => x[0]);
  };
  // Danh sách hướng là 19 hướng cố định (10 lưu phái + 9 hệ); Tool không tự thêm hướng từ nhãn lạ và không ẩn hướng nào.
  for (const b of BUILDS) {
    b.thin = "";
    if (b.elem) continue;
    let tot = 0,
      tam = 0,
      chieu = 0;
    const arr = [];
    for (const it of items) {
      if (!buildMatch(b, it)) continue;
      tot++;
      arr.push(it);
      if (hbCls(it) === "tam") tam++;
      else if (it.chieu) chieu++;
    }
    if (arr.length >= HB_MIN_ITEMS) {
      const t = topHe(arr);
      if (t.length) b.he = t;
    }
    b.thin =
      tot < HB_MIN_ITEMS
        ? tot
          ? tot + " món"
          : "chưa có món nào"
        : !tam
          ? "không có tâm pháp"
          : !chieu
            ? "không có món có chiêu"
            : "";
  }
  return [];
}
/* Dòng tóm tắt số món của một hướng, đếm trực tiếp từ dữ liệu game (không gõ cứng số). */
function hbSumLine(b) {
  let tot = 0,
    cp = 0,
    pk = 0;
  const n = { tam: 0 },
    ch = { cong: 0, khong_che: 0, thu: 0 },
    he = {};
  for (const it of C().items.values()) {
    if (!isKmItem(it) || it.theo_kiep || !buildMatch(b, it)) continue;
    tot++;
    if (it.loai === "cong_phap") cp++;
    else pk++;
    if (hbCls(it) === "tam") n.tam++;
    if (it.chieu) {
      const d = it.chieu.dang;
      ch[
        d === "cong" ? "cong" : d === "khong_che" ? "khong_che" : "thu"
      ]++;
    }
    for (const h of it.he || []) he[h] = (he[h] || 0) + 1;
  }
  if (!tot) return "Chưa có món nào trong dữ liệu game.";
  const top = Object.entries(he)
    .sort((x, y) => y[1] - x[1])
    .slice(0, 3)
    .map(([h, k]) => heTen(h) + " " + k)
    .join(", ");
  return (
    tot +
    " món (" +
    cp +
    " công pháp, " +
    pk +
    " pháp khí): " +
    n.tam +
    " tâm pháp, " +
    ch.cong +
    " chiêu công, " +
    ch.khong_che +
    " khống chế, " +
    ch.thu +
    " thủ / hồi" +
    (top ? "; " + top : "") +
    "."
  );
}
const hbElemN = (h) => {
  let n = 0;
  for (const it of C().items.values())
    if (isKmItem(it) && !it.theo_kiep && (it.he || []).includes(h)) n++;
  return n;
};
// Hướng đáng ghép với một hệ: lưu phái có nhiều món mang hệ đó nhất (đếm từ dữ liệu game).
function hbElemBan(h) {
  const cnt = new Map();
  for (const it of C().items.values()) {
    if (!isKmItem(it) || it.theo_kiep || !(it.he || []).includes(h))
      continue;
    for (const k of schoolsOf(it)) cnt.set(k, (cnt.get(k) || 0) + 1);
  }
  return [...cnt.entries()]
    .filter(
      ([k, n]) => n >= 2 && BUILDS.some((b) => b.k === k && !b.elem),
    )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([k]) => k);
}
// Số món theo nhóm của từng hướng (Có Cache theo cảnh giới R & số vật phẩm game)
const _hbCatalogCache = new Map();
function hbCatalog(R) {
  const cacheKey = `${R}_${C().items.size}`;
  if (_hbCatalogCache.has(cacheKey)) return _hbCatalogCache.get(cacheKey);
  const out = new Map();
  for (const b of BUILDS)
    out.set(b.k, {
      n: { tam: 0, dau: 0, pk: 0, bv: 0 },
      tot: 0,
      ok: { tam: 0, chien: 0 },
      phMin: 9,
      phMax: 0,
    });
  for (const it of C().items.values()) {
    if (!isKmItem(it) || it.theo_kiep) continue;
    const cls = hbCls(it),
      cg = it.canh_gioi ?? 0,
      ph = it.pham_cap || 1;
    for (const b of BUILDS) {
      if (!buildMatch(b, it)) continue;
      const s = out.get(b.k);
      s.n[cls]++;
      s.tot++;
      s.phMin = Math.min(s.phMin, ph);
      s.phMax = Math.max(s.phMax, ph);
      if (cg <= R) s.ok[cls === "tam" ? "tam" : "chien"]++;
    }
  }
  _hbCatalogCache.set(cacheKey, out);
  return out;
}

// ── 2) Chọn đồ theo hướng, cảnh giới, phẩm, nguyên tố, đặc tính
function hbMatch(b, it, fallback) {
  const sch = schoolsOf(it),
    isTa =
      sch.some((s) => HB_TA.includes(s)) ||
      (it.tag || []).includes("nghich"),
    taB = b.nhom === "Tà đạo";
  if (!taB && (isTa || (it.tag || []).includes("liem_tuc")))
    return null; // mảnh tà làm lưới ngả tà: hướng chính đạo không lấy
  const fam = buildMatch(b, it),
    hs = it.he || [];
  let w;
  if (b.elem) {
    if (fam) w = 2.2;
    else {
      const parent = sinhBoi(b.elem),
        child = sinhRa(b.elem);
      if (parent && hs.some((h) => gocHe(h) === parent)) w = 1.2;
      else if (child && hs.some((h) => gocHe(h) === child)) w = 0.95;
      else if (!hs.length || hs.every((h) => h === "vo_sac")) w = 0.75;
      else if (fallback) w = 0.35;
      else return null;
    }
  } else {
    w = fam ? 2.2 : sch.length && !sch.includes(b.k) ? 0.45 : 1;
    if ((b.he || []).some((h) => hs.includes(h))) w *= 1.25;
    if (!fam && fallback && w < 0.5) w = 0.5;
  }
  return { w, fam };
}
const hbHeOK = (it, F) =>
  !F.he ||
  (it.he || []).includes(F.he) ||
  (F.vo && (it.he || []).every((h) => h === "vo_sac"));
function hbVal(it, R, w, F) {
  let fit = 1;
  try {
    if (S.core && S.core.gradeMult) fit = S.core.gradeMult(it, R);
  } catch (e) {
    fit = 1;
  }
  if (!(fit > 0)) fit = 0.1;
  const bd = it.bi_dong || {},
    ch = it.chieu;
  // 7.11.1: Khống chế điểm hộ thể không quá 30% từ 1 món đơn lẻ (tránh dồn thừa trần 60%)
  const htVal = Math.min(0.3, bd.ho_the || 0);
  let v =
    14 * (it.linh_luc || 0) +
    120 * (bd.toc_do || 0) +
    120 * (bd.dot_pha || 0) +
    50 * (bd.khi_huyet || 0) +
    40 * htVal +
    40 * (bd.khang_tam_ma || 0) +
    10 * (bd.an_tuc || 0);
  for (const x of Object.values(bd.chi_so || {})) v += 5 * (+x || 0);
  // 6.19: chiêu của món đã chạm trần pháp lực chỉ còn phần kẹp; món phẩm bằng cảnh giới được cộng nhẹ (cả tâm pháp lẫn chiến pháp).
  let capF = 1,
    tier = 1;
  try {
    const K = S.core;
    if (K && K.skillCap && K.spellPower) {
      const base = K.spellPower(R, (F && F.st) || 0),
        nxt = K.spellPower(R + 1, 0),
        hb = K.skillCap(it);
      if (base > 0 && hb !== Infinity && hb > 0) {
        capF = Math.min(1, hb / base);
        if (
          Number.isFinite(nxt) &&
          Math.abs(hb - nxt) < 1e-6 * Math.max(1, nxt)
        )
          tier = 1.12;
      }
    }
  } catch (e) {
    capF = 1;
    tier = 1;
  }
  if (ch)
    v +=
      (40 *
        (ch.uy || 0) *
        (ch.dang === "cong"
          ? 1
          : ch.dang === "khong_che"
            ? 0.8
            : 0.65) +
        6 * (ch.effects || []).length) *
        Math.max(0.05, capF) +
      4 * (it.pham_cap || 1);
  v *= fit * w * tier;

  // Trọng số theo Meta Preset
  const pre = F && F.preset;
  if (pre === "burst") {
    if (ch && ch.dang === "cong") v *= 1.75;
    if (
      ch &&
      (ch.effects || []).some((e) =>
        ["sunder", "bleed", "burn", "empower"].includes(e.kind),
      )
    )
      v *= 1.45;
  } else if (pre === "tank") {
    if (bd.khi_huyet) v *= 1.8;
    if (bd.ho_the) v *= 1.35;
    if (ch && (ch.dang === "thu" || ch.dang === "hoi_phuc")) v *= 1.75;
  } else if (pre === "speed") {
    if (bd.toc_do || bd.dot_pha) v *= 2.2;
    if (bd.khang_tam_ma || it.linh_luc) v *= 1.5;
  } else if (pre === "control") {
    if (ch && ch.dang === "khong_che") v *= 2.1;
    if (
      ch &&
      (ch.effects || []).some((e) =>
        ["chill", "haste"].includes(e.kind),
      )
    )
      v *= 1.6;
  } else if (pre === "drain") {
    if (
      (ch && ch.ma_hoa) ||
      (ch &&
        (ch.effects || []).some((e) =>
          ["poison", "bleed"].includes(e.kind),
        ))
    )
      v *= 1.9;
  }

  if (F.dt && hbTraits(it).has(F.dt)) v *= 3;
  return v;
}
function hbSelect(b, R, F, nvReal) {
  const all = [],
    skip = { realm: 0, pham: 0, he: 0, huong: 0, own: 0 },
    traits = new Map();
  const isOwn = F.src === "own";
  for (const it of C().items.values()) {
    if (!isKmItem(it) || it.theo_kiep) continue;
    if ((it.canh_gioi ?? 0) > R) {
      skip.realm++;
      continue;
    }
    const ph = it.pham_cap || 1;
    if (ph < F.phMin || ph > F.phMax) {
      skip.pham++;
      continue;
    }
    if (!hbHeOK(it, F)) {
      skip.he++;
      continue;
    }
    const have = (nvReal.tuiDo[it.id] || 0) > 0;
    if (isOwn && !have) {
      skip.own++;
      continue;
    }
    const m = hbMatch(b, it, isOwn);
    if (!m) {
      skip.huong++;
      continue;
    }
    const cls = hbCls(it),
      cells = hbCells(it) || 1,
      val = hbVal(it, R, m.w, F);
    for (const tr of hbTraits(it))
      traits.set(tr, (traits.get(tr) || 0) + 1);
    all.push({
      it,
      cls,
      cells,
      val,
      dens: val / cells,
      fam: m.fam,
      have,
    });
  }
  const by = { tam: [], dau: [], pk: [], bv: [] };
  for (const x of all) by[x.cls].push(x);
  for (const k of Object.keys(by))
    by[k].sort((a, c) => c.dens - a.dens);
  return { all, by, skip, traits };
}
// Phép tính ô: B ô thông (không tính đan điền) chia theo tỉ lệ t cho Tâm Pháp, phần còn lại cho Chiến Pháp (Đấu Pháp + Pháp Khí + Bảo Vật).
function hbPlan(sel, B, t) {
  const T = t == null ? 0.5 : t,
    tamB = Math.round(B * T),
    chB = Math.max(0, B - tamB);
  const fill = (arr, budget, first) => {
    const out = [];
    let used = 0;
    let accHoThe = 0;
    const add = (x) => {
      if (!x || out.includes(x) || used + x.cells > budget) return;
      const it = x.it;
      const bd = (it && it.bi_dong) || {};
      const ht = bd.ho_the || 0;
      // 7.11.1: Khống chế hộ thể: trần 60%. Nếu đã tích lũy từ 40% hộ thể cơ bản
      // (mảnh lên kinh mạch còn được nhân hệ số từ huyệt x2+, tương sinh),
      // món thuần hộ thể (không chiêu công, không tốc độ/đột phá) sẽ không dồn thêm nữa
      if (
        ht > 0 &&
        accHoThe >= 0.4 &&
        !it.chieu &&
        !(bd.toc_do > 0 || bd.dot_pha > 0 || (bd.khi_huyet || 0) >= 60)
      ) {
        return;
      }
      out.push(x);
      used += x.cells;
      if (ht > 0) accHoThe += ht;
    };
    (first || []).forEach(add);
    for (const x of arr) {
      if (used >= budget) break;
      add(x);
    }
    return { out, used };
  };
  const tam = fill(sel.by.tam, tamB, [sel.by.tam.find((x) => x.fam)]);
  const cong = (x) => x.it.chieu && x.it.chieu.dang === "cong";
  const maxSkills =
    S.hbMaxSkills !== undefined && S.hbMaxSkills > 0
      ? S.hbMaxSkills
      : T >= 0.6
        ? 3
        : 4;
  const first = [
    sel.by.dau.find(cong),
    sel.by.pk.find(cong),
    maxSkills > 2
      ? sel.by.dau.find(
          (x) =>
            x.it.chieu &&
            (x.it.chieu.dang === "thu" ||
              x.it.chieu.dang === "hoi_phuc"),
        )
      : null,
    sel.by.bv[0],
  ].filter(Boolean);
  const chAll = [...sel.by.dau, ...sel.by.pk, ...sel.by.bv].sort(
    (a, c) => c.dens - a.dens,
  );
  const chien = fill(chAll, chB, first);
  return {
    B,
    tamB,
    chB,
    tam: tam.out,
    chien: chien.out,
    tamUsed: tam.used,
    chUsed: chien.used,
  };
}
function hbPool(sel, plan) {
  const rank = (x) => x.val / Math.pow(x.cells, 0.7),
    top = (a, n) =>
      a
        .slice()
        .sort((x, y) => rank(y) - rank(x))
        .slice(0, n);
  return [
    ...new Set([
      ...plan.tam,
      ...plan.chien,
      ...top(sel.by.tam, 7),
      ...top(sel.by.dau, 5),
      ...top(sel.by.pk, 4),
      ...top(sel.by.bv, 3),
    ]),
  ].slice(0, 26);
}

// ── 3) Nhân vật giả định ở cảnh giới R: mọi ô của các vùng ≤ R coi như đã thông (tùy chọn), túi chỉ có đồ trong kế hoạch
function hbNv(R, st, F, pool) {
  const K = S.core,
    c = C(),
    nv = nvNow(),
    g = K.luoiKinhMach(c, nv),
    km = nv.kinhMach,
    real = km.trangThai.slice();
  nv.canhGioi = R;
  nv.tieuCanhGioi = st;
  km.trangThai = g.vung.map((z, i) => {
    if (z < 0 || z > R) return "an";
    if (i === g.danDien) return "thong";
    const r = real[i];
    if (F.assume) return r === "ton" ? "ton" : "thong";
    return r || "an";
  });
  nv.tuiDo = {};
  pool.forEach((x) => {
    nv.tuiDo[x.it.id] = 1;
  });
  km.manh = [];
  km.mastery = {};
  return nv;
}
function hbBudget(nvH) {
  const g = S.core.luoiKinhMach(C(), nvH);
  return nvH.kinhMach.trangThai.filter(
    (s, i) => s === "thong" && i !== g.danDien && g.vung[i] >= 0,
  ).length;
}
// 7.22.1: Phạt tỉ lệ Tâm Pháp : Chiến Pháp nghiêm ngặt (Bảo đảm tỉ lệ 7:3 / 6:4 ưu tiên tối đa Tâm Pháp & Linh Lực)
function hbRatioPenalty(manh, R, nvRef) {
  const H = S.hbRatio;
  if (!H) return 0;
  const items = C().items;
  let tam = 0,
    bv = 0,
    chien = 0;
  manh.forEach((p, i) => {
    const rm = R.manh && R.manh[i];
    if (!rm || !rm.thong) return;
    const it = items.get(p.m.item);
    if (!it) return;
    const cls = hbCls(it);
    if (cls === "tam") tam += p.cells.length;
    else if (cls === "bv") bv += p.cells.length;
    else chien += p.cells.length;
  });
  // Chỉ tính Bảo Vật bị động có hồi linh lực như 35% Tâm Pháp hỗ trợ; ưu tiên tuyệt đối Tâm Pháp thực thụ
  const effectiveTam = S.hbLite ? tam : tam + bv * 0.35;
  const tot = tam + bv + chien;
  if (!tot) return 0;
  let targetTam = H.t * tot;

  // Chỉ giới hạn theo số ô Tâm Pháp trong túi nếu túi thực sự quá ít Tâm Pháp
  if (!S.hbLite && nvRef && nvRef.tuiDo) {
    let maxBagTam = 0;
    for (const id of Object.keys(nvRef.tuiDo)) {
      if (!(nvRef.tuiDo[id] > 0)) continue;
      const it = items.get(id);
      if (
        it &&
        (it.canh_gioi ?? 0) <= (nvRef.canhGioi ?? 0) &&
        hbCls(it) === "tam"
      ) {
        maxBagTam += hbCells(it);
      }
    }
    if (maxBagTam > 0) {
      targetTam = Math.min(targetTam, maxBagTam * 0.95);
    }
  }

  if (effectiveTam < targetTam) {
    const def = targetTam - effectiveTam;
    return def * 68 + Math.pow(def, 1.75) * 32;
  }
  return S.hbLite ? (effectiveTam - targetTam) * 8 : 0;
}
function hbShareOf(nvH, manh) {
  const K = S.core,
    c = C(),
    nv2 = clone(nvH);
  nv2.kinhMach.manh = manh;
  const g = K.luoiKinhMach(c, nv2),
    R = K.tinhKinhMach(nv2, c),
    o = { tam: 0, dau: 0, pk: 0, bv: 0 };
  manh.forEach((m, i) => {
    const rm = R.manh[i];
    if (!rm || !rm.thong) return;
    const it = c.items.get(m.item);
    o[hbCls(it)] += (K.oCuaManh(g, m, it) || []).length;
  });
  const chien = o.dau + o.pk + o.bv,
    tot = o.tam + chien;
  return { ...o, chien, tot, pct: tot ? o.tam / tot : 0 };
}
async function hbRun(b, F, prog) {
  const nvReal = nvNow(),
    sel = hbSelect(b, F.R, F, nvReal);
  const nv0 = hbNv(F.R, F.st, F, []),
    B = hbBudget(nv0),
    rt = HB_RATIO[F.ratio] || HB_RATIO["55"];
  const plan = hbPlan(sel, B, rt[1]),
    pool = hbPool(sel, plan),
    nvH = hbNv(F.R, F.st, F, pool);
  if (!B)
    throw new Error(
      'Không có ô thông nào ở cảnh giới này. Bật ô "giả định mọi ô đã thông" hoặc chọn cảnh giới cao hơn.',
    );
  if (!pool.length)
    throw new Error(
      "Không có món nào khớp bộ lọc. Nới khoảng phẩm, bỏ lọc nguyên tố, hoặc chọn nguồn đồ trong game.",
    );
  const restore = auKmPin({
    ...AU.cfg.km,
    kb: b.k,
    ratio: F.ratio,
    maxSkills: F.maxSkills,
  });
  S.hbLite = true;
  try {
    const res = await optimizeMode(
      nvH,
      F.mode,
      F.iters,
      prog,
      0,
      1,
      "Xếp theo hướng " + b.ten + "…",
    );
    return { nvH, res, plan, pool, B };
  } finally {
    restore();
  }
}

// ── 4) Hiển thị
function hbSkillLine(it) {
  const ch = it.chieu,
    bd = it.bi_dong || {},
    parts = [],
    ps = [];
  if (ch)
    parts.push(
      "Chủ động: " +
        esc(ch.ten) +
        " (" +
        hbTrLabel("dg." + ch.dang).replace("Chiêu ", "") +
        ", uy " +
        num(ch.uy || 0, 2) +
        ", phí " +
        (ch.phi || 0) +
        (ch.hoi ? ", hồi " + ch.hoi : "") +
        ((ch.effects || []).length
          ? ", " +
            ch.effects.map((e) => hbTrLabel("ef." + e.kind)).join("/")
          : "") +
        ")",
    );
  if (it.linh_luc) ps.push("Linh Lực " + num(it.linh_luc, 1));
  for (const [k, v] of Object.entries(bd)) {
    if (k === "chi_so") {
      for (const [s, x] of Object.entries(v || {}))
        ps.push(hbTrLabel("cs." + s) + " +" + x);
    } else ps.push(hbTrLabel(k) + " +" + (v < 1 ? pct(v, 1) : v));
  }
  if (ps.length) parts.push("Bị động: " + ps.join(", "));
  return parts.join(" · ") || "—";
}
function hbItemRow(it) {
  const nv = nvNow(),
    own =
      nv.tuiDo[it.id] > 0 ||
      nv.kinhMach.manh.some((m) => m.item === it.id);
  const src = sourceNote(it),
    where = typeof whereToGet === "function" ? whereToGet(it.id) : "";
  return `<tr><td><b>${esc(it.ten)}</b>${own ? ' <span class="vk-ok" style="font-size:12px">có</span>' : ""}${lnTag(it)} <button class="vk-btn sec hb-tc-btn" data-id="${esc(it.id)}" style="padding:1px 6px;font-size:11px;margin-left:4px;cursor:pointer">🔍 Tra Cứu</button><br><span class="vk-mu" style="font-size:12px">${HB_CLS[hbCls(it)]} · ${HB_ACT[hbCls(it)]} · ${hbCells(it)} ô · ${it.he && it.he.length ? esc(it.he.map(heTen).join("/")) + " · " : ""}${HB_PH[(it.pham_cap || 1) - 1] || ""} · từ ${esc(realmName(it.canh_gioi ?? 0))}</span><br><span style="font-size:13px">${itemFull(it)}</span>${src.length ? `<br><span class="vk-mu" style="font-size:12px">${esc(src.join(" · "))}</span>` : ""}${where && !own ? `<br><span class="vk-mu" style="font-size:12px">Có ở: ${where}</span>` : ""}</td><td style="white-space:nowrap">${it.gia ? "~" + it.gia : "—"}</td></tr>`;
}
const hbBar = (tam, chien) => {
  const tot = tam + chien,
    a = tot ? Math.round((100 * tam) / tot) : 0;
  return `<div style="display:flex;height:16px;border-radius:8px;overflow:hidden;border:1px solid var(--line,#999);margin:4px 0"><div style="width:${a}%;background:#3f8f4a"></div><div style="flex:1;background:#c0392b"></div></div><div class="vk-mu" style="font-size:12px">Tâm Pháp <b>${tam}</b> ô (${a}%) · Chiến Pháp <b>${chien}</b> ô (${tot ? 100 - a : 0}%)</div>`;
};
function hbScanHtml(b, F, sel, plan, rt) {
  const cg = realmName(F.R),
    sum = (a) => a.reduce((s, x) => s + x.cells, 0),
    k4 = ["tam", "dau", "pk", "bv"];
  const rows = k4
    .map(
      (k) =>
        `<tr><td><b>${HB_CLS[k]}</b></td><td>${HB_ACT[k]}</td><td>${sel.by[k].length}</td><td>${sum(plan[k === "tam" ? "tam" : "chien"].filter((x) => x.cls === k))}</td></tr>`,
    )
    .join("");
  const act = [...plan.chien.filter((x) => x.it.chieu)].slice(0, 8),
    pas = [...plan.tam, ...plan.chien.filter((x) => !x.it.chieu)].slice(
      0,
      8,
    );
  const line = (x) =>
    `<li><b>${esc(x.it.ten)}</b> <span class="vk-mu" style="font-size:12px">(${HB_CLS[x.cls]} · ${x.cells} ô${x.have ? " · có" : ""})</span><br><span style="font-size:12px">${hbSkillLine(x.it)}</span></li>`;
  const warn = [];
  if (plan.B && plan.tamUsed < plan.tamB * 0.7)
    warn.push(
      "Tâm Pháp khớp bộ lọc chưa đủ lấp " +
        plan.tamB +
        " ô (mới " +
        plan.tamUsed +
        " ô).",
    );
  if (plan.B && plan.chUsed < plan.chB * 0.7)
    warn.push(
      "Chiến Pháp khớp bộ lọc chưa đủ lấp " +
        plan.chB +
        " ô (mới " +
        plan.chUsed +
        " ô).",
    );
  if (!plan.chien.some((x) => x.it.chieu && x.it.chieu.dang === "cong"))
    warn.push("Chưa có chiêu công nào khớp bộ lọc.");
  const sk = sel.skip;
  return `<div class="vk-card"><h3>Quét Kỹ Năng Trước Khi Xếp</h3>
      <div class="vk-mu" style="font-size:13px">Ở <b>${esc(cg)}</b> có <b>${plan.B}</b> ô thông (chưa tính đan điền). Tỉ lệ <b>${esc(rt[0])}</b>: Tâm Pháp ≈ <b>${plan.tamB}</b> ô · Chiến Pháp (Đấu Pháp + Pháp Khí + Bảo Vật) ≈ <b>${plan.chB}</b> ô.</div>
      <table class="vk-t"><tr><th>Nhóm</th><th>Loại</th><th>Món Khớp</th><th>Ô Trong Kế Hoạch</th></tr>${rows}</table>
      ${warn.length ? `<div style="color:#b45309;font-size:13px;margin-top:6px">⚠️ ${warn.map(esc).join(" ")}</div>` : ""}
      <details style="margin-top:8px"><summary><b>Kỹ Năng Chủ Động Trong Kế Hoạch (${act.length})</b></summary><ul style="margin:6px 0 0;padding-left:18px;font-size:13px">${act.map(line).join("") || '<li class="vk-mu">Không có.</li>'}</ul></details>
      <details style="margin-top:6px"><summary><b>Kỹ Năng Bị Động Trong Kế Hoạch (${pas.length})</b></summary><ul style="margin:6px 0 0;padding-left:18px;font-size:13px">${pas.map(line).join("") || '<li class="vk-mu">Không có.</li>'}</ul></details>
      <div class="vk-mu" style="font-size:12px;margin-top:6px">Đã bỏ qua: ${sk.realm} món quá cảnh giới · ${sk.pham} món ngoài khoảng phẩm · ${sk.he} món lệch nguyên tố · ${sk.huong} món khác hướng hoặc mảnh tà · ${sk.own} món chưa có trong túi.</div></div>`;
}

// ── Lộ trình tìm đồ còn thiếu cho build (quét từ data game)
function hbItemSourceInfo(it) {
  const out = {
    drops: [],
    shops: [],
    sect: null,
    craft: null,
    terrain: [],
  };
  const Cc = C();
  try {
    const X = tcBuild();
    if (X && X.drops) {
      const bestDrops = new Map();
      for (const d of X.drops.get(it.id) || []) {
        const p = tcDropP(d, it),
          cur = bestDrops.get(d.mon.id);
        if (!cur || p > cur.p) bestDrops.set(d.mon.id, { d, p });
      }
      out.drops = [...bestDrops.values()]
        .sort((a, b) => b.p - a.p)
        .slice(0, 3)
        .map(({ d, p }) => ({
          name: d.mon.name,
          id: d.mon.id,
          realm: realmName(d.mon.e.canh_gioi ?? 0),
          rank: TC_MUC[d.mon.e.muc] || d.mon.e.muc || "Thường",
          chance: tcChance(p),
        }));
    }

    try {
      const c = ctx();
      const e = [
        ...S.core.hangTong(c, "cong_phap"),
        ...S.core.hangTong(c, "phap_khi"),
      ].find((x) => x.id === it.id);
      if (e) out.sect = { cost: e.gia, name: "Tàng Kinh Các Tông Môn" };
    } catch (e) {}

    if (S.cho) {
      const r = S.cho.cheapest.get(it.id);
      if (r) out.shops.push({ noi: r.noi, price: Math.round(r.price) });
    }
    if (X && X.evItem) {
      const evs = X.evItem.get(it.id);
      if (evs) {
        for (const [eid, role] of evs) {
          if (role === "ban") {
            const def = Cc.encounters.get(eid);
            if (def && def.ten)
              out.shops.push({
                noi: tcWord(def.ten),
                price: it.gia || "~",
              });
          }
        }
      }
    }

    if (X && X.recOut) {
      const rec = X.recOut.get(it.id);
      if (rec && rec.length) {
        const r = rec[0];
        out.craft = {
          nghe: TC_NGHE[r.nghe] || r.nghe,
          ten: tcClean(r.ten),
          need: (r.chu || [])
            .map((c) => tcItemName(c.id) + " ×" + (c.so ?? 1))
            .join(", "),
        };
      }
    }

    if (it.dia_hinh && it.dia_hinh.length) {
      out.terrain = it.dia_hinh.map((d) => TC_DH[d] || tcWord(d));
    }
  } catch (e) {}
  return out;
}

function hbMissingRoadmapHtml(miss) {
  const rows = miss
    .map((it) => {
      const srcInfo = hbItemSourceInfo(it);
      const sources = [];
      if (srcInfo.drops.length) {
        sources.push(
          `<b>Quái rơi:</b> ${srcInfo.drops.map((d) => `<a class="tc-lk" data-k="q" data-id="${esc(d.id)}">${esc(d.name)}</a> <span class="vk-mu">(${d.realm} · ${d.rank} · ${d.chance})</span>`).join(", ")}`,
        );
      }
      if (srcInfo.sect) {
        sources.push(
          `<b>Tông môn:</b> ${esc(srcInfo.sect.name)} (~${srcInfo.sect.cost} cống hiến)`,
        );
      }
      if (srcInfo.shops.length) {
        sources.push(
          `<b>Tiệm / Chợ:</b> ${srcInfo.shops
            .slice(0, 2)
            .map((s) => `${esc(s.noi)} (~${s.price} lt)`)
            .join(", ")}`,
        );
      }
      if (srcInfo.craft) {
        sources.push(
          `<b>${esc(srcInfo.craft.nghe)}:</b> ${esc(srcInfo.craft.ten)} (cần ${esc(srcInfo.craft.need)})`,
        );
      }
      if (srcInfo.terrain.length) {
        sources.push(
          `<b>Địa hình:</b> ${esc(srcInfo.terrain.join(", "))}`,
        );
      }
      const note = sourceNote(it);
      if (note.length && !sources.length)
        sources.push(esc(note.join(" · ")));
      if (!sources.length)
        sources.push(
          '<span class="vk-mu">Chưa ghi nhận nguồn trực tiếp trong bản game này</span>',
        );

      const isKey = (it.pham_cap || 1) >= 4 || it.tran_phai || it.chieu;
      return `<tr>
<td><b>${esc(it.ten)}</b>${isKey ? ' <span class="vk-ok" style="font-size:11px">Trọng Yếu</span>' : ""}</td>
<td><span class="vk-mu" style="font-size:12px">${HB_CLS[hbCls(it)]} · ${HB_PH[(it.pham_cap || 1) - 1] || ""} · ${(it.he || []).map(heTen).join("/") || "Vô Sắc"}</span></td>
<td style="font-size:12.5px">${sources.join("<br>")}</td>
<td style="white-space:nowrap"><button class="vk-btn sec hb-tc-btn" data-id="${esc(it.id)}" style="padding:2px 7px;font-size:11.5px">🔍 Tra Cứu</button></td>
      </tr>`;
    })
    .join("");

  return `
    <div style="background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.3);border-radius:8px;padding:10px;margin:8px 0">
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">
<b style="color:#d97706;font-size:13.5px">⚠️ Còn thiếu ${miss.length} món chưa có trong túi để hoàn thiện build lý tưởng:</b>
<button class="vk-btn" id="hb-fallback-btn" style="font-size:12.5px;padding:5px 12px;background:linear-gradient(135deg, #10b981, #059669)">🔄 Lấy Đồ Trong Túi Thay Thế & Áp Dụng Ngay</button>
      </div>
      <div class="vk-mu" style="font-size:12px;margin:4px 0 8px">Bấm nút xanh ở trên để Tool tự động chọn những món tốt nhất đang có trong túi thay cho món thiếu và tạo bản có thể bấm Áp Dụng được ngay; hoặc đi săn/mua các món theo lộ trình bên dưới:</div>
      <table class="vk-t" style="margin-top:6px">
<tr><th>Món Thiếu</th><th>Phẩm · Loại</th><th>Nguồn Thu Thập Chi Tiết</th><th>Thao Tác</th></tr>
${rows}
      </table>
    </div>`;
}

// ── So sánh chỉ số trước và sau khi lên build mới
function hbCompareHtml(nvReal, F, res) {
  let cur = null;
  try {
    cur = evalCurrent(nvReal, F.mode);
  } catch (e) {
    cur = null;
  }
  if (!cur) return "";
  const diff = (a, b, isPct, rev) => {
    const d = b - a;
    if (Math.abs(d) < 0.001) return `<span class="vk-mu">0</span>`;
    const good = rev ? d < 0 : d > 0;
    const sign = d > 0 ? "+" : "";
    const str = isPct ? pct(d, 1) : num(d, 1);
    return `<span class="${good ? "vk-ok" : "vk-bad"}">(${sign}${str})</span>`;
  };

  const curTocDo = cur.R.biDong.toc_do || 0,
    newTocDo = res.R.biDong.toc_do || 0;
  const curDotPha = cur.R.biDong.dot_pha || 0,
    newDotPha = res.R.biDong.dot_pha || 0;
  const curHp = cur.P.khiHuyetToiDa || 0,
    newHp = res.P.khiHuyetToiDa || 0;
  const curRegen = cur.P.linhLucMoiLuot || 0,
    newRegen = res.P.linhLucMoiLuot || 0;
  const curNghich = cur.R.diemNghich || 0,
    newNghich = res.R.diemNghich || 0;

  // 7.11.1: Hộ thể & Huyệt đạo
  const maxHoThe =
    0.6 +
    ((nvReal.theChat &&
      nvReal.theChat.dac_tinh &&
      nvReal.theChat.dac_tinh.ho_the_tran) ||
      0);
  const curHoThe = (cur.R.biDong && cur.R.biDong.ho_the) || 0,
    newHoThe = (res.R.biDong && res.R.biDong.ho_the) || 0;
  const K = S.core,
    c = C(),
    gReal = K.luoiKinhMach(c, nvReal),
    hyReal = hySet(gReal, nvReal.kinhMach);
  const curHyUsed = (cur.R.manh || [])
    .filter((m) => m && m.thong && m.acupoints > 0)
    .reduce((a, m) => a + m.acupoints, 0);
  const newHyUsed = (res.R.manh || [])
    .filter((m) => m && m.thong && m.acupoints > 0)
    .reduce((a, m) => a + m.acupoints, 0);
  const totalHy = hyReal.size;

  const hoTheLabel = (v) => {
    if (v >= maxHoThe)
      return `<b>${pct(v)}</b> <span class="vk-mu" style="font-size:11px">(trần ${Math.round(maxHoThe * 100)}%)</span>`;
    return `<b>${pct(v)}</b> <span class="vk-mu" style="font-size:11px">/${Math.round(maxHoThe * 100)}%</span>`;
  };

  const calcDrain = (P) => {
    if (!P || !P.chieu) return 0;
    return P.chieu
      .filter((x) => x && x.dang !== undefined && (x.phi || 0) > 0)
      .reduce(
        (a, x) => a + (x.phi || 0) / Math.max(1, (x.hoi || 0) + 1),
        0,
      );
  };
  const curDrain = calcDrain(cur.P);
  const newDrain = calcDrain(res.P);

  const curSkills =
    (cur.P.chieu || [])
      .filter((x) => x.dang !== undefined)
      .map((x) => `${esc(x.ten)} (${Math.round(x.uy)})`)
      .join(", ") || "—";
  const newSkills =
    (res.P.chieu || [])
      .filter((x) => x.dang !== undefined)
      .map((x) => `${esc(x.ten)} (${Math.round(x.uy)})`)
      .join(", ") || "—";

  return `
    <div class="vk-card" style="margin-top:8px">
      <h3>So Sánh Chỉ Số: Đang Xếp vs Build Mới</h3>
      <table class="vk-t">
<tr><th>Chỉ Số</th><th>Đang Xếp Trên Người</th><th>Sau Khi Lên Build Mới</th><th>Chênh Lệch</th></tr>
<tr><td>Thắng trận mẫu (9 quái)</td><td>${cur.wins}/${cur.n}</td><td><b>${res.wins}/${res.n}</b></td><td>${cur.wins === res.wins ? "—" : res.wins > cur.wins ? `<span class="vk-ok">+${res.wins - cur.wins} thắng</span>` : `<span class="vk-bad">−${cur.wins - res.wins} thắng</span>`}</td></tr>
<tr><td>Tận dụng huyệt đạo</td><td>${curHyUsed}/${totalHy} ô</td><td><b>${newHyUsed}/${totalHy} ô</b></td><td>${newHyUsed >= totalHy && totalHy > 0 ? '<span class="vk-ok">Tận dụng tối đa</span>' : diff(curHyUsed, newHyUsed, false)}</td></tr>
<tr><td>Hộ thể (giảm sát thương)</td><td>${hoTheLabel(curHoThe)}</td><td>${hoTheLabel(newHoThe)}</td><td>${newHoThe > maxHoThe ? '<span class="vk-mu">Đạt trần 60%</span>' : diff(curHoThe, newHoThe, true)}</td></tr>
<tr><td>Tốc độ tu luyện</td><td>+${pct(curTocDo)}</td><td><b>+${pct(newTocDo)}</b></td><td>${diff(curTocDo, newTocDo, true)}</td></tr>
<tr><td>Tỉ lệ đột phá</td><td>+${pct(curDotPha, 1)}</td><td><b>+${pct(newDotPha, 1)}</b></td><td>${diff(curDotPha, newDotPha, true)}</td></tr>
<tr><td>Khí huyết tối đa</td><td>${Math.round(curHp)}</td><td><b>${Math.round(newHp)}</b></td><td>${diff(curHp, newHp, false)}</td></tr>
<tr><td>Linh lực hồi / lượt</td><td>${num(curRegen)}</td><td><b>${num(newRegen)}</b></td><td>${diff(curRegen, newRegen, false)}</td></tr>
<tr><td>Tiêu hao Chân Khí TB / lượt</td><td>~${num(curDrain)}</td><td><b>~${num(newDrain)}</b></td><td>${diff(curDrain, newDrain, false, true)}</td></tr>
<tr><td>Điểm nghịch (Tà / Lệch ô)</td><td>${curNghich}</td><td><b>${newNghich}</b></td><td>${diff(curNghich, newNghich, false, true)}</td></tr>
      </table>
      <div style="font-size:12.5px;margin-top:8px;line-height:1.6">
<div><b>Chân Khí hiện tại:</b> ${llBalanceStr(cur.P)}</div>
<div style="margin-top:3px"><b>Chân Khí build mới:</b> ${llBalanceStr(res.P)}</div>
<div style="margin-top:5px"><b>Chiêu thức hiện tại:</b> <span class="vk-mu">${curSkills}</span></div>
<div style="margin-top:2px"><b>Chiêu thức build mới:</b> <span class="vk-ok">${newSkills}</span></div>
      </div>
    </div>`;
}

function hbResultHtml(b, F, r) {
  const { nvH, res, plan } = r,
    c = C(),
    nvReal = nvNow();
  const sh = hbShareOf(nvH, res.manh),
    used = res.manh.map((m) => c.items.get(m.item)).filter(Boolean);
  const miss = used.filter((it) => !((nvReal.tuiDo[it.id] || 0) > 0));
  const grp = ["tam", "dau", "pk", "bv"]
    .map((k) => {
      const a = used.filter((it) => hbCls(it) === k);
      return a.length
        ? `<div style="margin-top:8px"><b>${HB_CLS[k]} (${HB_ACT[k]})</b><table class="vk-t">${a.map(hbItemRow).join("")}</table></div>`
        : "";
    })
    .join("");
  const curPre =
    HB_PRESETS.find((p) => p.id === (F.preset || "all")) ||
    HB_PRESETS[0];

  return `<div class="vk-ok" style="margin:6px 0;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">
<span>Kinh mạch <b>${esc(realmName(F.R))}</b> theo hướng <b>${esc(b.ten)}</b> · Preset: <b>${esc(curPre.name)}</b></span>
<button class="vk-btn sec" id="hb-copy" style="padding:3px 9px;font-size:12px;cursor:pointer">📋 Sao Chép Cách Xếp</button>
      </div>
      ${hbBar(sh.tam, sh.chien)}
      <div class="vk-mu" style="font-size:12px">Chi tiết ô: Tâm Pháp ${sh.tam} · Đấu Pháp ${sh.dau} · Pháp Khí ${sh.pk} · Bảo Vật ${sh.bv}.</div>
      <div style="font-size:14px;margin:6px 0">Thắng <b>${res.wins}/${res.n}</b> trận mẫu · Tu luyện +${pct(res.R.biDong.toc_do || 0)} · Đột phá +${pct(res.R.biDong.dot_pha || 0, 1)} · Hộ thể <b>${pct(res.R.biDong.ho_the || 0)}</b>${(res.R.biDong.ho_the || 0) >= 0.6 ? " (đạt trần 60%)" : "/60%"} · Huyệt: <b>${(res.R.manh || []).filter((m) => m && m.thong && m.acupoints > 0).reduce((a, m) => a + m.acupoints, 0)}</b> ô · Linh lực hồi ${num(res.P ? res.P.linhLucMoiLuot || 0 : 0)}/lượt · Điểm nghịch ${res.R.diemNghich || 0}</div>
      <div style="margin:4px 0 8px 0">${llBalanceStr(res.P)}</div>
      ${hbCompareHtml(nvReal, F, res)}
      ${drawGrid(nvH, res.manh)}
      ${miss.length ? hbMissingRoadmapHtml(miss) : '<div style="margin:10px 0"><button class="vk-btn" id="hb-apply" style="font-size:14px;padding:8px 18px;background:linear-gradient(135deg, #10b981, #059669)">✅ Áp Dụng Vào Game Ngay</button></div>'}
      ${grp}${pieceTable(res.R)}
      <div class="vk-mu" style="font-size:12px;margin-top:6px">Trận mẫu: 9 loại quái cùng cảnh giới, tiểu cảnh giới quanh mức đã chọn. Chỉ số nhân vật (căn cốt, ngộ tính…) lấy theo nhân vật hiện tại nên kết quả ở cảnh giới cao hơn chỉ là ước lượng. Sức mỗi món tính ở mức Lĩnh Ngộ đã đầy.</div>`;
}
const HB_STEPS = {
  ngu_thu: {
    1: "Ấp trứng thú đầu tiên; đặt công pháp ngự thú để mở ô.",
    2: "Cho thú ăn đều; chuẩn bị nguyên liệu tiến hóa trước bình cảnh.",
  },
  khoi_loi: {
    1: "Mua đồ phổ Mộc Nhân/Mộc Hầu, gom hàn thiết + yêu đan cấp 1 để luyện khôi.",
    2: "Lên đồ phổ Mộc Lang; nâng khôi hạch.",
  },
  thi: {
    1: "Gom thi du, bạch cốt phấn để Luyện thi; tâm pháp thi mở ô.",
  },
  quy: {
    1: "Gom oán hồn ty, âm phù chỉ để Luyện hồn; Dưỡng Hồn Quyết mở 1 ô.",
  },
  doc: { 1: "Gom độc nang để Luyện cổ; công pháp triệu trùng mở ô." },
  ma: {
    1: "Từ đây quyết chính hay tà: mảnh tà ≥ 1/3 ô thông là lưới ngả tà.",
    3: "Ma niệm dồn nhanh: giữ dưới trần, bế quan trấn ma khi gần trần.",
  },
  the: {
    1: "Ưu tiên tâm pháp nhãn thể cho thông trước rồi mới tới chiêu thể tu.",
  },
};
// ── Tab gộp "Hướng Build" (nằm trong nhóm Tự Động, khóa tab 'akm'): cài đặt chung · Auto Kinh Mạch · quét hướng · xếp theo cảnh giới · xếp từ đồ trong túi
const auRow = (lab, ctl) =>
  `<label style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin:5px 0;font-size:13px"><span>${lab}</span>${ctl}</label>`;
const auSel = (id, lab, opts, v) =>
  auRow(
    lab,
    `<select class="vk-sel" id="${id}" style="width:210px">${opts.map(([k, t]) => `<option value="${esc(k)}" ${String(v) === String(k) ? "selected" : ""}>${esc(t)}</option>`).join("")}</select>`,
  );
const auChk = (id, lab, v, hint) =>
  `<label style="display:flex;gap:6px;align-items:flex-start;margin:6px 0;font-size:13px"><input type="checkbox" id="${id}" ${v ? "checked" : ""} style="margin-top:3px"><span>${lab}${hint ? ` <span class="vk-mu" style="font-size:11px">${hint}</span>` : ""}</span></label>`;
function tabAutoKm() {
  const nv = nvNow(),
    Cc = C(),
    cfg = AU.cfg.km,
    cur = Math.max(0, Math.min(5, nv.canhGioi || 0));
  hbScanBuilds();
  if (cfg.kb && !BUILDS.some((x) => x.k === cfg.kb)) cfg.kb = "";
  if (!HB_RATIO[cfg.ratio]) cfg.ratio = "64";
  if (!HB_MAX_SKILLS[cfg.maxSkills]) cfg.maxSkills = "3";
  const sig =
    Cc.items.size +
    "|" +
    BUILDS.filter((x) => x.dyn)
      .map((x) => x.k)
      .join(",");
  let known = null;
  try {
    known = JSON.parse(localStorage.getItem("vkx_hb_scan") || "null");
  } catch (e) {
    known = null;
  }
  const newItems =
    known && known.sig !== sig && Number.isFinite(known.n)
      ? Cc.items.size - known.n
      : 0;
  try {
    localStorage.setItem(
      "vkx_hb_scan",
      JSON.stringify({ sig, n: Cc.items.size }),
    );
  } catch (e) {
    /* bỏ qua */
  }
  const F = (S.bld = Object.assign(
    {
      R: cur,
      st: nv.tieuCanhGioi || 0,
      phMin: 1,
      phMax: 8,
      he: "",
      vo: true,
      dt: "",
      src: "game",
      assume: true,
      preset: "all",
      maxSkills: cfg.maxSkills || "3",
    },
    S.bld || {},
  ));
  F.R = Math.max(0, Math.min(5, +F.R || 0));
  F.st = Math.max(0, Math.min(3, +F.st || 0));
  F.phMin = Math.max(1, Math.min(8, +F.phMin || 1));
  F.phMax = Math.max(1, Math.min(8, +F.phMax || 8));
  if (F.phMin > F.phMax) {
    const t = F.phMin;
    F.phMin = F.phMax;
    F.phMax = t;
  }
  const fitMap = new Map(BUILDS.map((x) => [x.k, buildFit(x, nv, cur)]));
  const ranked = BUILDS.map((x) => ({
      b: x,
      f: fitMap.get(x.k),
    })).sort((a, c) => c.f.s - a.f.s),
    top3 = ranked.slice(0, 3);
  const b = BUILDS.find((x) => x.k === cfg.kb) || ranked[0].b;
  F.k = b.k;
  F.mode = cfg.mode;
  F.iters = cfg.iters;
  F.ratio = cfg.ratio;
  F.maxSkills = cfg.maxSkills;
  const cat = hbCatalog(F.R),
    rt = HB_RATIO[F.ratio] || HB_RATIO["64"],
    sel = hbSelect(b, F.R, F, nv);
  const nv0 = hbNv(F.R, F.st, F, []),
    B = hbBudget(nv0),
    plan = hbPlan(sel, B, rt[1]);
  const groups = [...new Set(BUILDS.map((x) => x.nhom))];
  const o = (v, c2, txt) =>
    `<option value="${esc(v)}" ${String(v) === String(c2) ? "selected" : ""}>${esc(txt)}</option>`;
  const phOpts = (v, pre) =>
    HB_PH.map((t, i) => o(i + 1, v, pre + t)).join("");
  const heOpts = [
    "kim",
    "moc",
    "thuy",
    "hoa",
    "tho",
    "loi",
    "bang",
    "phong",
    "am",
    "vo_sac",
  ].filter((h) =>
    [...Cc.items.values()].some(
      (it) => isKmItem(it) && (it.he || []).includes(h),
    ),
  );
  const trOpts = [...sel.traits.entries()]
    .sort((x, y) =>
      hbTrLabel(x[0]).localeCompare(hbTrLabel(y[0]), "vi"),
    )
    .map(([k, n]) =>
      o(k, F.dt, "Đặc Tính: " + hbTrLabel(k) + " (" + n + ")"),
    )
    .join("");
  const catRows = BUILDS.map((x) => {
    const s = cat.get(x.k);
    const fit = fitMap.get(x.k) || buildFit(x, nv, F.R);
    const owned = fit.onKm + fit.inBag;
    return `<tr data-hk="${esc(x.k)}" style="cursor:pointer">
<td><b>${esc(x.ten)}</b>${x.dyn ? ' <span class="vk-ok" style="font-size:11px">mới</span>' : ""}${x.k === b.k ? " ●" : ""}<br><span style="color:${fit.color};font-weight:600;font-size:11px">${fit.badge}</span> <span class="vk-mu" style="font-size:11px">(${esc(x.nhom)})</span></td>
<td>${s.n.tam}</td>
<td>${s.n.dau}</td>
<td>${s.n.pk}</td>
<td>${s.n.bv}</td>
<td><b>${s.ok.tam}+${s.ok.chien}</b></td>
<td>${owned > 0 ? `<b class="vk-ok">${owned}</b> <span class="vk-mu" style="font-size:11px">(${fit.onKm} trên mạch, ${fit.inBag} túi)</span>` : '<span class="vk-mu">0</span>'}</td>
      </tr>`;
  }).join("");
  const dropNote = HB_DROP.length
    ? `<div class="vk-mu" style="font-size:12px;margin-top:6px">Đã ẩn ${HB_DROP.length} hướng không đủ đồ để xếp kinh mạch: ${HB_DROP.map((d) => esc(d.ten) + " (" + esc(d.why) + ")").join("; ")}.</div>`
    : "";
  const dp = [...Cc.items.values()].filter(
    (it) =>
      it.loai === "dan_duoc" &&
      it.dot_pha &&
      it.dot_pha.canh_gioi === F.R + 1,
  );
  const steps =
    HB_STEPS[b.k] && HB_STEPS[b.k][F.R]
      ? `<li><b>${esc(HB_STEPS[b.k][F.R])}</b></li>`
      : "";
  const slots = (nv.kinhMach.loadouts || [1]).length,
    moLeft = (nv.kinhMach.cho && nv.kinhMach.cho.mo) || 0,
    doiMauLeft = (nv.kinhMach.cho && nv.kinhMach.cho.doiMau) || 0,
    openable = kmOpenable(nv).length;

  // ── Khảo sát tình trạng chân khí / chiêu thức thực tế hiện tại của nhân vật
  let curDrain = 0;
  const curCostSkills = [];
  if (nv.kinhMach && nv.kinhMach.manh) {
    for (const m of nv.kinhMach.manh) {
      const it = Cc.items.get(m.item);
      if (it && it.chieu && (it.chieu.phi || 0) > 0) {
        curCostSkills.push(it);
        curDrain +=
          (it.chieu.phi || 0) / Math.max(1, (it.chieu.hoi || 0) + 1);
      }
    }
  }
  curDrain = Math.round(curDrain * 10) / 10;
  let curRegen = 0,
    curMaxLl = 0;
  try {
    if (S.core && S.core.tinhKinhMach) {
      const rCur = S.core.tinhKinhMach(nv, Cc);
      curRegen = rCur.linhLuc || 0;
      curMaxLl = rCur.linhLucToiDa || curRegen * 3;
    }
  } catch (e) {}

  let qiBadgeHtml = "";
  if (curCostSkills.length === 0) {
    qiBadgeHtml = `<div style="display:flex;align-items:center;gap:6px;background:rgba(34,197,94,0.12);border:1px solid rgba(34,197,94,0.3);border-radius:6px;padding:6px 10px;font-size:12.5px;color:#16a34a;margin-top:6px">
      <span>🌿</span>
      <span><b>Chân Khí Thuần Bị Động:</b> Hiện chưa lắp chiêu tiêu hao nào, tốc tu & dưỡng sinh tối đa.</span>
    </div>`;
  } else if (curRegen >= curDrain * 1.15 && curCostSkills.length <= 3) {
    qiBadgeHtml = `<div style="display:flex;align-items:center;gap:6px;background:rgba(34,197,94,0.12);border:1px solid rgba(34,197,94,0.35);border-radius:6px;padding:6px 10px;font-size:12.5px;color:#15803d;margin-top:6px">
      <span>🟢</span>
      <span><b>Chân Khí Tự Cấp Tự Túc:</b> ${curCostSkills.length} chiêu chủ lực · Hồi <b>+${num(curRegen)}</b>/lượt vs dùng trung bình <b>~${num(curDrain)}</b>/lượt → <b>Tự đánh mượt mà, không bao giờ phải cắn đan!</b></span>
    </div>`;
  } else if (curRegen >= curDrain) {
    qiBadgeHtml = `<div style="display:flex;align-items:center;gap:6px;background:rgba(234,179,8,0.12);border:1px solid rgba(234,179,8,0.35);border-radius:6px;padding:6px 10px;font-size:12.5px;color:#b45309;margin-top:6px">
      <span>🟡</span>
      <span><b>Chân Khí Cân Bằng Đủ Dùng:</b> ${curCostSkills.length} chiêu · Hồi <b>+${num(curRegen)}</b>/lượt vs dùng <b>~${num(curDrain)}</b>/lượt.</span>
    </div>`;
  } else {
    const def = Math.round((curDrain - curRegen) * 10) / 10;
    qiBadgeHtml = `<div style="display:flex;align-items:center;gap:6px;background:rgba(239,68,68,0.12);border:1px solid rgba(239,68,68,0.35);border-radius:6px;padding:6px 10px;font-size:12.5px;color:#b91c1c;margin-top:6px">
      <span>🔴</span>
      <span><b>Cảnh Báo Thiếu Chân Khí (Bệnh Cắn Đan):</b> ${curCostSkills.length} chiêu · Dùng <b>~${num(curDrain)}</b>/lượt nhưng chỉ hồi <b>+${num(curRegen)}</b>/lượt (thiếu <b>-${num(def)}</b>/lượt) → <b>Toàn phải cắn đan mới ra nổi chiêu! Hãy bấm Chạy Auto Kinh Mạch để Tool cân bằng lại.</b></span>
    </div>`;
  }

  const kbSel = auRow(
    "Hướng Build Mục Tiêu",
    `<select class="vk-sel" id="au-km-kb" style="width:230px"><option value="">Không Ép (Theo Hệ Số Game)</option>${groups
      .map(
        (g) =>
          `<optgroup label="${esc(g)}">${BUILDS.filter(
            (x) => x.nhom === g,
          )
            .map((x) => {
              const fit = fitMap.get(x.k) || buildFit(x, nv, F.R);
              return `<option value="${esc(x.k)}" ${cfg.kb === x.k ? "selected" : ""}>${esc(x.ten)} [${fit.tier}] (${fit.s > 0 ? "+" : ""}${Math.round(fit.s)}đ)</option>`;
            })
            .join("")}</optgroup>`,
      )
      .join("")}</select>`,
  );
  const curPreset =
    HB_PRESETS.find((p) => p.id === (F.preset || "all")) ||
    HB_PRESETS[0];
  const bFit = fitMap.get(b.k) || buildFit(b, nv, cur);

  body.innerHTML = `
    <!-- ═════════ 1. BANNER TRẠNG THÁI BUILD & CHÂN KHÍ ═════════ -->
    <div class="vk-card" style="border-left:4px solid var(--acc2);background:linear-gradient(180deg, var(--bg2) 0%, rgba(20,24,35,0.6) 100%)">
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">
<div>
  <h3 style="margin:0;font-size:16px;display:inline-flex;align-items:center;gap:6px">
    <span>🧭</span> Hướng Build: <span style="color:var(--acc2)">${esc(b.ten)}</span>
    <span style="font-size:12px;font-weight:normal" class="vk-mu">(${esc(b.nhom)})</span>
  </h3>
  <div class="vk-mu" style="font-size:12.5px;margin-top:2px">
    Cảnh giới: <b>${esc(realmName(cur))}</b> · Đang dùng: <b>${bFit.onKm || 0}</b> món trên kinh mạch (${bFit.inBag || 0} trong túi)
  </div>
</div>
<div style="display:flex;gap:6px;align-items:center">
  <span style="padding:3px 10px;border-radius:999px;font-size:12px;font-weight:700;background:${bFit.color || "#3b82f6"}22;color:${bFit.color || "#3b82f6"};border:1px solid ${bFit.color || "#3b82f6"}55">
    ${bFit.badge || "Khả Dụng"}
  </span>
</div>
      </div>
      ${qiBadgeHtml}
    </div>

    <!-- ═════════ 2. KHỐI CÀI ĐẶT CHIẾN THUẬT & TỈ LỆ MẠCH ═════════ -->
    <div class="vk-card">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
<h3 style="margin:0;font-size:14.5px">⚙️ Cài Đặt Chiến Thuật & Tỉ Lệ Mạch</h3>
<span class="vk-mu" style="font-size:11.5px">Dùng chung cho Auto và Xếp Kinh Mạch</span>
      </div>

      ${kbSel}

      <!-- Presets Nhanh -->
      <div style="margin:8px 0;background:rgba(255,255,255,0.02);border:1px solid var(--line);border-radius:8px;padding:8px">
<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
  <b style="font-size:12.5px">🎯 Chọn Nhanh Lối Chơi (Presets)</b>
  <span class="vk-mu" style="font-size:11px">1-chạm thiết lập tỉ lệ & giới hạn chiêu</span>
</div>
<div style="display:flex;gap:5px;flex-wrap:wrap">
  ${HB_PRESETS.map((p) => `<button class="vk-btn ${F.preset === p.id ? "" : "sec"} hb-preset-btn" data-pid="${p.id}" style="font-size:12px;padding:4px 9px">${esc(p.name)}</button>`).join("")}
</div>
<div class="vk-mu" style="font-size:12px;margin-top:5px" id="hb-preset-desc">💡 ${esc(curPreset.desc)}</div>
      </div>

      ${auSel(
"au-km-ratio",
"Tỉ Lệ Tâm Pháp : Chiến Pháp",
Object.entries(HB_RATIO).map(([k, v]) => [k, v[0]]),
cfg.ratio,
      )}
      ${auSel(
"au-km-maxskills",
"Giới Hạn Chiêu Thức Chủ Động",
Object.entries(HB_MAX_SKILLS).map(([k, v]) => [k, v[0]]),
cfg.maxSkills || "3",
      )}
      ${auSel("au-km-mode", "Chế Độ Ưu Tiên", AU_KM_MODE, cfg.mode)}
      ${auSel(
"au-km-dir",
"Hướng Xếp Khí Vận",
[
  ["", "Theo Hệ Số Game"],
  ["tien", "Tiên Tu · Tương Sinh (Khuyên Dùng)"],
  ["ma", "Ma Tu · Tương Khắc"],
],
cfg.dir,
      )}
      ${auSel("au-km-it", "Độ Kỹ Luyện Kim", AU_KM_IT, cfg.iters)}
      ${auChk("au-km-prio", "Ưu Tiên Theo Hệ Linh Căn Và Huyệt Đạo", cfg.prio)}

      <!-- Tùy Chọn Nâng Cao (Mở Sẵn) -->
      <details open style="margin-top:10px;border-top:1px dashed var(--line);padding-top:8px">
<summary style="font-size:13px;font-weight:600;color:var(--txt);cursor:pointer;display:flex;justify-content:space-between;align-items:center">
  <span>🔧 Tùy Chọn Nâng Cao (Hai Bộ, Mở Ô, Tẩy Ô, Theo Dõi)</span>
  <span style="font-size:11.5px;font-weight:normal" class="vk-mu">Mở ô: <b class="${cfg.mo ? "vk-ok" : ""}">${cfg.mo ? "Bật" : "Tắt"}</b> · Tẩy ô: <b class="${cfg.tayO ? "vk-ok" : ""}">${cfg.tayO ? "Bật" : "Tắt"}</b></span>
</summary>
<div style="margin-top:8px;padding-left:6px">
  <div style="margin:6px 0 2px"><b style="font-size:12.5px">Hai Bộ Kinh Mạch</b> <span class="vk-mu" style="font-size:11px">(đang có ${slots}/3 bộ)</span></div>
  ${auChk("au-km-two", "Xếp 2 Bộ: Bộ 1 Tu Luyện, Bộ 2 Đánh", cfg.two, "(bỏ qua ô Chế Độ ở trên)")}
  ${auSel(
    "au-km-keep",
    "Dùng Bộ Nào Khi Xong",
    [
      ["tu", "Bộ 1 · Tu Luyện"],
      ["danh", "Bộ 2 · Đánh"],
    ],
    cfg.keep,
  )}
  ${auChk("au-km-mobo", "Tự Mở Bộ 2 Nếu Chưa Có", cfg.moBo, "(tốn Linh Thạch: bộ 2 là 1.000, bộ 3 là 15.000)")}

  <div style="margin:8px 0 2px"><b style="font-size:12.5px">Khai Thông Ô Mới</b> <span class="vk-mu" style="font-size:11px">(${openable} ô mở được ngay · còn ${moLeft} lượt khai thông)</span></div>
  ${auChk("au-km-mo", "Tự Mở Ô Khi Có Lợi", cfg.mo, "(chỉ mở khi lợi từ " + AU_KM_MO_MIN + " điểm)")}
  ${auRow("Mở Tối Đa Mỗi Lần Chạy", `<input class="vk-sel" id="au-km-momax" type="number" min="1" max="20" step="1" value="${cfg.moMax}" style="width:85px;text-align:right">`)}

  <div style="margin:8px 0 2px"><b style="font-size:12.5px;color:#3b82f6">🎨 Tẩy Ô (Đổi Hệ Ô Kinh Mạch)</b> <span class="vk-mu" style="font-size:11px">(còn ${doiMauLeft} lượt chuyển hệ)</span></div>
  ${auChk("au-km-tayo", "Tự Động Tẩy Ô Để Khớp Công Pháp Tối Đa", cfg.tayO, "(đổi hệ ô sang hệ công pháp / vô sắc để kích hoạt 100% tương sinh; tự cắn Tẩy Tủy Đan / Cải Mệnh Đan nếu hết lượt)")}
  ${auRow("Tẩy Tối Đa Mỗi Lần Chạy", `<input class="vk-sel" id="au-km-taymax" type="number" min="1" max="20" step="1" value="${cfg.tayMax != null ? cfg.tayMax : 3}" style="width:85px;text-align:right">`)}

  <div style="margin:8px 0 2px"><b style="font-size:12.5px">Theo Dõi Tự Động</b></div>
  ${auChk("au-km-watch", "Tự Xếp Lại Khi Có Đồ Mới, Ô Đổi Hoặc Lên Cảnh Giới", cfg.watch, "(tự động tối ưu liên tục trong lúc bế quan)")}
</div>
      </details>
    </div>

    <!-- ═════════ 3. BẢNG ĐIỀU KHIỂN AUTO KINH MẠCH (LIVE CONTROL) ═════════ -->
    <div class="vk-card">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
<h3 style="margin:0;font-size:15px">🚀 Bảng Điều Khiển Auto Kinh Mạch</h3>
<span class="vk-ok" style="font-size:12px;font-weight:600">Áp Dụng Trực Tiếp Vào Game</span>
      </div>
      <div class="vk-mu" style="font-size:12.5px">
Tool sử dụng thuật toán Luyện Kim Hai Hạt Giống (Dual-Seed Annealing) cùng <b>Động Cơ Bền Vững Chân Khí</b> để tìm cách xếp tối ưu nhất từ đồ trong túi, bảo đảm <b>tự cấp chân khí không cần cắn đan</b>, sau đó tự gỡ, đặt, mở ô, tẩy ô vào game.
      </div>
      <div style="margin-top:5px;font-size:12px;color:var(--txt);display:flex;gap:12px;flex-wrap:wrap">
<span>⚙️ Thiết lập nâng cao:</span>
<span class="${cfg.mo ? "vk-ok" : "vk-mu"}">Mở ô: <b>${cfg.mo ? "BẬT (tối đa " + cfg.moMax + ")" : "TẮT"}</b></span>
<span class="${cfg.tayO ? "vk-ok" : "vk-mu"}">Tẩy ô: <b>${cfg.tayO ? "BẬT (tối đa " + (cfg.tayMax || 3) + ")" : "TẮT"}</b></span>
<span class="vk-mu">(Bật/Tắt ngay tại mục <b>Tùy Chọn Nâng Cao</b> ở trên)</span>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin:10px 0 6px">
<button class="vk-btn au-go" id="au-run" style="flex:1.2;min-width:140px;padding:9px 12px;font-size:13.5px;font-weight:bold;background:linear-gradient(135deg, #10b981, #059669)">
  ▶ Chạy Auto Kinh Mạch
</button>
<button class="vk-btn sec au-go" id="au-prev" style="flex:1;min-width:120px;padding:9px 10px;font-size:13px">
  🔍 Xem Trước (An Toàn)
</button>
<button class="vk-btn sec" id="au-stop" style="flex:0.6;min-width:80px;padding:9px 10px;font-size:13px">
  ⏹ Dừng
</button>
      </div>

      <!-- Container Tiến Trình & Trạng Thái Trực Tiếp -->
      <div id="au-st" style="margin-top:6px"></div>
      <div id="au-info"></div>
      <details style="margin-top:8px">
<summary style="font-size:12px;color:var(--mut);cursor:pointer">📜 Nhật Ký Auto Chi Tiết</summary>
<div id="au-lg" style="margin-top:4px;font-size:12px"></div>
      </details>
    </div>

    <!-- ═════════ 4. PHÒNG THÍ NGHIỆM: XẾP THỬ THEO CẢNH GIỚI ═════════ -->
    <details class="vk-card">
      <summary style="cursor:pointer;font-size:14px;font-weight:700">
🔮 Phòng Thí Nghiệm: Xếp Thử Theo Cảnh Giới & Toàn Bộ Đồ Trong Game
      </summary>
      <div style="margin-top:8px">
<div class="vk-mu" style="font-size:12.5px;margin-bottom:8px">
  Khu vực giả định độc lập (không đụng save game thật). Cho phép đạo hữu thử nghiệm cách xếp tối ưu ở cảnh giới cao hơn hoặc quét toàn bộ kho đồ game.
</div>
<div class="tc-row">
  <select class="vk-sel" id="hb-r">${[0, 1, 2, 3, 4, 5].map((r) => o(r, F.R, "Cảnh Giới: " + realmName(r) + (r === cur ? " ●" : ""))).join("")}</select>
  <select class="vk-sel" id="hb-st">${STAGE.map((t, i) => o(i, F.st, "Tiểu Cảnh Giới: " + t)).join("")}</select>
</div>
<div class="tc-row" style="margin-top:6px">
  <select class="vk-sel" id="hb-p0">${phOpts(F.phMin, "Phẩm Từ: ")}</select>
  <select class="vk-sel" id="hb-p1">${phOpts(F.phMax, "Đến: ")}</select>
</div>
<div class="tc-row" style="margin-top:6px">
  <select class="vk-sel" id="hb-he">${o("", F.he, "Nguyên Tố: Tất Cả")}${heOpts.map((h) => o(h, F.he, "Nguyên Tố: " + heTen(h))).join("")}</select>
  <select class="vk-sel" id="hb-dt">${o("", F.dt, "Đặc Tính: Không Chọn")}${trOpts}</select>
</div>
<div style="margin-top:6px">
  <select class="vk-sel" id="hb-src">${o("game", F.src, "Nguồn Đồ: Trong Game (Giả Định)")}${o("own", F.src, "Nguồn Đồ: Chỉ Đồ Đang Có Trong Túi")}</select>
</div>
${auChk("hb-assume", "Giả định mọi ô của cảnh giới đã thông", F.assume)}
${auChk("hb-vo", "Kèm đồ Vô Sắc khi lọc nguyên tố", F.vo)}

${hbScanHtml(b, F, sel, plan, rt)}

<div style="margin-top:8px">
  <button class="vk-btn" id="hb-go" style="width:100%;padding:8px;font-size:13px;font-weight:600">
    🔮 Xếp Kinh Mạch Thử Nghiệm Theo Cảnh Giới
  </button>
  ${progressHtml("hb-pr")}
  <div id="hb-out"></div>
</div>
${kmManualHtml(nv)}
      </div>
    </details>

    <!-- ═════════ 5. CẨM NANG & DANH MỤC HƯỚNG BUILD ═════════ -->
    <details class="vk-card">
      <summary style="cursor:pointer;font-size:14px;font-weight:700">
📖 Danh Sách 19 Hướng Build Trong Game & Cốt Lõi Lộ Trình
      </summary>
      <div style="margin-top:8px">
<div class="vk-mu" style="font-size:12px;margin-bottom:6px">
  Số món theo nhóm của từng hướng trong dữ liệu game hiện tại. Chạm một dòng để chọn hướng.
</div>
<table class="vk-t">
  <tr><th>Hướng Build</th><th>Tâm</th><th>Đấu</th><th>Khí</th><th>Bảo</th><th>Dùng Được</th><th>Đang Có</th></tr>
  ${catRows}
</table>
${dropNote}
<button class="vk-btn sec" id="hb-rescan" style="margin-top:6px;width:100%">Quét Lại Dữ Liệu Game</button>

<div style="margin-top:10px;padding-top:8px;border-top:1px dashed var(--line)">
  <b>${esc(b.ten)} · Cốt Lõi:</b>
  <ul style="margin:4px 0 0;padding-left:18px;font-size:13.5px">
    ${b.core.map((x) => `<li>${resolveTC(x)}</li>`).join("")}
  </ul>
</div>
${kmCard(b, nv)}

<div style="margin-top:10px;padding-top:8px;border-top:1px dashed var(--line)">
  <b>Ở ${esc(realmName(F.R))} Cần Làm Gì:</b>
  <ul style="margin:4px 0 0;padding-left:18px;font-size:13px">
    ${steps}
    <li>Đồ nên dùng ở cảnh giới này: <b>${PHAM_TEN.filter((_, i) => TIER_CG[i] + 1 >= F.R && TIER_CG[i] <= F.R).join(", ")} phẩm</b>.</li>
    ${(REALM_STEPS[F.R] || []).map((x) => `<li>${x}</li>`).join("")}
    ${dp.length ? `<li>Đan đột phá lên ${esc(realmName(F.R + 1))}: ${dp.map((d) => `${esc(d.ten)} (+${pct(d.dot_pha.ti_le || 0)}${d.dot_pha.tam_ma ? ", +" + d.dot_pha.tam_ma + " tâm ma" : ""}, ~${d.gia})`).join(", ")}</li>` : ""}
  </ul>
</div>
      </div>
    </details>`;

  // ── sự kiện
  const rd = () => {
    F.R = +body.querySelector("#hb-r").value;
    F.st = +body.querySelector("#hb-st").value;
    F.phMin = +body.querySelector("#hb-p0").value;
    F.phMax = +body.querySelector("#hb-p1").value;
    F.he = body.querySelector("#hb-he").value;
    F.dt = body.querySelector("#hb-dt").value;
    F.src = body.querySelector("#hb-src").value;
    F.assume = body.querySelector("#hb-assume").checked;
    F.vo = body.querySelector("#hb-vo").checked;
  };
  body.querySelectorAll('[id^="au-km-"]').forEach((el) => {
    el.onchange = () => {
      const oldKb = cfg.kb;
      auReadCfg("km");
      if (cfg.kb !== oldKb) {
        F.dt = "";
        const nb = BUILDS.find((x) => x.k === cfg.kb);
        if (F.he && nb && nb.elem) F.he = "";
      }
      S.hbRes = null;
      tabAutoKm();
    };
  });
  body.querySelectorAll('[id^="hb-"]').forEach((el) => {
    if (el.tagName === "SELECT" || el.type === "checkbox")
      el.onchange = () => {
        rd();
        S.hbRes = null;
        tabAutoKm();
      };
  });
  body.querySelectorAll("tr[data-hk]").forEach((tr) => {
    tr.onclick = () => {
      cfg.kb = tr.dataset.hk;
      F.dt = "";
      auSave();
      S.hbRes = null;
      tabAutoKm();
    };
  });
  body.querySelector("#hb-rescan").onclick = () => {
    S.hbRes = null;
    try {
      localStorage.removeItem("vkx_hb_scan");
    } catch (e) {
      /* bỏ qua */
    }
    tabAutoKm();
    UI.notify(
      "Đã quét lại " + C().items.size + " món trong dữ liệu game.",
    );
  };
  body.querySelector("#au-run").onclick = () => auStartKm(false);
  body.querySelector("#au-prev").onclick = () => auStartKm(true);
  body.querySelector("#au-stop").onclick = () => auStop("Bạn bấm Dừng");

  body.querySelectorAll(".hb-preset-btn").forEach((btn) => {
    btn.onclick = () => {
      const pid = btn.dataset.pid;
      const pre = HB_PRESETS.find((p) => p.id === pid);
      if (!pre) return;
      F.preset = pid;
      if (pre.mode) {
        F.mode = pre.mode;
        cfg.mode = pre.mode;
      }
      if (pre.ratio) {
        F.ratio = pre.ratio;
        cfg.ratio = pre.ratio;
      }
      if (pre.maxSkills) {
        F.maxSkills = pre.maxSkills;
        cfg.maxSkills = pre.maxSkills;
      }
      if (pre.dt !== undefined) {
        F.dt = pre.dt;
      }
      auSave();
      S.hbRes = null;
      tabAutoKm();
    };
  });

  body.onclick = (ev) => {
    const tcBtn = ev.target.closest && ev.target.closest(".hb-tc-btn");
    if (tcBtn && tcBtn.dataset.id) {
      ev.preventDefault();
      tcGo("v", tcBtn.dataset.id);
      return;
    }
    const tcLkEl = ev.target.closest && ev.target.closest(".tc-lk");
    if (tcLkEl && tcLkEl.dataset.k && tcLkEl.dataset.id) {
      ev.preventDefault();
      tcGo(tcLkEl.dataset.k, tcLkEl.dataset.id);
      return;
    }
    const fbBtn =
      ev.target.closest && ev.target.closest("#hb-fallback-btn");
    if (fbBtn) {
      ev.preventDefault();
      F.src = "own";
      const srcSel = body.querySelector("#hb-src");
      if (srcSel) srcSel.value = "own";
      S.hbRes = null;
      const goBtn = body.querySelector("#hb-go");
      if (goBtn) goBtn.click();
      return;
    }
  };

  const key = JSON.stringify([
    b.k,
    F.R,
    F.st,
    F.phMin,
    F.phMax,
    F.he,
    F.dt,
    F.src,
    F.ratio,
    F.mode,
    F.iters,
    F.assume,
    F.vo,
    cfg.dir,
    cfg.prio,
    cfg.bk,
    F.preset,
    cfg.maxSkills,
  ]);
  const showRes = () => {
    const out = body.querySelector("#hb-out");
    if (!out || !S.hbRes || S.hbRes.key !== key) return;
    out.innerHTML = hbResultHtml(b, F, S.hbRes.r);
    const ap = out.querySelector("#hb-apply");
    if (ap)
      ap.onclick = async (e) => {
        if (kmAutoRunning()) {
          UI.notify("Auto Kinh Mạch đang chạy, hãy dừng trước.");
          return;
        }
        e.target.disabled = true;
        if (await applyManh(S.hbRes.r.res.manh)) await render();
        else e.target.disabled = false;
      };
    const cp = out.querySelector("#hb-copy");
    if (cp)
      cp.onclick = async () => {
        const ok = await copyText(
          JSON.stringify({
            vktt: "manh",
            manh: S.hbRes.r.res.manh.map((m) => ({
              item: m.item,
              x: m.x,
              y: m.y,
              xoay: m.xoay,
            })),
          }),
        );
        UI.notify(
          ok
            ? "📋 Đã chép cách xếp vào clipboard."
            : "❌ Không chép được.",
        );
      };
  };
  showRes();
  body.querySelector("#hb-go").onclick = async (ev) => {
    if (kmAutoRunning()) {
      UI.notify("Auto Kinh Mạch đang chạy, hãy dừng trước.");
      return;
    }
    ev.target.disabled = true;
    S.abort = false;
    const prog = bindProgress(body.querySelector("#hb-pr"));
    try {
      const r = await hbRun(b, F, prog);
      S.hbRes = { key, r };
      body.querySelector("#hb-pr").style.display = "none";
      showRes();
    } catch (e) {
      console.error(e);
      body.querySelector("#hb-pr").style.display = "none";
      body.querySelector("#hb-out").innerHTML = errBox(e);
    }
    ev.target.disabled = false;
  };
  kmManualBind(nv);
  auPaint();
  auKmPreview();
}

export {
  SCHOOLS,
  NL2S,
  schoolsOf,
  TIER_CG,
  PHAM_TEN,
  tierCg,
  freshAt,
  DIHOA_PCT,
  REALM_STEPS,
  BUILDS,
  BUILDS_FULL,
  HB_DROP,
  tcMap,
  TC_NHAN,
  tcSgn,
  tcBuff,
  tcShape,
  tcTen,
  tcPP,
  resolveTC,
  BUILD_TC,
  BUILD_TC_TRANH,
  TA_DAO_KM,
  BUILD_KM,
  BUILD_PLAN,
  elemPlan,
  HB_NOTE,
  planOf,
  HE_CLS,
  heChip,
  planHtml,
  oHopHtml,
  kmTips,
  buildMatch,
  itemGroup,
  GROUP_TEN,
  BUILD_EXTRA,
  buildFit,
  kmCard,
  HB_CLS,
  HB_ACT,
  HB_PH,
  HB_RATIO,
  HB_MAX_SKILLS,
  HB_MODE,
  HB_ITERS,
  HB_PRESETS,
  HB_RATIO_W,
  HB_MIN_ITEMS,
  HB_TA,
  HB_TR_TEN,
  hbCls,
  hbCells,
  hbTrLabel,
  hbTraits,
  _hbScannedItemsCount,
  hbScanBuilds,
  hbSumLine,
  hbElemN,
  hbElemBan,
  _hbCatalogCache,
  hbCatalog,
  hbMatch,
  hbHeOK,
  hbVal,
  hbSelect,
  hbPlan,
  hbPool,
  hbNv,
  hbBudget,
  hbRatioPenalty,
  hbShareOf,
  hbRun,
  hbSkillLine,
  hbItemRow,
  hbBar,
  hbScanHtml,
  hbItemSourceInfo,
  hbMissingRoadmapHtml,
  hbCompareHtml,
  hbResultHtml,
  HB_STEPS,
  auRow,
  auSel,
  auChk,
  tabAutoKm,
};

Object.assign(gWin, {
  SCHOOLS,
  NL2S,
  schoolsOf,
  TIER_CG,
  PHAM_TEN,
  tierCg,
  freshAt,
  DIHOA_PCT,
  REALM_STEPS,
  BUILDS,
  BUILDS_FULL,
  HB_DROP,
  tcMap,
  TC_NHAN,
  tcSgn,
  tcBuff,
  tcShape,
  tcTen,
  tcPP,
  resolveTC,
  BUILD_TC,
  BUILD_TC_TRANH,
  TA_DAO_KM,
  BUILD_KM,
  BUILD_PLAN,
  elemPlan,
  HB_NOTE,
  planOf,
  HE_CLS,
  heChip,
  planHtml,
  oHopHtml,
  kmTips,
  buildMatch,
  itemGroup,
  GROUP_TEN,
  BUILD_EXTRA,
  buildFit,
  kmCard,
  HB_CLS,
  HB_ACT,
  HB_PH,
  HB_RATIO,
  HB_MAX_SKILLS,
  HB_MODE,
  HB_ITERS,
  HB_PRESETS,
  HB_RATIO_W,
  HB_MIN_ITEMS,
  HB_TA,
  HB_TR_TEN,
  hbCls,
  hbCells,
  hbTrLabel,
  hbTraits,
  _hbScannedItemsCount,
  hbScanBuilds,
  hbSumLine,
  hbElemN,
  hbElemBan,
  _hbCatalogCache,
  hbCatalog,
  hbMatch,
  hbHeOK,
  hbVal,
  hbSelect,
  hbPlan,
  hbPool,
  hbNv,
  hbBudget,
  hbRatioPenalty,
  hbShareOf,
  hbRun,
  hbSkillLine,
  hbItemRow,
  hbBar,
  hbScanHtml,
  hbItemSourceInfo,
  hbMissingRoadmapHtml,
  hbCompareHtml,
  hbResultHtml,
  HB_STEPS,
  auRow,
  auSel,
  auChk,
  tabAutoKm,
});
