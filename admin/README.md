# Gharelu Hub — Operations & Admin Control Panel

This document outlines the architecture, setup instructions, and feature guide for the **Gharelu Hub Admin Control Panel**.

---

## 📁 Directory Structure

```
d:/sahi crunch/
├── admin/
│   ├── backend/               # Dedicated Express Admin API server (Port 5001)
│   │   ├── src/
│   │   │   ├── server.ts      # Auth, product CRUD, order pipeline, image uploads, stats
│   │   │   ├── db.ts          # Shared JSON DB persistence layer
│   │   │   └── menuData.ts    # Seed catalog & categories
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── .env
│   └── frontend/              # High-performance React + Vite + Tailwind Admin Panel (Port 3001)
│       ├── src/
│       │   ├── App.tsx             # Responsive dashboard layout & sidebar navigation
│       │   ├── Login.tsx           # Secure admin authentication screen
│       │   ├── DashboardOverview.tsx # Real-time metrics & financial analytics
│       │   ├── ProductsView.tsx    # Live catalog CRUD, image uploads, stock toggle
│       │   ├── OrdersView.tsx      # Multi-stage live dispatch pipeline (0–6 stages)
│       │   ├── ReservationsView.tsx# VIP table & tasting passes manager
│       │   ├── UsersView.tsx       # Customer directory, veg mode preferences & contacts
│       │   ├── adminApi.ts         # Type-safe API client
│       │   └── types.ts            # TypeScript interfaces
│       ├── vite.config.ts          # Reverse proxy to admin backend (5001)
│       └── package.json
├── backend/                   # Customer Store API Server (Port 5000)
│   └── data/
│       └── gharelu-hub-db.json# Single source of truth database
└── frontend/                  # Next.js Customer Web App (Port 3000)
```

---

## 🔐 Admin Authentication Credentials

- **Admin URL:** `http://localhost:3001`
- **Default Email:** `admin@ghareluhub.in`
- **Default Master Key / Password:** `admin123`

---

## 🚀 Running the System

You can run each component independently or everything together:

### Run Admin Stack (Backend + Frontend):
```bash
npm run dev:admin
```
- Starts Admin Backend on `http://localhost:5001`
- Starts Admin Frontend on `http://localhost:3001`

### Run Everything Simultaneously (Store + Admin):
```bash
npm run dev:all
```
- Customer Store Backend: `http://localhost:5000`
- Customer Store Web App: `http://localhost:3000`
- Admin API: `http://localhost:5001`
- Admin Dashboard UI: `http://localhost:3001`

---

## 🛠️ Admin Features

1. **Dashboard Overview:**
   - Real-time platform revenue tracking (INR ₹)
   - Live order counts, pending kitchen batches, and active passes
   - Category distribution analysis

2. **Snacks & Product Catalog (Full CRUD):**
   - **Add New Snack:** Enter title, category, price, weight, spice level, and ingredients.
   - **Image Upload:** Upload product photos or select existing images.
   - **Instant Edit:** Change price, weight, descriptions, and hero tags.
   - **One-Click Stock Toggle:** Switch items between "In Stock / Live" and "Sold Out".
   - **Instant Website Sync:** Any change made in Admin immediately updates the customer menu.

3. **Live Orders & Dispatch Pipeline:**
   - Track incoming customer orders by code (e.g., `#GH-...`)
   - 7-Stage pipeline status controls:
     `Order Received` ➔ `Woodfire Roasting` ➔ `Heritage Spice Toss` ➔ `Packed & Stamped` ➔ `Rider Out for Delivery` ➔ `At Your Doorstep` ➔ `Completed`
   - Filter by fulfillment type: Delivery, Takeaway, Dine-in

4. **VIP Tasting Passes & Table Reservations:**
   - View requested weekend tasting slots and guest counts
   - Confirm passes or cancel bookings with 1 click

5. **Customer Accounts & Loyalty Directory:**
   - View customer name, phone number, email address, dietary preferences (100% Pure Veg badge), and saved delivery addresses.
