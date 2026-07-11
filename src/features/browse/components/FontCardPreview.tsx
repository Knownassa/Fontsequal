import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { FontFamily, FontFileFormat } from "@/types/font";

const formatMap: Record<FontFileFormat, string> = {
  ttf: "truetype",
  otf: "opentype",
  woff: "woff",
  woff2: "woff2",
  ttc: "truetype-collection",
  unknown: "truetype",
};

type FontCardPreviewProps = {
  font: FontFamily;
  previewText: string;
  className?: string;
};

export function FontCardPreview({
  font,
  previewText,
  className,
}: FontCardPreviewProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const fontFile = font.files.find((file) => file.url);
  const fontFaceName = useMemo(() => `fontsequal-${font.id}`, [font.id]);

  useEffect(() => {
    const node = ref.current;
    if (!node || visible) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "160px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [visible]);

  useEffect(() => {
    if (!visible || !fontFile?.url) {
      return;
    }

    const id = `font-face-${font.id}-${fontFile.id}`;
    if (document.getElementById(id)) {
      return;
    }

    const style = document.createElement("style");
    style.id = id;
    style.textContent = `
      @font-face {
        font-family: "${fontFaceName}";
        src: url("${fontFile.url}") format("${formatMap[fontFile.format]}");
        font-display: swap;
      }
    `;
    document.head.appendChild(style);
  }, [font.id, fontFaceName, fontFile, visible]);

  return (
    <div
      ref={ref}
      className={cn(
        "relative min-h-32 overflow-hidden rounded-[18px] border border-white/10 bg-[radial-gradient(circle_at_20%_15%,rgba(255,255,255,0.12),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.025))] p-4",
        className,
      )}
    >
      <span className="absolute right-4 top-3 text-5xl font-semibold leading-none text-white/[0.035]">
        Aa
      </span>
      <p
        className="relative line-clamp-3 text-2xl font-semibold leading-tight text-white"
        style={{ fontFamily: visible && fontFile?.url ? fontFaceName : undefined }}
      >
        {previewText}
      </p>
    </div>
  );
}
