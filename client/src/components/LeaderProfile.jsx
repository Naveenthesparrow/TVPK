import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, Facebook, Twitter, Instagram, Youtube, ChevronDown, Pencil, Trash2 } from 'lucide-react';
import { isAdmin } from '../utils/adminHelpers';
import LeaderMediaEditorModal from './LeaderMediaEditorModal';
import LeaderHeaderEditorModal from './LeaderHeaderEditorModal';
import LeaderBioEditorModal from './LeaderBioEditorModal';
import LeaderAchievementEditorModal from './LeaderAchievementEditorModal';
import LeaderConnectEditorModal from './LeaderConnectEditorModal';
import leaderImg from '../assets/leader.png';
// AdminBadge removed

/* ── Accordion item for Speeches & Media ─────────────────────── */
const Accordion = ({ title, children }) => {
    const [open, setOpen] = useState(false);
    return (
        <div className="border-b border-slate-100 last:border-0">
            <button
                onClick={() => setOpen(o => !o)}
                className="flex items-center justify-between w-full py-5 text-left group"
            >
                <span className="text-sm font-extrabold text-slate-800 group-hover:text-primary transition-colors font-header tracking-wide">
                    {title}
                </span>
                <ChevronDown
                    size={17}
                    className={`text-slate-400 group-hover:text-primary transition-all ${open ? 'rotate-180' : ''}`}
                />
            </button>
            {open && (
                <div className="pb-5 pl-2 space-y-3">
                    {children}
                </div>
            )}
        </div>
    );
};

/* ── Achievement row ─────────────────────────────────────────── */
const AchievementItem = ({ text }) => (
    <div className="flex gap-3 items-start group">
        <CheckCircle2 size={18} className="text-primary mt-0.5 flex-shrink-0" />
        <p className="text-slate-600 text-sm leading-relaxed group-hover:text-slate-800 transition-colors">
            {text}
        </p>
    </div>
);

/* ── Social button ───────────────────────────────────────────── */
const SocialBtn = ({ icon: Icon, label }) => (
    <button className="flex items-center justify-center gap-2.5 flex-1 px-5 py-3 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md hover:border-primary hover:text-primary text-slate-600 transition-all">
        <Icon size={17} />
        <span className="text-xs font-extrabold uppercase tracking-widest font-header">{label}</span>
    </button>
);

/* ── Main component ──────────────────────────────────────────── */
const LeaderProfile = () => {
    const { t, i18n } = useTranslation();
    const currentLang = (i18n.resolvedLanguage || i18n.language || 'en').split('-')[0];
    const hFont = currentLang === 'ta' ? 'font-tamil' : 'font-header';

    const achievements = Array.isArray(t('leader.achievements_list', { returnObjects: true, lng: currentLang }))
        ? t('leader.achievements_list', { returnObjects: true, lng: currentLang }) : [];

    const mediaItems = Array.isArray(t('leader.media_items', { returnObjects: true, lng: currentLang }))
        ? t('leader.media_items', { returnObjects: true, lng: currentLang }) : [];

    const [editorOpen, setEditorOpen] = React.useState(false);
    const [editingItem, setEditingItem] = React.useState(null);
    const [editingIndex, setEditingIndex] = React.useState(null);

    const [headerEditorOpen, setHeaderEditorOpen] = React.useState(false);
    const [bioEditorOpen, setBioEditorOpen] = React.useState(false);
    const [achEditorOpen, setAchEditorOpen] = React.useState(false);
    const [achEditingIndex, setAchEditingIndex] = React.useState(null);
    const [connectEditorOpen, setConnectEditorOpen] = React.useState(false);
    const [connectItem, setConnectItem] = React.useState(null);


    React.useEffect(() => {
        const onOpen = (e) => {
            const d = e?.detail; if (!d) return;
            if (d.section === 'leader_profile.media_items') {
                setEditingItem(d.item || null);
                setEditingIndex(typeof d.index === 'number' ? d.index : null);
                setEditorOpen(true);
            } else if (d.section === 'leader_profile.header') {
                setEditingItem(d.item || null);
                setHeaderEditorOpen(true);
            } else if (d.section === 'leader_profile.bio') {
                setEditingItem(d.item || null);
                setBioEditorOpen(true);
            } else if (d.section === 'leader_profile.connect') {
                setConnectItem(d.item || null);
                setConnectEditorOpen(true);
            } else if (d.section === 'leader_profile.achievements_list') {
                setEditingItem(d.item || null);
                setAchEditingIndex(typeof d.index === 'number' ? d.index : null);
                setAchEditorOpen(true);
            }
        };
        window.addEventListener('tvpk-admin-open', onOpen);
        return () => window.removeEventListener('tvpk-admin-open', onOpen);
    }, []);

    const closeEditor = () => { setEditorOpen(false); setEditingItem(null); setEditingIndex(null); };

    const saveItem = async (data, idx) => {
        const api = import.meta.env.VITE_API_URL || '';
        const token = localStorage.getItem('tvpk_token');
        try {
            const r = await fetch(`${api}/admin/content`, { headers: { Authorization: `Bearer ${token}` } });
            const j = await r.json();
            const doc = j.content || {};
            const top = doc.leader_profile ?? {};
            const arr = Array.isArray(top.media_items) ? top.media_items.slice() : [];
            if (typeof idx === 'number') arr[idx] = data;
            else arr.push(data);
            const newTop = { ...(top || {}), media_items: arr };
            const res = await fetch(`${api}/admin/content`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ content: newTop, focus: 'leader_profile' }) });
            const out = await res.json();
            if (!res.ok) return alert(out.error || 'Save failed');
            window.dispatchEvent(new CustomEvent('tvpk-content-updated', { detail: { section: 'leader_profile', content: out.content?.leader_profile } }));
            closeEditor();
        } catch (e) { alert('Save failed'); }
    };

    const deleteItem = async (idx) => {
        if (!confirm('Delete this media item?')) return;
        const api = import.meta.env.VITE_API_URL || '';
        const token = localStorage.getItem('tvpk_token');
        try {
            const r = await fetch(`${api}/admin/content`, { headers: { Authorization: `Bearer ${token}` } });
            const j = await r.json();
            const doc = j.content || {};
            const top = doc.leader_profile ?? {};
            const arr = Array.isArray(top.media_items) ? top.media_items.slice() : [];
            arr.splice(idx, 1);
            const newTop = { ...(top || {}), media_items: arr };
            const res = await fetch(`${api}/admin/content`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ content: newTop, focus: 'leader_profile' }) });
            const out = await res.json();
            if (!res.ok) return alert(out.error || 'Delete failed');
            window.dispatchEvent(new CustomEvent('tvpk-content-updated', { detail: { section: 'leader_profile', content: out.content?.leader_profile } }));
            closeEditor();
        } catch (e) { alert('Delete failed'); }
    };

    return (
        <>
        <div className="bg-slate-50/40 py-16 relative group">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-6">

                {/* ── SECTION HEADER (centered) ────────────────── */}
                <div className="text-center mb-8">
                    <h1 className={`text-5xl md:text-7xl font-black text-slate-900 mb-4 uppercase tracking-tight ${hFont}`}>
                        {t('quick_links.leadership.title', { lng: currentLang })}
                    </h1>
                    <p className="text-slate-500 text-lg md:text-xl max-w-3xl mx-auto font-medium leading-relaxed">
                        {t('quick_links.leadership.desc', { lng: currentLang })}
                    </p>
                    <div className="h-2 w-36 bg-primary mx-auto rounded-full mt-6 opacity-30"></div>
                </div>

                {/* ── HEADER CARD ─────────────────────────────── */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-md p-8 md:p-10 flex flex-col md:flex-row gap-8 items-start">
                    {/* Photo */}
                    <div className="w-44 h-52 flex-shrink-0">
                        <img
                            src={leaderImg}
                            alt="Party Leader"
                            className="w-full h-full object-contain mix-blend-multiply"
                        />
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                        <h1 className={`text-2xl md:text-3xl font-extrabold text-slate-900 mb-1.5 tracking-tight ${hFont}`}>
                            {t('leader.name', { lng: currentLang })}
                        </h1>
                        {isAdmin() && (
                            <div className="mt-2 flex gap-2">
                                <button onClick={(e) => { e.preventDefault(); window.dispatchEvent(new CustomEvent('tvpk-admin-edit', { detail: { section: 'leader_profile.header', item: { name: t('leader.name'), role: t('leader.role'), bio_short: t('leader.bio_short') } } })); }} className="bg-white rounded-full p-2 shadow hover:bg-primary/5 transition" title="Edit header"><Pencil size={16} className="text-slate-700"/></button>
                            </div>
                        )}
                        <p className={`text-primary font-extrabold text-sm mb-5 tracking-widest uppercase ${hFont}`}>
                            {t('leader.role', { lng: currentLang })}
                        </p>
                        <p className="text-slate-500 text-sm leading-relaxed mb-6 max-w-xl">
                            {t('leader.bio_short', { lng: currentLang })}
                        </p>
                        <button className="px-6 py-2.5 border border-slate-200 rounded-xl text-xs font-extrabold text-slate-600 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all uppercase tracking-widest font-header">
                            {t('leader.read_full_bio', { lng: currentLang })}
                        </button>
                    </div>
                </div>

                {/* ── BIOGRAPHY ───────────────────────────────── */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-md p-8 md:p-10">
                    <h2 className={`text-lg font-extrabold text-slate-900 mb-6 ${hFont}`}>
                        {t('leader.biography_title', { lng: currentLang })}
                    </h2>
                    <div className="space-y-7 text-slate-600 text-sm leading-relaxed">
                        <div className="flex items-start justify-between">
                            <p className="flex-1">{t('leader.biography_text', { lng: currentLang })}</p>
                            {isAdmin() && (
                                <button onClick={(e) => { e.preventDefault(); window.dispatchEvent(new CustomEvent('tvpk-admin-edit', { detail: { section: 'leader_profile.bio', item: { biography_text: t('leader.biography_text'), early_life_title: t('leader.early_life_title'), early_life_text: t('leader.early_life_text'), politics_title: t('leader.politics_title'), politics_text: t('leader.politics_text') } } })); }} className="ml-4 bg-white rounded-full p-2 shadow hover:bg-primary/5 transition" title="Edit biography"><Pencil size={16} className="text-slate-700"/></button>
                            )}
                        </div>

                        <div>
                                <h3 className={`text-sm font-extrabold text-slate-800 mb-2 uppercase tracking-wider ${hFont}`}>
                                {t('leader.early_life_title', { lng: currentLang })}
                            </h3>
                            <p>{t('leader.early_life_text', { lng: currentLang })}</p>
                        </div>

                        <div>
                                <h3 className={`text-sm font-extrabold text-slate-800 mb-2 uppercase tracking-wider ${hFont}`}>
                                {t('leader.politics_title', { lng: currentLang })}
                            </h3>
                            <p>{t('leader.politics_text', { lng: currentLang })}</p>
                        </div>
                    </div>
                </div>

                {/* ── KEY ACHIEVEMENTS ────────────────────────── */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-md p-8 md:p-10">
                    <h2 className={`text-lg font-extrabold text-slate-900 mb-6 ${hFont}`}>
                        {t('leader.achievements_title', { lng: currentLang })}
                    </h2>
                    <div className="space-y-5">
                        {achievements.map((item, i) => (
                            <div key={i} className="flex items-center justify-between">
                                <AchievementItem text={item} />
                                {isAdmin() && (
                                    <div className="flex gap-2 ml-4">
                                        <button onClick={() => window.dispatchEvent(new CustomEvent('tvpk-admin-edit', { detail: { section: 'leader_profile.achievements_list', index: i, item } }))} className="bg-white rounded-full p-2 shadow hover:bg-primary/5 transition" title="Edit achievement"><Pencil size={14} className="text-slate-700"/></button>
                                        <button onClick={() => window.dispatchEvent(new CustomEvent('tvpk-admin-delete', { detail: { section: 'leader_profile.achievements_list', index: i } }))} className="bg-white rounded-full p-2 shadow hover:bg-red-50 transition" title="Delete achievement"><Trash2 size={14} className="text-rose-600"/></button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── SPEECHES & MEDIA ────────────────────────── */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-md p-8 md:p-10">
                    <h2 className={`text-lg font-extrabold text-slate-900 mb-2 ${hFont}`}>
                        {t('leader.media_title', { lng: currentLang })}
                    </h2>

                    <Accordion title={t('leader.media_sections.speeches', { lng: currentLang })}>
                        {mediaItems.map((item, i) => (
                            <div key={i} className="flex items-center gap-2 text-primary hover:underline font-medium justify-between">
                                <a href="#" className="flex items-center gap-2 text-sm font-medium"><span className="text-primary/50">›</span> {item}</a>
                                {isAdmin() && (
                                    <div className="flex gap-2">
                                        <button onClick={(e) => { e.preventDefault(); window.dispatchEvent(new CustomEvent('tvpk-admin-edit', { detail: { section: 'leader_profile.media_items', index: i, item } })); }} className="bg-white rounded-full p-2 shadow hover:bg-primary/5 transition" title="Edit media"><Pencil size={14} className="text-slate-700"/></button>
                                        <button onClick={(e) => { e.preventDefault(); window.dispatchEvent(new CustomEvent('tvpk-admin-delete', { detail: { section: 'leader_profile.media_items', index: i } })); }} className="bg-white rounded-full p-2 shadow hover:bg-red-50 transition" title="Delete media"><Trash2 size={14} className="text-rose-600"/></button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </Accordion>

                    <Accordion title={t('leader.media_sections.interviews', { lng: currentLang })}>
                        <p className="text-sm text-slate-400 italic">{t('leader.media_coming_soon', { lng: currentLang })}</p>
                    </Accordion>

                    <Accordion title={t('leader.media_sections.broadcasts', { lng: currentLang })}>
                        <p className="text-sm text-slate-400 italic">{t('leader.media_coming_soon', { lng: currentLang })}</p>
                    </Accordion>
                </div>

                {/* ── CONNECT ─────────────────────────────────── */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-md p-8 md:p-10">
                    
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex-1">
                            <h2 className={`text-lg font-extrabold text-slate-900 mb-0 ${hFont}`}>Connect</h2>
                        </div>
                        {isAdmin() && (
                            <div>
                                <button onClick={(e) => { e.preventDefault(); window.dispatchEvent(new CustomEvent('tvpk-admin-edit', { detail: { section: 'leader_profile.connect', item: { facebook: '', twitter: '', instagram: '', youtube: '' } } })); }} className="bg-white rounded-full p-2 shadow hover:bg-primary/5 transition" title="Edit connections"><Pencil size={16} className="text-slate-700"/></button>
                            </div>
                        )}
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <SocialBtn icon={Facebook} label="Facebook" />
                        <SocialBtn icon={Twitter} label="Twitter" />
                        <SocialBtn icon={Instagram} label="Instagram" />
                        <SocialBtn icon={Youtube} label="YouTube" />
                    </div>
                </div>

            </div>
        </div>
        <LeaderMediaEditorModal open={editorOpen} onClose={closeEditor} item={editingItem} index={editingIndex} onSave={saveItem} onDelete={(i) => { deleteItem(i); closeEditor(); }} />
        <LeaderConnectEditorModal open={connectEditorOpen} onClose={() => setConnectEditorOpen(false)} item={connectItem} onSave={async (data) => {
            const api = import.meta.env.VITE_API_URL || '';
            const token = localStorage.getItem('tvpk_token');
            try {
                const r = await fetch(`${api}/admin/content`, { headers: { Authorization: `Bearer ${token}` } });
                const j = await r.json();
                const doc = j.content || {};
                const top = doc.leader_profile ?? {};
                const newTop = { ...(top || {}), connect: { facebook: data.facebook, twitter: data.twitter, instagram: data.instagram, youtube: data.youtube } };
                const res = await fetch(`${api}/admin/content`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ content: newTop, focus: 'leader_profile' }) });
                const out = await res.json();
                if (!res.ok) return alert(out.error || 'Save failed');
                window.dispatchEvent(new CustomEvent('tvpk-content-updated', { detail: { section: 'leader_profile', content: out.content?.leader_profile } }));
                setConnectEditorOpen(false);
            } catch (e) { alert('Save failed'); }
        }} />
        <LeaderHeaderEditorModal open={headerEditorOpen} onClose={() => setHeaderEditorOpen(false)} item={editingItem} onSave={async (data) => {
            // save header fields under focus 'leader_profile'
            const api = import.meta.env.VITE_API_URL || '';
            const token = localStorage.getItem('tvpk_token');
            try {
                const r = await fetch(`${api}/admin/content`, { headers: { Authorization: `Bearer ${token}` } });
                const j = await r.json();
                const doc = j.content || {};
                const top = doc.leader_profile ?? {};
                const newTop = { ...(top || {}), name: data.name, role: data.role, bio_short: data.bio_short, image: data.image };
                const res = await fetch(`${api}/admin/content`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ content: newTop, focus: 'leader_profile' }) });
                const out = await res.json();
                if (!res.ok) return alert(out.error || 'Save failed');
                window.dispatchEvent(new CustomEvent('tvpk-content-updated', { detail: { section: 'leader_profile', content: out.content?.leader_profile } }));
                setHeaderEditorOpen(false);
            } catch (e) { alert('Save failed'); }
        }} />

        <LeaderBioEditorModal open={bioEditorOpen} onClose={() => setBioEditorOpen(false)} item={editingItem} onSave={async (data) => {
            const api = import.meta.env.VITE_API_URL || '';
            const token = localStorage.getItem('tvpk_token');
            try {
                const r = await fetch(`${api}/admin/content`, { headers: { Authorization: `Bearer ${token}` } });
                const j = await r.json();
                const doc = j.content || {};
                const top = doc.leader_profile ?? {};
                const newTop = { ...(top || {}), biography_text: data.biography_text, early_life_title: data.early_life_title, early_life_text: data.early_life_text, politics_title: data.politics_title, politics_text: data.politics_text };
                const res = await fetch(`${api}/admin/content`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ content: newTop, focus: 'leader_profile' }) });
                const out = await res.json();
                if (!res.ok) return alert(out.error || 'Save failed');
                window.dispatchEvent(new CustomEvent('tvpk-content-updated', { detail: { section: 'leader_profile', content: out.content?.leader_profile } }));
                setBioEditorOpen(false);
            } catch (e) { alert('Save failed'); }
        }} />

        <LeaderAchievementEditorModal open={achEditorOpen} onClose={() => setAchEditorOpen(false)} item={editingItem} index={achEditingIndex} onSave={async (data, idx) => {
            const api = import.meta.env.VITE_API_URL || '';
            const token = localStorage.getItem('tvpk_token');
            try {
                const r = await fetch(`${api}/admin/content`, { headers: { Authorization: `Bearer ${token}` } });
                const j = await r.json();
                const doc = j.content || {};
                const top = doc.leader_profile ?? {};
                const arr = Array.isArray(top.achievements_list) ? top.achievements_list.slice() : [];
                if (typeof idx === 'number') arr[idx] = data;
                else arr.push(data);
                const newTop = { ...(top || {}), achievements_list: arr };
                const res = await fetch(`${api}/admin/content`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ content: newTop, focus: 'leader_profile' }) });
                const out = await res.json();
                if (!res.ok) return alert(out.error || 'Save failed');
                window.dispatchEvent(new CustomEvent('tvpk-content-updated', { detail: { section: 'leader_profile', content: out.content?.leader_profile } }));
                setAchEditorOpen(false);
            } catch (e) { alert('Save failed'); }
        }} onDelete={async (idx) => {
            if (!confirm('Delete this achievement?')) return;
            const api = import.meta.env.VITE_API_URL || '';
            const token = localStorage.getItem('tvpk_token');
            try {
                const r = await fetch(`${api}/admin/content`, { headers: { Authorization: `Bearer ${token}` } });
                const j = await r.json();
                const doc = j.content || {};
                const top = doc.leader_profile ?? {};
                const arr = Array.isArray(top.achievements_list) ? top.achievements_list.slice() : [];
                arr.splice(idx, 1);
                const newTop = { ...(top || {}), achievements_list: arr };
                const res = await fetch(`${api}/admin/content`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ content: newTop, focus: 'leader_profile' }) });
                const out = await res.json();
                if (!res.ok) return alert(out.error || 'Delete failed');
                window.dispatchEvent(new CustomEvent('tvpk-content-updated', { detail: { section: 'leader_profile', content: out.content?.leader_profile } }));
                setAchEditorOpen(false);
            } catch (e) { alert('Delete failed'); }
        }} />
        </>
    );
};

export default LeaderProfile;
