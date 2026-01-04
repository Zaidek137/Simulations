"use client";

import { useState, useEffect, useRef } from "react";
import UniverseMap from "@/components/UniverseMap/UniverseMap";
import AdminPortal from "@/components/AdminPortal/AdminPortal";
import LocalPointOverlay from "@/components/LocalPointOverlay/LocalPointOverlay";
import { Region, Location, UNIVERSE_DATA, CONFIG, UniverseConfig } from "@/data/universe-data";
import { fetchRegions, fetchLoreConfig } from "@/lib/supabase";

export default function Home() {
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [locationOrigin, setLocationOrigin] = useState<{ x: number; y: number } | null>(null);
  const [universeData, setUniverseData] = useState<Region[]>(UNIVERSE_DATA);
  const [config, setConfig] = useState<UniverseConfig>(CONFIG);
  const [pickedCoords, setPickedCoords] = useState<{ x: number; y: number } | null>(null);
  const [isPicking, setIsPicking] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const zoomResetRef = useRef<(() => void) | null>(null);

  // Load data on mount - priority: Supabase > localStorage > fallback
  useEffect(() => {
    async function loadData() {
      try {
        // Try to load from Supabase first
        const [regionsData, configData] = await Promise.all([
          fetchRegions(),
          fetchLoreConfig(),
        ]);

        if (regionsData && regionsData.length > 0) {
          // Transform Supabase data to match component format
          const transformedRegions = regionsData.map((region: any) => ({
            id: region.region_id,
            name: region.name,
            description: region.description,
            color: region.color,
            cx: region.cx,
            cy: region.cy,
            thumbUrl: region.thumb_url,
            backgroundUrl: region.background_url,
            imageUrl: region.image_url,
            locations: (region.locations || []).map((loc: any) => ({
              id: loc.location_id,
              name: loc.name,
              description: loc.description,
              cx: loc.cx,
              cy: loc.cy,
              type: loc.location_type,
              thumbUrl: loc.thumb_url,
            })),
          }));
          setUniverseData(transformedRegions);
          console.log('✅ Loaded data from Supabase');
        } else {
          // Fallback to localStorage if Supabase is empty
          const savedData = localStorage.getItem('universeData');
          if (savedData) {
            setUniverseData(JSON.parse(savedData));
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
        const savedData = localStorage.getItem('universeData');
        const savedConfig = localStorage.getItem('universeConfig');
        
        if (savedData) {
          try {
            setUniverseData(JSON.parse(savedData));
            console.log('📦 Fallback: Loaded data from localStorage');
          } catch (e) {
            console.error('Failed to parse saved universe data:', e);
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
      localStorage.setItem('universeData', JSON.stringify(universeData));
    }
  }, [universeData, isHydrated]);

  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem('universeConfig', JSON.stringify(config));
    }
  }, [config, isHydrated]);

  // Sync state if a region is selected and data changes
  const activeRegion = selectedRegion
    ? universeData.find(r => r.id === selectedRegion.id) || null
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

  // Show loading state
  if (isLoading) {
    return (
      <main className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading Simulations...</p>
        </div>
      </main>
    );
  }

  return (
    <main>
      <UniverseMap
        onRegionSelect={setSelectedRegion}
        selectedRegion={activeRegion}
        universeData={universeData}
        onCoordPick={isPicking ? setPickedCoords : undefined}
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

      <AdminPortal
        data={universeData}
        config={config}
        onUpdate={setUniverseData}
        onConfigUpdate={setConfig}
        onCoordPick={setPickedCoords}
        pickedCoords={pickedCoords}
        onPickingStateChange={setIsPicking}
      />
    </main>
  );
}
