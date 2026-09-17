# SwiftSale — Inventory & POS Management System

> A full-stack Point-of-Sale and Inventory Management System built for small-to-medium retail businesses. Supports Filipino Peso (₱) pricing, role-based access, dual-ledger inventory, remote access via ngrok, and a rich reporting engine.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | .NET 9, ASP.NET Core Web API, Clean Architecture |
| **ORM / DB** | Entity Framework Core 9, PostgreSQL 16 |
| **Frontend** | React 19, TypeScript, Vite 6, TailwindCSS 4 |
| **Auth** | JWT Bearer tokens (8-hour sessions), Role-based (Admin / Cashier) |
| **Packaging** | Docker Compose (postgres + api + nginx/client) |
| **Remote Access** | ngrok v3 HTTPS tunnels |

---

## Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| .NET SDK | 9.0+ | [Download](https://dotnet.microsoft.com/download) |
| Node.js | 20+ | [Download](https://nodejs.org) |
| Docker Desktop | latest | [Download](https://www.docker.com/products/docker-desktop) |
| ngrok *(optional)* | v3+ | Required only for Remote Access feature |
| PostgreSQL *(optional)* | 16 | Only for non-Docker local dev |

---

## Quick Start

### Option A — Developer Mode (Recommended for development)

Use the included developer start script to launch both API and frontend simultaneously:

```powershell
# From the project root — starts postgres (Docker), API, and Vite dev server
.\dev.ps1
```

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5126
- **Swagger UI**: http://localhost:5126/swagger

### Option B — Full Production Stack (Docker Compose)

```powershell
docker compose -f deploy/compose/docker-compose.yml up --build
```

| Service | URL |
|---------|-----|
| Frontend (React via nginx) | http://localhost:80 |
| Backend API | http://localhost:5126 |
| Swagger UI | http://localhost:5126/swagger |
| PostgreSQL | localhost:5432 |

---

## New Machine Setup (One-Time)

For setting up SwiftSale on a new device, run the automated setup script:

```powershell
# Run as Administrator (script will self-elevate if needed)
.\setup.ps1
```

The script will automatically:
- ✅ Check and install missing prerequisites (.NET SDK, Node.js, Docker Desktop, ngrok)
- ✅ Install frontend npm dependencies
- ✅ Start PostgreSQL via Docker Compose
- ✅ Apply EF Core database migrations
- ✅ Seed the admin user and default product catalog (Midea)
- ✅ Create a **Desktop shortcut** that launches SwiftSale in your default browser
- ✅ Create a **Start Menu shortcut** for easy access

> ⚡ Re-running `setup.ps1` is safe — it skips already-completed steps (idempotent).

---

## Default Login Credentials

| Role | Username | Password |
|------|----------|----------|
| Admin | `admin` | `admin123` |
| Cashier | `cashier` | `cashier123` |

> ⚠️ **Change default passwords immediately in any non-development or production environment.**

---

## Features

### 🔐 Authentication & User Management
- JWT-based login with 8-hour session tokens
- Two roles: **Admin** (full system access) and **Cashier** (POS + inventory view)
- Admin can create users, toggle active/inactive status, and reset passwords
- Protected routes — unauthenticated users are redirected to `/login`

### 🛒 POS Terminal (`/sales/new`)
- Fast product search by name or SKU with keyboard navigation
- Cart with **line-item discounts**, **order-level percentage discounts**, and **multiple payment methods** (Cash, Card, GCash, Check, Post-Dated Check)
- **Check & Post-Dated Check (PDC) Support**: Capture Bank Name, Check Number, and Check/Maturity Date during checkout. Automatically sets PDC payment status to `Pending`
- **Packaging units** support — sell by Box, Pack, Piece, etc. with automatic quantity conversion
- Real-time change and balance calculation
- Duplicate submission prevention (debounced submit)
- Customer linking on transactions

### 💳 Check Management & Inventory Pull-Back (`/sales`)
- **Check Lifecycle Tracking**: View check payment status (`Cleared`, `Pending`, `Dishonored`) directly in Sales History
- **Check Clearance**: Easily mark pending post-dated checks as `Cleared` upon maturity date
- **Automated Reversal on Bounced Checks**: Trigger item pull-backs on dishonored checks with a mandatory reason. Automatically voids the sale transaction, restores inventory balances using base unit conversion, and logs an immutable `SaleVoidReturn` stock movement

### 📦 Inventory Management (`/inventory`)
- **Dual-ledger invariant**: every stock change creates an immutable `StockMovement` record inside a DB transaction
- Negative stock prevention enforced at the service layer
- Manual stock adjustments with mandatory reason field
- Low-stock badge alerts based on configurable `ReorderLevel` (excluding zero-stock items)
- Dedicated **Zero Balance (Depleted)** tracking for out-of-stock products
- Full movement history per product (PurchaseIn, SaleOut, AdjustmentIn, AdjustmentOut, SaleVoidReturn)

### 🛍️ Products (`/products`)
- Full product CRUD with SKU, category, unit of measure, cost price, selling price, and reorder level
- **Packaging units** — define how many base units are in a Box, Pack, Case, etc. for flexible POS selling
- Soft-delete / active toggle — deactivated products are hidden from POS search
- Product image placeholder support

### 📋 Purchases (`/purchases`)
- Record supplier purchase orders with multiple line items
- Auto-updates inventory balances and logs `PurchaseIn` stock movements on receipt
- Average cost recalculation on each purchase
- Purchase status: Pending → Completed

### 👥 Customers (`/customers`)
- Customer contact management (name, phone, email, address)
- Transaction history per customer

### 📊 Dashboard (`/`)
- Live KPIs: Today's Revenue, Total Sales Count, Low-Stock Item Count, Total Inventory Value
- Sales trend charts (Recharts)
- Recent transactions feed

### 📈 Reports & PDF Export (`/reports`)
- **Sales & Margin Report** — date-range revenue, units sold, COGS, gross margin performance with ₱ Philippine Peso formatting
- **Voided Sales & Check Reversals** — detailed table on page and PDF reflecting voided sales, Delivery Receipt (DR #), Invoice #, Customer Name, Check #, Bank Name, and dishonor/void reasons (placed directly below Daily Sales & Margin Breakdown in PDF)
- **Inventory Health Matrix** — current stock levels, capital allocation on hand, separate threshold alerts for low-stock vs zero-stock items
- **3-Page Operational PDF Export** — formatted PDF report download for executive and audit reviews

### ⚙️ Settings (`/settings`)
- **Units of Measure** — manage Pcs, Kg, Box, Tin, Pack, etc.
- **Product Categories** — view and manage categories
- **User Management** *(Admin only)* — create/edit users, toggle roles and active status
- **Remote Access** — manage ngrok HTTPS tunnel configuration

---

## 🌐 Remote Access Setup with ngrok

SwiftSale includes an optional **Remote Access** feature allowing store owners to access the locally hosted app over a secure **ngrok HTTPS tunnel**.

### Features
- 🚀 **One-Click Enable/Disable**: Toggle inside **Settings → Remote Access**
- 🔍 **Auto-Detection**: Detects `ngrok` on system `PATH` or WinGet installation directories
- 📱 **QR Code & Shareable Link**: Generates an HTTPS URL (`https://xxxx.ngrok-free.app`) + scannable QR Code
- 🔒 **Secure Authorization**: JWT authentication is enforced over the tunnel
- ⚡ **Auto-Start**: Option to start the tunnel automatically on SwiftSale launch

### Setup Steps

1. **Install ngrok**:
   ```powershell
   winget install ngrok.ngrok
   ```
2. **Get your Authtoken** from the [ngrok Dashboard](https://dashboard.ngrok.com/get-started/your-authtoken)
3. **Configure in SwiftSale**: Navigate to **Settings → Remote Access**, paste your Authtoken, click **Save Configuration**
4. **Start tunnel**: Click **Start Remote Access** — share the QR Code or HTTPS URL

---

## Database Backup & Restore

### Backup
```bash
docker exec swiftsale_postgres pg_dump -U postgres swiftsale_db > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Restore
```bash
docker exec -i swiftsale_postgres psql -U postgres swiftsale_db < backup_YYYYMMDD_HHMMSS.sql
```

---

## API Endpoints Overview

| Controller | Prefix | Key Operations |
|-----------|--------|---------------|
| `AuthController` | `/api/auth` | Login, token refresh |
| `ProductsController` | `/api/products` | CRUD, search by SKU/name |
| `CategoriesController` | `/api/categories` | CRUD, product listing per category |
| `InventoryController` | `/api/inventory` | Balances, adjustments, movement history |
| `SalesController` | `/api/sales` | Create sale, list, detail, mark check cleared, dishonor/pull-back sale |
| `PurchasesController` | `/api/purchases` | Create PO, receive, list |
| `CustomersController` | `/api/customers` | CRUD, transaction history |
| `UsersController` | `/api/users` | Admin user management |
| `UnitsController` | `/api/units` | Units of Measure CRUD |
| `DashboardController` | `/api/dashboard` | KPI aggregates |
| `ReportsController` | `/api/reports` | Sales/Inventory/Profit reports, voided sales, PDF report generation |
| `RemoteAccessController` | `/api/remote-access` | ngrok tunnel management |

Full interactive documentation: **http://localhost:5126/swagger**

---

## Project Structure

```
swiftSale/
├── src/
│   ├── Api/                        # ASP.NET Core Web API
│   │   ├── Controllers/            # 12 REST controllers
│   │   ├── Middleware/             # Global exception handler (RFC 7807)
│   │   ├── Program.cs              # DI, JWT, CORS, Swagger setup
│   │   └── appsettings*.json
│   ├── Application/                # Business logic layer
│   │   ├── Services/               # IProductService, ISaleService, IInventoryService, ...
│   │   ├── DTOs/                   # Request/response contracts
│   │   ├── Validators/             # Input validation
│   │   └── Common/                 # Shared utilities, PasswordHasher
│   ├── Domain/                     # Pure domain (no external dependencies)
│   │   ├── Entities/               # Product, Sale, SaleItem, Purchase, StockMovement, ...
│   │   ├── Enums/                  # StockMovementType, PurchaseStatus, PaymentMethod, ...
│   │   └── Exceptions/             # Domain exception types
│   └── Infrastructure/             # EF Core, JWT, external services
│       ├── Data/                   # AppDbContext, DbInitializer, EF Configurations
│       ├── Migrations/             # EF Core migration history
│       └── Security/               # JWT token service
├── client/
│   └── web/                        # React 19 + TypeScript + Vite frontend
│       └── src/
│           ├── features/           # auth, dashboard, pos, inventory, products,
│           │                       # sales, purchases, customers, reports, settings
│           ├── components/         # Shared UI components
│           ├── services/           # Axios API service layer
│           ├── context/            # AuthContext (JWT state management)
│           ├── routes/             # React Router route definitions
│           └── types/              # TypeScript interfaces
├── database/
│   ├── scripts/                    # 01_init.sql — PostgreSQL extensions init
│   └── seed/                       # midea_catalog_seed.sql — product catalog
├── deploy/
│   └── compose/                    # docker-compose.yml, Dockerfiles, nginx.conf
├── setup.ps1                       # 🆕 One-time new machine setup script
├── dev.ps1                         # 🆕 Developer start script (API + Frontend)
├── SwiftSale.sln
└── README.md
```

---

## Architecture

The backend follows **Clean Architecture** with strict dependency rules:

```
Domain ← Application ← Infrastructure ← Api
```

- **`Domain`** — Pure entities, enums, and domain exceptions. Zero external dependencies.
- **`Application`** — Service interfaces, DTOs, validators. Depends only on Domain.
- **`Infrastructure`** — EF Core `AppDbContext`, migrations, JWT service, ngrok integration. Implements Application interfaces.
- **`Api`** — Controllers, middleware, DI composition root. Composes all layers.

### Inventory Dual-Ledger Invariant

> Every inventory change **must** be accompanied by an atomic `StockMovement` row inside a database transaction. Stock cannot go negative. This is enforced at the Application service layer — the `InventoryService` and `SaleService` both validate and record movements together.

### Packaging Units

Products support packaging unit definitions (e.g., 1 Box = 12 Pcs). The POS terminal allows cashiers to select the selling unit, automatically converting quantities against the base inventory balance.

---

## EF Core Migrations

```bash
# Add a new migration
dotnet ef migrations add <MigrationName> --project src/Infrastructure --startup-project src/Api

# Apply migrations manually
dotnet ef database update --project src/Infrastructure --startup-project src/Api
```

---

## Environment Configuration

| Setting | Development | Production (Docker) |
|---------|------------|-------------------|
| DB Connection | `appsettings.Development.json` | `docker-compose.yml` environment vars |
| JWT Secret | `appsettings.json` | `docker-compose.yml` environment vars |
| CORS Origins | `localhost:5173`, `localhost:3000` | Nginx reverse proxy |
| Swagger UI | Enabled | Disabled (production build) |
