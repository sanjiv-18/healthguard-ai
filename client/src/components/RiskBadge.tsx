interface RiskBadgeProps {
  level: string;
  size?: 'sm' | 'md' | 'lg';
}

export function RiskBadge({ level, size = 'md' }: RiskBadgeProps) {
  const levelConfig: Record<string, { bg: string; text: string; label: string }> = {
    LOW: { bg: 'bg-green-100', text: 'text-green-800', label: 'Low Risk' },
    MODERATE: { bg: 'bg-amber-100', text: 'text-amber-800', label: 'Moderate Risk' },
    HIGH: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'High Risk' },
    CRITICAL: { bg: 'bg-red-100', text: 'text-red-800', label: 'Critical Risk' },
  };

  const config = levelConfig[level] || levelConfig.LOW;
  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5' : size === 'lg' ? 'text-base px-4 py-1.5' : 'text-sm px-3 py-1';

  return (
    <span className={`inline-flex items-center font-semibold rounded-full ${config.bg} ${config.text} ${sizeClasses}`}>
      {level === 'CRITICAL' && <span className="w-2 h-2 rounded-full bg-red-500 mr-1.5 animate-pulse" />}
      {config.label}
    </span>
  );
}
