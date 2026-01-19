import { useState, useRef, useEffect } from 'react';
import { useActiveAccount, useActiveWallet, useDisconnect } from 'thirdweb/react';
import { User, LogOut, ChevronDown, ExternalLink } from 'lucide-react';
import styles from './WalletDropdown.module.css';

export default function WalletDropdown() {
  const account = useActiveAccount();
  const wallet = useActiveWallet();
  const { disconnect } = useDisconnect();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close dropdown when account changes (disconnect/reconnect)
  useEffect(() => {
    setIsOpen(false);
  }, [account?.address]);

  const handleDisconnect = async () => {
    try {
      if (wallet) {
        await disconnect(wallet);
      }
      setIsOpen(false);
    } catch (error) {
      console.error('Error disconnecting:', error);
      setIsOpen(false);
    }
  };

  const handleProfileClick = () => {
    // Open scavenjer.com profile page in new tab
    window.open('https://scavenjer.com/profile', '_blank');
    setIsOpen(false);
  };

  if (!account) return null;

  const truncatedAddress = `${account.address?.slice(0, 6)}...${account.address?.slice(-4)}`;

  return (
    <div className={styles.container} ref={dropdownRef}>
      {/* Dropdown Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={styles.triggerButton}
      >
        <div className={styles.avatar}>
          <User className={styles.avatarIcon} />
        </div>
        <div className={styles.addressContainer}>
          <span className={styles.connectedLabel}>Connected</span>
          <span className={styles.address}>{truncatedAddress}</span>
        </div>
        <ChevronDown 
          className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className={styles.dropdownMenu}>
          {/* User Info Section */}
          <div className={styles.userInfo}>
            <div className={styles.userInfoAvatar}>
              <User className={styles.userInfoAvatarIcon} />
            </div>
            <div className={styles.userInfoText}>
              <p className={styles.walletLabel}>Wallet Address</p>
              <p className={styles.fullAddress}>{account.address}</p>
            </div>
          </div>

          {/* Menu Items */}
          <div className={styles.menuItems}>
            {/* Profile Link */}
            <button onClick={handleProfileClick} className={styles.menuItem}>
              <ExternalLink className={styles.menuIcon} />
              <div className={styles.menuItemText}>
                <div className={styles.menuItemTitle}>Scavenjer Profile</div>
                <div className={styles.menuItemSubtitle}>View profile on scavenjer.com</div>
              </div>
            </button>

            {/* Divider */}
            <div className={styles.divider} />

            {/* Disconnect */}
            <button onClick={handleDisconnect} className={styles.menuItemDanger}>
              <LogOut className={styles.menuIconDanger} />
              <div className={styles.menuItemText}>
                <div className={styles.menuItemTitleDanger}>Disconnect</div>
                <div className={styles.menuItemSubtitle}>Sign out of your wallet</div>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
