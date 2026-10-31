const prisma = require('../config/prisma');
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

    const whereConditions = {
      product: {
        status: { not: 'archived' },
      },
    };

    if (search && search.trim() !== '') {
      const keyword = search.trim();
      whereConditions.OR = [
        { product: { product_name: { contains: keyword } } },
        { sku: { contains: keyword } },
        { variant_name: { contains: keyword } },
      ];
    }

    if (category_id) {
      whereConditions.product.category_id = BigInt(category_id);
    }

    if (low_stock === 'true') {
      whereConditions.stock = { lte: 5 };
    }

    // Sorting
    let orderBy = [{ variant_id: 'desc' }];
    if (sort === 'stock_asc') {
      orderBy = [{ stock: 'asc' }];
    } else if (sort === 'stock_desc') {
      orderBy = [{ stock: 'desc' }];
    } else if (sort === 'name_asc') {
      orderBy = [
        { product: { product_name: 'asc' } },
        { variant_name: 'asc' },
      ];
    }

    const [total, variants, statsResult, importCount, exportCount] = await Promise.all([
      prisma.productVariant.count({ where: whereConditions }),
      prisma.productVariant.findMany({
        where: whereConditions,
        orderBy,
        skip: offset,
        take: limitNum,
        include: {
          product: {
            include: {
              category: { select: { category_name: true } },
              brand: { select: { brand_name: true } },
            },
          },
          images: {
            orderBy: [{ is_primary: 'desc' }, { sort_order: 'asc' }],
          },
        },
      }),
      // Summary stats
      prisma.productVariant.aggregate({
        where: { product: { status: { not: 'archived' } } },
        _count: { variant_id: true },
        _sum: { stock: true },
      }),
      prisma.inventoryTransaction.count({ where: { quantity_delta: { gt: 0 } } }),
      prisma.inventoryTransaction.count({ where: { quantity_delta: { lt: 0 } } }),
    ]);

    const [lowStockCount, outOfStockCount] = await Promise.all([
      prisma.productVariant.count({
        where: { product: { status: { not: 'archived' } }, stock: { lte: 5 } },
      }),
      prisma.productVariant.count({
        where: { product: { status: { not: 'archived' } }, stock: 0 },
      }),
    ]);

    const dataWithImages = variants.map((v) => {
      const primaryVarImg = v.images.find((img) => img.is_primary) || v.images[0];
      return {
        variant_id: v.variant_id,
        product_id: v.product_id,
        sku: v.sku,
        variant_name: v.variant_name,
        price: v.price,
        sale_price: v.sale_price,
        stock: v.stock,
        warranty_months: v.warranty_months,
        created_at: v.created_at,
        updated_at: v.updated_at,
        product_name: v.product?.product_name || '',
        product_slug: v.product?.slug || '',
        thumbnail_url: v.product?.thumbnail_url || '',
        product_status: v.product?.status || '',
        category_name: v.product?.category?.category_name || '',
        brand_name: v.product?.brand?.brand_name || '',
        image_url: primaryVarImg ? primaryVarImg.image_url : v.product?.thumbnail_url,
      };
    });

    return successResponse(
      res,
      {
        items: dataWithImages,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum) || 1,
        },
        summary: {
          total_variants: statsResult._count?.variant_id || 0,
          total_stock: statsResult._sum?.stock || 0,
          low_stock_count: lowStockCount,
          out_of_stock_count: outOfStockCount,
          total_imports: importCount,
          total_exports: exportCount,
        },
      },
      'Danh sách kho hàng và tồn kho'
    );
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

    const whereConditions = {};

    if (variant_id) {
      whereConditions.variant_id = BigInt(variant_id);
    }

    if (transaction_type && transaction_type !== 'all') {
      whereConditions.transaction_type = transaction_type;
    }

    if (search && search.trim() !== '') {
      const keyword = search.trim();
      whereConditions.OR = [
        { variant: { product: { product_name: { contains: keyword } } } },
        { variant: { sku: { contains: keyword } } },
        { variant: { variant_name: { contains: keyword } } },
        { note: { contains: keyword } },
      ];
    }

    const [total, transactions] = await Promise.all([
      prisma.inventoryTransaction.count({ where: whereConditions }),
      prisma.inventoryTransaction.findMany({
        where: whereConditions,
        orderBy: [
          { created_at: 'desc' },
          { inventory_transaction_id: 'desc' },
        ],
        skip: offset,
        take: limitNum,
        include: {
          variant: {
            include: {
              product: {
                select: {
                  product_id: true,
                  product_name: true,
                  thumbnail_url: true,
                },
              },
            },
          },
          creator: {
            select: { full_name: true },
          },
        },
      }),
    ]);

    const formatted = transactions.map((it) => ({
      inventory_transaction_id: it.inventory_transaction_id,
      variant_id: it.variant_id,
      created_by: it.created_by,
      transaction_type: it.transaction_type,
      quantity_delta: it.quantity_delta,
      stock_after: it.stock_after,
      note: it.note,
      created_at: it.created_at,
      sku: it.variant?.sku || '',
      variant_name: it.variant?.variant_name || '',
      product_id: it.variant?.product?.product_id,
      product_name: it.variant?.product?.product_name || '',
      thumbnail_url: it.variant?.product?.thumbnail_url || '',
      created_by_name: it.creator?.full_name || 'Hệ thống',
    }));

    return successResponse(
      res,
      {
        items: formatted,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum) || 1,
        },
      },
      'Lịch sử giao dịch nhập/xuất kho'
    );
  } catch (error) {
    next(error);
  }
}

// [POST] /api/inventory/import (Nhập hàng vào kho - Hỗ trợ nhiều mặt hàng)
async function importStock(req, res, next) {
  try {
    const { supplier_id, note, transaction_type = 'purchase' } = req.body;

    const rawItems = Array.isArray(req.body.items) && req.body.items.length > 0
      ? req.body.items
      : [{
          variant_id: req.body.variant_id,
          quantity: req.body.quantity,
          unit_cost: req.body.unit_cost,
        }];

    if (!rawItems || rawItems.length === 0) {
      return errorResponse(res, 'Vui lòng cung cấp danh sách mặt hàng cần nhập', 400);
    }

    const userId = req.user?.user_id ? BigInt(req.user.user_id) : null;
    let totalQty = 0;
    let totalCost = 0;

    const result = await prisma.$transaction(async (tx) => {
      let purchaseOrderId = null;
      if (supplier_id) {
        const pCode = `PO-${Date.now().toString().slice(-6)}`;
        const po = await tx.purchaseOrder.create({
          data: {
            supplier_id: BigInt(supplier_id),
            created_by: userId,
            purchase_code: pCode,
            status: 'received',
            subtotal: 0,
          },
        });
        purchaseOrderId = po.purchase_order_id;
      }

      const processedItems = [];

      for (const item of rawItems) {
        const variant_id = item.variant_id ? BigInt(item.variant_id) : null;
        const parsedQty = parseInt(item.quantity, 10);
        const parsedCost = parseFloat(item.unit_cost) || 0;

        if (!variant_id || isNaN(parsedQty) || parsedQty <= 0) {
          throw new Error(`Số lượng nhập cho biến thể #${item.variant_id || 'chưa chọn'} phải lớn hơn 0`);
        }

        const variant = await tx.productVariant.findUnique({
          where: { variant_id },
          include: { product: { select: { product_name: true } } },
        });

        if (!variant) {
          throw new Error(`Phiên bản sản phẩm #${item.variant_id} không tồn tại`);
        }

        const currentStock = variant.stock;
        const newStock = currentStock + parsedQty;

        // 1. Update stock
        await tx.productVariant.update({
          where: { variant_id },
          data: { stock: newStock },
        });

        // 2. Insert transaction
        const itemNote = note?.trim() || `Nhập kho ${parsedQty} sản phẩm`;
        const txRecord = await tx.inventoryTransaction.create({
          data: {
            variant_id,
            created_by: userId,
            transaction_type,
            quantity_delta: parsedQty,
            stock_after: newStock,
            note: itemNote,
          },
        });

        // 3. Purchase order items
        if (purchaseOrderId) {
          await tx.purchaseOrderItem.create({
            data: {
              purchase_order_id: purchaseOrderId,
              variant_id,
              quantity_ordered: parsedQty,
              quantity_received: parsedQty,
              unit_cost: parsedCost,
            },
          });
          totalCost += parsedQty * parsedCost;
        }

        totalQty += parsedQty;
        processedItems.push({
          transaction_id: txRecord.inventory_transaction_id,
          variant_id,
          product_name: variant.product.product_name,
          variant_name: variant.variant_name,
          sku: variant.sku,
          quantity_imported: parsedQty,
          stock_before: currentStock,
          stock_after: newStock,
        });
      }

      if (purchaseOrderId && totalCost > 0) {
        await tx.purchaseOrder.update({
          where: { purchase_order_id: purchaseOrderId },
          data: { subtotal: totalCost },
        });
      }

      return {
        total_items: processedItems.length,
        total_quantity: totalQty,
        purchase_order_id: purchaseOrderId,
        items: processedItems,
      };
    });

    return successResponse(
      res,
      result,
      `Nhập kho thành công ${result.total_quantity} sản phẩm (${result.total_items} mặt hàng)!`,
      201
    );
  } catch (error) {
    return errorResponse(res, error.message || 'Lỗi nhập hàng vào kho', 400);
  }
}

// [POST] /api/inventory/export (Xuất kho / Xuất thêm - Hỗ trợ nhiều mặt hàng)
async function exportStock(req, res, next) {
  try {
    const { transaction_type = 'adjustment', reason, note } = req.body;

    const rawItems = Array.isArray(req.body.items) && req.body.items.length > 0
      ? req.body.items
      : [{
          variant_id: req.body.variant_id,
          quantity: req.body.quantity,
        }];

    if (!rawItems || rawItems.length === 0) {
      return errorResponse(res, 'Vui lòng cung cấp danh sách mặt hàng cần xuất', 400);
    }

    const validTypes = ['adjustment', 'damage', 'sale'];
    const finalType = validTypes.includes(transaction_type) ? transaction_type : 'adjustment';
    const userId = req.user?.user_id ? BigInt(req.user.user_id) : null;
    let totalQty = 0;

    const result = await prisma.$transaction(async (tx) => {
      const processedItems = [];

      for (const item of rawItems) {
        const variant_id = item.variant_id ? BigInt(item.variant_id) : null;
        const parsedQty = parseInt(item.quantity, 10);

        if (!variant_id || isNaN(parsedQty) || parsedQty <= 0) {
          throw new Error(`Số lượng xuất cho biến thể #${item.variant_id || 'chưa chọn'} phải lớn hơn 0`);
        }

        const variant = await tx.productVariant.findUnique({
          where: { variant_id },
          include: { product: { select: { product_name: true } } },
        });

        if (!variant) {
          throw new Error(`Phiên bản sản phẩm #${item.variant_id} không tồn tại`);
        }

        const currentStock = variant.stock;
        if (currentStock < parsedQty) {
          throw new Error(
            `Mặt hàng "${variant.product.product_name} - ${variant.variant_name}" (SKU: ${variant.sku}) chỉ còn ${currentStock} chiếc trong kho, không đủ để xuất ${parsedQty} chiếc!`
          );
        }

        const newStock = currentStock - parsedQty;

        // 1. Update stock
        await tx.productVariant.update({
          where: { variant_id },
          data: { stock: newStock },
        });

        // 2. Insert transaction with negative delta
        const reasonText = reason || note || 'Xuất kho điều chỉnh';
        const itemNote = `Xuất ${parsedQty} sản phẩm: ${reasonText}`;
        const txRecord = await tx.inventoryTransaction.create({
          data: {
            variant_id,
            created_by: userId,
            transaction_type: finalType,
            quantity_delta: -parsedQty,
            stock_after: newStock,
            note: itemNote,
          },
        });

        totalQty += parsedQty;
        processedItems.push({
          transaction_id: txRecord.inventory_transaction_id,
          variant_id,
          product_name: variant.product.product_name,
          variant_name: variant.variant_name,
          sku: variant.sku,
          quantity_exported: parsedQty,
          stock_before: currentStock,
          stock_after: newStock,
          transaction_type: finalType,
        });
      }

      return {
        total_items: processedItems.length,
        total_quantity: totalQty,
        transaction_type: finalType,
        items: processedItems,
      };
    });

    return successResponse(
      res,
      result,
      `Xuất kho thành công ${result.total_quantity} sản phẩm (${result.total_items} mặt hàng)!`,
      201
    );
  } catch (error) {
    return errorResponse(res, error.message || 'Lỗi xuất kho', 400);
  }
}

// [GET] /api/inventory/suppliers (Danh sách nhà cung cấp)
async function getSuppliers(req, res, next) {
  try {
    const suppliers = await prisma.supplier.findMany({
      orderBy: { supplier_name: 'asc' },
    });
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

    const created = await prisma.supplier.create({
      data: {
        supplier_name: supplier_name.trim(),
        phone: phone?.trim() || null,
        email: email?.trim() || null,
      },
    });

    return successResponse(
      res,
      {
        supplier_id: created.supplier_id,
        supplier_name: created.supplier_name,
        phone: created.phone,
        email: created.email,
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
