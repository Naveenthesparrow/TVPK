import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import enTranslations from '../locales/en.json';
import taTranslations from '../locales/ta.json';
import { Pencil } from 'lucide-react';
import JoinEditorModal from '../components/JoinEditorModal';
import { isAdmin } from '../utils/adminHelpers';

const Admin = () => {
  const { t } = useTranslation();
  const localeResources = { en: enTranslations, ta: taTranslations };

  const localT = (key) => {
    const translated = t(key);
    if (translated && translated !== key) return translated;
    // fallback: try to read from active locale resources
    try {
      const lang = (window?.localStorage?.getItem('i18nextLng')) || 'ta';
      const parts = key.split('.');
      let cur = localeResources[lang] || localeResources['ta'];
      for (const p of parts) {
        if (!cur) break;
        cur = cur[p];
      }
      if (typeof cur === 'string') return cur;
      // try English fallback
      cur = localeResources['en'];
      for (const p of parts) {
        if (!cur) break;
        cur = cur[p];
      }
      if (typeof cur === 'string') return cur;
    } catch (e) {
      /* ignore */
    }
    return key;
  };
  const api = import.meta.env.VITE_API_URL || '';
  const [applicants, setApplicants] = React.useState([]);

  React.useEffect(() => {
    const loadApplicants = async () => {
      try {
        const token = localStorage.getItem('tvpk_token');
        if (!token) { setApplicants([]); return; }
        const r = await fetch(`${api}/admin/applicants`, { headers: { Authorization: `Bearer ${token}` } });
        if (!r.ok) {
          // unauthorized or other error -> clear list
          setApplicants([]);
          return;
        }
        const j = await r.json();
        setApplicants(Array.isArray(j.applicants) ? j.applicants : []);
      } catch (e) { }
    };
    loadApplicants();
    const onUpdate = () => loadApplicants();
    const onAuth = () => loadApplicants();
    window.addEventListener('tvpk-content-updated', onUpdate);
    window.addEventListener('tvpk-auth-change', onAuth);
    return () => { window.removeEventListener('tvpk-content-updated', onUpdate); window.removeEventListener('tvpk-auth-change', onAuth); };
  }, []);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    dob: '',
    address: '',
    aadharNumber: '',
    additionalInfo: '',
    bornTamilOrKudi: false,
    agreeRules: false
  });
  const [aadharFile, setAadharFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [editorOpen, setEditorOpen] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState(null);

  const onChange = (key) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const fileInputRef = useRef(null);
  const onFile = (e) => setAadharFile(e.target.files[0] || null);

  const submit = async (e) => {
    e.preventDefault();
    setMessage(null);
    if (!form.name) return setMessage({ type: 'error', text: 'Name is required' });
    if (!form.bornTamilOrKudi) return setMessage({ type: 'error', text: 'You must confirm you were born in Tamil caste / Tamil kudi to apply' });
    if (!form.agreeRules) return setMessage({ type: 'error', text: 'You must agree to the rules to apply' });

    const fd = new FormData();
    fd.append('name', form.name);
    fd.append('email', form.email);
    fd.append('phone', form.phone);
    fd.append('dob', form.dob);
    fd.append('address', form.address);
    fd.append('aadharNumber', form.aadharNumber);
    fd.append('additionalInfo', form.additionalInfo);
    fd.append('bornTamilOrKudi', form.bornTamilOrKudi ? 'true' : 'false');
    fd.append('agreeRules', form.agreeRules ? 'true' : 'false');
    if (aadharFile) fd.append('aadharImage', aadharFile);

    try {
      setSubmitting(true);
      const res = await fetch(`${api}/members/apply`, {
        method: 'POST',
        body: fd
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: 'error', text: data.error || 'Submission failed' });
      } else {
        setMessage({ type: 'success', text: 'Application submitted successfully' });
        setForm({ name: '', email: '', phone: '', dob: '', address: '', aadharNumber: '', additionalInfo: '', bornTamilOrKudi: false, agreeRules: false });
        setAadharFile(null);
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Network error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-3xl mx-auto p-6 bg-white rounded shadow">
        <div className="relative">
          <h2 className="text-2xl font-bold mb-4">{localT('join.title')}</h2>
          {isAdmin() && (
            <div className="absolute top-0 right-0">
              <button onClick={async () => {
                const api = import.meta.env.VITE_API_URL || '';
                const token = localStorage.getItem('tvpk_token');
                try {
                  const r = await fetch(`${api}/admin/content`, { headers: { Authorization: `Bearer ${token}` } });
                  const j = await r.json();
                  const doc = j.content || {};
                  const top = doc.join || {};
                  if (!top || Object.keys(top).length === 0) {
                    setEditingItem({
                      title: localT('join.title'),
                      desc: localT('join.desc'),
                      name: localT('join.name'),
                      email: localT('join.email'),
                      phone: localT('join.phone'),
                      dob: localT('join.dob'),
                      aadharNumber: localT('join.aadharNumber'),
                      address: localT('join.address'),
                      additionalInfo: localT('join.additionalInfo'),
                      uploadAadhar: localT('join.uploadAadhar'),
                      chooseFile: localT('join.chooseFile'),
                      noFileChosen: localT('join.noFileChosen'),
                      confirmBorn: localT('join.confirmBorn'),
                      agreeRules: localT('join.agreeRules'),
                      submit: localT('join.submit'),
                      reset: localT('join.reset')
                    });
                  } else setEditingItem(top);
                } catch (e) { setEditingItem(null); }
                setEditorOpen(true);
              }} className="bg-white rounded-full p-2 shadow hover:bg-primary/5 transition" title="Edit join"><Pencil size={16} className="text-slate-700"/></button>
            </div>
          )}
        </div>
        <p className="mb-4 text-sm text-slate-600">{localT('join.desc')}</p>
        {message && (
          <div className={`mb-4 p-3 rounded ${message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>{message.text}</div>
        )}

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">{localT('join.name')}</label>
            <input value={form.name} onChange={onChange('name')} className="w-full border rounded px-3 py-2" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">{localT('join.email')}</label>
              <input value={form.email} onChange={onChange('email')} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium">{localT('join.phone')}</label>
              <input value={form.phone} onChange={onChange('phone')} className="w-full border rounded px-3 py-2" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">{localT('join.dob')}</label>
              <input type="date" value={form.dob} onChange={onChange('dob')} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium">{localT('join.aadharNumber')}</label>
              <input value={form.aadharNumber} onChange={onChange('aadharNumber')} className="w-full border rounded px-3 py-2" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium">{localT('join.address')}</label>
            <textarea value={form.address} onChange={onChange('address')} className="w-full border rounded px-3 py-2" />
          </div>

          <div>
            <label className="block text-sm font-medium">{localT('join.additionalInfo')}</label>
            <textarea value={form.additionalInfo} onChange={onChange('additionalInfo')} className="w-full border rounded px-3 py-2" />
          </div>

          <div>
            <label className="block text-sm font-medium">{localT('join.uploadAadhar')}</label>
            <div className="flex items-center gap-3 mt-1">
              <input ref={fileInputRef} type="file" accept="image/*" onChange={onFile} className="hidden" />
              <button
                type="button"
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
                className="px-4 py-2 border rounded bg-white hover:bg-slate-50 text-sm"
              >
                {localT('join.chooseFile')}
              </button>
              <div className="text-sm text-slate-600">{aadharFile ? aadharFile.name : localT('join.noFileChosen')}</div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <input id="born" type="checkbox" checked={form.bornTamilOrKudi} onChange={onChange('bornTamilOrKudi')} />
            <label htmlFor="born" className="text-sm">{localT('join.confirmBorn')}</label>
          </div>

          <div className="flex items-start gap-3">
            <input id="agree" type="checkbox" checked={form.agreeRules} onChange={onChange('agreeRules')} />
            <label htmlFor="agree" className="text-sm">{localT('join.agreeRules')}</label>
          </div>

          <div className="flex gap-4">
            <button type="submit" disabled={submitting} className="px-4 py-2 bg-[#d21d1d] text-white rounded">{submitting ? localT('join.submit') : localT('join.submit')}</button>
            <button type="button" onClick={() => { setForm({ name: '', email: '', phone: '', dob: '', address: '', aadharNumber: '', additionalInfo: '', bornTamilOrKudi: false, agreeRules: false }); setAadharFile(null); }} className="px-4 py-2 border rounded">{localT('join.reset')}</button>
          </div>
        </form>
        <JoinEditorModal open={editorOpen} onClose={() => setEditorOpen(false)} item={editingItem} onSave={async (data) => {
          const api = import.meta.env.VITE_API_URL || '';
          const token = localStorage.getItem('tvpk_token');
          try {
            const res = await fetch(`${api}/admin/content`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ content: data, focus: 'join' }) });
            const out = await res.json();
            if (!res.ok) return alert(out.error || 'Save failed');
            window.dispatchEvent(new CustomEvent('tvpk-content-updated', { detail: { section: 'join', content: out.content?.join } }));
            setEditorOpen(false);
          } catch (e) { alert('Save failed'); }
        }} />
      </div>
      {isAdmin() && (
        <div className="max-w-5xl mx-auto p-6 bg-white rounded shadow mt-8">
          <h3 className="text-xl font-black mb-4">Member Applications</h3>
          {!applicants.length && <div className="text-sm text-slate-500">No applications yet.</div>}
          <div className="space-y-4">
            {applicants.map(a => (
              <div key={a._id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-slate-50 rounded overflow-hidden">
                    {a.aadharImage ? <img src={a.aadharImage} alt="aadhar" className="w-full h-full object-cover" /> : <div className="w-full h-full grid place-items-center text-xs text-slate-400">No image</div>}
                  </div>
                  <div>
                    <div className="font-bold">{a.name}</div>
                    <div className="text-sm text-slate-500">{a.email || a.phone}</div>
                    <div className="text-xs text-slate-400">Status: {a.status}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {a.aadharImage && <a target="_blank" rel="noreferrer" href={`${api}${a.aadharImage}`} className="text-sm underline">View Aadhar</a>}
                  {a.casteCertificate && <a target="_blank" rel="noreferrer" href={`${api}${a.casteCertificate}`} className="text-sm underline">View Certificate</a>}
                  <input type="file" id={`caste-${a._id}`} className="hidden" />
                  <button onClick={async () => {
                    const inp = document.getElementById(`caste-${a._id}`);
                    if (!inp) return;
                    inp.click();
                    inp.onchange = async (e) => {
                      const file = e.target.files[0];
                      if (!file) return;
                      const fd = new FormData(); fd.append('casteCertificate', file);
                      const token = localStorage.getItem('tvpk_token');
                      try {
                        const r = await fetch(`${api}/admin/applicants/${a._id}/caste`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd });
                        const j = await r.json();
                        if (r.ok) {
                          window.dispatchEvent(new CustomEvent('tvpk-content-updated'));
                        } else alert(j.error || 'Upload failed');
                      } catch (err) { alert('Upload failed'); }
                    };
                  }} className="px-3 py-2 border rounded text-sm">Upload Certificate</button>

                  <button onClick={async () => {
                    const token = localStorage.getItem('tvpk_token');
                    try {
                      const r = await fetch(`${api}/admin/applicants/${a._id}/status`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ status: 'approved', role: 'user' }) });
                      const j = await r.json();
                      if (r.ok) window.dispatchEvent(new CustomEvent('tvpk-content-updated'));
                      else alert(j.error || 'Update failed');
                    } catch (e) { alert('Update failed'); }
                  }} className="px-3 py-2 bg-green-600 text-white rounded text-sm">Approve</button>

                  <button onClick={async () => {
                    const token = localStorage.getItem('tvpk_token');
                    try {
                      const r = await fetch(`${api}/admin/applicants/${a._id}/status`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ status: 'rejected' }) });
                      const j = await r.json();
                      if (r.ok) window.dispatchEvent(new CustomEvent('tvpk-content-updated'));
                      else alert(j.error || 'Update failed');
                    } catch (e) { alert('Update failed'); }
                  }} className="px-3 py-2 bg-red-600 text-white rounded text-sm">Reject</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
