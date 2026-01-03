# 🚀 Deployment Guide: Interactive Universe Map

## Prerequisites

- ✅ Supabase project (can use existing Scavenjer project)
- ✅ Vercel account
- ✅ Git repository

---

## Part 1: Database Setup

### Step 1: Run the Migration

You have two options:

#### Option A: Using Supabase CLI (Recommended)

```bash
cd ../scavenjersite
supabase db push
```

#### Option B: Manual SQL Execution

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **SQL Editor**
4. Open file: `scavenjersite/supabase/migrations/20250601000000_create_lore_system.sql`
5. Copy entire contents and paste into SQL Editor
6. Click **Run**

### Step 2: Verify Tables Created

Run this query in Supabase SQL Editor:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'lore_%'
ORDER BY table_name;
```

Expected output:
- `lore_config`
- `lore_locations`
- `lore_regions`

### Step 3: Verify Admin Access

Check if your admin user exists:

```sql
SELECT id, email, is_active 
FROM admin_users 
WHERE email = 'your-email@example.com';
```

If you're not in the `admin_users` table, you'll need to be added by an existing admin or database administrator.

---

## Part 2: Local Development Setup

### Step 1: Install Dependencies

```bash
cd "Interactive Website"
npm install
```

### Step 2: Create Environment File

Create `.env.local` in the `Interactive Website` folder:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**Where to find these values:**
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **Project API keys** → **anon/public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Step 3: Test Locally

```bash
npm run dev
```

Visit http://localhost:3000

**Test checklist:**
- ✅ Map loads without errors
- ✅ Can zoom and pan
- ✅ Can click on regions
- ✅ Admin portal appears (bottom-right corner)
- ✅ Data loads from Supabase (check browser console for "✅ Loaded data from Supabase")

---

## Part 3: Vercel Deployment

### Step 1: Push to Git

Ensure your changes are committed and pushed:

```bash
git add .
git commit -m "Add Interactive Universe Map with Supabase integration"
git push
```

### Step 2: Create New Vercel Project

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import your Git repository
4. **Important:** Set **Root Directory** to `Interactive Website`
5. Vercel will auto-detect Next.js framework

### Step 3: Configure Environment Variables

In Vercel project settings, add these environment variables:

| Name | Value | Environment |
|------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://your-project-id.supabase.co` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `your-anon-key-here` | Production, Preview, Development |

**How to add:**
1. In Vercel project → **Settings** → **Environment Variables**
2. Add each variable
3. Select all environments (Production, Preview, Development)
4. Click **Save**

### Step 4: Deploy

1. Click **"Deploy"**
2. Wait for build to complete (~2-3 minutes)
3. Visit your deployment URL

### Step 5: Configure Custom Domain (Optional)

**Recommended subdomains:**
- `lore.scavenjer.com`
- `universes.scavenjer.com`
- `map.scavenjer.com`

**Setup:**
1. In Vercel project → **Settings** → **Domains**
2. Click **"Add"**
3. Enter your subdomain (e.g., `lore.scavenjer.com`)
4. Follow DNS configuration instructions
5. Wait for DNS propagation (~5-60 minutes)

---

## Part 4: Update Main Scavenjer Site

### Update Navigation Links

**File:** `scavenjersite/src/components/Header.tsx`

Find the "Scavenjer Uprise" link (around line 123) and update:

```typescript
// OLD:
<button 
  onClick={() => handleNavigation('/universe')}
  className="dropdown-item-highlighted"
>

// NEW:
<a 
  href="https://lore.scavenjer.com"  // Your deployed URL
  target="_blank"
  rel="noopener noreferrer"
  className="dropdown-item-highlighted"
>
```

**File:** `scavenjersite/src/components/MobileMenu.tsx`

Update mobile navigation similarly.

### Deploy Main Site Changes

```bash
cd ../scavenjersite
git add .
git commit -m "Update universes navigation to point to new lore map"
git push
```

---

## Part 5: Initial Data Population

### Option 1: Use Admin Portal (Recommended for Small Datasets)

1. Visit your deployed site
2. Click admin portal (bottom-right)
3. Sign in with admin credentials
4. Add regions and locations manually
5. Click **"Save Changes to File"** to persist to Supabase

### Option 2: Bulk Import via SQL (For Large Datasets)

If you have existing data, you can bulk insert:

```sql
-- Example: Insert a region
INSERT INTO lore_regions (
  region_id, name, description, color, cx, cy,
  thumb_url, background_url, image_url
) VALUES (
  'nebula-prime',
  'ALPHA ONE',
  'The central hub of the galaxy',
  '#4f46e5',
  500,
  300,
  '/images/nebula-prime-thumb.png',
  '/images/nebula-prime.png',
  '/images/nebula-prime.png'
);

-- Example: Insert a location
INSERT INTO lore_locations (
  location_id, region_id, name, description, cx, cy,
  location_type, thumb_url
) VALUES (
  'prime-core',
  (SELECT id FROM lore_regions WHERE region_id = 'nebula-prime'),
  'The Core',
  'Central command of the hub',
  400,
  350,
  'station',
  '/images/nebula-prime-thumb.png'
);
```

### Option 3: Programmatic Import

Use the bulk upsert function in your code:

```typescript
import { bulkUpsertData } from '@/lib/supabase';

const regions = [
  {
    region_id: 'nebula-prime',
    name: 'ALPHA ONE',
    // ... other fields
    locations: [
      {
        location_id: 'prime-core',
        name: 'The Core',
        // ... other fields
      }
    ]
  }
];

await bulkUpsertData(regions);
```

---

## Part 6: Post-Deployment Checklist

### Functionality Tests

- [ ] Site loads without errors
- [ ] Map is interactive (zoom/pan works)
- [ ] Regions are clickable and show details
- [ ] Locations appear when zooming into regions
- [ ] Admin portal is accessible
- [ ] Admin can sign in
- [ ] Admin can add/edit regions
- [ ] Admin can add/edit locations
- [ ] Changes persist after page reload
- [ ] Data syncs across devices

### Performance Tests

- [ ] Initial load time < 3 seconds
- [ ] Smooth zoom/pan animations
- [ ] No console errors
- [ ] Images load properly
- [ ] Video background plays (if configured)

### Mobile Tests

- [ ] Responsive layout on mobile
- [ ] Touch zoom/pan works
- [ ] Admin portal accessible on mobile
- [ ] All buttons are tappable

---

## Troubleshooting

### Build Fails on Vercel

**Error:** "Missing environment variables"
- **Fix:** Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Vercel project settings

**Error:** "Module not found: @supabase/supabase-js"
- **Fix:** Ensure `package.json` includes `@supabase/supabase-js` dependency
- Run `npm install @supabase/supabase-js` locally and commit

### Data Not Loading

**Symptom:** Map shows default data, not Supabase data
- **Check:** Browser console for errors
- **Verify:** Environment variables are set correctly
- **Test:** Run this in browser console:
  ```javascript
  console.log(process.env.NEXT_PUBLIC_SUPABASE_URL);
  ```
  Should output your Supabase URL

**Symptom:** "Failed to fetch" errors
- **Check:** Supabase project is active (not paused)
- **Verify:** Anon key is correct
- **Test:** Visit your Supabase project URL in browser

### Admin Portal Not Working

**Symptom:** "Unauthorized: Admin access required"
- **Check:** You're signed in (admin portal shows user info)
- **Verify:** Your user exists in `admin_users` table
- **Run SQL:**
  ```sql
  SELECT * FROM admin_users WHERE email = 'your-email@example.com';
  ```

**Symptom:** Can't sign in
- **Check:** Supabase Auth is enabled
- **Verify:** User exists in auth.users table
- **Fix:** Create user via Supabase Dashboard → Authentication → Users

---

## Monitoring & Maintenance

### Vercel Analytics

Enable analytics in Vercel project settings to monitor:
- Page views
- Load times
- Error rates

### Supabase Monitoring

Monitor database usage:
1. Supabase Dashboard → **Reports**
2. Check:
   - Database size
   - API requests
   - Active connections

### Regular Backups

Supabase automatically backs up your database, but you can also:

```bash
# Export data as JSON
supabase db dump --data-only > lore_backup.sql
```

---

## Scaling Considerations

### If You Expect High Traffic

1. **Enable Vercel Edge Caching**
   - Static assets are cached by default
   - Consider ISR (Incremental Static Regeneration) for data

2. **Optimize Images**
   - Use Next.js Image component
   - Upload images to CDN (ImageKit, Cloudinary)
   - Update URLs in database

3. **Database Connection Pooling**
   - Supabase handles this automatically
   - Monitor connection limits in dashboard

### If Dataset Grows Large

1. **Pagination**
   - Implement pagination for regions/locations
   - Load data on-demand

2. **Caching**
   - Add Redis/Vercel KV for frequently accessed data
   - Cache region data for 5-10 minutes

---

## Support

For issues or questions:
1. Check browser console for errors
2. Check Vercel deployment logs
3. Check Supabase logs (Dashboard → Logs)
4. Contact development team

---

## Security Notes

✅ **Safe to expose:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

❌ **NEVER expose:**
- `SUPABASE_SERVICE_ROLE_KEY` (not used in this project)
- Database passwords
- Admin credentials

All write operations are protected by:
- Row Level Security (RLS)
- Admin-only RPC functions
- JWT token verification

---

## Success! 🎉

Your Interactive Universe Map is now live and integrated with your Scavenjer ecosystem!

**Next steps:**
- Populate with lore content
- Share with your community
- Monitor analytics
- Gather feedback

