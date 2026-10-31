const prisma = require('../config/prisma');
const { slugify, successResponse, errorResponse } = require('../utils/helpers');

// [GET] /api/brands
async function getBrands(req, res, next) {
  try {
    const brands = await prisma.brand.findMany({
      orderBy: { brand_name: 'asc' },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    const formatted = brands.map((b) => ({
      brand_id: b.brand_id,
      brand_name: b.brand_name,
      slug: b.slug,
      logo_url: b.logo_url,
      created_at: b.created_at,
      updated_at: b.updated_at,
      product_count: b._count.products,
    }));

    return successResponse(res, formatted, 'Danh sách thương hiệu');
  } catch (error) {
    next(error);
  }
}

// [GET] /api/brands/:slug
async function getBrandBySlug(req, res, next) {
  try {
    const { slug } = req.params;

    const brand = await prisma.brand.findUnique({
      where: { slug },
    });

    if (!brand) {
      return errorResponse(res, 'Không tìm thấy thương hiệu', 404);
    }

    return successResponse(res, brand, 'Chi tiết thương hiệu');
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

    const brand = await prisma.brand.create({
      data: {
        brand_name: brand_name.trim(),
        slug: finalSlug,
        logo_url: logo_url || null,
      },
    });

    return successResponse(
      res,
      {
        brand_id: brand.brand_id,
        brand_name: brand.brand_name,
        slug: brand.slug,
        logo_url: brand.logo_url,
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
    const brandId = BigInt(req.params.id);
    const { brand_name, slug, logo_url } = req.body;

    const existing = await prisma.brand.findUnique({
      where: { brand_id: brandId },
    });
    if (!existing) {
      return errorResponse(res, 'Thương hiệu không tồn tại', 404);
    }

    const newSlug = slug ? slugify(slug) : (brand_name ? slugify(brand_name) : existing.slug);
    const newName = brand_name ? brand_name.trim() : existing.brand_name;
    const newLogo = logo_url !== undefined ? logo_url : existing.logo_url;

    await prisma.brand.update({
      where: { brand_id: brandId },
      data: {
        brand_name: newName,
        slug: newSlug,
        logo_url: newLogo,
      },
    });

    return successResponse(res, null, 'Cập nhật thương hiệu thành công');
  } catch (error) {
    next(error);
  }
}

// [DELETE] /api/brands/:id (Admin only)
async function deleteBrand(req, res, next) {
  try {
    const brandId = BigInt(req.params.id);

    const productCount = await prisma.product.count({
      where: { brand_id: brandId },
    });
    if (productCount > 0) {
      return errorResponse(res, 'Không thể xóa thương hiệu đang có sản phẩm liên kết', 400);
    }

    const existing = await prisma.brand.findUnique({
      where: { brand_id: brandId },
    });
    if (!existing) {
      return errorResponse(res, 'Thương hiệu không tồn tại', 404);
    }

    await prisma.brand.delete({
      where: { brand_id: brandId },
    });

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
  deleteBrand,
};
