import { useQuery } from '@tanstack/react-query';
import { healthAPI, baselineAPI } from '../../services/api';
import { TelemetryChart } from '../../components/TelemetryChart';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { DateRangeSelector } from '../../components/DateRangeSelector';
import { useState, useMemo } from 'react';
import { BarChart3 } from 'lucide-react';

export function AnalyticsPage() {
  const [dateRange, setDateRange] = useState('7d');

  const getDateFrom = () => {
    const now = new Date();
    switch (dateRange) {
      case '24h': return new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
      case '7d': return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      case '30d': return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
      default: return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    }
  };

  const { data: vitals, isLoading } = useQuery({
    queryKey: ['health-history', dateRange],
    queryFn: () => healthAPI.getHistory({ from: getDateFrom(), limit: 200 }).then(r => r.data.readings),
  });

  const { data: baseline } = useQuery({
    queryKey: ['baseline'],
    queryFn: () => baselineAPI.get().then(r => r.data.baseline),
  });

  const chartData = useMemo(() => {
    const reversed = [...(vitals || [])].reverse();
    return {
      hr: reversed.map(v => ({ timestamp: v.timestamp, value: v.heartRate })),
      spo2: reversed.map(v => ({ timestamp: v.timestamp, value: v.spo2 })),
      temp: reversed.map(v => ({ timestamp: v.timestamp, value: v.bodyTemperature })),
      hydration: reversed.map(v => ({ timestamp: v.timestamp, value: v.hydration })),
      sleep: reversed.map(v => ({ timestamp: v.timestamp, value: (v.sleepMinutes || 480) / 60 })),
      activity: reversed.map(v => ({ timestamp: v.timestamp, value: v.steps || 8000 })),
    };
  }, [vitals]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Analytics</h2>
          <p className="text-slate-500">Detailed health metrics and trends</p>
        </div>
        <DateRangeSelector value={dateRange} onChange={setDateRange} />
      </div>

      {isLoading ? (
        <LoadingSkeleton lines={8} />
      ) : vitals && vitals.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <TelemetryChart data={chartData.hr} title="Heart Rate" unit="bpm" color="#ef4444" baseline={baseline?.avgHeartRate} />
          <TelemetryChart data={chartData.spo2} title="SpO2" unit="%" color="#3b82f6" baseline={baseline?.avgSpo2} />
          <TelemetryChart data={chartData.temp} title="Temperature" unit="°C" color="#f59e0b" baseline={baseline?.avgTemperature} />
          <TelemetryChart data={chartData.hydration} title="Hydration" unit="%" color="#0d9488" baseline={baseline?.avgHydration} />
          <TelemetryChart data={chartData.sleep} title="Sleep" unit="hrs" color="#8b5cf6" baseline={baseline?.avgSleep} />
          <TelemetryChart data={chartData.activity} title="Activity" unit="steps" color="#22c55e" baseline={baseline?.avgActivity} />
        </div>
      ) : (
        <div className="text-center py-12">
          <BarChart3 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No Analytics Data</h3>
          <p className="text-slate-500">Start tracking your health to see analytics</p>
        </div>
      )}
    </div>
  );
}
