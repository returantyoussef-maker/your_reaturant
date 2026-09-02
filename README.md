# 🍽️ Restaurant Ordering & Management System (SaaS Ready)

A complete, production-ready digital menu and restaurant management platform. It allows customers to browse items and place orders via web or QR codes, while providing restaurant staff with a real-time management dashboard, automated thermal receipt printing via **QZ Tray**, and robust staff permission controls.

**Who this is for:** restaurant owners who want an online/QR menu with live order tracking, cashiers who need automatic receipt printing, and developers who need to install, configure, and deploy the platform.

### Key Capabilities at a Glance
- 📱 No-login customer ordering via web link or table QR code
- 🧾 Automatic thermal receipt printing (no manual "print" click needed)
- 🔔 Real-time order board with sound alerts for staff
- 🎨 No-code branding (logo, colors, fonts, restaurant name)
- 🧑‍🤝‍🧑 Three-tier staff permission system (Super Admin / Admin / Delivery)
- 🚚 Configurable delivery zones with per-zone fees
- 🏷️ Coupons, discounts, and promo codes
- ⚙️ Production-ready with PM2 clustering and Socket.io real-time sync

---

# 📋 Table of Contents

- [SECTION 1: User Guide for Restaurant Staff & Management](#section-1-user-guide-for-restaurant-staff--management)
  - [1. System Overview](#1-system-overview)
  - [2. Customer Experience & Ordering](#2-customer-experience--ordering)
  - [3. Administrator Setup & Login](#3-administrator-setup--login)
  - [4. Dashboard Features & Operations](#4-dashboard-features--operations)
  - [5. Thermal Receipt Printing (QZ Tray Guide)](#5-thermal-receipt-printing-qz-tray-guide)
  - [6. Roles & Staff Permissions](#6-roles--staff-permissions)
  - [7. Security Best Practices (Daily Operations)](#7-security-best-practices-daily-operations)
- [SECTION 2: Developer & Technical Documentation](#section-2-developer--technical-documentation)
  - [8. Tech Stack & Prerequisites](#8-tech-stack--prerequisites)
  - [9. Installation & Local Setup](#9-installation--local-setup)
  - [10. Environment Variables (.env)](#10-environment-variables-env)
  - [11. Production Deployment with PM2 (Cluster Mode)](#11-production-deployment-with-pm2-cluster-mode)
  - [12. Project Architecture & Directory Structure](#12-project-architecture--directory-structure)
  - [13. REST API Reference](#13-rest-api-reference)
  - [14. Socket.io & Multi-Worker State Management](#14-socketio--multi-worker-state-management)
  - [15. Backup & Maintenance](#15-backup--maintenance)
  - [16. Production Readiness Checklist](#16-production-readiness-checklist)
  - [17. Troubleshooting Guide & FAQ](#17-troubleshooting-guide--faq)

---

# SECTION 1: User Guide for Restaurant Staff & Management

## 1. System Overview

This platform provides two main interfaces:

1. **Public Storefront** — where customers browse the menu, select items, and place orders (Dine-in, Takeaway, or Delivery). No customer account or login is required.
2. **Management Dashboard** — a private, password-protected area for restaurant owners, managers, and staff to handle daily orders, adjust prices, edit categories, control tables, manage delivery zones, and track sales.

### How the two sides connect
Every action a customer takes on the storefront (placing an order, for example) is pushed **instantly** to the dashboard using a real-time connection (Socket.io / WebSockets) — staff do not need to refresh the page to see a new order arrive. Likewise, if staff hide an item because it's out of stock, that item disappears from the customer menu immediately.

---

## 2. Customer Experience & Ordering

Customers do not need to create an account or log in to browse or order. They can access the menu in two ways:

- **Direct link:** visiting the restaurant's web address on any mobile or desktop browser.
- **QR Code:** scanning a code printed and placed on a physical table (for Dine-in orders). Scanning this code automatically pre-fills the customer's table number, so they don't have to type it manually.

### Ordering Workflow (step by step):

1. **Browse Categories** — Customers filter the menu by category (e.g., meals, drinks, desserts) or view special/highlighted offers.
2. **Customize & Add to Cart** — For each item, customers can select the quantity and any available options or add-ons (e.g., size, extra toppings, spice level, notes). The running total updates live as items are added.
3. **Checkout — Choose Order Type:**
   - **Dine-In:** The customer selects a table number, unless it was already pre-filled by scanning a QR code.
   - **Takeaway:** The customer enters their name and phone number so staff can call them when the order is ready.
   - **Delivery:** The customer selects their delivery area from a list, enters their address and phone number, and sees the delivery fee calculated automatically based on the zone they chose.
4. **Order Confirmation & Invoicing** — Once submitted, the customer instantly receives a digital invoice on-screen. This invoice includes:
   - A unique **order tracking ID** (so the customer or staff can reference this specific order later).
   - A **verification QR code** on the invoice itself, which can be scanned by staff to quickly pull up the order details (useful for delivery hand-off or dine-in verification).

> 💡 **Tip for staff:** because orders arrive on the dashboard the instant they're placed, there is no need for customers to "wait for confirmation" — the kitchen typically sees the order within a second or two of submission.

---

## 3. Administrator Setup & Login

The administration interface is intentionally **not linked from the public menu** for security reasons — it is only reachable if you know the direct URL.

- **Access Link:** `http://your-domain.com/admin_restaurant_food`

### First-Time Initialization (Creating the Super Admin)

This is a **one-time setup step** that happens only once, the very first time the system is used on a fresh database.

1. Open the access link above in your web browser.
2. Because no Super Admin account exists yet in the database, the system automatically detects this and displays a **Bootstrap Registration Form** instead of a login form.
3. Fill in your full name, email address, phone number, and choose a secure password.
4. Upon submission, this account is automatically granted the **Super Admin** role — the highest permission level in the system.

> 🔒 **Security Note — read carefully:** Once the first Super Admin account is created, the bootstrap registration route is **permanently and automatically locked** and can never be reopened through the browser. This is intentional, to prevent anyone else from creating an unauthorized top-level account later. From that point forward, **every additional staff account** (Admin, Delivery, or another Super Admin) must be created manually by an existing Super Admin from inside the "Staff & Security" section of the dashboard — not through the public URL.

### Logging In After Setup
Once a Super Admin exists, visiting the access link will show a normal **login form** (email + password) instead of the registration form. Staff accounts created afterward (Admins, Delivery staff) log in through this same link, and the dashboard automatically shows only the sections that match their assigned role.

---

## 4. Dashboard Features & Operations

| Section | Capabilities & Usage |
| :--- | :--- |
| **Orders Management** | A live board showing incoming orders in real time, with an audible sound alert whenever a new order arrives (so staff don't need to keep the screen in view). Staff move each order through its lifecycle by updating its status: `Received` → `Preparing` → `Ready` → `Delivered`. |
| **Menu & Products** | Add new menu items, upload photos for each item, set or update prices, edit descriptions, and temporarily hide out-of-stock items from the customer menu **without permanently deleting them** (so they can be brought back with one click once restocked). |
| **Categories** | Organize the overall menu structure into logical groups (e.g., Appetizers, Main Course, Beverages, Desserts) so customers can filter and browse more easily. |
| **Tables & QR Codes** | Generate printable QR code cards for every physical table in the dining area. Each QR code is unique per table, so scanning it automatically tells the system (and the customer's order) which table the order belongs to. |
| **Delivery Zones** | Define named delivery regions (e.g., by neighborhood) and assign a specific delivery fee to each zone, which is calculated automatically for the customer at checkout. |
| **Coupons & Discounts** | Create promo codes offering either a percentage discount (e.g., 10% off) or a fixed-amount discount (e.g., $5 off), and set expiry dates or usage limits for each code. |
| **Customer Reviews** | View and monitor feedback and star ratings left by customers, and moderate (approve/hide) which reviews are publicly visible on the storefront. |
| **Site Design & Branding** | Change the restaurant's display name, primary/secondary color scheme, fonts, and logo — all through the dashboard, with **no code changes required**. Changes typically appear on the customer side after a hard refresh (see the Troubleshooting section). |
| **Staff & Security Logs** | Create new staff accounts (cashiers, delivery personnel, additional admins), assign each one a role, and review a security audit log that records important account and system actions for accountability. |

---

## 5. Thermal Receipt Printing (QZ Tray Guide)

The platform supports **hands-free, automated** thermal receipt printing the moment an order is placed — the cashier does not need to click a "print" button manually. This is achieved using a free companion application called **QZ Tray**, which acts as a bridge between the web dashboard (running in a browser) and the physical printer hardware connected to that computer.

### Why is a separate app (QZ Tray) needed?
Web browsers are not normally allowed to talk directly to hardware like printers, for security reasons. QZ Tray runs quietly in the background on the cashier's computer and opens a secure local connection (over ports `8181`/`8182`) that the dashboard can use to send print jobs directly to the connected thermal printer.

### Cashier Setup Instructions (one-time, per computer):

1. **Hardware Connection:** Plug the thermal receipt printer into the cashier's local computer, either via USB cable or over the local network (Ethernet/Wi-Fi), depending on your printer model.
2. **Install QZ Tray:** Download and install the free QZ Tray desktop application from the official site: [https://qz.io](https://qz.io). Choose the installer that matches your operating system (Windows/macOS/Linux).
3. **Run the Application:** Open QZ Tray on the cashier's PC after installation. It will minimize into the system tray (near the clock, usually bottom-right on Windows or top-right on macOS) — **it must stay running** in the background for printing to work.
4. **Open the Dashboard:** On the **same computer** where QZ Tray is running, open the restaurant management dashboard in a browser.
5. **Verify Connection:** The dashboard automatically detects that QZ Tray is running and displays the list of thermal printers connected to that machine. Select the correct one if you have more than one printer.

### Daily Use
Once set up, simply leave QZ Tray running for the whole shift. Every time a new order comes in through the Orders Management board, a receipt is printed automatically without any extra clicks.

> ⚠️ **Important:** The website **cannot** send print commands if QZ Tray is closed or not running on that computer. If QZ Tray is accidentally closed, printing will silently stop until it is reopened. It's a good habit to add QZ Tray to your computer's startup programs so it launches automatically when the PC turns on.

---

## 6. Roles & Staff Permissions

The system uses a three-tier permission hierarchy. Each account is assigned exactly one role, and the dashboard automatically shows or hides sections based on that role.

```text
       ┌─────────────────────────┐
       │       Super Admin       │ ──> Full access: Settings, Branding, Logs & Staff Management
       └────────────┬────────────┘
                     │
       ┌─────────────┴────────────┐
       │           Admin          │ ──> Operations access: Orders, Menu, Tables & Coupons
       └─────────────┬────────────┘
                     │
       ┌─────────────┴────────────┐
       │         Delivery         │ ──> Limited access: View assigned delivery orders & update status
       └─────────────────────────┘
```

### What each role can actually do

| Capability | Super Admin | Admin | Delivery |
| :--- | :---: | :---: | :---: |
| View & manage live orders | ✅ | ✅ | 🔸 (assigned deliveries only) |
| Update order status | ✅ | ✅ | 🔸 (delivery-related statuses only) |
| Add/edit menu items & categories | ✅ | ✅ | ❌ |
| Manage tables & generate QR codes | ✅ | ✅ | ❌ |
| Manage delivery zones & fees | ✅ | ✅ | ❌ |
| Create/edit coupons | ✅ | ✅ | ❌ |
| Change branding (logo, colors, name) | ✅ | ❌ | ❌ |
| Create/manage staff accounts | ✅ | ❌ | ❌ |
| View security audit logs | ✅ | ❌ | ❌ |

> 📌 A **Super Admin** is typically the restaurant owner or general manager. **Admin** accounts are best suited to shift managers or head cashiers. **Delivery** accounts are meant for delivery drivers who only need to see the orders assigned to them and mark them as delivered.

---

## 7. Security Best Practices (Daily Operations)

These are simple habits for restaurant staff (not developers) to follow:

- Never share the admin access link or staff login credentials outside the restaurant's management team.
- Create a **separate account per staff member** instead of sharing one login — this keeps the audit log meaningful and lets you disable a single person's access if needed (e.g., when an employee leaves).
- Review the **Security Audit Logs** periodically (Super Admin only) to spot unusual activity, such as logins at odd hours or unexpected settings changes.
- Log out of the dashboard on shared/public computers at the end of a shift.

---

# SECTION 2: Developer & Technical Documentation

## 8. Tech Stack & Prerequisites

| Component | Choice | Notes |
| :--- | :--- | :--- |
| Runtime | Node.js v18.0.0+ | LTS versions recommended for production stability |
| Web Framework | Express.js | Handles routing, middleware, and REST API |
| Database | MongoDB v6.0+ | Can be run locally or hosted on MongoDB Atlas |
| ODM | Mongoose | Schema definitions and validation for MongoDB |
| Real-Time Layer | Socket.io (WebSockets) | Pushes live order updates to the dashboard and menu |
| Frontend | HTML5, CSS3, Vanilla JavaScript | No frameworks or build/compilation step required |
| Process Manager | PM2 | Keeps the app running in production, supports clustering |
| Hardware Integration | QZ Tray WebSockets API | Bridges the browser to local thermal printers |

Before installing, make sure the following are available on your machine:
- Node.js and npm installed (`node -v` and `npm -v` to check)
- Access to a MongoDB database (either installed locally or a connection string to MongoDB Atlas)
- Git installed, if cloning from a repository

---

## 9. Installation & Local Setup

1. **Clone the repository and enter the project directory:**
   ```bash
   git clone <repository-url>
   cd "new-resturant2"
   ```

2. **Install project dependencies** (this reads `package.json` and downloads all required libraries into `node_modules/`):
   ```bash
   npm install
   ```

3. **Install PM2 globally** (only required once per machine — needed later for production deployment, not for local development):
   ```bash
   npm install -g pm2
   ```

4. **Create your `.env` file** in the project root (see the full variable reference in the next section) before starting the server for the first time.

5. **Start the app locally for development/testing** (assuming a `start` or `dev` script exists in `package.json`):
   ```bash
   npm start
   ```
   Then open `http://localhost:3000` (or whichever `PORT` you configured) in your browser to confirm the storefront loads, and `http://localhost:3000/admin_restaurant_food` to confirm the admin bootstrap/login page loads.

---

## 10. Environment Variables (.env)

Create a file named `.env` in the project root folder, in the same location as `server.js`. This file stores sensitive configuration and must **never** be committed to version control (add it to `.gitignore`).

```env
# Server Configuration
PORT=3000
NODE_ENV=production
APP_BASE_URL=http://localhost:3000

# Database
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/restaurant_db?retryWrites=true&w=majority

# Security Secrets
JWT_SECRET=your_super_secret_jwt_key_change_in_production
QR_SECRET=your_qr_encryption_secret_key

# QZ Tray Printing Configuration
QZ_SIGNED=false
QZ_CERTIFICATE_ALIAS=your-certificate-alias
```

### What each variable means

| Variable | Purpose |
| :--- | :--- |
| `PORT` | The local network port the Node.js server listens on (e.g., `3000`). |
| `NODE_ENV` | Set to `production` on a live server to enable performance optimizations and disable verbose debug output; use `development` locally. |
| `APP_BASE_URL` | The public base URL of your deployed site — used when generating absolute links (e.g., inside QR codes or invoices). |
| `MONGO_URI` | The full connection string to your MongoDB database, including username, password, cluster address, and database name. |
| `JWT_SECRET` | A secret key used to cryptographically sign and verify staff login sessions (JWT tokens). **Must** be changed to a long, random value before going live — never leave the default. |
| `QR_SECRET` | A secret key used to sign/encrypt data embedded in generated QR codes (tables and invoices), preventing tampering. |
| `QZ_SIGNED` | Whether QZ Tray print requests are cryptographically signed. Set to `true` in production with a valid certificate to avoid repeated "allow this website to print" prompts for the cashier. |
| `QZ_CERTIFICATE_ALIAS` | The alias/name of the digital certificate configured for signed, silent QZ Tray printing. |

> 🔐 **Never reuse example secret values in production.** Generate strong random strings for `JWT_SECRET` and `QR_SECRET` (see the Production Readiness Checklist below for a suggested method).

---

## 11. Production Deployment with PM2 (Cluster Mode)

The repository includes a pre-configured `ecosystem.config.js` file that runs the Node.js process across **all available CPU cores** using PM2's Cluster Mode — this allows the app to handle more simultaneous traffic than a single Node.js process could alone.

### 1. Configuration file (`ecosystem.config.js`)
```javascript
module.exports = {
  apps: [{
    name: 'restaurant-app',
    script: 'server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production'
    }
  }]
};
```
- `instances: 'max'` tells PM2 to automatically spin up one worker process per available CPU core.
- `exec_mode: 'cluster'` enables Node.js's built-in cluster module through PM2, allowing multiple workers to share the same port.

### 2. Starting the production server
```bash
npm run prod
```
or, run PM2 directly:
```bash
pm2 start ecosystem.config.js
```

### 3. Everyday management commands
```bash
pm2 status                  # View all active worker instances and their status/uptime
pm2 logs                    # Stream consolidated application logs from all workers
pm2 monit                   # Open an interactive monitoring GUI (live CPU/RAM per worker)
pm2 reload restaurant-app   # Zero-downtime hot reload (restarts workers one at a time, no dropped requests)
pm2 stop all                # Stop all running instances (app becomes unreachable)
pm2 delete all              # Remove instances from PM2's process registry entirely
```

> 💡 Prefer `pm2 reload` over `pm2 restart` when deploying updates — `reload` restarts workers **one at a time**, so the site stays online throughout the deployment, whereas `restart` briefly takes everything down at once.

---

## 12. Project Architecture & Directory Structure

```text
.
├── config/
│   └── db.js                      # MongoDB connection setup via Mongoose
├── controllers/                   # Route business logic handlers
│   ├── adminController.js
│   ├── authController.js
│   ├── categoryController.js
│   ├── couponController.js
│   ├── deliveryAreaController.js
│   ├── orderController.js
│   ├── productController.js
│   ├── reviewController.js
│   ├── settingsController.js
│   └── tableController.js
├── middleware/
│   ├── authMiddleware.js          # JWT verification & role authorization
│   ├── conditionalRateLimit.js    # Dynamic IP rate limiting
│   ├── errorMiddleware.js         # Centralized error handler & 404 routes
│   └── workingHoursMiddleware.js  # Store operation schedules validator
├── models/                        # Mongoose schemas
│   ├── AuditLog.js
│   ├── Category.js
│   ├── Coupon.js
│   ├── DeliveryArea.js
│   ├── Order.js
│   ├── Product.js
│   ├── Restaurant.js
│   ├── Review.js
│   ├── Table.js
│   └── User.js
├── public/                        # Static client-side web root
│   ├── admin_restaurant_food.html # Dashboard interface
│   ├── checkout.html              # Checkout page
│   ├── index.html                 # Main menu page
│   ├── invoice.html               # Digital invoice view
│   ├── menu.html                  # Menu page
│   ├── product-details.html       # Individual product modal view
│   ├── css/                       # Stylesheets
│   ├── js/                        # Client-side scripts & qz-print.js
│   └── uploads/                   # Stored images
├── routes/                        # Express route definitions
│   ├── adminRoutes.js
│   ├── authRoutes.js
│   ├── categoryRoutes.js
│   ├── couponRoutes.js
│   ├── deliveryAreaRoutes.js
│   ├── orderRoutes.js
│   ├── productRoutes.js
│   ├── reviewRoutes.js
│   ├── settingsRoutes.js
│   └── tableRoutes.js
├── utils/                         # Helper utilities
│   ├── qrGenerator.js
│   ├── qrHelper.js
│   └── restaurantStatus.js
├── ecosystem.config.js            # PM2 Cluster Deployment Configuration
├── server.js                      # Express & Socket.io entry point
├── package.json
└── .env
```

### How the layers fit together
1. A request first passes through **`middleware/`** (e.g., checking the JWT token, applying rate limiting, checking working hours).
2. Express then matches the request to a route defined in **`routes/`**.
3. Each route delegates the actual business logic to a matching file in **`controllers/`**.
4. Controllers read from and write to the database using the schemas defined in **`models/`**.
5. **`server.js`** is the single entry point that wires all of this together, and also sets up the Socket.io real-time layer.
6. **`public/`** holds everything served directly to the browser — both the customer-facing menu pages and the staff dashboard — with no build step required since it's plain HTML/CSS/JS.

---

## 13. REST API Reference

**Base path:** all endpoints below are relative to your deployed domain, e.g. `https://your-domain.com/api/...`

**Authentication:** endpoints marked `Admin`, `Staff`, or `Super Admin` require a valid JWT, sent either as an `Authorization: Bearer <token>` header or as an authentication cookie set at login, depending on how the client was implemented.

| Base Path | Method | Access | Description |
| :--- | :--- | :--- | :--- |
| `/api/auth/login` | POST | Public | Authenticate a staff user and return a JWT cookie/token |
| `/api/products` | GET | Public | Fetch active menu items & categories |
| `/api/products` | POST | Admin | Create a new product (supports image upload via Multer) |
| `/api/orders` | POST | Public | Submit a new customer order |
| `/api/orders` | GET | Staff | Retrieve all orders, with optional status filters |
| `/api/settings` | GET | Public | Fetch dynamic branding (colors, name, logo) |
| `/api/settings` | PUT | Super Admin | Update site branding settings |
| `/api/upload` | POST | Admin | Directly upload a product/menu image |

### Example: submitting an order (`POST /api/orders`)
A simplified example request body for a dine-in order:
```json
{
  "orderType": "dine-in",
  "tableNumber": 4,
  "items": [
    { "productId": "665f1a...", "quantity": 2, "notes": "no onions" }
  ]
}
```
A successful response typically returns the created order, including its generated tracking ID:
```json
{
  "success": true,
  "order": {
    "trackingId": "ORD-20260828-0142",
    "status": "Received",
    "total": 24.50
  }
}
```

> ℹ️ **Note:** exact field names, required parameters, and response shapes depend on your specific controller implementation — check `controllers/orderController.js` and `models/Order.js` for the authoritative schema before integrating against this API.

### General API conventions
- Public endpoints (used by the customer storefront) require no authentication at all.
- Staff/Admin/Super Admin endpoints require a valid session; requests without one should receive a `401 Unauthorized` response, and requests from a role without sufficient permission should receive a `403 Forbidden` response.
- `conditionalRateLimit` middleware applies dynamic IP-based rate limiting to help protect public endpoints (like order submission) from abuse.

---

## 14. Socket.io & Multi-Worker State Management

When running PM2 in **Cluster Mode** (`instances: 'max'`), PM2 spawns multiple **independent worker processes** that do **not** share memory space with one another. This has an important consequence for any real-time or in-memory logic in the app.

### Important architectural considerations

- **In-Memory State Limits:** Any variable stored in a single worker's Node.js global memory (for example, tracking which browser tab is the "active" printer session) is only visible to **that specific worker** — a different customer or staff request handled by a different worker will not see it.
- **Scaling to Multi-Server / Multi-Core Deployments:** If your production setup spans multiple server instances, or you need Socket.io real-time events to reach clients regardless of which PM2 worker they're connected to, attach the **Socket.io Redis Adapter**. This uses Redis as a shared message bus between all workers, so an event emitted by one worker (e.g., "new order placed") is broadcast to clients connected to *every* worker, not just the one that received the original request.

```javascript
const { createAdapter } = require('@socket.io/redis-adapter');
const { createClient } = require('redis');

const pubClient = createClient({ url: 'redis://localhost:6379' });
const subClient = pubClient.duplicate();

Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
  io.adapter(createAdapter(pubClient, subClient));
});
```

> 📌 **Rule of thumb:** if you are only running a single server with a handful of CPU cores and modest traffic, the default setup (no Redis) generally works fine for small-to-medium restaurants. Add the Redis adapter once you scale to multiple servers, or if you notice that real-time order notifications are inconsistently reaching different dashboard sessions.

---

## 15. Backup & Maintenance

Recommended ongoing maintenance tasks for whoever manages the server:

- **Database backups:** schedule regular automated backups of your MongoDB database (MongoDB Atlas offers built-in automated backups; for self-hosted MongoDB, use `mongodump` on a cron schedule).
- **Uploaded images:** the `public/uploads/` folder contains customer- and menu-facing images that are **not** stored in the database — include this folder in your backup routine as well.
- **Log rotation:** PM2 logs can grow large over time; consider using `pm2 install pm2-logrotate` to automatically rotate and compress log files.
- **Dependency updates:** periodically run `npm outdated` and apply security patches, especially for packages related to authentication (`jsonwebtoken`) and file uploads (`multer`).

---

## 16. Production Readiness Checklist

Before launching the system live for real customer traffic, confirm each of the following:

**Environment & Secrets**
- [ ] `NODE_ENV=production` is set in `.env`.
- [ ] `JWT_SECRET` and `QR_SECRET` have been replaced with unique, random 64-character strings (you can generate one with `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`).
- [ ] The `.env` file is excluded from version control via `.gitignore`.

**Database**
- [ ] MongoDB database user access is restricted to your server's IP address(es) only (not open to the public internet).
- [ ] A backup schedule is configured (see Section 15).

**Infrastructure**
- [ ] PM2 is configured to automatically restart the app on server reboot:
  ```bash
  pm2 startup
  pm2 save
  ```
- [ ] A reverse proxy (Nginx or Caddy) is configured in front of Node.js to handle SSL/TLS certificates (HTTPS) and serve/cache static files efficiently.
- [ ] Log rotation is configured for PM2 (see Section 15).

**Hardware & Printing**
- [ ] If using signed, silent printing, the production digital certificate is configured within QZ Tray settings, and `QZ_SIGNED=true` with the correct `QZ_CERTIFICATE_ALIAS` is set.

---

## 17. Troubleshooting Guide & FAQ

### 1. PM2 error: "File ecosystem.config.js not found"
- **Cause:** You ran `npm run prod` or `pm2 start` from a directory other than the project root.
- **Fix:** `cd` into the project root folder (where `package.json` and `ecosystem.config.js` are located) and run the command again.

### 2. Printer is not responding or not printing receipts
- **Check 1:** Ensure QZ Tray is actively running in the taskbar/system tray on the cashier's PC — the dashboard cannot print if it's closed.
- **Check 2:** Confirm the printer itself is powered on and set up as an active/default device in the computer's own operating system printer settings.
- **Check 3:** Open your browser's developer tools (press F12) on the dashboard page and check the **Console** tab for any WebSocket connection errors related to ports `8181` or `8182` — these are the ports QZ Tray uses locally.
- **Check 4:** If prompts to "allow printing" keep reappearing, consider enabling signed printing (`QZ_SIGNED=true`) with a valid certificate so the browser trusts the requests automatically.

### 3. Changes in dashboard settings/colors don't appear on the customer side
- Perform a **hard refresh** in the web browser (`Ctrl + Shift + R` on Windows/Linux, or `Cmd + Shift + R` on macOS) to bypass cached CSS or JavaScript files stored by the browser.

### 4. New orders aren't appearing on the dashboard in real time
- Confirm the dashboard browser tab has an active internet/network connection and hasn't lost its WebSocket connection (check the browser console for disconnect messages).
- If you're running multiple PM2 workers in cluster mode without the Redis adapter configured, some real-time events may not reach every connected session — see Section 14 for details on when the Redis adapter is needed.

### 5. I can't reach the Bootstrap Registration Form anymore
- This is expected behavior, not a bug: the registration route is permanently locked once the first Super Admin account has been created (see Section 3). Log in with that account instead, and create any additional accounts from inside the dashboard.

### 6. "401 Unauthorized" or "403 Forbidden" when calling staff/admin API endpoints
- **401** generally means you are not logged in, or your session/token has expired — log in again.
- **403** generally means you *are* logged in, but your assigned role does not have permission for that specific action (see the permission table in Section 6).