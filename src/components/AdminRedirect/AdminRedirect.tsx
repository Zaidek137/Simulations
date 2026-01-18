/**
 * AdminRedirect Component
 * Automatically redirects to admin page when an admin wallet connects
 */

import { useEffect, useState } from 'react';
import { useActiveAccount } from 'thirdweb/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { isAdminWallet } from '@/admin/constants';

export default function AdminRedirect() {
  const account = useActiveAccount();
  const navigate = useNavigate();
  const location = useLocation();
  const [checkedWallets, setCheckedWallets] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function checkAndRedirect() {
      // Only check if we have an account and we're not already on the admin page
      if (!account?.address || location.pathname === '/admin') {
        return;
      }

      // Don't check the same wallet multiple times in quick succession
      if (checkedWallets.has(account.address.toLowerCase())) {
        return;
      }

      // Check if this wallet is an admin
      const isAdmin = await isAdminWallet(account.address);
      
      // Mark this wallet as checked
      setCheckedWallets(prev => new Set(prev).add(account.address!.toLowerCase()));

      if (isAdmin) {
        // Redirect to admin page
        console.log('🔐 Admin wallet detected, redirecting to admin page...');
        navigate('/admin');
      }
    }

    checkAndRedirect();
  }, [account?.address, location.pathname, navigate, checkedWallets]);

  // This component doesn't render anything
  return null;
}
