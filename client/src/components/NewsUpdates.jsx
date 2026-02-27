import { useTranslation } from 'react-i18next';
// AdminBadge removed
import { Calendar, Tag, ChevronRight, Clock, Pencil, Trash2 } from 'lucide-react';
import { isAdmin } from '../utils/adminHelpers';
import React from 'react';
import NewsEditorModal from './NewsEditorModal';
import { Link } from 'react-router-dom';

// Unique images per card index — different photos for each news story
const CARD_IMAGES = [
    'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?q=80&w=600&h=350&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1540910419892-f0c74b045366?q=80&w=600&h=350&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?q=80&w=600&h=350&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=600&h=350&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1574943320219-553eb213f72d?q=80&w=600&h=350&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1524178232363-1fb28f74b0cd?q=80&w=600&h=350&auto=format&fit=crop',
];

const NewsCard = ({ category, title, date, desc, readMoreText, language, index }) => (
    <Link to={`/news/${index}`} className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-md hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 group transform hover:-translate-y-1 flex flex-col">
        <div className="aspect-video relative overflow-hidden shrink-0">
            <img
                src={CARD_IMAGES[index % CARD_IMAGES.length]}
                alt={title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute top-4 left-4 bg-primary text-white text-[10px] font-extrabold px-3 py-1.5 rounded-lg uppercase tracking-widest font-header shadow-lg">
                {category}
            </div>
        </div>
        <div className="p-6 flex flex-col flex-grow">
            <div className="flex items-center gap-2 text-slate-400 text-[10px] mb-3 uppercase font-extrabold tracking-widest font-header">
                <Calendar size={11} className="text-primary/60" />
                {date}
            </div>
            <h3 className={`text-base font-extrabold text-slate-900 mb-3 line-clamp-2 group-hover:text-primary transition-colors leading-snug tracking-tight flex-grow ${language === 'ta' ? 'font-tamil' : 'font-header'}`}>
                {title}
            </h3>
            <p className="text-slate-500 text-sm leading-relaxed mb-5 line-clamp-2 font-medium">
                {desc}
            </p>
            <div className="flex items-center gap-2 text-[11px] font-extrabold text-primary border border-primary/20 rounded-lg px-4 py-2.5 transition-all uppercase tracking-[0.15em] font-header self-start">
                <span>{readMoreText}</span>
                <ChevronRight size={12} />
            </div>
        </div>
    </Link>
);

const SidebarItem = ({ title, date, language }) => (
    <div className="border-b border-slate-50 py-4 last:border-0 hover:bg-slate-50/80 transition-all cursor-pointer group px-2 rounded-lg">
        <div className="flex flex-col gap-1.5">
            <span className="text-[10px] text-primary font-extrabold uppercase tracking-widest font-header flex items-center gap-1.5">
                <Clock size={10} /> {date}
            </span>
            <h4 className={`text-[13px] font-extrabold text-slate-700 line-clamp-2 leading-snug group-hover:text-primary transition-colors ${language === 'ta' ? 'font-tamil' : 'font-header'}`}>
                {title}
            </h4>
        </div>
    </div>
);

const NewsUpdates = () => {
    const { t, i18n } = useTranslation();

    const [editorOpen, setEditorOpen] = React.useState(false);
    const [editingItem, setEditingItem] = React.useState(null);
    const [editingIndex, setEditingIndex] = React.useState(null);

    React.useEffect(() => {
        const onOpen = (e) => {
            const d = e?.detail; if (!d) return;
            if (d.section === 'news') {
                setEditingItem(d.item || null);
                setEditingIndex(typeof d.index === 'number' ? d.index : null);
                setEditorOpen(true);
            }
        };
        window.addEventListener('tvpk-admin-open', onOpen);
        return () => window.removeEventListener('tvpk-admin-open', onOpen);
    }, []);

    const rawLang = i18n?.resolvedLanguage || i18n?.language || 'en';
    const currentLang = String(rawLang).split('-')[0];

    const newsItems = Array.isArray(t('news.items', { returnObjects: true, lng: currentLang }))
        ? t('news.items', { returnObjects: true, lng: currentLang }) : [];
    const sidebarItems = Array.isArray(t('news.sidebar_items', { returnObjects: true, lng: currentLang }))
        ? t('news.sidebar_items', { returnObjects: true, lng: currentLang }) : [];
    const categoriesList = Array.isArray(t('news.categories_list', { returnObjects: true, lng: currentLang }))
        ? t('news.categories_list', { returnObjects: true, lng: currentLang }) : [];
    const tagsList = Array.isArray(t('news.tags_list', { returnObjects: true, lng: currentLang }))
        ? t('news.tags_list', { returnObjects: true, lng: currentLang }) : [];

    return (
        <div className="bg-slate-50/30 py-24 relative group">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Page Header */}
                <div className="text-center mb-20">
                    <h1 className={`text-4xl md:text-6xl font-black text-slate-900 mb-6 tracking-tighter uppercase ${currentLang === 'ta' ? 'font-tamil' : 'font-header'}`}>
                        {t('news.title', { lng: currentLang })}
                    </h1>
                    <div className="h-1.5 w-24 bg-primary mx-auto rounded-full opacity-30"></div>
                </div>

                {/* Main: News Grid + Sidebar */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* News Grid — 2 column */}
                    <div className="lg:col-span-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {newsItems.map((item, index) => (
                                <div key={index} className="relative">
                                    {isAdmin() && (
                                        <div className="absolute top-3 right-3 z-40 flex gap-2">
                                            <button onClick={() => window.dispatchEvent(new CustomEvent('tvpk-admin-edit', { detail: { section: 'news', index, item } }))} className="bg-white rounded-full p-2 shadow hover:bg-primary/5 transition" title="Edit news"><Pencil size={16} className="text-slate-700"/></button>
                                            <button onClick={() => window.dispatchEvent(new CustomEvent('tvpk-admin-delete', { detail: { section: 'news', index } }))} className="bg-white rounded-full p-2 shadow hover:bg-red-50 transition" title="Delete news"><Trash2 size={16} className="text-rose-600"/></button>
                                        </div>
                                    )}
                                    <NewsCard
                                        index={index}
                                        category={item.category}
                                        title={item.title}
                                        date={item.date}
                                        desc={item.desc}
                                        readMoreText={t('news.read_more', { lng: currentLang })}
                                        language={currentLang}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-4 space-y-6">

                        {/* Recent Updates */}
                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-md">
                            <h3 className="text-xs font-extrabold text-slate-900 mb-5 uppercase tracking-[0.25em] font-header flex items-center gap-2.5">
                                <span className="w-2 h-2 bg-primary rounded-full animate-pulse shrink-0"></span>
                                {t('news.sidebar.recent')}
                            </h3>
                            <div className="space-y-0">
                                {sidebarItems.map((item, index) => (
                                    <SidebarItem key={index} title={item.title} date={item.date} language={currentLang} />
                                ))}
                            </div>
                        </div>

                        {/* Categories */}
                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-md">
                            <h3 className="text-xs font-extrabold text-slate-900 mb-5 uppercase tracking-[0.25em] font-header">
                                {t('news.sidebar.categories')}
                            </h3>
                            <div className="flex flex-col gap-2">
                                {categoriesList.map((cat, index) => (
                                    <button key={index} className="text-left text-[12px] font-extrabold text-slate-500 hover:text-primary transition-all cursor-pointer uppercase tracking-wide font-header py-1.5 border-b border-slate-50 last:border-0 hover:pl-2 transition-all duration-200">
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Tags */}
                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-md">
                            <h3 className="text-xs font-extrabold text-slate-900 mb-5 uppercase tracking-[0.25em] font-header">
                                {t('news.sidebar.tags')}
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {tagsList.map((tag, index) => (
                                    <span key={index} className="text-[11px] font-extrabold text-slate-500 hover:text-white hover:bg-primary border border-slate-200 hover:border-primary px-3 py-1.5 rounded-lg transition-all cursor-pointer uppercase tracking-wider font-header flex items-center gap-1">
                                        <Tag size={10} />
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
                <NewsEditorModal open={editorOpen} onClose={() => { setEditorOpen(false); setEditingItem(null); setEditingIndex(null); }} item={editingItem} index={editingIndex} onSave={async (data, idx) => {
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
                        setEditorOpen(false); setEditingItem(null); setEditingIndex(null);
                    } catch (e) { alert('Save failed'); }
                }} onDelete={async (idx) => {
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
                        setEditorOpen(false); setEditingItem(null); setEditingIndex(null);
                    } catch (e) { alert('Delete failed'); }
                }} />
            </div>
        </div>
    );
};

export default NewsUpdates;
