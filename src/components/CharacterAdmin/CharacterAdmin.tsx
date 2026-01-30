import { useState, useCallback, useEffect } from 'react';
import { Plus, Trash2, Image } from 'lucide-react';
import { 
  fetchIndexEntries, 
  createIndexEntry, 
  updateIndexEntry, 
  deleteIndexEntry 
} from '@/lib/indexDatabase';
import type { IndexEntry, Simulation, IndexType } from '@/data/characterData';
import { MOCK_INDEX_ENTRIES } from '@/data/characterData';
import styles from './CharacterAdmin.module.css';

const SIMULATIONS: Simulation[] = ['Resonance', 'Prime', 'Veliental Ascendance'];
const INDEX_TYPES: IndexType[] = ['Scavenjers', 'RESONANTS', 'ZIBBots', 'Environments'];

const FACTIONS = [
  'Resonant',
  'Verdant',
  'The Veil',
  'Dryreach',
  'The Underworks',
  'The Apex',
];

// Empty form state
const getEmptyEntry = (): Omit<IndexEntry, 'id'> => ({
  name: '',
  simulation: 'Resonance',
  type: 'Scavenjers',
  faction: 'Resonant',
  description: '',
});

export default function CharacterAdmin() {
  const [indexEntries, setIndexEntries] = useState<IndexEntry[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<IndexEntry, 'id'>>(getEmptyEntry());
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Image URL previews
  const [showCardPreview, setShowCardPreview] = useState(false);
  const [showDisplayPreview, setShowDisplayPreview] = useState(false);

  // Load entries from database on mount
  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    setLoading(true);
    try {
      const entries = await fetchIndexEntries();
      // Fallback to mock data if database is empty
      setIndexEntries(entries.length > 0 ? entries : MOCK_INDEX_ENTRIES);
      console.log(`📊 Loaded ${entries.length} entries from database`);
    } catch (error: any) {
      console.error('❌ Error loading entries:', error);
      
      // Check if it's a table missing error
      if (error.message && error.message.includes('table not created')) {
        alert('⚠️ Database Not Set Up\n\nThe index_entries table has not been created yet.\n\nPlease run the SQL script:\ndatabase/create_index_entries_table.sql\n\nUsing mock data for now.');
      }
      
      // Fallback to mock data on error
      setIndexEntries(MOCK_INDEX_ENTRIES);
    } finally {
      setLoading(false);
    }
  };

  // Load entry data when selection changes
  useEffect(() => {
    if (selectedId) {
      const entry = indexEntries.find(e => e.id === selectedId);
      if (entry) {
        setFormData({
          name: entry.name,
          simulation: entry.simulation,
          type: entry.type,
          faction: entry.faction,
          description: entry.description,
          modelUrl: entry.modelUrl,
          cardImageUrl: entry.cardImageUrl,
          displayImageUrl: entry.displayImageUrl,
        });
        setShowCardPreview(!!entry.cardImageUrl);
        setShowDisplayPreview(!!entry.displayImageUrl);
        setIsNew(false);
      }
    }
  }, [selectedId, indexEntries]);

  const handleAddNew = useCallback(() => {
    setSelectedId(null);
    setFormData(getEmptyEntry());
    setShowCardPreview(false);
    setShowDisplayPreview(false);
    setIsNew(true);
  }, []);

  const handleSelectEntry = useCallback((id: string) => {
    setSelectedId(id);
    setIsNew(false);
  }, []);

  const handleInputChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Update preview visibility when URLs change
    if (name === 'cardImageUrl') {
      setShowCardPreview(!!value);
    } else if (name === 'displayImageUrl') {
      setShowDisplayPreview(!!value);
    }
  }, []);

  // Save entry
  const handleSave = async () => {
    if (!formData.name.trim()) return;
    
    setSaving(true);
    try {
      const entryData: IndexEntry = {
        id: isNew ? `idx-${Date.now()}` : selectedId!,
        ...formData,
      };

      // Save to database
      if (isNew) {
        try {
          const savedEntry = await createIndexEntry(entryData);
          if (savedEntry) {
            setIndexEntries(prev => [...prev, savedEntry]);
            setSelectedId(savedEntry.id);
            setIsNew(false);
            alert('✅ Entry created successfully!');
          }
        } catch (err: any) {
          if (err.message && err.message.includes('table not created')) {
            alert('⚠️ Database Not Set Up\n\nCannot save - table does not exist.\nPlease run: database/create_index_entries_table.sql\n\nThe entry was added locally but will not persist.');
            // Add to local state anyway for temporary use
            setIndexEntries(prev => [...prev, entryData]);
            setSelectedId(entryData.id);
            setIsNew(false);
          } else {
            throw err;
          }
        }
      } else {
        try {
          const updatedEntry = await updateIndexEntry(selectedId!, entryData);
          if (updatedEntry) {
            setIndexEntries(prev => prev.map(e => e.id === selectedId ? updatedEntry : e));
            alert('✅ Entry updated successfully!');
          }
        } catch (err: any) {
          if (err.message && err.message.includes('table not created')) {
            alert('⚠️ Database Not Set Up\n\nCannot save - table does not exist.\nPlease run: database/create_index_entries_table.sql\n\nThe entry was updated locally but will not persist.');
            // Update local state anyway for temporary use
            setIndexEntries(prev => prev.map(e => e.id === selectedId ? entryData : e));
          } else {
            throw err;
          }
        }
      }

    } catch (error) {
      console.error('Error saving entry:', error);
      alert('Error saving entry: ' + (error as Error).message);
    } finally {
      setSaving(false);
    }
  };

  // Delete entry
  const handleDelete = useCallback(async () => {
    if (!selectedId) return;
    if (!confirm('Are you sure you want to delete this entry? This action cannot be undone.')) return;
    
    try {
      const success = await deleteIndexEntry(selectedId);
      if (success) {
        setIndexEntries(prev => prev.filter(e => e.id !== selectedId));
        setSelectedId(null);
        setFormData(getEmptyEntry());
        setIsNew(false);
        alert('✅ Entry deleted successfully!');
      }
    } catch (error: any) {
      console.error('❌ Error deleting entry:', error);
      if (error.message && error.message.includes('table not created')) {
        alert('⚠️ Database Not Set Up\n\nCannot delete - table does not exist.\nPlease run: database/create_index_entries_table.sql\n\nThe entry was removed locally but will not persist.');
        // Delete from local state anyway for temporary use
        setIndexEntries(prev => prev.filter(e => e.id !== selectedId));
        setSelectedId(null);
        setFormData(getEmptyEntry());
        setIsNew(false);
      } else {
        alert('❌ Error deleting entry: ' + (error as Error).message);
      }
    }
  }, [selectedId]);

  const selectedEntry = selectedId ? indexEntries.find(e => e.id === selectedId) : null;
  const showForm = isNew || selectedEntry;

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingState}>
          <p>Loading index entries from database...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Left Panel - Index List */}
      <div className={styles.listPanel}>
        <div className={styles.listHeader}>
          <h2 className={styles.listTitle}>The Index ({indexEntries.length})</h2>
          <button className={styles.addButton} onClick={handleAddNew}>
            <Plus size={14} />
            Add New
          </button>
        </div>
        
        <div className={styles.characterList}>
          {indexEntries.map(entry => (
            <div
              key={entry.id}
              className={`${styles.characterItem} ${selectedId === entry.id ? styles.characterItemActive : ''}`}
              onClick={() => handleSelectEntry(entry.id)}
            >
              <div className={styles.characterThumb}>
                {entry.cardImageUrl ? (
                  <img src={entry.cardImageUrl} alt={entry.name} />
                ) : (
                  '👤'
                )}
              </div>
              <div className={styles.characterInfo}>
                <div className={styles.characterName}>{entry.name}</div>
                <div className={styles.characterMeta}>
                  <span className={styles.factionTag}>{entry.type} • {entry.faction}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel - Edit Form */}
      <div className={styles.editPanel}>
        {showForm ? (
          <>
            <div className={styles.editHeader}>
              <h2 className={styles.editTitle}>
                {isNew ? 'New Character' : `Edit: ${formData.name || 'Unnamed'}`}
              </h2>
              <div className={styles.editActions}>
                {!isNew && (
                  <button className={styles.deleteButton} onClick={handleDelete}>
                    <Trash2 size={14} />
                    Delete
                  </button>
                )}
                <button 
                  className={styles.saveButton} 
                  onClick={handleSave}
                  disabled={saving || !formData.name.trim()}
                >
                  {saving ? 'Saving...' : 'Save Character'}
                </button>
              </div>
            </div>

            <div className={styles.editContent}>
              <div className={styles.formGrid}>
                {/* Name */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={styles.formInput}
                    placeholder="Entry name"
                  />
                </div>

                {/* Simulation */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Simulation</label>
                  <select
                    name="simulation"
                    value={formData.simulation}
                    onChange={handleInputChange}
                    className={styles.formSelect}
                  >
                    {SIMULATIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                {/* Type */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Type</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className={styles.formSelect}
                  >
                    {INDEX_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                {/* Faction */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Faction</label>
                  <select
                    name="faction"
                    value={formData.faction}
                    onChange={handleInputChange}
                    className={styles.formSelect}
                  >
                    {FACTIONS.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>

                {/* Description */}
                <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                  <label className={styles.formLabel}>Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className={styles.formTextarea}
                    placeholder="Entry description..."
                  />
                </div>

                {/* RESONANTS-specific fields */}
                {formData.type === 'RESONANTS' && (
                  <>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>
                        Genres (comma-separated)
                      </label>
                      <input
                        type="text"
                        name="genres"
                        value={formData.genres?.join(', ') || ''}
                        onChange={(e) => {
                          const genresArray = e.target.value
                            .split(',')
                            .map(g => g.trim())
                            .filter(g => g);
                          setFormData(prev => ({ ...prev, genres: genresArray }));
                        }}
                        className={styles.formInput}
                        placeholder="e.g., Synthwave, Electronic, Ambient"
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Energy</label>
                      <select
                        name="energy"
                        value={formData.energy || ''}
                        onChange={handleInputChange}
                        className={styles.formSelect}
                      >
                        <option value="">Select energy level...</option>
                        <option value="Calm">Calm</option>
                        <option value="Chill">Chill</option>
                        <option value="Energetic">Energetic</option>
                        <option value="Intense">Intense</option>
                        <option value="Dark">Dark</option>
                        <option value="Uplifting">Uplifting</option>
                      </select>
                    </div>
                  </>
                )}
              </div>

              {/* Image URLs */}
              <div className={styles.uploadSection}>
                <h3 className={styles.uploadTitle}>
                  <Image size={16} />
                  Media Assets (URLs)
                </h3>
                
                <div className={styles.uploadGrid}>
                  {/* Card Image URL */}
                  <div>
                    <label className={styles.formLabel}>Card Image URL</label>
                    <input
                      type="text"
                      name="cardImageUrl"
                      value={formData.cardImageUrl || ''}
                      onChange={handleInputChange}
                      className={styles.formInput}
                      placeholder="https://example.com/card-image.png"
                    />
                    {showCardPreview && formData.cardImageUrl && (
                      <div className={styles.imagePreview}>
                        <img 
                          src={formData.cardImageUrl} 
                          alt="Card preview" 
                          onError={() => setShowCardPreview(false)}
                        />
                      </div>
                    )}
                  </div>

                  {/* Display Image URL */}
                  <div>
                    <label className={styles.formLabel}>Display Image URL (2D Character)</label>
                    <input
                      type="text"
                      name="displayImageUrl"
                      value={formData.displayImageUrl || ''}
                      onChange={handleInputChange}
                      className={styles.formInput}
                      placeholder="https://example.com/display-image.png"
                    />
                    {showDisplayPreview && formData.displayImageUrl && (
                      <div className={styles.imagePreview}>
                        <img 
                          src={formData.displayImageUrl} 
                          alt="Display preview" 
                          onError={() => setShowDisplayPreview(false)}
                        />
                      </div>
                    )}
                  </div>

                  {/* 3D Model URL (Deprecated) */}
                  <div>
                    <label className={styles.formLabel}>3D Model URL (Deprecated)</label>
                    <input
                      type="text"
                      name="modelUrl"
                      value={formData.modelUrl || ''}
                      onChange={handleInputChange}
                      className={styles.formInput}
                      placeholder="https://example.com/model.glb (optional)"
                      disabled
                    />
                    <div className={styles.uploadHint}>
                      3D models are deprecated - use 2D display images instead
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>👤</div>
            <div className={styles.emptyText}>No Character Selected</div>
            <div className={styles.emptyHint}>Select a character from the list or create a new one</div>
          </div>
        )}
      </div>
    </div>
  );
}
