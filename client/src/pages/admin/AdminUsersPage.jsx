import { useState, useEffect } from 'react';
import { Search, Users, Eye, Snowflake, RefreshCw, Plus, Minus } from 'lucide-react';
import { adminAPI } from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/Modal';
import Button from '../../components/Button';
import Input, { Textarea } from '../../components/Input';

export default function AdminUsersPage() {
  const { addToast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjustType, setAdjustType] = useState('add');
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustReason, setAdjustReason] = useState('');
  const [adjusting, setAdjusting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [search]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getUsers(search, 50, 0);
      setUsers(res.data.users);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      addToast('Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  };

  const viewUser = async (userId) => {
    setDetailsLoading(true);
    setSelectedUser(userId);
    try {
      const res = await adminAPI.getUser(userId);
      setUserDetails(res.data);
    } catch (error) {
      console.error('Failed to fetch user details:', error);
      addToast('Failed to load user details', 'error');
    } finally {
      setDetailsLoading(false);
    }
  };

  const toggleFreeze = async (userId) => {
    try {
      await adminAPI.toggleStatus(userId);
      addToast('User status updated', 'success');
      fetchUsers();
      if (selectedUser === userId) {
        viewUser(userId);
      }
    } catch (error) {
      addToast('Failed to update status', 'error');
    }
  };

  const handleAdjustBalance = async () => {
    if (!adjustAmount || !adjustReason) {
      addToast('Please fill all fields', 'error');
      return;
    }

    setAdjusting(true);
    try {
      const amount = adjustType === 'add' ? parseFloat(adjustAmount) : -parseFloat(adjustAmount);
      await adminAPI.adjustBalance(selectedUser, amount, adjustReason);
      addToast('Balance adjusted successfully', 'success');
      setShowAdjustModal(false);
      setAdjustAmount('');
      setAdjustReason('');
      fetchUsers();
      viewUser(selectedUser);
    } catch (error) {
      addToast(error.response?.data?.error || 'Failed to adjust balance', 'error');
    } finally {
      setAdjusting(false);
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
      year: 'numeric'
    });
  };

  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">User Management</h1>
          <p className="text-gray-400 mt-1">Manage all platform users</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2.5 bg-dark-700 border border-dark-600 rounded-xl text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 w-full md:w-80"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-dark-700 rounded-2xl border border-dark-600 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-600">
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">User</th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Balance</th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Joined</th>
                <th className="text-right px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-600">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-400">
                    <div className="animate-pulse">Loading users...</div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-400">
                    <Users className="w-12 h-12 mx-auto mb-3 text-gray-500" />
                    <p>No users found</p>
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-dark-600/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {user.name?.charAt(0)?.toUpperCase() || 'U'}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-white">{user.name}</p>
                          <p className="text-sm text-gray-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono font-medium text-white">
                        {formatCurrency(user.balance)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        user.is_frozen 
                          ? 'bg-rose-500/20 text-rose-400' 
                          : 'bg-emerald-500/20 text-emerald-400'
                      }`}>
                        {user.is_frozen ? 'Frozen' : 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-400">
                      {formatDate(user.created_at)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => viewUser(user.id)}
                          className="p-2 hover:bg-dark-500 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4 text-gray-400" />
                        </button>
                        <button
                          onClick={() => toggleFreeze(user.id)}
                          className={`p-2 rounded-lg transition-colors ${
                            user.is_frozen 
                              ? 'hover:bg-emerald-500/20' 
                              : 'hover:bg-rose-500/20'
                          }`}
                          title={user.is_frozen ? 'Unfreeze' : 'Freeze'}
                        >
                          <Snowflake className={`w-4 h-4 ${
                            user.is_frozen ? 'text-emerald-400' : 'text-rose-400'
                          }`} />
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

      {/* User Details Modal */}
      <Modal
        isOpen={!!selectedUser}
        onClose={() => { setSelectedUser(null); setUserDetails(null); }}
        title="User Details"
        size="lg"
      >
        {detailsLoading ? (
          <div className="text-center py-8">
            <div className="animate-pulse text-gray-400">Loading...</div>
          </div>
        ) : userDetails ? (
          <div className="space-y-6">
            {/* User Info */}
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                <span className="text-white font-bold text-xl">
                  {userDetails.user.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{userDetails.user.name}</h3>
                <p className="text-gray-500">{userDetails.user.email}</p>
                <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full mt-1 ${
                  userDetails.user.is_frozen 
                    ? 'bg-rose-100 text-rose-600' 
                    : 'bg-emerald-100 text-emerald-600'
                }`}>
                  {userDetails.user.is_frozen ? 'Frozen' : 'Active'}
                </span>
              </div>
            </div>

            {/* Balance */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-primary-50 rounded-xl">
                <p className="text-sm text-gray-600">Current Balance</p>
                <p className="text-2xl font-bold font-mono text-primary-600">
                  {formatCurrency(userDetails.user.balance)}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-600">Joined</p>
                <p className="text-lg font-medium text-gray-900">
                  {formatDate(userDetails.user.created_at)}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => { setAdjustType('add'); setShowAdjustModal(true); }}
                className="flex-1"
              >
                <Plus className="w-4 h-4" />
                Add Balance
              </Button>
              <Button
                variant="secondary"
                onClick={() => { setAdjustType('subtract'); setShowAdjustModal(true); }}
                className="flex-1"
              >
                <Minus className="w-4 h-4" />
                Deduct
              </Button>
              <Button
                variant={userDetails.user.is_frozen ? 'primary' : 'danger'}
                onClick={() => toggleFreeze(selectedUser)}
                className="flex-1"
              >
                <Snowflake className="w-4 h-4" />
                {userDetails.user.is_frozen ? 'Unfreeze' : 'Freeze'}
              </Button>
            </div>

            {/* Recent Activity */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Recent Transactions</h4>
              {userDetails.transactions.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No transactions</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {userDetails.transactions.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900 capitalize">{tx.type}</p>
                        <p className="text-sm text-gray-500">{tx.description || 'No description'}</p>
                      </div>
                      <span className={`font-mono font-medium ${
                        tx.amount >= 0 ? 'text-emerald-600' : 'text-gray-900'
                      }`}>
                        {tx.amount >= 0 ? '+' : ''}{formatCurrency(tx.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </Modal>

      {/* Adjust Balance Modal */}
      <Modal
        isOpen={showAdjustModal}
        onClose={() => setShowAdjustModal(false)}
        title={adjustType === 'add' ? 'Add Balance' : 'Deduct Balance'}
        size="sm"
      >
        <div className="space-y-4">
          <Input
            label="Amount (USD)"
            type="number"
            placeholder="0.00"
            value={adjustAmount}
            onChange={(e) => setAdjustAmount(e.target.value)}
            min="0.01"
            step="0.01"
          />
          <Textarea
            label="Reason"
            placeholder="Enter reason for this adjustment..."
            value={adjustReason}
            onChange={(e) => setAdjustReason(e.target.value)}
          />
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => setShowAdjustModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAdjustBalance}
              loading={adjusting}
              className={`flex-1 ${adjustType === 'subtract' ? 'bg-rose-500 hover:bg-rose-600' : ''}`}
            >
              {adjustType === 'add' ? 'Add' : 'Deduct'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
