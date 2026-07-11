mod commands;
mod db;
mod error;
mod fonts;
mod google;
mod models;
mod os;

use commands::{
    collections::{
        add_font_to_collection, create_collection, delete_collection, list_collections, remove_font_from_collection, rename_collection,
    },
    fonts::{install_font, toggle_favorite, uninstall_font},
    google_fonts::{list_google_fonts, refresh_google_fonts_cache, search_google_fonts},
    import_fonts::import_local_fonts,
    installed::{get_installed_fonts, scan_system_fonts},
    settings::{get_settings, update_settings},
};
use db::DbState;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let db = DbState::initialize(&app.handle().clone())?;
            app.manage(db);
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            list_google_fonts,
            refresh_google_fonts_cache,
            search_google_fonts,
            get_installed_fonts,
            scan_system_fonts,
            install_font,
            uninstall_font,
            import_local_fonts,
            toggle_favorite,
            list_collections,
            create_collection,
            rename_collection,
            delete_collection,
            add_font_to_collection,
            remove_font_from_collection,
            get_settings,
            update_settings
        ])
        .run(tauri::generate_context!())
        .expect("error while running Fontsequal");
}
