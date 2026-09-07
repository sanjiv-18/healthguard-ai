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
    (vitals || []).map(v => ({ timestamp: v.timestamp, value: v.bodyTemperature })).reverse(),
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

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard title="Heart Rate" value={current ? Math.round(current.heartRate) : '--'} unit="bpm" color="red" icon={<Heart className="w-4 h-4" />} />
        <MetricCard title="Blood Oxygen" value={current ? Math.round(current.spo2) : '--'} unit="%" color="blue" icon={<Wind className="w-4 h-4" />} />
        <MetricCard title="Body Temperature" value={current ? current.bodyTemperature.toFixed(1) : '--'} unit="°C" color="amber" icon={<Thermometer className="w-4 h-4" />} />
        <MetricCard title="Hydration Estimate" value={current ? Math.round(current.hydration) : '--'} unit="%" color="teal" icon={<Droplets className="w-4 h-4" />} />
      </div>

      {isLoading ? (
        <LoadingSkeleton lines={6} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <TelemetryChart data={hrData} title="Heart Rate" unit="bpm" color="#ef4444" baseline={baseline?.heartRateMin && baseline?.heartRateMax ? (baseline.heartRateMin + baseline.heartRateMax) / 2 : undefined} />
          <TelemetryChart data={spo2Data} title="Blood Oxygen" unit="%" color="#3b82f6" baseline={baseline?.spo2Min} />
          <TelemetryChart data={tempData} title="Body Temperature" unit="°C" color="#f59e0b" baseline={baseline?.temperatureMin && baseline?.temperatureMax ? (baseline.temperatureMin + baseline.temperatureMax) / 2 : undefined} />
          <TelemetryChart data={hydrationData} title="Hydration Estimate" unit="%" color="#0d9488" baseline={baseline?.hydrationMin && baseline?.hydrationMax ? (baseline.hydrationMin + baseline.hydrationMax) / 2 : undefined} />
        </div>
      )}

      {baseline && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Personal Baseline</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-2 text-slate-500 font-medium">Metric</th>
                  <th className="text-left py-2 text-slate-500 font-medium">Baseline Range</th>
                  <th className="text-left py-2 text-slate-500 font-medium">Current</th>
                  <th className="text-left py-2 text-slate-500 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-100">
                  <td className="py-2 text-slate-700">Heart Rate</td>
                  <td className="py-2 text-slate-700">{baseline.heartRateMin}-{baseline.heartRateMax} bpm</td>
                  <td className="py-2 text-slate-700">{current ? Math.round(current.heartRate) : '--'} bpm</td>
                  <td className="py-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      current && current.heartRate >= baseline.heartRateMin && current.heartRate <= baseline.heartRateMax ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {current && current.heartRate >= baseline.heartRateMin && current.heartRate <= baseline.heartRateMax ? 'Normal' : 'Outside Range'}
                    </span>
                  </td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-2 text-slate-700">Blood Oxygen</td>
                  <td className="py-2 text-slate-700">&ge;{baseline.spo2Min}%</td>
                  <td className="py-2 text-slate-700">{current ? Math.round(current.spo2) : '--'}%</td>
                  <td className="py-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      current && current.spo2 >= baseline.spo2Min ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {current && current.spo2 >= baseline.spo2Min ? 'Normal' : 'Low'}
                    </span>
                  </td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-2 text-slate-700">Body Temperature</td>
                  <td className="py-2 text-slate-700">{baseline.temperatureMin}-{baseline.temperatureMax}°C</td>
                  <td className="py-2 text-slate-700">{current ? current.bodyTemperature.toFixed(1) : '--'}°C</td>
                  <td className="py-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      current && current.bodyTemperature >= baseline.temperatureMin && current.bodyTemperature <= baseline.temperatureMax ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {current && current.bodyTemperature >= baseline.temperatureMin && current.bodyTemperature <= baseline.temperatureMax ? 'Normal' : 'Outside Range'}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="py-2 text-slate-700">Hydration</td>
                  <td className="py-2 text-slate-700">{baseline.hydrationMin}-{baseline.hydrationMax}%</td>
                  <td className="py-2 text-slate-700">{current ? Math.round(current.hydration) : '--'}%</td>
                  <td className="py-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      current && current.hydration >= baseline.hydrationMin ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {current && current.hydration >= baseline.hydrationMin ? 'Good' : 'Low'}
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
