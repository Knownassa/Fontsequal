use crate::models::FontStyle;
use std::{fs, path::Path};
use ttf_parser::{name_id, Face};

#[derive(Debug, Clone)]
pub struct ParsedFont {
    pub family: String,
    pub full_name: Option<String>,
    pub post_script_name: Option<String>,
    pub style: FontStyle,
    pub weight: u16,
}

pub fn parse_font(path: &Path) -> Result<ParsedFont, String> {
    let bytes = fs::read(path).map_err(|error| error.to_string())?;
    parse_font_bytes(&bytes, path)
}

pub fn validate_font_file(bytes: &[u8]) -> Result<(), String> {
    Face::parse(bytes, 0).map(|_| ()).map_err(|error| error.to_string())
}

pub fn parse_font_bytes(bytes: &[u8], path: &Path) -> Result<ParsedFont, String> {
    let face = Face::parse(bytes, 0).map_err(|error| error.to_string())?;
    let family = name(&face, name_id::FAMILY)
        .or_else(|| name(&face, name_id::TYPOGRAPHIC_FAMILY))
        .unwrap_or_else(|| fallback_family(path));
    let full_name = name(&face, name_id::FULL_NAME);
    let post_script_name = name(&face, name_id::POST_SCRIPT_NAME);
    let style = if face.is_italic() { FontStyle::Italic } else { FontStyle::Normal };

    Ok(ParsedFont {
        family,
        full_name,
        post_script_name,
        style,
        weight: face.weight().to_number(),
    })
}

fn name(face: &Face<'_>, name_id: u16) -> Option<String> {
    face.names()
        .into_iter()
        .find(|record| record.name_id == name_id)
        .and_then(|record| record.to_string())
        .filter(|value| !value.trim().is_empty())
}

fn fallback_family(path: &Path) -> String {
    path.file_stem()
        .and_then(|value| value.to_str())
        .unwrap_or("Unknown font")
        .replace(['-', '_'], " ")
}
