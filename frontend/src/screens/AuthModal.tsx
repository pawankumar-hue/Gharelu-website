/**
 * AuthModal.tsx — Login & Register Modal for Gharelu Hub
 * A sign-in slip pinned to the kitchen board — tabs switch between Login and Register.
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Mail,
  Phone,
  Lock,
  User,
  Eye,
  EyeOff,
  Sparkles,
  ShieldCheck,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext';

export default function AuthModal() {
  const auth = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(auth.authModalMode);
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    setMode(auth.authModalMode);
    setError('');
  }, [auth.authModalMode]);

  if (!auth.showAuthModal) return null;

  const reset = () => {
    setName(''); setPhone(''); setEmail(''); setPassword(''); setError('');
  };

  const switchMode = (m: 'login' | 'register') => {
    setMode(m); reset();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    let err: string | null = null;

    if (mode === 'login') {
      if (loginMethod === 'email') {
        err = await auth.login(email, password);
      } else {
        err = await auth.loginPhone(phone, password);
      }
    } else {
      err = await auth.register(name, phone, email, password);
    }

    setLoading(false);
    if (err) setError(err);
    else reset();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) auth.closeAuthModal(); }}
    >
      {/* Backdrop — dim room, not frosted glass */}
      <div className="absolute inset-0 bg-black/55" />

      {/* Modal — a slip of paper torn from the order pad */}
      <div className="relative w-full max-w-sm bg-[var(--paper)] paper-grain rounded-3xl shadow-[3px_4px_0_rgba(84,12,25,0.08),0_24px_44px_-24px_rgba(84,12,25,0.6)] border border-[var(--rule)] overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="relative bg-[var(--paper-2)] border-b border-[var(--rule)] px-6 pt-7 pb-6">
          <button
            type="button"
            onClick={auth.closeAuthModal}
            className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--paper-2)] border border-[var(--rule)] text-[var(--ink-soft)] hover:bg-[var(--paper-3)] transition-colors"
          >
            <X size={16} />
          </button>

          <div className="flex items-center gap-2.5 mb-2">
            <div className="h-9 w-9 rounded-xl overflow-hidden border border-[var(--rule)] bg-[var(--paper-3)] flex items-center justify-center shrink-0">
              <img src="/logo.png" alt="Gharelu Hub" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="font-note text-[10px] font-semibold tracking-[0.18em] text-[#b87319] uppercase">Gharelu Hub</div>
              <div className="font-hand italic text-xs text-[var(--ink-soft)]">Bhopal's Snack Hub</div>
            </div>
          </div>

          <h2 className="font-hand italic text-2xl text-[#540c19] mt-4 leading-tight">
            {mode === 'login' ? 'Welcome back to the kitchen' : 'Put your name in our ledger'}
          </h2>
          <svg viewBox="0 0 150 8" className="w-32 h-2 mt-1" fill="none" aria-hidden="true">
            <path d="M2 5.5c16-3 30-3.6 46-2.4s30 2.4 46 1.4 26-2.6 46-3.6" stroke="#D48924" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <p className="font-note text-xs text-[var(--ink-soft)] mt-1.5">
            {mode === 'login'
              ? 'Log in to track orders & earn rewards.'
              : 'Create an account and get 120 bonus points!'}
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-[var(--paper-3)]/50 border-b border-[var(--rule)]">
          {(['login', 'register'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => switchMode(m)}
              className={`flex-1 py-3 font-note text-sm font-semibold transition-colors ${
                mode === m
                  ? 'text-[#681121] border-b-2 border-[#681121] bg-[var(--paper)]'
                  : 'text-[var(--ink-soft)] hover:text-[var(--ink)]'
              }`}
            >
              {m === 'login' ? 'Login' : 'Register'}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Error — a red pen note in the margin */}
          {error && (
            <div className="bg-[#a32230]/8 border-2 border-dashed border-[#a32230]/40 text-[#8f1d2c] font-note text-xs font-semibold px-3 py-2.5 rounded-xl">
              {error}
            </div>
          )}

          {/* Register: Name */}
          {mode === 'register' && (
            <div className="relative">
              <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--ink-faint)]" />
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="form-blank w-full pl-10 pr-4 py-3 font-note text-sm"
              />
            </div>
          )}

          {/* Login method toggle */}
          {mode === 'login' && (
            <div className="flex gap-2">
              {(['email', 'phone'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setLoginMethod(m)}
                  className={`flex-1 py-2 font-note text-xs font-semibold rounded-xl border transition-colors ${
                    loginMethod === m
                      ? 'bg-[#681121] text-[#FDFBF7] border-[#681121]'
                      : 'bg-[var(--paper-2)] text-[var(--ink-soft)] border-[var(--rule)] hover:bg-[var(--paper-3)]'
                  }`}
                >
                  {m === 'email' ? '📧 Email' : '📱 Phone'}
                </button>
              ))}
            </div>
          )}

          {/* Phone field */}
          {(mode === 'register' || loginMethod === 'phone') && (
            <div className="relative">
              <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--ink-faint)]" />
              <input
                type="tel"
                placeholder="Phone Number (+91...)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required={mode === 'register' || loginMethod === 'phone'}
                className="form-blank w-full pl-10 pr-4 py-3 font-note text-sm"
              />
            </div>
          )}

          {/* Email field */}
          {(mode === 'register' || loginMethod === 'email') && (
            <div className="relative">
              <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--ink-faint)]" />
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required={mode === 'register' || loginMethod === 'email'}
                className="form-blank w-full pl-10 pr-4 py-3 font-note text-sm"
              />
            </div>
          )}

          {/* Password */}
          <div className="relative">
            <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--ink-faint)]" />
            <input
              type={showPw ? 'text' : 'password'}
              placeholder={mode === 'register' ? 'Create Password (min 6 chars)' : 'Password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={mode === 'register' ? 6 : 1}
              className="form-blank w-full pl-10 pr-12 py-3 font-note text-sm"
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--ink-faint)] hover:text-[#681121] transition-colors"
            >
              {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>

          {/* Submit — hand-stamped */}
          <button
            type="submit"
            disabled={loading}
            className="btn-ink w-full flex items-center justify-center gap-2 font-note text-sm font-semibold uppercase tracking-[0.14em] py-3.5 disabled:opacity-70"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <>
                <span>{mode === 'login' ? 'Log In' : 'Create Account'}</span>
                <Sparkles size={15} className="text-[#E2952A]" />
              </>
            )}
          </button>

          {/* Trust note — written at the bottom of the form */}
          <div className="flex items-center justify-center gap-1.5 font-note text-[11px] text-[var(--ink-faint)] pt-1">
            <ShieldCheck size={12} className="text-[#3d7044]" />
            <span>Your data is secure & never shared</span>
          </div>
        </form>
      </div>
    </div>
  );
}
