import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { fetchSellerSetupStatusAPI } from '../services/api';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [setupRequired, setSetupRequired] = useState(false);
  const [isSetup, setIsSetup] = useState(false);

  useEffect(() => {
    fetchSellerSetupStatusAPI().then((required) => {
      setSetupRequired(required);
      setIsSetup(required);
    }).catch(() => setError('Could not reach the seller server. Check that the backend is running.'));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    if (!password.trim()) {
      setError('Please enter your password');
      return;
    }

    if (isSetup && password.length < 10) {
      setError('Choose a password with at least 10 characters.');
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password, isSetup);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Unable to sign in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Background image with blend */}
      <div className="absolute inset-0 z-0">
        <img src="/images/dashboard-bg.jpg" alt="" className="w-full h-full object-cover opacity-30" loading="eager" decoding="async" fetchPriority="low" />
        <div className="absolute inset-0 bg-gradient-to-b from-dark/80 via-dark/90 to-dark" />
      </div>
      {/* Decorative background gradient */}
      <div className="absolute top-0 left-0 right-0 h-72 bg-gradient-to-b from-primary-500/15 to-transparent pointer-events-none z-1" />

      <div className="w-full max-w-sm relative z-10 animate-fade-in">
        {/* Logo and branding */}
        <div className="text-center mb-10">
          <img src="/images/logo.jpg" alt="FreeFire Hotel" className="w-22 h-22 rounded-3xl mx-auto mb-5 shadow-xl shadow-primary-500/30 object-cover ring-4 ring-white/10" style={{ width: '88px', height: '88px' }} loading="eager" decoding="async" width="88" height="88" />
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            FreeFire Hotel
          </h1>
          <p className="text-gray-400 mt-2 text-sm font-medium tracking-wide uppercase">
            Seller Panel
          </p>
        </div>

        {/* Login form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email/Phone field */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">
              Email address
            </label>
            <div className="relative">
              <Mail
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
              />
              <input
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seller@example.com"
                className="w-full bg-dark-light border border-dark-lighter rounded-xl pl-11 pr-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/50 transition-all duration-200 text-sm"
                id="login-email"
              />
            </div>
          </div>

          {/* Password field */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">
              {isSetup ? 'Create password' : 'Password'}
            </label>
            <div className="relative">
              <Lock
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
              />
              <input
                type={showPassword ? 'text' : 'password'}
                autoComplete={isSetup ? 'new-password' : 'current-password'}
                minLength={isSetup ? 10 : undefined}
                maxLength={128}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full bg-dark-light border border-dark-lighter rounded-xl pl-11 pr-12 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/50 transition-all duration-200 text-sm"
                id="login-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-300 transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 animate-scale-in">
              <p className="text-sm text-red-400 font-medium">{error}</p>
            </div>
          )}

          {/* Login button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-bold py-4 rounded-xl transition-all duration-200 touch-active shadow-lg shadow-primary-500/25 hover:shadow-glow-orange disabled:opacity-60 disabled:cursor-not-allowed mt-2 text-[15px]"
            id="login-button"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              {isSetup ? 'Creating account...' : 'Logging in...'}
              </span>
            ) : (
              isSetup ? 'Create seller account' : 'Login'
            )}
          </button>

          <p className="text-center text-xs text-gray-500 pt-2">
            {isSetup ? 'Use at least 10 characters. This creates the first seller account.' : 'Forgot your password? Contact your system administrator.'}
          </p>
        </form>

        {!isSetup && setupRequired && (
          <div className="mt-6 text-center">
            <button type="button" onClick={() => { setIsSetup(true); setError(''); }} className="text-sm text-primary-400 hover:text-primary-300 font-medium">
              Set up the first seller account
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
