# Scavenjer Interactive Universe Map

An interactive, zoomable map of the Scavenjer multiverse with detailed lore for each region and location.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy the environment template:

```bash
cp .env.example .env.local
```

Then edit `.env.local` and add your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_ADMIN_PASSWORD=YourSecurePasswordHere  # Optional: Custom admin password
```

**Note:** You can use the same Supabase project as your main Scavenjer site. The lore system uses separate tables with a `lore_` prefix.

### 3. Run Database Migrations

Apply the lore system migration to your Supabase project:

```bash
# Navigate to the main scavenjersite folder
cd ../scavenjersite

# Apply the migration using Supabase CLI
supabase db push

# Or manually run the SQL file in your Supabase SQL editor:
# scavenjersite/supabase/migrations/20250601000000_create_lore_system.sql
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the interactive map.

## 🗄️ Database Structure

The lore system uses three main tables:

- **`lore_regions`** - Universe regions (e.g., Nebula Prime, Cryo Wastes)
- **`lore_locations`** - Specific locations within regions (e.g., planets, stations, anomalies)
- **`lore_config`** - Global configuration (background videos, etc.)

All tables use Row Level Security (RLS):
- **Public read access** - Anyone can view active lore data
- **Admin write access** - Only authenticated admins can modify data

## 🎨 Features

### Public Features (/)
- **Interactive Zoom/Pan** - D3.js powered smooth zooming and panning
- **Region Details** - Click regions to view detailed information
- **Location Exploration** - Zoom into regions to discover specific locations
- **Codex Panel** - Browse lore entries for characters, factions, and more
- **Persistent Storage** - All data stored in Supabase with fallback to localStorage
- **Responsive Design** - Works on desktop and mobile devices

### Admin Features (/admin)
- **Protected Admin Portal** - Password-protected management interface
- **Region Management** - Create, edit, and delete universe regions
- **Location Management** - Add detailed locations to each region
- **Coordinate Picker** - Visual coordinate selection for precise positioning
- **Live Preview** - See changes in real-time
- **Supabase Sync** - All changes saved to database

## 🔐 Admin Access

The Admin Portal is now **hidden from public view** and requires password authentication.

### Quick Access

1. Navigate to `/admin` route (e.g., `http://localhost:3000/admin`)
2. Enter the admin password (default: `scavenjer2026`)
3. Access full admin dashboard

### Set Custom Password

Add to your `.env.local`:

```env
VITE_ADMIN_PASSWORD=YourSecurePasswordHere
```

**📚 For complete admin documentation, see [ADMIN_PORTAL_GUIDE.md](./ADMIN_PORTAL_GUIDE.md)**

### Security Features

- ✅ Password-protected access
- ✅ Hidden from public routes
- ✅ Session-based authentication
- ✅ Easy logout functionality
- ✅ Environment variable configuration

## 📁 Project Structure

```
Simulations/
├── src/
│   ├── pages/                 # Route pages
│   │   ├── PublicMap.tsx     # Public universe map (/)
│   │   └── AdminPage.tsx     # Protected admin portal (/admin)
│   ├── components/            # React components
│   │   ├── UniverseMap/       # Main interactive map
│   │   ├── AdminPortal/       # Admin management interface
│   │   ├── CodexPanel/        # Lore codex browser
│   │   ├── DetailOverlay/     # Region detail view
│   │   └── LocalPointOverlay/ # Location detail view
│   ├── data/                  # TypeScript types & fallback data
│   │   ├── universe-data.ts   # Default universe data
│   │   └── codex-types.ts     # Codex type definitions
│   ├── lib/                   # Utilities
│   │   └── supabase.ts        # Supabase client & helpers
│   ├── App.tsx                # Router configuration
│   └── main.tsx               # React entry point
├── api/                       # Vercel serverless functions
│   └── save-data.ts          # Data persistence API
├── public/                    # Static assets
│   ├── images/               # Region/location images
│   └── videos/               # Background videos
├── ADMIN_PORTAL_GUIDE.md     # Complete admin documentation
└── package.json
```

## 🚢 Deployment to Vercel

### Option 1: Separate Vercel Project (Recommended)

1. Create a new Vercel project
2. Connect to your Git repository
3. Set root directory to `Simulations`
4. Add environment variables in Vercel dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_ADMIN_PASSWORD` (your secure admin password)
5. Deploy!

### Option 2: Custom Domain

Set up a subdomain for the lore map:
- `lore.scavenjer.com`
- `universes.scavenjer.com`

Configure in Vercel → Project Settings → Domains

## 🔗 Integration with Main Site

Update your main Scavenjer site navigation to link to the deployed lore map:

```typescript
// In scavenjersite/src/components/Header.tsx
<a 
  href="https://lore.scavenjer.com"
  target="_blank"
  rel="noopener noreferrer"
>
  Scavenjer Uprise
</a>
```

## 🛠️ Technology Stack

- **Vite** - Fast build tool and dev server
- **React 18** - UI library
- **React Router** - Client-side routing
- **TypeScript** - Type safety
- **D3.js** - Interactive visualizations
- **Framer Motion 11** - Smooth animations
- **Tailwind CSS** - Utility-first styling
- **Supabase** - Backend database & authentication
- **Vercel** - Deployment platform

## 📝 Data Migration

To migrate existing localStorage data to Supabase:

1. Open the admin portal
2. Your existing data will be preserved in localStorage
3. Click "Sync to Database" to push data to Supabase
4. Future changes will automatically save to both

## 🤝 Contributing

This is part of the Scavenjer ecosystem. For questions or issues, contact the development team.

## 📄 License

Proprietary - Scavenjer Studios
