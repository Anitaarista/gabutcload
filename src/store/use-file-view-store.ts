'use client';

import { create } from 'zustand';

type ViewMode = 'grid' | 'list' | 'column' | 'gallery';

type FileViewState = {
  viewMode: ViewMode;
  selectedIds: string[];
  setViewMode: (viewMode: ViewMode) => void;
  toggleSelected: (id: string) => void;
  clearSelected: () => void;
};

export const useFileViewStore = create<FileViewState>((set) => ({
  viewMode: 'grid',
  selectedIds: [],
  setViewMode: (viewMode) => set({ viewMode }),
  toggleSelected: (id) =>
    set((state) => ({
      selectedIds: state.selectedIds.includes(id)
        ? state.selectedIds.filter((item) => item !== id)
        : [...state.selectedIds, id]
    })),
  clearSelected: () => set({ selectedIds: [] })
}));