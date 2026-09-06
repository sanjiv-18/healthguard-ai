import type { DoctorAccess } from '../types';
import { Shield, Clock, CheckCircle, XCircle } from 'lucide-react';

interface DoctorAccessCardProps {
  access: DoctorAccess;
  onRevoke?: (id: string) => void;
}

export function DoctorAccessCard({ access, onRevoke }: DoctorAccessCardProps) {
  const statusConfig: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
    ACTIVE: { bg: 'bg-green-50', text: 'text-green-700', icon: <CheckCircle className="w-4 h-4" /> },
    PENDING: { bg: 'bg-amber-50', text: 'text-amber-700', icon: <Clock className="w-4 h-4" /> },
    EXPIRED: { bg: 'bg-slate-100', text: 'text-slate-600', icon: <Clock className="w-4 h-4" /> },
    REVOKED: { bg: 'bg-red-50', text: 'text-red-700', icon: <XCircle className="w-4 h-4" /> },
  };

  const config = statusConfig[access.status] || statusConfig.PENDING;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <Shield className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h4 className="font-semibold text-slate-900">{access.doctor?.name || 'Doctor'}</h4>
            <p className="text-sm text-slate-500">{access.doctor?.email}</p>
          </div>
        </div>
        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${config.bg} ${config.text}`}>
          {config.icon}
          {access.status.charAt(0).toUpperCase() + access.status.slice(1)}
        </span>
      </div>
      <div className="mb-3">
        <p className="text-xs text-slate-500 mb-1">Shared Data ({access.scopes.length} permissions)</p>
        <div className="flex flex-wrap gap-1">
          {access.scopes.map((scope) => (
            <span key={scope.id} className="text-xs px-2 py-0.5 rounded bg-teal-50 text-teal-700">
              {scope.permission}
            </span>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>Granted: {new Date(access.grantedAt).toLocaleDateString()}</span>
        {access.expiresAt && <span>Expires: {new Date(access.expiresAt).toLocaleDateString()}</span>}
      </div>
      {access.status === 'ACTIVE' && onRevoke && (
        <button
          onClick={() => onRevoke(access.id)}
          className="mt-3 w-full text-sm px-3 py-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 transition-colors font-medium"
        >
          Revoke Access
        </button>
      )}
    </div>
  );
}
