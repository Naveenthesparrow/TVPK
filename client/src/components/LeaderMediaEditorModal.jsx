import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const LeaderMediaEditorModal = ({ open, onClose, item, index, onSave, onDelete }) => {
  const { t, i18n } = useTranslation();
  const currentLang = (i18n.resolvedLanguage || i18n.language || 'en').split('-')[0];
  const [value, setValue] = useState('');

  useEffect(() => { setValue(item || ''); }, [item]);
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-start justify-center p-6 overflow-auto">
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
      <div className="relative max-w-lg w-full bg-white rounded shadow-xl p-6 z-70 max-h-[calc(100vh-48px)] overflow-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">{index != null ? t('editor.edit_media_item', { lng: currentLang }) : t('editor.add_media_item', { lng: currentLang })}</h3>
          <button onClick={onClose} className="px-3 py-1 border rounded">{t('editor.close', { lng: currentLang })}</button>
        </div>

        <div className="mb-4">
          <label className="text-sm font-semibold">{t('editor.url_label', { lng: currentLang })}</label>
          <input value={value} onChange={e => setValue(e.target.value)} className="border px-3 py-2 rounded w-full" />
        </div>

        <div className="flex gap-3">
          <button onClick={() => onSave(value, index)} className="px-4 py-2 bg-[#d21d1d] text-white rounded">{t('editor.save', { lng: currentLang })}</button>
          <button onClick={() => setValue('')} className="px-4 py-2 border rounded">{t('editor.clear', { lng: currentLang })}</button>
          {index != null && <button onClick={() => onDelete(index)} className="px-4 py-2 border rounded bg-red-50 text-red-700">{t('editor.delete', { lng: currentLang })}</button>}
        </div>
      </div>
    </div>
  );
};

export default LeaderMediaEditorModal;
