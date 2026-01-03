# ✅ Complete Setup Checklist

Use this checklist to ensure everything is configured correctly.

---

## 📋 Pre-Deployment Checklist

### Database Setup
- [ ] Supabase project exists (can use existing Scavenjer project)
- [ ] Migration file copied: `scavenjersite/supabase/migrations/20250601000000_create_lore_system.sql`
- [ ] Migration executed successfully in Supabase SQL Editor
- [ ] Tables created: `lore_regions`, `lore_locations`, `lore_config`
- [ ] RLS policies active (verify in Supabase Dashboard → Authentication → Policies)
- [ ] Default config inserted (check `lore_config` table has 1 row)

### Admin Access
- [ ] Your email exists in `admin_users` table
- [ ] `is_active = true` for your admin user
- [ ] You can sign in to main Scavenjer site as admin (confirms auth works)

### Local Development
- [ ] Node.js installed (v18.18.0 or higher)
- [ ] Dependencies installed: `npm install` completed without errors
- [ ] `.env.local` file created in `Interactive Website` folder
- [ ] `NEXT_PUBLIC_SUPABASE_URL` set correctly
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` set correctly
- [ ] Dev server starts: `npm run dev` runs without errors
- [ ] Site loads at http://localhost:3000
- [ ] Browser console shows "✅ Loaded data from Supabase" (or localStorage fallback)
- [ ] No console errors (except expected warnings)

### Functionality Tests (Local)
- [ ] Map renders correctly
- [ ] Can zoom in/out with mouse wheel
- [ ] Can pan by clicking and dragging
- [ ] Regions are visible
- [ ] Clicking a region shows details
- [ ] Admin portal appears in bottom-right corner
- [ ] Can open admin portal
- [ ] Admin portal shows sign-in option (if not signed in)

---

## 🚀 Deployment Checklist

### Git Repository
- [ ] All changes committed to Git
- [ ] `.env.local` is NOT committed (should be in .gitignore)
- [ ] Changes pushed to remote repository
- [ ] Repository accessible by Vercel

### Vercel Project Setup
- [ ] Vercel account created/logged in
- [ ] New project created in Vercel
- [ ] Git repository connected
- [ ] **Root Directory** set to `Interactive Website`
- [ ] Framework detected as "Next.js"
- [ ] Build command is `npm run build` (auto-detected)
- [ ] Output directory is `.next` (auto-detected)

### Environment Variables (Vercel)
- [ ] `NEXT_PUBLIC_SUPABASE_URL` added
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` added
- [ ] Both variables set for Production environment
- [ ] Both variables set for Preview environment
- [ ] Both variables set for Development environment

### Deployment
- [ ] First deployment triggered
- [ ] Build completed successfully (check build logs)
- [ ] No build errors
- [ ] Deployment URL accessible
- [ ] Site loads without errors

### Custom Domain (Optional)
- [ ] Custom domain added in Vercel (e.g., `lore.scavenjer.com`)
- [ ] DNS records configured
- [ ] SSL certificate issued (automatic)
- [ ] Domain accessible via HTTPS

---

## 🧪 Post-Deployment Testing

### Basic Functionality
- [ ] Site loads at deployment URL
- [ ] Map renders correctly
- [ ] Can zoom and pan
- [ ] Regions are visible and clickable
- [ ] Admin portal accessible
- [ ] No console errors in browser

### Data Loading
- [ ] Browser console shows "✅ Loaded data from Supabase"
- [ ] If Supabase is empty, shows "📦 Loaded data from localStorage" or "📋 Using default fallback data"
- [ ] Data persists after page refresh

### Admin Functionality
- [ ] Can open admin portal
- [ ] Can sign in with admin credentials
- [ ] After sign-in, shows admin user info
- [ ] Can add new universe
- [ ] Can edit existing universe
- [ ] Can add locations to universe
- [ ] Can save changes
- [ ] Save shows success message
- [ ] Changes persist after page refresh
- [ ] Changes visible immediately without refresh

### Performance
- [ ] Initial load time < 3 seconds
- [ ] Smooth zoom/pan animations
- [ ] No lag when interacting with map
- [ ] Images load properly
- [ ] No broken image links

### Mobile Testing
- [ ] Site loads on mobile device
- [ ] Responsive layout works
- [ ] Touch zoom works (pinch to zoom)
- [ ] Touch pan works (drag to pan)
- [ ] Admin portal accessible on mobile
- [ ] All buttons are tappable (not too small)

### Cross-Browser Testing
- [ ] Works in Chrome
- [ ] Works in Firefox
- [ ] Works in Safari
- [ ] Works in Edge
- [ ] Works on iOS Safari
- [ ] Works on Android Chrome

---

## 🔗 Integration Checklist

### Main Site Updates
- [ ] `scavenjersite/src/components/Header.tsx` updated
- [ ] "Scavenjer Uprise" link points to new lore map URL
- [ ] Link opens in new tab (`target="_blank"`)
- [ ] Link has security attributes (`rel="noopener noreferrer"`)
- [ ] `scavenjersite/src/components/MobileMenu.tsx` updated (if applicable)
- [ ] Main site changes committed to Git
- [ ] Main site redeployed
- [ ] Navigation link works from main site

### User Experience
- [ ] Clicking "UNIVERSES" → "Scavenjer Uprise" opens lore map
- [ ] Lore map opens in new tab
- [ ] User can navigate back to main site
- [ ] Consistent branding between sites
- [ ] Clear indication that user is on lore map

---

## 📊 Monitoring Setup

### Vercel Analytics
- [ ] Analytics enabled in Vercel project settings
- [ ] Can view page views
- [ ] Can view load times
- [ ] Can view error rates

### Supabase Monitoring
- [ ] Can access Supabase Dashboard
- [ ] Can view API request count
- [ ] Can view database size
- [ ] Can view logs (API, Database, Auth)

### Error Tracking (Optional)
- [ ] Sentry or similar tool configured
- [ ] Error alerts set up
- [ ] Team members have access

---

## 🎨 Content Checklist

### Initial Content
- [ ] At least 1 region added
- [ ] Each region has description
- [ ] Each region has appropriate color
- [ ] At least 1 location added per region
- [ ] Locations have descriptions
- [ ] All images uploaded to CDN (ImageKit, Cloudinary, etc.)
- [ ] All image URLs updated in database
- [ ] Background video configured (if using)

### Content Quality
- [ ] All text is proofread
- [ ] No placeholder text (e.g., "Lorem ipsum")
- [ ] Images are high quality
- [ ] Images load quickly (optimized)
- [ ] Colors are consistent with brand
- [ ] Descriptions are engaging and informative

---

## 🔐 Security Checklist

### Environment Variables
- [ ] `.env.local` is in `.gitignore`
- [ ] No secrets committed to Git
- [ ] Vercel environment variables are set correctly
- [ ] Only `NEXT_PUBLIC_*` variables used (safe to expose)

### Database Security
- [ ] RLS policies are enabled
- [ ] Public can only read active content
- [ ] Only admins can write
- [ ] Admin check function works correctly
- [ ] No service role key exposed in client

### Authentication
- [ ] Admin users must sign in to make changes
- [ ] JWT tokens are validated
- [ ] Unauthorized requests are rejected
- [ ] Error messages don't leak sensitive info

---

## 📚 Documentation Checklist

### For Your Team
- [ ] README.md is up to date
- [ ] SETUP.md is accessible
- [ ] DEPLOYMENT.md is accessible
- [ ] Team knows where to find documentation
- [ ] Team knows how to add content
- [ ] Team knows how to troubleshoot issues

### For Future You
- [ ] Architecture documented (ARCHITECTURE.md)
- [ ] Database schema documented (in migration file)
- [ ] Environment variables documented (SETUP.md)
- [ ] Deployment process documented (DEPLOYMENT.md)

---

## 🎉 Launch Checklist

### Pre-Launch
- [ ] All above checklists completed
- [ ] Stakeholders have reviewed
- [ ] Content is approved
- [ ] Performance is acceptable
- [ ] No critical bugs

### Launch Day
- [ ] Final deployment completed
- [ ] Custom domain active (if applicable)
- [ ] Main site navigation updated
- [ ] Team notified
- [ ] Social media announcement prepared (if applicable)

### Post-Launch
- [ ] Monitor error rates (first 24 hours)
- [ ] Monitor performance (first 24 hours)
- [ ] Monitor user feedback
- [ ] Address any critical issues immediately
- [ ] Plan for content updates

---

## 🐛 Troubleshooting Reference

### Issue: Site won't load
- [ ] Check Vercel deployment status
- [ ] Check browser console for errors
- [ ] Verify environment variables are set
- [ ] Check Supabase project is active (not paused)

### Issue: Data not loading
- [ ] Check browser console for "✅ Loaded data from Supabase"
- [ ] Verify Supabase URL and key are correct
- [ ] Check migration ran successfully
- [ ] Verify tables exist in Supabase

### Issue: Can't save changes
- [ ] Verify you're signed in as admin
- [ ] Check you exist in `admin_users` table
- [ ] Check `is_active = true` for your user
- [ ] Check browser console for error messages

### Issue: Build fails on Vercel
- [ ] Check build logs for specific error
- [ ] Verify all dependencies in `package.json`
- [ ] Check TypeScript errors
- [ ] Verify environment variables are set

---

## 📞 Support Resources

### Documentation
- [ ] QUICKSTART.md - 10-minute setup
- [ ] SETUP.md - Detailed setup instructions
- [ ] DEPLOYMENT.md - Complete deployment guide
- [ ] ARCHITECTURE.md - System architecture
- [ ] INTEGRATION_SUMMARY.md - Integration details
- [ ] SUPABASE_INTEGRATION_ANSWER.md - Supabase project question

### External Resources
- [ ] [Next.js Documentation](https://nextjs.org/docs)
- [ ] [Supabase Documentation](https://supabase.com/docs)
- [ ] [Vercel Documentation](https://vercel.com/docs)
- [ ] [D3.js Documentation](https://d3js.org/)

### Getting Help
- [ ] Check browser console first
- [ ] Check Vercel build logs
- [ ] Check Supabase logs
- [ ] Review documentation
- [ ] Contact development team

---

## ✨ Success Criteria

You're done when:
- ✅ All checklists above are completed
- ✅ Site is live and accessible
- ✅ Data loads from Supabase
- ✅ Admin can manage content
- ✅ Performance is good
- ✅ No critical errors
- ✅ Team is trained
- ✅ Documentation is complete

**Congratulations! Your Interactive Universe Map is live!** 🎉

---

## 📝 Notes Section

Use this space to track any custom configurations or issues:

```
Date: _____________
Notes:
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
```

