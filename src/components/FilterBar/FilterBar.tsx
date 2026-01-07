import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Filter, ChevronDown } from 'lucide-react';
import styles from './FilterBar.module.css';
import type { CodexFilters, Simulation, CodexEntry } from '@/data/codex-types';

interface FilterBarProps {
  filters: CodexFilters;
  onFiltersChange: (filters: CodexFilters) => void;
  simulations?: Simulation[];
  allEntries?: CodexEntry[];
}

export default function FilterBar({ filters, onFiltersChange, simulations = [], allEntries = [] }: FilterBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Extract unique values for dropdowns
  const locations = Array.from(
    new Set(
      simulations.flatMap(sim => sim.locations.map(loc => ({ id: loc.id, name: loc.name, simId: sim.id })))
    )
  );

  const factions = allEntries.filter(e => e.entry_type === 'faction');
  const eras = Array.from(new Set(allEntries.map(e => e.timeline_era).filter(Boolean)));
  const allTags = Array.from(new Set(allEntries.flatMap(e => e.character_tags || [])));

  const handleFilterChange = (key: keyof CodexFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const handleStatusToggle = (status: string) => {
    const current = filters.character_status || [];
    const updated = current.includes(status)
      ? current.filter(s => s !== status)
      : [...current, status];
    handleFilterChange('character_status', updated.length > 0 ? updated : undefined);
  };

  const handleImportanceToggle = (tier: number) => {
    const current = filters.importance_tier || [];
    const updated = current.includes(tier)
      ? current.filter(t => t !== tier)
      : [...current, tier];
    handleFilterChange('importance_tier', updated.length > 0 ? updated : undefined);
  };

  const handleTagToggle = (tag: string) => {
    const current = filters.character_tags || [];
    const updated = current.includes(tag)
      ? current.filter(t => t !== tag)
      : [...current, tag];
    handleFilterChange('character_tags', updated.length > 0 ? updated : undefined);
  };

  const clearAllFilters = () => {
    onFiltersChange({});
  };

  const activeFilterCount = Object.keys(filters).length;

  return (
    <div className={styles.filterBar}>
      <div className={styles.filterHeader}>
        <button 
          className={styles.filterToggle}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <Filter className="w-5 h-5" />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span className={styles.filterCount}>{activeFilterCount}</span>
          )}
          <ChevronDown className={`w-4 h-4 ${styles.chevron} ${isExpanded ? styles.chevronOpen : ''}`} />
        </button>

        {activeFilterCount > 0 && (
          <button className={styles.clearButton} onClick={clearAllFilters}>
            <X className="w-4 h-4" />
            Clear All
          </button>
        )}
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className={styles.filterContent}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Simulation Filter */}
            {simulations.length > 0 && (
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Simulation</label>
                <select
                  className={styles.filterSelect}
                  value={filters.simulation_id || ''}
                  onChange={(e) => handleFilterChange('simulation_id', e.target.value || undefined)}
                >
                  <option value="">All Simulations</option>
                  {simulations.map(sim => (
                    <option key={sim.id} value={sim.id}>{sim.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Location Filter */}
            {locations.length > 0 && (
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Location</label>
                <select
                  className={styles.filterSelect}
                  value={filters.location_id || ''}
                  onChange={(e) => handleFilterChange('location_id', e.target.value || undefined)}
                >
                  <option value="">All Locations</option>
                  {locations.map(loc => (
                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Faction Filter */}
            {factions.length > 0 && (
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Faction</label>
                <select
                  className={styles.filterSelect}
                  value={filters.faction_id || ''}
                  onChange={(e) => handleFilterChange('faction_id', e.target.value || undefined)}
                >
                  <option value="">All Factions</option>
                  {factions.map(faction => (
                    <option key={faction.entry_id} value={faction.entry_id}>{faction.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Era Filter */}
            {eras.length > 0 && (
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Timeline Era</label>
                <select
                  className={styles.filterSelect}
                  value={filters.timeline_era || ''}
                  onChange={(e) => handleFilterChange('timeline_era', e.target.value || undefined)}
                >
                  <option value="">All Eras</option>
                  {eras.map(era => (
                    <option key={era} value={era}>{era}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Status Chips */}
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Character Status</label>
              <div className={styles.chipContainer}>
                {['active', 'deceased', 'missing', 'unknown'].map(status => (
                  <button
                    key={status}
                    className={`${styles.filterChip} ${(filters.character_status || []).includes(status) ? styles.filterChipActive : ''}`}
                    onClick={() => handleStatusToggle(status)}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Importance Chips */}
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Importance</label>
              <div className={styles.chipContainer}>
                {[
                  { tier: 1, label: 'Major' },
                  { tier: 2, label: 'Supporting' },
                  { tier: 3, label: 'Minor' }
                ].map(({ tier, label }) => (
                  <button
                    key={tier}
                    className={`${styles.filterChip} ${(filters.importance_tier || []).includes(tier) ? styles.filterChipActive : ''}`}
                    onClick={() => handleImportanceToggle(tier)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tag Chips */}
            {allTags.length > 0 && (
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Tags</label>
                <div className={styles.chipContainer}>
                  {allTags.slice(0, 10).map(tag => (
                    <button
                      key={tag}
                      className={`${styles.filterChip} ${(filters.character_tags || []).includes(tag) ? styles.filterChipActive : ''}`}
                      onClick={() => handleTagToggle(tag)}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

