import { supabase } from './supabase';
import type { IndexEntry } from '@/data/characterData';

const TABLE_NAME = 'index_entries';

// Database row type (snake_case as stored in Supabase)
interface IndexEntryRow {
  id: string;
  name: string;
  simulation: string;
  type: string;
  faction: string;
  description: string;
  card_image_url?: string;
  display_image_url?: string;
  model_url?: string;
  genres?: string[]; // Array of genres for RESONANTS
  energy?: string; // Energy level for RESONANTS
  created_at?: string;
  updated_at?: string;
}

// Convert database row (snake_case) to app format (camelCase)
function rowToEntry(row: IndexEntryRow): IndexEntry {
  return {
    id: row.id,
    name: row.name,
    simulation: row.simulation as any,
    type: row.type as any,
    faction: row.faction,
    description: row.description,
    cardImageUrl: row.card_image_url,
    displayImageUrl: row.display_image_url,
    modelUrl: row.model_url,
    genres: row.genres,
    energy: row.energy,
  };
}

// Convert app format (camelCase) to database row (snake_case)
function entryToRow(entry: IndexEntry | Partial<IndexEntry>): Partial<IndexEntryRow> {
  return {
    id: entry.id,
    name: entry.name,
    simulation: entry.simulation,
    type: entry.type,
    faction: entry.faction,
    description: entry.description,
    card_image_url: entry.cardImageUrl,
    display_image_url: entry.displayImageUrl,
    model_url: entry.modelUrl,
    genres: entry.genres,
    energy: entry.energy,
  };
}

/**
 * Fetch all index entries from the database
 */
export async function fetchIndexEntries(): Promise<IndexEntry[]> {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      // Check if table doesn't exist
      if (error.code === '42P01') {
        console.warn('⚠️ Table "index_entries" does not exist. Please run the SQL migration: database/create_index_entries_table.sql');
        throw new Error('Database table not created. Please run the migration script.');
      }
      console.error('Error fetching index entries:', error);
      throw error;
    }

    return (data || []).map(rowToEntry);
  } catch (error) {
    console.error('Error in fetchIndexEntries:', error);
    throw error;
  }
}

/**
 * Fetch a single index entry by ID
 */
export async function fetchIndexEntryById(id: string): Promise<IndexEntry | null> {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching index entry:', error);
      return null;
    }

    return data ? rowToEntry(data) : null;
  } catch (error) {
    console.error('Error in fetchIndexEntryById:', error);
    return null;
  }
}

/**
 * Create a new index entry
 */
export async function createIndexEntry(entry: IndexEntry): Promise<IndexEntry | null> {
  try {
    const row = entryToRow(entry);
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert([row])
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating index entry:', error);
      if (error.code === '42P01') {
        throw new Error('Database table not created. Please run: database/create_index_entries_table.sql');
      }
      throw error;
    }

    console.log('✅ Entry created successfully:', data.name);
    return rowToEntry(data);
  } catch (error) {
    console.error('Error in createIndexEntry:', error);
    throw error;
  }
}

/**
 * Update an existing index entry
 */
export async function updateIndexEntry(id: string, updates: Partial<IndexEntry>): Promise<IndexEntry | null> {
  try {
    const row = entryToRow(updates);
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .update(row)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Error updating index entry:', error);
      if (error.code === '42P01') {
        throw new Error('Database table not created. Please run: database/create_index_entries_table.sql');
      }
      throw error;
    }

    console.log('✅ Entry updated successfully:', data.name);
    return rowToEntry(data);
  } catch (error) {
    console.error('Error in updateIndexEntry:', error);
    throw error;
  }
}

/**
 * Delete an index entry
 */
export async function deleteIndexEntry(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ Error deleting index entry:', error);
      if (error.code === '42P01') {
        throw new Error('Database table not created. Please run: database/create_index_entries_table.sql');
      }
      throw error;
    }

    console.log('✅ Entry deleted successfully');
    return true;
  } catch (error) {
    console.error('Error in deleteIndexEntry:', error);
    throw error;
  }
}

/**
 * Fetch entries by simulation
 */
export async function fetchIndexEntriesBySimulation(simulation: string): Promise<IndexEntry[]> {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('simulation', simulation)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching entries by simulation:', error);
      return [];
    }

    return (data || []).map(rowToEntry);
  } catch (error) {
    console.error('Error in fetchIndexEntriesBySimulation:', error);
    return [];
  }
}

/**
 * Fetch entries by type
 */
export async function fetchIndexEntriesByType(type: string): Promise<IndexEntry[]> {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('type', type)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching entries by type:', error);
      return [];
    }

    return (data || []).map(rowToEntry);
  } catch (error) {
    console.error('Error in fetchIndexEntriesByType:', error);
    return [];
  }
}

/**
 * Fetch entries by faction
 */
export async function fetchIndexEntriesByFaction(faction: string): Promise<IndexEntry[]> {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('faction', faction)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching entries by faction:', error);
      return [];
    }

    return (data || []).map(rowToEntry);
  } catch (error) {
    console.error('Error in fetchIndexEntriesByFaction:', error);
    return [];
  }
}
