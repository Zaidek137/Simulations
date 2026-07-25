# Setup Guide for Simulations

## Environment Variables

Create `Simulations/.env.local`:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_THIRDWEB_CLIENT_ID=your-thirdweb-client-id
VITE_SIMULATIONS_ADMIN_WALLETS=0xAdminWalletOne,0xAdminWalletTwo
```

These are browser-readable Vite variables. `VITE_SIMULATIONS_ADMIN_WALLETS` only controls immediate admin UI visibility. Do not put service-role keys or private secrets in `VITE_*` variables.

## Server/Admin Environment

Admin writes require server-only variables in Vercel or your local serverless runtime:

```env
SUPABASE_SERVICE_ROLE_KEY=your-server-only-service-role-key
SIMULATIONS_ADMIN_WALLETS=0xAdminWalletOne,0xAdminWalletTwo
SIMULATIONS_ALLOWED_ORIGIN=http://localhost:5173
```

Use `SIMULATIONS_ALLOWED_ORIGINS` for multiple comma-separated origins.

## Supabase Credentials

1. Open the Supabase dashboard.
2. Select the project used by Simulations.
3. Go to `Settings > API`.
4. Copy the project URL to `VITE_SUPABASE_URL`.
5. Copy the anon/public key to `VITE_SUPABASE_ANON_KEY`.
6. Store the service-role key only in server/runtime settings.

## Database Migration

Apply the current Simulations and shared lore/index migrations before testing admin writes. If the Supabase CLI is available, use the documented migration flow for the project. If not, run the SQL files manually in the Supabase SQL editor.

## Local Development

```bash
cd Simulations
npm install
npm run dev
```

Open:

```text
http://localhost:5173
```

Admin route:

```text
http://localhost:5173/admin
```

Connect an authorized wallet before testing admin saves.

## Troubleshooting

### Missing Supabase environment variables

- Ensure `.env.local` exists in `Simulations`.
- Verify the variable names start with `VITE_`.
- Restart the dev server after editing `.env.local`.

### Unauthorized admin wallet

- Confirm the connected wallet is listed in `SIMULATIONS_ADMIN_WALLETS` and, if the browser UI is not opening, in `VITE_SIMULATIONS_ADMIN_WALLETS`.
- Restart/redeploy after changing server environment variables.

### Save request rejected

- Confirm the wallet signature prompt was approved.
- Confirm `SUPABASE_SERVICE_ROLE_KEY` is set server-side.
- Confirm the browser origin is listed in `SIMULATIONS_ALLOWED_ORIGIN` or `SIMULATIONS_ALLOWED_ORIGINS`.

### Database connection errors

- Verify the Supabase URL and anon key.
- Confirm the Supabase project is active.
- Confirm required migrations have been applied.
