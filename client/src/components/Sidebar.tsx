import { NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  LayoutDashboard, Heart, Brain, CloudSun, Watch, FlaskConical,
  History, BarChart3, Bell, Siren, UserCheck, BellRing, Shield,
  User, LogOut, Users, FileText, X
} from 'lucide-react';

interface SidebarProps {
  role: 'patient' | 'doctor';
  isOpen: boolean;
  onClose: () => void;
}

const patientNav = [
  { to: '/patient', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/patient/health', icon: Heart, label: 'My Health' },
  { to: '/patient/ai', icon: Brain, label: 'AI Health' },
  { to: '/patient/environment', icon: CloudSun, label: 'Environment' },
  { to: '/patient/devices', icon: Watch, label: 'Devices' },
  { to: '/patient/simulation', icon: FlaskConical, label: 'Simulation' },
  { to: '/patient/history', icon: History, label: 'Health History' },
  { to: '/patient/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/patient/alerts', icon: Bell, label: 'Alerts' },
  { to: '/patient/emergency', icon: Siren, label: 'Emergency' },
  { to: '/patient/access', icon: UserCheck, label: 'Doctor Access' },
  { to: '/patient/notifications', icon: BellRing, label: 'Notifications' },
  { to: '/patient/privacy', icon: Shield, label: 'Privacy & Security' },
  { to: '/patient/profile', icon: User, label: 'Profile' },
];

const doctorNav = [
  { to: '/doctor', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/doctor/patients', icon: Users, label: 'My Patients' },
  { to: '/doctor/alerts', icon: Bell, label: 'Alerts' },
  { to: '/doctor/emergency', icon: Siren, label: 'Emergency' },
  { to: '/doctor/notes', icon: FileText, label: 'Clinical Notes' },
  { to: '/doctor/profile', icon: User, label: 'Profile' },
];

export function Sidebar({ role, isOpen, onClose }: SidebarProps) {
  const { user, logout } = useAuth();
  const navItems = role === 'patient' ? patientNav : doctorNav;

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />
      )}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-slate-900 text-white z-50 transform transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-4 border-b border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="font-bold text-lg leading-tight">HealthGuard</h1>
                  <span className="text-xs text-teal-400 font-medium">AI</span>
                </div>
              </div>
              <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <span className="inline-block mt-2 text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 capitalize">
              {role} Portal
            </span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    isActive
                      ? 'bg-teal-600 text-white'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`
                }
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* User Info */}
          <div className="p-4 border-t border-slate-800">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-full bg-teal-600 flex items-center justify-center">
                <span className="text-sm font-semibold">
                  {user?.name?.split(' ').map(n => n[0]).join('') || '?'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.name}</p>
                <p className="text-xs text-slate-400 truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
