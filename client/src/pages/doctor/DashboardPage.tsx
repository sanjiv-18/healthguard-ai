import { useQuery } from '@tanstack/react-query';
import { doctorAPI } from '../../services/api';
import { RiskBadge } from '../../components/RiskBadge';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { Users, AlertTriangle, Siren, TrendingUp, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function DoctorDashboardPage() {
  const navigate = useNavigate();

  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['doctor-dashboard'],
    queryFn: () => doctorAPI.getDashboard().then(r => r.data),
  });

  const stats = dashboard?.stats;
  const patients = dashboard?.patients || [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Doctor Dashboard</h2>
        <p className="text-slate-500">Overview of your patients' health</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats?.totalPatients || 0}</p>
              <p className="text-xs text-slate-500">Shared Patients</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats?.highRiskPatients || 0}</p>
              <p className="text-xs text-slate-500">High-Risk Patients</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats?.totalActiveAlerts || 0}</p>
              <p className="text-xs text-slate-500">Active Alerts</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
              <Siren className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats?.criticalPatients || 0}</p>
              <p className="text-xs text-slate-500">Critical Patients</p>
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <LoadingSkeleton lines={4} />
      ) : (
        <>
          {/* High-Risk Patients */}
          {patients.filter((p: any) => p.latestRisk?.level === 'HIGH' || p.latestRisk?.level === 'CRITICAL').length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">High-Risk Patients</h3>
              <div className="space-y-3">
                {patients.filter((p: any) => p.latestRisk?.level === 'HIGH' || p.latestRisk?.level === 'CRITICAL').map((p: any) => (
                  <div
                    key={p.patient.id}
                    onClick={() => navigate(`/doctor/patients/${p.patient.id}`)}
                    className="flex items-center justify-between p-3 bg-red-50 rounded-xl cursor-pointer hover:bg-red-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                        <span className="text-red-700 font-semibold text-sm">
                          {p.patient.name?.split(' ').map((n: string) => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900">{p.patient.name}</h4>
                        <p className="text-sm text-slate-500">{p.patient.email}</p>
                        {p.latestRisk && (
                          <div className="flex items-center gap-2 mt-1">
                            <RiskBadge level={p.latestRisk.level} size="sm" />
                            <span className="text-xs text-slate-500">Score: {p.latestRisk.overallRisk}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All Patients */}
          {patients.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">All Shared Patients</h3>
              <div className="space-y-3">
                {patients.map((p: any) => (
                  <div
                    key={p.patient.id}
                    onClick={() => navigate(`/doctor/patients/${p.patient.id}`)}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center">
                        <span className="text-teal-700 font-semibold text-sm">
                          {p.patient.name?.split(' ').map((n: string) => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900">{p.patient.name}</h4>
                        <p className="text-sm text-slate-500">{p.patient.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {p.latestRisk && <RiskBadge level={p.latestRisk.level} size="sm" />}
                          <span className="text-xs text-slate-500">{p.scopes.length} permissions</span>
                          <span className="text-xs text-slate-400">
                            Expires: {new Date(p.accessExpiresAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {patients.length === 0 && (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
              <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No Patients Yet</h3>
              <p className="text-slate-500">Patients will appear here when they share their health data with you</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
