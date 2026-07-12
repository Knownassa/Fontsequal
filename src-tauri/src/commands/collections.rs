use crate::{
    db::{repositories, DbState},
    error::AppResult,
    models::{
        ApiResult, Collection, CreateCollectionInput, FontCollectionInput, RenameCollectionInput,
    },
};
use tauri::State;

#[tauri::command]
pub fn list_collections(db: State<'_, DbState>) -> AppResult<ApiResult<Vec<Collection>>> {
    let connection = db.connection()?;
    Ok(ApiResult::ok(repositories::list_collections(&connection)?))
}

#[tauri::command]
pub fn rename_collection(
    db: State<'_, DbState>,
    input: RenameCollectionInput,
) -> AppResult<ApiResult<Collection>> {
    let connection = db.connection()?;
    Ok(ApiResult::ok(repositories::rename_collection(
        &connection,
        &input.collection_id,
        &input.name,
        input.description,
    )?))
}

#[tauri::command]
pub fn delete_collection(
    db: State<'_, DbState>,
    collection_id: String,
) -> AppResult<ApiResult<()>> {
    let connection = db.connection()?;
    repositories::delete_collection(&connection, &collection_id)?;
    Ok(ApiResult::ok(()))
}

#[tauri::command]
pub fn create_collection(
    db: State<'_, DbState>,
    input: CreateCollectionInput,
) -> AppResult<ApiResult<Collection>> {
    let connection = db.connection()?;
    Ok(ApiResult::ok(repositories::create_collection(
        &connection,
        input,
    )?))
}

#[tauri::command]
pub fn add_font_to_collection(
    db: State<'_, DbState>,
    input: FontCollectionInput,
) -> AppResult<ApiResult<Collection>> {
    let connection = db.connection()?;
    Ok(ApiResult::ok(repositories::add_font_to_collection(
        &connection,
        &input.collection_id,
        &input.family_id,
    )?))
}

#[tauri::command]
pub fn remove_font_from_collection(
    db: State<'_, DbState>,
    input: FontCollectionInput,
) -> AppResult<ApiResult<Collection>> {
    let connection = db.connection()?;
    Ok(ApiResult::ok(repositories::remove_font_from_collection(
        &connection,
        &input.collection_id,
        &input.family_id,
    )?))
}
