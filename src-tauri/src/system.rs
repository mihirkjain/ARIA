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
