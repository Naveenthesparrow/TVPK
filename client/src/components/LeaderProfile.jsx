import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, Facebook, Twitter, Instagram, Youtube, ChevronDown } from 'lucide-react';
import leaderImg from '../assets/leader.png';

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
    const ta = i18n.language === 'ta';
    const hFont = ta ? 'font-tamil' : 'font-header';

    const achievements = Array.isArray(t('leader.achievements_list', { returnObjects: true }))
        ? t('leader.achievements_list', { returnObjects: true }) : [];

    const mediaItems = Array.isArray(t('leader.media_items', { returnObjects: true }))
        ? t('leader.media_items', { returnObjects: true }) : [];

    return (
        <div className="bg-slate-50/40 py-16">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-6">

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
                            {t('leader.name')}
                        </h1>
                        <p className={`text-primary font-extrabold text-sm mb-5 tracking-widest uppercase ${hFont}`}>
                            {t('leader.role')}
                        </p>
                        <p className="text-slate-500 text-sm leading-relaxed mb-6 max-w-xl">
                            {t('leader.bio_short')}
                        </p>
                        <button className="px-6 py-2.5 border border-slate-200 rounded-xl text-xs font-extrabold text-slate-600 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all uppercase tracking-widest font-header">
                            {t('leader.read_full_bio')}
                        </button>
                    </div>
                </div>

                {/* ── BIOGRAPHY ───────────────────────────────── */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-md p-8 md:p-10">
                    <h2 className={`text-lg font-extrabold text-slate-900 mb-6 ${hFont}`}>
                        {t('leader.biography_title')}
                    </h2>
                    <div className="space-y-7 text-slate-600 text-sm leading-relaxed">
                        <p>{t('leader.biography_text')}</p>

                        <div>
                            <h3 className={`text-sm font-extrabold text-slate-800 mb-2 uppercase tracking-wider ${hFont}`}>
                                {t('leader.early_life_title')}
                            </h3>
                            <p>{t('leader.early_life_text')}</p>
                        </div>

                        <div>
                            <h3 className={`text-sm font-extrabold text-slate-800 mb-2 uppercase tracking-wider ${hFont}`}>
                                {t('leader.politics_title')}
                            </h3>
                            <p>{t('leader.politics_text')}</p>
                        </div>
                    </div>
                </div>

                {/* ── KEY ACHIEVEMENTS ────────────────────────── */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-md p-8 md:p-10">
                    <h2 className={`text-lg font-extrabold text-slate-900 mb-6 ${hFont}`}>
                        {t('leader.achievements_title')}
                    </h2>
                    <div className="space-y-5">
                        {achievements.map((item, i) => (
                            <AchievementItem key={i} text={item} />
                        ))}
                    </div>
                </div>

                {/* ── SPEECHES & MEDIA ────────────────────────── */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-md p-8 md:p-10">
                    <h2 className={`text-lg font-extrabold text-slate-900 mb-2 ${hFont}`}>
                        {t('leader.media_title')}
                    </h2>

                    <Accordion title={t('leader.media_sections.speeches')}>
                        {mediaItems.map((item, i) => (
                            <a key={i} href="#" className="flex items-center gap-2 text-sm text-primary hover:underline font-medium">
                                <span className="text-primary/50">›</span> {item}
                            </a>
                        ))}
                    </Accordion>

                    <Accordion title={t('leader.media_sections.interviews')}>
                        <p className="text-sm text-slate-400 italic">{t('leader.media_coming_soon', 'Coming soon')}</p>
                    </Accordion>

                    <Accordion title={t('leader.media_sections.broadcasts')}>
                        <p className="text-sm text-slate-400 italic">{t('leader.media_coming_soon', 'Coming soon')}</p>
                    </Accordion>
                </div>

                {/* ── CONNECT ─────────────────────────────────── */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-md p-8 md:p-10">
                    <h2 className={`text-lg font-extrabold text-slate-900 mb-6 ${hFont}`}>
                        {t('leader.connect_title')}
                    </h2>
                    <div className="flex flex-wrap gap-3">
                        <SocialBtn icon={Facebook} label="Facebook" />
                        <SocialBtn icon={Twitter} label="Twitter" />
                        <SocialBtn icon={Instagram} label="Instagram" />
                        <SocialBtn icon={Youtube} label="YouTube" />
                    </div>
                </div>

            </div>
        </div>
    );
};

export default LeaderProfile;
