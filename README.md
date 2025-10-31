# Credit Jambo Client Admin Saving MS

A consolidated savings management system where both client and admin functionality run inside the same backend (`client-admin-backend`) and UI (`client-admin-web`), sharing one PostgreSQL database. This simplifies setup, debugging, and deployment.

## Overview

- Single shared PostgreSQL DB with one user table (`users`) storing `role: 'user' | 'admin'`.
- Backend (`client-admin-backend`) exposes:
  - Client routes (auth, accounts, transactions)
  - Admin routes (user listing, more to follow)
- Frontend (`client-admin-web`) includes:
  - Normal user pages (dashboard, deposit, withdraw, transactions)
  - Admin pages (`/admin/dashboard`, `/admin/users`) protected by role

## Monorepo Structure

- `client-admin-backend/` — Express + Sequelize API running on port `3001`
- `client-admin-web/` — Vite + React app running on port `5173` (proxy to `/api`)
- Shared DB exposed via Docker on port `5432`

## Prerequisites

- Windows (PowerShell) or macOS
- Node.js 18+
- Docker Desktop
- Git (optional)

## Environment Variables

Set these in `client-admin-backend/.env` (do NOT commit `.env` — use `.env.example` instead):

- Database:
  - `DB_HOST=<YOUR_DB_HOST>`
  - `DB_PORT=<YOUR_DB_PORT>`
  - `DB_NAME=<YOUR_DB_NAME>`
  - `DB_USER=<YOUR_DB_USER>`
  - `DB_PASSWORD=<YOUR_DB_PASSWORD>`
- Security:
  - `PASSWORD_SALT=<YOUR_PASSWORD_SALT>`
  - `JWT_SECRET=<YOUR_JWT_SECRET>`
  - `JWT_EXPIRES_IN=1h` (optional)
- Admin seeding:
  - `ADMIN_EMAIL=<ADMIN_EMAIL>`
  - `ADMIN_PASSWORD=<ADMIN_PASSWORD>`
  - `ADMIN_DEVICE_ID=<YOUR_DEVICE_ID>`
- CORS (optional):
  - `CORS_ORIGIN=http://localhost:5173`

Set `client-admin-web/.env` (optional):
- Vite proxy forwards `/api/*` to `http://localhost:3001` via dev server

## Database

- PostgreSQL container hosts:
  - `users` (fields include `role`, `isActive`, `password`)
  - `devices` (per-user device records, must be verified)
  - `accounts` and `transactions`

To inspect DB (example):
```bash
docker exec -it <YOUR_DB_CONTAINER_NAME> psql -U <YOUR_DB_USER> -d <YOUR_DB_NAME> -c "\dt"
```

## Device Policy

- Admin:
  - Login with a `deviceId` (e.g., `<YOUR_DEVICE_ID>`)
  - If missing, backend can auto-create and verify an admin device
  - Seeder ensures the admin device exists and is verified at startup
- Normal users:
  - Must login with an existing, verified device
  - Registration creates a device and sets `isVerified=false` (verify via ops)

## Setup

1) Start Docker DB (if not already up)
```bash
docker compose up -d
```

2) Install backend deps and run dev server
```bash
cd ./credit-jambo-client-admin-saving-MS/client-admin-backend
npm install
npm run dev
```

- On start, it:
  - Connects to DB
  - Seeds an admin user and a verified admin device (`ADMIN_DEVICE_ID`)
  - Logs “Backend running on port 3001”

3) Install client-admin-web deps and run dev server
```bash
cd ./credit-jambo-client-admin-saving-MS/client-admin-web
npm install
npm run dev
```

- Visit `http://localhost:5173`

## Quickstart Login

- Admin login:
  - Email: use `ADMIN_EMAIL` from your `.env`
  - Password: use `ADMIN_PASSWORD` from your `.env`
  - Device: ensure frontend uses the same `ADMIN_DEVICE_ID` set in `.env`
    - Example in browser console: `localStorage.setItem('deviceId','<YOUR_DEVICE_ID>')`
  - After login, admins redirect to `/admin/dashboard`

- Normal user login:
  - Register via `/register`
  - Device gets created pending verification; login requires a verified device

## API Endpoints

Base: `http://localhost:3001`

- Health:
  - `GET /health` → `{ status: 'OK', timestamp, service }`

- Auth:
  - `POST /api/auth/register`
    - Body: `{ email, password, firstName, lastName, deviceId }`
    - Returns: `{ message, user, device }`
  - `POST /api/auth/login`
    - Body: `{ email, password, deviceId }`
    - Returns: `{ token, user, device? }`
      - Token payload includes `{ userId, deviceId, role }`
      - Admin logins may auto-create/verify device if missing
  - `GET /api/auth/verify-token`
    - Header: `Authorization: Bearer <token>`
    - Returns: `{ user, device? }`

- Account (authenticated user):
  - `GET /api/account/balance`
  - `GET /api/account/transactions?limit=&offset=`
  - `POST /api/account/deposit`
  - `POST /api/account/withdraw`

- Admin (role enforced via middleware):
  - `GET /api/admin/users?limit=&offset=`
  - `GET /api/admin/users/:id`
  - More admin routes can be added similarly (devices, transactions audit, etc.)

## Frontend Routes

- Public: `/`, `/login`, `/register`
- Protected: `/app`, `/dashboard`, `/deposit`, `/withdraw`, `/transactions`
- Admin-protected: `/admin/dashboard`, `/admin/users`

Notes:
- Admin routes use a `RequireAdmin` guard in `client-admin-web`.
- Post-login, frontend redirects based on `user.role`:
  - `admin` → `/admin/dashboard`
  - `user` → `/app`

## Assumptions

- `PASSWORD_SALT` used to seed the admin must match the one in `.env`.
- Single shared DB across admin and client flows.
- Device policy enforced for users; admin device can be auto-created/verified.
- Vite dev server proxies `/api/*` to backend running on `3001`.

## Troubleshooting

- 401 “Invalid credentials”:
  - Ensure `.env` values are correct and salts match
- 401 “Device not registered” (normal user):
  - Register device via app; verify device
- 401 “Device pending verification”:
  - Verify device or adjust dev-only overrides
- DB connection errors:
  - Ensure Docker is running and ports are available
  - Check `DB_*` `.env` values

## Testing (PowerShell)

- Health:
```bash
Invoke-RestMethod -Uri "http://localhost:3001/health" -Method Get
```

- Admin login (replace placeholders):
```bash
Invoke-RestMethod -Uri "http://localhost:3001/api/auth/login" -Method Post -ContentType "application/json" -Body '{"email":"<ADMIN_EMAIL>","password":"<ADMIN_PASSWORD>","deviceId":"<YOUR_DEVICE_ID>"}'
```

- Use token for admin users:
```bash
$token = (Invoke-RestMethod -Uri "http://localhost:3001/api/auth/login" -Method Post -ContentType "application/json" -Body '{"email":"<ADMIN_EMAIL>","password":"<ADMIN_PASSWORD>","deviceId":"<YOUR_DEVICE_ID>"}').token
Invoke-RestMethod -Uri "http://localhost:3001/api/admin/users" -Headers @{ Authorization = "Bearer $token" } -Method Get
```

## Linting & Formatting

- Backend:
```bash
cd ./credit-jambo-client-admin-saving-MS/client-admin-backend
npm run lint
```

- Frontend:
```bash
cd ./credit-jambo-client-admin-saving-MS/client-admin-web
npm run lint
```

Be kind to your future self: keep `.env` tidy and secrets safe. 🫶