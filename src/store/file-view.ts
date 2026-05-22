import { create } from "zustand";

type FileViewState = {
  mode: "grid" | "list";
  selected: string[];
  setMode: (mode: "grid" | "list") => void;
  toggleSelected: (id: string) => void;
};

export const useFileViewStore = create<FileViewState>((set) => ({
  mode: "grid",
  selected: [],
  setMode: (mode) => set({ mode }),
  toggleSelected: (id) =>
    set((state) => ({
      selected: state.selected.includes(id) ? state.selected.filter((item) => item !== id) : [...state.selected, id],
    })),
}));
