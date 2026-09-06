import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Heart, Mail, Lock, AlertCircle } from 'lucide-react';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      navigate(user.role === 'DOCTOR' ? '/doctor' : '/patient');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const demoLogin = async (role: string) => {
    setError('');
    setLoading(true);
    try {
      if (role === 'patient') {
        const user = await login('demo.user@healthguard.local', 'DemoUser@123');
        navigate(user.role === 'DOCTOR' ? '/doctor' : '/patient');
      } else {
        const user = await login('demo.doctor@healthguard.local', 'DemoDoctor@123');
        navigate(user.role === 'DOCTOR' ? '/doctor' : '/patient');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Demo login failed. Please register first.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-teal-500 flex items-center justify-center mx-auto mb-4">
            <Heart className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">HealthGuard AI</h1>
          <p className="text-slate-400 mt-2">Your Health. Your Data. Your Control.</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Sign In</h2>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 text-red-700 text-sm mb-4">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-teal-600 text-white font-semibold hover:bg-teal-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Demo Logins */}
          <div className="mt-6 pt-6 border-t border-slate-200">
            <p className="text-sm text-slate-500 text-center mb-3">Quick demo access</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => demoLogin('patient')}
                disabled={loading}
                className="py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-medium transition-colors"
              >
                Patient Demo
              </button>
              <button
                onClick={() => demoLogin('doctor')}
                disabled={loading}
                className="py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-medium transition-colors"
              >
                Doctor Demo
              </button>
            </div>
          </div>

          <p className="text-center text-sm text-slate-500 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-teal-600 hover:text-teal-700 font-medium">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
