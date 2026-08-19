import React from 'react';
import { useTranslation } from 'react-i18next';
// AdminBadge removed
import { MapPin, Phone, Mail, Facebook, Twitter, Instagram, Pencil } from 'lucide-react';
import ContactEditorModal from './ContactEditorModal';
import { isAdmin } from '../utils/adminHelpers';

const Contact = () => {
    const { t, i18n } = useTranslation();
    const currentLang = (i18n.resolvedLanguage || i18n.language || 'en').split('-')[0];

    const [editorOpen, setEditorOpen] = React.useState(false);
    const [editingItem, setEditingItem] = React.useState(null);

    const openEditor = async () => {
        const api = import.meta.env.VITE_API_URL || '';
        const token = localStorage.getItem('tvpk_token');
        try {
            const r = await fetch(`${api}/admin/content`, { headers: { Authorization: `Bearer ${token}` } });
            const j = await r.json();
            const doc = j.content || {};
            const top = doc.contact || {};
                if (!top || Object.keys(top).length === 0) {
                setEditingItem({
                    title: t('contact_page.title', { lng: currentLang }),
                    subtitle: t('contact_page.subtitle', { lng: currentLang }),
                    office: {
                        address: t('contact_page.office.address', { lng: currentLang }),
                        phone: t('contact_page.office.phone', { lng: currentLang }),
                        email: t('contact_page.office.email', { lng: currentLang }),
                        hours: {
                            weekday: t('contact_page.office.hours.times.weekday', { lng: currentLang }),
                            saturday: t('contact_page.office.hours.times.saturday', { lng: currentLang }),
                            sunday: t('contact_page.office.hours.times.sunday', { lng: currentLang })
                        }
                    },
                    connect: {}
                });
            } else setEditingItem(top);
        } catch (e) { setEditingItem(null); }
        setEditorOpen(true);
    };

    const isTamil = currentLang === 'ta';

    return (
        <div className={`bg-white min-h-screen relative group ${isTamil ? 'font-tamil' : ''}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">

            <div className="text-center mb-10">
                <h1 className={`text-2xl md:text-4xl font-black text-slate-900 mb-4 tracking-tight uppercase ${currentLang === 'ta' ? 'font-tamil' : 'font-header'}`}>
                    {t('contact_page.title', { lng: currentLang })}
                </h1>
                <p className="max-w-2xl mx-auto text-slate-500 text-xs sm:text-sm md:text-base leading-relaxed font-semibold">
                    {t('contact_page.subtitle', { lng: currentLang })}
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10">

                {/* Form Column */}
                <div className="bg-white rounded-3xl p-5 sm:p-8 border-2 border-slate-300 shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-650/5 rounded-full -mr-16 -mt-16 blur-2xl transition-colors"></div>
                    <h2 className={`text-xl font-black text-slate-900 mb-6 tracking-tight flex items-center gap-3 ${currentLang === 'ta' ? 'font-tamil' : 'font-header'}`}>
                        <span className="w-8 h-1 bg-red-600 rounded-full"></span>
                        {t('contact_page.form.title', { lng: currentLang })}
                    </h2>

                    <form className="space-y-5 relative">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="group">
                                <label className="block text-[10px] font-black text-slate-500 mb-1.5 uppercase tracking-wider font-header group-focus-within:text-red-600 transition-colors">{t('contact_page.form.name', { lng: currentLang })}</label>
                                <input
                                    type="text"
                                    placeholder={t('contact_page.form.name_placeholder', { lng: currentLang })}
                                    className="w-full px-3.5 py-3 rounded-xl border-2 border-slate-300 bg-white hover:border-slate-400 focus:border-red-600 focus:ring-4 focus:ring-red-500/10 transition-all duration-200 outline-none text-slate-800 font-semibold text-xs sm:text-sm placeholder-slate-400"
                                />
                            </div>

                            <div className="group">
                                <label className="block text-[10px] font-black text-slate-500 mb-1.5 uppercase tracking-wider font-header group-focus-within:text-red-600 transition-colors">{t('contact_page.form.email', { lng: currentLang })}</label>
                                <input
                                    type="email"
                                    placeholder={t('contact_page.form.email_placeholder', { lng: currentLang })}
                                    className="w-full px-3.5 py-3 rounded-xl border-2 border-slate-300 bg-white hover:border-slate-400 focus:border-red-600 focus:ring-4 focus:ring-red-500/10 transition-all duration-200 outline-none text-slate-800 font-semibold text-xs sm:text-sm placeholder-slate-400"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="group">
                                <label className="block text-[10px] font-black text-slate-500 mb-1.5 uppercase tracking-wider font-header group-focus-within:text-red-600 transition-colors">{t('contact_page.form.phone', { lng: currentLang })}</label>
                                <input
                                    type="text"
                                    placeholder={t('contact_page.form.phone_placeholder', { lng: currentLang })}
                                    className="w-full px-3.5 py-3 rounded-xl border-2 border-slate-300 bg-white hover:border-slate-400 focus:border-red-600 focus:ring-4 focus:ring-red-500/10 transition-all duration-200 outline-none text-slate-800 font-semibold text-xs sm:text-sm placeholder-slate-400"
                                />
                            </div>

                            <div className="group">
                                <label className="block text-[10px] font-black text-slate-500 mb-1.5 uppercase tracking-wider font-header group-focus-within:text-red-600 transition-colors">{t('contact_page.form.subject', { lng: currentLang })}</label>
                                <input
                                    type="text"
                                    placeholder={t('contact_page.form.subject_placeholder', { lng: currentLang })}
                                    className="w-full px-3.5 py-3 rounded-xl border-2 border-slate-300 bg-white hover:border-slate-400 focus:border-red-600 focus:ring-4 focus:ring-red-500/10 transition-all duration-200 outline-none text-slate-800 font-semibold text-xs sm:text-sm placeholder-slate-400"
                                />
                            </div>
                        </div>

                        <div className="group">
                            <label className="block text-[10px] font-black text-slate-500 mb-1.5 uppercase tracking-wider font-header group-focus-within:text-red-600 transition-colors">{t('contact_page.form.message', { lng: currentLang })}</label>
                            <textarea
                                rows="4"
                                placeholder={t('contact_page.form.message_placeholder', { lng: currentLang })}
                                className="w-full px-3.5 py-3 rounded-xl border-2 border-slate-300 bg-white hover:border-slate-400 focus:border-red-600 focus:ring-4 focus:ring-red-500/10 transition-all duration-200 outline-none text-slate-800 font-semibold text-xs sm:text-sm placeholder-slate-400 resize-none"
                            ></textarea>
                        </div>

                        <button className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl text-xs sm:text-sm font-black shadow-md shadow-red-500/10 hover:shadow-lg hover:shadow-red-500/20 active:translate-y-0 transition-all uppercase tracking-wider font-header cursor-pointer">
                            {t('contact_page.form.send', { lng: currentLang })}
                        </button>
                    </form>
                </div>

                {/* Info Column */}
                <div className="space-y-6 relative">
                    {isAdmin() && (
                        <div className="absolute top-4 right-4 z-40">
                            <button onClick={openEditor} className="bg-white rounded-full p-2 shadow border border-slate-200 hover:bg-slate-50 transition cursor-pointer" title="Edit contact"><Pencil size={15} className="text-slate-700"/></button>
                        </div>
                    )}
                    <div className="bg-slate-900 rounded-3xl p-5 sm:p-8 shadow-xl text-white h-fit relative overflow-hidden group border border-slate-800">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-white/10 transition-colors duration-700"></div>

                        <h2 className={`text-xl font-black mb-6 tracking-tight uppercase ${currentLang === 'ta' ? 'font-tamil' : 'font-header'}`}>{t('contact_page.office.title', { lng: currentLang })}</h2>

                        <div className="space-y-5 mb-8 relative">
                            <div className="flex items-start gap-4 group/item">
                                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
                                    <MapPin className="text-white" size={18} />
                                </div>
                                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-bold italic pt-1">{t('contact_page.office.address', { lng: currentLang })}</p>
                            </div>
                            <div className="flex items-center gap-4 group/item">
                                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
                                    <Phone className="text-white" size={18} />
                                </div>
                                <p className="text-slate-300 text-xs sm:text-sm font-bold italic">{t('contact_page.office.phone', { lng: currentLang })}</p>
                            </div>
                            <div className="flex items-center gap-4 group/item">
                                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
                                    <Mail className="text-white" size={18} />
                                </div>
                                <p className="text-slate-300 text-xs sm:text-sm font-bold italic truncate">{t('contact_page.office.email', { lng: currentLang })}</p>
                            </div>

                                <ContactEditorModal open={editorOpen} onClose={() => setEditorOpen(false)} item={editingItem} onSave={async (data) => {
                                    const api = import.meta.env.VITE_API_URL || '';
                                    const token = localStorage.getItem('tvpk_token');
                                    try {
                                        const res = await fetch(`${api}/admin/content`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ content: data, focus: 'contact' }) });
                                        const out = await res.json();
                                        if (!res.ok) return alert(out.error || 'Save failed');
                                        window.dispatchEvent(new CustomEvent('tvpk-content-updated', { detail: { section: 'contact', content: out.content?.contact } }));
                                        setEditorOpen(false);
                                    } catch (e) { alert('Save failed'); }
                                }} />
                        </div>

                        <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
                            <h3 className={`text-sm font-black mb-5 uppercase tracking-wider font-header text-red-400`}>{t('contact_page.office.hours.title', { lng: currentLang })}</h3>
                            <div className="space-y-3.5">
                                <div className="flex justify-between text-xs sm:text-sm font-bold">
                                    <span className="text-slate-400 uppercase tracking-wider">{t('contact_page.office.hours.days.weekday', { lng: currentLang })}</span>
                                    <span className="text-white italic">{t('contact_page.office.hours.times.weekday', { lng: currentLang })}</span>
                                </div>
                                <div className="flex justify-between text-xs sm:text-sm font-bold">
                                    <span className="text-slate-400 uppercase tracking-wider">{t('contact_page.office.hours.days.saturday', { lng: currentLang })}</span>
                                    <span className="text-white italic">{t('contact_page.office.hours.times.saturday', { lng: currentLang })}</span>
                                </div>
                                <div className="flex justify-between text-xs sm:text-sm font-bold">
                                    <span className="text-slate-400 uppercase tracking-wider">{t('contact_page.office.hours.days.sunday', { lng: currentLang })}</span>
                                    <span className="text-red-400 italic font-black uppercase tracking-wider">{t('contact_page.office.hours.times.sunday', { lng: currentLang })}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Social Links */}
                    <div className="bg-red-650 bg-red-600 rounded-3xl p-5 sm:p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg shadow-red-500/10">
                        <h3 className={`text-base font-black uppercase tracking-wider ${i18n.language === 'ta' ? 'font-tamil' : 'font-header'}`}>{t('contact_page.connect')}</h3>
                        <div className="flex gap-3">
                            <button className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center hover:bg-white text-white hover:text-red-600 transition-all cursor-pointer"><Facebook size={18} /></button>
                            <button className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center hover:bg-white text-white hover:text-red-600 transition-all cursor-pointer"><Twitter size={18} /></button>
                            <button className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center hover:bg-white text-white hover:text-red-600 transition-all cursor-pointer"><Instagram size={18} /></button>
                        </div>
                    </div>
                </div>

            </div>

            </div>
        </div>
    );
};

export default Contact;
