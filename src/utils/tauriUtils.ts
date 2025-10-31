/**
 * Tauri Command Wrappers
 * Provides typed interfaces to invoke Tauri backend commands
 */

// Type definitions for Tauri command responses

export interface ChatResponse {
  response: string;
  source: 'local' | 'cloud';
  model: string;
  latency_ms: number;
}

export interface AIStatus {
  ollama_running: boolean;
  available_local_models: string[];
  cloud_api_available: boolean;
  cloud_api_type: string;
  error?: string;
}

export interface AIPreferences {
  local_model?: string;
  cloud_api_type?: string;
  cloud_api_key?: string;
  use_local_first?: boolean;
}

export interface SystemStats {
  cpu_usage: number;
  cpu_cores: number;
  memory_total_gb: number;
  memory_used_gb: number;
  memory_available_gb: number;
  uptime_seconds: number;
  os_name: string;
  os_version: string;
}

export interface FileInfo {
  name: string;
  is_dir: boolean;
  size: number;
  modified: string;
}

export interface ProcessInfo {
  pid: number;
  name: string;
  memory_mb: number;
  cpu_percent: number;
}

export interface DiskInfo {
  name: string;
  total_gb: number;
  used_gb: number;
  available_gb: number;
  percent_used: number;
}

export interface CPUDetails {
  model: string;
  cores: number;
  frequency_ghz: number;
}

/**
 * Check if Tauri is available (app is running as desktop app)
 */
export function isTauriAvailable(): boolean {
  try {
    // @ts-ignore - Tauri window object
    return !!window.__TAURI__;
  } catch {
    return false;
  }
}

/**
 * Send chat message to AI backend via Tauri
 */
export async function invokeSendChat(
  message: string,
  useLocal: boolean = true,
  fallbackToCloud: boolean = true
): Promise<ChatResponse> {
  if (!isTauriAvailable()) {
    throw new Error('Tauri not available. Make sure you are running as a desktop app.');
  }

  try {
    // @ts-ignore - Tauri invoke
    const response = await window.__TAURI__.invoke<ChatResponse>(
      'invoke_send_chat',
      {
        message,
        use_local: useLocal,
        fallback_to_cloud: fallbackToCloud,
      }
    );
    return response;
  } catch (error) {
    throw new Error(`Chat failed: ${error}`);
  }
}

/**
 * Get AI services status
 */
export async function invokeGetAIStatus(): Promise<AIStatus> {
  if (!isTauriAvailable()) {
    throw new Error('Tauri not available');
  }

  try {
    // @ts-ignore - Tauri invoke
    const status = await window.__TAURI__.invoke<AIStatus>(
      'invoke_get_ai_status'
    );
    return status;
  } catch (error) {
    throw new Error(`Failed to get AI status: ${error}`);
  }
}

/**
 * Configure AI preferences
 */
export async function invokeConfigureAI(
  preferences: AIPreferences
): Promise<boolean> {
  if (!isTauriAvailable()) {
    throw new Error('Tauri not available');
  }

  try {
    // @ts-ignore - Tauri invoke
    const result = await window.__TAURI__.invoke<boolean>(
      'invoke_configure_ai',
      preferences
    );
    return result;
  } catch (error) {
    throw new Error(`Configuration failed: ${error}`);
  }
}

/**
 * Get system statistics
 */
export async function invokeGetSystemStats(): Promise<SystemStats> {
  if (!isTauriAvailable()) {
    throw new Error('Tauri not available');
  }

  try {
    // @ts-ignore - Tauri invoke
    const stats = await window.__TAURI__.invoke<SystemStats>(
      'invoke_get_system_stats'
    );
    return stats;
  } catch (error) {
    throw new Error(`Failed to get system stats: ${error}`);
  }
}

/**
 * List files in a directory
 */
export async function invokeListDirectory(path: string): Promise<FileInfo[]> {
  if (!isTauriAvailable()) {
    throw new Error('Tauri not available');
  }

  try {
    // @ts-ignore - Tauri invoke
    const files = await window.__TAURI__.invoke<FileInfo[]>(
      'invoke_list_directory',
      { path }
    );
    return files;
  } catch (error) {
    throw new Error(`Failed to list directory: ${error}`);
  }
}

/**
 * Launch an application
 */
export async function invokeLaunchApp(appName: string): Promise<number> {
  if (!isTauriAvailable()) {
    throw new Error('Tauri not available');
  }

  try {
    // @ts-ignore - Tauri invoke
    const pid = await window.__TAURI__.invoke<number>(
      'invoke_launch_app',
      { app_name: appName }
    );
    return pid;
  } catch (error) {
    throw new Error(`Failed to launch app: ${error}`);
  }
}

/**
 * Get running processes
 */
export async function invokeGetRunningProcesses(): Promise<ProcessInfo[]> {
  if (!isTauriAvailable()) {
    throw new Error('Tauri not available');
  }

  try {
    // @ts-ignore - Tauri invoke
    const processes = await window.__TAURI__.invoke<ProcessInfo[]>(
      'invoke_get_running_processes'
    );
    return processes;
  } catch (error) {
    throw new Error(`Failed to get processes: ${error}`);
  }
}

/**
 * Get disk information
 */
export async function invokeGetDiskInfo(): Promise<DiskInfo[]> {
  if (!isTauriAvailable()) {
    throw new Error('Tauri not available');
  }

  try {
    // @ts-ignore - Tauri invoke
    const disks = await window.__TAURI__.invoke<DiskInfo[]>(
      'invoke_get_disk_info'
    );
    return disks;
  } catch (error) {
    throw new Error(`Failed to get disk info: ${error}`);
  }
}

/**
 * Get CPU details
 */
export async function invokeGetCPUDetails(): Promise<CPUDetails> {
  if (!isTauriAvailable()) {
    throw new Error('Tauri not available');
  }

  try {
    // @ts-ignore - Tauri invoke
    const cpu = await window.__TAURI__.invoke<CPUDetails>(
      'invoke_get_cpu_details'
    );
    return cpu;
  } catch (error) {
    throw new Error(`Failed to get CPU details: ${error}`);
  }
}

/**
 * Kill a process by PID
 */
export async function invokeKillProcess(pid: number): Promise<boolean> {
  if (!isTauriAvailable()) {
    throw new Error('Tauri not available');
  }

  try {
    // @ts-ignore - Tauri invoke
    const result = await window.__TAURI__.invoke<boolean>(
      'invoke_kill_process',
      { pid }
    );
    return result;
  } catch (error) {
    throw new Error(`Failed to kill process: ${error}`);
  }
}

/**
 * Read a file's contents
 */
export async function invokeReadFile(path: string): Promise<string> {
  if (!isTauriAvailable()) {
    throw new Error('Tauri not available');
  }

  try {
    // @ts-ignore - Tauri invoke
    const content = await window.__TAURI__.invoke<string>(
      'invoke_read_file',
      { path }
    );
    return content;
  } catch (error) {
    throw new Error(`Failed to read file: ${error}`);
  }
}

/**
 * Write content to a file
 */
export async function invokeWriteFile(path: string, content: string): Promise<boolean> {
  if (!isTauriAvailable()) {
    throw new Error('Tauri not available');
  }

  try {
    // @ts-ignore - Tauri invoke
    const result = await window.__TAURI__.invoke<boolean>(
      'invoke_write_file',
      { path, content }
    );
    return result;
  } catch (error) {
    throw new Error(`Failed to write file: ${error}`);
  }
}

/**
 * Delete a file
 */
export async function invokeDeleteFile(path: string): Promise<boolean> {
  if (!isTauriAvailable()) {
    throw new Error('Tauri not available');
  }

  try {
    // @ts-ignore - Tauri invoke
    const result = await window.__TAURI__.invoke<boolean>(
      'invoke_delete_file',
      { path }
    );
    return result;
  } catch (error) {
    throw new Error(`Failed to delete file: ${error}`);
  }
}
