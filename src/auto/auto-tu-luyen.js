/**
 * Module: Auto Săn Yêu & Auto Tu Luyện / Đột Phá Toàn Năng
 */
// ═════════ AUTO SĂN YÊU ═════════
// Tìm đan dược chữa thương trong túi đồ
function findHealItem(nv) {
  if (!nv || !nv.tuiDo || !(nv.thuongThe > 0)) return null;
  let Cc = null;
  try {
    Cc = C();
  } catch (e) {}
  const itemsMap = Cc && Cc.items;
  if (!itemsMap) return null;
  let best = null;
  for (const [id, count] of Object.entries(nv.tuiDo)) {
    if (!count || count <= 0) continue;
    const it = itemsMap.get(id);
    if (!it || !Array.isArray(it.dung)) continue;
    // kiểm tra xem có gây thêm thương thế không (ví dụ đan bạo phát)
    const hasPenalty = it.dung.some(
      (d) => typeof d.thuong_the === "number" && d.thuong_the > 0,
    );
    if (hasPenalty) continue;
    let healAmount = 0;
    for (const d of it.dung) {
      if (typeof d.heal === "number") healAmount += d.heal;
    }
    if (healAmount > 0) {
      if (
        !best ||
        (healAmount >= nv.thuongThe && best.heal < nv.thuongThe) ||
        (healAmount < best.heal && healAmount >= nv.thuongThe) ||
        (best.heal < nv.thuongThe && healAmount > best.heal)
      ) {
        best = { id, ten: it.ten || id, heal: healAmount, count };
      }
    }
  }
  return best;
}

// Nơi này có màu nằm trong danh sách được tích không (không đọc được màu thì coi là không được).
function auSanSpotOK(c, slot, cfg) {
  const d = danger(c, slot);
  return !!d && auColorOK(d.id, cfg.mau);
}
function auHuntSpots(c, cfg, st) {
  const run = c.run,
    nv = run.nhanVat,
    out = [];
  const isChiDauDan = cfg && cfg.sanMucTieu === "chi_dau_dan";
  const prioCapNen = cfg && cfg.uuTienCapNen !== false;
  const nvCg = nv ? nv.canhGioi || 0 : 0;

  for (const x of nearSlots(c, cfg.maxY)) {
    if (!auIsWild(c, x.slot) || (st && st.bad.has(x.slot))) continue;
    const left = auHuntLeft(run, x.slot);
    if (left < (isChiDauDan ? 1.5 : 1)) continue;
    if (!auSanSpotOK(c, x.slot, cfg)) continue;

    let capNen = 0;
    try {
      if (c.world && typeof c.world.info === "function") {
        const inf = c.world.info(x.slot);
        capNen = inf && inf.capNen != null ? inf.capNen : 0;
      }
    } catch (e) {}

    out.push({
      slot: x.slot,
      y: x.y,
      left,
      d: danger(c, x.slot),
      capNen,
    });
  }

  // Chấm điểm bãi săn thông minh:
  // 1. Độ an toàn: Màu an toàn hơn ưu tiên trước (an_toan: 0, ngang_suc: 1, hiem: 2, tu_dia: 3)
  // 2. Chênh lệch cảnh giới: bãi sát cảnh giới nhân vật nhận nhiều tu vi hơn
  // 3. Khoảng cách: di chuyển gần đỡ tốn thọ nguyên
  // 4. Lượt săn: bãi còn nhiều lượt săn
  return out.sort((a, b) => {
    const dangerA = AU_HIEM[a.d.id] ?? 3;
    const dangerB = AU_HIEM[b.d.id] ?? 3;
    if (dangerA !== dangerB) return dangerA - dangerB;

    if (prioCapNen) {
      const diffA = Math.abs(a.capNen - nvCg);
      const diffB = Math.abs(b.capNen - nvCg);
      const scoreA =
        diffA * 3 + a.y * 2 - Math.min(3, Math.floor(a.left)) * 1.2;
      const scoreB =
        diffB * 3 + b.y * 2 - Math.min(3, Math.floor(b.left)) * 1.2;
      return scoreA - scoreB || a.y - b.y;
    }

    return Math.floor(b.left) - Math.floor(a.left) || a.y - b.y;
  });
}
// Helper kiểm tra xem sự kiện có phải biến cố quấy nhiễu ngẫu nhiên (không phải đích đến trên bản đồ)
function isBienCoEnc(encId) {
  if (!encId) return false;
  if (
    /^ev\.(tam_ma_|bq_|bc_|lq_|at_|dc_|tho_nguyen|truy_na|the_cuc|an_tinh)/i.test(
      encId,
    )
  )
    return true;
  try {
    const Cc = C();
    const encDef = Cc && Cc.encounters && Cc.encounters.get(encId);
    if (
      encDef &&
      (encDef.bien_co ||
        encDef.loai === "bien_co" ||
        (encDef.tags &&
          encDef.tags.noi &&
          encDef.tags.noi.includes("bien_co")))
    )
      return true;
  } catch (e) {}
  return false;
}

// Tìm các sự kiện / địa danh / node có thể tăng tu vi xung quanh
function auFindTuViSpots(c, cfg, st) {
  const g = G(),
    run = c.run,
    nam = typeof run.nam === "number" ? run.nam : null;
  const out = [];
  const seenEncs = new Set();
  const maxY = cfg.maxY || 3;

  // 0. Ưu tiên kiểm tra Song Tu cùng Đạo Lữ (Hồi chiêu 5 năm · Lượng tu vi cực lớn +5% tiểu cảnh giới)
  if (cfg.autoSongTu !== false && run.npc) {
    for (const [npcId, npc] of Object.entries(run.npc)) {
      if (!npc || !npc.song || npc.danhPhan !== "dao_lu") continue;
      const blocked =
        TT.core && typeof TT.core.dualBlock === "function"
          ? TT.core.dualBlock(c, npcId)
          : run.nhanVat &&
              run.nhanVat.dualYear != null &&
              run.nam - run.nhanVat.dualYear < 5
            ? "chưa hồi chiêu"
            : undefined;
      if (blocked === undefined) {
        const estGain =
          TT.core && typeof TT.core.dualGain === "function"
            ? TT.core.dualGain(c)
            : 5.0;
        out.push({
          slot: run.viTri,
          y: 0,
          encId: "ev.song_tu",
          npcId: npcId,
          tv: estGain,
          ten: "Song Tu cùng " + (npc.ten || "Đạo Lữ"),
          source: "song_tu",
          d: null,
        });
        break;
      }
    }
  }

  // 1. Lấy danh sách các ô có thể đi tới trong bán kính maxY năm
  const reachable = new Map();
  const curSlotKey = run.viTri != null ? String(run.viTri) : null;
  if (curSlotKey != null) reachable.set(curSlotKey, 0);
  for (const ns of nearSlots(c, maxY)) {
    reachable.set(String(ns.slot), ns.y);
  }

  const director = TT.core && TT.core["encounter/director"];

  // 2. Quét từ director.placeActivities cho tất cả các ô có thể tới (chỉ lấy kỳ ngộ/bí cảnh thực sự, bỏ tiện ích thành trấn)
  if (director && typeof director.placeActivities === "function") {
    for (const [slotStr, y] of reachable.entries()) {
      if (st && st.bad && (st.bad.has(slotStr) || st.bad.has(+slotStr)))
        continue;
      const d = danger(c, slotStr);
      if (d && !auColorOK(d.id, cfg.mau)) continue;

      try {
        const acts = director.placeActivities(c, slotStr);
        if (Array.isArray(acts)) {
          for (const a of acts) {
            if (!a || !a.id || a.lockedReason) continue;
            if (isLoTuViEnc(a.id, a) || isBienCoEnc(a.id)) continue;
            const encKey = a.id + "@" + slotStr;
            if (seenEncs.has(encKey)) continue;
            if (
              st &&
              st.skipEnc &&
              (st.skipEnc.has(a.id) || st.skipEnc.has(encKey))
            )
              continue;
            if (
              st &&
              st.encAttempts &&
              (st.encAttempts[encKey] || 0) >= 3
            )
              continue;

            const tv = encGivesTuVi(a.id);
            if (tv < 1.0) continue;

            seenEncs.add(encKey);
            out.push({
              slot: /^\d+$/.test(slotStr) ? +slotStr : slotStr,
              y,
              encId: a.id,
              tv,
              ten: a.ten || a.id,
              source: "activity",
              d,
            });
          }
        }
      } catch (e) {}
    }
  }

  // 3. Quét từ run.nodes (tất cả các node sự kiện thực tế đang nở trên bản đồ)
  if (run.nodes) {
    for (const [slotStr, n] of Object.entries(run.nodes)) {
      if (!n || !n.encounter) continue;
      if (
        n.hetHanNam !== undefined &&
        nam != null &&
        n.hetHanNam <= nam
      )
        continue;

      const encId = n.encounter;
      if (isLoTuViEnc(encId) || isBienCoEnc(encId)) continue;
      const encKey = encId + "@" + slotStr;
      if (seenEncs.has(encKey)) continue;
      if (
        st &&
        st.skipEnc &&
        (st.skipEnc.has(encId) || st.skipEnc.has(encKey))
      )
        continue;
      if (st && st.encAttempts && (st.encAttempts[encKey] || 0) >= 3)
        continue;

      const tv = encGivesTuVi(encId);
      if (tv < 1.0) continue;

      if (!reachable.has(slotStr)) continue;
      if (st && st.bad && (st.bad.has(slotStr) || st.bad.has(+slotStr)))
        continue;

      const y = reachable.get(slotStr);
      const d = danger(c, slotStr);
      if (d && !auColorOK(d.id, cfg.mau)) continue;

      // Kiểm tra giới hạn lần chạy trong run nếu có
      try {
        const Cc = C();
        const encDef = Cc && Cc.encounters && Cc.encounters.get(encId);
        if (encDef && encDef.limits) {
          const h = run.history && run.history[encId];
          if (h) {
            if (
              encDef.limits.moi_run &&
              (h.lan || 0) >= encDef.limits.moi_run
            )
              continue;
            if (
              encDef.limits.hoi_chieu_nam &&
              nam != null &&
              nam - (h.namCuoi || 0) < encDef.limits.hoi_chieu_nam
            )
              continue;
          }
        }
      } catch (e) {}

      seenEncs.add(encKey);
      let ten = encId;
      try {
        const Cc = C();
        const encDef = Cc && Cc.encounters && Cc.encounters.get(encId);
        if (encDef && encDef.ten) ten = encDef.ten;
      } catch (e) {}

      out.push({
        slot: /^\d+$/.test(slotStr) ? +slotStr : slotStr,
        y,
        encId,
        tv,
        ten,
        source: "node",
        d,
      });
    }
  }

  // 4. Quét từ run.noiChon (chỉ quét các kỳ ngộ tạm thời hoặc contextual di tích/bí cảnh, TUYỆT ĐỐI KHÔNG quét standing thường trực)
  if (run.noiChon) {
    for (const [slotStr, nc] of Object.entries(run.noiChon)) {
      if (!nc) continue;
      if (!reachable.has(slotStr)) continue;
      if (st && st.bad && (st.bad.has(slotStr) || st.bad.has(+slotStr)))
        continue;

      const d = danger(c, slotStr);
      if (d && !auColorOK(d.id, cfg.mau)) continue;

      const y = reachable.get(slotStr);
      const allPlaceEncs = [
        ...(Array.isArray(nc.suKien) ? nc.suKien : []),
        ...(Array.isArray(nc.contextual) ? nc.contextual : []),
      ];

      for (const encId of allPlaceEncs) {
        if (!encId || isLoTuViEnc(encId) || isBienCoEnc(encId))
          continue;
        const encKey = encId + "@" + slotStr;
        if (seenEncs.has(encKey)) continue;
        if (
          st &&
          st.skipEnc &&
          (st.skipEnc.has(encId) || st.skipEnc.has(encKey))
        )
          continue;
        if (st && st.encAttempts && (st.encAttempts[encKey] || 0) >= 3)
          continue;

        const tv = encGivesTuVi(encId);
        if (tv < 1.0) continue;

        // Kiểm tra giới hạn run
        try {
          const Cc = C();
          const encDef =
            Cc && Cc.encounters && Cc.encounters.get(encId);
          if (encDef && encDef.limits) {
            const h = run.history && run.history[encId];
            if (h) {
              if (
                encDef.limits.moi_run &&
                (h.lan || 0) >= encDef.limits.moi_run
              )
                continue;
              if (
                encDef.limits.hoi_chieu_nam &&
                nam != null &&
                nam - (h.namCuoi || 0) < encDef.limits.hoi_chieu_nam
              )
                continue;
            }
          }
        } catch (e) {}

        seenEncs.add(encKey);
        let ten = encId;
        try {
          const Cc = C();
          const encDef =
            Cc && Cc.encounters && Cc.encounters.get(encId);
          if (encDef && encDef.ten) ten = encDef.ten;
        } catch (e) {}

        out.push({
          slot: /^\d+$/.test(slotStr) ? +slotStr : slotStr,
          y,
          encId,
          tv,
          ten,
          source: "noiChon",
          d,
        });
      }
    }
  }

  return out.sort((a, b) => {
    if (a.source === "song_tu" && b.source !== "song_tu") return -1;
    if (a.source !== "song_tu" && b.source === "song_tu") return 1;
    const aHere =
      String(a.slot) === String(run.viTri) ||
      String(a.slot) === String(run.oNoi);
    const bHere =
      String(b.slot) === String(run.viTri) ||
      String(b.slot) === String(run.oNoi);
    if (aHere && !bHere) return -1;
    if (!aHere && bHere) return 1;
    const effA = a.tv / Math.max(0.2, a.y);
    const effB = b.tv / Math.max(0.2, b.y);
    if (Math.abs(effB - effA) > 0.01) return effB - effA;
    return a.y - b.y;
  });
}
// Đếm nơi hoang dã còn lượt săn nhưng bị bỏ vì màu không được tích.
function auSkipColor(c, cfg, st) {
  let n = 0;
  try {
    for (const x of nearSlots(c, cfg.maxY)) {
      if (
        !auIsWild(c, x.slot) ||
        (st && st.bad.has(x.slot)) ||
        auHuntLeft(c.run, x.slot) < 1
      )
        continue;
      const d = danger(c, x.slot);
      if (d && !auColorOK(d.id, cfg.mau)) n++;
    }
  } catch (e) {
    /* bỏ qua */
  }
  return n;
}
async function auSanStep(st) {
  const g = G(),
    cfg = AU.cfg.san;
  // Bảng xác nhận đang hiện: đóng bằng nút Hủy rồi dừng (không bao giờ tự đồng ý).
  const cp = await auBypassConfirm();
  if (cp)
    return {
      stop:
        "Phát hiện bảng xác nhận của game “" +
        (cp.title || "không tên") +
        "”" +
        (cp.nguy ? " (cảnh báo nguy hiểm)" : "") +
        ", Auto " +
        (cp.closed
          ? "đã đóng theo đường Hủy"
          : "chưa đóng hẳn được, bạn đóng giúp") +
        " và dừng, không tự đồng ý",
    };
  const p = auPending(st, {
    hunt: true,
    mau: cfg.mau,
    neHac: cfg.neHac !== false,
    danhAi: cfg.danhAi !== false,
    sanMucTieu: cfg.sanMucTieu || "uu_tien_dau_dan",
  });
  if (p !== "idle") {
    if (p === "ok") return null;
    if (p.danger) {
      const r = await auBypassConfirm();
      if (r)
        p.stop +=
          " (đã đóng bảng xác nhận “" + (r.title || "không tên") + "”)";
    }
    return p;
  }
  const run = g.state.run,
    nv = run.nhanVat;
  if (st.fights >= cfg.tran)
    return { stop: "Đã đánh đủ " + cfg.tran + " trận như đã đặt" };
  if ((nv.thuongThe || 0) >= (cfg.thuong != null ? cfg.thuong : 2)) {
    const healPill = findHealItem(nv);
    if (healPill) {
      auLog(
        `🩺 Thương thế ${AU_TT_TEN[nv.thuongThe]} (${nv.thuongThe}/${AU_TT_MAX})! Tự động dùng «${healPill.ten}» chữa thương...`,
        "vk-ok",
      );
      const rHeal = auCall(() => {
        if (typeof g.useItem === "function") g.useItem(healPill.id);
      });
      if (rHeal.ok) {
        const nvAfter =
          G().state && G().state.run && G().state.run.nhanVat;
        auLog(
          `🎉 Đã dùng «${healPill.ten}», thương thế hiện tại: ${AU_TT_TEN[nvAfter?.thuongThe || 0]}.`,
          "vk-ok",
        );
        return null;
      }
    }
    if (cfg.autoDuongThuong !== false) {
      const lifeLeft = auLifeLeft();
      if (lifeLeft > (cfg.tho != null ? cfg.tho : 15) + 2) {
        auLog(
          `🩺 Đang bị thương ${AU_TT_TEN[nv.thuongThe]} (${nv.thuongThe}/${AU_TT_MAX}) và không có đan trị thương. Tự động tạm bế quan tĩnh dưỡng 1 năm để phục hồi...`,
          "vk-warn",
        );
        const rBq = auCall(() => {
          if (typeof g.beQuan === "function") {
            try {
              g.beQuan();
            } catch (e) {}
          }
          if (typeof g.doRetreat === "function") {
            g.doRetreat({
              nam: 1,
              untilExhausted: false,
              nextMinorRealm: false,
              dan: [],
              autoBreak: [],
            });
          }
        });
        if (rBq.ok) {
          const nvHealed =
            G().state && G().state.run && G().state.run.nhanVat;
          auLog(
            `🌿 Đã hoàn tất 1 năm tĩnh dưỡng! Thương thế hiện tại: ${AU_TT_TEN[nvHealed?.thuongThe || 0]}. Tiếp tục săn yêu!`,
            "vk-ok",
          );
          return null;
        }
      }
    }
    return {
      stop:
        "Thương Thế đã tới mức " +
        AU_TT_TEN[Math.min(AU_TT_MAX, nv.thuongThe)] +
        ", dừng để bạn chữa thương (hoặc bật «Tự Động Trị Thương & Tĩnh Dưỡng»)",
    };
  }
  if (auLifeLeft() < cfg.tho)
    return {
      stop:
        "Thọ Nguyên còn dưới " +
        cfg.tho +
        " năm, dừng để bảo vệ Thọ Nguyên",
    };
  const c = ctxLite();
  const dNow = danger(c, run.viTri); // nơi đang đứng tô Đỏ hoặc Tím mà không được tích: phát hiện và dừng
  if (dNow && auRedPurple(dNow.id) && !auColorOK(dNow.id, cfg.mau)) {
    const m = auMauOf(dNow.id),
      r = await auBypassConfirm();
    return {
      stop:
        "Nơi đang đứng là " +
        m[0] +
        " (" +
        dNow.ten +
        "): ngoài màu đã chọn (" +
        auMauLabel(cfg.mau) +
        "). Dừng để bạn tự quyết định" +
        (r
          ? " (đã đóng bảng xác nhận “" +
            (r.title || "không tên") +
            "”)"
          : ""),
      danger: dNow.id,
    };
  }
  if (st.phase === "plan") {
    st.phase = "run";
    if (cfg.kt) {
      const pw = auHuntPower();
      if (pw && pw.n && pw.win < Math.ceil(pw.n * AU_KT))
        return {
          stop:
            "Kiểm tra sức: chỉ thắng chắc " +
            pw.win +
            "/" +
            pw.n +
            " yêu thú mẫu cùng cảnh giới, dưới mức " +
            Math.round(AU_KT * 100) +
            "%. Tăng sức hoặc tắt “Kiểm tra sức trước khi chạy” nếu vẫn muốn chạy",
        };
    }
  }
  // Đang đứng nơi săn được thì săn ngay
  if (
    auIsWild(c, run.viTri) &&
    !st.bad.has(run.viTri) &&
    auSanSpotOK(c, run.viTri, cfg) &&
    g.canDo("ev.san_yeu")
  ) {
    if (
      cfg.sanMucTieu === "chi_dau_dan" &&
      auHuntLeft(run, run.viTri) < 1.5
    ) {
      st.bad.add(run.viTri);
      auLog(
        "Nơi này không đủ 2 lượt săn cho Đầu Đàn, tìm nơi khác...",
        "vk-mu",
      );
      return null;
    }
    if (cfg.neHac !== false && typeof g.huntTargets === "function") {
      try {
        const tgs = g.huntTargets();
        if (
          Array.isArray(tgs) &&
          tgs.length > 0 &&
          tgs.every((t) => auIsHacEnemy(t.id, t.ten))
        ) {
          st.bad.add(run.viTri);
          auLog(
            "Nơi này chỉ có yêu thú Hạc, bỏ qua để giữ Khí Vận.",
            "vk-mu",
          );
          return null;
        }
      } catch (e) {
        /* bỏ qua */
      }
    }
    st.rngBeforeSan = run.rng;
    const r = auCall(() => g.doAction("ev.san_yeu"));
    if (!r.ok) {
      st.bad.add(run.viTri);
      auLog("Không săn được ở đây: " + r.err);
    }
    return null;
  }
  if (auIsWild(c, run.viTri) && !g.canDo("ev.san_yeu"))
    st.bad.add(run.viTri);
  // Hết lượt ở đây: sang nơi hoang dã khác gần nhất
  const spots = auHuntSpots(c, cfg, st).filter(
    (x) => x.slot !== run.viTri,
  );
  if (!spots.length) {
    const sk = auSkipColor(c, cfg, st);
    return {
      stop:
        "Không còn nơi hoang dã thuộc màu đã chọn (" +
        auMauLabel(cfg.mau) +
        ") trong " +
        cfg.maxY +
        " năm đường (đã săn cạn" +
        (sk ? ", bỏ qua " + sk + " nơi ngoài màu đã chọn" : "") +
        "). Chờ vài năm cho yêu thú hồi lại hoặc nới bán kính",
    };
  }
  const t = spots[0];
  const r = auCall(() => g.travelTo(t.slot));
  const r2 = G().state.run;
  if (
    !r.ok ||
    (r2.viTri !== t.slot && !r2.active && !r2.tran && !r2.bienCo)
  ) {
    st.bad.add(t.slot);
    if (++st.tried >= 4)
      return {
        stop:
          "Không đi tới được các nơi săn: " +
          (r.err || r2.thongBao || "bị chặn"),
      };
    return null;
  }
  st.tried = 0;
  st.hacStreak = 0;
  auLog("Tới " + placeName(c, t.slot) + " (" + num(t.y) + " năm).");
  return null;
}
function auHuntPower() {
  const K = S.core,
    c = ctx(),
    nv = c.run.nhanVat,
    Cc = C();
  if (!has("taoBenTa", "taoBenDich", "tinhTocChien")) return null;
  const P = K.taoBenTa(nv, Cc);
  const neHac =
    AU.cfg &&
    ((AU.cfg.tl && AU.cfg.tl.neHac !== false) ||
      (AU.cfg.san && AU.cfg.san.neHac !== false));
  const defs = [...Cc.enemies.values()].filter(
    (e) =>
      e.loai === "yeu_thu" &&
      e.canh_gioi === nv.canhGioi &&
      (!e.muc || e.muc === "thuong") &&
      (!neHac || !auIsHacEnemy(e.id, e.ten)),
  );
  if (!defs.length) return null;
  const step = Math.max(1, Math.floor(defs.length / 14));
  const sample = defs.filter((_, i) => i % step === 0).slice(0, 14);
  let win = 0,
    maybe = 0,
    lose = 0;
  for (const d of sample) {
    const r = simFoe(P, d, [0, 1, 2, 3]);
    if (r.ok === 2) win++;
    else if (r.ok === 1) maybe++;
    else lose++;
  }
  return {
    n: sample.length,
    win,
    maybe,
    lose,
    realm: realmName(nv.canhGioi),
  };
}

// ═════════ AUTO TU LUYỆN & ĐỘT PHÁ TOÀN NĂNG ═════════
// Tự động hóa trọn gói: Tích Lũy Tu Vi (Bế Quan Nhập Định hoặc Đánh Quái Săn Yêu) → Đột Phá Xung Kích → Trấn Áp Tâm Ma
async function auTlStep(st) {
  const g = G(),
    cfg = AU.cfg.tl;
  const cp = await auBypassConfirm();
  if (cp)
    return {
      stop:
        "Phát hiện bảng xác nhận “" +
        (cp.title || "không tên") +
        "”, Auto đã đóng bằng nút Hủy để an toàn.",
    };

  const isDanhQuai = cfg.mode === "danh_quai";

  // 1. Kiểm tra việc dở (trận đánh quái / tâm ma / biến cố quấy bế quan)
  const p = auPending(st, {
    hunt: isDanhQuai,
    isDanhQuai: isDanhQuai,
    mau: isDanhQuai ? cfg.mau : undefined,
    neHac: isDanhQuai ? cfg.neHac !== false : false,
    danhAi: isDanhQuai ? cfg.danhAi !== false : true,
    sanMucTieu: isDanhQuai
      ? cfg.sanMucTieu || "uu_tien_dau_dan"
      : undefined,
    tl: true,
  });
  if (p !== "idle") {
    if (p === "ok") return null;
    if (p.danger) {
      const r = await auBypassConfirm();
      if (r)
        p.stop +=
          " (đã đóng bảng xác nhận “" + (r.title || "không tên") + "”)";
    }
    return p;
  }

  const run = g.state.run,
    nv = run.nhanVat;
  const targetRealm = Number(
    cfg.targetRealm != null ? cfg.targetRealm : 5,
  );
  const targetSubRealm = Number(
    cfg.targetSubRealm != null ? cfg.targetSubRealm : 3,
  );

  // 2. Kiểm tra đích cảnh giới
  if (targetRealm > 0) {
    let reached = false;
    if (nv.canhGioi > targetRealm) {
      reached = true;
    } else if (nv.canhGioi === targetRealm) {
      if (targetSubRealm === -1) {
        // Bất kỳ tiểu cảnh giới nào (chạm cảnh giới là đạt)
        reached = true;
      } else if (targetSubRealm >= 0 && targetSubRealm <= 3) {
        if ((nv.tieuCanhGioi ?? 0) >= targetSubRealm) {
          reached = true;
        }
      } else if (targetSubRealm === 4) {
        // Đại viên mãn (Tu vi đầy 100%)
        const { p: planCheck } = planData();
        if ((nv.tieuCanhGioi ?? 0) >= 3 && planCheck.need <= 0) {
          reached = true;
        }
      }
    }

    if (reached) {
      const subRealmNames = [
        "Sơ kỳ",
        "Trung kỳ",
        "Hậu kỳ",
        "Đại viên mãn",
        "Đại viên mãn (Đầy 100%)",
      ];
      const goalName =
        targetSubRealm >= 0 && targetSubRealm <= 4
          ? realmName(targetRealm) +
            " · " +
            subRealmNames[targetSubRealm]
          : realmName(targetRealm);
      return {
        stop: "Chúc mừng! Đã đạt mục tiêu tu luyện: " + goalName + "!",
      };
    }
  }

  // 3. Kiểm tra thọ nguyên an toàn
  const life = auLifeLeft();
  const minTho = Number(cfg.minTho != null ? cfg.minTho : 10);
  if (life <= minTho) {
    return {
      stop:
        "Thọ nguyên chỉ còn " +
        Math.floor(life) +
        " năm (dưới mức an toàn " +
        minTho +
        " năm). Dừng để bảo toàn tính mạng!",
    };
  }

  // 4. Kiểm tra tu vi & bình cảnh
  const { c, p: plan } = planData();
  const atTop = plan.need <= 0;
  const isMaxRealm = nv.canhGioi >= 5;

  // Kiểm tra và tự động uống đan phá bình cảnh (Cả Bế quan & Đánh quái)
  if (cfg.autoBreakBottleneck !== false && isAtBottleneck(nv)) {
    const bPills = findPhaBinhCanhPills(nv);
    if (bPills.length > 0) {
      const pill = bPills[0];
      st.breakPillAttempts = (st.breakPillAttempts || 0) + 1;
      if (st.breakPillAttempts <= 3) {
        const curRun = G().state && G().state.run;
        if (curRun) {
          if (
            curRun.active &&
            (curRun.active.done || !curRun.active.waiting) &&
            typeof g.closeEncounter === "function"
          ) {
            try {
              g.closeEncounter();
            } catch (e) {}
          }
          if (curRun.thongBao && typeof g.dongThongBao === "function") {
            try {
              g.dongThongBao();
            } catch (e) {}
          }
          if (
            curRun.longNotice &&
            typeof g.closeLongNotice === "function"
          ) {
            try {
              g.closeLongNotice();
            } catch (e) {}
          }
        }
        auLog(
          `💊 Tu vi chạm bình cảnh! Tự động uống «${pill.ten}» (còn ×${pill.count}) để phá bình cảnh...`,
          "vk-ok",
        );
        const rPill = auCall(() => {
          if (typeof g.useItem === "function") g.useItem(pill.id);
        });
        if (rPill.ok) {
          st.bottlenecksBroken = (st.bottlenecksBroken || 0) + 1;
          st.breakPillAttempts = 0;
          auLog(
            `🎉 Đã uống «${pill.ten}» phá bình cảnh thành công!`,
            "vk-ok",
          );
          return null;
        } else {
          auLog(
            `Không dùng được «${pill.ten}»: ${rPill.err || "lỗi không rõ"}`,
            "vk-mu",
          );
        }
      }
    }
  }

  if (atTop && isMaxRealm) {
    if (!isDanhQuai) {
      return {
        stop: "Tu vi Hóa Thần Đại viên mãn đã đạt cực hạn tối đa, không thể tích lũy thêm qua bế quan.",
      };
    }
    // Ở chế độ Đánh Quái: tu vi đã chạm đỉnh nhưng người chơi vẫn có thể farm quái lấy tài nguyên, nên bỏ qua đột phá và tiếp tục đánh quái bên dưới.
  } else if (atTop) {
    // ───── TIẾN HÀNH ĐỘT PHÁ ─────
    auLog("Tu vi đã viên mãn, chuẩn bị đột phá cảnh giới...", "vk-ok");
    const h0 = S.core.chuanBiDotPha(c, { dan: [], thieuDot: 0 });
    if (h0.chan) {
      return {
        stop:
          "Chưa thể đột phá: " +
          (typeof h0.chan === "string"
            ? h0.chan
            : h0.chan.ten || h0.chan.lyDo || JSON.stringify(h0.chan)),
      };
    }

    const pills = [...new Set(h0.danDung || [])];
    const tdOpts = [0];
    const combos = [];
    const sets = [[]];
    if (cfg.useBreakPills !== false) {
      pills.forEach((p) => sets.push([p]));
      for (let i = 0; i < pills.length; i++) {
        for (let j = i + 1; j < pills.length; j++)
          sets.push([pills[i], pills[j]]);
      }
    }
    for (const dan of sets) {
      for (const td of tdOpts) {
        try {
          const h = S.core.chuanBiDotPha(ctx(), { dan, thieuDot: td });
          combos.push({ dan, td, tiLe: h.tiLe, h });
        } catch (e) {}
      }
    }
    combos.sort(
      (a, b) => b.tiLe - a.tiLe || a.dan.length - b.dan.length,
    );
    const best = combos[0] || { dan: [], td: 0, tiLe: h0.tiLe };
    const minSafeRate =
      (cfg.minSafeRate != null ? cfg.minSafeRate : 65) / 100;

    if (best.tiLe < minSafeRate) {
      return {
        stop:
          "Tỉ lệ đột phá cao nhất hiện tại là " +
          pct(best.tiLe, 1) +
          " (dưới ngưỡng an toàn " +
          Math.round(minSafeRate * 100) +
          "%). Dừng để bạn bổ sung đan dược hoặc tìm người hộ pháp.",
      };
    }

    const GRADE_MAP = {
      hoan_my: "Hoàn Mỹ",
      thuong: "Thượng",
      trung: "Trung",
      ha: "Hạ",
    };
    let expGrade = null;
    if (S.core && S.core.breakthroughGrade) {
      try {
        expGrade = S.core.breakthroughGrade(ctx(), {
          dan: best.dan,
          thieuDot: best.td,
        });
      } catch (e) {}
    }
    auLog(
      "Bắt đầu xung kích đột phá (Tỉ lệ: " +
        pct(best.tiLe, 1) +
        (expGrade
          ? " · Phẩm dự kiến: " + (GRADE_MAP[expGrade] || expGrade)
          : "") +
        (best.dan.length
          ? " · Đan: " + best.dan.map(auItemName).join("+")
          : "") +
        ")...",
      "vk-ok",
    );
    const curCg = nv.canhGioi;
    const rDotPha = auCall(() =>
      g.xungKich({ dan: best.dan, thieuDot: best.td }),
    );
    if (!rDotPha.ok) {
      return { stop: "Không thực hiện xung kích được: " + rDotPha.err };
    }

    const outcome = rDotPha.res;
    if (outcome && outcome.result === "tam_ma") {
      auLog(
        "⚡ Xuất hiện Trận Tâm Ma! Đang nghênh chiến tâm ma...",
        "vk-warn",
      );
    }
    if (outcome && outcome.disturbed) {
      auLog(
        "⚠️ Bị quấy nhiễu giữa lúc xung kích (trừ tỉ lệ)!",
        "vk-warn",
      );
    }

    const runAfter = G().state.run;
    if (runAfter.nhanVat.canhGioi > curCg) {
      st.breakouts = (st.breakouts || 0) + 1;
      const gName =
        outcome && outcome.grade
          ? " (" + (GRADE_MAP[outcome.grade] || outcome.grade) + ")"
          : expGrade
            ? " (" + (GRADE_MAP[expGrade] || expGrade) + ")"
            : "";
      auLog(
        "🎉 Đột phá thành công lên " +
          realmName(runAfter.nhanVat.canhGioi) +
          gName +
          "!",
        "vk-ok",
      );
      try {
        UI.notify(
          "🎉 Đột phá thành công lên " +
            realmName(runAfter.nhanVat.canhGioi) +
            gName +
            "!",
        );
      } catch (e) {}
    } else {
      st.breakoutFails = (st.breakoutFails || 0) + 1;
      auLog(
        "Đột phá chưa thành công, tiếp tục tích lũy tu vi...",
        "vk-mu",
      );
    }
    return null;
  }

  // ───── TÍCH LŨY TU VI (BẾ QUAN HOẶC ĐÁNH QUÁI) ─────
  if (isDanhQuai) {
    // === CHẾ ĐỘ ĐÁNH QUÁI (SĂN YÊU THÚ CÀY TU VI) ===
    if (cfg.tran && st.fights >= cfg.tran)
      return { stop: "Đã đánh đủ " + cfg.tran + " trận như đã đặt" };
    if ((nv.thuongThe || 0) >= (cfg.thuong != null ? cfg.thuong : 2)) {
      // 1. Tự động kiểm tra nuốt đan dược chữa thương
      const healPill = findHealItem(nv);
      if (healPill) {
        auLog(
          `🩺 Thương thế ${AU_TT_TEN[nv.thuongThe]} (${nv.thuongThe}/${AU_TT_MAX})! Tự động dùng «${healPill.ten}» chữa thương...`,
          "vk-ok",
        );
        const rHeal = auCall(() => {
          if (typeof g.useItem === "function") g.useItem(healPill.id);
        });
        if (rHeal.ok) {
          const nvAfter =
            G().state && G().state.run && G().state.run.nhanVat;
          auLog(
            `🎉 Đã dùng «${healPill.ten}», thương thế hiện tại: ${AU_TT_TEN[nvAfter?.thuongThe || 0]}.`,
            "vk-ok",
          );
          return null;
        }
      }

      // 2. Nếu không có đan, kiểm tra tự động tĩnh dưỡng lành thương
      if (cfg.autoDuongThuong !== false) {
        const lifeLeft = auLifeLeft();
        if (lifeLeft > (cfg.minTho != null ? cfg.minTho : 10) + 2) {
          auLog(
            `🩺 Đang bị thương ${AU_TT_TEN[nv.thuongThe]} (${nv.thuongThe}/${AU_TT_MAX}) và không có đan trị thương. Tự động tạm bế quan tĩnh dưỡng 1 năm để phục hồi thể trạng...`,
            "vk-warn",
          );
          if (
            !plan.here ||
            plan.here.chan ||
            !(plan.here.tuViNam > 0)
          ) {
            const spots = await scanRetreat(cLite, 3, null);
            if (spots && spots.length > 0) {
              const bestSpot = spots[0];
              auLog(
                `Chỗ này không bế quan được, di chuyển tới ${placeName(cLite, bestSpot.slot)} (${num(bestSpot.y)} năm) để dưỡng thương...`,
                "vk-mu",
              );
              const rTravel = auCall(() => g.travelTo(bestSpot.slot));
              if (!rTravel.ok) {
                return {
                  stop:
                    "Không di chuyển tới chỗ dưỡng thương được: " +
                    rTravel.err,
                };
              }
              return null;
            }
          }
          // Tiến hành bế quan 1 năm dưỡng thương
          const rBq = auCall(() => {
            const rRun = G().state && G().state.run;
            if (
              rRun &&
              rRun.active &&
              (rRun.active.done || !rRun.active.waiting) &&
              typeof g.closeEncounter === "function"
            ) {
              try {
                g.closeEncounter();
              } catch (e) {}
            }
            if (typeof g.beQuan === "function") {
              try {
                g.beQuan();
              } catch (e) {}
            }
            if (typeof g.doRetreat === "function") {
              g.doRetreat({
                nam: 1,
                untilExhausted: false,
                nextMinorRealm: false,
                dan: [],
                autoBreak: [],
              });
            }
          });
          if (rBq.ok) {
            const nvHealed =
              G().state && G().state.run && G().state.run.nhanVat;
            auLog(
              `🌿 Đã hoàn tất 1 năm tĩnh dưỡng! Thương thế hiện tại: ${AU_TT_TEN[nvHealed?.thuongThe || 0]}. Tiếp tục săn quái cày tu vi!`,
              "vk-ok",
            );
            return null;
          }
        }
      }

      return {
        stop:
          "Thương Thế đã tới mức " +
          AU_TT_TEN[Math.min(AU_TT_MAX, nv.thuongThe)] +
          ", dừng để bạn chữa thương (hoặc bật «Tự Động Trị Thương & Tĩnh Dưỡng»)",
      };
    }

    const cLite = ctxLite();
    const dNow = danger(cLite, run.viTri);
    if (dNow && auRedPurple(dNow.id) && !auColorOK(dNow.id, cfg.mau)) {
      const m = auMauOf(dNow.id),
        r = await auBypassConfirm();
      return {
        stop:
          "Nơi đang đứng là " +
          m[0] +
          " (" +
          dNow.ten +
          "): ngoài màu đã chọn (" +
          auMauLabel(cfg.mau) +
          "). Dừng để bạn tự quyết định" +
          (r
            ? " (đã đóng bảng xác nhận “" +
              (r.title || "không tên") +
              "”)"
            : ""),
        danger: dNow.id,
      };
    }

    if (st.phase === "plan") {
      st.phase = "run";
      if (cfg.kt) {
        const pw = auHuntPower();
        if (pw && pw.n && pw.win < Math.ceil(pw.n * AU_KT))
          return {
            stop:
              "Kiểm tra sức: chỉ thắng chắc " +
              pw.win +
              "/" +
              pw.n +
              " yêu thú mẫu cùng cảnh giới, dưới mức " +
              Math.round(AU_KT * 100) +
              "%. Tăng sức hoặc tắt “Kiểm tra sức trước khi chạy” nếu vẫn muốn chạy",
          };
      }
    }

    // 2. Ưu tiên tham gia sự kiện tăng tu vi (kỳ ngộ, bí cảnh, di tích...) nếu bật cấu hình
    if (cfg.uuTienSuKienTuVi !== false) {
      const tvSpots = auFindTuViSpots(cLite, cfg, st);
      if (tvSpots.length > 0) {
        const targetTv = tvSpots[0];
        const isHere =
          String(targetTv.slot) === String(run.viTri) ||
          String(targetTv.slot) === String(run.oNoi);

        if (isHere) {
          // Đang ở đúng nơi có sự kiện tăng tu vi
          const encKey = targetTv.encId + "@" + targetTv.slot;
          st.encAttempts = st.encAttempts || {};
          st.encAttempts[encKey] = (st.encAttempts[encKey] || 0) + 1;
          if (st.encAttempts[encKey] > 3) {
            auLog(
              `⚠️ Thử mở sự kiện tu vi «${targetTv.ten}» không thành công sau 3 lần, tạm thời bỏ qua...`,
              "vk-mu",
            );
            st.skipEnc = st.skipEnc || new Set();
            st.skipEnc.add(targetTv.encId);
            st.skipEnc.add(encKey);
          } else {
            // Kích hoạt sự kiện tu vi tùy theo nguồn (song_tu, node bản đồ, nơi chốn, hoặc hoạt động)
            auLog(
              `⚡ Tham gia sự kiện tăng tu vi «${targetTv.ten}» (+${num(targetTv.tv)} tu vi kỳ vọng)...`,
              "vk-ok",
            );

            let rAct = { ok: false };
            if (targetTv.source === "song_tu") {
              rAct = auCall(() => {
                if (
                  TT.core &&
                  typeof TT.core.openVisit === "function"
                ) {
                  g.act((ctx) =>
                    TT.core.openVisit(ctx, targetTv.npcId, "dual"),
                  );
                } else if (typeof g.chooseActivity === "function") {
                  g.chooseActivity("ev.song_tu");
                }
              });
            } else if (targetTv.source === "node") {
              rAct = auCall(() => {
                if (typeof g.enterNode === "function") {
                  g.enterNode(String(targetTv.slot));
                }
              });
            } else if (targetTv.source === "noiChon") {
              if (String(run.oNoi) !== String(targetTv.slot)) {
                if (typeof g.enterPlace === "function") {
                  try {
                    g.enterPlace(String(targetTv.slot));
                  } catch (ePlace) {}
                }
              }
              rAct = auCall(() => {
                if (typeof g.chooseActivity === "function") {
                  try {
                    g.chooseActivity(targetTv.encId);
                  } catch (e1) {
                    if (typeof g.doAction === "function")
                      g.doAction(targetTv.encId);
                    else throw e1;
                  }
                } else if (typeof g.doAction === "function") {
                  g.doAction(targetTv.encId);
                }
              });
            } else {
              // targetTv.source === "activity"
              rAct = auCall(() => {
                if (typeof g.chooseActivity === "function") {
                  try {
                    g.chooseActivity(targetTv.encId);
                  } catch (e2) {
                    if (typeof g.doAction === "function")
                      g.doAction(targetTv.encId);
                    else throw e2;
                  }
                } else if (typeof g.doAction === "function") {
                  g.doAction(targetTv.encId);
                }
              });
            }

            const rAfter = G().state && G().state.run;
            if (
              rAfter &&
              (rAfter.active || rAfter.tran || rAfter.bienCo)
            ) {
              st.tried = 0;
              return null;
            }

            // Fallback doAction nếu chưa mở
            if (
              !rAct.ok ||
              (rAfter && !rAfter.active && !rAfter.tran)
            ) {
              auCall(() => {
                if (typeof g.doAction === "function")
                  g.doAction(targetTv.encId);
              });
            }

            const rFinal = G().state && G().state.run;
            if (
              rFinal &&
              (rFinal.active || rFinal.tran || rFinal.bienCo)
            ) {
              st.tried = 0;
              return null;
            }
          }
        } else {
          // Cần di chuyển tới ô có sự kiện tăng tu vi
          auLog(
            `⚡ Phát hiện sự kiện tu vi «${targetTv.ten}» (+${targetTv.tv} tu vi) cách ${num(targetTv.y)} năm. Đang di chuyển tới...`,
            "vk-ok",
          );
          const r = auCall(() => g.travelTo(String(targetTv.slot)));
          const r2 = G().state && G().state.run;
          if (
            !r.ok ||
            (String(r2.viTri) !== String(targetTv.slot) &&
              !r2.active &&
              !r2.tran &&
              !r2.bienCo)
          ) {
            st.bad.add(targetTv.slot);
            st.bad.add(String(targetTv.slot));
            auLog(
              `Không thể đi tới ô sự kiện ${targetTv.slot}: ${r.err || "bị chặn"}`,
              "vk-mu",
            );
          }
          return null;
        }
      }
    }

    // Đang đứng nơi hoang dã săn được thì săn ngay
    if (
      auIsWild(cLite, run.viTri) &&
      !st.bad.has(run.viTri) &&
      auSanSpotOK(cLite, run.viTri, cfg) &&
      g.canDo("ev.san_yeu")
    ) {
      if (
        cfg.sanMucTieu === "chi_dau_dan" &&
        auHuntLeft(run, run.viTri) < 1.5
      ) {
        st.bad.add(run.viTri);
        auLog(
          "Nơi này không đủ 2 lượt săn cho Đầu Đàn, tìm nơi khác...",
          "vk-mu",
        );
        return null;
      }
      if (cfg.neHac !== false && typeof g.huntTargets === "function") {
        try {
          const tgs = g.huntTargets();
          if (
            Array.isArray(tgs) &&
            tgs.length > 0 &&
            tgs.every((t) => auIsHacEnemy(t.id, t.ten))
          ) {
            st.bad.add(run.viTri);
            auLog(
              "Nơi này chỉ có yêu thú Hạc, bỏ qua để giữ Khí Vận.",
              "vk-mu",
            );
            return null;
          }
        } catch (e) {}
      }
      st.rngBeforeSan = run.rng;
      const r = auCall(() => g.doAction("ev.san_yeu"));
      if (!r.ok) {
        st.bad.add(run.viTri);
        auLog("Không săn được ở đây: " + r.err);
      }
      return null;
    }

    if (auIsWild(cLite, run.viTri) && !g.canDo("ev.san_yeu"))
      st.bad.add(run.viTri);

    // Hết lượt ở đây: sang nơi hoang dã khác gần nhất
    const spots = auHuntSpots(cLite, cfg, st).filter(
      (x) => x.slot !== run.viTri,
    );
    if (!spots.length) {
      const sk = auSkipColor(cLite, cfg, st);
      return {
        stop:
          "Không còn nơi hoang dã thuộc màu đã chọn (" +
          auMauLabel(cfg.mau) +
          ") trong " +
          (cfg.maxY || 3) +
          " năm đường (đã săn cạn" +
          (sk ? ", bỏ qua " + sk + " nơi ngoài màu đã chọn" : "") +
          "). Chờ vài năm cho yêu thú hồi lại, nới bán kính hoặc chuyển sang Bế Quan.",
      };
    }
    const t = spots[0];
    const r = auCall(() => g.travelTo(t.slot));
    const r2 = G().state.run;
    if (
      !r.ok ||
      (r2.viTri !== t.slot && !r2.active && !r2.tran && !r2.bienCo)
    ) {
      st.bad.add(t.slot);
      if (++st.tried >= 4)
        return {
          stop:
            "Không đi tới được các nơi săn: " +
            (r.err || r2.thongBao || "bị chặn"),
        };
      return null;
    }
    st.tried = 0;
    st.hacStreak = 0;
    auLog(
      "Tới " +
        placeName(cLite, t.slot) +
        " (" +
        num(t.y) +
        " năm) săn yêu cày tu vi.",
    );
    return null;
  }

  // === CHẾ ĐỘ BẾ QUAN (NHẬP ĐỊNH) ===
  if (!plan.here || plan.here.chan || !(plan.here.tuViNam > 0)) {
    const spots = await scanRetreat(c, 3, null);
    if (!spots || !spots.length) {
      return {
        stop:
          "Chỗ đang đứng không bế quan được (" +
          ((plan.here && plan.here.chan) || "không có linh khí") +
          ") và không tìm thấy chỗ bế quan an toàn quanh đây.",
      };
    }
    const bestSpot = spots[0];
    auLog(
      "Chỗ này không bế quan được, di chuyển tới " +
        placeName(c, bestSpot.slot) +
        " (" +
        num(bestSpot.y) +
        " năm)...",
      "vk-mu",
    );
    const rTravel = auCall(() => g.travelTo(bestSpot.slot));
    if (!rTravel.ok)
      return {
        stop: "Không di chuyển tới chỗ bế quan được: " + rTravel.err,
      };
    return null;
  }

  const cultPills = [];
  if (cfg.useCultPills !== false && nv.tuiDo) {
    for (const [id, count] of Object.entries(nv.tuiDo)) {
      if (!count || count <= 0) continue;
      const it = C().items && C().items.get(id);
      if (
        it &&
        it.tu_luyen &&
        (it.canh_gioi === undefined || it.canh_gioi === nv.canhGioi)
      ) {
        const isCapped =
          S.core && typeof S.core.drugCapped === "function"
            ? S.core.drugCapped(nv, id)
            : false;
        if (!isCapped) {
          cultPills.push(id);
          if (cultPills.length >= 2) break;
        }
      }
    }
  }
  const autoBreak = [];
  if (cfg.autoBreakBottleneck !== false && nv.tuiDo) {
    const bPills = findPhaBinhCanhPills(nv);
    for (const p of bPills) {
      autoBreak.push(p.id);
    }
  }

  // 4.5. Tự động kiểm tra và ưu tiên Song Tu cùng Đạo Lữ (khi hồi chiêu 5 năm hoàn tất)
  if (cfg.autoSongTu !== false && run.npc) {
    let readyDaoLuId = null;
    let readyDaoLuNpc = null;
    for (const [npcId, npc] of Object.entries(run.npc)) {
      if (!npc || !npc.song || npc.danhPhan !== "dao_lu") continue;
      const blocked =
        TT.core && typeof TT.core.dualBlock === "function"
          ? TT.core.dualBlock(ctxLite(), npcId)
          : run.nhanVat &&
              run.nhanVat.dualYear != null &&
              run.nam - run.nhanVat.dualYear < 5
            ? "chưa hồi chiêu"
            : undefined;
      if (blocked === undefined) {
        readyDaoLuId = npcId;
        readyDaoLuNpc = npc;
        break;
      }
    }
    if (readyDaoLuId && readyDaoLuNpc) {
      const estGain =
        TT.core && typeof TT.core.dualGain === "function"
          ? TT.core.dualGain(ctxLite())
          : 5.0;
      auLog(
        `❤️ Phát hiện Đạo Lữ «${readyDaoLuNpc.ten}» đã sẵn sàng Song Tu (+${num(estGain)} tu vi, giảm 5 tâm ma)! Tự động mời song tu...`,
        "vk-ok",
      );
      const rSongTu = auCall(() => {
        if (TT.core && typeof TT.core.openVisit === "function") {
          g.act((ctx) => TT.core.openVisit(ctx, readyDaoLuId, "dual"));
        } else if (typeof g.chooseActivity === "function") {
          g.chooseActivity("ev.song_tu");
        }
      });
      if (rSongTu.ok) {
        st.tried = 0;
        return null;
      }
    }
  }

  const maxSafeYears = Math.min(
    100,
    Math.max(1, Math.floor(life - minTho)),
  );
  let neededYears =
    plan.hereYears && Number.isFinite(plan.hereYears)
      ? Math.ceil(plan.hereYears)
      : 10;
  let untilExhausted = true;
  let nextMinor = false;
  if (
    targetRealm > 0 &&
    targetRealm === nv.canhGioi &&
    targetSubRealm >= 0 &&
    targetSubRealm < 3 &&
    (nv.tieuCanhGioi ?? 0) < targetSubRealm
  ) {
    if (plan.nextNeed > 0 && plan.here && plan.here.tuViNam > 0) {
      neededYears = Math.ceil(plan.nextNeed / plan.here.tuViNam);
      nextMinor = true;
      untilExhausted = false;
    }
  }
  const yearsToSit = Math.min(maxSafeYears, Math.max(1, neededYears));

  const lcBeQuan = {
    nam: yearsToSit,
    untilExhausted,
    nextMinorRealm: nextMinor,
    dan: cultPills,
    autoBreak: autoBreak,
  };

  const namTruoc = run.nam;
  const rBq = auCall(() => {
    const rRun = G().state && G().state.run;
    if (
      rRun &&
      rRun.active &&
      (rRun.active.done || !rRun.active.waiting) &&
      typeof g.closeEncounter === "function"
    ) {
      try {
        g.closeEncounter();
      } catch (e) {}
    }
    if (rRun && rRun.thongBao && typeof g.dongThongBao === "function") {
      try {
        g.dongThongBao();
      } catch (e) {}
    }
    if (
      rRun &&
      rRun.longNotice &&
      typeof g.closeLongNotice === "function"
    ) {
      try {
        g.closeLongNotice();
      } catch (e) {}
    }
    let curActive = G().state && G().state.run && G().state.run.active;
    if (
      !curActive ||
      !curActive.waiting ||
      curActive.waiting.kind !== "be_quan"
    ) {
      if (typeof g.beQuan === "function") {
        try {
          g.beQuan();
        } catch (eBq) {
          if (typeof g.closeEncounter === "function") {
            try {
              g.closeEncounter();
            } catch (eCl) {}
          }
          g.beQuan();
        }
      }
    }
    curActive = G().state && G().state.run && G().state.run.active;
    if (
      !curActive ||
      !curActive.waiting ||
      curActive.waiting.kind !== "be_quan"
    ) {
      throw new Error("Encounter hiện tại chưa sẵn sàng cho bế quan");
    }
    g.nhapDinh(lcBeQuan);
    const rAfter = G().state && G().state.run;
    if (
      rAfter &&
      rAfter.active &&
      rAfter.active.done &&
      typeof g.closeEncounter === "function"
    ) {
      try {
        g.closeEncounter();
      } catch (e) {}
    }
    if (
      rAfter &&
      rAfter.thongBao &&
      typeof g.dongThongBao === "function"
    ) {
      try {
        g.dongThongBao();
      } catch (e) {}
    }
    if (
      rAfter &&
      rAfter.longNotice &&
      typeof g.closeLongNotice === "function"
    ) {
      try {
        g.closeLongNotice();
      } catch (e) {}
    }
  });
  if (!rBq.ok) {
    if (++st.tried < 2) {
      return null;
    }
    return { stop: "Không nhập định được: " + rBq.err };
  }
  st.tried = 0;

  const namSau = G().state.run.nam;
  const deltaY = Math.max(0, namSau - namTruoc);
  st.retreatYearsDone = (st.retreatYearsDone || 0) + deltaY;
  auLog(
    "Bế quan " +
      num(deltaY) +
      " năm tại " +
      (plan.here.ten || "chỗ này") +
      " (tổng đã ngồi: " +
      num(st.retreatYearsDone) +
      " năm).",
    "vk-ok",
  );
  return null;
}

