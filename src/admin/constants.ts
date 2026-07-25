/**
 * Admin Portal Constants
 * Centralized constants for admin functionality
 * Mirrors the admin wallet pattern from scavenjersite
 */

import { supabase } from '../lib/supabase';

const normalizeWallet = (address: string | undefined): string => (address || '').trim().toLowerCase();

const configuredAdminWallets = [
  import.meta.env.VITE_SIMULATIONS_ADMIN_WALLET,
  ...(import.meta.env.VITE_SIMULATIONS_ADMIN_WALLETS || '').split(','),
]
  .map(normalizeWallet)
  .filter(Boolean);

export const ADMIN_WALLETS = Array.from(new Set(configuredAdminWallets));
export const MASTER_ADMIN_WALLET = ADMIN_WALLETS[0] || '';

/**
 * Check if a wallet address is an admin
 * First checks master admin, then database for additional admins
 */
export async function isAdminWallet(address: string | undefined): Promise<boolean> {
  const normalizedAddress = normalizeWallet(address);
  if (!normalizedAddress) return false;
  
  // First check explicitly configured client-visible admin wallets for immediate UI access.
  if (ADMIN_WALLETS.includes(normalizedAddress)) {
    return true;
  }
  
  // Then check database for other admins via RPC
  // Note: This requires the is_admin RPC function to exist in Supabase
  // If it doesn't exist, only master admin will have access
  try {
    const { data, error } = await supabase.rpc('is_admin', {
      p_wallet_address: normalizedAddress,
    });

    if (error) {
      console.warn('Admin check RPC not available:', error.message);
      return false;
    }

    return data as boolean;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

/**
 * Check if a wallet address is the master admin
 */
export function isMasterAdmin(address: string | undefined): boolean {
  const normalizedAddress = normalizeWallet(address);
  return Boolean(MASTER_ADMIN_WALLET && normalizedAddress === MASTER_ADMIN_WALLET);
}

/**
 * Synchronous check for master admin (for immediate UI decisions)
 */
export function isMasterAdminSync(address: string | undefined): boolean {
  return isMasterAdmin(address);
}
