import { Download01Icon } from "@hugeicons/core-free-icons";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { HugeIcon } from "@/components/ui/huge-icon";
import { installFont } from "@/lib/api/fonts";
import type { FontFamily } from "@/types/font";

type InstallButtonProps = {
  font: FontFamily;
  onInstalled?: (font: FontFamily) => void;
  className?: string;
};

export function InstallButton({ font, onInstalled, className }: InstallButtonProps) {
  const [variantId, setVariantId] = useState(font.variants[0]?.id ?? "");
  const mutation = useMutation({
    mutationFn: async () => {
      const result = await installFont({
        familyId: font.id,
        variantIds: variantId === "all" ? font.variants.map((variant) => variant.id) : [variantId],
        scope: "user",
      });
      if (!result.ok) throw new Error(result.error);
      return result.data;
    },
    onSuccess: () => {
      onInstalled?.(font);
      toast.success(`${font.family} installed for this user.`);
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Font install failed."),
  });

  return (
    <div className={`flex items-center gap-1.5 ${className ?? ""}`}>
      {font.variants.length > 1 ? (
        <select
          aria-label={`Choose ${font.family} variant`}
          className="h-8 max-w-20 rounded-md border bg-background px-2 text-[11px] text-foreground outline-none"
          value={variantId}
          onChange={(event) => setVariantId(event.target.value)}
        >
          <option value="all">All</option>
          {font.variants.map((variant) => <option key={variant.id} value={variant.id}>{variant.label}</option>)}
        </select>
      ) : null}
      <Button className="shrink-0" disabled={font.isInstalled || mutation.isPending || !variantId} size="sm" variant={font.isInstalled ? "outline" : "default"} onClick={() => mutation.mutate()}>
        <HugeIcon icon={Download01Icon} className={mutation.isPending ? "animate-pulse" : undefined} size={15} />
        {font.isInstalled ? "Installed" : mutation.isPending ? "Installing" : "Install"}
      </Button>
    </div>
  );
}
