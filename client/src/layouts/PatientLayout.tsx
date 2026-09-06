import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Topbar } from '../components/Topbar';
import { useNotifications } from '../pages/patient/NotificationsPage';

export function PatientLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: notifications } = useNotifications();
  const unreadCount = notifications?.filter(n => !n.read).length || 0;

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar role="patient" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:ml-64">
        <Topbar
          title="Dashboard"
          notificationCount={unreadCount}
          onMenuClick={() => setSidebarOpen(true)}
          onNotificationClick={() => window.location.href = '/patient/notifications'}
        />
        <main className="p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
