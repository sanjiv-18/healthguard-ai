import { useQuery, useMutation } from '@tanstack/react-query';
import { emergencyAPI } from '../../services/api';
import { EmergencyModal } from '../../components/EmergencyModal';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { Siren, AlertTriangle, Phone } from 'lucide-react';
import { useState } from 'react';

export function EmergencyPage() {
  const [showSosModal, setShowSosModal] = useState(false);
  const [sosLoading, setSosLoading] = useState(false);

  const { data: events, isLoading } = useQuery({
    queryKey: ['emergency-events'],
    queryFn: () => emergencyAPI.getEvents().then(r => r.data.events),
  });

  const sosMutation = useMutation({
    mutationFn: () => emergencyAPI.triggerSOS(),
    onMutate: () => setSosLoading(true),
    onSettled: () => {
      setSosLoading(false);
      setShowSosModal(false);
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Emergency</h2>
        <p className="text-slate-500">Emergency services and alerts</p>
      </div>

      {/* SOS Button */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
        <div className="w-24 h-24 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
          <Siren className="w-12 h-12 text-red-600" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">Emergency SOS</h3>
        <p className="text-slate-500 mb-6 max-w-md mx-auto">
          Press the button below to send an emergency alert to your designated contacts and share your location and health data.
        </p>
        <button
          onClick={() => setShowSosModal(true)}
          className="px-12 py-4 rounded-2xl bg-red-600 text-white text-xl font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-200"
        >
          SEND SOS
        </button>
        <p className="text-xs text-slate-400 mt-4">Contact local emergency services when appropriate</p>
      </div>

      {/* Emergency Info */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-amber-800 mb-1">Important</h4>
            <p className="text-sm text-amber-700">
              HealthGuard AI's emergency features are supplementary tools. Always contact local emergency services (911, 112, etc.) in life-threatening situations.
            </p>
          </div>
        </div>
      </div>

      {/* Emergency Events */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Emergency Events</h3>
        {isLoading ? (
          <LoadingSkeleton lines={3} />
        ) : events && events.length > 0 ? (
          <div className="space-y-3">
            {events.map(event => (
              <div key={event.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    event.type === 'sos' ? 'bg-red-100' : 'bg-amber-100'
                  }`}>
                    <Siren className={`w-4 h-4 ${event.type === 'sos' ? 'text-red-600' : 'text-amber-600'}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900 capitalize">{event.type} Event</p>
                    <p className="text-xs text-slate-500">{new Date(event.timestamp).toLocaleString()}</p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  event.status === 'resolved' ? 'bg-green-100 text-green-700' :
                  event.status === 'responded' ? 'bg-blue-100 text-blue-700' :
                  event.status === 'cancelled' ? 'bg-slate-100 text-slate-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {event.status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-500 text-sm">No emergency events recorded</p>
        )}
      </div>

      {/* Emergency Contacts */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Emergency Contacts</h3>
        <div className="text-center py-4">
          <Phone className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-500">Emergency contacts can be managed in your Profile</p>
        </div>
      </div>

      <EmergencyModal
        isOpen={showSosModal}
        onClose={() => setShowSosModal(false)}
        onConfirm={() => sosMutation.mutate()}
        loading={sosLoading}
      />
    </div>
  );
}
