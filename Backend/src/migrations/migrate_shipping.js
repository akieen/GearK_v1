const { pool } = require('../config/db');

async function migrate() {
  try {
    console.log('Running shipping database migration...');

    // 1. addresses
    const [addrCols] = await pool.query('SHOW COLUMNS FROM addresses');
    const addrColNames = addrCols.map(c => c.Field);
    if (!addrColNames.includes('province_id')) {
      await pool.query('ALTER TABLE addresses ADD COLUMN province_id int unsigned NULL AFTER street_address');
      console.log('Added province_id to addresses');
    }
    if (!addrColNames.includes('district_id')) {
      await pool.query('ALTER TABLE addresses ADD COLUMN district_id int unsigned NULL AFTER province_id');
      console.log('Added district_id to addresses');
    }
    if (!addrColNames.includes('ward_code')) {
      await pool.query('ALTER TABLE addresses ADD COLUMN ward_code varchar(50) NULL AFTER district_id');
      console.log('Added ward_code to addresses');
    }

    // 2. product_variants
    const [varCols] = await pool.query('SHOW COLUMNS FROM product_variants');
    const varColNames = varCols.map(c => c.Field);
    if (!varColNames.includes('weight')) {
      await pool.query('ALTER TABLE product_variants ADD COLUMN weight int unsigned DEFAULT 500 AFTER stock');
      console.log('Added weight to product_variants');
    }

    // 3. orders
    const [ordCols] = await pool.query('SHOW COLUMNS FROM orders');
    const ordColNames = ordCols.map(c => c.Field);
    if (!ordColNames.includes('shipping_fee')) {
      await pool.query('ALTER TABLE orders ADD COLUMN shipping_fee decimal(15,2) DEFAULT 0.00 AFTER total_amount');
      console.log('Added shipping_fee to orders');
    }
    if (!ordColNames.includes('shipping_service_id')) {
      await pool.query('ALTER TABLE orders ADD COLUMN shipping_service_id int unsigned NULL AFTER shipping_fee');
      console.log('Added shipping_service_id to orders');
    }
    if (!ordColNames.includes('shipping_service_name')) {
      await pool.query('ALTER TABLE orders ADD COLUMN shipping_service_name varchar(100) NULL AFTER shipping_service_id');
      console.log('Added shipping_service_name to orders');
    }
    if (!ordColNames.includes('tracking_code')) {
      await pool.query('ALTER TABLE orders ADD COLUMN tracking_code varchar(100) NULL AFTER shipping_service_name');
      console.log('Added tracking_code to orders');
    }
    if (!ordColNames.includes('shipping_status')) {
      await pool.query('ALTER TABLE orders ADD COLUMN shipping_status varchar(50) NULL AFTER tracking_code');
      console.log('Added shipping_status to orders');
    }

    // 4. shipments table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS shipments (
        shipment_id bigint unsigned NOT NULL AUTO_INCREMENT,
        order_id bigint unsigned NOT NULL,
        tracking_code varchar(100) NOT NULL,
        provider varchar(50) NOT NULL DEFAULT 'GHN',
        service_id int unsigned DEFAULT NULL,
        service_name varchar(100) DEFAULT NULL,
        shipping_fee decimal(15,2) NOT NULL DEFAULT '0.00',
        cod_amount decimal(15,2) NOT NULL DEFAULT '0.00',
        insurance_value decimal(15,2) NOT NULL DEFAULT '0.00',
        status varchar(50) NOT NULL DEFAULT 'ready_to_pick',
        expected_delivery_at timestamp NULL DEFAULT NULL,
        raw_response longtext,
        created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (shipment_id),
        UNIQUE KEY uq_shipments_tracking (tracking_code),
        KEY idx_shipments_order (order_id),
        KEY idx_shipments_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('Checked/Created shipments table');

    // 5. shipment_histories table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS shipment_histories (
        history_id bigint unsigned NOT NULL AUTO_INCREMENT,
        shipment_id bigint unsigned NOT NULL,
        status varchar(50) NOT NULL,
        ghn_status varchar(50) DEFAULT NULL,
        location varchar(255) DEFAULT NULL,
        note text,
        created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (history_id),
        KEY idx_shipment_histories_shipment (shipment_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('Checked/Created shipment_histories table');

    // 6. shipping_webhook_logs table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS shipping_webhook_logs (
        log_id bigint unsigned NOT NULL AUTO_INCREMENT,
        provider varchar(50) NOT NULL DEFAULT 'GHN',
        order_code varchar(100) DEFAULT NULL,
        event_type varchar(100) DEFAULT NULL,
        payload longtext,
        status varchar(50) NOT NULL DEFAULT 'processed',
        created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (log_id),
        KEY idx_shipping_webhook_order (order_code)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('Checked/Created shipping_webhook_logs table');

    console.log('MIGRATION COMPLETED SUCCESSFULLY!');
    process.exit(0);
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  }
}

migrate();
