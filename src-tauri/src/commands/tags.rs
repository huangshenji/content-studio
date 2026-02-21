use crate::models::{CreateTagDTO, Tag};
use crate::services::Database;
use tauri::State;
use uuid::Uuid;

/// 获取所有标签
#[tauri::command]
pub fn get_tags(db: State<'_, Database>) -> Result<Vec<Tag>, String> {
    let conn = db.conn();

    let mut stmt = conn
        .prepare("SELECT id, name, color, created_at FROM tags ORDER BY name")
        .map_err(|e| e.to_string())?;

    let tags = stmt
        .query_map([], |row| {
            Ok(Tag {
                id: row.get(0)?,
                name: row.get(1)?,
                color: row.get(2)?,
                created_at: row.get(3)?,
            })
        })
        .map_err(|e| e.to_string())?
        .filter_map(|r| r.ok())
        .collect();

    Ok(tags)
}

/// 创建标签
#[tauri::command]
pub fn create_tag(data: CreateTagDTO, db: State<'_, Database>) -> Result<Tag, String> {
    let conn = db.conn();
    let id = Uuid::new_v4().to_string();
    let now = chrono::Utc::now().to_rfc3339();
    let color = data.color.unwrap_or_else(|| "#6366f1".to_string());

    conn.execute(
        "INSERT INTO tags (id, name, color, created_at) VALUES (?1, ?2, ?3, ?4)",
        (&id, &data.name, &color, &now),
    )
    .map_err(|e| e.to_string())?;

    Ok(Tag {
        id,
        name: data.name,
        color,
        created_at: now,
    })
}

/// 删除标签
#[tauri::command]
pub fn delete_tag(id: String, db: State<'_, Database>) -> Result<(), String> {
    let conn = db.conn();

    conn.execute("DELETE FROM tags WHERE id = ?1", [&id])
        .map_err(|e| e.to_string())?;

    Ok(())
}
