import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './CodexPanel.module.css';
import type { CodexEntry, CodexEntryType, Region } from '@/data/codex-types';
import { fetchCodexEntries } from '@/lib/supabase';
import { X, Book, Users, Building2, Cpu, Gem, Zap, Search, Map, Lock, Info, Heart } from 'lucide-react';

interface CodexPanelProps {
  onEntrySelect: (entry: CodexEntry | null) => void;
  selectedEntry: CodexEntry | null;
  universeData?: Region[];
}

type ViewMode = 'categories' | 'universes' | 'detail' | 'universe-categories';

const CATEGORY_ICONS = {
  character: Users,
  faction: Building2,
  simulation: Cpu,
  artifact: Gem,
  event: Zap,
};

const CATEGORY_LABELS = {
  character: 'Characters',
  faction: 'Factions',
  simulation: 'Simulations',
  artifact: 'Artifacts',
  event: 'Events',
};

export default function CodexPanel({ onEntrySelect, selectedEntry, universeData = [] }: CodexPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('universes');
  const [selectedCategory, setSelectedCategory] = useState<CodexEntryType | null>(null);
  const [selectedUniverseId, setSelectedUniverseId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [allEntries, setAllEntries] = useState<CodexEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load codex entries from Supabase
  useEffect(() => {
    async function loadCodex() {
      try {
        const entries = await fetchCodexEntries();
        setAllEntries(entries);
      } catch (error) {
        console.error('Error loading codex:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadCodex();
  }, []);

  // Filter entries
  const filteredEntries = allEntries.filter(entry => {
    const matchesCategory = !selectedCategory || entry.entry_type === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      entry.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (entry.summary || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  // Group entries by type
  const entriesByType = allEntries.reduce((acc, entry) => {
    if (!acc[entry.entry_type]) {
      acc[entry.entry_type] = [];
    }
    acc[entry.entry_type].push(entry);
    return acc;
  }, {} as Record<CodexEntryType, CodexEntry[]>);

  const handleCategoryClick = (type: CodexEntryType) => {
    setSelectedCategory(type);
    setViewMode('categories');
  };

  const handleBack = () => {
    if (selectedEntry) {
      onEntrySelect(null);
      if (selectedUniverseId) {
        setViewMode('universe-categories');
      } else {
        setViewMode('categories');
      }
    } else if (selectedCategory) {
      setSelectedCategory(null);
      if (selectedUniverseId) {
        setViewMode('universe-categories');
      }
    } else if (viewMode === 'universe-categories') {
      setViewMode('universes');
      setSelectedUniverseId(null);
    } else if (viewMode === 'categories') {
      setViewMode('universes');
    }
  };

  const handleEntryClick = (entry: CodexEntry) => {
    onEntrySelect(entry);
    setViewMode('detail');
  };

  if (!isOpen) {
    return (
      <button 
        className={styles.toggleButton}
        onClick={() => setIsOpen(true)}
        title="Open Codex"
      >
        <Book className="w-6 h-6" />
      </button>
    );
  }

  return (
    <AnimatePresence>
      <motion.div 
        className={styles.overlay}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setIsOpen(false)}
      >
        <motion.div 
          className={styles.container}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className={styles.header}>
            <div className={styles.headerLeft}>
              {(selectedEntry || selectedCategory || viewMode === 'universes') && (
                <button onClick={handleBack} className={styles.backButton}>
                  ← Back
                </button>
              )}
              <h1 className={styles.title}>
                <Book className="w-6 h-6" />
                Codex Database
              </h1>
            </div>
            <button onClick={() => setIsOpen(false)} className={styles.closeButton}>
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${viewMode === 'universes' ? styles.tabActive : ''}`}
              onClick={() => {
                setViewMode('universes');
                setSelectedCategory(null);
                onEntrySelect(null);
              }}
            >
              <Map className="w-4 h-4" />
              Universes
            </button>
            <button
              className={`${styles.tab} ${viewMode === 'categories' && !selectedCategory ? styles.tabActive : ''}`}
              onClick={() => {
                setViewMode('categories');
                setSelectedCategory(null);
                onEntrySelect(null);
              }}
            >
              <Book className="w-4 h-4" />
              Categories
            </button>
          </div>

          {/* Search Bar */}
          {!selectedEntry && (
            <div className={styles.searchContainer}>
              <Search className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Search the codex..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          )}

          {/* Content */}
          <div className={styles.content}>
            {isLoading ? (
              <div className={styles.loading}>
                <div className={styles.spinner} />
                <p>Loading Codex...</p>
              </div>
            ) : selectedEntry ? (
              // Detail View
              <DetailView entry={selectedEntry} />
            ) : viewMode === 'universes' ? (
              // Universes View
              <UniversesView 
                universeData={universeData} 
                allEntries={allEntries}
                onEntryClick={handleEntryClick}
                onUniverseSelect={(universeId) => {
                  setSelectedUniverseId(universeId);
                  setViewMode('universe-categories');
                }}
              />
            ) : viewMode === 'universe-categories' && selectedUniverseId ? (
              // Categories by Universe
              <UniverseCategoriesView
                universe={universeData.find(u => u.id === selectedUniverseId)!}
                allEntries={allEntries}
                entriesByType={entriesByType}
                onCategoryClick={handleCategoryClick}
              />
            ) : selectedCategory ? (
              // Category Entries List
              <CategoryEntriesView 
                category={selectedCategory}
                entries={filteredEntries}
                onEntryClick={handleEntryClick}
              />
            ) : (
              // Categories Grid
              <CategoriesGridView 
                entriesByType={entriesByType}
                onCategoryClick={handleCategoryClick}
              />
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Categories Grid View
function CategoriesGridView({ 
  entriesByType, 
  onCategoryClick 
}: { 
  entriesByType: Record<CodexEntryType, CodexEntry[]>; 
  onCategoryClick: (type: CodexEntryType) => void;
}) {
  return (
    <div className={styles.categoriesGrid}>
      {Object.entries(CATEGORY_ICONS).map(([type, Icon]) => {
        const entries = entriesByType[type as CodexEntryType] || [];
        return (
          <motion.button
            key={type}
            className={styles.categoryCard}
            onClick={() => onCategoryClick(type as CodexEntryType)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className={styles.categoryIcon}>
              <Icon className="w-8 h-8" />
            </div>
            <h3 className={styles.categoryTitle}>
              {CATEGORY_LABELS[type as CodexEntryType]}
            </h3>
            <p className={styles.categoryCount}>
              {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
            </p>
          </motion.button>
        );
      })}
    </div>
  );
}

// Category Entries View
function CategoryEntriesView({
  category,
  entries,
  onEntryClick
}: {
  category: CodexEntryType;
  entries: CodexEntry[];
  onEntryClick: (entry: CodexEntry) => void;
}) {
  const Icon = CATEGORY_ICONS[category];
  
  return (
    <div className={styles.entriesList}>
      <div className={styles.listHeader}>
        <Icon className="w-6 h-6 text-indigo-400" />
        <h2>{CATEGORY_LABELS[category]}</h2>
        <span className={styles.count}>{entries.length} entries</span>
      </div>
      
      <div className={styles.entriesGrid}>
        {entries.map(entry => (
          <motion.button
            key={entry.entry_id}
            className={styles.entryCard}
            onClick={() => onEntryClick(entry)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <h3 className={styles.entryName}>{entry.name}</h3>
            {entry.subtitle && (
              <p className={styles.entrySubtitle}>{entry.subtitle}</p>
            )}
            <p className={styles.entrySummary}>{entry.summary}</p>
            <div className={styles.entryFooter}>
              <span className={styles.entryBadge}>{CATEGORY_LABELS[entry.entry_type]}</span>
              {entry.is_unlocked === false && (
                <span className={styles.lockedBadge}>
                  <Lock className="w-3 h-3" />
                  Locked
                </span>
              )}
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// Detail View
function DetailView({ entry }: { entry: CodexEntry }) {
  return (
    <div className={styles.detail}>
      <div className={styles.detailHeader}>
        <div>
          <h2 className={styles.detailTitle}>{entry.name}</h2>
          {entry.subtitle && (
            <p className={styles.detailSubtitle}>{entry.subtitle}</p>
          )}
        </div>
        <span className={styles.detailBadge}>
          {CATEGORY_LABELS[entry.entry_type]}
        </span>
      </div>

      {entry.summary && (
        <p className={styles.detailSummary}>{entry.summary}</p>
      )}

      {/* Known Information */}
      {entry.known_info && entry.known_info.length > 0 && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Known Information</h3>
          {entry.known_info.map((info: any, index: number) => (
            <div key={index} className={styles.infoBlock}>
              <h4 className={styles.infoTitle}>{info.title}</h4>
              <p className={styles.infoContent}>{info.content}</p>
            </div>
          ))}
        </div>
      )}

      {/* Locked Sections */}
      {entry.locked_sections && entry.locked_sections.length > 0 && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Classified Information</h3>
          {entry.locked_sections.map((locked: any, index: number) => (
            <div key={index} className={styles.lockedBlock}>
              <div className={styles.lockedHeader}>
                <Lock className="w-4 h-4" />
                <h4 className={styles.lockedTitle}>{locked.title}</h4>
              </div>
              <p className={styles.lockedMessage}>{locked.message || 'Data Incomplete'}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Universes View
function UniversesView({
  universeData,
  allEntries,
  onEntryClick,
  onUniverseSelect
}: {
  universeData: Region[];
  allEntries: CodexEntry[];
  onEntryClick: (entry: CodexEntry) => void;
  onUniverseSelect: (universeId: string) => void;
}) {
  return (
    <div className={styles.universesView}>
      <div className={styles.universesHeader}>
        <Map className="w-6 h-6" style={{ color: 'var(--off-white)' }} />
        <h2>Universe Database</h2>
        <span className={styles.count}>{universeData.length} universes</span>
      </div>

      <div className={styles.universesList}>
        {universeData.map((universe, index) => {
          // Find entries related to this universe
          const relatedEntries = allEntries.filter(entry =>
            entry.appears_in_locations?.some(locId =>
              universe.locations?.some(loc => loc.id === locId)
            )
          );

          return (
            <div 
              key={universe.id} 
              className={styles.universeCard}
              onClick={() => onUniverseSelect(universe.id)}
              style={{ cursor: 'pointer' }}
            >
              <div className={styles.universeHeader}>
                <div 
                  className={styles.universeIcon}
                  style={{ 
                    backgroundImage: `url(${universe.thumbUrl})`,
                    borderColor: universe.color 
                  }}
                />
                <div className={styles.universeHeaderText}>
                  <h3 className={styles.universeName}>
                    {index + 1}. {universe.name}
                  </h3>
                  <p className={styles.universeDesc}>{universe.description}</p>
                  <p className={styles.clickHint}>Click to explore categories →</p>
                </div>
              </div>

              {/* Summary Stats */}
              <div className={styles.universeStats}>
                <span className={styles.stat}>
                  {universe.locations?.length || 0} Locations
                </span>
                <span className={styles.stat}>
                  {relatedEntries.length} Entries
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Universe Categories View Component
function UniverseCategoriesView({ universe, allEntries, entriesByType, onCategoryClick }: {
  universe: Region;
  allEntries: CodexEntry[];
  entriesByType: Record<CodexEntryType, CodexEntry[]>;
  onCategoryClick: (category: CodexEntryType) => void;
}) {
  // Filter entries related to this universe
  const universeEntries = allEntries.filter(entry =>
    entry.appears_in_locations?.some(locId =>
      universe.locations?.some(loc => loc.id === locId)
    )
  );

  // Group by category
  const universeEntriesByType = (Object.keys(CATEGORY_LABELS) as CodexEntryType[]).reduce((acc, type) => {
    acc[type] = universeEntries.filter(e => e.entry_type === type);
    return acc;
  }, {} as Record<CodexEntryType, CodexEntry[]>);

  return (
    <div className={styles.categoriesView}>
      <div className={styles.categoriesHeader}>
        <div className={styles.universeHeaderInline}>
          <div 
            className={styles.universeIconSmall}
            style={{ 
              backgroundImage: `url(${universe.thumbUrl})`,
              borderColor: universe.color 
            }}
          />
          <div>
            <h2>{universe.name}</h2>
            <p className={styles.universeDescSmall}>{universe.description}</p>
          </div>
        </div>
        <span className={styles.count}>{universeEntries.length} total entries</span>
      </div>

      <div className={styles.categoriesGrid}>
        {(Object.keys(CATEGORY_LABELS) as CodexEntryType[]).map((category) => {
          const Icon = CATEGORY_ICONS[category];
          const count = universeEntriesByType[category].length;

          if (count === 0) return null;

          return (
            <button
              key={category}
              className={styles.categoryCard}
              onClick={() => onCategoryClick(category)}
            >
              <div className={styles.categoryIconWrapper}>
                <Icon className="w-8 h-8" />
              </div>
              <div className={styles.categoryContent}>
                <h3 className={styles.categoryName}>{CATEGORY_LABELS[category]}</h3>
                <p className={styles.categoryCount}>{count} {count === 1 ? 'entry' : 'entries'}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Intro Dialog Component - Exported for use in PublicMap
export function IntroDialog({ onClose }: { onClose: (dontShowAgain: boolean) => void }) {
  return (
    <motion.div
      className={styles.introOverlay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className={styles.introDialog}
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
      >
        <div className={styles.introHeader}>
          <div className={styles.introIcon}>
            <Book className="w-8 h-8" />
          </div>
          <h2 className={styles.introTitle}>Welcome to the Scavenjer Codex</h2>
        </div>

        <div className={styles.introContent}>
          <div className={styles.introSection}>
            <Info className="w-5 h-5 text-indigo-400 flex-shrink-0" />
            <p>
              You're viewing an <strong>ever-evolving lore system</strong> for Scavenjer. 
              As the story unfolds, this codex will grow and change—entries may be updated, 
              new mysteries revealed, and connections deepened.
            </p>
          </div>

          <div className={styles.introSection}>
            <Heart className="w-5 h-5 text-purple-400 flex-shrink-0" />
            <p>
              Scavenjer is currently a <strong>new experimental solo project</strong> without 
              backing—a passion-driven exploration of interactive storytelling and world-building.
            </p>
          </div>

          <div className={styles.introCallout}>
            <h3 className={styles.introCalloutTitle}>Want to Help Shape This Universe?</h3>
            <p className={styles.introCalloutText}>
              If you'd like to contribute to the Scavenjer story, help with development, 
              or support the project in other ways:
            </p>
            <div className={styles.introContact}>
              <div className={styles.contactItem}>
                <span className={styles.contactLabel}>Discord:</span>
                <span className={styles.contactValue}>
                  <a 
                    href="https://discord.com/invite/wX9hjx4cwA" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={styles.contactLink}
                  >
                    click here
                  </a>
                </span>
              </div>
              <div className={styles.contactItem}>
                <span className={styles.contactLabel}>Email:</span>
                <span className={styles.contactEmail}>Zaidek@scavenjer.com</span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.introFooter}>
          <button
            onClick={() => onClose(false)}
            className={styles.introButtonSecondary}
          >
            Remind Me Later
          </button>
          <button
            onClick={() => onClose(true)}
            className={styles.introButtonPrimary}
          >
            Got It, Don't Show Again
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
