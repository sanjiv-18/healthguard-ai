import { useQuery } from '@tanstack/react-query';
import { environmentAPI } from '../../services/api';
import { TelemetryChart } from '../../components/TelemetryChart';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { AlertTriangle, Thermometer, Droplets, Wind, Sun, Gauge } from 'lucide-react';
import { useMemo } from 'react';

export function EnvironmentPage() {
  const { data: current, isLoading } = useQuery({
    queryKey: ['environment-current'],
    queryFn: () => environmentAPI.getCurrent().then(r => r.data.reading),
  });

  const { data: history } = useQuery({
    queryKey: ['environment-history'],
    queryFn: () => environmentAPI.getHistory({ limit: 50 }).then(r => r.data.readings),
  });

  const tempData = useMemo(() =>
    (history || []).map(r => ({ timestamp: r.timestamp, value: r.temperature })).reverse(),
    [history]
  );
  const humidityData = useMemo(() =>
    (history || []).map(r => ({ timestamp: r.timestamp, value: r.humidity })).reverse(),
    [history]
  );
  const aqiData = useMemo(() =>
    (history || []).map(r => ({ timestamp: r.timestamp, value: r.aqi })).reverse(),
    [history]
  );

  const getAqiColor = (aqi: number) => {
    if (aqi <= 50) return { bg: 'bg-green-100', text: 'text-green-700', label: 'Good' };
    if (aqi <= 100) return { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Moderate' };
    if (aqi <= 150) return { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Unhealthy for Sensitive' };
    if (aqi <= 200) return { bg: 'bg-red-100', text: 'text-red-700', label: 'Unhealthy' };
    return { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Very Unhealthy' };
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Environment</h2>
        <p className="text-slate-500">Environmental conditions affecting your health</p>
      </div>

      {/* Simulated Data Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600" />
        <span className="text-sm text-amber-700 font-medium">SIMULATED DATA - For demonstration purposes only</span>
      </div>

      {isLoading ? (
        <LoadingSkeleton lines={4} />
      ) : current ? (
        <>
          {/* Current Readings */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
              <Thermometer className="w-6 h-6 text-amber-500 mx-auto mb-2" />
              <p className="text-xs text-slate-500 mb-1">Temperature</p>
              <p className="text-2xl font-bold text-slate-900">{current.temperature}°C</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
              <Droplets className="w-6 h-6 text-blue-500 mx-auto mb-2" />
              <p className="text-xs text-slate-500 mb-1">Humidity</p>
              <p className="text-2xl font-bold text-slate-900">{current.humidity}%</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
              <Wind className="w-6 h-6 text-teal-500 mx-auto mb-2" />
              <p className="text-xs text-slate-500 mb-1">AQI</p>
              <p className="text-2xl font-bold text-slate-900">{current.aqi}</p>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getAqiColor(current.aqi).bg} ${getAqiColor(current.aqi).text}`}>
                {getAqiColor(current.aqi).label}
              </span>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
              <Sun className="w-6 h-6 text-orange-500 mx-auto mb-2" />
              <p className="text-xs text-slate-500 mb-1">UV Index</p>
              <p className="text-2xl font-bold text-slate-900">{current.uvIndex}</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
              <Gauge className="w-6 h-6 text-red-500 mx-auto mb-2" />
              <p className="text-xs text-slate-500 mb-1">Heat Index</p>
              <p className="text-2xl font-bold text-slate-900">{current.heatIndex}°C</p>
            </div>
          </div>

          {/* AQI Gauge */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Air Quality Index</h3>
            <div className="relative h-8 rounded-full overflow-hidden bg-gradient-to-r from-green-400 via-yellow-400 via-orange-400 via-red-400 to-purple-500">
              <div
                className="absolute top-0 w-4 h-8 bg-white border-2 border-slate-900 rounded-full transform -translate-x-1/2"
                style={{ left: `${Math.min(100, (current.aqi / 300) * 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-slate-500 mt-2">
              <span>0</span>
              <span>50</span>
              <span>100</span>
              <span>150</span>
              <span>200</span>
              <span>300</span>
            </div>
          </div>

          {/* Environmental Impact */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Environmental Impact</h3>
            <div className="space-y-3">
              {current.heatIndex > 30 && (
                <div className="p-3 bg-amber-50 rounded-xl text-sm text-amber-700">
                  High heat index detected. Stay hydrated and avoid prolonged outdoor exposure.
                </div>
              )}
              {current.aqi > 100 && (
                <div className="p-3 bg-orange-50 rounded-xl text-sm text-orange-700">
                  Poor air quality. Consider limiting outdoor activities and wearing a mask.
                </div>
              )}
              {current.uvIndex > 6 && (
                <div className="p-3 bg-red-50 rounded-xl text-sm text-red-700">
                  High UV index. Use sunscreen and protective clothing when outdoors.
                </div>
              )}
              {current.heatIndex <= 30 && current.aqi <= 100 && current.uvIndex <= 6 && (
                <div className="p-3 bg-green-50 rounded-xl text-sm text-green-700">
                  Environmental conditions are favorable for outdoor activities.
                </div>
              )}
            </div>
          </div>

          {/* Historical Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <TelemetryChart data={tempData} title="Temperature" unit="°C" color="#f59e0b" />
            <TelemetryChart data={humidityData} title="Humidity" unit="%" color="#3b82f6" />
            <TelemetryChart data={aqiData} title="AQI" unit="" color="#8b5cf6" />
          </div>
        </>
      ) : (
        <p className="text-slate-500 text-center py-8">No environmental data available</p>
      )}
    </div>
  );
}
