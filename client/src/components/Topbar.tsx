import { Menu } from 'lucide-react';
import { NotificationBell } from './NotificationBell';

interface TopbarProps {
  title: string;
  notificationCount?: number;
  onMenuClick: () => void;
  onNotificationClick?: () => void;
}

export function Topbar({ title, notificationCount = 0, onMenuClick, onNotificationClick }: TopbarProps) {
  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="flex items-center justify-between px-4 py-3 lg:px-6">
        <div className="flex items-center gap-3">
          <button onClick={onMenuClick} className="lg:hidden p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg">
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
        </div>
        <NotificationBell count={notificationCount} onClick={onNotificationClick} />
      </div>
    </header>
  );
}
