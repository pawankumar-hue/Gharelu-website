import React from 'react';
import { Home, Compass, ReceiptText, Sparkles, User } from 'lucide-react';
import { useApp, type Tab } from './store';

const TABS: Array<{ id: Tab; label: string; Icon: typeof Home }> = [
  { id: 'home', label: 'Home', Icon: Home },
  { id: 'menu', label: 'Explore', Icon: Compass },
  { id: 'orders', label: 'Orders', Icon: ReceiptText },
  { id: 'reservations', label: 'Popups', Icon: Sparkles },
  { id: 'profile', label: 'Account', Icon: User },
];

export default function BottomNav() {
  const tab = useApp((s) => s.tab);
  const setTab = useApp((s) => s.setTab);
  const stack = useApp((s) => s.stack);

  if (stack.length > 0) return null;

  return (
    <>
      {/* Navigation Bar: A kraft-paper tab strip pinned to the bottom */}
      <nav
        aria-label="Primary"
        className="lg:hidden fixed inset-x-0 bottom-0 z-30 mx-auto w-full bg-[var(--paper)] paper-grain backdrop-blur-md border-t-2 border-[var(--rule)] shadow-nav pb-[env(safe-area-inset-bottom,0px)]"
      >
        <div className="absolute top-0 inset-x-0 h-1 bg-[#681121]" aria-hidden="true" />
        <div className="w-full max-w-4xl mx-auto px-1.5 sm:px-4">
          <ul className="flex items-center justify-around px-1 py-1.5 sm:py-2">
            {TABS.map(({ id, label, Icon }) => {
              const active = tab === id;
              return (
                <li key={id} className="flex-1 max-w-[100px]">
                  <button
                    type="button"
                    onClick={() => setTab(id)}
                    aria-current={active ? 'page' : undefined}
                    className="relative flex w-full flex-col items-center justify-center gap-0.5 py-1 px-1 sm:px-2 rounded-xl transition-all hover:bg-[var(--paper-2)] active:scale-95"
                  >
                    <div
                      className={`flex items-center justify-center w-7 h-7 rounded-full transition-transform duration-200 ${
                        active
                          ? 'text-[#681121] scale-110 bg-[#681121]/10'
                          : 'text-[var(--ink-faint)] hover:text-[var(--ink-soft)]'
                      }`}
                    >
                      <Icon size={18} strokeWidth={active ? 2.4 : 1.9} />
                    </div>
                    <span
                      className={`font-note text-[10px] tracking-tight transition-colors truncate max-w-full ${
                        active ? 'text-[#681121] font-bold' : 'text-[var(--ink-soft)] font-medium'
                      }`}
                    >
                      {label}
                    </span>
                    {active && (
                      <span className="absolute -bottom-0.5 h-1 w-5 rounded-full bg-[#D48924]" />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>
    </>
  );
}
