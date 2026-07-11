use crate::{db::{repositories, DbState}, error::{AppError, AppResult}, models::{ApiResult, UnifiedFont}, providers::registry::ProviderRegistry};
use std::collections::BTreeMap;
use tauri::State;

#[tauri::command]
pub fn list_unified_fonts(db: State<'_, DbState>) -> AppResult<ApiResult<Vec<UnifiedFont>>> {
    let connection = db.connection()?;
    Ok(ApiResult::ok(unify(repositories::list_font_families(&connection)?)))
}

#[tauri::command]
pub fn search_unified_fonts(db: State<'_, DbState>, query: String, limit: Option<usize>) -> AppResult<ApiResult<Vec<UnifiedFont>>> {
    let connection = db.connection()?;
    let needle = query.trim().to_lowercase();
    let mut fonts = unify(repositories::list_font_families(&connection)?).into_iter().filter(|font| needle.is_empty() || font.family.to_lowercase().contains(&needle)).collect::<Vec<_>>();
    if let Some(limit) = limit { fonts.truncate(limit); }
    Ok(ApiResult::ok(fonts))
}

#[tauri::command]
pub fn refresh_font_provider(db: State<'_, DbState>, provider_id: String) -> AppResult<ApiResult<()>> {
    match provider_id.as_str() {
        "system" => { let connection = db.connection()?; let scanned = crate::fonts::scanner::scan_system_fonts(); repositories::upsert_scanned_fonts(&connection, &scanned)?; Ok(ApiResult::ok(())) }
        "google" => Err(AppError::new("provider_refresh_requires_google_command", "Use refresh_google_fonts_cache for Google provider.")),
        "managed" | "bunny" | "fontsource" => Ok(ApiResult::ok(())),
        _ => Err(AppError::new("provider_not_found", "Unknown font provider.")),
    }
}

#[tauri::command]
pub fn refresh_all_font_sources(db: State<'_, DbState>) -> AppResult<ApiResult<()>> {
    let connection = db.connection()?;
    let scanned = crate::fonts::scanner::scan_system_fonts();
    repositories::upsert_scanned_fonts(&connection, &scanned)?;
    let _registry = ProviderRegistry::built_in();
    Ok(ApiResult::ok(()))
}

fn unify(families: Vec<crate::models::FontFamily>) -> Vec<UnifiedFont> {
    let mut grouped = BTreeMap::<String, UnifiedFont>::new();
    for family in families {
        let unified = UnifiedFont::from_family(family);
        match grouped.get_mut(&unified.normalized_family) {
            Some(existing) => { existing.sources.extend(unified.sources); existing.is_installed |= unified.is_installed; existing.is_managed |= unified.is_managed; existing.is_readonly &= unified.is_readonly; existing.variants.extend(unified.variants); existing.files.extend(unified.files); }
            None => { grouped.insert(unified.normalized_family.clone(), unified); }
        }
    }
    grouped.into_values().collect()
}
