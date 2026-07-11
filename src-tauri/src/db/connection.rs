use crate::{
    db::{migrations::run_migrations, repositories::seed_dev_data},
    error::{AppError, AppResult},
};
use rusqlite::Connection;
use std::{
    fs,
    path::{Path, PathBuf},
    sync::{Mutex, MutexGuard},
};
use tauri::{AppHandle, Manager};

pub const DB_FILE_NAME: &str = "fontsequal.db";

pub struct DbState {
    connection: Mutex<Connection>,
    path: PathBuf,
}

impl DbState {
    pub fn initialize(app_handle: &AppHandle) -> AppResult<Self> {
        let db_path = database_path(app_handle)?;

        if let Some(parent) = db_path.parent() {
            fs::create_dir_all(parent)?;
        }

        let connection = Connection::open(&db_path)?;
        connection.pragma_update(None, "foreign_keys", "ON")?;
        connection.pragma_update(None, "journal_mode", "WAL")?;
        connection.pragma_update(None, "synchronous", "NORMAL")?;

        run_migrations(&connection)?;

        #[cfg(debug_assertions)]
        seed_dev_data(&connection)?;

        Ok(Self {
            connection: Mutex::new(connection),
            path: db_path,
        })
    }

    pub fn connection(&self) -> AppResult<MutexGuard<'_, Connection>> {
        self.connection
            .lock()
            .map_err(|_| AppError::new("db_lock_poisoned", "Database lock poisoned"))
    }

    #[allow(dead_code)]
    pub fn path(&self) -> &Path {
        &self.path
    }
}

fn database_path(app_handle: &AppHandle) -> AppResult<PathBuf> {
    let app_data_dir = app_handle.path().app_data_dir().map_err(|error| {
        AppError::new(
            "app_data_dir_failed",
            format!("Failed to resolve app data directory: {error}"),
        )
    })?;

    Ok(app_data_dir.join(DB_FILE_NAME))
}
