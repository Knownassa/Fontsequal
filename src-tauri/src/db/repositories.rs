use crate::{
    error::AppResult,
    models::{
        mock_collections, mock_google_fonts, mock_installed_fonts, mock_settings, AppSettings,
        Collection, CreateCollectionInput, FontCategory, FontFamily, FontFile, FontFileFormat,
        FontMetadata, FontSource, FontStyle, FontVariant, InstallScope, InstalledFont,
        UpdateSettingsInput,
    },
};
use rusqlite::{params, Connection, OptionalExtension};

const SETTINGS_KEY: &str = "app";
const MOCK_NOW: &str = "2026-07-07T00:00:00Z";

pub fn seed_dev_data(connection: &Connection) -> AppResult<()> {
    let family_count: i64 =
        connection.query_row("SELECT COUNT(*) FROM font_families", [], |row| row.get(0))?;

    if family_count > 0 {
        return Ok(());
    }

    for font in mock_google_fonts() {
        upsert_font_family(connection, &font)?;
    }

    for installed_font in mock_installed_fonts() {
        upsert_installed_font(connection, &installed_font)?;
    }

    for collection in mock_collections() {
        upsert_collection(connection, &collection)?;
    }

    upsert_settings(connection, &mock_settings())?;

    Ok(())
}

pub fn list_font_families(connection: &Connection) -> AppResult<Vec<FontFamily>> {
    let mut statement = connection.prepare(
        r#"
        SELECT id, family, category, source, variants_json, metadata_json, subsets_json,
               is_favorite, is_installed
        FROM font_families
        ORDER BY family COLLATE NOCASE
        "#,
    )?;

    let rows = statement.query_map([], |row| read_font_family_row(connection, row))?;
    collect_rows(rows)
}

pub fn search_font_families(
    connection: &Connection,
    query: &str,
    categories: Option<&[FontCategory]>,
    subsets: Option<&[String]>,
    limit: Option<usize>,
) -> AppResult<Vec<FontFamily>> {
    let needle = format!("%{}%", query);
    let mut statement = connection.prepare(
        r#"
        SELECT id, family, category, source, variants_json, metadata_json, subsets_json,
               is_favorite, is_installed
        FROM font_families
        WHERE family LIKE ?1
        ORDER BY family COLLATE NOCASE
        "#,
    )?;

    let rows = statement.query_map(params![needle], |row| read_font_family_row(connection, row))?;
    let mut fonts = collect_rows(rows)?;

    if let Some(categories) = categories {
        fonts.retain(|font| categories.iter().any(|category| category == &font.category));
    }

    if let Some(subsets) = subsets {
        fonts.retain(|font| {
            font.subsets.as_ref().is_some_and(|font_subsets| {
                subsets.iter().any(|subset| font_subsets.contains(subset))
            })
        });
    }

    if let Some(limit) = limit {
        fonts.truncate(limit);
    }

    Ok(fonts)
}

pub fn upsert_font_family(connection: &Connection, font: &FontFamily) -> AppResult<()> {
    connection.execute(
        r#"
        INSERT INTO font_families (
            id, family, category, source, variants_json, metadata_json, subsets_json,
            is_favorite, is_installed, created_at, updated_at
        )
        VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?10)
        ON CONFLICT(id) DO UPDATE SET
            family = excluded.family,
            category = excluded.category,
            source = excluded.source,
            variants_json = excluded.variants_json,
            metadata_json = excluded.metadata_json,
            subsets_json = excluded.subsets_json,
            is_favorite = excluded.is_favorite,
            is_installed = excluded.is_installed,
            updated_at = excluded.updated_at
        "#,
        params![
            font.id,
            font.family,
            to_json(&font.category)?,
            to_json(&font.source)?,
            to_json(&font.variants)?,
            to_optional_json(&font.metadata)?,
            to_optional_json(&font.subsets)?,
            bool_to_i64(font.is_favorite),
            bool_to_i64(font.is_installed),
            MOCK_NOW,
        ],
    )?;

    connection.execute(
        "DELETE FROM font_files WHERE family_id = ?1",
        params![font.id],
    )?;

    for file in &font.files {
        upsert_font_file(connection, file)?;
    }

    if font.is_favorite {
        set_favorite(connection, &font.id, true)?;
    }

    Ok(())
}

pub fn upsert_font_file(connection: &Connection, file: &FontFile) -> AppResult<()> {
    connection.execute(
        r#"
        INSERT INTO font_files (
            id, family_id, variant_id, file_name, format, path, url, checksum,
            size_bytes, created_at, updated_at
        )
        VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?10)
        ON CONFLICT(id) DO UPDATE SET
            family_id = excluded.family_id,
            variant_id = excluded.variant_id,
            file_name = excluded.file_name,
            format = excluded.format,
            path = excluded.path,
            url = excluded.url,
            checksum = excluded.checksum,
            size_bytes = excluded.size_bytes,
            updated_at = excluded.updated_at
        "#,
        params![
            file.id,
            file.family_id,
            file.variant_id,
            file.file_name,
            to_json(&file.format)?,
            file.path,
            file.url,
            file.checksum,
            file.size_bytes.map(|value| value as i64),
            MOCK_NOW,
        ],
    )?;

    Ok(())
}

pub fn set_favorite(
    connection: &Connection,
    family_id: &str,
    favorite: bool,
) -> AppResult<Option<FontFamily>> {
    connection.execute(
        "UPDATE font_families SET is_favorite = ?1, updated_at = ?2 WHERE id = ?3",
        params![bool_to_i64(favorite), MOCK_NOW, family_id],
    )?;

    if favorite {
        connection.execute(
            "INSERT OR IGNORE INTO favorites (family_id, created_at) VALUES (?1, ?2)",
            params![family_id, MOCK_NOW],
        )?;
    } else {
        connection.execute(
            "DELETE FROM favorites WHERE family_id = ?1",
            params![family_id],
        )?;
    }

    get_font_family(connection, family_id)
}

pub fn get_font_family(connection: &Connection, family_id: &str) -> AppResult<Option<FontFamily>> {
    let mut statement = connection.prepare(
        r#"
        SELECT id, family, category, source, variants_json, metadata_json, subsets_json,
               is_favorite, is_installed
        FROM font_families
        WHERE id = ?1
        "#,
    )?;

    let font = statement
        .query_row(params![family_id], |row| {
            read_font_family_row(connection, row)
        })
        .optional()?;

    Ok(font)
}

pub fn list_installed_fonts(connection: &Connection) -> AppResult<Vec<InstalledFont>> {
    let mut statement = connection.prepare(
        r#"
        SELECT installed_fonts.id, installed_fonts.family_id, font_families.family,
               installed_fonts.post_script_name, installed_fonts.full_name,
               font_families.category, installed_fonts.style, installed_fonts.weight,
               font_families.source, installed_fonts.scope, font_families.metadata_json,
               installed_fonts.installed_at, installed_fonts.is_managed, installed_fonts.is_duplicate
        FROM installed_fonts
        JOIN font_families ON font_families.id = installed_fonts.family_id
        ORDER BY font_families.family COLLATE NOCASE
        "#,
    )?;

    let rows = statement.query_map([], |row| {
        let family_id: String = row.get(1)?;
        let metadata_json: Option<String> = row.get(10)?;

        Ok(InstalledFont {
            id: row.get(0)?,
            family: row.get(2)?,
            post_script_name: row.get(3)?,
            full_name: row.get(4)?,
            category: from_json::<FontCategory>(&row.get::<_, String>(5)?)?,
            style: from_json::<FontStyle>(&row.get::<_, String>(6)?)?,
            weight: row.get::<_, i64>(7)? as u16,
            source: from_json::<FontSource>(&row.get::<_, String>(8)?)?,
            scope: from_json::<InstallScope>(&row.get::<_, String>(9)?)?,
            files: list_font_files(connection, &family_id)?,
            metadata: from_optional_json(metadata_json)?,
            installed_at: row.get(11)?,
            is_managed: i64_to_bool(row.get(12)?),
            is_duplicate: i64_to_bool(row.get(13)?),
        })
    })?;

    collect_rows(rows)
}

pub fn upsert_installed_font(
    connection: &Connection,
    installed_font: &InstalledFont,
) -> AppResult<()> {
    let family_id = installed_font
        .files
        .first()
        .map(|file| file.family_id.as_str())
        .unwrap_or(installed_font.id.as_str());

    connection.execute(
        r#"
        INSERT INTO installed_fonts (
            id, family_id, post_script_name, full_name, style, weight, scope,
            installed_at, is_managed, is_duplicate
        )
        VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)
        ON CONFLICT(id) DO UPDATE SET
            family_id = excluded.family_id,
            post_script_name = excluded.post_script_name,
            full_name = excluded.full_name,
            style = excluded.style,
            weight = excluded.weight,
            scope = excluded.scope,
            installed_at = excluded.installed_at,
            is_managed = excluded.is_managed,
            is_duplicate = excluded.is_duplicate
        "#,
        params![
            installed_font.id,
            family_id,
            installed_font.post_script_name,
            installed_font.full_name,
            to_json(&installed_font.style)?,
            installed_font.weight as i64,
            to_json(&installed_font.scope)?,
            installed_font.installed_at,
            bool_to_i64(installed_font.is_managed),
            bool_to_i64(installed_font.is_duplicate),
        ],
    )?;

    connection.execute(
        "UPDATE font_families SET is_installed = 1 WHERE id = ?1",
        params![family_id],
    )?;

    Ok(())
}

pub fn upsert_scanned_fonts(connection: &Connection, fonts: &[InstalledFont]) -> AppResult<()> {
    for font in fonts {
        let family = crate::fonts::normalizer::as_family(font);
        upsert_font_family(connection, &family)?;
        upsert_installed_font(connection, font)?;
    }
    Ok(())
}

pub fn mark_font_family_installed(connection: &Connection, family_id: &str) -> AppResult<()> {
    connection.execute(
        "UPDATE font_families SET is_installed = 1, updated_at = ?1 WHERE id = ?2",
        params![MOCK_NOW, family_id],
    )?;
    Ok(())
}

pub fn uninstall_font(connection: &Connection, family_id: &str) -> AppResult<Vec<FontFile>> {
    let removed_files = list_font_files(connection, family_id)?;

    connection.execute(
        "DELETE FROM installed_fonts WHERE family_id = ?1",
        params![family_id],
    )?;

    connection.execute(
        "UPDATE font_families SET is_installed = 0, updated_at = ?1 WHERE id = ?2",
        params![MOCK_NOW, family_id],
    )?;

    Ok(removed_files)
}

pub fn list_collections(connection: &Connection) -> AppResult<Vec<Collection>> {
    let mut statement = connection.prepare(
        "SELECT id, name, description, created_at, updated_at FROM collections ORDER BY name COLLATE NOCASE",
    )?;

    let rows = statement.query_map([], |row| {
        let id: String = row.get(0)?;
        let font_ids = collection_font_ids(connection, &id)?;
        let fonts = collection_fonts(connection, &font_ids)?;

        Ok(Collection {
            id,
            name: row.get(1)?,
            description: row.get(2)?,
            font_ids,
            fonts: Some(fonts),
            created_at: row.get(3)?,
            updated_at: row.get(4)?,
        })
    })?;

    collect_rows(rows)
}

pub fn create_collection(
    connection: &Connection,
    input: CreateCollectionInput,
) -> AppResult<Collection> {
    let collection = Collection {
        id: input.name.to_lowercase().replace(' ', "-"),
        name: input.name,
        description: input.description,
        font_ids: vec![],
        fonts: Some(vec![]),
        created_at: MOCK_NOW.to_string(),
        updated_at: MOCK_NOW.to_string(),
    };

    upsert_collection(connection, &collection)?;
    Ok(collection)
}

pub fn upsert_collection(connection: &Connection, collection: &Collection) -> AppResult<()> {
    connection.execute(
        r#"
        INSERT INTO collections (id, name, description, created_at, updated_at)
        VALUES (?1, ?2, ?3, ?4, ?5)
        ON CONFLICT(id) DO UPDATE SET
            name = excluded.name,
            description = excluded.description,
            updated_at = excluded.updated_at
        "#,
        params![
            collection.id,
            collection.name,
            collection.description,
            collection.created_at,
            collection.updated_at,
        ],
    )?;

    for family_id in &collection.font_ids {
        add_font_to_collection(connection, &collection.id, family_id)?;
    }

    Ok(())
}

pub fn rename_collection(connection: &Connection, collection_id: &str, name: &str, description: Option<String>) -> AppResult<Collection> {
    connection.execute(
        "UPDATE collections SET name = ?1, description = ?2, updated_at = ?3 WHERE id = ?4",
        params![name.trim(), description, MOCK_NOW, collection_id],
    )?;
    get_collection(connection, collection_id)
}

pub fn delete_collection(connection: &Connection, collection_id: &str) -> AppResult<()> {
    connection.execute("DELETE FROM collection_fonts WHERE collection_id = ?1", params![collection_id])?;
    connection.execute("DELETE FROM collections WHERE id = ?1", params![collection_id])?;
    Ok(())
}

pub fn add_font_to_collection(
    connection: &Connection,
    collection_id: &str,
    family_id: &str,
) -> AppResult<Collection> {
    connection.execute(
        "INSERT OR IGNORE INTO collection_fonts (collection_id, family_id, created_at) VALUES (?1, ?2, ?3)",
        params![collection_id, family_id, MOCK_NOW],
    )?;

    connection.execute(
        "UPDATE collections SET updated_at = ?1 WHERE id = ?2",
        params![MOCK_NOW, collection_id],
    )?;

    get_collection(connection, collection_id)
}

pub fn remove_font_from_collection(
    connection: &Connection,
    collection_id: &str,
    family_id: &str,
) -> AppResult<Collection> {
    connection.execute(
        "DELETE FROM collection_fonts WHERE collection_id = ?1 AND family_id = ?2",
        params![collection_id, family_id],
    )?;

    connection.execute(
        "UPDATE collections SET updated_at = ?1 WHERE id = ?2",
        params![MOCK_NOW, collection_id],
    )?;

    get_collection(connection, collection_id)
}

pub fn get_settings(connection: &Connection) -> AppResult<AppSettings> {
    let value_json: Option<String> = connection
        .query_row(
            "SELECT value_json FROM settings WHERE key = ?1",
            params![SETTINGS_KEY],
            |row| row.get(0),
        )
        .optional()?;

    match value_json {
        Some(value_json) => from_json(&value_json),
        None => {
            let settings = mock_settings();
            upsert_settings(connection, &settings)?;
            Ok(settings)
        }
    }
}

pub fn update_settings(
    connection: &Connection,
    input: UpdateSettingsInput,
) -> AppResult<AppSettings> {
    let mut settings = get_settings(connection)?;

    if let Some(theme) = input.theme {
        settings.theme = theme;
    }
    if let Some(preview_text) = input.preview_text {
        settings.preview_text = preview_text;
    }
    if let Some(preview_density) = input.preview_density {
        settings.preview_density = preview_density;
    }
    if let Some(default_install_scope) = input.default_install_scope {
        settings.default_install_scope = default_install_scope;
    }
    if let Some(confirm_managed_uninstalls) = input.confirm_managed_uninstalls {
        settings.confirm_managed_uninstalls = confirm_managed_uninstalls;
    }
    if let Some(auto_refresh_google_fonts) = input.auto_refresh_google_fonts {
        settings.auto_refresh_google_fonts = auto_refresh_google_fonts;
    }
    if let Some(google_fonts_api_key) = input.google_fonts_api_key {
        settings.google_fonts_api_key = Some(google_fonts_api_key);
    }
    if let Some(google_fonts_cache_ttl_hours) = input.google_fonts_cache_ttl_hours {
        settings.google_fonts_cache_ttl_hours = google_fonts_cache_ttl_hours;
    }
    if let Some(library_paths) = input.library_paths {
        settings.library_paths = library_paths;
    }

    settings.updated_at = Some(MOCK_NOW.to_string());
    upsert_settings(connection, &settings)?;

    Ok(settings)
}

pub fn upsert_settings(connection: &Connection, settings: &AppSettings) -> AppResult<()> {
    connection.execute(
        r#"
        INSERT INTO settings (key, value_json, updated_at)
        VALUES (?1, ?2, ?3)
        ON CONFLICT(key) DO UPDATE SET
            value_json = excluded.value_json,
            updated_at = excluded.updated_at
        "#,
        params![SETTINGS_KEY, to_json(settings)?, MOCK_NOW],
    )?;

    Ok(())
}

fn get_collection(connection: &Connection, collection_id: &str) -> AppResult<Collection> {
    let collection = connection.query_row(
        "SELECT id, name, description, created_at, updated_at FROM collections WHERE id = ?1",
        params![collection_id],
        |row| {
            let id: String = row.get(0)?;
            let font_ids = collection_font_ids(connection, &id)?;
            let fonts = collection_fonts(connection, &font_ids)?;

            Ok(Collection {
                id,
                name: row.get(1)?,
                description: row.get(2)?,
                font_ids,
                fonts: Some(fonts),
                created_at: row.get(3)?,
                updated_at: row.get(4)?,
            })
        },
    )?;

    Ok(collection)
}

fn get_font_family_by_name(connection: &Connection, family: &str) -> AppResult<Option<FontFamily>> {
    let mut statement = connection.prepare(
        r#"
        SELECT id, family, category, source, variants_json, metadata_json, subsets_json,
               is_favorite, is_installed
        FROM font_families
        WHERE family = ?1
        "#,
    )?;

    let font = statement
        .query_row(params![family], |row| read_font_family_row(connection, row))
        .optional()?;

    Ok(font)
}

fn read_font_family_row(
    connection: &Connection,
    row: &rusqlite::Row<'_>,
) -> rusqlite::Result<FontFamily> {
    let id: String = row.get(0)?;
    let metadata_json: Option<String> = row.get(5)?;
    let subsets_json: Option<String> = row.get(6)?;

    Ok(FontFamily {
        id: id.clone(),
        family: row.get(1)?,
        category: from_json::<FontCategory>(&row.get::<_, String>(2)?)?,
        source: from_json::<FontSource>(&row.get::<_, String>(3)?)?,
        variants: from_json::<Vec<FontVariant>>(&row.get::<_, String>(4)?)?,
        files: list_font_files(connection, &id)?,
        metadata: from_optional_json(metadata_json)?,
        subsets: from_optional_json(subsets_json)?,
        is_favorite: i64_to_bool(row.get(7)?),
        is_installed: i64_to_bool(row.get(8)?),
    })
}

fn list_font_files(connection: &Connection, family_id: &str) -> rusqlite::Result<Vec<FontFile>> {
    let mut statement = connection.prepare(
        r#"
        SELECT id, family_id, variant_id, file_name, format, path, url, checksum, size_bytes
        FROM font_files
        WHERE family_id = ?1
        ORDER BY file_name COLLATE NOCASE
        "#,
    )?;

    let rows = statement.query_map(params![family_id], |row| {
        let size_bytes: Option<i64> = row.get(8)?;
        Ok(FontFile {
            id: row.get(0)?,
            family_id: row.get(1)?,
            variant_id: row.get(2)?,
            file_name: row.get(3)?,
            format: from_json::<FontFileFormat>(&row.get::<_, String>(4)?)?,
            path: row.get(5)?,
            url: row.get(6)?,
            checksum: row.get(7)?,
            size_bytes: size_bytes.map(|value| value as u64),
        })
    })?;

    collect_rows(rows)
}

fn collection_font_ids(
    connection: &Connection,
    collection_id: &str,
) -> rusqlite::Result<Vec<String>> {
    let mut statement = connection.prepare(
        "SELECT family_id FROM collection_fonts WHERE collection_id = ?1 ORDER BY created_at",
    )?;

    let rows = statement.query_map(params![collection_id], |row| row.get(0))?;
    collect_rows(rows)
}

fn collection_fonts(
    connection: &Connection,
    font_ids: &[String],
) -> rusqlite::Result<Vec<FontFamily>> {
    let mut fonts = Vec::with_capacity(font_ids.len());

    for font_id in font_ids {
        if let Some(font) = get_font_family(connection, font_id).map_err(to_rusqlite_error)? {
            fonts.push(font);
        }
    }

    Ok(fonts)
}

fn collect_rows<T, F>(rows: rusqlite::MappedRows<'_, F>) -> rusqlite::Result<Vec<T>>
where
    F: FnMut(&rusqlite::Row<'_>) -> rusqlite::Result<T>,
{
    rows.collect()
}

fn to_json<T: serde::Serialize>(value: &T) -> AppResult<String> {
    Ok(serde_json::to_string(value)?)
}

fn to_optional_json<T: serde::Serialize>(value: &Option<T>) -> AppResult<Option<String>> {
    value.as_ref().map(to_json).transpose()
}

fn from_json<T: serde::de::DeserializeOwned>(value: &str) -> rusqlite::Result<T> {
    serde_json::from_str(value).map_err(to_rusqlite_error)
}

fn from_optional_json<T: serde::de::DeserializeOwned>(
    value: Option<String>,
) -> rusqlite::Result<Option<T>> {
    value.map(|value| from_json(&value)).transpose()
}

fn to_rusqlite_error(error: impl std::error::Error + Send + Sync + 'static) -> rusqlite::Error {
    rusqlite::Error::ToSqlConversionFailure(Box::new(error))
}

fn bool_to_i64(value: bool) -> i64 {
    i64::from(value)
}

fn i64_to_bool(value: i64) -> bool {
    value != 0
}
