const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    unique: true
  },
  txRef: {
    type: String,
    unique: true
  },
  amount: {
    type: Number
  },
  client: {
    name: String,
    email: String,
    phone: String
  },
  lawyer: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    flutterwaveAccountId: {
      type: String
    }
  },
  balanceType: {
    type: String,
    enum: ['incoming', 'available'],
    default: 'incoming'
  },
  status: {
    type: String,
    enum: ['pending', 'held', 'completed', 'failed'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['initiated', 'successful', 'failed'],
    default: 'initiated'
  },
  transferStatus: {
    type: String,
    enum: ['pending', 'processing', 'successful', 'failed'],
    default: 'pending'
  },
  holdUntil: {
    type: Date
  },
  transferReference: String,
  adminTransactionId: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

transactionSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Transaction', transactionSchema);
