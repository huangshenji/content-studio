use serde::{Deserialize, Serialize};

/// 想法状态
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum IdeaStatus {
    Draft,
    Writing,
    Review,
    Published,
}

impl std::fmt::Display for IdeaStatus {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            IdeaStatus::Draft => write!(f, "draft"),
            IdeaStatus::Writing => write!(f, "writing"),
            IdeaStatus::Review => write!(f, "review"),
            IdeaStatus::Published => write!(f, "published"),
        }
    }
}

impl std::str::FromStr for IdeaStatus {
    type Err = String;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s {
            "draft" => Ok(IdeaStatus::Draft),
            "writing" => Ok(IdeaStatus::Writing),
            "review" => Ok(IdeaStatus::Review),
            "published" => Ok(IdeaStatus::Published),
            _ => Err(format!("Invalid status: {}", s)),
        }
    }
}

/// 标签
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Tag {
    pub id: String,
    pub name: String,
    pub color: String,
    pub created_at: String,
}

/// 想法
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Idea {
    pub id: String,
    pub title: String,
    pub content: Option<String>,
    pub status: IdeaStatus,
    pub tags: Vec<Tag>,
    pub created_at: String,
    pub updated_at: String,
}

/// 内容
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Content {
    pub id: String,
    pub idea_id: String,
    pub version: i32,
    pub title: String,
    pub body: serde_json::Value,
    pub platform: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

/// 创建想法DTO
#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateIdeaDTO {
    pub title: String,
    pub content: Option<String>,
    pub tag_ids: Option<Vec<String>>,
}

/// 更新想法DTO
#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateIdeaDTO {
    pub title: Option<String>,
    pub content: Option<String>,
    pub status: Option<IdeaStatus>,
    pub tag_ids: Option<Vec<String>>,
}

/// 想法过滤器
#[derive(Debug, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct IdeaFilters {
    pub status: Option<String>,
    pub tag_ids: Option<Vec<String>>,
    pub search: Option<String>,
    pub limit: Option<i32>,
    pub offset: Option<i32>,
}

/// 创建标签DTO
#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateTagDTO {
    pub name: String,
    pub color: Option<String>,
}

/// 大纲段落
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OutlineSection {
    pub heading: String,
    pub points: Vec<String>,
}

/// 大纲
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Outline {
    pub title: String,
    pub sections: Vec<OutlineSection>,
}
