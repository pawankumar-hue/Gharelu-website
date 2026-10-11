import type { Dish } from './data/menu';

/* ---------------- cravings (home rails) ---------------- */

export interface Craving {
  id: string;
  label: string;
  hint: string;
  test: (d: Dish) => boolean;
}

export const cravings: Craving[] = [
  { id: 'makhana', label: 'MAKHANA', hint: 'the lotus seed crunch', test: (d) => d.category === 'makhana' },
  { id: 'spicy', label: 'SPICY', hint: 'bring the heat', test: (d) => d.spiceLevel >= 2 },
  { id: 'gifting', label: 'GIFTING', hint: 'the full story in a box', test: (d) => d.category === 'gifting' },
  { id: 'sweet', label: 'SWEET BAKES', hint: 'ghee and cardamom', test: (d) => ['nankhatai', 'cookies'].includes(d.category) },
  { id: 'namkeen', label: 'NAMKEEN', hint: 'the classics of Bhopal', test: (d) => d.category === 'namkeen' },
  { id: 'subscribe', label: 'SUBSCRIPTION', hint: 'fresh every week', test: (d) => d.category === 'subscriptions' },
];

/* ---------------- search intent keywords ---------------- */

export const intentMap: Array<{ keys: string[]; test: (d: Dish) => boolean }> = [
  { keys: ['spicy', 'hot', 'masala', 'peri', 'ratlam'], test: (d) => d.spiceLevel >= 2 },
  { keys: ['mild', 'light', 'salted', 'plain'], test: (d) => d.spiceLevel <= 1 },
  { keys: ['sweet', 'baked', 'nankhatai', 'cookie', 'mathri'], test: (d) => ['nankhatai', 'cookies'].includes(d.category) },
  { keys: ['makhana', 'lotus', 'fox nut', 'roasted', 'guilt-free'], test: (d) => d.category === 'makhana' },
  { keys: ['namkeen', 'sev', 'bhujia', 'chanachur', 'mixture'], test: (d) => d.category === 'namkeen' },
  { keys: ['gift', 'hamper', 'box', 'diwali', 'birthday', 'corporate'], test: (d) => d.category === 'gifting' },
  { keys: ['subscribe', 'subscription', 'weekly', 'monthly', 'club'], test: (d) => d.category === 'subscriptions' },
  { keys: ['bestseller', 'popular', 'top', 'favourite'], test: (d) => !!d.bestseller },
  { keys: ['cheap', 'under 200', 'budget'], test: (d) => d.price <= 149 },
];

/* ---------------- filters ---------------- */

export interface FilterDef {
  id: string;
  label: string;
  test: (d: Dish) => boolean;
}

export const filters: FilterDef[] = [
  { id: 'makhana', label: 'MAKHANA', test: (d) => d.category === 'makhana' },
  { id: 'namkeen', label: 'NAMKEEN', test: (d) => d.category === 'namkeen' },
  { id: 'baked', label: 'BAKED', test: (d) => ['nankhatai', 'cookies'].includes(d.category) },
  { id: 'gifting', label: 'GIFT BOXES', test: (d) => d.category === 'gifting' },
  { id: 'spicy', label: 'SPICY', test: (d) => d.spiceLevel >= 2 },
  { id: 'mild', label: 'MILD', test: (d) => d.spiceLevel <= 1 },
  { id: 'best', label: 'BESTSELLER', test: (d) => !!d.bestseller },
  { id: 'under200', label: 'UNDER ₹200', test: (d) => d.price <= 199 },
];

/* ---------------- customizations ---------------- */

export interface OptionGroup {
  id: string;
  label: string;
  required?: boolean;
  multi?: boolean;
  choices: Array<{ id: string; label: string; delta: number }>;
}

const MAKHANA_PACK_SIZE: OptionGroup = {
  id: 'pack',
  label: 'PACK SIZE',
  required: true,
  choices: [
    { id: 'single', label: 'Single (40g)', delta: 0 },
    { id: 'trio', label: 'Trio Pack (120g)', delta: 200 },
    { id: 'family', label: 'Family (200g)', delta: 220 },
  ],
};

const NAMKEEN_PACK: OptionGroup = {
  id: 'pack',
  label: 'PACK SIZE',
  required: true,
  choices: [
    { id: 'small', label: 'Small (100g)', delta: 0 },
    { id: 'large', label: 'Large (250g)', delta: 80 },
  ],
};

const NANKHATAI_PACK: OptionGroup = {
  id: 'pack',
  label: 'BOX SIZE',
  required: true,
  choices: [
    { id: 'box6', label: '6 pieces', delta: 0 },
    { id: 'box12', label: '12 pieces', delta: 129 },
    { id: 'box24', label: '24 pieces (Gift)', delta: 279 },
  ],
};

const COOKIE_PACK: OptionGroup = {
  id: 'pack',
  label: 'BOX SIZE',
  required: true,
  choices: [
    { id: 'box4', label: '4 pieces', delta: 0 },
    { id: 'box8', label: '8 pieces', delta: 109 },
  ],
};

const GIFT_ENGRAVING: OptionGroup = {
  id: 'message',
  label: 'PERSONALISED MESSAGE CARD',
  multi: false,
  choices: [
    { id: 'none', label: 'No message card', delta: 0 },
    { id: 'card', label: 'Add handwritten message card', delta: 30 },
  ],
};

const SUB_FLAVOUR: OptionGroup = {
  id: 'flavour',
  label: 'MAKHANA PREFERENCE',
  required: true,
  multi: true,
  choices: [
    { id: 'masala', label: 'Bhopali Masala', delta: 0 },
    { id: 'salted', label: 'Classic Salted', delta: 0 },
    { id: 'periperi', label: 'Peri Peri', delta: 0 },
    { id: 'chatpata', label: 'Chatpata Imli', delta: 0 },
    { id: 'cheese', label: 'Cheese & Herbs', delta: 0 },
  ],
};

const customizationMap: Record<string, OptionGroup[]> = {
  makhana: [MAKHANA_PACK_SIZE],
  namkeen: [NAMKEEN_PACK],
  nankhatai: [NANKHATAI_PACK, GIFT_ENGRAVING],
  cookies: [COOKIE_PACK],
  gifting: [GIFT_ENGRAVING],
  subscriptions: [SUB_FLAVOUR],
};

export const customizationsFor = (d: Dish): OptionGroup[] => customizationMap[d.category] ?? [];

/* ---------------- order tracking ---------------- */

export const ORDER_STAGES = [
  { id: 'placed', label: 'ORDER PLACED', sub: 'We have your Gharelu Hub order' },
  { id: 'sourced', label: 'FRESH BATCH CONFIRMED', sub: 'Farm-fresh batch allocated to your order' },
  { id: 'roasting', label: 'ROASTING IN PROGRESS', sub: 'Your makhana is in the convection oven now' },
  { id: 'packed', label: 'PACKED & SEALED', sub: 'Boxed with made-on-date stamp' },
  { id: 'out', label: 'OUT FOR DELIVERY', sub: 'Route-optimised batch on its way' },
  { id: 'arriving', label: 'ARRIVING SOON', sub: 'Almost at your door' },
  { id: 'delivered', label: 'DELIVERED', sub: 'Enjoy. Points added to your account.' },
];

/* ---------------- pairings ---------------- */

const pairingRules: Array<{ cats: string[]; picks: string[] }> = [
  { cats: ['makhana'], picks: ['nm-1', 'nk-1', 'ck-1', 'sb-1'] },
  { cats: ['namkeen'], picks: ['mk-1', 'mk-2', 'bv-1'] },
  { cats: ['nankhatai', 'cookies'], picks: ['mk-2', 'mk-5', 'gf-1'] },
  { cats: ['gifting'], picks: ['mk-1', 'nk-1', 'nm-3'] },
  { cats: ['subscriptions'], picks: ['mk-1', 'mk-6', 'gf-2'] },
];

export const pairingsFor = (d: Dish, all: Dish[]): Dish[] => {
  const rule = pairingRules.find((r) => r.cats.includes(d.category));
  const ids = rule?.picks ?? ['mk-1', 'nk-1', 'nm-1'];
  return ids.filter((id) => id !== d.id).map((id) => all.find((x) => x.id === id)).filter(Boolean) as Dish[];
};

/* ---------------- offers ---------------- */

export interface Offer {
  id: string;
  title: string;
  sub: string;
  code: string;
  value: string;
  locations?: string[];
}

export const offers: Offer[] = [
  { id: 'first', title: 'FIRST HUB BOX', sub: 'Welcome to Gharelu Hub. Your first box is special.', code: 'GHFIRST', value: '10% OFF' },
  { id: 'refer', title: 'REFER A FRIEND', sub: 'Both of you earn 200 hub points', code: 'GHREF', value: '₹50 OFF' },
  { id: 'bulk', title: 'BULK ORDER', sub: 'Orders above ₹999', code: 'GHBULK15', value: '15% OFF' },
  { id: 'weekly', title: 'WEEKLY SUBSCRIBER', sub: 'Subscribe weekly, never run out', code: 'GHWEEK', value: 'FREE DELIVERY' },
  { id: 'diwali', title: 'FESTIVE GIFTING', sub: 'Royal boxes for every table', code: 'GH250', value: '₹250 OFF', locations: ['bhopal-main'] },
  { id: 'member', title: 'HUB INSIDER', sub: 'Silver tier and above', code: 'INSIDER', value: '20% OFF', locations: ['bhopal-main'] },
];

export const offersFor = (locationId: string | null) =>
  offers.filter((o) => !o.locations || !locationId || o.locations.includes(locationId));

/* ---------------- loyalty ---------------- */

export const TIERS = [
  { id: 'welcome', name: 'WELCOME', from: 0, perks: ['Earn 1 point per ₹10', 'Birthday treat', 'Early access to new flavours'] },
  { id: 'insider', name: 'INSIDER', from: 500, perks: ['5% hub cashback', 'Skip-the-wait delivery', 'Insider-only flavours'] },
  { id: 'gharelu', name: 'GHARELU', from: 2000, perks: ['10% cashback', 'Free personalisation on every gift', 'Quarterly tasting kit'] },
  { id: 'founder', name: 'FOUNDER', from: 5000, perks: ['15% cashback', 'Name in every batch QR', 'Annual Bhopal kitchen visit'] },
];

export const rewards = [
  { id: 'r1', name: 'Free Salted Makhana', cost: 200 },
  { id: 'r2', name: 'Gharelu Nankhatai Box', cost: 400 },
  { id: 'r3', name: '₹200 Off Any Order', cost: 600 },
  { id: 'r4', name: 'Gharelu Gift Box — Small', cost: 1000 },
  { id: 'r5', name: 'Quarterly Kitchen Visit, Bhopal', cost: 4000 },
];

/* ---------------- discover ---------------- */

export const chefStory = {
  name: 'Hack Busters Team',
  role: 'FOUNDERS · BHOPAL',
  image: 'chef-04',
  story:
    'Born out of a home kitchen and a conviction: Bhopal\'s 78-year namkeen heritage deserves a modern-health reboot. Gharelu Hub is built on small batches, direct sourcing, and the discipline to never trade freshness for scale.',
  specialty: 'Preservative-free snack innovation',
  favorite: 'Bhopali Masala Makhana — always',
};

export const foodStories = [
  { id: 's1', title: 'WHY WE ROAST, NOT FRY', image: 'in-03', tag: 'THE PROCESS', steps: ['Convection deck oven only', 'No oil submersion', 'Temperature-controlled batch', '55–60% GM retained'] },
  { id: 's2', title: 'THE 48-HOUR PROMISE', image: 'fire-01', tag: 'THE FRESHNESS', steps: ['Made-on-date stamped', 'Batch dispatch same day', 'No warehouse storage', 'You eat what we just made'] },
  { id: 's3', title: 'FROM BIHAR FARMGATE TO BHOPAL DOOR', image: 'in-24', tag: 'THE SOURCING', steps: ['Direct Bihar fox nut procurement', 'Chambal cold-pressed oils', 'Ratlam spice blends', 'QR-linked batch traceability'] },
];

export const events = [
  { id: 'e1', title: 'POP-UP — BOAT CLUB', date: 'Every Saturday', time: '17:00–21:00', location: 'Bhopal Boat Club', seats: 200, price: 0, image: 'chef-05', desc: 'Free sampling. Meet the founders. Try all five Makhana flavours live.' },
  { id: 'e2', title: 'DIWALI GIFTING DRIVE', date: 'October 2024', time: 'Pre-order open', location: 'WhatsApp', seats: 500, price: 0, image: 'int-09', desc: 'Corporate and personal Gharelu boxes. Pre-order on WhatsApp for guaranteed festive delivery.' },
  { id: 'e3', title: 'WEEKLY HUB CLUB CALL', date: 'Every Sunday', time: '11:00 AM', location: 'WhatsApp Community', seats: 1000, price: 0, image: 'int-10', desc: 'Exclusive community for subscribers. New flavour previews, early drops, member-only offers.' },
];

export const timeSlots = [
  ...['09:00', '10:00', '11:00', '12:00'].map((t) => ({ t, meal: 'Morning Batch' })),
  ...['16:00', '17:00', '18:00', '19:00'].map((t) => ({ t, meal: 'Evening Batch' })),
];

export const slotStatus = (date: string, time: string): 'available' | 'limited' | 'unavailable' => {
  const h = [...(date + time)].reduce((n, c) => n + c.charCodeAt(0), 0);
  const v = h % 10;
  if (v < 2) return 'unavailable';
  if (v < 5) return 'limited';
  return 'available';
};

export const hourLabel = () => {
  const h = new Date().getHours();
  if (h < 12) return 'GOOD MORNING';
  if (h < 16) return 'GOOD AFTERNOON';
  if (h < 21) return 'GOOD EVENING';
  return 'GOOD NIGHT';
};
