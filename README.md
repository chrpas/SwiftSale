# SwiftSale — Inventory & POS Management System

A full-stack Point-of-Sale and Inventory Management System built with:
- **Backend**: .NET 9, Clean Architecture, Entity Framework Core, PostgreSQL / In-Memory DB
- **Frontend**: React 19, TypeScript, Vite, TailwindCSS
- **Auth**: JWT Bearer tokens, Role-based access (Admin / Cashier)

---

## Prerequisites

| Tool | Version | Download |
|------|---------|----------|
| .NET SDK | 9.0+ | https://dotnet.microsoft.com/download |
| Node.js | 20+ | https://nodejs.org |
| Docker Desktop | latest | https://www.docker.com/products/docker-desktop |
| ngrok (optional) | v3+ | https://dashboard.ngrok.com/usage |
| PostgreSQL (optional) | 16 | Only needed for non-Docker local dev |

---

## Local Development (Recommended)

### 1. Start the Database Only

```bash
docker compose -f deploy/compose/docker-compose.yml up postgres -d
```

### 2. Run the Backend API

```bash
# From the project root
dotnet run --project src/Api --launch-profile http
# API will be available at: http://localhost:5126
# Swagger UI:              http://localhost:5126/swagger
```

> The API automatically seeds sample data, users, and units of measure on first start.

### 3. Run the Frontend

```bash
cd client/web
npm install
npm run dev
# Frontend available at: http://localhost:5173
```

---

## Full Stack with Docker Compose

Run everything with a single command:

```bash
docker compose -f deploy/compose/docker-compose.yml up --build
```

| Service | URL |
|---------|-----|
| Frontend (React) | http://localhost:80 |
| Backend API | http://localhost:5126 |
| Swagger UI | http://localhost:5126/swagger |
| PostgreSQL | localhost:5432 |

---

## Default Login Credentials

| Role | Username | Password |
|------|----------|----------|
| Admin | `admin` | `admin123` |
| Cashier | `cashier` | `cashier123` |

> ⚠️ Change default passwords immediately in any non-development environment.

---

## Features

### 🔐 Authentication & Users
- JWT-based login with 8-hour session tokens
- Two roles: **Admin** (full access) and **Cashier** (POS + inventory view)
- Admin can add users, toggle active status, and reset passwords

### 🛒 POS Terminal (`/sales/new`)
- Fast SKU search with keyboard navigation
- Cart with line discounts, multiple payment methods
- Real-time change/balance calculation
- Duplicate submission prevention

### 📦 Inventory Management (`/inventory`)
- Dual-ledger: every stock change creates a `StockMovement` record
- Negative stock prevention
- Adjustment with mandatory reason field
- Low-stock badge alerts

### 📊 Dashboard & Reports
- Live KPIs: Today's Revenue, Total Sales, Low-Stock count, Total Inventory Value
- Sales, Inventory, and Profit reports with ₱ Philippine Peso formatting

### ⚙️ Settings (`/settings`)
- Units of Measure management (Pcs, Kg, Box, Tin, etc.)
- Product Category viewing
- User Management (Admin only)
- **Remote Access (ngrok)**: Manage secure HTTPS tunnels to access SwiftSale over the Internet.

---

## 🌐 Remote Access Setup with ngrok

SwiftSale includes an optional **Remote Access** feature that allows store owners and authorized personnel to access the locally hosted web application over a secure **ngrok HTTPS tunnel**.

### Features
- 🚀 **One-Click Enable/Disable**: Turn remote access on or off directly inside **Settings $\rightarrow$ Remote Access**.
- 🔍 **Auto-Detection**: Automatically detects `ngrok` on system `PATH` or WinGet installation directories (`winget install ngrok.ngrok`).
- 📱 **QR Code & Shareable Link**: Generates a shareable HTTPS URL (`https://xxxx.ngrok-free.app`) and scannable **QR Code** for instant mobile/tablet access.
- 🔒 **Secure Authorization**: Authenticated Admin roles and JWT tokens remain strictly enforced over the tunnel.
- ⚡ **Auto-Start**: Option to automatically start the remote tunnel on SwiftSale startup.

### How to Configure

1. **Install ngrok** (if not already installed):
   ```powershell
   winget install ngrok.ngrok
   ```
2. **Get your ngrok Authtoken**:
   - Log into your [ngrok Dashboard](https://dashboard.ngrok.com/get-started/your-authtoken) or check your [ngrok Account & Usage](https://dashboard.ngrok.com/usage).
   - Copy your authtoken.
3. **Configure in SwiftSale**:
   - Navigate to **Settings $\rightarrow$ Remote Access**.
   - Paste your Authtoken into **ngrok Authtoken** (optional if already configured globally).
   - Click **Save Configuration**.
4. **Start Remote Access**:
   - Click **Start Remote Access** to open the tunnel.
   - Scan the **QR Code** or copy the **Active Public HTTPS URL** to access SwiftSale from any remote device!

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

## Project Structure

```
swiftSale/
├── src/
│   ├── Api/                    # ASP.NET Core Web API (Controllers, Middleware)
│   ├── Application/            # Business logic, DTOs, Interfaces
│   ├── Domain/                 # Entities, Enums
│   └── Infrastructure/         # EF Core DbContext, Migrations, JWT
├── client/
│   └── web/                    # React 19 + TypeScript + Vite frontend
├── database/
│   └── scripts/                # SQL initialization scripts
├── deploy/
│   └── compose/                # Docker Compose, Dockerfiles, nginx config
├── SwiftSale.sln
└── README.md
```

---

## Architecture

The backend follows **Clean Architecture**:

- `Domain` — Pure entities and enums (no dependencies)
- `Application` — Services, DTOs, and interfaces (depends on Domain only)
- `Infrastructure` — EF Core, JWT, DB configurations (implements Application interfaces)
- `Api` — Controllers and middleware (composes everything)

### Inventory Invariant (Dual-Ledger Rule)
Every inventory change **must** be accompanied by a `StockMovement` row inside a database transaction. Stock cannot go negative. This is enforced at the service layer in `Application/Services/`.
