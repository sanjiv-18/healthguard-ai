import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: number | string;
  unit: string;
  trend?: 'up' | 'down' | 'stable';
  color?: string;
  icon?: React.ReactNode;
}

export function MetricCard({ title, value, unit, trend, color = 'teal', icon }: MetricCardProps) {
  const colorClasses: Record<string, string> = {
    teal: 'bg-teal-50 border-teal-200 text-teal-700',
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    green: 'bg-green-50 border-green-200 text-green-700',
    amber: 'bg-amber-50 border-amber-200 text-amber-700',
    red: 'bg-red-50 border-red-200 text-red-700',
    purple: 'bg-purple-50 border-purple-200 text-purple-700',
  };

  const trendIcon = trend === 'up' ? <TrendingUp className="w-4 h-4 text-green-500" /> :
    trend === 'down' ? <TrendingDown className="w-4 h-4 text-red-500" /> :
    <Minus className="w-4 h-4 text-slate-400" />;

  return (
    <div className={`rounded-xl border p-4 ${colorClasses[color] || colorClasses.teal}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium opacity-75">{title}</span>
        {icon || trendIcon}
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold">{value}</span>
        <span className="text-sm opacity-75">{unit}</span>
      </div>
    </div>
  );
}
