use crate::{
    db::{repositories, DbState},
    error::AppResult,
    models::{ApiResult, AppSettings, UpdateSettingsInput},
};
use tauri::State;

#[tauri::command]
pub fn get_settings(db: State<'_, DbState>) -> AppResult<ApiResult<AppSettings>> {
    let connection = db.connection()?;
    Ok(ApiResult::ok(repositories::get_settings(&connection)?))
}

#[tauri::command]
pub fn update_settings(
    db: State<'_, DbState>,
    input: UpdateSettingsInput,
) -> AppResult<ApiResult<AppSettings>> {
    let connection = db.connection()?;
    Ok(ApiResult::ok(repositories::update_settings(
        &connection,
        input,
    )?))
}
