import { useAuth } from '../../hooks/useAuth';
import { useState } from 'react';
import { User, Mail, Calendar, Ruler, Weight, LogOut } from 'lucide-react';

export function ProfilePage() {
  const { user, logout } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    dob: user?.dob || '',
    gender: user?.gender || '',
    height: user?.height?.toString() || '',
    weight: user?.weight?.toString() || '',
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Profile</h2>
        <p className="text-slate-500">Manage your account settings</p>
      </div>

      {/* Profile Info */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-slate-900">Personal Information</h3>
          <button
            onClick={() => setEditing(!editing)}
            className="text-sm text-teal-600 hover:text-teal-700 font-medium"
          >
            {editing ? 'Cancel' : 'Edit'}
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  disabled={!editing}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none disabled:bg-slate-50 disabled:text-slate-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date of Birth</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="date"
                  value={form.dob}
                  onChange={(e) => setForm({ ...form, dob: e.target.value })}
                  disabled={!editing}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none disabled:bg-slate-50 disabled:text-slate-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Gender</label>
              <select
                value={form.gender}
                onChange={(e) => setForm({ ...form, gender: e.target.value })}
                disabled={!editing}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none disabled:bg-slate-50 disabled:text-slate-500"
              >
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Height (cm)</label>
              <div className="relative">
                <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="number"
                  value={form.height}
                  onChange={(e) => setForm({ ...form, height: e.target.value })}
                  disabled={!editing}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none disabled:bg-slate-50 disabled:text-slate-500"
                  placeholder="170"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Weight (kg)</label>
              <div className="relative">
                <Weight className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="number"
                  value={form.weight}
                  onChange={(e) => setForm({ ...form, weight: e.target.value })}
                  disabled={!editing}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none disabled:bg-slate-50 disabled:text-slate-500"
                  placeholder="70"
                />
              </div>
            </div>
          </div>

          {editing && (
            <button className="px-6 py-2.5 rounded-xl bg-teal-600 text-white hover:bg-teal-700 font-medium transition-colors">
              Save Changes
            </button>
          )}
        </div>
      </div>

      {/* Emergency Contacts */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Emergency Contacts</h3>
        <p className="text-slate-500 text-sm mb-4">Add emergency contacts who will be notified during SOS events</p>
        <button className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-medium transition-colors">
          Add Contact
        </button>
      </div>

      {/* Security */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Security</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Current Password</label>
            <input
              type="password"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
            <input
              type="password"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none"
              placeholder="••••••••"
            />
          </div>
          <button className="px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-sm font-medium transition-colors">
            Update Password
          </button>
        </div>
      </div>

      {/* Logout */}
      <button
        onClick={logout}
        className="flex items-center gap-2 px-4 py-3 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 font-medium transition-colors"
      >
        <LogOut className="w-5 h-5" />
        Sign Out
      </button>
    </div>
  );
}
