import React, { useEffect, useRef, useState } from 'react';

const ProfileMenu = () => {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('tvpk_user')) || null; } catch { return null; }
  });
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    const onChange = (e) => {
      try { setUser(e?.detail ?? JSON.parse(localStorage.getItem('tvpk_user'))); } catch { setUser(null); }
    };
    const onClickOutside = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    window.addEventListener('tvpk-auth-change', onChange);
    document.addEventListener('mousedown', onClickOutside);
    return () => {
      window.removeEventListener('tvpk-auth-change', onChange);
      document.removeEventListener('mousedown', onClickOutside);
    };
  }, []);

  const logout = () => {
    localStorage.removeItem('tvpk_token');
    localStorage.removeItem('tvpk_user');
    window.dispatchEvent(new CustomEvent('tvpk-auth-change', { detail: null }));
    setOpen(false);
  };

  if (!user) return null;

  const initials = (user.name || '').split(' ').map(s => s[0]).join('').slice(0,2).toUpperCase();

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(v => !v)} aria-label={`Open profile menu for ${user.name}`} className="rounded-full p-0">
        {user.picture && !imgError ? (
          <img src={user.picture} alt={user.name} onError={() => setImgError(true)} className="w-8 h-8 rounded-full object-cover" />
        ) : (
          <span className="w-8 h-8 inline-flex items-center justify-center rounded-full bg-slate-100 text-sm font-extrabold text-slate-700">{initials}</span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-white border rounded-md shadow-lg z-50">
          <div className="px-3 py-2 text-sm text-slate-700 border-b">
            <div className="font-semibold">{user.name}</div>
            {user.role && <div className="text-xs text-slate-500">{user.role.toUpperCase()}</div>}
          </div>
          <button onClick={logout} className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50">Logout</button>
        </div>
      )}
    </div>
  );
};

export default ProfileMenu;
