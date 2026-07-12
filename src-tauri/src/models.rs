use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize)]
#[serde(untagged)]
pub enum ApiResult<T> {
    Ok { ok: bool, data: T },
    Err { ok: bool, error: String },
}

impl<T> ApiResult<T> {
    pub fn ok(data: T) -> Self {
        Self::Ok { ok: true, data }
    }

    #[allow(dead_code)]
    pub fn err(error: impl Into<String>) -> Self {
        Self::Err {
            ok: false,
            error: error.into(),
        }
    }
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum FontCategory {
    SansSerif,
    Serif,
    Display,
    Handwriting,
    Monospace,
    Symbol,
    Other,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum FontStyle {
    Normal,
    Italic,
    Oblique,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum InstallScope {
    User,
    System,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum FontSource {
    Google,
    Local,
    LocalImport,
    System,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum FontFileFormat {
    Ttf,
    Otf,
    Woff,
    Woff2,
    Ttc,
    Unknown,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FontVariant {
    pub id: String,
    pub label: String,
    pub weight: u16,
    pub style: FontStyle,
    pub stretch: Option<String>,
    pub variable_axes: Option<HashMap<String, f32>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FontFile {
    pub id: String,
    pub family_id: String,
    pub variant_id: Option<String>,
    pub file_name: String,
    pub format: FontFileFormat,
    pub path: Option<String>,
    pub url: Option<String>,
    pub checksum: Option<String>,
    pub size_bytes: Option<u64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FontMetadata {
    pub designer: Option<String>,
    pub foundry: Option<String>,
    pub license: Option<String>,
    pub version: Option<String>,
    pub copyright: Option<String>,
    pub description: Option<String>,
    pub languages: Option<Vec<String>>,
    pub glyph_count: Option<u32>,
    pub date_added: Option<String>,
    pub last_modified: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FontFamily {
    pub id: String,
    pub family: String,
    pub category: FontCategory,
    pub source: FontSource,
    pub variants: Vec<FontVariant>,
    pub files: Vec<FontFile>,
    pub metadata: Option<FontMetadata>,
    pub subsets: Option<Vec<String>>,
    pub is_favorite: bool,
    pub is_installed: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum FontProviderKind {
    System,
    Managed,
    Remote,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FontSourceBadge {
    pub provider_id: String,
    pub label: String,
    pub kind: FontProviderKind,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UnifiedFont {
    pub id: String,
    pub family: String,
    pub normalized_family: String,
    pub category: FontCategory,
    pub variants: Vec<FontVariant>,
    pub files: Vec<FontFile>,
    pub metadata: Option<FontMetadata>,
    pub sources: Vec<FontSourceBadge>,
    pub is_favorite: bool,
    pub is_installed: bool,
    pub is_managed: bool,
    pub is_readonly: bool,
}

impl UnifiedFont {
    pub fn from_family(font: FontFamily) -> Self {
        let (provider_id, label, kind, is_managed, is_readonly) = match font.source {
            FontSource::Google => (
                "google".to_string(),
                "Google".to_string(),
                FontProviderKind::Remote,
                false,
                false,
            ),
            FontSource::LocalImport => (
                "managed".to_string(),
                "Managed".to_string(),
                FontProviderKind::Managed,
                true,
                false,
            ),
            FontSource::System => (
                "system".to_string(),
                "System".to_string(),
                FontProviderKind::System,
                false,
                true,
            ),
            FontSource::Local => (
                "system".to_string(),
                "System".to_string(),
                FontProviderKind::System,
                false,
                true,
            ),
        };
        Self {
            id: font.id,
            normalized_family: normalize_family_name(&font.family),
            family: font.family,
            category: font.category,
            variants: font.variants,
            files: font.files,
            metadata: font.metadata,
            sources: vec![FontSourceBadge {
                provider_id,
                label,
                kind,
            }],
            is_favorite: font.is_favorite,
            is_installed: font.is_installed,
            is_managed,
            is_readonly,
        }
    }
}

pub fn normalize_family_name(value: &str) -> String {
    value
        .trim()
        .to_lowercase()
        .split_whitespace()
        .collect::<Vec<_>>()
        .join(" ")
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct InstalledFont {
    pub id: String,
    pub family: String,
    pub post_script_name: Option<String>,
    pub full_name: Option<String>,
    pub category: FontCategory,
    pub style: FontStyle,
    pub weight: u16,
    pub source: FontSource,
    pub scope: InstallScope,
    pub files: Vec<FontFile>,
    pub metadata: Option<FontMetadata>,
    pub installed_at: Option<String>,
    pub is_managed: bool,
    #[serde(default)]
    pub is_duplicate: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct InstallResult {
    pub success: bool,
    pub family_id: String,
    pub scope: InstallScope,
    pub installed_files: Vec<FontFile>,
    pub skipped_files: Vec<FontFile>,
    pub message: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UninstallResult {
    pub success: bool,
    pub family_id: String,
    pub removed_files: Vec<FontFile>,
    pub skipped_files: Vec<FontFile>,
    pub message: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Collection {
    pub id: String,
    pub name: String,
    pub description: Option<String>,
    pub font_ids: Vec<String>,
    pub fonts: Option<Vec<FontFamily>>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateCollectionInput {
    pub name: String,
    pub description: Option<String>,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RenameCollectionInput {
    pub collection_id: String,
    pub name: String,
    pub description: Option<String>,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FontCollectionInput {
    pub collection_id: String,
    pub family_id: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum AppTheme {
    Dark,
    Light,
    System,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum PreviewDensity {
    Compact,
    Comfortable,
    Spacious,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AppSettings {
    pub theme: AppTheme,
    pub preview_text: String,
    pub preview_density: PreviewDensity,
    pub default_install_scope: InstallScope,
    pub confirm_managed_uninstalls: bool,
    pub auto_refresh_google_fonts: bool,
    pub google_fonts_api_key: Option<String>,
    pub google_fonts_cache_ttl_hours: u16,
    pub library_paths: Vec<String>,
    pub updated_at: Option<String>,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateSettingsInput {
    pub theme: Option<AppTheme>,
    pub preview_text: Option<String>,
    pub preview_density: Option<PreviewDensity>,
    pub default_install_scope: Option<InstallScope>,
    pub confirm_managed_uninstalls: Option<bool>,
    pub auto_refresh_google_fonts: Option<bool>,
    pub google_fonts_api_key: Option<String>,
    pub google_fonts_cache_ttl_hours: Option<u16>,
    pub library_paths: Option<Vec<String>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CacheRefreshResult {
    pub refreshed_at: String,
    pub family_count: u32,
    pub is_stale: bool,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GoogleFontsSearchInput {
    pub query: String,
    pub categories: Option<Vec<FontCategory>>,
    pub weights: Option<Vec<u16>>,
    pub styles: Option<Vec<FontStyle>>,
    pub favorites_only: Option<bool>,
    pub installed_only: Option<bool>,
    pub variable_only: Option<bool>,
    pub subsets: Option<Vec<String>>,
    pub limit: Option<usize>,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct InstallFontInput {
    pub family_id: String,
    pub variant_ids: Option<Vec<String>>,
    pub scope: InstallScope,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UninstallFontInput {
    pub family_id: String,
    pub scope: Option<InstallScope>,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ImportLocalFontsInput {
    pub paths: Vec<String>,
    pub scope: InstallScope,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ToggleFavoriteInput {
    pub family_id: String,
    pub favorite: Option<bool>,
}

pub fn mock_font_file(family_id: &str, variant_id: &str, file_name: &str) -> FontFile {
    FontFile {
        id: format!("{family_id}-{variant_id}-file"),
        family_id: family_id.to_string(),
        variant_id: Some(variant_id.to_string()),
        file_name: file_name.to_string(),
        format: FontFileFormat::Ttf,
        path: None,
        url: Some(format!("https://fonts.gstatic.com/mock/{file_name}")),
        checksum: None,
        size_bytes: Some(152_400),
    }
}

pub fn mock_font_family(id: &str, family: &str, category: FontCategory) -> FontFamily {
    let variant = FontVariant {
        id: "regular".to_string(),
        label: "Regular".to_string(),
        weight: 400,
        style: FontStyle::Normal,
        stretch: None,
        variable_axes: None,
    };

    FontFamily {
        id: id.to_string(),
        family: family.to_string(),
        category,
        source: FontSource::Google,
        variants: vec![variant],
        files: vec![mock_font_file(id, "regular", &format!("{id}-regular.ttf"))],
        metadata: Some(FontMetadata {
            designer: Some("Mock Foundry".to_string()),
            foundry: Some("Fontsequal Lab".to_string()),
            license: Some("OFL".to_string()),
            version: Some("1.0".to_string()),
            copyright: None,
            description: Some("Mock font family for Fontsequal command wiring.".to_string()),
            languages: Some(vec!["latin".to_string()]),
            glyph_count: Some(742),
            date_added: Some("2026-07-07T00:00:00Z".to_string()),
            last_modified: Some("2026-07-07T00:00:00Z".to_string()),
        }),
        subsets: Some(vec!["latin".to_string()]),
        is_favorite: id == "inter",
        is_installed: id == "inter",
    }
}

pub fn mock_google_fonts() -> Vec<FontFamily> {
    vec![
        mock_font_family("inter", "Inter", FontCategory::SansSerif),
        mock_font_family("fraunces", "Fraunces", FontCategory::Serif),
        mock_font_family("space-grotesk", "Space Grotesk", FontCategory::SansSerif),
    ]
}

pub fn mock_installed_fonts() -> Vec<InstalledFont> {
    mock_google_fonts()
        .into_iter()
        .filter(|font| font.is_installed)
        .map(|font| InstalledFont {
            id: format!("installed-{}", font.id),
            family: font.family,
            post_script_name: Some("Inter-Regular".to_string()),
            full_name: Some("Inter Regular".to_string()),
            category: font.category,
            style: FontStyle::Normal,
            weight: 400,
            source: font.source,
            scope: InstallScope::User,
            files: font.files,
            metadata: font.metadata,
            installed_at: Some("2026-07-07T00:00:00Z".to_string()),
            is_managed: true,
            is_duplicate: false,
        })
        .collect()
}

pub fn mock_collections() -> Vec<Collection> {
    vec![Collection {
        id: "brand-refresh".to_string(),
        name: "Brand refresh".to_string(),
        description: Some("Mock collection for product UI flow.".to_string()),
        font_ids: vec!["inter".to_string(), "fraunces".to_string()],
        fonts: Some(mock_google_fonts().into_iter().take(2).collect()),
        created_at: "2026-07-07T00:00:00Z".to_string(),
        updated_at: "2026-07-07T00:00:00Z".to_string(),
    }]
}

pub fn mock_settings() -> AppSettings {
    AppSettings {
        theme: AppTheme::Dark,
        preview_text: "The quick brown fox designs glyphs".to_string(),
        preview_density: PreviewDensity::Comfortable,
        default_install_scope: InstallScope::User,
        confirm_managed_uninstalls: true,
        auto_refresh_google_fonts: false,
        google_fonts_api_key: None,
        google_fonts_cache_ttl_hours: 24,
        library_paths: vec![],
        updated_at: Some("2026-07-07T00:00:00Z".to_string()),
    }
}
