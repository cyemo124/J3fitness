import axios from 'axios';

const PAYSTACK_BASE_URL = 'https://api.paystack.co';
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

const paystackAPI = axios.create({
  baseURL: PAYSTACK_BASE_URL,
  headers: {
    Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
    'Content-Type': 'application/json'
  }
});

export const initializeTransaction = async (email, amount, metadata = {}) => {
  try {
    const response = await paystackAPI.post('/transaction/initialize', {
      email,
      amount: Math.round(amount * 100), // Convert to kobo
      metadata
    });
    return response.data.data;
  } catch (error) {
    throw new Error(`Paystack initialization failed: ${error.message}`);
  }
};

export const verifyTransaction = async (reference) => {
  try {
    const response = await paystackAPI.get(`/transaction/verify/${reference}`);
    return response.data.data;
  } catch (error) {
    throw new Error(`Paystack verification failed: ${error.message}`);
  }
};

export const getTransaction = async (reference) => {
  try {
    const response = await paystackAPI.get(`/transaction/verify/${reference}`);
    return response.data.data;
  } catch (error) {
    throw new Error(`Failed to fetch transaction: ${error.message}`);
  }
};

export const createTransferRecipient = async (account_number, bank_code, name) => {
  try {
    const response = await paystackAPI.post('/transferrecipient', {
      type: 'nuban',
      account_number,
      bank_code,
      name
    });
    return response.data.data;
  } catch (error) {
    throw new Error(`Failed to create transfer recipient: ${error.message}`);
  }
};

export const initiateTransfer = async (source, recipient, amount, reference) => {
  try {
    const response = await paystackAPI.post('/transfer', {
      source,
      recipient,
      amount: Math.round(amount * 100),
      reason: 'Gym Refund',
      reference
    });
    return response.data.data;
  } catch (error) {
    throw new Error(`Failed to initiate transfer: ${error.message}`);
  }
};

export const getBanks = async () => {
  try {
    const response = await paystackAPI.get('/bank');
    return response.data.data;
  } catch (error) {
    throw new Error(`Failed to fetch banks: ${error.message}`);
  }
};

export const validateAccount = async (account_number, bank_code) => {
  try {
    const response = await paystackAPI.get('/bank/resolve', {
      params: {
        account_number,
        bank_code
      }
    });
    return response.data.data;
  } catch (error) {
    throw new Error(`Account validation failed: ${error.message}`);
  }
};
