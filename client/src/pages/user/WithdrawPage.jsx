import { useState, useEffect } from 'react';
import { CreditCard, Building2, DollarSign, Clock, AlertCircle, ExternalLink, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { userAPI, withdrawAPI } from '../../utils/api';
import Button from '../../components/Button';
import Input, { Select, Textarea } from '../../components/Input';
import { Card, CardHeader, CardContent } from '../../components/Card';

// Payment method icons and info
const paymentMethods = {
  bank_transfer: {
    name: 'Bank Transfer',
    icon: Building2,
    color: 'from-blue-500 to-blue-600',
    placeholder: 'Bank name, Account number, Routing number'
  },
  crypto: {
    name: 'Cryptocurrency',
    icon: DollarSign,
    color: 'from-amber-500 to-orange-500',
    placeholder: 'Enter your wallet address (BTC, ETH, USDT)'
  },
  paypal: {
    name: 'PayPal',
    icon: () => (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
        <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c1.387 2.654-.186 5.09-3.522 6.78-.54.273-1.1.529-1.67.76-.774.313-1.217.315-1.265.315H9.57v.368c-.08-.06-.163-.116-.253-.17.085.054.169.11.254.17l-.254-.17c1.254.412 2.58.72 3.966.913a7.84 7.84 0 0 0 2.024-.046c.64-.085 1.28-.21 1.902-.37.62-.16 1.22-.355 1.79-.576a6.26 6.26 0 0 0 1.22-.71 5.56 5.56 0 0 0 .91-.94 3.8 3.8 0 0 0 .36-1.02 4.44 4.44 0 0 0 .12-1.13c.01-.51-.06-1.016-.16-1.508-.1-.49-.22-.965-.35-1.417z"/>
      </svg>
    ),
    color: 'from-blue-600 to-blue-700'
  },
  cashapp: {
    name: 'Cash App',
    icon: () => (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
        <path d="M4.5 9.5a2.5 2.5 0 0 1 5 0v5a2.5 2.5 0 0 1-5 0v-5zm14 0a2.5 2.5 0 0 1-5 0v-1a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 .5.5v1zm-9.5 4a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h5a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-5zm9.5-2a.5.5 0 0 1-.5.5h-5a.5.5 0 0 1-.5-.5v-5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 .5.5v5z"/>
      </svg>
    ),
    color: 'from-green-500 to-emerald-600'
  },
  zelle: {
    name: 'Zelle',
    icon: () => (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-6h2v6zm4 0h-2v-6h2v6zm-2-8c-.55 0-1-.45-1-1V6h2v2c0 .55-.45 1-1 1z"/>
      </svg>
    ),
    color: 'from-purple-500 to-pink-500'
  },
  chime: {
    name: 'Chime',
    icon: () => (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
      </svg>
    ),
    color: 'from-teal-500 to-cyan-500'
  },
  apple_pay: {
    name: 'Apple Pay',
    icon: () => (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
        <path d="M17.72 14.65c-.47-.32-2.84-.97-3.02-.97-.18 0-.58.09-1.01.37-.43.28-.74.39-1.03.39-.29 0-.76-.11-1.21-.39-.45-.28-2.34-.97-2.34-2.68 0-1.71 1.59-2.56 2.66-2.86.77-.21 1.94-.44 2.96-.97.32-.16.63-.31.9-.42.33-.15.72-.22 1.09-.22.39 0 .75.06 1.09.22.34.16.57.35.78.51.47.34.8.68 1.08 1.02-.26.19-.64.43-1.16.74-.47.32-2.84.97-3.02.97-.18 0-.58-.09-1.01-.37-.43-.28-.74-.39-1.03-.39-.29 0-.76.11-1.21.39-.45.28-.74.39-1.03.39-.29 0-.76-.11-1.21-.39-.45-.28-2.34-.97-2.34-2.68 0-1.71 1.59-2.56 2.66-2.86.77-.21 1.94-.44 2.96-.97.32-.16.63-.31.9-.42.33-.15.72-.22 1.09-.22.39 0 .75.06 1.09.22.34.16.57.35.78.51.47.34.8.68 1.08 1.02-.26.19-.64.43-1.16.74-.47.32-2.84.97-3.02.97-.18 0-.58-.09-1.01-.37-.43-.28-.74-.39-1.03-.39-.29 0-.76.11-1.21.39-.45.28-.74.39-1.03.39-.29 0-.76-.11-1.21-.39-.45-.28-2.34-.97-2.34-2.68 0-1.71 1.59-2.56 2.66-2.86.77-.21 1.94-.44 2.96-.97.32-.16.63-.31.9-.42.33-.15.72-.22 1.09-.22.39 0 .75.06 1.09.22.34.16.57.35.78.51.47.34.8.68 1.08 1.02-.26.19-.64.43-1.16.74-.47.32-2.84.97-3.02.97-.18 0-.58-.09-1.01-.37-.43-.28-.74-.39-1.03-.39-.29 0-.76.11-1.21.39-.45.28-.74.39-1.03.39-.29 0-.76-.11-1.21-.39-.45-.28-2.34-.97-2.34-2.68 0-1.71 1.59-2.56 2.66-2.86.77-.21 1.94-.44 2.96-.97.32-.16.63-.31.9-.42.33-.15.72-.22 1.09-.22.39 0 .75.06 1.09.22.34.16.57.35.78.51.47.34.8.68 1.08 1.02-.26.19-.64.43-1.16.74z"/>
      </svg>
    ),
    color: 'from-gray-700 to-gray-900'
  }
};

export default function WithdrawPage() {
  const { user } = useAuth();
  const { addToast } = useToast();
  
  const [balance, setBalance] = useState(0);
  const [is_frozen, setIsFrozen] = useState(false);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('bank_transfer');
  const [details, setDetails] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  
  // Fee calculation state
  const [feeInfo, setFeeInfo] = useState({ feePercent: 20, feePaymentLinks: [] });
  const [feeCalculation, setFeeCalculation] = useState(null);
  const [showFeeModal, setShowFeeModal] = useState(false);
  const [feePaid, setFeePaid] = useState(false);

  useEffect(() => {
    fetchData();
    fetchFeeInfo();
  }, []);

  const fetchData = async () => {
    try {
      const [balanceRes, historyRes] = await Promise.all([
        userAPI.getBalance(),
        withdrawAPI.getHistory(10, 0)
      ]);
      setBalance(balanceRes.data.balance);
      setIsFrozen(balanceRes.data.is_frozen);
      setHistory(historyRes.data.withdrawals);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setHistoryLoading(false);
    }
  };

  const fetchFeeInfo = async () => {
    try {
      const res = await withdrawAPI.getFeeInfo();
      setFeeInfo(res.data);
    } catch (error) {
      console.error('Failed to fetch fee info:', error);
    }
  };

  const calculateFee = async () => {
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount < 10) {
      addToast('Minimum withdrawal is $10', 'error');
      return;
    }

    try {
      const res = await withdrawAPI.calculateFee(numAmount);
      setFeeCalculation(res.data);
      setShowFeeModal(true);
    } catch (error) {
      addToast('Failed to calculate fee', 'error');
    }
  };

  const handleContinueWithdrawal = () => {
    if (!feePaid) {
      addToast('Please confirm that you have paid the fee', 'warning');
      return;
    }
    setShowFeeModal(false);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const numAmount = parseFloat(amount);
    
    if (!numAmount || numAmount < 10) {
      addToast('Minimum withdrawal is $10', 'error');
      return;
    }
    
    if (!feeCalculation) {
      addToast('Please calculate the fee first', 'error');
      return;
    }
    
    if (!feePaid) {
      addToast('Please confirm that you have paid the fee', 'error');
      return;
    }
    
    if (!details.trim()) {
      addToast('Please provide payment details', 'error');
      return;
    }

    if (is_frozen) {
      addToast('Your account is frozen. Contact support.', 'error');
      return;
    }

    if (numAmount + (feeCalculation?.feeAmount || 0) > balance) {
      addToast('Insufficient balance (including fee)', 'error');
      return;
    }

    setLoading(true);
    try {
      await withdrawAPI.create({ 
        amount: numAmount, 
        method, 
        details, 
        note,
        feePaid: true
      });
      addToast('Withdrawal submitted! Awaiting admin approval after fee payment.', 'success');
      setAmount('');
      setDetails('');
      setNote('');
      setFeeCalculation(null);
      setFeePaid(false);
      fetchData();
    } catch (error) {
      addToast(error.response?.data?.error || 'Failed to submit withdrawal', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-amber-50 text-amber-600',
      processing: 'bg-blue-50 text-blue-600',
      approved: 'bg-emerald-50 text-emerald-600',
      rejected: 'bg-rose-50 text-rose-600'
    };
    const labels = {
      pending: 'Pending',
      processing: 'Awaiting Approval',
      approved: 'Approved',
      rejected: 'Rejected'
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status] || styles.pending}`}>
        {labels[status] || status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getMethodName = (methodKey) => {
    return paymentMethods[methodKey]?.name || methodKey;
  };

  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Withdraw Funds</h1>
        <p className="text-gray-500 mt-1">Request a withdrawal to your preferred payment method</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Withdrawal Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">New Withdrawal</h2>
            </CardHeader>
            <CardContent>
              {is_frozen ? (
                <div className="flex items-center gap-3 p-4 bg-rose-50 text-rose-700 rounded-xl mb-6">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p>Your account is frozen. Please contact support to resolve this issue.</p>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-4 bg-amber-50 text-amber-700 rounded-xl mb-6">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p>A {feeInfo.feePercent}% withdrawal fee applies. Minimum withdrawal: $10.00</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Balance Display */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <span className="text-gray-600">Available Balance</span>
                  <span className="text-xl font-bold font-mono text-gray-900">
                    {formatCurrency(balance)}
                  </span>
                </div>

                {/* Amount Input */}
                <Input
                  label="Amount (USD)"
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    setFeeCalculation(null);
                    setFeePaid(false);
                  }}
                  min="10"
                  step="0.01"
                  disabled={is_frozen}
                />

                {/* Calculate Fee Button */}
                {amount && parseFloat(amount) >= 10 && !feeCalculation && (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={calculateFee}
                    className="w-full"
                    disabled={is_frozen}
                  >
                    Calculate Fee & Continue
                  </Button>
                )}

                {/* Payment Method Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Payment Method
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {Object.entries(paymentMethods).map(([key, methodInfo]) => {
                      const IconComponent = methodInfo.icon;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setMethod(key)}
                          disabled={is_frozen}
                          className={`
                            relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all
                            ${method === key 
                              ? 'border-primary-500 bg-primary-50' 
                              : 'border-gray-200 hover:border-gray-300 bg-white'}
                            ${is_frozen ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                          `}
                        >
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${methodInfo.color} flex items-center justify-center text-white`}>
                            {typeof IconComponent === 'function' ? <IconComponent /> : <IconComponent className="w-6 h-6" />}
                          </div>
                          <span className="text-sm font-medium text-gray-700 text-center">{methodInfo.name}</span>
                          {method === key && (
                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                              <CheckCircle2 className="w-4 h-4 text-white" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <Input
                  label="Payment Details"
                  type="text"
                  placeholder={paymentMethods[method]?.placeholder || 'Enter your payment details'}
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  disabled={is_frozen}
                />

                <Textarea
                  label="Note (Optional)"
                  placeholder="Any additional information for this withdrawal..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  disabled={is_frozen}
                />

                {/* Fee Summary */}
                {feeCalculation && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-700">Withdrawal Amount</span>
                      <span className="font-mono font-medium">{formatCurrency(feeCalculation.originalAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Fee to Pay ({feeCalculation.feePercent}%)</span>
                      <span className="font-mono font-medium text-rose-600">{formatCurrency(feeCalculation.feeAmount)}</span>
                    </div>
                    <div className="border-t border-blue-200 pt-2 flex justify-between">
                      <span className="font-semibold text-gray-900">Balance After Approval</span>
                      <span className="font-mono font-bold text-lg text-emerald-600">{formatCurrency(feeCalculation.userBalance - feeCalculation.originalAmount)}</span>
                    </div>
                  </div>
                )}

                <Button 
                  type="submit" 
                  loading={loading} 
                  disabled={is_frozen || !feeCalculation || !feePaid}
                  className="w-full"
                >
                  Submit Withdrawal Request
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Info Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h3 className="font-semibold text-gray-900">Fee Information</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-amber-50 rounded-xl">
                <span className="text-amber-800 font-medium">Withdrawal Fee</span>
                <span className="text-xl font-bold font-mono text-amber-600">{feeInfo.feePercent}%</span>
              </div>
              <p className="text-sm text-gray-500">
                A {feeInfo.feePercent}% fee is charged on all withdrawals. This fee must be paid before your withdrawal can be processed.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="font-semibold text-gray-900">Payment Methods</h3>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(paymentMethods).map(([key, methodInfo]) => {
                const IconComponent = methodInfo.icon;
                return (
                  <div key={key} className="flex items-center gap-3 p-2">
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${methodInfo.color} flex items-center justify-center text-white flex-shrink-0`}>
                      {typeof IconComponent === 'function' ? <IconComponent /> : <IconComponent className="w-4 h-4" />}
                    </div>
                    <span className="text-sm font-medium text-gray-700">{methodInfo.name}</span>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Withdrawal History */}
      <Card className="mt-8">
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">Withdrawal History</h2>
        </CardHeader>
        <CardContent className="p-0">
          {historyLoading ? (
            <div className="p-6 text-center text-gray-500">
              <div className="animate-pulse">Loading history...</div>
            </div>
          ) : history.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No withdrawal history</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Fee</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {history.map((withdrawal) => (
                    <tr key={withdrawal.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {formatDate(withdrawal.created_at)}
                      </td>
                      <td className="px-6 py-4 font-mono font-medium text-gray-900">
                        {formatCurrency(withdrawal.amount)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className="text-gray-500 italic">Paid externally</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {getMethodName(withdrawal.method)}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(withdrawal.status)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Fee Payment Modal */}
      {showFeeModal && feeCalculation && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowFeeModal(false)} />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl animate-fade-in">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-xl font-bold text-gray-900">Withdrawal Fee Payment</h3>
                <p className="text-gray-500 text-sm mt-1">Contact admin via any link below to pay your withdrawal fee</p>
              </div>
              
              <div className="p-6 space-y-4">
                {/* Fee Summary */}
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-700">Withdrawal Amount</span>
                    <span className="font-mono font-medium text-gray-900">{formatCurrency(feeCalculation.originalAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Fee to Pay ({feeCalculation.feePercent}%)</span>
                    <span className="font-mono font-bold text-lg text-rose-600">{formatCurrency(feeCalculation.feeAmount)}</span>
                  </div>
                  <div className="border-t border-blue-200 pt-2 flex justify-between">
                    <span className="font-semibold text-gray-900">Your Balance After Approval</span>
                    <span className="font-mono font-bold text-xl text-emerald-600">{formatCurrency(feeCalculation.userBalance - feeCalculation.originalAmount)}</span>
                  </div>
                </div>

                {/* Payment Links */}
                <div className="space-y-3">
                  <p className="font-medium text-gray-900 flex items-center gap-2">
                    <ExternalLink className="w-4 h-4" />
                    Click any link below to contact admin and pay the fee:
                  </p>
                  {feeInfo.feePaymentLinks.map((link, index) => {
                    const methodInfo = paymentMethods[link.name.toLowerCase().replace(' ', '_')] || {};
                    return (
                      <a
                        key={index}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
                      >
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${methodInfo.color || 'from-gray-400 to-gray-500'} flex items-center justify-center text-white flex-shrink-0`}>
                          {typeof methodInfo.icon === 'function' ? <methodInfo.icon /> : <CreditCard className="w-5 h-5" />}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{link.name}</p>
                        </div>
                        <ExternalLink className="w-5 h-5 text-gray-400" />
                      </a>
                    );
                  })}
                </div>

                {/* Instructions */}
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <p className="text-sm text-amber-800">
                    <strong>Important:</strong> After paying the fee externally through one of the links above, 
                    check the box below and click "Confirm & Submit" to submit your withdrawal request.
                    Admin will review and approve your withdrawal once the fee payment is confirmed.
                  </p>
                </div>

                {/* Confirmation */}
                <div className="flex items-start gap-3 p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                  <input
                    type="checkbox"
                    id="feePaidCheckbox"
                    checked={feePaid}
                    onChange={(e) => setFeePaid(e.target.checked)}
                    className="mt-1 w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <label htmlFor="feePaidCheckbox" className="text-sm text-gray-700 cursor-pointer">
                    I have contacted admin and paid the withdrawal fee of <span className="font-bold">{formatCurrency(feeCalculation.feeAmount)}</span> externally.
                  </label>
                </div>
              </div>

              <div className="p-6 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl">
                <div className="flex gap-3">
                  <Button
                    variant="secondary"
                    onClick={() => setShowFeeModal(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleContinueWithdrawal}
                    disabled={!feePaid}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-600"
                  >
                    Confirm & Submit Withdrawal
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
