const axios = require('axios');

class PaymentService {
  // ZarinPal Payment Gateway Integration
  static async initializeZarinPalPayment(amount, description, email, mobile) {
    try {
      const zarinpalConfig = {
        MerchantID: process.env.ZARINPAL_MERCHANT_ID || 'XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX',
        Amount: amount, // Amount in Rials
        CallbackURL: process.env.ZARINPAL_CALLBACK_URL || 'http://localhost:3000/payment/callback',
        Description: description,
        Email: email,
        Mobile: mobile
      };

      const response = await axios.post('https://api.zarinpal.com/pg/v4/payment/request.json', zarinpalConfig);

      if (response.data.data && response.data.data.code === 100) {
        return {
          success: true,
          authority: response.data.data.authority,
          paymentUrl: `https://www.zarinpal.com/pg/StartPay/${response.data.data.authority}`
        };
      } else {
        return {
          success: false,
          error: 'Payment initialization failed',
          code: response.data.errors?.code
        };
      }
    } catch (error) {
      console.error('ZarinPal payment error:', error);
      return {
        success: false,
        error: 'Payment service unavailable'
      };
    }
  }

  // Verify ZarinPal Payment
  static async verifyZarinPalPayment(authority, amount) {
    try {
      const verifyConfig = {
        MerchantID: process.env.ZARINPAL_MERCHANT_ID || 'XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX',
        Authority: authority,
        Amount: amount
      };

      const response = await axios.post('https://api.zarinpal.com/pg/v4/payment/verify.json', verifyConfig);

      if (response.data.data && response.data.data.code === 100) {
        return {
          success: true,
          refId: response.data.data.ref_id,
          cardHash: response.data.data.card_hash,
          cardPan: response.data.data.card_pan
        };
      } else {
        return {
          success: false,
          error: 'Payment verification failed',
          code: response.data.errors?.code
        };
      }
    } catch (error) {
      console.error('ZarinPal verification error:', error);
      return {
        success: false,
        error: 'Payment verification failed'
      };
    }
  }

  // Mellat Bank Payment Gateway (Sample Implementation)
  static async initializeMellatPayment(amount, orderId, callbackUrl) {
    try {
      // This is a simplified implementation
      // In production, you would use proper Mellat Bank API
      const mellatConfig = {
        terminalId: process.env.MELLAT_TERMINAL_ID || '123456',
        userName: process.env.MELLAT_USERNAME || 'username',
        userPassword: process.env.MELLAT_PASSWORD || 'password',
        orderId: orderId,
        amount: amount * 10, // Mellat expects amount in Rials * 10
        localDate: new Date().toISOString().slice(0, 10).replace(/-/g, ''),
        localTime: new Date().toTimeString().slice(0, 8).replace(/:/g, ''),
        additionalData: '',
        callBackUrl: callbackUrl,
        payerId: 0
      };

      // Mock response for demo - replace with actual Mellat API call
      return {
        success: true,
        refId: 'MOCK_' + Date.now(),
        paymentUrl: `https://bpm.shaparak.ir/pgwchannel/startpay.mellat?RefId=MOCK_${Date.now()}`
      };
    } catch (error) {
      console.error('Mellat payment error:', error);
      return {
        success: false,
        error: 'Payment initialization failed'
      };
    }
  }

  // Parsian Bank Payment Gateway (Sample Implementation)
  static async initializeParsianPayment(amount, orderId, callbackUrl) {
    try {
      // Mock implementation for demo
      return {
        success: true,
        token: 'PARSIAN_' + Date.now(),
        paymentUrl: `https://pec.shaparak.ir/NewIPGServices/Sale/Sale?token=PARSIAN_${Date.now()}`
      };
    } catch (error) {
      console.error('Parsian payment error:', error);
      return {
        success: false,
        error: 'Payment initialization failed'
      };
    }
  }

  // Sadad Payment Gateway (Sample Implementation)
  static async initializeSadadPayment(amount, orderId, callbackUrl) {
    try {
      // Mock implementation for demo
      return {
        success: true,
        token: 'SADAD_' + Date.now(),
        paymentUrl: `https://sadad.shaparak.ir/VPG/Purchase?token=SADAD_${Date.now()}`
      };
    } catch (error) {
      console.error('Sadad payment error:', error);
      return {
        success: false,
        error: 'Payment initialization failed'
      };
    }
  }

  // Generic payment initialization based on gateway
  static async initializePayment(gateway, amount, orderId, userInfo, callbackUrl) {
    switch (gateway) {
      case 'zarinpal':
        return await this.initializeZarinPalPayment(
          amount * 10, // Convert to Rials
          `خرید از فروشگاه - سفارش #${orderId}`,
          userInfo.email,
          userInfo.phone
        );
      
      case 'mellat':
        return await this.initializeMellatPayment(amount, orderId, callbackUrl);
      
      case 'parsian':
        return await this.initializeParsianPayment(amount, orderId, callbackUrl);
      
      case 'sadad':
        return await this.initializeSadadPayment(amount, orderId, callbackUrl);
      
      default:
        return {
          success: false,
          error: 'Unsupported payment gateway'
        };
    }
  }

  // Verify payment based on gateway
  static async verifyPayment(gateway, verificationData) {
    switch (gateway) {
      case 'zarinpal':
        return await this.verifyZarinPalPayment(
          verificationData.authority,
          verificationData.amount * 10
        );
      
      // Add other gateway verifications here
      default:
        return {
          success: false,
          error: 'Payment verification not implemented for this gateway'
        };
    }
  }
}

module.exports = PaymentService;