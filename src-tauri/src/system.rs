use serde_json::{json, Value};
use std::fs;
use std::path::Path;
use sysinfo::System;
use tauri::State;
use crate::AppState;

#[derive(serde::Serialize)]
pub struct FileInfo {
    pub name: String,
    pub is_dir: bool,
    pub size: u64,
    pub modified: String,
}

#[derive(serde::Serialize)]
pub struct SystemStats {
    pub cpu_usage: f32,
    pub cpu_cores: usize,
    pub memory_total_gb: f64,
    pub memory_used_gb: f64,
    pub memory_available_gb: f64,
    pub uptime_seconds: u64,
    pub os_name: String,
    pub os_version: String,
}

#[derive(serde::Serialize)]
pub struct ProcessInfo {
    pub pid: u32,
    pub name: String,
    pub memory_mb: f64,
    pub cpu_percent: f32,
}

#[derive(serde::Serialize)]
pub struct DiskInfo {
    pub name: String,
    pub total_gb: f64,
    pub used_gb: f64,
    pub available_gb: f64,
    pub percent_used: f64,
}

#[derive(serde::Serialize)]
pub struct CPUDetails {
    pub model: String,
    pub cores: usize,
    pub frequency_ghz: f64,
}

/// Get comprehensive system statistics
pub async fn get_system_stats(state: &State<AppState>) -> Result<Value, String> {
    let mut sys = System::new_all();
    sys.refresh_all();

    let total_memory = sys.total_memory() as f64 / 1_048_576.0; // Convert KB to GB
    let used_memory = sys.used_memory() as f64 / 1_048_576.0;
    let available_memory = sys.available_memory() as f64 / 1_048_576.0;

    let stats = SystemStats {
        cpu_usage: sys.global_cpu_info().cpu_usage(),
        cpu_cores: sys.cpus().len(),
        memory_total_gb: total_memory,
        memory_used_gb: used_memory,
        memory_available_gb: available_memory,
        uptime_seconds: System::uptime(),
        os_name: System::name().unwrap_or_default(),
        os_version: System::os_version().unwrap_or_default(),
    };

    Ok(serde_json::to_value(stats).unwrap())
}

/// List files in a directory
pub async fn list_directory(path: String) -> Result<Value, String> {
    let path = Path::new(&path);

    if !path.exists() {
        return Err(format!("Path does not exist: {}", path.display()));
    }

    if !path.is_dir() {
        return Err(format!("Path is not a directory: {}", path.display()));
    }

    let mut files = Vec::new();

    match fs::read_dir(path) {
        Ok(entries) => {
            for entry in entries {
                if let Ok(entry) = entry {
                    if let Ok(metadata) = entry.metadata() {
                        if let Some(file_name) = entry.file_name().to_str() {
                            let file_info = FileInfo {
                                name: file_name.to_string(),
                                is_dir: metadata.is_dir(),
                                size: metadata.len(),
                                modified: format!("{:?}", metadata.modified()),
                            };
                            files.push(file_info);
                        }
                    }
                }
            }
            Ok(json!(files))
        }
        Err(e) => Err(format!("Failed to read directory: {}", e)),
    }
}

/// Launch an application
pub async fn launch_app(app_name: String) -> Result<u32, String> {
    // Whitelist of safe applications
    let whitelisted_apps = vec![
        "chrome", "firefox", "safari", "edge",
        "notepad", "calculator", "terminal",
        "code", "vscode"
    ];

    let app_lower = app_name.to_lowercase();

    // Check if app is in whitelist
    let is_whitelisted = whitelisted_apps.iter().any(|&app| {
        app_lower.contains(app) || app_name.contains(app)
    });

    if !is_whitelisted {
        return Err(format!(
            "Application '{}' is not whitelisted. Whitelisted apps: {:?}",
            app_name, whitelisted_apps
        ));
    }

    // Platform-specific command execution
    #[cfg(target_os = "windows")]
    {
        match std::process::Command::new("cmd")
            .args(&["/C", "start", &app_name])
            .spawn()
        {
            Ok(child) => {
                if let Ok(id) = child.id().try_into() {
                    Ok(id)
                } else {
                    Err("Failed to get process ID".to_string())
                }
            }
            Err(e) => Err(format!("Failed to launch app: {}", e)),
        }
    }

    #[cfg(target_os = "macos")]
    {
        match std::process::Command::new("open")
            .args(&["-a", &app_name])
            .spawn()
        {
            Ok(child) => {
                if let Ok(id) = child.id().try_into() {
                    Ok(id)
                } else {
                    Err("Failed to get process ID".to_string())
                }
            }
            Err(e) => Err(format!("Failed to launch app: {}", e)),
        }
    }

    #[cfg(target_os = "linux")]
    {
        match std::process::Command::new(&app_name)
            .spawn()
        {
            Ok(child) => {
                if let Ok(id) = child.id().try_into() {
                    Ok(id)
                } else {
                    Err("Failed to get process ID".to_string())
                }
            }
            Err(e) => Err(format!("Failed to launch app: {}", e)),
        }
    }

    #[cfg(not(any(target_os = "windows", target_os = "macos", target_os = "linux")))]
    {
        Err("Unsupported platform".to_string())
    }
}

/// Get list of running processes
pub async fn get_running_processes() -> Result<Value, String> {
    let mut sys = System::new_all();
    sys.refresh_all();

    let mut processes = Vec::new();

    for (pid, process) in sys.processes() {
        let process_info = ProcessInfo {
            pid: pid.as_u32(),
            name: process.name().to_string(),
            memory_mb: process.memory() as f64 / 1024.0,
            cpu_percent: process.cpu_usage(),
        };
        processes.push(process_info);
    }

    // Sort by memory usage (descending)
    processes.sort_by(|a, b| b.memory_mb.partial_cmp(&a.memory_mb).unwrap());

    Ok(serde_json::to_value(processes).unwrap())
}

/// Get disk usage information
pub async fn get_disk_info() -> Result<Value, String> {
    let disks = sysinfo::Disks::new_with_refreshed_list();

    let mut disk_info = Vec::new();

    for disk in disks.list() {
        let total_gb = disk.total_space() as f64 / 1_000_000_000.0;
        let available_gb = disk.available_space() as f64 / 1_000_000_000.0;
        let used_gb = total_gb - available_gb;
        let percent_used = if total_gb > 0.0 {
            (used_gb / total_gb) * 100.0
        } else {
            0.0
        };

        disk_info.push(DiskInfo {
            name: disk.mount_point().display().to_string(),
            total_gb,
            used_gb,
            available_gb,
            percent_used,
        });
    }

    Ok(serde_json::to_value(disk_info).unwrap())
}

/// Get detailed CPU information
pub async fn get_cpu_details() -> Result<Value, String> {
    let mut sys = System::new_all();
    sys.refresh_all();

    let cpus = sys.cpus();
    if cpus.is_empty() {
        return Err("No CPU information available".to_string());
    }

    let cpu = &cpus[0];

    let cpu_details = CPUDetails {
        model: cpu.brand().to_string(),
        cores: sys.cpus().len(),
        frequency_ghz: cpu.frequency() as f64 / 1000.0,
    };

    Ok(serde_json::to_value(cpu_details).unwrap())
}

/// Kill a process by PID
pub async fn kill_process(pid: u32) -> Result<bool, String> {
    // Safety check: prevent killing critical system processes
    let protected_processes = vec!["svchost", "system", "kernel", "aria"];

    let mut sys = System::new_all();
    sys.refresh_processes(sysinfo::ProcessRefreshKind::everything());

    if let Some(process) = sys.process(sysinfo::Pid::from_u32(pid)) {
        let process_name = process.name().to_lowercase();

        if protected_processes.iter().any(|&p| process_name.contains(p)) {
            return Err(format!("Cannot kill protected process: {}", process.name()));
        }

        // Use platform-specific kill command
        #[cfg(target_os = "windows")]
        {
            match std::process::Command::new("taskkill")
                .args(&["/PID", &pid.to_string(), "/F"])
                .output()
            {
                Ok(output) => {
                    if output.status.success() {
                        Ok(true)
                    } else {
                        Err(format!("Failed to kill process: {:?}", String::from_utf8_lossy(&output.stderr)))
                    }
                }
                Err(e) => Err(format!("Error killing process: {}", e)),
            }
        }

        #[cfg(target_os = "macos")]
        {
            match std::process::Command::new("kill")
                .args(&["-9", &pid.to_string()])
                .output()
            {
                Ok(output) => {
                    if output.status.success() {
                        Ok(true)
                    } else {
                        Err(format!("Failed to kill process: {:?}", String::from_utf8_lossy(&output.stderr)))
                    }
                }
                Err(e) => Err(format!("Error killing process: {}", e)),
            }
        }

        #[cfg(target_os = "linux")]
        {
            match std::process::Command::new("kill")
                .args(&["-9", &pid.to_string()])
                .output()
            {
                Ok(output) => {
                    if output.status.success() {
                        Ok(true)
                    } else {
                        Err(format!("Failed to kill process: {:?}", String::from_utf8_lossy(&output.stderr)))
                    }
                }
                Err(e) => Err(format!("Error killing process: {}", e)),
            }
        }

        #[cfg(not(any(target_os = "windows", target_os = "macos", target_os = "linux")))]
        {
            Err("Unsupported platform".to_string())
        }
    } else {
        Err(format!("Process with PID {} not found", pid))
    }
}

/// Read a file's contents
pub async fn read_file(path: String) -> Result<String, String> {
    let path_obj = Path::new(&path);

    // Security: prevent reading system files
    let forbidden_paths = vec!["/etc/passwd", "/etc/shadow", "C:\\Windows\\System32\\config"];

    if forbidden_paths.iter().any(|&p| path.contains(p)) {
        return Err("Access denied: cannot read system files".to_string());
    }

    match fs::read_to_string(path_obj) {
        Ok(content) => {
            if content.len() > 10_000_000 {
                Err("File too large (max 10MB)".to_string())
            } else {
                Ok(content)
            }
        }
        Err(e) => Err(format!("Failed to read file: {}", e)),
    }
}

/// Write content to a file
pub async fn write_file(path: String, content: String) -> Result<bool, String> {
    let path_obj = Path::new(&path);

    // Create parent directories if needed
    if let Some(parent) = path_obj.parent() {
        if !parent.exists() {
            if let Err(e) = fs::create_dir_all(parent) {
                return Err(format!("Failed to create directories: {}", e));
            }
        }
    }

    match fs::write(path_obj, content) {
        Ok(_) => Ok(true),
        Err(e) => Err(format!("Failed to write file: {}", e)),
    }
}

/// Delete a file
pub async fn delete_file(path: String) -> Result<bool, String> {
    let path_obj = Path::new(&path);

    // Verify file exists and is a file (not directory)
    if !path_obj.exists() {
        return Err(format!("File does not exist: {}", path));
    }

    if path_obj.is_dir() {
        return Err("Cannot delete directories with this command".to_string());
    }

    match fs::remove_file(path_obj) {
        Ok(_) => Ok(true),
        Err(e) => Err(format!("Failed to delete file: {}", e)),
    }
}
