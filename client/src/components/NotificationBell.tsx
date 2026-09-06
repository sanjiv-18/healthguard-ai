import { Bell } from 'lucide-react';

interface NotificationBellProps {
  count: number;
  onClick?: () => void;
}

export function NotificationBell({ count, onClick }: NotificationBellProps) {
  return (
    <button onClick={onClick} className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
      <Bell className="w-5 h-5" />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </button>
  );
}
