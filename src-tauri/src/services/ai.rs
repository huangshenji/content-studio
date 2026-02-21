use reqwest::Client;
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tokio::sync::RwLock;

/// AI 提供商类型
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum AIProvider {
    GLM,
    DeepSeek,
}

/// AI 配置
#[derive(Debug, Clone)]
pub struct AIConfig {
    pub provider: AIProvider,
    pub glm_api_key: Option<String>,
    pub deepseek_api_key: Option<String>,
    pub model: String,
}

impl Default for AIConfig {
    fn default() -> Self {
        Self {
            provider: AIProvider::DeepSeek,
            glm_api_key: None,
            deepseek_api_key: None,
            model: "deepseek-chat".to_string(),
        }
    }
}

/// AI 服务
pub struct AIService {
    client: Client,
    config: Arc<RwLock<AIConfig>>,
}

impl AIService {
    pub fn new() -> Self {
        Self {
            client: Client::new(),
            config: Arc::new(RwLock::new(AIConfig::default())),
        }
    }

    pub async fn set_config(&self, config: AIConfig) {
        let mut cfg = self.config.write().await;
        *cfg = config;
    }

    pub async fn get_config(&self) -> AIConfig {
        self.config.read().await.clone()
    }

    /// 生成大纲
    pub async fn generate_outline(&self, title: &str, description: &str) -> Result<String, String> {
        let prompt = format!(
            r#"你是一位专业的内容策划专家。请根据以下主题生成一份详细的文章大纲。

主题：{}
描述：{}

要求：
1. 大纲应包含3-5个主要章节
2. 每个章节下列出2-4个要点
3. 内容要有逻辑性和吸引力
4. 适合自媒体平台发布

请以JSON格式返回，格式如下：
{{
  "title": "文章标题",
  "sections": [
    {{
      "heading": "章节标题",
      "points": ["要点1", "要点2", "要点3"]
    }}
  ]
}}"#,
            title, description
        );

        self.chat_completion(&prompt).await
    }

    /// 扩写内容
    pub async fn expand_content(&self, outline_json: &str) -> Result<String, String> {
        let prompt = format!(
            r#"你是一位专业的内容创作者。请根据以下大纲扩写成完整的文章。

大纲：
{}

要求：
1. 语言生动有趣，适合自媒体阅读
2. 每个段落控制在100-200字
3. 适当使用小标题、列表等格式
4. 内容要有价值、有洞见

请直接返回完整的文章内容（Markdown格式）。"#,
            outline_json
        );

        self.chat_completion(&prompt).await
    }

    /// 平台风格适配
    pub async fn adapt_for_platform(&self, content: &str, platform: &str) -> Result<String, String> {
        let platform_guide = match platform {
            "wechat" => "微信公众号：正式但不死板，适当使用emoji，段落简短，重点加粗",
            "xiaohongshu" => "小红书：活泼可爱，多用emoji和感叹号，口语化，分点列举",
            "zhihu" => "知乎：专业理性，有理有据，可以引用数据，适当使用专业术语",
            _ => "通用：简洁清晰，逻辑性强",
        };

        let prompt = format!(
            r#"你是一位资深的自媒体编辑。请将以下内容改写为适合{}平台的风格。

原内容：
{}

平台风格指南：{}

要求：
1. 保持原有内容的核心信息
2. 调整语言风格和格式
3. 优化标题和开头以提高点击率
4. 控制篇幅适合该平台阅读习惯

请直接返回改写后的内容。"#,
            platform, content, platform_guide
        );

        self.chat_completion(&prompt).await
    }

    /// 生成配图建议
    pub async fn suggest_images(&self, content: &str) -> Result<String, String> {
        let prompt = format!(
            r#"你是一位视觉设计顾问。请根据以下文章内容，建议3-5张配图。

文章内容：
{}

请以JSON格式返回配图建议：
{{
  "suggestions": [
    {{
      "position": "图片应该放置的位置（如：开头/第二段后）",
      "keyword": "图片搜索关键词",
      "description": "图片内容描述",
      "style": "建议的图片风格（如：扁平插画/摄影/信息图）"
    }}
  ]
}}"#,
            content
        );

        self.chat_completion(&prompt).await
    }

    /// 调用聊天完成 API
    async fn chat_completion(&self, prompt: &str) -> Result<String, String> {
        let config = self.config.read().await;

        match config.provider {
            AIProvider::DeepSeek => self.call_deepseek(prompt, &config).await,
            AIProvider::GLM => self.call_glm(prompt, &config).await,
        }
    }

    /// 调用 DeepSeek API
    async fn call_deepseek(&self, prompt: &str, config: &AIConfig) -> Result<String, String> {
        let api_key = config
            .deepseek_api_key
            .as_ref()
            .ok_or("DeepSeek API Key 未配置")?;

        let request_body = serde_json::json!({
            "model": &config.model,
            "messages": [
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            "temperature": 0.7,
            "max_tokens": 4096
        });

        let response = self
            .client
            .post("https://api.deepseek.com/chat/completions")
            .header("Authorization", format!("Bearer {}", api_key))
            .header("Content-Type", "application/json")
            .json(&request_body)
            .send()
            .await
            .map_err(|e| format!("请求失败: {}", e))?;

        if !response.status().is_success() {
            let error_text = response.text().await.unwrap_or_default();
            return Err(format!("API 错误: {}", error_text));
        }

        let result: serde_json::Value = response
            .json()
            .await
            .map_err(|e| format!("解析响应失败: {}", e))?;

        result["choices"][0]["message"]["content"]
            .as_str()
            .map(|s| s.to_string())
            .ok_or_else(|| "无法获取响应内容".to_string())
    }

    /// 调用 GLM (智谱) API
    async fn call_glm(&self, prompt: &str, config: &AIConfig) -> Result<String, String> {
        let api_key = config
            .glm_api_key
            .as_ref()
            .ok_or("GLM API Key 未配置")?;

        let request_body = serde_json::json!({
            "model": "glm-4",
            "messages": [
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            "temperature": 0.7,
            "max_tokens": 4096
        });

        let response = self
            .client
            .post("https://open.bigmodel.cn/api/paas/v4/chat/completions")
            .header("Authorization", format!("Bearer {}", api_key))
            .header("Content-Type", "application/json")
            .json(&request_body)
            .send()
            .await
            .map_err(|e| format!("请求失败: {}", e))?;

        if !response.status().is_success() {
            let error_text = response.text().await.unwrap_or_default();
            return Err(format!("API 错误: {}", error_text));
        }

        let result: serde_json::Value = response
            .json()
            .await
            .map_err(|e| format!("解析响应失败: {}", e))?;

        result["choices"][0]["message"]["content"]
            .as_str()
            .map(|s| s.to_string())
            .ok_or_else(|| "无法获取响应内容".to_string())
    }
}
