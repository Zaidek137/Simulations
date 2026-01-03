# Admin Portal Guide

## 🔒 Security Overview

The Admin Portal has been moved to a protected route and is no longer visible to public visitors. Only authorized administrators with the correct password can access it.

## 🚀 Quick Start

### 1. **Access the Admin Portal**

Navigate to:
```
http://localhost:3000/admin
```

Or on production:
```
https://your-domain.com/admin
```

### 2. **Login**

- **Default Password:** `scavenjer2026`
- Session persists until you close the browser or logout

### 3. **Custom Password (Recommended)**

Add to your `.env.local` file:

```env
VITE_ADMIN_PASSWORD=YourSecurePassword123
```

**Important:** Never commit this file to Git! It's already in `.gitignore`.

## 📋 Features

### Public View (`/`)
- Interactive Universe Map
- Codex Panel (read-only)
- Location overlays
- No admin tools visible

### Admin View (`/admin`)
- **Full Admin Portal** - All editing capabilities
- **Region Management** - Create, edit, delete regions
- **Location Management** - Add locations to regions
- **Coordinate Picker** - Visual coordinate selection
- **Supabase Sync** - Save changes to database
- **Quick Navigation** - Switch between admin and public views
- **Secure Logout** - Clears session and returns to public view

## 🎨 Admin Interface

The admin interface includes:

### Header Bar
- **Admin Dashboard** indicator
- **Authorized** status badge
- **View Public Map** button - Opens public view in same window
- **Logout** button - Ends admin session

### Admin Portal Panel
- Same powerful editing tools as before
- Full CRUD operations for regions and locations
- Live preview of changes
- Coordinate picker for precise positioning

## 🔐 Authentication Flow

1. **Access Admin URL** (`/admin`)
2. **Enter Password** (stored in `VITE_ADMIN_PASSWORD` or default)
3. **Session Created** - Stored in `sessionStorage`
4. **Admin Access Granted** - Full editing capabilities
5. **Logout** - Session cleared, redirected to public view

## 🛡️ Security Features

### Current Implementation
- ✅ Password-protected access
- ✅ Session-based authentication
- ✅ Hidden from public routes
- ✅ Environment variable password
- ✅ Logout functionality

### Future Enhancements (Optional)
You can enhance security by:
- Integrating Supabase Auth for proper user accounts
- Adding role-based access control (RBAC)
- Implementing 2FA (Two-Factor Authentication)
- Setting up audit logs for admin actions

## 🚨 Important Notes

### For Production

1. **Change Default Password**
   ```env
   VITE_ADMIN_PASSWORD=YourVerySecurePasswordHere
   ```

2. **Use Strong Password**
   - At least 16 characters
   - Mix of letters, numbers, symbols
   - Avoid common words

3. **Consider Supabase Auth** (For Multiple Admins)
   ```typescript
   // Already implemented helper functions in src/lib/supabase.ts:
   import { signIn, signOut, getCurrentUser } from '@/lib/supabase';
   ```

4. **Keep Admin URL Private**
   - Don't link to `/admin` from public pages
   - Share URL only with authorized personnel

## 🔄 Upgrading to Supabase Auth

If you want to upgrade from simple password to full Supabase authentication:

### Step 1: Enable Auth in Supabase
```sql
-- Run in Supabase SQL Editor
-- Create admin users table (optional, for role management)
CREATE TABLE admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  role text DEFAULT 'admin',
  created_at timestamptz DEFAULT now()
);
```

### Step 2: Update AdminPage.tsx
Replace password check with:

```typescript
import { signIn, getCurrentUser } from '@/lib/supabase';

// In component:
const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    await signIn(email, password);
    setIsAuthorized(true);
  } catch (error) {
    setError('Invalid credentials');
  }
};

// On mount:
useEffect(() => {
  const checkAuth = async () => {
    const user = await getCurrentUser();
    setIsAuthorized(!!user);
  };
  checkAuth();
}, []);
```

## 📱 Usage Examples

### Example 1: Quick Edit
1. Navigate to `/admin`
2. Login with password
3. Edit region/location
4. Click "Save Changes"
5. Changes sync to Supabase
6. Click "View Public Map" to see live results

### Example 2: Add New Region
1. Access admin portal
2. Click "Add Region" in admin panel
3. Use coordinate picker to select position
4. Fill in region details
5. Add locations to region
6. Save to Supabase
7. Logout when done

## 🐛 Troubleshooting

### Can't Access Admin Portal
- ✅ Verify you're at `/admin` route
- ✅ Check password is correct
- ✅ Try clearing browser cache/cookies
- ✅ Check browser console for errors

### Changes Not Saving
- ✅ Check Supabase connection
- ✅ Verify environment variables are set
- ✅ Check browser console for API errors
- ✅ Ensure you clicked "Save Changes"

### Kicked Out of Admin
- ✅ Session expires on browser close
- ✅ Check if you logged out accidentally
- ✅ Verify password hasn't changed

## 📚 Related Files

- `src/pages/AdminPage.tsx` - Admin interface
- `src/pages/PublicMap.tsx` - Public view
- `src/App.tsx` - Router configuration
- `src/lib/supabase.ts` - Database functions
- `src/components/AdminPortal/AdminPortal.tsx` - Admin panel component

## ✨ What Changed?

### Before
- Admin portal visible on public page
- Anyone could access editing tools
- No password protection

### After
- Admin portal hidden from public
- Protected route at `/admin`
- Password-required access
- Clean separation of public/admin views
- Session-based authentication
- Professional login screen

---

**Need Help?** Check the main `README.md` or create an issue in the repository.

