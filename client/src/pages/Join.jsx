import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  User, Mail, Phone, Calendar, Hash, MapPin, Shield,
  UploadCloud, FileText, Trash2, CheckCircle2, AlertTriangle, RefreshCw
} from 'lucide-react';
import MemberCard from '../components/MemberCard';
import { DISTRICTS, CONSTITUENCIES, TAMIL_COMMUNITIES } from '../utils/geoData';

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
  const { t, i18n } = useTranslation();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    dob: '',
    aadharNumber: '',
    boothNumber: '',
    assemblyConstituency: '',
    district: '',
    tamilCommunity: '',
    otherCommunity: '',
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

  const handleChange = (k) => (e) => {
    let val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    if (k === 'name' && typeof val === 'string') {
      val = val.replace(/[^\p{L}\s.]/gu, '');
    }
    if (k === 'phone' && typeof val === 'string') {
      val = val.replace(/[^\d]/g, '').slice(0, 10);
    }
    setForm(f => ({ ...f, [k]: val }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setStatus('pending');

    // Strict email check
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(form.email)) {
      setStatus(t('join.invalidEmail', { defaultValue: 'Please enter a valid email address (e.g. example@gmail.com).' }));
      return;
    }

    // Strict phone number check: must be exactly 10 digits
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(form.phone)) {
      setStatus(t('join.invalidPhone', { defaultValue: 'Please enter a valid 10-digit Indian phone number.' }));
      return;
    }

    // Anti-cheat pattern detection for phone number
    const isFakePhone = (num) => {
      // 1. Identical digits check (e.g. 9999999999)
      if (/^(\d)\1{9}$/.test(num)) return true;
      // 2. Sequential ascending/descending check (e.g. 0123456789, 9876543210, 1234567890)
      const ascending = "01234567890";
      const descending = "98765432109";
      if (ascending.includes(num) || descending.includes(num)) return true;
      // 3. Simple alternating patterns (e.g. 9898989898, 9090909090)
      if (/^(\d{2})\1{4}$/.test(num)) return true;
      // 4. Starting digit followed by nine zeros (e.g. 9000000000)
      if (/^[6-9]0{9}$/.test(num)) return true;
      return false;
    };

    if (isFakePhone(form.phone)) {
      setStatus(t('join.invalidPhonePattern', { defaultValue: 'This phone number looks invalid or temporary. Please enter a genuine phone number.' }));
      return;
    }

    if (!file) {
      setStatus(t('join.aadharRequired', { defaultValue: 'Please upload your Aadhar card PDF.' }));
      return;
    }

    if (!professionalFile) {
      setStatus(t('join.photoRequired', { defaultValue: 'Please upload your professional photo PDF.' }));
      return;
    }

    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('email', form.email);
      fd.append('phone', '+91' + form.phone);
      fd.append('dob', form.dob);
      fd.append('aadharNumber', form.aadharNumber);
      fd.append('boothNumber', form.boothNumber);
      fd.append('assemblyConstituency', form.assemblyConstituency);
      fd.append('district', form.district);

      const finalCommunity = form.tamilCommunity === 'Other'
        ? (form.otherCommunity.trim() ? `Other (${form.otherCommunity.trim()})` : 'Other')
        : form.tamilCommunity;
      fd.append('tamilCommunity', finalCommunity);

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
        tamilCommunity: '',
        otherCommunity: '',
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

  const FileUploadZone = ({ id, label, isOptional, fileState, setter, fileInputRef, fieldLabel }) => {
    const isSelected = !!fileState;
    return (
      <div className={`flex flex-col h-full rounded-2xl border-2 border-dashed p-5 text-center transition-all duration-200 ${
        isSelected 
          ? 'border-emerald-500 bg-emerald-50/20' 
          : 'border-slate-200 hover:border-red-400 hover:bg-red-50/10'
      }`}>
        <label className="block text-sm font-bold text-slate-700 mb-3 break-words">
          {label} {!isOptional && <span className="text-red-500 font-bold">*</span>} {isOptional && <span className="text-xs font-normal text-slate-400">({i18n.language === 'ta' ? 'விருப்பத்தேர்வு' : 'Optional'})</span>}
        </label>
        
        <input 
          ref={fileInputRef} 
          id={id} 
          type="file" 
          accept="application/pdf,.pdf" 
          onChange={handlePdfSelection(setter, fileInputRef, fieldLabel)} 
          className="hidden" 
        />
        
        <div className="flex-1 flex flex-col items-center justify-center space-y-3">
          {isSelected ? (
            <>
              <div className="p-3 bg-emerald-100 text-emerald-600 rounded-full">
                <FileText size={28} />
              </div>
              <div className="text-xs text-slate-600 font-semibold break-all max-w-[200px] line-clamp-2">
                {fileState.name}
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setter(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-lg border border-red-100 transition-colors cursor-pointer"
              >
                <Trash2 size={13} />
                {t('join.remove')}
              </button>
            </>
          ) : (
            <>
              <div className="p-3 bg-slate-100 text-slate-400 rounded-full transition-colors">
                <UploadCloud size={28} />
              </div>
              <button 
                type="button" 
                onClick={() => fileInputRef.current && fileInputRef.current.click()} 
                className="px-4 py-2 border border-slate-200 hover:border-slate-300 rounded-xl text-sm font-bold bg-white shadow-sm hover:shadow transition-all text-slate-700 cursor-pointer"
              >
                {t('join.chooseFile')}
              </button>
              <span className="text-xs text-slate-400 font-medium">{i18n.language === 'ta' ? 'PDF கோப்புகள் மட்டும் (அதிகபட்சம் 10MB)' : 'PDF only (Max 10MB)'}</span>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 mb-16">
      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-6 sm:p-8">
        <div className="flex items-start justify-between pb-6 border-b border-slate-100">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-2">
              <Shield className="text-red-600" size={28} />
              {t('join.title')}
            </h1>
            <p className="text-sm text-slate-500 mt-2 font-medium leading-relaxed max-w-2xl">{t('join.desc')}</p>
          </div>
        </div>

        <form onSubmit={submit} className="mt-8 space-y-6">
          {/* Section 1: Personal Details */}
          <div>
            <h3 className="text-xs font-bold text-red-600 uppercase tracking-wider mb-4 pb-1.5 border-b border-slate-100">
              {i18n.language === 'ta' ? '1. தனிப்பட்ட விவரங்கள்' : '1. Personal Details'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Name */}
              <div className="flex flex-col">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                  {t('join.name')} <span className="text-red-500 font-bold">*</span>
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User size={18} />
                  </div>
                  <input 
                    required 
                    placeholder={t('join.name_placeholder', { defaultValue: 'Enter your full name' })} 
                    value={form.name} 
                    onChange={handleChange('name')} 
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:ring-4 focus:ring-red-500/10 focus:border-red-600 transition-all duration-200 outline-none text-slate-800 font-medium placeholder-slate-400" 
                  />
                </div>
              </div>

              {/* Email */}
              <div className="flex flex-col">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                  {t('join.email')} <span className="text-red-500 font-bold">*</span>
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail size={18} />
                  </div>
                  <input 
                    required 
                    type="email" 
                    placeholder={t('join.email_placeholder', { defaultValue: 'Enter your email address' })} 
                    value={form.email} 
                    onChange={handleChange('email')} 
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:ring-4 focus:ring-red-500/10 focus:border-red-600 transition-all duration-200 outline-none text-slate-800 font-medium placeholder-slate-400" 
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="flex flex-col">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                  {t('join.phone')} <span className="text-red-500 font-bold">*</span>
                </label>
                <div className="relative rounded-xl shadow-sm flex items-center bg-slate-50/50 hover:bg-slate-50 border border-slate-200 focus-within:bg-white focus-within:ring-4 focus-within:ring-red-500/10 focus-within:border-red-600 transition-all duration-200">
                  <div className="pl-3.5 pr-2.5 flex items-center text-slate-400 select-none shrink-0 border-r border-slate-200 my-3">
                    <Phone size={18} className="mr-2" />
                    <span className="text-slate-800 font-extrabold text-sm">+91</span>
                  </div>
                  <input 
                    required
                    type="tel"
                    pattern="[6-9][0-9]{9}"
                    maxLength={10}
                    placeholder={t('join.phone_placeholder', { defaultValue: 'Enter your number' })} 
                    value={form.phone} 
                    onChange={handleChange('phone')} 
                    className="w-full pl-3 pr-4 py-3 bg-transparent rounded-r-xl outline-none text-slate-800 font-medium placeholder-slate-400" 
                  />
                </div>
              </div>

              {/* Date of Birth */}
              <div className="flex flex-col">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                  {t('join.dob')} <span className="text-red-500 font-bold">*</span>
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Calendar size={18} />
                  </div>
                  <input 
                    required
                    type="date" 
                    value={form.dob} 
                    onChange={handleChange('dob')} 
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:ring-4 focus:ring-red-500/10 focus:border-red-600 transition-all duration-200 outline-none text-slate-800 font-medium placeholder-slate-400" 
                  />
                </div>
              </div>

              {/* Voter ID / Aadhaar */}
              <div className="flex flex-col md:col-span-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                  {t('join.aadharNumber')} <span className="text-red-500 font-bold">*</span>
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Hash size={18} />
                  </div>
                  <input 
                    required
                    placeholder={t('join.aadhar_placeholder', { defaultValue: 'Enter Voter ID or Aadhaar' })} 
                    value={form.aadharNumber} 
                    onChange={handleChange('aadharNumber')} 
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:ring-4 focus:ring-red-500/10 focus:border-red-600 transition-all duration-200 outline-none text-slate-800 font-medium placeholder-slate-400" 
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Location & Constituency */}
          <div>
            <h3 className="text-xs font-bold text-red-600 uppercase tracking-wider mb-4 pb-1.5 border-b border-slate-100">
              {i18n.language === 'ta' ? '2. தொகுதி மற்றும் வசிப்பிடம்' : '2. Constituency & Location'}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Assembly Constituency */}
              <div className="flex flex-col">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                  {i18n.language === 'ta' ? 'சட்டமன்றத் தொகுதி' : 'Assembly Constituency'} <span className="text-red-500 font-bold">*</span>
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <MapPin size={18} />
                  </div>
                  <select 
                    required 
                    value={form.assemblyConstituency} 
                    onChange={handleChange('assemblyConstituency')} 
                    className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:ring-4 focus:ring-red-500/10 focus:border-red-600 transition-all duration-200 outline-none text-slate-800 font-medium appearance-none cursor-pointer"
                  >
                    <option value="">{i18n.language === 'ta' ? 'சட்டமன்றத் தொகுதி தேர்ந்தெடுக்கவும் *' : 'Select Assembly Constituency *'}</option>
                    {CONSTITUENCIES.map((c) => (
                      <option key={c.id} value={c.id}>{i18n.language === 'ta' ? c.ta : c.en}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>
              </div>

              {/* District */}
              <div className="flex flex-col">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                  {i18n.language === 'ta' ? 'மாவட்டம்' : 'District'} <span className="text-red-500 font-bold">*</span>
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <MapPin size={18} />
                  </div>
                  <select 
                    required 
                    value={form.district} 
                    onChange={handleChange('district')} 
                    className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:ring-4 focus:ring-red-500/10 focus:border-red-600 transition-all duration-200 outline-none text-slate-800 font-medium appearance-none cursor-pointer"
                  >
                    <option value="">{i18n.language === 'ta' ? 'மாவட்டம் தேர்ந்தெடுக்கவும் *' : 'Select District *'}</option>
                    {DISTRICTS.map((d) => (
                      <option key={d.id} value={d.id}>{i18n.language === 'ta' ? d.ta : d.en}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>
              </div>

              {/* Booth Number */}
              <div className="flex flex-col">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                  {i18n.language === 'ta' ? 'பூத் எண்' : 'Booth Number'} <span className="text-red-500 font-bold">*</span>
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Hash size={18} />
                  </div>
                  <input 
                    required
                    placeholder={t('join.booth_placeholder', { defaultValue: 'Booth number' })} 
                    value={form.boothNumber} 
                    onChange={handleChange('boothNumber')} 
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:ring-4 focus:ring-red-500/10 focus:border-red-600 transition-all duration-200 outline-none text-slate-800 font-medium placeholder-slate-400" 
                  />
                </div>
              </div>



              {/* Address */}
              <div className="md:col-span-2 flex flex-col">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                  {t('join.address')} <span className="text-red-500 font-bold">*</span>
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute top-3.5 left-3.5 pointer-events-none text-slate-400">
                    <MapPin size={18} />
                  </div>
                  <textarea 
                    required
                    placeholder={t('join.address')} 
                    value={form.address} 
                    onChange={handleChange('address')} 
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:ring-4 focus:ring-red-500/10 focus:border-red-600 transition-all duration-200 outline-none text-slate-800 font-medium placeholder-slate-400 resize-y" 
                    rows={3} 
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Community & Identity */}
          <div>
            <h3 className="text-xs font-bold text-red-600 uppercase tracking-wider mb-4 pb-1.5 border-b border-slate-100">
              {i18n.language === 'ta' ? '3. சமூக விவரங்கள் மற்றும் சான்றுகள்' : '3. Community Details & Documents'}
            </h3>

            <div className="grid grid-cols-1 gap-5">
              {/* Tamil Community Selection */}
              <div className="flex flex-col">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                  {i18n.language === 'ta' ? 'தமிழ் சமூகம்' : 'Tamil Community'} <span className="text-xs font-normal text-slate-400">({i18n.language === 'ta' ? 'விருப்பத்தேர்வு' : 'Optional'})</span>
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Shield size={18} />
                  </div>
                  <select 
                    value={form.tamilCommunity} 
                    onChange={handleChange('tamilCommunity')} 
                    className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:ring-4 focus:ring-red-500/10 focus:border-red-600 transition-all duration-200 outline-none text-slate-800 font-medium appearance-none cursor-pointer"
                  >
                    <option value="">{i18n.language === 'ta' ? 'தமிழ் சமூகம் தேர்ந்தெடுக்கவும்' : 'Select Tamil Community'}</option>
                    {TAMIL_COMMUNITIES.map((c) => (
                      <option key={c.id} value={c.id}>{i18n.language === 'ta' ? c.ta : c.en}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>

                {form.tamilCommunity === 'Other' && (
                  <div className="mt-3 flex flex-col">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                      {i18n.language === 'ta' ? 'சமூகத்தின் பெயரை உள்ளிடவும்' : 'Specify Community Name'}
                    </label>
                    <input 
                      type="text"
                      placeholder={i18n.language === 'ta' ? 'உங்கள் சமூகத்தின் பெயரை உள்ளிடவும்' : 'Type your community name'}
                      value={form.otherCommunity}
                      onChange={handleChange('otherCommunity')}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:ring-4 focus:ring-red-500/10 focus:border-red-600 transition-all duration-200 outline-none text-slate-800 font-medium placeholder-slate-400"
                    />
                  </div>
                )}
              </div>

              {/* Uploads Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-2">
                <FileUploadZone 
                  id="aadhar"
                  label={t('join.uploadAadhar')}
                  isOptional={false}
                  fileState={file}
                  setter={setFile}
                  fileInputRef={fileInputRef}
                  fieldLabel="Aadhaar card file"
                />

                <FileUploadZone 
                  id="community"
                  label={t('join.uploadCommunityCertificate')}
                  isOptional={true}
                  fileState={communityFile}
                  setter={setCommunityFile}
                  fileInputRef={communityFileRef}
                  fieldLabel="Community certificate file"
                />

                <FileUploadZone 
                  id="professional"
                  label={t('join.uploadProfessionalPhoto')}
                  isOptional={false}
                  fileState={professionalFile}
                  setter={setProfessionalFile}
                  fileInputRef={professionalFileRef}
                  fieldLabel="Professional photo file"
                />
              </div>
            </div>
          </div>

          {/* Confirmations & Agreements */}
          <div className="flex flex-col gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 mt-6">
            <label className="inline-flex items-start gap-3 cursor-pointer select-none group">
              <input 
                type="checkbox" 
                checked={form.born} 
                onChange={handleChange('born')} 
                required 
                className="mt-1 w-4.5 h-4.5 rounded border-slate-300 text-red-600 focus:ring-red-500/20 cursor-pointer" 
              />
              <span className="text-sm font-semibold text-slate-700 leading-snug group-hover:text-slate-900 transition-colors">{t('join.confirmBorn')}</span>
            </label>
            
            <label className="inline-flex items-start gap-3 cursor-pointer select-none group">
              <input 
                type="checkbox" 
                checked={form.agree} 
                onChange={handleChange('agree')} 
                required 
                className="mt-1 w-4.5 h-4.5 rounded border-slate-300 text-red-600 focus:ring-red-500/20 cursor-pointer" 
              />
              <span className="text-sm font-semibold text-slate-700 leading-snug group-hover:text-slate-900 transition-colors">{t('join.agreeRules')}</span>
            </label>
          </div>

          {/* Buttons and inline alerts */}
          <div className="flex flex-col gap-4 mt-6 pt-4 border-t border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <button 
                type="submit" 
                className="inline-flex items-center justify-center px-6 py-3.5 bg-red-600 hover:bg-red-700 text-white font-extrabold rounded-xl shadow-lg shadow-red-500/20 hover:shadow-red-500/30 transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150 cursor-pointer min-w-[160px]"
              >
                {t('join.submit')}
              </button>
              <button 
                type="button" 
                onClick={() => { 
                  setForm({ name: '', email: '', phone: '', dob: '', aadharNumber: '', boothNumber: '', assemblyConstituency: '', district: '', tamilCommunity: '', otherCommunity: '', address: '', born: false, agree: false }); 
                  setFile(null); 
                  setCommunityFile(null); 
                  setProfessionalFile(null); 
                  setStatus(null); 
                  if (fileInputRef.current) fileInputRef.current.value = ''; 
                  if (communityFileRef.current) communityFileRef.current.value = ''; 
                  if (professionalFileRef.current) professionalFileRef.current.value = ''; 
                }} 
                className="px-6 py-3.5 border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold rounded-xl transition-all cursor-pointer text-center"
              >
                {t('join.reset')}
              </button>
            </div>

            {/* Notification Alerts */}
            {status === 'success' && (
              <div className="flex items-start gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-sm">
                <CheckCircle2 className="shrink-0 text-emerald-600 mt-0.5" size={18} />
                <div>
                  <span className="font-bold">{t('join.success')}</span>
                </div>
              </div>
            )}
            
            {status && status !== 'pending' && status !== 'success' && (
              <div className="flex items-start gap-3 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-sm">
                <AlertTriangle className="shrink-0 text-rose-600 mt-0.5" size={18} />
                <div>
                  <span className="font-bold">{status}</span>
                </div>
              </div>
            )}
          </div>
        </form>
      </div>

      {/* Loading Modal Overlay */}
      {status === 'pending' && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 p-8 max-w-sm w-full text-center">
            <div className="mx-auto mb-4 h-10 w-10 rounded-full border-4 border-slate-100 border-t-red-600 animate-spin" />
            <div className="text-lg font-extrabold text-slate-900">{submittingTitle}</div>
            <div className="text-sm font-medium text-slate-500 mt-1.5 leading-relaxed">{submittingSubtitle}</div>
          </div>
        </div>
      )}

      {/* User Application History List */}
      {applications.length > 0 && (
        <div className="mt-8 bg-white rounded-3xl shadow-xl border border-slate-100 p-6 sm:p-8">
          <h2 className="text-lg font-black text-slate-900 pb-4 border-b border-slate-100">{applicationsTitle}</h2>
          <div className="mt-6">
            <div className="space-y-4">
              {applications.map((a) => (
                <div key={a._id} className="p-4 rounded-2xl border border-slate-100 hover:border-slate-200 bg-slate-50/30 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-200">
                  <div>
                    <div className="font-extrabold text-slate-800 text-base">{a.name || a.email}</div>
                    <div className="text-xs text-slate-400 font-semibold mt-1">
                      {new Date(a.createdAt).toLocaleString(i18n.language === 'ta' ? 'ta-IN' : 'en-US')}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-3">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                      a.status === 'approved' 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                        : a.status === 'pending' 
                        ? 'bg-amber-50 text-amber-700 border border-amber-100' 
                        : a.status === 'removed' 
                        ? 'bg-slate-100 text-slate-600 border border-slate-200' 
                        : 'bg-rose-50 text-rose-700 border border-rose-100'
                    }`}>
                      {a.status}
                    </span>
                    
                    <div className="flex items-center gap-2.5">
                      {a.aadharImage && (
                        <a 
                          target="_blank" 
                          rel="noreferrer" 
                          href={`${api}${a.aadharImage}`} 
                          className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-red-600 px-2.5 py-1.5 bg-white border border-slate-100 hover:border-slate-200 rounded-xl transition-all shadow-2xs"
                        >
                          <FileText size={14} />
                          {viewAadharLabel}
                        </a>
                      )}
                      
                      {a.casteCertificate && (
                        <a 
                          target="_blank" 
                          rel="noreferrer" 
                          href={`${api}${a.casteCertificate}`} 
                          className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-red-600 px-2.5 py-1.5 bg-white border border-slate-100 hover:border-slate-200 rounded-xl transition-all shadow-2xs"
                        >
                          <FileText size={14} />
                          {viewCertificateLabel}
                        </a>
                      )}
                      
                      {a.professionalPhoto && (
                        <a 
                          target="_blank" 
                          rel="noreferrer" 
                          href={`${api}${a.professionalPhoto}`} 
                          className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-red-600 px-2.5 py-1.5 bg-white border border-slate-100 hover:border-slate-200 rounded-xl transition-all shadow-2xs"
                        >
                          <FileText size={14} />
                          {viewProfessionalPhotoLabel}
                        </a>
                      )}
                      
                      {a.status === 'approved' && a.professionalPhoto && (
                        <button
                          type="button"
                          onClick={() => setSelectedApplication(a)}
                          className="inline-flex items-center gap-1.5 text-xs font-black px-3.5 py-1.5 rounded-xl border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors shadow-2xs cursor-pointer"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                          {downloadIdLabel}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {selectedApplication && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-100">
              <h3 className="text-lg font-black text-slate-900">{memberIdTitle}</h3>
              <button
                type="button"
                onClick={() => setSelectedApplication(null)}
                className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-xs font-bold rounded-xl text-slate-600 transition-all cursor-pointer"
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
