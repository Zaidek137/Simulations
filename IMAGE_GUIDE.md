# Image Management Guide 🖼️

## Overview

You can now easily change all images for your universes, locations, and backgrounds using simple URL inputs!

---

## 🎨 Where to Add Images

### 1. **Universe/Region Images**

When editing a universe in the Admin Portal, you'll find three image fields:

- **Thumbnail URL** - Small icon for the universe (shown on map)
- **Background URL** - Background for the region view
- **Detail Image URL** - Detailed image for close-ups

### 2. **Location Images**

When editing or creating a location:

- **Image URL** - Thumbnail shown on the map for this location

### 3. **Global Background**

In the Settings tab:

- **Multiverse Background URL** - The main background for the entire map

---

## 📝 How to Add Images

### Option 1: Local Images (Recommended)

1. **Add your image to the project:**
   ```
   Simulations/public/images/your-image.png
   ```

2. **Use the relative path:**
   ```
   /images/your-image.png
   ```

3. **See live preview** - The preview box shows the image immediately

### Option 2: External URLs

1. **Upload image to an image host** (Imgur, Cloudinary, etc.)
2. **Copy the direct image URL:**
   ```
   https://example.com/your-image.png
   ```
3. **Paste into the URL field**
4. **See live preview**

---

## 📐 Image Guidelines

### Recommended Sizes

**Universes:**
- Thumbnail: 200x200px (square)
- Background: 1920x1080px (landscape)
- Detail Image: 1920x1080px (landscape)

**Locations:**
- Thumbnail: 200x200px (square)

**Global Background:**
- 1920x1080px or larger (landscape)

### File Formats
- ✅ PNG (recommended for transparency)
- ✅ JPG (good for photos)
- ✅ WebP (modern, efficient)
- ✅ GIF (animated backgrounds)

---

## 🔧 Using the Admin Portal

### Editing Universe Images

1. **Open Admin Portal** → Navigate to `/admin`
2. **Select a universe** to expand it
3. **Scroll to "Images" section**
4. **Enter URLs** in each field:
   - Type or paste the image URL
   - See instant preview in the box
5. **Click "Apply Changes"**
6. **Click "💾 Save"** at top to persist to database

### Editing Location Images

1. **Expand a universe** in the admin
2. **Find the location** in the list
3. **Enter Image URL:**
   - Type or paste the URL
   - See preview appear
4. **Click "Apply Changes"**
5. **Click "💾 Save"**

### Adding Images to New Locations

1. **Click "+ Add"** for locations
2. **Click map** to place
3. **Fill in Name and Description**
4. **Enter Image URL** (optional)
5. **See preview** if URL is valid
6. **Click "Add"**

---

## 💡 Tips & Tricks

### 1. **Use Consistent Aspect Ratios**
Keep all thumbnails square (1:1) and backgrounds landscape (16:9) for best results.

### 2. **Optimize File Sizes**
- Compress images before using
- Thumbnails: < 50KB
- Backgrounds: < 500KB
- Use tools like TinyPNG or Squoosh

### 3. **Test URLs**
- Open the URL in a browser first to verify it works
- Make sure it's a direct link to the image file
- Should end in `.png`, `.jpg`, `.webp`, etc.

### 4. **Local vs External**

**Local Images:**
- ✅ Faster loading (no external requests)
- ✅ Always available
- ✅ Full control
- ❌ Need to deploy with app

**External URLs:**
- ✅ Easy to update (just change the image at the URL)
- ✅ Don't increase app size
- ❌ Rely on external service
- ❌ May be slower

### 5. **Preview Feature**
The small preview boxes show your image in real-time as you type/paste the URL. This helps you verify the URL is correct before saving!

---

## 📁 Organizing Local Images

### Recommended Structure

```
Simulations/public/images/
├── universes/
│   ├── nebula-prime-thumb.png
│   ├── nebula-prime-bg.png
│   ├── cryo-wastes-thumb.png
│   └── cryo-wastes-bg.png
├── locations/
│   ├── prime-core.png
│   ├── station-alpha.png
│   └── quantum-rift.png
└── backgrounds/
    └── multiversal-bg.png
```

### URL Examples

```typescript
// Universe images
thumbUrl: "/images/universes/nebula-prime-thumb.png"
backgroundUrl: "/images/universes/nebula-prime-bg.png"

// Location images
thumbUrl: "/images/locations/prime-core.png"

// Global background
multiverseBackgroundUrl: "/images/backgrounds/multiversal-bg.png"
```

---

## 🎨 Image Ideas

### Universe Thumbnails
- Galaxy spirals
- Nebula clouds
- Abstract space art
- Glowing orbs
- Cosmic swirls

### Location Thumbnails
- Planet surfaces
- Space stations
- Nebula formations
- Asteroids
- Black holes

### Backgrounds
- Deep space
- Nebula fields
- Star clusters
- Cosmic voids
- Abstract space patterns

---

## 🐛 Troubleshooting

### Image Not Showing

**Problem:** URL entered but image doesn't appear
**Solutions:**
1. Check URL is correct (copy-paste from browser)
2. Ensure URL is a direct link to image file
3. Try opening URL in new browser tab
4. Check for HTTPS vs HTTP (use HTTPS)
5. Verify file extension (.png, .jpg, etc.)

### Preview Shows Broken Image

**Problem:** Preview box shows broken image icon
**Causes:**
- Invalid URL
- Image doesn't exist at that URL
- Permission/CORS issues (external images)
- Typo in URL

**Fix:**
1. Verify URL in browser
2. Use local images instead
3. Check for typos
4. Ensure proper file path

### Images Not Saving

**Problem:** Images reset after refresh
**Cause:** Didn't click "💾 Save" button
**Fix:**
1. Make changes
2. Click "Apply Changes" (saves to local state)
3. Click "💾 Save" at top (persists to database)
4. Hard refresh browser to verify

---

## ✨ Quick Start

### Step-by-Step: Change a Universe Image

1. Login to `/admin`
2. Click universe to expand
3. Scroll to **Images** section
4. Paste URL in **Thumbnail URL**:
   ```
   /images/universes/my-universe.png
   ```
5. See preview appear
6. Click **"Apply Changes"**
7. Click **"💾 Save"**
8. Done! ✅

### Step-by-Step: Change a Location Image

1. Login to `/admin`
2. Expand universe
3. Find location in list
4. Enter **Image URL**:
   ```
   /images/locations/my-location.png
   ```
5. See preview
6. Click **"Apply Changes"**
7. Click **"💾 Save"**
8. Done! ✅

---

## 📖 Summary

### What You Can Change

✅ Universe thumbnail images
✅ Universe background images
✅ Universe detail images
✅ Location thumbnail images
✅ Global multiverse background

### How to Change

1. Enter image URL (local or external)
2. See instant preview
3. Apply changes
4. Save to database

### Best Practices

- ✅ Use local images when possible
- ✅ Optimize file sizes
- ✅ Keep consistent aspect ratios
- ✅ Test URLs before saving
- ✅ Always click "💾 Save"

---

**Your images will now persist to the database and appear across all devices!** 🎉

---

## 🔗 Related Documentation

- **Admin Portal Guide:** [ADMIN_PORTAL_GUIDE.md](./ADMIN_PORTAL_GUIDE.md)
- **Quick Start:** [ADMIN_QUICK_START.md](./ADMIN_QUICK_START.md)
- **Coordinate System:** [COORDINATE_SYSTEM.md](./COORDINATE_SYSTEM.md)

Need help? Check the inline tooltips in the admin portal!


