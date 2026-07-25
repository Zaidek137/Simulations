# Admin Quick Start Guide

This guide describes the current Simulations admin flow. Admin access is wallet-based, and database writes are sent through the signed server API. There is no shared admin secret.

## Installation

```bash
cd Simulations
npm install
```

## Local Environment

Create `Simulations/.env.local`:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_THIRDWEB_CLIENT_ID=your-thirdweb-client-id
VITE_SIMULATIONS_ADMIN_WALLETS=0xAdminWalletOne,0xAdminWalletTwo
```

The local Vite app can read only `VITE_*` variables. `VITE_SIMULATIONS_ADMIN_WALLETS` is only for immediate client UI visibility; server-side authorization remains required for writes. Do not put service-role keys in client-prefixed variables.

For local testing of the signed admin API, also configure the server/runtime environment where the Vercel functions run:

```env
SUPABASE_SERVICE_ROLE_KEY=your-server-only-service-role-key
SIMULATIONS_ADMIN_WALLETS=0xAdminWalletOne,0xAdminWalletTwo
SIMULATIONS_ALLOWED_ORIGIN=http://localhost:5173
```

There is no built-in source-code admin wallet. Use `SIMULATIONS_ADMIN_WALLETS` for the signed server API and mirror those wallets in `VITE_SIMULATIONS_ADMIN_WALLETS` when the browser should show admin UI immediately.

## Run Locally

```bash
npm run dev
```

Vite normally serves the app at:

```text
http://localhost:5173
```

## Access Admin

1. Open `http://localhost:5173/admin`.
2. Connect an authorized wallet.
3. Admin writes are signed by the connected wallet and verified by `api/admin/operations.ts`.
4. Disconnect the wallet when finished.

## Quick Actions

### Create a Universe

1. Click `+ New Universe`.
2. Expand the new universe card.
3. Edit the details.
4. Click `Apply Changes`.
5. Click `Save` to persist through the signed admin API.

### Position a Universe

1. Expand the universe card.
2. Use `Reposition`.
3. Click the map location.
4. Apply and save.

### Add a Location

1. Expand a universe.
2. Use `+ Add` in the locations section.
3. Click the map where the location belongs.
4. Fill in the details.
5. Apply and save.

## Troubleshooting

### Admin access is denied

- Confirm the connected wallet is listed in `SIMULATIONS_ADMIN_WALLETS` for server writes and, if needed, `VITE_SIMULATIONS_ADMIN_WALLETS` for immediate browser UI access.
- Confirm the admin API has access to `SUPABASE_SERVICE_ROLE_KEY`.
- Confirm the browser origin is allowed by `SIMULATIONS_ALLOWED_ORIGIN` or `SIMULATIONS_ALLOWED_ORIGINS`.

### Changes do not save

- Check the browser console for the signed admin API response.
- Confirm `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are present.
- Confirm the serverless function environment has the service-role key.
- Confirm your wallet prompt was signed and not rejected.

### Public users can see admin tools

- Public users should only access `/`.
- Admin tooling is on `/admin` and requires an authorized wallet for writes.
