const { pool } = require('../config/db');
const { slugify, successResponse, errorResponse } = require('../utils/helpers');

// [GET] /api/categories
async function getCategories(req, res, next) {
  try {
    const { tree } = req.query;

    const [categories] = await pool.query(`
      SELECT 
        c.category_id,
        c.parent_id,
        c.category_name,
        c.slug,
        c.created_at,
        c.updated_at,
        COUNT(p.product_id) AS product_count
      FROM categories c
      LEFT JOIN products p ON p.category_id = c.category_id
      GROUP BY c.category_id
      ORDER BY c.parent_id ASC, c.category_name ASC
    `);

    if (tree === 'true') {
      const map = {};
      const roots = [];
      categories.forEach(cat => {
        map[cat.category_id] = { ...cat, children: [] };
      });
      categories.forEach(cat => {
        if (cat.parent_id && map[cat.parent_id]) {
          map[cat.parent_id].children.push(map[cat.category_id]);
        } else {
          roots.push(map[cat.category_id]);
        }
      });
      return successResponse(res, roots, 'Danh sách danh mục dạng cây');
    }

    return successResponse(res, categories, 'Danh sách danh mục');
  } catch (error) {
    next(error);
  }
}

// [GET] /api/categories/:slug
async function getCategoryBySlug(req, res, next) {
  try {
    const { slug } = req.params;

    const [rows] = await pool.query(
      `SELECT c.*, p.category_name AS parent_name
       FROM categories c
       LEFT JOIN categories p ON c.parent_id = p.category_id
       WHERE c.slug = ? LIMIT 1`,
      [slug]
    );

    if (rows.length === 0) {
      return errorResponse(res, 'Không tìm thấy danh mục', 404);
    }

    return successResponse(res, rows[0], 'Chi tiết danh mục');
  } catch (error) {
    next(error);
  }
}

// [POST] /api/categories (Admin only)
async function createCategory(req, res, next) {
  try {
    const { category_name, slug, parent_id } = req.body;

    if (!category_name) {
      return errorResponse(res, 'Vui lòng cung cấp tên danh mục', 400);
    }

    const finalSlug = slug ? slugify(slug) : slugify(category_name);

    const [result] = await pool.query(
      'INSERT INTO categories (category_name, slug, parent_id) VALUES (?, ?, ?)',
      [category_name, finalSlug, parent_id || null]
    );

    return successResponse(
      res,
      {
        category_id: result.insertId,
        category_name,
        slug: finalSlug,
        parent_id: parent_id || null
      },
      'Tạo danh mục thành công',
      201
    );
  } catch (error) {
    next(error);
  }
}

// [PUT] /api/categories/:id (Admin only)
async function updateCategory(req, res, next) {
  try {
    const { id } = req.params;
    const { category_name, slug, parent_id } = req.body;

    const [existing] = await pool.query('SELECT * FROM categories WHERE category_id = ?', [id]);
    if (existing.length === 0) {
      return errorResponse(res, 'Danh mục không tồn tại', 404);
    }

    const newSlug = slug ? slugify(slug) : (category_name ? slugify(category_name) : existing[0].slug);
    const newName = category_name || existing[0].category_name;
    const newParentId = parent_id !== undefined ? parent_id : existing[0].parent_id;

    await pool.query(
      'UPDATE categories SET category_name = ?, slug = ?, parent_id = ? WHERE category_id = ?',
      [newName, newSlug, newParentId, id]
    );

    return successResponse(res, null, 'Cập nhật danh mục thành công');
  } catch (error) {
    next(error);
  }
}

// [DELETE] /api/categories/:id (Admin only)
async function deleteCategory(req, res, next) {
  try {
    const { id } = req.params;

    // Check if category has products
    const [products] = await pool.query('SELECT COUNT(*) AS count FROM products WHERE category_id = ?', [id]);
    if (products[0].count > 0) {
      return errorResponse(res, 'Không thể xóa danh mục đang có sản phẩm liên kết', 400);
    }

    const [result] = await pool.query('DELETE FROM categories WHERE category_id = ?', [id]);
    if (result.affectedRows === 0) {
      return errorResponse(res, 'Danh mục không tồn tại', 404);
    }

    return successResponse(res, null, 'Xóa danh mục thành công');
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory
};
