import { Home, ChevronRight } from 'lucide-react';
import styles from './BreadcrumbNavigation.module.css';
import type { BreadcrumbItem } from '@/data/codex-types';

interface BreadcrumbNavigationProps {
  items: BreadcrumbItem[];
}

export default function BreadcrumbNavigation({ items }: BreadcrumbNavigationProps) {
  if (items.length === 0) return null;

  return (
    <nav className={styles.breadcrumbNav}>
      <button className={styles.breadcrumbItem} onClick={() => items[0]?.onClick()}>
        <Home className="w-4 h-4" />
      </button>

      {items.map((item, index) => (
        <div key={index} className={styles.breadcrumbSegment}>
          <ChevronRight className={`${styles.separator} w-4 h-4`} />
          {index === items.length - 1 ? (
            <span className={`${styles.breadcrumbItem} ${styles.breadcrumbCurrent}`}>
              {item.label}
            </span>
          ) : (
            <button 
              className={styles.breadcrumbItem}
              onClick={item.onClick}
            >
              {item.label}
            </button>
          )}
        </div>
      ))}
    </nav>
  );
}


