import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

async function readJsonSafe(res) {
  const text = await res.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export default function Join() {
  const { t } = useTranslation();
  const [form, setForm] = useState({ name: '', email: '', phone: '', dob: '', aadharNumber: '', address: '', born: false, agree: false });
  const [file, setFile] = useState(null);
  const [communityFile, setCommunityFile] = useState(null);
  const [status, setStatus] = useState(null);
  const api =
    (import.meta.env.VITE_API_URL || '').replace(/\/$/, '') ||
    (import.meta.env.DEV ? 'http://localhost:5000' : '');
  const fileInputRef = useRef(null);
  const communityFileRef = useRef(null);

  const handleChange = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setStatus('pending');
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('email', form.email);
      fd.append('phone', form.phone);
      fd.append('dob', form.dob);
      fd.append('aadharNumber', form.aadharNumber);
      fd.append('address', form.address);
      fd.append('bornTamilOrKudi', form.born ? 'true' : 'false');
      fd.append('agreeRules', form.agree ? 'true' : 'false');
      if (file) fd.append('aadharImage', file);
      if (communityFile) fd.append('casteCertificate', communityFile);
      const res = await fetch(`${api}/members/apply`, { method: 'POST', body: fd });
      const j = await readJsonSafe(res);
      if (!j) throw new Error('Server returned invalid response. Check API/server.');
      if (!res.ok) throw new Error(j.error || 'Submit failed');
      setStatus('success');
      // preserve submitted email to reload applications
      const submittedEmail = form.email;
      setForm({ name: '', email: '', phone: '', dob: '', aadharNumber: '', address: '', born: false, agree: false });
      setFile(null);
      setCommunityFile(null);
      // reload applications for the submitted email
      if (submittedEmail) fetchApplications(submittedEmail);
    } catch (err) {
      setStatus(err.message || 'failed');
    }
  };

  const [applications, setApplications] = useState([]);
  const fetchApplications = async (email) => {
    try {
      if (!email) { setApplications([]); return; }
      const res = await fetch(`${api}/members?email=${encodeURIComponent(email)}`);
      if (!res.ok) throw new Error('Failed');
      const j = await readJsonSafe(res);
      if (!j) throw new Error('Invalid response');
      setApplications(j.applicants || []);
    } catch (e) {
      setApplications([]);
    }
  };

  useEffect(() => {
    // if user typed an email (or if logged-in user), fetch applications
    const email = form.email || (() => { try { const u = JSON.parse(localStorage.getItem('tvpk_user')); return u && u.email; } catch { return ''; } })();
    if (email) fetchApplications(email);
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded shadow p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-black">{t('join.title')}</h1>
            <p className="text-sm text-slate-600 mt-2">{t('join.desc')}</p>
          </div>
        </div>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input required placeholder={t('join.name')} value={form.name} onChange={handleChange('name')} className="w-full border rounded px-3 py-2" />
            <div className="flex gap-3">
              <input placeholder={t('join.email')} value={form.email} onChange={handleChange('email')} className="w-full border rounded px-3 py-2" />
              <input placeholder={t('join.phone')} value={form.phone} onChange={handleChange('phone')} className="w-full border rounded px-3 py-2" />
            </div>
            <input type="date" placeholder={t('join.dob')} value={form.dob} onChange={handleChange('dob')} className="w-full border rounded px-3 py-2" />
            <input placeholder={t('join.aadharNumber')} value={form.aadharNumber} onChange={handleChange('aadharNumber')} className="w-full border rounded px-3 py-2" />
            <div className="md:col-span-2">
              <textarea placeholder={t('join.address')} value={form.address} onChange={handleChange('address')} className="w-full border rounded px-3 py-2" rows={3} />
            </div>
            <div className="md:col-span-2">
              {/* removed additionalInfo per request */}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-2">
              <span className="block text-sm text-slate-700">{t('join.uploadAadhar')}</span>
              <div className="flex flex-wrap items-center gap-3">
                <input ref={fileInputRef} id="aadhar" type="file" accept="image/*,application/pdf" onChange={e => setFile(e.target.files && e.target.files[0])} className="hidden" />
                <button type="button" onClick={() => fileInputRef.current && fileInputRef.current.click()} className="px-3 py-2 border rounded text-sm bg-white shrink-0">{t('join.chooseFile')}</button>
                {file && (
                  <button
                    type="button"
                    onClick={() => {
                      setFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="px-3 py-2 border rounded text-sm bg-white text-red-600 border-red-200 shrink-0"
                  >
                    {t('join.remove')}
                  </button>
                )}
                <div className="text-sm text-slate-500 min-w-0 break-all">{file ? file.name : t('join.noFileChosen')}</div>
              </div>
            </div>

            <div className="space-y-2">
              <span className="block text-sm text-slate-700">{t('join.uploadCommunityCertificate')}</span>
              <div className="flex flex-wrap items-center gap-3">
                <input ref={communityFileRef} id="community" type="file" accept="image/*,application/pdf" onChange={e => setCommunityFile(e.target.files && e.target.files[0])} className="hidden" />
                <button type="button" onClick={() => communityFileRef.current && communityFileRef.current.click()} className="px-3 py-2 border rounded text-sm bg-white shrink-0">{t('join.chooseFile')}</button>
                {communityFile && (
                  <button
                    type="button"
                    onClick={() => {
                      setCommunityFile(null);
                      if (communityFileRef.current) communityFileRef.current.value = '';
                    }}
                    className="px-3 py-2 border rounded text-sm bg-white text-red-600 border-red-200 shrink-0"
                  >
                    {t('join.remove')}
                  </button>
                )}
                <div className="text-sm text-slate-500 min-w-0 break-all">{communityFile ? communityFile.name : t('join.noFileChosen')}</div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" checked={form.born} onChange={handleChange('born')} required className="w-4 h-4" /> <span>{t('join.confirmBorn')}</span></label>
            <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" checked={form.agree} onChange={handleChange('agree')} required className="w-4 h-4" /> <span>{t('join.agreeRules')}</span></label>
          </div>

          <div className="flex items-center gap-3 mt-4">
            <button type="submit" className="px-4 py-2 rounded bg-red-600 text-white font-black">{t('join.submit')}</button>
            <button type="button" onClick={() => { setForm({ name: '', email: '', phone: '', dob: '', aadharNumber: '', address: '', born: false, agree: false }); setFile(null); setCommunityFile(null); setStatus(null); if (fileInputRef.current) fileInputRef.current.value = ''; if (communityFileRef.current) communityFileRef.current.value = ''; }} className="px-4 py-2 rounded border">{t('join.reset')}</button>
            {status === 'pending' && <div className="text-sm text-slate-500">Submitting...</div>}
            {status === 'success' && <div className="text-sm text-green-600">{t('join.success')}</div>}
            {status && status !== 'pending' && status !== 'success' && <div className="text-sm text-red-600">{status}</div>}
          </div>
        </form>
      </div>

      {applications.length > 0 && (
        <div className="mt-6 bg-white rounded shadow p-4">
          <h2 className="font-bold">Member Applications</h2>
          <div className="mt-4">
            <div className="space-y-3">
              {applications.map((a) => (
                <div key={a._id} className="p-3 border rounded flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{a.name || a.email}</div>
                    <div className="text-sm text-slate-500">{new Date(a.createdAt).toLocaleString()}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`px-3 py-1 rounded-full text-sm font-black ${a.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : a.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{a.status}</div>
                    {a.aadharImage && <a target="_blank" rel="noreferrer" href={`${api}${a.aadharImage}`} className="text-sm underline">View Aadhar</a>}
                    {a.casteCertificate && <a target="_blank" rel="noreferrer" href={`${api}${a.casteCertificate}`} className="text-sm underline">View Certificate</a>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
