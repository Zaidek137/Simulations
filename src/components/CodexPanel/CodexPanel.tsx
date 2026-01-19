import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './CodexPanel.module.css';
import type { CodexEntry, CodexEntryType, Simulation } from '@/data/codex-types';
import { fetchCodexEntries } from '@/lib/supabase';
import { X, Book, Users, Building2, Cpu, Gem, Zap, Lock, Info, Heart, ArrowLeft } from 'lucide-react';
// TODO: Integrate these components in full implementation
// import FilterBar from '../FilterBar/FilterBar';
// import BreadcrumbNavigation from '../BreadcrumbNavigation/BreadcrumbNavigation';
// import RelationshipsPanel from '../RelationshipsPanel/RelationshipsPanel';

interface CodexPanelProps {
  onEntrySelect: (entry: CodexEntry | null) => void;
  selectedEntry: CodexEntry | null;
  simulationData?: Simulation[];
}

type ViewMode = 'categories' | 'simulations' | 'detail' | 'simulation-categories';

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
} as const;

type AllowedCategory = keyof typeof CATEGORY_LABELS;

// Simulation-specific lore descriptions
const SIMULATION_LORE: Record<string, string> = {
  'resonance': `Resonance is a functioning cyberpunk society governed by periodic judgment rather than constant collapse. Districts live, create, and thrive—until the system tests them.

When a Drop appears, only licensed Scavenjers may intervene. Failure accumulates. Erasure is permanent. Survival is conditional.

The system is not broken.
It is intentional.`,
  // Add more simulations as needed
};

// Simulation-specific metadata (theme and styles)
const SIMULATION_METADATA: Record<string, { theme: string; styles: string }> = {
  'resonance': {
    theme: 'Soft blend of futurism, cyberpunk and sci-fi',
    styles: 'Stylized Realism, Neo-Anime',
  },
  // Add more simulations as needed
};

export default function CodexPanel({ onEntrySelect, selectedEntry, simulationData = [] }: CodexPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('simulations');
  const [selectedCategory, setSelectedCategory] = useState<CodexEntryType | null>(null);
  const [selectedSimulationId, setSelectedSimulationId] = useState<string | null>(null);
  const [allEntries, setAllEntries] = useState<CodexEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [glitchActive, setGlitchActive] = useState(false);
  // TODO: Uncomment when integrating FilterBar and BreadcrumbNavigation
  // const [filters, setFilters] = useState<CodexFilters>({});
  // const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);

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

  // Glitch effect timer
  useEffect(() => {
    const glitchInterval = setInterval(() => {
      setGlitchActive(true);
      setTimeout(() => setGlitchActive(false), 300);
    }, 5000); // Every 5 seconds

    return () => clearInterval(glitchInterval);
  }, []);

  // Filter entries by category
  const filteredEntries = allEntries.filter(entry => {
    const matchesCategory = !selectedCategory || entry.entry_type === selectedCategory;
    return matchesCategory;
  });

  const handleBack = () => {
    if (selectedEntry) {
      // From entry detail -> back to category list
      onEntrySelect(null);
      setViewMode('categories');
    } else if (selectedCategory) {
      // From category list -> back to simulation categories
      setSelectedCategory(null);
      if (selectedSimulationId) {
        setViewMode('simulation-categories');
      } else {
        // Shouldn't happen in new flow, but fallback to simulations
        setViewMode('simulations');
      }
    } else if (viewMode === 'simulation-categories') {
      // From simulation categories -> back to simulations list
      setViewMode('simulations');
      setSelectedSimulationId(null);
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
              {(selectedEntry || selectedCategory || viewMode === 'simulation-categories') && (
                <button onClick={handleBack} className={styles.backButton}>
                  ← Back
                </button>
              )}
              <h1 className={`${styles.title} ${glitchActive ? styles.glitching : ''}`}>
                <Book className="w-6 h-6" />
                Codex Database
              </h1>
            </div>
            <button onClick={() => setIsOpen(false)} className={styles.closeButton}>
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Marquee Banner */}
          <div className={styles.marquee}>
            <div className={styles.marqueeContent}>
              SYSTEM_ALERT: UNAUTHORIZED ACCESS // RELAYING DATA TO THE VOID // [01:00:23:55] // SYSTEM_ALERT: UNAUTHORIZED ACCESS // RELAYING DATA TO THE VOID // [01:00:23:55] // 
            </div>
          </div>

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
            ) : viewMode === 'simulations' ? (
              // Simulations View - Entry point, no categories shown yet
              <SimulationsView 
                simulationData={simulationData} 
                allEntries={allEntries}
                glitchActive={glitchActive}
                onSimulationSelect={(simulationId) => {
                  setSelectedSimulationId(simulationId);
                  setViewMode('simulation-categories');
                }}
              />
            ) : viewMode === 'simulation-categories' && selectedSimulationId ? (
              // Categories by Simulation - shown after selecting a simulation
              <SimulationCategoriesView
                simulation={simulationData.find(s => s.id === selectedSimulationId)!}
                allEntries={allEntries}
                glitchActive={glitchActive}
                onEntrySelect={handleEntryClick}
              />
            ) : selectedCategory ? (
              // Category Entries List
              <CategoryEntriesView 
                category={selectedCategory}
                entries={filteredEntries}
                glitchActive={glitchActive}
                onEntryClick={handleEntryClick}
              />
            ) : (
              // Fallback to simulations view
              <SimulationsView 
                simulationData={simulationData} 
                allEntries={allEntries}
                glitchActive={glitchActive}
                onSimulationSelect={(simulationId) => {
                  setSelectedSimulationId(simulationId);
                  setViewMode('simulation-categories');
                }}
              />
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Category Entries View
function CategoryEntriesView({
  category,
  entries,
  glitchActive,
  onEntryClick
}: {
  category: CodexEntryType;
  entries: CodexEntry[];
  glitchActive: boolean;
  onEntryClick: (entry: CodexEntry) => void;
}) {
  const Icon = CATEGORY_ICONS[category];
  
  const categoryLabel = (CATEGORY_LABELS as Record<string, string>)[category] || category;
  
  return (
    <div className={styles.entriesList}>
      <div className={styles.listHeader}>
        <Icon className="w-6 h-6 text-indigo-400" />
        <h2 className={glitchActive ? styles.glitching : ''}>{categoryLabel}</h2>
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
            <h3 className={`${styles.entryName} ${glitchActive ? styles.glitching : ''}`}>{entry.name}</h3>
            {entry.subtitle && (
              <p className={styles.entrySubtitle}>{entry.subtitle}</p>
            )}
            <p className={styles.entrySummary}>{entry.summary}</p>
            <div className={styles.entryFooter}>
              <span className={styles.entryBadge}>{(CATEGORY_LABELS as Record<string, string>)[entry.entry_type] || entry.entry_type}</span>
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
  const entryTypeLabel = (CATEGORY_LABELS as Record<string, string>)[entry.entry_type] || entry.entry_type;
  
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
          {entryTypeLabel}
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

// Simulations View - Entry point, descriptions shown prominently
function SimulationsView({
  simulationData,
  allEntries,
  glitchActive,
  onSimulationSelect
}: {
  simulationData: Simulation[];
  allEntries: CodexEntry[];
  glitchActive: boolean;
  onSimulationSelect: (simulationId: string) => void;
}) {
  const [glitchedText, setGlitchedText] = useState<{[key: string]: string}>({});

  // Random glitch effect on text
  useEffect(() => {
    const glitchInterval = setInterval(() => {
      const shouldGlitch = Math.random() > 0.7;
      if (shouldGlitch && simulationData.length > 0) {
        const randomIndex = Math.floor(Math.random() * simulationData.length);
        const simulation = simulationData[randomIndex];
        const glitchChars = '!@#$%^&*()_+{}|:<>?~';
        const originalName = simulation.name;
        
        // Create glitched version
        const glitched = originalName.split('').map((char) => 
          Math.random() > 0.8 ? glitchChars[Math.floor(Math.random() * glitchChars.length)] : char
        ).join('');
        
        setGlitchedText(prev => ({...prev, [simulation.id]: glitched}));
        
        // Reset after short time
        setTimeout(() => {
          setGlitchedText(prev => {
            const newState = {...prev};
            delete newState[simulation.id];
            return newState;
          });
        }, 150);
      }
    }, 3000);

    return () => clearInterval(glitchInterval);
  }, [simulationData]);

  return (
    <div className={styles.simulationsView}>
      <div className={styles.simulationsHeader}>
        <Cpu className="w-6 h-6" />
        <h2 className={glitchActive ? styles.glitching : ''}>Simulations</h2>
        <span className={styles.count}>{simulationData.length} Available</span>
      </div>

      <div className={styles.simulationsList}>
        {simulationData.map((simulation, index) => {
          // Find entries related to this simulation
          const relatedEntries = allEntries.filter(entry =>
            entry.appears_in_locations?.some(locId =>
              simulation.locations?.some(loc => loc.id === locId)
            )
          );

          const displayName = glitchedText[simulation.id] || simulation.name;

          return (
            <motion.div 
              key={simulation.id} 
              className={styles.simulationCard}
              onClick={() => onSimulationSelect(simulation.id)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className={styles.simulationHeader}>
                <div 
                  className={styles.simulationIcon}
                  style={{ 
                    backgroundImage: `url(${simulation.thumbUrl})`,
                    borderColor: simulation.color 
                  }}
                />
              </div>

              <div className={styles.simulationHeaderText}>
                <h3 className={styles.simulationName}>
                  {String(index + 1).padStart(2, '0')}. {displayName}
                </h3>
              </div>

              {/* Description prominently displayed */}
              <div className={styles.simulationDescription}>
                <p>{simulation.description}</p>
              </div>

              {/* Summary Stats */}
              <div className={styles.simulationStats}>
                <span className={styles.stat}>
                  {simulation.locations?.length || 0} LOC
                </span>
                <span className={styles.stat}>
                  {relatedEntries.length} ENT
                </span>
              </div>

              <div className={styles.clickHint}>
                Access →
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// Simulation Categories View Component - shown after selecting a simulation
function SimulationCategoriesView({ simulation, allEntries, glitchActive, onEntrySelect }: {
  simulation: Simulation;
  allEntries: CodexEntry[];
  glitchActive: boolean;
  onEntrySelect: (entry: CodexEntry) => void;
}) {
  const [selectedView, setSelectedView] = useState<'lore' | AllowedCategory | null>(null);

  // Filter entries related to this simulation
  const simulationEntries = allEntries.filter(entry =>
    entry.appears_in_locations?.some(locId =>
      simulation.locations?.some(loc => loc.id === locId)
    )
  );

  // Group by category
  const simulationEntriesByType = (Object.keys(CATEGORY_LABELS) as AllowedCategory[]).reduce((acc, type) => {
    acc[type] = simulationEntries.filter(e => e.entry_type === type);
    return acc;
  }, {} as Record<AllowedCategory, CodexEntry[]>);

  // Get lore text for this simulation (case-insensitive match)
  const simulationKey = simulation.name.toLowerCase().replace(/\s+/g, '-');
  const loreText = SIMULATION_LORE[simulationKey] || SIMULATION_LORE[simulation.id] || null;
  const simulationMeta = SIMULATION_METADATA[simulationKey] || SIMULATION_METADATA[simulation.id] || null;

  return (
    <div className={styles.categoriesView}>
      <div className={styles.categoriesHeader}>
        <div className={styles.simulationHeaderInline}>
          <div 
            className={styles.simulationIconSmall}
            style={{ 
              backgroundImage: `url(${simulation.thumbUrl})`,
              borderColor: simulation.color 
            }}
          />
          <div>
            <h2 className={glitchActive ? styles.glitching : ''}>{simulation.name}</h2>
            <p className={styles.simulationDescSmall}>{simulation.description}</p>
          </div>
        </div>
        <span className={styles.count}>{simulationEntries.length} total entries</span>
      </div>

      {/* Left sidebar - Always visible with lore and categories */}
      <div className={styles.categoriesGrid}>
        {/* Lore Card - Clickable */}
        {loreText && (
          <motion.button
            className={`${styles.loreCard} ${selectedView === 'lore' ? styles.loreCardActive : ''}`}
            onClick={() => setSelectedView('lore')}
            whileHover={{ x: 5 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className={styles.loreCardHeader}>
              <Book className="w-5 h-5" />
              <h3>Lore</h3>
            </div>
          </motion.button>
        )}

        {/* Category Cards - Only show character and faction */}
        {(Object.keys(CATEGORY_LABELS) as AllowedCategory[]).map((category) => {
          const Icon = CATEGORY_ICONS[category];
          const count = simulationEntriesByType[category]?.length || 0;

          return (
            <motion.button
              key={category}
              className={`${styles.categoryCard} ${selectedView === category ? styles.categoryCardActive : ''}`}
              onClick={() => setSelectedView(category)}
              whileHover={{ x: 5 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className={styles.categoryIconWrapper}>
                <Icon className="w-6 h-6" />
              </div>
              <div className={styles.categoryContent}>
                <h3 className={`${styles.categoryName} ${glitchActive ? styles.glitching : ''}`}>{CATEGORY_LABELS[category]}</h3>
                <span className={styles.categoryCount}>{count} ENT</span>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Right side main component - Shows selected content */}
      <div className={styles.categoryInfoPanel}>
        {!selectedView ? (
          // Default state
          <>
            <div className={styles.infoPanelHeader}>
              <Info className="w-5 h-5" />
              <span>SELECT A CATEGORY</span>
            </div>
            <p className={styles.infoPanelText}>
              Choose Lore or a category from the left panel to view information for {simulation.name}.
            </p>
            <div className={styles.infoPanelStats}>
              <div className={styles.infoPanelStat}>
                <span className={styles.statLabel}>LOCATIONS:</span>
                <span className={styles.statValue}>{simulation.locations?.length || 0}</span>
              </div>
              <div className={styles.infoPanelStat}>
                <span className={styles.statLabel}>TOTAL ENTRIES:</span>
                <span className={styles.statValue}>{simulationEntries.length}</span>
              </div>
            </div>
          </>
        ) : selectedView === 'lore' ? (
          // Lore content view
          <>
            <div className={styles.infoPanelHeader}>
              <Book className="w-5 h-5" />
              <span>LORE</span>
            </div>
            <div className={styles.loreContentMain}>
              {loreText && loreText.split('\n\n').map((paragraph, idx) => (
                <p key={idx} className={paragraph.includes('intentional') ? styles.loreEmphasisMain : ''}>
                  {paragraph}
                </p>
              ))}
              
              {/* Theme and Styles section */}
              {simulationMeta && (
                <div className={styles.simulationMeta}>
                  <div className={styles.metaSection}>
                    <h4 className={styles.metaLabel}>Theme</h4>
                    <p className={styles.metaValue}>{simulationMeta.theme}</p>
                  </div>
                  <div className={styles.metaSection}>
                    <h4 className={styles.metaLabel}>Styles</h4>
                    <p className={styles.metaValue}>{simulationMeta.styles}</p>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : selectedView && CATEGORY_LABELS[selectedView as AllowedCategory] ? (
          // Category entries view
          <>
            <div className={styles.infoPanelHeader}>
              {(() => {
                const Icon = CATEGORY_ICONS[selectedView as AllowedCategory];
                return Icon ? <Icon className="w-5 h-5" /> : null;
              })()}
              <span>{CATEGORY_LABELS[selectedView as AllowedCategory].toUpperCase()}</span>
            </div>
            <div className={styles.entriesListMain}>
              {simulationEntriesByType[selectedView as AllowedCategory]?.length > 0 ? (
                simulationEntriesByType[selectedView as AllowedCategory].map((entry: CodexEntry) => (
                  <motion.button
                    key={entry.id}
                    className={styles.entryNameButton}
                    onClick={() => onEntrySelect(entry)}
                    whileHover={{ x: 3 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className={styles.entryName}>{entry.name}</span>
                    <ArrowLeft className="w-4 h-4" style={{ transform: 'rotate(180deg)' }} />
                  </motion.button>
                ))
              ) : (
                <div className={styles.noEntriesMessage}>
                  <p>No {CATEGORY_LABELS[selectedView as AllowedCategory].toLowerCase()} found in this simulation yet.</p>
                </div>
              )}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

// Intro Dialog Component - Exported for use in PublicMap
export function IntroDialog({ onClose }: { onClose: () => void }) {
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
              backing. It is a passion-driven exploration of interactive storytelling and world-building. A.I is used to generate imagery but the goal is to collaborate with real artists and professionals to create the best possible experience.
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
            onClick={onClose}
            className={styles.introButtonSecondary}
          >
            Remind Me Later
          </button>
          <button
            onClick={onClose}
            className={styles.introButtonPrimary}
          >
            Got It, Don't Show Again
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
