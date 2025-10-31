import React, { useEffect, useState } from 'react';
import { TrendingUp, AlertTriangle, Activity, Zap } from 'lucide-react';
import { useSystem } from '../contexts/SystemContext';

interface PerformanceMetric {
  timestamp: Date;
  cpuUsage: number;
  memoryUsage: number;
}

const MonitoringDashboard: React.FC = () => {
  const { systemStats, refreshSystemStats } = useSystem();
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [alerts, setAlerts] = useState<string[]>([]);

  useEffect(() => {
    const interval = setInterval(async () => {
      await refreshSystemStats();

      if (systemStats) {
        setMetrics(prev => {
          const newMetrics = [
            ...prev,
            {
              timestamp: new Date(),
              cpuUsage: systemStats.cpu_usage,
              memoryUsage: (systemStats.memory_used_gb / systemStats.memory_total_gb) * 100,
            },
          ].slice(-60); // Keep last 60 readings

          // Check for alerts
          const newAlerts = [];
          if (systemStats.cpu_usage > 80) {
            newAlerts.push('⚠️ High CPU usage detected');
          }
          if ((systemStats.memory_used_gb / systemStats.memory_total_gb) > 0.85) {
            newAlerts.push('⚠️ High memory usage');
          }

          setAlerts(newAlerts);

          return newMetrics;
        });
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [systemStats, refreshSystemStats]);

  const avgCpu = metrics.length > 0
    ? metrics.reduce((sum, m) => sum + m.cpuUsage, 0) / metrics.length
    : 0;

  const avgMemory = metrics.length > 0
    ? metrics.reduce((sum, m) => sum + m.memoryUsage, 0) / metrics.length
    : 0;

  const maxCpu = Math.max(...metrics.map(m => m.cpuUsage), 0);
  const maxMemory = Math.max(...metrics.map(m => m.memoryUsage), 0);

  return (
    <div className="space-y-4">
      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert, idx) => (
            <div
              key={idx}
              className="flex items-center space-x-2 p-3 bg-yellow-500/20 border border-yellow-500/50 rounded-lg"
            >
              <AlertTriangle className="h-4 w-4 text-yellow-400" />
              <span className="text-yellow-200 text-sm">{alert}</span>
            </div>
          ))}
        </div>
      )}

      {/* Performance Metrics */}
      <div className="grid grid-cols-2 gap-4">
        {/* CPU Trends */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-slate-300 text-sm">CPU Trends</span>
            <Zap className="h-4 w-4 text-cyan-400" />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Current:</span>
              <span className="text-white font-medium">{systemStats?.cpu_usage.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Average:</span>
              <span className="text-white font-medium">{avgCpu.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Peak:</span>
              <span className="text-white font-medium">{maxCpu.toFixed(1)}%</span>
            </div>
          </div>

          {/* Mini graph */}
          <div className="mt-3 h-12 flex items-end justify-between space-x-1 bg-slate-900/50 p-2 rounded">
            {metrics.slice(-20).map((metric, idx) => (
              <div
                key={idx}
                className="flex-1 bg-cyan-500 rounded-t transition-all"
                style={{
                  height: `${(metric.cpuUsage / 100) * 100}%`,
                  minHeight: '2px',
                }}
              />
            ))}
          </div>
        </div>

        {/* Memory Trends */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-slate-300 text-sm">Memory Trends</span>
            <Activity className="h-4 w-4 text-purple-400" />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Current:</span>
              <span className="text-white font-medium">{avgMemory.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Average:</span>
              <span className="text-white font-medium">{avgMemory.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Peak:</span>
              <span className="text-white font-medium">{maxMemory.toFixed(1)}%</span>
            </div>
          </div>

          {/* Mini graph */}
          <div className="mt-3 h-12 flex items-end justify-between space-x-1 bg-slate-900/50 p-2 rounded">
            {metrics.slice(-20).map((metric, idx) => (
              <div
                key={idx}
                className="flex-1 bg-purple-500 rounded-t transition-all"
                style={{
                  height: `${metric.memoryUsage}%`,
                  minHeight: '2px',
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Health Score */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-slate-300 text-sm">System Health</span>
          <TrendingUp className="h-4 w-4 text-green-400" />
        </div>

        <div className="grid grid-cols-3 gap-3 text-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">
              {Math.round(100 - avgCpu)}
            </div>
            <div className="text-slate-400 text-xs">CPU Health</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">
              {Math.round(100 - avgMemory)}
            </div>
            <div className="text-slate-400 text-xs">Mem Health</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">
              {Math.round((100 - avgCpu + 100 - avgMemory) / 2)}
            </div>
            <div className="text-slate-400 text-xs">Overall</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonitoringDashboard;
