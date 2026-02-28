import React, { useState, useEffect } from 'react';
import Auth from '../components/Auth';
import { useTranslation } from 'react-i18next';

const API = import.meta.env.VITE_API_URL || '';

function isExpired(token) {
  if (!token) return true;
  try {
    const { exp } = JSON.parse(atob(token.split('.')[1]));
    return !exp || exp * 1000 < Date.now();
  } catch { return true; }
}

const Login = () => {
  const { t } = useTranslation();
  const [mode, setMode]       = useState('login');
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [name, setName]       = useState('');
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  // If already logged in with a valid token, go home immediately
  useEffect(() => {
    const token = localStorage.getItem('tvpk_token');
    if (token && !isExpired(token)) {
      window.location.href = '/';
    }
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const endpoint = mode === 'login' ? '/auth/login' : '/auth/signup';
    try {
      const res = await fetch(`${API}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, ...(mode === 'signup' ? { name } : {}) }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Request failed.'); return; }

      localStorage.setItem('tvpk_token', data.token);
      localStorage.setItem('tvpk_user', JSON.stringify(data.user));
      window.dispatchEvent(new CustomEvent('tvpk-auth-change', { detail: data.user }));
      window.location.href = '/';
    } catch {
      setError('Network error. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-start justify-center pt-6 pb-12">
      <div className="w-full max-w-lg mx-auto p-8 bg-white rounded-xl shadow-xl mt-6">

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-black text-slate-800 uppercase">
            {mode === 'login' ? t('login.title_login', 'LOGIN') : t('login.title_signup', 'SIGN UP')}
          </h1>
          <div className="h-1.5 w-20 bg-red-400 mx-auto rounded-full mt-3 opacity-40" />
        </div>

        {/* Google sign-in */}
        <div className="mb-6">
          <div className="w-full border rounded-lg p-3">
            <Auth />
          </div>
        </div>

        {/* Divider */}
        <div className="text-center text-sm text-slate-400 mb-5">
          {t('login.or_email', 'Or use your email')}
        </div>

        {/* Email/Password form */}
        <form onSubmit={submit} className="space-y-4">
          {mode === 'signup' && (
            <input
              value={name} onChange={e => setName(e.target.value)}
              placeholder={t('login.placeholder_name', 'Full Name')}
              className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-300"
            />
          )}
          <input
            type="email" value={email} onChange={e => setEmail(e.target.value)} required
            placeholder={t('login.placeholder_email', 'Email')}
            className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-300"
          />
          <input
            type="password" value={password} onChange={e => setPassword(e.target.value)} required
            placeholder={t('login.placeholder_password', 'Password')}
            className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-300"
          />

          {error && (
            <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-md px-3 py-2">
              {error}
            </div>
          )}

          <div className="flex gap-4 pt-1">
            <button type="submit" disabled={loading}
              className="flex-1 bg-[#d21d1d] hover:bg-[#b81818] disabled:opacity-60 text-white px-6 py-3 rounded-md font-semibold transition">
              {loading ? 'Please wait' : mode === 'login' ? t('login.btn_login', 'Login') : t('login.btn_signup', 'Sign Up')}
            </button>
            <button type="button" onClick={() => { setMode(m => m === 'login' ? 'signup' : 'login'); setError(''); }}
              className="flex-1 border border-slate-300 hover:bg-slate-50 px-6 py-3 rounded-md font-semibold transition">
              {mode === 'login' ? t('login.btn_switch_to_signup', 'Go to Sign Up') : t('login.btn_switch_to_login', 'Go to Login')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
