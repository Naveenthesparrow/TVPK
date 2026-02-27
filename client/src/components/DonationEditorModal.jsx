import React from 'react';
import { useTranslation } from 'react-i18next';

export default function DonationEditorModal({ open, onClose, item, onSave }) {
  const s = item || {};
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
      title: '',
      slogan: '',
      info_desc: '',
      info_why_title: '',
      info_point1: '',
      info_point2: '',
      info_point3: '',
      info_secure_title: '',
      info_secure_desc: '',
      contribution_title: '',
      contribution_custom_prompt: '',
      contribution_custom_placeholder: '',
      contribution_payment_method_title: '',
      summary_title: '',
      summary_name_label: '',
      summary_email_label: '',
      summary_updates_check: '',
      summary_box_title: '',
      summary_btn: ''
    },
    ta: {
      title: '',
      slogan: '',
      info_desc: '',
      info_why_title: '',
      info_point1: '',
      info_point2: '',
      info_point3: '',
      info_secure_title: '',
      info_secure_desc: '',
      contribution_title: '',
      contribution_custom_prompt: '',
      contribution_custom_placeholder: '',
      contribution_payment_method_title: '',
      summary_title: '',
      summary_name_label: '',
      summary_email_label: '',
      summary_updates_check: '',
      summary_box_title: '',
      summary_btn: ''
    }
  });

  React.useEffect(() => {
    const v = item || {};
    const title = makeVal(v.title);
    const slogan = makeVal(v.slogan);
    const info = v.info || {};
    const contribution = v.contribution || {};
    const summary = v.summary || {};

    setForm({
      en: {
        title: title.en || '',
        slogan: slogan.en || '',
        info_desc: makeVal(info.desc).en || '',
        info_why_title: makeVal(info.why_title).en || '',
        info_point1: makeVal(info.point1).en || '',
        info_point2: makeVal(info.point2).en || '',
        info_point3: makeVal(info.point3).en || '',
        info_secure_title: makeVal(info.secure_title).en || '',
        info_secure_desc: makeVal(info.secure_desc).en || '',
        contribution_title: makeVal(contribution.title).en || '',
        contribution_custom_prompt: makeVal(contribution.custom_amount_prompt).en || '',
        contribution_custom_placeholder: makeVal(contribution.custom_placeholder).en || '',
        contribution_payment_method_title: makeVal(contribution.payment_method_title).en || '',
        summary_title: makeVal(summary.title).en || '',
        summary_name_label: makeVal(summary.name_label).en || '',
        summary_email_label: makeVal(summary.email_label).en || '',
        summary_updates_check: makeVal(summary.updates_check).en || '',
        summary_box_title: makeVal(summary.box_title).en || '',
        summary_btn: makeVal(summary.btn).en || ''
      },
      ta: {
        title: title.ta || '',
        slogan: slogan.ta || '',
        info_desc: makeVal(info.desc).ta || '',
        info_why_title: makeVal(info.why_title).ta || '',
        info_point1: makeVal(info.point1).ta || '',
        info_point2: makeVal(info.point2).ta || '',
        info_point3: makeVal(info.point3).ta || '',
        info_secure_title: makeVal(info.secure_title).ta || '',
        info_secure_desc: makeVal(info.secure_desc).ta || '',
        contribution_title: makeVal(contribution.title).ta || '',
        contribution_custom_prompt: makeVal(contribution.custom_amount_prompt).ta || '',
        contribution_custom_placeholder: makeVal(contribution.custom_placeholder).ta || '',
        contribution_payment_method_title: makeVal(contribution.payment_method_title).ta || '',
        summary_title: makeVal(summary.title).ta || '',
        summary_name_label: makeVal(summary.name_label).ta || '',
        summary_email_label: makeVal(summary.email_label).ta || '',
        summary_updates_check: makeVal(summary.updates_check).ta || '',
        summary_box_title: makeVal(summary.box_title).ta || '',
        summary_btn: makeVal(summary.btn).ta || ''
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
    <div className="fixed inset-0 z-60 flex items-start justify-center p-6 overflow-auto">
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
      <div className="relative max-w-3xl w-full bg-white rounded shadow-xl p-6 z-70 max-h-[calc(100vh-48px)] overflow-auto text-slate-900">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">{t('editor.edit_donate', { lng: currentLang })}</h3>
          <button onClick={onClose} className="px-3 py-1 border rounded">{t('editor.close', { lng: currentLang })}</button>
        </div>

        <div className="mb-3 flex gap-2">
          <button onClick={() => setLang('en')} className={`px-3 py-1 rounded ${lang === 'en' ? 'bg-primary text-white' : 'bg-slate-100'}`}>{t('editor.english', { lng: currentLang })}</button>
          <button onClick={() => setLang('ta')} className={`px-3 py-1 rounded ${lang === 'ta' ? 'bg-primary text-white' : 'bg-slate-100'}`}>{t('editor.tamil', { lng: currentLang })}</button>
        </div>

        <div className="space-y-3">
          <label className="block text-xs font-bold">{t('editor.title_label', { lng: lang })}</label>
          <input className="w-full border rounded px-3 py-2" {...bind('title')} />

          <label className="block text-xs font-bold">{t('editor.slogan', { lng: lang })}</label>
          <input className="w-full border rounded px-3 py-2" {...bind('slogan')} />

          <h4 className="text-sm font-black mt-4">{t('editor.info_section', { lng: lang })}</h4>
          <label className="block text-xs font-bold">{t('editor.description_label', { lng: lang })}</label>
          <textarea className="w-full border rounded px-3 py-2" rows={2} {...bind('info_desc')} />
          <label className="block text-xs font-bold">{t('editor.info_section', { lng: lang })}</label>
          <input className="w-full border rounded px-3 py-2" {...bind('info_why_title')} />
          <div className="grid grid-cols-1 gap-2">
            <input className="w-full border rounded px-3 py-2" placeholder={`${t('editor.point_placeholder', { lng: lang })} 1`} {...bind('info_point1')} />
            <input className="w-full border rounded px-3 py-2" placeholder={`${t('editor.point_placeholder', { lng: lang })} 2`} {...bind('info_point2')} />
            <input className="w-full border rounded px-3 py-2" placeholder={`${t('editor.point_placeholder', { lng: lang })} 3`} {...bind('info_point3')} />
          </div>

          <label className="block text-xs font-bold">{t('editor.secure_title', { lng: lang })}</label>
          <input className="w-full border rounded px-3 py-2" {...bind('info_secure_title')} />
          <label className="block text-xs font-bold">{t('editor.secure_description', { lng: lang })}</label>
          <textarea className="w-full border rounded px-3 py-2" rows={2} {...bind('info_secure_desc')} />

          <h4 className="text-sm font-black mt-4">{t('editor.contribution', { lng: lang })}</h4>
          <label className="block text-xs font-bold">{t('editor.contribution', { lng: lang })}</label>
          <input className="w-full border rounded px-3 py-2" {...bind('contribution_title')} />
          <label className="block text-xs font-bold">{t('editor.custom_amount_prompt', { lng: lang })}</label>
          <input className="w-full border rounded px-3 py-2" {...bind('contribution_custom_prompt')} />
          <label className="block text-xs font-bold">{t('editor.custom_placeholder', { lng: lang })}</label>
          <input className="w-full border rounded px-3 py-2" {...bind('contribution_custom_placeholder')} />
          <label className="block text-xs font-bold">{t('editor.payment_method_title', { lng: lang })}</label>
          <input className="w-full border rounded px-3 py-2" {...bind('contribution_payment_method_title')} />

          <h4 className="text-sm font-black mt-4">{t('editor.summary', { lng: lang })}</h4>
          <label className="block text-xs font-bold">{t('editor.summary', { lng: lang })}</label>
          <input className="w-full border rounded px-3 py-2" {...bind('summary_title')} />
          <label className="block text-xs font-bold">{t('editor.name_label', { lng: lang })}</label>
          <input className="w-full border rounded px-3 py-2" {...bind('summary_name_label')} />
          <label className="block text-xs font-bold">{t('editor.email_label', { lng: lang })}</label>
          <input className="w-full border rounded px-3 py-2" {...bind('summary_email_label')} />
          <label className="block text-xs font-bold">{t('editor.button_text', { lng: lang })}</label>
          <input className="w-full border rounded px-3 py-2" {...bind('summary_btn')} />
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded bg-slate-100">{t('editor.cancel', { lng: currentLang })}</button>
          <button onClick={() => {
            const out = {
              title: { en: form.en.title, ta: form.ta.title },
              slogan: { en: form.en.slogan, ta: form.ta.slogan },
              info: {
                desc: { en: form.en.info_desc, ta: form.ta.info_desc },
                why_title: { en: form.en.info_why_title, ta: form.ta.info_why_title },
                point1: { en: form.en.info_point1, ta: form.ta.info_point1 },
                point2: { en: form.en.info_point2, ta: form.ta.info_point2 },
                point3: { en: form.en.info_point3, ta: form.ta.info_point3 },
                secure_title: { en: form.en.info_secure_title, ta: form.ta.info_secure_title },
                secure_desc: { en: form.en.info_secure_desc, ta: form.ta.info_secure_desc }
              },
              contribution: {
                title: { en: form.en.contribution_title, ta: form.ta.contribution_title },
                custom_amount_prompt: { en: form.en.contribution_custom_prompt, ta: form.ta.contribution_custom_prompt },
                custom_placeholder: { en: form.en.contribution_custom_placeholder, ta: form.ta.contribution_custom_placeholder },
                payment_method_title: { en: form.en.contribution_payment_method_title, ta: form.ta.contribution_payment_method_title }
              },
              summary: {
                title: { en: form.en.summary_title, ta: form.ta.summary_title },
                name_label: { en: form.en.summary_name_label, ta: form.ta.summary_name_label },
                email_label: { en: form.en.summary_email_label, ta: form.ta.summary_email_label },
                updates_check: { en: form.en.summary_updates_check, ta: form.ta.summary_updates_check },
                box_title: { en: form.en.summary_box_title, ta: form.ta.summary_box_title },
                btn: { en: form.en.summary_btn, ta: form.ta.summary_btn }
              }
            };
            onSave(out);
          }} className="px-4 py-2 rounded bg-primary text-white font-black">{t('editor.save', { lng: currentLang })}</button>
        </div>
      </div>
    </div>
  );
}
