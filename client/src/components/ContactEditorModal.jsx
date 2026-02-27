import React from 'react';
import { useTranslation } from 'react-i18next';

export default function ContactEditorModal({ open, onClose, item, onSave }) {
  const s = item || {};
  const [lang, setLang] = React.useState('en');

  const makeVal = (v) => {
    if (typeof v === 'object' && v !== null) {
      // Already bilingual - use exact values, don't fallback
      return { en: v.en || '', ta: v.ta || '' };
    }
    // Old single-language data - seed both as starting point
    return { en: v || '', ta: v || '' };
  };

  const [form, setForm] = React.useState({
    en: { title: '', subtitle: '', office_address: '' },
    ta: { title: '', subtitle: '', office_address: '' },
    common: {
      office_phone: '',
      office_email: '',
      office_hours: { weekday: '', saturday: '', sunday: '' },
      connect: { facebook: '', twitter: '', instagram: '' }
    }
  });

  React.useEffect(() => {
    const v = item || {};
    const title = makeVal(v.title);
    const subtitle = makeVal(v.subtitle);
    setForm({
      en: { title: title.en || '', subtitle: subtitle.en || '', office_address: makeVal(v.office?.address).en || '' },
      ta: { title: title.ta || '', subtitle: subtitle.ta || '', office_address: makeVal(v.office?.address).ta || '' },
      common: {
        office_phone: v.office?.phone || '',
        office_email: v.office?.email || '',
        office_hours: {
          weekday: v.office?.hours?.weekday || '',
          saturday: v.office?.hours?.saturday || '',
          sunday: v.office?.hours?.sunday || ''
        },
        connect: {
          facebook: v.connect?.facebook || '',
          twitter: v.connect?.twitter || '',
          instagram: v.connect?.instagram || ''
        }
      }
    });
  }, [item]);
  const { t } = useTranslation();
  const { i18n } = useTranslation();
  const currentLang = (i18n.resolvedLanguage || i18n.language || 'en').split('-')[0];

  if (!open) return null;

  const bindT = (key) => ({
    value: form[lang][key] || '',
    onChange: (e) => setForm(f => ({ ...f, [lang]: { ...f[lang], [key]: e.target.value } }))
  });

  const bindCommon = (keyPath) => {
    return {
      value: keyPath.split('.').reduce((acc, k) => acc?.[k], form.common) || '',
      onChange: (e) => setForm(f => {
        const next = { ...f };
        const parts = keyPath.split('.');
        let cur = next.common;
        for (let i = 0; i < parts.length - 1; i++) cur = cur[parts[i]] = { ...cur[parts[i]] };
        cur[parts[parts.length - 1]] = e.target.value;
        return next;
      })
    };
  };

  
  return (
    <div className="fixed inset-0 z-60 flex items-start justify-center p-6 overflow-auto">
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
      <div className="relative max-w-3xl w-full bg-white rounded shadow-xl p-6 z-70 max-h-[calc(100vh-48px)] overflow-auto text-slate-900">
        <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">{t('editor.edit_contact', { lng: currentLang })}</h3>
                <button onClick={onClose} className="px-3 py-1 border rounded">{t('editor.close', { lng: currentLang })}</button>
        </div>

        <div className="mb-3 flex gap-2">
          <button onClick={() => setLang('en')} className={`px-3 py-1 rounded ${lang === 'en' ? 'bg-primary text-white' : 'bg-slate-100'}`}>EN</button>
          <button onClick={() => setLang('ta')} className={`px-3 py-1 rounded ${lang === 'ta' ? 'bg-primary text-white' : 'bg-slate-100'}`}>அ</button>
        </div>

        <div className="space-y-3">
          <label className="block text-xs font-bold">{t('editor.title_label', { lng: lang })}</label>
          <input className="w-full border rounded px-3 py-2" {...bindT('title')} />

          <label className="block text-xs font-bold">{t('editor.subtitle_label', { lng: lang })}</label>
          <textarea className="w-full border rounded px-3 py-2" rows={2} {...bindT('subtitle')} />

          <h4 className="text-sm font-black mt-4">Office</h4>
          <label className="block text-xs font-bold">Address</label>
          <textarea className="w-full border rounded px-3 py-2" rows={2} {...bindT('office_address')} />

          <div className="grid grid-cols-2 gap-3">
            <div>
                    <label className="block text-xs font-bold">{t('editor.phone', { lng: currentLang })}</label>
              <input className="w-full border rounded px-3 py-2" {...bindCommon('office_phone')} />
            </div>
            <div>
                    <label className="block text-xs font-bold">{t('editor.email', { lng: currentLang })}</label>
              <input className="w-full border rounded px-3 py-2" {...bindCommon('office_email')} />
            </div>
          </div>

          <h4 className="text-sm font-black mt-4">Hours</h4>
          <div className="grid grid-cols-3 gap-3">
            <input className="w-full border rounded px-3 py-2" placeholder="Weekday" {...bindCommon('office_hours.weekday')} />
            <input className="w-full border rounded px-3 py-2" placeholder="Saturday" {...bindCommon('office_hours.saturday')} />
            <input className="w-full border rounded px-3 py-2" placeholder="Sunday" {...bindCommon('office_hours.sunday')} />
          </div>

          <h4 className="text-sm font-black mt-4">Social Links</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input className="w-full border rounded px-3 py-2" placeholder="Facebook" {...bindCommon('connect.facebook')} />
            <input className="w-full border rounded px-3 py-2" placeholder="Twitter" {...bindCommon('connect.twitter')} />
            <input className="w-full border rounded px-3 py-2" placeholder="Instagram" {...bindCommon('connect.instagram')} />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded bg-slate-100">{t('editor.cancel', { lng: currentLang })}</button>
          <button onClick={() => {
            const out = {
              title: { en: form.en.title, ta: form.ta.title },
              subtitle: { en: form.en.subtitle, ta: form.ta.subtitle },
              office: {
                address: { en: form.en.office_address, ta: form.ta.office_address },
                phone: form.common.office_phone,
                email: form.common.office_email,
                hours: form.common.office_hours
              },
              connect: form.common.connect
            };
            onSave(out);
          }} className="px-4 py-2 rounded bg-primary text-white font-black">{t('editor.save', { lng: currentLang })}</button>
        </div>
      </div>
    </div>
  );
}
