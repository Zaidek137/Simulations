import { useState, useEffect } from 'react';
import styles from './CodexAdmin.module.css';
import type { CodexEntry, CodexEntryType, Region } from '@/data/codex-types';
import { fetchCodexEntries, upsertCodexEntry, deleteCodexEntry } from '@/lib/supabase';
import { 
  Book, Plus, Trash2, Save, X, Users, Building2, Cpu, Gem, Zap, 
  Lock, Unlock, Eye, EyeOff 
} from 'lucide-react';

interface CodexAdminProps {
  universeData?: Region[];
}

const CATEGORY_ICONS = {
  character: Users,
  faction: Building2,
  simulation: Cpu,
  artifact: Gem,
  event: Zap,
};

const CATEGORY_LABELS = {
  character: 'Character',
  faction: 'Faction',
  simulation: 'Simulation',
  artifact: 'Artifact',
  event: 'Event',
};

export default function CodexAdmin({ universeData = [] }: CodexAdminProps) {
  const [allEntries, setAllEntries] = useState<CodexEntry[]>([]);
  const [editingEntry, setEditingEntry] = useState<CodexEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadEntries();
  }, []);

  async function loadEntries() {
    setIsLoading(true);
    try {
      const entries = await fetchCodexEntries();
      setAllEntries(entries);
    } catch (error) {
      console.error('Error loading codex entries:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const handleAddNew = () => {
    const newEntry: CodexEntry = {
      id: '',
      entry_id: `entry-${Date.now()}`,
      entry_type: 'character',
      name: 'New Entry',
      summary: '',
      known_info: [],
      locked_sections: [],
      color: '#6366f1',
      appears_in_locations: [],
      is_unlocked: true,
      is_active: true,
      sort_order: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setEditingEntry(newEntry);
    setIsAddingNew(true);
  };

  const handleSave = async () => {
    if (!editingEntry) return;

    try {
      console.log('💾 Saving codex entry:', editingEntry.name);
      const savedId = await upsertCodexEntry({
        entry_id: editingEntry.entry_id,
        entry_type: editingEntry.entry_type,
        name: editingEntry.name,
        subtitle: editingEntry.subtitle,
        summary: editingEntry.summary,
        known_info: editingEntry.known_info,
        locked_sections: editingEntry.locked_sections,
        icon_url: editingEntry.icon_url,
        image_url: editingEntry.image_url,
        color: editingEntry.color,
        primary_location_id: editingEntry.primary_location_id,
        appears_in_locations: editingEntry.appears_in_locations,
        is_unlocked: editingEntry.is_unlocked,
        unlock_condition: editingEntry.unlock_condition,
        sort_order: editingEntry.sort_order || 0,
      });
      console.log('✅ Codex entry saved with ID:', savedId);
      await loadEntries();
      setEditingEntry(null);
      setIsAddingNew(false);
      alert('✅ Codex entry saved successfully!');
    } catch (error: any) {
      console.error('❌ Error saving codex entry:', error);
      alert(`❌ Failed to save codex entry:\n\n${error.message || 'Unknown error'}`);
    }
  };

  const handleDelete = async (entryId: string) => {
    if (!confirm('Delete this codex entry? This cannot be undone!')) return;

    try {
      console.log('🗑️ Deleting codex entry:', entryId);
      await deleteCodexEntry(entryId);
      await loadEntries();
      if (editingEntry?.entry_id === entryId) {
        setEditingEntry(null);
      }
      alert('✅ Codex entry deleted successfully!');
    } catch (error: any) {
      console.error('❌ Error deleting codex entry:', error);
      alert(`❌ Failed to delete codex entry:\n\n${error.message || 'Unknown error'}`);
    }
  };

  const addKnownInfo = () => {
    if (!editingEntry) return;
    setEditingEntry({
      ...editingEntry,
      known_info: [...editingEntry.known_info, { title: 'New Info', content: '' }],
    });
  };

  const removeKnownInfo = (index: number) => {
    if (!editingEntry) return;
    setEditingEntry({
      ...editingEntry,
      known_info: editingEntry.known_info.filter((_, i) => i !== index),
    });
  };

  const updateKnownInfo = (index: number, field: 'title' | 'content', value: string) => {
    if (!editingEntry) return;
    const updated = [...editingEntry.known_info];
    updated[index] = { ...updated[index], [field]: value };
    setEditingEntry({ ...editingEntry, known_info: updated });
  };

  const addLockedSection = () => {
    if (!editingEntry) return;
    setEditingEntry({
      ...editingEntry,
      locked_sections: [...editingEntry.locked_sections, { title: 'Classified', message: 'Data Incomplete' }],
    });
  };

  const removeLockedSection = (index: number) => {
    if (!editingEntry) return;
    setEditingEntry({
      ...editingEntry,
      locked_sections: editingEntry.locked_sections.filter((_, i) => i !== index),
    });
  };

  const updateLockedSection = (index: number, field: 'title' | 'message', value: string) => {
    if (!editingEntry) return;
    const updated = [...editingEntry.locked_sections];
    updated[index] = { ...updated[index], [field]: value };
    setEditingEntry({ ...editingEntry, locked_sections: updated });
  };

  const toggleLocation = (locationId: string) => {
    if (!editingEntry) return;
    const locations = editingEntry.appears_in_locations || [];
    if (locations.includes(locationId)) {
      setEditingEntry({
        ...editingEntry,
        appears_in_locations: locations.filter(id => id !== locationId),
      });
    } else {
      setEditingEntry({
        ...editingEntry,
        appears_in_locations: [...locations, locationId],
      });
    }
  };

  // Group entries by type
  const entriesByType = allEntries.reduce((acc, entry) => {
    if (!acc[entry.entry_type]) {
      acc[entry.entry_type] = [];
    }
    acc[entry.entry_type].push(entry);
    return acc;
  }, {} as Record<CodexEntryType, CodexEntry[]>);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <Book className="w-6 h-6 text-indigo-400" />
          <h2 className={styles.title}>Codex Admin</h2>
        </div>
        <button onClick={handleAddNew} className={styles.addButton}>
          <Plus className="w-5 h-5" />
          Add New Entry
        </button>
      </div>

      <div className={styles.content}>
        {isLoading ? (
          <div className={styles.loading}>
            <div className={styles.spinner} />
            <p>Loading codex entries...</p>
          </div>
        ) : editingEntry ? (
          <EditorPanel
            entry={editingEntry}
            onChange={setEditingEntry}
            onSave={handleSave}
            onCancel={() => {
              setEditingEntry(null);
              setIsAddingNew(false);
            }}
            universeData={universeData}
            addKnownInfo={addKnownInfo}
            removeKnownInfo={removeKnownInfo}
            updateKnownInfo={updateKnownInfo}
            addLockedSection={addLockedSection}
            removeLockedSection={removeLockedSection}
            updateLockedSection={updateLockedSection}
            toggleLocation={toggleLocation}
          />
        ) : (
          <EntriesList
            entriesByType={entriesByType}
            onEdit={setEditingEntry}
            onDelete={handleDelete}
            expandedEntry={expandedEntry}
            setExpandedEntry={setExpandedEntry}
          />
        )}
      </div>
    </div>
  );
}

function EntriesList({
  entriesByType,
  onEdit,
  onDelete,
  expandedEntry,
  setExpandedEntry,
}: {
  entriesByType: Record<CodexEntryType, CodexEntry[]>;
  onEdit: (entry: CodexEntry) => void;
  onDelete: (entryId: string) => void;
  expandedEntry: string | null;
  setExpandedEntry: (id: string | null) => void;
}) {
  return (
    <div className={styles.entriesList}>
      {Object.entries(CATEGORY_ICONS).map(([type, Icon]) => {
        const entries = entriesByType[type as CodexEntryType] || [];
        if (entries.length === 0) return null;

        return (
          <div key={type} className={styles.categorySection}>
            <div className={styles.categoryHeader}>
              <Icon className="w-5 h-5 text-indigo-400" />
              <h3>{CATEGORY_LABELS[type as CodexEntryType]}s</h3>
              <span className={styles.badge}>{entries.length}</span>
            </div>

            <div className={styles.entriesGrid}>
              {entries.map(entry => (
                <div key={entry.entry_id} className={styles.entryCard}>
                  <div className={styles.entryHeader}>
                    <div>
                      <h4 className={styles.entryName}>{entry.name}</h4>
                      {entry.subtitle && (
                        <p className={styles.entrySubtitle}>{entry.subtitle}</p>
                      )}
                    </div>
                    <div className={styles.entryActions}>
                      <button
                        onClick={() => onEdit(entry)}
                        className={styles.editButton}
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => onDelete(entry.entry_id)}
                        className={styles.deleteButton}
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className={styles.entrySummary}>{entry.summary}</p>
                  <div className={styles.entryFooter}>
                    <span className={styles.statusBadge}>
                      {entry.is_unlocked ? (
                        <><Unlock className="w-3 h-3" /> Unlocked</>
                      ) : (
                        <><Lock className="w-3 h-3" /> Locked</>
                      )}
                    </span>
                    <span className={styles.statusBadge}>
                      {entry.is_active ? (
                        <><Eye className="w-3 h-3" /> Active</>
                      ) : (
                        <><EyeOff className="w-3 h-3" /> Hidden</>
                      )}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function EditorPanel({
  entry,
  onChange,
  onSave,
  onCancel,
  universeData,
  addKnownInfo,
  removeKnownInfo,
  updateKnownInfo,
  addLockedSection,
  removeLockedSection,
  updateLockedSection,
  toggleLocation,
}: {
  entry: CodexEntry;
  onChange: (entry: CodexEntry) => void;
  onSave: () => void;
  onCancel: () => void;
  universeData: Region[];
  addKnownInfo: () => void;
  removeKnownInfo: (index: number) => void;
  updateKnownInfo: (index: number, field: 'title' | 'content', value: string) => void;
  addLockedSection: () => void;
  removeLockedSection: (index: number) => void;
  updateLockedSection: (index: number, field: 'title' | 'message', value: string) => void;
  toggleLocation: (locationId: string) => void;
}) {
  const Icon = CATEGORY_ICONS[entry.entry_type];

  return (
    <div className={styles.editor}>
      <div className={styles.editorHeader}>
        <div className={styles.editorTitle}>
          <Icon className="w-6 h-6 text-indigo-400" />
          <h3>{entry.id ? 'Edit Entry' : 'New Entry'}</h3>
        </div>
        <div className={styles.editorActions}>
          <button onClick={onCancel} className={styles.cancelButton}>
            <X className="w-5 h-5" />
            Cancel
          </button>
          <button onClick={onSave} className={styles.saveButton}>
            <Save className="w-5 h-5" />
            Save
          </button>
        </div>
      </div>

      <div className={styles.editorContent}>
        {/* Basic Info */}
        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>Basic Information</h4>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label>Type</label>
              <select
                value={entry.entry_type}
                onChange={(e) => onChange({ ...entry, entry_type: e.target.value as CodexEntryType })}
                className={styles.select}
              >
                {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>Color</label>
              <input
                type="color"
                value={entry.color}
                onChange={(e) => onChange({ ...entry, color: e.target.value })}
                className={styles.colorInput}
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Name</label>
            <input
              type="text"
              value={entry.name}
              onChange={(e) => onChange({ ...entry, name: e.target.value })}
              className={styles.input}
              placeholder="Entry name..."
            />
          </div>

          <div className={styles.formGroup}>
            <label>Subtitle (optional)</label>
            <input
              type="text"
              value={entry.subtitle || ''}
              onChange={(e) => onChange({ ...entry, subtitle: e.target.value })}
              className={styles.input}
              placeholder="A short tagline..."
            />
          </div>

          <div className={styles.formGroup}>
            <label>Summary</label>
            <textarea
              value={entry.summary}
              onChange={(e) => onChange({ ...entry, summary: e.target.value })}
              className={styles.textarea}
              rows={3}
              placeholder="A brief summary..."
            />
          </div>
        </div>

        {/* Known Info */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h4 className={styles.sectionTitle}>Known Information</h4>
            <button onClick={addKnownInfo} className={styles.addSectionButton}>
              <Plus className="w-4 h-4" />
              Add Info
            </button>
          </div>
          {entry.known_info.map((info, index) => (
            <div key={index} className={styles.infoBlock}>
              <div className={styles.blockHeader}>
                <input
                  type="text"
                  value={info.title}
                  onChange={(e) => updateKnownInfo(index, 'title', e.target.value)}
                  className={styles.input}
                  placeholder="Info title..."
                />
                <button
                  onClick={() => removeKnownInfo(index)}
                  className={styles.removeButton}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <textarea
                value={info.content}
                onChange={(e) => updateKnownInfo(index, 'content', e.target.value)}
                className={styles.textarea}
                rows={4}
                placeholder="Information content..."
              />
            </div>
          ))}
        </div>

        {/* Locked Sections */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h4 className={styles.sectionTitle}>Locked Sections</h4>
            <button onClick={addLockedSection} className={styles.addSectionButton}>
              <Plus className="w-4 h-4" />
              Add Locked
            </button>
          </div>
          {entry.locked_sections.map((locked, index) => (
            <div key={index} className={styles.lockedBlock}>
              <div className={styles.blockHeader}>
                <input
                  type="text"
                  value={locked.title}
                  onChange={(e) => updateLockedSection(index, 'title', e.target.value)}
                  className={styles.input}
                  placeholder="Locked section title..."
                />
                <button
                  onClick={() => removeLockedSection(index)}
                  className={styles.removeButton}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <input
                type="text"
                value={locked.message || ''}
                onChange={(e) => updateLockedSection(index, 'message', e.target.value)}
                className={styles.input}
                placeholder="Lock message (e.g., 'Data Incomplete')..."
              />
            </div>
          ))}
        </div>

        {/* Map Locations */}
        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>Map Locations</h4>
          <p className={styles.helpText}>Select locations where this entry appears</p>
          <div className={styles.locationsList}>
            {universeData.map(universe =>
              universe.locations.map(location => {
                const isSelected = entry.appears_in_locations?.includes(location.id);
                return (
                  <button
                    key={location.id}
                    onClick={() => toggleLocation(location.id)}
                    className={`${styles.locationButton} ${isSelected ? styles.locationSelected : ''}`}
                  >
                    <div className={styles.locationInfo}>
                      <span className={styles.locationName}>{location.name}</span>
                      <span className={styles.universeName}>in {universe.name}</span>
                    </div>
                    {isSelected && <span className={styles.checkmark}>✓</span>}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Status */}
        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>Status</h4>
          <div className={styles.toggleGroup}>
            <label className={styles.toggle}>
              <input
                type="checkbox"
                checked={entry.is_unlocked}
                onChange={(e) => onChange({ ...entry, is_unlocked: e.target.checked })}
              />
              <span>Unlocked (visible to players)</span>
            </label>
            <label className={styles.toggle}>
              <input
                type="checkbox"
                checked={entry.is_active}
                onChange={(e) => onChange({ ...entry, is_active: e.target.checked })}
              />
              <span>Active (shown in codex)</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

