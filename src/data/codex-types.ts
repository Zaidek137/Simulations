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
  theme?: string;
  styles?: string;
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
  
  // Character metadata
  character_role?: string;
  character_status?: 'active' | 'deceased' | 'missing' | 'unknown';
  character_affiliations?: string[];
  importance_tier?: 1 | 2 | 3;
  character_tags?: string[];
  
  // Event metadata
  event_date?: string;
  event_participants?: string[];
  event_consequences?: string[];
  
  // Timeline
  timeline_era?: string;
  
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

// =====================================================
// ENHANCED TYPES FOR ADVANCED FEATURES
// =====================================================

export interface CharacterMetadata {
  role?: string;
  status?: 'active' | 'deceased' | 'missing' | 'unknown';
  affiliations?: string[]; // faction entry_ids
  importance_tier: 1 | 2 | 3;
  character_tags?: string[];
}

export interface EventMetadata {
  date?: string;
  era?: string;
  participants?: string[];
  location_id?: string;
  consequences?: string[];
}

export interface FactionPresence {
  faction_id: string;
  faction_name: string;
  control_level: 'dominant' | 'present' | 'minor';
  description?: string;
  color?: string;
  icon_url?: string;
}

export interface LocationEnhanced extends Location {
  population?: number;
  threat_level?: 1 | 2 | 3 | 4 | 5;
  atmosphere?: string;
  key_landmarks?: string[];
  resources?: string[];
  access_restrictions?: string;
  present_factions?: FactionPresence[];
  stationed_characters?: string[];
}

export interface RelatedEntry {
  entry_id: string;
  entry_type: CodexEntryType;
  name: string;
  subtitle?: string;
  relationship_type: string;
  relationship_strength: number;
  description?: string;
  color: string;
  icon_url?: string;
}

export interface CodexEntryEnhanced extends CodexEntry {
  character_metadata?: CharacterMetadata;
  event_metadata?: EventMetadata;
  related_entries?: RelatedEntry[];
}

export interface CodexFilters {
  simulation_id?: string;
  location_id?: string;
  faction_id?: string;
  character_status?: string[];
  importance_tier?: number[];
  timeline_era?: string;
  character_tags?: string[];
  entry_type?: CodexEntryType;
}

export interface BreadcrumbItem {
  label: string;
  path: string;
  onClick: () => void;
}

export interface LocationInhabitants {
  characters: Array<{
    entry_id: string;
    name: string;
    subtitle?: string;
    color: string;
    icon_url?: string;
    stationed: boolean;
    character_role?: string;
    character_status?: string;
  }>;
  factions: Array<{
    entry_id: string;
    name: string;
    subtitle?: string;
    color: string;
    icon_url?: string;
    control_level: 'dominant' | 'present' | 'minor';
    description?: string;
  }>;
  artifacts: Array<{
    entry_id: string;
    name: string;
    subtitle?: string;
    color: string;
    icon_url?: string;
    summary: string;
  }>;
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

