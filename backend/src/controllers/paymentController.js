import Payment from '../models/Payment.js';
import axios from 'axios';
import { AppError } from '../middleware/errorHandler.js';

const generateInvoiceNumber = () => `INV-${Date.now()}`;

export const initializePayment = async (req, res, next) => {
  try {
    const { amount, email, itemType, itemId, metadata } = req.body;

    if (!amount || !email || !itemType) {
      throw new AppError('Missing required fields', 400);
    }

    const invoiceNumber = generateInvoiceNumber();

    // Create payment record
    const payment = await Payment.create({
      userId: req.user.id,
      type: itemType,
      amount: Math.round(amount * 100), // Convert to kobo for Paystack
      currency: 'NGN',
      status: 'pending',
      invoiceNumber,
      items: [{
        itemType,
        itemId,
        quantity: 1,
        unitPrice: amount
      }]
    });

    // Initialize Paystack payment
    try {
      const response = await axios.post(
        'https://api.paystack.co/transaction/initialize',
        {
          amount: payment.amount,
          email: email,
          metadata: {
            invoiceNumber,
            userId: req.user.id,
            ...metadata
          }
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      payment.reference = response.data.data.reference;
      await payment.save();

      res.status(200).json({
        success: true,
        data: {
          authorizationUrl: response.data.data.authorization_url,
          accessCode: response.data.data.access_code,
          reference: response.data.data.reference,
          invoiceNumber
        }
      });
    } catch (paystackError) {
      payment.status = 'failed';
      await payment.save();
      throw new AppError('Payment initialization failed', 500);
    }
  } catch (error) {
    next(error);
  }
};

export const verifyPayment = async (req, res, next) => {
  try {
    const { reference } = req.params;

    const payment = await Payment.findOne({ reference });
    if (!payment) throw new AppError('Payment not found', 404);

    try {
      const response = await axios.get(
        `https://api.paystack.co/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
          }
        }
      );

      const { status, data } = response.data;

      if (status && data.status === 'success') {
        payment.status = 'successful';
        payment.paidAt = new Date();
        await payment.save();

        // Update user membership if applicable
        if (payment.type === 'membership') {
          // Implementation in payment service
        }

        res.status(200).json({
          success: true,
          message: 'Payment verified',
          data: payment
        });
      } else {
        payment.status = 'failed';
        await payment.save();
        throw new AppError('Payment verification failed', 400);
      }
    } catch (paystackError) {
      throw new AppError('Verification failed', 500);
    }
  } catch (error) {
    next(error);
  }
};

export const getPaymentHistory = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const filter = { userId: req.user.id };
    if (status) filter.status = status;

    const skip = (page - 1) * limit;
    const payments = await Payment.find(filter)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Payment.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: payments,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    next(error);
  }
};

export const getAllPayments = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const skip = (page - 1) * limit;
    const payments = await Payment.find(filter)
      .populate('userId', 'firstName lastName email')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Payment.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: payments,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    next(error);
  }
};

export const generateInvoice = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) throw new AppError('Payment not found', 404);

    // Implementation for PDF generation
    res.status(200).json({
      success: true,
      message: 'Invoice generated',
      invoiceNumber: payment.invoiceNumber
    });
  } catch (error) {
    next(error);
  }
};

export const processRefund = async (req, res, next) => {
  try {
    const { paymentId } = req.body;
    const payment = await Payment.findById(paymentId);
    if (!payment) throw new AppError('Payment not found', 404);

    // Implementation for refund processing
    res.status(200).json({
      success: true,
      message: 'Refund processed'
    });
  } catch (error) {
    next(error);
  }
};
