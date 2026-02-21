import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, CreditCard, Smartphone, Landmark, Wallet } from 'lucide-react';

const Donation = () => {
    const { t, i18n } = useTranslation();
    const [amount, setAmount] = useState(100);
    const [customAmount, setCustomAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('card');

    const presetAmounts = [100, 250, 500, 1000, 2500, 5000];

    return (
        <div className="bg-slate-50/50 py-24 min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                <div className="text-center mb-20">
                    <h1 className={`text-3xl md:text-6xl font-black text-slate-900 mb-6 tracking-tighter uppercase ${i18n.language === 'ta' ? 'font-tamil' : 'font-header'}`}>
                        {t('donation.title')}
                    </h1>
                    <div className="h-1.5 w-24 bg-primary mx-auto rounded-full"></div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

                    {/* Column 1: Info */}
                    <div className="bg-white rounded-[2.5rem] p-6 md:p-10 border border-slate-100 shadow-xl shadow-slate-200/50">
                        <div className="flex flex-col items-center text-center mb-10">
                            <div className="w-20 h-20 bg-primary rounded-3xl flex items-center justify-center text-white mb-6 shadow-2xl shadow-primary/30 transform -rotate-6 hover:rotate-0 transition-transform">
                                <div className="border-4 border-white/30 rounded-full p-3">
                                    <div className="bg-white w-4 h-4 rounded-full"></div>
                                </div>
                            </div>
                            <h2 className={`text-3xl font-black text-slate-900 leading-none mb-3 uppercase tracking-tighter ${i18n.language === 'ta' ? 'font-tamil' : 'font-header'}`}>
                                {t('brand.name')}
                            </h2>
                            <p className={`text-primary font-black italic text-xl tracking-tight uppercase ${i18n.language === 'ta' ? 'font-tamil' : 'font-header'}`}>
                                {t('donation.slogan')}
                            </p>
                        </div>

                        <div className="space-y-8">
                            <p className="text-slate-500 text-base leading-relaxed font-medium">
                                {t('donation.info.desc')}
                            </p>

                            <div className="space-y-5">
                                <h3 className={`font-black text-slate-900 text-sm uppercase tracking-[0.2em] font-header`}>
                                    {t('donation.info.why_title')}
                                </h3>
                                <ul className="space-y-4">
                                    {[1, 2, 3].map((i) => (
                                        <li key={i} className="flex gap-4 group">
                                            <CheckCircle2 className="text-primary flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" size={20} />
                                            <p className="text-slate-600 text-sm font-medium">
                                                <span dangerouslySetInnerHTML={{ __html: t(`donation.info.point${i}`).replace(/\*\*(.*?)\*\*/g, '<span class="font-black text-slate-900">$1</span>') }} />
                                            </p>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="pt-8 border-t border-slate-100">
                                <h3 className={`font-black text-slate-900 text-sm uppercase tracking-[0.2em] font-header mb-3`}>
                                    {t('donation.info.secure_title')}
                                </h3>
                                <p className="text-slate-400 text-xs leading-relaxed font-medium">
                                    {t('donation.info.secure_desc')}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Column 2: Contribution */}
                    <div className="bg-white rounded-[2.5rem] p-6 md:p-10 border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col">
                        <h3 className={`text-xl font-black text-slate-900 mb-8 tracking-tight uppercase ${i18n.language === 'ta' ? 'font-tamil' : 'font-header'}`}>{t('donation.contribution.title')}</h3>

                        <div className="grid grid-cols-3 gap-4 mb-6">
                            {presetAmounts.map((amt) => (
                                <button
                                    key={amt}
                                    onClick={() => { setAmount(amt); setCustomAmount(''); }}
                                    className={`py-4 rounded-2xl text-sm font-black transition-all border-2 uppercase tracking-wider font-header ${amount === amt && !customAmount
                                        ? 'bg-primary border-primary text-white shadow-xl shadow-primary/30 transform -translate-y-1'
                                        : 'bg-white border-slate-100 text-slate-600 hover:border-primary/30 hover:text-primary hover:bg-primary/5'
                                        }`}
                                >
                                    ₹{amt}
                                </button>
                            ))}
                        </div>

                        <div className="mb-10">
                            <p className="text-[10px] text-slate-400 mb-3 uppercase tracking-[0.3em] font-black font-header">{t('donation.contribution.custom_amount_prompt')}</p>
                            <div className="relative group">
                                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-black text-lg">₹</span>
                                <input
                                    type="text"
                                    placeholder={t('donation.contribution.custom_placeholder')}
                                    value={customAmount}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/[^0-9]/g, '');
                                        setCustomAmount(val);
                                        setAmount(parseInt(val) || 0);
                                    }}
                                    className="w-full pl-12 pr-6 py-5 rounded-[1.5rem] bg-slate-50 border-2 border-slate-100 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary text-slate-900 font-bold text-lg transition-all group-hover:border-slate-200"
                                />
                            </div>
                        </div>

                        <h3 className={`text-xl font-black text-slate-900 mb-8 tracking-tight uppercase ${i18n.language === 'ta' ? 'font-tamil' : 'font-header'}`}>{t('donation.contribution.payment_method_title')}</h3>
                        <div className="grid grid-cols-4 gap-2 mb-10 bg-slate-50 p-1.5 rounded-[1.5rem]">
                            {[
                                { id: 'card', icon: CreditCard, label: t('donation.contribution.methods.card') },
                                { id: 'upi', icon: Smartphone, label: t('donation.contribution.methods.upi') },
                                { id: 'netbanking', icon: Landmark, label: t('donation.contribution.methods.netbanking') },
                                { id: 'wallet', icon: Wallet, label: t('donation.contribution.methods.wallet') },
                            ].map((method) => (
                                <button
                                    key={method.id}
                                    onClick={() => setPaymentMethod(method.id)}
                                    className={`flex flex-col items-center py-4 px-1 rounded-2xl transition-all font-header ${paymentMethod === method.id
                                        ? 'bg-white text-primary shadow-lg border border-slate-100'
                                        : 'text-slate-400 hover:text-slate-600'
                                        }`}
                                >
                                    <method.icon size={22} className="mb-2" />
                                    <span className="text-[9px] font-black uppercase tracking-widest">{method.label}</span>
                                </button>
                            ))}
                        </div>

                        {paymentMethod === 'card' && (
                            <div className="space-y-5 p-6 bg-slate-50 rounded-[2rem] border border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 font-header">{t('donation.contribution.card_number')}</label>
                                    <input type="text" placeholder="XXXX XXXX XXXX XXXX" className="w-full px-5 py-4 bg-white border-2 border-white rounded-xl text-sm font-bold text-slate-900 focus:ring-4 focus:ring-primary/10 transition-all" />
                                </div>
                                <div className="grid grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 font-header">{t('donation.contribution.expiry')}</label>
                                        <input type="text" placeholder="MM/YY" className="w-full px-5 py-4 bg-white border-2 border-white rounded-xl text-sm font-bold text-slate-900 focus:ring-4 focus:ring-primary/10 transition-all" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 font-header">{t('donation.contribution.cvv')}</label>
                                        <input type="password" placeholder="***" className="w-full px-5 py-4 bg-white border-2 border-white rounded-xl text-sm font-bold text-slate-900 focus:ring-4 focus:ring-primary/10 transition-all" />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Column 3: Summary & Personal Details */}
                    <div className="flex flex-col gap-10">
                        <div className="bg-white rounded-[2.5rem] p-6 md:p-10 border border-slate-100 shadow-xl shadow-slate-200/50 flex-grow">
                            <h3 className={`text-xl font-black text-slate-900 mb-8 tracking-tight uppercase ${i18n.language === 'ta' ? 'font-tamil' : 'font-header'}`}>{t('donation.summary.title')}</h3>

                            <div className="space-y-6 mb-10">
                                <div className="group">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 font-header group-focus-within:text-primary transition-colors">{t('donation.summary.name_label')}</label>
                                    <input type="text" placeholder={t('donation.summary.name_placeholder')} className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all" />
                                </div>
                                <div className="group">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 font-header group-focus-within:text-primary transition-colors">{t('donation.summary.email_label')}</label>
                                    <input type="email" placeholder={t('donation.summary.email_placeholder')} className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all" />
                                </div>

                                <label className="flex items-start gap-4 cursor-pointer group p-2">
                                    <div className="relative">
                                        <input type="checkbox" className="peer hidden" defaultChecked />
                                        <div className="w-6 h-6 border-2 border-slate-200 rounded-lg group-hover:border-primary transition-colors peer-checked:bg-primary peer-checked:border-primary flex items-center justify-center">
                                            <div className="w-2 h-2 rounded-full bg-white opacity-0 peer-checked:opacity-100 transition-opacity"></div>
                                        </div>
                                    </div>
                                    <span className="text-xs text-slate-500 font-medium leading-tight select-none pt-0.5">
                                        {t('donation.summary.updates_check')}
                                    </span>
                                </label>
                            </div>

                            <div className="bg-primary/5 rounded-[2rem] p-8 mb-10 border border-primary/10 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-primary/10 transition-colors"></div>
                                <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-6 font-header">{t('donation.summary.box_title')}</h4>
                                <div className="space-y-4 relative">
                                    <div className="flex justify-between items-end">
                                        <span className="text-slate-500 font-bold text-sm">{t('donation.summary.amount')}</span>
                                        <span className="font-black text-slate-900 text-3xl font-header tracking-tight">₹{amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                    </div>
                                    <div className="flex justify-between text-sm pt-2 border-t border-primary/10">
                                        <span className="text-slate-500 font-medium">{t('donation.summary.method')}</span>
                                        <span className="text-slate-800 font-black uppercase tracking-wider text-xs font-header">{paymentMethod}</span>
                                    </div>
                                </div>
                            </div>

                            <button className="w-full bg-primary text-white py-5 rounded-[1.5rem] text-sm font-black shadow-2xl shadow-primary/30 hover:shadow-primary/40 hover:-translate-y-1 active:translate-y-0 transition-all uppercase tracking-[0.2em] font-header">
                                {t('donation.summary.btn')}
                            </button>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
};

export default Donation;
