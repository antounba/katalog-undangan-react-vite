import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { ArrowLeft } from 'lucide-react';
import { API_ENDPOINTS } from '../config';

const AuthForm = ({ type, onAuthSuccess }) => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
    const isLogin = type === 'login';
    const navigate = useNavigate();

    // --- PROTEKSI HALAMAN LOGIN ---
    // Jika user sudah login (sesi ada), jangan biarkan akses halaman login/signup
    useEffect(() => {
        const savedUser = localStorage.getItem('user_session');
        if (savedUser) {
            navigate('/'); // Tendang ke Home
        }
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isLogin && formData.password !== formData.confirmPassword) {
            return Swal.fire('Error', 'Password konfirmasi tidak cocok!', 'error');
        }

        const endpoint = isLogin ? API_ENDPOINTS.login : API_ENDPOINTS.signup;

        try {
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (res.ok) {
                // --- SIMPAN SESI KE LOCALSTORAGE ---
                localStorage.setItem('user_session', JSON.stringify(data.user));

                Swal.fire({
                    icon: 'success',
                    title: 'Berhasil',
                    text: `Selamat datang, ${data.user.name}`,
                    timer: 1500,
                    showConfirmButton: false
                });

                onAuthSuccess(data.user);
                navigate(data.user.role === 'admin' ? '/admin' : '/');
            } else {
                Swal.fire('Gagal', data.message || 'Terjadi kesalahan', 'error');
            }
        } catch (err) {
            console.error(err);
            Swal.fire('Error', 'Koneksi ke server gagal!', 'error');
        }
    };

    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center p-6">
            <div className="bg-white p-10 rounded-[2rem] shadow-2xl border-t-8 border-luxury-amber-500 w-full max-w-md animate-in zoom-in duration-300 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-32 h-32 bg-ocean-50 rounded-br-full -ml-10 -mt-10 opacity-50"></div>

                <h2 className="text-3xl font-serif text-ocean-900 font-bold mb-2 text-center relative z-10">
                    {isLogin ? 'Masuk Akun' : 'Buat Akun'}
                </h2>
                <p className="text-center text-slate-400 text-sm mb-8 relative z-10">
                    {isLogin ? 'Akses katalog premium' : 'Isi data diri Anda'}
                </p>

                <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
                    {!isLogin && (
                        <input
                            type="text"
                            placeholder="Nama Lengkap"
                            className="w-full bg-slate-50 p-4 rounded-xl outline-none focus:ring-2 focus:ring-luxury-amber-500 transition"
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    )}
                    <input
                        type="email"
                        placeholder="Email Address"
                        className="w-full bg-slate-50 p-4 rounded-xl outline-none focus:ring-2 focus:ring-luxury-amber-500 transition"
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        className="w-full bg-slate-50 p-4 rounded-xl outline-none focus:ring-2 focus:ring-luxury-amber-500 transition"
                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                        required
                    />
                    {!isLogin && (
                        <input
                            type="password"
                            placeholder="Ulangi Password"
                            className="w-full bg-slate-50 p-4 rounded-xl outline-none focus:ring-2 focus:ring-luxury-amber-500 transition"
                            onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                            required
                        />
                    )}

                    <button type="submit" className="w-full bg-ocean-900 text-white py-4 rounded-xl font-bold hover:bg-ocean-800 transition shadow-lg uppercase tracking-widest hover:scale-[1.02] transform duration-200">
                        {isLogin ? 'MASUK' : 'DAFTAR'}
                    </button>
                </form>

                <div className="text-center mt-6 text-sm relative z-10">
                    {isLogin ? (
                        <p className="text-slate-500">Belum punya akun? <Link to="/signup" className="text-luxury-amber-600 font-bold hover:underline">Daftar</Link></p>
                    ) : (
                        <p className="text-slate-500">Sudah punya akun? <Link to="/login" className="text-luxury-amber-600 font-bold hover:underline">Login</Link></p>
                    )}
                </div>
            </div>

            <Link
                to="/"
                className="mt-8 flex items-center gap-2 text-slate-400 hover:text-ocean-900 transition-all duration-300 group font-bold text-sm"
            >
                <div className="p-2 rounded-full bg-white shadow-md group-hover:bg-ocean-900 group-hover:text-white transition-all">
                    <ArrowLeft size={16} />
                </div>
                Kembali ke Beranda
            </Link>
        </div>
    );
};

export default AuthForm;