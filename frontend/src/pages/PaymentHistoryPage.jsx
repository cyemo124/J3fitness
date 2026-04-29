import { useState, useEffect } from 'react';
import { paymentAPI } from '../services/api';

export default function PaymentHistoryPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    fetchPayments();
  }, [filter, page]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await paymentAPI.getHistory(
        page,
        12,
        filter === 'all' ? null : filter
      );
      setPayments(response.data);
      setPagination(response.pagination || {});
    } catch (error) {
      setError('Failed to load payment history');
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      successful: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getTypeLabel = (type) => {
    const labels = {
      membership: 'Membership',
      'single-class': 'Single Class',
      'trainer-session': 'Trainer Session',
      other: 'Other'
    };
    return labels[type] || type;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-light py-12">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-dark mb-2">Payment History</h1>
          <p className="text-gray-600">Track all your transactions and receipts</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Filter */}
        <div className="card mb-6">
          <div className="flex flex-wrap gap-2">
            {['all', 'successful', 'pending', 'failed'].map((status) => (
              <button
                key={status}
                onClick={() => {
                  setFilter(status);
                  setPage(1);
                }}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  filter === status
                    ? 'bg-primary text-white'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center min-h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : payments.length > 0 ? (
          <>
            {/* Payments Table */}
            <div className="card overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold">Date</th>
                    <th className="text-left py-3 px-4 font-semibold">Type</th>
                    <th className="text-left py-3 px-4 font-semibold">Reference</th>
                    <th className="text-right py-3 px-4 font-semibold">Amount</th>
                    <th className="text-left py-3 px-4 font-semibold">Status</th>
                    <th className="text-center py-3 px-4 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment._id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{formatDate(payment.createdAt)}</td>
                      <td className="py-3 px-4">{getTypeLabel(payment.type)}</td>
                      <td className="py-3 px-4 text-sm font-mono">{payment.reference || 'N/A'}</td>
                      <td className="py-3 px-4 text-right font-bold">
                        ₦{payment.amount.toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(payment.status)}`}>
                          {payment.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {payment.receiptUrl ? (
                          <a
                            href={payment.receiptUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline text-sm font-semibold"
                          >
                            View Receipt
                          </a>
                        ) : (
                          <span className="text-gray-400 text-sm">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <button
                  className="btn btn-secondary"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </button>
                <span className="flex items-center px-4">
                  Page {page} of {pagination.pages}
                </span>
                <button
                  className="btn btn-secondary"
                  disabled={page === pagination.pages}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="card text-center py-12">
            <p className="text-gray-600 text-lg mb-4">No payments found</p>
          </div>
        )}
      </div>
    </div>
  );
}
