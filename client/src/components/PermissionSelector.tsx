const AVAILABLE_SCOPES = [
  { id: 'currentVitals', label: 'Current Vitals', description: 'Real-time vital signs' },
  { id: 'healthTrends', label: 'Health Trends', description: 'Historical health data patterns' },
  { id: 'aiRisk', label: 'AI Risk Assessment', description: 'AI-generated risk analysis' },
  { id: 'environment', label: 'Environmental Data', description: 'Temperature, humidity, AQI' },
  { id: 'alerts', label: 'Health Alerts', description: 'Active and historical alerts' },
  { id: 'healthHistory', label: 'Detailed Health History', description: 'Complete health record' },
  { id: 'emergencyEvents', label: 'Emergency Events', description: 'SOS and fall detection events' },
];

interface PermissionSelectorProps {
  selected: string[];
  onChange: (scopes: string[]) => void;
}

export function PermissionSelector({ selected, onChange }: PermissionSelectorProps) {
  const toggleScope = (scopeId: string) => {
    if (selected.includes(scopeId)) {
      onChange(selected.filter((s) => s !== scopeId));
    } else {
      onChange([...selected, scopeId]);
    }
  };

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-semibold text-slate-700 mb-3">Select data to share:</h4>
      {AVAILABLE_SCOPES.map((scope) => (
        <label
          key={scope.id}
          className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
            selected.includes(scope.id)
              ? 'bg-teal-50 border-teal-300'
              : 'bg-white border-slate-200 hover:bg-slate-50'
          }`}
        >
          <input
            type="checkbox"
            checked={selected.includes(scope.id)}
            onChange={() => toggleScope(scope.id)}
            className="mt-0.5 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
          />
          <div>
            <p className="text-sm font-medium text-slate-900">{scope.label}</p>
            <p className="text-xs text-slate-500">{scope.description}</p>
          </div>
        </label>
      ))}
    </div>
  );
}
