require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize payment
app.post('/api/payment/initialize', async (req, res) => {
    try {
        const { amount, email, name, phone } = req.body;
        
        // Generate a unique transaction reference
        const txRef = `tx-${uuidv4()}`;
        
        // Create payment payload
        const payload = {
            tx_ref: txRef,
            amount: amount,
            currency: "NGN",
            redirect_url: "http://localhost:3000/payment/callback",
            customer: {
                email: email,
                phone_number: phone,
                name: name
            },
            customizations: {
                title: "My Payment Demo",
                description: "Payment for items in cart",
                logo: "https://your-logo-url.com/logo.png"
            }
        };

        // Initialize payment using Flutterwave's standard endpoint
        const response = await axios.post('https://api.flutterwave.com/v3/payments', payload, {
            headers: {
                'Authorization': `Bearer ${process.env.FLW_SECRET_KEY}`,
                'Content-Type': 'application/json',
            }
        });

        return res.status(200).json(response.data);
    } catch (error) {
        console.error('Payment initialization error:', error.response?.data || error.message);
        return res.status(500).json({ error: 'Payment initialization failed' });
    }
});

// Verify payment
app.get('/api/payment/verify/:transaction_id', async (req, res) => {
    try {
        const { transaction_id } = req.params;
        const response = await axios.get(
            `https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`,
            {
                headers: {
                    'Authorization': `Bearer ${process.env.FLW_SECRET_KEY}`,
                    'Content-Type': 'application/json',
                }
            }
        );
        
        if (response.data.status === "success") {
            return res.status(200).json({ status: 'success', data: response.data.data });
        } else {
            return res.status(400).json({ status: 'failed', data: response.data.data });
        }
    } catch (error) {
        console.error('Payment verification error:', error.response?.data || error.message);
        return res.status(500).json({ error: 'Payment verification failed' });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
