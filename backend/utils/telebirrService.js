import axios from 'axios';
import crypto from 'crypto';

/**
 * Telebirr Payment Integration Service
 * 
 * This service handles payment processing with Telebirr payment gateway
 * including payment initiation, verification, and callback handling
 */

class TelebirrService {
  constructor() {
    this.appId = process.env.TELEBIRR_APP_ID;
    this.appKey = process.env.TELEBIRR_APP_KEY;
    this.merchantId = process.env.TELEBIRR_MERCHANT_ID;
    this.publicKey = process.env.TELEBIRR_PUBLIC_KEY;
    this.apiUrl = process.env.TELEBIRR_API_URL || 'https://api.telebirr.et';
    this.notifyUrl = process.env.TELEBIRR_NOTIFY_URL;
    this.returnUrl = process.env.TELEBIRR_RETURN_URL;
  }

  /**
   * Generate signature for Telebirr API request
   */
  generateSignature(data) {
    // Sort parameters alphabetically
    const sortedKeys = Object.keys(data).sort();
    const signString = sortedKeys
      .map(key => `${key}=${data[key]}`)
      .join('&');

    // Add app key
    const stringToSign = `${signString}&key=${this.appKey}`;

    // Generate SHA256 hash
    const signature = crypto
      .createHash('sha256')
      .update(stringToSign)
      .digest('hex')
      .toUpperCase();

    return signature;
  }

  /**
   * Generate unique order ID
   */
  generateOrderId() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return `ORD${timestamp}${random}`;
  }

  /**
   * Initiate payment request
   * 
   * @param {Object} paymentData - Payment information
   * @param {string} paymentData.amount - Payment amount
   * @param {string} paymentData.userId - User ID
   * @param {string} paymentData.bookingId - Booking ID
   * @param {string} paymentData.description - Payment description
   * @returns {Object} Payment initiation response
   */
  async initiatePayment(paymentData) {
    try {
      const orderId = this.generateOrderId();
      const timestamp = new Date().toISOString();

      // Prepare request data
      const requestData = {
        appId: this.appId,
        merchantId: this.merchantId,
        outTradeNo: orderId,
        totalAmount: paymentData.amount.toString(),
        subject: paymentData.description || 'Tutoring Session Payment',
        body: `Payment for booking ${paymentData.bookingId}`,
        notifyUrl: this.notifyUrl,
        returnUrl: this.returnUrl,
        timeoutExpress: '30m',
        timestamp: timestamp,
        nonce: crypto.randomBytes(16).toString('hex'),
        // Additional data
        passbackParams: JSON.stringify({
          userId: paymentData.userId,
          bookingId: paymentData.bookingId
        })
      };

      // Generate signature
      requestData.sign = this.generateSignature(requestData);

      // Make API request to Telebirr
      const response = await axios.post(
        `${this.apiUrl}/payment/v1/h5/pay`,
        requestData,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-APP-ID': this.appId
          },
          timeout: 30000
        }
      );

      if (response.data && response.data.code === '0') {
        return {
          success: true,
          orderId: orderId,
          paymentUrl: response.data.data.payUrl,
          telebirrOrderId: response.data.data.tradeNo,
          rawResponse: response.data
        };
      } else {
        throw new Error(response.data.msg || 'Payment initiation failed');
      }
    } catch (error) {
      console.error('Telebirr payment initiation error:', error);
      
      return {
        success: false,
        error: error.message || 'Failed to initiate payment',
        details: error.response?.data
      };
    }
  }

  /**
   * Verify payment callback from Telebirr
   * 
   * @param {Object} callbackData - Callback data from Telebirr
   * @returns {Object} Verification result
   */
  verifyPaymentCallback(callbackData) {
    try {
      const { sign, ...dataToVerify } = callbackData;

      // Generate signature from callback data
      const expectedSignature = this.generateSignature(dataToVerify);

      // Verify signature
      if (sign !== expectedSignature) {
        return {
          success: false,
          error: 'Invalid signature'
        };
      }

      // Check payment status
      const isSuccess = callbackData.tradeStatus === 'TRADE_SUCCESS' || 
                       callbackData.tradeStatus === 'TRADE_FINISHED';

      return {
        success: isSuccess,
        orderId: callbackData.outTradeNo,
        telebirrTransactionId: callbackData.tradeNo,
        amount: parseFloat(callbackData.totalAmount),
        status: callbackData.tradeStatus,
        timestamp: callbackData.timestamp,
        passbackParams: callbackData.passbackParams ? 
          JSON.parse(callbackData.passbackParams) : null
      };
    } catch (error) {
      console.error('Payment verification error:', error);
      return {
        success: false,
        error: 'Payment verification failed'
      };
    }
  }

  /**
   * Query payment status
   * 
   * @param {string} orderId - Order ID to query
   * @returns {Object} Payment status
   */
  async queryPaymentStatus(orderId) {
    try {
      const timestamp = new Date().toISOString();

      const requestData = {
        appId: this.appId,
        merchantId: this.merchantId,
        outTradeNo: orderId,
        timestamp: timestamp,
        nonce: crypto.randomBytes(16).toString('hex')
      };

      // Generate signature
      requestData.sign = this.generateSignature(requestData);

      const response = await axios.post(
        `${this.apiUrl}/payment/v1/query`,
        requestData,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-APP-ID': this.appId
          },
          timeout: 30000
        }
      );

      if (response.data && response.data.code === '0') {
        const data = response.data.data;
        return {
          success: true,
          status: data.tradeStatus,
          amount: parseFloat(data.totalAmount),
          telebirrTransactionId: data.tradeNo,
          payTime: data.payTime
        };
      } else {
        throw new Error(response.data.msg || 'Query failed');
      }
    } catch (error) {
      console.error('Payment query error:', error);
      return {
        success: false,
        error: error.message || 'Failed to query payment status'
      };
    }
  }

  /**
   * Process refund
   * 
   * @param {Object} refundData - Refund information
   * @returns {Object} Refund result
   */
  async processRefund(refundData) {
    try {
      const refundId = `REF${Date.now()}${Math.floor(Math.random() * 1000)}`;
      const timestamp = new Date().toISOString();

      const requestData = {
        appId: this.appId,
        merchantId: this.merchantId,
        outTradeNo: refundData.orderId,
        outRefundNo: refundId,
        refundAmount: refundData.amount.toString(),
        refundReason: refundData.reason || 'Booking cancelled',
        timestamp: timestamp,
        nonce: crypto.randomBytes(16).toString('hex')
      };

      // Generate signature
      requestData.sign = this.generateSignature(requestData);

      const response = await axios.post(
        `${this.apiUrl}/payment/v1/refund`,
        requestData,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-APP-ID': this.appId
          },
          timeout: 30000
        }
      );

      if (response.data && response.data.code === '0') {
        return {
          success: true,
          refundId: refundId,
          telebirrRefundId: response.data.data.refundNo,
          status: response.data.data.refundStatus
        };
      } else {
        throw new Error(response.data.msg || 'Refund failed');
      }
    } catch (error) {
      console.error('Refund processing error:', error);
      return {
        success: false,
        error: error.message || 'Failed to process refund'
      };
    }
  }
}

// Export singleton instance
export default new TelebirrService();
