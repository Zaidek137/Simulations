import { motion, AnimatePresence } from 'framer-motion';
import { Region } from '@/data/universe-data';
import styles from './DetailOverlay.module.css';

interface DetailOverlayProps {
    region: Region | null;
    onClose: () => void;
}

export default function DetailOverlay({ region, onClose }: DetailOverlayProps) {
    return (
        <AnimatePresence>
            {region && (
                <motion.div
                    className={styles.overlay}
                    initial={{ x: "100%" }}
                    animate={{ x: 0 }}
                    exit={{ x: "100%" }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                    <button onClick={onClose} className={styles.closeButton}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>

                    <div className={styles.imageContainer}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={region.imageUrl}
                            alt={region.name}
                            className={styles.image}
                        />
                    </div>

                    <h2 className={styles.title}>{region.name}</h2>
                    <p className={styles.description}>{region.description}</p>

                    <div className={styles.metaSection}>
                        <div className={styles.metaItem}>
                            <span>Sector ID</span>
                            <span className={styles.metaValue}>{region.id.toUpperCase()}</span>
                        </div>
                        <div className={styles.metaItem}>
                            <span>Spatial Coords</span>
                            <span className={styles.metaValue}>{region.cx}, {region.cy}</span>
                        </div>
                        <div className={styles.metaItem}>
                            <span>Stability Index</span>
                            <span className={styles.metaValue}>98.4%</span>
                        </div>
                        <div className={styles.metaItem}>
                            <span>Primary Resource</span>
                            <span className={styles.metaValue}>Dark Matter</span>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
