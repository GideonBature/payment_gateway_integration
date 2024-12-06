const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    required: true
  },
  complainant: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'resolved', 'rejected'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Complaint', complaintSchema);
