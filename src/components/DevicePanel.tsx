import React from 'react';
import { Laptop, Smartphone, Tablet, Battery, MapPin, RefreshCw } from 'lucide-react';
import { useDevices } from '../contexts/DeviceContext';

const DevicePanel: React.FC = () => {
  const { devices, currentDevice, syncStatus, syncDevices } = useDevices();

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'laptop':
        return Laptop;
      case 'mobile':
        return Smartphone;
      case 'tablet':
        return Tablet;
      default:
        return Smartphone;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30';
      case 'sync':
        return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'offline':
        return 'text-slate-400 bg-slate-500/20 border-slate-500/30';
      default:
        return 'text-slate-400 bg-slate-500/20 border-slate-500/30';
    }
  };

  const getBatteryColor = (level?: number) => {
    if (!level) return 'text-slate-400';
    if (level > 50) return 'text-emerald-400';
    if (level > 20) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Device Ecosystem</h2>
            <p className="text-slate-400">Manage your connected devices</p>
          </div>
          <button
            onClick={syncDevices}
            disabled={syncStatus === 'syncing'}
            className="flex items-center space-x-2 px-3 py-2 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-lg hover:bg-cyan-500/30 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
            <span>Sync All</span>
          </button>
          <button
            onClick={() => {
              const deviceName = prompt('Enter device name:');
              const deviceType = prompt('Enter device type (laptop/tablet/mobile):') as 'laptop' | 'tablet' | 'mobile';
              if (deviceName && deviceType) {
                const newDevice = {
                  id: `device_${Date.now()}`,
                  name: deviceName,
                  type: deviceType,
                  status: 'online' as const,
                  lastSeen: new Date(),
                  batteryLevel: Math.floor(Math.random() * 100),
                  location: 'Unknown'
                };
                // This would normally call addDevice from context
                alert(`Device "${deviceName}" would be added to your ecosystem`);
              }
            }}
            className="flex items-center space-x-2 px-3 py-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg hover:bg-emerald-500/30 transition-all"
          >
            <span>+ Add Device</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {devices.map((device) => {
            const DeviceIcon = getDeviceIcon(device.type);
            const isCurrentDevice = device.id === currentDevice.id;

            return (
              <div
                key={device.id}
                className={`relative p-4 rounded-xl border transition-all hover:bg-slate-700/50 ${
                  isCurrentDevice
                    ? 'bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border-cyan-500/30'
                    : 'bg-slate-700/30 border-slate-600'
                }`}
              >
                {isCurrentDevice && (
                  <div className="absolute top-2 right-2 w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                )}

                <div className="flex items-center justify-between mb-3">
                  <DeviceIcon className="h-6 w-6 text-cyan-400" />
                  <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(device.status)}`}>
                    {device.status}
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-white mb-1">
                  {device.name}
                  {isCurrentDevice && <span className="text-xs text-cyan-400 ml-2">(Current)</span>}
                </h3>

                <p className="text-sm text-slate-400 mb-3 capitalize">{device.type}</p>

                <div className="space-y-2">
                  {device.batteryLevel && (
                    <div className="flex items-center space-x-2 text-sm">
                      <Battery className={`h-4 w-4 ${getBatteryColor(device.batteryLevel)}`} />
                      <span className="text-slate-300">{device.batteryLevel}%</span>
                      <div className="flex-1 bg-slate-600 rounded-full h-2">
                        <div
                          className={`h-full rounded-full ${
                            device.batteryLevel > 50 ? 'bg-emerald-400' :
                            device.batteryLevel > 20 ? 'bg-yellow-400' : 'bg-red-400'
                          }`}
                          style={{ width: `${device.batteryLevel}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {device.location && (
                    <div className="flex items-center space-x-2 text-sm text-slate-400">
                      <MapPin className="h-4 w-4" />
                      <span>{device.location}</span>
                    </div>
                  )}

                  <div className="text-xs text-slate-500">
                    Last seen: {device.lastSeen.toLocaleString()}
                  </div>
                  
                  {!isCurrentDevice && (
                    <button
                      onClick={() => {
                        if (confirm(`Remove ${device.name} from your ecosystem?`)) {
                          alert(`Device "${device.name}" would be removed from your ecosystem`);
                        }
                      }}
                      className="w-full mt-2 px-2 py-1 text-xs bg-red-500/20 text-red-400 border border-red-500/30 rounded hover:bg-red-500/30 transition-all"
                    >
                      Remove Device
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4">Sync Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-slate-700/30 rounded-lg">
            <div className="text-2xl font-bold text-cyan-400 mb-1">
              {devices.filter(d => d.status === 'online').length}
            </div>
            <div className="text-sm text-slate-400">Online</div>
          </div>
          <div className="text-center p-4 bg-slate-700/30 rounded-lg">
            <div className="text-2xl font-bold text-yellow-400 mb-1">
              {devices.filter(d => d.status === 'sync').length}
            </div>
            <div className="text-sm text-slate-400">Syncing</div>
          </div>
          <div className="text-center p-4 bg-slate-700/30 rounded-lg">
            <div className="text-2xl font-bold text-slate-400 mb-1">
              {devices.filter(d => d.status === 'offline').length}
            </div>
            <div className="text-sm text-slate-400">Offline</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DevicePanel;