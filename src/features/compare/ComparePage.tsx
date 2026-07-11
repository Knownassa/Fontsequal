import { useQuery } from "@tanstack/react-query";
import { PageContainer } from "@/app/PageContainer";
import { searchGoogleFonts } from "@/lib/api/google-fonts";
import type { ApiResult } from "@/types/result";
import type { FontFamily } from "@/types/font";
import { FontCompareView } from "@/features/preview/FontCompareView";

export function ComparePage() {
  const fonts = useQuery({ queryKey: ["google-fonts", "compare"], queryFn: async () => unwrap(await searchGoogleFonts({ query: "", limit: 48 })) });
  return <PageContainer className="max-w-none px-4 py-4 lg:px-6"><section className="space-y-3"><header className="glass-panel flex items-center justify-between px-4 py-3"><div><h2 className="text-sm font-semibold">Compare fonts</h2><p className="mt-1 text-xs text-muted-foreground">Choose two to four families and review their specimens side by side.</p></div></header>{fonts.isError ? <div className="glass-panel px-4 py-3 text-sm text-muted-foreground">Font data is unavailable. Start the desktop app and configure the font provider to compare real families.</div> : <FontCompareView fonts={fonts.data ?? []} />}</section></PageContainer>;
}

function unwrap<T>(result: ApiResult<T>): T { if (result.ok) return result.data; throw new Error(result.error); }
