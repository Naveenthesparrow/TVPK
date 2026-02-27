import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import GalleryEditorModal from './GalleryEditorModal';
import { X, Pencil, Trash2 } from 'lucide-react';

const GalleryItem = ({ title, img, onClick, language }) => (
    <div
        className="bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-primary/5 transition-all cursor-pointer group transform hover:-translate-y-2"
        onClick={onClick}
    >
        <div className="aspect-[4/3] bg-slate-100 flex items-center justify-center overflow-hidden relative">
            <img src={img} alt={title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-8">
                <span className="text-white text-xs font-black uppercase tracking-widest font-header">View Details</span>
            </div>
        </div>
        <div className="p-4">
            <h3 className={`text-base md:text-base font-black text-slate-900 line-clamp-2 leading-tight group-hover:text-primary transition-colors ${language === 'ta' ? 'font-tamil' : 'font-header'}`}>
                {title}
            </h3>
        </div>
    </div>
);

const Gallery = () => {
    const { t, i18n } = useTranslation();
    const currentLang = (i18n.resolvedLanguage || i18n.language || 'en').split('-')[0];
    const [selectedItem, setSelectedItem] = useState(null);

    const [galleryItems, setGalleryItems] = useState(() => {
        try { const fallback = t('gallery.items', { returnObjects: true, lng: currentLang }); return Array.isArray(fallback) ? fallback : []; } catch { return []; }
    });

    useEffect(() => {
        const onOpen = (e) => {
            const d = e?.detail; if (!d) return;
            if (d.section === 'gallery') {
                openEditor(d.item || null, typeof d.index === 'number' ? d.index : null);
            }
        };
        window.addEventListener('tvpk-admin-open', onOpen);
        return () => window.removeEventListener('tvpk-admin-open', onOpen);

        let mounted = true;
        const api = import.meta.env.VITE_API_URL || '';
        const token = localStorage.getItem('tvpk_token');
        (async () => {
            try {
                const r = await fetch(`${api}/admin/content`, { headers: { Authorization: `Bearer ${token}` } });
                const j = await r.json();
                if (!mounted) return;
                const doc = j.content || {};
                if (Array.isArray(doc.gallery)) setGalleryItems(doc.gallery);
            } catch (e) {
                // keep translations fallback
            }
        })();

        const onUpdate = (e) => {
            if (!e?.detail) return;
            const { section, content } = e.detail;
            if (section === 'gallery') setGalleryItems(Array.isArray(content) ? content : []);
        };
        window.addEventListener('tvpk-content-updated', onUpdate);
        return () => { mounted = false; window.removeEventListener('tvpk-content-updated', onUpdate); };
    }, []);

    const [isAdmin, setIsAdmin] = useState(false);
    const [editorOpen, setEditorOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [editingIndex, setEditingIndex] = useState(null);

    useEffect(() => {
        try { const u = JSON.parse(localStorage.getItem('tvpk_user')); setIsAdmin(!!u && u.role === 'admin'); } catch { setIsAdmin(false); }
    }, []);

    const openEditor = (item, idx) => { setEditingItem(item); setEditingIndex(typeof idx === 'number' ? idx : null); setEditorOpen(true); };

    const closeEditor = () => { setEditorOpen(false); setEditingItem(null); setEditingIndex(null); };

    const saveItem = async (data, idx) => {
        // fetch current content, update gallery array, POST focus=gallery
        const api = import.meta.env.VITE_API_URL || '';
        const token = localStorage.getItem('tvpk_token');
        try {
            const r = await fetch(`${api}/admin/content`, { headers: { Authorization: `Bearer ${token}` } });
            const j = await r.json();
            const doc = j.content || {};
            const arr = Array.isArray(doc.gallery) ? doc.gallery.slice() : [];
            if (typeof idx === 'number') arr[idx] = { ...arr[idx], ...data };
            else arr.push(data);
            const res = await fetch(`${api}/admin/content`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ content: arr, focus: 'gallery' }) });
            const out = await res.json();
            if (!res.ok) return alert(out.error || 'Save failed');
            window.dispatchEvent(new CustomEvent('tvpk-content-updated', { detail: { section: 'gallery', content: out.content.gallery } }));
            closeEditor();
        } catch (e) { alert('Save failed'); }
    };

    const deleteItem = async (idx) => {
        if (!confirm('Delete this gallery item?')) return;
        const api = import.meta.env.VITE_API_URL || '';
        const token = localStorage.getItem('tvpk_token');
        try {
            const r = await fetch(`${api}/admin/content`, { headers: { Authorization: `Bearer ${token}` } });
            const j = await r.json();
            const doc = j.content || {};
            const arr = Array.isArray(doc.gallery) ? doc.gallery.slice() : [];
            arr.splice(idx, 1);
            const res = await fetch(`${api}/admin/content`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ content: arr, focus: 'gallery' }) });
            const out = await res.json();
            if (!res.ok) return alert(out.error || 'Delete failed');
            window.dispatchEvent(new CustomEvent('tvpk-content-updated', { detail: { section: 'gallery', content: out.content.gallery } }));
        } catch (e) { alert('Delete failed'); }
    };

    return (
        <div className="bg-slate-50/30 py-24 min-h-screen relative group">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                <div className="text-center mb-20">
                    <h1 className={`text-3xl md:text-6xl font-black text-slate-900 mb-6 tracking-tighter uppercase ${currentLang === 'ta' ? 'font-tamil' : 'font-header'}`}>
                        {t('gallery.title', { lng: currentLang })}
                    </h1>
                    <p className="text-slate-500 text-base md:text-lg max-w-2xl mx-auto font-medium leading-relaxed">
                        {t('gallery.subtitle', { lng: currentLang })}
                    </p>
                    <div className="h-1.5 w-24 bg-primary mx-auto rounded-full mt-10 opacity-30"></div>
                </div>

                <div className="flex justify-end mb-6">
                    {isAdmin && <button onClick={() => openEditor(null, null)} className="px-4 py-2 bg-primary text-white rounded">Add Gallery Item</button>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                    {Array.isArray(galleryItems) && galleryItems.map((item, index) => (
                        <div key={index} className="relative">
                            {isAdmin && (
                                <div className="absolute top-3 right-3 flex gap-2 z-40">
                                    <button onClick={() => openEditor(item, index)} className="bg-white rounded-full p-2 shadow hover:bg-primary/5 transition" title="Edit gallery item" aria-label="Edit gallery item">
                                        <Pencil size={16} className="text-slate-700" />
                                    </button>
                                    <button onClick={() => deleteItem(index)} className="bg-white rounded-full p-2 shadow hover:bg-red-50 transition" title="Delete gallery item" aria-label="Delete gallery item">
                                        <Trash2 size={16} className="text-rose-600" />
                                    </button>
                                </div>
                            )}
                            <GalleryItem
                                title={(typeof item.title === 'object' && item.title) ? (item.title[currentLang] || item.title.en || item.title.ta) : item.title}
                                img={item.img}
                                onClick={() => setSelectedItem(item)}
                                language={currentLang}
                            />
                        </div>
                    ))}
                </div>

                <GalleryEditorModal open={editorOpen} onClose={closeEditor} item={editingItem} index={editingIndex} onSave={saveItem} onDelete={(i) => { deleteItem(i); closeEditor(); }} />

                {/* Modal / Lightbox */}
                {selectedItem && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 md:p-12 animate-in fade-in duration-300">
                        {/* Overlay */}
                        <div
                            className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl"
                            onClick={() => setSelectedItem(null)}
                        ></div>

                        {/* Modal Content */}
                        <div className="relative bg-white rounded-[3rem] shadow-2xl max-w-5xl w-full overflow-hidden animate-in slide-in-from-bottom-10 zoom-in-95 duration-500">
                            <button
                                className="absolute top-8 right-8 text-slate-400 hover:text-primary transition-all z-20 p-3 bg-slate-50 rounded-2xl hover:bg-primary/5 hover:rotate-90"
                                onClick={() => setSelectedItem(null)}
                            >
                                <X size={24} />
                            </button>

                            <div className="flex flex-col lg:flex-row h-full">
                                <div className="lg:w-3/5 bg-slate-100 flex items-center justify-center p-0">
                                    <img src={selectedItem.img} alt={selectedItem.title} className="w-full h-full object-cover aspect-video lg:aspect-auto lg:h-[70vh]" />
                                </div>
                                <div className="lg:w-2/5 p-6 md:p-16 flex flex-col justify-center">
                                    <div className="mb-10">
                                        <span className="text-primary font-black text-xs uppercase tracking-[0.3em] font-header block mb-4">Media Archive</span>
                                        <h2 className={`text-2xl md:text-4xl font-black text-slate-900 mb-6 leading-tight ${i18n.language === 'ta' ? 'font-tamil' : 'font-header'}`}>{selectedItem.title}</h2>
                                        <div className="h-1 w-16 bg-primary rounded-full mb-10"></div>
                                        <p className="text-slate-500 text-base leading-relaxed font-medium italic">
                                            {selectedItem.desc}
                                        </p>
                                    </div>

                                    <button
                                        className="w-full py-5 bg-slate-900 text-white rounded-2xl text-sm font-black uppercase tracking-[0.2em] font-header hover:bg-primary transition-all shadow-xl shadow-slate-200"
                                        onClick={() => setSelectedItem(null)}
                                    >
                                        {t('gallery.close')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default Gallery;
