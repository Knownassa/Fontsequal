use crate::{
    fonts::{hash::sha256_file, normalizer::normalize_scanned_font, parser::parse_font},
    models::InstalledFont,
    os,
};
use std::{collections::HashMap, fs, path::{Path, PathBuf}};

pub fn scan_system_fonts() -> Vec<InstalledFont> {
    let mut paths = HashMap::<PathBuf, bool>::new();
    for (location, managed) in font_locations() {
        for path in font_files_in(&location) {
            paths.entry(path).and_modify(|current| *current |= managed).or_insert(managed);
        }
    }

    let mut fonts = paths.into_iter().filter_map(|(path, managed)| {
        Some(normalize_scanned_font(&path, parse_font(&path).ok()?, sha256_file(&path).ok()?, managed))
    }).collect::<Vec<_>>();

    let mut hash_counts = HashMap::<String, usize>::new();
    for font in &fonts {
        if let Some(hash) = font.files.first().and_then(|file| file.checksum.as_ref()) {
            *hash_counts.entry(hash.clone()).or_default() += 1;
        }
    }
    for font in &mut fonts {
        let hash = font.files.first().and_then(|file| file.checksum.as_ref());
        font.is_duplicate = hash.is_some_and(|value| hash_counts.get(value).copied().unwrap_or_default() > 1);
    }

    fonts.sort_by(|left, right| left.family.to_lowercase().cmp(&right.family.to_lowercase()));
    fonts
}

fn font_locations() -> Vec<(PathBuf, bool)> {
    #[cfg(target_os = "windows")]
    { os::windows::font_locations() }
    #[cfg(target_os = "linux")]
    { os::linux::font_locations() }
    #[cfg(not(any(target_os = "windows", target_os = "linux")))]
    { Vec::new() }
}

fn font_files_in(root: &Path) -> Vec<PathBuf> {
    if !root.is_dir() { return Vec::new(); }
    let mut paths = Vec::new();
    let mut directories = vec![root.to_path_buf()];
    while let Some(directory) = directories.pop() {
        let Ok(entries) = fs::read_dir(directory) else { continue; };
        for entry in entries.flatten() {
            let path = entry.path();
            if path.is_dir() { directories.push(path); }
            else if is_supported_font(&path) { paths.push(path); }
        }
    }
    paths
}

fn is_supported_font(path: &Path) -> bool {
    matches!(path.extension().and_then(|extension| extension.to_str()).map(str::to_ascii_lowercase).as_deref(), Some("ttf") | Some("otf"))
}
