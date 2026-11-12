import { gWin, num, esc } from "../core/utils.js";
import { UI } from "../ui/shell.js";
import { S, body, loadCore, G, C, realmName, has, danger } from "../core/bridge.js";
import { drawTabs, refreshMiniStatus } from "../modules/navigation.js";
import { DIBAO, scanDiBao, hasRelicItemInRun, checkOwnedRelic, calcDiBaoPity, removeDiBaoAlert, removeDiBaoMini } from "../modules/di-bao.js";
import { BUILDS, HB_RATIO, HB_MAX_SKILLS } from "../modules/huong-build.js";
import { AU_TT_MAX, AU_TT_TEN, AU_MAU, auMauOf, AU_MAU_ID, AU_MAU_DEF, auMauNorm, auColorOK, auMauLabel, auIsHacEnemy, auEnemyName, auEncounterHac, AU, AU_TOC, calcTotalTuVi, encGivesTuVi, findBestTuViChoice, findBestDiBaoChoice, auYield, auSave, auSleep, auClamp, auLog, auPaintSoon, clearAuPaintTimer, auCall, auSig, auLifeLeft, auBattleLevel } from "./auto-core.js";
import { auFightInstant } from "./combat-ai.js";
import { AU_KM_MODE, AU_KM_IT, AU_KM_BK, auStartKm, auKmStatus } from "./auto-kinh-mach.js";
import { auSanStep, auTlStep } from "./auto-tu-luyen.js";
import { auSdbStep } from "./auto-di-bao.js";
import { auBuonStep } from "./auto-buon-ban.js";
import { rrPaint } from "./auto-reroll.js";
/**
 * Module: Bộ Điều Phối Vòng Lặp Auto Chung, Xử Lý Sự Kiện (auPending/auPick) & Ràng Buộc UI Auto
 */

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

  // Nếu đang chạy Auto Buôn Bán (opt.buon): ưu tiên rút lui/bỏ qua mọi sự kiện dọc đường để bảo toàn vốn & thời gian
  if (opt && opt.buon) {
    const leaveRoad = cs.find(
      (x) =>
        x.thoat ||
        /rời|thôi|bỏ qua|tiếp tục|đi tiếp|quay đi|không quan tâm|từ chối|nhường/i.test(
          x.text || "",
        ),
    );
    if (leaveRoad) return leaveRoad;
  }

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
      const phase0 = st.phase;
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
      if (auSig() === sig0 && st.phase === phase0 && st.phase !== "plan") {
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
  clearAuPaintTimer();
  drawTabs();
  auPaint();
}

// ── Giao diện
function auReadCfg(kind) {
  const q = (id) => body.querySelector("#" + id);
  const num0 = (id, lo, hi, d) => {
    const el = q(id);
    return el ? auClamp(el.value, lo, hi, d) : d;
  };
  const sel = (id, d) => {
    const el = q(id);
    return el ? el.value : d;
  };
  const c = AU.cfg[kind];
  if (kind === "tl") {
    const ck = (id, d) => {
      const el = q(id);
      return el ? !!el.checked : d;
    };
    c.mode = sel("au-tl-mode", c.mode || "be_quan");
    c.targetRealm = Math.floor(
      num0(
        "au-tl-realm",
        0,
        5,
        c.targetRealm != null ? c.targetRealm : 5,
      ),
    );
    c.targetSubRealm = Math.floor(
      num0(
        "au-tl-sub-realm",
        -1,
        4,
        c.targetSubRealm != null ? c.targetSubRealm : 3,
      ),
    );
    c.minSafeRate = num0("au-tl-rate", 30, 100, c.minSafeRate);
    c.minTho = num0("au-tl-tho", 1, 1000, c.minTho);
    c.toc = sel("au-toc", c.toc);
    c.useCultPills = ck("au-tl-cult-pills", c.useCultPills);
    c.useBreakPills = ck("au-tl-break-pills", c.useBreakPills);
    c.autoBeatDemons = ck("au-tl-demons", c.autoBeatDemons);
    c.autoBreakBottleneck = ck(
      "au-tl-bottleneck",
      c.autoBreakBottleneck,
    );
    c.autoThaMang = ck("au-tl-auto-tha", c.autoThaMang !== false);
    c.autoEnemyEscape = ck(
      "au-tl-enemy-escape",
      c.autoEnemyEscape !== false,
    );
    // Các tùy chọn khi chọn chế độ Đánh Quái (Săn Yêu):
    c.maxY = num0("au-tl-maxy", 0.5, 30, c.maxY != null ? c.maxY : 3);
    c.tran = Math.floor(
      num0("au-tl-tran", 0, 9999, c.tran != null ? c.tran : 20),
    );
    c.thuong = Math.floor(
      num0(
        "au-tl-thuong",
        1,
        AU_TT_MAX,
        c.thuong != null ? c.thuong : 2,
      ),
    );
    const k = q("au-tl-kt");
    if (k) c.kt = k.checked;
    const nh = q("au-tl-nehac");
    if (nh) c.neHac = nh.checked;
    const da = q("au-tl-danh-ai");
    if (da) c.danhAi = da.checked;
    c.uuTienSuKienTuVi = ck(
      "au-tl-tu-vi-events",
      c.uuTienSuKienTuVi !== false,
    );
    c.autoSongTu = ck("au-tl-song-tu", c.autoSongTu !== false);
    c.sanMucTieu = sel(
      "au-tl-san-target",
      c.sanMucTieu || "uu_tien_dau_dan",
    );
    c.autoDuongThuong = ck(
      "au-tl-auto-duong-thuong",
      c.autoDuongThuong !== false,
    );
    c.uuTienCapNen = ck(
      "au-tl-uu-tien-cap-nen",
      c.uuTienCapNen !== false,
    );
    const m = AU_MAU_ID.filter((x) => {
      const el = q("au-tl-mau-" + x);
      return el ? el.checked : (c.mau || []).includes(x);
    });
    if (m.length > 0) c.mau = auMauNorm(m);
    if (AU.cfg.san) {
      Object.assign(AU.cfg.san, {
        maxY: c.maxY,
        tran: c.tran,
        thuong: c.thuong,
        kt: c.kt,
        neHac: c.neHac,
        danhAi: c.danhAi,
        mau: c.mau,
        toc: c.toc,
        sanMucTieu: c.sanMucTieu,
        autoDuongThuong: c.autoDuongThuong,
        uuTienCapNen: c.uuTienCapNen,
      });
    }
    auSave();
    return;
  }
  if (kind === "tc") {
    const ck = (id, d) => {
      const el = q(id);
      return el ? !!el.checked : d;
    };
    c.autoCombatOverlay = ck("au-tc-overlay", c.autoCombatOverlay);
    c.autoInCombat = ck("au-tc-auto-in-combat", c.autoInCombat);
    c.aiEngineMode = sel("au-tc-ai-mode", c.aiEngineMode || "smart_v3");
    c.itemPolicy = sel("au-tc-item-policy", c.itemPolicy || "auto");
    c.speed = sel("au-tc-speed", c.speed || "normal");
    c.targetPrio = sel("au-tc-target-prio", c.targetPrio || "smart");
    c.teHuyetMode = sel("au-tc-te-huyet", c.teHuyetMode || "off");
    c.healPillMode = sel("au-tc-heal-mode", c.healPillMode || "smart");
    c.healHpThreshold = num0(
      "au-tc-heal-hp",
      10,
      85,
      c.healHpThreshold,
    );
    c.healBossPanicHp = num0(
      "au-tc-heal-panic-hp",
      20,
      90,
      c.healBossPanicHp != null ? c.healBossPanicHp : 55,
    );
    c.spiritPillMode = sel(
      "au-tc-spirit-mode",
      c.spiritPillMode || "on_demand",
    );
    c.spiritThreshold = num0(
      "au-tc-spirit-mp",
      0,
      85,
      c.spiritThreshold != null ? c.spiritThreshold : 20,
    );
    c.burstPillMode = sel(
      "au-tc-burst-mode",
      c.burstPillMode || "boss_combo",
    );
    c.useBurstPill = c.burstPillMode !== "off";
    c.cleansePillMode = ck(
      "au-tc-cleanse-pill",
      c.cleansePillMode !== false,
    );
    c.maxDrugResistance = num0(
      "au-tc-max-resist",
      15,
      95,
      c.maxDrugResistance,
    );
    c.maxPillGradeNormal = Math.floor(
      num0(
        "au-tc-pill-grade-norm",
        1,
        8,
        c.maxPillGradeNormal != null ? c.maxPillGradeNormal : 4,
      ),
    );
    c.maxPillGrade = Math.floor(
      num0("au-tc-pill-grade", 1, 8, c.maxPillGrade || 6),
    );
    c.shieldTalismanMode = sel(
      "au-tc-shield-tal-mode",
      c.shieldTalismanMode || "predictive",
    );
    c.smartShield = c.shieldTalismanMode !== "off";
    c.shieldHpThreshold = num0(
      "au-tc-shield-hp",
      15,
      90,
      c.shieldHpThreshold != null ? c.shieldHpThreshold : 55,
    );
    c.ccTalismanMode = sel(
      "au-tc-cc-tal-mode",
      c.ccTalismanMode || "interrupt",
    );
    c.smartCc = c.ccTalismanMode !== "off";
    c.atkTalismanMode = sel(
      "au-tc-atk-tal-mode",
      c.atkTalismanMode || "smart_weave",
    );
    c.useAttackTalismans = c.atkTalismanMode !== "off";
    c.talismanGradeNormal = Math.floor(
      num0(
        "au-tc-talisman-grade-norm",
        1,
        8,
        c.talismanGradeNormal != null ? c.talismanGradeNormal : 4,
      ),
    );
    c.talismanGrade = Math.floor(
      num0("au-tc-talisman-grade", 1, 8, c.talismanGrade || 6),
    );
    c.formationMode = sel(
      "au-tc-formation-mode",
      c.formationMode || "boss_or_danger",
    );
    c.saveFamiliars = ck("au-tc-familiars", c.saveFamiliars !== false);
    c.recallPetHp = num0(
      "au-tc-recall-pet-hp",
      10,
      60,
      c.recallPetHp != null ? c.recallPetHp : 25,
    );
    c.healSkillThreshold = num0(
      "au-tc-heal-skill-hp",
      20,
      95,
      c.healSkillThreshold != null ? c.healSkillThreshold : 75,
    );
    c.shieldSkillThreshold = num0(
      "au-tc-shield-skill-hp",
      10,
      85,
      c.shieldSkillThreshold != null ? c.shieldSkillThreshold : 40,
    );
    c.preventOverkill = ck(
      "au-tc-prevent-overkill",
      c.preventOverkill !== false,
    );
    c.aoePriority = ck("au-tc-aoe-prio", c.aoePriority !== false);
    c.prioritizeNatal = ck(
      "au-tc-natal-prio",
      c.prioritizeNatal !== false,
    );
    c.autoNormalAttack = ck(
      "au-tc-normal-attack",
      c.autoNormalAttack !== false,
    );
    c.smartFinisher = ck(
      "au-tc-smart-finisher",
      c.smartFinisher !== false,
    );
    c.comboSequence = ck("au-tc-combo", c.comboSequence !== false);
    c.emergencyThieuDot = ck(
      "au-tc-thieu-dot",
      c.emergencyThieuDot !== false,
    );
    c.thieuDotHp = num0(
      "au-tc-thieu-dot-hp",
      10,
      50,
      c.thieuDotHp != null ? c.thieuDotHp : 20,
    );
    c.emergencyEscape = ck(
      "au-tc-emergency-escape",
      !!c.emergencyEscape,
    );
    c.escapeHp = num0(
      "au-tc-escape-hp",
      5,
      45,
      c.escapeHp != null ? c.escapeHp : 16,
    );
    c.autoThaMang = ck("au-tc-auto-tha", c.autoThaMang !== false);
    c.autoEnemyEscape = ck(
      "au-tc-enemy-escape",
      c.autoEnemyEscape !== false,
    );
    auSave();
    return;
  }
  if (kind === "km") {
    const ck = (id, d) => {
      const el = q(id);
      return el ? !!el.checked : d;
    };
    const pick = (id, ok, d) => {
      const v = sel(id, d);
      return ok.map(String).includes(String(v)) ? v : d;
    };
    c.mode = pick(
      "au-km-mode",
      AU_KM_MODE.map((x) => x[0]),
      c.mode,
    );
    c.dir = pick("au-km-dir", ["", "tien", "ma"], c.dir);
    c.kb = sel("au-km-kb", c.kb);
    if (c.kb && !BUILDS.some((x) => x.k === c.kb)) c.kb = "";
    c.iters = Number(
      pick(
        "au-km-it",
        AU_KM_IT.map((x) => x[0]),
        c.iters,
      ),
    );
    c.ratio = pick("au-km-ratio", Object.keys(HB_RATIO), c.ratio);
    c.maxSkills = pick(
      "au-km-maxskills",
      Object.keys(HB_MAX_SKILLS),
      c.maxSkills != null ? String(c.maxSkills) : "3",
    );
    c.bk = AU_KM_BK;
    c.prio = ck("au-km-prio", c.prio);
    c.two = ck("au-km-two", c.two);
    c.keep = pick("au-km-keep", ["tu", "danh"], c.keep);
    c.moBo = ck("au-km-mobo", c.moBo);
    c.mo = ck("au-km-mo", c.mo);
    c.moMax = Math.floor(num0("au-km-momax", 1, 20, c.moMax));
    c.tayO = ck("au-km-tayo", c.tayO);
    c.tayMax = Math.floor(
      num0("au-km-taymax", 1, 20, c.tayMax != null ? c.tayMax : 3),
    );
    c.watch = ck("au-km-watch", c.watch);
    auSave();
    return;
  }
  if (kind === "sdb") {
    const ck = (id, d) => {
      const el = q(id);
      return el ? !!el.checked : d;
    };
    c.uuTienTheoHon = ck("au-sdb-uutien", c.uuTienTheoHon !== false);
    c.boQuaDaCo = ck("au-sdb-boda", c.boQuaDaCo !== false);
    c.dungTruyenTong = ck("au-sdb-tele", c.dungTruyenTong !== false);
    c.danhAi = ck("au-sdb-danh-ai", c.danhAi !== false);
    c.autoThaMang = ck("au-sdb-auto-tha", c.autoThaMang !== false);
    c.autoEnemyEscape = ck(
      "au-sdb-enemy-escape",
      c.autoEnemyEscape !== false,
    );
    c.sanMoiDiBaoXuatThe = ck(
      "au-sdb-san-moi",
      c.sanMoiDiBaoXuatThe !== false,
    );
    c.autoQuickSave = ck("au-sdb-auto-qs", !!c.autoQuickSave);
    c.minWinRate = num0("au-sdb-winrate", 10, 100, c.minWinRate || 70);
    c.cheDoCho = sel("au-sdb-chedo", c.cheDoCho || "camp");
    c.minTho = num0("au-sdb-tho", 1, 1000, c.minTho || 15);
    c.tho = c.minTho;
    c.maxNam = num0("au-sdb-maxnam", 1, 1000, c.maxNam || 100);
    c.toc = sel("au-toc", c.toc || "nhanh");
    const relicChks = body.querySelectorAll(".au-sdb-relic-chk");
    if (relicChks.length > 0) {
      c.targetRelics = Array.from(relicChks)
        .filter((el) => el.checked)
        .map((el) => el.getAttribute("data-relic"));
    }
    auSave();
    return;
  }
  if (kind === "buon") {
    c.maxY = num0("au-maxy", 0.5, 30, c.maxY);
    c.banY = num0("au-bany", 0.5, 60, c.banY);
    c.von = num0("au-von", 1, 100, c.von);
    c.giu = num0("au-giu", 0, 1e9, c.giu);
    c.lai = num0("au-lai", 1, 500, c.lai);
    c.chuyen = Math.floor(num0("au-chuyen", 1, 999, c.chuyen));
    c.tho = num0("au-tho", 0, 1e4, c.tho);
    c.hiem = sel("au-hiem", c.hiem);
    c.toc = sel("au-toc", c.toc);
  } else {
    c.maxY = num0("au-maxy", 0.5, 30, c.maxY);
    c.tran = Math.floor(num0("au-tran", 1, 9999, c.tran));
    c.tho = num0("au-tho", 0, 1e4, c.tho);
    c.thuong = Math.floor(num0("au-thuong", 1, AU_TT_MAX, c.thuong));
    c.toc = sel("au-toc", c.toc);
    const k = q("au-kt");
    if (k) c.kt = k.checked;
    const nh = q("au-nehac");
    if (nh) c.neHac = nh.checked;
    const dai = q("au-danh-ai");
    if (dai) c.danhAi = dai.checked;
    const mau = AU_MAU_ID.filter((id) => {
      const el = q("au-mau-" + id);
      return el ? el.checked : (c.mau || AU_MAU_DEF).includes(id);
    });
    if (mau.length) c.mau = mau;
    else {
      // phải giữ ít nhất một màu: trả lại lựa chọn cũ
      c.mau = auMauNorm(c.mau);
      AU_MAU_ID.forEach((id) => {
        const el = q("au-mau-" + id);
        if (el) el.checked = c.mau.includes(id);
      });
      try {
        UI.notify("Cần giữ ít nhất một màu. Đã trả lại lựa chọn cũ.");
      } catch (e) {
        /* bỏ qua */
      }
    }
  }
  auSave();
}
const auFld = (id, lab, v, hint) =>
  `<label class="vkx-fld-tile"><div class="vkx-fld-top"><span class="vkx-fld-lbl">${lab}</span>${hint ? `<em class="vkx-fld-hint">${hint}</em>` : ""}</div><input class="vk-sel vkx-fld-ctl" id="${id}" type="number" step="any" value="${v}"></label>`;
const auHiemSel = (v) =>
  `<label class="vkx-fld-tile"><div class="vkx-fld-top"><span class="vkx-fld-lbl">🛡️ Độ Nguy Hiểm Tối Đa</span></div><select class="vk-sel vkx-fld-ctl" id="au-hiem"><option value="an_toan" ${v === "an_toan" ? "selected" : ""}>🟢 An Toàn</option><option value="ngang_suc" ${v === "ngang_suc" ? "selected" : ""}>🟡 Vừa Sức</option></select></label>`;
const auTocSel = (v) =>
  `<label class="vkx-fld-tile"><div class="vkx-fld-top"><span class="vkx-fld-lbl">⚡ Tốc Độ Nhịp Auto</span><em class="vkx-fld-hint">Máy yếu chọn Vừa</em></div><select class="vk-sel vkx-fld-ctl" id="au-toc">${Object.entries(
    AU_TOC,
  )
    .map(
      ([k, t]) =>
        `<option value="${k}" ${v === k ? "selected" : ""}>${t[0]}</option>`,
    )
    .join("")}</select></label>`;
const auTTSel = (v, id = "au-thuong") =>
  `<label class="vkx-fld-tile"><div class="vkx-fld-top"><span class="vkx-fld-lbl">🩸 Ngưỡng Dừng Thương Thế</span></div><select class="vk-sel vkx-fld-ctl" id="${id}">${[
    1, 2, 3,
  ]
    .filter((i) => i <= AU_TT_MAX)
    .map(
      (i) =>
        `<option value="${i}" ${Number(v) === i ? "selected" : ""}>${esc(AU_TT_TEN[i])}</option>`,
    )
    .join("")}</select></label>`;
function auStatusHtml(kind) {
  const st = AU.run,
    run = G() && G().state.run;
  if (!st || st.kind !== kind)
    return '<div class="vk-mu" style="font-size:13px">Chưa chạy.</div>';
  if (kind === "km") return auKmStatus(st);
  const nv = run ? run.nhanVat : null;
  const rows = [
    [
      "Trạng Thái",
      st.running ? '<span class="vk-ok">Đang chạy…</span>' : "Đã dừng",
    ],
    ["Lý Do Dừng", st.running ? "—" : esc(st.msg || "—")],
  ];
  if (kind === "sdb") {
    const g2 = G(),
      run2 = g2 && g2.state && g2.state.run,
      nv2 = run2 && run2.nhanVat;
    const sc2 = run2 ? scanDiBao([run2, g2.state.meta]) : null;
    const metaRelics2 =
      g2 &&
      g2.state &&
      g2.state.meta &&
      g2.state.meta.tienLo &&
      g2.state.meta.tienLo.relics
        ? g2.state.meta.tienLo.relics
        : [];
    const pity2 =
      run2 && nv2 && sc2
        ? calcDiBaoPity(run2, nv2, sc2)
        : { waitYears: 0, mult: 1 };
    rows.push(["Dị Bảo Đoạt Được", (st.relicsWon || 0) + " món"]);
    rows.push([
      "Bảo Lục Luân Hồi",
      metaRelics2.length +
        " / 21 (+ " +
        metaRelics2.length * 5 +
        " điểm)",
    ]);
    rows.push([
      "Thiên Đạo Bù (Pity)",
      pity2.guaranteed
        ? '<b class="vk-ok" style="color:#ef4444">100% XUẤT THẾ (Rơi khi thắng: 7%)</b>'
        : pity2.waitYears + " / 500 năm (×" + pity2.mult + ")",
    ]);
    rows.push([
      "Mục Tiêu Đang Săn",
      esc(st.targetTitle || "Đang quét bản đồ…"),
    ]);
    rows.push([
      "Hành Động Hiện Tại",
      esc(
        st.phaseDesc ||
          (st.camping ? "Cắm trại tại " + st.camping : "—"),
      ),
    ]);
  } else if (kind === "tl") {
    const tr = Number(
      AU.cfg.tl.targetRealm != null ? AU.cfg.tl.targetRealm : 5,
    );
    const tsr = Number(
      AU.cfg.tl.targetSubRealm != null ? AU.cfg.tl.targetSubRealm : 3,
    );
    const subRealmNames = [
      "Sơ kỳ",
      "Trung kỳ",
      "Hậu kỳ",
      "Đại viên mãn",
      "Đại viên mãn (Đầy 100%)",
    ];
    let targetLabel = "♾️ Không Giới Hạn (Farm Liên Tục)";
    if (tr > 0) {
      targetLabel = realmName(tr);
      if (tsr >= 0 && tsr <= 4) {
        targetLabel += " · " + subRealmNames[tsr];
      }
    }
    rows.push(["Cảnh Giới Đích", esc(targetLabel)]);
    rows.push([
      "Phương Thức Tu Luyện",
      AU.cfg.tl.mode === "danh_quai"
        ? "⚔️ Đánh Quái (Săn Yêu Thú)"
        : "🧘 Bế Quan (Nhập Định)",
    ]);
    // Tính toán tổng lượng tu vi đã tăng trong phiên Auto
    try {
      const runNow = G().state && G().state.run;
      if (
        runNow &&
        runNow.nhanVat &&
        typeof calcTotalTuVi === "function"
      ) {
        const nowTotal = calcTotalTuVi(runNow.nhanVat);
        if (st.startTotalTuVi == null) st.startTotalTuVi = nowTotal;
        st.tuViGained = Math.max(0, nowTotal - st.startTotalTuVi);
      }
    } catch (e) {}
    rows.push([
      "Tu Vi Đã Tăng",
      '<b class="vk-ok" style="color:var(--acc, #10b981)">+' +
        num(Math.round((st.tuViGained || 0) * 10) / 10) +
        "</b>",
    ]);
    if (AU.cfg.tl.mode === "danh_quai") {
      rows.push([
        "Số Trận Đã Đánh",
        (st.fights || 0) + " (thắng " + (st.wins || 0) + ")",
      ]);
      if (st.tuViEventsDone) {
        rows.push(["Sự Kiện Tu Vi Đã Qua", st.tuViEventsDone + " lần"]);
      }
      if (st.hacSkipped) rows.push(["Số Lần Né Hạc", st.hacSkipped]);
    } else {
      rows.push([
        "Số Năm Đã Bế Quan",
        num(st.retreatYearsDone || 0) + " năm",
      ]);
    }
    rows.push(["Đột Phá Thành Công", (st.breakouts || 0) + " lần"]);
    if (st.breakoutFails)
      rows.push(["Đột Phá Thất Bại", st.breakoutFails + " lần"]);
    if (st.bottlenecksBroken)
      rows.push(["Bình Cảnh Đã Phá", st.bottlenecksBroken + " lần"]);
  } else if (kind === "san") {
    rows.push([
      "Số Trận Đã Đánh",
      st.fights + " (thắng " + st.wins + ")",
    ]);
    if (st.hacSkipped) rows.push(["Số Lần Né Hạc", st.hacSkipped]);
  } else {
    rows.push(["Số Chuyến Đã Xong", st.trips]);
    rows.push(["Lãi Ròng", Math.round(st.profit) + " Linh Thạch"]);
    if (st.running && st.route)
      rows.push([
        "Đang Làm",
        esc(st.route.it.ten) +
          " · " +
          esc(
            {
              plan: "Lập kế hoạch",
              toBuy: "Đi tới nơi mua",
              buy: "Đang mua",
              pickSell: "Dò nơi bán",
              toSell: "Đi tới nơi bán",
              sell: "Đang bán",
            }[st.phase] || st.phase,
          ),
      ]);
  }
  rows.push([
    "Tốc Độ Thực",
    num(
      st.steps /
        Math.max(
          0.001,
          ((st.tEnd || performance.now()) - st.t0) / 1000,
        ),
      1,
    ) + " bước/giây",
  ]);
  if (nv && run) {
    rows.push(["Năm Đã Trôi", num(run.nam - st.nam0)]);
    rows.push([
      "Linh Thạch Thay Đổi",
      (Math.floor(nv.linhThach) - st.lt0 >= 0 ? "+" : "") +
        (Math.floor(nv.linhThach) - st.lt0),
    ]);
    rows.push(["Thọ Nguyên Còn", Math.floor(auLifeLeft()) + " năm"]);
  }
  return `<div class="vkx-tele-grid">` + rows
    .map(
      (r) =>
        `<div class="vkx-tele-box"><span class="vkx-tele-lbl">${r[0]}</span><b class="vkx-tele-val">${r[1]}</b></div>`,
    )
    .join("") + `</div>`;
}
function auLogHtml() {
  return AU.log.length
    ? AU.log
        .slice(-30)
        .reverse()
        .map(
          (l) =>
            `<div class="${l.cls}" style="font-size:12px;margin:2px 0">${esc(l.msg)}</div>`,
        )
        .join("")
    : '<div class="vk-mu" style="font-size:12px">Chưa có nhật ký.</div>';
}
function auPaint() {
  refreshMiniStatus();
  if (!UI.isOpen()) return;
  if (S.tab === "arr") {
    rrPaint();
    return;
  }
  if (S.tab === "db") {
    const run = AU.run && AU.run.running && AU.run.kind === "sdb";
    const box = body.querySelector("#db-auto-box");
    const pill = body.querySelector("#db-auto-status-pill");
    const txt = body.querySelector("#db-auto-status-text");
    const btn = body.querySelector("#db-auto-toggle");
    if (box) box.style.borderColor = run ? "#3ddc97" : "var(--line)";
    if (pill) {
      pill.textContent = run ? "● ĐANG CHẠY" : "○ TẠM DỪNG";
      pill.style.background = run
        ? "rgba(61,220,151,0.2)"
        : "rgba(255,255,255,0.08)";
      pill.style.color = run ? "#3ddc97" : "var(--mut)";
      pill.style.border = run
        ? "1px solid #3ddc97"
        : "1px solid transparent";
    }
    if (txt) {
      if (run) {
        txt.textContent =
          AU.run.phaseDesc ||
          AU.run.targetTitle ||
          "Đang quét bản đồ & săn Dị Bảo...";
      } else if (AU.run && AU.run.kind === "sdb" && AU.run.msg) {
        txt.innerHTML = `<span class="vk-bad">Dừng: ${esc(AU.run.msg)}</span>`;
      } else {
        txt.textContent =
          "Tự động truyền tống/bay đến mục tiêu, vào sự kiện, vượt kiểm định & đánh Hộ Vệ.";
      }
    }
    if (btn) {
      btn.textContent = run ? "⏹ Dừng Auto" : "▶ Bắt Đầu Săn";
      btn.style.background = run ? "#f87171" : "var(--acc)";
    }
    const tgtEl = body.querySelector("#db-auto-target-text");
    if (tgtEl) {
      const sdbCfg = AU.cfg && AU.cfg.sdb ? AU.cfg.sdb : {};
      const validEvs = DIBAO.ev.filter(
        (e) => e && e.relic && typeof e.relic === "string" && e.relic.trim() !== "",
      );
      const targetRelics = (
        Array.isArray(sdbCfg.targetRelics)
          ? sdbCfg.targetRelics
          : validEvs.map((e) => e.relic)
      ).filter((r) => r && typeof r === "string" && r.trim() !== "");
      tgtEl.innerHTML =
        targetRelics.length === validEvs.length
          ? "Tất cả 19 Dị Bảo"
          : targetRelics.length === 0
            ? '<span class="vk-bad">Chưa chọn món nào</span>'
            : `<b>${targetRelics.length}</b>/19 Dị Bảo đã chọn`;
    }
    return;
  }
  const kind =
    S.tab === "abb"
      ? "buon"
      : S.tab === "asy"
        ? "san"
        : S.tab === "akm"
          ? "km"
          : S.tab === "atl"
            ? "tl"
            : S.tab === "asdb"
              ? "sdb"
              : null;
  if (!kind) return;
  const a = body.querySelector("#au-st"),
    b = body.querySelector("#au-lg");
  if (a) a.innerHTML = auStatusHtml(kind);
  if (b) b.innerHTML = auLogHtml();
  const run = AU.run && AU.run.running;
  body.querySelectorAll(".au-go").forEach((x) => {
    x.disabled = !!run;
  });
  const sp = body.querySelector("#au-stop");
  if (sp) sp.disabled = !run;
}
function auControls() {
  return `<div class="vkx-cmd-dock"><button class="vk-btn au-go vkx-cmd-run" id="au-run">▶ Khởi Động Auto</button><button class="vk-btn sec au-go vkx-cmd-step" id="au-one">⏭ Chạy 1 Bước</button><button class="vk-btn sec vkx-cmd-stop" id="au-stop">⏹ Dừng Khẩn Cấp</button></div>`;
}
function auBind(kind) {
  body.querySelectorAll("input,select").forEach((el) => {
    el.onchange = () => auReadCfg(kind);
  });
  body.querySelector("#au-run").onclick = () => auStart(kind, false);
  body.querySelector("#au-one").onclick = () => auStart(kind, true);
  body.querySelector("#au-stop").onclick = () => auStop("Bạn bấm Dừng");
  auPaint();
}
const AU_MAU_ACT = {
  an_toan: "Tự săn, tự Tốc Chiến.",
  ngang_suc: "Tự săn, tự Tốc Chiến (có thể mang thương).",
  hiem: "Tự tới nơi và chọn giao chiến. Game dự đoán thua nên không cho Tốc Chiến: Auto dừng ngay khi trận mở để bạn tự đánh.",
  tu_dia:
    "Như Đỏ (kể cả “thần thức không dò ra”) nhưng là tử địa, rủi ro chết rất cao: chỉ tích khi bạn chắc chắn.",
};
const auMauHtml = (mau, prefix = "au-mau") =>
  AU_MAU_ID.map((k) => {
    const m = AU_MAU[k];
    return `<label class="vk-lg" style="cursor:pointer;align-items:flex-start"><input type="checkbox" id="${prefix}-${k}" ${mau.includes(k) ? "checked" : ""} style="margin-top:5px"><span class="vk-sw" style="background:${m[1]}">${m[0].charAt(0)}</span><span><b>${m[0]}</b> · ${esc(m[2])}<br><span class="vk-mu" style="font-size:12px">${esc(AU_MAU_ACT[k])}</span></span></label>`;
  }).join("");

export {
  auPending,
  auPick,
  auStart,
  auStop,
  auLoop,
  auReadCfg,
  auFld,
  auHiemSel,
  auTocSel,
  auTTSel,
  auStatusHtml,
  auLogHtml,
  auPaint,
  auControls,
  auBind,
  AU_MAU_ACT,
  auMauHtml,
};

Object.assign(gWin, {
  auPending,
  auPick,
  auStart,
  auStop,
  auLoop,
  auReadCfg,
  auFld,
  auHiemSel,
  auTocSel,
  auTTSel,
  auStatusHtml,
  auLogHtml,
  auPaint,
  auControls,
  auBind,
  AU_MAU_ACT,
  auMauHtml,
});
