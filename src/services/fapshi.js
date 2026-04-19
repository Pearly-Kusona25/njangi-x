// Fapshi Payment Service Integration
// Docs: https://fapshi.com/docs

import { EXPO_PUBLIC_FAPSHI_API_USER, EXPO_PUBLIC_FAPSHI_API_KEY } from '@env';

const FAPSHI_BASE_URL = 'https://live.fapshi.com';
const FAPSHI_API_USER = EXPO_PUBLIC_FAPSHI_API_USER || 'YOUR_FAPSHI_API_USER';
const FAPSHI_API_KEY = EXPO_PUBLIC_FAPSHI_API_KEY || 'YOUR_FAPSHI_API_KEY';
const PLATFORM_COMMISSION_RATE = 0.01; // 1%

const fapshiHeaders = {
  'Content-Type': 'application/json',
  'apiuser': FAPSHI_API_USER,
  'apikey': FAPSHI_API_KEY,
};

export const FapshiService = {
  /**
   * Initiate a payment request (Mobile Money - MTN or Orange)
   * @param {Object} params - Payment parameters
   * @param {number} params.amount - Amount in FCFA
   * @param {string} params.phone - Phone number (e.g. 67XXXXXXX)
   * @param {string} params.message - Payment description
   * @param {string} params.redirectUrl - URL to redirect after payment
   * @returns {Promise<Object>} - Payment initiation result
   */
  initiatePayment: async ({ amount, phone, message, redirectUrl }) => {
    try {
      const response = await fetch(`${FAPSHI_BASE_URL}/initiate-pay`, {
        method: 'POST',
        headers: fapshiHeaders,
        body: JSON.stringify({
          amount,
          phone,
          message,
          redirectUrl: redirectUrl || 'njangix://payment-success',
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Payment initiation failed');
      }

      return { success: true, data };
    } catch (error) {
      console.error('Fapshi payment error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Direct payment (no redirect) - user pays via phone
   */
  directPay: async ({ amount, phone, medium, name, email, userId, externalId }) => {
    try {
      const response = await fetch(`${FAPSHI_BASE_URL}/direct-pay`, {
        method: 'POST',
        headers: fapshiHeaders,
        body: JSON.stringify({
          amount,
          phone,
          medium: medium || 'mobile money', // 'mobile money' or 'orange money'
          name,
          email,
          userId,
          externalId,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Direct payment failed');
      }

      return { success: true, data };
    } catch (error) {
      console.error('Fapshi direct pay error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Check payment status
   * @param {string} transId - Fapshi transaction ID
   */
  checkPaymentStatus: async (transId) => {
    try {
      const response = await fetch(`${FAPSHI_BASE_URL}/payment-status/${transId}`, {
        method: 'GET',
        headers: fapshiHeaders,
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Status check failed');
      }

      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Transfer money (payout to member)
   * @param {Object} params
   */
  transferMoney: async ({ amount, phone, medium, name }) => {
    try {
      // Deduct platform commission
      const commission = Math.floor(amount * PLATFORM_COMMISSION_RATE);
      const netAmount = amount - commission;

      const response = await fetch(`${FAPSHI_BASE_URL}/transfer`, {
        method: 'POST',
        headers: fapshiHeaders,
        body: JSON.stringify({
          amount: netAmount,
          phone,
          medium: medium || 'mobile money',
          name,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Transfer failed');
      }

      return {
        success: true,
        data,
        commission,
        netAmount,
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Get account balance
   */
  getBalance: async () => {
    try {
      const response = await fetch(`${FAPSHI_BASE_URL}/balance`, {
        method: 'GET',
        headers: fapshiHeaders,
      });

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Calculate contribution with commission
   */
  calculateWithCommission: (amount) => {
    const commission = Math.floor(amount * PLATFORM_COMMISSION_RATE);
    return {
      baseAmount: amount,
      commission,
      totalAmount: amount + commission, // user pays this
      netPayout: amount - commission, // recipient gets this
    };
  },
};

export default FapshiService;
