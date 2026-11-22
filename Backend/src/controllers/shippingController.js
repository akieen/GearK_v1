const prisma = require('../config/prisma');
const ghnService = require('../services/ghnService');
const { successResponse, errorResponse } = require('../utils/helpers');
const path = require('path');
const fs = require('fs');

// Đọc dữ liệu dự phòng các tỉnh thành nếu GHN API bị lỗi hoặc không có mạng
let localProvincesData = [];
try {
  const localFile = path.join(__dirname, '../data/vietnamProvinces2025.json');
  if (fs.existsSync(localFile)) {
    localProvincesData = JSON.parse(fs.readFileSync(localFile, 'utf8'));
  }
} catch (e) {
  console.warn('[Shipping] Không nạp được vietnamProvinces2025.json:', e.message);
}

// 1. Danh sách Tỉnh / Thành phố
async function getProvinces(req, res, next) {
  try {
    let provinces = await ghnService.getProvinces();
    if (!provinces || provinces.length === 0) {
      // Fallback từ localProvincesData
      provinces = localProvincesData.map((p) => ({
        province_id: p.code,
        province_name: p.name,
        code: String(p.code),
      }));
    }
    return successResponse(res, provinces, 'Danh sách Tỉnh / Thành phố');
  } catch (error) {
    next(error);
  }
}

// 2. Danh sách Quận / Huyện theo Tỉnh
async function getDistricts(req, res, next) {
  try {
    const provinceId = parseInt(req.query.province_id, 10);
    if (!provinceId) {
      return errorResponse(res, 'Vui lòng cung cấp province_id', 400);
    }

    let districts = await ghnService.getDistricts(provinceId);
    if (!districts || districts.length === 0) {
      // Fallback
      const p = localProvincesData.find((x) => x.code === provinceId);
      districts = [
        {
          district_id: provinceId,
          district_name: p ? p.name : 'Khu vực chính',
          province_id: provinceId,
          code: String(provinceId),
        },
      ];
    }
    return successResponse(res, districts, 'Danh sách Quận / Huyện');
  } catch (error) {
    next(error);
  }
}

// 3. Danh sách Phường / Xã theo Quận
async function getWards(req, res, next) {
  try {
    const districtId = parseInt(req.query.district_id, 10);
    if (!districtId) {
      return errorResponse(res, 'Vui lòng cung cấp district_id', 400);
    }

    let wards = await ghnService.getWards(districtId);
    if (!wards || wards.length === 0) {
      // Fallback: Tìm trong local data theo code tỉnh/quận
      const p = localProvincesData.find((x) => x.code === districtId);
      if (p && Array.isArray(p.wards)) {
        wards = p.wards.map((w) => ({
          ward_code: String(w.code),
          ward_name: w.name,
          district_id: districtId,
        }));
      } else {
        wards = [];
      }
    }
    return successResponse(res, wards, 'Danh sách Phường / Xã');
  } catch (error) {
    next(error);
  }
}

// 4. Lấy danh sách gói dịch vụ giao hàng GHN
async function getAvailableServices(req, res, next) {
  try {
    const { from_district, to_district } = req.body;
    if (!to_district) {
      return errorResponse(res, 'Vui lòng cung cấp to_district', 400);
    }
    const services = await ghnService.getAvailableServices({ from_district, to_district });
    return successResponse(res, services, 'Danh sách dịch vụ vận chuyển khả dụng');
  } catch (error) {
    next(error);
  }
}

// 5. Tính phí vận chuyển (Customer & Admin)
async function calculateFee(req, res, next) {
  try {
    const {
      to_district_id,
      to_ward_code,
      service_id,
      service_type_id,
      weight,
      items,
      insurance_value = 0,
    } = req.body;

    if (!to_district_id) {
      return errorResponse(res, 'Vui lòng cung cấp to_district_id để tính phí ship', 400);
    }

    // Tính tổng khối lượng dựa trên items nếu không truyền trực tiếp weight
    let totalWeight = parseInt(weight, 10) || 0;
    if (!totalWeight && Array.isArray(items) && items.length > 0) {
      for (const it of items) {
        const qty = parseInt(it.quantity, 10) || 1;
        let itemWeight = parseInt(it.weight, 10);
        if (!itemWeight && it.variant_id) {
          const v = await prisma.productVariant.findUnique({
            where: { variant_id: BigInt(it.variant_id) },
            select: { weight: true },
          });
          itemWeight = v?.weight || 500;
        }
        totalWeight += (itemWeight || 500) * qty;
      }
    }
    if (!totalWeight || totalWeight < 100) totalWeight = 500;

    const feeResult = await ghnService.calculateFee({
      to_district_id,
      to_ward_code,
      service_id,
      service_type_id,
      weight: totalWeight,
      insurance_value,
    });

    return successResponse(res, feeResult, 'Tính cước vận chuyển thành công');
  } catch (error) {
    next(error);
  }
}

// 6. Admin tạo vận đơn GHN cho đơn hàng
async function createShipment(req, res, next) {
  try {
    const orderId = BigInt(req.params.orderId);
    const {
      required_note = 'CHOXEMHANGKHONGTHU',
      note,
      weight: customWeight,
      service_id,
      to_district_id,
      to_ward_code,
    } = req.body;

    const order = await prisma.order.findUnique({
      where: { order_id: orderId },
      include: {
        address: true,
        user: { select: { full_name: true, email: true } },
        items: {
          include: {
            variant: { select: { sku: true, weight: true } },
          },
        },
        shipments: {
          where: {
            status: { notIn: ['cancel', 'cancelled'] },
          },
        },
      },
    });

    if (!order) {
      return errorResponse(res, 'Không tìm thấy đơn hàng', 404);
    }

    // Kiểm tra xem đơn hàng đã có vận đơn đang chạy chưa
    if (order.shipments && order.shipments.length > 0) {
      return errorResponse(
        res,
        `Đơn hàng đã có vận đơn GHN đang hoạt động (${order.shipments[0].tracking_code})`,
        400
      );
    }

    const recipientName = order.address?.recipient_name || order.user?.full_name || 'Khách hàng';
    const recipientPhone = order.address?.recipient_phone || '0987654321';
    const streetAddress = order.address?.street_address || '';
    const finalDistrictId = to_district_id || order.address?.district_id || 1442;
    const finalWardCode = to_ward_code || order.address?.ward_code || '20308';

    if (!recipientName || !recipientPhone || !streetAddress) {
      return errorResponse(res, 'Đơn hàng thiếu thông tin người nhận hoặc địa chỉ giao hàng', 400);
    }

    // Tính COD: Nếu đã thanh toán (paid/VNPay) => COD = 0, nếu chưa thanh toán (COD) => COD = total_amount
    const isPaid = order.payment_status === 'paid';
    const codAmount = isPaid ? 0 : Math.round(Number(order.total_amount));
    const insuranceValue = Math.min(5000000, Math.round(Number(order.total_amount)));

    // Tính tổng khối lượng
    let totalWeight = parseInt(customWeight, 10) || 0;
    if (!totalWeight) {
      totalWeight = order.items.reduce((sum, it) => {
        const itemW = it.variant?.weight || 500;
        return sum + itemW * it.quantity;
      }, 0);
    }
    if (!totalWeight || totalWeight < 100) totalWeight = 500;

    // Chuẩn bị danh sách sản phẩm
    const itemsPayload = order.items.map((it) => ({
      product_name: it.product_name,
      sku: it.variant?.sku || `SKU-${it.variant_id}`,
      quantity: it.quantity,
      unit_price: Math.round(Number(it.unit_price)),
      weight: it.variant?.weight || 500,
    }));

    // Gọi API GHN
    const ghnResult = await ghnService.createShippingOrder({
      to_name: recipientName,
      to_phone: recipientPhone,
      to_address: streetAddress,
      to_ward_code: finalWardCode,
      to_district_id: finalDistrictId,
      weight: totalWeight,
      service_id: service_id || order.shipping_service_id || undefined,
      cod_amount: codAmount,
      insurance_value: insuranceValue,
      client_order_code: order.order_code,
      required_note,
      content: note || `Đơn hàng GearK #${order.order_code}`,
      items: itemsPayload,
    });

    const trackingCode = ghnResult.order_code;

    // Lưu vào bảng shipments
    const newShipment = await prisma.shipment.create({
      data: {
        order_id: order.order_id,
        tracking_code: trackingCode,
        provider: 'GHN',
        service_id: service_id ? parseInt(service_id, 10) : (order.shipping_service_id || null),
        service_name: order.shipping_service_name || 'Giao Hàng Nhanh (Tiêu chuẩn)',
        shipping_fee: ghnResult.total_fee || order.shipping_fee || 0,
        cod_amount: codAmount,
        insurance_value: insuranceValue,
        status: 'ready_to_pick',
        expected_delivery_at: ghnResult.expected_delivery_time ? new Date(ghnResult.expected_delivery_time) : null,
        raw_response: JSON.stringify(ghnResult.raw || ghnResult),
      },
    });

    // Lưu vào bảng shipment_histories
    await prisma.shipmentHistory.create({
      data: {
        shipment_id: newShipment.shipment_id,
        status: 'WAITING_PICKUP',
        ghn_status: 'ready_to_pick',
        note: 'Đã tạo vận đơn trên GHN thành công. Chờ bưu tá lấy hàng.',
      },
    });

    // Cập nhật lại đơn hàng nội bộ
    const newOrderStatus = ['pending', 'confirmed'].includes(order.order_status)
      ? 'shipping'
      : order.order_status;

    await prisma.order.update({
      where: { order_id: order.order_id },
      data: {
        tracking_code: trackingCode,
        shipping_status: 'WAITING_PICKUP',
        order_status: newOrderStatus,
      },
    });

    // Ghi nhận lịch sử trạng thái đơn hàng
    await prisma.orderStatusHistory.create({
      data: {
        order_id: order.order_id,
        changed_by: BigInt(req.user.user_id),
        old_status: order.order_status,
        new_status: newOrderStatus,
      },
    });

    return successResponse(
      res,
      {
        shipment_id: newShipment.shipment_id,
        tracking_code: trackingCode,
        expected_delivery_at: newShipment.expected_delivery_at,
        cod_amount: codAmount,
        shipping_fee: newShipment.shipping_fee,
      },
      `Tạo vận đơn GHN thành công! Mã vận đơn: ${trackingCode}`,
      201
    );
  } catch (error) {
    const errorDetails = error.response?.data?.message || error.message;
    return errorResponse(res, `Lỗi tạo vận đơn GHN: ${errorDetails}`, 400);
  }
}

// 7. Admin Hủy vận đơn GHN
async function cancelShipment(req, res, next) {
  try {
    const orderId = BigInt(req.params.orderId);

    const shipment = await prisma.shipment.findFirst({
      where: {
        order_id: orderId,
        status: { notIn: ['cancel', 'cancelled'] },
      },
      include: { order: true },
    });

    if (!shipment) {
      return errorResponse(res, 'Không tìm thấy vận đơn GHN đang hoạt động của đơn hàng này', 404);
    }

    if (shipment.status === 'delivered') {
      return errorResponse(res, 'Vận đơn đã được giao thành công, không thể hủy', 400);
    }

    // Gọi API GHN hủy đơn
    try {
      await ghnService.cancelShippingOrder(shipment.tracking_code);
    } catch (ghnErr) {
      console.warn('[GHN Cancel Warning]:', ghnErr.response?.data || ghnErr.message);
    }

    // Cập nhật shipment
    await prisma.shipment.update({
      where: { shipment_id: shipment.shipment_id },
      data: { status: 'cancel' },
    });

    // Lưu lịch sử vận đơn
    await prisma.shipmentHistory.create({
      data: {
        shipment_id: shipment.shipment_id,
        status: 'CANCELLED',
        ghn_status: 'cancel',
        note: `Vận đơn đã được hủy bởi quản trị viên (${req.user.full_name || 'Admin'})`,
      },
    });

    // Cập nhật order
    await prisma.order.update({
      where: { order_id: orderId },
      data: {
        shipping_status: 'CANCELLED',
      },
    });

    return successResponse(res, null, `Đã hủy vận đơn GHN (${shipment.tracking_code}) thành công`);
  } catch (error) {
    next(error);
  }
}

// 8. Admin lấy Token & Link in vận đơn A5
async function getPrintToken(req, res, next) {
  try {
    const { orderCode } = req.params;
    if (!orderCode) {
      return errorResponse(res, 'Vui lòng cung cấp mã vận đơn', 400);
    }

    const printResult = await ghnService.printOrderToken(orderCode);
    return successResponse(res, printResult, 'Lấy link in phiếu gửi hàng thành công');
  } catch (error) {
    const errorDetails = error.response?.data?.message || error.message;
    return errorResponse(res, `Không thể lấy link in từ GHN: ${errorDetails}`, 400);
  }
}

// 9. Tra cứu tiến trình vận chuyển theo tracking_code hoặc order_code
async function getTrackingInfo(req, res, next) {
  try {
    const { code } = req.params;
    if (!code) {
      return errorResponse(res, 'Vui lòng cung cấp mã vận đơn hoặc mã đơn hàng', 400);
    }

    // Tìm theo tracking_code hoặc order_code
    let shipment = await prisma.shipment.findFirst({
      where: {
        OR: [
          { tracking_code: code },
          { order: { order_code: code } },
        ],
      },
      include: {
        order: {
          select: {
            order_id: true,
            order_code: true,
            total_amount: true,
            shipping_fee: true,
            shipping_status: true,
            order_status: true,
            payment_status: true,
            created_at: true,
            address: true,
            items: {
              select: {
                product_name: true,
                variant_name: true,
                quantity: true,
              },
            },
          },
        },
        histories: {
          orderBy: { created_at: 'desc' },
        },
      },
    });

    if (!shipment) {
      return errorResponse(res, 'Không tìm thấy thông tin vận đơn', 404);
    }

    // Nếu đơn hàng đang chạy, có thể thử gọi GHN API để lấy detail mới nhất
    let liveDetail = null;
    if (!['delivered', 'cancel', 'cancelled'].includes(shipment.status)) {
      try {
        liveDetail = await ghnService.getOrderDetail(shipment.tracking_code);
      } catch (err) {
        // Silent catch
      }
    }

    return successResponse(
      res,
      {
        shipment,
        live_detail: liveDetail,
      },
      'Thông tin theo dõi vận chuyển'
    );
  } catch (error) {
    next(error);
  }
}

// 10. Webhook nhận cập nhật trạng thái từ GHN
async function webhookGHN(req, res, next) {
  try {
    const payload = req.body || {};
    const orderCode = payload.OrderCode || payload.order_code || payload.client_order_code;
    const ghnStatus = (payload.Status || payload.status || '').toLowerCase();

    // 1. Ghi log webhook
    await prisma.shippingWebhookLog.create({
      data: {
        provider: 'GHN',
        order_code: orderCode ? String(orderCode) : null,
        event_type: ghnStatus || 'status_update',
        payload: JSON.stringify(payload),
        status: 'processed',
      },
    });

    if (!orderCode) {
      return res.status(200).json({ success: true, message: 'Webhook received without order code' });
    }

    // 2. Tìm shipment tương ứng
    const shipment = await prisma.shipment.findFirst({
      where: {
        OR: [
          { tracking_code: String(orderCode) },
          { order: { order_code: String(orderCode) } },
        ],
      },
      include: { order: true },
    });

    if (!shipment) {
      return res.status(200).json({ success: true, message: 'Shipment not found in local system' });
    }

    // 3. Chuẩn hóa trạng thái website
    const statusMap = {
      ready_to_pick: 'WAITING_PICKUP',
      picking: 'PICKING',
      storing: 'IN_TRANSIT',
      transporting: 'IN_TRANSIT',
      sorting: 'IN_TRANSIT',
      delivering: 'DELIVERING',
      delivered: 'DELIVERED',
      delivery_fail: 'DELIVERY_FAILED',
      waiting_to_return: 'RETURNING',
      return: 'RETURNING',
      returned: 'RETURNED',
      cancel: 'CANCELLED',
    };

    const normalizedStatus = statusMap[ghnStatus] || 'IN_TRANSIT';

    // 4. Cập nhật shipment
    await prisma.shipment.update({
      where: { shipment_id: shipment.shipment_id },
      data: {
        status: ghnStatus,
      },
    });

    // 5. Thêm lịch sử vận chuyển
    await prisma.shipmentHistory.create({
      data: {
        shipment_id: shipment.shipment_id,
        status: normalizedStatus,
        ghn_status: ghnStatus,
        location: payload.Warehouse || payload.warehouse || null,
        note: payload.Description || payload.description || payload.Reason || `Cập nhật trạng thái GHN: ${ghnStatus}`,
      },
    });

    // 6. Cập nhật trạng thái đơn hàng
    const orderUpdate = {
      shipping_status: normalizedStatus,
    };

    if (ghnStatus === 'delivered') {
      orderUpdate.order_status = 'completed';
      orderUpdate.payment_status = 'paid';
    } else if (ghnStatus === 'cancel') {
      orderUpdate.shipping_status = 'CANCELLED';
      orderUpdate.order_status = 'cancelled';
    } else if (['transporting', 'delivering', 'picking'].includes(ghnStatus)) {
      orderUpdate.order_status = 'shipping';
    }

    await prisma.order.update({
      where: { order_id: shipment.order_id },
      data: orderUpdate,
    });

    return res.status(200).json({
      success: true,
      message: 'GHN Webhook processed successfully',
    });
  } catch (error) {
    console.error('[GHN Webhook Error]:', error);
    // Luôn trả 200 cho GHN để tránh GHN spam retry không cần thiết
    return res.status(200).json({ success: false, error: error.message });
  }
}

module.exports = {
  getProvinces,
  getDistricts,
  getWards,
  getAvailableServices,
  calculateFee,
  createShipment,
  cancelShipment,
  getPrintToken,
  getTrackingInfo,
  webhookGHN,
};
