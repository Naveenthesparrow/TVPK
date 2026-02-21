import React from 'react';
import { useTranslation } from 'react-i18next';
import { FileText, Award, Calendar, MessageSquare, PieChart, ChevronRight } from 'lucide-react';

const HistoryCard = ({ year, title, desc, image, language }) => (
    <div className="flex gap-10 mb-20 relative group">
        {/* Milestone Dot & Year */}
        <div className="flex flex-col items-center min-w-[120px] pt-12">
            <div className="w-6 h-6 bg-primary rounded-full z-10 shadow-lg shadow-primary/30 border-4 border-white group-hover:scale-125 transition-transform duration-500"></div>
            <div className="mt-4 text-slate-900 font-black text-lg font-header italic tracking-widest">{year}</div>
        </div>

        {/* Content Card */}
        <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 flex-1 flex flex-col md:flex-row gap-10 items-center transform group-hover:-translate-y-2 transition-all duration-500 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-primary/10 transition-colors"></div>
            <div className="w-full md:w-1/3 aspect-[4/3] bg-slate-50 rounded-3xl flex items-center justify-center text-slate-300 relative overflow-hidden shadow-inner">
                {/* Placeholder for image */}
                <div className="italic font-bold uppercase text-[10px] tracking-widest text-slate-200">History Media</div>
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent"></div>
            </div>
            <div className="flex-1">
                <h3 className={`text-2xl font-black mb-5 text-slate-900 leading-tight ${language === 'ta' ? 'font-tamil' : 'font-header'}`}>{title}</h3>
                <p className="text-slate-500 leading-relaxed text-base font-medium">
                    {desc}
                </p>
            </div>
        </div>
    </div>
);

const SidebarLink = ({ icon: Icon, label, language }) => (
    <div className="flex items-center justify-between p-5 bg-white rounded-2xl border border-slate-100 hover:border-primary hover:shadow-2xl hover:shadow-primary/5 shadow-xl shadow-slate-200/30 transition-all cursor-pointer group mb-4">
        <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white group-hover:rotate-6 transition-all">
                <Icon size={20} />
            </div>
            <span className={`text-sm font-black text-slate-600 group-hover:text-slate-900 uppercase tracking-widest ${language === 'ta' ? 'font-tamil' : 'font-header'}`}>{label}</span>
        </div>
        <ChevronRight size={18} className="text-slate-200 group-hover:text-primary transition-colors" />
    </div>
);

const PartyHistory = () => {
    const { t, i18n } = useTranslation();

    return (
        <div className="bg-slate-50/50 py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">

                    {/* Main Timeline Section */}
                    <div className="lg:col-span-8">
                        <div className="flex items-center gap-6 mb-16">
                            <h2 className={`text-3xl md:text-5xl font-black text-slate-900 uppercase tracking-tighter ${i18n.language === 'ta' ? 'font-tamil' : 'font-header'}`}>
                                {t('history.title')}
                            </h2>
                            <div className="h-1 flex-grow bg-slate-200 rounded-full opacity-50"></div>
                        </div>

                        <div className="relative">
                            {/* Vertical Line */}
                            <div className="absolute left-[59px] top-12 bottom-0 w-1 bg-gradient-to-b from-primary via-slate-200 to-slate-100 rounded-full opacity-20"></div>

                            <HistoryCard
                                year="1985"
                                title={t('history.milestones.1985.title')}
                                desc={t('history.milestones.1985.desc')}
                                language={i18n.language}
                            />
                            <HistoryCard
                                year="1992"
                                title={t('history.milestones.1992.title')}
                                desc={t('history.milestones.1992.desc')}
                                language={i18n.language}
                            />
                            <HistoryCard
                                year="2001"
                                title={t('history.milestones.2001.title')}
                                desc={t('history.milestones.2001.desc')}
                                language={i18n.language}
                            />
                            <HistoryCard
                                year="2010"
                                title={t('history.milestones.2010.title')}
                                desc={t('history.milestones.2010.desc')}
                                language={i18n.language}
                            />
                            <HistoryCard
                                year="2023"
                                title={t('history.milestones.2023.title')}
                                desc={t('history.milestones.2023.desc')}
                                language={i18n.language}
                            />
                        </div>
                    </div>

                    {/* Sidebar Section */}
                    <div className="lg:col-span-4">
                        <div className="sticky top-32">
                            <h3 className={`text-xl font-black mb-10 text-slate-900 uppercase tracking-[0.2em] font-header pb-4 border-b-2 border-primary w-fit`}>
                                {t('history.sidebar_title')}
                            </h3>
                            <div className="space-y-2">
                                <SidebarLink icon={FileText} label={t('history.links.constitution')} language={i18n.language} />
                                <SidebarLink icon={Award} label={t('history.links.principles')} language={i18n.language} />
                                <SidebarLink icon={Calendar} label={t('history.links.manifesto')} language={i18n.language} />
                                <SidebarLink icon={MessageSquare} label={t('history.links.speeches')} language={i18n.language} />
                                <SidebarLink icon={PieChart} label={t('history.links.statistics')} language={i18n.language} />
                            </div>

                            <div className="mt-12 p-10 bg-primary rounded-[2.5rem] shadow-2xl shadow-primary/30 text-white relative overflow-hidden group">
                                <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all"></div>
                                <h4 className="font-black text-lg mb-4 uppercase tracking-widest font-header">Join the movement</h4>
                                <p className="text-white/80 text-sm font-medium leading-relaxed mb-8">Be part of the history we are writing for the future of Tamil Nadu.</p>
                                <button className="w-full bg-white text-primary py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:shadow-white/20 transition-all transform hover:-translate-y-1 active:translate-y-0">
                                    Become a Member
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default PartyHistory;
