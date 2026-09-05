import React, { useState } from 'react';
import { ShieldCheck, Lock, User, AlertCircle, ArrowLeft, Eye, EyeOff, Sparkles, Building2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export default function AdminLogin({ onBackToSite }) {
  const { login } = useAppContext();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      const res = login(username, password);
      if (!res.success) {
        setError(res.message);
        setIsLoading(false);
      }
    }, 150);
  };

  const handleQuickDemoLogin = () => {
    setUsername('admin');
    setPassword('admin');
    setError('');
    setIsLoading(true);
    setTimeout(() => {
      login('admin', 'admin');
    }, 150);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] flex flex-col justify-between relative overflow-x-hidden">
      {/* Background Graphic Accents */}
      <div 
        className="fixed inset-0 opacity-10 bg-cover bg-center pointer-events-none"
        style={{ backgroundImage: "url('/images/hero_slide_2.jpg')" }}
      />
      <div className="fixed inset-0 bg-gradient-to-b from-slate-100/80 to-slate-200/90 pointer-events-none" />

      {/* Top Navbar */}
      <header className="relative z-10 w-full max-w-6xl mx-auto px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onBackToSite}
          className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:border-slate-300 py-2 px-2.5 sm:px-3.5 rounded-lg shadow-sm transition-all"
        >
          <ArrowLeft size={14} /> <span className="hidden sm:inline">Back to </span><span>Website</span>
        </button>

        <div className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[0.72rem] sm:text-xs font-semibold">
          <Building2 size={13} className="text-amber-600 shrink-0" />
          <span className="truncate">Peace at Peak PMS</span>
        </div>
      </header>

      {/* Center Login Box */}
      <main className="relative z-10 w-full max-w-md mx-auto px-4 py-8 my-auto">
        <div className="bg-white rounded-2xl p-6 sm:p-10 border border-slate-200 shadow-xl space-y-6">
          {/* Brand & Crest */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-700 border border-amber-500/20 mb-1 shadow-sm">
              <ShieldCheck size={28} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
              Property Management
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Peace at Peak Resort & Cottages • Admin Console
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5 leading-relaxed">
              <AlertCircle size={16} className="shrink-0 text-red-500 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            {/* Username */}
            <div className="space-y-1.5">
              <label 
                htmlFor="admin-user" 
                className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5"
              >
                <User size={14} className="text-amber-600" /> Username or Email
              </label>
              <input
                id="admin-user"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username (e.g. admin)"
                required
                className="pms-input"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label 
                htmlFor="admin-pass" 
                className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5"
              >
                <Lock size={14} className="text-amber-600" /> Password
              </label>
              <div className="relative">
                <input
                  id="admin-pass"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                  className="pms-input"
                  style={{ paddingRight: '2.75rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit CTA */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 mt-4"
              style={{ minHeight: '48px' }}
            >
              {isLoading ? 'Verifying Credentials...' : 'Sign In to Dashboard'}
            </button>
          </form>

          {/* Quick Demo Access Box */}
          <div className="pt-5 border-t border-slate-100 space-y-3">
            <button
              type="button"
              onClick={handleQuickDemoLogin}
              className="w-full py-2.5 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <Sparkles size={15} className="text-amber-600" />
              <span>One-Click Quick Login (Demo Access)</span>
            </button>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[0.7rem] text-slate-600 text-left space-y-1">
              <p className="font-bold text-slate-800 uppercase tracking-wider">Default Login Credentials:</p>
              <p className="flex justify-between font-mono text-slate-700">
                <span>User: <strong>admin</strong></span>
                <span>Pass: <strong>admin</strong></span>
              </p>
              <p className="text-[0.65rem] text-slate-500 pt-1 border-t border-slate-200">
                Official: admin@peaceatpeak.com / PeakAdmin@2026
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full text-center py-4 text-xs text-slate-400 font-medium">
        Peace at Peak Luxury Sanctuary Resort • Kanatal, Uttarakhand
      </footer>
    </div>
  );
}
