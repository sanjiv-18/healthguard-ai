import { FlaskConical } from 'lucide-react';

interface SimulationCardProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  onTrigger: () => void;
  loading?: boolean;
  color?: string;
}

export function SimulationCard({ title, description, icon, onTrigger, loading, color = 'teal' }: SimulationCardProps) {
  const colorClasses: Record<string, string> = {
    teal: 'bg-teal-50 border-teal-200 hover:border-teal-400',
    red: 'bg-red-50 border-red-200 hover:border-red-400',
    amber: 'bg-amber-50 border-amber-200 hover:border-amber-400',
    blue: 'bg-blue-50 border-blue-200 hover:border-blue-400',
    purple: 'bg-purple-50 border-purple-200 hover:border-purple-400',
    orange: 'bg-orange-50 border-orange-200 hover:border-orange-400',
    green: 'bg-green-50 border-green-200 hover:border-green-400',
    slate: 'bg-slate-50 border-slate-200 hover:border-slate-400',
  };

  return (
    <div className={`rounded-xl border p-5 transition-all ${colorClasses[color] || colorClasses.teal}`}>
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm">
          {icon || <FlaskConical className="w-5 h-5 text-teal-600" />}
        </div>
        <div>
          <h4 className="font-semibold text-slate-900">{title}</h4>
          <p className="text-sm text-slate-600">{description}</p>
        </div>
      </div>
      <button
        onClick={onTrigger}
        disabled={loading}
        className="w-full mt-2 px-4 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800 text-sm font-medium transition-colors disabled:opacity-50"
      >
        {loading ? 'Running...' : 'Trigger Scenario'}
      </button>
    </div>
  );
}
