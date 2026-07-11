use crate::{
    fonts::parser::ParsedFont,
    models::{FontCategory, FontFamily, FontFile, FontFileFormat, FontMetadata, FontSource, FontVariant, InstallScope, InstalledFont},
};
use std::path::Path;

pub fn normalize_scanned_font(
    path: &Path,
    parsed: ParsedFont,
    checksum: String,
    is_managed: bool,
) -> InstalledFont {
    let short_hash = &checksum[..12];
    let family_id = format!("local-{}-{}", slug(&parsed.family), short_hash);
    let variant_id = format!("{}-{}", parsed.weight, style_label(&parsed.style));
    let file_name = path.file_name().and_then(|value| value.to_str()).unwrap_or("font.ttf").to_string();
    let file = FontFile {
        id: format!("file-{short_hash}"),
        family_id: family_id.clone(),
        variant_id: Some(variant_id.clone()),
        file_name,
        format: format_from_path(path),
        path: Some(path.to_string_lossy().into_owned()),
        url: None,
        checksum: Some(checksum.clone()),
        size_bytes: path.metadata().ok().map(|metadata| metadata.len()),
    };

    InstalledFont {
        id: format!("installed-{}-{}", short_hash, stable_path_id(path)),
        family: parsed.family.clone(),
        post_script_name: parsed.post_script_name,
        full_name: parsed.full_name.or_else(|| Some(parsed.family.clone())),
        category: FontCategory::Other,
        style: parsed.style.clone(),
        weight: parsed.weight,
        source: FontSource::Local,
        scope: if is_managed { InstallScope::User } else { InstallScope::System },
        files: vec![file],
        metadata: Some(FontMetadata {
            designer: None,
            foundry: None,
            license: None,
            version: None,
            copyright: None,
            description: Some("Scanned local font".to_string()),
            languages: None,
            glyph_count: None,
            date_added: None,
            last_modified: None,
        }),
        installed_at: None,
        is_managed,
        is_duplicate: false,
    }
}

pub fn as_family(font: &InstalledFont) -> FontFamily {
    let file = font.files.first().expect("scanned font includes a file");
    FontFamily {
        id: file.family_id.clone(),
        family: font.family.clone(),
        category: font.category.clone(),
        source: font.source.clone(),
        variants: vec![FontVariant {
            id: file.variant_id.clone().unwrap_or_else(|| "regular".to_string()),
            label: format!("{} {}", font.weight, style_label(&font.style)),
            weight: font.weight,
            style: font.style.clone(),
            stretch: None,
            variable_axes: None,
        }],
        files: font.files.clone(),
        metadata: font.metadata.clone(),
        subsets: None,
        is_favorite: false,
        is_installed: true,
    }
}

fn format_from_path(path: &Path) -> FontFileFormat {
    match path.extension().and_then(|extension| extension.to_str()).map(str::to_ascii_lowercase).as_deref() {
        Some("otf") => FontFileFormat::Otf,
        Some("ttf") => FontFileFormat::Ttf,
        _ => FontFileFormat::Unknown,
    }
}

fn slug(value: &str) -> String {
    value.chars().map(|character| if character.is_ascii_alphanumeric() { character.to_ascii_lowercase() } else { '-' }).collect::<String>().trim_matches('-').to_string()
}

fn style_label(style: &crate::models::FontStyle) -> &'static str {
    match style { crate::models::FontStyle::Italic => "italic", crate::models::FontStyle::Oblique => "oblique", crate::models::FontStyle::Normal => "regular" }
}

fn stable_path_id(path: &Path) -> String {
    let mut value: u64 = 0xcbf29ce484222325;
    for byte in path.to_string_lossy().as_bytes() { value = (value ^ u64::from(*byte)).wrapping_mul(0x100000001b3); }
    format!("{value:x}")
}
