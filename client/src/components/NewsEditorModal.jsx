import React, { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';

const NewsEditorModal = ({ open, onClose, item, index, onSave, onDelete }) => {
  const { t, i18n } = useTranslation();
  const currentLang = (i18n.resolvedLanguage || i18n.language || 'en').split('-')[0];
  const [lang, setLang] = useState(currentLang || 'en');
  const [chosenFileName, setChosenFileName] = useState(null);
  const fileRef = useRef(null);

  const makeVal = (v) => {
    if (typeof v === 'object' && v !== null) {
      // Already bilingual - use exact values, don't fallback
      return { en: v.en || '', ta: v.ta || '' };
    }
    // Old single-language data - seed both as starting point
    return { en: v || '', ta: v || '' };
  };

  const [form, setForm] = useState({
    en: { title: '', desc: '' },
    ta: { title: '', desc: '' },
    common: { date: '', image: null }
  });

  useEffect(() => {
    const v = item || {};
    const title = makeVal(v.title);
    const desc = makeVal(v.desc || v.short_description || v.description);
    const date = v.date || v.date_display || v.displayDate || '';
    const image = v.image || v.img || null;

    const taTitleFallback = title.ta || i18n.t('news.title', { lng: 'ta' }) || '';
    const taDescFallback = desc.ta || i18n.t('news.description', { lng: 'ta' }) || '';

    setForm({
      en: { title: title.en || '', desc: desc.en || '' },
      ta: { title: taTitleFallback, desc: taDescFallback },
      common: { date: date || '', image: image }
    });
    setChosenFileName(null);
  }, [item, i18n]);

  useEffect(() => {
    if (open) setLang(currentLang || 'en');
  }, [open, currentLang]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-start justify-center p-6 overflow-auto">
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
      <div className="relative max-w-2xl w-full bg-white rounded shadow-xl p-6 z-70 max-h-[calc(100vh-48px)] overflow-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">{index != null ? t('editor.edit_news_item', { lng: currentLang }) : t('editor.add_news_item', { lng: currentLang })}</h3>
          <button onClick={onClose} className="px-3 py-1 border rounded">{t('editor.close', { lng: currentLang })}</button>
        </div>

        <div className="mb-3 flex gap-2">
          <button onClick={() => setLang('en')} className={`px-3 py-1 rounded ${lang === 'en' ? 'bg-primary text-white' : 'bg-slate-100'}`}>{t('editor.english', { lng: currentLang })}</button>
          <button onClick={() => setLang('ta')} className={`px-3 py-1 rounded ${lang === 'ta' ? 'bg-primary text-white' : 'bg-slate-100'}`}>{t('editor.tamil', { lng: currentLang })}</button>
        </div>

        <div className="space-y-3 mb-4">
          <label className="text-sm font-semibold">{t('editor.title_label', { lng: lang })}</label>
          <input value={form[lang].title} onChange={e => setForm(f => ({ ...f, [lang]: { ...f[lang], title: e.target.value } }))} className="border px-3 py-2 rounded w-full" />

          <label className="text-sm font-semibold">{t('editor.date_display', { lng: lang })}</label>
          <input value={form.common.date} onChange={e => setForm(f => ({ ...f, common: { ...f.common, date: e.target.value } }))} className="border px-3 py-2 rounded w-full" />

          <label className="text-sm font-semibold">{t('editor.short_description', { lng: lang })}</label>
          <textarea value={form[lang].desc} onChange={e => setForm(f => ({ ...f, [lang]: { ...f[lang], desc: e.target.value } }))} className="border px-3 py-2 rounded h-24 w-full" />

          <div>
            <label className="text-sm font-semibold">{t('editor.image_label', { lng: currentLang }) || 'Image'}</label>
            <div className="mt-2 flex items-center gap-3">
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={async (e) => {
                const f = e.target.files[0];
                if (!f) return;
                setChosenFileName(f.name);
                const reader = new FileReader();
                reader.onload = () => setForm(fr => ({ ...fr, common: { ...fr.common, image: reader.result } }));
                reader.readAsDataURL(f);
              }} />
              <button type="button" onClick={() => fileRef.current && fileRef.current.click()} className="px-3 py-2 border rounded">{t('editor.choose_file', { lng: currentLang })}</button>
              {form.common.image ? <button type="button" onClick={() => { setForm(fr => ({ ...fr, common: { ...fr.common, image: null } })); setChosenFileName(null); }} className="px-3 py-2 border rounded bg-red-50 text-red-700">{t('editor.remove_image', { lng: currentLang })}</button> : null}
              <div className="text-sm text-slate-600">{chosenFileName || (form.common.image ? t('editor.choose_file', { lng: currentLang }) : t('editor.no_image', { lng: currentLang }))}</div>
            </div>
            {form.common.image && (
              <div className="mt-3">
                <img src={form.common.image} alt="news" className="w-full max-h-48 object-contain rounded border" />
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={() => {
            const out = {
              title: { en: form.en.title, ta: form.ta.title },
              desc: { en: form.en.desc, ta: form.ta.desc },
              date: form.common.date,
              image: form.common.image
            };
            onSave(out, index);
          }} className="px-4 py-2 bg-[#d21d1d] text-white rounded">{t('editor.save', { lng: currentLang })}</button>
          <button onClick={() => setForm({ en: { title: '', desc: '' }, ta: { title: '', desc: '' }, common: { date: '', image: null } })} className="px-4 py-2 border rounded">{t('editor.clear', { lng: currentLang }) || 'Clear'}</button>
          {index != null && <button onClick={() => onDelete(index)} className="px-4 py-2 border rounded bg-red-50 text-red-700">{t('editor.delete', { lng: currentLang })}</button>}
        </div>
      </div>
    </div>
  );
};

export default NewsEditorModal;
