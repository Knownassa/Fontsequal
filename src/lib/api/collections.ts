import { tauriInvoke } from "@/lib/tauri";
import type { Collection, CreateCollectionInput } from "@/types/collection";
import type { ApiResult } from "@/types/result";

export type FontCollectionInput = {
  collectionId: string;
  familyId: string;
};
export type RenameCollectionInput = { collectionId: string; name: string; description?: string };

export function listCollections(): Promise<ApiResult<Collection[]>> {
  return tauriInvoke("list_collections");
}

export function createCollection(
  input: CreateCollectionInput,
): Promise<ApiResult<Collection>> {
  return tauriInvoke("create_collection", { input });
}

export function addFontToCollection(
  input: FontCollectionInput,
): Promise<ApiResult<Collection>> {
  return tauriInvoke("add_font_to_collection", { input });
}
export function renameCollection(input: RenameCollectionInput): Promise<ApiResult<Collection>> { return tauriInvoke("rename_collection", { input }); }
export function deleteCollection(collectionId: string): Promise<ApiResult<void>> { return tauriInvoke("delete_collection", { collectionId }); }

export function removeFontFromCollection(
  input: FontCollectionInput,
): Promise<ApiResult<Collection>> {
  return tauriInvoke("remove_font_from_collection", { input });
}

export const collectionApiExamples = {
  list: () => listCollections(),
  createBrandSet: () => createCollection({ name: "Brand refresh" }),
  addInter: () =>
    addFontToCollection({ collectionId: "brand-refresh", familyId: "inter" }),
};
