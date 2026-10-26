const { pool } = require('../config/db');
const { slugify, generateSku, successResponse, errorResponse } = require('../utils/helpers');

// [GET] /api/products
async function getProducts(req, res, next) {
  try {
    const {
      page = 1,
      limit = 12,
      category_id,
      category_slug,
      brand_id,
      brand_slug,
      search,
      min_price,
      max_price,
      status = 'active',
      sort = 'newest'
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)));
    const offset = (pageNum - 1) * limitNum;

    const whereConditions = [];
    const params = [];

    // Filter by status (admin can pass status=all)
    if (status !== 'all') {
      whereConditions.push('p.status = ?');
      params.push(status);
    }

    // Filter by category
    if (category_id) {
      whereConditions.push('p.category_id = ?');
      params.push(category_id);
    } else if (category_slug) {
      whereConditions.push('c.slug = ?');
      params.push(category_slug);
    }

    // Filter by brand
    if (brand_id) {
      whereConditions.push('p.brand_id = ?');
      params.push(brand_id);
    } else if (brand_slug) {
      whereConditions.push('b.slug = ?');
      params.push(brand_slug);
    }

    // Keyword search
    if (search && search.trim() !== '') {
      whereConditions.push('(p.product_name LIKE ? OR p.description LIKE ?)');
      const keyword = `%${search.trim()}%`;
      params.push(keyword, keyword);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Count total products
    const countSql = `
      SELECT COUNT(DISTINCT p.product_id) AS total
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.category_id
      LEFT JOIN brands b ON p.brand_id = b.brand_id
      ${whereClause}
    `;
    const [countResult] = await pool.query(countSql, params);
    const total = countResult[0].total;

    // Sorting logic
    let orderByClause = 'ORDER BY p.created_at DESC';
    if (sort === 'price_asc') {
      orderByClause = 'ORDER BY min_price ASC';
    } else if (sort === 'price_desc') {
      orderByClause = 'ORDER BY min_price DESC';
    } else if (sort === 'name_asc') {
      orderByClause = 'ORDER BY p.product_name ASC';
    } else if (sort === 'rating') {
      orderByClause = 'ORDER BY avg_rating DESC';
    }

    // Main query with variant price & stock aggregation
    const dataSql = `
      SELECT 
        p.product_id,
        p.product_name,
        p.slug,
        p.description,
        p.thumbnail_url,
        p.status,
        p.created_at,
        p.updated_at,
        c.category_id,
        c.category_name,
        c.slug AS category_slug,
        b.brand_id,
        b.brand_name,
        b.slug AS brand_slug,
        MIN(v.price) AS min_price,
        MAX(v.price) AS max_price,
        MIN(v.sale_price) AS min_sale_price,
        COALESCE(SUM(v.stock), 0) AS total_stock,
        COUNT(DISTINCT v.variant_id) AS variant_count,
        COALESCE(ROUND(AVG(r.rating), 1), 0) AS avg_rating,
        COUNT(DISTINCT r.review_id) AS review_count
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.category_id
      LEFT JOIN brands b ON p.brand_id = b.brand_id
      LEFT JOIN product_variants v ON p.product_id = v.product_id
      LEFT JOIN reviews r ON p.product_id = r.product_id
      ${whereClause}
      GROUP BY p.product_id
      ${min_price ? `HAVING min_price >= ${Number(min_price)}` : ''}
      ${max_price ? `${min_price ? 'AND' : 'HAVING'} min_price <= ${Number(max_price)}` : ''}
      ${orderByClause}
      LIMIT ? OFFSET ?
    `;

    const [rows] = await pool.query(dataSql, [...params, limitNum, offset]);

    return successResponse(res, {
      items: rows,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    }, 'Lấy danh sách sản phẩm thành công');
  } catch (error) {
    next(error);
  }
}

// [GET] /api/products/:slug
async function getProductBySlug(req, res, next) {
  try {
    const { slug } = req.params;

    // Fetch product
    const [products] = await pool.query(`
      SELECT 
        p.*,
        c.category_name,
        c.slug AS category_slug,
        b.brand_name,
        b.slug AS brand_slug,
        b.logo_url AS brand_logo,
        COALESCE(ROUND(AVG(r.rating), 1), 0) AS avg_rating,
        COUNT(DISTINCT r.review_id) AS review_count
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.category_id
      LEFT JOIN brands b ON p.brand_id = b.brand_id
      LEFT JOIN reviews r ON p.product_id = r.product_id
      WHERE p.slug = ?
      GROUP BY p.product_id
      LIMIT 1
    `, [slug]);

    if (products.length === 0) {
      return errorResponse(res, 'Không tìm thấy sản phẩm', 404);
    }

    const product = products[0];

    // Fetch product variants
    const [variants] = await pool.query(`
      SELECT 
        v.*
      FROM product_variants v
      WHERE v.product_id = ?
      ORDER BY v.price ASC
    `, [product.product_id]);

    // Parse specifications JSON if string
    const parsedVariants = variants.map(v => {
      let specs = v.specifications;
      if (typeof specs === 'string') {
        try {
          specs = JSON.parse(specs);
        } catch (e) {
          specs = null;
        }
      }
      return {
        ...v,
        specifications: specs
      };
    });

    // Fetch product images
    const [images] = await pool.query(`
      SELECT image_id, image_url, alt_text, is_primary, sort_order
      FROM product_images
      WHERE product_id = ?
      ORDER BY is_primary DESC, sort_order ASC
    `, [product.product_id]);

    // Fetch variant images if any
    const variantIds = parsedVariants.map(v => v.variant_id);
    let variantImages = [];
    if (variantIds.length > 0) {
      const [vImages] = await pool.query(`
        SELECT image_id, variant_id, image_url, is_primary, sort_order
        FROM variant_images
        WHERE variant_id IN (?)
        ORDER BY sort_order ASC
      `, [variantIds]);
      variantImages = vImages;
    }

    // Attach variant images to corresponding variants
    const variantsWithImages = parsedVariants.map(v => ({
      ...v,
      images: variantImages.filter(img => img.variant_id === v.variant_id)
    }));

    return successResponse(res, {
      ...product,
      images,
      variants: variantsWithImages
    }, 'Chi tiết sản phẩm');
  } catch (error) {
    next(error);
  }
}

// [GET] /api/products/id/:id
async function getProductById(req, res, next) {
  try {
    const { id } = req.params;

    const [products] = await pool.query('SELECT slug FROM products WHERE product_id = ? LIMIT 1', [id]);
    if (products.length === 0) {
      return errorResponse(res, 'Không tìm thấy sản phẩm', 404);
    }

    req.params.slug = products[0].slug;
    return getProductBySlug(req, res, next);
  } catch (error) {
    next(error);
  }
}

// [POST] /api/products (Admin only)
async function createProduct(req, res, next) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const {
      product_name,
      slug,
      category_id,
      brand_id,
      description,
      thumbnail_url,
      status = 'draft',
      variants = [],
      images = []
    } = req.body;

    if (!product_name || !category_id) {
      return errorResponse(res, 'Vui lòng cung cấp tên sản phẩm và danh mục', 400);
    }

    const finalSlug = slug ? slugify(slug) : slugify(product_name);

    // Insert product
    const [prodResult] = await connection.query(
      `INSERT INTO products (product_name, slug, category_id, brand_id, description, thumbnail_url, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [product_name, finalSlug, category_id, brand_id || null, description || null, thumbnail_url || null, status]
    );

    const productId = prodResult.insertId;

    // Insert variants
    if (Array.isArray(variants) && variants.length > 0) {
      for (const v of variants) {
        const sku = (v.sku && typeof v.sku === 'string' && v.sku.trim())
          ? v.sku.trim().toUpperCase()
          : generateSku(product_name, v.variant_name);
        const specs = v.specifications ? JSON.stringify(v.specifications) : null;
        const [varRes] = await connection.query(
          `INSERT INTO product_variants 
            (product_id, sku, variant_name, specifications, price, sale_price, stock, warranty_months)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            productId,
            sku,
            v.variant_name || product_name,
            specs,
            v.price || 0,
            v.sale_price || null,
            v.stock || 0,
            v.warranty_months || 12
          ]
        );
        const variantId = varRes.insertId;

        // Insert variant images
        if (Array.isArray(v.images) && v.images.length > 0) {
          for (let i = 0; i < v.images.length; i++) {
            const img = v.images[i];
            const imgUrl = typeof img === 'string' ? img : img.image_url;
            if (!imgUrl) continue;
            const isPrimary = (typeof img === 'object' && img.is_primary) ? 1 : (i === 0 ? 1 : 0);
            await connection.query(
              `INSERT INTO variant_images (variant_id, image_url, is_primary, sort_order)
               VALUES (?, ?, ?, ?)`,
              [variantId, imgUrl, isPrimary, i]
            );
          }
        }
      }
    } else {
      // Create a default variant if none provided
      const defaultSku = generateSku(product_name, 'Tiêu chuẩn');
      const [defRes] = await connection.query(
        `INSERT INTO product_variants 
          (product_id, sku, variant_name, price, stock, warranty_months)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [productId, defaultSku, 'Tiêu chuẩn', 0, 0, 12]
      );
      if (thumbnail_url) {
        await connection.query(
          `INSERT INTO variant_images (variant_id, image_url, is_primary, sort_order)
           VALUES (?, ?, 1, 0)`,
          [defRes.insertId, thumbnail_url]
        );
      }
    }

    // Insert product images
    if (Array.isArray(images) && images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        const imgUrl = typeof img === 'string' ? img : img.image_url;
        const isPrimary = (typeof img === 'object' && img.is_primary) ? 1 : (i === 0 ? 1 : 0);
        const altText = (typeof img === 'object' && img.alt_text) ? img.alt_text : product_name;
        await connection.query(
          `INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order)
           VALUES (?, ?, ?, ?, ?)`,
          [productId, imgUrl, altText, isPrimary, i]
        );
      }
    }

    await connection.commit();

    return successResponse(
      res,
      {
        product_id: productId,
        product_name,
        slug: finalSlug
      },
      'Thêm sản phẩm mới thành công',
      201
    );
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
}

// [PUT] /api/products/:id (Admin only)
async function updateProduct(req, res, next) {
  try {
    const { id } = req.params;
    const {
      product_name,
      slug,
      category_id,
      brand_id,
      description,
      thumbnail_url,
      status
    } = req.body;

    const [existing] = await pool.query('SELECT * FROM products WHERE product_id = ?', [id]);
    if (existing.length === 0) {
      return errorResponse(res, 'Sản phẩm không tồn tại', 404);
    }

    const newSlug = slug ? slugify(slug) : (product_name ? slugify(product_name) : existing[0].slug);

    await pool.query(
      `UPDATE products SET 
        product_name = COALESCE(?, product_name),
        slug = ?,
        category_id = COALESCE(?, category_id),
        brand_id = ?,
        description = COALESCE(?, description),
        thumbnail_url = COALESCE(?, thumbnail_url),
        status = COALESCE(?, status)
       WHERE product_id = ?`,
      [
        product_name,
        newSlug,
        category_id,
        brand_id !== undefined ? brand_id : existing[0].brand_id,
        description,
        thumbnail_url,
        status,
        id
      ]
    );

    return successResponse(res, null, 'Cập nhật sản phẩm thành công');
  } catch (error) {
    next(error);
  }
}

// [DELETE] /api/products/:id (Admin only)
async function deleteProduct(req, res, next) {
  try {
    const { id } = req.params;
    const { hardDelete } = req.query;

    if (hardDelete === 'true') {
      const [result] = await pool.query('DELETE FROM products WHERE product_id = ?', [id]);
      if (result.affectedRows === 0) {
        return errorResponse(res, 'Sản phẩm không tồn tại', 404);
      }
      return successResponse(res, null, 'Đã xóa vĩnh viễn sản phẩm');
    }

    // Soft delete / archive
    await pool.query("UPDATE products SET status = 'archived' WHERE product_id = ?", [id]);
    return successResponse(res, null, 'Đã chuyển sản phẩm vào kho lưu trữ (archived)');
  } catch (error) {
    next(error);
  }
}

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
// Product Variant logic is separated into variantController.js
const variantController = require('./variantController');


// ============================================
// PRODUCT IMAGES MANAGEMENT
// ============================================

// [GET] /api/products/:id/images
async function getProductImages(req, res, next) {
  try {
    const { id } = req.params;
    const [images] = await pool.query(
      `SELECT image_id, product_id, image_url, alt_text, is_primary, sort_order, created_at
       FROM product_images
       WHERE product_id = ?
       ORDER BY is_primary DESC, sort_order ASC, created_at ASC`,
      [id]
    );
    return successResponse(res, images, 'Danh sách ảnh sản phẩm');
  } catch (error) {
    next(error);
  }
}

// [POST] /api/products/:id/images (Admin only, file upload or URL)
async function addProductImage(req, res, next) {
  try {
    const { id } = req.params;
    let imageUrl = req.body?.image_url;
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    } else if (req.files && req.files.length > 0) {
      imageUrl = `/uploads/${req.files[0].filename}`;
    }

    if (!imageUrl) {
      return errorResponse(res, 'Vui lòng cung cấp tệp ảnh hoặc URL ảnh', 400);
    }

    const [productRows] = await pool.query('SELECT product_name, thumbnail_url FROM products WHERE product_id = ?', [id]);
    if (productRows.length === 0) {
      return errorResponse(res, 'Sản phẩm không tồn tại', 404);
    }

    const [countRows] = await pool.query('SELECT COUNT(*) AS total FROM product_images WHERE product_id = ?', [id]);
    const isFirst = countRows[0].total === 0;
    const requestedPrimary = req.body?.is_primary === 'true' || req.body?.is_primary === true || req.body?.is_primary === 1 || isFirst;

    if (requestedPrimary) {
      await pool.query('UPDATE product_images SET is_primary = 0 WHERE product_id = ?', [id]);
      await pool.query('UPDATE products SET thumbnail_url = ? WHERE product_id = ?', [imageUrl, id]);
    }

    const altText = req.body?.alt_text || productRows[0].product_name;

    const [insertResult] = await pool.query(
      `INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order)
       VALUES (?, ?, ?, ?, ?)`,
      [id, imageUrl, altText, requestedPrimary ? 1 : 0, countRows[0].total]
    );

    return successResponse(
      res,
      {
        image_id: insertResult.insertId,
        product_id: parseInt(id, 10),
        image_url: imageUrl,
        alt_text: altText,
        is_primary: requestedPrimary ? 1 : 0,
        sort_order: countRows[0].total,
      },
      'Thêm ảnh sản phẩm thành công',
      201
    );
  } catch (error) {
    next(error);
  }
}

// [DELETE] /api/products/images/:imageId (Admin only)
async function deleteProductImage(req, res, next) {
  try {
    const { imageId } = req.params;
    const [existing] = await pool.query('SELECT * FROM product_images WHERE image_id = ?', [imageId]);
    if (existing.length === 0) {
      return errorResponse(res, 'Ảnh sản phẩm không tồn tại', 404);
    }

    const productId = existing[0].product_id;
    const wasPrimary = existing[0].is_primary === 1;

    await pool.query('DELETE FROM product_images WHERE image_id = ?', [imageId]);

    if (wasPrimary) {
      const [remaining] = await pool.query(
        'SELECT image_id, image_url FROM product_images WHERE product_id = ? ORDER BY sort_order ASC, image_id ASC LIMIT 1',
        [productId]
      );
      if (remaining.length > 0) {
        await pool.query('UPDATE product_images SET is_primary = 1 WHERE image_id = ?', [remaining[0].image_id]);
        await pool.query('UPDATE products SET thumbnail_url = ? WHERE product_id = ?', [remaining[0].image_url, productId]);
      }
    }

    return successResponse(res, null, 'Đã xóa ảnh sản phẩm');
  } catch (error) {
    next(error);
  }
}

// [PUT] /api/products/images/:imageId/primary (Admin only)
async function setPrimaryProductImage(req, res, next) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const { imageId } = req.params;

    const [existing] = await connection.query('SELECT * FROM product_images WHERE image_id = ?', [imageId]);
    if (existing.length === 0) {
      await connection.rollback();
      return errorResponse(res, 'Ảnh không tồn tại', 404);
    }

    const productId = existing[0].product_id;
    const imageUrl = existing[0].image_url;

    // Reset all product images to non-primary
    await connection.query('UPDATE product_images SET is_primary = 0 WHERE product_id = ?', [productId]);
    // Set this image as primary
    await connection.query('UPDATE product_images SET is_primary = 1 WHERE image_id = ?', [imageId]);
    // Update thumbnail_url in products
    await connection.query('UPDATE products SET thumbnail_url = ? WHERE product_id = ?', [imageUrl, productId]);

    await connection.commit();
    return successResponse(res, null, 'Đã đặt làm ảnh chính sản phẩm');
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
}

module.exports = {
  getProducts,
  getProductBySlug,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  ...variantController,
  getProductImages,
  addProductImage,
  deleteProductImage,
  setPrimaryProductImage,
};
