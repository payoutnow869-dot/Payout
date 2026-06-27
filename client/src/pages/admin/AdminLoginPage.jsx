import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/Button';
import Input from '../../components/Input';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { adminLogin } = useAdminAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    if (!email) {
      setErrors({ email: 'Email is required' });
      return;
    }
    if (!password) {
      setErrors({ password: 'Password is required' });
      return;
    }

    setLoading(true);
    try {
      await adminLogin(email, password);
      addToast('Welcome, Admin!', 'success');
      navigate('/admin/dashboard');
    } catch (error) {
      const message = error.response?.data?.error || error.message || 'Login failed';
      addToast(message, 'error');
      if (message.includes('Invalid')) {
        setErrors({ password: message });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div className="text-left">
              <span className="text-2xl font-bold text-white">Admin Panel</span>
              <p className="text-gray-400 text-sm">Payout Platform</p>
            </div>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-dark-700 rounded-2xl border border-dark-600 p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">Admin Access</h1>
            <p className="text-gray-400">Sign in to access the admin panel</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Admin Email"
              type="email"
              placeholder="admin@payout.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
            />

            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
            />

            <Button type="submit" loading={loading} className="w-full bg-amber-500 hover:bg-amber-600">
              Sign In
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-gray-500">
          <a href="/login" className="hover:text-gray-400">← User Login</a>
        </p>
      </div>
    </div>
  );
}
