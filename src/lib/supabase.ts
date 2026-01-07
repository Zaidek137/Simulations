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
  region_id: string; // DB column name stays as region_id
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

export interface LoreSimulation {
  id: string;
  region_id: string; // DB column name stays as region_id
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

// Legacy alias for backward compatibility
export type LoreRegion = LoreSimulation;

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
 * Fetch all active simulations with their locations
 */
export async function fetchSimulations(): Promise<LoreSimulation[]> {
  const { data: simulations, error: simulationsError } = await supabase
    .from('lore_regions')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (simulationsError) {
    console.error('Error fetching simulations:', simulationsError);
    throw simulationsError;
  }

  if (!simulations || simulations.length === 0) {
    return [];
  }

  // Fetch all locations for these simulations
  const { data: locations, error: locationsError } = await supabase
    .from('lore_locations')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (locationsError) {
    console.error('Error fetching locations:', locationsError);
    throw locationsError;
  }

  // Group locations by simulation
  const simulationsWithLocations = simulations.map((simulation) => ({
    ...simulation,
    locations: locations?.filter((loc) => loc.region_id === simulation.id) || [],
  }));

  return simulationsWithLocations;
}

// Legacy alias for backward compatibility
export const fetchRegions = fetchSimulations;

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
 * Upsert a simulation (admin only)
 */
export async function upsertSimulation(simulation: {
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
    p_region_id: simulation.region_id,
    p_name: simulation.name,
    p_description: simulation.description,
    p_color: simulation.color,
    p_cx: simulation.cx,
    p_cy: simulation.cy,
    p_thumb_url: simulation.thumb_url,
    p_background_url: simulation.background_url,
    p_image_url: simulation.image_url,
    p_sort_order: simulation.sort_order || 0,
  });

  if (error) {
    console.error('Error upserting simulation:', error);
    throw error;
  }

  return data;
}

// Legacy alias for backward compatibility
export const upsertRegion = upsertSimulation;

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
 * Delete a simulation (admin only - soft delete)
 */
export async function deleteSimulation(simulationId: string): Promise<boolean> {
  const { data, error } = await supabase.rpc('delete_lore_region', {
    p_region_id: simulationId,
  });

  if (error) {
    console.error('Error deleting simulation:', error);
    throw error;
  }

  return data;
}

// Legacy alias for backward compatibility
export const deleteRegion = deleteSimulation;

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
 * Bulk upsert simulations and locations (admin only)
 * Useful for importing data from the old localStorage system
 */
export async function bulkUpsertData(
  simulations: Array<{
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
    // Upsert simulations first
    for (const simulation of simulations) {
      await upsertSimulation({
        region_id: simulation.region_id,
        name: simulation.name,
        description: simulation.description,
        color: simulation.color,
        cx: simulation.cx,
        cy: simulation.cy,
        thumb_url: simulation.thumb_url,
        background_url: simulation.background_url,
        image_url: simulation.image_url,
      });

      // Then upsert locations for this simulation
      for (const location of simulation.locations) {
        await upsertLocation({
          location_id: location.location_id,
          region_id: simulation.region_id,
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

/**
 * Fetch entry with full relationships
 */
export async function fetchCodexEntryWithRelations(entryId: string): Promise<any> {
  // Fetch the entry
  const { data: entry, error: entryError } = await supabase
    .from('lore_codex_entries')
    .select('*')
    .eq('entry_id', entryId)
    .eq('is_active', true)
    .single();

  if (entryError) {
    console.error(`Error fetching entry ${entryId}:`, entryError);
    throw entryError;
  }

  // Fetch relationships
  const { data: relationships, error: relError } = await supabase
    .rpc('get_entry_relationships', { p_entry_id: entryId });

  if (relError) {
    console.error(`Error fetching relationships for ${entryId}:`, relError);
  }

  return {
    ...entry,
    related_entries: relationships || []
  };
}

/**
 * Fetch entries with advanced filtering
 */
export async function fetchCodexEntriesFiltered(filters: any): Promise<any[]> {
  const { data, error } = await supabase.rpc('get_entries_by_filters', {
    p_filters: filters
  });

  if (error) {
    console.error('Error fetching filtered entries:', error);
    throw error;
  }

  return data || [];
}

/**
 * Fetch relationships for an entry
 */
export async function fetchEntryRelationships(entryId: string): Promise<any[]> {
  const { data, error } = await supabase.rpc('get_entry_relationships', {
    p_entry_id: entryId
  });

  if (error) {
    console.error(`Error fetching relationships for ${entryId}:`, error);
    throw error;
  }

  return data || [];
}

/**
 * Fetch enhanced location data
 */
export async function fetchLocationEnhanced(locationId: string): Promise<any> {
  // Fetch base location
  const { data: location, error: locError } = await supabase
    .from('lore_locations')
    .select('*')
    .eq('location_id', locationId)
    .eq('is_active', true)
    .single();

  if (locError) {
    console.error(`Error fetching location ${locationId}:`, locError);
    throw locError;
  }

  // Fetch inhabitants
  const { data: inhabitants, error: inhError } = await supabase
    .rpc('get_location_inhabitants', { p_location_id: locationId });

  if (inhError) {
    console.error(`Error fetching inhabitants for ${locationId}:`, inhError);
  }

  return {
    ...location,
    ...inhabitants
  };
}

/**
 * Fetch all entries at a location (characters, factions, artifacts)
 */
export async function fetchLocationInhabitants(locationId: string): Promise<any> {
  const { data, error } = await supabase.rpc('get_location_inhabitants', {
    p_location_id: locationId
  });

  if (error) {
    console.error(`Error fetching location inhabitants for ${locationId}:`, error);
    return { characters: [], factions: [], artifacts: [] };
  }

  return data || { characters: [], factions: [], artifacts: [] };
}

/**
 * Fetch events at a location
 */
export async function fetchLocationEvents(locationId: string): Promise<any[]> {
  const { data, error } = await supabase.rpc('get_location_events', {
    p_location_id: locationId
  });

  if (error) {
    console.error(`Error fetching events at location ${locationId}:`, error);
    return [];
  }

  return data || [];
}

/**
 * Upsert with new metadata fields (enhanced version)
 */
export async function upsertCodexEntryEnhanced(entry: any): Promise<string> {
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
    // Character metadata
    p_character_role: entry.character_role || null,
    p_character_status: entry.character_status || null,
    p_character_affiliations: entry.character_affiliations || [],
    p_importance_tier: entry.importance_tier || 2,
    p_character_tags: entry.character_tags || [],
    p_timeline_era: entry.timeline_era || null,
    // Event metadata
    p_event_date: entry.event_date || null,
    p_event_participants: entry.event_participants || [],
    p_event_consequences: entry.event_consequences || []
  });

  if (error) {
    console.error('Error upserting enhanced codex entry:', error);
    throw error;
  }

  return data;
}

/**
 * Upsert a relationship between entries
 */
export async function upsertRelationship(relationship: {
  from_entry_id: string;
  to_entry_id: string;
  relationship_type: string;
  strength?: number;
  description?: string;
  is_bidirectional?: boolean;
  display_label?: string;
}): Promise<string> {
  const { data, error } = await supabase.rpc('upsert_relationship', {
    p_from_entry_id: relationship.from_entry_id,
    p_to_entry_id: relationship.to_entry_id,
    p_relationship_type: relationship.relationship_type,
    p_strength: relationship.strength || 5,
    p_description: relationship.description || null,
    p_is_bidirectional: relationship.is_bidirectional || false,
    p_display_label: relationship.display_label || null
  });

  if (error) {
    console.error('Error upserting relationship:', error);
    throw error;
  }

  return data;
}

/**
 * Delete a relationship
 */
export async function deleteRelationship(
  from_entry_id: string,
  to_entry_id: string,
  relationship_type: string
): Promise<boolean> {
  const { data, error } = await supabase.rpc('delete_relationship', {
    p_from_entry_id: from_entry_id,
    p_to_entry_id: to_entry_id,
    p_relationship_type: relationship_type
  });

  if (error) {
    console.error('Error deleting relationship:', error);
    throw error;
  }

  return data;
}

/**
 * Upsert location faction presence
 */
export async function upsertLocationFaction(
  location_id: string,
  faction_entry_id: string,
  control_level: 'dominant' | 'present' | 'minor',
  description?: string
): Promise<string> {
  const { data, error } = await supabase.rpc('upsert_location_faction', {
    p_location_id: location_id,
    p_faction_entry_id: faction_entry_id,
    p_control_level: control_level,
    p_description: description || null
  });

  if (error) {
    console.error('Error upserting location faction:', error);
    throw error;
  }

  return data;
}

/**
 * Upsert location character presence
 */
export async function upsertLocationCharacter(
  location_id: string,
  character_entry_id: string,
  stationed: boolean,
  description?: string
): Promise<string> {
  const { data, error } = await supabase.rpc('upsert_location_character', {
    p_location_id: location_id,
    p_character_entry_id: character_entry_id,
    p_stationed: stationed,
    p_description: description || null
  });

  if (error) {
    console.error('Error upserting location character:', error);
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

