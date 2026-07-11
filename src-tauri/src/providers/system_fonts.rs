use crate::{db::repositories, error::AppResult, models::{FontFamily, FontProviderKind}, providers::provider::FontProvider};
use rusqlite::Connection;
pub struct SystemFontsProvider;
impl FontProvider for SystemFontsProvider {
    fn id(&self) -> &'static str { "system" }
    fn label(&self) -> &'static str { "System" }
    fn kind(&self) -> FontProviderKind { FontProviderKind::System }
    fn list_families(&self, connection: &Connection) -> AppResult<Vec<FontFamily>> { Ok(repositories::list_font_families(connection)?.into_iter().filter(|font| matches!(font.source, crate::models::FontSource::System | crate::models::FontSource::Local)).collect()) }
    fn get_family(&self, connection: &Connection, family_id: &str) -> AppResult<Option<FontFamily>> { repositories::get_font_family(connection, family_id) }
}
