# Credit Jambo — Client + Admin Savings MS

## About this project
- Single codebase with both client and admin features.
- One backend (`client-admin-backend`) exposing client and admin APIs.
- One frontend (`client-admin-web`) with user and admin UIs.
- One PostgreSQL database shared by all modules.

## Repo Layout
- `client-admin-backend/` — Express + Sequelize API (default `http://localhost:3001`).
- `client-admin-web/` — Vite + React SPA (default dev at `http://localhost:5173`).
- Docker PostgreSQL (default `5432`).

## Prerequisites
- Windows or macOS.
- `Node.js >= 18`, `npm`.
- Docker Desktop.
- A terminal (PowerShell on Windows is great).

## Environment Setup
- Backend `.env` (use `.env.example` as reference):
  - `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`, `NODE_ENV`.
  - `JWT_SECRET`, `JWT_EXPIRES_IN`, `ADMIN_JWT_SECRET`, `ADMIN_JWT_EXPIRES_IN`.
  - `PASSWORD_SALT`, `CORS_ORIGIN`.
  - `ADMIN_DEVICE_ID`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`.
- Frontend `.env`:
  - `VITE_CLIENT_API_URL=http://localhost:3001` (for direct API calls; dev proxy can also be used).

## Step‑By‑Step: Getting Started
1) Start PostgreSQL via Docker
   - `docker compose up -d`
2) Install and run the backend
   - `cd ./credit-jambo-client-admin-saving-MS/client-admin-backend`
   - `npm install`
   - On boot: connects to DB, seeds an admin user + verified admin device, and serves on `3001`.
3) Install and run the frontend
   - `cd ./credit-jambo-client-admin-saving-MS/client-admin-web`
   - `npm install`
   - `npm run dev`
   - Open `http://localhost:5173` (or whatever Vite chooses, e.g., `5175`).

## Using the Client‑Admin Web
- Login as admin using `ADMIN_EMAIL` and `ADMIN_PASSWORD` from backend `.env`.
- Admins land on `/admin/dashboard` and can:
  - View users, balances, devices, transactions.
  - Toggle user access (deny/restore).
  - Assign devices, verify devices, delete devices.
  - Delete users (and related devices, account, transactions).
- Normal users (role `user`) can:
  - View balance and transaction history.
  - Deposit and withdraw (subject to device verification policy below).

## Using the Client‑Admin Backend
- Runs at `http://localhost:3001`.
- Enforces authentication (`Bearer <token>` header) and admin role where needed.
- Seeds one admin with a verified device at startup.
- Logs helpful messages; consistent JSON responses using shared helpers.

## Device Verification Policy
- Admins: bypass device checks for login and operations.
- Normal users:
  - Must login with a `deviceId` that is registered to their account.
  - The device must be verified before login succeeds.
  - Registration creates a device with `isVerified=false`; an admin needs to verify it.
  - After verification, users can log in and perform deposit/withdraw.

## API Endpoints
- Base URL: `http://localhost:3001`

- Health
  - `GET /health` → `{ status: 'OK', timestamp, service }`

- Auth
  - `POST /api/auth/register`
    - Body: `{ email, password, firstName, lastName, deviceId? }`
    - Returns: `{ message, user, device }`
  - `POST /api/auth/login`
    - Body: `{ email, password, deviceId? }`
    - Normal users require a registered, verified device; admins bypass.
    - Returns: `{ token, user }`
  - `GET /api/auth/verify-token`
    - Header: `Authorization: Bearer <token>`
    - Returns: `{ user, device? }`
  - `POST /api/auth/request-password-reset`
    - Body: `{ email }`
    - Returns: generic message and, in non‑prod, a temp password for testing.

- Account (Authenticated as user)
  - `GET /api/account/balance`
  - `GET /api/account/transactions?limit=&offset=`
  - `POST /api/account/deposit` (requires verified device; admins bypass)
  - `POST /api/account/withdraw` (requires verified device; admins bypass)

- Admin (Authenticated as admin)
  - `GET /api/admin/users?limit=&offset=`
  - `GET /api/admin/users/:id`
  - `GET /api/admin/users/:id/details`
  - `PATCH /api/admin/users/:id/access` (Body: `{ isActive: boolean }`)
  - `GET /api/admin/accounts`
  - `GET /api/admin/transactions` (filters: `type`, `status`, `userId`)
  - `GET /api/admin/devices` (optional `userId` query)
  - `POST /api/admin/devices/:deviceId/verify`
  - `DELETE /api/admin/devices/:deviceId`
  - `POST /api/admin/users/:id/devices` (Body: `{ deviceId?, isVerified? }`)
  - `DELETE /api/admin/users/:id`
  - `GET /api/admin/stats`

## Frontend Routes
- Public: `/`, `/login`, `/register`.
- Auth‑protected: `/app`, `/dashboard`, `/deposit`, `/withdraw`, `/transactions`.
- Admin‑protected: `/admin/dashboard`, `/admin/users`, `/admin/devices`, `/admin/stats`.
- Redirects after login:
  - `admin` → `/admin/dashboard`
  - `user` → main app (`/app` or `/dashboard`).

## Assumptions
- One database powers both client and admin features.
- Admin seeding uses `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_DEVICE_ID` and `PASSWORD_SALT`.
- CORS permits local dev origins: set `CORS_ORIGIN` accordingly (e.g., `http://localhost:5173`).
- Frontend can call APIs directly via `VITE_CLIENT_API_URL` or through dev proxy.

## Beginner‑Friendly Testing
- PowerShell: health check
  - `Invoke-RestMethod -Uri "http://localhost:3001/health" -Method Get`
- PowerShell: admin login
  - `Invoke-RestMethod -Uri "http://localhost:3001/api/auth/login" -Method Post -ContentType "application/json" -Body '{"email":"<ADMIN_EMAIL>","password":"<ADMIN_PASSWORD>"}'`
- PowerShell: use token
  - `$token = (Invoke-RestMethod -Uri "http://localhost:3001/api/auth/login" -Method Post -ContentType "application/json" -Body '{"email":"<ADMIN_EMAIL>","password":"<ADMIN_PASSWORD>"}').token`
  - `Invoke-RestMethod -Uri "http://localhost:3001/api/admin/users" -Headers @{ Authorization = "Bearer $token" } -Method Get`

## Linting & Formatting
- Backend
  - `cd ./credit-jambo-client-admin-saving-MS/client-admin-backend`
  - `npm run lint`
- Frontend
  - `cd ./credit-jambo-client-admin-saving-MS/client-admin-web`
  - `npm run lint`

## Troubleshooting Tips
- 401 “Invalid credentials”
  - Check email/password and that admin seed ran.
- 401 “Device not registered” (normal user)
  - Ensure you provided `deviceId` that was created for that user.
- 401 “Device pending verification”
  - Ask admin to verify the device via Admin UI or `/api/admin/devices/:id/verify`.
- DB connection errors
  - Verify Docker is running; validate `DB_*` values in `.env`.

## Final Notes
- Keep `.env` secrets safe; never commit them.
- Use consistent environments (dev vs prod) and update `CORS_ORIGIN` accordingly.
- We’ve standardized backend responses and frontend helpers to keep the code clean and readable. It should feel modern and welcoming — like a caring sibling guiding you. 

 