import { motion } from 'framer-motion';
import type { IndexEntry } from '@/data/characterData';
import styles from './CharacterSelector.module.css';

interface CharacterDisplayProps {
  character: IndexEntry | null;
}

export function CharacterDisplay({ character }: CharacterDisplayProps) {
  if (!character) {
    return (
      <div className={styles.displayContainer}>
        <div className={styles.displayPlaceholder}>
          <span className={styles.placeholderIcon}>👤</span>
          <p className={styles.placeholderText}>Select a character to view</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className={styles.displayContainer}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      key={character.id}
    >
      {character.displayImageUrl ? (
        <motion.img
          src={character.displayImageUrl}
          alt={character.name}
          className={styles.displayImage}
          loading="eager"
          decoding="async"
          fetchPriority="high"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        />
      ) : (
        <div className={styles.displayPlaceholder}>
          <span className={styles.placeholderIcon}>🖼️</span>
          <p className={styles.placeholderText}>
            No display image available
          </p>
          <p className={styles.placeholderHint}>
            Add one in the admin panel
          </p>
        </div>
      )}
    </motion.div>
  );
}
