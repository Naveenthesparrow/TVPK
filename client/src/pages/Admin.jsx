import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-5xl mx-auto p-6 bg-white rounded shadow mt-8">
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
              <div key={a._id} className={`flex items-center justify-between p-4 border rounded-lg gap-4 ${a.status === 'removed' ? 'bg-slate-50' : 'bg-white'}`}>
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-14 h-14 bg-slate-50 rounded overflow-hidden shrink-0 border border-slate-200">
                    {a.aadharImage ? (
                      <img src={`${api}${a.aadharImage}`} alt="aadhar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full grid place-items-center text-xs text-slate-400">No image</div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold truncate">{a.name}</div>
                    <div className="text-sm text-slate-500 truncate">{a.email || a.phone}</div>
                    <div className="text-xs text-slate-400">
                      Status: <span className="font-semibold uppercase tracking-wide">{a.status}</span>
                      {a.memberSequence ? ` • TVPK${String(a.memberSequence).padStart(8, '0')}` : ''}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-wrap justify-end">
                  {a.aadharImage && (
                    <a
                      target="_blank"
                      rel="noreferrer"
                      href={`${api}${a.aadharImage}`}
                      className="px-3 py-2 border rounded text-sm bg-white hover:bg-slate-50"
                    >
                      {currentLang === 'ta' ? 'ஆதாரைப் பார்க்கவும்' : 'View Aadhar'}
                    </a>
                  )}
                  {a.professionalPhoto ? (
                    <a
                      target="_blank"
                      rel="noreferrer"
                      href={`${api}${a.professionalPhoto}`}
                      className="px-3 py-2 border rounded text-sm bg-white hover:bg-slate-50"
                    >
                      {currentLang === 'ta' ? 'தொழில்முறை புகைப்படத்தைப் பார்க்கவும்' : 'View Professional Photo'}
                    </a>
                  ) : (
                    <span className="px-3 py-2 text-sm text-slate-400 border rounded bg-slate-50">{currentLang === 'ta' ? 'தொழில்முறை புகைப்படம் இல்லை' : 'No Professional Photo'}</span>
                  )}
                  {a.casteCertificate ? (
                    <a
                      target="_blank"
                      rel="noreferrer"
                      href={`${api}${a.casteCertificate}`}
                      className="px-3 py-2 border rounded text-sm bg-white hover:bg-slate-50"
                    >
                      {currentLang === 'ta' ? 'சான்றிதழைப் பார்க்கவும்' : 'View Certificate'}
                    </a>
                  ) : (
                    <span className="px-3 py-2 text-sm text-slate-400 border rounded bg-slate-50">{currentLang === 'ta' ? 'சான்றிதழ் இல்லை' : 'No Certificate'}</span>
                  )}

                  {a.status === 'pending' ? (
                    <>
                      <button
                        onClick={() => updateStatus(a._id, 'approved', 'user')}
                        className="px-3 py-2 bg-green-600 text-white rounded text-sm"
                      >
                        {currentLang === 'ta' ? 'ஒப்புதல்' : 'Approve'}
                      </button>

                      <button
                        onClick={() => updateStatus(a._id, 'rejected')}
                        className="px-3 py-2 bg-red-600 text-white rounded text-sm"
                      >
                        {currentLang === 'ta' ? 'மறுப்பு' : 'Reject'}
                      </button>
                    </>
                  ) : a.status === 'approved' && view !== 'removed' ? (
                    <>
                      <span className="px-3 py-2 text-sm text-emerald-700 border rounded bg-emerald-50">{currentLang === 'ta' ? 'செயலில் உள்ள உறுப்பினர்' : 'Active Member'}</span>
                      <button
                        onClick={() => updateStatus(a._id, 'removed')}
                        className="px-3 py-2 bg-rose-600 text-white rounded text-sm"
                      >
                        {currentLang === 'ta' ? 'உறுப்பினரை நீக்கவும்' : 'Remove Member'}
                      </button>
                    </>
                  ) : a.status === 'approved' ? (
                    <span className="px-3 py-2 text-sm text-emerald-700 border rounded bg-emerald-50">{currentLang === 'ta' ? 'ஒப்புதல் பெற்றது' : 'Approved'}</span>
                  ) : a.status === 'removed' ? (
                    <>
                      <span className="px-3 py-2 text-sm text-slate-600 border rounded bg-slate-100">{currentLang === 'ta' ? 'நீக்கப்பட்டது' : 'Removed'}</span>
                      <span className="px-3 py-2 text-sm text-slate-500 border rounded bg-white">{currentLang === 'ta' ? 'எண் ஒதுக்கப்படவில்லை' : 'Number retired'}</span>
                    </>
                  ) : (
                    <span className="px-3 py-2 text-sm text-slate-500 border rounded bg-slate-50">{currentLang === 'ta' ? 'இறுதியாக்கப்பட்டது' : 'Finalized'}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
