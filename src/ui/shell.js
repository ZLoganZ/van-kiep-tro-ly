import { gWin, TOOL_VER } from "../core/utils.js";
import { UI_CSS } from "../styles/ui-css.js";
/**
 * Module: Giao Diện Chung (UI Shell & Responsive Fit Engine)
 */
/* ═══════════════ GIAO DIỆN CHUNG (SHELL) ═══════════════ */
var UI = (function () {
  var THEMES = [
    ["thaiHu", "🌌 Thái Hư Tinh Không"],
    ["kimQue", "👑 Thiên Đình Kim Quế"],
    ["thanhLuan", "🌿 Thanh Luân Tiên Cảnh"],
    ["huyetMa", "🩸 Cửu U Huyết Nguyệt"],
    ["tuLoi", "⚡ Tử Tiêu Lôi Vực"],
    ["huyenMac", "📜 Thủy Mặc Cổ Quyển"],
  ];
  function ls(k, v) {
    try {
      if (v === undefined) return localStorage.getItem(k);
      localStorage.setItem(k, v);
    } catch (e) {}
    return null;
  }

  var old = document.getElementById("vkx-win");
  if (old) old.remove();
  ["vkx-fab", "vkx-toast", "vkx-style"].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.remove();
  });

  var style = document.createElement("style");
  style.id = "vkx-style";
  style.textContent = UI_CSS;
  document.head.appendChild(style);

  var win = document.createElement("div");
  win.id = "vkx-win";
  var themeChipsHtml = THEMES.map(function (t) {
    return '<button type="button" class="vkx-theme-chip" data-th="' + t[0] + '">' + t[1] + "</button>";
  }).join("");
  win.innerHTML =
    '<div class="vkx-hd" id="vkx-hd">' +
    '<div class="vkx-logo" title="Thiên Cơ Tinh Bàn v' + TOOL_VER + '">☯</div>' +
    '<div class="vkx-ttl"><b>Vạn Kiếp Trợ Lý · Tinh Bàn</b>' +
    '<div class="vkx-ttl-sub"><span id="vkx-theme-lbl">🌌 Thái Hư Tinh Không</span> · <span id="vkx-layout-lbl">Neo Phải</span><em class="vkx-ver">v' +
    TOOL_VER +
    "</em></div></div>" +
    '<button class="vkx-ib" id="vkx-qbtn" title="Tìm nhanh chức năng / Tab & Đổi Chủ Đề (Phím tắt: Ctrl+K)">🔎</button>' +
    '<button class="vkx-ib" id="vkx-layout" title="Đổi bố cục: Neo Phải / Neo Trái / Đại Tinh Bàn Toàn Cảnh">◫</button>' +
    '<button class="vkx-ib" id="vkx-theme" title="Đổi Chủ Đề Linh Giới (6 hệ màu)">🎨</button>' +
    '<button class="vkx-ib" id="vkx-zoom" title="Cỡ giao diện (Tự động · 85% … 150%)">🔍</button>' +
    '<button class="vkx-ib" id="vkx-min" title="Thu nhỏ thành thanh nổi (Alt+M hoặc đúp chuột tiêu đề)">—</button>' +
    '<button class="vkx-ib x" id="vkx-close" title="Đóng cửa sổ (Esc / Alt+T)">✕</button>' +
    "</div>" +
    '<div id="vkx-char-hud">' +
    '<div class="vkx-hud-pills" id="vkx-char-pills">' +
    '<span class="vkx-hud-pill realm">☯ Thiên Cơ Tinh Bàn v' + TOOL_VER + '</span>' +
    '<span class="vkx-hud-pill">Sẵn sàng đồng bộ linh thức…</span>' +
    "</div>" +
    '<button type="button" class="vkx-hud-qsave" id="vkx-hud-qsave-btn" title="Lưu nhanh điểm dự phòng (Quick Save)">⚡ Lưu Nhanh</button>' +
    "</div>" +
    '<div id="vkx-qbar"><input id="vkx-qbar-inp" type="search" placeholder="🔎 Gõ tên tab hoặc tính năng (vd: kinh mạch, dị bảo, đột phá, lưu save, tác chiến)..." autocomplete="off"><div class="vkx-theme-strip">' + themeChipsHtml + '</div><div id="vkx-qbar-hits"></div></div>' +
    '<div class="vkx-seg"><button data-s="tl">🔮 Đài Chỉ Huy Trợ Lý</button><button data-s="nk">📜 Nhật Ký Phiên Bản</button></div>' +
    '<div id="vkx-mini-status" class="vkx-mini-bar" style="display:none"></div>' +
    '<div class="vkx-sec" id="vkx-sec-nk"><div class="vkx-scroll" id="vkx-nk-body"></div></div>' +
    '<div class="vkx-sec" id="vkx-sec-tl">' +
    '<div class="vkx-tabbar"><div id="vkx-groups"><div class="vkx-tab-glider"></div></div><button class="vk-btn sec" id="vk-rf" style="margin:0;padding:8px 12px;font-size:13px" title="Làm mới dữ liệu tab hiện tại">↻</button></div>' +
    '<div class="vkx-subbar"><div id="vkx-tabs"><div class="vkx-tab-glider"></div></div></div>' +
    '<div class="vkx-scroll" id="vkx-body"></div>' +
    "</div>";
  document.body.appendChild(win);

  var fab = document.createElement("button");
  fab.id = "vkx-fab";
  fab.title = "Mở Vạn Kiếp Trợ Lý · Thiên Cơ Tinh Bàn (Kéo để di chuyển)";
  fab.innerHTML = '<span class="vkx-g">☯</span><span class="vkx-s">Tinh Bàn</span>';
  document.body.appendChild(fab);

  var toastEl = document.createElement("div");
  toastEl.id = "vkx-toast";
  document.body.appendChild(toastEl);

  /* ---- Title Case cho giao diện (Tối ưu hóa: loại bỏ MutationObserver toàn cục) ---- */
  var flushTitleCase = null;
  (function () {
    var RE = /(^|[\s(\[«“\/])(\p{L})(?!\d)(?![^\s]*(?:_|\.\p{L}))/gu;
    function tc(t) {
      return t.replace(RE, function (m, a, b) {
        return a + b.toUpperCase();
      });
    }
    var SEL =
      "h3:not([data-tc]),h4:not([data-tc]),summary:not([data-tc]),button:not([data-tc]),th:not([data-tc]),label:not([data-tc]),option:not([data-tc]),small:not([data-tc]),.vkx-ttl span:not([data-tc]),#vkx-toast:not([data-tc])";
    function fixNode(root) {
      if (!root || !root.isConnected) return;
      try {
        var q = root.querySelectorAll ? root.querySelectorAll(SEL) : [];
        for (var i = 0; i < q.length; i++) {
          var el = q[i];
          var ch = el.childNodes;
          for (var j = 0; j < ch.length; j++) {
            if (ch[j].nodeType === 3) {
              var v = ch[j].nodeValue;
              if (!v || v.length > 500) continue;
              var w = tc(v);
              if (w !== v) ch[j].nodeValue = w;
            }
          }
          el.setAttribute("data-tc", "1");
        }
      } catch (e) {}
    }
    flushTitleCase = function () {
      fixNode(win);
      fixNode(toastEl);
    };
    flushTitleCase();
  })();

  /* ---- Thanh Trạng Thái Auto Nổi (Mini Status Bar + Bộ Đếm Thời Gian Thực) ---- */
  var _miniStartTs = 0,
    _miniTimerId = null,
    _miniLastStop = null;
  function _fmtElapsed(ms) {
    var s = Math.max(0, Math.floor(ms / 1000));
    var m = Math.floor(s / 60);
    var r = s % 60;
    var h = Math.floor(m / 60);
    if (h > 0) {
      return (
        h +
        ":" +
        String(m % 60).padStart(2, "0") +
        ":" +
        String(r).padStart(2, "0")
      );
    }
    return String(m).padStart(2, "0") + ":" + String(r).padStart(2, "0");
  }
  function updateMiniStatus(text, onStop) {
    var bar = document.getElementById("vkx-mini-status");
    if (!bar) return;
    if (!text) {
      bar.style.display = "none";
      bar.innerHTML = "";
      if (fab) fab.classList.remove("vkx-fab-running");
      _miniStartTs = 0;
      _miniLastStop = null;
      if (_miniTimerId) {
        clearInterval(_miniTimerId);
        _miniTimerId = null;
      }
      return;
    }
    if (!_miniStartTs) _miniStartTs = Date.now();
    _miniLastStop = onStop;
    var elapsedStr = _fmtElapsed(Date.now() - _miniStartTs);
    bar.style.display = "flex";
    if (fab) fab.classList.add("vkx-fab-running");
    bar.innerHTML =
      '<span class="vkx-mini-badge"><span class="vkx-mini-dot"></span><span>' +
      text +
      '</span><span class="vkx-mini-time" id="vkx-mini-elapsed">⏱ ' +
      elapsedStr +
      "</span></span>" +
      '<button class="vkx-mini-btn" id="vkx-mini-stop">⏸ Dừng</button>';
    var btn = bar.querySelector("#vkx-mini-stop");
    if (btn) {
      btn.onclick = function (e) {
        e.stopPropagation();
        if (typeof _miniLastStop === "function") _miniLastStop();
      };
    }
    if (!_miniTimerId) {
      _miniTimerId = setInterval(function () {
        var el = document.getElementById("vkx-mini-elapsed");
        if (!el || !_miniStartTs) return;
        el.textContent = "⏱ " + _fmtElapsed(Date.now() - _miniStartTs);
      }, 1000);
    }
  }

  /* ---- theme ---- */
  var themeIdx = 0;
  (function () {
    var saved = ls("vkx_theme");
    var legacyMap = {
      mucNgoc: "thaiHu",
      tuTieu: "tuLoi",
      giayCo: "thanhLuan",
      huyenAnh: "thaiHu",
      uMinh: "thaiHu",
      thanhHu: "thanhLuan",
      cuuU: "huyetMa",
    };
    if (saved && legacyMap[saved]) saved = legacyMap[saved];
    for (var i = 0; i < THEMES.length; i++) {
      if (THEMES[i][0] === saved) {
        themeIdx = i;
        return;
      }
    }
    themeIdx = 0;
  })();
  function applyTheme(customKey) {
    if (customKey) {
      for (var j = 0; j < THEMES.length; j++) {
        if (THEMES[j][0] === customKey) {
          themeIdx = j;
          break;
        }
      }
    }
    var curKey = THEMES[themeIdx][0];
    var curName = THEMES[themeIdx][1];
    [win, fab, toastEl].forEach(function (el) {
      el.setAttribute("data-vkx-theme", curKey);
    });
    var tLbl = win.querySelector("#vkx-theme-lbl");
    if (tLbl) tLbl.textContent = curName;
    win.querySelectorAll(".vkx-theme-chip").forEach(function (chip) {
      chip.classList.toggle("active", chip.getAttribute("data-th") === curKey);
    });
    ls("vkx_theme", curKey);
  }
  applyTheme();
  win.querySelectorAll(".vkx-theme-chip").forEach(function (chip) {
    chip.onclick = function () {
      var tk = chip.getAttribute("data-th");
      if (tk) {
        applyTheme(tk);
        notify("🎨 Chủ đề Linh Giới: " + THEMES[themeIdx][1]);
      }
    };
  });

  /* ---- toast ---- */
  var toastTimer = null;
  function notify(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("on");
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("on");
    }, 2800);
  }

  /* ---- Active Tab Glider Engine ---- */
  function updateGlider(targetBtn, gliderEl, isVertical, immediate) {
    if (!targetBtn || !gliderEl) return;
    var w = targetBtn.offsetWidth,
      h = targetBtn.offsetHeight;
    if (!w && !h) return;

    var parent = gliderEl.parentElement;
    var isWideGroups =
      parent &&
      parent.id === "vkx-groups" &&
      win &&
      win.classList.contains("vkx-wide");

    var vertical =
      typeof isVertical === "boolean" ? isVertical : !!isWideGroups;
    var isInitial = !gliderEl.classList.contains("active");
    var noTransition = !!immediate || isInitial;

    if (noTransition) {
      gliderEl.style.transition = "none";
    }

    if (vertical) {
      gliderEl.style.transform =
        "translate3d(0, " + targetBtn.offsetTop + "px, 0)";
      gliderEl.style.height = h + "px";
      gliderEl.style.width = "";
    } else {
      gliderEl.style.transform =
        "translate3d(" + targetBtn.offsetLeft + "px, 0, 0)";
      gliderEl.style.width = w + "px";
      gliderEl.style.height = "";
    }

    if (noTransition) {
      void gliderEl.offsetHeight; // Kích hoạt reflow cưỡng bức
      gliderEl.style.transition = "";
    }

    gliderEl.classList.add("active");
  }

  function updateGliders(immediate) {
    if (!win.classList.contains("open")) return;
    var secTl = win.querySelector("#vkx-sec-tl");
    if (!secTl || !secTl.classList.contains("on")) return;

    var groupsEl = win.querySelector("#vkx-groups");
    if (groupsEl) {
      var gBtn = groupsEl.querySelector("button.on");
      var gGld = groupsEl.querySelector(".vkx-tab-glider");
      if (gBtn && gGld) {
        var isWide = win.classList.contains("vkx-wide");
        updateGlider(gBtn, gGld, isWide, immediate);
      }
    }

    var tabsEl = win.querySelector("#vkx-tabs");
    if (tabsEl) {
      var tBtn = tabsEl.querySelector("button.on");
      var tGld = tabsEl.querySelector(".vkx-tab-glider");
      if (tBtn && tGld) {
        updateGlider(tBtn, tGld, false, immediate);
      }
    }
  }

  /* ---- mở / đóng / chuyển phần ---- */
  var _hudQsaveCb = null;
  var _hudQsaveBtn = win.querySelector("#vkx-hud-qsave-btn");
  if (_hudQsaveBtn) {
    _hudQsaveBtn.onclick = function (e) {
      e.stopPropagation();
      if (typeof _hudQsaveCb === "function") _hudQsaveCb();
    };
  }
  function updateCharHud(pillsHtml, onQuickSave) {
    var pillsEl = win.querySelector("#vkx-char-pills");
    if (pillsEl && pillsHtml) pillsEl.innerHTML = pillsHtml;
    if (typeof onQuickSave === "function") _hudQsaveCb = onQuickSave;
  }

  var api = {
    win: win,
    fab: fab,
    notify: notify,
    updateMiniStatus: updateMiniStatus,
    updateCharHud: updateCharHud,
    updateGlider: updateGlider,
    updateGliders: updateGliders,
    applyTheme: applyTheme,
    nkBody: win.querySelector("#vkx-nk-body"),
    tabs: win.querySelector("#vkx-tabs"),
    groups: win.querySelector("#vkx-groups"),
    body: win.querySelector("#vkx-body"),
    refreshBtn: win.querySelector("#vk-rf"),
    _section: "tl",
    _secCb: null,
    _openCb: null,
  };
  api.setSec = function (name) {
    return api.setSection(name);
  };
  var segBtns = win.querySelectorAll(".vkx-seg button");

  api.setSection = function (name) {
    api._section = name;
    ls("vkx_sec", name);
    for (var i = 0; i < segBtns.length; i++)
      segBtns[i].classList.toggle("on", segBtns[i].dataset.s === name);
    win
      .querySelector("#vkx-sec-nk")
      .classList.toggle("on", name === "nk");
    win
      .querySelector("#vkx-sec-tl")
      .classList.toggle("on", name === "tl");
    if (name === "tl") {
      requestAnimationFrame(function () {
        updateGliders(true);
      });
    }
    if (api._secCb) api._secCb(name, win.classList.contains("open"));
  };
  api.isOpen = function () {
    return win.classList.contains("open");
  };
  api.open = function () {
    win.classList.add("open");
    fab.classList.add("vkx-hidden");
    fab.style.display = "";
    if (typeof flushTitleCase === "function") flushTitleCase();
    if (api.fit && api.fit.run) api.fit.run();
    ls("vkx_open", "1");
    requestAnimationFrame(function () {
      updateGliders(true);
    });
    if (api._openCb) api._openCb(true);
    if (api._secCb) api._secCb(api._section, true);
  };
  api.close = function () {
    win.classList.remove("open");
    fab.classList.remove("vkx-hidden");
    fab.style.display = "";
    ls("vkx_open", "0");
    if (api._openCb) api._openCb(false);
  };
  api.toggle = function () {
    if (api.isOpen()) api.close();
    else api.open();
  };
  api.onSection = function (fn) {
    api._secCb = fn;
  };
  api.onSectionChange = api.onSection;
  api.onOpenChange = function (fn) {
    api._openCb = fn;
  };

  for (var i = 0; i < segBtns.length; i++) {
    (function (b) {
      b.onclick = function () {
        api.setSection(b.dataset.s);
      };
    })(segBtns[i]);
  }
  win.querySelector("#vkx-close").onclick = api.close;
  fab.onclick = api.open;

  /* ---- Thu Nhỏ Thanh Nổi (Window Shade) & Tìm Nhanh Chức Năng ---- */
  var minBtn = win.querySelector("#vkx-min");
  api.toggleMinimize = function (forceState) {
    var isMin =
      typeof forceState === "boolean"
        ? forceState
        : !win.classList.contains("vkx-minimized");
    win.classList.toggle("vkx-minimized", isMin);
    if (minBtn) {
      minBtn.textContent = isMin ? "▢" : "—";
      minBtn.title = isMin
        ? "Mở rộng lại cửa sổ (Alt+M)"
        : "Thu nhỏ thành thanh nổi (Alt+M)";
    }
    if (!isMin) {
      requestAnimationFrame(function () {
        updateGliders(true);
      });
    }
  };
  if (minBtn) {
    minBtn.onclick = function (e) {
      e.stopPropagation();
      api.toggleMinimize();
    };
  }
  var hdEl = win.querySelector("#vkx-hd");
  if (hdEl) {
    hdEl.addEventListener("dblclick", function (e) {
      if (e.target && e.target.closest("button")) return;
      api.toggleMinimize();
    });
  }

  var qBtn = win.querySelector("#vkx-qbtn");
  var qBar = win.querySelector("#vkx-qbar");
  var qInp = win.querySelector("#vkx-qbar-inp");
  var qHits = win.querySelector("#vkx-qbar-hits");
  api.toggleQuickSearch = function (forceOpen) {
    if (!qBar) return;
    if (win.classList.contains("vkx-minimized"))
      api.toggleMinimize(false);
    if (api._section !== "tl") api.setSection("tl");
    var open =
      typeof forceOpen === "boolean"
        ? forceOpen
        : !qBar.classList.contains("on");
    qBar.classList.toggle("on", open);
    if (open && qInp) {
      qInp.value = "";
      if (typeof api._onQuickSearch === "function")
        api._onQuickSearch("");
      setTimeout(function () {
        try {
          qInp.focus();
        } catch (e) {}
      }, 20);
    }
  };
  if (qBtn) {
    qBtn.onclick = function (e) {
      e.stopPropagation();
      api.toggleQuickSearch();
    };
  }
  if (qInp) {
    qInp.addEventListener("input", function () {
      if (typeof api._onQuickSearch === "function")
        api._onQuickSearch(qInp.value || "");
    });
    qInp.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        api.toggleQuickSearch(false);
      } else if (e.key === "Enter" && qHits) {
        var firstHit = qHits.querySelector(".vkx-qhit");
        if (firstHit) {
          e.preventDefault();
          firstHit.click();
        }
      }
    });
  }
  api.qHits = qHits;
  api.qBar = qBar;

  /* ---- kéo nút ☯ bằng ngón tay / chuột (nhớ vị trí) ---- */
  (function () {
    var st = null,
      moved = false;
    fab.style.touchAction = "none";
    function kk() {
      return (api.fit && api.fit.k) || 1;
    }
    function vp() {
      return api.fit && api.fit.lw
        ? [api.fit.lw, api.fit.vh]
        : [window.innerWidth, window.innerHeight];
    }
    function size() {
      return [
        (fab.offsetWidth || 50) * kk(),
        (fab.offsetHeight || 50) * kk(),
      ];
    }
    function place(x, y) {
      var s = size(),
        v = vp();
      x = Math.min(Math.max(4, x), Math.max(4, v[0] - s[0] - 4));
      y = Math.min(Math.max(4, y), Math.max(4, v[1] - s[1] - 4));
      fab.style.left = x + "px";
      fab.style.top = y + "px";
      fab.style.right = "auto";
      fab.style.bottom = "auto";
      fab.style.transformOrigin = "0 0";
      return { x: x, y: y };
    }
    api.refitFab = function () {
      if (fab.style.left)
        place(
          parseFloat(fab.style.left) || 0,
          parseFloat(fab.style.top) || 0,
        );
    };
    try {
      var sv = JSON.parse(ls("vkx_fab") || "null");
      if (sv && typeof sv.x === "number" && typeof sv.y === "number")
        place(sv.x, sv.y);
    } catch (e) {}
    fab.addEventListener("pointerdown", function (e) {
      var r = fab.getBoundingClientRect();
      st = { sx: e.clientX, sy: e.clientY, ox: r.left, oy: r.top };
      moved = false;
      try {
        fab.setPointerCapture(e.pointerId);
      } catch (x) {}
    });
    fab.addEventListener("pointermove", function (e) {
      if (!st) return;
      var dx = e.clientX - st.sx,
        dy = e.clientY - st.sy;
      if (!moved && Math.abs(dx) + Math.abs(dy) < 8) return;
      moved = true;
      place(st.ox + dx, st.oy + dy);
    });
    function end() {
      if (st && moved) {
        var r = fab.getBoundingClientRect();
        ls(
          "vkx_fab",
          JSON.stringify({ x: Math.round(r.left), y: Math.round(r.top) }),
        );
        fab._dragged = true;
        setTimeout(function () {
          fab._dragged = false;
        }, 60);
      } else if (st) {
        setTimeout(function () {
          if (!api.isOpen()) api.open();
        }, 0);
      }
      st = null;
    }
    fab.addEventListener("pointerup", end);
    fab.addEventListener("pointercancel", end);
    fab.addEventListener(
      "click",
      function (e) {
        if (fab._dragged) {
          e.stopImmediatePropagation();
          e.preventDefault();
          fab._dragged = false;
        }
      },
      true,
    );
  })();
  win.querySelector("#vkx-theme").onclick = function () {
    themeIdx = (themeIdx + 1) % THEMES.length;
    applyTheme();
    notify("🎨 Chủ đề Linh Giới: " + THEMES[themeIdx][1]);
  };
  var LAYOUT_MODES = [
    ["right", "Neo Phải"],
    ["left", "Neo Trái"],
    ["studio", "Đại Tinh Bàn"],
  ];
  function syncLayoutLabel() {
    var cur = ls("vkx_ui_layout") || "right";
    var found = LAYOUT_MODES.find(function (x) { return x[0] === cur; }) || LAYOUT_MODES[0];
    var lLbl = win.querySelector("#vkx-layout-lbl");
    if (lLbl) lLbl.textContent = found[1];
  }
  syncLayoutLabel();
  var layoutBtn = win.querySelector("#vkx-layout");
  if (layoutBtn) {
    layoutBtn.onclick = function () {
      var cur = ls("vkx_ui_layout") || "right";
      var idx = 0;
      for (var i = 0; i < LAYOUT_MODES.length; i++) {
        if (LAYOUT_MODES[i][0] === cur) { idx = i; break; }
      }
      var next = LAYOUT_MODES[(idx + 1) % LAYOUT_MODES.length];
      ls("vkx_ui_layout", next[0]);
      syncLayoutLabel();
      if (api.fit && api.fit.run) api.fit.run();
      notify("◫ Bố cục hiển thị: " + next[1]);
    };
  }

  /* tránh phím gõ trong bảng kích hoạt phím tắt của game */
  ["keydown", "keyup", "keypress"].forEach(function (t) {
    win.addEventListener(t, function (e) {
      e.stopPropagation();
    });
  });
  /* phím tắt trong cửa sổ Tool: Escape đóng, Ctrl+K mở tìm nhanh, Alt+M thu nhỏ thanh nổi */
  win.addEventListener("keydown", function (e) {
    if ((e.ctrlKey || e.metaKey) && (e.key === "k" || e.key === "K")) {
      e.preventDefault();
      api.toggleQuickSearch();
      return;
    }
    if (e.altKey && (e.key === "m" || e.key === "M")) {
      e.preventDefault();
      api.toggleMinimize();
      return;
    }
    if (e.key === "Escape" || e.keyCode === 27) {
      if (qBar && qBar.classList.contains("on")) {
        e.preventDefault();
        api.toggleQuickSearch(false);
        return;
      }
      e.preventDefault();
      api.close();
    }
  });
  /* phím tắt toàn cục: Alt+T bật/tắt cửa sổ Tool, Alt+M thu nhỏ/mở rộng nhanh */
  window.addEventListener("keydown", function (e) {
    if (e.altKey && (e.key === "t" || e.key === "T")) {
      e.preventDefault();
      api.toggle();
    } else if (
      e.altKey &&
      (e.key === "m" || e.key === "M") &&
      api.isOpen()
    ) {
      e.preventDefault();
      api.toggleMinimize();
    }
  });

  /* ---- CÔ LẬP KHỎI TRANG GAME ----
     Khi đang cầm một món ở màn Kinh Mạch, game gắn trình nghe cấp cửa sổ gọi preventDefault() cho MỌI cuộn chuột / touchmove / chuột phải
     (để xoay món). Sự kiện trong cửa sổ Tool nổi lên tới đó nên cuộn, vuốt và nhấn giữ trong Tool bị chặn → trông như "đứng im".
     Chặn nổi bọt đúng 3 loại này ở ngay cửa sổ Tool (không chặn pointerup/cancel để không làm game kẹt trạng thái kéo). */
  ["wheel", "touchmove", "contextmenu"].forEach(function (t) {
    win.addEventListener(
      t,
      function (e) {
        e.stopPropagation();
      },
      { passive: true },
    );
  });
  [fab, toastEl].forEach(function (el) {
    ["wheel", "touchmove", "contextmenu"].forEach(function (t) {
      el.addEventListener(
        t,
        function (e) {
          e.stopPropagation();
        },
        { passive: true },
      );
    });
  });

  /* ---- TỰ THÍCH NGHI MÀN HÌNH ----
     Đo lại mỗi khi xoay máy, đổi cỡ cửa sổ, hiện/ẩn bàn phím ảo hay thanh địa chỉ; tự chọn bố cục (điện thoại / ngang / bảng / máy tính),
     tự bù khi trang đang ở "chế độ trang máy tính" trên điện thoại hoặc màn hình rất lớn, tránh tai thỏ, và cho chỉnh cỡ tay bằng nút 🔍. */
  var Fit = (function () {
    var SCALES = [
      ["auto", "Tự động"],
      ["0.85", "85%"],
      ["1", "100%"],
      ["1.15", "115%"],
      ["1.3", "130%"],
      ["1.5", "150%"],
    ];
    var canScale = !!(
      window.CSS &&
      CSS.supports &&
      CSS.supports("scale", "1.2")
    );
    var idx = 0,
      raf = 0,
      dragged = null;
    var F = {
      k: 1,
      comp: 1,
      lw: 0,
      lh: 0,
      vh: 0,
      vtop: 0,
      dpr: 1,
      coarse: false,
      land: false,
      phone: false,
    };
    (function () {
      var sv = ls("vkx_scale");
      for (var i = 0; i < SCALES.length; i++)
        if (SCALES[i][0] === sv) idx = i;
    })();
    var probe = document.createElement("div");
    probe.style.cssText =
      "position:fixed;left:0;top:0;width:0;height:0;visibility:hidden;pointer-events:none;padding:env(safe-area-inset-top,0px) env(safe-area-inset-right,0px) env(safe-area-inset-bottom,0px) env(safe-area-inset-left,0px)";
    document.body.appendChild(probe);
    var cachedIns = null;
    function getIns(forceRefresh) {
      if (!cachedIns || forceRefresh) {
        try {
          var cs = getComputedStyle(probe);
          cachedIns = {
            t: parseFloat(cs.paddingTop) || 0,
            r: parseFloat(cs.paddingRight) || 0,
            b: parseFloat(cs.paddingBottom) || 0,
            l: parseFloat(cs.paddingLeft) || 0,
          };
        } catch (e) {
          cachedIns = { t: 0, r: 0, b: 0, l: 0 };
        }
      }
      return cachedIns;
    }
    var mqC = window.matchMedia("(pointer:coarse)"),
      mqL = window.matchMedia("(orientation:landscape)"),
      mqF = window.matchMedia("(hover:hover) and (pointer:fine)");
    function clamp(v, lo, hi) {
      return Math.min(Math.max(v, lo), hi);
    }
    function measure(forceIns) {
      var vv = window.visualViewport,
        de = document.documentElement;
      var lw = de.clientWidth || window.innerWidth,
        lh = window.innerHeight;
      var pinch = !!vv && vv.scale > 1.05;
      var vh = vv && !pinch ? vv.height : lh,
        vtop = vv && !pinch ? vv.offsetTop : 0;
      var coarse =
        mqC.matches || (navigator.maxTouchPoints > 0 && !mqF.matches);
      var sw = (window.screen && screen.width) || lw,
        sh = (window.screen && screen.height) || lh;
      var land = mqL.matches,
        dw = land ? Math.max(sw, sh) : Math.min(sw, sh);
      var comp = 1;
      if (coarse && dw > 0 && lw > dw * 1.25) comp = Math.min(3, lw / dw);
      /* trang đang ở chế độ máy tính trên điện thoại/bảng: phóng giao diện cho đọc được */ else if (
        !coarse &&
        lw >= 3200
      )
        comp = 1.5;
      else if (!coarse && lw >= 2400) comp = 1.25;
      var pick = SCALES[idx][0],
        k = pick === "auto" ? comp : parseFloat(pick);
      if (!canScale) k = 1;
      k = clamp(
        k,
        0.7,
        Math.max(0.7, lw / 300),
      ); /* không phóng quá mức làm cửa sổ hẹp dưới 300 px */
      var ins = getIns(forceIns);
      return {
        k: k,
        comp: comp,
        lw: lw,
        lh: lh,
        vh: vh,
        vtop: vtop,
        dpr: window.devicePixelRatio || 1,
        coarse: coarse,
        land: land,
        ins: ins,
      };
    }
    function run(forceIns) {
      raf = 0;
      var m = measure(forceIns),
        k = m.k,
        effW = m.lw / k,
        effH = m.vh / k,
        ins = m.ins;
      var phone = effW <= 720 || (m.coarse && effH <= 520);
      F.k = k;
      F.comp = m.comp;
      F.lw = m.lw;
      F.lh = m.lh;
      F.vh = m.vh;
      F.vtop = m.vtop;
      F.dpr = m.dpr;
      F.coarse = m.coarse;
      F.land = m.land;
      F.phone = phone;

      // Nếu cửa sổ Tool đang đóng, bỏ qua việc định hình lại layout win.style để tránh layout thrashing
      if (!api.isOpen()) {
        F.dirty = true;
        if (!fab.style.left) {
          fab.style.right = 14 + ins.r / k + "px";
          fab.style.bottom =
            (phone ? Math.max(14, Math.min(190, effH * 0.3)) : 24) +
            ins.b / k +
            "px";
          fab.style.transformOrigin = "100% 100%";
        } else if (api.refitFab) api.refitFab();
        toastEl.style.bottom = 26 + ins.b / k + "px";
        return;
      }
      F.dirty = false;

      [win, fab, toastEl].forEach(function (el) {
        el.style.setProperty("--vkx-k", String(k));
      });
      win.classList.toggle("vkx-m", phone);
      win.classList.toggle("vkx-t", m.coarse);
      win.classList.toggle("vkx-xs", effW < 370);
      win.classList.toggle(
        "vkx-land",
        phone && effH <= 520 && effW > effH,
      );
      var wide = false;
      win.style.left = "auto";
      win.style.width = "";
      win.style.height = "";
      win.style.right = "";
      win.style.top = "";
      win.style.paddingTop = "";
      win.style.paddingBottom = "";
      win.style.paddingLeft = "";
      win.style.paddingRight = "";

      if (phone) {
        win.style.setProperty("--vkx-win-w", effW + "px");
        win.style.setProperty("--vkx-win-h", effH + "px");
        win.style.setProperty("--vkx-win-right", "0px");
        win.style.setProperty("--vkx-win-top", m.vtop + "px");
        win.style.setProperty("--vkx-win-pt", ins.t / k + "px");
        win.style.setProperty("--vkx-win-pb", ins.b / k + "px");
        win.style.setProperty("--vkx-win-pl", ins.l / k + "px");
        win.style.setProperty("--vkx-win-pr", ins.r / k + "px");
      } else {
        var layoutMode = ls("vkx_ui_layout") || "right";
        var isStudio = layoutMode === "studio";
        var isDockLeft = layoutMode === "left";
        win.classList.toggle("vkx-studio", isStudio);
        win.classList.toggle("vkx-dock-left", isDockLeft);
        var wideOk = effW >= 960,
          maxWideW = isStudio ? 1040 : 880,
          w = wideOk
            ? Math.min(maxWideW, effW - 28)
            : Math.min(m.coarse ? 540 : 520, effW - 16),
          h = wideOk
            ? Math.min(effH - 28, 940)
            : Math.min(effH * 0.88, 820),
          r = isDockLeft ? Math.max(16, Math.round(effW - w - 16)) : 16,
          t = 16;
        wide = wideOk;
        if (dragged) {
          r = clamp(dragged.right, 80 - w * k, m.lw - 80);
          t = clamp(dragged.top, 0, Math.max(0, m.vh - 60));
        }
        win.style.setProperty("--vkx-win-w", w + "px");
        win.style.setProperty("--vkx-win-h", h + "px");
        win.style.setProperty("--vkx-win-right", r + "px");
        win.style.setProperty("--vkx-win-top", t + "px");
        win.style.setProperty("--vkx-win-pt", "0px");
        win.style.setProperty("--vkx-win-pb", "0px");
        win.style.setProperty("--vkx-win-pl", "0px");
        win.style.setProperty("--vkx-win-pr", "0px");
      }
      win.classList.toggle("vkx-wide", wide);
      if (typeof updateGliders === "function") updateGliders(true);
      if (!fab.style.left) {
        fab.style.right = 14 + ins.r / k + "px";
        fab.style.bottom =
          (phone ? Math.max(14, Math.min(190, effH * 0.3)) : 24) +
          ins.b / k +
          "px";
        fab.style.transformOrigin = "100% 100%";
      } else if (api.refitFab) api.refitFab();
      toastEl.style.bottom = 26 + ins.b / k + "px";
      toastEl.style.maxWidth = Math.min((0.92 * m.lw) / k, 520) + "px";
    }
    var nextForceIns = false;
    function sched(forceIns) {
      if (forceIns) nextForceIns = true;
      if (!raf) {
        raf = requestAnimationFrame(function () {
          var fi = nextForceIns;
          nextForceIns = false;
          run(fi);
        });
      }
    }
    window.addEventListener("resize", function () {
      sched(true);
    });
    window.addEventListener("orientationchange", function () {
      sched(true);
      setTimeout(function () {
        sched(true);
      }, 160);
    });
    window.addEventListener("pageshow", function () {
      sched(true);
    });
    document.addEventListener("fullscreenchange", function () {
      sched(true);
    });
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", function () {
        sched(true);
      });
      window.visualViewport.addEventListener("scroll", function () {
        if (api.isOpen()) sched(false);
      });
    }
    [mqC, mqL].forEach(function (q) {
      try {
        q.addEventListener("change", function () {
          sched(true);
        });
      } catch (e) {
        try {
          q.addListener(function () {
            sched(true);
          });
        } catch (x) {}
      }
    });

    /* kéo cửa sổ (chỉ khi không phải toàn màn hình) */
    var hd = win.querySelector("#vkx-hd"),
      drag = null;
    hd.addEventListener("pointerdown", function (e) {
      if (F.phone || e.target.closest("button")) return;
      var r = win.getBoundingClientRect();
      drag = {
        dx: e.clientX - r.left,
        dy: e.clientY - r.top,
        w: r.width,
      };
      try {
        hd.setPointerCapture(e.pointerId);
      } catch (x) {}
    });
    hd.addEventListener("pointermove", function (e) {
      if (!drag) return;
      var x = clamp(e.clientX - drag.dx, 0, F.lw - 80),
        y = clamp(e.clientY - drag.dy, 0, Math.max(0, F.vh - 60));
      dragged = { right: F.lw - (x + drag.w), top: y };
      win.style.setProperty("--vkx-win-right", dragged.right + "px");
      win.style.setProperty("--vkx-win-top", y + "px");
    });
    function endDrag() {
      drag = null;
    }
    hd.addEventListener("pointerup", endDrag);
    hd.addEventListener("pointercancel", endDrag);
    hd.addEventListener("lostpointercapture", endDrag);

    /* thanh tab: ngón tay vuốt (trình duyệt lo), con lăn chuột đổi thành cuộn ngang, chuột kéo được; không lỡ bấm nhầm sau khi kéo */
    function strip(el) {
      if (!el) return;
      el.addEventListener(
        "wheel",
        function (e) {
          if (
            el.scrollWidth <= el.clientWidth + 1 ||
            Math.abs(e.deltaX) > Math.abs(e.deltaY)
          )
            return;
          e.preventDefault();
          el.scrollLeft += e.deltaY;
        },
        { passive: false },
      );
      var st = null;
      el.addEventListener("pointerdown", function (e) {
        if (e.pointerType !== "mouse" || e.button !== 0) return;
        st = {
          x: e.clientX,
          sl: el.scrollLeft,
          moved: false,
          id: e.pointerId,
        };
      });
      el.addEventListener("pointermove", function (e) {
        if (!st || e.pointerId !== st.id) return;
        var dx = e.clientX - st.x;
        if (!st.moved && Math.abs(dx) > 6) {
          st.moved = true;
          el.classList.add("vkx-dragging");
          try {
            el.setPointerCapture(e.pointerId);
          } catch (x) {}
        }
        if (st.moved) el.scrollLeft = st.sl - dx / (F.k || 1);
      });
      function fin() {
        if (st && st.moved) {
          el._noClick = true;
          setTimeout(function () {
            el._noClick = false;
          }, 0);
        }
        st = null;
        el.classList.remove("vkx-dragging");
      }
      el.addEventListener("pointerup", fin);
      el.addEventListener("pointercancel", fin);
      el.addEventListener("lostpointercapture", fin);
      el.addEventListener(
        "click",
        function (e) {
          if (el._noClick) {
            e.stopPropagation();
            e.preventDefault();
          }
        },
        true,
      );
    }
    strip(win.querySelector("#vkx-groups"));
    strip(win.querySelector("#vkx-tabs"));

    /* nút 🔍: Tự động → 85% → 100% → 115% → 130% → 150% */
    win.querySelector("#vkx-zoom").onclick = function () {
      if (!canScale) {
        notify("🔍 Trình duyệt này chưa hỗ trợ đổi cỡ giao diện");
        return;
      }
      idx = (idx + 1) % SCALES.length;
      ls("vkx_scale", SCALES[idx][0]);
      run();
      notify(
        "🔍 Cỡ giao diện: " +
          SCALES[idx][1] +
          (idx === 0 ? " (đang " + Math.round(F.k * 100) + "%)" : ""),
      );
    };
    F.run = run;
    F.vp = function () {
      return [F.lw, F.vh];
    };
    F.info = function () {
      return (
        F.lw +
        "×" +
        Math.round(F.vh) +
        " px · DPR " +
        Math.round(F.dpr * 100) / 100 +
        " · " +
        (F.phone
          ? win.classList.contains("vkx-land")
            ? "điện thoại ngang"
            : "điện thoại"
          : F.coarse
            ? "máy tính bảng"
            : "máy tính") +
        " · cỡ " +
        Math.round(F.k * 100) +
        "%" +
        (idx === 0
          ? " (tự động" +
            (F.comp > 1.01
              ? ", đã bù ×" +
                F.comp.toFixed(2) +
                " vì trang đang ở chế độ máy tính hoặc màn hình rất lớn"
              : "") +
            ")"
          : " (chọn tay)") +
        (canScale ? "" : " · trình duyệt không hỗ trợ phóng")
      );
    };
    api.fit = F;
    return F;
  })();
  api.fitInfo = Fit.info;

  /* ---- trạng thái ban đầu ---- */
  var sec = ls("vkx_sec");
  api.setSection(sec === "nk" ? "nk" : "tl");
  if (ls("vkx_open") === "0") {
    win.classList.remove("open");
    fab.classList.remove("vkx-hidden");
    fab.style.display = "";
  } else {
    win.classList.add("open");
    fab.classList.add("vkx-hidden");
    fab.style.display = "";
  }
  Fit.run();
  return api;
})();

export {
  UI,
};

Object.assign(gWin, {
  UI,
});
