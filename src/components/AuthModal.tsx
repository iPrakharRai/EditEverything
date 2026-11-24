import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Mail, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  isGuest?: boolean;
  avatarColor?: string;
  createdAt: number;
}

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: AuthUser) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const { t } = useLanguage();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen || typeof document === 'undefined') return null;

  // Retrieve existing local accounts
  const getRegisteredUsers = (): Array<AuthUser & { password?: string }> => {
    try {
      const data = localStorage.getItem('editeverything_registered_users');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  };

  const saveRegisteredUsers = (users: Array<AuthUser & { password?: string }>) => {
    try {
      localStorage.setItem('editeverything_registered_users', JSON.stringify(users));
    } catch (e) {
      console.error('Failed to save user to localStorage', e);
    }
  };

  // 1. One-click Continue as Guest
  const handleContinueAsGuest = () => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const guestUser: AuthUser = {
      id: `guest_${Date.now()}`,
      name: `Guest User #${randomNum}`,
      email: `guest${randomNum}@editeverything.local`,
      isGuest: true,
      avatarColor: 'from-cyan-500 to-blue-600',
      createdAt: Date.now()
    };

    localStorage.setItem('editeverything_current_user', JSON.stringify(guestUser));
    setSuccessMsg('Logged in as Guest! All tools and preferences are ready.');
    setTimeout(() => {
      onLoginSuccess(guestUser);
      onClose();
    }, 400);
  };

  // 2. One-click Continue with Google (Simulated local OAuth)
  const handleContinueWithGoogle = () => {
    const googleUser: AuthUser = {
      id: `google_${Date.now()}`,
      name: 'Prakhar Rai',
      email: 'raiprakhar0123@gmail.com',
      isGuest: false,
      avatarColor: 'from-amber-500 to-rose-500',
      createdAt: Date.now()
    };

    localStorage.setItem('editeverything_current_user', JSON.stringify(googleUser));
    setSuccessMsg('Logged in with Google account!');
    setTimeout(() => {
      onLoginSuccess(googleUser);
      onClose();
    }, 400);
  };

  // 3. Handle Login Submit
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      setError('Please enter your email address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    const users = getRegisteredUsers();
    const existing = users.find(u => u.email.toLowerCase() === trimmedEmail);

    if (!existing) {
      // If user doesn't have an account, provide instant 1-click creation without needing a database
      setError(`No account found for "${trimmedEmail}". Click "Create Account" above to register instantly!`);
      return;
    }

    if (existing.password && existing.password !== password) {
      setError('Incorrect password. Please verify and try again.');
      return;
    }

    const loggedUser: AuthUser = {
      id: existing.id,
      name: existing.name,
      email: existing.email,
      isGuest: false,
      avatarColor: existing.avatarColor || 'from-cyan-600 to-sky-500',
      createdAt: existing.createdAt || Date.now()
    };

    localStorage.setItem('editeverything_current_user', JSON.stringify(loggedUser));
    setSuccessMsg(`Welcome back, ${loggedUser.name}!`);
    setTimeout(() => {
      onLoginSuccess(loggedUser);
      onClose();
    }, 400);
  };

  // 4. Handle Sign Up Submit
  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedName) {
      setError('Please enter your full name.');
      return;
    }
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.length < 4) {
      setError('Password should be at least 4 characters long.');
      return;
    }

    const users = getRegisteredUsers();
    if (users.some(u => u.email.toLowerCase() === trimmedEmail)) {
      setError('An account with this email already exists. Switch to "Log in" to access it.');
      return;
    }

    const newUser: AuthUser & { password?: string } = {
      id: `usr_${Date.now()}`,
      name: trimmedName,
      email: trimmedEmail,
      password: password,
      isGuest: false,
      avatarColor: 'from-cyan-600 to-sky-500',
      createdAt: Date.now()
    };

    users.push(newUser);
    saveRegisteredUsers(users);

    const authUser: AuthUser = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      isGuest: false,
      avatarColor: newUser.avatarColor,
      createdAt: newUser.createdAt
    };

    localStorage.setItem('editeverything_current_user', JSON.stringify(authUser));
    setSuccessMsg('Account created successfully in your browser!');
    setTimeout(() => {
      onLoginSuccess(authUser);
      onClose();
    }, 400);
  };

  return createPortal(
    <div 
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-[10000] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative my-auto animate-in fade-in zoom-in-95 max-h-[92vh] overflow-y-auto custom-scrollbar border border-slate-100">
        
        {/* Close Button */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition cursor-pointer"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Icon & Heading */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#00e5ff] via-[#00bed6] to-[#0891b2] text-white font-black text-lg flex items-center justify-center mx-auto mb-3 shadow-md shadow-cyan-500/25">
            EE
          </div>
          <h3 className="text-2xl font-black text-slate-800 tracking-tight">
            {mode === 'login' ? 'Log in to EditEverything' : 'Create Free Account'}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {mode === 'login' 
              ? 'Access your saved preferences and custom document templates.'
              : 'Save settings locally with zero cloud database retention.'}
          </p>
        </div>

        {/* Tab Switcher: Log In vs Create Account */}
        <div className="flex rounded-2xl bg-slate-100 p-1 mb-5">
          <button
            type="button"
            onClick={() => { setMode('login'); setError(null); }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
              mode === 'login' 
                ? 'bg-white text-slate-900 shadow-xs' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => { setMode('signup'); setError(null); }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
              mode === 'signup' 
                ? 'bg-white text-slate-900 shadow-xs' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Create Free Account
          </button>
        </div>

        {/* Feedback Alerts */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1 leading-snug">{error}</div>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <div className="font-semibold">{successMsg}</div>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={mode === 'login' ? handleLoginSubmit : handleSignUpSubmit} className="space-y-3">
          
          {mode === 'signup' && (
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Prakhar Rai" 
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#00bed6] focus:border-transparent transition" 
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com" 
                className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#00bed6] focus:border-transparent transition" 
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input 
                type={showPassword ? 'text' : 'password'} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === 'signup' ? 'Create a password' : 'Enter your password'} 
                className="w-full pl-10 pr-10 py-2.5 text-sm bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#00bed6] focus:border-transparent transition" 
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="p-1 text-slate-400 hover:text-slate-600 absolute right-3 top-2.5 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full py-3 mt-2 bg-gradient-to-r from-[#00bed6] to-[#0891b2] hover:from-[#00abc1] hover:to-[#0e7490] text-white font-bold text-sm rounded-xl transition shadow-md shadow-cyan-500/25 active:scale-95 cursor-pointer flex items-center justify-center gap-2"
          >
            <span>{mode === 'login' ? 'Log in' : 'Create Free Account & Log In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-[11px] uppercase tracking-wider">
            <span className="bg-white px-2 text-slate-400 font-semibold">Or continue with</span>
          </div>
        </div>

        {/* Instant Access Options (Without Database) */}
        <div className="space-y-2">
          {/* 1-Click Guest Login */}
          <button 
            type="button"
            onClick={handleContinueAsGuest}
            className="w-full py-2.5 px-4 rounded-xl border border-cyan-200 bg-cyan-50/70 hover:bg-cyan-100/80 text-cyan-900 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-cyan-600 shrink-0" />
            <span>Continue as Guest (No Account Needed)</span>
          </button>

          {/* 1-Click Google Login */}
          <button 
            type="button"
            onClick={handleContinueWithGoogle}
            className="w-full py-2.5 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2.5 transition active:scale-95 cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Continue with Google</span>
          </button>
        </div>

        {/* Footer info: Zero-database client privacy */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>No external database required. 100% Client-side local privacy.</span>
        </div>

      </div>
    </div>,
    document.body
  );
};
