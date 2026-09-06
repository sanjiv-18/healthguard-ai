import { useQuery } from '@tanstack/react-query';
import { doctorAPI } from '../../services/api';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { EmptyState } from '../../components/EmptyState';
import { Siren } from 'lucide-react';

export function DoctorEmergencyPage() {
  const { isLoading } = useQuery({
    queryKey: ['doctor-dashboard'],
    queryFn: () => doctorAPI.getDashboard().then(r => r.data),
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Emergency Events</h2>
        <p className="text-slate-500">Emergency events from patients who have shared data with you</p>
      </div>

      {isLoading ? (
        <LoadingSkeleton lines={3} />
      ) : (
        <EmptyState
          icon={<Siren className="w-8 h-8 text-slate-400" />}
          title="No Emergency Events"
          message="Emergency events from patients with emergency scope shared will appear here."
        />
      )}
    </div>
  );
}
