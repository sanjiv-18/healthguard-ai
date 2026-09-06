import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { accessAPI } from '../../services/api';
import { DoctorAccessCard } from '../../components/DoctorAccessCard';
import { PermissionSelector } from '../../components/PermissionSelector';
import { ConfirmationModal } from '../../components/ConfirmationModal';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { EmptyState } from '../../components/EmptyState';
import { UserCheck, Share2, X, Shield } from 'lucide-react';
import { useState } from 'react';

export function DoctorAccessPage() {
  const queryClient = useQueryClient();
  const [showShareModal, setShowShareModal] = useState(false);
  const [doctorEmail, setDoctorEmail] = useState('');
  const [selectedScopes, setSelectedScopes] = useState<string[]>(['currentVitals']);
  const [duration, setDuration] = useState('7d');
  const [revokeId, setRevokeId] = useState<string | null>(null);

  const { data: accessList, isLoading } = useQuery({
    queryKey: ['access-list'],
    queryFn: () => accessAPI.listAccess().then(r => r.data.accesses),
  });

  const { data: auditLog } = useQuery({
    queryKey: ['access-audit'],
    queryFn: () => accessAPI.getAuditLog().then(r => r.data.logs),
  });

  const grantMutation = useMutation({
    mutationFn: () => {
      const durationMap: Record<string, number> = { '24h': 1, '7d': 7, '30d': 30, 'forever': 365 };
      return accessAPI.grantDoctor({
        doctorEmail,
        scopes: selectedScopes,
        expiresInDays: durationMap[duration] || 7,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['access-list'] });
      queryClient.invalidateQueries({ queryKey: ['access-audit'] });
      setShowShareModal(false);
      setDoctorEmail('');
      setSelectedScopes(['currentVitals']);
      setDuration('7d');
    },
  });

  const revokeMutation = useMutation({
    mutationFn: (id: string) => accessAPI.revokeAccess(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['access-list'] });
      queryClient.invalidateQueries({ queryKey: ['access-audit'] });
      setRevokeId(null);
    },
  });

  const activeAccess = (accessList || []).filter(a => a.status === 'ACTIVE');
  const otherAccess = (accessList || []).filter(a => a.status !== 'ACTIVE');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Doctor Access</h2>
          <p className="text-slate-500">Control who can access your health data</p>
        </div>
        <button
          onClick={() => setShowShareModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 text-white hover:bg-teal-700 text-sm font-medium transition-colors"
        >
          <Share2 className="w-4 h-4" />
          Share with Doctor
        </button>
      </div>

      {/* Active Access */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-3">Active Doctors</h3>
        {isLoading ? (
          <LoadingSkeleton lines={2} />
        ) : activeAccess.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeAccess.map(access => (
              <DoctorAccessCard
                key={access.id}
                access={access}
                onRevoke={(id) => setRevokeId(id)}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<UserCheck className="w-8 h-8 text-slate-400" />}
            title="No Doctor Access"
            message="Share your health data with a doctor to get started."
            action={
              <button
                onClick={() => setShowShareModal(true)}
                className="px-4 py-2 rounded-xl bg-teal-600 text-white hover:bg-teal-700 text-sm font-medium transition-colors"
              >
                Share Data
              </button>
            }
          />
        )}
      </div>

      {/* Other Access */}
      {otherAccess.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-3">Access History</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {otherAccess.map(access => (
              <DoctorAccessCard key={access.id} access={access} />
            ))}
          </div>
        </div>
      )}

      {/* Audit Log */}
      {auditLog && auditLog.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Access Audit Log</h3>
          <div className="space-y-2">
            {auditLog.slice(0, 10).map(log => (
              <div key={log.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl text-sm">
                <div>
                  <span className="font-medium text-slate-900">{log.action}</span>
                  {log.details && <span className="text-slate-500 ml-2">- {log.details}</span>}
                </div>
                <span className="text-xs text-slate-400">{new Date(log.timestamp).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-teal-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Share with Doctor</h3>
              </div>
              <button onClick={() => setShowShareModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Doctor's Email</label>
                <input
                  type="email"
                  value={doctorEmail}
                  onChange={(e) => setDoctorEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none"
                  placeholder="doctor@hospital.com"
                />
              </div>

              <PermissionSelector selected={selectedScopes} onChange={setSelectedScopes} />

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Duration</label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none"
                >
                  <option value="24h">24 Hours</option>
                  <option value="7d">7 Days</option>
                  <option value="30d">30 Days</option>
                  <option value="forever">Until Revoked</option>
                </select>
              </div>

              <div className="bg-teal-50 rounded-xl p-4">
                <p className="text-sm text-teal-700">
                  <Shield className="w-4 h-4 inline mr-1" />
                  You control this access and can revoke it at any time.
                </p>
              </div>

              <button
                onClick={() => grantMutation.mutate()}
                disabled={!doctorEmail || selectedScopes.length === 0 || grantMutation.isPending}
                className="w-full py-3 rounded-xl bg-teal-600 text-white font-semibold hover:bg-teal-700 transition-colors disabled:opacity-50"
              >
                {grantMutation.isPending ? 'Sharing...' : 'Share Securely'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Revoke Confirmation */}
      <ConfirmationModal
        isOpen={!!revokeId}
        title="Revoke Access"
        message="Are you sure you want to revoke this doctor's access? They will no longer be able to view your shared health data."
        confirmLabel="Revoke Access"
        variant="danger"
        onConfirm={() => revokeId && revokeMutation.mutate(revokeId)}
        onCancel={() => setRevokeId(null)}
        loading={revokeMutation.isPending}
      />
    </div>
  );
}
