use crate::providers::{
    google_fonts::GoogleFontsProvider, managed_fonts::ManagedFontsProvider, provider::FontProvider,
    system_fonts::SystemFontsProvider,
};
pub struct ProviderRegistry {
    providers: Vec<Box<dyn FontProvider>>,
}
impl ProviderRegistry {
    pub fn built_in() -> Self {
        Self {
            providers: vec![
                Box::new(SystemFontsProvider),
                Box::new(ManagedFontsProvider),
                Box::new(GoogleFontsProvider),
            ],
        }
    }
    pub fn all(&self) -> &[Box<dyn FontProvider>] {
        &self.providers
    }
    pub fn get(&self, id: &str) -> Option<&dyn FontProvider> {
        self.providers
            .iter()
            .map(Box::as_ref)
            .find(|provider| provider.id() == id)
    }
}
