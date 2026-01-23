import { useState, useEffect, useRef } from "react";
import UniverseMap from "@/components/UniverseMap/UniverseMap";
import LocalPointOverlay from "@/components/LocalPointOverlay/LocalPointOverlay";
import CodexPanel, { IntroDialog } from "@/components/CodexPanel/CodexPanel";
import { Region, Location, UNIVERSE_DATA, CONFIG, UniverseConfig } from "@/data/universe-data";
import { fetchSimulations, fetchLoreConfig } from "@/lib/supabase";
import type { CodexEntry } from "@/data/codex-types";

export default function PublicMap() {
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [locationOrigin, setLocationOrigin] = useState<{ x: number; y: number } | null>(null);
  const [simulationData, setSimulationData] = useState<Region[]>(UNIVERSE_DATA);
  const [config, setConfig] = useState<UniverseConfig>(CONFIG);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCodexEntry, setSelectedCodexEntry] = useState<CodexEntry | null>(null);
  const [showIntro, setShowIntro] = useState(false);
  const zoomResetRef = useRef<(() => void) | null>(null);

  // Check if intro should be shown (24-hour persistence)
  useEffect(() => {
    const timestampStr = sessionStorage.getItem('codex_intro_timestamp');
    if (!timestampStr) {
      // First visit - show dialog
      setShowIntro(true);
    } else {
      const timestamp = parseInt(timestampStr, 10);
      const now = Date.now();
      const twentyFourHours = 24 * 60 * 60 * 1000;
      
      if (now - timestamp > twentyFourHours) {
        // More than 24 hours passed - show dialog again
        setShowIntro(true);
      }
    }
  }, []);

  // Load data on mount - priority: Supabase > localStorage > fallback
  useEffect(() => {
    async function loadData() {
      try {
        // Try to load from Supabase first
        const [simulationsData, configData] = await Promise.all([
          fetchSimulations(),
          fetchLoreConfig(),
        ]);

        if (simulationsData && simulationsData.length > 0) {
          // Transform Supabase data to match component format
          const transformedSimulations = simulationsData.map((simulation: any) => ({
            id: simulation.region_id,
            name: simulation.name,
            description: simulation.description,
            color: simulation.color,
            cx: simulation.cx,
            cy: simulation.cy,
            thumbUrl: simulation.thumb_url,
            backgroundUrl: simulation.background_url,
            imageUrl: simulation.image_url,
            locations: (simulation.locations || []).map((loc: any) => ({
              id: loc.location_id,
              name: loc.name,
              description: loc.description,
              cx: loc.cx,
              cy: loc.cy,
              type: loc.location_type,
              thumbUrl: loc.thumb_url,
            })),
          }));
          setSimulationData(transformedSimulations);
          console.log('✅ Loaded data from Supabase');
        } else {
          // Fallback to localStorage if Supabase is empty
          const savedData = localStorage.getItem('simulationData');
          if (savedData) {
            setSimulationData(JSON.parse(savedData));
            console.log('📦 Loaded data from localStorage');
          } else {
            console.log('📋 Using default fallback data');
          }
        }

        if (configData) {
          setConfig(configData.config_value);
          console.log('✅ Loaded config from Supabase');
        } else {
          const savedConfig = localStorage.getItem('universeConfig');
          if (savedConfig) {
            setConfig(JSON.parse(savedConfig));
            console.log('📦 Loaded config from localStorage');
          }
        }
      } catch (error) {
        console.error('Error loading data from Supabase:', error);
        // Fallback to localStorage on error
        const savedData = localStorage.getItem('simulationData');
        const savedConfig = localStorage.getItem('universeConfig');
        
        if (savedData) {
          try {
            setSimulationData(JSON.parse(savedData));
            console.log('📦 Fallback: Loaded data from localStorage');
          } catch (e) {
            console.error('Failed to parse saved simulation data:', e);
          }
        }

        if (savedConfig) {
          try {
            setConfig(JSON.parse(savedConfig));
            console.log('📦 Fallback: Loaded config from localStorage');
          } catch (e) {
            console.error('Failed to parse saved config:', e);
          }
        }
      } finally {
        setIsLoading(false);
        setIsHydrated(true);
      }
    }

    loadData();
  }, []);

  // Keep localStorage in sync as backup (but Supabase is primary)
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem('simulationData', JSON.stringify(simulationData));
    }
  }, [simulationData, isHydrated]);

  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem('universeConfig', JSON.stringify(config));
    }
  }, [config, isHydrated]);

  // Sync state if a region is selected and data changes
  const activeRegion = selectedRegion
    ? simulationData.find(r => r.id === selectedRegion.id) || null
    : null;

  const handleLocationSelect = (loc: Location, screenPos: { x: number; y: number }) => {
    setSelectedLocation(loc);
    setLocationOrigin(screenPos);
  };

  const handleLocationClose = () => {
    setSelectedLocation(null);
    setLocationOrigin(null);
    // Zoom back to universe level
    zoomResetRef.current?.();
  };

  const handleCloseIntro = () => {
    // Set timestamp for 24-hour persistence
    sessionStorage.setItem('codex_intro_timestamp', Date.now().toString());
    setShowIntro(false);
  };

  // Show loading state with skeleton UI
  if (isLoading) {
    return (
      <main className="flex items-center justify-center min-h-screen" style={{ background: '#0D1B2A' }}>
        <div className="text-center">
          {/* Animated loading spinner */}
          <div 
            className="mx-auto mb-6"
            style={{
              width: '64px',
              height: '64px',
              border: '4px solid rgba(0, 245, 255, 0.2)',
              borderTopColor: '#00F5FF',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }}
          />
          
          {/* Loading text with glow effect */}
          <p 
            className="text-lg font-bold mb-2"
            style={{ 
              color: '#00F5FF',
              textShadow: '0 0 10px rgba(0, 245, 255, 0.5)',
              letterSpacing: '2px',
            }}
          >
            INITIALIZING SIMULATIONS
          </p>
          
          {/* Progress bar skeleton */}
          <div 
            className="mx-auto mt-4"
            style={{
              width: '200px',
              height: '4px',
              background: 'rgba(0, 245, 255, 0.1)',
              borderRadius: '2px',
              overflow: 'hidden',
            }}
          >
            <div 
              style={{
                width: '100%',
                height: '100%',
                background: 'linear-gradient(90deg, transparent, #00F5FF, transparent)',
                animation: 'shimmer 1.5s ease-in-out infinite',
              }}
            />
          </div>
          
          {/* Inline keyframes for loading animation */}
          <style>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
            @keyframes shimmer {
              0% { transform: translateX(-100%); }
              100% { transform: translateX(100%); }
            }
          `}</style>
        </div>
      </main>
    );
  }

  return (
    <main>
      {/* Intro Dialog */}
      {showIntro && (
        <IntroDialog onClose={handleCloseIntro} />
      )}

      <UniverseMap
        onRegionSelect={setSelectedRegion}
        selectedRegion={activeRegion}
        universeData={simulationData}
        baseBackground={config.multiverseBackgroundUrl}
        onLocationSelect={handleLocationSelect}
        onLocationClose={handleLocationClose}
        zoomResetRef={zoomResetRef}
      />

      <LocalPointOverlay
        location={selectedLocation}
        origin={locationOrigin}
        regionColor={activeRegion?.color || '#6366f1'}
        onClose={handleLocationClose}
      />

      <CodexPanel
        onEntrySelect={setSelectedCodexEntry}
        selectedEntry={selectedCodexEntry}
        simulationData={simulationData}
      />
    </main>
  );
}

