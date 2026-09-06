import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { devicesAPI } from '../../services/api';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { EmptyState } from '../../components/EmptyState';
import { Watch, Wifi, WifiOff, RefreshCw, Plus, X } from 'lucide-react';
import { useState } from 'react';

export function DevicesPage() {
  const queryClient = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [newDevice, setNewDevice] = useState({ name: '', type: 'smartwatch' });

  const { data: devices, isLoading } = useQuery({
    queryKey: ['devices'],
    queryFn: () => devicesAPI.getAll().then(r => r.data.devices),
  });

  const createMutation = useMutation({
    mutationFn: (data: { name: string; type: string }) => devicesAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      setShowAdd(false);
      setNewDevice({ name: '', type: 'smartwatch' });
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
                  placeholder="My Smartwatch"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Device Type</label>
                <select
                  value={newDevice.type}
                  onChange={(e) => setNewDevice({ ...newDevice, type: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none"
                >
                  <option value="smartwatch">Smartwatch</option>
                  <option value="fitness_tracker">Fitness Tracker</option>
                  <option value="pulse_oximeter">Pulse Oximeter</option>
                  <option value="thermometer">Thermometer</option>
                  <option value="blood_pressure">Blood Pressure Monitor</option>
                </select>
              </div>
              <button
                onClick={() => createMutation.mutate(newDevice)}
                disabled={!newDevice.name || createMutation.isPending}
                className="w-full py-3 rounded-xl bg-teal-600 text-white font-semibold hover:bg-teal-700 transition-colors disabled:opacity-50"
              >
                {createMutation.isPending ? 'Adding...' : 'Add Device'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Devices List */}
      {isLoading ? (
        <LoadingSkeleton lines={3} />
      ) : devices && devices.length > 0 ? (
        <div className="space-y-3">
          {devices.map((device) => (
            <div key={device.id} className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    device.isSimulation ? 'bg-amber-100' : 'bg-teal-100'
                  }`}>
                    <Watch className={`w-5 h-5 ${device.isSimulation ? 'text-amber-600' : 'text-teal-600'}`} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">{device.name}</h4>
                    <p className="text-sm text-slate-500 capitalize">{device.type.replace('_', ' ')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {device.isSimulation && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">
                      Demonstration Only
                    </span>
                  )}
                  <span className={`flex items-center gap-1 text-xs font-medium ${
                    device.status === 'connected' ? 'text-green-600' :
                    device.status === 'syncing' ? 'text-amber-600' : 'text-slate-500'
                  }`}>
                    {device.status === 'connected' ? <Wifi className="w-4 h-4" /> :
                     device.status === 'syncing' ? <RefreshCw className="w-4 h-4 animate-spin" /> :
                     <WifiOff className="w-4 h-4" />}
                    {device.status}
                  </span>
                </div>
              </div>
              {device.lastSync && (
                <p className="text-xs text-slate-400 mt-2">Last sync: {new Date(device.lastSync).toLocaleString()}</p>
              )}
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
