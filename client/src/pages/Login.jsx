import React, { useState, useEffect } from 'react';
import Auth from '../components/Auth';
import { useTranslation } from 'react-i18next';
import enTranslations from '../locales/en.json';
import taTranslations from '../locales/ta.json';

const localeResources = { en: enTranslations, ta: taTranslations };

const localTFactory = (t, i18n) => (key) => {
  try {
    const langRaw = (i18n?.resolvedLanguage || i18n?.language || window?.localStorage?.getItem('i18nextLng')) || 'en';
    const lang = String(langRaw).split('-')[0];
    const translated = t(key, { lng: lang });
    if (translated && translated !== key) return translated;

    const parts = key.split('.');
    let cur = localeResources[lang] || localeResources['en'];
    for (const p of parts) {
      if (!cur) break;
      cur = cur[p];
    }
    if (typeof cur === 'string') return cur;

    cur = localeResources['en'];
    for (const p of parts) {
      if (!cur) break;
      cur = cur[p];
    }
    if (typeof cur === 'string') return cur;
  } catch (e) {}
  return key;
};

const Login = () => {
  const [mode, setMode] = useState('login'); // 'login' or 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState(null);
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem('tvpk_user');
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  });

  useEffect(() => {
    const onAuth = () => {
      try {
        const raw = localStorage.getItem('tvpk_user');
        setUser(raw ? JSON.parse(raw) : null);
      } catch (e) {
        setUser(null);
      }
    };
    window.addEventListener('tvpk-auth-change', onAuth);
    return () => window.removeEventListener('tvpk-auth-change', onAuth);
  }, []);

  const api = import.meta.env.VITE_API_URL || '';
  const { t, i18n } = useTranslation();
  const localT = localTFactory(t, i18n);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    const endpoint = mode === 'login' ? '/auth/login' : '/auth/signup';
    try {
      const res = await fetch(`${api}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name: mode === 'signup' ? name : undefined }),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.error || 'Request failed');
      localStorage.setItem('tvpk_token', data.token);
      localStorage.setItem('tvpk_user', JSON.stringify(data.user));
      window.location.href = '/';
    } catch (err) {
      setError('Network error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-start justify-center pt-6 pb-12">
      <div className="w-full max-w-lg mx-auto p-8 bg-white rounded-xl shadow-xl mt-6">
        <div className="text-center mb-6">
          <h1 className={`text-5xl md:text-6xl font-black text-slate-800 mb-2 uppercase`}>{mode === 'login' ? localT('login.title_login') : localT('login.title_signup')}</h1>
          <div className="h-1.5 w-20 bg-primary mx-auto rounded-full mt-3 opacity-30"></div>
        </div>

        <div className="mb-6">
          <div className="w-full border rounded-lg p-3">
            <Auth />
          </div>
        </div>

        <div className={`${user ? 'pointer-events-none opacity-60 transition' : ''}`}>
          <div className="text-center text-sm text-slate-500 mb-4">{localT('login.or_email')}</div>

          <form onSubmit={submit} className="space-y-4">
          {mode === 'signup' && (
            <input value={name} onChange={e => setName(e.target.value)} placeholder={localT('login.placeholder_name')} className="w-full p-3 border rounded-md focus:outline-none" />
          )}
          <input value={email} onChange={e => setEmail(e.target.value)} placeholder={localT('login.placeholder_email')} className="w-full p-3 border rounded-md focus:outline-none" />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder={localT('login.placeholder_password')} className="w-full p-3 border rounded-md focus:outline-none" />
          {error && <div className="text-red-600 text-sm">{error}</div>}

          <div className="flex gap-4">
            <button type="submit" className="flex-1 bg-[#d21d1d] text-white px-6 py-3 rounded-md font-semibold">{mode === 'login' ? localT('login.btn_login') : localT('login.btn_signup')}</button>
            <button type="button" onClick={() => setMode(mode === 'login' ? 'signup' : 'login')} className="flex-1 border border-slate-300 px-6 py-3 rounded-md font-semibold">{mode === 'login' ? localT('login.btn_switch_to_signup') : localT('login.btn_switch_to_login')}</button>
          </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
