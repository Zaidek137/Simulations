import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThirdwebProvider } from 'thirdweb/react';
import PublicMap from '@/pages/PublicMap';
import AdminPage from '@/pages/AdminPage';
import WalletButton from '@/components/WalletButton/WalletButton';
import AdminRedirect from '@/components/AdminRedirect/AdminRedirect';

export default function App() {
  return (
    <ThirdwebProvider>
      <BrowserRouter>
        <WalletButton />
        <AdminRedirect />
        <Routes>
          <Route path="/" element={<PublicMap />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </BrowserRouter>
    </ThirdwebProvider>
  );
}
