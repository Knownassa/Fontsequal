use crate::{
    db::{repositories, DbState},
    error::AppResult,
    google::{
        cache::{cache_status, write_google_fonts_cache},
        client::fetch_google_fonts,
        normalizer::normalize_google_fonts,
    },
    models::{ApiResult, CacheRefreshResult, FontFamily, GoogleFontsSearchInput},
};
use tauri::State;

#[tauri::command]
pub fn list_google_fonts(db: State<'_, DbState>) -> AppResult<ApiResult<Vec<FontFamily>>> {
    let connection = db.connection()?;
    Ok(ApiResult::ok(repositories::list_font_families(
        &connection,
    )?))
}

#[tauri::command]
pub fn refresh_google_fonts_cache(
    db: State<'_, DbState>,
) -> AppResult<ApiResult<CacheRefreshResult>> {
    let connection = db.connection()?;
    let settings = repositories::get_settings(&connection)?;
    let response = fetch_google_fonts(settings.google_fonts_api_key.as_deref())?;
    let fonts = normalize_google_fonts(response.items);
    let meta = write_google_fonts_cache(&connection, &fonts)?;

    Ok(ApiResult::ok(CacheRefreshResult {
        refreshed_at: meta.refreshed_at,
        family_count: meta.family_count,
        is_stale: false,
    }))
}

#[tauri::command]
pub fn search_google_fonts(
    db: State<'_, DbState>,
    input: GoogleFontsSearchInput,
) -> AppResult<ApiResult<Vec<FontFamily>>> {
    let connection = db.connection()?;
    let settings = repositories::get_settings(&connection)?;
    let _status = cache_status(&connection, settings.google_fonts_cache_ttl_hours)?;
    let fonts = repositories::search_font_families(
        &connection,
        &input.query,
        input.categories.as_deref(),
        input.subsets.as_deref(),
        input.limit,
    )?;

    Ok(ApiResult::ok(apply_filters(fonts, &input)))
}

fn apply_filters(mut fonts: Vec<FontFamily>, input: &GoogleFontsSearchInput) -> Vec<FontFamily> {
    if let Some(weights) = &input.weights {
        fonts.retain(|font| {
            font.variants
                .iter()
                .any(|variant| weights.contains(&variant.weight))
        });
    }

    if let Some(styles) = &input.styles {
        fonts.retain(|font| {
            font.variants
                .iter()
                .any(|variant| styles.contains(&variant.style))
        });
    }

    if input.favorites_only.unwrap_or(false) {
        fonts.retain(|font| font.is_favorite);
    }

    if input.installed_only.unwrap_or(false) {
        fonts.retain(|font| font.is_installed);
    }

    if input.variable_only.unwrap_or(false) {
        fonts.retain(|font| {
            font.variants
                .iter()
                .any(|variant| variant.variable_axes.is_some())
        });
    }

    fonts
}
