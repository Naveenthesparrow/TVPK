import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { LogOut, Crown, LayoutDashboard } from 'lucide-react';

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
      <button onClick={() => setOpen(v => !v)} aria-label={`Open profile menu for ${user.name}`} className="rounded-full p-0 hover:opacity-80 transition">
        {user.picture && !imgError ? (
          <img src={user.picture} alt={user.name} onError={() => setImgError(true)} className="w-10 h-10 rounded-full object-cover ring-2 ring-secondary ring-offset-1 cursor-pointer" />
        ) : (
          <span className="w-10 h-10 inline-flex items-center justify-center rounded-full bg-secondary text-white text-xs font-black ring-2 ring-secondary ring-offset-1 cursor-pointer">{initials}</span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-64 bg-white border-0 rounded-xl shadow-2xl shadow-black/20 z-50 overflow-hidden animate-in fade-in duration-150">
          <div className="px-4 py-4 bg-gradient-to-r from-primary to-primary/90 text-white border-b-0">
            <div className="font-bold text-base">{user.name}</div>
            {user.role && <div className="text-xs text-yellow-100 font-semibold mt-0.5 flex items-center gap-1.5"><Crown size={14} /> {user.role.toUpperCase()}</div>}
          </div>
          {user.role === 'admin' && (
            <Link to="/admin/dashboard" className="block px-4 py-3 text-sm font-semibold text-primary hover:bg-primary/5 transition border-b border-slate-100 cursor-pointer flex items-center gap-2">
              <LayoutDashboard size={16} />
              Admin Dashboard
            </Link>
          )}
          <button onClick={logout} className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition">
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileMenu;
