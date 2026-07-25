# Simulations Architecture Overview

This document describes the current Simulations architecture after the Vite migration and signed wallet-admin hardening.

## Runtime Shape

```text
Browser
  -> Vite React app
  -> Public Supabase reads with anon key
  -> Signed admin operation requests for writes

Vercel serverless functions
  -> api/admin/operations.ts
  -> Supabase service-role client

Supabase
  -> Public read tables/policies for active map content
  -> Server-side writes from signed admin operations
```

## Public Flow

```text
User opens /
App reads active universe/map data
Supabase anon key performs allowed public reads
Map renders in the browser
No admin write controls are available on the public route
```

The public app uses only browser-readable Vite variables:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_THIRDWEB_CLIENT_ID=your-thirdweb-client-id
```

## Admin Flow

```text
Admin opens /admin
Admin connects an authorized wallet
Admin action creates a signed operation payload
api/admin/operations.ts validates:
  - method and origin
  - nonce freshness/replay protection
  - payload shape
  - wallet signature
  - wallet allowlist
Server writes to Supabase with a service-role key
```

Server-only variables:

```env
SUPABASE_SERVICE_ROLE_KEY=your-server-only-service-role-key
SIMULATIONS_ADMIN_WALLETS=0xAdminWalletOne,0xAdminWalletTwo
SIMULATIONS_ALLOWED_ORIGIN=https://your-production-domain.example
SIMULATIONS_ALLOWED_ORIGINS=https://preview-one.example,https://preview-two.example
```

## Important Boundaries

- The browser never receives `SUPABASE_SERVICE_ROLE_KEY`.
- Admin writes do not rely on a shared password or browser session.
- The legacy bulk save endpoint is disabled.
- Production browser writes require an allowed origin.
- Additional admins are configured by wallet address, not by client-side secrets.

## Key Files

```text
src/pages/PublicMap.tsx
src/pages/AdminPage.tsx
src/admin/constants.ts
src/services/adminApi.ts
src/lib/supabase.ts
src/lib/indexDatabase.ts
api/admin/operations.ts
api/_utils/cors.ts
api/save-data.ts
```

## Security Layers

Public users:

- Can read active map content.
- Cannot access service-role credentials.
- Cannot perform admin writes through the client.

Authorized admins:

- Must connect an allowlisted wallet.
- Must sign each admin operation.
- Can write only through the validated server operation endpoint.

Server functions:

- Enforce CORS/origin policy.
- Reject replayed nonces.
- Validate payload types before mutation.
- Use server-only Supabase credentials for writes.

## Deployment Model

Simulations is a Vite app deployed from the `Simulations` root. Production output is `dist`, and serverless functions live under `api/`.
