use crate::models::{CreateIdeaDTO, Idea, IdeaFilters, IdeaStatus, Tag, UpdateIdeaDTO};
use crate::services::Database;
use tauri::State;
use uuid::Uuid;

/// 获取想法列表
#[tauri::command]
pub fn get_ideas(filters: IdeaFilters, db: State<'_, Database>) -> Result<Vec<Idea>, String> {
    let conn = db.conn();

    let mut sql = String::from(
        r#"
        SELECT i.id, i.title, i.content, i.status, i.created_at, i.updated_at
        FROM ideas i
        WHERE 1=1
        "#,
    );

    // 状态过滤
    if let Some(status) = &filters.status {
        if status != "all" {
            sql.push_str(&format!(" AND i.status = '{}'", status));
        }
    }

    // 搜索过滤
    if let Some(search) = &filters.search {
        if !search.is_empty() {
            sql.push_str(&format!(
                " AND (i.title LIKE '%{}%' OR i.content LIKE '%{}%')",
                search, search
            ));
        }
    }

    sql.push_str(" ORDER BY i.updated_at DESC");

    // 分页
    if let Some(limit) = filters.limit {
        sql.push_str(&format!(" LIMIT {}", limit));
    }
    if let Some(offset) = filters.offset {
        sql.push_str(&format!(" OFFSET {}", offset));
    }

    let mut stmt = conn.prepare(&sql).map_err(|e| e.to_string())?;
    let idea_iter = stmt
        .query_map([], |row| {
            Ok(Idea {
                id: row.get(0)?,
                title: row.get(1)?,
                content: row.get(2)?,
                status: row
                    .get::<_, String>(3)?
                    .parse()
                    .unwrap_or(IdeaStatus::Draft),
                tags: vec![],
                created_at: row.get(4)?,
                updated_at: row.get(5)?,
            })
        })
        .map_err(|e| e.to_string())?;

    let mut ideas: Vec<Idea> = idea_iter.filter_map(|r| r.ok()).collect();

    // 获取每个想法的标签
    for idea in &mut ideas {
        let tags = get_idea_tags(&conn, &idea.id)?;
        idea.tags = tags;
    }

    Ok(ideas)
}

/// 获取单个想法
#[tauri::command]
pub fn get_idea(id: String, db: State<'_, Database>) -> Result<Idea, String> {
    let conn = db.conn();

    let mut stmt = conn
        .prepare(
            r#"
            SELECT id, title, content, status, created_at, updated_at
            FROM ideas
            WHERE id = ?1
            "#,
        )
        .map_err(|e| e.to_string())?;

    let idea = stmt
        .query_row([&id], |row| {
            Ok(Idea {
                id: row.get(0)?,
                title: row.get(1)?,
                content: row.get(2)?,
                status: row
                    .get::<_, String>(3)?
                    .parse()
                    .unwrap_or(IdeaStatus::Draft),
                tags: vec![],
                created_at: row.get(4)?,
                updated_at: row.get(5)?,
            })
        })
        .map_err(|e| e.to_string())?;

    let tags = get_idea_tags(&conn, &idea.id)?;
    Ok(Idea { tags, ..idea })
}

/// 创建想法
#[tauri::command]
pub fn create_idea(data: CreateIdeaDTO, db: State<'_, Database>) -> Result<Idea, String> {
    let conn = db.conn();
    let id = Uuid::new_v4().to_string();
    let now = chrono::Utc::now().to_rfc3339();

    conn.execute(
        r#"
        INSERT INTO ideas (id, title, content, status, created_at, updated_at)
        VALUES (?1, ?2, ?3, 'draft', ?4, ?4)
        "#,
        (&id, &data.title, &data.content, &now),
    )
    .map_err(|e| e.to_string())?;

    // 关联标签
    if let Some(tag_ids) = &data.tag_ids {
        for tag_id in tag_ids {
            conn.execute(
                "INSERT OR IGNORE INTO idea_tags (idea_id, tag_id) VALUES (?1, ?2)",
                (&id, tag_id),
            )
            .ok();
        }
    }

    let tags = get_idea_tags(&conn, &id)?;

    Ok(Idea {
        id,
        title: data.title,
        content: data.content,
        status: IdeaStatus::Draft,
        tags,
        created_at: now.clone(),
        updated_at: now,
    })
}

/// 更新想法
#[tauri::command]
pub fn update_idea(id: String, data: UpdateIdeaDTO, db: State<'_, Database>) -> Result<(), String> {
    let conn = db.conn();
    let now = chrono::Utc::now().to_rfc3339();

    let mut updates = vec!["updated_at = ?1".to_string()];
    let mut params: Vec<Box<dyn rusqlite::ToSql>> = vec![Box::new(now)];

    if let Some(title) = &data.title {
        updates.push(format!("title = ?{}", params.len() + 1));
        params.push(Box::new(title.clone()));
    }

    if let Some(content) = &data.content {
        updates.push(format!("content = ?{}", params.len() + 1));
        params.push(Box::new(content.clone()));
    }

    if let Some(status) = &data.status {
        updates.push(format!("status = ?{}", params.len() + 1));
        params.push(Box::new(status.to_string()));
    }

    let sql = format!(
        "UPDATE ideas SET {} WHERE id = ?{}",
        updates.join(", "),
        params.len() + 1
    );
    params.push(Box::new(id.clone()));

    let params_refs: Vec<&dyn rusqlite::ToSql> = params.iter().map(|p| p.as_ref()).collect();
    conn.execute(&sql, params_refs.as_slice())
        .map_err(|e| e.to_string())?;

    // 更新标签关联
    if let Some(tag_ids) = &data.tag_ids {
        conn.execute("DELETE FROM idea_tags WHERE idea_id = ?1", [&id])
            .ok();
        for tag_id in tag_ids {
            conn.execute(
                "INSERT OR IGNORE INTO idea_tags (idea_id, tag_id) VALUES (?1, ?2)",
                (&id, tag_id),
            )
            .ok();
        }
    }

    Ok(())
}

/// 删除想法
#[tauri::command]
pub fn delete_idea(id: String, db: State<'_, Database>) -> Result<(), String> {
    let conn = db.conn();

    conn.execute("DELETE FROM ideas WHERE id = ?1", [&id])
        .map_err(|e| e.to_string())?;

    Ok(())
}

/// 获取想法的标签
fn get_idea_tags(
    conn: &std::sync::MutexGuard<'_, rusqlite::Connection>,
    idea_id: &str,
) -> Result<Vec<Tag>, String> {
    let mut stmt = conn
        .prepare(
            r#"
            SELECT t.id, t.name, t.color, t.created_at
            FROM tags t
            JOIN idea_tags it ON t.id = it.tag_id
            WHERE it.idea_id = ?1
            "#,
        )
        .map_err(|e| e.to_string())?;

    let tags = stmt
        .query_map([idea_id], |row| {
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
