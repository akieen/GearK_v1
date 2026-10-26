const { pool } = require('../config/db');
const { generateSku, successResponse, errorResponse } = require('../utils/helpers');

// Helper to safely format specifications for MySQL JSON column
function normalizeSpecifications(specifications) {
  if (specifications === undefined || specifications === null || specifications === '') {
    return null;
  }
  if (typeof specifications === 'object') {
    return JSON.stringify(specifications);
  }
  if (typeof specifications === 'string') {
    try {
      JSON.parse(specifications);
      return specifications;
    } catch (e) {
      return JSON.stringify({ 'Thông số': specifications });
    }
  }
  return null;
}

// [POST] /api/products/:id/variants (Admin / Staff)
async function addVariant(req, res, next) {
  try {
    const { id } = req.params;
    let { sku, variant_name, specifications, price, sale_price, stock = 0, warranty_months = 12, images = [] } = req.body;

    if (!variant_name || price === undefined) {
      return errorResponse(res, 'Vui lòng cung cấp tên phiên bản và giá bán', 400);
    }

    // Parse images if passed as string JSON
    if (typeof images === 'string') {
      try {
        images = JSON.parse(images);
      } catch (e) {
        images = [images];
      }
    }

    // If files uploaded via multer
    const uploadedFiles = req.files || (req.file ? [req.file] : []);
    const fileUrls = uploadedFiles.map((f) => `/uploads/${f.filename}`);
    const allImages = [...(Array.isArray(images) ? images : (images ? [images] : [])), ...fileUrls];

    let finalSku = (sku && typeof sku === 'string' && sku.trim()) ? sku.trim().toUpperCase() : null;
    if (!finalSku) {
      const [prodRows] = await pool.query('SELECT product_name FROM products WHERE product_id = ?', [id]);
      const prodName = prodRows.length > 0 ? prodRows[0].product_name : '';
      finalSku = generateSku(prodName, variant_name);
    }

    const specs = normalizeSpecifications(specifications);

    const [result] = await pool.query(
      `INSERT INTO product_variants (product_id, sku, variant_name, specifications, price, sale_price, stock, warranty_months)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, finalSku, variant_name, specs, price, sale_price || null, stock, warranty_months]
    );

    const variantId = result.insertId;

    // Insert variant images
    if (allImages.length > 0) {
      for (let i = 0; i < allImages.length; i++) {
        const img = allImages[i];
        const imgUrl = typeof img === 'string' ? img : img.image_url;
        if (!imgUrl) continue;
        const isPrimary = (typeof img === 'object' && img.is_primary) ? 1 : (i === 0 ? 1 : 0);
        await pool.query(
          `INSERT INTO variant_images (variant_id, image_url, is_primary, sort_order)
           VALUES (?, ?, ?, ?)`,
          [variantId, imgUrl, isPrimary, i]
        );
      }
    }

    // Fetch created variant with images
    const [createdImages] = await pool.query(
      'SELECT image_id, variant_id, image_url, is_primary, sort_order FROM variant_images WHERE variant_id = ? ORDER BY sort_order ASC',
      [variantId]
    );

    return successResponse(
      res,
      {
        variant_id: variantId,
        product_id: parseInt(id, 10),
        sku: finalSku,
        variant_name,
        price,
        sale_price,
        stock,
        warranty_months,
        images: createdImages,
      },
      'Thêm phiên bản sản phẩm thành công',
      201
    );
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return errorResponse(res, `Mã SKU đã tồn tại trên hệ thống. Vui lòng thử mã khác.`, 400);
    }
    next(error);
  }
}

// [PUT] /api/products/variants/:variantId (Admin / Staff)
async function updateVariant(req, res, next) {
  try {
    const { variantId } = req.params;
    const { sku, variant_name, specifications, price, sale_price, stock, warranty_months } = req.body;

    const [existing] = await pool.query('SELECT * FROM product_variants WHERE variant_id = ?', [variantId]);
    if (existing.length === 0) {
      return errorResponse(res, 'Phiên bản không tồn tại', 404);
    }

    const specs = specifications !== undefined
      ? normalizeSpecifications(specifications)
      : existing[0].specifications;

    await pool.query(
      `UPDATE product_variants SET
        sku = COALESCE(?, sku),
        variant_name = COALESCE(?, variant_name),
        specifications = ?,
        price = COALESCE(?, price),
        sale_price = ?,
        stock = COALESCE(?, stock),
        warranty_months = COALESCE(?, warranty_months)
       WHERE variant_id = ?`,
      [
        sku,
        variant_name,
        specs,
        price,
        sale_price !== undefined ? sale_price : existing[0].sale_price,
        stock,
        warranty_months,
        variantId
      ]
    );

    return successResponse(res, null, 'Cập nhật phiên bản thành công');
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return errorResponse(res, `Mã SKU đã tồn tại trên hệ thống.`, 400);
    }
    next(error);
  }
}

// [DELETE] /api/products/variants/:variantId (Admin only)
async function deleteVariant(req, res, next) {
  try {
    const { variantId } = req.params;
    const [result] = await pool.query('DELETE FROM product_variants WHERE variant_id = ?', [variantId]);
    if (result.affectedRows === 0) {
      return errorResponse(res, 'Phiên bản không tồn tại', 404);
    }
    return successResponse(res, null, 'Xóa phiên bản sản phẩm thành công');
  } catch (error) {
    next(error);
  }
}

// [GET] /api/products/variants/:variantId/images
async function getVariantImages(req, res, next) {
  try {
    const { variantId } = req.params;
    const [images] = await pool.query(
      `SELECT image_id, variant_id, image_url, is_primary, sort_order, created_at
       FROM variant_images
       WHERE variant_id = ?
       ORDER BY is_primary DESC, sort_order ASC, created_at ASC`,
      [variantId]
    );
    return successResponse(res, images, 'Danh sách ảnh của biến thể');
  } catch (error) {
    next(error);
  }
}

// [POST] /api/products/variants/:variantId/images (Admin / Staff)
async function addVariantImage(req, res, next) {
  try {
    const { variantId } = req.params;
    let imageUrl = req.body?.image_url;
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    } else if (req.files && req.files.length > 0) {
      imageUrl = `/uploads/${req.files[0].filename}`;
    }

    if (!imageUrl) {
      return errorResponse(res, 'Vui lòng cung cấp tệp ảnh hoặc URL ảnh', 400);
    }

    const [variantRows] = await pool.query('SELECT * FROM product_variants WHERE variant_id = ?', [variantId]);
    if (variantRows.length === 0) {
      return errorResponse(res, 'Biến thể không tồn tại', 404);
    }

    const [countRows] = await pool.query('SELECT COUNT(*) AS total FROM variant_images WHERE variant_id = ?', [variantId]);
    const isFirst = countRows[0].total === 0;
    const requestedPrimary = req.body?.is_primary === 'true' || req.body?.is_primary === true || req.body?.is_primary === 1 || isFirst;

    if (requestedPrimary) {
      await pool.query('UPDATE variant_images SET is_primary = 0 WHERE variant_id = ?', [variantId]);
    }

    const [insertResult] = await pool.query(
      `INSERT INTO variant_images (variant_id, image_url, is_primary, sort_order)
       VALUES (?, ?, ?, ?)`,
      [variantId, imageUrl, requestedPrimary ? 1 : 0, countRows[0].total]
    );

    return successResponse(
      res,
      {
        image_id: insertResult.insertId,
        variant_id: parseInt(variantId, 10),
        image_url: imageUrl,
        is_primary: requestedPrimary ? 1 : 0,
        sort_order: countRows[0].total,
      },
      'Thêm ảnh cho biến thể thành công',
      201
    );
  } catch (error) {
    next(error);
  }
}

// [DELETE] /api/products/variants/images/:imageId (Admin / Staff)
async function deleteVariantImage(req, res, next) {
  try {
    const { imageId } = req.params;
    const [existing] = await pool.query('SELECT * FROM variant_images WHERE image_id = ?', [imageId]);
    if (existing.length === 0) {
      return errorResponse(res, 'Ảnh biến thể không tồn tại', 404);
    }

    const variantId = existing[0].variant_id;
    const wasPrimary = existing[0].is_primary === 1;

    await pool.query('DELETE FROM variant_images WHERE image_id = ?', [imageId]);

    if (wasPrimary) {
      const [remaining] = await pool.query(
        'SELECT image_id FROM variant_images WHERE variant_id = ? ORDER BY sort_order ASC, image_id ASC LIMIT 1',
        [variantId]
      );
      if (remaining.length > 0) {
        await pool.query('UPDATE variant_images SET is_primary = 1 WHERE image_id = ?', [remaining[0].image_id]);
      }
    }

    return successResponse(res, null, 'Đã xóa ảnh biến thể');
  } catch (error) {
    next(error);
  }
}

// [PUT] /api/products/variants/images/:imageId/primary (Admin / Staff)
async function setPrimaryVariantImage(req, res, next) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const { imageId } = req.params;

    const [existing] = await connection.query('SELECT * FROM variant_images WHERE image_id = ?', [imageId]);
    if (existing.length === 0) {
      await connection.rollback();
      return errorResponse(res, 'Ảnh biến thể không tồn tại', 404);
    }

    const variantId = existing[0].variant_id;

    // Reset all variant images to non-primary
    await connection.query('UPDATE variant_images SET is_primary = 0 WHERE variant_id = ?', [variantId]);
    // Set this image as primary
    await connection.query('UPDATE variant_images SET is_primary = 1 WHERE image_id = ?', [imageId]);

    await connection.commit();
    return successResponse(res, null, 'Đã đặt ảnh làm ảnh chính cho biến thể');
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
}

module.exports = {
  normalizeSpecifications,
  addVariant,
  updateVariant,
  deleteVariant,
  getVariantImages,
  addVariantImage,
  deleteVariantImage,
  setPrimaryVariantImage,
};
