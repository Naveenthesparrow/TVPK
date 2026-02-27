import React from 'react';
import { useTranslation } from 'react-i18next';

export default function HeroEditorModal({ open, onClose, item, onSave }) {
  const safe = item || {};
  const { i18n, t } = useTranslation();
  const currentLang = (i18n.resolvedLanguage || i18n.language || 'en').split('-')[0];
  const [lang, setLang] = React.useState(currentLang || 'en');
  const [form, setForm] = React.useState({
    en: {
      title: (safe.title && typeof safe.title === 'string') ? safe.title : (safe.title?.en || ''),
      desc: (safe.desc && typeof safe.desc === 'string') ? safe.desc : (safe.desc?.en || ''),
      cta_learn_more: (safe.cta_learn_more && typeof safe.cta_learn_more === 'string') ? safe.cta_learn_more : (safe.cta_learn_more?.en || ''),
      cta_join: (safe.cta_join && typeof safe.cta_join === 'string') ? safe.cta_join : (safe.cta_join?.en || '')
    },
    ta: {
      title: (safe.title && typeof safe.title !== 'string') ? (safe.title?.ta || '') : (safe.title_ta || ''),
      desc: (safe.desc && typeof safe.desc !== 'string') ? (safe.desc?.ta || '') : (safe.desc_ta || ''),
      cta_learn_more: (safe.cta_learn_more && typeof safe.cta_learn_more !== 'string') ? (safe.cta_learn_more?.ta || '') : (safe.cta_learn_more_ta || ''),
      cta_join: (safe.cta_join && typeof safe.cta_join !== 'string') ? (safe.cta_join?.ta || '') : (safe.cta_join_ta || '')
    },
    image: safe.image || ''
  });
  const fileRef = React.useRef(null);

  const onFile = (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      setForm(prev => ({ ...prev, image: reader.result }));
    };
    reader.readAsDataURL(f);
  };

  const removeImage = () => setForm(f => ({ ...f, image: '' }));

  React.useEffect(() => {
    const s = item || {};
    const next = {
      en: {
        title: (s.title && typeof s.title === 'string') ? s.title : (s.title?.en || ''),
        desc: (s.desc && typeof s.desc === 'string') ? s.desc : (s.desc?.en || ''),
        cta_learn_more: (s.cta_learn_more && typeof s.cta_learn_more === 'string') ? s.cta_learn_more : (s.cta_learn_more?.en || ''),
        cta_join: (s.cta_join && typeof s.cta_join === 'string') ? s.cta_join : (s.cta_join?.en || '')
      },
      ta: {
        title: (s.title && typeof s.title !== 'string') ? (s.title?.ta || '') : (s.title_ta || ''),
        desc: (s.desc && typeof s.desc !== 'string') ? (s.desc?.ta || '') : (s.desc_ta || ''),
        cta_learn_more: (s.cta_learn_more && typeof s.cta_learn_more !== 'string') ? (s.cta_learn_more?.ta || '') : (s.cta_learn_more_ta || ''),
        cta_join: (s.cta_join && typeof s.cta_join !== 'string') ? (s.cta_join?.ta || '') : (s.cta_join_ta || '')
      },
      image: s.image || ''
    };

    // If Tamil fields are empty, try to prefill from translation resources
    try {
      const keys = ['title', 'desc', 'cta_learn_more', 'cta_join'];
      keys.forEach(k => {
        if (!next.ta[k] || next.ta[k] === '') {
          const res = i18n.t(`hero.${k}`, { lng: 'ta' });
          if (res && typeof res === 'string' && res !== `hero.${k}`) next.ta[k] = res;
        }
      });
    } catch (e) {
      // ignore if i18n not available
    }

    setForm(prev => (next));
  }, [item]);

  React.useEffect(() => {
    if (open) setLang(currentLang || 'en');
  }, [open, currentLang]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-start justify-center p-6 overflow-auto">
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
      <div className="relative max-w-3xl w-full bg-white rounded shadow-xl p-6 z-70 max-h-[calc(100vh-48px)] overflow-auto text-slate-900">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">{t('editor.edit_hero', { lng: currentLang }) || 'Edit Hero'}</h3>
          <button onClick={onClose} className="px-3 py-1 border rounded">{t('editor.close', { lng: currentLang })}</button>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold">{t('editor.title_label', { lng: lang })}</label>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setLang('en')} className={`px-3 py-1 rounded ${lang === 'en' ? 'bg-primary text-white' : 'border'}`}>{t('editor.english', { lng: currentLang })}</button>
              <button type="button" onClick={() => setLang('ta')} className={`px-3 py-1 rounded ${lang === 'ta' ? 'bg-primary text-white' : 'border'}`}>{t('editor.tamil', { lng: currentLang })}</button>
            </div>
          </div>

          <textarea className="w-full border rounded px-3 py-2" rows={3} value={form[lang].title} onChange={e => setForm(f => ({ ...f, [lang]: { ...f[lang], title: e.target.value } }))} />

          <label className="block text-xs font-bold">{t('editor.description_label', { lng: lang })}</label>
          <textarea className="w-full border rounded px-3 py-2" rows={3} value={form[lang].desc} onChange={e => setForm(f => ({ ...f, [lang]: { ...f[lang], desc: e.target.value } }))} />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold">{t('editor.learn_more_cta', { lng: lang }) || 'Learn More CTA'}</label>
              <input className="w-full border rounded px-3 py-2" value={form[lang].cta_learn_more} onChange={e => setForm(f => ({ ...f, [lang]: { ...f[lang], cta_learn_more: e.target.value } }))} />
            </div>
            <div>
              <label className="block text-xs font-bold">{t('editor.join_cta', { lng: lang }) || 'Join CTA'}</label>
              <input className="w-full border rounded px-3 py-2" value={form[lang].cta_join} onChange={e => setForm(f => ({ ...f, [lang]: { ...f[lang], cta_join: e.target.value } }))} />
            </div>
          </div>

          <label className="block text-xs font-bold">{t('editor.hero_image', { lng: lang }) || 'Hero Image'}</label>
          <div className="flex items-center gap-3">
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
            <button type="button" onClick={() => fileRef.current && fileRef.current.click()} className="px-3 py-2 border rounded">{t('editor.choose_image', { lng: currentLang }) || 'Choose Image'}</button>
            <button type="button" onClick={() => setForm(f => ({ ...f, image: '' }))} className="px-3 py-2 border rounded">{t('editor.clear', { lng: currentLang })}</button>
          </div>
          {form.image && <div className="mt-2">
            <img src={form.image} alt="preview" className="w-full h-48 object-cover rounded" />
            <div className="mt-2">
              <button type="button" onClick={removeImage} className="px-3 py-2 border rounded bg-red-50 text-rose-600">{t('editor.remove_image', { lng: currentLang })}</button>
            </div>
          </div>}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded bg-slate-100">{t('editor.cancel')}</button>
          <button onClick={() => {
            const out = {
              title: { en: form.en.title || '', ta: form.ta.title || '' },
              desc: { en: form.en.desc || '', ta: form.ta.desc || '' },
              cta_learn_more: { en: form.en.cta_learn_more || '', ta: form.ta.cta_learn_more || '' },
              cta_join: { en: form.en.cta_join || '', ta: form.ta.cta_join || '' },
              image: form.image || ''
            };
            onSave(out);
          }} className="px-4 py-2 rounded bg-primary text-white font-black">{t('editor.save')}</button>
        </div>
      </div>
    </div>
  );
}
