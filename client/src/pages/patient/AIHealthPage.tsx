import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { aiAPI } from '../../services/api';
import { RiskBadge } from '../../components/RiskBadge';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { Shield, Brain, Info, Zap } from 'lucide-react';

export function AIHealthPage() {
  const queryClient = useQueryClient();

  const { data: risk, isLoading } = useQuery({
    queryKey: ['ai-risk'],
    queryFn: () => aiAPI.getRisk().then(r => r.data.risk),
  });

  const analyzeMutation = useMutation({
    mutationFn: () => aiAPI.analyze(),
    onSuccess: (data) => {
      queryClient.setQueryData(['ai-risk'], data.data.risk);
    },
  });

  const riskFactors = risk ? [
    { label: 'Heat Stress', value: risk.heatStress, color: 'bg-orange-500' },
    { label: 'Dehydration', value: risk.dehydration, color: 'bg-blue-500' },
    { label: 'Respiratory', value: risk.respiratory, color: 'bg-purple-500' },
    { label: 'Cardiac Strain', value: risk.cardiacStrain, color: 'bg-red-500' },
    { label: 'Fatigue', value: risk.fatigue, color: 'bg-amber-500' },
  ] : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">AI Health Assessment</h2>
          <p className="text-slate-500">AI-powered health risk analysis</p>
        </div>
        <button
          onClick={() => analyzeMutation.mutate()}
          disabled={analyzeMutation.isPending}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 text-white hover:bg-teal-700 text-sm font-medium transition-colors disabled:opacity-50"
        >
          <Zap className="w-4 h-4" />
          {analyzeMutation.isPending ? 'Analyzing...' : 'Analyze Now'}
        </button>
      </div>

      {isLoading ? (
        <LoadingSkeleton lines={6} />
      ) : risk ? (
        <>
          {/* Overall Risk */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className={`w-20 h-20 rounded-2xl flex items-center justify-center ${
                risk.level === 'LOW' ? 'bg-green-100' :
                risk.level === 'MODERATE' ? 'bg-amber-100' :
                risk.level === 'HIGH' ? 'bg-orange-100' : 'bg-red-100'
              }`}>
                <Brain className={`w-10 h-10 ${
                  risk.level === 'LOW' ? 'text-green-600' :
                  risk.level === 'MODERATE' ? 'text-amber-600' :
                  risk.level === 'HIGH' ? 'text-orange-600' : 'text-red-600'
                }`} />
              </div>
              <div>
                <h3 className="text-3xl font-bold text-slate-900">{Math.round(risk.overallRisk * 100)}%</h3>
                <RiskBadge level={risk.level} size="lg" />
              </div>
            </div>
            <p className="text-slate-600">{risk.explanation}</p>
          </div>

          {/* Risk Factors */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Risk Factors</h3>
            <div className="space-y-4">
              {riskFactors.map((factor) => (
                <div key={factor.label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-slate-700">{factor.label}</span>
                    <span className="text-sm text-slate-500">{Math.round(factor.value * 100)}%</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${factor.color} transition-all duration-500`}
                      style={{ width: `${factor.value * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Recommendations</h3>
            <div className="space-y-3">
              {risk.recommendations.map((rec: string, i: number) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-teal-50 rounded-xl">
                  <Shield className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-700">{rec}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Confidence */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">Analysis Confidence</span>
              <span className="text-lg font-bold text-slate-900">{Math.round(risk.confidence * 100)}%</span>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-amber-800 mb-1">Important Disclaimer</h4>
                <p className="text-sm text-amber-700">
                  HealthGuard AI provides informational risk assessments and does not provide medical diagnosis, treatment, or emergency medical care. 
                  Always consult with a qualified healthcare professional for medical decisions.
                </p>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <Brain className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No Risk Assessment Available</h3>
          <p className="text-slate-500 mb-4">Click "Analyze Now" to generate a health risk assessment</p>
          <button
            onClick={() => analyzeMutation.mutate()}
            className="px-6 py-3 rounded-xl bg-teal-600 text-white hover:bg-teal-700 font-medium transition-colors"
          >
            Run Analysis
          </button>
        </div>
      )}
    </div>
  );
}
