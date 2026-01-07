import { useState, useEffect, useRef } from 'react';
import AdminPortal from '@/components/AdminPortal/AdminPortal';
import CodexAdmin from '@/components/CodexAdmin/CodexAdmin';
import UniverseMap from '@/components/UniverseMap/UniverseMap';
import LocalPointOverlay from '@/components/LocalPointOverlay/LocalPointOverlay';
import { Region, Location, UNIVERSE_DATA, CONFIG, UniverseConfig } from '@/data/universe-data';
import { fetchRegions, fetchLoreConfig } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';

type AdminTab = 'universes' | 'codex';

export default function AdminPage() {
  // ALL hooks must be at the top before any conditional returns
  const [activeTab, setActiveTab] = useState<AdminTab>('universes');
  const [universeData, setUniverseData] = useState<Region[]>(UNIVERSE_DATA);
  const [config, setConfig] = useState<UniverseConfig>(CONFIG);
  const [pickedCoords, setPickedCoords] = useState<{ x: number; y: number } | null>(null);
  const [isPicking, setIsPicking] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [locationOrigin, setLocationOrigin] = useState<{ x: number; y: number } | null>(null);
  const zoomResetRef = useRef<(() => void) | null>(null);
  const navigate = useNavigate();

  // Simple password protection (you can enhance this with Supabase auth)
  const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'scavenjer2026';

  useEffect(() => {
    // Check if already authorized in this session
    const isAuth = sessionStorage.getItem('admin_authorized') === 'true';
    if (isAuth) {
      setIsAuthorized(true);
      loadData();
    } else {
      setIsLoading(false);
    }
  }, []);

  async function loadData() {
    setIsLoading(true);
    try {
      console.log('📥 Loading data from Supabase...');
      const [regionsData, configData] = await Promise.all([
        fetchRegions(),
        fetchLoreConfig(),
      ]);

      console.log('📊 Fetched regions:', regionsData);
      console.log('⚙️ Fetched config:', configData);

      if (regionsData && regionsData.length > 0) {
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
        console.log('✅ Transformed regions:', transformedRegions);
        setUniverseData(transformedRegions);
      } else {
        console.warn('⚠️ No regions found in Supabase, using default data');
      }

      if (configData) {
        setConfig(configData.config_value);
      }
    } catch (error) {
      console.error('❌ Error loading admin data:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem('admin_authorized', 'true');
      setIsAuthorized(true);
      setError('');
      loadData();
    } else {
      setError('Incorrect password');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin_authorized');
    setIsAuthorized(false);
    navigate('/');
  };

  // Login screen
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="bg-gray-900 border border-indigo-500/30 rounded-lg p-8 max-w-md w-full">
          <h1 className="text-3xl font-bold text-white mb-2">Admin Access</h1>
          <p className="text-gray-400 mb-6">Enter password to continue</p>
          
          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500 mb-4"
              autoFocus
            />
            
            {error && (
              <p className="text-red-500 text-sm mb-4">{error}</p>
            )}
            
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              Access Admin Panel
            </button>
          </form>

          <button
            onClick={() => navigate('/')}
            className="w-full mt-4 text-gray-400 hover:text-white transition-colors"
          >
            ← Back to Map
          </button>

          <div className="mt-6 p-4 bg-gray-800/50 rounded border border-gray-700">
            <p className="text-xs text-gray-500">
              <strong>Default Password:</strong> scavenjer2026
              <br />
              <em>(Set VITE_ADMIN_PASSWORD in .env.local to change)</em>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Admin interface
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading Admin Interface...</p>
        </div>
      </div>
    );
  }

  // Helper variables and functions (after all hooks and conditional returns)
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
    zoomResetRef.current?.();
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Map Background (only for universes tab) */}
      {activeTab === 'universes' && (
        <>
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

          {/* Location Overlay */}
          {selectedLocation && (
            <LocalPointOverlay
              location={selectedLocation}
              origin={locationOrigin}
              regionColor={activeRegion?.color || '#6366f1'}
              onClose={handleLocationClose}
            />
          )}
        </>
      )}

      {/* Admin Header */}
      <header className="fixed top-0 left-0 right-0 bg-gray-900/80 backdrop-blur-md border-b border-indigo-500/30 z-40">
        <div className="max-w-full px-6 py-3 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="text-2xl">⚙️</span>
              Admin Dashboard
            </h1>
            <span className="px-3 py-1 bg-green-500/20 text-green-300 text-xs rounded-full font-semibold">
              ● AUTHORIZED
            </span>

            {/* Tab Navigation */}
            <div className="flex gap-2 ml-6">
              <button
                onClick={() => setActiveTab('universes')}
                className={`px-4 py-2 text-sm rounded-lg transition-all font-semibold ${
                  activeTab === 'universes'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white/5 text-gray-300 hover:bg-white/10'
                }`}
              >
                🌌 Universes
              </button>
              <button
                onClick={() => setActiveTab('codex')}
                className={`px-4 py-2 text-sm rounded-lg transition-all font-semibold ${
                  activeTab === 'codex'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white/5 text-gray-300 hover:bg-white/10'
                }`}
              >
                📖 Codex
              </button>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-all"
            >
              👁️ Public View
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm bg-red-500/20 text-red-300 hover:bg-red-500/30 rounded-lg transition-all font-semibold"
            >
              🚪 Logout
            </button>
          </div>
        </div>
      </header>

      {/* Admin Content */}
      <div className="pt-16 h-screen">
        {activeTab === 'universes' ? (
          <AdminPortal
            data={universeData}
            config={config}
            onUpdate={setUniverseData}
            onConfigUpdate={setConfig}
            onCoordPick={setPickedCoords}
            pickedCoords={pickedCoords}
            onPickingStateChange={setIsPicking}
          />
        ) : (
          <div className="h-full p-6">
            <CodexAdmin simulationData={universeData} />
          </div>
        )}
      </div>
    </div>
  );
}

