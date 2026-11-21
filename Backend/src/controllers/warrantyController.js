const prisma = require('../config/prisma');

// 1. Khách hàng tạo yêu cầu bảo hành cho một sản phẩm trong đơn hàng đã hoàn tất
exports.createClaim = async (req, res) => {
  try {
    const userId = BigInt(req.user.user_id);
    const { order_id, order_item_id, product_name, serial_number, issue_description, image_urls } = req.body;

    if (!order_id || !issue_description?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp mã đơn hàng và mô tả chi tiết lỗi sản phẩm!'
      });
    }

    // Kiểm tra đơn hàng
    const order = await prisma.order.findUnique({
      where: { order_id: BigInt(order_id) },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: { select: { thumbnail_url: true } }
              }
            }
          }
        }
      }
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Đơn hàng không tồn tại' });
    }

    if (order.user_id !== userId) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền gửi bảo hành cho đơn hàng này' });
    }

    if (order.order_status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Chỉ có thể gửi yêu cầu bảo hành cho đơn hàng đã hoàn thành (giao thành công)!'
      });
    }

    let selectedItem = null;
    let finalProductName = product_name?.trim();

    if (order_item_id) {
      selectedItem = order.items.find(i => i.order_item_id === BigInt(order_item_id));
      if (!selectedItem) {
        return res.status(400).json({ success: false, message: 'Sản phẩm không thuộc đơn hàng này' });
      }

      // Kiểm tra xem sản phẩm này đã có yêu cầu nào đang trong tiến trình xử lý chưa
      const existingClaim = await prisma.warrantyClaim.findFirst({
        where: {
          order_item_id: BigInt(order_item_id),
          status: { in: ['pending', 'approved', 'repairing'] }
        }
      });

      if (existingClaim) {
        return res.status(400).json({
          success: false,
          message: `Sản phẩm này hiện đang có yêu cầu bảo hành (#WC-${existingClaim.claim_id}) đang được xử lý!`
        });
      }

      if (!finalProductName) {
        finalProductName = selectedItem.variant_name
          ? `${selectedItem.product_name} - ${selectedItem.variant_name}`
          : selectedItem.product_name;
      }
    }

    if (!finalProductName) {
      finalProductName = 'Sản phẩm GearK';
    }

    // Format image_urls nếu là array hoặc string
    let formattedImages = null;
    if (image_urls) {
      if (Array.isArray(image_urls)) {
        formattedImages = JSON.stringify(image_urls);
      } else if (typeof image_urls === 'string') {
        formattedImages = image_urls;
      }
    }

    const claim = await prisma.warrantyClaim.create({
      data: {
        order_id: BigInt(order_id),
        order_item_id: order_item_id ? BigInt(order_item_id) : null,
        user_id: userId,
        product_name: finalProductName,
        serial_number: serial_number ? serial_number.trim() : null,
        issue_description: issue_description.trim(),
        image_urls: formattedImages,
        status: 'pending'
      }
    });

    res.status(201).json({
      success: true,
      message: 'Gửi yêu cầu bảo hành thành công! Đội ngũ kỹ thuật GearK sẽ kiểm tra và phản hồi sớm nhất.',
      data: claim
    });
  } catch (error) {
    console.error('Lỗi createClaim:', error);
    res.status(500).json({ success: false, message: 'Lỗi server khi tạo yêu cầu bảo hành', error: error.message });
  }
};

// 2. Khách hàng xem danh sách yêu cầu bảo hành của mình
exports.getMyClaims = async (req, res) => {
  try {
    const userId = BigInt(req.user.user_id);
    const claims = await prisma.warrantyClaim.findMany({
      where: { user_id: userId },
      include: {
        order: {
          select: { order_id: true, order_code: true, created_at: true, order_status: true }
        },
        order_item: {
          include: {
            variant: {
              include: {
                product: { select: { thumbnail_url: true } }
              }
            }
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    const formattedClaims = claims.map(c => ({
      ...c,
      thumbnail_url: c.order_item?.variant?.product?.thumbnail_url || null,
      variant_name: c.order_item?.variant_name || null
    }));

    res.json({
      success: true,
      data: formattedClaims
    });
  } catch (error) {
    console.error('Lỗi getMyClaims:', error);
    res.status(500).json({ success: false, message: 'Lỗi server khi lấy danh sách bảo hành', error: error.message });
  }
};

// 3. Khách hàng lấy danh sách các sản phẩm đủ điều kiện bảo hành (từ các đơn hàng đã completed)
exports.getEligibleItems = async (req, res) => {
  try {
    const userId = BigInt(req.user.user_id);

    // Lấy các đơn hàng đã hoàn tất của user
    const orders = await prisma.order.findMany({
      where: {
        user_id: userId,
        order_status: 'completed'
      },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: { select: { thumbnail_url: true } }
              }
            }
          }
        },
        warranty_claims: true
      },
      orderBy: { created_at: 'desc' }
    });

    const eligibleItems = [];

    for (const order of orders) {
      for (const item of order.items) {
        // Kiểm tra xem item này có claim nào đang pending/approved/repairing không
        const activeClaim = order.warranty_claims?.find(
          c => c.order_item_id === item.order_item_id && ['pending', 'approved', 'repairing'].includes(c.status)
        );

        // Tính thời hạn bảo hành
        const orderDate = new Date(order.created_at);
        const warrantyMonths = item.variant?.warranty_months || 12;
        const warrantyExpiry = new Date(orderDate);
        warrantyExpiry.setMonth(warrantyExpiry.getMonth() + warrantyMonths);

        const isExpired = new Date() > warrantyExpiry;

        eligibleItems.push({
          order_id: order.order_id,
          order_code: order.order_code,
          order_date: order.created_at,
          order_item_id: item.order_item_id,
          product_name: item.product_name,
          variant_name: item.variant_name,
          thumbnail_url: item.variant?.product?.thumbnail_url || null,
          unit_price: item.unit_price,
          quantity: item.quantity,
          warranty_months: warrantyMonths,
          warranty_expiry: warrantyExpiry,
          is_expired: isExpired,
          has_active_claim: !!activeClaim,
          active_claim_id: activeClaim?.claim_id || null,
          active_claim_status: activeClaim?.status || null
        });
      }
    }

    res.json({
      success: true,
      data: eligibleItems
    });
  } catch (error) {
    console.error('Lỗi getEligibleItems:', error);
    res.status(500).json({ success: false, message: 'Lỗi server khi lấy danh sách sản phẩm', error: error.message });
  }
};

// 4. Admin / Staff lấy toàn bộ yêu cầu bảo hành với phân trang và thống kê
exports.getAllClaims = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10));
    const take = Math.max(1, parseInt(limit, 10));
    const skip = (pageNum - 1) * take;

    const where = {};
    if (status && status !== 'all') {
      where.status = status;
    }

    if (search && search.trim()) {
      const q = search.trim();
      const numQuery = parseInt(q.replace(/\D/g, ''), 10);

      where.OR = [
        { product_name: { contains: q } },
        { serial_number: { contains: q } },
        { issue_description: { contains: q } },
        { order: { order_code: { contains: q } } },
        { user: { full_name: { contains: q } } },
        { user: { email: { contains: q } } }
      ];

      if (!isNaN(numQuery)) {
        where.OR.push({ claim_id: BigInt(numQuery) });
      }
    }

    const [total, claims, statusCounts] = await Promise.all([
      prisma.warrantyClaim.count({ where }),
      prisma.warrantyClaim.findMany({
        where,
        include: {
          user: {
            select: {
              user_id: true,
              full_name: true,
              email: true
            }
          },
          order: {
            select: {
              order_id: true,
              order_code: true,
              created_at: true,
              order_status: true,
              total_amount: true,
              address: {
                select: {
                  recipient_name: true,
                  recipient_phone: true
                }
              }
            }
          },
          order_item: {
            include: {
              variant: {
                include: {
                  product: { select: { thumbnail_url: true } }
                }
              }
            }
          }
        },
        orderBy: { created_at: 'desc' },
        skip,
        take
      }),
      // Đếm số lượng theo từng trạng thái để hiển thị badge
      Promise.all([
        prisma.warrantyClaim.count(),
        prisma.warrantyClaim.count({ where: { status: 'pending' } }),
        prisma.warrantyClaim.count({ where: { status: 'approved' } }),
        prisma.warrantyClaim.count({ where: { status: 'repairing' } }),
        prisma.warrantyClaim.count({ where: { status: 'completed' } }),
        prisma.warrantyClaim.count({ where: { status: 'rejected' } })
      ])
    ]);

    const formattedClaims = claims.map(c => ({
      ...c,
      phone_number: c.order?.address?.recipient_phone || null,
      thumbnail_url: c.order_item?.variant?.product?.thumbnail_url || null
    }));

    const counts = {
      all: statusCounts[0],
      pending: statusCounts[1],
      approved: statusCounts[2],
      repairing: statusCounts[3],
      completed: statusCounts[4],
      rejected: statusCounts[5]
    };

    res.json({
      success: true,
      data: formattedClaims,
      counts,
      pagination: {
        total,
        page: pageNum,
        limit: take,
        totalPages: Math.ceil(total / take)
      }
    });
  } catch (error) {
    console.error('Lỗi getAllClaims:', error);
    res.status(500).json({ success: false, message: 'Lỗi server khi lấy danh sách bảo hành', error: error.message });
  }
};

// 5. Admin / Staff cập nhật trạng thái & ghi chú bảo hành
exports.updateClaimStatus = async (req, res) => {
  try {
    const claimId = BigInt(req.params.id);
    const { status, admin_note } = req.body;

    const validStatuses = ['pending', 'approved', 'repairing', 'completed', 'rejected'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Trạng thái không hợp lệ. Cho phép: ${validStatuses.join(', ')}`
      });
    }

    const existing = await prisma.warrantyClaim.findUnique({
      where: { claim_id: claimId }
    });

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Yêu cầu bảo hành không tồn tại' });
    }

    const updated = await prisma.warrantyClaim.update({
      where: { claim_id: claimId },
      data: {
        status,
        ...(admin_note !== undefined ? { admin_note: admin_note.trim() } : {})
      },
      include: {
        user: {
          select: { user_id: true, full_name: true, email: true }
        },
        order: {
          select: { order_code: true }
        }
      }
    });

    res.json({
      success: true,
      message: 'Cập nhật trạng thái yêu cầu bảo hành thành công!',
      data: updated
    });
  } catch (error) {
    console.error('Lỗi updateClaimStatus:', error);
    res.status(500).json({ success: false, message: 'Lỗi server khi cập nhật trạng thái bảo hành', error: error.message });
  }
};
