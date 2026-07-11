use crate::{error::{AppError, AppResult}, fonts::{hash::sha256_file, installer, normalizer::{as_family, normalize_scanned_font}, parser::parse_font}, models::{FontFile, FontFileFormat, FontSource, InstalledFont}};
use std::{collections::HashSet, fs::{self, OpenOptions}, io::Write, path::{Path, PathBuf}};

pub fn import_local_fonts(paths: &[String], known_hashes: &HashSet<String>) -> AppResult<(Vec<InstalledFont>, Vec<FontFile>)> {
    let directory = installer::managed_font_directory()?;
    fs::create_dir_all(&directory)?;
    let mut installed = Vec::new(); let mut skipped = Vec::new();
    for source in paths {
        let source = Path::new(source);
        let format = font_format(source)?;
        let parsed = parse_font(source).map_err(|message| AppError::new("invalid_font", message))?;
        let hash = sha256_file(source)?;
        if known_hashes.contains(&hash) { skipped.push(skipped_file(source, format, hash)); continue; }
        let target = directory.join(format!("{}-{}.{}", safe(&parsed.family), &hash[..12], extension(&format)));
        let bytes = fs::read(source)?;
        match OpenOptions::new().write(true).create_new(true).open(&target) {
            Ok(mut file) => { file.write_all(&bytes)?; let mut record = normalize_scanned_font(&target, parsed, hash, true); record.source = FontSource::LocalImport; installed.push(record); }
            Err(error) if error.kind() == std::io::ErrorKind::AlreadyExists => skipped.push(skipped_file(source, format, hash)),
            Err(error) => return Err(error.into()),
        }
    }
    installer::refresh_font_cache(&directory)?;
    Ok((installed, skipped))
}

pub fn family_for_import(font: &InstalledFont) -> crate::models::FontFamily { as_family(font) }
fn font_format(path: &Path) -> AppResult<FontFileFormat> { match path.extension().and_then(|value| value.to_str()).map(str::to_ascii_lowercase).as_deref() { Some("ttf") => Ok(FontFileFormat::Ttf), Some("otf") => Ok(FontFileFormat::Otf), _ => Err(AppError::new("unsupported_font", "Only .ttf and .otf files can be imported.")) } }
fn extension(format: &FontFileFormat) -> &'static str { match format { FontFileFormat::Otf => "otf", _ => "ttf" } }
fn skipped_file(path: &Path, format: FontFileFormat, hash: String) -> FontFile { FontFile { id: format!("import-skip-{}", &hash[..12]), family_id: "local-import".to_string(), variant_id: None, file_name: path.file_name().and_then(|value| value.to_str()).unwrap_or("font.ttf").to_string(), format, path: Some(path.to_string_lossy().into_owned()), url: None, checksum: Some(hash), size_bytes: path.metadata().ok().map(|metadata| metadata.len()) } }
fn safe(value: &str) -> String { value.chars().map(|value| if value.is_ascii_alphanumeric() { value.to_ascii_lowercase() } else { '-' }).collect::<String>().trim_matches('-').to_string() }
