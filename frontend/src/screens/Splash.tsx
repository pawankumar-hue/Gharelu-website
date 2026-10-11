import React, { useEffect, useRef, useState } from 'react';
import { Zap, ShieldCheck, ArrowRight, Clock, Award } from 'lucide-react';
import { useApp } from '../store';

const INTRO_HOLD_MS = 2400;

export default function Splash() {
  const setPhase = useApp((s) => s.setPhase);
  const [leaving, setLeaving] = useState(false);
  const skipped = useRef(false);

  const finish = () => {
    if (skipped.current) return;
    skipped.current = true;
    setLeaving(true);
    window.setTimeout(() => setPhase('app'), 300);
  };

  useEffect(() => {
    const t = window.setTimeout(finish, INTRO_HOLD_MS);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <div
      onClick={finish}
      className={`fixed inset-0 z-50 flex flex-col items-center justify-between p-6 bg-[var(--paper)] paper-grain text-[var(--ink)] transition-opacity duration-300 ${
        leaving ? 'opacity-0' : 'opacity-100'
      } cursor-pointer`}
    >
      <div className="pt-12 text-center">
        {/* 10-15 min badge — an ink stamp pressed onto the cover */}
        <span className="stamp tilt-r-sm text-[#b87319] border-[#D48924]/60">
          <Zap size={11} className="fill-[#b87319]" />
          <span>Bhopal&apos;s 10-15 Min Snack Delivery</span>
        </span>
      </div>

      {/* Brand Identity — logo pinned like a photo in the logbook */}
      <div className="flex flex-col items-center text-center">
        <div className="relative mb-5">
          <span className="tape w-20 -top-3 left-1/2 -translate-x-1/2 rotate-[-3deg] z-10" aria-hidden="true" />

          <div className="tilt-r bg-white p-2.5 pb-8 rounded-sm border border-[var(--rule)] shadow-[4px_6px_0_rgba(84,12,25,0.08),0_20px_40px_-24px_rgba(84,12,25,0.5)]">
            <div className="h-24 w-24 overflow-hidden bg-[var(--paper-3)]">
              <img
                src="/logo.png"
                alt="Gharelu Hub Logo"
                className="h-full w-full object-cover"
              />
            </div>

            {/* Handwritten polaroid caption */}
            <p className="font-hand italic text-sm text-[var(--ink-soft)] text-center mt-2 leading-none">
              from our kitchen, since 1948
            </p>
          </div>
        </div>

        <h1 className="font-hand italic text-4xl tracking-tight text-[#540c19]">
          GHARELU HUB
        </h1>
        <svg viewBox="0 0 200 10" className="w-40 h-2.5 mt-1.5" fill="none" aria-hidden="true">
          <path d="M2 7c24-4 46-5 70-3.6s44 3.6 68 2.4 38-4 58-5" stroke="#D48924" strokeWidth="2.4" strokeLinecap="round" />
        </svg>
        <p className="mt-2 font-hand italic text-lg text-[#b87319] tracking-wide">
          <span className="marker">Gharelu Taste. Modern Crunch.</span>
        </p>
        <p className="mt-1.5 font-note text-xs text-[var(--ink-soft)] max-w-xs leading-relaxed">
          Small-batch preservative-free makhana, namkeen &amp; fresh bakery
        </p>

        {/* Badges — two rubber stamps */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <span className="stamp tilt-l-sm text-[#3d7044] border-[#4E8B56]/50">
            100% Pure Veg
          </span>
          <span className="stamp tilt-r-sm text-[#b87319] border-[#D48924]/60">
            100% Baked, Not Fried
          </span>
        </div>
      </div>

      {/* Tap to enter footer */}
      <div className="w-full max-w-sm pb-8 text-center">
        <button
          type="button"
          onClick={finish}
          className="btn-ink w-full flex items-center justify-center gap-2 font-note text-sm font-semibold uppercase tracking-[0.14em] py-4"
        >
          <span>Explore Snacks</span>
          <ArrowRight size={16} />
        </button>
        <p className="mt-3 font-note text-[10px] uppercase font-semibold tracking-[0.24em] text-[var(--ink-faint)]">
          Tap anywhere to continue
        </p>
      </div>
    </div>
  );
}
