import { Home } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import styles from './HomeRedirect.module.css';

export default function HomeRedirect() {
  const location = useLocation();
  
  // On The Index page (/characters), redirect to Simulations home
  // On other pages, redirect to Scavenjer site
  const isOnIndexPage = location.pathname === '/characters';
  
  const href = isOnIndexPage ? '/' : 'https://www.scavenjer.com';
  const label = isOnIndexPage ? 'Simulations' : 'Scavenjer';
  const title = isOnIndexPage ? 'Back to Simulations' : 'Return to Scavenjer';
  
  return (
    <div className={styles.container}>
      <a 
        href={href} 
        className={styles.homeButton}
        title={title}
      >
        <Home />
        <span>{label}</span>
      </a>
    </div>
  );
}
