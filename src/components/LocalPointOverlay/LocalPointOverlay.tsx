import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, Users, Calendar, MapPin, AlertTriangle, X } from 'lucide-react';
import { Location } from '@/data/universe-data';
import type { LocationInhabitants, CodexEntry } from '@/data/codex-types';
import { fetchLocationInhabitants, fetchLocationEvents } from '@/lib/supabase';
import styles from './LocalPointOverlay.module.css';

interface LocalPointOverlayProps {
    location: Location | null;
    origin: { x: number; y: number } | null;
    regionColor: string;
    onClose: () => void;
}

type TabType = 'overview' | 'inhabitants' | 'events';

export default function LocalPointOverlay({ location, origin, regionColor, onClose }: LocalPointOverlayProps) {
    const [activeTab, setActiveTab] = useState<TabType>('overview');
    const [inhabitants, setInhabitants] = useState<LocationInhabitants | null>(null);
    const [events, setEvents] = useState<CodexEntry[]>([]);
    const [isLoadingInhabitants, setIsLoadingInhabitants] = useState(false);
    const [isLoadingEvents, setIsLoadingEvents] = useState(false);

    useEffect(() => {
        if (location && activeTab === 'inhabitants' && !inhabitants) {
            loadInhabitants();
        }
    }, [location, activeTab]);

    useEffect(() => {
        if (location && activeTab === 'events' && events.length === 0) {
            loadEvents();
        }
    }, [location, activeTab]);

    async function loadInhabitants() {
        if (!location) return;
        setIsLoadingInhabitants(true);
        try {
            const data = await fetchLocationInhabitants(location.id);
            setInhabitants(data);
        } catch (error) {
            console.error('Error loading inhabitants:', error);
        } finally {
            setIsLoadingInhabitants(false);
        }
    }

    async function loadEvents() {
        if (!location) return;
        setIsLoadingEvents(true);
        try {
            const data = await fetchLocationEvents(location.id);
            setEvents(data);
        } catch (error) {
            console.error('Error loading events:', error);
        } finally {
            setIsLoadingEvents(false);
        }
    }

    if (!origin || !location) {
        return null;
    }

    // Enhanced location data (from DB or default)
    const threatLevel = (location as any).threat_level || 1;
    const population = (location as any).population;
    const atmosphere = (location as any).atmosphere;
    const landmarks = (location as any).key_landmarks || [];
    const resources = (location as any).resources || [];

    return (
        <AnimatePresence>
            <motion.div
                className={styles.backdrop}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            />

            <motion.div
                className={styles.overlay}
                style={{
                    '--accent-color': regionColor,
                } as React.CSSProperties}
                initial={{
                    opacity: 0,
                    scale: 0.9,
                    x: origin.x - window.innerWidth / 2,
                    y: origin.y - window.innerHeight / 2
                }}
                animate={{
                    opacity: 1,
                    scale: 1,
                    x: 0,
                    y: 0
                }}
                exit={{
                    opacity: 0,
                    scale: 0.9,
                    x: origin.x - window.innerWidth / 2,
                    y: origin.y - window.innerHeight / 2
                }}
                transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 25
                }}
            >
                <button onClick={onClose} className={styles.closeButton}>
                    <X className="w-6 h-6" />
                </button>

                {/* Header */}
                <div className={styles.header}>
                    <div className={styles.imageContainer}>
                        <img src={location.thumbUrl} alt={location.name} className={styles.image} />
                    </div>
                    <div className={styles.headerInfo}>
                        <h2 className={styles.title}>{location.name}</h2>
                        <div className={styles.headerMeta}>
                            <span className={styles.typeBadge}>{location.type.toUpperCase()}</span>
                            <span className={`${styles.threatBadge} ${styles[`threat${threatLevel}`]}`}>
                                <AlertTriangle className="w-3 h-3" />
                                Threat {threatLevel}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className={styles.tabNavigation}>
                    <button
                        className={`${styles.tab} ${activeTab === 'overview' ? styles.tabActive : ''}`}
                        onClick={() => setActiveTab('overview')}
                    >
                        <Info className="w-4 h-4" />
                        Overview
                    </button>
                    <button
                        className={`${styles.tab} ${activeTab === 'inhabitants' ? styles.tabActive : ''}`}
                        onClick={() => setActiveTab('inhabitants')}
                    >
                        <Users className="w-4 h-4" />
                        Inhabitants
                    </button>
                    <button
                        className={`${styles.tab} ${activeTab === 'events' ? styles.tabActive : ''}`}
                        onClick={() => setActiveTab('events')}
                    >
                        <Calendar className="w-4 h-4" />
                        Events
                    </button>
                </div>

                {/* Tab Content */}
                <div className={styles.tabContent}>
                    {activeTab === 'overview' && (
                        <div className={styles.overviewTab}>
                            <p className={styles.description}>{location.description}</p>

                            {atmosphere && (
                                <div className={styles.atmosphereSection}>
                                    <h3>Atmosphere</h3>
                                    <p>{atmosphere}</p>
                                </div>
                            )}

                            <div className={styles.statsGrid}>
                                {population && (
                                    <div className={styles.statCard}>
                                        <span className={styles.statLabel}>Population</span>
                                        <span className={styles.statValue}>{population.toLocaleString()}</span>
                                    </div>
                                )}
                                <div className={styles.statCard}>
                                    <span className={styles.statLabel}>Coordinates</span>
                                    <span className={styles.statValue}>{location.cx}, {location.cy}</span>
                                </div>
                                <div className={styles.statCard}>
                                    <span className={styles.statLabel}>Point ID</span>
                                    <span className={styles.statValue}>{location.id.toUpperCase()}</span>
                                </div>
                            </div>

                            {landmarks.length > 0 && (
                                <div className={styles.listSection}>
                                    <h3><MapPin className="w-4 h-4" /> Key Landmarks</h3>
                                    <ul>
                                        {landmarks.map((landmark: string, idx: number) => (
                                            <li key={idx}>{landmark}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {resources.length > 0 && (
                                <div className={styles.listSection}>
                                    <h3>Resources</h3>
                                    <div className={styles.resourceChips}>
                                        {resources.map((resource: string, idx: number) => (
                                            <span key={idx} className={styles.resourceChip}>{resource}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'inhabitants' && (
                        <div className={styles.inhabitantsTab}>
                            {isLoadingInhabitants ? (
                                <div className={styles.loading}>Loading inhabitants...</div>
                            ) : inhabitants ? (
                                <>
                                    {inhabitants.factions.length > 0 && (
                                        <div className={styles.inhabitantSection}>
                                            <h3>Factions Present</h3>
                                            <div className={styles.inhabitantGrid}>
                                                {inhabitants.factions.map((faction) => (
                                                    <div key={faction.entry_id} className={styles.inhabitantCard}>
                                                        <div className={styles.inhabitantHeader}>
                                                            <h4>{faction.name}</h4>
                                                            <span className={`${styles.controlBadge} ${styles[`control${faction.control_level.charAt(0).toUpperCase()}${faction.control_level.slice(1)}`]}`}>
                                                                {faction.control_level}
                                                            </span>
                                                        </div>
                                                        {faction.subtitle && <p className={styles.subtitle}>{faction.subtitle}</p>}
                                                        {faction.description && <p className={styles.cardDescription}>{faction.description}</p>}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {inhabitants.characters.length > 0 && (
                                        <div className={styles.inhabitantSection}>
                                            <h3>Characters</h3>
                                            <div className={styles.inhabitantGrid}>
                                                {inhabitants.characters.map((character) => (
                                                    <div key={character.entry_id} className={styles.inhabitantCard}>
                                                        <div className={styles.inhabitantHeader}>
                                                            <h4>{character.name}</h4>
                                                            {character.stationed && (
                                                                <span className={styles.stationedBadge}>Stationed</span>
                                                            )}
                                                        </div>
                                                        {character.character_role && (
                                                            <p className={styles.role}>{character.character_role}</p>
                                                        )}
                                                        {character.subtitle && <p className={styles.subtitle}>{character.subtitle}</p>}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {inhabitants.artifacts.length > 0 && (
                                        <div className={styles.inhabitantSection}>
                                            <h3>Artifacts Found Here</h3>
                                            <div className={styles.inhabitantGrid}>
                                                {inhabitants.artifacts.map((artifact) => (
                                                    <div key={artifact.entry_id} className={styles.inhabitantCard}>
                                                        <h4>{artifact.name}</h4>
                                                        <p className={styles.cardDescription}>{artifact.summary}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {inhabitants.factions.length === 0 && inhabitants.characters.length === 0 && inhabitants.artifacts.length === 0 && (
                                        <div className={styles.emptyState}>No inhabitants data available</div>
                                    )}
                                </>
                            ) : (
                                <div className={styles.emptyState}>No inhabitants data available</div>
                            )}
                        </div>
                    )}

                    {activeTab === 'events' && (
                        <div className={styles.eventsTab}>
                            {isLoadingEvents ? (
                                <div className={styles.loading}>Loading events...</div>
                            ) : events.length > 0 ? (
                                <div className={styles.eventsList}>
                                    {events.map((event) => (
                                        <div key={event.entry_id} className={styles.eventCard}>
                                            <div className={styles.eventHeader}>
                                                <h4>{event.name}</h4>
                                                {event.event_date && (
                                                    <span className={styles.eventDate}>{event.event_date}</span>
                                                )}
                                            </div>
                                            <p className={styles.eventSummary}>{event.summary}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className={styles.emptyState}>No events recorded at this location</div>
                            )}
                        </div>
                    )}
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
