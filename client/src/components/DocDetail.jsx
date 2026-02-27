import React from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import DocEditorModal from './DocEditorModal';

const DocDetail = ({ presetKey }) => {
    const { t, i18n } = useTranslation();
    const params = useParams();
    const docKey = presetKey || params.docId;
    const currentLang = (i18n.resolvedLanguage || i18n.language || 'en').split('-')[0];

    const [content, setContent] = React.useState(null);
    const [editorOpen, setEditorOpen] = React.useState(false);
    const [isAdmin, setIsAdmin] = React.useState(false);

    React.useEffect(() => {
        try { const u = JSON.parse(localStorage.getItem('tvpk_user')); setIsAdmin(!!u && u.role === 'admin'); } catch { setIsAdmin(false); }
    }, []);

    // Load from locales fallback
    React.useEffect(() => {
        try {
            const loc = t(`docs.${docKey}`, { returnObjects: true, lng: currentLang });
            if (loc && typeof loc === 'object') setContent(loc);
            else setContent({ title: t(`history.links.${docKey}`, { lng: currentLang }) || docKey, body: t(`docs.${docKey}.body`, { lng: currentLang }) || '' });
        } catch (e) { setContent({ title: docKey, body: '' }); }
    }, [t, docKey, currentLang]);

    const openEditor = async () => {
        // fetch admin content if available
        try {
            const token = localStorage.getItem('tvpk_token');
            if (!token) { setEditorOpen(true); return; }
            const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/admin/content`, { headers: { Authorization: `Bearer ${token}` } });
            const j = await res.json();
            const docs = (j.content && j.content.docs) ? j.content.docs : {};
            const doc = docs[docKey] || {};
            setContent(prev => ({ ...prev, ...doc }));
        } catch (e) {}
        setEditorOpen(true);
    };

    const save = async (data) => {
        try {
            const token = localStorage.getItem('tvpk_token');
            if (!token) return alert('Admin token required to save');
            // fetch existing docs
            const r = await fetch(`${import.meta.env.VITE_API_URL || ''}/admin/content`, { headers: { Authorization: `Bearer ${token}` } });
            const j = await r.json();
            const docs = (j.content && j.content.docs) ? j.content.docs : {};
            docs[docKey] = data;
            const out = await fetch(`${import.meta.env.VITE_API_URL || ''}/admin/content`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ content: docs, focus: 'docs' }) });
            const o = await out.json();
            if (!out.ok) return alert(o.error || 'Save failed');
            setContent(data);
            setEditorOpen(false);
        } catch (e) { alert('Save failed'); }
    };

    return (
        <div className="py-16 bg-white">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h1 className={`text-4xl md:text-6xl font-black text-slate-900 mb-6 tracking-tighter uppercase`}>{content?.title || docKey}</h1>
                <div className="h-1.5 w-24 bg-primary mx-auto rounded-full opacity-30 mb-10"></div>
                <div className="prose max-w-none text-left text-slate-700">
                    <div dangerouslySetInnerHTML={{ __html: content?.body || '' }} />
                </div>
                {isAdmin && (<div className="mt-8"><button onClick={openEditor} className="px-4 py-2 bg-primary text-white rounded">Edit</button></div>)}
            </div>
            <DocEditorModal open={editorOpen} onClose={() => setEditorOpen(false)} item={content || {}} onSave={save} docKey={docKey} />
        </div>
    );
};

export default DocDetail;
