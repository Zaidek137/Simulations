# ⚡ Quick Start Guide

Get your Interactive Universe Map running in 10 minutes!

## 🎯 Answer These Questions First

### Q1: Do you have a Supabase project?
- **YES** → Use your existing Scavenjer Supabase project ✅
- **NO** → Create one at [supabase.com](https://supabase.com) (free tier available)

### Q2: Are you an admin in the database?
- **YES** → Great! You can manage content ✅
- **NO** → Ask an existing admin to add you to `admin_users` table
- **DON'T KNOW** → Run this SQL in Supabase to check:
  ```sql
  SELECT * FROM admin_users WHERE email = 'your-email@example.com';
  ```

---

## 🚀 5-Step Setup

### Step 1: Database (5 min)

1. Open [Supabase Dashboard](https://app.supabase.com)
2. Go to **SQL Editor**
3. Copy contents of `scavenjersite/supabase/migrations/20250601000000_create_lore_system.sql`
4. Paste and click **Run**
5. Verify: You should see "Success" message

### Step 2: Environment Variables (2 min)

1. In Supabase Dashboard → **Settings** → **API**
2. Copy **Project URL** and **anon public key**
3. Create `Interactive Website/.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=paste-project-url-here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=paste-anon-key-here
   ```

### Step 3: Install & Run (2 min)

```bash
cd "Interactive Website"
npm install
npm run dev
```

Visit: http://localhost:3000

### Step 4: Test (1 min)

- ✅ Map loads?
- ✅ Can zoom/pan?
- ✅ Console shows "✅ Loaded data from Supabase"?
- ✅ Admin portal in bottom-right?

**All good?** → Proceed to Step 5
**Issues?** → See [Troubleshooting](#troubleshooting) below

### Step 5: Deploy to Vercel (5 min)

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your Git repo
3. Set **Root Directory** to `Interactive Website`
4. Add environment variables (same as Step 2)
5. Click **Deploy**
6. Wait ~2 minutes
7. Visit your deployment URL

**Done!** 🎉

---

## 🎨 Optional: Add Your First Lore

1. Click admin portal (bottom-right)
2. Sign in with your admin email
3. Click **"+ Add New Universe"**
4. Fill in details:
   - Name: "Test Universe"
   - Description: "My first lore entry"
   - Color: Pick any color
5. Click **"Save Changes to File"**
6. Refresh page → Your universe appears!

---

## 🔗 Update Main Site Navigation

In `scavenjersite/src/components/Header.tsx` (around line 123):

```typescript
// Change this:
onClick={() => handleNavigation('/universe')}

// To this:
href="https://your-vercel-url.vercel.app"  // Your deployment URL
target="_blank"
rel="noopener noreferrer"
```

---

## 🐛 Troubleshooting

### "Missing Supabase environment variables"
→ Check `.env.local` exists and has correct variable names (with `NEXT_PUBLIC_` prefix)
→ Restart dev server after creating `.env.local`

### "Unauthorized: Admin access required"
→ Verify you're in `admin_users` table (see Q2 above)
→ Make sure `is_active = true` for your user

### Map shows default data, not Supabase data
→ Check browser console for errors
→ Verify Supabase URL and key are correct
→ Ensure migration ran successfully (Step 1)

### Build fails on Vercel
→ Ensure environment variables are added in Vercel settings
→ Check that `@supabase/supabase-js` is in `package.json`

---

## 📚 Next Steps

- **Add Content:** Use admin portal to add regions and locations
- **Customize:** Update colors, images, descriptions
- **Share:** Send link to your team for feedback
- **Monitor:** Check Vercel analytics for usage

---

## 📖 Full Documentation

- **Setup Details:** See `SETUP.md`
- **Deployment Guide:** See `DEPLOYMENT.md`
- **Integration Info:** See `INTEGRATION_SUMMARY.md`

---

## 💡 Pro Tips

1. **Use ImageKit or Cloudinary** for hosting lore images (better than `/public` folder)
2. **Test on mobile** - the map is touch-enabled!
3. **Keep localStorage as backup** - it auto-syncs with Supabase
4. **Use descriptive region IDs** - they're permanent, so choose wisely (e.g., `marbleverse-alpha` not `region1`)

---

## ✅ Success Checklist

- [ ] Database migration completed
- [ ] Local dev server running
- [ ] Data loads from Supabase
- [ ] Admin portal works
- [ ] Deployed to Vercel
- [ ] Custom domain configured (optional)
- [ ] Main site navigation updated
- [ ] First lore content added

**All checked?** You're done! 🎉

---

Need help? Check the full documentation or contact your development team.

