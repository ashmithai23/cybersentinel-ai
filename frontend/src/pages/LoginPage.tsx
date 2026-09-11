import React, { useState } from 'react';
import { ShieldAlert, Lock, Mail, ArrowRight, ShieldCheck, UserCheck, RefreshCw } from 'lucide-react';
import { authService } from '../services/api';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('admin@cybersentinel.ai');
  const [password, setPassword] = useState('CyberSentinel2026!');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await authService.login(email, password);
      localStorage.removeItem('cybersentinel_signed_out');
      onLoginSuccess();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (roleEmail: string, rolePass: string) => {
    setEmail(roleEmail);
    setPassword(rolePass);
    setLoading(true);
    setError('');
    authService.login(roleEmail, rolePass)
      .then(() => {
        localStorage.removeItem('cybersentinel_signed_out');
        onLoginSuccess();
      })
      .catch((err: any) => {
        setError(err.response?.data?.detail || 'Login failed.');
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full glass-card p-8 rounded-2xl border border-slate-800 space-y-6 shadow-2xl relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Logo & Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-2xl text-cyan-400 mb-2">
            <ShieldAlert className="w-8 h-8 animate-pulse" />
          </div>
          <h1 className="text-2xl font-bold tracking-wide text-white flex items-center justify-center gap-2">
            CYBERSENTINEL <span className="text-cyan-400 text-xs px-2 py-0.5 bg-cyan-950 border border-cyan-500/30 rounded font-mono">AI</span>
          </h1>
          <p className="text-xs text-slate-400">SOC Threat Detection & Vulnerability Intelligence Platform</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-xs font-medium text-center">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Analyst Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#0B0F17] border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                placeholder="admin@cybersentinel.ai"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Access Token / Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#0B0F17] border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-2.5 px-4 rounded-lg text-xs flex items-center justify-center transition-all shadow-lg shadow-cyan-950/50"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <>
                Sign In to SOC Dashboard <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </button>
        </form>

        {/* Quick Analyst Profile Selector */}
        <div className="border-t border-slate-800 pt-4 space-y-3">
          <div className="text-[11px] font-semibold text-slate-400 text-center uppercase tracking-wider">
            Select Analyst Security Profile
          </div>
          <div className="grid grid-cols-1 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('admin@cybersentinel.ai', 'CyberSentinel2026!')}
              className="p-2.5 bg-slate-900/80 hover:bg-cyan-950/40 border border-slate-800 hover:border-cyan-500/40 rounded-lg text-left transition-all group flex items-center justify-between"
            >
              <div>
                <div className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" /> Lead Security Analyst (Admin)
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">admin@cybersentinel.ai</div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 transition-colors" />
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('analyst@cybersentinel.ai', 'AnalystPass123!')}
              className="p-2.5 bg-slate-900/80 hover:bg-cyan-950/40 border border-slate-800 hover:border-cyan-500/40 rounded-lg text-left transition-all group flex items-center justify-between"
            >
              <div>
                <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-slate-400" /> Tier 2 Security Analyst
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">analyst@cybersentinel.ai</div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 transition-colors" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
