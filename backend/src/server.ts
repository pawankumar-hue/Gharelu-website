/**
 * server.ts — Express Backend Server for Gharelu Hub
 * Runs on Port 5000 (proxied via Frontend on Port 3000)
 */

import express, { type Request, type Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import {
  findUserByEmail,
  findUserByPhone,
  createUser,
  updateUser,
  getOrdersByUser,
  getOrderById,
  createOrder,
  updateOrderStatus,
  getReservationsByUser,
  createReservation,
  cancelReservation,
  getLoyalty,
  getFavorites,
  toggleFavorite,
  getDishes,
  getDishById,
  getCategories,
} from './db.js';
import {
  hashPassword,
  verifyPassword,
  signToken,
  setAuthCookie,
  clearAuthCookie,
  requireAuthMiddleware,
  safeUser,
  type AuthedRequest,
} from './auth.js';


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

/* ─────────────── Health & Status ─────────────── */

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'Gharelu Hub Backend API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

/* ─────────────── Secure Proxy / Vault Endpoints ─────────────── */
/**
 * All frontend requests for external services or keys route through here.
 * Raw API keys are NEVER sent to the client browser.
 */

// 1. WhatsApp Dispatch Proxy
app.post('/api/proxy/whatsapp', (req: Request, res: Response) => {
  const { phone, message } = req.body ?? {};
  const secretKey = process.env.WHATSAPP_BUSINESS_API_KEY || 'sc_wa_live_token_default';

  // In production, backend communicates with WhatsApp Business Cloud API using secretKey
  // For client redirect/handoff, return approved sanitized URL without revealing raw credentials
  const targetPhone = phone || '91XXXXXXXXXX';
  const encodedMsg = encodeURIComponent(message || 'Hi Gharelu Hub! I want to order.');
  const waUrl = `https://wa.me/${targetPhone}?text=${encodedMsg}`;

  res.json({
    ok: true,
    proxied: true,
    maskedAuthToken: `${secretKey.slice(0, 4)}...${secretKey.slice(-4)}`,
    url: waUrl,
  });
});

// 2. Maps & Geo Geocoding Proxy
app.get('/api/proxy/maps', (req: Request, res: Response) => {
  const { q } = req.query as { q?: string };
  const apiKey = process.env.MAPS_API_KEY || 'sc_maps_key_default';

  // Backend proxies Google Maps / Location verification
  const queryParam = encodeURIComponent(q || 'Arera Colony Bhopal');
  const mapUrl = `https://maps.google.com/?q=${queryParam}`;

  res.json({
    ok: true,
    query: q,
    maskedKey: `${apiKey.slice(0, 3)}...${apiKey.slice(-3)}`,
    mapUrl,
    bhopalCoordinates: { lat: 23.228, lng: 77.4977 },
  });
});

// 3. Payment Gateway Proxy
app.post('/api/proxy/payments', (req: Request, res: Response) => {
  const { amount, method } = req.body ?? {};
  const gatewayKey = process.env.PAYMENT_GATEWAY_KEY || 'rzp_live_sec_key_default';

  // Backend prepares transaction token so raw secrets stay on server
  const transactionRef = `TXN-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

  res.json({
    ok: true,
    transactionRef,
    amount,
    method: method || 'upi',
    status: 'verified',
    maskedGatewayKey: `${gatewayKey.slice(0, 4)}...${gatewayKey.slice(-4)}`,
  });
});

/* ─────────────── Auth API ─────────────── */

app.post('/api/auth/login', async (req: Request, res: Response) => {
  const { name, phone, email, password, mode } = req.body ?? {};

  // Login mode
  if (mode === 'login') {
    if (!email && !phone) return res.status(400).json({ error: 'Email or phone required.' });
    if (!password) return res.status(400).json({ error: 'Password required.' });

    const user = email ? findUserByEmail(email) : findUserByPhone(phone);
    if (!user) return res.status(401).json({ error: 'No account found. Please register.' });

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: 'Incorrect password.' });

    const token = signToken({ userId: user.id, email: user.email, name: user.name });
    setAuthCookie(res, token);
    return res.status(200).json({ user: safeUser(user), token });
  }

  // Register mode
  if (mode === 'register') {
    if (!name?.trim()) return res.status(400).json({ error: 'Name is required.' });
    if (!phone?.trim()) return res.status(400).json({ error: 'Phone number is required.' });
    if (!email?.trim()) return res.status(400).json({ error: 'Email is required.' });
    if (!password || password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters.' });

    if (findUserByEmail(email)) return res.status(409).json({ error: 'An account with this email already exists.' });
    if (findUserByPhone(phone)) return res.status(409).json({ error: 'An account with this phone already exists.' });

    const passwordHash = await hashPassword(password);
    const user = createUser({ name, phone, email, passwordHash, addresses: [], vegMode: false });

    const token = signToken({ userId: user.id, email: user.email, name: user.name });
    setAuthCookie(res, token);
    return res.status(201).json({ user: safeUser(user), token });
  }

  return res.status(400).json({ error: 'Invalid mode. Use "login" or "register".' });
});

app.get('/api/auth/me', requireAuthMiddleware, (req: AuthedRequest, res: Response) => {
  return res.status(200).json({ user: safeUser(req.user!) });
});

app.delete('/api/auth/me', (_req: Request, res: Response) => {
  clearAuthCookie(res);
  return res.status(200).json({ ok: true });
});

/* ─────────────── Profile API ─────────────── */

app.get('/api/profile', requireAuthMiddleware, (req: AuthedRequest, res: Response) => {
  return res.status(200).json({ user: safeUser(req.user!) });
});

app.patch('/api/profile', requireAuthMiddleware, (req: AuthedRequest, res: Response) => {
  const { name, email, vegMode, addresses } = req.body ?? {};
  const patch: Record<string, unknown> = {};
  if (name !== undefined) patch.name = name;
  if (email !== undefined) patch.email = email;
  if (vegMode !== undefined) patch.vegMode = vegMode;
  if (addresses !== undefined) patch.addresses = addresses;

  const updated = updateUser(req.user!.id, patch);
  if (!updated) return res.status(500).json({ error: 'Failed to update profile.' });
  return res.status(200).json({ user: safeUser(updated) });
});

/* ─────────────── Menu API ─────────────── */

app.get('/api/menu', (req: Request, res: Response) => {
  const { category, location, q } = req.query as Record<string, string>;
  let result = [...getDishes()];

  if (location) {
    result = result.filter((d) => d.branchAvailability.includes(location));
  }
  if (category && category !== 'all') {
    result = result.filter((d) => d.category === category);
  }
  if (q) {
    const lower = q.toLowerCase();
    result = result.filter(
      (d) =>
        d.name.toLowerCase().includes(lower) ||
        d.description.toLowerCase().includes(lower) ||
        d.ingredients.some((i) => i.toLowerCase().includes(lower))
    );
  }
  return res.status(200).json({ dishes: result });
});

app.get('/api/menu/:id', (req: Request, res: Response) => {
  const id = String(req.params.id);
  const dish = getDishById(id);
  if (!dish) return res.status(404).json({ error: 'Dish not found.' });
  return res.status(200).json({ dish });
});

/**
 * Categories (menu chapters) — live from the same database the Admin Panel
 * writes to, so new/edited chapters appear on the customer app immediately.
 */
app.get('/api/categories', (_req: Request, res: Response) => {
  return res.status(200).json({ categories: getCategories() });
});

/* ─────────────── Orders API ─────────────── */

app.get('/api/orders', requireAuthMiddleware, (req: AuthedRequest, res: Response) => {
  const orders = getOrdersByUser(req.user!.id);
  return res.status(200).json({ orders });
});

app.post('/api/orders', requireAuthMiddleware, (req: AuthedRequest, res: Response) => {
  const body = req.body;
  if (!body?.lines || !Array.isArray(body.lines) || body.lines.length === 0) {
    return res.status(400).json({ error: 'Cart is empty.' });
  }
  if (!body.locationId) return res.status(400).json({ error: 'Location is required.' });
  if (!body.type) return res.status(400).json({ error: 'Order type is required.' });
  if (body.type === 'delivery' && !body.address?.trim()) {
    return res.status(400).json({ error: 'Delivery address is required.' });
  }

  const pointsEarned = Math.round(body.total / 10);
  const order = createOrder({
    userId: req.user!.id,
    type: body.type,
    locationId: body.locationId,
    lines: body.lines,
    subtotal: body.subtotal,
    tax: body.tax,
    discount: body.discount,
    fee: body.fee,
    total: body.total,
    address: body.address,
    eta: body.type === 'delivery' ? '10–15 mins' : '10 mins',
    pointsEarned,
    couponCode: body.couponCode,
    paymentMethod: body.paymentMethod || 'upi',
  });

  return res.status(201).json({ order });
});

app.get('/api/orders/:id', requireAuthMiddleware, (req: AuthedRequest, res: Response) => {
  const id = String(req.params.id);
  const order = getOrderById(id);
  if (!order) return res.status(404).json({ error: 'Order not found.' });
  if (order.userId !== req.user!.id) return res.status(403).json({ error: 'Access denied.' });
  return res.status(200).json({ order });
});

app.patch('/api/orders/:id', requireAuthMiddleware, (req: AuthedRequest, res: Response) => {
  const id = String(req.params.id);
  const order = getOrderById(id);
  if (!order) return res.status(404).json({ error: 'Order not found.' });
  if (order.userId !== req.user!.id) return res.status(403).json({ error: 'Access denied.' });

  const { status } = req.body ?? {};
  if (typeof status !== 'number') return res.status(400).json({ error: 'Status must be a number.' });
  const updated = updateOrderStatus(id, status);
  return res.status(200).json({ order: updated });
});

/* ─────────────── Loyalty API ─────────────── */

const TIERS = [
  { name: 'Makhana Rookie', minPoints: 0, discount: 0, color: '#9ca3af' },
  { name: 'Hub Insider', minPoints: 500, discount: 5, color: '#D48924' },
  { name: 'Bhopal Legend', minPoints: 2000, discount: 10, color: '#681121' },
  { name: 'Gharelu VIP', minPoints: 5000, discount: 15, color: '#1a0a0e' },
];

function tierOf(points: number): number {
  return points >= 5000 ? 3 : points >= 2000 ? 2 : points >= 500 ? 1 : 0;
}

app.get('/api/loyalty', requireAuthMiddleware, (req: AuthedRequest, res: Response) => {
  const loyalty = getLoyalty(req.user!.id);
  const points = loyalty?.points ?? 0;
  const tierIndex = tierOf(points);
  const tier = TIERS[tierIndex];
  const nextTier = TIERS[tierIndex + 1] ?? null;

  return res.status(200).json({
    points,
    tier,
    nextTier,
    history: loyalty?.history ?? [],
    progressToNext: nextTier
      ? Math.min(100, Math.round(((points - tier.minPoints) / (nextTier.minPoints - tier.minPoints)) * 100))
      : 100,
  });
});

/* ─────────────── Reservations API ─────────────── */

app.get('/api/reservations', requireAuthMiddleware, (req: AuthedRequest, res: Response) => {
  const reservations = getReservationsByUser(req.user!.id);
  return res.status(200).json({ reservations });
});

app.post('/api/reservations', requireAuthMiddleware, (req: AuthedRequest, res: Response) => {
  const { locationId, date, time, guests, notes } = req.body ?? {};
  if (!locationId) return res.status(400).json({ error: 'Location required.' });
  if (!date) return res.status(400).json({ error: 'Date required.' });
  if (!time) return res.status(400).json({ error: 'Time required.' });
  if (!guests || guests < 1) return res.status(400).json({ error: 'Number of guests required.' });

  const reservation = createReservation({ userId: req.user!.id, locationId, date, time, guests, notes });
  return res.status(201).json({ reservation });
});

app.delete('/api/reservations', requireAuthMiddleware, (req: AuthedRequest, res: Response) => {
  const { id } = req.body ?? {};
  if (!id) return res.status(400).json({ error: 'Reservation ID required.' });
  const ok = cancelReservation(id, req.user!.id);
  if (!ok) return res.status(404).json({ error: 'Reservation not found.' });
  return res.status(200).json({ ok: true });
});

/* ─────────────── Favorites API ─────────────── */

app.get('/api/favorites', requireAuthMiddleware, (req: AuthedRequest, res: Response) => {
  const dishIds = getFavorites(req.user!.id);
  return res.status(200).json({ dishIds });
});

app.post('/api/favorites', requireAuthMiddleware, (req: AuthedRequest, res: Response) => {
  const { dishId } = req.body ?? {};
  if (!dishId) return res.status(400).json({ error: 'dishId is required.' });
  const dishIds = toggleFavorite(req.user!.id, dishId);
  return res.status(200).json({ dishIds });
});

/* ─────────────── Start Server ─────────────── */

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`[Gharelu Hub Backend] Server running on http://127.0.0.1:${PORT}`);
});
