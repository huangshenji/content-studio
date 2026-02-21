mod commands;
mod models;
mod services;

use services::{AIService, Database};
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            // 初始化日志
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }

            // 初始化数据库
            let app_data_dir = app
                .path()
                .app_data_dir()
                .expect("Failed to get app data dir");

            let db = Database::new(app_data_dir).expect("Failed to initialize database");
            app.manage(db);

            // 初始化 AI 服务
            let ai_service = AIService::new();
            app.manage(ai_service);

            log::info!("Content Studio initialized successfully!");

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            // Ideas
            commands::get_ideas,
            commands::get_idea,
            commands::create_idea,
            commands::update_idea,
            commands::delete_idea,
            // Tags
            commands::get_tags,
            commands::create_tag,
            commands::delete_tag,
            // Clipboard
            commands::copy_rich_text,
            commands::copy_text,
            // AI
            commands::get_ai_config,
            commands::set_ai_config,
            commands::generate_outline,
            commands::expand_content,
            commands::adapt_for_platform,
            commands::suggest_images,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
