
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Location } from '@/data/universe-data';
import styles from './LocalPointOverlay.module.css';

interface LocalPointOverlayProps {
    location: Location | null;
    origin: { x: number; y: number } | null;
    regionColor: string;
    onClose: () => void;
}

export default function LocalPointOverlay({ location, origin, regionColor, onClose }: LocalPointOverlayProps) {
    if (!origin) {
        return null;
    }

    return (
        <AnimatePresence>
            {location && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        className={styles.backdrop}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />

                    {/* Expanding Overlay */}
                    <motion.div
                        className={styles.overlay}
                        style={{
                            '--origin-x': `${origin.x}px`,
                            '--origin-y': `${origin.y}px`,
                            '--accent-color': regionColor,
                        } as React.CSSProperties}
                        initial={{
                            opacity: 0,
                            scale: 0.1,
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
                            scale: 0.1,
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
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>

                        <div className={styles.content}>
                            <div className={styles.imageContainer}>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={location.thumbUrl}
                                    alt={location.name}
                                    className={styles.image}
                                />
                            </div>

                            <h2 className={styles.title}>{location.name}</h2>
                            <p className={styles.description}>{location.description}</p>

                            <div className={styles.metaSection}>
                                <div className={styles.metaItem}>
                                    <span>Point ID</span>
                                    <span className={styles.metaValue}>{location.id.toUpperCase()}</span>
                                </div>
                                <div className={styles.metaItem}>
                                    <span>Type</span>
                                    <span className={styles.metaValue}>{location.type.toUpperCase()}</span>
                                </div>
                                <div className={styles.metaItem}>
                                    <span>Coordinates</span>
                                    <span className={styles.metaValue}>{location.cx}, {location.cy}</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
