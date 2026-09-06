import { useAuth } from '../../hooks/useAuth';
import { User, Mail, Building2, Award, LogOut } from 'lucide-react';

export function DoctorProfilePage() {
  const { user, logout } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Profile</h2>
        <p className="text-slate-500">Your professional information</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-2xl font-bold text-blue-700">
              {user?.name?.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">{user?.name}</h3>
            <p className="text-slate-500">{user?.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={user?.name || ''}
                disabled
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-500"
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
            <label className="block text-sm font-medium text-slate-700 mb-1">Specialty</label>
            <div className="relative">
              <Award className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={user?.specialty || 'General Practice'}
                disabled
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">License Number</label>
            <div className="relative">
              <Award className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={user?.licenseNumber || 'N/A'}
                disabled
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-500"
              />
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Hospital</label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={user?.hospital || 'N/A'}
                disabled
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-500"
              />
            </div>
          </div>
        </div>
      </div>

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
