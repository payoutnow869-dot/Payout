import { useState, useEffect } from 'react';
import { Users, Wallet, AlertTriangle, Ticket, ArrowDownRight, Clock } from 'lucide-react';
import { adminAPI } from '../../utils/api';
import { StatCard } from '../../components/Card';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await adminAPI.getStats();
      setStats(res.data.stats);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 mt-1">Overview of platform activity</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        <div className="bg-dark-700 rounded-2xl border border-dark-600 p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Total Users</p>
              <p className="text-3xl font-bold text-white font-mono">
                {loading ? '...' : stats?.totalUsers || 0}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center">
              <Users className="w-6 h-6 text-primary-400" />
            </div>
          </div>
        </div>

        <div className="bg-dark-700 rounded-2xl border border-dark-600 p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Total Balance</p>
              <p className="text-2xl font-bold text-white font-mono truncate">
                {loading ? '...' : formatCurrency(stats?.totalBalance || 0)}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <Wallet className="w-6 h-6 text-emerald-400" />
            </div>
          </div>
        </div>

        <div className="bg-dark-700 rounded-2xl border border-dark-600 p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Frozen Accounts</p>
              <p className="text-3xl font-bold text-white font-mono">
                {loading ? '...' : stats?.frozenAccounts || 0}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-rose-500/20 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-rose-400" />
            </div>
          </div>
        </div>

        <div className="bg-dark-700 rounded-2xl border border-dark-600 p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Pending Withdrawals</p>
              <p className="text-3xl font-bold text-white font-mono">
                {loading ? '...' : stats?.pendingWithdrawals || 0}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <ArrowDownRight className="w-6 h-6 text-amber-400" />
            </div>
          </div>
        </div>

        <div className="bg-dark-700 rounded-2xl border border-dark-600 p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Open Tickets</p>
              <p className="text-3xl font-bold text-white font-mono">
                {loading ? '...' : stats?.openTickets || 0}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <Ticket className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-dark-700 rounded-2xl border border-dark-600 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <a 
              href="/admin/users" 
              className="flex items-center gap-3 p-4 bg-dark-800 rounded-xl hover:bg-dark-600 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary-400" />
              </div>
              <div className="text-left">
                <p className="font-medium text-white">Manage Users</p>
                <p className="text-xs text-gray-400">View & edit users</p>
              </div>
            </a>
            <a 
              href="/admin/withdrawals" 
              className="flex items-center gap-3 p-4 bg-dark-800 rounded-xl hover:bg-dark-600 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-amber-400" />
              </div>
              <div className="text-left">
                <p className="font-medium text-white">Withdrawals</p>
                <p className="text-xs text-gray-400">{stats?.pendingWithdrawals || 0} pending</p>
              </div>
            </a>
            <a 
              href="/admin/tickets" 
              className="flex items-center gap-3 p-4 bg-dark-800 rounded-xl hover:bg-dark-600 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Ticket className="w-5 h-5 text-blue-400" />
              </div>
              <div className="text-left">
                <p className="font-medium text-white">Support Tickets</p>
                <p className="text-xs text-gray-400">{stats?.openTickets || 0} open</p>
              </div>
            </a>
          </div>
        </div>

        <div className="bg-dark-700 rounded-2xl border border-dark-600 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Platform Health</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-dark-800 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-gray-300">Database</span>
              </div>
              <span className="text-emerald-400 text-sm">Operational</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-dark-800 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-gray-300">API Server</span>
              </div>
              <span className="text-emerald-400 text-sm">Operational</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-dark-800 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-gray-300">Authentication</span>
              </div>
              <span className="text-emerald-400 text-sm">Operational</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
