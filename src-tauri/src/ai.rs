use serde_json::{json, Value};
use reqwest::Client;

const PYTHON_AI_SERVICE_URL: &str = "http://localhost:8000";

#[derive(serde::Serialize, serde::Deserialize)]
pub struct ChatRequest {
    pub message: String,
    pub use_local: bool,
    pub fallback_to_cloud: bool,
}

#[derive(serde::Serialize, serde::Deserialize)]
pub struct ChatResponse {
    pub response: String,
    pub source: String,
    pub model: String,
}

#[derive(serde::Serialize, serde::Deserialize)]
pub struct AIStatus {
    pub ollama_running: bool,
    pub ollama_models: Vec<String>,
    pub cloud_api_available: bool,
    pub cloud_api_type: String,
}

#[derive(serde::Serialize, serde::Deserialize)]
pub struct AIConfig {
    pub local_model: String,
    pub cloud_api_key: String,
    pub cloud_api_type: String, // "openai" or "anthropic"
    pub use_local_first: bool,
}

/// Send chat message to Python FastAPI backend
pub async fn chat_message(
    message: String,
    use_local: bool,
    fallback_to_cloud: bool,
) -> Result<String, String> {
    let client = Client::new();

    let request_body = json!({
        "message": message,
        "use_local": use_local,
        "fallback_to_cloud": fallback_to_cloud,
    });

    match client
        .post(&format!("{}/api/chat", PYTHON_AI_SERVICE_URL))
        .json(&request_body)
        .timeout(std::time::Duration::from_secs(60))
        .send()
        .await
    {
        Ok(response) => {
            match response.json::<ChatResponse>().await {
                Ok(chat_response) => Ok(serde_json::to_string(&chat_response).unwrap()),
                Err(e) => Err(format!("Failed to parse response: {}", e)),
            }
        }
        Err(e) => {
            // If connection fails to Python backend, return error
            Err(format!("Connection to AI service failed: {}. Make sure python-backend is running on localhost:8000", e))
        }
    }
}

/// Get status of AI services (Ollama, cloud APIs)
pub async fn get_ai_status() -> Result<Value, String> {
    let client = Client::new();

    match client
        .get(&format!("{}/api/ai/status", PYTHON_AI_SERVICE_URL))
        .timeout(std::time::Duration::from_secs(10))
        .send()
        .await
    {
        Ok(response) => {
            match response.json::<AIStatus>().await {
                Ok(status) => Ok(json!(status)),
                Err(e) => Err(format!("Failed to parse status: {}", e)),
            }
        }
        Err(e) => {
            // Return error status if backend is not running
            Ok(json!({
                "error": format!("AI service not available: {}", e),
                "ollama_running": false,
                "cloud_api_available": false
            }))
        }
    }
}

/// Configure AI preferences (model selection, API keys)
pub async fn configure_ai(preferences: Value) -> Result<bool, String> {
    let client = Client::new();

    match client
        .post(&format!("{}/api/ai/config", PYTHON_AI_SERVICE_URL))
        .json(&preferences)
        .timeout(std::time::Duration::from_secs(10))
        .send()
        .await
    {
        Ok(response) => {
            if response.status().is_success() {
                Ok(true)
            } else {
                Err(format!(
                    "Server returned error: {}",
                    response.status()
                ))
            }
        }
        Err(e) => Err(format!("Configuration request failed: {}", e)),
    }
}
