import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Heart, X, ZoomIn, ChevronLeft, ChevronRight, Download, ImageOff, Star, Lock } from 'lucide-react';
import { API_BASE_URL } from '../config';

const Home = ({ items = [], currentUser }) => {
    const [filter, setFilter] = useState("Semua");
    const [selectedItem, setSelectedItem] = useState(null);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [expandedDesc, setExpandedDesc] = useState({});

    // --- STATE HERO SLIDER ---
    const [heroItems, setHeroItems] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(4); // Start index
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [itemsPerView, setItemsPerView] = useState(window.innerWidth >= 768 ? 4 : 2);

    const slideInterval = useRef(null);
    const transitionRef = useRef(null);

    // 1. Deteksi Ukuran Layar
    useEffect(() => {
        const handleResize = () => {
            setItemsPerView(window.innerWidth >= 768 ? 4 : 2);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // 2. Persiapan Data Slider (Infinite Loop Logic)
    useEffect(() => {
        if (items.length > 0) {
            const shuffled = [...items].sort(() => 0.5 - Math.random()).slice(0, 8);
            if (shuffled.length >= 2) {
                const clonesStart = shuffled.slice(-4);
                const clonesEnd = shuffled.slice(0, 4);
                const extendedList = [...clonesStart, ...shuffled, ...clonesEnd];
                setHeroItems(extendedList);
                setCurrentIndex(4);
            } else {
                setHeroItems(shuffled);
                setCurrentIndex(0);
            }
        }
    }, [items]);

    // 3. Navigasi Slider
    const nextHero = () => {
        if (heroItems.length <= 1) return;
        setIsTransitioning(true);
        setCurrentIndex(prev => prev + 1);
    };

    const prevHero = () => {
        if (heroItems.length <= 1) return;
        setIsTransitioning(true);
        setCurrentIndex(prev => prev - 1);
    };

    // 4. Auto Slide
    useEffect(() => {
        slideInterval.current = setInterval(nextHero, 4000);
        return () => clearInterval(slideInterval.current);
    }, [currentIndex, heroItems]);

    // 5. Infinite Loop Transition End
    const handleTransitionEnd = () => {
        if (!heroItems.length) return;
        const totalRealItems = heroItems.length - 8;

        if (currentIndex >= 4 + totalRealItems) {
            setIsTransitioning(false);
            setCurrentIndex(4);
        }
        if (currentIndex <= 3) {
            setIsTransitioning(false);
            setCurrentIndex(4 + totalRealItems - 1);
        }
    };

    // --- HELPER LAINNYA ---
    const filtered = filter === "Semua" ? items : items.filter(i => i.category === filter);
    const toggleDesc = (id) => setExpandedDesc(prev => ({ ...prev, [id]: !prev[id] }));
    const openModal = (item) => { setSelectedItem(item); setCurrentSlide(0); };
    const formatPrice = (price) => { const val = parseInt(price); return isNaN(val) ? "0" : val.toLocaleString(); };
    const getImgUrl = (filename, id) => filename ? `${API_BASE_URL}/uploads/${filename}?t=${id}` : null;

    // --- RENDER PRICE ---
    const renderPrice = (price, isSmall = false) => {
        if (currentUser) return `Rp ${formatPrice(price)}`;
        return isSmall ? "Rp ????" : "Login utk Harga";
    };

    // --- HELPER WARNA PITA KATEGORI (Sama seperti Admin) ---
    const getRibbonClass = (category) => {
        switch (category) {
            case 'Pernikahan': return 'bg-pink-500 shadow-pink-300/50 border-pink-600';
            case 'Khitanan': return 'bg-blue-500 shadow-blue-300/50 border-blue-600';
            case 'Label Tonjokan': return 'bg-emerald-500 shadow-emerald-300/50 border-emerald-600';
            default: return 'bg-slate-500 shadow-slate-300/50 border-slate-600';
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-6 py-12 animate-in fade-in">
            {/* HEADER */}
            <div className="text-center mb-10">
                <span className="text-luxury-amber-600 font-bold tracking-[0.3em] uppercase text-xs">Premium Collection</span>
                <h1 className="text-5xl font-serif text-ocean-900 mt-2 italic">E-Katalog Undangan</h1>
                <div className="flex justify-center items-center gap-4 mt-4 opacity-60">
                    <div className="h-[1px] w-12 bg-luxury-amber-500"></div>
                    <Heart size={16} className="text-luxury-amber-500" fill="currentColor" />
                    <div className="h-[1px] w-12 bg-luxury-amber-500"></div>
                </div>
            </div>

            {/* SLIDER (HERO SECTION) */}
            {heroItems.length > 0 && (
                <div className="relative w-full h-[320px] mb-16 group">
                    <div className="w-full h-full rounded-[2rem] overflow-hidden shadow-2xl bg-slate-900 [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)]">
                        <div
                            ref={transitionRef}
                            className="h-full flex"
                            style={{
                                transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
                                transition: isTransitioning ? 'transform 700ms ease-in-out' : 'none'
                            }}
                            onTransitionEnd={handleTransitionEnd}
                        >
                            {heroItems.map((item, idx) => (
                                <div
                                    key={`${item.id}-${idx}`}
                                    className="relative h-full flex-shrink-0 flex items-center justify-center bg-slate-900 overflow-hidden border-r border-white/5"
                                    style={{ width: `${100 / itemsPerView}%` }}
                                >
                                    <img src={getImgUrl(item.imagePath, item.id)} className="absolute inset-0 w-full h-full object-cover opacity-40 blur-md scale-110" alt="bg" />
                                    <img src={getImgUrl(item.imagePath, item.id)} className="relative z-10 h-[85%] w-auto max-w-[90%] object-contain drop-shadow-2xl rounded-md transform transition-transform duration-700 hover:scale-105" alt={item.title} />

                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent flex items-end justify-center p-6 z-20 pointer-events-none">
                                        <div className="text-center text-white pointer-events-auto transform translate-y-4 group-hover:translate-y-0 transition duration-500">
                                            <div className="inline-flex items-center gap-1 bg-luxury-amber-600 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase mb-2 shadow-lg mx-auto">
                                                <Star size={10} fill="currentColor" /> Featured
                                            </div>
                                            <h2 className="text-lg md:text-xl font-serif font-bold mb-1 drop-shadow-md line-clamp-1">{item.title}</h2>
                                            <div className="flex justify-center gap-2 mt-2 items-center">
                                                <span className={`px-3 py-1 rounded-full font-bold border text-xs backdrop-blur-md ${currentUser ? 'bg-white/10 border-white/20 text-white' : 'bg-red-500/20 border-red-500/50 text-red-200'}`}>
                                                    {currentUser ? renderPrice(item.price) : <span className="flex items-center gap-1"><Lock size={10} /> Rp ????</span>}
                                                </span>
                                                <button onClick={() => openModal(item)} className="bg-white text-ocean-900 px-3 py-1 rounded-full font-bold hover:bg-luxury-amber-500 hover:text-white transition shadow-lg text-[10px]">Lihat</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <button onClick={prevHero} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white text-white hover:text-ocean-900 p-2 rounded-full backdrop-blur-md transition-all z-30 opacity-0 group-hover:opacity-100 transform -translate-x-full group-hover:translate-x-0 duration-300 shadow-xl border border-white/10"><ChevronLeft size={24} /></button>
                    <button onClick={nextHero} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white text-white hover:text-ocean-900 p-2 rounded-full backdrop-blur-md transition-all z-30 opacity-0 group-hover:opacity-100 transform translate-x-full group-hover:translate-x-0 duration-300 shadow-xl border border-white/10"><ChevronRight size={24} /></button>
                </div>
            )}

            {/* --- FILTER KATEGORI --- */}
            <div className="flex justify-center gap-3 mb-12 flex-wrap">
                {["Semua", "Pernikahan", "Khitanan", "Label Tonjokan"].map(c => (
                    <button
                        key={c}
                        onClick={() => setFilter(c)}
                        className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all duration-300 ${filter === c ? 'bg-ocean-900 text-white shadow-xl scale-105' : 'bg-white text-ocean-900 border border-slate-200 hover:bg-slate-50'}`}
                    >
                        {c}
                    </button>
                ))}
            </div>

            {/* --- GRID KATALOG --- */}
            {filtered.length === 0 ? (
                <div className="text-center py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                    <ImageOff size={48} className="mx-auto text-slate-300 mb-4" />
                    <p className="text-slate-500 font-bold">Belum ada koleksi untuk kategori ini.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {filtered.map(item => (
                        <div key={item.id} className="bg-white rounded-[2rem] shadow-sm hover:shadow-2xl transition-all duration-500 group border border-slate-100 flex flex-col overflow-hidden relative h-full">
                            <div className="h-72 overflow-hidden relative cursor-zoom-in bg-slate-100" onClick={() => openModal(item)}>
                                <img src={getImgUrl(item.imagePath, item.id)} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" onError={(e) => e.target.src = 'https://via.placeholder.com/400x400?text=Gambar+Rusak'} />

                                {/* PITA KATEGORI DI GRID ITEM */}
                                <div className={`absolute top-0 left-0 px-3 py-1 rounded-br-xl text-[9px] font-black uppercase tracking-wider text-white shadow-md z-10 ${getRibbonClass(item.category)}`}>
                                    {item.category}
                                </div>

                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><ZoomIn className="text-white" size={32} /></div>
                            </div>
                            <div className="p-6 flex-1 flex flex-col justify-between">
                                <div>
                                    <h3 className="text-lg font-serif text-ocean-900 mb-2 font-bold line-clamp-1">{item.title}</h3>
                                    <p className="text-slate-500 text-xs italic leading-relaxed">{expandedDesc[item.id] ? item.desc : `"${item.desc.substring(0, 45)}..."`}</p>
                                    {item.desc.length > 45 && <button onClick={() => toggleDesc(item.id)} className="text-luxury-amber-600 text-[10px] font-bold mt-1 uppercase hover:underline">{expandedDesc[item.id] ? "Tutup" : "Selengkapnya"}</button>}
                                </div>
                                <div className="flex justify-between items-center pt-4 border-t border-slate-50 mt-4">
                                    <span className={`text-xl font-bold ${currentUser ? 'text-ocean-900' : 'text-slate-300 font-serif tracking-widest'}`}>{renderPrice(item.price, true)}</span>
                                    <button onClick={() => openModal(item)} className="bg-ocean-900 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md hover:bg-luxury-amber-500 transition-colors">Detail</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* --- MODAL DETAIL --- */}
            {selectedItem && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200" onClick={() => setSelectedItem(null)}>
                    <div className="bg-white w-full max-w-2xl rounded-[3rem] overflow-hidden relative shadow-2xl flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => setSelectedItem(null)} className="absolute top-6 right-6 z-[10000] bg-white/80 p-3 rounded-full hover:bg-red-500 hover:text-white transition-all shadow-lg active:scale-90"><X size={24} /></button>
                        <div className="p-8 flex-1 overflow-y-auto custom-scrollbar">
                            <h2 className="text-2xl font-serif font-bold text-ocean-900 mb-6 text-center">{selectedItem.title}</h2>
                            <div className="relative group aspect-[4/3] bg-slate-50 rounded-2xl overflow-hidden shadow-inner border border-slate-100">
                                {/* LABEL PITA DI MODAL (Opsional, agar konsisten) */}
                                <div className={`absolute top-0 left-0 px-4 py-1.5 rounded-br-2xl text-[10px] font-black uppercase tracking-wider text-white shadow-lg z-20 ${getRibbonClass(selectedItem.category)}`}>
                                    {selectedItem.category}
                                </div>

                                <div className="absolute top-4 right-4 z-20 flex gap-2">
                                    <button onClick={() => setCurrentSlide(0)} className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-md transition-all ${currentSlide === 0 ? 'bg-luxury-amber-500 text-white' : 'bg-white text-slate-400 hover:text-ocean-900'}`}>Depan</button>
                                    <button onClick={() => setCurrentSlide(1)} className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-md transition-all ${currentSlide === 1 ? 'bg-luxury-amber-500 text-white' : 'bg-white text-slate-400 hover:text-ocean-900'}`}>Belakang</button>
                                </div>
                                <div className="flex w-full h-full transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
                                    <div className="w-full h-full flex-shrink-0 flex items-center justify-center p-4">
                                        <img src={getImgUrl(selectedItem.imageFront || selectedItem.imagePath, selectedItem.id)} className="max-w-full max-h-full object-contain drop-shadow-lg" alt="Front" onError={(e) => e.target.src = 'https://via.placeholder.com/400x300?text=Gambar+Depan+Kosong'} />
                                    </div>
                                    <div className="w-full h-full flex-shrink-0 flex items-center justify-center p-4">
                                        <img src={getImgUrl(selectedItem.imageBack || selectedItem.imagePath, selectedItem.id)} className="max-w-full max-h-full object-contain drop-shadow-lg" alt="Back" onError={(e) => e.target.src = 'https://via.placeholder.com/400x300?text=Gambar+Belakang+Kosong'} />
                                    </div>
                                </div>
                                <button onClick={() => setCurrentSlide(0)} className={`absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/80 shadow-lg transition hover:scale-110 ${currentSlide === 0 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}><ChevronLeft size={24} /></button>
                                <button onClick={() => setCurrentSlide(1)} className={`absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/80 shadow-lg transition hover:scale-110 ${currentSlide === 1 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}><ChevronRight size={24} /></button>
                            </div>
                            <div className="mt-8 text-center px-4">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-luxury-amber-600 block mb-2">{currentSlide === 0 ? 'Tampilan Luar' : 'Tampilan Dalam'}</span>
                                <p className="text-sm text-slate-500 italic leading-relaxed">"{selectedItem.desc}"</p>
                            </div>
                        </div>
                        <div className="p-8 border-t bg-slate-50 flex flex-col sm:flex-row justify-between items-center gap-4">
                            <div className="flex items-center gap-4 w-full sm:w-auto">
                                <div className="flex flex-col">
                                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Harga Estimasi</span>
                                    <span className={`text-2xl font-bold ${currentUser ? 'text-ocean-900' : 'text-slate-300'}`}>{renderPrice(selectedItem.price, true)}</span>
                                </div>
                                {currentUser?.role === 'admin' && selectedItem.catalogFilePath && (
                                    <a href={`${API_BASE_URL}/uploads/${selectedItem.catalogFilePath}`} download className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-green-700 transition-all shadow-md active:scale-95 ml-auto sm:ml-4"><Download size={14} /> Master File</a>
                                )}
                            </div>
                            {currentUser ? (
                                <Link to={`/order/${selectedItem.id}`} className="bg-ocean-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-luxury-amber-500 transition-all shadow-lg active:scale-95 w-full sm:w-auto text-center">Pesan Sekarang</Link>
                            ) : (
                                <Link to="/login" className="bg-luxury-amber-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-luxury-amber-700 transition w-full sm:w-auto text-center">Login untuk Pesan</Link>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Home;