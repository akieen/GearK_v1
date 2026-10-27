require('dotenv').config();
const moment = require('moment');
const crypto = require('crypto');
const querystring = require('qs');
const { pool } = require('../config/db');
const { executeOrderCreation } = require('./orderController');
const { successResponse, errorResponse } = require('../utils/helpers');

function sortObject(obj) {
  const sorted = {};
  const keys = Object.keys(obj).sort();
  for (const key of keys) {
    sorted[key] = encodeURIComponent(obj[key]).replace(/%20/g, '+');
  }
  return sorted;
}

// [POST] /api/payment/create-payment or /api/payment/vnpay/create-payment
const createPayment = async (req, res, next) => {
  try {
    process.env.TZ = 'Asia/Ho_Chi_Minh';

    const userId = req.user.user_id;
    const {
      amount,
      address_id,
      recipient_name,
      recipient_phone,
      street_address,
      coupon_code,
      items,
      notes,
      language
    } = req.body;

    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount <= 0) {
      return errorResponse(res, 'Số tiền thanh toán không hợp lệ', 400);
    }

    const date = new Date();
    const createDate = moment(date).format('YYYYMMDDHHmmss');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const txnRef = req.body.order_id || `${moment(date).format('YYMMDDHHmmss')}${randomSuffix}`;

    // Lưu phiên giao dịch chờ thanh toán vào bảng vnpay_transactions
    const orderData = {
      address_id,
      recipient_name,
      recipient_phone,
      street_address,
      coupon_code,
      items,
      notes
    };

    await pool.query(
      `INSERT INTO vnpay_transactions (txn_ref, user_id, amount, order_data, status)
       VALUES (?, ?, ?, ?, 'pending')
       ON DUPLICATE KEY UPDATE amount = VALUES(amount), order_data = VALUES(order_data), status = 'pending'`,
      [txnRef, userId, numericAmount, JSON.stringify(orderData)]
    );

    let ipAddr =
      req.headers['x-forwarded-for'] ||
      req.connection?.remoteAddress ||
      req.socket?.remoteAddress ||
      (req.connection?.socket ? req.connection.socket.remoteAddress : null) ||
      '127.0.0.1';

    if (ipAddr && ipAddr.includes(',')) {
      ipAddr = ipAddr.split(',')[0].trim();
    }
    if (ipAddr === '::1' || !ipAddr) {
      ipAddr = '127.0.0.1';
    }

    const tmnCode = process.env.VNP_TMN_CODE;
    const secretKey = process.env.VNP_HASH_SECRET;
    let vnpUrl = process.env.VNP_URL;
    const returnUrl = process.env.VNP_RETURN_URL;

    if (!tmnCode || !secretKey || !vnpUrl || !returnUrl) {
      return errorResponse(res, 'Cấu hình VNPAY chưa hoàn chỉnh trong hệ thống', 500);
    }

    const locale = language || req.body.locale || 'vn';
    const currCode = 'VND';

    let vnp_Params = {};
    vnp_Params['vnp_Version'] = '2.1.0';
    vnp_Params['vnp_Command'] = 'pay';
    vnp_Params['vnp_TmnCode'] = tmnCode;
    vnp_Params['vnp_Locale'] = locale;
    vnp_Params['vnp_CurrCode'] = currCode;
    vnp_Params['vnp_TxnRef'] = txnRef;
    vnp_Params['vnp_OrderInfo'] = 'Thanh toán cho mã GD: ' + txnRef;
    vnp_Params['vnp_OrderType'] = 'other';
    vnp_Params['vnp_Amount'] = Math.round(numericAmount * 100);
    vnp_Params['vnp_ReturnUrl'] = returnUrl;
    vnp_Params['vnp_IpAddr'] = ipAddr;
    vnp_Params['vnp_CreateDate'] = createDate;

    vnp_Params = sortObject(vnp_Params);

    const signData = querystring.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac('sha512', secretKey);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    vnp_Params['vnp_SecureHash'] = signed;
    vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: false });

    return res.status(200).json({
      status: 200,
      success: true,
      message: 'Tạo URL thanh toán thành công',
      payment_url: vnpUrl,
      txn_ref: txnRef
    });
  } catch (err) {
    next(err);
  }
};

// [GET] /api/vnpay_return or /api/payment/vnpay_return
const vnpayReturn = async (req, res, next) => {
  try {
    let vnp_Params = { ...req.query };

    const secureHash = vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    vnp_Params = sortObject(vnp_Params);

    const secretKey = process.env.VNP_HASH_SECRET;
    const signData = querystring.stringify(vnp_Params, { encode: false });

    const hmac = crypto.createHmac('sha512', secretKey);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    const isSignatureValid = secureHash === signed;
    const responseCode = vnp_Params['vnp_ResponseCode'];
    const txnRef = vnp_Params['vnp_TxnRef'];
    const transactionNo = vnp_Params['vnp_TransactionNo'] || '';
    const bankCode = vnp_Params['vnp_BankCode'] || '';
    const payDate = vnp_Params['vnp_PayDate'] || '';
    const rawAmount = vnp_Params['vnp_Amount'] ? Number(vnp_Params['vnp_Amount']) / 100 : 0;

    let frontendBase = process.env.URL_FRONTEND || 'http://localhost:5173/vnpay_return';
    frontendBase = frontendBase.replace(/\/+$/, '');

    const buildRedirectUrl = (paramsObj) => {
      const searchParams = new URLSearchParams(paramsObj);
      return `${frontendBase}?${searchParams.toString()}`;
    };

    // Kiểm tra tính hợp lệ của chữ ký
    if (!isSignatureValid) {
      console.error('[VNPay Return] Chữ ký không hợp lệ!', { secureHash, signed });
      if (req.headers.accept?.includes('application/json')) {
        return res.status(400).json({
          status: 400,
          success: false,
          code: '97',
          message: 'Chữ ký không hợp lệ'
        });
      }
      return res.redirect(
        buildRedirectUrl({
          vnp_ResponseCode: '97',
          vnp_TxnRef: txnRef || '',
          message: 'Chữ ký không hợp lệ (Mã lỗi 97)'
        })
      );
    }

    // Chữ ký hợp lệ -> Tìm bản ghi phiên giao dịch
    const [txRows] = await pool.query(
      'SELECT * FROM vnpay_transactions WHERE txn_ref = ? LIMIT 1',
      [txnRef]
    );

    if (txRows.length === 0) {
      console.error('[VNPay Return] Không tìm thấy transaction:', txnRef);
      if (req.headers.accept?.includes('application/json')) {
        return res.status(404).json({
          status: 404,
          success: false,
          code: responseCode,
          message: 'Không tìm thấy thông tin phiên giao dịch'
        });
      }
      return res.redirect(
        buildRedirectUrl({
          vnp_ResponseCode: responseCode,
          vnp_TxnRef: txnRef || '',
          message: 'Không tìm thấy thông tin giao dịch'
        })
      );
    }

    const tx = txRows[0];

    // Thanh toán thành công (Mã '00')
    if (responseCode === '00') {
      // Trường hợp người dùng reload trang callback hoặc VNPay gửi nhiều lần:
      if (tx.status === 'success' && tx.order_id) {
        const [existingOrders] = await pool.query(
          'SELECT order_code, total_amount FROM orders WHERE order_id = ?',
          [tx.order_id]
        );
        const orderCode = existingOrders[0]?.order_code || tx.order_id;
        const totalAmount = existingOrders[0]?.total_amount || tx.amount;

        if (req.headers.accept?.includes('application/json')) {
          return res.status(200).json({
            status: 200,
            success: true,
            code: '00',
            order_id: tx.order_id,
            order_code: orderCode,
            amount: totalAmount,
            message: 'Đơn hàng đã được thanh toán và ghi nhận trước đó'
          });
        }
        return res.redirect(
          buildRedirectUrl({
            vnp_ResponseCode: '00',
            vnp_TxnRef: txnRef,
            order_id: tx.order_id,
            order_code: orderCode,
            amount: totalAmount,
            bank_code: bankCode,
            pay_date: payDate
          })
        );
      }

      // Thanh toán thành công: BÂY GIỜ MỚI TẠO ORDER CHÍNH THỨC
      const connection = await pool.getConnection();
      try {
        await connection.beginTransaction();

        let orderData = {};
        try {
          orderData = JSON.parse(tx.order_data || '{}');
        } catch {
          orderData = {};
        }

        const createdOrder = await executeOrderCreation(connection, {
          userId: tx.user_id,
          address_id: orderData.address_id,
          recipient_name: orderData.recipient_name,
          recipient_phone: orderData.recipient_phone,
          street_address: orderData.street_address,
          payment_method: 'VNPay',
          coupon_code: orderData.coupon_code,
          items: orderData.items,
          payment_status: 'paid',
          paid_at: new Date(),
          order_status: 'confirmed'
        });

        // Cập nhật trạng thái transaction thành công
        await connection.query(
          `UPDATE vnpay_transactions 
           SET status = 'success', 
               order_id = ?, 
               vnp_response_code = ?, 
               vnp_transaction_no = ? 
           WHERE txn_ref = ?`,
          [createdOrder.order_id, responseCode, transactionNo, txnRef]
        );

        await connection.commit();

        if (req.headers.accept?.includes('application/json')) {
          return res.status(200).json({
            status: 200,
            success: true,
            code: '00',
            order_id: createdOrder.order_id,
            order_code: createdOrder.order_code,
            amount: createdOrder.total_amount,
            message: 'Thanh toán VNPay thành công và đã tạo đơn hàng'
          });
        }

        return res.redirect(
          buildRedirectUrl({
            vnp_ResponseCode: '00',
            vnp_TxnRef: txnRef,
            order_id: createdOrder.order_id,
            order_code: createdOrder.order_code,
            amount: createdOrder.total_amount,
            bank_code: bankCode,
            pay_date: payDate
          })
        );
      } catch (createErr) {
        await connection.rollback();
        console.error('[VNPay Return] Lỗi tạo đơn hàng khi callback:', createErr);

        await pool.query(
          `UPDATE vnpay_transactions 
           SET status = 'error_creating_order', 
               vnp_response_code = ?, 
               vnp_transaction_no = ? 
           WHERE txn_ref = ?`,
          [responseCode, transactionNo, txnRef]
        );

        if (req.headers.accept?.includes('application/json')) {
          return res.status(500).json({
            status: 500,
            success: false,
            code: responseCode,
            message: 'Thanh toán thành công nhưng xảy ra lỗi khi tạo đơn hàng: ' + createErr.message
          });
        }

        return res.redirect(
          buildRedirectUrl({
            vnp_ResponseCode: '99',
            vnp_TxnRef: txnRef,
            error: createErr.message,
            message: 'Lỗi trong quá trình tạo đơn hàng'
          })
        );
      } finally {
        connection.release();
      }
    } else {
      // Thanh toán không thành công hoặc người dùng hủy -> KHÔNG TẠO ORDER!
      await pool.query(
        `UPDATE vnpay_transactions 
         SET status = 'failed', 
             vnp_response_code = ?, 
             vnp_transaction_no = ? 
         WHERE txn_ref = ?`,
        [responseCode, transactionNo, txnRef]
      );

      if (req.headers.accept?.includes('application/json')) {
        return res.status(200).json({
          status: 200,
          success: false,
          code: responseCode,
          txn_ref: txnRef,
          message: 'Giao dịch thanh toán không thành công hoặc đã bị hủy'
        });
      }

      return res.redirect(
        buildRedirectUrl({
          vnp_ResponseCode: responseCode,
          vnp_TxnRef: txnRef,
          amount: rawAmount,
          message: 'Giao dịch không thành công hoặc người dùng đã hủy'
        })
      );
    }
  } catch (err) {
    next(err);
  }
};

// [GET] /api/payment/vnpay/check-status/:txnRef
const checkTransactionStatus = async (req, res, next) => {
  try {
    const { txnRef } = req.params;
    const [txRows] = await pool.query(
      `SELECT vt.*, o.order_code, o.order_status, o.payment_status, o.total_amount 
       FROM vnpay_transactions vt
       LEFT JOIN orders o ON vt.order_id = o.order_id
       WHERE vt.txn_ref = ?`,
      [txnRef]
    );

    if (txRows.length === 0) {
      return errorResponse(res, 'Không tìm thấy thông tin giao dịch', 404);
    }

    return successResponse(res, txRows[0], 'Thông tin giao dịch VNPay');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createPayment,
  vnpayReturn,
  checkTransactionStatus,
  sortObject
};
