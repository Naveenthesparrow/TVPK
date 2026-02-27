import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export default function Footer() {
  const { t, i18n } = useTranslation();
  const lang = (i18n.resolvedLanguage || i18n.language || 'en').split('-')[0];
  return (
    <footer className="bg-primary text-white mt-12">
      <div className="max-w-[1600px] mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <h3 className="text-white font-black text-lg">{t('brand.name', { lng: lang })}</h3>
          <p className="text-sm mt-3 text-primary/10 max-w-sm">{t('footer.desc', { lng: lang })}</p>
        </div>

        <div>
          <h4 className="text-white font-bold">{t('footer.links', { lng: lang })}</h4>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link to="/history" className="hover:underline text-white/90">{t('quick_links.history.title', { lng: lang })}</Link></li>
            <li><Link to="/manifesto" className="hover:underline text-white/90">{t('quick_links.manifesto.title', { lng: lang })}</Link></li>
            <li><Link to="/news" className="hover:underline text-white/90">{t('nav.news_events', { lng: lang })}</Link></li>
            <li><Link to="/contact" className="hover:underline text-white/90">{t('nav.contact', { lng: lang })}</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold">{t('footer.contact', { lng: lang })}</h4>
          <div className="mt-3 text-sm text-white/80">
            <div>{t('footer.address', { lng: lang })}</div>
            <div className="mt-2">{t('footer.phone', { lng: lang })}</div>
            <div className="mt-1">{t('footer.email', { lng: lang })}</div>
          </div>
        </div>
      </div>
      <div className="border-t border-primary/30 py-4">
        <div className="max-w-[1600px] mx-auto px-4 text-center text-sm text-white/80">{t('footer.copy', { lng: lang })}</div>
      </div>
    </footer>
  );
}
