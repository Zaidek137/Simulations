// =====================================================
// CODEX SYSTEM TYPES
// =====================================================

export type CodexEntryType = 'character' | 'faction' | 'simulation' | 'artifact' | 'event';

// Simulation types for Codex integration
export interface Location {
  id: string;
  name: string;
  description: string;
  cx: number;
  cy: number;
  type: 'planet' | 'station' | 'anomaly';
  thumbUrl: string;
}

export interface Simulation {
  id: string;
  name: string;
  description: string;
  color: string;
  cx: number;
  cy: number;
  thumbUrl: string;
  backgroundUrl: string;
  imageUrl: string;
  locations: Location[];
}

// Legacy alias for backward compatibility
export type Region = Simulation;

export interface KnownInfoSection {
  title: string;
  content: string;
}

export interface LockedSection {
  title: string;
  message?: string;
  unlock_condition?: string;
}

export interface CodexEntry {
  id: string;
  entry_id: string;
  entry_type: CodexEntryType;
  name: string;
  subtitle?: string;
  summary: string;
  
  // Content sections
  known_info: KnownInfoSection[];
  locked_sections: LockedSection[];
  
  // Visual
  icon_url?: string;
  image_url?: string;
  color: string;
  
  // Map connections
  primary_location_id?: string;
  appears_in_locations: string[];
  
  // Status
  is_unlocked: boolean;
  unlock_condition?: string;
  sort_order: number;
  is_active: boolean;
  
  // Metadata
  created_at: string;
  updated_at: string;
}

export interface CodexRelationship {
  id: string;
  from_entry_id: string;
  to_entry_id: string;
  relationship_type: string;
  description?: string;
  strength: number;
}

export interface CodexCategory {
  type: CodexEntryType;
  label: string;
  icon: string;
  entries: CodexEntry[];
}

// UI State types
export interface CodexUIState {
  selectedEntry: CodexEntry | null;
  highlightedLocations: string[];
  activeCategory: CodexEntryType | null;
  isOpen: boolean;
  searchQuery: string;
}

// Map highlight types
export interface MapHighlight {
  location_id: string;
  color: string;
  intensity: number; // 0-1, affects opacity
  isPrimary: boolean; // true for origin, false for appearances
}

export interface OriginLine {
  from_location_id: string;
  to_location_id: string;
  color: string;
  strength: number; // 1-10, affects line thickness
}

// Sample/Default codex data
export const CODEX_CATEGORIES: Record<CodexEntryType, { label: string; icon: string; description: string }> = {
  character: {
    label: 'Characters',
    icon: '👤',
    description: 'Key figures in the Scavenjer universe'
  },
  faction: {
    label: 'Factions',
    icon: '⚔️',
    description: 'Groups and organizations shaping the timeline'
  },
  simulation: {
    label: 'Simulations',
    icon: '🌐',
    description: 'Virtual realms and digital constructs'
  },
  artifact: {
    label: 'Artifacts',
    icon: '💎',
    description: 'Powerful objects and relics'
  },
  event: {
    label: 'Events',
    icon: '⚡',
    description: 'Pivotal moments in history'
  }
};

// Default empty codex entry
export const EMPTY_CODEX_ENTRY: Partial<CodexEntry> = {
  entry_type: 'character',
  name: '',
  summary: '',
  known_info: [],
  locked_sections: [],
  color: '#6366f1',
  appears_in_locations: [],
  is_unlocked: true,
  is_active: true,
  sort_order: 0
};

