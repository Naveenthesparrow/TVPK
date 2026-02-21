import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';

const GalleryItem = ({ title, img, onClick, language }) => (
    <div
        className="bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-primary/5 transition-all cursor-pointer group transform hover:-translate-y-2"
        onClick={onClick}
    >
        <div className="aspect-[4/3] bg-slate-100 flex items-center justify-center overflow-hidden relative">
            <img src={img} alt={title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-8">
                <span className="text-white text-xs font-black uppercase tracking-widest font-header">View Details</span>
            </div>
        </div>
        <div className="p-4">
            <h3 className={`text-base md:text-base font-black text-slate-900 line-clamp-2 leading-tight group-hover:text-primary transition-colors ${language === 'ta' ? 'font-tamil' : 'font-header'}`}>
                {title}
            </h3>
        </div>
    </div>
);

const Gallery = () => {
    const { t, i18n } = useTranslation();
    const [selectedItem, setSelectedItem] = useState(null);

    const galleryItems = t('gallery.items', { returnObjects: true });

    return (
        <div className="bg-slate-50/30 py-24 min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                <div className="text-center mb-20">
                    <h1 className={`text-3xl md:text-6xl font-black text-slate-900 mb-6 tracking-tighter uppercase ${i18n.language === 'ta' ? 'font-tamil' : 'font-header'}`}>
                        {t('gallery.title')}
                    </h1>
                    <p className="text-slate-500 text-base md:text-lg max-w-2xl mx-auto font-medium leading-relaxed">
                        {t('gallery.subtitle')}
                    </p>
                    <div className="h-1.5 w-24 bg-primary mx-auto rounded-full mt-10 opacity-30"></div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                    {Array.isArray(galleryItems) && galleryItems.map((item, index) => (
                        <GalleryItem
                            key={index}
                            title={item.title}
                            img={item.img}
                            onClick={() => setSelectedItem(item)}
                            language={i18n.language}
                        />
                    ))}
                </div>

                {/* Modal / Lightbox */}
                {selectedItem && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 md:p-12 animate-in fade-in duration-300">
                        {/* Overlay */}
                        <div
                            className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl"
                            onClick={() => setSelectedItem(null)}
                        ></div>

                        {/* Modal Content */}
                        <div className="relative bg-white rounded-[3rem] shadow-2xl max-w-5xl w-full overflow-hidden animate-in slide-in-from-bottom-10 zoom-in-95 duration-500">
                            <button
                                className="absolute top-8 right-8 text-slate-400 hover:text-primary transition-all z-20 p-3 bg-slate-50 rounded-2xl hover:bg-primary/5 hover:rotate-90"
                                onClick={() => setSelectedItem(null)}
                            >
                                <X size={24} />
                            </button>

                            <div className="flex flex-col lg:flex-row h-full">
                                <div className="lg:w-3/5 bg-slate-100 flex items-center justify-center p-0">
                                    <img src={selectedItem.img} alt={selectedItem.title} className="w-full h-full object-cover aspect-video lg:aspect-auto lg:h-[70vh]" />
                                </div>
                                <div className="lg:w-2/5 p-6 md:p-16 flex flex-col justify-center">
                                    <div className="mb-10">
                                        <span className="text-primary font-black text-xs uppercase tracking-[0.3em] font-header block mb-4">Media Archive</span>
                                        <h2 className={`text-2xl md:text-4xl font-black text-slate-900 mb-6 leading-tight ${i18n.language === 'ta' ? 'font-tamil' : 'font-header'}`}>{selectedItem.title}</h2>
                                        <div className="h-1 w-16 bg-primary rounded-full mb-10"></div>
                                        <p className="text-slate-500 text-base leading-relaxed font-medium italic">
                                            {selectedItem.desc}
                                        </p>
                                    </div>

                                    <button
                                        className="w-full py-5 bg-slate-900 text-white rounded-2xl text-sm font-black uppercase tracking-[0.2em] font-header hover:bg-primary transition-all shadow-xl shadow-slate-200"
                                        onClick={() => setSelectedItem(null)}
                                    >
                                        {t('gallery.close')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default Gallery;
