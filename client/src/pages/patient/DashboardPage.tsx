import { useQuery } from '@tanstack/react-query';
import { healthAPI, aiAPI, alertsAPI, environmentAPI } from '../../services/api';
import { MetricCard } from '../../components/MetricCard';
import { RiskBadge } from '../../components/RiskBadge';
import { AlertCard } from '../../components/AlertCard';
import { HealthScoreGauge } from '../../components/HealthScoreGauge';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { Heart, Thermometer, Droplets, Moon, Activity, Wind, CloudSun, AlertTriangle, Play, Share2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';


export function DashboardPage() {
  const navigate = useNavigate();

  const { data: vitals, isLoading: vitalsLoading } = useQuery({
    queryKey: ['health-current'],
    queryFn: () => healthAPI.getCurrent().then(r => r.data.reading),
    refetchInterval: 30000,
  });

  const { data: risk, isLoading: riskLoading } = useQuery({
    queryKey: ['ai-risk'],
    queryFn: () => aiAPI.getRisk().then(r => r.data.risk),
    refetchInterval: 60000,
  });

  const { data: alerts } = useQuery({
    queryKey: ['alerts'],
    queryFn: () => alertsAPI.getAll().then(r => r.data.alerts),
  });

  const { data: environment } = useQuery({
    queryKey: ['environment-current'],
    queryFn: () => environmentAPI.getCurrent().then(r => r.data.reading),
  });

  const healthScore = risk ? Math.round((1 - risk.overallRisk) * 100) : 75;
  const activeAlerts = alerts?.filter(a => a.status === 'active') || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Welcome Back</h2>
          <p className="text-slate-500">Here's your health overview</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/patient/simulation')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-sm font-medium transition-colors"
          >
            <Play className="w-4 h-4" />
            Run Simulation
          </button>
          <button
            onClick={() => navigate('/patient/access')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-medium transition-colors"
          >
            <Share2 className="w-4 h-4" />
            Share with Doctor
          </button>
        </div>
      </div>

      {/* Health Score + Risk */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200 p-6 flex flex-col items-center justify-center">
          {riskLoading ? (
            <LoadingSkeleton lines={2} className="w-full" />
          ) : (
            <>
              <HealthScoreGauge score={healthScore} size={180} />
              {risk && (
                <div className="mt-4">
                  <RiskBadge level={risk.level} size="lg" />
                </div>
              )}
            </>
          )}
        </div>

        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-semibold text-slate-900">Current Vitals</h3>
          {vitalsLoading ? (
            <LoadingSkeleton lines={4} />
          ) : vitals ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <MetricCard title="Heart Rate" value={vitals.heartRate} unit="bpm" color="red" icon={<Heart className="w-4 h-4" />} />
              <MetricCard title="SpO2" value={vitals.spo2} unit="%" color="blue" icon={<Wind className="w-4 h-4" />} />
              <MetricCard title="Temperature" value={vitals.temperature} unit="°C" color="amber" icon={<Thermometer className="w-4 h-4" />} />
              <MetricCard title="Hydration" value={vitals.hydration} unit="%" color="teal" icon={<Droplets className="w-4 h-4" />} />
              <MetricCard title="Sleep" value={vitals.sleep || 7} unit="hrs" color="purple" icon={<Moon className="w-4 h-4" />} />
              <MetricCard title="Activity" value={vitals.activity || 8500} unit="steps" color="green" icon={<Activity className="w-4 h-4" />} />
            </div>
          ) : (
            <p className="text-slate-500 text-sm">No vital data available. Run a simulation to generate data.</p>
          )}
        </div>
      </div>

      {/* Environment + Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Environment */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <CloudSun className="w-5 h-5 text-amber-500" />
            Environment
          </h3>
          {environment ? (
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 bg-slate-50 rounded-xl">
                <p className="text-xs text-slate-500">AQI</p>
                <p className="text-xl font-bold text-slate-900">{environment.aqi}</p>
                <p className={`text-xs font-medium ${environment.aqi <= 50 ? 'text-green-600' : environment.aqi <= 100 ? 'text-amber-600' : 'text-red-600'}`}>
                  {environment.aqi <= 50 ? 'Good' : environment.aqi <= 100 ? 'Moderate' : 'Unhealthy'}
                </p>
              </div>
              <div className="text-center p-3 bg-slate-50 rounded-xl">
                <p className="text-xs text-slate-500">Heat Index</p>
                <p className="text-xl font-bold text-slate-900">{environment.heatIndex}°</p>
              </div>
              <div className="text-center p-3 bg-slate-50 rounded-xl">
                <p className="text-xs text-slate-500">Temperature</p>
                <p className="text-xl font-bold text-slate-900">{environment.temperature}°C</p>
              </div>
            </div>
          ) : (
            <p className="text-slate-500 text-sm">No environmental data</p>
          )}
          <p className="text-xs text-amber-600 mt-3 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            SIMULATED DATA - For demonstration purposes
          </p>
        </div>

        {/* AI Summary */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">AI Health Summary</h3>
          {risk ? (
            <div>
              <p className="text-sm text-slate-600 mb-3">{risk.explanation}</p>
              {risk.recommendations.length > 0 && (
                <div className="space-y-2">
                  {risk.recommendations.slice(0, 3).map((rec: string, i: number) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center flex-shrink-0 text-xs font-bold">
                        {i + 1}
                      </span>
                      <span className="text-slate-600">{rec}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <p className="text-slate-500 text-sm">No AI analysis available</p>
          )}
        </div>
      </div>

      {/* Recent Alerts */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900">Recent Alerts</h3>
          <button onClick={() => navigate('/patient/alerts')} className="text-sm text-teal-600 hover:text-teal-700 font-medium">
            View All
          </button>
        </div>
        {activeAlerts.length > 0 ? (
          <div className="space-y-3">
            {activeAlerts.slice(0, 3).map(alert => (
              <AlertCard key={alert.id} alert={alert} />
            ))}
          </div>
        ) : (
          <p className="text-slate-500 text-sm">No active alerts</p>
        )}
      </div>
    </div>
  );
}
