# Quick Start Guide

Get the Simulations universe map running locally with the current Vite and wallet-admin setup.

## 1. Database

Use the existing Supabase project for Scavenjer/Simulations, or create a new Supabase project.

Apply the current migrations for this package and the shared lore/index tables before expecting live data writes to succeed. If the Supabase CLI is not available, run the SQL files through the Supabase SQL editor.

## 2. Environment Variables

Create `Simulations/.env.local`:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_THIRDWEB_CLIENT_ID=your-thirdweb-client-id
```

For admin writes, configure these server/runtime variables in Vercel or your local serverless function environment:

```env
SUPABASE_SERVICE_ROLE_KEY=your-server-only-service-role-key
SIMULATIONS_ADMIN_WALLETS=0xAdminWalletOne,0xAdminWalletTwo
SIMULATIONS_ALLOWED_ORIGIN=http://localhost:5173
```

Use `SIMULATIONS_ALLOWED_ORIGINS` for multiple comma-separated origins.

## 3. Install and Run

```bash
cd Simulations
npm install
npm run dev
```

Open:

```text
http://localhost:5173
```

## 4. Test the Public Map

- Map loads.
- Zoom and pan work.
- Universe/region data renders from Supabase or fallback data.
- No admin write controls appear on `/`.

## 5. Test Admin

1. Open `http://localhost:5173/admin`.
2. Connect an authorized wallet.
3. Make a small content edit.
4. Save.
5. Confirm the signed admin API accepts the operation.
6. Refresh and confirm the change persists.

## Deploy to Vercel

1. Import the repository.
2. Set the root directory to `Simulations`.
3. Use the Vite build command: `npm run build`.
4. Use `dist` as the output directory.
5. Add the client and server environment variables listed above.
6. Deploy.

## Troubleshooting

### Missing Supabase environment variables

- Confirm `.env.local` exists in `Simulations`.
- Confirm the variables use `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- Restart the dev server after changing env files.

### Admin wallet is unauthorized

- Confirm the connected wallet address matches the built-in admin wallet or `SIMULATIONS_ADMIN_WALLETS`.
- Confirm address casing is not the issue; comparisons should be lowercase-safe.

### Save fails in production

- Confirm `SUPABASE_SERVICE_ROLE_KEY` is set server-side.
- Confirm the browser origin is allowlisted.
- Check function logs for signature, nonce, payload, or origin validation errors.

## Success Checklist

- Database migrations applied.
- Local dev server runs.
- Public map loads.
- Admin route requires an authorized wallet for writes.
- Signed admin save works.
- Production env separates public `VITE_*` variables from server-only secrets.
