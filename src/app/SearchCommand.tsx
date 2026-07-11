import { useEffect, useRef } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useLibraryStore } from "@/stores/library-store";

type SearchCommandProps = {
  className?: string;
};

export function SearchCommand({ className }: SearchCommandProps) {
    const localRef = useRef<HTMLInputElement>(null);
    const query = useLibraryStore((state) => state.query);
    const setQuery = useLibraryStore((state) => state.setQuery);

    useEffect(() => {
      const focusSearch = () => {
        localRef.current?.focus();
        localRef.current?.select();
      };
      window.addEventListener("fontsequal:focus-font-search", focusSearch);
      return () => window.removeEventListener("fontsequal:focus-font-search", focusSearch);
    }, []);

    return (
      <div className={cn("glass-control relative w-full max-w-[440px]", className)}>
        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={localRef}
          aria-label="Global search"
          className="h-[34px] border-0 bg-transparent pl-8 pr-12 text-xs shadow-none focus-visible:ring-0"
          placeholder="Search fonts"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <kbd className="pointer-events-none absolute right-1.5 top-1/2 hidden -translate-y-1/2 rounded-md border border-[var(--border-soft)] bg-[var(--surface-2)] px-1.5 py-0.5 text-[10px] text-muted-foreground md:inline">
          Ctrl K
        </kbd>
      </div>
    );
}
