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
        "glass-control size-8 border-transparent text-muted-foreground hover:text-foreground",
        active && "selected-surface text-foreground",
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
