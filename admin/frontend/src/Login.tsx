import React, { useState } from 'react';
import { Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';
import { adminApi, authStorage } from './adminApi';
import { Squiggle } from './ui';

export default function Login({ onLogin }: { onLogin: (user: any) => void }) {
  const [email, setEmail] = useState('admin@ghareluhub.in');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await adminApi.login(email, password);
      authStorage.setToken(res.token);
      authStorage.setUser(res.admin);
      onLogin(res.admin);
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 page-bg relative overflow-hidden">
      {/* Ruled banner across the top — same as the customer navbar */}
      <span className="absolute top-0 inset-x-0 h-1 bg-[#681121]" aria-hidden="true" />
      <span className="absolute top-1 inset-x-0 h-px bg-[#E2952A]/50" aria-hidden="true" />

      <div className="w-full max-w-[420px] relative z-10">
        {/* A sheet taped to the board */}
        <div className="tilt-l-sm">
          <div className="sc-card p-6 sm:p-7">
            {/* Brand lockup — identical to the customer panel */}
            <div className="flex flex-col items-center text-center">
              <div className="h-16 w-16 rounded-2xl overflow-hidden shadow-md border border-[#D48924]/30 bg-[#681121] flex items-center justify-center mb-3">
                <img src="/logo.png" alt="Gharelu Hub" className="w-full h-full object-cover" />
              </div>

              <p className="font-note text-[10px] font-semibold uppercase tracking-[0.24em] text-[#b87319]">
                Gharelu Baked Heritage
              </p>
              <h1 className="font-hand italic font-bold text-3xl text-[#540c19] leading-tight mt-0.5">
                Gharelu Hub
              </h1>
              <Squiggle />
              <p className="font-note text-[11px] text-[var(--ink-faint)] mt-1 font-medium">
                Admin kitchen log &amp; dispatch control
              </p>
            </div>

            {error && (
              <div className="mt-5 p-3 rounded-xl border-2 border-dashed border-[#681121]/40 bg-[#681121]/8 text-[#681121] font-note text-xs font-semibold flex items-center gap-2">
                <AlertCircle size={15} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 mt-6">
              <div>
                <label className="sc-label">Admin email ID</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ink-faint)]" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@ghareluhub.in"
                    className="form-blank w-full pl-9 pr-3 py-2.5 font-note text-sm text-[var(--ink)] outline-none focus:border-[#681121]"
                  />
                </div>
              </div>

              <div>
                <label className="sc-label">Master security key</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ink-faint)]" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="form-blank w-full pl-9 pr-3 py-2.5 font-note text-sm text-[var(--ink)] outline-none focus:border-[#681121]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-ink w-full flex items-center justify-center gap-2 font-note text-xs font-semibold uppercase tracking-[0.14em] py-3.5 disabled:opacity-60"
              >
                {loading ? (
                  <span>Checking the ledger…</span>
                ) : (
                  <>
                    <span>Enter control center</span>
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-4 border-t border-dashed border-[var(--rule)] flex justify-center">
              <span className="stamp tilt-r-sm text-[#3d7044] border-[#4E8B56]/50 text-center">
                Key · admin@ghareluhub.in / admin123
              </span>
            </div>
          </div>
        </div>

        <p className="text-center font-note text-[11px] text-[var(--ink-faint)] mt-5">
          © {new Date().getFullYear()} Gharelu Hub · Bhopal artisanal snacks
        </p>
      </div>
    </div>
  );
}
