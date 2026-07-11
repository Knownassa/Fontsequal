import { FontPreviewPanel as PreviewLabPanel } from "@/features/preview/FontPreviewPanel";
import type { FontFamily } from "@/types/font";

type FontPreviewPanelProps = {
  font?: FontFamily;
  fonts: FontFamily[];
  onInstalled: (font: FontFamily) => void;
};

export function FontPreviewPanel({ font, fonts, onInstalled }: FontPreviewPanelProps) {
  return <PreviewLabPanel font={font} availableFonts={fonts} onInstalled={onInstalled} />;
}
