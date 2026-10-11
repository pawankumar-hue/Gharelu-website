import React, { useState } from 'react';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Sparkles,
  Award,
  ChevronRight,
  LogOut,
  LogIn,
  MessageCircle,
  Share2,
  Pencil,
  Check,
  X,
  Loader2,
  ShieldCheck,
  CreditCard,
  Gift,
  Heart,
  Clock,
  HelpCircle,
  ArrowRight,
  Copy,
  Sliders,
  CheckCircle2,
} from 'lucide-react';
import { useApp, tierOf } from '../store';
import { TIERS } from '../data';
import { locations } from '../data/locations';
import { useAuth } from '../lib/AuthContext';
import { proxyApi } from '../lib/api';
import { useToast } from '../lib/ToastContext';

export default function Profile() {
  const push = useApp((s) => s.push);
  const setTab = useApp((s) => s.setTab);
  const locationId = useApp((s) => s.locationId);
  const points = useApp((s) => s.points);

  const auth = useAuth();
  const { showSuccess, confirm } = useToast();
  const branch = locations.find((l) => l.id === locationId) ?? locations[0];
  const tierIndex = tierOf(points);
  const tier = TIERS[tierIndex];
  const nextTier = TIERS[Math.min(tierIndex + 1, TIERS.length - 1)];

  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(auth.user?.name ?? '');
  const [editEmail, setEditEmail] = useState(auth.user?.email ?? '');
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState('');
  const [copiedShare, setCopiedShare] = useState(false);
  const [vegMode, setVegMode] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    setEditError('');
    const err = await auth.updateProfile({ name: editName, email: editEmail });
    setSaving(false);
    if (err) {
      setEditError(err);
    } else {
      setEditing(false);
      showSuccess('Profile details updated successfully!');
    }
  };

  const handleShareApp = () => {
    const shareUrl = typeof window !== 'undefined' ? window.location.origin : 'https://ghareluhub.in';
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      setCopiedShare(true);
      showSuccess('Referral link copied to clipboard! Share with friends to earn points.', 'Invite Link');
      setTimeout(() => setCopiedShare(false), 2400);
    } else {
      showSuccess('Referral link ready: ' + shareUrl, 'Invite Link');
    }
  };

  const displayName = auth.user?.name || (auth.isLoggedIn ? 'Gharelu Foodie' : 'Guest Foodie');
  const displayPhone = auth.user?.phone || '';
  const displayEmail = auth.user?.email || '';
  const initial = displayName[0]?.toUpperCase() ?? 'G';

  // Tier progress estimation
  const tierMin = tier.from;
  const tierNextMin = nextTier.from > tierMin ? nextTier.from : tierMin + 500;
  const progressPercent = Math.min(
    100,
    Math.max(12, Math.round(((points - tierMin) / (tierNextMin - tierMin || 1)) * 100))
  );

  return (
    <div className="min-h-screen bg-[var(--paper)] paper-grain pb-32 text-[var(--ink)]">
      {/* ============ Ledger masthead — the top of a kitchen account book ============ */}
      <div className="relative border-b border-[var(--rule)] bg-[var(--paper-2)]/70 px-4 sm:px-6 lg:px-8 pt-8 pb-16">
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-note text-[10px] font-semibold uppercase tracking-[0.24em] text-[#b87319]">
                Kitchen account book · Bhopal
              </p>
              <h1 className="font-hand italic text-2xl sm:text-3xl text-[#540c19] tracking-tight leading-tight mt-1">
                Your member page
              </h1>
              <svg viewBox="0 0 160 9" className="w-36 h-2.5 mt-1" fill="none" aria-hidden="true">
                <path d="M2 6c18-3.5 34-4.5 52-3.2s34 3.2 52 2 30-3.4 50-4.6" stroke="#D48924" strokeWidth="2.2" strokeLinecap="round" />
              </svg>
            </div>

            {auth.isLoggedIn ? (
              <span className="stamp tilt-r-sm text-[#3d7044] border-[#4E8B56]/50">
                <Check size={11} /> Verified
              </span>
            ) : (
              <button
                type="button"
                onClick={auth.openLogin}
                className="btn-ink flex items-center gap-1.5 px-3.5 py-2 font-note text-[11px] font-semibold uppercase tracking-[0.14em]"
              >
                <LogIn size={14} />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 space-y-5 relative z-20">

        {/* 1. Identity & Card */}
        <div className="bg-[var(--paper-2)] paper-grain rounded-3xl p-6 border border-[var(--rule)] shadow-[3px_4px_0_rgba(84,12,25,0.05),0_16px_30px_-22px_rgba(84,12,25,0.4)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-[#681121] text-[#FDFBF7] flex items-center justify-center font-hand italic text-2xl border-2 border-[var(--rule)] shadow-[2px_3px_0_rgba(84,12,25,0.18)]">
                  {initial}
                </div>
                {auth.isLoggedIn && (
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#3d7044] text-white flex items-center justify-center border-2 border-[var(--paper-2)] shadow-sm" title="Verified Account">
                    <Check size={12} strokeWidth={3} />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                {!editing ? (
                  <>
                    <div className="flex items-center gap-2">
                      <h2 className="font-hand italic text-lg sm:text-xl text-[#540c19] truncate">
                        {displayName}
                      </h2>
                      {auth.isLoggedIn && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditName(auth.user?.name ?? '');
                            setEditEmail(auth.user?.email ?? '');
                            setEditing(true);
                          }}
                          className="p-1.5 rounded-lg text-[var(--ink-faint)] hover:text-[#681121] hover:bg-[#681121]/10 transition-colors"
                          title="Edit Personal Info"
                        >
                          <Pencil size={14} />
                        </button>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-note text-xs text-[var(--ink-soft)] mt-0.5">
                      {displayPhone && (
                        <span className="flex items-center gap-1">
                          <Phone size={12} className="text-[var(--ink-faint)]" />
                          {displayPhone}
                        </span>
                      )}
                      {displayEmail && (
                        <span className="flex items-center gap-1">
                          <Mail size={12} className="text-[var(--ink-faint)]" />
                          {displayEmail}
                        </span>
                      )}
                      {!displayPhone && !displayEmail && (
                        <span className="text-[#b87319] font-semibold text-[11px]">
                          Guest Access · Sign in to preserve your history
                        </span>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="space-y-2 mt-1">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="form-blank w-full text-sm font-note px-3 py-1.5"
                      placeholder="Full Name"
                    />
                    <input
                      type="email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className="form-blank w-full text-xs font-note px-3 py-1.5"
                      placeholder="Email Address"
                    />
                    {editError && <p className="font-note text-xs text-[#a32230] font-semibold">{editError}</p>}
                    <div className="flex gap-2 pt-1">
                      <button
                        type="button"
                        onClick={handleSave}
                        disabled={saving}
                        className="btn-ink inline-flex items-center gap-1.5 font-note text-xs font-semibold uppercase tracking-[0.12em] px-3.5 py-2"
                      >
                        {saving ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => { setEditing(false); setEditError(''); }}
                        className="btn-outline inline-flex items-center gap-1 font-note text-xs font-semibold uppercase tracking-[0.12em] px-3.5 py-2"
                      >
                        <X size={13} />
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats — two rubber-stamped boxes */}
            <div className="flex items-center gap-2 sm:self-center">
              <div className="flex-1 sm:flex-initial bg-[var(--paper-3)]/60 border-2 border-dashed border-[var(--rule)] rounded-xl px-4 py-2 text-center tilt-l-sm">
                <span className="block font-note text-[9px] font-semibold uppercase tracking-[0.16em] text-[#b87319]">
                  Tier Status
                </span>
                <span className="font-hand italic text-base text-[#540c19]">{tier.name}</span>
              </div>
              <div className="flex-1 sm:flex-initial bg-[var(--paper-3)]/60 border-2 border-dashed border-[var(--rule)] rounded-xl px-4 py-2 text-center tilt-r-sm">
                <span className="block font-note text-[9px] font-semibold uppercase tracking-[0.16em] text-[#b87319]">
                  Hub Pts
                </span>
                <span className="font-hand italic text-base text-[#681121]">{points}</span>
              </div>
            </div>
          </div>

          {/* Guest welcome note — scribbled on ruled paper */}
          {!auth.isLoggedIn && (
            <div className="ruled mt-5 p-4 rounded-2xl bg-[var(--paper-3)]/50 border-2 border-dashed border-[#681121]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h4 className="font-note text-xs font-semibold text-[#681121] flex items-center gap-1.5">
                  <Gift size={15} className="text-[#D48924]" />
                  120 welcome points are waiting on your first sign-in
                </h4>
                <p className="font-note text-[11px] text-[var(--ink-soft)] mt-0.5">
                  Sign in with your phone or email to activate exclusive club discounts and live tracking.
                </p>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={auth.openRegister}
                  className="btn-ink flex-1 sm:flex-initial font-note text-xs font-semibold uppercase tracking-[0.12em] px-4 py-2.5"
                >
                  Join Free
                </button>
                <button
                  type="button"
                  onClick={auth.openLogin}
                  className="btn-outline flex-1 sm:flex-initial font-note text-xs font-semibold uppercase tracking-[0.12em] px-4 py-2.5"
                >
                  Log In
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 2. Club Passport — stamped, not glossy */}
        <div
          onClick={() => push({ type: 'loyalty' })}
          className="relative overflow-hidden bg-[var(--paper-2)] paper-grain rounded-3xl p-6 sm:p-7 border border-[var(--rule)] shadow-[3px_4px_0_rgba(84,12,25,0.05),0_16px_30px_-22px_rgba(84,12,25,0.4)] cursor-pointer group transition-transform duration-300 hover:-translate-y-0.5"
        >
          {/* Passport's inner dashed frame */}
          <div className="pointer-events-none absolute inset-2.5 rounded-2xl border-2 border-dashed border-[#681121]/25" aria-hidden="true" />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="stamp tilt-l-sm text-[#681121] border-[#681121]/40">
                  {tier.name} CLUB PASSPORT
                </span>
                <span className="font-note text-[11px] text-[var(--ink-faint)]">
                  Tap for rewards vault →
                </span>
              </div>

              <div>
                <p className="font-note text-[10px] uppercase tracking-[0.18em] text-[var(--ink-soft)] font-semibold">
                  Available Hub Balance
                </p>
                <div className="flex items-baseline gap-2.5 mt-0.5">
                  <span className="font-hand italic font-bold text-4xl sm:text-5xl tracking-tight text-[#540c19]">
                    {points}
                  </span>
                  <span className="font-hand italic text-sm text-[#b87319]">Points</span>
                  <span className="font-note text-xs text-[var(--ink-soft)] ml-1">
                    (₹{(points * 0.5).toFixed(0)} cashback value)
                  </span>
                </div>
              </div>

              {/* Tier Progress — ink filled in a pressed groove */}
              <div className="pt-1 max-w-md">
                <div className="flex justify-between font-note text-[11px] font-semibold text-[var(--ink-soft)] mb-1.5">
                  <span>Current: {tier.name}</span>
                  <span>Next: {nextTier.name} ({tierNextMin} pts)</span>
                </div>
                <div className="h-2.5 w-full bg-[var(--paper-3)] border border-[var(--rule)] rounded-full overflow-hidden p-0.5">
                  <div
                    className="h-full bg-[#681121] rounded-full transition-all duration-700"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <p className="font-note text-[10px] text-[var(--ink-faint)] mt-1.5">
                  Earn 10 points per ₹100 spent · Unlock free side dishes at {tierNextMin} points
                </p>
              </div>
            </div>

            <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 border-t sm:border-t-0 sm:border-l border-[var(--rule)] pt-4 sm:pt-0 sm:pl-6">
              <div className="text-left sm:text-right">
                <span className="block font-note text-[10px] uppercase tracking-[0.14em] font-semibold text-[var(--ink-faint)]">Redeem Perks</span>
                <span className="font-hand italic text-base text-[#540c19]">Instant Cart Discount</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#681121] text-[#FDFBF7] flex items-center justify-center group-hover:bg-[#540c19] transition-colors">
                <ChevronRight size={22} />
              </div>
            </div>
          </div>
        </div>

        {/* 3. Quick Foodie Preferences */}
        <div className="bg-[var(--paper-2)] paper-grain rounded-3xl p-5 border border-[var(--rule)] shadow-[3px_4px_0_rgba(84,12,25,0.05),0_16px_30px_-22px_rgba(84,12,25,0.4)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#4E8B56]/12 text-[#3d7044] border border-[#4E8B56]/30 flex items-center justify-center">
                <Sliders size={20} />
              </div>
              <div>
                <p className="font-note text-sm font-semibold text-[var(--ink)]">Pure Vegetarian Mode</p>
                <p className="font-note text-xs text-[var(--ink-soft)]">
                  {vegMode ? 'Active: Showing green dot certified veg treats only' : 'Inactive: Showing entire royal snacking menu'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setVegMode((v) => !v)}
              className={`relative inline-flex h-7 w-13 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                vegMode ? 'bg-[#4E8B56]' : 'bg-[var(--rule)]'
              }`}
              role="switch"
              aria-checked={vegMode}
            >
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  vegMode ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* 4. Categorized Service Hub */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Section 1: Orders & Delivery */}
          <div className="bg-[var(--paper-2)] paper-grain rounded-3xl border border-[var(--rule)] shadow-[3px_4px_0_rgba(84,12,25,0.05),0_16px_30px_-22px_rgba(84,12,25,0.4)] divide-y divide-[var(--rule)] overflow-hidden">
            <div className="px-5 py-3.5 bg-[var(--paper-3)]/60 flex items-center justify-between">
              <span className="font-note text-[11px] font-semibold uppercase tracking-[0.16em] text-[#681121]">
                Orders & Delivery
              </span>
              <Clock size={14} className="text-[#681121]" />
            </div>

            <button
              type="button"
              onClick={() => setTab('orders')}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-[var(--paper-3)]/60 transition-colors group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#681121]/8 text-[#681121] border border-[#681121]/15 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Clock size={18} />
                </div>
                <div>
                  <p className="font-note text-xs font-semibold text-[var(--ink)]">Active & Past Orders</p>
                  <p className="font-note text-[11px] text-[var(--ink-soft)]">Track kitchen dispatch, bills & receipts</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-[var(--ink-faint)] group-hover:text-[#681121] group-hover:translate-x-0.5 transition-all" />
            </button>

            <button
              type="button"
              onClick={() => push({ type: 'location' })}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-[var(--paper-3)]/60 transition-colors group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#681121]/8 text-[#681121] border border-[#681121]/15 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <MapPin size={18} />
                </div>
                <div>
                  <p className="font-note text-xs font-semibold text-[var(--ink)]">Saved Delivery Outpost</p>
                  <p className="font-note text-[11px] text-[var(--ink-soft)]">{branch.area}, {branch.city}</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-[var(--ink-faint)] group-hover:text-[#681121] group-hover:translate-x-0.5 transition-all" />
            </button>
          </div>

          {/* Section 2: Rewards & Specials */}
          <div className="bg-[var(--paper-2)] paper-grain rounded-3xl border border-[var(--rule)] shadow-[3px_4px_0_rgba(84,12,25,0.05),0_16px_30px_-22px_rgba(84,12,25,0.4)] divide-y divide-[var(--rule)] overflow-hidden">
            <div className="px-5 py-3.5 bg-[var(--paper-3)]/60 flex items-center justify-between">
              <span className="font-note text-[11px] font-semibold uppercase tracking-[0.16em] text-[#681121]">
                Rewards & Club
              </span>
              <Award size={14} className="text-[#681121]" />
            </div>

            <button
              type="button"
              onClick={() => push({ type: 'offers' })}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-[var(--paper-3)]/60 transition-colors group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#D48924]/15 text-[#b87319] border border-[#D48924]/30 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Award size={18} />
                </div>
                <div>
                  <p className="font-note text-xs font-semibold text-[var(--ink)]">Offers, Coupons & Deals</p>
                  <p className="font-note text-[11px] text-[var(--ink-soft)]">View active promo codes & discounts</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-[var(--ink-faint)] group-hover:text-[#681121] group-hover:translate-x-0.5 transition-all" />
            </button>

            <button
              type="button"
              onClick={handleShareApp}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-[var(--paper-3)]/60 transition-colors group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#D48924]/15 text-[#b87319] border border-[#D48924]/30 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Share2 size={18} />
                </div>
                <div>
                  <p className="font-note text-xs font-semibold text-[var(--ink)]">Invite Friends</p>
                  <p className="font-note text-[11px] text-[var(--ink-soft)]">
                    {copiedShare ? (
                      <span className="text-[#3d7044] font-semibold flex items-center gap-1">
                        <CheckCircle2 size={11} /> Link copied! Send via WhatsApp
                      </span>
                    ) : (
                      'Earn 200 points for every referral friend'
                    )}
                  </p>
                </div>
              </div>
              <span className="stamp tilt-r-sm text-[#b87319] border-[#D48924]/60">
                +200 Pts
              </span>
            </button>
          </div>
        </div>

        {/* 5. Support & Direct Concierge */}
        <div className="bg-[var(--paper-2)] paper-grain rounded-3xl p-5 border border-[var(--rule)] shadow-[3px_4px_0_rgba(84,12,25,0.05),0_16px_30px_-22px_rgba(84,12,25,0.4)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-[#3d7044]/12 text-[#3d7044] border border-[#4E8B56]/30 flex items-center justify-center shrink-0">
                <MessageCircle size={22} />
              </div>
              <div>
                <h3 className="font-hand italic text-lg text-[#540c19]">Kitchen WhatsApp Concierge</h3>
                <p className="font-note text-xs text-[var(--ink-soft)] font-medium mt-0.5">
                  Instant order assistance, corporate bulk inquiries, or culinary feedback.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={async () => {
                const msg = `Hi Gharelu Hub Concierge, I need assistance with my account/order.`;
                const { data } = await proxyApi.sendWhatsApp({ message: msg });
                if (data?.url) window.open(data.url, '_blank');
                else window.open(`https://wa.me/919999999999?text=${encodeURIComponent(msg)}`, '_blank');
              }}
              className="inline-flex items-center justify-center gap-2 bg-[#25D366]/12 text-[#1a7d3f] border-2 border-dashed border-[#25D366]/50 hover:bg-[#25D366]/20 transition-colors font-note text-xs font-semibold px-4 py-3 rounded-xl"
            >
              <MessageCircle size={15} />
              <span>Connect on WhatsApp</span>
            </button>
          </div>
        </div>

        {/* 6. Account Status / Session Control */}
        <div className="pt-2">
          {auth.isLoggedIn ? (
            <button
              type="button"
              onClick={() => {
                confirm({
                  title: 'Sign Out Confirmation',
                  message: 'Are you sure you want to sign out of your Gharelu Hub account on this device?',
                  confirmLabel: 'Yes, Sign Out',
                  cancelLabel: 'Keep Logged In',
                  variant: 'danger',
                  onConfirm: async () => {
                    await auth.logout();
                    showSuccess('You have been signed out safely.');
                  },
                });
              }}
              className="w-full flex items-center justify-center gap-2 p-3.5 rounded-2xl border-2 border-dashed border-[#a32230]/45 text-[#a32230] bg-[#a32230]/5 hover:bg-[#a32230]/10 font-note text-xs font-semibold uppercase tracking-[0.14em] transition-colors"
            >
              <LogOut size={16} />
              <span>Sign Out of Gharelu Hub</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={auth.openLogin}
              className="btn-ink w-full flex items-center justify-center gap-2 p-3.5 font-note text-xs font-semibold uppercase tracking-[0.14em]"
            >
              <LogIn size={16} />
              <span>Sign In / Create Account</span>
            </button>
          )}
        </div>

        {/* Footer Brand Info */}
        <div className="text-center pt-3 pb-6 space-y-1">
          <p className="font-note text-[11px] text-[var(--ink-faint)] font-semibold uppercase tracking-[0.18em]">
            Gharelu Hub kitchen log · Bhopal, MP
          </p>
          <p className="font-hand italic text-xs text-[var(--ink-faint)]">
            Made in small batches, packed by hand · App v2.4.0
          </p>
        </div>

      </div>
    </div>
  );
}
