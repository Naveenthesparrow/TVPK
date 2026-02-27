import React from 'react';
import { useTranslation } from 'react-i18next';

export default function JoinEditorModal({ open, onClose, item, onSave }) {
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
      title: '', desc: '', name: '', email: '', phone: '', dob: '',
      aadharNumber: '', address: '', additionalInfo: '', uploadAadhar: '',
      chooseFile: '', noFileChosen: '', confirmBorn: '', agreeRules: '',
      submit: '', reset: ''
    },
    ta: {
      title: '', desc: '', name: '', email: '', phone: '', dob: '',
      aadharNumber: '', address: '', additionalInfo: '', uploadAadhar: '',
      chooseFile: '', noFileChosen: '', confirmBorn: '', agreeRules: '',
      submit: '', reset: ''
    }
  });

  React.useEffect(() => {
    const s = item || {};
    setForm({
      en: {
        title: makeVal(s.title).en || '',
        desc: makeVal(s.desc).en || '',
        name: makeVal(s.name).en || '',
        email: makeVal(s.email).en || '',
        phone: makeVal(s.phone).en || '',
        dob: makeVal(s.dob).en || '',
        aadharNumber: makeVal(s.aadharNumber).en || '',
        address: makeVal(s.address).en || '',
        additionalInfo: makeVal(s.additionalInfo).en || '',
        uploadAadhar: makeVal(s.uploadAadhar).en || '',
        chooseFile: makeVal(s.chooseFile).en || '',
        noFileChosen: makeVal(s.noFileChosen).en || '',
        confirmBorn: makeVal(s.confirmBorn).en || '',
        agreeRules: makeVal(s.agreeRules).en || '',
        submit: makeVal(s.submit).en || '',
        reset: makeVal(s.reset).en || ''
      },
      ta: {
        title: makeVal(s.title).ta || '',
        desc: makeVal(s.desc).ta || '',
        name: makeVal(s.name).ta || '',
        email: makeVal(s.email).ta || '',
        phone: makeVal(s.phone).ta || '',
        dob: makeVal(s.dob).ta || '',
        aadharNumber: makeVal(s.aadharNumber).ta || '',
        address: makeVal(s.address).ta || '',
        additionalInfo: makeVal(s.additionalInfo).ta || '',
        uploadAadhar: makeVal(s.uploadAadhar).ta || '',
        chooseFile: makeVal(s.chooseFile).ta || '',
        noFileChosen: makeVal(s.noFileChosen).ta || '',
        confirmBorn: makeVal(s.confirmBorn).ta || '',
        agreeRules: makeVal(s.agreeRules).ta || '',
        submit: makeVal(s.submit).ta || '',
        reset: makeVal(s.reset).ta || ''
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
          <h3 className="text-lg font-bold">{t('editor.edit_join_page', { lng: currentLang })}</h3>
          <button onClick={onClose} className="px-3 py-1 border rounded">{t('editor.close', { lng: currentLang })}</button>
        </div>

        <div className="mb-3 flex gap-2">
          <button onClick={() => setLang('en')} className={`px-3 py-1 rounded ${lang === 'en' ? 'bg-primary text-white' : 'bg-slate-100'}`}>{t('editor.english', { lng: currentLang })}</button>
          <button onClick={() => setLang('ta')} className={`px-3 py-1 rounded ${lang === 'ta' ? 'bg-primary text-white' : 'bg-slate-100'}`}>{t('editor.tamil', { lng: currentLang })}</button>
        </div>

        <div className="space-y-3">
          <label className="block text-xs font-bold">{t('editor.page_title', { lng: lang })}</label>
          <input className="w-full border rounded px-3 py-2" {...bind('title')} />

          <label className="block text-xs font-bold">{t('editor.description_label', { lng: lang })}</label>
          <textarea className="w-full border rounded px-3 py-2" rows={2} {...bind('desc')} />

          <h4 className="text-sm font-black mt-4">{t('editor.form_labels', { lng: lang })}</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input className="w-full border rounded px-3 py-2" placeholder={t('editor.name_label', { lng: lang })} {...bind('name')} />
            <input className="w-full border rounded px-3 py-2" placeholder={t('editor.email_label', { lng: lang })} {...bind('email')} />
            <input className="w-full border rounded px-3 py-2" placeholder={t('editor.phone_label', { lng: lang })} {...bind('phone')} />
            <input className="w-full border rounded px-3 py-2" placeholder={t('editor.dob_label', { lng: lang })} {...bind('dob')} />
            <input className="w-full border rounded px-3 py-2" placeholder={t('editor.aadhar_label', { lng: lang })} {...bind('aadharNumber')} />
            <input className="w-full border rounded px-3 py-2" placeholder={t('editor.address_label', { lng: lang })} {...bind('address')} />
            <input className="w-full border rounded px-3 py-2" placeholder={t('editor.additional_info_label', { lng: lang })} {...bind('additionalInfo')} />
            <input className="w-full border rounded px-3 py-2" placeholder={t('editor.upload_aadhar_label', { lng: lang })} {...bind('uploadAadhar')} />
            <input className="w-full border rounded px-3 py-2" placeholder={t('editor.choose_file_text', { lng: lang })} {...bind('chooseFile')} />
            <input className="w-full border rounded px-3 py-2" placeholder={t('editor.no_file_chosen', { lng: lang })} {...bind('noFileChosen')} />
            <input className="w-full border rounded px-3 py-2" placeholder={t('editor.confirm_born_text', { lng: lang })} {...bind('confirmBorn')} />
            <input className="w-full border rounded px-3 py-2" placeholder={t('editor.agree_rules_text', { lng: lang })} {...bind('agreeRules')} />
            <input className="w-full border rounded px-3 py-2" placeholder={t('editor.submit_button_text', { lng: lang })} {...bind('submit')} />
            <input className="w-full border rounded px-3 py-2" placeholder={t('editor.reset_button_text', { lng: lang })} {...bind('reset')} />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded bg-slate-100">{t('editor.cancel', { lng: currentLang })}</button>
          <button onClick={() => {
            const out = {
              title: { en: form.en.title, ta: form.ta.title },
              desc: { en: form.en.desc, ta: form.ta.desc },
              name: { en: form.en.name, ta: form.ta.name },
              email: { en: form.en.email, ta: form.ta.email },
              phone: { en: form.en.phone, ta: form.ta.phone },
              dob: { en: form.en.dob, ta: form.ta.dob },
              aadharNumber: { en: form.en.aadharNumber, ta: form.ta.aadharNumber },
              address: { en: form.en.address, ta: form.ta.address },
              additionalInfo: { en: form.en.additionalInfo, ta: form.ta.additionalInfo },
              uploadAadhar: { en: form.en.uploadAadhar, ta: form.ta.uploadAadhar },
              chooseFile: { en: form.en.chooseFile, ta: form.ta.chooseFile },
              noFileChosen: { en: form.en.noFileChosen, ta: form.ta.noFileChosen },
              confirmBorn: { en: form.en.confirmBorn, ta: form.ta.confirmBorn },
              agreeRules: { en: form.en.agreeRules, ta: form.ta.agreeRules },
              submit: { en: form.en.submit, ta: form.ta.submit },
              reset: { en: form.en.reset, ta: form.ta.reset }
            };
            onSave(out);
          }} className="px-4 py-2 rounded bg-primary text-white font-black">{t('editor.save', { lng: currentLang })}</button>
        </div>
      </div>
    </div>
  );
}
