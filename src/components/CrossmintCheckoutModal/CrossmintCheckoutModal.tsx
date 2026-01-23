/**
 * CrossmintCheckoutModal
 * Cyberpunk-themed modal for Crossmint checkout - supports Eko collection purchase
 * Styled to match the Simulations site neobrutalism/cyberpunk theme
 */

import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle, Zap } from 'lucide-react';
import { useActiveAccount } from 'thirdweb/react';
import { CrossmintProvider, CrossmintHostedCheckout } from "@crossmint/client-sdk-react-ui";
import styles from './CrossmintCheckoutModal.module.css';

// Crossmint API key
const clientApiKey = "ck_production_5pLaG5zFyQ6nW2RuHYgapoJKcG4eV8ac5wHvki3bzyBA4MjBRxFybM2zCcQzyH1LttngQDgdDzTK8d47iwfxYrdSpAEwz9cpnrWuR9FwYxApVg9YMPXgPrTkNv4JWY6BgVtNNRmuM25Rm6R1i4KPL8dkbrv3UGLkpYgx83hp6eLRKw4oSmKfEN7z8tKcbX8k91HKcvpZCBDGcHn7kXpUfDCf";

// Default Eko collection
const COLLECTION_ID = '53ffb7b4-fc5e-4b61-b1e9-90bba9e23978';
const COLLECTION_NAME = "Intro Eko Collection";
const COLLECTION_PRICE = 74;
const ESTIMATED_USD = "$16 USD";

export interface CrossmintCheckoutProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CrossmintCheckoutModal({ isOpen, onClose }: CrossmintCheckoutProps) {
  const account = useActiveAccount();
  const address = account?.address;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className={styles.overlay}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className={styles.modal}
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className={styles.header}>
            <div className={styles.headerIcon}>
              <Zap className="w-6 h-6" />
            </div>
            <h2 className={styles.title}>ACQUIRE EKO</h2>
            <button onClick={onClose} className={styles.closeButton}>
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className={styles.content}>
            {/* Collection Info */}
            <div className={styles.collectionCard}>
              <div className={styles.collectionHeader}>
                <span className={styles.collectionBadge}>SCAVENJER EKOS</span>
              </div>
              <h3 className={styles.collectionName}>{COLLECTION_NAME}</h3>
              <p className={styles.collectionDescription}>
                Ekos are digital collectibles designed exclusively for the Scavenjer ecosystem. 
                They can be bought, sold, traded, customized, and used to access locked areas, 
                request drops, or even serve as your personal avatar. Each Eko is randomly 
                generated with unique traits and characteristics.
              </p>
              <div className={styles.collectionFeatures}>
                <span className={styles.feature}>◆ Simulation Access</span>
                <span className={styles.feature}>◆ Drop Requests</span>
                <span className={styles.feature}>◆ Customizable Avatar</span>
              </div>
            </div>

            {/* Price */}
            <div className={styles.priceSection}>
              <span className={styles.priceLabel}>ESTIMATED PRICE</span>
              <span className={styles.priceValue}>{ESTIMATED_USD}</span>
            </div>

            {/* Checkout */}
            <div className={styles.checkoutSection}>
              {address ? (
                <>
                  <CrossmintProvider apiKey={clientApiKey}>
                    <CrossmintHostedCheckout
                      lineItems={{
                        collectionLocator: `crossmint:${COLLECTION_ID}`,
                        callData: {
                          totalPrice: String(COLLECTION_PRICE),
                          quantity: 1,
                        },
                      }}
                      payment={{ crypto: { enabled: true }, fiat: { enabled: true } }}
                      className={styles.checkoutButton}
                      recipient={{ walletAddress: address }}
                    />
                  </CrossmintProvider>
                  <p className={styles.checkoutHint}>
                    You can purchase with your card or any cryptocurrency. Crossmint will handle the currency conversion for you.
                  </p>
                </>
              ) : (
                <div className={styles.connectPrompt}>
                  <div className={styles.alertBox}>
                    <AlertCircle className="w-4 h-4" />
                    <span>Please connect your account to purchase an Eko. You can pay with your card or any cryptocurrency once connected.</span>
                  </div>
                  <button disabled className={styles.disabledButton}>
                    CONNECT ACCOUNT TO PURCHASE
                  </button>
                  <p className={styles.connectHint}>
                    Connect your account using the button in the top right corner to enable purchasing.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className={styles.footer}>
            <span>SECURE TRANSACTION</span>
            <span>•</span>
            <span>CROSSMINT VERIFIED</span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
