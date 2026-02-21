use crate::services::ai::{AIConfig, AIProvider, AIService};
use serde::{Deserialize, Serialize};
use tauri::State;

/// AI 配置 DTO
#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AIConfigDTO {
    pub provider: String,
    pub glm_api_key: Option<String>,
    pub deepseek_api_key: Option<String>,
    pub model: String,
}

/// 获取 AI 配置
#[tauri::command]
pub async fn get_ai_config(ai: State<'_, AIService>) -> Result<serde_json::Value, String> {
    let config = ai.get_config().await;
    Ok(serde_json::json!({
        "provider": match config.provider {
            AIProvider::GLM => "glm",
            AIProvider::DeepSeek => "deepseek",
        },
        "glmApiKey": config.glm_api_key,
        "deepseekApiKey": config.deepseek_api_key,
        "model": config.model,
    }))
}

/// 设置 AI 配置
#[tauri::command]
pub async fn set_ai_config(config: AIConfigDTO, ai: State<'_, AIService>) -> Result<(), String> {
    let provider = match config.provider.as_str() {
        "glm" => AIProvider::GLM,
        "deepseek" => AIProvider::DeepSeek,
        _ => return Err("无效的 AI 提供商".to_string()),
    };

    ai.set_config(AIConfig {
        provider,
        glm_api_key: config.glm_api_key,
        deepseek_api_key: config.deepseek_api_key,
        model: config.model,
    })
    .await;

    Ok(())
}

/// 生成大纲请求
#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GenerateOutlineRequest {
    pub title: String,
    pub description: String,
}

/// 生成大纲
#[tauri::command]
pub async fn generate_outline(
    request: GenerateOutlineRequest,
    ai: State<'_, AIService>,
) -> Result<String, String> {
    ai.generate_outline(&request.title, &request.description)
        .await
}

/// 扩写内容请求
#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ExpandContentRequest {
    pub outline: String,
}

/// 扩写内容
#[tauri::command]
pub async fn expand_content(
    request: ExpandContentRequest,
    ai: State<'_, AIService>,
) -> Result<String, String> {
    ai.expand_content(&request.outline).await
}

/// 平台适配请求
#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AdaptPlatformRequest {
    pub content: String,
    pub platform: String,
}

/// 平台风格适配
#[tauri::command]
pub async fn adapt_for_platform(
    request: AdaptPlatformRequest,
    ai: State<'_, AIService>,
) -> Result<String, String> {
    ai.adapt_for_platform(&request.content, &request.platform)
        .await
}

/// 生成配图建议
#[tauri::command]
pub async fn suggest_images(content: String, ai: State<'_, AIService>) -> Result<String, String> {
    ai.suggest_images(&content).await
}
