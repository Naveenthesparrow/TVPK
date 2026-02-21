import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import partyFlag from '../assets/party-flag.png';

const Hero = () => {
    const { t, i18n } = useTranslation();

    return (
        <div className="relative overflow-hidden">
            <div className="max-w-full mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2">
                    {/* Text Section */}
                    <div className="bg-gradient-to-br from-primary to-red-800 p-10 md:p-16 flex flex-col justify-center text-white min-h-[500px] shadow-inner">
                        <h1 className={`text-3xl md:text-5xl font-black leading-[1.1] mb-6 tracking-tighter uppercase ${i18n.language === 'ta' ? 'font-tamil' : 'font-header'}`}>
                            {t('hero.title')}
                        </h1>
                        <p className="text-white/80 text-lg mb-10 max-w-lg font-medium leading-relaxed">
                            {t('hero.desc')}
                        </p>
                        <div className="flex flex-wrap gap-5">
                            <Link to="/history">
                                <button className="bg-transparent border-2 border-white/30 text-white px-8 py-4 rounded-2xl font-black text-sm hover:bg-white hover:text-primary hover:border-white transition-all transform hover:-translate-y-1 active:translate-y-0 shadow-lg uppercase tracking-widest font-header">
                                    {t('hero.cta_learn_more')}
                                </button>
                            </Link>
                            <Link to="/contact">
                                <button className="bg-white text-primary px-10 py-4 rounded-2xl font-black text-sm hover:bg-secondary hover:text-dark transition-all transform hover:-translate-y-1 active:translate-y-0 shadow-2xl shadow-white/20 uppercase tracking-widest font-header">
                                    {t('hero.cta_join')}
                                </button>
                            </Link>
                        </div>
                    </div>

                    {/* Emblem Section */}
                    <div className="bg-secondary relative flex items-center justify-center p-8 overflow-hidden group">
                        <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-700"></div>
                        <div className="w-80 h-80 md:w-[32rem] md:h-[32rem] relative flex items-center justify-center">
                            {/* Decorative elements */}
                            <div className="absolute inset-0 border-8 border-black/10 rounded-full scale-110 animate-pulse"></div>
                            <div className="absolute inset-0 border-4 border-black/5 rounded-full scale-125"></div>

                            {/* The Flag Image */}
                            <div className="relative z-10 w-full h-full p-4 transform group-hover:scale-105 transition-transform duration-700 drop-shadow-[0_35px_35px_rgba(0,0,0,0.5)]">
                                <img
                                    src={partyFlag}
                                    alt="TVPK Party Flag"
                                    className="w-full h-full object-contain filter contrast-125 brightness-110"
                                />
                            </div>

                            {/* Floating tag */}
                            <div className="absolute bottom-10 right-0 p-4 transform translate-x-1/2 translate-y-1/2 z-20">
                                <div className="bg-slate-900 border-4 border-primary text-white px-6 py-2 rounded-xl font-black text-sm shadow-2xl uppercase tracking-[0.2em] font-header">
                                    TVPK
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Hero;
