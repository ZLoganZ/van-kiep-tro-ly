/**
 * Module: Siêu AI Tác Chiến 3.0 (5-Phase Tactical Engine), HUD Chiến Đấu & Vòng Lặp Auto
 */
// ═════════ SIÊU AI TÁC CHIẾN VIP (THAY THẾ AUTO LỎ CỦA GAME) ═════════
// Khắc phục triệt để các lỗi của AI game:
// 1. Dùng đan dược chuẩn xác: nhận diện đúng đan hồi huyết (tran.khi_huyet), đan hồi linh lực (tran.linh_luc),
//    đan bộc phát (tran.bao_phat), tính đúng dược kháng thực tế và nuốt nhiều viên (so: n) nếu nguy kịch.
// 2. Tận dụng triệt để Quyền Cước (danh_thuong): luôn đánh thường mỗi lượt miễn phí 0 linh lực,
//    dứt điểm quái yếu không tốn mana, dệt đòn đánh thường mượt mà sau khi kích hoạt buff.
// 3. Sửa lỗi nhắm mục tiêu: tự động chuyển mục tiêu khi quái hiện tại chết, không bị kẹt hay bắn trượt.
// 4. Dự báo bật bùa hộ thuẫn / bùa trói chuẩn xác (loai: phu_luc).
// 5. Kiểm tra chiêu qua S.core.chanChieu hoặc bộ lọc toàn diện để không bao giờ bị lỗi ngắt lượt giữa chừng.
// ═════════ CHIẾN LƯỢC TÁC CHIẾN TỰ ĐỘNG THÔNG MINH (SMART COMBAT AI) ═════════
// 1. Tận dụng trực tiếp AI lõi game (core/combat/playerAutomation.nextAutomatedAction) khi có sẵn.
// 2. Dự phòng toàn diện 100% không bỏ sót chiêu: Phân bổ thứ tự tung chiêu ưu tiên tuyệt đối cho
//    Kỹ năng (Vạn Kiếm Quy Tông, Trảm Tiên Kiếm, Chiêu Bản Mệnh, Bẩm Sinh, Buff, Thuẫn, Khống Chế).
// 3. TUYỆT ĐỐI không đánh thường (danh_thuong) trước khi toàn bộ chiêu thức khả dụng đã được tung hết.
// 4. Sửa cơ chế vòng lặp tác chiến (auFightInstant & auFightStep): khi một hành động thất bại, tiếp tục
//    thử các chiêu kế tiếp trong danh sách thay vì lập tức vội vã đánh thường rồi kết lượt bỏ cuộc.
// Biến lưu quyết định chiến thuật gần nhất của AI để hiển thị trực tiếp trên HUD trong trận
let _lastAiDecisionText = "Sẵn sàng tác chiến";
let _lastAiActionCount = 0;

function setAiDecision(txt) {
  _lastAiDecisionText = txt || "Đang phân tích…";
  _lastAiActionCount++;
  try {
    const el =
      combatOverlayEl &&
      combatOverlayEl.querySelector("#vkx-combat-last-act");
    if (el) el.textContent = "🤖 " + _lastAiDecisionText;
  } catch (e) {}
}

// Ước tính sát thương thực tế của 1 chiêu lên mục tiêu (xét Pháp Lực, Khắc Hệ Ngũ Hành, Bộc Phát, Phá Giáp/Ấn Ký)
function estimateSkillDamage(ta, target, c, core) {
  if (!c || !ta || !target) return 0;
  const basePl = Math.max(15, ta.phapLuc || ta.cong || 25);
  let dmg = c.uyLuc || (c.uy || 0) * basePl * 0.45;
  if (dmg <= 0 && (c.uy || 0) > 0) dmg = c.uy * 12;

  const heSoHeFn =
    (core && core["combat/actions"] && core["combat/actions"].heSoHe) ||
    (core && core.heSoHe);
  const heTacDongFn =
    (core &&
      core["combat/elements"] &&
      core["combat/elements"].heTacDong) ||
    (core && core.heTacDong) ||
    heTacDong;

  if (c.he && target.he) {
    let applied = false;
    if (typeof heSoHeFn === "function") {
      try {
        const m = heSoHeFn(c.he, target);
        if (Number.isFinite(m) && m > 0) {
          dmg *= m;
          applied = true;
        }
      } catch (e) {}
    }
    if (!applied && typeof heTacDongFn === "function") {
      try {
        const fHe = Array.isArray(target.he) ? target.he[0] : target.he;
        const sHe = Array.isArray(c.he) ? c.he[0] : c.he;
        const rel = heTacDongFn(sHe, fHe);
        if (rel === -1 || KHAC_HE[gocHe(sHe)] === gocHe(fHe))
          dmg *= 1.35;
        else if (rel === 1 || KHAC_HE[gocHe(fHe)] === gocHe(sHe))
          dmg *= 0.75;
      } catch (e) {}
    }
  }

  if (ta.bocPhatDen || ta.bocPhatTuDan) dmg *= 1.45;
  if (
    target.phaGiap ||
    target.suyYeu ||
    (Array.isArray(target.statuses) &&
      target.statuses.some((s) => s.kind === "sunder"))
  ) {
    dmg *= 1.25;
  }
  if (target.hoThe && target.hoThe > 0) {
    dmg *= Math.max(0.25, 1 - Math.min(0.7, target.hoThe));
  }
  return Math.round(dmg);
}

// Nhận diện kỹ năng diện rộng (AoE)
function isAoESkill(c) {
  if (!c) return false;
  if (c.scope === "all" || c.scope === "spread" || c.daMucTieu)
    return true;
  return /vạn kiếm|quần|trận|mưa|bão|tất cả|toàn bộ|lan|liên hoàn/i.test(
    (c.ten || "") + " " + (c.mo_ta || ""),
  );
}

// Nhận diện kỹ năng Phá Giáp / Ấn Ký / Giảm Thủ
function isSunderOrMarkSkill(c) {
  if (!c) return false;
  return (
    /phá giáp|xuyên|phá khiên|phá thuẫn|trừ thuẫn|ấn ký|suy yếu|lộ sơ hở|huyết ấn|kiếm ấn|ăn mòn/i.test(
      c.ten || "",
    ) ||
    (Array.isArray(c.effects) &&
      c.effects.some((e) =>
        [
          "sunder",
          "mark",
          "decay",
          "chill",
          "bleed",
          "poison",
        ].includes(e.kind),
      )) ||
    !!(c.phaGiap || c.sunder || c.mark)
  );
}

// ═════════ SIÊU AI TÁC CHIẾN 3.0 (5-PHASE TACTICAL ENGINE) ═════════
function smartCombatAction(tran, Cc, cfg, failedActions) {
  cfg = cfg || (AU && AU.cfg && AU.cfg.tc) || {};
  failedActions = failedActions || new Set();
  const ta = tran && tran.ta;
  if (!ta) return null;
  const dich = (tran && tran.dich) || [];
  if (!dich.length) return null;

  const core =
    (S && S.core) || (typeof TT !== "undefined" && TT && TT.core);
  const aiMode = cfg.aiEngineMode || "smart_v3";
  const itemPolicy = cfg.itemPolicy || "auto"; // "auto" | "boss_only" | "save_all"
  const curRound = tran.hiep || 1;

  // 0. Nếu người chơi chọn ủy quyền 100% cho AI gốc của game ("game_core")
  if (aiMode === "game_core") {
    const autoFn =
      (core &&
        core["combat/playerAutomation"] &&
        core["combat/playerAutomation"].nextAutomatedAction) ||
      (core && core.nextAutomatedAction);
    if (typeof autoFn === "function") {
      try {
        const cand = autoFn(tran, Cc, {
          enabled: true,
          autoEndTurn: false,
          usePills: itemPolicy !== "save_all",
          useTalismans: itemPolicy !== "save_all",
          stackShields: true,
          useInnate: true,
          skillPriority: [],
          recallFamiliarBelow:
            cfg.saveFamiliars !== false
              ? (cfg.recallPetHp || 25) / 100
              : 0,
          healBelow: (cfg.healHpThreshold || 35) / 100,
          spiritBelow: (cfg.spiritThreshold || 20) / 100,
          maxGrade: cfg.maxPillGrade || 6,
        });
        if (cand) {
          setAiDecision("AI Game: " + (cand.loai || "hành động"));
          return cand;
        }
      } catch (e) {}
    }
  }

  // 1. CHỌN MỤC TIÊU CHIẾN THUẬT (Targeting & Retargeting 3.0)
  const liveFoes = dich.filter((d) => (d.khiHuyet || 0) > 0);
  if (!liveFoes.length) {
    setAiDecision("Kết lượt (Địch đã hạ)");
    return { loai: "ket_luot" };
  }

  const isBossOrElite = liveFoes.some(
    (d) =>
      d.muc === "boss" ||
      d.muc === "tinh_anh" ||
      (d.bac || 0) > (ta.bac || 0) ||
      (d.khiHuyetToiDa || 0) >= (ta.khiHuyetToiDa || 0) * 1.35 ||
      (d.apBac || 0) > (ta.apBac || 0) ||
      /tâm ma|hộ vệ|thủ lĩnh|trưởng lão|yêu vương|ma tôn/i.test(
        d.ten || "",
      ),
  );

  let target = liveFoes.find((d) => d.ma === tran.mucTieu);
  const prio = cfg.targetPrio || "smart";
  const heTacDongFn =
    (core &&
      core["combat/elements"] &&
      core["combat/elements"].heTacDong) ||
    (core && core.heTacDong) ||
    heTacDong;

  if (liveFoes.length > 1) {
    const scoreFoe = (d) => {
      let score = 0;
      const hp = d.khiHuyet || 0;
      const maxHp = Math.max(1, d.khiHuyetToiDa || 1);
      const shield = (d.hoThuan || 0) + (d.thuanPhu || 0);
      const effHp = hp + shield;
      const hpPct = hp / maxHp;
      const intent = d.yDinh || "";
      const isNuking =
        /sat_chieu|dai_chieu|nộ|tram|nuke|no_kich|tuyệt|hủy diệt/i.test(
          intent,
        ) ||
        (d.anTuc === 0 && d.linhLuc && d.linhLuc > 28);
      const isHealerOrSummoner =
        /hồi|trị|triệu hồi|hộ pháp|tế tự|dược/i.test(
          (d.ten || "") + " " + intent,
        );

      if (prio === "boss") {
        if (d.muc === "boss") score += 1200;
        else if (d.muc === "tinh_anh") score += 600;
        score += (1 - hpPct) * 120;
      } else if (prio === "threat") {
        if (isNuking) score += 900;
        if (isHealerOrSummoner) score += 650;
        if (d.muc === "boss") score += 350;
        score += (1 - hpPct) * 150;
      } else if (prio === "weakest") {
        score += (1 - hpPct) * 600;
        score += Math.max(0, 1200 - effHp);
      } else if (prio === "counter") {
        if (d.he && ta.chieu) {
          for (const c of ta.chieu) {
            if (c && c.he && typeof heTacDongFn === "function") {
              const fHe = Array.isArray(d.he) ? d.he[0] : d.he;
              const sHe = Array.isArray(c.he) ? c.he[0] : c.he;
              if (
                heTacDongFn(sHe, fHe) === -1 ||
                KHAC_HE[gocHe(sHe)] === gocHe(fHe)
              ) {
                score += 260;
              }
            }
          }
        }
        score += (1 - hpPct) * 120;
      } else {
        // "smart": Tối ưu giảm sát thương nhận vào mỗi hiệp (Focus Fire mục tiêu sắp hạ gục + kẻ chuẩn bị Nuke/Hồi máu)
        if (effHp <= Math.max(35, (ta.phapLuc || ta.cong || 25) * 1.4))
          score += 480;
        else if (hpPct < 0.25) score += 320;
        if (isHealerOrSummoner) score += 310;
        if (isNuking) score += 270;
        if (d.muc === "boss") score += 210;
        else if (d.muc === "tinh_anh") score += 110;
        if (d.he && ta.chieu) {
          for (const c of ta.chieu) {
            if (c && c.he && typeof heTacDongFn === "function") {
              const fHe = Array.isArray(d.he) ? d.he[0] : d.he;
              const sHe = Array.isArray(c.he) ? c.he[0] : c.he;
              if (
                heTacDongFn(sHe, fHe) === -1 ||
                KHAC_HE[gocHe(sHe)] === gocHe(fHe)
              ) {
                score += 65;
                break;
              }
            }
          }
        }
        score += (1 - hpPct) * 80;
      }
      return score;
    };

    const sortedFoes = [...liveFoes].sort(
      (a, b) => scoreFoe(b) - scoreFoe(a),
    );
    const bestFoe = sortedFoes[0];

    if (!target) {
      if (bestFoe && !failedActions.has("muc_tieu:" + bestFoe.ma)) {
        setAiDecision("Nhắm mục tiêu: " + (bestFoe.ten || bestFoe.ma));
        return { loai: "muc_tieu", ma: bestFoe.ma };
      }
      target = bestFoe;
    } else if (
      bestFoe &&
      bestFoe.ma !== target.ma &&
      scoreFoe(bestFoe) >= scoreFoe(target) + 130 &&
      !failedActions.has("muc_tieu:" + bestFoe.ma)
    ) {
      setAiDecision("Chuyển mục tiêu: " + (bestFoe.ten || bestFoe.ma));
      return { loai: "muc_tieu", ma: bestFoe.ma };
    }
  }

  if (!target) {
    const nextTarget = liveFoes[0];
    if (nextTarget && !failedActions.has("muc_tieu:" + nextTarget.ma)) {
      setAiDecision(
        "Nhắm mục tiêu: " + (nextTarget.ten || nextTarget.ma),
      );
      return { loai: "muc_tieu", ma: nextTarget.ma };
    }
    target = nextTarget;
  }

  // Thông số tình huống trận đấu hiện tại
  const hpRatio =
    (ta.khiHuyet || 0) / Math.max(1, ta.khiHuyetToiDa || 1);
  const mpRatio = (ta.linhLuc || 0) / Math.max(1, ta.linhLucToiDa || 1);
  const curShield = (ta.hoThuan || 0) + (ta.thuanPhu || 0);
  const shieldRatio = curShield / Math.max(1, ta.khiHuyetToiDa || 1);
  const targetShield = (target.hoThuan || 0) + (target.thuanPhu || 0);
  const targetEffHp = (target.khiHuyet || 0) + targetShield;
  const foeIntent = target.yDinh || "";
  const isHeavyAttackIncoming = liveFoes.some((d) => {
    const itn = d.yDinh || "";
    return (
      /sat_chieu|dai_chieu|nộ|tram|nuke|no_kich|tuyệt|phá thiên/i.test(
        itn,
      ) ||
      (d.anTuc === 0 && (d.linhLuc || 0) > 28)
    );
  });

  // Kiểm tra điều kiện dùng vật phẩm theo chính sách itemPolicy & giới hạn phẩm Quái Thường vs Boss
  const itemsUsed = ta.itemsThisTurn || 0;
  const allowConsumeItems =
    itemPolicy === "save_all"
      ? false
      : itemPolicy === "boss_only"
        ? isBossOrElite || hpRatio < 0.2
        : true;
  const canUseItem = allowConsumeItems && itemsUsed < 10 && !!ta.tui;

  const effMaxPillGrade = isBossOrElite
    ? cfg.maxPillGrade || 6
    : Math.min(
        cfg.maxPillGrade || 6,
        cfg.maxPillGradeNormal != null ? cfg.maxPillGradeNormal : 4,
      );
  const effMaxTalismanGrade = isBossOrElite
    ? cfg.talismanGrade || 6
    : Math.min(
        cfg.talismanGrade || 6,
        cfg.talismanGradeNormal != null ? cfg.talismanGradeNormal : 4,
      );

  const chanDungDoFn =
    (core &&
      core["combat/actions"] &&
      core["combat/actions"].chanDungDo) ||
    (core && core.chanDungDo);
  const canUseBagItem = (it) => {
    if (!it || !ta.tui || !(ta.tui[it.id] > 0)) return false;
    if (failedActions.has("dan:" + it.id)) return false;
    if (typeof chanDungDoFn === "function") {
      try {
        if (chanDungDoFn(tran, it) !== undefined) return false;
      } catch (e) {}
    }
    return true;
  };

  // ═══════════════════════════════════════════════════════════════════
  // PHA 1: SINH TỒN KHẨN CẤP (THU HỒI NGỰ LINH · THOÁT HIỂM · ĐAN MÁU · HỒI PHỤC KHẨN)
  // ═══════════════════════════════════════════════════════════════════

  // 1A. Thu hồi Ngự Linh hấp hối
  const recallThreshold =
    (cfg.recallPetHp != null ? cfg.recallPetHp : 25) / 100;
  if (cfg.saveFamiliars !== false && Array.isArray(tran.familiars)) {
    for (const fam of tran.familiars) {
      if (
        fam &&
        (fam.trenSan || !fam.thuHoi) &&
        fam.khiHuyet &&
        fam.khiHuyetToiDa
      ) {
        const petHpRatio = fam.khiHuyet / fam.khiHuyetToiDa;
        if (
          petHpRatio < recallThreshold &&
          !failedActions.has("thu_hoi:" + fam.id)
        ) {
          setAiDecision(
            "Thu hồi Ngự Linh (" +
              Math.round(petHpRatio * 100) +
              "% HP)",
          );
          return { loai: "thu_hoi", id: fam.id };
        }
      }
    }
  }

  // 1B. Độn Thổ Thoát Thân Khẩn Cấp (bo_chay)
  const escapeHpRatio =
    (cfg.escapeHp != null ? cfg.escapeHp : 16) / 100;
  if (
    cfg.emergencyEscape &&
    hpRatio < escapeHpRatio &&
    !failedActions.has("bo_chay")
  ) {
    const escapeBlockFn =
      (core &&
        core["combat/actions"] &&
        core["combat/actions"].escapeBlock) ||
      (core && core.escapeBlock);
    const escapeRealmBlockFn =
      (core &&
        core["combat/actions"] &&
        core["combat/actions"].escapeRealmBlock) ||
      (core && core.escapeRealmBlock);
    const canEscape =
      (!escapeBlockFn || escapeBlockFn(tran) === undefined) &&
      (!escapeRealmBlockFn || escapeRealmBlockFn(tran) === undefined);

    if (canEscape) {
      let escapeTalisman = null;
      if (ta.tui) {
        for (const [id, count] of Object.entries(ta.tui)) {
          if (!count || count <= 0) continue;
          const it = Cc.items && Cc.items.get(id);
          if (it && it.tran && it.tran.bo_chay) {
            escapeTalisman = it;
            break;
          }
        }
      }
      setAiDecision(
        "Thoát hiểm khẩn cấp (HP " + Math.round(hpRatio * 100) + "%)",
      );
      if (escapeTalisman) {
        return { loai: "bo_chay", item: escapeTalisman.id };
      }
      return { loai: "bo_chay", gia: "huyet_don" };
    }
  }

  // 1C. Thiêu Đốt Thọ Nguyên Cứu Mạng (thieu_dot)
  const thieuDotHpRatio =
    (cfg.thieuDotHp != null ? cfg.thieuDotHp : 20) / 100;
  if (
    cfg.emergencyThieuDot !== false &&
    hpRatio < thieuDotHpRatio &&
    !ta.thieuDot &&
    !failedActions.has("thieu_dot")
  ) {
    const chanThieuDotFn =
      (core &&
        core["combat/actions"] &&
        core["combat/actions"].chanThieuDot) ||
      (core && core.chanThieuDot);
    if (typeof chanThieuDotFn === "function") {
      try {
        if (chanThieuDotFn(tran) === undefined) {
          setAiDecision(
            "🔥 Thiêu đốt thọ nguyên lật kèo (HP " +
              Math.round(hpRatio * 100) +
              "%)",
          );
          return { loai: "thieu_dot" };
        }
      } catch (e) {}
    }
  }

  // 1D. Cắn Đan Hồi Huyết Thông Minh (Smart Heal Pill 3.0)
  const healPillMode = cfg.healPillMode || "smart";
  const baseHealHpRatio =
    (cfg.healHpThreshold != null ? cfg.healHpThreshold : 35) / 100;
  const panicHealHpRatio =
    (cfg.healBossPanicHp != null ? cfg.healBossPanicHp : 55) / 100;
  const effectiveHealThreshold =
    healPillMode === "smart" &&
    (isHeavyAttackIncoming || (isBossOrElite && curShield <= 0))
      ? Math.max(baseHealHpRatio, panicHealHpRatio)
      : baseHealHpRatio;

  const retention = ta.drugRetention != null ? ta.drugRetention : 0.85;
  const curResistExp =
    (ta.drugResistTran && ta.drugResistTran["khi_huyet"]) || 0;
  const curResistPct = Math.round(
    (1 - Math.pow(retention, curResistExp)) * 100,
  );
  const maxResist =
    cfg.maxDrugResistance != null ? cfg.maxDrugResistance : 70;
  const allowByMode =
    healPillMode === "off"
      ? false
      : healPillMode === "boss_only"
        ? isBossOrElite || hpRatio < 0.18
        : true;
  const allowHealPill =
    allowByMode && (hpRatio < 0.2 || curResistPct <= maxResist);

  if (
    canUseItem &&
    !ta.danLuotNay &&
    hpRatio < effectiveHealThreshold &&
    allowHealPill
  ) {
    const missingHp = Math.max(1, ta.khiHuyetToiDa - ta.khiHuyet);
    // Nếu nguy kịch (< 20% HP), cho phép mở khóa lên tới maxPillGrade của Boss để giữ mạng!
    const pillCap =
      hpRatio < 0.2 ? cfg.maxPillGrade || 6 : effMaxPillGrade;
    let bestPill = null;
    let bestScore = Infinity;
    let bestCount = 1;

    const pillWastedFn =
      (core &&
        core["combat/actions"] &&
        core["combat/actions"].pillWasted) ||
      (core && core.pillWasted);
    const estPillFn =
      (core &&
        core["combat/actions"] &&
        core["combat/actions"].estimatePillRestore) ||
      (core && core.estimatePillRestore);

    for (const [id, count] of Object.entries(ta.tui)) {
      if (!count || count <= 0) continue;
      const it = Cc.items && Cc.items.get(id);
      if (!it || it.loai !== "dan_duoc" || !it.tran) continue;
      if (it.tran.bo_chay) continue;
      if ((it.pham_cap || 1) > pillCap) continue;
      if (!(it.tran.khi_huyet && it.tran.khi_huyet > 0)) continue;
      if (!canUseBagItem(it)) continue;

      if (typeof pillWastedFn === "function" && hpRatio > 0.25) {
        try {
          if (pillWastedFn(ta, it)) continue;
        } catch (e) {}
      }

      let estOne = 0;
      if (typeof estPillFn === "function") {
        try {
          estOne = estPillFn(ta, it).khiHuyet;
        } catch (e) {}
      }
      if (!estOne || estOne <= 0) {
        const eff = Math.pow(retention, curResistExp);
        estOne = Math.round(ta.khiHuyetToiDa * it.tran.khi_huyet * eff);
      }
      if (estOne <= 0) estOne = 1;

      const neededCount = Math.min(
        count,
        Math.max(1, Math.min(3, Math.ceil((missingHp * 0.9) / estOne))),
      );
      const totalEst = estOne * neededCount;
      const overheal = Math.max(0, totalEst - missingHp);
      const underheal = Math.max(0, missingHp - totalEst);
      const score =
        underheal * 1.1 +
        overheal * 0.65 +
        (it.pham_cap || 1) * (isBossOrElite ? 18 : 45);

      if (score < bestScore) {
        bestScore = score;
        bestPill = it;
        bestCount = neededCount;
      }
    }

    if (bestPill) {
      setAiDecision(
        `💊 Cắn ${bestPill.ten || bestPill.id} ×${bestCount} (HP ${Math.round(hpRatio * 100)}%)`,
      );
      return { loai: "dan", item: bestPill.id, so: bestCount };
    }
  }

  // 1E. Đan Giải Độc / Thanh Tâm / Hộ Thể Đan khi trúng nhiều tầng hiệu ứng xấu hoặc sắp bị Nuke
  if (canUseItem && !ta.danLuotNay && cfg.cleansePillMode !== false) {
    const badStatuses = Array.isArray(ta.statuses)
      ? ta.statuses.filter((s) =>
          [
            "bleed",
            "poison",
            "burn",
            "decay",
            "chill",
            "sunder",
          ].includes(s.kind),
        )
      : [];
    const needCleanse =
      badStatuses.length >= 2 ||
      (badStatuses.length >= 1 && hpRatio < 0.5);
    const needPillShield =
      isHeavyAttackIncoming && shieldRatio < 0.2 && hpRatio < 0.65;

    if (needCleanse || needPillShield) {
      for (const [id, count] of Object.entries(ta.tui)) {
        if (!count || count <= 0) continue;
        const it = Cc.items && Cc.items.get(id);
        if (!it || it.loai !== "dan_duoc" || !it.tran) continue;
        if ((it.pham_cap || 1) > effMaxPillGrade) continue;
        if (!canUseBagItem(it)) continue;
        if (
          (needCleanse && (it.tran.giai_doc || it.tran.thanh_tam)) ||
          (needPillShield && it.tran.thuan && it.tran.thuan > 0)
        ) {
          setAiDecision(
            `💊 Dùng ${it.ten || it.id} (Hộ thân/Giải độc)`,
          );
          return { loai: "dan", item: it.id, so: 1 };
        }
      }
    }
  }

  // Chuẩn bị danh sách Kỹ Năng Khả Dụng (Usable Skills)
  const skills = ta.chieu || [];
  const chanChieuFn =
    (core &&
      core["combat/actions"] &&
      core["combat/actions"].chanChieu) ||
    (core && core.chanChieu);

  const teHuyetMode = cfg.teHuyetMode || "off";
  const canUseBloodSacrifice = (c) => {
    if (!c.bloodYears) return true;
    if (ta.khiHuyet < ta.khiHuyetToiDa * 0.18) return false;
    if (teHuyetMode === "off") return false;
    if (teHuyetMode === "boss") return isBossOrElite;
    if (teHuyetMode === "emergency")
      return hpRatio < 0.35 && (isBossOrElite || liveFoes.length > 0);
    if (teHuyetMode === "always") return true;
    return false;
  };

  const usableSkills = skills.filter((c) => {
    if (!c || !c.id) return false;
    if (failedActions.has("chieu:" + c.id)) return false;
    if (c.bloodYears && !canUseBloodSacrifice(c)) return false;
    if (typeof chanChieuFn === "function") {
      try {
        if (chanChieuFn(tran, c) !== undefined) return false;
      } catch (e) {}
    } else {
      if (ta.hoi && (ta.hoi[c.id] ?? 0) > curRound) return false;
      if ((c.phi || 0) > (ta.linhLuc || 0)) return false;
      if (c.natal && (ta.natalBrokenUntil || 0) >= curRound)
        return false;
      if (
        c.lenh &&
        (!tran.familiars || !tran.familiars.some((f) => f.trenSan))
      )
        return false;
    }
    return true;
  });

  // 1F. Hồi Phục Khẩn Cấp Bằng Kỹ Năng (khi HP < 55% hoặc chế độ Thủ)
  const healSkillRatio =
    (cfg.healSkillThreshold != null ? cfg.healSkillThreshold : 75) /
    100;
  const urgentHealRatio =
    aiMode === "defensive"
      ? Math.max(0.65, healSkillRatio)
      : Math.min(0.55, healSkillRatio);
  if (usableSkills.length > 0 && hpRatio < urgentHealRatio) {
    const healSkill = usableSkills.find(
      (c) =>
        c.dang === "hoi_phuc" ||
        /hồi xuân|trị thương|sinh cơ|trường sinh|hồi huyết/i.test(
          c.ten || "",
        ),
    );
    if (healSkill) {
      setAiDecision(
        `💚 Chiêu hồi phục: ${healSkill.ten || healSkill.id}`,
      );
      return { loai: "chieu", id: healSkill.id };
    }
  }

  // 1G. Dựng Khiên Kỹ Năng / Phù Hộ Thuẫn Dự Báo Đỡ Đòn
  const shieldSkillRatio =
    (cfg.shieldSkillThreshold != null ? cfg.shieldSkillThreshold : 40) /
    100;
  const needUrgentShield =
    isHeavyAttackIncoming || hpRatio < 0.5 || aiMode === "defensive";
  if (
    usableSkills.length > 0 &&
    needUrgentShield &&
    shieldRatio < shieldSkillRatio
  ) {
    const shieldSkill = usableSkills.find(
      (c) =>
        c.dang === "thu" ||
        /khiên|thuẫn|hộ thể|bảo mệnh|quy giáp|kim chung/i.test(
          c.ten || "",
        ),
    );
    if (shieldSkill) {
      setAiDecision(
        `🛡️ Dựng khiên: ${shieldSkill.ten || shieldSkill.id}`,
      );
      return { loai: "chieu", id: shieldSkill.id };
    }
  }

  // Dán Phù Hộ Thuẫn theo shieldTalismanMode
  const shieldTalMode =
    cfg.shieldTalismanMode ||
    (cfg.smartShield === false ? "off" : "predictive");
  const shieldHpTrig =
    (cfg.shieldHpThreshold != null ? cfg.shieldHpThreshold : 55) / 100;
  const shouldUseShieldTalisman =
    shieldTalMode === "off"
      ? false
      : shieldTalMode === "boss_only"
        ? isBossOrElite &&
          (isHeavyAttackIncoming || hpRatio < shieldHpTrig) &&
          shieldRatio < 0.3
        : shieldTalMode === "always_keep"
          ? shieldRatio < 0.12
          : (isHeavyAttackIncoming && shieldRatio < 0.3) ||
            (hpRatio < shieldHpTrig && shieldRatio < 0.15);

  if (canUseItem && shouldUseShieldTalisman) {
    let bestShieldTal = null;
    for (const [id, count] of Object.entries(ta.tui)) {
      if (!count || count <= 0) continue;
      const it = Cc.items && Cc.items.get(id);
      if (!it || it.loai !== "phu_luc" || !it.tran) continue;
      if ((it.pham_cap || 1) > effMaxTalismanGrade) continue;
      if (!(it.tran.thuan && it.tran.thuan > 0)) continue;
      if (!canUseBagItem(it)) continue;
      if (
        !bestShieldTal ||
        (it.pham_cap || 1) > (bestShieldTal.pham_cap || 1)
      ) {
        bestShieldTal = it;
      }
    }
    if (bestShieldTal) {
      setAiDecision(
        `🛡️ Dán phù thuẫn: ${bestShieldTal.ten || bestShieldTal.id}`,
      );
      return { loai: "dan", item: bestShieldTal.id, so: 1 };
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // PHA 2: DỨT ĐIỂM NHANH CHỐNG TRÀN SÁT THƯƠNG (SMART EXECUTE) & KHỐNG CHẾ NGẮT CHIÊU
  // ═══════════════════════════════════════════════════════════════════

  // 2A. Dứt điểm 0 Mana bằng Quyền Cước nếu mục tiêu không có khiên và máu nằm gọn trong 1 đòn đánh thường
  const estBasicDmg = Math.max(
    22,
    Math.round((ta.cong || ta.phapLuc * 0.35 || 20) * 0.85),
  );
  if (
    cfg.smartFinisher !== false &&
    !ta.daDanhThuong &&
    !failedActions.has("danh_thuong") &&
    targetShield <= 0 &&
    (target.khiHuyet || 0) > 0 &&
    (target.khiHuyet || 0) <= estBasicDmg
  ) {
    setAiDecision("👊 Quyền Cước kết liễu (Tiết kiệm 100% mana)");
    return { loai: "danh_thuong" };
  }

  // 2B. Khống Chế Ngắt Nộ (Kỹ Năng Khống Chế & Phù Khống Chế)
  const isImmune =
    (target.controlImmunity && target.controlImmunity > 0) ||
    (target.mienDen && target.mienDen >= curRound);
  const targetAlreadyCC = !!target.khongChe;

  if (!isImmune && !targetAlreadyCC && cfg.smartCc !== false) {
    // Ưu tiên 1: Kỹ năng Khống Chế (0 tốn phù)
    if (usableSkills.length > 0) {
      const ccSkill = usableSkills.find(
        (c) =>
          c.dang === "khong_che" ||
          (c.controlChance && c.controlChance > 0) ||
          (c.controlTurns && c.controlTurns > 0) ||
          /choáng|định thân|trầm mặc|trói|đóng băng|phong ấn|giam cầm/i.test(
            c.ten || "",
          ),
      );
      if (
        ccSkill &&
        (isHeavyAttackIncoming ||
          isBossOrElite ||
          hpRatio < 0.65 ||
          aiMode !== "aggressive")
      ) {
        setAiDecision(`❄️ Khống chế: ${ccSkill.ten || ccSkill.id}`);
        return { loai: "chieu", id: ccSkill.id };
      }
    }

    // Ưu tiên 2: Phù Khống Chế theo ccTalismanMode
    const ccTalMode =
      cfg.ccTalismanMode ||
      (cfg.smartCc === false ? "off" : "interrupt");
    const shouldUseCcTal =
      ccTalMode === "off"
        ? false
        : ccTalMode === "always"
          ? true
          : ccTalMode === "boss_lock"
            ? isBossOrElite
            : ccTalMode === "emergency"
              ? hpRatio < 0.42
              : isHeavyAttackIncoming ||
                (isBossOrElite && hpRatio < 0.75) ||
                hpRatio < 0.48;

    if (canUseItem && shouldUseCcTal) {
      let bestCcTal = null;
      for (const [id, count] of Object.entries(ta.tui)) {
        if (!count || count <= 0) continue;
        const it = Cc.items && Cc.items.get(id);
        if (!it || it.loai !== "phu_luc" || !it.tran) continue;
        if ((it.pham_cap || 1) > effMaxTalismanGrade) continue;
        if (!(it.tran.khong_che && it.tran.khong_che > 0)) continue;
        if (!canUseBagItem(it)) continue;
        bestCcTal = it;
        break;
      }
      if (bestCcTal) {
        setAiDecision(
          `⛓️ Ném phù khống chế: ${bestCcTal.ten || bestCcTal.id}`,
        );
        return { loai: "dan", item: bestCcTal.id, so: 1 };
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // PHA 3: DÀN TRẬN BÀN · BÙ ĐAN LINH LỰC · BUFF BỘC PHÁT · MỞ MÀN PHÁ GIÁP
  // ═══════════════════════════════════════════════════════════════════

  // 3A. Tự động bày Trận Bàn theo formationMode
  const formMode =
    cfg.formationMode ||
    (cfg.autoFormation === false ? "off" : "boss_or_danger");
  const shouldDeployFormation =
    formMode === "off"
      ? false
      : formMode === "always"
        ? true
        : formMode === "boss_only"
          ? isBossOrElite
          : isBossOrElite || hpRatio < 0.65 || liveFoes.length >= 2;

  if (allowConsumeItems && ta.tui && shouldDeployFormation) {
    const formationBlockFn =
      (core &&
        core["combat/actions"] &&
        core["combat/actions"].formationBlock) ||
      (core && core.formationBlock);
    for (const [id, count] of Object.entries(ta.tui)) {
      if (!count || count <= 0 || failedActions.has("bay_tran:" + id))
        continue;
      const it = Cc.items && Cc.items.get(id);
      if (!it || it.loai !== "tran_ban" || !it.tran_phap) continue;
      if (typeof formationBlockFn === "function") {
        try {
          if (formationBlockFn(tran, Cc, it.id) !== undefined) continue;
        } catch (e) {}
      }
      setAiDecision(`阵 Khai triển trận bàn: ${it.ten || it.id}`);
      return { loai: "bay_tran", item: it.id };
    }
  }

  // 3B. Cắn Đan Hồi Linh Lực Thông Minh (Smart Spirit Pill 3.0)
  // Kiểm tra cả trường hợp dưới ngưỡng % VÀ trường hợp có chiêu đã hồi xong nhưng thiếu Linh Lực để tung!
  const spiritMode = cfg.spiritPillMode || "on_demand";
  const spiritTrig =
    (cfg.spiritThreshold != null ? cfg.spiritThreshold : 20) / 100;
  const readyButOutOfManaSkills = skills.filter((c) => {
    if (!c || !c.id || failedActions.has("chieu:" + c.id)) return false;
    if (c.bloodYears && !canUseBloodSacrifice(c)) return false;
    const onCd = ta.hoi && (ta.hoi[c.id] ?? 0) > curRound;
    return !onCd && (c.phi || 0) > (ta.linhLuc || 0);
  });
  const maxNeededPhi = readyButOutOfManaSkills.length
    ? Math.max(...readyButOutOfManaSkills.map((c) => c.phi || 0))
    : 0;
  const needManaForSkill =
    spiritMode === "on_demand" &&
    readyButOutOfManaSkills.length > 0 &&
    (usableSkills.filter((c) => c.dang === "cong" || (c.uy || 0) > 0)
      .length === 0 ||
      isBossOrElite);

  const shouldUseSpiritPill =
    spiritMode === "off"
      ? false
      : spiritMode === "boss_only"
        ? isBossOrElite && (mpRatio < spiritTrig || needManaForSkill)
        : spiritMode === "threshold_only"
          ? mpRatio < spiritTrig
          : mpRatio < spiritTrig || needManaForSkill;

  if (canUseItem && !ta.danLuotNay && shouldUseSpiritPill) {
    const missingMp = Math.max(
      1,
      (ta.linhLucToiDa || 50) - (ta.linhLuc || 0),
      maxNeededPhi - (ta.linhLuc || 0),
    );
    const mpResistExp =
      (ta.drugResistTran && ta.drugResistTran["linh_luc"]) || 0;
    const mpEff = Math.pow(retention, mpResistExp);
    const estPillFn =
      (core &&
        core["combat/actions"] &&
        core["combat/actions"].estimatePillRestore) ||
      (core && core.estimatePillRestore);

    let bestMpPill = null;
    let bestMpScore = Infinity;

    for (const [id, count] of Object.entries(ta.tui)) {
      if (!count || count <= 0) continue;
      const it = Cc.items && Cc.items.get(id);
      if (!it || it.loai !== "dan_duoc" || !it.tran) continue;
      if (it.tran.bo_chay) continue;
      if ((it.pham_cap || 1) > effMaxPillGrade) continue;
      if (!(it.tran.linh_luc && it.tran.linh_luc > 0)) continue;
      if (!canUseBagItem(it)) continue;

      let estMp = 0;
      if (typeof estPillFn === "function") {
        try {
          estMp = estPillFn(ta, it).linhLuc;
        } catch (e) {}
      }
      if (!estMp || estMp <= 0) {
        estMp = Math.round(
          (ta.linhLucToiDa || 50) * it.tran.linh_luc * mpEff,
        );
      }
      if (estMp <= 0) estMp = 5;

      const diff = Math.abs(missingMp - estMp);
      const canCoverSkill =
        (ta.linhLuc || 0) + estMp >= maxNeededPhi ? 0 : 120;
      const score =
        diff +
        canCoverSkill +
        (it.pham_cap || 1) * (isBossOrElite ? 12 : 35);
      if (score < bestMpScore) {
        bestMpScore = score;
        bestMpPill = it;
      }
    }
    if (bestMpPill) {
      setAiDecision(
        `💧 Cắn ${bestMpPill.ten || bestMpPill.id} (Bù Linh Lực)`,
      );
      return { loai: "dan", item: bestMpPill.id, so: 1 };
    }
  }

  // 3C. Kỹ Năng Buff / Gia Cường (Tung TRƯỚC khi ra đòn tấn công)
  if (
    usableSkills.length > 0 &&
    cfg.comboSequence !== false &&
    !ta.bocPhatDen
  ) {
    const buffSkill = usableSkills.find(
      (c) =>
        c.dang === "buff" ||
        c.dang === "ho_tro" ||
        (Array.isArray(c.effects) &&
          c.effects.some((e) =>
            ["empower", "haste"].includes(e.kind),
          ) &&
          !(c.uy > 20)) ||
        /bộc phát|tăng công|cuồng nộ|hóa thần|tụ khí|kiếm ý/i.test(
          c.ten || "",
        ),
    );
    if (buffSkill && targetEffHp > estBasicDmg * 1.3) {
      setAiDecision(
        `✨ Kích hoạt Buff: ${buffSkill.ten || buffSkill.id}`,
      );
      return { loai: "chieu", id: buffSkill.id };
    }
  }

  // 3D. Cắn Đan Bộc Phát Thông Minh (Burst Pill 3.0 — Chỉ cắn khi đã có chiêu tấn công sẵn sàng và địch còn >30% HP)
  const attackSkills = usableSkills.filter(
    (c) => c.dang === "cong" || (c.uy || 0) > 0 || !c.dang,
  );
  const hasReadyStrongAttack = attackSkills.some(
    (c) => (c.uy || 0) >= 18 || c.natal || (c.phi || 0) >= 12,
  );
  const burstMode =
    cfg.burstPillMode ||
    (cfg.useBurstPill === false ? "off" : "boss_combo");
  const targetHpPct =
    (target.khiHuyet || 0) / Math.max(1, target.khiHuyetToiDa || 1);
  const shouldUseBurstPill =
    burstMode === "off"
      ? false
      : burstMode === "always"
        ? attackSkills.length > 0 && targetHpPct > 0.25
        : burstMode === "boss_any"
          ? isBossOrElite
          : isBossOrElite &&
            (hasReadyStrongAttack || attackSkills.length >= 2) &&
            targetHpPct > 0.3;

  if (
    canUseItem &&
    !ta.danLuotNay &&
    !ta.bocPhatDen &&
    !ta.bocPhatTuDan &&
    shouldUseBurstPill
  ) {
    let burstPill = null;
    for (const [id, count] of Object.entries(ta.tui)) {
      if (!count || count <= 0) continue;
      const it = Cc.items && Cc.items.get(id);
      if (!it || it.loai !== "dan_duoc" || !it.tran) continue;
      if ((it.pham_cap || 1) > effMaxPillGrade) continue;
      if (!(it.tran.bao_phat && it.tran.bao_phat > 0)) continue;
      if (!canUseBagItem(it)) continue;
      burstPill = it;
      break;
    }
    if (burstPill) {
      setAiDecision(
        `🔥 Cắn ${burstPill.ten || burstPill.id} (Bộc phát dồn Boss)`,
      );
      return { loai: "dan", item: burstPill.id, so: 1 };
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // PHA 4: KỸ NĂNG TẤN CÔNG THÔNG MINH (CHỐNG OVERKILL · PHÁ GIÁP ➔ ĐẠI CHIÊU · KÍCH NỔ ẤN KÝ · AoE)
  // ═══════════════════════════════════════════════════════════════════
  if (attackSkills.length > 0) {
    // 4A. Kiểm tra Kết Liễu Tiết Kiệm (Anti-Overkill Execute):
    // Nếu có chiêu đủ sức hạ gục mục tiêu ngay trong 1 đòn, chọn chiêu tốn ít mana & hồi chiêu ngắn nhất!
    if (cfg.preventOverkill !== false && liveFoes.length === 1) {
      const lethalSkills = attackSkills
        .map((c) => ({
          c,
          dmg: estimateSkillDamage(ta, target, c, core),
        }))
        .filter((x) => x.dmg >= targetEffHp * 1.02 && !x.c.bloodYears);

      if (lethalSkills.length >= 2) {
        lethalSkills.sort((a, b) => {
          const costA =
            (a.c.phi || 0) * 2 +
            (a.c.hoi || 0) * 18 +
            (a.c.uy || 0) * 0.5;
          const costB =
            (b.c.phi || 0) * 2 +
            (b.c.hoi || 0) * 18 +
            (b.c.uy || 0) * 0.5;
          return costA - costB;
        });
        const chosenExec = lethalSkills[0].c;
        setAiDecision(
          `🎯 Kết liễu chuẩn: ${chosenExec.ten || chosenExec.id} (Chống phí đại chiêu)`,
        );
        return { loai: "chieu", id: chosenExec.id };
      }
    }

    // 4B. Chiêu Bản Mệnh (Sau khi đã bật Buff/Bộc phát): tung ít nhất 1 lần mỗi trận để tăng tâm huyết
    if (
      cfg.prioritizeNatal !== false &&
      !tran.natalUsed &&
      targetEffHp > estBasicDmg * 1.4
    ) {
      const natalSkill = attackSkills.find(
        (c) => c.natal && !c.bloodYears,
      );
      if (natalSkill) {
        setAiDecision(
          `🗡️ Xuất Bản Mệnh: ${natalSkill.ten || natalSkill.id}`,
        );
        return { loai: "chieu", id: natalSkill.id };
      }
    }

    // 4C. Chấm điểm toàn diện các kỹ năng tấn công
    const hasFollowupSkill = attackSkills.length >= 2;
    const targetHp = target.khiHuyet || 0;
    const isLowStraggler =
      liveFoes.length === 1 &&
      targetEffHp <= estBasicDmg * 1.75 &&
      hpRatio > 0.45;
    const targetHasDebuff = !!(
      (Array.isArray(target.statuses) &&
        target.statuses.some(
          (s) => !["empower", "haste", "regen"].includes(s.kind),
        )) ||
      target.phaGiap ||
      target.suyYeu ||
      target.anKy ||
      (target.trangThai && Object.keys(target.trangThai).length > 0)
    );

    const scored = attackSkills.map((c) => {
      const estDmg = estimateSkillDamage(ta, target, c, core);
      let score = Math.max(10, estDmg);
      let reason = "Công kích";

      // Thưởng khắc hệ Ngũ Hành
      if (c.he && target.he && typeof heTacDongFn === "function") {
        try {
          const fHe = Array.isArray(target.he)
            ? target.he[0]
            : target.he;
          const sHe = Array.isArray(c.he) ? c.he[0] : c.he;
          if (
            heTacDongFn(sHe, fHe) === -1 ||
            KHAC_HE[gocHe(sHe)] === gocHe(fHe)
          ) {
            score *= 1.25;
            reason = "Khắc hệ";
          }
        } catch (e) {}
      }

      // Thưởng kỹ năng diện rộng (AoE) khi có nhiều kẻ địch
      if (
        cfg.aoePriority !== false &&
        liveFoes.length >= 2 &&
        isAoESkill(c)
      ) {
        score *= 1 + 0.55 * Math.min(4, liveFoes.length - 1);
        reason = `Quần công ${liveFoes.length} mục tiêu`;
      }

      // Chuỗi Liên Hoàn Phá Giáp / Ấn Ký -> Đại Chiêu
      const isSunder = isSunderOrMarkSkill(c);
      if (targetShield > 20 && isSunder) {
        score *= 1.65;
        reason = "Phá hộ thuẫn";
      } else if (
        cfg.comboSequence !== false &&
        hasFollowupSkill &&
        !targetHasDebuff &&
        isSunder &&
        (isBossOrElite || targetEffHp > estBasicDmg * 2.4)
      ) {
        score *= 1.55;
        reason = "Mở màn Phá Giáp / Ấn Ký";
      }

      // Kích nổ Ấn Ký / Trạng Thái Xấu trên mục tiêu đã dính debuff
      if (
        targetHasDebuff &&
        (c.devour ||
          (Array.isArray(c.markTriggers) &&
            c.markTriggers.length > 0) ||
          /kích nổ|trảm|tuyệt sát|phệ hồn|đoạt mệnh|thiên phạt/i.test(
            c.ten || "",
          ) ||
          (c.uy || 0) >= 40)
      ) {
        score *= 1.32;
        reason = "Kích nổ Ấn Ký / Tuyệt sát";
      }

      // Bảo toàn Đại Chiêu khi chỉ còn 1 quái tàn huyết
      if (
        cfg.preventOverkill !== false &&
        ((targetHp < 50 && (c.phi || 0) > 15) ||
          (isLowStraggler && ((c.hoi || 0) >= 3 || (c.phi || 0) >= 24)))
      ) {
        score *= 0.3;
      }

      return { c, score, reason };
    });

    scored.sort((a, b) => b.score - a.score);
    const bestSkill = scored[0];
    setAiDecision(
      `⚡ ${bestSkill.c.ten || bestSkill.c.id} (${bestSkill.reason})`,
    );
    return { loai: "chieu", id: bestSkill.c.id };
  }

  // ═══════════════════════════════════════════════════════════════════
  // PHA 5: ĐAN XEN PHÙ CÔNG KÍCH · DUY TRÌ KHIÊN/MÁU · DỆT QUYỀN CƯỚC 0 MANA
  // ═══════════════════════════════════════════════════════════════════

  // 5A. Ném Phù Công Kích theo atkTalismanMode (Sau khi đã tung hết chiêu hoặc đang dồn Boss)
  const atkTalMode =
    cfg.atkTalismanMode ||
    (cfg.useAttackTalismans === false ? "off" : "smart_weave");
  const shouldUseAtkTalisman =
    atkTalMode === "off"
      ? false
      : atkTalMode === "always"
        ? true
        : atkTalMode === "boss_burst"
          ? isBossOrElite
          : atkTalMode === "zero_mana"
            ? (ta.linhLuc || 0) < 12 || usableSkills.length === 0
            : isBossOrElite ||
              (ta.linhLuc || 0) < 15 ||
              targetEffHp <= 160;

  if (canUseItem && shouldUseAtkTalisman) {
    let bestAtkTal = null;
    let bestAtkScore = -1;
    for (const [id, count] of Object.entries(ta.tui)) {
      if (!count || count <= 0) continue;
      const it = Cc.items && Cc.items.get(id);
      if (!it || it.loai !== "phu_luc" || !it.tran) continue;
      if ((it.pham_cap || 1) > effMaxTalismanGrade) continue;
      if (!(it.tran.chieu && (it.tran.chieu.uy || 0) > 0)) continue;
      if (!canUseBagItem(it)) continue;

      let tScore = it.tran.chieu.uy || 10;
      if (
        it.tran.chieu.he &&
        target.he &&
        typeof heTacDongFn === "function"
      ) {
        try {
          const fHe = Array.isArray(target.he)
            ? target.he[0]
            : target.he;
          const sHe = Array.isArray(it.tran.chieu.he)
            ? it.tran.chieu.he[0]
            : it.tran.chieu.he;
          if (
            heTacDongFn(sHe, fHe) === -1 ||
            KHAC_HE[gocHe(sHe)] === gocHe(fHe)
          ) {
            tScore *= 1.4;
          }
        } catch (e) {}
      }
      if (tScore > bestAtkScore) {
        bestAtkScore = tScore;
        bestAtkTal = it;
      }
    }
    if (bestAtkTal) {
      setAiDecision(
        `🧧 Phù công kích: ${bestAtkTal.ten || bestAtkTal.id}`,
      );
      return { loai: "dan", item: bestAtkTal.id, so: 1 };
    }
  }

  // 5B. Duy trì Hồi Phục / Hộ Thuẫn kỹ năng còn dư trước khi kết thúc lượt
  if (usableSkills.length > 0 && hpRatio < healSkillRatio) {
    const sustainHeal = usableSkills.find(
      (c) =>
        c.dang === "hoi_phuc" ||
        /hồi|trị thương|sinh cơ|trường sinh/i.test(c.ten || ""),
    );
    if (sustainHeal) {
      setAiDecision(
        `💚 Duy trì hồi huyết: ${sustainHeal.ten || sustainHeal.id}`,
      );
      return { loai: "chieu", id: sustainHeal.id };
    }
  }
  if (usableSkills.length > 0 && shieldRatio < shieldSkillRatio) {
    const sustainShield = usableSkills.find(
      (c) =>
        c.dang === "thu" ||
        /khiên|thuẫn|hộ thể|bảo mệnh|quy giáp/i.test(c.ten || ""),
    );
    if (sustainShield) {
      setAiDecision(
        `🛡️ Bồi đắp hộ thuẫn: ${sustainShield.ten || sustainShield.id}`,
      );
      return { loai: "chieu", id: sustainShield.id };
    }
  }

  // 5C. Tung nốt bất kỳ chiêu khả dụng nào còn lại
  if (usableSkills.length > 0) {
    const remSkill = usableSkills[0];
    setAiDecision(`⚡ Tung chiêu: ${remSkill.ten || remSkill.id}`);
    return { loai: "chieu", id: remSkill.id };
  }

  // 5D. Fallback kiểm tra nextAutomatedAction của lõi game (chỉ khi Siêu AI 3.0 đã hết chiêu chủ động)
  const autoFn =
    (core &&
      core["combat/playerAutomation"] &&
      core["combat/playerAutomation"].nextAutomatedAction) ||
    (core && core.nextAutomatedAction);
  if (typeof autoFn === "function") {
    try {
      const cand = autoFn(tran, Cc, {
        enabled: true,
        autoEndTurn: false,
        usePills: false,
        useTalismans: false,
        stackShields: true,
        useInnate: true,
        skillPriority: [],
        recallFamiliarBelow: 0,
        healBelow: 0,
        spiritBelow: 0,
        maxGrade: effMaxPillGrade,
      });
      if (cand && cand.loai === "chieu") {
        const actKey = "chieu:" + cand.id;
        const skObj = skills.find((x) => x && x.id === cand.id);
        if (
          !failedActions.has(actKey) &&
          (!skObj || !skObj.bloodYears || canUseBloodSacrifice(skObj))
        ) {
          setAiDecision("⚡ Chiêu bổ trợ: " + cand.id);
          return cand;
        }
      }
    } catch (e) {}
  }

  // 6. QUYỀN CƯỚC MIỄN PHÍ MỖI LƯỢT (Basic Attack - danh_thuong)
  if (
    cfg.autoNormalAttack !== false &&
    !ta.daDanhThuong &&
    !failedActions.has("danh_thuong")
  ) {
    setAiDecision("👊 Dệt Quyền Cước (0 Linh Lực)");
    return { loai: "danh_thuong" };
  }

  // 7. KẾT THÚC LƯỢT (End Turn)
  setAiDecision("⏭ Kết thúc hiệp " + curRound);
  return { loai: "ket_luot" };
}

let combatStepTimer = null;

// Đánh tự động bằng AI trong trận với nhịp độ tùy chọn (200ms / 80ms / 15ms)
function auFightStep(singleAction) {
  const g = G(),
    c = C();
  if (!g) return "idle";
  let tran = g.state.run && g.state.run.tran;
  if (!tran) return "idle";
  if (tran.ketThuc) {
    if (combatStepTimer) {
      clearTimeout(combatStepTimer);
      combatStepTimer = null;
    }
    return "ok";
  }
  if (tran.luot !== "ta") return "idle";

  const cfg = (AU && AU.cfg && AU.cfg.tc) || {};
  const failedActions = new Set();

  let act = null;
  let r = { ok: false };
  for (let attempt = 0; attempt < 12; attempt++) {
    act = smartCombatAction(tran, c, cfg, failedActions);
    if (!act) {
      if (
        tran.ta &&
        !tran.ta.daDanhThuong &&
        cfg.autoNormalAttack !== false &&
        !failedActions.has("danh_thuong")
      ) {
        act = { loai: "danh_thuong" };
      } else {
        act = { loai: "ket_luot" };
      }
    }

    r = auCall(() => g.hanhDongTran(act));
    tran = g.state.run && g.state.run.tran;

    if (r.ok) break;

    if (act.loai === "chieu") failedActions.add("chieu:" + act.id);
    else if (act.loai === "dan") failedActions.add("dan:" + act.item);
    else if (act.loai === "bay_tran")
      failedActions.add("bay_tran:" + act.item);
    else if (act.loai === "danh_thuong")
      failedActions.add("danh_thuong");
    else if (act.loai === "muc_tieu")
      failedActions.add("muc_tieu:" + act.ma);
    else if (act.loai === "thu_hoi")
      failedActions.add("thu_hoi:" + act.id);
    else if (act.loai === "thieu_dot") failedActions.add("thieu_dot");
    else if (act.loai === "bo_chay") failedActions.add("bo_chay");

    if (act.loai === "ket_luot") break;
  }

  if (singleAction) return "ok";

  if (!tran || tran.ketThuc || (act && act.loai === "ket_luot")) {
    if (combatStepTimer) {
      clearTimeout(combatStepTimer);
      combatStepTimer = null;
    }
    return "ok";
  }

  if (combatAutoActive) {
    if (combatStepTimer) clearTimeout(combatStepTimer);
    const stepDelay =
      cfg.speed === "instant" ? 15 : cfg.speed === "fast" ? 80 : 200;
    combatStepTimer = setTimeout(() => {
      combatStepTimer = null;
      const liveTran = g.state.run && g.state.run.tran;
      if (
        combatAutoActive &&
        liveTran &&
        !liveTran.ketThuc &&
        liveTran.luot === "ta"
      ) {
        auFightStep(false);
      }
    }, stepDelay);
  }
  return "ok";
}

// Đánh tự động tức thì (Zero-delay) dùng cho Auto Săn Yêu / Auto Dị Bảo / Auto Tháp chạy ngầm trong auPending
function auFightInstant() {
  const g = G(),
    c = C();
  if (!g) return "idle";
  let tran = g.state.run && g.state.run.tran;
  if (!tran) return "idle";
  if (tran.ketThuc) return "ok";
  if (tran.luot !== "ta") return "idle";

  const cfg = (AU && AU.cfg && AU.cfg.tc) || {};
  let iters = 0;
  const failed = new Set();
  while (tran && !tran.ketThuc && tran.luot === "ta" && iters < 18) {
    iters++;
    let act = smartCombatAction(tran, c, cfg, failed);
    if (!act) {
      if (
        tran.ta &&
        !tran.ta.daDanhThuong &&
        cfg.autoNormalAttack !== false &&
        !failed.has("danh_thuong")
      ) {
        act = { loai: "danh_thuong" };
      } else {
        act = { loai: "ket_luot" };
      }
    }
    const r = auCall(() => g.hanhDongTran(act));
    tran = g.state.run && g.state.run.tran;
    if (!r.ok) {
      if (act.loai === "chieu") failed.add("chieu:" + act.id);
      else if (act.loai === "dan") failed.add("dan:" + act.item);
      else if (act.loai === "bay_tran")
        failed.add("bay_tran:" + act.item);
      else if (act.loai === "danh_thuong") failed.add("danh_thuong");
      else if (act.loai === "muc_tieu")
        failed.add("muc_tieu:" + act.ma);
      else if (act.loai === "thu_hoi") failed.add("thu_hoi:" + act.id);
      else if (act.loai === "thieu_dot") failed.add("thieu_dot");
      else if (act.loai === "bo_chay") failed.add("bo_chay");

      if (act.loai === "ket_luot" || failed.size >= 14) {
        auCall(() => g.hanhDongTran({ loai: "ket_luot" }));
        break;
      }
      continue;
    }
    if (act.loai === "ket_luot") break;
  }
  return "ok";
}

// ═════════ GIAO DIỆN NỔI TÁC CHIẾN TRONG TRẬN 3.0 (DRAGGABLE & COLLAPSIBLE HUD) ═════════
let combatAutoActive = false;
let combatOverlayEl = null;
let combatHudCollapsed = false;
let lastSyncedCombatAutomationStr = "";

function syncGameCombatAutomation() {
  try {
    const cfg = (AU && AU.cfg && AU.cfg.tc) || {};
    const raw = localStorage.getItem("tu-tien:combat-automation");
    let c = raw ? JSON.parse(raw) : {};
    const allowItems = cfg.itemPolicy !== "save_all";
    c.usePills = allowItems && cfg.healPillMode !== "off";
    c.useTalismans = allowItems;
    c.autoEndTurn = true;
    c.useInnate = true;
    c.pillRules = {
      healBelow: (cfg.healHpThreshold || 35) / 100,
      spiritBelow: (cfg.spiritThreshold || 20) / 100,
      maxGrade: cfg.maxPillGrade || 0,
      burstOn: cfg.burstPillMode === "off" ? "never" : "strong",
    };
    c.talismanRules = {
      shieldBelow: (cfg.shieldHpThreshold || 55) / 100,
      maxGrade: cfg.talismanGrade || 0,
      controlOn: cfg.ccTalismanMode === "off" ? "never" : "strong",
      attackOn: cfg.atkTalismanMode === "off" ? "never" : "strong",
    };
    const nextStr = JSON.stringify(c);
    if (nextStr !== lastSyncedCombatAutomationStr && nextStr !== raw) {
      lastSyncedCombatAutomationStr = nextStr;
      localStorage.setItem("tu-tien:combat-automation", nextStr);
    }
  } catch (e) {}
}

function updateCombatOverlay() {
  const g = G();
  const run = g && g.state && g.state.run;
  const tran = run && run.tran;
  const inCombat = !!(tran && tran.daGiaoChien && !tran.ketThuc);
  const cfg = (AU && AU.cfg && AU.cfg.tc) || {};

  if (!inCombat || cfg.autoCombatOverlay === false) {
    if (combatOverlayEl) {
      combatOverlayEl.remove();
      combatOverlayEl = null;
    }
    combatAutoActive = false;
    refreshMiniStatus();
    return;
  }

  syncGameCombatAutomation();

  const ta = tran.ta;
  const dich = (tran.dich || []).filter((d) => (d.khiHuyet || 0) > 0);
  const curTarget = dich.find((d) => d.ma === tran.mucTieu) || dich[0];
  const curHiep = tran.hiep || 1;
  const curSpeed = cfg.speed || "normal";

  let hpStr = "";
  if (ta && ta.khiHuyetToiDa) {
    const hpPct = Math.round((ta.khiHuyet / ta.khiHuyetToiDa) * 100);
    const mpPct = ta.linhLucToiDa
      ? Math.round(((ta.linhLuc || 0) / ta.linhLucToiDa) * 100)
      : 0;
    const shield = (ta.hoThuan || 0) + (ta.thuanPhu || 0);
    const retention =
      ta.drugRetention != null ? ta.drugRetention : 0.85;
    const curResistExp =
      (ta.drugResistTran && ta.drugResistTran["khi_huyet"]) || 0;
    const resistPct = Math.round(
      (1 - Math.pow(retention, curResistExp)) * 100,
    );
    hpStr = `<span style="font-size:11px;color:#a3e635;font-weight:600">❤️ ${hpPct}%</span> <span style="font-size:11px;color:#38bdf8;font-weight:600">💧 ${mpPct}%</span>${shield > 0 ? ` <span style="font-size:11px;color:#fbbf24">🛡️ +${shield}</span>` : ""}${resistPct > 0 ? ` <span style="font-size:10.5px;color:#cbd5e1" title="Dược kháng tích lũy trong trận">💊Kháng ${resistPct}%</span>` : ""}`;
  }

  let foeStr = "";
  if (curTarget) {
    const fHpPct = curTarget.khiHuyetToiDa
      ? Math.round(
          ((curTarget.khiHuyet || 0) / curTarget.khiHuyetToiDa) * 100,
        )
      : 0;
    const fName = curTarget.ten || "Mục tiêu";
    foeStr = `<span style="font-size:11px;color:#fca5a5;font-weight:600" title="${esc(fName)}">🎯 ${esc(fName)} (${fHpPct}%)${dich.length > 1 ? ` +${dich.length - 1}` : ""}</span>`;
  }

  function getTeHuyetUi(mode) {
    if (mode === "boss") {
      return {
        label: "🩸 Tế: Boss",
        color: "#fbbf24",
        bg: "rgba(245,158,11,0.2)",
        border: "rgba(245,158,11,0.6)",
        title:
          "Tế Huyết Bản Mệnh: Chỉ dùng khi gặp Boss / Tinh Anh. Click để đổi: Boss ➔ Khẩn ➔ Luôn Bật ➔ Tắt",
      };
    }
    if (mode === "emergency") {
      return {
        label: "🩸 Tế: Khẩn",
        color: "#f472b6",
        bg: "rgba(244,114,182,0.2)",
        border: "rgba(244,114,182,0.6)",
        title: "Tế Huyết Bản Mệnh: Chỉ khi máu < 35%. Click để đổi",
      };
    }
    if (mode === "always") {
      return {
        label: "🩸 Tế: BẬT",
        color: "#f87171",
        bg: "rgba(239,68,68,0.25)",
        border: "rgba(239,68,68,0.7)",
        title:
          "Tế Huyết Bản Mệnh: Đang BẬT TOÀN BỘ (Đốt thọ nguyên). Click để TẮT",
      };
    }
    return {
      label: "🩸 Tế: Tắt",
      color: "#94a3b8",
      bg: "rgba(255,255,255,0.06)",
      border: "rgba(255,255,255,0.18)",
      title:
        "Tế Huyết Bản Mệnh: Đang TẮT (Bảo toàn thọ nguyên). Click để đổi",
    };
  }

  function getPolicyUi(pol) {
    if (pol === "boss_only") {
      return {
        label: "🎒 Đan/Phù: Boss",
        color: "#fbbf24",
        title:
          "Chế độ Vật Phẩm: Chỉ dùng Đan/Phù khi gặp Boss hoặc nguy kịch (<20% HP). Click để đổi",
      };
    }
    if (pol === "save_all") {
      return {
        label: "🎒 Đan/Phù: Khoá",
        color: "#94a3b8",
        title:
          "Chế độ Vật Phẩm: Đang KHÓA toàn bộ Đan/Phù để tiết kiệm tuyệt đối. Click để mở lại",
      };
    }
    return {
      label: "🎒 Đan/Phù: Chuẩn",
      color: "#3ddc97",
      title:
        "Chế độ Vật Phẩm: Tự động dùng Đan/Phù thông minh theo ngưỡng đã cài. Click để đổi nhanh",
    };
  }

  function getTargetUi(tp) {
    const map = {
      smart: ["🎯 M.Tiêu: T.Minh", "Nhắm mục tiêu tối ưu chiến thuật"],
      boss: [
        "🎯 M.Tiêu: Boss",
        "Ưu tiên dồn sát thương Trùm / Tinh Anh",
      ],
      threat: [
        "🎯 M.Tiêu: N.Hiểm",
        "Ưu tiên kẻ chuẩn bị tung đại chiêu / hồi máu",
      ],
      weakest: ["🎯 M.Tiêu: Yếu", "Ưu tiên dứt điểm kẻ thấp máu trước"],
      counter: [
        "🎯 M.Tiêu: Khắc",
        "Ưu tiên mục tiêu bị khắc hệ Ngũ Hành",
      ],
    };
    const m = map[tp] || map.smart;
    return { label: m[0], title: m[1] + " (Click để đổi)" };
  }

  function getSpeedLabel(sp) {
    if (sp === "instant") return "⚡ 15ms";
    if (sp === "fast") return "🚀 80ms";
    return "⏱ 200ms";
  }

  if (!combatOverlayEl) {
    combatOverlayEl = document.createElement("div");
    combatOverlayEl.id = "vkx-combat-overlay";
    let savedPos = null;
    try {
      savedPos = JSON.parse(
        localStorage.getItem("vkx_combat_hud_pos") || "null",
      );
    } catch (e) {}
    const topCss =
      savedPos && Number.isFinite(savedPos.top)
        ? savedPos.top + "px"
        : "64px";
    const rightCss =
      savedPos && Number.isFinite(savedPos.left) ? "auto" : "16px";
    const leftCss =
      savedPos && Number.isFinite(savedPos.left)
        ? savedPos.left + "px"
        : "auto";

    combatOverlayEl.style.cssText = `position:fixed;top:${topCss};left:${leftCss};right:${rightCss};z-index:2147483002;background:rgba(12,18,24,0.95);backdrop-filter:blur(12px);border:1px solid rgba(61,220,151,0.55);box-shadow:0 10px 28px rgba(0,0,0,0.68),0 0 18px rgba(61,220,151,0.22);border-radius:14px;padding:8px 12px;display:flex;flex-direction:column;gap:6px;font-family:system-ui,sans-serif;color:#e7f1ec;font-size:12.5px;user-select:none;max-width:min(96vw, 560px);`;

    if (cfg.autoInCombat) {
      combatAutoActive = true;
    }

    const curTeHuyet = getTeHuyetUi(cfg.teHuyetMode || "off");
    const curPol = getPolicyUi(cfg.itemPolicy || "auto");
    const curTgt = getTargetUi(cfg.targetPrio || "smart");

    combatOverlayEl.innerHTML = `
      <div id="vkx-combat-drag" style="display:flex;align-items:center;justify-content:space-between;gap:10px;cursor:grab">
<div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">
  <span style="font-size:14px">⚔️</span>
  <b style="color:var(--acc, #3ddc97);font-size:13px">Siêu AI 3.0</b>
  <span id="vkx-combat-round" style="font-size:11px;padding:1px 6px;background:rgba(255,255,255,0.1);border-radius:5px;color:#e2e8f0;font-weight:600">H.${curHiep}</span>
  <div id="vkx-combat-live-stats" style="display:flex;align-items:center;gap:7px;flex-wrap:wrap">
    ${hpStr}
    ${foeStr}
  </div>
</div>
<div style="display:flex;align-items:center;gap:5px">
  <button id="vkx-btn-combat-step" class="vk-btn sec" style="padding:3px 8px;font-size:11.5px;border-radius:7px;cursor:pointer" title="Thực hiện đúng 1 hành động chiến thuật rồi dừng">1 Đòn</button>
  <button id="vkx-btn-combat-toggle" class="vk-btn" style="padding:3px 10px;font-size:12px;border-radius:7px;cursor:pointer;background:${combatAutoActive ? "#f87171" : "#3ddc97"};color:#05140d;font-weight:700">${combatAutoActive ? "⏹ Dừng" : "▶ Tự Đánh"}</button>
  <button id="vkx-btn-combat-collapse" class="vk-btn sec" style="padding:2px 7px;font-size:11px;border-radius:7px;cursor:pointer" title="Thu gọn / Mở rộng thanh chiến thuật">${combatHudCollapsed ? "+" : "–"}</button>
</div>
      </div>
      <div id="vkx-combat-subbar" style="display:${combatHudCollapsed ? "none" : "flex"};flex-direction:column;gap:5px;border-top:1px solid rgba(255,255,255,0.08);padding-top:5px">
<div style="display:flex;align-items:center;justify-content:space-between;gap:6px;flex-wrap:wrap">
  <span id="vkx-combat-last-act" style="font-size:11.5px;color:#93c5fd;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:260px">🤖 ${esc(_lastAiDecisionText)}</span>
  <div style="display:flex;align-items:center;gap:4px;flex-wrap:wrap">
    <button id="vkx-btn-combat-target" class="vk-btn sec" style="padding:2px 7px;font-size:11px;border-radius:6px;cursor:pointer" title="${curTgt.title}">${curTgt.label}</button>
    <button id="vkx-btn-combat-policy" class="vk-btn sec" style="padding:2px 7px;font-size:11px;border-radius:6px;cursor:pointer;color:${curPol.color}" title="${curPol.title}">${curPol.label}</button>
    <button id="vkx-btn-combat-tehuyet" class="vk-btn sec" style="padding:2px 7px;font-size:11px;border-radius:6px;cursor:pointer;background:${curTeHuyet.bg};color:${curTeHuyet.color};border:1px solid ${curTeHuyet.border}" title="${curTeHuyet.title}">${curTeHuyet.label}</button>
    <button id="vkx-btn-combat-speed" class="vk-btn sec" style="padding:2px 7px;font-size:11px;border-radius:6px;cursor:pointer" title="Đổi tốc độ nhịp đánh (200ms ➔ 80ms ➔ 15ms)">${getSpeedLabel(curSpeed)}</button>
  </div>
</div>
      </div>
    `;

    document.body.appendChild(combatOverlayEl);

    // Kéo thả mượt mà thanh HUD trong trận
    const dragBar = combatOverlayEl.querySelector("#vkx-combat-drag");
    if (dragBar) {
      let dragging = false,
        startX = 0,
        startY = 0,
        origLeft = 0,
        origTop = 0;
      dragBar.addEventListener("pointerdown", (ev) => {
        if (ev.target && ev.target.closest("button")) return;
        dragging = true;
        const rect = combatOverlayEl.getBoundingClientRect();
        startX = ev.clientX;
        startY = ev.clientY;
        origLeft = rect.left;
        origTop = rect.top;
        dragBar.style.cursor = "grabbing";
        try {
          dragBar.setPointerCapture(ev.pointerId);
        } catch (e) {}
      });
      dragBar.addEventListener("pointermove", (ev) => {
        if (!dragging) return;
        const nx = Math.max(
          4,
          Math.min(
            window.innerWidth - 120,
            origLeft + (ev.clientX - startX),
          ),
        );
        const ny = Math.max(
          4,
          Math.min(
            window.innerHeight - 48,
            origTop + (ev.clientY - startY),
          ),
        );
        combatOverlayEl.style.left = nx + "px";
        combatOverlayEl.style.top = ny + "px";
        combatOverlayEl.style.right = "auto";
      });
      const endDrag = () => {
        if (!dragging) return;
        dragging = false;
        dragBar.style.cursor = "grab";
        try {
          const rect = combatOverlayEl.getBoundingClientRect();
          localStorage.setItem(
            "vkx_combat_hud_pos",
            JSON.stringify({
              left: Math.round(rect.left),
              top: Math.round(rect.top),
            }),
          );
        } catch (e) {}
      };
      dragBar.addEventListener("pointerup", endDrag);
      dragBar.addEventListener("pointercancel", endDrag);
    }

    const btnCollapse = combatOverlayEl.querySelector(
      "#vkx-btn-combat-collapse",
    );
    if (btnCollapse) {
      btnCollapse.onclick = (e) => {
        e.stopPropagation();
        combatHudCollapsed = !combatHudCollapsed;
        const sub = combatOverlayEl.querySelector("#vkx-combat-subbar");
        if (sub)
          sub.style.display = combatHudCollapsed ? "none" : "flex";
        btnCollapse.textContent = combatHudCollapsed ? "+" : "–";
      };
    }

    const btnTarget = combatOverlayEl.querySelector(
      "#vkx-btn-combat-target",
    );
    if (btnTarget) {
      btnTarget.onclick = (e) => {
        e.stopPropagation();
        const order = ["smart", "boss", "threat", "weakest", "counter"];
        const cur = cfg.targetPrio || "smart";
        const next = order[(order.indexOf(cur) + 1) % order.length];
        cfg.targetPrio = next;
        AU.cfg.tc.targetPrio = next;
        auSave();
        const ui = getTargetUi(next);
        btnTarget.textContent = ui.label;
        btnTarget.title = ui.title;
        const selEl = document.getElementById("au-tc-target-prio");
        if (selEl) selEl.value = next;
      };
    }

    const btnPolicy = combatOverlayEl.querySelector(
      "#vkx-btn-combat-policy",
    );
    if (btnPolicy) {
      btnPolicy.onclick = (e) => {
        e.stopPropagation();
        const order = ["auto", "boss_only", "save_all"];
        const cur = cfg.itemPolicy || "auto";
        const next = order[(order.indexOf(cur) + 1) % order.length];
        cfg.itemPolicy = next;
        AU.cfg.tc.itemPolicy = next;
        auSave();
        const ui = getPolicyUi(next);
        btnPolicy.textContent = ui.label;
        btnPolicy.style.color = ui.color;
        btnPolicy.title = ui.title;
        const selEl = document.getElementById("au-tc-item-policy");
        if (selEl) selEl.value = next;
      };
    }

    const btnTeHuyet = combatOverlayEl.querySelector(
      "#vkx-btn-combat-tehuyet",
    );
    if (btnTeHuyet) {
      btnTeHuyet.onclick = (e) => {
        e.stopPropagation();
        const order = ["off", "boss", "emergency", "always"];
        const cur = cfg.teHuyetMode || "off";
        const next = order[(order.indexOf(cur) + 1) % order.length];
        cfg.teHuyetMode = next;
        AU.cfg.tc.teHuyetMode = next;
        auSave();

        const ui = getTeHuyetUi(next);
        btnTeHuyet.textContent = ui.label;
        btnTeHuyet.style.color = ui.color;
        btnTeHuyet.style.background = ui.bg;
        btnTeHuyet.style.borderColor = ui.border;
        btnTeHuyet.title = ui.title;

        const selEl = document.getElementById("au-tc-te-huyet");
        if (selEl) selEl.value = next;
      };
    }

    const btnSpeed = combatOverlayEl.querySelector(
      "#vkx-btn-combat-speed",
    );
    if (btnSpeed) {
      btnSpeed.onclick = (e) => {
        e.stopPropagation();
        const order = ["normal", "fast", "instant"];
        const cur = cfg.speed || "normal";
        const next = order[(order.indexOf(cur) + 1) % order.length];
        cfg.speed = next;
        AU.cfg.tc.speed = next;
        auSave();
        btnSpeed.textContent = getSpeedLabel(next);
        const selEl = document.getElementById("au-tc-speed");
        if (selEl) selEl.value = next;
      };
    }

    const btnStep = combatOverlayEl.querySelector(
      "#vkx-btn-combat-step",
    );
    if (btnStep) {
      btnStep.onclick = (e) => {
        e.stopPropagation();
        auFightStep(true);
      };
    }

    const btnToggle = combatOverlayEl.querySelector(
      "#vkx-btn-combat-toggle",
    );
    if (btnToggle) {
      btnToggle.onclick = (e) => {
        e.stopPropagation();
        combatAutoActive = !combatAutoActive;
        refreshMiniStatus();
        updateCombatOverlay();
        if (combatAutoActive) auFightStep(false);
      };
    }
    combatOverlayEl._lastAutoActive = combatAutoActive;
  } else {
    const roundEl = combatOverlayEl.querySelector("#vkx-combat-round");
    if (roundEl) roundEl.textContent = `H.${curHiep}`;
    const statsEl = combatOverlayEl.querySelector(
      "#vkx-combat-live-stats",
    );
    if (statsEl) {
      statsEl.innerHTML = `${hpStr} ${foeStr}`;
    }
    const actEl = combatOverlayEl.querySelector("#vkx-combat-last-act");
    if (actEl) {
      actEl.textContent = "🤖 " + _lastAiDecisionText;
    }
    const speedEl = combatOverlayEl.querySelector(
      "#vkx-btn-combat-speed",
    );
    if (speedEl) {
      speedEl.textContent = getSpeedLabel(curSpeed);
    }
    const btnTarget = combatOverlayEl.querySelector(
      "#vkx-btn-combat-target",
    );
    if (btnTarget) {
      const ui = getTargetUi(cfg.targetPrio || "smart");
      btnTarget.textContent = ui.label;
      btnTarget.title = ui.title;
    }
    const btnPolicy = combatOverlayEl.querySelector(
      "#vkx-btn-combat-policy",
    );
    if (btnPolicy) {
      const ui = getPolicyUi(cfg.itemPolicy || "auto");
      btnPolicy.textContent = ui.label;
      btnPolicy.style.color = ui.color;
      btnPolicy.title = ui.title;
    }
    const btnTeHuyet = combatOverlayEl.querySelector(
      "#vkx-btn-combat-tehuyet",
    );
    if (btnTeHuyet) {
      const ui = getTeHuyetUi(cfg.teHuyetMode || "off");
      btnTeHuyet.textContent = ui.label;
      btnTeHuyet.style.color = ui.color;
      btnTeHuyet.style.background = ui.bg;
      btnTeHuyet.style.borderColor = ui.border;
      btnTeHuyet.title = ui.title;
    }

    if (combatOverlayEl._lastAutoActive !== combatAutoActive) {
      combatOverlayEl._lastAutoActive = combatAutoActive;
      const btnToggle = combatOverlayEl.querySelector(
        "#vkx-btn-combat-toggle",
      );
      if (btnToggle) {
        btnToggle.textContent = combatAutoActive
          ? "⏹ Dừng"
          : "▶ Tự Đánh";
        btnToggle.style.background = combatAutoActive
          ? "#f87171"
          : "#3ddc97";
      }
    }
  }
}

function combatWatcherTick() {
  updateCombatOverlay();
  if (combatAutoActive) {
    const g = G(),
      run = g && g.state && g.state.run;
    if (
      run &&
      run.tran &&
      run.tran.daGiaoChien &&
      !run.tran.ketThuc &&
      run.tran.luot === "ta"
    ) {
      auFightStep(false);
    }
  }
}

// ── Xử lý việc đang dở (trận, sự kiện) dùng chung cho cả hai Auto.
// Trả về 'idle' (không có việc dở), 'ok' (vừa xử lý một bước) hoặc { stop: lý do }.
function auPending(st, opt) {
  opt = opt || {};
  const g = G(),
    run = g.state.run;
  if (run.thongBaoDai) auCall(() => g.closeLongNotice());
  if (run.tran) {
    if (run.tran.ketThuc) {
      const curTran = run.tran;
      const kq = curTran.ketThuc;
      const combatLog = curTran.nhatKy ? [...curTran.nhatKy] : [];
      const dichInfo = (curTran.dich || []).map((d) => ({
        id: d.id,
        ten: d.ten || auEnemyName(d.id) || d.id,
        hp: d.khiHuyet,
        maxHp: d.khiHuyetToiDa,
        realm: d.canhGioi,
      }));
      const taInfo = curTran.ta
        ? {
            hp: curTran.ta.khiHuyet,
            maxHp: curTran.ta.khiHuyetToiDa,
            cn: curTran.ta.chanNguyen,
            maxCn: curTran.ta.chanNguyenToiDa,
          }
        : null;

      // Sao lưu toàn bộ nhật ký hiệp đấu và dữ liệu trận đánh vào biến toàn cục để người chơi soi lại
      try {
        gWin.__vkLastCombat = {
          time: new Date().toLocaleTimeString(),
          kq: kq,
          hiep: curTran.hiep || 1,
          nhatKy: combatLog,
          dich: dichInfo,
          ta: taInfo,
        };
      } catch (e) {}

      const r = auCall(() => g.xongTran());
      if (!r.ok) return { stop: "Không kết thúc được trận: " + r.err };
      st.fights++;
      st.hacStreak = 0;
      if (kq === "thang") st.wins++;

      const mainEnemy = dichInfo[0];
      const enemyName = mainEnemy ? mainEnemy.ten : "đối thủ";

      if (kq === "thua") {
        const enemyRemainHp =
          mainEnemy && mainEnemy.maxHp
            ? ` (Địch còn: ${Math.round((mainEnemy.hp / mainEnemy.maxHp) * 100)}% HP)`
            : "";
        auLog(
          `💀 Đã thất bại trước «${enemyName}» ở Hiệp ${curTran.hiep || 1}${enemyRemainHp} (Trận #${st.fights}).`,
          "vk-bad",
        );
        // Trích xuất 3-4 đòn đánh cuối cùng để người chơi biết rõ chiêu thức/hiệu ứng hạ gục
        if (combatLog.length > 0) {
          const lastLines = combatLog.slice(-4);
          lastLines.forEach((line) => {
            if (line) auLog(`   ⚔️ ${line.trim()}`, "vk-mu");
          });
        }
        auLog(
          `💡 Gõ <b>window.__vkLastCombat.nhatKy</b> trong F12 Console để xem toàn bộ ${combatLog.length} đòn đánh của trận này!`,
          "vk-mu",
        );
      } else {
        auLog(
          "Đã xong trận thắng trước «" +
            enemyName +
            "» (Trận #" +
            st.fights +
            ").",
          "vk-ok",
        );
      }
      return "ok";
    }
    if (opt.hunt && opt.neHac) {
      const hd = (run.tran.dich || []).find((d) =>
        auIsHacEnemy(d.id, d.ten),
      );
      if (hd)
        return {
          stop:
            "Trận đang mở gặp " +
            (hd.ten || auEnemyName(hd.id) || "Hạc") +
            ": dừng để bạn tự rút lui, khỏi giết Hạc bị trừ Khí Vận.",
        };
    }
    if (run.tran.daGiaoChien) {
      if (!opt.danhAi) {
        return {
          stop: "Trận đang giao chiến dở. Hãy đánh xong trong game rồi bấm chạy tiếp.",
        };
      }
      return auFightInstant();
    }
    const p = g.duKienTran();
    if (!p)
      return {
        stop: "Không đọc được dự đoán của trận đang mở. Dừng để bạn tự đánh trong game.",
      };
    const lv = auBattleLevel(run, p),
      m = auMauOf(lv);
    if (opt.hunt && !auColorOK(lv, opt.mau))
      return {
        stop:
          "Trận " +
          m[0] +
          " (" +
          m[2] +
          ") nằm ngoài màu đã chọn (" +
          auMauLabel(opt.mau) +
          "). Dừng để bạn tự quyết định trong game.",
        danger: lv,
      };
    if (p.duocTocChien && p.thang) {
      const r = auCall(() => g.tocChienTran());
      if (!r.ok) return { stop: "Không Tốc Chiến được: " + r.err };
      st.fights++;
      st.hacStreak = 0;
      if (p.thang) st.wins++;
      auLog("Tốc Chiến thắng (Trận #" + st.fights + ").", "vk-ok");
      return "ok";
    }
    if (opt.danhAi) {
      const r = auCall(() => g.hanhDongTran({ loai: "giao_chien" }));
      if (!r.ok)
        return { stop: "Không bắt đầu giao chiến được: " + r.err };
      auLog(
        "Trận " +
          m[0] +
          " (" +
          m[2] +
          ") không Tốc Chiến được: tự động vào Giao Chiến để đánh bằng Siêu AI VIP...",
        "vk-ok",
      );
      return "ok";
    }
    if (!p.thang)
      return {
        stop:
          "Trận " +
          m[0] +
          " (" +
          m[2] +
          "): game dự đoán thua nên không cho Tốc Chiến, Auto chưa bật Tự Đánh AI. Dừng để bạn tự đánh trong game.",
      };
    return {
      stop:
        "Trận " +
        m[0] +
        " nhưng game không cho Tốc Chiến (đối thủ Tinh Anh hay Boss, hoặc khí huyết có lúc dưới 60%). Dừng để bạn tự đánh trong game (hoặc bật ô “Tự Đánh AI Khi Không Cho Tốc Chiến”).",
    };
  }
  if (run.active) {
    const a = run.active;
    if (opt.shopId && a.id === opt.shopId && g.shopView())
      return "idle";
    if (a.done) {
      let encView = null;
      try {
        if (typeof g.encounterView === "function")
          encView = g.encounterView();
      } catch (e) {}
      const encTen = (encView && encView.ten) || a.ten || a.id;
      const trans =
        (encView && encView.transcript) || a.transcript || [];
      const ketQua = (encView && encView.ketQua) || a.ketQua;

      // Trích xuất kết quả kiểm định & lời kể diễn biến từ transcript của game
      const resLines = trans.filter((t) => t.kind === "result");
      if (resLines.length > 0) {
        const resText = resLines
          .map((t) => t.text)
          .filter(Boolean)
          .join(" · ");
        if (resText) {
          auLog(
            "🎲 Kết quả kiểm tra: " + resText,
            /thất bại/i.test(resText) ? "vk-warn" : "vk-ok",
          );
        }
      }
      const narrateLines = trans.filter((t) => t.kind === "narrate");
      if (narrateLines.length > 0) {
        const lastNarrate = narrateLines[narrateLines.length - 1].text;
        if (lastNarrate) {
          auLog("📜 Diễn biến: «" + lastNarrate.trim() + "»", "vk-mu");
        }
      } else if (ketQua) {
        auLog("Kết quả: " + ketQua, "vk-mu");
      }

      // Cảnh báo tổn thương nếu thương thế tăng lên sau sự kiện
      const curRunBeforeClose = G().state && G().state.run;
      const curNv = curRunBeforeClose && curRunBeforeClose.nhanVat;
      if (
        curNv &&
        curNv.thuongThe != null &&
        st.lastThuongThe != null &&
        curNv.thuongThe > st.lastThuongThe
      ) {
        const ttName =
          AU_TT_TEN[Math.min(AU_TT_MAX, curNv.thuongThe)] ||
          "Bậc " + curNv.thuongThe;
        auLog(
          `⚠️ Tổn thương: Thương thế tăng lên mức «${ttName}» (${curNv.thuongThe}/${AU_TT_MAX}) do sự kiện gây ra!`,
          "vk-err",
        );
      }
      st.lastThuongThe = (curNv && curNv.thuongThe) || 0;

      const isRelicEv =
        opt.sdb &&
        (a.id.startsWith("ev.di_bao") || DIBAO.evMap.has(a.id));
      const r = auCall(() => g.closeEncounter());
      if (!r.ok) return { stop: "Không đóng được việc: " + r.err };
      if (encGivesTuVi(a.id) > 0) {
        st.tuViEventsDone = (st.tuViEventsDone || 0) + 1;
        auLog(
          "🎉 Hoàn tất sự kiện tăng tu vi «" + encTen + "» thành công!",
          "vk-ok",
        );
        // Ghi nhớ không quay lại sự kiện này tại vị trí hiện tại trong cùng phiên chạy (chống lặp vô tận)
        st.skipEnc = st.skipEnc || new Set();
        st.skipEnc.add(a.id);
        st.skipEnc.add(a.id + "@" + run.viTri);
        if (run.oNoi) st.skipEnc.add(a.id + "@" + run.oNoi);
        if (st.encAttempts) {
          delete st.encAttempts[a.id + "@" + run.viTri];
          delete st.encAttempts[a.id + "@" + run.oNoi];
        }
      }
      if (isRelicEv) {
        const curRun = G().state && G().state.run;
        const evObj = DIBAO.evMap.get(a.id);
        const hasRelic =
          evObj &&
          (typeof hasRelicItemInRun === "function"
            ? hasRelicItemInRun(evObj.relic, curRun)
            : checkOwnedRelic(evObj.relic, curRun));
        if (hasRelic) {
          st.relicsWon = (st.relicsWon || 0) + 1;
          auLog(
            "🎉 Hoàn tất sự kiện Dị Bảo! Đã đoạt bảo thành công (+5 Điểm Luân Hồi).",
            "vk-ok",
          );
        } else {
          auLog(
            "Đã hoàn tất sự kiện «" +
              encTen +
              "» nhưng chưa rơi Dị Bảo lần này (tỉ lệ rớt khi thắng là 7%, bảo vật đã nứt vỡ/tiêu tán theo kịch bản game và vào hồi chiêu 120 năm).",
            "vk-mu",
          );
        }
        removeDiBaoAlert();
        removeDiBaoMini();
        st.savedEnc = null;
        if (st.skipEnc) {
          st.skipEnc.delete(a.id);
        }
        if (st.encAttempts) {
          delete st.encAttempts[a.id + "@" + run.viTri];
          delete st.encAttempts[a.id + "@" + run.oNoi];
        }
      }
      return "ok";
    }
    if (a.waiting) {
      const wKind = a.waiting.kind || a.waiting;
      if (wKind === "xu_tri") {
        const cfgTc = (AU && AU.cfg && AU.cfg.tc) || {};
        const cfgSdb = (AU && AU.cfg && AU.cfg.sdb) || {};
        const cfgTl = (AU && AU.cfg && AU.cfg.tl) || {};
        const allowTha = opt.tl
          ? cfgTl.autoThaMang !== false
          : opt.sdb
            ? cfgSdb.autoThaMang !== false
            : cfgTc.autoThaMang !== false;
        if (allowTha) {
          let xuTriList = [];
          try {
            if (typeof g.cachXuTri === "function")
              xuTriList = g.cachXuTri();
          } catch (e) {}
          const canTha =
            !xuTriList.length || xuTriList.some((x) => x.id === "tha");
          if (canTha) {
            const rTha = auCall(() => {
              if (typeof g.xuTri === "function") g.xuTri("tha");
            });
            if (!rTha.ok) {
              return {
                stop: "Không thực hiện tha mạng được: " + rTha.err,
              };
            }
            auLog(
              "🤝 Đối thủ bại trận: Tự động chọn «Tha Mạng» (lưu cho một đường sống).",
              "vk-ok",
            );
            return "ok";
          }
        }
      } else if (wKind === "enemy_escape") {
        const cfgTc = (AU && AU.cfg && AU.cfg.tc) || {};
        const cfgSdb = (AU && AU.cfg && AU.cfg.sdb) || {};
        const cfgTl = (AU && AU.cfg && AU.cfg.tl) || {};
        const allowEscape = opt.tl
          ? cfgTl.autoEnemyEscape !== false
          : opt.sdb
            ? cfgSdb.autoEnemyEscape !== false
            : cfgTc.autoEnemyEscape !== false;
        if (allowEscape) {
          let pursuitOpts = [];
          try {
            if (typeof g.pursuitOptions === "function")
              pursuitOpts = g.pursuitOptions();
          } catch (e) {}
          const relOpt =
            pursuitOpts.find((o) => o.id === "release") ||
            pursuitOpts.find((o) => o.id !== "chase");
          const choiceId = relOpt ? relOpt.id : "release";
          const rPursuit = auCall(() => {
            if (typeof g.choosePursuit === "function")
              g.choosePursuit(choiceId);
          });
          if (rPursuit.ok) {
            auLog(
              "🏃 Kẻ địch tháo chạy: Tự động chọn «Buông Tha / Bỏ Qua» để tiếp tục hành trình.",
              "vk-mu",
            );
            return "ok";
          }
        }
      }
      if (wKind === "be_quan" || wKind === "teleport") {
        const rCloseWait = auCall(() => {
          if (typeof g.closeEncounter === "function") g.closeEncounter();
        });
        if (rCloseWait.ok) return "ok";
      }
      return {
        stop:
          "Có việc đang chờ bạn quyết định (" +
          wKind +
          "). Xử lý trong game rồi bấm chạy lại.",
      };
    }
    const v = g.encounterView();
    if (!v)
      return {
        stop: "Có việc dở mà Tool không đọc được. Xử lý trong game rồi bấm chạy lại.",
      };
    const pick = auPick(v, opt);
    if (!pick)
      return {
        stop:
          "Gặp việc cần bạn quyết định: “" +
          (v.ten || v.id) +
          "”. Xử lý trong game rồi bấm chạy lại.",
      };
    if (opt.hunt && opt.neHac && !pick.thoat) {
      const hacName = auEncounterHac(a, v, pick);
      if (hacName) {
        const cs = (v.choices || []).filter((c) => c.available),
          leave = cs.find((x) => x.thoat);
        if (!leave)
          return {
            stop:
              "Gặp " +
              hacName +
              " nhưng không có lựa chọn bỏ đi. Dừng để khỏi bị trừ Khí Vận.",
          };
        const rng0 = st.rngBeforeSan;
        const r = auCall(() => g.choose(leave.index));
        if (!r.ok)
          return {
            stop:
              "Không chọn được “" +
              leave.text +
              "” để né " +
              hacName +
              ": " +
              r.err,
          };
        st.hacSkipped = (st.hacSkipped || 0) + 1;
        auLog(
          "Gặp " +
            hacName +
            ": tự bỏ qua (" +
            leave.text +
            ") để khỏi bị trừ Khí Vận.",
          "vk-ok",
        );
        if (v.id === "ev.san_yeu") {
          st.hacSlot = run.viTri;
          st.hacStreak = (st.hacStreak || 0) + 1;
          const rng1 = G().state.run && G().state.run.rng;
          if (
            (rng0 !== undefined && rng1 === rng0) ||
            st.hacStreak >= 4
          ) {
            st.bad.add(run.viTri);
            st.hacStreak = 0;
            auLog(
              "Nơi này liên tục gặp Hạc, chuyển sang nơi săn khác.",
              "vk-mu",
            );
          }
        }
        return "ok";
      }
    }
    if (opt.hunt && pick.risk && !auColorOK(pick.risk.level, opt.mau)) {
      // lựa chọn giao chiến có màu ngoài danh sách được tích
      const m = auMauOf(pick.risk.level);
      return {
        stop:
          "Lựa chọn “" +
          pick.text +
          "” là " +
          m[0] +
          " (" +
          m[2] +
          "), ngoài màu đã chọn (" +
          auMauLabel(opt.mau) +
          "). Dừng để bạn tự quyết định trong game.",
        danger: pick.risk.level,
      };
    }
    if (opt.sdb && pick.risk && pick.risk.level === "tu_dia") {
      return {
        stop:
          "Lựa chọn «" +
          pick.text +
          "» là Tử Địa (nguy cơ mất mạng 100%). Dừng để an toàn!",
      };
    }
    if (opt.sdb && pick.thoat) {
      const isRelicEv =
        (v.id && v.id.startsWith("ev.di_bao")) ||
        DIBAO.ev.some((e) => e.id === v.id);
      if (isRelicEv) {
        st.skipEnc = st.skipEnc || new Set();
        st.skipEnc.add(v.id);
        const curSlot = run.oNoi != null ? run.oNoi : run.viTri;
        if (curSlot != null) st.skipEnc.add(v.id + "@" + curSlot);
        auLog(
          `⚠️ Không đủ điều kiện hoàn tất «${v.ten || v.id}» (phải chọn rút lui/bỏ đi). Tạm thời bỏ qua sự kiện này...`,
          "vk-warn",
        );
      }
    }
    const isFightChoice = !!(
      (opt.hunt || opt.sdb) &&
      (pick.risk ||
        v.id === "ev.san_yeu" ||
        v.id === "ev.yeu_thu_lang_thang" ||
        v.id === "ev.truy_tim_yeu" ||
        v.id === "ev.truy_tim_dau_dan" ||
        v.id === "ev.san_yeu_thu" ||
        v.id === "ev.tm_yeu_dau_dan" ||
        /chiến|đánh|săn|lùng/i.test(pick.text)) &&
      !pick.thoat
    );
    const isApexFight = isFightChoice && /đầu đàn/i.test(pick.text);
    // Ghi nhớ thương thế trước khi thực hiện lựa chọn
    const curNvBefore = run.nhanVat;
    st.lastThuongThe = (curNvBefore && curNvBefore.thuongThe) || 0;

    const pickDesc =
      (pick.text || "Lựa chọn") +
      (pick.chance ? ` [${pick.chance}]` : "");
    if (!isFightChoice) {
      auLog(`» Chọn: «${pickDesc}»...`, "vk-mu");
    } else if (isApexFight) {
      auLog(
        `👑 Nghênh chiến Yêu Thú Đầu Đàn (Tinh Anh · Tu Vi x3 · Rơi x1.5)...`,
        "vk-ok",
      );
    }
    const r = auCall(() => g.choose(pick.index));
    if (!r.ok)
      return { stop: "Không chọn được “" + pick.text + "”: " + r.err };
    const runAfter = G().state.run;
    if (isFightChoice && runAfter && !runAfter.tran) {
      // Trận được game tự giải quyết ngay trong choose() qua cơ chế "Tự Tốc Chiến" (tuTocChien) mà không mở màn hình vào trận (§10.4)
      st.fights = (st.fights || 0) + 1;
      if (!runAfter.ketThuc) st.wins = (st.wins || 0) + 1;
      st.hacStreak = 0;
      const winMsg = isApexFight
        ? `👑 Đã trảm Yêu Thú Đầu Đàn (Tinh Anh) thành công! (+6 Tu Vi · Trận #${st.fights}).`
        : `Đã hạ ${pick.text || "đối thủ"} (Trận #${st.fights}).`;
      auLog(winMsg, "vk-ok");
    }
    return "ok";
  }
  if (run.bienCo)
    return {
      stop: "Đang có biến cố chưa xử lý. Xem trong game rồi bấm chạy lại.",
    };
  return "idle";
}
function auPick(v, opt) {
  const cs = (v.choices || []).filter((c) => c.available);
  const isHuntingMode =
    (opt && (opt.hunt || opt.isDanhQuai)) ||
    (AU.cfg && AU.cfg.tl && AU.cfg.tl.mode === "danh_quai");

  // Ưu tiên số 1: Xử lý sự kiện Dị Bảo (tránh bị encGivesTuVi cướp quyền chọn nhánh phụ)
  const isRelicEv =
    (v && v.id && v.id.startsWith("ev.di_bao")) ||
    (v &&
      v.id &&
      typeof DIBAO !== "undefined" &&
      DIBAO.evMap &&
      DIBAO.evMap.has(v.id));
  if (isRelicEv || (opt && opt.sdb)) {
    if (isRelicEv && typeof findBestDiBaoChoice === "function") {
      const dbPick = findBestDiBaoChoice(v, cs);
      if (dbPick) return dbPick;
    }
    if (opt && opt.sdb && !isRelicEv) {
      // Nếu đang trên đường đi Săn Dị Bảo mà gặp sự kiện dọc đường không phải Dị Bảo: ưu tiên rút lui nhanh hoặc chọn nhánh an toàn không tốn phí
      const leaveRoad = cs.find(
        (x) =>
          x.thoat ||
          /rời|thôi|bỏ qua|tiếp tục lên đường|đi tiếp|quay đi|không quan tâm/i.test(
            x.text || "",
          ),
      );
      if (leaveRoad) return leaveRoad;
    }
  }

  // Xử lý riêng biệt cho Song Tu với Đạo Lữ (ev.song_tu):
  if (v.id === "ev.song_tu") {
    const cYear = cs.find(
      (c) => !c.thoat && /song tu một năm|song tu.*1 năm/i.test(c.text),
    );
    if (cYear) return cYear;
    if (isHuntingMode) {
      // Bên Đánh Quái: Tuyệt đối KHÔNG chọn "Song tu, cùng nhập định" (tránh bị kẹt vào bế quan nhập định)
      const leave = cs.find((x) => x.thoat || /thôi/i.test(x.text));
      if (leave) return leave;
      const nonMeditation = cs.find(
        (c) => !/nhập định|bế quan/i.test(c.text),
      );
      if (nonMeditation) return nonMeditation;
    }
  }

  if (encGivesTuVi(v.id) > 0) {
    const encDef = C().encounters && C().encounters.get(v.id);
    const activeScene =
      (G().state &&
        G().state.run &&
        G().state.run.active &&
        G().state.run.active.scene) ||
      null;
    const bestTv = findBestTuViChoice(encDef, cs, activeScene, opt);
    if (bestTv && bestTv.choice) return bestTv.choice;
    if (v.id === "ev.song_tu" && isHuntingMode) {
      const leave = cs.find((x) => x.thoat || /thôi/i.test(x.text));
      if (leave) return leave;
    }
    const nonThoat = cs.filter((c) => !c.thoat);
    if (nonThoat.length > 0) {
      if (v.id === "ev.song_tu" && isHuntingMode) {
        const safeChoice = nonThoat.find(
          (c) => !/nhập định|bế quan/i.test(c.text),
        );
        if (safeChoice) return safeChoice;
        const leave = cs.find((x) => x.thoat || /thôi/i.test(x.text));
        if (leave) return leave;
      }
      return nonThoat[0];
    }
  }
  if (opt.hunt) {
    const sanMucTieu = opt.sanMucTieu || "uu_tien_dau_dan";

    if (v.id === "ev.san_yeu") {
      const cBoss = cs.find((x) => !x.thoat && /đầu đàn/i.test(x.text));
      const cNorm = cs.find(
        (x) => !x.thoat && !/đầu đàn/i.test(x.text),
      );

      if (sanMucTieu === "chi_dau_dan") {
        if (
          cBoss &&
          (!cBoss.risk || auColorOK(cBoss.risk.level, opt.mau))
        ) {
          return cBoss;
        }
        const leave = cs.find((x) => x.thoat);
        if (leave) return leave;
      } else if (sanMucTieu === "thuong") {
        if (
          cNorm &&
          (!cNorm.risk || auColorOK(cNorm.risk.level, opt.mau))
        ) {
          return cNorm;
        }
      } else {
        // uu_tien_dau_dan (Mặc định)
        if (
          cBoss &&
          (!cBoss.risk || auColorOK(cBoss.risk.level, opt.mau))
        ) {
          return cBoss;
        }
        if (
          cNorm &&
          (!cNorm.risk || auColorOK(cNorm.risk.level, opt.mau))
        ) {
          return cNorm;
        }
      }
      const leave = cs.find((x) => x.thoat);
      if (leave) return leave;
    }

    if (v.id === "ev.truy_tim_dau_dan") {
      const c = cs.find((x) => !x.thoat);
      if (c && (!c.risk || auColorOK(c.risk.level, opt.mau))) return c;
      const leave = cs.find((x) => x.thoat);
      if (leave) return leave;
    }

    if (v.id === "ev.truy_tim_yeu") {
      const c = cs.find((x) => !x.thoat);
      if (c && (!c.risk || auColorOK(c.risk.level, opt.mau))) return c;
      const leave = cs.find((x) => x.thoat);
      if (leave) return leave;
    }

    if (v.id === "ev.yeu_thu_lang_thang") {
      const c = cs.find((x) => !x.thoat && !x.chance);
      if (c && (!c.risk || auColorOK(c.risk.level, opt.mau))) return c;
    }

    if (v.id === "ev.san_yeu_thu") {
      const c = cs.find(
        (x) => !x.thoat && /săn|chiến|đánh/i.test(x.text),
      );
      if (c && (!c.risk || auColorOK(c.risk.level, opt.mau))) return c;
    }

    if (v.id === "ev.tm_yeu_dau_dan") {
      const cHelp = cs.find(
        (x) => !x.thoat && /cùng.*ra tay/i.test(x.text),
      );
      const cDirect = cs.find(
        (x) => !x.thoat && /đầu đàn/i.test(x.text),
      );
      const pickTm = cHelp || cDirect;
      if (
        pickTm &&
        (!pickTm.risk || auColorOK(pickTm.risk.level, opt.mau))
      )
        return pickTm;
    }

    if (v.id === "ev.ls_bay_yeu_thu") {
      const cTha = cs.find((x) => /thả/i.test(x.text));
      const cDan = cs.find((x) => /yêu đan|kết liễu/i.test(x.text));
      return cTha || cDan || cs[0];
    }
  }
  if (opt.sdb) {
    if (typeof findBestDiBaoChoice === "function") {
      const bestDb = findBestDiBaoChoice(v, cs);
      if (bestDb) return bestDb;
    }
    const nonThoat = cs.filter((c) => !c.thoat);
    if (nonThoat.length > 0) return nonThoat[0];
  }
  return cs.find((x) => x.thoat) || null; // việc lạ: chọn lối thoát không tốn gì
}

// ── Vòng chạy chung
function auStart(kind, once) {
  if (kind === "km") {
    auStartKm(false);
    return;
  }
  if (AU.run && AU.run.running) {
    auPaint();
    return;
  }
  const g = G();
  if (!g || !g.state || !g.state.run) {
    UI.notify("Chưa có kiếp nào đang chơi.");
    return;
  }
  if (g.state.run.ketThuc) {
    UI.notify("Kiếp này đã kết thúc.");
    return;
  }
  auReadCfg(kind);
  AU.run = {
    kind,
    running: true,
    stop: false,
    once: !!once,
    fights: 0,
    wins: 0,
    hacSkipped: 0,
    hacStreak: 0,
    trips: 0,
    profit: 0,
    steps: 0,
    stuck: 0,
    phase: "plan",
    route: null,
    bad: new Set(),
    skipEnc: new Set(),
    encAttempts: {},
    tried: 0,
    msg: "",
    nam0: g.state.run.nam,
    lt0: g.state.run.nhanVat.linhThach,
    startTotalTuVi:
      g.state.run.nhanVat && typeof calcTotalTuVi === "function"
        ? calcTotalTuVi(g.state.run.nhanVat)
        : 0,
    tuViGained: 0,
    delay: (AU_TOC[AU.cfg[kind].toc] || AU_TOC.nhanh)[1],
    t0: performance.now(),
    retreatYearsDone: 0,
    breakouts: 0,
    breakoutFails: 0,
    bottlenecksBroken: 0,
    breakPillAttempts: 0,
    relicsWon: 0,
    tuViEventsDone: 0,
    targetTitle: "",
    phaseDesc: "",
  };
  auLog(
    kind === "buon"
      ? "Bắt đầu Auto Buôn Bán."
      : kind === "tl"
        ? "Bắt đầu Auto Tu Luyện & Đột Phá."
        : kind === "sdb"
          ? "Bắt đầu Auto Săn Dị Bảo."
          : "Bắt đầu Auto Săn Yêu.",
    "vk-ok",
  );
  drawTabs();
  auLoop();
}
function auStop(why) {
  const st = AU.run;
  if (!st || !st.running) return;
  st.stop = true;
  if (why) st.msg = why;
  if (st.kind === "km") S.kmAbort = true;
  auPaint();
}
async function auLoop() {
  const st = AU.run;
  try {
    if (!S.core)
      S.core = await loadCore((m) => {
        st.msg = m;
        auPaint();
      });
    let slice = performance.now();
    while (!st.stop) {
      if (!G().state.run || G().state.run.ketThuc) {
        st.msg = "Kiếp đã kết thúc.";
        break;
      }
      const sig0 = auSig();
      const res = await (st.kind === "buon"
        ? auBuonStep(st)
        : st.kind === "tl"
          ? auTlStep(st)
          : st.kind === "sdb"
            ? auSdbStep(st)
            : auSanStep(st));
      st.steps++;
      if (res && res.stop) {
        st.msg = res.stop;
        break;
      }
      if (auSig() === sig0 && st.phase !== "plan") {
        if (++st.stuck >= 4) {
          st.msg =
            "Không tiến triển thêm (trạng thái game đứng yên). Kiểm tra trong game rồi chạy lại.";
          break;
        }
      } else st.stuck = 0;
      if (st.steps >= 4000) {
        st.msg = "Đã chạy đủ 4000 bước, dừng để an toàn.";
        break;
      }
      if (st.once) {
        st.msg = "Đã chạy 1 bước.";
        break;
      }
      auPaintSoon();
      const minDelay = st.kind === "sdb" || st.kind === "tl" ? 60 : 0;
      const effectiveDelay = Math.max(st.delay || 0, minDelay);
      if (effectiveDelay > 0) {
        await auSleep(effectiveDelay);
        slice = performance.now();
      } else if (performance.now() - slice > 20) {
        await auYield();
        slice = performance.now();
      }
    }
  } catch (e) {
    console.error(e);
    st.msg = "Lỗi: " + ((e && e.message) || e);
  }
  st.running = false;
  st.stop = false;
  st.tEnd = performance.now();
  auLog(
    "Dừng: " + (st.msg || "theo yêu cầu") + ".",
    st.msg && /^Đã (chạy đủ|đánh đủ)/.test(st.msg) ? "vk-ok" : "vk-bad",
  );
  try {
    UI.notify("Tự Động dừng: " + (st.msg || "theo yêu cầu"));
  } catch (e) {
    /* bỏ qua */
  }
  if (auPT) {
    clearTimeout(auPT);
    auPT = 0;
  }
  drawTabs();
  auPaint();
}

