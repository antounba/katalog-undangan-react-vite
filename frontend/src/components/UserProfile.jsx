import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { User, Key, UserCircle, Save, Eye, EyeOff, ShieldCheck, Mail, X } from 'lucide-react';
import Swal from 'sweetalert2';

const UserProfile = ({ currentUser, onUpdateUser }) => {
    const navigate = useNavigate(); // Hook untuk pindah halaman

    // State Data Form
    const [nameStr, setNameStr] = useState(currentUser.name);
    const [passData, setPassData] = useState({ oldPass: '', newPass: '' });

    // State Mata (Show/Hide Password)
    const [showOldPass, setShowOldPass] = useState(false);
    const [showNewPass, setShowNewPass] = useState(false);

    // --- FUNGSI BATAL / KEMBALI ---
    const handleCancel = () => {
        // Cek Role: Jika Admin ke Dashboard, Jika Member ke Home
        const targetPath = currentUser.role === 'admin' ? '/admin' : '/';
        navigate(targetPath);
    };

    // --- FUNGSI UTAMA: HANDLE SAVE ALL ---
    const handleSaveAll = async (e) => {
        e.preventDefault();

        // 1. Validasi Dasar
        if (!nameStr.trim()) {
            return Swal.fire('Gagal', 'Nama tidak boleh kosong!', 'warning');
        }

        // Cek apakah user ingin ganti password?
        const isChangingPass = passData.oldPass || passData.newPass;

        if (isChangingPass && (!passData.oldPass || !passData.newPass)) {
            return Swal.fire('Gagal', 'Jika ingin ganti password, harap isi Password Lama & Baru!', 'warning');
        }

        try {
            Swal.fire({ title: 'Menyimpan...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

            // A. UPDATE NAMA
            const resName = await fetch('http://localhost:5000/api/update-profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: currentUser.email, newName: nameStr })
            });

            if (!resName.ok) throw new Error('Gagal mengupdate nama');
            onUpdateUser({ ...currentUser, name: nameStr });

            // B. UPDATE PASSWORD (Jika diisi)
            if (isChangingPass) {
                const resPass = await fetch('http://localhost:5000/api/change-password', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: currentUser.email,
                        oldPassword: passData.oldPass,
                        newPassword: passData.newPass
                    })
                });

                const dataPass = await resPass.json();
                if (!resPass.ok) {
                    return Swal.fire('Info', `Nama tersimpan, tetapi Password gagal: ${dataPass.message}`, 'warning');
                }
            }

            // C. SUKSES & REDIRECT
            Swal.fire({
                icon: 'success',
                title: 'Berhasil Disimpan!',
                text: 'Data Anda telah diperbarui.',
                timer: 1500,
                showConfirmButton: false
            }).then(() => {
                // SETELAH SUKSES -> KEMBALI KE PANEL ADMIN / HOME
                handleCancel();
            });

        } catch (err) {
            console.error(err);
            Swal.fire('Error', 'Terjadi kesalahan koneksi server', 'error');
        }
    };

    return (
        <div className="max-w-3xl mx-auto p-6 animate-in fade-in slide-in-from-bottom-4 py-12">
            {/* HEADER SECTION */}
            <div className="text-center mb-10">
                <h2 className="text-3xl font-serif text-ocean-900 font-bold flex items-center justify-center gap-3">
                    <UserCircle className="text-luxury-amber-500" size={40} /> Pengaturan Akun
                </h2>
                <p className="text-slate-400 text-sm mt-2">Perbarui data diri dan keamanan akun Anda.</p>
            </div>

            {/* CARD UTAMA */}
            <form onSubmit={handleSaveAll} className="bg-white p-8 md:p-10 rounded-[2rem] shadow-2xl border border-slate-100 relative overflow-hidden">

                {/* Dekorasi Background */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-luxury-amber-500/10 rounded-bl-[100%] -mr-10 -mt-10 pointer-events-none"></div>

                <div className="relative z-10 grid gap-10">

                    {/* BAGIAN 1: PROFIL */}
                    <div>
                        <h3 className="text-lg font-bold text-ocean-900 mb-6 flex items-center gap-2 border-b border-slate-100 pb-2">
                            <User className="text-luxury-amber-600" size={20} /> Data Diri
                        </h3>
                        <div className="space-y-5">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1"><Mail size={12} /> Email</label>
                                    <input type="text" value={currentUser.email} disabled className="w-full bg-slate-100 p-4 rounded-xl text-slate-500 font-mono border border-slate-200 cursor-not-allowed text-sm" />
                                    <p className="text-[10px] text-slate-400 mt-1 italic">*Email tidak dapat diubah</p>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Nama Lengkap</label>
                                    <input type="text" value={nameStr} onChange={e => setNameStr(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-100 focus:border-luxury-amber-500 p-4 rounded-xl outline-none font-bold text-ocean-900 transition" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* BAGIAN 2: PASSWORD */}
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                        <h3 className="text-lg font-bold text-ocean-900 mb-2 flex items-center gap-2">
                            <ShieldCheck className="text-luxury-amber-600" size={20} /> Ubah Password
                        </h3>
                        <p className="text-xs text-slate-400 mb-6">Kosongkan bagian ini jika tidak ingin mengubah password.</p>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Password Lama</label>
                                <div className="relative group">
                                    <input
                                        type={showOldPass ? "text" : "password"}
                                        value={passData.oldPass}
                                        onChange={e => setPassData({ ...passData, oldPass: e.target.value })}
                                        className="w-full bg-white border-2 border-slate-200 focus:border-luxury-amber-500 p-4 pr-12 rounded-xl outline-none transition group-hover:border-slate-300"
                                        placeholder="••••••"
                                    />
                                    <button type="button" onClick={() => setShowOldPass(!showOldPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-ocean-900 transition">
                                        {showOldPass ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Password Baru</label>
                                <div className="relative group">
                                    <input
                                        type={showNewPass ? "text" : "password"}
                                        value={passData.newPass}
                                        onChange={e => setPassData({ ...passData, newPass: e.target.value })}
                                        className="w-full bg-white border-2 border-slate-200 focus:border-luxury-amber-500 p-4 pr-12 rounded-xl outline-none transition group-hover:border-slate-300"
                                        placeholder="••••••"
                                    />
                                    <button type="button" onClick={() => setShowNewPass(!showNewPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-ocean-900 transition">
                                        {showNewPass ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* TOMBOL ACTION (BATAL & SIMPAN) */}
                    <div className="pt-6 border-t border-slate-100 flex flex-col md:flex-row gap-4 justify-end">
                        {/* Tombol Batal */}
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="px-6 py-4 rounded-xl font-bold text-slate-500 hover:bg-slate-50 hover:text-red-500 transition border border-transparent hover:border-slate-200 flex items-center justify-center gap-2"
                        >
                            <X size={20} /> Batal
                        </button>

                        {/* Tombol Simpan */}
                        <button
                            type="submit"
                            className="bg-ocean-900 text-white px-8 py-4 rounded-xl font-bold hover:bg-ocean-800 transition shadow-xl hover:shadow-2xl hover:-translate-y-1 transform duration-200 flex items-center justify-center gap-3"
                        >
                            <Save size={20} /> Simpan Perubahan
                        </button>
                    </div>

                </div>
            </form>
        </div>
    );
};

export default UserProfile;