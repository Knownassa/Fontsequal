use crate::{
    error::AppResult,
    models::{FontFamily, FontProviderKind},
    providers::provider::FontProvider,
};
use rusqlite::Connection;
pub struct BunnyFontsProvider;
impl FontProvider for BunnyFontsProvider {
    fn id(&self) -> &'static str {
        "bunny"
    }
    fn label(&self) -> &'static str {
        "Bunny"
    }
    fn kind(&self) -> FontProviderKind {
        FontProviderKind::Remote
    }
    fn list_families(&self, _connection: &Connection) -> AppResult<Vec<FontFamily>> {
        Ok(vec![])
    }
    fn get_family(
        &self,
        _connection: &Connection,
        _family_id: &str,
    ) -> AppResult<Option<FontFamily>> {
        Ok(None)
    }
}
