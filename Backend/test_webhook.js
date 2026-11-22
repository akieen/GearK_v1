/**
 * Kịch bản kiểm thử GHN Webhook tự động cho GearK
 * Sử dụng:
 *   node test_webhook.js [OrderCode/TrackingCode] [Status]
 * Ví dụ:
 *   node test_webhook.js GHNDEV57573664 delivered
 *   node test_webhook.js GHNDEV57573664 delivering
 *   node test_webhook.js GHNDEV57573664 transporting
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const prisma = require('./src/config/prisma');

const STATUS_DESCRIPTIONS = {
  picking: 'Bưu tá GHN đang đến địa chỉ kho lấy hàng',
  storing: 'Kiện hàng đã nhập kho phân loại GHN',
  transporting: 'Kiện hàng đang luân chuyển giữa các bưu cục',
  sorting: 'Kiện hàng đang được phân loại tại trung tâm khai thác',
  delivering: 'Bưu tá GHN đang trên đường giao hàng đến người nhận',
  delivered: 'Giao hàng thành công cho khách hàng',
  delivery_fail: 'Giao hàng thất bại: Khách hàng hẹn lại thời gian giao',
  waiting_to_return: 'Chờ chuyển hoàn về cho người gửi',
  return: 'Đang chuyển hoàn hàng về kho shop',
  returned: 'Đã hoàn trả hàng về kho shop thành công',
  cancel: 'Đơn hàng đã được hủy trên hệ thống GHN',
};

async function main() {
  try {
    const args = process.argv.slice(2);
    let targetCode = args[0];
    let targetStatus = (args[1] || 'delivered').toLowerCase();

    // Nếu không truyền mã, tự động tìm mã vận đơn mới nhất trong hệ thống
    if (!targetCode) {
      const latestShipment = await prisma.shipment.findFirst({
        orderBy: { created_at: 'desc' },
        include: { order: true },
      });

      if (!latestShipment) {
        console.log('❌ Chưa có vận đơn nào trong hệ thống. Vui lòng tạo vận đơn trước trên web Admin!');
        process.exit(1);
      }

      targetCode = latestShipment.tracking_code;
      console.log(`📌 Tự động chọn vận đơn mới nhất: ${targetCode} (Đơn #${latestShipment.order?.order_code})`);
    }

    const port = process.env.PORT || 5000;
    const webhookUrl = `http://localhost:${port}/api/shipping/webhook/ghn`;
    const description = STATUS_DESCRIPTIONS[targetStatus] || `Cập nhật trạng thái GHN: ${targetStatus}`;

    const payload = {
      OrderCode: targetCode,
      Status: targetStatus,
      Warehouse: 'Kho GHN Tân Bình - TP.HCM',
      Description: description,
      Reason: targetStatus === 'delivery_fail' ? 'Khách hàng bận họp, hẹn giao lại vào ngày mai' : '',
      Time: new Date().toISOString(),
    };

    console.log('\n======================================================');
    console.log('🚀 ĐANG GỬI WEBHOOK GIẢ LẬP TỪ GHN SANG BACKEND...');
    console.log(`🌐 Endpoint: ${webhookUrl}`);
    console.log('📦 Dữ liệu gửi đi:', JSON.stringify(payload, null, 2));
    console.log('======================================================\n');

    try {
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json().catch(() => ({}));

      console.log(`📡 Phản hồi từ Server: HTTP ${res.status}`);
      console.log('📄 Kết quả:', result);

      if (res.ok) {
        console.log('\n✅ BẮN WEBHOOK THÀNH CÔNG!');
      } else {
        console.log('\n❌ WEBHOOK THẤT BẠI:', result.message || 'Lỗi không xác định');
      }
    } catch (err) {
      console.warn('⚠️ Server HTTP không phản hồi (' + err.message + ').');
      console.log('🔄 Đang tự động xử lý cập nhật trực tiếp qua Database...');

      // Tự động xử lý như webhook nội bộ
      await prisma.shippingWebhookLog.create({
        data: {
          provider: 'GHN',
          order_code: String(targetCode),
          event_type: targetStatus,
          payload: JSON.stringify(payload),
          status: 'processed',
        },
      });

      const shipment = await prisma.shipment.findFirst({
        where: {
          OR: [
            { tracking_code: String(targetCode) },
            { order: { order_code: String(targetCode) } },
          ],
        },
        include: { order: true },
      });

      if (shipment) {
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
        const normalizedStatus = statusMap[targetStatus] || 'IN_TRANSIT';

        await prisma.shipment.update({
          where: { shipment_id: shipment.shipment_id },
          data: { status: targetStatus },
        });

        await prisma.shipmentHistory.create({
          data: {
            shipment_id: shipment.shipment_id,
            status: normalizedStatus,
            ghn_status: targetStatus,
            location: payload.Warehouse,
            note: payload.Description,
          },
        });

        const orderUpdate = {
          shipping_status: normalizedStatus,
        };
        if (['delivered'].includes(targetStatus)) {
          orderUpdate.order_status = 'completed';
          orderUpdate.payment_status = 'paid';
        } else if (['cancel'].includes(targetStatus)) {
          orderUpdate.order_status = 'cancelled';
        } else if (['delivering', 'transporting', 'picking'].includes(targetStatus)) {
          orderUpdate.order_status = 'shipping';
        }

        await prisma.order.update({
          where: { order_id: shipment.order_id },
          data: orderUpdate,
        });

        console.log('✅ ĐÃ ĐỒNG BỘ TRỰC TIẾP VÀO DATABASE THÀNH CÔNG!');
      } else {
        console.log('❌ Không tìm thấy vận đơn/đơn hàng với mã:', targetCode);
      }
    }

    // Kiểm tra lại dữ liệu trong database
    const updatedOrder = await prisma.order.findFirst({
      where: {
        OR: [
          { tracking_code: targetCode },
          { order_code: targetCode },
        ],
      },
      include: { shipments: { include: { histories: { take: 1, orderBy: { history_id: 'desc' } } } } },
    });

    if (updatedOrder) {
      console.log('\n📊 TRẠNG THÁI HIỆN TẠI CỦA ĐƠN HÀNG TRÊN DATABASE:');
      console.log(`• Mã đơn hàng: #${updatedOrder.order_code}`);
      console.log(`• Mã vận đơn: ${updatedOrder.tracking_code || '(Chưa có)'}`);
      console.log(`• Trạng thái đơn (order_status): ${updatedOrder.order_status}`);
      console.log(`• Trạng thái vận chuyển (shipping_status): ${updatedOrder.shipping_status}`);
      console.log(`• Trạng thái thanh toán (payment_status): ${updatedOrder.payment_status}`);
      if (updatedOrder.shipments[0]?.histories[0]) {
        console.log(`• Lịch sử mới nhất: [${updatedOrder.shipments[0].histories[0].status}] ${updatedOrder.shipments[0].histories[0].note}`);
      }
    }
  } finally {
    await prisma.$disconnect();
  }
}

main();
