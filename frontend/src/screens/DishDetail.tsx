import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  Heart,
  Minus,
  Plus,
  Share2,
  Zap,
  ShieldCheck,
  Clock,
} from 'lucide-react';
import { useApp, activeDishes, dishById, type OptionChoice } from '../store';
import { customizationsFor, pairingsFor } from '../data';
import { DishImg, Empty, VegBadge, RatingBadge, DeliveryPill } from '../ui';
import { formatINR } from '../lib/utils';
import { useToast } from '../lib/ToastContext';

export default function DishDetail({ id }: { id: string }) {
  const pop = useApp((s) => s.pop);
  const push = useApp((s) => s.push);
  const locationId = useApp((s) => s.locationId);
  const addToCart = useApp((s) => s.addToCart);
  const favorites = useApp((s) => s.favorites);
  const toggleFavorite = useApp((s) => s.toggleFavorite);
  const { showSuccess } = useToast();

  // Re-resolve whenever the live menu refreshes (price / availability edits from admin)
  const liveDishes = useApp((s) => s.dishes);
  const dish = useMemo(() => dishById(id), [id, liveDishes]);
  const groups = useMemo(() => (dish ? customizationsFor(dish) : []), [dish]);

  const firstOf = () =>
    Object.fromEntries(
      groups.filter((g) => g.required).map((g) => [g.id, [g.choices[0].id]])
    ) as Record<string, string[]>;

  const [sel, setSel] = useState<Record<string, string[]>>(firstOf);
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState('');
  const [added, setAdded] = useState(false);

  if (!dish) {
    return (
      <div className="min-h-screen bg-[var(--paper)] paper-grain flex flex-col justify-center items-center p-6 text-[var(--ink)]">
        <Empty
          title="Item Not Found"
          sub="This snack is currently out of stock or being freshly roasted."
          cta="Back to Menu"
          onCta={pop}
        />
      </div>
    );
  }

  const isFav = favorites.includes(dish.id);
  const pairings = pairingsFor(dish, activeDishes(locationId));

  const chosen: OptionChoice[] = groups.flatMap((g) =>
    (sel[g.id] ?? []).map((cid) => {
      const c = g.choices.find((x) => x.id === cid)!;
      return { group: g.label, choice: c.label, delta: c.delta };
    })
  );

  const delta = chosen.reduce((n, o) => n + o.delta, 0);
  const unit = dish.price + delta;
  const total = unit * qty;

  const toggle = (gid: string, cid: string, multi: boolean) =>
    setSel((s) => {
      const cur = s[gid] ?? [];
      if (multi) {
        return { ...s, [gid]: cur.includes(cid) ? cur.filter((x) => x !== cid) : [...cur, cid] };
      }
      return { ...s, [gid]: [cid] };
    });

  const add = () => {
    addToCart({ dishId: dish.id, qty, options: chosen, note: note.trim() || undefined });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div className="min-h-screen bg-[var(--paper)] paper-grain pb-36 text-[var(--ink)]">
      {/* Top Header — the tab of a recipe card */}
      <div className="sticky top-0 z-30 flex items-center justify-between p-4 sm:px-6 lg:px-8 bg-[var(--paper)]/95 backdrop-blur-md border-b border-[var(--rule)] shadow-sm relative">
        <div className="absolute top-0 inset-x-0 h-1 bg-[#681121]" aria-hidden="true" />
        <div className="max-w-6xl w-full mx-auto flex items-center justify-between">
          <button
            type="button"
            onClick={pop}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--paper-2)] text-[#681121] border border-[var(--rule)] hover:bg-[var(--paper-3)] transition-colors"
          >
            <ArrowLeft size={18} />
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const shareText = `${dish.name} — Gharelu Hub Bhopal`;
                if (navigator.clipboard) {
                  navigator.clipboard.writeText(shareText);
                  showSuccess(`Copied "${dish.name}" to clipboard!`, 'Share Treat');
                } else {
                  showSuccess(shareText, 'Share Treat');
                }
              }}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--paper-2)] text-[var(--ink-soft)] border border-[var(--rule)] hover:bg-[var(--paper-3)] transition-colors"
            >
              <Share2 size={16} />
            </button>
            <button
              type="button"
              onClick={() => toggleFavorite(dish.id)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--paper-2)] text-[var(--ink-soft)] border border-[var(--rule)] hover:bg-[var(--paper-3)] transition-colors"
            >
              <Heart size={16} className={isFav ? 'fill-[#681121] text-[#681121]' : ''} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Responsive Grid Layout (Desktop Side-by-Side, Mobile Stacked) */}
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10 items-start">
          {/* Left Column: Product Image — a photo pinned to the board */}
          <div className="md:sticky md:top-24">
            <div className="relative tilt-l">
              <span className="tape w-20 -top-3 left-1/2 -translate-x-1/2 rotate-[-4deg] z-10" aria-hidden="true" />
              <div className="relative aspect-video md:aspect-square w-full bg-white p-2.5 pb-10 rounded-sm border border-[var(--rule)] shadow-[4px_6px_0_rgba(84,12,25,0.08),0_20px_40px_-24px_rgba(84,12,25,0.5)]">
                <div className="w-full h-full overflow-hidden bg-[var(--paper-3)]">
                  <DishImg name={dish.image} className="w-full h-full object-cover" />
                </div>
                <div className="absolute top-5 left-5 flex items-center gap-2">
                  <VegBadge />
                  <DeliveryPill time="10 MINS" />
                </div>
                {dish.bestseller && (
                  <span className="stamp absolute top-5 right-5 rotate-[3deg] text-[#681121] border-[#681121]/50">
                    Bestseller
                  </span>
                )}
                <p className="font-hand italic text-lg text-[var(--ink-soft)] text-center mt-2 leading-none">
                  straight from today&apos;s batch
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Product Details & Customizations */}
          <div className="space-y-5">
            <div className="bg-[var(--paper-2)] paper-grain rounded-3xl p-5 sm:p-6 border border-[var(--rule)] shadow-[3px_4px_0_rgba(84,12,25,0.05),0_16px_30px_-22px_rgba(84,12,25,0.4)]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h1 className="font-hand italic text-3xl sm:text-4xl text-[#540c19] tracking-tight leading-tight">
                    {dish.name}
                  </h1>
                  <div className="mt-2 flex items-center gap-2">
                    <RatingBadge rating="4.9" count="240+ ratings" />
                    <span className="text-xs text-[var(--ink-faint)]">·</span>
                    <span className="font-note text-xs font-medium text-[var(--ink-soft)]">{dish.weight || '40g pack'}</span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-note text-xs text-[var(--ink-faint)] line-through block font-medium">
                    ₹{Math.round(dish.price * 1.25)}
                  </span>
                  <span className="font-hand font-bold text-3xl sm:text-4xl text-[#681121]">
                    {formatINR(dish.price)}
                  </span>
                </div>
              </div>

              <p className="mt-3 font-note text-[13px] sm:text-sm text-[var(--ink-soft)] leading-relaxed">
                {dish.description}
              </p>

              {/* Kitchen guarantees — three ink stamps */}
              <div className="mt-5 pt-4 border-t border-dashed border-[var(--rule)] grid grid-cols-3 gap-2 text-center">
                <div className="bg-[var(--paper)] rounded-2xl p-3 border-2 border-dashed border-[var(--rule)]">
                  <Clock size={18} className="mx-auto text-[#D48924] mb-1" />
                  <p className="font-note text-[11px] font-semibold text-[var(--ink)]">48h SLA</p>
                  <p className="font-note text-[10px] text-[var(--ink-faint)]">Baked-on stamp</p>
                </div>
                <div className="bg-[var(--paper)] rounded-2xl p-3 border-2 border-dashed border-[var(--rule)]">
                  <ShieldCheck size={18} className="mx-auto text-[#4E8B56] mb-1" />
                  <p className="font-note text-[11px] font-semibold text-[var(--ink)]">Clean food</p>
                  <p className="font-note text-[10px] text-[var(--ink-faint)]">0% preservatives</p>
                </div>
                <div className="bg-[var(--paper)] rounded-2xl p-3 border-2 border-dashed border-[var(--rule)]">
                  <Zap size={18} className="mx-auto text-[#D48924] mb-1" />
                  <p className="font-note text-[11px] font-semibold text-[var(--ink)]">Deck roasted</p>
                  <p className="font-note text-[10px] text-[var(--ink-faint)]">Convection oven</p>
                </div>
              </div>

              {dish.ingredients && dish.ingredients.length > 0 && (
                <div className="mt-5 pt-4 border-t border-dashed border-[var(--rule)]">
                  <p className="font-note text-[10px] font-semibold uppercase tracking-[0.2em] text-[#681121] mb-2">
                    Clean ingredients
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {dish.ingredients.map((ing) => (
                      <span
                        key={ing}
                        className="stamp text-[#3d7044] border-[#4E8B56]/40"
                      >
                        {ing}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Customization Options — ticks on a form */}
            {groups.length > 0 && (
              <div className="space-y-4">
                {groups.map((group) => (
                  <div
                    key={group.id}
                    className="bg-[var(--paper-2)] paper-grain rounded-3xl p-5 border border-[var(--rule)] shadow-[3px_4px_0_rgba(84,12,25,0.05),0_16px_30px_-22px_rgba(84,12,25,0.4)]"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-hand italic text-xl text-[#540c19]">
                        {group.label}
                      </h3>
                      {group.required && (
                        <span className="stamp text-[#681121] border-[#681121]/40">
                          Required
                        </span>
                      )}
                    </div>

                    <div className="space-y-2">
                      {group.choices.map((choice) => {
                        const isChosen = (sel[group.id] ?? []).includes(choice.id);
                        return (
                          <button
                            key={choice.id}
                            type="button"
                            onClick={() => toggle(group.id, choice.id, !!group.multi)}
                            className={`w-full flex items-center justify-between p-3.5 rounded-2xl border-2 text-left transition-all ${
                              isChosen
                                ? 'border-[#681121] bg-[#681121]/8 font-medium text-[#681121] shadow-[2px_3px_0_rgba(36,4,9,0.12)]'
                                : 'border-dashed border-[var(--rule)] bg-[var(--paper)] hover:border-[#D48924] text-[var(--ink)]'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                  isChosen
                                    ? 'border-[#681121] bg-[#681121]'
                                    : 'border-[var(--rule)] bg-white'
                                }`}
                              >
                                {isChosen && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                              </div>
                              <span className="font-note text-xs sm:text-sm font-medium">{choice.label}</span>
                            </div>

                            {choice.delta > 0 && (
                              <span className="font-note text-xs font-semibold text-[#681121]">
                                +{formatINR(choice.delta)}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Pairings — suggested by the kitchen */}
        {pairings.length > 0 && (
          <div className="mt-10">
            <h3 className="font-hand italic text-2xl text-[#540c19] mb-1">Goes well with</h3>
            <svg viewBox="0 0 140 8" className="w-28 h-2 mb-4" fill="none" aria-hidden="true">
              <path d="M2 5.5c18-3 36-3.5 54-2.5s34 2.5 52 1.5 20-2.5 30-3.5" stroke="#D48924" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {pairings.slice(0, 4).map((p) => (
                <div
                  key={p.id}
                  onClick={() => push({ type: 'dish', id: p.id })}
                  className="bg-[var(--paper-2)] paper-grain rounded-3xl p-3 border border-[var(--rule)] shadow-[2px_3px_0_rgba(84,12,25,0.05)] hover:shadow-lg hover:border-[#D48924] transition-all cursor-pointer"
                >
                  <div className="aspect-square w-full rounded-2xl overflow-hidden bg-[var(--paper-3)] mb-2">
                    <DishImg name={p.image} className="w-full h-full object-cover" />
                  </div>
                  <p className="font-hand font-semibold text-base text-[#540c19] truncate">{p.name}</p>
                  <p className="font-hand font-bold text-base text-[#681121] mt-0.5">{formatINR(p.price)}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Floating Bottom Bar — the order slip */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-[var(--paper)]/95 paper-grain backdrop-blur-md border-t-2 border-[var(--rule)] px-4 py-3 shadow-nav relative">
        <div className="absolute top-0 inset-x-0 h-0.5 bg-[#681121]" aria-hidden="true" />
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center bg-[var(--paper-2)] border-2 border-dashed border-[var(--rule)] rounded-2xl px-3 py-2">
            <button
              type="button"
              onClick={() => setQty(Math.max(1, qty - 1))}
              className="p-1 text-[var(--ink-soft)] hover:text-[#681121] rounded"
            >
              <Minus size={16} />
            </button>
            <span className="w-10 text-center font-note font-semibold text-sm sm:text-base text-[var(--ink)]">{qty}</span>
            <button
              type="button"
              onClick={() => setQty(qty + 1)}
              className="p-1 text-[var(--ink-soft)] hover:text-[#681121] rounded"
            >
              <Plus size={16} />
            </button>
          </div>

          {dish.available ? (
            <button
              type="button"
              onClick={add}
              className="btn-ink flex-1 max-w-md flex items-center justify-between font-note text-sm sm:text-base font-semibold py-3.5 px-6"
            >
              <span>{added ? 'Added to bag ✓' : 'Add to bag'}</span>
              <span>{formatINR(total)}</span>
            </button>
          ) : (
            <div className="flex-1 max-w-md flex items-center justify-between rounded-[0.7rem] border-2 border-dashed border-[var(--rule)] bg-[var(--paper-3)]/60 text-[var(--ink-faint)] font-note text-sm font-semibold py-3.5 px-6">
              <span>Sold out — back after the next roast</span>
              <span className="stamp text-[var(--ink-faint)] border-[var(--rule)]">{formatINR(total)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
