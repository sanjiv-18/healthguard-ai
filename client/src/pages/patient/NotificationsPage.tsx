import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsAPI } from '../../services/api';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { EmptyState } from '../../components/EmptyState';
import { BellRing, Check } from 'lucide-react';
import { useState } from 'react';

export function useNotifications() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsAPI.getAll().then(r => r.data.notifications),
    refetchInterval: 30000,
  });
}

export function NotificationsPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const { data: notifications, isLoading } = useNotifications();

  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationsAPI.markRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const filtered = (notifications || []).filter(n => filter === 'all' || !n.read);
  const unreadCount = (notifications || []).filter(n => !n.read).length;

  const typeColors: Record<string, string> = {
    health: 'bg-red-100 text-red-700',
    environmental: 'bg-amber-100 text-amber-700',
    emergency: 'bg-red-100 text-red-700',
    doctor_access: 'bg-blue-100 text-blue-700',
    security: 'bg-purple-100 text-purple-700',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Notifications</h2>
          <p className="text-slate-500">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
        <div className="flex bg-slate-100 rounded-lg p-0.5">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              filter === 'all' ? 'bg-white text-slate-900 shadow-sm font-medium' : 'text-slate-600'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              filter === 'unread' ? 'bg-white text-slate-900 shadow-sm font-medium' : 'text-slate-600'
            }`}
          >
            Unread {unreadCount > 0 && `(${unreadCount})`}
          </button>
        </div>
      </div>

      {isLoading ? (
        <LoadingSkeleton lines={5} />
      ) : filtered.length > 0 ? (
        <div className="space-y-2">
          {filtered.map(notification => (
            <div
              key={notification.id}
              className={`bg-white rounded-xl border p-4 flex items-center justify-between ${
                notification.read ? 'border-slate-200' : 'border-teal-200 bg-teal-50/30'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${notification.read ? 'bg-slate-300' : 'bg-teal-500'}`} />
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-slate-900">{notification.title}</h4>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${typeColors[notification.type] || 'bg-slate-100 text-slate-700'}`}>
                      {notification.type}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600">{notification.message}</p>
                  <p className="text-xs text-slate-400 mt-1">{new Date(notification.timestamp).toLocaleString()}</p>
                </div>
              </div>
              {!notification.read && (
                <button
                  onClick={() => markReadMutation.mutate(notification.id)}
                  className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                  title="Mark as read"
                >
                  <Check className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<BellRing className="w-8 h-8 text-slate-400" />}
          title="No Notifications"
          message="You're all caught up! Notifications will appear here."
        />
      )}
    </div>
  );
}
