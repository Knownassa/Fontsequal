use crate::{
    db::repositories,
    error::AppResult,
    models::{FontFamily, FontProviderKind},
    providers::provider::FontProvider,
};
use rusqlite::Connection;
pub struct ManagedFontsProvider;
impl FontProvider for ManagedFontsProvider {
    fn id(&self) -> &'static str {
        "managed"
    }
    fn label(&self) -> &'static str {
        "Managed"
    }
    fn kind(&self) -> FontProviderKind {
        FontProviderKind::Managed
    }
    fn list_families(&self, connection: &Connection) -> AppResult<Vec<FontFamily>> {
        Ok(repositories::list_font_families(connection)?
            .into_iter()
            .filter(|font| matches!(font.source, crate::models::FontSource::LocalImport))
            .collect())
    }
    fn get_family(
        &self,
        connection: &Connection,
        family_id: &str,
    ) -> AppResult<Option<FontFamily>> {
        repositories::get_font_family(connection, family_id)
    }
}
