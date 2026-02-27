import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const LeaderBioEditorModal = ({ open, onClose, item, onSave }) => {
  const { t, i18n } = useTranslation();
  const currentLang = (i18n.resolvedLanguage || i18n.language || 'en').split('-')[0];
  const [lang, setLang] = useState(currentLang || 'en');
  const makeVal = (v) => {
    if (typeof v === 'object' && v !== null) {
      // Already bilingual - use exact values, don't fallback
      return { en: v.en || '', ta: v.ta || '' };
    }
    // Old single-language data - seed both as starting point
    return { en: v || '', ta: v || '' };
  };
  const [form, setForm] = useState({ en: { biography_text: '', early_life_title: '', early_life_text: '', politics_title: '', politics_text: '' }, ta: { biography_text: '', early_life_title: '', early_life_text: '', politics_title: '', politics_text: '' } });

  useEffect(() => {
    const v = item || {};
    setForm({
      en: {
        biography_text: makeVal(v.biography_text).en || '',
        early_life_title: makeVal(v.early_life_title).en || '',
        early_life_text: makeVal(v.early_life_text).en || '',
        politics_title: makeVal(v.politics_title).en || '',
        politics_text: makeVal(v.politics_text).en || ''
      },
      ta: {
        biography_text: makeVal(v.biography_text).ta || '',
        early_life_title: makeVal(v.early_life_title).ta || '',
        early_life_text: makeVal(v.early_life_text).ta || '',
        politics_title: makeVal(v.politics_title).ta || '',
        politics_text: makeVal(v.politics_text).ta || ''
      }
    });
  }, [item]);
  
  useEffect(() => {
    if (open) setLang(currentLang || 'en');
  }, [open, currentLang]);
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-start justify-center p-6 overflow-auto">
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
      <div className="relative max-w-2xl w-full bg-white rounded shadow-xl p-6 z-70 max-h-[calc(100vh-48px)] overflow-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">{t('editor.edit_biography', { lng: currentLang }) || 'Edit Biography'}</h3>
          <button onClick={onClose} className="px-3 py-1 border rounded">{t('editor.close', { lng: currentLang })}</button>
        </div>

        <div className="mb-3 flex gap-2">
          <button onClick={() => setLang('en')} className={`px-3 py-1 rounded ${lang === 'en' ? 'bg-primary text-white' : 'bg-slate-100'}`}>{t('editor.english', { lng: currentLang })}</button>
          <button onClick={() => setLang('ta')} className={`px-3 py-1 rounded ${lang === 'ta' ? 'bg-primary text-white' : 'bg-slate-100'}`}>{t('editor.tamil', { lng: currentLang })}</button>
        </div>

        <div className="grid grid-cols-1 gap-3 mb-4">
          <label className="text-sm font-semibold">{t('editor.biography_text', { lng: lang }) || 'Biography text'}</label>
          <textarea value={form[lang].biography_text} onChange={e => setForm(f => ({ ...f, [lang]: { ...f[lang], biography_text: e.target.value } }))} className="border px-3 py-2 rounded h-28" />

          <label className="text-sm font-semibold">{t('editor.early_life_title', { lng: lang }) || 'Early life title'}</label>
          <input value={form[lang].early_life_title} onChange={e => setForm(f => ({ ...f, [lang]: { ...f[lang], early_life_title: e.target.value } }))} className="border px-3 py-2 rounded" />
          <label className="text-sm font-semibold">{t('editor.early_life_text', { lng: lang }) || 'Early life text'}</label>
          <textarea value={form[lang].early_life_text} onChange={e => setForm(f => ({ ...f, [lang]: { ...f[lang], early_life_text: e.target.value } }))} className="border px-3 py-2 rounded h-20" />

          <label className="text-sm font-semibold">{t('editor.politics_title', { lng: lang }) || 'Politics title'}</label>
          <input value={form[lang].politics_title} onChange={e => setForm(f => ({ ...f, [lang]: { ...f[lang], politics_title: e.target.value } }))} className="border px-3 py-2 rounded" />
          <label className="text-sm font-semibold">{t('editor.politics_text', { lng: lang }) || 'Politics text'}</label>
          <textarea value={form[lang].politics_text} onChange={e => setForm(f => ({ ...f, [lang]: { ...f[lang], politics_text: e.target.value } }))} className="border px-3 py-2 rounded h-20" />
        </div>

        <div className="flex gap-3">
          <button onClick={() => {
            const out = {
              biography_text: { en: form.en.biography_text, ta: form.ta.biography_text },
              early_life_title: { en: form.en.early_life_title, ta: form.ta.early_life_title },
              early_life_text: { en: form.en.early_life_text, ta: form.ta.early_life_text },
              politics_title: { en: form.en.politics_title, ta: form.ta.politics_title },
              politics_text: { en: form.en.politics_text, ta: form.ta.politics_text }
            };
            onSave(out);
          }} className="px-4 py-2 bg-[#d21d1d] text-white rounded">{t('editor.save', { lng: currentLang })}</button>
          <button onClick={() => setForm({ en: { biography_text: '', early_life_title: '', early_life_text: '', politics_title: '', politics_text: '' }, ta: { biography_text: '', early_life_title: '', early_life_text: '', politics_title: '', politics_text: '' } })} className="px-4 py-2 border rounded">{t('editor.clear', { lng: currentLang })}</button>
        </div>
      </div>
    </div>
  );
};

export default LeaderBioEditorModal;
