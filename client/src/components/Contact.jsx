import React from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, Phone, Mail, Facebook, Twitter, Instagram } from 'lucide-react';

const Contact = () => {
    const { t, i18n } = useTranslation();

    return (
        <div className="bg-white min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">

                <div className="text-center mb-20">
                    <h1 className={`text-4xl md:text-6xl font-black text-slate-900 mb-6 tracking-tighter uppercase ${i18n.language === 'ta' ? 'font-tamil' : 'font-header'}`}>
                        {t('contact_page.title')}
                    </h1>
                    <p className="max-w-3xl mx-auto text-slate-500 text-lg leading-relaxed font-medium">
                        {t('contact_page.subtitle')}
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">

                    {/* Form Column */}
                    <div className="bg-white rounded-[2.5rem] p-12 border border-slate-100 shadow-2xl shadow-slate-200/50 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-primary/10 transition-colors"></div>
                        <h2 className={`text-2xl font-black text-slate-900 mb-10 tracking-tight flex items-center gap-4 ${i18n.language === 'ta' ? 'font-tamil' : 'font-header'}`}>
                            <span className="w-10 h-1 bg-primary rounded-full"></span>
                            {t('contact_page.form.title')}
                        </h2>

                        <form className="space-y-8 relative">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="group">
                                    <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-[0.2em] font-header group-focus-within:text-primary transition-colors">{t('contact_page.form.name')}</label>
                                    <input
                                        type="text"
                                        placeholder={t('contact_page.form.name_placeholder')}
                                        className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all"
                                    />
                                </div>

                                <div className="group">
                                    <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-[0.2em] font-header group-focus-within:text-primary transition-colors">{t('contact_page.form.email')}</label>
                                    <input
                                        type="email"
                                        placeholder={t('contact_page.form.email_placeholder')}
                                        className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="group">
                                    <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-[0.2em] font-header group-focus-within:text-primary transition-colors">{t('contact_page.form.phone')}</label>
                                    <input
                                        type="text"
                                        placeholder={t('contact_page.form.phone_placeholder')}
                                        className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all"
                                    />
                                </div>

                                <div className="group">
                                    <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-[0.2em] font-header group-focus-within:text-primary transition-colors">{t('contact_page.form.subject')}</label>
                                    <input
                                        type="text"
                                        placeholder={t('contact_page.form.subject_placeholder')}
                                        className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all"
                                    />
                                </div>
                            </div>

                            <div className="group">
                                <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-[0.2em] font-header group-focus-within:text-primary transition-colors">{t('contact_page.form.message')}</label>
                                <textarea
                                    rows="6"
                                    placeholder={t('contact_page.form.message_placeholder')}
                                    className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all resize-none"
                                ></textarea>
                            </div>

                            <button className="w-full bg-primary text-white py-5 rounded-[1.5rem] text-sm font-black shadow-2xl shadow-primary/30 hover:shadow-primary/40 hover:-translate-y-1 active:translate-y-0 transition-all uppercase tracking-[0.2em] font-header">
                                {t('contact_page.form.send')}
                            </button>
                        </form>
                    </div>

                    {/* Info Column */}
                    <div className="space-y-10">
                        <div className="bg-slate-900 rounded-[2.5rem] p-12 shadow-2xl shadow-slate-900/40 text-white h-fit relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-white/10 transition-colors duration-700"></div>

                            <h2 className={`text-2xl font-black mb-10 tracking-tight uppercase ${i18n.language === 'ta' ? 'font-tamil' : 'font-header'}`}>{t('contact_page.office.title')}</h2>

                            <div className="space-y-8 mb-12 relative">
                                <div className="flex items-start gap-6 group/item">
                                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center group-hover/item:bg-primary transition-colors">
                                        <MapPin className="text-white" size={20} />
                                    </div>
                                    <p className="text-slate-300 text-base leading-relaxed font-bold italic pt-2">{t('contact_page.office.address')}</p>
                                </div>
                                <div className="flex items-center gap-6 group/item">
                                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center group-hover/item:bg-primary transition-colors">
                                        <Phone className="text-white" size={20} />
                                    </div>
                                    <p className="text-slate-300 text-base font-bold italic">{t('contact_page.office.phone')}</p>
                                </div>
                                <div className="flex items-center gap-6 group/item">
                                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center group-hover/item:bg-primary transition-colors">
                                        <Mail className="text-white" size={20} />
                                    </div>
                                    <p className="text-slate-300 text-base font-bold italic">{t('contact_page.office.email')}</p>
                                </div>
                            </div>

                            <div className="bg-white/5 rounded-[2rem] p-10 border border-white/10">
                                <h3 className={`text-lg font-black mb-8 uppercase tracking-[0.2em] font-header text-primary`}>{t('contact_page.office.hours.title')}</h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between text-sm font-bold">
                                        <span className="text-slate-400 uppercase tracking-widest">{t('contact_page.office.hours.days.weekday')}</span>
                                        <span className="text-white italic">{t('contact_page.office.hours.times.weekday')}</span>
                                    </div>
                                    <div className="flex justify-between text-sm font-bold">
                                        <span className="text-slate-400 uppercase tracking-widest">{t('contact_page.office.hours.days.saturday')}</span>
                                        <span className="text-white italic">{t('contact_page.office.hours.times.saturday')}</span>
                                    </div>
                                    <div className="flex justify-between text-sm font-bold">
                                        <span className="text-slate-400 uppercase tracking-widest">{t('contact_page.office.hours.days.sunday')}</span>
                                        <span className="text-red-400 italic font-black uppercase tracking-widest">{t('contact_page.office.hours.times.sunday')}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Social Links */}
                        <div className="bg-primary rounded-[2.5rem] p-10 text-white flex items-center justify-between shadow-2xl shadow-primary/30">
                            <h3 className={`text-xl font-black uppercase tracking-widest ${i18n.language === 'ta' ? 'font-tamil' : 'font-header'}`}>{t('contact_page.connect')}</h3>
                            <div className="flex gap-4">
                                <button className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center hover:bg-white text-white hover:text-primary transition-all"><Facebook size={20} /></button>
                                <button className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center hover:bg-white text-white hover:text-primary transition-all"><Twitter size={20} /></button>
                                <button className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center hover:bg-white text-white hover:text-primary transition-all"><Instagram size={20} /></button>
                            </div>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
};

export default Contact;
