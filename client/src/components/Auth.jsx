import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const API =
  (import.meta.env.VITE_API_URL || '').replace(/\/$/, '') ||
  (import.meta.env.DEV ? 'http://localhost:5000' : '');
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
const GSI_INIT_KEY = '__tvpk_gsi_initialized';

async function readJsonSafe(res) {
  const text = await res.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function isExpired(token) {
  if (!token) return true;
  try {
    const { exp } = JSON.parse(atob(token.split('.')[1]));
    return !exp || exp * 1000 < Date.now();
  } catch { return true; }
}
function clearSession() {
  localStorage.removeItem('tvpk_token');
  localStorage.removeItem('tvpk_user');
}
function saveSession(token, user) {
  localStorage.setItem('tvpk_token', token);
  localStorage.setItem('tvpk_user', JSON.stringify(user));
}
function broadcast(user) {
  window.dispatchEvent(new CustomEvent('tvpk-auth-change', { detail: user }));
}
function getStoredUser() {
  try { return JSON.parse(localStorage.getItem('tvpk_user')) || null; } catch { return null; }
}

const Auth = () => {
  const { t, i18n } = useTranslation();
  const [user, setUser] = useState(getStoredUser);
  const [open, setOpen] = useState(false);
  const btnRef = useRef(null);
  const wrapperRef = useRef(null);
  const isLoginPage = typeof window !== 'undefined' && window.location.pathname === '/login';

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
    broadcast(null);
    // Tell Google to forget the selected account so the button resets to "Sign in with Google"
    try { window.google?.accounts?.id?.disableAutoSelect(); } catch {}
    if (window.location.pathname !== '/login') window.location.href = '/login';
  }, []);

  // Verify session with server on mount
  useEffect(() => {
    const verify = async () => {
      const token = localStorage.getItem('tvpk_token');
      if (!token) { setUser(null); return; }
      if (isExpired(token)) { clearSession(); setUser(null); broadcast(null); return; }
      try {
        const res = await fetch(`${API}/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) { clearSession(); setUser(null); broadcast(null); }
        else {
          const data = await readJsonSafe(res);
          const fresh = data?.user;
          if (!fresh) {
            clearSession();
            setUser(null);
            broadcast(null);
            return;
          }
          saveSession(token, fresh);
          setUser(fresh);
          broadcast(fresh);
        }
      } catch { /* network error — keep session */ }
    };
    verify();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-logout at token expiry
  useEffect(() => {
    const token = localStorage.getItem('tvpk_token');
    if (!token || isExpired(token)) return;
    try {
      const { exp } = JSON.parse(atob(token.split('.')[1]));
      const ms = exp * 1000 - Date.now();
      if (ms <= 0) { logout(); return; }
      const t = setTimeout(logout, ms);
      return () => clearTimeout(t);
    } catch { logout(); }
  }, [user, logout]);

  // Sync auth state across components
  useEffect(() => {
    const onAuth = (e) => setUser(e.detail ?? getStoredUser());
    window.addEventListener('tvpk-auth-change', onAuth);
    return () => window.removeEventListener('tvpk-auth-change', onAuth);
  }, []);

  // Google Identity Services button
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || user) return;
    const init = () => {
      if (!window.google?.accounts?.id) return;
      if (!window[GSI_INIT_KEY]) {
        window.google.accounts.id.initialize({ client_id: GOOGLE_CLIENT_ID, callback: handleGoogle });
        window[GSI_INIT_KEY] = true;
      }
      if (btnRef.current) {
        btnRef.current.innerHTML = '';
        window.google.accounts.id.renderButton(btnRef.current, { theme: 'outline', size: 'large', width: btnRef.current.offsetWidth || 300 });
      }
    };
    const id = 'gsi-script';
    if (!document.getElementById(id)) {
      const s = document.createElement('script');
      s.id = id; s.src = 'https://accounts.google.com/gsi/client'; s.async = true; s.defer = true; s.onload = init;
      document.body.appendChild(s);
    } else { init(); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleGoogle = async (response) => {
    const id_token = response?.credential;
    if (!id_token) return;
    try {
      const res = await fetch(`${API}/auth/google`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id_token }),
      });
      const data = await readJsonSafe(res);
      if (!data) { alert('Server returned invalid response.'); return; }
      if (!res.ok) {
        const message = data.details ? `${data.error || 'Google sign-in failed.'} ${data.details}` : (data.error || 'Google sign-in failed.');
        alert(message);
        return;
      }
      saveSession(data.token, data.user);
      setUser(data.user);
      broadcast(data.user);
      window.location.href = '/';
    } catch { alert('Network error. Please try again.'); }
  };

  // Close dropdown on outside click / Escape
  useEffect(() => {
    const onDown = (e) => { if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey); };
  }, []);

  const Avatar = () => user?.picture
    ? <img src={user.picture} alt={user.name} className="w-9 h-9 rounded-full object-cover" />
    : <span className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-700">
        {(user?.name || user?.email || '?')[0].toUpperCase()}
      </span>;

  return (
    <div>
      <div ref={btnRef} className={user ? 'hidden' : 'w-full'}>
        {/* Mock Placeholder Button to show instantly before Google Script renders */}
        <div className="w-full h-10 flex items-center justify-center gap-3 px-3 rounded border border-[#747775] bg-white text-[#1f1f1f] font-sans font-medium text-sm select-none shadow-xs cursor-wait">
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          <span>{i18n.language === 'ta' ? 'Google மூலம் உள்நுழைக' : 'Sign in with Google'}</span>
        </div>
      </div>

      {user && isLoginPage && (
        <div className="w-full flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Avatar />
            <div>
              <div className="font-bold text-sm">{user.name || user.email}</div>
              <div className="text-xs text-slate-500 uppercase tracking-wide">{user.role}</div>
            </div>
          </div>
          <button onClick={logout} className="px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-md text-sm font-semibold transition">Logout</button>
        </div>
      )}

      {user && !isLoginPage && (
        <div ref={wrapperRef} className="relative inline-block">
          <button onClick={() => setOpen(v => !v)} className="flex items-center gap-2">
            <Avatar />
            <span className="hidden md:inline text-sm font-bold truncate max-w-[120px]">{user.name || user.email}</span>
          </button>
          {open && (
            <div className="absolute right-0 mt-2 w-56 bg-white border rounded-md shadow-lg z-50">
              <div className="px-3 py-2 border-b">
                <div className="font-semibold text-sm truncate">{user.name || user.email}</div>
                <div className="text-xs text-slate-500 uppercase">{user.role}</div>
              </div>
              {user.role === 'admin' && (
                <Link to="/admin/dashboard" className="block px-3 py-2 text-sm hover:bg-slate-50 font-semibold text-red-600">Admin Dashboard</Link>
              )}
              <button onClick={() => { logout(); setOpen(false); }} className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 text-red-500 font-semibold">Logout</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Auth;
