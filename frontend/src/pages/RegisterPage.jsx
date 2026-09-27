import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Feather, ArrowRight, Lock, Mail, User, Eye, EyeOff, Sparkles, Check } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function RegisterPage() {
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const isUsernameValid = username.length >= 3 && username.length <= 20;
  const isPasswordValid = password.length >= 8 && password.length <= 50;
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!isUsernameValid) {
      setFormError('Username must be between 3 and 20 characters.');
      return;
    }
    if (!isEmailValid) {
      setFormError('Please enter a valid email address.');
      return;
    }
    if (!isPasswordValid) {
      setFormError('Password must be between 8 and 50 characters.');
      return;
    }

    try {
      setSubmitting(true);
      const user = await register({
        username: username.trim(),
        email: email.trim(),
        password,
      });

      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.7 },
      });

      toast.success(`Welcome to Scribbly, ${user.username}!`);
      navigate('/', { replace: true });
    } catch (err) {
      setFormError(err.message || 'Registration failed. Try a different email or username.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[#080a0d] relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Left editorial column */}
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
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-mono-code">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Free forever personal notebook</span>
            </div>
            <h1 className="font-serif-display italic text-5xl xl:text-6xl text-slate-100 font-normal leading-[1.1] tracking-tight">
              Begin your new digital paper canvas today.
            </h1>
            <p className="text-slate-400 text-base leading-relaxed max-w-md">
              Organize fleeting memos, master projects, craft essays with rich markdown, and tag ideas effortlessly.
            </p>
          </div>
        </div>

        {/* Validation indicator pills */}
        <div className="space-y-2 pt-6 border-t border-white/5">
          <p className="text-xs font-mono-code uppercase tracking-wider text-slate-500">Security Criteria</p>
          <div className="flex flex-col gap-1.5 text-xs">
            <div className={`flex items-center gap-2 transition-colors ${isUsernameValid ? 'text-emerald-400' : 'text-slate-500'}`}>
              <Check className={`w-3.5 h-3.5 ${isUsernameValid ? 'opacity-100' : 'opacity-30'}`} />
              <span>Username: 3–20 characters</span>
            </div>
            <div className={`flex items-center gap-2 transition-colors ${isEmailValid ? 'text-emerald-400' : 'text-slate-500'}`}>
              <Check className={`w-3.5 h-3.5 ${isEmailValid ? 'opacity-100' : 'opacity-30'}`} />
              <span>Valid email format</span>
            </div>
            <div className={`flex items-center gap-2 transition-colors ${isPasswordValid ? 'text-emerald-400' : 'text-slate-500'}`}>
              <Check className={`w-3.5 h-3.5 ${isPasswordValid ? 'opacity-100' : 'opacity-30'}`} />
              <span>Password: 8–50 characters</span>
            </div>
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
              Create your account
            </h2>
            <p className="text-slate-400 text-sm">
              Start crafting and organizing your thoughts in seconds.
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
                Username
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="penman"
                  required
                  minLength={3}
                  maxLength={20}
                  autoFocus
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#12151b] border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:border-amber-400/60 focus:ring-2 focus:ring-amber-500/20 text-sm transition-all"
                />
              </div>
            </div>

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
                  maxLength={100}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#12151b] border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:border-amber-400/60 focus:ring-2 focus:ring-amber-500/20 text-sm transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono-code uppercase tracking-wider text-slate-400 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={8}
                  maxLength={50}
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
              disabled={submitting || !isUsernameValid || !isEmailValid || !isPasswordValid}
              className="w-full mt-6 py-3.5 px-5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-syne font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                  <span>Setting up notebook...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 p-3 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-slate-500 flex items-center justify-between">
            <span>Already have an account?</span>
            <Link
              to="/login"
              className="text-amber-400 hover:text-amber-300 font-medium transition-colors"
            >
              Sign in &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
