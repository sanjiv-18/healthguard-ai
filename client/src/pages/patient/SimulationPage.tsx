import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { simulationAPI } from '../../services/api';
import { SimulationCard } from '../../components/SimulationCard';
import { RiskBadge } from '../../components/RiskBadge';
import { AlertCard } from '../../components/AlertCard';
import { FallDetectionModal } from '../../components/FallDetectionModal';
import { EmergencyModal } from '../../components/EmergencyModal';
import { Thermometer, Droplets, Wind, Heart, Moon, Layers, Siren, RotateCcw, CheckCircle } from 'lucide-react';

const scenarios = [
  { type: 'normal', title: 'Normal Vitals', description: 'Simulate healthy baseline readings', icon: <CheckCircle className="w-5 h-5 text-green-600" />, color: 'green' },
  { type: 'heat-stress', title: 'Heat Stress', description: 'High temperature and heat index exposure', icon: <Thermometer className="w-5 h-5 text-orange-600" />, color: 'orange' },
  { type: 'dehydration', title: 'Dehydration', description: 'Low hydration levels', icon: <Droplets className="w-5 h-5 text-blue-600" />, color: 'blue' },
  { type: 'high-aqi', title: 'High AQI', description: 'Poor air quality conditions', icon: <Wind className="w-5 h-5 text-purple-600" />, color: 'purple' },
  { type: 'heart-rate', title: 'Heart Rate Spike', description: 'Elevated heart rate simulation', icon: <Heart className="w-5 h-5 text-red-600" />, color: 'red' },
  { type: 'poor-sleep', title: 'Poor Sleep', description: 'Sleep deprivation scenario', icon: <Moon className="w-5 h-5 text-indigo-600" />, color: 'slate' },
  { type: 'combined-risk', title: 'Combined Risk', description: 'Multiple risk factors at once', icon: <Layers className="w-5 h-5 text-amber-600" />, color: 'amber' },
  { type: 'fall', title: 'Fall Detection', description: 'Simulate a fall event', icon: <Siren className="w-5 h-5 text-red-600" />, color: 'red' },
];

export function SimulationPage() {
  const [result, setResult] = useState<any>(null);
  const [showFallModal, setShowFallModal] = useState(false);
  const [showSosModal, setShowSosModal] = useState(false);

  const triggerMutation = useMutation({
    mutationFn: (scenarioType: string) => simulationAPI.trigger(scenarioType),
    onSuccess: (data) => {
      setResult(data.data);
    },
  });

  const resetMutation = useMutation({
    mutationFn: () => simulationAPI.reset(),
    onSuccess: () => setResult(null),
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
          <p className="text-slate-500">Test the system with simulated health scenarios</p>
        </div>
        <button
          onClick={() => resetMutation.mutate()}
          disabled={resetMutation.isPending}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-medium transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </button>
      </div>

      {/* Architecture Note */}
      <div className="bg-slate-100 rounded-xl p-4 text-sm text-slate-600">
        <strong>Architecture:</strong> Frontend → API → Backend → Database → Risk Engine → Alert → Response
      </div>

      {/* Scenario Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

      {/* Results */}
      {result && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900">Simulation Results</h3>

          {/* New Vitals */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h4 className="font-semibold text-slate-900 mb-3">New Vital Readings</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="text-center p-3 bg-red-50 rounded-xl">
                <p className="text-xs text-red-600">Heart Rate</p>
                <p className="text-xl font-bold text-slate-900">{result.vitalReading?.heartRate} bpm</p>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-xl">
                <p className="text-xs text-blue-600">SpO2</p>
                <p className="text-xl font-bold text-slate-900">{result.vitalReading?.spo2}%</p>
              </div>
              <div className="text-center p-3 bg-amber-50 rounded-xl">
                <p className="text-xs text-amber-600">Temperature</p>
                <p className="text-xl font-bold text-slate-900">{result.vitalReading?.temperature}°C</p>
              </div>
              <div className="text-center p-3 bg-teal-50 rounded-xl">
                <p className="text-xs text-teal-600">Hydration</p>
                <p className="text-xl font-bold text-slate-900">{result.vitalReading?.hydration}%</p>
              </div>
            </div>
          </div>

          {/* Environment */}
          {result.envReading && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h4 className="font-semibold text-slate-900 mb-3">Environmental Conditions</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="text-center p-3 bg-orange-50 rounded-xl">
                  <p className="text-xs text-orange-600">Temperature</p>
                  <p className="text-xl font-bold text-slate-900">{result.envReading?.temperature}°C</p>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-xl">
                  <p className="text-xs text-blue-600">Humidity</p>
                  <p className="text-xl font-bold text-slate-900">{result.envReading?.humidity}%</p>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-xl">
                  <p className="text-xs text-purple-600">AQI</p>
                  <p className="text-xl font-bold text-slate-900">{result.envReading?.aqi}</p>
                </div>
                <div className="text-center p-3 bg-amber-50 rounded-xl">
                  <p className="text-xs text-amber-600">Heat Index</p>
                  <p className="text-xl font-bold text-slate-900">{result.envReading?.heatIndex}°C</p>
                </div>
              </div>
            </div>
          )}

          {/* Risk Assessment */}
          {result.riskAssessment && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <div className="flex items-center gap-3 mb-3">
                <h4 className="font-semibold text-slate-900">Risk Assessment</h4>
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

          {/* Recommendations */}
          {result.recommendations && result.recommendations.length > 0 && (
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

          {/* Alert */}
          {result.alert && (
            <div className="space-y-3">
              <h4 className="font-semibold text-slate-900">Generated Alert</h4>
              <AlertCard alert={result.alert} />
            </div>
          )}
        </div>
      )}

      {/* Modals */}
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
