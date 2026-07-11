import { forwardRef } from "react";
import { GlobalSearchIcon } from "@hugeicons/core-free-icons";
import { Input } from "@/components/ui/input";
import { HugeIcon } from "@/components/ui/huge-icon";
import { cn } from "@/lib/utils";

type SearchCommandProps = {
  className?: string;
};

export const SearchCommand = forwardRef<HTMLInputElement, SearchCommandProps>(
  ({ className }, ref) => {
    return (
      <div className={cn("relative w-full max-w-xl", className)}>
        <HugeIcon
          icon={GlobalSearchIcon}
          size={19}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          ref={ref}
          aria-label="Global search"
          className="h-12 rounded-full border-white/10 bg-white/[0.06] pl-12 pr-24 shadow-card backdrop-blur-2xl"
          placeholder="Search fonts, collections, styles..."
        />
        <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-full border border-white/10 bg-background/70 px-2.5 py-1 text-[10px] font-medium text-muted-foreground sm:inline-flex">
          Ctrl K
        </kbd>
      </div>
    );
  },
);

SearchCommand.displayName = "SearchCommand";
