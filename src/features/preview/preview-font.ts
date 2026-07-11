import { useEffect, useMemo } from "react";
import type { FontFamily, FontFile, FontFileFormat } from "@/types/font";

const formatMap: Record<FontFileFormat, string> = {
  ttf: "truetype",
  otf: "opentype",
  woff: "woff",
  woff2: "woff2",
  ttc: "truetype-collection",
  unknown: "truetype",
};

export function previewFontName(font: FontFamily) {
  return `fontsequal-preview-${font.id}`;
}

export function usePreviewFont(font?: FontFamily, weight = 400, italic = false) {
  const previewAsset = useMemo(() => findPreviewAsset(font, weight, italic), [font, italic, weight]);
  const fontFile = previewAsset?.file;
  const fontName = font ? previewFontName(font) : undefined;

  useEffect(() => {
    if (!font || !fontFile?.url || !fontName || !previewAsset) return;

    const id = `fontsequal-preview-face-${font.id}-${fontFile.id}`;
    if (document.getElementById(id)) return;

    const style = document.createElement("style");
    style.id = id;
    const fontWeight = previewAsset.variant?.variableAxes ? "100 900" : previewAsset.variant?.weight ?? 400;
    const fontStyle = previewAsset.variant?.style ?? "normal";
    style.textContent = `@font-face { font-family: "${fontName}"; src: url("${fontFile.url}") format("${formatMap[fontFile.format]}"); font-style: ${fontStyle}; font-weight: ${fontWeight}; font-display: swap; }`;
    document.head.appendChild(style);
  }, [font, fontFile, fontName, previewAsset]);

  return fontFile?.url ? fontName : undefined;
}

function findPreviewAsset(font: FontFamily | undefined, weight: number, italic: boolean) {
  if (!font) return undefined;
  const style = italic ? "italic" : "normal";
  const variant = font.variants.find((item) => item.weight === weight && item.style === style)
    ?? font.variants.find((item) => item.style === style)
    ?? font.variants.find((item) => item.weight === weight)
    ?? font.variants[0];

  const file = font.files.find((item) => item.variantId === variant?.id && item.url)
    ?? font.files.find((item) => item.url);

  return file ? { file, variant } : undefined;
}
