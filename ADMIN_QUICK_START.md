# Admin Quick Start Guide 🚀

## Installation & Setup

### 1. Install Dependencies
```bash
cd Simulations
npm install
```

This will install:
- `react-router-dom` - For routing
- `lucide-react` - For modern icons

### 2. Set Admin Password (Optional)
Create or edit `.env.local`:
```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-key
VITE_ADMIN_PASSWORD=YourSecurePassword
```

**Default password:** `scavenjer2026`

### 3. Run Development Server
```bash
npm run dev
```

---

## Accessing Admin

### 1. Navigate to Admin Route
```
http://localhost:3000/admin
```

### 2. Login
- Enter password (default: `scavenjer2026`)
- Session persists until logout

### 3. You're In! 🎉

---

## Admin Interface Overview

```
┌─────────────────────────────────────────┐
│ ⚙️ Admin Dashboard | 👁️ Public | 🚪Logout │  ← Header
├─────────┬───────────────────────────────┤
│         │                               │
│ ADMIN   │                               │
│ PANEL   │     UNIVERSE MAP              │
│         │     (Background)              │
│ Tabs:   │                               │
│ 🌐 Uni  │     Click to pick coords      │
│ ⚙️ Set  │                               │
│         │                               │
│ [◀]     │                               │
└─────────┴───────────────────────────────┘
```

---

## Quick Actions

### Create a Universe
1. Click **"+ New Universe"** (top of panel)
2. Universe card appears
3. Click to expand
4. Edit details
5. Click **"Apply Changes"**
6. Click **"💾 Save"** (top right) to persist

### Position a Universe
1. Expand universe card
2. Find "Map Position" section
3. Click **"Reposition"**
4. **Click the map** where you want it
5. Click **"Apply"**

### Add a Location
1. Expand universe
2. Scroll to "Locations" section
3. Click **"+ Add"**
4. **Click the map** to place it
5. Fill in name and description
6. Click **"Add"**

### Delete Items
- **Universe:** Click 🗑️ icon on card header
- **Location:** Click 🗑️ icon on location card

### Save to Database
Click **"💾 Save"** button at top of panel
- Commits all changes to Supabase
- Makes data persistent across devices

---

## UI Controls

### Panel Controls
- **Minimize:** Click `◀` button
- **Expand:** Click minimized tab on left edge
- **Switch Tabs:** Click "🌐 Universes" or "⚙️ Settings"

### Editing
- **Text:** Click input and type
- **Color:** Click color picker
- **Position:** Click "Reposition", then click map
- **Files:** Click file input to upload

### Actions
- **Apply Changes:** Saves edits to single universe
- **💾 Save:** Commits all changes to database
- **Cancel:** Discards coordinate picking
- **Delete:** Removes item permanently

---

## Workflow Examples

### Example 1: Create New Universe with Locations

```bash
1. Click "+ New Universe"
2. Click on new card to expand
3. Change name to "Quantum Realm"
4. Change color to purple (#8b5cf6)
5. Click "Reposition" → Click map → Click "Apply"
6. Scroll to Locations section
7. Click "+ Add"
8. Click map where you want location
9. Enter name: "Quantum Core"
10. Select type: "Station"
11. Enter description: "Central hub..."
12. Click "Add"
13. Repeat steps 7-12 for more locations
14. Click "Apply Changes" at bottom
15. Click "💾 Save" at top
16. Done! ✅
```

### Example 2: Edit Existing Universe

```bash
1. Click on universe card to expand
2. Edit name/description
3. Change color if needed
4. Click "Reposition" to move it
5. Edit locations:
   - Click in name field to edit
   - Change type dropdown
   - Edit description
   - Click "Move" to reposition
6. Click "Apply Changes"
7. Click "💾 Save"
8. Done! ✅
```

### Example 3: Reorganize Locations

```bash
1. Expand universe with locations
2. For each location:
   - Click "Move" button
   - Click new position on map
   - Click ✓ to confirm
3. Click "Apply Changes"
4. Click "💾 Save"
5. Done! ✅
```

---

## Tips & Tricks

### 💡 Pro Tips

1. **Minimize when picking** - Minimize panel for better map visibility
2. **Batch changes** - Make all edits, then save once
3. **Use keyboard** - Tab between fields for quick editing
4. **Color coding** - Use consistent colors for universe themes
5. **Descriptive names** - Help users understand locations

### ⚠️ Common Mistakes

1. **Forgetting to Apply** - Click "Apply Changes" before saving
2. **Not saving to DB** - Click "💾 Save" to persist changes
3. **Map not responding** - Make sure panel is open and picking mode is active
4. **Lost changes** - Apply changes before switching to another universe

### 🎯 Best Practices

- **One universe at a time** - Edit fully before moving to next
- **Test positions** - Click "👁️ Public View" to preview
- **Logical grouping** - Keep related locations in same universe
- **Consistent naming** - Use clear, descriptive names
- **Save frequently** - Don't lose work!

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Tab` | Next field |
| `Shift+Tab` | Previous field |
| `Esc` | Cancel picking mode |
| `Enter` | Submit form (in inputs) |

---

## Troubleshooting

### Panel won't open
- Check console for errors
- Verify you're logged in
- Refresh page

### Can't pick coordinates
- Look for blue bordered box (picking mode active)
- Make sure panel says "Click map to select position"
- Try minimizing panel for better visibility

### Changes not saving
- Click "Apply Changes" first
- Then click "💾 Save" button
- Check browser console for errors
- Verify Supabase connection

### Map not visible
- Panel should be semi-transparent
- Try minimizing panel
- Check if map is loading in public view

---

## Support

- **Full Guide:** [ADMIN_PORTAL_GUIDE.md](./ADMIN_PORTAL_GUIDE.md)
- **Design Details:** [ADMIN_UI_REDESIGN.md](./ADMIN_UI_REDESIGN.md)
- **Main README:** [README.md](./README.md)

---

Happy editing! 🎨✨




