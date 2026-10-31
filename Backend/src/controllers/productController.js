const prisma = require('../config/prisma');
const { slugify, generateSku, successResponse, errorResponse } = require('../utils/helpers');
const variantController = require('./variantController');

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
      sort = 'newest',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)));
    const offset = (pageNum - 1) * limitNum;

    const whereConditions = {};

    if (status !== 'all') {
      whereConditions.status = status;
    }

    if (category_id) {
      whereConditions.category_id = BigInt(category_id);
    } else if (category_slug) {
      whereConditions.category = { slug: category_slug };
    }

    if (brand_id) {
      whereConditions.brand_id = BigInt(brand_id);
    } else if (brand_slug) {
      whereConditions.brand = { slug: brand_slug };
    }

    if (search && search.trim() !== '') {
      const keyword = search.trim();
      whereConditions.OR = [
        { product_name: { contains: keyword } },
        { description: { contains: keyword } },
      ];
    }

    // Filter by price range through variants if requested
    if (min_price || max_price) {
      const priceFilter = {};
      if (min_price) priceFilter.gte = Number(min_price);
      if (max_price) priceFilter.lte = Number(max_price);
      whereConditions.variants = {
        some: {
          price: priceFilter,
        },
      };
    }

    let orderBy = [{ created_at: 'desc' }];
    if (sort === 'name_asc') {
      orderBy = [{ product_name: 'asc' }];
    }

    const [total, products] = await Promise.all([
      prisma.product.count({ where: whereConditions }),
      prisma.product.findMany({
        where: whereConditions,
        orderBy,
        skip: offset,
        take: limitNum,
        include: {
          category: {
            select: { category_id: true, category_name: true, slug: true },
          },
          brand: {
            select: { brand_id: true, brand_name: true, slug: true },
          },
          variants: {
            select: {
              variant_id: true,
              price: true,
              sale_price: true,
              stock: true,
            },
          },
          reviews: {
            select: {
              review_id: true,
              rating: true,
            },
          },
        },
      }),
    ]);

    const formattedRows = products.map((p) => {
      const variantPrices = p.variants.map((v) => Number(v.price));
      const salePrices = p.variants.filter((v) => v.sale_price !== null).map((v) => Number(v.sale_price));
      const min_price = variantPrices.length > 0 ? Math.min(...variantPrices) : 0;
      const max_price = variantPrices.length > 0 ? Math.max(...variantPrices) : 0;
      const min_sale_price = salePrices.length > 0 ? Math.min(...salePrices) : min_price;
      const total_stock = p.variants.reduce((sum, v) => sum + (v.stock || 0), 0);
      const variant_count = p.variants.length;
      const variant_id = p.variants.length > 0 ? p.variants[0].variant_id : null;

      const review_count = p.reviews.length;
      const avg_rating =
        review_count > 0
          ? Number((p.reviews.reduce((sum, r) => sum + r.rating, 0) / review_count).toFixed(1))
          : 0;

      return {
        product_id: p.product_id,
        product_name: p.product_name,
        slug: p.slug,
        description: p.description,
        thumbnail_url: p.thumbnail_url,
        status: p.status,
        created_at: p.created_at,
        updated_at: p.updated_at,
        category_id: p.category_id,
        category_name: p.category?.category_name || null,
        category_slug: p.category?.slug || null,
        brand_id: p.brand_id,
        brand_name: p.brand?.brand_name || null,
        brand_slug: p.brand?.slug || null,
        variant_id,
        min_price,
        max_price,
        min_sale_price,
        total_stock,
        variant_count,
        avg_rating,
        review_count,
      };
    });

    // In-memory sort for price or rating if needed
    if (sort === 'price_asc') {
      formattedRows.sort((a, b) => a.min_price - b.min_price);
    } else if (sort === 'price_desc') {
      formattedRows.sort((a, b) => b.min_price - a.min_price);
    } else if (sort === 'rating') {
      formattedRows.sort((a, b) => b.avg_rating - a.avg_rating);
    }

    return successResponse(
      res,
      {
        items: formattedRows,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum),
        },
      },
      'Lấy danh sách sản phẩm thành công'
    );
  } catch (error) {
    next(error);
  }
}

// [GET] /api/products/:slug
async function getProductBySlug(req, res, next) {
  try {
    const { slug } = req.params;

    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: {
          select: { category_name: true, slug: true },
        },
        brand: {
          select: { brand_name: true, slug: true, logo_url: true },
        },
        variants: {
          orderBy: { price: 'asc' },
          include: {
            images: {
              orderBy: { sort_order: 'asc' },
            },
          },
        },
        images: {
          orderBy: [
            { is_primary: 'desc' },
            { sort_order: 'asc' },
          ],
        },
        reviews: {
          select: { review_id: true, rating: true },
        },
      },
    });

    if (!product) {
      return errorResponse(res, 'Không tìm thấy sản phẩm', 404);
    }

    const review_count = product.reviews.length;
    const avg_rating =
      review_count > 0
        ? Number((product.reviews.reduce((sum, r) => sum + r.rating, 0) / review_count).toFixed(1))
        : 0;

    const parsedVariants = product.variants.map((v) => {
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
        specifications: specs,
        images: v.images || [],
      };
    });

    const result = {
      product_id: product.product_id,
      category_id: product.category_id,
      brand_id: product.brand_id,
      product_name: product.product_name,
      slug: product.slug,
      description: product.description,
      thumbnail_url: product.thumbnail_url,
      status: product.status,
      created_at: product.created_at,
      updated_at: product.updated_at,
      category_name: product.category?.category_name || null,
      category_slug: product.category?.slug || null,
      brand_name: product.brand?.brand_name || null,
      brand_slug: product.brand?.slug || null,
      brand_logo: product.brand?.logo_url || null,
      avg_rating,
      review_count,
      images: product.images,
      variants: parsedVariants,
    };

    return successResponse(res, result, 'Chi tiết sản phẩm');
  } catch (error) {
    next(error);
  }
}

// [GET] /api/products/id/:id
async function getProductById(req, res, next) {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { product_id: BigInt(id) },
      select: { slug: true },
    });
    if (!product) {
      return errorResponse(res, 'Không tìm thấy sản phẩm', 404);
    }

    req.params.slug = product.slug;
    return getProductBySlug(req, res, next);
  } catch (error) {
    next(error);
  }
}

// [POST] /api/products (Admin only)
async function createProduct(req, res, next) {
  try {
    const {
      product_name,
      slug,
      category_id,
      brand_id,
      description,
      thumbnail_url,
      status = 'draft',
      variants = [],
      images = [],
    } = req.body;

    if (!product_name || !category_id) {
      return errorResponse(res, 'Vui lòng cung cấp tên sản phẩm và danh mục', 400);
    }

    const finalSlug = slug ? slugify(slug) : slugify(product_name);
    const parsedCategoryId = BigInt(category_id);
    const parsedBrandId = brand_id ? BigInt(brand_id) : null;

    const createdProduct = await prisma.$transaction(async (tx) => {
      const prod = await tx.product.create({
        data: {
          product_name: product_name.trim(),
          slug: finalSlug,
          category_id: parsedCategoryId,
          brand_id: parsedBrandId,
          description: description ? description.trim() : null,
          thumbnail_url: thumbnail_url ? thumbnail_url.trim() : null,
          status,
        },
      });

      // Insert variants
      if (Array.isArray(variants) && variants.length > 0) {
        for (const v of variants) {
          const sku =
            v.sku && typeof v.sku === 'string' && v.sku.trim()
              ? v.sku.trim().toUpperCase()
              : generateSku(product_name, v.variant_name);
          const specs = v.specifications ? JSON.stringify(v.specifications) : null;

          const createdVar = await tx.productVariant.create({
            data: {
              product_id: prod.product_id,
              sku,
              variant_name: v.variant_name || product_name,
              specifications: specs,
              price: Number(v.price) || 0,
              sale_price: v.sale_price !== undefined && v.sale_price !== null ? Number(v.sale_price) : null,
              stock: parseInt(v.stock, 10) || 0,
              warranty_months: parseInt(v.warranty_months, 10) || 12,
            },
          });

          // Insert variant images
          if (Array.isArray(v.images) && v.images.length > 0) {
            const varImgs = [];
            for (let i = 0; i < v.images.length; i++) {
              const img = v.images[i];
              const imgUrl = typeof img === 'string' ? img : img?.image_url;
              if (!imgUrl) continue;
              const isPrimary = typeof img === 'object' && img?.is_primary ? true : i === 0;
              varImgs.push({
                variant_id: createdVar.variant_id,
                image_url: imgUrl,
                is_primary: isPrimary,
                sort_order: i,
              });
            }
            if (varImgs.length > 0) {
              await tx.variantImage.createMany({ data: varImgs });
            }
          }
        }
      } else {
        // Create default variant
        const defaultSku = generateSku(product_name, 'Tiêu chuẩn');
        const defaultVar = await tx.productVariant.create({
          data: {
            product_id: prod.product_id,
            sku: defaultSku,
            variant_name: 'Tiêu chuẩn',
            price: 0,
            stock: 0,
            warranty_months: 12,
          },
        });
        if (thumbnail_url) {
          await tx.variantImage.create({
            data: {
              variant_id: defaultVar.variant_id,
              image_url: thumbnail_url,
              is_primary: true,
              sort_order: 0,
            },
          });
        }
      }

      // Insert product images
      if (Array.isArray(images) && images.length > 0) {
        const prodImgs = [];
        for (let i = 0; i < images.length; i++) {
          const img = images[i];
          const imgUrl = typeof img === 'string' ? img : img?.image_url;
          if (!imgUrl) continue;
          const isPrimary = typeof img === 'object' && img?.is_primary ? true : i === 0;
          const altText = typeof img === 'object' && img?.alt_text ? img.alt_text : product_name;
          prodImgs.push({
            product_id: prod.product_id,
            image_url: imgUrl,
            alt_text: altText,
            is_primary: isPrimary,
            sort_order: i,
          });
        }
        if (prodImgs.length > 0) {
          await tx.productImage.createMany({ data: prodImgs });
        }
      }

      return prod;
    });

    return successResponse(
      res,
      {
        product_id: createdProduct.product_id,
        product_name: createdProduct.product_name,
        slug: createdProduct.slug,
      },
      'Thêm sản phẩm mới thành công',
      201
    );
  } catch (error) {
    next(error);
  }
}

// [PUT] /api/products/:id (Admin only)
async function updateProduct(req, res, next) {
  try {
    const productId = BigInt(req.params.id);
    const {
      product_name,
      slug,
      category_id,
      brand_id,
      description,
      thumbnail_url,
      status,
    } = req.body;

    const existing = await prisma.product.findUnique({
      where: { product_id: productId },
    });
    if (!existing) {
      return errorResponse(res, 'Sản phẩm không tồn tại', 404);
    }

    const newSlug = slug ? slugify(slug) : product_name ? slugify(product_name) : existing.slug;

    const updateData = {};
    if (product_name !== undefined) updateData.product_name = product_name.trim();
    if (newSlug) updateData.slug = newSlug;
    if (category_id !== undefined) updateData.category_id = BigInt(category_id);
    if (brand_id !== undefined) updateData.brand_id = brand_id ? BigInt(brand_id) : null;
    if (description !== undefined) updateData.description = description;
    if (thumbnail_url !== undefined) updateData.thumbnail_url = thumbnail_url;
    if (status !== undefined) updateData.status = status;

    await prisma.product.update({
      where: { product_id: productId },
      data: updateData,
    });

    return successResponse(res, null, 'Cập nhật sản phẩm thành công');
  } catch (error) {
    next(error);
  }
}

// [DELETE] /api/products/:id (Admin only)
async function deleteProduct(req, res, next) {
  try {
    const productId = BigInt(req.params.id);
    const { hardDelete } = req.query;

    const existing = await prisma.product.findUnique({
      where: { product_id: productId },
    });
    if (!existing) {
      return errorResponse(res, 'Sản phẩm không tồn tại', 404);
    }

    if (hardDelete === 'true') {
      await prisma.product.delete({
        where: { product_id: productId },
      });
      return successResponse(res, null, 'Đã xóa vĩnh viễn sản phẩm');
    }

    // Soft delete / archive
    await prisma.product.update({
      where: { product_id: productId },
      data: { status: 'archived' },
    });
    return successResponse(res, null, 'Đã chuyển sản phẩm vào kho lưu trữ (archived)');
  } catch (error) {
    next(error);
  }
}

// ============================================
// PRODUCT IMAGES MANAGEMENT
// ============================================

// [GET] /api/products/:id/images
async function getProductImages(req, res, next) {
  try {
    const productId = BigInt(req.params.id);
    const images = await prisma.productImage.findMany({
      where: { product_id: productId },
      orderBy: [
        { is_primary: 'desc' },
        { sort_order: 'asc' },
        { created_at: 'asc' },
      ],
    });
    return successResponse(res, images, 'Danh sách ảnh sản phẩm');
  } catch (error) {
    next(error);
  }
}

// [POST] /api/products/:id/images (Admin only, file upload or URL)
async function addProductImage(req, res, next) {
  try {
    const productId = BigInt(req.params.id);
    let imageUrl = req.body?.image_url;
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    } else if (req.files && req.files.length > 0) {
      imageUrl = `/uploads/${req.files[0].filename}`;
    }

    if (!imageUrl) {
      return errorResponse(res, 'Vui lòng cung cấp tệp ảnh hoặc URL ảnh', 400);
    }

    const product = await prisma.product.findUnique({
      where: { product_id: productId },
    });
    if (!product) {
      return errorResponse(res, 'Sản phẩm không tồn tại', 404);
    }

    const count = await prisma.productImage.count({
      where: { product_id: productId },
    });
    const isFirst = count === 0;
    const requestedPrimary =
      req.body?.is_primary === 'true' || req.body?.is_primary === true || req.body?.is_primary === 1 || isFirst;

    if (requestedPrimary) {
      await prisma.productImage.updateMany({
        where: { product_id: productId },
        data: { is_primary: false },
      });
      await prisma.product.update({
        where: { product_id: productId },
        data: { thumbnail_url: imageUrl },
      });
    }

    const altText = req.body?.alt_text || product.product_name;

    const newImg = await prisma.productImage.create({
      data: {
        product_id: productId,
        image_url: imageUrl,
        alt_text: altText,
        is_primary: !!requestedPrimary,
        sort_order: count,
      },
    });

    return successResponse(
      res,
      {
        image_id: newImg.image_id,
        product_id: newImg.product_id,
        image_url: imageUrl,
        alt_text: altText,
        is_primary: newImg.is_primary ? 1 : 0,
        sort_order: count,
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
    const imageId = BigInt(req.params.imageId);

    const existing = await prisma.productImage.findUnique({
      where: { image_id: imageId },
    });
    if (!existing) {
      return errorResponse(res, 'Ảnh sản phẩm không tồn tại', 404);
    }

    const productId = existing.product_id;
    const wasPrimary = existing.is_primary;

    await prisma.productImage.delete({
      where: { image_id: imageId },
    });

    if (wasPrimary) {
      const remaining = await prisma.productImage.findFirst({
        where: { product_id: productId },
        orderBy: [{ sort_order: 'asc' }, { image_id: 'asc' }],
      });
      if (remaining) {
        await prisma.productImage.update({
          where: { image_id: remaining.image_id },
          data: { is_primary: true },
        });
        await prisma.product.update({
          where: { product_id: productId },
          data: { thumbnail_url: remaining.image_url },
        });
      }
    }

    return successResponse(res, null, 'Đã xóa ảnh sản phẩm');
  } catch (error) {
    next(error);
  }
}

// [PUT] /api/products/images/:imageId/primary (Admin only)
async function setPrimaryProductImage(req, res, next) {
  try {
    const imageId = BigInt(req.params.imageId);

    const existing = await prisma.productImage.findUnique({
      where: { image_id: imageId },
    });
    if (!existing) {
      return errorResponse(res, 'Ảnh không tồn tại', 404);
    }

    const productId = existing.product_id;
    const imageUrl = existing.image_url;

    await prisma.$transaction([
      prisma.productImage.updateMany({
        where: { product_id: productId },
        data: { is_primary: false },
      }),
      prisma.productImage.update({
        where: { image_id: imageId },
        data: { is_primary: true },
      }),
      prisma.product.update({
        where: { product_id: productId },
        data: { thumbnail_url: imageUrl },
      }),
    ]);

    return successResponse(res, null, 'Đã đặt làm ảnh chính sản phẩm');
  } catch (error) {
    next(error);
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
