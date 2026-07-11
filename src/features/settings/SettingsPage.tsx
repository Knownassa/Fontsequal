import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { PageContainer } from "@/app/PageContainer";
import { useTheme } from "@/app/theme-provider";
import { refreshGoogleFontsCache } from "@/lib/api/google-fonts";
import { scanSystemFonts } from "@/lib/api/fonts";
import { getSettings, updateSettings } from "@/lib/api/settings";
import type { ApiResult } from "@/types/result";
import type { UpdateSettingsInput } from "@/types/settings";

export function SettingsPage() {
  const queryClient = useQueryClient(); const { setTheme } = useTheme(); const [danger, setDanger] = useState<"cache" | "data" | null>(null);
  const settings = useQuery({ queryKey: ["settings"], queryFn: async () => unwrap(await getSettings()) });
  const save = useMutation({ mutationFn: async (input: UpdateSettingsInput) => unwrap(await updateSettings(input)), onSuccess: (next) => { queryClient.setQueryData(["settings"], next); toast.success("Settings saved locally."); }, onError: () => toast.error("Could not save settings.") });
  const rescan = useMutation({ mutationFn: async () => unwrap(await scanSystemFonts()), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["installed-fonts"] }); toast.success("Font scan complete."); } });
  const refresh = useMutation({ mutationFn: async () => unwrap(await refreshGoogleFontsCache()), onSuccess: () => toast.success("Google Fonts cache refreshed."), onError: () => toast.error("Google Fonts connection failed.") });
  const current = settings.data;
  const patch = (input: UpdateSettingsInput) => save.mutate(input);
  return <PageContainer className="max-w-5xl"><section className="space-y-5"><div><Badge variant="glass">Settings</Badge><h1 className="mt-3 text-4xl font-semibold text-white">Local control room.</h1><p className="mt-2 text-sm text-muted-foreground">Preferences stay on this device. No cloud sync.</p></div>
    <Section title="Appearance" description="Preview defaults and color mode."><Row label="Theme" help="System follows desktop preference."><Select value={current?.theme ?? "dark"} onValueChange={(theme) => { setTheme(theme as "dark" | "light" | "system"); patch({ theme: theme as "dark" | "light" | "system" }); }}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="system">System</SelectItem><SelectItem value="light">Light</SelectItem><SelectItem value="dark">Dark</SelectItem></SelectContent></Select></Row><Row label="Default preview text"><Input defaultValue={current?.previewText} onBlur={(event) => patch({ previewText: event.target.value })} /></Row><Row label="Default preview size"><Select value={current?.previewDensity ?? "comfortable"} onValueChange={(previewDensity) => patch({ previewDensity: previewDensity as "compact" | "comfortable" | "spacious" })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="compact">Compact</SelectItem><SelectItem value="comfortable">Comfortable</SelectItem><SelectItem value="spacious">Spacious</SelectItem></SelectContent></Select></Row></Section>
    <Section title="Font management" description="User-only managed font library."><Row label="Managed font directory" help="~/.local/share/fonts/fontsequal on Linux."><Button variant="glass" onClick={() => toast.message("Managed directory opens through desktop shell in production.")}>Open directory</Button></Row><Row label="Rescan local fonts"><Button disabled={rescan.isPending} variant="glass" onClick={() => rescan.mutate()}>{rescan.isPending ? "Scanning" : "Rescan fonts"}</Button></Row><Row label="Refresh font cache"><Button variant="glass" onClick={() => rescan.mutate()}>Refresh cache</Button></Row></Section>
    <Section title="Google Fonts" description="Key remains in local SQLite settings."><Row label="API key"><Input defaultValue={current?.googleFontsApiKey} placeholder="AIza…" type="password" onBlur={(event) => patch({ googleFontsApiKey: event.target.value })} /></Row><Row label="Connection and cache" help={current?.updatedAt ? `Last local update: ${current.updatedAt}` : "Not synced yet."}><Button disabled={refresh.isPending} variant="glass" onClick={() => refresh.mutate()}>{refresh.isPending ? "Testing" : "Test and refresh cache"}</Button></Row></Section>
    <Section title="Data" description="Database stays local."><Row label="Database path" help="Fontsequal application data directory."><Button variant="glass" onClick={() => toast.message("Local JSON export available through desktop file picker.")}>Export JSON</Button></Row><Row label="Import local JSON"><Button variant="glass" onClick={() => toast.message("Choose a Fontsequal JSON export to import.")}>Import JSON</Button></Row><Row label="Reset Google Fonts cache"><Button variant="destructive" onClick={() => setDanger("cache")}>Reset cache</Button></Row><Row label="Reset all app data" help="Does not delete system fonts."><Button variant="destructive" onClick={() => setDanger("data")}>Reset all data</Button></Row></Section>
    <Section title="About" description="Fontsequal"><Row label="Version" help="0.1.0 · MIT License"><Button asChild variant="glass"><a href="https://github.com" target="_blank" rel="noreferrer">GitHub</a></Button></Row></Section>
    <Dialog open={Boolean(danger)} onOpenChange={(open) => !open && setDanger(null)}><DialogContent><DialogHeader><DialogTitle>{danger === "data" ? "Reset all local app data?" : "Reset Google Fonts cache?"}</DialogTitle><DialogDescription>{danger === "data" ? "This action is destructive. Managed files and system fonts are not removed by this dialog." : "Cached Google Fonts metadata will be removed."}</DialogDescription></DialogHeader><DialogFooter><Button variant="glass" onClick={() => setDanger(null)}>Cancel</Button><Button variant="destructive" onClick={() => { toast.message("Reset command requires desktop data migration support."); setDanger(null); }}>Confirm reset</Button></DialogFooter></DialogContent></Dialog>
  </section></PageContainer>;
}
function Section({ title, description, children }: { title: string; description: string; children: React.ReactNode }) { return <Card className="bg-card/82"><CardHeader><CardTitle>{title}</CardTitle><CardDescription>{description}</CardDescription></CardHeader><CardContent className="space-y-4">{children}</CardContent></Card>; }
function Row({ label, help, children }: { label: string; help?: string; children: React.ReactNode }) { return <div className="grid gap-3 border-t border-border/60 pt-4 md:grid-cols-[1fr_260px] md:items-center"><div><p className="font-medium">{label}</p>{help ? <p className="mt-1 text-sm text-muted-foreground">{help}</p> : null}</div><div>{children}</div></div>; }
function unwrap<T>(result: ApiResult<T>): T { if (result.ok) return result.data; throw new Error(result.error); }
