# 🚀 Setup Guide for Interactive Universe Map

## Environment Variables Setup

Create a `.env.local` file in the `Interactive Website` directory with the following content:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Where to Find Your Supabase Credentials

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project (same one used for main Scavenjer site)
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **Project API keys** → **anon/public** → `VITE_SUPABASE_ANON_KEY`

## Database Migration

Run the migration to create the lore tables:

### Option 1: Using Supabase CLI (Recommended)

```bash
cd ../scavenjersite
supabase db push
```

### Option 2: Manual SQL Execution

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Open the file: `scavenjersite/supabase/migrations/20250601000000_create_lore_system.sql`
4. Copy and paste the entire SQL content
5. Click **Run**

## Verify Setup

After running the migration, verify the tables were created:

```sql
-- Run this in Supabase SQL Editor
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'lore_%';
```

You should see:
- `lore_regions`
- `lore_locations`
- `lore_config`

## Admin Access Setup

To enable admin functionality, ensure your user is in the `admin_users` table:

```sql
-- Check if admin_users table exists
SELECT * FROM admin_users WHERE email = 'your-email@example.com';
```

If you need to add yourself as an admin, contact your database administrator or use the existing admin portal on the main site.

## Next Steps

1. ✅ Install dependencies: `npm install`
2. ✅ Create `.env.local` with Supabase credentials
3. ✅ Run database migration
4. ✅ Start dev server: `npm run dev`
5. ✅ Visit http://localhost:3000
6. ✅ Test the admin portal (bottom-right corner)

## Troubleshooting

### "Missing Supabase environment variables"
- Ensure `.env.local` exists in the `Interactive Website` folder
- Verify the variable names start with `VITE_`
- Restart the dev server after creating `.env.local`

### "Unauthorized: Admin access required"
- Ensure you're signed in (admin portal, bottom-right)
- Verify your user exists in `admin_users` table
- Check that `is_active = true` for your admin user

### Database connection errors
- Verify your Supabase URL is correct
- Check that your anon key is valid
- Ensure your Supabase project is active (not paused)

