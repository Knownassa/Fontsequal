use crate::{error::AppResult, models::{FontFamily, FontProviderKind, FontVariant}};
use rusqlite::Connection;

pub trait FontProvider: Send + Sync {
    fn id(&self) -> &'static str;
    fn label(&self) -> &'static str;
    fn kind(&self) -> FontProviderKind;
    fn list_families(&self, connection: &Connection) -> AppResult<Vec<FontFamily>>;
    fn get_family(&self, connection: &Connection, family_id: &str) -> AppResult<Option<FontFamily>>;
    fn download_variant(&self, _connection: &Connection, _family_id: &str, _variant_id: &str) -> AppResult<Option<FontVariant>> { Ok(None) }
}
