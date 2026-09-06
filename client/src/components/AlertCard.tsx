import { AlertTriangle, CheckCircle, XCircle, Clock } from 'lucide-react';
import type { Alert } from '../types';

interface AlertCardProps {
  alert: Alert;
  onAcknowledge?: (id: string) => void;
  onResolve?: (id: string) => void;
}

export function AlertCard({ alert, onAcknowledge, onResolve }: AlertCardProps) {
  const levelConfig: Record<string, { bg: string; border: string; icon: React.ReactNode }> = {
    LOW: { bg: 'bg-blue-50', border: 'border-blue-200', icon: <Clock className="w-5 h-5 text-blue-500" /> },
    MODERATE: { bg: 'bg-amber-50', border: 'border-amber-200', icon: <AlertTriangle className="w-5 h-5 text-amber-500" /> },
    HIGH: { bg: 'bg-orange-50', border: 'border-orange-200', icon: <AlertTriangle className="w-5 h-5 text-orange-500" /> },
    CRITICAL: { bg: 'bg-red-50', border: 'border-red-200', icon: <XCircle className="w-5 h-5 text-red-500" /> },
  };

  const config = levelConfig[alert.level] || levelConfig.LOW;

  return (
    <div className={`rounded-xl border p-4 ${config.bg} ${config.border}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          {config.icon}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-slate-900">{alert.title}</h4>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{alert.category}</span>
            </div>
            <p className="text-sm text-slate-600">{alert.message}</p>
            {alert.factors && alert.factors.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {alert.factors.map((f, i) => (
                  <span key={i} className="text-xs px-2 py-0.5 rounded bg-slate-200 text-slate-700">{f}</span>
                ))}
              </div>
            )}
            <p className="text-xs text-slate-400 mt-2">{new Date(alert.timestamp).toLocaleString()}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {alert.status === 'active' && onAcknowledge && (
            <button
              onClick={() => onAcknowledge(alert.id)}
              className="text-xs px-3 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 transition-colors"
            >
              Acknowledge
            </button>
          )}
          {(alert.status === 'active' || alert.status === 'acknowledged') && onResolve && (
            <button
              onClick={() => onResolve(alert.id)}
              className="text-xs px-3 py-1.5 rounded-lg bg-green-100 hover:bg-green-200 text-green-700 transition-colors"
            >
              <CheckCircle className="w-4 h-4 inline mr-1" />
              Resolve
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
