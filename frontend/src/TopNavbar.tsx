import React, { useEffect, useState } from 'react';
import {
  Zap,
  Search,
  Coins,
  Sparkles,
  ShoppingBag,
  MapPin,
  ChevronDown,
  Compass,
  ReceiptText,
  User,
  Heart,
  Calendar,
  ArrowLeft,
} from 'lucide-react';
import { useApp, cartCount, cartSubtotal, type Tab } from './store';
import { locations } from './data/locations';
import { formatINR } from './lib/utils';
import { useAuth } from './lib/AuthContext';

export default function TopNavbar() {
  const auth = useAuth();
  const tab = useApp((s) => s.tab);
  const setTab = useApp((s) => s.setTab);
  const push = useApp((s) => s.push);
  const pop = useApp((s) => s.pop);
  const stack = useApp((s) => s.stack);
  const cart = useApp((s) => s.cart);
  const setCartOpen = useApp((s) => s.setCartOpen);
  const locationId = useApp((s) => s.locationId);
  const points = useApp((s) => s.points);

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const branch = locations.find((l) => l.id === locationId) ?? locations[0];
  const count = cartCount(cart);
  const subtotal = cartSubtotal(cart);

  const navLinks: Array<{ id: Tab; label: string }> = [
    { id: 'home', label: 'Home' },
    { id: 'menu', label: 'Explore Snacks' },
    { id: 'orders', label: 'Orders' },
    { id: 'reservations', label: 'Tasting Passes' },
    { id: 'profile', label: 'Account' },
  ];

  const hasBack = stack.length > 0;

  return (
    <header className="hidden lg:block sticky top-0 z-40 transition-all duration-300 w-full pointer-events-none">
      {/* 1. SCROLLED STATE: A slip of paper taped across the top */}
      {scrolled ? (
        <div className="w-full flex justify-center pt-3 pb-2 px-4 animate-in fade-in slide-in-from-top-1 duration-200 pointer-events-auto">
          <div className="inline-flex items-center gap-3 bg-[var(--paper-2)] border border-[var(--rule)] px-5 py-2.5 rounded-full shadow-[3px_4px_0_rgba(84,12,25,0.08),0_20px_36px_-26px_rgba(84,12,25,0.55)] relative">
            {/* Back Button (Appears before nav items if inside sub-page/stack) */}
            {hasBack && (
              <button
                type="button"
                onClick={pop}
                className="btn-ink flex items-center gap-1.5 px-3.5 py-2 rounded-full font-note text-xs font-semibold mr-1"
                title="Go Back"
              >
                <ArrowLeft size={15} />
                <span>Back</span>
              </button>
            )}

            {/* Small Brand Logo Icon */}
            <button
              type="button"
              onClick={() => {
                if (hasBack) pop();
                setTab('home');
              }}
              className="w-9 h-9 rounded-full overflow-hidden bg-[#681121] flex items-center justify-center shrink-0 mr-1 shadow-md hover:scale-105 transition-transform border border-[#D48924]/30"
              title="Home"
            >
              <img src="/logo.png" alt="Gharelu Hub" className="w-full h-full object-cover" />
            </button>

            {/* Navigation Links — hand-lettered tabs */}
            <nav aria-label="Desktop floating pill" className="flex items-center gap-1">
              {navLinks.map((item) => {
                const active = tab === item.id && !hasBack;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      if (hasBack) {
                        while (useApp.getState().stack.length > 0) {
                          useApp.getState().pop();
                        }
                      }
                      setTab(item.id);
                    }}
                    className={`px-3.5 py-1.5 rounded-full font-note text-sm transition-all relative whitespace-nowrap ${
                      active
                        ? 'text-[#681121] bg-[#681121]/12 font-semibold'
                        : 'text-[var(--ink-soft)] hover:text-[#540c19] hover:bg-[var(--paper-3)]'
                    }`}
                  >
                    {item.label}
                    {active && (
                      <span className="absolute bottom-0.5 inset-x-3 h-0.5 bg-[#D48924] rounded-full" />
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Mini Actions: Search & Points */}
            <div className="flex items-center gap-2 pl-3 ml-1.5 border-l border-[var(--rule)]">
              <button
                type="button"
                onClick={() => {
                  window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
                  push({ type: 'search' });
                }}
                className="p-2 rounded-full hover:bg-[var(--paper-3)] text-[var(--ink-soft)] transition-colors"
                title="Search Snacks"
              >
                <Search size={16} className="text-[#D48924]" />
              </button>

              <button
                type="button"
                onClick={() => push({ type: 'loyalty' })}
                className="stamp tilt-r-sm text-[#8B4513] border-[#D48924]/50"
                title="Rewards Balance"
              >
                <Coins size={13} className="text-[#D48924]" />
                <span>{points} pts</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* 2. TOP DEFAULT STATE: A ruled banner across the page */
        <div className="bg-[var(--paper)]/95 paper-grain backdrop-blur-md border-b border-[var(--rule)] shadow-sm transition-all w-full pointer-events-auto relative">
          <div className="absolute top-0 inset-x-0 h-1 bg-[#681121]" aria-hidden="true" />
          <div className="w-full px-6 lg:px-8 xl:px-12 py-3 flex items-center justify-between gap-4 xl:gap-6">
            {/* Left: Brand Logo & Bhopal Express Location */}
            <div className="flex items-center gap-3 xl:gap-5 shrink-0">
              {/* Back Button if in sub-screen/stack */}
              {hasBack && (
                <button
                  type="button"
                  onClick={pop}
                  className="btn-ink flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-note text-xs font-semibold"
                  title="Go Back"
                >
                  <ArrowLeft size={16} />
                  <span>Back</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  if (hasBack) pop();
                  setTab('home');
                }}
                className="flex items-center gap-2.5 group text-left"
              >
                <div className="h-10 w-10 xl:h-11 xl:w-11 rounded-2xl overflow-hidden shadow-md group-hover:scale-105 transition-transform border border-[#D48924]/30 bg-[#681121] flex items-center justify-center shrink-0">
                  <img
                    src="/logo.png"
                    alt="Gharelu Hub Logo"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <span className="font-hand italic font-bold text-xl xl:text-2xl tracking-tight text-[#540c19] block leading-tight group-hover:text-[#681121] transition-colors">
                    Gharelu Hub
                  </span>
                  <span className="font-note text-[9px] xl:text-[10px] font-semibold tracking-[0.2em] uppercase text-[#b87319] block">
                    Gharelu Baked Heritage
                  </span>
                </div>
              </button>

              {/* Location Delivery Cluster Pill — an ink stamp */}
              <button
                type="button"
                onClick={() => push({ type: 'location' })}
                className="hidden xl:flex items-center gap-2 bg-[var(--paper-2)] hover:bg-[var(--paper-3)] border-2 border-dashed border-[var(--rule)] px-3 py-1.5 rounded-xl text-left transition-colors"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-xl bg-[#D48924] text-white shrink-0">
                  <Zap size={13} className="fill-white" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 font-note text-xs font-semibold text-[var(--ink)]">
                    <span>10-15 Min Hub</span>
                    <span className="text-[8px] font-semibold tracking-[0.16em] uppercase text-[#3d7044] border-b border-dashed border-[#4E8B56]/50">
                      Fresh
                    </span>
                  </div>
                  <p className="font-note text-[10px] text-[var(--ink-faint)] truncate max-w-[100px]">
                    {branch.area}
                  </p>
                </div>
                <ChevronDown size={13} className="text-[var(--ink-faint)]" />
              </button>
            </div>

            {/* Center: Desktop Navigation Links */}
            <nav aria-label="Desktop primary" className="flex items-center gap-1">
              {navLinks.map((item) => {
                const active = tab === item.id && !hasBack;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      if (hasBack) {
                        while (useApp.getState().stack.length > 0) {
                          useApp.getState().pop();
                        }
                      }
                      setTab(item.id);
                    }}
                    className={`px-3 py-1.5 rounded-xl font-note text-xs xl:text-sm transition-all relative whitespace-nowrap ${
                      active
                        ? 'text-[#681121] bg-[#681121]/10 font-semibold'
                        : 'text-[var(--ink-soft)] hover:text-[#540c19] hover:bg-[var(--paper-2)]'
                    }`}
                  >
                    {item.label}
                    {active && (
                      <span className="absolute bottom-0 inset-x-3 h-0.5 bg-[#D48924] rounded-full" />
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Right: Search, Loyalty Points & Cart / Book Now Button */}
            <div className="flex items-center gap-2 xl:gap-2.5 shrink-0">
              {/* Quick Search */}
              <button
                type="button"
                onClick={() => push({ type: 'search' })}
                className="flex items-center gap-1.5 bg-[var(--paper-2)] hover:bg-[var(--paper-3)] text-[var(--ink-soft)] px-2.5 py-1.5 rounded-xl font-note text-xs font-medium transition-colors border border-[var(--rule)]"
              >
                <Search size={14} className="text-[#D48924]" />
                <span className="hidden 2xl:inline">Search...</span>
              </button>

              {/* Points — ink stamp */}
              <button
                type="button"
                onClick={() => push({ type: 'loyalty' })}
                className="stamp tilt-l-sm text-[#8B4513] border-[#D48924]/50"
              >
                <Coins size={13} className="text-[#D48924]" />
                <span>{points} pts</span>
              </button>

              {/* Auth Button */}
              {auth.isLoggedIn ? (
                <button
                  type="button"
                  onClick={() => setTab('profile')}
                  className="flex items-center gap-1.5 bg-[var(--paper-2)] hover:bg-[var(--paper-3)] border border-[var(--rule)] text-[var(--ink)] font-note font-medium text-xs px-2.5 py-1.5 rounded-xl transition-colors"
                >
                  <div className="w-5 h-5 rounded-full bg-[#681121] text-white flex items-center justify-center text-[10px] font-semibold">
                    {auth.user?.name?.[0]?.toUpperCase() ?? 'U'}
                  </div>
                  <span className="hidden xl:inline max-w-[80px] truncate">
                    {auth.user?.name?.split(' ')[0]}
                  </span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => auth.openLogin()}
                  className="btn-outline flex items-center gap-1.5 font-note text-xs font-semibold px-2.5 py-1.5"
                >
                  <User size={13} />
                  <span>Login</span>
                </button>
              )}

              {/* Tasting Pass / Booking Shortcut */}
              <button
                type="button"
                onClick={() => setTab('reservations')}
                className="btn-ink font-note text-xs font-semibold px-3 py-1.5 whitespace-nowrap"
              >
                Book Pass
              </button>

              {/* Admin Portal Shortcut */}
              <a
                href="http://localhost:3001"
                target="_blank"
                rel="noopener noreferrer"
                title="Open Gharelu Hub Admin Control Panel"
                className="hidden lg:flex items-center gap-1 text-[11px] font-note font-semibold text-[#681121] bg-[#D48924]/15 hover:bg-[#D48924]/25 border border-[#D48924]/40 px-2.5 py-1.5 rounded-xl transition-all"
              >
                <span>Admin</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
