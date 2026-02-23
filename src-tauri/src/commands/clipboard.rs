use arboard::Clipboard;

/// 将HTML转换为微信公众号兼容格式（添加内联样式）
fn convert_to_wechat_html(html: &str) -> String {
    let mut result = html.to_string();

    // 标题样式
    result = result.replace(
        "<h1>",
        r#"<h1 style="font-size: 24px; font-weight: bold; color: #333; margin: 20px 0 10px 0; line-height: 1.4;">"#,
    );
    result = result.replace(
        "<h2>",
        r#"<h2 style="font-size: 20px; font-weight: bold; color: #333; margin: 18px 0 8px 0; line-height: 1.4;">"#,
    );
    result = result.replace(
        "<h3>",
        r#"<h3 style="font-size: 18px; font-weight: bold; color: #333; margin: 16px 0 6px 0; line-height: 1.4;">"#,
    );

    // 段落样式
    result = result.replace(
        "<p>",
        r#"<p style="font-size: 16px; color: #333; line-height: 1.8; margin: 10px 0; text-align: justify;">"#,
    );

    // 粗体
    result = result.replace(
        "<strong>",
        r#"<strong style="font-weight: bold; color: #333;">"#,
    );

    // 斜体
    result = result.replace("<em>", r#"<em style="font-style: italic;">"#);

    // 引用块
    result = result.replace(
        "<blockquote>",
        r#"<blockquote style="border-left: 4px solid #6366f1; padding: 10px 15px; margin: 15px 0; background: #f8f9fa; color: #666; font-style: italic;">"#,
    );

    // 无序列表
    result = result.replace(
        "<ul>",
        r#"<ul style="padding-left: 20px; margin: 10px 0;">"#,
    );

    // 有序列表
    result = result.replace(
        "<ol>",
        r#"<ol style="padding-left: 20px; margin: 10px 0;">"#,
    );

    // 列表项
    result = result.replace(
        "<li>",
        r#"<li style="font-size: 16px; color: #333; line-height: 1.8; margin: 5px 0;">"#,
    );

    // 行内代码
    result = result.replace(
        "<code>",
        r#"<code style="background: #f4f4f4; padding: 2px 6px; border-radius: 3px; font-family: monospace; font-size: 14px; color: #e83e8c;">"#,
    );

    // 代码块
    result = result.replace(
        "<pre>",
        r#"<pre style="background: #2d2d2d; color: #f8f8f2; padding: 15px; border-radius: 5px; overflow-x: auto; font-family: monospace; font-size: 14px; line-height: 1.5; margin: 15px 0;">"#,
    );

    // 链接
    result = result.replace(
        "<a ",
        r#"<a style="color: #6366f1; text-decoration: underline;" "#,
    );

    // 图片
    result = result.replace(
        "<img ",
        r#"<img style="max-width: 100%; height: auto; border-radius: 5px; margin: 10px 0;" "#,
    );

    // 分割线
    result = result.replace(
        "<hr>",
        r#"<hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">"#,
    );
    result = result.replace(
        "<hr/>",
        r#"<hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;"/>"#,
    );

    // 包装在一个容器中
    format!(
        r#"<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 100%; padding: 10px;">{}</div>"#,
        result
    )
}

/// 复制富文本到剪贴板（微信公众号兼容格式）
#[tauri::command]
pub fn copy_rich_text(html: String) -> Result<(), String> {
    let mut clipboard = Clipboard::new().map_err(|e| e.to_string())?;

    // 转换为微信兼容格式
    let wechat_html = convert_to_wechat_html(&html);

    // 生成纯文本版本
    let plain = html_to_plain_text(&html);

    // 同时设置HTML和纯文本格式
    clipboard
        .set_html(&wechat_html, Some(&plain))
        .map_err(|e| e.to_string())?;

    Ok(())
}

/// HTML转纯文本（简单实现）
fn html_to_plain_text(html: &str) -> String {
    let mut text = html.to_string();

    // 移除HTML标签
    let tag_regex = regex::Regex::new(r"<[^>]+>").unwrap_or_else(|_| regex::Regex::new(r"$^").unwrap());
    text = tag_regex.replace_all(&text, "").to_string();

    // 解码HTML实体
    text = text.replace("&nbsp;", " ");
    text = text.replace("&lt;", "<");
    text = text.replace("&gt;", ">");
    text = text.replace("&amp;", "&");
    text = text.replace("&quot;", "\"");

    text.trim().to_string()
}

/// 复制纯文本到剪贴板
#[tauri::command]
pub fn copy_text(text: String) -> Result<(), String> {
    let mut clipboard = Clipboard::new().map_err(|e| e.to_string())?;

    clipboard.set_text(&text).map_err(|e| e.to_string())?;

    Ok(())
}
