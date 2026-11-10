/**
 * Module: Luân Hồi, Thành Tựu, Thiên Kiêu Bảng, Nhân Mạch & Quản Lý Save
 */
// ───────────────────────── Luân Hồi · Thành Tựu · Thiên Kiêu Bảng · Nhân Mạch · Auto Luân Hồi (bản 6.13.0) ─────────────────────────
// Mọi dữ liệu đọc thẳng từ game (meta.moKhoa, meta.tienLo, run.npc, run.thienKieuBang…) và hàm của game (muaMoKhoa, tính điểm luân hồi, xếp Thiên Kiêu Bảng) nên tự khớp khi game đổi số.
var LH_NHOM = [
  ["can_cot", "Căn Cốt Vĩnh Viễn"],
  ["xuat_than", "Mở Xuất Thân"],
  ["thien_menh", "Thiên Mệnh"],
  ["lo_phi", "Lộ Phí Qua Sông (Dùng Một Kiếp)"],
];
var TT_NHOM = {
  canh_gioi: "Cảnh Giới",
  pham_chat: "Phẩm Chất",
  tong_mon: "Tông Môn",
  dao_lu: "Nhân Mạch",
  ket_nghia: "Nhân Mạch",
  thien_kieu_bang: "Thiên Kiêu Bảng",
  tam_ma: "Đột Phá",
  nuoc: "Trúc Cơ Theo Nước",
  chet: "Cách Chết",
  nghe: "Nghề Luyện Chế",
  bao_luc: "Bảo Lục",
  tuyet_menh: "Tuyệt Mệnh",
};
var NM_TEN = {
  quen_biet: "Quen Biết",
  doi_thu: "Đối Thủ",
  bang_huu: "Bằng Hữu",
  hiem_khich: "Hiềm Khích",
  ke_thu: "Kẻ Thù",
  tu_thu: "Tử Thù",
  tri_ky: "Tri Kỷ",
  ket_nghia: "Huynh Đệ Kết Nghĩa",
  dao_lu: "Đạo Lữ",
  su_phu: "Sư Phụ",
  phan_boi: "Kẻ Phản Bội",
};
var NM_THUTU = [
  "dao_lu",
  "ket_nghia",
  "tri_ky",
  "bang_huu",
  "su_phu",
  "quen_biet",
  "doi_thu",
  "hiem_khich",
  "ke_thu",
  "tu_thu",
  "phan_boi",
];
var lhCard = (h, inner) =>
  '<div class="vk-card">' +
  (h ? "<h3>" + h + "</h3>" : "") +
  inner +
  "</div>";
var lhNote = (t) =>
  '<div class="vk-mu" style="font-size:12px;margin:4px 0">' +
  t +
  "</div>";
var ttTen = (id) => {
  try {
    const t = C().thanhTuu.get(id);
    return t ? t.ten : String(id);
  } catch (e) {
    return String(id);
  }
};
var ttGroup = (id) => {
  const k = String(id).split(".")[1] || "";
  return /^vo_nhai_uyen/.test(k)
    ? "Vô Nhai Uyên"
    : TT_NHOM[k] || "Khác";
};

// Điều kiện khóa: đúng như hàm kiểm tra của game (cần thành tựu nào, cần trải bao nhiêu kiếp).
function lhLock(meta, m) {
  const have = (meta.tienLo && meta.tienLo.thanhTuu) || [];
  const need = (m.can || []).filter((s) => !have.includes(s));
  if (need.length)
    return m.goi_y || "cần " + need.map(ttTen).join(", ");
  if (m.can_kiep && (Number(meta.kiep) || 0) < m.can_kiep)
    return m.goi_y || "cần trải " + m.can_kiep + " kiếp";
  return "";
}
function lhRows(meta) {
  const out = [];
  for (const m of C().moKhoa.values()) {
    const lo = m.nhom === "lo_phi",
      nac = m.nac || [];
    const tier = lo
      ? (meta.nextLifeGoods || []).includes(m.id)
        ? 1
        : 0
      : Number((meta.moKhoa || {})[m.id]) || 0;
    const nx = nac[tier];
    out.push({
      id: m.id,
      ten: m.ten,
      nhom: m.nhom,
      moTa: m.mo_ta,
      tier,
      max: lo ? 1 : nac.length,
      gia: nx ? Number(nx.gia) : undefined,
      moTaNac: nx ? nx.mo_ta : (nac[tier - 1] || {}).mo_ta || "",
      left: nac
        .slice(tier)
        .reduce((s, n) => s + (Number(n.gia) || 0), 0),
      khoa: nx ? lhLock(meta, m) : "",
    });
  }
  return out;
}

function tabLuanHoi() {
  const g = G(),
    meta = g && g.state && g.state.meta;
  if (!meta) {
    body.innerHTML = lhCard("", "Chưa thấy dữ liệu Luân Hồi của game.");
    return;
  }
  let rows;
  try {
    rows = lhRows(meta);
  } catch (e) {
    console.error(e);
    body.innerHTML = errBox(e);
    return;
  }
  const diem = Number(meta.diemLuanHoi) || 0,
    perm = rows.filter((r) => r.nhom !== "lo_phi");
  const leftAll = perm.reduce((s, r) => s + r.left, 0),
    nTT = ((meta.tienLo && meta.tienLo.thanhTuu) || []).length;
  let html = lhCard(
    "Điểm Luân Hồi",
    `<div class="vk-row"><span>Điểm Hiện Có</span><b>${num(diem, 0)}</b></div><div class="vk-row"><span>Số Kiếp Đã Trải</span><b>${num(Number(meta.kiep) || 0, 0)}</b></div><div class="vk-row"><span>Thành Tựu Đã Có</span><b>${nTT} / ${C().thanhTuu ? C().thanhTuu.size : "?"}</b></div><div class="vk-row"><span>Điểm Còn Cần Để Mở Hết Căn Cốt, Xuất Thân, Thiên Mệnh</span><b>${num(leftAll, 0)}</b></div>` +
      lhNote(
        "Bấm <b>Mua</b> dùng đúng hàm mua của bến Vong Xuyên trong game: điểm bị trừ thật và không hoàn lại. Món bị khóa vì thiếu thành tựu hay số kiếp sẽ ghi rõ lý do.",
      ),
  );
  for (const [nh, ten] of LH_NHOM) {
    const ls = rows.filter((r) => r.nhom === nh);
    if (!ls.length) continue;
    html += lhCard(
      esc(ten),
      ls
        .map((r) => {
          const st =
            r.gia === undefined
              ? nh === "lo_phi"
                ? '<span class="vk-ok">Đã mua cho kiếp tới</span>'
                : '<span class="vk-ok">Đã Đủ</span>'
              : r.khoa
                ? '<span class="vk-bad">🔒 ' + esc(r.khoa) + "</span>"
                : diem < r.gia
                  ? '<span class="vk-mu">Thiếu ' +
                    num(r.gia - diem, 0) +
                    " điểm</span>"
                  : '<span class="vk-ok">Mua Được</span>';
          const buy = r.gia !== undefined && !r.khoa && diem >= r.gia;
          return `<div style="padding:7px 0;border-bottom:1px dashed var(--line)"><div style="display:flex;justify-content:space-between;gap:8px"><b>${esc(r.ten)}</b><span class="vk-mu">Bậc ${r.tier}/${r.max}</span></div><div class="vk-mu" style="font-size:12px">${esc(r.moTaNac || r.moTa || "")}</div><div style="display:flex;justify-content:space-between;align-items:center;gap:8px;font-size:13px;margin-top:3px"><span>${r.gia !== undefined ? "Giá <b>" + num(r.gia, 0) + "</b> điểm · " : ""}${st}</span>${buy ? `<button class="vk-btn sec lh-buy" data-id="${esc(r.id)}">Mua</button>` : ""}</div></div>`;
        })
        .join(""),
    );
  }
  body.innerHTML = html;
  body.querySelectorAll(".lh-buy").forEach((b) => {
    b.onclick = () => {
      const r = rows.find((x) => x.id === b.dataset.id);
      if (!r) return;
      if (
        !confirm(
          "Mua " +
            r.ten +
            " (bậc " +
            (r.tier + 1) +
            ") với " +
            r.gia +
            " điểm luân hồi? Không hoàn lại được.",
        )
      )
        return;
      let out;
      try {
        out = g.muaMoKhoa(r.id);
      } catch (e) {
        out = { loi: (e && e.message) || String(e) };
      }
      UI.notify(
        out && out.loi
          ? out.loi
          : (out && out.loiLaoDo) || "Đã mua " + r.ten,
      );
      render();
    };
  });
}

function tabThanhTuu() {
  const g = G(),
    meta = g && g.state && g.state.meta,
    cm = C().thanhTuu;
  if (!meta || !cm) {
    body.innerHTML = lhCard(
      "",
      "Chưa đọc được danh sách thành tựu của game.",
    );
    return;
  }
  const earned = new Set((meta.tienLo && meta.tienLo.thanhTuu) || []),
    pending = new Set(),
    run = g.state.run;
  let note = "";
  if (run && !run.ketThuc) {
    if (S.core && S.core.tinhDiemKiep) {
      try {
        (
          (S.core.tinhDiemKiep(clone(run), clone(meta), C()) || {})
            .moi || []
        ).forEach((x) => pending.add(x));
      } catch (e) {
        note =
          "Không tính được thành tựu đang đạt ở kiếp này: " +
          esc((e && e.message) || e);
      }
    } else if (!S.core && !S.ttLoading) {
      S.ttLoading = true;
      loadCore(() => {})
        .then((k) => {
          S.core = S.core || k;
          S.ttLoading = false;
          if (S.tab === "lht") render();
        })
        .catch(() => {
          S.ttLoading = false;
        });
    }
  }
  const unlock = {};
  for (const m of C().moKhoa.values())
    for (const k of m.can || [])
      (unlock[k] = unlock[k] || []).push(m.ten);
  const all = [...cm.values()],
    f = S.ttF || "all";
  const sumE = all
      .filter((t) => earned.has(t.id))
      .reduce((s, t) => s + (Number(t.diem) || 0), 0),
    sumAll = all.reduce((s, t) => s + (Number(t.diem) || 0), 0);
  const sumP = all
    .filter((t) => !earned.has(t.id) && pending.has(t.id))
    .reduce((s, t) => s + (Number(t.diem) || 0), 0);
  const show = all.filter(
    (t) =>
      f === "all" ||
      (f === "todo" && !earned.has(t.id)) ||
      (f === "done" && earned.has(t.id)),
  );
  const groups = [];
  show.forEach((t) => {
    const k = ttGroup(t.id);
    let gr = groups.find((x) => x[0] === k);
    if (!gr) groups.push((gr = [k, []]));
    gr[1].push(t);
  });
  let html = lhCard(
    "Thành Tựu",
    `<div class="vk-row"><span>Đã Có</span><b>${all.filter((t) => earned.has(t.id)).length} / ${all.length} (${num(sumE, 0)} / ${num(sumAll, 0)} điểm)</b></div>` +
      (sumP
        ? `<div class="vk-row"><span>Đang Đạt Ở Kiếp Này, Chốt Khi Kiếp Kết Thúc</span><b class="vk-ok">+${num(sumP, 0)} điểm</b></div>`
        : "") +
      `<label style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin:6px 0;font-size:13px"><span>Hiện</span><select class="vk-sel" id="tt-f" style="width:170px"><option value="all" ${f === "all" ? "selected" : ""}>Tất Cả</option><option value="todo" ${f === "todo" ? "selected" : ""}>Chưa Có</option><option value="done" ${f === "done" ? "selected" : ""}>Đã Có</option></select></label>` +
      (note ? lhNote(note) : "") +
      lhNote(
        "Thành tựu được chốt và cộng điểm luân hồi khi một kiếp kết thúc. Dòng “Mở” cho biết thành tựu đó là điều kiện mở khóa mục nào ở bến Vong Xuyên.",
      ),
  );
  for (const [k, ls] of groups)
    html += lhCard(
      esc(k),
      ls
        .map((t) => {
          const mk = earned.has(t.id)
            ? '<span class="vk-ok">✔ Đã Có</span>'
            : pending.has(t.id)
              ? '<span class="vk-ok">⏳ Đang Đạt Ở Kiếp Này</span>'
              : '<span class="vk-mu">Chưa Có</span>';
          return `<div style="padding:6px 0;border-bottom:1px dashed var(--line)"><div style="display:flex;justify-content:space-between;gap:8px"><b>${esc(t.ten)}</b><span style="font-size:12px">${mk} · ${num(Number(t.diem) || 0, 0)} điểm</span></div><div class="vk-mu" style="font-size:12px">${esc(t.mo_ta || "")}${unlock[t.id] ? " · <b>Mở:</b> " + esc(unlock[t.id].join(", ")) : ""}</div></div>`;
        })
        .join(""),
    );
  body.innerHTML = html;
  const sel = body.querySelector("#tt-f");
  if (sel)
    sel.onchange = () => {
      S.ttF = sel.value;
      tabThanhTuu();
    };
}

function tabDuTinhDiem() {
  const g = G(),
    run = g.state.run,
    meta = g.state.meta,
    K = S.core;
  if (!K.tinhDiemKiep) {
    body.innerHTML = lhCard(
      "Dự Tính Điểm Luân Hồi",
      "Tool chưa nhận ra hàm tính điểm luân hồi của game (game vừa cập nhật). Hãy chụp màn hình này gửi Claude để sửa Tool.",
    );
    return;
  }
  if (run.ketThuc) {
    body.innerHTML = lhCard(
      "Dự Tính Điểm Luân Hồi",
      "Kiếp này đã kết thúc nên điểm đã được cộng vào Điểm Luân Hồi. Hãy vào kiếp mới rồi xem lại.",
    );
    return;
  }
  let r;
  try {
    r = K.tinhDiemKiep(clone(run), clone(meta), C());
  } catch (e) {
    console.error(e);
    body.innerHTML = errBox(e);
    return;
  }
  const diem = Number(meta.diemLuanHoi) || 0,
    after = diem + (Number(r.tong) || 0);
  const noPoint = run.difficulty === "oneLife";
  const newly = lhRows(meta).filter(
    (x) =>
      x.nhom !== "lo_phi" &&
      x.gia !== undefined &&
      !x.khoa &&
      x.gia > diem &&
      x.gia <= after,
  );
  body.innerHTML =
    lhCard(
      "Dự Tính Điểm Luân Hồi",
      lhNote(
        "Giả sử kiếp này kết thúc <b>ngay bây giờ</b> ở trạng thái hiện tại. Tool gọi đúng hàm tính điểm của game nên khớp cả hệ số Ngẫu Nhiên và Đạo Lộ.",
      ) +
        (noPoint
          ? lhNote(
              "<b>Đạo Lộ Tuyệt Mệnh</b> không nhận điểm luân hồi, chỉ nhận danh hiệu; số dưới đây chỉ để tham khảo.",
            )
          : "") +
        (r.dong || [])
          .map(
            (d) =>
              `<div class="vk-row"><span>${esc(d.ten)}</span><b>${(Number(d.diem) || 0) >= 0 ? "+" : ""}${num(Number(d.diem) || 0, 0)}</b></div>`,
          )
          .join("") +
        `<div class="vk-row"><span><b>Tổng Nhận Được</b></span><b class="vk-ok">+${num(Number(r.tong) || 0, 0)}</b></div><div class="vk-row"><span>Điểm Hiện Có → Sau Kiếp Này</span><b>${num(diem, 0)} → ${num(after, 0)}</b></div>`,
    ) +
    (newly.length
      ? lhCard(
          "Sẽ Mua Được Thêm",
          newly
            .map(
              (x) =>
                `<div class="vk-row"><span>${esc(x.ten)} <span class="vk-mu">bậc ${x.tier + 1}</span></span><b>${num(x.gia, 0)}</b></div>`,
            )
            .join(""),
        )
      : "");
}

function tabThienKieu() {
  const g = G(),
    run = g.state.run,
    K = S.core,
    tk = run.thienKieuBang,
    ds = (tk && tk.ds) || [];
  const profile = (e) => {
    if (e.id === "nguoi_choi") return "";
    const n = run.npc[e.id],
      d = n && C().npc.get(n.goc);
    if (!d) return "";
    return (
      `<div class="vk-mu" style="font-size:12px">${esc(d.goi || "")}${d.tinh ? " · " + esc(d.tinh) : ""}${d.muon ? "<br><b>Muốn:</b> " + esc(d.muon) : ""}</div>` +
      (d.bi_mat
        ? `<details><summary class="vk-mu" style="font-size:12px">Xem Bí Mật (Lộ Cốt Truyện)</summary><div style="font-size:12px">${esc(d.bi_mat)}</div></details>`
        : "")
    );
  };
  const rowHtml = (e, i) =>
    `<div style="padding:6px 0;border-bottom:1px dashed var(--line)"><div style="display:flex;justify-content:space-between;gap:8px"><span><b>${i + 1}.</b> <b ${e.id === "nguoi_choi" ? 'class="vk-ok"' : ""}>${esc(e.ten)}${e.id === "nguoi_choi" ? " (Bạn)" : ""}</b></span><span class="vk-mu">${esc(realmLabel(e.canhGioi, e.tieuCanhGioi))}</span></div>${profile(e)}</div>`;
  let live = null,
    liveErr = "";
  if (K.xepBang) {
    try {
      live = K.xepBang(ctx());
    } catch (e) {
      liveErr = String((e && e.message) || e);
    }
  }
  const me = (l) => (l || []).findIndex((x) => x.id === "nguoi_choi");
  let html = lhCard(
    "Thiên Kiêu Bảng",
    tk
      ? `<div class="vk-row"><span>Cập Nhật Lần Cuối (Năm)</span><b>${num(tk.nam, 0)}</b></div><div class="vk-row"><span>Kỳ Sau (Năm)</span><b>${num(tk.namKe, 0)} · còn ${num(Math.max(0, tk.namKe - run.nam), 0)} năm</b></div><div class="vk-row"><span>Vị Trí Của Bạn Trên Bảng</span><b>${me(ds) >= 0 ? "Hạng " + (me(ds) + 1) : "Chưa có tên"}</b></div>` +
          lhNote(
            "Đứng đầu bảng nhận thành tựu <b>Đứng Đầu Thiên Kiêu Bảng</b> (+30 điểm luân hồi). Bảng chỉ đổi mỗi kỳ cập nhật.",
          )
      : lhNote("Kiếp này chưa tới kỳ lập bảng đầu tiên."),
  );
  if (ds.length)
    html += lhCard("Bảng Hiện Tại", ds.map(rowHtml).join(""));
  if (live)
    html += lhCard(
      "Nếu Bảng Cập Nhật Ngay Bây Giờ",
      `<div class="vk-row"><span>Vị Trí Của Bạn</span><b>${me(live) >= 0 ? "Hạng " + (me(live) + 1) : "Chưa lọt bảng"}</b></div>` +
        live.map(rowHtml).join("") +
        lhNote(
          "Tool gọi đúng hàm xếp bảng của game (theo cảnh giới, tiểu cảnh giới; người chơi chỉ vào bảng khi đủ điều kiện của game).",
        ),
    );
  else if (liveErr)
    html += lhCard(
      "",
      lhNote("Không tính được bảng giả định: " + esc(liveErr)),
    );
  body.innerHTML = html;
}

function tabNhanMach() {
  const g = G(),
    run = g.state.run,
    f = S.nm || (S.nm = { r: "all", q: "" });
  const all = Object.entries(run.npc || {})
    .filter(([, n]) => n && !n.chuaGap)
    .map(([id, n]) => ({
      id,
      n,
      d: (() => {
        try {
          return C().npc.get(n.goc);
        } catch (e) {
          return null;
        }
      })(),
    }));
  const cnt = {};
  all.forEach((x) => {
    cnt[x.n.danhPhan] = (cnt[x.n.danhPhan] || 0) + 1;
  });
  const keys = Object.keys(cnt).sort(
    (a, b) =>
      (NM_THUTU.indexOf(a) < 0 ? 99 : NM_THUTU.indexOf(a)) -
      (NM_THUTU.indexOf(b) < 0 ? 99 : NM_THUTU.indexOf(b)),
  );
  const q = (f.q || "").trim().toLowerCase();
  const ls = all
    .filter(
      (x) =>
        (f.r === "all" || x.n.danhPhan === f.r) &&
        (!q || String(x.n.ten).toLowerCase().includes(q)),
    )
    .sort(
      (a, b) =>
        (NM_THUTU.indexOf(a.n.danhPhan) < 0
          ? 99
          : NM_THUTU.indexOf(a.n.danhPhan)) -
          (NM_THUTU.indexOf(b.n.danhPhan) < 0
            ? 99
            : NM_THUTU.indexOf(b.n.danhPhan)) ||
        (b.n.haoCam || 0) - (a.n.haoCam || 0),
    );
  const place = (n) => {
    try {
      const d = n.theLuc && G().env.world.diaDanh(n.theLuc);
      return d && d.ten ? d.ten : "";
    } catch (e) {
      return "";
    }
  };
  const gifts = (n) => {
    try {
      const gl = n.giftLike;
      if (
        Array.isArray(gl) &&
        gl.length &&
        gl.every((x) => typeof x === "string")
      )
        return gl
          .map((id) => {
            const it = C().items.get(id);
            return it ? it.ten : id;
          })
          .join(", ");
    } catch (e) {
      /* bỏ qua */
    }
    return "";
  };
  const rowHtml = (x) => {
    const n = x.n,
      gf = gifts(n),
      pl = place(n);
    return `<div style="padding:7px 0;border-bottom:1px dashed var(--line)"><div style="display:flex;justify-content:space-between;gap:8px"><b>${esc(n.ten)}${n.song === false ? ' <span class="vk-bad">(Đã Mất)</span>' : ""}</b><span class="vk-mu">${esc(NM_TEN[n.danhPhan] || n.danhPhan || "")}</span></div><div class="vk-mu" style="font-size:12px">${esc((x.d && x.d.goi) || "")} · ${esc(realmLabel(n.canhGioi, n.tieuCanhGioi))} · ${Math.max(0, Math.floor(run.nam - n.namSinh))} tuổi · Hảo cảm <b>${num(Number(n.haoCam) || 0, 0)}</b>${pl ? " · " + esc(pl) : ""}</div>${gf ? `<div class="vk-mu" style="font-size:12px"><b>Thích:</b> ${esc(gf)}</div>` : ""}</div>`;
  };
  body.innerHTML =
    lhCard(
      "Nhân Mạch",
      `<div class="vk-row"><span>Đã Gặp</span><b>${all.length} người (${all.filter((x) => x.n.song !== false).length} còn sống)</b></div>` +
        keys
          .map(
            (k) =>
              `<div class="vk-row"><span>${esc(NM_TEN[k] || k)}</span><b>${cnt[k]}</b></div>`,
          )
          .join("") +
        lhNote(
          "💡 <b>Lưu ý Tặng Quà:</b> Tặng đan dược tăng tu vi hoặc thọ nguyên cho NPC chịu hiệu ứng dược kháng (hệ số 0.75): mỗi viên cùng loại tặng kế tiếp chỉ nhận 75% công hiệu.",
        ) +
        `<label style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin:6px 0;font-size:13px"><span>Lọc Theo Quan Hệ</span><select class="vk-sel" id="nm-r" style="width:170px"><option value="all">Tất Cả</option>${keys.map((k) => `<option value="${esc(k)}" ${f.r === k ? "selected" : ""}>${esc(NM_TEN[k] || k)}</option>`).join("")}</select></label><label style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin:6px 0;font-size:13px"><span>Tìm Tên</span><input class="vk-sel" id="nm-q" type="text" value="${esc(f.q)}" style="width:170px"></label>`,
    ) +
    lhCard(
      "Danh Sách",
      (ls.slice(0, 200).map(rowHtml).join("") ||
        lhNote("Chưa có ai khớp.")) +
        (ls.length > 200
          ? lhNote("Chỉ hiện 200 người đầu, hãy lọc thêm.")
          : ""),
    );
  body.querySelector("#nm-r").onchange = (e) => {
    f.r = e.target.value;
    tabNhanMach();
  };
  body.querySelector("#nm-q").onchange = (e) => {
    f.q = e.target.value;
    tabNhanMach();
  };
}

// ── Auto Luân Hồi (nằm trong Auto Reroll): mua các mục mở khóa Luân Hồi đã chọn TRƯỚC khi dò tư chất, vì Linh Căn, Thiên Tư… đổi tỉ lệ ra tư chất.
function rrLhPlan(meta) {
  const cfg = AU.cfg.rr,
    ids = new Set(cfg.lhIds),
    lpNeed = cfg.lp ? (rrLoPhiInfo() || {}).tong || 0 : 0;
  const keep = Math.max(0, Number(cfg.lhKeep) || 0) + lpNeed;
  let diem = Number(meta.diemLuanHoi) || 0;
  const buys = [],
    stuck = [];
  for (const m of C().moKhoa.values()) {
    if (m.nhom === "lo_phi" || !ids.has(m.id)) continue;
    const nac = m.nac || [],
      lock = lhLock(meta, m);
    for (
      let t = Number((meta.moKhoa || {})[m.id]) || 0;
      t < nac.length;
      t++
    ) {
      if (lock) {
        stuck.push(m.ten + ": " + lock);
        break;
      }
      const gia = Number(nac[t].gia);
      if (diem - gia < keep) {
        stuck.push(
          m.ten +
            " bậc " +
            (t + 1) +
            ": cần " +
            gia +
            " điểm, mua xong sẽ dưới mức giữ lại",
        );
        break;
      }
      diem -= gia;
      buys.push(m.ten + " bậc " + (t + 1) + " (" + gia + ")");
    }
  }
  return { buys, stuck, left: diem, keep };
}
function rrBuyLuanHoi(g) {
  const res = { bought: [], skipped: [], spent: 0, err: "" };
  if (typeof g.muaMoKhoa !== "function") {
    res.err =
      "Tool chưa nhận ra hàm mua của bến Vong Xuyên (game vừa cập nhật).";
    return res;
  }
  const cfg = AU.cfg.rr,
    ids = new Set(cfg.lhIds),
    p0 = Number(g.state.meta.diemLuanHoi) || 0;
  const keep =
    Math.max(0, Number(cfg.lhKeep) || 0) +
    (cfg.lp ? (rrLoPhiInfo() || {}).tong || 0 : 0);
  for (const m of [...C().moKhoa.values()]) {
    if (m.nhom === "lo_phi" || !ids.has(m.id)) continue;
    for (let k = 0; k < 12; k++) {
      const meta = g.state.meta,
        r = lhRows(meta).find((x) => x.id === m.id);
      if (!r || r.gia === undefined) break;
      if (r.khoa) {
        res.skipped.push(r.ten + " (" + r.khoa + ")");
        break;
      }
      if ((Number(meta.diemLuanHoi) || 0) - r.gia < keep) {
        res.skipped.push(
          r.ten +
            " bậc " +
            (r.tier + 1) +
            " (cần " +
            r.gia +
            " điểm, sẽ dưới mức giữ lại)",
        );
        break;
      }
      let out;
      try {
        out = g.muaMoKhoa(r.id);
      } catch (e) {
        out = { loi: (e && e.message) || String(e) };
      }
      if (out && out.loi) {
        res.skipped.push(r.ten + " (" + out.loi + ")");
        break;
      }
      res.bought.push(r.ten + " bậc " + (r.tier + 1));
    }
  }
  res.spent = p0 - (Number(g.state.meta.diemLuanHoi) || 0);
  return res;
}
function rrLhPickHtml() {
  const g = G(),
    meta = g && g.state && g.state.meta,
    ids = new Set(AU.cfg.rr.lhIds);
  if (!meta) return "";
  try {
    return lhRows(meta)
      .filter((r) => r.nhom !== "lo_phi")
      .map(
        (r) =>
          `<label style="display:flex;gap:6px;align-items:flex-start;margin:3px 0;font-size:12px"><input type="checkbox" class="rr-lhi" value="${esc(r.id)}" ${ids.has(r.id) ? "checked" : ""} style="margin-top:2px"><span><b>${esc(r.ten)}</b> <span class="vk-mu">bậc ${r.tier}/${r.max}${r.gia !== undefined ? " · bậc kế " + num(r.gia, 0) + " điểm" : " · đã đủ"}${r.khoa ? " · 🔒 " + esc(r.khoa) : ""}</span></span></label>`,
      )
      .join("");
  } catch (e) {
    return "";
  }
}
function rrLhInfoText() {
  const g = G(),
    meta = g && g.state && g.state.meta;
  if (!meta) return "";
  try {
    const c = AU.cfg.rr;
    if (!c.lh || !c.lhIds.length)
      return (
        "Hiện có " +
        num(Number(meta.diemLuanHoi) || 0, 0) +
        " điểm luân hồi. Tích mục muốn mua ở danh sách trên."
      );
    const p = rrLhPlan(meta);
    return (
      "Kế hoạch: mua " +
      p.buys.length +
      " bậc" +
      (p.buys.length ? " (" + p.buys.join(", ") + ")" : "") +
      "; điểm còn lại " +
      num(p.left, 0) +
      " (giữ lại tối thiểu " +
      num(p.keep, 0) +
      ")" +
      (p.stuck.length ? ". Chưa mua được: " + p.stuck.join("; ") : "") +
      "."
    );
  } catch (e) {
    return "";
  }
}

// ── Module Quản Lý Save & Tránh Thiên Đạo (v7.9.0) ──
function cleanseThienDao() {
  try {
    const cleanMemory = {
      version: 1,
      played: 0,
      lastShown: null,
      lives: [],
    };
    try {
      localStorage.setItem(
        "tu-tien:thien-dao:v1",
        JSON.stringify(cleanMemory),
      );
    } catch (e) {}

    const g = G();
    if (g) {
      if (g.thienDao && g.thienDao.engine) {
        g.thienDao.engine.memory = cleanMemory;
        g.thienDao.engine.life = undefined;
        g.thienDao.engine.choices = 0;
        g.thienDao.engine.cancels = 0;
        g.thienDao.engine.tradeChain = undefined;
        g.thienDao.engine.transientAt = 0;
      }
      if (g.store && typeof g.store.setState === "function") {
        g.store.setState({
          thienDao: undefined,
          saveWarning: undefined,
          saveLock: undefined,
          error: undefined,
        });
      }
      if (typeof g.dismissThienDao === "function") g.dismissThienDao();
      if (typeof g.dismissSaveWarning === "function")
        g.dismissSaveWarning();
    }
    return true;
  } catch (err) {
    console.warn("[VKX] Lỗi cleanseThienDao:", err);
    return false;
  }
}

function rerollRunRng(run) {
  if (!run) return;
  run.rngKeys = {};
  run.rng = (Math.random() * 0x100000000) >>> 0;
  if (typeof run.seed === "string") {
    const parts = run.seed.split(":");
    run.seed = parts[0] + ":" + Math.floor(Math.random() * 100000);
  }
}

function doExportSave() {
  const g = G();
  if (!g || !g.state)
    return { ok: false, msg: "Chưa có dữ liệu trò chơi." };

  const kernelSave = (TT && TT.core && TT.core["kernel/save"]) || {};
  const meta = clone(g.state.meta);
  const run = g.state.run ? clone(g.state.run) : undefined;

  let saveStr = "";
  if (kernelSave && typeof kernelSave.packSave === "function") {
    try {
      saveStr = kernelSave.packSave(meta, run);
    } catch (e) {}
  }

  if (!saveStr && typeof g.exportSave === "function") {
    try {
      saveStr = g.exportSave();
    } catch (e) {}
  }

  if (!saveStr) {
    saveStr = JSON.stringify(
      {
        game: "tu-tien",
        version: 1,
        luuLuc: new Date().toISOString(),
        meta,
        run,
      },
      null,
      2,
    );
  }

  const nv = run && run.nhanVat;
  const name =
    nv && nv.ten
      ? nv.ten
          .replace(/[^\w\s\u00C0-\u1EF9]/gi, "")
          .trim()
          .replace(/\s+/g, "_")
      : "VoDanh";
  let cgLabel = "ChuaVaoKiep";
  if (nv) {
    cgLabel = realmLabel(nv.canhGioi, nv.tieuCanhGioi || 0)
      .replace(/[^\w\s\u00C0-\u1EF9]/gi, "")
      .trim()
      .replace(/\s+/g, "_");
  }
  const year = run ? (run.nam || 0) + "Nam" : "Meta";
  const now = new Date();
  const dateStr =
    now.getFullYear() +
    String(now.getMonth() + 1).padStart(2, "0") +
    String(now.getDate()).padStart(2, "0") +
    "_" +
    String(now.getHours()).padStart(2, "0") +
    String(now.getMinutes()).padStart(2, "0");

  const fileName = `VanKiep_${name}_${cgLabel}_${year}_${dateStr}.txt`;

  return {
    ok: true,
    data: saveStr,
    fileName,
    name: (nv && nv.ten) || "Vô Danh",
    realm: nv
      ? realmLabel(nv.canhGioi, nv.tieuCanhGioi || 0)
      : "Ngoài Kiếp",
    year: run ? run.nam : 0,
    meta,
    run,
  };
}

function doImportSave(saveText, options = {}) {
  const g = G();
  if (!g) return { ok: false, msg: "Không tìm thấy giao diện game." };

  const kernelSave = (TT && TT.core && TT.core["kernel/save"]) || {};
  let unpacked = null;

  if (typeof kernelSave.unpackSave === "function") {
    try {
      unpacked = kernelSave.unpackSave(saveText.trim());
    } catch (e) {}
  }

  if (!unpacked) {
    try {
      const raw = JSON.parse(saveText.trim());
      if (raw && (raw.game === "tu-tien" || raw.meta)) {
        unpacked = {
          meta: raw.meta || raw,
          run: raw.run,
        };
      }
    } catch (e) {}
  }

  if (!unpacked || !unpacked.meta) {
    return {
      ok: false,
      msg: "Tệp lưu không hợp lệ hoặc bị hỏng định dạng Vạn Kiếp Tu Tiên.",
    };
  }

  const meta = unpacked.meta;
  let run = unpacked.run;

  if (g.state && g.state.meta && g.state.meta.settings) {
    meta.settings = meta.settings || g.state.meta.settings;
  }
  if (g.env && g.env.world && g.env.world.id) {
    meta.banDo = g.env.world.id;
  }

  if (options.rerollRng && run) {
    rerollRunRng(run);
  }

  if (run && typeof g.prepareRun === "function") {
    try {
      run = g.prepareRun(run, true) || run;
    } catch (e) {}
  }

  try {
    if (typeof kernelSave.saveMeta === "function") {
      kernelSave.saveMeta(g.storage || localStorage, meta);
    } else {
      localStorage.setItem("tu-tien:meta", JSON.stringify(meta));
    }

    if (run) {
      if (typeof kernelSave.saveRun === "function") {
        kernelSave.saveRun(g.storage || localStorage, run);
      } else {
        localStorage.setItem("tu-tien:run", JSON.stringify(run));
      }
    }
  } catch (err) {
    console.error("Lỗi khi ghi save vào storage:", err);
  }

  if (g.store && typeof g.store.setState === "function") {
    g.store.setState({
      run: run,
      meta: meta,
      summary: undefined,
      error: undefined,
      saveWarning: undefined,
      thienDao: undefined,
      saveLock: undefined,
    });
  }

  if (options.cleanThienDao !== false) {
    cleanseThienDao();
  }

  if (g.thienDao && typeof g.thienDao.enter === "function" && run) {
    try {
      g.thienDao.enter(run);
    } catch (e) {}
  }

  try {
    if (typeof render === "function") render();
  } catch (e) {}

  return {
    ok: true,
    msg: "Đã nạp file save thành công! Đã thanh tẩy sạch sẽ mọi dấu vết Thiên Đạo.",
  };
}

function getQuickSaves() {
  try {
    const s = localStorage.getItem("vkx_quick_saves");
    return s ? JSON.parse(s) : [];
  } catch (e) {
    return [];
  }
}

function saveQuickSave(note = "") {
  const exp = doExportSave();
  if (!exp.ok) return exp;
  const list = getQuickSaves();
  let pName = "Bến Vong Xuyên";
  try {
    const c = ctxLite();
    if (c && exp.run && exp.run.viTri != null) {
      pName = placeName(c, exp.run.viTri);
    }
  } catch (e) {}

  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")} ${String(now.getDate()).padStart(2, "0")}/${String(now.getMonth() + 1).padStart(2, "0")}`;

  const entry = {
    id: Date.now(),
    time: timeStr,
    name: exp.name || "Vô Danh",
    realm: exp.realm || "Phàm Nhân",
    year: exp.run ? exp.run.nam : 0,
    pName,
    note:
      note.trim() ||
      `Lưu tại ${pName} (Năm ${exp.run ? exp.run.nam : 0})`,
    data: exp.data,
  };

  list.unshift(entry);
  while (list.length > 15) list.pop();
  try {
    localStorage.setItem("vkx_quick_saves", JSON.stringify(list));
  } catch (e) {
    while (list.length > 5) list.pop();
    try {
      localStorage.setItem("vkx_quick_saves", JSON.stringify(list));
    } catch (e2) {}
  }
  return { ok: true, msg: "Đã lưu bản Quick Save thành công!" };
}

function deleteQuickSave(id) {
  const list = getQuickSaves().filter((x) => x.id !== id);
  localStorage.setItem("vkx_quick_saves", JSON.stringify(list));
}

function downloadSaveFile(data, fileName) {
  const blob = new Blob([data], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
}

function copySaveToClipboard(data) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(data);
  } else {
    const ta = document.createElement("textarea");
    ta.value = data;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
    return Promise.resolve();
  }
}

function tabLuuNapSave() {
  const g = G(),
    st = g ? g.state : null,
    run = st ? st.run : null,
    nv = run ? run.nhanVat : null,
    meta = st ? st.meta : null;

  let statusHtml = "";
  if (run && nv) {
    const isOneLife = !!(
      g.oneLifeActive ||
      (run &&
        run.difficulty &&
        typeof run.difficulty === "string" &&
        (run.difficulty === "oneLife" ||
          run.difficulty.includes("tuyet_menh") ||
          run.difficulty.includes("oneLife")))
    );
    const diffMode = (run && run.difficulty) || "normal";
    const oneLifeBadge = isOneLife
      ? `<span style="background:rgba(239,68,68,0.2);color:#f87171;border:1px solid rgba(239,68,68,0.45);border-radius:999px;padding:2px 8px;font-size:11px;font-weight:700">☠️ Tuyệt Mệnh (1 Mạng · Trần Đan 2/Cảnh Giới)</span>`
      : diffMode === "hardcore"
        ? `<span style="background:rgba(245,158,11,0.2);color:#fbbf24;border:1px solid rgba(245,158,11,0.45);border-radius:999px;padding:2px 8px;font-size:11px;font-weight:700">🔥 Nghịch Thiên (Trần Đan 3/Cảnh Giới)</span>`
        : diffMode === "easy"
          ? `<span style="background:rgba(59,130,246,0.18);color:#60a5fa;border:1px solid rgba(59,130,246,0.4);border-radius:999px;padding:2px 8px;font-size:11px;font-weight:700">🌱 Thuận Thiên</span>`
          : `<span style="background:rgba(61,220,151,0.18);color:#3ddc97;border:1px solid rgba(61,220,151,0.4);border-radius:999px;padding:2px 8px;font-size:11px;font-weight:700">⚖️ Trung Đạo (Bình Thường)</span>`;

    let pName = "Vị trí không rõ";
    try {
      const c = ctxLite();
      if (c && run.viTri != null) pName = placeName(c, run.viTri);
    } catch (e) {}

    statusHtml = `
      <div class="vk-row"><span>Nhân Vật</span><b>${esc(nv.ten)}</b></div>
      <div class="vk-row"><span>Cảnh Giới</span><b>${esc(realmLabel(nv.canhGioi, nv.tieuCanhGioi || 0))}</b></div>
      <div class="vk-row"><span>Tuổi / Năm</span><b>Tuổi ${Math.floor(nv.tuoi || 0)} · Năm ${run.nam || 0}</b></div>
      <div class="vk-row"><span>Nơi Chốn</span><b>${esc(pName)} (Slot ${run.viTri})</b></div>
      <div class="vk-row"><span>Chế Độ Chơi</span><b>${oneLifeBadge}</b></div>
    `;
  } else {
    statusHtml = `
      <div style="font-size:13px;color:var(--mut);padding:6px 0">
        Hiện tại bạn đang ở ngoài màn hình chính hoặc Bến Vong Xuyên (chưa vào kiếp). Bạn có thể <b>Nạp File Save</b> bên dưới để vào lại kiếp chơi ngay lập tức.
      </div>
    `;
  }

  const qSaves = getQuickSaves();
  let qSavesHtml = "";
  if (qSaves.length === 0) {
    qSavesHtml = `<div class="vk-mu" style="font-size:12.5px;text-align:center;padding:12px 0">Chưa có bản Lưu Nhanh nào. Bấm <b>⚡ Lưu Nhanh (Quick Save)</b> ở trên để tạo một bản dự phòng tức thì.</div>`;
  } else {
    qSavesHtml = qSaves
      .map(
        (q) => `
      <div style="background:var(--bg3);border:1px solid var(--line);border-radius:12px;padding:9px 12px;margin-bottom:8px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;flex-wrap:wrap;gap:4px">
          <span style="font-weight:700;color:var(--acc);font-size:13px">🕒 ${esc(q.time)}</span>
          <span style="font-size:11.5px;color:var(--acc2);font-weight:600">${esc(q.realm)} · Năm ${q.year}</span>
        </div>
        <div style="font-size:12px;color:var(--txt);margin-bottom:6px">
          <b>${esc(q.name)}</b> tại <b>${esc(q.pName)}</b> — <span class="vk-mu">${esc(q.note)}</span>
        </div>
        <div style="display:flex;gap:6px;flex-wrap:wrap">
          <button class="vk-btn sv-btn-restore-qs" data-id="${q.id}" style="padding:4px 10px;font-size:11.5px;background:#3ddc97;color:#05140d">⚡ Khôi Phục</button>
          <button class="vk-btn sec sv-btn-dl-qs" data-id="${q.id}" style="padding:4px 8px;font-size:11.5px">💾 Tải Về</button>
          <button class="vk-btn sec sv-btn-copy-qs" data-id="${q.id}" style="padding:4px 8px;font-size:11.5px">📋 Copy</button>
          <button class="vk-btn sec sv-btn-del-qs" data-id="${q.id}" style="padding:4px 8px;font-size:11.5px;color:var(--bad)">🗑️ Xóa</button>
        </div>
      </div>
    `,
      )
      .join("");
  }

  body.innerHTML = `
    <div class="vk-card">
      <h3>⚡ Nghịch Thiên Cải Mệnh · Lưu & Nạp Save Tránh Thiên Đạo</h3>
      <div style="font-size:12.5px;color:var(--mut);line-height:1.5;margin-bottom:10px">
        Sao lưu và khôi phục tiến trình an toàn tuyệt đối: Lưu ra file về máy hoặc tạo điểm snapshot nhanh, <b>hoàn toàn miễn nhiễm với Thiên Đạo</b> (xóa sạch bộ nhớ reload, chống “bước đúng dấu chân cũ”, gỡ bỏ cờ cảnh báo sổ mệnh, giải cứu cả kiếp Tuyệt Mệnh).
      </div>
      ${statusHtml}
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px">
        <button class="vk-btn" id="sv-btn-quicksave" style="background:#3ddc97;color:#05140d">⚡ Lưu Nhanh (Quick Save)</button>
        <button class="vk-btn" id="sv-btn-export" style="background:#8b5cf6;color:#fff">💾 Xuất File Save (.txt)</button>
        <button class="vk-btn sec" id="sv-btn-copy">📋 Copy Mã Save</button>
        <button class="vk-btn sec" id="sv-btn-clean-td" title="Xóa toàn bộ bộ nhớ Thiên Đạo theo dõi reload">🧹 Thanh Tẩy Thiên Đạo</button>
      </div>
    </div>

    <div class="vk-card">
      <h3>📥 Nạp File Save Vào Game (Tránh Thiên Đạo)</h3>
      <div style="font-size:12.5px;color:var(--mut);margin-bottom:8px">
        Chọn tệp save (.txt / .json) từ máy tính hoặc dán trực tiếp mã lưu vào khung:
      </div>
      <div style="margin-bottom:8px">
        <input type="file" id="sv-file-input" accept=".txt,.json" style="font-size:12.5px;color:var(--txt)">
      </div>
      <textarea id="sv-text-input" placeholder="Dán mã lưu (#tuTien:... hoặc JSON) tại đây..." style="width:100%;height:70px;box-sizing:border-box;font-size:12px;font-family:monospace;margin-bottom:8px"></textarea>

      <div style="background:var(--bg3);border:1px solid var(--line);border-radius:10px;padding:8px 12px;margin-bottom:10px">
        <div style="font-weight:700;font-size:12.5px;color:var(--acc2);margin-bottom:6px">🛡️ Cơ Chế Tránh Thiên Đạo Khi Nạp:</div>
        <label style="display:flex;align-items:center;gap:8px;font-size:12.5px;cursor:pointer;margin-bottom:4px">
          <input type="checkbox" id="sv-opt-cleantd" checked>
          <span><b>Thanh tẩy bộ nhớ Thiên Đạo:</b> Xóa sạch lịch sử theo dõi reload/lặp lại để không bị Thiên Đạo chế giễu</span>
        </label>
        <label style="display:flex;align-items:center;gap:8px;font-size:12.5px;cursor:pointer">
          <input type="checkbox" id="sv-opt-reroll">
          <span><b>Tẩy Thiên Cơ (Đổi Vận Rủi RNG):</b> Làm mới xúc xắc may rủi để Đột Phá / Luyện Chế sau khi nạp không bị lặp lại thất bại cũ</span>
        </label>
      </div>

      <button class="vk-btn" id="sv-btn-import" style="background:#ff3366;color:#fff;font-weight:bold;width:100%;padding:10px 14px">
        ⚡ Nạp Save Ngay Vào Game (Tránh Thiên Đạo)
      </button>
    </div>

    <div class="vk-card">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
        <h3 style="margin:0">🕒 Danh Sách Bản Lưu Nhanh (${qSaves.length}/15)</h3>
        ${qSaves.length > 0 ? `<button class="vk-btn sec" id="sv-btn-clear-all-qs" style="padding:2px 8px;font-size:11px;color:var(--bad)">Xóa Tất Cả</button>` : ""}
      </div>
      ${qSavesHtml}
    </div>

    <div class="vk-card">
      <details>
        <summary><b>❓ Cơ chế Tránh Thiên Đạo hoạt động thế nào?</b></summary>
        <div style="font-size:12.5px;color:var(--mut);line-height:1.6;margin-top:8px">
          <div>• <b>Thiên Đạo trong game:</b> Game lưu một sổ ghi chép ngầm trong <code>tu-tien:thien-dao:v1</code>. Khi bạn nạp lại save hoặc reload trang để làm lại một sự kiện (Đột Phá, Luyện Chế, Mua Bán) từ 5 lần trở lên, Thiên Đạo sẽ xuất hiện bắt bớ: <i>“Ngươi quay ngược thời gian, nhưng lại bước đúng dấu chân cũ.”</i> hoặc <i>“Sổ mệnh có nét bút lạ…”</i>.</div>
          <div>• <b>Vì sao bình thường reload vẫn xịt:</b> Game cố tình khóa kết quả tất định trong <code>rngKeys</code> theo cảnh giới. Nếu lần đầu thất bại, bạn có nạp lại 100 lần thì kết quả vẫn là thất bại.</div>
          <div>• <b>Tool giải quyết thế nào:</b></div>
          <div style="padding-left:10px">
            1. <b>Tẩy sạch bộ nhớ Thiên Đạo:</b> Xóa sạch số lần lặp lại, biến kiếp chơi trở về trạng thái trong sạch tuyệt đối.<br>
            2. <b>Tẩy Thiên Cơ:</b> Tự động xóa các khóa RNG thất bại cũ và cấp seed may rủi mới, giúp bạn gieo lại quẻ mới khi đột phá.<br>
            3. <b>Bảo toàn Tuyệt Mệnh:</b> Chế độ Tuyệt Mệnh vốn bị game cấm xuất/nạp save; Tool mở khóa hoàn toàn để bạn giữ gìn tiến trình yêu thích.
          </div>
        </div>
      </details>
    </div>
  `;

  const btnQs = body.querySelector("#sv-btn-quicksave");
  if (btnQs) {
    btnQs.onclick = () => {
      const note = prompt(
        "Nhập ghi chú cho bản lưu nhanh (hoặc để trống):",
        "",
      );
      if (note === null) return;
      const res = saveQuickSave(note);
      if (res.ok) {
        try {
          UI.notify(res.msg);
        } catch (e) {}
        tabLuuNapSave();
      } else {
        alert("⚠️ " + res.msg);
      }
    };
  }

  const btnExp = body.querySelector("#sv-btn-export");
  if (btnExp) {
    btnExp.onclick = () => {
      const exp = doExportSave();
      if (exp.ok) {
        downloadSaveFile(exp.data, exp.fileName);
        try {
          UI.notify("💾 Đã tải tệp save: " + exp.fileName);
        } catch (e) {}
      } else {
        alert("⚠️ " + exp.msg);
      }
    };
  }

  const btnCopy = body.querySelector("#sv-btn-copy");
  if (btnCopy) {
    btnCopy.onclick = () => {
      const exp = doExportSave();
      if (exp.ok) {
        copySaveToClipboard(exp.data).then(() => {
          try {
            UI.notify("📋 Đã chép mã save vào Clipboard!");
          } catch (e) {}
        });
      } else {
        alert("⚠️ " + exp.msg);
      }
    };
  }

  const btnCleanTd = body.querySelector("#sv-btn-clean-td");
  if (btnCleanTd) {
    btnCleanTd.onclick = () => {
      cleanseThienDao();
      try {
        UI.notify("🧹 Đã thanh tẩy sạch sẽ mọi dấu vết Thiên Đạo!");
      } catch (e) {}
      alert(
        "🧹 Đã thanh tẩy thành công toàn bộ dữ liệu theo dõi của Thiên Đạo!",
      );
    };
  }

  const fileInp = body.querySelector("#sv-file-input");
  const txtInp = body.querySelector("#sv-text-input");
  if (fileInp && txtInp) {
    fileInp.onchange = (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (evt) => {
        txtInp.value = evt.target.result;
        try {
          UI.notify(
            `📥 Đã nạp nội dung từ tệp "${file.name}" (${file.size} bytes)`,
          );
        } catch (err) {}
      };
      reader.readAsText(file);
    };
  }

  const btnImport = body.querySelector("#sv-btn-import");
  if (btnImport && txtInp) {
    btnImport.onclick = () => {
      const val = txtInp.value.trim();
      if (!val) {
        alert(
          "⚠️ Vui lòng chọn tệp save hoặc dán mã lưu vào ô văn bản!",
        );
        return;
      }
      const cleanTd = body.querySelector("#sv-opt-cleantd")
        ? body.querySelector("#sv-opt-cleantd").checked
        : true;
      const reroll = body.querySelector("#sv-opt-reroll")
        ? body.querySelector("#sv-opt-reroll").checked
        : false;

      if (
        !confirm(
          "Xác nhận nạp file save này vào game? Tiến trình hiện tại sẽ được thay thế bằng bản lưu mới.",
        )
      ) {
        return;
      }

      btnImport.disabled = true;
      btnImport.textContent = "⏳ Đang nạp và thanh tẩy Thiên Đạo...";

      setTimeout(() => {
        const res = doImportSave(val, {
          cleanThienDao: cleanTd,
          rerollRng: reroll,
        });
        btnImport.disabled = false;
        btnImport.textContent =
          "⚡ Nạp Save Ngay Vào Game (Tránh Thiên Đạo)";
        if (res.ok) {
          try {
            UI.notify(res.msg);
          } catch (e) {}
          alert("🎉 " + res.msg);
          tabLuuNapSave();
        } else {
          alert("⚠️ " + res.msg);
        }
      }, 50);
    };
  }

  // Quick save action buttons
  body.querySelectorAll(".sv-btn-restore-qs").forEach((b) => {
    b.onclick = () => {
      const id = Number(b.dataset.id);
      const q = getQuickSaves().find((x) => x.id === id);
      if (!q || !q.data) return;
      const cleanTd = body.querySelector("#sv-opt-cleantd")
        ? body.querySelector("#sv-opt-cleantd").checked
        : true;
      const reroll = body.querySelector("#sv-opt-reroll")
        ? body.querySelector("#sv-opt-reroll").checked
        : false;

      if (
        !confirm(
          `Khôi phục về bản Lưu Nhanh lúc ${q.time} (${q.name} - ${q.realm})?`,
        )
      )
        return;
      const res = doImportSave(q.data, {
        cleanThienDao: cleanTd,
        rerollRng: reroll,
      });
      if (res.ok) {
        try {
          UI.notify(res.msg);
        } catch (e) {}
        alert("🎉 " + res.msg);
        tabLuuNapSave();
      } else {
        alert("⚠️ " + res.msg);
      }
    };
  });

  body.querySelectorAll(".sv-btn-dl-qs").forEach((b) => {
    b.onclick = () => {
      const id = Number(b.dataset.id);
      const q = getQuickSaves().find((x) => x.id === id);
      if (!q || !q.data) return;
      downloadSaveFile(
        q.data,
        `VanKiep_QuickSave_${q.name}_${q.realm}_Nam${q.year}.txt`,
      );
      try {
        UI.notify("💾 Đã tải bản lưu nhanh!");
      } catch (e) {}
    };
  });

  body.querySelectorAll(".sv-btn-copy-qs").forEach((b) => {
    b.onclick = () => {
      const id = Number(b.dataset.id);
      const q = getQuickSaves().find((x) => x.id === id);
      if (!q || !q.data) return;
      copySaveToClipboard(q.data).then(() => {
        try {
          UI.notify("📋 Đã chép mã bản lưu nhanh!");
        } catch (e) {}
      });
    };
  });

  body.querySelectorAll(".sv-btn-del-qs").forEach((b) => {
    b.onclick = () => {
      const id = Number(b.dataset.id);
      if (!confirm("Xóa bản lưu nhanh này?")) return;
      deleteQuickSave(id);
      tabLuuNapSave();
    };
  });

  const btnClearAllQs = body.querySelector("#sv-btn-clear-all-qs");
  if (btnClearAllQs) {
    btnClearAllQs.onclick = () => {
      if (
        !confirm("Bạn có chắc muốn xóa TẤT CẢ các bản Lưu Nhanh không?")
      )
        return;
      localStorage.removeItem("vkx_quick_saves");
      tabLuuNapSave();
    };
  }
}

// Xuất giao diện điều khiển Assist cho Mod Entrypoint
const Assist = {
  render: () => render(),
  stop: () => {
    if (!kmAutoRunning()) S.abort = true;
  },
};
