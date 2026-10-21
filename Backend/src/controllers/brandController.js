const { pool } = require('../config/db');
const { slugify, successResponse, errorResponse } = require('../utils/helpers');

// [GET] /api/brands
async function getBrands(req, res, next) {
  try {
    const [brands] = await pool.query(`
      SELECT 
        b.brand_id,
        b.brand_name,
        b.slug,
        b.logo_url,
        b.created_at,
        b.updated_at,
        COUNT(p.product_id) AS product_count
      FROM brands b
      LEFT JOIN products p ON p.brand_id = b.brand_id
      GROUP BY b.brand_id
      ORDER BY b.brand_name ASC
    `);

    return successResponse(res, brands, 'Danh sách thương hiệu');
  } catch (error) {
    next(error);
  }
}

// [GET] /api/brands/:slug
async function getBrandBySlug(req, res, next) {
  try {
    const { slug } = req.params;

    const [rows] = await pool.query(
      'SELECT * FROM brands WHERE slug = ? LIMIT 1',
      [slug]
    );

    if (rows.length === 0) {
      return errorResponse(res, 'Không tìm thấy thương hiệu', 404);
    }

    return successResponse(res, rows[0], 'Chi tiết thương hiệu');
  } catch (error) {
    next(error);
  }
}

// [POST] /api/brands (Admin only)
async function createBrand(req, res, next) {
  try {
    const { brand_name, slug, logo_url } = req.body;

    if (!brand_name) {
      return errorResponse(res, 'Vui lòng cung cấp tên thương hiệu', 400);
    }

    const finalSlug = slug ? slugify(slug) : slugify(brand_name);

    const [result] = await pool.query(
      'INSERT INTO brands (brand_name, slug, logo_url) VALUES (?, ?, ?)',
      [brand_name, finalSlug, logo_url || null]
    );

    return successResponse(
      res,
      {
        brand_id: result.insertId,
        brand_name,
        slug: finalSlug,
        logo_url: logo_url || null
      },
      'Thêm thương hiệu thành công',
      201
    );
  } catch (error) {
    next(error);
  }
}

// [PUT] /api/brands/:id (Admin only)
async function updateBrand(req, res, next) {
  try {
    const { id } = req.params;
    const { brand_name, slug, logo_url } = req.body;

    const [existing] = await pool.query('SELECT * FROM brands WHERE brand_id = ?', [id]);
    if (existing.length === 0) {
      return errorResponse(res, 'Thương hiệu không tồn tại', 404);
    }

    const newSlug = slug ? slugify(slug) : (brand_name ? slugify(brand_name) : existing[0].slug);
    const newName = brand_name || existing[0].brand_name;
    const newLogo = logo_url !== undefined ? logo_url : existing[0].logo_url;

    await pool.query(
      'UPDATE brands SET brand_name = ?, slug = ?, logo_url = ? WHERE brand_id = ?',
      [newName, newSlug, newLogo, id]
    );

    return successResponse(res, null, 'Cập nhật thương hiệu thành công');
  } catch (error) {
    next(error);
  }
}

// [DELETE] /api/brands/:id (Admin only)
async function deleteBrand(req, res, next) {
  try {
    const { id } = req.params;

    const [products] = await pool.query('SELECT COUNT(*) AS count FROM products WHERE brand_id = ?', [id]);
    if (products[0].count > 0) {
      return errorResponse(res, 'Không thể xóa thương hiệu đang có sản phẩm liên kết', 400);
    }

    const [result] = await pool.query('DELETE FROM brands WHERE brand_id = ?', [id]);
    if (result.affectedRows === 0) {
      return errorResponse(res, 'Thương hiệu không tồn tại', 404);
    }

    return successResponse(res, null, 'Xóa thương hiệu thành công');
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getBrands,
  getBrandBySlug,
  createBrand,
  updateBrand,
  deleteBrand
};
