# CAMPUS CASH - Smart Digital Campus Wallet 💳 campus-cash

**Tagline**: *"Your Campus. Your Wallet. Your Cashless Life."*

Campus Cash is a full-stack, college-specific cashless digital wallet platform built for Students, Parents, Vendors, and Campus Administrators.

---

## 🌟 Key Features

1. **Role-Based Workflows & Security**:
   - **Student Module**: Wallet balance counters, QR scanner, instant payment, transaction logs, reward points, and AI expense tracker.
   - **Parent Module**: Remote wallet top-up, daily/monthly spending limit controls (with 50%/80%/100% progress indicators), and real-time payment alerts.
   - **Vendor Module**: Today's & monthly sales metrics, static and dynamic QR code generation, live transaction feed, and CSV report export.
   - **Admin Module**: Campus-wide KPIs, live Campus Pulse metrics, user status toggles (ACTIVE/DISABLED), vendor approvals, and audit trail logs.
   - **Strict JWT Authorization**: Middleware route guards preventing cross-role access (e.g. Student cannot access `/admin`).

2. **Atomic Payment Engine**:
   - Deducts student wallet, credits vendor demo wallet, logs ledger record with `previous_balance` & `new_balance`, awards reward points (₹100 = 10 pts), generates parent alerts, and updates audit logs in a single atomic database transaction.

3. **Signature UI Elements**:
   - **CAMPUS PULSE**: Real-time live campus financial stream showing total payments today, volume, and active vendor count with animated waveform.
   - **YOUR MONEY TRAIL**: End-to-end interactive transaction security flowchart.

4. **AI Expense Tracker**:
   - Categorizes spending into Food, Stationery, Transport, Education, Printing, Events.
   - Delivers rule-based AI financial insights, average daily spending calculations, and smart budgeting recommendations.

5. **Monthly Report & Receipt Generator**:
   - Generates official monthly statements with PDF/print view and CSV export.
   - Produces digital receipts with verification QR codes.

---

## 🎨 Color System & Design Direction

- **Midnight Navy**: `#0B1020` (Background)
- **Electric Orange**: `#FF6B35` (Primary Action)
- **Mint Green**: `#42E6B5` (Success & Recharges)
- **Soft Violet**: `#8B7CFF` (Analytics & AI Features)
- **Warm White**: `#F8F7F2` (Primary Text)
- **Charcoal**: `#171B2E` (Cards)

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, Lucide React icons, Canvas Confetti, Vanilla CSS (Design Tokens + Glassmorphism).
- **Backend**: Node.js, Express.js REST API, JWT authentication, `bcryptjs` password hashing, CORS.
- **Database**: SQLite (`better-sqlite3`) with WAL mode, foreign keys, and atomic transactions. MySQL `schema.sql` standard migration included.

---

## 🔑 Pre-Configured Demo Credentials

Click any single-click Demo Button on the Login Page or use the following credentials:

| Role | Email | Password | Pre-loaded Virtual Balance |
| :--- | :--- | :--- | :--- |
| **Student** | `student@campuscash.demo` | `Student@123` | ₹1,850.00 |
| **Parent** | `parent@campuscash.demo` | `Parent@123` | ₹25,000.00 |
| **Vendor** | `vendor@campuscash.demo` | `Vendor@123` | ₹14,250.00 |
| **Admin** | `admin@campuscash.demo` | `Admin@123` | N/A |

---

## 🚀 How to Run the Application

### 1. Backend Server Setup

```bash
cd server
npm install --ignore-scripts
# Run database initialization and seed
node config/seed.js
# Start server
node server.js
```
*Backend active at: `http://localhost:5000`*

### 2. Frontend Setup

```bash
cd client
npm install --ignore-scripts
# Start Vite development server
npm run dev
```
*Frontend active at: `http://localhost:3000`*

---

## 📡 API Overview

### Authentication
- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/auth/me`

### Payments & QR Engine
- `POST /api/payments/initiate`
- `POST /api/payments/confirm`
- `GET /api/payments/history`
- `GET /api/payments/:id`

### Student Module
- `GET /api/student/dashboard`
- `POST /api/student/recharge`
- `GET /api/student/rewards`
- `POST /api/student/rewards/redeem`
- `GET /api/student/ai-expense`
- `GET /api/student/monthly-report`

### Parent Module
- `GET /api/parent/dashboard`
- `POST /api/parent/recharge`
- `POST /api/parent/spending-limit`

### Vendor Module
- `GET /api/vendor/dashboard`
- `POST /api/vendor/qr`

### Admin Module
- `GET /api/admin/dashboard`
- `GET /api/admin/users`
- `PUT /api/admin/users/status`
- `GET /api/admin/audit-logs`

---

## 💳 Future Payment Gateway Integration Layer

Campus Cash uses a **Virtual Demo Wallet** engine for academic demonstration. The system is designed with a decoupled payment abstraction (`/api/payments/confirm`), allowing seamless future integration with production payment gateways like Razorpay, Cashfree, or UPI Intents:

```js
// Future Gateway Switch Architecture:
async function processGatewayIntent(amount) {
  // 1. Create Razorpay / UPI order
  // 2. On Webhook verification -> invoke confirmPayment()
}
```
