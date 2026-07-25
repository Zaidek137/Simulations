# Admin Portal Guide

## Security Overview

The Admin Portal lives at `/admin` and is no longer part of the public map route. Access is controlled by wallet authorization, and persistent writes are handled by a signed server API.

There is no shared admin secret. Do not add legacy shared-secret admin variables or client-side service-role keys.

## Quick Start

### 1. Open the Admin Portal

Local:

```text
http://localhost:5173/admin
```

Production:

```text
https://your-domain.example/admin
```

### 2. Connect an Authorized Wallet

The connected wallet must be authorized by the server-side `SIMULATIONS_ADMIN_WALLETS` variable or by the database `is_admin` RPC. Mirror admin wallets in `VITE_SIMULATIONS_ADMIN_WALLETS` only when the browser should show admin UI immediately.

### 3. Save Through Signed Operations

When you save, the app signs an operation payload with the active wallet. `api/admin/operations.ts` verifies the signature and performs the Supabase write from the server.

## Required Environment Variables

Client-side Vite variables:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_THIRDWEB_CLIENT_ID=your-thirdweb-client-id
VITE_SIMULATIONS_ADMIN_WALLETS=0xAdminWalletOne,0xAdminWalletTwo
```

Server/runtime variables:

```env
SUPABASE_SERVICE_ROLE_KEY=your-server-only-service-role-key
SIMULATIONS_ADMIN_WALLETS=0xAdminWalletOne,0xAdminWalletTwo
SIMULATIONS_ALLOWED_ORIGIN=https://your-simulations-domain.example
SIMULATIONS_ALLOWED_ORIGINS=https://preview-one.example,https://preview-two.example
```

## Features

### Public View (`/`)

- Interactive Universe Map
- Codex/lore browsing
- Location overlays
- No admin write controls

### Admin View (`/admin`)

- Universe management
- Location management
- Coordinate picker
- Supabase persistence through signed operations
- Public map preview

## Admin Operation Flow

1. Open `/admin`.
2. Connect an authorized wallet.
3. Make changes in the admin panel.
4. Save changes.
5. The app signs the operation payload.
6. The server validates the wallet signature, nonce, origin, and operation type.
7. The server writes to Supabase using `SUPABASE_SERVICE_ROLE_KEY`.

## Production Checklist

- `SUPABASE_SERVICE_ROLE_KEY` is configured only in server/runtime settings.
- No service-role key is committed or exposed with a `VITE_` prefix.
- `SIMULATIONS_ADMIN_WALLETS` includes only active administrator wallets.
- Production domains are allowlisted with `SIMULATIONS_ALLOWED_ORIGIN` or `SIMULATIONS_ALLOWED_ORIGINS`.
- `/api/save-data` remains disabled unless a new authenticated replacement is built.

## Troubleshooting

### Admin actions are rejected

- Confirm the connected wallet is authorized.
- Confirm the wallet signature prompt was approved.
- Confirm server env includes `SUPABASE_SERVICE_ROLE_KEY`.
- Confirm the current browser origin is allowlisted.

### Data loads but will not save

- Public reads can work with only `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- Writes also require the signed admin API and server-side service-role key.
- Check the Vercel function logs or local serverless logs for the rejected operation reason.

### An admin wallet should be removed

- Remove it from `SIMULATIONS_ADMIN_WALLETS`.
- Redeploy or restart the serverless environment so the new setting is active.

## Related Files

- `src/pages/AdminPage.tsx`
- `src/pages/PublicMap.tsx`
- `src/admin/constants.ts`
- `src/services/adminApi.ts`
- `src/lib/supabase.ts`
- `src/lib/indexDatabase.ts`
- `api/admin/operations.ts`
- `api/_utils/cors.ts`
