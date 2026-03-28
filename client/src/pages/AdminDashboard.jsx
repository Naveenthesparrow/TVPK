import React from 'react';
import { Link } from 'react-router-dom';
import { Users, FileText, Settings } from 'lucide-react';
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

  if (!authChecked) return <div className="p-8">Checking access...</div>;
  if (!authorized) return <div className="p-8">Access denied</div>;

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black">Admin Dashboard</h1>
          <p className="text-sm text-slate-500">Manage applicants, content and users.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card to="/admin" icon={Users} title="Member Applications" desc="View and manage member applications, approve/reject and upload certificates." />
          <Card to="/admin/content" icon={FileText} title="Site Content" desc="Edit site content and announcements (content editor)." />
          <Card to="/admin/users" icon={Settings} title="Users & Roles" desc="Manage users and their roles (promote to admin)." />
        </div>
      </div>
    </div>
  );
}
