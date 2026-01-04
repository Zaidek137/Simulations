# Coordinate System Guide 📍

## Overview

The Universe Map uses a **fixed coordinate system** that ensures locations stay precisely where you place them, relative to the background image, regardless of zooming or panning.

---

## 🎯 Coordinate Space

### SVG ViewBox
```
viewBox="0 0 2000 1600"
```

- **Width:** 2000 units
- **Height:** 1600 units  
- **Origin:** Top-left corner (0, 0)
- **Center:** (1000, 800)

### What This Means

All coordinates in your universe (regions, locations) are defined in this **2000x1600** space:

```
(0, 0)                              (2000, 0)
  ┌────────────────────────────────────┐
  │                                    │
  │                                    │
  │           (1000, 800)              │
  │               ●                    │
  │            CENTER                  │
  │                                    │
  └────────────────────────────────────┘
(0, 1600)                        (2000, 1600)
```

---

## 🔧 How It Works

### 1. **Absolute Positioning**
Every universe/region and location has absolute `cx` and `cy` coordinates in the 2000x1600 space:

```typescript
{
  id: "nebula-prime",
  cx: 500,   // 500 units from left edge
  cy: 400,   // 400 units from top edge
  locations: [
    {
      id: "prime-core",
      cx: 520,   // 520 units from left edge
      cy: 430,   // 430 units from top edge
    }
  ]
}
```

### 2. **Background Image Alignment**
Your background image is also positioned in this same coordinate space, so:
- A location at (500, 400) will **always** appear at the same spot on the background
- Zooming in/out doesn't change the relative positions
- Panning moves everything together

### 3. **Zoom & Pan Behavior**
The entire coordinate space (including background and all objects) transforms together:

```typescript
// Initial view: centered at (500, 400) with 0.8x zoom
const initialTransform = d3.zoomIdentity
  .translate(1000, 800)      // Center of viewBox
  .scale(0.8)
  .translate(-500, -400);    // Show coordinate (500, 400) at center
```

---

## 📐 Placing Locations

### Using Admin Portal

1. **Open Admin** → Navigate to `/admin`
2. **Select a Universe** to edit
3. **Add Location** → Click "+ Add" button
4. **Click "Reposition"** for universe OR **Click map** for location
5. **Admin picks coordinates** from the map
6. The clicked position automatically converts to the correct coordinates
7. **Click "Apply"** to confirm

### Coordinate Picker Features

- **Visual Grid:** Shows when in picking mode
- **Real-time Coordinates:** Displays picked (x, y) values
- **Accurate Conversion:** D3.js automatically converts screen → SVG coordinates
- **Background Visible:** Map always visible for reference

---

## 🎨 Best Practices

### 1. **Align with Background**
Place locations based on visual features in your background image:
```
- Planet surface → Location coordinate
- Station in space → Location coordinate
- Nebula center → Region coordinate
```

### 2. **Use Coordinate Picker**
Always use the visual picker rather than manually entering coordinates:
- ✅ Click map in admin → Accurate positioning
- ❌ Manually type coordinates → Risk of misalignment

### 3. **Test at Different Zoom Levels**
After placing locations:
1. Zoom in → Check alignment
2. Zoom out → Check alignment
3. Pan around → Check alignment

Locations should **always** stay at the same spot on the background.

---

## 🔍 Technical Details

### ViewBox Benefits

**Before (without viewBox):**
- Coordinates tied to screen pixels
- Different on different screen sizes
- Inconsistent positioning

**After (with viewBox):**
- ✅ Fixed 2000x1600 coordinate space
- ✅ Same coordinates work on any screen size
- ✅ Locations stay perfectly aligned with background
- ✅ Predictable zoom/pan behavior

### PreserveAspectRatio

```html
preserveAspectRatio="xMidYMid meet"
```

- **xMidYMid:** Center the content both horizontally and vertically
- **meet:** Scale to fit within viewport while maintaining aspect ratio
- **Result:** Consistent appearance across all screen sizes

---

## 📊 Example Coordinates

Here are some example coordinates for reference:

### Common Positions
```typescript
// Top-left quadrant
{ cx: 500, cy: 400 }    // Upper-left area

// Center
{ cx: 1000, cy: 800 }   // Dead center

// Bottom-right quadrant
{ cx: 1500, cy: 1200 }  // Lower-right area
```

### Region Spacing
For multiple universes, space them ~400-600 units apart:
```typescript
regions: [
  { id: "universe-1", cx: 400, cy: 400 },
  { id: "universe-2", cx: 1000, cy: 400 },
  { id: "universe-3", cx: 1600, cy: 400 },
]
```

### Location Spacing
For locations within a region, space them ~100-200 units apart:
```typescript
locations: [
  { id: "planet-1", cx: 500, cy: 400 },
  { id: "planet-2", cx: 650, cy: 450 },
  { id: "station-1", cx: 550, cy: 550 },
]
```

---

## 🐛 Troubleshooting

### Locations Moving During Zoom

**Problem:** Locations shift relative to background when zooming
**Cause:** Cache issue or browser hasn't loaded updated code
**Fix:**
1. Hard refresh browser (Ctrl+Shift+R)
2. Clear browser cache
3. Check console for errors

### Coordinates Don't Match Visual Position

**Problem:** Clicked position doesn't match where location appears
**Cause:** Coordinate transformation issue
**Fix:**
1. Verify viewBox is set: `viewBox="0 0 2000 1600"`
2. Check browser console for errors
3. Ensure using latest code with fixed transforms

### Background Image Not Aligned

**Problem:** Background doesn't line up with coordinate space
**Cause:** Background image may need resizing or repositioning
**Fix:**
1. Ensure background image matches expected aspect ratio
2. Check background position in CSS
3. Adjust background-size/position as needed

---

## 📝 Summary

### Key Points

✅ **Fixed 2000x1600 coordinate space**
✅ **All objects use absolute coordinates**
✅ **Zoom/pan transforms entire space together**
✅ **Locations stay aligned with background**
✅ **Use visual picker for accuracy**
✅ **Works consistently across all screen sizes**

### The Bottom Line

**Your locations will now stay exactly where you place them, perfectly aligned with the background image, no matter how users zoom or pan the map!** 🎉

---

## 🔗 Related Files

- **Map Component:** `src/components/UniverseMap/UniverseMap.tsx`
- **Admin Portal:** `src/components/AdminPortal/AdminPortal.tsx`
- **Admin Page:** `src/pages/AdminPage.tsx`
- **Universe Data:** `src/data/universe-data.ts`

---

**Need help?** Check the inline documentation in `UniverseMap.tsx` for technical details!


