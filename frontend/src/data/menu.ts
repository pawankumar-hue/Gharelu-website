export type SpiceLevel = 0 | 1 | 2 | 3;

export interface Dish {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  image: string;
  ingredients: string[];
  dietaryTags: string[];
  spiceLevel: SpiceLevel;
  veg: boolean;
  bestseller?: boolean;
  available: boolean;
  branchAvailability: string[];
  weight?: string; // e.g. "40g-60g", "100g", "250g"
  shelfLife?: string; // e.g. "48 hrs fresh", "48-Hour Stamped"
  fresh?: boolean; // made-to-order
  pptHero?: boolean;
}

export interface MenuCategory {
  id: string;
  name: string;
  eyebrow: string;
  line: string;
  archetype: 'plate' | 'grill' | 'bowl' | 'round' | 'glass' | 'cup' | 'dessert';
  tint: string;
  fire?: boolean;
  smoke?: boolean;
}

export const categories: MenuCategory[] = [
  { id: 'makhana', name: 'MAKHANA', eyebrow: 'Chapter 01', line: 'Popped Lotus Seeds · 100% Roasted, Never Fried', archetype: 'bowl', tint: '#8b1a1a' },
  { id: 'nankhatai', name: 'NANKHATAI', eyebrow: 'Chapter 02', line: 'Traditional Bhopali Recipe · Desi Ghee & Cardamom', archetype: 'dessert', tint: '#d4a96a' },
  { id: 'namkeen', name: 'HERITAGE NAMKEEN', eyebrow: 'Chapter 03', line: '78 Years of Central Indian Spices & Roasted Chana', archetype: 'plate', tint: '#c9a24b' },
  { id: 'cookies', name: 'HEALTHY COOKIES', eyebrow: 'Chapter 04', line: 'Jowar, Whole-wheat, Dry Fruit & Nuts · No Maida', archetype: 'dessert', tint: '#c4855a' },
  { id: 'beverages', name: 'COOLERS & BEVERAGES', eyebrow: 'Chapter 05', line: 'Gulab Shikanji, Kesar Elaichi & Jamun Masala', archetype: 'glass', tint: '#e23744' },
  { id: 'gifting', name: 'GIFT BOXES', eyebrow: 'Chapter 06', line: 'Gharelu Bhopal Kraft Boxes & Hampers', archetype: 'plate', tint: '#8b1a1a', smoke: true },
  { id: 'subscriptions', name: 'SUBSCRIPTIONS', eyebrow: 'Chapter 07', line: 'Weekly & Monthly Recurring Snack Boxes', archetype: 'round', tint: '#c9a24b' },
];

const ALL = ['bhopal-main'];

const d = (
  id: string,
  name: string,
  category: string,
  price: number,
  image: string,
  description: string,
  ingredients: string[],
  opts: Partial<Dish> = {}
): Dish => ({
  id,
  name,
  category,
  price,
  image,
  description,
  ingredients,
  dietaryTags: opts.dietaryTags ?? ['100% Preservative-Free', 'Pure Veg', '48h Fresh'],
  spiceLevel: (opts.spiceLevel ?? 1) as SpiceLevel,
  veg: opts.veg ?? true,
  bestseller: opts.bestseller ?? false,
  available: opts.available ?? true,
  branchAvailability: opts.branchAvailability ?? ALL,
  weight: opts.weight,
  shelfLife: opts.shelfLife ?? '48h Fresh Stamped',
  fresh: opts.fresh ?? true,
  pptHero: opts.pptHero ?? false,
});

export const dishes: Dish[] = [
  // ==========================================
  // CHAPTER 1: MAKHANA (PITCH DECK HERO SKUS)
  // ==========================================
  d(
    'mk-bhopali-masala',
    'Sahi Hero Pack',
    'makhana',
    129,
    'hero-pack-combo',
    'The ultimate all-in-one tasting bundle! Includes our signature Bhopali Masala Makhana, freshly baked Shahi Nankhatai biscuits, and crisp heritage Bhopali Sev Namkeen. 100% slow-roasted in pure desi ghee, zero palm oil, stamped with 48h freshness.',
    [
      'Bhopali Masala Makhana (Pouch)',
      'Fresh Shahi Nankhatai Biscuits',
      'Crisp Bhopali Sev Mixture',
      'Pure Desi Ghee',
      'Malwa Spices & Rock Salt'
    ],
    { spiceLevel: 2, bestseller: true, weight: 'Tasting Trio Combo Pack', pptHero: true }
  ),

  d(
    'mk-roasted-chana-mint',
    'Roasted Chana + Mint Makhana',
    'makhana',
    119,
    'in-20',
    'Whole Bengal gram paired with crisp roasted fox nuts and crushed sun-dried mint leaves, spiked with kala namak and ground roasted cumin.',
    ['Whole Bengal Gram', 'Popped Fox Nuts', 'Sun-Dried Mint Leaves', 'Kala Namak (Black Salt)', 'Ground Cumin'],
    { spiceLevel: 1, bestseller: true, weight: '50g Stand-up Pouch', pptHero: true }
  ),

  d(
    'mk-classic-pink-salt',
    'Classic Himalayan Salted Makhana',
    'makhana',
    119,
    'in-19',
    'The clean-label purist pick. Cold-pressed virgin oil mist, Himalayan pink mineral salt, and crisp lotus seeds roasted to perfection. No chemicals, zero preservatives.',
    ['Popped Fox Nuts', 'Himalayan Pink Salt', 'Cold-Pressed Oil Mist'],
    { spiceLevel: 0, weight: '50g Pouch' }
  ),

  d(
    'mk-peri-peri-punch',
    'Peri Peri Zest Makhana',
    'makhana',
    129,
    'in-02',
    'Bold Central Indian chilli heat with a citrus zest twist. Tossed hot off the roasting pan with our proprietary clean spice coating.',
    ['Popped Fox Nuts', 'Peri Peri Chilli', 'Paprika', 'Lemon Zest', 'Rock Salt'],
    { spiceLevel: 3, weight: '50g Pouch' }
  ),

  d(
    'mk-family-assorted',
    'Gharelu Hub Makhana Quad-Pack',
    'makhana',
    399,
    'lux-05',
    'The ultimate tasting bundle featuring 4 pouches: Bhopali Masala, Roasted Chana Mint, Himalayan Salted, and Peri Peri. Stamped made-on-date freshness.',
    ['Bhopali Masala', 'Roasted Chana Mint', 'Himalayan Salted', 'Peri Peri Zest'],
    { spiceLevel: 1, bestseller: true, weight: '4 × 50g Pouch Set', pptHero: true }
  ),

  // ==========================================
  // CHAPTER 2: NANKHATAI (HERITAGE BAKERY)
  // ==========================================
  d(
    'nk-bhopali-shahi',
    'Bhopali Shahi Nankhatai',
    'nankhatai',
    149,
    'dessert-01',
    'Rich buttery taste, gram flour & pure desi ghee with fragrant green cardamom hints. Made following Bhopal’s traditional 78-year heritage bakery recipe. Stamped with Made-on-Date 48-hour freshness.',
    ['Besan (Gram Flour)', 'Desi Ghee', 'Cardamom Essence', 'Saffron Strands', 'Organic Raw Sugar'],
    { spiceLevel: 0, bestseller: true, weight: '6 pcs / 140g Box', pptHero: true }
  ),

  d(
    'nk-kesar-pista',
    'Kesar Pista Shahi Nankhatai',
    'nankhatai',
    179,
    'dessert-02',
    'Royal saffron strands soaked in warm milk, folded with golden roasted Iranian pistachios and pure desi ghee. Melts delicately on the tongue.',
    ['Gram Flour', 'Desi Ghee', 'Kashmiri Kesar', 'Crushed Pistachios', 'Green Cardamom'],
    { spiceLevel: 0, weight: '6 pcs / 140g Box' }
  ),

  d(
    'nk-rose-cardamom',
    'Rose & Elaichi Nankhatai',
    'nankhatai',
    159,
    'dessert-04',
    'Infused with sun-dried Damask rose petals, cold-distilled rose water, and freshly cracked green cardamom.',
    ['Gram Flour', 'Pure Desi Ghee', 'Damask Rose Petals', 'Cardamom Hints', 'Raw Sugar'],
    { spiceLevel: 0, weight: '6 pcs / 140g Box' }
  ),

  // ==========================================
  // CHAPTER 3: HERITAGE NAMKEEN (BHOPAL RECIPES)
  // ==========================================
  d(
    'nm-laung-sev',
    'Bhopali Laung Sev Special',
    'namkeen',
    99,
    'in-16',
    'Featured in our pitch deck SKU architecture. Classic clove-infused (Laung) gram flour sev, turmeric, Ratlam red chilli, and hing. Made in small batches without palm oil.',
    ['Gram Flour (Besan)', 'Ground Clove (Laung)', 'Ratlam Spices', 'Turmeric', 'Cold-Pressed Oil'],
    { spiceLevel: 3, bestseller: true, weight: '100g Stand-up Pouch', pptHero: true }
  ),

  d(
    'nm-zenith-mixture',
    'Bhopali Puffed Rice & Sev Mixture',
    'namkeen',
    89,
    'in-12',
    'As detailed in the pitch deck: Puffed Rice (Murmura), Puffed Chana, Peanuts & Cashews, Curry Leaves, and aromatic local spices. Light, crunchy, zero palm oil.',
    ['Puffed Rice (Murmura)', 'Puffed Chana', 'Roasted Peanuts', 'Cashews', 'Curry Leaves', 'Cumin & Salt'],
    { spiceLevel: 1, weight: '100g Pouch', pptHero: true }
  ),

  d(
    'nm-ratlam-deluxe',
    'Ratlam Hing & Jeera Sev',
    'namkeen',
    109,
    'in-32',
    'Bold asafoetida aroma with roasted cumin and cracked peppercorns. Crisped at optimal temperature to ensure zero greasiness.',
    ['Gram Flour', 'Hing (Asafoetida)', 'Roasted Cumin', 'Ratlam Spices', 'Cold-Pressed Oil'],
    { spiceLevel: 2, weight: '100g Pouch' }
  ),

  // ==========================================
  // CHAPTER 4: HEALTHY COOKIES (NO MAIDA)
  // ==========================================
  d(
    'ck-rose-pistachio',
    'Rose & Pistachio Royal Cookies',
    'cookies',
    149,
    'dessert-01',
    'Pitch deck featured SKU: Made with pure ingredients, premium dates, cashews & almonds, green cardamom, saffron strands, and moderate natural honey. A royal treat.',
    ['Premium Dates', 'Cashews & Almonds', 'Green Cardamom', 'Saffron Strands', 'Natural Honey', 'Whole Grain'],
    { spiceLevel: 0, bestseller: true, weight: '120g Box', pptHero: true }
  ),

  d(
    'ck-jowar-peanut',
    'Nutritious Jowar Peanut Cookies',
    'cookies',
    129,
    'dessert-03',
    'Pitch deck featured SKU: Nutritious Jowar (Sorghum) flour, slow-roasted peanuts, cardamom, and natural jaggery. Absolutely 0% maida, high in dietary fibre.',
    ['Nutritious Jowar Flour', 'Roasted Peanuts', 'Cardamom', 'Natural Jaggery', 'Cold-Pressed Ghee'],
    { spiceLevel: 0, weight: '100g Box', pptHero: true }
  ),

  d(
    'ck-dry-fruit-dates',
    'Dry Fruit & Nuts Super Cookies',
    'cookies',
    159,
    'dessert-05',
    'Pitch deck featured SKU: Loaded with Californian almonds, cashews, and walnuts. Naturally sweetened without refined white sugar. Soft center with crunchy crust.',
    ['Almonds', 'Cashews', 'Walnuts', 'Whole Wheat', 'Natural Sweetener'],
    { spiceLevel: 0, weight: '120g Box', pptHero: true }
  ),

  // ==========================================
  // CHAPTER 5: COOLERS & BEVERAGES (PPT SKUS)
  // ==========================================
  d(
    'bv-gulab-shikanji',
    'Gulab Shikanji Rose Cooler',
    'beverages',
    79,
    'drink-02',
    'Pitch deck featured beverage: Rose flavour, lemon zest, sparkling refreshment with crushed mint. Traditional Sahi cooler formulated for Bhopal afternoons.',
    ['Damask Rose Infusion', 'Lemon Zest', 'Mint Leaves', 'Rock Salt', 'Sparkling Water'],
    { spiceLevel: 0, bestseller: true, weight: '300ml Chilled Bottle', pptHero: true }
  ),

  d(
    'bv-rose-pistachio-milk',
    'Rose Pistachio Milk Shake',
    'beverages',
    99,
    'drink-01',
    'Pitch deck featured beverage: Floral aroma, crushed pistachios, rich chilled milk, and rose petal infusion. Decadent yet soothing.',
    ['Fresh Farm Milk', 'Rose Petal Extract', 'Crushed Pistachios', 'Cardamom', 'Mild Sugar'],
    { spiceLevel: 0, weight: '300ml Chilled Bottle', pptHero: true }
  ),

  d(
    'bv-kesar-elaichi-sip',
    'Kesar Elaichi Golden Milk',
    'beverages',
    109,
    'coffee-01',
    'Pitch deck featured beverage: Saffron goodness, pure cardamom essence, thick and refreshing slow-simmered milk served chilled.',
    ['Slow Simmered Milk', 'Kashmiri Saffron', 'Cardamom Pods', 'Crushed Almonds'],
    { spiceLevel: 0, weight: '300ml Bottle', pptHero: true }
  ),

  d(
    'bv-jamun-masala-cooler',
    'Jamun Masala Chatpata Cooler',
    'beverages',
    89,
    'drink-03',
    'Pitch deck featured beverage: Tangy wild Jamun fruit pulp with a spiced Bhopal chaat twist. Super refreshing antioxidant blast.',
    ['Wild Jamun Pulp', 'Black Salt', 'Roasted Cumin', 'Mint Sprig', 'Lemon'],
    { spiceLevel: 1, weight: '300ml Bottle', pptHero: true }
  ),

  d(
    'bv-mango-saffron-cooler',
    'Mango Saffron Summer Nectar',
    'beverages',
    99,
    'coffee-02',
    'Pitch deck featured beverage: Juicy Malwa mango pulp paired with aromatic saffron threads. Chilled bliss in every sip.',
    ['Juicy Mango Pulp', 'Aromatic Saffron', 'Cold Spring Water', 'Cardamom'],
    { spiceLevel: 0, weight: '300ml Bottle', pptHero: true }
  ),

  // ==========================================
  // CHAPTER 6: GIFT BOXES (BHOPAL HERITAGE)
  // ==========================================
  d(
    'gf-sahi-starter',
    'Sahi Starter Gift Box',
    'gifting',
    499,
    'brand-hero',
    'Deep maroon and gold Bhopal skyline kraft box containing Bhopali Masala Makhana (60g), Bhopali Sahi Nankhatai (140g), and Puffed Rice Sev Mixture (100g).',
    ['Bhopali Masala Makhana', 'Sahi Nankhatai', 'Puffed Rice Sev Mixture', 'Heritage Gift Box'],
    { spiceLevel: 1, weight: '300g Assorted Hamper', pptHero: true }
  ),

  d(
    'gf-royal-feast',
    'Bhopal Sahi Heritage Grand Hamper',
    'gifting',
    899,
    'slide2-card-1',
    'Full Gharelu Hub pitch deck portfolio: 2 Makhana pouches, 2 Nankhatai boxes, Laung Sev, and Jowar Peanut cookies with custom made-on-date greeting card.',
    ['2 × Makhana Packs', '2 × Nankhatai Boxes', 'Laung Sev', 'Jowar Cookies', 'Luxury Gift Box'],
    { spiceLevel: 1, bestseller: true, weight: '650g Luxury Box', pptHero: true }
  ),

  d(
    'gf-corporate-bulk',
    'Corporate Gifting Hamper (Set of 10)',
    'gifting',
    4499,
    'slide2-card-2',
    'Curated for corporate Diwali, investor events, and VIP clients. Premium laser-cut boxes with custom corporate branding and WhatsApp direct tracking.',
    ['10 × Curated Gharelu Hub Gift Boxes', 'Custom Brand Cards', 'Direct Batch Dispatch'],
    { spiceLevel: 1, weight: '10 × 300g Hampers' }
  ),

  // ==========================================
  // CHAPTER 7: RECURRING SUBSCRIPTIONS
  // ==========================================
  d(
    'sb-weekly-box',
    'Weekly Clean Crunch Box',
    'subscriptions',
    349,
    'slide2-card-3',
    'As described in the pitch deck revenue model: Fresh small-batch makhana and healthy cookies delivered directly to your doorstep every week. 1-click renewal on WhatsApp.',
    ['Rotating Makhana Flavours', 'Fresh Bakery Cookie', 'Weekly Batch Timestamp'],
    { spiceLevel: 1, weight: '200g Fresh Weekly Batch', pptHero: true }
  ),

  d(
    'sb-monthly-club',
    'Monthly 1,000-Homes Hub Club',
    'subscriptions',
    1199,
    'slide2-card-4',
    'Join our Bhopal 1,000 seed user community. 4 weekly shipments of fresh roasted snacks, VIP tasting passes at Boat Club weekend stalls, and 15% flat savings.',
    ['4 × Weekly Snack Boxes', 'Exclusive Tasting Passes', 'Free WhatsApp Priority Delivery'],
    { spiceLevel: 1, bestseller: true, weight: '800g Monthly Subscription', pptHero: true }
  ),
];

export const dishesByCategory = (categoryId: string) =>
  dishes.filter((x) => x.category === categoryId);

export const categoryById = (id: string) => categories.find((c) => c.id === id);

export const dishById = (id: string) => dishes.find((x) => x.id === id);
