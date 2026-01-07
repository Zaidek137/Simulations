import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import styles from './ContextualCard.module.css';
import type { CodexEntry } from '@/data/codex-types';
import { fetchCodexEntry } from '@/lib/supabase';

interface ContextualCardProps {
  entryId: string;
  triggerElement: HTMLElement | null;
  onViewFull: () => void;
  onClose: () => void;
}

export default function ContextualCard({ entryId, triggerElement, onViewFull, onClose }: ContextualCardProps) {
  const [entry, setEntry] = useState<CodexEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadEntry();
  }, [entryId]);

  useEffect(() => {
    if (triggerElement && cardRef.current) {
      const triggerRect = triggerElement.getBoundingClientRect();
      const cardRect = cardRef.current.getBoundingClientRect();
      
      // Position card to the right of trigger, or left if not enough space
      let left = triggerRect.right + 16;
      if (left + cardRect.width > window.innerWidth) {
        left = triggerRect.left - cardRect.width - 16;
      }
      
      // Center vertically relative to trigger
      let top = triggerRect.top + (triggerRect.height / 2) - (cardRect.height / 2);
      
      // Keep card within viewport
      if (top < 16) top = 16;
      if (top + cardRect.height > window.innerHeight - 16) {
        top = window.innerHeight - cardRect.height - 16;
      }
      
      setPosition({ top, left });
    }
  }, [triggerElement, entry]);

  async function loadEntry() {
    setIsLoading(true);
    try {
      const data = await fetchCodexEntry(entryId);
      setEntry(data);
    } catch (error) {
      console.error('Error loading entry for contextual card:', error);
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <motion.div
        ref={cardRef}
        className={styles.contextualCard}
        style={{ position: 'fixed', top: position.top, left: position.left }}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.15 }}
      >
        <div className={styles.loading}>Loading...</div>
      </motion.div>
    );
  }

  if (!entry) {
    return null;
  }

  return (
    <motion.div
      ref={cardRef}
      className={styles.contextualCard}
      style={{ position: 'fixed', top: position.top, left: position.left }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.15 }}
      onMouseLeave={onClose}
    >
      <div 
        className={styles.cardAccent}
        style={{ background: entry.color }}
      />

      {entry.icon_url && (
        <div 
          className={styles.cardIcon}
          style={{ borderColor: entry.color }}
        >
          <img src={entry.icon_url} alt={entry.name} />
        </div>
      )}

      <div className={styles.cardContent}>
        <h3 className={styles.cardTitle}>{entry.name}</h3>
        {entry.subtitle && (
          <p className={styles.cardSubtitle}>{entry.subtitle}</p>
        )}
        
        <p className={styles.cardSummary}>{entry.summary}</p>

        <div className={styles.cardMeta}>
          <span className={styles.cardType}>
            {entry.entry_type.charAt(0).toUpperCase() + entry.entry_type.slice(1)}
          </span>
          {entry.character_role && (
            <span className={styles.cardRole}>{entry.character_role}</span>
          )}
          {entry.character_status && (
            <span className={`${styles.cardStatus} ${styles[`status${entry.character_status.charAt(0).toUpperCase()}${entry.character_status.slice(1)}`]}`}>
              {entry.character_status}
            </span>
          )}
        </div>

        <button 
          className={styles.viewFullButton}
          onClick={(e) => {
            e.stopPropagation();
            onViewFull();
          }}
        >
          <span>View Full Entry</span>
          <ExternalLink className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}

// Hook to manage contextual card state
export function useContextualCard() {
  const [cardState, setCardState] = useState<{
    entryId: string | null;
    triggerElement: HTMLElement | null;
  }>({ entryId: null, triggerElement: null });
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showCard = (entryId: string, element: HTMLElement) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setCardState({ entryId, triggerElement: element });
    }, 300); // 300ms delay
  };

  const hideCard = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setCardState({ entryId: null, triggerElement: null });
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { cardState, showCard, hideCard };
}

