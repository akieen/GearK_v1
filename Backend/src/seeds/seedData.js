const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');

async function seed() {
  console.log('🌱 Đang khởi tạo dữ liệu mẫu cho database geark_db...');
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Kiểm tra nếu đã có dữ liệu
    const [existingUsers] = await connection.query('SELECT COUNT(*) AS count FROM users');
    if (existingUsers[0].count > 0) {
      console.log('ℹ️ Cơ sở dữ liệu đã có dữ liệu users. Bỏ qua thao tác seed để bảo vệ dữ liệu hiện tại.');
      await connection.rollback();
      return;
    }

    // 2. Tạo Users mẫu
    console.log('- Đang tạo tài khoản mẫu (Admin, Staff, Customer)...');
    const salt = await bcrypt.genSalt(10);
    const adminPass = await bcrypt.hash('admin123', salt);
    const staffPass = await bcrypt.hash('staff123', salt);
    const customerPass = await bcrypt.hash('customer123', salt);

    const [adminRes] = await connection.query(
      'INSERT INTO users (full_name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      ['Quản trị viên GearK', 'admin@geark.vn', adminPass, 'admin']
    );
    const adminId = adminRes.insertId;

    const [staffRes] = await connection.query(
      'INSERT INTO users (full_name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      ['Nhân viên Hỗ trợ GearK', 'staff@geark.vn', staffPass, 'staff']
    );

    const [customerRes] = await connection.query(
      'INSERT INTO users (full_name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      ['Nguyễn Văn Khách', 'customer@geark.vn', customerPass, 'customer']
    );
    const customerId = customerRes.insertId;

    // Giỏ hàng và Wishlist cho customer
    await connection.query('INSERT INTO carts (user_id) VALUES (?)', [customerId]);
    await connection.query('INSERT INTO wishlists (user_id) VALUES (?)', [customerId]);

    // Địa chỉ mẫu cho customer
    const [addrRes] = await connection.query(
      `INSERT INTO addresses (user_id, recipient_name, recipient_phone, street_address)
       VALUES (?, ?, ?, ?)`,
      [customerId, 'Nguyễn Văn Khách', '0987654321', 'Số 123 Đường Cầu Giấy, Phường Dịch Vọng, Quận Cầu Giấy, Hà Nội']
    );
    const addressId = addrRes.insertId;

    // 3. Tạo Brands mẫu
    console.log('- Đang tạo thương hiệu nổi tiếng (Razer, Logitech G, Corsair, SteelSeries, Asus ROG)...');
    const brands = [
      { name: 'Razer', slug: 'razer', logo: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=300&q=80' },
      { name: 'Logitech G', slug: 'logitech-g', logo: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=300&q=80' },
      { name: 'Corsair', slug: 'corsair', logo: 'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=300&q=80' },
      { name: 'SteelSeries', slug: 'steelseries', logo: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=300&q=80' },
      { name: 'Asus ROG', slug: 'asus-rog', logo: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=300&q=80' }
    ];

    const brandMap = {};
    for (const b of brands) {
      const [res] = await connection.query(
        'INSERT INTO brands (brand_name, slug, logo_url) VALUES (?, ?, ?)',
        [b.name, b.slug, b.logo]
      );
      brandMap[b.slug] = res.insertId;
    }

    // 4. Tạo Categories mẫu
    console.log('- Đang tạo danh mục Gaming Gear...');
    const categories = [
      { name: 'Bàn phím cơ Gaming', slug: 'ban-phim-co' },
      { name: 'Chuột Gaming', slug: 'chuot-gaming' },
      { name: 'Tai nghe Gaming', slug: 'tai-nghe-gaming' },
      { name: 'Màn hình Gaming', slug: 'man-hinh-gaming' }
    ];

    const catMap = {};
    for (const c of categories) {
      const [res] = await connection.query(
        'INSERT INTO categories (category_name, slug) VALUES (?, ?)',
        [c.name, c.slug]
      );
      catMap[c.slug] = res.insertId;
    }

    // 5. Tạo Sản phẩm & Variants
    console.log('- Đang tạo các sản phẩm & phiên bản chi tiết...');

    // SP 1: Razer Viper V3 Pro
    const [p1] = await connection.query(
      `INSERT INTO products (category_id, brand_id, product_name, slug, description, thumbnail_url, status)
       VALUES (?, ?, ?, ?, ?, ?, 'active')`,
      [
        catMap['chuot-gaming'],
        brandMap['razer'],
        'Chuột không dây Razer Viper V3 Pro',
        'razer-viper-v3-pro',
        'Chuột thể thao điện tử không dây siêu nhẹ 54g, cảm biến quang học Focus Pro Gen-2 35K DPI, công nghệ không dây HyperPolling 8000Hz đỉnh cao.',
        'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80'
      ]
    );
    const p1Id = p1.insertId;

    await connection.query(
      `INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order)
       VALUES (?, ?, ?, 1, 0)`,
      [p1Id, 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80', 'Razer Viper V3 Pro Black']
    );

    const [v1] = await connection.query(
      `INSERT INTO product_variants (product_id, sku, variant_name, specifications, price, sale_price, stock, warranty_months)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        p1Id,
        'RAZER-V3PRO-BLK',
        'Màu Đen (Black)',
        JSON.stringify({ color: 'Đen', weight: '54g', sensor: 'Focus Pro 35K', dpi: 35000, polling_rate: '8000Hz' }),
        4190000,
        3890000,
        25,
        24
      ]
    );

    await connection.query(
      `INSERT INTO product_variants (product_id, sku, variant_name, specifications, price, sale_price, stock, warranty_months)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        p1Id,
        'RAZER-V3PRO-WHT',
        'Màu Trắng (White)',
        JSON.stringify({ color: 'Trắng', weight: '54g', sensor: 'Focus Pro 35K', dpi: 35000, polling_rate: '8000Hz' }),
        4190000,
        3890000,
        18,
        24
      ]
    );

    // SP 2: Logitech G Pro X Superlight 2
    const [p2] = await connection.query(
      `INSERT INTO products (category_id, brand_id, product_name, slug, description, thumbnail_url, status)
       VALUES (?, ?, ?, ?, ?, ?, 'active')`,
      [
        catMap['chuot-gaming'],
        brandMap['logitech-g'],
        'Chuột không dây Logitech G Pro X Superlight 2 Lightspeed',
        'logitech-g-pro-x-superlight-2',
        'Biểu tượng eSports thế hệ mới với switch lai cơ học-quang học LIGHTFORCE, cảm biến HERO 2 độ chính xác sub-micron, thời lượng pin 95 giờ.',
        'https://images.unsplash.com/photo-1627856014955-490b3ff6383e?auto=format&fit=crop&w=800&q=80'
      ]
    );
    const p2Id = p2.insertId;

    await connection.query(
      `INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order)
       VALUES (?, ?, ?, 1, 0)`,
      [p2Id, 'https://images.unsplash.com/photo-1627856014955-490b3ff6383e?auto=format&fit=crop&w=800&q=80', 'Logitech G Pro X Superlight 2']
    );

    await connection.query(
      `INSERT INTO product_variants (product_id, sku, variant_name, specifications, price, sale_price, stock, warranty_months)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        p2Id,
        'LOGI-GPX2-BLK',
        'Màu Đen Nhám',
        JSON.stringify({ color: 'Đen', weight: '60g', sensor: 'HERO 2 32K', battery_life: '95 giờ' }),
        3690000,
        3390000,
        30,
        24
      ]
    );

    // SP 3: Corsair K70 MAX RGB Magnetic
    const [p3] = await connection.query(
      `INSERT INTO products (category_id, brand_id, product_name, slug, description, thumbnail_url, status)
       VALUES (?, ?, ?, ?, ?, ?, 'active')`,
      [
        catMap['ban-phim-co'],
        brandMap['corsair'],
        'Bàn phím cơ Corsair K70 MAX RGB Magnetic-Mechanical',
        'corsair-k70-max-rgb',
        'Trang bị Switch từ tính CORSAIR MGX cho phép tùy chỉnh hành trình nhận phím từ 0.4mm đến 3.6mm với tính năng Rapid Trigger siêu nhạy.',
        'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80'
      ]
    );
    const p3Id = p3.insertId;

    await connection.query(
      `INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order)
       VALUES (?, ?, ?, 1, 0)`,
      [p3Id, 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80', 'Corsair K70 MAX']
    );

    await connection.query(
      `INSERT INTO product_variants (product_id, sku, variant_name, specifications, price, sale_price, stock, warranty_months)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        p3Id,
        'CORSAIR-K70MAX',
        'Switch CORSAIR MGX Magnetic',
        JSON.stringify({ switch: 'CORSAIR MGX Từ Tính', actuation: '0.4mm - 3.6mm', rapid_trigger: 'Có', polling_rate: '8000Hz' }),
        5390000,
        4890000,
        15,
        24
      ]
    );

    // SP 4: Razer BlackShark V2 Pro
    const [p4] = await connection.query(
      `INSERT INTO products (category_id, brand_id, product_name, slug, description, thumbnail_url, status)
       VALUES (?, ?, ?, ?, ?, ?, 'active')`,
      [
        catMap['tai-nghe-gaming'],
        brandMap['razer'],
        'Tai nghe không dây Razer BlackShark V2 Pro (2023)',
        'razer-blackshark-v2-pro',
        'Tai nghe eSports chuẩn mực với mic HyperClear Super Wideband, driver TriForce Titanium 50mm, âm thanh không gian THX Spatial Audio.',
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80'
      ]
    );
    const p4Id = p4.insertId;

    await connection.query(
      `INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order)
       VALUES (?, ?, ?, 1, 0)`,
      [p4Id, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80', 'Razer BlackShark V2 Pro']
    );

    await connection.query(
      `INSERT INTO product_variants (product_id, sku, variant_name, specifications, price, sale_price, stock, warranty_months)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        p4Id,
        'RAZER-BSV2PRO-BLK',
        'Phiên bản Đen Không Dây',
        JSON.stringify({ driver: 'TriForce Titanium 50mm', battery_life: '70 giờ', audio: 'THX Spatial Audio' }),
        4990000,
        4490000,
        20,
        24
      ]
    );

    // SP 5: Asus ROG Swift OLED PG27AQDM
    const [p5] = await connection.query(
      `INSERT INTO products (category_id, brand_id, product_name, slug, description, thumbnail_url, status)
       VALUES (?, ?, ?, ?, ?, ?, 'active')`,
      [
        catMap['man-hinh-gaming'],
        brandMap['asus-rog'],
        'Màn hình Gaming Asus ROG Swift OLED PG27AQDM 27 inch 240Hz 0.03ms',
        'asus-rog-swift-oled-pg27aqdm',
        'Tấm nền OLED độ phân giải 2K QHD (2560x1440), tần số quét siêu mượt 240Hz, thời gian phản hồi 0.03ms GTG, tản nhiệt buồng hơi tùy chỉnh độc quyền.',
        'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80'
      ]
    );
    const p5Id = p5.insertId;

    await connection.query(
      `INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order)
       VALUES (?, ?, ?, 1, 0)`,
      [p5Id, 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80', 'Asus ROG Swift OLED']
    );

    await connection.query(
      `INSERT INTO product_variants (product_id, sku, variant_name, specifications, price, sale_price, stock, warranty_months)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        p5Id,
        'ASUS-PG27AQDM',
        'Bản Tiêu Chuẩn 240Hz OLED',
        JSON.stringify({ panel: 'OLED', resolution: '2560x1440 (2K)', refresh_rate: '240Hz', response_time: '0.03ms GTG' }),
        25990000,
        23990000,
        8,
        36
      ]
    );

    // 6. Tạo Coupons mẫu
    console.log('- Đang tạo các mã giảm giá mẫu...');
    await connection.query(
      `INSERT INTO coupons (coupon_code, discount_type, discount_value)
       VALUES ('GEARK10', 'percent', 10.00), ('WELCOME200K', 'fixed', 200000.00)`
    );

    // 7. Tạo Review mẫu cho Razer Viper V3 Pro
    console.log('- Đang tạo đánh giá mẫu...');
    await connection.query(
      `INSERT INTO reviews (user_id, product_id, rating, content)
       VALUES (?, ?, 5, 'Chuột siêu nhẹ, cầm cực đầm tay và sensor 35K bắn CS2 với Valorant rất chuẩn xác!')`,
      [customerId, p1Id]
    );

    await connection.commit();
    console.log('✅ Khởi tạo dữ liệu mẫu thành công 100%!');
    console.log('----------------------------------------------------');
    console.log('Tài khoản dùng thử:');
    console.log('👑 Admin: admin@geark.vn / admin123');
    console.log('👔 Staff: staff@geark.vn / staff123');
    console.log('🛒 Customer: customer@geark.vn / customer123');
    console.log('----------------------------------------------------');
  } catch (error) {
    await connection.rollback();
    console.error('❌ Lỗi khi seed dữ liệu:', error);
  } finally {
    connection.release();
    process.exit(0);
  }
}

seed();
