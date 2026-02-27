import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const LeaderAchievementEditorModal = ({ open, onClose, item, index, onSave, onDelete }) => {
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
  const [form, setForm] = useState({ en: '', ta: '' });
  
  useEffect(() => {
    const v = makeVal(item);
    setForm({ en: v.en || '', ta: v.ta || '' });
  }, [item]);
  
  useEffect(() => {
    if (open) setLang(currentLang || 'en');
  }, [open, currentLang]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-60 flex items-start justify-center p-6 overflow-auto">
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
      <div className="relative max-w-lg w-full bg-white rounded shadow-xl p-6 z-70 max-h-[calc(100vh-48px)] overflow-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">{index != null ? t('editor.edit_achievement', { lng: currentLang }) || 'Edit Achievement' : t('editor.add_achievement', { lng: currentLang }) || 'Add Achievement'}</h3>
          <button onClick={onClose} className="px-3 py-1 border rounded">{t('editor.close', { lng: currentLang })}</button>
        </div>
        
        <div className="mb-3 flex gap-2">
          <button onClick={() => setLang('en')} className={`px-3 py-1 rounded ${lang === 'en' ? 'bg-primary text-white' : 'bg-slate-100'}`}>{t('editor.english', { lng: currentLang })}</button>
          <button onClick={() => setLang('ta')} className={`px-3 py-1 rounded ${lang === 'ta' ? 'bg-primary text-white' : 'bg-slate-100'}`}>{t('editor.tamil', { lng: currentLang })}</button>
        </div>
        
        <div className="mb-4">
          <label className="text-sm font-semibold">{t('editor.text_label', { lng: lang }) || 'Text'}</label>
          <input value={form[lang]} onChange={e => setForm(f => ({ ...f, [lang]: e.target.value }))} className="border px-3 py-2 rounded w-full" />
        </div>
        <div className="flex gap-3">
          <button onClick={() => {
            const out = { en: form.en, ta: form.ta };
            onSave(out, index);
          }} className="px-4 py-2 bg-[#d21d1d] text-white rounded">{t('editor.save', { lng: currentLang })}</button>
          <button onClick={() => setForm({ en: '', ta: '' })} className="px-4 py-2 border rounded">{t('editor.clear', { lng: currentLang })}</button>
          {index != null && <button onClick={() => onDelete(index)} className="px-4 py-2 border rounded bg-red-50 text-red-700">{t('editor.delete', { lng: currentLang })}</button>}
        </div>
      </div>
    </div>
  );
};

export default LeaderAchievementEditorModal;
