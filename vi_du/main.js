// Mới làm mod: đọc huong-dan.md cạnh gói này trước; hàm / sự kiện / móc tra ở tai-lieu-api.md.
// File này chỉ cần khi mod muốn đổi công thức, thêm giao diện hoặc nghe biến cố trong game; chỉ thêm nội dung thì xóa file và dòng `script:` ở mod.yaml.
// Điểm vào JS của gói (tùy). Nạp trước pha boot; import được file khác trong gói (./lib/x.js) khi đã cài trong game.
// Phần dữ liệu (content/, patch, balance, img/) game tự nạp từ mod.yaml, ở đây chỉ làm việc cần code.
(window.tuTienMods ??= []).push({
  id: 'vi_du', // trùng id trong mod.yaml: game gộp boot / ready dưới đây vào cùng mod
  boot(tt, mod) {
    // Pha boot: móc, modifier, hiệu ứng / điều kiện mới, hành động. Vd. linh thạch rơi thêm 10%:
    // mod.modify('dropChance', (input) => input.value * 1.1);
    mod.log('boot, tùy chọn:', mod.options);
  },
  ready(tt, mod) {
    if (mod.options.chao) tt.ui.toast('Mod Mẫu đã nạp');
    tt.on('combatEnd', (e) => mod.log('xong trận', e));
    // Ô nhỏ trong nút nổi "Mod" (góc dưới phải); người chơi ghim ra ngoài được
    const o = mod.ui.addDock({
      id: 'linh_thach',
      title: 'Linh thạch',
      mount(el, tt) {
        const draw = () => (el.textContent = `${tt.state().run?.nhanVat.linhThach ?? '-'} linh thạch`);
        draw();
        return tt.subscribe(draw); // hàm hủy theo dõi = hàm dọn
      },
    });
    tt.subscribe((s) => o.setValue(String(s.run?.nhanVat.linhThach ?? '')));

    // Bốn chỗ cắm sẵn của HUD (để thử một lượt)
    mod.ui.addSlot('characterTab', {
      id: 'thong_ke',
      title: 'Thống kê',
      mount(el, tt) {
        const draw = () => (el.textContent = `Tuổi ${tt.state().run?.nhanVat.tuoi ?? '-'}, linh thạch ${tt.state().run?.nhanVat.linhThach ?? '-'}`);
        draw();
        return tt.subscribe(draw);
      },
    });
    mod.ui.addSlot('itemTooltip', { id: 'id_vat', mount: (el, tt, itemId) => (el.textContent = `Mod Mẫu: ${itemId}`) });
    mod.ui.addSlot('placeInfo', { id: 'ghi', title: 'Ghi chú Mod Mẫu', mount: (el) => (el.textContent = 'Khối này do mod thêm vào khung nơi chốn.') });
    mod.ui.addSlot('mapLayer', {
      id: 'cham',
      mount(layer, tt) {
        // Chấm đỏ ở góc trên trái bản đồ (tọa độ thế giới)
        const g = new tt.pixi.Graphics();
        g.circle(60, 60, 24).fill(0xff3030);
        layer.addChild(g);
        tt.map.requestRender();
        return () => g.destroy();
      },
    });
  },
});
