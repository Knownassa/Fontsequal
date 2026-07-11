use crate::{
    db::repositories, error::AppResult, google::GOOGLE_FONTS_CACHE_KEY, models::FontFamily,
};
use rusqlite::{params, Connection, OptionalExtension};
use serde::{Deserialize, Serialize};
use std::time::{SystemTime, UNIX_EPOCH};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GoogleFontsCacheMeta {
    pub refreshed_at: String,
    pub refreshed_at_epoch_seconds: u64,
    pub family_count: u32,
}

#[derive(Debug, Clone)]
pub struct GoogleFontsCacheStatus {
    pub refreshed_at: Option<String>,
    pub family_count: u32,
    pub is_stale: bool,
}

pub fn write_google_fonts_cache(
    connection: &Connection,
    fonts: &[FontFamily],
) -> AppResult<GoogleFontsCacheMeta> {
    for font in fonts {
        repositories::upsert_font_family(connection, font)?;
    }

    let now = now_epoch_seconds();
    let meta = GoogleFontsCacheMeta {
        refreshed_at: now.to_string(),
        refreshed_at_epoch_seconds: now,
        family_count: fonts.len() as u32,
    };

    connection.execute(
        r#"
        INSERT INTO settings (key, value_json, updated_at)
        VALUES (?1, ?2, ?3)
        ON CONFLICT(key) DO UPDATE SET
            value_json = excluded.value_json,
            updated_at = excluded.updated_at
        "#,
        params![
            GOOGLE_FONTS_CACHE_KEY,
            serde_json::to_string(&meta)?,
            &meta.refreshed_at,
        ],
    )?;

    Ok(meta)
}

pub fn cache_status(connection: &Connection, ttl_hours: u16) -> AppResult<GoogleFontsCacheStatus> {
    let family_count = repositories::list_font_families(connection)?.len() as u32;
    let meta = read_cache_meta(connection)?;
    let now = now_epoch_seconds();
    let ttl_seconds = u64::from(ttl_hours).saturating_mul(60 * 60);
    let is_stale = meta
        .as_ref()
        .map(|meta| now.saturating_sub(meta.refreshed_at_epoch_seconds) > ttl_seconds)
        .unwrap_or(true);

    Ok(GoogleFontsCacheStatus {
        refreshed_at: meta.map(|meta| meta.refreshed_at),
        family_count,
        is_stale,
    })
}

fn read_cache_meta(connection: &Connection) -> AppResult<Option<GoogleFontsCacheMeta>> {
    let value_json: Option<String> = connection
        .query_row(
            "SELECT value_json FROM settings WHERE key = ?1",
            params![GOOGLE_FONTS_CACHE_KEY],
            |row| row.get(0),
        )
        .optional()?;

    value_json
        .map(|value_json| serde_json::from_str(&value_json).map_err(Into::into))
        .transpose()
}

fn now_epoch_seconds() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|duration| duration.as_secs())
        .unwrap_or_default()
}
