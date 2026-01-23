import { Home } from 'lucide-react';
import styles from './HomeRedirect.module.css';

export default function HomeRedirect() {
  return (
    <div className={styles.container}>
      <a 
        href="https://www.scavenjer.com" 
        className={styles.homeButton}
        title="Return to Scavenjer"
      >
        <Home />
        <span>Scavenjer</span>
      </a>
    </div>
  );
}
