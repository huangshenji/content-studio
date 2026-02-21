use arboard::Clipboard;

/// 复制富文本到剪贴板
#[tauri::command]
pub fn copy_rich_text(html: String, plain: String) -> Result<(), String> {
    let mut clipboard = Clipboard::new().map_err(|e| e.to_string())?;

    // 同时设置HTML和纯文本格式
    clipboard
        .set_html(&html, Some(&plain))
        .map_err(|e| e.to_string())?;

    Ok(())
}

/// 复制纯文本到剪贴板
#[tauri::command]
pub fn copy_text(text: String) -> Result<(), String> {
    let mut clipboard = Clipboard::new().map_err(|e| e.to_string())?;

    clipboard.set_text(&text).map_err(|e| e.to_string())?;

    Ok(())
}
