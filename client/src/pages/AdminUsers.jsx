import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import MemberCard from '../components/MemberCard';

const API =
  (import.meta.env.VITE_API_URL || '').replace(/\/$/, '') ||
  (import.meta.env.DEV ? 'http://localhost:5000' : '');

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('tvpk_user')) || null;
  } catch {
    return null;
  }
}

export default function AdminUsers() {
  const [authChecked, setAuthChecked] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [error, setError] = useState('');
  const [savingId, setSavingId] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);
  const [leaderPhoto, setLeaderPhoto] = useState(null);

  const token = localStorage.getItem('tvpk_token');

  const verifyAdmin = useCallback(async () => {
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
      setAuthChecked(true);
    } catch {
      const cached = getStoredUser();
      setAuthorized(cached?.role === 'admin');
      setAuthChecked(true);
    }
  }, [token]);

  const loadUsers = useCallback(async () => {
    if (!token) return;
    setLoadingUsers(true);
    setError('');
    try {
      const res = await fetch(`${API}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || `Failed to load users (HTTP ${res.status})`);
        setUsers([]);
        return;
      }
      setUsers(Array.isArray(data.users) ? data.users : []);
    } catch {
      setError('Network error while loading users');
    } finally {
      setLoadingUsers(false);
    }
  }, [token]);

  useEffect(() => {
    verifyAdmin();
  }, [verifyAdmin]);

  useEffect(() => {
    if (authChecked && authorized) loadUsers();
  }, [authChecked, authorized, loadUsers]);

  const updateRole = async (userId, nextRole) => {
    if (!token) return;
    setSavingId(userId);
    setError('');
    try {
      const res = await fetch(`${API}/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: nextRole }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'Failed to update role');
        return;
      }

      setUsers((prev) => prev.map((u) => (u._id === userId ? data.user : u)));

      const current = getStoredUser();
      if (current && current.id === data.user._id) {
        localStorage.setItem('tvpk_user', JSON.stringify(data.user));
        window.dispatchEvent(new CustomEvent('tvpk-auth-change', { detail: data.user }));
      }
    } catch {
      setError('Network error while updating role');
    } finally {
      setSavingId('');
    }
  };

  if (!authChecked) {
    return <div className="p-8">Checking access...</div>;
  }

  if (!authorized) {
    return (
      <div className="p-8">
        <div className="text-lg font-semibold mb-2">Access denied</div>
        <Link to="/login" className="text-primary underline">Go to login</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-black">Users & Roles</h1>
            <p className="text-sm text-slate-500">View all accounts and promote users to admin.</p>
          </div>
          <Link to="/admin/dashboard" className="px-4 py-2 rounded bg-white border hover:bg-slate-100 transition">
            Back to Dashboard
          </Link>
        </div>

        {error && <div className="mb-4 p-3 rounded bg-red-50 text-red-700 border border-red-200">{error}</div>}

        <div className="bg-white rounded-2xl shadow overflow-x-auto">
          <table className="w-full min-w-[680px]">
            <thead className="bg-slate-100 text-left">
              <tr>
                <th className="p-3 text-sm font-semibold">Name</th>
                <th className="p-3 text-sm font-semibold">Email</th>
                <th className="p-3 text-sm font-semibold">Role</th>
                <th className="p-3 text-sm font-semibold">Created</th>
                <th className="p-3 text-sm font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {loadingUsers && (
                <tr>
                  <td className="p-4 text-sm text-slate-500" colSpan={5}>Loading users...</td>
                </tr>
              )}
              {!loadingUsers && users.length === 0 && (
                <tr>
                  <td className="p-4 text-sm text-slate-500" colSpan={5}>No users found.</td>
                </tr>
              )}
              {!loadingUsers && users.map((u, index) => {
                const isSelf = getStoredUser()?.id === u._id;
                const nextRole = u.role === 'admin' ? 'user' : 'admin';
                return (
                  <tr key={u._id} className="border-t">
                    <td className="p-3 text-sm font-medium">{u.name || '-'}</td>
                    <td className="p-3 text-sm">{u.email}</td>
                    <td className="p-3 text-sm uppercase tracking-wide">{u.role}</td>
                    <td className="p-3 text-sm">{u.createdAt ? new Date(u.createdAt).toLocaleString() : '-'}</td>
                    <td className="p-3 text-sm">
                      <button
                        disabled={savingId === u._id || (isSelf && u.role === 'admin')}
                        onClick={() => updateRole(u._id, nextRole)}
                        className="px-3 py-1.5 rounded border bg-white hover:bg-slate-50 disabled:opacity-60"
                        title={isSelf && u.role === 'admin' ? 'You cannot demote yourself' : ''}
                      >
                        {savingId === u._id ? 'Saving...' : (u.role === 'admin' ? 'Set as User' : 'Set as Admin')}
                      </button>
                      {u.professionalPhoto && (
                        <button
                          onClick={() => setSelectedMember(u)}
                          className="ml-2 px-3 py-1.5 rounded border bg-blue-50 text-blue-600 hover:bg-blue-100"
                        >
                          View Card
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Member Card Modal */}
      {selectedMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Member ID Card</h2>
              <button
                onClick={() => setSelectedMember(null)}
                className="text-2xl font-bold text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <MemberCard member={selectedMember} leaderPhoto={leaderPhoto} />
          </div>
        </div>
      )}
    </div>
  );
}
