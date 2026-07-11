import type { FontFamily } from "./font";

export type Collection = {
  id: string;
  name: string;
  description?: string;
  fontIds: string[];
  fonts?: FontFamily[];
  createdAt: string;
  updatedAt: string;
};

export type CreateCollectionInput = {
  name: string;
  description?: string;
};
