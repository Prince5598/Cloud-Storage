import { create } from 'zustand';

export interface FileItem {
  id: string;
  name: string;
  path: string;
  size: number;
  type: string;
  fileUrl: string;
  thumbnailUrl?: string;
  userId: string;
  parentId?: string;
  isFolder: boolean;
  isStarred: boolean;
  isTrash: boolean;
  createdAt: string;
  updatedAt: string;
}

interface FileStore {
  files: FileItem[];
  currentFolder: string | null;
  loading: boolean;
  searchQuery: string;
  view: 'home' | 'starred' | 'trash';
  viewMode: 'grid' | 'list';
  
  // Actions
  setFiles: (files: FileItem[]) => void;
  addFile: (file: FileItem) => void;
  updateFile: (id: string, updates: Partial<FileItem>) => void;
  removeFile: (id: string) => void;
  setCurrentFolder: (folderId: string | null) => void;
  setLoading: (loading: boolean) => void;
  setSearchQuery: (query: string) => void;
  setView: (view: 'home' | 'starred' | 'trash') => void;
  setViewMode: (mode: 'grid' | 'list') => void;
  
  // Computed
  getFilteredFiles: () => FileItem[];
  getBreadcrumbs: () => { id: string; name: string }[];
  getStarredCount: () => number;
  getTrashCount: () => number;
}

export const useFileStore = create<FileStore>((set, get) => ({
  files: [],
  currentFolder: null,
  loading: false,
  searchQuery: '',
  view: 'home',
  viewMode: 'grid',
  
  setFiles: (files) => set({ files }),
  addFile: (file) => set((state) => ({ files: [...state.files, file] })),
  updateFile: (id, updates) => set((state) => ({
    files: state.files.map(file => file.id === id ? { ...file, ...updates } : file)
  })),
  removeFile: (id) => set((state) => ({
    files: state.files.filter(file => file.id !== id)
  })),
  setCurrentFolder: (folderId) => set({ currentFolder: folderId }),
  setLoading: (loading) => set({ loading }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setView: (view) => set({ view }),
  setViewMode: (mode) => set({ viewMode: mode }),
  
  getFilteredFiles: () => {
    const { files, currentFolder, searchQuery, view } = get();
    
    let filtered = files.filter(file => {
      // Filter by view
      if (view === 'trash') return file.isTrash;
      if (view === 'starred') return file.isStarred && !file.isTrash;
      if (view === 'home') return !file.isTrash;
      
      return true;
    });
    
    // Filter by current folder (only for home view)
    if (view === 'home') {
      filtered = filtered.filter(file => file.parentId === currentFolder);
    }
    
    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(file => 
        file.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filtered;
  },
  
  getBreadcrumbs: () => {
    const { files, currentFolder } = get();
    const breadcrumbs: { id: string; name: string }[] = [];
    
    let current = currentFolder;
    while (current) {
      const folder = files.find(f => f.id === current && f.isFolder);
      if (folder) {
        breadcrumbs.unshift({ id: folder.id, name: folder.name });
        current = folder.parentId || null;
      } else {
        break;
      }
    }
    
    return breadcrumbs;
  },

  getStarredCount: () => {
    const { files } = get();
    return files.filter(file => file.isStarred && !file.isTrash).length;
  },

  getTrashCount: () => {
    const { files } = get();
    return files.filter(file => file.isTrash).length;
  }
}));