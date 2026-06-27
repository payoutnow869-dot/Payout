import { Link } from 'react-router-dom';
import { Wallet, Shield, Zap, ArrowRight, Users, CreditCard, Headphones } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary-50">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                <span className="text-white font-bold text-lg">P</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Payout</span>
            </div>
            <div className="flex items-center gap-4">
              <Link 
                to="/login" 
                className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                Sign In
              </Link>
              <Link 
                to="/register" 
                className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-xl transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 rounded-full text-primary-600 text-sm font-medium mb-6">
              <Zap className="w-4 h-4" />
              Fast & Secure Platform
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight mb-6">
              Manage Your Funds with
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-400"> Confidence</span>
            </h1>
            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
              A secure platform to manage your balance, withdraw funds, and get support whenever you need it. Your financial freedom starts here.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                to="/register" 
                className="flex items-center gap-2 px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-primary-500/30"
              >
                Create Account
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link 
                to="/login" 
                className="flex items-center gap-2 px-8 py-4 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-xl border border-gray-200 transition-all"
              >
                Sign In
              </Link>
            </div>
          </div>

          {/* Hero Image/Visual */}
          <div className="mt-16 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent z-10 pointer-events-none h-32 bottom-0 top-auto" />
            <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-3xl p-8 shadow-2xl">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/10 backdrop-blur rounded-2xl p-6 text-center">
                  <Wallet className="w-12 h-12 text-white/80 mx-auto mb-4" />
                  <p className="text-3xl font-bold text-white font-mono">$10M+</p>
                  <p className="text-white/60 mt-1">Total Processed</p>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-2xl p-6 text-center">
                  <Users className="w-12 h-12 text-white/80 mx-auto mb-4" />
                  <p className="text-3xl font-bold text-white font-mono">50K+</p>
                  <p className="text-white/60 mt-1">Active Users</p>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-2xl p-6 text-center">
                  <Shield className="w-12 h-12 text-white/80 mx-auto mb-4" />
                  <p className="text-3xl font-bold text-white font-mono">100%</p>
                  <p className="text-white/60 mt-1">Secure Platform</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful features to manage your finances securely and efficiently.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group p-8 rounded-2xl border border-gray-200 hover:border-primary-200 hover:shadow-xl hover:shadow-primary-500/10 transition-all duration-300">
              <div className="w-14 h-14 rounded-2xl bg-primary-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Wallet className="w-7 h-7 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Balance Management</h3>
              <p className="text-gray-600">
                View your balance in real-time with detailed transaction history and instant updates.
              </p>
            </div>

            <div className="group p-8 rounded-2xl border border-gray-200 hover:border-primary-200 hover:shadow-xl hover:shadow-primary-500/10 transition-all duration-300">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <CreditCard className="w-7 h-7 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Fast Withdrawals</h3>
              <p className="text-gray-600">
                Withdraw your funds quickly to your bank account or crypto wallet with low fees.
              </p>
            </div>

            <div className="group p-8 rounded-2xl border border-gray-200 hover:border-primary-200 hover:shadow-xl hover:shadow-primary-500/10 transition-all duration-300">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Headphones className="w-7 h-7 text-amber-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">24/7 Support</h3>
              <p className="text-gray-600">
                Get help whenever you need it with our dedicated support team ready to assist.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of users who trust Payout for their financial management.
          </p>
          <Link 
            to="/register" 
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-primary-500/30"
          >
            Create Your Account
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto text-center text-gray-500">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
              <span className="text-white font-bold text-sm">P</span>
            </div>
            <span className="font-semibold text-gray-900">Payout</span>
          </div>
          <p>© 2024 Payout. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
