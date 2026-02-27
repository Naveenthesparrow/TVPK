import React from 'react';
import { useTranslation } from 'react-i18next';

export default function ManifestoSummaryEditorModal({ open, onClose, item, onSave }) {
    const { t, i18n } = useTranslation();
    const currentLang = (i18n.resolvedLanguage || i18n.language || 'en').split('-')[0];
    const [lang, setLang] = React.useState(currentLang || 'en');
    
    const makeVal = (v) => {
      if (typeof v === 'object' && v !== null) {
        // Already bilingual - use exact values, don't fallback
        return { en: v.en || '', ta: v.ta || '' };
      }
      // Old single-language data - seed both as starting point
      return { en: v || '', ta: v || '' };
    };
    
    const [form, setForm] = React.useState({
        en: {
            title: '', summary_text_1: '', summary_text_2: '',
            key_pillars_text: '', environment_text: '', download_btn: ''
        },
        ta: {
            title: '', summary_text_1: '', summary_text_2: '',
            key_pillars_text: '', environment_text: '', download_btn: ''
        }
    });

    React.useEffect(() => {
        const s = item || {};
        setForm({
            en: {
                title: makeVal(s.title).en || '',
                summary_text_1: makeVal(s.summary_text_1).en || '',
                summary_text_2: makeVal(s.summary_text_2).en || '',
                key_pillars_text: makeVal(s.key_pillars_text).en || '',
                environment_text: makeVal(s.environment_text).en || '',
                download_btn: makeVal(s.download_btn).en || ''
            },
            ta: {
                title: makeVal(s.title).ta || '',
                summary_text_1: makeVal(s.summary_text_1).ta || '',
                summary_text_2: makeVal(s.summary_text_2).ta || '',
                key_pillars_text: makeVal(s.key_pillars_text).ta || '',
                environment_text: makeVal(s.environment_text).ta || '',
                download_btn: makeVal(s.download_btn).ta || ''
            }
        });
    }, [item]);
    
    React.useEffect(() => {
        if (open) setLang(currentLang || 'en');
    }, [open, currentLang]);

    if (!open) return null;

    const bind = (key) => ({
        value: form[lang][key] || '',
        onChange: (e) => setForm(f => ({ ...f, [lang]: { ...f[lang], [key]: e.target.value } }))
    });

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-6 bg-black/30 overflow-auto">
            <div className="bg-white rounded-2xl w-full max-w-3xl mt-12 p-6 max-h-[calc(100vh-48px)] overflow-auto shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-black">{t('editor.edit_manifesto_summary', { lng: currentLang })}</h3>
                    <div className="flex items-center gap-2">
                        <button onClick={onClose} className="text-sm text-slate-500">{t('editor.close', { lng: currentLang })}</button>
                    </div>
                </div>

                <div className="mb-3 flex gap-2">
                    <button onClick={() => setLang('en')} className={`px-3 py-1 rounded ${lang === 'en' ? 'bg-primary text-white' : 'bg-slate-100'}`}>{t('editor.english', { lng: currentLang })}</button>
                    <button onClick={() => setLang('ta')} className={`px-3 py-1 rounded ${lang === 'ta' ? 'bg-primary text-white' : 'bg-slate-100'}`}>{t('editor.tamil', { lng: currentLang })}</button>
                </div>

                <div className="space-y-4">
                    <label className="block">
                        <div className="text-xs font-bold mb-1">{t('editor.title_label', { lng: lang })}</div>
                        <input className="w-full border rounded px-3 py-2" {...bind('title')} />
                    </label>

                    <label className="block">
                        <div className="text-xs font-bold mb-1">{t('editor.summary_paragraph_1', { lng: lang })}</div>
                        <textarea className="w-full border rounded px-3 py-2" rows={4} {...bind('summary_text_1')} />
                    </label>

                    <label className="block">
                        <div className="text-xs font-bold mb-1">{t('editor.summary_paragraph_2', { lng: lang })}</div>
                        <textarea className="w-full border rounded px-3 py-2" rows={4} {...bind('summary_text_2')} />
                    </label>

                    <label className="block">
                        <div className="text-xs font-bold mb-1">{t('editor.key_pillars_text', { lng: lang })}</div>
                        <textarea className="w-full border rounded px-3 py-2" rows={3} {...bind('key_pillars_text')} />
                    </label>

                    <label className="block">
                        <div className="text-xs font-bold mb-1">{t('editor.environment_blurb', { lng: lang })}</div>
                        <textarea className="w-full border rounded px-3 py-2" rows={3} {...bind('environment_text')} />
                    </label>

                    <label className="block">
                        <div className="text-xs font-bold mb-1">{t('editor.download_button_text', { lng: lang })}</div>
                        <input className="w-full border rounded px-3 py-2" {...bind('download_btn')} />
                    </label>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 rounded bg-slate-100">{t('editor.cancel', { lng: currentLang })}</button>
                    <button onClick={() => {
                        const out = {
                            title: { en: form.en.title, ta: form.ta.title },
                            summary_text_1: { en: form.en.summary_text_1, ta: form.ta.summary_text_1 },
                            summary_text_2: { en: form.en.summary_text_2, ta: form.ta.summary_text_2 },
                            key_pillars_text: { en: form.en.key_pillars_text, ta: form.ta.key_pillars_text },
                            environment_text: { en: form.en.environment_text, ta: form.ta.environment_text },
                            download_btn: { en: form.en.download_btn, ta: form.ta.download_btn }
                        };
                        onSave(out);
                    }} className="px-4 py-2 rounded bg-primary text-white font-black">{t('editor.save', { lng: currentLang })}</button>
                </div>
            </div>
        </div>
    );
}
