import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  invokeGetSystemStats,
  invokeGetRunningProcesses,
  invokeGetDiskInfo,
  invokeGetCPUDetails,
  invokeKillProcess,
  invokeReadFile,
  invokeWriteFile,
  invokeDeleteFile,
  ProcessInfo,
  DiskInfo,
  CPUDetails,
  SystemStats,
} from '../utils/tauriUtils';

export interface SystemCommand {
  id: string;
  name: string;
  description: string;
  timestamp: Date;
  status: 'pending' | 'executing' | 'completed' | 'failed';
  result?: string;
}

interface SystemContextType {
  systemStats: SystemStats | null;
  processes: ProcessInfo[];
  disks: DiskInfo[];
  cpuDetails: CPUDetails | null;
  commandHistory: SystemCommand[];
  isLoading: boolean;
  error: string | null;

  // Actions
  refreshSystemStats: () => Promise<void>;
  refreshProcesses: () => Promise<void>;
  refreshDisks: () => Promise<void>;
  refreshCPU: () => Promise<void>;
  killProcess: (pid: number, name: string) => Promise<void>;
  readFile: (path: string) => Promise<string>;
  writeFile: (path: string, content: string) => Promise<void>;
  deleteFile: (path: string) => Promise<void>;
  clearError: () => void;
}

const SystemContext = createContext<SystemContextType | undefined>(undefined);

export function SystemProvider({ children }: { children: React.ReactNode }) {
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [processes, setProcesses] = useState<ProcessInfo[]>([]);
  const [disks, setDisks] = useState<DiskInfo[]>([]);
  const [cpuDetails, setCpuDetails] = useState<CPUDetails | null>(null);
  const [commandHistory, setCommandHistory] = useState<SystemCommand[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addCommand = useCallback((
    name: string,
    description: string,
    status: SystemCommand['status'],
    result?: string
  ) => {
    const command: SystemCommand = {
      id: Date.now().toString(),
      name,
      description,
      timestamp: new Date(),
      status,
      result,
    };

    setCommandHistory(prev => [command, ...prev].slice(0, 50)); // Keep last 50
  }, []);

  const refreshSystemStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const stats = await invokeGetSystemStats();
      setSystemStats(stats);
      addCommand('System Stats', 'Refreshed system statistics', 'completed');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      addCommand('System Stats', 'Failed to refresh stats', 'failed', errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, [addCommand]);

  const refreshProcesses = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const procs = await invokeGetRunningProcesses();
      setProcesses(procs);
      addCommand('Processes', `Retrieved ${procs.length} running processes`, 'completed');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      addCommand('Processes', 'Failed to get processes', 'failed', errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, [addCommand]);

  const refreshDisks = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const diskInfo = await invokeGetDiskInfo();
      setDisks(diskInfo);
      addCommand('Disks', `Retrieved info for ${diskInfo.length} disk(s)`, 'completed');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      addCommand('Disks', 'Failed to get disk info', 'failed', errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, [addCommand]);

  const refreshCPU = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const cpu = await invokeGetCPUDetails();
      setCpuDetails(cpu);
      addCommand('CPU', `Retrieved CPU details (${cpu.cores} cores)`, 'completed');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      addCommand('CPU', 'Failed to get CPU details', 'failed', errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, [addCommand]);

  const killProcess = useCallback(async (pid: number, name: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await invokeKillProcess(pid);
      addCommand('Kill Process', `Killed process ${name} (PID: ${pid})`, 'completed');
      // Refresh processes list
      await refreshProcesses();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      addCommand('Kill Process', `Failed to kill ${name}`, 'failed', errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, [addCommand, refreshProcesses]);

  const readFile = useCallback(async (path: string): Promise<string> => {
    setIsLoading(true);
    setError(null);

    try {
      const content = await invokeReadFile(path);
      addCommand('Read File', `Read file: ${path}`, 'completed');
      return content;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      addCommand('Read File', `Failed to read ${path}`, 'failed', errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [addCommand]);

  const writeFile = useCallback(async (path: string, content: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await invokeWriteFile(path, content);
      addCommand('Write File', `Wrote to file: ${path}`, 'completed');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      addCommand('Write File', `Failed to write to ${path}`, 'failed', errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [addCommand]);

  const deleteFile = useCallback(async (path: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await invokeDeleteFile(path);
      addCommand('Delete File', `Deleted file: ${path}`, 'completed');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      addCommand('Delete File', `Failed to delete ${path}`, 'failed', errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [addCommand]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value: SystemContextType = {
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
    readFile,
    writeFile,
    deleteFile,
    clearError,
  };

  return (
    <SystemContext.Provider value={value}>
      {children}
    </SystemContext.Provider>
  );
}

export const useSystem = () => {
  const context = useContext(SystemContext);
  if (!context) {
    throw new Error('useSystem must be used within SystemProvider');
  }
  return context;
};
