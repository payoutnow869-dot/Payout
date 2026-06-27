import { useState, useEffect } from 'react';
import { Settings, Link, Percent, Save, Plus, Trash2 } from 'lucide-react';
import { adminAPI } from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/Button';
import Input from '../../components/Input';

export default function AdminSettingsPage() {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [feePercent, setFeePercent] = useState(20);
  const [feeLinks, setFeeLinks] = useState([]);
  const [newLink, setNewLink] = useState({ name: '', url: '' });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getSettings();
      const settings = res.data.settings;
      
      if (settings.withdrawal_fee_percent) {
        setFeePercent(parseFloat(settings.withdrawal_fee_percent));
      }
      if (settings.fee_payment_links) {
        setFeeLinks(settings.fee_payment_links);
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      addToast('Failed to load settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveFeePercent = async () => {
    setSaving(true);
    try {
      await adminAPI.updateFeePercent(feePercent);
      addToast('Fee percent updated successfully', 'success');
    } catch (error) {
      addToast('Failed to update fee percent', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAddLink = async () => {
    if (!newLink.name.trim() || !newLink.url.trim()) {
      addToast('Please fill in both name and URL', 'error');
      return;
    }

    const updatedLinks = [...feeLinks, { ...newLink }];
    setFeeLinks(updatedLinks);
    setNewLink({ name: '', url: '' });

    setSaving(true);
    try {
      await adminAPI.updateFeeLinks(updatedLinks);
      addToast('Payment link added successfully', 'success');
    } catch (error) {
      // Revert on error
      setFeeLinks(feeLinks);
      addToast('Failed to add link', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveLink = async (index) => {
    const updatedLinks = feeLinks.filter((_, i) => i !== index);
    const originalLinks = [...feeLinks];
    setFeeLinks(updatedLinks);

    setSaving(true);
    try {
      await adminAPI.updateFeeLinks(updatedLinks);
      addToast('Payment link removed successfully', 'success');
    } catch (error) {
      // Revert on error
      setFeeLinks(originalLinks);
      addToast('Failed to remove link', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateLink = async (index, field, value) => {
    const updatedLinks = feeLinks.map((link, i) => 
      i === index ? { ...link, [field]: value } : link
    );
    const originalLinks = [...feeLinks];
    setFeeLinks(updatedLinks);

    setSaving(true);
    try {
      await adminAPI.updateFeeLinks(updatedLinks);
      addToast('Payment link updated successfully', 'success');
    } catch (error) {
      // Revert on error
      setFeeLinks(originalLinks);
      addToast('Failed to update link', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 lg:p-8">
        <div className="animate-pulse text-gray-400">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-gray-400 mt-1">Configure withdrawal fees and payment links</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Withdrawal Fee Settings */}
        <div className="bg-dark-700 rounded-2xl border border-dark-600 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <Percent className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Withdrawal Fee</h2>
              <p className="text-sm text-gray-400">Set the percentage fee for withdrawals</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Fee Percentage
              </label>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    value={feePercent}
                    onChange={(e) => setFeePercent(parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-3 bg-dark-800 border border-dark-600 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">%</span>
                </div>
                <Button
                  onClick={handleSaveFeePercent}
                  loading={saving}
                  className="bg-amber-500 hover:bg-amber-600"
                >
                  <Save className="w-4 h-4" />
                  Save
                </Button>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Current: {feePercent}% fee on all withdrawals
              </p>
            </div>

            {/* Example calculation */}
            <div className="p-4 bg-dark-800 rounded-xl">
              <p className="text-sm text-gray-400 mb-2">Example calculation:</p>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between text-gray-300">
                  <span>Withdrawal amount</span>
                  <span className="font-mono">$100.00</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Fee ({feePercent}%)</span>
                  <span className="font-mono text-rose-400">-${(100 * feePercent / 100).toFixed(2)}</span>
                </div>
                <div className="border-t border-dark-600 pt-1 flex justify-between text-white font-medium">
                  <span>Total deduction</span>
                  <span className="font-mono">${(100 + (100 * feePercent / 100)).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fee Payment Links */}
        <div className="bg-dark-700 rounded-2xl border border-dark-600 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <Link className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Fee Payment Links</h2>
              <p className="text-sm text-gray-400">Links users click to pay withdrawal fees</p>
            </div>
          </div>

          {/* Existing Links */}
          <div className="space-y-3 mb-4">
            {feeLinks.map((link, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-dark-800 rounded-xl">
                <div className="flex-1 space-y-2">
                  <input
                    type="text"
                    value={link.name}
                    onChange={(e) => handleUpdateLink(index, 'name', e.target.value)}
                    placeholder="Payment method name"
                    className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <input
                    type="url"
                    value={link.url}
                    onChange={(e) => handleUpdateLink(index, 'url', e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <button
                  onClick={() => handleRemoveLink(index)}
                  className="p-2 hover:bg-rose-500/20 rounded-lg transition-colors"
                >
                  <Trash2 className="w-5 h-5 text-rose-400" />
                </button>
              </div>
            ))}
          </div>

          {/* Add New Link */}
          <div className="border-t border-dark-600 pt-4">
            <p className="text-sm text-gray-400 mb-3">Add new payment link:</p>
            <div className="space-y-2">
              <Input
                placeholder="Payment method name (e.g., PayPal, CashApp)"
                value={newLink.name}
                onChange={(e) => setNewLink({ ...newLink, name: e.target.value })}
              />
              <Input
                placeholder="URL (e.g., https://paypal.me/...)"
                value={newLink.url}
                onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
              />
              <Button
                onClick={handleAddLink}
                variant="secondary"
                className="w-full"
              >
                <Plus className="w-4 h-4" />
                Add Link
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Info Card */}
      <div className="mt-8 bg-dark-700 rounded-2xl border border-dark-600 p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
            <Settings className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">How It Works</h3>
            <ul className="text-sm text-gray-400 space-y-2">
              <li>1. Users enter a withdrawal amount on the Withdraw page</li>
              <li>2. The system calculates the {feePercent}% fee and displays it</li>
              <li>3. Users see the fee payment links configured here</li>
              <li>4. Users click a link to contact admin and pay the fee</li>
              <li>5. After confirming payment, users can complete their withdrawal</li>
              <li>6. Both withdrawal amount and fee are deducted from user's balance</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
