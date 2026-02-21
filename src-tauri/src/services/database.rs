use rusqlite::{Connection, Result as SqliteResult};
use std::path::PathBuf;
use std::sync::Mutex;

pub struct Database {
    conn: Mutex<Connection>,
}

impl Database {
    /// 创建数据库实例
    pub fn new(app_data_dir: PathBuf) -> SqliteResult<Self> {
        std::fs::create_dir_all(&app_data_dir).ok();
        let db_path = app_data_dir.join("content_studio.db");

        let conn = Connection::open(db_path)?;
        let db = Self {
            conn: Mutex::new(conn),
        };
        db.init_schema()?;
        Ok(db)
    }

    /// 初始化数据库表结构
    fn init_schema(&self) -> SqliteResult<()> {
        let conn = self.conn.lock().unwrap();

        conn.execute_batch(
            r#"
            -- 想法表
            CREATE TABLE IF NOT EXISTS ideas (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                content TEXT,
                status TEXT CHECK(status IN ('draft', 'writing', 'review', 'published')) DEFAULT 'draft',
                created_at TEXT DEFAULT (datetime('now')),
                updated_at TEXT DEFAULT (datetime('now'))
            );

            -- 标签表
            CREATE TABLE IF NOT EXISTS tags (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL UNIQUE,
                color TEXT DEFAULT '#6366f1',
                created_at TEXT DEFAULT (datetime('now'))
            );

            -- 想法-标签关联表
            CREATE TABLE IF NOT EXISTS idea_tags (
                idea_id TEXT REFERENCES ideas(id) ON DELETE CASCADE,
                tag_id TEXT REFERENCES tags(id) ON DELETE CASCADE,
                PRIMARY KEY (idea_id, tag_id)
            );

            -- 内容版本表
            CREATE TABLE IF NOT EXISTS contents (
                id TEXT PRIMARY KEY,
                idea_id TEXT REFERENCES ideas(id) ON DELETE CASCADE,
                version INTEGER DEFAULT 1,
                title TEXT,
                body TEXT,
                platform TEXT,
                created_at TEXT DEFAULT (datetime('now')),
                updated_at TEXT DEFAULT (datetime('now'))
            );

            -- 发布记录表
            CREATE TABLE IF NOT EXISTS publish_logs (
                id TEXT PRIMARY KEY,
                content_id TEXT REFERENCES contents(id) ON DELETE CASCADE,
                platform TEXT NOT NULL,
                published_at TEXT DEFAULT (datetime('now')),
                status TEXT DEFAULT 'success'
            );

            -- 设置表
            CREATE TABLE IF NOT EXISTS settings (
                key TEXT PRIMARY KEY,
                value TEXT,
                updated_at TEXT DEFAULT (datetime('now'))
            );

            -- 索引
            CREATE INDEX IF NOT EXISTS idx_ideas_status ON ideas(status);
            CREATE INDEX IF NOT EXISTS idx_ideas_created ON ideas(created_at DESC);
            CREATE INDEX IF NOT EXISTS idx_contents_idea ON contents(idea_id);
            "#,
        )?;

        Ok(())
    }

    /// 获取数据库连接
    pub fn conn(&self) -> std::sync::MutexGuard<'_, Connection> {
        self.conn.lock().unwrap()
    }
}
