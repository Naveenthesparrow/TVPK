import React, { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';

const LeaderHeaderEditorModal = ({ open, onClose, item, onSave }) => {
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
  const [form, setForm] = useState({ en: { name: '', role: '', bio_short: '' }, ta: { name: '', role: '', bio_short: '' }, common: { image: null } });
  const fileRef = useRef(null);

  useEffect(() => {
    const v = item || {};
    const name = makeVal(v.name);
    const role = makeVal(v.role);
    const bio = makeVal(v.bio_short);
    setForm({ en: { name: name.en || '', role: role.en || '', bio_short: bio.en || '' }, ta: { name: name.ta || '', role: role.ta || '', bio_short: bio.ta || '' }, common: { image: v.image || null } });
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
          <h3 className="text-lg font-bold">Edit Leader Header</h3>
          <button onClick={onClose} className="px-3 py-1 border rounded">Close</button>
        </div>

        <div className="mb-3 flex gap-2">
          <button onClick={() => setLang('en')} className={`px-3 py-1 rounded ${lang === 'en' ? 'bg-primary text-white' : 'bg-slate-100'}`}>{t('editor.english', { lng: currentLang })}</button>
          <button onClick={() => setLang('ta')} className={`px-3 py-1 rounded ${lang === 'ta' ? 'bg-primary text-white' : 'bg-slate-100'}`}>{t('editor.tamil', { lng: currentLang })}</button>
        </div>

        <div className="grid grid-cols-1 gap-3 mb-4">
          <label className="text-sm font-semibold">{t('editor.leader_name', { lng: lang }) || 'Name'}</label>
          <input value={form[lang].name} onChange={e => setForm(f => ({ ...f, [lang]: { ...f[lang], name: e.target.value } }))} className="border px-3 py-2 rounded" />

          <label className="text-sm font-semibold">{t('editor.leader_role', { lng: lang }) || 'Role'}</label>
          <input value={form[lang].role} onChange={e => setForm(f => ({ ...f, [lang]: { ...f[lang], role: e.target.value } }))} className="border px-3 py-2 rounded" />

          <label className="text-sm font-semibold">{t('editor.bio_short', { lng: lang }) || 'Short bio'}</label>
          <textarea value={form[lang].bio_short} onChange={e => setForm(f => ({ ...f, [lang]: { ...f[lang], bio_short: e.target.value } }))} className="border px-3 py-2 rounded h-24" />

          <div>
            <label className="text-sm font-semibold">Image</label>
            <div className="mt-2 flex items-center gap-3">
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={async (e) => {
                const f = e.target.files[0];
                if (!f) return;
                const reader = new FileReader();
                reader.onload = () => setForm(fr => ({ ...fr, common: { ...fr.common, image: reader.result } }));
                reader.readAsDataURL(f);
              }} />
              <button type="button" onClick={() => fileRef.current && fileRef.current.click()} className="px-3 py-2 border rounded">{t('editor.choose_file', { lng: currentLang })}</button>
              {form.common.image ? <button type="button" onClick={() => setForm(fr => ({ ...fr, common: { ...fr.common, image: null } }))} className="px-3 py-2 border rounded bg-red-50 text-red-700">{t('editor.remove_image', { lng: currentLang })}</button> : null}
            </div>
            {form.common.image && (
              <div className="mt-3">
                <img src={form.common.image} alt="leader" className="w-full max-h-48 object-contain rounded border" />
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={() => {
            const out = {
              name: { en: form.en.name, ta: form.ta.name },
              role: { en: form.en.role, ta: form.ta.role },
              bio_short: { en: form.en.bio_short, ta: form.ta.bio_short },
              image: form.common.image
            };
            onSave(out);
          }} className="px-4 py-2 bg-[#d21d1d] text-white rounded">{t('editor.save', { lng: currentLang })}</button>
          <button onClick={() => setForm({ en: { name: '', role: '', bio_short: '' }, ta: { name: '', role: '', bio_short: '' }, common: { image: null } })} className="px-4 py-2 border rounded">{t('editor.clear', { lng: currentLang })}</button>
        </div>
      </div>
    </div>
  );
};

export default LeaderHeaderEditorModal;
