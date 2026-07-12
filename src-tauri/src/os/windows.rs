use crate::error::{AppError, AppResult};
use std::{
    env,
    path::{Path, PathBuf},
};

pub fn font_locations() -> Vec<(PathBuf, bool)> {
    let mut locations = Vec::new();

    if let Some(windir) = env::var_os("WINDIR") {
        locations.push((PathBuf::from(windir).join("Fonts"), false));
    }

    if let Some(local_app_data) = env::var_os("LOCALAPPDATA") {
        let base = PathBuf::from(local_app_data);
        locations.push((base.join("Microsoft/Windows/Fonts"), false));
        locations.push((base.join("Fontsequal/fonts"), true));
    }

    locations
}

pub fn platform_name() -> &'static str {
    "windows"
}

pub fn managed_font_directory() -> AppResult<PathBuf> {
    let local_app_data = env::var_os("LOCALAPPDATA").ok_or_else(|| {
        AppError::new(
            "local_app_data_missing",
            "LOCALAPPDATA is required for user font installation.",
        )
    })?;
    Ok(PathBuf::from(local_app_data).join("Fontsequal/fonts"))
}

#[cfg(target_os = "windows")]
pub fn refresh_font_cache(directory: &Path) -> AppResult<()> {
    use std::os::windows::ffi::OsStrExt;
    if let Ok(entries) = std::fs::read_dir(directory) {
        for entry in entries.flatten() {
            let path = entry.path();
            let supported = matches!(
                path.extension()
                    .and_then(|value| value.to_str())
                    .map(str::to_ascii_lowercase)
                    .as_deref(),
                Some("ttf") | Some("otf")
            );
            if supported {
                let wide_path = path
                    .as_os_str()
                    .encode_wide()
                    .chain(Some(0))
                    .collect::<Vec<_>>();
                unsafe {
                    let _ =
                        AddFontResourceExW(wide_path.as_ptr(), FR_PRIVATE, std::ptr::null_mut());
                }
            }
        }
    }
    unsafe {
        let _ = SendMessageTimeoutW(
            HWND_BROADCAST,
            WM_FONTCHANGE,
            0,
            0,
            SMTO_ABORTIFHUNG,
            1000,
            std::ptr::null_mut(),
        );
    }
    Ok(())
}

#[cfg(target_os = "windows")]
const FR_PRIVATE: u32 = 0x10;
#[cfg(target_os = "windows")]
const HWND_BROADCAST: isize = 0xffff;
#[cfg(target_os = "windows")]
const WM_FONTCHANGE: u32 = 0x001d;
#[cfg(target_os = "windows")]
const SMTO_ABORTIFHUNG: u32 = 0x0002;
#[cfg(target_os = "windows")]
#[link(name = "gdi32")]
extern "system" {
    fn AddFontResourceExW(path: *const u16, flags: u32, reserved: *mut core::ffi::c_void) -> i32;
}
#[cfg(target_os = "windows")]
#[link(name = "user32")]
extern "system" {
    fn SendMessageTimeoutW(
        window: isize,
        message: u32,
        wparam: usize,
        lparam: isize,
        flags: u32,
        timeout: u32,
        result: *mut usize,
    ) -> isize;
}
