import { useState, useEffect } from 'react';

interface FallDetectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOk: () => void;
  onSos: () => void;
}

export function FallDetectionModal({ isOpen, onClose, onOk, onSos }: FallDetectionModalProps) {
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    if (!isOpen) {
      setCountdown(10);
      return;
    }
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onSos();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, onSos]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl text-center">
        <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
          <span className="text-4xl font-bold text-amber-600">{countdown}</span>
        </div>
        <h3 className="text-2xl font-bold text-slate-900 mb-2">Fall Detected</h3>
        <p className="text-slate-600 mb-6">
          A fall has been detected. Are you okay? Emergency services will be contacted in {countdown} seconds if no action is taken.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onOk}
            className="flex-1 px-4 py-3 rounded-xl bg-green-600 text-white hover:bg-green-700 font-bold text-lg transition-colors"
          >
            I'M OK
          </button>
          <button
            onClick={onSos}
            className="flex-1 px-4 py-3 rounded-xl bg-red-600 text-white hover:bg-red-700 font-bold text-lg transition-colors"
          >
            SEND SOS NOW
          </button>
        </div>
        <button
          onClick={onClose}
          className="mt-4 text-sm text-slate-500 hover:text-slate-700"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
