import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { usePreviewStore } from "@/stores/preview-store";
import type { FontFamily } from "@/types/font";
import { PreviewPresetSelector } from "./PreviewPresetSelector";
import { WeightSelector } from "./WeightSelector";

type FontPreviewControlsProps = {
  font: FontFamily;
};

export function FontPreviewControls({ font }: FontPreviewControlsProps) {
  const text = usePreviewStore((state) => state.text);
  const fontSize = usePreviewStore((state) => state.fontSize);
  const letterSpacing = usePreviewStore((state) => state.letterSpacing);
  const lineHeight = usePreviewStore((state) => state.lineHeight);
  const weight = usePreviewStore((state) => state.weight);
  const italic = usePreviewStore((state) => state.italic);
  const setText = usePreviewStore((state) => state.setText);
  const setFontSize = usePreviewStore((state) => state.setFontSize);
  const setLetterSpacing = usePreviewStore((state) => state.setLetterSpacing);
  const setLineHeight = usePreviewStore((state) => state.setLineHeight);
  const setWeight = usePreviewStore((state) => state.setWeight);
  const setItalic = usePreviewStore((state) => state.setItalic);
  const italicAvailable = font.variants.some((variant) => variant.style === "italic");

  return (
    <div className="space-y-5">
      <ControlLabel label="Preset"><PreviewPresetSelector /></ControlLabel>

      <ControlLabel label="Specimen">
        <textarea
          className="mt-2 min-h-24 w-full resize-y rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-sm leading-5 text-white outline-none placeholder:text-muted-foreground focus:border-violet-300/45 focus:ring-2 focus:ring-violet-400/15"
          value={text}
          onChange={(event) => setText(event.target.value)}
        />
      </ControlLabel>

      <ControlLabel label="Weight">
        <div className="mt-2 flex items-center justify-between gap-3">
          <WeightSelector variants={font.variants} value={weight} onChange={setWeight} />
          <Button
            aria-pressed={italic}
            className={cn(italic && "border-violet-300/40 bg-violet-400/15 text-white")}
            disabled={!italicAvailable}
            size="sm"
            type="button"
            variant="glass"
            onClick={() => setItalic(!italic)}
          >
            Italic
          </Button>
        </div>
      </ControlLabel>

      <SliderControl label="Size" value={fontSize} min={12} max={160} step={1} suffix="px" onChange={setFontSize} />
      <SliderControl label="Tracking" value={letterSpacing} min={-4} max={16} step={0.1} suffix="px" onChange={setLetterSpacing} />
      <SliderControl label="Leading" value={lineHeight} min={0.8} max={2.2} step={0.05} suffix="" onChange={setLineHeight} />
    </div>
  );
}

function ControlLabel({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
      {label}
      <div className="mt-2 normal-case tracking-normal">{children}</div>
    </label>
  );
}

type SliderControlProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix: string;
  onChange: (value: number) => void;
};

function SliderControl({ label, value, min, max, step, suffix, onChange }: SliderControlProps) {
  return (
    <div>
      <div className="flex items-center justify-between text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
        <span>{label}</span>
        <span className="normal-case tracking-normal text-white/75">{value}{suffix}</span>
      </div>
      <Slider
        className="mt-3"
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={([next]) => {
          if (next !== undefined) onChange(next);
        }}
      />
    </div>
  );
}
