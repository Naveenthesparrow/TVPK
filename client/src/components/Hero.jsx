import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import partyFlag from '../assets/party-flag.png';
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

    const localized = (field, fallbackKey) => {
        const source = heroOverride?.[field];
        if (source && typeof source === 'object') return source[currentLang] || source.en || source.ta || '';
        if (typeof source === 'string' && source.trim()) return source;
        return t(fallbackKey, { lng: currentLang });
    };
    const heroVisual = heroImage || heroBg;

    return (
        <div className="relative isolate overflow-hidden bg-[radial-gradient(circle_at_20%_20%,#37c177_0%,#1fa95e_45%,#178e4f_100%)] text-white">
            <div className="absolute inset-0 opacity-25" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)', backgroundSize: '22px 22px' }} />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.08)_0%,rgba(0,0,0,0.18)_100%)]" />

            <div className="relative max-w-[1320px] mx-auto px-4 sm:px-8 lg:px-10 pt-10 md:pt-14 pb-20 md:pb-24">
                {isAdmin() && (
                    <div className="absolute top-4 right-4 z-40">
                        <button onClick={openEditor} className="bg-white rounded-full p-2 shadow hover:bg-primary/5 transition" title="Edit hero">
                            <Pencil size={16} className="text-slate-700" />
                        </button>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-8 lg:gap-12 items-center">
                    <div className="relative z-10">
                        <div className="inline-block border border-white/70 px-4 py-2 rounded-lg mb-5 bg-black/10 backdrop-blur-sm">
                            <p className={`font-black text-xl md:text-3xl tracking-tight ${currentLang === 'ta' ? 'font-tamil' : 'font-header'}`}>
                                {t('hero.banner', { lng: currentLang })}
                            </p>
                        </div>

                        <h1 className={`max-w-3xl font-black leading-[1.1] text-yellow-200 drop-shadow-[0_3px_8px_rgba(0,0,0,0.45)] ${currentLang === 'ta' ? 'font-tamil text-3xl md:text-5xl' : 'font-header text-3xl md:text-5xl uppercase'}`}>
                            {localized('title', 'hero.title')}
                        </h1>

                        <p className={`mt-4 max-w-2xl text-white/90 text-base md:text-xl leading-relaxed ${currentLang === 'ta' ? 'font-tamil' : 'font-header'}`}>
                            {localized('desc', 'hero.desc')}
                        </p>

                        <div className="mt-8 flex flex-wrap items-center gap-4 md:gap-5">
                            <img src={partyFlag} alt="Party emblem" className="w-20 h-20 md:w-24 md:h-24 rounded-full border-2 border-white/80 shadow-xl shadow-black/30 object-cover" />
                            <div className="flex flex-wrap gap-3">
                                <Link to="/history" className="px-5 py-3 bg-white text-emerald-800 rounded-xl font-black text-sm tracking-wide hover:translate-y-[-2px] transition">
                                    {t('hero.cta_learn_more', { lng: currentLang })}
                                </Link>
                                <Link to="/join" className="px-5 py-3 bg-secondary text-[#6b1313] rounded-xl font-black text-sm tracking-wide hover:translate-y-[-2px] transition">
                                    {t('hero.cta_join', { lng: currentLang })}
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className="relative min-h-[280px] md:min-h-[480px] flex items-center justify-center lg:justify-end">
                        <div className="w-full max-w-[620px] aspect-[4/3]">
                            <img src={heroVisual} alt="Tamil Nadu development collage" className="w-full h-full object-contain object-center p-3 md:p-4" />
                        </div>
                    </div>
                </div>
            </div>

            <svg className="absolute bottom-[-1px] left-0 w-full h-12 md:h-16 text-[#f3f4f6]" viewBox="0 0 1440 120" preserveAspectRatio="none" aria-hidden="true">
                <path fill="currentColor" d="M0,64L34.3,69.3C68.6,75,137,85,206,80C274.3,75,343,53,411,42.7C480,32,549,32,617,42.7C685.7,53,754,75,823,74.7C891.4,75,960,53,1029,48C1097.1,43,1166,53,1234,64C1302.9,75,1371,85,1406,90.7L1440,96L1440,120L1405.7,120C1371.4,120,1303,120,1234,120C1165.7,120,1097,120,1029,120C960,120,891,120,823,120C754.3,120,686,120,617,120C548.6,120,480,120,411,120C342.9,120,274,120,206,120C137.1,120,69,120,34,120L0,120Z" />
            </svg>

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
