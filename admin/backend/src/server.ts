/**
 * server.ts — Dedicated Admin Backend for Gharelu Hub Control Panel
 * Runs on Port 5001
 * Provides full control over:
 * - Products/Dishes (Create, Read, Update, Delete, Toggle Availability, Update Image/Price/Tags)
 * - Orders (Track live orders, Update statuses, Filter by branch/type, Revenue Analytics)
 * - Reservations / Tasting Passes (Track, Confirm, Cancel)
 * - Users / Customers (View details, phone, email, veg preference, loyalty points)
 * - Business Analytics & Health Stats
 * - Image Uploads & File Management
 */

import express, { type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Shared database logic
import {
  loadDB,
  saveDB,
  getAllUsers,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  getAllReservations,
  updateReservationStatus,
  getDishes,
  getDishById,
  addDish,
  updateDish,
  deleteDish,
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  type DBOrder,
  type DBUser,
  type DBReservation,
} from './db.js';
import { type Dish } from './menuData.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..', '..');

const app = express();
const PORT = process.env.PORT || 5001;
const JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'gharelu_hub_admin_super_secret_jwt_key_2026';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@ghareluhub.in';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

// Setup uploads folder inside frontend public/images/products and frontend public/images
const PUBLIC_IMG_DIR = path.join(PROJECT_ROOT, 'frontend', 'public', 'images');
const UPLOAD_DIR = path.join(PUBLIC_IMG_DIR, 'products');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Middleware
app.use(cors({ origin: true, credentials: true }));
// Support large JSON bodies (e.g. for base64 image uploads)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static images serving
app.use('/images', express.static(PUBLIC_IMG_DIR));

/* ─────────────── Admin Auth Middleware ─────────────── */

interface AdminPayload {
  role: 'admin';
  email: string;
}

export interface AdminAuthedRequest extends Request {
  admin?: AdminPayload;
}

function requireAdminAuth(req: AdminAuthedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid admin authorization token.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AdminPayload;
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Insufficient administrative privileges.' });
    }
    req.admin = decoded;
    return next();
  } catch {
    return res.status(401).json({ error: 'Expired or invalid admin session.' });
  }
}

/* ─────────────── Health & Auth Routes ─────────────── */

app.get('/api/admin/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'Gharelu Hub Admin Control Panel Backend',
    version: '1.0.0',
    port: PORT,
    timestamp: new Date().toISOString(),
  });
});

app.post('/api/admin/login', (req: Request, res: Response) => {
  const { email, password } = req.body ?? {};

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  // Check admin credentials
  if (email.toLowerCase() === ADMIN_EMAIL.toLowerCase() && password === ADMIN_PASSWORD) {
    const token = jwt.sign({ email, role: 'admin' }, JWT_SECRET, { expiresIn: '7d' });
    return res.json({
      ok: true,
      token,
      admin: {
        email,
        name: 'Gharelu Hub Super Admin',
        role: 'admin',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      },
    });
  }

  return res.status(401).json({ error: 'Invalid admin credentials. Please verify your email and password.' });
});

app.get('/api/admin/me', requireAdminAuth, (req: AdminAuthedRequest, res: Response) => {
  res.json({
    ok: true,
    admin: {
      email: req.admin?.email,
      name: 'Gharelu Hub Super Admin',
      role: 'admin',
    },
  });
});

/* ─────────────── Dashboard Overview & Stats ─────────────── */

app.get('/api/admin/stats', requireAdminAuth, (_req: AdminAuthedRequest, res: Response) => {
  const db = loadDB();
  const orders = db.orders || [];
  const users = db.users || [];
  const reservations = db.reservations || [];
  const dishes = getDishes();

  const totalRevenue = orders.reduce((acc, o) => acc + (o.total || 0), 0);
  const pendingOrders = orders.filter((o) => o.status < 4).length;
  const completedOrders = orders.filter((o) => o.status >= 4).length;
  const activeDishesCount = dishes.filter((d) => d.available).length;
  const upcomingReservations = reservations.filter((r) => r.status === 'confirmed').length;

  // Recent activity calculations
  const recentOrders = orders.slice(0, 5);

  // Group by category counts
  const categoryCounts: Record<string, number> = {};
  dishes.forEach((d) => {
    categoryCounts[d.category] = (categoryCounts[d.category] || 0) + 1;
  });

  return res.json({
    metrics: {
      totalRevenue,
      totalOrders: orders.length,
      pendingOrders,
      completedOrders,
      totalUsers: users.length,
      totalDishes: dishes.length,
      activeDishesCount,
      totalReservations: reservations.length,
      upcomingReservations,
    },
    categoryDistribution: categoryCounts,
    recentOrders,
  });
});

/* ─────────────── Products / Dishes CRUD ─────────────── */

// 1. Get all products with filters
app.get('/api/admin/products', requireAdminAuth, (req: AdminAuthedRequest, res: Response) => {
  const { category, search, available } = req.query as Record<string, string>;
  let list = getDishes();

  if (category && category !== 'all') {
    list = list.filter((d) => d.category === category);
  }
  if (available !== undefined && available !== '') {
    const isAvail = available === 'true';
    list = list.filter((d) => d.available === isAvail);
  }
  if (search) {
    const term = search.toLowerCase();
    list = list.filter(
      (d) =>
        d.name.toLowerCase().includes(term) ||
        d.id.toLowerCase().includes(term) ||
        d.description.toLowerCase().includes(term)
    );
  }

  res.json({ products: list, categories: getCategories() });
});

// 2. Get single product
app.get('/api/admin/products/:id', requireAdminAuth, (req: AdminAuthedRequest, res: Response) => {
  const dish = getDishById(String(req.params.id));
  if (!dish) return res.status(404).json({ error: 'Product not found.' });
  res.json({ product: dish });
});

// 3. Create new product
app.post('/api/admin/products', requireAdminAuth, (req: AdminAuthedRequest, res: Response) => {
  const body = req.body;
  if (!body.name || !body.category || body.price === undefined) {
    return res.status(400).json({ error: 'Name, Category and Price are mandatory.' });
  }

  // Generate ID if missing
  const slug = (body.id || body.name)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  const id = slug || `dish-${Date.now()}`;

  const newDish: Dish = {
    id,
    name: body.name,
    category: body.category,
    price: Number(body.price),
    description: body.description || '',
    image: body.image || 'mk-bhopali-masala',
    ingredients: Array.isArray(body.ingredients)
      ? body.ingredients
      : typeof body.ingredients === 'string'
      ? body.ingredients.split(',').map((s: string) => s.trim()).filter(Boolean)
      : [],
    dietaryTags: Array.isArray(body.dietaryTags)
      ? body.dietaryTags
      : typeof body.dietaryTags === 'string'
      ? body.dietaryTags.split(',').map((s: string) => s.trim()).filter(Boolean)
      : ['100% Preservative-Free', 'Pure Veg', '48h Fresh'],
    spiceLevel: body.spiceLevel !== undefined ? Number(body.spiceLevel) as (0|1|2|3) : 1,
    veg: body.veg !== undefined ? Boolean(body.veg) : true,
    bestseller: Boolean(body.bestseller),
    available: body.available !== undefined ? Boolean(body.available) : true,
    branchAvailability: Array.isArray(body.branchAvailability) && body.branchAvailability.length > 0
      ? body.branchAvailability
      : ['bhopal-main'],
    weight: body.weight || '50g Stand-up Pouch',
    shelfLife: body.shelfLife || '48h Fresh Stamped',
    fresh: body.fresh !== undefined ? Boolean(body.fresh) : true,
    pptHero: Boolean(body.pptHero),
  };

  const created = addDish(newDish);
  res.status(201).json({ ok: true, product: created, message: 'Product successfully added!' });
});

// 4. Update product
app.put('/api/admin/products/:id', requireAdminAuth, (req: AdminAuthedRequest, res: Response) => {
  const { id } = req.params;
  const patch = req.body;

  // Format array fields if passed as strings
  if (patch.ingredients && typeof patch.ingredients === 'string') {
    patch.ingredients = patch.ingredients.split(',').map((s: string) => s.trim()).filter(Boolean);
  }
  if (patch.dietaryTags && typeof patch.dietaryTags === 'string') {
    patch.dietaryTags = patch.dietaryTags.split(',').map((s: string) => s.trim()).filter(Boolean);
  }
  if (patch.price !== undefined) {
    patch.price = Number(patch.price);
  }

  const updated = updateDish(String(id), patch);
  if (!updated) return res.status(404).json({ error: 'Product not found to update.' });

  res.json({ ok: true, product: updated, message: 'Product updated successfully!' });
});

// 5. Toggle availability fast
app.patch('/api/admin/products/:id/toggle', requireAdminAuth, (req: AdminAuthedRequest, res: Response) => {
  const id = String(req.params.id);
  const dish = getDishById(id);
  if (!dish) return res.status(404).json({ error: 'Product not found.' });

  const updated = updateDish(id, { available: !dish.available });
  res.json({ ok: true, product: updated });
});

// 6. Delete product
app.delete('/api/admin/products/:id', requireAdminAuth, (req: AdminAuthedRequest, res: Response) => {
  const id = String(req.params.id);
  const ok = deleteDish(id);
  if (!ok) return res.status(404).json({ error: 'Product not found to delete.' });

  res.json({ ok: true, message: `Product ${id} has been deleted.` });
});

// 7. Upload Image endpoint (Handles Base64 image payload from admin)
app.post('/api/admin/upload-image', requireAdminAuth, (req: AdminAuthedRequest, res: Response) => {
  const { dataUrl, filename } = req.body;
  if (!dataUrl || !filename) {
    return res.status(400).json({ error: 'Missing dataUrl or filename.' });
  }

  try {
    const matches = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ error: 'Invalid base64 data URL format.' });
    }

    const buffer = Buffer.from(matches[2], 'base64');
    const safeName = filename.replace(/[^a-zA-Z0-9_.-]/g, '_');
    const ext = path.extname(safeName) || '.webp';
    const base = path.basename(safeName, ext);
    const targetFilename = `${base}-${Date.now()}${ext}`;
    const targetPath = path.join(UPLOAD_DIR, targetFilename);

    fs.writeFileSync(targetPath, buffer);

    // Return the image path that can be used directly
    const relativeUrl = `/images/products/${targetFilename}`;
    res.json({ ok: true, imageUrl: relativeUrl, filename: targetFilename });
  } catch (err: any) {
    res.status(500).json({ error: `Failed to upload image: ${err.message}` });
  }
});

/* ─────────────── Orders Management ─────────────── */

app.get('/api/admin/orders', requireAdminAuth, (req: AdminAuthedRequest, res: Response) => {
  const { status, type, locationId } = req.query as Record<string, string>;
  let list = getAllOrders();

  if (status !== undefined && status !== '') {
    const num = Number(status);
    list = list.filter((o) => o.status === num);
  }
  if (type) {
    list = list.filter((o) => o.type === type);
  }
  if (locationId) {
    list = list.filter((o) => o.locationId === locationId);
  }

  res.json({ orders: list });
});

app.get('/api/admin/orders/:id', requireAdminAuth, (req: AdminAuthedRequest, res: Response) => {
  const order = getOrderById(String(req.params.id));
  if (!order) return res.status(404).json({ error: 'Order not found.' });
  res.json({ order });
});

app.patch('/api/admin/orders/:id/status', requireAdminAuth, (req: AdminAuthedRequest, res: Response) => {
  const { status } = req.body;
  if (status === undefined || typeof status !== 'number') {
    return res.status(400).json({ error: 'Status index number is required (0 to 6).' });
  }

  const updated = updateOrderStatus(String(req.params.id), status);
  if (!updated) return res.status(404).json({ error: 'Order not found.' });

  res.json({ ok: true, order: updated });
});

/* ─────────────── Reservations Management ─────────────── */

app.get('/api/admin/reservations', requireAdminAuth, (_req: AdminAuthedRequest, res: Response) => {
  const list = getAllReservations();
  res.json({ reservations: list });
});

app.patch('/api/admin/reservations/:id/status', requireAdminAuth, (req: AdminAuthedRequest, res: Response) => {
  const { status } = req.body;
  if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
    return res.status(400).json({ error: 'Invalid reservation status.' });
  }

  const updated = updateReservationStatus(String(req.params.id), status);
  if (!updated) return res.status(404).json({ error: 'Reservation not found.' });

  res.json({ ok: true, reservation: updated });
});

/* ─────────────── Users / Customers ─────────────── */

app.get('/api/admin/users', requireAdminAuth, (_req: AdminAuthedRequest, res: Response) => {
  const users = getAllUsers().map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    addresses: u.addresses,
    vegMode: u.vegMode,
    createdAt: u.createdAt,
  }));
  res.json({ users });
});

/* ─────────────── Categories Management ─────────────── */

app.get('/api/admin/categories', requireAdminAuth, (_req: AdminAuthedRequest, res: Response) => {
  const dishes = getDishes();
  const categories = getCategories().map((c) => ({
    ...c,
    count: dishes.filter((d) => d.category === c.id).length,
  }));
  res.json({ categories });
});

app.post('/api/admin/categories', requireAdminAuth, (req: AdminAuthedRequest, res: Response) => {
  const { id, name, eyebrow, line, archetype, tint } = req.body;
  if (!name || !id) return res.status(400).json({ error: 'ID and Name are required.' });

  const category = addCategory({
    id: id.toLowerCase().trim(),
    name,
    eyebrow: eyebrow || 'Chapter 08',
    line: line || '',
    archetype: archetype || 'bowl',
    tint: tint || '#8b1a1a',
  });

  res.status(201).json({ ok: true, category });
});

// Update an existing menu chapter (name, subtitle, tint, numbering…)
app.put('/api/admin/categories/:id', requireAdminAuth, (req: AdminAuthedRequest, res: Response) => {
  const { name, eyebrow, line, archetype, tint } = req.body;
  const updated = updateCategory(String(req.params.id), { name, eyebrow, line, archetype, tint });
  if (!updated) return res.status(404).json({ error: 'Chapter not found to update.' });
  res.json({ ok: true, category: updated });
});

// Delete a chapter — only when no products are filed under it
app.delete('/api/admin/categories/:id', requireAdminAuth, (req: AdminAuthedRequest, res: Response) => {
  const result = deleteCategory(String(req.params.id));
  if (!result.ok) {
    if (result.productsUsing) {
      return res.status(409).json({
        error: `This chapter still holds ${result.productsUsing} product(s). Reassign or delete them first.`,
      });
    }
    return res.status(404).json({ error: 'Chapter not found to delete.' });
  }
  res.json({ ok: true, message: `Chapter ${req.params.id} has been deleted.` });
});

/* ─────────────── Start Admin Server ─────────────── */

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`[Gharelu Hub Admin Backend] 👑 Control Panel Server listening on http://127.0.0.1:${PORT}`);
});
