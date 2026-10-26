const { pool } = require('../config/db');
const { successResponse, errorResponse } = require('../utils/helpers');

// [GET] /api/inventory (Lấy danh sách kho hàng & tồn kho biến thể)
async function getInventory(req, res, next) {
  try {
    const {
      page = 1,
      limit = 20,
      search = '',
      category_id,
      low_stock,
      sort = 'newest',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)));
    const offset = (pageNum - 1) * limitNum;

    const whereConditions = [];
    const params = [];

    if (search && search.trim() !== '') {
      whereConditions.push('(p.product_name LIKE ? OR pv.sku LIKE ? OR pv.variant_name LIKE ?)');
      const keyword = `%${search.trim()}%`;
      params.push(keyword, keyword, keyword);
    }

    if (category_id) {
      whereConditions.push('p.category_id = ?');
      params.push(category_id);
    }

    if (low_stock === 'true') {
      whereConditions.push('pv.stock <= 5');
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Count total variants
    const countSql = `
      SELECT COUNT(*) AS total
      FROM product_variants pv
      JOIN products p ON pv.product_id = p.product_id
      ${whereClause}
    `;
    const [countResult] = await pool.query(countSql, params);
    const total = countResult[0].total;

    // Sorting
    let orderByClause = 'ORDER BY pv.variant_id DESC';
    if (sort === 'stock_asc') {
      orderByClause = 'ORDER BY pv.stock ASC';
    } else if (sort === 'stock_desc') {
      orderByClause = 'ORDER BY pv.stock DESC';
    } else if (sort === 'name_asc') {
      orderByClause = 'ORDER BY p.product_name ASC, pv.variant_name ASC';
    }

    // Main query
    const dataSql = `
      SELECT 
        pv.variant_id,
        pv.product_id,
        pv.sku,
        pv.variant_name,
        pv.price,
        pv.sale_price,
        pv.stock,
        pv.warranty_months,
        pv.created_at,
        pv.updated_at,
        p.product_name,
        p.slug AS product_slug,
        p.thumbnail_url,
        p.status AS product_status,
        c.category_name,
        b.brand_name
      FROM product_variants pv
      JOIN products p ON pv.product_id = p.product_id
      LEFT JOIN categories c ON p.category_id = c.category_id
      LEFT JOIN brands b ON p.brand_id = b.brand_id
      ${whereClause}
      ${orderByClause}
      LIMIT ? OFFSET ?
    `;

    const queryParams = [...params, limitNum, offset];
    const [variants] = await pool.query(dataSql, queryParams);

    // Fetch primary variant images
    const variantIds = variants.map((v) => v.variant_id);
    let variantImages = [];
    if (variantIds.length > 0) {
      const [vImgs] = await pool.query(
        `SELECT variant_id, image_url, is_primary FROM variant_images WHERE variant_id IN (?) ORDER BY is_primary DESC, sort_order ASC`,
        [variantIds]
      );
      variantImages = vImgs;
    }

    const dataWithImages = variants.map((v) => {
      const primaryVarImg = variantImages.find((img) => img.variant_id === v.variant_id);
      return {
        ...v,
        image_url: primaryVarImg ? primaryVarImg.image_url : v.thumbnail_url,
      };
    });

    // Summary statistics for KPIs
    const [statsResult] = await pool.query(`
      SELECT 
        COUNT(DISTINCT pv.variant_id) AS total_variants,
        COALESCE(SUM(pv.stock), 0) AS total_stock,
        SUM(CASE WHEN pv.stock <= 5 THEN 1 ELSE 0 END) AS low_stock_count,
        SUM(CASE WHEN pv.stock = 0 THEN 1 ELSE 0 END) AS out_of_stock_count
      FROM product_variants pv
      JOIN products p ON pv.product_id = p.product_id
      WHERE p.status != 'archived'
    `);

    const [txSummary] = await pool.query(`
      SELECT 
        COUNT(CASE WHEN quantity_delta > 0 THEN 1 END) AS total_imports,
        COUNT(CASE WHEN quantity_delta < 0 THEN 1 END) AS total_exports
      FROM inventory_transactions
    `);

    return successResponse(res, {
      items: dataWithImages,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
      summary: {
        total_variants: Number(statsResult[0].total_variants) || 0,
        total_stock: Number(statsResult[0].total_stock) || 0,
        low_stock_count: Number(statsResult[0].low_stock_count) || 0,
        out_of_stock_count: Number(statsResult[0].out_of_stock_count) || 0,
        total_imports: Number(txSummary[0].total_imports) || 0,
        total_exports: Number(txSummary[0].total_exports) || 0,
      },
    }, 'Danh sách kho hàng và tồn kho');
  } catch (error) {
    next(error);
  }
}

// [GET] /api/inventory/transactions (Lịch sử nhập / xuất kho)
async function getInventoryTransactions(req, res, next) {
  try {
    const {
      page = 1,
      limit = 20,
      variant_id,
      transaction_type,
      search = '',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)));
    const offset = (pageNum - 1) * limitNum;

    const whereConditions = [];
    const params = [];

    if (variant_id) {
      whereConditions.push('it.variant_id = ?');
      params.push(variant_id);
    }

    if (transaction_type && transaction_type !== 'all') {
      whereConditions.push('it.transaction_type = ?');
      params.push(transaction_type);
    }

    if (search && search.trim() !== '') {
      whereConditions.push('(p.product_name LIKE ? OR pv.sku LIKE ? OR pv.variant_name LIKE ? OR it.note LIKE ?)');
      const keyword = `%${search.trim()}%`;
      params.push(keyword, keyword, keyword, keyword);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const countSql = `
      SELECT COUNT(*) AS total
      FROM inventory_transactions it
      JOIN product_variants pv ON it.variant_id = pv.variant_id
      JOIN products p ON pv.product_id = p.product_id
      ${whereClause}
    `;
    const [countResult] = await pool.query(countSql, params);
    const total = countResult[0].total;

    const dataSql = `
      SELECT 
        it.inventory_transaction_id,
        it.variant_id,
        it.created_by,
        it.transaction_type,
        it.quantity_delta,
        it.stock_after,
        it.note,
        it.created_at,
        pv.sku,
        pv.variant_name,
        p.product_id,
        p.product_name,
        p.thumbnail_url,
        u.full_name AS created_by_name
      FROM inventory_transactions it
      JOIN product_variants pv ON it.variant_id = pv.variant_id
      JOIN products p ON pv.product_id = p.product_id
      LEFT JOIN users u ON it.created_by = u.user_id
      ${whereClause}
      ORDER BY it.created_at DESC, it.inventory_transaction_id DESC
      LIMIT ? OFFSET ?
    `;

    const queryParams = [...params, limitNum, offset];
    const [transactions] = await pool.query(dataSql, queryParams);

    return successResponse(res, {
      items: transactions,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    }, 'Lịch sử giao dịch nhập/xuất kho');
  } catch (error) {
    next(error);
  }
}

// [POST] /api/inventory/import (Nhập hàng vào kho)
async function importStock(req, res, next) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const {
      variant_id,
      quantity,
      unit_cost,
      supplier_id,
      note,
      transaction_type = 'purchase',
    } = req.body;

    const parsedQty = parseInt(quantity, 10);
    if (!variant_id || isNaN(parsedQty) || parsedQty <= 0) {
      await connection.rollback();
      return errorResponse(res, 'Vui lòng chọn biến thể và số lượng nhập lớn hơn 0', 400);
    }

    // Lock variant row for update
    const [variants] = await connection.query(
      `SELECT pv.*, p.product_name 
       FROM product_variants pv 
       JOIN products p ON pv.product_id = p.product_id 
       WHERE pv.variant_id = ? FOR UPDATE`,
      [variant_id]
    );

    if (variants.length === 0) {
      await connection.rollback();
      return errorResponse(res, 'Phiên bản sản phẩm không tồn tại', 404);
    }

    const currentStock = variants[0].stock;
    const newStock = currentStock + parsedQty;
    const userId = req.user?.user_id || null;

    // 1. Update stock
    await connection.query(
      'UPDATE product_variants SET stock = ? WHERE variant_id = ?',
      [newStock, variant_id]
    );

    // 2. Insert inventory transaction
    const finalNote = note?.trim() || `Nhập kho ${parsedQty} sản phẩm`;
    const [txResult] = await connection.query(
      `INSERT INTO inventory_transactions (variant_id, created_by, transaction_type, quantity_delta, stock_after, note)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [variant_id, userId, transaction_type, parsedQty, newStock, finalNote]
    );

    // 3. Optional: Create purchase order if supplier provided
    let purchaseOrderId = null;
    if (supplier_id) {
      const parsedCost = parseFloat(unit_cost) || 0;
      const subtotal = parsedQty * parsedCost;
      const pCode = `PO-${Date.now().toString().slice(-6)}`;

      const [poResult] = await connection.query(
        `INSERT INTO purchase_orders (supplier_id, created_by, purchase_code, status, subtotal)
         VALUES (?, ?, ?, 'received', ?)`,
        [supplier_id, userId, pCode, subtotal]
      );
      purchaseOrderId = poResult.insertId;

      await connection.query(
        `INSERT INTO purchase_order_items (purchase_order_id, variant_id, quantity_ordered, quantity_received, unit_cost)
         VALUES (?, ?, ?, ?, ?)`,
        [purchaseOrderId, variant_id, parsedQty, parsedQty, parsedCost]
      );
    }

    await connection.commit();

    return successResponse(
      res,
      {
        transaction_id: txResult.insertId,
        variant_id,
        product_name: variants[0].product_name,
        variant_name: variants[0].variant_name,
        sku: variants[0].sku,
        quantity_imported: parsedQty,
        stock_before: currentStock,
        stock_after: newStock,
        purchase_order_id: purchaseOrderId,
      },
      `Nhập kho thành công ${parsedQty} sản phẩm! Tồn kho mới: ${newStock}`,
      201
    );
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
}

// [POST] /api/inventory/export (Xuất kho / Xuất thêm)
async function exportStock(req, res, next) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const {
      variant_id,
      quantity,
      transaction_type = 'adjustment',
      reason,
      note,
    } = req.body;

    const parsedQty = parseInt(quantity, 10);
    if (!variant_id || isNaN(parsedQty) || parsedQty <= 0) {
      await connection.rollback();
      return errorResponse(res, 'Vui lòng chọn biến thể và số lượng xuất lớn hơn 0', 400);
    }

    // Allowed export types: adjustment (kiểm kê/điều chuyển/xuất khác), damage (hỏng/vỡ), sale (bán lẻ trực tiếp)
    const validTypes = ['adjustment', 'damage', 'sale'];
    const finalType = validTypes.includes(transaction_type) ? transaction_type : 'adjustment';

    // Lock variant row
    const [variants] = await connection.query(
      `SELECT pv.*, p.product_name 
       FROM product_variants pv 
       JOIN products p ON pv.product_id = p.product_id 
       WHERE pv.variant_id = ? FOR UPDATE`,
      [variant_id]
    );

    if (variants.length === 0) {
      await connection.rollback();
      return errorResponse(res, 'Phiên bản sản phẩm không tồn tại', 404);
    }

    const currentStock = variants[0].stock;
    if (currentStock < parsedQty) {
      await connection.rollback();
      return errorResponse(
        res,
        `Số lượng xuất (${parsedQty}) vượt quá tồn kho hiện tại (chỉ còn ${currentStock} sản phẩm)`,
        400
      );
    }

    const newStock = currentStock - parsedQty;
    const userId = req.user?.user_id || null;

    // 1. Update stock
    await connection.query(
      'UPDATE product_variants SET stock = ? WHERE variant_id = ?',
      [newStock, variant_id]
    );

    // 2. Insert transaction with negative delta
    const reasonText = reason || note || 'Xuất kho điều chỉnh';
    const finalNote = `Xuất ${parsedQty} sản phẩm: ${reasonText}`;
    const [txResult] = await connection.query(
      `INSERT INTO inventory_transactions (variant_id, created_by, transaction_type, quantity_delta, stock_after, note)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [variant_id, userId, finalType, -parsedQty, newStock, finalNote]
    );

    await connection.commit();

    return successResponse(
      res,
      {
        transaction_id: txResult.insertId,
        variant_id,
        product_name: variants[0].product_name,
        variant_name: variants[0].variant_name,
        sku: variants[0].sku,
        quantity_exported: parsedQty,
        stock_before: currentStock,
        stock_after: newStock,
        transaction_type: finalType,
      },
      `Xuất kho thành công ${parsedQty} sản phẩm! Tồn kho còn lại: ${newStock}`,
      201
    );
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
}

// [GET] /api/inventory/suppliers (Danh sách nhà cung cấp)
async function getSuppliers(req, res, next) {
  try {
    const [suppliers] = await pool.query('SELECT * FROM suppliers ORDER BY supplier_name ASC');
    return successResponse(res, suppliers, 'Danh sách nhà cung cấp');
  } catch (error) {
    next(error);
  }
}

// [POST] /api/inventory/suppliers (Thêm nhà cung cấp mới)
async function createSupplier(req, res, next) {
  try {
    const { supplier_name, phone, email } = req.body;
    if (!supplier_name || !supplier_name.trim()) {
      return errorResponse(res, 'Vui lòng nhập tên nhà cung cấp', 400);
    }

    const [result] = await pool.query(
      'INSERT INTO suppliers (supplier_name, phone, email) VALUES (?, ?, ?)',
      [supplier_name.trim(), phone?.trim() || null, email?.trim() || null]
    );

    return successResponse(
      res,
      {
        supplier_id: result.insertId,
        supplier_name: supplier_name.trim(),
        phone,
        email,
      },
      'Thêm nhà cung cấp thành công',
      201
    );
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getInventory,
  getInventoryTransactions,
  importStock,
  exportStock,
  getSuppliers,
  createSupplier,
};
