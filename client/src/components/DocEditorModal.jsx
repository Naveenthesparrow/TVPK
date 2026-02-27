import React from 'react';
import { useTranslation } from 'react-i18next';

export default function DocEditorModal({ open, onClose, item, onSave, docKey }) {
    const { t, i18n } = useTranslation();
    const currentLang = (i18n.resolvedLanguage || i18n.language || 'en').split('-')[0];
    const [lang, setLang] = React.useState(currentLang || 'en');

    const makeVal = (v) => {
      if (typeof v === 'object' && v !== null) return { en: v.en || '', ta: v.ta || '' };
      return { en: v || '', ta: v || '' };
    };

    const [form, setForm] = React.useState({ en: { title: '', body: '' }, ta: { title: '', body: '' } });

    React.useEffect(() => {
        const s = item || {};
        setForm({
            en: { title: makeVal(s.title).en || '', body: makeVal(s.body).en || '' },
            ta: { title: makeVal(s.title).ta || '', body: makeVal(s.body).ta || '' }
        });
    }, [item]);

    React.useEffect(() => { if (open) setLang(currentLang || 'en'); }, [open, currentLang]);
    if (!open) return null;

    const bind = (key) => ({ value: form[lang][key] || '', onChange: (e) => setForm(f => ({ ...f, [lang]: { ...f[lang], [key]: e.target.value } })) });

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-6 bg-black/30 overflow-auto">
            <div className="bg-white rounded-2xl w-full max-w-3xl mt-12 p-6 max-h-[calc(100vh-48px)] overflow-auto shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-black">{t('editor.edit_document', { lng: currentLang })} — {docKey}</h3>
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
                        <div className="text-xs font-bold mb-1">{t('editor.body_label', { lng: lang })}</div>
                        <textarea className="w-full border rounded px-3 py-2" rows={8} {...bind('body')} />
                    </label>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 rounded bg-slate-100">{t('editor.cancel', { lng: currentLang })}</button>
                    <button onClick={() => { onSave({ title: { en: form.en.title, ta: form.ta.title }, body: { en: form.en.body, ta: form.ta.body } }); }} className="px-4 py-2 rounded bg-primary text-white font-black">{t('editor.save', { lng: currentLang })}</button>
                </div>
            </div>
        </div>
    );
}
