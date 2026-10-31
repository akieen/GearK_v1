const prisma = require('../config/prisma');
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
    const productId = BigInt(req.params.id);
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
      const product = await prisma.product.findUnique({
        where: { product_id: productId },
        select: { product_name: true },
      });
      const prodName = product ? product.product_name : '';
      finalSku = generateSku(prodName, variant_name);
    }

    const specs = normalizeSpecifications(specifications);

    const createdVariant = await prisma.productVariant.create({
      data: {
        product_id: productId,
        sku: finalSku,
        variant_name: variant_name.trim(),
        specifications: specs,
        price: Number(price),
        sale_price: sale_price !== undefined && sale_price !== null && sale_price !== '' ? Number(sale_price) : null,
        stock: parseInt(stock, 10) || 0,
        warranty_months: parseInt(warranty_months, 10) || 0,
      },
    });

    // Insert variant images
    if (allImages.length > 0) {
      const imageData = [];
      for (let i = 0; i < allImages.length; i++) {
        const img = allImages[i];
        const imgUrl = typeof img === 'string' ? img : img?.image_url;
        if (!imgUrl) continue;
        const isPrimary = (typeof img === 'object' && img?.is_primary) ? true : (i === 0);
        imageData.push({
          variant_id: createdVariant.variant_id,
          image_url: imgUrl,
          is_primary: isPrimary,
          sort_order: i,
        });
      }
      if (imageData.length > 0) {
        await prisma.variantImage.createMany({
          data: imageData,
        });
      }
    }

    const createdImages = await prisma.variantImage.findMany({
      where: { variant_id: createdVariant.variant_id },
      orderBy: { sort_order: 'asc' },
    });

    return successResponse(
      res,
      {
        variant_id: createdVariant.variant_id,
        product_id: createdVariant.product_id,
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
    if (error.code === 'P2002') {
      return errorResponse(res, 'Mã SKU đã tồn tại trên hệ thống. Vui lòng thử mã khác.', 400);
    }
    next(error);
  }
}

// [PUT] /api/products/variants/:variantId (Admin / Staff)
async function updateVariant(req, res, next) {
  try {
    const variantId = BigInt(req.params.variantId);
    const { sku, variant_name, specifications, price, sale_price, stock, warranty_months } = req.body;

    const existing = await prisma.productVariant.findUnique({
      where: { variant_id: variantId },
    });
    if (!existing) {
      return errorResponse(res, 'Phiên bản không tồn tại', 404);
    }

    const updateData = {};
    if (sku !== undefined && sku.trim()) updateData.sku = sku.trim().toUpperCase();
    if (variant_name !== undefined) updateData.variant_name = variant_name.trim();
    if (specifications !== undefined) updateData.specifications = normalizeSpecifications(specifications);
    if (price !== undefined) updateData.price = Number(price);
    if (sale_price !== undefined) {
      updateData.sale_price = (sale_price !== null && sale_price !== '') ? Number(sale_price) : null;
    }
    if (stock !== undefined) updateData.stock = parseInt(stock, 10);
    if (warranty_months !== undefined) updateData.warranty_months = parseInt(warranty_months, 10);

    await prisma.productVariant.update({
      where: { variant_id: variantId },
      data: updateData,
    });

    return successResponse(res, null, 'Cập nhật phiên bản thành công');
  } catch (error) {
    if (error.code === 'P2002') {
      return errorResponse(res, 'Mã SKU đã tồn tại trên hệ thống.', 400);
    }
    next(error);
  }
}

// [DELETE] /api/products/variants/:variantId (Admin only)
async function deleteVariant(req, res, next) {
  try {
    const variantId = BigInt(req.params.variantId);

    const existing = await prisma.productVariant.findUnique({
      where: { variant_id: variantId },
    });
    if (!existing) {
      return errorResponse(res, 'Phiên bản không tồn tại', 404);
    }

    await prisma.productVariant.delete({
      where: { variant_id: variantId },
    });

    return successResponse(res, null, 'Xóa phiên bản sản phẩm thành công');
  } catch (error) {
    next(error);
  }
}

// [GET] /api/products/variants/:variantId/images
async function getVariantImages(req, res, next) {
  try {
    const variantId = BigInt(req.params.variantId);
    const images = await prisma.variantImage.findMany({
      where: { variant_id: variantId },
      orderBy: [
        { is_primary: 'desc' },
        { sort_order: 'asc' },
        { created_at: 'asc' },
      ],
    });
    return successResponse(res, images, 'Danh sách ảnh của biến thể');
  } catch (error) {
    next(error);
  }
}

// [POST] /api/products/variants/:variantId/images (Admin / Staff)
async function addVariantImage(req, res, next) {
  try {
    const variantId = BigInt(req.params.variantId);
    let imageUrl = req.body?.image_url;
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    } else if (req.files && req.files.length > 0) {
      imageUrl = `/uploads/${req.files[0].filename}`;
    }

    if (!imageUrl) {
      return errorResponse(res, 'Vui lòng cung cấp tệp ảnh hoặc URL ảnh', 400);
    }

    const variant = await prisma.productVariant.findUnique({
      where: { variant_id: variantId },
    });
    if (!variant) {
      return errorResponse(res, 'Biến thể không tồn tại', 404);
    }

    const count = await prisma.variantImage.count({
      where: { variant_id: variantId },
    });
    const isFirst = count === 0;
    const requestedPrimary = req.body?.is_primary === 'true' || req.body?.is_primary === true || req.body?.is_primary === 1 || isFirst;

    if (requestedPrimary) {
      await prisma.variantImage.updateMany({
        where: { variant_id: variantId },
        data: { is_primary: false },
      });
    }

    const newImg = await prisma.variantImage.create({
      data: {
        variant_id: variantId,
        image_url: imageUrl,
        is_primary: !!requestedPrimary,
        sort_order: count,
      },
    });

    return successResponse(
      res,
      {
        image_id: newImg.image_id,
        variant_id: newImg.variant_id,
        image_url: imageUrl,
        is_primary: newImg.is_primary ? 1 : 0,
        sort_order: count,
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
    const imageId = BigInt(req.params.imageId);

    const existing = await prisma.variantImage.findUnique({
      where: { image_id: imageId },
    });
    if (!existing) {
      return errorResponse(res, 'Ảnh biến thể không tồn tại', 404);
    }

    const variantId = existing.variant_id;
    const wasPrimary = existing.is_primary;

    await prisma.variantImage.delete({
      where: { image_id: imageId },
    });

    if (wasPrimary) {
      const remaining = await prisma.variantImage.findFirst({
        where: { variant_id: variantId },
        orderBy: [{ sort_order: 'asc' }, { image_id: 'asc' }],
      });
      if (remaining) {
        await prisma.variantImage.update({
          where: { image_id: remaining.image_id },
          data: { is_primary: true },
        });
      }
    }

    return successResponse(res, null, 'Đã xóa ảnh biến thể');
  } catch (error) {
    next(error);
  }
}

// [PUT] /api/products/variants/images/:imageId/primary (Admin / Staff)
async function setPrimaryVariantImage(req, res, next) {
  try {
    const imageId = BigInt(req.params.imageId);

    const existing = await prisma.variantImage.findUnique({
      where: { image_id: imageId },
    });
    if (!existing) {
      return errorResponse(res, 'Ảnh biến thể không tồn tại', 404);
    }

    const variantId = existing.variant_id;

    await prisma.$transaction([
      prisma.variantImage.updateMany({
        where: { variant_id: variantId },
        data: { is_primary: false },
      }),
      prisma.variantImage.update({
        where: { image_id: imageId },
        data: { is_primary: true },
      }),
    ]);

    return successResponse(res, null, 'Đã đặt ảnh làm ảnh chính cho biến thể');
  } catch (error) {
    next(error);
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
