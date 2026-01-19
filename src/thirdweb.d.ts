// Type declarations for thirdweb SDK
declare module 'thirdweb' {
  export function createThirdwebClient(options: { 
    clientId: string;
    secretKey?: string;
  }): ThirdwebClient;
  
  export interface ThirdwebClient {
    clientId: string;
  }
}

declare module 'thirdweb/react' {
  import { ThirdwebClient } from 'thirdweb';
  import { ReactNode } from 'react';
  
  export interface ThirdwebProviderProps {
    children: ReactNode;
  }
  
  export function ThirdwebProvider(props: ThirdwebProviderProps): JSX.Element;
  
  export interface Account {
    address: string;
  }
  
  export interface Wallet {
    id: string;
    disconnect(): Promise<void>;
  }
  
  export function useActiveAccount(): Account | undefined;
  export function useActiveWallet(): Wallet | undefined;
  export function useDisconnect(): { disconnect: (wallet: Wallet) => Promise<void> };
  
  export interface WelcomeScreen {
    title: string;
    subtitle?: string;
    img?: {
      src: string;
      width?: number;
      height?: number;
    };
  }
  
  export interface ConnectModalOptions {
    size?: 'compact' | 'wide';
    showThirdwebBranding?: boolean;
    welcomeScreen?: WelcomeScreen;
  }
  
  export interface ConnectButtonProps {
    client: ThirdwebClient;
    wallets?: WalletConfig[];
    connectModal?: ConnectModalOptions;
    theme?: 'dark' | 'light';
  }
  
  export function ConnectButton(props: ConnectButtonProps): JSX.Element;
  
  export type WalletConfig = unknown;
}

declare module 'thirdweb/wallets' {
  import { WalletConfig } from 'thirdweb/react';
  
  export interface InAppWalletOptions {
    auth?: {
      options?: Array<'email' | 'phone' | 'google' | 'apple' | 'facebook' | 'passkey'>;
    };
  }
  
  export function inAppWallet(options?: InAppWalletOptions): WalletConfig;
  export function createWallet(walletId: string): WalletConfig;
}
