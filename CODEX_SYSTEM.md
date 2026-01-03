# Codex System - Complete Guide

## Overview

The Codex System is a comprehensive lore database for the Scavenjer Universe interactive map. It provides both a beautiful public-facing interface for exploring lore entries and a powerful admin interface for managing content.

## Features

### Public Codex Panel
- **Full-Screen Overlay**: Beautiful, modern UI that overlays the map
- **Category Navigation**: Browse entries by type (Characters, Factions, Simulations, Artifacts, Events)
- **Universe View**: See all universes organized with their locations and related codex entries
- **Search**: Quick search across all codex entries
- **Rich Entry Details**:
  - Known Information sections
  - Locked/Classified sections (for unrevealed lore)
  - Visual badges and color coding
  - Related location mapping

### Admin Codex Manager
- **Entry Management**: Create, edit, and delete codex entries
- **Rich Content Editor**:
  - Multiple "Known Information" blocks
  - Multiple "Locked Section" blocks
  - Location associations (which universes/locations the entry appears in)
  - Status toggles (Unlocked/Locked, Active/Hidden)
  - Color customization
- **Organized by Type**: Entries grouped by category for easy management
- **Real-time Updates**: Changes save directly to Supabase

## Usage

### For Public Users

1. Click the **book icon (📖)** in the top-right corner to open the Codex
2. Use the **Categories** tab to browse by entry type
3. Use the **Universes** tab to explore lore organized by universe/simulation
4. Click any entry to view full details
5. Use the search bar to quickly find specific entries

### For Admins

1. Navigate to `/admin` and log in
2. Click the **📖 Codex** tab in the admin header
3. **To add a new entry**:
   - Click "Add New Entry"
   - Fill in basic information (name, type, summary)
   - Add Known Information sections
   - Add Locked Sections (for unrevealed lore)
   - Select which map locations the entry appears in
   - Set status (Unlocked/Active)
   - Click "Save"
4. **To edit an entry**:
   - Click the edit button (✏️) on any entry card
   - Make your changes
   - Click "Save"
5. **To delete an entry**:
   - Click the trash icon (🗑️) on any entry card
   - Confirm deletion

## Data Structure

### Codex Entry Fields
- **entry_id**: Unique identifier
- **entry_type**: One of: 'character', 'faction', 'simulation', 'artifact', 'event'
- **name**: Entry title
- **subtitle**: Optional tagline
- **summary**: Brief description
- **known_info**: Array of {title, content} objects
- **locked_sections**: Array of {title, message} objects for unrevealed lore
- **color**: Hex color code for theming
- **appears_in_locations**: Array of location IDs where this entry is relevant
- **is_unlocked**: Whether entry is visible to public
- **is_active**: Whether entry appears in codex
- **sort_order**: Display order within category

## Database Integration

### Tables
- **lore_codex_entries**: Main entries table
- **lore_codex_sections**: Additional content sections
- **lore_codex_relationships**: Links between entries

### RPC Functions
- **upsert_codex_entry**: Create or update an entry
- **delete_codex_entry**: Soft-delete an entry
- **get_codex_entries_at_location**: Get entries for a specific location

## Components

### Public Components
- **CodexPanel** (`src/components/CodexPanel/`)
  - Main public-facing interface
  - Full-screen overlay design
  - Category and Universe views
  - Entry detail viewer

### Admin Components
- **CodexAdmin** (`src/components/CodexAdmin/`)
  - Admin management interface
  - Entry editor with rich content blocks
  - Location selector
  - Status management

## Styling

Both components use CSS Modules for styling:
- **CodexPanel.module.css**: Public interface styles
- **CodexAdmin.module.css**: Admin interface styles

Theme:
- Primary: Indigo (#6366f1)
- Secondary: Purple (#8b5cf6)
- Success: Emerald (#22c55e)
- Danger: Red (#ff3b30)
- Background: Dark gradients with transparency
- Borders: Glowing indigo accents

## Integration with Universe Map

The Codex System is fully integrated with the Universe Map:
- **Universe View**: Shows each universe with its locations and related codex entries
- **Location Associations**: Entries can be linked to specific locations on the map
- **Future Enhancement**: Click an entry to highlight its locations on the map

## Tips for Content Creation

### Writing Good Entries

1. **Names**: Keep them memorable and distinct
2. **Summaries**: 2-3 sentences, intriguing but not spoiler-heavy
3. **Known Info**: Break into logical sections (Origin, Abilities, History, etc.)
4. **Locked Sections**: Use for unrevealed plot points or mysteries
5. **Location Links**: Connect entries to relevant universe locations

### Organizing Content

- Use **sort_order** to prioritize important entries
- Group related entries by **type**
- Use **colors** consistently within types
- Keep **locked sections** for genuine mysteries, not lazy content

### Status Management

- **is_unlocked = false**: Entry exists in database but hidden from public
- **is_active = false**: Entry is archived (won't show even to admins in main list)
- Use unlocked status for progressive lore reveals

## Future Enhancements

Planned features:
- Map highlighting when clicking codex entries
- Entry relationships/connections visualization
- Timeline view for events
- Image/icon uploads for entries
- Public comments/notes system
- Search by location
- Export/import functionality

## Troubleshooting

### Entries not appearing
- Check `is_active` and `is_unlocked` status
- Verify Supabase RLS policies allow read access
- Check browser console for errors

### Save errors
- Ensure all required fields are filled
- Check Supabase connection
- Verify admin permissions
- Check console for detailed error messages

### Styling issues
- Clear browser cache
- Check CSS Module imports
- Verify Tailwind CSS is compiling correctly

## Support

For issues or questions:
1. Check browser console for errors
2. Review Supabase logs
3. Verify migration files are applied
4. Check RLS policies

---

**Version**: 1.0.0  
**Last Updated**: January 2026  
**Author**: Scavenjer Development Team
