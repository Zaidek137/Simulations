# Save Error Troubleshooting

This note replaces earlier legacy shared-secret troubleshooting. The current Simulations app uses wallet-signed admin operations, not session-based Supabase Auth.

## Current Save Path

```text
AdminPage / admin components
  -> src/services/adminApi.ts
  -> api/admin/operations.ts
  -> Supabase with SUPABASE_SERVICE_ROLE_KEY
```

Legacy unauthenticated bulk save endpoints are intentionally disabled.

## Common Save Failures

### 1. Admin wallet is not authorized

Symptoms:

- Save request returns `401` or `403`.
- Browser shows a signed admin operation error.

Fix:

- Connect the correct wallet.
- Add additional wallets with server-side `SIMULATIONS_ADMIN_WALLETS`.
- Restart/redeploy after changing the environment.

### 2. Service-role key is missing

Symptoms:

- Public data loads, but writes fail.
- Function logs mention missing Supabase service key.

Fix:

- Set `SUPABASE_SERVICE_ROLE_KEY` in the server/runtime environment.
- Never expose this key through any client-prefixed environment variable.

### 3. Browser origin is not allowlisted

Symptoms:

- Request is rejected before the operation runs.
- Function logs mention CORS or disallowed origin.

Fix:

```env
SIMULATIONS_ALLOWED_ORIGIN=https://your-production-domain.example
SIMULATIONS_ALLOWED_ORIGINS=https://preview-one.example,https://preview-two.example
```

For local development:

```env
SIMULATIONS_ALLOWED_ORIGIN=http://localhost:5173
```

### 4. Wallet signature was rejected

Symptoms:

- Save attempt starts but fails after the wallet prompt.
- No database mutation occurs.

Fix:

- Approve the wallet signature prompt.
- Confirm the connected wallet did not change between edit and save.
- Retry after refreshing the admin page.

### 5. Database policies or migrations are incomplete

Symptoms:

- Signed API verifies successfully, but Supabase returns table, RPC, or policy errors.

Fix:

- Apply the current database migrations.
- Confirm the target tables and RPC functions exist.
- Confirm the server API uses a service-role Supabase client.

## What Not To Do

- Do not grant broad anonymous write access to fix admin saves.
- Do not expose the service-role key in client-side env variables.
- Do not restore legacy shared-secret admin access unless a new secure design is implemented.
- Do not re-enable `/api/save-data` without authentication, origin checks, payload validation, and rate limits.
