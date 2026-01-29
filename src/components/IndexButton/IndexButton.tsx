import { useNavigate, useLocation } from 'react-router-dom';
import { Database } from 'lucide-react';
import styles from './IndexButton.module.css';

export default function IndexButton() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Don't show button on the characters page (it has its own back button)
  if (location.pathname === '/characters') {
    return null;
  }

  const handleClick = () => {
    navigate('/characters');
  };

  return (
    <button 
      className={styles.indexButton}
      onClick={handleClick}
      aria-label="Navigate to The Index"
    >
      <Database className={styles.icon} size={20} />
      <span className={styles.text}>THE INDEX</span>
    </button>
  );
}
