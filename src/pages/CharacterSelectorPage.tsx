import { useState, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { CharacterDisplay } from '@/components/CharacterSelector/CharacterDisplay';
import { CharacterCard } from '@/components/CharacterSelector/CharacterCard';
import { fetchIndexEntries } from '@/lib/indexDatabase';
import { MOCK_INDEX_ENTRIES, type IndexEntry, type Simulation, type IndexType } from '@/data/characterData';
import styles from '@/components/CharacterSelector/CharacterSelector.module.css';

const VISIBLE_CARDS = 3; // Number of cards visible at once

const SIMULATIONS: Simulation[] = ['Resonance', 'Prime', 'Veliental Ascendance'];
const INDEX_TYPES: IndexType[] = ['Characters', 'ZIBBots', 'Environments'];

type FilterStep = 'simulation' | 'type' | 'faction' | 'results';

export function CharacterSelectorPage() {
  const [indexEntries, setIndexEntries] = useState<IndexEntry[]>([]);
  const [currentFilterStep, setCurrentFilterStep] = useState<FilterStep>('simulation');
  const [selectedSimulation, setSelectedSimulation] = useState<Simulation>('Resonance');
  const [selectedType, setSelectedType] = useState<IndexType | 'All'>('All');
  const [selectedFaction, setSelectedFaction] = useState<string>('All');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [sliderOffset, setSliderOffset] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Load entries from database
  useEffect(() => {
    const loadEntries = async () => {
      try {
        const entries = await fetchIndexEntries();
        // Fallback to mock data if database is empty
        setIndexEntries(entries.length > 0 ? entries : MOCK_INDEX_ENTRIES);
        console.log(`📊 Loaded ${entries.length} entries for display`);
      } catch (error: any) {
        console.error('⚠️ Error loading index entries:', error);
        if (error.message && error.message.includes('table not created')) {
          console.warn('Using mock data - database table not created yet');
        }
        // Fallback to mock data on error
        setIndexEntries(MOCK_INDEX_ENTRIES);
      } finally {
        setIsLoading(false);
      }
    };

    loadEntries();
  }, []);

  // Get available factions for the selected simulation and type
  const availableFactions = useMemo(() => {
    const factions = new Set<string>();
    indexEntries
      .filter(entry => {
        if (entry.simulation !== selectedSimulation) return false;
        if (selectedType !== 'All' && entry.type !== selectedType) return false;
        return true;
      })
      .forEach(entry => factions.add(entry.faction));
    return ['All', ...Array.from(factions).sort()];
  }, [indexEntries, selectedSimulation, selectedType]);

  // Filter entries based on simulation, type, and faction
  const filteredEntries = useMemo(() => {
    return indexEntries.filter(entry => {
      if (entry.simulation !== selectedSimulation) return false;
      if (selectedType !== 'All' && entry.type !== selectedType) return false;
      if (selectedFaction === 'All') return true;
      return entry.faction === selectedFaction;
    });
  }, [indexEntries, selectedSimulation, selectedType, selectedFaction]);

  const selectedEntry = filteredEntries[selectedIndex] || null;

  // Check if current simulation is "coming soon"
  const isComingSoon = selectedSimulation === 'Prime' || selectedSimulation === 'Veliental Ascendance';

  // Simulate initial loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Reset selection when simulation, type, or faction changes
  useEffect(() => {
    setSelectedIndex(0);
    setSliderOffset(0);
  }, [selectedSimulation, selectedType, selectedFaction]);

  // Get visible cards based on slider offset
  const visibleCards = useMemo(() => {
    const cards: { entry: IndexEntry; index: number }[] = [];
    for (let i = 0; i < VISIBLE_CARDS; i++) {
      const idx = sliderOffset + i;
      if (idx < filteredEntries.length) {
        cards.push({ entry: filteredEntries[idx], index: idx });
      }
    }
    return cards;
  }, [filteredEntries, sliderOffset]);

  const canGoLeft = sliderOffset > 0;
  const canGoRight = sliderOffset + VISIBLE_CARDS < filteredEntries.length;

  const handlePrevious = useCallback(() => {
    if (canGoLeft) {
      setSliderOffset(prev => prev - 1);
    }
  }, [canGoLeft]);

  const handleNext = useCallback(() => {
    if (canGoRight) {
      setSliderOffset(prev => prev + 1);
    }
  }, [canGoRight]);

  const handleEntrySelect = useCallback((index: number) => {
    setSelectedIndex(index);
  }, []);

  const handleSimulationChange = useCallback((simulation: Simulation) => {
    setSelectedSimulation(simulation);
    setSelectedType('All');
    setSelectedFaction('All');
    // Move to next step only if not "coming soon"
    if (simulation === 'Resonance') {
      setCurrentFilterStep('type');
    } else {
      setCurrentFilterStep('results');
    }
  }, []);

  const handleTypeChange = useCallback((type: IndexType | 'All') => {
    setSelectedType(type);
    setSelectedFaction('All');
    setCurrentFilterStep('faction');
  }, []);

  const handleFactionChange = useCallback((faction: string) => {
    setSelectedFaction(faction);
    setCurrentFilterStep('results');
  }, []);

  const handleBackToSimulation = useCallback(() => {
    setCurrentFilterStep('simulation');
    setSelectedType('All');
    setSelectedFaction('All');
  }, []);

  const handleBackToType = useCallback(() => {
    setCurrentFilterStep('type');
    setSelectedFaction('All');
  }, []);

  const handleBackToFaction = useCallback(() => {
    setCurrentFilterStep('faction');
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner} />
          <span className={styles.loadingText}>
            Loading The Index...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      {/* Header - Text Only */}
      <header className={styles.header}>
        <motion.h1 
          className={styles.title}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          THE INDEX
        </motion.h1>
      </header>

      {/* Main Content */}
      <div className={styles.mainContent}>
        {/* Left - Card Slider Section */}
        <motion.div 
          className={styles.sliderSection}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          {/* Filter Menu - Progressive Disclosure */}
          <div className={styles.filterMenu}>
            {currentFilterStep === 'simulation' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className={styles.filterHeader}>Simulations</div>
                <div className={styles.filterRow}>
                  {SIMULATIONS.map(sim => (
                    <button
                      key={sim}
                      className={`${styles.filterButton} ${selectedSimulation === sim ? styles.filterButtonActive : ''}`}
                      onClick={() => handleSimulationChange(sim)}
                    >
                      {sim}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
            
            {currentFilterStep === 'type' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <button 
                  className={styles.filterBackButton}
                  onClick={handleBackToSimulation}
                >
                  ← Back to Simulation
                </button>
                <div className={styles.filterRow}>
                  <span className={styles.filterLabel}>Select Type</span>
                  <button
                    className={`${styles.filterButton} ${selectedType === 'All' ? styles.filterButtonActive : ''}`}
                    onClick={() => handleTypeChange('All')}
                  >
                    All
                  </button>
                  {INDEX_TYPES.map(type => (
                    <button
                      key={type}
                      className={`${styles.filterButton} ${selectedType === type ? styles.filterButtonActive : ''}`}
                      onClick={() => handleTypeChange(type)}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
            
            {currentFilterStep === 'faction' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <button 
                  className={styles.filterBackButton}
                  onClick={handleBackToType}
                >
                  ← Back to Type
                </button>
                <div className={styles.filterRow}>
                  <span className={styles.filterLabel}>Select Faction</span>
                  {availableFactions.map(faction => (
                    <button
                      key={faction}
                      className={`${styles.filterButton} ${selectedFaction === faction ? styles.filterButtonActive : ''}`}
                      onClick={() => handleFactionChange(faction)}
                    >
                      {faction}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Coming Soon Message or Card Slider */}
          {isComingSoon && currentFilterStep === 'results' ? (
            <>
              <button 
                className={styles.filterBackButton}
                onClick={handleBackToSimulation}
              >
                ← Back to Simulation
              </button>
              <motion.div 
                className={styles.comingSoonMessage}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <p className={styles.comingSoonText}>Coming Much Later</p>
              </motion.div>
            </>
          ) : currentFilterStep === 'results' ? (
            <>
              {/* Back Button for Results */}
              <button 
                className={styles.filterBackButton}
                onClick={handleBackToFaction}
              >
                ← Back to Faction
              </button>
              
              {/* Card Slider */}
              <div className={styles.cardSlider}>
                <button 
                  className={styles.sliderArrow}
                  onClick={handlePrevious}
                  disabled={!canGoLeft}
                  aria-label="Previous entries"
                >
                  <ChevronLeft size={24} />
                </button>
                
                <div className={styles.sliderTrack}>
                  <AnimatePresence mode="popLayout">
                    {visibleCards.map(({ entry, index }) => {
                      const isCenter = selectedIndex === index;
                      const isPrev = selectedIndex === index + 1;
                      const isNext = selectedIndex === index - 1;
                      const isAdjacent = isPrev || isNext;
                      
                      return (
                        <motion.div
                          key={entry.id}
                          className={styles.cardWrapper}
                          style={{
                            opacity: isCenter ? 1 : isAdjacent ? 0.3 : 0,
                            pointerEvents: isCenter ? 'auto' : 'none',
                            transform: isCenter ? 'scale(1)' : 'scale(0.9)',
                          }}
                          animate={{
                            opacity: isCenter ? 1 : isAdjacent ? 0.3 : 0,
                            transform: isCenter ? 'scale(1)' : 'scale(0.9)',
                          }}
                          transition={{ duration: 0.3 }}
                        >
                          <CharacterCard
                            character={entry}
                            isSelected={isCenter}
                            onClick={() => handleEntrySelect(index)}
                            index={0}
                          />
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
                
                <button 
                  className={styles.sliderArrow}
                  onClick={handleNext}
                  disabled={!canGoRight}
                  aria-label="Next entries"
                >
                  <ChevronRight size={24} />
                </button>
              </div>

              {/* Description Panel */}
              <motion.div 
                className={styles.descriptionPanel}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <AnimatePresence mode="wait">
                  {selectedEntry ? (
                    <motion.p
                      key={selectedEntry.id}
                      className={styles.descriptionText}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {selectedEntry.description}
                    </motion.p>
                  ) : (
                    <motion.p 
                      className={styles.descriptionEmpty}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      Select an entry to view description
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>
            </>
          ) : null}
        </motion.div>

        {/* Right - 2D Character Display */}
        {!isComingSoon && currentFilterStep === 'results' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <AnimatePresence mode="wait">
              {selectedEntry ? (
                <CharacterDisplay character={selectedEntry} />
              ) : (
                <CharacterDisplay character={null} />
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default CharacterSelectorPage;
