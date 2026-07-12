use crate::error::{AppError, AppResult};
use std::{
    env,
    path::{Path, PathBuf},
    process::Command,
};

pub fn font_locations() -> Vec<(PathBuf, bool)> {
    let home = env::var_os("HOME").map(PathBuf::from);
    let mut locations = vec![
        (PathBuf::from("/usr/share/fonts"), false),
        (PathBuf::from("/usr/local/share/fonts"), false),
    ];

    if let Some(home) = home {
        locations.push((home.join(".local/share/fonts"), false));
        locations.push((home.join(".fonts"), false));
        locations.push((home.join(".local/share/fonts/fontsequal"), true));
    }

    locations
}

pub fn platform_name() -> &'static str {
    "linux"
}

pub fn managed_font_directory() -> AppResult<PathBuf> {
    let home = env::var_os("HOME").ok_or_else(|| {
        AppError::new(
            "home_missing",
            "HOME is required for user font installation.",
        )
    })?;
    Ok(PathBuf::from(home).join(".local/share/fonts/fontsequal"))
}

pub fn refresh_font_cache(directory: &Path) -> AppResult<()> {
    let status = Command::new("fc-cache").arg(directory).status()?;
    if status.success() {
        Ok(())
    } else {
        Err(AppError::new(
            "font_cache_failed",
            "fc-cache could not refresh Fontsequal font cache.",
        ))
    }
}
