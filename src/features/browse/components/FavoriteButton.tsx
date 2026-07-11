import { HeartIcon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { HugeIcon } from "@/components/ui/huge-icon";
import { cn } from "@/lib/utils";

type FavoriteButtonProps = {
  active: boolean;
  disabled?: boolean;
  onClick?: () => void;
};

export function FavoriteButton({ active, disabled, onClick }: FavoriteButtonProps) {
  return (
    <Button
      aria-pressed={active}
      aria-label={active ? "Remove favorite" : "Add favorite"}
      className={cn(
        "size-9 text-white/70 hover:text-white",
        active && "border-pink-300/25 bg-pink-400/12 text-pink-100",
      )}
      disabled={disabled}
      size="icon"
      variant="glass"
      onClick={(event) => {
        event.stopPropagation();
        onClick?.();
      }}
    >
      <HugeIcon icon={HeartIcon} size={17} />
    </Button>
  );
}
