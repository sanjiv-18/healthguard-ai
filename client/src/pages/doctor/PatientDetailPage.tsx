import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { doctorAPI } from '../../services/api';
import { TelemetryChart } from '../../components/TelemetryChart';
import { RiskBadge } from '../../components/RiskBadge';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { useParams } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { Heart, Wind, Thermometer, Droplets, Shield, Clock, AlertTriangle, FileText } from 'lucide-react';

export function DoctorPatientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [noteForm, setNoteForm] = useState({ observation: '', assessment: '', followUp: '' });

  const { data: patient, isLoading } = useQuery({
    queryKey: ['doctor-patient', id],
    queryFn: () => doctorAPI.getPatient(id!).then(r => r.data.patient),
    enabled: !!id,
  });

  const { data: vitals } = useQuery({
    queryKey: ['doctor-patient-vitals', id],
    queryFn: () => doctorAPI.getPatientVitals(id!).then(r => r.data.vitals),
    enabled: !!id,
  });

  const { data: risk } = useQuery({
    queryKey: ['doctor-patient-risk', id],
    queryFn: () => doctorAPI.getPatientRisk(id!).then(r => r.data.risks[0]),
    enabled: !!id,
  });

  const createNoteMutation = useMutation({
    mutationFn: (data: { observation: string; assessment: string; followUp?: string }) =>
      doctorAPI.createNote(id!, data),
    onSuccess: () => {
      setNoteForm({ observation: '', assessment: '', followUp: '' });
      queryClient.invalidateQueries({ queryKey: ['doctor-patient', id] });
    },
  });

  const hrData = useMemo(() =>
    (vitals || []).map((v: any) => ({ timestamp: v.timestamp, value: v.heartRate })).reverse(),
    [vitals]
  );

  const scopes = patient?.access?.scopes?.map((s: any) => s.permission) || [];
  const hasScope = (scope: string) => scopes.includes(scope);

  if (isLoading) return <LoadingSkeleton lines={6} />;

  if (!patient) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Patient Not Found</h3>
        <p className="text-slate-500">This patient may have revoked access.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Patient Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-teal-100 flex items-center justify-center">
              <span className="text-xl font-bold text-teal-700">
                {(patient.name?.split(' ') || []).map((n: string) => n[0]).join('')}
              </span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">{patient.name}</h2>
              <p className="text-slate-500">{patient.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-xs px-3 py-1 rounded-full bg-green-100 text-green-700 font-medium">
              <Shield className="w-3 h-3" />
              Access granted by patient
            </span>
            {patient.access?.expiresAt && (
              <span className="flex items-center gap-1 text-xs px-3 py-1 rounded-full bg-amber-100 text-amber-700 font-medium">
                <Clock className="w-3 h-3" />
                Expires in {Math.ceil((new Date(patient.access.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days
              </span>
            )}
          </div>
        </div>

        {/* Permission Badges */}
        <div className="mt-4 flex flex-wrap gap-2">
          {scopes.map((scope: string) => (
            <span key={scope} className="text-xs px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 font-medium">
              {scope}
            </span>
          ))}
        </div>
      </div>

      {/* Current Vitals */}
      {hasScope('currentVitals') ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Current Vitals</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {vitals && vitals.length > 0 ? (
              <>
                <div className="text-center p-3 bg-red-50 rounded-xl">
                  <Heart className="w-5 h-5 text-red-500 mx-auto mb-1" />
                  <p className="text-xs text-slate-500">Heart Rate</p>
                  <p className="text-xl font-bold">{vitals[0].heartRate} bpm</p>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-xl">
                  <Wind className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                  <p className="text-xs text-slate-500">SpO2</p>
                  <p className="text-xl font-bold">{vitals[0].spo2}%</p>
                </div>
                <div className="text-center p-3 bg-amber-50 rounded-xl">
                  <Thermometer className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                  <p className="text-xs text-slate-500">Temperature</p>
                  <p className="text-xl font-bold">{vitals[0].bodyTemperature}°C</p>
                </div>
                <div className="text-center p-3 bg-teal-50 rounded-xl">
                  <Droplets className="w-5 h-5 text-teal-500 mx-auto mb-1" />
                  <p className="text-xs text-slate-500">Hydration</p>
                  <p className="text-xl font-bold">{vitals[0].hydration}%</p>
                </div>
              </>
            ) : (
              <p className="col-span-4 text-slate-500 text-sm">No vital data available</p>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-slate-50 rounded-2xl border border-dashed border-slate-300 p-6 text-center">
          <Shield className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-sm text-slate-500">This data has not been shared by the patient</p>
        </div>
      )}

      {/* Health Trends */}
      {hasScope('healthTrends') && hrData.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Health Trends</h3>
          <TelemetryChart data={hrData} title="Heart Rate" unit="bpm" color="#ef4444" />
        </div>
      )}

      {/* AI Risk Assessment */}
      {hasScope('aiRisk') && risk && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <h3 className="text-lg font-semibold text-slate-900">AI Risk Assessment</h3>
            <RiskBadge level={risk.level} />
          </div>
          <p className="text-sm text-slate-600 mb-3">{risk.explanation}</p>
          <div className="grid grid-cols-5 gap-2">
            {[
              { label: 'Heat', value: risk.heatStress },
              { label: 'Dehydration', value: risk.dehydration },
              { label: 'Respiratory', value: risk.respiratory },
              { label: 'Cardiac', value: risk.cardiacStrain },
              { label: 'Fatigue', value: risk.fatigue },
            ].map(f => (
              <div key={f.label} className="text-center">
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-1">
                  <div className={`h-full rounded-full ${f.value > 0.7 ? 'bg-red-500' : f.value > 0.4 ? 'bg-amber-500' : 'bg-green-500'}`} style={{ width: `${f.value * 100}%` }} />
                </div>
                <p className="text-xs text-slate-500">{f.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Clinical Notes */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-slate-500" />
          Clinical Notes
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Observation</label>
            <textarea
              value={noteForm.observation}
              onChange={(e) => setNoteForm({ ...noteForm, observation: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none text-sm"
              rows={3}
              placeholder="Clinical observations..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Assessment</label>
            <textarea
              value={noteForm.assessment}
              onChange={(e) => setNoteForm({ ...noteForm, assessment: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none text-sm"
              rows={2}
              placeholder="Clinical assessment..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Follow-up</label>
            <textarea
              value={noteForm.followUp}
              onChange={(e) => setNoteForm({ ...noteForm, followUp: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none text-sm"
              rows={2}
              placeholder="Follow-up recommendations..."
            />
          </div>
          <button
            onClick={() => createNoteMutation.mutate(noteForm)}
            disabled={!noteForm.observation || !noteForm.assessment || createNoteMutation.isPending}
            className="px-4 py-2 rounded-xl bg-teal-600 text-white hover:bg-teal-700 text-sm font-medium transition-colors disabled:opacity-50"
          >
            {createNoteMutation.isPending ? 'Saving...' : 'Save Note'}
          </button>
        </div>

        {/* Existing Notes */}
        {patient.notes && patient.notes.length > 0 && (
          <div className="mt-6 space-y-3">
            <h4 className="text-sm font-semibold text-slate-700">Previous Notes</h4>
            {patient.notes.map((note: any) => (
              <div key={note.id} className="p-3 bg-slate-50 rounded-xl text-sm">
                <p className="text-slate-700"><strong>Observation:</strong> {note.observation}</p>
                <p className="text-slate-700"><strong>Assessment:</strong> {note.assessment}</p>
                {note.followUp && <p className="text-slate-700"><strong>Follow-up:</strong> {note.followUp}</p>}
                <p className="text-xs text-slate-400 mt-1">{new Date(note.createdAt).toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
