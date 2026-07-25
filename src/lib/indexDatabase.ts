import { supabase } from './supabase';
import { adminOperation } from '@/services/adminApi';
import type { IndexEntry } from '@/data/characterData';

const TABLE_NAME = 'index_entries';

interface IndexEntryRow {
  id: string;
  name: string;
  simulation: string;
  type: string;
  faction: string;
  description: string;
  card_image_url?: string | null;
  display_image_url?: string | null;
  model_url?: string | null;
  genres?: string[] | null;
  energy?: string | null;
  created_at?: string;
  updated_at?: string;
}

function rowToEntry(row: IndexEntryRow): IndexEntry {
  return {
    id: row.id,
    name: row.name,
    simulation: row.simulation as any,
    type: row.type as any,
    faction: row.faction,
    description: row.description,
    cardImageUrl: row.card_image_url || undefined,
    displayImageUrl: row.display_image_url || undefined,
    modelUrl: row.model_url || undefined,
    genres: row.genres || undefined,
    energy: row.energy || undefined,
  };
}

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

export async function fetchIndexEntries(): Promise<IndexEntry[]> {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      if (error.code === '42P01') {
        throw new Error('Database table not created. Please run the migration script.');
      }
      throw error;
    }

    return (data || []).map(rowToEntry);
  } catch (error) {
    console.error('Error in fetchIndexEntries:', error);
    throw error;
  }
}

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

export async function createIndexEntry(entry: IndexEntry): Promise<IndexEntry | null> {
  try {
    const data = await adminOperation<IndexEntryRow>('createIndexEntry', {
      entry: entryToRow(entry),
    });

    console.log('Entry created successfully:', data.name);
    return rowToEntry(data);
  } catch (error) {
    console.error('Error in createIndexEntry:', error);
    throw error;
  }
}

export async function updateIndexEntry(
  id: string,
  updates: Partial<IndexEntry>
): Promise<IndexEntry | null> {
  try {
    const data = await adminOperation<IndexEntryRow>('updateIndexEntry', {
      id,
      updates: entryToRow(updates),
    });

    console.log('Entry updated successfully:', data.name);
    return rowToEntry(data);
  } catch (error) {
    console.error('Error in updateIndexEntry:', error);
    throw error;
  }
}

export async function deleteIndexEntry(id: string): Promise<boolean> {
  try {
    await adminOperation<boolean>('deleteIndexEntry', { id });
    console.log('Entry deleted successfully');
    return true;
  } catch (error) {
    console.error('Error in deleteIndexEntry:', error);
    throw error;
  }
}

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
