import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { devicesAPI } from '../../services/api';
import { SmartWatchSVG } from '../../components/SmartWatchSVG';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { EmptyState } from '../../components/EmptyState';
import { Wifi, WifiOff, RefreshCw, Plus, X, Battery, BatteryLow, Trash2, PlugZap, Clock, Activity, Shield, ChevronRight, Zap, Heart, Wind, Thermometer, Droplets } from 'lucide-react';
import { useState } from 'react';
import type { Device } from '../../types';

function getStatusLabel(status: string) {
  switch (status) {
    case 'CONNECTED': return 'Connected';
    case 'DISCONNECTED': return 'Not Connected';
    case 'SYNCING': return 'Syncing...';
    case 'ERROR': return 'Connection Error';
    default: return status;
  }
}

function getStatusDotColor(status: string) {
  switch (status) {
    case 'CONNECTED': return 'bg-green-500';
    case 'SYNCING': return 'bg-amber-500 animate-pulse';
    case 'ERROR': return 'bg-red-500';
    default: return 'bg-slate-400';
  }
}

function getStatusTextColor(status: string) {
  switch (status) {
    case 'CONNECTED': return 'text-green-600';
    case 'SYNCING': return 'text-amber-600';
    case 'ERROR': return 'text-red-600';
    default: return 'text-slate-500';
  }
}

function getStatusBgColor(status: string) {
  switch (status) {
    case 'CONNECTED': return 'bg-green-50 border-green-200';
    case 'SYNCING': return 'bg-amber-50 border-amber-200';
    case 'ERROR': return 'bg-red-50 border-red-200';
    default: return 'bg-slate-50 border-slate-200';
  }
}

function formatTimeSince(timestamp?: string) {
  if (!timestamp) return 'Never';
  const diff = Date.now() - new Date(timestamp).getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

function getBatteryIcon(battery: number) {
  if (battery > 50) return <Battery className="w-4 h-4 text-green-600" />;
  if (battery > 20) return <Battery className="w-4 h-4 text-amber-600" />;
  return <BatteryLow className="w-4 h-4 text-red-600" />;
}

export function DevicesPage() {
  const queryClient = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [newDevice, setNewDevice] = useState({ name: '', type: 'SMARTWATCH', manufacturer: '', model: '' });

  const { data: devices, isLoading } = useQuery({
    queryKey: ['devices'],
    queryFn: () => devicesAPI.getAll().then(r => r.data.devices),
    refetchInterval: 10000,
  });

  const { data: deviceStatus } = useQuery({
    queryKey: ['device-status'],
    queryFn: () => devicesAPI.getStatus().then(r => r.data),
    refetchInterval: 5000,
  });

  const createMutation = useMutation({
    mutationFn: (data: { name: string; type: string; manufacturer?: string; model?: string; isSimulation?: boolean }) =>
      devicesAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      queryClient.invalidateQueries({ queryKey: ['device-status'] });
      setShowAdd(false);
      setNewDevice({ name: '', type: 'SMARTWATCH', manufacturer: '', model: '' });
    },
  });

  const connectMutation = useMutation({
    mutationFn: (id: string) => devicesAPI.connect(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      queryClient.invalidateQueries({ queryKey: ['device-status'] });
    },
  });

  const disconnectMutation = useMutation({
    mutationFn: (id: string) => devicesAPI.disconnect(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      queryClient.invalidateQueries({ queryKey: ['device-status'] });
    },
  });

  const syncMutation = useMutation({
    mutationFn: (id: string) => devicesAPI.sync(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      queryClient.invalidateQueries({ queryKey: ['device-status'] });
    },
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => devicesAPI.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      queryClient.invalidateQueries({ queryKey: ['device-status'] });
      setSelectedDevice(null);
    },
  });

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

      {/* Status Summary */}
      {deviceStatus && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white rounded-xl border border-slate-200 p-3 text-center">
            <p className="text-xs text-slate-500">Total Devices</p>
            <p className="text-xl font-bold text-slate-900">{deviceStatus.total}</p>
          </div>
          <div className="bg-green-50 rounded-xl border border-green-200 p-3 text-center">
            <p className="text-xs text-green-600">Connected</p>
            <p className="text-xl font-bold text-green-700">{deviceStatus.connected}</p>
          </div>
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-3 text-center">
            <p className="text-xs text-slate-500">Disconnected</p>
            <p className="text-xl font-bold text-slate-700">{deviceStatus.disconnected}</p>
          </div>
          <div className="bg-amber-50 rounded-xl border border-amber-200 p-3 text-center">
            <p className="text-xs text-amber-600">Syncing</p>
            <p className="text-xl font-bold text-amber-700">{deviceStatus.syncing}</p>
          </div>
        </div>
      )}

      {/* Add Device Modal */}
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

      {/* Device Detail Modal */}
      {selectedDevice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-900">Device Details</h3>
                <button onClick={() => setSelectedDevice(null)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Watch Visual */}
              <div className="flex flex-col items-center mb-6">
                <SmartWatchSVG connected={selectedDevice.status === 'CONNECTED'} syncing={selectedDevice.status === 'SYNCING'} className="w-32 h-44" />
                <div className="mt-3 text-center">
                  <h4 className="font-bold text-slate-900 text-lg">{selectedDevice.name}</h4>
                  <p className="text-sm text-slate-500">{selectedDevice.type.replace(/_/g, ' ')}{selectedDevice.manufacturer ? ` - ${selectedDevice.manufacturer}` : ''}</p>
                </div>
              </div>

              {/* Status Badge */}
              <div className={`rounded-xl border p-3 mb-4 ${getStatusBgColor(selectedDevice.status)}`}>
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${getStatusDotColor(selectedDevice.status)}`} />
                  <span className={`text-sm font-semibold ${getStatusTextColor(selectedDevice.status)}`}>
                    {getStatusLabel(selectedDevice.status)}
                  </span>
                </div>
              </div>

              {/* Device Info Grid */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs text-slate-500">Battery</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    {getBatteryIcon(selectedDevice.battery)}
                    <span className="text-sm font-semibold text-slate-900">{selectedDevice.battery}%</span>
                  </div>
                </div>
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs text-slate-500">Last Synced</p>
                  <p className="text-sm font-semibold text-slate-900 mt-1">{formatTimeSince(selectedDevice.lastSync)}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs text-slate-500">Data Source</p>
                  <p className="text-sm font-semibold text-slate-900 mt-1">{selectedDevice.provider}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs text-slate-500">Model</p>
                  <p className="text-sm font-semibold text-slate-900 mt-1">{selectedDevice.model || 'N/A'}</p>
                </div>
              </div>

              {/* Collected Metrics */}
              <div className="mb-4">
                <p className="text-sm font-medium text-slate-700 mb-2">Collected Health Metrics</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { icon: <Heart className="w-3 h-3" />, label: 'Heart Rate' },
                    { icon: <Wind className="w-3 h-3" />, label: 'SpO2' },
                    { icon: <Thermometer className="w-3 h-3" />, label: 'Temperature' },
                    { icon: <Droplets className="w-3 h-3" />, label: 'Hydration' },
                    { icon: <Activity className="w-3 h-3" />, label: 'Steps' },
                    { icon: <Zap className="w-3 h-3" />, label: 'Stress' },
                  ].map(m => (
                    <span key={m.label} className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                      {m.icon} {m.label}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t border-slate-100">
                {selectedDevice.status === 'DISCONNECTED' ? (
                  <button
                    onClick={() => { connectMutation.mutate(selectedDevice.id); setSelectedDevice(null); }}
                    disabled={connectMutation.isPending}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-green-600 text-white hover:bg-green-700 text-sm font-medium transition-colors"
                  >
                    <PlugZap className="w-4 h-4" />
                    Connect Device
                  </button>
                ) : (
                  <button
                    onClick={() => { disconnectMutation.mutate(selectedDevice.id); setSelectedDevice(null); }}
                    disabled={disconnectMutation.isPending}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-sm font-medium transition-colors"
                  >
                    <WifiOff className="w-4 h-4" />
                    Disconnect
                  </button>
                )}
                <button
                  onClick={() => { syncMutation.mutate(selectedDevice.id); }}
                  disabled={selectedDevice.status !== 'CONNECTED' || syncMutation.isPending}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 text-sm font-medium transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${syncMutation.isPending ? 'animate-spin' : ''}`} />
                  Sync
                </button>
                <button
                  onClick={() => { if (confirm('Remove this device?')) removeMutation.mutate(selectedDevice.id); }}
                  className="flex items-center justify-center px-4 py-2.5 rounded-xl bg-red-50 text-red-700 hover:bg-red-100 text-sm font-medium transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Device Cards */}
      {isLoading ? (
        <LoadingSkeleton lines={3} />
      ) : devices && devices.length > 0 ? (
        <div className="space-y-4">
          {devices.map((device: Device) => {
            const isConnected = device.status === 'CONNECTED';
            const isSyncing = device.status === 'SYNCING';

            return (
              <div
                key={device.id}
                onClick={() => setSelectedDevice(device)}
                className={`bg-white rounded-2xl border-2 overflow-hidden cursor-pointer transition-all hover:shadow-lg ${
                  isConnected ? 'border-green-200 hover:border-green-300' :
                  isSyncing ? 'border-amber-200 hover:border-amber-300' :
                  'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Desktop Layout */}
                <div className="hidden md:flex items-stretch">
                  {/* Watch Visual Section */}
                  <div className={`flex-shrink-0 w-48 flex items-center justify-center p-6 ${
                    isConnected ? 'bg-gradient-to-br from-green-50 to-teal-50' :
                    isSyncing ? 'bg-gradient-to-br from-amber-50 to-orange-50' :
                    'bg-gradient-to-br from-slate-50 to-slate-100'
                  }`}>
                    <SmartWatchSVG connected={isConnected} syncing={isSyncing} className="w-28 h-40" />
                  </div>

                  {/* Device Info Section */}
                  <div className="flex-1 p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-lg font-bold text-slate-900">{device.name}</h4>
                        <p className="text-sm text-slate-500 mt-0.5">{device.type.replace(/_/g, ' ')}{device.manufacturer ? ` - ${device.manufacturer}` : ''}</p>

                        {/* Status */}
                        <div className="flex items-center gap-2 mt-3">
                          <span className={`w-2.5 h-2.5 rounded-full ${getStatusDotColor(device.status)}`} />
                          <span className={`text-sm font-semibold ${getStatusTextColor(device.status)}`}>
                            {getStatusLabel(device.status)}
                          </span>
                        </div>

                        {/* Info Row */}
                        <div className="flex items-center gap-4 mt-3 text-sm text-slate-500">
                          <span className="flex items-center gap-1.5">
                            {getBatteryIcon(device.battery)}
                            {device.battery}%
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            {formatTimeSince(device.lastSync)}
                          </span>
                        </div>
                      </div>

                      {/* Badges */}
                      <div className="flex flex-col items-end gap-2">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                          device.provider === 'SIMULATED' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                        }`}>
                          {device.provider}
                        </span>
                        <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-medium">
                          {device.type.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100" onClick={(e) => e.stopPropagation()}>
                      {device.status === 'DISCONNECTED' ? (
                        <button
                          onClick={() => connectMutation.mutate(device.id)}
                          disabled={connectMutation.isPending}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700 text-sm font-medium transition-colors"
                        >
                          <PlugZap className="w-3.5 h-3.5" />
                          {connectMutation.isPending ? 'Connecting...' : 'Connect'}
                        </button>
                      ) : (
                        <button
                          onClick={() => disconnectMutation.mutate(device.id)}
                          disabled={disconnectMutation.isPending}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-sm font-medium transition-colors"
                        >
                          <WifiOff className="w-3.5 h-3.5" />
                          Disconnect
                        </button>
                      )}
                      <button
                        onClick={() => syncMutation.mutate(device.id)}
                        disabled={device.status !== 'CONNECTED' || syncMutation.isPending}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 text-sm font-medium transition-colors disabled:opacity-50"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${syncMutation.isPending ? 'animate-spin' : ''}`} />
                        Sync
                      </button>
                      <button
                        onClick={() => { if (confirm('Remove this device?')) removeMutation.mutate(device.id); }}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-50 text-red-700 hover:bg-red-100 text-sm font-medium transition-colors ml-auto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Remove
                      </button>
                    </div>
                  </div>
                </div>

                {/* Mobile Layout */}
                <div className="md:hidden">
                  <div className={`flex flex-col items-center p-6 ${
                    isConnected ? 'bg-gradient-to-br from-green-50 to-teal-50' :
                    isSyncing ? 'bg-gradient-to-br from-amber-50 to-orange-50' :
                    'bg-gradient-to-br from-slate-50 to-slate-100'
                  }`}>
                    <SmartWatchSVG connected={isConnected} syncing={isSyncing} className="w-24 h-34" />
                  </div>
                  <div className="p-4">
                    <div className="text-center mb-3">
                      <h4 className="font-bold text-slate-900">{device.name}</h4>
                      <div className="flex items-center justify-center gap-2 mt-1">
                        <span className={`w-2 h-2 rounded-full ${getStatusDotColor(device.status)}`} />
                        <span className={`text-sm font-semibold ${getStatusTextColor(device.status)}`}>
                          {getStatusLabel(device.status)}
                        </span>
                      </div>
                      <div className="flex items-center justify-center gap-3 mt-2 text-xs text-slate-500">
                        <span className="flex items-center gap-1">{getBatteryIcon(device.battery)} {device.battery}%</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {formatTimeSince(device.lastSync)}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-center gap-2 mt-3 pt-3 border-t border-slate-100" onClick={(e) => e.stopPropagation()}>
                      {device.status === 'DISCONNECTED' ? (
                        <button
                          onClick={() => connectMutation.mutate(device.id)}
                          disabled={connectMutation.isPending}
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-green-600 text-white text-sm font-medium"
                        >
                          <PlugZap className="w-3.5 h-3.5" /> Connect
                        </button>
                      ) : (
                        <button
                          onClick={() => disconnectMutation.mutate(device.id)}
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 text-slate-700 text-sm font-medium"
                        >
                          <WifiOff className="w-3.5 h-3.5" /> Disconnect
                        </button>
                      )}
                      <button
                        onClick={() => syncMutation.mutate(device.id)}
                        disabled={device.status !== 'CONNECTED'}
                        className="flex items-center justify-center px-3 py-2 rounded-xl bg-blue-50 text-blue-700 text-sm font-medium disabled:opacity-50"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={<Wifi className="w-8 h-8 text-slate-400" />}
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
