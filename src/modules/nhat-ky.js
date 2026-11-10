/**
 * Module: Nhật Ký Cập Nhật (Changelog)
 */
/* ═══════════════ MODULE 2: NHẬT KÝ CẬP NHẬT (bản Trợ Lý) ═══════════════
 Mỗi lần sửa Tool: thêm một mục lên ĐẦU danh sách bên dưới, rồi tăng @version / TOOL_VER / "Phiên Bản" ở giao diện. */
var NhatKy = (function (UI) {
  "use strict";
  var inited = false;

  var HINT =
    "Bản Mod chạy trong game, chỉ gồm phần Trợ Lý; số bản của Trợ Lý (Bản 2.x) được đánh riêng, độc lập với số Phiên Bản của Tool.";

  var LOG = [
    {
      t: "Phiên Bản 7.23.0 · Chuyển Đổi Sang Game Mod Chính Thức (Loại Bỏ Stealth), Tái Cấu Trúc Đa File Modular & Đại Trùng Tu Hệ Thống Dị Bảo",
      d: "10/11/2026",
      now: true,
      pts: [
        "<b>Chuyển Đổi Hoàn Toàn Sang Game Mod Chính Thức (Loại Bỏ Stealth Mode):</b> Gỡ bỏ hoàn toàn cơ chế Tampermonkey Stealth Standalone (<code>waitForGameReady</code>), chuyển sang đăng ký trực tiếp vào hệ thống Mod nguyên bản của game qua <code>window.tuTienMods</code> (<code>apiVersion: 1</code>, <code>mod.yaml</code> + <code>main.js</code>) và tích hợp bảng điều khiển vào nút <b>☯ Mod</b> của game (<code>MOD.ui.addPanel</code>).",
        "<b>Tái Cấu Trúc Mã Nguồn Đa File (Modular Architecture):</b> Tách file đơn nguyên hơn 40.700 dòng thành 25 module độc lập theo chức năng trong thư mục <code>src/</code> (<code>styles/</code>, <code>ui/</code>, <code>data/</code>, <code>core/</code>, <code>modules/</code>, <code>auto/</code>) kèm trình biên dịch <code>build.js</code> tự động đóng gói ra <code>main.js</code> và file nén cài mod <code>.zip</code>, giúp dễ dàng bảo trì và nâng cấp.",
        "<b>Khắc Phục Lỗi Nhận Diện Nhầm Dị Bảo Giữa Bảo Lục Luân Hồi &amp; Kiếp Hiện Tại (<code>scanDiBao</code> / <code>checkOwnedRelic</code>):</b> Tách bạch hoàn toàn <code>sc.relics</code> (chỉ gồm Dị Bảo đang sở hữu trong kiếp hiện tại) và <code>sc.metaRelics</code> (Bảo Lục Luân Hồi tích lũy từ các kiếp trước). Khắc phục triệt để lỗi ở Kiếp thứ 2+ báo sở hữu ảo toàn bộ Dị Bảo từng nhặt ở kiếp trước, làm tắt cảnh báo Dị Bảo, sai lệch bảo hiểm Pity 500 năm, báo đoạt bảo thành công ảo khi rớt 7% thất bại, và khiến Auto Săn Dị Bảo tự dừng ngay lập tức.",
        "<b>Khắc Phục Lỗi Truyền Tống Trận / Truyền Tống Phù (<code>checkCanTeleport</code> &amp; <code>smartTeleportTo</code>):</b> Kiểm tra chính xác trạng thái <code>!o.blocked</code> từ <code>ddTeleOpts</code> thay vì chỉ kiểm tra <code>opts.has(slot)</code>, giúp hệ thống tự động chuyển sang dùng <b>Truyền Tống Phù</b> trong túi đồ khi đứng ở hoang dã thay vì gọi nhầm Trận Truyền Tống bị khóa.",
        "<b>Khắc Phục Lỗi Giả Lập Hộ Vệ, Khảo Nghiệm Chỉ Số &amp; Vòng Lặp Cắm Trại Trong Auto Săn Dị Bảo (<code>auSdbStep</code>, <code>auPending</code>, <code>auPick</code>):</b> Đồng bộ thang đo <code>winRate</code> (0–100%) giữa <code>simDiBaoGuard</code> và <code>auSdbStep</code>; kiểm tra điều kiện cảnh giới (<code>ev.gate</code>) và khả năng cắn đan bù chỉ số khảo nghiệm; ưu tiên xử lý lựa chọn Dị Bảo bằng <code>findBestDiBaoChoice</code> trước <code>encGivesTuVi</code>; tự đóng trạng thái chờ <code>be_quan</code> sau khi nhập định ngắn hạn; và chống kẹt vòng lặp vô hạn khi vào danh thắng <code>hoang:*</code> hoặc cắm trại ở ô không thể bế quan.",
      ],
    },
    {
      t: "Phiên Bản 7.22.1 · Khắc Phục Triệt Để Thiếu Hụt Linh Lực Kinh Mạch & Tuân Thủ Tỉ Lệ 7:3 · Siêu AI Tác Chiến 3.0",
      d: "09/11/2026",
      now: false,
      pts: [
        "<b>Sửa Lỗi Mô Phỏng Vòng Quay Chân Khí (Multi-Skill Per Turn trong <code>simulateQiCycle</code>):</b> Trong cơ chế chiến đấu thực tế của game, nhân vật tung <b>tất cả</b> các chiêu đã hồi xong trong cùng 1 hiệp chứ không phải chỉ 1 chiêu/hiệp. Bản cũ chỉ mô phỏng 1 chiêu/hiệp nên đánh giá sai rằng Linh Lực vẫn đủ dù lắp 6–7 chiêu. Bản 7.22.1 mô phỏng xuất toàn bộ chiêu hồi xong mỗi hiệp và tính trực tiếp <code>drainPerTurn = Σ(phi / (hoi + 1))</code> khớp 100% với dòng <i>Vòng chiêu &amp; Linh lực</i> trên bảng so sánh, phạt cực nặng mọi cấu hình có <code>drain &gt; linhLucMoiLuot</code>.",
        "<b>Tuân Thủ Nghiêm Ngặt Giới Hạn 2–3 Chiêu Chủ Động &amp; Tỉ Lệ Tâm Pháp 7:3 / 6:4:</b> Cắt bỏ điểm thưởng sát thương và hệ số khuếch đại đối với các chiêu vượt quá giới hạn <code>hbMaxSkills</code> (2–3 chiêu), cấm <code>greedy</code> và <code>smartFillRemainingGaps</code> nhồi thêm chiêu tiêu hao Linh Lực khi đã đủ số chiêu hoặc khi có nguy cơ thiếu hụt chân khí, ưu tiên lấp đầy bàn mạch bằng Tâm Pháp tăng Linh Lực, Hộ Thể và Khí Huyết.",
        "<b>Chuẩn Hóa Trọng Số Sát Thương Chế Độ <i>Kiếm Tu Bạo Kích (Burst)</i>:</b> Sửa lỗi cộng trực tiếp <code>0.9 × uyMax</code> thô chưa chuẩn hóa theo Pháp Lực ở cảnh giới cao (từng khiến máy hy sinh 60% Hộ Thể, 20.000 Khí Huyết và Linh Lực hồi chỉ để đổi lấy vài trăm sát thương chiêu). Bổ sung điểm nền tảng phòng thủ (<code>defFoundationScore</code>) để giữ vững trần Hộ Thể và Khí Huyết.",
      ],
    },
    {
      t: "Phiên Bản 7.22.0 · Đại Trùng Tu Siêu AI Tác Chiến 3.0 & Giao Diện HUD Chiến Thuật",
      d: "09/11/2026",
      d: "09/11/2026",
      now: false,
      pts: [
        "<b>Khắc Phục Triệt Để Lỗi <code>nextAutomatedAction</code> Cướp Quyền Điều Khiển Chiêu:</b> Ở các bản trước, hàm <code>nextAutomatedAction</code> của game được gọi ngay trước khối chọn chiêu thông minh, làm vô hiệu hóa thứ tự Buff, Khiên, Phá Giáp và Chống Tràn Sát Thương. Bản 7.22.0 đưa Bộ Não Chiến Thuật 5 Pha của Tool lên làm trung tâm điều phối chính và ánh xạ đầy đủ các hàm gốc từ <code>combat/actions</code> &amp; <code>combat/elements</code>.",
        "<b>Hệ Thống Cắn Đan Dược Chi Tiết 3.0:</b> Bổ sung chế độ cắn đan máu thông minh (tự động nâng ngưỡng HP an toàn lên <code>healBossPanicHp</code> trước khi Boss tung Đại Chiêu), chế độ đan Linh Lực theo nhu cầu xuất chiêu (<code>on_demand</code> — tự khớp lượng hồi sát với số Linh Lực thiếu hụt), chế độ đan Bộc Phát chuẩn combo (chỉ cắn khi gặp Boss và đang có sẵn chiêu tấn công mạnh), tự dùng đan Giải Độc / Hộ Thể, và <b>tách riêng giới hạn phẩm đan Quái Thường vs Boss</b> để không bao giờ phí đan quý vào quái dọc đường.",
        "<b>Hệ Thống Dùng Phù Lục &amp; Trận Bàn Chi Tiết 3.0:</b> Tuỳ chỉnh chuyên sâu chế độ Phù Hộ Thuẫn (Dự báo đỡ đòn / Luôn duy trì / Chỉ Boss), Phù Khống Chế (Ngắt đại chiêu / Khóa chặt Boss / Cứu nguy), Phù Công Kích (Đan xen sau khi đã Phá Giáp hoặc khi cạn Linh Lực, tự chọn phù Khắc Hệ Ngũ Hành ×1.4), chế độ khai triển Trận Bàn, cùng giới hạn phẩm phù Quái Thường vs Boss riêng biệt.",
        "<b>AI Dùng Chiêu Thông Minh 3.0 (Chống Overkill · Ưu Tiên AoE · Chuỗi Liên Hoàn 5 Pha):</b> Tính sát thương dự kiến thực tế của từng chiêu (<code>estimateSkillDamage</code>) để chọn chiêu nhỏ kết liễu mục tiêu tàn huyết (tiết kiệm Đại Chiêu hồi lâu), tự nhân trọng số kỹ năng Quần Thể (AoE) khi đánh nhiều địch, thực thi đúng chuỗi <i>Buff ➔ Đan Bộc Phát ➔ Phá Giáp / Ấn Ký ➔ Chiêu Bản Mệnh &amp; Đại Chiêu Kích Nổ ➔ Quyền Cước 0 Mana</i>.",
        "<b>Nâng Cấp UX HUD Chiến Đấu Nổi &amp; 4 Preset Chiến Thuật 1-Click:</b> Thanh HUD nổi trong trận hỗ trợ <b>Kéo Thả (Draggable)</b> lưu vị trí, nút <b>Thu Gọn (–)</b>, dòng trạng thái trực tiếp báo <b>hành động &amp; lý do AI vừa ra quyết định</b>, cùng 5 nút chuyển nhanh ngay giữa trận (Mục Tiêu, Khoá/Mở Đan Phù, Tế Huyết, Tốc Độ 200ms/80ms/15ms, Tự Đánh). Bổ sung 4 nút Preset 1-Click (<i>Cân Bằng, Quyết Chiến Boss, Cày Quái Tiết Kiệm, Thiết Bích Cầu Sinh</i>) trong tab Auto Tác Chiến.",
      ],
    },
    {
      t: "Phiên Bản 7.21.0 · Đại Trùng Tu Động Cơ Kinh Mạch 4.0 (Multi-Topology · LNS · Chuẩn Hóa Lõi Game)",
      d: "09/11/2026",
      now: false,
      pts: [
        "<b>Kết Nối Trực Tiếp Toàn Bộ Hàm Lõi Kinh Mạch (<code>character/kinh_mach</code>):</b> Ánh xạ đầy đủ các hàm gốc của game (<code>heTungO</code>, <code>acupointsOf</code>, <code>doHop</code>, <code>hopHe</code>, <code>hopKinhLo</code>, <code>coTuongSinhNoiTai</code>, <code>heDoiDuoc</code>, <code>tayConLai</code>) vào bộ giải. Nhận diện chính xác hệ của từng ô thành phần trên mảnh đa hệ ở cả 4 góc xoay và quy tắc Kinh Lộ (cùng hệ gốc hoặc tương sinh <code>hopKinhLo</code>).",
        "<b>Phân Tách Thuộc Tính Nhân Hệ Số (<code>kmScalablePower</code>) &amp; Bảo Toàn Huyệt Đạo (×2.0+):</b> Theo đúng công thức <code>tinhKinhMach</code> của game, các dòng <code>toc_do</code>, <code>dot_pha</code>, <code>khang_tam_ma</code> trên Tâm Pháp chỉ cần thông mạch và không nhân <code>heSo</code>, trong khi <code>linh_luc</code>, <code>chieu</code>, <code>khi_huyet</code>, <code>ho_the</code>, <code>phap_luc</code> và lục duy <code>chi_so</code> (Ngộ Tính, Đạo Tâm, Căn Cốt...) được nhân trực tiếp với <code>heSo</code>. Thuật toán mới tuyệt đối không lãng phí Huyệt Đạo hay đan Tẩy Ô cho mảnh không nhân hệ số, dồn toàn bộ Huyệt Đạo và chuỗi tương sinh cho mảnh khuếch đại thực sự.",
        "<b>Gỡ Bỏ Ràng Buộc Chặn Cứng Lệch Màu Đơn Lẻ &amp; Phạt Tỉ Lệ Ảo:</b> Xóa bỏ điều kiện cấm cứng <code>conflictCount &gt; 0</code> từng làm kẹt các mảnh lớn phẩm cao không thể bắc cầu qua ô lệch màu; thay bằng hàm lợi ích liên tục theo đúng hệ số <code>0.85 + 0.45 × doHop</code> và chỉ phạt nặng khi quá nửa số ô nằm trên mạch khắc (<code>khacCellCount &gt; N/2</code> gây +1 Điểm Nghịch). Đồng thời nâng cấp <code>hbRatioPenalty</code> thích ứng theo số ô Tâm Pháp thực có trong túi đồ.",
        "<b>Khởi Tạo 5 Cấu Trúc Hình Học Đa Dạng (5-Topology Seeding):</b> Thay vì chỉ chạy 2 hạt giống tham lam đơn điệu, bộ giải khởi tạo 5 cấu trúc độc lập (<i>Huyệt Đạo Steiner Multi-Bridge</i>, <i>Xương Sống Kinh Lộ</i>, <i>Cụm Tương Sinh Chủ Lực</i>, <i>Thân Cây Mật Độ Cao</i>, và <i>GRASP Đa Điểm Neo</i>), chọn lọc Top 3 nhánh tốt nhất để đưa vào luyện kim sâu.",
        "<b>Luyện Kim Mô Phỏng 4.0 Với Toán Tử LNS (Ruin &amp; Recreate) &amp; Dây Chuyền Đẩy (Ejection Chain):</b> Bổ sung toán tử phá hủy &amp; tái thiết cục bộ cụm 2–3 mảnh kề nhau (Large Neighborhood Search), toán tử đẩy mảnh vướng để chèn mảnh phẩm cao (Displace &amp; Insert), kiểm tra điểm khớp (Articulation Point) bằng BigInt Bitmask O(N) để bảo toàn mạng lưới liên thông, cùng pha <i>1-Step Slide-and-Pack</i> và <i>Bag-to-Board Swap</i> trong <code>polish</code>.",
      ],
    },
    {
      t: "Phiên Bản 7.20.2 · Nâng Cấp Toàn Diện Bộ Lọc Sự Kiện Tu Vi & Loại Bỏ Triệt Để Sự Kiện Lỏ",
      d: "09/11/2026",
      now: false,
      pts: [
        "<b>Quét Sạch Toàn Bộ 1.509 Sự Kiện Game & Loại Bỏ 100% Sự Kiện Lỏ:</b> Phân tích toàn bộ dữ liệu mã nguồn gốc; triệt để loại trừ các dịch vụ tiện ích thành trấn thường trực (Thư viện tốn linh thạch đọc sách <code>ev.hoc_duong_tang_thu</code>, thuê đò, chợ phiên, làm công, phòng ban nội môn...) và các sự kiện gây tiêu tốn linh thạch, mất thời gian mà không có tu vi cố định.",
        "<b>Chắc Chắn Nhận Tu Vi Cao & An Toàn Tuyệt Đối:</b> Chỉ kích hoạt các kỳ ngộ, bí cảnh, di tích và Song Tu đảm bảo nhận tu vi thực sự (<code>tu_vi >= 1.0</code>, Song Tu +5% tiểu cảnh giới); các nhánh kiểm định thất bại không bị phạt tiền hay hại thân.",
        "<b>Tối Ưu Quyết Định Nhánh Khảo Nghiệm:</b> Tự động phạt điểm cực nặng (-99.999) đối với các lựa chọn đòi nộp linh thạch hoặc gây thương tổn / tâm ma; nếu không có nhánh nào an toàn và có lợi sẽ tự động chọn rút lui an toàn thay vì chịu phạt.",
        "<b>Chống Lặp Vô Tận Tại Nơi Chốn:</b> Khắc phục triệt để lỗi xóa nhầm bộ nhớ sự kiện sau khi hoàn tất, đảm bảo không bao giờ bị kẹt lặp lại nhiều lần tại cùng một sự kiện ở nơi đang đứng.",
      ],
    },
    {
      t: "Phiên Bản 7.20.0 · Đại Tu Hiệu Năng O(1), Thuật Toán Kinh Mạch 3.0 & Tiện Ích UI/UX",
      d: "09/11/2026",
      now: false,
      pts: [
        "<b>Tăng Tốc 80% Động Cơ Kinh Mạch (Signature Memoization & O(1) Bitmask Spine):</b> Bổ sung bộ nhớ đệm chữ ký trạng thái cho <code>buildCandidates</code> và <code>benchEnemies</code>, kết hợp kiểm tra liên thông trục Đan Điền – Tâm Pháp bằng phép toán bit <code>(cpAdjMask &amp; cn.cellMask) !== 0n</code> trong O(1), triệt tiêu hoàn toàn độ trễ khởi tạo lặp lại qua các pha Greedy, Simulated Annealing và Hill-Climbing Polish.",
        "<b>Khắc Phục Triệt Để Lỗi Ghi Đè Hàm <code>stripDead</code> &amp; Lấp Đầy Khe Hở:</b> Hợp nhất hàm <code>stripDead</code> và <code>coverNote</code> bị định nghĩa trùng lặp, khôi phục trọn vẹn pha <code>smartFillRemainingGaps</code> sau khi lọc mảnh đứt mạch và đối sánh chữ ký mảnh ghép chuẩn xác để không bỏ sót cấu hình tối ưu.",
        "<b>Siêu AI Tác Chiến 2.0 (Liên Hoàn Phá Giáp ➔ Nuke & Quản Trị Tế Huyết Bản Mệnh):</b> Tự động ưu tiên tung kỹ năng Phá Giáp / Ấn Ký / Suy Yếu mở màn trước khi dồn Đại Chiêu; bổ sung cơ chế kiểm soát chiêu Bản Mệnh Tế Huyết (chống hao thọ nguyên ngoài ý muốn) với nút chuyển đổi nhanh <code>🩸 Tế Huyết</code> trực tiếp trên thanh chiến đấu nổi (Tắt / Boss / Bật) giúp người chơi linh hoạt quyết định xả đại chiêu khi gặp Boss mạnh.",
        "<b>Auto Săn Dị Bảo Tự Động Bù Đan Khảo Nghiệm:</b> Khi đến điểm Dị Bảo yêu cầu kiểm định chỉ số (Thần Thức, Ngộ Tính, Cơ Duyên...), Auto tự động rà soát túi đồ và nuốt đan dược tăng chỉ số tương ứng để vượt ngưỡng khảo nghiệm trước khi tiến vào đoạt bảo.",
        "<b>Tối Ưu Song Tu Với Đạo Lữ (Chế Độ Đánh Quái):</b> Khi gặp Đạo Lữ ở nhánh Đánh Quái Săn Yêu, Auto luôn ưu tiên chọn «Song tu một năm» nhận tu vi trực tiếp, triệt để không chọn «Song tu, cùng nhập định» để không làm gián đoạn chuỗi săn quái hoặc kẹt vào phiên bế quan.",
        "<b>Chế Độ Thu Nhỏ Thanh Nổi (Window Shade) &amp; Tìm Nhanh Tab (<code>Ctrl+K</code>):</b> Bổ sung nút Thu Nhỏ (<code>—</code> / đúp chuột tiêu đề / <code>Alt+M</code>) giúp thu gọn cửa sổ thành thanh nổi siêu gọn không che màn hình game; thêm thanh Tìm Nhanh Chức Năng (<code>🔎</code> / <code>Ctrl+K</code>), bộ đếm thời gian thực <code>⏱ MM:SS</code> trên Mini Status Bar và phím tắt toàn cục <code>Alt+T</code>.",
      ],
    },
    {
      t: "Phiên Bản 7.19.0 · Đại Tu Toàn Diện UI/UX & Giao Diện Tu Tiên",
      d: "09/11/2026",
      now: false,
      pts: [
        "<b>Kiến trúc Stylesheet 6 tầng:</b> Hợp nhất 4 khối CSS phân mảnh thành UI_CSS tinh gọn với CSS Variables, Responsive clamp(), và GPU composite.",
        "<b>4 Theme Tu Tiên Dark Fantasy Mới:</b> Ra mắt U Minh Ma Vực (Mặc định), Thanh Hư Kiếm, Cửu U Huyết Ma, và Tử Lôi Thiên đạt chuẩn tương phản WCAG AAA.",
        "<b>Thanh điều hướng Glider chuyển động:</b> Vạch sáng trượt GPU translate3d theo nhịp chuyển tab mượt mà, hỗ trợ cả thanh ngang và thanh dọc Widescreen.",
        "<b>Chuyển cảnh cửa sổ 0.25s:</b> Cửa sổ mở/đóng êm ái với hiệu ứng mờ ảo và scale, phím Escape đóng nhanh, không che chắn khu vực game.",
        "<b>Công thái học cảm ứng di động:</b> Vùng chạm các nút bấm và tab mở rộng đạt chuẩn WCAG >= 42-44px trên thiết bị cảm ứng.",
        "<b>Bảo toàn 100% Core Logic & Stealth:</b> Toàn bộ 188 DOM IDs, 26 CSS Classes, 20 CORE_REQUIRED game hooks, giải kinh mạch BFS và vòng lặp Auto giữ nguyên vẹn tuyệt đối.",
      ],
    },
    {
      t: "Phiên Bản 7.18.0 · Đại Tu Động Cơ Kinh Mạch 2.0 & Tuần Hoàn Chân Khí",
      d: "09/11/2026",
      now: false,
      pts: [
        "<b>Trùng Tu Động Cơ Kinh Mạch 2.0 (Acupoint-First Reverse Bridging):</b> Xếp trước các mảnh phẩm cao / chiêu chủ lực đè trực tiếp lên ô Huyệt Đạo, kết hợp thuật toán BFS tìm đường ngắn nhất dựng Cầu Nối (Bridge Spine) Tâm Pháp dẫn khí từ Đan Điền tới Huyệt Đạo, giải quyết dứt điểm tình trạng mảnh xịn bị đẩy ra rìa.",
        "<b>Mô Phỏng Vòng Quay Chân Khí 15 Hiệp (15-Turn Qi Cycle Simulator):</b> Đo lường chi tiết mức tiêu hao linh lực theo lượt thực tế và hồi chiêu, phạt lũy tiến cực nặng các cấu hình bị Đói Chân Khí (qiStallTurns), đồng thời thưởng lớn cho cấu hình đạt Tuần Hoàn Chân Khí Hoàn Hảo suốt 15 hiệp.",
        "<b>Tối Ưu Hóa Bitmask O(1) & Khắc Phục Xoay Đa Hệ:</b> Bổ sung BigInt cellMask và adjMask cho candidate giúp kiểm tra chồng lấn và kề ô trong O(1); sửa khóa chống trùng seen bảo toàn trọn vẹn mọi góc xoay của mảnh đa hệ.",
        "<b>Gỡ Bỏ Rào Cản Greedy & Tối Ưu Hóa SkillCap:</b> Thay thế mức phạt thô xung đột màu bằng điểm hệ số m.mau thực tế; gỡ bỏ rào cản skillCap đối với các mảnh mang bị động và linh lực tốt mà không gây kẹt chân khí.",
        "<b>Pha Lấp Đầy Cuối (Smart Gap-Packing) & Sắp Xếp Heuristic Polish:</b> Sắp xếp ứng viên toàn bản đồ trước khi leo đồi; bổ sung smartFillRemainingGaps quét sạch ô trống và nhét thêm mọi món hợp lệ trong túi, triệt tiêu hoàn toàn hiện tượng bỏ hoang ô kinh mạch.",
        "<b>Đột Biến Hoán Đổi Huyệt Đạo (Acupoint Swap Move):</b> Bổ sung toán tử đột biến chuyên biệt trong Simulated Annealing chủ động đưa mảnh phẩm cao ngoài huyệt hoán đổi với mảnh yếu hơn đang chiếm huyệt.",
        "<b>Độc Lập Tiến Trình:</b> Tách biệt hoàn toàn cờ hủy S.kmAbort khỏi S.abort khi chuyển tab, cho phép Auto Kinh Mạch chạy ngầm mượt mà không bị ngắt quãng.",
      ],
    },
    {
      t: "Phiên Bản 7.17.0 · Trùng Tu Toàn Diện Kiến Trúc & Động Cơ Kinh Mạch 2.0",
      d: "08/11/2026",
      now: false,
      pts: [
        "<b>Động Cơ Kinh Mạch 2.0 (Two-Stage Evaluation):</b> Tách biệt quy trình đánh giá thành 2 tầng (Fast Proxy Combat Power cho Simulated Annealing và Full Simulation cho Top-K & Leo Đồi Polish), loại bỏ hoàn toàn việc deep clone nhân vật trong vòng lặp nóng giúp tốc độ giải ma trận tăng vọt hơn 100 lần.",
        "<b>Nâng Cấp Thuật Toán Tìm Kiếm & PRNG mulberry32:</b> Thay thế bộ sinh số ngẫu nhiên bằng PRNG mulberry32 phân bổ đều chu kỳ cực lớn; tích hợp cơ chế Adaptive Cooling & Reheating tự động kích nhiệt nhẹ thoát bẫy cực trị địa phương.",
        "<b>Chế Độ Nền Non-Blocking & Độc Lập Tiến Trình:</b> Ứng dụng MessageChannel / requestAnimationFrame chạy tính toán ngầm không bị trình duyệt throttle khi chuyển tab; tách biệt cờ hủy S.kmAbort giúp chuyển tab giao diện tự do mà không làm ngắt Auto Kinh Mạch.",
        "<b>Thanh Trạng Thái Auto Tinh Gọn (Mini Status Bar):</b> Tích hợp thanh trạng thái nổi trực quan hiển thị theo thời gian thực các tác vụ Auto đang chạy (Tu Luyện, Săn Dị Bảo, Săn Yêu, Buôn Bán, Tác Chiến) kèm nút Tạm Dừng nhanh một chạm.",
        "<b>Hợp Nhất CSS & Tối Giản DOM Engine:</b> Gom toàn bộ stylesheet về một bảng thống nhất; gỡ bỏ MutationObserver chạy regex toàn cục trên DOM để triệt tiêu hiện tượng lag giật; bổ sung debounce 150ms cho các thanh tìm kiếm (Vật Phẩm, Quái Vật, Địa Danh, Ngự Linh).",
        "<b>Quản Lý Vòng Đời & Dữ Liệu Động (Dynamic Data Sync):</b> Bổ sung TabLifecycle dọn sạch timer/listener khi chuyển tab; tự động đồng bộ thực thể, dị bảo, thể chất mới nhất từ game content gốc.",
        "<b>Bảo Toàn Stealth Mode Tuyệt Đối:</b> Tăng cường bảo vệ luồng Lưu/Nạp Save & Tẩy Thiên Đạo, giữ dữ liệu trò chơi sạch sẽ và an toàn 100%.",
      ],
    },
    {
      t: "Phiên Bản 7.16.0 · Tái Thiết Hệ Thống Auto Kinh Mạch Đa Mục Tiêu",
      d: "08/11/2026",
      now: false,
      pts: [
        "<b>Đại Tu Thuật Toán Auto Kinh Mạch (Multi-Objective Optimization):</b> Tái thiết kế toàn diện thuật toán giải ma trận kinh mạch, tích hợp hệ thống tối ưu hóa đa mục tiêu với các Preset chuyên biệt: Chiến Đấu (PvP/PvE), Tu Luyện (AFK Treo Máy), Đột Phá Cảnh Giới, Thể Tu Thiết Bích (Thủ Trâu), và Kiếm Tu Bạo Kích (Nhất Kích Tất Sát).",
        "<b>Động Cơ Bền Vững Chân Khí (Qi Sustainability Engine):</b> Đo đạc chính xác tốc độ tiêu hao chân khí theo chu kỳ hồi chiêu (Drain Rate per Turn) đối sánh với tốc độ hồi phục mỗi hiệp và bình chứa tối đa, loại bỏ hoàn toàn tình trạng cạn kiệt chân khí phải cắn đan giữa trận.",
        "<b>Tối Ưu Hóa & Đòn Bẩy Huyệt Đạo Tuyệt Đối:</b> Tự động nhận diện huyệt gốc kiếp này và huyệt mở thêm, áp dụng hệ số nhân thưởng cực đại (x2.0 - x2.5) khi bố trí các công pháp cốt lõi phù hợp với mục tiêu preset lên ô huyệt vị.",
        "<b>Chuỗi Tương Sinh Ngũ Hành & Suy Giảm Phẩm Cấp:</b> Áp dụng chuẩn xác bảng trọng số zD [1, 2/3, 1/3, 0] theo chênh lệch phẩm cấp khi nối mạch tương sinh; ưu tiên định tuyến kinh lộ từ Đan Điền tới Pháp Khí cùng hệ để đạt tối đa hệ số kinh lộ.",
        "<b>Hệ Thống Preset Mở Rộng:</b> Bổ sung chế độ Đột Phá Cảnh Giới (ưu tiên tỉ lệ đột phá, kháng tâm ma, triệt tiêu hoàn toàn điểm nghịch), Thể Tu Thiết Bích (kẹp trần hộ thể 60%, dồn khí huyết) và Kiếm Tu Bạo Kích (tối đa uy lực chiêu chủ lực mở màn).",
      ],
    },
    {
      t: "Phiên Bản 7.15.5 · Tối Ưu Sự Kiện Tu Vi & Song Tu Cùng Đạo Lữ",
      d: "08/11/2026",
      now: false,
      pts: [
        "<b>Chuẩn Hóa Sự Kiện Tăng Tu Vi:</b> Nhận diện đầy đủ hơn 300 sự kiện, kỳ ngộ, bí cảnh, di tích, bế quan linh mạch, thải bổ và tu luyện theo năm; loại bỏ triệt để các biến cố quấy nhiễu và những sự kiện/lựa chọn gây trừ tu vi.",
        "<b>Sửa Lỗi Chọn Nhánh Đa Tầng (Multi-Stage Scenes):</b> Khắc phục lỗi scene bị undefined khiến Auto chọn sai nhánh ở các bí cảnh/di tích nhiều tầng, tự động đánh giá và chọn chuẩn xác nhánh mang lại tu vi dương cao nhất.",
        "<b>Tích Hợp Tự Động Song Tu Cùng Đạo Lữ:</b> Tự động phát hiện khi hồi chiêu 5 năm hoàn tất, chủ động mời Đạo Lữ Song Tu (ở cả chế độ Bế Quan &amp; Đánh Quái) để nhận 5% tu vi tiểu cảnh giới (x2 nếu có mảnh Hợp Hoan), giảm 5 điểm Tâm Ma và gia tăng tình cảm.",
        "<b>Kích Hoạt Node Sự Kiện Chuẩn Xác:</b> Sử dụng trực tiếp enterNode cho các node trên bản đồ thế giới, tránh lỗi do gọi sai hàm hoạt động nơi chốn.",
      ],
    },
    {
      t: "Phiên Bản 7.15.4 · Siêu AI Tác Chiến VIP Đỉnh Cao & Giao Diện Trực Quan",
      d: "08/11/2026",
      now: false,
      pts: [
        "<b>Chiến Thuật Nhắm Mục Tiêu Thông Minh (Tactical Targeting):</b> Tự động tính toán mức độ đe dọa (Địch đang nộ chuẩn bị đại chiêu, quái sắp chết cần dứt điểm sớm, Boss/Tinh Anh, Khắc Hệ Ngũ Hành) và cho phép tùy chọn 4 chiến thuật: <i>🧠 Tối Ưu Chiến Thuật</i>, <i>👑 Ưu Tiên Trùm / Thủ Lĩnh</i>, <i>🎯 Diệt Kẻ Yếu Trước</i>, <i>🔥 Tương Khắc Ngũ Hành</i>.",
        "<b>Dứt Điểm Thông Minh (Smart Finisher):</b> Nhận diện chính xác khi địch chỉ còn tàn huyết trong tầm đòn đánh cơ bản; tự động tung Quyền Cước (<code>danh_thuong</code>) 0 linh lực để kết liễu ngay lập tức mà không lãng phí mana hay thời gian hồi của các đại chiêu quý giá.",
        "<b>Kho Phù Chú Tác Chiến (Attack & Control Talismans):</b> Hỗ trợ sử dụng bùa khống chế (<code>khong_che</code>) để ngắt đại chiêu nguy hiểm của địch và bùa công kích (<code>chieu</code>: Hỏa Đạn Phù, Dẫn Lôi Phù, Canh Kim Phù...) để dồn sát thương cực hạn 0 linh lực khi đánh Boss hoặc lúc cạn kiệt chân khí.",
        "<b>Thoát Hiểm Khẩn Cấp & Thiêu Đốt Cứu Mạng:</b> Tự động thiêu đốt thọ nguyên (<code>thieu_dot</code>) tăng vọt công thủ khi nguy cấp (HP &lt; 20%) để lật ngược thế cờ; hoặc kích hoạt phù độn thổ / Huyết Độn thoát thân (<code>bo_chay</code>) khi máu dưới 16% trước nguy cơ tử vong.",
        "<b>Nâng Cấp Giao Diện Nổi Trong Trận (Live Combat Overlay):</b> Hiển thị trực tiếp thông số hiệp đấu, % Máu / Mana / Hộ Thuẫn của nhân vật và thanh máu đối thủ theo thời gian thực; tích hợp nút chuyển đổi nhanh nhịp đánh (<code>⚡ 15ms</code> Siêu Tốc vs <code>⏱ 200ms</code> Tiêu Chuẩn) ngay trên màn hình chiến đấu.",
      ],
    },
    {
      t: "Phiên Bản 7.15.3 · Nâng Cấp Toàn Diện Auto Kinh Mạch & 1-Click Apply",
      d: "08/11/2026",
      now: false,
      pts: [
        "<b>1-Click Áp Dụng Từ Xem Trước (Instant 1-Click Apply):</b> Bổ sung nút <i>✅ Áp Dụng Ngay Cách Xếp Này Vào Game</i> trực tiếp trong khung Xem Trước (An Toàn); tự động thực hiện cả chu trình Tẩy Ô chuyển hệ (tự dùng đan trong túi nếu hết lượt) lẫn áp dụng cách xếp/bộ vào game chỉ với 1 lần chạm mà không cần chạy lại solver từ đầu.",
        "<b>Hiển Thị Kế Hoạch Tẩy Ô Trực Quan:</b> Khung Xem Trước liệt kê chi tiết danh sách từng ô kinh mạch đề xuất chuyển hệ (Tọa độ Cột/Hàng, hệ cũ sang hệ mới, khớp công pháp nào), giúp đạo hữu kiểm soát 100% tài nguyên trước khi quyết định.",
        "<b>Tối Ưu Tốc Độ Dò Mở Ô (kmOpenSearch):</b> Áp dụng thuật toán xếp hạng tiềm năng (Heuristic Ranking) ưu tiên top các ô giáp Đan Điền, ô Huyệt Đạo và hợp hệ linh căn để tôi luyện sâu (Anneal); loại bỏ hoàn toàn tình trạng giật lag/đơ giao diện khi có nhiều ô mở được, tăng tốc độ dò gấp 2-3 lần.",
        "<b>Ưu Tiên Món Cốt Lõi Hướng Build:</b> Nâng cao trọng số nhận diện công pháp/pháp khí cốt lõi của hướng build (Trấn phái, phẩm cao, đúng tông môn/nguyên tố) trong cả khởi tạo Tham Lam (Greedy) lẫn tôi luyện ngẫu nhiên (Anneal), bảo đảm AI không bỏ sót tuyệt kỹ trấn phái chỉ vì chênh lệch điểm vụn vặt.",
      ],
    },
    {
      t: "Phiên Bản 7.15.2 · Nâng Cấp Auto Tu Luyện & Tùy Chọn Săn Yêu Toàn Diện",
      d: "08/11/2026",
      now: false,
      pts: [
        "<b>Chế Độ Săn Yêu Đột Phá (Boss Đầu Đàn):</b> Bổ sung tùy chọn mục tiêu săn yêu linh hoạt: <i>👑 Ưu Tiên Lùng Đầu Đàn (Nhận Tu Vi x3 & Rơi Đồ x1.5 · Tự lùi về thường nếu nguy hiểm)</i>, <i>🐾 Chỉ Săn Yêu Thường (An toàn · 1 lượt)</i>, <i>🔥 Chỉ Săn Đầu Đàn (Bỏ qua thú thường)</i>. Tự động nhận diện và tính toán nguy cơ chiến đấu trước khi quyết định.",
        "<b>Tự Động Trị Thương & Tĩnh Dưỡng Lành Thể (Auto Duong Thuong):</b> Khi thương thế chạm ngưỡng (Thương nhẹ/Thương nặng), Tool tự động kiểm tra và nuốt ngay đan dược chữa thương trong túi (Hồi Xuân Đan, Sinh Cơ Đan, Cửu Chuyển Kim Đan...); nếu hết đan dược sẽ tự động tạm bế quan 1 năm tĩnh dưỡng để vết thương hoàn toàn lành lặn và tích thêm tu vi, sau đó tự động tiếp tục đi săn mà không bị dừng Auto.",
        "<b>Thuật Toán Đánh Giá Bãi Săn Thông Minh (Smart Hunt Spots):</b> Tích hợp đọc Cấp Nền (cảnh giới yêu thú của ô hoang dã), ưu tiên các bãi săn có cấp cảnh giới sát với nhân vật nhất để tối đa hóa tu vi nhận được mỗi trận; đồng thời tối ưu hóa khoảng cách di chuyển để tiết kiệm thọ nguyên tối đa.",
        "<b>Hỗ Trợ Mở Rộng Kỳ Ngộ Săn Thú:</b> Xử lý mượt mà và thông minh tất cả các biến thể sự kiện săn yêu trong game: <code>ev.san_yeu</code>, <code>ev.truy_tim_dau_dan</code>, <code>ev.truy_tim_yeu</code>, <code>ev.san_yeu_thu</code>, <code>ev.tm_yeu_dau_dan</code> (Yêu đầu đàn quấy sơn môn), <code>ev.ls_bay_yeu_thu</code> (Cứu thú trong bẫy tích phúc phận/khí vận).",
        "<b>Tương Thích Bản Cập Nhật Mới Nhất:</b> Đồng bộ các cập nhật hệ thống của game (chỉ số tốc độ tu luyện thụ động của công pháp Khôi Lỗi Ngự Linh, điều chỉnh mở thẳng bảng treo thưởng, các mở khóa Luân Hồi thiên mệnh chọn linh căn/thể chất).",
      ],
    },
    {
      t: "Phiên Bản 7.15.1 · Sửa Lỗi Anneal testNext & Nổi Bật Tính Năng Tẩy Ô",
      d: "08/11/2026",
      now: false,
      pts: [
        "<b>Sửa Lỗi ReferenceError testNext:</b> Khắc phục triệt để lỗi <code>Cannot access testNext before initialization</code> trong nhánh hoán đổi đồ của thuật toán Tôi Luyện Luyện Kim (Annealing), giúp Auto Kinh Mạch và Xem Trước chạy trơn tru 100%.",
        "<b>Khắc Phục Lỗi Hiển Thị Banner Hướng Build:</b> Sửa lỗi hiển thị số món trên kinh mạch và trong túi bị 0 dù nhân vật đã có trang bị, nay liên kết chuẩn xác với <code>buildFit</code> của hướng build.",
        "<b>Nổi Bật Tùy Chọn Auto Tẩy Ô (Đổi Hệ Ô):</b> Mở sẵn mục Tùy Chọn Nâng Cao, hiển thị trạng thái Bật/Tắt rõ ràng kèm ghi chú tự động cắn đan Tẩy Tủy / Cải Mệnh / Dịch Cốt từ túi đồ.",
      ],
    },
    {
      t: "Phiên Bản 7.15.0 · Đại Trùng Tu Tab Hướng Build & Động Cơ Bền Vững Chân Khí (Qi Sustainability Engine)",
      d: "07/11/2026",
      now: false,
      pts: [
        "<b>Đại Trùng Tu Tab Hướng Build & Auto Kinh Mạch:</b> Tái cấu trúc toàn diện giao diện theo 4 phân khu chuyên nghiệp, mạch lạc, thẩm mỹ cao: <i>Thanh Trạng Thái & Presets</i> → <i>⚙️ Cài Đặt Chiến Thuật & Tỉ Lệ Mạch</i> → <i>🚀 Bảng Điều Khiển Auto Trực Tiếp & Giám Sát Chân Khí Bền Vững</i> → <i>🧪 Phòng Thí Nghiệm Xếp Thử Cảnh Giới</i> → <i>🗺️ Lộ Trình Săn Đồ & Hướng Build</i>.",
        "<b>Động Cơ Bền Vững Chân Khí (Qi Sustainability Engine):</b> Đo lường chính xác tốc độ tiêu hao chân khí trung bình mỗi lượt (Drain Rate per Turn) dựa trên phí linh lực và thời gian hồi chiêu của từng chiêu thức so với linh lực hồi mỗi lượt. Phạt luỹ tiến cực nặng khi thâm hụt chân khí, triệt tiêu hoàn toàn căn bệnh 'loạn chiêu, vào trận cạn sạch chân khí toàn phải cắn đan'!",
        "<b>Thi Hành Nghiêm Ngặt Tỉ Lệ Tâm Pháp : Chiến Pháp (Strict Progressive Penalty):</b> Khắc phục triệt để hiện tượng solver bất chấp tỉ lệ để nhét chiêu. Chuyển sang hàm phạt luỹ tiến cực mạnh khi thiếu Tâm Pháp, đảm bảo khi chọn <b>6 : 4</b> hoặc <b>7 : 3</b> thì ít nhất 60%–70% diện tích kinh mạch được dành trọn vẹn cho các Tâm Pháp nuôi chân khí và chỉ số nền.",
        "<b>Bổ Sung Tùy Chọn 'Giới Hạn Chiêu Thức Chủ Động' (Skill Ceiling):</b> Cho phép người dùng giới hạn cứng số lượng chiêu thức (Mặc định: <i>2–3 Chiêu Tinh Hoa · Tự Cấp Chân Khí Không Cần Cắn Đan</i>). Solver tập trung tối đa vào 2 đòn công kích chủ lực mạnh nhất + 1 chiêu thủ/hồi phục, cấm spam chiêu thừa thãi làm loãng kinh mạch.",
        "<b>Đồng Bộ Hóa Toàn Diện Vào Hạt Giống Greedy & Annealing Mutation:</b> Tích hợp kiểm tra tỉ lệ Tâm:Chiến và bền vững chân khí ngay từ hạt giống ban đầu (Greedy). Trong Simulated Annealing, tăng x3.5 lần xác suất bốc Tâm Pháp khi đang thiếu và khóa bốc chiêu thức khi đã đủ trần chiêu.",
        "<b>Bổ Sung Tỉ Lệ Mới 7 : 3 (Đại Tu Tâm Pháp):</b> Dành riêng cho đạo hữu theo trường phái tốc tu, dưỡng sinh, kháng tâm ma bế quan nhanh và chân khí vô tận.",
      ],
    },
    {
      t: "Phiên Bản 7.14.10 · Tinh Gọn Giao Diện & Quy Nhất Tùy Chọn Tẩy Ô",
      d: "07/11/2026",
      now: false,
      pts: [
        "<b>Quy Nhất Tùy Chọn Tẩy Ô Vào Đúng Khối Chức Năng:</b> Xóa bỏ ô tích trùng lặp thừa thãi ở khung 'Cài Đặt Chung', giữ lại duy nhất 1 vị trí chuẩn mực và trực quan tại khối <b>Tẩy Ô (Đổi Hệ Ô)</b> trong khung 'Auto Kinh Mạch' (nơi hiển thị số lượt chuyển hệ còn lại và số ô tẩy tối đa mỗi lần chạy).",
        "<b>Giao Diện Tinh Gọn, Thống Nhất:</b> Loại bỏ hoàn toàn sự rườm rà và các nguy cơ xung đột đồng bộ giữa nhiều ô tích, giúp đạo hữu dễ dàng quản lý và cài đặt tính năng Tẩy Ô.",
      ],
    },
    {
      t: "Phiên Bản 7.14.9 · Sửa Lỗi Không Uncheck Được Tùy Chọn Tự Động Tẩy Ô",
      d: "07/11/2026",
      now: false,
      pts: [
        "<b>Sửa Lỗi Đồng Bộ Checkbox Tẩy Ô:</b> Khắc phục triệt để lỗi xung đột logic khiến người dùng không thể bỏ chọn (uncheck) ô tích <i>'Tự Động Tẩy Ô Để Khớp Công Pháp Tối Đa'</i>. Trước đây toán tử OR (<code>||</code>) giữa ô tích tại 'Cài Đặt Chung' và 'Auto Kinh Mạch' khiến việc bỏ chọn một bên bị bên kia tự động kích hoạt trở lại.",
        "<b>Cơ Chế Đồng Bộ Hai Chiều Linh Hoạt:</b> Nay khi đạo hữu tích hoặc bỏ chọn ở bất kỳ vị trí nào ('Cài Đặt Chung' hoặc 'Auto Kinh Mạch'), cả hai ô đều tự động đồng bộ trạng thái ngay lập tức và lưu cấu hình chuẩn xác vào hệ thống.",
      ],
    },
    {
      t: "Phiên Bản 7.14.8 · Tối Ưu Cân Bằng Linh Lực & Khắc Phục Bội Thực Chiêu Thức",
      d: "07/11/2026",
      now: false,
      pts: [
        "<b>Cân Bằng Tiêu Hao & Hồi Phục Linh Lực Thực Chiến:</b> Thuật toán tự động đo lường tương quan giữa Linh Lực hồi mỗi lượt / dung lượng tối đa và chi phí thi triển của các chiêu thức. Phạt nặng cấu hình 'đói linh lực' (không đủ linh lực xuất chiêu lớn, phải cắn đan dược trong trận). Thưởng lớn cấu hình 'Tự Cân Bằng Hoàn Hảo' (hồi phục dư dả, xoay chiêu mượt mà 100% không cần nuốt đan).",
        "<b>Đánh Giá Sát Thương Vòng Chiêu (Rotation) Thay Vì Cộng Dồn Thô:</b> Loại bỏ hiện tượng nhồi nhét 7–9 chiêu thức làm loãng kinh mạch. Áp dụng trọng số sát thương thực chiến giảm dần theo thứ tự ưu tiên (chiêu 1: 100%, chiêu 2: 65%, chiêu 3: 35%...). Phạt nặng hiện tượng bội thực chiêu (>4 active skills) để nhường đất kinh mạch cho các Tâm Pháp tăng mạnh Khí Huyết %, Hộ Thể %, Pháp Lực % và Tốc Độ.",
        "<b>Nâng Tầm Trọng Số Tâm Pháp Hồi Linh Lực:</b> Nâng mạnh điểm thưởng của các mảnh có thuộc tính <code>linh_luc</code> và chỉ số bị động trong <code>kmItemPower</code> và <code>itemWeights</code>, giúp máy ưu tiên ghép các Tâm Pháp cao cấp gánh tải linh lực cho toàn bộ hệ thống.",
        "<b>Bổ Sung Dòng 'Vòng Chiêu & Linh Lực' Trên Bảng So Sánh:</b> Trực quan hóa tình trạng tiêu hao năng lượng của bản kinh mạch (Dư dả không cần đan / Vừa đủ / Thiếu hụt) để đạo hữu đánh giá độ bền bỉ ngay tức thì.",
      ],
    },
    {
      t: "Phiên Bản 7.14.7 · Khắc Phục Lỗi Phạm Vi Biến B Trong Anneal",
      d: "07/11/2026",
      now: false,
      pts: [
        "<b>Sửa Lỗi 'B is not defined':</b> Khai báo đầy đủ biến ngữ cảnh <code>const B = biasCtx(nv0, g)</code> trong thuật toán Simulated Annealing (<code>anneal</code>), đảm bảo bộ lọc thông minh <code>smart</code> đánh giá chính xác độ tương sinh công pháp theo hướng build (Kiếm Tu...) mà không bị lỗi crash ngắt ngang tiến trình Auto.",
        "<b>Tối Ưu & Bảo Đảm Toàn Vẹn Thuật Toán:</b> Kiểm toán toàn diện phạm vi biến trong chuỗi thuật toán Auto Kinh Mạch (<code>greedy</code>, <code>anneal</code>, <code>makeEval</code>, <code>findOptimalRecolors</code>), đảm bảo Auto Kinh Mạch chạy trơn tru, ổn định và chính xác 100%.",
      ],
    },
    {
      t: "Phiên Bản 7.14.6 · Khắc Phục Lỗi Phạm Vi Biến isTayO Trong Greedy",
      d: "07/11/2026",
      now: false,
      pts: [
        "<b>Sửa Lỗi 'isTayO is not defined':</b> Nâng phạm vi khai báo biến <code>isTayO</code> lên đầu hàm <code>greedy</code> và <code>makeEval</code>, khắc phục triệt để lỗi tham chiếu ngoài phạm vi khiến tiến trình Auto Kinh Mạch (xem trước / chạy) bị dừng đột ngột.",
        "<b>Tích Hợp Tẩy Ô Vào Hàm Đánh Giá Luyện Kim (makeEval):</b> Cho phép thuật toán Simulated Annealing chủ động cộng điểm thưởng cho các vị trí công pháp đặt trên ô tẩy được, giúp tìm ra cấu hình kinh mạch đột phá sát thương cao nhất có thể.",
      ],
    },
    {
      t: "Phiên Bản 7.14.5 · Tối Ưu Hóa Tương Sinh Chiêu Kiếm & Khai Thông Thuật Toán Tẩy Ô Toàn Diện",
      d: "07/11/2026",
      now: false,
      pts: [
        "<b>Khai Thông Triệt Để Chức Năng Tẩy Ô (Đổi Hệ Ô):</b> Khắc phục nguyên nhân gốc rễ khiến chức năng tẩy ô không đề xuất: trước đây thuật toán lọc cứng loại bỏ các vị trí lệch màu trước khi xếp, khiến bộ kết quả không còn ô lệch màu nào để tẩy. Nay khi bật <i>'Tự Động Tẩy Ô Để Khớp Công Pháp Tối Đa'</i>, thuật toán nhận diện các ô có thể tẩy sang hệ của linh căn (qua Tẩy Tủy / Cải Mệnh Đan) là vị trí hợp lệ, cho phép đặt các công pháp mạnh nhất lên đó và tự động lập Kế Hoạch Tẩy Ô chính xác.",
        "<b>Cập Nhật Số Liệu Dự Phóng Sau Tẩy Ô:</b> Bảng so sánh 'Bản mới' nay tự động phản ánh đầy đủ chỉ số sau khi giả định đã tẩy các ô theo kế hoạch (hệ số màu tối đa 1.30, điểm tương sinh đạt đỉnh, sát thương chiêu tăng vọt).",
        "<b>Dồn Trọng Số Tương Sinh Vào Chiêu Công & Hướng Build (Đặc Biệt Kiếm Tu):</b>",
        "&nbsp;&nbsp;• <b>Thưởng Lớn Cho Món Nhận Tương Sinh:</b> Nâng cấp thuật toán đánh giá tương sinh trong Annealing & Quick: khi một chiêu công mạnh (như các chiêu kiếm của Kiếm Tu) được các công pháp láng giềng (ví dụ Thổ sinh Kim) tiếp sức, hệ số thưởng được nhân lên gấp 3–8 lần so với món bị động thông thường.",
        "&nbsp;&nbsp;• <b>Khuếch Đại Tương Sinh Trên Huyệt:</b> Chiêu công nằm trên Huyệt Đạo đồng thời nhận tương sinh từ nhiều hướng sẽ được cộng điểm đột phá, khuyến khích máy tự động bao bọc công pháp tương sinh quanh trục chiêu chính.",
        "<b>Đồng Bộ Tùy Chọn Tẩy Ô Lên Card Cài Đặt Chung:</b> Bổ sung ô tích bật Tẩy Ô ngay tại khung <i>'Hướng Build · Cài Đặt Chung'</i> giúp đạo hữu thao tác nhanh chóng và dễ thấy nhất.",
      ],
    },
    {
      t: "Phiên Bản 7.14.4 · Mở Rộng Số Vòng Lặp Luyện Kim Kinh Mạch Đến 24.000 Vòng",
      d: "07/11/2026",
      now: false,
      pts: [
        "<b>Mở Rộng Tùy Chọn Độ Kỹ (Số Vòng Lặp Luyện Kim):</b> Bổ sung thêm 2 mức dò tìm chuyên sâu: <code>Rất Kỹ (12.000 vòng)</code> và <code>Cực Hạn (24.000 vòng)</code> trong mục <i>'Độ Kỹ'</i> tại Cài Đặt Chung (Hướng Build / Auto Kinh Mạch). Giúp thuật toán Simulated Annealing dò tìm triệt để toàn bộ không gian hoán vị khi xếp từ lưới trống.",
        "<b>Hiển Thị Rõ Số Vòng Lặp Trong Giao Diện:</b> Các tùy chọn trong menu thả xuống 'Độ Kỹ' nay ghi chú rõ ràng số vòng lặp tương ứng (1.500, 3.000, 6.000, 12.000, 24.000) giúp đạo hữu dễ dàng lựa chọn thời gian và độ sâu tính toán theo cấu hình máy.",
      ],
    },
    {
      t: "Phiên Bản 7.14.3 · Sửa Lỗi Tự Động Tẩy Ô & Bổ Sung Tự Dùng Đan Tẩy Tủy",
      d: "07/11/2026",
      now: false,
      pts: [
        "<b>Sửa Triệt Để Lỗi Chức Năng Tẩy Ô Không Báo Khi Xem Trước:</b> Khắc phục lỗi kiểm tra chặn cứng <code>doiMauLeft <= 0</code> khiến thuật toán lập kế hoạch tẩy ô trả về rỗng khi người chơi chưa cắn đan tẩy tủy. Nay chức năng <i>'Tự Động Tẩy Ô Để Khớp Công Pháp Tối Đa'</i> luôn quét toàn diện cả bộ đang xếp và bộ đề xuất mới để tìm ra các ô lệch hệ tối ưu nhất cần tẩy (tối đa theo cấu hình <code>tayMax</code>).",
        "<b>Tự Động Nuốt Đan Tẩy Tủy / Cải Mệnh / Dịch Cốt Từ Túi:</b> Khi chạy Auto thật, nếu chưa có lượt chuyển hệ chờ sẵn, Tool tự động kiểm tra đan trong túi đồ (Tẩy Tủy Đan, Cải Mệnh Đan, Dịch Cốt Đan) và tự động gọi <code>gg.useItem</code> để nhận lượt rồi mới thực hiện tẩy ô <code>gg.doiMauO</code> an toàn.",
        "<b>Hiển Thị Trực Quan Tình Trạng Lượt Tẩy & Đan Trong Túi:</b> Bảng kế hoạch tẩy ô nay hiển thị rõ số lượt chuyển hệ đang có sẵn, hoặc số viên đan tẩy tủy hiện có trong túi đồ để người chơi nắm rõ trước khi chạy.",
        "<b>Đồng Bộ Kế Hoạch Tẩy Ô Sang Mọi Luồng Tính:</b> Kế hoạch tẩy ô nay hiển thị nhất quán ở cả chế độ Xem Trước (Dry run) trong Auto Kinh Mạch lẫn nút Tìm Cách Xếp trong tab Kinh Mạch.",
      ],
    },
    {
      t: "Phiên Bản 7.14.2 · Chuẩn Hóa 100% Chỉ Số Vận Hành Thực Tế & Khắc Chế Triệt Để Lệch Hệ Mạch",
      d: "07/11/2026",
      now: false,
      pts: [
        "<b>Chuẩn Hóa Tuyệt Đối Báo Chỉ Số Vận Hành (Đồng Bộ 100% Game):</b> Sửa triệt để lỗi báo chỉ số sai lệch giữa Tool và giao diện game. Thay vì xóa bảng Lĩnh Ngộ (khiến hệ số mảnh bị đội lên ảo), cột 'Đang xếp' nay đọc và tính toán trực tiếp từ trạng thái thực tế của nhân vật (giữ nguyên Lĩnh Ngộ và số năm tu luyện): Linh lực hồi/lượt (57,6), Hộ thể (+47%), Đột phá (+9%), Khí huyết (22.950), Kháng tâm ma (+24%), Linh lực tối đa (172,7), Pháp lực (1.019,4).",
        "<b>Đồng Bộ Hiển Thị Tốc Độ Tu Luyện:</b> Cột 'Tu luyện' nay hiển thị trực tiếp hệ số vận hành thực tế của game (ví dụ: <code>×3.03 (+251%)</code>) thông qua hàm <code>S.core.tocDoTuLuyen</code>, xóa bỏ hoàn toàn hiểu lầm giữa tốc độ tu vi tổng hợp và dòng bị động mảnh.",
        "<b>Cấm Tuyệt Đối Lệch Hệ/Đảo Ngược Hệ (Kim Lắp Thổ, Thổ Lắp Kim):</b> Nâng cấp toàn diện cơ chế kiểm tra hệ theo chuẩn <code>WBt</code> của game. Khi mảnh có hệ xung đột với ô kinh mạch (ví dụ công pháp Thổ đè lên mạch Kim hoặc ngược lại):",
        "&nbsp;&nbsp;• <b>Khóa Đan Điền Chuẩn Hệ:</b> Ở giai đoạn chọn nhánh kết nối Đan Điền, thuật toán bắt buộc chỉ chọn Công Pháp có hệ trùng khớp 100% với ô kề cận Đan Điền, cấm hoàn toàn tình trạng công pháp khác hệ chiếm giữ cửa ngõ.",
        "&nbsp;&nbsp;• <b>Trừng Phạt Nặng Lệch Màu:</b> Thiết lập mức phạt cực nặng (-80 điểm/ô xung đột trong quick & -30 điểm trong simulated annealing), đồng thời thưởng lớn (+35 điểm) cho các mảnh đạt hệ số màu chuẩn (1.30).",
        "&nbsp;&nbsp;• <b>Bộ Lọc Vị Trí Khớp Hệ:</b> Tự động ưu tiên 100% các vị trí đúng hệ; chỉ xem xét vị trí khác khi không còn bất kỳ phương án nào phù hợp.",
        "<b>Cập Nhật Mô Phỏng Bản Mới Thực Tế:</b> Khi tìm thấy cách xếp mới hoặc giữ nguyên cách xếp, các chỉ số dự phóng ở cột 'Bản mới' được tính toán sát thực tế dựa trên Lĩnh Ngộ của nhân vật, không phóng đại số liệu.",
      ],
    },
    {
      t: "Phiên Bản 7.14.1 · Đại Trùng Tu Auto Kinh Mạch Toàn Diện",
      d: "07/11/2026",
      now: false,
      pts: [
        "<b>Đại Trùng Tu Thuật Toán Auto Kinh Mạch:</b> Khắc phục triệt để tình trạng xếp lỏ, rời rạc, sót mảnh hoặc không kín ô. Tái thiết toàn bộ quy trình xếp kinh mạch từ gốc rễ: phân chia rành mạch giữa trục xương sống Công Pháp và các nhánh dẫn mạch tới Pháp Khí.",
        "<b>Bảo Vệ Tuyệt Đối Cửa Ngõ Đan Điền (Công Pháp Trunk):</b> Cấm Pháp Khí chẹn cửa Đan Điền trong giai đoạn định hình lưới; bắt buộc dùng Tâm Pháp/Đấu Pháp làm thân cây kết nối trực tiếp với Đan Điền để dòng linh khí thông suốt 100% khắp các ô.",
        "<b>Tối Ưu Hóa & Trọng Thưởng Huyệt Đạo (x2.0–x2.5 Multiplier):</b> Cơ chế tìm kiếm mới tự động nhận diện các ô Huyệt Đạo và ưu tiên đưa các chiêu công/pháp khí chủ lực mạnh nhất lên huyệt để kích hoạt hệ số nhân sát thương và thuộc tính cực đại; phạt nặng việc chiếm huyệt mà không thông hoặc bỏ trống huyệt.",
        "<b>Định Tuyến Kinh Lộ Pháp Khí Đồng Hệ:</b> Tự động tính toán đường dẫn kinh lộ từ Đan Điền qua các Công Pháp cùng họ hệ tới Pháp Khí, khai thác tối đa hệ số Kinh Lộ (+40% đến +100% uy lực chiêu), biến Pháp Khí thành mũi nhọn dứt điểm uy lực.",
        "<b>Luyện Kim Mô Phỏng Nâng Cao (Dual-Seed Simulated Annealing):</b> Phân bổ xác suất lấy vật phẩm theo hàm số mũ của Phẩm Cấp (Thiên/Địa/Huyền > Hoàng/Phàm) và Uy Lực thực chiến. Khởi động 2 hạt giống song song (trục Đan Điền + biến thể hoặc bản xếp tốt hiện tại), loại bỏ hoàn toàn bẫy tối ưu cục bộ.",
        "<b>Trừng Phạt Triệt Để Mảnh Tắc (Zero Dead Pieces):</b> Phạt cực nặng các mảnh không thông (-85 điểm/mảnh), buộc bộ tìm kiếm phải duy trì 100% mảnh thông mạch, không còn tình trạng bị lột bỏ để lại ô trống sau khi xếp.",
      ],
    },
    {
      t: "Phiên Bản 7.14.0 · Bổ Sung Tự Động Tẩy Ô Khớp Công Pháp & Bộ Chỉ Số Chiến Đấu Chuyên Sâu",
      d: "07/11/2026",
      now: false,
      pts: [
        "<b>Cơ Chế Tự Động Tẩy Ô (Đổi Hệ Ô) Kinh Mạch Khớp Công Pháp:</b> Tích hợp tùy chọn <i>'Tự Động Tẩy Ô Để Khớp Công Pháp Tối Đa'</i> trong Auto Kinh Mạch. Thuật toán tự động rà soát các ô bị lệch hệ dưới các mảnh công pháp/pháp khí chủ lực, tính toán độ tăng điểm tương sinh & hệ số màu để lập kế hoạch chuyển hệ (sang hệ của công pháp hoặc ô xám Vô Sắc) và tự động gọi <code>g.doiMauO</code> an toàn.",
        "<b>Mô Phỏng Sức Mạnh Trước & Sau Khi Tẩy Ô:</b> Khi xem trước hoặc chạy Auto, Tool tự động giả lập kết quả sau khi tẩy ô, hiển thị danh sách tọa độ (Cột, Hàng) cùng chi tiết hệ cũ ➔ hệ mới, giúp đạo hữu nắm rõ hiệu quả trước khi chốt.",
        "<b>Bổ Sung Bộ Chỉ Số Chiến Đấu Toàn Diện Vào Bảng So Sánh (statRows):</b> Nâng cấp bảng so sánh kinh mạch hiển thị đầy đủ các chỉ số thực chiến quan trọng:",
        "&nbsp;&nbsp;• <b>Pháp Lực:</b> Sát thương nền của chiêu (kèm Nền Thể đối với thể tu).",
        "&nbsp;&nbsp;• <b>Chiêu Mạnh Nhất:</b> Tên chiêu có sát thương đơn kích uy lực nhất và giá trị sát thương chuẩn.",
        "&nbsp;&nbsp;• <b>Tổng Sát Thương Chiêu:</b> Tổng lượng sát thương đầu ra của tất cả các chiêu tấn công và khống chế.",
        "&nbsp;&nbsp;• <b>Tạo Hộ Thuẫn:</b> Lượng khiên phòng ngự tạo ra từ các chiêu thức kèm trần khiên tối đa (60% Khí Huyết).",
        "&nbsp;&nbsp;• <b>Bột Phát Sát Thương:</b> Hệ số bộc phát (×1.5) cùng mức sát thương đỉnh cao nhất khi kích hoạt bộc phát.",
      ],
    },
    {
      t: "Phiên Bản 7.13.8 · Mở Rộng Dò Tìm Sự Kiện Tu Vi & Bổ Sung Bảng Tu Vi Đã Tăng",
      d: "07/11/2026",
      now: false,
      pts: [
        "<b>Mở Rộng Quét 100% Hoạt Động & Sự Kiện Tăng Tu Vi:</b> Khắc phục triệt để hạn chế trước đây chỉ quét hoạt động tại ô đang đứng. Thuật toán mới tự động quét toàn bộ hơn 380 sự kiện tăng tu vi (kỳ ngộ, di tích, bí cảnh, đầm lầy, thư viện môn phái...) trong toàn bộ bán kính di chuyển qua <code>placeActivities</code>, <code>run.nodes</code> và <code>run.noiChon</code>.",
        "<b>Gỡ Bỏ Rào Cản Hồi Chiêu & Sửa Lỗi Điều Hướng Nơi Chốn:</b> Bỏ qua giới hạn hồi chiêu cứng 60 năm lỗi thời, đồng bộ chuẩn xác với cấu hình <code>limits.moi_run</code> và <code>limits.hoi_chieu_nam</code> của game. Tự động gọi <code>enterPlace</code>/<code>enterNode</code> khi đến địa điểm giúp <code>chooseActivity</code> kích hoạt tức thì không bị lỗi 'Không ở nơi chốn nào', đồng thời sửa lỗi so sánh slot ngăn chặn việc đánh dấu nhầm ô sự kiện vào danh sách đen.",
        "<b>Đưa Lựa Chọn Tu Vi Lên Đầu & Tránh Rút Lui Sớm:</b> Nâng cấp cơ chế ra quyết định <code>auPick</code>, luôn đặt lựa chọn tăng tu vi và vượt khảo nghiệm lên mức ưu tiên cao nhất trong mọi nhánh kịch bản (kể cả sự kiện phân nhánh và chuỗi liên hoàn <code>start_chain</code>), tuyệt đối không bỏ chạy sớm.",
        "<b>Thêm Dòng 'Tu Vi Đã Tăng' Trong Thống Kê Auto:</b> Tích hợp công thức tính lũy kế tu vi chính xác từ cảnh giới lớn, tiểu cảnh giới, tu vi hiện tại và điểm phá bình cảnh. Hiển thị trực quan theo thời gian thực <b>Tu Vi Đã Tăng: +X</b> giúp đạo hữu dễ dàng theo dõi hiệu quả cày tu vi của Auto.",
      ],
    },
    {
      t: "Phiên Bản 7.13.7 · Thích Ứng Bản Cập Nhật Trần Dược Kháng & Cân Bằng Đạo Lộ Game",
      d: "07/11/2026",
      now: false,
      pts: [
        "<b>Đồng Bộ Bản Build Game Mới (index-pyGvwuOa.js & content-AFgvANiO.json):</b> Hoàn tất quy trình kiểm tra 6 bước theo dõi bản cập nhật mới nhất từ nhà phát triển game; kiểm tra 100% các module gọi lõi qua <code>window.tuTien.core</code> bảo đảm tính tương thích và bảo mật Stealth tuyệt đối.",
        "<b>Thích Ứng Cơ Chế Trần Dược Kháng Theo Cảnh Giới (drugUsesPerRealm & drugCapped):</b> Game bổ sung cơ chế giới hạn số viên đan dược thấm trong một cảnh giới ở các Đạo Lộ khắc nghiệt (Nghịch Thiên trần 3 viên/cảnh giới, Tuyệt Mệnh trần 2 viên/cảnh giới). Tool nay tự động kiểm tra trần dược kháng qua <code>drugCapped</code> và <code>realmDrugUses</code>, ngăn chặn hoàn toàn việc spam đan dược đã kháng khi bế quan hoặc cắn đan phá bình cảnh.",
        "<b>Hiển Thị Trực Quan Số Viên Đan Thấm Còn Lại:</b> Tích hợp trạng thái còn thấm và cảnh báo <i>[Đã đạt trần cảnh giới]</i> vào Tab Đột Phá & Thọ, Tab Túi Đồ và gợi ý cắn đan bù điểm để người chơi dễ dàng quản lý tài nguyên đan dược quý giá.",
        "<b>Cập Nhật Cân Bằng AI Địch & Đấu Giá (enemyAiBonus & AUCTION_HAND_LOT_SHARE):</b> Đồng bộ các hằng số cân bằng mới của game gồm AI và trang bị thông minh của địch ở chế độ khó, trần vòng vây hãm môn phái (<code>SIEGE_MAX_ROUNDS = 100</code>), và tỉ lệ phân bổ lô viết tay trong đại hội đấu giá.",
      ],
    },
    {
      t: "Phiên Bản 7.13.6 · Đồng Bộ Tương Sinh Phẩm Cấp & Khai Phá Lõi Kinh Mạch Game",
      d: "07/11/2026",
      now: false,
      pts: [
        "<b>Đồng Bộ Công Thức Suy Giảm Tương Sinh (generationRank & zD):</b> Khai quật chính xác từ mã nguồn game: công pháp phẩm thấp sinh cho công pháp phẩm cao bị suy giảm theo mảng chênh bậc <code>zD = [1, 2/3, 1/3, 0]</code> (kém 1 phẩm còn 67%, kém 2 phẩm còn 33%, kém ≥3 phẩm mất trắng 0% tương sinh). Trấn phái và Nghịch Thiên luôn giữ chuẩn bậc 5 (Thiên phẩm), Nghịch Thiên sinh cho bất kỳ ai cũng nhận đủ 100%.",
        "<b>Nâng Cấp Thuật Toán Xếp Kinh Mạch Thông Minh:</b> Tích hợp bảng suy giảm <code>genSlack</code> vào bộ lọc vị trí (<code>smart candidate scoring</code>) và hàm lượng giá (<code>biasInfo</code>). Bộ xếp tự động ưu tiên ghép các mảnh cùng hoặc cao hơn phẩm cấp kề nhau để đạt trọn vẹn 100% tương sinh (+15% hệ số), loại bỏ triệt để tình trạng ghép mảnh rác phẩm thấp quanh mảnh chủ lực.",
        "<b>Nhận Diện Tương Sinh Nội Tại & Triệt Tiêu Điểm Nghịch:</b> Nhận diện mảnh đa hệ có tương sinh nội tại (<code>noiTai = 1.1</code>, tăng 10% toàn mảnh), đồng thời cảnh báo và tránh các cặp ô/mảnh tương khắc không có hệ trung gian thông quan gây phản phệ.",
      ],
    },
    {
      t: "Phiên Bản 7.13.5 · Đại Tu Thuật Toán Hình Học & Tối Ưu Hóa Auto Kinh Mạch Toàn Diện",
      d: "07/11/2026",
      now: false,
      pts: [
        "<b>Đại Tu Thuật Toán Hình Học Kinh Mạch (Topology & Spanning Tree):</b> Dựa trên phân tích sâu mã nguồn game, thuật toán xếp tham lam (Greedy) và Simulated Annealing nay tự động dựng cây thông mạch liên tục từ Đan Điền tỏa ra các nhánh, áp dụng bộ lọc liên thông thời gian thực giúp loại bỏ 95% vị trí chết không thể thông mạch, tăng tốc độ tính toán gấp 40 lần.",
        "<b>Bộ Đột Biến Hình Học 8 Tầng (8-Layer Geometric Mutators):</b> Tích hợp các toán tử hình học chuyên biệt: Xoay tại chỗ (Rotate-In-Place), Hoán đổi cặp mảnh (Piece Swap), Bắn tỉa huyệt vị (Acupoint Snipe), Trượt hình học lân cận (Slide / Jiggle) và Tối ưu màu ô cộng hưởng (Cell Element Resonance), giúp thuật toán bứt phá khỏi bẫy cực trị địa phương và lách khít từng góc chết trên lưới.",
        "<b>Tối Ưu Hóa Tuyệt Đối Tài Nguyên Huyệt Đạo (x2.0 Buff):</b> Tự động nhận diện và ưu tiên găm các mảnh Công Pháp / Pháp Khí chủ lực (sát thương chiêu cao nhất hoặc tốc độ tu luyện/đột phá cao nhất) đè trúng các ô Huyệt Đạo, nghiêm ngặt tránh lãng phí huyệt trống hoặc để mảnh rác chiếm chỗ.",
        "<b>Tối Ưu Hóa Kinh Lộ Pháp Khí & Tương Sinh Ngũ Hành:</b> Xếp đặt chuỗi công pháp hợp hệ từ Đan Điền vươn tới Pháp Khí để kích hoạt trọn vẹn buff kinh lộ (+10% đến +50%), đồng thời kết nối các cặp mảnh tương sinh (+15% mỗi mảnh sinh kề bên) và triệt tiêu điểm nghịch gây trừ tỉ lệ đột phá.",
        "<b>Leo Đồi Chuyên Sâu (Ultra Hill-Climbing Polish):</b> Sau khi luyện kim, hệ thống tự động quét xoay tại chỗ, trượt lân cận, hoán đổi cặp mảnh và lấp đầy các ô trống bằng các món vừa vặn trong túi, đem lại cách xếp tối ưu nhất cả về điểm số lẫn mỹ thuật hình học.",
      ],
    },
    {
      t: "Phiên Bản 7.13.4 · Tự Động Uống Đan Phá Bình Cảnh Cả Khi Bế Quan & Săn Yêu",
      d: "07/11/2026",
      now: false,
      pts: [
        "<b>Tự Động Uống Đan Phá Bình Cảnh:</b> Khi tu vi chạm bình cảnh tiểu cảnh giới (Sơ kỳ → Trung kỳ, Trung kỳ → Hậu kỳ...), Auto sẽ tự động kiểm tra túi đồ và nuốt các loại đan phá bình cảnh (Phá Chướng Đan, Toái Bích Đan, Thông Huyền Đan, Phá Hư Đan, Khai Khiếu Châu, Xuyên Bích Giác, Huyền Quan Tủy, Hư Linh Phách) tương ứng cảnh giới hiện tại để lập tức thăng cấp tiểu cảnh giới.",
        "<b>Hỗ Trợ Toàn Diện Cả Bế Quan & Đánh Quái:</b> Tính năng được kích hoạt xuyên suốt cho cả 2 phương thức Bế Quan Nhập Định lẫn Đánh Quái Săn Yêu cày tu vi, đồng thời sửa lỗi nhận diện đan phá bình cảnh trong lệnh nhập định của game.",
        "<b>Tùy Chọn Trực Quan & Thống Kê Chi Tiết:</b> Đưa tùy chọn «💊 Tự Động Uống Đan Phá Bình Cảnh Khi Chạm Nấc» vào khu vực An Toàn Chung của Tab Auto Tu Luyện để dễ dàng bật/tắt ở mọi chế độ, đồng thời bổ sung chỉ số <i>«Bình Cảnh Đã Phá»</i> thời gian thực trên bảng tiến trình.",
      ],
    },
    {
      t: "Phiên Bản 7.13.3 · Thích Ứng Toàn Diện Bản Cập Nhật Game Mới & Đồng Bộ Đạo Lộ Tuyệt Mệnh",
      d: "07/11/2026",
      now: false,
      pts: [
        "<b>Đồng Bộ Hoàn Toàn Với Bản Build Game Mới:</b> Hoàn thành quy trình điều tra 6 bước theo dõi bản cập nhật mới nhất của game (bundle <code>index-U3gz8Mj2.js</code>); xác nhận 100% các module gọi lõi (<code>window.tuTien.core</code>) và cơ chế chiến đấu/tu luyện tương thích ổn định tuyệt đối.",
        "<b>Hỗ Trợ Toàn Diện Đạo Lộ «Tuyệt Mệnh» (One-Life Mode):</b> Đồng bộ 4 Đạo Lộ chuẩn của game: Thuận Thiên, Trung Đạo, Nghịch Thiên và Tuyệt Mệnh. Bổ sung tùy chọn chọn Đạo Lộ Tuyệt Mệnh trong Auto Reroll tạo kiếp; chuẩn hóa nhận diện cờ <code>run.difficulty = 'oneLife'</code> trên bảng trạng thái và công cụ nạp lưu an toàn.",
        "<b>Cập Nhật Cơ Chế Công Phá Sơn Môn & Dị Bảo Biển:</b> Đồng bộ các hằng số và cơ chế mới của Hộ Sơn Đại Trận (<code>combat/sectSiege</code>); ghi nhận cập nhật tỉ lệ chắc chắn kích hoạt Thuyền Rồng (Dị Bảo Thái Hư Chu) tại Bến Lạc Khư từ nhà phát triển game.",
      ],
    },
    {
      t: "Phiên Bản 7.13.2 · Bổ Sung Tùy Chọn Ưu Tiên Tham Gia Sự Kiện Tăng Tu Vi Khi Săn Yêu",
      d: "07/11/2026",
      now: false,
      pts: [
        "<b>⚡ Ưu Tiên Tham Gia Sự Kiện Tăng Tu Vi:</b> Trong chế độ Đánh Quái (Săn Yêu Thú) của Auto Tu Luyện, bổ sung tùy chọn tự động quét toàn diện các cơ duyên, kỳ ngộ, bí cảnh, di tích và hoạt động nơi chốn xung quanh có ban tặng tu vi.",
        "<b>Định Hướng Đỉnh Cao & Đột Phá Thần Tốc:</b> Tự động so sánh và chọn các nhánh khảo nghiệm / quyết định mang lại lượng tu vi cao nhất trong sự kiện (nhận hàng chục đến hàng trăm nghìn tu vi), giúp nhân vật thăng cấp thần tốc hơn việc chỉ đánh quái đơn thuần.",
        "<b>Thống Kê Tiến Độ Thời Gian Thực:</b> Bổ sung chỉ số <i>«Sự Kiện Tu Vi Đã Qua»</i> ngay trên bảng trạng thái Auto, hiển thị rõ số lần tham gia kỳ ngộ thành công.",
        "<b>Bảo Toàn An Toàn & Tránh Kẹt:</b> Tích hợp cơ chế tự động ghi nhớ, giới hạn số lần thử (retry limit 3 lần) và tự động bỏ qua các sự kiện vượt quá khả năng để hành trình tu tiên luôn thông suốt.",
      ],
    },
    {
      t: "Phiên Bản 7.13.1 · Chuẩn Hóa Mục Tiêu Đại Cảnh Giới & Bổ Sung Tùy Chọn Tiểu Cảnh Giới Cho Auto Tu Luyện",
      d: "07/11/2026",
      now: false,
      pts: [
        "<b>Chuẩn Hóa Danh Sách Đại Cảnh Giới:</b> Sửa triệt để lỗi lệch chỉ số cảnh giới (off-by-one) ở mục chọn cảnh giới đích. Cập nhật đúng thang cảnh giới game: Luyện Khí (1) → Trúc Cơ (2) → Kim Đan (3) → Nguyên Anh (4) → Hóa Thần (5 - Đỉnh Nhân Giới), cùng tùy chọn <i>«♾️ Không Giới Hạn (Farm Liên Tục)»</i>.",
        "<b>Bổ Sung Tùy Chọn Mục Tiêu Tiểu Cảnh Giới:</b> Thêm dropdown chọn chính xác tiểu cảnh giới cần đạt: <i>Bất kỳ, Sơ kỳ, Trung kỳ, Hậu kỳ, Đại viên mãn, hoặc Đại viên mãn (Đầy tu vi 100%)</i>. Giúp các nhân vật ở mọi cảnh giới — đặc biệt là Hóa Thần — có thể tự động bế quan hoặc đánh quái để đạt mốc mong muốn mà không bị dừng sớm.",
        "<b>Tối Ưu Logic Khi Nhân Vật Ở Đỉnh Nhân Giới (Hóa Thần):</b> Khắc phục lỗi tự động dừng hoặc báo lỗi Thiên Môn đóng khi nhân vật đã ở Hóa Thần. Trong chế độ Đánh Quái, khi tu vi Hóa Thần đã đầy, Tool sẽ bỏ qua bước xung kích và tiếp tục chu trình săn yêu cày linh thạch/tài nguyên liên tục nếu đặt mục tiêu Không Giới Hạn hoặc chưa đủ số trận.",
        "<b>Tự Động Tính Năm Bế Quan Theo Tiểu Cảnh Giới:</b> Khi người chơi chọn mục tiêu tiểu cảnh giới kế tiếp, Tool tự động điều chỉnh số năm bế quan (kích hoạt chế độ nextMinorRealm) để đạt tiểu cảnh giới mục tiêu một cách nhanh và chuẩn xác nhất.",
      ],
    },
    {
      t: "Phiên Bản 7.13.0 · Gộp Toàn Diện Auto Tu Luyện & Săn Yêu (Tùy Chọn Bế Quan Hoặc Đánh Quái Cày Tu Vi)",
      d: "07/11/2026",
      now: false,
      pts: [
        "<b>Hợp Nhất Auto Tu Luyện & Auto Săn Yêu:</b> Nhận thấy đánh yêu thú cũng nhằm mục đích tích lũy tu vi và tài nguyên đột phá, Tool chính thức gộp toàn bộ tính năng Săn Yêu vào Tab Auto Tu Luyện (atl), mang lại trải nghiệm tu tiên liền mạch và tinh gọn.",
        "<b>Tùy Chọn Phương Thức Tu Luyện Linh Hoạt:</b> Người chơi có thể tự do chuyển đổi giữa 2 chế độ: <b>Bế Quan (Nhập Định)</b> (tự nuốt đan tu luyện, tự giải phóng bình cảnh, tính số năm tối ưu) hoặc <b>Đánh Quái (Săn Yêu)</b> (tự động tới các bãi hoang dã quanh khu vực, kiểm tra sức đánh, tự Tốc Chiến hoặc dùng Siêu AI VIP nghênh chiến, né chim Hạc giữ Khí Vận).",
        "<b>Tự Động Đột Phá Khi Tu Vi Chạm Trần:</b> Dù tu luyện bằng hình thức Bế Quan hay Đánh Quái, ngay khi tu vi đạt mức viên mãn hoặc chạm ngưỡng đại cảnh giới, Tool sẽ tự động chuyển sang quy trình Đột Phá: tính toán combo đan dược có tỉ lệ thành công cao nhất, kiểm tra ngưỡng an toàn chống nổ đan, xung kích cảnh giới và dùng Siêu AI VIP hạ gục Tâm Ma khi kiếp nạn xuất hiện.",
        "<b>Giao Diện Điều Khiển Thông Minh & Chuyển Đổi Mượt Mà:</b> Bảng cấu hình tự động ẩn/hiện các khối chức năng tương ứng theo chế độ được chọn, tích hợp nút <i>«🔍 Xem Sức Đánh & Các Bãi Săn Quanh Đây»</i> trực quan.",
        "<b>Tinh Gọn Thanh Tab Tự Động:</b> Loại bỏ tab Săn Yêu riêng lẻ để thanh điều hướng gọn gàng, đồng thời duy trì cơ chế chuyển hướng tương thích ngược 100%.",
      ],
    },
    {
      t: "Phiên Bản 7.12.0 · Đại Tu Toàn Diện Giao Diện Tab Auto Săn Dị Bảo & Tự Động Quick Save Trước Trận",
      d: "07/11/2026",
      now: false,
      pts: [
        "<b>Giao Diện Dashboard Săn Bảo Hiện Đại:</b> Tái thiết kế toàn bộ Tab Auto Săn Dị Bảo thành giao diện bảng điều khiển trực quan. Tích hợp thanh trạng thái nổi bật, bộ chỉ số tổng quan nhanh (Đã Có Trong Kiếp, Bảo Lục Luân Hồi, Đang Chọn Săn, Đang Nở Trên Map) cùng các nút thao tác nhanh (Bắt Đầu, Dừng, Lưu Cấu Hình, Quick Save, Quét Lại).",
        "<b>Radar & Trinh Sát Bản Đồ Thời Gian Thực (Live Radar):</b> Tự động hiển thị ngay khi mở tab mà không cần bấm nút quét thủ công. Nhận diện lập tức các Dị Bảo đang nở rộ trên thế giới kèm nút [⚡ Truyền Tống] và [🚀 Bay Tới] trực tiếp. Khi chưa có Dị Bảo nở, hiển thị tiến độ Pity 500 năm trực quan cùng Top 3 tọa độ cắm trại đắc địa nhất (có nút [🏕️ Cắm Trại] 1-chạm).",
        "<b>Bộ Lọc Nhanh 1-Chạm Đa Tiêu Chí:</b> Thêm hệ thống nút lọc thông minh cho danh sách chọn Dị Bảo: [✓ Tất Cả (19)], [✕ Bỏ Hết], [⭐ 12 Món Hồn], [📦 Chỉ Chưa Có], [⚔️ 13 Boss (7%)], [🧠 6 Trí (3%)], kết hợp ô tìm kiếm tức thì theo tên Dị Bảo và địa danh.",
        "<b>Thẻ Dị Bảo Trực Quan, Minh Bạch Cơ Chế:</b> Mỗi Dị Bảo được trình bày dạng card hiện đại với huy hiệu cơ chế rõ ràng (⭐ Hồn vs Kiếp, ⚔️ 7% Boss vs 🧠 3% Trí tuệ), địa điểm xuất thế và tình trạng sở hữu thực tế của nhân vật.",
        "<b>Tự Động Quick Save Trước Khi Vào Trận Săn Bảo (Auto Quick Save):</b> Tùy chọn mới cho phép Tool tự động tạo bản sao lưu nhanh (Quick Save) ngay khi phi hành tới địa điểm có Dị Bảo (trước khi kích hoạt sự kiện/giao chiến Boss). Kết hợp hoàn hảo với tính năng 'Tẩy Thiên Cơ' (Đổi Vận Rủi RNG) trong Nạp Save để người chơi dễ dàng tối ưu cơ hội đoạt bảo.",
        "<b>Cấu Hình & Chiến Thuật Nhóm Gọn Gàng:</b> Phân loại cài đặt mạch lạc thành các khối: Di Chuyển & Cắm Trại, Chiến Đấu & AI, Tốc Độ & An Toàn, và Tự Lưu Nhanh Trước Trận.",
      ],
    },
    {
      t: "Phiên Bản 7.11.7 · Làm Rõ Cơ Chế Pity 500 Năm & Tỉ Lệ Rớt Dị Bảo Thực Tế",
      d: "06/11/2026",
      now: false,
      pts: [
        "<b>Minh Bạch Cơ Chế Pity 500 Năm (Spawn Rate vs Drop Rate):</b> Điều chỉnh hiển thị từ '100% Nổ Dị Bảo' thành '100% Lượt Kế Xuất Thế Sự Kiện (Tỉ lệ rớt khi thắng: 7%)' trên toàn bộ giao diện (Thanh Pity tab Dị Bảo, Tiến Trình Auto Săn Dị Bảo, Radar Cắm Trại). Giúp người chơi hiểu đúng cơ chế game: Thiên Đạo Bù Dị Bảo bảo đảm 100% sự kiện xuất hiện tại nơi chốn, nhưng khi hạ Boss Hộ Vệ thì tỉ lệ rớt bảo vật là 7% (hoặc 3% tùy món).",
        "<b>Chi Tiết Hóa Nhật Ký Kết Thúc Sự Kiện Dị Bảo:</b> Khi đánh thắng Boss hoặc hoàn tất sự kiện mà không đoạt được bảo vật (do trúng 93% tỉ lệ bảo vật nứt vỡ/tiêu tán theo kịch bản game), Tool ghi nhận chi tiết tỉ lệ rớt và trạng thái hồi chiêu 120 năm, tránh gây hoang mang hoặc hiểu nhầm rằng Boss chắc chắn rơi đồ.",
        "<b>Cập Nhật Chú Thích Cơ Chế Dị Bảo:</b> Bổ sung giải thích chi tiết trong phần hướng dẫn Tab Dị Bảo về hồi chiêu 120 năm và xúc xắc ngẫu nhiên 7% đoạt bảo.",
      ],
    },
    {
      t: "Phiên Bản 7.11.6 · Tinh Gọn UI Tiến Trình & Khắc Phục Triệt Để Lag Khi Auto Săn Dị Bảo",
      d: "06/11/2026",
      now: false,
      pts: [
        "<b>Tinh Gọn & Loại Bỏ Trùng Lặp UI Tiến Trình Săn Bảo:</b> Loại bỏ hoàn toàn sự trùng lặp thông tin Pity (0/500n), hệ số nhân (×1.0) và chuỗi mô tả cắm trại dài dòng giữa các hàng 'Thiên Đạo Bù', 'Mục Tiêu Đang Săn' và 'Hành Động Hiện Tại'. UI nay hiển thị rõ ràng, súc tích: hiển thị đích danh Dị Bảo đón đầu hoặc 'Chờ Dị Bảo xuất thế' và nơi cắm trại tinh gọn.",
        "<b>Đại Tu Tốc Độ scanDiBao (O(1) Direct Access):</b> Thay thế toàn bộ thuật toán duyệt đệ quy 7 tầng qua hàng chục nghìn đối tượng save game bằng cơ chế đọc trực tiếp từ các cấu trúc dữ liệu chuẩn của game (<code>flags</code>, <code>history</code>, <code>tienLo.relics</code>, <code>nodes</code>), tăng tốc độ quét lên gấp hàng ngàn lần và triệt tiêu 100% rác bộ nhớ gây nghẽn Garbage Collector.",
        "<b>Khử Trùng Lặp Luồng Sự Kiện Khi Auto Chạy:</b> Tự động chặn sự kiện <code>timePass</code> và <code>travel</code> ngoài luồng kích hoạt lại vòng quét <code>checkDiBaoAlert</code> và render lại tab Dị Bảo trong khi Auto đang vận hành, giải phóng hoàn toàn CPU cho game.",
        "<b>Bộ Đệm Tọa Độ Địa Danh (findSlotByDiaDanh Cache):</b> Bổ sung cache băm cho các phép dò tìm slot bản đồ từ tên địa danh / marker, loại bỏ việc duyệt lặp qua hàng nghìn slot thế giới ở mỗi chu kỳ quét.",
        "<b>Chống Spam Log & Điều Tiết Nhịp Bế Quan Thông Minh:</b> Chặn việc đẩy log lặp lại mỗi năm bế quan tại cùng một địa điểm; tối ưu độ dài bước bế quan (3–5 năm) khi chưa gần mốc Pity và cấp nhịp nghỉ nhỏ 60ms cho game engine kịp render mượt mà, giúp cả web game và Tool chạy êm ái, trôi năm nhanh chóng mà không còn giật lag.",
      ],
    },
    {
      t: "Phiên Bản 7.11.5 · Đại Tu Hiệu Năng Toàn Diện (Performance Optimization)",
      d: "06/11/2026",
      now: false,
      pts: [
        "<b>Đại Tu Bộ Quan Sát Giao Diện (MutationObserver Title Case):</b> Loại bỏ hoàn toàn việc quét định dạng văn bản Title Case khi cửa sổ Tool đang đóng; khử trùng lặp O(N²) cây con, kiểm soát việc kích hoạt đột biến vòng lặp (self-triggering mutations), giúp render các danh sách dài nhanh và mượt hơn rõ rệt.",
        "<b>Triệt Tiêu Nghẽn I/O & Reflow Trong Combat Watcher Tick:</b> Khắc phục triệt để việc ghi đĩa <code>localStorage.setItem</code> mỗi 400ms trong <code>syncGameCombatAutomation</code> bằng cơ chế so khớp chuỗi trước khi lưu; chuyển đổi việc tái tạo toàn bộ DOM của thanh Combat Overlay thành cơ chế cập nhật trạng thái có điều kiện, giảm 100% hiện tượng khựng lag trong giao tranh.",
        "<b>Loại Bỏ Layout Thrashing Khi Cuộn Màn Hình (Fit Screen):</b> Bỏ qua việc tính toán lại bố cục cửa sổ Tool khi đang ẩn; đồng thời lưu bộ đệm Safe Area Insets (tai thỏ) thay vì gọi <code>getComputedStyle</code> liên tục trong mỗi frame cuộn màn hình, mang lại trải nghiệm mượt mà 60–120 FPS.",
        "<b>Tăng Tốc Chuỗi & Tra Cứu (Fast-Path & Memoization):</b> Trang bị bộ nhớ đệm (LRU cache) và đường tắt ASCII cho hàm chuẩn hóa chuỗi tiếng Việt <code>fold()</code>; bổ sung bộ lọc nhanh cho <code>auIsHacText()</code>; chuyển đổi toàn bộ tra cứu danh mục Dị Bảo <code>DIBAO.ev.find()</code> sang bảng băm <code>DIBAO.evMap</code> với độ phức tạp O(1); bổ sung cơ chế kiểm tra chữ ký DOM tránh vẽ lại Mini Tracker không cần thiết.",
      ],
    },
    {
      t: "Phiên Bản 7.11.4 · Khắc Phục Lỗi Combat AI Bị Khóa Đánh Thường & Sửa UI Mini Tracker",
      d: "06/11/2026",
      now: false,
      pts: [
        "<b>Khắc Phục Triệt Để Lỗi Combat AI Chỉ Đánh Thường:</b> Loại bỏ hoàn toàn cơ chế kết liễu sớm (Finisher) sai lệch ở đòn đánh thường, đảm bảo 100% chiêu thức công phá (Vạn Kiếm Quy Tông, Trảm Tiên Kiếm, chiêu bản mệnh, chiêu bẩm sinh...) luôn được ưu tiên thi triển tối đa. Đồng thời cải tổ cơ chế vòng lặp tác chiến (auFightInstant & auFightStep): khi một hành động bị game từ chối, AI tiếp tục thử các chiêu kế tiếp thay vì vội vã đánh thường rồi kết lượt bỏ cuộc.",
        "<b>Tích Hợp Bộ Não Chiến Đấu Tự Động Chuẩn Game Core (nextAutomatedAction):</b> Kết nối trực tiếp với hàm tự động đánh chuẩn của lõi game (<code>combat/playerAutomation</code>), đồng bộ kiểm tra bùa chú, đan dược, trận bàn và thời gian hồi chiêu, giúp nhân vật xả toàn bộ sát thương uy lực nhất trong mọi trận giao chiến.",
        "<b>Sửa Lỗi Tràn Viền Giao Diện Mini Tracker Dị Bảo:</b> Mở rộng chiều ngang linh hoạt cho thanh theo dõi Mini Dị Bảo (<code>#vkx-dibao-mini</code>), tinh chỉnh khoảng cách và padding nút bấm, khắc phục triệt để lỗi nút <code>🔍 Xem</code> và nút đóng <code>✕</code> bị lòi ra ngoài viền đỏ bo tròn khi tên dị bảo và địa danh dài.",
      ],
    },
    {
      t: "Phiên Bản 7.11.3 · Ghi Nhận Combat Log Trận Đấu & Phân Tích Nguyên Nhân Thua",
      d: "06/11/2026",
      now: false,
      pts: [
        "<b>Tự Động Lưu Trữ Toàn Bộ Nhật Ký Trận Đánh (Combat Log Backup):</b> Khắc phục triệt để việc game engine xóa sạch dữ liệu hiệp đấu khi kết thúc trận. Tool nay tự động lưu trọn vẹn toàn bộ các hiệp đấu, đòn đánh, sát thương, hiệu ứng và chỉ số máu/chân nguyên của ta và địch vào <code>window.__vkLastCombat</code> trước khi gọi <code>xongTran()</code>.",
        "<b>Phân Tích & Báo Cáo Nguyên Nhân Thất Bại Lên Nhật Ký Tác Vụ:</b> Khi bị thua trong trận đánh (đặc biệt là giao chiến với Boss thủ bảo hoặc quái tinh anh), Tool lập tức trích xuất tên đối thủ, lượng máu còn lại của địch (ví dụ: <code>Địch còn: 35% HP</code>), số hiệp đã trụ được, cùng 3–4 đòn đánh cuối cùng dẫn đến gục ngã lên bảng Nhật Ký Tác Vụ.",
        "<b>Tra Cứu Nhanh Chi Tiết Trận Đấu Qua Console:</b> Cung cấp lối tắt <code>window.__vkLastCombat.nhatKy</code> trong F12 Console để người chơi có thể soi lại từng chiêu thức, phản chấn, bạo kích của cả trận đấu bất cứ lúc nào.",
      ],
    },
    {
      t: "Phiên Bản 7.11.2 · Minh Bạch Nhật Ký Sự Kiện & Chi Tiết Kết Quả Kiểm Định",
      d: "06/11/2026",
      now: false,
      pts: [
        "<b>Trích Xuất Chi Tiết Diễn Biến & Kiểm Định Sự Kiện (Encounter Transcript):</b> Khi tự động giải quyết các sự kiện (đặc biệt là Dị Bảo, kỳ ngộ, thám hiểm), Tool nay tự động ghi nhận lựa chọn đã bấm kèm yêu cầu kiểm tra (ví dụ <code>[Ngộ tính +45]</code>), đồng thời trích xuất trực tiếp kết quả kiểm định (Thành công / Thất bại) và lời kể diễn biến của game (transcript narrate) lên bảng Nhật Ký Tác Vụ.",
        "<b>Cảnh Báo Biến Động Thương Thế Thời Gian Thực:</b> Tự động phát hiện và cảnh báo tức thì khi nhân vật nhận thương tổn hoặc tăng bậc thương thế (Thương nhẹ / Thương nặng / Trọng thương) sau mỗi sự kiện, giúp đạo hữu nắm bắt chính xác nguyên nhân dẫn đến thương thế mà không cần mở console hay tìm trong nhật ký game.",
      ],
    },
    {
      t: "Phiên Bản 7.11.1 · Tối Ưu Huyệt Đạo & Khống Chế Hộ Thể Kinh Mạch",
      d: "06/11/2026",
      now: false,
      pts: [
        "<b>Tối Ưu Hóa Phủ Huyệt Đạo (Acupoint Optimization):</b> Thuật toán Auto Kinh Mạch tự động kiểm tra vị trí toàn bộ các huyệt (huyệt gốc đã lệch theo kiếp + huyệt phụ mở thêm qua <code>acupointsOf</code>), chủ động điều hướng đưa các mảnh chủ lực (chiêu công có uy lực lớn, công pháp / pháp khí phẩm cao, bị động cốt lõi) ngự lên huyệt để tối đa hóa hệ số buff ×2.0 ~ ×2.5 của game. Đồng thời áp dụng hình phạt nặng đối với ô huyệt mở được nhưng bị bỏ trống hoặc bị chiếm bởi mảnh rác / mảnh không thông.",
        "<b>Khống Chế Chỉ Số Hộ Thể Không Vượt Trần 60%:</b> Cơ chế game kẹp trần Hộ Thể tối đa 60% (<code>HO_THE_MAX</code>). Cả bộ đánh giá trạng thái (<code>makeEval / quick</code>), bộ lập kế hoạch build (<code>hbPlan</code>) và hàm định giá (<code>hbVal</code>) nay tự động kẹp trần, phạt điểm lãng phí đối với % hộ thể vượt mức 60%, không dồn thừa các mảnh hộ thể để nhường ô cho sát thương, linh lực, tốc độ tu luyện và tỉ lệ đột phá.",
        "<b>Hiển Thị Trực Quan So Sánh Huyệt Đạo & Hộ Thể:</b> Bổ sung 2 hàng thông số mới vào bảng So Sánh Chỉ Số (cả trong tab Hướng Build và Bắt Đầu Xếp từ túi): hiển thị rõ số huyệt đã tận dụng (ví dụ: <code>4/4 ô · Tận dụng tối đa</code>) và % Hộ thể đạt được kèm nhãn cảnh báo trần 60% (ví dụ: <code>60% (trần 60%)</code> hoặc <code>55%/60%</code>), giúp người chơi kiểm soát 100% hiệu quả kinh mạch.",
      ],
    },
    {
      t: "Phiên Bản 7.11.0 · Thích Ứng Game Update (Bản Mệnh Cấp 5, Dị Văn & Dự Báo Phẩm Đột Phá)",
      d: "06/11/2026",
      now: false,
      pts: [
        "<b>Hệ Thống Bản Mệnh & Dị Văn Cấp 5 (Level 0–4):</b> Đồng bộ 100% với bản cập nhật mới của game — nâng trần cấp văn Bản Mệnh lên Cấp 5 (NATAL_RUNE_MAX_LEVEL = 4), hỗ trợ nâng cấp bằng tỉ lệ ở bậc cao (Cấp 4–5), tích hợp xác suất Linh quang, nhận diện và hiển thị Dị Văn (Mutant Rune) kèm mô tả hiệu quả đột biến trực tiếp từ <code>core['character/natalRunes'].describeRune</code>.",
        "<b>Cập Nhật Bảng Chỉ Số Văn & Hằng Số Cân Bằng Mới:</b> Cập nhật mảng giá trị 5 cấp cho toàn bộ 17 loại văn (Nhiễm 5 cấp: 0% → 18%, Chỉ số nội tại 5 cấp: 0.6 → 1.9, Hộ thể 5 cấp: 3% → 16%...), mở rộng cơ chế kiểm tra <code>K.bmRune</code> để nhận diện trọn vẹn mảng 5 phần tử từ game; cập nhật hệ số Dưỡng giai uy lực (0.5) và Tế huyết (uy 2x) theo bản cân bằng mới nhất.",
        "<b>Dự Báo Chính Xác Phẩm Chất Đột Phá (Breakthrough Grade Preview):</b> Tích hợp hàm lõi <code>breakthroughGrade</code> của game vào Tab Đột Phá — dự báo trước chính xác 100% phẩm chất sẽ đạt được (Hoàn Mỹ, Thượng, Trung, Hạ) tương ứng với từng tổ hợp đan dược và nấc thiêu đốt thọ nguyên ngay thời điểm xung kích.",
        "<b>Nâng Cấp Auto Tu Luyện Với Kết Quả Xung Kích Mới:</b> Đồng bộ kết quả xung kích <code>BreakthroughOutcome</code> mới của game engine: tự động nhận diện và cảnh báo sớm khi xuất hiện Trận Tâm Ma (<code>tam_ma</code>), cảnh báo khi bị quấy nhiễu (<code>disturbed</code>), và hiển thị chính xác phẩm chất đạt được ngay khi đột phá thành công.",
        "<b>Mở Rộng Kết Nối Lõi Game (tuTien.core & tuTien.hud):</b> Đăng ký bổ sung 18 hàm / hằng số lõi mới của game (<code>breakthroughGrade</code>, <code>resolveBreakthrough</code>, <code>pillFitsRealm</code>, <code>isRuneMaxed</code>, <code>isRuneHighTier</code>, <code>runeUpgradeChance</code>, <code>describeRune</code>, <code>THONG_MACH_VUNG</code>, <code>luotMo</code>, <code>vungCuaBac</code>, <code>oTrongTam</code>, <code>bountyRealm</code>, <code>shopItemsAt</code>...); đồng thời tích hợp cầu nối trực tiếp tới Zustand store của HUD (<code>tuTien.hud</code>) và bộ điều khiển giao diện chuẩn <code>ui.gamePanel</code>.",
      ],
    },
    {
      t: "Phiên Bản 7.10.3 · Đột Phá Auto Săn Dị Bảo (Cắm Trại Đích Danh & Quét Toàn Diện Di Tích)",
      d: "06/11/2026",
      now: false,
      pts: [
        "<b>Cơ Chế Cắm Trại Đích Danh Di Tích (Camping Strategy):</b> Khi chưa có Dị Bảo nở, Auto Săn Dị Bảo sẽ tự động truyền tống / bay thẳng tới vị trí di tích của Dị Bảo mục tiêu (Tiên Vân Điện cho Tam Sinh Thạch, Kiếm Trạch cho Bất Chiết Kiếm, Lan Đài cho Càn Khôn Giới...), tiến vào nơi chốn và bế quan 'ngoài trời' ngay tại chỗ. Điều này trực tiếp kích hoạt hàm Đạo Diễn (<code>refreshPlaceEncounters</code>) của game engine tại mỗi chu kỳ năm, đẩy xác suất rút trúng sự kiện xuất thế lên tối đa (100% khi Pity ≥ 500) thay vì bế quan thụ động ở động phủ.",
        "<b>Quét Toàn Diện & Chuẩn Xác Di Tích (run.noiChon Scanner):</b> Khôi phục và nâng cấp bộ quét <code>run.noiChon</code> bao quát toàn bộ 16 Dị Bảo di tích kết hợp kiểm tra thời hạn 5 năm (<code>namLamMoi</code>), cờ hoàn tất (<code>flags</code>), hồi chiêu 120 năm (<code>history</code>) và túi đồ (<code>checkOwnedRelic</code>). Chấm dứt triệt để tình trạng sự kiện Dị Bảo đã xuất hiện tại di tích nhưng Tool không nhận diện được.",
        "<b>Nút Tác Vụ 'Tiến Vào Nơi Chốn / Sự Kiện Ngay':</b> Bổ sung nút bấm tương tác trực quan ngay trên thẻ Dị Bảo và thanh thông báo Radar khi người chơi đã có mặt tại di tích, cho phép 1-click lập tức tiến vào sự kiện đoạt bảo mà không cần thao tác thủ công rườm rà.",
        "<b>Tối Ưu AI Lựa Chọn Phản Ứng:</b> Bổ sung các từ khóa khảo nghiệm ('nhìn thẳng', 'chiêm ngưỡng', 'soi'...) giúp AI tự động vượt qua các thử thách thuần kiểm định như «Đá ba mặt» (Tam Sinh Thạch) một cách hoàn hảo.",
      ],
    },
    {
      t: "Phiên Bản 7.10.2 · Đồng Bộ Tùy Chọn Tha Mạng & Buông Tha Vào Tab Auto Tu Luyện (atl)",
      d: "06/11/2026",
      now: false,
      pts: [
        "<b>Đồng Bộ Vào Tab Auto Tu Luyện & Đột Phá (atl):</b> Bổ sung 2 công tắc tùy chọn <i>«Tự Động Tha Mạng Đối Thủ Bại Trận (xu_tri)»</i> và <i>«Buông Tha Kẻ Tháo Chạy (enemy_escape)»</i> trực tiếp vào giao diện Tab Auto Tu Luyện; giải quyết triệt để vấn đề bị ngắt ngang khi bế quan tu luyện gặp kẻ trộm cắp / đột kích động phủ.",
        "<b>Hoàn Thiện Tùy Chọn Cho Auto Săn Dị Bảo (asdb):</b> Bổ sung công tắc Buông Tha Kẻ Tháo Chạy vào Tab Auto Săn Dị Bảo, đảm bảo người chơi có thể tùy biến xử trí độc lập ở từng chế độ Auto.",
      ],
    },
    {
      t: "Phiên Bản 7.10.1 · Tự Động Tha Mạng Đối Thủ Bại Trận (xu_tri) & Buông Tha Kẻ Tháo Chạy",
      d: "06/11/2026",
      now: false,
      pts: [
        "<b>Tự Động Tha Mạng Đối Thủ Bại Trận (xu_tri):</b> Bổ sung tùy chọn thông minh tự động chọn «Tha Mạng» (lưu cho một đường sống) khi đánh bại kẻ khiêu chiến, trộm cắp đột kích động phủ hoặc đối thủ bại trận xuất hiện bảng xử trí. Giải quyết triệt để lỗi gián đoạn <i>'Có việc đang chờ bạn quyết định (xu_tri)'</i> khi đang bế quan cắm trại hoặc auto chiến đấu.",
        "<b>Tự Động Buông Tha Kẻ Tháo Chạy (enemy_escape):</b> Tự động chọn «Buông Tha / Bỏ Qua» (nhặt nửa chiến lợi phẩm) khi kẻ địch bỏ chạy mà người chơi không muốn rượt đuổi, giúp quy trình Auto diễn ra hoàn toàn tự động, liền mạch 100%.",
        "<b>Tích Hợp Tùy Chọn Cấu Hình Độc Lập:</b> Cung cấp các công tắc bật/tắt trực quan trong cả tab <b>Auto Săn Dị Bảo (asdb)</b> và tab <b>Siêu AI Tác Chiến VIP (atc)</b>, mặc định luôn bật sẵn để tối ưu trải nghiệm rảnh tay.",
      ],
    },
    {
      t: "Phiên Bản 7.10.0 · Thích Ứng Game Update (Trận Bàn, Bản Mệnh Văn Mới & Đan Mạch)",
      d: "06/11/2026",
      now: false,
      pts: [
        "<b>Cập Nhật Bản Mệnh Văn Mới (5 Khắc Văn Mới):</b> Bổ sung trọn vẹn văn Tuyệt Hồi (<code>van.tuyet_hoi</code> - hiệu ứng decay giảm hồi phục) cùng 4 văn Nhiễm hệ nguyên tố mới: Nhiễm Lôi (<code>van.nhiem_loi</code>), Nhiễm Băng (<code>van.nhiem_bang</code>), Nhiễm Phong (<code>van.nhiem_phong</code>) và Nhiễm Ám (<code>van.nhiem_am</code>). Hoàn thiện đầy đủ 9 hệ linh căn cho hệ thống Bản Mệnh Pháp Bảo.",
        "<b>Hệ Thống Nghề Thứ 4 & Phân Loại Trận Bàn (Trận Pháp):</b> Tích hợp đầy đủ danh mục Trận Bàn (<code>tran_ban</code>) và Trận Văn (<code>tran_van</code>) vào từ điển vật phẩm, bộ lọc chợ, kho đồ và hệ thống luyện chế nghề Trận Pháp.",
        "<b>Hỗ Trợ Bày Trận Trong Chiến Đấu (Combat AI - bay_tran):</b> Nâng cấp Siêu AI VIP trong giao chiến tự động nhận diện và kích hoạt Bày Trận Bàn khi đối đầu Boss, Tinh Anh hoặc khi khí huyết tụt thấp, gia tăng vượt bậc khả năng phòng hộ và sát thương.",
        "<b>Cơ Chế Đan Mạch & tierSlack Mới:</b> Thích ứng cơ chế cân bằng mới của game cho phép dùng đan dược thông mạch / chữa tổn (Thiển Mạch Đan, Quán Mạch Đan, Tái Mạch Cao, Ngọc Tủy Cao, Tử Phủ Linh Quả) vượt cảnh giới cũ; tương thích tuyệt đối 100% với phiên bản game build mới (57bad5c9).",
      ],
    },
    {
      t: "Phiên Bản 7.9.2 · Khắc Phục Báo Sai Dị Bảo Sau Sự Kiện & Chuẩn Hóa Quét Map",
      d: "06/11/2026",
      now: false,
      pts: [
        "<b>Loại Bỏ Báo Động Dị Bảo Ảo (Ghost Alert Fix):</b> Gỡ bỏ việc quét danh sách tĩnh trong <code>run.noiChon</code>; chuẩn hóa quét sự kiện Dị Bảo thực tế qua <code>run.nodes</code> (các node xuất thế thực thụ) kết hợp kiểm tra hồi chiêu 120 năm trong lịch sử (<code>run.history</code>) và cờ hoàn tất (<code>flags</code>). Chấm dứt hoàn toàn tình trạng sau khi qua sự kiện (dù có hay không nhận được Dị Bảo) tool vẫn liên tục báo có bảo vật tại khu di tích.",
        "<b>Chính Xác Hóa Thông Báo Đoạt Bảo:</b> Kiểm tra nghiêm ngặt túi đồ và thuộc tính nhân vật sau khi hoàn tất sự kiện (<code>checkOwnedRelic</code>); chỉ chúc mừng đoạt bảo khi thực sự nhận được Dị Bảo, tránh gây hiểu lầm cho người chơi khi sự kiện chỉ vừa kết thúc mà chưa đủ điều kiện nhận vật phẩm.",
        "<b>Mở Rộng Từ Khóa Thu Nhận Dị Bảo (Smart Pick):</b> Bổ sung thêm các hành động gỡ, tháo, lục soát, mò, cầm lấy trong sự kiện (như gỡ nhẫn thi cốt Lan Đài) vào ưu tiên lựa chọn của Auto để tối đa hóa cơ hội đoạt bảo.",
      ],
    },
    {
      t: "Phiên Bản 7.9.1 · Tối Ưu Săn Dị Bảo Di Tích, Chống Kẹt Vòng Lặp & Tăng Tương Phản UI",
      d: "06/11/2026",
      now: false,
      pts: [
        "<b>Quét Toàn Diện Dị Bảo Tại Khu Di Tích (Ruin Events Scanner):</b> Mở rộng động cơ phát hiện Dị Bảo (<code>scanMapActiveDiBao</code>) quét đồng thời từ <code>run.nodes</code>, <code>run.noiChon</code> (các địa danh, di tích có sự kiện thường trú, sự kiện di tích), <code>theGioi.dangDien</code> (thế cục thế giới) và <code>placeActivities</code>; khắc phục triệt để lỗi không săn được và tự động chuyển sang bế quan khi Dị Bảo nở tại khu di tích đang có sự kiện.",
        "<b>Cơ Chế Chống Kẹt Vòng Lặp Khi Chưa Đủ Điều Kiện:</b> Khi tới điểm xuất thế (như Tàn Phong, Kiếm Trạch...) nếu bài kiểm định chưa đạt chỉ số hoặc Hộ Vệ quá mạnh khiến sự kiện phải tạm rút lui, hệ thống tự động ghi nhận số lần thử (<code>encAttempts</code>) và tạm thời bỏ qua để tiếp tục hành trình săn các bảo vật khác, chấm dứt hoàn toàn tình trạng lặp vô tận thông báo tiến vào sự kiện.",
        "<b>Khắc Phục Lỗi 'Encounter không ở trạng thái chờ':</b> Chuẩn hóa chặt chẽ điều kiện tiền bế quan; tự động dọn dẹp các sự kiện dở dang và chỉ thực hiện nhập định (<code>g.nhapDinh</code>) khi trò chơi đã xác nhận trạng thái sẵn sàng (<code>waiting.kind === 'be_quan'</code>).",
        "<b>Nâng Cấp Giao Diện Chọn Dị Bảo Sắc Nét, Dễ Nhìn:</b> Tối ưu hóa màu chữ, viền sáng và bóng đổ cho thẻ Dị Bảo khi được tích chọn (<code>.au-sdb-relic-card.checked</code>); tên bảo vật luôn hiển thị màu trắng sáng nổi bật trên nền xanh ngọc đậm, giải quyết hoàn toàn tình trạng chữ tối màu khó đọc.",
      ],
    },
    {
      t: "Phiên Bản 7.9.0 · Ra Mắt Bộ Quản Lý Lưu & Nạp Save (Tránh Thiên Đạo)",
      d: "06/11/2026",
      now: false,
      pts: [
        "<b>Quản Lý Lưu/Nạp Save Toàn Diện (Tab 'sv'):</b> Ra mắt trung tâm quản lý save chuyên nghiệp trong nhóm Luân Hồi và phím tắt nhanh tại Tổng Quan; hỗ trợ xuất/tải file save (.txt) kèm thông tin tên, cảnh giới, năm tu luyện và nạp lại save từ file hoặc dán mã.",
        "<b>Cơ Chế Tránh Thiên Đạo (Anti-Heaven Tribulation):</b> Tự động thanh tẩy sạch sẽ bộ nhớ theo dõi reload ngầm của game (<code>tu-tien:thien-dao:v1</code>), xóa bỏ cờ cảnh báo sổ mệnh có nét bút lạ (<code>saveWarning</code>), gỡ bỏ hộp thoại bắt bớ/chế giễu của Thiên Đạo.",
        "<b>Tùy Chọn Tẩy Thiên Cơ (Đổi Vận Rủi RNG):</b> Hỗ trợ xóa sạch các khóa kết quả tất định cũ (<code>rngKeys</code>) và tái tạo seed may rủi khi nạp save, giúp các lần Đột Phá, Luyện Chế sau khi nạp không bị lặp lại chuỗi thất bại cũ (“bước đúng dấu chân cũ”).",
        "<b>Hệ Thống Quick Save Tức Thì:</b> Lưu trữ tới 15 bản snapshot nhanh ngay trên trình duyệt với đầy đủ ngày giờ, cảnh giới, vị trí, ghi chú; hỗ trợ 1-click Khôi phục, Tải file, Sao chép hoặc Xóa bỏ.",
        "<b>Mở Khóa Độ Khó Tuyệt Mệnh (One-Life Mode Bypass):</b> Khắc phục rào cản cấm xuất/nạp save của chế độ Tuyệt Mệnh trong game gốc, cho phép lưu và nạp lại an toàn bảo toàn tiến trình của người chơi.",
      ],
    },
    {
      t: "Phiên Bản 7.8.5 · Thanh Theo Dõi Dị Bảo Mini & Tự Động Ẩn Alert Khi Tới Nơi",
      d: "06/11/2026",
      now: false,
      pts: [
        "<b>Tự Động Ẩn Alert Khi Tới Nơi:</b> Khi người chơi hoặc Auto có mặt tại đúng ô/nơi chốn Dị Bảo xuất thế, hệ thống tự động gỡ bỏ banner thông báo lớn phía dưới để tránh che khuất các nút thao tác sự kiện, kiểm định chỉ số hoặc giao chiến.",
        "<b>Thanh Theo Dõi Mini Tinh Gọn (Live Tracker Pill):</b> Hiển thị thanh trạng thái thu nhỏ gắn ở mép trên màn hình gồm đầy đủ thông tin: Tên Dị Bảo (kèm huy hiệu ⭐ Hồn), vị trí nơi chốn/slot, trạng thái Đang ở đây ✓ và số năm còn lại của sự kiện.",
        "<b>Tương Tác Linh Hoạt & Kéo Thả (Draggable):</b> Hỗ trợ kéo thả thanh Mini tự do trên màn hình và tự động lưu vị trí (localStorage); tích hợp nút [🔍 Xem] mở nhanh Tab Dị Bảo và nút [✕] tắt thanh theo dõi; tự động dọn dẹp khi sự kiện kết thúc.",
      ],
    },
    {
      t: "Phiên Bản 7.8.4 · Ưu Tiên Săn Dị Bảo Xuất Thế & Ngắt Bế Quan",
      d: "06/11/2026",
      now: false,
      pts: [
        "<b>Tự Động Ngắt Bế Quan Đi Săn Dị Bảo Xuất Thế:</b> Khắc phục triệt để lỗi khi có thông báo Linh Bảo / Dị Bảo xuất thế nhưng Auto vẫn tiếp tục bế quan; tích hợp cơ chế <code>sanMoiDiBaoXuatThe</code> (mặc định bật) lập tức ưu tiên đoạt bảo bất kỳ món nào nở trên map.",
        "<b>Đồng Bộ Cảnh Báo Live & Auto Săn Bảo:</b> Tự động liên kết hệ thống phát hiện Live Alert với hàng đợi di chuyển của Auto; tự động đóng banner và dọn dẹp trạng thái chờ bế quan khi chuyển sang pha di chuyển/truyền tống tới vị trí Dị Bảo.",
        "<b>Tối Ưu Nhịp Bế Quan Khi Chạm Ngưỡng Pity:</b> Khi bảo hiểm Thiên Đạo Bù (Pity) đạt từ 450/500 năm trở lên, Auto tự động giảm bước nhập định về 1 năm để bắt trọn khoảnh khắc Dị Bảo nở với niên hạn tối đa.",
      ],
    },
    {
      t: "Phiên Bản 7.8.3 · Tối Ưu Độ Tương Phản & Hiển Thị Tên Dị Bảo Đã Chọn",
      d: "06/11/2026",
      now: false,
      pts: [
        "<b>Tối Ưu Độ Tương Phản Tên Dị Bảo:</b> Khắc phục triệt để lỗi chữ bị tối/chìm màu đen khi tích chọn trong bộ lọc Auto Săn Dị Bảo; chuyển sang chữ trắng sáng (#ffffff) sắc nét trên nền sáng nhẹ (accent tint) nổi bật.",
        "<b>Hiệu Ứng Trực Quan Mượt Mà:</b> Bổ sung viền phát sáng nhẹ và hiệu ứng chuyển màu êm ái khi tích chọn hoặc chuyển đổi qua các bộ lọc nhanh.",
      ],
    },
    {
      t: "Phiên Bản 7.8.2 · Khắc Phục Lỗi Kẹt Node & Tự Động Kích Hoạt Sự Kiện Dị Bảo",
      d: "06/11/2026",
      now: false,
      pts: [
        "<b>Khắc Phục Đứng Yên Tại Điểm Dị Bảo Xuất Thế:</b> Sửa triệt để lỗi lặp vô tận khi tới nơi dị bảo xuất thế; tích hợp đầy đủ quy trình mở nơi chốn (<code>enterNode</code>) kết hợp kích hoạt sự kiện phủ (<code>chooseActivity / doAction</code>).",
        "<b>Nhận Diện Chuẩn Xác Hoạt Động (Overlay Activity):</b> Tự động truy xuất danh mục hoạt động tại địa danh (<code>placeActivities</code>) để mở chính xác sự kiện Dị Bảo và tiến vào khảo nghiệm / khiêu chiến Hộ Vệ ngay lập tức.",
        "<b>Hoàn Tất Thu Hoạch & Cập Nhật Tiến Trình:</b> Tự động đóng sự kiện khi hoàn tất, ghi nhận số lượng Dị Bảo đoạt được vào tiến trình và bảo toàn tính mạng người chơi.",
      ],
    },
    {
      t: "Phiên Bản 7.8.1 · Nút Săn Nhanh Dị Bảo & Điều Hướng Auto",
      d: "06/11/2026",
      now: false,
      pts: [
        "<b>Nút [🎯 Săn Món Này] Bên Cạnh [Đi Đến Đón Đầu]:</b> Bổ sung nút Săn nhanh trực tiếp bên cạnh nút đón đầu / di chuyển trên từng thẻ Dị Bảo tại Tab Dị Bảo (<code>db</code>) và danh sách gợi ý cắm trại đón đầu.",
        "<b>Tự Động Chọn Mục Tiêu & Chuyển Tab 1 Chạm:</b> Nhấn nút sẽ tự động đưa duy nhất món Dị Bảo đó vào danh sách săn của Auto Săn Dị Bảo, lưu cấu hình, chuyển ngay sang tab Auto và cuộn sáng (highlight) bảo vật đã chọn.",
      ],
    },
    {
      t: "Phiên Bản 7.8.0 · Ra Mắt Chức Năng Chọn Bảo Vật Muốn Săn & Cắm Trại Đích Danh",
      d: "06/11/2026",
      now: false,
      pts: [
        "<b>Ra Mắt Bộ Chọn Bảo Vật Muốn Săn (Target Relic Selector):</b> Bổ sung danh sách chọn bảo vật chi tiết trong cấu hình Auto Săn Dị Bảo (asdb). Bạn có thể chủ động tích chọn từng món Dị Bảo cụ thể muốn săn; Auto sẽ chỉ tập trung dò tìm, di chuyển và đoạt các Dị Bảo nằm trong danh sách này.",
        "<b>Thao Tác 1 Chạm Với 4 Nút Chọn Nhanh:</b> Trang bị sẵn các bộ lọc nhanh thông minh: <code>[✓ Tất Cả]</code> (săn toàn bộ 19 Dị Bảo), <code>[✕ Bỏ Hết]</code>, <code>[⭐ 12 Món Hồn]</code> (chỉ săn các món Theo Hồn Qua Kiếp - Bất Diệt), và <code>[📦 Chỉ Chưa Có]</code> (tự động nhận diện túi đồ/kinh mạch để chỉ săn những món nhân vật kiếp này chưa sở hữu).",
        "<b>Cắm Trại & Pity Hướng Mục Tiêu:</b> Thuật toán bảo hiểm Thiên Đạo Bù Dị Bảo (Pity 500 năm) và Radar cắm trại đón đầu giờ đây ưu tiên tính toán trực tiếp trên các Dị Bảo bạn đã chọn (ví dụ: chỉ chọn Bất Chiết Kiếm thì hệ thống sẽ đón đầu tại Kiếm Trạch).",
        "<b>Bật/Tắt Săn Ngay Tại Tab Dị Bảo:</b> Tích hợp nút bấm trực quan <code>[🎯 Săn / ○ Bỏ qua]</code> trên từng thẻ Dị Bảo tại tab Dị Bảo (<code>db</code>), cho phép tinh chỉnh danh sách săn tức thì trong lúc tra cứu.",
      ],
    },
    {
      t: "Phiên Bản 7.7.3 · Sửa Lỗi Nhập Định Encounter & Tự Động Bế Quan Chờ Dị Bảo",
      d: "06/11/2026",
      now: false,
      pts: [
        "<b>Sửa Triệt Để Lỗi 'Encounter không ở trạng thái chờ':</b> Chuẩn hóa quy trình bế quan tự động trong cả Auto Săn Dị Bảo lẫn Auto Tu Luyện. Hệ thống giờ đây luôn chủ động kích hoạt trạng thái chuẩn bị bế quan (<code>g.beQuan()</code>) trước khi thực hiện nhập định (<code>g.nhapDinh()</code>), đồng thời tự động đóng popup kết quả (<code>g.closeEncounter()</code>) ngay sau khi kỳ bế quan hoàn tất.",
        "<b>Vận Hành Trơn Tru Với Thiên Đạo Bù Dị Bảo (Pity):</b> Khi đã chạm hoặc vượt mốc Pity 500 năm, chỉ cần trôi qua 1 nhịp bế quan (1-2 năm), Dị Bảo chắc chắn 100% sẽ xuất hiện trên bản đồ thế giới; Auto sẽ ngay lập tức phát hiện và tự động bay/truyền tống tới vị trí sự kiện để đoạt bảo mà không gặp bất kỳ trở ngại nào.",
      ],
    },
    {
      t: "Phiên Bản 7.7.2 · Đại Tu Động Cơ Auto Săn Dị Bảo, Bế Quan Trôi Năm & Đồng Bộ Tab Dị Bảo",
      d: "06/11/2026",
      now: false,
      pts: [
        "<b>Sửa Triệt Để Lỗi Auto Không Hoạt Động Khi Chờ Dị Bảo:</b> Khắc phục lỗi dừng khựng hoặc kẹt di chuyển khi cắm trại tại các địa danh hoang dã/di tích không có tĩnh thất bế quan (như Kiếm Trạch, U Hồn Điện); Auto giờ đây tự động nhận diện linh khí và chọn nơi bế quan an toàn gần nhất để trôi thời gian (1-2 năm/nhịp), vừa tăng tu vi vừa đẩy Pity Dị Bảo lên cực đại.",
        "<b>Tự Động Xuất Phát Đoạt Bảo Ngay Khi Dị Bảo Nở:</b> Ngay khi có bất kỳ Dị Bảo nào xuất hiện trên thế giới trong lúc bế quan, Auto tự động ngắt bế quan, lập tức truyền tống hoặc ngự kiếm tới node sự kiện để đoạt bảo.",
        "<b>Đồng Bộ Trực Tiếp Trạng Thái Lên Tab Dị Bảo:</b> Nút [▶ Bắt Đầu Săn / ⏹ Dừng Auto] và thông điệp trạng thái tại tab Dị Bảo giờ đây được cập nhật thời gian thực qua engine vẽ (auPaint), hiển thị rõ ràng từng hành động và lý do nếu dừng.",
        "<b>Mở Khóa Siêu AI Tác Chiến Khi Giáp Mặt Hộ Vệ:</b> Cho phép Tự Đánh AI vào thẳng giao chiến kể cả khi dự đoán ban đầu chưa chắc thắng, giải phóng toàn diện sức mạnh của Siêu AI Tác Chiến VIP để hạ gục Hộ Vệ Hóa Thần đoạt bảo.",
      ],
    },
    {
      t: "Phiên Bản 7.7.1 · Sửa Lỗi Hiển Thị Xác Suất Cắm Trại Dị Bảo (Fix NaN%)",
      d: "06/11/2026",
      now: false,
      pts: [
        "<b>Sửa Triệt Để Lỗi Hiển Thị Xác Suất NaN%:</b> Bổ sung công thức tính trọng số xuất hiện thực tế (<code>w</code>) và hệ số nhân (<code>mult</code>) cho từng sự kiện theo chuẩn cơ chế Thiên Đạo Bù Dị Bảo (Pity 500 năm), khắc phục hoàn toàn lỗi hiển thị <code>xác suất NaN%</code> khi quét điểm cắm trại.",
        "<b>Hiển Thị Trực Quan Tiến Trình Chờ & Tỉ Lệ Nổ:</b> Bổ sung chi tiết số năm tích lũy và hệ số nhân trọng số (ví dụ: đã tích lũy 120 năm · trọng số ×5.8), đồng thời tự động đánh dấu mốc 100% 🔥 CHẮC CHẮN NỔ khi vượt ngưỡng bảo hiểm 500 năm.",
      ],
    },
    {
      t: "Phiên Bản 7.7.0 · Auto Săn Dị Bảo & Tinh Gọn Trung Tâm Dị Bảo",
      d: "06/11/2026",
      now: false,
      pts: [
        "<b>Xóa Tab Dò Đồ Quý Bị Thừa (Tinh Gọn Menu Tra Cứu):</b> Loại bỏ hoàn toàn tab Dò Đồ Quý (<code>do</code>) trùng lặp, quy tụ về một tab Dị Bảo (<code>db</code>) toàn diện duy nhất; tự động chuyển hướng người dùng tab cũ sang tab Dị Bảo.",
        "<b>Ra Mắt Tính Năng Auto Săn Dị Bảo (asdb):</b> Tự động quét toàn bộ 21 Dị Bảo Nghịch Thiên (Cấp 8) trên thế giới. Tự động dùng Trận/Phù Truyền Tống (0 năm tuổi thọ) hoặc bay thẳng tới tọa độ mục tiêu, tiến vào sự kiện, vượt qua bài kiểm định và giao chiến với Hộ Vệ bằng Siêu AI Tác Chiến VIP để đoạt bảo (+5 điểm Luân Hồi/món).",
        "<b>Cơ Chế Cắm Trại Đón Đầu & Bế Quan Chờ Dị Bảo (Pity Hunter):</b> Khi chưa có Dị Bảo nở trên bản đồ, Auto thông minh di chuyển tới vị trí cắm trại đón đầu tối ưu theo hệ thống Thiên Đạo Bù Dị Bảo (Pity 500 năm), tự động bế quan từng đợt ngắn để tích lũy tu vi đồng thời đẩy trọng số nổ Dị Bảo lên cực đại; lập tức ngắt bế quan để đoạt bảo ngay khi sự kiện xuất hiện.",
        "<b>Tích Hợp Điều Khiển Trực Quan Trong Tab Dị Bảo:</b> Bổ sung hộp điều khiển nhanh [▶ Bắt Đầu Auto Săn Dị Bảo] ngay trên giao diện tab Dị Bảo, hiển thị trạng thái và cẩm nang tức thì, đồng bộ cảnh báo âm thanh và bảng điều khiển trung tâm.",
      ],
    },
    {
      t: "Phiên Bản 7.6.1 · Tối Ưu Nhịp Đánh Trực Quan, Khắc Phục Bỏ Chiêu & Tự Động Hồi Linh Lực",
      d: "06/11/2026",
      now: false,
      pts: [
        "<b>Khắc Phục Triệt Để Bỏ Chiêu & Kết Lượt Sớm:</b> Bổ sung hỗ trợ đầy đủ các hệ chiêu thức dạng Khiên Hộ Thuẫn (<code>thu</code>), Trị Liệu Hồi Máu (<code>hoi_phuc</code>), Khống Chế (<code>khong_che</code>) thay vì chỉ lọc chiêu công như trước, kèm cơ chế xả vét toàn bộ kỹ năng khả dụng trước khi chuyển lượt.",
        "<b>Tự Động Bơm Đan Linh Lực Khi Thiếu Mana:</b> Tự phát hiện kỹ năng chưa hồi chiêu nhưng bị kẹt do thiếu linh lực để ưu tiên cắn ngay Đan Linh Lực trong lượt và tiếp tục xả chiêu.",
        "<b>Nhịp Đánh Trực Quan (Visual Combat Pacing - Delay 200ms):</b> Tách biệt các hành động chiến đấu trực tiếp trên màn hình theo từng nhịp 200ms, giúp engine đồ họa Pixi.js kịp vẽ hoạt ảnh quyền cước, hiệu ứng chiêu và số nhảy sát thương.",
        "<b>Bảo Đảm Luôn Tung Quyền Cước (danh_thuong):</b> Tuyệt đối không kết thúc lượt khi chưa tung đòn đánh thường miễn phí nếu quái đối thủ vẫn còn sống.",
        '<b>Đồng Bộ Cấu Hình Nút Tự Của Game:</b> Tự động ghi đè kích hoạt đan dược và bùa chú vào <code>localStorage["tu-tien:combat-automation"]</code> để nút Tự mặc định của game không bị lỏ.',
      ],
    },
    {
      t: "Phiên Bản 7.6.0 · Đại Tu Siêu AI Tác Chiến: Sửa Lỗi Đan Dược, Khôi Phục Quyền Cước & Tác Chiến Hoàn Hảo",
      d: "06/11/2026",
      now: false,
      pts: [
        "<b>Sửa Triệt Để Lỗi Không Dùng Đan Dược (dan_duoc):</b> Bóc tách trực tiếp mã nguồn game mới nhất, thay thế hoàn toàn bộ lọc regex cũ bằng thuộc tính chuẩn xác của lõi game (<code>it.tran.khi_huyet</code> cho đan hồi máu, <code>it.tran.linh_luc</code> cho đan hồi mana, <code>it.tran.bao_phat</code> cho đan tăng sát thương). Kết nối trực tiếp vào các hàm lõi <code>estimatePillRestore</code>, <code>chanDungDo</code>, và <code>pillWasted</code>.",
        "<b>Tính Đúng Cơ Chế Dược Kháng & Nuốt Nhiều Viên (so: n):</b> Sửa công thức dược kháng lũy thừa thực tế <code>(1 - retention^exp) * 100%</code> thay vì so sánh nhầm số mũ với %, đồng thời tự động vượt trần kháng đan khi máu nguy kịch (&lt; 20%) để bảo toàn tính mạng. Tự động tính toán lượng máu thiếu để nuốt đúng số lượng viên cần thiết (<code>so: n</code>) giúp hồi phục thần tốc trong 1 lượt.",
        '<b>Khôi Phục Triệt Để Quyền Cước (danh_thuong):</b> Sửa lỗi nghiêm trọng khiến quyền cước bị bỏ quên: sửa cơ chế chọn mục tiêu tự động chuyển sang quái sống khi mục tiêu hiện tại ngã xuống (loại bỏ lỗi "Không còn ai để nhắm" làm ngắt lượt); dệt đòn đánh thường miễn phí 0 linh lực vào đúng thời điểm sau khi buff bộc phát; tích hợp cơ chế <b>Quyền Cước Dứt Điểm</b> (kết liễu ngay quái yếu máu bằng đánh thường để tiết kiệm 100% linh lực và bảo lưu chiêu thức lớn).',
        '<b>Sửa Lỗi Nút [Đánh 1 Đòn] Trên Thanh Nổi:</b> Nút "Đánh 1 Đòn" giờ đây thực hiện chuẩn xác đúng 1 hành động duy nhất (thay vì xả hết 8 hành động kết lượt như trước), giúp người chơi theo dõi từng nhịp xoay tua kỹ năng trực quan.',
        "<b>Bổ Sung Cấu Hình Tự Nuốt Đan Hồi Linh Lực & Bộc Phát:</b> Bổ sung tùy chọn ngưỡng linh lực tự cắn đan hồi mana (mặc định 20% hoặc khi &lt; 6 linh lực không đủ ra chiêu) và tự động dùng đan bộc phát x1.5-x2 sát thương khi giáp mặt Boss / Quái Tinh Anh, mở rộng phẩm cấp đan/phù tối đa lên Phẩm 8 (Nghịch Thiên).",
      ],
    },
    {
      t: "Phiên Bản 7.5.0 · Đại Tu Hướng Build & Tối Ưu Hóa Kinh Mạch Toàn Diện",
      d: "06/11/2026",
      now: false,
      pts: [
        "<b>Phân Tích Tương Thích Ngũ Hành & Thể Chất Sâu Sắc (Hệ Thống Rank S/A/B/C/D):</b> Đánh giá toàn diện độ tương thích của từng hướng build dựa trên Linh Căn bản mệnh, Ngũ Hành Tương Sinh (Mẹ Dưỡng +15% / Con Trợ), Tương Khắc nghịch hệ (-15%), Thể Chất đắc đạo và phản phệ tà công, cùng số lượng trang bị phẩm cao/trấn phái đang có trong túi để xếp hạng trực quan.",
        "<b>Hệ Thống 6 Meta Presets (Lối Chơi Tiên Tu 1-Chạm):</b> Trang bị bộ cấu hình nhanh cho mọi phong cách: ⚡ Bạo Sát Thần Tốc (dồn uy lực, phá giáp, bộc phát DPS), 🛡️ Bất Hoại Hộ Thể (dày khiên, khí huyết, hồi máu trường sinh), 🚀 Tốc Tu Đột Phá (tối đa tốc độ tu luyện, đột phá và kháng tâm ma), ❄️ Khống Chế Phong Tỏa (đóng băng, choáng, khóa lượt địch), 🩸 Ma Đạo Hút Huyết (tối đa ma niệm và hút máu), và 🎯 Tự Do. Tự động tinh chỉnh tỉ lệ ô và trọng số đánh giá món.",
        "<b>Lộ Trình Thu Thập & Săn Tìm Món Còn Thiếu Chi Tiết:</b> Tự động phát hiện các món chưa có trong túi của build mục tiêu và bóc tách cụ thể: Quái/Boss rơi (kèm cảnh giới, thứ bậc & % tỉ lệ), Tàng Kinh Các tông môn, Cửa hàng/Chợ rẻ nhất, Công thức luyện chế, cùng nút <code>[🔍 Tra Cứu]</code> nhảy thẳng sang tab Vật Phẩm xem chi tiết chỉ trong 1 cú click.",
        '<b>Giải Pháp Chuyển Tiếp "Tự Động Lấy Đồ Trong Túi Thay Thế & Áp Dụng Ngay":</b> Giải tỏa hoàn toàn nút thắt thiếu đồ: chỉ với 1 click, Tool tự động chọn những món bổ trợ cùng hệ tốt nhất đang có trong túi để lấp đầy ô trống và tạo ngay bộ kinh mạch hợp lệ 100%, cho phép bấm <code>[✅ Áp Dụng Vào Game Ngay]</code> mà không cần chờ farm đủ đồ.',
        "<b>Bảng So Sánh Chỉ Số Trước & Sau Khi Lên Build Mới:</b> Đo lường chính xác hiệu quả so với bộ kinh mạch nhân vật đang mặc: Tỉ lệ thắng 9 trận mẫu quái cùng cảnh giới, Tốc độ tu luyện (+Δ%), Tỉ lệ đột phá (+Δ%), Khí huyết tối đa, Linh lực hồi mỗi lượt, Điểm nghịch tà/khắc hệ, và danh sách các chiêu thức chủ động mới được kích hoạt.",
        '<b>Bổ Sung Cột "Đang Có" Trong Danh Sách Hướng & Nút Sao Chép:</b> Giúp người chơi nắm bắt ngay mình đang sở hữu bao nhiêu món (trên mạch + trong túi) của từng phái, kèm nút <code>[📋 Sao Chép Cách Xếp]</code> JSON nhanh chóng.',
      ],
    },
    {
      t: "Phiên Bản 7.4.0 · Siêu Auto Tác Chiến & Tu Luyện Toàn Năng (Đại Tu Auto Game)",
      d: "06/11/2026",
      now: false,
      pts: [
        "<b>Khắc Phục Hoàn Toàn Chế Độ Auto Lỏ Của Game:</b> Thay thế thuật toán tự đánh ngô nghê của game bằng Siêu AI Tác Chiến VIP: dự báo nộ chiêu của địch để chủ động bật khiên đỡ, quản lý dược kháng thông minh chống lãng phí đan quý khi kháng 100%, tự động giải cứu Ngự Linh khi máu &lt; 25%, và luôn tận dụng Quyền Cước (danh_thuong) miễn phí mỗi lượt giúp tăng vọt 25% DPS.",
        "<b>Nút Nổi Tác Chiến Trực Tiếp Trong Trận ([⚡ Siêu Auto VIP]):</b> Tự động xuất hiện nút điều khiển nổi tinh xảo ngay trên màn hình giao chiến của game. Người chơi chỉ cần bấm 1 chạm để AI đánh thay từng chiêu hoặc tự động đánh liên tục đến khi chiến thắng (áp dụng cho mọi trận: Tháp Vô Nhai Uyên, Đánh Boss Hóa Thần, Lôi Đài, Dị Bảo...).",
        "<b>Bổ Sung Tab Auto Tu Luyện & Đột Phá (atl):</b> Tự động hóa trọn vẹn chu trình tu tiên mà game hoàn toàn thiếu: Bế Quan (Nhập Định) → Tích Lũy Tu Vi → Đột Phá Xung Kích → Trấn Áp Tâm Ma → Lên Cảnh Giới Tiếp Theo (xuyên suốt từ Luyện Khí đến Hóa Thần / Đại Thừa).",
        "<b>Bế Quan Thông Minh & Chọn Điểm Linh Khí Tốt Nhất:</b> Tự tính toán số năm nhập định tối ưu theo lượng tu vi còn thiếu tới Đại Viên Mãn, tự nuốt Đan Tu Luyện và Đan Phá Bình Cảnh, tự di chuyển tới Động Phủ/Tông Môn/Linh Mạch có nồng độ linh khí cao nhất.",
        "<b>Kiểm Soát Đột Phá An Toàn Chống Nổ Đan:</b> Tự quét túi tìm combo đan dược có tỉ lệ thành công cao nhất, kiểm tra ngưỡng an toàn người chơi đặt (mặc định &ge; 65%) trước khi xung kích để chống tụt tu vi; tự động kích hoạt Siêu AI hạ gục Tâm Ma khi kiếp nạn phát sinh.",
        "<b>Tab Cấu Hình Tác Chiến Chuyên Sâu (atc):</b> Tùy biến chi tiết ngưỡng máu cắn đan, trần dược kháng, giới hạn phẩm cấp phù/đan, chế độ tự động vào trận, và thứ tự combo kỹ năng tối ưu.",
      ],
    },
    {
      t: "Phiên Bản 7.3.0 · Trung Tâm Dị Bảo Toàn Diện & Bảo Lục Luân Hồi",
      d: "06/11/2026",
      now: false,
      pts: [
        "<b>Nâng Cấp Tab Dị Bảo Toàn Diện:</b> Chuyển hóa toàn diện tab Dị Bảo thành Trung Tâm Săn Bảo & Bảo Lục Nghịch Thiên (Cấp 8) hiện đại, thống kê chi tiết tiến độ Bảo Lục Luân Hồi (+5 điểm luân hồi/món), danh mục 12 món Theo Hồn Qua Kiếp (Bất Diệt) và 9 món Dùng Trong Kiếp.",
        "<b>Thanh Đo Bảo Hiểm Pity (Thiên Đạo Bù Dị Bảo):</b> Theo dõi chính xác số năm tích lũy chờ Dị Bảo / 500 năm, hệ số nhân trọng số xuất hiện ×(1 + năm / 25) và báo động đỏ tức thì khi đạt mốc bảo hiểm chắc chắn nổ 100% lượt kế; kèm gợi ý Top Điểm Cắm Trại Đón Đầu tối ưu.",
        "<b>Giả Lập Chiến Đấu Ảo Hộ Vệ (Combat Sim):</b> Sử dụng trực tiếp engine chiến đấu thực tế để thử sức với Hộ Vệ sự kiện qua 4 tiểu cảnh giới, tính toán % Tỉ lệ thắng và % Máu còn lại để người chơi an tâm đoạt bảo hoặc kịp thời tránh rủi ro mất mạng.",
        "<b>Trợ Lý Bù Điểm Kiểm Định (Stat Gap Closer):</b> Với các sự kiện kiểm định (Thần thức, Đạo tâm, Ngộ tính...), tự động quét túi đồ để chỉ ra trang bị/vật phẩm có sẵn giúp bù điểm, đồng thời gợi ý Top đan dược nên cắn để đạt chuẩn nhận Dị Bảo 100% không cần đánh nhau.",
        "<b>Di Chuyển Thông Minh (Ưu Tiên Truyền Tống Trận/Phù):</b> Bổ sung nút <code>[⚡ Truyền Tống Ngay]</code> tự động kích hoạt Trận Truyền Tống hoặc Phù Truyền Tống tới thẳng tọa độ mục tiêu (0 năm tuổi thọ), cảnh báo khi đi bộ tốn nhiều năm hơn hạn còn lại của sự kiện.",
        "<b>Chuông Báo Âm Thanh & Tự Động Tạm Dừng (Emergency Auto-Pause):</b> Tích hợp chuông báo Web Audio du dương khi có Dị Bảo mới nở trên bản đồ, đồng thời tự động phanh ngắt các vòng lặp Auto (Auto Săn, Auto Buôn...) để người chơi không bị trôi năm lỡ mất bảo vật.",
        "<b>Món Dẫn Hồn Đặc Biệt (Độ Hồn Linh):</b> Đánh dấu và giải thích rõ đặc quyền của Độ Hồn Linh: luôn tự động theo hồn qua mọi kiếp mà hoàn toàn không tốn ô bến đò chọn mang đồ.",
      ],
    },
    {
      t: "Phiên Bản 7.2.0 · Biệt Đội Late Game Tối Ưu Toàn Diện Theo Linh Căn Hiện Tại",
      d: "06/11/2026",
      now: false,
      pts: [
        "<b>Tự Động Quét Theo Linh Căn Của Kiếp Đang Chơi:</b> Nhận diện chính xác 100% Linh Căn hiện tại của nhân vật (Đơn Linh Căn, Song Linh Căn, Tam/Tứ/Ngũ Linh Căn, Dị Linh Căn Lôi/Phong/Băng/Ám hay Phàm Căn) để quét toàn bộ kho dữ liệu game, không còn bị bó hẹp trong hệ Kim - Thổ.",
        "<b>Phân Tích Tương Sinh & Khóa Chặt Tương Khắc Mọi Hệ:</b> Tự động suy diễn hệ Bản Mệnh, các hệ Tương Sinh hỗ trợ (Mẹ dưỡng & Con trợ) cùng các nhánh dị căn tương ứng; đồng thời khóa chặt và loại trừ triệt để các hệ tương khắc để đảm bảo ma trận đạt 0 điểm nghịch hệ.",
        "<b>Thuật Toán Tham Lam Tẩy Tủy Thông Minh (bisGreedy):</b> Khởi tạo thế cờ trực tiếp từ Đan Điền qua hệ thống tâm pháp chuẩn tẩy tủy, đảm bảo mạch nối thông suốt 100% trước khi đưa vào giải thuật luyện kim mô phỏng (Simulated Annealing) và leo đồi (Hill Climbing).",
        "<b>Cân Bằng Tâm Pháp & Thần Binh Trong Pool:</b> Tự động tuyển chọn cân đối giữa top Công Pháp dẫn truyền linh lực và top Pháp Khí xuất chiêu uy lực của đúng hệ Linh Căn, tối ưu hóa toàn diện cho cả 3 chế độ: Thuần Sát Thương, Tu Luyện & Bứt Tốc, và Công Thủ Toàn Diện.",
        "<b>Cảnh Báo Lệch Linh Căn Khi Sang Kiếp Mới:</b> Tự động phát hiện khi người chơi chuyển kiếp hoặc đổi Linh Căn khác so với kết quả cũ, hiển thị cảnh báo trực quan để người chơi dễ dàng bấm tính toán lại.",
      ],
    },
    {
      t: "Phiên Bản 7.1.8 · Ghi Nhận Số Trận & Dừng Đúng Hạn Khi Tự Tốc Chiến",
      d: "06/11/2026",
      now: false,
      pts: [
        "<b>Ghi nhận chuẩn xác mọi trận đấu:</b> Khi tính năng Tự Tốc Chiến trong game được kích hoạt, game tự động giải quyết trận đấu ngay trong lựa chọn mà không mở màn hình giao chiến. Auto Săn Yêu phiên bản 7.1.8 đã theo dõi và ghi nhận đầy đủ số trận thắng này vào bộ đếm trận.",
        '<b>Sửa lỗi hiển thị "Số Trận Đã Đánh: 0 (thắng 0)":</b> Khắc phục triệt để hiện tượng đã đánh qua rất nhiều quái nhưng số trận đã đánh vẫn kẹt ở 0.',
        '<b>Chuẩn hóa điều kiện dừng theo số trận:</b> Cài đặt "Dừng sau số trận" giờ đây hoạt động chính xác tuyệt đối ngay cả khi game bật tính năng Tự Tốc Chiến.',
        "<b>Mở rộng hỗ trợ săn theo mục tiêu:</b> Tự động nhận diện thêm các sự kiện săn quái chỉ định (Truy tìm yêu thú, Truy tìm đầu đàn) khi đi săn.",
      ],
    },
    {
      t: "Phiên Bản 7.1.7 · Tự Đánh AI Khi Game Khóa Tốc Chiến",
      d: "06/11/2026",
      now: false,
      pts: [
        "<b>Tự động đánh AI khi không được Tốc Chiến:</b> Khi gặp quái Tinh Anh, Boss hoặc máu có lúc dưới 60% khiến game khóa nút Tốc Chiến (dù trận dự đoán thắng), Auto Săn Yêu sẽ tự động vào Giao Chiến và kích hoạt cơ chế AI đánh trận của game tới khi chiến thắng, không bị dừng đột ngột.",
        "<b>Tùy chọn linh hoạt trong Cấu Hình:</b> Bổ sung ô chọn <code>[x] Tự Đánh AI Khi Không Cho Tốc Chiến (Trận Thắng)</code> trong tab Tự Động → Săn Yêu (mặc định bật).",
        "<b>Khắc phục nhận diện trạng thái trận (Anti-Stuck):</b> Cập nhật chữ ký trạng thái trận đấu theo từng hiệp/máu/RNG để Auto không bị báo nhầm “trạng thái game đứng yên” khi giao tranh kéo dài nhiều hiệp.",
      ],
    },
    {
      t: "Phiên Bản 7.1.6 · Đồng Bộ Số Phiên Bản Trên Thanh Tiêu Đề",
      d: "06/11/2026",
      now: false,
      pts: [
        "<b>Khắc phục số phiên bản hiển thị sai trên tiêu đề:</b> Chuyển đổi nhãn phiên bản tĩnh (<code>v7.0.0</code>) trên thanh tiêu đề chính thành biến động <code>v' + TOOL_VER + '</code>, đảm bảo tiêu đề cửa sổ luôn luôn hiển thị chuẩn xác số phiên bản hiện hành của Tool.",
      ],
    },
    {
      t: "Phiên Bản 7.1.5 · Khóa Chặt Hệ Vật Phẩm Chuẩn Linh Căn (Loại Bỏ Đồ Lạc Hệ)",
      d: "06/11/2026",
      now: false,
      pts: [
        "<b>Lọc nghiêm ngặt theo hệ chính của vật phẩm:</b> Mọi công pháp và pháp khí được đề xuất bắt buộc phải có hệ chính trùng khớp với hệ Linh Căn cho phép của nhân vật hoặc Vô Sắc; loại bỏ triệt để các món lạc hệ (như đồ Thủy, Lôi, Ám khi nhân vật là Thổ - Kim).",
        "<b>Cách ly túi đồ thực tế khỏi bộ giải giả định:</b> Không tự động nạp các món đồ đang có trong túi thực tế vào kho tính toán giả định nếu chúng không thuộc pool trang bị chuẩn theo hệ của kiếp này.",
      ],
    },
    {
      t: "Phiên Bản 7.1.4 · Chuẩn Hóa Nhãn Vô Sắc & Tối Ưu Hiển Thị Linh Căn",
      d: "06/11/2026",
      now: false,
      pts: [
        '<b>Loại bỏ nhãn mã hóa thừa "vo":</b> Chuẩn hóa định danh nội bộ <code>vo</code> thành <code>vo_sac</code> (Vô Sắc), loại bỏ nhãn "vo" dư thừa gây thắc mắc trên giao diện.',
        "<b>Hiển thị rõ ràng chuỗi tương sinh:</b> Nhận diện chính xác Song Linh Căn kề nhau và báo rõ <code>Đã tương sinh trực tiếp (Thổ ➔ Kim) — Không cần cầu nối ✓</code>.",
        "<b>Việt hóa phẩm chất Linh Căn:</b> Hiển thị chuẩn xác tên gọi phẩm linh căn (Song Linh Căn, Đơn Linh Căn, Thiên Linh Căn...) thay vì mã rút gọn tiếng Anh.",
      ],
    },
    {
      t: "Phiên Bản 7.1.3 · Chuẩn Hóa Chuỗi Tương Sinh Theo Linh Căn & Khắc Phục Lệch Hệ",
      d: "06/11/2026",
      now: false,
      pts: [
        "<b>Sửa triệt để lỗi thêm hệ lệch (Thổ - Kim không bị gợi ý Thủy):</b> Khi các hệ trong Linh Căn đã kề nhau trực tiếp trong chuỗi tương sinh (như Thổ sinh Kim, Kim sinh Thủy...), hệ thống cố định chỉ chọn các vật phẩm đúng hệ của bạn (+ Vô Sắc), tuyệt đối không suy diễn thêm hệ thứ ba (tránh xung khắc như Thổ khắc Thủy).",
        "<b>Chỉ sinh cầu nối khi thật sự có khoảng trống:</b> Chỉ kích hoạt hệ cầu nối khi 2 hệ cách nhau đúng 1 bước trung gian (ví dụ Kim và Mộc cần Thủy làm cầu nối <code>Kim ➔ Thủy ➔ Mộc</code>).",
        "<b>Đếm chính xác số ô kinh mạch theo khuôn Thể Chất:</b> Khử trùng lặp ô khi tính kế hoạch tẩy tủy, hiển thị chuẩn xác số ô thực tế cần chuyển màu theo khuôn Thể Chất của từng nhân vật.",
      ],
    },
    {
      t: "Phiên Bản 7.1.2 · Khắc Phục Hiển Thị Sơ Đồ Ma Trận Kinh Mạch Late Game",
      d: "06/11/2026",
      now: false,
      pts: [
        "<b>Khắc phục lỗi hiển thị sơ đồ lưới (setting maxWidth):</b> Điều chỉnh cơ chế kết xuất sơ đồ kinh mạch (<code>drawGrid</code>) sang định dạng HTML hình ảnh chuẩn của Tool, khắc phục hoàn toàn lỗi không thể vẽ lưới.",
        "<b>Hiển thị trực quan kinh mạch & bảng chú giải:</b> Kết xuất sắc nét toàn bộ các ô kinh mạch, màu hệ linh căn chuẩn tẩy tủy, huyệt vị, đan điền, đường kinh lộ sáng và bảng ghi chú màu sắc từng mảnh ghép.",
      ],
    },
    {
      t: "Phiên Bản 7.1.1 · Khắc Phục Lỗi Tính Toán Ma Trận Kinh Mạch Late Game",
      d: "06/11/2026",
      now: false,
      pts: [
        "<b>Khắc phục lỗi manh.map is not a function:</b> Chuẩn hóa đa định dạng đầu vào cho hàm lượng giá kinh mạch giả định (<code>makeBisEval</code>), tiếp nhận linh hoạt cả đối tượng kết quả tối ưu <code>{ manh: [...] }</code>, mảng candidate và mảng mảnh ghép thô.",
        "<b>Đồng bộ cấu hình mảnh ghép tối ưu:</b> Trích xuất chính xác danh sách mảnh sau bước tinh chỉnh leo đồi cuối cùng (Hill Climbing Polish) để kết xuất mượt mà lên Sơ đồ ma trận kinh mạch canvas và bảng Cẩm nang săn đồ.",
      ],
    },
    {
      t: "Phiên Bản 7.1.0 · Biệt Đội Late Game & Cẩm Nang Săn Đồ Tối Thượng",
      d: "06/11/2026",
      now: false,
      pts: [
        "<b>Biệt Đội Late Game · Kinh Mạch Tối Thượng (Tab Mới trong Nhóm Tự Động):</b> Dành riêng cho người chơi late game (Hóa Thần 44 ô, Nguyên Anh 36 ô, Kim Đan 28 ô) muốn tìm cấu hình trang bị Best-in-Slot (BIS) hoàn hảo nhất.",
        "<b>Phân Tích Linh Căn & Tương Sinh Tự Động:</b> Tự động đọc Linh Căn kiếp này, tự suy diễn chuỗi Ngũ Hành Tương Sinh & hệ cầu nối trực tiếp (ví dụ Song Linh Căn Kim - Mộc ➔ tự động suy diễn chuỗi liên hoàn Kim ➔ Thủy ➔ Mộc, kèm toàn bộ hệ biến dị Băng, Lôi, Phong, Ám và Vô Sắc).",
        "<b>Giả Định Full Lượt Tẩy Tủy Toàn Bộ Ô:</b> Giả định người chơi đã thông toàn bộ lưới kinh mạch và có đủ Tẩy Tủy Đan / Cải Mệnh Đan để tẩy màu mọi ô dưới từng mảnh ghép trùng khít 100% với hệ của món đồ đó, triệt tiêu hoàn toàn điểm nghịch hệ (diemNghich = 0, ô hợp hệ = 1.0).",
        "<b>3 Case Chiến Thuật Chuyên Biệt:</b> Hỗ trợ tính toán theo 3 mục tiêu chiến lược: ⚔️ Thuần Sát Thương (DPS Tối Đa), 🛡️ Công Thủ Toàn Diện (Cân Bằng Sinh Tồn & Khống Chế), và 🚀 Tu Luyện & Bứt Tốc (Tốc Độ Tu Vi & Đột Phá).",
        "<b>Lập Kế Hoạch Tẩy Tủy Ô:</b> Thống kê chính xác số lượng ô cần chuyển màu sang từng hệ (ví dụ: cần 14 ô Kim, 12 ô Thủy, 18 ô Mộc) để người chơi dễ dàng chuẩn bị nguyên liệu.",
        "<b>Cẩm Nang Săn Đồ & Hướng Dẫn Thu Thập Chi Tiết:</b> Đánh dấu trực quan món đã sở hữu (✓) hay cần săn (⚠️), chỉ rõ nơi săn từng món: Boss/quái rơi kèm tỉ lệ, tiệm bán kèm giá, sự kiện Dị Bảo thế giới kèm điều kiện kiểm định & hộ vệ, hoặc công thức luyện chế; tích hợp nút <code>[🔍 Tra Cứu]</code> nhảy thẳng vào chi tiết và nút <code>[📋 Copy Danh Sách Săn Đồ]</code> tiện lợi.",
      ],
    },
    {
      t: "Phiên Bản 7.0.9 · Nhận Diện Đón Đầu Đa Vị Trí & Tích Hợp YAML Gốc",
      d: "06/11/2026",
      now: false,
      pts: [
        "<b>Nhận diện đón đầu thông minh (Đa Slot / Cùng Địa Danh):</b> Khắc phục triệt để tình trạng người chơi đã di chuyển đến đúng địa danh (như Kiếm Trạch, Hồn Tháp...) nhưng giao diện vẫn hiện nút di chuyển do sai lệch chỉ số ô phụ. Hệ thống nay kiểm tra toàn diện cả <code>viTri</code>, <code>oNoi</code>, thông tin vùng đất <code>W.info</code> và định danh địa danh <code>W.diaDanh</code> để xác nhận tức thì trạng thái <code>[📍 Đang đứng đón đầu tại ... (Slot ...) ✓]</code>.",
        "<b>Tự động làm mới theo thời gian thực (Real-time Sync):</b> Tự động lắng nghe mọi sự kiện di chuyển và chuyển nhịp trong game (<code>travel</code>, <code>timePass</code>, <code>worldEvent</code>, <code>encounterEnd</code>) để lập tức làm mới trạng thái radar Dò Đồ Quý mà không cần phải chuyển tab thủ công.",
        "<b>Tích hợp Copy YAML Gốc (tuTien.yaml):</b> Bổ sung nút <code>[📋 Copy YAML Gốc]</code> tại từng thẻ tra cứu Vật Phẩm và Quái Vật, cho phép sao chép nhanh định dạng YAML chuẩn từ game để phục vụ viết Mod hoặc tra cứu chi tiết.",
        "<b>Cập nhật thuật ngữ Bí Phương & Ghi chú Nhân Mạch:</b> Đổi định danh Đơn Phương thành <i>Bí Phương (Đơn Phương)</i> chuẩn theo phiên bản mới của game; thêm lưu ý về hiệu ứng dược kháng khi tặng đan dược tăng tu vi / thọ nguyên cho NPC (hệ số 0.75).",
      ],
    },
    {
      t: "Phiên Bản 7.0.8 · Khắc Phục Nút Đi Đến Đón Đầu & Bay Đến",
      d: "05/11/2026",
      now: false,
      pts: [
        "<b>Khắc phục nút [📍 Đi Đến Đón Đầu] & [🚀 Bay Đến Ngay]:</b> Sửa triệt để lỗi nút bấm không phản hồi do sai định dạng kiểu dữ liệu slot (chuỗi vs số) và xung đột modal xác nhận của trình duyệt.",
        "<b>Chuyển động tức thì & Phản hồi trực quan:</b> Bấm [📍 Đi Đến Đón Đầu] hoặc [🚀 Bay Đến Ngay] sẽ thực hiện di chuyển ngay lập tức, nút tự động đổi sang trạng thái [⏳ Đang đi...] và hiển thị thông báo toast nổi mượt mà.",
        "<b>Tối ưu hóa thuật toán định vị địa danh:</b> Dò tìm chuẩn xác slot thông qua chỉ mục <code>ddBuild</code> và toàn bộ hệ thống slot thế giới của game, hỗ trợ cả khớp chính xác và khớp gần đúng.",
      ],
    },
    {
      t: "Phiên Bản 7.0.7 · Banner Báo Dị Bảo Tức Thì & Đón Đầu Địa Danh",
      d: "05/11/2026",
      now: false,
      pts: [
        "<b>Banner Thông Báo Nổi Tức Thì (Global Floating Alert):</b> Tự động quét và phát hiện ngay lập tức khi có sự kiện Dị Bảo vừa xuất hiện trên bản đồ thế giới. Hiển thị thanh thông báo nổi kèm nút [🚀 Bay Đến Ngay] trực tiếp trên màn hình game mà không cần phải mở cửa sổ Trợ Lý!",
        "<b>Nút [📍 Đi Đến Đón Đầu] Địa Danh:</b> Với các sự kiện sắp diễn ra hoặc đang hồi chiêu, Tool tự động dò tọa độ địa danh cố định (Kiếm Trạch, Tiên Vân Điện, U Hồn Điện...) và cung cấp nút di chuyển để người chơi đến chờ sẵn, gia tăng tối đa tỉ lệ kích hoạt sự kiện.",
        "<b>Tự động cập nhật theo thời gian game:</b> Lắng nghe sự kiện chuyển năm (timePass), di chuyển (travel) và thế cục (worldEvent) của game để đồng bộ hóa radar theo thời gian thực.",
      ],
    },
    {
      t: "Phiên Bản 7.0.6 · Làm Rõ Thử Thách Kép Dò Đồ Quý",
      d: "05/11/2026",
      now: false,
      pts: [
        '<b>Làm rõ nhãn Thử Thách Kép:</b> Đổi câu thông báo thành "Thử thách Kép (Vừa kiểm định chỉ số + Vừa đánh quái hộ vệ)" để người chơi hiểu ngay sự kiện đòi hỏi cả 2 bước.',
        "<b>Hiển thị trực quan chỉ số còn thiếu:</b> Nêu rõ số điểm còn thiếu để người chơi dễ dàng cắn đan dược hoặc trang bị pháp bảo bổ khuyết.",
      ],
    },
    {
      t: "Phiên Bản 7.0.5 · Đánh Giá Tỉ Lệ Đoạt Bảo & Bí Kíp Dị Bảo",
      d: "05/11/2026",
      now: false,
      pts: [
        "<b>Đánh giá khả năng đoạt bảo tự động:</b> Trên từng thẻ Dị Bảo, tự động so sánh cảnh giới và chỉ số của bạn với yêu cầu sự kiện để kết luận: Ăn chắc 100% (đủ chỉ số không cần đánh nhau), Đủ cảnh giới đối đầu, hay Cảnh báo nguy hiểm khi hộ vệ Hóa Thần mạnh hơn.",
        "<b>Phân loại chi tiết hình thức đoạt bảo:</b> Tách bạch rõ 6 Dị Bảo thuần kiểm định chỉ số (không cần đánh nhau) và các Dị Bảo yêu cầu chiến đấu hộ vệ Hóa Thần / Nguyên Anh.",
        '<b>Bổ sung cơ chế "Thiên Đạo Bù Dị Bảo":</b> Giải thích chi tiết hệ thống bảo hiểm (pity) trong game — chờ đủ 500 năm chắc chắn 100% xuất hiện sự kiện Dị Bảo.',
      ],
    },
    {
      t: "Phiên Bản 7.0.4 · Dò Đồ Quý & Auto-Update Tampermonkey",
      d: "05/11/2026",
      now: false,
      pts: [
        "<b>Tab Dò Đồ Quý (Nghịch Thiên Radar):</b> Thêm tab Dò Đồ Quý trong nhóm Tra Cứu, cho phép săn lùng toàn bộ các vật phẩm phẩm cấp cao nhất game: Nghịch Thiên (Phẩm 8 / Dị Bảo) và Thần Phẩm (Phẩm 7).",
        "<b>Radar Bản Đồ Thời Gian Thực:</b> Tự động quét các ô cơ duyên (<code>run.nodes</code>) trên bản đồ thế giới, phát hiện ngay các sự kiện Dị Bảo đang xuất hiện, quái/boss rơi đồ quý, hạn năm còn lại, mức độ nguy hiểm và nút [🚀 Bay Đến Ngay] để dịch chuyển tức thì.",
        "<b>Bộ Lọc & Tra Cứu Đồ Quý Đa Năng:</b> Lọc theo phẩm cấp (Nghịch Thiên 8, Thần Phẩm 7, Tiên Phẩm 6, Tất cả), lọc theo trạng thái (Đang trên map, Đủ điều kiện săn, Đang hồi chiêu 120 năm, Chưa đủ điều kiện, Đã sở hữu), lọc theo loại và tìm kiếm tự do theo từ khóa.",
        "<b>Phân Tích Bài Kiểm Định Chỉ Số:</b> Tự động so sánh chỉ số nhân vật hiện tại với yêu cầu của Dị Bảo (Thần thức, Ngộ tính, Đạo tâm), báo xanh Đạt hoặc báo đỏ Thiếu bao nhiêu điểm để người chơi chuẩn bị.",
        "<b>Hỗ trợ Tự Động Cập Nhật Tampermonkey (<code>@updateURL</code> / <code>@downloadURL</code>):</b> Gắn link GitHub raw chính thức để Tampermonkey tự động phát hiện bản mới và cập nhật khi tác giả push lên GitHub.",
      ],
    },
    {
      t: "Phiên Bản 7.0.3 · Chế Độ Stealth (Không Bị Phát Hiện)",
      d: "05/11/2026",
      now: false,
      pts: [
        "<b>Chế độ Stealth Standalone (Undetected):</b> Không tự động đăng ký vào <code>window.tuTienMods</code> khi chạy qua Tampermonkey. Game hoàn toàn không phát hiện sự tồn tại của Tool.",
        "<b>Không để lại dấu vết:</b> Không hiện mác Userscript trong menu Cấu hình → Mods, không báo thông báo “Kiếp này bắt đầu dùng mod…”, không đóng dấu mod vào file save.",
        "<b>Không khóa Tỉ thí / Thiên Đạo:</b> Loại bỏ hoàn toàn nguy cơ engine game nhận diện nhầm Tool là mod can thiệp đổi luật gây khóa tính năng Tỉ thí.",
        "<b>Lắng nghe sự kiện <code>tutien:ready</code>:</b> Nạp lõi <code>tuTien.core</code> ngay khi game sẵn sàng, giữ nguyên nút mở tròn ☯ và toàn bộ tính năng Trợ Lý.",
      ],
    },
    {
      t: "Phiên Bản 7.0.0 · Bản Mod",
      d: "05/11/2026",
      now: false,
      pts: [
        "<b>Chuyển thành mod của game (.zip):</b> cài ở Cấu hình → Mods → Cài mod, bật rồi tải lại trang. Không cần Tampermonkey hay dấu trang nữa.",
        "<b>Nối thẳng vào lõi game (<code>tuTien.core</code>):</b> bỏ hẳn việc tải <code>index-[hash].js</code>, hơn 70 mẫu dò regex, vá khởi động và bản sao thứ hai của game. Mỗi hàm lấy theo tên gốc trong mã nguồn nên không còn vỡ khi game đổi tên rút gọn sau mỗi lần cập nhật (lỗi “chưa nhận ra tên cấp bậc tông môn” là do vậy).",
        "<b>Tính trên ctx chính thức:</b> mọi phép tính dùng <code>game.readCtx()</code> (bản sao chỉ đọc của kiếp đang chơi). Hằng số bản mệnh, tỉ lệ rơi hiếm, số lần săn cạn, ngưỡng chặn giữa đường đọc sống từ <code>core['balance/…']</code>.",
        "<b>Mở từ nút nổi “Mod” của game:</b> có khung “Trợ Lý” để bật cửa sổ Tool; nút ☯ cũ vẫn dùng được.",
        "<b>Tự kiểm tra</b> hiện hàm lõi nào thiếu theo dạng <code>module.hàm</code>, dễ báo lỗi chính xác khi game đổi.",
      ],
    },
    {
      t: "Phiên Bản 6.20.0 · Bản Trợ Lý",
      d: "05/11/2026",
      now: false,
      pts: [
        "<b>Giao diện dựng lại:</b> máy tính có thanh nhóm dọc bên trái, thanh con và nội dung bên phải (cửa sổ rộng hơn, bo góc, có bóng); điện thoại giữ thanh nhóm dưới đáy kèm vạch sáng báo mục đang chọn. Thanh tab con nay là các viên bo tròn vuốt ngang. Thẻ, bảng, ô nhập được làm lại cho thống nhất ở cả bốn giao diện.",
        "<b>Tra Cứu làm lại:</b> thanh tìm dính đầu trang có nút xóa nhanh; chip lọc theo nhóm (Vật Phẩm) hoặc loại và mức (Quái Vật) ngay dưới thanh tìm; các ô lọc cũ gom vào mục “Bộ Lọc Nâng Cao” có đếm số bộ lọc đang bật; kết quả là thẻ có dải màu theo phẩm cấp hoặc mức quái, mở ra xem chi tiết như cũ (liên kết chéo, nguồn rơi, công thức giữ nguyên).",
        "<b>Kiểm tra với game mới (index-DGQCk6VT):</b> cả 18 điểm nhận diện hàm lõi của game vẫn khớp, nên các phép tính không phải sửa.",
      ],
    },
    {
      t: "Phiên Bản 6.19.1 · Bản Trợ Lý",
      d: "05/11/2026",
      now: false,
      pts: [
        "<b>Sửa vị trí huyệt theo luật game mới:</b> đối chiếu source game mới (index-DGQCk6VT · content-Dz6MdWeJ): game nay xê dịch huyệt của khuôn thể chất sang ô kề cùng vòng khi tạo kiếp và lưu vị trí thật ở <code>huyetGoc</code>; huyệt phụ luôn được tính. Tool trước đây vẫn vẽ huyệt ở ô gốc của khuôn nên chấm vàng lệch một ô so với game (thấy rõ ở ảnh so sánh Cửu U Thể), còn Hoang Cổ Thánh Thể bị bỏ qua huyệt phụ. Nay cả ảnh lưới lẫn điểm “ưu tiên huyệt” của Auto Kinh Mạch đều đọc đúng <code>huyetGoc + huyetThem</code>; kiếp cũ chưa có <code>huyetGoc</code> tự dùng huyệt của khuôn như game.",
        "<b>Nối ô như game:</b> ảnh lưới nay vẽ đường mạch từ đan điền tới tâm từng món đã thông, rồi tới món kế (tia trắng, quầng xanh, chấm tròn ở tâm món), theo đúng thành phần vẽ kinh lộ của game; đường đi đọc từ trường <code>nguon</code> của hàm tính kinh mạch, có bản dựng lại phòng hờ nếu game đổi tên trường này. Số thứ tự món chuyển thành huy hiệu ở góc để không đè đường nối.",
        "<b>Lưới các thể chất:</b> rà cả 11 khuôn thể chất theo đúng luật đọc khuôn của game (D = đan điền, số 0–5 = vòng cảnh giới, chữ a–f = huyệt tự nhiên; “.” = ngoài khuôn): đều hợp lệ. Ảnh lưới nay <b>không vẽ ô ngoài khuôn</b> (trước đây vẽ thành ô trống như ô chưa mở, rõ nhất ở Liệt Dương, Âm Hồn, Vạn Độc, Kiếm Cốt), ô chưa mở vẽ khung đứt nét, ô tổn gạch chéo.",
        "<b>Màu linh căn:</b> đối chiếu bằng ảnh chụp game: Ám (tím), Thủy (xanh nhạt) và Vô sắc (xám) khớp màu ô trong game ở sắc độ nhạt của Tool. Thêm chữ Hán hệ ở góc mỗi ô (金木水火土雷冰風暗無) lấy từ bảng của game để không nhầm các màu gần nhau; tách màu Lôi khỏi Ám cho dễ phân biệt. Các hệ còn lại chưa có ảnh chụp để đối chiếu nên màu vẫn là màu cũ của Tool.",
      ],
    },
    {
      t: "Phiên Bản 6.19.0 · Bản Trợ Lý",
      d: "05/11/2026",
      now: false,
      pts: [
        "<b>Ô kinh mạch hợp hệ đúng luật game:</b> đối chiếu với hàm tính của game: món đúng hệ với màu ô = 1, cùng gốc (Băng~Thủy, Lôi và Phong~Mộc, Ám~Thủy) hoặc ô Vô sắc = 0,5, còn lại = 0. <b>Tương sinh giữa món và ô không có giá trị</b> nên bản 6.14 thưởng sai đã được bỏ (tương sinh vẫn tính đúng giữa các món kề nhau). Ô khắc hệ món chỉ bị trừ khi thật sự khắc (game cộng điểm nghịch), món chỉ lệch hệ thì trung tính, không bị trừ.",
        "<b>Ưu tiên linh căn 3 tầng:</b> trùng hệ linh căn &gt; dị linh căn cùng gốc &gt; hệ không bị linh căn khắc; hệ bị linh căn khắc bị trừ nhẹ.",
        "<b>Đã xóa ô “Độ Ép Hướng Sinh / Khắc”:</b> độ ép cố định ở mức Mạnh. Mặc định Auto Kinh Mạch nay là <b>Tiên Tu · Tương Sinh</b> (máy đã lưu cấu hình cũ cũng được đưa về mặc định mới một lần; sau đó vẫn tự đổi hướng xếp được).",
        "<b>Trần pháp lực và phẩm bằng cảnh giới:</b> Tool đọc thêm hàm trần pháp lực của game. Chiêu của món chạm trần chỉ còn uy lực theo tỉ lệ trần / pháp lực nên bị trừ điểm; món có phẩm bằng cảnh giới (trần đúng bằng pháp lực đầu cảnh giới kế) được cộng nhẹ. Hướng Build cũng chọn đồ theo cách này cho cả tâm pháp lẫn chiến pháp (tâm pháp không có chiêu nên game không kẹp trần, chỉ được cộng phần phẩm bằng cảnh giới). Nghịch Thiên không có trần.",
        "<b>Cách xếp ô tốt hơn:</b> mỗi lượt tìm dùng hạt giống ngẫu nhiên khác nhau (trước đây ba lượt tìm đi cùng một dãy số nên hay trùng kết quả); khi đề xuất chỗ đặt, Tool ưu tiên chỗ hợp màu ô và chỗ chạm đan điền hoặc món đã đặt, vì món không thông không có tác dụng.",
        "<b>Thêm thẻ “Phép Tính Giả Định” ở tab Kinh Mạch:</b> (1) <b>Nếu lên tiểu cảnh giới kế</b>: uy lực mỗi chiêu còn giữ được, chiêu nào sẽ chạm trần, đồ trong túi nào vẫn chưa chạm trần; (2) <b>Nếu gỡ từng món</b>: món nào đáng giữ nhất; (3) <b>Nếu đổi màu một ô</b>: ô nào đổi sang hệ linh căn khác có lợi (tối đa 160 phép thử). Tất cả tính trên bản sao, không đụng game.",
      ],
    },
    {
      t: "Phiên Bản 6.18.0 · Bản Trợ Lý",
      d: "05/11/2026",
      now: false,
      pts: [
        "<b>Sửa lỗi không vuốt được tab / giao diện “đứng im”:</b> khi đang cầm một món ở màn Kinh Mạch, game gắn trình nghe cấp cửa sổ gọi preventDefault() cho mọi cuộn chuột, touchmove và chuột phải (để xoay món). Sự kiện trong cửa sổ Tool nổi lên tới đó nên cuộn, vuốt thanh tab và cuộn nội dung đều bị chặn, cả trên điện thoại lẫn máy tính. Nay cửa sổ Tool chặn nổi bọt đúng 3 loại sự kiện này nên game không còn can thiệp được.",
        "<b>Thanh tab:</b> vuốt trái phải mượt hơn (bỏ hiệu ứng bám nấc, khai báo rõ hướng vuốt), con lăn chuột trên thanh sẽ cuộn ngang, kéo bằng chuột được (kéo xong không bấm nhầm tab). Bấm một tab không còn làm thanh nhảy về đầu; nút đang chọn tự cuộn vào vùng nhìn thấy.",
        "<b>Chống đứng hình khi nạp:</b> code game chỉ nạp một lần dù bấm tab hoặc ↻ liên tục lúc đang chờ (trước đó mỗi lần bấm nạp thêm một bản), có chữ báo khi chờ lâu và nút “Thử Lại” khi nạp lỗi.",
        "<b>Tự tìm lại hàm khi game cập nhật:</b> khi một mẫu dò cố định không còn khớp, Tool so “dấu vết cấu trúc” của từng hàm (tên thuộc tính, chuỗi văn bản, khóa đối tượng) với dấu vết của hàm đó ở bản game trước rồi chọn hàm giống nhất. Chỉ chọn khi đủ chắc (giống từ 62% và hơn hàm đứng sau từ 8 điểm); hàm có “sinh đôi” gần giống thì không tự chọn để khỏi nhầm. Mỗi lần dò đủ hàm, Tool lưu dấu vết của bản game đang chạy làm mốc cho lần cập nhật sau. Hàm nào được tự tìm lại sẽ hiện ở thẻ “Game vừa cập nhật” (Tổng Quan) và ở Tự kiểm tra, kèm độ khớp.",
        "<b>Tự thích nghi màn hình:</b> tự đo lại khi xoay máy, đổi cỡ cửa sổ, hiện/ẩn bàn phím ảo hay thanh địa chỉ, rồi chọn bố cục: điện thoại (toàn màn hình), điện thoại ngang (gọn), bảng/máy tính (cửa sổ nổi, kéo được). Bàn phím ảo không che ô nhập; tai thỏ và thanh điều hướng được chừa chỗ; nút ☯ không còn rơi ra ngoài màn hình khi xoay ngang.",
        "<b>Tự bù độ phân giải:</b> khi trình duyệt điện thoại ở “trang máy tính” (giao diện nhìn rất nhỏ) hoặc màn hình lớn từ 2400 px, Tool tự phóng giao diện cho đọc được. Nút 🔍 ở đầu cửa sổ cho chỉnh tay: Tự động · 85% · 100% · 115% · 130% · 150% (nhớ lựa chọn). Màn dưới 370 px được thu gọn lề và chữ; trên màn cảm ứng nút bấm tối thiểu 40 px.",
      ],
    },
    {
      t: "Phiên Bản 6.17.0 · Bản Trợ Lý",
      d: "05/11/2026",
      now: false,
      pts: [
        "<b>Dựng lại toàn bộ Hướng Build:</b> xóa hết hướng cũ (Phù Tu, Trận Tu, Đan Tu, Khí Tu và mọi hướng Tool tự quét thêm), dựng lại đúng <b>19 hướng theo dạng “tiền tố + Tu”</b>: Kiếm · Thể · Phật · Ma · Độc Cổ · Hợp Hoan · Luyện Thi · Quỷ · Ngự Thú · Khôi Lỗi · Kim · Mộc · Thủy · Hỏa · Thổ · Băng · Phong · Lôi · Ám.",
        "<b>Danh sách cố định:</b> Tool không còn tự thêm hướng từ nhãn lạ của game và không còn ẩn hướng nào. Hệ nổi bật của từng lưu phái vẫn đọc lại từ dữ liệu game mỗi lần quét. Cả 10 lưu phái đều đủ đồ để xếp kinh mạch (từ 16 món trở lên).",
        "<b>Viết lại thẻ hướng:</b> phần ghi chú, cách xếp lên kinh mạch và Phương Án (A · B · C kèm điểm mạnh, điểm yếu, hướng nghiêng về) được làm lại cho từng hướng; Quỷ Tu có thêm lối Quỷ + Ám, Khôi Lỗi Tu và Ngự Thú Tu có Phương Án riêng, Kiếm Tu có lối Kiếm Hàn (Băng, Ám). Số món vẫn đếm trực tiếp từ dữ liệu game, không gõ cứng.",
        "<b>Thể chất gợi ý:</b> Độc Cổ Tu gợi ý Vạn Độc Thể; Quỷ Tu gợi ý Âm Hồn Thể và Cửu U Thể; Ám Tu gợi ý Cửu U Thể.",
        "<b>Ai đang lưu hướng đã bị bỏ</b> (Phù, Trận, Đan, Khí hoặc hướng tự quét) thì Tool tự về “Không Ép”. Các ghi chú về cơ chế (ma niệm, luật tà đạo, Liễm Tức, kiếm uy lực, công thức thể tu) được giữ nguyên từ bản đã đối chiếu trước, chưa kiểm lại từng con số với code game bản này.",
      ],
    },
    {
      t: "Phiên Bản 6.16.0 · Bản Trợ Lý",
      d: "05/11/2026",
      now: false,
      pts: [
        "<b>Đối chiếu source game mới (index-KnS5tx_7 · content-xk4l5WOL):</b> toàn bộ hàm bắt buộc và hàm tùy chọn, hai mẫu vá khởi động, ngưỡng chặn giữa đường (30), săn cạn (3 lần, hồi 2 năm), bảng rơi hiếm, hằng số Bản Mệnh và giá trị văn đều vẫn khớp, nên không phải sửa logic dò hàm.",
        "<b>Hệ Ám (mới):</b> game thêm hệ Ám làm hệ biến dị (cùng Lôi, Băng, Phong), gốc là Thủy, có 34 món. Tool đã nhận Ám ở màu ô kinh mạch, ô hợp hệ (Ám dùng được Thủy, Kim, Mộc cùng các hệ cùng gốc), danh sách hệ của Auto Reroll Tư Chất, bộ lọc hệ ở Hướng Build và thêm hướng <b>Ám tu</b> (Theo Hệ).",
        "<b>2 Thể Chất mới:</b> <b>Vạn Độc Thể</b> (độc mạnh hơn, giữ thêm bản độc, dưỡng độc, kháng độc, đổi lại thuốc thang kém hiệu quả) và <b>Cửu U Thể</b> (ép ô Ám, uy lực Ám, đoạt sinh, thân âm khí: Lôi đánh vào thêm ×1,3). Đã đưa vào kho dự phòng, mô tả buff và gợi ý Hướng Build (Độc tu, Quỷ tu, Ám tu).",
        "<b>Cập nhật Thể Chất cũ:</b> Hoang Cổ Thể có thêm mở một huyệt khiếu mỗi cảnh giới Hoàn Mỹ; khuôn kinh mạch và đặc tính của Cửu Âm Tuyệt Mạch được đồng bộ với game; Phàm Thể không còn đặc tính riêng.",
        "<b>Chưa kiểm được:</b> chưa chạy trong game thật (chỉ đối chiếu code và dữ liệu). Bảng Ngự Linh và Dị Bảo nhúng sẵn chưa so lại từng dòng; phần đọc trực tiếp từ game thì tự theo bản mới. Nếu Tự kiểm tra báo thiếu hàm nào, gửi lại để sửa tiếp.",
      ],
    },
    {
      t: "Phiên Bản 6.15.0 · Bản Trợ Lý",
      d: "04/11/2026",
      now: false,
      pts: [
        "<b>Dọn Hướng Build:</b> bỏ 3 hướng do Tool tự quét thêm nhưng sai hoặc trùng: <b>Ngu Linh Tu</b> (nhãn bao chung 76 món, trùng 5 hướng Ngự thú · Khôi lỗi · Độc cổ · Luyện thi · Quỷ tu vốn đã tách theo loại ngự linh), <b>Vô Sắc Tu</b> (Vô Sắc là “không màu”, không phải hệ để tu) và <b>Âm Tu</b> (nhãn chỉ gắn 1 món). Nhãn lạ khác chỉ thành hướng khi có từ 10 món.",
        "<b>Ẩn hướng không đủ đồ:</b> hướng có dưới 10 món, hoặc không có tâm pháp, hoặc không có món có chiêu thì không xếp nổi một lưới kinh mạch nên bị ẩn khỏi danh sách (hiện lý do ở bảng Hướng Build Khả Dụng). Với dữ liệu game hiện tại: Phù tu (7 món), Trận tu (5), Khí tu (3). Game thêm đồ thì hướng tự hiện lại.",
        "<b>Sửa hệ của từng lưu phái:</b> bảng gõ tay từng lệch (Hợp hoan ghi Phong nhưng game có 0 món Phong; Quỷ tu và Ma tu ghi Vô Sắc là hệ; Ngự thú ghi Phong, thật ra Mộc và Thổ). Nay Tool đọc lại hệ nổi bật của mỗi hướng từ dữ liệu game (tối đa 2 hệ, hệ thứ hai phải chiếm từ 20%).",
        "<b>Sửa số liệu Phương Án:</b> các dòng tóm tắt từng hướng và bảng Ghép Tốt của từng hệ không còn là số gõ cứng (Luyện thi ghi 14 món nhưng đếm thật 31; Quỷ tu 27 so với 45; Độc cổ 30 so với 43; Ngự thú “chỉ 2 món” so với 16; hệ Kim 92 so với 108). Nay đếm trực tiếp từ dữ liệu game đang chạy, khớp với bảng hướng khả dụng.",
        "<b>Lưu ý:</b> hướng Theo Hệ vẫn giữ vì là trục khác với lưu phái (có thẻ Chuỗi Sinh, Tiết Hệ riêng). Ai đang lưu hướng đã bị ẩn thì Tool tự về “Không Ép”.",
      ],
    },
    {
      t: "Phiên Bản 6.14.3 · Bản Trợ Lý",
      d: "04/11/2026",
      now: false,
      pts: [
        "<b>Đối chiếu source game mới (index-CQmiFod_ · content-BpfpNA1H):</b> toàn bộ hàm bắt buộc và hàm tùy chọn (kể cả hàm tiện ích ở một nơi, dò bằng mẫu đầu), hai mẫu vá khởi động, ngưỡng chặn giữa đường (30), săn cạn (3 lần, hồi 2 năm), bảng rơi hiếm (hệ số 0,5 · 1 · 1,5 · 2), hằng số Bản Mệnh (phẩm cao nhất được chọn là 6) và giá trị văn đều vẫn khớp, nên không phải sửa logic.",
        "<b>Dữ liệu nhúng vẫn khớp content mới:</b> Ngự Linh (166 quái, 6 nghi thức, 80 sự kiện, 251 vật phẩm), 9 Thể Chất (mô tả không đổi), 19 sự kiện Dị Bảo và 16 bảo vật, số món theo hệ ở Hướng Build (Kim 92, Hỏa 79, Mộc 75, Thủy 73, Thổ 68, Băng 29, Phong 24, Lôi 23) đều không đổi.",
        "<b>Ghi chú:</b> bản này chỉ đổi số phiên bản và nhật ký để ghi nhận đã đối chiếu. Nếu game còn đổi thêm chỗ khác, Tự kiểm tra sẽ báo đúng tên hàm còn thiếu để sửa tiếp.",
      ],
    },
    {
      t: "Phiên Bản 6.14.2 · Bản Trợ Lý",
      d: "04/11/2026",
      now: false,
      pts: [
        "<b>Sửa lỗi “Game vừa cập nhật nên Tool chưa nhận ra: tiện ích ở một nơi”:</b> game đổi điều kiện lọc trong hàm liệt kê tiệm/tiện ích ở một nơi nên mẫu dò cũ không còn khớp. Nay Tool dò hàm này bằng 4 mẫu nối tiếp, bám vào phần ít đổi của hàm (lọc tiện ích + địa điểm, vòng lặp qua các sự kiện), nên game thêm hay bớt một cờ lọc cũng vẫn nhận ra.",
        "<b>Thiếu hàm này không còn làm sập cả Tool:</b> hàm “tiện ích ở một nơi” chỉ phục vụ giá mua bán (Kiếm Lời, Auto Buôn Bán). Nếu sau này game đổi hẳn và Tool vẫn không nhận ra, Trợ Lý vẫn mở bình thường, chỉ riêng phần giá mua bán báo thiếu hàm và hiện ở mục “Hàm chưa nhận ra” trong Tự kiểm tra.",
        "<b>Lưu ý:</b> sửa này dựa trên cấu trúc code game đã có; nếu bản game hiện tại còn đổi thêm chỗ khác, Tool sẽ báo đúng tên hàm còn thiếu để sửa tiếp.",
      ],
    },
    {
      t: "Phiên Bản 6.14.1 · Bản Trợ Lý",
      d: "04/11/2026",
      now: false,
      pts: [
        "<b>Đối chiếu source game mới (index-D0LwXiH3 · content-DhWnYU03):</b> đủ 23 hàm bắt buộc và 30 hàm tùy chọn, hai mẫu vá khởi động, ngưỡng chặn giữa đường (30), săn cạn (3 lần, hồi 2 năm), bảng rơi hiếm, 26 mã văn bản mệnh, hằng số Bản Mệnh, giá trị văn và hệ số phẩm đều vẫn khớp, nên không phải sửa logic.",
        "<b>Dữ liệu nhúng vẫn khớp content mới:</b> Ngự Linh (166 quái, 6 nghi thức, 80 sự kiện), 9 Thể Chất, 19 sự kiện và 16 bảo vật Dị Bảo, số món theo hệ ở Hướng Build (Kim 92, Hỏa 79, Mộc 75, Thủy 73, Thổ 68, Băng 29, Phong 24, Lôi 23) đều không đổi.",
        "<b>Ghi chú Dị Bảo:</b> 4 sự kiện nhặt bảo ở hoang dã (Linh Quang Dưới Khe, Bảo Quang Đáy Hồ, Tháp Đồng Dưới Cát, Linh Quả Giữa Vòng Vây) cũng không có món cố định nên chưa đưa vào bảng Dị Bảo.",
      ],
    },
    {
      t: "Phiên Bản 6.14.0 · Bản Trợ Lý",
      d: "03/11/2026",
      now: false,
      pts: [
        "<b>Giao diện mới (Thủy Mặc Tiên Môn):</b> thanh nhóm tab chuyển xuống đáy (dễ chạm một tay trên điện thoại) có biểu tượng riêng, thẻ bo tròn có vạch nhấn, nút dạng viên, bảng kẻ sọc; thêm giao diện thứ 4 là Huyền Ảnh (nền đen thuần).",
        "<b>Ô kinh mạch hợp hệ:</b> ô hệ X dùng được hệ X, hệ cùng gốc (Băng ~ Thủy; Lôi, Phong ~ Mộc), hệ sinh ra X và hệ mà X sinh ra. Ví dụ ô Thủy dùng được Thủy, Băng, Kim, Mộc, Lôi, Phong. Điểm ưu tiên: đúng hệ 1, cùng gốc 0,75, sinh hoặc được sinh 0,5; món lệch hẳn bị trừ điểm.",
        "<b>Hướng Build:</b> mỗi hướng có thẻ Phương Án (2–3 hướng, điểm mạnh, điểm yếu, hướng nghiêng về) đối chiếu content game v8.8; bảng Ô Màu Nào Dùng Được Hệ Nào. Hướng theo hệ sinh phương án tự động theo quy tắc sinh khắc.",
        "<b>Sửa lỗi:</b> hướng Băng, Lôi, Phong không còn bỏ sót hệ sinh ra chúng (trước đây chỉ so đúng tên hệ, không so theo gốc).",
      ],
    },
    {
      t: "Phiên Bản 6.13.1 · Bản Trợ Lý",
      d: "03/11/2026",
      now: false,
      pts: [
        "<b>Đối chiếu source game mới (index-DCbImv_5 · content-BKLTrNBe):</b> đủ 23 hàm bắt buộc và 30 hàm tùy chọn, các mẫu vá khởi động, ngưỡng chặn giữa đường (30), săn cạn (3 lần, hồi 2 năm), bảng rơi hiếm, 26 mã văn bản mệnh và hệ số phẩm đều vẫn khớp.",
        "<b>Sửa Bản Mệnh Pháp Bảo:</b> game thêm hằng số phẩm cao nhất được chọn làm bản mệnh (Phẩm Thần không còn được chọn, vẫn là trần khi Dưỡng giai). Bản trước đọc lệch nhóm hằng số này nên các dòng tính theo bảng có thể sai; nay đọc đúng và có kiểm tra thứ tự phẩm. Bảng dự phòng thêm lý do “Phẩm Thần đã là trần” và tầng ô khắc cho bản mệnh ở trần.",
        "<b>Dữ liệu Ngự Linh nhúng sẵn:</b> thêm 3 quái (Lân Hỏa Quỷ, Quỷ Tân Nương, Thi Khuyển; tổng 166), thêm 2 sự kiện (Dưỡng Linh Thị, So Tài Khôi Lỗi). Cửa hàng không có món cố định nay ghi rõ bán trứng thú và nguyên liệu Ngự Linh.",
        "<b>Thể Chất:</b> mô tả Âm Hồn Thể theo lời game mới (“ngự lực” thay “thần thức”). Game nay tính ngân sách mang theo thú, hồn, khôi theo “ngự lực” (tính từ thần thức); Tool chưa hiển thị phần này.",
        "<b>Ghi chú Dị Bảo:</b> game thêm 3 sự kiện dị bảo (Nhẫn Trong Hố Sét, Hộp Ba Khóa, Kéo Đỉnh Giữa Hồ) cho bảo vật ngẫu nhiên, không có món cố định nên chưa đưa vào bảng Dị Bảo.",
      ],
    },
    {
      t: "Phiên Bản 6.13.0 · Bản Trợ Lý",
      d: "03/11/2026",
      now: false,
      pts: [
        "<b>Nhóm mới Luân Hồi:</b> tab <b>Mở Khóa</b> liệt kê mọi mục ở bến Vong Xuyên (căn cốt, xuất thân, thiên mệnh, lộ phí) với bậc hiện tại, giá bậc kế, mô tả, lý do bị khóa và nút Mua dùng đúng hàm mua của game; chạy được cả khi chưa vào kiếp nào.",
        "<b>Tab Thành Tựu:</b> toàn bộ thành tựu theo nhóm, cái nào đã có, cái nào đang đạt ở kiếp này (chốt khi kiếp kết thúc), điểm thưởng, và thành tựu đó mở khóa mục Luân Hồi nào.",
        "<b>Tab Dự Tính Điểm:</b> gọi đúng hàm tính điểm luân hồi của game để cho biết nếu kiếp này kết thúc ngay thì nhận bao nhiêu điểm (có từng dòng), sau đó mua được thêm mục nào.",
        "<b>Nhóm mới Nhân Mạch:</b> tab <b>Thiên Kiêu Bảng</b> (bảng hiện tại, kỳ cập nhật sau, bảng giả định nếu cập nhật ngay, hồ sơ từng thiên kiêu) và tab <b>Nhân Mạch</b> (mọi người đã gặp, lọc theo quan hệ và tìm theo tên, cảnh giới, tuổi, hảo cảm).",
        "<b>Auto Reroll thêm Auto Luân Hồi:</b> ô tích Tự Mua Mục Mở Khóa Luân Hồi cùng danh sách chọn mục và mức điểm giữ lại. Auto mua trước khi dò tư chất (vì Linh Căn, Thiên Tư… đổi tỉ lệ), tự chừa đủ điểm cho Lộ Phí Qua Sông nếu ô Lộ Phí đang bật, và hiện kế hoạch mua ngay trên giao diện.",
      ],
    },
    {
      t: "Phiên Bản 6.12.0 · Bản Trợ Lý",
      d: "02/11/2026",
      now: false,
      pts: [
        "<b>Auto Reroll thêm ô tích Mua Hết Lộ Phí Qua Sông:</b> khi đã tìm được tư chất như ý, ngay trước lúc vào kiếp mới Tool tự mua mọi món Lộ Phí Qua Sông ở bến Vong Xuyên (túi tiền, đan dược, bùa, Thông Mạch Đan, thọ, căn cốt, ngộ tính, thân pháp) theo thứ tự từ món rẻ tới món đắt cho tới khi hết điểm luân hồi; món nào không đủ điểm hoặc chưa mở khóa thì bỏ qua. Chỉ mua sau khi tìm được tư chất nên reroll thất bại không tốn điểm; Dò Tỉ Lệ không bao giờ mua.",
        "<b>Auto Reroll thêm box chọn Đạo Lộ:</b> Thuận Thiên, Trung Đạo (mặc định, giống bản trước) hoặc Nghịch Thiên. Đạo Lộ ảnh hưởng cách game gieo kiếp (Nghịch Thiên bỏ Thiên Mệnh nên xuất thân và hệ khác đi), vì vậy Tool dò và tạo kiếp thật đều dùng đúng Đạo Lộ đã chọn, kết quả vẫn khớp bản dò.",
      ],
    },
    {
      t: "Phiên Bản 6.11.1 · Bản Trợ Lý",
      d: "02/11/2026",
      now: false,
      pts: [
        "<b>Auto Săn Yêu đổi mặc định:</b> nay tích sẵn <b>Xanh · Vàng · Đỏ</b>, Tím để trống (gặp Tím thì Auto dừng). Ai đã tự chỉnh màu ở bản 6.11.0 thì giữ nguyên lựa chọn của mình; chỉ máy chưa lưu màu nào mới nhận mặc định mới.",
        "<b>Lưu ý Đỏ:</b> Tốc Chiến chỉ dùng được khi game dự đoán thắng, nên trận Đỏ vẫn dừng ngay khi trận mở để bạn tự đánh; Auto chỉ đi tới và chọn giao chiến.",
      ],
    },
    {
      t: "Phiên Bản 6.11.0 · Bản Trợ Lý",
      d: "02/11/2026",
      now: false,
      pts: [
        "<b>Auto Săn Yêu chọn màu nguy hiểm:</b> bảng màu nay có ô tích cho từng màu <b>Xanh · Vàng · Đỏ · Tím</b>. Auto chỉ tới nơi, chọn giao chiến và đánh ở các màu được tích (mặc định vẫn Xanh và Vàng). Tích tùy ý, không cần liền nhau; phải giữ ít nhất một màu.",
        "<b>Áp dụng ở mọi bước:</b> chọn nơi săn (cùng số lượt thì ưu tiên màu an toàn hơn rồi mới tới nơi gần), nơi đang đứng, lựa chọn giao chiến và trận đang mở. Màu không tích thì Auto bỏ qua hay dừng như trước; chỉ tích Xanh thì trận Vàng cũng dừng thay vì Tốc Chiến.",
        "<b>Giới hạn của Đỏ và Tím:</b> Tốc Chiến chỉ dùng được khi game dự đoán thắng, nên trận Đỏ hoặc Tím Auto dừng ngay khi trận mở để bạn tự đánh trong game; Auto không tự đánh tay. “Thần thức không dò ra” tính là Tím. Tím là tử địa, rủi ro chết cao.",
      ],
    },
    {
      t: "Phiên Bản 6.10.0 · Bản Trợ Lý",
      d: "02/11/2026",
      now: false,
      pts: [
        "<b>Tab mới Bản Mệnh Pháp Bảo (nhóm Nhân Vật):</b> game cập nhật thêm hệ thống bản mệnh (Trúc Cơ trở lên lấy tinh huyết tế một pháp khí thành bản mệnh). Tab cho biết bản mệnh hiện tại (món, phẩm gốc và phẩm đã nâng, tầng và tâm huyết, hệ số cố định, ô khắc, văn bẩm sinh, văn đang khắc, kho văn đã ngộ, số lần huyết luyện và nuốt món, tình trạng tổn).",
        "<b>Chi phí từng việc:</b> huyết luyện, nâng giai (thời gian, năm thọ đốt, linh thạch, tỉ lệ thành, kỳ vọng tới khi thành), hóa bản mệnh, và lý do chưa làm được. Chi phí và điều kiện gọi thẳng hàm của game nên khớp số thật theo tay nghề Luyện Bảo của bạn.",
        "<b>Món trong túi tế luyện được:</b> liệt kê pháp khí hợp làm bản mệnh theo phẩm, mỗi món có thời gian, linh thạch, năm thọ đốt, tỉ lệ thành, kỳ vọng nếu thử tới khi thành, số phụ phẩm và văn bẩm sinh sẽ có.",
        "<b>Nuốt món ngộ văn:</b> hiện ba văn ứng viên mà game sẽ cho ở từng món ngay lúc này (game gieo theo kiếp, món, năm và số món đã nuốt), kèm ngộ mới hay nâng cấp, điểm cộng và món quá yếu.",
        "<b>Bảng tham khảo:</b> cách tâm huyết tăng giảm, các tầng, ô khắc, giới hạn từng nhóm văn và hiệu quả của toàn bộ văn ở cấp 1 và cấp 3. Số liệu đọc từ code game; không đọc được thì dùng bảng dự phòng theo bản game này.",
        "<b>Đối chiếu source game mới (index-pprChHa9 · content-ChvnNsCQ):</b> toàn bộ hàm bắt buộc, hàm tùy chọn và các mẫu nhận diện của các tab cũ vẫn khớp; thêm 9 hàm tùy chọn cho bản mệnh. Dữ liệu Ngự Linh nhúng sẵn (163 quái, 251 vật phẩm, 9 Thể Chất) đã khớp với content mới. Ghi chú Dị Bảo: game thêm 4 sự kiện dị bảo ở hoang dã (Bảo Quang Đáy Hồ, Linh Quang Dưới Khe, Linh Quả Giữa Vòng Vây, Tháp Đồng Dưới Cát) nhưng không cho bảo vật cố định nên chưa đưa vào bảng Dị Bảo.",
        "<b>Tự Kiểm Tra</b> thêm dòng kiểm Bản Mệnh Pháp Bảo: bảng số liệu, chi phí tế luyện và số hàm của game đọc được.",
      ],
    },
    {
      t: "Phiên Bản 6.9.1 · Bản Trợ Lý",
      d: "02/11/2026",
      now: false,
      pts: [
        "<b>Gộp Kinh Mạch, Lối Build và Auto Kinh Mạch thành một tab Hướng Build</b> (nhóm Tự Động). Tab Kinh Mạch và tab Lối Build cũ bị bỏ; mọi thứ nằm trong một trang: Cài Đặt Chung, Auto Kinh Mạch, quét hướng, xếp theo cảnh giới, xếp từ đồ trong túi.",
        "<b>Cài Đặt Chung dùng cho tất cả:</b> Hướng Build, tỉ lệ Tâm Pháp : Chiến Pháp, chế độ, hướng xếp, độ kỹ, ưu tiên linh căn và độ ép. Đổi một chỗ là Auto, xếp từ túi và xếp theo cảnh giới đều theo.",
        "<b>Auto Kinh Mạch được giữ nguyên engine:</b> tự xếp rồi áp dụng bằng hàm của game (gỡ, đặt, đổi bộ, mở ô), Xem Trước, Xếp 2 Bộ, Tự Mở Ô, Theo Dõi. Thêm: Auto cũng ép tỉ lệ Tâm Pháp : Chiến Pháp (mặc định 5 : 5).",
        '<b>Quét Hướng Build từ dữ liệu game:</b> bảng Hướng Build Khả Dụng đếm Tâm Pháp, Đấu Pháp, Pháp Khí, Bảo Vật của từng hướng và số món dùng được ở cảnh giới đang chọn. Nhãn hoặc hệ mới xuất hiện trong game tự thành hướng mới (đánh dấu \"mới\"); có nút Quét Lại.',
        "<b>Tỉ lệ 5 : 5:</b> Tool phân loại đúng như game (Tâm Pháp · Đấu Pháp · Pháp Khí · Bảo Vật), chia số ô thông làm hai nửa rồi trừ điểm mỗi ô lệch tỉ lệ khi tìm cách xếp (chỉ tính món đang thông). Có thêm 6 : 4, 4 : 6 và Không Ép.",
        "<b>Quét Kỹ Năng Trước Khi Xếp:</b> liệt kê kỹ năng chủ động (chiêu: dạng, uy, phí, hiệu ứng) và bị động (linh lực, tu luyện, đột phá, khí huyết, chỉ số) của đồ trong kế hoạch, cảnh báo khi thiếu Tâm Pháp, thiếu Chiến Pháp hoặc chưa có chiêu công.",
        "<b>Xếp theo cảnh giới:</b> chọn Phàm Nhân tới Hóa Thần và tiểu cảnh giới; Tool dựng lưới các vùng ô tới cảnh giới đó (tùy chọn giả định mọi ô đã thông) và chỉ lấy đồ dùng được ở đó. Chỉ số nhân vật lấy theo hiện tại nên cảnh giới cao hơn chỉ là ước lượng.",
        "<b>Chọn đồ từ Phàm Phẩm đến Nghịch Thiên, theo nguyên tố, theo đặc tính:</b> khoảng phẩm và nguyên tố lọc cứng (có ô kèm đồ Vô Sắc); đặc tính (tu luyện, đột phá, khí huyết, thân pháp, thiêu đốt, chảy máu, phá giáp, chiêu khống chế…) được ưu tiên mạnh khi chọn đồ. Nguồn đồ chọn được: đồ trong game (giả định) hoặc chỉ đồ đang có.",
        "<b>Đã xóa:</b> ô Xếp Full Ô và chế độ xếp theo Lĩnh Ngộ. Mọi phép tính dùng sức đã Lĩnh Ngộ đầy (×1).",
        "<b>Tự Kiểm Tra</b> thêm dòng kiểm Hướng Build: quét hướng, chọn đồ, chia ô và chạy hàm tính kinh mạch của game trên nhân vật giả định.",
      ],
    },
    {
      t: "Phiên Bản 6.8.0 · Bản Trợ Lý",
      d: "02/11/2026",
      now: false,
      pts: [
        "<b>Auto Reroll Tư Chất (nhóm Tự Động):</b> tab mới tự dò <b>Linh Căn</b> và <b>Thể Chất</b> của kiếp mới cho tới khi đúng điều kiện bạn đặt. Chọn phẩm Linh Căn (Thiên, Biến Dị, Song, Tạp, Vô), hệ muốn có (Kim, Mộc, Thủy, Hỏa, Thổ, Lôi, Băng, Phong; xét có ít nhất một hệ, có đủ mọi hệ hoặc hệ đầu), các Thể Chất chấp nhận, và nối hai điều kiện bằng Cả Hai hoặc Một Trong Hai.",
        "<b>Cách làm:</b> game gieo tư chất từ một hạt giống, nên Tool gọi chính hàm tạo kiếp của game trên bản sao dữ liệu để dò hạt giống, không đụng bản lưu và không tốn Linh Thạch hay điểm luân hồi. Gặp tư chất đúng điều kiện mới gọi game tạo kiếp thật bằng hạt giống đó, rồi đối chiếu lại tư chất thật với bản dò. Chưa gặp trong số lần tối đa thì kiếp giữ nguyên.",
        "<b>Dò Tỉ Lệ:</b> nút dò thử 400 hạt giống (không đổi kiếp) cho biết điều kiện của bạn khớp bao nhiêu phần trăm và trung bình cần bao nhiêu lần thử.",
        "<b>Đạo Lộ và Lộ Phí Qua Sông:</b> box Đạo Lộ chọn độ khó của kiếp mới (Thuận Thiên, Trung Đạo, Nghịch Thiên); ô Mua Hết Lộ Phí Qua Sông tự mua các món Lộ Phí ở bến Vong Xuyên bằng điểm luân hồi, chỉ sau khi đã tìm được tư chất và ngay trước khi vào kiếp.",
        "<b>An toàn:</b> chạy được ở màn Luân Hồi lúc chưa vào kiếp nào (đổi tư chất không mất gì). Kiếp vừa vào mà chưa trôi năm nào chỉ được thay khi bạn bật ô Cho Phép Thay Kiếp Vừa Vào, vì đồ mua ở bến Vong Xuyên dành riêng cho kiếp đó không theo sang kiếp thay. Kiếp đã trải thời gian hoặc đã kết thúc thì Auto không đụng.",
        "<b>Thêm một hàm tùy chọn</b> cho Tự Kiểm Tra: hàm tạo kiếp mới của game. Game đổi mà không nhận ra thì chỉ tab này báo lỗi, các tính năng khác vẫn chạy.",
      ],
    },
    {
      t: "Phiên Bản 6.7.0 · Bản Trợ Lý",
      d: "02/11/2026",
      now: false,
      pts: [
        "<b>Tra Cứu Địa Danh có mô tả:</b> mỗi nơi (kể cả Tông Môn) nay hiện dòng <b>Tóm Tắt</b> (loại, đại tông môn hay tông môn, phái, hệ, chính hay ma đạo, quốc gia, có Trận Truyền Tống, có Hộ Thành Đại Trận) và một câu văn tả lấy từ danh mục nơi chốn của game theo loại nơi.",
        "<b>Bổ sung mô tả cho 17 mục game chưa ghi:</b> 12 quái (Tán Tu Tham Lam, Ma Tu Hút Máu, Trưởng Lão Tông Môn, Ma Đầu, Chưởng Môn, Trưởng Lão Nguyên Anh, Thái Thượng Trưởng Lão, Thiết Bì Hùng, Huyết Nha Báo, Thanh Lân Mãng, Dã Lang, Xích Diễm Lang) và 5 linh dược, nguyên liệu (Huyết Linh Chi, Thanh Tâm Thảo, Băng Phách Liên, Xích Tinh Quả, Hàn Thiết). Hễ game thêm mô tả thì Tool dùng mô tả của game.",
        "<b>Đối chiếu dữ liệu game mới (index-DThGMgkp · content-C_CF7zJj):</b> mô tả vật phẩm, quái và Thể Chất nhúng sẵn trong Tool đã khớp 100% với game (163 quái Ngự Linh, 9 Thể Chất); các mục khác vẫn đọc mô tả trực tiếp từ game.",
      ],
    },
    {
      t: "Phiên Bản 6.6.0 · Bản Trợ Lý",
      d: "02/11/2026",
      now: false,
      pts: [
        "<b>Tra Cứu thêm tab Địa Danh:</b> tìm không cần dấu theo tên, lọc theo loại (thôn, trấn, thành, kinh đô, tông môn, bí cảnh, di tích, linh địa…), quốc gia và đại lục; xếp gần nhất hoặc theo tên; mặc định ẩn nơi còn phủ mây (có ô bật hiện cả). Mỗi nơi cho biết loại, quốc gia, cấp nền, tình trạng, thời gian đi bộ, mức nguy hiểm theo màu của game, việc đang có ở đó và động phủ của bạn.",
        "<b>Nút Đi Đến:</b> đi bộ tới nơi đã chọn bằng chính hàm đi đường của game (tốn năm đường, có thể gặp biến cố giữa đường), có hỏi lại trước khi đi.",
        "<b>Nút Dịch Chuyển Đến:</b> dùng đúng truyền tống của game: Trận Truyền Tống (thành, kinh đô, đại tông môn, động phủ có trận) hoặc Truyền Tống Phù trong túi (Quy Tức Phù, Na Di Phù). Tool tự mở bảng truyền tống rồi chọn nơi đến; tầm, linh thạch, vượt biển, nơi bị khóa đều do game kiểm và hiện lý do khi chưa dùng được. Tool không tự đổi vị trí nên bản Trợ Lý vẫn không có Tu Chỉnh.",
        "<b>Đối chiếu source game mới (index-DThGMgkp · content-C_CF7zJj):</b> 24 hàm bắt buộc và 20 hàm tùy chọn vẫn nhận diện được; các mẫu vá khởi động, ngưỡng chặn giữa đường (30), săn cạn (3 lần, hồi 1 lần mỗi 2 năm) và bảng tỉ lệ rơi hiếm vẫn khớp. Dữ liệu nhúng đối chiếu không lệch: 163 sinh vật, 6 nghi thức, 9 Thể Chất, 78 sự kiện Ngự Linh, 251 vật phẩm Ngự Linh.",
        "<b>Ghi chú Dị Bảo:</b> game có thêm 3 sự kiện trong nhóm dị bảo (Nhẫn Trong Hố Sét, Hộp Ba Khóa, Kéo Đỉnh Giữa Hồ) nhưng chúng cho đồ ngẫu nhiên chứ không có bảo vật cố định nên chưa đưa vào bảng Dị Bảo.",
        "<b>Tự Kiểm Tra</b> thêm dòng kiểm Địa Danh và các hàm truyền tống của game.",
      ],
    },
    {
      t: "Phiên Bản 6.5.0 · Bản Trợ Lý",
      d: "02/11/2026",
      now: false,
      pts: [
        '<b>Auto Kinh Mạch (nhóm Tự Động):</b> tab mới tự tìm cách xếp rồi áp dụng vào game bằng chính hàm của game (gỡ, đặt, đổi bộ, mở ô). Ô tích "Tự áp dụng vào game" cũ ở tab Kinh Mạch đã chuyển sang đây. Có Xem Trước, Xếp 2 Bộ (Tu Luyện · Đánh, tự mở bộ 2 nếu cho phép), Tự Mở Ô Khi Có Lợi, Theo Dõi (tự xếp lại khi có đồ mới, ô đổi, lên cảnh giới). Chỉ đổi khi điểm tăng đủ lớn; game bận thì không đụng.',
        '<b>Lĩnh Ngộ (game mới):</b> món lần đầu đặt lên kinh mạch chỉ có 50% sức rồi đầy dần theo năm, Viên Mãn ×1,1 sau 500 năm đeo. Tool nạp đúng độ lĩnh ngộ vào phép tính (chọn Ngay Lúc Xếp · Trung Bình · Sau Khi Lĩnh Ngộ Xong), ghi số năm Lĩnh Ngộ cạnh món. Nút "Áp dụng vào game" nay đi qua hàm của game nên không còn bỏ qua luật này (trước đây ghi thẳng vào state nên món mới có đủ sức ngay).',
        '<b>Kinh Mạch:</b> "Ô nên mở" chỉ còn liệt kê ô game cho mở thật (ô tắc kề ô đã thông) và có nút Mở; thêm nút Áp Dụng 2 Bộ Vào Game; điểm Tiên Tu · Ma Tu lấy số liệu sinh khắc do chính game tính (theo từng ô, có xét chênh phẩm); bảng hệ số thêm cột độ hợp phẩm · lĩnh ngộ; cập nhật phần Nguyên Lý.',
        '<b>Lối Build:</b> sửa chỗ lỗi thời (Nghịch Thiên không còn "không bao giờ bị kẹp": sức nhân theo cảnh giới, Phàm phẩm ×0,6, đọc từ game); thêm Lĩnh Ngộ và sinh khắc theo phẩm vào Luật Chung; chọn món có tính độ hợp phẩm; lối tà đạo thêm mục công pháp Liễm Tức; thêm nút chuyển lối sang Auto Kinh Mạch.',
        "<b>Đối chiếu source game (index-By9CmiJQ · content-D1RqrUbS):</b> mọi hàm nhận diện vẫn khớp; thêm đọc hàm Lĩnh Ngộ, ngộ tính, độ hợp phẩm; Tự Kiểm Tra thêm dòng kiểm Auto Kinh Mạch.",
      ],
    },
    {
      t: "Phiên Bản 6.4.0 · Bản Trợ Lý",
      d: "01/11/2026",
      now: false,
      pts: [
        "<b>Auto Buôn Bán, bán xuyên khoảng cách:</b> thêm ô <b>Phạm Vi Bán</b> (năm đường, mặc định 5, tính từ nơi mua); ô cũ đổi tên thành <b>Đi Mua Tối Đa</b>. Nơi bán không còn bị gói trong bán kính mua: mua xong, Auto dò lại mọi tiệm thu món đó trong phạm vi và chọn tiệm lãi nhất mỗi năm đường theo giá thật, đã tính Chợ Ngập Hàng.",
        "<b>Bán nối tiếp:</b> tiệm đã chọn không thu, giá thật thấp hơn vốn hay chợ chỉ thu được một phần thì Auto tự sang tiệm kế trong phạm vi để bán nốt rồi mới tính lãi chuyến. Hết chỗ bán không lỗ mới dừng và giữ hàng trong túi.",
        "<b>Auto Săn Yêu theo màu nguy hiểm:</b> Xanh (dễ thắng) và Vàng (thắng được nhưng mang thương) tự săn, tự Tốc Chiến khi game cho phép; Đỏ (khó thắng) và Tím (tử địa, kể cả “thần thức không dò ra”) được tự phát hiện ở nơi đang đứng, ở lựa chọn giao chiến và ở trận đang mở rồi dừng.",
        "<b>Bảng xác nhận của game:</b> Auto nhận ra bảng đang hiện (Tử Địa, Huyết Độn, Ném Đồ Bỏ Chạy…), đóng bằng nút Hủy, phím Esc hay bấm nền, không bao giờ bấm đồng ý, rồi dừng và ghi vào nhật ký.",
        "<b>Gọn giao diện:</b> Auto Săn Yêu bỏ ô chọn Nơi Nguy Hiểm Tối Đa (luật Xanh · Vàng cố định) và hiện bảng màu giải thích; các tab Kế Hoạch và Xem Nơi Săn cho biết có bao nhiêu nơi Đỏ hoặc Tím bị bỏ qua.",
      ],
    },
    {
      t: "Phiên Bản 6.3.1 · Bản Trợ Lý",
      d: "01/11/2026",
      now: false,
      pts: [
        "<b>Khớp bản game mới (index-By9CmiJQ · content-D1RqrUbS):</b> đủ 37 hàm Tool cần, 18 hàm điều khiển của Auto vẫn nhận ra; săn cạn vẫn 3 lần mỗi nơi, hồi 1 lần mỗi 2 năm (nay Tool tự đọc hai số này từ code game).",
        "<b>Ấu Thú (Ngự Linh):</b> trứng giờ nở ra <b>ấu thú</b> (Cảnh Giới 1, độ khó 40%) rồi tiến hóa bằng liệu thành con trưởng thành. Tab Sinh Vật thêm dòng <b>Tiến hóa từ</b> và hệ đổi khi tiến hóa; dữ liệu nhúng cập nhật 163 sinh vật (thêm 21), 20 loại trứng nay nở ra ấu thú (thêm 4 loại trứng mới), thêm 2 sự kiện Ngự Linh.",
        "<b>Thể Chất:</b> thêm nhãn Kháng Độc, Kháng Lửa, Kháng Băng, Kháng Hiệu Ứng cho Bạch Thảo, Thiết Cốt, Hoang Cổ, Cửu Âm, Huyền Vũ, Liệt Dương.",
        "<b>Mô Tả Vật Phẩm:</b> hiện tỉ lệ khống chế của chiêu và chỉ số Liễm Tức (trước đây bị bỏ sót).",
        "<b>Tra Cứu:</b> trứng hiện “Nở Ra”, ấu thú hiện “Ấp Từ Trứng” và “Tiến Hóa Từ”; sự kiện hiện kiểu làm mới (Thường Trú, Theo Ngữ Cảnh) và số năm làm mới. 29 món, 21 quái, 6 công thức mới tự có trong Tra Cứu.",
      ],
    },
    {
      t: "Phiên Bản 6.3.0 · Bản Trợ Lý",
      d: "01/11/2026",
      now: false,
      pts: [
        "<b>Tra Cứu mới:</b> hai tab <b>Vật Phẩm</b> và <b>Quái Vật</b> (thay Đồ Trong Game): tìm không cần dấu, lọc theo nhóm, cảnh giới, hệ, địa hình; mỗi mục có mô tả, công dụng và <b>Nơi Xuất Hiện</b> (quái rơi, tiệm bán, sự kiện, công thức, nguồn gốc / địa hình, sự kiện gặp quái, đồ rơi). Bấm tên trong chi tiết để nhảy sang mục liên quan.",
        "<b>Tự khớp dữ liệu game:</b> Tra Cứu đọc thẳng từ dữ liệu game đang chạy (hiện khớp content-DUfQ1m1P) nên game thêm hoặc đổi món, quái là tự đổi theo; số rơi hiếm đọc từ code game. Tab Tra Cứu mở tức thì, không cần nạp lõi tính toán.",
        "<b>Auto nhanh hơn:</b> bỏ quãng nghỉ cố định 120 ms giữa mỗi bước, thêm chọn <b>Tốc Độ Chạy</b> (Nhanh · Vừa · Chậm, mặc định Nhanh); vòng chạy tự nhường game vẽ, vẫn chạy khi tab bị ẩn.",
        "<b>Bớt giật:</b> vòng Auto không còn sao chép cả kiếp chơi ở mỗi bước, nhật ký / tiến trình vẽ giãn nhịp tối đa 4 lần mỗi giây; bộ viết hoa Title Case chỉ xử lý phần mới thêm thay vì quét lại cả cửa sổ.",
        "<b>Dữ liệu nhúng sẵn:</b> cập nhật tiến hóa Ngự Linh (thêm hệ của dạng tiến hóa) và tỉ lệ xuất hiện Thể Chất; đối chiếu với source game mới (index-DLnFxilY) thấy đủ 37 hàm Tool cần, 18 hàm điều khiển của Auto và hằng số săn cạn (3 lần, hồi 1 lần mỗi 2 năm) vẫn khớp.",
      ],
    },
    {
      t: "Phiên Bản 6.2.1 · Bản Trợ Lý",
      d: "31/10/2026",
      now: false,
      pts: [
        "<b>Đối chiếu source game mới (index-DSeeTZi_, content-BiNSqHt3):</b> mọi hàm Trợ Lý cần vẫn nhận diện được; các mã vật phẩm, yêu thú, sự kiện cứng trong Tool đều còn trong game; hằng số chợ ngập hàng vẫn khớp.",
        "<b>Cập nhật dữ liệu Ngự Linh:</b> năm sự kiện đổi khoảng cảnh giới (Chợ Âm, Chợ Đêm Thú Cổ, Cá Chép Vượt Thác, Chồn Vàng Đuổi Trộm, Tổ Chim Xanh đều mở tới cảnh giới 5); mô tả Thể Chất Âm Hồn Thể theo lời game.",
        "<b>Sửa số liệu ba tab nghề mới:</b> số món ra mỗi mẻ theo từng nghề (phù 2·3·5·6, trận 1·1·2·2, bảo 1 món), tên hỏa hầu đúng như game gọi, món Cực của Luyện Bảo tính giá theo vật phẩm Cực riêng, đan nhận thêm mỗi lò tính đủ khi có món cộng thêm trong túi.",
        '<b>Chữ theo game mới:</b> nghề Luyện Bảo dùng đỉnh (không còn gọi khí lô); phần hướng dẫn thi Đan sư không còn ghi cứng "luôn chọn lửa lớn", Tool tính theo điểm của bạn.',
      ],
    },
    {
      t: "Phiên Bản 6.2.0 · Bản Trợ Lý",
      d: "31/10/2026",
      now: false,
      pts: [
        "<b>Kiếm Lời thêm ba tab:</b> Chế Phù, Luyện Bảo, Trận Pháp, đặt ngay sau Luyện Đan. Mỗi tab có phần thi nghề riêng và bảng công thức đã thuộc của đúng nghề đó (lãi ước tính, nguyên liệu còn thiếu).",
        "<b>Tách theo nghề:</b> tab Luyện Đan nay chỉ gồm thi Luyện Đan và đan phương; trước đây tab này gom cả thi nghề lẫn công thức của mọi nghề.",
        "<b>Công thức game không cho mô phỏng</b> nay hiện tên ở cuối bảng thay vì bị bỏ qua; nghề nào kết quả không đổi theo cách lửa thì ghi rõ thay vì gán một mức lửa.",
        "<b>Tự Kiểm Tra</b> thêm dòng kiểm ba nghề mới.",
      ],
    },
    {
      t: "Phiên Bản 6.1.1 · Bản Trợ Lý",
      d: "31/10/2026",
      now: false,
      pts: [
        "<b>Tách bản không có Tu Chỉnh:</b> bỏ toàn bộ Tu Chỉnh (kể cả Phẩm Chất); giữ nguyên Trợ Lý với bảy nhóm: Nhân Vật, Kinh Mạch, Đột Phá, Kiếm Lời, Tra Cứu, Ngự Linh, Tự Động.",
        "<b>Giao diện gọn lại:</b> thanh trên cùng chỉ còn Trợ Lý và Nhật Ký Cập Nhật; mở Tool là vào thẳng Trợ Lý.",
        "<b>Kho Thể Chất dự phòng dùng được:</b> mô tả Thể Chất nay lấy được bản đóng gói sẵn khi game chưa trả dữ liệu (ở bản đầy đủ kho này nằm trong Tu Chỉnh nên Trợ Lý không với tới).",
        "<b>Dữ liệu và cách tính của Trợ Lý giữ nguyên</b> theo bản 6.1.1 đã đối chiếu với game 0.0.2.",
      ],
    },
    {
      t: "Phiên Bản 6.1.1",
      d: "31/10/2026",
      now: false,
      pts: [
        "<b>Đối chiếu source game 0.0.2 mới nhất:</b> toàn bộ hàm Trợ Lý nhận diện được, các hàm điều khiển của Auto vẫn còn, hằng số săn cạn và bốn mức Thương Thế vẫn khớp.",
        "<b>Sửa đọc ngưỡng chặn giữa đường:</b> game đặt hằng số này qua một tên khác nên bản trước chỉ dùng giá trị mặc định 30; nay Tool tự lần theo tên để đọc đúng giá trị thật (hiện vẫn là 30).",
      ],
    },
    {
      t: "Phiên Bản 6.1.0",
      d: "31/10/2026",
      now: false,
      pts: [
        "<b>Thêm nhóm Tự Động</b> (thứ bảy của Trợ Lý) gồm hai tab: <b>Auto Buôn Bán</b> và <b>Auto Săn Yêu</b>; thanh nhóm xếp thành hai hàng cho đủ chỗ.",
        "<b>Auto Buôn Bán:</b> dò các tiệm quanh đây, chọn chuyến mua rẻ bán đắt, tự đi, mua, bán; kiểm lại giá thật ở từng tiệm, giá bán thấp hơn vốn thì dừng và giữ hàng.",
        "<b>Auto Săn Yêu:</b> tự đi qua các nơi hoang dã, săn tới khi cạn lượt; chỉ Tốc Chiến khi game dự đoán thắng chắc, gặp trận khó hoặc việc cần chọn thì dừng.",
        "<b>Khớp dữ liệu mới:</b> Auto Buôn Bán tính Chợ Ngập Hàng (không mua quá số món tiệm bán còn thu, bỏ chuyến khi chợ đã ngập); mức dừng Thương Thế đọc đúng bốn mức của game: Lành Lặn · Thương Nhẹ · Thương Nặng · Trọng Thương.",
        "<b>Mô tả tự khớp:</b> số lần săn mỗi nơi, chu kỳ hồi, ngưỡng thắng chắc và các mức Thương Thế trên giao diện đọc từ hằng số, không còn gõ cứng trong chữ.",
        "<b>Tự Kiểm Tra</b> thêm dòng kiểm các hàm điều khiển game mà Auto cần.",
        "<b>Đối chiếu source game:</b> nơi săn yêu xác định đúng như game (loại địa danh nằm trong danh mục nơi chốn); Auto Buôn Bán bỏ hàng giả và hàng “lau bụi”, bán đúng mức Chợ Ngập Hàng cho phép; nhãn Hàng Buôn đúng tên game; ngưỡng chặn giữa đường dò theo code game thay vì đoán.",
      ],
    },
    {
      t: "Phiên Bản 6.0.0",
      d: "31/10/2026",
      now: false,
      pts: [
        "Không đổi cách tính; Trợ Lý vẫn gồm sáu nhóm: Nhân Vật, Kinh Mạch, Đột Phá, Kiếm Lời, Tra Cứu, Ngự Linh.",
        "Ở bản đầy đủ, sau khi Phẩm Chất gộp vào Tu Chỉnh, Trợ Lý trở thành mục lớn thứ hai của Tool.",
      ],
    },
    {
      t: "Bản 2.6",
      d: "",
      now: false,
      pts: [
        "<b>Lối Build nối vào Kinh Mạch:</b> chọn Lối Build ngay trong tab Kinh Mạch; khi xếp, Tool cộng điểm cho món đúng lối đang thông (thêm nếu nằm trên huyệt).",
        "<b>Mô tả Thể Chất</b> đọc thẳng từ kho dữ liệu game đang chạy, thiếu mới dùng bản đóng gói sẵn.",
      ],
    },
    {
      t: "Bản 2.5",
      d: "",
      now: false,
      pts: [
        "<b>Lối Build theo lưu phái:</b> mỗi lối chỉ tính món đúng lưu phái / hệ của lối đó.",
      ],
    },
    {
      t: "Wiki Ngự Linh",
      d: "",
      now: false,
      pts: [
        "Dữ liệu đọc trực tiếp từ game, có bản dự phòng nhúng sẵn khi game chưa nạp xong.",
      ],
    },
    {
      t: "Bản 2.3",
      d: "",
      now: false,
      pts: [
        "Thêm <b>Đồ Nên Săn</b> và <b>Đồ Trong Game</b> (tab Tra Cứu).",
      ],
    },
    {
      t: "Bản 2.1",
      d: "",
      now: false,
      pts: [
        "<b>Ước lượng trận</b> bằng chính hàm tính của game: Thắng Chắc · Thắng, Bị Thương · Thua · Thua Nặng (Tử Địa).",
      ],
    },
    {
      t: "Bản 2.0",
      d: "",
      now: false,
      pts: [
        "Bổ sung một loạt tính năng mới (mã nguồn không ghi chi tiết từng mục).",
      ],
    },
  ];

  function verCard(e) {
    return (
      '<div class="vm-card"><h4>' +
      e.t +
      (e.now ? ' <span class="vpc-tag">Mới Nhất</span>' : "") +
      "</h4>" +
      (e.d ? '<div class="nk-date">' + e.d + "</div>" : "") +
      '<ul class="vpc-ul">' +
      e.pts
        .map(function (p) {
          return "<li>" + p + "</li>";
        })
        .join("") +
      "</ul></div>"
    );
  }

  function init() {
    if (inited) return;
    var root = UI.nkBody;
    if (!root) return;
    inited = true;
    root.innerHTML =
      '<div class="vm-hint">' +
      HINT +
      "</div>" +
      LOG.map(verCard).join("");
  }
  return { init: init };
})(UI);

