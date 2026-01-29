import { motion } from 'framer-motion';
import type { IndexEntry } from '@/data/characterData';
import { FACTION_COLORS } from '@/data/characterData';
import styles from './CharacterSelector.module.css';

interface CharacterCardProps {
  character: IndexEntry;
  isSelected: boolean;
  onClick: () => void;
  index: number;
}

// Get faction color for border
const getFactionBorder = (faction: string): string => {
  const colors = FACTION_COLORS[faction] || FACTION_COLORS['Unknown'];
  return `linear-gradient(135deg, ${colors.primary}, ${colors.secondary}, ${colors.primary})`;
};

const getFactionGlow = (faction: string): string => {
  const colors = FACTION_COLORS[faction] || FACTION_COLORS['Unknown'];
  // Convert hex to rgba for glow
  return `0 0 30px ${colors.primary}40`;
};

export function CharacterCard({ character, isSelected, onClick, index }: CharacterCardProps) {
  const factionBorder = getFactionBorder(character.faction);
  const factionGlow = getFactionGlow(character.faction);

  return (
    <motion.div
      className={`${styles.characterCard} ${isSelected ? styles.characterCardSelected : ''}`}
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ 
        scale: 1.03,
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: 0.98 }}
      style={{
        '--tier-glow': factionGlow,
        '--tier-border': factionBorder,
      } as React.CSSProperties}
    >
      {/* Glowing border effect */}
      <div className={styles.cardBorder} />
      
      {/* Card content */}
      <div className={styles.cardInner}>
        {/* Image area - full card */}
        <div className={styles.cardImageArea}>
          {character.cardImageUrl ? (
            <img 
              src={character.cardImageUrl} 
              alt={character.name}
              className={styles.cardImage}
              loading="eager"
              decoding="async"
              draggable={false}
            />
          ) : (
            <div className={styles.cardPlaceholder}>
              <span className={styles.placeholderIcon}>👤</span>
            </div>
          )}
        </div>
        
        {/* Simplified info overlay - name only */}
        <div className={styles.cardInfo}>
          <h3 className={styles.cardName}>{character.name}</h3>
        </div>
      </div>
    </motion.div>
  );
}

export default CharacterCard;
