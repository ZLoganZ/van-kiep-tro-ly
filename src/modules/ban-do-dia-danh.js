/**
 * Module: Kiếm Linh Thạch, Bản Đồ, Địa Danh, Truyền Tống, Treo Thưởng & Đồ Nên Săn
 */
// ── Kiếm linh thạch
async function scanBounties(c, maxY, prog) {
  const K = S.core,
    out = [],
    P = K.taoBenTa(c.run.nhanVat, C());
  const list = nearSlots(c, maxY);
  for (let i = 0; i < list.length; i++) {
    if (S.abort) break;
    if (i % 10 === 0) {
      prog && prog(i / list.length, "Đang xem bảng treo thưởng…");
      await sleep0();
    }
    const { slot, y } = list[i];
    let viec;
    try {
      viec = K.bangTreoThuong(c, slot, "thanh_tran");
    } catch {
      continue;
    }
    for (const v of viec || []) {
      if (!v.thuong) continue;
      const foes = foesOf(c, v.vars);
      let worst = { ok: 2, txt: '<span class="vk-mu">không rõ</span>' };
      for (const f of foes) {
        const r = simFoe(P, f);
        if (r.ok < worst.ok || worst.txt.includes("không rõ"))
          worst = r;
      }
      let y2 = 0;
      try {
        y2 = K.travelYears(withPlace(c, slot), v.slot);
      } catch {}
      out.push({
        board: slot,
        y,
        v,
        foes,
        res: worst,
        y2,
        d: danger(c, v.slot),
      });
    }
  }
  return out;
}
function junkItems(c, nv) {
  const K = S.core,
    Cc = C(),
    out = [];
  const onGrid = new Set(nv.kinhMach.manh.map((m) => m.item));
  const equip = new Set(Object.values(nv.trangBi || {}));
  const recipeMats = new Set();
  for (const dpId of nv.donPhuong || []) {
    const dp = Cc.donPhuong.get(dpId);
    (dp?.chu || []).forEach((x) => recipeMats.add(x.id));
    (dp?.phu || []).forEach(() => {});
  }
  for (const [id, n] of Object.entries(nv.tuiDo)) {
    if (!(n > 0) || onGrid.has(id) || equip.has(id)) continue;
    const it = Cc.items.get(id);
    if (!it || !it.gia) continue;
    if (
      ["don_phuong", "lenh_bai", "phuong_tien", "tru_vat"].includes(
        it.loai,
      )
    )
      continue;
    const keepPill =
      it.dot_pha ||
      it.tu_luyen ||
      JSON.stringify(it.dung || "").includes("tho_nguyen");
    const stj = sellTotal(c, id, it, n),
      price = stj.first;
    out.push({
      it,
      n,
      price,
      total: stj.total,
      left: stj.left,
      keep: keepPill
        ? "đan quý — cân nhắc giữ"
        : recipeMats.has(id)
          ? "nguyên liệu đan phương của bạn"
          : it.loai === "cong_phap" || it.loai === "phap_khi"
            ? "đồ không dùng trên kinh mạch"
            : "",
    });
  }
  return out.sort((a, b) => b.total - a.total);
}
function tabTien() {
  const K = S.core,
    c = ctx(),
    nv = c.run.nhanVat;
  const junk = junkItems(c, nv);
  const sum = junk
    .filter(
      (x) =>
        !x.keep.startsWith("đan quý") &&
        !x.keep.startsWith("nguyên liệu"),
    )
    .reduce((s, x) => s + x.total, 0);
  let bong = "";
  if (has("bongLoc")) {
    try {
      const k = K.bongLoc(c);
      if (k.linhThach || k.congHien)
        bong = `<div class="vk-ok">Bổng lộc đang chờ ở sư môn: ${k.linhThach} linh thạch, ${Math.round(k.congHien)} cống hiến (${k.nam} năm).</div>`;
    } catch {}
  }
  body.innerHTML = `
    <div class="vk-card"><h3>Cách kiếm linh thạch</h3>
      <div class="vk-mu" style="font-size:13px">Bạn có <b>${Math.floor(nv.linhThach || 0)}</b> linh thạch. Theo thứ tự nên làm:</div>
      <ol style="margin:6px 0 0;padding-left:20px;font-size:14px">
<li><b>Bán đồ thừa</b> trong túi (bảng dưới) — có tiền ngay. Bán ở nơi xa vùng sản sinh ra món đó thì được giá cao hơn.</li>
<li><b>Nhận treo thưởng</b> ở các thành trấn quanh đây — chỉ nhận việc Tool báo <span class="vk-ok">Thắng chắc</span>. Đây thường là nguồn lớn nhất.</li>
<li><b>Luyện đan, chế phù, luyện bảo, trận pháp để bán</b> khi đã có đồ nghề và công thức có lãi (các tab cùng tên trong nhóm Kiếm Lời).</li>
<li><b>Lĩnh bổng lộc</b> đều đặn nếu ở tông môn; cấp càng cao càng nhiều.</li>
<li>Đánh yêu thú lấy yêu tài, trồng linh dược ở linh điền động phủ rồi đem bán.</li>
      </ol>${bong}</div>
    ${glutCard(c)}
    <div class="vk-card"><h3>Treo thưởng</h3><div class="vk-mu">Xem tab <b>Treo thưởng</b>: liệt kê việc ở các bảng quanh đây, thưởng bao nhiêu và đánh có thắng không.</div></div>
    <div class="vk-card"><h3>Đồ trong túi bán được</h3>
      ${
junk.length
  ? `<div class="vk-mu" style="font-size:13px">Bán hết phần không cần giữ được khoảng <b>${Math.round(sum)}</b> linh thạch (giá ở chỗ đang đứng, đã tính chợ ngập hàng).</div><table class="vk-t"><tr><th>Món</th><th>SL</th><th>Tổng</th></tr>${junk
      .slice(0, 40)
      .map(
        (x) =>
          `<tr><td>${esc(x.it.ten)}${x.keep ? `<br><span class="vk-mu" style="font-size:12px">${x.keep}</span>` : ""}</td><td>${x.n}</td><td>${Math.round(x.total)}${x.left > 0 ? `<br><span class="vk-bad" style="font-size:11px">tiệm thu ${x.n - x.left}/${x.n}</span>` : ""}</td></tr>`,
      )
      .join("")}</table>`
  : '<div class="vk-mu">Túi không có gì đáng bán.</div>'
      }</div>`;
  if (body.querySelector("#vk-tt"))
    body.querySelector("#vk-tt").onclick = async (ev) => {
      ev.target.disabled = true;
      S.abort = false;
      const prog = bindProgress(body.querySelector("#vk-pr6"));
      try {
        const list = await scanBounties(
          c,
          +body.querySelector("#vk-tty").value,
          prog,
        );
        body.querySelector("#vk-pr6").style.display = "none";
        list.sort(
          (a, b) =>
            (b.res.ok >= 1) - (a.res.ok >= 1) ||
            b.v.thuong / (1 + b.y + b.y2) -
              a.v.thuong / (1 + a.y + a.y2),
        );
        body.querySelector("#vk-tto").innerHTML = list.length
          ? `<table class="vk-t"><tr><th>Việc</th><th>Thưởng</th><th>Sức</th></tr>` +
            list
              .slice(0, 25)
              .map(
                (r) =>
                  `<tr><td><b>${esc(cleanTxt(r.v.ten))}</b><br><span class="vk-mu" style="font-size:12px">Nhận ở ${esc(placeName(c, r.board))} (${yrs(r.y)}) → làm ở ${esc(placeName(c, r.v.slot))} (${yrs(r.y2)}, ${dangerTag(r.d)}) · hạn ${r.v.han} năm${r.foes.length ? " · gặp " + esc(r.foes.map((f) => f.ten).join(", ")) : ""}</span></td><td><b>${r.v.thuong}</b>${r.v.congHien ? `<br><span class="vk-mu" style="font-size:12px">+${r.v.congHien} cống hiến</span>` : ""}</td><td>${r.res.txt}</td></tr>`,
              )
              .join("") +
            '</table><div class="vk-mu" style="font-size:12px">Bảng treo thưởng đổi mỗi năm. "Thắng chắc" = thắng quái cả ở Sơ và Hậu kỳ cảnh giới của nó.</div>'
          : '<div class="vk-mu">Không thấy việc có thưởng linh thạch trong bán kính này.</div>';
      } catch (e) {
        body.querySelector("#vk-tto").innerHTML = errBox(e);
      }
      ev.target.disabled = false;
    };
}

// ── Bản đồ: cơ duyên + đường đi an toàn
function routeSafe(c, target) {
  const W = c.world,
    start = c.run.viTri,
    PO = S.core.AMBUSH_MIN_DISTANCE || 30;
  let land;
  try {
    land = W.tho(start);
  } catch {}
  const nodes = W.slots.filter(
    (s) =>
      !s.an &&
      (() => {
        try {
          return W.tho(s.id) === land;
        } catch {
          return false;
        }
      })(),
  );
  const idx = new Map(nodes.map((s, i) => [s.id, i]));
  if (!idx.has(target) || !idx.has(start)) return null;
  const pen = nodes.map((s) => {
    const d = danger(c, s.id);
    return d && d.id === "tu_dia" ? 40 : d && d.id === "hiem" ? 12 : 0;
  });
  const N = nodes.length,
    dist = new Float64Array(N).fill(Infinity),
    prev = new Int32Array(N).fill(-1),
    done = new Uint8Array(N);
  const si = idx.get(start),
    ti = idx.get(target);
  dist[si] = 0;
  const lim = PO * 0.97;
  for (;;) {
    let u = -1,
      b = Infinity;
    for (let i = 0; i < N; i++)
      if (!done[i] && dist[i] < b) {
        b = dist[i];
        u = i;
      }
    if (u < 0 || u === ti) break;
    done[u] = 1;
    const a = nodes[u];
    for (let v = 0; v < N; v++) {
      if (done[v]) continue;
      const d = Math.hypot(a.x - nodes[v].x, a.y - nodes[v].y);
      if (d > lim) continue;
      const w = d + 2 + (v === ti ? 0 : pen[v]);
      if (dist[u] + w < dist[v]) {
        dist[v] = dist[u] + w;
        prev[v] = u;
      }
    }
  }
  if (!isFinite(dist[ti])) return null;
  const path = [];
  for (let v = ti; v >= 0; v = prev[v]) path.push(nodes[v]);
  path.reverse();
  let len = 0;
  for (let i = 1; i < path.length; i++)
    len += Math.hypot(
      path[i].x - path[i - 1].x,
      path[i].y - path[i - 1].y,
    );
  return { path, len };
}
function tabBanDo() {
  const K = S.core,
    c = ctx(),
    run = c.run,
    Cc = C(),
    P = K.taoBenTa(run.nhanVat, Cc);
  const items = [];
  for (const [slot, n] of Object.entries(run.nodes || {})) {
    if (!n || !n.encounter) continue;
    if (n.hetHanNam !== undefined && n.hetHanNam <= run.nam) continue;
    const def = Cc.encounters.get(n.encounter);
    if (!def) continue;
    let y = Infinity;
    try {
      y = K.travelYears(c, slot);
    } catch {}
    const th = encThreat(
      n.encounter,
      slot,
      n.vars,
      run.nam + (isFinite(y) ? y : 0),
    );
    let foes = [],
      worst = null;
    if (th === null) {
      foes = foesOf(c, n.vars);
      for (const f of foes) {
        const r = simFoe(P, f);
        if (!worst || r.ok < worst.ok) worst = r;
      }
    }
    items.push({
      slot,
      def,
      n,
      y,
      foes,
      th,
      res: worst,
      d: danger(c, slot),
      left:
        n.hetHanNam !== undefined ? n.hetHanNam - run.nam : undefined,
    });
  }
  items.sort((a, b) => a.y - b.y);
  const opts = items
    .map(
      (x, i) =>
        `<option value="${esc(x.slot)}">${esc(cleanTxt(x.def.ten || x.n.encounter))} · ${esc(placeName(c, x.slot))}</option>`,
    )
    .join("");
  const tm = K.tongMonCua(c);
  const extra = tm
    ? `<option value="${esc(tm.slot)}">Sư môn · ${esc(placeName(c, tm.slot))}</option>`
    : "";
  const choTowns = S.cho
    ? [...new Set(S.cho.rows.map((r) => r.slot))]
        .slice(0, 30)
        .map(
          (sl) =>
            `<option value="${esc(sl)}">Chợ · ${esc(placeName(c, sl))}</option>`,
        )
        .join("")
    : "";
  body.innerHTML = `
    <div class="vk-card"><h3>Cơ duyên và sự kiện trên bản đồ</h3>${items.length ? `<table class="vk-t"><tr><th>Sự kiện</th><th>Đi</th><th>Sức</th></tr>${items.map((x) => `<tr><td><b>${esc(cleanTxt(x.def.ten || x.n.encounter))}</b><br><span class="vk-mu" style="font-size:12px">${esc(placeName(c, x.slot))} · ${dangerTag(x.d)}${x.left !== undefined ? ` · còn <span class="${x.left < x.y ? "vk-bad" : ""}">${num(x.left)} năm</span>` : ""}${x.foes.length ? " · gặp " + esc(x.foes.map((f) => f.ten).join(", ")) : ""}<br>Có thể được: ${esc(rewardHint(x.def))}</span></td><td>${yrs(x.y)}</td><td>${x.th !== null && x.th !== undefined ? threatHtml(x.th) : x.res ? x.res.txt : '<span class="vk-mu">không rõ</span>'}</td></tr>`).join("")}</table>` : '<div class="vk-mu">Chưa có sự kiện nào hiện trên bản đồ.</div>'}</div>
    <div class="vk-card"><h3>Đường đi an toàn</h3>
      <div class="vk-mu" style="font-size:13px">Đi một chặng dài dễ gặp biến cố giữa đường. Chặng ngắn hơn ${K.AMBUSH_MIN_DISTANCE || 30} đơn vị bản đồ thì không bị chặn giữa đường. Tool tìm chuỗi chặng ngắn, né nơi nguy hiểm.</div>
      <select class="vk-sel" id="vk-dst" style="width:100%;margin:6px 0">${opts}${extra}${choTowns}</select>
      <button class="vk-btn" id="vk-rt" ${items.length || tm || choTowns ? "" : "disabled"}>Tìm đường</button><div id="vk-rto"></div></div>`;
  body.querySelector("#vk-rt").onclick = () => {
    const dst = body.querySelector("#vk-dst").value;
    const out = body.querySelector("#vk-rto");
    let direct = 0;
    try {
      direct = K.travelYears(c, dst);
    } catch {}
    const r = routeSafe(c, dst);
    if (!r) {
      out.innerHTML =
        '<div class="vk-mu">Không tìm được đường bộ (có thể khác đại lục, cần đi thuyền).</div>';
      return;
    }
    const dTot =
      Math.hypot(
        c.world.slot(run.viTri).x - c.world.slot(dst).x,
        c.world.slot(run.viTri).y - c.world.slot(dst).y,
      ) || 1;
    const yPer = direct / dTot;
    out.innerHTML = `<div style="margin:6px 0">Đi thẳng: ${yrs(direct)}${dTot >= (K.AMBUSH_MIN_DISTANCE || 30) ? ' · <span class="vk-bad">có thể bị chặn giữa đường</span>' : ""}. Đi theo chặng: ${r.path.length - 1} chặng, khoảng ${yrs(r.len * yPer)}.</div><ol style="margin:0;padding-left:20px;font-size:14px">${r.path
      .slice(1)
      .map(
        (s) =>
          `<li>${esc(placeName(c, s.id))} ${dangerTag(danger(c, s.id))}</li>`,
      )
      .join("")}</ol>`;
  };
}

// ═════════════════════════ TRA CỨU: ĐỊA DANH · ĐI ĐẾN · DỊCH CHUYỂN ĐẾN ═════════════════════════
// Đọc danh mục địa danh thẳng từ bản đồ game đang chạy (world.slots · world.diaDanh · world.info) nên game thêm hoặc đổi nơi là tự khớp.
// Hai nút đều điều khiển game bằng hàm công khai của chính game, không tự đổi vị trí:
//   • Đi Đến = game.travelTo (đi bộ thật, tốn năm đường, có thể gặp biến cố giữa đường).
//   • Dịch Chuyển Đến = truyền tống của game: Trận Truyền Tống (thành, kinh đô, đại tông môn, động phủ có trận) hoặc Truyền Tống Phù trong túi.
//     Tool mở bảng truyền tống rồi gọi game.resume(nơi đến), game tự thu linh thạch, tự kiểm tra tầm, vượt biển, nơi khóa…
const DD_LOAI = {
  thon: "Thôn",
  tran: "Trấn",
  thanh: "Thành",
  kinh_do: "Kinh Đô",
  tong_mon: "Tông Môn",
  bi_canh: "Bí Cảnh",
  di_tich: "Di Tích",
  sao_huyet: "Sào Huyệt Yêu Thú",
  lanh_dia_yeu: "Lãnh Địa Yêu Thú",
  nui: "Núi",
  dinh: "Đỉnh",
  coc: "Cốc",
  rung: "Rừng",
  dam: "Đầm",
  thac: "Thác",
  ho: "Hồ",
  song: "Sông",
  linh_mach: "Linh Mạch",
  khoang_mach: "Khoáng Mạch",
  quan_ai: "Quan Ải",
  phuong_thi: "Phường Thị",
  an_si: "Ẩn Cư",
  vo_nhai_uyen: "Vô Nhai Uyên",
  gia_toc: "Gia Tộc",
  khu_ta: "Khu Tà Tu",
};
const ddLoai = (l) =>
  DD_LOAI[l] || tcWord(String(l || "khác").replace(/_/g, " "));
const DD_TANG = { dai_tong_mon: "Đại Tông Môn" };
const DD_EV_TELE = ["ev.public_teleport", "ev.dong_phu"]; // hai sự kiện của game có lựa chọn mở bảng truyền tống
S.dd = S.dd || {
  q: "",
  loai: "",
  qg: "",
  cl: "",
  kham: false,
  may: false,
  sort: "gan",
  n: 30,
  focus: null,
};
let ddCache = null;

// Mô tả địa danh: dòng Tóm Tắt (loại, tông môn, phái, hệ, đạo, truyền tống…) lấy từ dữ liệu bản đồ game;
// dòng văn tả lấy nguyên từ danh mục nơi chốn của game (content.noiChon) theo loại nơi, mỗi nơi cố định một câu.
const DD_PHAI = {
  dan: "Đan",
  am: "Âm",
  kiem: "Kiếm",
  khi: "Khí",
  phu: "Phù",
  tran: "Trận",
  phat: "Phật",
  ngu_thu: "Ngự Thú",
  khoi_loi: "Khôi Lỗi",
  the: "Thể",
  ma: "Ma",
  thi: "Thi",
  doc: "Độc Cổ",
  hop_hoan: "Hợp Hoan",
  quy: "Quỷ",
};
const DD_DAO = {
  chinh: "Chính Đạo",
  trung_lap: "Trung Lập",
  ma: "Ma Đạo",
  ta: "Tà Đạo",
};
const DD_TANG_TEN = {
  dai_tong_mon: "Đại Tông Môn",
  tong_mon: "Tông Môn",
  mon_phai: "Môn Phái Nhỏ",
  gia_toc: "Đại Thế Gia",
  tieu_gia_toc: "Tiểu Thế Gia",
};
function ddFlavor(x) {
  let map;
  try {
    map = C().noiChon;
  } catch (e) {
    return "";
  }
  if (!map || typeof map.values !== "function") return "";
  for (const d of map.values()) {
    if (!d || !Array.isArray(d.loai) || !d.loai.includes(x.loai))
      continue;
    const pool = []
      .concat(d.mo_ta || [])
      .filter(
        (t) =>
          typeof t === "string" &&
          t &&
          !/\{(?!dia_danh\})[^}]*\}/.test(t),
      );
    if (!pool.length) return "";
    let h = 0;
    for (const ch of String(x.id))
      h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    return cleanTxt(
      pool[h % pool.length].replace(/\{dia_danh\}/g, x.name),
    );
  }
  return "";
}
function ddMota(x) {
  const f = [];
  try {
    const tang = DD_TANG_TEN[x.tang] || "";
    if (x.loai === "tong_mon" || x.phai) {
      f.push(tang || ddLoai(x.loai));
      if (x.phai)
        f.push(
          "Phái " +
            (DD_PHAI[x.phai] ||
              tcWord(String(x.phai).replace(/_/g, " "))),
        );
      const he = [].concat(x.he || []).filter(Boolean);
      if (he.length) f.push("Hệ " + he.map(heTen).join(" / "));
      if (x.phai)
        f.push(DD_DAO[x.dao || "chinh"] || tcWord(String(x.dao)));
    } else {
      f.push(tang || ddLoai(x.loai));
      if (x.qg) f.push(x.qg);
    }
    if (
      x.loai === "thanh" ||
      x.loai === "kinh_do" ||
      x.tang === "dai_tong_mon"
    )
      f.push("Có Trận Truyền Tống");
    if (x.ht) f.push("Có Hộ Thành Đại Trận");
  } catch (e) {
    /* thiếu dữ liệu thì bỏ dòng tóm tắt */
  }
  let html = "";
  if (f.length)
    html += `<div style="margin:6px 0 2px;font-size:13px;line-height:1.5"><b>Tóm Tắt:</b> ${esc(f.join(" · "))}</div>`;
  let fl = "";
  try {
    fl = ddFlavor(x);
  } catch (e) {
    fl = "";
  }
  if (fl)
    html += `<div class="vk-mu" style="margin:2px 0 6px;font-size:12.5px;line-height:1.5">${esc(fl)}</div>`;
  return html;
}

// Dựng danh mục một lần cho mỗi bản đồ (cache theo đối tượng world).
function ddBuild(c) {
  const W = c.world;
  if (ddCache && ddCache.W === W) return ddCache;
  const list = [];
  for (const s of W.slots) {
    if (!s || !s.dia_danh || s.an) continue;
    let dd = null;
    try {
      dd = W.diaDanh(s.dia_danh);
    } catch (e) {
      dd = null;
    }
    if (!dd || !dd.ten) continue;
    let qg = "",
      tho = 0;
    try {
      const i = W.info(s.id);
      if (i && i.quocGia) qg = W.tenQuocGia(i.quocGia) || "";
    } catch (e) {
      /* bỏ qua */
    }
    try {
      tho = W.tho(s.id);
    } catch (e) {
      tho = 0;
    }
    list.push({
      id: s.id,
      phai: dd.phai || "",
      he: dd.he || null,
      dao: dd.chinh_ma || "",
      ht: !!dd.ho_thanh,
      name: dd.ten,
      han: dd.ten_han || "",
      loai: dd.loai || "",
      tang: dd.tang || "",
      qg: String(qg || ""),
      tho,
      cap: s.cap_nen !== undefined ? s.cap_nen : dd.cap_nen,
      key: fold(dd.ten + " " + (dd.ten_han || "")),
      d: 0,
    });
  }
  const loais = [...new Set(list.map((x) => x.loai))]
    .map((l) => [l, ddLoai(l)])
    .sort((a, b) => a[1].localeCompare(b[1], "vi"));
  const qgs = [...new Set(list.map((x) => x.qg).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b, "vi"))
    .map((q) => [q, q]);
  return (ddCache = {
    W,
    list,
    loais,
    qgs,
    byId: new Map(list.map((x) => [x.id, x])),
  });
}

// Các nguồn truyền tống đang có: Trận Truyền Tống (luôn hỏi game) và mỗi loại Truyền Tống Phù còn trong túi.
function ddTeleSources(g) {
  const out = [{ k: "array", kind: "array", ten: "Trận Truyền Tống" }];
  const run = g.state.run,
    bag = (run && run.nhanVat && run.nhanVat.tuiDo) || {};
  for (const id of Object.keys(bag)) {
    if (!(bag[id] > 0)) continue;
    let it = null;
    try {
      it = C().items.get(id);
    } catch (e) {
      it = null;
    }
    if (
      it &&
      Array.isArray(it.dung) &&
      it.dung.some((d) => d && d.dung_truyen_tong_phu)
    )
      out.push({
        k: "item:" + id,
        kind: "talisman",
        item: id,
        ten: it.ten || id,
        n: bag[id],
      });
  }
  return out;
}
function ddTeleOpts(g, src) {
  try {
    const r = g.teleportOptions(
      src.kind === "array"
        ? { kind: "array" }
        : { kind: "talisman", item: src.item },
    );
    return new Map((r || []).map((o) => [o.slot, o]));
  } catch (e) {
    return new Map();
  }
}
const ddWaitingTele = (g) => {
  const a = g.state.run && g.state.run.active;
  return !!(a && a.waiting && a.waiting.kind === "teleport");
};

// Dọn dẹp trạng thái chờ bế quan / thông báo / sự kiện đã xong trước khi di chuyển hoặc truyền tống
function ddCleanIdleEnc(g) {
  const rRun = g && g.state && g.state.run;
  if (!rRun) return;
  if (rRun.thongBao && typeof g.dongThongBao === "function") {
    try {
      g.dongThongBao();
    } catch (e) {}
  }
  if (rRun.longNotice && typeof g.closeLongNotice === "function") {
    try {
      g.closeLongNotice();
    } catch (e) {}
  }
  const a = rRun.active;
  if (a) {
    const wKind = a.waiting && (a.waiting.kind || a.waiting);
    if (a.done && typeof g.closeEncounter === "function") {
      try {
        g.closeEncounter();
      } catch (e) {}
    } else if (wKind === "be_quan" && typeof g.closeEncounter === "function") {
      try {
        g.closeEncounter();
      } catch (e) {}
    }
  }
}

// Đi bộ tới nơi đã chọn bằng game.travelTo.
function ddDoTravel(slot) {
  const g = G();
  if (!g || !g.state || !g.state.run)
    return { ok: false, msg: "Chưa có kiếp nào đang chơi." };
  ddCleanIdleEnc(g);
  const run = g.state.run;
  if (run.ketThuc) return { ok: false, msg: "Kiếp này đã kết thúc." };
  if (run.active || run.tran || run.bienCo)
    return {
      ok: false,
      msg: "Đang có việc dở hoặc biến cố trong game. Xử lý xong rồi hãy đi.",
    };
  if (String(run.viTri) === String(slot))
    return { ok: true, msg: "Bạn đang đứng ở đây rồi." };
  const r = auCall(() => {
    if (typeof g.travelTo === "function") g.travelTo(String(slot));
    else if (
      typeof TT !== "undefined" &&
      typeof TT.travelTo === "function"
    )
      TT.travelTo(String(slot));
  });
  if (!r.ok)
    return {
      ok: false,
      msg: r.err || "Không thể di chuyển tới vị trí này.",
    };
  const r2 = G().state && G().state.run;
  if (r2 && String(r2.viTri) !== String(slot))
    return {
      ok: false,
      msg: "Giữa đường có việc xảy ra (biến cố hoặc gặp người). Xem trong game.",
    };
  return { ok: true, msg: "Đã tới nơi bằng đường bộ." };
}

// Dịch chuyển: mở bảng truyền tống của game (nếu chưa mở) rồi chọn nơi đến. Mọi luật (tầm, linh thạch, khóa, vượt biển) do game kiểm.
function ddDoTeleport(slot, src) {
  const g = G();
  if (!g || !g.state || !g.state.run)
    return { ok: false, msg: "Chưa có kiếp nào đang chơi." };
  const targetSlot = src && src.targetSlot !== undefined ? src.targetSlot : slot;
  if (String(g.state.run.viTri) === String(targetSlot))
    return { ok: true, msg: "Bạn đang đứng ở đây rồi." };
  if (!ddWaitingTele(g)) {
    ddCleanIdleEnc(g);
    if (src && src.kind === "talisman") {
      const r = auCall(() => g.useItem(src.item));
      if (!r.ok)
        return {
          ok: false,
          msg: "Không dùng được " + src.ten + ": " + r.err,
        };
    } else {
      let a = g.state.run.active;
      if (!a) {
        let id = DD_EV_TELE.find((x) => {
          try {
            return g.canDo(x);
          } catch (e) {
            return false;
          }
        });
        if (!id && g.state.run.oNoi !== g.state.run.viTri && typeof g.enterNode === "function") {
          try {
            g.enterNode(g.state.run.viTri);
          } catch (e) {}
          id = DD_EV_TELE.find((x) => {
            try {
              return g.canDo(x);
            } catch (e) {
              return false;
            }
          });
        }
        if (!id)
          return {
            ok: false,
            msg: "Nơi đang đứng không có Trận Truyền Tống dùng được.",
          };
        let r = auCall(() => g.doAction(id));
        if (!r.ok && typeof g.chooseActivity === "function") {
          r = auCall(() => g.chooseActivity(id));
        }
        if (!r.ok)
          return {
            ok: false,
            msg: "Không mở được Trận Truyền Tống: " + r.err,
          };
        a = G().state.run.active;
      }
      if (!(a && a.waiting && a.waiting.kind === "teleport")) {
        if (!a || a.waiting || a.done || !DD_EV_TELE.includes(a.id))
          return {
            ok: false,
            msg: "Đang có việc dở trong game. Xử lý xong rồi thử lại.",
          };
        const v = g.encounterView();
        const ch =
          v &&
          (v.choices || []).find(
            (x) =>
              x.available && /truyền tống/i.test(String(x.text || "")),
          );
        if (!ch)
          return {
            ok: false,
            msg: "Không thấy lựa chọn truyền tống ở nơi này.",
          };
        const r = auCall(() => g.choose(ch.index));
        if (!r.ok)
          return {
            ok: false,
            msg: "Không mở được bảng truyền tống: " + r.err,
          };
      }
    }
  }
  if (!ddWaitingTele(g))
    return {
      ok: false,
      msg: "Game chưa mở bảng chọn nơi truyền tống. Xem trong game.",
    };
  const from = G().state.run.viTri;
  let r = auCall(() => g.resume(targetSlot));
  if (!r.ok && String(targetSlot) !== targetSlot) {
    r = auCall(() => g.resume(String(targetSlot)));
  }
  if (!r.ok) {
    auCall(() => g.resume(null));
    return { ok: false, msg: "Truyền tống không thành: " + r.err };
  }
  const now = G().state.run;
  if (String(now.viTri) === String(from))
    return { ok: false, msg: "Truyền tống chưa xong. Xem trong game." };
  return {
    ok: true,
    msg:
      String(now.viTri) === String(targetSlot)
        ? "Đã truyền tống tới nơi."
        : "Trận lệch tọa độ, bạn rơi xuống gần nơi đến (game có 10% lệch khi dùng trận ở vùng hoang).",
  };
}

function tabDiaDanh() {
  const K = S.core,
    f = S.dd;
  body.innerHTML = `<div class="vk-card"><h3>Tra Cứu Địa Danh</h3>
      <div id="dd-here" class="vk-mu" style="font-size:13px;margin-bottom:6px"></div>
      <input class="vk-sel" id="dd-q" style="width:100%" placeholder="Gõ tên nơi (không cần dấu): thanh, tong mon, kinh do…" value="${esc(f.q)}" autocomplete="off">
      <div class="tc-row" id="dd-sel" style="margin-top:6px"></div>
      <div style="margin-top:6px;font-size:14px"><label><input type="checkbox" id="dd-kham"${f.kham ? " checked" : ""}> Chỉ Nơi Đã Từng Tới</label> · <label><input type="checkbox" id="dd-may"${f.may ? " checked" : ""}> Hiện Cả Nơi Còn Phủ Mây</label></div>
      <div class="vk-mu" style="font-size:12px;margin-top:4px" id="dd-cnt"></div></div>
      <div id="dd-msg"></div><div id="dd-list"></div>
      <div class="vk-mu" style="font-size:12px;margin:6px 2px">Đi Đến là đi bộ thật bằng hàm đi đường của game (tốn năm đường, có thể gặp biến cố). Dịch Chuyển Đến dùng truyền tống của game: cần đang đứng ở nơi có Trận Truyền Tống (thành, kinh đô, đại tông môn, động phủ có trận) hoặc có Truyền Tống Phù trong túi, tốn linh thạch, nơi đến phải là nơi đã từng tới. Mọi điều kiện do game kiểm và hiện lý do khi chưa dùng được.</div>`;
  const $ = (id) => body.querySelector("#" + id);
  let shown = [],
    tele = null;
  const getTele = (g) => {
    if (!tele) {
      const srcs = ddTeleSources(g);
      tele = srcs.map((s) => ({ s, m: ddTeleOpts(g, s) }));
    }
    return tele;
  };

  const fillSel = (X) => {
    const o = (list, cur, first) =>
      `<option value="">${first}</option>` +
      list
        .map(
          (x) =>
            `<option value="${esc(x[0])}" ${String(x[0]) === String(cur) ? "selected" : ""}>${esc(x[1])}</option>`,
        )
        .join("");
    $("dd-sel").innerHTML =
      `<select class="vk-sel" id="dd-loai">${o(X.loais, f.loai, "Mọi Loại")}</select><select class="vk-sel" id="dd-qg">${o(X.qgs, f.qg, "Mọi Quốc Gia")}</select><select class="vk-sel" id="dd-cl">${o(
        [
          ["cung", "Cùng Đại Lục"],
          ["khac", "Khác Đại Lục"],
        ],
        f.cl,
        "Mọi Đại Lục",
      )}</select><select class="vk-sel" id="dd-st">${o(
        [
          ["gan", "Gần Nhất Trước"],
          ["ten", "Theo Tên"],
        ],
        f.sort,
        "",
      ).replace('<option value=""></option>', "")}</select>`;
    body.querySelectorAll("#dd-sel select").forEach((el) => {
      el.onchange = () => {
        f.focus = null;
        f.n = 30;
        draw();
      };
    });
  };

  const cardBody = (x, c, g, run) => {
    const K2 = S.core,
      rows = [];
    const md = ddMota(x);
    if (md) rows.push(md);
    const row = (a, b) =>
      rows.push(
        `<div class="vk-row"><span>${a}</span><b style="text-align:right">${b}</b></div>`,
      );
    row(
      "Loại",
      esc(ddLoai(x.loai)) +
        (x.tang && DD_TANG[x.tang] ? " · " + esc(DD_TANG[x.tang]) : ""),
    );
    if (x.qg) row("Quốc Gia", esc(x.qg));
    if (x.cap !== undefined && x.cap !== null)
      row("Cấp Nền", esc(num(x.cap)));
    const known = (run.daKhamPha || []).includes(x.id);
    let fog = false;
    try {
      fog = !!(K2.slotDaMo && !K2.slotDaMo(c, x.id));
    } catch (e) {
      fog = false;
    }
    row(
      "Tình Trạng",
      run.viTri === x.id
        ? '<span class="vk-ok">Đang Đứng Ở Đây</span>'
        : fog
          ? '<span class="vk-bad">Còn Phủ Mây, Chưa Đi Tới Được</span>'
          : known
            ? "Đã Từng Tới"
            : "Chưa Từng Tới",
    );
    const nc = run.noiChon && run.noiChon[x.id];
    if (nc && nc.chuNhan === "nguoi_choi")
      row("Chủ Nơi Này", '<span class="vk-ok">Động Phủ Của Bạn</span>');
    let y = Infinity;
    try {
      y = K2.travelYears(c, x.id);
    } catch (e) {
      /* không đo được */
    }
    if (run.viTri !== x.id && isFinite(y)) row("Đi Bộ", esc(yrs(y)));
    const dg = danger(c, x.id);
    if (dg) row("Mức Nguy Hiểm", dangerTag(dg));
    const nd = run.nodes && run.nodes[x.id];
    if (
      nd &&
      nd.encounter &&
      !(nd.hetHanNam !== undefined && nd.hetHanNam <= run.nam)
    ) {
      const def = C().encounters.get(nd.encounter);
      row(
        "Đang Có Việc",
        esc(cleanTxt((def && def.ten) || nd.encounter)) +
          (nd.hetHanNam !== undefined
            ? ` <span class="vk-mu">(còn ${esc(num(nd.hetHanNam - run.nam))} năm)</span>`
            : ""),
      );
    }
    // truyền tống
    const here = run.viTri === x.id,
      tl = getTele(g),
      usable = [];
    let tele2 = "";
    for (const t of tl) {
      const o = t.m.get(x.id);
      if (!o) {
        tele2 += `<div class="vk-mu" style="font-size:13px">${esc(t.s.ten)}${t.s.n ? " ×" + t.s.n : ""}: ngoài tầm hoặc chưa biết nơi này.</div>`;
        continue;
      }
      if (o.blocked)
        tele2 += `<div style="font-size:13px">${esc(t.s.ten)}${t.s.n ? " ×" + t.s.n : ""}: <span class="vk-bad">${esc(o.blocked)}</span></div>`;
      else {
        usable.push({ t, o });
        tele2 += `<div style="font-size:13px">${esc(t.s.ten)}${t.s.n ? " ×" + t.s.n : ""}: <span class="vk-ok">dùng được</span> · ${esc(num(o.cost || 0, 0))} linh thạch</div>`;
      }
    }
    const tpBtns = usable.length
      ? usable
          .map(
            ({ t, o }) =>
              `<button class="vk-btn dd-tp" data-id="${esc(x.id)}" data-src="${esc(t.s.k)}" ${here ? "disabled" : ""}>Dịch Chuyển Đến · ${esc(t.s.ten)} (${esc(num(o.cost || 0, 0))} Linh Thạch)</button>`,
          )
          .join(" ")
      : `<button class="vk-btn dd-tp" disabled>Dịch Chuyển Đến</button>`;
    const goDis =
      here || fog || !!(run.active || run.tran || run.bienCo);
    return `${rows.join("")}<div style="margin-top:6px"><b style="font-size:13px">Truyền Tống</b>${tele2}</div>
<div style="margin-top:8px;display:flex;flex-wrap:wrap;gap:6px"><button class="vk-btn sec dd-go" data-id="${esc(x.id)}" ${goDis ? "disabled" : ""}>Đi Đến${isFinite(y) && !here ? " (" + esc(yrs(y)) + ")" : ""}</button>${tpBtns}</div>`;
  };

  const draw = () => {
    const g = G(),
      run = g.state.run;
    tele = null;
    if (!run) {
      body.innerHTML =
        '<div class="vk-card">Chưa có kiếp nào đang chơi.</div>';
      return;
    }
    const c = ctxLite(),
      X = ddBuild(c),
      W = c.world;
    if (!$("dd-loai")) fillSel(X);
    f.q = $("dd-q").value;
    f.kham = $("dd-kham").checked;
    f.may = $("dd-may").checked;
    f.loai = $("dd-loai").value;
    f.qg = $("dd-qg").value;
    f.cl = $("dd-cl").value;
    f.sort = $("dd-st").value || "gan";
    let cur = 0;
    try {
      cur = W.tho(run.viTri);
    } catch (e) {
      cur = 0;
    }
    const knownSet = new Set(run.daKhamPha || []),
      q = fold(f.q).trim(),
      toks = q.split(/\s+/).filter(Boolean);
    const res = [];
    for (const x of X.list) {
      if (f.loai && x.loai !== f.loai) continue;
      if (f.qg && x.qg !== f.qg) continue;
      if (f.cl && (f.cl === "cung" ? x.tho !== cur : x.tho === cur))
        continue;
      if (f.kham && !knownSet.has(x.id) && x.id !== run.viTri) continue;
      if (toks.length && !toks.every((t) => x.key.includes(t)))
        continue;
      if (!f.may && x.id !== run.viTri) {
        let ok = true;
        try {
          if (K.slotDaMo && !K.slotDaMo(c, x.id)) ok = false;
        } catch (e) {
          ok = true;
        }
        if (!ok) continue;
      }
      res.push(x);
    }
    for (const x of res) {
      try {
        x.d = W.distance(run.viTri, x.id);
      } catch (e) {
        x.d = Infinity;
      }
    }
    if (f.sort === "ten")
      res.sort((a, b) => a.name.localeCompare(b.name, "vi"));
    else
      res.sort(
        (a, b) => a.d - b.d || a.name.localeCompare(b.name, "vi"),
      );
    if (toks.length)
      res.sort(
        (a, b) =>
          (b.key.startsWith(q) ? 1 : 0) - (a.key.startsWith(q) ? 1 : 0),
      );
    if (f.focus) {
      const i = res.findIndex((x) => x.id === f.focus);
      if (i > 0) res.unshift(res.splice(i, 1)[0]);
    }
    shown = res.slice(0, f.n);
    let hereName = run.viTri;
    try {
      hereName = W.info(run.viTri).ten || run.viTri;
    } catch (e) {
      /* giữ mã */
    }
    $("dd-here").innerHTML =
      `Đang đứng: <b>${esc(hereName)}</b> · Linh thạch: <b>${esc(String(Math.floor(run.nhanVat.linhThach || 0)))}</b>`;
    $("dd-cnt").textContent =
      `${res.length} / ${X.list.length} địa danh${f.may ? "" : " (đã ẩn nơi còn phủ mây)"}.`;
    $("dd-list").innerHTML =
      shown
        .map((x, i) => {
          const dist =
            x.id === run.viTri
              ? "đang đứng"
              : isFinite(x.d)
                ? Math.round(x.d) + " đơn vị"
                : "";
          return `<details class="vk-card" data-i="${i}" ${f.focus === x.id ? "open" : ""}><summary><b>${esc(x.name)}</b> <span class="vk-mu">· ${esc([ddLoai(x.loai), x.qg, dist].filter(Boolean).join(" · "))}</span></summary><div class="dd-bd"></div></details>`;
        })
        .join("") +
        (res.length > shown.length
          ? `<button class="vk-btn sec" id="dd-more" style="width:100%">Xem Thêm ${Math.min(30, res.length - shown.length)} Địa Danh</button>`
          : "") ||
      '<div class="vk-card vk-mu">Không thấy địa danh nào.</div>';
    body.querySelectorAll("#dd-list details").forEach((el) => {
      const fill = () => {
        const x = shown[+el.dataset.i];
        if (!x) return;
        try {
          el.querySelector(".dd-bd").innerHTML = cardBody(
            x,
            ctxLite(),
            G(),
            G().state.run,
          );
          el.dataset.done = 1;
        } catch (e) {
          console.error(e);
          el.querySelector(".dd-bd").innerHTML = errBox(e);
        }
      };
      if (el.open) fill();
      el.addEventListener("toggle", () => {
        if (el.open && !el.dataset.done) {
          tele = null;
          fill();
        }
      });
    });
    const mb = $("dd-more");
    if (mb)
      mb.onclick = () => {
        f.n += 30;
        draw();
      };
  };

  const say = (r) => {
    const m = body.querySelector("#dd-msg");
    if (m)
      m.innerHTML = `<div class="vk-card ${r.ok ? "vk-ok" : "vk-bad"}" style="font-size:14px">${esc(r.msg)}</div>`;
  };
  body.onclick = (ev) => {
    const t = ev.target.closest && ev.target.closest(".dd-go, .dd-tp");
    if (!t || t.disabled) return;
    const id = t.dataset.id;
    if (!id) return;
    const X = ddBuild(ctxLite()),
      x = X.byId.get(id),
      nm = x ? x.name : id;
    let r;
    if (t.classList.contains("dd-go")) {
      if (
        !confirm(
          "Đi bộ tới " +
            nm +
            "?\nGame tính thời gian đi đường thật và có thể gặp biến cố giữa đường.",
        )
      )
        return;
      r = ddDoTravel(id);
    } else {
      const g = G(),
        src = getTele(g)
          .map((e) => e.s)
          .find((s) => s.k === t.dataset.src);
      if (!src) {
        say({
          ok: false,
          msg: "Không còn nguồn truyền tống này. Bấm Làm Mới rồi thử lại.",
        });
        return;
      }
      const o = (
        getTele(g).find((e) => e.s.k === src.k) || { m: new Map() }
      ).m.get(id);
      if (
        !confirm(
          "Dịch chuyển tới " +
            nm +
            " bằng " +
            src.ten +
            "?" +
            (o
              ? "\nTốn " +
                Math.round(o.cost || 0) +
                " linh thạch và khoảng 0,05 năm."
              : ""),
        )
      )
        return;
      r = ddDoTeleport(id, src);
    }
    f.focus = id;
    draw();
    say(r);
  };
  $("dd-q").oninput = debounce(() => {
    f.focus = null;
    f.n = 30;
    draw();
  }, 150);
  body.querySelectorAll("#dd-kham, #dd-may").forEach((el) => {
    el.onchange = () => {
      f.focus = null;
      f.n = 30;
      draw();
    };
  });
  draw();
}

// ── Cảnh báo (Tổng quan) + thăng cấp xa hơn + tự kiểm tra
function warnings() {
  const K = S.core,
    c = ctx(),
    run = c.run,
    nv = run.nhanVat,
    w = [];
  try {
    const left = K.thoNguyenToiDa(nv) - nv.tuoi;
    if (left < 30)
      w.push(["bad", `Thọ chỉ còn ${Math.floor(left)} năm.`]);
  } catch {}
  if (has("chuanBiBeQuan", "retreatTargetGain")) {
    try {
      const { p } = planData();
      if (
        p.need > 0 &&
        p.hereYears !== Infinity &&
        p.hereYears > p.left - 5
      )
        w.push([
          "bad",
          `Bế quan ở chỗ này cần ~${Math.ceil(p.hereYears)} năm mới tới Đại viên mãn, nhưng thọ chỉ còn ${Math.floor(p.left)} năm. Xem tab Đột phá.`,
        ]);
    } catch {}
  }
  if ((nv.lichLuyen || 0) < 2)
    w.push([
      "bad",
      "Lịch luyện sắp cạn: bế quan sẽ ngưng trệ. Đi đánh, đi xa để hồi.",
    ]);
  if (nv.thuongThe)
    w.push([
      "bad",
      `Đang bị thương ${nv.thuongThe} bậc: tu luyện và đột phá đều giảm.`,
    ]);
  const tm = run.tongMon;
  if (tm && tm.promotionRetryYear && tm.promotionRetryYear > run.nam)
    w.push([
      "",
      `Khảo hạch tông môn bị khóa thêm ${num(tm.promotionRetryYear - run.nam)} năm.`,
    ]);
  if (has("thieuDeKhaoHach"))
    for (const ng of Object.keys(nv.nghe || {})) {
      try {
        const r = K.thieuDeKhaoHach(c, ng).find((x) =>
          x.includes("rớt"),
        );
        if (r) w.push(["", `${NGHE[ng] || ng}: ${r}.`]);
      } catch {}
    }
  const seen = new Map();
  for (const l of run.log || [])
    if (l.expiresAt && l.key) seen.set(l.key, l);
  for (const l of seen.values()) {
    const d = l.expiresAt - run.nam;
    if (d > 0.05 && d < 0.6)
      w.push([
        "",
        `Sắp hết hạn (${num(d)} năm): ${cleanTxt(String(l.text).replace(/còn [\d.,]+ năm\.?/, ""))}`,
      ]);
  }
  return w;
}
function masterInfo(c) {
  const ms = Object.values(c.run.npc || {}).filter(
    (n) => n.song && n.danhPhan === "su_phu",
  );
  return ms
    .map(
      (m) => `${esc(m.ten)} (thiện cảm ${Math.round(m.haoCam ?? 0)})`,
    )
    .join(", ");
}
async function selfTest(out) {
  const K = S.core,
    rows = [];
  const t = async (name, fnc) => {
    try {
      const r = await fnc();
      rows.push([name, true, r || ""]);
    } catch (e) {
      rows.push([name, false, (e && e.message) || String(e)]);
    }
    out.innerHTML = rows
      .map(
        ([n, ok, m]) =>
          `<div class="vk-row"><span>${esc(n)}</span><b class="${ok ? "vk-ok" : "vk-bad"}">${ok ? "OK" : "LỖI"}</b></div>${ok ? "" : `<div class="vk-mu" style="font-size:12px">${esc(m)}</div>`}`,
      )
      .join("");
    await sleep0();
  };
  await t("Đọc nhân vật", () => {
    const nv = nvNow();
    if (!nv.kinhMach) throw new Error("thiếu kinh mạch");
  });
  await t("Kinh mạch + đánh thử", () => {
    const r = evalCurrent(nvNow(), "bal");
    if (!r.P) throw new Error("không dựng được nhân vật");
    const nv0 = nvNow();
    nv0.kinhMach.manh = [];
    const { cand } = buildCandidates(nv0);
    const n = Object.values(cand).reduce((a, x) => a + x.length, 0);
    if (Object.keys(cand).length && !n)
      throw new Error("không tìm được chỗ đặt nào cho đồ trong túi");
    return n + " chỗ đặt";
  });
  await t("Đột phá", () => {
    K.chuanBiDotPha(ctx(), { dan: [], thieuDot: 0 });
  });
  await t("Kế hoạch thọ", () => {
    if (!has("chuanBiBeQuan", "retreatTargetGain", "retreatGain"))
      throw new Error("thiếu hàm");
    planData();
  });
  await t("Thi nghề", () => {
    if (!has("phanBoKhaoHach")) throw new Error("thiếu hàm");
    K.phanBoKhaoHach(ctx(), "luyen_dan", "thuong");
  });
  await t("Luyện đan", () => {
    if (!has("chuanBiLuyen")) throw new Error("thiếu hàm");
    recipeRows(ctx(), nvNow());
  });
  await t("Chế phù · Luyện bảo · Trận pháp", () => {
    if (!has("chuanBiLuyen")) throw new Error("thiếu hàm");
    const nv = nvNow();
    let n = 0,
      bad = 0;
    for (const ng of ["che_phu", "luyen_bao", "tran_phap"]) {
      const r = recipeRows(ctx(), nv, ng);
      n += r.length;
      bad += r.bad.length;
    }
    return (
      n +
      " công thức tính được" +
      (bad ? ", " + bad + " chưa mô phỏng được" : "")
    );
  });
  await t("Tàng Kinh Các", () => {
    K.hangTong(ctx(), "cong_phap");
  });
  await t("Chợ (1 nơi)", async () => {
    const c = ctx();
    const near = nearSlots(c, 3);
    for (const { slot } of near) {
      const encs = K.facilitiesAt(c, slot);
      for (const id of encs) {
        const d = C().encounters.get(id);
        if (
          d &&
          d.kind === "cua_hang" &&
          d.ke_hang &&
          d.ke_hang.length
        ) {
          K.shelfStock({ ...c, noi: slot }, id, slot);
          return "ok";
        }
      }
    }
    return "không có tiệm gần";
  });
  await t("Treo thưởng", () => {
    if (!has("bangTreoThuong")) throw new Error("thiếu hàm");
    const c = ctx();
    K.bangTreoThuong(c, c.run.viTri, "thanh_tran");
  });
  await t("Giá bán", () => {
    if (!has("giaBan")) throw new Error("thiếu hàm");
  });
  await t("Chợ ngập hàng", () => {
    const c = ctx();
    glutRows(c);
    const it = [...C().items.values()].find((x) => x.gia);
    const s = sellTotal(c, it.id, it, 3);
    if (!(s.first > 0)) throw new Error("giá bán = 0");
    return S.core.glutRoom
      ? "game có giới hạn ngập hàng"
      : "game cũ, tính theo giá một món";
  });
  await t("Ước lượng trận của game", () => {
    if (!has("revealedCombatRisk")) throw new Error("thiếu hàm");
    const c = ctx();
    const r = S.core.revealedCombatRisk(
      c,
      [...C().enemies.keys()][0],
      {},
    );
    if (!r) throw new Error("không trả kết quả");
    return r.level;
  });
  await t("Tự Động (Auto Buôn Bán · Săn Yêu)", () => {
    const g = G(),
      need = [
        "travelTo",
        "doAction",
        "canDo",
        "enterNode",
        "chooseActivity",
        "leaveShop",
        "shopView",
        "shopBuy",
        "shopSell",
        "shopBuyQuote",
        "shopSellQuote",
        "tocChienTran",
        "duKienTran",
        "xongTran",
        "closeEncounter",
        "closeLongNotice",
        "encounterView",
        "choose",
      ];
    const miss = need.filter((k) => typeof g[k] !== "function");
    if (miss.length)
      throw new Error("game thiếu hàm điều khiển: " + miss.join(", "));
    if (!has("facilitiesAt", "giaMua", "giaBan", "travelYears"))
      throw new Error("thiếu hàm giá mua bán");
    return (
      "đủ " +
      need.length +
      " hàm điều khiển" +
      (S.core.glutRoom ? ", có giới hạn Chợ Ngập Hàng" : "")
    );
  });
  await t("Auto Kinh Mạch (đặt · gỡ · bộ · mở ô)", () => {
    const g = G(),
      need = [
        "datManh",
        "goManh",
        "goHetManh",
        "switchLoadout",
        "unlockLoadoutSlot",
        "moO",
      ];
    const miss = need.filter((k) => typeof g[k] !== "function");
    if (miss.length)
      throw new Error("game thiếu hàm điều khiển: " + miss.join(", "));
    const ln = [
      "namLinhNgo",
      "masteryMult",
      "effectiveStat",
      "gradeMult",
    ].filter((k) => !S.core[k]);
    return (
      "đủ " +
      need.length +
      " hàm điều khiển · " +
      (ln.length
        ? "chưa đọc được hàm Lĩnh Ngộ (" +
          ln.join(", ") +
          "), chỉ ảnh hưởng nhãn năm Lĩnh Ngộ"
        : "đọc được Lĩnh Ngộ từ game") +
      " · " +
      kmOpenable(nvNow()).length +
      " ô mở được ngay"
    );
  });
  await t("Hướng Build (quét hướng · chọn đồ · chia ô)", () => {
    const nv = nvNow(),
      R = Math.max(0, Math.min(5, nv.canhGioi || 0));
    hbScanBuilds();
    const F = {
      k: "",
      R,
      st: nv.tieuCanhGioi || 0,
      phMin: 1,
      phMax: 8,
      he: "",
      vo: true,
      dt: "",
      src: "game",
      ratio: "55",
      mode: "bal",
      iters: 800,
      assume: true,
    };
    const b = BUILDS[0],
      sel = hbSelect(b, R, F, nv);
    if (!sel.all.length) throw new Error("không chọn được món nào");
    const B = hbBudget(hbNv(R, F.st, F, [])),
      plan = hbPlan(sel, B, 0.5),
      pool = hbPool(sel, plan);
    S.core.tinhKinhMach(hbNv(R, F.st, F, pool), C());
    return (
      BUILDS.length +
      " hướng (" +
      BUILDS.filter((x) => x.dyn).length +
      " mới quét) · " +
      sel.all.length +
      " món khớp · " +
      B +
      " ô thông · kế hoạch " +
      plan.tamUsed +
      "/" +
      plan.tamB +
      " ô Tâm Pháp, " +
      plan.chUsed +
      "/" +
      plan.chB +
      " ô Chiến Pháp · " +
      pool.length +
      " món thử xếp"
    );
  });
  await t("Bản Mệnh Pháp Bảo", () => {
    const nv = nvNow(),
      D = bmD(),
      Cc = C();
    if (!D.tier || D.tier.length !== 4)
      throw new Error("thiếu bảng tầng bản mệnh");
    const it = [...Cc.items.values()].find(
      (x) => x.loai === "phap_khi" && !bmEligible(x),
    );
    if (!it)
      throw new Error(
        "không thấy pháp khí nào hợp làm bản mệnh trong dữ liệu game",
      );
    const cs = bmCostTe(nv, it);
    if (!(cs.years > 0) || !(cs.essence > 0))
      throw new Error("chi phí tế luyện không đọc được");
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
    return (
      (K.bm ? "đọc số liệu từ code game" : "dùng số liệu dự phòng") +
      " · " +
      (miss.length
        ? "chưa nhận ra hàm: " + miss.join(", ")
        : "đủ 9 hàm lõi của game") +
      " · " +
      (nv.natal ? "đang có bản mệnh" : "chưa có bản mệnh")
    );
  });
  await t("Địa Danh · Truyền Tống", () => {
    const g = G();
    for (const k of [
      "travelTo",
      "teleportOptions",
      "resume",
      "useItem",
      "encounterView",
      "canDo",
      "doAction",
      "choose",
    ])
      if (typeof g[k] !== "function")
        throw new Error("game thiếu hàm " + k);
    const b = ddBuild(ctxLite());
    if (!b.list.length) throw new Error("không đọc được địa danh");
    const o = g.teleportOptions({ kind: "array" });
    if (!Array.isArray(o))
      throw new Error("teleportOptions không trả danh sách");
    return (
      b.list.length +
      " địa danh, " +
      o.length +
      " nơi trong danh sách truyền tống"
    );
  });
  await t("Tra Cứu (Vật Phẩm · Quái Vật)", () => {
    S.tcx = null;
    const X = tcBuild();
    if (!X.items.length || !X.mons.length)
      throw new Error("không có dữ liệu");
    const it = X.items.find((x) => X.drops.has(x.id)) || X.items[0];
    tcItemHtml(it);
    tcMonHtml(X.mons[0]);
    return (
      X.items.length +
      " vật phẩm · " +
      X.mons.length +
      " quái · " +
      X.drops.size +
      " món có nguồn rơi"
    );
  });
  await t(
    "Hằng số săn cạn",
    () =>
      (S.core && S.core.san ? "đọc từ game: " : "số dự phòng: ") +
      AU_T4 +
      " lần mỗi nơi, hồi 1 lần mỗi " +
      AU_ZAN +
      " năm",
  );
  await t("Độ nguy hiểm", () => {
    if (!has("doChenh", "mucHiem")) throw new Error("thiếu hàm");
    const c = ctx();
    K.mucHiem(K.doChenh(c, c.run, c.run.viTri));
  });
  await t(
    "Nối lõi game (tuTien.core)",
    () =>
      "game v" +
      TT.gameVersion +
      " · apiVersion " +
      TT.apiVersion +
      " · " +
      (K.optMissing.length
        ? "thiếu: " + K.optMissing.join(", ")
        : "đủ hàm lõi, không cần dò regex"),
  );
  await t("Màn hình", () => UI.fitInfo());
  if ((K.optMissing || []).length)
    rows.push(["Hàm chưa nhận ra", false, K.optMissing.join(", ")]);
  out.innerHTML += `<div class="vk-mu" style="font-size:12px;margin-top:6px">Tool ${TOOL_VER} · game ${esc(K.bundle)}</div>`;
}
function tongQuanExtra() {
  const c = ctx();
  const w = warnings();
  const warnHtml = w.length
    ? w
        .map(
          ([k, t]) =>
            `<div class="${k === "bad" ? "vk-bad" : ""}" style="padding:3px 0">• ${esc(t)}</div>`,
        )
        .join("")
    : '<div class="vk-ok">Không có gì đáng lo.</div>';
  body.insertAdjacentHTML(
    "afterbegin",
    `<div class="vk-card"><h3>Cảnh báo</h3>${warnHtml}</div>${statusCard(c)}`,
  );
  const tm = S.core.tongMonCua(c);
  if (tm) {
    const sect = [...body.querySelectorAll(".vk-card")].find(
      (el) =>
        el.querySelector("h3") &&
        el.querySelector("h3").textContent.toLowerCase() === "sư môn",
    );
    if (sect) {
      let extra = "";
      const mi = masterInfo(c);
      extra += `<div class="vk-row"><span>Sư phụ</span><b>${mi || "chưa có"}</b></div>`;
      if (has("tienCuDuoc") && tm.capBac === 2) {
        try {
          const r = S.core.tienCuDuoc(c);
          extra += `<div class="vk-row"><span>Xin tiến cử lên Chân truyền</span>${r ? `<span class="vk-bad">${esc(r)}</span>` : '<span class="vk-ok">Được — gặp sư phụ xin tiến cử</span>'}</div>`;
        } catch {}
      }
      sect.insertAdjacentHTML("beforeend", extra);
    }
  }
  body.insertAdjacentHTML(
    "beforeend",
    `<div class="vk-card"><h3>Tự kiểm tra</h3><div class="vk-mu" style="font-size:13px">Chạy thử mọi chức năng với bản game hiện tại. Nếu có dòng LỖI, chụp màn hình gửi Claude.</div><button class="vk-btn" id="vk-st">Tự kiểm tra</button><div id="vk-sto"></div></div>`,
  );
  body.querySelector("#vk-st").onclick = async (ev) => {
    ev.target.disabled = true;
    await selfTest(body.querySelector("#vk-sto"));
    ev.target.disabled = false;
  };
}

// ── Chợ: tìm bộ mua tốt nhất theo ngân sách
async function comboSearch(prog) {
  const { measured, money } = S.cho;
  const cand = measured.filter((m) => m.gain > 1).slice(0, 5);
  if (cand.length < 2) return null;
  const nv = nvNow();
  const nv0 = clone(nv);
  nv0.kinhMach.manh = [];
  const base = S.cho.base;
  const sets = [];
  for (let i = 0; i < cand.length; i++)
    for (let j = i + 1; j < cand.length; j++) {
      sets.push([cand[i], cand[j]]);
      for (let k = j + 1; k < cand.length; k++)
        sets.push([cand[i], cand[j], cand[k]]);
    }
  const ok = sets.filter(
    (s) => s.reduce((a, m) => a + m.r.price, 0) <= money,
  );
  const res = [];
  for (let i = 0; i < ok.length && !S.abort; i++) {
    const s = ok[i];
    const nvX = clone(nv0);
    s.forEach((m) => {
      nvX.tuiDo[m.r.it.id] = 1;
    });
    const r = await anneal({
      nv0: nvX,
      mode: "bal",
      iters: 450,
      init: base.manh,
      onProg: (f) =>
        prog((i + f) / ok.length, `Thử bộ ${i + 1}/${ok.length}…`),
    });
    res.push({
      s,
      gain: r.score - base.score,
      wins: r.wins,
      n: r.n,
      cost: s.reduce((a, m) => a + m.r.price, 0),
    });
  }
  res.sort((a, b) => b.gain - a.gain);
  return { res, singles: cand };
}

// ═════════════════════════ BẢN 2.1: ước lượng trận bằng chính hàm của game ═════════════════════════
const LV = {
  an_toan: ["Thắng chắc", "vk-ok", 3],
  ngang_suc: ["Thắng, bị thương", "", 2],
  hiem: ["Thua", "vk-bad", 1],
  tu_dia: ["Thua nặng (tử địa)", "vk-bad", 0],
  unknown: ["Không đoán được", "vk-mu", 1.5],
};
const lvTag = (r) => {
  const l = LV[r.level] || LV.unknown;
  return `<span class="${l[1]}">${l[0]}</span>${r.hidden ? '<br><span class="vk-mu" style="font-size:11px">(game ghi "không đoán được", Tool đánh thử)</span>' : ""}`;
};
const lvRank = (r) => (LV[r.level] || LV.unknown)[2];
// Mô phỏng mọi trận có thể gặp trong một sự kiện, đúng như game ước lượng (quái, cấp, tiểu cảnh giới, đồng bọn).
function encThreat(encId, slot, vars, nam) {
  const def = C().encounters.get(encId);
  if (!def) return null;
  if (!has("revealedCombatRisk")) return null;
  const effs = [];
  const walk = (choices) =>
    (choices || []).forEach((ch) =>
      (ch.effects || []).forEach((ef) => {
        if (ef && ef.combat !== undefined) effs.push({ ch, ef });
      }),
    );
  walk(def.choices);
  for (const sc of Object.values(def.scenes || {}))
    walk(sc && sc.choices);
  const out = [],
    seen = new Set();
  for (const { ch, ef } of effs) {
    const c = ctx();
    if (nam !== undefined) c.run.nam = nam;
    c.enc = {
      id: encId,
      slot,
      vars: { ...(vars || {}) },
      nodeFlags: {},
    };
    c.noi = slot;
    let r;
    try {
      r = S.core.revealedCombatRisk(c, ef.combat, ef);
    } catch {
      continue;
    }
    if (!r) continue;
    const k = (r.enemy || "") + "|" + (r.realm || "");
    if (seen.has(k)) continue;
    seen.add(k);
    out.push({ ...r, choice: cleanTxt(ch.text) });
  }
  return out;
}
const threatHtml = (th) => {
  if (th === null) return '<span class="vk-mu">?</span>';
  if (!th.length) return '<span class="vk-mu">không phải đánh</span>';
  const worst = th.reduce((a, b) => (lvRank(b) < lvRank(a) ? b : a));
  return `${lvTag(worst)}<br><span class="vk-mu" style="font-size:12px">${th.map((x) => `${esc(x.enemy || "?")}${x.realm ? " · " + esc(x.realm) : ""}`).join("<br>")}</span>`;
};
const threatRank = (th) =>
  th === null ? 1.5 : !th.length ? 3 : Math.min(...th.map(lvRank));

// ── Tab Treo thưởng
async function scanBoards(maxY, withSect, prog) {
  const K = S.core,
    c0 = ctx(),
    run = c0.run,
    out = [];
  const list = nearSlots(c0, maxY);
  const tm = withSect ? K.tongMonCua(c0) : null;
  const jobs = list.map((x) => ({ ...x, bang: "thanh_tran" }));
  if (tm) {
    let y = 0;
    try {
      y = K.travelYears(c0, tm.slot);
    } catch {}
    jobs.unshift({ slot: tm.slot, y, bang: "tong_mon" });
  }
  for (let i = 0; i < jobs.length; i++) {
    if (S.abort) break;
    if (i % 8 === 0) {
      prog && prog(i / jobs.length, "Đang xem bảng treo thưởng…");
      await sleep0();
    }
    const { slot, y, bang } = jobs[i];
    const arrive = run.nam + y;
    const cA = ctx();
    cA.run.nam = arrive;
    let viec;
    try {
      viec = K.bangTreoThuong(cA, slot, bang);
    } catch {
      continue;
    }
    for (const v of viec || []) {
      let y2 = 0;
      try {
        y2 = K.travelYears(withPlace(cA, slot), v.slot);
      } catch {}
      out.push({
        board: slot,
        bang,
        y,
        v,
        y2,
        arrive,
        d: danger(c0, v.slot),
        th: null,
      });
    }
  }
  // ước lượng trận (chậm hơn) sau khi đã có danh sách
  for (let i = 0; i < out.length; i++) {
    if (S.abort) break;
    if (i % 4 === 0) {
      prog &&
        prog(0.5 + (0.5 * i) / out.length, "Đang thử sức từng việc…");
      await sleep0();
    }
    const r = out[i];
    r.th = encThreat(r.v.enc, r.v.slot, r.v.vars, r.arrive + r.y2);
  }
  return out;
}
function tabTreoThuong() {
  const c = ctx(),
    run = c.run;
  const taken = (run.viecNhan || []).map((v) => {
    let y = 0;
    try {
      y = S.core.travelYears(c, v.slot);
    } catch {}
    let bRealm = null;
    if (S.core && S.core.bountyRealm) {
      try {
        bRealm = S.core.bountyRealm(c, run, v);
      } catch (e) {}
    }
    return {
      v,
      y,
      bRealm,
      th: encThreat(v.enc, v.slot, v.vars, run.nam + y),
      left:
        v.hetHanNam !== undefined ? v.hetHanNam - run.nam : undefined,
    };
  });
  body.innerHTML = `
    <div class="vk-card"><h3>Việc đang nhận</h3>${taken.length ? `<table class="vk-t"><tr><th>Việc</th><th>Đi</th><th>Sức</th></tr>${taken.map((x) => `<tr><td><b>${esc(cleanTxt(x.v.ten))}</b>${x.bRealm !== null && x.bRealm !== undefined ? ` <span class="tc-pill" style="font-size:11px;vertical-align:middle">${esc(realmName(x.bRealm))}</span>` : ""}<br><span class="vk-mu" style="font-size:12px">${esc(placeName(c, x.v.slot))}${x.left !== undefined ? ` · còn <span class="${x.left < x.y ? "vk-bad" : ""}">${num(x.left)} năm</span>` : ""}${x.v.thuong ? ` · ${x.v.thuong} linh thạch` : ""}${x.v.congHien ? ` · ${x.v.congHien} cống hiến` : ""}</span></td><td>${yrs(x.y)}</td><td>${threatHtml(x.th)}</td></tr>`).join("")}</table>` : '<div class="vk-mu">Chưa nhận việc nào.</div>'}</div>
    <div class="vk-card"><h3>Bảng treo thưởng quanh đây</h3>
      <div class="vk-mu" style="font-size:13px">Bảng ở thành, trấn, thôn và bảng nhiệm vụ sư môn. Mỗi bảng đổi việc sau 1 năm kể từ lần có người xem; Tool tính đúng danh sách bạn sẽ thấy khi tới nơi (theo tốc độ đi của bạn), rồi dùng chính hàm của game để thử sức với từng trận trong việc đó.</div>
      <div style="margin:8px 0"><select class="vk-sel" id="vk-tby"><option value="0.6">Trong 6 tháng đường</option><option value="1.2" selected>Trong 1 năm đường</option><option value="2.5">Trong 2,5 năm đường</option></select>
      <label style="font-size:14px;margin-left:6px"><input type="checkbox" id="vk-tbs" checked> Gồm bảng sư môn</label></div>
      <label style="display:block;font-size:14px;margin-bottom:6px"><input type="checkbox" id="vk-tbw"> Chỉ hiện việc thắng được</label>
      <button class="vk-btn" id="vk-tb" ${has("bangTreoThuong") ? "" : "disabled"}>Xem bảng</button>${progressHtml("vk-pr8")}<div id="vk-tbo">${has("bangTreoThuong") ? "" : needMsg("bảng treo thưởng")}</div></div>
    <div class="vk-mu" style="font-size:12px">"Thắng chắc" = thắng mà không bị thương; "Thắng, bị thương" = thắng nhưng dính thương thế; "Thua nặng" = địch hơn hẳn. Đây là cùng cách game tự đánh giá trước khi vào trận, tính với kinh mạch đang xếp.</div>`;
  const render = () => {
    const all = S.boards || [];
    const onlyWin = body.querySelector("#vk-tbw").checked;
    const rows = all
      .filter((r) => !onlyWin || threatRank(r.th) >= 2)
      .sort(
        (a, b) =>
          (threatRank(b.th) >= 2) - (threatRank(a.th) >= 2) ||
          ((b.v.thuong || 0) + 3 * (b.v.congHien || 0)) /
            (0.3 + b.y + b.y2) -
            ((a.v.thuong || 0) + 3 * (a.v.congHien || 0)) /
              (0.3 + a.y + a.y2),
      );
    body.querySelector("#vk-tbo").innerHTML = rows.length
      ? `<table class="vk-t"><tr><th>Việc</th><th>Thưởng</th><th>Sức</th></tr>${rows
          .slice(0, 60)
          .map(
            (r) =>
              `<tr><td><b>${esc(cleanTxt(r.v.ten))}</b><br><span class="vk-mu" style="font-size:12px">${r.bang === "tong_mon" ? "Bảng sư môn" : "Nhận"} ở ${esc(placeName(c, r.board))} (${yrs(r.y)}) → làm ở ${esc(placeName(c, r.v.slot))} (+${yrs(r.y2)}, ${dangerTag(r.d)}) · hạn ${r.v.han} năm${r.y2 > r.v.han ? ' <span class="vk-bad">không kịp hạn</span>' : ""}</span></td><td>${r.v.thuong ? `<b>${r.v.thuong}</b> lt` : ""}${r.v.congHien ? `<br>${r.v.congHien} cống hiến` : ""}${r.v.danhVong ? '<br><span class="vk-mu" style="font-size:12px">+danh vọng</span>' : ""}</td><td>${threatHtml(r.th)}</td></tr>`,
          )
          .join(
            "",
          )}</table><div class="vk-mu" style="font-size:12px">Nhận tối đa 3 việc cùng lúc. Bỏ việc giữa chừng bị trừ danh vọng / cống hiến.</div>`
      : '<div class="vk-mu">Không có việc nào phù hợp.</div>';
  };
  if (S.boards) render();
  body.querySelector("#vk-tbw").onchange = () => S.boards && render();
  body.querySelector("#vk-tb").onclick = async (ev) => {
    ev.target.disabled = true;
    S.abort = false;
    const prog = bindProgress(body.querySelector("#vk-pr8"));
    try {
      S.boards = await scanBoards(
        +body.querySelector("#vk-tby").value,
        body.querySelector("#vk-tbs").checked,
        prog,
      );
      body.querySelector("#vk-pr8").style.display = "none";
      render();
    } catch (e) {
      body.querySelector("#vk-tbo").innerHTML = errBox(e);
    }
    ev.target.disabled = false;
  };
}
// tìm quái theo tên, không phân biệt dấu (kèm bộ nhớ đệm & đường tắt ASCII tối ưu hiệu năng)
const foldCache = new Map();
const fold = (x) => {
  if (!x) return "";
  const s = String(x);
  if (!/[^\x00-\x7F]/.test(s)) return s.toLowerCase();
  const cached = foldCache.get(s);
  if (cached !== undefined) return cached;
  const res = s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();
  if (foldCache.size < 3000) {
    foldCache.set(s, res);
  }
  return res;
};

// ═════════════════════════ BẢN 2.3: Đồ nên săn + Đồ trong game ═════════════════════════
const NOT_SHOP = {
  chi_luyen: "chỉ luyện chế",
  chi_khai_bao: "chỉ có trong bí cảnh / rương",
  di_bao: "dị bảo",
  nghich_thien: "nghịch thiên",
  tong_mon: "đổi ở tông môn",
  khong_nguon: "không rõ nguồn",
  noi_bo: "nội bộ tông",
};
function sourceNote(it) {
  const out = [];
  for (const t of it.tag || []) if (NOT_SHOP[t]) out.push(NOT_SHOP[t]);
  if (it.theo_kiep) out.push("giữ qua kiếp sau");
  if (it.tran_phai) out.push("chỉ phái riêng");
  if (it.xuat_xu) out.push("đặc sản vùng");
  if (it.dia_hinh && it.dia_hinh.length)
    out.push(
      "mọc/có ở: " +
        it.dia_hinh
          .map(
            (d) =>
              ({
                son_mach: "núi",
                rung_ram: "rừng",
                ho_nuoc: "đầm hồ",
                hoang_mac: "hoang mạc",
                hoang_nguyen: "đồng hoang",
              })[d] || d,
          )
          .join(", "),
    );
  return out;
}
const shopable = (it) =>
  it.gia > 0 &&
  !it.theo_kiep &&
  it.loai !== "lenh_bai" &&
  !(it.tag || []).some((t) => NOT_SHOP[t]);

// ── Tab Đồ nên săn: cả game, hợp linh căn & kinh mạch, đo lợi thật
function fitElem(it, nv) {
  const km = nv.kinhMach,
    open = km.mau.filter((m, i) => km.trangThai[i] !== "an");
  const share = (h) =>
    open.filter((m) => m === h).length / Math.max(1, open.length);
  const lc = new Set((nv.linhCan && nv.linhCan.he) || []);
  const hs = it.he && it.he.length ? it.he : ["vo_sac"];
  let s = 0;
  for (const h of hs) {
    s +=
      share(h) * 2 + (lc.has(h) ? 1 : 0) + (h === "vo_sac" ? 0.4 : 0);
  }
  return s / hs.length;
}
function quickGain(nv, baseManh, id) {
  const K = S.core,
    Cc = C();
  const nv0 = clone(nv);
  nv0.kinhMach.manh = baseManh.map((m) => ({ ...m }));
  nv0.tuiDo[id] = 1;
  const sc = (manh) => {
    const n2 = clone(nv0);
    n2.kinhMach.manh = manh;
    const R = K.tinhKinhMach(n2, Cc);
    const uy = (R.chieu || []).reduce(
      (a, x) => a + (x.uyLuc || 0) / 10,
      0,
    );
    return (
      R.linhLuc +
      6 * (R.biDong.toc_do || 0) +
      4 * (R.biDong.dot_pha || 0) +
      uy -
      3 * (R.diemNghich || 0) -
      50 * R.manh.filter((m) => m && !m.thong).length
    );
  };
  const base = sc(nv0.kinhMach.manh);
  const it = Cc.items.get(id),
    g = K.luoiKinhMach(Cc, nv0),
    seen = new Set();
  let best = -Infinity,
    bestManh = null;
  for (let xoay = 0; xoay < 4; xoay++)
    for (let y = 0; y < g.cao; y++)
      for (let x = 0; x < g.rong; x++) {
        const m = { item: id, x, y, xoay };
        const cells = K.oCuaManh(g, m, it);
        if (!cells) continue;
        const ck = [...cells].sort((a, b) => a - b).join(",");
        if (seen.has(ck)) continue;
        seen.add(ck);
        // chèn vào ô trống, hoặc thay một món đang chiếm
        const hit = nv0.kinhMach.manh
          .map((p, i) =>
            (K.oCuaManh(g, p, Cc.items.get(p.item)) || []).some((c) =>
              cells.includes(c),
            )
              ? i
              : -1,
          )
          .filter((i) => i >= 0);
        if (hit.length > 3) continue;
        const manh = nv0.kinhMach.manh.filter(
          (p, i) => !hit.includes(i),
        );
        const nvT = clone(nv0);
        nvT.kinhMach.manh = manh.map((p) => ({ ...p }));
        let err;
        try {
          err = K.kiemTraDat(nvT, Cc, m);
        } catch {
          err = "x";
        }
        if (err) continue;
        manh.push(m);
        const v = sc(manh) - base;
        if (v > best) {
          best = v;
          bestManh = manh;
        }
      }
  return { q: best, manh: bestManh };
}
function tabSan() {
  const nv = nvNow(),
    Cc = C();
  body.innerHTML = `
    <div class="vk-card"><h3>Đồ nên săn (cả game)</h3>
      <div class="vk-mu" style="font-size:13px">Tool xét <b>mọi</b> công pháp và pháp khí bạn dùng được ở cảnh giới hiện tại, ưu tiên món hợp linh căn (${esc(((nv.linhCan && nv.linhCan.he) || []).map(heTen).join(", "))}) và màu kinh mạch, thử từng món vào kinh mạch rồi đánh trận mẫu để đo lợi thật. Không cần món đó đang bày ở chợ.</div>
      <div style="margin:8px 0"><select class="vk-sel" id="vk-sb"><option value="1">Giá ≤ linh thạch đang có (${Math.floor(nv.linhThach || 0)})</option><option value="2" selected>Giá ≤ 2 lần số đang có</option><option value="5">Giá ≤ 5 lần</option><option value="0">Không giới hạn giá</option></select></div>
      <label style="display:block;font-size:14px;margin-bottom:6px"><input type="checkbox" id="vk-ss" checked> Chỉ món mua được ở tiệm (bỏ món chỉ luyện chế, chỉ có trong bí cảnh, dị bảo, đồ tông môn)</label>
      <button class="vk-btn" id="vk-sg">Tìm đồ</button>${progressHtml("vk-pr9")}<div id="vk-so">${S.san || ""}</div></div>`;
  body.querySelector("#vk-sg").onclick = async (ev) => {
    ev.target.disabled = true;
    S.abort = false;
    const prog = bindProgress(body.querySelector("#vk-pr9"));
    try {
      const mult = +body.querySelector("#vk-sb").value,
        onlyShop = body.querySelector("#vk-ss").checked;
      const money = nv.linhThach || 0,
        cap = mult ? Math.max(50, money * mult) : Infinity;
      const cands = [...Cc.items.values()].filter(
        (it) =>
          (it.loai === "cong_phap" || it.loai === "phap_khi") &&
          it.hinh &&
          (it.canh_gioi ?? 0) <= nv.canhGioi &&
          !(nv.tuiDo[it.id] > 0) &&
          (!onlyShop || shopable(it)) &&
          (it.gia || 0) <= cap &&
          !(it.tag || []).includes("ma") &&
          !(it.tag || []).includes("nghich"),
      );
      // 1) xếp hiện tại làm nền
      prog(0.02, "Lấy cách xếp nền…");
      const nv0 = clone(nv);
      nv0.kinhMach.manh = [];
      const base = await anneal({
        nv0,
        mode: "bal",
        iters: 700,
        init: nv.kinhMach.manh,
        onProg: (f) => prog(0.02 + 0.13 * f, "Lấy cách xếp nền…"),
      });
      // 2) lọc nhanh bằng hệ số kinh mạch (giữ 80 món hợp hệ / phẩm cao nhất)
      cands.sort(
        (a, b) =>
          fitElem(b, nv) +
          0.25 * (b.pham_cap || 0) +
          0.6 * (b.canh_gioi ?? 0) -
          (fitElem(a, nv) +
            0.25 * (a.pham_cap || 0) +
            0.6 * (a.canh_gioi ?? 0)),
      );
      const nAll = cands.length;
      cands.splice(80);
      const quick = [];
      for (let i = 0; i < cands.length && !S.abort; i++) {
        if (i % 6 === 0) {
          prog(
            0.15 + (0.35 * i) / cands.length,
            `Thử nhanh ${i}/${cands.length} món…`,
          );
          await sleep0();
        }
        const it = cands[i];
        let q = -Infinity,
          manh = null;
        try {
          ({ q, manh } = quickGain(nv, base.manh, it.id));
        } catch {}
        if (manh) quick.push({ it, q, manh, fit: fitElem(it, nv) });
      }
      quick.sort((a, b) => b.q + 3 * b.fit - (a.q + 3 * a.fit));
      const top = quick.filter((x) => x.q > 0.01).slice(0, 12);
      for (const x of quick) {
        if (top.length >= 10) break;
        if (!top.includes(x)) top.push(x);
      }
      // 3) đo thật bằng trận mẫu
      const res = [];
      for (let k = 0; k < top.length && !S.abort; k++) {
        const x = top[k];
        const nvX = clone(nv0);
        nvX.tuiDo[x.it.id] = 1;
        const r = await anneal({
          nv0: nvX,
          mode: "bal",
          iters: 500,
          init: x.manh,
          onProg: (f) =>
            prog(0.5 + (0.5 * (k + f)) / top.length, `Đo ${x.it.ten}…`),
        });
        const r2 = stripDead(nvX, r, "bal");
        res.push({
          ...x,
          gain: r2.score - base.score,
          wins: r2.wins,
          n: r2.n,
        });
      }
      res.sort((a, b) => b.gain - a.gain);
      body.querySelector("#vk-pr9").style.display = "none";
      const good = res.filter((x) => x.gain > 1);
      const html = good.length
        ? `<div class="vk-mu" style="font-size:13px;margin:6px 0">Mốc hiện tại: thắng ${base.wins}/${base.n} trận mẫu. Đã xét ${nAll} món, đo kỹ ${res.length} món hứa hẹn nhất.</div><table class="vk-t"><tr><th>Món</th><th>Giá</th><th>Lợi</th></tr>${good
            .map((x) => {
              const where = whereToGet(x.it.id);
              const src = sourceNote(x.it);
              return `<tr><td><b>${esc(x.it.ten)}</b><br><span class="vk-mu" style="font-size:12px">${esc((x.it.he || ["vo_sac"]).map(heTen).join("/"))} · phẩm ${x.it.pham_cap} · ${itemDesc(x.it)}${src.length ? "<br>" + esc(src.join(" · ")) : ""}${where ? "<br>Có ở: " + where : ""}</span></td><td>~${x.it.gia}${x.it.gia > (nv.linhThach || 0) ? '<br><span class="vk-bad" style="font-size:12px">chưa đủ tiền</span>' : ""}</td><td class="vk-ok">+${Math.round(x.gain)}<br><span class="vk-mu" style="font-size:12px">${x.wins}/${x.n} thắng</span></td></tr>`;
            })
            .join(
              "",
            )}</table><div class="vk-mu" style="font-size:12px">"Lợi" = điểm sức mạnh tăng thêm sau khi Tool xếp lại kinh mạch có món đó (tính cả thắng trận, linh lực hồi, tu luyện, đột phá). Món có "Tàng Kinh Các" thì đổi bằng cống hiến, không tốn linh thạch.<br>Giá là giá gốc; ở tiệm thật lệch theo nơi (gần vùng sản sinh rẻ hơn). Muốn biết chỗ nào đang bán: quét tab Chợ quanh đây rồi quay lại đây.</div>`
        : `<div class="vk-mu">Không món nào mạnh hơn rõ rệt so với đồ đang có${mult ? " trong tầm giá này. Thử nới giới hạn giá." : ". Kinh mạch hiện tại đã dùng tốt đồ đang có; muốn mạnh thêm cần mở thêm ô kinh mạch."}</div>`;
      S.san = html;
      body.querySelector("#vk-so").innerHTML = html;
    } catch (e) {
      body.querySelector("#vk-so").innerHTML = errBox(e);
    }
    ev.target.disabled = false;
  };
}

// ── Tab Đồ trong game: danh mục theo công dụng
const DUNG_TXT = (d) => {
  const k = Object.keys(d)[0],
    v = d[k];
  const f = {
    heal: () => `chữa ${v} bậc thương thế`,
    tho_nguyen: () => `+${v} năm thọ`,
    tam_ma: () => `giảm ${Math.abs(v)} tâm ma`,
    tu_vi: () => `tăng tu vi (mức ${v})`,
    pha_binh_canh: () => `phá bình cảnh ${realmName(v.canh_gioi)}`,
    duong_pham: () =>
      `nâng phẩm đạo cơ ${realmName(v.canh_gioi)} (${v.nam} năm)`,
    unlock_cell: () => `+${v} lượt khai thông kinh mạch`,
    recolor_cell: () => `đổi màu ${v} ô kinh mạch theo linh căn`,
    heal_cell: () => `chữa ô kinh mạch tổn`,
    stat: () =>
      Object.entries(v)
        .map(
          ([a, b]) =>
            `${{ than_thuc: "thần thức", ngo_tinh: "ngộ tính", than_phap: "thân pháp", can_cot: "căn cốt", dao_tam: "đạo tâm", khi_van: "khí vận" }[a] || a} +${b}`,
        )
        .join(", "),
    dung_truyen_tong_phu: () =>
      `truyền tống tới trận đã biết, tầm ${v.tam}`,
    do_duong: () => "dò đường quanh vùng",
    tranh_hiem: () => "tránh nguy hiểm",
    truyen_am: () => "truyền âm",
    tu_luyen: () => `tu luyện ×${v.he_so} trong ${v.nam} năm`,
    heal_breakthrough_scar: () => "chữa vết thương do đột phá hụt",
  }[k];
  return f ? f() : k;
};
function itemFull(it) {
  const out = [];
  const d = itemDesc(it);
  if (d) out.push(d);
  if (it.dot_pha && it.dot_pha.pham)
    out.push(`đột phá ra phẩm cao hơn ${it.dot_pha.pham} bậc`);
  if (it.dot_pha && it.dot_pha.ti_le)
    out.push(
      `+${pct(it.dot_pha.ti_le || 0)} tỉ lệ đột phá${it.dot_pha.canh_gioi !== undefined ? " lên " + realmName(it.dot_pha.canh_gioi) : ""}${it.dot_pha.tam_ma ? ", +" + it.dot_pha.tam_ma + " tâm ma" : ""}`,
    );
  if (it.tu_luyen)
    out.push(
      `+${pct(it.tu_luyen.toc_do)} tu luyện trong ${it.tu_luyen.nam} năm${it.tu_luyen.canh_gioi !== undefined ? " (" + realmName(it.tu_luyen.canh_gioi) + ")" : ""}`,
    );
  for (const dd of it.dung || [])
    if (dd && typeof dd === "object") out.push(DUNG_TXT(dd));
  if (it.tran)
    out.push(
      "trong trận: " +
        Object.entries(it.tran)
          .map(
            ([k, v]) =>
              ({
                khi_huyet: () => `hồi ${pct(v)} khí huyết`,
                linh_luc: () => `hồi ${v} linh lực`,
                bo_chay: () =>
                  `bỏ chạy chắc hơn (${typeof v === "number" && v <= 1 ? pct(v) : v})`,
                chieu: () => `tung đòn uy lực ${v.uy}`,
                bao_phat: () => "bạo phát",
                khong_che: () => `khống chế địch ${v} lượt`,
                thuan: () => `khiên ${pct(v)} khí huyết`,
                thuong_the: () => `chữa ${v} bậc thương thế`,
              })[k]?.() || k,
          )
          .join(", "),
    );
  if (it.loai === "phuong_tien")
    out.push(
      `tốc độ đi ×${it.di_lai}${it.tam ? ", tầm " + it.tam : ""}${it.bay ? ", bay" : ""}${it.vuot_bien ? ", vượt biển" : ""}${it.bo_chay !== undefined ? ", thời gian bỏ chạy ×" + it.bo_chay : ""}${it.phuc_kich !== undefined ? ", bị phục kích ×" + it.phuc_kich : ""}${it.duoi_theo ? ", đuổi theo +" + pct(it.duoi_theo) : ""}`,
    );
  if (it.tru_vat) out.push(`+${it.tru_vat} ô túi`);
  if (it.noi_tai && it.loai !== "cong_phap" && it.loai !== "phap_khi")
    out.push(
      Object.entries(it.noi_tai)
        .map(
          ([k, v]) =>
            ({
              gia_mua: `giá mua ×${v}`,
              gia_ban: `giá bán ×${v}`,
              nhin_hang: "xem hàng tiệm từ xa",
              luyen_dan_them: `+${v} viên mỗi lò`,
            })[k] || `${k} ${v}`,
        )
        .join(", "),
    );
  if (it.loai === "dung_cu")
    out.push(
      `${{ luyen_dan: "đan lô", luyen_bao: "đỉnh", che_phu: "phù bút", tran_phap: "trận bút" }[it.dung_cu] || it.dung_cu} phẩm ${it.pham_cap}`,
    );
  if (it.di_hoa)
    out.push(
      `dị hỏa +${it.di_hoa} điểm luyện chế, trang bị thì chiêu hệ ${(it.he && it.he.length ? it.he : ["hoa"]).map(heTen).join("/")} +${DIHOA_PCT[(it.pham_cap || 1) - 1] || 0}%`,
    );
  if (typeof it.khuon === "string" && it.khuon.startsWith("enemy.")) {
    const en = C().enemies.get(it.khuon);
    if (en)
      out.push(
        `${it.loai === "trung_thu" ? "nở ra" : "luyện ra"}: ${en.ten}`,
      );
  }
  if (it.ngu_linh && it.ngu_linh.o)
    out.push(
      `mở ${it.ngu_linh.o} ô ${{ thu: "thú", khoi_loi: "khôi lỗi", trung: "cổ trùng", thi: "thi khôi", hon: "quỷ hồn" }[it.ngu_linh.loai] || "linh vật"}`,
    );
  if (
    it.ngu_linh &&
    !it.ngu_linh.o &&
    it.ngu_linh.loai &&
    it.loai !== "trung_thu"
  )
    out.push(
      `chuyên ngự ${{ thu: "thú", khoi_loi: "khôi lỗi", trung: "cổ trùng", thi: "thi khôi", hon: "quỷ hồn" }[it.ngu_linh.loai] || "linh vật"}`,
    );
  if (it.ngu_linh && it.ngu_linh.hoi_con)
    out.push(`hồi con ${pct(it.ngu_linh.hoi_con, 1)}`);
  if (it.ngu_linh && it.ngu_linh.duong_thuong)
    out.push(`dưỡng thương ${pct(it.ngu_linh.duong_thuong, 1)}`);
  if (it.cho_an)
    out.push(
      `cho ăn: ${(it.cho_an.loai || []).map((k) => ({ thu: "thú", linh_thu: "linh thú", khoi_loi: "khôi lỗi", trung: "cổ trùng", thi: "thi khôi", hon: "quỷ hồn" })[k] || k).join("/")} +${it.cho_an.exp} kinh nghiệm`,
    );
  if (it.loai === "don_phuong" && it.day) {
    const dp = C().donPhuong.get(it.day);
    const raId = dp && (dp.ra || dp.san_pham || dp.ket_qua);
    const ra =
      raId && C().items.get(typeof raId === "object" ? raId.id : raId);
    if (ra)
      out.push(
        `dạy ${{ luyen_dan: "luyện", luyen_bao: "luyện", che_phu: "chế" }[dp.nghe] || "làm"} ${ra.ten}${dp.chu ? " (cần " + dp.chu.map((x) => (C().items.get(x.id)?.ten || x.id) + " ×" + x.so).join(", ") + (dp.linh_thach ? ", " + dp.linh_thach + " linh thạch" : "") + ")" : ""}`,
      );
    else if (dp && dp.ten) out.push("dạy " + dp.ten);
  }
  return out
    .join(" · ")
    .replace(/\+-/g, "-")
    .replace(/(\d)\.(\d)/g, "$1,$2");
}
function categorize(it) {
  const dung = JSON.stringify(it.dung || "");
  if (it.loai === "cong_phap")
    return it.chieu
      ? "Đấu pháp (công pháp có chiêu)"
      : "Tâm pháp (tu luyện, bị động)";
  if (it.loai === "phap_khi")
    return it.chieu
      ? "Pháp khí chiến đấu"
      : "Pháp bảo bị động (giáp, ngọc…)";
  if (it.loai === "dan_duoc") {
    if (it.dot_pha) return "Đan tăng tỉ lệ đột phá";
    if (dung.includes("pha_binh_canh")) return "Đan phá bình cảnh";
    if (dung.includes("tho_nguyen")) return "Đan tăng thọ";
    if (dung.includes("_cell"))
      return "Đan kinh mạch (khai thông, đổi màu)";
    if (dung.includes("duong_pham")) return "Đan nâng phẩm đạo cơ";
    if (
      it.tu_luyen ||
      dung.includes('"tu_vi"') ||
      dung.includes('"tu_luyen"')
    )
      return "Đan tăng tu luyện / tu vi";
    if (dung.includes('"heal')) return "Đan chữa thương";
    if (dung.includes("tam_ma")) return "Đan giảm tâm ma";
    if (dung.includes('"stat"')) return "Đan tăng chỉ số";
    if (
      dung.includes("truyen_tong") ||
      dung.includes("do_duong") ||
      dung.includes("tranh_hiem") ||
      dung.includes("truyen_am")
    )
      return "Đi lại (phương tiện)";
    if (it.tran) return "Đan dùng trong trận";
    return "Đan khác";
  }
  if (it.loai === "phuong_tien") return "Đi lại (phương tiện)";
  if (it.loai === "tru_vat") return "Túi trữ vật";
  if (it.loai === "dung_cu")
    return it.dung_cu === "luyen_dan"
      ? "Đan lô"
      : it.dung_cu === "luyen_bao"
        ? "Đỉnh"
        : it.dung_cu === "tran_phap"
          ? "Trận bút"
          : "Phù bút";
  if (it.loai === "di_hoa") return "Dị hỏa";
  if (it.loai === "phu_luc") return "Phù lục";
  if (it.loai === "don_phuong")
    return "Bí Phương / Đơn Phương (công thức)";
  if (it.loai === "linh_duoc") return "Linh dược";
  if (it.loai === "yeu_tai") return "Yêu tài";
  if (it.loai === "nguyen_lieu") return "Nguyên liệu";
  if (it.loai === "dac_san") return "Đặc sản vùng";
  if (it.loai === "lenh_bai") return "Lệnh bài";
  return "Khác";
}
const CAT_ORDER = [
  "Tâm pháp (tu luyện, bị động)",
  "Đấu pháp (công pháp có chiêu)",
  "Pháp khí chiến đấu",
  "Pháp bảo bị động (giáp, ngọc…)",
  "Đan tăng tỉ lệ đột phá",
  "Đan tăng tu luyện / tu vi",
  "Đan phá bình cảnh",
  "Đan tăng thọ",
  "Đan chữa thương",
  "Đan giảm tâm ma",
  "Đan nâng phẩm đạo cơ",
  "Đan tăng chỉ số",
  "Đan kinh mạch (khai thông, đổi màu)",
  "Đan dùng trong trận",
  "Đan khác",
  "Đi lại (phương tiện)",
  "Túi trữ vật",
  "Đan lô",
  "Đỉnh",
  "Phù bút",
  "Dị hỏa",
  "Phù lục",
  "Bí Phương / Đơn Phương (công thức)",
  "Linh dược",
  "Yêu tài",
  "Nguyên liệu",
  "Đặc sản vùng",
  "Lệnh bài",
  "Khác",
];
