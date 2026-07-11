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
              ? "border-violet-300/40 bg-violet-400/15 text-white"
              : "border-white/10 bg-black/20 text-white/65 hover:border-white/20 hover:bg-white/[0.06] hover:text-white",
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
