import { useQuery } from '@tanstack/react-query';
import { healthAPI } from '../../services/api';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { EmptyState } from '../../components/EmptyState';
import { useState } from 'react';
import { History, Search } from 'lucide-react';

export function HealthHistoryPage() {
  const [search, setSearch] = useState('');
  const limit = 20;

  const { data, isLoading } = useQuery({
    queryKey: ['health-history'],
    queryFn: () => healthAPI.getHistory({ limit, from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() }).then(r => r.data.readings),
  });

  const filtered = (data || []).filter(r =>
    search === '' ||
    r.timestamp.includes(search) ||
    r.source.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Health History</h2>
        <p className="text-slate-500">View your historical vital readings</p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none text-sm"
          placeholder="Search by date or source..."
        />
      </div>

      {isLoading ? (
        <LoadingSkeleton lines={8} />
      ) : filtered.length > 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Date & Time</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">HR (bpm)</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">SpO2 (%)</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Temp (°C)</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Hydration (%)</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Source</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((reading, i) => (
                  <tr key={reading.id || i} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-700">{new Date(reading.timestamp).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`font-medium ${reading.heartRate > 100 ? 'text-red-600' : 'text-slate-900'}`}>
                        {reading.heartRate}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-medium ${reading.spo2 < 95 ? 'text-amber-600' : 'text-slate-900'}`}>
                        {reading.spo2}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-medium ${reading.bodyTemperature > 37.5 ? 'text-amber-600' : 'text-slate-900'}`}>
                        {reading.bodyTemperature}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-medium ${reading.hydration < 60 ? 'text-amber-600' : 'text-slate-900'}`}>
                        {reading.hydration}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{reading.source}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState
          icon={<History className="w-8 h-8 text-slate-400" />}
          title="No Health Records"
          message="Your health readings will appear here once you start tracking."
        />
      )}
    </div>
  );
}
