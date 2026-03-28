import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import flagImg from '../assets/flag.jpeg';
import heroBg from '../assets/hero.jpeg';

const deityImages = [heroBg]; // Placeholder - add more deity images as available

const Hero = () => {
    const { t, i18n } = useTranslation();
    const currentLang = (i18n.resolvedLanguage || i18n.language || 'en').split('-')[0];
    const [heroOverride, setHeroOverride] = React.useState(null);
    const [heroImage, setHeroImage] = React.useState('');

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
        <div className="relative w-full bg-white pt-12 md:pt-16 lg:pt-20 xl:pt-24 px-3 md:px-4 lg:px-5">
            <div className="relative h-64 md:h-72 lg:h-80 xl:h-96 flex items-center overflow-hidden max-w-[1460px] mx-auto rounded-xl border border-slate-200/70">
                <div className="grid w-full h-full gap-0 items-stretch lg:grid-cols-[1fr_1.6fr_1fr]">
                    {/* Left: Flag Image */}
                    <div className="hidden lg:flex items-center justify-center bg-blue-100 px-3 py-4 overflow-hidden">
                        <div className="w-full h-full rounded-lg bg-white/30 flex items-center justify-center">
                            <img src={flagImg} alt="Party flag" className="w-full h-full object-contain object-center" />
                        </div>
                    </div>

                    {/* Center: Content on Green Background */}
                    <div className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 flex flex-col justify-center items-center px-3 md:px-6 py-4 text-center">
                        <div className="w-full max-w-[560px] mx-auto">
                            <h2 className={`font-black text-white mb-2 md:mb-3 leading-tight ${currentLang === 'ta' ? 'font-tamil text-2xl md:text-3xl' : 'font-header text-3xl md:text-4xl'}`}>
                                {localized('title', 'hero.title')}
                            </h2>

                            <p className={`text-emerald-100 mb-3 md:mb-4 max-w-lg mx-auto leading-relaxed ${currentLang === 'ta' ? 'font-tamil text-xs md:text-sm' : 'font-header text-xs md:text-sm'}`}>
                                {localized('desc', 'hero.desc')}
                            </p>

                            <div className="w-full flex flex-wrap items-center justify-center gap-2 md:gap-3">
                                <div className="flex flex-wrap items-center justify-center gap-1.5 md:gap-2">
                                    <Link to="/history" className={`px-3 md:px-4 py-1.5 md:py-2 bg-white text-emerald-700 rounded-lg font-black text-sm md:text-base hover:brightness-95 transition ${currentLang === 'ta' ? 'font-tamil' : 'font-header'}`}>
                                        {t('hero.cta_learn_more', { lng: currentLang })}
                                    </Link>
                                    <Link to="/join" className={`px-3 md:px-4 py-1.5 md:py-2 bg-yellow-400 text-emerald-800 rounded-lg font-black text-sm md:text-base hover:brightness-95 transition ${currentLang === 'ta' ? 'font-tamil' : 'font-header'}`}>
                                        {t('hero.cta_join', { lng: currentLang })}
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Deity Image */}
                    <div className="hidden lg:flex items-center justify-center bg-blue-100 px-3 py-4 overflow-hidden">
                        <div className="w-full h-full rounded-lg bg-white/30 flex items-center justify-center">
                            <img src={deityImages[0]} alt="Deity" className="w-full h-full object-contain object-center" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Hero;
