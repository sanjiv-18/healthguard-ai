import { useQuery } from '@tanstack/react-query';
import { doctorAPI } from '../../services/api';
import { AlertCard } from '../../components/AlertCard';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { EmptyState } from '../../components/EmptyState';
import { Bell } from 'lucide-react';

export function DoctorAlertsPage() {

  // In a real app, this would fetch alerts from all shared patients
  // For now, we'll use the dashboard endpoint
  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['doctor-dashboard'],
    queryFn: () => doctorAPI.getDashboard().then(r => r.data),
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Patient Alerts</h2>
        <p className="text-slate-500">Alerts from patients who have shared data with you</p>
      </div>

      {isLoading ? (
        <LoadingSkeleton lines={4} />
      ) : dashboard?.patients && dashboard.patients.length > 0 ? (
        <div className="space-y-3">
          {dashboard.patients.map((alert: any) => (
            <AlertCard key={alert.id} alert={alert} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Bell className="w-8 h-8 text-slate-400" />}
          title="No Alerts"
          message="No alerts from your shared patients at this time."
        />
      )}
    </div>
  );
}
