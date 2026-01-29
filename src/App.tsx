import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThirdwebProvider } from 'thirdweb/react';
import PublicMap from '@/pages/PublicMap';
import AdminPage from '@/pages/AdminPage';
import CharacterSelectorPage from '@/pages/CharacterSelectorPage';
import WalletButton from '@/components/WalletButton/WalletButton';
import IndexButton from '@/components/IndexButton/IndexButton';
import AdminRedirect from '@/components/AdminRedirect/AdminRedirect';
import HomeRedirect from '@/components/HomeRedirect/HomeRedirect';

export default function App() {
  return (
    <ThirdwebProvider>
      <BrowserRouter>
        <HomeRedirect />
        <IndexButton />
        <WalletButton />
        <AdminRedirect />
        <Routes>
          <Route path="/" element={<PublicMap />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/characters" element={<CharacterSelectorPage />} />
        </Routes>
      </BrowserRouter>
    </ThirdwebProvider>
  );
}
