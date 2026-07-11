use crate::error::{AppError, AppResult};
use serde::Deserialize;
use std::collections::HashMap;

const GOOGLE_FONTS_API_URL: &str = "https://www.googleapis.com/webfonts/v1/webfonts";

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GoogleFontsResponse {
    pub items: Vec<GoogleFontItem>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GoogleFontItem {
    pub family: String,
    pub variants: Vec<String>,
    pub subsets: Vec<String>,
    pub version: String,
    pub last_modified: String,
    pub files: HashMap<String, String>,
    pub category: String,
    pub kind: Option<String>,
    pub axes: Option<Vec<GoogleFontAxis>>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GoogleFontAxis {
    pub tag: String,
    pub start: f32,
    pub end: f32,
}

pub fn fetch_google_fonts(api_key: Option<&str>) -> AppResult<GoogleFontsResponse> {
    let api_key = api_key
        .filter(|key| !key.trim().is_empty())
        .ok_or_else(|| {
            AppError::new(
                "google_fonts_api_key_missing",
                "Google Fonts API key missing",
            )
        })?;

    let client = reqwest::blocking::Client::builder()
        .user_agent("Fontsequal/0.1")
        .build()?;

    let response = client
        .get(GOOGLE_FONTS_API_URL)
        .query(&[("key", api_key), ("sort", "alpha")])
        .send()?
        .error_for_status()?
        .json::<GoogleFontsResponse>()?;

    Ok(response)
}
