import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { doctorAPI } from '../../services/api';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { EmptyState } from '../../components/EmptyState';
import { FileText, Plus, X } from 'lucide-react';
import { useState } from 'react';

export function DoctorNotesPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ patientId: '', observation: '', assessment: '', followUp: '' });

  const { data: patients, isLoading: patientsLoading } = useQuery({
    queryKey: ['doctor-patients'],
    queryFn: () => doctorAPI.getPatients().then(r => r.data.patients),
  });

  const createNoteMutation = useMutation({
    mutationFn: () => doctorAPI.createNote(form.patientId, {
      observation: form.observation,
      assessment: form.assessment,
      followUp: form.followUp || undefined,
    }),
    onSuccess: () => {
      setShowForm(false);
      setForm({ patientId: '', observation: '', assessment: '', followUp: '' });
      queryClient.invalidateQueries({ queryKey: ['doctor-patients'] });
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Clinical Notes</h2>
          <p className="text-slate-500">Manage clinical notes for your patients</p>
        </div>
        {patients && patients.length > 0 && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 text-white hover:bg-teal-700 text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Note
          </button>
        )}
      </div>

      {/* New Note Form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">New Clinical Note</h3>
            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Patient</label>
              <select
                value={form.patientId}
                onChange={(e) => setForm({ ...form, patientId: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none"
              >
                <option value="">Select a patient</option>
                {patients?.map((p: any) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Observation</label>
              <textarea
                value={form.observation}
                onChange={(e) => setForm({ ...form, observation: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none text-sm"
                rows={3}
                placeholder="Clinical observations..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Assessment</label>
              <textarea
                value={form.assessment}
                onChange={(e) => setForm({ ...form, assessment: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none text-sm"
                rows={2}
                placeholder="Clinical assessment..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Follow-up</label>
              <textarea
                value={form.followUp}
                onChange={(e) => setForm({ ...form, followUp: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none text-sm"
                rows={2}
                placeholder="Follow-up recommendations..."
              />
            </div>
            <button
              onClick={() => createNoteMutation.mutate()}
              disabled={!form.patientId || !form.observation || !form.assessment || createNoteMutation.isPending}
              className="px-4 py-2 rounded-xl bg-teal-600 text-white hover:bg-teal-700 text-sm font-medium transition-colors disabled:opacity-50"
            >
              {createNoteMutation.isPending ? 'Saving...' : 'Save Note'}
            </button>
          </div>
        </div>
      )}

      {/* Notes List */}
      {patientsLoading ? (
        <LoadingSkeleton lines={3} />
      ) : patients && patients.length > 0 ? (
        <div className="space-y-3">
          {patients.map((patient: any) => (
            <div key={patient.id} className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center">
                  <span className="text-teal-700 font-semibold text-sm">
                    {patient.name?.split(' ').map((n: string) => n[0]).join('')}
                  </span>
                </div>
                <h4 className="font-semibold text-slate-900">{patient.name}</h4>
              </div>
              {patient.notes && patient.notes.length > 0 ? (
                <div className="space-y-2 ml-11">
                  {patient.notes.slice(0, 2).map((note: any) => (
                    <div key={note.id} className="p-3 bg-slate-50 rounded-lg text-sm">
                      <p className="text-slate-700"><strong>Obs:</strong> {note.observation}</p>
                      <p className="text-slate-700"><strong>Assessment:</strong> {note.assessment}</p>
                      <p className="text-xs text-slate-400 mt-1">{new Date(note.createdAt).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 ml-11">No notes yet</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<FileText className="w-8 h-8 text-slate-400" />}
          title="No Clinical Notes"
          message="Create clinical notes for patients who have shared their data with you."
        />
      )}
    </div>
  );
}
