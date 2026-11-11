import { gWin, num, safeYrs } from "../core/utils.js";
import { S, G, C, ctxLite, scanRetreat } from "../core/bridge.js";
import {
  DIBAO,
  scanDiBao,
  placeName,
  findSlotByDiaDanh,
  findCandidateSlotsForRelicEv,
  checkOwnedRelic,
  scanMapActiveDiBao,
  enterDiBaoEvent,
  checkStat,
  checkCanTeleport,
  smartTeleportTo,
  simDiBaoGuard,
  findStatBoosters,
  calcDiBaoPity,
  removeDiBaoAlert,
  showDiBaoMini,
} from "../modules/di-bao.js";
import {
  AU_TT_MAX,
  AU_TT_TEN,
  AU,
  auLog,
  auCall,
  auLifeLeft,
  auBypassConfirm,
} from "./auto-core.js";
/**
 * Module: Auto Săn Dị Bảo (Nghịch Thiên P8) & Cắm Trại Đón Đầu Pity
 */
// ═════════ AUTO SĂN DỊ BẢO (NGHỊCH THIÊN P8) ═════════
// Tự động quét bản đồ thế giới, ưu tiên truyền tống tức thì hoặc bay tới sự kiện Dị Bảo,
// tự động vào node, vượt bài kiểm định chỉ số hoặc giao chiến hạ Hộ Vệ (dùng Siêu AI VIP).
// Khi chưa có Dị Bảo nở trên map, Auto cắm trại đón đầu & bế quan theo cơ chế Thiên Đạo Bù Dị Bảo (Pity 500 năm).
async function auSdbStep(st) {
  const g = G(),
    cfg = AU.cfg.sdb;
  // 1. Kiểm tra bảng xác nhận game: đóng bằng Hủy rồi dừng
  const cp = await auBypassConfirm();
  if (cp)
    return {
      stop:
        "Phát hiện bảng xác nhận của game “" +
        (cp.title || "không tên") +
        "”" +
        (cp.nguy ? " (cảnh báo nguy hiểm)" : "") +
        ", Auto " +
        (cp.closed ? "đã đóng theo đường Hủy" : "chưa đóng hẳn được") +
        " và dừng để an toàn.",
    };

  // 2. Xử lý việc đang dở (trận chiến, sự kiện)
  const p = auPending(st, {
    sdb: true,
    danhAi: cfg.danhAi !== false,
    minWinRate: cfg.minWinRate,
  });
  if (p !== "idle") {
    if (p === "ok") return null;
    return p;
  }

  const run = g.state.run,
    nv = run.nhanVat;
  const nam = typeof run.nam === "number" ? run.nam : null;

  // 3. Kiểm tra thọ nguyên an toàn
  const life = auLifeLeft();
  const minTho = Number(cfg.minTho != null ? cfg.minTho : 15);
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

  // 4. Kiểm tra giới hạn số năm chạy
  const maxNam = Number(cfg.maxNam != null ? cfg.maxNam : 100);
  if (nam != null && nam - st.nam0 >= maxNam) {
    return {
      stop:
        "Đã chạy đủ " +
        maxNam +
        " năm như giới hạn cấu hình. Dừng để bạn kiểm tra.",
    };
  }

  // 5. Kiểm tra thương thế
  if ((nv.thuongThe || 0) >= 2) {
    return {
      stop:
        "Thương thế nặng (" +
        AU_TT_TEN[Math.min(AU_TT_MAX, nv.thuongThe)] +
        "). Dừng để bạn chữa thương!",
    };
  }

  const c = ctxLite();
  const K = S.core;
  const Cc = C();
  const sc = scanDiBao([run, g.state.meta]);

  // Kiểm tra đã sở hữu món đồ trong kiếp hiện tại
  const isOwned = (id) => checkOwnedRelic(id, run, sc);

  // Danh sách Dị Bảo được chọn săn:
  const validEvs = DIBAO.ev.filter(
    (e) => e && e.relic && typeof e.relic === "string" && e.relic.trim() !== "",
  );
  const selectedRelics = (
    Array.isArray(cfg.targetRelics)
      ? cfg.targetRelics
      : validEvs.map((e) => e.relic)
  ).filter((r) => r && typeof r === "string" && r.trim() !== "");
  const allowAllSpawns = cfg.sanMoiDiBaoXuatThe !== false;
  if (selectedRelics.length === 0 && !allowAllSpawns) {
    return {
      stop: "Bạn chưa chọn Dị Bảo nào để săn! Hãy vào tab Auto Săn Dị Bảo (asdb) hoặc tab Dị Bảo (db) để tích chọn ít nhất 1 món, hoặc bật 'Tự Động Săn Mọi Dị Bảo Xuất Thế'.",
    };
  }
  const targetRelicSet = new Set(selectedRelics);

  // 6. Quét toàn diện Dị Bảo đang nở trên thế giới (run.nodes, di tích run.noiChon, theGioi, placeActivities)
  st.encAttempts = st.encAttempts || {};
  st.skipEnc = st.skipEnc || new Set();

  const activeTargets = [];
  const ignoredTargets = [];
  const activeMap = scanMapActiveDiBao(run, c, true);

  for (const item of activeMap.values()) {
    const ev = item.ev || DIBAO.evMap.get(item.encId);
    if (!ev) continue;
    const slotStr = String(item.slot);
    const slot = item.slot;

    // Kiểm tra hạn năm nếu có
    if (item.hetHanNam !== undefined && nam != null && item.hetHanNam <= nam)
      continue;

    const owned = isOwned(ev.relic);
    if (cfg.boQuaDaCo !== false && owned) continue;

    const isTarget = targetRelicSet.has(ev.relic);
    if (!isTarget && !allowAllSpawns) {
      ignoredTargets.push({ ev, slotStr });
      continue;
    }

    // Bỏ qua nếu sự kiện này đang bị tạm dừng do không vượt qua khảo nghiệm/quá mạnh
    const encKey = ev.id + "@" + slotStr;
    if (st.skipEnc.has(ev.id) || st.skipEnc.has(encKey)) {
      continue;
    }

    const relInfo =
      DIBAO.rel[ev.relic] ||
      (Cc && Cc.items ? Cc.items.get(ev.relic) : null) ||
      {};

    let y = Infinity;
    if (c && K && K.travelYears) {
      try {
        y = K.travelYears(c, slot);
      } catch (e) {}
    }
    const remYears =
      item.hetHanNam !== undefined && nam != null
        ? Math.max(0, Math.floor(item.hetHanNam - nam))
        : 999;
    const isCarry = relInfo.bd === "Có" || relInfo.theo_kiep;
    const pName = placeName(c, slot);

    // Kiểm tra cảnh giới tối thiểu (gate) của Dị Bảo
    const gateOk = !ev.gate || (nv && nv.canhGioi >= ev.gate[0]);
    if (!gateOk) {
      if (!st.skipEnc.has(encKey)) {
        st.skipEnc.add(encKey);
        const reqRealmName =
          (typeof REALM !== "undefined" && REALM[ev.gate[0]]) ||
          "Cảnh giới " + ev.gate[0];
        auLog(
          `⚠️ Bỏ qua «${ev.ten}» (${relInfo.ten || ev.relic}) tại ${placeName(c, slot)}: yêu cầu tối thiểu ${reqRealmName}.`,
          "vk-warn",
        );
      }
      continue;
    }

    const statChk = checkStat(ev.chk, nv);
    let canBoostStat = statChk.ok;
    if (
      !statChk.ok &&
      statChk.key &&
      statChk.req > statChk.cur &&
      typeof findStatBoosters === "function"
    ) {
      try {
        const gap = statChk.req - statChk.cur;
        const boosters = findStatBoosters(statChk.key, gap);
        const pills = ((boosters && boosters.bagItems) || []).filter(
          (b) => b.loai === "dan_duoc" && b.val > 0 && b.count > 0,
        );
        const totalPillVal = pills.reduce(
          (acc, pItem) => acc + pItem.val * pItem.count,
          0,
        );
        if (totalPillVal >= gap) canBoostStat = true;
      } catch (e) {}
    }

    const sim = simDiBaoGuard(nv, ev);
    const minWr = Number(cfg.minWinRate != null ? cfg.minWinRate : 70);
    const combatOk = !sim || sim.winRate >= minWr;

    activeTargets.push({
      slot,
      source: item.source || "node",
      encId: ev.id,
      e: ev,
      relic: ev.relic,
      title: relInfo.ten || ev.relic,
      isCarry,
      pName,
      y,
      remYears,
      owned,
      statChk,
      canBoostStat,
      sim,
      combatOk,
      isTarget,
      canTele: checkCanTeleport(slot),
    });
  }

  // 7. NẾU CÓ DỊ BẢO ĐANG NỞ TRÊN BẢN ĐỒ:
  if (activeTargets.length > 0) {
    activeTargets.sort((a, b) => {
      const aReady = a.combatOk && a.canBoostStat;
      const bReady = b.combatOk && b.canBoostStat;
      if (aReady && !bReady) return -1;
      if (!aReady && bReady) return 1;
      if (a.isTarget && !b.isTarget) return -1;
      if (!a.isTarget && b.isTarget) return 1;
      if (cfg.uuTienTheoHon !== false) {
        if (a.isCarry && !b.isCarry) return -1;
        if (!a.isCarry && b.isCarry) return 1;
      }
      if (a.canTele && !b.canTele) return -1;
      if (!a.canTele && b.canTele) return 1;
      return a.y - b.y;
    });

    const target = activeTargets[0];
    st.target = target;
    st.targetTitle = `👑 ${target.title} (${target.pName})${target.isTarget ? "" : " [Ngoài DS]"}`;
    st.phaseDesc = `Săn ${target.title}`;

    // Xóa alert nổi nếu có vì Auto đã chủ động tiếp quản
    removeDiBaoAlert();

    const encKey = target.encId + "@" + target.slot;

    // Nếu không đủ chỉ số khảo nghiệm (kể cả khi dùng đan trong túi) và đây là sự kiện khảo nghiệm thuần túy:
    if (!target.canBoostStat && !target.e.bv) {
      auLog(
        `⚠️ Chưa đủ chỉ số khảo nghiệm cho «${target.e.ten}» (${target.statChk.text}). Tạm bỏ qua sự kiện này để tiếp tục săn/tu luyện...`,
        "vk-warn",
      );
      st.skipEnc.add(target.encId);
      st.skipEnc.add(encKey);
      return null;
    }

    // Nếu là giao chiến hộ vệ và tỉ lệ thắng quá thấp:
    const minWr = Number(cfg.minWinRate != null ? cfg.minWinRate : 70);
    if (target.sim && target.sim.winRate < minWr) {
      if (
        activeTargets.length > 1 ||
        !target.isTarget ||
        cfg.cheDoCho !== "stop"
      ) {
        auLog(
          `⚠️ Hộ vệ ${target.e.bv} tại «${target.e.ten}» quá mạnh (Tỉ lệ thắng ${target.sim.winRate}% < ${minWr}%). Tạm bỏ qua sự kiện này để bảo toàn tính mạng...`,
          "vk-warn",
        );
        st.skipEnc.add(target.encId);
        st.skipEnc.add(encKey);
        return null;
      }
      return {
        stop: `Hộ vệ ${target.e.bv} tại «${target.e.ten}» quá mạnh (Tỉ lệ thắng chỉ ${target.sim.winRate}% < ${minWr}%). Dừng để bảo toàn tính mạng!`,
      };
    }

    if (!target.isTarget && st.lastLoggedTarget !== target.relic) {
      st.lastLoggedTarget = target.relic;
      auLog(
        `⚡ Dị Bảo xuất thế: «${target.e.ten}» (${target.title}) tại ${target.pName}! Lập tức ngắt bế quan đi đoạt bảo ngay...`,
        "vk-ok",
      );
    }

    // Đang đứng đúng tại slot sự kiện:
    if (
      String(run.viTri) === String(target.slot) ||
      String(run.oNoi) === String(target.slot)
    ) {
      st.phase = "hunt";
      removeDiBaoAlert();
      showDiBaoMini(
        {
          encId: target.encId,
          slot: target.slot,
          pName: target.pName,
          y: 0,
          remYears: target.remYears,
          title: `«${target.e.ten}» (${target.title})`,
          relic: target.relic,
          relName: target.title,
          evName: target.e.ten,
          isCarry: target.isCarry,
        },
        true,
      );

      st.encAttempts[encKey] = (st.encAttempts[encKey] || 0) + 1;
      if (st.encAttempts[encKey] > 3) {
        auLog(
          `⚠️ Đã thử vào sự kiện «${target.e.ten}» ${st.encAttempts[encKey] - 1} lần nhưng không thể hoàn tất (chưa đủ chỉ số hoặc đối thủ quá mạnh). Tạm thời bỏ qua bảo vật này...`,
          "vk-warn",
        );
        st.skipEnc.add(target.encId);
        st.skipEnc.add(encKey);
        st.tried = 0;
        return null;
      }

      // 1. Tự động kiểm tra & dùng đan bù chỉ số khảo nghiệm (nếu thiếu nhẹ) trước khi kích hoạt sự kiện Dị Bảo
      if (
        target.e &&
        target.e.chk &&
        typeof checkStat === "function" &&
        typeof findStatBoosters === "function" &&
        typeof g.useItem === "function"
      ) {
        try {
          let curNv =
            (G().state && G().state.run && G().state.run.nhanVat) || nv;
          let curChk = checkStat(target.e.chk, curNv);
          if (curChk && !curChk.ok && curChk.key && curChk.req > curChk.cur) {
            const gap = curChk.req - curChk.cur;
            const boosters = findStatBoosters(curChk.key, gap);
            const pills = ((boosters && boosters.bagItems) || []).filter(
              (b) => b.loai === "dan_duoc" && b.val > 0 && b.count > 0,
            );
            let gained = 0;
            for (const pItem of pills) {
              while (gained < gap && curNv.tuiDo && curNv.tuiDo[pItem.id] > 0) {
                const prevVal = checkStat(target.e.chk, curNv).cur;
                const rUse = auCall((gg) => gg.useItem(pItem.id));
                curNv =
                  (G().state && G().state.run && G().state.run.nhanVat) ||
                  curNv;
                const nextVal = checkStat(target.e.chk, curNv).cur;
                if (!rUse.ok || nextVal <= prevVal) break;
                gained += nextVal - prevVal;
                auLog(
                  `💊 Tự động dùng «${pItem.ten}» bù chỉ số khảo nghiệm ${curChk.name}: ${prevVal} ➔ ${nextVal}/${curChk.req}`,
                  "vk-ok",
                );
              }
              if (gained >= gap) break;
            }
          }
        } catch (e) {}
      }
      st.lastThuongThe = (nv && nv.thuongThe) || 0;

      // 2. Tự động Lưu Nhanh trước khi vào sự kiện nếu bật cấu hình
      if (cfg.autoQuickSave && st.savedEnc !== target.encId) {
        st.savedEnc = target.encId;
        try {
          saveQuickSave(`Trước trận Dị Bảo: ${target.title} (${target.pName})`);
          auLog(
            `💾 [Quick Save] Đã tự động chụp bản lưu trước trận «${target.title}» tại ${target.pName}. (Nếu xịt 7%, bạn có thể vào tab [Lưu & Nạp Save] bật 'Tẩy Thiên Cơ' để gieo quẻ mới!).`,
            "vk-ok",
          );
        } catch (e) {}
      }

      auLog(
        `Đã có mặt tại ${target.pName} (Slot ${target.slot}). Tiến vào sự kiện «${target.e.ten}» để đoạt ${target.title}...`,
        "vk-ok",
      );

      // 3. Kích hoạt sự kiện Dị Bảo thông qua enterDiBaoEvent hợp nhất (hỗ trợ cả Node thế giới, Standing địa danh, placeActivities & doAction)
      const resEnter =
        typeof enterDiBaoEvent === "function"
          ? enterDiBaoEvent(target.slot, target.encId)
          : { ok: false, err: "enterDiBaoEvent unavailable" };

      if (resEnter.ok) {
        st.tried = 0;
        return null;
      }

      if (++st.tried >= 3) {
        auLog(
          `⚠️ Không thể mở sự kiện «${target.e.ten}» tại Slot ${target.slot} (${resEnter.err || "không phản hồi"}). Tạm bỏ qua sự kiện này...`,
          "vk-warn",
        );
        st.skipEnc.add(target.encId);
        st.skipEnc.add(encKey);
        st.tried = 0;
        return null;
      }
      return null;
    }

    // Chưa có mặt tại slot: Di chuyển hoặc truyền tống
    // Đảm bảo đóng mọi dialog/encounter/thông báo bế quan cũ trước khi di chuyển
    const curRun = G().state && G().state.run;
    if (curRun) {
      if (
        curRun.active &&
        curRun.active.done &&
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
      if (curRun.longNotice && typeof g.closeLongNotice === "function") {
        try {
          g.closeLongNotice();
        } catch (e) {}
      }
    }

    // 1) Ưu tiên Truyền Tống Trận / Phù nếu bật
    if (cfg.dungTruyenTong !== false && target.canTele) {
      auLog(
        `⚡ Phát hiện Truyền Tống! Truyền tống tức thì tới ${target.pName} (0 năm tuổi thọ)...`,
        "vk-ok",
      );
      const resTele = smartTeleportTo(target.slot);
      if (resTele.ok) {
        auLog(`⚡ Truyền tống thành công tới ${target.pName}!`, "vk-ok");
        return null;
      }
      auLog(
        `Truyền tống không thành công (${resTele.msg}), chuyển sang bay đường bộ...`,
        "vk-mu",
      );
    }

    // 2) Di chuyển đường bộ
    if (target.remYears < target.y) {
      auLog(
        `⚠️ Cảnh báo: Đi bộ tốn ${num(target.y)} năm nhưng sự kiện chỉ còn ${target.remYears} năm! Vẫn cố gắng di chuyển...`,
        "vk-bad",
      );
    }
    auLog(
      `🚀 Bay tới ${target.pName} (Slot ${target.slot}) để đoạt ${target.title} (${safeYrs(target.y)})...`,
      "vk-ok",
    );
    const rTrav = auCall(() => g.travelTo(String(target.slot)));
    const rAfter = G().state && G().state.run;
    if (
      !rTrav.ok ||
      (rAfter &&
        String(rAfter.viTri) !== String(target.slot) &&
        !rAfter.active &&
        !rAfter.tran &&
        !rAfter.bienCo)
    ) {
      if (++st.tried >= 3)
        return {
          stop:
            "Không di chuyển tới vị trí Dị Bảo được: " +
            (rTrav.err || (rAfter && rAfter.thongBao) || "bị chặn"),
        };
      return null;
    }
    st.tried = 0;
    return null;
  }

  // 8. NẾU CHƯA CÓ DỊ BẢO NÀO NỞ TRÊN BẢN ĐỒ:
  const targetEvs = validEvs.filter((e) => targetRelicSet.has(e.relic));
  const unownedCount = targetEvs.filter((e) => !isOwned(e.relic)).length;
  if (unownedCount === 0) {
    const allUnowned = validEvs.filter((e) => !isOwned(e.relic)).length;
    if (allUnowned === 0 || !allowAllSpawns) {
      return {
        stop:
          targetRelicSet.size < validEvs.length
            ? `🎉 Chúc mừng! Bạn đã thu thập trọn vẹn toàn bộ ${targetRelicSet.size} Dị Bảo trong danh sách bạn đã chọn!`
            : "🎉 Chúc mừng! Bạn đã thu thập trọn vẹn toàn bộ 19 Dị Bảo trong game!",
      };
    }
  }

  // Thông báo nếu có Dị Bảo đang nở trên map nhưng bị bỏ qua do người dùng chủ động tắt
  if (!allowAllSpawns && ignoredTargets.length > 0) {
    const firstIgn = ignoredTargets[0];
    const ignRel = DIBAO.rel[firstIgn.ev.relic] || {};
    if (st.lastIgnoredRelic !== firstIgn.ev.relic) {
      st.lastIgnoredRelic = firstIgn.ev.relic;
      auLog(
        `ℹ️ Đang có Dị Bảo «${firstIgn.ev.ten}» (${ignRel.ten || firstIgn.ev.relic}) tại Slot ${firstIgn.slotStr}, nhưng bỏ qua vì ngoài danh sách chọn (bạn đã tắt 'Săn mọi Dị Bảo').`,
        "vk-mu",
      );
    }
  }

  const pity = calcDiBaoPity(run, nv, sc, selectedRelics);

  if (cfg.cheDoCho === "stop") {
    return {
      stop: `Hiện chưa có Dị Bảo mục tiêu nào nở trên bản đồ (Pity: ${pity.waitYears}/500 năm). Hãy đổi Chế Độ Chờ sang 'Cắm Trại & Bế Quan Chờ' trong Cấu Hình để Auto tự bế quan trôi năm chờ Dị Bảo nở.`,
    };
  }

  // Chế độ Cắm Trại & Bế Quan Chờ Dị Bảo (camp):
  st.noRetreatCampSlots = st.noRetreatCampSlots || new Set();
  st.campEnteredSlots = st.campEnteredSlots || new Set();

  // 8.1. Xác định địa điểm cắm trại / tuần tra tối ưu nhất từ danh sách mục tiêu (hỗ trợ cả Dị Bảo biển / bến cảng / hoang dã)
  let targetCampSlot = null;
  let targetCampName = null;
  let targetCampRelic = null;

  if (pity.topCamping && pity.topCamping.length > 0) {
    for (const cp of pity.topCamping) {
      if (!cp.e) continue;
      const candSlots =
        typeof findCandidateSlotsForRelicEv === "function"
          ? findCandidateSlotsForRelicEv(cp.e, c, run)
          : [];
      if (!candSlots.length && (cp.e.marker || cp.e.dia)) {
        const s0 = findSlotByDiaDanh(cp.e.marker, cp.e.dia, c, cp.e);
        if (s0 != null) candSlots.push(String(s0));
      }
      const availSlot = candSlots.find(
        (sl) => sl != null && !st.noRetreatCampSlots.has(String(sl)),
      );
      if (availSlot != null) {
        targetCampSlot = String(availSlot);
        targetCampName =
          placeName(c, targetCampSlot) ||
          cp.e.dia ||
          cp.e.noi ||
          "Slot " + targetCampSlot;
        targetCampRelic = cp.e;
        break;
      }
    }
  }

  const curSlot = run.viTri != null ? String(run.viTri) : "";

  // 8.2. Nếu có địa danh đón đầu / tuần tra cụ thể và chưa có mặt tại đó:
  if (targetCampSlot && curSlot !== targetCampSlot) {
    st.phaseDesc = `Di chuyển tới ${targetCampName} đón đầu Dị Bảo`;
    st.targetTitle = `Đón đầu: ${targetCampName}`;

    // Đóng encounter cũ nếu đang mở trước khi di chuyển
    if (run.active && typeof g.closeEncounter === "function") {
      try {
        g.closeEncounter();
      } catch (e) {}
    }

    // Ưu tiên truyền tống nếu được bật
    if (cfg.dungTruyenTong !== false && checkCanTeleport(targetCampSlot)) {
      auLog(
        `⚡ Phát hiện truyền tống! Truyền tống tức thì tới ${targetCampName} (Slot ${targetCampSlot}) để cắm trại / kiểm tra Dị Bảo...`,
        "vk-ok",
      );
      const resTele = smartTeleportTo(targetCampSlot);
      if (resTele.ok) {
        st.campEnteredSlots.delete(targetCampSlot);
        auLog(`⚡ Truyền tống thành công tới ${targetCampName}!`, "vk-ok");
        return null;
      }
    }

    auLog(
      `🚀 Di chuyển tới ${targetCampName} (Slot ${targetCampSlot}) để kích hoạt cơ duyên & chờ Dị Bảo nở...`,
      "vk-ok",
    );
    const rTrav = auCall(() => g.travelTo(targetCampSlot));
    const rAfterTrav = G().state && G().state.run;
    if (
      !rTrav.ok ||
      (rAfterTrav &&
        String(rAfterTrav.viTri) !== targetCampSlot &&
        !rAfterTrav.active &&
        !rAfterTrav.tran &&
        !rAfterTrav.bienCo)
    ) {
      if (++st.tried >= 3) {
        auLog(
          `⚠️ Không thể di chuyển tới ${targetCampName}: ${rTrav.err || "đường bị chặn"}. Chuyển sang tìm chỗ bế quan an toàn quanh đây...`,
          "vk-bad",
        );
        st.noRetreatCampSlots.add(targetCampSlot);
        targetCampSlot = null; // Bị kẹt đường, fallback sang bế quan thông thường
      } else {
        return null;
      }
    } else {
      st.tried = 0;
      st.campEnteredSlots.delete(targetCampSlot);
      return null;
    }
  }

  // 8.3. Nếu đã tới địa danh đón đầu, tiến vào node (oNoi) để kích hoạt refreshPlaceEncounters và kiểm tra ngay sự kiện Dị Bảo:
  if (
    targetCampSlot &&
    curSlot === targetCampSlot &&
    String(run.oNoi) !== targetCampSlot &&
    !st.campEnteredSlots.has(targetCampSlot)
  ) {
    st.campEnteredSlots.add(targetCampSlot);
    auCall(() => {
      if (typeof g.enterNode === "function") g.enterNode(targetCampSlot);
      else if (typeof g.enterPlace === "function") g.enterPlace(targetCampSlot);
    });
    const rAfterCampEnter = G().state && G().state.run;
    if (rAfterCampEnter && (rAfterCampEnter.active || rAfterCampEnter.tran)) {
      st.tried = 0;
      return null;
    }
    // Quét lại ngay lập tức sau khi enterNode/enterPlace vì refreshPlaceEncounters vừa chạy tại slot này!
    const freshMap = scanMapActiveDiBao(
      rAfterCampEnter || run,
      ctxLite(),
      true,
    );
    if (freshMap && freshMap.size > 0) {
      st.tried = 0;
      return null;
    }
  }

  // 8.4. Kiểm tra xem chỗ hiện tại có bế quan được không
  let hereInfo = null;
  try {
    if (K && K.chuanBiBeQuan) hereInfo = K.chuanBiBeQuan(c);
  } catch (e) {}

  const canRetreatHere =
    hereInfo &&
    !hereInfo.chan &&
    (hereInfo.tuViNam > 0 || (hereInfo.moc && hereInfo.moc.length > 0));

  if (!canRetreatHere) {
    // Ghi nhận slot hiện tại không bế quan được để vòng sau không bay ngược lại gây lặp ping-pong
    if (curSlot) st.noRetreatCampSlots.add(curSlot);
    if (targetCampSlot && targetCampSlot === curSlot) {
      st.noRetreatCampSlots.add(targetCampSlot);
    }

    st.phaseDesc = "Tìm chỗ bế quan an toàn chờ Dị Bảo";
    st.targetTitle = "Chờ Dị Bảo xuất thế";
    const spots = await scanRetreat(c, 5, null);
    if (!spots || !spots.length) {
      return {
        stop:
          "Không tìm thấy địa điểm bế quan an toàn quanh đây để chờ Dị Bảo (" +
          ((hereInfo && hereInfo.chan) || "không bế quan được") +
          "). Hãy di chuyển tới Động Phủ, Môn Phái hoặc Tĩnh Thất rồi chạy lại.",
      };
    }
    const bestSpot = spots[0];
    auLog(
      `Chỗ hiện tại không bế quan được (${(hereInfo && hereInfo.chan) || "không hợp lệ"}). Di chuyển tới ${bestSpot.info.ten || "chỗ bế quan"} (${bestSpot.y.toFixed(1)} năm đường) để bế quan...`,
      "vk-mu",
    );
    const rGo = auCall(() => g.travelTo(String(bestSpot.slot)));
    if (!rGo.ok) {
      if (++st.tried >= 3)
        return {
          stop: "Không di chuyển tới chỗ bế quan được: " + rGo.err,
        };
      return null;
    }
    st.tried = 0;
    return null;
  }

  // 8.5. Đã ở chỗ bế quan hợp lệ (Tại đúng di tích cắm trại hoặc động phủ/môn phái):
  const maxCanSit = Math.floor(life - minTho);
  if (maxCanSit <= 0) {
    return {
      stop:
        "Thọ nguyên chỉ còn " +
        Math.floor(life) +
        " năm (dưới ngưỡng an toàn " +
        minTho +
        " năm). Dừng bế quan để bảo toàn tính mạng!",
    };
  }

  let sitYears = pity.waitYears >= 450 ? 1 : Math.min(3, maxCanSit);
  if (hereInfo && Array.isArray(hereInfo.moc) && hereInfo.moc.length > 0) {
    const validMocs = hereInfo.moc.filter(
      (m) => m <= (pity.waitYears >= 450 ? 1 : Math.min(5, maxCanSit)),
    );
    if (validMocs.length > 0) sitYears = validMocs[validMocs.length - 1];
    else sitYears = Math.min(hereInfo.moc[0], maxCanSit);
  }
  if (sitYears <= 0) sitYears = 1;

  const placeDesc = targetCampName || hereInfo.ten || "nơi an toàn";
  st.targetTitle = targetCampRelic
    ? `Đón đầu «${targetCampRelic.ten}»`
    : "Chờ Dị Bảo xuất thế";
  st.phaseDesc = `Bế quan cắm trại tại ${placeDesc}`;

  // Chỉ ghi log khi mới bắt đầu cắm trại hoặc đổi địa điểm, tránh spam log làm chậm game
  if (st.lastCampPlace !== placeDesc) {
    st.lastCampPlace = placeDesc;
    auLog(
      `Bắt đầu cắm trại & bế quan tại ${placeDesc} để tăng tu vi và đón đầu Dị Bảo...`,
      "vk-mu",
    );
  }

  const namTruoc = run.nam;
  const rSit = auCall(() => {
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
    if (rRun && rRun.longNotice && typeof g.closeLongNotice === "function") {
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
    g.nhapDinh({
      nam: sitYears,
      untilExhausted: false,
      dan: [],
      autoBreak: [],
    });
    const rAfter = G().state && G().state.run;
    if (
      rAfter &&
      rAfter.active &&
      (rAfter.active.done ||
        (rAfter.active.waiting &&
          (rAfter.active.waiting.kind === "be_quan" ||
            rAfter.active.waiting === "be_quan"))) &&
      typeof g.closeEncounter === "function"
    ) {
      try {
        g.closeEncounter();
      } catch (e) {}
    }
    if (rAfter && rAfter.thongBao && typeof g.dongThongBao === "function") {
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
  if (!rSit.ok) {
    if (++st.tried < 2) {
      return null;
    }
    return {
      stop: "Không nhập định được: " + (rSit.err || "chỗ này bị cản trở"),
    };
  }
  st.tried = 0;

  const namSau = G().state && G().state.run ? G().state.run.nam : namTruoc;
  const deltaY = Math.max(0, namSau - namTruoc);
  st.retreatYearsDone = (st.retreatYearsDone || 0) + deltaY;
  st.patrolRetreatCount = (st.patrolRetreatCount || 0) + 1;

  // Sau khi đã bế quan trôi năm (đặc biệt khi Pity >= 450 hoặc mỗi 2 chu kỳ bế quan),
  // xóa danh sách tạm khóa noRetreatCampSlots & campEnteredSlots để Auto bay tới tuần tra / kích hoạt refreshPlaceEncounters tại điểm Dị Bảo mục tiêu!
  const nextWait = (pity.waitYears || 0) + deltaY;
  if (
    (nextWait >= 450 && st.patrolRetreatCount >= 1) ||
    st.patrolRetreatCount >= 2
  ) {
    st.patrolRetreatCount = 0;
    if (st.noRetreatCampSlots) st.noRetreatCampSlots.clear();
    if (st.campEnteredSlots) st.campEnteredSlots.clear();
  }
  return null;
}

export { auSdbStep };

Object.assign(gWin, {
  auSdbStep,
});
