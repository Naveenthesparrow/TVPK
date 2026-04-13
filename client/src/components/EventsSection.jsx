import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
// AdminBadge removed
import { ChevronRight, Pencil, Trash2 } from 'lucide-react';
import { isAdmin } from '../utils/adminHelpers';
import EventEditorModal from './EventEditorModal';
import React from 'react';

const EventItem = ({ title, date, month, index, to }) => {
    const admin = isAdmin();
    const isClickable = Boolean(to);
    const rowClass = `relative flex items-center justify-between p-5 border-b border-slate-100 transition-colors group ${isClickable ? 'hover:bg-slate-50 cursor-pointer' : 'cursor-default'}`;

    const content = (
        <div className={rowClass}>
            {admin && (
                <div className="absolute top-2 right-3 z-40 flex gap-2">
                    <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.dispatchEvent(new CustomEvent('tvpk-admin-edit', { detail: { section: 'events', index, item: { title, date, month } } })); }} className="bg-white rounded-full p-2 shadow hover:bg-primary/5 transition" title="Edit event"><Pencil size={14} className="text-slate-700"/></button>
                    <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.dispatchEvent(new CustomEvent('tvpk-admin-delete', { detail: { section: 'events', index } })); }} className="bg-white rounded-full p-2 shadow hover:bg-red-50 transition" title="Delete event"><Trash2 size={14} className="text-rose-600"/></button>
                </div>
            )}
            <div className="flex items-center gap-6">
                <div className="flex flex-col items-center justify-center bg-primary text-white w-16 h-16 rounded-2xl shrink-0 shadow-lg shadow-primary/20">
                    <span className="text-[10px] font-black uppercase tracking-widest font-header">{month}</span>
                    <span className="text-2xl font-black leading-none font-header">{date}</span>
                </div>
                <h4 className="font-header font-black text-lg text-slate-800 transition-colors tracking-tight">{title}</h4>
            </div>
            <ChevronRight className={`transition-colors shrink-0 ${isClickable ? 'text-slate-300 group-hover:text-primary' : 'text-slate-200'}`} />
        </div>
    );

    if (!isClickable) {
        return <div className="block">{content}</div>;
    }

    return (
    <Link to={to} className="block">
        {content}
    </Link>
    );
};

const EventsSection = () => {
    const { t, i18n } = useTranslation();
    const currentLang = (i18n.resolvedLanguage || i18n.language || 'en').split('-')[0];
    const [editorOpen, setEditorOpen] = React.useState(false);
    const [editingItem, setEditingItem] = React.useState(null);
    const [editingIndex, setEditingIndex] = React.useState(null);
    const [events, setEvents] = React.useState(() => {
        try { const arr = t('upcoming_events.items', { returnObjects: true, lng: currentLang }); return Array.isArray(arr) ? arr : []; } catch { return []; }
    });

    const normalizeTitle = (value) => {
        if (typeof value === 'string') return value.toLowerCase().trim();
        if (value && typeof value === 'object') {
            const merged = `${value.en || ''} ${value.ta || ''}`;
            return merged.toLowerCase().trim();
        }
        return '';
    };

    const sanitizeEvents = (arr) => {
        if (!Array.isArray(arr)) return [];
        return arr.filter((ev) => {
            const title = normalizeTitle(ev?.title);
            return !title.includes('farmers conference') && !title.includes('விவசாயிகள் மாநாடு');
        });
    };

    const fallbackEvents = [
        {
            title: t('upcoming_events.event1.title', { lng: currentLang }),
            day: t('upcoming_events.event1.day', { lng: currentLang }),
            month: t('upcoming_events.event1.month', { lng: currentLang }),
            to: '',
        },
        {
            title: t('upcoming_events.event2.title', { lng: currentLang }),
            day: t('upcoming_events.event2.day', { lng: currentLang }),
            month: t('upcoming_events.event2.month', { lng: currentLang }),
            to: '',
        },
        {
            title: t('upcoming_events.event3.title', { lng: currentLang }),
            day: t('upcoming_events.event3.day', { lng: currentLang }),
            month: t('upcoming_events.event3.month', { lng: currentLang }),
            to: '',
        },
    ];

    React.useEffect(() => {
        const onOpen = (e) => {
            const d = e?.detail; if (!d) return;
            if (d.section === 'events') {
                setEditingItem(d.item || null);
                setEditingIndex(typeof d.index === 'number' ? d.index : null);
                setEditorOpen(true);
            }
        };
        window.addEventListener('tvpk-admin-open', onOpen);
        return () => window.removeEventListener('tvpk-admin-open', onOpen);
    }, []);

    React.useEffect(() => {
        const api = import.meta.env.VITE_API_URL || '';
        const token = localStorage.getItem('tvpk_token');
        let mounted = true;
        (async () => {
            try {
                const r = await fetch(`${api}/admin/content`, { headers: { Authorization: `Bearer ${token}` } });
                const j = await r.json();
                if (!mounted) return;
                const doc = j.content || {};
                if (Array.isArray(doc.events)) setEvents(sanitizeEvents(doc.events));
            } catch (e) {}
        })();

        const onUpdate = (e) => { if (!e?.detail) return; const { section, content } = e.detail; if (section === 'events') setEvents(sanitizeEvents(Array.isArray(content) ? content : [])); };
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
            const arr = Array.isArray(doc.events) ? doc.events.slice() : [];
            if (typeof idx === 'number') arr[idx] = { ...arr[idx], ...data };
            else arr.push(data);
            const res = await fetch(`${api}/admin/content`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ content: arr, focus: 'events' }) });
            const out = await res.json();
            if (!res.ok) return alert(out.error || 'Save failed');
            window.dispatchEvent(new CustomEvent('tvpk-content-updated', { detail: { section: 'events', content: out.content.events } }));
            closeEditor();
        } catch (e) { alert('Save failed'); }
    };

    const deleteItem = async (idx) => {
        if (!confirm('Delete this event?')) return;
        const api = import.meta.env.VITE_API_URL || '';
        const token = localStorage.getItem('tvpk_token');
        try {
            const r = await fetch(`${api}/admin/content`, { headers: { Authorization: `Bearer ${token}` } });
            const j = await r.json();
            const doc = j.content || {};
            const arr = Array.isArray(doc.events) ? doc.events.slice() : [];
            arr.splice(idx, 1);
            const res = await fetch(`${api}/admin/content`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ content: arr, focus: 'events' }) });
            const out = await res.json();
            if (!res.ok) return alert(out.error || 'Delete failed');
            window.dispatchEvent(new CustomEvent('tvpk-content-updated', { detail: { section: 'events', content: out.content.events } }));
        } catch (e) { alert('Delete failed'); }
    };

    return (
        <section className="py-20 bg-slate-50 relative group">
            <div className="max-w-4xl mx-auto px-4">
                <div className="text-center mb-12">
                    <h1 className={`text-5xl md:text-7xl font-black text-slate-900 mb-4 uppercase tracking-tight ${currentLang === 'ta' ? 'font-tamil' : 'font-header'}`}>
                        {t('upcoming_events.title', { lng: currentLang })}
                    </h1>
                    <div className="h-1.5 w-24 bg-primary mx-auto rounded-full mt-6 opacity-30"></div>
                </div>
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-100">
                    {events.length ? events.map((ev, i) => (
                        <EventItem key={i} title={(typeof ev.title === 'object' && ev.title) ? (ev.title[currentLang] || ev.title.en || ev.title.ta) : ev.title} date={ev.date} month={ev.month} index={i} to={ev.to || ''} />
                    )) : (
                        fallbackEvents.map((ev, i) => (
                            <EventItem key={`fallback-${i}`} title={ev.title} date={ev.day} month={ev.month} index={i} to={ev.to} />
                        ))
                    )}
                </div>
            </div>
            <EventEditorModal open={editorOpen} onClose={closeEditor} item={editingItem} index={editingIndex} onSave={saveItem} onDelete={(i) => { deleteItem(i); closeEditor(); }} />
        </section>
    );
};

export default EventsSection;
