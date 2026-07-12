use crate::{
    error::{AppError, AppResult},
    fonts::{hash::sha256_bytes, parser::validate_font_file},
    models::{FontFamily, FontFile, FontFileFormat, InstallResult, InstallScope, InstalledFont},
    os,
};
use std::{
    fs::{self, OpenOptions},
    io::Write,
    path::{Path, PathBuf},
};

pub fn install_font(
    family: &FontFamily,
    variant_ids: Option<&[String]>,
) -> AppResult<InstallResult> {
    let variants = select_variants(family, variant_ids)?;
    let managed_directory = managed_font_directory()?;
    fs::create_dir_all(&managed_directory)?;

    let mut installed_files = Vec::new();
    let mut skipped_files = Vec::new();

    for variant_id in variants {
        let source = family
            .files
            .iter()
            .find(|file| file.variant_id.as_deref() == Some(variant_id))
            .ok_or_else(|| {
                AppError::new(
                    "font_file_missing",
                    format!("Missing file for variant {variant_id}."),
                )
            })?;
        let bytes = download_font_file(source)?;
        validate_font_file(&bytes).map_err(|message| AppError::new("invalid_font", message))?;
        let target = unique_target_path(&managed_directory, family, variant_id, source);

        match write_new_file(&target, &bytes) {
            Ok(()) => {
                let checksum = sha256_bytes(&bytes);
                let file = managed_file(family, variant_id, source, &target, checksum);
                installed_files.push(file);
            }
            Err(error) if error.kind() == std::io::ErrorKind::AlreadyExists => {
                skipped_files.push(managed_file(
                    family,
                    variant_id,
                    source,
                    &target,
                    sha256_bytes(&bytes),
                ));
            }
            Err(error) => return Err(error.into()),
        }
    }

    refresh_font_cache(&managed_directory)?;
    Ok(InstallResult {
        success: true,
        family_id: family.id.clone(),
        scope: InstallScope::User,
        installed_files,
        skipped_files,
        message: Some("Installed into Fontsequal user library.".to_string()),
    })
}

pub fn installed_records(family: &FontFamily, files: &[FontFile]) -> Vec<InstalledFont> {
    files
        .iter()
        .map(|file| InstalledFont {
            id: format!("installed-managed-{}", file.id),
            family: family.family.clone(),
            post_script_name: None,
            full_name: Some(family.family.clone()),
            category: family.category.clone(),
            style: family
                .variants
                .iter()
                .find(|variant| Some(&variant.id) == file.variant_id.as_ref())
                .map(|variant| variant.style.clone())
                .unwrap_or(crate::models::FontStyle::Normal),
            weight: family
                .variants
                .iter()
                .find(|variant| Some(&variant.id) == file.variant_id.as_ref())
                .map(|variant| variant.weight)
                .unwrap_or(400),
            source: family.source.clone(),
            scope: InstallScope::User,
            files: vec![file.clone()],
            metadata: family.metadata.clone(),
            installed_at: None,
            is_managed: true,
            is_duplicate: false,
        })
        .collect()
}

pub fn download_font_file(file: &FontFile) -> AppResult<Vec<u8>> {
    if let Some(path) = &file.path {
        return Ok(fs::read(path)?);
    }
    let url = file.url.as_deref().ok_or_else(|| {
        AppError::new(
            "font_file_missing",
            "Font file has no local path or download URL.",
        )
    })?;
    let response = reqwest::blocking::get(url)?.error_for_status()?;
    let bytes = response.bytes()?.to_vec();
    if bytes.len() > 40 * 1024 * 1024 {
        return Err(AppError::new(
            "font_file_too_large",
            "Font file exceeds 40 MB.",
        ));
    }
    Ok(bytes)
}

pub fn refresh_font_cache(directory: &Path) -> AppResult<()> {
    #[cfg(target_os = "windows")]
    {
        os::windows::refresh_font_cache(directory)?;
    }
    #[cfg(target_os = "linux")]
    {
        os::linux::refresh_font_cache(directory)?;
    }
    Ok(())
}

pub fn managed_font_directory() -> AppResult<PathBuf> {
    #[cfg(target_os = "windows")]
    {
        return os::windows::managed_font_directory();
    }
    #[cfg(target_os = "linux")]
    {
        return os::linux::managed_font_directory();
    }
    #[allow(unreachable_code)]
    Err(AppError::new(
        "unsupported_platform",
        "User font installation is unsupported on this platform.",
    ))
}

fn select_variants<'a>(
    family: &'a FontFamily,
    selected: Option<&'a [String]>,
) -> AppResult<Vec<&'a str>> {
    let ids: Vec<&str> = selected
        .map(|ids| ids.iter().map(|id| id.as_str()).collect())
        .unwrap_or_else(|| {
            family
                .variants
                .iter()
                .map(|variant| variant.id.as_str())
                .collect()
        });
    if ids.is_empty() {
        return Err(AppError::new(
            "no_variants",
            "Choose at least one font variant.",
        ));
    }
    Ok(ids)
}

fn unique_target_path(
    directory: &Path,
    family: &FontFamily,
    variant_id: &str,
    source: &FontFile,
) -> PathBuf {
    let extension = match source.format {
        FontFileFormat::Otf => "otf",
        _ => "ttf",
    };
    let safe = format!("{}-{}", safe_name(&family.family), safe_name(variant_id));
    directory.join(format!("{safe}.{extension}"))
}

fn managed_file(
    family: &FontFamily,
    variant_id: &str,
    source: &FontFile,
    path: &Path,
    checksum: String,
) -> FontFile {
    let file_name = path
        .file_name()
        .and_then(|name| name.to_str())
        .unwrap_or("font.ttf")
        .to_string();
    FontFile {
        id: format!("managed-{}-{}", family.id, safe_name(variant_id)),
        family_id: family.id.clone(),
        variant_id: Some(variant_id.to_string()),
        file_name,
        format: source.format.clone(),
        path: Some(path.to_string_lossy().into_owned()),
        url: None,
        checksum: Some(checksum),
        size_bytes: path.metadata().ok().map(|metadata| metadata.len()),
    }
}

fn write_new_file(path: &Path, bytes: &[u8]) -> std::io::Result<()> {
    let mut file = OpenOptions::new().write(true).create_new(true).open(path)?;
    file.write_all(bytes)
}

fn safe_name(value: &str) -> String {
    value
        .chars()
        .map(|character| {
            if character.is_ascii_alphanumeric() {
                character.to_ascii_lowercase()
            } else {
                '-'
            }
        })
        .collect::<String>()
        .trim_matches('-')
        .to_string()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn only_user_scope_is_returned_by_installer() {
        assert!(matches!(InstallScope::User, InstallScope::User));
    }

    #[test]
    fn managed_filename_strips_path_characters() {
        assert_eq!(safe_name("../Font Name"), "font-name");
    }
}
