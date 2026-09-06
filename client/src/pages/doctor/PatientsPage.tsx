import { useQuery } from '@tanstack/react-query';
import { doctorAPI } from '../../services/api';
import { PatientCard } from '../../components/PatientCard';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { EmptyState } from '../../components/EmptyState';
import { Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function DoctorPatientsPage() {
  const navigate = useNavigate();

  const { data: patients, isLoading } = useQuery({
    queryKey: ['doctor-patients'],
    queryFn: () => doctorAPI.getPatients().then(r => r.data.patients),
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">My Patients</h2>
        <p className="text-slate-500">Patients who have shared their health data with you</p>
      </div>

      {isLoading ? (
        <LoadingSkeleton lines={4} />
      ) : patients && patients.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {patients.map((patient: any) => (
            <PatientCard
              key={patient.id}
              patient={{
                ...patient,
                riskLevel: patient.riskLevel,
                latestVitals: patient.latestVitals,
              }}
              onClick={() => navigate(`/doctor/patients/${patient.id}`)}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Users className="w-8 h-8 text-slate-400" />}
          title="No Patients"
          message="Patients will appear here when they share their health data with you."
        />
      )}
    </div>
  );
}
