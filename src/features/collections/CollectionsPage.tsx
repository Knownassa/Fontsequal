import { useMemo, useState } from "react";
import { FolderPlus, Plus, Trash2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageContainer } from "@/app/PageContainer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { addFontToCollection, createCollection, deleteCollection, listCollections, removeFontFromCollection, renameCollection } from "@/lib/api/collections";
import type { Collection } from "@/types/collection";
import type { ApiResult } from "@/types/result";

export function CollectionsPage() {
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<string>();
  const [newName, setNewName] = useState("");
  const [search, setSearch] = useState("");
  const query = useQuery({ queryKey: ["collections"], queryFn: async () => unwrap(await listCollections()) });
  const refresh = () => queryClient.invalidateQueries({ queryKey: ["collections"] });
  const create = useMutation({ mutationFn: async () => unwrap(await createCollection({ name: newName })), onSuccess: (collection) => { setNewName(""); setSelectedId(collection.id); refresh(); toast.success("Collection created."); } });
  const remove = useMutation({ mutationFn: async (id: string) => unwrap(await deleteCollection(id)), onSuccess: () => { setSelectedId(undefined); refresh(); toast.success("Collection deleted."); } });
  const collections = query.data ?? [];
  const selected = collections.find((collection) => collection.id === selectedId) ?? collections[0];

  return <PageContainer><section className="space-y-6"><div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between"><div><Badge variant="glass">Collections</Badge><h1 className="mt-3 text-4xl font-semibold text-white">Project type sets.</h1><p className="mt-2 text-sm text-muted-foreground">Local-only groups for real work.</p></div><Dialog><DialogTrigger asChild><Button><Plus className="size-4" />New collection</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Create collection</DialogTitle><DialogDescription>Name a local font set.</DialogDescription></DialogHeader><Input value={newName} placeholder="Brand refresh" onChange={(event) => setNewName(event.target.value)} /><DialogFooter><Button disabled={!newName.trim() || create.isPending} onClick={() => create.mutate()}>Create</Button></DialogFooter></DialogContent></Dialog></div>
    {!collections.length && !query.isLoading ? <EmptyState /> : <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_390px]"><div className="grid gap-4 md:grid-cols-2">{collections.map((collection) => <CollectionCard key={collection.id} collection={collection} selected={collection.id === selected?.id} onSelect={() => setSelectedId(collection.id)} />)}</div><CollectionDetailPage collection={selected} search={search} onSearch={setSearch} onRename={(name) => selected && renameCollection({ collectionId: selected.id, name }).then(unwrap).then(() => refresh())} onDelete={() => selected && remove.mutate(selected.id)} onRemove={(familyId) => selected && removeFontFromCollection({ collectionId: selected.id, familyId }).then(unwrap).then(() => refresh())} /></div>}
  </section></PageContainer>;
}

export function CollectionCard({ collection, selected, onSelect }: { collection: Collection; selected: boolean; onSelect: () => void }) { return <button className={`rounded-[22px] border p-5 text-left transition-colors ${selected ? "border-violet-300/35 bg-violet-400/10" : "border-white/10 bg-white/[0.04] hover:bg-white/[0.07]"}`} type="button" onClick={onSelect}><div className="grid size-10 place-items-center rounded-xl bg-violet-400/15 text-violet-100"><FolderPlus className="size-5" /></div><h2 className="mt-5 text-xl font-semibold text-white">{collection.name}</h2><p className="mt-2 text-sm text-muted-foreground">{collection.fontIds.length} {collection.fontIds.length === 1 ? "family" : "families"}</p></button>; }

export function CollectionDetailPage({ collection, search, onSearch, onRename, onDelete, onRemove }: { collection?: Collection; search: string; onSearch: (value: string) => void; onRename: (name: string) => void; onDelete: () => void; onRemove: (familyId: string) => void }) { const [name, setName] = useState(""); const fonts = useMemo(() => (collection?.fonts ?? []).filter((font) => font.family.toLowerCase().includes(search.toLowerCase())), [collection, search]); if (!collection) return <EmptyState />; return <aside className="space-y-4 rounded-[24px] border border-white/10 bg-white/[0.04] p-5"><div className="flex items-start justify-between gap-2"><div><p className="text-[11px] uppercase tracking-[.16em] text-muted-foreground">Collection</p><h2 className="mt-1 text-2xl font-semibold text-white">{collection.name}</h2></div><Button size="sm" variant="destructive" onClick={onDelete}><Trash2 className="size-3" />Delete</Button></div><div className="flex gap-2"><Input value={name} placeholder="Rename collection" onChange={(event) => setName(event.target.value)} /><Button disabled={!name.trim()} size="sm" variant="glass" onClick={() => { onRename(name); setName(""); }}>Rename</Button></div><Input value={search} placeholder="Search this collection" onChange={(event) => onSearch(event.target.value)} />{fonts.length ? <div className="space-y-2">{fonts.map((font) => <div key={font.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-3 py-2"><span className="text-sm text-white">{font.family}</span><Button size="sm" variant="glass" onClick={() => onRemove(font.id)}>Remove</Button></div>)}</div> : <p className="py-8 text-center text-sm text-muted-foreground">No matching fonts in this collection.</p>}</aside>; }
function EmptyState() { return <div className="rounded-[24px] border border-dashed border-white/15 bg-white/[0.03] px-6 py-16 text-center"><FolderPlus className="mx-auto size-6 text-muted-foreground" /><p className="mt-3 font-medium text-white">No collections yet.</p><p className="mt-1 text-sm text-muted-foreground">Create one from a font card or here.</p></div>; }
function unwrap<T>(result: ApiResult<T>): T { if (result.ok) return result.data; throw new Error(result.error); }
