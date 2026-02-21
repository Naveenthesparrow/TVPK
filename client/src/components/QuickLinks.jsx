import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Users, BookOpen, Volume2, Link as LinkIcon, Camera, Phone, Heart } from 'lucide-react';

const QuickLinkCard = ({ icon: Icon, title, desc, to }) => (
    <Link to={to} className="block">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-lg hover:-translate-y-1 hover:border-primary/20 transition-all duration-300 text-center cursor-pointer group h-full">
            <div className="w-14 h-14 bg-red-50 text-primary rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-sm group-hover:shadow-lg group-hover:shadow-primary/20">
                <Icon size={26} />
            </div>
            <h4 className="font-header font-black text-lg text-slate-900 mb-2 tracking-tight">{title}</h4>
            <p className="text-slate-400 text-xs font-medium">{desc}</p>
        </div>
    </Link>
);

const QuickLinks = () => {
    const { t } = useTranslation();

    const links = [
        { icon: Users, title: t('quick_links.history.title'), desc: t('quick_links.history.desc'), to: '/history' },
        { icon: BookOpen, title: t('quick_links.leadership.title'), desc: t('quick_links.leadership.desc'), to: '/leader' },
        { icon: Volume2, title: t('quick_links.manifesto.title'), desc: t('quick_links.manifesto.desc'), to: '/manifesto' },
        { icon: LinkIcon, title: t('quick_links.news.title'), desc: t('quick_links.news.desc'), to: '/news' },
        { icon: Camera, title: t('quick_links.gallery.title'), desc: t('quick_links.gallery.desc'), to: '/gallery' },
        { icon: Phone, title: t('quick_links.contact.title'), desc: t('quick_links.contact.desc'), to: '/contact' },
        { icon: Heart, title: t('quick_links.donate.title'), desc: t('quick_links.donate.desc'), to: '/donate' },
    ];

    return (
        <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="font-header font-black text-4xl text-slate-900 text-center mb-16 tracking-tight">{t('quick_links.title')}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {links.map((link, index) => (
                        <QuickLinkCard key={index} {...link} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default QuickLinks;
