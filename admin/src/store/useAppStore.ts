import { create } from 'zustand';

interface AppStore {
  activePortal: string;
  setActivePortal: (portal: string) => void;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;

  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isSearchModalOpen: boolean;
  setSearchModalOpen: (isOpen: boolean) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  activePortal: 'overview',
  setActivePortal: (portal) => set({ activePortal: portal }),

  isSidebarOpen: true,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),

  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
  isSearchModalOpen: false,
  setSearchModalOpen: (isOpen) => set({ isSearchModalOpen: isOpen }),
}));

export default useAppStore;
