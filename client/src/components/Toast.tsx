import { X, CheckCircle, AlertTriangle, Info, XCircle } from 'lucide-react';
import type { Toast } from '../hooks/useToast';

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  const icons: Record<string, React.ReactNode> = {
    success: <CheckCircle className="w-5 h-5 text-green-500" />,
    error: <XCircle className="w-5 h-5 text-red-500" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />,
  };

  return (
    <div className="fixed top-4 right-4 z-[100] space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="flex items-center gap-3 bg-white rounded-xl shadow-lg border border-slate-200 p-4 min-w-[300px] animate-in slide-in-from-right"
        >
          {icons[toast.type]}
          <p className="text-sm text-slate-700 flex-1">{toast.message}</p>
          <button onClick={() => onRemove(toast.id)} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
