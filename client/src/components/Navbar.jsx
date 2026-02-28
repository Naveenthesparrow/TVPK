import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Menu, X } from 'lucide-react';
import ProfileMenu from './ProfileMenu';
import { NavLink, Link } from 'react-router-dom';

const Navbar = () => {
    const { t, i18n } = useTranslation();
    const currentLang = (i18n.resolvedLanguage || i18n.language || 'en').split('-')[0];
    const [user, setUser] = useState(() => {
        try { return JSON.parse(localStorage.getItem('tvpk_user')) || null; } catch { return null; }
    });

    // Keep navbar user in sync with auth changes (login/logout)
    useEffect(() => {
        const onAuth = () => {
            try { setUser(JSON.parse(localStorage.getItem('tvpk_user')) || null); } catch { setUser(null); }
        };
        window.addEventListener('tvpk-auth-change', onAuth);
        return () => window.removeEventListener('tvpk-auth-change', onAuth);
    }, []);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleLanguage = () => {
        const raw = i18n.resolvedLanguage || i18n.language || 'en';
        const newLang = String(raw).split('-')[0] === 'ta' ? 'en' : 'ta';
        i18n.changeLanguage(newLang);
    };

    const navLinkClass = ({ isActive }) =>
        `px-4 py-3 text-[13px] font-extrabold transition-all border-b-2 hover:text-primary tracking-wide uppercase ${isActive
            ? 'border-primary text-primary bg-primary/5'
            : 'border-transparent text-slate-600 hover:bg-slate-50'
        } ${currentLang === 'ta' ? 'font-tamil' : 'font-header'}`;

    return (
        <nav className="bg-white/95 backdrop-blur-md shadow-lg sticky top-0 z-50">
            {/* Top Tier: Logo & Actions */}
            <div className="border-b border-slate-100">
                <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-20 items-center">
                        {/* Logo and Full Name */}
                        <Link to="/" className="flex items-center gap-4 transition-transform hover:scale-[1.02]">
                            <div className="w-10 h-10 md:w-12 md:h-12 bg-primary rounded-2xl flex items-center justify-center text-white font-black text-lg md:text-xl shadow-xl shadow-primary/30 transform -rotate-3 hover:rotate-0 transition-transform">
                                {t('brand.short_name').substring(0, 1)}
                            </div>
                            <div className="flex flex-col">
                                <span className={`text-primary font-black text-lg md:text-2xl leading-none tracking-tighter uppercase ${i18n.language === 'ta' ? 'font-tamil' : 'font-header'}`}>
                                    {t('brand.name', { lng: currentLang })}
                                </span>
                            </div>
                        </Link>

                        {/* Desktop Actions */}
                        <div className="hidden md:flex items-center gap-4">
                            <button
                                onClick={toggleLanguage}
                                aria-label={currentLang === 'ta' ? 'Switch to English' : 'Switch to Tamil'}
                                className="flex items-center justify-center text-slate-700 hover:text-primary border-2 border-slate-100 rounded-full px-2 py-2 text-xs font-black transition-all hover:border-primary/20 hover:bg-primary/5"
                            >
                                <span className="w-8 h-8 rounded-full grid place-items-center bg-slate-100 text-[13px] font-extrabold">
                                    {currentLang === 'ta' ? 'En' : 'அ'}
                                </span>
                            </button>
                            <div className="max-w-[180px] min-w-0">
                                <ProfileMenu />
                            </div>
                            <Link to="/donate" className="bg-primary text-white px-8 py-3 rounded-full text-xs font-black shadow-2xl shadow-primary/40 hover:shadow-primary/50 hover:-translate-y-1 active:translate-y-0 transition-all uppercase tracking-[0.2em] font-header">
                                {t('nav.donate', { lng: currentLang })}
                            </Link>
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            className="md:hidden p-3 text-slate-600 hover:text-primary transition-all rounded-xl hover:bg-slate-50"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            {isMenuOpen ? <X size={32} /> : <Menu size={32} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Bottom Tier: Navigation Links (Desktop) */}
            <div className="hidden md:block bg-slate-50/80">
                <div className="w-full max-w-[1600px] mx-auto px-4">
                    <div className="flex justify-center items-center gap-2">
                        <NavLink to="/" className={navLinkClass}>{t('nav.home', { lng: currentLang })}</NavLink>
                        <NavLink to="/history" className={navLinkClass}>{t('nav.party_history', { lng: currentLang })}</NavLink>
                        <NavLink to="/leader" className={navLinkClass}>{t('nav.leadership', { lng: currentLang })}</NavLink>
                        <NavLink to="/manifesto" className={navLinkClass}>{t('nav.manifesto', { lng: currentLang })}</NavLink>
                        <NavLink to="/news" className={navLinkClass}>{t('nav.news_events', { lng: currentLang })}</NavLink>
                        <NavLink to="/gallery" className={navLinkClass}>{t('nav.gallery', { lng: currentLang })}</NavLink>
                        <NavLink to="/join" className={navLinkClass}>{t('nav.join', { lng: currentLang })}</NavLink>
                        <NavLink to="/contact" className={navLinkClass}>{t('nav.contact', { lng: currentLang })}</NavLink>
                            {user && user.role === 'admin' && <NavLink to="/admin/dashboard" className={navLinkClass}>Admin</NavLink>}
                                <NavLink to="/login" className={navLinkClass}>{t('nav.login', { lng: currentLang })}</NavLink>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation Menu */}
            {isMenuOpen && (
                <div className="md:hidden bg-white border-t border-slate-100 animate-in slide-in-from-top duration-500 ease-out shadow-2xl">
                    <div className="px-6 pt-4 pb-10 space-y-2">
                        <NavLink to="/" onClick={() => setIsMenuOpen(false)} className={`block px-6 py-4 text-base font-black text-slate-700 hover:bg-primary/5 hover:text-primary rounded-2xl transition-all ${currentLang === 'ta' ? 'font-tamil' : 'font-header'}`}>{t('nav.home', { lng: currentLang })}</NavLink>
                        <NavLink to="/history" onClick={() => setIsMenuOpen(false)} className={`block px-6 py-4 text-base font-black text-slate-700 hover:bg-primary/5 hover:text-primary rounded-2xl transition-all ${currentLang === 'ta' ? 'font-tamil' : 'font-header'}`}>{t('nav.party_history', { lng: currentLang })}</NavLink>
                        <NavLink to="/leader" onClick={() => setIsMenuOpen(false)} className={`block px-6 py-4 text-base font-black text-slate-700 hover:bg-primary/5 hover:text-primary rounded-2xl transition-all ${currentLang === 'ta' ? 'font-tamil' : 'font-header'}`}>{t('nav.leadership', { lng: currentLang })}</NavLink>
                        <NavLink to="/manifesto" onClick={() => setIsMenuOpen(false)} className={`block px-6 py-4 text-base font-black text-slate-700 hover:bg-primary/5 hover:text-primary rounded-2xl transition-all ${currentLang === 'ta' ? 'font-tamil' : 'font-header'}`}>{t('nav.manifesto', { lng: currentLang })}</NavLink>
                        <NavLink to="/news" onClick={() => setIsMenuOpen(false)} className={`block px-6 py-4 text-base font-black text-slate-700 hover:bg-primary/5 hover:text-primary rounded-2xl transition-all ${currentLang === 'ta' ? 'font-tamil' : 'font-header'}`}>{t('nav.news_events', { lng: currentLang })}</NavLink>
                        <NavLink to="/gallery" onClick={() => setIsMenuOpen(false)} className={`block px-6 py-4 text-base font-black text-slate-700 hover:bg-primary/5 hover:text-primary rounded-2xl transition-all ${currentLang === 'ta' ? 'font-tamil' : 'font-header'}`}>{t('nav.gallery', { lng: currentLang })}</NavLink>
                        <NavLink to="/contact" onClick={() => setIsMenuOpen(false)} className={`block px-6 py-4 text-base font-black text-slate-700 hover:bg-primary/5 hover:text-primary rounded-2xl transition-all ${currentLang === 'ta' ? 'font-tamil' : 'font-header'}`}>{t('nav.contact', { lng: currentLang })}</NavLink>
                        <NavLink to="/join" onClick={() => setIsMenuOpen(false)} className={`block px-6 py-4 text-base font-black text-slate-700 hover:bg-primary/5 hover:text-primary rounded-2xl transition-all ${currentLang === 'ta' ? 'font-tamil' : 'font-header'}`}>{t('nav.join', { lng: currentLang })}</NavLink>

                        <div className="pt-8 border-t border-slate-100 flex flex-col gap-4 mt-6">
                            <button
                                onClick={() => { toggleLanguage(); setIsMenuOpen(false); }}
                                aria-label={i18n.language === 'ta' ? 'Switch to English' : 'Switch to Tamil'}
                                className="flex items-center justify-center w-full py-3 text-sm font-black text-slate-700 border-2 border-slate-100 rounded-2xl hover:bg-slate-50 transition-all"
                            >
                                <span className="w-8 h-8 rounded-full grid place-items-center bg-slate-100 text-[14px] font-extrabold">
                                    {i18n.language === 'ta' ? 'En' : 'அ'}
                                </span>
                            </button>
                                                                <div className="px-4 max-w-full">
                                                                        <div className="max-w-[240px] min-w-0">
                                                                            <ProfileMenu />
                                                                        </div>
                                                                </div>
                                <Link to="/login" onClick={() => setIsMenuOpen(false)} className="block text-center w-full py-3 rounded-2xl border">{t('nav.login')}</Link>
                            <Link
                                to="/donate"
                                onClick={() => setIsMenuOpen(false)}
                                className="bg-primary text-white text-center py-5 rounded-2xl text-sm font-black shadow-2xl shadow-primary/30 hover:shadow-primary/40 transition-all uppercase tracking-[0.2em] font-header"
                            >
                                {t('nav.donate')}
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
