import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PublicMap from '@/pages/PublicMap';
import AdminPage from '@/pages/AdminPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublicMap />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </BrowserRouter>
  );
}

