import { useState, useEffect, useRef } from 'react';
import { useActiveAccount } from 'thirdweb/react';
import AdminPortal from '@/components/AdminPortal/AdminPortal';
import CodexAdmin from '@/components/CodexAdmin/CodexAdmin';
import CharacterAdmin from '@/components/CharacterAdmin/CharacterAdmin';
import UniverseMap from '@/components/UniverseMap/UniverseMap';
import LocalPointOverlay from '@/components/LocalPointOverlay/LocalPointOverlay';
import { Region, Location, UNIVERSE_DATA, CONFIG, UniverseConfig } from '@/data/universe-data';
import { fetchRegions, fetchLoreConfig } from '@/lib/supabase';
import { isAdminWallet, MASTER_ADMIN_WALLET } from '@/admin/constants';
import { useNavigate } from 'react-router-dom';
import { Shield, AlertTriangle, Wallet } from 'lucide-react';

type AdminTab = 'universes' | 'codex' | 'characters';

export default function AdminPage() {
  const account = useActiveAccount();
  const navigate = useNavigate();
  
  // ALL hooks must be at the top before any conditional returns
  const [activeTab, setActiveTab] = useState<AdminTab>('universes');
  const [universeData, setUniverseData] = useState<Region[]>(UNIVERSE_DATA);
  const [config, setConfig] = useState<UniverseConfig>(CONFIG);
  const [pickedCoords, setPickedCoords] = useState<{ x: number; y: number } | null>(null);
  const [isPicking, setIsPicking] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [locationOrigin, setLocationOrigin] = useState<{ x: number; y: number } | null>(null);
  const zoomResetRef = useRef<(() => void) | null>(null);

  // Check admin status when wallet connects
  useEffect(() => {
    async function checkAdmin() {
      setCheckingAdmin(true);
      if (account?.address) {
        // Master admin gets immediate access, no database check needed
        if (account.address.toLowerCase() === MASTER_ADMIN_WALLET.toLowerCase()) {
          setIsAdmin(true);
          setCheckingAdmin(false);
          loadData();
          return;
        }
        
        // For other wallets, check database
        const adminStatus = await isAdminWallet(account.address);
        setIsAdmin(adminStatus);
        if (adminStatus) {
          loadData();
        }
      } else {
        setIsAdmin(false);
      }
      setCheckingAdmin(false);
    }
    checkAdmin();
  }, [account?.address]);

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

  // Checking admin status screen
  if (checkingAdmin) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Verifying Admin Access...</p>
        </div>
      </div>
    );
  }

  // No wallet connected screen
  if (!account) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="bg-gray-900 border border-indigo-500/30 rounded-lg p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-indigo-500/20 flex items-center justify-center">
            <Wallet className="w-10 h-10 text-indigo-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Connect Wallet</h1>
          <p className="text-gray-400 mb-6">
            Please connect your wallet to access the admin portal.
            Only authorized wallets can access admin features.
          </p>
          
          <div className="p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-lg mb-6">
            <p className="text-sm text-indigo-300">
              Use the wallet button in the top-right corner to connect your wallet.
            </p>
          </div>

          <button
            onClick={() => navigate('/')}
            className="w-full mt-4 text-gray-400 hover:text-white transition-colors"
          >
            ← Back to Map
          </button>
        </div>
      </div>
    );
  }

  // Access denied screen (wallet connected but not admin)
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="bg-gray-900 border border-red-500/30 rounded-lg p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
            <AlertTriangle className="w-10 h-10 text-red-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-gray-400 mb-6">
            Your wallet is not authorized to access the admin portal.
          </p>
          
          <div className="p-4 bg-gray-800/50 rounded border border-gray-700 mb-6 text-left">
            <p className="text-xs text-gray-500 mb-2">
              <strong>Connected Wallet:</strong>
            </p>
            <p className="text-sm text-gray-300 font-mono break-all">
              {account.address}
            </p>
          </div>

          <p className="text-sm text-gray-500 mb-6">
            If you believe this is an error, please contact the master admin.
          </p>

          <button
            onClick={() => navigate('/')}
            className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 rounded-lg transition-colors"
          >
            ← Back to Map
          </button>
        </div>
      </div>
    );
  }

  // Admin interface loading
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

  // Truncate wallet address for display
  const truncatedAddress = account.address
    ? `${account.address.slice(0, 6)}...${account.address.slice(-4)}`
    : '';

  const isMasterAdminWallet = account.address?.toLowerCase() === MASTER_ADMIN_WALLET.toLowerCase();

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
            
            {/* Admin Status Badge */}
            <div className="flex items-center gap-2">
              {isMasterAdminWallet ? (
                <span className="px-3 py-1 bg-yellow-500/20 text-yellow-300 text-xs rounded-full font-semibold flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  MASTER ADMIN
                </span>
              ) : (
                <span className="px-3 py-1 bg-green-500/20 text-green-300 text-xs rounded-full font-semibold">
                  ● ADMIN
                </span>
              )}
              <span className="px-2 py-1 bg-gray-800 text-gray-400 text-xs rounded font-mono">
                {truncatedAddress}
              </span>
            </div>

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
              <button
                onClick={() => setActiveTab('characters')}
                className={`px-4 py-2 text-sm rounded-lg transition-all font-semibold ${
                  activeTab === 'characters'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white/5 text-gray-300 hover:bg-white/10'
                }`}
              >
                👤 Characters
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
        ) : activeTab === 'codex' ? (
          <div className="h-full p-6">
            <CodexAdmin simulationData={universeData} />
          </div>
        ) : (
          <CharacterAdmin />
        )}
      </div>
    </div>
  );
}
