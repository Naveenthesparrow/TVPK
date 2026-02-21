import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Mail, MapPin, Phone } from 'lucide-react';

const Footer = () => {
    const { t, i18n } = useTranslation();

    return (
        <footer className="bg-slate-50 pt-24 pb-12 border-t border-slate-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
                    <div className="col-span-1 md:col-span-1">
                        <div className="flex items-center gap-3 mb-8 group cursor-default">
                            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-primary/20 group-hover:rotate-12 transition-transform">
                                {t('brand.short_name').substring(0, 1)}
                            </div>
                            <span className={`text-primary font-black text-xl tracking-tighter uppercase ${i18n.language === 'ta' ? 'font-tamil' : 'font-header'}`}>
                                {t('brand.name')}
                            </span>
                        </div>
                        <p className="text-slate-500 text-sm leading-relaxed font-medium mb-10">
                            {t('footer.desc')}
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary hover:shadow-lg hover:shadow-primary/5 transition-all"><Facebook size={18} /></a>
                            <a href="#" className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary hover:shadow-lg hover:shadow-primary/5 transition-all"><Twitter size={18} /></a>
                            <a href="#" className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary hover:shadow-lg hover:shadow-primary/5 transition-all"><Instagram size={18} /></a>
                        </div>
                    </div>

                    <div>
                        <h4 className={`text-slate-900 font-black mb-8 uppercase tracking-[0.2em] text-xs font-header`}>{t('footer.about')}</h4>
                        <ul className="space-y-4 text-sm text-slate-500 font-medium">
                            <li><Link to="/history" className="hover:text-primary transition-colors">{t('nav.party_history')}</Link></li>
                            <li><Link to="/leader" className="hover:text-primary transition-colors">{t('nav.leadership')}</Link></li>
                            <li><Link to="/manifesto" className="hover:text-primary transition-colors">{t('nav.manifesto')}</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className={`text-slate-900 font-black mb-8 uppercase tracking-[0.2em] text-xs font-header`}>{t('footer.links')}</h4>
                        <ul className="space-y-4 text-sm text-slate-500 font-medium">
                            <li><Link to="/news" className="hover:text-primary transition-colors">{t('nav.news_events')}</Link></li>
                            <li><Link to="/gallery" className="hover:text-primary transition-colors">{t('nav.gallery')}</Link></li>
                            <li><Link to="/donate" className="hover:text-primary transition-colors">{t('nav.donate')}</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className={`text-slate-900 font-black mb-8 uppercase tracking-[0.2em] text-xs font-header`}>{t('footer.contact')}</h4>
                        <ul className="space-y-5 text-sm text-slate-500 font-medium">
                            <li className="flex gap-4 items-start"><MapPin size={18} className="text-primary flex-shrink-0 mt-0.5" /> <span className="italic">{t('footer.address')}</span></li>
                            <li className="flex gap-4 items-center"><Phone size={18} className="text-primary flex-shrink-0" /> <span className="italic">{t('footer.phone')}</span></li>
                            <li className="flex gap-4 items-center"><Mail size={18} className="text-primary flex-shrink-0" /> <span className="italic">{t('footer.email')}</span></li>
                        </ul>
                    </div>
                </div>
                <div className="pt-10 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">© {new Date().getFullYear()} {t('brand.short_name')}. {t('footer.copy')}</p>
                    <div className="flex gap-8 text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                        <Link to="#" className="hover:text-primary transition-colors">{t('footer.privacy')}</Link>
                        <Link to="#" className="hover:text-primary transition-colors">{t('footer.terms')}</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
