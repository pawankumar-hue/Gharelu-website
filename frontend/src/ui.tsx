import React, { ReactNode, CSSProperties } from 'react';
import { ArrowLeft, X, Star, Clock, Zap, ShieldCheck } from 'lucide-react';
import { useApp } from './store';

/* ---------- Shared Handmade Primitives ---------- */
/* Everything here reads like ink on kraft paper — see index.css
   for the .stamp / .tape / .btn-ink / .marker design system. */

/** Pure Veg Green Dot Badge — drawn like a rubber stamp */
export function VegBadge({ className = '' }: { className?: string }) {
  return (
    <div
      title="100% Pure Vegetarian"
      className={`inline-flex items-center justify-center w-3.5 h-3.5 border-[1.5px] border-[#3d7044] rounded-[3px] bg-white p-[2px] shrink-0 ${className}`}
    >
      <div className="w-1.5 h-1.5 rounded-full bg-[#3d7044]" />
    </div>
  );
}

/** 10 MINS Delivery Pill — an ink stamp, not a glossy chip */
export function DeliveryPill({ time = '10 MINS' }: { time?: string }) {
  return (
    <span className="stamp tilt-r-sm text-[#b87319] border-[#D48924]/60">
      <Zap size={10} className="fill-[#b87319]" />
      <span>{time}</span>
    </span>
  );
}

/** Rating Pill — handwritten star note */
export function RatingBadge({ rating = '4.8', count }: { rating?: string | number; count?: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-[#3d7044] font-note text-[11px] font-semibold">
      <Star size={11} className="fill-[#3d7044] text-[#3d7044]" />
      <span>{rating}</span>
      {count && <span className="text-[9px] font-normal opacity-70">({count})</span>}
    </span>
  );
}

/** Section Header — serif italic title with a hand-drawn underline */
export function SectionTitle({
  children,
  subtitle,
  action,
}: {
  children: ReactNode;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-4 flex items-end justify-between px-4">
      <div>
        <h2 className="font-hand italic text-2xl text-[#540c19] tracking-tight leading-tight">
          {children}
        </h2>
        <svg viewBox="0 0 120 8" className="w-24 h-2 mt-0.5" fill="none" aria-hidden="true">
          <path d="M2 5.5c14-3 28-3.5 42-2.5s27 2.5 41 1.5 22-2.5 33-3.5" stroke="#D48924" strokeWidth="2" strokeLinecap="round" />
        </svg>
        {subtitle && (
          <p className="font-note text-[11px] text-[var(--ink-faint)] mt-1 font-medium">{subtitle}</p>
        )}
      </div>
      {action && (
        <div className="shrink-0 font-note text-sm font-semibold text-[#681121] underline decoration-dotted decoration-[#D48924] underline-offset-4">
          {action}
        </div>
      )}
    </div>
  );
}

/** Tab header with delivery time & location context */
export function TabHeader({
  eyebrow,
  title,
  right,
}: {
  eyebrow?: string;
  title: string;
  right?: ReactNode;
}) {
  return (
    <header className="sticky top-0 lg:top-[73px] z-20 bg-[var(--paper)]/95 backdrop-blur-md border-b border-[var(--rule)] px-4 sm:px-6 lg:px-10 py-3.5 sm:py-4 flex items-center justify-between transition-all">
      <div>
        {eyebrow && (
          <p className="font-note text-[10px] font-semibold uppercase tracking-[0.22em] text-[#b87319]">
            {eyebrow}
          </p>
        )}
        <h1 className="font-hand italic text-2xl sm:text-3xl text-[#540c19] tracking-tight leading-tight">
          {title}
        </h1>
      </div>
      {right && <div>{right}</div>}
    </header>
  );
}

/** Standard Price Element — serif numerals, like a price list */
export function Price({ children, original }: { children: ReactNode; original?: number }) {
  return (
    <div className="inline-flex items-baseline gap-1.5 font-hand">
      <span className="text-[#681121] font-bold text-lg tracking-tight">₹{children}</span>
      {original && (
        <span className="text-[var(--ink-faint)] text-xs font-note font-medium line-through">
          ₹{original}
        </span>
      )}
    </div>
  );
}

/** Screen Wrapper with Back Button — a fresh sheet from the pad */
export function Screen({
  title,
  eyebrow,
  children,
  right,
  onBack,
  bare,
}: {
  title?: string;
  eyebrow?: string;
  children: ReactNode;
  right?: ReactNode;
  onBack?: () => void;
  bare?: boolean;
}) {
  const pop = useApp((s) => s.pop);
  const back = onBack ?? pop;

  if (bare) return <div className="min-h-screen bg-[var(--paper)]">{children}</div>;

  return (
    <div className="min-h-screen bg-[var(--paper)] paper-grain pb-24 text-[var(--ink)]">
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-[var(--rule)] bg-[var(--paper)]/95 px-4 py-3 backdrop-blur-md">
        <button
          type="button"
          onClick={back}
          aria-label="Back"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--paper-2)] text-[#681121] border border-[var(--rule)] hover:bg-[var(--paper-3)] transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="min-w-0 flex-1 text-center px-2">
          {eyebrow && (
            <p className="font-note text-[9px] font-semibold text-[#b87319] uppercase tracking-[0.2em]">
              {eyebrow}
            </p>
          )}
          {title && (
            <h1 className="font-hand italic text-lg text-[#540c19] truncate">{title}</h1>
          )}
        </div>
        <div className="flex h-9 w-9 items-center justify-center">{right}</div>
      </header>
      {children}
    </div>
  );
}

/** Bottom Sheet — a slip of paper pulled up from the notepad */
export function Sheet({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/55 backdrop-blur-sm transition-opacity p-0 sm:p-4">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />
      <div className="relative w-full max-w-lg max-h-[90vh] flex flex-col rounded-t-3xl sm:rounded-3xl bg-[var(--paper)] paper-grain border border-[var(--rule)] shadow-2xl z-10 slide-up-modal overflow-hidden">
        {/* Header - Fixed / Sticky */}
        <div className="shrink-0 flex flex-col items-center bg-[var(--paper)] pt-2.5 pb-2.5 border-b border-[var(--rule)] px-5 relative">
          <div className="h-1.5 w-12 rounded-full bg-[var(--rule)] sm:hidden mb-1.5" />
          <div className="flex w-full items-center justify-between">
            <h2 className="font-hand italic text-xl text-[#540c19]">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full bg-[var(--paper-2)] border border-[var(--rule)] p-1.5 text-[var(--ink-soft)] hover:bg-[var(--paper-3)] transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">{children}</div>

        {/* Fixed Pinned Bottom Footer (Never moves on scroll) */}
        {footer && (
          <div className="shrink-0 border-t border-[var(--rule)] bg-[var(--paper)] px-4 py-3 shadow-[0_-8px_20px_rgba(0,0,0,0.06)]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

/** Fallback Image Display — framed like a taped-in polaroid */
export function DishImg({
  name,
  className = '',
  alt = 'Gharelu Hub Snack',
}: {
  name: string;
  className?: string;
  alt?: string;
}) {
  const src = name.startsWith('/') || name.includes('.') ? name : `/images/${name}.webp`;
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={(e) => {
        const target = e.currentTarget;
        if (!target.src.includes('in-03.webp')) {
          target.src = '/images/in-03.webp';
        }
      }}
      className={`object-cover ${className}`}
    />
  );
}

/** Empty State — a doodle on a blank page */
export function Empty({
  title,
  sub,
  cta,
  onCta,
}: {
  title: string;
  sub: string;
  cta?: string;
  onCta?: () => void;
  art?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#681121]/8 text-[#681121] mb-4 border-2 border-dashed border-[#681121]/25 tilt-l">
        <Zap size={34} />
      </div>
      <h3 className="font-hand italic text-2xl text-[#540c19]">{title}</h3>
      <p className="mt-1.5 max-w-xs font-note text-xs text-[var(--ink-faint)] leading-relaxed">
        {sub}
      </p>
      {cta && onCta && (
        <button
          type="button"
          onClick={onCta}
          className="btn-ink mt-6 px-6 py-3 font-note text-xs font-semibold uppercase tracking-[0.14em]"
        >
          {cta}
        </button>
      )}
    </div>
  );
}

/** Status Pill — an ink stamp chip */
export function Pill({
  children,
  tone = 'amber',
}: {
  children: ReactNode;
  tone?: 'open' | 'soon' | 'off' | 'amber' | 'green';
}) {
  const tones = {
    open: 'text-[#3d7044] border-[#4E8B56]/50',
    green: 'text-[#3d7044] border-[#4E8B56]/50',
    soon: 'text-[#b87319] border-[#D48924]/50',
    amber: 'text-[#b87319] border-[#D48924]/50',
    off: 'text-[var(--ink-faint)] border-[var(--rule)]',
  };

  return <span className={`stamp ${tones[tone]}`}>{children}</span>;
}
