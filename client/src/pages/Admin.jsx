import React from 'react';
import { Link } from 'react-router-dom';
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
  const api =
    (import.meta.env.VITE_API_URL || '').replace(/\/$/, '') ||
    (import.meta.env.DEV ? 'http://localhost:5000' : '');
  const [applicants, setApplicants] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  const loadApplicants = React.useCallback(async () => {
    try {
      setError('');
      if (!isAdmin()) {
        setApplicants([]);
        setError('Admin access required.');
        setLoading(false);
        return;
      }

      const token = localStorage.getItem('tvpk_token');
      if (!token) {
        setApplicants([]);
        setError('Please log in again.');
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
          setError('Session expired. Please log in again.');
        } else if (r.status === 403) {
          setError('Admin access required.');
        } else {
          setError(j?.error || 'Failed to load member applications.');
        }
        setLoading(false);
        return;
      }

      const j = await readJsonSafe(r);
      if (!j) {
        setApplicants([]);
        setError('Server returned invalid response.');
        setLoading(false);
        return;
      }

      setApplicants(Array.isArray(j.applicants) ? j.applicants : []);
    } catch {
      setApplicants([]);
      setError('Network error while loading applications.');
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
      const r = await fetch(`${api}/admin/applicants/${id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(role ? { status, role } : { status }),
      });
      const j = await readJsonSafe(r);
      if (!r.ok) return alert(j?.error || 'Update failed');
      setApplicants((prev) => prev.map((item) => (item._id === id ? { ...item, status: j?.applicant?.status || status } : item)));
      if (j?.warning) alert(j.warning);
      await loadApplicants();
    } catch {
      alert('Update failed');
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
            Back to Dashboard
          </Link>
        </div>
        <h3 className="text-xl font-black mb-4">Member Applications</h3>
        {!isAdmin() && <div className="text-sm text-red-600">Admin access required.</div>}
        {isAdmin() && loading && <div className="text-sm text-slate-500">Loading applications...</div>}
        {isAdmin() && !loading && error && <div className="text-sm text-red-600">{error}</div>}
        {isAdmin() && !loading && !error && !applicants.length && <div className="text-sm text-slate-500">No applications yet.</div>}

        {isAdmin() && !loading && !error && applicants.length > 0 && (
          <div className="space-y-4">
            {applicants.map((a) => (
              <div key={a._id} className="flex items-center justify-between p-4 border rounded-lg gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-14 h-14 bg-slate-50 rounded overflow-hidden shrink-0">
                    {a.aadharImage ? (
                      <img src={`${api}${a.aadharImage}`} alt="aadhar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full grid place-items-center text-xs text-slate-400">No image</div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold truncate">{a.name}</div>
                    <div className="text-sm text-slate-500 truncate">{a.email || a.phone}</div>
                    <div className="text-xs text-slate-400">Status: {a.status}</div>
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
                      View Aadhar
                    </a>
                  )}
                  {a.professionalPhoto ? (
                    <a
                      target="_blank"
                      rel="noreferrer"
                      href={`${api}${a.professionalPhoto}`}
                      className="px-3 py-2 border rounded text-sm bg-white hover:bg-slate-50"
                    >
                      View Professional Photo
                    </a>
                  ) : (
                    <span className="px-3 py-2 text-sm text-slate-400 border rounded bg-slate-50">No Professional Photo</span>
                  )}
                  {a.casteCertificate ? (
                    <a
                      target="_blank"
                      rel="noreferrer"
                      href={`${api}${a.casteCertificate}`}
                      className="px-3 py-2 border rounded text-sm bg-white hover:bg-slate-50"
                    >
                      View Certificate
                    </a>
                  ) : (
                    <span className="px-3 py-2 text-sm text-slate-400 border rounded bg-slate-50">No Certificate</span>
                  )}

                  {a.status === 'pending' ? (
                    <>
                      <button
                        onClick={() => updateStatus(a._id, 'approved', 'user')}
                        className="px-3 py-2 bg-green-600 text-white rounded text-sm"
                      >
                        Approve
                      </button>

                      <button
                        onClick={() => updateStatus(a._id, 'rejected')}
                        className="px-3 py-2 bg-red-600 text-white rounded text-sm"
                      >
                        Reject
                      </button>
                    </>
                  ) : (
                    <span className="px-3 py-2 text-sm text-slate-500 border rounded bg-slate-50">Finalized</span>
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
