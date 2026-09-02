import React, { useState, useEffect } from 'react';
import { Plus, Trash2, LayoutGrid, Edit, Save, X, UploadCloud, Image as ImageIcon, FileText, Download } from 'lucide-react';
import Swal from 'sweetalert2';
import { API_BASE_URL } from '../config';

const AdminDashboard = ({ items, refreshData }) => {
    // --- STATE FORM ---
    const [formData, setFormData] = useState({
        title: '',
        category: 'Pernikahan',
        price: '',
        desc: '',
        image: null,      // Sampul
        imageFront: null, // Sisi Depan
        imageBack: null,  // Sisi Belakang
        catalogFile: null // File Master
    });

    const [editId, setEditId] = useState(null);

    // --- LOAD DATA ---
    useEffect(() => {
        if (refreshData) {
            refreshData();
        }
    }, []);

    // --- RESET FORM ---
    const resetForm = () => {
        setFormData({ title: '', category: 'Pernikahan', price: '', desc: '', image: null, imageFront: null, imageBack: null, catalogFile: null });
        setEditId(null);
        document.querySelectorAll('input[type="file"]').forEach(input => input.value = "");
    };

    // --- ISI FORM UNTUK EDIT ---
    const handleEditClick = (item) => {
        setEditId(item.id);
        setFormData({
            title: item.title,
            category: item.category,
            price: item.price,
            desc: item.desc,
            image: null,
            imageFront: null,
            imageBack: null,
            catalogFile: null
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // --- SUBMIT DATA (TAMBAH/EDIT) ---
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validasi Sampul
        if (!editId && !formData.image) {
            return Swal.fire('Peringatan', 'Mohon upload gambar sampul!', 'warning');
        }

        const data = new FormData();
        data.append('title', formData.title);
        data.append('category', formData.category);
        data.append('price', formData.price);
        data.append('desc', formData.desc);

        if (formData.image) data.append('image', formData.image);
        if (formData.imageFront) data.append('imageFront', formData.imageFront);
        if (formData.imageBack) data.append('imageBack', formData.imageBack);
        if (formData.catalogFile) data.append('catalogFile', formData.catalogFile);

        try {
            Swal.fire({ title: 'Menyimpan...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

            let url = `${API_BASE_URL}/api/katalog`;
            let method = 'POST';

            if (editId) {
                url = `${API_BASE_URL}/api/katalog/${editId}`;
                method = 'PUT';
            }

            const res = await fetch(url, { method: method, body: data });
            const result = await res.json();

            if (res.ok) {
                await refreshData();
                resetForm();
                Swal.fire('Sukses', editId ? 'Data Diupdate' : 'Data Ditambahkan', 'success');
            } else {
                Swal.fire('Gagal', result.message || 'Gagal memproses data', 'error');
            }
        } catch (err) {
            Swal.fire('Error', 'Gagal koneksi server', 'error');
        }
    };

    // --- HAPUS DATA ---
    const handleDelete = async (id) => {
        Swal.fire({
            title: 'Hapus data?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Ya, Hapus!'
        }).then(async (res) => {
            if (res.isConfirmed) {
                await fetch(`${API_BASE_URL}/api/katalog/${id}`, { method: 'DELETE' });
                await refreshData();
                Swal.fire('Terhapus!', '', 'success');
                if (editId === id) resetForm();
            }
        });
    };

    // --- HELPER WARNA PITA KATEGORI ---
    const getRibbonClass = (category) => {
        switch (category) {
            case 'Pernikahan': return 'bg-pink-500 text-white border-pink-600';
            case 'Khitanan': return 'bg-blue-500 text-white border-blue-600';
            case 'Label Tonjokan': return 'bg-emerald-500 text-white border-emerald-600';
            default: return 'bg-slate-500 text-white border-slate-600';
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-6 md:p-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <h2 className="text-3xl font-serif font-bold text-ocean-900 flex items-center gap-3">
                    <LayoutGrid className="text-luxury-amber-500" /> Dashboard Admin
                </h2>
                <div className="bg-ocean-50 text-ocean-900 px-5 py-2 rounded-full text-sm font-bold border border-ocean-200 shadow-sm">Mode Pengelola</div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* --- FORM INPUT --- */}
                <div className="lg:col-span-1">
                    <form onSubmit={handleSubmit} className={`bg-white p-6 rounded-[2rem] shadow-xl border-t-8 h-fit sticky top-24 transition-all ${editId ? 'border-luxury-amber-500' : 'border-ocean-900'}`}>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-ocean-900 text-lg flex items-center gap-2">
                                {editId ? <><Edit size={20} /> Edit Item</> : <><Plus size={20} /> Tambah Baru</>}
                            </h3>
                            {editId && <button type="button" onClick={resetForm} className="text-xs bg-red-100 text-red-600 px-3 py-1 rounded-full hover:bg-red-200 transition flex items-center gap-1"><X size={14} /> Batal</button>}
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Judul Undangan</label>
                                <input type="text" placeholder="Contoh: Floral Gold" className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:border-ocean-900 transition font-bold"
                                    value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Kategori</label>
                                    <select className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:border-ocean-900 transition cursor-pointer"
                                        value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                                        <option>Pernikahan</option>
                                        <option>Khitanan</option>
                                        <option>Label Tonjokan</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Harga (Rp)</label>
                                    <input type="number" placeholder="0" className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:border-ocean-900 transition font-mono"
                                        value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} required />
                                </div>
                            </div>

                            {/* UPLOAD: SAMPUL UTAMA */}
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Gambar Sampul (Wajib)</label>
                                <div className="relative group">
                                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={e => setFormData({ ...formData, image: e.target.files[0] })} />
                                    <div className="w-full bg-slate-50 border-2 border-dashed p-3 rounded-xl flex flex-col items-center text-slate-400 group-hover:border-ocean-900 group-hover:text-ocean-900 transition">
                                        <UploadCloud size={20} className="mb-1" />
                                        <span className="text-[10px] truncate w-full text-center">{formData.image ? formData.image.name : "Klik untuk upload sampul"}</span>
                                    </div>
                                </div>
                            </div>

                            {/* UPLOAD: SISI DEPAN & BELAKANG */}
                            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Sisi Depan</label>
                                    <div className="relative group">
                                        <input type="file" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={e => setFormData({ ...formData, imageFront: e.target.files[0] })} />
                                        <div className="bg-slate-50 border border-dashed border-slate-200 p-2 rounded-lg flex flex-col items-center text-slate-400 group-hover:border-ocean-900 transition">
                                            <ImageIcon size={16} />
                                            <span className="text-[8px] truncate w-full text-center mt-1">{formData.imageFront ? formData.imageFront.name : "Upload"}</span>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Sisi Belakang</label>
                                    <div className="relative group">
                                        <input type="file" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={e => setFormData({ ...formData, imageBack: e.target.files[0] })} />
                                        <div className="bg-slate-50 border border-dashed border-slate-200 p-2 rounded-lg flex flex-col items-center text-slate-400 group-hover:border-ocean-900 transition">
                                            <ImageIcon size={16} />
                                            <span className="text-[8px] truncate w-full text-center mt-1">{formData.imageBack ? formData.imageBack.name : "Upload"}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* UPLOAD: FILE MASTER */}
                            <div className="p-3 bg-ocean-50/50 rounded-2xl border border-ocean-100">
                                <label className="text-[10px] font-bold text-ocean-900 uppercase mb-2 block flex items-center gap-2">
                                    <FileText size={14} className="text-luxury-amber-500" /> File Master (PSD/ZIP/CDR)
                                </label>
                                <input
                                    type="file"
                                    accept=".psd, .zip, .docx, .cdr"
                                    className="text-[10px] w-full file:mr-4 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-[10px] file:font-bold file:bg-ocean-900 file:text-white hover:file:bg-luxury-amber-600 transition file:cursor-pointer"
                                    onChange={e => setFormData({ ...formData, catalogFile: e.target.files[0] })}
                                />
                                {formData.catalogFile && <p className="text-[9px] text-ocean-600 mt-1 font-bold italic">Terpilih: {formData.catalogFile.name}</p>}
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Deskripsi</label>
                                <textarea placeholder="Tulis spesifikasi..." className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none h-20 text-sm focus:border-ocean-900 transition"
                                    value={formData.desc} onChange={e => setFormData({ ...formData, desc: e.target.value })} required />
                            </div>

                            <button className={`w-full py-4 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all ${editId ? 'bg-luxury-amber-600 hover:bg-luxury-amber-700' : 'bg-ocean-900 hover:bg-ocean-800'}`}>
                                {editId ? <><Save size={18} /> Update Perubahan</> : <><Plus size={18} /> Simpan ke Katalog</>}
                            </button>
                        </div>
                    </form>
                </div>

                {/* --- LIST DATA (Grid Preview) --- */}
                <div className="lg:col-span-2 space-y-3">
                    {!items || items.length === 0 ? (
                        <div className="bg-white p-10 rounded-[2rem] border-2 border-dashed border-slate-100 text-center text-slate-300 flex flex-col items-center justify-center min-h-[200px]">
                            <LayoutGrid size={48} className="mb-4 opacity-20" />
                            <p className="font-bold">Belum ada data katalog.</p>
                            <p className="text-xs">Data yang Anda tambah akan muncul di sini.</p>
                        </div>
                    ) : (
                        items.map(item => (
                            <div key={item.id} className={`bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center hover:shadow-md transition group ${editId === item.id ? 'ring-2 ring-luxury-amber-500 bg-amber-50/30' : ''}`}>

                                <div className="flex items-center gap-4 flex-1 overflow-hidden">
                                    <div className="relative h-16 w-16 flex-shrink-0">
                                        <img
                                            src={`${API_BASE_URL}/uploads/${item.imagePath}`}
                                            className="w-full h-full rounded-xl object-cover shadow-sm bg-slate-100"
                                            alt={item.title}
                                            onError={(e) => e.target.src = 'https://via.placeholder.com/150?text=No+Img'}
                                        />
                                        {item.catalogFilePath && (
                                            <div className="absolute -top-2 -right-2 bg-green-500 text-white p-1 rounded-full shadow-sm z-10 border-2 border-white" title="File Master Tersedia">
                                                <FileText size={10} />
                                            </div>
                                        )}
                                    </div>

                                    <div className="min-w-0">
                                        {/* --- PITA KATEGORI DI ATAS JUDUL --- */}
                                        <span className={`inline-block mb-1 px-2 py-0.5 rounded-md text-[8px] font-bold uppercase tracking-wider border-b-2 shadow-sm ${getRibbonClass(item.category)}`}>
                                            {item.category}
                                        </span>

                                        <h4 className="font-bold text-ocean-900 text-sm truncate">{item.title}</h4>
                                        <div className="mt-1">
                                            <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full font-bold text-ocean-900 border border-slate-200">
                                                Rp {parseInt(item.price).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 ml-4">
                                    {item.catalogFilePath ? (
                                        <a
                                            href={`${API_BASE_URL}/uploads/${item.catalogFilePath}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            download
                                            className="p-2.5 bg-green-50 text-green-600 rounded-xl hover:bg-green-600 hover:text-white transition shadow-sm border border-green-100 group-hover:border-green-200"
                                            title="Download File Master"
                                        >
                                            <Download size={16} />
                                        </a>
                                    ) : (
                                        <div className="p-2.5 bg-slate-50 text-slate-300 rounded-xl border border-slate-100 cursor-not-allowed">
                                            <Download size={16} />
                                        </div>
                                    )}

                                    <button
                                        onClick={() => handleEditClick(item)}
                                        className="p-2.5 bg-ocean-50 text-ocean-900 rounded-xl hover:bg-ocean-900 hover:text-white transition shadow-sm border border-ocean-100 group-hover:border-ocean-200"
                                        title="Edit Data"
                                    >
                                        <Edit size={16} />
                                    </button>

                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        className="p-2.5 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition shadow-sm border border-red-100 group-hover:border-red-200"
                                        title="Hapus Data"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>

                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;