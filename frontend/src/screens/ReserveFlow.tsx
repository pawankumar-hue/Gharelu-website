import { useState } from 'react';
import { Minus, Plus, Check, Users, CalendarDays, Clock } from 'lucide-react';
import { useApp } from '../store';
import { locations } from '../data/locations';
import { timeSlots, slotStatus } from '../data';
import { Screen } from '../ui';
import { useAuth } from '../lib/AuthContext';
import { reservationsApi } from '../lib/api';

const daysFromNow = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
};
const iso = (d: Date) => d.toISOString().slice(0, 10);
const dayName = (d: Date) => d.toLocaleDateString('en-IN', { weekday: 'short' }).toUpperCase();

export default function ReserveFlow() {
  const locationId = useApp((s) => s.locationId);
  const addReservation = useApp((s) => s.addReservation);
  const setTab = useApp((s) => s.setTab);
  const profile = useApp((s) => s.profile);
  const auth = useAuth();

  const branch = locations.find((l) => l.id === locationId) ?? locations[0];
  const days = Array.from({ length: 7 }, (_, i) => daysFromNow(i));

  const [date, setDate] = useState(iso(days[0]));
  const [time, setTime] = useState('');
  const [guests, setGuests] = useState(2);
  const [notes, setNotes] = useState('');
  const [done, setDone] = useState<{ code: string; time: string; date: string; guests: number } | null>(null);

  const confirm = async () => {
    if (!time) return;
    const res = addReservation({ locationId: branch.id, date, time, guests, notes: notes.trim() || undefined });
    if (auth.isLoggedIn) {
      reservationsApi.create({ locationId: branch.id, date, time, guests, notes: notes.trim() || undefined }).catch(() => {});
    }
    setDone({ code: res.code, time, date, guests });
  };

  if (done) {
    return (
      <Screen eyebrow="CONFIRMED" title="Your Table">
        <div className="flex flex-col items-center px-6 pb-10 pt-10 text-center">
          <span className="grid h-20 w-20 place-items-center rounded-full border-2 border-dashed border-[#4E8B56]/60 bg-[#4E8B56]/10 text-[#3d7044] tilt-l">
            <Check size={34} strokeWidth={2.5} />
          </span>
          <h2 className="font-hand italic text-3xl text-[#540c19] mt-6">A chair is yours</h2>
          <p className="mt-2 max-w-xs font-note text-sm text-[var(--ink-soft)] leading-relaxed">
            We’ve held {done.guests} seat{done.guests > 1 ? 's' : ''} at {branch.area}. Arrive within 15 minutes of
            your slot and the table stays yours.
          </p>

          {/* Confirmation slip — torn off the pad */}
          <div className="relative mt-7 w-full bg-[var(--paper-2)] paper-grain border-2 border-dashed border-[#D48924]/70 rounded-3xl p-6 shadow-[3px_4px_0_rgba(84,12,25,0.05),0_16px_30px_-22px_rgba(84,12,25,0.4)]">
            <span className="font-hand italic text-3xl tracking-[0.3em] text-[#681121]">{done.code}</span>
            <div className="mt-4 grid grid-cols-3 gap-2 border-t border-dashed border-[var(--rule)] pt-4">
              <Cell label="DATE" value={new Date(done.date + 'T00:00:00').toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} />
              <Cell label="TIME" value={done.time} />
              <Cell label="GUESTS" value={String(done.guests)} />
            </div>
          </div>

          <span className="stamp tilt-r-sm mt-5 text-[#b87319] border-[#D48924]/60">
            +50 HUB POINTS ADDED
          </span>

          <button
            type="button"
            onClick={() => setTab('reservations')}
            className="btn-ink mt-7 w-full py-4 font-note text-xs font-semibold uppercase tracking-[0.14em]"
          >
            VIEW MY TABLES
          </button>
          <button
            type="button"
            onClick={() => setTab('home')}
            className="btn-outline mt-3 w-full py-2.5 font-note text-[11px] font-semibold uppercase tracking-[0.14em]"
          >
            BACK HOME
          </button>
        </div>
      </Screen>
    );
  }

  return (
    <Screen eyebrow="RESERVATIONS" title="Hold a Table">
      <div className="max-w-xl mx-auto space-y-7 px-5 pt-5 pb-10">
        {/* room */}
        <div className="bg-[var(--paper-2)] paper-grain border border-[var(--rule)] rounded-2xl flex items-center justify-between gap-3 px-4 py-3.5 shadow-[3px_4px_0_rgba(84,12,25,0.05),0_16px_30px_-22px_rgba(84,12,25,0.4)]">
          <div>
            <span className="font-note text-[10px] font-semibold uppercase tracking-[0.22em] text-[#b87319]">
              YOUR KITCHEN
            </span>
            <p className="font-hand italic text-xl text-[#540c19] leading-tight mt-0.5">
              {branch.area}, {branch.city}
            </p>
          </div>
          <span className="stamp tilt-r-sm text-right leading-relaxed max-w-[50%]">{branch.hours}</span>
        </div>

        {/* date */}
        <section>
          <h2 className="mb-3 flex items-center gap-2 font-note text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--ink-soft)]">
            <CalendarDays size={13} className="text-[#D48924]" /> PICK A DAY
          </h2>
          <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
            {days.map((d) => {
              const v = iso(d);
              const on = v === date;
              return (
                <button
                  key={v}
                  type="button"
                  onClick={() => {
                    setDate(v);
                    setTime('');
                  }}
                  className={`w-16 shrink-0 py-3 text-center rounded-2xl border-2 font-note transition-colors ${
                    on
                      ? 'bg-[#681121] border-[#681121] text-[#FDFBF7] shadow-[2px_3px_0_rgba(36,4,9,0.3)]'
                      : 'bg-[var(--paper-2)] border-dashed border-[var(--rule)] text-[var(--ink-soft)] hover:border-[#D48924]'
                  }`}
                >
                  <span className={`block font-note text-[9px] font-semibold uppercase tracking-[0.16em] ${on ? 'text-[#E6D3A3]' : 'text-[var(--ink-faint)]'}`}>
                    {dayName(d)}
                  </span>
                  <span className={`block mt-1 font-hand text-xl font-bold ${on ? 'text-[#FDFBF7]' : 'text-[var(--ink)]'}`}>
                    {d.getDate()}
                  </span>
                  <span className={`block font-note text-[9px] uppercase tracking-[0.12em] ${on ? 'text-[#E6D3A3]' : 'text-[var(--ink-faint)]'}`}>
                    {d.toLocaleDateString('en-IN', { month: 'short' })}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* guests */}
        <section>
          <h2 className="mb-3 flex items-center gap-2 font-note text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--ink-soft)]">
            <Users size={13} className="text-[#D48924]" /> SIZE OF THE TABLE
          </h2>
          <div className="bg-[var(--paper-2)] paper-grain border border-[var(--rule)] rounded-2xl flex items-center justify-between px-5 py-4 shadow-[3px_4px_0_rgba(84,12,25,0.05),0_16px_30px_-22px_rgba(84,12,25,0.4)]">
            <button
              type="button"
              aria-label="Fewer guests"
              onClick={() => setGuests((g) => Math.max(1, g - 1))}
              className="h-9 w-9 flex items-center justify-center rounded-full bg-[var(--paper-3)] border border-[var(--rule)] text-[#681121] hover:bg-[#681121] hover:text-[#FDFBF7] transition-colors"
            >
              <Minus size={16} />
            </button>
            <div className="text-center">
              <span className="block font-hand text-4xl font-bold text-[#540c19]">{guests}</span>
              <span className="block font-note text-[9px] font-semibold uppercase tracking-[0.16em] text-[var(--ink-faint)]">
                GUEST{guests > 1 ? 'S' : ''} {guests >= 8 ? '· LONG TABLE NEEDED' : ''}
              </span>
            </div>
            <button
              type="button"
              aria-label="More guests"
              onClick={() => setGuests((g) => Math.min(20, g + 1))}
              className="h-9 w-9 flex items-center justify-center rounded-full bg-[var(--paper-3)] border border-[var(--rule)] text-[#681121] hover:bg-[#681121] hover:text-[#FDFBF7] transition-colors"
            >
              <Plus size={16} />
            </button>
          </div>
        </section>

        {/* slots */}
        <section>
          <h2 className="mb-3 flex items-center gap-2 font-note text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--ink-soft)]">
            <Clock size={13} className="text-[#D48924]" /> CHOOSE A SEATING
          </h2>
          {(['Lunch', 'Dinner'] as const).map((meal) => (
            <div key={meal} className="mb-4">
              <p className="mb-2 font-note text-[10px] font-semibold uppercase tracking-[0.2em] text-[#b87319]">
                {meal.toUpperCase()}
              </p>
              <div className="grid grid-cols-4 gap-2">
                {timeSlots
                  .filter((s) => s.meal === meal)
                  .map(({ t }) => {
                    const st = slotStatus(date, t);
                    const on = time === t;
                    return (
                      <button
                        key={t}
                        type="button"
                        disabled={st === 'unavailable'}
                        onClick={() => setTime(t)}
                        className={`flex items-center justify-center py-2.5 rounded-xl font-note text-xs font-semibold transition-colors ${
                          st === 'unavailable'
                            ? 'border border-dashed border-[var(--rule)] text-[var(--ink-faint)] opacity-50 line-through'
                            : on
                              ? 'bg-[#681121] border border-[#681121] text-[#FDFBF7] shadow-[2px_3px_0_rgba(36,4,9,0.3)]'
                              : st === 'limited'
                                ? 'bg-[#D48924]/12 border border-[#D48924]/60 text-[#b87319] hover:bg-[#D48924]/20'
                                : 'bg-[var(--paper-2)] border border-[var(--rule)] text-[var(--ink-soft)] hover:border-[#D48924]'
                        }`}
                      >
                        {t}
                      </button>
                    );
                  })}
              </div>
            </div>
          ))}
          <p className="flex flex-wrap gap-x-4 font-note text-[10px] font-semibold uppercase tracking-[0.14em]">
            <span className="text-[#3d7044]">● OPEN</span>
            <span className="text-[#b87319]">● FEW LEFT</span>
            <span className="text-[var(--ink-faint)]">● FULL</span>
          </p>
        </section>

        {/* notes */}
        <section>
          <h2 className="mb-2 font-note text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--ink-soft)]">
            ANYTHING WE SHOULD KNOW
          </h2>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            maxLength={160}
            placeholder="Birthday, window seat, high chair…"
            className="form-blank w-full resize-none px-3.5 py-2.5 font-note text-xs"
          />
        </section>

        {!profile.name && (
          <p className="bg-[var(--paper-3)]/60 border-2 border-dashed border-[var(--rule)] rounded-2xl px-4 py-3 font-note text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-soft)] leading-relaxed">
            BOOKING AS A GUEST — ADD YOUR NAME IN PROFILE SO WE KNOW WHO’S ARRIVING.
          </p>
        )}

        <button
          type="button"
          onClick={confirm}
          disabled={!time}
          data-cursor="HOLD"
          className="btn-ink w-full py-4 font-note text-xs font-semibold uppercase tracking-[0.14em] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {time ? `HOLD TABLE FOR ${guests} · ${time}` : 'PICK A SEATING TIME'}
        </button>

        <p className="pb-4 text-center font-note text-[11px] text-[var(--ink-faint)]">
          Held 15 minutes past your slot · Free cancellation up to 2 hours before
        </p>
      </div>
    </Screen>
  );
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="block font-note text-[9px] font-semibold uppercase tracking-[0.16em] text-[var(--ink-faint)]">
        {label}
      </span>
      <span className="mt-1 block font-hand text-lg font-bold text-[var(--ink)]">{value}</span>
    </div>
  );
}
