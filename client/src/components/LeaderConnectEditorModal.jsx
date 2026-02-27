import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const LeaderConnectEditorModal = ({ open, onClose, item, onSave }) => {
  const { t, i18n } = useTranslation();
  const currentLang = (i18n.resolvedLanguage || i18n.language || 'en').split('-')[0];
  const [form, setForm] = useState({ facebook: '', twitter: '', instagram: '', youtube: '' });

  useEffect(() => {
    setForm({
      facebook: item?.facebook || '',
      twitter: item?.twitter || '',
      instagram: item?.instagram || '',
      youtube: item?.youtube || ''
    });
  }, [item]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-start justify-center p-6 overflow-auto">
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
      <div className="relative max-w-lg w-full bg-white rounded shadow-xl p-6 z-70 max-h-[calc(100vh-48px)] overflow-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">{t('editor.edit_social_links', { lng: currentLang })}</h3>
          <button onClick={onClose} className="px-3 py-1 border rounded">{t('editor.close', { lng: currentLang })}</button>
        </div>

        <div className="grid grid-cols-1 gap-3 mb-4">
          <label className="text-sm font-semibold">{t('editor.facebook', { lng: currentLang })}</label>
          <input value={form.facebook} onChange={e => setForm(f => ({ ...f, facebook: e.target.value }))} className="border px-3 py-2 rounded" />

          <label className="text-sm font-semibold">{t('editor.twitter', { lng: currentLang })}</label>
          <input value={form.twitter} onChange={e => setForm(f => ({ ...f, twitter: e.target.value }))} className="border px-3 py-2 rounded" />

          <label className="text-sm font-semibold">{t('editor.instagram', { lng: currentLang })}</label>
          <input value={form.instagram} onChange={e => setForm(f => ({ ...f, instagram: e.target.value }))} className="border px-3 py-2 rounded" />

          <label className="text-sm font-semibold">{t('editor.youtube', { lng: currentLang })}</label>
          <input value={form.youtube} onChange={e => setForm(f => ({ ...f, youtube: e.target.value }))} className="border px-3 py-2 rounded" />
        </div>

        <div className="flex gap-3">
          <button onClick={() => onSave(form)} className="px-4 py-2 bg-[#d21d1d] text-white rounded">{t('editor.save', { lng: currentLang })}</button>
          <button onClick={() => setForm({ facebook: '', twitter: '', instagram: '', youtube: '' })} className="px-4 py-2 border rounded">{t('editor.clear', { lng: currentLang })}</button>
        </div>
      </div>
    </div>
  );
};

export default LeaderConnectEditorModal;
