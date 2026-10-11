import React, { useState, useEffect } from 'react';
import { Sparkles, Gift, Check, Lock, ArrowRight, Award } from 'lucide-react';
import { useApp, tierOf } from '../store';
import { TIERS, rewards } from '../data';
import { Screen } from '../ui';
import { useAuth } from '../lib/AuthContext';
import { loyaltyApi } from '../lib/api';

export default function Loyalty() {
  const points = useApp((s) => s.points);
  const addPoints = useApp((s) => s.addPoints);
  const auth = useAuth();
  const [redeemed, setRedeemed] = useState<string[]>([]);
  const [flash, setFlash] = useState<string | null>(null);

  useEffect(() => {
    if (!auth.isLoggedIn) return;
    loyaltyApi.get().then(({ data }) => {
      if (data && typeof data.points === 'number') {
        const diff = data.points - points;
        if (diff !== 0) addPoints(diff);
      }
    });
  }, [auth.isLoggedIn, points, addPoints]);

  const tierIdx = tierOf(points);
  const tier = TIERS[tierIdx];
  const next = TIERS[tierIdx + 1];

  const redeem = (id: string, cost: number, name: string) => {
    if (points < cost || redeemed.includes(id)) return;
    addPoints(-cost);
    setRedeemed((r) => [...r, id]);
    setFlash(`${name} is yours now — noted down on your pad.`);
    window.setTimeout(() => setFlash(null), 3200);
  };

  return (
    <Screen eyebrow="Rewards Program" title="Hub Club Points">
      <div className="w-full px-4 sm:px-6 lg:px-10 py-4 space-y-5 max-w-5xl mx-auto pb-32">
        {/* Points Balance — the maroon club ledger sign */}
        <div className="relative rounded-2xl bg-[#540c19] text-[#FDFBF7] border border-[#D48924]/40 p-5 shadow-[3px_4px_0_rgba(36,4,9,0.35),0_16px_30px_-22px_rgba(84,12,25,0.6)] overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-1.5 bg-[#D48924] pointer-events-none" />
          <div className="absolute inset-x-0 top-1.5 h-px bg-[#E2952A]/50 pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(rgba(226,149,42,0.13)_1px,transparent_1px)] [background-size:19px_19px] pointer-events-none" />

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-1">
              <span className="stamp tilt-l-sm">1 pt = ₹1 back</span>
            </div>

            <div className="flex items-baseline gap-2 mt-3">
              <span className="font-hand text-5xl leading-none">{points}</span>
              <span className="font-hand italic text-lg text-[#E2952A]">Hub Points</span>
            </div>
            <svg viewBox="0 0 200 10" className="w-40 h-2.5 mt-1.5" fill="none" aria-hidden="true">
              <path d="M3 7c22-4 44-5.5 66-4s42 3.5 64 2.5 42-4 64-5" stroke="#E2952A" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <p className="font-note text-xs text-[#FDFBF7]/75 mt-1.5 leading-relaxed">
              Earn 1 point on every ₹10 spent on Gharelu Hub small batches.
            </p>

            {/* Progress — ink filling up towards the next stamp in the book */}
            {next && (
              <div className="mt-4 pt-3 border-t border-[#E2952A]/25">
                <div className="flex items-center justify-between font-note text-[11px] font-semibold text-[#E2952A] mb-1.5">
                  <span>{tier.name}</span>
                  <span>{next.from - points} pts to {next.name}</span>
                </div>
                <div className="h-2 w-full bg-[#240409]/60 border border-[#E2952A]/25 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#D48924] rounded-full transition-all duration-700"
                    style={{ width: `${Math.min(100, (points / next.from) * 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {flash && (
          <div className="border-2 border-dashed border-[#4E8B56]/60 bg-[#4E8B56]/10 text-[#3d7044] p-3 rounded-xl font-note text-xs font-semibold text-center tilt-l-sm">
            {flash}
          </div>
        )}

        {/* Redeemable Rewards List */}
        <div className="space-y-3 pt-1">
          <div>
            <h3 className="font-hand italic text-2xl text-[#540c19] leading-tight">Rewards on the shelf</h3>
            <svg viewBox="0 0 160 8" className="w-32 h-2 mt-0.5" fill="none" aria-hidden="true">
              <path d="M2 5.5c14-3 28-3.5 42-2.5s27 2.5 41 1.5 22-2.5 33-3.5" stroke="#D48924" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <p className="font-note text-[11px] text-[var(--ink-faint)] mt-1 font-medium">
              Trade points in for anything off this shelf.
            </p>
          </div>

          {rewards.map((r, idx) => {
            const isOwned = redeemed.includes(r.id);
            const canAfford = points >= r.cost;

            return (
              <div
                key={r.id}
                className={`relative bg-[var(--paper-2)] paper-grain p-4 rounded-2xl border border-[var(--rule)] shadow-[3px_4px_0_rgba(84,12,25,0.05),0_16px_30px_-22px_rgba(84,12,25,0.4)] flex items-center justify-between transition-all duration-300 hover:rotate-0 hover:shadow-[4px_6px_0_rgba(84,12,25,0.08),0_20px_40px_-24px_rgba(84,12,25,0.5)] ${
                  idx % 2 === 0 ? 'tilt-l-sm' : 'tilt-r-sm'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-[#681121]/8 border-2 border-dashed border-[#681121]/30 text-[#681121] flex items-center justify-center shrink-0">
                    <Gift size={20} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-hand italic text-lg text-[#540c19] leading-tight">{r.name}</h4>
                    <p className="font-note text-[11px] font-semibold text-[#b87319] mt-0.5">
                      {r.cost} Points
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={!canAfford || isOwned}
                  onClick={() => redeem(r.id, r.cost, r.name)}
                  className={`shrink-0 px-4 py-2 font-note text-xs font-semibold uppercase tracking-[0.14em] transition-all ${
                    isOwned
                      ? 'stamp tilt-l-sm text-[#3d7044] border-[#4E8B56]/50 cursor-default'
                      : canAfford
                      ? 'btn-ink'
                      : 'rounded-xl border-2 border-dashed border-[var(--rule)] bg-[var(--paper-3)]/60 text-[var(--ink-faint)] cursor-not-allowed'
                  }`}
                >
                  {isOwned ? 'Redeemed ✓' : canAfford ? 'Redeem' : 'Locked'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </Screen>
  );
}
