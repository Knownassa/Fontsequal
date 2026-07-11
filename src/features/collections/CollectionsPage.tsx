import { useMemo, useState } from "react";
import { FolderPlus, Plus, Trash2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageContainer } from "@/app/PageContainer";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { createCollection, deleteCollection, listCollections, removeFontFromCollection, renameCollection } from "@/lib/api/collections";
import type { Collection } from "@/types/collection";
import type { ApiResult } from "@/types/result";

export function CollectionsPage() {
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<string>();
  const [newName, setNewName] = useState("");
  const [search, setSearch] = useState("");
  const query = useQuery({ queryKey: ["collections"], queryFn: async () => unwrap(await listCollections()) });
  const refresh = () => void queryClient.invalidateQueries({ queryKey: ["collections"] });
  const create = useMutation({ mutationFn: async () => unwrap(await createCollection({ name: newName })), onSuccess: (collection) => { setNewName(""); setSelectedId(collection.id); refresh(); toast.success("Collection created."); } });
  const remove = useMutation({ mutationFn: async (id: string) => unwrap(await deleteCollection(id)), onSuccess: () => { setSelectedId(undefined); refresh(); toast.success("Collection deleted."); } });
  const collections = query.data ?? [];
  const selected = collections.find((collection) => collection.id === selectedId) ?? collections[0];

  return <PageContainer className="max-w-none px-4 py-4 lg:px-6"><section className="space-y-3"><div className="flex items-center justify-between border-b pb-3"><div><h2 className="text-sm font-semibold">Collections</h2><p className="mt-1 text-xs text-muted-foreground">Project-specific font sets</p></div><Dialog><DialogTrigger asChild><Button size="sm"><Plus className="size-3.5" />New collection</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Create collection</DialogTitle><DialogDescription>Name a local font set.</DialogDescription></DialogHeader><Input value={newName} placeholder="Brand refresh" onChange={(event) => setNewName(event.target.value)} /><DialogFooter><Button disabled={!newName.trim() || create.isPending} onClick={() => create.mutate()}>Create</Button></DialogFooter></DialogContent></Dialog></div>
  {!collections.length && !query.isLoading ? <EmptyState /> : <div className="grid xl:grid-cols-[minmax(0,1fr)_296px]"><div className="grid gap-3 pr-0 md:grid-cols-2 xl:pr-4 2xl:grid-cols-3">{collections.map((collection) => <CollectionCard key={collection.id} collection={collection} selected={collection.id === selected?.id} onSelect={() => setSelectedId(collection.id)} />)}</div><CollectionDetailPage collection={selected} search={search} onSearch={setSearch} onRename={(name) => selected && renameCollection({ collectionId: selected.id, name }).then(unwrap).then(refresh)} onDelete={() => selected && remove.mutate(selected.id)} onRemove={(familyId) => selected && removeFontFromCollection({ collectionId: selected.id, familyId }).then(unwrap).then(refresh)} /></div>}</section></PageContainer>;
}

export function CollectionCard({ collection, selected, onSelect }: { collection: Collection; selected: boolean; onSelect: () => void }) { return <button aria-current={selected || undefined} className={`rounded-[11px] border bg-surface p-3 text-left shadow-card transition-colors hover:bg-hover ${selected ? "border-border bg-selected" : ""}`} type="button" onClick={onSelect}><div className="grid size-8 place-items-center rounded-md bg-muted text-foreground"><FolderPlus className="size-4" /></div><h2 className="mt-6 truncate text-sm font-semibold">{collection.name}</h2><p className="mt-1 text-xs text-muted-foreground">{collection.fontIds.length} {collection.fontIds.length === 1 ? "family" : "families"}</p></button>; }

export function CollectionDetailPage({ collection, search, onSearch, onRename, onDelete, onRemove }: { collection?: Collection; search: string; onSearch: (value: string) => void; onRename: (name: string) => void; onDelete: () => void; onRemove: (familyId: string) => void }) { const [name, setName] = useState(""); const fonts = useMemo(() => (collection?.fonts ?? []).filter((font) => font.family.toLowerCase().includes(search.toLowerCase())), [collection, search]); if (!collection) return <EmptyState />; return <aside className="space-y-3 border-l bg-inspector p-3"><div className="flex items-start justify-between gap-2"><div><p className="text-[10px] font-medium uppercase tracking-[.12em] text-muted-foreground">Collection</p><h2 className="mt-1 text-base font-semibold">{collection.name}</h2></div><Button size="sm" variant="destructive" onClick={onDelete}><Trash2 className="size-3" />Delete</Button></div><div className="flex gap-2"><Input className="h-8" value={name} placeholder="Rename" onChange={(event) => setName(event.target.value)} /><Button disabled={!name.trim()} size="sm" variant="outline" onClick={() => { onRename(name); setName(""); }}>Rename</Button></div><Input className="h-8" value={search} placeholder="Search collection" onChange={(event) => onSearch(event.target.value)} />{fonts.length ? <div className="space-y-1">{fonts.map((font) => <div key={font.id} className="flex items-center justify-between gap-2 rounded-md border bg-surface px-2.5 py-2"><span className="min-w-0 truncate text-sm">{font.family}</span><Button size="sm" variant="ghost" onClick={() => onRemove(font.id)}>Remove</Button></div>)}</div> : <p className="py-8 text-center text-sm text-muted-foreground">No matching fonts in this collection.</p>}</aside>; }
function EmptyState() { return <div className="rounded-md border border-dashed bg-muted/40 px-6 py-16 text-center"><FolderPlus className="mx-auto size-6 text-muted-foreground" /><p className="mt-3 font-medium">No collections yet.</p><p className="mt-1 text-sm text-muted-foreground">Create one from a selected font or here.</p></div>; }
function unwrap<T>(result: ApiResult<T>): T { if (result.ok) return result.data; throw new Error(result.error); }
