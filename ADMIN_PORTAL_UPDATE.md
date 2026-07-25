# Admin Portal Security Update

The Simulations admin portal is separated from the public map and uses wallet-signed server operations for database writes.

## Current Security Model

Before:

- Admin tools were visible in the primary map experience.
- Anyone with the UI could attempt edits.
- Legacy docs described password/session access.

Now:

- Public route `/` renders the read-only map experience.
- Admin route `/admin` renders the management interface.
- Admin writes require an authorized wallet signature.
- The server verifies the signature, nonce, wallet allowlist, and request origin.
- Service-role Supabase access stays server-side only.

## Important Files

```text
Simulations/
  src/pages/PublicMap.tsx
  src/pages/AdminPage.tsx
  src/admin/constants.ts
  src/services/adminApi.ts
  src/lib/supabase.ts
  src/lib/indexDatabase.ts
  api/admin/operations.ts
  api/_utils/cors.ts
```

## Admin Access Flow

```text
User opens /admin
User connects wallet
App checks wallet against admin allowlist
Admin action creates a signed operation payload
api/admin/operations.ts verifies signature and origin
Server performs the Supabase write with a service-role key
```

## Required Environment

Client-side Vite variables:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_THIRDWEB_CLIENT_ID=your-thirdweb-client-id
```

Server/runtime variables:

```env
SUPABASE_SERVICE_ROLE_KEY=your-server-only-service-role-key
SIMULATIONS_ADMIN_WALLETS=0xAdminWalletOne,0xAdminWalletTwo
SIMULATIONS_ALLOWED_ORIGIN=https://your-simulations-domain.example
SIMULATIONS_ALLOWED_ORIGINS=https://preview-one.example,https://preview-two.example
```

Never expose `SUPABASE_SERVICE_ROLE_KEY` through a `VITE_` variable.

## Operating Notes

- Keep `/admin` unlinked from public navigation unless there is a deliberate admin entry point.
- Rotate/remove wallets in `SIMULATIONS_ADMIN_WALLETS` when access changes.
- Production browser writes should come only from explicitly allowed origins.
- The legacy `/api/save-data` route is intentionally disabled for bulk unauthenticated writes.
