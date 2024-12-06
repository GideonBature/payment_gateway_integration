import { useState, useEffect } from 'react';
import axios from 'axios';

// eslint-disable-next-line react/prop-types
const TransactionStatus = ({ lawyerId }) => {
  const [transactions, setTransactions] = useState([]);
  const [balances, setBalances] = useState({ incoming: 0, available: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/transactions/lawyer/${lawyerId}`);
        setTransactions(response.data.transactions);
        setBalances(response.data.balances);
      } catch (error) {
        console.error('Failed to fetch transactions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
    // Refresh every 5 minutes
    const interval = setInterval(fetchTransactions, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [lawyerId]);

  const getStatusBadgeColor = (status, balanceType) => {
    if (status === 'held' && balanceType === 'incoming') {
      return 'bg-yellow-100 text-yellow-800';
    } else if (status === 'completed' && balanceType === 'available') {
      return 'bg-green-100 text-green-800';
    } else if (status === 'failed') {
      return 'bg-red-100 text-red-800';
    }
    return 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status, balanceType) => {
    if (status === 'held' && balanceType === 'incoming') {
      return 'Incoming';
    } else if (status === 'completed' && balanceType === 'available') {
      return 'Available';
    } else if (status === 'failed') {
      return 'Failed';
    }
    return status;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Payment History</h3>
        <div className="mt-2 grid grid-cols-2 gap-4">
          <div className="bg-yellow-50 p-4 rounded-lg">
            <p className="text-sm text-yellow-800">Incoming Balance</p>
            <p className="text-2xl font-bold text-yellow-900">₦{balances.incoming.toLocaleString()}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-green-800">Available Balance</p>
            <p className="text-2xl font-bold text-green-900">₦{balances.available.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200">
        {transactions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No payments found</div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {transactions.map((transaction) => (
              <li key={transaction._id} className="px-4 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between space-x-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        From: {transaction.client.name}
                      </p>
                      <div className="ml-2">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(
                            transaction.status,
                            transaction.balanceType
                          )}`}
                        >
                          {getStatusText(transaction.status, transaction.balanceType)}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-500">
                        <span>₦{transaction.amount.toLocaleString()}</span>
                        <span className="mx-2">•</span>
                        <span>{new Date(transaction.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    {transaction.status === 'held' && transaction.balanceType === 'incoming' && (
                      <p className="mt-1 text-sm text-gray-500">
                        Available on {new Date(transaction.holdUntil).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default TransactionStatus;
