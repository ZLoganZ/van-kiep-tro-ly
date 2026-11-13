import { gWin, TOOL_VER, TT, MOD, StorageManager, esc } from "./utils.js";
import { UI } from "../ui/shell.js";

/**
 * Module: Hệ Thống Tự Động Cập Nhật OTA Qua GitHub (Auto-Updater Engine)
 * Hỗ trợ:
 * 1. Tự động kiểm tra phiên bản mới (SemVer) & mã Commit SHA từ GitHub (raw.githubusercontent.com + jsDelivr + GitHub API).
 * 2. Tự động tải gói `van-kiep-tro-ly-mod.zip` hoặc tự động kéo mã nguồn ES Modules trực tiếp từ GitHub & đóng gói ZIP ngay trên trình duyệt nếu file zip trên repo chưa kịp build.
 * 3. Tự động ghi đè trực tiếp vào IndexedDB Mod Store của game Vạn Kiếp Tu Tiên + xóa bộ nhớ đệm Service Worker (`/mods/van_kiep_tro_ly/...`) + hỗ trợ bơm File vào trình cài đặt gốc của game.
 * 4. Tự động tạo bản lưu dự phòng (Quick Save + flushSave) và tải lại trang để áp dụng bản cập nhật mới mà không mất tiến trình chơi.
 */

const UPD_CFG_KEY = "vkx_auto_update_cfg";
const UPD_STATE_KEY = "vkx_auto_update_state";
const DEFAULT_REPO = "zloganz/van-kiep-tro-ly";
const DEFAULT_BRANCH = "main";
const MOD_ID = "van_kiep_tro_ly";

// Danh sách các module chuẩn để tự động kéo từ GitHub nếu cần đóng gói trực tiếp trên trình duyệt
export const MOD_SOURCE_FILES = [
  "mod.yaml",
  "main.js",
  "src/core/utils.js",
  "src/core/auto-update.js",
  "src/styles/ui-css.js",
  "src/ui/shell.js",
  "src/data/static-data.js",
  "src/core/bridge.js",
  "src/modules/kinh-mach-engine.js",
  "src/modules/navigation.js",
  "src/modules/di-bao.js",
  "src/modules/kinh-mach-tab.js",
  "src/modules/dot-pha-nghe.js",
  "src/modules/ban-do-dia-danh.js",
  "src/modules/ngu-linh.js",
  "src/modules/huong-build.js",
  "src/modules/tra-cuu.js",
  "src/auto/auto-core.js",
  "src/auto/combat-ai.js",
  "src/auto/auto-kinh-mach.js",
  "src/auto/auto-tu-luyen.js",
  "src/auto/auto-di-bao.js",
  "src/auto/auto-buon-ban.js",
  "src/auto/auto-reroll.js",
  "src/auto/auto-runner.js",
  "src/auto/auto-tabs.js",
  "src/modules/luan-hoi-save.js",
  "src/modules/nhat-ky.js",
];

const DEFAULT_CFG = {
  enabled: true,
  repo: DEFAULT_REPO,
  branch: DEFAULT_BRANCH,
  intervalMin: 15, // Kiểm tra định kỳ mỗi 15 phút (0 = tắt kiểm tra định kỳ)
  installMode: "auto_countdown", // "auto_countdown" | "auto_immediate" | "notify"
  checkCommitSha: true, // Phát hiện cả bản cập nhật hotfix qua mã Commit SHA trên nhánh main
  autoQuickSave: true, // Tự động lưu Quick Save trước khi reload áp dụng bản mới
};

function loadUpdCfg() {
  const saved = StorageManager.getJson(UPD_CFG_KEY, null);
  return Object.assign({}, DEFAULT_CFG, saved && typeof saved === "object" ? saved : {});
}

function saveUpdCfg(cfg) {
  StorageManager.setJson(UPD_CFG_KEY, cfg);
}

function loadUpdState() {
  const saved = StorageManager.getJson(UPD_STATE_KEY, null);
  return Object.assign(
    {
      lastCheckTs: 0,
      installedVer: TOOL_VER,
      installedSha: "",
      dismissedVer: "",
      dismissedSha: "",
      lastUpdateSuccessVer: "",
      lastUpdateSuccessTs: 0,
    },
    saved && typeof saved === "object" ? saved : {},
  );
}

function saveUpdState(st) {
  StorageManager.setJson(UPD_STATE_KEY, st);
}

// ── So sánh phiên bản SemVer (trả về 1 nếu a > b, -1 nếu a < b, 0 nếu bằng nhau) ──
export function compareSemver(a, b) {
  const clean = (v) =>
    String(v || "")
      .trim()
      .replace(/^[vV]+/, "")
      .split("-")[0]
      .split(".")
      .map((n) => parseInt(n, 10) || 0);
  const pa = clean(a);
  const pb = clean(b);
  const len = Math.max(pa.length, pb.length, 3);
  for (let i = 0; i < len; i++) {
    const na = pa[i] || 0;
    const nb = pb[i] || 0;
    if (na > nb) return 1;
    if (na < nb) return -1;
  }
  return 0;
}

// ── Bảng CRC32 & Trình Đóng Gói / Giải Nén PKZIP Ngay Trên Trình Duyệt ──
const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[i] = c >>> 0;
  }
  return table;
})();

function crc32Bytes(uint8) {
  let crc = 0xffffffff;
  for (let i = 0; i < uint8.length; i++) {
    crc = CRC_TABLE[(crc ^ uint8[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

async function deflateRawBytes(uint8) {
  if (typeof CompressionStream !== "undefined") {
    try {
      const cs = new CompressionStream("deflate-raw");
      const writer = cs.writable.getWriter();
      writer.write(uint8);
      writer.close();
      const buf = await new Response(cs.readable).arrayBuffer();
      return { method: 8, data: new Uint8Array(buf) };
    } catch (e) {}
  }
  // Fallback: phương thức Store (0 - không nén) hợp chuẩn PKZIP 100%
  return { method: 0, data: uint8 };
}

// Bộ giải nén Deflate Raw (RFC 1951) thuần JS 100% tương thích mọi trình duyệt & WebView
function inflateRawPureJS(src) {
  const FIXED_LIT = new Uint8Array(288);
  for (let i = 0; i <= 143; i++) FIXED_LIT[i] = 8;
  for (let i = 144; i <= 255; i++) FIXED_LIT[i] = 9;
  for (let i = 256; i <= 279; i++) FIXED_LIT[i] = 7;
  for (let i = 280; i <= 287; i++) FIXED_LIT[i] = 8;
  const FIXED_DIST = new Uint8Array(32).fill(5);

  const LEN_BASE = [3,4,5,6,7,8,9,10,11,13,15,17,19,23,27,31,35,43,51,59,67,83,99,115,131,163,195,227,258];
  const LEN_EXTRA = [0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0];
  const DIST_BASE = [1,2,3,4,5,7,9,13,17,25,33,49,65,97,129,193,257,385,513,769,1025,1537,2049,3073,4097,6145,8193,12289,16385,24577];
  const DIST_EXTRA = [0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13];
  const CLEN_ORDER = [16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15];

  function buildTree(lengths) {
    const counts = new Uint16Array(16);
    let maxBits = 0;
    for (let i = 0; i < lengths.length; i++) {
      const l = lengths[i];
      if (l > 0) {
        counts[l]++;
        if (l > maxBits) maxBits = l;
      }
    }
    if (maxBits === 0) return { table: new Int32Array(0), maxBits: 0 };
    const nextCode = new Uint16Array(16);
    let code = 0;
    for (let bits = 1; bits <= 15; bits++) {
      code = (code + counts[bits - 1]) << 1;
      nextCode[bits] = code;
    }
    const table = new Int32Array(1 << maxBits).fill(-1);
    for (let sym = 0; sym < lengths.length; sym++) {
      const len = lengths[sym];
      if (!len) continue;
      const c = nextCode[len]++;
      let rev = 0;
      for (let b = 0; b < len; b++) {
        rev = (rev << 1) | ((c >>> b) & 1);
      }
      const step = 1 << len;
      const val = (sym << 4) | len;
      for (let idx = rev; idx < table.length; idx += step) {
        table[idx] = val;
      }
    }
    return { table, maxBits };
  }

  const fixedLitTree = buildTree(FIXED_LIT);
  const fixedDistTree = buildTree(FIXED_DIST);

  let bitPos = 0;
  const totalBits = src.length * 8;
  function bits(n) {
    let val = 0;
    for (let i = 0; i < n; i++) {
      const byteIdx = (bitPos + i) >>> 3;
      const bitIdx = (bitPos + i) & 7;
      if (byteIdx < src.length) {
        val |= ((src[byteIdx] >>> bitIdx) & 1) << i;
      }
    }
    bitPos += n;
    return val;
  }
  function decodeSym(tree) {
    const byteIdx = bitPos >>> 3;
    const bitOffset = bitPos & 7;
    const raw =
      (src[byteIdx] || 0) |
      ((src[byteIdx + 1] || 0) << 8) |
      ((src[byteIdx + 2] || 0) << 16);
    const look = (raw >>> bitOffset) & ((1 << tree.maxBits) - 1);
    const entry = tree.table[look];
    if (entry < 0) throw new Error("Mã Huffman không hợp lệ trong luồng Deflate");
    bitPos += entry & 15;
    return entry >>> 4;
  }

  let out = new Uint8Array(Math.max(4096, src.length * 3));
  let outLen = 0;
  function ensure(more) {
    if (outLen + more <= out.length) return;
    let nextCap = out.length * 2;
    while (nextCap < outLen + more) nextCap *= 2;
    const next = new Uint8Array(nextCap);
    next.set(out.subarray(0, outLen));
    out = next;
  }

  let bfinal = 0;
  while (!bfinal && bitPos < totalBits) {
    bfinal = bits(1);
    const btype = bits(2);
    if (btype === 0) {
      bitPos = (bitPos + 7) & ~7;
      const len = bits(16);
      bits(16); // nlen
      ensure(len);
      const startByte = bitPos >>> 3;
      out.set(src.subarray(startByte, startByte + len), outLen);
      outLen += len;
      bitPos += len * 8;
    } else if (btype === 1 || btype === 2) {
      let litTree = fixedLitTree;
      let distTree = fixedDistTree;
      if (btype === 2) {
        const hlit = bits(5) + 257;
        const hdist = bits(5) + 1;
        const hclen = bits(4) + 4;
        const clenLengths = new Uint8Array(19);
        for (let i = 0; i < hclen; i++) clenLengths[CLEN_ORDER[i]] = bits(3);
        const clenTree = buildTree(clenLengths);
        const allLengths = new Uint8Array(hlit + hdist);
        let idx = 0;
        while (idx < hlit + hdist) {
          const sym = decodeSym(clenTree);
          if (sym < 16) {
            allLengths[idx++] = sym;
          } else if (sym === 16) {
            const rep = bits(2) + 3;
            const prev = allLengths[idx - 1] || 0;
            for (let r = 0; r < rep; r++) allLengths[idx++] = prev;
          } else if (sym === 17) {
            const rep = bits(3) + 3;
            for (let r = 0; r < rep; r++) allLengths[idx++] = 0;
          } else if (sym === 18) {
            const rep = bits(7) + 11;
            for (let r = 0; r < rep; r++) allLengths[idx++] = 0;
          }
        }
        litTree = buildTree(allLengths.subarray(0, hlit));
        distTree = buildTree(allLengths.subarray(hlit));
      }

      while (true) {
        const sym = decodeSym(litTree);
        if (sym === 256) break;
        if (sym < 256) {
          ensure(1);
          out[outLen++] = sym;
        } else {
          const lenIdx = sym - 257;
          const length = LEN_BASE[lenIdx] + bits(LEN_EXTRA[lenIdx]);
          const distSym = decodeSym(distTree);
          const dist = DIST_BASE[distSym] + bits(DIST_EXTRA[distSym]);
          ensure(length);
          for (let k = 0; k < length; k++) {
            out[outLen] = out[outLen - dist];
            outLen++;
          }
        }
      }
    } else {
      throw new Error("Loại khối Deflate không hợp lệ: " + btype);
    }
  }
  return out.subarray(0, outLen);
}

async function inflateRawBytes(uint8, method) {
  if (method === 0) return uint8;
  if (method === 8) {
    if (typeof DecompressionStream !== "undefined") {
      try {
        const ds = new DecompressionStream("deflate-raw");
        const writer = ds.writable.getWriter();
        writer.write(uint8);
        writer.close();
        const buf = await new Response(ds.readable).arrayBuffer();
        return new Uint8Array(buf);
      } catch (e) {}
    }
    return inflateRawPureJS(uint8);
  }
  throw new Error("Trình duyệt không hỗ trợ giải nén phương thức " + method);
}

// Giải nén gói .zip trong bộ nhớ trình duyệt -> trả về { filesMap: Map<path, Uint8Array>, textMap: Map<path, string> }
export async function unzipInBrowser(arrayBuffer) {
  const bytes = new Uint8Array(arrayBuffer);
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);

  // Tìm End of Central Directory (EOCD: 0x06054b50) từ cuối file
  let eocdPos = -1;
  const minPos = Math.max(0, bytes.length - 65557);
  for (let i = bytes.length - 22; i >= minPos; i--) {
    if (view.getUint32(i, true) === 0x06054b50) {
      eocdPos = i;
      break;
    }
  }
  if (eocdPos < 0) throw new Error("File tải về không phải định dạng ZIP hợp lệ.");

  const totalEntries = view.getUint16(eocdPos + 10, true);
  const cdOffset = view.getUint32(eocdPos + 16, true);
  const dec = new TextDecoder("utf-8");

  const filesMap = new Map();
  const textMap = new Map();
  let ptr = cdOffset;

  for (let i = 0; i < totalEntries; i++) {
    if (ptr + 46 > bytes.length || view.getUint32(ptr, true) !== 0x02014b50) break;
    const method = view.getUint16(ptr + 10, true);
    const compSize = view.getUint32(ptr + 20, true);
    const nameLen = view.getUint16(ptr + 28, true);
    const extraLen = view.getUint16(ptr + 30, true);
    const commentLen = view.getUint16(ptr + 32, true);
    const localHeaderOffset = view.getUint32(ptr + 42, true);

    const rawName = dec.decode(bytes.subarray(ptr + 46, ptr + 46 + nameLen));
    ptr += 46 + nameLen + extraLen + commentLen;

    if (rawName.endsWith("/")) continue;

    if (
      localHeaderOffset + 30 > bytes.length ||
      view.getUint32(localHeaderOffset, true) !== 0x04034b50
    ) {
      continue;
    }
    const lNameLen = view.getUint16(localHeaderOffset + 26, true);
    const lExtraLen = view.getUint16(localHeaderOffset + 28, true);
    const dataStart = localHeaderOffset + 30 + lNameLen + lExtraLen;
    const compSlice = bytes.subarray(dataStart, dataStart + compSize);

    const rawBytes = await inflateRawBytes(compSlice, method);
    const normPath = rawName.replace(/^\/+/, "");
    filesMap.set(normPath, rawBytes);
    if (/\.(js|yaml|yml|json|css|md|txt)$/i.test(normPath)) {
      textMap.set(normPath, dec.decode(rawBytes));
    }
  }

  // Nếu các file trong zip nằm trong 1 thư mục con gốc duy nhất (vd: van-kiep-tro-ly-main/...), chuẩn hóa bỏ prefix đó
  const keys = [...filesMap.keys()];
  if (keys.length > 0 && !filesMap.has("mod.yaml") && !filesMap.has("main.js")) {
    const firstSlash = keys[0].indexOf("/");
    if (firstSlash > 0) {
      const prefix = keys[0].slice(0, firstSlash + 1);
      if (keys.every((k) => k.startsWith(prefix))) {
        const normFiles = new Map();
        const normTexts = new Map();
        for (const [k, v] of filesMap.entries()) normFiles.set(k.slice(prefix.length), v);
        for (const [k, v] of textMap.entries()) normTexts.set(k.slice(prefix.length), v);
        return { filesMap: normFiles, textMap: normTexts };
      }
    }
  }

  return { filesMap, textMap };
}

// Đóng gói Map<path, Uint8Array> thành ArrayBuffer chuẩn PKZIP ngay trên trình duyệt
export async function createZipInBrowser(filesMap) {
  const enc = new TextEncoder();
  const localParts = [];
  const centralParts = [];
  let offset = 0;
  let count = 0;

  for (const [relPath, rawBytes] of filesMap.entries()) {
    const cleanPath = String(relPath).replace(/\\/g, "/").replace(/^\/+/, "");
    const nameBuf = enc.encode(cleanPath);
    const uint8 =
      rawBytes instanceof Uint8Array
        ? rawBytes
        : typeof rawBytes === "string"
          ? enc.encode(rawBytes)
          : new Uint8Array(rawBytes);

    const crc = crc32Bytes(uint8);
    const { method, data: compressed } = await deflateRawBytes(uint8);

    const localHeader = new Uint8Array(30);
    const lv = new DataView(localHeader.buffer);
    lv.setUint32(0, 0x04034b50, true);
    lv.setUint16(4, 20, true);
    lv.setUint16(6, 0x0800, true);
    lv.setUint16(8, method, true);
    lv.setUint16(10, 0, true);
    lv.setUint16(12, 0, true);
    lv.setUint32(14, crc, true);
    lv.setUint32(18, compressed.length, true);
    lv.setUint32(22, uint8.length, true);
    lv.setUint16(26, nameBuf.length, true);
    lv.setUint16(28, 0, true);

    localParts.push(localHeader, nameBuf, compressed);

    const centralHeader = new Uint8Array(46);
    const cv = new DataView(centralHeader.buffer);
    cv.setUint32(0, 0x02014b50, true);
    cv.setUint16(4, 20, true);
    cv.setUint16(6, 20, true);
    cv.setUint16(8, 0x0800, true);
    cv.setUint16(10, method, true);
    cv.setUint16(12, 0, true);
    cv.setUint16(14, 0, true);
    cv.setUint32(16, crc, true);
    cv.setUint32(20, compressed.length, true);
    cv.setUint32(24, uint8.length, true);
    cv.setUint16(28, nameBuf.length, true);
    cv.setUint16(30, 0, true);
    cv.setUint16(32, 0, true);
    cv.setUint16(34, 0, true);
    cv.setUint16(36, 0, true);
    cv.setUint32(38, 0, true);
    cv.setUint32(42, offset, true);

    centralParts.push(centralHeader, nameBuf);
    offset += localHeader.length + nameBuf.length + compressed.length;
    count++;
  }

  const centralSize = centralParts.reduce((s, b) => s + b.length, 0);
  const eocd = new Uint8Array(22);
  const ev = new DataView(eocd.buffer);
  ev.setUint32(0, 0x06054b50, true);
  ev.setUint16(4, 0, true);
  ev.setUint16(6, 0, true);
  ev.setUint16(8, count, true);
  ev.setUint16(10, count, true);
  ev.setUint32(12, centralSize, true);
  ev.setUint32(16, offset, true);
  ev.setUint16(20, 0, true);

  const totalLen = offset + centralSize + eocd.length;
  const out = new Uint8Array(totalLen);
  let pos = 0;
  for (const p of localParts) {
    out.set(p, pos);
    pos += p.length;
  }
  for (const p of centralParts) {
    out.set(p, pos);
    pos += p.length;
  }
  out.set(eocd, pos);
  return out.buffer;
}

// ── Tiện ích Fetch đa nguồn từ GitHub (Raw + jsDelivr + API) ──
async function fetchTextWithFallback(repo, branch, filePath) {
  const ts = Date.now();
  const urls = [
    `https://raw.githubusercontent.com/${repo}/${branch}/${filePath}?t=${ts}`,
    `https://cdn.jsdelivr.net/gh/${repo}@${branch}/${filePath}?t=${ts}`,
  ];
  let lastErr = null;
  for (const u of urls) {
    try {
      const res = await fetch(u, { cache: "no-store" });
      if (res.ok) return await res.text();
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr || new Error("Không thể tải " + filePath + " từ GitHub (" + repo + ")");
}

async function fetchBinaryWithFallback(repo, branch, filePath) {
  const ts = Date.now();
  const urls = [
    `https://raw.githubusercontent.com/${repo}/${branch}/${filePath}?t=${ts}`,
    `https://cdn.jsdelivr.net/gh/${repo}@${branch}/${filePath}?t=${ts}`,
  ];
  let lastErr = null;
  for (const u of urls) {
    try {
      const res = await fetch(u, { cache: "no-store" });
      if (res.ok) return await res.arrayBuffer();
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr || new Error("Không thể tải gói nhị phân " + filePath + " từ GitHub");
}

// Trích xuất mục Changelog mới nhất từ mã nguồn nhat-ky.js trên GitHub
function extractLatestChangelog(nhatKySource) {
  if (!nhatKySource || typeof nhatKySource !== "string") return null;
  try {
    const logIdx = nhatKySource.indexOf("var LOG = [");
    if (logIdx < 0) return null;
    const slice = nhatKySource.slice(logIdx, logIdx + 6000);
    const tMatch = slice.match(/t:\s*["']([^"']+)["']/);
    const dMatch = slice.match(/d:\s*["']([^"']*)["']/);
    const ptsIdx = slice.indexOf("pts:");
    const pts = [];
    if (ptsIdx > 0) {
      const ptsSlice = slice.slice(ptsIdx, ptsIdx + 4500);
      const endArr = ptsSlice.indexOf("]");
      const arrBody = endArr > 0 ? ptsSlice.slice(0, endArr) : ptsSlice;
      const strRe = /["']((?:\\.|[^"\\'])*)["']/g;
      let m;
      while ((m = strRe.exec(arrBody)) !== null) {
        const line = m[1].replace(/\\"/g, '"').replace(/\\'/g, "'").trim();
        if (line.length > 10) pts.push(line);
        if (pts.length >= 6) break;
      }
    }
    if (tMatch) {
      return {
        title: tMatch[1],
        date: (dMatch && dMatch[1]) || "",
        points: pts,
      };
    }
  } catch (e) {}
  return null;
}

// Kéo trực tiếp toàn bộ mã nguồn ES Modules từ GitHub và đóng gói thành ZIP chuẩn trong trình duyệt
async function buildModFromGithubSources(repo, branch, targetVersion, onProgress) {
  const enc = new TextEncoder();
  const filesMap = new Map();
  const textMap = new Map();

  onProgress && onProgress(0.1, "Đang đồng bộ danh sách module từ GitHub…");

  // Kiểm tra xem trên GitHub có thêm module mới nào trong build.js không
  let moduleList = [...MOD_SOURCE_FILES];
  try {
    const buildJsTxt = await fetchTextWithFallback(repo, branch, "build.js");
    const mArr = buildJsTxt.match(/const\s+SRC_MODULES\s*=\s*\[([\s\S]*?)\];/);
    if (mArr && mArr[1]) {
      const parsedMods = [];
      const strRe = /["']([^"']+\.js)["']/g;
      let m;
      while ((m = strRe.exec(mArr[1])) !== null) {
        parsedMods.push(m[1]);
      }
      if (parsedMods.length >= 10) {
        moduleList = ["mod.yaml", "main.js", ...parsedMods];
      }
    }
  } catch (e) {}

  // Đồng bộ cả src/styles/ui.css nếu có để đảm bảo CSS mới nhất
  let rawCss = "";
  try {
    rawCss = await fetchTextWithFallback(repo, branch, "src/styles/ui.css");
  } catch (e) {}

  let done = 0;
  const total = moduleList.length;
  const batchSize = 6;

  for (let i = 0; i < total; i += batchSize) {
    const batch = moduleList.slice(i, i + batchSize);
    await Promise.all(
      batch.map(async (relPath) => {
        try {
          let txt = await fetchTextWithFallback(repo, branch, relPath);
          if (relPath === "mod.yaml" && targetVersion) {
            txt = txt.replace(/^version:\s*["']?[^"'\r\n]+["']?/m, `version: "${targetVersion}"`);
          } else if (relPath === "src/core/utils.js" && targetVersion) {
            txt = txt.replace(
              /export\s+(?:var|const|let)\s+TOOL_VER\s*=\s*["'][^"']+["'];/,
              `export const TOOL_VER = "${targetVersion}";`,
            );
          } else if (relPath === "src/styles/ui-css.js" && rawCss.trim()) {
            txt = [
              "// MODULE: UI_CSS — Đồng bộ trực tiếp từ src/styles/ui.css qua Auto-Updater",
              `import { gWin } from "../core/utils.js";`,
              `export const UI_CSS = ${JSON.stringify(rawCss.trim())};`,
              `Object.assign(gWin, { UI_CSS });`,
              "",
            ].join("\n");
          }
          textMap.set(relPath, txt);
          filesMap.set(relPath, enc.encode(txt));
        } catch (err) {
          // Nếu là module tùy chọn chưa tồn tại thì bỏ qua, nhưng báo lỗi nếu là main.js / mod.yaml
          if (relPath === "main.js" || relPath === "mod.yaml") throw err;
        } finally {
          done++;
          const ratio = 0.15 + 0.55 * (done / total);
          onProgress &&
            onProgress(ratio, `Đang tải mã nguồn (${done}/${total}): ${relPath}…`);
        }
      }),
    );
  }

  onProgress && onProgress(0.75, "Đang đóng gói cấu trúc ES Modules vào bộ nhớ…");
  const zipBuffer = await createZipInBrowser(filesMap);
  return { zipBuffer, filesMap, textMap };
}

// ── Cơ chế 1: Cập nhật trực tiếp vào IndexedDB Mod Store & Service Worker Cache của Game ──
function getMimeType(filePath) {
  if (filePath.endsWith(".js") || filePath.endsWith(".mjs")) return "text/javascript";
  if (filePath.endsWith(".css")) return "text/css";
  if (filePath.endsWith(".json")) return "application/json";
  if (filePath.endsWith(".yaml") || filePath.endsWith(".yml")) return "text/yaml";
  if (filePath.endsWith(".webp")) return "image/webp";
  if (filePath.endsWith(".png")) return "image/png";
  return "application/octet-stream";
}

function convertToSampleFormat(sampleVal, uint8Bytes, textStr, filePath, newZipBuffer) {
  if (typeof sampleVal === "string") {
    return textStr !== undefined ? textStr : new TextDecoder("utf-8").decode(uint8Bytes);
  }
  if (sampleVal instanceof Uint8Array) {
    return new Uint8Array(uint8Bytes);
  }
  if (sampleVal instanceof ArrayBuffer) {
    return uint8Bytes.buffer.slice(
      uint8Bytes.byteOffset,
      uint8Bytes.byteOffset + uint8Bytes.byteLength,
    );
  }
  if (typeof Blob !== "undefined" && sampleVal instanceof Blob) {
    return new Blob([uint8Bytes], { type: sampleVal.type || getMimeType(filePath) });
  }
  if (sampleVal && typeof sampleVal === "object") {
    const cloned = { ...sampleVal };
    const mime = getMimeType(filePath);
    for (const k of ["data", "content", "body", "bytes", "buffer", "value", "blob", "raw", "text"]) {
      if (k in cloned && cloned[k] !== undefined) {
        cloned[k] = convertToSampleFormat(
          cloned[k],
          uint8Bytes,
          textStr,
          filePath,
          newZipBuffer,
        );
      }
    }
    if ("size" in cloned) cloned.size = uint8Bytes.byteLength;
    if ("length" in cloned) cloned.length = uint8Bytes.byteLength;
    if ("type" in cloned && typeof cloned.type === "string") cloned.type = mime;
    if ("mime" in cloned && typeof cloned.mime === "string") cloned.mime = mime;
    if ("contentType" in cloned && typeof cloned.contentType === "string")
      cloned.contentType = mime;
    if ("updatedAt" in cloned) cloned.updatedAt = Date.now();
    return cloned;
  }
  return new Uint8Array(uint8Bytes);
}

function buildUpdatedFilesContainer(existingFiles, filesMap, textMap, newZipBuffer) {
  const isMap = existingFiles instanceof Map;
  const entries = isMap ? [...existingFiles.entries()] : Object.entries(existingFiles || {});
  let keyPrefix = "";
  let sampleVal = null;

  for (const [k, v] of entries) {
    if (sampleVal === null && v !== undefined && v !== null) sampleVal = v;
    if (k.endsWith("main.js")) {
      keyPrefix = k.slice(0, k.length - "main.js".length);
      sampleVal = v;
      break;
    }
    if (k.endsWith("mod.yaml")) {
      keyPrefix = k.slice(0, k.length - "mod.yaml".length);
      sampleVal = v;
      break;
    }
  }

  const out = isMap ? new Map() : {};
  for (const [relPath, uint8] of filesMap.entries()) {
    const fullKey = keyPrefix + relPath;
    const txt = textMap.get(relPath);
    const formattedVal = convertToSampleFormat(sampleVal, uint8, txt, relPath, newZipBuffer);
    if (isMap) out.set(fullKey, formattedVal);
    else out[fullKey] = formattedVal;
  }
  return out;
}

async function discoverCandidateDbNames() {
  const names = new Set([
    "tu-tien-mods",
    "tu-tien",
    "tuTien",
    "tuTienMods",
    "tu-tien:mods",
    "mods",
    "mod-store",
    "mod_store",
    "keyval-store",
    "localforage",
  ]);

  if (typeof indexedDB !== "undefined" && typeof indexedDB.databases === "function") {
    try {
      const dbs = await indexedDB.databases();
      for (const d of dbs || []) {
        if (d && d.name) names.add(d.name);
      }
    } catch (e) {}
  }

  // Quét nhanh trong script bundle của game hoặc sw.js cùng origin để lấy chính xác tên IndexedDB nếu trình duyệt ẩn indexedDB.databases()
  try {
    const scripts = [...document.querySelectorAll('script[src*="index-"], script[src*="assets/"]')];
    for (const s of scripts.slice(0, 2)) {
      if (!s.src) continue;
      const res = await fetch(s.src, { cache: "force-cache" });
      if (res.ok) {
        const code = await res.text();
        const re = /indexedDB\.open\(\s*["']([^"']+)["']/g;
        let m;
        while ((m = re.exec(code)) !== null) {
          if (m[1]) names.add(m[1]);
        }
      }
    }
  } catch (e) {}

  return [...names];
}

function inspectAndOpenExistingDb(dbName) {
  return new Promise((resolve) => {
    if (typeof indexedDB === "undefined") return resolve(null);
    let existed = true;
    let req;
    try {
      req = indexedDB.open(dbName);
    } catch (e) {
      return resolve(null);
    }
    req.onupgradeneeded = () => {
      // Nếu DB chưa từng tồn tại trên máy người chơi, hủy ngay để không tạo DB rỗng thừa
      existed = false;
      try {
        req.transaction.abort();
      } catch (e) {}
    };
    req.onerror = () => resolve(null);
    req.onsuccess = () => {
      const db = req.result;
      if (!existed || !db || !db.objectStoreNames || db.objectStoreNames.length === 0) {
        try {
          db.close();
        } catch (e) {}
        return resolve(null);
      }
      resolve(db);
    };
  });
}

function idbReq(req) {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function updateModInIndexedDB(newVersion, zipBuffer, filesMap, textMap) {
  const dbNames = await discoverCandidateDbNames();
  let updatedStoresCount = 0;
  let updatedRecordsCount = 0;
  const zipUint8 = new Uint8Array(zipBuffer);

  // Phân tích manifest mới bằng hàm lõi của game nếu có
  let parsedManifest = null;
  const modYamlText = textMap.get("mod.yaml") || "";
  try {
    const manifestMod = TT && TT.core && TT.core["mod/manifest"];
    if (manifestMod && typeof manifestMod.parseManifest === "function") {
      const r = manifestMod.parseManifest({
        id: MOD_ID,
        name: "Vạn Kiếp Tu Tiên Tool · Trợ Lý",
        version: newVersion,
        api_version: 1,
        author: "LoganZ · Kỹ Sư",
        script: "main.js",
      });
      if (r && r.manifest) parsedManifest = r.manifest;
    }
  } catch (e) {}

  for (const dbName of dbNames) {
    const db = await inspectAndOpenExistingDb(dbName);
    if (!db) continue;

    try {
      const storeNames = [...db.objectStoreNames];
      for (const storeName of storeNames) {
        let tx, store, allKeys, allVals;
        try {
          tx = db.transaction(storeName, "readwrite");
          store = tx.objectStore(storeName);
          [allKeys, allVals] = await Promise.all([
            idbReq(store.getAllKeys()),
            idbReq(store.getAll()),
          ]);
        } catch (e) {
          continue;
        }

        const hasInlineKey = store.keyPath !== null && store.keyPath !== undefined;
        let storeTouched = false;

        // Kiểm tra xem ObjectStore này lưu theo từng file rời (vd: key = "van_kiep_tro_ly/main.js") hay lưu theo gói Mod
        const fileKeyMatches = [];
        for (let i = 0; i < allKeys.length; i++) {
          const k = allKeys[i];
          const v = allVals[i];
          const kStr = Array.isArray(k) ? k.join("/") : String(k || "");
          if (
            kStr.includes(MOD_ID + "/") ||
            kStr.includes(MOD_ID + ":") ||
            (v && typeof v === "object" && (v.modId === MOD_ID || v.mod === MOD_ID) && v.path)
          ) {
            fileKeyMatches.push({ key: k, val: v, keyStr: kStr });
          }
        }

        if (fileKeyMatches.length > 0) {
          // CẬP NHẬT KIỂU 1: ObjectStore lưu từng file của Mod
          const sample = fileKeyMatches[0];
          // Xóa các bản ghi file cũ của van_kiep_tro_ly
          for (const item of fileKeyMatches) {
            try {
              await idbReq(store.delete(item.key));
            } catch (e) {}
          }

          for (const [relPath, uint8] of filesMap.entries()) {
            const txt = textMap.get(relPath);
            let newKey = relPath;
            if (Array.isArray(sample.key)) {
              newKey = [MOD_ID, relPath];
            } else if (typeof sample.key === "string") {
              const idx = sample.key.indexOf(MOD_ID);
              const sep = sample.key.slice(idx + MOD_ID.length, idx + MOD_ID.length + 1) || "/";
              const prefix = sample.key.slice(0, idx + MOD_ID.length) + sep;
              newKey = prefix + relPath;
            }

            let newVal;
            if (
              sample.val &&
              typeof sample.val === "object" &&
              !(sample.val instanceof Uint8Array) &&
              !(sample.val instanceof ArrayBuffer) &&
              !(typeof Blob !== "undefined" && sample.val instanceof Blob)
            ) {
              newVal = convertToSampleFormat(sample.val, uint8, txt, relPath, zipBuffer);
              if ("path" in newVal) newVal.path = relPath;
              if ("file" in newVal) newVal.file = relPath;
              if ("name" in newVal) newVal.name = relPath;
              if (hasInlineKey && typeof store.keyPath === "string" && !(store.keyPath in newVal)) {
                newVal[store.keyPath] = newKey;
              }
            } else {
              newVal = convertToSampleFormat(sample.val, uint8, txt, relPath, zipBuffer);
            }

            if (hasInlineKey) {
              await idbReq(store.put(newVal));
            } else {
              await idbReq(store.put(newVal, newKey));
            }
            updatedRecordsCount++;
          }
          storeTouched = true;
        }

        // CẬP NHẬT KIỂU 2: ObjectStore lưu đối tượng gói Mod (key === "van_kiep_tro_ly" hoặc val.id === "van_kiep_tro_ly")
        for (let i = 0; i < allKeys.length; i++) {
          const k = allKeys[i];
          const v = allVals[i];
          const isTargetMod =
            k === MOD_ID ||
            k === `mod:${MOD_ID}` ||
            (v &&
              typeof v === "object" &&
              (v.id === MOD_ID ||
                (v.manifest && v.manifest.id === MOD_ID) ||
                (v.info && v.info.id === MOD_ID)));

          if (!isTargetMod) continue;

          let updatedVal;
          if (
            v instanceof Uint8Array ||
            v instanceof ArrayBuffer ||
            (typeof Blob !== "undefined" && v instanceof Blob) ||
            typeof v === "string"
          ) {
            updatedVal = convertToSampleFormat(
              v,
              zipUint8,
              textMap.get("main.js"),
              "van-kiep-tro-ly-mod.zip",
              zipBuffer,
            );
          } else if (v && typeof v === "object") {
            updatedVal = { ...v };
            if ("version" in updatedVal) updatedVal.version = newVersion;
            if ("updatedAt" in updatedVal)
              updatedVal.updatedAt =
                typeof updatedVal.updatedAt === "string"
                  ? new Date().toISOString()
                  : Date.now();
            if ("installedAt" in updatedVal)
              updatedVal.installedAt =
                typeof updatedVal.installedAt === "string"
                  ? new Date().toISOString()
                  : Date.now();

            for (const mfKey of ["manifest", "info", "meta"]) {
              if (updatedVal[mfKey] && typeof updatedVal[mfKey] === "object") {
                updatedVal[mfKey] = {
                  ...updatedVal[mfKey],
                  ...(parsedManifest || {}),
                  version: newVersion,
                };
              }
            }

            for (const yKey of ["modYaml", "yaml", "rawManifest", "manifestText"]) {
              if (typeof updatedVal[yKey] === "string" && modYamlText) {
                updatedVal[yKey] = modYamlText;
              }
            }

            for (const sKey of ["script", "main", "code", "entry", "mainJs"]) {
              if (
                typeof updatedVal[sKey] === "string" &&
                updatedVal[sKey].length > 50 &&
                textMap.has("main.js")
              ) {
                updatedVal[sKey] = textMap.get("main.js");
              }
            }

            for (const zKey of ["zip", "archive", "blob", "raw", "data", "bytes", "buffer", "pack"]) {
              if (
                zKey in updatedVal &&
                updatedVal[zKey] !== null &&
                updatedVal[zKey] !== undefined &&
                (updatedVal[zKey] instanceof Uint8Array ||
                  updatedVal[zKey] instanceof ArrayBuffer ||
                  (typeof Blob !== "undefined" && updatedVal[zKey] instanceof Blob))
              ) {
                updatedVal[zKey] = convertToSampleFormat(
                  updatedVal[zKey],
                  zipUint8,
                  undefined,
                  "van-kiep-tro-ly-mod.zip",
                  zipBuffer,
                );
              }
            }

            for (const fKey of ["files", "entries", "assets", "modules", "sources", "tree"]) {
              if (updatedVal[fKey] && typeof updatedVal[fKey] === "object") {
                updatedVal[fKey] = buildUpdatedFilesContainer(
                  updatedVal[fKey],
                  filesMap,
                  textMap,
                  zipBuffer,
                );
              }
            }
          }

          if (updatedVal !== undefined) {
            if (hasInlineKey) {
              await idbReq(store.put(updatedVal));
            } else {
              await idbReq(store.put(updatedVal, k));
            }
            updatedRecordsCount++;
            storeTouched = true;
          }
        }

        if (storeTouched) updatedStoresCount++;
      }
    } finally {
      try {
        db.close();
      } catch (e) {}
    }
  }

  // Xóa và làm mới bộ nhớ đệm CacheStorage của Service Worker cho đường dẫn /mods/van_kiep_tro_ly/
  let clearedCaches = 0;
  if (typeof caches !== "undefined" && typeof caches.keys === "function") {
    try {
      const cacheNames = await caches.keys();
      for (const cName of cacheNames) {
        const cache = await caches.open(cName);
        const reqs = await cache.keys();
        for (const req of reqs) {
          if (req.url && (req.url.includes(`/mods/${MOD_ID}/`) || req.url.includes(MOD_ID))) {
            await cache.delete(req);
            clearedCaches++;
          }
        }
      }
    } catch (e) {}
  }

  // Đảm bảo mod luôn được bật trong localStorage["tu-tien:mods"]
  try {
    const rawSettings = localStorage.getItem("tu-tien:mods");
    if (rawSettings) {
      const parsed = JSON.parse(rawSettings);
      if (parsed && typeof parsed === "object") {
        parsed.enabled = parsed.enabled || {};
        parsed.enabled[MOD_ID] = true;
        localStorage.setItem("tu-tien:mods", JSON.stringify(parsed));
      }
    }
  } catch (e) {}

  return {
    ok: updatedRecordsCount > 0,
    updatedStoresCount,
    updatedRecordsCount,
    clearedCaches,
  };
}

// ── Cơ chế 2: Bơm trực tiếp gói ZIP vào `<input type="file">` của hộp thoại Mods trong Game ──
async function installViaGameFileInput(zipBuffer) {
  if (typeof DataTransfer === "undefined" || typeof File === "undefined") return false;
  try {
    const zipFile = new File([zipBuffer], "van-kiep-tro-ly-mod.zip", {
      type: "application/zip",
    });
    const injectIntoInput = (inp) => {
      if (!inp) return false;
      const dt = new DataTransfer();
      dt.items.add(zipFile);
      inp.files = dt.files;
      inp.dispatchEvent(new Event("input", { bubbles: true }));
      inp.dispatchEvent(new Event("change", { bubbles: true }));
      return true;
    };

    // Tìm input[type="file"] đang có sẵn trong DOM (ngoài input nạp save của Tool)
    const findGameZipInput = () => {
      const inputs = [...document.querySelectorAll('input[type="file"]')];
      return inputs.find(
        (el) =>
          el.id !== "sv-file-input" &&
          (!el.closest || !el.closest("#vkx-win")) &&
          (!el.accept || el.accept.includes(".zip") || el.accept.includes("zip") || el.accept.includes(".js")),
      );
    };

    let existingInp = findGameZipInput();
    if (existingInp) {
      return injectIntoInput(existingInp);
    }

    // Nếu hộp thoại Mods của game chưa mở, thử kích hoạt mở tạm hoặc chặn HTMLInputElement.prototype.click
    let intercepted = false;
    const origClick = HTMLInputElement.prototype.click;
    HTMLInputElement.prototype.click = function () {
      if (this && this.type === "file" && this.id !== "sv-file-input") {
        intercepted = injectIntoInput(this);
        return;
      }
      return origClick.apply(this, arguments);
    };

    try {
      // Tìm nút "Cài mod" nếu hộp thoại Mods đang mở trên màn hình
      const allBtns = [...document.querySelectorAll("button, label")];
      const installBtn = allBtns.find(
        (b) =>
          (!b.closest || !b.closest("#vkx-win")) &&
          /cài\s*mod|cài\s*gói|chọn\s*file\s*\.?zip/i.test(b.textContent || ""),
      );
      if (installBtn) {
        installBtn.click();
        await new Promise((r) => setTimeout(r, 120));
      }
      if (!intercepted) {
        existingInp = findGameZipInput();
        if (existingInp) intercepted = injectIntoInput(existingInp);
      }
    } finally {
      HTMLInputElement.prototype.click = origClick;
    }

    return intercepted;
  } catch (e) {
    return false;
  }
}

// ── Tải trực tiếp file `van-kiep-tro-ly-mod.zip` về máy người dùng ──
export function triggerDownloadZip(zipBuffer, version) {
  const blob = new Blob([zipBuffer], { type: "application/zip" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "van-kiep-tro-ly-mod.zip";
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    try {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {}
  }, 250);
  if (UI && typeof UI.notify === "function") {
    UI.notify(`📦 Đã tải gói van-kiep-tro-ly-mod.zip (v${version || TOOL_VER})!`);
  }
}

// ── Đối tượng điều phối AutoUpdater toàn cục ──
export const AutoUpdater = {
  cfg: loadUpdCfg(),
  state: loadUpdState(),
  checking: false,
  updating: false,
  updateAvailable: false,
  remoteInfo: null, // { version, sha, shortSha, commitMsg, commitDate, changelog, isCommitUpdate }
  lastError: "",
  _timerId: null,
  _countdownId: null,
  _countdownSec: 0,
  _listeners: [],

  onChange(fn) {
    if (typeof fn === "function") this._listeners.push(fn);
  },

  _emit() {
    this.syncHeaderUi();
    for (const fn of this._listeners) {
      try {
        fn(this);
      } catch (e) {}
    }
  },

  updateConfig(patch) {
    this.cfg = Object.assign({}, this.cfg, patch);
    saveUpdCfg(this.cfg);
    this.setupPeriodicTimer();
    this._emit();
  },

  setupPeriodicTimer() {
    if (this._timerId) {
      clearInterval(this._timerId);
      this._timerId = null;
    }
    const mins = Number(this.cfg.intervalMin) || 0;
    if (this.cfg.enabled && mins > 0) {
      const ms = Math.max(3, mins) * 60 * 1000;
      this._timerId = setInterval(() => {
        if (!this.checking && !this.updating) {
          this.checkForUpdate({ silent: true });
        }
      }, ms);
    }
  },

  cancelCountdown(dismiss = false) {
    if (this._countdownId) {
      clearInterval(this._countdownId);
      this._countdownId = null;
    }
    this._countdownSec = 0;
    if (dismiss && this.remoteInfo) {
      this.state.dismissedVer = this.remoteInfo.version || "";
      this.state.dismissedSha = this.remoteInfo.sha || "";
      saveUpdState(this.state);
      const banner = document.getElementById("vkx-upd-banner");
      if (banner) banner.style.display = "none";
    }
    this._emit();
  },

  // Kiểm tra phiên bản và Commit mới nhất trên GitHub
  async checkForUpdate(opts = {}) {
    if (this.checking) return this.remoteInfo;
    this.checking = true;
    this.lastError = "";
    this._emit();

    const repo = (this.cfg.repo || DEFAULT_REPO).trim().replace(/^https?:\/\/github\.com\//i, "").replace(/\/+$/, "");
    const branch = (this.cfg.branch || DEFAULT_BRANCH).trim() || "main";

    try {
      let remoteVer = "";
      // 1. Đọc version từ package.json trên GitHub
      try {
        const pkgTxt = await fetchTextWithFallback(repo, branch, "package.json");
        const pkg = JSON.parse(pkgTxt);
        if (pkg && pkg.version) remoteVer = String(pkg.version).trim();
      } catch (e) {}

      // 2. Fallback sang mod.yaml nếu package.json lỗi
      if (!remoteVer) {
        const yamlTxt = await fetchTextWithFallback(repo, branch, "mod.yaml");
        const m = yamlTxt.match(/^version:\s*["']?([^"'\r\n]+)["']?/m);
        if (m && m[1]) remoteVer = m[1].trim();
      }

      if (!remoteVer) {
        throw new Error("Không đọc được thông tin version từ repo " + repo);
      }

      // 3. Lấy thêm thông tin Commit SHA mới nhất từ GitHub API (không bắt buộc nếu bị giới hạn rate-limit)
      let sha = "";
      let shortSha = "";
      let commitMsg = "";
      let commitDate = "";
      try {
        const apiRes = await fetch(
          `https://api.github.com/repos/${repo}/commits/${encodeURIComponent(branch)}`,
          {
            cache: "no-store",
            headers: { Accept: "application/vnd.github.v3+json" },
          },
        );
        if (apiRes.ok) {
          const cData = await apiRes.json();
          if (cData && cData.sha) {
            sha = String(cData.sha);
            shortSha = sha.slice(0, 7);
            commitMsg =
              (cData.commit && cData.commit.message && cData.commit.message.split("\n")[0]) || "";
            commitDate = (cData.commit && cData.commit.committer && cData.commit.committer.date) || "";
          }
        }
      } catch (e) {}

      // Nếu người dùng vừa nâng cấp lên TOOL_VER hiện tại lần đầu, đồng bộ mốc installedVer & installedSha
      if (this.state.installedVer !== TOOL_VER) {
        this.state.installedVer = TOOL_VER;
        if (sha && compareSemver(remoteVer, TOOL_VER) === 0) {
          this.state.installedSha = sha;
        }
      } else if (!this.state.installedSha && sha && compareSemver(remoteVer, TOOL_VER) <= 0) {
        this.state.installedSha = sha;
      }

      this.state.lastCheckTs = Date.now();
      saveUpdState(this.state);

      const verCmp = compareSemver(remoteVer, TOOL_VER);
      const isNewerSemver = verCmp > 0;
      const isNewerCommit =
        !isNewerSemver &&
        verCmp === 0 &&
        this.cfg.checkCommitSha &&
        Boolean(sha && this.state.installedSha && sha !== this.state.installedSha);

      let changelog = null;
      if (isNewerSemver || isNewerCommit || opts.manual) {
        try {
          const nkTxt = await fetchTextWithFallback(repo, branch, "src/modules/nhat-ky.js");
          changelog = extractLatestChangelog(nkTxt);
        } catch (e) {}
      }

      this.updateAvailable = isNewerSemver || isNewerCommit;
      this.remoteInfo = {
        repo,
        branch,
        version: remoteVer,
        currentVersion: TOOL_VER,
        sha,
        shortSha,
        commitMsg,
        commitDate,
        changelog,
        isNewerSemver,
        isNewerCommit,
        checkedAt: this.state.lastCheckTs,
      };

      if (this.updateAvailable) {
        const isDismissed =
          !opts.manual &&
          this.state.dismissedVer === remoteVer &&
          (!sha || this.state.dismissedSha === sha);

        this.renderBanner(!isDismissed);

        if (!isDismissed) {
          const labelVer = isNewerCommit
            ? `v${remoteVer} (Commit mới #${shortSha})`
            : `v${remoteVer}`;
          if (UI && typeof UI.notify === "function") {
            UI.notify(`🚀 Phát hiện bản cập nhật Mod mới trên GitHub: ${labelVer}!`);
          }

          if (this.cfg.installMode === "auto_immediate") {
            this.performUpdate({ autoTriggered: true });
          } else if (this.cfg.installMode === "auto_countdown") {
            this.startAutoCountdown(8);
          }
        }
      } else {
        this.renderBanner(false);
        if (opts.manual && UI && typeof UI.notify === "function") {
          UI.notify(
            `✅ Bạn đang dùng bản mới nhất trên GitHub (v${TOOL_VER}${shortSha ? " · #" + shortSha : ""})!`,
          );
        }
      }

      return this.remoteInfo;
    } catch (err) {
      this.lastError = (err && err.message) || String(err);
      if (opts.manual && UI && typeof UI.notify === "function") {
        UI.notify("⚠️ Lỗi kiểm tra GitHub: " + this.lastError);
      }
      return null;
    } finally {
      this.checking = false;
      this._emit();
    }
  },

  startAutoCountdown(seconds = 8) {
    this.cancelCountdown(false);
    // Nếu đang ở giữa trận đánh tay căng thẳng, chờ ngoài trận hoặc cho phép người dùng bấm
    this._countdownSec = seconds;
    this.renderBanner(true);
    this._countdownId = setInterval(() => {
      this._countdownSec--;
      if (this._countdownSec <= 0) {
        this.cancelCountdown(false);
        this.performUpdate({ autoTriggered: true });
      } else {
        this.renderBanner(true);
      }
    }, 1000);
  },

  // Thực thi tải gói cập nhật từ GitHub -> ghi đè vào Game (IndexedDB / File Input) -> lưu Save -> Reload
  async performUpdate(opts = {}) {
    if (this.updating) return;
    this.cancelCountdown(false);
    this.updating = true;
    this.lastError = "";
    this._emit();

    const repo = (this.cfg.repo || DEFAULT_REPO).trim().replace(/^https?:\/\/github\.com\//i, "").replace(/\/+$/, "");
    const branch = (this.cfg.branch || DEFAULT_BRANCH).trim() || "main";
    const targetVer = (this.remoteInfo && this.remoteInfo.version) || TOOL_VER;

    const setProg = (ratio, msg) => {
      this._progressRatio = Math.min(1, Math.max(0, ratio || 0));
      this._progressMsg = msg || "";
      this.renderBanner(true);
      this.syncModalProgress();
    };

    try {
      setProg(0.08, `Đang tải gói van-kiep-tro-ly-mod.zip (v${targetVer}) từ GitHub…`);

      let zipBuffer = null;
      let filesMap = null;
      let textMap = null;
      let needBuildFromSources = false;

      try {
        zipBuffer = await fetchBinaryWithFallback(repo, branch, "van-kiep-tro-ly-mod.zip");
        setProg(0.35, "Đang giải nén và kiểm tra chữ ký gói Mod…");
        const extracted = await unzipInBrowser(zipBuffer);
        filesMap = extracted.filesMap;
        textMap = extracted.textMap;

        // Kiểm tra xem file mod.yaml bên trong gói zip trên GitHub đã khớp với version mới nhất chưa
        const yamlTxt = textMap.get("mod.yaml") || "";
        const mVer = yamlTxt.match(/^version:\s*["']?([^"'\r\n]+)["']?/m);
        const zipVer = mVer && mVer[1] ? mVer[1].trim() : "";
        if (targetVer && zipVer && compareSemver(targetVer, zipVer) > 0) {
          // Gói .zip trên repo cũ hơn mã nguồn -> tự động kéo thẳng mã nguồn ES Modules từ GitHub!
          needBuildFromSources = true;
        }
        if (!filesMap.has("main.js") || !filesMap.has("mod.yaml")) {
          needBuildFromSources = true;
        }
      } catch (zipErr) {
        needBuildFromSources = true;
      }

      if (needBuildFromSources || opts.forceFromSource) {
        const built = await buildModFromGithubSources(repo, branch, targetVer, setProg);
        zipBuffer = built.zipBuffer;
        filesMap = built.filesMap;
        textMap = built.textMap;
      }

      if (opts.downloadOnly) {
        setProg(1, "Đã tải xuống gói van-kiep-tro-ly-mod.zip!");
        triggerDownloadZip(zipBuffer, targetVer);
        return { ok: true, mode: "download" };
      }

      setProg(0.8, "Đang ghi bản cập nhật trực tiếp vào IndexedDB của game…");
      const idbRes = await updateModInIndexedDB(targetVer, zipBuffer, filesMap, textMap);

      let uiInjected = false;
      if (!idbRes.ok) {
        setProg(0.88, "Đang đồng bộ qua trình cài đặt Mod của game…");
        uiInjected = await installViaGameFileInput(zipBuffer);
      }

      // Lưu trạng thái phiên bản & mã Commit SHA vừa cài
      this.state.installedVer = targetVer;
      if (this.remoteInfo && this.remoteInfo.sha) {
        this.state.installedSha = this.remoteInfo.sha;
      }
      this.state.lastUpdateSuccessVer = targetVer;
      this.state.lastUpdateSuccessTs = Date.now();
      saveUpdState(this.state);

      // Bảo toàn tiến trình người chơi trước khi tải lại trang
      if (this.cfg.autoQuickSave) {
        try {
          const g = gWin.TT && gWin.TT.game;
          if (g && typeof g.flushSave === "function") g.flushSave();
          if (g && g.state && g.state.run && typeof gWin.saveQuickSave === "function") {
            gWin.saveQuickSave(`Dự phòng tự động trước khi Auto Update lên v${targetVer}`);
          }
        } catch (e) {}
      }

      if (idbRes.ok || uiInjected) {
        setProg(
          1,
          `✅ Đã cập nhật thành công lên v${targetVer} (${idbRes.updatedRecordsCount || 1} bản ghi)! Đang tải lại game…`,
        );
        if (UI && typeof UI.notify === "function") {
          UI.notify(`✅ Đã cập nhật Mod lên v${targetVer}! Đang tự động tải lại trang…`);
        }
        setTimeout(() => {
          try {
            window.location.reload();
          } catch (e) {}
        }, 900);
        return { ok: true, mode: idbRes.ok ? "indexeddb" : "ui_input", idbRes };
      } else {
        // Fallback an toàn: tải gói .zip về máy và mở màn hình Mods của game
        triggerDownloadZip(zipBuffer, targetVer);
        setProg(
          1,
          `📦 Đã tải gói van-kiep-tro-ly-mod.zip (v${targetVer}) về máy! Hãy chọn file vừa tải trong mục Cấu hình ➔ Mods ➔ Cài mod.`,
        );
        if (UI && typeof UI.notify === "function") {
          UI.notify(
            `📦 Đã tải gói v${targetVer}! Hãy nạp file zip trong Cấu hình ➔ Mods ➔ Cài mod.`,
          );
        }
        return { ok: true, mode: "fallback_download" };
      }
    } catch (err) {
      this.lastError = (err && err.message) || String(err);
      setProg(0, "⚠️ Lỗi cập nhật: " + this.lastError);
      if (UI && typeof UI.notify === "function") {
        UI.notify("⚠️ Lỗi cập nhật: " + this.lastError);
      }
      return { ok: false, error: this.lastError };
    } finally {
      this.updating = false;
      this._emit();
    }
  },

  // Đồng bộ nút và huy hiệu báo cập nhật trên thanh Header (#vkx-hd)
  syncHeaderUi() {
    const pill = document.getElementById("vkx-upd-pill");
    const btn = document.getElementById("vkx-upd-btn");
    const fab = document.getElementById("vkx-fab");

    if (pill) {
      if (this.checking) {
        pill.className = "vkx-upd-pill checking";
        pill.innerHTML = "⏳ Đang dò GitHub…";
        pill.title = "Đang kiểm tra bản cập nhật mới trên GitHub…";
      } else if (this.updateAvailable && this.remoteInfo) {
        const tag = this.remoteInfo.isNewerCommit
          ? `v${this.remoteInfo.version} #${this.remoteInfo.shortSha}`
          : `v${this.remoteInfo.version}`;
        pill.className = "vkx-upd-pill has-upd";
        pill.innerHTML = `🚀 Có bản ${esc(tag)}`;
        pill.title = `Bấm để cập nhật tự động lên ${tag} từ GitHub`;
      } else {
        pill.className = "vkx-upd-pill ok";
        pill.innerHTML = "✔ Bản mới nhất";
        pill.title = `Đang ở bản mới nhất (v${TOOL_VER}) · Bấm để mở Trung Tâm Auto Update GitHub`;
      }
    }

    if (btn) {
      btn.classList.toggle("vkx-ib-upd-ready", !!this.updateAvailable);
      btn.classList.toggle("vkx-ib-spinning", !!(this.checking || this.updating));
      btn.title = this.updateAvailable && this.remoteInfo
        ? `🚀 Có bản cập nhật mới v${this.remoteInfo.version} trên GitHub! Bấm để cập nhật ngay.`
        : "Trung Tâm Auto Update GitHub (Kiểm tra & Cập nhật tự động)";
    }

    if (fab) {
      fab.classList.toggle("vkx-fab-has-upd", !!this.updateAvailable);
    }
  },

  // Hiển thị thanh thông báo cập nhật nổi ngay dưới Header (#vkx-upd-banner)
  renderBanner(show) {
    let banner = document.getElementById("vkx-upd-banner");
    if (!banner) {
      const win = document.getElementById("vkx-win");
      const anchor = document.getElementById("vkx-char-hud") || document.getElementById("vkx-hd");
      if (!win || !anchor) return;
      banner = document.createElement("div");
      banner.id = "vkx-upd-banner";
      banner.className = "vkx-upd-banner";
      anchor.insertAdjacentElement("afterend", banner);
    }

    if (!show || (!this.updateAvailable && !this.updating)) {
      banner.style.display = "none";
      banner.innerHTML = "";
      return;
    }

    const info = this.remoteInfo || { version: TOOL_VER };
    const verLabel = info.isNewerCommit
      ? `v${info.version} (Bản vá Commit #${info.shortSha})`
      : `v${info.version}`;
    const clTitle =
      (info.changelog && info.changelog.title) ||
      info.commitMsg ||
      "Bản cập nhật mới từ nhánh " + (info.branch || "main");

    const countdownHtml =
      this._countdownSec > 0 && !this.updating
        ? `<span class="vkx-upd-countdown">⏱ Tự động cập nhật sau <b>${this._countdownSec}s</b>…</span>`
        : "";

    const progHtml =
      this.updating || this._progressMsg
        ? `<div class="vkx-upd-prog-wrap">
             <div class="vk-bar" style="height:7px;margin:4px 0"><i style="width:${Math.round((this._progressRatio || 0) * 100)}%"></i></div>
             <div style="font-size:11.5px;color:var(--acc2)">${esc(this._progressMsg || "Đang xử lý…")}</div>
           </div>`
        : "";

    banner.style.display = "block";
    banner.innerHTML = `
      <div class="vkx-upd-banner-row">
        <div class="vkx-upd-banner-info">
          <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
            <span class="vkx-upd-badge-new">🚀 CẬP NHẬT GITHUB</span>
            <b style="color:var(--acc2);font-size:13px">v${esc(TOOL_VER)} ➔ ${esc(verLabel)}</b>
            ${countdownHtml}
          </div>
          <div style="font-size:11.5px;color:var(--txt);margin-top:2px;opacity:0.92">${esc(clTitle)}</div>
        </div>
        <div class="vkx-upd-banner-actions">
          <button type="button" class="vk-btn vkx-upd-act-now" id="vkx-bn-upd-now" ${this.updating ? "disabled" : ""}>
            ${this.updating ? "⏳ Đang Cập Nhật…" : "⚡ Cập Nhật & Tải Lại Ngay"}
          </button>
          <button type="button" class="vk-btn sec" id="vkx-bn-upd-dl" title="Tải trực tiếp gói van-kiep-tro-ly-mod.zip từ GitHub">📦 Tải .zip</button>
          <button type="button" class="vk-btn sec" id="vkx-bn-upd-cfg" title="Xem chi tiết Changelog & Cấu hình Auto Update">⚙️ Chi Tiết</button>
          <button type="button" class="vk-btn sec" id="vkx-bn-upd-close" title="Hoãn / Ẩn thông báo này">✕</button>
        </div>
      </div>
      ${progHtml}
    `;

    const btnNow = banner.querySelector("#vkx-bn-upd-now");
    if (btnNow) {
      btnNow.onclick = () => this.performUpdate({ autoTriggered: false });
    }
    const btnDl = banner.querySelector("#vkx-bn-upd-dl");
    if (btnDl) {
      btnDl.onclick = () => {
        this.cancelCountdown(false);
        this.performUpdate({ downloadOnly: true });
      };
    }
    const btnCfg = banner.querySelector("#vkx-bn-upd-cfg");
    if (btnCfg) {
      btnCfg.onclick = () => {
        this.cancelCountdown(false);
        this.openModal();
      };
    }
    const btnClose = banner.querySelector("#vkx-bn-upd-close");
    if (btnClose) {
      btnClose.onclick = () => this.cancelCountdown(true);
    }
  },

  syncModalProgress() {
    const progEl = document.getElementById("vkx-upd-modal-prog");
    if (!progEl) return;
    if (!this.updating && !this._progressMsg) {
      progEl.style.display = "none";
      return;
    }
    progEl.style.display = "block";
    progEl.innerHTML = `
      <div class="vk-bar" style="height:8px;margin:6px 0"><i style="width:${Math.round((this._progressRatio || 0) * 100)}%"></i></div>
      <div style="font-size:12px;color:var(--acc2);font-weight:600">${esc(this._progressMsg || "")}</div>
    `;
  },

  // Dựng HTML thẻ Trung Tâm Auto Update GitHub (dùng chung cho Modal, Tab Nhật Ký & Tab Tổng Quan)
  buildPanelHtml(prefix = "updm") {
    const cfg = this.cfg;
    const info = this.remoteInfo;
    const lastTimeStr = this.state.lastCheckTs
      ? new Date(this.state.lastCheckTs).toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      : "Chưa kiểm tra";

    let statusBadge = `<span style="color:var(--ok);font-weight:700">✔ Đang ở phiên bản mới nhất (v${esc(TOOL_VER)})</span>`;
    if (this.checking) {
      statusBadge = `<span style="color:var(--acc);font-weight:700">⏳ Đang kết nối GitHub kiểm tra bản mới…</span>`;
    } else if (this.updateAvailable && info) {
      statusBadge = `<span style="color:var(--acc2);font-weight:800">🚀 Có bản mới trên GitHub: v${esc(info.version)}${info.shortSha ? " (#" + esc(info.shortSha) + ")" : ""}!</span>`;
    } else if (this.lastError) {
      statusBadge = `<span style="color:var(--bad);font-weight:700">⚠️ ${esc(this.lastError)}</span>`;
    }

    let changelogHtml = "";
    if (info && info.changelog) {
      const cl = info.changelog;
      changelogHtml = `
        <div style="background:rgba(0,0,0,0.28);border:1px solid var(--line);border-left:3px solid var(--acc2);border-radius:10px;padding:9px 12px;margin-top:8px">
          <div style="font-weight:700;color:var(--acc2);font-size:12.5px;margin-bottom:4px">
            📜 Điểm Mới Trên GitHub: ${esc(cl.title)} ${cl.date ? `<span class="vk-mu">(${esc(cl.date)})</span>` : ""}
          </div>
          ${
            cl.points && cl.points.length
              ? `<ul style="margin:4px 0 0;padding-left:18px;font-size:12px;color:var(--txt);line-height:1.5">${cl.points.map((p) => `<li style="margin-bottom:3px">${p}</li>`).join("")}</ul>`
              : ""
          }
        </div>
      `;
    }

    return `
      <div class="vk-card vkx-upd-card" id="${prefix}-root">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:8px">
          <h3 style="margin:0">🔄 Trung Tâm Auto Update GitHub (OTA)</h3>
          <span class="pl pl-pick" style="margin:0;font-size:11.5px;padding:3px 10px">Repo: ${esc(cfg.repo)}@${esc(cfg.branch)}</span>
        </div>

        <div style="font-size:12px;color:var(--mut);margin-bottom:10px;line-height:1.5">
          Tự động phát hiện khi có bản Mod mới được đẩy lên GitHub, tự động tải và ghi đè trực tiếp vào <b>IndexedDB Mod Store</b> của game (hoặc đóng gói trực tiếp từ mã nguồn ES Modules trên GitHub), tự tạo <b>Quick Save</b> dự phòng rồi tải lại trang mà không cần cài lại thủ công.
        </div>

        <div class="vk-bento-grid" style="margin-bottom:10px">
          <div class="vk-bento-tile">
            <span class="vk-bento-lbl">🏷️ Phiên Bản Đang Chạy</span>
            <span class="vk-bento-val" style="color:var(--acc)">v${esc(TOOL_VER)} ${this.state.installedSha ? `<small class="vk-mu">(#${esc(this.state.installedSha.slice(0, 7))})</small>` : ""}</span>
          </div>
          <div class="vk-bento-tile">
            <span class="vk-bento-lbl">☁️ Phiên Bản Trên GitHub</span>
            <span class="vk-bento-val" style="color:${this.updateAvailable ? "var(--acc2)" : "var(--ok)"}">
              ${info && info.version ? "v" + esc(info.version) : "v" + esc(TOOL_VER)}
              ${info && info.shortSha ? `<small class="vk-mu">(#${esc(info.shortSha)})</small>` : ""}
            </span>
          </div>
          <div class="vk-bento-tile">
            <span class="vk-bento-lbl">📡 Trạng Thái Đồng Bộ</span>
            <span class="vk-bento-val" style="font-size:12px">${statusBadge}</span>
          </div>
          <div class="vk-bento-tile">
            <span class="vk-bento-lbl">🕒 Kiểm Tra Gần Nhất</span>
            <span class="vk-bento-val" style="font-size:12px">${esc(lastTimeStr)}${info && info.commitMsg ? ` · <small class="vk-mu">${esc(info.commitMsg.slice(0, 38))}</small>` : ""}</span>
          </div>
        </div>

        <div id="vkx-upd-modal-prog" style="display:${this.updating ? "block" : "none"};margin-bottom:8px"></div>

        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px">
          <button type="button" class="vk-btn" id="${prefix}-btn-check" ${this.checking || this.updating ? "disabled" : ""} style="margin:0;padding:8px 13px;font-size:12.5px">
            ${this.checking ? "⏳ Đang Kiểm Tra…" : "🔍 Kiểm Tra Cập Nhật Ngay"}
          </button>
          <button type="button" class="vk-btn" id="${prefix}-btn-install" ${this.updating ? "disabled" : ""} style="margin:0;padding:8px 14px;font-size:12.5px;background:linear-gradient(135deg,#10b981,#059669);color:#04130d;font-weight:800">
            ${this.updating ? "⏳ Đang Cập Nhật…" : this.updateAvailable && info ? `⚡ Cập Nhật Tự Động Lên v${esc(info.version)}` : "⚡ Cập Nhật / Cài Đè Trực Tiếp Từ GitHub"}
          </button>
          <button type="button" class="vk-btn sec" id="${prefix}-btn-force-src" ${this.updating ? "disabled" : ""} style="margin:0;padding:8px 12px;font-size:12px" title="Kéo trực tiếp các file mã nguồn .js/.css từ nhánh main trên GitHub và đóng gói lại ngay trên trình duyệt">
            🛠️ Kéo Source & Đóng Gói Trực Tiếp
          </button>
          <button type="button" class="vk-btn sec" id="${prefix}-btn-dl-zip" ${this.updating ? "disabled" : ""} style="margin:0;padding:8px 12px;font-size:12px">
            📦 Tải Gói .zip Về Máy
          </button>
        </div>

        ${changelogHtml}

        <details style="margin-top:10px" open>
          <summary style="cursor:pointer;font-weight:700;font-size:12.5px;color:var(--acc)">⚙️ Cấu Hình Tự Động Cập Nhật (Auto Update Settings)</summary>
          <div style="margin-top:8px;display:flex;flex-direction:column;gap:8px">
            <div class="vkx-fld-grid">
              <label class="vkx-fld-tile">
                <span><b>Chế Độ Khi Có Bản Mới Trên GitHub</b><small class="vk-mu">Cách Mod xử lý khi phát hiện repo có bản mới</small></span>
                <select class="vk-sel" id="${prefix}-sel-mode">
                  <option value="auto_countdown" ${cfg.installMode === "auto_countdown" ? "selected" : ""}>🚀 Tự động tải & Cập nhật sau 8s đếm ngược (Khuyên dùng)</option>
                  <option value="auto_immediate" ${cfg.installMode === "auto_immediate" ? "selected" : ""}>⚡ Tự động cập nhật & tải lại trang ngay lập tức (Zero-Click)</option>
                  <option value="notify" ${cfg.installMode === "notify" ? "selected" : ""}>🔔 Chỉ hiện thông báo & nút Cập Nhật 1-Chạm trên Header</option>
                </select>
              </label>

              <label class="vkx-fld-tile">
                <span><b>Chu Kỳ Tự Động Kiểm Tra Ngầm</b><small class="vk-mu">Quét phiên bản mới trên GitHub khi đang treo máy</small></span>
                <select class="vk-sel" id="${prefix}-sel-interval">
                  <option value="5" ${Number(cfg.intervalMin) === 5 ? "selected" : ""}>Mỗi 5 phút (Nhanh)</option>
                  <option value="15" ${Number(cfg.intervalMin) === 15 ? "selected" : ""}>Mỗi 15 phút (Mặc định)</option>
                  <option value="30" ${Number(cfg.intervalMin) === 30 ? "selected" : ""}>Mỗi 30 phút</option>
                  <option value="60" ${Number(cfg.intervalMin) === 60 ? "selected" : ""}>Mỗi 60 phút</option>
                  <option value="0" ${Number(cfg.intervalMin) === 0 ? "selected" : ""}>Chỉ kiểm tra lúc mới mở game</option>
                </select>
              </label>
            </div>

            <div class="vkx-fld-grid">
              <label class="vkx-fld-tile">
                <span><b>Địa Chỉ GitHub Repository (Owner/Repo)</b><small class="vk-mu">Kho chứa mã nguồn chính thức trên GitHub</small></span>
                <input type="text" class="vk-inp" id="${prefix}-inp-repo" value="${esc(cfg.repo)}" placeholder="zloganz/van-kiep-tro-ly">
              </label>

              <label class="vkx-fld-tile">
                <span><b>Nhánh Theo Dõi (Git Branch)</b><small class="vk-mu">Nhánh phát hành bản cập nhật (mặc định: main)</small></span>
                <input type="text" class="vk-inp" id="${prefix}-inp-branch" value="${esc(cfg.branch)}" placeholder="main">
              </label>
            </div>

            <label style="display:flex;align-items:center;gap:8px;font-size:12.5px;cursor:pointer">
              <input type="checkbox" id="${prefix}-chk-enabled" ${cfg.enabled ? "checked" : ""}>
              <span><b>Tự động kiểm tra bản mới khi khởi động game:</b> Tự động đối chiếu với GitHub ngay khi nạp Mod</span>
            </label>

            <label style="display:flex;align-items:center;gap:8px;font-size:12.5px;cursor:pointer">
              <input type="checkbox" id="${prefix}-chk-sha" ${cfg.checkCommitSha ? "checked" : ""}>
              <span><b>Theo dõi cả mã Commit SHA mới nhất:</b> Nhận diện bản vá (hotfix) đẩy lên GitHub ngay cả khi chưa đổi số Version</span>
            </label>

            <label style="display:flex;align-items:center;gap:8px;font-size:12.5px;cursor:pointer">
              <input type="checkbox" id="${prefix}-chk-qsave" ${cfg.autoQuickSave ? "checked" : ""}>
              <span><b>Tự động lưu Quick Save trước khi cập nhật:</b> Bảo toàn 100% tiến trình kiếp tu luyện trước khi tải lại trang</span>
            </label>
          </div>
        </details>
      </div>
    `;
  },

  bindPanelEvents(container, prefix = "updm") {
    if (!container) return;
    const q = (id) => container.querySelector(`#${prefix}-${id}`);

    const btnCheck = q("btn-check");
    if (btnCheck) {
      btnCheck.onclick = async () => {
        await this.checkForUpdate({ manual: true });
        this.refreshMountedPanels();
      };
    }

    const btnInstall = q("btn-install");
    if (btnInstall) {
      btnInstall.onclick = () => {
        this.performUpdate({ autoTriggered: false });
      };
    }

    const btnForceSrc = q("btn-force-src");
    if (btnForceSrc) {
      btnForceSrc.onclick = () => {
        this.performUpdate({ autoTriggered: false, forceFromSource: true });
      };
    }

    const btnDlZip = q("btn-dl-zip");
    if (btnDlZip) {
      btnDlZip.onclick = () => {
        this.performUpdate({ downloadOnly: true });
      };
    }

    const saveFromInputs = () => {
      const selMode = q("sel-mode");
      const selInt = q("sel-interval");
      const inpRepo = q("inp-repo");
      const inpBranch = q("inp-branch");
      const chkEn = q("chk-enabled");
      const chkSha = q("chk-sha");
      const chkQs = q("chk-qsave");

      this.updateConfig({
        installMode: selMode ? selMode.value : this.cfg.installMode,
        intervalMin: selInt ? parseInt(selInt.value, 10) || 0 : this.cfg.intervalMin,
        repo: inpRepo && inpRepo.value.trim() ? inpRepo.value.trim() : DEFAULT_REPO,
        branch: inpBranch && inpBranch.value.trim() ? inpBranch.value.trim() : DEFAULT_BRANCH,
        enabled: chkEn ? !!chkEn.checked : this.cfg.enabled,
        checkCommitSha: chkSha ? !!chkSha.checked : this.cfg.checkCommitSha,
        autoQuickSave: chkQs ? !!chkQs.checked : this.cfg.autoQuickSave,
      });
      if (UI && typeof UI.notify === "function") {
        UI.notify("💾 Đã lưu cấu hình Auto Update GitHub!");
      }
    };

    ["sel-mode", "sel-interval", "inp-repo", "inp-branch", "chk-enabled", "chk-sha", "chk-qsave"].forEach(
      (id) => {
        const el = q(id);
        if (el) el.onchange = saveFromInputs;
      },
    );
  },

  refreshMountedPanels() {
    const modalBody = document.getElementById("vkx-upd-modal-body");
    if (modalBody) {
      modalBody.innerHTML = this.buildPanelHtml("updm");
      this.bindPanelEvents(modalBody, "updm");
    }
    const nkBox = document.getElementById("vkx-nk-upd-slot");
    if (nkBox) {
      nkBox.innerHTML = this.buildPanelHtml("updnk");
      this.bindPanelEvents(nkBox, "updnk");
    }
  },

  openModal() {
    let modal = document.getElementById("vkx-upd-modal");
    if (!modal) {
      const win = document.getElementById("vkx-win") || document.body;
      modal = document.createElement("div");
      modal.id = "vkx-upd-modal";
      modal.className = "vkx-upd-modal-backdrop";
      modal.innerHTML = `
        <div class="vkx-upd-modal-dialog">
          <div class="vkx-upd-modal-hd">
            <b>🔄 Trung Tâm Cập Nhật Tự Động Qua GitHub</b>
            <button type="button" class="vkx-ib x" id="vkx-upd-modal-close" title="Đóng">✕</button>
          </div>
          <div class="vkx-upd-modal-body" id="vkx-upd-modal-body"></div>
        </div>
      `;
      win.appendChild(modal);
      modal.addEventListener("click", (e) => {
        if (e.target === modal) modal.classList.remove("on");
      });
      const closeBtn = modal.querySelector("#vkx-upd-modal-close");
      if (closeBtn) {
        closeBtn.onclick = () => modal.classList.remove("on");
      }
    }

    const bodyEl = modal.querySelector("#vkx-upd-modal-body");
    if (bodyEl) {
      bodyEl.innerHTML = this.buildPanelHtml("updm");
      this.bindPanelEvents(bodyEl, "updm");
    }
    modal.classList.add("on");
    if (!this.remoteInfo && !this.checking) {
      this.checkForUpdate({ manual: false }).then(() => this.refreshMountedPanels());
    }
  },

  init() {
    if (this._inited) return;
    this._inited = true;

    // Kết nối sự kiện bấm trên nút Header (#vkx-upd-btn & #vkx-upd-pill)
    const bindHeaderBtns = () => {
      const pill = document.getElementById("vkx-upd-pill");
      if (pill) {
        pill.onclick = (e) => {
          e.stopPropagation();
          if (this.updateAvailable) {
            this.openModal();
          } else {
            this.openModal();
          }
        };
      }
      const btn = document.getElementById("vkx-upd-btn");
      if (btn) {
        btn.onclick = (e) => {
          e.stopPropagation();
          this.openModal();
        };
      }
      this.syncHeaderUi();
    };

    bindHeaderBtns();
    setTimeout(bindHeaderBtns, 300);

    // Thông báo chào mừng nếu vừa tự động cập nhật xong ở lần tải trang trước
    if (
      this.state.lastUpdateSuccessVer === TOOL_VER &&
      Date.now() - (this.state.lastUpdateSuccessTs || 0) < 35000
    ) {
      this.state.lastUpdateSuccessVer = "";
      saveUpdState(this.state);
      setTimeout(() => {
        if (UI && typeof UI.notify === "function") {
          UI.notify(`🎉 Đã hoàn tất nâng cấp tự động lên phiên bản v${TOOL_VER}!`);
        }
      }, 900);
    }

    // Tự động kiểm tra bản mới khi khởi động game (trễ 2.2s để không ảnh hưởng tốc độ vào game)
    if (this.cfg.enabled) {
      setTimeout(() => {
        this.checkForUpdate({ silent: true }).then(() => this.refreshMountedPanels());
      }, 2200);
    }

    this.setupPeriodicTimer();
  },
};

export function initAutoUpdater() {
  AutoUpdater.init();
}

export function openUpdateModal() {
  AutoUpdater.openModal();
}

export function checkModUpdateNow() {
  return AutoUpdater.checkForUpdate({ manual: true });
}

export function performModAutoUpdate(opts) {
  return AutoUpdater.performUpdate(opts);
}

Object.assign(gWin, {
  MOD_SOURCE_FILES,
  compareSemver,
  unzipInBrowser,
  createZipInBrowser,
  updateModInIndexedDB,
  triggerDownloadZip,
  AutoUpdater,
  initAutoUpdater,
  openUpdateModal,
  checkModUpdateNow,
  performModAutoUpdate,
});
