import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Users, FileText, Settings } from 'lucide-react';
import { isAdmin } from '../utils/adminHelpers';

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
  const { t, i18n } = useTranslation();
  if (!isAdmin()) return <div className="p-8">Access denied</div>;
  const currentLang = (i18n.resolvedLanguage || i18n.language || 'en').split('-')[0];
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
