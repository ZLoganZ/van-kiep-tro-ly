import { gWin, sleep0, pct, num, esc, yrs, cleanTxt, fold, heTen, STAGE } from "../core/utils.js";
import { S, body, C, clone, ctx, nvNow, realmName, realmLabel, has, needMsg, withPlace, danger, dangerTag, nearSlots, fight, enemyAt, simFoe, foesOf, scanRetreat } from "../core/bridge.js";
import { anneal } from "./kinh-mach-engine.js";
import { errBox, progressHtml, bindProgress } from "./navigation.js";
import { placeName } from "./di-bao.js";
import { lnTag, sellTotal } from "./kinh-mach-tab.js";
/**
 * Module: Đột Phá, Thọ Nguyên, Tàng Kinh Các, Chợ, Luyện Chế 4 Nghề & Bản Mệnh Pháp Bảo
 */
// ── Chợ ngập hàng: hằng số lấy từ code game (ngưỡng 2,5 / 4 / 5; nửa đời 2 năm)
const GLUT = { cut: [2.5, 4, 5], hold: 3, half: 2 };
const GLUT_TIER = [
  "Bình thường",
  "Hơi ế",
  "Ế",
  "Ngập — tiệm không thu",
];
const GLUT_BAN = [1, 0.8, 0.5, 0.5],
  GLUT_MUA = [1, 0.85, 0.7, 0.6];
const GLUT_CUM = {
  low: "Phàm–Hoàng phẩm",
  mid: "Huyền–Địa phẩm",
  high: "Từ Thiên phẩm",
};
const GLUT_LOAI = {
  dan_duoc: "Đan dược",
  cong_phap: "Công pháp",
  phap_khi: "Pháp khí",
  phu_luc: "Phù lục",
  nguyen_lieu: "Nguyên liệu",
  linh_duoc: "Linh dược",
  yeu_tai: "Yêu tài",
  dac_san: "Hàng buôn",
  tru_vat: "Trữ vật",
  di_hoa: "Dị hỏa",
  phuong_tien: "Phương tiện",
  dung_cu: "Dụng cụ",
  tran_ban: "Trận bàn",
  tran_van: "Trận văn",
  khac: "Khác",
};
const glutTier = (v, held) =>
  (held >= 3 && v >= GLUT.hold) || v >= GLUT.cut[2]
    ? 3
    : v >= GLUT.cut[1]
      ? 2
      : v >= GLUT.cut[0]
        ? 1
        : 0;
function glutRows(c) {
  const run = c.run,
    g = run.marketGlut,
    rows = [];
  if (!g) return rows;
  let here = "ngoai";
  try {
    here = c.world.info(run.viTri).quocGia || "ngoai";
  } catch {}
  for (const [nuoc, cats] of Object.entries(g))
    for (const [loai, cums] of Object.entries(cats || {}))
      for (const [cum, e] of Object.entries(cums || {})) {
        if (!e || typeof e.value !== "number") continue;
        const v =
            e.value * Math.pow(0.5, (run.nam - e.year) / GLUT.half),
          tier = glutTier(v, e.tier || 0);
        if (tier < 1) continue;
        let ten = nuoc;
        try {
          ten =
            nuoc === "ngoai"
              ? "Vùng ngoài cõi"
              : c.world.tenQuocGia(nuoc) || nuoc;
        } catch {}
        rows.push({
          ten,
          loai,
          cum,
          v,
          tier,
          here: nuoc === here,
          years: Math.log2(v / GLUT.cut[0]) * GLUT.half,
        });
      }
  return rows.sort(
    (a, b) => b.here - a.here || b.tier - a.tier || b.v - a.v,
  );
}
function glutCard(c) {
  if (!c.run.marketGlut) return "";
  const rows = glutRows(c);
  const body2 = rows.length
    ? `<table class="vk-t"><tr><th>Nơi · Loại</th><th>Mức</th><th>Giá</th></tr>${rows
        .slice(0, 20)
        .map(
          (r) =>
            `<tr><td>${r.here ? "★ " : ""}${esc(r.ten)}<br><span class="vk-mu" style="font-size:12px">${esc(GLUT_LOAI[r.loai] || r.loai)} · ${esc(GLUT_CUM[r.cum] || r.cum)} · bớt ế sau ~${num(r.years)} năm</span></td><td${r.tier >= 3 ? ' class="vk-bad"' : ""}>${GLUT_TIER[r.tier]}</td><td style="font-size:12px">bán ×${GLUT_BAN[r.tier]}<br>mua ×${GLUT_MUA[r.tier]}</td></tr>`,
        )
        .join("")}</table>`
    : '<div class="vk-mu">Chưa chỗ nào ngập hàng.</div>';
  return `<div class="vk-card"><h3>Chợ ngập hàng</h3><div class="vk-mu" style="font-size:13px">Bán nhiều một loại ở một nước thì giá tụt và tiệm thôi thu. Mức ngập giảm nửa sau mỗi 2 năm. ★ = nước bạn đang đứng. Mua thì ngược lại: hàng ế mua rẻ hơn.</div>${body2}</div>`;
}
// ── Thương thế & truy đuổi (game mới)
const TT_TEN = ["Khỏe", "Nhẹ", "Nặng", "Trọng thương"],
  TT_LANH = [0, 0.5, 1, 2];
function statusCard(c) {
  const run = c.run,
    nv = run.nhanVat,
    t = Math.max(0, Math.min(3, nv.thuongThe || 0)),
    td = run.truyDuoi;
  if (!(t > 0) && !td) return "";
  let html = "";
  if (t > 0) {
    let yrs = -(nv.lanhThuong || 0);
    for (let e = t; e > 0; e--) yrs += TT_LANH[e];
    yrs = Math.max(0, yrs);
    html += `<div class="vk-row"><span>Thương thế</span><b class="${t >= 3 ? "vk-bad" : ""}">${TT_TEN[t]}</b></div><div class="vk-mu" style="font-size:13px">Khí huyết vào trận và tu luyện −${t * 20}%, tỉ lệ đột phá −${t * 10}%. Lành hẳn sau ~${num(yrs)} năm (bế quan nhanh ×1,5).${t >= 3 ? ' <span class="vk-bad">Đang trọng thương: thua trận nữa là chết.</span>' : ""}</div>`;
  }
  if (td)
    html += `<div class="vk-row"><span>Bị truy đuổi</span><b class="vk-bad">${esc(td.ten || "Kẻ lạ")}</b></div><div class="vk-mu" style="font-size:13px">Còn ~${Math.max(1, Math.ceil((td.den || 0) - run.nam))} năm${td.kem && td.kem.length ? ` · kèm ${td.kem.reduce((a, x) => a + (x.so || 1), 0)} tên` : ""} · còn ${td.lan ?? "?"} lần bị đuổi kịp. Về sơn môn hoặc động phủ thì kẻ đuổi không vào được.</div>`;
  return `<div class="vk-card"><h3>Tình trạng</h3>${html}</div>`;
}
// Đồ công pháp/pháp khí không có mặt trong cách xếp tốt nhất → đề xuất bán
function sellAdvice(nv, best) {
  const used = new Set(best.manh.map((m) => m.item));
  const c = ctx(),
    Cc = C(),
    K = S.core;
  const rows = Object.entries(nv.tuiDo)
    .filter(([id, n]) => n > 0 && !used.has(id))
    .map(([id, n]) => ({ it: Cc.items.get(id), n, id }))
    .filter(
      (x) =>
        x.it && (x.it.loai === "cong_phap" || x.it.loai === "phap_khi"),
    );
  if (!rows.length) return "";
  const price = (id, it) => {
    try {
      return K.giaBan
        ? K.giaBan(c, id, undefined, 0)
        : Math.round((it.gia || 0) * 0.6);
    } catch {
      return Math.round((it.gia || 0) * 0.6);
    }
  };
  const topPham = Math.max(
    0,
    ...best.manh.map((m) => Cc.items.get(m.item)?.pham_cap || 0),
  );
  rows.forEach((x) => {
    const st = sellTotal(c, x.id, x.it, x.n);
    x.p = st.first;
    x.tot = st.total;
    x.left = st.left;
    x.why = !x.it.hinh
      ? "không đặt lên kinh mạch được"
      : (x.it.canh_gioi ?? 0) > nv.canhGioi
        ? "chưa đủ cảnh giới — giữ lại"
        : (x.it.pham_cap || 0) >= topPham
          ? "phẩm cao nhưng chưa có chỗ — cân nhắc giữ để dùng khi mở thêm ô"
          : "yếu hơn đồ đang xếp — nên bán";
  });
  rows.sort((a, b) => b.tot - a.tot);
  const sellable = rows.filter(
    (x) => x.why.endsWith("nên bán") || x.why.startsWith("không đặt"),
  );
  const total = sellable.reduce((a, x) => a + x.tot, 0);
  return `<div style="margin-top:10px"><b>Đồ nên bán</b> <span class="vk-mu" style="font-size:13px">(không dùng trong cách xếp tốt nhất; bán phần "nên bán" được khoảng ${Math.round(total)} linh thạch ở chỗ đang đứng)</span><table class="vk-t">${rows.map((x) => `<tr><td>${esc(x.it.ten)}${x.n > 1 ? " ×" + x.n : ""}<br><span class="vk-mu" style="font-size:12px">phẩm ${x.it.pham_cap} · ${x.why}</span></td><td>${Math.round(x.tot)}${x.left > 0 ? `<br><span class="vk-bad" style="font-size:11px">tiệm thu ${x.n - x.left}/${x.n}</span>` : ""}</td></tr>`).join("")}</table><div class="vk-mu" style="font-size:12px">Trước khi bán: nếu sắp lên cảnh giới mới hoặc sắp mở thêm ô kinh mạch, xếp lại một lần nữa để chắc món đó vẫn thừa.</div></div>`;
}
function pieceTable(R) {
  if (!R || !R.manh) return "";
  const f = (x) => (Math.abs(x - 1) < 0.005 ? "" : "×" + num(x, 2));
  const rows = R.manh
    .map((m, i) =>
      !m
        ? ""
        : `<tr><td>${i + 1}. ${esc(m.item.ten)}${m.thong ? "" : ' <span class="vk-bad">không thông</span>'}${lnTag(m.item)}</td><td><b>${num(m.heSo, 2)}</b></td><td style="font-size:12px">${
            [
              ["màu", m.mau],
              ["huyệt", m.huyet],
              ["sinh khắc", m.sinhKhac],
              ["nội tại", m.noiTai],
              ["kinh lộ", m.kinhLo],
              ["độ hợp phẩm · lĩnh ngộ", m.fit],
            ]
              .filter(([, v]) => v && Math.abs(v - 1) >= 0.005)
              .map(([k, v]) => `${k} ${f(v)}`)
              .join(" · ") || "—"
          }</td></tr>`,
    )
    .join("");
  return `<details style="margin-top:8px"><summary>Hệ số từng món (vì sao xếp vậy)</summary><table class="vk-t"><tr><th>Món</th><th>Hệ số</th><th>Đến từ</th></tr>${rows}</table><div class="vk-mu" style="font-size:12px">Hệ số nhân vào linh lực, uy lực chiêu, khí huyết/hộ thể/chỉ số của món. Tốc độ tu luyện, đột phá, kháng tâm ma của tâm pháp không nhân hệ số — chỉ cần thông.</div></details>`;
}

// ── Tab Đột phá
function tabDotPha() {
  const K = S.core,
    c = ctx(),
    nv = c.run.nhanVat;
  const h0 = K.chuanBiDotPha(c, { dan: [], thieuDot: 0 });
  const pills = [...new Set(h0.danDung || [])];
  const tdOpts = [
    0,
    ...(h0.thieuDot || [])
      .map((x, i) => (x.duoc ? i + 1 : null))
      .filter(Boolean),
  ];
  const GRADE_TEN = {
    hoan_my: "Hoàn Mỹ",
    thuong: "Thượng",
    trung: "Trung",
    ha: "Hạ",
  };
  const gradeBadge = (g) => {
    if (!g) return "—";
    const clr =
      g === "hoan_my"
        ? "#f59e0b"
        : g === "thuong"
          ? "#a855f7"
          : g === "trung"
            ? "#3b82f6"
            : "#94a3b8";
    return `<span style="color:${clr};font-weight:bold">${GRADE_TEN[g] || g}</span>`;
  };
  const combos = [];
  const sets = [[]];
  pills.forEach((p) => sets.push([p]));
  for (let i = 0; i < pills.length; i++)
    for (let j = i + 1; j < pills.length; j++)
      sets.push([pills[i], pills[j]]);
  for (const dan of sets)
    for (const td of tdOpts) {
      try {
        const h = K.chuanBiDotPha(ctx(), { dan, thieuDot: td });
        let expGrade = null;
        if (K.breakthroughGrade) {
          try {
            expGrade = K.breakthroughGrade(ctx(), {
              dan,
              thieuDot: td,
            });
          } catch (e) {}
        }
        combos.push({ dan, td, tiLe: h.tiLe, h, grade: expGrade });
      } catch {}
    }
  combos.sort(
    (a, b) =>
      b.tiLe - a.tiLe || a.dan.length - b.dan.length || a.td - b.td,
  );
  const hasGradeCol = combos.some((x) => x.grade);
  const itemTen = (id) => (C().items.get(id) || {}).ten || id;
  const rows = combos
    .slice(0, 10)
    .map(
      (x) =>
        `<tr><td>${x.dan.length ? x.dan.map(itemTen).map(esc).join(" + ") : "—"}</td><td>${x.td ? x.td + " nấc (−" + h0.thieuDot[x.td - 1].nam + " năm)" : "—"}</td><td><b>${pct(x.tiLe, 1)}</b></td>${hasGradeCol ? `<td>${gradeBadge(x.grade)}</td>` : ""}</tr>`,
    )
    .join("");
  const best = combos[0] || { h: h0, tiLe: h0.tiLe, grade: null };
  const nguon = (best.h.nguon || [])
    .map(
      (n) =>
        `<div class="vk-row"><span>${esc(n.ten)}</span><b class="${n.gt < 0 ? "vk-bad" : ""}">${n.gt >= 0 ? "+" : ""}${pct(n.gt, 1)}</b></div>`,
    )
    .join("");
  const cho = h0.cho
    ? `${esc(h0.cho.ten)} · linh khí ${esc(h0.cho.linhKhi && h0.cho.linhKhi.ten)}`
    : "—";
  const chan = h0.chan
    ? `<div class="vk-err" style="margin-bottom:8px">Chưa đột phá được: ${esc(typeof h0.chan === "string" ? h0.chan : Array.isArray(h0.chan) ? h0.chan.join("; ") : h0.chan.ten || h0.chan.lyDo || JSON.stringify(h0.chan))}</div>`
    : "";
  const curExpGrade =
    best.grade ||
    (K.breakthroughGrade
      ? (() => {
          try {
            return K.breakthroughGrade(ctx(), { dan: [], thieuDot: 0 });
          } catch (e) {
            return null;
          }
        })()
      : null);
  body.innerHTML = `${chan}
    <div class="vk-card"><h3>Lên ${esc(realmName(h0.len))}</h3>
      <div class="vk-row"><span>Đang ở</span><b>${esc(realmLabel(nv.canhGioi, nv.tieuCanhGioi))}</b></div>
      <div class="vk-row"><span>Nơi đang đứng</span><b>${cho}</b></div>
      <div class="vk-row"><span>Tỉ lệ nếu không dùng gì</span><b>${pct(h0.tiLe, 1)}</b></div>
      ${curExpGrade ? `<div class="vk-row"><span>Phẩm chất dự kiến nếu thành công ngay</span><b>${gradeBadge(curExpGrade)}</b></div>` : ""}
      ${h0.som ? '<div class="vk-bad" style="font-size:13px">Chưa Đại viên mãn: đột phá sớm bị trừ tỉ lệ.</div>' : ""}
    </div>
    <div class="vk-card"><h3>Các phương án (đan trong túi + đốt thọ)</h3>
      ${pills.length ? "" : '<div class="vk-mu" style="font-size:13px">Trong túi chưa có đan đột phá dùng được.</div>'}
      <table class="vk-t"><tr><th>Đan</th><th>Đốt thọ</th><th>Tỉ lệ</th>${hasGradeCol ? "<th>Phẩm dự kiến</th>" : ""}</tr>${rows}</table>
      <div class="vk-mu" style="font-size:12px;margin-top:6px">Chưa tính hộ pháp (+5% nếu có). Đột phá ở động phủ hoặc sư môn của mình sẽ cao hơn ở thành thị. Phẩm dự kiến lấy trực tiếp từ cơ chế seed tháng của game engine.</div></div>
    <div class="vk-card"><h3>Chi tiết phương án tốt nhất</h3>${nguon}</div>`;
}

// ── Tab Trận
function tabTran() {
  const K = S.core,
    c = ctx(),
    run = c.run,
    nv = run.nhanVat,
    Cc = C();
  const P = K.taoBenTa(nv, Cc);
  const res4 = (def, cg, muc) =>
    [0, 1, 2, 3]
      .map((tc) => {
        let E;
        try {
          E = enemyAt(def, cg, tc, muc);
        } catch {
          return "<td>—</td>";
        }
        const r = fight(P, E);
        return `<td>${r.thang ? `<span class="vk-ok">Thắng</span><br><span class="vk-mu">còn ${Math.round((r.khiHuyetThapNhat / P.khiHuyetToiDa) * 100)}%</span>` : '<span class="vk-bad">Thua</span>'}</td>`;
      })
      .join("");
  const head = `<tr><th>Đối thủ</th>${STAGE.map((s) => `<th>${s}</th>`).join("")}</tr>`;
  // Khảo hạch
  let kh = '<div class="vk-mu">Chưa vào tông môn.</div>';
  const tm = K.tongMonCua(c);
  if (tm) {
    const next = tm.capBac + 1,
      reasons = K.thieuDeThangCap(c);
    if (!K.CAP_BAC[next])
      kh = '<div class="vk-mu">Đã ở bậc cao nhất.</div>';
    else {
      kh = `<div class="vk-row"><span>Lên ${esc(K.CAP_BAC[next])}</span>${reasons.length ? `<span class="vk-bad">${esc(reasons.join("; "))}</span>` : '<span class="vk-ok">Đủ điều kiện xin khảo hạch</span>'}</div>`;
      if (next === 2 || next === 3) {
        let id;
        try {
          id = K.trialOpponent(c, tm.slot, next);
        } catch {}
        const npc = id && c.run.npc[id];
        if (!npc)
          kh +=
            '<div class="vk-mu">Không có đối thủ — khảo hạch qua luôn.</div>';
        else if (nv.canhGioi > npc.canhGioi)
          kh += `<div class="vk-ok">Đối thủ ${esc(npc.ten)} (${esc(realmLabel(npc.canhGioi, npc.tieuCanhGioi))}) yếu hơn bạn một cảnh giới: sẽ nhận thua, không phải đánh.</div>`;
        else {
          let line = "";
          try {
            const def = K.timDich(c, id);
            const E = K.taoBenDich(
              def,
              Cc,
              next === 3 ? { muc: "tinh_anh" } : {},
            );
            const r = fight(P, E);
            line = r.thang
              ? `<span class="vk-ok">Mô phỏng: THẮNG, còn ${Math.round((r.khiHuyetThapNhat / P.khiHuyetToiDa) * 100)}% máu</span>`
              : `<span class="vk-bad">Mô phỏng: THUA</span> <span class="vk-mu">(đối thủ ${Math.round(E.khiHuyetToiDa)} máu, bạn ${Math.round(P.khiHuyetToiDa)})</span>`;
          } catch (e) {
            line = '<span class="vk-mu">Không mô phỏng được.</span>';
          }
          kh += `<div class="vk-row"><span>Đối thủ: <b>${esc(npc.ten)}</b> · ${esc(realmLabel(npc.canhGioi, npc.tieuCanhGioi))}</span></div><div>${line}</div><div class="vk-mu" style="font-size:12px">Thua phải chờ 2 năm mới thi lại.</div>`;
        }
      }
    }
  }
  // Nhiệm vụ đang treo
  const names = [];
  for (let i = 0; i < 8; i++) {
    const n = realmName(i);
    if (names.includes(n)) break;
    names.push(n);
  }
  const boards = [];
  for (const [slot, v] of Object.entries(run.noiChon || {}))
    if (
      v &&
      v.treoThuong &&
      v.treoThuong.viec &&
      v.treoThuong.viec.length
    )
      boards.push([slot, v.treoThuong]);
  const nhan = (run.viecNhan || []).map((v) => [null, v]);
  const viecRows = [];
  const clean = (x) => String(x ?? "").replace(/[\ue000-\uf8ff]/g, "");
  const addViec = (v, tag) => {
    const lvl = names.findIndex((n) => clean(v.ten).endsWith("· " + n));
    const cg = lvl >= 0 ? lvl : nv.canhGioi;
    const foes = Object.values(v.vars || {}).filter(
      (x) => typeof x === "string" && Cc.enemies.has(x),
    );
    if (!foes.length) return;
    for (const id of foes)
      viecRows.push(
        `<tr><td><b>${esc(Cc.enemies.get(id).ten)}</b><br><span class="vk-mu" style="font-size:12px">${tag}${esc(clean(v.ten))}${v.congHien ? " · " + v.congHien + " cống hiến" : ""}</span></td>${res4(Cc.enemies.get(id), cg)}</tr>`,
      );
  };
  for (const [, v] of nhan) addViec(v, "Đã nhận: ");
  for (const [slot, tt] of boards)
    for (const v of tt.viec) addViec(v, "");
  const enemyOpts = [...Cc.enemies.values()]
    .sort((a, b) => String(a.ten).localeCompare(String(b.ten), "vi"))
    .map((e) => `<option value="${esc(e.id)}">${esc(e.ten)}</option>`)
    .join("");
  body.innerHTML = `
    <div class="vk-card"><h3>Khảo hạch thăng cấp tông môn</h3>${kh}</div>
    <div class="vk-card"><h3>Nhiệm vụ</h3><div class="vk-mu">Nhiệm vụ sư môn và việc treo thưởng ở thành trấn giờ nằm ở tab <b>Treo thưởng</b>, có thử sức từng việc bằng chính cách game đánh giá.</div></div>
    <div class="vk-card"><h3>Thử đánh quái bất kỳ</h3>
      <input type="text" class="vk-sel" id="vk-eq" style="width:100%;margin-bottom:6px" placeholder="Gõ tên quái, ví dụ: lang, giao long, ma tu…" autocomplete="off">
      <select class="vk-sel" id="vk-en" style="width:100%" size="6">${enemyOpts}</select>
      <div style="margin-top:6px"><select class="vk-sel" id="vk-cg"><option value="-1" selected>Cảnh giới gốc của quái</option>${names.map((n, i) => `<option value="${i}">${esc(n)}</option>`).join("")}</select>
      <select class="vk-sel" id="vk-muc"><option value="thuong">Thường</option><option value="tinh_anh">Tinh anh</option><option value="boss">Đầu lĩnh</option></select>
      <button class="vk-btn" id="vk-fg">Đánh thử</button></div><div id="vk-fo"></div></div>`;
  const allEn = [...Cc.enemies.values()].sort((a, b) =>
    String(a.ten).localeCompare(String(b.ten), "vi"),
  );
  const sel = body.querySelector("#vk-en");
  body.querySelector("#vk-eq").oninput = (ev) => {
    const q = fold(ev.target.value).trim();
    const list = q
      ? allEn.filter(
          (e) => fold(e.ten).includes(q) || fold(e.id).includes(q),
        )
      : allEn;
    sel.innerHTML =
      list
        .slice(0, 200)
        .map(
          (e) =>
            `<option value="${esc(e.id)}">${esc(e.ten)} · ${esc(realmName(e.canh_gioi ?? 0))}${e.muc && e.muc !== "thuong" ? " · " + esc(e.muc) : ""}</option>`,
        )
        .join("") || '<option value="">Không thấy quái nào</option>';
    if (list.length) sel.selectedIndex = 0;
  };
  body.querySelector("#vk-eq").dispatchEvent(new Event("input"));
  body.querySelector("#vk-fg").onclick = () => {
    const id = sel.value;
    if (!id) return;
    const def = Cc.enemies.get(id);
    let cg = +body.querySelector("#vk-cg").value;
    if (cg < 0) cg = def.canh_gioi ?? nv.canhGioi;
    const muc = body.querySelector("#vk-muc").value;
    body.querySelector("#vk-fo").innerHTML =
      `<table class="vk-t">${head}<tr><td>${esc(def.ten)}<br><span class="vk-mu" style="font-size:12px">${esc(realmName(cg))}</span></td>${res4(def, cg, muc)}</tr></table><div class="vk-mu" style="font-size:12px">Tính với kinh mạch đang xếp trong game. "còn X%" = máu còn lại thấp nhất trong trận.</div>`;
  };
}

// ── Tab Tàng Kinh Các
function itemDesc(it) {
  const b = it.bi_dong || {},
    out = [];
  if (it.linh_luc) out.push(`linh lực ${num(it.linh_luc, 2)}`);
  const sg = (v, d = 0) => (v >= 0 ? "+" : "") + pct(v, d);
  if (b.toc_do) out.push(`tu luyện ${sg(b.toc_do)}`);
  if (b.dot_pha) out.push(`đột phá ${sg(b.dot_pha)}`);
  if (b.khi_huyet) out.push(`khí huyết ${sg(b.khi_huyet)}`);
  if (b.ho_the) out.push(`hộ thể ${sg(b.ho_the, 1)}`);
  if (b.an_tuc) out.push(`liễm tức +${num(b.an_tuc, 1)}`);
  if (b.khang_tam_ma)
    out.push(
      `kháng tâm ma ${b.khang_tam_ma > 0 ? "+" : ""}${pct(b.khang_tam_ma)}`,
    );
  for (const [k, v] of Object.entries(b.chi_so || {}))
    out.push(
      `${{ than_thuc: "thần thức", ngo_tinh: "ngộ tính", than_phap: "thân pháp", can_cot: "căn cốt", dao_tam: "đạo tâm", khi_van: "khí vận" }[k] || k} +${v}`,
    );
  if (it.chieu)
    out.push(
      `chiêu <b>${esc(it.chieu.ten)}</b> (${{ cong: "đánh", thu: "thủ", hoi_phuc: "hồi máu", khong_che: "khống chế" }[it.chieu.dang] || it.chieu.dang}, uy ${num(it.chieu.uy, 2)}${it.chieu.scope ? ", đánh lan" : ""}${it.chieu.controlChance ? ", khống chế " + pct(it.chieu.controlChance) : ""})`,
    );
  return out.join(" · ");
}
function tabTKC() {
  const K = S.core,
    c = ctx(),
    nv = c.run.nhanVat,
    Cc = C();
  let list = [];
  try {
    list = [
      ...K.hangTong(c, "cong_phap"),
      ...K.hangTong(c, "phap_khi"),
    ];
  } catch (e) {
    body.innerHTML = errBox(e);
    return;
  }
  if (!list.length) {
    body.innerHTML =
      '<div class="vk-card">Chưa vào tông môn hoặc Tàng Kinh Các chưa có gì.</div>';
    return;
  }
  const tm = K.tongMonCua(c),
    cap = tm ? tm.capBac : 0,
    ch = nv.congHien || 0;
  list.forEach((e) => {
    e.it = Cc.items.get(e.id);
    e.own = (nv.tuiDo[e.id] || 0) > 0;
    e.can = e.capBac <= cap && e.gia <= ch;
  });
  list.sort((a, b) => b.can - a.can || a.gia - b.gia);
  const row = (e) =>
    `<tr><td><b>${esc(e.it.ten)}</b>${e.own ? ' <span class="vk-mu">(đã có)</span>' : ""}<br><span class="vk-mu" style="font-size:12px">${esc((e.it.he || []).map(heTen).join("/"))} · phẩm ${e.it.pham_cap} · ${itemDesc(e.it)}</span></td><td>${e.gia}${e.capBac > cap ? `<br><span class="vk-bad" style="font-size:12px">cần ${esc(K.CAP_BAC[e.capBac])}</span>` : e.gia > ch ? '<br><span class="vk-mu" style="font-size:12px">thiếu</span>' : '<br><span class="vk-ok" style="font-size:12px">mua được</span>'}</td><td class="vk-gain" data-id="${esc(e.id)}"></td></tr>`;
  body.innerHTML = `
    <div class="vk-card"><h3>Nên mua gì?</h3>
      <div class="vk-mu" style="font-size:13px">Bạn có <b>${Math.floor(ch)}</b> cống hiến, cấp <b>${esc(K.CAP_BAC[cap])}</b>. Tool thử thêm từng món vào túi, xếp lại kinh mạch và đánh trận mẫu để đo món nào lợi nhất.</div>
      <label style="display:block;margin:6px 0;font-size:14px"><input type="checkbox" id="vk-all"> Đo cả món chưa đủ cống hiến (cùng cấp bậc)</label>
      <button class="vk-btn" id="vk-ms">Đo giá trị</button>${progressHtml("vk-pr3")}<div id="vk-rank"></div></div>
    <div class="vk-card"><h3>Tàng Kinh Các</h3><table class="vk-t"><tr><th>Món</th><th>Giá</th><th>Lợi</th></tr>${list.map(row).join("")}</table></div>`;
  body.querySelector("#vk-ms").onclick = async (ev) => {
    ev.target.disabled = true;
    S.abort = false;
    const all = body.querySelector("#vk-all").checked;
    const targets = list
      .filter(
        (e) =>
          !e.own &&
          e.capBac <= cap &&
          (all || e.gia <= ch) &&
          e.it.hinh &&
          (e.it.canh_gioi ?? 0) <= nv.canhGioi,
      )
      .slice(0, 25);
    const prog = bindProgress(body.querySelector("#vk-pr3"));
    try {
      const nv0 = clone(nvNow());
      nv0.kinhMach.manh = [];
      const mode = "bal";
      const base = await anneal({
        nv0,
        mode,
        iters: 1200,
        init: nvNow().kinhMach.manh,
        onProg: (f) => prog(f / (targets.length + 1), "Mốc hiện tại…"),
      });
      const res = [];
      for (let k = 0; k < targets.length && !S.abort; k++) {
        const e = targets[k];
        const nvX = clone(nv0);
        nvX.tuiDo[e.id] = 1;
        const r = await anneal({
          nv0: nvX,
          mode,
          iters: 800,
          init: base.manh,
          onProg: (f) =>
            prog((k + 1 + f) / (targets.length + 1), `Đo ${e.it.ten}…`),
        });
        const gain = r.score - base.score;
        res.push({ e, gain, r });
        const td = body.querySelector(
          `.vk-gain[data-id="${CSS.escape(e.id)}"]`,
        );
        if (td)
          td.innerHTML =
            gain > 1
              ? `<span class="vk-ok">+${Math.round(gain)}</span><br><span class="vk-mu" style="font-size:12px">${r.wins}/${r.n} thắng</span>`
              : '<span class="vk-mu">≈0</span>';
      }
      res.sort(
        (a, b) =>
          b.gain / Math.max(10, b.e.gia) -
          a.gain / Math.max(10, a.e.gia),
      );
      body.querySelector("#vk-pr3").style.display = "none";
      body.querySelector("#vk-rank").innerHTML =
        `<div class="vk-mu" style="font-size:13px;margin:6px 0">Mốc hiện tại: thắng ${base.wins}/${base.n}. Xếp theo <b>lợi trên mỗi cống hiến</b>:</div><table class="vk-t"><tr><th>Món</th><th>Giá</th><th>Lợi</th><th>Thắng</th></tr>` +
        res
          .filter((x) => x.gain > 1)
          .map(
            (x) =>
              `<tr><td>${esc(x.e.it.ten)}</td><td>${x.e.gia}</td><td class="vk-ok">+${Math.round(x.gain)}</td><td>${x.r.wins}/${x.r.n}</td></tr>`,
          )
          .join("") +
        "</table>" +
        (res.some((x) => x.gain > 1)
          ? ""
          : '<div class="vk-mu">Không món nào giúp rõ rệt so với đồ đang có.</div>') +
        '<div class="vk-mu" style="font-size:12px">"Lợi" = điểm tổng hợp (đánh trận mẫu + tu luyện). Mua xong vào tab Kinh mạch để xếp lại.</div>';
    } catch (e) {
      console.error(e);
      body.querySelector("#vk-rank").innerHTML = errBox(e);
    }
    ev.target.disabled = false;
  };
}

// ── Tab Chợ quanh đây: quét hàng các tiệm ở những nơi đi tới được, đo món nào lợi nhất với linh thạch hiện có
const LOAI_TEN = {
  cong_phap: "Công pháp",
  phap_khi: "Pháp khí",
  dan_duoc: "Đan dược",
  dung_cu: "Dụng cụ",
  linh_duoc: "Linh dược",
  yeu_tai: "Yêu tài",
  nguyen_lieu: "Nguyên liệu",
  phu_luc: "Phù",
  phuong_tien: "Đi lại",
  tran_ban: "Trận bàn",
  tran_van: "Trận văn",
};
async function scanShops(maxY, prog) {
  const K = S.core,
    c = ctx(),
    run = c.run,
    W = c.world,
    Cc = C(),
    cur = run.viTri;
  const land = W.tho(cur),
    out = [];
  const slots = W.slots.filter((s) => {
    try {
      return W.tho(s.id) === land;
    } catch {
      return false;
    }
  });
  const near = [];
  for (const s of slots) {
    let y;
    try {
      y = K.travelYears(c, s.id);
    } catch {
      continue;
    }
    if (!(y <= maxY)) continue;
    try {
      if (!K.slotDaMo(c, s.id)) continue;
    } catch {}
    near.push([s.id, y]);
  }
  near.sort((a, b) => a[1] - b[1]);
  for (let k = 0; k < near.length; k++) {
    if (S.abort) break;
    const [slot, y] = near[k];
    if (k % 4 === 0) {
      prog(k / near.length, "Đang xem các tiệm…");
      await sleep0();
    }
    let encs = [];
    try {
      encs = K.facilitiesAt(c, slot);
    } catch {
      continue;
    }
    for (const id of encs) {
      const def = Cc.encounters.get(id);
      if (
        !def ||
        def.kind !== "cua_hang" ||
        !def.ke_hang ||
        !def.ke_hang.length ||
        def.giao_dien === "dau_gia"
      )
        continue;
      // Tiệm đổi hàng đầu mỗi năm (theo lịch game): tính hàng đúng năm bạn tới nơi.
      const arrive = run.nam + y;
      const runA = { ...run, nam: arrive, active: { id, slot } };
      const cc = { ...c, run: runA, noi: slot, enc: runA.active };
      try {
        for (const e of K.shelfStock(cc, id, slot) || []) {
          const it = Cc.items.get(e.itemId);
          if (!it) continue;
          const pf = e.priceFactor ?? 1;
          const gia =
            pf === 1
              ? undefined
              : Math.max(1, Math.round((it.gia || 0) * pf));
          let price;
          try {
            price = K.giaMua(cc, e.itemId, gia, 0);
          } catch {
            price = gia ?? it.gia;
          }
          let noi = slot;
          try {
            noi = W.info(slot).ten || slot;
          } catch {}
          out.push({
            slot,
            noi,
            years: y,
            arrive,
            doi: Math.floor(arrive) > Math.floor(run.nam),
            shop:
              String(def.ten || "Tiệm")
                .replace(/\{[^}]*\}/g, "")
                .trim() || "Tiệm",
            it,
            price,
          });
        }
      } catch (err) {
        console.warn("shop", id, slot, err);
      }
    }
  }
  return { rows: out, nPlaces: near.length };
}
function tabCho() {
  const nv = nvNow();
  body.innerHTML = `
    <div class="vk-card"><h3>Đồ đáng mua bằng linh thạch</h3>
      <div class="vk-mu" style="font-size:13px">Bạn có <b>${Math.floor(nv.linhThach || 0)}</b> linh thạch. Tool xem hàng đang bày ở các tiệm trong bán kính đi đường bạn chọn (cùng đại lục, vùng đã khám phá), rồi thử từng món mua nổi vào kinh mạch để đo món nào lợi nhất.</div>
      <div style="margin:8px 0"><select class="vk-sel" id="vk-ry"><option value="0.5">Trong 6 tháng đường</option><option value="1" selected>Trong 1 năm đường</option><option value="2">Trong 2 năm đường</option><option value="4">Trong 4 năm đường</option></select></div>
      <label style="display:block;margin:4px 0 8px;font-size:14px"><input type="checkbox" id="vk-do" checked> Đo giá trị đồ đánh/tu luyện (lâu hơn)</label>
      <button class="vk-btn" id="vk-sc">Quét chợ</button>${progressHtml("vk-pr4")}</div>
    <div id="vk-cho"></div>`;
  if (S.cho) renderCho();
  body.querySelector("#vk-sc").onclick = async (ev) => {
    ev.target.disabled = true;
    S.abort = false;
    const prog = bindProgress(body.querySelector("#vk-pr4"));
    try {
      const maxY = +body.querySelector("#vk-ry").value,
        doMeasure = body.querySelector("#vk-do").checked;
      const { rows, nPlaces } = await scanShops(maxY, (f, l) =>
        prog(f * (doMeasure ? 0.25 : 1), l),
      );
      const money = nv.linhThach || 0;
      // món rẻ nhất của mỗi loại
      const cheapest = new Map();
      for (const r of rows) {
        const o = cheapest.get(r.it.id);
        if (
          !o ||
          r.price < o.price ||
          (r.price === o.price && r.years < o.years)
        )
          cheapest.set(r.it.id, r);
      }
      const usable = [...cheapest.values()]
        .filter(
          (r) =>
            (r.it.loai === "cong_phap" || r.it.loai === "phap_khi") &&
            r.it.hinh &&
            (r.it.canh_gioi ?? 0) <= nv.canhGioi &&
            !(nv.tuiDo[r.it.id] > 0) &&
            r.price <= money,
        )
        .sort(
          (a, b) =>
            (b.it.pham_cap || 0) - (a.it.pham_cap || 0) ||
            a.price - b.price,
        )
        .slice(0, 12);
      const measured = [];
      let base = null;
      if (doMeasure && usable.length) {
        const nv0 = clone(nv);
        nv0.kinhMach.manh = [];
        base = await anneal({
          nv0,
          mode: "bal",
          iters: 1000,
          init: nv.kinhMach.manh,
          onProg: (f) =>
            prog(
              0.25 + (0.75 * f) / (usable.length + 1),
              "Mốc hiện tại…",
            ),
        });
        for (let k = 0; k < usable.length && !S.abort; k++) {
          const r = usable[k];
          const nvX = clone(nv0);
          nvX.tuiDo[r.it.id] = 1;
          const res = await anneal({
            nv0: nvX,
            mode: "bal",
            iters: 600,
            init: base.manh,
            onProg: (f) =>
              prog(
                0.25 + (0.75 * (k + 1 + f)) / (usable.length + 1),
                `Đo ${r.it.ten}…`,
              ),
          });
          measured.push({
            r,
            gain: res.score - base.score,
            wins: res.wins,
            n: res.n,
          });
        }
        measured.sort((a, b) => b.gain - a.gain);
      }
      S.cho = {
        rows,
        nPlaces,
        cheapest,
        usable,
        measured,
        base,
        money,
        maxY,
        canhGioi: nv.canhGioi,
      };
      body.querySelector("#vk-pr4").style.display = "none";
      renderCho();
    } catch (e) {
      console.error(e);
      body.querySelector("#vk-cho").innerHTML = errBox(e);
    }
    ev.target.disabled = false;
  };
}
function renderCho() {
  const {
    rows,
    nPlaces,
    cheapest,
    usable,
    measured,
    base,
    money,
    canhGioi,
  } = S.cho;
  const where = (r) =>
    `${esc(r.noi)} <span class="vk-mu">· ${r.years < 0.05 ? "ngay đây" : num(r.years) + " năm"}${r.doi ? " · hàng năm mới" : ""}</span>`;
  const all = [...cheapest.values()];
  // Đan đột phá cho cửa kế tiếp
  const pills = all
    .filter(
      (r) =>
        r.it.dot_pha &&
        (r.it.dot_pha.canh_gioi === undefined ||
          r.it.dot_pha.canh_gioi === canhGioi + 1),
    )
    .sort((a, b) => a.price - b.price);
  const lo = all
    .filter((r) => r.it.loai === "dung_cu")
    .sort((a, b) => (b.it.pham_cap || 0) - (a.it.pham_cap || 0));
  let html = `<div class="vk-card"><h3>Kết quả</h3><div class="vk-mu" style="font-size:13px">Đã xem ${nPlaces} nơi, ${rows.length} món. Tiệm đổi hàng vào <b>đầu mỗi năm</b> theo lịch game; Tool đã tính tốc độ đi của bạn và cho ra <b>hàng sẽ bày lúc bạn tới nơi</b> (nơi nào tới sau giao thừa thì là hàng năm mới). Giá tính theo từng nơi. Đi vòng qua nơi khác trước hoặc ngồi bế quan thì ngày tới thay đổi — quét lại trước khi đi.</div></div>`;
  if (measured.length) {
    const good = measured.filter((m) => m.gain > 1);
    if (good.length >= 2)
      html += `<div class="vk-card"><h3>Bộ mua tốt nhất với ${Math.floor(money)} linh thạch</h3><div class="vk-mu" style="font-size:13px">Thử kết hợp 2–3 món trong số đáng mua nhất, xem bộ nào mạnh nhất mà vẫn đủ tiền.</div><button class="vk-btn" id="vk-cb">Tìm bộ</button>${progressHtml("vk-pr7")}<div id="vk-cbo">${S.cho.combo || ""}</div></div>`;
    html += `<div class="vk-card"><h3>Đồ đánh / tu luyện đáng mua</h3>${
      good.length
        ? `<table class="vk-t"><tr><th>Món</th><th>Ở đâu</th><th>Giá</th><th>Lợi</th></tr>` +
          good
            .map(
              (m) =>
                `<tr><td><b>${esc(m.r.it.ten)}</b><br><span class="vk-mu" style="font-size:12px">${esc((m.r.it.he || []).map(heTen).join("/"))} · phẩm ${m.r.it.pham_cap} · ${itemDesc(m.r.it)}</span></td><td>${where(m.r)}</td><td>${Math.round(m.r.price)}</td><td class="vk-ok">+${Math.round(m.gain)}<br><span class="vk-mu" style="font-size:12px">${m.wins}/${m.n} thắng</span></td></tr>`,
            )
            .join("") +
          "</table>"
        : '<div class="vk-mu">Không món nào mua nổi giúp rõ rệt so với đồ đang có.</div>'
    }
<div class="vk-mu" style="font-size:12px;margin-top:6px">Mốc hiện tại: thắng ${base.wins}/${base.n} trận mẫu. "Lợi" cùng thang điểm với tab Tàng Kinh Các.</div></div>`;
  } else if (usable.length) {
    html += `<div class="vk-card"><h3>Đồ đánh / tu luyện mua nổi</h3><table class="vk-t"><tr><th>Món</th><th>Ở đâu</th><th>Giá</th></tr>${usable.map((r) => `<tr><td><b>${esc(r.it.ten)}</b><br><span class="vk-mu" style="font-size:12px">phẩm ${r.it.pham_cap} · ${itemDesc(r.it)}</span></td><td>${where(r)}</td><td>${Math.round(r.price)}</td></tr>`).join("")}</table></div>`;
  } else
    html += `<div class="vk-card"><h3>Đồ đánh / tu luyện</h3><div class="vk-mu">Không có món mới nào mua nổi với ${Math.floor(money)} linh thạch.</div></div>`;
  html += `<div class="vk-card"><h3>Đan cho lần đột phá tới</h3>${pills.length ? `<table class="vk-t"><tr><th>Đan</th><th>Ở đâu</th><th>Giá</th></tr>${pills.map((r) => `<tr><td><b>${esc(r.it.ten)}</b><br><span class="vk-mu" style="font-size:12px">+${pct(r.it.dot_pha.ti_le || 0)} tỉ lệ</span></td><td>${where(r)}</td><td class="${r.price <= money ? "vk-ok" : "vk-bad"}">${Math.round(r.price)}</td></tr>`).join("")}</table>` : '<div class="vk-mu">Các tiệm quanh đây không bày đan đột phá cho cửa kế tiếp. Thử bán kính xa hơn hoặc đợi đấu giá.</div>'}</div>`;
  if (lo.length)
    html += `<div class="vk-card"><h3>Dụng cụ nghề</h3><table class="vk-t"><tr><th>Món</th><th>Ở đâu</th><th>Giá</th></tr>${lo.map((r) => `<tr><td><b>${esc(r.it.ten)}</b><br><span class="vk-mu" style="font-size:12px">phẩm ${r.it.pham_cap}</span></td><td>${where(r)}</td><td class="${r.price <= money ? "vk-ok" : "vk-bad"}">${Math.round(r.price)}</td></tr>`).join("")}</table></div>`;
  const byPlace = new Map();
  for (const r of rows) {
    if (!byPlace.has(r.noi)) byPlace.set(r.noi, []);
    byPlace.get(r.noi).push(r);
  }
  html +=
    `<div class="vk-card"><h3>Toàn bộ hàng theo nơi</h3>` +
    [...byPlace.entries()]
      .map(
        ([noi, rs]) =>
          `<details><summary><b>${esc(noi)}</b> <span class="vk-mu">· ${rs[0].years < 0.05 ? "ngay đây" : num(rs[0].years) + " năm"} · ${rs.length} món</span></summary><table class="vk-t">${rs
            .sort((a, b) => a.price - b.price)
            .map(
              (r) =>
                `<tr><td>${esc(r.it.ten)} <span class="vk-mu" style="font-size:12px">· ${LOAI_TEN[r.it.loai] || r.it.loai} · phẩm ${r.it.pham_cap ?? "?"}</span></td><td class="${r.price <= money ? "" : "vk-mu"}">${Math.round(r.price)}</td></tr>`,
            )
            .join("")}</table></details>`,
      )
      .join("") +
    "</div>";
  body.querySelector("#vk-cho").innerHTML = html;
  const cb = body.querySelector("#vk-cb");
  if (cb)
    cb.onclick = async () => {
      cb.disabled = true;
      S.abort = false;
      const prog = bindProgress(body.querySelector("#vk-pr7"));
      try {
        const r = await comboSearch(prog);
        body.querySelector("#vk-pr7").style.display = "none";
        let h = "";
        if (!r || !r.res.length)
          h =
            '<div class="vk-mu">Không có bộ 2–3 món nào vừa tiền. Mua món lẻ tốt nhất ở bảng dưới.</div>';
        else {
          const bestSingle = r.singles
            .filter((m) => m.r.price <= money)
            .sort((a, b) => b.gain - a.gain)[0];
          const top = r.res.slice(0, 5);
          h =
            '<table class="vk-t"><tr><th>Bộ</th><th>Tổng giá</th><th>Lợi</th></tr>' +
            top
              .map(
                (x) =>
                  `<tr><td>${x.s.map((m) => `<b>${esc(m.r.it.ten)}</b> <span class="vk-mu" style="font-size:12px">(${esc(m.r.noi)})</span>`).join("<br>")}</td><td>${Math.round(x.cost)}</td><td class="vk-ok">+${Math.round(x.gain)}<br><span class="vk-mu" style="font-size:12px">${x.wins}/${x.n} thắng</span></td></tr>`,
              )
              .join("") +
            "</table>";
          if (bestSingle && bestSingle.gain >= top[0].gain)
            h += `<div class="vk-mu" style="font-size:13px">Mua lẻ ${esc(bestSingle.r.it.ten)} đã gần bằng bộ tốt nhất — có thể giữ tiền lại.</div>`;
        }
        S.cho.combo = h;
        body.querySelector("#vk-cbo").innerHTML = h;
      } catch (e) {
        body.querySelector("#vk-cbo").innerHTML = errBox(e);
      }
      cb.disabled = false;
    };
}

// Các hàm dùng chung (has, needMsg, danger, dangerTag, yrs, cleanTxt) đã được chuyển về src/core/utils.js & src/core/bridge.js
const HOA = { on: "Lửa nhỏ", thuong: "Lửa vừa", lieu: "Lửa lớn" };
const NGHE = {
  luyen_dan: "Luyện đan",
  che_phu: "Chế phù",
  luyen_bao: "Luyện bảo",
  tran_phap: "Trận pháp",
};
const GRADE = [
  ["hong_nang", "Nổ lò"],
  ["hong", "Hỏng"],
  ["ha", "Hạ"],
  ["trung", "Trung"],
  ["thuong", "Thượng"],
  ["cuc", "Cực"],
];
// Các hàm bản đồ & mô phỏng (withPlace, nearSlots, simFoe, foesOf) đã được chuyển về src/core/bridge.js
function rewardHint(def) {
  const s = JSON.stringify(def.choices || def.scenes || {}),
    out = [];
  const lt = [...s.matchAll(/"linh_thach":\s*(\d+)/g)].map(
    (m) => +m[1],
  );
  if (lt.length) out.push(`linh thạch tới ${Math.max(...lt)}`);
  const ids = [
    ...new Set(
      [
        ...s.matchAll(
          /"(?:add_item|roi_quy)":\s*(?:\{"id":\s*)?"(item\.[a-z0-9_]+)"/g,
        ),
      ].map((m) => m[1]),
    ),
  ];
  const names = ids
    .map((id) => C().items.get(id))
    .filter(Boolean)
    .sort((a, b) => (b.pham_cap || 0) - (a.pham_cap || 0))
    .slice(0, 3)
    .map((it) => it.ten);
  if (names.length) out.push(names.join(", "));
  if (/"tu_vi"/.test(s)) out.push("tu vi");
  if (/"cong_hien"/.test(s)) out.push("cống hiến");
  return out.join(" · ") || "—";
}

// ── Đột phá & thọ nguyên: kế hoạch
function planData() {
  const K = S.core,
    c = ctx(),
    nv = c.run.nhanVat,
    Cc = C();
  const tho = K.thoNguyenToiDa(nv),
    left = tho - nv.tuoi;
  const p = {
    tho,
    left,
    need: 0,
    nextNeed: 0,
    here: null,
    hereYears: Infinity,
    places: [],
    stagn: false,
  };
  try {
    p.need = K.retreatTargetGain(c, { untilExhausted: true });
    p.nextNeed = K.retreatTargetGain(c, { nextMinorRealm: true });
  } catch {}
  try {
    p.here = K.chuanBiBeQuan(c);
  } catch {}
  if (p.here && !p.here.chan && p.here.tuViNam > 0) {
    p.hereYears = p.need / p.here.tuViNam;
    try {
      const got = K.retreatGain(
        c,
        p.here,
        { dan: [], danSo: {} },
        p.hereYears,
      );
      p.stagn = got < p.need * 0.97;
    } catch {}
  }
  try {
    const d = K.tocDoTuLuyen(nv, Cc);
    p.speed = d;
    p.capped = d / (1 + (nv.tucTue || 0)) > 1.45;
  } catch {}
  return { c, nv, p };
}
// scanRetreat đã được chuyển về src/core/bridge.js
function pillCandidates(nextRealm) {
  return [...C().items.values()].filter(
    (it) =>
      it.dot_pha &&
      (it.dot_pha.canh_gioi === undefined ||
        it.dot_pha.canh_gioi === nextRealm),
  );
}
function bestRateWith(nv, extraPills, td, asDvm) {
  const c = ctx();
  if (asDvm && c.run.nhanVat.tieuCanhGioi < 3) {
    c.run.nhanVat.tieuCanhGioi = 3;
    c.run.nhanVat.peakStage = 3;
  }
  for (const id of extraPills)
    c.run.nhanVat.tuiDo[id] = Math.max(1, c.run.nhanVat.tuiDo[id] || 0);
  try {
    return S.core.chuanBiDotPha(c, { dan: extraPills, thieuDot: td })
      .tiLe;
  } catch {
    return null;
  }
}
function whereToGet(id) {
  const out = [];
  const nv = nvNow();
  if ((nv.tuiDo[id] || 0) > 0)
    out.push('<span class="vk-ok">trong túi</span>');
  try {
    const c = ctx();
    const e = [
      ...S.core.hangTong(c, "cong_phap"),
      ...S.core.hangTong(c, "phap_khi"),
    ].find((x) => x.id === id);
    if (e) out.push(`Tàng Kinh Các (${e.gia} cống hiến)`);
  } catch {}
  if (S.cho) {
    const r = S.cho.cheapest.get(id);
    if (r)
      out.push(
        `${esc(r.noi)} · ${yrs(r.years)} · ${Math.round(r.price)} lt`,
      );
  }
  return out.join("; ");
}

function tabDotPha2() {
  if (!has("chuanBiBeQuan", "retreatTargetGain", "retreatGain")) {
    tabDotPha();
    body.insertAdjacentHTML(
      "afterbegin",
      `<div class="vk-card"><h3>Kế hoạch thọ nguyên</h3>${needMsg("kế hoạch thọ nguyên")}</div>`,
    );
    return;
  }
  const { c, nv, p } = planData();
  const nextRealm = nv.canhGioi + 1;
  const atTop = p.need <= 0;
  let verdict = "";
  if (atTop)
    verdict =
      '<div class="vk-ok">Đã đủ tu vi Đại viên mãn — có thể chuẩn bị đột phá.</div>';
  else if (!p.here || p.here.chan)
    verdict = `<div class="vk-mu">Chỗ đang đứng không bế quan được${p.here && p.here.chan ? ": " + esc(p.here.chan) : ""}. Xem danh sách chỗ bế quan bên dưới.</div>`;
  else {
    const ok = p.hereYears < p.left - 5;
    verdict = `<div class="${ok ? "vk-ok" : "vk-bad"}" style="font-size:16px">${ok ? "Kịp" : "KHÔNG KỊP"}: cần khoảng <b>${Math.ceil(p.hereYears)} năm</b> bế quan ở đây, còn <b>${Math.floor(p.left)} năm</b> thọ.</div>`;
  }
  body.innerHTML = `
    <div class="vk-card"><h3>Kế hoạch tới Đại viên mãn</h3>
      <div class="vk-row"><span>Cảnh giới</span><b>${esc(realmLabel(nv.canhGioi, nv.tieuCanhGioi))}</b></div>
      <div class="vk-row"><span>Thọ còn</span><b>${Math.floor(p.left)} năm <span class="vk-mu">(${Math.floor(nv.tuoi)}/${p.tho})</span></b></div>
      <div class="vk-row"><span>Tu vi còn thiếu tới Đại viên mãn</span><b>${Math.ceil(p.need)}</b></div>
      ${p.nextNeed > 0 && p.nextNeed < p.need ? `<div class="vk-row"><span>…tới tiểu cảnh giới kế</span><b>${Math.ceil(p.nextNeed)}</b></div>` : ""}
      <div class="vk-row"><span>Bế quan ở chỗ này</span><b>${p.here && !p.here.chan ? `${num(p.here.tuViNam, 2)} tu vi/năm · ${esc(p.here.ten)} · linh khí ${esc(p.here.linhKhi && p.here.linhKhi.ten)}` : "—"}</b></div>
      ${verdict}
      ${p.stagn ? '<div class="vk-bad" style="font-size:13px">Lịch luyện không đủ cho cả quãng bế quan: giữa chừng sẽ ngưng trệ. Xen kẽ đi đánh, đi xa để hồi.</div>' : ""}
      ${p.capped ? '<div class="vk-mu" style="font-size:13px">Tốc độ tu luyện từ linh căn + công pháp đã vượt trần 1,5: thêm công pháp tăng tốc giờ chỉ còn 25% tác dụng. Đòn bẩy lớn hơn là chỗ bế quan, đan tu luyện, đạo lữ.</div>' : ""}
    </div>
    <div class="vk-card"><h3>Chỗ bế quan tốt nhất gần đây</h3>
      <select class="vk-sel" id="vk-bqy"><option value="1">Trong 1 năm đường</option><option value="3" selected>Trong 3 năm đường</option><option value="8">Trong 8 năm đường</option></select>
      <button class="vk-btn" id="vk-bq">So sánh</button>${progressHtml("vk-pr5")}<div id="vk-bqo"></div></div>
    <div class="vk-card"><h3>Đan giúp tu vi và thọ</h3><div id="vk-pill"></div></div>
    <div class="vk-card"><h3>Muốn đạt tỉ lệ đột phá cao nhất</h3><div id="vk-tgt"></div></div>
    <div id="vk-dpold"></div>`;
  // Đan tu luyện / thọ / phá bình cảnh
  const Cc = C();
  const tuPills = [...Cc.items.values()].filter(
    (it) =>
      it.tu_luyen &&
      (it.tu_luyen.canh_gioi === undefined ||
        it.tu_luyen.canh_gioi === nv.canhGioi),
  );
  const thoPills = [...Cc.items.values()].filter(
    (it) =>
      JSON.stringify(it.dung || "").includes('"tho_nguyen"') &&
      (it.canh_gioi ?? 0) <= nv.canhGioi,
  );
  const bcPills = [...Cc.items.values()].filter(
    (it) =>
      JSON.stringify(it.dung || "").includes("pha_binh_canh") &&
      it.canh_gioi === nv.canhGioi,
  );
  const tuv = (p.here && p.here.tuViNam) || 0;
  const rowP = (it, eff) => {
    let capHint = "";
    const K = S.core;
    if (
      K &&
      typeof K.drugCapped === "function" &&
      K.drugCapped(nv, it.id)
    ) {
      capHint = ` <b class="vk-bad" style="font-size:11px">[Đã đạt trần cảnh giới]</b>`;
    } else if (
      K &&
      typeof K.realmDrugUses === "function" &&
      K.DIFFICULTY &&
      K.DIFFICULTY.drugUsesPerRealm > 0
    ) {
      const u = K.realmDrugUses(nv, it.id);
      const maxU = K.DIFFICULTY.drugUsesPerRealm;
      capHint = ` <span class="vk-mu" style="font-size:11px">(còn ${Math.max(0, maxU - u)}/${maxU} viên)</span>`;
    }
    return `<tr><td><b>${esc(it.ten)}</b>${capHint}<br><span class="vk-mu" style="font-size:12px">${eff}</span></td><td style="font-size:13px">${whereToGet(it.id) || '<span class="vk-mu">chưa thấy — quét tab Chợ</span>'}</td></tr>`;
  };
  let ph = '<table class="vk-t"><tr><th>Đan</th><th>Có ở đâu</th></tr>';
  for (const it of tuPills)
    ph += rowP(
      it,
      `+${pct(it.tu_luyen.toc_do)} tu luyện trong ${it.tu_luyen.nam} năm${tuv ? ` ≈ +${Math.round(it.tu_luyen.toc_do * tuv * it.tu_luyen.nam)} tu vi` : ""}`,
    );
  for (const it of thoPills) {
    const m = /"tho_nguyen":\s*(\d+)/.exec(JSON.stringify(it.dung));
    ph += rowP(it, `+${m ? m[1] : "?"} năm thọ`);
  }
  for (const it of bcPills)
    ph += rowP(
      it,
      "phá bình cảnh của tầng hiện tại (đỡ phần tu vi tích thêm)",
    );
  ph +=
    '</table><div class="vk-mu" style="font-size:12px">Dùng nhiều lần cùng một loại đan sẽ bị dược kháng, hiệu quả giảm dần.</div>';
  body.querySelector("#vk-pill").innerHTML =
    tuPills.length + thoPills.length + bcPills.length
      ? ph
      : '<div class="vk-mu">Không có đan phù hợp cảnh giới này.</div>';
  // Mục tiêu tỉ lệ
  try {
    const dvm = nv.tieuCanhGioi < 3;
    const base0 = bestRateWith(nv, [], 0, dvm);
    const h0 = {
      ...S.core.chuanBiDotPha(c, { dan: [], thieuDot: 0 }),
      tiLe: base0 ?? 0,
    };
    const cands = pillCandidates(nextRealm)
      .map((it) => ({
        it,
        gain: (bestRateWith(nv, [it.id], 0, dvm) ?? h0.tiLe) - h0.tiLe,
      }))
      .filter((x) => x.gain > 0.0001)
      .sort((a, b) => b.gain - a.gain);
    const top2 = cands.slice(0, 2).map((x) => x.it.id);
    const tdMax = (h0.thieuDot || []).reduce(
      (m, x, i) => (x.duoc ? i + 1 : m),
      0,
    );
    const best = bestRateWith(nv, top2, tdMax, dvm);
    let html =
      (dvm
        ? '<div class="vk-mu" style="font-size:13px;margin-bottom:4px">Tính như khi bạn đã tới Đại viên mãn (đột phá sớm bị trừ rất nặng).</div>'
        : "") +
      `<div class="vk-row"><span>Không dùng gì</span><b>${pct(h0.tiLe, 1)}</b></div>`;
    cands.slice(0, 4).forEach((x) => {
      html += `<div class="vk-row"><span>+ ${esc(x.it.ten)} <span class="vk-mu" style="font-size:12px">${whereToGet(x.it.id) || "chưa thấy chỗ bán"}</span></span><b>+${pct(x.gain, 1)}</b></div>`;
    });
    if (tdMax)
      html += `<div class="vk-row"><span>+ đốt ${tdMax} nấc thọ (−${h0.thieuDot[tdMax - 1].nam} năm)</span><b>+${pct((bestRateWith(nv, [], tdMax, dvm) ?? h0.tiLe) - h0.tiLe, 1)}</b></div>`;
    html += `<div class="vk-row"><span><b>Gom đủ 2 đan tốt nhất + đốt thọ</b></span><b class="vk-ok">${best !== null ? pct(best, 1) : "?"}</b></div>`;
    html +=
      '<div class="vk-mu" style="font-size:12px">Cộng thêm: hộ pháp +5%; đột phá ở động phủ của mình hoặc sư môn cao hơn ở thành thị; linh khí dồi dào +5%. Từ Kết Đan, mọi khoản cộng bị giảm vì bình cảnh.</div>';
    body.querySelector("#vk-tgt").innerHTML = html;
  } catch (e) {
    body.querySelector("#vk-tgt").innerHTML = errBox(e);
  }
  // bảng phương án cũ
  const keep = body.innerHTML;
  tabDotPha();
  const old = body.innerHTML;
  body.innerHTML = keep;
  body.querySelector("#vk-dpold").innerHTML = old;
  body.querySelector("#vk-bq").onclick = async (ev) => {
    ev.target.disabled = true;
    S.abort = false;
    const prog = bindProgress(body.querySelector("#vk-pr5"));
    try {
      const list = await scanRetreat(
        c,
        +body.querySelector("#vk-bqy").value,
        prog,
      );
      body.querySelector("#vk-pr5").style.display = "none";
      const top = list.slice(0, 8);
      body.querySelector("#vk-bqo").innerHTML = top.length
        ? `<table class="vk-t"><tr><th>Nơi</th><th>Tu vi/năm</th><th>Tới ĐVM</th></tr>` +
          top
            .map((r) => {
              const yy = p.need > 0 ? p.need / r.info.tuViNam : 0;
              const ok = r.y + yy < p.left - 5;
              return `<tr><td><b>${esc(placeName(c, r.slot))}</b><br><span class="vk-mu" style="font-size:12px">${esc(r.info.ten)} · linh khí ${esc(r.info.linhKhi && r.info.linhKhi.ten)}${r.info.doYen ? " · " + esc(r.info.doYen) : ""} · ${yrs(r.y)} · ${dangerTag(r.d)}${r.info.rentPerYear ? ` · ${Math.round(r.info.rentPerYear)} lt/năm` : ""}${r.info.meritPerYear ? ` · ${Math.round(r.info.meritPerYear)} cống hiến/năm` : ""}</span></td><td>${num(r.info.tuViNam, 2)}</td><td class="${ok ? "vk-ok" : "vk-bad"}">${p.need > 0 ? Math.ceil(yy) + " năm" : "—"}</td></tr>`;
            })
            .join("") +
          '</table><div class="vk-mu" style="font-size:12px">Mỗi lần ngồi bị giới hạn số năm theo loại chỗ; ngồi xong cứ ngồi tiếp. Động phủ của mình không giới hạn.</div>'
        : '<div class="vk-mu">Không tìm thấy chỗ bế quan nào trong bán kính này.</div>';
    } catch (e) {
      body.querySelector("#vk-bqo").innerHTML = errBox(e);
    }
    ev.target.disabled = false;
  };
}

// ── Luyện đan & thi nghề
function gradeBar(pb) {
  return GRADE.filter(([k]) => pb[k] > 0.004)
    .map(
      ([k, t]) =>
        `<span class="${k === "thuong" || k === "cuc" ? "vk-ok" : k.startsWith("hong") ? "vk-bad" : "vk-mu"}">${t} ${pct(pb[k])}</span>`,
    )
    .join(" · ");
}
const NGHE_DON_VI = {
  luyen_dan: "viên",
  che_phu: "món",
  luyen_bao: "món",
  tran_phap: "món",
};
// Số món ra mỗi mẻ theo hạng Hạ · Trung · Thượng · Cực khi công thức không ghi riêng (lấy từ cấu hình nghề của game).
const NGHE_SO = {
  luyen_dan: [1, 2, 3, 4],
  che_phu: [2, 3, 5, 6],
  luyen_bao: [1, 1, 1, 1],
  tran_phap: [1, 1, 2, 2],
};
// Tên hỏa hầu theo từng nghề (ba mức: nhỏ · vừa · lớn) đúng như game gọi.
const NGHE_HOA = {
  luyen_dan: ["Văn hỏa", "Trung hỏa", "Vũ hỏa"],
  che_phu: ["Chậm bút", "Thường bút", "Một hơi"],
  luyen_bao: ["Nung lâu", "Tôi rèn", "Huyết luyện"],
  tran_phap: ["Khắc chậm", "Khắc đều", "Khắc gấp"],
};
const HOA_IDX = { on: 0, thuong: 1, lieu: 2 },
  HOA_MUC = ["nhỏ", "vừa", "lớn"];
const hoaTen = (ng, h) => {
  const n = (NGHE_HOA[ng] || [])[HOA_IDX[h]];
  return n ? `${n} · lửa ${HOA_MUC[HOA_IDX[h]]}` : HOA[h] || h;
};
// Đan nhận thêm mỗi lò theo món lớn nhất trong túi có nội tại luyện đan thêm (game tính từ túi đồ, không cần đeo).
const danThem = (nv) => {
  let a;
  for (const [id, n] of Object.entries(nv.tuiDo || {})) {
    if (!(n > 0)) continue;
    const v = C().items.get(id)?.noi_tai?.luyen_dan_them;
    if (v !== undefined && (a === undefined || v > a)) a = v;
  }
  return a || 0;
};
const dpNghe = (dp) => dp.nghe || "luyen_dan";
const dpRaItem = (dp, Cc) => {
  const raId = dp && (dp.ra || dp.san_pham || dp.ket_qua);
  return raId
    ? Cc.items.get(typeof raId === "object" ? raId.id : raId)
    : null;
};
// ng: lọc theo nghề (luyen_dan | che_phu | luyen_bao | tran_phap); bỏ trống = mọi nghề. Công thức game không cho mô phỏng nằm ở mảng .bad.
function recipeRows(c, nv, ng) {
  const K = S.core,
    Cc = C(),
    out = [];
  out.bad = [];
  for (const dpId of nv.donPhuong || []) {
    const dp = Cc.donPhuong.get(dpId);
    if (!dp) continue;
    if (ng && dpNghe(dp) !== ng) continue;
    let best = null;
    const tried = [];
    for (const hoa of ["on", "thuong", "lieu"]) {
      let L;
      try {
        L = K.chuanBiLuyen(
          c,
          { dp: dpId, hoa, phu: [], soMe: 1 },
          { ten: "", diem: 0 },
        );
      } catch {
        continue;
      }
      if (!L) continue;
      if (L.phuDung && L.phuDung.some((x) => x.length)) {
        try {
          const L2 = K.chuanBiLuyen(
            c,
            {
              dp: dpId,
              hoa,
              phu: L.phuDung.map((x) => x[0] || ""),
              soMe: 1,
            },
            { ten: "", diem: 0 },
          );
          if (L2) L = L2;
        } catch {}
      }
      const good = (L.phanBo.thuong || 0) + (L.phanBo.cuc || 0);
      const so = dp.so || NGHE_SO[dpNghe(dp)] || [1, 2, 3, 4],
        them = dpNghe(dp) === "luyen_dan" ? danThem(nv) : 0;
      const s0 = so[0] + them,
        s1 = (so[1] ?? so[0]) + them,
        s2 = (so[2] ?? so[1]) + them,
        s3 = (so[3] ?? so[2]) + them;
      const qtyCuc = (L.phanBo.cuc || 0) * s3,
        qty =
          (L.phanBo.ha || 0) * s0 +
          (L.phanBo.trung || 0) * s1 +
          (L.phanBo.thuong || 0) * s2 +
          qtyCuc;
      const r = { dpId, dp, hoa, L, good, qty, qtyCuc };
      tried.push(r);
      if (
        !best ||
        r.qty > best.qty + 1e-9 ||
        (Math.abs(r.qty - best.qty) < 1e-9 && good > best.good)
      )
        best = r;
    }
    if (!best) {
      out.bad.push({ dpId, dp });
      continue;
    }
    const flat =
      tried.length > 1 &&
      tried.every(
        (x) =>
          Math.abs(x.qty - best.qty) < 1e-9 &&
          Math.abs(x.good - best.good) < 1e-9,
      );
    try {
      const ra = best.L.ra;
      // Luyện bảo: món hạng Cực có thể ra vật phẩm khác (ra_cuc) nên tính giá riêng.
      const cucIt =
        dp.ra_cuc && best.qtyCuc > 0
          ? Cc.items.get(
              typeof dp.ra_cuc === "object" ? dp.ra_cuc.id : dp.ra_cuc,
            )
          : null;
      let stl;
      if (cucIt) {
        const a1 = sellTotal(
            c,
            ra.id,
            Cc.items.get(ra.id) || ra,
            best.qty - best.qtyCuc,
          ),
          a2 = sellTotal(c, cucIt.id, cucIt, best.qtyCuc);
        stl = {
          total: a1.total + a2.total,
          first: a1.first,
          left: (a1.left || 0) + (a2.left || 0),
        };
      } else
        stl = sellTotal(c, ra.id, Cc.items.get(ra.id) || ra, best.qty);
      const sell = stl.first;
      const cost =
        (dp.chu || []).reduce(
          (s, x) => s + (Cc.items.get(x.id)?.gia || 0) * x.so,
          0,
        ) + (dp.linh_thach || 0);
      const nam = best.L.nam || 0.05;
      out.push({
        ...best,
        flat,
        ra,
        sell,
        cost,
        nam,
        left: stl.left,
        profit: stl.total - cost,
        perYear: (stl.total - cost) / nam,
      });
    } catch {
      out.bad.push({ dpId, dp });
    }
  }
  return out;
}
// Mỗi nghề một tab: thi nghề + các công thức đã thuộc của đúng nghề đó.
function tabNghe(ng) {
  const K = S.core,
    c = ctx(),
    nv = c.run.nhanVat,
    Cc = C();
  const isDan = ng === "luyen_dan",
    dv = NGHE_DON_VI[ng] || "món",
    tenNghe = NGHE[ng] || ng;
  let html = "";
  // Thi nghề
  const learned = !!(nv.nghe && nv.nghe[ng]),
    noneLearned = !Object.keys(nv.nghe || {}).length;
  if (!has("phanBoKhaoHach", "thieuDeKhaoHach"))
    html += `<div class="vk-card"><h3>Thi nghề</h3>${needMsg("thi nghề")}</div>`;
  else if (!learned && !(isDan && noneLearned))
    html += `<div class="vk-card"><h3>Thi ${esc(tenNghe)}</h3><div class="vk-mu">Bạn chưa học nghề ${esc(tenNghe)} nên chưa có bậc để thi.</div></div>`;
  else {
    const bac = (nv.nghe && nv.nghe[ng] && nv.nghe[ng].bac) || 0;
    const js = [];
    let best = null;
    for (const hoa of ["on", "thuong", "lieu"]) {
      let j;
      try {
        j = K.phanBoKhaoHach(c, ng, hoa);
      } catch {
        continue;
      }
      js.push({ hoa, j });
      if (!best || j.qua > best.j.qua) best = { hoa, j };
    }
    const flatExam =
      js.length > 1 &&
      js.every((x) => Math.abs(x.j.qua - js[0].j.qua) < 1e-9);
    const rows = (flatExam ? js.slice(0, 1) : js)
      .map(
        (x) =>
          `<tr><td>${flatExam ? "Không đổi theo lửa" : hoaTen(ng, x.hoa)}</td><td><b>${pct(x.j.qua)}</b></td><td style="font-size:12px">${gradeBar(x.j.phanBo)}</td></tr>`,
      )
      .join("");
    let reasons = [];
    try {
      reasons = K.thieuDeKhaoHach(c, ng);
    } catch {}
    let parts = "";
    if (has("nguonDiemGoc") && best) {
      try {
        parts = K.nguonDiemGoc(
          c,
          ng,
          best.j.pham,
          best.hoa,
          { ten: "Trường thi", diem: 0 },
          best.j.pham,
        )
          .filter((x) => x.ten !== "Luyện vượt bậc" && x.gt)
          .map(
            (x) =>
              `<div class="vk-row"><span>${esc(x.ten)}</span><b class="${x.gt < 0 ? "vk-bad" : ""}">${x.gt > 0 ? "+" : ""}${Math.round(x.gt)}</b></div>`,
          )
          .join("");
      } catch {}
    }
    const rule = `Cần ra hạng Thượng trở lên mới đỗ. Rớt thì chỉ bị khóa 3 năm <b>ở nơi vừa thi</b> — sang nơi khác có trường thi là thi lại được ngay.`;
    html += `<div class="vk-card"><h3>Thi ${esc(tenNghe)} lên bậc ${bac + 1}</h3>
  ${reasons.length ? `<div class="vk-bad" style="margin-bottom:6px">Chưa thi được: ${esc(reasons.join("; "))}</div>` : '<div class="vk-ok" style="margin-bottom:6px">Đủ điều kiện dự thi.</div>'}
  ${best ? `<table class="vk-t"><tr><th>Hỏa hầu</th><th>Đỗ</th><th>Phân bố</th></tr>${rows}</table>` : '<div class="vk-mu">Chưa tính được kết quả thi nghề này.</div>'}
  ${best ? `<div style="margin-top:6px">${flatExam ? `Kết quả không đổi theo hỏa hầu: đỗ ${pct(best.j.qua)}.` : `Nên chọn <b>${hoaTen(ng, best.hoa)}</b>: đỗ ${pct(best.j.qua)}.`} ${rule}</div>` : ""}
  ${parts ? `<details style="margin-top:6px"><summary>Điểm của bạn (cao hơn thì đỗ dễ hơn)</summary>${parts}<div class="vk-mu" style="font-size:12px">Tăng điểm: chỉ số chính của nghề (công pháp, đồ cộng thần thức/ngộ tính), lên cảnh giới.</div></details>` : ""}</div>`;
  }
  // Công thức đã thuộc
  const title = isDan
    ? "Đan phương đã thuộc"
    : `Công thức ${tenNghe.toLowerCase()} đã thuộc`;
  if (!has("chuanBiLuyen"))
    html += `<div class="vk-card"><h3>${title}</h3>${needMsg("luyện chế")}</div>`;
  else {
    const rr = recipeRows(c, nv, ng).sort(
      (a, b) =>
        (a.L.chan ? 1 : 0) - (b.L.chan ? 1 : 0) ||
        b.perYear - a.perYear,
    );
    const bad = rr.bad.length
      ? `<div class="vk-mu" style="font-size:12px;margin-top:6px">Chưa tính được lãi (game không cho mô phỏng): ${esc(rr.bad.map((b) => (dpRaItem(b.dp, Cc) || {}).ten || b.dp.ten || b.dpId).join(", "))}.</div>`
      : "";
    const empty = isDan
      ? "Chưa thuộc đan phương nào."
      : `Chưa thuộc công thức ${esc(tenNghe.toLowerCase())} nào.`;
    html += `<div class="vk-card"><h3>${title}</h3>${
      rr.length
        ? `<table class="vk-t"><tr><th>${isDan ? "Đan" : "Món"}</th><th>Hỏa hầu nên dùng</th><th>Lãi ước tính</th></tr>` +
          rr
            .map((r) => {
              const miss = (r.dp.chu || [])
                .filter((x) => (nv.tuiDo[x.id] || 0) < x.so)
                .map(
                  (x) => `${Cc.items.get(x.id)?.ten || x.id} ×${x.so}`,
                );
              return `<tr><td><b>${esc(r.ra.ten)}</b> <span class="vk-mu" style="font-size:12px">phẩm ${r.L.pham}</span><br><span style="font-size:12px">${gradeBar(r.L.phanBo)}</span>${r.L.chan ? `<br><span class="vk-bad" style="font-size:12px">${esc(r.L.chan)}</span>` : ""}${miss.length ? `<br><span class="vk-mu" style="font-size:12px">thiếu: ${esc(miss.join(", "))}</span>` : ""}</td><td>${r.flat ? "Không đổi theo lửa" : hoaTen(ng, r.hoa)}<br><span class="vk-mu" style="font-size:12px">~${num(r.qty, 1)} ${dv}/mẻ · ${num(r.nam, 2)} năm/mẻ</span></td><td class="${r.profit > 0 ? "vk-ok" : "vk-bad"}">${Math.round(r.profit)} lt/mẻ<br><span class="vk-mu" style="font-size:12px">bán ~${r.sell}/${dv}</span></td></tr>`;
            })
            .join("") +
          `</table><div class="vk-mu" style="font-size:12px">Lãi = số ${dv} trung bình × giá bán ở đây − giá gốc nguyên liệu − linh thạch mỗi mẻ. Giá thật ở tiệm có thể chênh.</div>${bad}`
        : bad
          ? bad
          : `<div class="vk-mu">${empty}</div>`
    }</div>`;
  }
  body.innerHTML = html;
}
function tabLuyenDan() {
  tabNghe("luyen_dan");
}
function tabCheePhu() {
  tabNghe("che_phu");
}
function tabLuyenBao() {
  tabNghe("luyen_bao");
}
function tabTranPhap() {
  tabNghe("tran_phap");
}

// ───────────────────────── Tab Bản Mệnh Pháp Bảo (game mới: lấy tinh huyết tế một pháp khí làm bản mệnh) ─────────────────────────
// Số liệu: đọc từ code game khi nhận ra được (K.bm, K.bmRune); không đọc được thì dùng bảng dự phòng theo bản game hiện tại.
// Chi phí, điều kiện, ứng viên văn: gọi thẳng hàm của game (K.refineQuote, K.ascendQuote, K.refineBlock…) khi có; thiếu thì tính lại theo công thức.
const BM_DEF = {
  realmMin: 2,
  gradeMin: 2,
  gradeMax: 7,
  pickMax: 6,
  teYears: [0.5, 1, 2, 4, 8, 16],
  teEss: [3, 5, 10, 20, 40, 80],
  upEss: [0, 3, 6, 12, 25, 50],
  hoaYears: [1, 2, 4, 8, 15, 30],
  tempEss: [0.5, 1, 1.5, 3, 6, 12],
  stone: 40,
  runeStone: 20,
  reserve: 2,
  ess: [1, 0.9, 0.8, 0.7, 0.6, 0.5],
  fail: [30, 25, 20, 15, 10, 5],
  byp: [1, 1, 2, 2, 3, 3],
  failEss: 0.5,
  tier: [0, 20, 60, 150],
  mult: [1.5, 1.65, 1.8, 1.8],
  slotT: [0, 1, 2, 3],
  slotMax: 4,
  winExp: 1,
  winGap: 1,
  seatRate: 1,
  seatCap: 3,
  breakExp: 10,
  tempExp: 3,
  tempMax: 5,
  loseKeep: 0.25,
  upCap: 2,
  upExp: 20,
  runeLv: [6, 18],
  devourMax: 5,
  weakGap: 3,
  weakMul: 0.5,
  newGap: 2,
  cand: 3,
};
const BM_RUNE_VAL = {
  liet: [0.08, 0.14, 0.2, 0.25, 0.3],
  phagiap: [0.1, 0.15, 0.2, 0.25, 0.3],
  lienhoan: [0.1, 0.15, 0.2, 0.25, 0.3],
  echo_ratio: [0.5, 0.5, 0.5, 0.5, 0.5],
  hothe: [0.03, 0.06, 0.1, 0.13, 0.16],
  kimchung: [0.05, 0.08, 0.12, 0.15, 0.18],
  hutmau: [0.05, 0.1, 0.15, 0.18, 0.21],
  tulinh: [0.04, 0.08, 0.12, 0.15, 0.18],
  effect_chance: [0.25, 0.35, 0.45, 0.5, 0.55],
  troi: [0.1, 0.15, 0.2, 0.22, 0.24],
  troi_turns: [1, 1, 1, 1, 1],
  phan: [0.75, 0.8, 0.85, 0.9, 0.95],
  van: [0.6, 0.65, 0.7, 0.72, 0.75],
  quy: [1.33, 1.4, 1.5, 1.55, 1.6],
  nhiem: [0, 0.06, 0.12, 0.15, 0.18],
  uanbao: [0.08, 0.14, 0.2, 0.25, 0.3],
  inner_stat: [0.6, 1, 1.5, 1.7, 1.9],
};
const BM_HESO = [0.5, 1, 1.75, 2.75, 4, 5.5, 7.5, 5]; // hệ số phẩm (Phàm → Nghịch Thiên)
const BM_PHAM_CG = [0, 0, 1, 2, 3, 4, 5, 2]; // cảnh giới tối thiểu để dùng món theo phẩm
const BM_TANG = ["Tầng 1", "Tầng 2", "Tầng 3", "Viên Mãn"];
const BM_NHOM = {
  strike: "Công",
  guard: "Thủ",
  heal: "Hồi",
  effect: "Hiệu Ứng",
  form: "Dạng",
  element: "Hệ",
  inner: "Nội Tại",
};
const BM_NHOM_TOIDA = { effect: 2, form: 1, element: 1 };
const BM_PN = 0.85; // uy chiêu nhân thêm cho mỗi văn hiệu ứng
const bmD = () =>
  Object.assign({}, BM_DEF, (S.core && S.core.bm) || {});
const bmV = () =>
  Object.assign({}, BM_RUNE_VAL, (S.core && S.core.bmRune) || {});
const bmP = (x) => `${Math.round(x * 1000) / 10}%`.replace(".", ",");
const bmX = (x) =>
  `×${String(Math.round(x * 100) / 100).replace(".", ",")}`;
const bmLv = (a, lv) => a[Math.max(0, Math.min(a.length - 1, lv))];
function bmRunes() {
  const K = S.core,
    V = bmV(),
    v = (k, l) => bmLv(V[k], l);
  const inner = [
    ["van.minh_than", "Minh Thần", "Thần thức"],
    ["van.luyen_cot", "Luyện Cốt", "Căn cốt"],
    ["van.khinh_than", "Khinh Thân", "Thân pháp"],
    ["van.phuc_van", "Phúc Vận", "Khí vận"],
    ["van.tinh_tam", "Tĩnh Tâm", "Đạo tâm"],
  ];
  const eff = [
    ["van.thieu", "Thiêu", "Thiêu đốt"],
    ["van.doc", "Độc", "Trúng độc"],
    ["van.han", "Hàn", "Hàn khí"],
    ["van.huyet", "Huyết", "Xuất huyết"],
    ["van.tuyet_hoi", "Tuyệt Hồi", "Tuyệt hồi"],
  ];
  const he = [
    ["van.nhiem_kim", "Nhiễm Kim", "Kim"],
    ["van.nhiem_moc", "Nhiễm Mộc", "Mộc"],
    ["van.nhiem_thuy", "Nhiễm Thủy", "Thủy"],
    ["van.nhiem_hoa", "Nhiễm Hỏa", "Hỏa"],
    ["van.nhiem_tho", "Nhiễm Thổ", "Thổ"],
    ["van.nhiem_loi", "Nhiễm Lôi", "Lôi"],
    ["van.nhiem_bang", "Nhiễm Băng", "Băng"],
    ["van.nhiem_phong", "Nhiễm Phong", "Phong"],
    ["van.nhiem_am", "Nhiễm Ám", "Ám"],
  ];
  const desc = (id, l, mut, fallback) => {
    if (K && K.describeRune) {
      try {
        return K.describeRune(id, l, mut);
      } catch (e) {}
    }
    return fallback();
  };
  const R = [
    {
      id: "van.uan_bao",
      name: "Uẩn Bảo",
      g: "inner",
      relic: true,
      d: (l, m) =>
        desc(
          "van.uan_bao",
          l,
          m,
          () => `Bị động và linh lực của món +${bmP(v("uanbao", l))}`,
        ),
    },
    ...inner.map(([id, name, st]) => ({
      id,
      name,
      g: "inner",
      relic: true,
      d: (l, m) =>
        desc(
          id,
          l,
          m,
          () =>
            `${st} +${String(Math.round(v("inner_stat", l) * 100) / 100).replace(".", ",")} × hệ số phẩm`,
        ),
    })),
    {
      id: "van.liet",
      name: "Liệt",
      g: "strike",
      atk: true,
      d: (l, m) =>
        desc("van.liet", l, m, () => `Uy chiêu +${bmP(v("liet", l))}`),
    },
    {
      id: "van.phagiap",
      name: "Phá Giáp",
      g: "strike",
      atk: true,
      d: (l, m) =>
        desc(
          "van.phagiap",
          l,
          m,
          () =>
            `Đánh trúng có thể phá giáp địch ${bmP(v("phagiap", l))}`,
        ),
    },
    {
      id: "van.lienhoan",
      name: "Liên Hoàn",
      g: "strike",
      atk: true,
      d: (l, m) =>
        desc(
          "van.lienhoan",
          l,
          m,
          () =>
            `${bmP(v("lienhoan", l))} đánh thêm một đòn, uy ${bmX(v("echo_ratio", l))}`,
        ),
    },
    {
      id: "van.ho_the",
      name: "Hộ Thể",
      g: "guard",
      d: (l, m) =>
        desc("van.ho_the", l, m, () => `Hộ thể +${bmP(v("hothe", l))}`),
    },
    {
      id: "van.kim_chung",
      name: "Kim Chung",
      g: "guard",
      d: (l, m) =>
        desc(
          "van.kim_chung",
          l,
          m,
          () =>
            `Ra chiêu xong dựng thuẫn ${bmP(v("kimchung", l))} khí huyết tối đa, giữ một lượt`,
        ),
    },
    {
      id: "van.hut_huyet",
      name: "Hút Huyết",
      g: "heal",
      atk: true,
      d: (l, m) =>
        desc(
          "van.hut_huyet",
          l,
          m,
          () =>
            `Hút ${bmP(v("hutmau", l))} sát thương chiêu hóa khí huyết`,
        ),
    },
    {
      id: "van.tu_linh",
      name: "Tụ Linh",
      g: "heal",
      d: (l, m) =>
        desc(
          "van.tu_linh",
          l,
          m,
          () => `Linh lực mỗi lượt +${bmP(v("tulinh", l))}`,
        ),
    },
    ...eff.map(([id, name, lb]) => ({
      id,
      name,
      g: "effect",
      atk: true,
      d: (l, m) =>
        desc(
          id,
          l,
          m,
          () =>
            `${bmP(v("effect_chance", l))} gây ${lb}, uy chiêu ${bmX(BM_PN)}`,
        ),
    })),
    {
      id: "van.troi",
      name: "Trói",
      g: "effect",
      atk: true,
      d: (l, m) =>
        desc(
          "van.troi",
          l,
          m,
          () =>
            `${bmP(v("troi", l))} trói địch ${v("troi_turns", l)} lượt, uy chiêu ${bmX(BM_PN)}`,
        ),
    },
    {
      id: "van.phan_anh",
      name: "Phân Ảnh",
      g: "form",
      atk: true,
      d: (l, m) =>
        desc(
          "van.phan_anh",
          l,
          m,
          () => `Chiêu đơn hóa lan, uy ${bmX(v("phan", l))}`,
        ),
    },
    {
      id: "van.van_anh",
      name: "Vạn Ảnh",
      g: "form",
      atk: true,
      tier: 3,
      d: (l, m) =>
        desc(
          "van.van_anh",
          l,
          m,
          () => `Chiêu hóa toàn trận, uy ${bmX(v("van", l))}`,
        ),
    },
    {
      id: "van.quy_nhat",
      name: "Quy Nhất",
      g: "form",
      atk: true,
      d: (l, m) =>
        desc(
          "van.quy_nhat",
          l,
          m,
          () =>
            `Chiêu lan / toàn trận thu về đơn, uy ${bmX(v("quy", l))}`,
        ),
    },
    ...he.map(([id, name, h]) => ({
      id,
      name,
      g: "element",
      atk: true,
      d: (l, m) =>
        desc(
          id,
          l,
          m,
          () =>
            `Nhuộm chiêu sang hệ ${h}${v("nhiem", l) ? `, uy +${bmP(v("nhiem", l))}` : ""}`,
        ),
    })),
  ];
  return Object.fromEntries(R.map((r) => [r.id, r]));
}
const bmRuneName = (id) => {
  const r = bmRunes()[id];
  return r
    ? r.name
    : String(id || "—")
        .replace("van.", "")
        .replace(/_/g, " ");
};
const bmGrade = (it) =>
  Math.max(1, Math.min(8, (it && it.pham_cap) ?? 2));
const bmPham = (g) => (PHAM_TEN[g - 1] || "Phẩm " + g) + " Phẩm";
const bmTier = (D, exp) => {
  let t = 0;
  D.tier.forEach((e, i) => {
    if (exp >= e) t = i;
  });
  return t;
};
const bmSlots = (D, n) =>
  Math.min(
    D.slotMax,
    D.slotT[bmTier(D, n.exp)] +
      (n.grade > n.base ||
      (n.base >= D.gradeMax && bmTier(D, n.exp) >= D.tier.length - 1)
        ? 1
        : 0),
  );
const bmLuyenBao = (nv) => {
  const b = nv.nghe && nv.nghe.luyen_bao && nv.nghe.luyen_bao.bac;
  return b === undefined ? 0 : Math.min(5, b + 1);
};
const bmLife = (nv) => {
  try {
    return S.core.thoNguyenToiDa(nv) - nv.tuoi;
  } catch {
    return Infinity;
  }
};
function bmEligible(it) {
  if (has("natalItemError")) {
    try {
      return S.core.natalItemError(it);
    } catch {}
  }
  const D = bmD(),
    g = bmGrade(it);
  if (it.loai !== "phap_khi")
    return "Chỉ pháp khí mới làm bản mệnh được.";
  if (g === D.pickMax + 1)
    return "Phẩm Thần đã là trần, không nuôi lớn thêm được. Để món này trên lưới, bản mệnh nên chọn món thấp hơn rồi Dưỡng giai.";
  if (g < D.gradeMin || g > D.pickMax)
    return "Phẩm món không hợp làm bản mệnh.";
  return it.tru_vat || it.dung_cu || it.di_hoa
    ? "Món này có công dụng riêng, không làm bản mệnh được."
    : null;
}
function bmCostTe(nv, it) {
  if (has("refineQuote")) {
    try {
      return S.core.refineQuote(nv, it);
    } catch {}
  }
  const D = bmD(),
    g = bmGrade(it),
    i = g - D.gradeMin,
    a = bmLuyenBao(nv);
  return {
    years: D.teYears[i],
    essence: D.teEss[i] * D.ess[a],
    stone: Math.round(D.stone * BM_HESO[g - 1]),
    failPercent: D.fail[a],
    byproducts: (nv.natalReleased || []).includes(it.id) ? 0 : D.byp[a],
  };
}
function bmCostUp(nv, n) {
  if (has("ascendQuote")) {
    try {
      return S.core.ascendQuote(nv, n);
    } catch {}
  }
  const D = bmD(),
    g = n.grade + 1,
    i = g - D.gradeMin,
    a = bmLuyenBao(nv);
  return {
    years: D.teYears[i],
    essence: D.upEss[i] * D.ess[a],
    stone: Math.round(D.stone * BM_HESO[g - 1]),
    failPercent: D.fail[a],
  };
}
function bmWhyTe(nv, it) {
  if (has("refineBlock")) {
    try {
      return S.core.refineBlock(nv, it);
    } catch {}
  }
  const D = bmD(),
    g = bmGrade(it);
  if (nv.natal) return "Đã có bản mệnh. Hóa bản mệnh cũ trước.";
  if (nv.canhGioi < D.realmMin)
    return "Trúc Cơ mới tế luyện được bản mệnh.";
  const e = bmEligible(it);
  if (e) return e;
  if (nv.canhGioi < BM_PHAM_CG[g - 1])
    return "Cảnh giới chưa đủ để dùng món này.";
  const c = bmCostTe(nv, it);
  if (nv.linhThach < c.stone) return "Thiếu linh thạch.";
  return bmLife(nv) >= c.essence * D.reserve
    ? null
    : "Thọ nguyên còn quá ít để đốt tinh huyết.";
}
function bmWhyUp(nv, D) {
  if (has("ascendBlock")) {
    try {
      return S.core.ascendBlock(nv);
    } catch {}
  }
  const n = nv.natal;
  if (!n) return "Chưa có bản mệnh.";
  if (bmTier(D, n.exp) < D.tier.length - 1) return "Cần tầng Viên mãn.";
  if (n.grade >= n.base + D.upCap || n.grade >= D.gradeMax)
    return "Đã tới trần giai.";
  if (n.grade + 1 > Math.min(D.gradeMax, nv.canhGioi + 2))
    return "Cảnh giới chưa đủ cho phẩm kế tiếp.";
  const c = bmCostUp(nv, n);
  if (nv.linhThach < c.stone) return "Thiếu linh thạch.";
  return bmLife(nv) >= c.essence * D.reserve
    ? null
    : "Thọ nguyên còn quá ít để đốt tinh huyết.";
}
function bmWhyTemper(nv, D) {
  if (has("temperBlock")) {
    try {
      return S.core.temperBlock(nv);
    } catch {}
  }
  const n = nv.natal;
  if (!n) return "Chưa có bản mệnh.";
  if (((nv.natalTemper || {})[nv.canhGioi] || 0) >= D.tempMax)
    return "Cảnh giới này đã đốt đủ số lần.";
  return bmLife(nv) >= D.tempEss[n.grade - D.gradeMin] * D.reserve
    ? null
    : "Thọ nguyên còn quá ít.";
}
const bmOkTxt = (why) =>
  why
    ? `<span class="vk-bad">${esc(why)}</span>`
    : '<span class="vk-ok">Làm được ngay</span>';
const bmFmtY = (x) => num(x, 2) + " năm";
// Kỳ vọng nếu cứ thử tới khi thành: mỗi lần thất bại tốn tinh huyết một phần (failEss), thành công tốn đủ.
function bmExpect(c, D) {
  const f = c.failPercent / 100,
    tries = 1 / (1 - f);
  return {
    tries,
    essence: c.essence + (D.failEss * c.essence * f) / (1 - f),
    stone: c.stone * tries,
    years: c.years * tries,
  };
}
function bmCand(c, itemId) {
  if (!has("devourCandidates", "devourItemError")) return null;
  try {
    const why = S.core.devourItemError(c, itemId);
    if (why) return { why };
    const r = S.core.devourCandidates(c, itemId);
    return typeof r === "string" ? { why: r } : { list: r };
  } catch (e) {
    return { why: "không dò được" };
  }
}

function tabBanMenh() {
  const K = S.core,
    c = ctx(),
    Cc = C(),
    nv = c.run.nhanVat,
    D = bmD(),
    RN = bmRunes(),
    n = nv.natal;
  const itemName = (id) => {
    const it = Cc.items.get(id);
    return it
      ? it.ten
      : String(id).replace("item.", "").replace(/_/g, " ");
  };
  const row = (a, b) =>
    `<div class="vk-row"><span>${a}</span><b style="text-align:right">${b}</b></div>`;
  const miss = [
    "refineQuote",
    "ascendQuote",
    "refineBlock",
    "natalItemError",
    "ascendBlock",
    "temperBlock",
    "devourCandidates",
    "devourItemError",
    "innateRuneOf",
  ].filter((k) => !has(k));
  let html = "";

  // ── 1. Bản mệnh hiện tại
  if (n) {
    const it = Cc.items.get(n.item),
      ti = bmTier(D, n.exp),
      nextT = D.tier[ti + 1];
    const slots = bmSlots(D, n),
      life = bmLife(nv);
    const damaged = n.damagedUntil && n.damagedUntil > nv.tuoi;
    const inn = n.innate,
      innNext = D.runeLv[inn.level];
    const isInnMax = K.isRuneMaxed
      ? K.isRuneMaxed(inn.level)
      : inn.level >= 4;
    const isInnHigh = K.isRuneHighTier
      ? K.isRuneHighTier(inn.level)
      : inn.level >= 2 && !isInnMax;
    let innProgress = "";
    if (isInnMax) {
      innProgress = " (tối đa)";
    } else if (isInnHigh) {
      const ch = K.runeUpgradeChance ? K.runeUpgradeChance(inn) : null;
      innProgress = ch ? ` (tỉ lệ ${pct(ch, 1)})` : " (bậc tỉ lệ)";
    } else if (innNext) {
      innProgress = ` (${inn.points || 0}/${innNext})`;
    }

    const runesOn =
      n.runes
        .map((id) => {
          const r = (nv.natalRunes || {})[id] || { level: 0 };
          const isMut = r.mutant || false;
          return `<span class="tc-pill">${esc(bmRuneName(id))} · cấp ${r.level + 1}${isMut ? " · Dị" : ""}</span>`;
        })
        .join("") || '<span class="vk-mu">chưa khắc văn nào</span>';
    const kho = Object.entries(nv.natalRunes || {})
      .filter(([id]) => id !== inn.id)
      .map(([id, r]) => {
        const nx = D.runeLv[r.level];
        const isMut = r.mutant || false;
        const isMax = K.isRuneMaxed
          ? K.isRuneMaxed(r.level)
          : r.level >= 4;
        const isHigh = K.isRuneHighTier
          ? K.isRuneHighTier(r.level)
          : r.level >= 2 && !isMax;
        let progress = "";
        if (isMax) {
          progress = " (tối đa)";
        } else if (isHigh) {
          const ch = K.runeUpgradeChance
            ? K.runeUpgradeChance(r)
            : null;
          progress = ch ? ` (tỉ lệ ${pct(ch, 1)})` : " (bậc tỉ lệ)";
        } else if (nx) {
          progress = ` (${r.points || 0}/${nx})`;
        }
        return `<span class="tc-pill">${esc(bmRuneName(id))} · cấp ${r.level + 1}${isMut ? " · Dị" : ""}${progress}${n.runes.includes(id) ? " · đang khắc" : ""}</span>`;
      })
      .join("");
    const tmp = (nv.natalTemper || {})[nv.canhGioi] || 0;
    const dev =
      nv.natalYear && nv.natalYear.year === Math.floor(nv.tuoi)
        ? nv.natalYear.devoured
        : 0;
    const dTen =
      it && it.chieu
        ? "Chiêu bản mệnh (món có chiêu)"
        : "Pháp khí bị động";
    html += `<div class="vk-card"><h3>Bản Mệnh Của ${esc(nv.ten)}</h3>
${row("Pháp bảo", esc(it ? it.ten : n.item))}
${row("Phẩm", `${esc(bmPham(n.grade))}${n.grade > n.base ? ` <span class="vk-mu">(gốc ${esc(bmPham(n.base))}, đã nâng ${n.grade - n.base})</span>` : ""}`)}
${row("Loại", esc(dTen))}
${row("Tầng", `${BM_TANG[ti]} <span class="vk-mu">· tâm huyết ${n.exp}${nextT !== undefined ? "/" + nextT : " (đầy)"}</span>`)}
${row("Hệ số cố định", bmX(D.mult[ti]))}
${row("Ô khắc văn", `${n.runes.length}/${slots}`)}
${row("Văn bẩm sinh", `${esc(bmRuneName(inn.id))} · cấp ${inn.level + 1}${inn.mutant ? " · Dị" : ""}${innProgress}`)}
<div class="vk-mu" style="font-size:12.5px;margin:2px 0 4px">${esc(RN[inn.id] ? RN[inn.id].d(inn.level, inn.mutant) : "")}</div>
${row("Huyết luyện cảnh giới này", `${tmp}/${D.tempMax}`)}
${row("Nuốt món năm nay", `${dev}/${D.devourMax}`)}
${row("Tình trạng", damaged ? `<span class="vk-bad">Đang tổn, còn ${num(n.damagedUntil - nv.tuoi, 2)} năm</span>` : '<span class="vk-ok">Nguyên vẹn</span>')}
<div class="tc-sec"><b>Văn đang khắc</b>${runesOn}</div>
${kho ? `<div class="tc-sec"><b>Kho văn đã ngộ</b>${kho}</div>` : ""}
${life < Infinity ? `<div class="vk-mu" style="font-size:12.5px;margin-top:6px">Thọ nguyên còn ${Math.floor(life)} năm: mọi lần đốt tinh huyết cần còn ít nhất ${D.reserve} lần số năm sẽ đốt.</div>` : ""}
      </div>`;

    // ── 2. Việc có thể làm với bản mệnh
    const wTmp = bmWhyTemper(nv, D),
      wUp = bmWhyUp(nv, D);
    const cTmp = D.tempEss[n.grade - D.gradeMin];
    const cUp = n.grade + 1 <= D.gradeMax ? bmCostUp(nv, n) : null;
    const eUp = cUp ? bmExpect(cUp, D) : null;
    const hoa = D.hoaYears[n.grade - D.gradeMin];
    const need2 = nextT !== undefined ? nextT - n.exp : 0;
    html += `<div class="vk-card"><h3>Chăm Bản Mệnh</h3>
<div class="tc-sec"><b>Huyết luyện</b>
  ${row("Đốt tinh huyết", `${num(cTmp, 2)} năm thọ · +${D.tempExp} tâm huyết`)}
  ${row("Tình trạng", bmOkTxt(wTmp))}
  ${nextT !== undefined ? `<div class="vk-mu" style="font-size:12.5px">Còn ${need2} tâm huyết để lên ${BM_TANG[ti + 1]} (khoảng ${Math.ceil(need2 / D.tempExp)} lần huyết luyện nếu chỉ dùng cách này).</div>` : ""}</div>
<div class="tc-sec"><b>Nâng giai</b>
  ${
    cUp
      ? `${row("Cần", "Tầng Viên Mãn · " + esc(bmPham(n.grade + 1)))}
  ${row("Mỗi lần thử", `${bmFmtY(cUp.years)} · đốt ${num(cUp.essence, 1)} năm thọ · ${cUp.stone} linh thạch`)}
  ${row("Tỉ lệ thành", pct(1 - cUp.failPercent / 100))}
  ${row("Thất bại", `chỉ mất ${num(cUp.essence * D.failEss, 1)} năm thọ, giữ nguyên tầng`)}
  ${row("Kỳ vọng tới khi thành", `~${num(eUp.tries, 1)} lần · ${num(eUp.essence, 1)} năm thọ · ${Math.round(eUp.stone)} linh thạch`)}
  ${row("Sau khi thành", `tâm huyết về ${D.upExp}, ô khắc +1`)}
  ${row("Tình trạng", bmOkTxt(wUp))}`
      : '<div class="vk-mu">Đã ở phẩm cao nhất có thể làm bản mệnh.</div>'
  }
  <div class="vk-mu" style="font-size:12.5px">Chỉ nâng tối đa ${D.upCap} giai so với phẩm gốc, và không quá cảnh giới + 2.</div></div>
${damaged ? `<div class="tc-sec"><b>Tĩnh dưỡng</b>Bản mệnh đang tổn: chờ hết hạn hoặc tĩnh dưỡng (tốn một khoảng thời gian ngắn) để khắc văn và dùng lại bình thường.</div>` : ""}
<div class="tc-sec"><b>Hóa bản mệnh (bỏ bản mệnh)</b>
  ${row("Cái giá", `${hoa} năm thọ + thương thế nặng`)}
  <div class="vk-mu" style="font-size:12.5px">Món trở về túi, mất tầng, giai, văn bẩm sinh và ô khắc; văn đã ngộ vẫn còn trong kho. Món này tế lại sẽ không còn tinh hoa thừa.</div></div>
      </div>`;
  } else {
    html += `<div class="vk-card"><h3>Bản Mệnh Pháp Bảo</h3>
<div class="vk-mu" style="font-size:13.5px;line-height:1.55">Chưa có bản mệnh. ${nv.canhGioi < D.realmMin ? `Cần tới <b>${esc(realmName(D.realmMin))}</b> mới tế luyện được (hiện ${esc(realmName(nv.canhGioi))}).` : "Chọn một pháp khí trong túi ở bảng dưới để tế luyện bằng tinh huyết."}
Bản mệnh lớn dần theo tâm huyết (thắng trận, bế quan, đột phá, huyết luyện), mở ô khắc văn và có thể nâng giai.</div></div>`;
  }

  // ── 3. Chọn món tế luyện
  const inBag = Object.entries(nv.tuiDo || {})
    .filter(([, k]) => k > 0)
    .map(([id]) => Cc.items.get(id))
    .filter((it) => it && it.loai === "phap_khi");
  const onGrid = new Set((nv.kinhMach.manh || []).map((m) => m.item));
  const cand = inBag
    .filter((it) => !bmEligible(it))
    .sort(
      (a, b) =>
        bmGrade(b) - bmGrade(a) ||
        String(a.ten).localeCompare(String(b.ten), "vi"),
    );
  const rowsTe = cand
    .slice(0, 14)
    .map((it) => {
      const g = bmGrade(it),
        cs = bmCostTe(nv, it),
        ex = bmExpect(cs, D),
        why = bmWhyTe(nv, it);
      const inn = has("innateRuneOf")
        ? (() => {
            try {
              return bmRuneName(K.innateRuneOf(it));
            } catch {
              return "";
            }
          })()
        : "";
      const tag = onGrid.has(it.id)
        ? ' <span class="vk-bad">đang trên kinh mạch: gỡ ra trước</span>'
        : "";
      return `<div class="tc-sec"><b>${esc(it.ten)} <span class="vk-mu">· ${esc(bmPham(g))}${it.chieu ? " · có chiêu" : ""}</span></b>
${row("Mỗi lần", `${bmFmtY(cs.years)} · ${cs.stone} linh thạch · đốt ${num(cs.essence, 1)} năm thọ`)}
${row("Tỉ lệ thành", pct(1 - cs.failPercent / 100))}
${row("Kỳ vọng tới khi thành", `~${num(ex.tries, 1)} lần · ${num(ex.essence, 1)} năm thọ`)}
${row("Phụ phẩm khi thành", cs.byproducts ? `${cs.byproducts} pháp khí thấp hơn một phẩm` : "không có (món từng là bản mệnh)")}
${inn ? row("Văn bẩm sinh", esc(inn)) : ""}
${row("Tình trạng", (n ? '<span class="vk-mu">đã có bản mệnh</span>' : bmOkTxt(why)) + tag)}</div>`;
    })
    .join("");
  html += `<div class="vk-card"><h3>Món Trong Túi Tế Luyện Được</h3>
      <div class="vk-mu" style="font-size:12.5px;line-height:1.5">Tế luyện lấy tinh huyết (thọ nguyên) và linh thạch; thất bại chỉ mất ${pct(D.failEss)} số tinh huyết và món còn nguyên. Tay nghề Luyện Bảo càng cao thì tỉ lệ thành càng lớn, tinh huyết càng ít, phụ phẩm càng nhiều.
      Bạn đang ở bậc luyện bảo hiệu lực <b>${bmLuyenBao(nv)}</b>/5.</div>
      ${!rowsTe ? '<div class="vk-mu" style="margin-top:8px">Trong túi chưa có pháp khí nào hợp làm bản mệnh.</div>' : n ? `<details style="margin-top:8px"><summary class="vk-mu">Xem ${Math.min(cand.length, 14)} món (để tính trước khi hóa bản mệnh cũ)</summary>${rowsTe}</details>` : rowsTe}
      ${cand.length > 14 ? `<div class="vk-mu" style="font-size:12px">Còn ${cand.length - 14} món khác, hiện chỉ liệt kê 14 món phẩm cao nhất.</div>` : ""}</div>`;

  // ── 4. Nuốt món để ngộ văn
  if (n) {
    const nut = inBag
      .map((it) => ({ it, r: bmCand(c, it.id) }))
      .filter((x) => x.r && x.r.list)
      .sort((a, b) => bmGrade(b.it) - bmGrade(a.it));
    const dLeft = D.devourMax - dev0(nv, D);
    const mk = ({ it, r }) => {
      const g = bmGrade(it),
        weak = g <= n.grade - D.weakGap,
        pts = BM_HESO[g - 1] * (weak ? D.weakMul : 1);
      const chips = r.list
        .map((id) => {
          const has0 = id === n.innate.id || (nv.natalRunes || {})[id];
          const lv =
            id === n.innate.id
              ? n.innate.level
              : has0
                ? nv.natalRunes[id].level
                : -1;
          const maxL = D.runeMaxLv || 5;
          const note =
            lv >= 0
              ? `nâng (cấp ${lv + 1}${lv + 1 >= maxL ? ", đã tối đa" : lv >= D.runeLv.length ? ", nuốt theo tỉ lệ" : `, +${num(pts, 2)} điểm`})`
              : g < n.grade - D.newGap
                ? "ngộ mới (món quá yếu, không ngộ được)"
                : "ngộ mới";
          return `<span class="tc-pill" title="${esc(RN[id] ? RN[id].d(0) : "")}">${esc(bmRuneName(id))} · ${esc(note)}</span>`;
        })
        .join("");
      return `<div class="tc-sec"><b>${esc(it.ten)} <span class="vk-mu">· ${esc(bmPham(g))}${weak ? " · quá yếu, điểm giảm nửa" : ""}</span></b>${chips}</div>`;
    };
    html += `<div class="vk-card"><h3>Nuốt Món Ngộ Văn</h3>
<div class="vk-mu" style="font-size:12.5px;line-height:1.5">Mỗi năm nuốt tối đa ${D.devourMax} món (còn ${Math.max(0, dLeft)}). Mỗi món hiện ${D.cand} văn ứng viên, bạn chọn một: văn chưa có thì ngộ mới (cần món không yếu hơn bản mệnh quá ${D.newGap} phẩm), văn đã có thì cộng điểm bằng hệ số phẩm của món (cấp 2 ở ${D.runeLv[0]} điểm, cấp 3 ở ${D.runeLv[1]} điểm; cấp 4–5 nuốt thành công theo tỉ lệ với món phẩm ≥ phẩm hiệu dụng).
Ứng viên được game gieo theo kiếp, món, năm tuổi và số món đã nuốt, nên đổi khi sang năm hoặc sau mỗi lần nuốt.</div>
${has("devourCandidates", "devourItemError") ? (nut.slice(0, 10).map(mk).join("") || '<div class="vk-mu" style="margin-top:8px">Không có món nào nuốt được lúc này (cần pháp khí trong túi, không trên kinh mạch, không khóa).</div>') + (nut.length > 10 ? `<div class="vk-mu" style="font-size:12px">Còn ${nut.length - 10} món khác.</div>` : "") : needMsg("ứng viên văn khi nuốt")}</div>`;
  }

  // ── 5. Bảng tham khảo
  const groups = {};
  Object.values(RN).forEach((r) => {
    (groups[r.g] = groups[r.g] || []).push(r);
  });
  const runeHtml = Object.keys(BM_NHOM)
    .filter((g) => groups[g])
    .map(
      (g) =>
        `<div class="tc-sec"><b>${esc(BM_NHOM[g])}${BM_NHOM_TOIDA[g] ? ` <span class="vk-mu">· tối đa ${BM_NHOM_TOIDA[g]} văn trên ô khắc</span>` : ""}</b>${groups[g].map((r) => `<div style="margin:2px 0"><b>${esc(r.name)}</b>${r.atk ? ' <span class="vk-mu">(chiêu công)</span>' : ""}${r.relic ? ' <span class="vk-mu">(pháp khí bị động)</span>' : ""}${r.tier ? ` <span class="vk-mu">(cần ${BM_TANG[r.tier]})</span>` : ""}<br><span class="vk-mu" style="font-size:12.5px">Cấp 1: ${esc(r.d(0))}<br>Cấp 3: ${esc(r.d(2))}</span></div>`).join("")}</div>`,
    )
    .join("");
  html += `<div class="vk-card"><h3>Cách Bản Mệnh Lớn Lên</h3>
      <div style="font-size:13px;line-height:1.6">
<div>• Tầng theo tâm huyết: ${D.tier.map((e, i) => `${BM_TANG[i]} từ ${e}`).join(" · ")}.</div>
<div>• Hệ số cố định ${D.mult.map((m, i) => `${BM_TANG[i]} ${bmX(m)}`).join(" · ")}; ô khắc theo tầng: ${D.slotT.join(" · ")} (+1 khi đã nâng giai, tối đa ${D.slotMax}).</div>
<div>• <b>Tăng:</b> thắng trận có dùng bản mệnh (quái không thấp hơn mình quá ${D.winGap} cảnh giới) +${D.winExp}; bế quan +${D.seatRate} mỗi năm bế quan, tối đa ${D.seatCap} mỗi năm; đột phá lên cảnh giới mới +${D.breakExp}; huyết luyện +${D.tempExp}.</div>
<div>• <b>Giảm:</b> bại trận mất ${pct(D.loseKeep)} tâm huyết (không tụt dưới mốc tầng đang đứng); gặp quái cao hơn một cảnh giới trở lên còn bị bản mệnh tổn một lúc.</div>
<div>• Món có chiêu chỉ được cộng tâm huyết khi thắng trận mà dùng chính chiêu đó.</div>
<div>• Khắc văn tốn ${D.runeStone} × hệ số phẩm linh thạch lần đầu (khắc lại văn đã khắc rồi thì miễn phí).</div>
      </div></div>
      <div class="vk-card"><details><summary><b>Bảng Văn Và Hiệu Quả</b></summary>${runeHtml}</details></div>
      <div class="vk-mu" style="font-size:12px;text-align:center">${S.core.bm ? "Số liệu đọc từ code game" : "Số liệu dự phòng theo bản game hiện tại"}${miss.length ? " · chưa nhận ra hàm: " + esc(miss.join(", ")) + " (đã dùng công thức thay thế)" : " · dùng hàm tính của game"}</div>`;
  body.innerHTML = html;
}
const dev0 = (nv) =>
  nv.natalYear && nv.natalYear.year === Math.floor(nv.tuoi)
    ? nv.natalYear.devoured
    : 0;

export {
  GLUT,
  GLUT_TIER,
  GLUT_BAN,
  GLUT_MUA,
  GLUT_CUM,
  GLUT_LOAI,
  glutTier,
  glutRows,
  glutCard,
  TT_TEN,
  TT_LANH,
  statusCard,
  sellAdvice,
  pieceTable,
  tabDotPha,
  tabTran,
  itemDesc,
  tabTKC,
  LOAI_TEN,
  scanShops,
  tabCho,
  renderCho,
  HOA,
  NGHE,
  GRADE,
  rewardHint,
  planData,
  pillCandidates,
  bestRateWith,
  whereToGet,
  tabDotPha2,
  gradeBar,
  NGHE_DON_VI,
  NGHE_SO,
  NGHE_HOA,
  HOA_IDX,
  HOA_MUC,
  hoaTen,
  danThem,
  dpNghe,
  dpRaItem,
  recipeRows,
  tabNghe,
  tabLuyenDan,
  tabCheePhu,
  tabLuyenBao,
  tabTranPhap,
  BM_DEF,
  BM_RUNE_VAL,
  BM_HESO,
  BM_PHAM_CG,
  BM_TANG,
  BM_NHOM,
  BM_NHOM_TOIDA,
  BM_PN,
  bmD,
  bmV,
  bmP,
  bmX,
  bmLv,
  bmRunes,
  bmRuneName,
  bmGrade,
  bmPham,
  bmTier,
  bmSlots,
  bmLuyenBao,
  bmLife,
  bmEligible,
  bmCostTe,
  bmCostUp,
  bmWhyTe,
  bmWhyUp,
  bmWhyTemper,
  bmOkTxt,
  bmFmtY,
  bmExpect,
  bmCand,
  tabBanMenh,
  dev0,
};

Object.assign(gWin, {
  GLUT,
  GLUT_TIER,
  GLUT_BAN,
  GLUT_MUA,
  GLUT_CUM,
  GLUT_LOAI,
  glutTier,
  glutRows,
  glutCard,
  TT_TEN,
  TT_LANH,
  statusCard,
  sellAdvice,
  pieceTable,
  tabDotPha,
  tabTran,
  itemDesc,
  tabTKC,
  LOAI_TEN,
  scanShops,
  tabCho,
  renderCho,
  HOA,
  NGHE,
  GRADE,
  rewardHint,
  planData,
  pillCandidates,
  bestRateWith,
  whereToGet,
  tabDotPha2,
  gradeBar,
  NGHE_DON_VI,
  NGHE_SO,
  NGHE_HOA,
  HOA_IDX,
  HOA_MUC,
  hoaTen,
  danThem,
  dpNghe,
  dpRaItem,
  recipeRows,
  tabNghe,
  tabLuyenDan,
  tabCheePhu,
  tabLuyenBao,
  tabTranPhap,
  BM_DEF,
  BM_RUNE_VAL,
  BM_HESO,
  BM_PHAM_CG,
  BM_TANG,
  BM_NHOM,
  BM_NHOM_TOIDA,
  BM_PN,
  bmD,
  bmV,
  bmP,
  bmX,
  bmLv,
  bmRunes,
  bmRuneName,
  bmGrade,
  bmPham,
  bmTier,
  bmSlots,
  bmLuyenBao,
  bmLife,
  bmEligible,
  bmCostTe,
  bmCostUp,
  bmWhyTe,
  bmWhyUp,
  bmWhyTemper,
  bmOkTxt,
  bmFmtY,
  bmExpect,
  bmCand,
  tabBanMenh,
  dev0,
});
