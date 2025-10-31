// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use sysinfo::System;
use std::sync::Mutex;
use tauri::State;

mod ai;
mod system;

use ai::{chat_message, get_ai_status, configure_ai};
use system::{
    get_system_stats, list_directory, launch_app, get_running_processes,
    get_disk_info, get_cpu_details, kill_process, read_file, write_file, delete_file
};

#[derive(Default)]
pub struct AppState {
    system: Mutex<System>,
}

#[tauri::command]
async fn invoke_send_chat(
    message: String,
    use_local: bool,
    fallback_to_cloud: bool,
    state: State<'_, AppState>,
) -> Result<String, String> {
    chat_message(message, use_local, fallback_to_cloud).await
}

#[tauri::command]
async fn invoke_get_ai_status() -> Result<serde_json::Value, String> {
    get_ai_status().await
}

#[tauri::command]
async fn invoke_configure_ai(preferences: serde_json::Value) -> Result<bool, String> {
    configure_ai(preferences).await
}

#[tauri::command]
async fn invoke_get_system_stats(state: State<'_, AppState>) -> Result<serde_json::Value, String> {
    get_system_stats(&state).await
}

#[tauri::command]
async fn invoke_list_directory(path: String) -> Result<serde_json::Value, String> {
    list_directory(path).await
}

#[tauri::command]
async fn invoke_launch_app(app_name: String) -> Result<u32, String> {
    launch_app(app_name).await
}

#[tauri::command]
async fn invoke_get_running_processes() -> Result<serde_json::Value, String> {
    get_running_processes().await
}

#[tauri::command]
async fn invoke_get_disk_info() -> Result<serde_json::Value, String> {
    get_disk_info().await
}

#[tauri::command]
async fn invoke_get_cpu_details() -> Result<serde_json::Value, String> {
    get_cpu_details().await
}

#[tauri::command]
async fn invoke_kill_process(pid: u32) -> Result<bool, String> {
    kill_process(pid).await
}

#[tauri::command]
async fn invoke_read_file(path: String) -> Result<String, String> {
    read_file(path).await
}

#[tauri::command]
async fn invoke_write_file(path: String, content: String) -> Result<bool, String> {
    write_file(path, content).await
}

#[tauri::command]
async fn invoke_delete_file(path: String) -> Result<bool, String> {
    delete_file(path).await
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

fn main() {
    tauri::Builder::default()
        .manage(AppState::default())
        .invoke_handler(tauri::generate_handler![
            invoke_send_chat,
            invoke_get_ai_status,
            invoke_configure_ai,
            invoke_get_system_stats,
            invoke_list_directory,
            invoke_launch_app,
            invoke_get_running_processes,
            invoke_get_disk_info,
            invoke_get_cpu_details,
            invoke_kill_process,
            invoke_read_file,
            invoke_write_file,
            invoke_delete_file,
            greet
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
