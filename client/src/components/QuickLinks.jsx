import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import QuickLinkEditorModal from './QuickLinkEditorModal';
import { Pencil, Trash2 } from 'lucide-react';
// AdminBadge removed
import { Users, BookOpen, Volume2, Link as LinkIcon, Camera, Phone, Heart } from 'lucide-react';

const QuickLinkCard = ({ icon: Icon, title, desc, to }) => {
    const { i18n } = useTranslation();
    const rawLang = i18n?.resolvedLanguage || i18n?.language || 'en';
    const lang = String(rawLang).split('-')[0];
    const titleText = typeof title === 'object' && title !== null ? (title[lang] || title.en || title.ta || '') : title || '';
    const descText = typeof desc === 'object' && desc !== null ? (desc[lang] || desc.en || desc.ta || '') : desc || '';
    return (
    <Link to={to} className="block">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-lg hover:-translate-y-1 hover:border-primary/20 transition-all duration-300 text-center cursor-pointer group h-full">
            <div className="w-14 h-14 bg-red-50 text-primary rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-sm group-hover:shadow-lg group-hover:shadow-primary/20">
                <Icon size={26} />
            </div>
            <h4 className="font-header font-black text-lg text-slate-900 mb-2 tracking-tight">{titleText}</h4>
            <p className="text-slate-400 text-xs font-medium">{descText}</p>
        </div>
    </Link>
    );
};

const QuickLinks = () => {
    const { t, i18n } = useTranslation();
    const currentLang = (i18n.resolvedLanguage || i18n.language || 'en').split('-')[0];

    const [links, setLinks] = React.useState(() => {
        const arr = [];
        try { const a = t('quick_links.items', { returnObjects: true, lng: currentLang }); if (Array.isArray(a)) return a; } catch {};
        // fallback to static mapping (wrap values into bilingual shape)
        const base = [
            { icon: Users, title: t('quick_links.history.title', { lng: currentLang }), desc: t('quick_links.history.desc', { lng: currentLang }), to: '/history' },
            { icon: BookOpen, title: t('quick_links.leadership.title', { lng: currentLang }), desc: t('quick_links.leadership.desc', { lng: currentLang }), to: '/leader' },
            { icon: Volume2, title: t('quick_links.manifesto.title', { lng: currentLang }), desc: t('quick_links.manifesto.desc', { lng: currentLang }), to: '/manifesto' },
            { icon: LinkIcon, title: t('quick_links.news.title', { lng: currentLang }), desc: t('quick_links.news.desc', { lng: currentLang }), to: '/news' },
            { icon: Camera, title: t('quick_links.gallery.title', { lng: currentLang }), desc: t('quick_links.gallery.desc', { lng: currentLang }), to: '/gallery' },
            { icon: Phone, title: t('quick_links.contact.title', { lng: currentLang }), desc: t('quick_links.contact.desc', { lng: currentLang }), to: '/contact' },
            { icon: Heart, title: t('quick_links.donate.title', { lng: currentLang }), desc: t('quick_links.donate.desc', { lng: currentLang }), to: '/donate' },
        ];
        // convert strings into bilingual objects using current i18n as ta fallback
        const toKey = (to, field) => `quick_links.${to.replace('/', '').replace(/^/, '')}.${field}`;
        return base.map(b => ({
            ...b,
            title: { en: typeof b.title === 'string' ? b.title : '', ta: i18n.t(toKey(b.to, 'title'), { lng: 'ta' }) || '' },
            desc: { en: typeof b.desc === 'string' ? b.desc : '', ta: i18n.t(toKey(b.to, 'desc'), { lng: 'ta' }) || '' }
        }));
    });

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
            if (d.section === 'quick_links') {
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
                if (Array.isArray(doc.quick_links)) {
                    // normalize incoming links to bilingual shape
                    const mapping = {
                        '/history': 'history',
                        '/leader': 'leadership',
                        '/manifesto': 'manifesto',
                        '/news': 'news',
                        '/gallery': 'gallery',
                        '/contact': 'contact',
                        '/donate': 'donate'
                    };
                    const normalized = doc.quick_links.map(l => {
                        const titleObj = (typeof l.title === 'object' && l.title !== null) ? l.title : { en: l.title || '', ta: '' };
                        const descObj = (typeof l.desc === 'object' && l.desc !== null) ? l.desc : { en: l.desc || '', ta: '' };
                        const key = mapping[l.to] ? `quick_links.${mapping[l.to]}` : null;
                        if (key) {
                            // if ta missing, try translation fallback
                            if (!titleObj.ta) titleObj.ta = i18n.t(`${key}.title`, { lng: 'ta' }) || '';
                            if (!descObj.ta) descObj.ta = i18n.t(`${key}.desc`, { lng: 'ta' }) || '';
                        }
                        return { ...l, title: titleObj, desc: descObj };
                    });
                    setLinks(normalized);
                }
            } catch (e) {}
        })();

        const onUpdate = (e) => { if (!e?.detail) return; const { section, content } = e.detail; if (section === 'quick_links') setLinks(Array.isArray(content) ? content : []); };
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
            const arr = Array.isArray(doc.quick_links) ? doc.quick_links.slice() : [];
            if (typeof idx === 'number') arr[idx] = { ...arr[idx], ...data };
            else arr.push(data);
            const res = await fetch(`${api}/admin/content`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ content: arr, focus: 'quick_links' }) });
            const out = await res.json();
            if (!res.ok) return alert(out.error || 'Save failed');
            window.dispatchEvent(new CustomEvent('tvpk-content-updated', { detail: { section: 'quick_links', content: out.content.quick_links } }));
            closeEditor();
        } catch (e) { alert('Save failed'); }
    };

    const deleteItem = async (idx) => {
        if (!confirm('Delete this link?')) return;
        const api = import.meta.env.VITE_API_URL || '';
        const token = localStorage.getItem('tvpk_token');
        try {
            const r = await fetch(`${api}/admin/content`, { headers: { Authorization: `Bearer ${token}` } });
            const j = await r.json();
            const doc = j.content || {};
            const arr = Array.isArray(doc.quick_links) ? doc.quick_links.slice() : [];
            arr.splice(idx, 1);
            const res = await fetch(`${api}/admin/content`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ content: arr, focus: 'quick_links' }) });
            const out = await res.json();
            if (!res.ok) return alert(out.error || 'Delete failed');
            window.dispatchEvent(new CustomEvent('tvpk-content-updated', { detail: { section: 'quick_links', content: out.content.quick_links } }));
        } catch (e) { alert('Delete failed'); }
    };

    return (
        <section className="py-20 bg-white relative group">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="font-header font-black text-4xl text-slate-900 text-center mb-16 tracking-tight">{t('quick_links.title', { lng: currentLang })}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {links.map((link, index) => (
                        <div key={index} className="relative">
                            {isAdmin && (
                                <div className="absolute top-3 right-3 z-40 flex gap-2">
                                    <button onClick={() => openEditor(link, index)} className="bg-white rounded-full p-2 shadow hover:bg-primary/5 transition" title="Edit link" aria-label="Edit link">
                                        <Pencil size={16} className="text-slate-700" />
                                    </button>
                                    <button onClick={() => deleteItem(index)} className="bg-white rounded-full p-2 shadow hover:bg-red-50 transition" title="Delete link" aria-label="Delete link">
                                        <Trash2 size={16} className="text-rose-600" />
                                    </button>
                                </div>
                            )}
                            <QuickLinkCard index={index} {...link} />
                        </div>
                    ))}
                </div>
            </div>
            <QuickLinkEditorModal open={editorOpen} onClose={closeEditor} item={editingItem} index={editingIndex} onSave={saveItem} onDelete={(i) => { deleteItem(i); closeEditor(); }} />
        </section>
    );
};

export default QuickLinks;
