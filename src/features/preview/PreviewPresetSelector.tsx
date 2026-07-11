import { cn } from "@/lib/utils";
import { previewPresets, usePreviewStore } from "@/stores/preview-store";

export function PreviewPresetSelector() {
  const presetId = usePreviewStore((state) => state.presetId);
  const applyPreset = usePreviewStore((state) => state.applyPreset);

  return (
    <div className="grid grid-cols-2 gap-2">
      {previewPresets.map((preset) => (
        <button
          key={preset.id}
          className={cn(
            "rounded-xl border px-3 py-2 text-left text-xs font-medium transition-colors",
            preset.id === presetId
              ? "border-primary/40 bg-accent text-accent-foreground"
              : "border-input bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground",
          )}
          type="button"
          onClick={() => applyPreset(preset)}
        >
          {preset.label}
        </button>
      ))}
    </div>
  );
}
