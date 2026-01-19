import { ConnectButton, useActiveAccount } from 'thirdweb/react';
import { createWallet, inAppWallet } from 'thirdweb/wallets';
import { client } from '@/lib/thirdwebClient';
import WalletDropdown from '@/components/WalletDropdown/WalletDropdown';
import styles from './WalletButton.module.css';

// Configure supported wallets - same as scavenjersite
const wallets = [
  inAppWallet({
    auth: {
      options: ["email", "phone", "google", "apple", "facebook", "passkey"],
    },
  }),
  createWallet("io.metamask"),
  createWallet("com.coinbase.wallet"),
  createWallet("me.rainbow"),
  createWallet("walletConnect"),
  createWallet("com.trustwallet.app"),
  createWallet("com.okex.wallet"),
  createWallet("com.brave.wallet"),
  createWallet("com.ledger"),
];

export default function WalletButton() {
  const account = useActiveAccount();

  return (
    <div className={styles.container}>
      {account ? (
        <WalletDropdown />
      ) : (
        <ConnectButton
          client={client}
          wallets={wallets}
          connectModal={{
            size: "compact",
            showThirdwebBranding: false,
            welcomeScreen: {
              title: "Connect your wallet",
              subtitle: "Sign in with email, phone, social login, or connect an external wallet",
            }
          }}
          theme="dark"
        />
      )}
    </div>
  );
}
