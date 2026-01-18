/**
 * Admin Portal Constants
 * Centralized constants for admin functionality
 * Mirrors the admin wallet pattern from scavenjersite
 */

import { supabase } from '../lib/supabase';

// Master admin wallet - same as scavenjersite for consistency
export const MASTER_ADMIN_WALLET = '0xf8Ca9dA64Bb500C4C4395f7Bb987De3e77883130';

/**
 * Check if a wallet address is an admin
 * First checks master admin, then database for additional admins
 */
export async function isAdminWallet(address: string | undefined): Promise<boolean> {
  if (!address) return false;
  
  // First check if it's the master admin (immediate access)
  if (address.toLowerCase() === MASTER_ADMIN_WALLET.toLowerCase()) {
    return true;
  }
  
  // Then check database for other admins via RPC
  // Note: This requires the is_admin RPC function to exist in Supabase
  // If it doesn't exist, only master admin will have access
  try {
    const { data, error } = await supabase.rpc('is_admin', {
      p_wallet_address: address.toLowerCase(),
    });

    if (error) {
      // RPC function may not exist yet - only master admin has access
      console.warn('Admin check RPC not available, using master admin only:', error.message);
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
  if (!address) return false;
  return address.toLowerCase() === MASTER_ADMIN_WALLET.toLowerCase();
}

/**
 * Synchronous check for master admin (for immediate UI decisions)
 */
export function isMasterAdminSync(address: string | undefined): boolean {
  if (!address) return false;
  return address.toLowerCase() === MASTER_ADMIN_WALLET.toLowerCase();
}
