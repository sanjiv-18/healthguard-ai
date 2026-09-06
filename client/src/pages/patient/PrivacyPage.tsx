import { useQuery } from '@tanstack/react-query';
import { privacyAPI } from '../../services/api';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { UserCheck, CheckCircle } from 'lucide-react';

export function PrivacyPage() {
  const { data: sharing, isLoading: sharingLoading } = useQuery({
    queryKey: ['privacy-sharing'],
    queryFn: () => privacyAPI.getSharing().then(r => r.data.sharing),
  });

  const { data: accessLog, isLoading: logLoading } = useQuery({
    queryKey: ['privacy-access-log'],
    queryFn: () => privacyAPI.getAccessLog().then(r => r.data.logs),
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Privacy & Security</h2>
        <p className="text-slate-500">Control your data and privacy settings</p>
      </div>

      {/* My Data Protection */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">My Data</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3 p-4 bg-green-50 rounded-xl">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-green-800">Health Data Protected</h4>
              <p className="text-xs text-green-600">Your vital signs and health records are encrypted at rest and in transit</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 bg-green-50 rounded-xl">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-green-800">AI Analysis Protected</h4>
              <p className="text-xs text-green-600">Risk assessments are stored securely and never shared without consent</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 bg-green-50 rounded-xl">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-green-800">Doctor Access User Controlled</h4>
              <p className="text-xs text-green-600">You decide who sees your data and can revoke access anytime</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 bg-green-50 rounded-xl">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-green-800">Location Permission Controlled</h4>
              <p className="text-xs text-green-600">Location data is only used for emergency services and environmental monitoring</p>
            </div>
          </div>
        </div>
      </div>

      {/* Data Sharing */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Data Sharing</h3>
        {sharingLoading ? (
          <LoadingSkeleton lines={2} />
        ) : sharing && sharing.length > 0 ? (
          <div className="space-y-3">
            {sharing.map((access) => (
              <div key={access.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <UserCheck className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{access.doctor?.name || 'Doctor'}</p>
                    <p className="text-xs text-slate-500">{access.scopes.length} permissions shared</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    access.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {access.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-500 text-sm">No data sharing configured</p>
        )}
      </div>

      {/* Access History */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Access History</h3>
        {logLoading ? (
          <LoadingSkeleton lines={3} />
        ) : accessLog && accessLog.length > 0 ? (
          <div className="space-y-2">
            {accessLog.slice(0, 10).map(log => (
              <div key={log.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl text-sm">
                <div>
                  <span className="font-medium text-slate-900">{log.action}</span>
                  {log.details && <span className="text-slate-500 ml-2">- {log.details}</span>}
                </div>
                <span className="text-xs text-slate-400">{new Date(log.timestamp).toLocaleString()}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-500 text-sm">No access events recorded</p>
        )}
      </div>
    </div>
  );
}
