import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { addFontToCollection, createCollection, listCollections } from "@/lib/api/collections";
import type { ApiResult } from "@/types/result";

export function AddToCollectionDialog({ familyId }: { familyId: string }) {
  const queryClient = useQueryClient(); const [open, setOpen] = useState(false); const [name, setName] = useState("");
  const collections = useQuery({ queryKey: ["collections"], queryFn: async () => unwrap(await listCollections()), enabled: open });
  const add = useMutation({ mutationFn: async (collectionId: string) => unwrap(await addFontToCollection({ collectionId, familyId })), onSuccess: () => { setOpen(false); queryClient.invalidateQueries({ queryKey: ["collections"] }); toast.success("Added to collection."); } });
  const create = useMutation({ mutationFn: async () => unwrap(await createCollection({ name })), onSuccess: (collection) => add.mutate(collection.id) });
  return <Dialog open={open} onOpenChange={setOpen}><DialogTrigger asChild><Button size="sm" variant="glass">Collect</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Add to collection</DialogTitle><DialogDescription>Stored locally on this device.</DialogDescription></DialogHeader><div className="space-y-2">{collections.data?.map((collection) => <Button key={collection.id} className="w-full justify-start" variant="glass" onClick={() => add.mutate(collection.id)}>{collection.name}</Button>)}</div><input className="h-10 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-white" placeholder="New collection" value={name} onChange={(event) => setName(event.target.value)} /><DialogFooter><Button disabled={!name.trim() || create.isPending} onClick={() => create.mutate()}>Create and add</Button></DialogFooter></DialogContent></Dialog>;
}
function unwrap<T>(result: ApiResult<T>): T { if (result.ok) return result.data; throw new Error(result.error); }
