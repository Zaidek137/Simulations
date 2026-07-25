# Simulations Setup Checklist

Use this checklist before local testing, deployment, or handoff.

## Database

- [ ] Supabase project exists.
- [ ] Required SQL migrations have been applied.
- [ ] Public read policies allow active map content to load.
- [ ] Admin write policies do not allow anonymous client-side writes.
- [ ] Service-role writes are performed only by the signed admin API.

## Local Development

- [ ] Node.js is installed.
- [ ] Dependencies are installed with `npm install`.
- [ ] `Simulations/.env.local` exists.
- [ ] `VITE_SUPABASE_URL` is set.
- [ ] `VITE_SUPABASE_ANON_KEY` is set.
- [ ] `VITE_THIRDWEB_CLIENT_ID` is set if wallet UI is required.
- [ ] `npm run dev` starts successfully.
- [ ] Site loads at `http://localhost:5173`.

## Admin Runtime Environment

- [ ] `SUPABASE_SERVICE_ROLE_KEY` is set server-side only.
- [ ] `SIMULATIONS_ADMIN_WALLETS` lists every active admin wallet that is not built into source.
- [ ] `SIMULATIONS_ALLOWED_ORIGIN` is set for the primary deployed URL.
- [ ] `SIMULATIONS_ALLOWED_ORIGINS` is set for preview URLs if needed.
- [ ] No service-role key is exposed with a `VITE_` prefix.

## Functionality Tests

- [ ] Public map renders correctly.
- [ ] Zoom and pan work.
- [ ] Regions/universes are visible.
- [ ] Locations render and open details.
- [ ] `/admin` loads the admin interface.
- [ ] Unauthorized wallets cannot perform admin writes.
- [ ] Authorized wallets can save through the signed admin API.
- [ ] Saved changes persist after refresh.
- [ ] Legacy `/api/save-data` bulk writes remain disabled.

## Deployment

- [ ] Root directory is `Simulations`.
- [ ] Framework/build is Vite.
- [ ] Build command is `npm run build`.
- [ ] Output directory is `dist`.
- [ ] Production env variables are set.
- [ ] Preview env variables are set.
- [ ] Deployment URL loads without console errors.

## Security

- [ ] `.env.local` is ignored by Git.
- [ ] No secrets are committed.
- [ ] Supabase service-role key is server-only.
- [ ] Admin wallet list is reviewed.
- [ ] Production origins are explicitly allowlisted.
- [ ] Admin route is not exposed as a public navigation item unless intentional.
- [ ] Error messages do not leak service-role details.

## Browser and Mobile

- [ ] Chrome passes a smoke test.
- [ ] Safari or iOS Safari passes a smoke test.
- [ ] Edge or Firefox passes a smoke test.
- [ ] Mobile touch pan and zoom work.
- [ ] Admin controls remain usable on a narrow viewport.

## Release

- [ ] `npm run lint` passes.
- [ ] `npm run build` passes.
- [ ] Relevant docs are current.
- [ ] Git diff has been reviewed.
