// eslint-disable-next-line no-unused-vars
import { useState, useEffect } from 'react';
import axios from 'axios';

// eslint-disable-next-line react/prop-types
const PaymentForm = ({ lawyerId, lawyerFlutterwaveId }) => {
  const [loading, setLoading] = useState(false);
  const [paymentData, setPaymentData] = useState({
    amount: '',
    clientEmail: '',
    clientName: '',
    clientPhone: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPaymentData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await axios.post('http://localhost:5000/api/payment/initialize', {
        ...paymentData,
        lawyerId,
        lawyerFlutterwaveId
      });
      
      if (response.data.status === 'success') {
        // Redirect to Flutterwave's payment page
        window.location.href = response.data.data.data.link;
      } else {
        alert('Failed to initialize payment. Please try again.');
      }
    } catch (error) {
      console.error('Payment initialization failed:', error);
      alert('Payment initialization failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">Make Payment to Lawyer</h2>
      <form onSubmit={handlePayment} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Your Name</label>
          <input
            type="text"
            name="clientName"
            value={paymentData.clientName}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Your Email</label>
          <input
            type="email"
            name="clientEmail"
            value={paymentData.clientEmail}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Your Phone</label>
          <input
            type="tel"
            name="clientPhone"
            value={paymentData.clientPhone}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Amount (NGN)</label>
          <input
            type="number"
            name="amount"
            value={paymentData.amount}
            onChange={handleInputChange}
            min="100"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {loading ? 'Processing...' : 'Pay Now'}
        </button>
      </form>
    </div>
  );
};

export default PaymentForm;
