import { Badge } from "@/components/ui/badge";
import type { FontSourceBadge as SourceBadge } from "@/types/font";
const tone: Record<string, string> = { system: "border-border bg-muted text-muted-foreground", managed: "border-border bg-selected text-foreground", remote: "border-border bg-surface text-foreground" };
export function FontSourceBadge({ source }: { source: SourceBadge }) { return <Badge className={tone[source.kind]}>{source.label}</Badge>; }
