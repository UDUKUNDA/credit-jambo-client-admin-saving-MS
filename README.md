# Credit Jambo Client Application

A consolidated savings management system where both client and admin functionality run inside the same backend (`client-admin-backend`) and UI (`client-admin-web`), sharing one PostgreSQL database. This simplifies setup, debugging, and deployment.

## Overview

- Single shared PostgreSQL DB (`savings_management`) with one user table (`users`) storing `role: 'user' | 'admin'`.
- Backend (`client-backend`) exposes:
  - Client routes (auth, accounts, transactions)
  - Admin routes (user listing, more to follow)
- Frontend (`client-web`) includes:
  - Normal user pages (dashboard, deposit, withdraw, transactions)
  - Admin pages (`/admin/dashboard`, `/admin/users`) protected by role

## Monorepo Structure

- `client-admin-backend/` — Express + Sequelize API running on port `3001`
- `client-admin-web/` — Vite + React app running on port `5173` (proxy to `/api`)
- Shared DB exposed via Docker on port `5432` (container `jambo-shared-db`)

## Prerequisites

- Windows (PowerShell) or macOS
- Node.js 18+
- Docker Desktop
- Git (optional)

## Environment Variables

Set these in `client-backend/.env`:

- Database:
  - `DB_HOST=localhost`
  - `DB_PORT=5432`
  - `DB_NAME=savings_management`
  - `DB_USER=jambo_user`
  - `DB_PASSWORD=jambo123`
- Security:
  - `PASSWORD_SALT=<same value used when users were created>`
  - `JWT_SECRET=<your-strong-secret>`
  - `JWT_EXPIRES_IN=1h` (optional)
- Admin seeding:
  - `ADMIN_EMAIL=admin@savings.com`
  - `ADMIN_PASSWORD=admin123`
  - `ADMIN_DEVICE_ID=ADMIN-PC` (default device required for admin login)
- CORS (optional):
  - `CORS_ORIGIN=http://localhost:5173`

Set `client-web/.env` (optional defaults are fine):
- Vite proxy targets `/api/*` to `http://localhost:3001` automatically via same-origin dev server

## Database

- PostgreSQL container `jambo-shared-db` hosts:
  - `users` (fields include `role`, `isActive`, `password` hashed with SHA-512 + `PASSWORD_SALT`)
  - `devices` (per-user device records, must be verified)
  - `accounts` and `transactions`

To inspect DB:

```bash
docker exec -it jambo-shared-db psql -U jambo_user -d savings_management -c "\dt"
```

## Device Policy

- Admin:
  - Must login with a `deviceId` (e.g., `ADMIN-PC`)
  - If missing, backend auto-creates a verified admin device
  - Seeder ensures the admin device exists and is verified at startup
- Normal users:
  - Must login with an existing, verified device
  - Registration creates a device and sets `isVerified=false` (your ops process should verify it)

## Setup

1) Start Docker DB (if not already up)
```bash
docker compose up -d
```

2) Install backend deps and run dev server
```bash
cd d:\new-credit-jambo\credit-jambo-client-admin-saving-MS\client-admin-backend
npm install
npm run dev
```

- On start, it:
  - Connects to DB
  - Seeds an admin user and a verified admin device (`ADMIN_DEVICE_ID`)
  - Logs “Savings Management Backend running on port 3001”

3) Install client-admin-web deps and run dev server
```bash
cd d:\new-credit-jambo\credit-jambo-client-admin-saving-MS\client-admin-web
npm install
npm run dev
```

- Visit `http://localhost:5173`

## Quickstart Login

- Admin login:
  - Email: `admin@savings.com`
  - Password: `admin123`
  - Device: ensure `client-web` uses the same device id as seeded
    - You can force it in browser console: `localStorage.setItem('deviceId','ADMIN-PC')`
  - After login, admins redirect to `/admin/dashboard`

- Normal user login:
  - Register via `/register`
  - Device gets created pending verification; login requires a verified device (adjust as needed for your ops flow)

## API Endpoints

Base: `http://localhost:3001`

- Health:
  - `GET /health` → `{ status: 'OK', timestamp, service }`

- Auth (client + admin):
  - `POST /api/auth/register`
    - Body: `{ email, password, firstName, lastName, deviceId }`
    - Returns: `{ message, user, device }`
  - `POST /api/auth/login`
    - Body: `{ email, password, deviceId }`
    - Returns: `{ token, user, device? }`
      - Token payload includes `{ userId, deviceId, role }`
      - Admin logins auto-create/verify device if missing
  - `GET /api/auth/verify-token`
    - Header: `Authorization: Bearer <token>`
    - Returns: `{ user, device? }`

- Account (authenticated user):
  - `GET /api/account/balance` → `{ id, userId, balance, currency, ... }`
  - `GET /api/account/transactions?limit=&offset=` → `{ transactions, total }`
  - `POST /api/account/deposit` → `{ id, accountId, amount, description, createdAt }`
  - `POST /api/account/withdraw` → `{ id, accountId, amount, description, createdAt }`

- Admin (role enforced via middleware):
  - `GET /api/admin/users?limit=&offset=` → `{ total, users[] }` (password excluded)
  - `GET /api/admin/users/:id` → user details (password excluded)
  - More admin routes can be added similarly (devices, transactions audit, etc.)

## Frontend Routes

- Public:
  - `/` (Landing)
  - `/login`
  - `/register`
- Protected:
  - `/app` (Bento-style hub)
  - `/dashboard`
  - `/deposit`, `/withdraw`, `/transactions`
- Admin-protected:
  - `/admin/dashboard`
  - `/admin/users`

Notes:
- Admin routes use a `RequireAdmin` guard in `client-web`.
- Post-login, frontend redirects based on `user.role`:
  - `admin` → `/admin/dashboard`
  - `user` → `/app`

## Assumptions

- `PASSWORD_SALT` used to seed the admin matches the one in `client-backend/.env`; otherwise, “Invalid credentials” occurs.
- Single shared DB across admin and client flows.
- Device policy is enforced:
  - Admin must include `deviceId`; device gets auto-created/verified if missing.
  - Normal users must have a pre-verified device to login.
- Vite dev server proxies `/api/*` requests to backend running on `3001`.

## Troubleshooting

- 401 “Invalid credentials”:
  - Ensure `PASSWORD_SALT` matches the salt used to create users
  - Confirm email/password are correct
- 401 “Device not registered” (normal user):
  - Register device via app flow; verify device (ops step)
- 401 “Device pending verification”:
  - Verify device or temporarily enable dev-only overrides (not recommended in production)
- Connection errors to DB:
  - Confirm Docker is running and port `5432` available
  - Check `DB_*` values in backend `.env`

## Testing (PowerShell)

- Health:
```bash
Invoke-RestMethod -Uri "http://localhost:3001/health" -Method Get
```

- Admin login:
```bash
Invoke-RestMethod -Uri "http://localhost:3001/api/auth/login" -Method Post -ContentType "application/json" -Body '{"email":"admin@savings.com","password":"admin123","deviceId":"ADMIN-PC"}'
```

- Use token for admin users:
```bash
$token = (Invoke-RestMethod -Uri "http://localhost:3001/api/auth/login" -Method Post -ContentType "application/json" -Body '{"email":"admin@savings.com","password":"admin123","deviceId":"ADMIN-PC"}').token
Invoke-RestMethod -Uri "http://localhost:3001/api/admin/users" -Headers @{ Authorization = "Bearer $token" } -Method Get
```

## Linting & Formatting

- Backend:
```bash
cd d:\new-credit-jambo\credit-jambo-client-admin-saving-MS\client-admin-backend
npm run lint
```

- Frontend:
```bash
cd d:\new-credit-jambo\credit-jambo-client-admin-saving-MS\client-admin-web
npm run lint
```

Be kind to your future self: keep `.env` tidy and secrets safe. 🫶