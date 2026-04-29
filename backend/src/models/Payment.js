import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['membership', 'single-class', 'trainer-session', 'other'],
    required: true
  },
  amount: {
    type: Number,
    required: [true, 'Please provide payment amount'],
    min: 0
  },
  currency: {
    type: String,
    default: 'NGN'
  },
  paymentMethod: {
    type: String,
    enum: ['paystack', 'card', 'transfer', 'cash'],
    default: 'paystack'
  },
  reference: {
    type: String,
    unique: true,
    sparse: true
  },
  status: {
    type: String,
    enum: ['pending', 'successful', 'failed', 'cancelled'],
    default: 'pending'
  },
  items: [{
    itemType: String,
    itemId: mongoose.Schema.Types.ObjectId,
    quantity: Number,
    unitPrice: Number
  }],
  invoiceNumber: {
    type: String,
    unique: true
  },
  paidAt: Date,
  receiptUrl: String,
  notes: String,
  metadata: {
    ipAddress: String,
    userAgent: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for frequent queries
paymentSchema.index({ userId: 1, status: 1 });
paymentSchema.index({ reference: 1 });
paymentSchema.index({ invoiceNumber: 1 });
paymentSchema.index({ createdAt: -1 });

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;
