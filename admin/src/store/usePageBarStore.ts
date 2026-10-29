import { create } from 'zustand';

// Tracks whether the current page renders its own page bar, so the automatic one stays out of the way
interface PageBarState {
  custom: number;
  register: () => () => void;
}

export const usePageBarStore = create<PageBarState>((set) => ({
  custom: 0,
  register: () => {
    set((s) => ({ custom: s.custom + 1 }));
    return () => set((s) => ({ custom: Math.max(0, s.custom - 1) }));
  },
}));
