import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const GalleryEditorModal = ({ open, onClose, item, index, onSave, onDelete }) => {
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
  
  const [form, setForm] = useState({
    en: { title: '', desc: '', location: '', period: '' },
    ta: { title: '', desc: '', location: '', period: '' },
    common: { img: '' }
  });

  useEffect(() => {
    if (item) {
      setForm({
        en: {
          title: makeVal(item.title).en || '',
          desc: makeVal(item.desc).en || '',
          location: item.location_en || makeVal(item.location).en || '',
          period: item.period_en || makeVal(item.period).en || ''
        },
        ta: {
          title: makeVal(item.title).ta || '',
          desc: makeVal(item.desc).ta || '',
          location: item.location_ta || makeVal(item.location).ta || '',
          period: item.period_ta || makeVal(item.period).ta || ''
        },
        common: { img: item.img || '' }
      });
    }
  }, [item]);
  
  useEffect(() => {
    if (open) setLang(currentLang || 'en');
  }, [open, currentLang]);

  if (!open) return null;

  const bind = (key) => ({
    value: form[lang][key] || '',
    onChange: (e) => setForm(f => ({ ...f, [lang]: { ...f[lang], [key]: e.target.value } }))
  });

  return (
    <div className="fixed inset-0 z-60 flex items-start justify-center p-6 overflow-auto">
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
      <div className="relative max-w-3xl w-full bg-white rounded shadow-xl p-6 z-70 max-h-[calc(100vh-48px)] overflow-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">{index != null ? t('editor.edit_gallery', { lng: currentLang }) : t('editor.add_gallery', { lng: currentLang })}</h3>
          <button onClick={onClose} className="px-3 py-1 border rounded">{t('editor.close', { lng: currentLang })}</button>
        </div>

        <div className="mb-3 flex gap-2">
          <button onClick={() => setLang('en')} className={`px-3 py-1 rounded ${lang === 'en' ? 'bg-primary text-white' : 'bg-slate-100'}`}>{t('editor.english', { lng: currentLang })}</button>
          <button onClick={() => setLang('ta')} className={`px-3 py-1 rounded ${lang === 'ta' ? 'bg-primary text-white' : 'bg-slate-100'}`}>{t('editor.tamil', { lng: currentLang })}</button>
        </div>

        <div className="grid grid-cols-1 gap-3 mb-4">
          <label className="text-sm font-semibold">{t('editor.title_label', { lng: lang })}</label>
          <input {...bind('title')} className="border px-3 py-2 rounded" />

          <label className="text-sm font-semibold">{t('editor.image_url', { lng: lang })}</label>
          <input value={form.common.img} onChange={e => setForm(f => ({ ...f, common: { ...f.common, img: e.target.value } }))} className="border px-3 py-2 rounded" />

          <label className="text-sm font-semibold">{t('editor.description_label', { lng: lang })}</label>
          <textarea {...bind('desc')} className="border px-3 py-2 rounded h-24" />

          <label className="text-sm font-semibold">{t('editor.location', { lng: lang })}</label>
          <input {...bind('location')} className="border px-3 py-2 rounded" />

          <label className="text-sm font-semibold">{t('editor.period', { lng: lang })}</label>
          <input {...bind('period')} className="border px-3 py-2 rounded" />
        </div>

        <div className="flex gap-3">
          <button onClick={() => {
            const out = {
              title: { en: form.en.title, ta: form.ta.title },
              desc: { en: form.en.desc, ta: form.ta.desc },
              img: form.common.img,
              location: { en: form.en.location, ta: form.ta.location },
              period: { en: form.en.period, ta: form.ta.period },
              // Backward compatibility
              location_en: form.en.location,
              location_ta: form.ta.location,
              period_en: form.en.period,
              period_ta: form.ta.period
            };
            onSave(out, index);
          }} className="px-4 py-2 bg-[#d21d1d] text-white rounded">{t('editor.save', { lng: currentLang })}</button>
          <button onClick={() => { 
            setForm({
              en: { title: '', desc: '', location: '', period: '' },
              ta: { title: '', desc: '', location: '', period: '' },
              common: { img: '' }
            });
          }} className="px-4 py-2 border rounded">{t('editor.clear', { lng: currentLang })}</button>
          {index != null && <button onClick={() => onDelete(index)} className="px-4 py-2 border rounded bg-red-50 text-red-700">{t('editor.delete', { lng: currentLang })}</button>}
        </div>
      </div>
    </div>
  );
};

export default GalleryEditorModal;
