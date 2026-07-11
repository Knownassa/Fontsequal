use crate::{error::{AppError, AppResult}, fonts::installer, models::FontFile};
use std::{fs, path::{Path, PathBuf}};

pub fn uninstall_managed_files(files: &[FontFile]) -> AppResult<Vec<FontFile>> {
    let managed_root = installer::managed_font_directory()?;
    let mut removed = Vec::new();
    for file in files {
        let path = file.path.as_deref().ok_or_else(|| AppError::new("managed_path_missing", "Managed font record has no path."))?;
        let path = validate_managed_path(&managed_root, Path::new(path))?;
        fs::remove_file(&path)?;
        removed.push(file.clone());
    }
    installer::refresh_font_cache(&managed_root)?;
    Ok(removed)
}

pub fn validate_managed_path(root: &Path, candidate: &Path) -> AppResult<PathBuf> {
    let root = root.canonicalize().map_err(|_| AppError::new("managed_folder_missing", "Fontsequal managed folder is unavailable."))?;
    let candidate = candidate.canonicalize().map_err(|_| AppError::new("font_path_missing", "Managed font file is unavailable."))?;
    if !candidate.starts_with(&root) {
        return Err(AppError::new("unsafe_font_path", "Only Fontsequal managed font files may be removed."));
    }
    Ok(candidate)
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::{fs, time::{SystemTime, UNIX_EPOCH}};

    fn test_root() -> PathBuf {
        let stamp = SystemTime::now().duration_since(UNIX_EPOCH).expect("time works").as_nanos();
        std::env::temp_dir().join(format!("fontsequal-safe-path-{stamp}"))
    }

    #[test]
    fn accepts_file_inside_managed_folder() {
        let root = test_root();
        fs::create_dir_all(&root).expect("root creates");
        let file = root.join("managed.ttf");
        fs::write(&file, b"font").expect("file writes");
        assert_eq!(validate_managed_path(&root, &file).expect("managed path allowed"), file.canonicalize().expect("canonical path"));
        fs::remove_dir_all(root).expect("root removes");
    }

    #[test]
    fn rejects_file_outside_managed_folder() {
        let root = test_root();
        let outside = test_root().with_extension("outside.ttf");
        fs::create_dir_all(&root).expect("root creates");
        fs::write(&outside, b"font").expect("outside writes");
        assert!(validate_managed_path(&root, &outside).is_err());
        fs::remove_dir_all(root).expect("root removes");
        fs::remove_file(outside).expect("outside removes");
    }
}
