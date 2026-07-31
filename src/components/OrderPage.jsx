import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ShoppingBag, Send, Package, MapPin, User } from 'lucide-react';
import Swal from 'sweetalert2';
import { API_BASE_URL } from '../config';

const OrderPage = ({ items, user }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const item = items.find(i => i.id === parseInt(id));

    const [orderData, setOrderData] = useState({
        qty: 100,
        address: '',
        note: '',
        phone: ''
    });

    if (!item) return <div className="text-center py-20">Produk tidak ditemukan...</div>;

    const handleOrder = (e) => {
        e.preventDefault();

        // 1. Format pesan agar lebih rapi
        const message = `Halo Admin, Saya ingin pesan undangan:
    
*Produk:* ${item.title}
*Jumlah:* ${orderData.qty} pcs
*Alamat:* ${orderData.address}
*Catatan:* ${orderData.note || '-'}

Mohon info total pembayarannya.`;

        // 2. Gunakan api.whatsapp.com untuk trigger aplikasi yang lebih kuat
        // Ganti nomor di bawah dengan nomor WhatsApp Admin Anda (Gunakan format 62)
        const phoneNumber = "6285249098005";
        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.com/send?phone=${phoneNumber}&text=${encodedMessage}`;

        Swal.fire({
            title: 'Konfirmasi Pesanan',
            text: 'Anda akan dialihkan langsung ke WhatsApp Admin.',
            icon: 'success',
            showCancelButton: true,
            confirmButtonColor: '#25D366', // Warna Hijau WhatsApp
            confirmButtonText: 'Buka WhatsApp',
            cancelButtonText: 'Batal'
        }).then((res) => {
            if (res.isConfirmed) {
                // Menggunakan window.location.href kadang lebih efektif 
                // memicu aplikasi di HP daripada window.open
                window.location.href = whatsappUrl;
            }
        });
    };

    return (
        <div className="max-w-5xl mx-auto p-6 py-12 animate-in fade-in slide-in-from-bottom-4">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-ocean-900 mb-8 font-bold transition">
                <ChevronLeft size={20} /> Kembali
            </button>

            <div className="grid md:grid-cols-2 gap-12">
                {/* RINGKASAN PRODUK */}
                <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-100 h-fit">
                    <img src={`${API_BASE_URL}/uploads/${item.imagePath}`} className="w-full h-64 object-cover rounded-[2rem] mb-6 shadow-lg" alt={item.title} />
                    <h2 className="text-3xl font-serif font-bold text-ocean-900 mb-2">{item.title}</h2>
                    <span className="bg-ocean-100 text-ocean-900 px-4 py-1 rounded-full text-xs font-bold uppercase">{item.category}</span>
                    <div className="mt-6 pt-6 border-t border-slate-100">
                        <p className="text-slate-400 text-sm italic">"{item.desc}"</p>
                        <div className="mt-6 text-2xl font-bold text-ocean-900">
                            Rp {parseInt(item.price).toLocaleString()} <span className="text-sm font-normal text-slate-400">/ pcs</span>
                        </div>
                    </div>
                </div>

                {/* FORMULIR PEMESANAN */}
                <form onSubmit={handleOrder} className="bg-white p-10 rounded-[3rem] shadow-2xl border-t-8 border-luxury-amber-500 space-y-6">
                    <h3 className="text-xl font-bold text-ocean-900 flex items-center gap-2 mb-4">
                        <ShoppingBag className="text-luxury-amber-500" /> Detail Pesanan
                    </h3>

                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Jumlah Pesanan (Min. 100)</label>
                        <div className="relative">
                            <Package className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                            <input type="number" min="100" className="w-full bg-slate-50 border-2 border-slate-100 p-4 pl-12 rounded-2xl outline-none focus:border-luxury-amber-500 transition font-bold"
                                value={orderData.qty} onChange={e => setOrderData({ ...orderData, qty: e.target.value })} required />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Alamat Pengiriman</label>
                        <div className="relative">
                            <MapPin className="absolute left-4 top-4 text-slate-300" size={18} />
                            <textarea className="w-full bg-slate-50 border-2 border-slate-100 p-4 pl-12 rounded-2xl outline-none focus:border-luxury-amber-500 transition min-h-[100px]"
                                placeholder="Tulis alamat lengkap Anda..."
                                value={orderData.address} onChange={e => setOrderData({ ...orderData, address: e.target.value })} required />
                        </div>
                    </div>

                    <button className="w-full bg-ocean-900 text-white py-5 rounded-2xl font-bold hover:bg-ocean-800 transition shadow-xl flex items-center justify-center gap-3 text-lg">
                        <Send size={20} /> Kirim Pesanan Sekarang
                    </button>
                    <p className="text-center text-[10px] text-slate-400 italic">Pesanan akan diverifikasi oleh Admin via WhatsApp</p>
                </form>
            </div>
        </div>
    );
};

export default OrderPage;