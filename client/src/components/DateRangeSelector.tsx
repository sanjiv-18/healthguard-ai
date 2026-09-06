import { Calendar } from 'lucide-react';

interface DateRangeSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function DateRangeSelector({ value, onChange }: DateRangeSelectorProps) {
  const options = [
    { value: '24h', label: '24 Hours' },
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: 'custom', label: 'Custom' },
  ];

  return (
    <div className="flex items-center gap-2">
      <Calendar className="w-4 h-4 text-slate-500" />
      <div className="flex bg-slate-100 rounded-lg p-0.5">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              value === opt.value
                ? 'bg-white text-slate-900 shadow-sm font-medium'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
