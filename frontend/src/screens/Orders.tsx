import React, { useEffect, useState, useMemo } from 'react';
import {
  ReceiptText,
  Clock,
  RotateCcw,
  ChevronRight,
  LogIn,
  Loader2,
  PackageCheck,
  Truck,
  Sparkles,
  ShoppingBag,
  CheckCircle2,
  Calendar,
  CreditCard,
  MapPin,
  Flame,
  Search,
} from 'lucide-react';
import { useApp, lineTotal, dishById, type Order } from '../store';
import { Empty, VegBadge } from '../ui';
import { formatINR } from '../lib/utils';
import { useAuth } from '../lib/AuthContext';
import { ordersApi } from '../lib/api';
import { useToast } from '../lib/ToastContext';

type FilterTab = 'all' | 'active' | 'completed';

export default function Orders() {
  const orders = useApp((s) => s.orders);
  const syncOrders = useApp((s) => s.syncOrders);
  const push = useApp((s) => s.push);
  const setTab = useApp((s) => s.setTab);
  const addToCart = useApp((s) => s.addToCart);
  const auth = useAuth();
  const { showSuccess } = useToast();

  const [fetching, setFetching] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!auth.isLoggedIn) return;
    let mounted = true;
    setFetching(true);
    ordersApi.list().then(({ data }) => {
      if (mounted && data?.orders) {
        syncOrders(data.orders as unknown as Order[]);
      }
      if (mounted) setFetching(false);
    });
    return () => {
      mounted = false;
    };
  }, [auth.isLoggedIn, syncOrders]);

  const repeatOrder = (orderId: string) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;
    order.lines.forEach((l) => {
      addToCart({ dishId: l.dishId, qty: l.qty, options: l.options });
    });
    useApp.getState().setCartOpen(true);
    showSuccess(`Items from order ${order.code} added to your cart!`, 'Order Re-added');
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const isDelivered = o.status >= 6;
      if (activeFilter === 'active' && isDelivered) return false;
      if (activeFilter === 'completed' && !isDelivered) return false;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesCode = o.code.toLowerCase().includes(query);
        const matchesItem = o.lines.some((l) => {
          const d = dishById(l.dishId);
          return d?.name.toLowerCase().includes(query);
        });
        return matchesCode || matchesItem;
      }
      return true;
    });
  }, [orders, activeFilter, searchQuery]);

  const activeOrdersCount = orders.filter((o) => o.status < 6).length;
  const completedOrdersCount = orders.filter((o) => o.status >= 6).length;

  return (
    <div className="min-h-screen bg-[var(--paper)] paper-grain pb-36 text-[var(--ink)]">
      {/* Top hero — the maroon sign pinned at the top of the dispatch board */}
      <div className="relative bg-[#540c19] pt-8 pb-14 px-4 sm:px-6 lg:px-10 overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-1.5 bg-[#D48924] pointer-events-none" />
        <div className="absolute inset-x-0 top-1.5 h-px bg-[#E2952A]/50 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(rgba(226,149,42,0.13)_1px,transparent_1px)] [background-size:19px_19px] pointer-events-none" />

        <div className="max-w-4xl mx-auto relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="font-note text-[10px] font-semibold uppercase tracking-[0.26em] text-[#E2952A]">
                Dispatch board · Bhopal kitchen
              </span>
              <h1 className="font-hand italic text-3xl sm:text-4xl tracking-tight text-[#FDFBF7] leading-tight mt-1">
                Your orders &amp; dispatches
              </h1>
              <svg viewBox="0 0 240 12" className="w-44 sm:w-56 h-3 mt-1" fill="none" aria-hidden="true">
                <path d="M3 8.5c26-4.5 52-6 78-4.5s50 4.5 76 3 52-5 80-6" stroke="#D48924" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
              <p className="font-note text-xs sm:text-sm text-[#FDFBF7]/75 mt-2 max-w-lg leading-relaxed">
                Where your batch is right now — from the deck oven to your door.
              </p>
            </div>

            {/* Quick Stats — a stamp pressed onto the sign, not a glass chip */}
            <div className="flex items-center gap-2.5 self-start sm:self-auto tilt-l-sm bg-[#240409]/50 border-2 border-dashed border-[#E2952A]/50 rounded-lg px-3.5 py-2 shadow-[2px_3px_0_rgba(36,4,9,0.35)]">
              <div className="text-right">
                <span className="block font-note text-[10px] font-semibold uppercase tracking-[0.14em] text-[#E2952A]">
                  On the board
                </span>
                <span className="font-hand italic text-base leading-tight text-[#FDFBF7]">
                  {activeOrdersCount} in progress
                </span>
              </div>
              <div className="w-2 h-2 rounded-full bg-[#E2952A]" />
            </div>
          </div>
        </div>
      </div>

      <div className="w-full px-4 sm:px-6 lg:px-10 max-w-4xl mx-auto -mt-7 space-y-5 relative z-20">
        {/* Guest Auth Callout */}
        {!auth.isLoggedIn && (
          <div className="relative bg-[var(--paper-2)] paper-grain rounded-2xl p-5 border border-[var(--rule)] shadow-[3px_4px_0_rgba(84,12,25,0.05),0_16px_30px_-22px_rgba(84,12,25,0.4)] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="h-11 w-11 rounded-xl bg-[#681121]/8 border-2 border-dashed border-[#681121]/30 text-[#681121] flex items-center justify-center shrink-0">
                <LogIn size={20} />
              </div>
              <div>
                <h3 className="font-hand italic text-lg text-[#540c19] leading-snug">
                  Keep this pad with you
                </h3>
                <p className="font-note text-xs text-[var(--ink-faint)] mt-0.5">
                  Sign in and your old tickets, live courier status and Hub Club points follow you to any device.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => auth.openLogin()}
              className="btn-ink w-full sm:w-auto px-5 py-2.5 font-note text-xs font-semibold uppercase tracking-[0.14em] whitespace-nowrap"
            >
              Sign In / Register
            </button>
          </div>
        )}

        {/* Filter & Search Bar */}
        <div className="bg-[var(--paper-2)] paper-grain rounded-2xl p-2.5 border border-[var(--rule)] shadow-[3px_4px_0_rgba(84,12,25,0.05),0_16px_30px_-22px_rgba(84,12,25,0.4)] flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
            {(
              [
                { id: 'all', label: 'All Orders', count: orders.length },
                { id: 'active', label: 'In Progress', count: activeOrdersCount },
                { id: 'completed', label: 'Delivered', count: completedOrdersCount },
              ] as const
            ).map((tab) => {
              const isSelected = activeFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveFilter(tab.id)}
                  className={`px-3.5 py-1.5 rounded-xl font-note text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                    isSelected
                      ? 'btn-ink'
                      : 'text-[var(--ink-soft)] hover:text-[#540c19] hover:bg-[var(--paper-3)]'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-[var(--paper-3)] text-[var(--ink-faint)]'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Quick Search */}
          <div className="relative w-full sm:w-60">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ink-faint)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by order ID or item..."
              className="w-full form-blank rounded-xl pl-8 pr-3 py-1.5 font-note text-xs text-[var(--ink)] placeholder:text-[var(--ink-faint)] outline-none focus:border-[#681121] transition-all"
            />
          </div>
        </div>

        {/* Content Area */}
        {fetching && orders.length === 0 ? (
          <div className="bg-[var(--paper-2)] paper-grain rounded-2xl p-12 border border-[var(--rule)] shadow-[3px_4px_0_rgba(84,12,25,0.05),0_16px_30px_-22px_rgba(84,12,25,0.4)] flex flex-col items-center justify-center gap-3">
            <Loader2 size={28} className="animate-spin text-[#681121]" />
            <p className="font-hand italic text-lg text-[#540c19]">Pulling your tickets off the board...</p>
            <p className="font-note text-[11px] text-[var(--ink-faint)]">One second — checking with the kitchen</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-[var(--paper-2)] paper-grain rounded-2xl p-8 border border-[var(--rule)] shadow-[3px_4px_0_rgba(84,12,25,0.05),0_16px_30px_-22px_rgba(84,12,25,0.4)] text-center">
            <Empty
              title={searchQuery ? 'Nothing under that name' : activeFilter === 'active' ? 'No orders on the go right now' : 'Your ticket pad is still empty'}
              sub={searchQuery ? 'Try a different order code or dish name.' : 'Pick something from today&apos;s batch — roasted makhana, bhopali nankhatai, heritage namkeen.'}
              cta="Explore Menu"
              onCta={() => setTab('menu')}
            />
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((o, idx) => {
              const isDelivered = o.status >= 6;
              const dateStr = new Date(o.placedAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={o.id}
                  className={`relative bg-[var(--paper-2)] paper-grain rounded-2xl border border-[var(--rule)] shadow-[3px_4px_0_rgba(84,12,25,0.05),0_16px_30px_-22px_rgba(84,12,25,0.4)] transition-all duration-300 hover:rotate-0 hover:shadow-[4px_6px_0_rgba(84,12,25,0.08),0_20px_40px_-24px_rgba(84,12,25,0.5)] overflow-hidden ${
                    idx % 2 === 0 ? 'tilt-l-sm' : 'tilt-r-sm'
                  }`}
                >
                  {/* A strip of tape holding the ticket to the board */}
                  <span
                    className={`absolute -top-2.5 z-10 w-16 h-5 rotate-[-4deg] bg-[#e6d3a3]/80 border-y border-white/50 shadow-sm pointer-events-none ${
                      idx % 2 === 0 ? 'right-7' : 'left-7 rotate-[3deg]'
                    }`}
                    aria-hidden="true"
                  />

                  {/* Order Top Ribbon */}
                  <div className="p-4 sm:p-5 pb-3.5 bg-[var(--paper-3)]/50 border-b border-[var(--rule)]">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl border-2 border-dashed flex items-center justify-center shrink-0 ${
                            isDelivered
                              ? 'bg-[#4E8B56]/10 border-[#4E8B56]/40 text-[#3d7044]'
                              : 'bg-[#D48924]/10 border-[#D48924]/50 text-[#b87319]'
                          }`}
                        >
                          {isDelivered ? <PackageCheck size={20} /> : <Truck size={20} />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-hand italic text-base tracking-tight text-[#540c19]">{o.code}</span>
                            <span
                              className={`stamp ${
                                isDelivered
                                  ? 'tilt-l-sm text-[#3d7044] border-[#4E8B56]/50'
                                  : 'tilt-r-sm text-[#b87319] border-[#D48924]/50'
                              }`}
                            >
                              {isDelivered ? 'Delivered' : 'In Progress'}
                            </span>
                          </div>
                          <p className="font-note text-[11px] text-[var(--ink-faint)] font-medium mt-1 flex items-center gap-1.5">
                            <Clock size={12} />
                            <span>Placed on {dateStr}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between pt-2 sm:pt-0 border-t sm:border-t-0 border-[var(--rule)]">
                        <span className="font-hand text-lg sm:text-xl font-semibold text-[#681121]">
                          {formatINR(o.total)}
                        </span>
                        <span className="font-note text-[11px] font-semibold text-[#b87319] flex items-center gap-1">
                          <Sparkles size={11} className="fill-[#D48924]" />
                          +{o.pointsEarned || Math.round(o.total / 10)} Hub Pts
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Order Items Preview */}
                  <div className="p-4 sm:p-5 py-3.5 space-y-2">
                    <div className="font-note text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--ink-faint)]">
                      Ordered Items ({o.lines.reduce((acc, cur) => acc + cur.qty, 0)})
                    </div>

                    <div className="divide-y divide-[var(--rule)]/60">
                      {o.lines.map((l) => {
                        const d = dishById(l.dishId);
                        if (!d) return null;
                        return (
                          <div key={l.key} className="py-2 first:pt-0 last:pb-0 flex items-center justify-between text-xs font-note">
                            <div className="flex items-center gap-2.5 truncate max-w-[75%]">
                              <VegBadge />
                              <div className="truncate">
                                <span className="font-semibold text-[#540c19] mr-1.5">{l.qty} ×</span>
                                <span className="font-medium text-[var(--ink)]">{d.name}</span>
                                {d.weight && (
                                  <span className="text-[10px] text-[var(--ink-faint)] ml-1.5 font-medium">({d.weight})</span>
                                )}
                              </div>
                            </div>
                            <span className="font-hand font-semibold text-[var(--ink)]">{formatINR(lineTotal(l))}</span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Delivery Destination Snippet */}
                    {o.address && (
                      <div className="pt-2 font-note text-[11px] text-[var(--ink-soft)] font-medium flex items-center gap-1.5">
                        <MapPin size={12} className="text-[#681121] shrink-0" />
                        <span className="truncate">{o.address}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="p-3.5 sm:p-4 border-t border-[var(--rule)] flex items-center justify-between gap-2.5">
                    <button
                      type="button"
                      onClick={() => push({ type: 'track', orderId: o.id })}
                      className="btn-outline flex-1 flex items-center justify-center gap-1.5 font-note text-xs font-semibold py-2.5 px-4 transition-colors"
                    >
                      <span>{isDelivered ? 'Receipt & details' : 'Track it live'}</span>
                      <ChevronRight size={14} className="text-[#681121]" />
                    </button>

                    <button
                      type="button"
                      onClick={() => repeatOrder(o.id)}
                      className="btn-ink flex items-center gap-1.5 font-note text-xs font-semibold uppercase tracking-[0.12em] px-4 py-2.5"
                    >
                      <RotateCcw size={13} />
                      <span>Reorder</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
