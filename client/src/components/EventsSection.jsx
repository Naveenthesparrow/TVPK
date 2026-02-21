import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronRight } from 'lucide-react';

const EventItem = ({ title, date, month }) => (
    <Link to="/news" className="block">
        <div className="flex items-center justify-between p-5 border-b border-slate-100 hover:bg-slate-50 transition-colors group cursor-pointer">
            <div className="flex items-center gap-6">
                <div className="flex flex-col items-center justify-center bg-primary text-white w-16 h-16 rounded-2xl shrink-0 shadow-lg shadow-primary/20">
                    <span className="text-[10px] font-black uppercase tracking-widest font-header">{month}</span>
                    <span className="text-2xl font-black leading-none font-header">{date}</span>
                </div>
                <h4 className="font-header font-black text-lg text-slate-800 group-hover:text-primary transition-colors tracking-tight">{title}</h4>
            </div>
            <ChevronRight className="text-slate-300 group-hover:text-primary transition-colors shrink-0" />
        </div>
    </Link>
);

const EventsSection = () => {
    const { t } = useTranslation();

    return (
        <section className="py-20 bg-slate-50">
            <div className="max-w-4xl mx-auto px-4">
                <h2 className="font-header font-black text-4xl text-slate-900 text-center mb-16 tracking-tight">{t('upcoming_events.title')}</h2>
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-100">
                    <EventItem title={t('upcoming_events.event1.title')} date={t('upcoming_events.event1.day')} month={t('upcoming_events.event1.month')} />
                    <EventItem title={t('upcoming_events.event2.title')} date={t('upcoming_events.event2.day')} month={t('upcoming_events.event2.month')} />
                    <EventItem title={t('upcoming_events.event3.title')} date={t('upcoming_events.event3.day')} month={t('upcoming_events.event3.month')} />
                </div>
            </div>
        </section>
    );
};

export default EventsSection;
