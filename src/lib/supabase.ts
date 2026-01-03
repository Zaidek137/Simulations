import { createClient } from '@supabase/supabase-js';

// Supabase configuration - Using Vite environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env.local file.'
  );
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// =====================================================
// TYPE DEFINITIONS
// =====================================================

export interface LoreLocation {
  id: string;
  location_id: string;
  region_id: string;
  name: string;
  description: string;
  cx: number;
  cy: number;
  location_type: 'planet' | 'station' | 'anomaly';
  thumb_url: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LoreRegion {
  id: string;
  region_id: string;
  name: string;
  description: string;
  color: string;
  cx: number;
  cy: number;
  thumb_url: string;
  background_url: string;
  image_url: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  locations?: LoreLocation[];
}

export interface LoreConfig {
  id: string;
  config_key: string;
  config_value: {
    multiverseBackgroundUrl: string;
  };
  description?: string;
  created_at: string;
  updated_at: string;
}

// =====================================================
// PUBLIC READ FUNCTIONS
// =====================================================

/**
 * Fetch all active regions with their locations
 */
export async function fetchRegions(): Promise<LoreRegion[]> {
  const { data: regions, error: regionsError } = await supabase
    .from('lore_regions')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (regionsError) {
    console.error('Error fetching regions:', regionsError);
    throw regionsError;
  }

  if (!regions || regions.length === 0) {
    return [];
  }

  // Fetch all locations for these regions
  const { data: locations, error: locationsError } = await supabase
    .from('lore_locations')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (locationsError) {
    console.error('Error fetching locations:', locationsError);
    throw locationsError;
  }

  // Group locations by region
  const regionsWithLocations = regions.map((region) => ({
    ...region,
    locations: locations?.filter((loc) => loc.region_id === region.id) || [],
  }));

  return regionsWithLocations;
}

/**
 * Fetch lore system configuration
 */
export async function fetchLoreConfig(): Promise<LoreConfig | null> {
  const { data, error } = await supabase
    .from('lore_config')
    .select('*')
    .eq('config_key', 'multiverse_background')
    .single();

  if (error) {
    console.error('Error fetching lore config:', error);
    return null;
  }

  return data;
}

// =====================================================
// ADMIN WRITE FUNCTIONS (Require Authentication)
// =====================================================

/**
 * Upsert a region (admin only)
 */
export async function upsertRegion(region: {
  region_id: string;
  name: string;
  description: string;
  color: string;
  cx: number;
  cy: number;
  thumb_url: string;
  background_url: string;
  image_url: string;
  sort_order?: number;
}): Promise<string> {
  const { data, error } = await supabase.rpc('upsert_lore_region', {
    p_region_id: region.region_id,
    p_name: region.name,
    p_description: region.description,
    p_color: region.color,
    p_cx: region.cx,
    p_cy: region.cy,
    p_thumb_url: region.thumb_url,
    p_background_url: region.background_url,
    p_image_url: region.image_url,
    p_sort_order: region.sort_order || 0,
  });

  if (error) {
    console.error('Error upserting region:', error);
    throw error;
  }

  return data;
}

/**
 * Upsert a location (admin only)
 */
export async function upsertLocation(location: {
  location_id: string;
  region_id: string;
  name: string;
  description: string;
  cx: number;
  cy: number;
  location_type: 'planet' | 'station' | 'anomaly';
  thumb_url: string;
  sort_order?: number;
}): Promise<string> {
  const { data, error } = await supabase.rpc('upsert_lore_location', {
    p_location_id: location.location_id,
    p_region_id: location.region_id,
    p_name: location.name,
    p_description: location.description,
    p_cx: location.cx,
    p_cy: location.cy,
    p_location_type: location.location_type,
    p_thumb_url: location.thumb_url,
    p_sort_order: location.sort_order || 0,
  });

  if (error) {
    console.error('Error upserting location:', error);
    throw error;
  }

  return data;
}

/**
 * Update lore configuration (admin only)
 */
export async function updateLoreConfig(
  configValue: { multiverseBackgroundUrl: string }
): Promise<string> {
  const { data, error } = await supabase.rpc('update_lore_config', {
    p_config_key: 'multiverse_background',
    p_config_value: configValue,
  });

  if (error) {
    console.error('Error updating lore config:', error);
    throw error;
  }

  return data;
}

/**
 * Delete a region (admin only - soft delete)
 */
export async function deleteRegion(regionId: string): Promise<boolean> {
  const { data, error } = await supabase.rpc('delete_lore_region', {
    p_region_id: regionId,
  });

  if (error) {
    console.error('Error deleting region:', error);
    throw error;
  }

  return data;
}

/**
 * Delete a location (admin only - soft delete)
 */
export async function deleteLocation(locationId: string): Promise<boolean> {
  const { data, error } = await supabase.rpc('delete_lore_location', {
    p_location_id: locationId,
  });

  if (error) {
    console.error('Error deleting location:', error);
    throw error;
  }

  return data;
}

// =====================================================
// BATCH OPERATIONS
// =====================================================

/**
 * Bulk upsert regions and locations (admin only)
 * Useful for importing data from the old localStorage system
 */
export async function bulkUpsertData(
  regions: Array<{
    region_id: string;
    name: string;
    description: string;
    color: string;
    cx: number;
    cy: number;
    thumb_url: string;
    background_url: string;
    image_url: string;
    locations: Array<{
      location_id: string;
      name: string;
      description: string;
      cx: number;
      cy: number;
      location_type: 'planet' | 'station' | 'anomaly';
      thumb_url: string;
    }>;
  }>
): Promise<void> {
  try {
    // Upsert regions first
    for (const region of regions) {
      await upsertRegion({
        region_id: region.region_id,
        name: region.name,
        description: region.description,
        color: region.color,
        cx: region.cx,
        cy: region.cy,
        thumb_url: region.thumb_url,
        background_url: region.background_url,
        image_url: region.image_url,
      });

      // Then upsert locations for this region
      for (const location of region.locations) {
        await upsertLocation({
          location_id: location.location_id,
          region_id: region.region_id,
          name: location.name,
          description: location.description,
          cx: location.cx,
          cy: location.cy,
          location_type: location.location_type,
          thumb_url: location.thumb_url,
        });
      }
    }
  } catch (error) {
    console.error('Error in bulk upsert:', error);
    throw error;
  }
}

// =====================================================
// CODEX FUNCTIONS
// =====================================================

import type { CodexEntry, CodexEntryType } from '@/data/codex-types';

/**
 * Fetch all codex entries
 */
export async function fetchCodexEntries(): Promise<CodexEntry[]> {
  const { data, error } = await supabase
    .from('lore_codex_entries')
    .select('*')
    .eq('is_active', true)
    .eq('is_unlocked', true)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Error fetching codex entries:', error);
    throw error;
  }

  return data || [];
}

/**
 * Fetch codex entries by type
 */
export async function fetchCodexEntriesByType(type: CodexEntryType): Promise<CodexEntry[]> {
  const { data, error } = await supabase
    .from('lore_codex_entries')
    .select('*')
    .eq('entry_type', type)
    .eq('is_active', true)
    .eq('is_unlocked', true)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error(`Error fetching ${type} entries:`, error);
    throw error;
  }

  return data || [];
}

/**
 * Fetch a single codex entry by ID
 */
export async function fetchCodexEntry(entryId: string): Promise<CodexEntry | null> {
  const { data, error } = await supabase
    .from('lore_codex_entries')
    .select('*')
    .eq('entry_id', entryId)
    .eq('is_active', true)
    .single();

  if (error) {
    console.error(`Error fetching codex entry ${entryId}:`, error);
    return null;
  }

  return data;
}

/**
 * Fetch codex entries at a specific location
 */
export async function fetchCodexEntriesAtLocation(locationId: string): Promise<CodexEntry[]> {
  const { data, error } = await supabase
    .rpc('get_codex_entries_at_location', {
      p_location_id: locationId
    });

  if (error) {
    console.error(`Error fetching codex entries at location ${locationId}:`, error);
    return [];
  }

  return data || [];
}

/**
 * Upsert a codex entry (admin only)
 */
export async function upsertCodexEntry(entry: Partial<CodexEntry>): Promise<string> {
  const { data, error } = await supabase.rpc('upsert_codex_entry', {
    p_entry_id: entry.entry_id,
    p_entry_type: entry.entry_type,
    p_name: entry.name,
    p_subtitle: entry.subtitle || null,
    p_summary: entry.summary,
    p_known_info: entry.known_info || [],
    p_locked_sections: entry.locked_sections || [],
    p_icon_url: entry.icon_url || null,
    p_image_url: entry.image_url || null,
    p_color: entry.color || '#6366f1',
    p_primary_location_id: entry.primary_location_id || null,
    p_appears_in_locations: entry.appears_in_locations || [],
    p_is_unlocked: entry.is_unlocked !== false,
    p_unlock_condition: entry.unlock_condition || null,
    p_sort_order: entry.sort_order || 0,
  });

  if (error) {
    console.error('Error upserting codex entry:', error);
    throw error;
  }

  return data;
}

/**
 * Delete a codex entry (admin only - soft delete)
 */
export async function deleteCodexEntry(entryId: string): Promise<boolean> {
  const { data, error } = await supabase.rpc('delete_codex_entry', {
    p_entry_id: entryId,
  });

  if (error) {
    console.error('Error deleting codex entry:', error);
    throw error;
  }

  return data;
}

// =====================================================
// AUTHENTICATION HELPERS
// =====================================================

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const { data: { session } } = await supabase.auth.getSession();
  return !!session;
}

/**
 * Get current user
 */
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

/**
 * Sign in with email
 */
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

/**
 * Sign out
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

