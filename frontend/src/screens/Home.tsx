import React, { useMemo, useState, useEffect } from 'react';
import {
  MapPin,
  ChevronDown,
  Search,
  Zap,
  Clock,
  Percent,
  Plus,
  Minus,
  Star,
  Heart,
  MessageCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Award,
  ThumbsUp,
  ThumbsDown,
  Leaf,
  Flame,
  QrCode,
  Bike,
  CheckCircle2,
} from 'lucide-react';
import { useApp, activeDishes, activeCategories, tierOf } from '../store';
import { type Dish } from '../data/menu';
import { locations } from '../data/locations';
import { offersFor, TIERS } from '../data';
import { VegBadge, DeliveryPill, RatingBadge, DishImg } from '../ui';
import { formatINR } from '../lib/utils';
import { proxyApi } from '../lib/api';

export default function Home() {
  const profile = useApp((s) => s.profile);
  const locationId = useApp((s) => s.locationId);
  const push = useApp((s) => s.push);
  const setTab = useApp((s) => s.setTab);
  const addToCart = useApp((s) => s.addToCart);
  const cart = useApp((s) => s.cart);
  const setQty = useApp((s) => s.setQty);
  const favorites = useApp((s) => s.favorites);
  const toggleFavorite = useApp((s) => s.toggleFavorite);
  const points = useApp((s) => s.points);

  const [votes, setVotes] = useState<Record<string, 'up' | 'down'>>({});

  const branch = locations.find((l) => l.id === locationId) ?? locations[0];
  const pool = useMemo(() => activeDishes(locationId), [locationId]);

  // Live menu chapters — synced from the admin panel via /api/categories
  const allCategories = useApp((s) => s.categories);
  const categories = useMemo(
    () => activeCategories(locationId, allCategories),
    [locationId, allCategories]
  );

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [activeHeroSlide, setActiveHeroSlide] = useState(0);

  const heroSlides = useMemo(
    () => [
      {
        image: 'hero-pack-combo',
        tag: '₹129 HERO PACK',
        tagBg: 'bg-[#D48924] text-[#1E1E24]',
        title: 'Sahi Hero Pack',
        dishId: 'mk-bhopali-masala',
        items: 'Masala Makhana + Shahi Nankhatai + Bhopali Sev Namkeen Trio',
        badge: 'What’s inside ₹129 Pack',
      },
      {
        image: 'dessert-01',
        tag: 'PURE DESI GHEE',
        tagBg: 'bg-[#4E8B56] text-white',
        title: 'Sahi Nankhatai',
        dishId: 'nk-bhopali-shahi',
        items: 'Pure Ghee · Cardamom · Roasted Pista flakes',
        badge: 'Heritage 78-yr Recipe',
      },
      {
        image: 'snack-01',
        tag: 'HERITAGE RECIPE',
        tagBg: 'bg-[#681121] text-white',
        title: 'Puffed Rice Sev Mixture',
        dishId: 'nm-zenith-mixture',
        items: 'Crisp Laung Sev · Puffed Rice · Peanuts & Curry Leaves',
        badge: 'Tea-time Classic',
      },
      {
        image: 'in-04',
        tag: '100% ROASTED',
        tagBg: 'bg-[#E2952A] text-[#1E1E24]',
        title: 'Cream & Herb Makhana',
        dishId: 'mk-roasted-chana-mint',
        items: 'Chana + Mint Makhana · Slow Kettle Roasted',
        badge: 'Clean Snacking',
      },
    ],
    []
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveHeroSlide((prev) => (prev + 1) % heroSlides.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  const cartQtyMap = useMemo(() => {
    const map: Record<string, { qty: number; key: string }> = {};
    cart.forEach((c) => {
      map[c.dishId] = { qty: (map[c.dishId]?.qty ?? 0) + c.qty, key: c.key };
    });
    return map;
  }, [cart]);

  const displayedDishes = useMemo(() => {
    if (activeCategory === 'all') return pool;
    return pool.filter((d) => d.category === activeCategory);
  }, [pool, activeCategory]);

  const handleAdd = (d: Dish, e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart({ dishId: d.id, qty: 1, options: [] });
  };

  const handleIncrement = (d: Dish, key: string, currentQty: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setQty(key, currentQty + 1);
  };

  const handleDecrement = (d: Dish, key: string, currentQty: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setQty(key, Math.max(0, currentQty - 1));
  };

  return (
    <div className="min-h-screen bg-[var(--paper)] paper-grain pb-24 lg:pb-8 text-[var(--ink)]">
      {/* ================= 1. RESPONSIVE TOP HEADER (MOBILE & TABLET ONLY: lg:hidden) ================= */}
      <header className="lg:hidden sticky top-0 z-30 bg-[var(--paper)] paper-grain backdrop-blur-md border-b border-[var(--rule)] shadow-sm px-4 sm:px-6 pt-3.5 pb-3.5 relative">
        <div className="absolute top-0 inset-x-0 h-1 bg-[#681121]" aria-hidden="true" />
        <div className="w-full flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-6">
          {/* Brand Logo & Location delivery selector */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 overflow-hidden rounded-2xl bg-[#681121] shadow-md border border-[#D48924]/30 shrink-0">
                <img
                  src="/logo.png"
                  alt="Gharelu Hub Logo"
                  className="w-full h-full object-cover"
                />
              </div>

              <button
                type="button"
                onClick={() => push({ type: 'location' })}
                className="flex items-center gap-2.5 text-left min-w-0"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#D48924] text-white shadow-sm">
                  <Zap size={20} className="fill-white" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-hand italic font-bold text-lg sm:text-xl text-[#540c19] tracking-tight flex items-center gap-1">
                      Delivery in 10-15 mins
                    </span>
                    <span className="stamp text-[#3d7044] border-[#4E8B56]/50 text-[8px]">
                      Fresh
                    </span>
                  </div>
                  <div className="flex items-center gap-1 font-note text-[var(--ink-faint)] text-xs truncate">
                    <span className="font-semibold text-[var(--ink-soft)]">{branch.area}</span>
                    <span>·</span>
                    <span className="truncate">{branch.city}</span>
                    <ChevronDown size={14} className="text-[var(--ink-faint)] shrink-0" />
                  </div>
                </div>
              </button>
            </div>

            {/* Loyalty points button on mobile — ink stamp */}
            <div className="flex items-center gap-2 md:hidden">
              <button
                type="button"
                onClick={() => push({ type: 'loyalty' })}
                className="stamp tilt-l-sm text-[#681121] border-[#D48924]/50"
              >
                <Sparkles size={12} className="text-[#D48924] fill-[#D48924]" />
                <span>{points} pts</span>
              </button>
            </div>
          </div>

          {/* Search bar + Desktop Actions */}
          <div className="flex-1 min-w-0 flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => push({ type: 'search' })}
              className="flex-1 min-w-0 flex items-center justify-between form-blank rounded-2xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-sm transition-colors"
            >
              <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                <Search size={18} className="text-[#D48924] shrink-0" />
                <span className="font-note font-medium text-[var(--ink-faint)] truncate text-xs sm:text-sm">
                  Search &quot;Masala Makhana&quot;, &quot;Shahi Nankhatai&quot;...
                </span>
              </div>
              <span className="stamp text-[#3d7044] border-[#4E8B56]/40 hidden md:inline-block shrink-0 text-[8px]">
                100% Pure Veg
              </span>
            </button>

            {/* Desktop Loyalty Button */}
            <button
              type="button"
              onClick={() => push({ type: 'loyalty' })}
              className="hidden md:flex items-center gap-1.5 sm:gap-2 form-blank px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl font-note text-xs font-semibold text-[#681121] shrink-0 hover:bg-[var(--paper-3)] transition-colors"
            >
              <Sparkles size={15} className="text-[#D48924] fill-[#D48924]" />
              <span>{points} Points</span>
            </button>
          </div>
        </div>
      </header>

      <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-12 space-y-7 pt-4">
        {/* ================= 2. HERO — A taped-in polaroid on the kitchen board ================= */}
        <section>
          <div className="relative rounded-3xl bg-[var(--paper-2)] paper-grain border border-[var(--rule)] shadow-[0_20px_45px_-28px_rgba(84,12,25,0.4)] overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-5 sm:p-7 lg:p-9 items-center">
              {/* Left: handwritten pitch */}
              <div className="lg:col-span-7 flex flex-col">
                <h2 className="font-hand italic text-4xl sm:text-5xl lg:text-[58px] text-[#540c19] tracking-tight leading-[1.02]">
                  Gharelu spice,
                  <br />
                  <span className="marker">100% roasted, never fried.</span>
                </h2>

                <svg viewBox="0 0 260 12" className="w-52 sm:w-64 h-3 mt-2" fill="none" aria-hidden="true">
                  <path d="M3 8.5c30-5 58-6.5 88-5s56 4.5 86 3 48-5 78-6" stroke="#D48924" strokeWidth="2.5" strokeLinecap="round" />
                </svg>

                <p className="font-note text-[13px] sm:text-sm text-[var(--ink-soft)] max-w-md mt-3 leading-relaxed">
                  Bhopal&apos;s heritage recipes, made in pure desi ghee and small batches. No palm
                  oil, no chemical sprays, no shelf-life trickery — just clean crunch, made fresh
                  every morning.
                </p>

                {/* Action Buttons — hand-stamped */}
                <div className="mt-5 flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setTab('menu')}
                    className="btn-ink font-note text-xs sm:text-sm font-semibold px-5 py-2.5"
                  >
                    Explore the Menu
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const heroDish = pool.find((d) => d.id === 'mk-bhopali-masala') || pool[0];
                      if (heroDish) push({ type: 'dish', id: heroDish.id });
                    }}
                    className="font-note text-xs sm:text-sm font-semibold px-4 sm:px-5 py-2.5 rounded-xl flex items-center gap-2 bg-[#D48924]/15 text-[#915408] border-2 border-dashed border-[#D48924]/60 hover:bg-[#D48924]/25 transition-colors"
                  >
                    <Sparkles size={15} className="text-[#D48924]" />
                    Get ₹129 Hero Pack
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      const msg = 'Hi Gharelu Hub! I want to order the ₹129 Hero Pack.';
                      const { data } = await proxyApi.sendWhatsApp({ message: msg });
                      if (data?.url) window.open(data.url, '_blank');
                      else window.open(`https://wa.me/91XXXXXXXXXX?text=${encodeURIComponent(msg)}`, '_blank');
                    }}
                    className="font-note text-xs sm:text-sm font-semibold px-4 sm:px-5 py-2.5 rounded-xl flex items-center gap-2 bg-[#25D366]/12 text-[#1a7d3f] border-2 border-dashed border-[#25D366]/50 hover:bg-[#25D366]/20 transition-colors"
                  >
                    <MessageCircle size={16} /> Order on WhatsApp
                  </button>
                </div>

                {/* ₹129 Hero Pack: What's inside showcase */}
                <div className="mt-5 bg-[var(--paper)]/90 border border-[#D48924]/40 rounded-2xl p-3 sm:p-3.5 max-w-lg shadow-sm">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#D48924] animate-pulse" />
                      <span className="font-note text-[11px] font-bold uppercase tracking-wider text-[#915408]">
                        ₹129 Hero Pack — What&apos;s Inside
                      </span>
                    </div>
                    <span className="stamp text-[#3d7044] border-[#4E8B56]/50 !text-[8px] !px-1.5 !py-0.5">
                      Deck Oven Roasted
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-dashed border-[var(--rule)]">
                    <div className="text-left">
                      <p className="font-note text-[10px] text-[var(--ink-faint)] leading-none">Base</p>
                      <p className="font-note text-[11px] font-semibold text-[#540c19] mt-0.5">Jumbo Makhana</p>
                    </div>
                    <div className="text-left">
                      <p className="font-note text-[10px] text-[var(--ink-faint)] leading-none">Fat</p>
                      <p className="font-note text-[11px] font-semibold text-[#540c19] mt-0.5">Pure Desi Ghee</p>
                    </div>
                    <div className="text-left">
                      <p className="font-note text-[10px] text-[var(--ink-faint)] leading-none">Spices</p>
                      <p className="font-note text-[11px] font-semibold text-[#540c19] mt-0.5">Malwa Hing & Kali Mirch</p>
                    </div>
                    <div className="text-left">
                      <p className="font-note text-[10px] text-[var(--ink-faint)] leading-none">Salt</p>
                      <p className="font-note text-[11px] font-semibold text-[#540c19] mt-0.5">Himalayan Rock Salt</p>
                    </div>
                  </div>
                </div>

                {/* Trust ticks — written like a checklist */}
                <div className="mt-5 flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-2 sm:gap-4 self-start">
                  <div className="flex items-center gap-1.5 font-note text-[11px] font-medium text-[var(--ink-soft)]">
                    <ShieldCheck size={14} className="text-[#3d7044] shrink-0" />
                    <span>0% palm oil &amp; preservatives</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-note text-[11px] font-medium text-[var(--ink-soft)]">
                    <Clock size={14} className="text-[#3d7044] shrink-0" />
                    <span>Made-on date stamped</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-note text-[11px] font-medium text-[var(--ink-soft)]">
                    <Award size={14} className="text-[#3d7044] shrink-0" />
                    <span>FSSAI certified kitchen</span>
                  </div>
                </div>
              </div>

              {/* Right: rotating polaroid, held by tape */}
              <div className="lg:col-span-5 relative">
                <div className="relative tilt-r">
                  <span className="tape w-20 -top-3 left-1/2 -translate-x-1/2 rotate-[-3deg] z-10" aria-hidden="true" />

                  <div className="relative bg-white p-2.5 pb-10 rounded-sm border border-[var(--rule)] shadow-[4px_6px_0_rgba(84,12,25,0.08),0_20px_40px_-24px_rgba(84,12,25,0.5)]">
                    <div className="relative w-full h-56 sm:h-72 overflow-hidden bg-[var(--paper-3)]">
                      {heroSlides.map((slide, idx) => (
                        <div
                          key={slide.image}
                          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${idx === activeHeroSlide ? 'opacity-100' : 'opacity-0'
                            }`}
                          style={{ transitionProperty: 'opacity' }}
                        >
                          <DishImg
                            name={slide.image}
                            className="w-full h-full object-cover object-center"
                          />
                        </div>
                      ))}
                    </div>

                    {/* Handwritten polaroid caption with slide details */}
                    <div className="mt-2 text-center">
                      <p className="font-hand italic text-lg text-[#540c19] leading-tight">
                        {heroSlides[activeHeroSlide]?.title} — <span className="text-[#915408]">{heroSlides[activeHeroSlide]?.tag}</span>
                      </p>
                      <p className="font-note text-[11px] text-[var(--ink-faint)] mt-0.5 truncate px-2">
                        {heroSlides[activeHeroSlide]?.items}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Small carousel dots, drawn as ink blots */}
                <div className="flex items-center justify-center gap-2 mt-4">
                  {heroSlides.map((slide, idx) => (
                    <span
                      key={slide.image}
                      className={`rounded-full transition-all ${idx === activeHeroSlide
                        ? 'w-4 h-2 bg-[#681121]'
                        : 'w-2 h-2 bg-[var(--rule)]'
                        }`}
                      aria-hidden="true"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= 3. FRESH BATCH SNACKS WITH INTEGRATED CATEGORY SORTING ================= */}
        <section>
          <div className="mb-3.5">
            <h3 className="font-hand italic text-3xl text-[#540c19] tracking-tight leading-tight">
              Today&apos;s menu
            </h3>
            <svg viewBox="0 0 160 8" className="w-32 h-2 mt-0.5" fill="none" aria-hidden="true">
              <path d="M2 5.5c20-3 40-3.5 60-2.5s38 2.5 58 1.5 28-2.5 38-3.5" stroke="#D48924" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>

          {/* Integrated Category Sorting Pills — like torn paper tabs */}
          <div className="no-scrollbar flex items-center gap-2 overflow-x-auto pb-3 mb-2 pt-1">
            <button
              type="button"
              onClick={() => setActiveCategory('all')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl shrink-0 font-note text-xs font-semibold transition-all border-2 ${activeCategory === 'all'
                ? 'bg-[#681121] text-[#FDFBF7] border-[#681121] shadow-[2px_3px_0_rgba(36,4,9,0.3)]'
                : 'bg-[var(--paper-2)] border-dashed border-[var(--rule)] text-[var(--ink-soft)] hover:border-[#D48924]'
                }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#E2952A]" />
              <span>All Snacks</span>
            </button>

            {categories.map((c) => {
              const active = activeCategory === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setActiveCategory(c.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl shrink-0 font-note text-xs font-medium transition-all border-2 ${active
                    ? 'bg-[#681121] text-[#FDFBF7] border-[#681121] shadow-[2px_3px_0_rgba(36,4,9,0.3)]'
                    : 'bg-[var(--paper-2)] border-dashed border-[var(--rule)] text-[var(--ink-soft)] hover:border-[#D48924]'
                    }`}
                >
                  <div className="w-5 h-5 rounded-full overflow-hidden bg-[#f3ece0] shrink-0 border border-black/10">
                    <DishImg
                      name={
                        c.id === 'makhana'
                          ? 'in-03'
                          : c.id === 'namkeen'
                            ? 'in-12'
                            : c.id === 'nankhatai'
                              ? 'dessert-01'
                              : c.id === 'cookies'
                                ? 'dessert-05'
                                : c.id === 'gifting'
                                  ? 'fire-01'
                                  : 'drink-01'
                      }
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span>{c.name}</span>
                </button>
              );
            })}
          </div>

          {/* Responsive Grid for Big Vertical Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
            {displayedDishes.slice(0, 8).map((dish, i) => {
              const inCart = cartQtyMap[dish.id];
              const isFav = favorites.includes(dish.id);
              const tilt = ['tilt-l-sm', 'tilt-r-sm', 'tilt-r-sm', 'tilt-l-sm'][i % 4];

              return (
                <div
                  key={dish.id}
                  onClick={() => push({ type: 'dish', id: dish.id })}
                  className={`group relative flex flex-col justify-between bg-[var(--paper-2)] paper-grain p-4 sm:p-5 rounded-3xl border border-[var(--rule)] shadow-[3px_4px_0_rgba(84,12,25,0.05),0_16px_30px_-22px_rgba(84,12,25,0.4)] hover:shadow-float hover:border-[#D48924]/70 ${tilt} hover:tilt-0 transition-all duration-300 cursor-pointer`}
                >
                  <div className="flex flex-col">
                    {/* Big Square Image framed like a taped-in photo */}
                    <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-[var(--paper-3)] border border-[var(--rule)]">
                      <DishImg
                        name={dish.image}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                      />
                      <button
                        type="button"
                        aria-label="Add to favorites"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(dish.id);
                        }}
                        className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--paper-2)]/90 backdrop-blur-sm shadow text-[var(--ink-faint)] hover:text-[#681121] hover:bg-white active:scale-90 transition-all"
                      >
                        <Heart
                          size={16}
                          className={isFav ? 'fill-[#681121] text-[#681121]' : ''}
                        />
                      </button>
                    </div>

                    {/* Vertically Aligned Info Details */}
                    <div className="mt-4 flex flex-col gap-1.5">
                      <h3 className="font-hand font-bold text-xl text-[#540c19] tracking-tight leading-snug line-clamp-1 group-hover:text-[#681121] transition-colors">
                        {dish.name}
                      </h3>

                      {/* Price Details — serif numerals */}
                      <div className="mt-1 flex items-baseline gap-2">
                        <span className="font-hand font-bold text-2xl text-[#681121] tracking-tight">
                          {formatINR(dish.price)}
                        </span>
                        <span className="font-note text-xs sm:text-sm text-[var(--ink-faint)] font-medium line-through">
                          ₹{Math.round(dish.price * 1.25)}
                        </span>
                      </div>

                      {/* Feedback Thumbs Buttons — pencil marks */}
                      <div className="mt-2 flex items-center gap-2">
                        <span className="font-note text-xs font-medium text-[var(--ink-faint)]">Feedback:</span>
                        <button
                          type="button"
                          aria-label="Thumbs Up"
                          onClick={(e) => {
                            e.stopPropagation();
                            setVotes((prev) => ({
                              ...prev,
                              [dish.id]: prev[dish.id] === 'up' ? (undefined as any) : 'up',
                            }));
                          }}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-medium transition-all active:scale-90 ${votes[dish.id] === 'up'
                            ? 'bg-[#4E8B56]/12 text-[#3d7044] border-[#4E8B56]/50 shadow-sm'
                            : 'bg-[var(--paper-2)] text-[var(--ink-faint)] border-[var(--rule)] hover:text-[#3d7044] hover:border-[#4E8B56]/40'
                            }`}
                        >
                          <ThumbsUp
                            size={13}
                            className={votes[dish.id] === 'up' ? 'fill-[#4E8B56]' : ''}
                          />
                        </button>

                        <button
                          type="button"
                          aria-label="Thumbs Down"
                          onClick={(e) => {
                            e.stopPropagation();
                            setVotes((prev) => ({
                              ...prev,
                              [dish.id]: prev[dish.id] === 'down' ? (undefined as any) : 'down',
                            }));
                          }}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-medium transition-all active:scale-90 ${votes[dish.id] === 'down'
                            ? 'bg-[#b91c1c]/12 text-[#b91c1c] border-[#b91c1c]/50 shadow-sm'
                            : 'bg-[var(--paper-2)] text-[var(--ink-faint)] border-[var(--rule)] hover:text-[#b91c1c] hover:border-[#b91c1c]/40'
                            }`}
                        >
                          <ThumbsDown
                            size={13}
                            className={votes[dish.id] === 'down' ? 'fill-[#b91c1c]' : ''}
                          />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Action: ADD / Quantity Stepper */}
                  <div className="mt-4 pt-3 border-t border-dashed border-[var(--rule)]">
                    {inCart && inCart.qty > 0 ? (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="w-full flex items-center justify-between bg-[#4E8B56] text-white rounded-xl px-4 py-2 shadow-md font-note font-semibold text-sm"
                      >
                        <button
                          type="button"
                          onClick={(e) => handleDecrement(dish, inCart.key, inCart.qty, e)}
                          className="p-1 hover:bg-[#3d7044] rounded active:scale-90 transition-transform"
                        >
                          <Minus size={15} strokeWidth={3} />
                        </button>
                        <span className="font-note font-semibold text-sm">{inCart.qty}</span>
                        <button
                          type="button"
                          onClick={(e) => handleIncrement(dish, inCart.key, inCart.qty, e)}
                          className="p-1 hover:bg-[#3d7044] rounded active:scale-90 transition-transform"
                        >
                          <Plus size={15} strokeWidth={3} />
                        </button>
                      </div>
                    ) : !dish.available ? (
                      <span className="stamp w-full justify-center py-2 text-[var(--ink-faint)] border-[var(--rule)]">
                        Sold out today
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => handleAdd(dish, e)}
                        className="btn-outline w-full flex items-center justify-center gap-1.5 font-note text-xs sm:text-sm font-semibold py-2"
                      >
                        <span>ADD</span>
                        <Plus size={14} strokeWidth={2.5} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Explore full menu CTA */}
          <div className="mt-5 flex justify-center">
            <button
              type="button"
              onClick={() => setTab('menu')}
              className="btn-outline flex items-center gap-2 font-note text-xs sm:text-sm font-semibold px-6 py-2.5"
            >
              <span>See the full menu</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </section>

        {/* ================= 6. WHY BHOPAL CHOOSES GHARELU HUB (CASE-STUDY BACKED) ================= */}
        <section className="relative rounded-3xl overflow-hidden bg-[#f5edda] border border-[#e0d2b6] shadow-[0_24px_50px_-30px_rgba(84,12,25,0.45)]">
          {/* Kitchen-log paper: fibre grain, ruled top edge */}
          <div className="absolute inset-0 bg-[radial-gradient(rgba(122,92,48,0.09)_1px,transparent_1px)] [background-size:19px_19px] pointer-events-none" />
          <div className="absolute inset-x-0 top-0 h-2 bg-[#681121] pointer-events-none" />
          <div className="absolute inset-x-0 top-2 h-px bg-[#D48924]/60 pointer-events-none" />

          <div className="relative z-10 p-5 sm:p-8 lg:p-10">
            {/* Logbook header — written, not marketed */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5">
              <div className="max-w-2xl">
                <h3 className="font-hand italic text-3xl sm:text-4xl lg:text-[42px] font-medium text-[#540c19] tracking-tight leading-[1.1]">
                  So, why does Bhopal keep choosing us?
                </h3>
                <svg viewBox="0 0 240 12" className="w-40 sm:w-52 h-3 mt-1" fill="none" aria-hidden="true">
                  <path d="M3 8.5c26-4.5 52-6 78-4.5s50 4.5 76 3 52-5 80-6" stroke="#D48924" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
                <p className="font-note text-[13px] sm:text-sm text-[#4b3a2c] mt-2.5 leading-relaxed">
                  No big secret, honestly. We just got tired of namkeen packets whose ingredient lists were longer than our grocery bill — so we started making ours the slow way. You can taste the difference by the second bite.
                </p>
              </div>

              {/* Ink stamps, the way a real kitchen pins its certificates */}
              <div className="flex items-center gap-3 shrink-0 pt-1">
                <div className="rotate-[-3.5deg] bg-[#FDFBF7]/80 border-2 border-dashed border-[#4E8B56]/60 rounded-lg px-3 py-2 text-center shadow-[2px_3px_0_rgba(84,12,25,0.06)]">
                  <div className="flex items-center justify-center gap-1.5 text-[#3d7044]">
                    <CheckCircle2 size={13} />
                    <p className="font-note text-[10px] font-semibold uppercase tracking-[0.14em]">FSSAI</p>
                  </div>
                  <p className="font-hand italic text-[13px] text-[#6b5a45] leading-none mt-1">kitchen-inspected, we mind it</p>
                </div>
                <div className="rotate-[2.5deg] bg-[#FDFBF7]/80 border-2 border-dashed border-[#D48924]/70 rounded-lg px-3 py-2 text-center shadow-[2px_3px_0_rgba(84,12,25,0.06)]">
                  <div className="flex items-center justify-center gap-1.5 text-[#b87319]">
                    <QrCode size={13} />
                    <p className="font-note text-[10px] font-semibold uppercase tracking-[0.14em]">Batch QR</p>
                  </div>
                  <p className="font-hand italic text-[13px] text-[#6b5a45] leading-none mt-1">scan it — see the farm</p>
                </div>
              </div>
            </div>

            {/* Pinned notes — deliberately uneven, like real paper on a board */}
            <div className="mt-9 grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5 items-start">
              {/* Note 01 — sourcing, wide layout */}
              <article className="lg:col-span-7 relative bg-[#FDFBF7] rounded-2xl border border-[#e5d8c3] p-3.5 sm:p-4 shadow-[3px_4px_0_rgba(84,12,25,0.06),0_16px_30px_-20px_rgba(84,12,25,0.4)] lg:-rotate-[0.7deg] lg:hover:rotate-0 hover:shadow-float transition-all duration-300">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="sm:w-[42%] shrink-0">
                    <div className="relative h-40 sm:h-full sm:min-h-[170px] rounded-xl overflow-hidden border border-[#e5d8c3] bg-[#f3ece0]">
                      <img
                        src="/images/craft-02.webp"
                        alt="Sunday wheat run from Malwa farms"
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <span className="absolute bottom-2.5 left-2.5 -rotate-[6deg] bg-[#FDFBF7]/90 border border-[#681121]/60 text-[#681121] font-note text-[9px] font-semibold uppercase tracking-[0.16em] px-2 py-1 rounded shadow-sm">
                        Farm direct
                      </span>
                    </div>
                  </div>
                  <div className="flex-1">

                    <h4 className="font-hand text-[22px] sm:text-2xl font-semibold text-[#540c19] leading-snug mt-0.5">
                      The wheat actually comes from Malwa
                    </h4>
                    <p className="font-note text-[12.5px] text-[#5b4a38] leading-relaxed mt-1.5">
                      Not a &ldquo;procurement partner&rdquo; — we drive out near Sehore almost every Sunday ourselves and buy the season&apos;s wheat straight from the farmers. The groundnut oil is cold-pressed at a small mill by the Chambal. Two ingredients, both we can point to on a map.
                    </p>
                    <p className="font-hand italic text-[15px] text-[#3d7044] mt-2.5 inline-block border-b-2 border-dashed border-[#4E8B56]/40 pb-0.5">
                      <Leaf size={12} className="inline -mt-0.5 mr-1" />
                      palm oil: zero, and permanently.
                    </p>
                  </div>
                </div>
              </article>

              {/* Note 02 — the bake, narrower note */}
              <article className="lg:col-span-5 relative bg-[#FBF7F0] rounded-2xl border border-[#e5d8c3] p-3.5 sm:p-4 shadow-[3px_4px_0_rgba(84,12,25,0.06),0_16px_30px_-20px_rgba(84,12,25,0.4)] lg:rotate-[0.6deg] lg:hover:rotate-0 hover:shadow-float transition-all duration-300">
                <div className="relative h-40 rounded-xl overflow-hidden border border-[#e5d8c3] bg-[#f3ece0]">
                  <img
                    src="/images/craft-03.webp"
                    alt="Kettle-baked batch straight out of the deck oven"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <span className="absolute bottom-2.5 left-2.5 rotate-[4deg] bg-[#FDFBF7]/90 border border-[#b87319]/60 text-[#b87319] font-note text-[9px] font-semibold uppercase tracking-[0.16em] px-2 py-1 rounded shadow-sm inline-flex items-center gap-1">
                    <Flame size={10} />
                    Slow-roasted
                  </span>
                </div>

                <h4 className="font-hand text-[22px] font-semibold text-[#540c19] leading-snug mt-0.5">
                  Baked in a kettle, never dunked in oil
                </h4>
                <p className="font-note text-[12.5px] text-[#5b4a38] leading-relaxed mt-1.5">
                  Our deck oven bakes each batch instead of drowning it. Takes longer and costs more, but the crunch stays light — no heavy-oil feeling sitting in your stomach till evening.
                </p>
                <p className="font-hand italic text-[15px] text-[#3d7044] mt-2.5 inline-block border-b-2 border-dashed border-[#4E8B56]/40 pb-0.5">
                  try a handful at 4 pm. you&apos;ll get it.
                </p>
              </article>

              {/* Note 03 — the one taped-up maroon sign on the board */}
              <article className="lg:col-span-5 relative rounded-2xl bg-[#540c19] border border-[#D48924]/40 p-3.5 sm:p-4 shadow-[3px_4px_0_rgba(36,4,9,0.35),0_16px_30px_-20px_rgba(84,12,25,0.6)] lg:-rotate-[0.5deg] lg:hover:rotate-0 transition-all duration-300">
                <div className="relative h-40 rounded-xl overflow-hidden border border-[#D48924]/25 bg-[#240409]">
                  <img
                    src="/images/products/masala_makhana_pack.jpg"
                    alt="Pouch stamped with its made-on date"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <span className="absolute bottom-2.5 left-2.5 -rotate-[3deg] bg-[#540c19]/90 border border-[#D48924]/60 text-[#E2952A] font-note text-[9px] font-semibold uppercase tracking-[0.16em] px-2 py-1 rounded shadow-sm">
                    Stamped by hand
                  </span>
                </div>

                <h4 className="font-hand text-[22px] font-semibold text-[#FDFBF7] leading-snug mt-0.5">
                  Made this morning, not &ldquo;best before 2027&rdquo;
                </h4>
                <p className="font-note text-[12.5px] text-[#FDFBF7]/80 leading-relaxed mt-1.5">
                  Every pouch gets its made-on date pressed in while the batch is still warm, and the QR shows which farm the grain came from. Past 48 hours it doesn&apos;t leave the kitchen — it goes home with the staff.
                </p>
                <p className="font-hand italic text-[15px] text-[#E2952A] mt-2.5 inline-block border-b-2 border-dashed border-[#E2952A]/40 pb-0.5">
                  we eat a lot of &ldquo;failed&rdquo; batches, honestly.
                </p>
              </article>

              {/* Note 04 — delivery, photo flipped to the other side */}
              <article className="lg:col-span-7 relative bg-[#FDFBF7] rounded-2xl border border-[#e5d8c3] p-3.5 sm:p-4 shadow-[3px_4px_0_rgba(84,12,25,0.06),0_16px_30px_-20px_rgba(84,12,25,0.4)] lg:rotate-[0.4deg] lg:hover:rotate-0 hover:shadow-float transition-all duration-300">
                <div className="flex flex-col sm:flex-row-reverse gap-4">
                  <div className="sm:w-[42%] shrink-0">
                    <div className="relative h-40 sm:h-full sm:min-h-[170px] rounded-xl overflow-hidden border border-[#e5d8c3] bg-[#f3ece0]">
                      <img
                        src="/images/products/nankhatai_pack.jpg"
                        alt="Warm pack heading out of the neighbourhood hub"
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <span className="absolute bottom-2.5 right-2.5 rotate-[5deg] bg-[#FDFBF7]/90 border border-[#681121]/60 text-[#681121] font-note text-[9px] font-semibold uppercase tracking-[0.16em] px-2 py-1 rounded shadow-sm inline-flex items-center gap-1">
                        <Bike size={10} />
                        10–15 mins
                      </span>
                    </div>
                  </div>
                  <div className="flex-1">

                    <h4 className="font-hand text-[22px] sm:text-2xl font-semibold text-[#540c19] leading-snug mt-0.5">
                      Fifteen minutes, oven to your door
                    </h4>
                    <p className="font-note text-[12.5px] text-[#5b4a38] leading-relaxed mt-1.5">
                      Our little hubs sit inside Arera Colony, Shahpura and Kolar Road — no godown in the middle, no third-party warehouse. Order at 7 pm and it&apos;s still warm when it reaches your gate.
                    </p>
                    <p className="font-hand italic text-[15px] text-[#681121] mt-2.5 inline-block border-b-2 border-dashed border-[#681121]/30 pb-0.5">
                      touch the pack when it lands. still warm, promise.
                    </p>
                  </div>
                </div>
              </article>
            </div>

            {/* Signed off like an actual log entry */}
            <div className="mt-8 flex items-center gap-2.5 pl-1">
              <svg viewBox="0 0 34 20" className="w-8 h-5 rotate-6 text-[#D48924] shrink-0" fill="none" aria-hidden="true">
                <path d="M2 14c83 161 22-5m0 0l-5-1m5 1l-2-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>

            </div>
          </div>
        </section>

        {/* Bhopal 78-Year Namkeen Heritage Showcase — a story torn from the family notebook */}
        <section className="relative rounded-3xl overflow-hidden bg-[var(--paper-2)] paper-grain p-6 sm:p-8 lg:p-10 border border-[var(--rule)] shadow-[0_18px_40px_-28px_rgba(84,12,25,0.4)]">
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Authentic Story & Culinary Pillars */}
            <div className="lg:col-span-7 space-y-4">


              <h2 className="font-hand italic text-3xl sm:text-4xl lg:text-5xl text-[#540c19] tracking-tight leading-[1.05]">
                78 years of Bhopal&apos;s
                <br />
                <span className="marker">royal namkeen</span>
              </h2>

              <p className="font-note text-[13px] sm:text-sm text-[var(--ink-soft)] leading-relaxed">
                Long before factory-packed snacks took over the shelves, Bhopal&apos;s nawabi alleys
                were famous for hand-pressed Ratlam Sev, slow-roasted chana, and fragrant makhana
                tossed in cold-pressed groundnut oil with freshly pounded cloves. We still make it
                that way.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3.5 rounded-2xl bg-[var(--paper)] border border-[var(--rule)] shadow-sm tilt-l-sm">
                  <div className="font-hand italic text-3xl text-[#681121] mb-1 leading-none">
                    78
                  </div>
                  <h4 className="font-note text-xs font-semibold text-[var(--ink)]">Years of craft</h4>
                  <p className="font-note text-[11px] text-[var(--ink-faint)] mt-0.5">
                    The spice blend has stayed in the family since 1948.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-[var(--paper)] border border-[var(--rule)] shadow-sm tilt-r-sm">
                  <div className="font-hand italic text-3xl text-[#3d7044] mb-1 leading-none">
                    0%
                  </div>
                  <h4 className="font-note text-xs font-semibold text-[var(--ink)]">Palm oil, ever</h4>
                  <p className="font-note text-[11px] text-[var(--ink-faint)] mt-0.5">
                    Slow-roasted in pure cold-pressed groundnut oil instead.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-[var(--paper)] border border-[var(--rule)] shadow-sm tilt-l-sm">
                  <div className="font-hand italic text-3xl text-[#b87319] mb-1 leading-none">
                    10m
                  </div>
                  <h4 className="font-note text-xs font-semibold text-[var(--ink)]">Oven to door</h4>
                  <p className="font-note text-[11px] text-[var(--ink-faint)] mt-0.5">
                    Arera Colony, Kolar &amp; Shahpura, dispatched straight from the kitchen.
                  </p>
                </div>
              </div>


            </div>

            {/* Right Column: A photo pinned to the board */}
            <div className="lg:col-span-5 relative">
              <div className="relative tilt-r">
                <span className="tape w-20 -top-3 left-1/2 -translate-x-1/2 rotate-[-4deg] z-10" aria-hidden="true" />
                <div className="relative bg-white p-2.5 pb-12 rounded-sm border border-[var(--rule)] shadow-[4px_6px_0_rgba(84,12,25,0.08),0_20px_40px_-24px_rgba(84,12,25,0.5)] group">
                  <div className="overflow-hidden bg-[var(--paper-3)] h-64 sm:h-80">
                    <img
                      src="/images/bhopal-namkeen-heritage.jpg"
                      alt="78 Years of Bhopali Namkeen Heritage"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      loading="lazy"
                    />
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 text-center">

                    <p className="font-hand italic text-lg text-[var(--ink-soft)] leading-tight mt-0.5">
                      Laung sev, spiced makhana &amp; shahi nankhatai
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer — the back page of the kitchen logbook */}
        <footer className="mt-12 bg-[#540c19] text-[#FDFBF7] rounded-3xl p-8 sm:p-10 lg:p-12 shadow-[0_18px_40px_-26px_rgba(36,4,9,0.6)] border-2 border-dashed border-[#D48924]/40 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(rgba(226,149,42,0.09)_1px,transparent_1px)] [background-size:19px_19px] pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10 pb-8 border-b border-dashed border-[#FDFBF7]/20">
            {/* Column 1: Brand Lore */}
            <div className="lg:col-span-2 space-y-3.5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl overflow-hidden bg-[#681121] border border-[#D48924]/40 flex items-center justify-center shadow-md">
                  <img src="/logo.png" alt="Gharelu Hub" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="font-hand italic text-2xl tracking-tight text-[#FDFBF7] leading-tight">Gharelu Hub</h3>

                </div>
              </div>

              <p className="font-note text-xs text-[#FDFBF7]/75 leading-relaxed font-medium max-w-sm">
                Madhya Pradesh&apos;s proud guilt-free namkeen and snackery. 78 years of Bhopali culinary heritage, baked with zero preservatives, pure cold-pressed groundnut oil, and dispatched fresh within minutes.
              </p>

              <div className="flex items-center gap-2 pt-1 font-note text-xs text-[#E2952A]/90 font-medium">
                <MapPin size={14} className="text-[#E2952A]" />
                <span>Central Kitchen: Arera Colony, Bhopal, MP 462016</span>
              </div>
            </div>

            {/* Column 2: Quick Menus */}
            <div className="space-y-2.5">
              <h4 className="font-note text-[10px] font-semibold uppercase text-[#E2952A] tracking-[0.2em]">Heritage Menu</h4>
              <ul className="space-y-2 font-note text-xs text-[#FDFBF7]/70 font-medium">
                <li><button type="button" onClick={() => setTab('menu')} className="hover:text-[#E2952A] transition-colors">Bhopali Masala Makhana</button></li>
                <li><button type="button" onClick={() => setTab('menu')} className="hover:text-[#E2952A] transition-colors">Royal Shahi Nankhatai</button></li>
                <li><button type="button" onClick={() => setTab('menu')} className="hover:text-[#E2952A] transition-colors">Ratlam Laung Sev</button></li>
                <li><button type="button" onClick={() => setTab('menu')} className="hover:text-[#E2952A] transition-colors">Roasted Chana &amp; Makhana</button></li>
                <li><button type="button" onClick={() => setTab('menu')} className="hover:text-[#E2952A] transition-colors">Festive Gharelu Gift Hampers</button></li>
              </ul>
            </div>

            {/* Column 3: Active Clusters */}
            <div className="space-y-2.5">
              <h4 className="font-note text-[10px] font-semibold uppercase text-[#E2952A] tracking-[0.2em]">Active Bhopal Hubs</h4>
              <ul className="space-y-2 font-note text-xs text-[#FDFBF7]/70 font-medium">
                <li className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-[#5fa768]" /> Arera Colony</li>
                <li className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-[#5fa768]" /> Kolar Road</li>
                <li className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-[#5fa768]" /> Shahpura Sector A</li>
                <li className="flex items-center gap-1.5 opacity-60"><span className="w-1.5 h-1.5 rounded-full bg-[#E2952A]" /> MP Nagar</li>
                <li className="flex items-center gap-1.5 opacity-60"><span className="w-1.5 h-1.5 rounded-full bg-[#E2952A]" /> Indore</li>
              </ul>
            </div>

            {/* Column 4: Concierge & Support */}
            <div className="space-y-2.5">
              <h4 className="font-note text-[10px] font-semibold uppercase text-[#E2952A] tracking-[0.2em]">Direct Concierge</h4>
              <p className="font-note text-xs text-[#FDFBF7]/75 font-medium leading-relaxed">
                Connect directly with our Bhopal dispatch team for corporate orders &amp; feedback:
              </p>
              <button
                type="button"
                onClick={() => window.open('https://wa.me/919999999999?text=Hi%20Gharelu%20Hub,%20I%20have%20an%20inquiry', '_blank')}
                className="w-full inline-flex items-center justify-center gap-2 font-note text-xs font-semibold px-3 py-2.5 rounded-xl bg-[#25D366]/15 text-[#25D366] border-2 border-dashed border-[#25D366]/50 hover:bg-[#25D366]/25 transition-colors"
              >
                <span>Chat on WhatsApp</span>
              </button>
            </div>
          </div>

          {/* Bottom Copyright & Disclaimer — a hand-written colophon */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 font-note text-[11px] text-[#FDFBF7]/55 font-medium">
            <p className="font-hand italic text-base text-[#FDFBF7]/80">© 2026 Gharelu Hub · Bhopal&apos;s 78-year snackery. All rights reserved.</p>

          </div>
        </footer>
      </div>
    </div>
  );
}

