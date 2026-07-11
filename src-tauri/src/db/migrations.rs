use crate::error::AppResult;
use rusqlite::Connection;

const LATEST_SCHEMA_VERSION: i64 = 2;

pub fn run_migrations(connection: &Connection) -> AppResult<()> {
    connection.execute_batch(
        r#"
        BEGIN;

        CREATE TABLE IF NOT EXISTS font_families (
            id TEXT PRIMARY KEY,
            family TEXT NOT NULL,
            category TEXT NOT NULL,
            source TEXT NOT NULL,
            variants_json TEXT NOT NULL,
            metadata_json TEXT,
            subsets_json TEXT,
            is_favorite INTEGER NOT NULL DEFAULT 0,
            is_installed INTEGER NOT NULL DEFAULT 0,
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS font_files (
            id TEXT PRIMARY KEY,
            family_id TEXT NOT NULL,
            variant_id TEXT,
            file_name TEXT NOT NULL,
            format TEXT NOT NULL,
            path TEXT,
            url TEXT,
            checksum TEXT,
            size_bytes INTEGER,
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (family_id) REFERENCES font_families(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS installed_fonts (
            id TEXT PRIMARY KEY,
            family_id TEXT NOT NULL,
            post_script_name TEXT,
            full_name TEXT,
            style TEXT NOT NULL,
            weight INTEGER NOT NULL,
            scope TEXT NOT NULL,
            installed_at TEXT,
            is_managed INTEGER NOT NULL DEFAULT 1,
            is_duplicate INTEGER NOT NULL DEFAULT 0,
            FOREIGN KEY (family_id) REFERENCES font_families(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS favorites (
            family_id TEXT PRIMARY KEY,
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (family_id) REFERENCES font_families(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS collections (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS collection_fonts (
            collection_id TEXT NOT NULL,
            family_id TEXT NOT NULL,
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (collection_id, family_id),
            FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE CASCADE,
            FOREIGN KEY (family_id) REFERENCES font_families(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value_json TEXT NOT NULL,
            updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        );

        COMMIT;
        "#,
    )?;

    // Existing v1 databases need additive columns. SQLite has no IF NOT EXISTS here.
    let duplicate_column_exists: bool = connection
        .prepare("PRAGMA table_info(installed_fonts)")?
        .query_map([], |row| row.get::<_, String>(1))?
        .filter_map(Result::ok)
        .any(|column| column == "is_duplicate");

    if !duplicate_column_exists {
        connection.execute_batch(
            "ALTER TABLE installed_fonts ADD COLUMN is_duplicate INTEGER NOT NULL DEFAULT 0;",
        )?;
    }

    connection.pragma_update(None, "user_version", LATEST_SCHEMA_VERSION)?;

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn migrations_create_required_tables() {
        let connection = Connection::open_in_memory().expect("in-memory database opens");

        run_migrations(&connection).expect("migrations run");

        let table_count: i64 = connection
            .query_row(
                "SELECT COUNT(*) FROM sqlite_master WHERE type = 'table' AND name IN (
                    'font_families',
                    'font_files',
                    'installed_fonts',
                    'favorites',
                    'collections',
                    'collection_fonts',
                    'settings'
                )",
                [],
                |row| row.get(0),
            )
            .expect("table count query runs");

        let schema_version: i64 = connection
            .query_row("PRAGMA user_version", [], |row| row.get(0))
            .expect("schema version query runs");

        assert_eq!(table_count, 7);
        assert_eq!(schema_version, LATEST_SCHEMA_VERSION);
    }
}
