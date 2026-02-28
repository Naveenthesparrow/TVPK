import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import partyFlag from '../assets/tamilannai.jpeg';
import heroBg from '../assets/hero.jpeg';
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
            <div className="w-full min-h-screen flex flex-col md:flex-row">

                {/* ── LEFT: Text Section ── */}
                <div className="relative flex-1 bg-gradient-to-br from-red-700 via-primary to-red-900 flex flex-col justify-center px-10 md:px-20 py-20 md:py-0 overflow-hidden">
                    {/* decorative circles */}
                    <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-white/5 pointer-events-none"></div>
                    <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/5 pointer-events-none"></div>
                    <div className="absolute bottom-1/3 right-8 w-32 h-32 rounded-full bg-white/5 pointer-events-none"></div>

                    {/* admin edit button */}
                    {isAdmin() && (
                        <div className="absolute top-6 right-6 z-40">
                            <button onClick={openEditor} className="bg-white rounded-full p-2 shadow hover:bg-primary/5 transition" title="Edit hero">
                                <Pencil size={16} className="text-slate-700"/>
                            </button>
                        </div>
                    )}

                    {/* accent line */}
                    <div className="w-16 h-1.5 bg-yellow-400 rounded-full mb-8"></div>

                    <h1 className={`text-4xl md:text-5xl lg:text-6xl font-black leading-[1.1] mb-6 tracking-tight uppercase text-white drop-shadow-lg ${currentLang === 'ta' ? 'font-tamil' : 'font-header'}`}>
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

                    <p className="text-white/85 text-lg md:text-xl mb-12 max-w-xl font-medium leading-relaxed">
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

                    <div className="flex flex-wrap gap-4">
                        <Link to="/history">
                            <button className="border-2 border-white/50 text-white px-8 py-4 rounded-xl font-black text-sm hover:bg-white hover:text-primary hover:border-white transition-all duration-300 transform hover:-translate-y-1 uppercase tracking-widest font-header shadow-lg">
                                {t('hero.cta_learn_more', { lng: currentLang })}
                            </button>
                        </Link>
                        <Link to="/contact">
                            <button className="bg-yellow-400 text-red-900 px-10 py-4 rounded-xl font-black text-sm hover:bg-yellow-300 transition-all duration-300 transform hover:-translate-y-1 uppercase tracking-widest font-header shadow-2xl">
                                {t('hero.cta_join', { lng: currentLang })}
                            </button>
                        </Link>
                    </div>
                </div>

                {/* ── RIGHT: Full-bleed Image Section ── */}
                <div className="relative flex-1 overflow-hidden min-h-[60vw] md:min-h-0">
                    {/* Background hero image */}
                    <img
                        src={heroBg}
                        alt="Hero Background"
                        className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105 brightness-110"
                    />
                    {/* remove overlay or make very light */}
                    <div className="absolute inset-0 bg-black/5 mix-blend-screen pointer-events-none"></div>
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
