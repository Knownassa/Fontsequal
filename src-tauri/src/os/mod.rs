#[cfg(target_os = "linux")]
pub mod linux;

#[cfg(target_os = "windows")]
pub mod windows;

#[cfg(target_os = "windows")]
pub use windows::platform_name;

#[cfg(target_os = "linux")]
pub use linux::platform_name;

#[cfg(not(any(target_os = "windows", target_os = "linux")))]
pub fn platform_name() -> &'static str {
    "unsupported"
}
