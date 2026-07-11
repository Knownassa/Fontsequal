use crate::{
    google::client::GoogleFontItem,
    models::{
        FontCategory, FontFamily, FontFile, FontFileFormat, FontMetadata, FontSource, FontStyle,
        FontVariant,
    },
};
use std::collections::HashMap;

pub fn normalize_google_fonts(items: Vec<GoogleFontItem>) -> Vec<FontFamily> {
    items.into_iter().map(normalize_google_font).collect()
}

fn normalize_google_font(item: GoogleFontItem) -> FontFamily {
    let family_id = slugify(&item.family);
    let variants = item
        .variants
        .iter()
        .map(|variant| normalize_variant(variant, item.axes.as_ref()))
        .collect::<Vec<_>>();
    let files = item
        .files
        .iter()
        .map(|(variant_id, url)| FontFile {
            id: format!("{}-{}-file", family_id, slugify(variant_id)),
            family_id: family_id.clone(),
            variant_id: Some(slugify(variant_id)),
            file_name: file_name_from_url(url, &family_id, variant_id),
            format: format_from_url(url),
            path: None,
            url: Some(url.clone()),
            checksum: None,
            size_bytes: None,
        })
        .collect::<Vec<_>>();

    FontFamily {
        id: family_id,
        family: item.family,
        category: normalize_category(&item.category),
        source: FontSource::Google,
        variants,
        files,
        metadata: Some(FontMetadata {
            designer: None,
            foundry: Some("Google Fonts".to_string()),
            license: None,
            version: Some(item.version),
            copyright: None,
            description: item.kind,
            languages: Some(item.subsets.clone()),
            glyph_count: None,
            date_added: None,
            last_modified: Some(item.last_modified),
        }),
        subsets: Some(item.subsets),
        is_favorite: false,
        is_installed: false,
    }
}

fn normalize_variant(
    variant: &str,
    axes: Option<&Vec<crate::google::client::GoogleFontAxis>>,
) -> FontVariant {
    let style = if variant.contains("italic") {
        FontStyle::Italic
    } else {
        FontStyle::Normal
    };
    let weight = variant
        .chars()
        .filter(char::is_ascii_digit)
        .collect::<String>()
        .parse::<u16>()
        .unwrap_or(400);
    let variable_axes = axes.map(|axes| {
        axes.iter()
            .map(|axis| (axis.tag.clone(), axis.start))
            .chain(
                axes.iter()
                    .map(|axis| (format!("{}_max", axis.tag), axis.end)),
            )
            .collect::<HashMap<_, _>>()
    });

    FontVariant {
        id: slugify(variant),
        label: variant_label(variant),
        weight,
        style,
        stretch: None,
        variable_axes,
    }
}

fn variant_label(variant: &str) -> String {
    if variant == "regular" {
        "Regular".to_string()
    } else {
        variant.replace("italic", " Italic").trim().to_string()
    }
}

fn normalize_category(category: &str) -> FontCategory {
    match category {
        "sans-serif" => FontCategory::SansSerif,
        "serif" => FontCategory::Serif,
        "display" => FontCategory::Display,
        "handwriting" => FontCategory::Handwriting,
        "monospace" => FontCategory::Monospace,
        _ => FontCategory::Other,
    }
}

fn format_from_url(url: &str) -> FontFileFormat {
    if url.ends_with(".ttf") {
        FontFileFormat::Ttf
    } else if url.ends_with(".otf") {
        FontFileFormat::Otf
    } else if url.ends_with(".woff2") {
        FontFileFormat::Woff2
    } else if url.ends_with(".woff") {
        FontFileFormat::Woff
    } else {
        FontFileFormat::Unknown
    }
}

fn file_name_from_url(url: &str, family_id: &str, variant_id: &str) -> String {
    url.rsplit('/')
        .next()
        .filter(|value| !value.is_empty())
        .map(ToString::to_string)
        .unwrap_or_else(|| format!("{}-{}.ttf", family_id, slugify(variant_id)))
}

fn slugify(value: &str) -> String {
    value
        .trim()
        .to_lowercase()
        .replace(' ', "-")
        .replace('_', "-")
        .replace("italic", "-italic")
        .trim_matches('-')
        .to_string()
}
