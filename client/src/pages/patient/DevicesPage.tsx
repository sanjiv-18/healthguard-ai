import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { devicesAPI } from '../../services/api';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { EmptyState } from '../../components/EmptyState';
import { Watch, Wifi, WifiOff, RefreshCw, Plus, X, Battery, BatteryLow, Trash2, Plug, PlugZap } from 'lucide-react';
import { useState } from 'react';
import type { Device } from '../../types';

export function DevicesPage() {
  const queryClient = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [newDevice, setNewDevice] = useState({ name: '', type: 'SMARTWATCH', manufacturer: '', model: '' });

  const { data: devices, isLoading } = useQuery({
    queryKey: ['devices'],
    queryFn: () => devicesAPI.getAll().then(r => r.data.devices),
  });

  const createMutation = useMutation({
    mutationFn: (data: { name: string; type: string; manufacturer?: string; model?: string; isSimulation?: boolean }) =>
      devicesAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      setShowAdd(false);
      setNewDevice({ name: '', type: 'SMARTWATCH', manufacturer: '', model: '' });
    },
  });

  const connectMutation = useMutation({
    mutationFn: (id: string) => devicesAPI.connect(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['devices'] }),
  });

  const disconnectMutation = useMutation({
    mutationFn: (id: string) => devicesAPI.disconnect(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['devices'] }),
  });

  const syncMutation = useMutation({
    mutationFn: (id: string) => devicesAPI.sync(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['devices'] }),
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => devicesAPI.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['devices'] }),
  });

  const getBatteryIcon = (battery: number) => {
    if (battery > 50) return <Battery className="w-4 h-4 text-green-600" />;
    if (battery > 20) return <Battery className="w-4 h-4 text-amber-600" />;
    return <BatteryLow className="w-4 h-4 text-red-600" />;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONNECTED': return 'text-green-600';
      case 'SYNCING': return 'text-amber-600';
      case 'DISCONNECTED': return 'text-slate-500';
      default: return 'text-red-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CONNECTED': return <Wifi className="w-4 h-4" />;
      case 'SYNCING': return <RefreshCw className="w-4 h-4 animate-spin" />;
      default: return <WifiOff className="w-4 h-4" />;
    }
  };

  const formatTimeSince = (timestamp?: string) => {
    if (!timestamp) return 'Never';
    const diff = Date.now() - new Date(timestamp).getTime();
    const seconds = Math.floor(diff / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Devices</h2>
          <p className="text-slate-500">Manage your connected health devices</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 text-white hover:bg-teal-700 text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Device
        </button>
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900">Add Device</h3>
              <button onClick={() => setShowAdd(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Device Name</label>
                <input
                  type="text"
                  value={newDevice.name}
                  onChange={(e) => setNewDevice({ ...newDevice, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none"
                  placeholder="HealthGuard Smart Watch"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Device Type</label>
                <select
                  value={newDevice.type}
                  onChange={(e) => setNewDevice({ ...newDevice, type: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none"
                >
                  <option value="SMARTWATCH">Smartwatch</option>
                  <option value="HEALTH_BAND">Health Band</option>
                  <option value="PULSE_OXIMETER">Pulse Oximeter</option>
                  <option value="THERMOMETER">Thermometer</option>
                  <option value="BLOOD_PRESSURE">Blood Pressure Monitor</option>
                  <option value="IOT_SENSOR">IoT Sensor</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Manufacturer (optional)</label>
                <input
                  type="text"
                  value={newDevice.manufacturer}
                  onChange={(e) => setNewDevice({ ...newDevice, manufacturer: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none"
                  placeholder="HealthGuard"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isSimulation"
                  checked={newDevice.name.toLowerCase().includes('sim') || newDevice.name.toLowerCase().includes('demo')}
                  readOnly
                  className="rounded border-slate-300"
                />
                <label htmlFor="isSimulation" className="text-sm text-slate-600">Mark as simulated device</label>
              </div>
              <button
                onClick={() => createMutation.mutate({ ...newDevice, isSimulation: newDevice.name.toLowerCase().includes('sim') || newDevice.name.toLowerCase().includes('demo') })}
                disabled={!newDevice.name || createMutation.isPending}
                className="w-full py-3 rounded-xl bg-teal-600 text-white font-semibold hover:bg-teal-700 transition-colors disabled:opacity-50"
              >
                {createMutation.isPending ? 'Adding...' : 'Add Device'}
              </button>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <LoadingSkeleton lines={3} />
      ) : devices && devices.length > 0 ? (
        <div className="space-y-3">
          {devices.map((device: Device) => (
            <div key={device.id} className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    device.isSimulation ? 'bg-amber-100' : 'bg-teal-100'
                  }`}>
                    <Watch className={`w-6 h-6 ${device.isSimulation ? 'text-amber-600' : 'text-teal-600'}`} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">{device.name}</h4>
                    <p className="text-sm text-slate-500">{device.type.replace(/_/g, ' ')}{device.manufacturer ? ` - ${device.manufacturer}` : ''}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className={`flex items-center gap-1 text-xs font-medium ${getStatusColor(device.status)}`}>
                        {getStatusIcon(device.status)}
                        {device.status}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        {getBatteryIcon(device.battery)}
                        {device.battery}%
                      </span>
                      <span className="text-xs text-slate-400">
                        Last synced {formatTimeSince(device.lastSync)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {device.isSimulation && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">
                      SIMULATED
                    </span>
                  )}
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    device.provider === 'SIMULATED' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                  }`}>
                    {device.provider}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
                {device.status === 'DISCONNECTED' ? (
                  <button
                    onClick={() => connectMutation.mutate(device.id)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 text-xs font-medium transition-colors"
                  >
                    <PlugZap className="w-3 h-3" />
                    Connect
                  </button>
                ) : (
                  <button
                    onClick={() => disconnectMutation.mutate(device.id)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-50 text-slate-700 hover:bg-slate-100 text-xs font-medium transition-colors"
                  >
                    <WifiOff className="w-3 h-3" />
                    Disconnect
                  </button>
                )}
                <button
                  onClick={() => syncMutation.mutate(device.id)}
                  disabled={device.status !== 'CONNECTED' || syncMutation.isPending}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-medium transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-3 h-3 ${syncMutation.isPending ? 'animate-spin' : ''}`} />
                  Sync
                </button>
                <button
                  onClick={() => {
                    if (confirm('Remove this device?')) removeMutation.mutate(device.id);
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 text-xs font-medium transition-colors ml-auto"
                >
                  <Trash2 className="w-3 h-3" />
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Watch className="w-8 h-8 text-slate-400" />}
          title="No Devices Connected"
          message="Connect a health device to start tracking your vital signs automatically."
          action={
            <button
              onClick={() => setShowAdd(true)}
              className="px-4 py-2 rounded-xl bg-teal-600 text-white hover:bg-teal-700 text-sm font-medium transition-colors"
            >
              Add Your First Device
            </button>
          }
        />
      )}
    </div>
  );
}
