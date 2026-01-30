// TheIndex data types and mock data for the 3D Index Selector

export type Simulation = 'Resonance' | 'Prime' | 'Veliental Ascendance';
export type IndexType = 'Scavenjers' | 'RESONANTS' | 'ZIBBots' | 'Environments';

export interface IndexEntry {
  id: string;
  name: string;
  simulation: Simulation;
  type: IndexType;
  faction: string;
  description: string;
  cardImageUrl?: string; // 2D card/portrait image for collectible cards
  displayImageUrl?: string; // Large 2D character display image (floating/showcase)
  modelUrl?: string; // GLB URL (deprecated - keeping for backward compatibility)
  // RESONANTS-specific fields
  genres?: string[]; // Music genres (for RESONANTS only)
  energy?: string; // Energy level/vibe (for RESONANTS only)
}

// Faction/Location color mapping for consistent styling (Resonance locations)
export const FACTION_COLORS: Record<string, { primary: string; secondary: string }> = {
  'Resonant': { primary: '#00F5FF', secondary: '#0D1B2A' },
  'Verdant': { primary: '#2D5016', secondary: '#0A1505' },
  'The Veil': { primary: '#9333EA', secondary: '#1A0033' },
  'Dryreach': { primary: '#DC2626', secondary: '#1A0505' },
  'The Underworks': { primary: '#64748B', secondary: '#0F1419' },
  'The Apex': { primary: '#FFD700', secondary: '#1A1500' },
};

// Mock entries for initial display
export const MOCK_INDEX_ENTRIES: IndexEntry[] = [
  {
    id: 'idx-001',
    name: 'APEX-7',
    simulation: 'Resonance',
    type: 'Scavenjers',
    faction: 'The Apex',
    description: 'Elite recovery specialist operating in the most hazardous zones. APEX-7 has survived 47 consecutive Drops and holds the record for highest-value artifact extraction. Licensed since Year 3 of the current cycle.',
  },
  {
    id: 'idx-002',
    name: 'NOVA-12',
    simulation: 'Resonance',
    type: 'Scavenjers',
    faction: 'Resonant',
    description: 'Technical prodigy responsible for maintaining critical infrastructure during Drop events. Known for unconventional solutions and system modifications that border on unauthorized.',
  },
  {
    id: 'idx-003',
    name: 'CIPHER',
    simulation: 'Resonance',
    type: 'Scavenjers',
    faction: 'The Veil',
    description: 'Information broker with connections spanning all districts. True identity remains unconfirmed. Provides critical intel during high-stakes operations. Loyalty: questionable.',
  },
  {
    id: 'idx-004',
    name: 'WARDEN-01',
    simulation: 'Resonance',
    type: 'Scavenjers',
    faction: 'The Apex',
    description: 'Senior Overseer responsible for monitoring District compliance. Has authorized more erasures than any other active Warden. The system\'s unwavering instrument.',
  },
  {
    id: 'idx-005',
    name: 'ECHO',
    simulation: 'Resonance',
    type: 'Scavenjers',
    faction: 'Dryreach',
    description: 'Former Scavenjer whose license was revoked after a failed extraction. Now survives in the gray zones between districts, trading information and salvage.',
  },
  {
    id: 'idx-006',
    name: 'PULSE',
    simulation: 'Resonance',
    type: 'Scavenjers',
    faction: 'Verdant',
    description: 'Combat medic specializing in field treatment during Drop events. Has saved more lives than official records acknowledge. Carries unauthorized medical tech.',
  },
  {
    id: 'idx-007',
    name: 'GHOST-9',
    simulation: 'Resonance',
    type: 'Scavenjers',
    faction: 'The Underworks',
    description: 'Unregistered entity detected in multiple district systems. No official record exists. Surveillance footage corrupted. Classification: anomaly.',
  },
  {
    id: 'idx-008',
    name: 'IRON-GATE',
    simulation: 'Resonance',
    type: 'Scavenjers',
    faction: 'The Apex',
    description: 'District enforcer tasked with maintaining order between zones. Known for strict adherence to protocol. Zero tolerance for unauthorized crossings.',
  },
];

// Helper function to get entry by ID
export const getIndexEntryById = (id: string): IndexEntry | undefined => {
  return MOCK_INDEX_ENTRIES.find(entry => entry.id === id);
};

// Helper function to get entries by faction
export const getIndexEntriesByFaction = (faction: string): IndexEntry[] => {
  return MOCK_INDEX_ENTRIES.filter(entry => entry.faction === faction);
};

// Helper function to get entries by type
export const getIndexEntriesByType = (type: IndexType): IndexEntry[] => {
  return MOCK_INDEX_ENTRIES.filter(entry => entry.type === type);
};
