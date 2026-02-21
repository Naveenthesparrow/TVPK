import { useTranslation } from 'react-i18next';
import { Calendar, Tag, ChevronRight, Clock } from 'lucide-react';

// Unique images per card index — different photos for each news story
const CARD_IMAGES = [
    'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?q=80&w=600&h=350&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1540910419892-f0c74b045366?q=80&w=600&h=350&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?q=80&w=600&h=350&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=600&h=350&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1574943320219-553eb213f72d?q=80&w=600&h=350&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1524178232363-1fb28f74b0cd?q=80&w=600&h=350&auto=format&fit=crop',
];

const NewsCard = ({ category, title, date, desc, readMoreText, language, index }) => (
    <div className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-md hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 group transform hover:-translate-y-1 flex flex-col">
        <div className="aspect-video relative overflow-hidden shrink-0">
            <img
                src={CARD_IMAGES[index % CARD_IMAGES.length]}
                alt={title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute top-4 left-4 bg-primary text-white text-[10px] font-extrabold px-3 py-1.5 rounded-lg uppercase tracking-widest font-header shadow-lg">
                {category}
            </div>
        </div>
        <div className="p-6 flex flex-col flex-grow">
            <div className="flex items-center gap-2 text-slate-400 text-[10px] mb-3 uppercase font-extrabold tracking-widest font-header">
                <Calendar size={11} className="text-primary/60" />
                {date}
            </div>
            <h3 className={`text-base font-extrabold text-slate-900 mb-3 line-clamp-2 group-hover:text-primary transition-colors leading-snug tracking-tight flex-grow ${language === 'ta' ? 'font-tamil' : 'font-header'}`}>
                {title}
            </h3>
            <p className="text-slate-500 text-sm leading-relaxed mb-5 line-clamp-2 font-medium">
                {desc}
            </p>
            <button className="flex items-center gap-2 text-[11px] font-extrabold text-primary border border-primary/20 rounded-lg px-4 py-2.5 hover:bg-primary hover:text-white hover:border-primary transition-all uppercase tracking-[0.15em] font-header self-start">
                {readMoreText} <ChevronRight size={12} />
            </button>
        </div>
    </div>
);

const SidebarItem = ({ title, date, language }) => (
    <div className="border-b border-slate-50 py-4 last:border-0 hover:bg-slate-50/80 transition-all cursor-pointer group px-2 rounded-lg">
        <div className="flex flex-col gap-1.5">
            <span className="text-[10px] text-primary font-extrabold uppercase tracking-widest font-header flex items-center gap-1.5">
                <Clock size={10} /> {date}
            </span>
            <h4 className={`text-[13px] font-extrabold text-slate-700 line-clamp-2 leading-snug group-hover:text-primary transition-colors ${language === 'ta' ? 'font-tamil' : 'font-header'}`}>
                {title}
            </h4>
        </div>
    </div>
);

const NewsUpdates = () => {
    const { t, i18n } = useTranslation();

    const newsItems = Array.isArray(t('news.items', { returnObjects: true }))
        ? t('news.items', { returnObjects: true }) : [];
    const sidebarItems = Array.isArray(t('news.sidebar_items', { returnObjects: true }))
        ? t('news.sidebar_items', { returnObjects: true }) : [];
    const categoriesList = Array.isArray(t('news.categories_list', { returnObjects: true }))
        ? t('news.categories_list', { returnObjects: true }) : [];
    const tagsList = Array.isArray(t('news.tags_list', { returnObjects: true }))
        ? t('news.tags_list', { returnObjects: true }) : [];

    return (
        <div className="bg-slate-50/30 py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Page Header */}
                <h1 className={`text-3xl md:text-4xl font-extrabold text-slate-900 mb-12 tracking-tight ${i18n.language === 'ta' ? 'font-tamil' : 'font-header'}`}>
                    {t('news.title')}
                </h1>

                {/* Main: News Grid + Sidebar */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                    {/* News Grid — 2 column */}
                    <div className="lg:col-span-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {newsItems.map((item, index) => (
                                <NewsCard
                                    key={index}
                                    index={index}
                                    category={item.category}
                                    title={item.title}
                                    date={item.date}
                                    desc={item.desc}
                                    readMoreText={t('news.read_more')}
                                    language={i18n.language}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-4 space-y-6">

                        {/* Recent Updates */}
                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-md">
                            <h3 className="text-xs font-extrabold text-slate-900 mb-5 uppercase tracking-[0.25em] font-header flex items-center gap-2.5">
                                <span className="w-2 h-2 bg-primary rounded-full animate-pulse shrink-0"></span>
                                {t('news.sidebar.recent')}
                            </h3>
                            <div className="space-y-0">
                                {sidebarItems.map((item, index) => (
                                    <SidebarItem key={index} title={item.title} date={item.date} language={i18n.language} />
                                ))}
                            </div>
                        </div>

                        {/* Categories */}
                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-md">
                            <h3 className="text-xs font-extrabold text-slate-900 mb-5 uppercase tracking-[0.25em] font-header">
                                {t('news.sidebar.categories')}
                            </h3>
                            <div className="flex flex-col gap-2">
                                {categoriesList.map((cat, index) => (
                                    <button key={index} className="text-left text-[12px] font-extrabold text-slate-500 hover:text-primary transition-all cursor-pointer uppercase tracking-wide font-header py-1.5 border-b border-slate-50 last:border-0 hover:pl-2 transition-all duration-200">
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Tags */}
                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-md">
                            <h3 className="text-xs font-extrabold text-slate-900 mb-5 uppercase tracking-[0.25em] font-header">
                                {t('news.sidebar.tags')}
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {tagsList.map((tag, index) => (
                                    <span key={index} className="text-[11px] font-extrabold text-slate-500 hover:text-white hover:bg-primary border border-slate-200 hover:border-primary px-3 py-1.5 rounded-lg transition-all cursor-pointer uppercase tracking-wider font-header flex items-center gap-1">
                                        <Tag size={10} />
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default NewsUpdates;
