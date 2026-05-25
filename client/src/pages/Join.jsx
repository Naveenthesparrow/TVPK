import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import MemberCard from '../components/MemberCard';

const JOIN_HISTORY_EMAIL_KEY = 'tvpk_join_history_email';

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
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    dob: '',
    aadharNumber: '',
    boothNumber: '',
    assemblyConstituency: '',
    district: '',
    stateName: 'தமிழ்நாடு',
    address: '',
    born: false,
    agree: false,
  });
  const [file, setFile] = useState(null);
  const [communityFile, setCommunityFile] = useState(null);
  const [professionalFile, setProfessionalFile] = useState(null);
  const [status, setStatus] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const api =
    (import.meta.env.VITE_API_URL || '').replace(/\/$/, '') ||
    (import.meta.env.DEV ? 'http://localhost:5000' : '');
  const fileInputRef = useRef(null);
  const communityFileRef = useRef(null);
  const professionalFileRef = useRef(null);
  const submittingTitle = t('join.submitting_title', { defaultValue: 'Submitting...' });
  const submittingSubtitle = t('join.submitting_subtitle', { defaultValue: 'Please wait while we upload your application.' });
  const applicationsTitle = t('join.applications_title', { defaultValue: 'Member Applications' });
  const memberIdTitle = t('join.member_id_title', { defaultValue: 'Member ID Card' });
  const closeLabel = t('join.close', { defaultValue: 'Close' });
  const viewAadharLabel = t('join.view_aadhar', { defaultValue: 'View Aadhar' });
  const viewCertificateLabel = t('join.view_certificate', { defaultValue: 'View Certificate' });
  const viewProfessionalPhotoLabel = t('join.view_professional_photo', { defaultValue: 'View Professional Photo' });
  const downloadIdLabel = t('join.download_id_pdf', { defaultValue: 'Download ID PDF' });

  const isPdfFile = (file) => Boolean(file) && (file.type === 'application/pdf' || /\.pdf$/i.test(file.name || ''));

  const handlePdfSelection = (setter, inputRef, label) => (e) => {
    const selected = e.target.files && e.target.files[0] ? e.target.files[0] : null;
    if (!selected) {
      setter(null);
      return;
    }

    if (!isPdfFile(selected)) {
      setter(null);
      if (inputRef.current) inputRef.current.value = ''; 
      setStatus(t('join.pdfOnlyError', { defaultValue: `${label} must be a PDF file.` }));
      return;
    }

    setStatus(null);
    setter(selected);
  };

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
      fd.append('boothNumber', form.boothNumber);
      fd.append('assemblyConstituency', form.assemblyConstituency);
      fd.append('district', form.district);
      fd.append('stateName', form.stateName);
      fd.append('address', form.address);
      fd.append('bornTamilOrKudi', form.born ? 'true' : 'false');
      fd.append('agreeRules', form.agree ? 'true' : 'false');
      if (file) fd.append('aadharImage', file);
      if (communityFile) fd.append('casteCertificate', communityFile);
      if (professionalFile) fd.append('professionalPhoto', professionalFile);
      const res = await fetch(`${api}/members/apply`, { method: 'POST', body: fd });
      const raw = await res.text();
      let j = null;
      try {
        j = raw ? JSON.parse(raw) : {};
      } catch {
        j = null;
      }

      if (!res.ok) {
        const serverMessage = j?.error || j?.message || raw || t('join.submitFailedUnknown', { defaultValue: 'Unknown server error' });
        throw new Error(t('join.submitFailedPrefix', { defaultValue: 'Submit failed' }) + ` (${res.status}): ${serverMessage}`);
      }

      if (!j) {
        throw new Error(t('join.submitFailedNonJson', { defaultValue: 'Submit failed: Server returned non-JSON response.' }));
      }

      setStatus('success');
      // preserve submitted email to reload applications
      const submittedEmail = form.email;
      if (submittedEmail) localStorage.setItem(JOIN_HISTORY_EMAIL_KEY, submittedEmail);
      setForm({
        name: '',
        email: '',
        phone: '',
        dob: '',
        aadharNumber: '',
        boothNumber: '',
        assemblyConstituency: '',
        district: '',
        stateName: 'தமிழ்நாடு',
        address: '',
        born: false,
        agree: false,
      });
      setFile(null);
      setCommunityFile(null);
      setProfessionalFile(null);
      // reload applications for the submitted email
      if (submittedEmail) fetchApplications(submittedEmail);
    } catch (err) {
      const fallback = t('join.submitFailedUnknownError', { defaultValue: 'Submit failed: Unknown error' });
      if (err?.name === 'TypeError' && /fetch/i.test(String(err?.message || ''))) {
        setStatus(t('join.submitFailedReachServer', { defaultValue: 'Submit failed: Cannot reach server. Please check backend is running on http://localhost:5000' }));
      } else {
        setStatus(err?.message || fallback);
      }
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
    const fromProfile = (() => {
      try {
        const u = JSON.parse(localStorage.getItem('tvpk_user'));
        return u && u.email ? u.email : '';
      } catch {
        return '';
      }
    })();
    const fromHistory = localStorage.getItem(JOIN_HISTORY_EMAIL_KEY) || '';
    const initialEmail = fromProfile || fromHistory;
    if (initialEmail) {
      setForm((prev) => ({ ...prev, email: initialEmail }));
      fetchApplications(initialEmail);
    }
  }, []);

  useEffect(() => {
    const email = (form.email || '').trim();
    if (!email) return;
    localStorage.setItem(JOIN_HISTORY_EMAIL_KEY, email);
    fetchApplications(email);
  }, [form.email]);

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <div className="bg-white rounded-2xl shadow p-5 sm:p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black">{t('join.title')}</h1>
            <p className="text-sm text-slate-600 mt-2">{t('join.desc')}</p>
          </div>
        </div>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input required placeholder={t('join.name')} value={form.name} onChange={handleChange('name')} className="w-full border rounded px-3 py-2" />
            <div className="flex flex-col sm:flex-row gap-3">
              <input placeholder={t('join.email')} value={form.email} onChange={handleChange('email')} className="w-full border rounded px-3 py-2" />
              <input placeholder={t('join.phone')} value={form.phone} onChange={handleChange('phone')} className="w-full border rounded px-3 py-2" />
            </div>
            <input type="date" placeholder={t('join.dob')} value={form.dob} onChange={handleChange('dob')} className="w-full border rounded px-3 py-2" />
            <input placeholder={t('join.aadharNumber')} value={form.aadharNumber} onChange={handleChange('aadharNumber')} className="w-full border rounded px-3 py-2" />
            <input placeholder="பூத் எண்" value={form.boothNumber} onChange={handleChange('boothNumber')} className="w-full border rounded px-3 py-2" />
            <input placeholder="சட்டமன்றம்" value={form.assemblyConstituency} onChange={handleChange('assemblyConstituency')} className="w-full border rounded px-3 py-2" />
            <input placeholder="மாவட்டம்" value={form.district} onChange={handleChange('district')} className="w-full border rounded px-3 py-2" />
            <input placeholder="மாநிலம்" value={form.stateName} onChange={handleChange('stateName')} className="w-full border rounded px-3 py-2" />
            <div className="md:col-span-2">
              <textarea placeholder={t('join.address')} value={form.address} onChange={handleChange('address')} className="w-full border rounded px-3 py-2" rows={3} />
            </div>
            <div className="md:col-span-2">
              {/* removed additionalInfo per request */}
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 xl:gap-6">
            <div className="space-y-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-4 min-w-0">
              <span className="block text-sm font-semibold leading-snug text-slate-700 break-words">{t('join.uploadAadhar')}</span>
              <div className="space-y-3 min-w-0">
                <input ref={fileInputRef} id="aadhar" type="file" accept="application/pdf,.pdf" onChange={handlePdfSelection(setFile, fileInputRef, 'Aadhaar card file')} className="hidden" />
                <button type="button" onClick={() => fileInputRef.current && fileInputRef.current.click()} className="w-full px-3 py-2 border rounded text-sm bg-white whitespace-normal leading-snug text-left shrink-0">{t('join.chooseFile')}</button>
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
                <div className="text-sm text-slate-500 min-w-0 break-words">{file ? file.name : t('join.noFileChosen')}</div>
              </div>
            </div>

            <div className="space-y-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-4 min-w-0">
              <span className="block text-sm font-semibold leading-snug text-slate-700 break-words">{t('join.uploadCommunityCertificate')}</span>
              <div className="space-y-3 min-w-0">
                <input ref={communityFileRef} id="community" type="file" accept="application/pdf,.pdf" onChange={handlePdfSelection(setCommunityFile, communityFileRef, 'Community certificate file')} className="hidden" />
                <button type="button" onClick={() => communityFileRef.current && communityFileRef.current.click()} className="w-full px-3 py-2 border rounded text-sm bg-white whitespace-normal leading-snug text-left shrink-0">{t('join.chooseFile')}</button>
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
                <div className="text-sm text-slate-500 min-w-0 break-words">{communityFile ? communityFile.name : t('join.noFileChosen')}</div>
              </div>
            </div>

            <div className="space-y-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-4 min-w-0">
              <span className="block text-sm font-semibold leading-snug text-slate-700 break-words">{t('join.uploadProfessionalPhoto')}</span>
              <div className="space-y-3 min-w-0">
                <input ref={professionalFileRef} id="professional" type="file" accept="application/pdf,.pdf" onChange={handlePdfSelection(setProfessionalFile, professionalFileRef, 'Professional photo file')} className="hidden" />
                <button type="button" onClick={() => professionalFileRef.current && professionalFileRef.current.click()} className="w-full px-3 py-2 border rounded text-sm bg-white whitespace-normal leading-snug text-left shrink-0">{t('join.chooseFile')}</button>
                {professionalFile && (
                  <button
                    type="button"
                    onClick={() => {
                      setProfessionalFile(null);
                      if (professionalFileRef.current) professionalFileRef.current.value = '';
                    }}
                    className="px-3 py-2 border rounded text-sm bg-white text-red-600 border-red-200 shrink-0"
                  >
                    {t('join.remove')}
                  </button>
                )}
                <div className="text-sm text-slate-500 min-w-0 break-words">{professionalFile ? professionalFile.name : t('join.noFileChosen')}</div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" checked={form.born} onChange={handleChange('born')} required className="w-4 h-4" /> <span>{t('join.confirmBorn')}</span></label>
            <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" checked={form.agree} onChange={handleChange('agree')} required className="w-4 h-4" /> <span>{t('join.agreeRules')}</span></label>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-4">
            <button type="submit" className="px-4 py-2 rounded bg-red-600 text-white font-black">{t('join.submit')}</button>
            <button type="button" onClick={() => { setForm({ name: '', email: '', phone: '', dob: '', aadharNumber: '', boothNumber: '', assemblyConstituency: '', district: '', stateName: 'தமிழ்நாடு', address: '', born: false, agree: false }); setFile(null); setCommunityFile(null); setProfessionalFile(null); setStatus(null); if (fileInputRef.current) fileInputRef.current.value = ''; if (communityFileRef.current) communityFileRef.current.value = ''; if (professionalFileRef.current) professionalFileRef.current.value = ''; }} className="px-4 py-2 rounded border">{t('join.reset')}</button>
            {status === 'success' && <div className="text-sm text-green-600">{t('join.success')}</div>}
            {status && status !== 'pending' && status !== 'success' && <div className="text-sm text-red-600">{status}</div>}
          </div>
        </form>
      </div>

      {status === 'pending' && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl px-6 py-5 min-w-[260px] text-center">
            <div className="mx-auto mb-3 h-6 w-6 rounded-full border-2 border-slate-300 border-t-red-600 animate-spin" />
            <div className="text-base font-semibold text-slate-800">{submittingTitle}</div>
            <div className="text-sm text-slate-500 mt-1">{submittingSubtitle}</div>
          </div>
        </div>
      )}

      {applications.length > 0 && (
        <div className="mt-6 bg-white rounded shadow p-4">
          <h2 className="font-bold">{applicationsTitle}</h2>
          <div className="mt-4">
            <div className="space-y-3">
              {applications.map((a, index) => (
                <div key={a._id} className="p-3 border rounded flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{a.name || a.email}</div>
                    <div className="text-sm text-slate-500">{new Date(a.createdAt).toLocaleString()}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`px-3 py-1 rounded-full text-sm font-black ${a.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : a.status === 'approved' ? 'bg-green-100 text-green-800' : a.status === 'removed' ? 'bg-slate-200 text-slate-700' : 'bg-red-100 text-red-800'}`}>{a.status}</div>
                    {a.aadharImage && <a target="_blank" rel="noreferrer" href={`${api}${a.aadharImage}`} className="text-sm underline">{viewAadharLabel}</a>}
                    {a.casteCertificate && <a target="_blank" rel="noreferrer" href={`${api}${a.casteCertificate}`} className="text-sm underline">{viewCertificateLabel}</a>}
                    {a.professionalPhoto && <a target="_blank" rel="noreferrer" href={`${api}${a.professionalPhoto}`} className="text-sm underline">{viewProfessionalPhotoLabel}</a>}
                    {a.status === 'approved' && a.professionalPhoto && (
                      <button
                        type="button"
                        onClick={() => setSelectedApplication(a)}
                        className="text-sm px-3 py-1.5 rounded border bg-blue-50 text-blue-700 hover:bg-blue-100"
                      >
                        {downloadIdLabel}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {selectedApplication && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-black">{memberIdTitle}</h3>
              <button
                type="button"
                onClick={() => setSelectedApplication(null)}
                className="px-3 py-1.5 border rounded bg-white hover:bg-slate-50"
              >
                {closeLabel}
              </button>
            </div>
            <MemberCard member={selectedApplication} />
          </div>
        </div>
      )}
    </div>
  );
}
