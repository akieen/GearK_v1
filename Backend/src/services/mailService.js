const nodemailer = require('nodemailer');

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  const host = process.env.MAIL_HOST || 'smtp.gmail.com';
  const port = Number(process.env.MAIL_PORT) || 587;
  const user = process.env.MAIL_USERNAME || '';
  const pass = process.env.MAIL_PASSWORD || '';
  const secure = port === 465; // true for 465, false for other ports

  if (!user || !pass) {
    console.warn('[MailService] Cảnh báo: MAIL_USERNAME hoặc MAIL_PASSWORD chưa được cấu hình trong .env');
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  return transporter;
}

/**
 * Gửi email chung
 */
async function sendMail({ to, subject, html, text }) {
  try {
    const fromAddress = process.env.MAIL_FROM_ADDRESS || process.env.MAIL_USERNAME || 'no-reply@geark.vn';
    const fromName = process.env.MAIL_FROM_NAME || 'GearK Gaming Gear';
    const from = `"${fromName}" <${fromAddress}>`;

    const mailOptions = {
      from,
      to,
      subject,
      text: text || '',
      html: html || '',
    };

    const client = getTransporter();
    
    // Nếu chưa cấu hình mail password, chỉ log ra console để không crash luồng
    if (!process.env.MAIL_USERNAME || !process.env.MAIL_PASSWORD) {
      console.log(`[MailService DEMO MODE] Sẽ gửi email tới ${to}:`);
      console.log(`Tiêu đề: ${subject}`);
      if (text) console.log(`Nội dung (text): ${text}`);
      return { success: true, demo: true };
    }

    const info = await client.sendMail(mailOptions);
    console.log(`[MailService] Đã gửi mail thành công tới ${to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[MailService Error] Lỗi khi gửi mail tới ${to}:`, error.message);
    // Không throw lỗi làm chết luồng chính của app, trả về success: false
    return { success: false, error: error.message };
  }
}

/**
 * Gửi email mã OTP xác thực đăng ký tài khoản
 */
async function sendOtpMail({ to, fullName, otpCode, expiresInMinutes = 10 }) {
  const subject = `[GearK] Mã OTP xác thực tài khoản: ${otpCode}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #0f172a; padding: 24px; text-align: center;">
        <h1 style="color: #38bdf8; margin: 0; font-size: 24px; letter-spacing: 1px;">GEARK GAMING STORE</h1>
        <p style="color: #94a3b8; margin: 8px 0 0 0; font-size: 13px;">Thiết bị Gaming Gear & Phụ kiện cao cấp</p>
      </div>

      <div style="padding: 30px 24px;">
        <p style="font-size: 15px; color: #1e293b; margin-top: 0;">Xin chào <strong>${fullName || 'Quý khách'}</strong>,</p>
        <p style="font-size: 14px; color: #475569; line-height: 1.6;">
          Cảm ơn bạn đã lựa chọn đăng ký tài khoản tại <strong>GearK</strong>. Để hoàn tất quy trình kích hoạt tài khoản của bạn, vui lòng sử dụng mã xác thực (OTP) bên dưới:
        </p>

        <div style="text-align: center; margin: 28px 0;">
          <div style="display: inline-block; background-color: #f1f5f9; border: 2px dashed #0284c7; border-radius: 8px; padding: 14px 32px;">
            <span style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #0284c7; font-family: 'Courier New', Courier, monospace;">${otpCode}</span>
          </div>
          <p style="font-size: 12px; color: #64748b; margin-top: 8px;">
            (Mã OTP có hiệu lực trong vòng <strong>${expiresInMinutes} phút</strong>)
          </p>
        </div>

        <p style="font-size: 13px; color: #64748b; line-height: 1.6;">
          <em>Lưu ý an toàn:</em> Tuyệt đối không chia sẻ mã xác thực này cho bất kỳ ai để bảo vệ thông tin tài khoản của bạn.
        </p>
      </div>

      <div style="background-color: #f8fafc; padding: 16px 24px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8;">
        © 2026 GearK Store. Mọi thắc mắc xin vui lòng liên hệ hotline hỗ trợ hoặc phản hồi email này.
      </div>
    </div>
  `;

  return sendMail({
    to,
    subject,
    text: `Mã OTP xác thực tài khoản GearK của bạn là: ${otpCode}. Mã có hiệu lực trong ${expiresInMinutes} phút.`,
    html,
  });
}

/**
 * Gửi email thông báo đặt hàng thành công, chi tiết sản phẩm và chính sách bảo hành
 */
async function sendOrderSuccessMail({
  to,
  recipientName,
  orderCode,
  totalAmount,
  discountAmount = 0,
  paymentMethod = 'COD',
  paymentStatus = 'unpaid',
  shippingAddress,
  recipientPhone,
  items = [],
}) {
  const subject = `[GearK] Xác nhận đặt hàng thành công - Mã đơn #${orderCode}`;

  const formatPrice = (price) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  const itemsHtml = items
    .map((item) => {
      const warrantyInfo = item.warranty_months && item.warranty_months > 0
        ? `<span style="display: inline-block; background-color: #ecfdf5; color: #047857; font-size: 11px; font-weight: bold; padding: 2px 6px; border-radius: 4px; margin-top: 4px;">Bảo hành: ${item.warranty_months} tháng</span>`
        : `<span style="display: inline-block; background-color: #f1f5f9; color: #64748b; font-size: 11px; padding: 2px 6px; border-radius: 4px; margin-top: 4px;">Tiêu chuẩn</span>`;

      return `
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 12px 8px; vertical-align: top;">
            <div style="font-weight: 600; color: #1e293b; font-size: 13.5px;">${item.product_name}</div>
            <div style="font-size: 12px; color: #64748b; margin-top: 2px;">Phân loại: ${item.variant_name}</div>
            ${warrantyInfo}
          </td>
          <td style="padding: 12px 8px; text-align: center; vertical-align: top; font-size: 13px; color: #334155;">
            ${item.quantity}
          </td>
          <td style="padding: 12px 8px; text-align: right; vertical-align: top; font-size: 13px; color: #334155;">
            ${formatPrice(item.unit_price)}
          </td>
          <td style="padding: 12px 8px; text-align: right; vertical-align: top; font-weight: 600; color: #0284c7; font-size: 13px;">
            ${formatPrice(item.line_total)}
          </td>
        </tr>
      `;
    })
    .join('');

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #0f172a; padding: 24px; text-align: center;">
        <h1 style="color: #38bdf8; margin: 0; font-size: 24px; letter-spacing: 1px;">GEARK GAMING STORE</h1>
        <p style="color: #94a3b8; margin: 6px 0 0 0; font-size: 13px;">Cảm ơn bạn đã tin tưởng mua sắm tại GearK!</p>
      </div>

      <div style="padding: 24px;">
        <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px 16px; border-radius: 4px; margin-bottom: 20px;">
          <p style="margin: 0; color: #166534; font-weight: 600; font-size: 15px;">
            🎉 Đơn hàng #${orderCode} đã được tiếp nhận thành công!
          </p>
          <p style="margin: 4px 0 0 0; color: #15803d; font-size: 13px;">
            Chúng tôi đang tiến hành đóng gói và giao đến bạn trong thời gian sớm nhất.
          </p>
        </div>

        <h3 style="font-size: 15px; color: #0f172a; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px; margin-top: 0;">
          Thông tin nhận hàng
        </h3>
        <table style="width: 100%; font-size: 13px; color: #334155; margin-bottom: 20px; line-height: 1.6;">
          <tr>
            <td style="width: 140px; color: #64748b;">Người nhận:</td>
            <td><strong>${recipientName}</strong></td>
          </tr>
          <tr>
            <td style="color: #64748b;">Số điện thoại:</td>
            <td>${recipientPhone || 'Theo tài khoản'}</td>
          </tr>
          <tr>
            <td style="color: #64748b;">Địa chỉ giao hàng:</td>
            <td>${shippingAddress || 'Địa chỉ mặc định'}</td>
          </tr>
          <tr>
            <td style="color: #64748b;">Phương thức thanh toán:</td>
            <td>${paymentMethod} (${paymentStatus === 'paid' ? '<span style="color:#16a34a; font-weight:bold;">Đã thanh toán</span>' : '<span style="color:#d97706; font-weight:bold;">Chưa thanh toán (COD)</span>'})</td>
          </tr>
        </table>

        <h3 style="font-size: 15px; color: #0f172a; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px;">
          Chi tiết sản phẩm đặt mua
        </h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <thead>
            <tr style="background-color: #f8fafc; color: #475569; font-size: 12px; text-transform: uppercase;">
              <th style="padding: 8px; text-align: left;">Sản phẩm</th>
              <th style="padding: 8px; text-align: center;">SL</th>
              <th style="padding: 8px; text-align: right;">Đơn giá</th>
              <th style="padding: 8px; text-align: right;">Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <!-- Bảng tính tiền -->
        <div style="background-color: #f8fafc; border-radius: 6px; padding: 14px 16px; margin-bottom: 24px;">
          <table style="width: 100%; font-size: 13px; color: #334155; line-height: 1.8;">
            ${
              discountAmount > 0
                ? `
              <tr>
                <td style="color: #64748b;">Giảm giá Voucher:</td>
                <td style="text-align: right; color: #dc2626; font-weight: 600;">-${formatPrice(discountAmount)}</td>
              </tr>
            `
                : ''
            }
            <tr>
              <td style="font-size: 15px; font-weight: 700; color: #0f172a;">Tổng thanh toán:</td>
              <td style="text-align: right; font-size: 18px; font-weight: 800; color: #0284c7;">${formatPrice(totalAmount)}</td>
            </tr>
          </table>
        </div>

        <!-- Chính sách bảo hành điện tử -->
        <div style="border: 1px dashed #cbd5e1; border-radius: 8px; padding: 16px; background-color: #fafafa; margin-bottom: 16px;">
          <h4 style="margin: 0 0 8px 0; font-size: 14px; color: #0f172a; display: flex; align-items: center;">
            🛡️ Chính Sách Bảo Hành & Đổi Trả GearK
          </h4>
          <ul style="margin: 0; padding-left: 18px; font-size: 12.5px; color: #475569; line-height: 1.6;">
            <li>Sản phẩm được kích hoạt <strong>bảo hành điện tử</strong> theo thông tin đơn hàng và số điện thoại của quý khách ngay khi nhận hàng.</li>
            <li>Đổi mới 1:1 trong vòng <strong>7 ngày</strong> nếu phát sinh lỗi phần cứng từ nhà sản xuất.</li>
            <li>Để tra cứu hoặc yêu cầu hỗ trợ bảo hành, quý khách vui lòng giữ nguyên tem bảo hành / hộp sản phẩm và liên hệ hotline hỗ trợ.</li>
          </ul>
        </div>
      </div>

      <div style="background-color: #f8fafc; padding: 16px 24px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8;">
        © 2026 GearK Gaming Store. Cảm ơn quý khách và chúc quý khách có trải nghiệm tuyệt vời!
      </div>
    </div>
  `;

  return sendMail({
    to,
    subject,
    text: `Đơn hàng #${orderCode} đã được đặt thành công. Tổng tiền: ${formatPrice(totalAmount)}. Quý khách vui lòng kiểm tra email để xem chi tiết sản phẩm và chính sách bảo hành.`,
    html,
  });
}

module.exports = {
  sendMail,
  sendOtpMail,
  sendOrderSuccessMail,
};

