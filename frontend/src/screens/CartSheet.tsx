import React from 'react';
import {
  Minus,
  Plus,
  ArrowRight,
  MessageCircle,
  ShieldCheck,
  Zap,
  Trash2,
  Clock,
  Sparkles,
  ChevronRight,
  ShoppingBag,
} from 'lucide-react';
import { useApp, lineTotal, cartSubtotal, cartCount, dishById } from '../store';
import { Sheet, DishImg, Empty, VegBadge } from '../ui';
import { formatINR } from '../lib/utils';
import { proxyApi } from '../lib/api';

export default function CartSheet() {
  const open = useApp((s) => s.cartOpen);
  const setOpen = useApp((s) => s.setCartOpen);
  const cart = useApp((s) => s.cart);
  const setQty = useApp((s) => s.setQty);
  const clearCart = useApp((s) => s.clearCart);
  const push = useApp((s) => s.push);
  const pop = useApp((s) => s.pop);

  const subtotal = cartSubtotal(cart);
  const count = cartCount(cart);

  // Live availability — the kitchen may have sold something out while it sat in the bag
  const soldOutLines = cart.filter((l) => dishById(l.dishId)?.available === false);
  const hasSoldOut = soldOutLines.length > 0;

  const freeDeliveryThreshold = 299;
  const deliveryFee = subtotal >= freeDeliveryThreshold ? 0 : 35;
  const platformFee = 5;
  const grandTotal = subtotal + deliveryFee + platformFee;
  const amountToFreeDelivery = Math.max(0, freeDeliveryThreshold - subtotal);
  const freeDeliveryPercent = Math.min(100, Math.round((subtotal / freeDeliveryThreshold) * 100));

  const isFreeDelivery = subtotal >= freeDeliveryThreshold;
  const [showCelebration, setShowCelebration] = React.useState(false);
  const prevFreeDeliveryRef = React.useRef(isFreeDelivery);

  // Trigger full-screen celebration burst when threshold is crossed
  React.useEffect(() => {
    if (!prevFreeDeliveryRef.current && isFreeDelivery) {
      setShowCelebration(true);
      const timer = setTimeout(() => {
        setShowCelebration(false);
      }, 2800);
      return () => clearTimeout(timer);
    }
    prevFreeDeliveryRef.current = isFreeDelivery;
  }, [isFreeDelivery]);

  const checkout = () => {
    setOpen(false);
    pop();
    push({ type: 'checkout' });
  };

  const orderWhatsApp = async () => {
    const linesText = cart
      .map((l) => {
        const d = dishById(l.dishId);
        return `• ${l.qty}x ${d?.name || 'Item'} (${formatINR(lineTotal(l))})`;
      })
      .join('\n');
    const msg = `Hi Gharelu Hub! I would like to place an order:\n\n${linesText}\n\nSubtotal: ${formatINR(subtotal)}\nPlease confirm delivery in Bhopal!`;
    const { data } = await proxyApi.sendWhatsApp({ message: msg });
    if (data?.url) {
      window.open(data.url, '_blank');
    } else {
      window.open(`https://wa.me/91XXXXXXXXXX?text=${encodeURIComponent(msg)}`, '_blank');
    }
  };

  const footerContent = cart.length > 0 ? (
    <div className="space-y-2">
      {hasSoldOut && (
        <p className="stamp w-full justify-center py-2 text-[#681121] border-[#681121]/45">
          {soldOutLines.length} item{soldOutLines.length > 1 ? 's' : ''} just sold out — remove to continue
        </p>
      )}

      <button
        type="button"
        onClick={checkout}
        disabled={hasSoldOut}
        className={`btn-ink w-full flex items-center justify-between font-note text-sm font-semibold py-3.5 px-5 ${
          hasSoldOut ? 'opacity-60' : ''
        }`}
      >
        <div className="flex flex-col items-start leading-tight">
          <span className="font-note text-[10px] uppercase font-medium text-[#E2952A] tracking-[0.16em]">
            {count} {count === 1 ? 'item' : 'items'}
          </span>
          <span className="font-hand italic text-xl tracking-tight">{formatINR(grandTotal)}</span>
        </div>

        <div className="flex items-center gap-1.5 bg-[#FDFBF7]/12 px-3.5 py-1.5 rounded-xl border border-[#FDFBF7]/25">
          <span className="font-note text-xs font-semibold uppercase tracking-[0.14em]">Pay</span>
          <ChevronRight size={16} />
        </div>
      </button>

      <button
        type="button"
        onClick={orderWhatsApp}
        className="w-full flex items-center justify-center gap-2 font-note text-xs font-semibold py-2.5 rounded-xl bg-[#25D366]/12 text-[#1a7d3f] border-2 border-dashed border-[#25D366]/50 hover:bg-[#25D366]/20 transition-all"
      >
        <MessageCircle size={15} className="text-[#25D366] fill-[#25D366]" />
        <span>Or order instantly on WhatsApp</span>
      </button>
    </div>
  ) : undefined;

  return (
    <Sheet
      open={open}
      onClose={() => setOpen(false)}
      title="My bag"
      footer={footerContent}
    >
      {/* Full-Screen Immersive Celebration Overlay */}
      {showCelebration && (
        <div
          onClick={() => setShowCelebration(false)}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/75 backdrop-blur-md p-6 select-none cursor-pointer animate-fadeIn"
        >
          {/* Confetti Rain Layer */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(28)].map((_, i) => {
              const colors = ['#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#8B5CF6', '#EC4899'];
              const color = colors[i % colors.length];
              const left = `${(i * 3.6) + (i % 5)}%`;
              const delay = `${(i * 0.08) % 1.2}s`;
              const size = i % 2 === 0 ? 'w-2.5 h-4' : 'w-3 h-3 rounded-full';
              return (
                <div
                  key={i}
                  className={`absolute ${size} animate-confetti-piece`}
                  style={{
                    backgroundColor: color,
                    left,
                    top: '-10px',
                    animationDelay: delay,
                  }}
                />
              );
            })}
          </div>

          {/* Central High-Impact Celebration Card — a stamped receipt */}
          <div className="animate-celebrate relative max-w-sm w-full bg-[var(--paper)] paper-grain border-2 border-dashed border-[#D48924] rounded-3xl p-7 text-center shadow-[0_0_40px_rgba(212,137,36,0.25)] text-[var(--ink)]">
            <div className="relative inline-flex mb-3">
              <div className="w-20 h-20 rounded-full bg-[#4E8B56]/15 border-2 border-dashed border-[#4E8B56]/60 flex items-center justify-center text-4xl tilt-r">
                🎉
              </div>
              <span className="absolute -top-1 -right-1 text-2xl animate-bounce">⚡</span>
            </div>

            <span className="stamp tilt-l-sm text-[#3d7044] border-[#4E8B56]/50 mb-3">
              <Sparkles size={11} className="fill-[#4E8B56]" />
              Special perk unlocked
            </span>

            <h3 className="font-hand italic text-3xl text-[#540c19] tracking-tight leading-tight mt-2">
              Free delivery!
            </h3>

            <p className="mt-2 font-note text-[13px] text-[var(--ink-soft)] leading-relaxed">
              Your order crosses {formatINR(299)}. You just saved{' '}
              <strong className="text-[#3d7044] font-semibold">₹35</strong> on delivery.
            </p>

            <button
              type="button"
              onClick={() => setShowCelebration(false)}
              className="btn-ink mt-6 w-full py-3 font-note text-xs font-semibold uppercase tracking-[0.14em]"
            >
              Continue to order
            </button>
          </div>
        </div>
      )}

      {cart.length === 0 ? (
        <Empty
          title="Your Cart is Empty"
          sub="Crispy roasted makhanas and artisanal tea-time bites are just a few taps away."
          cta="Explore Snacks"
          onCta={() => {
            setOpen(false);
            useApp.getState().setTab('menu');
          }}
        />
      ) : (
        <div className="px-4 sm:px-5 pt-3 pb-6 space-y-4">
          {/* Free Delivery Goal Banner: Only shown when free delivery is NOT yet reached */}
          {!isFreeDelivery && (
            <div className="relative rounded-2xl bg-[var(--paper-2)] paper-grain border-2 border-dashed border-[var(--rule)] p-3.5 shadow-sm transition-all duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#D48924]/15 border border-[#D48924]/40 text-[#b87319]">
                    <ShoppingBag size={17} />
                  </div>
                  <div>
                    <p className="font-note text-[12px] font-semibold text-[var(--ink)] tracking-tight">
                      Add <span className="text-[#681121]">{formatINR(amountToFreeDelivery)}</span> more for <span className="text-[#3d7044]">free delivery</span>
                    </p>
                    <p className="font-note text-[11px] text-[var(--ink-faint)]">
                      Free delivery on orders above {formatINR(freeDeliveryThreshold)}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={clearCart}
                  className="flex items-center gap-1 font-note text-[11px] font-medium text-[#b91c1c] hover:text-[#8f1414] bg-[#b91c1c]/8 hover:bg-[#b91c1c]/15 px-2.5 py-1 rounded-lg transition-colors"
                >
                  <Trash2 size={12} />
                  <span>Clear</span>
                </button>
              </div>

              {/* Progress bar — a pen filling a ruled line */}
              <div className="mt-3">
                <div className="flex items-center justify-between font-note text-[10px] text-[var(--ink-faint)] mb-1">
                  <span>So far: {formatINR(subtotal)}</span>
                  <span>Goal: {formatINR(freeDeliveryThreshold)}</span>
                </div>
                <div className="h-2 w-full bg-[var(--paper-3)] rounded-full overflow-hidden border border-[var(--rule)]">
                  <div
                    className="h-full bg-[#4E8B56] rounded-full transition-all duration-300"
                    style={{ width: `${freeDeliveryPercent}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Cart Items Section */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between px-1">
              <span className="font-note text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--ink-faint)]">
                Items selected
              </span>
              {isFreeDelivery ? (
                <button
                  type="button"
                  onClick={clearCart}
                  className="flex items-center gap-1 font-note text-[11px] font-medium text-[#b91c1c] hover:text-[#8f1414] bg-[#b91c1c]/8 hover:bg-[#b91c1c]/15 px-2 py-0.5 rounded-lg transition-colors"
                >
                  <Trash2 size={11} />
                  <span>Clear cart</span>
                </button>
              ) : (
                <span className="font-note text-[11px] text-[var(--ink-faint)] flex items-center gap-1">
                  <Clock size={11} /> 100% freshly packed
                </span>
              )}
            </div>

            {cart.map((l) => {
              const d = dishById(l.dishId);
              if (!d) return null;

              return (
                <div
                  key={l.key}
                  className="group relative flex items-center justify-between gap-3 bg-[var(--paper-2)] border border-[var(--rule)] hover:border-[#D48924]/50 p-3 sm:p-3.5 rounded-2xl shadow-[2px_3px_0_rgba(84,12,25,0.04)] hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-[var(--paper-3)] shrink-0 border border-[var(--rule)]">
                      <DishImg name={d.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <VegBadge />
                        <h4 className="font-hand font-semibold text-base text-[#540c19] truncate">
                          {d.name}
                        </h4>
                      </div>

                      {d.available === false && (
                        <span className="stamp mt-1 inline-flex text-[#681121] border-[#681121]/45">
                          Sold out — remove me
                        </span>
                      )}

                      {l.options.length > 0 && (
                        <p className="font-note text-[10px] text-[var(--ink-faint)] truncate mt-0.5">
                          {l.options.map((o) => o.choice).join(' · ')}
                        </p>
                      )}

                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="font-hand font-bold text-base text-[#681121]">
                          {formatINR(lineTotal(l))}
                        </span>
                        {l.qty > 1 && (
                          <span className="font-note text-[11px] text-[var(--ink-faint)]">
                            ({formatINR(d.price)} each)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Quantity Stepper — a hand tally */}
                  <div className="flex items-center bg-[#4E8B56]/10 border-2 border-dashed border-[#4E8B56]/40 rounded-xl px-1 py-0.5">
                    <button
                      type="button"
                      onClick={() => setQty(l.key, l.qty - 1)}
                      aria-label="Decrease quantity"
                      className="w-7 h-7 flex items-center justify-center rounded-lg text-[#3d7044] hover:bg-[#4E8B56]/20 active:scale-90 transition-all font-bold"
                    >
                      <Minus size={13} strokeWidth={2.8} />
                    </button>
                    <span className="w-6 text-center font-note font-semibold text-xs text-[var(--ink)]">
                      {l.qty}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQty(l.key, l.qty + 1)}
                      aria-label="Increase quantity"
                      className="w-7 h-7 flex items-center justify-center rounded-lg text-[#3d7044] hover:bg-[#4E8B56]/20 active:scale-90 transition-all font-bold"
                    >
                      <Plus size={13} strokeWidth={2.8} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bill Summary Card — a written receipt */}
          <div className="bg-[var(--paper-2)] paper-grain border border-[var(--rule)] rounded-2xl p-4 shadow-sm space-y-2.5">
            <div className="flex items-center justify-between pb-2 border-b border-dashed border-[var(--rule)]">
              <span className="font-hand italic text-lg text-[#681121]">
                Bill breakdown
              </span>
              <span className="font-note text-[10px] text-[var(--ink-faint)] uppercase tracking-[0.14em]">
                Taxes included
              </span>
            </div>

            <div className="space-y-2 font-note text-xs text-[var(--ink-soft)]">
              <div className="flex items-center justify-between">
                <span>Item total</span>
                <span className="font-semibold text-[var(--ink)]">{formatINR(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1">
                  Delivery partner fee
                </span>
                <span>
                  {deliveryFee === 0 ? (
                    <span className="stamp tilt-r-sm text-[#3d7044] border-[#4E8B56]/50">
                      Free
                    </span>
                  ) : (
                    <span className="font-semibold text-[var(--ink)]">{formatINR(deliveryFee)}</span>
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Platform handling fee</span>
                <span className="font-semibold text-[var(--ink)]">{formatINR(platformFee)}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-dashed border-[var(--rule)] flex items-center justify-between">
              <div>
                <span className="font-hand italic text-lg text-[#540c19] block leading-tight">
                  To pay
                </span>
                <span className="font-note text-[10px] text-[var(--ink-faint)]">
                  Incl. all standard taxes
                </span>
              </div>
              <span className="font-hand font-bold text-2xl text-[#681121] tracking-tight">
                {formatINR(grandTotal)}
              </span>
            </div>
          </div>

          {/* Guaranteed Savings note — pencilled in the margin */}
          <div className="flex items-center gap-2.5 bg-[#4E8B56]/10 border-2 border-dashed border-[#4E8B56]/40 text-[#245b2b] p-3 rounded-2xl font-note text-xs">
            <div className="h-6 w-6 rounded-full bg-[#4E8B56] text-white flex items-center justify-center shrink-0">
              <ShieldCheck size={14} />
            </div>
            <div className="flex-1">
              <span>
                You saved <strong className="font-semibold text-[#1e5025]">₹45</strong> on this
                direct kitchen order!
              </span>
            </div>
          </div>
        </div>
      )}
    </Sheet>
  );
}
