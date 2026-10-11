import React, { useMemo, useState } from 'react';
import {
  Bike,
  ShoppingBag,
  Ticket,
  CreditCard,
  Smartphone,
  Banknote,
  Check,
  MapPin,
  Clock,
  ShieldCheck,
  ChevronRight,
  ArrowRight,
  Zap,
  X,
  Percent,
  LogIn,
} from 'lucide-react';
import { useApp, cartSubtotal, lineTotal, dishById, type OrderType } from '../store';
import { locations } from '../data/locations';
import { offersFor } from '../data';
import { Screen, DishImg, Empty, Pill } from '../ui';
import { formatINR } from '../lib/utils';
import { useAuth } from '../lib/AuthContext';
import { ordersApi } from '../lib/api';

const TYPES: Array<{ id: OrderType; label: string; sub: string; Icon: typeof Bike }> = [
  { id: 'delivery', label: 'Delivery', sub: '10–15 mins to your doorstep', Icon: Bike },
  { id: 'takeaway', label: 'Takeaway', sub: 'Ready in 10 mins at kitchen', Icon: ShoppingBag },
];

const PAYMENTS = [
  { id: 'upi', label: 'UPI (GPay / PhonePe / Paytm)', sub: 'Instant payment via UPI QR/App', Icon: Smartphone },
  { id: 'card', label: 'Credit / Debit Cards', sub: 'Visa, Mastercard, RuPay', Icon: CreditCard },
  { id: 'cod', label: 'Cash on Delivery', sub: 'Pay cash or UPI on delivery', Icon: Banknote },
];

export default function Checkout() {
  const cart = useApp((s) => s.cart);
  const profile = useApp((s) => s.profile);
  const locationId = useApp((s) => s.locationId);
  const placeOrder = useApp((s) => s.placeOrder);

  const auth = useAuth();

  const [type, setType] = useState<OrderType>('delivery');
  const [address, setAddress] = useState(profile.addresses[0] ?? 'E-3 Arera Colony, Bhopal');
  const [offerId, setOfferId] = useState<string | null>(null);
  const [showCoupons, setShowCoupons] = useState(false);
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [pay, setPay] = useState('upi');
  const [placing, setPlacing] = useState(false);
  const [placeError, setPlaceError] = useState('');

  const branch = locations.find((l) => l.id === locationId) ?? locations[0];
  const subtotal = cartSubtotal(cart);
  const offers = useMemo(() => offersFor(locationId), [locationId]);
  const offer = offers.find((o) => o.id === offerId) ?? null;

  const discount = useMemo(() => {
    if (!offer) return 0;
    if (offer.code === 'GHFIRST' || offer.code === 'SAHIFIRST') return Math.round((subtotal * 10) / 100);
    if (offer.code === 'GHREF' || offer.code === 'SAHIREF') return 50;
    if (offer.code === 'GHBULK15' || offer.code === 'BULKCRUNCH') return subtotal >= 999 ? Math.round((subtotal * 15) / 100) : 0;
    if (offer.code === 'GH250' || offer.code === 'SAHI25') return 250;
    if (offer.code === 'INSIDER') return Math.round((subtotal * 20) / 100);
    return Math.round((subtotal * 10) / 100);
  }, [offer, subtotal]);
  const deliveryFee = type === 'delivery' ? (subtotal > 299 ? 0 : 35) : 0;
  const platformFee = 5;
  const tax = Math.round((subtotal - discount) * 0.05);
  const total = Math.max(0, subtotal - discount) + deliveryFee + platformFee + tax;

  const ready = cart.length > 0 && (type === 'delivery' ? address.trim().length > 3 : true);

  if (cart.length === 0 && !placing) {
    return (
      <Screen eyebrow="Checkout" title="Your Cart">
        <Empty
          title="Your Cart is Empty"
          sub="Add items to cart before proceeding to checkout."
          cta="Explore Snacks"
          onCta={() => useApp.getState().setTab('menu')}
        />
      </Screen>
    );
  }

  const place = async () => {
    if (!ready) return;

    // Require auth before placing order
    if (!auth.isLoggedIn) {
      auth.openLogin();
      return;
    }

    setPlacing(true);
    setPlaceError('');
    const addressLine = type === 'delivery' ? address : `Pickup from ${branch.area} Kitchen`;

    try {
      const { data, error } = await ordersApi.place({
        type,
        locationId: branch.id,
        lines: cart,
        subtotal,
        tax,
        discount,
        fee: deliveryFee,
        total,
        address: addressLine,
        paymentMethod: pay,
        couponCode: offer?.code,
      });

      if (error || !data?.order) {
        setPlaceError(error ?? 'Failed to place order. Please try again.');
        setPlacing(false);
        return;
      }

      // Sync order into local store so tracking works
      const backendOrder = data.order;
      placeOrder({
        id: backendOrder.id,
        code: backendOrder.code,
        type,
        locationId: branch.id,
        lines: cart,
        subtotal,
        tax,
        discount,
        fee: deliveryFee,
        total,
        eta: type === 'delivery' ? '12–15 MINS' : '10 MINS',
        address: addressLine,
      });
    } catch {
      setPlaceError('Network error. Please try again.');
    }
    setPlacing(false);
  };

  return (
    <Screen title="Checkout">
      <div className="w-full px-4 sm:px-6 lg:px-10 py-4 max-w-5xl mx-auto pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <div className="space-y-4">
            {/* Delivery / Takeaway switch — two tabs on a form */}
            <div className="bg-[var(--paper-2)] paper-grain p-1.5 rounded-2xl border-2 border-dashed border-[var(--rule)] flex gap-2">
              {TYPES.map((t) => {
                const active = type === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setType(t.id)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-note text-xs font-medium transition-all ${
                      active
                        ? 'bg-[#681121] text-[#FDFBF7] shadow-[2px_3px_0_rgba(36,4,9,0.3)]'
                        : 'text-[var(--ink-soft)] hover:text-[#540c19] hover:bg-[var(--paper)]'
                    }`}
                  >
                    <t.Icon size={16} />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Delivery Address Box */}
            {type === 'delivery' ? (
              <div className="bg-[var(--paper-2)] paper-grain p-4 rounded-3xl border border-[var(--rule)] shadow-[3px_4px_0_rgba(84,12,25,0.05),0_16px_30px_-22px_rgba(84,12,25,0.4)]">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-note text-[10px] font-semibold uppercase text-[var(--ink-faint)] tracking-[0.2em] flex items-center gap-1.5">
                    <MapPin size={14} className="text-[#681121]" /> Delivering to
                  </span>
                  <span className="stamp tilt-r-sm text-[#b87319] border-[#D48924]/50">Home</span>
                </div>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter complete delivery address..."
                  className="form-blank w-full p-3 text-xs"
                />
              </div>
            ) : (
              /* Takeaway Kitchen Pickup Details Box */
              <div className="bg-[var(--paper-2)] paper-grain p-4 rounded-3xl border border-[var(--rule)] shadow-[3px_4px_0_rgba(84,12,25,0.05),0_16px_30px_-22px_rgba(84,12,25,0.4)] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-note text-[10px] font-semibold uppercase text-[#681121] tracking-[0.2em] flex items-center gap-1.5">
                    <ShoppingBag size={14} className="text-[#681121]" /> Self pickup counter
                  </span>
                  <span className="stamp tilt-l-sm text-[#3d7044] border-[#4E8B56]/50">
                    Ready in 10 mins
                  </span>
                </div>

                <div className="bg-[var(--paper)] p-3 rounded-2xl border border-[var(--rule)] space-y-1.5">
                  <div className="flex items-start gap-2.5">
                    <MapPin size={16} className="text-[#D48924] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-hand font-semibold text-base text-[#540c19] leading-tight">
                        {branch.area} Kitchen
                      </p>
                      <p className="font-note text-[11px] text-[var(--ink-faint)] mt-0.5 leading-relaxed">
                        {branch.address}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-dashed border-[var(--rule)] font-note text-[11px] text-[var(--ink-soft)]">
                    <Clock size={13} className="text-[#4E8B56]" />
                    <span>Kitchen hours: 09:00 AM – 11:00 PM</span>
                  </div>
                </div>

                <p className="font-note text-[11px] text-[var(--ink-faint)] px-1">
                  💡 No delivery charge — just show your order ID at the counter when you arrive.
                </p>
              </div>
            )}

            {/* Selected Items Breakdown — a written order slip */}
            <div className="bg-[var(--paper-2)] paper-grain p-4 rounded-3xl border border-[var(--rule)] shadow-[3px_4px_0_rgba(84,12,25,0.05),0_16px_30px_-22px_rgba(84,12,25,0.4)]">
              <h3 className="font-hand italic text-xl text-[#540c19] mb-3">
                On your slip ({cart.length})
              </h3>
              <div className="space-y-2.5">
                {cart.map((l) => {
                  const d = dishById(l.dishId);
                  if (!d) return null;
                  return (
                    <div key={l.key} className="flex items-center justify-between font-note text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-semibold text-[#681121]">{l.qty}x</span>
                        <span className="text-[var(--ink-soft)] truncate">{d.name}</span>
                      </div>
                      <span className="font-semibold text-[var(--ink)]">{formatINR(lineTotal(l))}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Coupons & Offers Box — a tear-off coupon */}
            <div
              onClick={() => setShowCoupons(true)}
              className="bg-[var(--paper-2)] paper-grain p-4 rounded-3xl border-2 border-dashed border-[#D48924]/50 shadow-[2px_3px_0_rgba(84,12,25,0.05)] flex items-center justify-between cursor-pointer hover:border-[#681121]/60 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#681121]/10 border border-[#681121]/30 text-[#681121] flex items-center justify-center">
                  <Ticket size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-note text-xs font-semibold text-[var(--ink)]">
                      {offer ? offer.code : 'Apply a coupon'}
                    </p>
                    {offer && (
                      <span className="stamp text-[#3d7044] border-[#4E8B56]/50 text-[8px]">
                        Applied
                      </span>
                    )}
                  </div>
                  <p className="font-note text-[11px] text-[var(--ink-soft)] mt-0.5">
                    {offer ? `Saving ${formatINR(discount)} on this order` : 'Pick one, or type a code'}
                  </p>
                </div>
              </div>

              {offer ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOfferId(null);
                  }}
                  className="font-note text-[11px] font-medium text-[#b91c1c] bg-[var(--paper)] px-3 py-1.5 rounded-xl border border-[#b91c1c]/30 hover:bg-[#b91c1c]/10 transition-colors"
                >
                  Remove
                </button>
              ) : (
                <div className="flex items-center gap-1 font-note text-xs font-semibold text-[#681121]">
                  <span>Pick</span>
                  <ChevronRight size={14} />
                </div>
              )}
            </div>

            {/* Payment Methods — ticks on a form */}
            <div className="bg-[var(--paper-2)] paper-grain p-4 rounded-3xl border border-[var(--rule)] shadow-[3px_4px_0_rgba(84,12,25,0.05),0_16px_30px_-22px_rgba(84,12,25,0.4)]">
              <h3 className="font-hand italic text-xl text-[#540c19] mb-3">
                How you&apos;ll pay
              </h3>
              <div className="space-y-2">
                {PAYMENTS.map((p) => {
                  const active = pay === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPay(p.id)}
                      className={`w-full flex items-center justify-between p-3 rounded-2xl border-2 text-left transition-all ${
                        active
                          ? 'border-[#681121] bg-[#681121]/8 text-[#681121] font-medium shadow-[2px_3px_0_rgba(36,4,9,0.12)]'
                          : 'border-dashed border-[var(--rule)] bg-[var(--paper)] hover:border-[#D48924] text-[var(--ink)]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <p.Icon size={18} className={active ? 'text-[#681121]' : 'text-[var(--ink-faint)]'} />
                        <div>
                          <p className="font-note text-xs font-medium">{p.label}</p>
                          <p className="font-note text-[10px] text-[var(--ink-faint)]">{p.sub}</p>
                        </div>
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          active ? 'border-[#681121] bg-[#681121]' : 'border-[var(--rule)] bg-white'
                        }`}
                      >
                        {active && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Bill Details */}
          <div className="space-y-4">
            {/* Bill Summary — a hand-written receipt */}
            <div className="bg-[var(--paper-2)] paper-grain p-5 rounded-3xl border border-[var(--rule)] shadow-[3px_4px_0_rgba(84,12,25,0.05),0_16px_30px_-22px_rgba(84,12,25,0.4)] space-y-3 font-note text-xs">
              <h3 className="font-hand italic text-xl text-[#540c19] mb-2">
                The bill
              </h3>
              <div className="flex justify-between text-[var(--ink-soft)]">
                <span>Item subtotal</span>
                <span className="text-[var(--ink)]">{formatINR(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-[#3d7044] font-semibold">
                  <span>Coupon savings</span>
                  <span>-{formatINR(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-[var(--ink-soft)]">
                <span>Delivery fee</span>
                <span>
                  {deliveryFee === 0 ? (
                    <span className="stamp tilt-r-sm text-[#3d7044] border-[#4E8B56]/50">
                      Free
                    </span>
                  ) : (
                    <span className="text-[var(--ink)]">{formatINR(deliveryFee)}</span>
                  )}
                </span>
              </div>
              <div className="flex justify-between text-[var(--ink-soft)]">
                <span>Platform fee</span>
                <span className="text-[var(--ink)]">{formatINR(platformFee)}</span>
              </div>
              <div className="flex justify-between text-[var(--ink-soft)]">
                <span>Taxes &amp; GST (5%)</span>
                <span className="text-[var(--ink)]">{formatINR(tax)}</span>
              </div>
              <div className="pt-2 border-t border-dashed border-[var(--rule)] flex justify-between items-baseline">
                <span className="font-hand italic text-lg text-[#540c19]">Total to pay</span>
                <span className="font-hand font-bold text-2xl text-[#681121]">{formatINR(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Bottom Place Order Bar — the order slip stub */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-[var(--paper)]/95 paper-grain backdrop-blur-md border-t-2 border-[var(--rule)] px-4 py-3 shadow-nav relative">
        <div className="absolute top-0 inset-x-0 h-0.5 bg-[#681121]" aria-hidden="true" />
        <div className="mx-auto max-w-xl space-y-2">
          {placeError && (
            <div className="font-note text-xs text-[#b91c1c] bg-[#b91c1c]/8 border-2 border-dashed border-[#b91c1c]/40 px-3 py-2 rounded-xl">
              {placeError}
            </div>
          )}
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-note text-[10px] text-[var(--ink-faint)] uppercase tracking-[0.16em]">
                Pay via {pay.toUpperCase()}
              </p>
              <p className="font-hand font-bold text-xl text-[#681121] tracking-tight leading-none mt-0.5">
                {formatINR(total)}
              </p>
            </div>

            <button
              type="button"
              disabled={!ready || placing}
              onClick={place}
              className="btn-ink flex-1 flex items-center justify-center gap-2 font-note text-sm font-semibold py-3.5 px-6 disabled:opacity-50"
            >
              {placing ? (
                <span>Placing order...</span>
              ) : auth.isLoggedIn ? (
                <>
                  <span>Place order</span>
                  <ArrowRight size={16} />
                </>
              ) : (
                <>
                  <LogIn size={16} />
                  <span>Login to place order</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>


      {/* Coupons & Offers Selection Sheet Modal — a pad of tear-off coupons */}
      {showCoupons && (
        <div
          onClick={() => {
            setShowCoupons(false);
            setCouponError('');
          }}
          className="fixed inset-0 z-50 bg-black/55 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-[var(--paper)] paper-grain rounded-t-3xl sm:rounded-3xl border border-[var(--rule)] p-5 shadow-2xl max-h-[85vh] flex flex-col text-[var(--ink)] relative"
          >
            {/* Sheet Header */}
            <div className="flex items-center justify-between pb-3 border-b border-dashed border-[var(--rule)]">
              <div>
                <h4 className="font-hand italic text-xl text-[#540c19]">Apply a coupon</h4>
                <p className="font-note text-xs text-[var(--ink-faint)] mt-0.5">
                  Offers on your cart ({formatINR(subtotal)})
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowCoupons(false);
                  setCouponError('');
                }}
                className="p-1 rounded-full text-[var(--ink-faint)] hover:text-[var(--ink)] hover:bg-[var(--paper-3)]"
              >
                <X size={20} />
              </button>
            </div>

            {/* Manual Code Input Bar */}
            <div className="pt-4 pb-2">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => {
                    setCouponInput(e.target.value.toUpperCase());
                    setCouponError('');
                  }}
                  placeholder="ENTER COUPON CODE"
                  className="form-blank flex-1 uppercase font-semibold text-xs tracking-wider px-3.5 py-3"
                />
                <button
                  type="button"
                  onClick={() => {
                    const matched = offers.find(
                      (o) => o.code.toUpperCase() === couponInput.trim().toUpperCase()
                    );
                    if (matched) {
                      setOfferId(matched.id);
                      setShowCoupons(false);
                      setCouponInput('');
                      setCouponError('');
                    } else {
                      setCouponError('That code doesn\'t look right. Check it again.');
                    }
                  }}
                  className="btn-ink font-note text-xs font-semibold px-5 py-3"
                >
                  Apply
                </button>
              </div>
              {couponError && (
                <p className="font-note text-[11px] text-[#b91c1c] mt-1.5 ml-1">{couponError}</p>
              )}
            </div>

            {/* Coupons List — tear-off tickets */}
            <div className="overflow-y-auto space-y-3 pt-2 pb-4 flex-1 pr-1">
              {offers.map((o, i) => {
                const isSelected = offerId === o.id;
                const tilt = i % 2 === 0 ? 'tilt-l-sm' : 'tilt-r-sm';
                return (
                  <div
                    key={o.id}
                    className={`p-4 rounded-2xl border-2 transition-all ${tilt} ${
                      isSelected
                        ? 'bg-[#681121]/6 border-[#681121] shadow-[2px_3px_0_rgba(36,4,9,0.12)]'
                        : 'bg-[var(--paper-2)] border-dashed border-[var(--rule)] hover:border-[#D48924]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-hand italic text-xl text-[#540c19]">{o.value}</span>
                          <span className="stamp text-[#681121] border-[#681121]/40">
                            {o.code}
                          </span>
                        </div>
                        <p className="font-note text-xs font-semibold text-[var(--ink)] mt-1">{o.title}</p>
                        <p className="font-note text-[11px] text-[var(--ink-faint)] mt-0.5 leading-relaxed">{o.sub}</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setOfferId(isSelected ? null : o.id);
                          setShowCoupons(false);
                        }}
                        className={`font-note text-xs font-semibold px-3.5 py-1.5 rounded-xl border transition-all active:scale-95 ${
                          isSelected
                            ? 'text-[#b91c1c] bg-[var(--paper)] border-[#b91c1c]/40'
                            : 'text-[#681121] bg-[var(--paper)] border-[#681121]/30 hover:bg-[#681121] hover:text-[#FDFBF7]'
                        }`}
                      >
                        {isSelected ? 'Remove' : 'Use this'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </Screen>
  );
}
