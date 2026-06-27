import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Wallet, ArrowUpRight, ArrowDownRight, Clock, CreditCard, MessageCircle, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { userAPI } from '../../utils/api';
import { Card, StatCard } from '../../components/Card';

export default function HomePage() {
  const { user, updateUser } = useAuth();
  const [balance, setBalance] = useState({ balance: 0, is_frozen: false });
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [balanceRes, txRes] = await Promise.all([
        userAPI.getBalance(),
        userAPI.getTransactions(5, 0)
      ]);
      setBalance(balanceRes.data);
      setTransactions(txRes.data.transactions);
      updateUser({ balance: balanceRes.data.balance });
    } catch (error) {
      console.error('Failed to fetch data:', error);
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

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.name?.split(' ')[0]}!
        </h1>
        <p className="text-gray-500 mt-1">
          Here's an overview of your account
        </p>
      </div>

      {/* Balance Card */}
      <Card className="mb-8 overflow-hidden">
        <div className="bg-gradient-to-br from-primary-600 to-primary-800 p-8 text-white">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-white/70 text-sm">Current Balance</p>
                <p className="text-xs text-white/50">
                  {balance.is_frozen ? 'Account Frozen' : 'Account Active'}
                </p>
              </div>
            </div>
            {balance.is_frozen && (
              <span className="px-3 py-1 bg-rose-500/20 text-rose-300 text-sm font-medium rounded-full">
                Frozen
              </span>
            )}
          </div>
          <p className="text-4xl font-bold font-mono">
            {loading ? (
              <span className="animate-pulse">Loading...</span>
            ) : (
              formatCurrency(balance.balance)
            )}
          </p>
        </div>
        <CardContent>
          <div className="flex gap-3">
            <Link 
              to="/dashboard/withdraw"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary-50 text-primary-600 rounded-xl font-medium hover:bg-primary-100 transition-colors"
            >
              <CreditCard className="w-5 h-5" />
              Withdraw
            </Link>
            <Link 
              to="/dashboard/support"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-50 text-gray-700 rounded-xl font-medium hover:bg-gray-100 transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              Support
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={ArrowUpRight}
          label="Total Deposits"
          value={formatCurrency(
            transactions
              .filter(t => t.type === 'deposit' || (t.type === 'adjustment' && t.amount > 0))
              .reduce((sum, t) => sum + Math.max(0, t.amount), 0)
          )}
        />
        <StatCard
          icon={ArrowDownRight}
          label="Total Withdrawn"
          value={formatCurrency(
            Math.abs(
              transactions
                .filter(t => t.type === 'withdrawal' || t.amount < 0)
                .reduce((sum, t) => sum + t.amount, 0)
            )
          )}
        />
        <StatCard
          icon={Clock}
          label="Last Activity"
          value={transactions.length > 0 ? formatDate(transactions[0].created_at) : 'No activity'}
        />
        <StatCard
          icon={Wallet}
          label="Account Status"
          value={balance.is_frozen ? 'Frozen' : 'Active'}
        />
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 text-center text-gray-500">
              <div className="animate-pulse">Loading transactions...</div>
            </div>
          ) : transactions.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No transactions yet</p>
              <Link to="/dashboard/withdraw" className="text-primary-600 hover:underline mt-2 inline-block">
                Make your first withdrawal
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      tx.amount >= 0 
                        ? 'bg-emerald-50 text-emerald-600' 
                        : 'bg-rose-50 text-rose-600'
                    }`}>
                      {tx.amount >= 0 ? (
                        <ArrowUpRight className="w-5 h-5" />
                      ) : (
                        <ArrowDownRight className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {tx.type === 'adjustment' ? 'Balance Adjustment' : 
                         tx.type === 'deposit' ? 'Deposit' : 
                         tx.type === 'withdrawal' ? 'Withdrawal' :
                         tx.type === 'refund' ? 'Refund' : tx.type}
                      </p>
                      <p className="text-sm text-gray-500">
                        {tx.description || 'No description'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-mono font-medium ${
                      tx.amount >= 0 ? 'text-emerald-600' : 'text-gray-900'
                    }`}>
                      {tx.amount >= 0 ? '+' : ''}{formatCurrency(tx.amount)}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatDate(tx.created_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
        {transactions.length > 0 && (
          <CardFooter className="flex justify-center">
            <button className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
              View all transactions
              <ChevronRight className="w-4 h-4" />
            </button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
