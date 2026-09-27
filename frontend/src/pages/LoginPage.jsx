import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Feather, ArrowRight, Lock, Mail, Eye, EyeOff, Sparkles, BookOpen, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const destination = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!email.trim() || !password) {
      setFormError('Please enter both email and password.');
      return;
    }

    if (password.length < 8) {
      setFormError('Password must be at least 8 characters.');
      return;
    }

    try {
      setSubmitting(true);
      const user = await login({ email: email.trim(), password });
      toast.success(`Welcome back, ${user.username}!`);
      navigate(destination, { replace: true });
    } catch (err) {
      setFormError(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[#080a0d] relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-1/3 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Left editorial column (visible on md+) */}
      <div className="hidden lg:flex flex-col justify-between w-5/12 p-12 border-r border-white/5 bg-[#0c0f14]/60 backdrop-blur-xl relative z-10">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
              <Feather className="w-5 h-5 text-amber-400" />
            </div>
            <span className="font-syne text-2xl font-bold tracking-tight text-white">
              Scribbly<span className="text-amber-400">.</span>
            </span>
          </div>

          <div className="mt-28 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-mono-code">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Tactile digital notebook</span>
            </div>
            <h1 className="font-serif-display italic text-5xl xl:text-6xl text-slate-100 font-normal leading-[1.1] tracking-tight">
              Where quiet thoughts find their shape.
            </h1>
            <p className="text-slate-400 text-base leading-relaxed max-w-md">
              A minimalist, distraction-free sanctuary for your notes, thoughts, tag systems, and creative journal entries.
            </p>
          </div>
        </div>

        {/* Feature pillars */}
        <div className="grid grid-cols-2 gap-4 pt-10 border-t border-white/5">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-slate-300 font-medium text-sm">
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span>Full Markdown</span>
            </div>
            <p className="text-xs text-slate-500">Live preview & syntax highlight</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-slate-300 font-medium text-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Secure Vault</span>
            </div>
            <p className="text-xs text-slate-500">HttpOnly token authorization</p>
          </div>
        </div>
      </div>

      {/* Right form column */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 relative z-10">
        <div className="w-full max-w-md">
          {/* Mobile brand header */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
              <Feather className="w-5 h-5 text-amber-400" />
            </div>
            <span className="font-syne text-2xl font-bold tracking-tight text-white">
              Scribbly<span className="text-amber-400">.</span>
            </span>
          </div>

          <div className="mb-8">
            <h2 className="font-syne text-3xl font-bold tracking-tight text-white mb-2">
              Sign in to your notebook
            </h2>
            <p className="text-slate-400 text-sm">
              Enter your email and password to access your notes.
            </p>
          </div>

          {formError && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-sm flex items-start gap-3 animate-fade-in">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-2 shrink-0" />
              <p className="flex-1">{formError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono-code uppercase tracking-wider text-slate-400 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="author@scribbly.app"
                  required
                  autoFocus
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#12151b] border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:border-amber-400/60 focus:ring-2 focus:ring-amber-500/20 text-sm transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-mono-code uppercase tracking-wider text-slate-400">
                  Password
                </label>
                <span className="text-[11px] text-slate-500 font-mono-code">Min. 8 characters</span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={8}
                  className="w-full pl-10 pr-11 py-3 rounded-xl bg-[#12151b] border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:border-amber-400/60 focus:ring-2 focus:ring-amber-500/20 text-sm transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-1 rounded"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-6 py-3.5 px-5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-syne font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                  <span>Opening vault...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick test account hint */}
          <div className="mt-8 p-3 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-slate-500 flex items-center justify-between">
            <span>Need an account?</span>
            <Link
              to="/register"
              className="text-amber-400 hover:text-amber-300 font-medium transition-colors"
            >
              Create notebook &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
