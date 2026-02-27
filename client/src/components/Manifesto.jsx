import React from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { editSectionItem, deleteSectionItem, isAdmin } from '../utils/adminHelpers';
import PolicyEditorModal from './PolicyEditorModal';
import ManifestoSummaryEditorModal from './ManifestoSummaryEditorModal';
import { useTranslation } from 'react-i18next';
// AdminBadge removed
import { Download, GraduationCap, Cross, TrendingUp, Leaf, Scale, ChevronRight } from 'lucide-react';

const PolicyCard = ({ icon: Icon, title, desc, readMoreText, language, index }) => {
    const admin = isAdmin();
    return (
    <div className="relative bg-white p-10 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col items-center text-center group hover:shadow-2xl hover:shadow-primary/5 transition-all transform hover:-translate-y-2">
                {admin && (
            <div className="absolute top-3 right-3 z-40 flex gap-2">
                <button onClick={() => window.dispatchEvent(new CustomEvent('tvpk-admin-edit', { detail: { section: 'manifesto.policy_areas', index, item: { title, desc } } }))} className="bg-white rounded-full p-2 shadow hover:bg-primary/5 transition" title="Edit policy" aria-label="Edit policy"><Pencil size={16} className="text-slate-700"/></button>
                <button onClick={() => window.dispatchEvent(new CustomEvent('tvpk-admin-delete', { detail: { section: 'manifesto.policy_areas', index } }))} className="bg-white rounded-full p-2 shadow hover:bg-red-50 transition" title="Delete policy" aria-label="Delete policy"><Trash2 size={16} className="text-rose-600"/></button>
            </div>
        )}
        <div className="w-16 h-16 bg-primary/5 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-primary group-hover:rotate-12 transition-all duration-500">
            <Icon size={28} className="text-primary group-hover:text-white transition-colors" />
        </div>
        <h3 className={`text-lg font-black text-slate-900 mb-5 leading-tight ${language === 'ta' ? 'font-tamil' : 'font-header'}`}>{title}</h3>
        <p className="text-slate-500 text-sm leading-relaxed mb-8 font-medium">
            {desc}
        </p>
        <button className="flex items-center gap-2 text-primary text-xs font-black uppercase tracking-[0.2em] font-header transition-all">
            {readMoreText} <ChevronRight size={16} className="text-primary/30 group-hover:translate-x-1 transition-transform" />
        </button>
    </div>
    );
}

const Manifesto = () => {
    const { t, i18n } = useTranslation();
    const [editorOpen, setEditorOpen] = React.useState(false);
    const [editingItem, setEditingItem] = React.useState(null);
    const [editingIndex, setEditingIndex] = React.useState(null);
    const [summaryOpen, setSummaryOpen] = React.useState(false);
    const [summaryItem, setSummaryItem] = React.useState(null);

    React.useEffect(() => {
        const onOpen = (e) => {
            const d = e?.detail; if (!d) return;
            if (d.section === 'manifesto.policy_areas') {
                setEditingItem(d.item || null);
                setEditingIndex(typeof d.index === 'number' ? d.index : null);
                setEditorOpen(true);
            }
        };
        window.addEventListener('tvpk-admin-open', onOpen);
        return () => window.removeEventListener('tvpk-admin-open', onOpen);
    }, []);

    const closeEditor = () => { setEditorOpen(false); setEditingItem(null); setEditingIndex(null); };

    const openSummaryEditor = async () => {
        const api = import.meta.env.VITE_API_URL || '';
        const token = localStorage.getItem('tvpk_token');
        try {
            const r = await fetch(`${api}/admin/content`, { headers: { Authorization: `Bearer ${token}` } });
            const j = await r.json();
            const doc = j.content || {};
            const top = doc.manifesto || {};
            if (!top || Object.keys(top).length === 0) {
                setSummaryItem({
                    title: t('manifesto.title'),
                    summary_text_1: t('manifesto.summary_text_1'),
                    summary_text_2: t('manifesto.summary_text_2'),
                    key_pillars_text: t('manifesto.key_pillars_text'),
                    environment_text: t('manifesto.environment_text'),
                    download_btn: t('manifesto.download_btn')
                });
            } else {
                setSummaryItem(top);
            }
        } catch (e) {
            setSummaryItem({
                title: t('manifesto.title'),
                summary_text_1: t('manifesto.summary_text_1'),
                summary_text_2: t('manifesto.summary_text_2'),
                key_pillars_text: t('manifesto.key_pillars_text'),
                environment_text: t('manifesto.environment_text'),
                download_btn: t('manifesto.download_btn')
            });
        }
        setSummaryOpen(true);
    };

    const savePolicy = async (data, idx) => {
        const api = import.meta.env.VITE_API_URL || '';
        const token = localStorage.getItem('tvpk_token');
        try {
            const r = await fetch(`${api}/admin/content`, { headers: { Authorization: `Bearer ${token}` } });
            const j = await r.json();
            const doc = j.content || {};
            const top = doc.manifesto ?? {};
            const arr = Array.isArray(top.policy_areas) ? top.policy_areas.slice() : [];
            if (typeof idx === 'number') arr[idx] = { ...arr[idx], ...data };
            else arr.push(data);
            const newTop = { ...(top || {}), policy_areas: arr };
            const res = await fetch(`${api}/admin/content`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ content: newTop, focus: 'manifesto' }) });
            const out = await res.json();
            if (!res.ok) return alert(out.error || 'Save failed');
            window.dispatchEvent(new CustomEvent('tvpk-content-updated', { detail: { section: 'manifesto', content: out.content?.manifesto } }));
            closeEditor();
        } catch (e) { alert('Save failed'); }
    };

    const saveSummary = async (data) => {
        const api = import.meta.env.VITE_API_URL || '';
        const token = localStorage.getItem('tvpk_token');
        try {
            const r = await fetch(`${api}/admin/content`, { headers: { Authorization: `Bearer ${token}` } });
            const j = await r.json();
            const doc = j.content || {};
            const top = { ...(doc.manifesto || {}) };
            const newTop = { ...top, ...data };
            const res = await fetch(`${api}/admin/content`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ content: newTop, focus: 'manifesto' }) });
            const out = await res.json();
            if (!res.ok) return alert(out.error || 'Save failed');
            window.dispatchEvent(new CustomEvent('tvpk-content-updated', { detail: { section: 'manifesto', content: out.content?.manifesto } }));
            setSummaryOpen(false);
            setSummaryItem(null);
        } catch (e) { alert('Save failed'); }
    };

    const deletePolicy = async (idx) => {
        if (!confirm('Delete this policy area?')) return;
        const api = import.meta.env.VITE_API_URL || '';
        const token = localStorage.getItem('tvpk_token');
        try {
            const r = await fetch(`${api}/admin/content`, { headers: { Authorization: `Bearer ${token}` } });
            const j = await r.json();
            const doc = j.content || {};
            const top = doc.manifesto ?? {};
            const arr = Array.isArray(top.policy_areas) ? top.policy_areas.slice() : [];
            arr.splice(idx, 1);
            const newTop = { ...(top || {}), policy_areas: arr };
            const res = await fetch(`${api}/admin/content`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ content: newTop, focus: 'manifesto' }) });
            const out = await res.json();
            if (!res.ok) return alert(out.error || 'Delete failed');
            window.dispatchEvent(new CustomEvent('tvpk-content-updated', { detail: { section: 'manifesto', content: out.content?.manifesto } }));
        } catch (e) { alert('Delete failed'); }
    };

    return (
        <div className="bg-slate-50/30 py-24 relative group">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Page Title */}
                <div className="text-center mb-20">
                    <h1 className={`text-4xl md:text-6xl font-black text-slate-900 mb-6 tracking-tighter uppercase ${i18n.language === 'ta' ? 'font-tamil' : 'font-header'}`}>
                        {t('manifesto.title')}
                    </h1>
                    <div className="h-1.5 w-24 bg-primary mx-auto rounded-full opacity-30"></div>
                </div>

                {/* Summary Card */}
                <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-slate-100 p-12 md:p-16 mb-16 relative overflow-hidden group">
                    {isAdmin() && (
                        <div className="absolute top-4 right-4 z-40">
                            <button onClick={openSummaryEditor} className="bg-white rounded-full p-2 shadow hover:bg-primary/5 transition" title="Edit summary" aria-label="Edit manifesto summary"><Pencil size={16} className="text-slate-700"/></button>
                        </div>
                    )}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full -mr-48 -mt-48 blur-3xl group-hover:bg-primary/10 transition-colors duration-700"></div>
                    <h2 className={`text-3xl font-black mb-10 text-slate-900 tracking-tight flex items-center gap-4 relative ${i18n.language === 'ta' ? 'font-tamil' : 'font-header'}`}>
                        <span className="w-12 h-1 bg-primary rounded-full"></span>
                        {t('manifesto.summary_title')}
                    </h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 text-base leading-relaxed text-slate-500 font-medium relative">
                        <div className="space-y-8">
                            <p className="first-letter:text-5xl first-letter:font-black first-letter:text-primary first-letter:float-left first-letter:mr-3 first-letter:mt-1">{t('manifesto.summary_text_1')}</p>
                            <p>{t('manifesto.summary_text_2')}</p>
                        </div>
                        <div className="space-y-8 lg:border-l lg:border-slate-100 lg:pl-16">
                            <p><span className={`block font-black text-slate-900 mb-3 text-sm uppercase tracking-[0.2em] font-header`}>{t('manifesto.key_pillars_title')}</span> {t('manifesto.key_pillars_text')}</p>
                            <p className="italic text-slate-400 border-l-4 border-slate-100 pl-6 py-2">{t('manifesto.environment_text')}</p>
                        </div>
                    </div>
                </div>

                {/* Download Section */}
                <div className="bg-slate-900 rounded-[3rem] p-16 mb-24 text-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-50"></div>
                    <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>

                    <div className="relative z-10 flex flex-col items-center">
                        <div className="w-full max-w-4xl aspect-[16/7] bg-white/10 backdrop-blur-md rounded-[2rem] shadow-2xl border border-white/10 flex items-center justify-center p-10 hover:bg-white/20 transition-all">
                            <div className="text-center group/viewer max-w-2xl">
                                <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover/viewer:bg-primary transition-colors">
                                    <Download size={32} className="text-white" />
                                </div>
                                <p className="font-black uppercase text-white tracking-[0.3em] font-header mb-3 text-lg">Full Manifesto PDF</p>
                                <p className="text-slate-400 text-sm font-bold uppercase tracking-widest italic mb-6">{t('manifesto.read_more')}</p>
                                <a href="/manifesto.pdf" className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white text-slate-900 font-black uppercase tracking-[0.12em] shadow-lg" download>
                                    <Download size={18} className="text-primary" />
                                    {t('manifesto.download_btn')}
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Key Policy Areas */}
                <div>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
                        <h2 className={`text-3xl font-black text-primary uppercase tracking-tighter ${i18n.language === 'ta' ? 'font-tamil' : 'font-header'}`}>
                            {t('manifesto.policy_areas_title')}
                        </h2>
                        <div className="h-1 flex-grow bg-slate-100 mb-3 mx-6 hidden md:block"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        <PolicyCard
                            icon={GraduationCap}
                            title={t('manifesto.areas.education.title')}
                            desc={t('manifesto.areas.education.desc')}
                            readMoreText={t('manifesto.read_more')}
                            language={i18n.language}
                            index={0}
                        />
                        <PolicyCard
                            icon={Cross}
                            title={t('manifesto.areas.healthcare.title')}
                            desc={t('manifesto.areas.healthcare.desc')}
                            readMoreText={t('manifesto.read_more')}
                            language={i18n.language}
                            index={1}
                        />
                        <PolicyCard
                            icon={TrendingUp}
                            title={t('manifesto.areas.economy.title')}
                            desc={t('manifesto.areas.economy.desc')}
                            readMoreText={t('manifesto.read_more')}
                            language={i18n.language}
                            index={2}
                        />
                        <PolicyCard
                            icon={Leaf}
                            title={t('manifesto.areas.environment.title')}
                            desc={t('manifesto.areas.environment.desc')}
                            readMoreText={t('manifesto.read_more')}
                            language={i18n.language}
                            index={3}
                        />
                        <PolicyCard
                            icon={Scale}
                            title={t('manifesto.areas.justice.title')}
                            desc={t('manifesto.areas.justice.desc')}
                            readMoreText={t('manifesto.read_more')}
                            language={i18n.language}
                            index={4}
                        />
                    </div>
                </div>

                <PolicyEditorModal open={editorOpen} onClose={closeEditor} item={editingItem} index={editingIndex} onSave={savePolicy} onDelete={(i) => { deletePolicy(i); closeEditor(); }} />
                <ManifestoSummaryEditorModal open={summaryOpen} onClose={() => { setSummaryOpen(false); setSummaryItem(null); }} item={summaryItem} onSave={saveSummary} />

            </div>
        </div>
    );
};

export default Manifesto;
