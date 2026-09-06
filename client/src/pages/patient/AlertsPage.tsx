import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { alertsAPI } from '../../services/api';
import { AlertCard } from '../../components/AlertCard';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { EmptyState } from '../../components/EmptyState';
import { Bell, Filter } from 'lucide-react';
import { useState } from 'react';

export function AlertsPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const { data: alerts, isLoading } = useQuery({
    queryKey: ['alerts'],
    queryFn: () => alertsAPI.getAll().then(r => r.data.alerts),
  });

  const acknowledgeMutation = useMutation({
    mutationFn: (id: string) => alertsAPI.acknowledge(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['alerts'] }),
  });

  const resolveMutation = useMutation({
    mutationFn: (id: string) => alertsAPI.resolve(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['alerts'] }),
  });

  const filtered = (alerts || []).filter(a => {
    if (statusFilter !== 'all' && a.status !== statusFilter) return false;
    if (categoryFilter !== 'all' && a.category.toLowerCase() !== categoryFilter.toLowerCase()) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Alerts</h2>
        <p className="text-slate-500">Monitor health and environmental alerts</p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <span className="text-sm text-slate-600">Status:</span>
          <div className="flex bg-slate-100 rounded-lg p-0.5">
            {['all', 'active', 'acknowledged', 'resolved'].map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1 text-xs rounded-md capitalize transition-colors ${
                  statusFilter === s ? 'bg-white text-slate-900 shadow-sm font-medium' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-600">Category:</span>
          <div className="flex bg-slate-100 rounded-lg p-0.5">
            {['all', 'health', 'environmental', 'emergency', 'security'].map(c => (
              <button
                key={c}
                onClick={() => setCategoryFilter(c)}
                className={`px-3 py-1 text-xs rounded-md capitalize transition-colors ${
                  categoryFilter === c ? 'bg-white text-slate-900 shadow-sm font-medium' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {isLoading ? (
        <LoadingSkeleton lines={4} />
      ) : filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map(alert => (
            <AlertCard
              key={alert.id}
              alert={alert}
              onAcknowledge={(id) => acknowledgeMutation.mutate(id)}
              onResolve={(id) => resolveMutation.mutate(id)}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Bell className="w-8 h-8 text-slate-400" />}
          title="No Alerts"
          message="You're all caught up! Alerts will appear here when detected."
        />
      )}
    </div>
  );
}
