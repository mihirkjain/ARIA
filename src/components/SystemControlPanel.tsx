import React, { useEffect, useState } from 'react';
import { Cpu, HardDrive, Zap, AlertCircle, RefreshCw, Trash2, Volume2 } from 'lucide-react';
import { useSystem } from '../contexts/SystemContext';

const SystemControlPanel: React.FC = () => {
  const {
    systemStats,
    processes,
    disks,
    cpuDetails,
    commandHistory,
    isLoading,
    error,
    refreshSystemStats,
    refreshProcesses,
    refreshDisks,
    refreshCPU,
    killProcess,
    clearError,
  } = useSystem();

  const [activeTab, setActiveTab] = useState<'overview' | 'processes' | 'storage' | 'history'>('overview');
  const [selectedProcesses, setSelectedProcesses] = useState<Set<number>>(new Set());

  useEffect(() => {
    refreshSystemStats();
    refreshCPU();
    refreshDisks();
    refreshProcesses();

    const interval = setInterval(() => {
      refreshSystemStats();
    }, 3000);

    return () => clearInterval(interval);
  }, [refreshSystemStats, refreshCPU, refreshDisks, refreshProcesses]);

  const handleKillProcess = async (pid: number, name: string) => {
    if (confirm(`Are you sure you want to kill process ${name} (PID: ${pid})?`)) {
      await killProcess(pid, name);
    }
  };

  const cpuPercent = systemStats?.cpu_usage || 0;
  const memPercent = systemStats
    ? (systemStats.memory_used_gb / systemStats.memory_total_gb) * 100
    : 0;

  return (
    <div className="space-y-4">
      {/* Error Alert */}
      {error && (
        <div className="flex items-center justify-between p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <span className="text-red-200">{error}</span>
          </div>
          <button
            onClick={clearError}
            className="text-red-400 hover:text-red-300"
          >
            ✕
          </button>
        </div>
      )}

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          {/* System Stats Cards */}
          {systemStats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* CPU Card */}
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-300 text-sm">CPU Usage</span>
                  <Zap className="h-4 w-4 text-cyan-400" />
                </div>
                <div className="text-2xl font-bold text-white mb-2">{cpuPercent.toFixed(1)}%</div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all"
                    style={{ width: `${Math.min(cpuPercent, 100)}%` }}
                  />
                </div>
              </div>

              {/* Memory Card */}
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-300 text-sm">Memory</span>
                  <Cpu className="h-4 w-4 text-purple-400" />
                </div>
                <div className="text-2xl font-bold text-white mb-2">
                  {systemStats.memory_used_gb.toFixed(1)} GB / {systemStats.memory_total_gb.toFixed(1)} GB
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all"
                    style={{ width: `${Math.min(memPercent, 100)}%` }}
                  />
                </div>
              </div>

              {/* System Info Card */}
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-300 text-sm">System</span>
                  <Volume2 className="h-4 w-4 text-green-400" />
                </div>
                <div className="space-y-1 text-sm">
                  <div className="text-white">{systemStats.os_name}</div>
                  <div className="text-slate-400">{cpuDetails?.cores} cores @ {cpuDetails?.frequency_ghz.toFixed(1)} GHz</div>
                </div>
              </div>
            </div>
          )}

          {/* CPU Details */}
          {cpuDetails && (
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">CPU Details</h3>
                <button
                  onClick={refreshCPU}
                  disabled={isLoading}
                  className="p-2 hover:bg-slate-700/50 rounded-lg transition-all disabled:opacity-50"
                >
                  <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-400">Model:</span>
                  <div className="text-white font-medium">{cpuDetails.model}</div>
                </div>
                <div>
                  <span className="text-slate-400">Cores:</span>
                  <div className="text-white font-medium">{cpuDetails.cores}</div>
                </div>
                <div>
                  <span className="text-slate-400">Frequency:</span>
                  <div className="text-white font-medium">{cpuDetails.frequency_ghz.toFixed(2)} GHz</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Processes Tab */}
      {activeTab === 'processes' && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Running Processes</h3>
            <button
              onClick={refreshProcesses}
              disabled={isLoading}
              className="p-2 hover:bg-slate-700/50 rounded-lg transition-all disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-2 px-2 text-slate-400">Process Name</th>
                  <th className="text-right py-2 px-2 text-slate-400">PID</th>
                  <th className="text-right py-2 px-2 text-slate-400">Memory</th>
                  <th className="text-right py-2 px-2 text-slate-400">CPU %</th>
                  <th className="text-center py-2 px-2 text-slate-400">Action</th>
                </tr>
              </thead>
              <tbody>
                {processes.slice(0, 20).map((proc) => (
                  <tr key={proc.pid} className="border-b border-slate-700/50 hover:bg-slate-700/20">
                    <td className="py-2 px-2 text-white truncate">{proc.name}</td>
                    <td className="py-2 px-2 text-slate-400 text-right">{proc.pid}</td>
                    <td className="py-2 px-2 text-slate-400 text-right">{proc.memory_mb.toFixed(1)} MB</td>
                    <td className="py-2 px-2 text-slate-400 text-right">{proc.cpu_percent.toFixed(1)}%</td>
                    <td className="py-2 px-2 text-center">
                      <button
                        onClick={() => handleKillProcess(proc.pid, proc.name)}
                        className="p-1 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded transition-all"
                        title="Kill process"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Storage Tab */}
      {activeTab === 'storage' && (
        <div className="space-y-4">
          {disks.map((disk) => (
            <div key={disk.name} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-medium">{disk.name}</span>
                <span className="text-slate-400 text-sm">{disk.percent_used.toFixed(1)}% full</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-3 mb-2">
                <div
                  className={`h-3 rounded-full transition-all ${
                    disk.percent_used > 90
                      ? 'bg-red-500'
                      : disk.percent_used > 70
                      ? 'bg-yellow-500'
                      : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(disk.percent_used, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-slate-400">
                <span>Used: {disk.used_gb.toFixed(1)} GB</span>
                <span>Total: {disk.total_gb.toFixed(1)} GB</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 max-h-96 overflow-y-auto">
          <h3 className="text-lg font-semibold text-white mb-4">Command History</h3>
          {commandHistory.length === 0 ? (
            <div className="text-center text-slate-400 py-8">No commands executed yet</div>
          ) : (
            <div className="space-y-2">
              {commandHistory.map((cmd) => (
                <div key={cmd.id} className="text-sm border-l-2 border-slate-600 pl-3 py-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-white">{cmd.name}</span>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        cmd.status === 'completed'
                          ? 'bg-green-500/20 text-green-400'
                          : cmd.status === 'failed'
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}
                    >
                      {cmd.status}
                    </span>
                  </div>
                  <div className="text-slate-400 text-xs mt-1">{cmd.description}</div>
                  <div className="text-slate-500 text-xs">{cmd.timestamp.toLocaleTimeString()}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex space-x-2 bg-slate-800/50 border border-slate-700 rounded-xl p-2">
        {(['overview', 'processes', 'storage', 'history'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg transition-all capitalize ${
              activeTab === tab
                ? 'bg-cyan-500/30 text-cyan-400 border border-cyan-500/50'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SystemControlPanel;
