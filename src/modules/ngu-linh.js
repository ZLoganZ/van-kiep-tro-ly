import { gWin, debounce, pct, num, esc, tcWord, fold, heTen } from "../core/utils.js";
import { NL_META, NL_RITUAL, NL_ENC, NL_ENEMY } from "../data/static-data.js";
import { S, body, C, nvNow, realmName, has } from "../core/bridge.js";
import { itemFull } from "./ban-do-dia-danh.js";
/**
 * Module: Wiki & Quản Lý Ngự Linh (Tổng Quan, Của Tôi, Sinh Vật, Vật Phẩm, Cơ Duyên)
 */
// ═════════════════════════ WIKI NGỰ LINH (dữ liệu đọc trực tiếp từ game, có bản dự phòng nhúng sẵn) ═════════════════════════
const NLW_SCH = [
  ["thu", "Thú", "🐺"],
  ["linh_thu", "Linh Thú", "🦌"],
  ["khoi_loi", "Khôi Lỗi", "🤖"],
  ["trung", "Cổ Trùng", "🐛"],
  ["thi", "Thi Khôi", "🧟"],
  ["hon", "Quỷ Hồn", "👻"],
];
const NLW_TEN = Object.fromEntries(NLW_SCH.map((x) => [x[0], x[1]]));
const NLW_GRP = [
  ["all", "Tất Cả"],
  ["trung", "Trứng Linh Thú"],
  ["do_pho", "Đồ Phổ Khôi Lỗi"],
  ["lieu", "Liệu Nuôi & Luyện"],
  ["cong_phap", "Công Pháp"],
  ["phap_khi", "Pháp Khí"],
  ["phu", "Phù & Trận Văn"],
  ["don_phuong", "Bí Phương (Đơn Phương)"],
  ["phu_lieu", "Liệu Phụ Nghi Thức"],
];
const NLW_NOI = {
  hoang_da: "Hoang Dã",
  thon: "Thôn",
  tran: "Trấn",
  thanh: "Thành",
  kinh_do: "Kinh Đô",
  thanh_tri: "Thành Trì",
  tong_mon: "Tông Môn",
  di_tich: "Di Tích",
  bi_canh: "Bí Cảnh",
};
const NLW_DH = {
  son_mach: "Núi",
  rung_ram: "Rừng Rậm",
  yeu_vuc: "Yêu Vực",
  di_tich: "Di Tích",
  ho_nuoc: "Đầm Hồ",
  hoang_nguyen: "Đồng Hoang",
  hoang_mac: "Hoang Mạc",
};
// tcWord() đã được chuyển về src/core/utils.js
const nlItemName = (id) => {
  const it = C().items.get(id);
  return tcWord(
    it ? it.ten : String(id).replace("item.", "").replace(/_/g, " "),
  );
};
const nlEnemies = () => {
  const out = [];
  for (const e of C().enemies.values())
    if (e && e.ngu_linh) out.push(e);
  if (out.length >= 20) return out;
  return NL_ENEMY.map((s) => ({
    id: s.id,
    ten: s.ten,
    canh_gioi: s.cg,
    he: s.he,
    ngu_linh: { loai: s.loai, do_kho: s.dk },
    tien_hoa: s.th,
    hach: s.hach,
    dia_hinh: s.dh,
    mo_ta: s.mt,
  }));
};
const nlEnemyById = (id) =>
  C().enemies.get(id) ||
  NL_ENEMY.map((s) => ({ id: s.id, ten: s.ten })).find(
    (x) => x.id === id,
  );
const nlIsItem = (it) =>
  !!(
    NL_META[it.id] ||
    it.ngu_linh ||
    it.cho_an ||
    it.khuon ||
    (it.tag || []).some((t) => t === "ngu_linh" || t === "khoi_loi") ||
    it.loai === "trung_thu" ||
    it.loai === "tran_van"
  );
const nlGroupOf = (it) =>
  NL_META[it.id]
    ? NL_META[it.id][0]
    : it.loai === "trung_thu"
      ? "trung"
      : it.khuon
        ? "do_pho"
        : it.cho_an
          ? "lieu"
          : it.loai === "cong_phap"
            ? "cong_phap"
            : it.loai === "phap_khi"
              ? "phap_khi"
              : it.loai === "phu_luc" || it.loai === "tran_van"
                ? "phu"
                : it.loai === "don_phuong"
                  ? "don_phuong"
                  : "phu_lieu";
const nlSel = (list, cur) =>
  list
    .map(
      (x) =>
        `<option value="${x[0]}" ${x[0] === cur ? "selected" : ""}>${x[1]}</option>`,
    )
    .join("");
S.nl = S.nl || {
  sch: "all",
  qs: "",
  qv: "",
  qc: "",
  grp: "all",
  own: false,
  realm: false,
};

// ── Tab Tổng quan Ngự Linh
function tabNLW() {
  const nv = nvNow(),
    Cc = C(),
    ens = nlEnemies();
  const items = [...Cc.items.values()];
  const ownN = items.filter(
    (it) => nlIsItem(it) && nv.tuiDo && nv.tuiDo[it.id] > 0,
  ).length;
  const cards = NLW_SCH.map(([k, ten, ic]) => {
    const rit = NL_RITUAL.filter((r) => r.loai === k);
    const bs = ens.filter((e) =>
      ((e.ngu_linh && e.ngu_linh.loai) || []).includes(k),
    );
    const dk = bs
      .map((e) => e.ngu_linh.do_kho)
      .filter((x) => typeof x === "number");
    const mon = items.filter(
      (it) =>
        (it.loai === "cong_phap" || it.loai === "phap_khi") &&
        it.ngu_linh &&
        it.ngu_linh.loai === k,
    );
    const mo = mon
      .filter((it) => it.ngu_linh.o)
      .sort((a, b) => (a.pham_cap || 0) - (b.pham_cap || 0));
    const eggs =
      k === "linh_thu"
        ? items.filter((it) => it.loai === "trung_thu").length
        : 0;
    const dp =
      k === "khoi_loi"
        ? items.filter((it) => it.khuon && it.loai !== "trung_thu")
            .length
        : 0;
    const nuoi = items.filter(
      (it) => it.cho_an && (it.cho_an.loai || []).includes(k),
    ).length;
    const ritHtml = rit
      .map(
        (r) =>
          `<div style="margin-top:4px"><b>${esc(tcWord(r.ten))}</b> <span class="vk-mu">· thời gian ${num(r.tg, 1)}</span><br><span class="vk-mu" style="font-size:12px">${esc(r.mo_ta)}</span><br><span style="font-size:12.5px">Liệu phụ: ${r.lieu.map((id) => `${esc(nlItemName(id))}${nv.tuiDo && nv.tuiDo[id] > 0 ? ' <span class="vk-ok">✓</span>' : ""}`).join(" · ")}</span></div>`,
      )
      .join("");
    return `<details class="vk-card"><summary><b>${ic} ${esc(ten)}</b> <span class="vk-mu">· ${bs.length} sinh vật${dk.length ? " · độ khó " + pct(Math.min(...dk)) + " – " + pct(Math.max(...dk)) : ""}</span></summary>
<div style="font-size:13px;margin-top:6px">${ritHtml || '<span class="vk-mu">Không có nghi thức riêng trong dữ liệu.</span>'}
${eggs ? `<div style="margin-top:4px">🥚 ${eggs} loại trứng trong game.</div>` : ""}${dp ? `<div style="margin-top:4px">🗺️ ${dp} đồ phổ / nguyên liệu có khuôn khôi lỗi.</div>` : ""}${nuoi ? `<div style="margin-top:4px">🍖 ${nuoi} món cho ăn tăng kinh nghiệm.</div>` : ""}
${mon.length ? `<div style="margin-top:6px"><b>Công pháp / pháp khí chuyên ${esc(ten)}</b> (${mon.length})</div><div style="font-size:12.5px">${mon.map((it) => `${esc(tcWord(it.ten))} <span class="vk-mu">P${it.pham_cap}${it.ngu_linh.o ? " · mở " + it.ngu_linh.o + " ô" : ""}</span>${nv.tuiDo && nv.tuiDo[it.id] > 0 ? ' <span class="vk-ok">có</span>' : ""}`).join("<br>")}</div>` : ""}</div></details>`;
  }).join("");
  body.innerHTML = `<div class="vk-card"><h3>🐾 Wiki Ngự Linh</h3>
      <div style="font-size:13.5px;line-height:1.55">Ngự Linh gồm sáu nhánh: <b>Thú</b>, <b>Linh Thú</b>, <b>Khôi Lỗi</b>, <b>Cổ Trùng</b>, <b>Thi Khôi</b> và <b>Quỷ Hồn</b>. Mọi số liệu dưới đây đọc trực tiếp từ dữ liệu game đang chạy.</div>
      <ul class="vpc-ul"><li>Công pháp hoặc pháp khí có dòng <b>mở N ô</b> là nguồn ô linh vật; món có <b>hồi con</b> / <b>dưỡng thương</b> giúp con bị thương mau lành.</li>
      <li><b>Ngự Thú Ấn</b> và <b>Thu Thú Phù</b> dùng khi thú đã bị đánh kiệt sức; chỉ số <b>độ khó</b> trong tab Sinh Vật là mức khó thu phục ghi trong dữ liệu.</li>
      <li>Trứng được ấp bằng nghi thức, khôi lỗi luyện từ đồ phổ cùng lõi, cổ / thi / hồn có nghi thức luyện riêng (xem từng nhánh bên dưới).</li></ul>
      <div class="vk-mu" style="font-size:12.5px;margin-top:6px">Trong túi hiện có ${ownN} loại vật phẩm Ngự Linh.</div></div>${cards}`;
}

// ── Tab Linh vật của tôi (đọc từ kiếp đang chơi)
function tabNLM() {
  const nv = nvNow(),
    fams = nv.familiars || [],
    Cc = C();
  const bl = Math.max(0, Math.min(3, nv.familiarBagLevel || 0)),
    rl = Math.max(0, Math.min(2, nv.ritualLevel || 0));
  const rits = nv.rituals || [],
    bag = 20 + 5 * bl,
    ritMax = 2 + rl,
    used = fams.length + rits.length;
  const CRAFTED = { khoi_loi: 1, thi: 1, hon: 1 };
  const APT_L = [
      "Phàm Huyết",
      "Linh Huyết",
      "Dị Huyết",
      "Chân Huyết",
      "Thần Huyết",
    ],
    APT_C = ["Hạ", "Trung", "Thượng", "Cực", "Hoàn Mỹ"];
  const INJ_L = [
      "Lành Lặn",
      "Thương Nhẹ",
      "Thương Nặng",
      "Trọng Thương",
      "Hấp Hối",
    ],
    INJ_C = ["Nguyên Vẹn", "Sứt Mẻ", "Hư Hại", "Hư Hại Nặng", "Vỡ Nát"];
  const TIEU = ["Sơ Kỳ", "Trung Kỳ", "Hậu Kỳ", "Đại Viên Mãn"];
  const slots = new Set((nv.familiarSlots || []).filter(Boolean));
  const rows = fams
    .map((f) => {
      const en = Cc.enemies.get(f.template),
        crafted = !!CRAFTED[f.kind],
        lvl = (f.injury && f.injury.level) || 0;
      const where =
        nv.petSlot === f.id
          ? "Thú cưng bên mình"
          : slots.has(f.id)
            ? "Đang mang theo"
            : "Trong ngự linh đại";
      return `<div class="vk-card"><b>${esc(tcWord(f.name || (en && en.ten) || String(f.template).replace("enemy.", "").replace(/_/g, " ")))}</b> <span class="vk-mu">· ${esc(NLW_TEN[f.kind] || f.kind)} · ${esc(where)}</span><br>
<span style="font-size:13px">${esc(realmName(f.realm || 0))} ${esc(TIEU[Math.max(0, Math.min(3, f.stage || 0))])} · ${esc((crafted ? APT_C : APT_L)[Math.max(0, Math.min(4, (f.aptitude || 1) - 1))])} (tư chất ${f.aptitude || 1}/5) · ${lvl > 0 ? '<b class="vk-bad">' + esc((crafted ? INJ_C : INJ_L)[Math.min(4, lvl)]) + "</b>" : esc((crafted ? INJ_C : INJ_L)[0])}</span><br>
<span class="vk-mu" style="font-size:12.5px">Kinh nghiệm ${num(f.exp || 0, 0)} · Kỹ năng ${(f.skills || []).length}/${f.skillSlots || 1} · Đặc tính ${(f.traits || []).length}/${f.traitSlots || 0}${f.element && f.element !== "vo_sac" ? " · Hệ " + esc(heTen(f.element)) : ""}</span></div>`;
    })
    .join("");
  const ritRows = rits
    .map((r) => {
      const d = NL_RITUAL.find((x) => x.id === r.ritual);
      return esc(
        d
          ? d.ten
          : String(r.ritual)
              .replace("nghi_thuc.", "")
              .replace(/_/g, " "),
      );
    })
    .join(", ");
  body.innerHTML = `<div class="vk-card"><h3>🐾 Linh Vật Của Tôi</h3>
      <div style="font-size:13.5px;line-height:1.55">Ngự Linh đã dùng: <b>${used}/${bag}</b> chỗ (linh vật ${fams.length}, nghi thức đang chạy ${rits.length}).<br>Tế đàn: chạy tối đa <b>${ritMax}</b> nghi thức cùng lúc.${rits.length ? "<br>Đang chạy: " + ritRows + "." : ""}${nv.devOpenSlots ? '<br><span class="vk-mu">Đang bật mở hết ô Ngự Linh.</span>' : ""}</div></div>
      ${rows || '<div class="vk-card vk-mu">Kiếp này chưa có linh vật nào. Xem tab Cơ Duyên để biết nơi gặp.</div>'}`;
}

// ── Tab Sinh vật
function tabNLS() {
  const f = S.nl;
  body.innerHTML = `<div class="vk-card"><h3>Sinh Vật Có Thể Ngự</h3>
      <div style="display:flex;gap:6px;flex-wrap:wrap"><select class="vk-sel" id="nl-sch">${nlSel([["all", "Mọi Nhánh"]].concat(NLW_SCH.map((x) => [x[0], x[2] + " " + x[1]])), f.sch)}</select>
      <input type="text" class="vk-sel" id="nl-q" style="flex:1;min-width:130px" placeholder="Gõ tên, hệ hoặc nơi (không cần dấu)" value="${esc(f.qs)}" autocomplete="off"></div>
      <div style="margin-top:6px;font-size:14px"><label><input type="checkbox" id="nl-realm" ${f.realm ? "checked" : ""}> Chỉ sinh vật từ cảnh giới hiện tại trở xuống</label></div>
      <div class="vk-mu" style="font-size:12px;margin-top:4px" id="nl-cnt"></div></div><div id="nl-list"></div>`;
  const nv = nvNow(),
    ens = nlEnemies(),
    kMap = new Map(),
    prevMap = new Map();
  for (const x of ens)
    for (const t of x.tien_hoa || []) {
      if (!prevMap.has(t.id)) prevMap.set(t.id, []);
      prevMap.get(t.id).push(x);
    }
  for (const it of C().items.values())
    if (typeof it.khuon === "string") {
      if (!kMap.has(it.khuon)) kMap.set(it.khuon, []);
      kMap.get(it.khuon).push(it);
    }
  const draw = () => {
    const q = fold(body.querySelector("#nl-q").value).trim();
    S.nl.sch = body.querySelector("#nl-sch").value;
    S.nl.qs = body.querySelector("#nl-q").value;
    S.nl.realm = body.querySelector("#nl-realm").checked;
    const list = ens
      .filter((e) => {
        const ln = e.ngu_linh.loai || [];
        if (S.nl.sch !== "all" && !ln.includes(S.nl.sch)) return false;
        if (S.nl.realm && (e.canh_gioi ?? 0) > (nv.canhGioi || 0))
          return false;
        if (!q) return true;
        const hay = fold(
          [
            e.ten,
            (e.he || []).map(heTen).join(" "),
            (e.dia_hinh || []).map((d) => NLW_DH[d] || d).join(" "),
            ln.map((k) => NLW_TEN[k]).join(" "),
          ].join(" "),
        );
        return hay.includes(q);
      })
      .sort(
        (a, b) =>
          (a.canh_gioi ?? 0) - (b.canh_gioi ?? 0) ||
          (a.ngu_linh.do_kho ?? 0) - (b.ngu_linh.do_kho ?? 0) ||
          String(a.ten).localeCompare(String(b.ten), "vi"),
      );
    body.querySelector("#nl-cnt").textContent =
      `${list.length} sinh vật${list.length > 60 ? " (hiện 60 con đầu, gõ tên để lọc thêm)" : ""}.`;
    body.querySelector("#nl-list").innerHTML =
      list
        .slice(0, 60)
        .map((e) => {
          const ln = e.ngu_linh,
            th = (e.tien_hoa || [])
              .map((t) => {
                const en = nlEnemyById(t.id);
                const li = Object.entries(t.lieu || {})
                  .map(([id, n]) => `${esc(nlItemName(id))} ×${n}`)
                  .join(", ");
                return `→ tiến hóa <b>${esc(tcWord(en ? en.ten : t.id))}</b>${t.he && t.he.length ? " (đổi hệ " + esc([].concat(t.he).map(heTen).join("/")) + ")" : ""}${li ? " (cần " + li + ")" : ""}`;
              })
              .join("<br>");
          const prv = (prevMap.get(e.id) || []).map((x) =>
            esc(tcWord(x.ten)),
          );
          const src = (kMap.get(e.id) || []).map((it) =>
            esc(nlItemName(it.id)),
          );
          return `<div class="vk-card"><b>${esc(tcWord(e.ten))}</b> <span class="vk-mu">· ${esc((ln.loai || []).map((k) => NLW_TEN[k] || k).join(" / "))}</span><br>
  <span class="vk-mu" style="font-size:12.5px">${(e.he || []).length ? esc(e.he.map(heTen).join("/")) + " · " : ""}${esc(realmName(e.canh_gioi ?? 0))}${typeof ln.do_kho === "number" ? " · độ khó thu phục " + pct(ln.do_kho) : ""}${(e.dia_hinh || []).length ? " · ở: " + esc(e.dia_hinh.map((d) => NLW_DH[d] || d).join(", ")) : ""}</span>
  ${e.mo_ta ? `<br><span style="font-size:13px">${esc(e.mo_ta)}</span>` : ""}
  ${e.hach ? `<br><span style="font-size:12.5px">Lõi khôi lỗi: ${esc(nlItemName(e.hach))}</span>` : ""}
  ${src.length ? `<br><span style="font-size:12.5px">Ra từ: ${src.join(", ")}</span>` : ""}
  ${prv.length ? `<br><span style="font-size:12.5px">Tiến hóa từ: ${prv.join(", ")}</span>` : ""}
  ${th ? `<br><span style="font-size:12.5px">${th}</span>` : ""}</div>`;
        })
        .join("") ||
      '<div class="vk-card vk-mu">Không thấy sinh vật nào.</div>';
  };
  body.querySelector("#nl-q").oninput = debounce(draw, 150);
  body.querySelector("#nl-sch").onchange = draw;
  body.querySelector("#nl-realm").onchange = draw;
  draw();
}

// ── Tab Vật phẩm Ngự Linh
function tabNLV() {
  const f = S.nl;
  body.innerHTML = `<div class="vk-card"><h3>Vật Phẩm Ngự Linh</h3>
      <div style="display:flex;gap:6px;flex-wrap:wrap"><select class="vk-sel" id="nv-grp">${nlSel(NLW_GRP, f.grp)}</select>
      <input type="text" class="vk-sel" id="nv-q" style="flex:1;min-width:130px" placeholder="Gõ tên hoặc công dụng (không cần dấu)" value="${esc(f.qv)}" autocomplete="off"></div>
      <div style="margin-top:6px;font-size:14px"><label><input type="checkbox" id="nv-own" ${f.own ? "checked" : ""}> Chỉ món đang có</label></div>
      <div class="vk-mu" style="font-size:12px;margin-top:4px" id="nv-cnt"></div></div><div id="nv-list"></div>`;
  const nv = nvNow(),
    all = [...C().items.values()].filter(nlIsItem).map((it) => ({
      it,
      grp: nlGroupOf(it),
      key: fold(it.ten + " " + it.id),
    }));
  const draw = () => {
    const q = fold(body.querySelector("#nv-q").value).trim();
    S.nl.grp = body.querySelector("#nv-grp").value;
    S.nl.qv = body.querySelector("#nv-q").value;
    S.nl.own = body.querySelector("#nv-own").checked;
    const list = all
      .filter(
        (x) =>
          (S.nl.grp === "all" || x.grp === S.nl.grp) &&
          (!S.nl.own || (nv.tuiDo && nv.tuiDo[x.it.id] > 0)) &&
          (!q || x.key.includes(q) || fold(itemFull(x.it)).includes(q)),
      )
      .sort(
        (a, b) =>
          (a.it.canh_gioi ?? 0) - (b.it.canh_gioi ?? 0) ||
          (a.it.pham_cap || 0) - (b.it.pham_cap || 0) ||
          (a.it.gia || 0) - (b.it.gia || 0),
      );
    body.querySelector("#nv-cnt").textContent =
      `${list.length} món${list.length > 80 ? " (hiện 80 món đầu, gõ tên để lọc thêm)" : ""}.`;
    body.querySelector("#nv-list").innerHTML =
      `<table class="vk-t">${list
        .slice(0, 80)
        .map(({ it, grp }) => {
          const own = nv.tuiDo && nv.tuiDo[it.id] > 0,
            sch = NL_META[it.id] && NL_META[it.id][1];
          return `<tr><td><b>${esc(tcWord(it.ten))}</b>${own ? ' <span class="vk-ok" style="font-size:12px">có</span>' : ""}<br><span class="vk-mu" style="font-size:12px">${esc((NLW_GRP.find((g) => g[0] === grp) || [0, ""])[1])}${sch ? " · " + esc(NLW_TEN[sch] || sch) : ""}${it.he && it.he.length ? " · " + esc(it.he.map(heTen).join("/")) : ""} · phẩm ${it.pham_cap}${it.canh_gioi !== undefined ? " · từ " + esc(realmName(it.canh_gioi)) : ""}</span><br><span style="font-size:13px">${itemFull(it) || ""}</span>${it.mo_ta ? `<br><span class="vk-mu" style="font-size:12px">${esc(it.mo_ta)}</span>` : ""}</td></tr>`;
        })
        .join("")}</table>` || "";
  };
  let tmr;
  body.querySelector("#nv-q").oninput = () => {
    clearTimeout(tmr);
    tmr = setTimeout(draw, 250);
  };
  body.querySelector("#nv-grp").onchange = draw;
  body.querySelector("#nv-own").onchange = draw;
  draw();
}

// ── Tab Cơ duyên Ngự Linh (sự kiện cho trứng, đồ phổ, công pháp Ngự Linh)
function tabNLC() {
  const f = S.nl;
  body.innerHTML = `<div class="vk-card"><h3>Cơ Duyên Ngự Linh</h3>
      <input type="text" class="vk-sel" id="nc-q" style="width:100%" placeholder="Gõ tên sự kiện, nơi hoặc phần thưởng (không cần dấu)" value="${esc(f.qc)}" autocomplete="off">
      <div style="margin-top:6px;font-size:14px"><label><input type="checkbox" id="nc-realm" ${f.realm ? "checked" : ""}> Chỉ sự kiện hợp cảnh giới hiện tại</label></div>
      <div class="vk-mu" style="font-size:12px;margin-top:4px" id="nc-cnt"></div></div><div id="nc-list"></div>`;
  const nv = nvNow(),
    cg = nv.canhGioi || 0;
  const draw = () => {
    const q = fold(body.querySelector("#nc-q").value).trim();
    S.nl.qc = body.querySelector("#nc-q").value;
    S.nl.realm = body.querySelector("#nc-realm").checked;
    const list = NL_ENC.filter((r) => {
      if (S.nl.realm && r[5] && (cg < r[5][0] || cg > r[5][1]))
        return false;
      if (!q) return true;
      return fold(
        [
          r[1],
          r[3].map((x) => NLW_NOI[x] || x).join(" "),
          r[4].map((x) => NLW_DH[x] || x).join(" "),
          r[6].map(nlItemName).join(" "),
        ].join(" "),
      ).includes(q);
    });
    body.querySelector("#nc-cnt").textContent =
      `${list.length} sự kiện${list.length > 70 ? " (hiện 70 sự kiện đầu, gõ tên để lọc thêm)" : ""}.`;
    body.querySelector("#nc-list").innerHTML =
      list
        .slice(0, 70)
        .map(
          (
            r,
          ) => `<div class="vk-card"><b>${esc(tcWord(r[1]))}</b>${r[7] === "cua_hang" ? ' <span class="vk-mu">· Cửa Hàng</span>' : r[7] === "tong_mon" ? ' <span class="vk-mu">· Tông Môn</span>' : ""}<br>
<span class="vk-mu" style="font-size:12.5px">${r[3].length ? "Nơi: " + esc(r[3].map((x) => NLW_NOI[x] || x).join(", ")) : ""}${r[4].length ? " · Địa hình: " + esc(r[4].map((x) => NLW_DH[x] || x).join(", ")) : ""}${r[5] ? " · Cảnh giới: " + esc(realmName(r[5][0])) + (r[5][1] !== r[5][0] ? " – " + esc(realmName(r[5][1])) : "") : ""}</span>
${r[6].length ? `<br><span style="font-size:13px">Có thể nhận: ${r[6].map((id) => esc(nlItemName(id))).join(", ")}</span>` : r[7] === "cua_hang" ? '<br><span class="vk-mu" style="font-size:12.5px">Bán trứng thú và nguyên liệu Ngự Linh (kệ hàng ngẫu nhiên mỗi lần).</span>' : '<br><span class="vk-mu" style="font-size:12.5px">Gặp thú / linh vật hoặc sự kiện liên quan Ngự Linh.</span>'}</div>`,
        )
        .join("") ||
      '<div class="vk-card vk-mu">Không thấy sự kiện nào.</div>';
  };
  let tmr;
  body.querySelector("#nc-q").oninput = () => {
    clearTimeout(tmr);
    tmr = setTimeout(draw, 250);
  };
  body.querySelector("#nc-realm").onchange = draw;
  draw();
}

export {
  NLW_SCH,
  NLW_TEN,
  NLW_GRP,
  NLW_NOI,
  NLW_DH,
  nlItemName,
  nlEnemies,
  nlEnemyById,
  nlIsItem,
  nlGroupOf,
  nlSel,
  tabNLW,
  tabNLM,
  tabNLS,
  tabNLV,
  tabNLC,
};

Object.assign(gWin, {
  NLW_SCH,
  NLW_TEN,
  NLW_GRP,
  NLW_NOI,
  NLW_DH,
  nlItemName,
  nlEnemies,
  nlEnemyById,
  nlIsItem,
  nlGroupOf,
  nlSel,
  tabNLW,
  tabNLM,
  tabNLS,
  tabNLV,
  tabNLC,
});
