import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Trash2 } from 'lucide-react';
import { isAdmin } from '../utils/adminHelpers';

async function readJsonSafe(res) {
  const text = await res.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

const Admin = () => {
  const { i18n } = useTranslation();
  const currentLang = (i18n.resolvedLanguage || i18n.language || 'en').split('-')[0];
  const api =
    (import.meta.env.VITE_API_URL || '').replace(/\/$/, '') ||
    (import.meta.env.DEV ? 'http://localhost:5000' : '');
  const [applicants, setApplicants] = React.useState([]);
  const [view, setView] = React.useState('all');
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [expandedId, setExpandedId] = React.useState(null);

  const visibleApplicants = React.useMemo(() => {
    if (view === 'removed') return applicants.filter((item) => item.status === 'removed');
    if (view === 'active') return applicants.filter((item) => item.status !== 'removed');
    return applicants;
  }, [applicants, view]);

  const loadApplicants = React.useCallback(async () => {
    try {
      setError('');
      if (!isAdmin()) {
        setApplicants([]);
        setError(currentLang === 'ta' ? 'நிர்வாக அணுகல் தேவை.' : 'Admin access required.');
        setLoading(false);
        return;
      }

      const token = localStorage.getItem('tvpk_token');
      if (!token) {
        setApplicants([]);
        setError(currentLang === 'ta' ? 'தயவுசெய்து மீண்டும் உள்நுழையவும்.' : 'Please log in again.');
        setLoading(false);
        return;
      }

      const r = await fetch(`${api}/admin/applicants?ts=${Date.now()}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });
      if (!r.ok) {
        const j = await readJsonSafe(r);
        setApplicants([]);
        if (r.status === 401) {
          localStorage.removeItem('tvpk_token');
          localStorage.removeItem('tvpk_user');
          window.dispatchEvent(new CustomEvent('tvpk-auth-change', { detail: null }));
          setError(currentLang === 'ta' ? 'அமர்வு காலாவதியானது. தயவுசெய்து மீண்டும் உள்நுழையவும்.' : 'Session expired. Please log in again.');
        } else if (r.status === 403) {
          setError(currentLang === 'ta' ? 'நிர்வாக அணுகல் தேவை.' : 'Admin access required.');
        } else {
          setError(j?.error || (currentLang === 'ta' ? 'உறுப்பினர் விண்ணப்பங்களை ஏற்ற முடியவில்லை.' : 'Failed to load member applications.'));
        }
        setLoading(false);
        return;
      }

      const j = await readJsonSafe(r);
      if (!j) {
        setApplicants([]);
        setError(currentLang === 'ta' ? 'சர்வர் தவறான பதிலை அனுப்பியது.' : 'Server returned invalid response.');
        setLoading(false);
        return;
      }

      setApplicants(Array.isArray(j.applicants) ? j.applicants : []);
    } catch {
      setApplicants([]);
      setError(currentLang === 'ta' ? 'விண்ணப்பங்களை ஏற்றும்போது நெட்வொர்க் பிழை ஏற்பட்டது.' : 'Network error while loading applications.');
    } finally {
      setLoading(false);
    }
  }, [api]);

  React.useEffect(() => {
    loadApplicants();
    const onUpdate = () => loadApplicants();
    const onAuth = () => loadApplicants();
    window.addEventListener('tvpk-content-updated', onUpdate);
    window.addEventListener('tvpk-auth-change', onAuth);
    return () => { window.removeEventListener('tvpk-content-updated', onUpdate); window.removeEventListener('tvpk-auth-change', onAuth); };
  }, [loadApplicants]);

  const updateStatus = async (id, status, role) => {
    const token = localStorage.getItem('tvpk_token');
    try {
      if (status === 'removed') {
        const ok = window.confirm(currentLang === 'ta' ? 'இந்த உறுப்பினரை கட்சி உறுப்பினர் பட்டியலிலிருந்து நீக்க வேண்டுமா? அவரின் TVPK எண் நிரந்தரமாக ஒதுக்கப்படமாட்டாது.' : 'Remove this member from party membership? Their TVPK number will be retired and never reassigned.');
        if (!ok) return;
      }
      const r = await fetch(`${api}/admin/applicants/${id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(role ? { status, role } : { status }),
      });
      const j = await readJsonSafe(r);
      if (!r.ok) return alert(j?.error || (currentLang === 'ta' ? 'புதுப்பிப்பு தோல்வியடைந்தது' : 'Update failed'));
      setApplicants((prev) => prev.map((item) => (item._id === id ? { ...item, status: j?.applicant?.status || status } : item)));
      if (j?.warning) alert(j.warning);
      await loadApplicants();
    } catch {
      alert(currentLang === 'ta' ? 'புதுப்பிப்பு தோல்வியடைந்தது' : 'Update failed');
    }
  };

  const deleteApplicant = async (id) => {
    const token = localStorage.getItem('tvpk_token');
    const ok = window.confirm(
      currentLang === 'ta'
        ? 'இந்த விண்ணப்பத்தை நிரந்தரமாக நீக்க வேண்டுமா? இந்த செயலை மாற்ற முடியாது.'
        : 'Are you sure you want to permanently delete this application? This action cannot be undone.'
    );
    if (!ok) return;
    try {
      const r = await fetch(`${api}/admin/applicants/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const j = await readJsonSafe(r);
      if (!r.ok) return alert(j?.error || (currentLang === 'ta' ? 'நீக்குதல் தோல்வியடைந்தது' : 'Delete failed'));
      setApplicants((prev) => prev.filter((item) => item._id !== id));
    } catch {
      alert(currentLang === 'ta' ? 'நீக்குதல் தோல்வியடைந்தது' : 'Delete failed');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-4 sm:py-8 p-3 sm:p-6">
      <div className="max-w-5xl mx-auto p-4 sm:p-6 bg-white rounded-2xl shadow mt-4 sm:mt-8 border border-slate-200">
        <div className="flex items-center justify-end mb-4">
          <Link
            to="/admin/dashboard"
            className="px-3 py-2 border rounded text-sm bg-white hover:bg-slate-50"
          >
            {currentLang === 'ta' ? 'முகாமுக்கு திரும்பவும்' : 'Back to Dashboard'}
          </Link>
        </div>
        <h3 className={`text-xl font-black mb-4 ${currentLang === 'ta' ? 'font-tamil' : ''}`}>{currentLang === 'ta' ? 'உறுப்பினர் விண்ணப்பங்கள்' : 'Member Applications'}</h3>
        <div className="mb-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setView('all')}
            className={`px-3 py-2 rounded border text-sm font-semibold ${view === 'all' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white hover:bg-slate-50'}`}
          >
            {currentLang === 'ta' ? 'அனைத்தும்' : 'All'} ({applicants.length})
          </button>
          <button
            type="button"
            onClick={() => setView('active')}
            className={`px-3 py-2 rounded border text-sm font-semibold ${view === 'active' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white hover:bg-slate-50'}`}
          >
            {currentLang === 'ta' ? 'செயலில் உள்ளவை' : 'Active'} ({applicants.filter((item) => item.status !== 'removed').length})
          </button>
          <button
            type="button"
            onClick={() => setView('removed')}
            className={`px-3 py-2 rounded border text-sm font-semibold ${view === 'removed' ? 'bg-rose-600 text-white border-rose-600' : 'bg-white hover:bg-slate-50'}`}
          >
            {currentLang === 'ta' ? 'நீக்கப்பட்டவை' : 'Removed'} ({applicants.filter((item) => item.status === 'removed').length})
          </button>
        </div>
        <div className="mb-4 text-sm text-slate-500">
          {view === 'all' && (currentLang === 'ta' ? 'அனைத்து விண்ணப்பங்களும் உறுப்பினர்களும் காட்டப்படுகின்றன.' : 'Showing all applications and members.')}
          {view === 'active' && (currentLang === 'ta' ? 'நிலுவை மற்றும் ஒப்புதல் பெற்ற உறுப்பினர்கள் மட்டும் காட்டப்படுகின்றனர்.' : 'Showing pending and approved members only.')}
          {view === 'removed' && (currentLang === 'ta' ? 'நீக்கப்பட்ட உறுப்பினர்கள் மட்டும் காட்டப்படுகின்றனர். நீக்கப்பட்ட TVPK எண்கள் மறுபடியும் வழங்கப்படாது.' : 'Showing removed members only. Removed TVPK numbers stay retired.')}
        </div>
        {!isAdmin() && <div className="text-sm text-red-600">{currentLang === 'ta' ? 'நிர்வாக அணுகல் தேவை.' : 'Admin access required.'}</div>}
        {isAdmin() && loading && <div className="text-sm text-slate-500">{currentLang === 'ta' ? 'விண்ணப்பங்கள் ஏற்றப்படுகின்றன...' : 'Loading applications...'}</div>}
        {isAdmin() && !loading && error && <div className="text-sm text-red-600">{error}</div>}
        {isAdmin() && !loading && !error && !visibleApplicants.length && <div className="text-sm text-slate-500">{currentLang === 'ta' ? 'இதுவரை விண்ணப்பங்கள் இல்லை.' : 'No applications yet.'}</div>}

        {isAdmin() && !loading && !error && visibleApplicants.length > 0 && (
          <div className="space-y-4">
            {visibleApplicants.map((a) => (
              <div key={a._id} className={`border rounded-lg p-4 ${a.status === 'removed' ? 'bg-slate-50/70 border-slate-200' : 'bg-white border-slate-200'} shadow-sm hover:shadow-md transition-shadow`}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-14 h-14 bg-slate-100 rounded-full overflow-hidden shrink-0 border-2 border-slate-200 shadow-inner">
                      {a.professionalPhoto ? (
                        <img src={`${api}${a.professionalPhoto}`} alt="user photo" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full grid place-items-center text-[10px] leading-tight text-slate-400 text-center font-bold px-1 bg-slate-50">No photo</div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold truncate text-base text-slate-900">{a.name}</div>
                      <div className="text-sm text-slate-600 truncate">{a.email || a.phone}</div>
                      <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5 flex-wrap">
                        <span>Status:</span>
                        <span className={`font-black uppercase tracking-wider text-[10px] px-2 py-0.5 rounded-full border ${
                          a.status === 'approved'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : a.status === 'rejected'
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : a.status === 'removed'
                            ? 'bg-slate-100 text-slate-600 border-slate-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>{currentLang === 'ta'
                          ? (a.status === 'approved' ? 'ஒப்புதல் பெற்றது' : a.status === 'rejected' ? 'நிராகரிக்கப்பட்டது' : a.status === 'removed' ? 'நீக்கப்பட்டது' : 'நிலுவையில்')
                          : a.status
                        }</span>
                        {a.memberSequence ? ` • TVPK${String(a.memberSequence).padStart(8, '0')}` : ''}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap justify-start md:justify-end w-full md:w-auto">
                    <button
                      onClick={() => setExpandedId(expandedId === a._id ? null : a._id)}
                      className="px-3 py-2 border border-blue-200 text-blue-700 hover:bg-blue-50 bg-blue-50/20 text-xs font-bold rounded-lg transition-colors"
                    >
                      {expandedId === a._id
                        ? (currentLang === 'ta' ? 'விவரங்களை மறைக்கவும்' : 'Hide Details')
                        : (currentLang === 'ta' ? 'விவரங்களைக் காட்டவும்' : 'Show Details')}
                    </button>
                    {a.aadharImage && (
                      <a
                        target="_blank"
                        rel="noreferrer"
                        href={`${api}${a.aadharImage}`}
                        className="px-3 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 bg-white text-xs font-medium rounded-lg transition-colors"
                      >
                        {currentLang === 'ta' ? 'ஆதாரைப் பார்க்கவும்' : 'View Aadhar'}
                      </a>
                    )}
                    {a.professionalPhoto ? (
                      <a
                        target="_blank"
                        rel="noreferrer"
                        href={`${api}${a.professionalPhoto}`}
                        className="px-3 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 bg-white text-xs font-medium rounded-lg transition-colors"
                      >
                        {currentLang === 'ta' ? 'தொழில்முறை புகைப்படம்' : 'View Photo'}
                      </a>
                    ) : (
                      <span className="px-3 py-2 text-xs text-slate-400 border border-slate-200 rounded-lg bg-slate-50 font-medium">{currentLang === 'ta' ? 'புகைப்படம் இல்லை' : 'No Photo'}</span>
                    )}
                    {a.casteCertificate ? (
                      <a
                        target="_blank"
                        rel="noreferrer"
                        href={`${api}${a.casteCertificate}`}
                        className="px-3 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 bg-white text-xs font-medium rounded-lg transition-colors"
                      >
                        {currentLang === 'ta' ? 'சான்றிதழைப் பார்க்கவும்' : 'View Certificate'}
                      </a>
                    ) : (
                      <span className="px-3 py-2 text-xs text-slate-400 border border-slate-200 rounded-lg bg-slate-50 font-medium">{currentLang === 'ta' ? 'சான்றிதழ் இல்லை' : 'No Certificate'}</span>
                    )}

                    {a.status === 'pending' ? (
                      <>
                        <button
                          onClick={() => updateStatus(a._id, 'approved', 'user')}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-lg shadow-xs transition-colors cursor-pointer"
                        >
                          {currentLang === 'ta' ? 'ஒப்புதல்' : 'Approve'}
                        </button>
                        <button
                          onClick={() => updateStatus(a._id, 'rejected')}
                          className="px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                        >
                          {currentLang === 'ta' ? 'மறுப்பு' : 'Reject'}
                        </button>
                      </>
                    ) : a.status === 'approved' && view !== 'removed' ? (
                      <button
                        onClick={() => updateStatus(a._id, 'removed')}
                        className="px-3 py-2 border border-slate-200 text-slate-400 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                      >
                        {currentLang === 'ta' ? 'உறுப்பினரை நீக்கவும்' : 'Remove Member'}
                      </button>
                    ) : a.status === 'approved' ? (
                      null
                    ) : a.status === 'rejected' ? (
                      <>
                        <button
                          onClick={() => deleteApplicant(a._id)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-black rounded-lg shadow-xs transition-colors cursor-pointer"
                        >
                          <Trash2 size={14} />
                          {currentLang === 'ta' ? 'நீக்கவும்' : 'Delete'}
                        </button>
                      </>
                    ) : a.status === 'removed' ? (
                      <>
                        <span className="px-3 py-2 text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200 rounded-lg">{currentLang === 'ta' ? 'நீக்கப்பட்டது' : 'Removed'}</span>
                        <span className="px-3 py-2 text-xs font-medium bg-white text-slate-500 border border-slate-200 rounded-lg">{currentLang === 'ta' ? 'எண் ஒதுக்கப்படவில்லை' : 'Number retired'}</span>
                        <button
                          onClick={() => deleteApplicant(a._id)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black rounded-lg shadow-xs transition-colors cursor-pointer"
                        >
                          <Trash2 size={14} />
                          {currentLang === 'ta' ? 'நிரந்தரமாக நீக்கவும்' : 'Delete Permanently'}
                        </button>
                      </>
                    ) : (
                      <span className="px-3 py-2 text-xs font-medium bg-slate-50 text-slate-500 border border-slate-200 rounded-lg">{currentLang === 'ta' ? 'இறுதியாக்கப்பட்டது' : 'Finalized'}</span>
                    )}
                  </div>
                </div>

                {expandedId === a._id && (
                  <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-700 bg-slate-50/50 p-3 rounded-lg">
                    <div>
                      <span className="font-bold block text-slate-800">{currentLang === 'ta' ? 'முழு பெயர்:' : 'Full Name:'}</span>
                      <span>{a.name || '-'}</span>
                    </div>
                    <div>
                      <span className="font-bold block text-slate-800">{currentLang === 'ta' ? 'மின்னஞ்சல்:' : 'Email Address:'}</span>
                      <span>{a.email || '-'}</span>
                    </div>
                    <div>
                      <span className="font-bold block text-slate-800">{currentLang === 'ta' ? 'தொலைபேசி:' : 'Phone:'}</span>
                      <span>{a.phone || '-'}</span>
                    </div>
                    <div>
                      <span className="font-bold block text-slate-800">{currentLang === 'ta' ? 'பிறந்த தேதி:' : 'Date of Birth:'}</span>
                      <span>{a.dob ? new Date(a.dob).toLocaleDateString() : '-'}</span>
                    </div>
                    <div>
                      <span className="font-bold block text-slate-800">{currentLang === 'ta' ? 'வாக்காளர் அடையாள அட்டை / ஆதார்:' : 'Voter ID / Aadhaar:'}</span>
                      <span>{a.aadharNumber || '-'}</span>
                    </div>
                    <div>
                      <span className="font-bold block text-slate-800">{currentLang === 'ta' ? 'பூத் எண்:' : 'Booth Number:'}</span>
                      <span>{a.boothNumber || '-'}</span>
                    </div>
                    <div>
                      <span className="font-bold block text-slate-800">{currentLang === 'ta' ? 'சட்டமன்றத் தொகுதி:' : 'Assembly Constituency:'}</span>
                      <span>{a.assemblyConstituency || '-'}</span>
                    </div>
                    <div>
                      <span className="font-bold block text-slate-800">{currentLang === 'ta' ? 'மாவட்டம்:' : 'District:'}</span>
                      <span>{a.district || '-'}</span>
                    </div>
                    <div>
                      <span className="font-bold block text-slate-800">{currentLang === 'ta' ? 'தமிழ் சமூகம்:' : 'Tamil Community:'}</span>
                      <span className="font-semibold text-red-700">{a.tamilCommunity || '-'}</span>
                    </div>
                    <div className="md:col-span-2">
                      <span className="font-bold block text-slate-800">{currentLang === 'ta' ? 'முகவரி:' : 'Address:'}</span>
                      <span className="whitespace-pre-wrap">{a.address || '-'}</span>
                    </div>
                    <div className="md:col-span-2 flex flex-col gap-1 mt-1 text-xs text-slate-500">
                      <div>• {currentLang === 'ta' ? 'தமிழ் குடி / தமிழ் ஜாதியில் பிறந்தவர்:' : 'Born in Tamil caste/kudi:'} <span className="font-bold text-slate-700">{a.bornTamilOrKudi ? 'Yes / ஆம்' : 'No / இல்லை'}</span></div>
                      <div>• {currentLang === 'ta' ? 'கட்சி விதிகளுக்கு உடன்பட்டவர்:' : 'Agreed to party rules:'} <span className="font-bold text-slate-700">{a.agreeRules ? 'Yes / ஆம்' : 'No / இல்லை'}</span></div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
