import { X, AlertTriangle } from 'lucide-react';

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
}

export function EmergencyModal({ isOpen, onClose, onConfirm, loading }: EmergencyModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Emergency SOS</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-slate-600 mb-6">
          This will send an emergency alert to your designated emergency contacts and share your location and health data.
          Are you sure you want to proceed?
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 px-4 py-3 rounded-xl bg-red-600 text-white hover:bg-red-700 font-medium transition-colors disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Send SOS'}
          </button>
        </div>
      </div>
    </div>
  );
}
