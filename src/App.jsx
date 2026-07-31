import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';
import { API_ENDPOINTS } from './config';

// Import Komponen
import Navbar from './components/Navbar';
import AuthForm from './components/AuthForm';
import UserProfile from './components/UserProfile';
import AdminDashboard from './components/AdminDashboard';
import Home from './components/Home';
import OrderPage from './components/OrderPage';

// Komponen untuk scroll ke atas otomatis saat pindah halaman
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

export default function App() {
  const [items, setItems] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // --- LOGIKA SESI: Ambil data user dari localStorage saat pertama kali load ---
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user_session');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch (e) {
        console.error("Error parsing user session", e);
        return null;
      }
    }
    return null;
  });

  // Fungsi Load Data Katalog
  const refreshData = () => {
    fetch(API_ENDPOINTS.katalog)
      .then(res => res.json())
      .then(data => {
        console.log("Data Katalog Terbaru:", data); // Cek apakah data baru sudah masuk di sini
        setItems(data);
      })
      .catch(err => console.error("Gagal load data:", err));
  };

  useEffect(() => {
    refreshData();
    // Load Tema
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') setIsDarkMode(true);
  }, []);

  // --- FUNGSI LOGIN / SIGNUP BERHASIL ---
  const handleAuthSuccess = (userData) => {
    setUser(userData);
    // Simpan ke localStorage agar tidak hilang saat refresh
    localStorage.setItem('user_session', JSON.stringify(userData));
  };

  // --- FUNGSI LOGOUT ---
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user_session');
    Swal.fire({
      icon: 'success',
      title: 'Berhasil Keluar',
      timer: 1000,
      showConfirmButton: false
    });
  };

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
  };

  const bgClass = isDarkMode ? "bg-slate-900 text-white" : "bg-[#fcfdfe] text-slate-900";

  return (
    <Router>
      <div className={`min-h-screen ${bgClass} transition-colors duration-500`}>
        <ScrollToTop />

        <Navbar
          user={user}
          onLogout={handleLogout}
          isDarkMode={isDarkMode}
          toggleTheme={toggleTheme}
        />

        <Routes>
          <Route path="/" element={<Home items={items} currentUser={user} />} />

          {/* Halaman Login & Signup - Menggunakan handleAuthSuccess */}
          <Route
            path="/login"
            element={<AuthForm type="login" onAuthSuccess={handleAuthSuccess} />}
          />
          <Route
            path="/signup"
            element={<AuthForm type="signup" onAuthSuccess={handleAuthSuccess} />}
          />

          {/* Rute Terproteksi (Hanya jika Login) */}
          <Route
            path="/order/:id"
            element={user ? <OrderPage items={items} user={user} /> : <Navigate to="/login" />}
          />
          <Route
            path="/profile"
            element={user ? <UserProfile currentUser={user} onUpdateUser={handleAuthSuccess} /> : <Navigate to="/login" />}
          />

          {/* Rute Khusus Admin */}
          <Route
            path="/admin"
            element={user?.role === 'admin' ? <AdminDashboard items={items} refreshData={refreshData} /> : <Navigate to="/login" />}
          />

          {/* Fallback jika URL salah */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}