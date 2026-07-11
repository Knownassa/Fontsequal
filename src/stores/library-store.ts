import { create } from "zustand";

type LibraryView = "grid" | "list";

type LibraryState = {
  query: string;
  view: LibraryView;
  setQuery: (query: string) => void;
  setView: (view: LibraryView) => void;
};

export const useLibraryStore = create<LibraryState>((set) => ({
  query: "",
  view: "grid",
  setQuery: (query) => set({ query }),
  setView: (view) => set({ view }),
}));
