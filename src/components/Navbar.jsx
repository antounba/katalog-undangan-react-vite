import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sun, Moon, LogOut, Menu, X } from 'lucide-react';
import Swal from 'sweetalert2';

const Navbar = ({ user, onLogout, isDarkMode, toggleTheme }) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const navigate = useNavigate();

    const navClass = isDarkMode ? "bg-navy-900 border-slate-800" : "bg-ocean-900 border-luxury-amber-500/20";
    const textClass = isDarkMode ? "text-slate-200" : "text-white";

    const handleLogoutClick = () => {
        setMenuOpen(false); // Tutup menu mobile jika sedang terbuka
        Swal.fire({
            title: 'Logout?',
            text: 'Anda yakin ingin keluar?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Ya, Keluar',
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
        }).then((res) => {
            if (res.isConfirmed) {
                onLogout();
                navigate('/');
                Swal.fire({
                    title: 'Berhasil',
                    text: 'Sampai jumpa lagi!',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false
                });
            }
        });
    };

    return (
        <nav className={`${navClass} ${textClass} p-5 sticky top-0 z-[1000] shadow-xl transition-colors duration-500`}>
            <div className="max-w-7xl mx-auto flex justify-between items-center">

                {/* LOGO */}
                <Link to="/" className="text-xl font-serif font-bold flex items-center gap-3 group">
                    <div className="w-10 h-10 bg-luxury-amber-500 rounded-xl rotate-3 flex items-center justify-center text-ocean-900 shadow-lg group-hover:rotate-0 transition duration-300">UL</div>
                    <span className="tracking-widest uppercase text-sm md:text-lg">Undangan Luxury</span>
                </Link>

                {/* DESKTOP MENU */}
                <div className="hidden md:flex gap-6 items-center text-[11px] font-bold uppercase tracking-[0.2em]">
                    <Link to="/" className="hover:text-luxury-amber-500 transition">Katalog</Link>

                    <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-white/10 transition">
                        {isDarkMode ? <Sun size={16} className="text-yellow-400" /> : <Moon size={16} />}
                    </button>

                    {user?.role === 'admin' && (
                        <Link to="/admin" className="text-luxury-amber-500 hover:text-luxury-amber-400">Admin Panel</Link>
                    )}

                    {!user ? (
                        <div className="flex gap-4 border-l pl-6 border-white/20">
                            {/* Tombol Login Desktop */}
                            <Link to="/login" className="hover:text-luxury-amber-500 flex items-center">Login</Link>
                            <Link to="/signup" className="bg-white text-ocean-900 px-5 py-2 rounded-full hover:bg-luxury-amber-500 hover:text-white transition shadow-lg">Sign Up</Link>
                        </div>
                    ) : (
                        <div className="flex items-center gap-4 border-l pl-6 border-white/20">
                            <Link to="/profile" className="flex items-center gap-2 hover:text-luxury-amber-500 normal-case tracking-normal transition group">
                                <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-luxury-amber-500 group-hover:text-ocean-900 transition font-bold text-sm">
                                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                </div>
                                <span className="hidden lg:block">Hi, {user.name}</span>
                            </Link>
                            <button onClick={handleLogoutClick} className="text-red-400 hover:text-red-300 transition" title="Logout">
                                <LogOut size={16} />
                            </button>
                        </div>
                    )}
                </div>

                {/* MOBILE TOGGLE */}
                <button className="md:hidden text-white" onClick={() => setMenuOpen(!menuOpen)}>
                    {menuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* MOBILE MENU DROPDOWN */}
            {menuOpen && (
                <div className="md:hidden absolute top-full left-0 w-full bg-white text-ocean-900 shadow-2xl border-t p-6 flex flex-col gap-4 text-sm font-bold animate-in slide-in-from-top-2 z-[1001]">
                    <Link to="/" onClick={() => setMenuOpen(false)}>Katalog</Link>

                    <button onClick={() => { toggleTheme(); setMenuOpen(false); }} className="flex items-center gap-2 w-full text-left">
                        {isDarkMode ? <><Sun size={16} /> Mode Terang</> : <><Moon size={16} /> Mode Gelap</>}
                    </button>

                    {user?.role === 'admin' && (
                        <Link to="/admin" onClick={() => setMenuOpen(false)} className="text-luxury-amber-600">Admin Panel</Link>
                    )}

                    <hr className="border-slate-100" />

                    {!user ? (
                        <div className="flex flex-col gap-4">
                            {/* Memastikan klik pada login mobile menutup menu */}
                            <Link to="/login" onClick={() => setMenuOpen(false)} className="py-2">Masuk</Link>
                            <Link to="/signup" onClick={() => setMenuOpen(false)} className="text-luxury-amber-600 py-2">Daftar Akun</Link>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4">
                            <Link to="/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 text-ocean-900 py-2">
                                <div className="w-8 h-8 bg-ocean-100 rounded-full flex items-center justify-center font-bold text-sm text-ocean-900">
                                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                </div>
                                Profil Saya ({user.name})
                            </Link>
                            <button
                                onClick={handleLogoutClick}
                                className="text-red-500 w-full text-left flex items-center gap-2 py-2"
                            >
                                <LogOut size={14} /> Logout
                            </button>
                        </div>
                    )}
                </div>
            )}
        </nav>
    );
};

export default Navbar;