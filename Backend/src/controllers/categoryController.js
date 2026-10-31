const prisma = require('../config/prisma');
const { slugify, successResponse, errorResponse } = require('../utils/helpers');

// [GET] /api/categories
async function getCategories(req, res, next) {
  try {
    const { tree } = req.query;

    const categories = await prisma.category.findMany({
      orderBy: [
        { parent_id: 'asc' },
        { category_name: 'asc' },
      ],
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    const formatted = categories.map((c) => ({
      category_id: c.category_id,
      parent_id: c.parent_id,
      category_name: c.category_name,
      slug: c.slug,
      created_at: c.created_at,
      updated_at: c.updated_at,
      product_count: c._count.products,
    }));

    if (tree === 'true') {
      const map = {};
      const roots = [];
      formatted.forEach((cat) => {
        map[cat.category_id] = { ...cat, children: [] };
      });
      formatted.forEach((cat) => {
        if (cat.parent_id && map[cat.parent_id]) {
          map[cat.parent_id].children.push(map[cat.category_id]);
        } else {
          roots.push(map[cat.category_id]);
        }
      });
      return successResponse(res, roots, 'Danh sách danh mục dạng cây');
    }

    return successResponse(res, formatted, 'Danh sách danh mục');
  } catch (error) {
    next(error);
  }
}

// [GET] /api/categories/:slug
async function getCategoryBySlug(req, res, next) {
  try {
    const { slug } = req.params;

    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        parent: {
          select: { category_name: true },
        },
      },
    });

    if (!category) {
      return errorResponse(res, 'Không tìm thấy danh mục', 404);
    }

    const result = {
      category_id: category.category_id,
      parent_id: category.parent_id,
      category_name: category.category_name,
      slug: category.slug,
      created_at: category.created_at,
      updated_at: category.updated_at,
      parent_name: category.parent ? category.parent.category_name : null,
    };

    return successResponse(res, result, 'Chi tiết danh mục');
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
    const parsedParentId = parent_id ? BigInt(parent_id) : null;

    const newCategory = await prisma.category.create({
      data: {
        category_name: category_name.trim(),
        slug: finalSlug,
        parent_id: parsedParentId,
      },
    });

    return successResponse(
      res,
      {
        category_id: newCategory.category_id,
        category_name: newCategory.category_name,
        slug: newCategory.slug,
        parent_id: newCategory.parent_id,
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
    const categoryId = BigInt(req.params.id);
    const { category_name, slug, parent_id } = req.body;

    const existing = await prisma.category.findUnique({
      where: { category_id: categoryId },
    });
    if (!existing) {
      return errorResponse(res, 'Danh mục không tồn tại', 404);
    }

    const newSlug = slug ? slugify(slug) : (category_name ? slugify(category_name) : existing.slug);
    const newName = category_name ? category_name.trim() : existing.category_name;
    const newParentId = parent_id !== undefined ? (parent_id ? BigInt(parent_id) : null) : existing.parent_id;

    await prisma.category.update({
      where: { category_id: categoryId },
      data: {
        category_name: newName,
        slug: newSlug,
        parent_id: newParentId,
      },
    });

    return successResponse(res, null, 'Cập nhật danh mục thành công');
  } catch (error) {
    next(error);
  }
}

// [DELETE] /api/categories/:id (Admin only)
async function deleteCategory(req, res, next) {
  try {
    const categoryId = BigInt(req.params.id);

    // Check if category has products
    const productCount = await prisma.product.count({
      where: { category_id: categoryId },
    });
    if (productCount > 0) {
      return errorResponse(res, 'Không thể xóa danh mục đang có sản phẩm liên kết', 400);
    }

    const existing = await prisma.category.findUnique({
      where: { category_id: categoryId },
    });
    if (!existing) {
      return errorResponse(res, 'Danh mục không tồn tại', 404);
    }

    await prisma.category.delete({
      where: { category_id: categoryId },
    });

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
  deleteCategory,
};
