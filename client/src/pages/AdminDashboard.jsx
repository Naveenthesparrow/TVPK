import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Users, Settings } from 'lucide-react';
import { isAdmin } from '../utils/adminHelpers';

const API =
  (import.meta.env.VITE_API_URL || '').replace(/\/$/, '') ||
  (import.meta.env.DEV ? 'http://localhost:5000' : '');

const Card = ({ to, icon: Icon, title, desc }) => (
  <Link to={to} className="block p-6 bg-white rounded-2xl shadow hover:shadow-2xl transition">
    <div className="flex items-start gap-4">
      <div className="w-12 h-12 bg-primary/5 rounded-lg flex items-center justify-center"><Icon className="text-primary" /></div>
      <div>
        <div className="font-black text-lg">{title}</div>
        <div className="text-sm text-slate-500">{desc}</div>
      </div>
    </div>
  </Link>
);

export default function AdminDashboard() {
  const { i18n } = useTranslation();
  const currentLang = (i18n.resolvedLanguage || i18n.language || 'en').split('-')[0];
  const [authChecked, setAuthChecked] = React.useState(false);
  const [authorized, setAuthorized] = React.useState(isAdmin());

  React.useEffect(() => {
    const verifyAdmin = async () => {
      const token = localStorage.getItem('tvpk_token');
      if (!token) {
        setAuthorized(false);
        setAuthChecked(true);
        return;
      }

      try {
        const res = await fetch(`${API}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          localStorage.removeItem('tvpk_token');
          localStorage.removeItem('tvpk_user');
          window.dispatchEvent(new CustomEvent('tvpk-auth-change', { detail: null }));
          setAuthorized(false);
          setAuthChecked(true);
          return;
        }

        const { user } = await res.json();
        localStorage.setItem('tvpk_user', JSON.stringify(user));
        window.dispatchEvent(new CustomEvent('tvpk-auth-change', { detail: user }));
        setAuthorized(user?.role === 'admin');
      } catch {
        setAuthorized(isAdmin());
      } finally {
        setAuthChecked(true);
      }
    };

    verifyAdmin();
  }, []);

  if (!authChecked) return <div className={`p-8 ${currentLang === 'ta' ? 'font-tamil' : ''}`}>{currentLang === 'ta' ? 'அணுகல் சரிபார்க்கப்படுகிறது...' : 'Checking access...'}</div>;
  if (!authorized) return <div className={`p-8 ${currentLang === 'ta' ? 'font-tamil' : ''}`}>{currentLang === 'ta' ? 'அணுகல் மறுக்கப்பட்டது' : 'Access denied'}</div>;

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className={`text-3xl font-black ${currentLang === 'ta' ? 'font-tamil' : ''}`}>{currentLang === 'ta' ? 'நிர்வாக பலகை' : 'Admin Dashboard'}</h1>
          <p className={`text-sm text-slate-500 ${currentLang === 'ta' ? 'font-tamil' : ''}`}>{currentLang === 'ta' ? 'விண்ணப்பதாரர்கள், உள்ளடக்கம் மற்றும் பயனர்களை நிர்வகிக்கவும்.' : 'Manage applicants, content and users.'}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card to="/admin" icon={Users} title={currentLang === 'ta' ? 'உறுப்பினர் விண்ணப்பங்கள்' : 'Member Applications'} desc={currentLang === 'ta' ? 'உறுப்பினர் விண்ணப்பங்களைப் பார்க்கவும், ஒப்புதல்/மறுப்பு செய்யவும், சான்றிதழ்களைப் பதிவேற்றவும்.' : 'View and manage member applications, approve/reject and upload certificates.'} />
          <Card to="/admin/users" icon={Settings} title={currentLang === 'ta' ? 'பயனர்கள் & பாத்திரங்கள்' : 'Users & Roles'} desc={currentLang === 'ta' ? 'பயனர்களையும் அவர்களின் பாத்திரங்களையும் நிர்வகிக்கவும் (நிர்வாகியாக உயர்த்தவும்).' : 'Manage users and their roles (promote to admin).'} />
        </div>
      </div>
    </div>
  );
}
