# Khóa cân bằng cho mod

Sinh bởi `npm run export-mod-schema` (app/scripts/export-mod-schema.ts), không sửa tay. Bản JSON: `/mod/balance.json` của mỗi bản build.

Khóa dùng trong `balance:` của `mod.yaml` hoặc `mod.setBalance({...})` ở pha `boot` (gdd 60 §8.3). Dạng `module.TÊN`, thêm
`.trường` / `.chỉ_số` để đổi một phần tử của object / mảng (vd. `difficulty.DIFFICULTY.enemyHealth`, `combat.ENEMY_BASE_STAT.2`).
Giá trị phải cùng kiểu với giá trị hiện tại. Hằng dẫn xuất từ hằng khác không tự tính lại: đổi cả hai.

## breakthrough

| Khóa | Giá trị | Ghi chú |
|---|---|---|
| `breakthrough.TI_LE_THEO_PHAM` | `{"ha":-0.05,"trung":0,"thuong":0.05,"hoan_my":0.1}` | Tỉ lệ lần đột phá đại cảnh giới kế theo phẩm chất cảnh giới hiện tại (§5.2). Tăng: phẩm cao được thưởng nhiều hơn, đột phá dễ hơn. |
| `breakthrough.REALM_BREAKTHROUGH_BASE` | `[1,1,0.3,0.25,0.1,0.05]` | Tỉ lệ gốc lên từng cảnh giới, từ Phàm Nhân tới Hóa Thần. |
| `breakthrough.CONG_PHAP_CAP` | `0.12` | Trần cộng từ bị động `dot_pha` của công pháp. Tăng: công pháp hỗ trợ đột phá mạnh hơn. |
| `breakthrough.NOI_CONG` | `{"dong_phu":0.1,"son_thuy":0.05,"thanh_tri":-0.05}` | Mỗi nơi xung kích: cộng / trừ tỉ lệ theo loại nơi (động phủ, linh địa, thành trì). Tăng: chọn nơi tốt lợi hơn. |
| `breakthrough.NOI_CONG_HIGH` | `{"dong_phu":0.05,"tong_mon":0.05,"son_thuy":0,"thanh_tri":-0.1}` | Nơi xung kích lên Nguyên Anh, Hóa Thần; sư môn chỉ tính khi thuộc tông của mình. |
| `breakthrough.SECT_HOME_BONUS` | `0.05` | Xung kích ngay trong tông môn của mình (sư môn): cộng chừng này tỉ lệ. Tăng: về sư môn đột phá lợi hơn. |
| `breakthrough.TI_LE_LINH_KHI` | `[-0.05,-0.02,0,0.05]` | Linh khí chỗ xung kích (gdd 19 §1.4), theo bậc của LINH_KHI: rất loãng, loãng, trung bình, dồi dào. Tăng: chọn chỗ linh khí đáng công hơn. |
| `breakthrough.PHAT_BI_QUAY` | `0.15` | Bị quấy giữa lúc xung kích: khí tức rối loạn, trừ chừng này tỉ lệ. Tăng: biến cố giữa chừng nguy hơn. |
| `breakthrough.DI_TUONG_HE_SO` | `[1,1,1.5,2,3]` | Dị tượng đột phá (gdd 19 §1.5): hệ số nhân tỉ lệ bị quấy lúc xung kích ở chỗ trống trải (ngoài trời, thôn trấn), theo cảnh giới đích (chỉ số = cảnh giới đích: Luyện Khí ×1, Trúc Cơ ×1,5, Kết Đan ×2, Nguyên Anh trở lên ×3). Tăng: đột phá ngoài trời nguy hơn, động phủ / sơn môn đáng giá hơn. |
| `breakthrough.GUARDIAN_BONUS` | `0.05` | Hộ pháp canh ngoài động phủ: cộng chừng này tỉ lệ. Tăng: có hộ pháp lợi hơn. |
| `breakthrough.INJURY_PENALTY` | `0.1` | Mỗi bậc thương thế trừ chừng này tỉ lệ. Tăng: cố đột phá lúc bị thương khó hơn. |
| `breakthrough.PREV_FAIL_PENALTY` | `[0.05,0.05,0.05,0.05,0.1,0.1]` | Mỗi đạo cơ chấn tổn (thất bại chưa chữa, gdd 13 §14) ở cùng cảnh giới đích trừ chừng này tỉ lệ; 5%, lên Nguyên Anh / Hóa Thần 10%. Tăng: thất bại dồn lại nặng hơn. |
| `breakthrough.ROOT_DAMAGE_PENALTY` | `0.05` | Mỗi điểm căn cơ tổn hại trừ chừng này tỉ lệ. Tăng: tẩu hỏa để lại hậu quả dài hơn. |
| `breakthrough.BACKLASH_PER_POINT` | `0.03` | Phản phệ: mỗi điểm nghịch kinh mạch (× hệ số thể chất) trừ chừng này tỉ lệ. Tăng: tu đường nghịch đột phá khó hơn. |
| `breakthrough.BACKLASH_CAP` | `0.15` | Trần phần trừ do phản phệ. Tăng: phản phệ có thể nặng hơn. |
| `breakthrough.PHAT_SOM` | `[0,0.1,0.2]` | Phạt đột phá sớm theo `som` (§2.2): 0 viên mãn, 1 Đại viên mãn chưa đầy, 2 Hậu kỳ. Tăng: đột phá sớm khó hơn (áp tới Kết Đan). |
| `breakthrough.EARLY_BREAKTHROUGH_MULT` | `[1,0.8,0.5]` | Nhân tỉ lệ khi đột phá sớm: Viên mãn, chưa đầy, từ Hậu kỳ; áp dụng từ Nguyên Anh. Giảm: đột phá sớm ở Nguyên Anh trở lên khó hơn. |
| `breakthrough.SO_DAN_TOI_DA` | `2` | Số đan phụ trợ tối đa mỗi lần xung kích. Tăng: chồng được nhiều đan hơn. |
| `breakthrough.BREAKTHROUGH_PILL_REALM_SPAN` | `2` | Đan cộng tỉ lệ chỉ dùng được tới cảnh giới cao hơn cảnh giới của phẩm đan chừng này bậc. |
| `breakthrough.NAC_THIEU_DOT` | `2` | Số nấc thiêu đốt thọ nguyên tối đa. Tăng: đổi thọ lấy tỉ lệ được nhiều hơn. |
| `breakthrough.THIEU_DOT` | `{"tho":0.1,"tiLe":[0,0,0.1,0.08,0.07,0.06]}` | Mỗi nấc thiêu đốt: % thọ nguyên tối đa của cảnh giới hiện tại, + tỉ lệ (theo cảnh giới sắp lên: giảm dần). Tăng `tho`: thiêu đốt tốn nhiều năm hơn; tăng `tiLe`: thiêu đốt lợi hơn. |
| `breakthrough.BREAK_SITE_RENT` | `20` | Mượn linh mạch khi đột phá (gdd 48 §4.4): giá = chừng này × L(cảnh giới đích), ở tông của mình / kinh đô / Vạn Bảo Thương Hội. Tăng: mượn đắt hơn. |
| `breakthrough.BREAK_SITE_RANK_DISCOUNT` | `[1,1,0.7,0.5,0.3]` | Tông của mình giảm giá mượn linh mạch theo cấp bậc (chỉ số = cấp bậc: Tạp dịch, Ngoại môn, Nội môn, Chân truyền, Trưởng lão). Giảm: người trong tông được giá tốt hơn. |
| `breakthrough.BREAK_SITE_MIN_REALM` | `3` | Mượn linh mạch chỉ mở từ cảnh giới đích này (Kết Đan) trở lên. |
| `breakthrough.NGO_DAO_MOI_NAM` | `0.02` | Ngộ đạo mỗi năm thật bế quan ở Nguyên Anh Đại viên mãn (§2.3). Tăng: ngộ đạo nhanh hơn. |
| `breakthrough.THUONG_THANG_TAM_MA` | `0.05` | Thắng trận tâm ma cộng chừng này tỉ lệ. Tăng: vượt tâm ma được thưởng nhiều hơn. |
| `breakthrough.CAN_GIOI_TAM_MA` | `4` | Từ cảnh giới đích này (Nguyên Anh) trở đi có trận tâm ma. Giảm: tâm ma xuất hiện sớm hơn. |
| `breakthrough.TAM_MA_HO_PHAP` | `10` | Hộ pháp bớt chừng này điểm tâm ma hiệu dụng. Tăng: hộ pháp trấn tâm ma mạnh hơn. |
| `breakthrough.GUONG_TAM_MA` | `{"goc":0.75,"toiDa":1.3}` | Tâm ma soi gương người chơi (gdd 13 §7): sức lúc T = 0 (`goc`) và trần (`toiDa`). Tăng: tâm ma mạnh hơn. |
| `breakthrough.GUONG_HIEU_CHINH` | `{"minHiep":3}` | Hiệu chỉnh uy tâm ma (2026-11-02, người chơi báo bị đánh một đòn chết): `minHiep` = sát thương người chơi gây mỗi hiệp lấy chuẩn tối thiểu từng này hiệp (giết tâm ma trong 1 hiệp thì không ép tâm ma gây k² × khí huyết trong 1 hiệp). Giảm: tâm ma nhẹ tay với người chơi đánh nhanh. |
| `breakthrough.TAM_MA_BOSS_AT` | `40` | Tâm ma hiệu dụng từ mức này là trận Boss. Giảm: tâm ma nặng sớm hơn. |
| `breakthrough.TAM_MA_ELITE_AT` | `15` | Tâm ma hiệu dụng từ mức này là trận Tinh anh. Giảm: tâm ma nặng sớm hơn. |
| `breakthrough.SO_KIM_DAN` | `{"ha":[7,9],"trung":[4,6],"thuong":[2,3],"hoan_my":[1,1]}` | Khoảng số phẩm kim đan theo bậc (§5): số nhỏ là phẩm cao. |
| `breakthrough.GRADE_CAP_RATE` | `0.05` | Cầu phẩm (gdd 13 §13): mỗi bậc kỳ vọng bị trần cắt cộng chừng này tỉ lệ. Tăng: hạ trần phẩm lợi hơn. |
| `breakthrough.GRADE_CAP_BONUS_MAX` | `0.1` | Cầu phẩm cộng tối đa chừng này tỉ lệ dù hạ nhiều bậc. |
| `breakthrough.GRADE_ROLL` | `[[1,0.2],[0,0.6],[-1,0.2]]` | Phân bố phẩm quay (§5.1): [lệch bậc, xác suất]; khớp ngưỡng 0,2 / 0,4 trong `thanhCong`. Tăng xác suất lệch +1: dễ ra phẩm cao hơn. |
| `breakthrough.GRADE_REALMS` | `[2,3,4,5]` | Cảnh giới sửa được phẩm: Trúc Cơ, Kết Đan, Nguyên Anh, Hóa Thần. |
| `breakthrough.NURTURE_CAP` | `2` | Ôn dưỡng không vượt trần Thượng (bậc 2): Hoàn Mỹ chỉ đến từ đột phá hoặc trùng kết. Tăng: ôn dưỡng được lên cao hơn. |
| `breakthrough.FAIL_DEATH_BELOW` | `[0.1,0.1,0.1,0.1,0.1,0.15]` | Số ngẫu nhiên r (0–1) dưới mức này khi có thể chết thì chết (Nguyên Anh trở lên hoặc đang bị thương). Tăng: thất bại dễ chết hơn. |
| `breakthrough.FAIL_FIRE_BELOW` | `0.3` | r dưới mức này (từ Kết Đan) là tẩu hỏa nhập ma, căn cơ tổn hại. Tăng: tẩu hỏa thường hơn. |
| `breakthrough.FAIL_SETBACK_BELOW` | `0.6` | r dưới mức này là tụt tầng / tu vi tán loạn, bị thương; trên là chỉ hao tu vi. Tăng: hậu quả nặng thường hơn. |
| `breakthrough.BREAKTHROUGH_BACKLASH_CHANCE_PER_POINT` | `0.1` | Phản phệ: mỗi điểm nghịch (× hệ số thể chất) thêm chừng này xác suất hậu quả nặng thêm một bậc. Tăng: tu đường nghịch thất bại đau hơn. |
| `breakthrough.BACKLASH_ROLL_SHIFT` | `0.3` | Khi phản phệ trúng: r bị trừ chừng này (nặng thêm một bậc). Tăng: phản phệ đẩy hậu quả nặng hơn. |
| `breakthrough.FAIL_KEEP_TU_VI` | `0.8` | Thất bại nhẹ nhất (hao tổn): giữ lại chừng này phần tu vi. Giảm: mất nhiều tu vi hơn. |
| `breakthrough.REFORGE_FIRE_RISK` | `{"2":0.1,"3":0.1,"4":0.15,"5":0.15}` | Tẩu hỏa khi trùng kết theo cảnh giới (Hạ bất kể công thức, căn cơ tổn hại +1, thương thế nặng). Tăng: trùng kết rủi ro hơn. |
| `breakthrough.REFORGE_DEATH_SHARE` | `0.3333333333333333` | Nguyên Anh, Hóa Thần: một phần ba rủi ro tẩu hỏa là chết (5% tổng). Tăng: trùng kết ở hai cảnh giới này dễ chết hơn. |
| `breakthrough.MAX_REFORGE_PILLS` | `2` | Số đan tối đa dùng cho một lần trùng kết. Tăng: chồng được nhiều đan hơn. |
## combat

| Khóa | Giá trị | Ghi chú |
|---|---|---|
| `combat.MORTAL_HP` | `30` | Khí huyết Phàm Nhân (người chơi, đồng minh, địch cùng thang). Không nhân tiểu cảnh giới. |
| `combat.MORTAL_SPELL_POWER` | `4` | Pháp lực (sát thương chuẩn mỗi lượt) Phàm Nhân. |
| `combat.QI_START_HP` | `115` | Khí huyết Sơ kỳ Luyện Khí: mốc của thang cảnh giới (gdd 40 §2). Tăng: cả thang từ Luyện Khí trở lên lớn theo. |
| `combat.QI_START_SPELL_POWER` | `15` | Pháp lực Sơ kỳ Luyện Khí: mốc của thang pháp lực (gdd 40 §2). |
| `combat.HE_SO_TIEU` | `1.15` | Mỗi tiểu cảnh giới nhân khí huyết và pháp lực (gdd 40 §2). Tăng: tiểu cảnh giới cao vượt trội hơn. |
| `combat.REALM_JUMP` | `1.7` | Sơ kỳ đại cảnh giới sau = Đại viên mãn cảnh giới trước × hệ số này (gdd 40 §2). Tăng: mỗi đại cảnh giới nhảy vọt hơn. |
| `combat.REALM_MAX` | `5` | Cảnh giới cao nhất của bảng (5 = Hóa Thần); cảnh giới ngoài bảng dùng cảnh giới này. |
| `combat.INNATE_SKILL` | `{"id":"innate.chan_nguyen_kich","ten":"Chân Nguyên Kích","minRealm":1,"uy":0.6,"hoi":0,"costRatio":0.6}` | Chiêu bẩm sinh Chân Nguyên Kích (gdd 37 §3.2): mọi tu sĩ từ Luyện Khí có sẵn, không chiếm ô lưới, vô sắc, đánh một mục tiêu. Phí = `costRatio` × phí chuẩn của cảnh giới mình (tính ở combat/setup.ts, vì phí chuẩn nằm ở balance/cultivation.ts). |
| `combat.HIEP_TOI_DA` | `30` | Đánh tới hiệp này mà chưa phân thắng bại thì đối phương rút đi. Tăng: trận kéo dài được lâu hơn. |
| `combat.UY_DI_ANH` | `1.15` | Dị anh: chiêu cùng hệ dị tượng nhân uy lực (gdd 13 §5.2). Tăng: dị anh mạnh hơn. |
| `combat.DI_HOA_COMBAT_BONUS` | `[0,0,0.06,0.08,0.1,0.12,0.15,0.2]` | Dị hỏa đang đeo: chiêu cùng hệ với lửa nhân uy thêm (1 + mức theo phẩm lửa; gdd 17 §15.6). Chỉ số = phẩm − 1 (phẩm 1–8). Tăng: dị hỏa mạnh hơn trong trận. |
| `combat.NGUONG_TA` | `0.08` | Ngưỡng khống chế khi mục tiêu là người chơi (địch theo mức, §1.5). Tăng: người chơi khó bị trói hơn. |
| `combat.SPEED_PER_RANK` | `4` | Thân pháp (tốc) cộng thêm mỗi bậc (4 × cảnh giới + tiểu cảnh giới) của người ra đòn. Tăng: cảnh giới cao nhanh hơn rõ rệt. |
| `combat.SPIRIT_STORE_TURNS` | `3` | Linh lực tối đa trong đan điền = chừng này lượt linh lực mỗi lượt (gdd 12). Tăng: trữ được nhiều lượt chiêu hơn. |
| `combat.DONG_MINH_TOI_DA` | `11` | Tối đa đồng minh (gdd 41 §4): người chơi + 11 = 12 ô lưới. Tăng: trận đông hơn. |
| `combat.FORMATION_PER_SIDE` | `2` | Số trận pháp mỗi phe, tính cả trận có sẵn. Tăng: được giữ nhiều trận cùng lúc. |
| `combat.FORMATION_SPIRIT_LOCK` | `0.2` | Mỗi trận người chơi bày (kể cả có sẵn khi bế quan ngoài trời) khóa phần này linh lực tối đa tới khi trận tan. Tăng: bày trận đắt hơn. |
| `combat.FORMATION_EYE_HP` | `0.5` | Khí huyết trận nhãn = hệ số này × f × khí huyết tối đa người bày. Tăng: trận khó phá hơn. |
| `combat.FORMATION_SPLASH` | `0.3` | Sát trận: đòn đơn trúng một địch lan phần này × f sang hai địch kề. Tăng: sát trận mạnh hơn. |
| `combat.FORMATION_MISDIRECT` | `0.2` | Mê trận: đòn đơn của phe kia có tỉ lệ này × f đánh nhầm đồng bọn. Tăng: mê trận mạnh hơn. |
| `combat.FORMATION_RAISE_HP` | `0.3` | Câu hồn: địch ngã đứng dậy với phần này × f khí huyết tối đa. Tăng: con dậy trâu hơn. |
| `combat.FORMATION_RAISE_TURNS` | `2` | Câu hồn: số lượt con dậy đánh rồi tan. |
| `combat.FORMATION_RAISE_MAX` | `2` | Câu hồn: số con dậy tối đa mỗi trận. |
| `combat.FORMATION_BLOOD_SPIRIT` | `0.1` | Huyết tế: mỗi người ngã, người bày hồi phần này × f linh lực tối đa. Tăng: huyết tế mạnh hơn. |
| `combat.FORMATION_HEAL_CUT` | `0.5` | Tuyệt Sinh: khí huyết phe kia hồi được × (1 − hệ số này · f). Tăng: chống hồi mạnh hơn. |
| `combat.FORMATION_SHIELD_CUT` | `0.5` | Phá Thuẫn: hộ thuẫn phe kia nhận × (1 − hệ số này · f). Tăng: chống thuẫn mạnh hơn. |
| `combat.FORMATION_ELEMENT_BONUS` | `0.2` | Ngũ Hành: đòn đúng hệ của trận bàn, sát thương phe bày × (1 + hệ số này · f). Tăng: trận hệ mạnh hơn. |
| `combat.FORMATION_CHANCE_BONUS` | `0.15` | Dẫn Linh: tỉ lệ khống chế / hiệu ứng hại / phù của phe bày cộng thẳng hệ số này · f. Tăng: dẫn linh mạnh hơn. |
| `combat.FORMATION_SPIRIT_DRAIN` | `0.25` | Tán Linh: linh lực phe kia sinh mỗi lượt × (1 − hệ số này · f). Tăng: bóp linh lực mạnh hơn. |
| `combat.DICH_TOI_DA` | `12` | Tối đa địch mỗi trận. Tăng: trận đông địch hơn. |
| `combat.SUMMON_ENEMY_CAP` | `4` | Hú bầy / viện binh chỉ gọi thêm khi số địch còn đứng chưa đủ chừng này (giữ cân bằng cũ, không theo trần sân). |
| `combat.ALLY_REQUEST_MAX` | `2` | Số đồng minh tối đa nội dung (`dong_minh`, đồng hành) được xin vào một trận. |
| `combat.LOAI` | `{"yeu_thu":{"thanPhap":12,"anTuc":5,"ai":"da_tinh","chieu":["chieu.can_xe","chieu.vo"],"chieuManh":["chieu.gam_thet"]},"tu_si":{"thanPhap":10,"anTuc":10,"ai":"tinh_toan","chieu":["chieu.phap_thuat","chieu.ho_the_chan_khi","chieu.sat_chieu"],"chieuManh":["chieu.lieu_thuong"]}}` | Loại địch (gdd 40 §10.6): thân pháp / ẩn tức mặc định (mốc để tính độ lệch `than_phap` / `an_tuc` của khuôn, không còn là chỉ số), kiểu AI, bộ chiêu mặc định khi khuôn không ghi `chieu` (thường / mạnh). Sức địch không nhân theo loại nữa. |
| `combat.MUC` | `{"thuong":{"anTuc":0,"nguong":0.08,"effectResist":0},"tinh_anh":{"anTuc":5,"nguong":0.12,"effectResist":0.05},"boss":{"anTuc":10,"nguong":0.15,"effectResist":0.1},"lau_la":{"anTuc":0,"nguong":0.05,"effectResist":0}}` | Theo mức địch (§1.5): ẩn tức cộng thêm, ngưỡng khống chế. Sức đánh / khí huyết theo `ENEMY_RANK`. Tăng anTuc: khó bị thần thức nhìn thấu; tăng nguong: khó trói hơn. |
| `combat.ENEMY_RANK` | `{"lau_la":{"skillGear":[1,1],"passiveGear":[0,0],"talents":[1,1],"talentGear":[0,0],"pieceFactor":0.7,"hp":0.5},"thuong":{"skillGear":[2,2],"passiveGear":[1,2],"talents":[2,2],"talentGear":[0,1],"pieceFactor":1,"hp":1.8},"tinh_anh":{"skillGear":[3,3],"passiveGear":[2,3],"talents":[2,3],"talentGear":[1,1],"pieceFactor":1.2,"hp":1.45},"boss":{"skillGear":[4,4],"passiveGear":[3,4],"talents":[3,3],"talentGear":[2,2],"pieceFactor":1.4,"hp":1.55}}` | Bảng hạng địch (gdd 40 §10.5): hạng cao = bộ đồ dày hơn, hệ số mảnh cao hơn, thêm chút khí huyết; không nhân sát thương trực tiếp. Tăng pieceFactor: chiêu và linh lực hạng đó mạnh theo xấp xỉ bình phương; tăng hp: hạng đó trâu hơn. Khí huyết chỉnh 2026-10-20 theo mục tiêu thắng mới của người chuẩn (§10.10: thường 70–80%, tinh anh 45–65%, boss 10–20%); chỉnh lại sau khi quyền cước đổi theo pháp lực (§12), rồi hạ khi có điểm sở trường và AI theo bậc (§13.3). |
| `combat.ENEMY_PIECE_FACTOR_BY_REALM` | `[1,1.1,1.3,1.6,1.8,2]` | Hệ số mảnh giả lập nhân thêm theo cảnh giới địch (Phàm Nhân → Hóa Thần), nhân vào `ENEMY_RANK.pieceFactor`. Người chơi lên cảnh giới thì lưới có nhiều huyệt, hệ số mảnh trung bình người 6 mảnh đo 1,24 / 1,49 / 1,81 / 1,90 / 2,25 / 2,16 (2026-10-21); địch neo khoảng 80–90%. Tăng: chiêu và linh lực địch cảnh giới đó mạnh hơn. |
| `combat.ENEMY_PIECE_FACTOR_SPREAD` | `0.15` | Mỗi món trong bộ địch lệch hệ số mảnh ngẫu nhiên trong ±tỉ lệ này quanh hạng × cảnh giới (rút theo seed). Tăng: bộ địch chênh nhau nhiều hơn. |
| `combat.ALLY_HP` | `1` | Khí huyết đồng minh (rút bộ như địch thường nhưng không theo `ENEMY_RANK.thuong.hp`: địch trâu lên thì đồng minh không trâu theo). |
| `combat.ENEMY_GEAR_STANDARD_CHANCE` | `[0.15,0.25,0.35,0.55,0.68,0.8]` | Tỉ lệ mỗi món trong bộ tu sĩ là phẩm chuẩn (cảnh giới + 2) theo cảnh giới địch, còn lại thấp hơn một phẩm. Tăng: đồ địch xịn hơn. (`ENEMY_TURN.rareByRealm` chỉ còn cho đan / phù.) |
| `combat.ENEMY_GEAR_STANDARD_BONUS` | `{"lau_la":0,"thuong":0,"tinh_anh":0.15,"boss":0.3}` | Cộng thêm vào tỉ lệ phẩm chuẩn theo hạng (tinh anh +0,15, boss +0,3). Tăng: hạng đó hay có đồ xịn hơn. |
| `combat.ENEMY_SPIRIT_BAND` | `[0.8,1.25]` | Dải linh lực mỗi lượt của bộ tu sĩ so với `LINH_LUC_CHUAN × hệ số mảnh`; ngoài dải thì rút lại bộ (§10.4). |
| `combat.ENEMY_BUILD_SMART` | `[0.2,0.35,0.5,0.65,0.8,0.9]` | Xác suất "thông minh" của mỗi ô khi dựng bộ địch theo cảnh giới (Phàm Nhân → Hóa Thần): thông minh thì chọn món lấp vai còn thiếu (công, khống chế, hồi phục, thủ, hiệu ứng) hoặc món bị động giá trị cao nhất; không thì rút ngẫu nhiên trong pool đã lọc. Tăng: bộ địch đủ vai hơn. |
| `combat.ENEMY_SKILL_GEAR_BY_REALM` | `[0,0,1,2,2,3]` | Số món có chiêu (tu sĩ) / chiêu thiên phú (phi nhân) cộng thêm theo cảnh giới địch (Phàm Nhân → Hóa Thần), cộng vào số theo hạng `ENEMY_RANK`; lâu la không cộng (gdd 40 §15.8, +1 mọi cảnh giới §15.10, Phàm Nhân / Luyện Khí bớt lại 1 cho đầu game dễ thở hơn 2026-10-22). Người chơi cảnh giới cao mang nhiều chiêu, địch thường cũng phải có. Tăng: địch cảnh giới đó nhiều chiêu hơn. |
| `combat.ENEMY_BUILD_SMART_RANK` | `{"lau_la":-0.1,"thuong":0,"tinh_anh":0.1,"boss":0.2}` | Cộng vào xác suất thông minh theo hạng (kết quả kẹp 0–1). |
| `combat.ENEMY_BUILD_TRIES` | `12` | Số lần rút lại bộ tối đa để linh lực vào dải; hết lần thì lấy bộ gần dải nhất. Tăng: bộ khít dải hơn, tốn thời gian dựng hơn. |
| `combat.ENEMY_BASE_STAT` | `[10,14,18,22,26,30]` | Chỉ số nền mặc định của địch theo cảnh giới (căn cốt, thân pháp, thần thức), khởi điểm 10 + 4 × cảnh giới (§10.14 mục 4). Sẽ đặt bằng trung vị người chơi cùng cảnh giới sau khi đo bot. Tăng: địch cảnh giới đó có khí huyết (căn cốt), tốc, ẩn tức cao hơn. |
| `combat.ENEMY_BEAST_HP_MULT` | `1.2` | Buff phi nhân (bù ít đồ, không đan / phù, AI dã tính; §10.6): nhân khí huyết. |
| `combat.ENEMY_BEAST_TALENT_PIECE_BONUS` | `0` | Buff phi nhân: cộng vào hệ số mảnh của chiêu thiên phú. Về 0 (2026-10-20): độ khó chuyển sang khí huyết hạng. |
| `combat.ENEMY_BEAST_STAT_BONUS` | `0` | Buff phi nhân: cộng vào chỉ số nền (căn cốt, thân pháp, thần thức). Về 0 (2026-10-20): +5 thân pháp làm phi nhân Phàm Nhân đi trước gần như mọi trận. |
| `combat.ENEMY_SKILL_COST_CAP` | `1.8` | Phí chiêu thiên phú = `skillCostStandard(cảnh giới) × min(uy / giá dạng, hằng này)` (§10.14 mục 3): kẹp vì vài chiêu `uy` rất cao. Tăng: chiêu mạnh tốn linh lực hơn. |
| `combat.AI_SPIRIT_HOLD_BELOW` | `0.5` | Tu sĩ `tinh_toan` giữ linh lực cho sát chiêu khi mục tiêu còn dưới tỉ lệ khí huyết này (§10.9). Tăng: giữ chiêu sớm hơn. |
| `combat.BOOST_AXES` | `["hp","power","spirit","agility","guard","gear","quality","mind"]` |  |
| `combat.ENEMY_BOOST_POINTS` | `{"lau_la":[0,0],"thuong":[1,2],"tinh_anh":[4,5],"boss":[7,7]}` | Số điểm sở trường mỗi địch nhận lúc rút bộ, theo hạng, `[ít nhất, nhiều nhất]` (rút theo seed). NPC siêu mạnh tính như boss. Tăng: địch hạng đó mạnh theo nhiều trục hơn. |
| `combat.ENEMY_FAMILIAR_COUNT` | `{"lau_la":1,"thuong":1,"tinh_anh":2,"boss":3}` | Tu sĩ dẫn con (thú, cổ, thi, khôi, hồn — khuôn đi kèm loại yêu thú): số con ít nhất theo hạng chủ, lấy max với `bay` của khuôn. Tăng: phái ngự linh địch đông con hơn. |
| `combat.ENEMY_PET_CHANCE` | `{"lau_la":[0,0,0,0,0,0],"thuong":[0,0,0,0.15,0.25,0.35],"tinh_anh":[0.25,0.25,0.25,0.4,0.55,0.7],"boss":[0.5,0.5,0.5,0.7,0.85,1]}` | Tỉ lệ tu sĩ địch (trừ phàm nhân) mang một linh thú cùng cảnh giới theo hạng và cảnh giới địch (Phàm Nhân → Hóa Thần). Từ Kết Đan tăng dần, địch thường cũng có (gdd 53 A1). Tăng: hay gặp tu sĩ có linh thú hơn. |
| `combat.ENEMY_FORMATION_CHANCE` | `{"lau_la":[0,0,0,0,0,0],"thuong":[0,0,0,0.1,0.2,0.3],"tinh_anh":[0.25,0.25,0.25,0.35,0.5,0.6],"boss":[0.5,0.5,0.5,0.6,0.75,0.9]}` | Tỉ lệ tu sĩ địch (trừ phàm nhân) bày một trận từ lượt đầu theo hạng và cảnh giới địch (gdd 53 A1). Tăng: hay gặp trận pháp hơn. |
| `combat.SECT_GUARD_FORMATION_CHANCE` | `0.8` | Trận hộ sơn (`combat: { ho_son: true }`, công phá sơn môn, gdd 53 B): tỉ lệ phe tông đã bày một trận bàn phẩm chuẩn từ lượt đầu. Tăng: tông hay có trận hơn. |
| `combat.ENEMY_DEMON_SHARE` | `0.5` | Ma tu địch (kiểu `ma`) coi như mang ma niệm bằng tỉ lệ này của trần khống ma: chiêu × `demonFactor` như người chơi tà. Tăng: ma tu địch nặng tay hơn. |
| `combat.ENEMY_CROWD_POINTS_MAX` | `3` | Hung uy: mỗi đơn vị phụ phe ta lúc vào trận (con, linh thú, đồng minh; không tính trận nhãn) cho địch phi nhân (trừ lâu la) một điểm sở trường khí huyết / pháp lực xen kẽ, tối đa chừng này. Tăng: phi nhân đuổi kịp người đông hơn. |
| `combat.ENEMY_BOOST` | `{"hp":{"per":0.2,"max":3},"power":{"per":0.12,"max":3},"spirit":{"per":0.15,"max":2},"agility":{"per":6,"max":2},"guard":{"per":0.03,"max":2},"gear":{"per":1,"max":2},"quality":{"per":1,"max":1},"mind":{"per":1,"max":1}}` | Giá trị mỗi điểm (`per`) và số điểm tối đa vào một trục (`max`). hp: +% khí huyết (không vào nền thể); power: +% pháp lực; spirit: +% linh lực mỗi lượt và tối đa; agility: + thân pháp; guard: + hộ thể (trần `HO_THE_MAX`); gear: +món; quality / mind: không dùng `per`. Tăng `per`: mỗi điểm mạnh hơn. Tăng `max`: một con dồn được nhiều điểm hơn vào trục đó. |
| `combat.ENEMY_BOOST_WEIGHT` | `{"hp":1,"power":1,"spirit":1,"agility":1,"guard":1,"gear":1,"quality":1,"mind":1}` | Trọng số rút trục cho mỗi điểm sở trường (bằng nhau = đều tay). Tăng: trục đó hay được chọn hơn. |
| `combat.ENEMY_BOOST_KIEU_WEIGHT` | `{"the_tu":{"hp":2,"guard":2},"kiem":{"power":2,"agility":2}}` | Nghiêng nhẹ trọng số theo kiểu khuôn (nhân vào `ENEMY_BOOST_WEIGHT`): thể tu ưu khí huyết / hộ thể, kiếm tu ưu pháp lực / thân pháp. Tăng: kiểu đó nghiêng rõ hơn. |
| `combat.AI_TEMPERATURE` | `[0.6,0.4,0.25,0.12]` | Nhiệt độ chọn phương án của AI theo bậc 0–3 (§13.2). Phương án được chấm 0–1 (tốt nhất = 1), chọn trong `AI_TOP_CHOICES` phương án đầu theo trọng số `exp((điểm - 1) / T)`. 0 = luôn chọn phương án tốt nhất (tất định, không tốn RNG). Tăng: bậc đó khó đoán và đánh kém hơn. |
| `combat.AI_LEVEL_UP` | `[0.1,0.15,0.25,0.35,0.45,0.55]` | Xác suất địch lên 1 bậc AI theo cảnh giới (Phàm Nhân → Hóa Thần). Tăng: địch cảnh giới đó thông minh hơn. |
| `combat.AI_LEVEL_UP_RANK` | `{"lau_la":-0.1,"thuong":0,"tinh_anh":0.15,"boss":0.3}` | Cộng vào xác suất lên bậc AI theo hạng (kết quả kẹp 0–1). Tăng: hạng đó thông minh hơn. |
| `combat.AI_LEVEL_UP_EXTRA_FROM` | `3` | Tinh anh / boss từ cảnh giới này trở lên gieo lần lên bậc thứ hai (3 = Kim Đan). Giảm: nhiều địch có hai lần gieo hơn. |
| `combat.AI_FORCE_LEVEL` | `-1` | Ép mọi địch về một bậc AI (0–3) để đo theo bậc; âm = không ép (dùng bậc đã rút). Chỉ dùng trong kịch bản đo. |
| `combat.AI_TOP_CHOICES` | `3` | Số phương án tốt nhất AI cân nhắc khi chọn theo nhiệt độ. Tăng: AI khó đoán hơn. |
| `combat.AI_SHIELD_FULL_RATIO` | `0.5` | Bậc 2+: không dựng thuẫn khi hộ thuẫn còn trên tỉ lệ này của trần (`SHIELD_CAP_RATIO`). Giảm: AI dựng thuẫn dè dặt hơn. |
| `combat.AI_LOOKAHEAD_WEIGHT` | `0.8` | Bậc 3 tính trước: giá trị lượt sau nhân hệ số này khi chấm cặp (lượt này, lượt sau). Tăng: AI nhịn đòn lượt này để dồn lượt sau nhiều hơn. |
| `combat.UY_AP` | `[1,1,1,1,1,1,1,1.3,1.1,1.1,1.1,1.3,1.2,1.2,1.2,1.3,1.3,1.3,1.3,1.5,1.4,1.4,1.4,1]` | Uy áp chiến lực của từng bước bậc k → k + 1 (bậc = 4 × cảnh giới + tiểu cảnh giới, §22); kịch bản có thể thử bộ số khác. Sinh từ `UY_AP_BY_REALM` (gdd 40 §16); kịch bản đổi cả mảng qua `combat.UY_AP`. |
| `combat.REALM_GAP_EFFECT` | `[1,0.5,0.15,0]` | Mọi khống chế, hiệu ứng hại, kích ấn: hệ số tỉ lệ theo cảnh giới đích − nguồn; phần tử cuối dùng từ chênh 3. |
| `combat.TALISMAN_BOSS_CONTROL_MULT` | `0.5` | Boss, thủ bảo: trói khó hơn và chỉ mất tối đa một lượt. |
| `combat.TALISMAN_BOSS_CONTROL_TURNS` | `1` |  |
| `combat.TALISMAN_CONTROL_CHANCE` | `0.75` | Phù trói (người chơi và địch): tỉ lệ gốc, trước chênh cảnh giới và boss. Giảm: phù trói khó trúng hơn. |
| `combat.EFFECT_CHANCE_MIN` | `0.15` | Sàn tỉ lệ trúng của hiệu ứng hại / trói: kháng không đẩy tỉ lệ xuống dưới mức này (tỉ lệ gốc vốn thấp hơn thì giữ nguyên). |
| `combat.CONTROL_CHANCE_BY_REALM` | `[0.6,0.65,0.7,0.75,0.8]` | Tỉ lệ trói gốc của chiêu địch thiếu `controlChance`, theo đại cảnh giới của kẻ ra chiêu (Phàm Nhân … Nguyên Anh trở lên); trói 2 lượt trừ 0,1. |
| `combat.TALISMAN_ESCAPE_DROP` | `0.4` | Phù độn: mỗi đại cảnh giới vượt phù giảm 40%, sàn 10%. |
| `combat.TALISMAN_ESCAPE_MIN` | `0.1` |  |
| `combat.ENEMY_TURN` | `{"actions":{"thuong":2,"tinh_anh":2,"boss":3,"lau_la":1},"combo":{"thuong":0,"tinh_anh":0.06,"boss":0.06,"lau_la":0},"oneshotFactor":0.25,"healBelow":0.3,"smartHealBelow":0.5,"shieldBelow":0.6,"burstAbove":0.4,"useChance":0.5,"dropByRealm":[0.25,0.25,0.2,0.12,0.08,0.06],"carry":{"thuong":0.5,"tinh_anh":0.7,"boss":0.7,"lau_la":0},"kitExtraByRealm":[0,0,1,2,4,6],"rareByRealm":[0.15,0.25,0.35,0.55,0.68,0.8],"healCap":0.3,"phuUy":1.3}` | Lượt của đơn vị AI gồm nhiều bước (gdd 12 §17): chiêu, Quyền cước, đan, phù đều là một bước. Mỗi lượt tối đa một chiêu công / khống chế; liên chiêu (thêm chiêu thứ hai) chỉ theo tỉ lệ hiếm. |
| `combat.ENEMY_KIT` | `{"thuong":["heal","attack"],"lau_la":[],"tinh_anh":["heal","heal","attack"],"boss":["heal","heal","attack","attack"]}` | Đồ mang theo mặc định của tu sĩ theo mức (yêu thú không dùng đan phù). Nội dung ghi `consumables` thì thay. Ghi lặp một loại thì tung riêng từng món; cảnh giới cao tung thêm `ENEMY_TURN.kitExtraByRealm` lượt mỗi loại. Phù thuẫn không có trong bộ mặc định: đo bằng kịch bản 14, boss có phù thuẫn khó hơn hẳn (Kết Đan thắng 100% → 77%). |
| `combat.ENEMY_KIT_BY_REALM` | `{"tinh_anh":[[],[],[],["control"],["control"],["control"]],"boss":[[],[],[],[],[],["shield"]]}` | Đồ cộng thêm theo cảnh giới địch (Phàm Nhân → Hóa Thần), sau lượt tung thêm `kitExtraByRealm` nên mỗi loại chỉ một món (gdd 53 A3): tinh anh từ Kết Đan thêm phù trói, boss từ Nguyên Anh thêm phù thuẫn. Thêm loại: hạng / cảnh giới đó mang thêm món đó. |
| `combat.ENEMY_KIT_BY_SECT` | `{"dan":{"thuong":["heal"],"tinh_anh":["heal","heal","burst"],"boss":["heal","heal","burst"]},"phu":{"thuong":["attack"],"tinh_anh":["attack","attack","control"],"boss":["attack","attack","control"]},"tran":{"tinh_anh":["control"],"boss":["control","control"]},"khi":{"thuong":["attack"],"tinh_anh":["attack","attack"],"boss":["attack","attack","attack"]},"kiem":{"tinh_anh":["attack"],"boss":["attack"]}}` | Đồ cộng thêm theo phái của địch (gdd 12 §28): cộng vào `ENEMY_KIT` của mức, tung riêng từng món như bộ mặc định (cảnh giới cao tung thêm `kitExtraByRealm`). Phái lấy từ `EnemyDef.phai` / `kieu`, hoặc phái của tông NPC. Phù thuẫn không có: boss mang phù thuẫn từng kéo Kết Đan thắng 100% → 77% (đoạn trên). Thêm / bớt một loại trong dòng một phái: địch phái đó mang nhiều / ít loại đó hơn. |
| `combat.ENEMY_BURST_SCALE` | `0.6` | Đan bộc phát của địch: tăng sát thương này nhân `1 + (BURST_DAMAGE_MULT − 1) × hệ số phẩm × ENEMY_BURST_SCALE` trong số lượt ghi trên đan. Tăng: địch bộc phát đau hơn. |
| `combat.ELEMENT_ADVANTAGE` | `1.3` | Sinh khắc: hệ chiêu khắc hệ thân người nhận thì nhân hệ số này (§3.2). Tăng: khắc chế đau hơn. |
| `combat.ELEMENT_DISADVANTAGE` | `0.7` | Sinh khắc: hệ chiêu bị hệ thân người nhận khắc thì nhân hệ số này (§3.2). Giảm: bị khắc càng yếu. |
| `combat.ELEMENT_FACTOR_MIN` | `0.5` | Kẹp hệ số sinh khắc nhiều hệ: sàn. Giảm: bị khắc kép yếu hơn nữa. |
| `combat.ELEMENT_FACTOR_MAX` | `1.5` | Kẹp hệ số sinh khắc nhiều hệ: trần. Tăng: khắc kép đau hơn. |
| `combat.DAC_KHAC` | `{"loi":{"am":1.3}}` | Đặc khắc (§3.3, gdd 59 §3): hệ chiêu → hệ của người nhận → hệ số, nhân thêm sau sinh khắc ngũ hành. Khóa theo hệ (địch tối mang hệ `am`), không theo chủng loại. Chỉ một luật "Lôi khắc Ám và tà vật" cho dễ nhớ (tà vật = chủng ma / quỷ / thi, tính như mang Ám ở `heSoHe`); Lôi chỉ có ở biến dị linh căn và mảnh hiếm. Tăng: hệ đó chuyên trị hệ nhận tương ứng mạnh hơn. |
| `combat.HE_SO_HE_TOI_DA` | `1.6` | Trần của sinh khắc × đặc khắc. Tăng: đòn khắc chế đau hơn khi cộng dồn đặc khắc. |
| `combat.BURST_DAMAGE_MULT` | `1.5` | Bộc phát (thiêu đốt thọ nguyên / đan): sát thương người chơi nhân hệ số này (gdd 12 §5.2, "nặng gấp rưỡi"). Tăng: bộc phát đau hơn. |
| `combat.BURN_LIFE_BURST_TURNS` | `4` | Thiêu đốt thọ nguyên: bộc phát kéo dài chừng này lượt (tính cả lượt dùng). Tăng: bộc phát lâu hơn. |
| `combat.BURN_LIFE_DAMAGE_MULT` | `2` | Thiêu đốt thọ nguyên: sát thương người chơi nhân hệ số này trong thời gian bộc phát (riêng, mạnh hơn đan; gdd 12 §5.2, đổi 2026-10-21). Tăng: đốt thọ phản kháng mạnh hơn. |
| `combat.PUNCH_SPELL_RATIO` | `0.4` | Quyền cước: uy lực cơ bản = tỉ lệ này × nền đánh (pháp lực; thân thể tu thì nền thể), cộng thêm cường hóa, tối đa cũng chừng này (gdd 40 §12). Tăng: đánh thường đau hơn. |
| `combat.BODY_POWER_EXPONENT` | `0.5` | Nền thể = pháp lực × (tỉ lệ khí huyết thân)^số mũ này (gdd 40 §12.7): càng dồn khí huyết càng mạnh nhưng chậm dần. Tăng: thể tu đánh đau hơn; 1 = tuyến tính như cũ. |
| `combat.BODY_POWER_BASE` | `1.15` | Nền thể nhân thêm hệ số cố định này (gdd 40 §12.7, 2026-10-24): giữ lợi thế thể tu đầu game khi khí huyết thân còn ít. Tăng: thể tu đánh đau hơn đều mọi cảnh giới. |
| `combat.CONTROL_DAMAGE_RATIO` | `0.5` | Chiêu khống chế gây sát thương bằng tỉ lệ này uy lực (tính cả khi AI chấm điểm chiêu). Tăng: chiêu trói đau hơn. |
| `combat.SHIELD_UY_MULT` | `1.5` | Chiêu thủ: hộ thuẫn = hệ số này × uy lực × hệ số phạm vi. Tăng: thuẫn dày hơn. |
| `combat.HEAL_UY_MULT` | `0.9` | Chiêu hồi phục: hồi = hệ số này × uy lực × hệ số phạm vi. Thấp hơn hộ thuẫn vì hồi không bị hộ thể trừ như đòn đánh (gdd 40 §15, 1,5 → 0,9). Tăng: chiêu hồi phục hồi nhiều hơn. |
| `combat.SHIELD_CAP_RATIO` | `0.6` | Trần hộ thuẫn (kể cả phù thuẫn) theo tỉ lệ khí huyết tối đa. Tăng: dựng được thuẫn dày hơn. |
| `combat.SCOPE_RULES` | `{"spreadSide":0.4,"all":0.6,"allies":0.6,"multiControl":0.5}` | Hệ số uy lực theo phạm vi (gdd 12 §16): lan (kẻ phụ), quần (mọi kẻ), đồng đội; `multiControl` là hệ số tỉ lệ trói mỗi kẻ khi trói nhiều mục tiêu. Tăng: chiêu diện rộng mạnh hơn. |
| `combat.CHILL_CAP` | `0.4` | Hàn khí giảm tối đa chừng này sát thương gây ra (40%). Tăng: hàn khí làm địch yếu đi nhiều hơn. |
| `combat.CHILL_STACK_SCALE` | `0.5` | Hàn khí là một tag có tầng: mỗi tầng giảm sát thương gây ra `ratio` của chiêu × hệ số này (ratio 0,1 → 5% mỗi tầng). Tăng: Hàn khí làm yếu địch nhiều hơn từ tầng đầu. |
| `combat.REGEN_HP_BASE` | `0.12` | Hồi xuân hồi mỗi lượt `ratio` × hệ số này × khí huyết tối đa của người nhận (ratio 0,25 → 3% mỗi lượt). Tăng: Hồi xuân hồi nhiều hơn, thân máu dày hưởng nhiều hơn. |
| `combat.CHILL_BOSS_MAX_STACK` | `2` | Boss chỉ lạnh, không thể bị đóng băng: tối đa chừng này tầng hàn khí. Tăng: boss bị làm yếu mạnh hơn. |
| `combat.DECAY_BOSS_MAX_STACK` | `1` | Tuyệt hồi (Ám): boss chỉ giữ chừng này tầng (thường 2 tầng, mỗi tầng giảm hồi `ratio` của chiêu). Tăng: boss bị cắt hồi mạnh hơn. |
| `combat.DEVOUR_BONUS_PER_KIND` | `0.15` | Phệ hồn (chiêu Ám `devour`): mỗi loại hiệu ứng hại mục tiêu đang mang cộng chừng này sát thương. Tăng: chiêu Phệ hồn kết liễu mạnh hơn. |
| `combat.DEVOUR_MAX_KINDS` | `3` | Phệ hồn chỉ đếm tối đa chừng này loại hiệu ứng hại (mức riêng của chiêu, như số tầng tối đa). |
| `combat.EFFECT_CHANCE_MAX` | `0.85` | Trần tỉ lệ trúng của hiệu ứng hại và khống chế do chiêu ghi. Giảm: hiệu ứng khó trúng hơn. |
| `combat.MAX_EFFECT_TRIES` | `3` | Mỗi lượt một đơn vị chỉ thử tối đa chừng này hiệu ứng / kích ấn. Tăng: một lượt gây được nhiều hiệu ứng hơn. |
| `combat.CHILL_FREEZE_STACKS` | `3` | Hàn khí chồng tới số tầng này thì mục tiêu (không phải boss) bị đóng băng, mất lượt. Giảm: dễ đóng băng hơn. |
| `combat.CONTROL_IMMUNITY_TURNS` | `2` | Sau khi bị khống chế (mất lượt / đóng băng), đơn vị miễn khống chế chừng này lượt. Tăng: khó bị trói liên tục hơn. |
| `combat.ITEMS_PER_TURN` | `10` | Mỗi lượt người chơi dùng tối đa chừng này món đan + phù cộng chung (phù độn thổ không tính). Tăng: dồn được nhiều món hơn trong một lượt. |
| `combat.WARD_TURNS` | `3` | Hộ thuẫn từ phù / vật phẩm giữ chừng này lượt. Tăng: thuẫn tồn tại lâu hơn. |
| `combat.HO_THE_MAX` | `0.6` | Giới hạn hộ thể (giảm sát thương nhận) tối đa. Tăng: người đỡ đòn tốt hơn. |
| `combat.MARK_BURST_RATIO` | `0.5` | Kích ấn: sát thương kích phát tối đa bằng tỉ lệ này uy lực chiêu (tổng cả chiêu; cũng là trần điểm thưởng AI). Tăng: kích ấn đau hơn. |
| `combat.COMBAT_BACKLASH_CHANCE_PER_POINT` | `0.04` | Tỉ lệ phản phệ mỗi lượt = điểm nghịch × hệ số này (kẹp trần bên dưới), rồi nhân hệ số phản phệ. Tăng: kinh mạch nghịch dễ phản phệ hơn. |
| `combat.BACKLASH_CHANCE_CAP` | `0.4` | Trần tỉ lệ phản phệ (trước hệ số phản phệ). Tăng: phản phệ có thể thường xuyên hơn. |
| `combat.BACKLASH_HP_RATIO` | `0.05` | Phản phệ mất khí huyết = tỉ lệ này × hệ số phản phệ × khí huyết tối đa. Tăng: phản phệ đau hơn. |
| `combat.ENEMY_TALISMAN_REALM_BOOST` | `[1,1,1.5,2,2.5,3]` | Hệ số thêm cho phù công của ĐỊCH theo cảnh giới tờ phù (gdd 12 §5.1c): chỉ dùng cho phù địch (người chơi dùng công thức chiêu cùng phẩm). Chỉ số 0–5 (Phàm Nhân → Hóa Thần). Tăng: phù công của địch cảnh giới đó mạnh hơn. |
| `combat.ENEMY_SPEED_OFFSET_MIN` | `-10` | Độ lệch thân pháp của khuôn địch (`than_phap` trừ mặc định của `LOAI`): nhỏ nhất. |
| `combat.ENEMY_SPEED_OFFSET_MAX` | `10` | Độ lệch thân pháp của khuôn địch: lớn nhất. |
| `combat.ENEMY_SENSE_OFFSET_MIN` | `-10` | Độ lệch ẩn tức của khuôn địch (`an_tuc` trừ mặc định của `LOAI`): nhỏ nhất. |
| `combat.ENEMY_SENSE_OFFSET_MAX` | `10` | Độ lệch ẩn tức của khuôn địch: lớn nhất. |
| `combat.ENEMY_POWER_COEF_MIN` | `0.5` | Hệ số sức riêng của khuôn địch (`he_so_suc.khi_huyet` / `sat_thuong`): nhỏ nhất. |
| `combat.ENEMY_POWER_COEF_MAX` | `1.5` | Hệ số sức riêng của khuôn địch: lớn nhất. |
| `combat.PHU_COMMON_BASE_UY` | `3` | Chuẩn uy (tương đối) của phù công Phàm Nhân = hệ số này × hệ số phẩm. 3 = 10 × 1,2 / 4 (gdd 40 §5). |
| `combat.PHU_UY_BAND_LOW` | `0.7` | Dải uy lực phù công từ Luyện Khí so với chuẩn 1 (uy tương đối, gdd 40 §5): cận dưới. |
| `combat.PHU_UY_BAND_HIGH` | `1.4` | Dải uy lực phù công từ Luyện Khí so với chuẩn: cận trên. |
| `combat.PHU_COMMON_BAND_LOW` | `0.6` | Dải uy phù công Phàm Nhân so với chuẩn: cận dưới. |
| `combat.PHU_COMMON_BAND_HIGH` | `1.5` | Dải uy lực phù công Phàm Nhân so với chuẩn: cận trên. |
| `combat.BURN_LIFE_MAX_USES` | `2` | Số lần thiêu đốt thọ nguyên tối đa mỗi trận (§5.2). Tăng: đốt thọ liều được nhiều lần hơn. |
| `combat.BURN_LIFE_FIRST` | `0.05` | Giá thiêu đốt lần đầu: tỉ lệ thọ nguyên tối đa. Tăng: đốt thọ đắt hơn. |
| `combat.BURN_LIFE_SECOND` | `0.1` | Giá thiêu đốt lần hai: tỉ lệ thọ nguyên tối đa. Tăng: đốt thọ lần hai đắt hơn. |
| `combat.ESCAPE_SPEED_FACTOR_MIN` | `0.3` | Hệ số giá bỏ chạy theo thân pháp: sàn (kẹp 0,3–1). Giảm: nhanh hơn địch thì bỏ chạy càng rẻ. |
| `combat.ESCAPE_STONE_BASE` | `15` | Giá bỏ chạy bằng linh thạch: gốc × `ESCAPE_STONE_GROWTH` ^ cảnh giới địch. Tăng: ném đồ thoát thân đắt hơn. |
| `combat.ESCAPE_STONE_GROWTH` | `3` | Mỗi cảnh giới của địch nhân giá bỏ chạy bằng linh thạch chừng này lần. Tăng: gặp địch cao cảnh giới càng khó thoát bằng tiền. |
| `combat.ESCAPE_LIFE_RATIO` | `0.03` | Giá huyết độn: tỉ lệ thọ nguyên tối đa (trước hệ số thân pháp). Tăng: huyết độn đắt hơn. |
| `combat.ESCAPE_LOW_HP_BELOW` | `0.3` | Khí huyết hiện tại / tối đa dưới mức này (kiệt sức) thì cả hai giá bỏ chạy nhân `ESCAPE_LOW_HP_MULT` (gdd 12 §5.3). Tăng: dễ bị tính kiệt sức hơn. |
| `combat.ESCAPE_LOW_HP_MULT` | `2` | Hệ số giá bỏ chạy khi khí huyết dưới `ESCAPE_LOW_HP_BELOW`. Tăng: đánh tới kiệt mới chạy càng đắt. |
| `combat.ESCAPE_CRITICAL_HP_BELOW` | `0.1` | Khí huyết hiện tại / tối đa dưới mức này (cận tử) thì giá bỏ chạy nhân `ESCAPE_CRITICAL_HP_MULT`. Tăng: dễ bị tính cận tử hơn. |
| `combat.ESCAPE_CRITICAL_HP_MULT` | `3` | Hệ số giá bỏ chạy khi khí huyết dưới `ESCAPE_CRITICAL_HP_BELOW`. Tăng: chạy lúc cận tử càng đắt. |
| `combat.BLOOD_ESCAPE_INJURY` | `1` | Huyết độn sau khi đã giao chiến cộng chừng này bậc thương thế (gdd 12 §5.3). Tăng: huyết độn để lại thương nặng hơn. |
| `combat.DEATH_INJURY_FROM` | `2` | Mang thương thế từ mức này trở lên mà vẫn đánh và thua thì tử trận (gdd 12 §5.3). Giảm: dễ chết hơn; tăng: dễ sống hơn. |
| `combat.DEATH_REALM_GAP` | `2` | Thua trận không luật trước kẻ mạnh hơn mình từ chừng này đại cảnh giới thì tử trận dù đang lành (can-bang/chong-khai-thac §5.3). Tăng: vượt cấp thua đỡ chết. |
| `combat.ESCAPE_BLOCK_REALM_GAP` | `3` | Kẻ địch còn đứng hơn mình từ chừng này đại cảnh giới thì khí cơ khóa chặt: không huyết độn, ném đồ hay phù độn thổ được (can-bang/chong-khai-thac §5.6). Tăng: dễ thoát hơn. |
| `combat.INJURY_HP_PENALTY` | `0.2` | Khí huyết người chơi mất thêm mỗi bậc thương thế khi vào trận: × (1 − hệ số × thương thế). Tăng: mang thương vào trận yếu hơn. |
| `combat.ENEMY_ESCAPE_CHANCE` | `{"lau_la":{"tu_si":0.2,"yeu_thu":0},"thuong":{"tu_si":0.2,"yeu_thu":0},"tinh_anh":{"tu_si":0.2,"yeu_thu":0.2},"boss":{"tu_si":0.2,"yeu_thu":0}}` | Tỉ lệ bỏ chạy mỗi lượt theo mức × loại (khuôn không ghi `bo_chay`). Boss phi nhân giữ ổ nên 0; muốn chạy thì khuôn ghi `bo_chay` hoặc đặc tính `tron_chay` (gdd 40 §9 đợt 5). Tăng: địch hay bỏ chạy hơn. Đổi khi đo: `combat.ENEMY_ESCAPE_CHANCE.boss.yeu_thu=0.1`. |
| `combat.ENEMY_FLEE_HP_BELOW` | `0.25` | Thủ lĩnh địch dưới tỉ lệ khí huyết này mới tính chuyện bỏ chạy. Tăng: địch tháo chạy sớm hơn. |
| `combat.ENEMY_FLEE_SPEED_RATIO` | `0.7` | Thủ lĩnh địch chỉ bỏ chạy được khi thân pháp tối thiểu bằng tỉ lệ này thân pháp người chơi. Giảm: địch chậm hơn vẫn chạy được. |
| `combat.AI_CALC_HEAL_BELOW` | `0.35` | Kẻ tính toán: khí huyết dưới tỉ lệ này thì ưu tiên chiêu hồi phục. Tăng: địch hồi phục sớm hơn. |
| `combat.AI_WILD_HEAL_BELOW` | `0.3` | Kẻ đánh theo bản năng: khí huyết dưới tỉ lệ này thì ưu tiên chiêu hồi phục. Tăng: địch hồi phục sớm hơn. |
| `combat.AI_CALC_GUARD_BELOW` | `0.5` | Kẻ tính toán: khí huyết dưới tỉ lệ này thì ưu tiên chiêu thủ. Tăng: địch phòng thủ sớm hơn. |
| `combat.AI_CONTROL_MIN_CHANCE` | `0.3` | AI chỉ chọn chiêu khống chế khi tỉ lệ trói đạt mức này. Tăng: AI kén khống chế hơn. |
| `combat.COMBO_ONESHOT_HP_ABOVE` | `0.6` | Liên chiêu: chỉ xét "đủ hạ một lượt" khi mục tiêu đang trên tỉ lệ khí huyết này (dưới mức đó là chuyện thường). |
| `combat.PLAYER_TARGET_WEIGHT` | `2` | Địch ngẫu nhiên chọn mục tiêu: người chơi nặng gấp chừng này lần đồng minh. Tăng: địch nhắm người chơi nhiều hơn. |
| `combat.INJURY_HP_NONE_FROM` | `0.6` | Khí huyết thấp nhất / tối đa từ mức này trở lên: không thương thế. Tăng: dễ mang thương hơn. |
| `combat.INJURY_HP_LIGHT_FROM` | `0.3` | Khí huyết thấp nhất / tối đa từ mức này (dưới mức không thương) trở lên: thương nhẹ; thấp hơn là thương nặng. |
| `combat.COMBAT_YEARS_PER_ROUND` | `0.008333333333333333` | Năm mỗi hiệp khi thắng, bỏ chạy hoặc địch rút (gdd 25 §8.1), chừng 3 ngày; trước khi nhân hệ số cảnh giới. Tăng: trận ăn nhiều thọ hơn. |
| `combat.COMBAT_YEARS_MAX` | `0.25` | Năm trận tối đa, cũng là năm khi thua / hết hiệp (thời gian thoát thân). Tăng: trận dài và thua tốn thọ hơn. |
| `combat.COMBAT_BOSS_YEARS_MULT` | `2` | Boss (và tầng cuối bí cảnh) tốn gấp chừng này lần năm. |
| `combat.LOSS_ROBBED_RATIO` | `0.3` | Thua trận trước tu sĩ: tỉ lệ bị cướp. |
| `combat.ALLY_LOOT_SHARE` | `0.3` | Thắng có đồng minh: tỉ lệ chia thưởng cho đồng minh. |
| `combat.FEUD_LEVEL_BY_ACT` | `{"kill":[1,1,3],"cripple":[0,1,1],"spare":[0,0,1],"kill_attacker":[1,1,2]}` | Mức thù khi hạ người của thế lực: theo cách ra tay × chức vụ người bị hạ [nhẹ, vừa, nặng] (0 = không ghi thù). Nhẹ: tạp dịch, ngoại môn, đệ tử thường; vừa: nội môn; nặng: chân truyền trở lên, thiếu gia. Tăng: thế lực thù dai hơn. |
| `combat.LAN_LEN_BAO_THU` | `3` | Ghi thù lần thứ mấy thì thành báo thù. Giảm: thế lực dễ báo thù hơn. |
| `combat.DANH_VONG_THU` | `{"1":-3,"2":-5,"3":-10}` | Danh vọng với đại tông của nước thế lực ở theo mức thù vừa ghi. Tăng độ lớn: gây thù mất danh vọng nặng hơn. |
| `combat.NAM_GOC_HET_GHI_THU` | `10` | Thù nhạt: mức 1 hết sau 10 năm ở ngoài, mức 2 hạ sau 30; bế quan / luyện chế không tính. Tăng: thù dai hơn. |
| `combat.NAM_GOC_HA_BAO_THU` | `30` |  |
| `combat.TI_LE_NHAN_RA` | `0.35` | Bị truy nã mà vào chỗ đông người (thôn, trấn, thành, kinh đô) trong tầm: tỉ lệ bị nhận ra. Tăng: truy nã nguy hiểm hơn. |
| `combat.TI_LE_DUOI_KIP` | `0.35` | Kẻ đang truy đuổi đuổi kịp mỗi lần người chơi tới nơi mới. Tăng: bỏ chạy khó dứt hơn. |
| `combat.LAN_TRUY_DUOI` | `3` | Số lần đuổi kịp tối đa và thời hạn (năm thật) của một lần truy đuổi. Tăng: kẻ đuổi bám lâu / nhiều hơn. |
| `combat.NAM_GOC_TRUY_DUOI` | `3` |  |
| `combat.SO_THE_LUC_GAN` | `3` | Kẻ địch có thế lực gần: rút trong từng này thế lực gần nhất. Tăng: thế lực gây sự đa dạng, xa hơn. |
| `combat.NAM_GOC_TIN_THU` | `[0.5,2]` | Tin thù oán (báo thù, truy nã) tới tai người chơi sau từng này năm thật. Tăng: người chơi nghe tin muộn hơn. |
| `combat.CANH_GIOI_SUU_HON` | `2` | Sưu hồn cần thần thức đủ mạnh: từ cảnh giới này, và kẻ bại trận kém người chơi ít nhất một đại cảnh giới. Tăng: sưu hồn đến muộn hơn. |
| `combat.TI_LE_HOI_MA_THUONG` | `0.35` | Kẻ được tha / bị sưu hồn có thể quay lại (gdd 12 §21): tỉ lệ quay lại. Tăng: tha người hay gặp lại hơn. |
| `combat.TI_LE_HOI_OAN_HAN` | `0.3` | Kẻ được tha quay lại: tỉ lệ mang oán dù không phải ác nhân / vai nặng. Tăng: tha người dễ rước oán hơn. |
| `combat.PURSUIT_YEARS_MIN` | `0.05` | Một chặng đuổi theo kẻ tháo chạy tốn tối thiểu chừng này năm thật. Tăng: đuổi theo tốn thời gian hơn. |
| `combat.PURSUIT_YEARS_SPAN` | `0.05` | Thời gian một chặng đuổi dao động thêm [0, chừng này) năm. Tăng: chặng đuổi dài và khó đoán hơn. |
| `combat.PURSUIT_CHANCE_MIN` | `0.05` | Tỉ lệ đuổi kịp: sàn và trần. |
| `combat.PURSUIT_CHANCE_MAX` | `0.95` |  |
| `combat.PURSUIT_CHANCE_BASE` | `0.5` | Tỉ lệ đuổi kịp gốc khi ngang tốc. Tăng: đuổi kịp dễ hơn. |
| `combat.PURSUIT_SPEED_WEIGHT` | `0.4` | Mỗi đơn vị chênh thân pháp (ta / địch − 1) cộng chừng này vào tỉ lệ đuổi kịp. Tăng: thân pháp quan trọng hơn. |
| `combat.PURSUIT_PERCEPTION_WEIGHT` | `0.15` | Thần thức cộng tối đa chừng này vào tỉ lệ đuổi kịp (thần thức / (thần thức + nửa điểm)). Tăng: thần thức dò dấu hiệu quả hơn. |
| `combat.PURSUIT_PERCEPTION_HALF` | `100` | Thần thức đạt giá trị này thì cộng một nửa mức tối đa. Tăng: cần thần thức cao mới có lợi. |
| `combat.RELEASE_SINGLE_LOOT_CHANCE` | `0.5` | Buông tha kẻ tháo chạy: vật lẻ (một món) nhặt được theo tỉ lệ này. Tăng: nhặt chiến lợi phẩm lẻ dễ hơn. |
| `combat.RELEASE_REVENGE_CHANCE` | `0.1` | Buông tha kẻ tháo chạy là người: tỉ lệ ôm hận tìm tới sau. Tăng: tha người dễ sinh kẻ thù. |
| `combat.RULED_DUEL_GRUDGE_CHANCE` | `0.15` | Thắng người ở trận có luật (lôi đài, đại bỉ, tỉ thí): kẻ bại tâm tính hẹp hòi (`hiem`) ngứa mắt ghi thù riêng với tỉ lệ này. Tăng: thắng đồng môn dễ sinh kẻ thù. |
| `combat.RULED_DUEL_FRIEND_CHANCE` | `0.15` | Như trên nhưng kẻ bại trọng nghĩa (`trong_nghia`) mến tài mà kết đạo hữu với tỉ lệ này. Tăng: tỉ thí dễ kết bạn. |
| `combat.RARE_DROP_CHANCE` | `[1,0.7,0.4,0.1,0.07,0.05,0.03,0.015]` | Tỉ lệ rơi món quý mỗi lần thắng, theo phẩm (chỉ số = phẩm − 1): Phàm 100% · Hoàng 70% · Huyền 40% · Địa 10% · Thiên 7% · Tiên 5% · Thần 3% · Nghịch Thiên 1,5% (Địa trở lên hạ một nửa 2026-10-19). Chỗ duy nhất đặt tỉ lệ: khuôn địch muốn rơi dễ / khó hơn thì ghi `uu_tien` (hệ số), không ghi số tuyệt đối. Tăng: đồ quý rơi dễ hơn. |
| `combat.RARE_DROP_RANK_FACTOR` | `{"lau_la":0.5,"thuong":1,"tinh_anh":1.5,"boss":2}` | Hệ số tỉ lệ rơi món quý theo mức địch vừa hạ (đồ rơi của sự kiện sau trận cũng theo mức trận đó). Tăng: mức đó rơi dễ hơn. |
| `combat.KIT_DROP_MAX` | `0.1` | Trần tỉ lệ rơi gốc của món trong bộ đồ địch (gdd 40 §10.14 mục 13): tỉ lệ = min(`RARE_DROP_CHANCE[phẩm]`, hằng này) × hệ số hạng. Kẹp vì bảng `roi_quy` cho Huyền 40%, Hoàng 70% sẽ xả đồ dày ở Luyện Khí – Trúc Cơ. Tăng: đồ địch mang rơi dễ hơn ở phẩm thấp. |
| `combat.ELITE_ENEMY_IDS` | `["enemy.chuong_mon","enemy.thai_thuong_truong_lao","enemy.truong_lao_nguyen_anh"]` | Khuôn địch luôn mang bộ xịn (phẩm chuẩn, khôn = 1, món mạnh nhất): chưởng môn, thái thượng trưởng lão, trưởng lão Nguyên Anh. NPC có tên ngồi trên các khuôn này cũng vậy. |
| `combat.ELITE_ELDER_REALM` | `4` | NPC trưởng lão từ cảnh giới này trở lên (4 = Nguyên Anh) mang bộ xịn. Tăng: chỉ trưởng lão cao hơn mới xịn. |
| `combat.TRAIT_STONE_PHYSICAL_MULT` | `0.65` | Thạch bì: đòn thường / thể tu (hệ vô sắc) vào kẻ mang đặc tính chịu hệ số này. Giảm: đánh thường càng vô dụng. |
| `combat.TRAIT_STONE_SPELL_MULT` | `1.15` | Thạch bì: pháp thuật (đòn có hệ) chịu hệ số này. Tăng: pháp thuật càng hiệu quả. |
| `combat.TRAIT_REGEN_RATIO` | `0.03` | Sinh sôi: đầu lượt hồi chừng này tỉ lệ khí huyết tối đa (mất lượt hồi nếu trúng hỏa). Tăng: quái trâu hơn. |
| `combat.TRAIT_ESCAPE_FROM_ROUND` | `3` | Thoát độn: từ hiệp này trở đi quái bắt đầu tính chuyện bỏ chạy. |
| `combat.TRAIT_ESCAPE_CHANCE` | `0.3` | Thoát độn: tỉ lệ bỏ chạy mỗi lượt của quái (chỉ khi là con cuối còn đứng). Tăng: phải đánh nhanh hơn. |
| `combat.TRAIT_SUMMON_EVERY` | `4` | Hú bầy: cứ mỗi chừng này lượt của quái thì gọi thêm một lâu la (tối đa `DICH_TOI_DA` địch). Giảm: gọi dày hơn. |
| `combat.TRAIT_SUMMON_MAX` | `2` | Hú bầy: mỗi con gọi tối đa chừng này lần mỗi trận (gdd 32 §13.1). Tăng: trận kéo dài, đàn đông hơn. |
| `combat.TRAIT_REFLECT_RATIO` | `0.2` | Phản chấn: phản lại tỉ lệ này sát thương nhận từ đòn thường / thể tu (cận chiến). Tăng: đánh thường đau hơn cho người đánh. |
| `combat.TRAIT_LEECH_RATIO` | `0.3` | Hút huyết: hồi tỉ lệ này sát thương gây ra. Tăng: kéo dài trận hơn. |
| `combat.TRAIT_PHANTOM_DODGE` | `0.5` | Hư ảnh: xác suất né đòn đơn mục tiêu ở hiệp lẻ. Tăng: khó đánh hơn. |
| `combat.TRAIT_BERSERK_BELOW` | `0.5` | Cuồng bạo: khi khí huyết dưới tỉ lệ này thì cuồng bạo. |
| `combat.TRAIT_BERSERK_DAMAGE_MULT` | `1.3` | Cuồng bạo: hệ số sát thương khi đã cuồng bạo (đồng thời bỏ chiêu thủ / hồi). Tăng: giai đoạn cuối đau hơn. |
| `combat.TRAIT_SPLIT_COUNT` | `2` | Phân thân: số con tách ra khi chết lần đầu (gồm cả con đứng lại tại chỗ). |
| `combat.TRAIT_SPLIT_HP_RATIO` | `0.25` | Phân thân: khí huyết mỗi con = tỉ lệ này khí huyết tối đa gốc. |
| `combat.TRAIT_SPLIT_COPY_DAMAGE` | `0.6` | Phân thân: uy chiêu / pháp lực của ảnh thân (bản sao) nhân hệ số này; ảnh thân không mang đặc tính. Tăng: ảnh thân đau hơn. |
| `combat.TRAIT_REBIRTH_HP_RATIO` | `0.4` | Niết bàn: sống lại với tỉ lệ này khí huyết tối đa. |
| `combat.TRAIT_REBIRTH_FIRE_MULT` | `1.2` | Niết bàn: sau khi sống lại sát thương hệ hỏa nhân hệ số này. |
| `combat.TRAIT_ELEMENTAL_WEAK_MULT` | `1.3` | Thân nguyên tố: nhận thêm hệ số này từ hệ khắc nó (nhân sau sinh khắc thường). Tăng: chọn hệ đúng quan trọng hơn. |
| `combat.TRAIT_SELF_DESTRUCT_BELOW` | `0.15` | Tự bạo: bật khi khí huyết dưới tỉ lệ này (gdd 32 §13.2). |
| `combat.TRAIT_SELF_DESTRUCT_RATIO` | `0.6` | Tự bạo: mỗi người phe ta mất tỉ lệ này khí huyết tối đa CỦA KẺ NỔ. |
| `combat.TRAIT_SELF_DESTRUCT_TARGET_CAP` | `0.5` | Tự bạo: trần mỗi người chịu = tỉ lệ này khí huyết tối đa của chính người đó. Giảm: cú nổ bớt chí mạng. |
| `combat.TRAIT_CALL_DELAY` | `3` | Cầu viện: số lượt của kẻ cầu viện từ lúc bóp phù tới khi viện binh tới. Tăng: có thêm thời gian giết nó. |
| `combat.TRAIT_FORMATION_MIN` | `3` | Kết trận: số địch mang đặc tính còn đứng tối thiểu để trận thế giữ; dưới ngưỡng thì vỡ hẳn. |
| `combat.TRAIT_FORMATION_MULT` | `0.75` | Kết trận: hệ số sát thương con mang đặc tính nhận khi trận thế còn. Giảm: phải phá trận sớm hơn. |
| `combat.TRAIT_SWORD_INTENT_STEP` | `0.06` | Kiếm ý: mỗi tầng cộng chừng này vào hệ số sát thương gây ra. |
| `combat.TRAIT_SWORD_INTENT_MAX` | `5` | Kiếm ý: số tầng tối đa. |
| `combat.TRAIT_PACK_STEP` | `0.08` | Bầy đàn: sát thương cộng thêm cho mỗi yêu thú khác cùng phe còn đứng. |
| `combat.TRAIT_PACK_MAX` | `3` | Bầy đàn: số yêu thú khác tối đa được tính. |
## crafting

| Khóa | Giá trị | Ghi chú |
|---|---|---|
| `crafting.BAC_NGHE` | `[{"diem":0,"canhGioi":0,"kinhNghiem":0},{"diem":8,"canhGioi":1,"kinhNghiem":40},{"diem":16,"canhGioi":2,"kinhNghiem":120},{"diem":24,"canhGioi":3,"kinhNghiem":300},{"diem":32,"canhGioi":4,"kinhNghiem":600}]` | Bậc nghề (§3): điểm cộng, cảnh giới tối thiểu, kinh nghiệm để dự khảo hạch lên bậc này. Kinh nghiệm tính riêng từng bậc (không cộng dồn; qua khảo hạch thì về 0, §15.5). Tăng điểm: dễ thành mẻ hơn; tăng kinh nghiệm: lên bậc chậm hơn. |
| `crafting.PHAT_VUOT_BAC` | `20` | Luyện vượt trần bậc: trừ chừng này điểm và không ra Cực. Tăng: luyện vượt bậc khó hơn. |
| `crafting.HE_SO_KINH_NGHIEM` | `{"hong_nang":0,"hong":0.5,"ha":1,"trung":2,"thuong":3,"cuc":5}` | Kinh nghiệm nghề mỗi mẻ = phẩm × hệ số theo kết quả. Tăng: lên bậc nghề nhanh hơn (chỉnh từng ô để thưởng thành phẩm cao). |
| `crafting.EXP_RANGE_FACTOR` | `{"above":1.5,"atCap":1,"below1":0.25}` | Hệ số tầm của kinh nghiệm mẻ (§15.5) theo phẩm món so với trần phẩm T của bậc hiện tại: `above` = T + 1 (vượt bậc), `atCap` = T, `below1` = T − 1; thấp hơn nữa thì 0. Tăng: mức tương ứng lên bậc nhanh hơn. |
| `crafting.THAN_THUC_THAY_SO` | `40` | Thần thức hiệu dụng từ mức này thì thấy tỉ lệ dạng số. Giảm: dễ thấy số chính xác hơn. |
| `crafting.THAN_THUC_THAY_CHU` | `15` | Thần thức hiệu dụng từ mức này thì thấy tỉ lệ dạng chữ (dưới nữa là ẩn). Giảm: dễ thấy gợi ý hơn. |
| `crafting.HOA_HAU` | `{"on":{"diem":10,"nam":1.5,"pb":[0.4,0.5,0.1],"hongNang":0},"thuong":{"diem":0,"nam":1,"pb":[0.25,0.5,0.25],"hongNang":0.25},"lieu":{"diem":-10,"nam":0.75,"pb":[0.1,0.45,0.45],"hongNang":0.5}}` | Hỏa hầu (§5.2): điểm, hệ số thời gian, phân bố Hạ / Trung / Thượng khi thành, phần hỏng nặng trong số lần hỏng. Tăng điểm: hỏa hầu đó dễ thành hơn; tăng nam: mẻ lâu hơn. |
| `crafting.DIEM_KEN_HOA` | `5` | Đơn phương kén hỏa: đúng lửa +5, ngược lửa −5. Tăng: chọn sai lửa phạt nặng, chọn đúng thưởng nhiều. |
| `crafting.NAM_THIEU_DOT` | `2` | Một hơi (phù) / Huyết luyện (bảo) thiêu đốt chừng này năm thọ nguyên mỗi mẻ để bỏ phần hỏng nặng (§5.2). Tăng: Liều tốn thọ hơn. |
| `crafting.DIEM_MOI_DAI_CANH_GIOI` | `15` | Điểm cộng mỗi đại cảnh giới (§5.3). Tăng: tu vi cao dễ thành mẻ hơn. |
| `crafting.DIEM_MOI_TIEU_CANH_GIOI` | `4` | Điểm cộng mỗi tiểu cảnh giới. Tăng: tu vi cao dễ thành mẻ hơn. |
| `crafting.DIEM_MOI_BAC_LO` | `3` | Điểm cộng mỗi bậc phẩm của lò / phù bút. Tăng: dụng cụ tốt đáng giá hơn. |
| `crafting.DIEM_PHAT_THUONG_THE` | `5` | Điểm phạt mỗi tầng thương thế. Tăng: bị thương luyện càng khó. |
| `crafting.DIEM_DAN_CUNG_HE` | `6` | Dẫn dược cùng hệ món luyện: cộng chừng này điểm. Tăng: dẫn dược hợp hệ đáng dùng hơn. |
| `crafting.DIEM_DAN_KHAC` | `-15` | Dẫn dược khắc hệ món luyện: trừ chừng này điểm (số âm). Giảm: dẫn dược sai hệ phạt nặng hơn. |
| `crafting.DIEM_PHU_MOI_NAC` | `4` | Phụ liệu cao hơn yêu cầu: cộng chừng này điểm mỗi bậc phẩm. Tăng: phụ liệu xịn đáng tiền hơn. |
| `crafting.DIEM_LINH_CAN` | `6` | Linh căn hợp (Hỏa cho đan / bảo, cùng hệ lá phù cho phù): cộng chừng này điểm. Tăng: linh căn đáng giá hơn. |
| `crafting.DI_HOA_HOP_HE` | `1.5` | Lửa cùng hệ với món đang luyện cộng thêm phần này cho dị hỏa (§15.3). Tăng: dị hỏa hợp hệ mạnh hơn. |
| `crafting.DIEM_PHONG_SON_MON` | `10` | Điểm nơi luyện đan phòng / khí phòng sơn môn (§10). Tăng: luyện ở tông dễ thành hơn. |
| `crafting.DIEM_HOANG_DA` | `-5` | Điểm nơi luyện giữa hoang dã (số âm, §8). Giảm: luyện ngoài trời khó hơn. |
| `crafting.DIEM_DONG_PHU` | `5` | Điểm nơi luyện ở động phủ của mình (gdd 19 §1.5), không mùi đan. Tăng: luyện ở động phủ lợi hơn. |
| `crafting.DIEM_LUA_DAT_LUYEN_BAO` | `5` | Điểm riêng của luyện bảo ở hoang dã có lửa đất (hoang mạc / yêu vực). Tăng: tìm lửa đất đáng hơn. |
| `crafting.KINH_NGHIEM_NGHE_GIANG` | `20` | Nghe giảng lại khi hết đơn phương để học: cộng chừng này kinh nghiệm nghề. Tăng: nghe giảng lên bậc nhanh hơn. |
| `crafting.PHAM_HONG_NANG_NANG` | `4` | Hỏng nặng từ phẩm này trở lên thì thương thế nặng hơn. Giảm: món thấp phẩm cũng dễ bị thương nặng. |
| `crafting.THUONG_THE_HONG_NANG_CAO` | `2` | Hỏng nặng ở phẩm từ ngưỡng `PHAM_HONG_NANG_NANG`: thương thế cộng chừng này tầng. Tăng: luyện món cao phẩm hỏng nặng đau hơn. |
| `crafting.THUONG_THE_HONG_NANG_THAP` | `1` | Hỏng nặng ở phẩm dưới ngưỡng: thương thế cộng chừng này tầng. Tăng: hỏng nặng món thường cũng đau hơn. |
| `crafting.NGHE_NUMBERS` | `{"luyen_dan":{"heSoNam":1,"so":[1,2,3,4]},"che_phu":{"heSoNam":0.5,"so":[2,3,5,6]},"luyen_bao":{"heSoNam":1.5,"so":[1,1,1,1]},"tran_phap":{"heSoNam":1,"so":[1,1,2,2]}}` | Hệ số năm mỗi mẻ (§5.4) và số thành phẩm mặc định ở Hạ / Trung / Thượng / Cực (§6) theo nghề. Tăng heSoNam: mẻ lâu hơn; tăng so: ra nhiều thành phẩm hơn. |
| `crafting.DO_KHO_GOC` | `10` | Độ khó mẻ = gốc + mỗi phẩm × (phẩm − 1). Tăng: món cao phẩm khó thành hơn. |
| `crafting.DO_KHO_MOI_PHAM` | `15` | Độ khó tăng mỗi bậc phẩm của món luyện. Tăng: món cao phẩm khó thành hơn. |
| `crafting.TI_LE_THANH_GOC` | `0.5` | Tỉ lệ thành = gốc + (điểm − độ khó) × hệ số, kẹp trong [tối thiểu, tối đa]. Gốc tăng: mẻ nào cũng dễ thành hơn. |
| `crafting.TI_LE_THANH_MOI_DIEM` | `0.03` | Mỗi điểm hơn độ khó cộng chừng này tỉ lệ thành. Tăng: điểm có sức nặng hơn. |
| `crafting.TI_LE_THANH_MIN` | `0.05` | Sàn tỉ lệ thành. Tăng: mẻ khó mấy cũng có cơ may hơn. |
| `crafting.TI_LE_THANH_MAX` | `0.95` | Trần tỉ lệ thành. Giảm: luôn có rủi ro hỏng. |
| `crafting.TI_LE_CUC` | `0.1` | Phần của ô Thượng đổi thành Cực khi bậc đủ. Tăng: Cực dễ ra hơn. |
| `crafting.DAN_SINH_DOI` | `0.1` | Dẫn dược sinh hệ thành phẩm: dời phần này từ Hạ sang Thượng. Tăng: dẫn dược sinh hệ ra phẩm cao hơn. |
| `crafting.SO_ME_TOI_DA` | `5` | Số mẻ tối đa một lần luyện. Tăng: luyện hàng loạt được nhiều hơn một lượt. |
| `crafting.SECT_FURNACE_TIER` | `4` | Phẩm lò đan / khí phòng của đại tông thường (§15.5). Tăng: đệ tử luyện được món cao hơn ở tông. |
| `crafting.SECT_FURNACE_TIER_TOP` | `5` | Phẩm lò đan phòng Đan Hà Cốc và khí phòng hai tông kiếm (Thanh Vân, Thiên Hà Kiếm Sơn Trang) cho đệ tử từ Nội môn (§15.5). |
| `crafting.SECT_FURNACE_TOP_MIN_RANK` | `2` | Cấp bậc tông môn tối thiểu (2 = Nội môn) để dùng lò `SECT_FURNACE_TIER_TOP`. |
| `crafting.SECT_FURNACE_TOP_SWORD_NAMES` | `["Thiên Hà Kiếm Sơn Trang"]` | Tông (tầng nhỏ hơn đại tông) cũng có khí phòng lò tối cao, nhận theo tên địa danh. |
| `crafting.CONG_HIEN_DAN_PHONG` | `5` | Cống hiến mỗi mẻ ở đan phòng = hệ số × phẩm số (§10). Tăng: dùng lò tông tốn cống hiến hơn. |
| `crafting.TI_LE_MUI_DAN` | `0.1` | Mỗi mẻ luyện ngoài nơi kín (sơn môn, động phủ) có chừng này phần mùi đan / ánh lửa thu hút kẻ lạ (§8). Tăng: luyện ở chốn đông người / hoang dã nguy hiểm hơn. |
| `crafting.THUONG_THE_CHAN_LUYEN` | `3` | Cầm lửa lò khi thương thế từ tầng này trở lên thì bị chặn. Giảm: bị thương nhẹ đã không luyện được. |
| `crafting.NAM_CHO_THI_LAI` | `3` | Rớt khảo hạch thì chừng này năm sau mới được thi lại. Tăng: rớt phạt nặng hơn. |
| `crafting.CONG_HIEN_KHAO_HACH` | `10` | Lệ phí khảo hạch trả bằng cống hiến = hệ số × (bậc mới + 1) × hệ số tông. Tăng: thi ở tông mình tốn cống hiến hơn. |
## cultivation

| Khóa | Giá trị | Ghi chú |
|---|---|---|
| `cultivation.MAX_INJURY` | `3` | Thương thế tối đa (trọng thương); mọi khoản cộng thương thế kẹp ở đây. Tăng: bị thương nặng hơn được phép chồng thêm tầng. |
| `cultivation.TU_VI_MOI_NAM` | `5` | Tu vi của **một năm bế quan** ở tốc độ tu luyện 1, mọi cảnh giới. Đơn vị gốc: bế quan = năm × số này × tốc độ; sự kiện `tu_vi: n` = n × số này × HE_SO_TU_VI_SU_KIEN × tốc độ. Ngoài bế quan (đi đường, làm việc) không tự lên tu vi. Tăng: mọi nguồn tu vi cùng nhanh hơn. |
| `cultivation.HE_SO_TU_VI_SU_KIEN` | `2` | Thưởng tu vi trong sự kiện nhân thêm: đi khám phá không thua người chỉ ngồi bế quan. Tăng: sự kiện cho nhiều tu vi hơn. |
| `cultivation.ENEMY_TU_VI` | `0.1` | Tu vi trong đồ rơi của địch (`roi`) nhân thêm hệ số này: trận chủ yếu cho lịch luyện, ngồi mới thành tu vi. Giảm: đánh quái ít tu vi hơn. |
| `cultivation.TOC_DO_PHAM` | `{"ha":0.9,"trung":1,"thuong":1.1,"hoan_my":1.25}` | Tốc độ tu luyện theo phẩm chất đột phá của cảnh giới hiện tại (gdd 13 §5.2). Tăng: đột phá hoàn mỹ càng đáng. |
| `cultivation.WOUND_SPEED_PENALTY` | `0.15` | Mỗi bậc thương thế trừ chừng này tốc độ tu (nhân `1 - hệ số × thương thế`). Tăng: bị thương tu chậm hẳn. |
| `cultivation.HEAL_REALM_SLACK` | `1` | Đan chữa thương (`heal`) chỉ ăn khi cảnh giới người dùng ≤ cảnh giới của đan + chừng này (gdd 28 §10). Tăng: đan thấp dùng được lâu hơn. |
| `cultivation.NO_TECHNIQUE_SPEED` | `0.5` | Không có công pháp nào thông: tốc độ tu nhân hệ số này. Tăng: thiếu công pháp đỡ thiệt. |
| `cultivation.SPEED_SOFT_CAP` | `1.5` | Ngưỡng nén tốc độ tu luyện. Tăng: ít bị nén, build tu nhanh càng nhanh. |
| `cultivation.SPEED_SOFT_SLOPE` | `0.5` | Phần tốc độ vượt ngưỡng chỉ giữ một phần tư. Giảm: nén mạnh hơn, chênh tốc độ giữa các build thu hẹp. |
| `cultivation.DUOC_KHANG_GOC` | `0.6` | Dược kháng: hệ số giữ lại mỗi lần dùng đan / linh dược (gdd 28). Tăng: dùng lặp một loại đỡ giảm lực. |
| `cultivation.DUOC_KHANG_MIN` | `0.5` | Giới hạn dưới / trên của hệ số dược kháng sau khi cộng đặc tính thể chất. |
| `cultivation.DUOC_KHANG_MAX` | `0.95` |  |
| `cultivation.CALM_RETENTION` | `0.6` | Tâm đã lặng (gdd 28 §3i): đồ hạ tâm ma dùng lại cùng loại chỉ giữ phần này mỗi lần. Tăng: dùng dồn đỡ phí. |
| `cultivation.CALM_HALF_LIFE` | `2` | Số năm để mức "tâm đã lặng" của một loại vơi đi một nửa. Giảm: dùng lại sớm hơn vẫn thấm. |
| `cultivation.SPARE_CALM_HALF_LIFE` | `10` | Như CALM_HALF_LIFE nhưng cho tha địch (can-bang/chong-khai-thac §2.2): tha đều tay thì đạo tâm +1 nhạt hẳn. Giảm: tha lại sớm hơn vẫn thấm. |
| `cultivation.MINOR_REALM_STEP` | `0.35` | Tu vi cần tăng mỗi tiểu cảnh giới (nhân `1 + hệ số × tiểu`). Tăng: bước sau trong cùng cảnh giới càng dài. |
| `cultivation.REALM_CULTIVATION_PER_STAGE` | `[20,40,130,800,2000,4000]` | Tu vi sơ kỳ từng cảnh giới, từ Phàm Nhân tới Hóa Thần. |
| `cultivation.BINH_CANH_TIEU` | `[0,0,0.15,0.2,0.25,0.3]` | Phần tu vi cần tích lũy thêm ở ba bước tiểu cảnh từ Trúc Cơ tới Hóa Thần (theo cảnh giới). Tăng: bình cảnh dày hơn. |
| `cultivation.CHIEN_LUC_MOI_CANH_GIOI` | `3` | Chiến lực tương đối: mỗi đại cảnh giới nhân chừng này (gdd 02). |
| `cultivation.CHIEN_LUC_MOI_TIEU` | `1.3` | Chiến lực tương đối: mỗi tiểu cảnh giới nhân chừng này (gdd 02). |
| `cultivation.DIEM_CANH_GIOI_GOC` | `10` | Điểm luân hồi: cảnh giới đạt được (từ Luyện Khí) nhân đôi mỗi đại cảnh giới, gốc chừng này. |
| `cultivation.TUONG_SINH_NOI_TAI` | `1.1` | Mảnh đa hệ có hai hệ sinh nhau: tương sinh nội tại (gdd 11 §4.5). Tăng: mảnh đa hệ sinh nhau mạnh hơn. |
| `cultivation.DAN_DIEN` | `[1,2,3,6,10,16]` | Linh lực đan điền sinh mỗi lượt theo cảnh giới (gdd 11 §7). Từ Kết Đan tăng nhanh: lưới chỉ thêm ~12 ô mỗi cảnh giới, không đủ chỗ cho tâm pháp bắt kịp mức chuẩn. |
| `cultivation.KINH_LO_TOI_DA` | `5` | Số kinh lộ tối đa tính cho một pháp khí (thể chất có thể ghi đè). Tăng: pháp khí hưởng thêm nhiều bậc kinh lộ hơn. |
| `cultivation.KINH_LO_NUT_TOI_DA` | `2000` | Số nút DFS tối đa khi tìm kinh lộ cho một pháp khí (chống nổ tổ hợp trên lưới nhiều công pháp). |
| `cultivation.LINH_LUC_CHUAN` | `[1,4,9,17,30,50]` | Linh lực mỗi lượt của build trung bình theo cảnh giới (gdd 11 §7). |
| `cultivation.TI_LE_THONG` | `{"ha":0.55,"trung":0.7,"thuong":0.85,"hoan_my":1}` | Ô thông của vùng mới theo phẩm chất đột phá (gdd 11 §9.1). Tăng: vùng mới thông nhiều ô hơn. |
| `cultivation.MANH_MAU_BASE` | `0.85` | Hệ số màu của mảnh = nền + biên × độ hợp trung bình các ô (gdd 11 §6.1). Tăng nền: lệch màu đỡ thiệt. |
| `cultivation.MANH_MAU_SPAN` | `0.45` | Biên độ của hệ số màu theo độ hợp (xem `MANH_MAU_BASE`). Tăng: hợp màu thưởng nhiều hơn. |
| `cultivation.TA_CONG_SINH_BONUS` | `0.15` | Tà công: mỗi mảnh thông kề sinh nó cộng chừng này vào hệ số sinh khắc. |
| `cultivation.TA_CONG_KHAC_BONUS` | `0.25` | Tà công: mỗi mảnh thông kề mà nó khắc cộng chừng này vào hệ số sinh khắc. |
| `cultivation.SINH_KHAC_SINH_BONUS` | `0.15` | Mảnh thường: mỗi mảnh thông kề sinh nó cộng chừng này vào hệ số sinh khắc. |
| `cultivation.SINH_KHAC_GRADE_GAP_WEIGHT` | `[1,0.6666666666666666,0.3333333333333333,0]` | Phần sinh một mảnh kề góp, theo số bậc phẩm nó thấp hơn mảnh được sinh (chỉ số = số bậc; cùng phẩm hoặc cao hơn lấy [0], quá cuối lấy phần tử cuối). Áp cả mảnh thường lẫn tà công; phần khắc không đổi. Tăng: mảnh phẩm thấp làm cầu sinh lời hơn. |
| `cultivation.SINH_KHAC_KHAC_PENALTY` | `0.15` | Mảnh thường: mỗi mảnh thông kề khắc nó trừ chừng này khỏi hệ số sinh khắc. |
| `cultivation.SINH_KHAC_FLOOR` | `0.4` | Sàn của hệ số sinh khắc mảnh thường (bị khắc nặng cũng không tụt dưới). Tăng: bị khắc đỡ thiệt. |
| `cultivation.HUYET_HE_SO` | `2` | Mảnh nằm trên huyệt: hệ số huyệt. Tăng: đặt mảnh quan trọng lên huyệt lời hơn. |
| `cultivation.HUYET_CHONG` | `0.25` | Mỗi huyệt thêm dưới cùng một mảnh cộng chừng này vào hệ số huyệt (2 huyệt ×2,25, 3 huyệt ×2,5). Tăng: thể chất huyệt dày (Cửu Âm) lời hơn. |
| `cultivation.KINH_LO_BONUS` | `0.1` | Kinh lộ: mỗi bậc kinh lộ hợp cộng chừng này vào hệ số kinh lộ của pháp khí. Tăng: đi kinh lộ dài lời hơn. |
| `cultivation.VO_SAC_LINH_LUC_HE_SO` | `0.85` | Mảnh vô sắc: linh lực nhân hệ số này khi tính tổng linh lực. Tăng: mảnh vô sắc đỡ thiệt. |
| `cultivation.SUC_CHUA_GOC` | `30` | Sức chứa túi gốc (ô), chưa tính túi trữ vật / ô mở thêm / phương tiện. Tăng: ít phải dọn đồ. |
| `cultivation.NPC_SPEED` | `{"vo":0,"pham":1,"kha":2,"thien_tai":6}` | Hệ số tốc độ tu của NPC theo phẩm chất (gdd 43 §3): tu vi mỗi năm = `TU_VI_MOI_NAM` × hệ số này, nên NPC tự theo khi chỉnh tốc độ người chơi. Tăng: NPC phẩm chất đó tu nhanh, lên cảnh giới sớm. |
| `cultivation.NPC_BREAK_FACTOR` | `{"vo":0,"pham":0.8,"kha":1,"thien_tai":1.5}` | Hệ số tỉ lệ đột phá đại cảnh giới của NPC theo phẩm chất (nhân `tiLeDotPha` của cảnh giới đích; gdd 10 §10.1). Tăng: NPC dễ qua cửa đột phá. |
| `cultivation.NPC_VIRTUAL_PACE` | `0.6` | Người ảo của tông (chưa sinh thật) lớn dần theo năm với phần này của tốc độ thật: trừ hao cho lần trượt đột phá / thương thế (gdd 43 §7). Tăng: người ảo lên cảnh giới nhanh hơn. |
| `cultivation.MAX_DISTURB_ROLLS` | `8` | Số lượt xét bị quấy tối đa mỗi lần ngồi / mẻ luyện. Tăng: ngồi dài dễ bị quấy giữa chừng hơn. |
| `cultivation.DISTURB_STOP_MIN` | `0.25` | Bị quấy giữa chừng: điểm dừng nằm ở `nền + biên × U(0;1)` của bước xét; đây là nền. Tăng: bị quấy thì vẫn ngồi được lâu hơn. |
| `cultivation.DISTURB_STOP_SPAN` | `0.7` | Biên của điểm dừng khi bị quấy (xem `DISTURB_STOP_MIN`). |
| `cultivation.HE_SO_HIEM` | `2` | Nơi nguy hiểm: dễ bị quấy gấp chừng này. Tăng: nơi hiểm càng khó ngồi. |
| `cultivation.HE_SO_LO_CUA` | `1.5` | Lộ của: kẻ tham dòm ngó, dễ bị quấy gấp chừng này. Tăng: giữ của càng nhọc. |
| `cultivation.QUAY_TOI_DA` | `0.6` | Trần tỉ lệ bị quấy mỗi lượt xét (không áp cho chỗ ghi đè từ nội dung). Giảm: ngồi yên ổn hơn ở mọi nơi. |
| `cultivation.SO_DAN_BE_QUAN` | `2` | Đan tu luyện uống cùng lúc. Tăng: tu nhanh hơn nhờ đan, tốn đan hơn. |
| `cultivation.HE_SO_YEU_DAN_THAP` | `0.25` | Yêu đan kém cảnh giới người dùng một bậc: tu vi còn chừng này (gdd 21 §2.5). Kém hơn nữa hoặc cao hơn thì không dùng. Tăng: yêu đan cũ đỡ phí. |
| `cultivation.CHO_BE_QUAN_NUMBERS` | `{"hoang_da":{"maxMilestone":1,"heSo":0.9,"quay":0.15},"linh_mach":{"maxMilestone":1,"heSo":0.9,"quay":0.3},"thon_tran":{"maxMilestone":1,"heSo":0.9,"quay":0.07},"tong_mon":{"maxMilestone":3,"heSo":1,"quay":0.03},"dong_phu":{"maxMilestone":null,"heSo":1.1,"quay":0.03}}` | Phần số của chỗ ngồi theo loại: mốc tối đa, hệ số tu vi, tỉ lệ bị quấy mỗi lượt xét (gdd 19 §1). Tăng heSo: ngồi chỗ đó tu nhanh hơn; tăng quay: dễ bị quấy hơn. |
| `cultivation.LINH_KHI_NUMBERS` | `[{"max":-1.5,"heSo":0.7},{"max":-0.5,"heSo":0.85},{"max":0.5,"heSo":1},{"max":null,"heSo":1.25}]` | Phần số của linh khí theo độ chênh linh khí của nơi (`spiritQi`) − cảnh giới: ngưỡng trên và hệ số tu vi (gdd 19 §1); thứ tự từ loãng tới dồi dào. Tăng heSo: nơi đó tu nhanh hơn. |
| `cultivation.SPIRIT_QI_FLOOR` | `{"thon":0,"tran":0,"thanh":0,"kinh_do":2,"mon_phai":1,"tong_mon":2,"dai_tong_mon":3,"other":0}` | Sàn linh khí (bậc cấp nền) theo loại nơi, gdd 07 §4.1: nơi có trận tụ linh / linh mạch thì linh khí không thấp hơn sàn dù cấp nền (độ hiểm) thấp. Tăng: nơi đó linh khí dày hơn với người cảnh giới cao. |
| `cultivation.LINH_MACH_QI_BONUS` | `1` | Linh mạch (gdd 47 §10 A): linh khí trong bán kính linh mạch = cấp nền của linh mạch + chừng này bậc, đầy trong 0,3 bán kính rồi giảm mượt tới mép. Trường linh khí tính một lần cho mỗi bản đồ, đổi giữa chừng không tính lại. Tăng: tu ở / quanh linh mạch nhanh hơn. |
| `cultivation.QI_SENSE_BY_REALM` | `[0,0.5,0.75,1,1.25,1.5]` | Hệ số tầm cảm linh khí trên bản đồ theo đại cảnh giới (Phàm Nhân … Hóa Thần), nhân với tầm đi lại (gdd 07 §4.2). Phàm Nhân 0 = không cảm. Tăng: cảm được xa hơn. |
| `cultivation.QI_SENSE_SENSE_DIV` | `200` | Thần thức chia cho số này rồi cộng 1 thành hệ số nhân tầm cảm linh khí (gdd 07 §4.2). Tăng: thần thức ít làm tầm cảm rộng ra. |
| `cultivation.DO_YEN_MAX` | `[0.05,0.1,0.2,null]` | Ngưỡng trên của tỉ lệ bị quấy cho từng mức động tĩnh (thứ tự từ tĩnh tới rình rập). Tăng: mức đó gộp thêm nơi động hơn. |
| `cultivation.LICH_LUYEN_TOI_DA` | `20` | Trần gốc Phàm Nhân / Luyện Khí; giữ export cũ, dùng lichLuyenToiDa để lấy trần hiện tại. |
| `cultivation.EXPERIENCE_CAP` | `[20,20,25,30,35,40]` | Trần lịch luyện theo cảnh giới (năm chuẩn). Tăng: ngồi được lâu hơn trước khi ngưng trệ. |
| `cultivation.LICH_LUYEN_REALM_FACTOR` | `[1,1,0.9,0.8,0.7,0.6]` | Hệ số mọi khoản cộng lịch luyện theo cảnh giới. Giảm: cảnh giới cao khó gom lịch luyện hơn. |
| `cultivation.LICH_LUYEN_DAU` | `10` | Lịch luyện lúc mới vào đời (save cũ chưa có trường này cũng tính như vậy). Tăng: đầu đời ngồi được lâu hơn. |
| `cultivation.HE_SO_NGUNG_TRE` | `0.3` | Ngưng trệ: tu vi bế quan còn chừng này. Tăng: ngồi mãi một chỗ đỡ phạt. |
| `cultivation.HE_SO_NGUNG_TRE_BE_QUAN` | `0.5` | Như HE_SO_NGUNG_TRE nhưng riêng bế quan (thải bổ, song tu, vật dùng vẫn theo HE_SO_NGUNG_TRE để Hợp Hoan không lợi thêm). Tăng: ngồi cạn lịch luyện đỡ phạt. |
| `cultivation.LICH_LUYEN_TRAN` | `{"thuong":2,"tinh_anh":6,"boss":10,"thua":1}` | Lịch luyện sau một trận: thắng theo mức địch, thua / bỏ chạy cũng học được chút ít. Tăng: đánh trận gom lịch luyện nhanh hơn. |
| `cultivation.LICH_LUYEN_DI_DUONG` | `1` | Lịch luyện mỗi 80 đơn vị thế giới đi đường. Tăng: đi đường gom lịch luyện nhanh hơn. |
| `cultivation.NAM_CHUAN_CHIA` | `8` | Một năm chuẩn = chừng 1/N tu vi cần cho sơ kỳ (gdd 21 §8). Tăng: năm chuẩn nhỏ đi, lịch luyện tiêu nhanh hơn theo tu vi. |
| `cultivation.SO_DONG_PHU` | `[1,1,2,3,4,4]` | Số động phủ tối đa theo cảnh giới (Phàm Nhân … Hóa Thần). Tăng: giữ được nhiều chỗ ngồi hơn. |
| `cultivation.HE_SO_DONG_PHU` | `{"trong":1,"phe_tich":1.15,"son_thuy":1.25}` | Hệ số linh khí riêng của chỗ lập: ô trống, phế tích (linh mạch cũ), linh địa (đất thiêng). Tăng: lập phủ ở chỗ đặc biệt lời hơn. |
| `cultivation.KHO_SUC_CHUA` | `50` | Số ô kho đồ mỗi động phủ (một loại vật một ô, chồng không giới hạn). Tăng: cất được nhiều thứ hơn. |
| `cultivation.SO_LUONG` | `3` | Số luống linh điền. Tăng: trồng được nhiều thuốc cùng lúc. |
| `cultivation.STORAGE_UPGRADES` | `[{"add":10,"realm":1,"costL":40},{"add":10,"realm":1,"costL":40},{"add":10,"realm":2,"costL":40},{"add":10,"realm":3,"costL":40},{"add":10,"realm":4,"costL":40},{"add":10,"realm":4,"costL":40},{"add":10,"realm":5,"costL":40}]` | Bậc mở rộng kho đồ (bảy bậc: Luyện Khí hai, Trúc Cơ / Kết Đan mỗi cảnh một, Nguyên Anh hai, Hóa Thần một; gdd 48 §4.6): `add` ô thêm, đòi cảnh giới `realm`, giá `costL` × L chuẩn của cảnh giới đó. Tăng costL: nâng đắt hơn. |
| `cultivation.FIELD_UPGRADES` | `[{"add":1,"realm":1,"costL":60},{"add":1,"realm":2,"costL":60},{"add":1,"realm":3,"costL":60},{"add":1,"realm":4,"costL":60}]` | Bậc khai thêm luống linh điền (như `STORAGE_UPGRADES`; đắt hơn kho vì đẻ ra linh dược). |
| `cultivation.HERB_MATURITY_YEARS` | `[1,2,5,15,40,100,250,60]` | Năm linh dược chín từ Phàm đến Nghịch Thiên (gdd 25 §6.3). Giảm: thuốc chín nhanh hơn. |
| `cultivation.FIELD_GROWTH_MULT` | `[1,1,1,1.5,2,4,3,1]` | Linh điền: rời đất mẹ, linh vật phẩm cao mọc chậm; không áp dụng ổ thuốc hoang dã. |
| `cultivation.LIFESPAN_DRUG_RETENTION` | `0.6` | Hệ số giữ dược lực thọ nguyên mỗi lần dùng (đếm theo từng món như chỉ số khác); phần cộng thể chất tính riêng bên dưới. |
| `cultivation.LIFESPAN_DRUG_CONSTITUTION_MULT` | `0.5` | Thọ nguyên chỉ hưởng một nửa phần cộng dược kháng từ thể chất; các chỉ số khác giữ nguyên. |
| `cultivation.SO_THU` | `3` | Thu hoạch một luống được từng này cây (gieo một). Tăng: linh điền ra nhiều thuốc hơn. |
| `cultivation.FORMATION_GRADE_FACTOR` | `[0,0.25,0.5,1,1.5]` | Núm sức `f` của trận bàn theo phẩm trận bàn − phẩm đối tượng (gdd 20 §5.1): ≤ −3, −2, −1, 0, ≥ +1. Trận nào cũng bày được, f = 0 chỉ là không tác dụng. Tăng: trận phẩm lệch còn dùng được. |
| `cultivation.ENEMY_TARGET_KINDS` | `["khon","sat","me","toa_linh","tuyet_sinh","pha_thuan","tan_linh"]` | Kiểu đánh lên phe kia: sức tính theo cảnh giới từng kẻ chịu, không theo người bày (gdd 20 §5.1). |
| `cultivation.FORMATION_UPKEEP` | `0.5` | Động phủ đặt trận không giới hạn; mỗi trận đang có hiệu lực ăn quỹ trận nhãn chừng này × L theo phẩm trận bàn mỗi năm. Tăng: giữ nhiều trận đắt hơn. |
| `cultivation.FORMATION_SIT_UPKEEP` | `[0,0.25,0.5,1.25,1.25,1.25]` | Tụ linh trận hút theo người ngồi (gdd 48 §4.1): khi bế quan ở chỗ có trận Tụ linh nâng thật 1 bậc linh khí, ăn thêm chừng này × L(cảnh giới người ngồi) mỗi năm ngồi, ngoài phí duy trì trận; theo cảnh giới người ngồi 0–5, Phàm Nhân miễn. Tăng: tụ linh đắt hơn. |
| `cultivation.FORMATION_WARD_CUT` | `0.5` | Phòng hộ: tỉ lệ bị quấy và phần kho mất × (1 − hệ số này · f). Tăng: hộ trận chắc hơn. |
| `cultivation.FORMATION_GROWTH_CUT` | `0.3` | Dục linh: năm chín linh điền × (1 − hệ số này · f). Tăng: cây chín nhanh hơn. |
| `cultivation.CAVE_THEFT_GRACE` | `3` | Vắng ít hơn từng này năm thì không ai động tới kho. Tăng: đi xa lâu hơn mới lo. |
| `cultivation.CAVE_THEFT_RATE` | `0.01` | Tỉ lệ bị nhắm mỗi năm vắng (chia hệ số hạn vắng theo cảnh giới `HAN_VANG_CANH_GIOI`). Tăng: dễ mất trộm hơn. |
| `cultivation.CAVE_THEFT_WEALTH` | `{"tiers":[{"upTo":100,"mult":0.5},{"upTo":500,"mult":1}],"rich":1.5}` | Hệ số giàu theo giá kho (đơn vị L của cảnh giới): mốc `upTo` L tăng dần, vượt mốc cuối thì `rich`. Tăng: kho đầy dễ bị nhắm hơn. |
| `cultivation.CAVE_THEFT_SHARE` | `0.3` | Phần mỗi món trong kho bị lấy khi trúng (nhân Phòng hộ). Bằng `mat_kho: 0.3` của sự kiện. |
| `cultivation.CAVE_THEFT_CATCH` | `0.25` | Về phủ đúng lúc kẻ trộm còn trong đó (đánh `ev.dp_tan_tu_luc_loi`). Tăng: hay bắt được tận tay hơn. |
| `cultivation.HEAVEN_DEFYING_MULT` | `[0.6,0.6,0.6,0.85,1.15,1.15]` | Nghịch Thiên chưa nhận chủ: hệ số theo cảnh giới (nhân mọi đầu ra), từ Nguyên Anh mới thúc nổi. |
| `cultivation.MORTAL_GRADE_MULT` | `0.6` | Phàm phẩm: nhân mọi đầu ra chừng này (so với Hoàng phẩm). |
| `cultivation.SKILL_CAP_STAGE` | `0` | Trần chiêu (gdd 40 §14): uy chiêu của món chỉ theo pháp lực tới tiểu cảnh giới này của cảnh giới ngay trên phẩm (0 = Sơ kỳ). Tăng: đồ cũ theo người lâu hơn. |
| `cultivation.STALE_EFFECT_BY_GAP` | `[1,1,0.5,0]` | Đồ cũ (gdd 40 §14.7): tỉ lệ gán Phá giáp / Hàn khí của chiêu món nhân hệ số này theo số đại cảnh giới người dùng vượt cảnh giới của món (cảnh giới ngay trên phẩm, cùng mốc trần chiêu). Chỉ số = chênh 0, 1, 2, ≥3. Nâng phần tử: đồ cũ giữ hiệu ứng lâu hơn. |
| `cultivation.GRADE_STATS` | `[{"heSo":0.5,"hoiPhanTram":0.12},{"heSo":1,"hoiPhanTram":0.3},{"heSo":1.75,"hoiPhanTram":0.4},{"heSo":2.75,"hoiPhanTram":0.55},{"heSo":4,"hoiPhanTram":0.6},{"heSo":5.5,"hoiPhanTram":0.65},{"heSo":7.5,"hoiPhanTram":0.7},{"heSo":5,"hoiPhanTram":0.45}]` | Số theo phẩm vật phẩm (chỉ số = phẩm − 1, cùng thứ tự `PHAM` ở character/pham.ts, hàng cuối là Nghịch Thiên): `heSo` sức mạnh tương đối (Hoàng = 1; công pháp: linh lực gốc ≈ heSo, pháp khí: uy lực chiêu ≈ 10 × heSo, đan / linh dược cùng nhịp), `hoiPhanTram` tỉ lệ hồi tối đa của đan (gdd 28 §3b). Sàn hồi khí huyết tính từ `SAN_HOI_TI` × khí huyết Sơ kỳ cảnh giới của phẩm (gdd 40 §5), không viết số tay. Tăng heSo: đồ phẩm đó mạnh hơn; tăng hoiPhanTram: đan hồi nhiều hơn. |
| `cultivation.SAN_HOI_TI` | `0.2` | Sàn hồi của đan = tỉ lệ này × khí huyết Sơ kỳ cảnh giới của phẩm (gdd 40 §5). Tăng: đan phẩm thấp hồi nhiều hơn cho người máu đầy. |
| `cultivation.SAN_HOI_TI_PHAM` | `0.1` | Như `SAN_HOI_TI` nhưng cho Phàm phẩm. |
| `cultivation.QUALITY_BAND` | `[0.9,1.15]` | Khoảng chất lượng hợp lệ của một món so với chuẩn phẩm (gdd 37 §4.1). |
| `cultivation.SKILL_COST_RATIO` | `0.55` | Phí chuẩn của phẩm = hệ số này × `LINH_LUC_CHUAN` của cảnh giới ứng phẩm (gdd 37 §4.5). Tăng: chiêu tốn linh lực hơn. |
| `cultivation.SKILL_COST_GRADE_MULT` | `[1,1,1,1.1,1.2,1.3,1.4,1.1]` | Hệ số phí chiêu theo phẩm, nhân lúc chạy lên phí gốc `phi` trong YAML (gdd 40 §15.3). Chỉ số 0-based: Phàm, Hoàng, Huyền, Địa, Thiên, Tiên, Thần, Nghịch Thiên. Nghịch Thiên như Địa (cảnh giới 2); trấn phái tính như Thiên. Tăng: chiêu phẩm cao tốn linh lực hơn. |
| `cultivation.SKILL_SHAPE_COST` | `{"spread":0.75,"all":0.6,"perEffect":0.85,"cooldown0":0.9,"cooldown3":1.25}` | Giá dạng của chiêu (gdd 37 §4.5): chiêu đơn, không hiệu ứng = 1; càng nhiều tác dụng thì `uy` càng thấp ở cùng phí. |
| `cultivation.PASSIVE_BUDGET_TAM_PHAP` | `1.3` | Ngân sách bị động tâm pháp = hệ số này × hệ số phẩm (gdd 37 §4.6). |
| `cultivation.PASSIVE_BUDGET_BAO_VAT_RATIO` | `2.5` | Ngân sách bị động bảo vật không có linh lực = hệ số này × ngân sách tâm pháp. |
| `cultivation.PASSIVE_BUDGET_BAND` | `[0.75,1.25]` | Khoảng hợp lệ của bị động so với ngân sách. |
| `cultivation.PASSIVE_BUDGET_LINH_LUC_PER_10` | `0.06` | Bảo vật có linh lực: mỗi 10% linh lực chuẩn bảo vật ăn chừng này (tỉ lệ) ngân sách. |
| `cultivation.BAO_VAT_LINH_LUC_RATIO` | `0.7` | Bảo vật linh lực chuẩn = hệ số này × linh lực tâm pháp cùng phẩm (gdd 37 §4.1; cũ 0,5). |
| `cultivation.TAM_PHAP_TOC_DO_RATIO` | `0.12` | Tốc độ tu luyện của tâm pháp ≈ hệ số này × hệ số phẩm (gdd 37 §4.6). |
| `cultivation.PASSIVE_COST` | `{"chi_so":1,"khi_huyet":50,"ho_the":100,"khang_tam_ma":50,"dot_pha":50,"toc_do_bao_vat":25,"an_tuc":0.1}` | Điểm ngân sách của một đơn vị bị động; khóa chưa khai báo ở đây thì validator cảnh báo khi gặp. |
## difficulty

| Khóa | Giá trị | Ghi chú |
|---|---|---|
| `difficulty.DIFFICULTY` | `{"enemyHealth":1,"enemyDamage":1,"breakthrough":0,"cultivationSpeed":1,"reward":1,"incidents":1,"loot":1,"enemyGear":1,"hunt":1,"sellRate":1,"marketGlut":1,"relic":1,"deathRisk":1,"escapeCost":1,"injury":1,"ambush":1,"pursuit":1,"affinity":1,"buyPrice":1,"craftSuccess":0,"craftExp":1,"capture":1,"patron":1,"stipend":1,"healSlack":0,"daoHeartBreakthrough":1,"breakthroughAids":1,"lootKinds":0,"lootRolls":0}` | Hệ số độ khó (dev): một chỗ nhân chung lên các mảng cân bằng chính. Mặc định là trung tính (×1, +0). File lá: không import gì từ dự án. Chưa có UI chọn; đo bằng `npm run bot -- --difficulty enemy=1.2,reward=0.8`. |
| `difficulty.DIFFICULTY_MODES` | `{"easy":{"enemyHealth":0.75,"enemyDamage":0.75,"breakthrough":0.08,"cultivationSpeed":1.15,"reward":1.15,"incidents":0.8,"loot":1.1,"enemyGear":0.8,"hunt":0.6,"sellRate":1.15,"marketGlut":1.4,"relic":0.5,"deathRisk":0.5,"escapeCost":0.7,"injury":0.75,"ambush":0.7,"pursuit":0.7,"affinity":1,"buyPrice":1,"craftSuccess":0,"craftExp":1,"capture":1,"patron":1,"stipend":1,"healSlack":1,"daoHeartBreakthrough":1,"breakthroughAids":1,"lootKinds":1,"lootRolls":0},"normal":{"enemyHealth":1,"enemyDamage":1,"breakthrough":0,"cultivationSpeed":1,"reward":1,"incidents":1,"loot":1,"enemyGear":1,"hunt":1,"sellRate":1,"marketGlut":1,"relic":1,"deathRisk":1,"escapeCost":1,"injury":1,"ambush":1,"pursuit":1,"affinity":1,"buyPrice":1,"craftSuccess":0,"craftExp":1,"capture":1,"patron":1,"stipend":1,"healSlack":0,"daoHeartBreakthrough":1,"breakthroughAids":1,"lootKinds":0,"lootRolls":0},"hardcore":{"enemyHealth":1.25,"enemyDamage":1.25,"breakthrough":-0.08,"cultivationSpeed":0.75,"reward":0.85,"incidents":1.3,"loot":0.75,"enemyGear":1.2,"hunt":1.4,"sellRate":0.8,"marketGlut":0.6,"relic":1.5,"deathRisk":1.5,"escapeCost":1.5,"injury":1.25,"ambush":1.3,"pursuit":1.3,"affinity":0.7,"buyPrice":1.1,"craftSuccess":-0.05,"craftExp":1.25,"capture":0.8,"patron":0.75,"stipend":0.8,"healSlack":-1,"daoHeartBreakthrough":0.8,"breakthroughAids":0.85,"lootKinds":-1,"lootRolls":0},"oneLife":{"enemyHealth":1.35,"enemyDamage":1.35,"breakthrough":-0.1,"cultivationSpeed":0.65,"reward":0.75,"incidents":1.4,"loot":0.7,"enemyGear":1.3,"hunt":1.6,"sellRate":0.75,"marketGlut":0.5,"relic":1.5,"deathRisk":2,"escapeCost":2,"injury":1.4,"ambush":1.4,"pursuit":1.4,"affinity":0.6,"buyPrice":1.2,"craftSuccess":-0.08,"craftExp":1.25,"capture":0.7,"patron":0.65,"stipend":0.7,"healSlack":-1,"daoHeartBreakthrough":0.55,"breakthroughAids":0.7,"lootKinds":-2,"lootRolls":-1}}` |  |
| `difficulty.START_EASY_MAX_TIER` | `1` | Thuận Thiên: chỉ bốc điểm xuất phát có cấp nền ≤ số này (bậc 0 → viền vàng, đỏ; không tử địa). |
| `difficulty.START_HARDCORE_DEADLY_CHANCE` | `0.5` | Nghịch Thiên: tỉ lệ bốc điểm xuất phát vào nơi cấp nền cao hơn (tử địa, viền tím) khi nước có. |
| `difficulty.DIFFICULTY_POINTS` | `{"easy":0.75,"normal":1,"hardcore":1.25,"oneLife":0}` | Nhân điểm luân hồi của kiếp theo chế độ (sau sàn và thưởng Ngẫu nhiên): lệch nhau 0,25 để không cày điểm bằng chế độ dễ. |
| `difficulty.DIFFICULTY_KNOB_INFO` | `{"enemyHealth":{"ten":"Khí huyết địch","tot":-1},"enemyDamage":{"ten":"Sát thương địch","tot":-1},"enemyGear":{"ten":"Đồ địch mang","tot":-1},"incidents":{"ten":"Biến cố và phục kích","tot":-1},"hunt":{"ten":"Bị truy nã, truy đuổi","tot":-1},"breakthrough":{"ten":"Tỉ lệ đột phá","tot":1},"cultivationSpeed":{"ten":"Tốc độ tu luyện","tot":1},"reward":{"ten":"Linh thạch thưởng","tot":1},"loot":{"ten":"Đồ rơi","tot":1},"sellRate":{"ten":"Giá bán đồ","tot":1},"marketGlut":{"ten":"Sức chợ chịu bán dồn","tot":1},"relic":{"ten":"Bảo vật Nghịch Thiên","tot":1},"deathRisk":{"ten":"Nguy cơ chết khi đột phá hỏng","tot":-1},"escapeCost":{"ten":"Cái giá bỏ chạy","tot":-1},"injury":{"ten":"Thương thế bào mòn khí huyết","tot":-1},"ambush":{"ten":"Bị chặn đầu trên đường","tot":-1},"pursuit":{"ten":"Bị đuổi kịp","tot":-1},"affinity":{"ten":"Hảo cảm nhận được","tot":1},"buyPrice":{"ten":"Giá mua đồ","tot":-1},"craftSuccess":{"ten":"Tỉ lệ luyện chế thành","tot":1},"craftExp":{"ten":"Kinh nghiệm nghề luyện chế","tot":1},"capture":{"ten":"Thu phục ngự linh, rơi trứng","tot":1},"patron":{"ten":"Tốc độ thành khách quen","tot":1},"stipend":{"ten":"Bổng lộc tông môn","tot":1},"healSlack":{"ten":"Đan chữa thương dùng được cho cảnh giới cao hơn","tot":1},"daoHeartBreakthrough":{"ten":"Đạo tâm giúp đột phá","tot":1},"breakthroughAids":{"ten":"Đan, công pháp, hộ pháp giúp đột phá","tot":1},"lootKinds":{"ten":"Số loại vật rơi mỗi trận","tot":1},"lootRolls":{"ten":"Số lượt rút đồ rơi mỗi trận","tot":1}}` | Tên hiện cho người chơi của từng núm; `tot` = 1 nếu tăng là có lợi cho người chơi, −1 nếu tăng là có hại. |
| `difficulty.DIFFICULTY_LABELS` | `{"easy":"Thuận Thiên","normal":"Trung Đạo","hardcore":"Nghịch Thiên","oneLife":"Tuyệt Mệnh"}` |  |
| `difficulty.afterApplyDifficulty` | `[]` | Việc chạy lại sau mỗi lần đặt độ khó: mod đổi `difficulty.DIFFICULTY.*` (balance/override.ts `applyBalance`) áp lại để không bị chế độ đè. |
## economy

| Khóa | Giá trị | Ghi chú |
|---|---|---|
| `economy.TY_LE_THUONG` | `0.05` | Một đơn vị thưởng L bằng chừng này giá một món cùng cấp (gdd 16 §9.4). Tăng: mọi phần thưởng sự kiện / việc giàu lên. |
| `economy.TY_LE_BAN` | `0.6` | Bán cho phường thị thì được bao nhiêu phần giá gốc (trước hệ số nước). Tăng: bán lãi hơn, buôn dễ giàu. |
| `economy.OFF_TRADE_SELL_RATE` | `0.75` | Bán nhanh ở tiệm chuyên thu hàng trái nghề: nhận chừng này phần giá. Tăng: bán đồ trái nghề đỡ thiệt. |
| `economy.DAN_HA_EP_GIA` | `0.7` | Bán đan ở Thịnh khi không có đan bài của Đan Hà Cốc: giá nhân hệ số này. Giảm: ép giá nặng hơn. |
| `economy.PRICE_DRIFT` | `0.2` | Giá mỗi món ở mỗi nơi lệch ± chừng này theo năm (trôi giá). Tăng: giá biến động mạnh, dễ buôn chênh. |
| `economy.DEMAND_PRICE_RISE` | `0.3` | Hàng khan: kho bị vét hết thì giá mua đắt thêm chừng này, nhạt dần khi kho hồi. Tăng: gom hàng đắt hơn. |
| `economy.MARKET_GLUT_CLUSTER_BY_GRADE` | `["low","low","mid","mid","high","high","high","high"]` | Cụm phẩm chia riêng bộ đếm lạm phát (chỉ số = phẩm − 1: Phàm … Nghịch Thiên): bán dồn đồ rẻ không làm đồ quý rẻ theo. Đổi cụm: sửa mảng này. |
| `economy.MARKET_GLUT_TIERS` | `[2.5,4,5]` | Ngưỡng bộ đếm "phần kho" (mỗi nước, mỗi loại vật) để lên nấc 1 (đồn đại) / 2 (lạm phát) / 3 (không thu). Giảm: bán dồn chóng ngập chợ. |
| `economy.MARKET_GLUT_PRICE` | `[1,0.8,0.5]` | Giá thu của tiệm ở nấc 0 / 1 / 2 (nấc 3 không thu, báo giá theo nấc 2). Giảm: bán dồn lỗ hơn. |
| `economy.MARKET_GLUT_BUY_PRICE` | `[1,0.85,0.7,0.6]` | Giá bán ra của tiệm (người chơi mua) ở nấc 0 / 1 / 2 / 3, mềm hơn giá thu để không có đường buôn chênh. Giảm: mua ở chợ ngập rẻ hơn. |
| `economy.MARKET_GLUT_RECOVER` | `3` | Đang không thu (nấc 3) thì bộ đếm phai xuống dưới số này mới thu lại. Tăng: chợ hồi sớm hơn. |
| `economy.AUCTION_FEE` | `{"house":0.1,"grand":0.1}` | Phí hội đấu giá, chỉ trừ khi bán được (phần người chơi = giá × (1 − phí)): `house` = đấu giá thường trực (thành, kinh đô), `grand` = đại hội. Đại hội là nơi bán đồ phẩm cao có lời (khách giàu ở CONSIGN_CAP.grand), hội thường lời ít. Tăng: gửi bán kém lời. |
| `economy.CONSIGN_CAP` | `{"house":{"count":[1,3],"normal":[0.6,1],"rich":[1,1.25],"richChance":0.1},"grand":{"count":[2,4],"normal":[0.8,1.2],"rich":[1.2,1.5],"richChance":0.15}}` | Khách NPC khi người chơi gửi bán (gdd 30 §6.7.1), theo loại hội. `count` = số khách [min, max]; trần ẩn thường U(normal) × giá gốc, `richChance` thì U(rich). Hạ: gửi bán lấy được ít hơn (tránh vòng mua tiệm → gửi bán có lãi). |
| `economy.CONSIGN_DEFAULT_RESERVE` | `0.7` | Giá sàn mặc định khi gửi bán = giá gốc × hệ số này; trần cho phép = giá gốc × `CONSIGN_MAX_RESERVE`. |
| `economy.CONSIGN_MAX_RESERVE` | `3` |  |
| `economy.CONSIGN_SUPPLY_STEP` | `0.5` | Ép giá cung: giá gốc gửi bán nhân `1 / (1 + hệ số × n)`, n = số món cùng id đã bán được qua hội trong cửa sổ. Tăng: bán trùng món càng kém. |
| `economy.CONSIGN_HISTORY_YEARS` | `10` | Cửa sổ cung cầu gửi đấu giá, tính theo năm thật. |
| `economy.STALK_TRAP_CHANCE` | `0.15` | Rình đoạt (gdd 30 §6.7.4): tỉ lệ kẻ bị rình là cao thủ giấu tu vi (cảnh giới thật cao hơn `STALK_TRAP_REALM`), đã chờ sẵn kẻ bám theo. |
| `economy.STALK_TRAP_REALM` | `1` |  |
| `economy.AUCTION_FACTION_GUEST_CHANCE` | `{"house":0.25,"grand":0.5}` | Khách đấu giá có thế lực (gdd 30 §6.7.4): xác suất mỗi khách là người giữ chức vị của một thế lực trong tầm, theo loại hội. Tăng: hội đông chân truyền / thiếu gia hơn. |
| `economy.TALISMAN_FEE_MULT` | `{"quy_tuc":1,"na_di":2}` | Linh thạch dẫn trận khi đốt phù: Quy Tức ngang trận công, Na Di gấp đôi. |
| `economy.DAC_SAN_GOC` | `0.6` | Đặc sản quốc mua ở nước gốc: nhân giá này (rẻ hơn giá gốc). Giảm: đặc sản mua càng rẻ, lãi buôn tăng. |
| `economy.DAC_SAN_XA` | `2` | Đặc sản bán ở nước khác cùng Thổ (× TY_LE_BAN → 1,2 lần giá gốc ở món đầu; mua 0,6 nên món đầu ×2). Tính cả sức mua, bán trọn lô CHO_NO món thu về ~×1,5 vốn. Tăng: bán xa lãi hơn. |
| `economy.DAC_SAN_KHAC_THO` | `2.5` | Đặc sản bán ở Thổ bên kia (× TY_LE_BAN → 1,5 lần giá gốc ở món đầu; trọn lô ~×1,8 vốn). Tăng: đường xa lãi hơn. |
| `economy.SUC_MUA_DAC_SAN` | `3` | Sức mua hàng phương xa của một nơi: bán chừng này món cùng loại thì lãi đặc sản còn một nửa. Tăng: chợ nuốt được nhiều hàng hơn. |
| `economy.NAM_HOI_SUC_MUA` | `2` | Số món đã bán ở một nơi vơi đi một nửa sau chừng này năm. Tăng: chợ lâu hồi, buôn lặp một chỗ kém đi. |
| `economy.CHO_NO` | `6` | `ban_dac_san` chỉ thu tới khi đã bán chừng này món một loại ở nơi đó (chợ no). Tăng: bán được nhiều một lượt. |
| `economy.STOCK_BY_GRADE` | `[20,12,8,5,3,2,1]` | Tồn gốc theo phẩm 1–7 (Phàm … Thần). Tăng: tiệm nhiều hàng, ít khan. |
| `economy.STOCK_BY_PLACE` | `{"thon":0.5,"tran":0.75,"thanh":1,"kinh_do":1.5,"mon_phai":0.75,"tong_mon":1,"dai_tong_mon":1.25,"other":1}` | Hệ số tồn theo cỡ nơi (thôn ít, kinh đô nhiều). |
| `economy.STOCK_REFILL_PER_YEAR` | `0.5` | Mỗi năm hồi lại chừng này phần tồn gốc (0,5: hai năm đầy lại). Tăng: kho hồi nhanh. |
| `economy.BREAKTHROUGH_STOCK_CAP` | `2` | Đan đột phá một tiệm chỉ có tối đa chừng này viên. Tăng: đan đột phá dễ mua hơn. |
| `economy.SHELF_SIZE_BY_PLACE` | `{"thon":0.6,"tran":0.8,"thanh":1,"kinh_do":1.3,"mon_phai":0.8,"tong_mon":1,"dai_tong_mon":1.2,"other":1}` | Hệ số số món mỗi kệ theo cỡ nơi (thôn ít, kinh đô nhiều). |
| `economy.PLACE_TIER` | `{"thon":0,"tran":1,"thanh":3,"kinh_do":3,"mon_phai":1,"tong_mon":2,"dai_tong_mon":3,"other":1}` | Cấp hàng của nơi theo cỡ nơi (thôn thấp, thành / kinh đô cao), không theo cảnh giới người chơi. Tiệm thường chỉ bày tới Thiên phẩm (cấp 3), nên thành / kinh đô / đại tông là trần (gdd 16 §9.5). Tăng: nơi đó có hàng tốt hơn. |
| `economy.HE_SO_CO_HANG` | `{"thon":0.7,"tran":1,"thanh":1.3,"kinh_do":1.6}` | Hệ số `co_hang` theo nơi: thành lớn có hàng hiếm dễ hơn thôn trấn. Tăng: hàng hiếm hay có hơn. |
| `economy.HE_SO_CO_HANG_TONG` | `{"mon_phai":0.7,"tong_mon":1,"dai_tong_mon":1.3}` | Hệ số `co_hang` theo tầng tông môn (môn phái nhỏ < tông môn < đại tông môn). |
| `economy.SHOP_MAX_GRADE` | `5` | Phẩm cao nhất tiệm thường được bày (Thiên). Tiên / Thần chỉ có ở đấu giá (gdd 30 §2.3). Tăng: tiệm bày được hàng cao hơn. |
| `economy.SHOP_MAX_GRADE_HIGH` | `6` | Phẩm cao nhất kệ được bày ở kinh đô, đại tông và phân hội Vạn Bảo (Tiên, gdd 48 §4.3). Nơi khác giữ `SHOP_MAX_GRADE`. |
| `economy.HIGH_GRADE_STOCK_CHANCE` | `0.05` | Mỗi ô Tiên phẩm trên kệ có hàng với xác suất này mỗi lần kệ đổi (tồn 1). Tăng: Tiên phẩm hay lên kệ hơn. |
| `economy.HIGH_GRADE_MARKUP` | `1.8` | Giá Tiên phẩm trên kệ nhân hệ số này. Tăng: Tiên phẩm đắt hơn. |
| `economy.AUCTION_TOP_GRADE_CHANCE` | `0.3` | Đại hội đấu giá: xác suất thêm một lô Thần phẩm (công pháp, pháp khí, đan đột phá) mỗi hội (gdd 48 §4.3). Tăng: Thần phẩm hay có hơn. |
| `economy.HIGH_GRADE_PLACE` | `{"thon":0,"tran":0,"thanh":0,"kinh_do":1,"mon_phai":0,"tong_mon":0,"dai_tong_mon":1,"other":0}` | Nơi được bày Tiên phẩm trên kệ: kinh đô, đại tông môn (phân hội Vạn Bảo nhận qua tag `tinh_chat: van_bao` của tiệm). |
| `economy.EVIL_TOWN_EVIL_WEIGHT` | `3` | Thôn trấn tà phái (gdd 47 §10 B3): trọng số lên kệ của món tà (có phái tà). Tăng: tiệm nơi tà bày đồ tà dày hơn. |
| `economy.EVIL_TOWN_RIGHTEOUS_WEIGHT` | `0.3` | Thôn trấn tà phái: trọng số lên kệ của món Phật môn (tag `phat`). Giảm: đồ Phật môn hiếm hơn ở nơi tà. |
| `economy.RIGHTEOUS_TOWN_EVIL_WEIGHT` | `0.4` | Nơi chính đạo (không `phe`: chợ, đấu giá, Vạn Bảo Các): trọng số lên kệ của món tà (người chơi than đồ tà ra quá nhiều, 2026-10-31). Giảm: kệ chính đạo ít đồ tà hơn. |
| `economy.TY_GIA` | `0.6` | Giá đổi cống hiến: một món đổi ở tông tính bằng chừng này phần giá linh thạch. Tăng: đổi đồ đắt cống hiến hơn. |
| `economy.HE_SO_CONG_HIEN_BAC` | `[1,1,2,4,8]` | Hệ số cống hiến theo cấp bậc trong tông (§6): Tạp dịch, Ngoại môn, Nội môn, Chân truyền, Trưởng lão. Không theo cảnh giới. |
| `economy.HE_SO_CONG_HIEN` | `[1,1,2,4,8,16]` | Hệ số cống hiến theo cấp của việc (Treo thưởng): cảnh giới địch từ Phàm Nhân tới Hóa Thần. |
| `economy.BONG_LOC` | `[[0,0],[4,1],[6,1],[10,2],[15,2]]` | Bổng lộc mỗi năm thật theo cấp bậc (gdd 25 §9.3): [linh thạch, cống hiến] thô; cống hiến còn nhân hệ số cống hiến. |
| `economy.BONG_LOC_TOI_DA` | `[0,10,20,50,100]` | Trần bổng lộc cộng dồn theo cấp bậc. |
| `economy.PHAT_CONG_HIEN` | `0.2` | Việc điện nhiệm vụ bỏ dở: mất phần này của cống hiến lẽ ra được. Tăng: phạt bỏ việc nặng hơn. |
| `economy.CONG_HIEN_FACTORS` | `[1,1,0.6,0.4,0.25,0.2]` | Giảm bớt hệ số cống hiến theo cấp việc (cấp cao thì hệ số gốc tăng quá nhanh). |
| `economy.DONATE_RATE` | `4` | Quyên linh thạch cho tông (gdd 48 §4.5): bấy nhiêu linh thạch ăn 1 cống hiến (chỉ cống hiến tiêu, không công tích). Tăng: quyên lỗ hơn. |
| `economy.DONATE_DECAY` | `0.8` | Tỉ giá quyên nhân hệ số này sau mỗi `DONATE_BLOCK_L` L (cảnh giới người chơi) đã quyên trong năm; hồi đầu năm. Giảm: quyên nhiều xuống giá nhanh. |
| `economy.DONATE_BLOCK_L` | `20` | Số L (cảnh giới người chơi) mỗi bậc giảm tỉ giá quyên. |
| `economy.LOOKUP_TOPIC_FEE` | `3` | Tiền trà cho một câu dò hỏi theo nhu cầu (chưa hỏi nơi kiếm một món cụ thể). |
| `economy.LOOKUP_FEE_BY_GRADE` | `[2,5,20,70,200,800,2500]` | Phí dò hỏi một vật theo phẩm 1–7 (Phàm … Thần): vật càng quý, tin càng đắt. Giá trung vị mỗi phẩm 12 / 40 / 180 / 700 / 3.000 nên phí chừng 15–25% giá món. Tăng: dò hỏi tốn hơn. |
| `economy.ORDER_MARKUP_BY_GRADE` | `[1.3,1.3,1.5,1.8,2.2,3,4]` | Giá đặt hàng = giá mua tại tiệm × hệ số theo phẩm 1–7 (Phàm … Thần): phẩm càng cao càng đắt. Tăng: nhờ tiệm tìm hàng đắt hơn. |
| `economy.ORDER_MAX_QTY_BY_GRADE` | `[15,10,5,3,1,1,1]` | Số món tối đa một đơn đặt hàng theo phẩm 1–7 (Phàm … Thần): phẩm càng cao đặt được càng ít. Tăng: một đơn gom được nhiều hàng hơn. |
| `economy.BUILD_L` | `{"hoang":5,"huyen":15,"dia":40}` | Phí dựng trận truyền tống lần đầu theo phẩm (đơn vị L theo phẩm trận − 2, gdd 48 §3.3), trả khi đặt trận bàn truyền tống; phẩm cao hơn chỉ trả phần chênh. Tăng: dựng trận đắt hơn. |
| `economy.FURNACE_RENT_RATE` | `0.2` | Thuê lò mỗi mẻ = chừng này phần giá giữa khung của phẩm lò (lò Hoàng ~16, Huyền ~50, Địa ~145). Tăng: mượn lò đắt hơn. |
| `economy.MERIDIAN_LOADOUT_UNLOCK_COST` | `[0,1000,15000]` | Giá mở ô bộ kinh mạch thứ 1, 2, 3 (linh thạch); ô 1 có sẵn. Mở theo thứ tự. |
## encounter

| Khóa | Giá trị | Ghi chú |
|---|---|---|
| `encounter.BEAT_YEARS` | `5` | Một nhịp thời gian là chừng này năm; mỗi nhịp node hết hạn, Đạo Diễn bù node, ghi nợ biến cố, nhân quả nở. Tăng: thế giới đổi chậm hơn theo năm. |
| `encounter.TARGET_ENCOUNTER_NODES` | `10` | Số node sự kiện lẻ ở hoang dã quanh người chơi. Tăng: bản đồ dày chấm sự kiện hơn. |
| `encounter.MAX_PLACE_NODES` | `40` | Số node nền gần nhất hiện trên bản đồ: nơi chốn và ô hoang dã tính chung. Tăng: nhiều nơi chốn hiện cùng lúc, refreshNodes tốn hơn. |
| `encounter.OVERLAY_LIFETIME_BEATS` | `[2,5]` | Node sự kiện phủ sống từ a tới b nhịp (rút đều). Tăng: chấm sự kiện tồn tại lâu, bản đồ ít đổi. |
| `encounter.SAME_TEMPLATE_GAP` | `30` | Hai node cùng template không đứng gần hơn khoảng này (đơn vị thế giới). Tăng: cùng một sự kiện rải thưa hơn. |
| `encounter.FAR_NODE_CLEAR_RATIO` | `1.5` | Node có hạn ở xa quá chừng này lần tầm đi lại thì bị dọn. Giảm: dọn node xa sớm hơn. |
| `encounter.PLACE_EVENT_COUNT` | `[1,2]` | Số việc "Đang xảy ra" mỗi nhịp khi loại nơi không ghi `so_su_kien`: từ a tới b. Tăng: thôn trấn nhiều chuyện hơn. |
| `encounter.STANDING_EVENT_COUNT` | `[1,2]` | Số chuyện thường trú (`lam_moi: thuong_tru`) rút một lần ở mỗi nơi khi loại nơi không ghi `so_thuong_tru`. Tăng: nơi có nhiều địa vật / người thường trú hơn. |
| `encounter.CONTEXT_EVENT_COUNT` | `[0,1]` | Số chuyện theo ngữ cảnh (`lam_moi: ngu_canh`) rút mỗi lần khóa ngữ cảnh đổi khi loại nơi không ghi `so_ngu_canh`. Tăng: nơi đổi nhiều hơn theo thế cục / cảnh giới, phần thoáng qua nhường chỗ. |
| `encounter.PLACE_RECENT_MEMORY` | `8` | Nhớ bao nhiêu sự kiện gần nhất ở mỗi nơi; sự kiện trong trí nhớ bị loại hẳn (hết ứng viên mới quay về ×recentlySeen). Tăng: ít lặp hơn, nhưng kho nhỏ thì cạn lựa chọn. |
| `encounter.GLOBAL_RECENT_YEARS` | `30` | Trí nhớ toàn cục (can-bang/chong-khai-thac §3): sự kiện đã gặp ở bất kỳ đâu trong chừng này năm thì nhân `DIRECTOR_WEIGHT.recentGlobal`. Tăng: lâu mới gặp lại cùng sự kiện. |
| `encounter.RELIC_WAIT_YEARS` | `25` | Thiên đạo bù dị bảo (gdd 38 §4.3): sự kiện nguồn chính của vật Nghịch Thiên ở một nơi chưa gặp càng lâu thì trọng số càng lớn, ×(1 + số năm chờ / `RELIC_WAIT_YEARS`); chờ đủ `RELIC_WAIT_GUARANTEE` năm thì lần rút kế chắc có. Năm chờ tính từ lần đầu sự kiện hợp lệ ở nơi đó, hoặc từ lúc hết hồi chiêu sau lần gặp trước. Giảm `RELIC_WAIT_YEARS`: lực bù tăng nhanh hơn; giảm `RELIC_WAIT_GUARANTEE`: chắc gặp sớm hơn. |
| `encounter.RELIC_WAIT_GUARANTEE` | `500` |  |
| `encounter.WAIT_YEARS_MAX` | `3` | Ngồi đợi một chỗ tối đa ngần này năm. Tăng: chờ thế cục lâu hơn được. |
| `encounter.DIRECTOR_WEIGHT` | `{"riskyThreshold":0.5,"dangerAtRisky":1.5,"dangerAtSafe":0.8,"veryRiskyThreshold":1,"fortuneAtVeryRisky":1,"fortune":0.6,"secret":3,"placeTrait":1.5,"grudge":4,"worldEvent":8,"leaning":3,"recentlySeen":0.2,"recentGlobal":0.3}` | Hệ số nhân vào trọng số chọn sự kiện (`weightFor`). Tăng: loại đó ra nhiều hơn. - `riskyThreshold`: độ chênh hiểm trên mức này thì tính là nơi hiểm; `dangerAtRisky` / `dangerAtSafe`: hệ số tag `nguy_hiem` ở nơi hiểm / nơi lành. - `veryRiskyThreshold`: nơi rất hiểm; `fortuneAtVeryRisky`: hệ số tag `co_duyen` ở đó. - `fortune`: hệ số mọi sự kiện tag `co_duyen` / `ky_van` (kỳ ngộ); giảm: kỳ ngộ thưa hơn. - `secret`: mật bí; `placeTrait`: đặc trưng nơi chốn; `grudge`: chuyện của thế lực đang thù; `worldEvent`: sự kiện của thế cục đang diễn ra ở đó; `recentlySeen`: vừa gặp ở đây (hạ, chỉ dùng khi loại hẳn làm cạn ứng viên); `recentGlobal`: đã gặp ở bất kỳ đâu trong `GLOBAL_RECENT_YEARS` năm (hạ); `leaning`: sự kiện hợp thiên hướng của người chơi (phái đang đi, encounter/leaning.ts). |
| `encounter.INCIDENT_CHANCE_PER_BEAT` | `0.55` | Tỉ lệ mỗi nhịp có biến cố tại chỗ (ngoài bế quan). Tăng: bị làm phiền nhiều hơn. |
| `encounter.INCIDENT_CHANCE_CAP` | `0.95` | Trần tỉ lệ biến cố tại chỗ mỗi nhịp sau khi nhân hệ số thế cục, lộ của, độ khó. Tăng: cho phép dày hơn nữa. |
| `encounter.INCIDENT_ON_ENTER` | `0.2` | Tỉ lệ có biến cố tại chỗ mỗi lần vào một nơi chốn. Tăng: vào nơi hay có chuyện tìm tới. |
| `encounter.INCIDENT_REST_BEATS` | `0.5` | Hai biến cố (tại chỗ / dọc đường) cách nhau ít nhất từng này nhịp. Tăng: biến cố thưa hơn. |
| `encounter.AMBUSH_MIN_DISTANCE` | `30` | Chuyến đi ngắn hơn quãng này (đơn vị thế giới) thì không bị chặn đường. Tăng: đi gần được yên hơn. |
| `encounter.AMBUSH_BASE` | `0.4` | Tỉ lệ bị chặn ở chuyến dài `AMBUSH_REF_DISTANCE`, vùng không hiểm. Tăng: đi đường hay bị chặn. |
| `encounter.AMBUSH_REF_DISTANCE` | `100` | Quãng đường mốc tính `AMBUSH_BASE`. Tăng: cùng quãng đường thì ít bị chặn hơn. |
| `encounter.AMBUSH_DISTANCE_CAP` | `2` | Trần hệ số theo quãng đường (× `AMBUSH_BASE`). Tăng: chuyến thật dài càng dễ bị chặn. |
| `encounter.AMBUSH_RISKY_THRESHOLD` | `0.5` | Độ chênh hiểm trên mức này thì vùng đi qua tính là hiểm. Giảm: nhiều vùng tính là hiểm. |
| `encounter.AMBUSH_RISKY_FACTOR` | `1.5` | Vùng đi qua hiểm thì dễ bị chặn hơn: nhân hệ số này. Tăng: đi vùng hiểm nguy hơn. |
| `encounter.AMBUSH_AVOID_GAP` | `-1` | Quái né (gdd 32 §2.3): người chơi hơn cấp nền của ô từ chừng này (`doChenh` <= số này) thì biến cố có địch theo ô không ập tới. Hạ: quái né sớm hơn. |
| `encounter.ENEMY_REALM_SPREAD` | `[[0,60],[-1,25],[1,15]]` | Rải cảnh giới địch quanh cảnh giới cấp nền của ô (gdd 32 §2.3): [lệch so với `floor(capNen)`, trọng số]. Chỉ dùng khi cửa sổ `canh_gioi` của biến rộng từ 1 bậc trở lên; lệch nào không có địch trong cửa sổ thì bỏ lệch đó. |
| `encounter.AMBUSH_ENEMY_REALM_SPREAD` | `[[0,60],[1,15]]` | Bảng rải cho biến cố ập tới: như `ENEMY_REALM_SPREAD` nhưng bỏ lệch −1 (người Hóa Thần ở đất Nguyên Anh không bị Kết Đan chặn). |
| `encounter.AMBUSH_EARLY_FACTOR` | `[0.7,0.8]` | Hệ số tỉ lệ chặn đường theo cảnh giới người chơi (chỉ số = cảnh giới: Phàm Nhân, Luyện Khí…); cảnh giới không ghi thì ×1. Giảm: đầu game đỡ chết vì bị chặn đường. |
| `encounter.ENEMY_STAGE_ROLL` | `[35,30,25,10]` | Tiểu cảnh giới địch từ Trúc Cơ khi khuôn không đặt tầng riêng: Sơ / Trung / Hậu / Đại viên mãn. |
| `encounter.ENEMY_REALM_UP_CHANCE` | `[0.4,0.3,0.2,0.1]` | Nâng mốc (gdd 32 §2.3, người dùng 2026-10-17: đất thấp toàn quái phàm nhân): mỗi lần rút địch theo ô, mốc `floor(capNen)` có tỉ lệ này lên thêm một bậc, theo chỉ số = mốc (Phàm, Luyện Khí, Trúc Cơ, Kết Đan). Tăng: đất thấp hay ra quái mạnh hơn. |
| `encounter.ENEMY_REALM_UP_MAX` | `4` | Nâng mốc không vượt cảnh giới này (4 = Nguyên Anh): đất Nguyên Anh, Hóa Thần không nâng. |
| `encounter.WEALTH_EXPOSED_GRADE_GAP` | `3` | Đồ quý vượt cảnh giới: phẩm từ cảnh giới + chừng này trở lên thì lộ của. Giảm: dễ bị lộ hơn. |
| `encounter.WEALTH_EXPOSED_YEARS` | `5` | Lộ của giữ chừng này năm thật. Tăng: bị nhòm ngó lâu. |
| `encounter.WEALTH_EXPOSED_FACTOR` | `1.5` | Đang lộ của thì biến cố tại chỗ dày thêm hệ số này. Tăng: lộ của nguy hơn. |
| `encounter.WORLD_EVENT_RUMOR_RANGE` | `2` | Tin thế cục (khi thế cục không ghi `lan_truyen`) bay tới xa gấp chừng này lần tầm đi lại. Tăng: biến cố của thế cục lan xa hơn. |
| `encounter.KARMA_BLOOM_PER_BEAT` | `0.35` | Mỗi hạt nhân quả tới cửa sổ thì nở với tỉ lệ này mỗi nhịp. Tăng: nhân quả nở nhanh. |
| `encounter.WORLD_EVENTS_PER_TICK_MAX` | `3` | Một lần tick không nổ quá ngần này thế cục ngẫu nhiên cùng loại (bế quan cả trăm năm). Tăng: thế cục dồn nhiều hơn sau bế quan dài. |
| `encounter.LISTEN_RANGE_FACTOR` | `3` | Nghe ngóng ở trà lâu, phường thị… với tới xa gấp chừng này lần tin tự bay tới. Tăng: nghe ngóng thấy xa hơn. |
| `encounter.RUMOR_RADIUS` | `24` | Vòng mở sương quanh nơi có thế cục / việc vừa nghe tin (đơn vị thế giới). Tăng: tin lộ vùng rộng hơn. |
| `encounter.BOUNTY_REFRESH_YEARS` | `1` | Bảng treo thưởng làm mới sau chừng này năm thật. Tăng: bảng đổi chậm. |
| `encounter.BOUNTY_COUNT` | `[2,3]` | Số việc treo mỗi lần làm mới: từ a tới b. Tăng: bảng nhiều việc hơn. |
| `encounter.BOUNTY_MAX_TAKEN` | `3` | Nhận cùng lúc tối đa. Tăng: ôm được nhiều việc. |
| `encounter.BOUNTY_DISTANCE` | `[0.15,1]` | Nơi phải tới cách nơi treo bảng trong khoảng này (phần của tầm đi lại). Tăng b: việc đòi đi xa hơn. |
| `encounter.BOUNTY_DEFAULT_DEADLINE` | `3` | Hạn mặc định của việc treo thưởng (năm thật) khi khuôn không ghi. Tăng: việc rộng hạn. |
| `encounter.BOUNTY_ABANDON_PENALTY` | `1` | Danh vọng mất khi bỏ / quá hạn việc. Tăng: bỏ việc đau hơn. |
| `encounter.HUNTS_PER_SLOT` | `3` | Số lần săn một nơi trước khi cạn. Tăng: săn được nhiều hơn mỗi nơi. |
| `encounter.HUNT_RECOVERY_YEARS` | `2` | Hồi một lần săn sau chừng này năm thật. Tăng: nơi săn hồi chậm hơn. Phải dài hơn hẳn một trận (vài ngày tới 0,25 năm, `COMBAT_YEARS_*`): trận ăn thời gian nên hồi nhanh quá thì săn mãi không cạn. |
| `encounter.TARGET_HUNT_DIVISOR` | `3` | Truy tìm đích danh (gdd 21 §2.2.1): số tháng = clamp(round(kỳ vọng số lần roll ÷ K), 1, trần). Kỳ vọng roll = 1 / xác suất gặp loài đó ở ô. Tăng K: truy tìm nhanh hơn (số tháng nhỏ đi). Tăng trần: loài lạ tốn tối đa nhiều tháng hơn. |
| `encounter.TARGET_HUNT_MAX_MONTHS` | `2` |  |
| `encounter.TARGET_HUNT_REALM_FACTOR` | `[1,1,0.75,0.5,0.35,0.25]` | Nhân số tháng truy tìm theo cảnh giới người chơi (chỉ số CANH_GIOI): thần thức mạnh thì quét ra dấu nhanh. Giảm: cảnh giới đó truy tìm nhanh hơn. |
| `encounter.TARGET_HUNT_APEX_FACTOR` | `2` | Truy tìm con đầu đàn (tinh anh): nhân số tháng (cả trần) và tốn từng ấy lần săn của nơi. Tăng: đầu đàn đích danh đắt hơn. |
| `encounter.DUNGEON_LOSS_ON_DEFEAT` | `0.5` | Thua / bỏ chạy giữa hang: mất phần này của đồ đã gom. Tăng: thua hang đau hơn. |
| `encounter.DUNGEON_MID_FLOOR_LOOT` | `0.5` | Trận ở tầng chưa phải tầng cuối của hang / bí cảnh: đồ rơi (bảng, yêu đan, đồ khai tay của địch) nhân hệ số này; tầng cuối giữ đủ. Đặt 0,5 (2026-11-04, góp ý: bí cảnh nhiều tầng ra quá nhiều đồ, một lượt mang ra 5 viên yêu đan). Tăng: tầng giữa rơi nhiều hơn. |
| `encounter.FORAGE_SEASON_YEARS` | `[1,5]` | Độ dài một mùa thuốc của ô, năm thật [ngắn, dài], ngẫu nhiên mỗi mùa. Tăng: ổ thuốc mọc thưa hơn. |
| `encounter.FORAGE_FERTILITY` | `[0.25,0.65]` | Độ màu mỡ của ô (tỉ lệ có ổ mỗi mùa), cố định cả kiếp: [cằn, mỡ]. Tăng: ô nào cũng dễ có thuốc. |
| `encounter.FORAGE_FERTILITY_RUIN` | `0.1` | Cộng màu mỡ khi quanh ô có di tích / bí cảnh (linh khí đọng lại). |
| `encounter.FORAGE_FERTILITY_VEIN` | `0.2` | Cộng màu mỡ khi gần linh mạch (chờ bản đồ có địa danh linh mạch). |
| `encounter.FORAGE_FERTILITY_CAP` | `0.85` | Trần độ màu mỡ sau khi cộng. |
| `encounter.FORAGE_AGE_UPGRADE` | `0.1` | Tỉ lệ lên phẩm mỗi mùa ổ sống sang mà chưa ai hái. Tăng: để lâu dễ ra món tốt. |
| `encounter.FORAGE_AGE_MAX` | `2` | Số mùa tối đa một ổ sống sang (qua ngần ấy mùa thì mùa kế tung như ổ mới). |
| `encounter.FORAGE_TIER_UP_BASE` | `0.08` | Tỉ lệ lên một bậc thuốc = BASE + FRAC × phần lẻ cấp nền. |
| `encounter.FORAGE_TIER_UP_FRAC` | `0.17` |  |
| `encounter.FORAGE_TIER_DOWN_BASE` | `0.3` | Tỉ lệ xuống một bậc thuốc = BASE − FRAC × phần lẻ cấp nền. |
| `encounter.FORAGE_TIER_DOWN_FRAC` | `0.15` |  |
| `encounter.FORAGE_MAX_TIER` | `3` | Trần bậc (cảnh giới của món) và trần phẩm của thuốc mọc hoang: Thiên phẩm. Tiên / Thần phẩm chỉ rơi từ đại yêu, boss. |
| `encounter.FORAGE_MAX_GRADE` | `5` |  |
| `encounter.FORAGE_RARE_WEIGHT` | `0.18` | Trọng số món hiếm (phẩm cao hơn món thấp nhất cùng bậc, cùng địa hình) so với món thường (1). |
| `encounter.FORAGE_CLIFF_CHANCE` | `0.25` | Tỉ lệ ổ có thêm món trên vách. |
| `encounter.FORAGE_CLIFF_RARE_WEIGHT` | `0.5` | Trọng số món hiếm trên vách. |
| `encounter.FORAGE_FIGHT_CHANCE` | `{"1":0.05,"2":0.15,"3":0.3,"4":0.5,"5":0.8}` | Tỉ lệ giao chiến khi hái theo phẩm món tốt nhất của ổ (phẩm không ghi: 0). |
| `encounter.FORAGE_FIGHT_DEEP_BONUS` | `0.15` | Cộng tỉ lệ giao chiến mỗi cấp nền trên trần bậc (cấp nền 4: +0.15, 5: +0.30); chỉ cộng khi tỉ lệ gốc > 0. |
| `encounter.FACTION_EVENT_GAP_YEARS` | `15` | Nhóm sự kiện thế lực (`nhom: the_luc`, gdd 12 §20.8 E7): một sự kiện trong nhóm xảy ra thì cả nhóm nghỉ chừng này năm ngoài (nhóm gây sự `nhom_thu` chia cho 1 + số thế lực đang thù) (không tính bế quan / luyện chế). Giảm: dày hơn. |
| `encounter.FORAGE_RIVAL_SHARE` | `0.35` |  |
| `encounter.FORAGE_RIVAL_FACTION_SHARE` | `0.33` | Tu sĩ tranh thuốc có phần này là đệ tử thật của thế lực gần nhất (gdd 31 §3, E6); còn lại vô danh. |
| `encounter.FORAGE_RIVAL_SHARE_YEU` | `0.1` |  |
| `encounter.WILD_MASTER_MIN_QI` | `2` | Linh khí tối thiểu của ô hoang để có thể có chủ (`qiAt`). Tăng: chủ ô chỉ ở nơi linh khí đậm, ít chủ hơn. |
| `encounter.WILD_MASTER_CHANCE` | `{"base":0.25,"perQi":0.1,"min":0.25,"max":0.5}` | Xác suất ô đủ điều kiện có chủ: `clamp(base + perQi × (qi - WILD_MASTER_MIN_QI), min, max)`. Tăng: nhiều chủ ô hơn (đo ~100 trên bản đồ). |
| `encounter.WILD_MASTER_RARE_MIN_CAP` | `3` | Ô cấp nền từ mức này có thêm cơ hội rút chủ từ nhóm dị thú. |
| `encounter.WILD_MASTER_RARE_CHANCE` | `0.2` | Cơ hội chủ là dị thú ở ô đủ cấp nền. Tăng: nhiều hung thú dị loại làm chủ. |
| `encounter.WILD_MASTER_TITLE` | `{"son_mach":"Sơn Quân","rung_ram":"Lâm Chủ","ho_nuoc":"Đàm Chủ","hoang_mac":"Sa Chủ","hoang_nguyen":"Nguyên Chủ"}` | Danh xưng chủ ô theo địa hình đầu tiên của ô; địa hình không có trong bảng dùng `WILD_MASTER_TITLE_DEFAULT`. |
| `encounter.WILD_MASTER_VACANT_YEARS` | `10` | Số năm ô vô chủ sau khi chủ bị hạ, hết hạn thì tung lại chủ mới. Tăng: ô trống lâu hơn, có thời gian lập động phủ. |
| `encounter.WILD_MASTER_LAIR_BONUS` | `1.1` | Hệ số linh khí động phủ nhân thêm khi chiếm hang ổ của chủ ô do chính người chơi hạ trong hạn vô chủ. Tăng: chiếm hang lời hơn. |
## faction

| Khóa | Giá trị | Ghi chú |
|---|---|---|
| `faction.FACTION_RANKS` | `["ancestor","guardian","leader","vice_leader","elder","core_disciple","inner_disciple"]` | Thứ tự bậc từ cao xuống thấp (§2). |
| `faction.SEAT_TABLE` | `{"mon_phai":{"ancestor":{"count":1,"realm":[4,4],"stage":[0,0]},"guardian":{"count":2,"realm":[3,3],"stage":[2,2]},"leader":{"count":1,"realm":[3,3]},"elder":{"count":2,"realm":[2,3]},"core_disciple":{"count":1,"realm":[2,2]},"inner_disciple":{"count":2,"realm":[1,2]}},"tong_mon":{"ancestor":{"count":1,"realm":[5,5],"stage":[0,0]},"guardian":{"count":2,"realm":[4,4],"stage":[2,2]},"leader":{"count":1,"realm":[3,4]},"vice_leader":{"count":1,"realm":[3,3]},"elder":{"count":3,"realm":[3,3]},"core_disciple":{"count":2,"realm":[2,3]},"inner_disciple":{"count":3,"realm":[1,2]}},"dai_tong_mon":{"ancestor":{"count":1,"realm":[5,5]},"guardian":{"count":2,"realm":[5,5],"stage":[0,0]},"leader":{"count":1,"realm":[4,4]},"vice_leader":{"count":1,"realm":[4,4]},"elder":{"count":4,"realm":[4,4]},"core_disciple":{"count":3,"realm":[2,3]},"inner_disciple":{"count":4,"realm":[1,2]}},"tieu_gia_toc":{"leader":{"count":1,"realm":[2,3]},"elder":{"count":1,"realm":[2,2]},"core_disciple":{"count":2,"realm":[1,1]},"inner_disciple":{"count":2,"realm":[1,2]}},"gia_toc":{"ancestor":{"count":1,"realm":[4,4]},"leader":{"count":1,"realm":[3,3]},"elder":{"count":2,"realm":[3,3]},"core_disciple":{"count":3,"realm":[1,2]},"inner_disciple":{"count":3,"realm":[2,3]}}}` | Số chức vị và khoảng cảnh giới theo chức vị (§3); 0 Phàm Nhân … 5 Hóa Thần. Thiếu bậc = không có chức vị. `stage`: tiểu cảnh giới cố định (0 sơ kỳ … 3 Đại viên mãn, gdd 14 §21.1). Bậc có `stage` không chia tiểu cảnh giới với bậc khác; bậc dưới nó cùng cảnh giới chỉ chia phần dưới mốc thấp nhất của nó. |
| `faction.TERM_YEARS` | `{"ancestor":[300,600],"guardian":[200,500],"leader":[150,300],"vice_leader":[100,250],"elder":[100,300],"core_disciple":[30,80],"inner_disciple":[20,50]}` | Nhiệm kỳ (năm) theo chức vị (§5). |
| `faction.CLAN_TERM_YEARS` | `{"leader":[100,200],"elder":[100,250],"core_disciple":[30,60]}` | Nhiệm kỳ riêng của gia tộc (§15); bậc nào không ghi thì theo `TERM_YEARS`. |
| `faction.FACTION_EPOCH` | `0` | Mốc năm người đầu chuỗi chức vị bắt đầu (trước năm khởi đầu kiếp), §5. |
| `faction.SCALE_TABLE` | `{"mon_phai":{"elder":[2,4],"coreDisciple":[1,3],"inner":[10,30],"outer":[50,150]},"tong_mon":{"elder":[5,10],"coreDisciple":[3,6],"inner":[50,150],"outer":[300,800]},"dai_tong_mon":{"elder":[15,30],"coreDisciple":[8,15],"inner":[300,800],"outer":[2000,5000]}}` | Quy mô theo tầng (§4): khoảng [min, max] mỗi bậc. |
| `faction.MENIAL_RATIO` | `0.5` | Tạp dịch = ngoại môn × hệ số này. |
| `faction.SCALE_FACTOR_BY_TRAIT` | `{"hieu_chien":1.2,"be_quan_toa_mon":0.7}` | Hệ số quy mô theo `tinh_cach` của tông (§4); không ghi = ×1. |
| `faction.MEMBER_PC_WEIGHTS` | `{"disciple":[["pham",0.45],["kha",0.45],["thien_tai",0.1]],"senior":[["pham",0.5],["kha",0.5],["thien_tai",0]]}` | Phẩm chất người sinh của tông theo chức vị (gdd 43 §4): trọng số `pham` / `kha` / `thien_tai`. Đệ tử = nội môn, đại đệ tử; trưởng lão trở lên không có thiên tài. Tăng `kha` / `thien_tai`: người trong tông lên cảnh giới nhanh hơn, bảng nhân sự mạnh hơn. |
| `faction.TOP_SEAT_WAIT_YEARS` | `10` | Lão tổ / tông chủ trống chức vị: chờ người dưới đủ cảnh giới tối đa chừng này năm, quá thì sinh người mới (§7). |
| `faction.ALLIANCE_AFTER` | `1` | Số tông cùng phe (mọi tầng) đã bị người chơi diệt (trong `ALLIANCE_MEMORY_YEARS` năm gần nhất) để các tông còn lại chắc chắn liên thủ trấn áp. |
| `faction.ALLIANCE_EARLY_CHANCE` | `0.25` | Chưa tới `ALLIANCE_AFTER`: xác suất liên minh vẫn ra tay, chỉ một tông viện. Rút cố định theo (tông bị công, số tông đã mất) nên vào ra không rút lại. |
| `faction.ALLIANCE_ESCALATE_AFTER` | `3` | Số tông cùng phe (mọi tầng) đã bị diệt (trong `ALLIANCE_MEMORY_YEARS` năm) để liên minh kéo thêm tông viện của TẦNG TRÊN (chỉ lên một tầng). |
| `faction.ALLIANCE_MAX_HELPERS` | `2` | Số tông viện tối đa trong một trận công sơn (gần nhất trước, ưu tiên cùng nước). |
| `faction.ALLIANCE_MEMORY_YEARS` | `100` | Liên minh nhớ vụ diệt tông chừng ấy năm; quá thì vụ cũ không tính nữa. Cũng là hạn phản đồ chính đạo bị chặn cửa (`run.blocTraitor`). |
| `faction.TRAITOR_REPUTATION` | `-20` | Phe chính diệt tông chính (tự tàn sát đồng đạo, gdd 14 §21.8): danh vọng với mỗi đại tông chính đạo còn đứng. |
| `faction.RIVAL_BLOC_REPUTATION` | `5` | Diệt tông khác phe: danh vọng với mỗi đại tông cùng phe người chơi còn đứng. |
| `faction.DISPATCH_RANKS` | `["inner_disciple","core_disciple","elder"]` | Chức vị được cử đi truy sát, xét từ thấp lên (nội môn / hộ vệ → đại đệ tử / thiếu gia → trưởng lão). Phó tông chủ trở lên không bao giờ đi. |
| `faction.DISPATCH_RETRY_YEARS` | `[1,3]` | Người truy sát chết hoặc tụt quá ngưỡng thì chờ chừng này năm (U[min, max]) rồi cử người kế. |
| `faction.DISPATCH_SEAT_VACANT_YEARS` | `[10,20]` | Người được cử bị người chơi giết thì chức vị trống chừng này năm (U[min, max]) rồi mới lấp. |
| `faction.RANK_TITLE` | `{"ancestor":["Lão tổ","Lão tổ"],"guardian":["Thái Thượng Trưởng Lão","Thái Thượng Trưởng Lão"],"leader":["Tông chủ","Giáo chủ"],"vice_leader":["Phó tông chủ","Phó giáo chủ"],"elder":["Trưởng lão","Trưởng lão"],"core_disciple":["Đại đệ tử","Thánh tử"],"inner_disciple":["Đệ tử nội môn","Đệ tử"]}` | Tên gọi bậc (§3): [chính / trung lập, ma]. |
| `faction.CLAN_RANK_TITLE` | `{"ancestor":"Lão tổ","leader":"Gia chủ","elder":"Trưởng lão","core_disciple":"Thiếu gia","inner_disciple":"Hộ vệ"}` | Tên gọi bậc ở gia tộc (§15): thiếu gia ↔ tiểu thư theo giới tính (`CLAN_CORE_FEMALE_TITLE`); hộ vệ cũng gọi khách khanh nhưng code chỉ dùng "Hộ vệ". |
| `faction.MASTER_TERM_YEARS` | `2` | Kỳ nhận đồ đệ (năm): kỳ `k = floor(năm / MASTER_TERM_YEARS)`, mỗi kỳ tông cử `SO_SU_PHU` trưởng lão nhận đồ đệ (§14.2). |
| `faction.SECT_NEWS_MAX` | `8` | Số tin mới nhất giữ ở `run.sectNews` (§14.4). |
| `faction.SEAT_PICK_YEARS` | `10` | Biến `from: the_luc_nguoi`: cùng một sự kiện ở cùng tông thì chừng này năm liền rút cùng một người (§14.1). |
| `faction.ANCESTOR_MIN_STAGE` | `3` | Tiểu cảnh giới thấp nhất của Lão tổ đại tông người ảo (3 = Đại viên mãn): trùm cuối cho người chơi Hóa Thần cuối game. Lão tổ có tên ghi ở YAML. |
## familiar

| Khóa | Giá trị | Ghi chú |
|---|---|---|
| `familiar.FAMILIAR_COST_BY_APTITUDE` | `[6,8,10,13,14,16]` | Giá thần thức một con theo tư chất 1–5 (bảng cố định, người dùng chốt 2026-10-31), khi cảnh giới con bằng chủ và chưa giảm giá. |
| `familiar.FAMILIAR_COST_REALM_GAP` | `0.6` | Nhân giá mỗi cảnh giới con thấp hơn chủ. |
| `familiar.FAMILIAR_COST_REALM_GAP_UP` | `1.5` | Nhân giá mỗi cảnh giới con CAO hơn chủ (bắt / ấp con vượt cấp thì đắt: 1,5 mũ số cảnh giới chênh). |
| `familiar.FAMILIAR_COST_MIN` | `2` | Sàn giá sau mọi giảm. |
| `familiar.PET_COST_MULT` | `1.33` | Linh thú đắt hơn (mạnh hơn, không nhận tăng sức tâm pháp). |
| `familiar.FAMILIAR_BUDGET_BASE` | `23` | Nền ngân sách (đầu kiếp thực tế ~25–28 kể cả phần thần thức gốc). |
| `familiar.FAMILIAR_BUDGET_SENSE_DIV` | `5` | Số điểm thần thức đổi 1 điểm ngân sách (7 → 5 ngày 2026-11-01, người chơi than ngự lực chật). Giảm: thần thức cao đeo được nhiều con hơn. |
| `familiar.FAMILIAR_FIELD_MAX` | `5` | Trần số con đeo / vào sân, kể cả linh thú. |
| `familiar.FAMILIAR_TECHNIQUE_DISCOUNT` | `[0,0,0.1,0.2,0.3]` | Giảm giá con đúng loại theo phẩm tâm pháp, chỉ số = `phamSo` (1-based, kẹp 4; ô 0 không dùng): Phàm 0, Hoàng −10%, Huyền −20%, Địa trở lên −30% (kể cả Nghịch Thiên). |
| `familiar.FAMILIAR_TREASURE_DISCOUNT` | `0.1` | Bảo vật phái khai `o`: thêm −10% đúng loại (nhiều bảo vật không cộng dồn; không mở loại). |
| `familiar.FAMILIAR_BODY_DISCOUNT` | `0.2` | Mức giảm giá thi / hồn của thể chất trên. |
| `familiar.FAMILIAR_POWER` | `0.4` | Con Huyền phẩm không công pháp ≈ 40% một đồng minh cùng cảnh giới (khí huyết và pháp lực); 0,6 → 0,8 để con gánh được chủ (gdd 45 §13.1), hạ 0,4 khi đo đường tu 2026-10-28 (ngự thú / khôi lỗi thắng boss 60–99%, docs/can-bang/duong-tu-va-dich-0.0.2.md). |
| `familiar.PET_POWER` | `0.75` | Linh thú mạnh hơn mỗi con khác (gdd 45 §5.4); 1 → 0,75 (2026-10-28): một linh thú cộng tới +45 điểm thắng ở Hóa Thần. |
| `familiar.FAMILIAR_APTITUDE_MULT` | `[0.6,0.8,1,1.25,1.6,2]` | Hệ số tư chất 1–5 (Phàm → Thiên, gdd 45 §5.1): nhân khí huyết, pháp lực, linh lực, thân pháp của con. Giãn từ 0,75–1,3 lên 0,6–1,6 (2026-10-25) để hai con cùng loài khác nhau rõ theo tư chất. |
| `familiar.APTITUDE_MAX` | `6` | Bậc tư chất cao nhất: 6 = Thánh huyết, chỉ trứng xịn rút được (`RARE_EGG_TOP_APTITUDE_CHANCE`), không lên được bằng tiến hóa. |
| `familiar.APTITUDE_NORMAL_MAX` | `5` | Bậc cao nhất rút / tiến hóa thường đạt được (Thần huyết). |
| `familiar.EVOLVE_APTITUDE_MAX` | `5` | Tiến hóa nâng tư chất tối đa tới Thần huyết (5); Thánh huyết (6) chỉ có từ trứng xịn. |
| `familiar.FAMILIAR_APTITUDE_CHANCE` | `[0.45,0.33,0.165,0.05,0.005]` | Tỉ lệ rút tư chất 1–5 khi bắt / nở / luyện (tổng 1). Hạ Chân / Thần huyết từ 10% / 3% xuống 5% / 0,5% (2026-10-29): nấc rút thêm cộng dồn nên bản cũ ra quá dễ. |
| `familiar.FAMILIAR_TECHNIQUE_WEIGHT` | `0.5` | Công pháp triệu hồi: sức × `1 + (hệ số mảnh − 1) × trọng số` (gdd 45 §2.2); 1 → 0,5 (2026-10-28): mảnh 2 → con ×1,5. |
| `familiar.FAMILIAR_SKILL_MAX` | `4` | Ô đặc tính, ô chiêu tối đa của một con (gdd 45 §5.2). |
| `familiar.FAMILIAR_TRAIT_MAX` | `3` |  |
| `familiar.FAMILIAR_AUTO_RECALL_HP` | `0.2` | Tự đánh thu con về khi khí huyết dưới tỉ lệ này và đang bị địch nhắm. |
| `familiar.FAMILIAR_INJURY_HP` | `0.2` | Khí huyết đầu trận của con × (1 − hệ số × bậc thương thế), như người chơi. |
| `familiar.FAMILIAR_INJURY_ON_FALL` | `2` | Con chết trong trận: bậc thương thế = max(số này, bậc cũ + 1). |
| `familiar.FAMILIAR_INJURY_LEAVE` | `4` | Bậc thương thế rời ô (về túi con, không đeo / không vào trận; tự lành chậm xuống bậc dưới hoặc trị bằng liệu). |
| `familiar.FAMILIAR_HEAL_YEARS` | `[0,0.25,0.5,1,3]` | Năm tự lành mỗi bậc thương thế 1–4 (nhanh gấp đôi người chơi; bậc 4 rời ô lành chậm xuống bậc 3 để không kẹt vòng không đánh được thì không có liệu); bế quan × `FAMILIAR_HEAL_RETREAT_MULT`. |
| `familiar.FAMILIAR_HEAL_RETREAT_MULT` | `1.5` |  |
| `familiar.FAMILIAR_REVIVE_ITEMS` | `3` | Trị bậc rời ô: số món liệu nuôi đúng loại và linh thạch theo cảnh giới con. |
| `familiar.FAMILIAR_REVIVE_STONE` | `[40,100,400,1200,3500,12000]` |  |
| `familiar.FAMILIAR_FEED_PRICE` | `[12,35,140,380,1150,3800]` | Giá liệu nuôi theo cảnh giới con 0–5 (Phàm Nhân → Hóa Thần), gdd 45 §3.9. Cơ sở tính linh thạch kèm. |
| `familiar.FAMILIAR_FEED_STONE` | `[0,0.25,0.5,0.75,1,1.25]` | Linh thạch kèm mỗi món liệu (cho ăn, trị bậc 1–3) = hệ số theo cảnh giới con 0–5 × giá liệu nuôi cùng cảnh giới: 0 · 9 · 70 · 285 · 1.150 · 4.750 (Phàm Nhân miễn); nâng từ 0 · 0 · 35 · 190 · 575 · 1.900 (2026-10-29). |
| `familiar.FAMILIAR_RITUAL_STONE` | `10` | Linh thạch kèm nghi thức (ấp, luyện, tiến hóa) = hệ số × mức cho ăn của cảnh giới con sau nghi thức. |
| `familiar.CAPTURE_SKILL_POWER` | `0.5` |  |
| `familiar.CAPTURE_ELITE_CHANCE` | `0.5` |  |
| `familiar.CAPTURE_PER_FIGHT` | `1` |  |
| `familiar.CAPTURE_TALISMAN_MULT` | `0.5` |  |
| `familiar.EGG_DROP_CHANCE` | `{"thuong":0.03,"tinh_anh":0.1,"boss":0.35,"than_thu":0.15}` | Cơ hội rơi trứng / con non theo mức địch; `than_thu` là boss thần thú (gdd 45 §4.5, §4.6). |
| `familiar.EGG_DROP_PER_FIGHT` | `1` |  |
| `familiar.EGG_APTITUDE_SHIFT` | `1` | Ấp trứng / ấu trùng (`trung_thu`): thêm bấy nhiêu nấc (mỗi nấc một lượt rút tư chất, giữ cao nhất) so với con bắt bằng chiêu (gdd 45 §4.5, §5.1). |
| `familiar.DIVINE_MIN_APTITUDE` | `3` | Sàn tư chất của thần thú huyết duệ (khuôn tag `than_thu`): 3 = Dị huyết (gdd 45 §4.6, §5.1). |
| `familiar.RARE_EGG_MIN_APTITUDE` | `3` | Trứng xịn (vật trứng tag `trung_quy`, nở ra con ấu rồi nuôi lớn; gdd 45 §4.5, góp ý người chơi 2026-11-01): sàn tư chất Dị huyết, `RARE_EGG_TOP_APTITUDE_CHANCE` ra Thánh huyết, luôn kèm một dòng đặc tính hiếm (`RARE_PASSIVE_IDS`). |
| `familiar.RARE_EGG_TOP_APTITUDE_CHANCE` | `0.01` |  |
| `familiar.RARE_EGG_TOP_PHAM_MULT` | `[0,0,0,0.1,0.5,1,1]` | Hệ số nhân `RARE_EGG_TOP_APTITUDE_CHANCE` theo phẩm trứng xịn (chỉ số = phẩm; Phàm, Hoàng không có cửa; Huyền 0,1 · Địa 0,5 · Thiên trở lên 1, tức 0,1% · 0,5% · 1%): trứng càng thấp phẩm càng khó ra Thánh huyết. |
| `familiar.RITUAL_AUX_HIGH_GAP` | `2` | Liệu phụ có phẩm hơn liệu chính từ bấy nhiêu bậc thì thêm `RITUAL_AUX_HIGH_SHIFT` nấc thay vì một (gdd 45 §4.4). |
| `familiar.RITUAL_AUX_HIGH_SHIFT` | `2` |  |
| `familiar.FAMILIAR_FEED_DROP_CHANCE` | `0.3` | Thi khí / hồn phách tàn rơi sau trận (gdd 45 §4.7). |
| `familiar.HATCH_YEARS` | `1` | Nghi thức ấp trứng (hoặc nghi thức không ghi `thoi_gian`): số năm. |
| `familiar.RITUAL_AUX_MAX` | `2` | Liệu phụ nghi thức tối đa mỗi lần; mỗi món (phẩm ≥ liệu chính) thêm một nấc tư chất (gdd 45 §4.4, §5.1). |
| `familiar.RITUAL_YEARS_BY_REALM` | `[1,1,1.5,2,3,4]` | Thời gian nghi thức × hệ số theo cảnh giới khuôn ra con (gdd 45 §4.4): Phàm Nhân, Luyện Khí giữ nguyên, Hóa Thần ×4. |
| `familiar.FAMILIAR_BAG_MAX` | `25` | Túi con chứa tối đa (20 → 25 ngày 2026-11-01, tối đa 40 sau mở rộng), tính cả con đang đeo và con sắp ra từ nghi thức đang chạy (gdd 45 §4.9). Đầy thì không bắt, không ra con non, không bắt đầu nghi thức; save cũ vượt trần giữ nguyên. |
| `familiar.RITUAL_MAX` | `3` | Nghi thức chạy cùng lúc tối đa, mọi loại chung (gdd 45 §4.9; 2 → 3 sau góp ý 2026-11-01). Tăng: ra con nhanh hơn. |
| `familiar.FAMILIAR_BAG_UPGRADES` | `[{"add":5,"realm":2,"costL":40},{"add":5,"realm":4,"costL":40},{"add":5,"realm":5,"costL":40}]` | Bậc mở rộng túi con / ô nghi thức (như `STORAGE_UPGRADES`): `add` thêm, đòi cảnh giới `realm`, giá `costL` × L chuẩn của cảnh giới đó. |
| `familiar.RITUAL_UPGRADES` | `[{"add":1,"realm":3,"costL":40},{"add":1,"realm":5,"costL":40}]` |  |
| `familiar.PET_BREAKTHROUGH_EXP` | `1` |  |
| `familiar.PET_BOND_MILESTONES` | `[30,60,100]` |  |
| `familiar.PET_BOND_TRAIT_MULT` | `[1.25,1.5]` | Hệ số ô bản mệnh theo mốc thân thiết 60 / 100 (gdd 45 §5.4): ×1,25 và ×1,5. Dưới mốc 60 là ×1. |
| `familiar.PET_TRANSFORM_REALM` | `5` | Hóa hình (gdd 45 §11.3): linh thú từ cảnh giới này (Ngũ giai) và thân thiết mốc cuối thì đổi sang dạng người. |
| `familiar.PET_INTERACT_BOND` | `3` | Thân thiết cộng mỗi lần tương tác (mỗi tháng thời gian game một lần). Spec chưa ghi số: ~34 tháng tới 100. |
| `familiar.PET_FEED_BOND` | `2` | Thân thiết cộng thêm khi cho ăn món thích (tính khí nào thích hệ nào: `PET_FAVORITE_FOOD`). Món không thích thì ăn vẫn lớn nhưng không cộng. |
| `familiar.PET_INTERACT_FIND_CHANCE` | `0.15` | Cơ hội linh thú tha về một vật khi tương tác, và bảng vật (linh dược Nhất giai, rẻ). |
| `familiar.PET_INTERACT_FINDS` | `["item.thanh_tam_thao","item.sa_can_thao","item.mach_hoa_thao","item.ha_diep_suong"]` |  |
| `familiar.PET_WIN_BOND` | `1` | Thân thiết cộng khi linh thú đang đeo cùng thắng trận (đứng tới cuối trận). |
| `familiar.PET_FAVORITE_FOOD` | `{"hien":["moc","tho"],"nghich":["phong","hoa"],"kieu":["kim","loi"],"nhat":["thuy","bang"],"tham_an":null}` | Món thích theo tính khí (gdd 45 §5.4): liệu cho ăn có hệ thuộc danh sách là món thích; `null` = món nào cũng thích (tham ăn). Spec chưa khai món thích: chọn bảng hệ đơn giản. |
| `familiar.TRAIT_GUARD_MASTER_CHANCE` | `0.25` |  |
| `familiar.TRAIT_SYNC_CHANCE` | `0.3` |  |
| `familiar.TRAIT_SYNC_POWER` | `0.3` |  |
| `familiar.LINK_PER_FAMILIAR` | `0.04` | Linh khế (tâm pháp): chủ +chừng này khí huyết tối đa và sát thương (pháp lực) mỗi con đúng loại tâm pháp đang trên sân, không đếm linh thú. |
| `familiar.PACK_WEAPON_BONUS` | `0.15` | Pháp khí phái: uy chiêu × `1 + PACK_WEAPON_BONUS × số con đúng loại trên sân`, không đếm linh thú. |
| `familiar.LENH_HOP_KICH_POWER` | `0.35` | Chiêu lệnh Hợp kích: mỗi con trên sân đánh theo bằng chiêu công mạnh nhất × hệ số này. |
| `familiar.LENH_THUC_DMG` | `0.3` | Chiêu lệnh Thúc: mọi con trên sân +chừng này sát thương trong `LENH_THUC_TURNS` lượt của chính nó. |
| `familiar.LENH_THUC_TURNS` | `3` |  |
| `familiar.LENH_HIEN_COST` | `0.3` | Chiêu lệnh Hiến: con nhiều khí huyết nhất mất chừng này khí huyết tối đa (còn ít nhất 1); chủ hồi lượng đó × `LENH_HIEN_HEAL`. |
| `familiar.LENH_HIEN_HEAL` | `1` |  |
| `familiar.FAMILIAR_YEARLY_EXP` | `0.25` | Dưỡng sinh tự lớn mỗi năm: phần ngưỡng tiểu cảnh giới (~4 năm một tiểu cảnh giới nếu không cho ăn). |
| `familiar.FAMILIAR_STAGE_EXP_MULT` | `0.3` | Ngưỡng tiểu cảnh giới của con = `REALM_CULTIVATION_PER_STAGE` × hệ số này: 6 · 12 · 39 · 240 · 600 · 1.200. |
| `familiar.EVOLVE_BASE_CHANCE` | `0.6` |  |
| `familiar.EVOLVE_APTITUDE_CHANCE` | `0.1` |  |
| `familiar.EVOLVE_FAIL_EXP_LOSS` | `0.3` |  |
| `familiar.EVOLVE_AUX_MAX` | `2` | Liệu phụ tiến hóa (gdd 45 §6.2): tối đa chừng này món, mỗi món +`EVOLVE_AUX_BONUS` tỉ lệ thành. Lấy từ liệu phụ nghi thức cùng loại, phẩm ≥ cảnh giới sau tiến hóa. |
| `familiar.EVOLVE_AUX_BONUS` | `0.1` |  |
| `familiar.EVOLVE_INPLACE_CHANCE` | `0.85` | Khuôn chưa khai `tien_hoa` (lên đại cảnh giới tại chỗ): tỉ lệ cao hơn, không đổi hình. Spec chưa ghi số. |
| `familiar.EVOLVE_DIVINE_PENALTY` | `0.2` | Khuôn thần thú huyết duệ (tag `than_thu`) trừ thêm vào tỉ lệ tiến hóa. Spec chưa ghi số. |
| `familiar.DEVOUR_EXP_STAGES` | `1` | Nuốt một con cùng loại: nhận chừng này lần ngưỡng tiểu cảnh giới của con bị nuốt. Spec chưa ghi số. |
| `familiar.FAMILIAR_PASSIVE_MAX` | `4` | Số dòng tối đa của một con, tách khỏi ô đặc tính. |
| `familiar.PASSIVE_COUNT_BY_APTITUDE` | `[[1,1],[1,1],[1,2],[2,2],[2,3],[3,3]]` | Số dòng khi có con theo tư chất 1–6: [ít, nhiều]; khác nhau thì 50/50. |
| `familiar.PASSIVE_BAD_CHANCE` | `[0.4,0.3,0.2,0.1,0.05,0]` | Tỉ lệ mỗi dòng rút ra là dòng xấu theo tư chất 1–6. |
| `familiar.PASSIVE_TIER_CHANCE` | `[0.45,0.3,0.16,0.07,0.02]` | Tỉ lệ phẩm dòng tốt Hoàng · Huyền · Địa · Thiên · Tiên; mỗi nấc (khốn trận, trứng, liệu phụ) thêm một lượt rút, giữ cao nhất, như tư chất. |
| `familiar.PASSIVE_BAD_TIER_CHANCE` | `[0.6,0.3,0.1]` | Tỉ lệ bậc dòng xấu Nhẹ · Vừa · Nặng. |
| `familiar.PASSIVE_DEVOUR_CHANCE` | `0.03` | Thôn phệ rút riêng, mỗi con một lần, ngoài bảng phẩm. |
| `familiar.PASSIVE_DEVOUR_INNATE` | `["enemy.huyet_co","enemy.quy_mau","enemy.thao_thiet_du_due"]` | Khuôn có Thôn phệ bẩm sinh (ngoài mọi thi / hồn). |
| `familiar.DEVOUR_RANK_GAP` | `1` | Thôn phệ: con bị nuốt không thấp hơn con nuốt quá chừng này tiểu cảnh giới. |
| `familiar.DEVOUR_PER_REALM` | `1` | Thôn phệ: số lần được nuốt cho mỗi đại cảnh giới con đã đạt (tính cả cảnh giới hiện tại), dồn lại nếu chưa dùng. |
| `familiar.SKILL_TIER_UY` | `[0.85,1,1.2]` | Uy chiêu nhân theo bậc 1–3 (chiêu ngự linh dưỡng sinh; thiếu bậc = bậc 1). |
| `familiar.SKILL_TIER3_CHANCE` | `{"base":0.05,"perAptitude":0.04,"perRealm":0.02}` | Tỉ lệ ra bậc 3 / bậc 2 khi rút lĩnh ngộ: gốc + mỗi bậc tư chất trên 1 + mỗi đại cảnh giới; còn lại là bậc 1. |
| `familiar.SKILL_TIER2_CHANCE` | `{"base":0.25,"perAptitude":0.05,"perRealm":0.02}` |  |
| `familiar.REROLL_BASE_ITEMS` | `1` | Đổi lĩnh ngộ (rút lại ba lựa chọn / quên chiêu để ngộ lại) không giới hạn lần, tốn liệu cho ăn đúng loại của con: `REROLL_BASE_ITEMS + REROLL_STEP × n` món, n = lần đã đổi trong cảnh giới hiện tại. |
| `familiar.REROLL_STEP` | `1` |  |
| `familiar.PASSIVE_TREASURE_BUDGET` | `0.5` | Tầm bảo: món rơi thêm rút từ bảng rơi với chừng này phần ngân sách trận. |
| `familiar.PASSIVE_LOW_HP` | `0.3` | Truy sát / Trung thành: khí huyết (địch / chủ) dưới tỉ lệ này. |
| `familiar.PASSIVE_BLOODRAGE_HP` | `0.5` | Cuồng huyết: khí huyết của con dưới tỉ lệ này. |
| `familiar.PASSIVE_DOUBLE_STRIKE_POWER` | `0.5` | Liên kích: đòn thêm có uy × hệ số này. |
| `familiar.PASSIVE_REGEN_HEAL` | `[1.25,1.5,1.75,2,2.5]` | Hồi phục nhanh ngoài trận: thời gian lành thương ÷ hệ số này theo phẩm. |
| `familiar.PASSIVE_VALUES` | `{"might":[0.05,0.08,0.12,0.16,0.22],"tough":[0.06,0.1,0.15,0.2,0.28],"agile":[0.06,0.1,0.15,0.2,0.28],"vanguard":[0.15,0.2,0.3,0.4,0.55],"executioner":[0.12,0.18,0.25,0.35,0.5],"counter_element":[0.08,0.12,0.18,0.25,0.35],"bloodrage":[0.12,0.18,0.25,0.35,0.5],"double_strike":[0.08,0.12,0.16,0.22,0.3],"mana_drain":[0.02,0.03,0.05,0.07,0.1],"venom":[0.05,0.08,0.12,0.16,0.22],"regen":[0.015,0.02,0.03,0.04,0.055],"resolve":[0.15,0.25,0.35,0.5,0.7],"pressure_ward":[1,1,2,2,3],"unyielding":[1],"pack":[0.03,0.04,0.06,0.08,0.11],"lone_wolf":[0.15,0.22,0.3,0.4,0.55],"loyal":[0.12,0.18,0.25,0.35,0.5],"attune":[0.008,0.012,0.018,0.025,0.035],"guardian":[0.1,0.15,0.2,0.25,0.35],"sync":[0.12,0.18,0.24,0.3,0.4],"glutton":[0.15,0.25,0.35,0.5,0.7],"gifted":[0.04,0.06,0.09,0.12,0.16],"treasure":[0.03,0.05,0.07,0.1,0.14],"insight":[1],"essence":[1],"devour":[1],"sovereign":[0.15],"prodigy":[0.5],"bloodline":[0.15],"timid":[0.05,0.1,0.15],"frail":[0.06,0.12,0.18],"sluggish":[0.06,0.12,0.18],"fragile":[0.05,0.1,0.15],"unruly":[0.03,0.06,0.1],"picky":[0.15,0.3,0.45],"slow_heal":[1.25,1.5,2],"dull":[0.04,0.08,0.12]}` | Số của từng dòng theo phẩm (gdd 45 §13.2): dòng tốt năm số Hoàng → Tiên (dòng cố định một phẩm chỉ một số), dòng xấu ba số Nhẹ → Nặng. Tỉ lệ là phần (0,05 = 5%); Phá áp là số tiểu cảnh giới cộng vào bậc uy áp; Chậm lành là hệ số thời gian lành. |
## loot

| Khóa | Giá trị | Ghi chú |
|---|---|---|
| `loot.LOOT_BUDGET` | `{"lau_la":1,"thuong":2.5,"tinh_anh":6,"boss":15}` | Ngân sách giá trị của một trận theo mức địch chính, nhân L(cảnh giới địch) và `DIFFICULTY.loot`. Phần theo bảng chỉ lấp chỗ thiếu so với ngân sách này sau khi trừ đồ khai tay. Tăng: trận mức đó rơi nhiều giá trị hơn từ bảng. |
| `loot.LOOT_COMPANION_FACTOR` | `0.3` | Địch kèm góp vào ngân sách trận chừng này phần ngân sách của mức nó. Tăng: trận đông địch rơi nhiều hơn. |
| `loot.LOOT_OVERSHOOT` | `1.2` | Món từ bảng nhận được nếu giá ≤ phần còn lại × hệ số này (cho vượt nhẹ để món vừa tầm không bị bỏ). Tăng: bảng dễ ra món đắt hơn phần còn. |
| `loot.LOOT_MAX_ROLLS` | `2` | Số lượt rút bảng tối đa mỗi trận, bất kể bao nhiêu địch. Tăng: trận có thể ra nhiều món từ bảng hơn. |
| `loot.LOOT_ROLL_CHANCE` | `0.6` | Mỗi lượt rút bảng xảy ra với xác suất này, để có trận trắng tay, có trận trúng. Tăng: bảng ra đều hơn. |
| `loot.LOOT_MAX_KINDS` | `4` | Trần tổng số loại vật (id khác nhau, không tính linh thạch và yêu đan) của gói rơi một trận: bảng không rút thêm khi đã chạm. Tăng: gói rơi được lắm loại hơn. |
| `loot.LOOT_MAX_RARE` | `2` | Trần số món quý (món từ `roi_quy`) mỗi trận; chạm trần thì `roi_quy` còn lại bỏ qua, không gieo, không đặt cờ. Tăng: nhiều món quý cùng ra một trận. |
| `loot.LOOT_JACKPOT_CHANCE` | `{"lau_la":0.01,"thuong":0.03,"tinh_anh":0.06,"boss":0.1}` | Trúng đồ ngon: mỗi trận một lần gieo riêng, bỏ qua ngân sách, rơi một món đúng phẩm chuẩn của cảnh giới địch (tốn một suất `LOOT_MAX_RARE`). Nhân `DIFFICULTY.loot`. Tăng: đánh quái cùng cảnh giới hay ra đồ ngon hơn. |
| `loot.LOOT_JACKPOT_UP_CHANCE` | `0.1` | Trong số lần trúng đồ ngon, phần này là món của cảnh giới trên địch một bậc (phẩm chuẩn bậc đó). Tăng: đồ vượt cấp hay ra hơn. |
| `loot.LOOT_HIGH_GRADE` | `4` | Phẩm từ đây trở lên (Địa = 4, màu tím) là đồ ngon: khó rơi hơn ở bảng và lần trúng đồ ngon. |
| `loot.LOOT_HIGH_GRADE_FACTOR` | `0.5` | Hệ số cho phẩm từ `LOOT_HIGH_GRADE`: nhân trọng số món đó khi rút bảng, nhân tỉ lệ trúng đồ ngon khi phẩm chuẩn của cảnh giới địch đạt mốc (cả lượt vượt cấp). `roi_quy` hạ thẳng trong `RARE_DROP_CHANCE`. Tăng: đồ Địa phẩm trở lên rơi dễ hơn. |
| `loot.LOOT_MAX_SHARE` | `0.6` | Một món từ bảng không được đắt quá phần này của ngân sách trận (độc đắc chỉ từ `roi_quy`). Tăng: bảng ra được món chiếm phần lớn ngân sách. |
| `loot.LOOT_MATCH_WEIGHT` | `3` | `theo_dich`: vật khớp hệ / tộc của địch có trọng số nhân hệ số này, không cấm vật khác. Tăng: bảng bám bản sắc địch chặt hơn. |
| `loot.BEAST_CORE_DROP` | `{"thuong":{"chac":0,"them":0.3},"tinh_anh":{"chac":1,"them":0.2},"boss":{"chac":2,"them":0.5}}` | Yêu đan theo giai (gdd 21 §2.5) mỗi con yêu thú hạ được, theo mức: `chac` viên chắc chắn, rồi một viên nữa với xác suất `them`. Địch kèm nhân thêm `LOOT_COMPANION_FACTOR`. Tăng: đánh yêu thú ra nhiều yêu đan hơn. |
| `loot.CLAN_DROP_RATE` | `0.4` | Bảng rơi theo tộc / họ (`roi_toc`, `roi_ho`, gdd 21 §2.2) nằm ngoài ngân sách trận: tỉ lệ từng dòng nhân hệ số này. Hạ 1 → 0,6 (2026-10-21, góp ý người chơi: săn yêu bán yêu tài kiếm tiền quá dễ), rồi 0,6 → 0,4 (2026-10-30, săn yêu vẫn lời; cùng đợt bỏ linh thạch rơi của yêu thú). Tăng: săn yêu, hang, chủ ổ rơi nhiều yêu tài hơn. |
| `loot.LOOT_LIFESPAN_PILL_FACTOR` | `0.15` | Đan cộng thọ nguyên khi dùng (Duyên Thọ Đan, Trường Xuân Đan…): nhân trọng số món đó khi rút bảng, kể cả lần trúng đồ ngon, không cấm hẳn. Đặt 0,15 (2026-11-01, góp ý: đánh tu sĩ rớt Duyên Thọ Đan và đan tăng thọ quá nhiều, thọ đan mất giá). Tăng: đan thọ nguyên rơi nhiều hơn. |
| `loot.LOOT_LIFESPAN_HERB_FACTOR` | `0.5` | Linh dược cộng thọ nguyên khi dùng (Vạn Niên Bàn Đào, Thái Tuế…): như `LOOT_LIFESPAN_PILL_FACTOR` nhưng chỉnh riêng cho linh dược. Tăng: dược thọ nguyên rơi nhiều hơn. |
| `loot.LOOT_STACK` | `{"nguyen_lieu":[1,2],"linh_duoc":[1,2]}` | Số lượng mỗi món từ bảng, [ít, nhiều], theo loại vật (loại không ghi: 1). Tăng: ra chồng lớn hơn. |
| `loot.LOOT_EXCLUDED_KINDS` | `["lenh_bai","dac_san","di_hoa"]` | Loại vật không bao giờ rơi theo bảng (nguồn riêng hoặc không phải chiến lợi phẩm; dị hỏa là kỳ ngộ); vẫn rơi được nếu khai tay. Giảm: thêm loại vào bảng. |
| `loot.LOOT_JACKPOT_ONLY_KINDS` | `["tru_vat","phuong_tien","dung_cu"]` | Loại vật chỉ ra ở lần trúng đồ ngon (dòng `ngon` của bảng), không ra ở phần bảng thường: đồ dùng lâu dài. Bớt: loại đó thành đồ vặt rơi đều. |
| `loot.LOOT_EXCLUDED_TAGS` | `["nghich_thien","di_bao","chi_khai_bao","ngu_linh"]` | Tag loại vật khỏi bảng rơi: Nghịch Thiên, `chi_khai_bao` (vật cốt truyện, nhiệm vụ, thành tựu: chỉ ra từ nơi đã khai), `ngu_linh` (món phái ngự linh: tông đúng phái, kệ xin tag, rơi quý; gdd 45 §4.7). |
| `loot.EVIL_GEAR_TAGS` | `["ma","thi","quy","doc","hop_hoan"]` | Tag của công pháp / pháp khí các phái tà (ma đạo, luyện thi, luyện hồn, độc cổ, hợp hoan): chỉ vào bộ đồ và bảng rơi của địch phe tà (`isEvilEnemy`). |
| `loot.EVIL_GEAR_LEAK` | `0.1` | Địch không thuộc phe tà nhặt được đồ tà trong bảng rơi với trọng số nhân hệ số này (bộ đồ địch mang thì không có). Tăng: tu sĩ thường, yêu thú ra đồ tà nhiều hơn. |
## natal

| Khóa | Giá trị | Ghi chú |
|---|---|---|
| `natal.NATAL_MIN_REALM` | `2` | Đại cảnh giới thấp nhất tế luyện được bản mệnh (2 = Trúc Cơ). Giảm: mở sớm hơn. |
| `natal.NATAL_MIN_GRADE` | `2` | Phẩm (1-based) thấp nhất / cao nhất nhận làm bản mệnh: Hoàng (2) → Thần (7). Nghịch Thiên và Phàm không nhận. |
| `natal.NATAL_MAX_GRADE` | `7` |  |
| `natal.NATAL_MAX_BASE_GRADE` | `6` | Phẩm cao nhất nhận làm bản mệnh mới: Tiên (6). Món gốc Thần đã trần, không Dưỡng giai được; bản mệnh vẫn lên Thần qua Dưỡng giai. |
| `natal.NATAL_REFINE_YEARS` | `[0.5,1,2,4,8,16]` |  |
| `natal.NATAL_ESSENCE_YEARS` | `[3,5,10,20,40,80]` | Tinh huyết: thọ nguyên đốt thật khi luyện; nghề luyện bảo nhân bớt (`NATAL_CRAFT_ESSENCE_MULT`). |
| `natal.NATAL_ASCEND_YEARS` | `[0,3,6,12,25,50]` | Đốt thọ khi Dưỡng giai lên phẩm ở cột (cột Hoàng không dùng: không lên được Hoàng). |
| `natal.NATAL_RELEASE_YEARS` | `[1,2,4,8,15,30]` | Phản phệ thọ khi Hóa bản mệnh. |
| `natal.NATAL_TEMPER_YEARS` | `[0.5,1,1.5,3,6,12]` | Đốt thọ mỗi lần Huyết luyện (+`NATAL_EXP_TEMPER` tâm huyết). |
| `natal.NATAL_BLOOD_SACRIFICE_YEARS` | `[0.1,0.1,0.2,0.4,0.8,1.5]` | Đốt thọ mỗi lần dùng chiêu Tế huyết trong trận. |
| `natal.NATAL_REFINE_COST` | `40` | Linh thạch luyện = giá này × `heSo` phẩm. Tăng: luyện tốn tiền hơn. |
| `natal.NATAL_ENGRAVE_COST` | `20` | Linh thạch khắc một văn lần đầu = giá này × `heSo` phẩm hiệu dụng; sau đó đổi qua lại miễn phí. |
| `natal.NATAL_LIFESPAN_GUARD` | `2` | Luyện / dưỡng giai chỉ được khi thọ còn lại ≥ số năm sắp đốt × hệ số này (không tự chết vì luyện). |
| `natal.NATAL_CRAFT_ESSENCE_MULT` | `[1,0.9,0.8,0.7,0.6,0.5]` |  |
| `natal.NATAL_CRAFT_FAIL` | `[30,25,20,15,10,5]` | Tỉ lệ hỏng mẻ (%). Hỏng: mất một nửa tinh huyết, mất thời gian, món về túi, không phụ phẩm. |
| `natal.NATAL_CRAFT_BYPRODUCT` | `[1,1,2,2,3,3]` |  |
| `natal.NATAL_FAIL_ESSENCE_RATIO` | `0.5` | Nhân tinh huyết khi hỏng mẻ. |
| `natal.NATAL_TIER_EXP` | `[0,20,60,150]` | Mốc tâm huyết để lên tầng 1, 2, 3, Viên mãn (chỉ số 0–3). |
| `natal.NATAL_GRID_MULT` | `[1.5,1.65,1.8,1.8]` | Hệ số mảnh cố định theo tầng (thay hệ số ô trên lưới). |
| `natal.NATAL_SLOTS_BY_TIER` | `[0,1,2,3]` | Số ô văn mở theo tầng. |
| `natal.NATAL_MAX_SLOTS` | `4` | Thêm ô văn thứ 4 sau lần Dưỡng giai đầu; tối đa. |
| `natal.NATAL_TIER2_COST_MULT` | `0.85` | Từ tầng 2: phí chiêu ×. Từ tầng 3: hồi chiêu giảm. |
| `natal.NATAL_TIER3_COOLDOWN_CUT` | `1` |  |
| `natal.NATAL_EXP_WIN` | `1` |  |
| `natal.NATAL_WIN_REALM_GAP` | `1` | Thắng chỉ tính khi địch ≥ cảnh giới người − ngần này (không cày địch yếu). |
| `natal.NATAL_EXP_YEAR` | `1` |  |
| `natal.NATAL_EXP_YEAR_CAP` | `3` | Tối đa tâm huyết từ bế quan trong một năm lịch. |
| `natal.NATAL_EXP_BREAKTHROUGH` | `10` |  |
| `natal.NATAL_EXP_TEMPER` | `3` |  |
| `natal.NATAL_TEMPER_PER_REALM` | `5` | Số lần Huyết luyện tối đa mỗi đại cảnh giới. |
| `natal.NATAL_LOSS_RATIO` | `0.25` | Thua trận mất tỉ lệ tâm huyết này (không tụt dưới mốc tầng đang đứng). |
| `natal.NATAL_GRADE_CAP` | `2` | Phẩm hiệu dụng tối đa = phẩm gốc + hằng này. |
| `natal.NATAL_ASCEND_EXP` | `20` | Sau Dưỡng giai: tâm huyết về mốc này (tầng 2). |
| `natal.NATAL_RUNE_LEVEL_POINTS` | `[6,18]` | Điểm cần để lên cấp 2, cấp 3 của một văn (chỉ số = cấp hiện tại 0, 1 → tới cấp kế). |
| `natal.NATAL_DEVOUR_PER_YEAR` | `5` |  |
| `natal.NATAL_DEVOUR_LOW_GAP` | `3` | Món thấp hơn phẩm hiệu dụng từ ngần này bậc trở lên chỉ cho nửa điểm. |
| `natal.NATAL_DEVOUR_LOW_RATIO` | `0.5` |  |
| `natal.NATAL_LEARN_GAP` | `2` | Ngộ văn mới cần món phẩm ≥ phẩm hiệu dụng − ngần này. |
| `natal.NATAL_RUNE_CANDIDATES` | `3` | Số văn ứng viên mỗi lượt nuốt. |
| `natal.NATAL_RUNE_VALUE` | `{"liet":[0.08,0.14,0.2],"phagiap":[0.1,0.15,0.2],"lienhoan":[0.1,0.15,0.2],"echo_ratio":[0.5,0.5,0.5],"hothe":[0.03,0.06,0.1],"kimchung":[0.05,0.08,0.12],"hutmau":[0.05,0.1,0.15],"tulinh":[0.04,0.08,0.12],"effect_chance":[0.25,0.35,0.45],"troi":[0.1,0.15,0.2],"troi_turns":[1,1,1],"phan":[0.75,0.8,0.85],"van":[0.6,0.65,0.7],"quy":[1.33,1.4,1.5],"nhiem":[0,0.04,0.08],"uanbao":[0.08,0.14,0.2],"inner_stat":[0.6,1,1.5]}` | Giá trị văn theo cấp (chỉ số 0–2 = cấp 1–3); khóa dùng ở `character/natalRunes.ts`. |
| `natal.NATAL_EFFECT_UY_MULT` | `0.85` | Mỗi văn Hiệu ứng nhân uy chiêu (giá dạng, gdd 37 §4.5). |
| `natal.NATAL_SHAPE_CHANCE` | `{"single":1,"spread":0.75,"all":0.6}` | Tỉ lệ gây hiệu ứng nhân theo hình dạng chiêu: chặn khống chế / hiệu ứng cả trận mỗi lượt. |
| `natal.NATAL_AFFINITY_BONUS` | `0.1` |  |
| `natal.NATAL_BLOOD_SACRIFICE_POWER` | `2.5` | Tế huyết: uy nhân, khí huyết hiện tại đốt, sàn khí huyết (tỉ lệ) để dùng được. |
| `natal.NATAL_BLOOD_SACRIFICE_HP` | `0.08` |  |
| `natal.NATAL_BLOOD_SACRIFICE_MIN_HP` | `0.25` |  |
| `natal.NATAL_DAMAGE_YEARS` | `0.5` | Bản mệnh tổn: số năm (6 tháng game) và thời gian chữa bằng bế quan. |
| `natal.NATAL_MEND_YEARS` | `0.25` |  |
| `natal.NATAL_DAMAGE_REALM_GAP` | `1` | Thua địch hơn mình từ ngần này đại cảnh giới thì bản mệnh tổn ngoài trận. |
| `natal.NATAL_BREAK_CHANCE` | `0.5` | Phá bảo trong trận (gdd 56 §5.2): tỉ lệ trúng gốc (nhân thần thức hai bên), số lượt bản mệnh tổn, khí huyết tối đa chủ hộc. |
| `natal.NATAL_BREAK_TURNS` | `3` |  |
| `natal.NATAL_BREAK_HP` | `0.15` |  |
| `natal.NATAL_BREAK_INJURY` | `1` | Bậc thương thế cộng thêm khi trận kết thúc (gdd 51), mỗi lần Phá bảo trúng. |
| `natal.ENEMY_NATAL_CHANCE` | `{"lau_la":[0,0,0,0,0,0],"thuong":[0,0,0,0.05,0.12,0.2],"tinh_anh":[0,0,0,0.3,0.55,0.8],"boss":[0,0,0,0.5,0.8,1]}` | Tỉ lệ tu sĩ / phi nhân có bản mệnh theo hạng và cảnh giới địch (Phàm Nhân → Hóa Thần); từ Kết Đan. Tăng: hay gặp địch có bản mệnh hơn. |
| `natal.ENEMY_NATAL_ELITE` | `[0,0,0,0.7,0.9,1]` | Như trên cho NPC siêu mạnh (elite); `MucDich` không có elite. |
| `natal.ENEMY_NATAL_ATTACK_SHARE` | `0.75` | Tu sĩ có bản mệnh: tỉ lệ là pháp bảo công (có chiêu), còn lại là bảo vật nội tại. |
| `natal.ENEMY_NATAL_TIER` | `{"lau_la":[0,0],"thuong":[0,1],"tinh_anh":[1,2],"boss":[2,3]}` | Khoảng tầng (0–3) theo hạng; elite lấy như boss. Tăng: bản mệnh địch xịn hơn (hệ số, ô văn, hồi chiêu). |
| `natal.ENEMY_NATAL_RUNE_LEVEL` | `{"lau_la":0,"thuong":0,"tinh_anh":1,"boss":1}` | Cấp văn (0–2 = cấp 1–3) theo hạng. |
| `natal.ENEMY_NATAL_REPLACES` | `{"lau_la":false,"thuong":false,"tinh_anh":false,"boss":false}` | Cờ theo hạng, `true`: bản mệnh thay một món trong bộ thay vì thêm. Dùng nếu đo thấy hạng đó quá khó. |
| `natal.ENEMY_NATAL_BEAST_UY` | `[0,0.05,0.1,0.15]` | Yêu đan bản mệnh (phi nhân): uy chiêu nâng thêm theo tầng 0–3, cộng ngoài văn. |
| `natal.ENEMY_NATAL_BANNED_RUNES` | `["van.phuc_van","van.tinh_tam","van.troi"]` | Văn không đưa vào pool địch: Phúc Vận, Tĩnh Tâm (vô tác dụng trong trận), Trói (chưa qua kháng khống chế, gdd 57 §5). |
## path

| Khóa | Giá trị | Ghi chú |
|---|---|---|
| `path.PATH_SHARE` | `0.3333333333333333` | Tỉ phần ô của mảnh tà trong ô mảnh thông từ mức này thì lưới là đường tà. Giảm: ít đồ tà đã thành tà tu. |
| `path.PATH_SHIFT_YEARS` | `[5,5,10,20,40,60]` | Năm tu luyện / bế quan giữ lưới đường mới để chuyển đạo, theo cảnh giới (Phàm Nhân … Hóa Thần). Tăng: đổi đường khó hơn. |
| `path.HEART_DEMON_TIERS` | `[20,40,70]` | Ba mốc tâm ma của chính đạo (tâm bất an, ma chướng, tâm ma nhập thể). |
| `path.HEART_DEMON_SPEED_AT_TOP` | `0.85` | Tốc độ tu khi tâm ma từ mốc cuối. Giảm: tâm ma nặng tu chậm hơn. |
| `path.CONTROL_BASE` | `30` | Trần khống ma = nền + mỗi cảnh giới + bản tâm. Tăng: giữ được nhiều ma niệm hơn. |
| `path.CONTROL_PER_REALM` | `10` |  |
| `path.ERODE` | `0.2` | Mỗi điểm ma niệm nạp vào bào chừng này bản tâm. Tăng: nạp ma niệm hại dây cương hơn. |
| `path.RESTRAIN` | `3` | Mỗi điểm bản tâm tăng nén chừng này ma niệm. Tăng: giữ bản tâm hạ ma niệm mạnh hơn. |
| `path.DEMON_POWER` | `0.03` | Chiêu tà mạnh thêm chừng này mỗi 10 ma niệm (tới trần). |
| `path.DEMON_CULTIVATION_DIV` | `400` | Tốc độ tu × (1 + ma niệm / chừng này), ma niệm kẹp ở trần. Giảm: ma niệm tu nhanh hơn. |
| `path.OVER_CAP_RATE` | `0.02` | Đột phá: mỗi điểm ma niệm vượt trần trừ chừng này tỉ lệ. |
| `path.LOSE_CONTROL_PER` | `0.02` | Mỗi điểm ma niệm vượt trần thêm chừng này xác suất mất kiểm soát đầu lượt, tới trần LOSE_CONTROL_MAX. |
| `path.LOSE_CONTROL_MAX` | `0.5` |  |
| `path.OVER_CAP_GAIN` | `0.25` | Chiêu `nap` nạp phần vượt trần chỉ tính chừng này. Giảm: đánh hăng khó đẩy ma niệm lên quá trần. |
| `path.NAP_UY` | `0.3` | Chiêu `nap` (nhập ma) được phép uy cao hơn chừng này so với chiêu cùng phẩm (validator). |
| `path.BURN_UY` | `0.02` | Chiêu `dot` (đốt ma niệm): uy × (1 + n × BURN_UY). |
| `path.MA_HOA_AT` | `0.8` | Chiêu `ma_hoa` bật hiệu ứng ma hóa khi ma niệm từ tỉ lệ này của trần. |
| `path.LIFESTEAL_BASE` | `0.1` | Phái huyết: chiêu tà hút máu nền + mỗi 10 ma niệm; ma hóa nhân đôi. |
| `path.LIFESTEAL_PER_10` | `0.01` |  |
| `path.MA_HOA_LEECH_MULT` | `2` |  |
| `path.SCHOOL_PER_10` | `0.01` | Phái độc / hợp hoan: độc mạnh thêm, tỉ lệ khống chế thêm chừng này mỗi 10 ma niệm. |
| `path.MA_HOA_POISON_TURNS` | `2` | Ma hóa phái độc: độc thêm lượt; hợp hoan: khống chế thêm lượt; thi: con thi hồi tỉ lệ khí huyết tối đa; hồn: Hồn ấn giữ chừng này lượt. |
| `path.MA_HOA_CONTROL_TURNS` | `1` |  |
| `path.MA_HOA_THI_HEAL` | `0.1` |  |
| `path.MA_HOA_MARK_TURNS` | `3` |  |
| `path.BLOOD_REFINE_TU_VI` | `2` | Huyết luyện: phái huyết kết liễu thì tu vi rơi nhân chừng này. |
| `path.MA_KHI_FROM_DEMON` | `0.5` | Ma khí = 100 × tỉ phần tà của lưới + (tà tu) ma niệm × hệ số này. |
| `path.DETECT_PLACE_FACTOR` | `{"hoang_da":0.1,"thon":0.1,"tran":0.3,"thanh":0.6,"kinh_do":0.9,"tong_mon":1,"chua":1.2,"quan_ai":0.8}` | Hệ số phép thử theo nơi: hoang dã đất chính đạo, thôn, trấn, thành, kinh đô, sơn môn chính đạo, chùa. Tăng: dễ bị nhận ra hơn. |
| `path.RIGHTEOUS_DETECT_RATE` | `0.5` | Nơi tà phái soi người chính đạo (gdd 47 §10 B4): cùng công thức và hệ số nơi như lộ ma khí, nhân thêm hệ số này. Tăng: người chính đạo vào nơi tà hay bị gây sự hơn. |
| `path.DETECT_REALM_STEP` | `0.1` | Mỗi đại cảnh giới hơn cảnh giới vùng trừ chừng này xác suất bị nhận ra. |
| `path.DETECT_MAX` | `0.8` | Trần xác suất bị nhận ra một lần vào. |
| `path.EXPOSED_YEARS` | `10` | Nơi đã lộ nhớ mặt chừng này năm: vào lại là bị đánh ngay. |
| `path.EXPOSE_REP` | `5` | Danh vọng mất với thế lực quản vùng mỗi lần lộ. |
| `path.HIDE_RANKING_AT` | `30` | Liễm tức từ chừng này thì giấu được tu vi, không lên Thiên Kiêu Bảng (§4.4). |
| `path.CONCEAL_HUNT_SCALE` | `50` | Truy nã / truy đuổi nhân 1 / (1 + liễm tức / chừng này): liễm tức 20 còn ~71%, 45 ~53%, 90 ~36% (§4.6). |
| `path.HEART_DEMON_EVENT_CHANCE` | `[0.1,0.2,0.35]` | Xác suất sự kiện tâm ma theo mốc (tâm bất an, ma chướng, tâm ma nhập thể) mỗi lần bế quan / tu luyện từ HEART_DEMON_EVENT_YEARS năm. |
| `path.HEART_DEMON_EVENT_YEARS` | `10` |  |
| `path.TEMPLE_CALM` | `15` | Tĩnh tâm ở chùa: tâm ma giảm max(TEMPLE_CALM, TEMPLE_CALM_SHARE × tâm ma), cúng linh thạch theo cảnh giới (Phàm Nhân … Hóa Thần), mỗi chừng này năm một lần. |
| `path.TEMPLE_CALM_SHARE` | `0.25` | Tĩnh tâm ở chùa: phần tâm ma hiện có được gỡ khi tâm ma cao. Tăng: tâm ma nặng gỡ nhanh hơn. |
| `path.TEMPLE_COST` | `[30,100,300,1000,3000,10000]` |  |
| `path.TEMPLE_COOLDOWN` | `10` |  |
| `path.MASTER_SUPPRESS` | `0.5` | Sư phụ áp chế: tâm ma nhân (1 − hệ số này), mỗi đại cảnh giới một lần. |
| `path.SLAY_DEMON_REALM` | `4` | Trảm tâm ma: từ cảnh giới này, tâm ma tối thiểu, T = tâm ma × hệ số; mỗi chừng này năm một lần. |
| `path.SLAY_DEMON_MIN` | `20` |  |
| `path.SLAY_DEMON_T` | `1.2` |  |
| `path.SLAY_DEMON_COOLDOWN` | `20` |  |
| `path.SLAY_WIN_DAO_TAM` | `5` | Trảm thắng: đạo tâm +; thua: tâm ma +, thương thế ít nhất mức này. |
| `path.SLAY_LOSE_DEMON` | `10` |  |
| `path.SLAY_LOSE_INJURY` | `2` |  |
| `path.SUPPRESS_YEARS` | `10` | Mỗi chừng này năm bế quan trấn ma: bản tâm +1. Tu vi bế quan × SUPPRESS_SPEED. |
| `path.SUPPRESS_SPEED` | `0.7` |  |
| `path.DUAL_GAIN` | `0.05` | Song tu với đạo lữ: mỗi bên tu vi + tỉ lệ này của tu vi tiểu cảnh giới; mảnh hợp hoan thông thì phần người chơi ×DUAL_HOP_HOAN. |
| `path.DUAL_HOP_HOAN` | `2` |  |
| `path.DUAL_AFFINITY` | `5` |  |
| `path.DUAL_COOLDOWN` | `5` |  |
| `path.DRAIN_MIN_AFFINITY` | `60` | Thải bổ người quen: hảo cảm tối thiểu, tu vi được (× hệ số cảnh giới), ma niệm +, hảo cảm −, xác suất thế lực họ biết mà ghi thù. |
| `path.DRAIN_GAIN` | `0.1` |  |
| `path.DRAIN_DEMON` | `2` |  |
| `path.DRAIN_AFFINITY` | `15` |  |
| `path.DRAIN_FEUD` | `0.25` |  |
| `path.DRAIN_COOLDOWN` | `5` |  |
| `path.DRAIN_GLOBAL_COOLDOWN` | `3` | Năm giữa hai lần thải bổ người quen, chung mọi người (chống xoay vòng nhiều người để năm nào cũng thải bổ). |
| `path.DRAIN_DEFEATED` | `0.15` | Thải bổ kẻ bại trận ở bước xử trí: tu vi được, ma niệm +. |
| `path.DRAIN_DEFEATED_DEMON` | `1` |  |
| `path.DRAIN_DEFEATED_COOLDOWN` | `1` | Năm giữa hai lần thải bổ kẻ bại trận (chung mọi kẻ địch, chống cày địch sinh vô hạn). |
| `path.DRAIN_REALM_CLAMP` | `[0.5,1.5]` | Hệ số cảnh giới thải bổ (cảnh giới họ / cảnh giới mình) kẹp trong khoảng này. |
| `path.DRAIN_DEMON_DIV` | `200` | Phái hợp hoan: thải bổ được thêm ma niệm / chừng này. |
## rebirth

| Khóa | Giá trị | Ghi chú |
|---|---|---|
| `rebirth.DIEM_SAN` | `3` | Kiếp nào cũng ít nhất chừng này điểm (§2). Tăng: kiếp yểu vẫn tích được nhiều. |
| `rebirth.ISLAND_START_CHANCE` | `0.1` | Xác suất điểm xuất phát bốc trúng đảo khi trong nước có cả đảo lẫn đất liền (đảo phải qua đò mới đi được). Tăng: khởi đầu ở đảo thường hơn. |
| `rebirth.GIVE_UP_MIN_REALM` | `2` | Tán công dưới đại cảnh giới này (2 = Trúc Cơ) chỉ còn điểm lần đầu: không cảnh giới, sàn, ×1,2 (gdd 15 §12.1). Tăng: chặn tán công farm điểm gắt hơn. |
| `rebirth.THUONG_NGAU_NHIEN` | `0.2` | Thưởng chế độ Ngẫu nhiên: không dùng quyền chọn nào (gdd 08). Tăng: ngẫu nhiên lời hơn chọn tay. |
| `rebirth.PHAM_CHAT_DIEM` | `{"thuong":2,"hoan_my":5}` | Điểm cộng cho phẩm chất đột phá Thượng / Hoàn Mỹ ở đại cảnh giới 1; mỗi đại cảnh giới sau nhân thêm hệ số này. |
| `rebirth.PHAM_CHAT_DIEM_NHAN` | `2` |  |
| `rebirth.PHAM_KY_UC_MAX` | `5` | Công pháp xuất thân Chuyển thế nhớ lại được: phẩm tối đa. |
| `rebirth.GIA_XAC_NHAN` | `50` | Món từ chừng này điểm thì HUD hỏi xác nhận trước khi mua. |
| `rebirth.IMMORTAL_CARRY_BASE` | `1` | Số món bất diệt mặc định và số ô tối đa mua thêm bằng điểm luân hồi. |
| `rebirth.IMMORTAL_CARRY_UPGRADES` | `3` |  |
| `rebirth.LINH_THACH_NAC` | `[0,20,50,100,200,350]` | Linh thạch khởi đầu theo nấc Hành trang. |
| `rebirth.LIFESPAN_BONUS_PER_LEVEL` | `0.04` | Phần trăm thọ gốc cộng thêm mỗi nấc Thọ ở Bến. |
| `rebirth.LIFESPAN_BONUS_LEVELS` | `7` | Số nấc Thọ tối đa và số năm mỗi nấc đã cộng trong save cũ (chỉ dùng migration). |
| `rebirth.LEGACY_LIFESPAN_PER_LEVEL` | `5` |  |
| `rebirth.O_TUI_MOI_NAC` | `2` | Ô túi cộng thêm mỗi nấc Túi. |
| `rebirth.REINCARNATION_SPEED_BONUS` | `[0,0.1,0.2,0.3,0.4,0.5,0.75,1]` | Túc tuệ theo nấc, nhân sau nén tốc độ; nấc 0 chưa mua. |
| `rebirth.DI_THE_NAC` | `[1,1.5,2,2.5,3]` | Hệ số dị thể theo nấc. |
| `rebirth.BREAKTHROUGH_BONUS_PER_LEVEL` | `0.02` | Tỉ lệ đột phá cộng thêm mỗi nấc Đạo tâm (gdd 15 §12.4). Tăng: Đạo tâm mạnh hơn. |
| `rebirth.BREAKTHROUGH_BONUS_MAX_LEVEL` | `3` | Số nấc Đạo tâm tối đa. |
## sect

| Khóa | Giá trị | Ghi chú |
|---|---|---|
| `sect.CAP_BAC` | `["Tạp dịch","Ngoại môn","Nội môn","Chân truyền","Trưởng lão"]` | Tên bậc trong sư môn của người chơi, thấp tới cao (gdd 14 §3). |
| `sect.PHAM_CAP_BAC` | `[0,2,4,5,5]` | Phẩm cao nhất đổi được theo cấp bậc (§5.1): Nội môn Địa (đồ Trúc Cơ), Chân truyền và Trưởng lão Thiên. Tăng: bậc đó đổi được món phẩm cao hơn. |
| `sect.PHAM_TANG` | `{"mon_phai":3,"tong_mon":4,"dai_tong_mon":5}` | Phẩm cao nhất đổi được theo tầng tông (§5.1). |
| `sect.TIEN_CU_HAO_CAM` | `70` | Sư phụ phải đạt chừng này hảo cảm mới tiến cử. Tăng: khó xin tiến cử hơn. |
| `sect.SECT_ADMISSION_FLOOR` | `{"mon_phai":1,"tong_mon":2,"dai_tong_mon":3}` | Sàn cấp nền phép thử tuyển đồ theo tầng sơn môn. |
| `sect.HAN_VANG` | `[[10,15],[20,30],[30,50],[60,100],[null,null]]` | Hạn nhắc / xóa tên (năm) theo cấp bậc; Trưởng lão chỉ có nghĩa vụ qua sự kiện. Tăng: được vắng lâu hơn. |
| `sect.HAN_VANG_CANH_GIOI` | `[1,1,1,2,4,8]` | Hạn vắng nhân theo đại cảnh giới (theo tỉ lệ thọ nguyên so với Trúc Cơ): cảnh giới cao bế quan lâu hơn. Tăng: được vắng lâu hơn. |
| `sect.HAN_VANG_NGHIEM` | `0.7` | Kiếm tông nghiêm hơn: hạn vắng nhân hệ số này. Giảm: nghiêm hơn nữa. |
| `sect.LEAVE_FEE_PER_RANK` | `50` | Cống hiến cần có để xin xuống núi êm đẹp: mỗi bậc (bậc + 1) tính chừng này (nhân hệ số cống hiến). |
| `sect.ELDER_FEUD_MERIT_PENALTY` | `200` | Trưởng lão gây thù nhẹ (ghi thù) với chính sư môn: không giáng bậc mà trừ chừng này cống hiến (nhân hệ số cống hiến). Tăng: phạt nặng hơn. |
| `sect.DANH_VONG_TONG` | `{"vao":10,"thang":5,"phan":-60}` | Danh vọng theo đường tông môn: bái nhập +10, mỗi bậc thăng +5, phản môn rơi xuống Tử thù. |
| `sect.SWORD_REDEEM_DISCOUNT` | `0.7` | Kiếm Tông: món có tag kiếm đổi bằng hệ số giá này. Giảm: rẻ hơn. |
| `sect.PILL_REDEEM_DISCOUNT` | `0.6` | Đan Hà: đan dược / đơn phương luyện đan đổi bằng hệ số giá này. |
| `sect.MIN_REDEEM_PRICE` | `5` | Giá đổi tối thiểu một món (cống hiến). |
| `sect.RANK_REDEEM_FACTOR` | `[1,1,0.9,0.8,0.7]` | Hệ số giá cống hiến theo bậc Tạp dịch … Trưởng lão (cộng dồn với đặc ân đại tông). Giảm: bậc đó đổi rẻ hơn. |
| `sect.BLOOD_SECT_WIN_MERIT` | `5` | Huyết Sát Tông: mỗi trận thắng cộng chừng này cống hiến (nhân hệ số cống hiến). |
| `sect.BUDDHA_SIN_PENALTY` | `-10` | Kim Cương Tự: kết liễu người phạm sát giới thì trừ chừng này cống hiến (nhân hệ số cống hiến). |
| `sect.PRECEPT_MERIT_PENALTY` | `-15` | Giới luật về đạo lữ / song tu / thải bổ (gdd 14 §9.1): mỗi lần phạm trừ chừng này cống hiến (nhân hệ số cống hiến). |
| `sect.LINH_MACH_PRICE` | `30` | Giá bế quan ở linh mạch mỗi LINH_MACH_BASE_YEARS năm (cống hiến, không nhân hệ số cống hiến theo cảnh giới). |
| `sect.LINH_MACH_PRICE_PER_RANK` | `0.1` | Giá linh mạch tăng thêm mỗi cấp bậc (tỉ lệ trên giá gốc). Đặt 0: giá cố định. |
| `sect.LINH_MACH_BASE_YEARS` | `5` | Số năm mặc định mỗi lần bế quan linh mạch, cũng là đơn vị tính giá. |
| `sect.LINH_MACH_SPEED_BY_RANK` | `[1,1.1,1.3,1.4,1.5]` | Hệ số tu luyện ở linh mạch theo bậc Tạp dịch … Trưởng lão (Nội môn nhảy rõ để lên bậc thấy được). Tăng: bậc đó tu nhanh hơn. |
| `sect.LINH_MACH_MAX_MILESTONE_BY_RANK` | `[3,3,4,4,4]` | Mốc bế quan dài nhất ở linh mạch theo bậc (mốc của cảnh giới, gdd 25). Ngoại môn như chỗ ngồi sơn môn; Nội môn trở lên ngồi lâu hơn. |
| `sect.TOURNAMENT_REWARD` | `[0,20,50,100,160]` | Cống hiến thưởng theo số trận thắng (0..4), nhân hệ số cống hiến (gdd 14 §15.1). Thắng hết bảng 8 người là 3 trận (100), bảng 16 người là 4 trận (160). |
| `sect.TOURNAMENT_SIZE` | `{"mon_phai":8,"tong_mon":8,"dai_tong_mon":16}` | Số người mỗi bảng đại bỉ theo tầng tông (`DiaDanh.tang`); số vòng = log2. Tăng: bảng dài hơn, đầu bảng khó hơn. |
| `sect.TOURNAMENT_WINNERS_KEEP` | `10` | Giữ bảng đầu bảng của chừng này kỳ gần nhất mỗi tông. |
| `sect.TOURNAMENT_WIN_AFFINITY` | `10` | Người chơi đứng đầu bảng: hảo cảm với mọi người có chức vị đã gặp, và danh vọng thanh của đại tông. |
| `sect.TOURNAMENT_WIN_REPUTATION` | `10` |  |
| `sect.PROMOTION_RETRY_YEARS` | `2` | Khảo hạch thăng Nội môn / Chân truyền (§15.3): thua thì chờ chừng này năm mới khảo lại; thắng thì hảo cảm với đối thủ có tên. |
| `sect.PROMOTION_WIN_AFFINITY` | `5` |  |
| `sect.SECT_BOUNTY_TIERS` | `[-1,0,0,0,1,1]` | Điện nhiệm vụ (gdd 14 §16.1): độ lệch cảnh giới địch so với người chơi, mỗi phần tử một việc (1 dễ / 3 vừa / 2 khó). Thêm phần tử: bảng dài hơn. |
| `sect.SECT_BOUNTY_REACH` | `[1,2,3,4]` | Điện nhiệm vụ không dựng được việc nào trong tầm đi lại thì nới tầm tìm nơi phải tới theo lần lượt các bội này (sơn môn nằm giữa thôn trấn không có hoang dã gần, hay giữa vùng tử địa với người cảnh giới thấp). Tăng: ít tông trống việc hơn, việc xa hơn. |
| `sect.SECT_RANK_BONUS` | `0.1` | Cống hiến của việc điện nhiệm vụ nhân thêm `1 + SECT_RANK_BONUS × capBac`. Tăng: bậc cao làm việc lời hơn. |
| `sect.SECT_OFFERING_RATE` | `0.3` | Cống hiến nhận được = round(giá × hệ số này), tối thiểu 1. Tăng: nộp đồ lợi hơn. |
| `sect.SECT_OFFERING_CAP_PER_YEAR` | `[30,80,200,500,1200]` | Trần cống hiến nhận từ nộp đồ mỗi năm, theo cấp bậc (Tạp dịch … Trưởng lão). Tăng: nộp đồ cày cống hiến nhanh hơn. |
| `sect.SECT_OFFERING_KINDS_BY_SCHOOL` | `{"dan":["dan_duoc","linh_duoc"],"khi":["phap_khi","nguyen_lieu"],"phu":["phu_luc","nguyen_lieu"],"tran":["tran_ban","tran_van","nguyen_lieu"],"kiem":["phap_khi"],"ngu_thu":["yeu_tai"],"khoi_loi":["phap_khi","nguyen_lieu"],"the":["yeu_tai","linh_duoc"],"phat":["linh_duoc"],"am":["phap_khi","linh_duoc"],"ma":["yeu_tai","phap_khi"],"thi":["yeu_tai","phap_khi"],"doc":["linh_duoc","yeu_tai"],"hop_hoan":["dan_duoc","linh_duoc"],"quy":["yeu_tai","phap_khi"]}` | Loại vật bảo khố nhận theo phái của tông; loại công pháp nhận ở mọi tông (`SECT_OFFERING_ALWAYS_KINDS`). Phái tà đạo mới thêm dòng ở đây. |
| `sect.SECT_OFFERING_DEFAULT_KINDS` | `["dan_duoc","linh_duoc"]` | Phái chưa có trong bảng trên thì nhận các loại này. |
| `sect.SECT_OFFERING_ALWAYS_KINDS` | `["cong_phap"]` | Loại nhận ở mọi tông (Tàng Kinh Các thu bí tịch). |
| `sect.SECT_ORDER_TERM_YEARS` | `3` | Mỗi kỳ chừng này năm bảo khố có một đơn (món tông cần, giao từ túi). |
| `sect.SECT_ORDER_RATE` | `0.6` | Cống hiến (cộng cả công tích) khi giao đủ đơn = giá × số lượng × hệ số này; không tính vào trần nộp năm. Tăng: đơn lợi hơn. |
| `sect.SCHOOL_PERK` | `{"mon_phai":{"kindRedeem":0.85,"swordRedeem":0.85,"pillRedeem":0.8,"winMerit":2,"heartDemon":0.75},"tong_mon":{"kindRedeem":0.85,"swordRedeem":0.85,"pillRedeem":0.8,"winMerit":2,"heartDemon":0.75}}` |  |
| `sect.DISCIPLE_REPUTATION_FLOOR` | `-59` | Đang là đệ tử đại tông thì danh vọng thanh đại tông đó không xuống dưới mức này (Lạnh nhạt, gdd 14 §14.6). Phản môn mới rơi xuống `DANH_VONG_TONG.phan`. |
| `sect.SECT_STORAGE_SLOTS` | `[5,10,15,20,30]` | Sức chứa tĩnh thất (số loại vật) theo bậc Tạp dịch … Trưởng lão. Tăng: kho rộng hơn, thêm lý do lên bậc. |
| `sect.SECT_THEFT_MIN_YEARS` | `5` | Vắng ít hơn từng này năm thì đồng môn không động tay. |
| `sect.SECT_THEFT_RATE_PER_YEAR` | `0.02` | Tỉ lệ bị trộm mỗi năm vắng (nhân hệ số bậc). Tăng: mất đồ dễ hơn. |
| `sect.SECT_THEFT_MAX` | `0.4` | Trần tỉ lệ bị trộm (trước hệ số bậc). |
| `sect.SECT_THEFT_RANK_FACTOR` | `[1,1,0,0,0]` | Hệ số tỉ lệ trộm theo bậc: tĩnh thất từ Nội môn có cấm chế, không ai trộm được. |
| `sect.SECT_THEFT_TWO_KINDS_FROM` | `8` | Tĩnh thất từng này loại vật trở lên thì kẻ trộm lấy 2 loại thay vì 1. |
| `sect.ELDER_INVITE_REALM` | `{"mon_phai":4,"tong_mon":4,"dai_tong_mon":5}` | Cảnh giới tối thiểu được mời làm Trưởng lão theo tầng tông (Nguyên Anh; đại tông Hóa Thần). Tăng: khó được mời hơn. |
| `sect.ELDER_INVITE_REPUTATION` | `40` | Danh vọng tối thiểu với đại tông (môn phái / tông môn không có thanh danh vọng). |
| `sect.ELDER_INVITE_TAM_MA` | `{"chinh":{"max":15},"ma":{"min":20},"ta":{"min":12}}` | Tâm ma theo đường lối tông: chính đạo đòi tâm ma thấp (`max`), ma / tà đạo đòi có tâm ma (`min`: người đạo tâm quá sạch họ không tin). Tăng `max`: chính đạo dễ nhận hơn. Tăng `min`: ma / tà khó nhận hơn. |
| `sect.ELDER_INVITE_TAM_MA_SHIFT` | `{"nghiem_khac":-8,"khoan_dung":10}` | Chỉnh theo tính cách tông (cộng vào ngưỡng tâm ma đã chọn): khắc nghiệt thì chặt hơn, khoan dung thì thoáng hơn. |
| `sect.ELDER_INVITE_GREED_STONES` | `500` | Tông tham lam đòi người mời có sẵn chừng này linh thạch làm lễ ra mắt (không bị trừ). |
## social

| Khóa | Giá trị | Ghi chú |
|---|---|---|
| `social.HAO_CAM_HAT` | `{"an_nghia":30,"nhan_duyen":20,"oan_han":-40,"phan_boi":-60}` | Hảo cảm khởi điểm theo loại hạt gieo vào người đó (gdd 10 §10.1). Tăng: hạt ân nghĩa thân sẵn, hạt oán thù hằn sẵn. |
| `social.MOC_HAO_CAM` | `[-100,-50,-20,20,60,100]` | Các mốc hảo cảm (cận dưới mỗi nhãn của `tenHaoCam`), từ thấp lên cao; trần là 100. |
| `social.AFFINITY_MIN` | `-100` | Hảo cảm kẹp trong thang này. |
| `social.AFFINITY_MAX` | `100` |  |
| `social.REPAY_AFFINITY_GAIN` | `5` | Hảo cảm cộng thêm khi trả hết nợ linh thạch cho người đó. Tăng: trả nợ lấy lại lòng tin nhiều hơn. |
| `social.PHAT_QUA_HAN` | `-20` | Quá hạn không trả nợ thì hảo cảm cộng (số âm) chừng này. Giảm: quỵt nợ mất lòng nặng hơn. |
| `social.HAO_CAM_NHUONG` | `40` | Ninh Tam Sinh từ chừng này hảo cảm thì nhường cơ duyên cho người chơi. |
| `social.DU_DUYEN` | `{"tri_ky":15,"ket_nghia":15,"dao_lu":15,"tu_thu":-15,"phan_boi":-15}` | Dư duyên (gdd 10 §8.3): danh phận cuối kiếp → hảo cảm khởi điểm kiếp sau. |
| `social.ROMANCE_MAX_AGE_RATIO` | `0.4` | Tình ý / kết duyên chỉ với người có tuổi không quá phần này thọ nguyên cảnh giới của họ (Phàm Nhân 28, Luyện Khí 48, Trúc Cơ 112…). Tăng: người lớn tuổi hơn cũng thành đạo lữ được. |
| `social.SO_BANG_HUU_TOI_DA` | `5` | Tối đa bằng hữu (kể cả tri kỷ, kết nghĩa). |
| `social.SO_KE_THU_CHU_DONG` | `3` | Chỉ ba kẻ thù đầu tiên chủ động; người thứ tư trở đi nằm chờ (gdd 10 §6.2). |
| `social.FOE_GANG_MAX_GAP` | `4` | Kẻ thù kém người chơi tới chừng này tiểu cảnh giới (4 = một đại cảnh) vẫn truy sát nhưng kéo bè; kém hơn nữa thì thôi. Tăng: kẻ yếu hơn vẫn dám tìm tới. |
| `social.GAN_CANH_ABOVE_GAP` | `4` | Biến `the_luc_nguoi` có `gan_canh`: người hơn người chơi tối đa chừng này tiểu cảnh giới vẫn tính là ngang sức (kém tối đa `FOE_GANG_MAX_GAP`). |
| `social.CHENH_VUOT_HAN` | `2` | Chênh từng này đại cảnh giới thì kẻ thù thôi đi săn; bằng hữu không theo kịp. |
| `social.ALLY_MAX_REALM_GAP` | `2` | Bạn đồng hành / đồng minh chỉ ra tay khi chênh dưới chừng này đại cảnh giới. |
| `social.TI_LE_CUU_VIEN` | `0.2` | Thua trận: mỗi bằng hữu cùng nước có tỉ lệ này xông vào cứu. Tăng: bạn cứu nhiều hơn. |
| `social.THUONG_HO_PHAP` | `0.05` | Tỉ lệ bằng hữu ra tay hộ pháp. |
| `social.NAM_DONG_HANH` | `10` | Bạn đồng hành mặc định theo người chơi chừng này năm. |
| `social.TAM_MA_BOI_THE` | `10` | Tâm ma cộng khi giết huynh đệ kết nghĩa. |
| `social.TAM_MA_MAT_DAO_LU` | `15` | Tâm ma cộng khi đạo lữ qua đời. |
| `social.MAT_KHI_TRUOT` | `0.3` | Đột phá đại cảnh giới trượt thì mất phần tu vi này. |
| `social.TOC_DO_TU_THU` | `1.2` | Tử thù tu luyện nhanh hơn vì mối thù. |
| `social.TOC_DO_DAO_LU` | `1.5` | Đạo lữ tu nhanh hơn nhờ song tu. |
| `social.NPC_BASE_LIFESPAN` | `120` | Thọ chuẩn (năm) của mốc / tốc độ nhạt; bạn sống lâu hơn thì nhạt chậm tương ứng. |
| `social.NPC_LIFESPAN_MARGIN` | `5` | NPC mới sinh cách ngưỡng thọ ít nhất chừng này năm. |
| `social.NAM_NHAT` | `15` | Mốc (năm) / tốc độ nhạt chuẩn ở thọ 120 năm; hảo cảm bạn nhạt dần tới HAO_CAM_BAN rồi dừng. |
| `social.TOC_DO_NHAT` | `0.5` |  |
| `social.HAO_CAM_BAN` | `40` |  |
| `social.TI_LE_BIET_CA_BA` | `0.05` | Sư phụ sinh biết hai nghề: 25%; thêm 5% biết cả ba. |
| `social.TI_LE_BIET_HAI` | `0.3` |  |
| `social.NPC_MISHAP_DEATH` | `[0,0.005,0.005,0.004,0.003,0.002]` | Tử nạn mỗi nhịp theo cảnh giới hiện tại (chỉ số = cảnh giới; Phàm Nhân không có). Tăng: NPC chết bất đắc kỳ tử nhiều hơn. |
| `social.NPC_WOUND_CHANCE` | `0.04` | Trọng thương mỗi nhịp. Tăng: NPC hay bị thương, tu chậm. |
| `social.NPC_WOUND_YEARS` | `15` | Trọng thương kéo dài chừng này năm. |
| `social.NPC_WOUND_SPEED` | `0.5` | Đang trọng thương: tốc độ tu nhân hệ số này. Tăng: thương ít ảnh hưởng. |
| `social.NPC_FORTUNE_CHANCE` | `0.03` | Cơ duyên mỗi nhịp. Tăng: NPC hay gặp kỳ ngộ. |
| `social.NPC_FORTUNE_FRAC` | `0.5` | Cơ duyên cộng thêm phần này của tu vi cần cho tiểu cảnh giới hiện tại. |
| `social.NPC_BREAKTHROUGH_DEATH` | `[0,0,0,0.01,0.03,0.06]` | Đột phá đại cảnh giới trượt thì có tỉ lệ chết, theo cảnh giới đích (chỉ số = cảnh giới đích; Luyện Khí / Trúc Cơ không chết). Tăng: đột phá hiểm hơn. |
| `social.NPC_MOVE_CLOSER` | `{"tri_ky":0.15,"ket_nghia":0.15,"bang_huu":0.08}` | Bạn ở xa người chơi quá tầm đi lại: mỗi nhịp tỉ lệ dời chỗ đóng về gần, theo danh phận. Tăng: bạn bè dời về gần nhanh hơn. |
| `social.NPC_RELOCATE` | `0.05` | Tán tu khác: mỗi nhịp tỉ lệ đổi chỗ đóng sang nơi chốn khác cùng nước. |
| `social.NPC_TRIP_CHANCE` | `{"disciple":0.3,"senior":0.1,"consort":0.15,"friend":0.25,"drifter":0.35}` | Tỉ lệ mỗi nhịp người đang ở chỗ đóng khởi hành chuyến đi, theo vai. Tăng: người đó hay vắng nhà. |
| `social.NPC_TRIP_MIX` | `{"disciple":{"lich_luyen":6,"viec":4},"senior":{"lich_luyen":5,"viec":5},"consort":{"lich_luyen":5,"ve_que":5},"friend":{"lich_luyen":6,"ve_que":4},"drifter":{"lich_luyen":6,"viec":4}}` | Trọng số loại chuyến theo vai (`tham` không rút ngẫu nhiên). |
| `social.NPC_TRIP_BEATS` | `{"disciple":[1,2],"senior":[1,3],"consort":[1,1],"friend":[1,2],"drifter":[1,2]}` | Chuyến đi kéo dài từ chừng này tới chừng này nhịp, theo vai. Tăng: đi lâu hơn. |
| `social.NPC_TRIP_RANGE_SCALE` | `1` | Tầm đi lịch luyện = tầm đi lại của người chơi cùng cảnh giới × hệ số này. |
| `social.NPC_TRIP_RISK` | `2` | Đang lịch luyện: tử nạn, trọng thương, cơ duyên nhân hệ số này (ở chỗ đóng nhân `NPC_HOME_RISK`). Tăng: đi lịch luyện hiểm hơn. |
| `social.NPC_HOME_RISK` | `0.5` |  |
| `social.NHAN_MACH_FAR_LIFETIME` | `2` | Node `cho_ho` (người chơi tới chỗ họ) sống lâu gấp chừng này lần node thường. Tăng: lời mời chờ lâu hơn. |
| `social.INVITE_STAY_MIN_BEATS` | `1` | Phù Mời tới (gdd 43 §20): bạn tới rồi ở lại ít nhất chừng này nhịp. |
| `social.INVITE_STAY_MAX_BEATS` | `2` | Phù Mời tới: ở lại nhiều nhất chừng này nhịp (rút ngẫu nhiên giữa hai mốc). |
| `social.INVITE_MAX_YEARS` | `30` | Phù Mời tới: bạn ở xa hơn chừng này năm đường thì không nhận lời. Tăng: gọi được người ở xa hơn. |
| `social.NPC_LIFE_EVENT_YEARS` | `15` | Dịp đời (đột phá, trọng thương, cơ duyên, tử nạn) còn hiệu lực chừng này năm. |
| `social.NPC_LIFE_EVENT_BOOST` | `2` | Người có dịp đời còn hạn được xét trước và nhân tỉ lệ này. Tăng: chuyện theo dịp đời tới sớm hơn. |
| `social.NHAN_MACH_MAX_NODES` | `3` | Tối đa chừng này node nhân mạch cùng lúc trên bản đồ. |
| `social.NHAN_MACH_BEAT_CHANCE` | `0.5` | Mỗi nhịp, xác suất dịp nhân mạch được quay (một lần quay mỗi nhịp, gdd 43 §12.3). Tăng: chuyện nhân mạch dày hơn. |
| `social.NPC_PRUNE_YEARS` | `30` | Người chết chưa gặp, không chức vị, quá chừng này năm thì xóa khỏi save. |
| `social.NPC_LIVE_CAP` | `600` | Trần số NPC còn sống trong save: vượt thì bỏ người chưa gặp cũ nhất. |
| `social.NPC_DEAD_KEEP` | `60` | Người đã gặp chết giữ tối đa chừng này người gần nhất. |
| `social.NPC_FADE_YEARS` | `50` | Người quen thoáng qua (danh phận Quen biết, hảo cảm dưới `NPC_FADE_AFFINITY`, không ghim) quá chừng này năm không gặp thì phai khỏi Nhân mạch. |
| `social.NPC_FADE_AFFINITY` | `20` | Hảo cảm từ mức này trở lên (Có thiện cảm) thì không phai. |
| `social.NPC_LIFESPAN_BONUS_MAX` | `0.25` | Thọ cộng thêm tối đa (tỉ lệ thọ nguyên cảnh giới); mỗi người một hệ số băm cố định, lệch về thấp (bình phương). |
| `social.NPC_YOUTH_CHANCE_PER_REALM` | `0.15` | Tỉ lệ có định nhan tự nhiên, cộng mỗi đại cảnh giới từ Trúc Cơ (Trúc Cơ 15%, Kết Đan 30%…), trần 75%; tính cho nữ. |
| `social.NPC_YOUTH_MALE_FACTOR` | `0.5` | Nam có định nhan tự nhiên bằng chừng này lần tỉ lệ của nữ. |
| `social.GAN_NHAT` | `3` | Rút trong chừng này thế lực gần nơi gặp nhất, ưu tiên cùng nước. |
| `social.TI_LE_KHACH_XA` | `0.3` | Tỉ lệ người gặp là khách phương xa: thế lực rút ngẫu nhiên khắp thế giới thay vì gần nơi gặp (gdd 10 §10.1). |
| `social.TI_LE_DIP` | `{"quen_biet":0.2,"doi_thu":0.2,"bang_huu":0.3,"hiem_khich":0.15,"ke_thu":0.25,"tu_thu":0.4,"tri_ky":0.3,"ket_nghia":0.3,"dao_lu":0.3,"tinh_y":0.35,"su_phu":0.25,"chua_gap":0.15}` | Tỉ lệ mỗi nhịp một người có danh phận này tìm tới (gdd 10 §10.2). Tăng: người đó năng tìm tới hơn. |
| `social.HE_SO_KE_THU_TREN_BANG` | `1.5` | Người chơi có tên trên Thiên Kiêu Bảng: kẻ thù chú ý hơn (gdd 10 §3.1). |
| `social.HE_SO_KE_THU_BE_QUAN` | `1.5` | Đang bế quan: kẻ thù rình được lúc ngươi không đề phòng. |
| `social.GAP_XA` | `0.3333333333333333` | Nhân vật cố định chưa gặp: ở cùng nước mà ngoài tầm quê họ thì tỉ lệ gặp chỉ còn phần này. |
| `social.NHIP_NGHI` | `2` | Cách lần trước ít nhất từng này nhịp. |
| `social.EVENT_REPEAT_GAP` | `4` | Một chuyện nhân mạch (của bất kỳ ai) đã xảy ra thì từng này nhịp sau mới lặp lại. Tăng: ít lặp hơn, nhưng kho nhỏ thì thưa chuyện. |
| `social.TI_LE_THU_BAN` | `0.5` | Mỗi nhịp, mỗi bằng hữu có tỉ lệ này gửi thư báo một thế cục ở nước quê họ. |
| `social.NODE_LIFETIME_MIN` | `2` | Node chuyện của người đó chờ trên bản đồ từ chừng này tới chừng này nhịp thì hết hạn. |
| `social.NODE_LIFETIME_MAX` | `5` |  |
| `social.CHU_KY_BANG` | `5` | Bảng công bố mỗi chừng này năm. |
| `social.SO_TEN_BANG` | `20` | Số tên trên bảng. |
| `social.TUOI_THIEN_KIEU` | `100` | Thiên kiêu sinh: người phẩm chất thiên tài còn trẻ hơn chừng này tuổi. |
| `social.TI_LE_TOI_TRUOC` | `0.25` | Mỗi nhịp Ninh Tam Sinh có tỉ lệ này tới cơ duyên trước người chơi. |
| `social.REPUTATION_MIN` | `-100` | Danh vọng kẹp trong thang này (gdd 08 §8.1). |
| `social.REPUTATION_MAX` | `100` |  |
| `social.FADE_START_YEARS` | `60` | Vắng chừng này năm thì danh vọng thế lực bắt đầu phai (nhân hệ số nhớ của thế lực). |
| `social.FADE_STEP` | `5` | Sau đó mỗi 10 năm vắng danh vọng kéo về 0 chừng này điểm (chia hệ số nhớ). |
| `social.FADE_MEMORY` | `{"yeu_toc":2,"huyet_sat":1.5}` | Hệ số nhớ theo thế lực: lớn thì nhớ lâu hơn (mốc phai dài ra, phai chậm đi). Không ghi = 1. |
| `social.FEUD_FORGET_YEARS` | `150` | Vắng chừng này năm thì thù oán / truy nã của thế lực hết hiệu lực (kẻ thù cá nhân còn sống giữ như cũ). |
| `social.BOARD_DROP_YEARS` | `50` | Vắng chừng này năm thì rớt khỏi Thiên Kiêu Bảng. |
| `social.OLD_FAME_BONUS` | `2` | Tiếng tăm cũ: điểm xếp bảng cộng một lần ở kỳ đầu sau khi lên lại (1 điểm = 1 tiểu cảnh giới). |
| `social.REPUTATION_RANK` | `{"enemy":-60,"cold":-20,"friendly":20,"revered":60}` | Ngưỡng điểm của từng bậc danh vọng: ≤ `enemy` Tử thù, ≤ `cold` Lạnh nhạt, < `friendly` Trung lập, < `revered` Thân thiện, còn lại Tôn kính. |
| `social.GIA_THEO_BAC` | `{"tu_thu":1.5,"lanh_nhat":1.3,"trung_lap":1,"than_thien":0.9,"ton_kinh":0.8}` | Hệ số giá mua trong nước của thế lực theo bậc (gdd 08 §8.1). Tử thù: họ không bán, nội dung chặn; giá vẫn tính cao. Tăng: bậc đó mua đắt hơn. |
| `social.HE_SO_CONG` | `{"than_thien":0.5,"ton_kinh":0.25}` | Hệ số điểm cộng theo bậc đang đứng: càng được trọng càng khó lên thêm. |
| `social.CACH_NAM_LAP` | `1` | Việc lặp: cách tối thiểu (năm) giữa hai lần cộng cho cùng một thanh. |
| `social.SO_SU_PHU` | `2` | Mỗi tông có chừng này sư phụ còn sống. |
| `social.PHAT_ROI_MON` | `-30` | Rời sư môn không êm: hảo cảm sư phụ cộng (số âm) chừng này. |
| `social.MASTER_REALM_OFFSET_MIN` | `2` | Sư phụ sinh: đại cảnh giới = người chơi + từ `MIN` tới `MAX` bậc, kẹp trong [FLOOR, CEIL]. |
| `social.MASTER_REALM_OFFSET_MAX` | `3` |  |
| `social.MASTER_REALM_FLOOR` | `2` |  |
| `social.MASTER_REALM_CEIL` | `4` |  |
| `social.MASTER_MIN_AGE_RATIO` | `0.6` | Sư phụ không thể trẻ hơn chừng này phần thọ của cảnh giới liền dưới. |
| `social.GIFT_AFFINITY` | `[1,3,6,10,15]` | Hảo cảm khi tặng đồ theo độ chênh `d` = phẩm món − phẩm hợp cảnh giới người nhận, cột ứng với d ≤ −2, −1, 0, +1, ≥ +2. Tăng: quà dễ lấy lòng hơn. |
| `social.GIFT_LIKE_MULT` | `2` | Tặng đúng loại người đó ưa: nhân hảo cảm chừng này. |
| `social.GIFT_GREEDY_MULT` | `1.5` | Người tâm tính trọng lợi nhận quà: nhân hảo cảm chừng này. |
| `social.GIFT_AFFINITY_CAP` | `25` | Hảo cảm tối đa một lần tặng (sau khi nhân). |
| `social.ASK_AFFINITY_COST` | `1` | Hảo cảm trừ khi hỏi tin bạn (mất chút nhân tình). |
| `social.DAO_LU_GUARD_MULT` | `0.5` | Đạo lữ canh phủ: nhân tỉ lệ bị quấy khi bế quan ở phủ đó. Giảm: canh phủ hiệu quả hơn. |
| `social.DAO_LU_HOME_TRIP_MULT` | `0.5` | Đạo lữ ở phủ người chơi: nhân tỉ lệ đi chuyến. |
| `social.LOAN_GREEDY_MULT` | `1.2` | Bạn tâm tính trọng lợi cho mượn linh thạch thì đòi lời: số trả = số mượn × chừng này. |
| `social.ASK_TIER_REALMS` | `[0,2,4]` | Mốc cảnh giới của bậc tin khi hỏi tin qua người quen: Phàm Nhân / Luyện Khí bậc 0, Trúc Cơ / Kết Đan bậc 1, từ Nguyên Anh bậc 2 (gdd 10 §10.9.2). |
| `social.GIFT_VERY_HAPPY` | `10` | Quà nhận được hảo cảm từ chừng này thì "rất vui", từ mức dưới thì "vui", thấp hơn là "nhận cho phải phép" (chỉ là nhãn ở hộp tặng quà). |
| `social.GIFT_HAPPY` | `4` |  |
| `social.NPC_GEAR_MAX` | `4` | Số món pháp khí / công pháp tối đa một người nhận quà mang theo đánh (gdd 10 §10.9.1); quá số này giữ món phẩm cao nhất. |
| `social.DINH_NHAN_SAN_TANG` | `["dai_tong_mon","gia_toc"]` | Đạo lữ thuộc các tầng thế lực này có sẵn Định Nhan (gdd 43 §10b): đại tông môn, đại thế gia. |
| `social.DINH_NHAN_SAN_TUOI` | `28` | Tuổi chân dung của họ không quá mức này ("trẻ" của ảnh Nhân mạch, dưới 30). |
## stats

| Khóa | Giá trị | Ghi chú |
|---|---|---|
| `stats.STAT_CURVE_K` | `100` | Đường cong điểm tính: K * ln(1 + x / K). Gần tuyến tính lúc đầu, tăng chậm dần nhưng không trần. Tăng K: chỉ số cao ít bị nén hơn. |
| `stats.PHYSIQUE_HP_PER_POINT` | `0.01` | Căn cốt: khí huyết tối đa +% mỗi điểm. |
| `stats.PHYSIQUE_HEAL_PER_POINT` | `0.005` | Căn cốt: hồi khí huyết nhận được (đan, chiêu hồi) +% mỗi điểm. |
| `stats.AGILITY_TRAVEL_PER_POINT` | `0.003` | Thân pháp: thời gian đi đường chia (1 + hằng này × điểm). |
| `stats.SENSE_CONTROL_BASE` | `100` | Thần thức: uy lực khống chế nhân (BASE + thần thức bên khống chế) / (BASE + thần thức bên bị khống chế). |
| `stats.INSIGHT_SPEED_PER_POINT` | `0.01` | Ngộ tính: tốc độ tu luyện +% mỗi điểm. |
| `stats.INSIGHT_COMPREHEND_PER_POINT` | `0.02` | Ngộ tính: thời gian lĩnh ngộ công pháp chia (1 + hằng này × điểm). |
| `stats.LUCK_LOOT_DIV` | `300` | Khí vận: số lượt rút bảng rơi thêm kỳ vọng = điểm / hằng này (phần nguyên chắc chắn, phần lẻ là xác suất). |
| `stats.LUCK_FORAGE_DIV` | `400` | Khí vận: cộng tỉ lệ hái dược lên bậc = điểm / hằng này. |
| `stats.LUCK_MARKET_DIV` | `100` | Khí vận: tỉ lệ chí bảo phủ bụi ở chợ tạp nhân (1 + điểm / hằng này). |
| `stats.DAO_HEART_DEMON_DIV` | `200` | Đạo tâm: tâm ma nhận vào chia (1 + điểm / hằng này). |
| `stats.DAO_HEART_BREAKTHROUGH_PER_POINT` | `0.0015` | Đạo tâm: cộng tỉ lệ đột phá mỗi điểm tính (không trần, thay công thức bão hòa cũ). |
| `stats.DAO_HEART_KNEE` | `0.2` | Đạo tâm: ngưỡng cộng đột phá (tỉ lệ) từ đó bắt đầu nén dốc, dưới ngưỡng giữ như cũ (chống farm đạo tâm). |
| `stats.DAO_HEART_KNEE_SOFT` | `0.06` | Đạo tâm: độ nén phần vượt ngưỡng, T + S·ln(1 + vượt / S); nhỏ → dốc hơn, vẫn không trần. |
## travel

| Khóa | Giá trị | Ghi chú |
|---|---|---|
| `travel.REALM_TRAVEL_SPEED` | `[1,1,1.6,2.5,10,24]` | Tốc độ so với bộ hành, từ Phàm Nhân tới Hóa Thần. |
| `travel.TRAVEL_YEARS_PER_UNIT` | `0.0125` | Một năm bộ hành đi được khoảng 80 đơn vị thế giới. |
| `travel.TRAVEL_MIN_YEARS` | `0.02` | Chuyến ngắn vẫn cần thời gian thu xếp, lên đường (~1 tuần; trước 0,1 năm, chuyến sang chỗ bên cạnh cũng hơn tháng). |
| `travel.TRAVEL_LI_PER_UNIT` | `10` | Một đơn vị thế giới bằng mười dặm. |
| `travel.TRAVEL_REFERENCE_LI` | `1000` | Quãng chuẩn để so tốc độ trên bảng nhân vật. |
