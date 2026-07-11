import { Badge } from "@/components/ui/badge";
import type { FontSourceBadge as SourceBadge } from "@/types/font";
const tone: Record<string, string> = { system: "border-slate-300/20 bg-slate-400/10 text-slate-100", managed: "border-emerald-300/25 bg-emerald-400/10 text-emerald-100", remote: "border-violet-300/25 bg-violet-400/10 text-violet-100" };
export function FontSourceBadge({ source }: { source: SourceBadge }) { return <Badge className={tone[source.kind]}>{source.label}</Badge>; }
