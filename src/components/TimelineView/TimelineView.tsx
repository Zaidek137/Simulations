import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, Users, ChevronDown } from 'lucide-react';
import styles from './TimelineView.module.css';
import type { CodexEntry } from '@/data/codex-types';

interface TimelineViewProps {
  events: CodexEntry[];
  onEventClick: (event: CodexEntry) => void;
  onParticipantClick: (entryId: string) => void;
}

interface GroupedEvents {
  [era: string]: CodexEntry[];
}

export default function TimelineView({ events, onEventClick, onParticipantClick }: TimelineViewProps) {
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);

  // Group events by era
  const groupedEvents: GroupedEvents = events.reduce((acc, event) => {
    const era = event.timeline_era || 'Unknown Era';
    if (!acc[era]) {
      acc[era] = [];
    }
    acc[era].push(event);
    return acc;
  }, {} as GroupedEvents);

  // Sort events within each era by date
  Object.keys(groupedEvents).forEach(era => {
    groupedEvents[era].sort((a, b) => {
      if (!a.event_date && !b.event_date) return 0;
      if (!a.event_date) return 1;
      if (!b.event_date) return -1;
      return a.event_date.localeCompare(b.event_date);
    });
  });

  const toggleEventExpand = (eventId: string) => {
    setExpandedEvent(expandedEvent === eventId ? null : eventId);
  };

  if (events.length === 0) {
    return (
      <div className={styles.timelineContainer}>
        <div className={styles.emptyState}>
          <Calendar className="w-12 h-12 opacity-50" />
          <p>No events found</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.timelineContainer}>
      <div className={styles.timelineHeader}>
        <Calendar className="w-6 h-6" />
        <h2>Timeline</h2>
        <span className={styles.eventCount}>{events.length} Events</span>
      </div>

      <div className={styles.timelineContent}>
        {Object.entries(groupedEvents).map(([era, eraEvents]) => (
          <div key={era} className={styles.eraSection}>
            <div className={styles.eraMarker}>
              <div className={styles.eraLine} />
              <div className={styles.eraLabel}>{era}</div>
              <div className={styles.eraLine} />
            </div>

            <div className={styles.eventsGrid}>
              {eraEvents.map((event, index) => {
                const isExpanded = expandedEvent === event.entry_id;

                return (
                  <motion.div
                    key={event.entry_id}
                    className={styles.eventCard}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <button
                      className={styles.eventHeader}
                      onClick={() => toggleEventExpand(event.entry_id)}
                    >
                      <div className={styles.eventMainInfo}>
                        <div
                          className={styles.eventIndicator}
                          style={{ background: event.color }}
                        />
                        <div className={styles.eventTitleSection}>
                          <h3 className={styles.eventName}>{event.name}</h3>
                          {event.event_date && (
                            <span className={styles.eventDate}>{event.event_date}</span>
                          )}
                        </div>
                      </div>
                      <ChevronDown
                        className={`${styles.expandIcon} ${isExpanded ? styles.expandIconOpen : ''}`}
                      />
                    </button>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          className={styles.eventDetails}
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <p className={styles.eventSummary}>{event.summary}</p>

                          {/* Location */}
                          {event.primary_location_id && (
                            <div className={styles.eventMeta}>
                              <MapPin className="w-4 h-4" />
                              <span className={styles.metaLabel}>Location:</span>
                              <span className={styles.metaValue}>{event.primary_location_id}</span>
                            </div>
                          )}

                          {/* Participants */}
                          {event.event_participants && event.event_participants.length > 0 && (
                            <div className={styles.eventMeta}>
                              <Users className="w-4 h-4" />
                              <span className={styles.metaLabel}>Participants:</span>
                              <div className={styles.participantChips}>
                                {event.event_participants.map(participantId => (
                                  <button
                                    key={participantId}
                                    className={styles.participantChip}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onParticipantClick(participantId);
                                    }}
                                  >
                                    {participantId}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Consequences */}
                          {event.event_consequences && event.event_consequences.length > 0 && (
                            <div className={styles.consequencesSection}>
                              <h4 className={styles.consequencesTitle}>Consequences:</h4>
                              <ul className={styles.consequencesList}>
                                {event.event_consequences.map((consequence, idx) => (
                                  <li key={idx} className={styles.consequenceItem}>
                                    {consequence}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          <button
                            className={styles.viewFullButton}
                            onClick={(e) => {
                              e.stopPropagation();
                              onEventClick(event);
                            }}
                          >
                            View Full Entry →
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

