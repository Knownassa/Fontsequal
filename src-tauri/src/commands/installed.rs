use crate::{
    db::{repositories, DbState},
    error::AppResult,
    models::{ApiResult, InstalledFont},
};
use tauri::State;

#[tauri::command]
pub fn get_installed_fonts(db: State<'_, DbState>) -> AppResult<ApiResult<Vec<InstalledFont>>> {
    let connection = db.connection()?;
    Ok(ApiResult::ok(repositories::list_installed_fonts(
        &connection,
    )?))
}

#[tauri::command]
pub fn scan_system_fonts(db: State<'_, DbState>) -> AppResult<ApiResult<Vec<InstalledFont>>> {
    let connection = db.connection()?;
    let scanned = crate::fonts::scanner::scan_system_fonts();
    repositories::upsert_scanned_fonts(&connection, &scanned)?;
    Ok(ApiResult::ok(scanned))
}
