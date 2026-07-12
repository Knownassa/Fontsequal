use crate::{
    db::repositories,
    error::AppResult,
    models::{FontFamily, FontProviderKind},
    providers::provider::FontProvider,
};
use rusqlite::Connection;
pub struct GoogleFontsProvider;
impl FontProvider for GoogleFontsProvider {
    fn id(&self) -> &'static str {
        "google"
    }
    fn label(&self) -> &'static str {
        "Google"
    }
    fn kind(&self) -> FontProviderKind {
        FontProviderKind::Remote
    }
    fn list_families(&self, connection: &Connection) -> AppResult<Vec<FontFamily>> {
        Ok(repositories::list_font_families(connection)?
            .into_iter()
            .filter(|font| matches!(font.source, crate::models::FontSource::Google))
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
