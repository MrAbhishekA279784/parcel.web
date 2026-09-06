import React, { useState } from 'react';
import { useAuth } from '../../shared/store/authContext';
import { Lock, Mail, User, Phone, ArrowRight, AlertCircle, Eye, EyeOff, ShieldAlert, KeyRound } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, register, isLoading } = useAuth();

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const demoAccounts = [
    {
      role: 'Admin',
      portal: 'Admin Business Center',
      email: 'admin@parcelflow.com',
      password: 'demo123',
      badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200'
    },
    {
      role: 'Operator',
      portal: 'Warehouse Control Room',
      email: 'operator@parcelflow.com',
      password: 'demo123',
      badgeColor: 'bg-teal-100 text-teal-800 border-teal-200'
    },
    {
      role: 'Customer',
      portal: 'Customer Storefront',
      email: 'rahul@parcelflow.com',
      password: 'demo123',
      badgeColor: 'bg-orange-100 text-orange-800 border-orange-200'
    }
  ];

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setShowForgotPassword(false);

    if (!email || !password) {
      setError('Please enter both your email and password.');
      return;
    }

    try {
      await login(email.trim(), password);
    } catch (err: any) {
      setError(err.message || 'Invalid email or password.');
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name || !email || !password) {
      setError('Name, email, and password are required.');
      return;
    }

    try {
      await register(name.trim(), email.trim(), password, phone.trim());
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    }
  };

  const handleSelectDemoAccount = (acc: typeof demoAccounts[0]) => {
    setError(null);
    setShowForgotPassword(false);
    setMode('login');
    setEmail(acc.email);
    setPassword(acc.password);
  };

  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-100 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 selection:bg-orange-500/30 selection:text-orange-200">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-zinc-800/90 border border-zinc-700/80 text-xs text-zinc-300 shadow-xs mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-semibold tracking-wider text-white">PARCELFLOW</span>
            <span className="text-zinc-500">|</span>
            <span className="text-zinc-400">Enterprise Unified Platform</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            {mode === 'login' ? 'Sign in to ParcelFlow' : 'Create Customer Account'}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-sm mx-auto">
            {mode === 'login'
              ? 'Enter your account credentials to access your designated workspace.'
              : 'Sign up for parcel ordering, tracking, and automated fulfillment updates.'}
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 sm:p-7 shadow-2xl space-y-5">
          {/* Inline Error Notice */}
          {error && (
            <div
              id="auth-error-alert"
              role="alert"
              className="p-3 bg-red-950/80 border border-red-800/80 text-red-200 text-xs rounded-xl flex items-start gap-2.5 leading-relaxed"
            >
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{error}</div>
            </div>
          )}

          {/* Forgot Password Helper Box */}
          {showForgotPassword && mode === 'login' && (
            <div className="p-3 bg-zinc-900 border border-zinc-700 text-zinc-300 text-xs rounded-xl flex items-start gap-2.5 leading-relaxed">
              <KeyRound className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-zinc-100">Password Recovery</p>
                <p className="text-zinc-400 mt-0.5">
                  In this demo deployment, all pre-seeded accounts utilize the default password <span className="font-mono text-orange-300 bg-zinc-800 px-1.5 py-0.5 rounded">demo123</span>. You may select any demo credential below.
                </p>
              </div>
            </div>
          )}

          {mode === 'login' ? (
            /* Login Form: Strictly Email and Password */
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="login-email" className="block text-xs font-medium text-zinc-300">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="login-email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@parcelflow.com"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="login-password" block text-xs font-medium text-zinc-300>
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(!showForgotPassword)}
                    className="text-[11px] text-zinc-400 hover:text-orange-400 transition-colors cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 cursor-pointer transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                id="login-submit-btn"
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-2.5 px-4 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-medium text-xs sm:text-sm transition-all shadow-md active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>Log In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setShowForgotPassword(false);
                    setMode('signup');
                  }}
                  className="text-xs text-zinc-400 hover:text-orange-400 transition-colors cursor-pointer"
                >
                  Don't have an account? <span className="font-semibold text-orange-400 underline decoration-orange-400/40 underline-offset-2">Sign up</span>
                </button>
              </div>
            </form>
          ) : (
            /* Customer Registration Form */
            <form onSubmit={handleSignupSubmit} className="space-y-4">
              <div className="p-2.5 bg-orange-950/40 border border-orange-900/60 rounded-xl text-[11px] text-orange-300 flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                <span>Customer accounts only. Warehouse Operator and Admin accounts are pre-provisioned by IT administrators.</span>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="signup-name" className="block text-xs font-medium text-zinc-300">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="signup-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Rahul Sharma"
                    className="w-full pl-10 pr-3.5 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="signup-email" className="block text-xs font-medium text-zinc-300">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="signup-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="customer@gmail.com"
                    className="w-full pl-10 pr-3.5 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="signup-phone" className="block text-xs font-medium text-zinc-300">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="signup-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full pl-10 pr-3.5 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="signup-password" block text-xs font-medium text-zinc-300>
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="signup-password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Choose a password"
                    className="w-full pl-10 pr-3.5 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-colors"
                  />
                </div>
              </div>

              <button
                id="signup-submit-btn"
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-2.5 px-4 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-medium text-xs sm:text-sm transition-all shadow-md active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isLoading ? (
                  <span>Creating account...</span>
                ) : (
                  <>
                    <span>Create Customer Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setMode('login');
                  }}
                  className="text-xs text-zinc-400 hover:text-orange-400 transition-colors cursor-pointer"
                >
                  Already have an account? <span className="font-semibold text-orange-400 underline decoration-orange-400/40 underline-offset-2">Log In</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Demo Accounts Quick-Test Table */}
        <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-2xl p-4 sm:p-5 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <span>Seed Accounts</span>
              <span className="text-[10px] text-zinc-500 font-normal lowercase">(for instant testing)</span>
            </h2>
            <span className="text-[11px] text-zinc-500">Auto-routes to role portal</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-400 text-[11px]">
                  <th className="pb-2 font-medium">Role</th>
                  <th className="pb-2 font-medium">Email</th>
                  <th className="pb-2 font-medium">Password</th>
                  <th className="pb-2 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                {demoAccounts.map((acc) => (
                  <tr
                    key={acc.role}
                    onClick={() => handleSelectDemoAccount(acc)}
                    className="hover:bg-zinc-900/80 cursor-pointer transition-colors group"
                    title={`Click to fill ${acc.role} credentials`}
                  >
                    <td className="py-2.5 font-medium text-white">
                      <span className="inline-block font-semibold">
                        {acc.role}
                      </span>
                    </td>
                    <td className="py-2.5 font-mono text-zinc-300 text-[11px]">
                      {acc.email}
                    </td>
                    <td className="py-2.5 font-mono text-zinc-400 text-[11px]">
                      {acc.password}
                    </td>
                    <td className="py-2.5 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectDemoAccount(acc);
                        }}
                        className="px-2 py-0.5 rounded text-[11px] font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 cursor-pointer transition-colors group-hover:bg-orange-600 group-hover:border-orange-500 group-hover:text-white"
                      >
                        Use
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[11px] text-zinc-500 text-center pt-1">
            Clicking any row autofills the login form. The system authenticates your credentials and automatically routes to the appropriate portal.
          </p>
        </div>
      </div>
    </div>
  );
};
