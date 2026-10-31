require('dotenv').config();
const moment = require('moment');
const crypto = require('crypto');
const querystring = require('qs');
const prisma = require('../config/prisma');
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

    const userId = BigInt(req.user.user_id);
    const {
      amount,
      address_id,
      recipient_name,
      recipient_phone,
      street_address,
      coupon_code,
      items,
      notes,
      language,
    } = req.body;

    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount <= 0) {
      return errorResponse(res, 'Số tiền thanh toán không hợp lệ', 400);
    }

    const date = new Date();
    const createDate = moment(date).format('YYYYMMDDHHmmss');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const txnRef = req.body.order_id || `${moment(date).format('YYMMDDHHmmss')}${randomSuffix}`;

    const orderData = {
      address_id,
      recipient_name,
      recipient_phone,
      street_address,
      coupon_code,
      items,
      notes,
    };

    await prisma.vNPayTransaction.upsert({
      where: { txn_ref: txnRef },
      create: {
        txn_ref: txnRef,
        user_id: userId,
        amount: numericAmount,
        order_data: JSON.stringify(orderData),
        status: 'pending',
      },
      update: {
        amount: numericAmount,
        order_data: JSON.stringify(orderData),
        status: 'pending',
      },
    });

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
      txn_ref: txnRef,
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

    if (!isSignatureValid) {
      console.error('[VNPay Return] Chữ ký không hợp lệ!', { secureHash, signed });
      if (req.headers.accept?.includes('application/json')) {
        return res.status(400).json({
          status: 400,
          success: false,
          code: '97',
          message: 'Chữ ký không hợp lệ',
        });
      }
      return res.redirect(
        buildRedirectUrl({
          vnp_ResponseCode: '97',
          vnp_TxnRef: txnRef || '',
          message: 'Chữ ký không hợp lệ (Mã lỗi 97)',
        })
      );
    }

    const tx = await prisma.vNPayTransaction.findUnique({
      where: { txn_ref: txnRef },
      include: {
        order: { select: { order_code: true, total_amount: true } },
      },
    });

    if (!tx) {
      console.error('[VNPay Return] Không tìm thấy transaction:', txnRef);
      if (req.headers.accept?.includes('application/json')) {
        return res.status(404).json({
          status: 404,
          success: false,
          code: responseCode,
          message: 'Không tìm thấy thông tin phiên giao dịch',
        });
      }
      return res.redirect(
        buildRedirectUrl({
          vnp_ResponseCode: responseCode,
          vnp_TxnRef: txnRef || '',
          message: 'Không tìm thấy thông tin giao dịch',
        })
      );
    }

    // Thanh toán thành công (Mã '00')
    if (responseCode === '00') {
      if (tx.status === 'success' && tx.order_id) {
        const orderCode = tx.order?.order_code || tx.order_id;
        const totalAmount = tx.order?.total_amount ? Number(tx.order.total_amount) : Number(tx.amount);

        if (req.headers.accept?.includes('application/json')) {
          return res.status(200).json({
            status: 200,
            success: true,
            code: '00',
            order_id: tx.order_id,
            order_code: orderCode,
            amount: totalAmount,
            message: 'Đơn hàng đã được thanh toán và ghi nhận trước đó',
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
            pay_date: payDate,
          })
        );
      }

      // Thanh toán thành công: BÂY GIỜ MỚI TẠO ORDER CHÍNH THỨC
      try {
        let orderData = {};
        try {
          orderData = JSON.parse(tx.order_data || '{}');
        } catch {
          orderData = {};
        }

        const createdOrder = await prisma.$transaction(async (prismaTx) => {
          const ord = await executeOrderCreation(prismaTx, {
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
            order_status: 'confirmed',
          });

          await prismaTx.vNPayTransaction.update({
            where: { txn_ref: txnRef },
            data: {
              status: 'success',
              order_id: ord.order_id,
              vnp_response_code: responseCode,
              vnp_transaction_no: transactionNo,
            },
          });

          return ord;
        });

        if (req.headers.accept?.includes('application/json')) {
          return res.status(200).json({
            status: 200,
            success: true,
            code: '00',
            order_id: createdOrder.order_id,
            order_code: createdOrder.order_code,
            amount: createdOrder.total_amount,
            message: 'Thanh toán VNPay thành công và đã tạo đơn hàng',
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
            pay_date: payDate,
          })
        );
      } catch (createErr) {
        console.error('[VNPay Return] Lỗi tạo đơn hàng khi callback:', createErr);

        await prisma.vNPayTransaction.update({
          where: { txn_ref: txnRef },
          data: {
            status: 'error_creating_order',
            vnp_response_code: responseCode,
            vnp_transaction_no: transactionNo,
          },
        });

        if (req.headers.accept?.includes('application/json')) {
          return res.status(500).json({
            status: 500,
            success: false,
            code: responseCode,
            message: 'Thanh toán thành công nhưng xảy ra lỗi khi tạo đơn hàng: ' + createErr.message,
          });
        }

        return res.redirect(
          buildRedirectUrl({
            vnp_ResponseCode: '99',
            vnp_TxnRef: txnRef,
            error: createErr.message,
            message: 'Lỗi trong quá trình tạo đơn hàng',
          })
        );
      }
    } else {
      // Thanh toán không thành công hoặc người dùng hủy
      await prisma.vNPayTransaction.update({
        where: { txn_ref: txnRef },
        data: {
          status: 'failed',
          vnp_response_code: responseCode,
          vnp_transaction_no: transactionNo,
        },
      });

      if (req.headers.accept?.includes('application/json')) {
        return res.status(200).json({
          status: 200,
          success: false,
          code: responseCode,
          txn_ref: txnRef,
          message: 'Giao dịch thanh toán không thành công hoặc đã bị hủy',
        });
      }

      return res.redirect(
        buildRedirectUrl({
          vnp_ResponseCode: responseCode,
          vnp_TxnRef: txnRef,
          amount: rawAmount,
          message: 'Giao dịch không thành công hoặc người dùng đã hủy',
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
    const tx = await prisma.vNPayTransaction.findUnique({
      where: { txn_ref: txnRef },
      include: {
        order: {
          select: {
            order_code: true,
            order_status: true,
            payment_status: true,
            total_amount: true,
          },
        },
      },
    });

    if (!tx) {
      return errorResponse(res, 'Không tìm thấy thông tin giao dịch', 404);
    }

    const formatted = {
      txn_ref: tx.txn_ref,
      user_id: tx.user_id,
      amount: tx.amount,
      order_data: tx.order_data,
      status: tx.status,
      vnp_response_code: tx.vnp_response_code,
      vnp_transaction_no: tx.vnp_transaction_no,
      order_id: tx.order_id,
      created_at: tx.created_at,
      updated_at: tx.updated_at,
      order_code: tx.order?.order_code || null,
      order_status: tx.order?.order_status || null,
      payment_status: tx.order?.payment_status || null,
      total_amount: tx.order?.total_amount || null,
    };

    return successResponse(res, formatted, 'Thông tin giao dịch VNPay');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createPayment,
  vnpayReturn,
  checkTransactionStatus,
  sortObject,
};
