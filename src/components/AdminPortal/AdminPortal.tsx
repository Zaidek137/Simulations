import { useState } from 'react';
import { Region, Location, UniverseConfig } from '@/data/universe-data';
import { ChevronLeft, ChevronRight, Plus, Save, Settings, Globe, MapPin, Trash2, Move, Check, X } from 'lucide-react';
import { upsertRegion, upsertLocation, updateLoreConfig, deleteRegion, deleteLocation } from '@/lib/supabase';

interface AdminPortalProps {
    data: Region[];
    config: UniverseConfig;
    onUpdate: (newData: Region[]) => void;
    onConfigUpdate: (config: UniverseConfig) => void;
    onCoordPick: (coords: { x: number; y: number } | null) => void;
    pickedCoords: { x: number; y: number } | null;
    onPickingStateChange?: (isPicking: boolean) => void;
}

type Tab = 'universes' | 'settings';

export default function AdminPortal({ 
    data, 
    config, 
    onUpdate, 
    onConfigUpdate, 
    onCoordPick, 
    pickedCoords, 
    onPickingStateChange 
}: AdminPortalProps) {
    const [isOpen, setIsOpen] = useState(true);
    const [activeTab, setActiveTab] = useState<Tab>('universes');
    const [editingRegion, setEditingRegion] = useState<Region | null>(null);
    const [expandedRegion, setExpandedRegion] = useState<string | null>(null);
    
    // Picking states
    const [isPickingUniversePos, setIsPickingUniversePos] = useState(false);
    const [isAddingLocation, setIsAddingLocation] = useState(false);
    const [relocatingLocId, setRelocatingLocId] = useState<string | null>(null);

    // Form states
    const [newLocName, setNewLocName] = useState('');
    const [newLocDesc, setNewLocDesc] = useState('');
    const [newLocThumbUrl, setNewLocThumbUrl] = useState('');

    const handleSaveRegion = (region: Region) => {
        const newData = data.map(r => r.id === region.id ? region : r);
        onUpdate(newData);
        setEditingRegion(region);
    };

    const handleSaveToDatabase = async () => {
        try {
            console.log('🚀 Starting save to Supabase...');
            console.log('📊 Data to save:', { config, regions: data });

            // Update config
            console.log('💾 Saving config...');
            await updateLoreConfig(config);
            console.log('✅ Config saved');

            // Upsert all regions and their locations
            for (let i = 0; i < data.length; i++) {
                const region = data[i];
                console.log(`📍 Saving region ${i + 1}/${data.length}: ${region.name} (${region.id})`);
                
                // Upsert region
                const regionResult = await upsertRegion({
                    region_id: region.id,
                    name: region.name,
                    description: region.description || '',
                    color: region.color,
                    cx: region.cx,
                    cy: region.cy,
                    thumb_url: region.thumbUrl || '',
                    background_url: region.backgroundUrl || '',
                    image_url: region.imageUrl || '',
                    sort_order: i,
                });
                console.log(`✅ Region saved:`, regionResult);

                // Upsert locations for this region
                for (let j = 0; j < region.locations.length; j++) {
                    const location = region.locations[j];
                    console.log(`  📌 Saving location ${j + 1}/${region.locations.length}: ${location.name} (${location.id})`);
                    
                    const locationResult = await upsertLocation({
                        location_id: location.id,
                        region_id: region.id,
                        name: location.name,
                        description: location.description || '',
                        cx: location.cx,
                        cy: location.cy,
                        location_type: location.type || 'station',
                        thumb_url: location.thumbUrl || '',
                        sort_order: j,
                    });
                    console.log(`  ✅ Location saved:`, locationResult);
                }
            }

            console.log('🎉 All data saved successfully!');
            alert('✅ Changes saved to Supabase successfully!\n\nYour lore data is now persistent across all devices.');
        } catch (err) {
            console.error('❌ Error saving changes:', err);
            alert(`❌ Error saving changes:\n\n${err instanceof Error ? err.message : JSON.stringify(err)}\n\nCheck console for details.`);
        }
    };

    const handleDeleteRegion = async (id: string) => {
        if (confirm('Delete this universe and all its locations?')) {
            try {
                console.log(`🗑️ Deleting region: ${id}`);
                // Delete from Supabase
                await deleteRegion(id);
                console.log(`✅ Region deleted from database: ${id}`);
                
                // Update local state
            onUpdate(data.filter(r => r.id !== id));
            if (editingRegion?.id === id) setEditingRegion(null);
                
                // Show success message
                alert('✅ Universe deleted successfully!');
            } catch (err) {
                console.error('❌ Error deleting region:', err);
                alert(`❌ Failed to delete universe:\n\n${err instanceof Error ? err.message : 'Unknown error'}`);
            }
        }
    };

    const handleAddNewUniverse = () => {
        const id = `univ-${Date.now()}`;
        const newUniv: Region = {
            id,
            name: 'New Universe',
            description: 'A newly discovered realm.',
            color: '#6366f1',
            cx: 500,
            cy: 400,
            thumbUrl: '/images/multiversal-bg.png',
            backgroundUrl: '/images/multiversal-bg.png',
            imageUrl: '/images/multiversal-bg.png',
            locations: []
        };
        onUpdate([...data, newUniv]);
        setEditingRegion(newUniv);
        setExpandedRegion(newUniv.id);
    };

    const toggleRelocate = () => {
        const newState = !isPickingUniversePos;
        setIsPickingUniversePos(newState);
        onPickingStateChange?.(newState);
        if (newState) {
            setIsAddingLocation(false);
        } else {
            onCoordPick(null);
        }
    };

    const applyNewUniversePos = () => {
        if (!editingRegion || !pickedCoords) return;
        const updated = {
            ...editingRegion,
            cx: Math.round(pickedCoords.x),
            cy: Math.round(pickedCoords.y)
        };
        setEditingRegion(updated);
        handleSaveRegion(updated);
        setIsPickingUniversePos(false);
        onPickingStateChange?.(false);
        onCoordPick(null);
    };

    const handleAddLocation = () => {
        if (!editingRegion || !pickedCoords) return;

        const newLoc: Location = {
            id: `loc-${Date.now()}`,
            name: newLocName || 'New Location',
            description: newLocDesc || 'Description',
            cx: Math.round(pickedCoords.x),
            cy: Math.round(pickedCoords.y),
            type: 'station',
            thumbUrl: newLocThumbUrl || editingRegion.thumbUrl
        };

        const updatedRegion = {
            ...editingRegion,
            locations: [...editingRegion.locations, newLoc]
        };

        setEditingRegion(updatedRegion);
        handleSaveRegion(updatedRegion);
        setIsAddingLocation(false);
        onPickingStateChange?.(false);
        onCoordPick(null);
        setNewLocName('');
        setNewLocDesc('');
        setNewLocThumbUrl('');
    };

    const toggleLocRelocate = (locId: string) => {
        if (relocatingLocId === locId) {
            setRelocatingLocId(null);
            onPickingStateChange?.(false);
            onCoordPick(null);
        } else {
            setRelocatingLocId(locId);
            setIsAddingLocation(false);
            setIsPickingUniversePos(false);
            onPickingStateChange?.(true);
        }
    };

    const applyNewLocPos = (locId: string) => {
        if (!editingRegion || !pickedCoords) return;
        const newLocs = editingRegion.locations.map(l =>
            l.id === locId ? { ...l, cx: Math.round(pickedCoords.x), cy: Math.round(pickedCoords.y) } : l
        );
        const updated = { ...editingRegion, locations: newLocs };
        setEditingRegion(updated);
        handleSaveRegion(updated);
        setRelocatingLocId(null);
        onPickingStateChange?.(false);
        onCoordPick(null);
    };

    const handleDeleteLocation = async (locId: string) => {
        if (!editingRegion) return;
        if (confirm('Delete this location?')) {
            try {
                console.log(`🗑️ Deleting location: ${locId}`);
                // Delete from Supabase
                await deleteLocation(locId);
                console.log(`✅ Location deleted from database: ${locId}`);
                
                // Update local state
                const updated = {
                    ...editingRegion,
                    locations: editingRegion.locations.filter(l => l.id !== locId)
                };
                setEditingRegion(updated);
                handleSaveRegion(updated);
                
                alert('✅ Location deleted successfully!');
            } catch (err) {
                console.error('❌ Error deleting location:', err);
                alert(`❌ Failed to delete location:\n\n${err instanceof Error ? err.message : 'Unknown error'}`);
            }
        }
    };

    if (!isOpen) {
    return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed left-0 top-1/2 -translate-y-1/2 bg-gray-900/90 backdrop-blur-md text-white p-3 rounded-r-lg border border-l-0 border-indigo-500/30 hover:bg-gray-800/90 transition-all z-40 shadow-xl"
            >
                <ChevronRight className="w-5 h-5" />
            </button>
        );
    }

    return (
        <div className="fixed left-0 top-16 bottom-0 w-96 bg-gray-900/95 backdrop-blur-md border-r border-indigo-500/30 shadow-2xl overflow-hidden flex flex-col z-40">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
                <h2 className="text-white font-bold text-lg flex items-center gap-2">
                    <Settings className="w-5 h-5 text-indigo-400" />
                    Control Panel
                </h2>
                <button
                    onClick={() => setIsOpen(false)}
                    className="text-gray-400 hover:text-white transition-colors p-1"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
                    </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-800">
                <button
                    onClick={() => setActiveTab('universes')}
                    className={`flex-1 px-4 py-3 text-sm font-semibold transition-all ${
                        activeTab === 'universes'
                            ? 'bg-indigo-500/20 text-indigo-300 border-b-2 border-indigo-500'
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                >
                    <Globe className="w-4 h-4 inline mr-2" />
                    Universes
                </button>
                <button
                    onClick={() => setActiveTab('settings')}
                    className={`flex-1 px-4 py-3 text-sm font-semibold transition-all ${
                        activeTab === 'settings'
                            ? 'bg-indigo-500/20 text-indigo-300 border-b-2 border-indigo-500'
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                >
                    <Settings className="w-4 h-4 inline mr-2" />
                    Settings
                </button>
                    </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {activeTab === 'universes' && (
                    <>
                        {/* Actions */}
                        <div className="flex gap-2">
                            <button
                                onClick={handleAddNewUniverse}
                                className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-lg"
                            >
                                <Plus className="w-4 h-4" />
                                New Universe
                            </button>
                            <button
                                onClick={handleSaveToDatabase}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-lg font-semibold text-sm transition-all flex items-center gap-2 shadow-lg"
                            >
                                <Save className="w-4 h-4" />
                                Save
                            </button>
                    </div>

                        {/* Universe List */}
                        <div className="space-y-2">
                            {data.map(region => (
                                <div key={region.id} className="bg-gray-800/50 rounded-lg border border-gray-700/50 overflow-hidden">
                                    {/* Region Header */}
                                    <div
                                        className={`p-3 cursor-pointer hover:bg-gray-700/30 transition-all ${
                                            editingRegion?.id === region.id ? 'bg-indigo-500/10' : ''
                                        }`}
                                        onClick={() => {
                                            setEditingRegion(region);
                                            setExpandedRegion(expandedRegion === region.id ? null : region.id);
                                        }}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-10 h-10 rounded-lg bg-cover bg-center border border-gray-600"
                                                    style={{ backgroundImage: `url(${region.thumbUrl})` }}
                                                />
                                                <div>
                                                    <h3 className="text-white font-semibold text-sm">{region.name}</h3>
                                                    <p className="text-gray-400 text-xs">{region.locations.length} locations</p>
                                        </div>
                                </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteRegion(region.id);
                                                }}
                                                className="text-red-400 hover:text-red-300 p-1.5 hover:bg-red-500/10 rounded transition-all"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                </div>

                                    {/* Expanded Region Editor */}
                                    {expandedRegion === region.id && editingRegion?.id === region.id && (
                                        <div className="p-4 border-t border-gray-700/50 space-y-4 bg-gray-900/30">
                                            {/* Name Input */}
                                            <div>
                                                <label className="text-gray-400 text-xs font-semibold block mb-1.5">Universe Name</label>
                                                <input
                                                    type="text"
                                                    value={editingRegion.name}
                                                    onChange={e => setEditingRegion({ ...editingRegion, name: e.target.value })}
                                                    className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                                                />
                                            </div>

                                            {/* Description */}
                                            <div>
                                                <label className="text-gray-400 text-xs font-semibold block mb-1.5">Description</label>
                                                <textarea
                                                    value={editingRegion.description}
                                                    onChange={e => setEditingRegion({ ...editingRegion, description: e.target.value })}
                                                    className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                                                    rows={3}
                                                />
                                            </div>

                                            {/* Color Picker */}
                                            <div>
                                                <label className="text-gray-400 text-xs font-semibold block mb-1.5">Color</label>
                                                <input
                                                    type="color"
                                                    value={editingRegion.color}
                                                    onChange={e => setEditingRegion({ ...editingRegion, color: e.target.value })}
                                                    className="w-full h-10 bg-gray-800 border border-gray-700 rounded-lg cursor-pointer"
                                                />
                                            </div>

                                            {/* Images Section */}
                                            <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50 space-y-3">
                                                <h4 className="text-white text-xs font-semibold mb-2">Images</h4>
                                                
                                                {/* Thumbnail URL */}
                                                <div>
                                                    <label className="text-gray-400 text-xs font-semibold block mb-1.5">Thumbnail URL</label>
                                                    <div className="flex gap-2">
                                                        <input
                                                            type="text"
                                                            value={editingRegion.thumbUrl || ''}
                                                            onChange={e => setEditingRegion({ ...editingRegion, thumbUrl: e.target.value })}
                                                            placeholder="/images/your-image.png or https://..."
                                                            className="flex-1 bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded-lg text-xs focus:outline-none focus:border-indigo-500"
                                                        />
                                                        <div
                                                            className="w-10 h-10 rounded bg-cover bg-center border border-gray-600 flex-shrink-0"
                                                            style={{ backgroundImage: `url(${editingRegion.thumbUrl})` }}
                                                            title="Preview"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Background URL */}
                                                <div>
                                                    <label className="text-gray-400 text-xs font-semibold block mb-1.5">Background URL</label>
                                                    <div className="flex gap-2">
                                                        <input
                                                            type="text"
                                                            value={editingRegion.backgroundUrl || ''}
                                                            onChange={e => setEditingRegion({ ...editingRegion, backgroundUrl: e.target.value })}
                                                            placeholder="/images/your-background.png or https://..."
                                                            className="flex-1 bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded-lg text-xs focus:outline-none focus:border-indigo-500"
                                                        />
                                                        <div
                                                            className="w-10 h-10 rounded bg-cover bg-center border border-gray-600 flex-shrink-0"
                                                            style={{ backgroundImage: `url(${editingRegion.backgroundUrl})` }}
                                                            title="Preview"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Image URL */}
                                                <div>
                                                    <label className="text-gray-400 text-xs font-semibold block mb-1.5">Detail Image URL</label>
                                                    <div className="flex gap-2">
                                                        <input
                                                            type="text"
                                                            value={editingRegion.imageUrl || ''}
                                                            onChange={e => setEditingRegion({ ...editingRegion, imageUrl: e.target.value })}
                                                            placeholder="/images/your-detail.png or https://..."
                                                            className="flex-1 bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded-lg text-xs focus:outline-none focus:border-indigo-500"
                                                        />
                                                        <div
                                                            className="w-10 h-10 rounded bg-cover bg-center border border-gray-600 flex-shrink-0"
                                                            style={{ backgroundImage: `url(${editingRegion.imageUrl})` }}
                                                            title="Preview"
                                                        />
                                                    </div>
                                                </div>

                                                <p className="text-gray-500 text-xs italic">
                                                    💡 Tip: Use /images/your-file.png for local files or https://... for external URLs
                                                </p>
                                            </div>

                                            {/* Position */}
                                            <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-gray-400 text-xs font-semibold">Map Position</span>
                                                    <span className="text-indigo-300 text-xs font-mono">
                                                        {editingRegion.cx}, {editingRegion.cy}
                                                    </span>
                                                </div>
                                                {!isPickingUniversePos ? (
                                                    <button
                                                        onClick={toggleRelocate}
                                                        className="w-full bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 px-3 py-2 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2"
                                                    >
                                                        <Move className="w-4 h-4" />
                                                        Reposition
                                                    </button>
                                                ) : (
                                                    <div className="space-y-2">
                                                        <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-lg p-3 text-center">
                                                            <p className="text-indigo-300 text-xs font-semibold mb-1">Click map to select position</p>
                                                            {pickedCoords && (
                                                                <p className="text-white text-xs font-mono">
                                                                    New: {Math.round(pickedCoords.x)}, {Math.round(pickedCoords.y)}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={applyNewUniversePos}
                                                                disabled={!pickedCoords}
                                                                className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-700 disabled:text-gray-500 text-white px-3 py-2 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2"
                                                            >
                                                                <Check className="w-4 h-4" />
                                                                Apply
                                                            </button>
                                                            <button
                                                                onClick={toggleRelocate}
                                                                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2"
                                                            >
                                                                <X className="w-4 h-4" />
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                </div>

                                            {/* Locations Section */}
                                            <div className="pt-4 border-t border-gray-700/50">
                                                <div className="flex items-center justify-between mb-3">
                                                    <h4 className="text-white font-semibold text-sm flex items-center gap-2">
                                                        <MapPin className="w-4 h-4 text-indigo-400" />
                                                        Locations ({editingRegion.locations.length})
                                                    </h4>
                                                    {!isAddingLocation && (
                                                        <button
                                                            onClick={() => {
                                        setIsAddingLocation(true);
                                        setIsPickingUniversePos(false);
                                        onPickingStateChange?.(true);
                                                            }}
                                                            className="bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5"
                                                        >
                                                            <Plus className="w-3 h-3" />
                                                            Add
                                                        </button>
                                                    )}
                                                </div>

                                                {/* Add Location Form */}
                                                {isAddingLocation && (
                                                    <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-lg p-3 mb-3 space-y-2">
                                                        <p className="text-indigo-300 text-xs font-semibold text-center">
                                                            Click map to place location
                                                        </p>
                                                        {pickedCoords && (
                                                            <p className="text-white text-xs font-mono text-center">
                                                                {Math.round(pickedCoords.x)}, {Math.round(pickedCoords.y)}
                                                            </p>
                                                        )}
                                                        <input
                                                            type="text"
                                                            placeholder="Location name"
                                                            value={newLocName}
                                                            onChange={e => setNewLocName(e.target.value)}
                                                            className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
                                                        />
                                                        <textarea
                                                            placeholder="Description"
                                                            value={newLocDesc}
                                                            onChange={e => setNewLocDesc(e.target.value)}
                                                            className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-indigo-500 resize-none"
                                                            rows={2}
                                                        />
                                                        <div>
                                                            <label className="text-gray-400 text-xs font-semibold block mb-1">Image URL (optional)</label>
                                                            <div className="flex gap-2">
                                                                <input
                                                                    type="text"
                                                                    placeholder="/images/location.png or https://..."
                                                                    value={newLocThumbUrl}
                                                                    onChange={e => setNewLocThumbUrl(e.target.value)}
                                                                    className="flex-1 bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded-lg text-xs focus:outline-none focus:border-indigo-500"
                                                                />
                                                                {newLocThumbUrl && (
                                                                    <div
                                                                        className="w-8 h-8 rounded bg-cover bg-center border border-gray-600 flex-shrink-0"
                                                                        style={{ backgroundImage: `url(${newLocThumbUrl})` }}
                                                                        title="Preview"
                                                                    />
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={handleAddLocation}
                                                                disabled={!pickedCoords}
                                                                className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-700 disabled:text-gray-500 text-white px-3 py-2 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2"
                                                            >
                                                                <Check className="w-4 h-4" />
                                                                Add
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    setIsAddingLocation(false);
                                                                    onPickingStateChange?.(false);
                                                                    setNewLocName('');
                                                                    setNewLocDesc('');
                                                                    setNewLocThumbUrl('');
                                                                }}
                                                                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2"
                                                            >
                                                                <X className="w-4 h-4" />
                                                                Cancel
                                                            </button>
                                        </div>
                                    </div>
                                )}

                                                {/* Locations List */}
                                                <div className="space-y-2 max-h-64 overflow-y-auto">
                                                    {editingRegion.locations.map(loc => (
                                                        <div key={loc.id} className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50 space-y-2">
                                                            <div className="flex items-center justify-between">
                                                                <input
                                                                    type="text"
                                                                    value={loc.name}
                                                                    onChange={e => {
                                                                        const newLocs = editingRegion.locations.map(l =>
                                                                            l.id === loc.id ? { ...l, name: e.target.value } : l
                                                                        );
                                                                        setEditingRegion({ ...editingRegion, locations: newLocs });
                                                                    }}
                                                                    className="flex-1 bg-transparent border-none text-white text-sm font-semibold focus:outline-none"
                                                                />
                                                                <button
                                                                    onClick={() => handleDeleteLocation(loc.id)}
                                                                    className="text-red-400 hover:text-red-300 p-1 hover:bg-red-500/10 rounded transition-all"
                                                                >
                                                                    <Trash2 className="w-3.5 h-3.5" />
                                                                </button>
                                                            </div>
                                                            <select
                                                                value={loc.type}
                                                                onChange={e => {
                                                                    const newLocs = editingRegion.locations.map(l =>
                                                                        l.id === loc.id ? { ...l, type: e.target.value as any } : l
                                                                    );
                                                                    setEditingRegion({ ...editingRegion, locations: newLocs });
                                                                }}
                                                                className="w-full bg-gray-700 border border-gray-600 text-white px-2 py-1.5 rounded text-xs focus:outline-none focus:border-indigo-500"
                                                            >
                                                                <option value="planet">🪐 Planet</option>
                                                                <option value="station">🛰️ Station</option>
                                                                <option value="anomaly">✨ Anomaly</option>
                                                            </select>
                                                            <textarea
                                                                value={loc.description}
                                                                onChange={e => {
                                                                    const newLocs = editingRegion.locations.map(l =>
                                                                        l.id === loc.id ? { ...l, description: e.target.value } : l
                                                                    );
                                                                    setEditingRegion({ ...editingRegion, locations: newLocs });
                                                                }}
                                                                className="w-full bg-gray-700 border border-gray-600 text-gray-300 px-2 py-1.5 rounded text-xs focus:outline-none focus:border-indigo-500 resize-none"
                                                                rows={2}
                                                                placeholder="Description..."
                                                            />

                                                            {/* Location Image URL */}
                                                            <div>
                                                                <label className="text-gray-400 text-xs font-semibold block mb-1">Image URL</label>
                                                                <div className="flex gap-2">
                                                                    <input
                                                                        type="text"
                                                                        value={loc.thumbUrl || ''}
                                                                        onChange={e => {
                                                                            const newLocs = editingRegion.locations.map(l =>
                                                                                l.id === loc.id ? { ...l, thumbUrl: e.target.value } : l
                                                                            );
                                                                            setEditingRegion({ ...editingRegion, locations: newLocs });
                                                                        }}
                                                                        placeholder="/images/location.png or https://..."
                                                                        className="flex-1 bg-gray-700 border border-gray-600 text-white px-2 py-1.5 rounded text-xs focus:outline-none focus:border-indigo-500"
                                                                    />
                                                                    <div
                                                                        className="w-8 h-8 rounded bg-cover bg-center border border-gray-600 flex-shrink-0"
                                                                        style={{ backgroundImage: `url(${loc.thumbUrl})` }}
                                                                        title="Preview"
                                                                    />
                                                                </div>
                                                            </div>
                                                            
                                                            {/* Location Position */}
                                                            <div className="flex items-center justify-between bg-gray-900/50 rounded px-2 py-1.5">
                                                                <span className="text-gray-400 text-xs">Pos: {loc.cx}, {loc.cy}</span>
                                                                {relocatingLocId !== loc.id ? (
                                                                    <button
                                                                        onClick={() => toggleLocRelocate(loc.id)}
                                                                        className="text-indigo-400 hover:text-indigo-300 text-xs font-semibold flex items-center gap-1"
                                                                    >
                                                                        <Move className="w-3 h-3" />
                                                                        Move
                                                                    </button>
                                                                ) : (
                                                                    <div className="flex items-center gap-2">
                                                                        {pickedCoords && (
                                                                            <span className="text-white text-xs font-mono">
                                                                                {Math.round(pickedCoords.x)}, {Math.round(pickedCoords.y)}
                                                                            </span>
                                                                        )}
                                                                        <button
                                                                            onClick={() => applyNewLocPos(loc.id)}
                                                                            disabled={!pickedCoords}
                                                                            className="text-emerald-400 hover:text-emerald-300 disabled:text-gray-600 text-xs font-semibold"
                                                                        >
                                                                            <Check className="w-3 h-3" />
                                                                        </button>
                                                                        <button
                                                                            onClick={() => toggleLocRelocate(loc.id)}
                                                                            className="text-gray-400 hover:text-gray-300 text-xs font-semibold"
                                                                        >
                                                                            <X className="w-3 h-3" />
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Save Button */}
                                            <button
                                                onClick={() => handleSaveRegion(editingRegion)}
                                                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2 mt-4"
                                            >
                                                <Check className="w-4 h-4" />
                                                Apply Changes
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {activeTab === 'settings' && (
                    <div className="space-y-4">
                        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                            <h3 className="text-white font-semibold text-sm mb-3">Global Settings</h3>
                            <div>
                                <label className="text-gray-400 text-xs font-semibold block mb-2">
                                    Multiverse Background URL
                                </label>
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-20 h-20 rounded-lg bg-cover bg-center border border-gray-600 flex-shrink-0"
                                        style={{ backgroundImage: `url(${config.multiverseBackgroundUrl})` }}
                                        title="Preview"
                                    />
                                    <div className="flex-1 space-y-2">
                                        <input
                                            type="text"
                                            value={config.multiverseBackgroundUrl}
                                            onChange={(e) => {
                                                onConfigUpdate({ ...config, multiverseBackgroundUrl: e.target.value });
                                            }}
                                            placeholder="/images/multiversal-bg.png or https://..."
                                            className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
                                        />
                                        <p className="text-gray-500 text-xs italic">
                                            💡 Use /images/filename.png for local files or paste an external URL
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                </div>
        </div>
    );
}
