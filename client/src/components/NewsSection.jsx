import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import NewsEditorModal from './NewsEditorModal';
import { Pencil, Trash2 } from 'lucide-react';

const NewsCard = ({ title, desc, date, image, index }) => (
    <Link to={`/news/${index}`} className="block h-full">
        <div className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 h-full flex flex-col group border border-slate-100 hover:-translate-y-1">
            <div className="h-40 sm:h-48 bg-slate-100 relative shrink-0 overflow-hidden">
                <div className="absolute top-3 left-3 bg-primary text-white text-xs px-3 py-1.5 rounded-xl z-10 font-bold tracking-wide shadow-lg">
                    {date}
                </div>
                {image ? (
                    <img src={image} alt={title} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300 text-sm font-medium tracking-wider uppercase">
                        Image Placeholder
                    </div>
                )}
            </div>
            <div className="p-5 flex-grow">
                <h3 className="font-header font-black text-lg text-slate-900 mb-2 line-clamp-2 group-hover:text-primary transition-colors tracking-tight">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed line-clamp-3 font-medium">{desc}</p>
            </div>
        </div>
    </Link>
);

const NewsSection = () => {
    const { t, i18n } = useTranslation();
    const currentLang = (i18n.resolvedLanguage || i18n.language || 'en').split('-')[0];

    const [newsItems, setNewsItems] = React.useState(() => {
        try { const arr = t('news.items', { returnObjects: true, lng: currentLang }); return Array.isArray(arr) ? arr : [];} catch { return []; }
    });
    const fallbackNews = React.useMemo(() => {
        try { const arr = t('news.items', { returnObjects: true, lng: currentLang }); return Array.isArray(arr) ? arr : []; } catch { return []; }
    }, [t, currentLang]);

    const pick = (item, field, idx) => {
        try {
            if (!item) return '';
            const v = item[field];
            if (typeof v === 'object' && v !== null) return v[currentLang] || v.en || v.ta || '';
            const fb = fallbackNews?.[idx]?.[field];
            if (typeof v === 'string' && v.trim() !== '') {
                if (typeof fb === 'string' && fb.trim() !== '') return fb;
                return v;
            }
            if (typeof fb === 'string' && fb.trim() !== '') return fb;
            return '';
        } catch (e) { return '' }
    };

    const [isAdmin, setIsAdmin] = React.useState(false);
    const [editorOpen, setEditorOpen] = React.useState(false);
    const [editingItem, setEditingItem] = React.useState(null);
    const [editingIndex, setEditingIndex] = React.useState(null);

    React.useEffect(() => {
        try { const u = JSON.parse(localStorage.getItem('tvpk_user')); setIsAdmin(!!u && u.role === 'admin'); } catch { setIsAdmin(false); }
    }, []);

    React.useEffect(() => {
        const onOpen = (e) => {
            const d = e?.detail; if (!d) return;
            if (d.section === 'news') {
                openEditor(d.item || null, typeof d.index === 'number' ? d.index : null);
            }
        };
        window.addEventListener('tvpk-admin-open', onOpen);
        return () => window.removeEventListener('tvpk-admin-open', onOpen);

        const api = import.meta.env.VITE_API_URL || '';
        const token = localStorage.getItem('tvpk_token');
        let mounted = true;
        (async () => {
            try {
                const r = await fetch(`${api}/admin/content`, { headers: { Authorization: `Bearer ${token}` } });
                const j = await r.json();
                if (!mounted) return;
                const doc = j.content || {};
                if (Array.isArray(doc.news)) setNewsItems(doc.news);
            } catch (e) {}
        })();

        const onUpdate = (e) => { if (!e?.detail) return; const { section, content } = e.detail; if (section === 'news') setNewsItems(Array.isArray(content) ? content : []); };
        window.addEventListener('tvpk-content-updated', onUpdate);
        return () => { mounted = false; window.removeEventListener('tvpk-content-updated', onUpdate); };
    }, []);

    const openEditor = (item, idx) => { setEditingItem(item); setEditingIndex(typeof idx === 'number' ? idx : null); setEditorOpen(true); };
    const closeEditor = () => { setEditorOpen(false); setEditingItem(null); setEditingIndex(null); };

    const saveItem = async (data, idx) => {
        const api = import.meta.env.VITE_API_URL || '';
        const token = localStorage.getItem('tvpk_token');
        try {
            const r = await fetch(`${api}/admin/content`, { headers: { Authorization: `Bearer ${token}` } });
            const j = await r.json();
            const doc = j.content || {};
            const arr = Array.isArray(doc.news) ? doc.news.slice() : [];
            if (typeof idx === 'number') arr[idx] = { ...arr[idx], ...data };
            else arr.push(data);
            const res = await fetch(`${api}/admin/content`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ content: arr, focus: 'news' }) });
            const out = await res.json();
            if (!res.ok) return alert(out.error || 'Save failed');
            window.dispatchEvent(new CustomEvent('tvpk-content-updated', { detail: { section: 'news', content: out.content.news } }));
            closeEditor();
        } catch (e) { alert('Save failed'); }
    };

    const deleteItem = async (idx) => {
        if (!confirm('Delete this news item?')) return;
        const api = import.meta.env.VITE_API_URL || '';
        const token = localStorage.getItem('tvpk_token');
        try {
            const r = await fetch(`${api}/admin/content`, { headers: { Authorization: `Bearer ${token}` } });
            const j = await r.json();
            const doc = j.content || {};
            const arr = Array.isArray(doc.news) ? doc.news.slice() : [];
            arr.splice(idx, 1);
            const res = await fetch(`${api}/admin/content`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ content: arr, focus: 'news' }) });
            const out = await res.json();
            if (!res.ok) return alert(out.error || 'Delete failed');
            window.dispatchEvent(new CustomEvent('tvpk-content-updated', { detail: { section: 'news', content: out.content.news } }));
        } catch (e) { alert('Delete failed'); }
    };

    return (
        <section className="py-20 bg-white relative group">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h1 className={`text-5xl md:text-7xl font-black text-slate-900 mb-4 uppercase tracking-tight ${currentLang === 'ta' ? 'font-tamil' : 'font-header'}`}>
                        {t('recent_news.title', { lng: currentLang })}
                    </h1>
                    <div className="h-1.5 w-24 bg-primary mx-auto rounded-full mt-6 opacity-30"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {newsItems.map((item, index) => (
                        <div key={index} className="relative">
                            {isAdmin && (
                                <div className="absolute top-3 right-3 z-40 flex gap-2">
                                    <button onClick={() => openEditor(item, index)} className="bg-white rounded-full p-2 shadow hover:bg-primary/5 transition" title="Edit item" aria-label="Edit item">
                                        <Pencil size={16} className="text-slate-700" />
                                    </button>
                                    <button onClick={() => deleteItem(index)} className="bg-white rounded-full p-2 shadow hover:bg-red-50 transition" title="Delete item" aria-label="Delete item">
                                        <Trash2 size={16} className="text-rose-600" />
                                    </button>
                                </div>
                            )}
                            <NewsCard index={index} title={pick(item, 'title', index)} desc={pick(item, 'desc', index)} date={item.date || item.displayDate || item.date_display || ''} image={item.image || item.img || null} />
                        </div>
                    ))}
                </div>
            </div>
            <NewsEditorModal open={editorOpen} onClose={closeEditor} item={editingItem} index={editingIndex} onSave={saveItem} onDelete={(i) => { deleteItem(i); closeEditor(); }} />
        </section>
    );
};

export default NewsSection;
