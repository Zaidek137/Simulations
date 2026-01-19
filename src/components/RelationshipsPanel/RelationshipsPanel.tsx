import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, ChevronDown, Star } from 'lucide-react';
import styles from './RelationshipsPanel.module.css';
import type { RelatedEntry } from '@/data/codex-types';
import { fetchEntryRelationships } from '@/lib/supabase';

interface RelationshipsPanelProps {
  entryId: string;
  onEntryClick: (entryId: string) => void;
}

interface GroupedRelationships {
  [key: string]: RelatedEntry[];
}

const RELATIONSHIP_LABELS: Record<string, string> = {
  ally: 'Allies',
  enemy: 'Enemies',
  family: 'Family',
  colleague: 'Colleagues',
  member_of: 'Member Of',
  created_by: 'Created By',
  participant_in: 'Participant In',
  linked_to: 'Linked To',
};

const RELATIONSHIP_ICONS: Record<string, string> = {
  ally: '🤝',
  enemy: '⚔️',
  family: '👨‍👩‍👧‍👦',
  colleague: '💼',
  member_of: '🏢',
  created_by: '🔨',
  participant_in: '⚡',
  linked_to: '🔗',
};

export default function RelationshipsPanel({ entryId, onEntryClick }: RelationshipsPanelProps) {
  const [relationships, setRelationships] = useState<RelatedEntry[]>([]);
  const [groupedRelationships, setGroupedRelationships] = useState<GroupedRelationships>({});
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['ally', 'enemy', 'family']));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRelationships();
  }, [entryId]);

  async function loadRelationships() {
    setIsLoading(true);
    try {
      const data = await fetchEntryRelationships(entryId);
      setRelationships(data);

      // Group by relationship type
      const grouped = data.reduce((acc: GroupedRelationships, rel: RelatedEntry) => {
        const type = rel.relationship_type;
        if (!acc[type]) {
          acc[type] = [];
        }
        acc[type].push(rel);
        return acc;
      }, {});

      setGroupedRelationships(grouped);
    } catch (error) {
      console.error('Error loading relationships:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const toggleGroup = (groupKey: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupKey)) {
      newExpanded.delete(groupKey);
    } else {
      newExpanded.add(groupKey);
    }
    setExpandedGroups(newExpanded);
  };

  const renderStrength = (strength: number) => {
    const stars = Math.min(Math.max(Math.round(strength / 2), 1), 5);
    return (
      <div className={styles.strengthIndicator}>
        {Array.from({ length: stars }).map((_, i) => (
          <Star key={i} className="w-3 h-3" fill="currentColor" />
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className={styles.relationshipsPanel}>
        <div className={styles.panelHeader}>
          <Users className="w-5 h-5" />
          <h3>Connections</h3>
        </div>
        <div className={styles.loading}>Loading...</div>
      </div>
    );
  }

  if (relationships.length === 0) {
    return (
      <div className={styles.relationshipsPanel}>
        <div className={styles.panelHeader}>
          <Users className="w-5 h-5" />
          <h3>Connections</h3>
        </div>
        <div className={styles.emptyState}>
          <p>No connections found</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.relationshipsPanel}>
      <div className={styles.panelHeader}>
        <Users className="w-5 h-5" />
        <h3>Connections</h3>
        <span className={styles.totalCount}>{relationships.length}</span>
      </div>

      <div className={styles.groupsContainer}>
        {Object.entries(groupedRelationships).map(([type, entries]) => {
          const isExpanded = expandedGroups.has(type);
          const label = RELATIONSHIP_LABELS[type] || type;
          const icon = RELATIONSHIP_ICONS[type] || '🔗';

          return (
            <div key={type} className={styles.relationshipGroup}>
              <button
                className={styles.groupHeader}
                onClick={() => toggleGroup(type)}
              >
                <span className={styles.groupIcon}>{icon}</span>
                <span className={styles.groupLabel}>{label}</span>
                <span className={styles.groupCount}>{entries.length}</span>
                <ChevronDown
                  className={`${styles.groupChevron} ${isExpanded ? styles.groupChevronOpen : ''}`}
                />
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    className={styles.groupContent}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {entries.map((rel) => (
                      <motion.button
                        key={rel.entry_id}
                        className={styles.relationshipCard}
                        onClick={() => onEntryClick(rel.entry_id)}
                        whileHover={{ x: 4 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className={styles.cardHeader}>
                          {rel.icon_url && (
                            <div 
                              className={styles.cardIcon}
                              style={{ borderColor: rel.color }}
                            >
                              <img src={rel.icon_url} alt={rel.name} />
                            </div>
                          )}
                          <div className={styles.cardInfo}>
                            <h4 className={styles.cardName}>{rel.name}</h4>
                            {rel.subtitle && (
                              <p className={styles.cardSubtitle}>{rel.subtitle}</p>
                            )}
                          </div>
                        </div>
                        {renderStrength(rel.relationship_strength)}
                        {rel.description && (
                          <p className={styles.cardDescription}>{rel.description}</p>
                        )}
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}


