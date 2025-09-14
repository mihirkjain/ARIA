import React, { useState, useEffect } from 'react';
import { Cpu, HardDrive, Zap, Thermometer } from 'lucide-react';

interface SystemStats {
  cpu: number;
  gpu: number;
  ram: number;
  temperature: number;
  diskUsage: number;
}

const SystemMonitor: React.FC = () => {
  const [stats, setStats] = useState<SystemStats>({
    cpu: 0,
    gpu: 0,
    ram: 0,
    temperature: 0,
    diskUsage: 0,
  });

  useEffect(() => {
    const updateStats = () => {
      setStats({
        cpu: Math.floor(Math.random() * 100),
        gpu: Math.floor(Math.random() * 100),
        ram: Math.floor(Math.random() * 100),
        temperature: Math.floor(Math.random() * 30 + 45),
        diskUsage: Math.floor(Math.random() * 100),
      });
    };

    updateStats();
    const interval = setInterval(updateStats, 3000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (value: number) => {
    if (value > 80) return 'text-red-400 bg-red-500/20';
    if (value > 60) return 'text-yellow-400 bg-yellow-500/20';
    return 'text-emerald-400 bg-emerald-500/20';
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
      <h3 className="text-lg font-semibold text-white mb-4">System Monitor</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Cpu className="h-4 w-4 text-cyan-400" />
            <span className="text-sm text-slate-300">CPU</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex-1 bg-slate-700 rounded-full h-2">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  stats.cpu > 80 ? 'bg-red-400' :
                  stats.cpu > 60 ? 'bg-yellow-400' : 'bg-emerald-400'
                }`}
                style={{ width: `${stats.cpu}%` }}
              ></div>
            </div>
            <span className={`text-sm font-semibold ${getStatusColor(stats.cpu)}`}>
              {stats.cpu}%
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Zap className="h-4 w-4 text-purple-400" />
            <span className="text-sm text-slate-300">GPU</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex-1 bg-slate-700 rounded-full h-2">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  stats.gpu > 80 ? 'bg-red-400' :
                  stats.gpu > 60 ? 'bg-yellow-400' : 'bg-purple-400'
                }`}
                style={{ width: `${stats.gpu}%` }}
              ></div>
            </div>
            <span className={`text-sm font-semibold ${getStatusColor(stats.gpu)}`}>
              {stats.gpu}%
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <HardDrive className="h-4 w-4 text-blue-400" />
            <span className="text-sm text-slate-300">RAM</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex-1 bg-slate-700 rounded-full h-2">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  stats.ram > 80 ? 'bg-red-400' :
                  stats.ram > 60 ? 'bg-yellow-400' : 'bg-blue-400'
                }`}
                style={{ width: `${stats.ram}%` }}
              ></div>
            </div>
            <span className={`text-sm font-semibold ${getStatusColor(stats.ram)}`}>
              {stats.ram}%
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Thermometer className="h-4 w-4 text-orange-400" />
            <span className="text-sm text-slate-300">Temp</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex-1 bg-slate-700 rounded-full h-2">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  stats.temperature > 70 ? 'bg-red-400' :
                  stats.temperature > 60 ? 'bg-yellow-400' : 'bg-orange-400'
                }`}
                style={{ width: `${(stats.temperature - 30) * 2}%` }}
              ></div>
            </div>
            <span className={`text-sm font-semibold ${
              stats.temperature > 70 ? 'text-red-400' :
              stats.temperature > 60 ? 'text-yellow-400' : 'text-orange-400'
            }`}>
              {stats.temperature}°C
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemMonitor;