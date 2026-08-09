import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Menu, X, Home, Facebook, Instagram, Youtube, Send, ChevronDown } from 'lucide-react';
import ProfileMenu from './ProfileMenu';
import { NavLink, Link, useLocation } from 'react-router-dom';
import logoImg from '../assets/logo.png';

const Navbar = () => {
    const { t } = useTranslation();
    const location = useLocation();
    const currentLang = 'ta';
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

    const navLinkClass = ({ isActive }) =>
        `inline-flex items-center gap-1 px-2 py-2 text-sm font-black transition-colors tracking-wide whitespace-nowrap ${isActive
            ? 'text-secondary'
            : 'text-white hover:text-secondary'
        } ${currentLang === 'ta' ? 'font-tamil' : 'font-header'}`;

    const menuItems = [
        { to: '/', label: t('nav.home', { lng: currentLang }) },
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

    const tamilYear = (() => {
        try {
            const englishYear = new Date().getFullYear();
            return englishYear + 31;
        } catch {
            return '2057';
        }
    })();
    const desktopNavGap = currentLang === 'ta' ? 'gap-4' : 'gap-6';
    const desktopItemClass = currentLang === 'ta'
        ? 'inline-flex items-center gap-1 px-2 py-1.5 text-xs 2xl:text-sm font-black transition-colors tracking-wide whitespace-nowrap text-white hover:text-secondary font-tamil'
        : 'inline-flex items-center gap-2 px-4 py-2 text-base font-black transition-colors tracking-wide whitespace-nowrap text-white hover:text-secondary font-header';

    const actionBtnClass = currentLang === 'ta'
        ? 'px-3.5 h-10 rounded-xl bg-secondary text-[#5c0d0d] font-black text-xs inline-flex items-center justify-center hover:brightness-110 active:scale-95 transition shadow-sm border-2 border-amber-300'
        : 'px-4 h-10 rounded-xl bg-secondary text-[#5c0d0d] font-black text-sm inline-flex items-center justify-center hover:brightness-110 active:scale-95 transition shadow-sm border-2 border-amber-300';

    return (
        <nav className="sticky top-0 z-50 shadow-2xl shadow-red-900/30 overflow-x-clip">
            <div className="hidden lg:block bg-[#8c0000] text-white text-[11px]">
                <div className="max-w-[1600px] mx-auto px-3 sm:px-4 lg:px-6 h-7 flex items-center justify-between">
                    <p className={`truncate pr-4 ${currentLang === 'ta' ? 'font-tamil' : 'font-header'}`}>
                        திருவள்ளுவர் ஆண்டு {tamilYear}
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
                <div className="max-w-[1600px] mx-auto px-2.5 sm:px-4 lg:px-6 min-h-[4.25rem] sm:min-h-[4.5rem] py-2 flex items-center gap-2 sm:gap-3 justify-between">
                    <Link to="/" className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1 sm:flex-initial mr-1">
                        <img src={logoImg} alt="TVPK logo" className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover ring-2 ring-secondary/80 shrink-0" />
                        <div className="min-w-0 flex-1">
                            <p className={`text-[12px] sm:text-sm md:text-base xl:text-lg font-black leading-snug text-secondary ${currentLang === 'ta' ? 'font-tamil break-words' : 'font-header truncate max-w-[10.5rem] sm:max-w-none'}`}>
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
                                <div className="absolute left-0 mt-1 w-56 bg-white text-slate-900 shadow-2xl rounded-lg overflow-hidden z-50 animate-in fade-in duration-150 p-1">
                                    {dropdownItems['/news'].map((item, idx) => (
                                        <Link key={idx} to={item.to} onClick={() => setOpenDropdown(null)} className={`block px-4 py-2.5 text-sm font-semibold hover:bg-primary/10 rounded-md transition outline-none border-0 ${currentLang === 'ta' ? 'font-tamil' : 'font-header'}`}>
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
                                <div className="absolute left-0 mt-1 w-56 bg-white text-slate-900 shadow-2xl rounded-lg overflow-hidden z-50 animate-in fade-in duration-150 p-1">
                                    {dropdownItems['/history'].map((item, idx) => (
                                        <Link key={idx} to={item.to} onClick={() => setOpenDropdown(null)} className={`block px-4 py-2.5 text-sm font-semibold hover:bg-primary/10 rounded-md transition outline-none border-0 ${currentLang === 'ta' ? 'font-tamil' : 'font-header'}`}>
                                            {item.label}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>

                        <NavLink to="/contact" className={desktopItemClass}>{t('nav.contact', { lng: currentLang })}</NavLink>
                    </div>

                    <div className="hidden xl:flex items-center gap-2">
                        {!user && (
                            <Link to="/login" className="px-4 h-10 rounded-xl bg-white text-[#8b0000] font-black text-sm inline-flex items-center justify-center hover:bg-slate-100 transition shadow-sm border-2 border-white">
                                {t('nav.login', { lng: currentLang })}
                            </Link>
                        )}
                        <Link to="/join" className={actionBtnClass}>
                            {t('nav.join', { lng: currentLang })}
                        </Link>
                        <div className="hidden xl:block w-[42px]">
                            <ProfileMenu />
                        </div>
                    </div>

                    <div className="flex xl:hidden items-center gap-2 shrink-0">
                        {user ? (
                            <div className="w-[36px]">
                                <ProfileMenu />
                            </div>
                        ) : (
                            <Link to="/login" className="hidden sm:inline-flex px-3 h-10 rounded-xl bg-white text-[#8b0000] font-black text-sm items-center border-2 border-white shadow-sm hover:bg-slate-100 transition">
                                {t('nav.login', { lng: currentLang })}
                            </Link>
                        )}
                        <button
                            className="p-2 rounded-xl border-2 border-secondary bg-secondary/20 text-secondary hover:bg-secondary hover:text-[#5c0d0d] transition shadow-xs cursor-pointer"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            aria-label="Toggle navigation menu"
                        >
                            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>
                </div>
            </div>

            {isMenuOpen && (
                <div className="md:hidden bg-[#8c0000] text-white border-t-2 border-amber-400/30 animate-in slide-in-from-top duration-300 max-h-[calc(100vh-4.5rem)] overflow-y-auto shadow-2xl">
                    <div className="px-4 py-5 space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <Link
                                to="/join"
                                onClick={() => setIsMenuOpen(false)}
                                className="flex items-center justify-center rounded-xl bg-secondary text-[#5c0d0d] font-black px-4 py-3 border-2 border-amber-300 shadow-md hover:brightness-105 active:scale-[0.98] transition cursor-pointer text-sm sm:text-base"
                            >
                                {t('nav.join', { lng: currentLang })}
                            </Link>
                            {!user ? (
                                <Link
                                    to="/login"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="flex items-center justify-center rounded-xl bg-white text-[#8b0000] font-black px-4 py-3 border-2 border-white shadow-md hover:bg-slate-100 active:scale-[0.98] transition cursor-pointer text-sm sm:text-base"
                                >
                                    {t('nav.login', { lng: currentLang })}
                                </Link>
                            ) : (
                                <div className="rounded-xl bg-white/10 border-2 border-white/30 px-3 py-3 flex items-center justify-center">
                                    <ProfileMenu />
                                </div>
                            )}
                        </div>

                        <div className="space-y-2 pt-1">
                            {menuItems.map((item) => (
                                <NavLink
                                    key={item.to}
                                    to={item.to}
                                    onClick={() => setIsMenuOpen(false)}
                                    className={({ isActive }) => `
                                        block px-4 py-3 rounded-xl border font-bold transition-all text-sm sm:text-base
                                        ${isActive
                                            ? 'bg-white text-[#8b0000] border-2 border-white shadow-md font-black'
                                            : 'bg-white/10 text-white border-2 border-white/20 hover:bg-white/20 hover:border-white/40 shadow-xs'
                                        }
                                        ${currentLang === 'ta' ? 'font-tamil' : 'font-header'}
                                    `}
                                >
                                    {item.label}
                                </NavLink>
                            ))}
                        </div>

                        <div className="pt-3 border-t-2 border-white/15 space-y-2.5">
                            <p className="text-xs uppercase tracking-[0.2em] text-amber-300 font-black px-1">
                                {t('nav.news_events', { lng: currentLang })}
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {dropdownItems['/news'].map((item) => (
                                    <NavLink
                                        key={item.to}
                                        to={item.to}
                                        onClick={() => setIsMenuOpen(false)}
                                        className={({ isActive }) => `
                                            block px-4 py-2.5 rounded-xl border font-bold transition-all text-sm
                                            ${isActive
                                                ? 'bg-white text-[#8b0000] border-2 border-white shadow-md font-black'
                                                : 'bg-white/10 text-white border-2 border-white/20 hover:bg-white/20 hover:border-white/40 shadow-xs'
                                            }
                                            ${currentLang === 'ta' ? 'font-tamil' : 'font-header'}
                                        `}
                                    >
                                        {item.label}
                                    </NavLink>
                                ))}
                            </div>
                        </div>

                        <div className="pt-3 border-t-2 border-white/15 space-y-2.5">
                            <p className="text-xs uppercase tracking-[0.2em] text-amber-300 font-black px-1">
                                {t('nav.party_history', { lng: currentLang })}
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {dropdownItems['/history'].map((item) => (
                                    <NavLink
                                        key={item.to}
                                        to={item.to}
                                        onClick={() => setIsMenuOpen(false)}
                                        className={({ isActive }) => `
                                            block px-4 py-2.5 rounded-xl border font-bold transition-all text-sm
                                            ${isActive
                                                ? 'bg-white text-[#8b0000] border-2 border-white shadow-md font-black'
                                                : 'bg-white/10 text-white border-2 border-white/20 hover:bg-white/20 hover:border-white/40 shadow-xs'
                                            }
                                            ${currentLang === 'ta' ? 'font-tamil' : 'font-header'}
                                        `}
                                    >
                                        {item.label}
                                    </NavLink>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
