import React, { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';

export default function EventEditorModal({ open, onClose, item, index, onSave, onDelete }) {
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
  const [form, setForm] = useState({ en: { title: '', desc: '' }, ta: { title: '', desc: '' }, common: { date: '', month: '' } });

  useEffect(() => {
    const v = item || {};
    const title = makeVal(v.title);
    const desc = makeVal(v.desc);
    setForm({ en: { title: title.en || '', desc: desc.en || '' }, ta: { title: title.ta || '', desc: desc.ta || '' }, common: { date: v.date || '', month: v.month || '' } });
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
          <h3 className="text-lg font-bold">{index != null ? t('editor.edit_event', { lng: currentLang }) || 'Edit Event' : t('editor.add_event', { lng: currentLang }) || 'Add Event'}</h3>
          <button onClick={onClose} className="px-3 py-1 border rounded">{t('editor.close', { lng: currentLang })}</button>
        </div>

        <div className="mb-3 flex gap-2">
          <button onClick={() => setLang('en')} className={`px-3 py-1 rounded ${lang === 'en' ? 'bg-primary text-white' : 'bg-slate-100'}`}>{t('editor.english', { lng: currentLang })}</button>
          <button onClick={() => setLang('ta')} className={`px-3 py-1 rounded ${lang === 'ta' ? 'bg-primary text-white' : 'bg-slate-100'}`}>{t('editor.tamil', { lng: currentLang })}</button>
        </div>

        <div className="grid grid-cols-1 gap-3 mb-4">
          <label className="text-sm font-semibold">{t('editor.title_label', { lng: lang })}</label>
          <input value={form[lang].title} onChange={e => setForm(f => ({ ...f, [lang]: { ...f[lang], title: e.target.value } }))} className="border px-3 py-2 rounded" />

          <label className="text-sm font-semibold">{t('editor.day_label', { lng: lang }) || 'Day'}</label>
          <input value={form.common.date} onChange={e => setForm(f => ({ ...f, common: { ...f.common, date: e.target.value } }))} className="border px-3 py-2 rounded" />

          <label className="text-sm font-semibold">{t('editor.month_label', { lng: lang }) || 'Month'}</label>
          <input value={form.common.month} onChange={e => setForm(f => ({ ...f, common: { ...f.common, month: e.target.value } }))} className="border px-3 py-2 rounded" />

          <label className="text-sm font-semibold">{t('editor.short_description', { lng: lang })}</label>
          <textarea value={form[lang].desc} onChange={e => setForm(f => ({ ...f, [lang]: { ...f[lang], desc: e.target.value } }))} className="border px-3 py-2 rounded h-24" />
        </div>

        <div className="flex gap-3">
          <button onClick={() => {
            const out = { title: { en: form.en.title, ta: form.ta.title }, desc: { en: form.en.desc, ta: form.ta.desc }, date: form.common.date, month: form.common.month };
            onSave(out, index);
          }} className="px-4 py-2 bg-[#d21d1d] text-white rounded">{t('editor.save', { lng: currentLang })}</button>
          <button onClick={() => setForm({ en: { title: '', desc: '' }, ta: { title: '', desc: '' }, common: { date: '', month: '' } })} className="px-4 py-2 border rounded">{t('editor.clear', { lng: currentLang })}</button>
          {index != null && <button onClick={() => onDelete(index)} className="px-4 py-2 border rounded bg-red-50 text-red-700">{t('editor.delete', { lng: currentLang })}</button>}
        </div>
      </div>
    </div>
  );
}
