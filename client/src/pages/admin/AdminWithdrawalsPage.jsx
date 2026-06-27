import { useState, useEffect } from 'react';
import { Wallet, Check, X, Clock, Filter } from 'lucide-react';
import { adminAPI } from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/Modal';
import Button from '../../components/Button';
import Input, { Textarea } from '../../components/Input';

export default function AdminWithdrawalsPage() {
  const { addToast } = useToast();
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [processAction, setProcessAction] = useState(null);
  const [adminNote, setAdminNote] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchWithdrawals();
  }, [filter]);

  const fetchWithdrawals = async () => {
    setLoading(true);
    try {
      const status = filter === 'all' ? null : filter;
      const res = await adminAPI.getWithdrawals(status, 50, 0);
      setWithdrawals(res.data.withdrawals);
    } catch (error) {
      console.error('Failed to fetch withdrawals:', error);
      addToast('Failed to load withdrawals', 'error');
    } finally {
      setLoading(false);
    }
  };

  const processWithdrawal = async () => {
    if (!adminNote.trim()) {
      addToast('Please provide a note', 'error');
      return;
    }

    setProcessing(true);
    try {
      await adminAPI.processWithdrawal(selectedWithdrawal, processAction, adminNote);
      addToast(`Withdrawal ${processAction} successfully`, 'success');
      setShowProcessModal(false);
      setAdminNote('');
      setSelectedWithdrawal(null);
      fetchWithdrawals();
    } catch (error) {
      addToast(error.response?.data?.error || 'Failed to process withdrawal', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-amber-50 text-amber-600 border-amber-200',
      processing: 'bg-blue-50 text-blue-600 border-blue-200',
      approved: 'bg-emerald-50 text-emerald-600 border-emerald-200',
      rejected: 'bg-rose-50 text-rose-600 border-rose-200'
    };
    const labels = {
      pending: 'Pending',
      processing: 'Processing',
      approved: 'Approved',
      rejected: 'Rejected'
    };
    return (
      <span className={`px-3 py-1 text-xs font-medium rounded-full border ${styles[status] || styles.pending}`}>
        {labels[status] || status}
      </span>
    );
  };

  const pendingCount = withdrawals.filter(w => w.status === 'processing').length;

  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Withdrawal Requests</h1>
          <p className="text-gray-400 mt-1">
            {pendingCount > 0 ? `${pendingCount} pending request${pendingCount > 1 ? 's' : ''}` : 'No pending requests'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 bg-dark-700 border border-dark-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All</option>
            <option value="processing">Processing</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Withdrawals Table */}
      <div className="bg-dark-700 rounded-2xl border border-dark-600 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-600">
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">User</th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Amount</th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Method</th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                <th className="text-right px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-600">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-400">
                    <div className="animate-pulse">Loading...</div>
                  </td>
                </tr>
              ) : withdrawals.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-400">
                    <Wallet className="w-12 h-12 mx-auto mb-3 text-gray-500" />
                    <p>No withdrawals found</p>
                  </td>
                </tr>
              ) : (
                withdrawals.map((withdrawal) => (
                  <tr key={withdrawal.id} className="hover:bg-dark-600/50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-white">{withdrawal.user_name}</p>
                        <p className="text-sm text-gray-400">{withdrawal.user_email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono font-medium text-white text-lg">
                        {formatCurrency(withdrawal.amount)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-300 capitalize">
                        {withdrawal.method === 'bank_transfer' ? 'Bank Transfer' : 'Cryptocurrency'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(withdrawal.status)}
                    </td>
                    <td className="px-6 py-4 text-gray-400">
                      {formatDate(withdrawal.created_at)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => { setSelectedWithdrawal(withdrawal); setShowProcessModal(true); }}
                          className="p-2 hover:bg-dark-500 rounded-lg transition-colors"
                          title="Process"
                          disabled={withdrawal.status !== 'pending'}
                        >
                          <Clock className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Process Modal */}
      <Modal
        isOpen={showProcessModal}
        onClose={() => { setShowProcessModal(false); setSelectedWithdrawal(null); setAdminNote(''); }}
        title="Process Withdrawal"
        size="md"
      >
        {selectedWithdrawal && (
          <div className="space-y-6">
            {/* Withdrawal Details */}
            <div className="p-4 bg-gray-50 rounded-xl space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500">User</span>
                <span className="font-medium text-gray-900">{selectedWithdrawal.user_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Amount</span>
                <span className="font-mono font-bold text-primary-600 text-lg">
                  {formatCurrency(selectedWithdrawal.amount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Method</span>
                <span className="text-gray-900">
                  {selectedWithdrawal.method === 'bank_transfer' ? 'Bank Transfer' : 'Cryptocurrency'}
                </span>
              </div>
              <div className="border-t border-gray-200 pt-3">
                <p className="text-sm text-gray-500 mb-1">Payment Details</p>
                <p className="text-gray-900 bg-white p-3 rounded-lg border border-gray-200 font-mono text-sm">
                  {selectedWithdrawal.details}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setProcessAction('approved')}
                className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  processAction === 'approved'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                    : 'border-gray-200 hover:border-emerald-300'
                }`}
              >
                <Check className="w-5 h-5" />
                <span className="font-medium">Approve</span>
              </button>
              <button
                onClick={() => setProcessAction('rejected')}
                className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  processAction === 'rejected'
                    ? 'border-rose-500 bg-rose-50 text-rose-700'
                    : 'border-gray-200 hover:border-rose-300'
                }`}
              >
                <X className="w-5 h-5" />
                <span className="font-medium">Reject</span>
              </button>
            </div>

            {/* Admin Note */}
            <Textarea
              label="Admin Note"
              placeholder={
                processAction === 'rejected'
                  ? 'Explain why this withdrawal is being rejected...'
                  : 'Add any notes about this approval...'
              }
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
            />

            {/* Confirm Button */}
            <Button
              onClick={processWithdrawal}
              loading={processing}
              disabled={!processAction}
              className={`w-full ${
                processAction === 'rejected' ? 'bg-rose-500 hover:bg-rose-600' : ''
              } ${processAction === 'approved' ? 'bg-emerald-500 hover:bg-emerald-600' : ''}`}
            >
              Confirm {processAction === 'approved' ? 'Approval' : 'Rejection'}
            </Button>

            {processAction === 'rejected' && (
              <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
                Note: Rejecting this withdrawal will refund the amount to the user's balance.
              </p>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
