use crate::{
    db::{repositories, DbState},
    error::AppResult,
    models::{
        mock_font_family, ApiResult, FontCategory, FontFamily, InstallFontInput, InstallResult,
        ToggleFavoriteInput, UninstallFontInput, UninstallResult,
    },
};
use tauri::State;

#[tauri::command]
pub fn install_font(
    db: State<'_, DbState>,
    input: InstallFontInput,
) -> AppResult<ApiResult<InstallResult>> {
    let connection = db.connection()?;
    if !matches!(&input.scope, crate::models::InstallScope::User) {
        return Err(crate::error::AppError::new(
            "system_install_unsupported",
            "Fontsequal installs fonts for current user only.",
        ));
    }
    let family =
        repositories::get_font_family(&connection, &input.family_id)?.ok_or_else(|| {
            crate::error::AppError::new("font_not_found", "Font family was not found.")
        })?;
    let result = crate::fonts::installer::install_font(&family, input.variant_ids.as_deref())?;

    for file in &result.installed_files {
        repositories::upsert_font_file(&connection, file)?;
    }
    repositories::mark_font_family_installed(&connection, &family.id)?;
    for record in crate::fonts::installer::installed_records(&family, &result.installed_files) {
        repositories::upsert_installed_font(&connection, &record)?;
    }

    Ok(ApiResult::ok(result))
}

#[tauri::command]
pub fn uninstall_font(
    db: State<'_, DbState>,
    input: UninstallFontInput,
) -> AppResult<ApiResult<UninstallResult>> {
    let connection = db.connection()?;
    if matches!(
        input.scope.as_ref(),
        Some(crate::models::InstallScope::System)
    ) {
        return Err(crate::error::AppError::new(
            "system_uninstall_unsupported",
            "Fontsequal removes managed user fonts only.",
        ));
    }
    let mut managed_files = repositories::list_installed_fonts(&connection)?
        .into_iter()
        .filter(|font| font.is_managed)
        .flat_map(|font| font.files)
        .filter(|file| file.family_id == input.family_id && file.path.is_some())
        .collect::<Vec<_>>();
    managed_files.sort_by(|left, right| left.id.cmp(&right.id));
    managed_files.dedup_by(|left, right| left.id == right.id);
    if managed_files.is_empty() {
        return Err(crate::error::AppError::new(
            "external_font_protected",
            "External and system fonts cannot be uninstalled from Fontsequal.",
        ));
    }
    let removed_files = crate::fonts::uninstaller::uninstall_managed_files(&managed_files)?;
    // DB mutation follows successful file removal and cache refresh only.
    let _ = repositories::uninstall_font(&connection, &input.family_id)?;

    Ok(ApiResult::ok(UninstallResult {
        success: true,
        family_id: input.family_id.clone(),
        removed_files,
        skipped_files: vec![],
        message: Some("Removed from Fontsequal managed user library.".to_string()),
    }))
}

#[tauri::command]
pub fn toggle_favorite(
    db: State<'_, DbState>,
    input: ToggleFavoriteInput,
) -> AppResult<ApiResult<FontFamily>> {
    let connection = db.connection()?;
    let current_font = repositories::get_font_family(&connection, &input.family_id)?
        .unwrap_or_else(|| mock_font_family(&input.family_id, "Inter", FontCategory::SansSerif));
    let next_favorite = input.favorite.unwrap_or(!current_font.is_favorite);
    let font = repositories::set_favorite(&connection, &input.family_id, next_favorite)?
        .unwrap_or(current_font);

    Ok(ApiResult::ok(font))
}
