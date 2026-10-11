import React, { useEffect, useRef } from 'react';
import {
  CheckCircle2,
  Clock,
  Bike,
  PartyPopper,
  Phone,
  MapPin,
  ShieldCheck,
  Zap,
  ArrowRight,
} from 'lucide-react';
import { useApp, lineTotal, dishById } from '../store';
import { locations } from '../data/locations';
import { ORDER_STAGES } from '../data';
import { Screen, Empty, DishImg, VegBadge } from '../ui';
import { formatINR } from '../lib/utils';
import { ordersApi, proxyApi } from '../lib/api';
import { useToast } from '../lib/ToastContext';

export default function TrackOrder({ orderId }: { orderId: string }) {
  const order = useApp((s) => s.orders.find((o) => o.id === orderId));
  const advanceOrder = useApp((s) => s.advanceOrder);
  const setTab = useApp((s) => s.setTab);
  const { showInfo } = useToast();
  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (!order || order.status >= 6) return;
    timer.current = window.setTimeout(() => {
      advanceOrder(orderId);
      ordersApi.advance(orderId, order.status + 1);
    }, 7000);
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [order?.status, orderId, advanceOrder, order]);

  if (!order) {
    return (
      <Screen eyebrow="Tracking" title="Order Status">
        <Empty
          title="Order Not Found"
          sub="This order ticket is no longer active."
          cta="View All Orders"
          onCta={() => setTab('orders')}
        />
      </Screen>
    );
  }

  const branch = locations.find((l) => l.id === order.locationId);
  const delivered = order.status >= 6;
  const pct = (order.status / (ORDER_STAGES.length - 1)) * 100;

  return (
    <Screen eyebrow={order.code} title={delivered ? 'Delivered' : 'On The Way'}>
      <div className="w-full px-4 sm:px-6 lg:px-10 py-4 space-y-4 max-w-4xl mx-auto pb-32">
        {/* Live Tracking — the maroon sign from the dispatch board */}
        <div className="relative rounded-2xl bg-[#540c19] text-[#FDFBF7] border border-[#D48924]/40 p-5 shadow-[3px_4px_0_rgba(36,4,9,0.35),0_16px_30px_-22px_rgba(84,12,25,0.6)] overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-1.5 bg-[#D48924] pointer-events-none" />
          <div className="absolute inset-x-0 top-1.5 h-px bg-[#E2952A]/50 pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(rgba(226,149,42,0.13)_1px,transparent_1px)] [background-size:19px_19px] pointer-events-none" />

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <span className="stamp tilt-r-sm">
                <Clock size={10} /> {order.eta}
              </span>
              <span className="font-note text-[10px] font-semibold uppercase tracking-[0.18em] text-[#E2952A]">
                {order.type}
              </span>
            </div>

            <h2 className="font-hand italic text-2xl sm:text-3xl leading-tight text-[#FDFBF7]">
              {ORDER_STAGES[order.status].label}
            </h2>
            <p className="font-note text-xs text-[#FDFBF7]/75 mt-1.5 leading-relaxed">
              {ORDER_STAGES[order.status].sub}
            </p>

            {/* Progress bar — ink filling a ruled track */}
            <div className="mt-5 relative h-2.5 w-full bg-[#240409]/60 border border-[#E2952A]/25 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#D48924] rounded-full transition-all duration-700"
                style={{ width: `${Math.max(12, pct)}%` }}
              />
            </div>

            <div className="mt-3 flex items-center justify-between font-note text-[10px] font-semibold uppercase tracking-[0.12em] text-[#FDFBF7]/70">
              <span>Order Placed</span>
              <span>Roasting</span>
              <span>Packed</span>
              <span>Delivered</span>
            </div>
          </div>
        </div>

        {/* Delivery Partner Details */}
        {!delivered && (
          <div className="relative bg-[var(--paper-2)] paper-grain p-4 rounded-2xl border border-[var(--rule)] shadow-[3px_4px_0_rgba(84,12,25,0.05),0_16px_30px_-22px_rgba(84,12,25,0.4)] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#D48924]/12 border-2 border-dashed border-[#D48924]/50 text-[#b87319] shrink-0">
                <Bike size={22} />
              </div>
              <div>
                <p className="font-hand italic text-[13px] text-[var(--ink-soft)] leading-none">
                  your batch rides with
                </p>
                <p className="font-note text-xs font-semibold text-[var(--ink)] mt-1">
                  Ramesh (Gharelu Express)
                </p>
                <p className="font-note text-[11px] text-[var(--ink-faint)]">
                  Assigned Delivery Partner · Bhopal Hub
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => showInfo('Connecting you to our Bhopal dispatch executive Ramesh...', 'Calling Delivery Partner')}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[#681121]/8 border-2 border-dashed border-[#681121]/30 text-[#681121] hover:bg-[#681121] hover:text-[#FDFBF7] transition-colors shrink-0"
            >
              <Phone size={16} />
            </button>
          </div>
        )}

        {/* Order Details & Items Summary */}
        <div className="bg-[var(--paper-2)] paper-grain p-4 rounded-2xl border border-[var(--rule)] shadow-[3px_4px_0_rgba(84,12,25,0.05),0_16px_30px_-22px_rgba(84,12,25,0.4)]">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-dashed border-[var(--rule)]">
            <h3 className="font-note text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--ink-faint)]">
              Items in this order ({order.lines.length})
            </h3>
            <span className="font-hand text-base font-semibold text-[#681121]">
              {formatINR(order.total)}
            </span>
          </div>

          <div className="space-y-2.5">
            {order.lines.map((l) => {
              const d = dishById(l.dishId);
              if (!d) return null;
              return (
                <div key={l.key} className="flex items-center justify-between text-xs font-note">
                  <div className="flex items-center gap-2">
                    <VegBadge />
                    <span className="font-semibold text-[#681121]">{l.qty}x</span>
                    <span className="font-medium text-[var(--ink)]">{d.name}</span>
                  </div>
                  <span className="font-hand font-semibold text-[var(--ink)]">{formatINR(lineTotal(l))}</span>
                </div>
              );
            })}
          </div>

          {order.address && (
            <div className="mt-4 pt-3 border-t border-[var(--rule)] font-note text-xs text-[var(--ink-soft)] flex items-start gap-2">
              <MapPin size={14} className="text-[#681121] shrink-0 mt-0.5" />
              <span>{order.address}</span>
            </div>
          )}
        </div>

        {/* WhatsApp Help CTA */}
        <button
          type="button"
          onClick={async () => {
            const msg = `Hi Gharelu Hub, need help with Order ${order.code}`;
            const { data } = await proxyApi.sendWhatsApp({ message: msg });
            if (data?.url) window.open(data.url, '_blank');
            else window.open(`https://wa.me/91XXXXXXXXXX?text=${encodeURIComponent(msg)}`, '_blank');
          }}
          className="w-full flex items-center justify-center gap-2 font-note text-xs font-semibold py-3.5 rounded-xl bg-[#25D366]/12 text-[#1a7d3f] border-2 border-dashed border-[#25D366]/50 hover:bg-[#25D366]/20 transition-colors"
        >
          <span>Something wrong with this one? Message us on WhatsApp</span>
        </button>
      </div>
    </Screen>
  );
}
