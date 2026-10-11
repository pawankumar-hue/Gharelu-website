import { ShoppingBag } from 'lucide-react';
import { useApp, cartCount, cartSubtotal } from './store';
import { formatINR } from './lib/utils';

export default function FloatingCartButton() {
  const cart = useApp((s) => s.cart);
  const setCartOpen = useApp((s) => s.setCartOpen);
  const stack = useApp((s) => s.stack);

  const count = cartCount(cart);
  const subtotal = cartSubtotal(cart);

  const isCheckout = stack.some((s) => s.type === 'checkout');
  const isDish = stack.some((s) => s.type === 'dish');
  if (isCheckout || isDish) return null;

  // When stack is empty, BottomNav is displayed on mobile (< lg).
  // Position the floating bag safely above the bottom navigation bar so it never overlaps!
  const hasBottomNav = stack.length === 0;

  return (
    <aside
      aria-label="Cart shortcut"
      className={`fixed z-40 transition-all duration-300 ${
        hasBottomNav
          ? 'bottom-[calc(4.5rem+env(safe-area-inset-bottom,0px))] lg:bottom-6'
          : 'bottom-6'
      } right-3.5 sm:right-6`}
    >
      <button
        type="button"
        id="floating-cart-btn"
        onClick={() => setCartOpen(true)}
        className={`group relative flex items-center gap-2.5 sm:gap-3 btn-ink px-4 py-2.5 sm:px-5 sm:py-3.5 rounded-2xl hover:scale-105 active:scale-95 transition-all duration-300 border-2 ${
          count > 0
            ? 'border-[#D48924] shadow-[0_8px_24px_rgba(104,17,33,0.45)]'
            : 'border-[#D48924]/40 shadow-[0_4px_16px_rgba(84,12,25,0.3)]'
        }`}
        aria-label={`Open Bag, ${count} items`}
      >
        <div className="relative flex items-center justify-center">
          <ShoppingBag
            size={20}
            className="group-hover:rotate-6 transition-transform text-[#FDFBF7]"
          />
          {count > 0 && (
            <span className="absolute -top-2.5 -right-2.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#D48924] px-1 font-note text-[11px] font-semibold text-white ring-2 ring-[#681121] shadow-sm animate-pulse-subtle">
              {count}
            </span>
          )}
        </div>

        <div className="flex flex-col text-left">
          <span className="font-hand italic text-sm sm:text-base leading-tight text-[#FDFBF7]">
            Bag
          </span>
          {count > 0 ? (
            <span className="font-note text-[11px] font-semibold text-[#E2952A] leading-tight">
              {formatINR(subtotal)}
            </span>
          ) : (
            <span className="font-note text-[10px] font-medium text-[#FDFBF7]/70 leading-tight">
              Empty
            </span>
          )}
        </div>
      </button>
    </aside>
  );
}
