import React, { useEffect, useRef, useState } from 'react';

const Auth = () => {
  const btnRef = useRef(null);
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('tvpk_user')) || null; } catch { return null; }
  });
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  // Helper to detect expired JWTs (returns true if missing/invalid/expired)
  const isTokenExpired = (token) => {
    if (!token) return true;
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return true;
      const payload = JSON.parse(atob(parts[1]));
      if (!payload || !payload.exp) return true;
      return payload.exp * 1000 < Date.now();
    } catch (e) {
      return true;
    }
  };

  // Load Google Identity script and initialize button
  useEffect(() => {
    if (!clientId) return;

    const init = () => {
      if (!window.google || !window.google.accounts) return;
      try {
        window.google.accounts.id.initialize({ client_id: clientId, callback: handleCredentialResponse });
        if (btnRef.current && !user) {
          // clear container then render
          btnRef.current.innerHTML = '';
          window.google.accounts.id.renderButton(btnRef.current, { theme: 'outline', size: 'large' });
        }
      } catch (err) {
        console.error('Google init error', err);
      }
    };

    const scriptId = 'gsi-client';
    if (!document.getElementById(scriptId)) {
      const s = document.createElement('script');
      s.src = 'https://accounts.google.com/gsi/client';
      s.id = scriptId;
      s.async = true;
      s.defer = true;
      s.onload = init;
      document.body.appendChild(s);
    } else {
      init();
    }

    return () => {};
  }, [clientId, user]);

  // Listen to auth-change events (other components may dispatch)
  useEffect(() => {
    const onAuth = (e) => {
      try {
        const detail = e && e.detail ? e.detail : null;
        const stored = JSON.parse(localStorage.getItem('tvpk_user')) || null;
        setUser(detail || stored || null);
      } catch {
        setUser(null);
      }
    };
    window.addEventListener('tvpk-auth-change', onAuth);
    return () => window.removeEventListener('tvpk-auth-change', onAuth);
  }, []);

  const handleCredentialResponse = async (response) => {
    const id_token = response?.credential;
    if (!id_token) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/auth/google`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id_token })
      });
      const data = await res.json();
      if (data.token) {
        localStorage.setItem('tvpk_token', data.token);
        localStorage.setItem('tvpk_user', JSON.stringify(data.user));
        setUser(data.user);
        window.dispatchEvent(new CustomEvent('tvpk-auth-change', { detail: data.user }));
        // redirect to home so user leaves the login page after Google sign-in
        try { window.location.href = '/'; } catch (e) { /* ignore */ }
      }
    } catch (err) { console.error('Sign-in error', err); }
  };

  const logout = () => {
    localStorage.removeItem('tvpk_token');
    localStorage.removeItem('tvpk_user');
    setUser(null);
    window.dispatchEvent(new CustomEvent('tvpk-auth-change', { detail: null }));
  };

  // On mount and when `user` changes: if token expired remove it; otherwise schedule auto-logout
  useEffect(() => {
    let timer = null;
    try {
      const token = localStorage.getItem('tvpk_token');
      if (!token) return undefined;
      if (isTokenExpired(token)) {
        logout();
        return undefined;
      }

      // schedule logout at token expiry
      const parts = token.split('.');
      const payload = JSON.parse(atob(parts[1]));
      const ms = (payload.exp * 1000) - Date.now();
      if (ms > 0) {
        timer = setTimeout(() => { logout(); }, ms);
      } else {
        logout();
      }
    } catch (e) {
      // ignore parsing errors and ensure logout for safety
      try { logout(); } catch {}
    }
    return () => { if (timer) clearTimeout(timer); };
  }, [user]);

  // close dropdown on outside click or Escape
  useEffect(() => {
    const onDown = (e) => { if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey); };
  }, []);

  // Detect if we're on login page to show inline logout+role
  const isLoginPage = typeof window !== 'undefined' && window.location.pathname === '/login';

  // Ensure any stray GSI DOM is removed when user logs in
  useEffect(() => {
    if (user) {
      try { if (btnRef.current) btnRef.current.innerHTML = ''; } catch {}
      try {
        const els = document.querySelectorAll('div.g_id_signin, div[data-client_id]');
        els.forEach(el => el.remove());
      } catch (e) {}
    }
  }, [user]);

  return (
    <div>
      {/* always keep the button container in DOM so GSI renders into it; hide when user exists */}
      <div ref={btnRef} className={user ? 'hidden w-full' : 'w-full'} />

      {user && isLoginPage && (
        <div className="w-full">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img src={user.picture} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
              <div>
                <div className="font-bold">{user.name}</div>
                <div className="text-xs text-slate-500">{user.role ? user.role.toUpperCase() : 'USER'}</div>
              </div>
            </div>
            <div>
              <button onClick={logout} className="px-3 py-2 bg-slate-100 rounded-md">Logout</button>
            </div>
          </div>
        </div>
      )}

      {user && !isLoginPage && (
        <div ref={wrapperRef} className="relative inline-block">
          <button onClick={() => setOpen(v => !v)} className="flex items-center gap-3 min-w-0">
            <img src={user.picture} alt={user.name} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
            <span title={user.name} className="text-sm font-bold truncate max-w-[140px] hidden md:inline-block">{user.name}</span>
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-56 bg-white border rounded-md shadow-lg z-50">
              <div className="px-3 py-2 text-sm text-slate-700 border-b">
                <div className="font-semibold">{user.name}</div>
                <div className="text-xs text-slate-500">{user.role ? user.role.toUpperCase() : 'USER'}</div>
              </div>
              <button onClick={() => { logout(); setOpen(false); }} className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50">Logout</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Auth;
