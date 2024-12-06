const dotenv = require('dotenv');
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const mongoose = require('mongoose');
const cron = require('node-cron');

const Transaction = require('./models/Transaction');

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Flutterwave configuration
const FLUTTERWAVE_SECRET_KEY = process.env.FLW_SECRET_KEY;
const FLUTTERWAVE_PUBLIC_KEY = process.env.FLW_PUBLIC_KEY;

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.error('MongoDB connection error:', err);
});

app.use(cors());
app.use(express.json());

// Initialize payment
app.post('/api/payment/initialize', async (req, res) => {
    try {
        const { amount, clientEmail, clientName, clientPhone, lawyerId, lawyerFlutterwaveId } = req.body;
        
        // Generate a unique transaction reference
        const txRef = `PL-${uuidv4()}`;
        
        // Create transaction record
        const transaction = new Transaction({
            txRef,
            amount,
            client: {
                name: clientName,
                email: clientEmail,
                phone: clientPhone
            },
            lawyer: {
                id: lawyerId,
                flutterwaveAccountId: lawyerFlutterwaveId
            },
            holdUntil: new Date(Date.now() + (3 * 24 * 60 * 60 * 1000)) // 3 days from now
        });
        await transaction.save();

        // Create payment payload
        const payload = {
            tx_ref: txRef,
            amount: amount,
            currency: "NGN",
            redirect_url: `${process.env.FRONTEND_URL}/payment/callback`,
            customer: {
                email: clientEmail,
                phone_number: clientPhone,
                name: clientName
            },
            customizations: {
                title: "PocketLawyer Payment",
                description: "Payment for legal services",
                logo: process.env.LOGO_URL
            }
        };

        // Initialize payment with Flutterwave
        const response = await axios.post(
            'https://api.flutterwave.com/v3/payments',
            payload,
            {
                headers: {
                    Authorization: `Bearer ${FLUTTERWAVE_SECRET_KEY}`
                }
            }
        );

        res.json({
            status: 'success',
            data: response.data
        });
    } catch (error) {
        console.error('Payment initialization error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to initialize payment'
        });
    }
});

// Webhook to handle Flutterwave payment verification
app.post('/api/payment/webhook', async (req, res) => {
    try {
        const secretHash = process.env.FLW_HASH;
        const signature = req.headers["verif-hash"];
        
        if (!signature || (signature !== secretHash)) {
            return res.status(401).json({
                status: 'error',
                message: 'Invalid webhook signature'
            });
        }

        const payload = req.body;
        const transaction = await Transaction.findOne({ txRef: payload.txRef });

        if (!transaction) {
            return res.status(404).json({
                status: 'error',
                message: 'Transaction not found'
            });
        }

        if (payload.status === 'successful') {
            transaction.status = 'held';
            transaction.paymentStatus = 'successful';
            transaction.transactionId = payload.id;
            transaction.adminTransactionId = payload.id; // Store the admin's transaction ID
            transaction.balanceType = 'incoming'; // Mark as incoming balance
            transaction.holdUntil = new Date(Date.now() + (3 * 24 * 60 * 60 * 1000)); // 3 days from now
            await transaction.save();
        } else {
            transaction.status = 'failed';
            transaction.paymentStatus = 'failed';
            await transaction.save();
        }

        res.status(200).json({
            status: 'success'
        });
    } catch (error) {
        console.error('Webhook processing error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to process webhook'
        });
    }
});

// Get lawyer's transactions with balance type
app.get('/api/transactions/lawyer/:lawyerId', async (req, res) => {
  try {
    const transactions = await Transaction.find({
      'lawyer.id': req.params.lawyerId
    }).sort({ createdAt: -1 });

    // Calculate total balances
    const balances = {
      incoming: 0,
      available: 0
    };

    transactions.forEach(transaction => {
      if (transaction.status === 'held' && transaction.balanceType === 'incoming') {
        balances.incoming += transaction.amount;
      } else if (transaction.status === 'completed' && transaction.balanceType === 'available') {
        balances.available += transaction.amount;
      }
    });

    res.json({
      transactions,
      balances
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to fetch transactions' 
    });
  }
});

// Cron job to process held payments
cron.schedule('0 */1 * * *', async () => {
    try {
        const now = new Date();
        const pendingTransfers = await Transaction.find({
            status: 'held',
            balanceType: 'incoming',
            holdUntil: { $lte: now },
            transferStatus: 'pending'
        });

        for (const transaction of pendingTransfers) {
            try {
                transaction.transferStatus = 'processing';
                await transaction.save();

                // Transfer between Flutterwave accounts (from admin to lawyer)
                const transferPayload = {
                    merchant_id: transaction.lawyer.flutterwaveAccountId, // Lawyer's Flutterwave subaccount ID
                    amount: transaction.amount,
                    currency: "NGN",
                    reference: `transfer-${uuidv4()}`,
                    meta: {
                        email: transaction.client.email,
                        first_name: transaction.client.name,
                        mobile_number: transaction.client.phone
                    }
                };

                const response = await axios.post(
                    'https://api.flutterwave.com/v3/merchant-accounts/transfer',
                    transferPayload,
                    {
                        headers: {
                            Authorization: `Bearer ${FLUTTERWAVE_SECRET_KEY}`
                        }
                    }
                );

                if (response.data.status === 'success') {
                    transaction.status = 'completed';
                    transaction.transferStatus = 'successful';
                    transaction.balanceType = 'available';
                    transaction.transferReference = response.data.data.reference;
                } else {
                    transaction.transferStatus = 'failed';
                }
                await transaction.save();
            } catch (error) {
                console.error(`Transfer failed for transaction ${transaction.txRef}:`, error);
                transaction.transferStatus = 'failed';
                await transaction.save();
            }
        }
    } catch (error) {
        console.error('Cron job error:', error);
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
