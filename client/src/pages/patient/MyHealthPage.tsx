import { useQuery } from '@tanstack/react-query';
import { healthAPI, baselineAPI } from '../../services/api';
import { TelemetryChart } from '../../components/TelemetryChart';
import { MetricCard } from '../../components/MetricCard';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { DateRangeSelector } from '../../components/DateRangeSelector';
import { useState, useMemo } from 'react';
import { Heart, Thermometer, Droplets, Wind } from 'lucide-react';

export function MyHealthPage() {
  const [dateRange, setDateRange] = useState('24h');

  const getDateFrom = () => {
    const now = new Date();
    switch (dateRange) {
      case '24h': return new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
      case '7d': return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      case '30d': return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
      default: return new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
    }
  };

  const { data: vitals, isLoading } = useQuery({
    queryKey: ['health-history', dateRange],
    queryFn: () => healthAPI.getHistory({ from: getDateFrom(), limit: 100 }).then(r => r.data.readings),
  });

  const { data: baseline } = useQuery({
    queryKey: ['baseline'],
    queryFn: () => baselineAPI.get().then(r => r.data.baseline),
  });

  const { data: current } = useQuery({
    queryKey: ['health-current'],
    queryFn: () => healthAPI.getCurrent().then(r => r.data.reading),
  });

  const hrData = useMemo(() =>
    (vitals || []).map(v => ({ timestamp: v.timestamp, value: v.heartRate })).reverse(),
    [vitals]
  );
  const spo2Data = useMemo(() =>
    (vitals || []).map(v => ({ timestamp: v.timestamp, value: v.spo2 })).reverse(),
    [vitals]
  );
  const tempData = useMemo(() =>
    (vitals || []).map(v => ({ timestamp: v.timestamp, value: v.temperature })).reverse(),
    [vitals]
  );
  const hydrationData = useMemo(() =>
    (vitals || []).map(v => ({ timestamp: v.timestamp, value: v.hydration })).reverse(),
    [vitals]
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">My Health</h2>
          <p className="text-slate-500">Monitor your vital signs and health trends</p>
        </div>
        <DateRangeSelector value={dateRange} onChange={setDateRange} />
      </div>

      {/* Current Vitals */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard title="Heart Rate" value={current?.heartRate || '--'} unit="bpm" color="red" icon={<Heart className="w-4 h-4" />} />
        <MetricCard title="SpO2" value={current?.spo2 || '--'} unit="%" color="blue" icon={<Wind className="w-4 h-4" />} />
        <MetricCard title="Temperature" value={current?.temperature || '--'} unit="°C" color="amber" icon={<Thermometer className="w-4 h-4" />} />
        <MetricCard title="Hydration" value={current?.hydration || '--'} unit="%" color="teal" icon={<Droplets className="w-4 h-4" />} />
      </div>

      {/* Charts */}
      {isLoading ? (
        <LoadingSkeleton lines={6} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <TelemetryChart data={hrData} title="Heart Rate" unit="bpm" color="#ef4444" baseline={baseline?.avgHeartRate} />
          <TelemetryChart data={spo2Data} title="SpO2" unit="%" color="#3b82f6" baseline={baseline?.avgSpo2} />
          <TelemetryChart data={tempData} title="Temperature" unit="°C" color="#f59e0b" baseline={baseline?.avgTemperature} />
          <TelemetryChart data={hydrationData} title="Hydration" unit="%" color="#0d9488" baseline={baseline?.avgHydration} />
        </div>
      )}

      {/* Baseline Comparison */}
      {baseline && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Personal Baseline</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-2 text-slate-500 font-medium">Metric</th>
                  <th className="text-left py-2 text-slate-500 font-medium">Baseline</th>
                  <th className="text-left py-2 text-slate-500 font-medium">Current</th>
                  <th className="text-left py-2 text-slate-500 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-100">
                  <td className="py-2 text-slate-700">Heart Rate</td>
                  <td className="py-2 text-slate-700">{baseline.avgHeartRate} bpm</td>
                  <td className="py-2 text-slate-700">{current?.heartRate || '--'} bpm</td>
                  <td className="py-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      current && Math.abs(current.heartRate - baseline.avgHeartRate) < 10 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {current && Math.abs(current.heartRate - baseline.avgHeartRate) < 10 ? 'Normal' : 'Elevated'}
                    </span>
                  </td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-2 text-slate-700">SpO2</td>
                  <td className="py-2 text-slate-700">{baseline.avgSpo2}%</td>
                  <td className="py-2 text-slate-700">{current?.spo2 || '--'}%</td>
                  <td className="py-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      current && current.spo2 >= 95 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {current && current.spo2 >= 95 ? 'Normal' : 'Low'}
                    </span>
                  </td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-2 text-slate-700">Temperature</td>
                  <td className="py-2 text-slate-700">{baseline.avgTemperature}°C</td>
                  <td className="py-2 text-slate-700">{current?.temperature || '--'}°C</td>
                  <td className="py-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      current && current.temperature >= 36.1 && current.temperature <= 37.2 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {current && current.temperature >= 36.1 && current.temperature <= 37.2 ? 'Normal' : 'Elevated'}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="py-2 text-slate-700">Hydration</td>
                  <td className="py-2 text-slate-700">{baseline.avgHydration}%</td>
                  <td className="py-2 text-slate-700">{current?.hydration || '--'}%</td>
                  <td className="py-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      current && current.hydration >= 60 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {current && current.hydration >= 60 ? 'Good' : 'Low'}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
