import type { User } from '../types';
import { RiskBadge } from './RiskBadge';
import { ChevronRight } from 'lucide-react';

interface PatientCardProps {
  patient: User & { riskLevel?: string; latestVitals?: any; accessExpiresAt?: string };
  onClick?: () => void;
}

export function PatientCard({ patient, onClick }: PatientCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center">
            <span className="text-teal-700 font-semibold">
              {patient.name.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900">{patient.name}</h4>
            <p className="text-sm text-slate-500">{patient.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {patient.riskLevel && <RiskBadge level={patient.riskLevel} size="sm" />}
          <ChevronRight className="w-5 h-5 text-slate-400" />
        </div>
      </div>
      {patient.latestVitals && (
        <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
          <div className="text-center">
            <p className="text-slate-500">HR</p>
            <p className="font-medium">{patient.latestVitals.heartRate} bpm</p>
          </div>
          <div className="text-center">
            <p className="text-slate-500">SpO2</p>
            <p className="font-medium">{patient.latestVitals.spo2}%</p>
          </div>
          <div className="text-center">
            <p className="text-slate-500">Temp</p>
            <p className="font-medium">{patient.latestVitals.bodyTemperature}°C</p>
          </div>
        </div>
      )}
    </div>
  );
}
