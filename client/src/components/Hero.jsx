import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import partyFlag from '../assets/tamilannai.jpeg';
import { Pencil } from 'lucide-react';
import HeroEditorModal from './HeroEditorModal';
import { isAdmin } from '../utils/adminHelpers';

const Hero = () => {
    const { t, i18n } = useTranslation();
    const currentLang = (i18n.resolvedLanguage || i18n.language || 'en').split('-')[0];
    const [editorOpen, setEditorOpen] = React.useState(false);
    const [editingItem, setEditingItem] = React.useState(null);
    const [heroOverride, setHeroOverride] = React.useState(null);
    const [heroImage, setHeroImage] = React.useState('');

    const openEditor = async () => {
        if (heroOverride) {
            setEditingItem(heroOverride);
            setEditorOpen(true);
            return;
        }

        const api = import.meta.env.VITE_API_URL || '';
        const token = localStorage.getItem('tvpk_token');
        try {
            const r = await fetch(`${api}/admin/content`, { headers: { Authorization: `Bearer ${token}` } });
            const j = await r.json();
            const doc = j.content || {};
            const top = doc.hero || {};
            if (!top || Object.keys(top).length === 0) {
                setEditingItem({
                    title: t('hero.title'),
                    desc: t('hero.desc'),
                    cta_learn_more: t('hero.cta_learn_more'),
                    cta_join: t('hero.cta_join'),
                    image: ''
                });
            } else setEditingItem(top);
        } catch (e) { setEditingItem(null); }
        setEditorOpen(true);
    };

    React.useEffect(() => {
        // load saved hero content (if any)
        const api = import.meta.env.VITE_API_URL || '';
        const token = localStorage.getItem('tvpk_token');
        let mounted = true;
        (async () => {
            try {
                const r = await fetch(`${api}/admin/content`, { headers: { Authorization: `Bearer ${token}` } });
                const j = await r.json();
                if (!mounted) return;
                const doc = j.content || {};
                if (doc.hero) {
                    setHeroOverride(doc.hero);
                    setHeroImage(doc.hero.image || '');
                }
            } catch (e) {}
        })();

        const onUpdate = (e) => { if (!e?.detail) return; const { section, content } = e.detail; if (section === 'hero') { setHeroOverride(content || null); setHeroImage(content?.image || ''); } };
        window.addEventListener('tvpk-content-updated', onUpdate);
        return () => { mounted = false; window.removeEventListener('tvpk-content-updated', onUpdate); };
    }, []);

    return (
        <div className="relative overflow-hidden group">
            <div className="max-w-full mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2">
                    {/* Text Section */}
                    <div className="bg-gradient-to-br from-primary to-red-800 p-8 md:p-16 flex flex-col justify-center text-white min-h-[360px] md:min-h-[500px] shadow-inner relative">
                        {isAdmin() && (
                            <div className="absolute top-6 right-6 z-40">
                                <button onClick={openEditor} className="bg-white rounded-full p-2 shadow hover:bg-primary/5 transition" title="Edit hero"><Pencil size={16} className="text-slate-700"/></button>
                            </div>
                        )}
                        <h1 className={`text-2xl md:text-5xl font-black leading-[1.1] mb-6 tracking-tighter uppercase ${currentLang === 'ta' ? 'font-tamil' : 'font-header'}`}>
                            {(() => {
                                const key = currentLang;
                                if (heroOverride) {
                                    const val = heroOverride.title;
                                    if (val && typeof val === 'object') return val[key] || val.en || val.ta || '';
                                    return val || t('hero.title', { lng: currentLang });
                                }
                                return t('hero.title', { lng: currentLang });
                            })()}
                        </h1>
                        <p className="text-white/80 text-lg mb-10 max-w-lg font-medium leading-relaxed">
                            {(() => {
                                const key = currentLang;
                                if (heroOverride) {
                                    const val = heroOverride.desc;
                                    if (val && typeof val === 'object') return val[key] || val.en || val.ta || '';
                                    return val || t('hero.desc', { lng: currentLang });
                                }
                                return t('hero.desc', { lng: currentLang });
                            })()}
                        </p>
                        <div className="flex flex-wrap gap-5">
                            <Link to="/history">
                                <button className="bg-transparent border-2 border-white/30 text-white px-8 py-4 rounded-2xl font-black text-sm hover:bg-white hover:text-primary hover:border-white transition-all transform hover:-translate-y-1 active:translate-y-0 shadow-lg uppercase tracking-widest font-header">
                                    {t('hero.cta_learn_more', { lng: currentLang })}
                                </button>
                            </Link>
                            <Link to="/contact">
                                <button className="bg-white text-primary px-10 py-4 rounded-2xl font-black text-sm hover:bg-secondary hover:text-dark transition-all transform hover:-translate-y-1 active:translate-y-0 shadow-2xl shadow-white/20 uppercase tracking-widest font-header">
                                    {t('hero.cta_join', { lng: currentLang })}
                                </button>
                            </Link>
                        </div>
                    </div>

                    {/* Emblem Section */}
                        <div className="bg-secondary relative flex items-center justify-center p-6 md:p-8 overflow-hidden group">
                        <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-700"></div>
                        <div className="w-64 h-64 md:w-[32rem] md:h-[32rem] relative flex items-center justify-center">
                            {/* Decorative elements */}
                            <div className="absolute inset-0 border-8 border-black/10 rounded-full scale-110 animate-pulse"></div>
                            <div className="absolute inset-0 border-4 border-black/5 rounded-full scale-125"></div>

                            {/* The Flag Image */}
                            <div className="relative z-10 w-full h-full p-4 transform group-hover:scale-105 transition-transform duration-700 drop-shadow-[0_35px_35px_rgba(0,0,0,0.5)]">
                                    <img
                                    src={heroImage || partyFlag}
                                    alt="Tamil Annai"
                                    className="w-full h-full object-contain filter contrast-125 brightness-110"
                                />
                            </div>

                            {/* floating tag removed */}
                        </div>
                    </div>
                </div>
            </div>

            <HeroEditorModal open={editorOpen} onClose={() => setEditorOpen(false)} item={editingItem} onSave={async (data) => {
                const api = import.meta.env.VITE_API_URL || '';
                const token = localStorage.getItem('tvpk_token');
                try {
                    const res = await fetch(`${api}/admin/content`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ content: data, focus: 'hero' }) });
                    const out = await res.json();
                    if (!res.ok) return alert(out.error || 'Save failed');
                    window.dispatchEvent(new CustomEvent('tvpk-content-updated', { detail: { section: 'hero', content: out.content?.hero } }));
                    setEditorOpen(false);
                } catch (e) { alert('Save failed'); }
            }} />
        </div>
    );
};

export default Hero;
