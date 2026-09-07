import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { simulationAPI } from '../../services/api';
import { SimulationCard } from '../../components/SimulationCard';
import { RiskBadge } from '../../components/RiskBadge';
import { AlertCard } from '../../components/AlertCard';
import { FallDetectionModal } from '../../components/FallDetectionModal';
import { EmergencyModal } from '../../components/EmergencyModal';
import { Thermometer, Droplets, Wind, Heart, Moon, Layers, Siren, RotateCcw, CheckCircle, Activity, AlertTriangle, Wifi, WifiOff, Zap } from 'lucide-react';
import { formatSleepDuration, formatSteps } from '../../types';
import type { SimulationResult } from '../../types';

const scenarios = [
  { type: 'normal', title: 'Normal Vitals', description: 'Healthy baseline readings', icon: <CheckCircle className="w-5 h-5 text-green-600" />, color: 'green' },
  { type: 'exercise', title: 'Exercise', description: 'Physical activity simulation', icon: <Activity className="w-5 h-5 text-blue-600" />, color: 'blue' },
  { type: 'heat-stress', title: 'Heat Stress', description: 'High temperature exposure', icon: <Thermometer className="w-5 h-5 text-orange-600" />, color: 'orange' },
  { type: 'heart-rate', title: 'High Heart Rate', description: 'Elevated cardiac activity', icon: <Heart className="w-5 h-5 text-red-600" />, color: 'red' },
  { type: 'low-spo2', title: 'Low SpO2', description: 'Reduced oxygen saturation', icon: <Wind className="w-5 h-5 text-purple-600" />, color: 'purple' },
  { type: 'dehydration', title: 'Dehydration', description: 'Low hydration levels', icon: <Droplets className="w-5 h-5 text-blue-600" />, color: 'blue' },
  { type: 'poor-sleep', title: 'Poor Sleep', description: 'Sleep deprivation scenario', icon: <Moon className="w-5 h-5 text-indigo-600" />, color: 'slate' },
  { type: 'combined-risk', title: 'Combined Risk', description: 'Multiple risk factors', icon: <Layers className="w-5 h-5 text-amber-600" />, color: 'amber' },
  { type: 'fall', title: 'Fall Detection', description: 'Simulate a fall event', icon: <Siren className="w-5 h-5 text-red-600" />, color: 'red' },
  { type: 'device-disconnect', title: 'Device Disconnect', description: 'Simulate device going offline', icon: <WifiOff className="w-5 h-5 text-slate-600" />, color: 'slate' },
  { type: 'device-reconnect', title: 'Device Reconnect', description: 'Resume device telemetry', icon: <Wifi className="w-5 h-5 text-green-600" />, color: 'green' },
  { type: 'reset', title: 'Reset All', description: 'Reset to initial state', icon: <RotateCcw className="w-5 h-5 text-slate-600" />, color: 'slate' },
];

export function SimulationPage() {
  const queryClient = useQueryClient();
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [showFallModal, setShowFallModal] = useState(false);
  const [showSosModal, setShowSosModal] = useState(false);
  const [eventLog, setEventLog] = useState<string[]>([]);

  const { data: simStatus } = useQuery({
    queryKey: ['simulation-status'],
    queryFn: () => simulationAPI.getStatus().then(r => r.data.events),
  });

  const triggerMutation = useMutation({
    mutationFn: (scenarioType: string) => simulationAPI.trigger(scenarioType),
    onSuccess: (data) => {
      setResult(data.data);
      queryClient.invalidateQueries({ queryKey: ['health-current'] });
      queryClient.invalidateQueries({ queryKey: ['health-score'] });
      queryClient.invalidateQueries({ queryKey: ['ai-risk'] });
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      queryClient.invalidateQueries({ queryKey: ['environment-current'] });
      queryClient.invalidateQueries({ queryKey: ['devices'] });

      const timestamp = new Date().toLocaleTimeString();
      setEventLog(prev => [
        `${timestamp} SCENARIO_TRIGGERED: ${data.data.scenario}`,
        ...(data.data.vitalReading ? [`${timestamp} HEALTH_READING_RECEIVED: HR=${data.data.vitalReading.heartRate} bpm`] : []),
        `${timestamp} HEALTH_SCORE_UPDATED: ${data.data.healthScore?.score ?? 'N/A'}`,
        ...(data.data.riskAssessment ? [`${timestamp} AI_RISK_RECALCULATED: ${data.data.riskAssessment.level}`] : []),
        ...(data.data.alert ? [`${timestamp} ALERT_CREATED: ${data.data.alert.level}`] : []),
        `${timestamp} NOTIFICATION_CREATED`,
        ...prev,
      ].slice(0, 20));
    },
  });

  const resetMutation = useMutation({
    mutationFn: () => simulationAPI.reset(),
    onSuccess: (data) => {
      setResult(data.data);
      queryClient.invalidateQueries({ queryKey: ['health-current'] });
      queryClient.invalidateQueries({ queryKey: ['health-score'] });
      queryClient.invalidateQueries({ queryKey: ['ai-risk'] });
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      queryClient.invalidateQueries({ queryKey: ['environment-current'] });
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      setEventLog([]);
    },
  });

  const handleTrigger = (type: string) => {
    if (type === 'fall') {
      setShowFallModal(true);
    }
    triggerMutation.mutate(type);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Simulation Center</h2>
          <p className="text-slate-500">Test HealthGuard's health intelligence with controlled scenarios</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold">
            DEMO / SIMULATION MODE
          </span>
          <button
            onClick={() => resetMutation.mutate()}
            disabled={resetMutation.isPending}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-medium transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {scenarios.map((scenario) => (
          <SimulationCard
            key={scenario.type}
            title={scenario.title}
            description={scenario.description}
            icon={scenario.icon}
            color={scenario.color}
            onTrigger={() => handleTrigger(scenario.type)}
            loading={triggerMutation.isPending}
          />
        ))}
      </div>

      {result && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900">Simulation Results - {result.scenario}</h3>

          {result.message && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700">{result.message}</div>
          )}

          {result.vitalReading && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h4 className="font-semibold text-slate-900 mb-3">Vital Signs</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
              <div className="text-center p-3 bg-red-50 rounded-xl">
                <p className="text-xs text-red-600">Heart Rate</p>
                <p className="text-xl font-bold text-slate-900">{Math.round(result.vitalReading.heartRate)} <span className="text-sm font-normal">bpm</span></p>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-xl">
                <p className="text-xs text-blue-600">Blood Oxygen</p>
                <p className="text-xl font-bold text-slate-900">{Math.round(result.vitalReading.spo2)}%</p>
              </div>
              <div className="text-center p-3 bg-amber-50 rounded-xl">
                <p className="text-xs text-amber-600">Body Temperature</p>
                <p className="text-xl font-bold text-slate-900">{result.vitalReading.bodyTemperature?.toFixed(1) ?? '--'}°C</p>
              </div>
              <div className="text-center p-3 bg-teal-50 rounded-xl">
                <p className="text-xs text-teal-600">Hydration</p>
                <p className="text-xl font-bold text-slate-900">{Math.round(result.vitalReading.hydration)}%</p>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-xl">
                <p className="text-xs text-purple-600">Sleep</p>
                <p className="text-xl font-bold text-slate-900">{formatSleepDuration(result.vitalReading.sleepMinutes || 0)}</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-xl">
                <p className="text-xs text-green-600">Steps</p>
                <p className="text-xl font-bold text-slate-900">{formatSteps(result.vitalReading.steps)}</p>
              </div>
              <div className="text-center p-3 bg-indigo-50 rounded-xl">
                <p className="text-xs text-indigo-600">Stress</p>
                <p className="text-xl font-bold text-slate-900">{Math.round(result.vitalReading.stressPercent || 0)}%</p>
              </div>
              <div className="text-center p-3 bg-cyan-50 rounded-xl">
                <p className="text-xs text-cyan-600">Respiratory Rate</p>
                <p className="text-xl font-bold text-slate-900">{Math.round(result.vitalReading.respiratoryRate || 0)} <span className="text-sm font-normal">/min</span></p>
              </div>
            </div>
          </div>
          )}

          {result.envReading && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h4 className="font-semibold text-slate-900 mb-3">Environmental Conditions</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="text-center p-3 bg-orange-50 rounded-xl">
                  <p className="text-xs text-orange-600">Env Temperature</p>
                  <p className="text-xl font-bold text-slate-900">{result.envReading.environmentalTemperature?.toFixed(1) ?? '--'}°C</p>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-xl">
                  <p className="text-xs text-blue-600">Humidity</p>
                  <p className="text-xl font-bold text-slate-900">{Math.round(result.envReading.humidity)}%</p>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-xl">
                  <p className="text-xs text-purple-600">AQI</p>
                  <p className="text-xl font-bold text-slate-900">{Math.round(result.envReading.aqi)}</p>
                </div>
                <div className="text-center p-3 bg-amber-50 rounded-xl">
                  <p className="text-xs text-amber-600">Heat Index</p>
                  <p className="text-xl font-bold text-slate-900">{result.envReading.heatIndex?.toFixed(1) ?? '--'}°C</p>
                </div>
              </div>
            </div>
          )}

          {result.healthScore && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h4 className="font-semibold text-slate-900 mb-3">Health Score</h4>
              <div className="flex items-center gap-4 mb-3">
                <span className="text-4xl font-bold text-slate-900">{result.healthScore.score}</span>
                <RiskBadge level={result.healthScore.riskLevel} size="lg" />
                <span className="text-sm text-slate-500">Data Quality: {result.healthScore.dataQuality}</span>
              </div>
              {result.healthScore.reasons && Array.isArray(result.healthScore.reasons) && result.healthScore.reasons.length > 0 && (
                <div className="space-y-1">
                  {result.healthScore.reasons.map((reason: string, i: number) => (
                    <p key={i} className="text-sm text-slate-600">- {reason}</p>
                  ))}
                </div>
              )}
            </div>
          )}

          {result.riskAssessment && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <div className="flex items-center gap-3 mb-3">
                <h4 className="font-semibold text-slate-900">AI Risk Assessment</h4>
                <RiskBadge level={result.riskAssessment.level} />
                <span className="text-sm text-slate-500">Score: {result.riskAssessment.overallRisk}</span>
              </div>
              <p className="text-sm text-slate-600 mb-3">{result.riskAssessment.explanation}</p>
              <div className="grid grid-cols-5 gap-2">
                {[
                  { label: 'Heat', value: result.riskAssessment.heatStress },
                  { label: 'Dehydration', value: result.riskAssessment.dehydration },
                  { label: 'Respiratory', value: result.riskAssessment.respiratory },
                  { label: 'Cardiac', value: result.riskAssessment.cardiacStrain },
                  { label: 'Fatigue', value: result.riskAssessment.fatigue },
                ].map(f => (
                  <div key={f.label} className="text-center">
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-1">
                      <div className={`h-full rounded-full ${f.value > 70 ? 'bg-red-500' : f.value > 40 ? 'bg-amber-500' : 'bg-green-500'}`} style={{ width: `${Math.min(f.value, 100)}%` }} />
                    </div>
                    <p className="text-xs text-slate-500">{f.label}</p>
                    <p className="text-xs font-medium text-slate-700">{Math.round(f.value)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.recommendations && Array.isArray(result.recommendations) && result.recommendations.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h4 className="font-semibold text-slate-900 mb-3">Recommendations</h4>
              <div className="space-y-2">
                {result.recommendations.map((rec: any, i: number) => (
                  <div key={i} className={`p-3 rounded-xl text-sm ${
                    rec.priority === 'HIGH' ? 'bg-red-50 text-red-800' :
                    rec.priority === 'MEDIUM' ? 'bg-amber-50 text-amber-800' :
                    'bg-slate-50 text-slate-700'
                  }`}>
                    <span className="font-medium">{rec.title}:</span> {rec.message}
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.alert && (
            <div className="space-y-3">
              <h4 className="font-semibold text-slate-900">Generated Alert</h4>
              <AlertCard alert={{...result.alert, status: result.alert.status?.toLowerCase() || 'active', factors: Array.isArray(result.alert.factors) ? result.alert.factors : []}} />
            </div>
          )}
        </div>
      )}

      {eventLog.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h4 className="font-semibold text-slate-900 mb-3">Simulation Event Log</h4>
          <div className="space-y-1 max-h-60 overflow-y-auto">
            {eventLog.map((event, i) => (
              <p key={i} className="text-xs font-mono text-slate-600 bg-slate-50 p-2 rounded">{event}</p>
            ))}
          </div>
        </div>
      )}

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <div className="flex items-start gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-800">Not a medical diagnosis</p>
            <p className="text-xs text-amber-700 mt-1">This application is for demonstration purposes only. Health scores and risk assessments are generated by an AI engine and should not be used for medical decisions.</p>
          </div>
        </div>
      </div>

      <FallDetectionModal
        isOpen={showFallModal}
        onClose={() => setShowFallModal(false)}
        onOk={() => setShowFallModal(false)}
        onSos={() => {
          setShowFallModal(false);
          setShowSosModal(true);
        }}
      />
      <EmergencyModal
        isOpen={showSosModal}
        onClose={() => setShowSosModal(false)}
        onConfirm={() => {
          setShowSosModal(false);
        }}
      />
    </div>
  );
}
