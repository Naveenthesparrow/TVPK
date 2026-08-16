import React, { useState, useEffect } from 'react';
import Auth from '../components/Auth';
import { useTranslation } from 'react-i18next';

const API =
  (import.meta.env.VITE_API_URL || '').replace(/\/$/, '') ||
  (import.meta.env.DEV ? 'http://localhost:5000' : '');

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

const Login = () => {
  const { t, i18n } = useTranslation();
  const [mode, setMode]       = useState('login');
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [name, setName]       = useState('');
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const loadingLabel = t('login.loading', { defaultValue: 'Please wait' });
  const requestFailedLabel = t('login.error_request_failed', { defaultValue: 'Request failed' });
  const invalidResponseLabel = t('login.error_invalid_response', { defaultValue: 'Server returned invalid response. Check API URL/server.' });
  const incompleteResponseLabel = t('login.error_incomplete_response', { defaultValue: 'Server returned incomplete login response.' });
  const networkErrorLabel = t('login.error_network_request', { defaultValue: 'Network error. Check your connection and try again.' });

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
      const data = await readJsonSafe(res);
      if (!data) {
        setError(invalidResponseLabel);
        return;
      }
      if (!res.ok) { setError(data.error || requestFailedLabel); return; }
      if (!data.token || !data.user) {
        setError(incompleteResponseLabel);
        return;
      }

      localStorage.setItem('tvpk_token', data.token);
      localStorage.setItem('tvpk_user', JSON.stringify(data.user));
      window.dispatchEvent(new CustomEvent('tvpk-auth-change', { detail: data.user }));
      window.location.href = '/';
    } catch {
      setError(networkErrorLabel);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_8%_10%,_#e2e8f0_0,_transparent_18%),radial-gradient(circle_at_92%_92%,_#dbeafe_0,_transparent_22%),linear-gradient(180deg,_#f8fafc_0%,_#eef2f7_100%)] flex items-start justify-center p-3.5 sm:p-6 pt-6 sm:pt-10 pb-12">
      <div className="w-full max-w-md mx-auto bg-white rounded-3xl shadow-[0_22px_60px_-40px_rgba(15,23,42,0.3)] border-2 border-slate-300 p-6 sm:p-8 mt-4 sm:mt-8 animate-in fade-in slide-in-from-top-3 duration-200">

        {/* Title */}
        <div className="text-center mb-6">
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 uppercase tracking-tight flex items-center justify-center gap-2">
            <span>{mode === 'login' ? t('login.title_login', 'LOGIN') : t('login.title_signup', 'SIGN UP')}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-2 font-semibold">
            {mode === 'login' 
              ? (i18n.language === 'ta' ? 'கணக்கில் உள்நுழையவும்' : 'Sign in to your account')
              : (i18n.language === 'ta' ? 'புதிய கணக்கை உருவாக்கவும்' : 'Create a new account')
            }
          </p>
        </div>

        {/* Google sign-in */}
        <div className="mb-6">
          <Auth />
        </div>

        {/* Divider */}
        <div className="relative flex py-3 items-center">
          <div className="flex-grow border-t border-slate-300"></div>
          <span className="flex-shrink mx-4 text-xs text-slate-400 font-extrabold uppercase tracking-widest">
            {t('login.or_email', 'Or')}
          </span>
          <div className="flex-grow border-t border-slate-300"></div>
        </div>

        {/* Email/Password form */}
        <form onSubmit={submit} className="space-y-4">
          {mode === 'signup' && (
            <input
              value={name} onChange={e => setName(e.target.value)} required
              placeholder={t('login.placeholder_name', 'Full Name')}
              className="w-full px-3.5 sm:px-4 py-3 rounded-xl border-2 border-slate-300 bg-white hover:border-slate-400 focus:border-red-600 focus:ring-4 focus:ring-red-500/10 transition-all duration-200 outline-none text-slate-800 font-semibold text-xs sm:text-sm placeholder-slate-400"
            />
          )}

          <input
            type="email" value={email} onChange={e => setEmail(e.target.value)} required
            placeholder={t('login.placeholder_email', 'Email')}
            className="w-full px-3.5 sm:px-4 py-3 rounded-xl border-2 border-slate-300 bg-white hover:border-slate-400 focus:border-red-600 focus:ring-4 focus:ring-red-500/10 transition-all duration-200 outline-none text-slate-800 font-semibold text-xs sm:text-sm placeholder-slate-400"
          />

          <input
            type="password" value={password} onChange={e => setPassword(e.target.value)} required
            placeholder={t('login.placeholder_password', 'Password')}
            className="w-full px-3.5 sm:px-4 py-3 rounded-xl border-2 border-slate-300 bg-white hover:border-slate-400 focus:border-red-600 focus:ring-4 focus:ring-red-500/10 transition-all duration-200 outline-none text-slate-800 font-semibold text-xs sm:text-sm placeholder-slate-400"
          />

          {error && (
            <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-3.5 py-2.5 font-semibold leading-relaxed">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-3 pt-1">
            <button type="submit" disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md shadow-red-500/10 cursor-pointer flex items-center justify-center gap-2 text-xs sm:text-sm">
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>{loadingLabel}</span>
                </>
              ) : (
                <span>{mode === 'login' ? t('login.btn_login', 'Login') : t('login.btn_signup', 'Sign Up')}</span>
              )}
            </button>
            <button type="button" onClick={() => { setMode(m => m === 'login' ? 'signup' : 'login'); setError(''); }}
              className="w-full border-2 border-slate-300 hover:bg-slate-50 px-6 py-3 rounded-xl font-bold transition-all text-xs sm:text-sm text-slate-700 cursor-pointer text-center">
              {mode === 'login' ? t('login.btn_switch_to_signup', 'Go to Sign Up') : t('login.btn_switch_to_login', 'Go to Login')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
