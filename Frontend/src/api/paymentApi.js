import request from './client';

export const paymentApi = {
  createPaymentUrl: (paymentData) =>
    request('/payment/create-payment', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    }),

  checkTransactionStatus: (txnRef) =>
    request(`/payment/vnpay/check-status/${txnRef}`),
};

export default paymentApi;
