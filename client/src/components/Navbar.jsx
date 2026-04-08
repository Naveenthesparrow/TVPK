import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Menu, X, Home, Facebook, Instagram, Youtube, Send, ChevronDown } from 'lucide-react';
import ProfileMenu from './ProfileMenu';
import { NavLink, Link, useLocation } from 'react-router-dom';
import logoImg from '../assets/logo.png';

const Navbar = () => {
    const { t, i18n } = useTranslation();
    const location = useLocation();
    const currentLang = (i18n.resolvedLanguage || i18n.language || 'en').split('-')[0];
    const [user, setUser] = useState(() => {
        try { return JSON.parse(localStorage.getItem('tvpk_user')) || null; } catch { return null; }
    });
    const [openDropdown, setOpenDropdown] = useState(null);
    const navDropdownRef = useRef(null);

    // Keep navbar user in sync with auth changes (login/logout)
    useEffect(() => {
        const onAuth = () => {
            try { setUser(JSON.parse(localStorage.getItem('tvpk_user')) || null); } catch { setUser(null); }
        };
        window.addEventListener('tvpk-auth-change', onAuth);
        return () => window.removeEventListener('tvpk-auth-change', onAuth);
    }, []);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        setIsMenuOpen(false);
        setOpenDropdown(null);
    }, [location.pathname]);

    useEffect(() => {
        const onClickOutside = (e) => {
            if (navDropdownRef.current && !navDropdownRef.current.contains(e.target)) {
                setOpenDropdown(null);
            }
        };
        document.addEventListener('mousedown', onClickOutside);
        return () => document.removeEventListener('mousedown', onClickOutside);
    }, []);

    const toggleLanguage = () => {
        const raw = i18n.resolvedLanguage || i18n.language || 'en';
        const newLang = String(raw).split('-')[0] === 'ta' ? 'en' : 'ta';
        i18n.changeLanguage(newLang);
    };

    const navLinkClass = ({ isActive }) =>
        `inline-flex items-center gap-1 px-2 py-2 text-sm font-black transition-colors tracking-wide whitespace-nowrap ${isActive
            ? 'text-secondary'
            : 'text-white hover:text-secondary'
        } ${currentLang === 'ta' ? 'font-tamil' : 'font-header'}`;

    const menuItems = [
        { to: '/', label: t('nav.home', { lng: currentLang }) },
        { to: '/history', label: t('nav.party_history', { lng: currentLang }), hasDropdown: true },
        { to: '/leader', label: t('nav.leadership', { lng: currentLang }) },
        { to: '/manifesto', label: t('nav.manifesto', { lng: currentLang }) },
        { to: '/news', label: t('nav.news_events', { lng: currentLang }), hasDropdown: true },
        { to: '/gallery', label: t('nav.gallery', { lng: currentLang }) },
        { to: '/contact', label: t('nav.contact', { lng: currentLang }) },
        { to: '/join', label: t('nav.join', { lng: currentLang }) },
    ];

    const dropdownItems = {
        '/news': [
            { label: currentLang === 'ta' ? 'கட்சி அமைப்பு' : 'Party Structure', to: '/sub/party-structure' },
            { label: currentLang === 'ta' ? 'கட்சி கொள்கைகள்' : 'Party Policies', to: '/sub/party-policies' },
            { label: currentLang === 'ta' ? 'கட்சியின் புலிப்படைகள்' : 'Party Tiger Forces', to: '/sub/party-tiger-forces' },
            { label: currentLang === 'ta' ? 'கட்சியை பற்றி' : 'About Party', to: '/sub/about-party' },
        ],
        '/history': [
            { label: currentLang === 'ta' ? 'மாநில உரிமைகள்' : "State Rights", to: '/sub/state-rights' },
            { label: currentLang === 'ta' ? 'ஆட்சி கொள்கைகள்' : "Governance Policies", to: '/sub/governance-policies' },
        ],
    };

    const today = new Date().toLocaleDateString(currentLang === 'ta' ? 'ta-IN' : 'en-IN');
    const desktopNavGap = currentLang === 'ta' ? 'gap-4' : 'gap-6';
    const desktopItemClass = currentLang === 'ta'
        ? 'inline-flex items-center gap-1 px-2 py-1.5 text-xs 2xl:text-sm font-black transition-colors tracking-wide whitespace-nowrap text-white hover:text-secondary font-tamil'
        : 'inline-flex items-center gap-2 px-4 py-2 text-base font-black transition-colors tracking-wide whitespace-nowrap text-white hover:text-secondary font-header';

    const actionBtnClass = currentLang === 'ta'
        ? 'px-3 h-10 rounded-lg bg-secondary text-[#5c0d0d] font-black text-xs inline-flex items-center justify-center hover:brightness-105 transition whitespace-nowrap'
        : 'px-4 h-10 rounded-lg bg-secondary text-[#5c0d0d] font-black text-sm inline-flex items-center justify-center hover:brightness-105 transition whitespace-nowrap';

    return (
        <nav className="sticky top-0 z-50 shadow-2xl shadow-red-900/30 overflow-x-clip">
            <div className="hidden lg:block bg-[#8c0000] text-white text-[11px]">
                <div className="max-w-[1600px] mx-auto px-3 sm:px-4 lg:px-6 h-7 flex items-center justify-between">
                    <p className={`truncate pr-4 ${currentLang === 'ta' ? 'font-tamil' : 'font-header'}`}>
                        {currentLang === 'ta'
                            ? `இன்று: ${today} | இணைப்பு: (+91) 9092529250`
                            : `Today: ${today} | Helpline: (+91) 9092529250`}
                    </p>
                    <div className="flex items-center gap-2">
                        <a href="#" className="hover:text-secondary transition-colors" aria-label="Facebook"><Facebook size={12} /></a>
                        <a href="#" className="hover:text-secondary transition-colors" aria-label="Instagram"><Instagram size={12} /></a>
                        <a href="#" className="hover:text-secondary transition-colors" aria-label="Telegram"><Send size={12} /></a>
                        <a href="#" className="hover:text-secondary transition-colors" aria-label="Youtube"><Youtube size={12} /></a>
                    </div>
                </div>
            </div>

            <div className="bg-primary text-white border-b border-red-800/40">
                <div className="max-w-[1600px] mx-auto px-3 sm:px-4 lg:px-6 h-18 flex items-center gap-3 justify-between">
                    <Link to="/" className="flex items-center gap-2.5 min-w-0 shrink-0">
                        <img src={logoImg} alt="TVPK logo" className="w-12 h-12 rounded-full object-cover ring-2 ring-secondary/80" />
                        <div className="min-w-0">
                            <p className={`text-sm md:text-base xl:text-lg font-black leading-tight text-secondary ${currentLang === 'ta' ? 'font-tamil whitespace-normal' : 'font-header truncate'}`}>
                                {currentLang === 'ta' ? (
                                    <>
                                        <span>{t('brand.name', { lng: currentLang })}</span>
                                    </>
                                ) : (
                                    <>
                                        <span className="hidden md:inline">{t('brand.name', { lng: currentLang })}</span>
                                        <span className="md:hidden">{t('brand.short_name', { lng: currentLang })}</span>
                                    </>
                                )}
                            </p>
                            <p className={`hidden lg:block text-xs tracking-wide text-yellow-100 truncate ${currentLang === 'ta' ? 'font-tamil' : 'font-header'}`}>
                                {currentLang === 'ta' ? 'சமூக சமநிலையும் சமூகநீதியும்' : 'Equality and Social Justice'}
                            </p>
                        </div>
                    </Link>

                    <div ref={navDropdownRef} className={`hidden xl:flex items-center ${desktopNavGap} relative flex-1 xl:ml-6 2xl:ml-8`}>
                        <NavLink to="/" className={desktopItemClass}><Home size={15} />{t('nav.home', { lng: currentLang })}</NavLink>
                        
                        <div className="relative">
                            <button
                                className={desktopItemClass}
                                type="button"
                                onClick={() => setOpenDropdown((prev) => (prev === '/news' ? null : '/news'))}
                            >
                                {t('nav.news_events', { lng: currentLang })}<ChevronDown size={13} />
                            </button>
                            {openDropdown === '/news' && (
                                <div className="absolute left-0 mt-1 w-56 bg-white text-slate-900 shadow-2xl rounded-lg overflow-hidden z-50 animate-in fade-in duration-150">
                                    {dropdownItems['/news'].map((item, idx) => (
                                        <Link key={idx} to={item.to} onClick={() => setOpenDropdown(null)} className={`block px-4 py-2.5 text-sm font-semibold hover:bg-primary/10 transition border-b border-slate-100 last:border-b-0 ${currentLang === 'ta' ? 'font-tamil' : 'font-header'}`}>
                                            {item.label}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="relative">
                            <button
                                className={desktopItemClass}
                                type="button"
                                onClick={() => setOpenDropdown((prev) => (prev === '/history' ? null : '/history'))}
                            >
                                {t('nav.party_history', { lng: currentLang })}<ChevronDown size={13} />
                            </button>
                            {openDropdown === '/history' && (
                                <div className="absolute left-0 mt-1 w-56 bg-white text-slate-900 shadow-2xl rounded-lg overflow-hidden z-50 animate-in fade-in duration-150">
                                    {dropdownItems['/history'].map((item, idx) => (
                                        <Link key={idx} to={item.to} onClick={() => setOpenDropdown(null)} className={`block px-4 py-2.5 text-sm font-semibold hover:bg-primary/10 transition border-b border-slate-100 last:border-b-0 ${currentLang === 'ta' ? 'font-tamil' : 'font-header'}`}>
                                            {item.label}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>

                        <NavLink to="/contact" className={desktopItemClass}>{t('nav.contact', { lng: currentLang })}</NavLink>
                    </div>

                    <div className="hidden xl:flex items-center gap-2">
                        <button
                            onClick={toggleLanguage}
                            aria-label={currentLang === 'ta' ? 'Switch to English' : 'Switch to Tamil'}
                            className={currentLang === 'ta' ? 'px-3 h-10 rounded-lg bg-secondary text-[#5c0d0d] font-black text-xs hover:brightness-105 transition' : 'px-3.5 h-10 rounded-lg bg-secondary text-[#5c0d0d] font-black text-sm hover:brightness-105 transition'}
                        >
                            {currentLang === 'ta' ? 'En' : 'அ'}
                        </button>
                        {!user && (
                            <Link to="/login" className={actionBtnClass}>
                                {t('nav.login', { lng: currentLang })}
                            </Link>
                        )}
                        <Link to="/join" className={actionBtnClass}>
                            {t('nav.join', { lng: currentLang })}
                        </Link>
                        <Link to="/donate" className="hidden xl:inline-flex px-4 h-10 rounded-lg border border-secondary/70 text-secondary font-black text-sm items-center justify-center hover:bg-secondary hover:text-[#5c0d0d] transition">
                            {t('nav.donate', { lng: currentLang })}
                        </Link>
                        <div className="hidden xl:block w-[42px]">
                            <ProfileMenu />
                        </div>
                    </div>

                    <div className="flex xl:hidden items-center gap-1.5 shrink-0">
                        <button
                            onClick={toggleLanguage}
                            aria-label={currentLang === 'ta' ? 'Switch to English' : 'Switch to Tamil'}
                            className="px-2.5 h-10 rounded-lg bg-secondary text-[#5c0d0d] font-black text-sm"
                        >
                            {currentLang === 'ta' ? 'En' : 'அ'}
                        </button>
                        {user ? (
                            <div className="w-[36px]">
                                <ProfileMenu />
                            </div>
                        ) : (
                            <Link to="/login" className="hidden sm:inline-flex px-2.5 h-10 rounded-lg border border-secondary/70 text-secondary font-black text-sm items-center">
                                {t('nav.login', { lng: currentLang })}
                            </Link>
                        )}
                        <button
                            className="p-1.5 rounded-lg border border-secondary/60 text-secondary"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            aria-label="Toggle navigation menu"
                        >
                            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>
                </div>
            </div>

            {isMenuOpen && (
                <div className="md:hidden bg-[#a10e0e] text-white border-t border-red-800 animate-in slide-in-from-top duration-300">
                    <div className="px-4 py-4 space-y-2">
                        {menuItems.map((item, idx) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                onClick={() => setIsMenuOpen(false)}
                                className={`block px-3 py-3 rounded-lg ${idx === 0 ? 'bg-white/10 font-black' : 'hover:bg-white/10'}`}
                            >
                                {item.label}
                            </NavLink>
                        ))}
                        {!user && (
                            <Link to="/login" onClick={() => setIsMenuOpen(false)} className="block text-center px-3 py-3 rounded-lg bg-secondary text-[#5c0d0d] font-black">{t('nav.login', { lng: currentLang })}</Link>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
