use crate::{db::{repositories, DbState}, error::{AppError, AppResult}, models::{ApiResult, ImportLocalFontsInput, InstallScope}};
use std::collections::HashSet;
use tauri::State;

#[tauri::command]
pub fn import_local_fonts(db: State<'_, DbState>, input: ImportLocalFontsInput) -> AppResult<ApiResult<Vec<crate::models::FontFile>>> {
    if !matches!(&input.scope, InstallScope::User) { return Err(AppError::new("system_import_unsupported", "Fontsequal imports into current user library only.")); }
    let connection = db.connection()?;
    let known_hashes = repositories::list_installed_fonts(&connection)?.into_iter().flat_map(|font| font.files).filter_map(|file| file.checksum).collect::<HashSet<_>>();
    let (records, skipped) = crate::fonts::importer::import_local_fonts(&input.paths, &known_hashes)?;
    let mut result = skipped;
    for record in records {
        let family = crate::fonts::importer::family_for_import(&record);
        repositories::upsert_font_family(&connection, &family)?;
        repositories::upsert_installed_font(&connection, &record)?;
        result.extend(record.files);
    }
    Ok(ApiResult::ok(result))
}
