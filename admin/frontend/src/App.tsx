import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Calendar,
  Users,
  LogOut,
  ExternalLink,
  Menu,
  X,
} from 'lucide-react';
import Login from './Login';
import DashboardOverview from './DashboardOverview';
import ProductsView from './ProductsView';
import OrdersView from './OrdersView';
import ReservationsView from './ReservationsView';
import UsersView from './UsersView';
import { authStorage, adminApi } from './adminApi';
import { Squiggle } from './ui';

type NavTab = 'dashboard' | 'products' | 'orders' | 'reservations' | 'users';

const NAV_ITEMS: Array<{
  id: NavTab;
  label: string;
  icon: any;
  eyebrow: string;
  live?: boolean;
}> = [
  { id: 'dashboard', label: 'Overview', icon: LayoutDashboard, eyebrow: 'The ledger' },
  { id: 'products', label: 'Snacks & Menu', icon: Package, eyebrow: 'Recipe cards' },
  { id: 'orders', label: 'Live Orders', icon: ShoppingBag, eyebrow: 'Dispatch board', live: true },
  { id: 'reservations', label: 'Tasting Passes', icon: Calendar, eyebrow: 'Guest book' },
  { id: 'users', label: 'Customers', icon: Users, eyebrow: 'Address book' },
];

const PAGE_META: Record<NavTab, { title: string; subtitle: string; eyebrow: string }> = {
  dashboard: {
    title: 'The Kitchen Ledger',
    subtitle: 'Everything happening across the store, right now.',
    eyebrow: 'Overview · Bhopal kitchen',
  },
  products: {
    title: 'Snacks & Menu',
    subtitle: 'Catalog, pricing, photos and live availability.',
    eyebrow: 'Recipe cards · Inventory',
  },
  orders: {
    title: 'Dispatch Board',
    subtitle: 'From the deck oven to the doorstep.',
    eyebrow: 'Live orders · Bhopal',
  },
  reservations: {
    title: 'Tasting Passes',
    subtitle: 'Weekend tables and experiential bookings.',
    eyebrow: 'Guest book · Weekends',
  },
  users: {
    title: 'Customer Address Book',
    subtitle: 'Profiles, contact details and dietary preferences.',
    eyebrow: 'Directory · Hub Club',
  },
};

export default function App() {
  const [currentUser, setCurrentUser] = useState<any>(() => authStorage.getUser());
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    document.title = 'Gharelu Hub';
    const token = authStorage.getToken();
    if (token && !currentUser) {
      adminApi
        .getMe()
        .then((res) => {
          authStorage.setUser(res.admin);
          setCurrentUser(res.admin);
        })
        .catch(() => {
          authStorage.clearToken();
          setCurrentUser(null);
        });
    }
  }, []);

  const handleLogout = () => {
    authStorage.clearToken();
    setCurrentUser(null);
  };

  const goTo = (tab: string) => {
    setActiveTab(tab as NavTab);
    setMobileMenuOpen(false);
  };

  if (!currentUser) {
    return <Login onLogin={(user) => setCurrentUser(user)} />;
  }

  const meta = PAGE_META[activeTab];

  return (
    <div className="min-h-screen bg-[var(--paper)] text-[var(--ink)] flex">
      {/* ================= Desktop Sidebar ================= */}
      <aside className="hidden lg:flex w-[264px] h-screen sticky top-0 flex-col justify-between bg-[var(--paper)] paper-grain border-r border-[var(--rule)] shrink-0 overflow-y-auto z-40">
        <span className="absolute top-0 inset-x-0 h-1 bg-[#681121]" aria-hidden="true" />

        <div>
          {/* Brand — same lockup as the customer top navbar */}
          <div className="px-5 pt-6 pb-5 border-b border-[var(--rule)]">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-2xl overflow-hidden shadow-md border border-[#D48924]/30 bg-[#681121] flex items-center justify-center shrink-0">
                <img src="/logo.png" alt="Gharelu Hub" className="w-full h-full object-cover" />
              </div>
              <div className="leading-tight">
                <span className="font-hand italic font-bold text-xl text-[#540c19] block leading-tight">
                  Gharelu Hub
                </span>
                <span className="font-note text-[9px] font-semibold tracking-[0.2em] uppercase text-[#b87319] block">
                  Admin Kitchen Log
                </span>
              </div>
            </div>
          </div>

          {/* Navigation — hand-lettered tabs */}
          <nav className="px-3 pt-5 space-y-1.5">
            <p className="px-3 pb-2 font-note text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--ink-faint)]">
              Operations
            </p>

            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => goTo(item.id)}
                  className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-note text-[13px] transition-all text-left ${
                    isActive
                      ? 'text-[#681121] bg-[#681121]/10 font-semibold'
                      : 'text-[var(--ink-soft)] hover:text-[#540c19] hover:bg-[var(--paper-2)]'
                  }`}
                >
                  <span
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border transition-colors ${
                      isActive
                        ? 'border-[#681121]/35 bg-[var(--paper-2)] text-[#681121]'
                        : 'border-dashed border-[var(--rule)] bg-[var(--paper-2)]/70 text-[var(--ink-faint)]'
                    }`}
                  >
                    <Icon size={15} />
                  </span>

                  <span className="flex-1">{item.label}</span>

                  {item.live && (
                    <span className="stamp tilt-r-sm text-[#3d7044] border-[#4E8B56]/50 !px-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#4E8B56] animate-pulse" />
                      Live
                    </span>
                  )}

                  {isActive && (
                    <span
                      className="absolute bottom-0.5 inset-x-4 h-0.5 bg-[#D48924] rounded-full"
                      aria-hidden="true"
                    />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar footer */}
        <div className="px-3 pb-5 space-y-3">
          <a
            href="http://localhost:3000"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline w-full flex items-center justify-between px-3.5 py-2.5 font-note text-xs font-semibold"
          >
            <span className="flex items-center gap-2">
              <ExternalLink size={14} />
              Visit Live Website
            </span>
          </a>

          <div className="sc-card !rounded-xl px-3 py-2.5 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-full bg-[#681121] text-[#FDFBF7] flex items-center justify-center text-sm font-semibold shrink-0 shadow-sm">
                A
              </div>
              <div className="min-w-0">
                <span className="font-hand italic text-[15px] text-[#540c19] block truncate leading-tight">
                  Master Admin
                </span>
                <span className="font-note text-[10px] text-[var(--ink-faint)] block truncate">
                  Bhopal HQ · Owner
                </span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-2 rounded-lg text-[var(--ink-faint)] hover:text-[#681121] hover:bg-[var(--paper-3)] transition-colors"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* ================= Main Column ================= */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Desktop top bar — the ruled banner from the customer panel */}
        <header className="hidden lg:flex items-center justify-between gap-6 px-8 py-4 bg-[var(--paper)]/95 paper-grain backdrop-blur-md border-b border-[var(--rule)] sticky top-0 z-30">
          <span className="absolute top-0 inset-x-0 h-1 bg-[#681121]" aria-hidden="true" />

          <div className="min-w-0">
            <p className="font-note text-[10px] font-semibold uppercase tracking-[0.22em] text-[#b87319]">
              {meta.eyebrow}
            </p>
            <h2 className="font-hand italic text-[26px] leading-tight text-[#540c19] tracking-tight">
              {meta.title}
            </h2>
            <Squiggle className="w-24 h-2" />
            <p className="font-note text-[11px] text-[var(--ink-faint)] mt-0.5">{meta.subtitle}</p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <span className="stamp tilt-l-sm text-[#3d7044] border-[#4E8B56]/50 hidden xl:inline-flex">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4E8B56] animate-pulse" />
              System operational
            </span>

            <div className="flex items-center gap-2 bg-[var(--paper-2)] border border-[var(--rule)] px-2.5 py-1.5 rounded-xl">
              <div className="w-6 h-6 rounded-full bg-[#681121] text-[#FDFBF7] flex items-center justify-center text-[11px] font-semibold">
                A
              </div>
              <span className="font-note text-xs font-medium text-[var(--ink)]">Master Admin</span>
            </div>

            <button onClick={handleLogout} className="btn-outline flex items-center gap-1.5 font-note text-xs font-semibold px-3 py-1.5">
              <LogOut size={14} />
              Sign Out
            </button>
          </div>
        </header>

        {/* Mobile header */}
        <header className="lg:hidden sticky top-0 z-30 bg-[var(--paper)]/95 paper-grain backdrop-blur-md border-b border-[var(--rule)]">
          <span className="absolute top-0 inset-x-0 h-1 bg-[#681121]" aria-hidden="true" />

          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl overflow-hidden shadow-sm border border-[#D48924]/30 bg-[#681121] flex items-center justify-center shrink-0">
                <img src="/logo.png" alt="Gharelu Hub" className="w-full h-full object-cover" />
              </div>
              <div className="leading-tight">
                <span className="font-hand italic font-bold text-lg text-[#540c19] block leading-tight">
                  Gharelu Hub
                </span>
                <span className="font-note text-[9px] font-semibold tracking-[0.2em] uppercase text-[#b87319] block">
                  Admin Kitchen Log
                </span>
              </div>
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menu"
              className="h-9 w-9 rounded-xl flex items-center justify-center bg-[var(--paper-2)] border border-[var(--rule)] text-[#681121]"
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </header>

        {/* Mobile dropdown — a slip pulled from the pad */}
        {mobileMenuOpen && (
          <div className="lg:hidden p-3 bg-[var(--paper-2)] paper-grain border-b border-[var(--rule)] space-y-1.5">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => goTo(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-note text-xs font-semibold transition-colors ${
                  activeTab === item.id
                    ? 'btn-ink'
                    : 'text-[var(--ink-soft)] hover:bg-[var(--paper-3)]'
                }`}
              >
                <item.icon size={16} />
                <span>{item.label}</span>
              </button>
            ))}

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-note text-xs font-semibold text-[#681121] border border-dashed border-[#681121]/40 bg-[var(--paper)]"
            >
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </div>
        )}

        {/* Tab body — a fresh sheet from the pad */}
        <main className="flex-1 page-bg p-4 sm:p-6 lg:p-8 max-w-[1400px] w-full mx-auto text-[var(--ink)]">
          {activeTab === 'dashboard' && <DashboardOverview onNavigate={goTo} />}
          {activeTab === 'products' && <ProductsView />}
          {activeTab === 'orders' && <OrdersView />}
          {activeTab === 'reservations' && <ReservationsView />}
          {activeTab === 'users' && <UsersView />}
        </main>
      </div>
    </div>
  );
}
