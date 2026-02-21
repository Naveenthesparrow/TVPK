import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const NewsCard = ({ title, desc, date }) => (
    <Link to="/news" className="block h-full">
        <div className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 h-full flex flex-col group border border-slate-100 hover:-translate-y-1">
            <div className="h-48 bg-slate-100 relative shrink-0 overflow-hidden">
                <div className="absolute top-3 left-3 bg-primary text-white text-xs px-3 py-1.5 rounded-xl z-10 font-bold tracking-wide shadow-lg">
                    {date}
                </div>
                <div className="w-full h-full flex items-center justify-center text-slate-300 text-sm font-medium tracking-wider uppercase">
                    Image Placeholder
                </div>
            </div>
            <div className="p-5 flex-grow">
                <h3 className="font-header font-black text-lg text-slate-900 mb-2 line-clamp-2 group-hover:text-primary transition-colors tracking-tight">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed line-clamp-3 font-medium">{desc}</p>
            </div>
        </div>
    </Link>
);

const NewsSection = () => {
    const { t } = useTranslation();

    const newsItems = [
        { title: t('recent_news.news1.title'), desc: t('recent_news.news1.desc'), date: t('recent_news.news1.date') },
        { title: t('recent_news.news2.title'), desc: t('recent_news.news2.desc'), date: t('recent_news.news2.date') },
        { title: t('recent_news.news3.title'), desc: t('recent_news.news3.desc'), date: t('recent_news.news3.date') },
        { title: t('recent_news.news4.title'), desc: t('recent_news.news4.desc'), date: t('recent_news.news4.date') },
        { title: t('recent_news.news5.title'), desc: t('recent_news.news5.desc'), date: t('recent_news.news5.date') },
    ];

    return (
        <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="font-header font-black text-4xl text-slate-900 text-center mb-16 tracking-tight">{t('recent_news.title')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {newsItems.map((item, index) => (
                        <NewsCard key={index} {...item} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default NewsSection;
