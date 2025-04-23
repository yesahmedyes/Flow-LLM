import { create } from "zustand";
import type { files } from "~/server/db/schema";

export type FileData = typeof files.$inferSelect;

interface FilesStore {
  files: FileData[];
  contentLoaded: boolean;
  addFiles: (files: FileData[]) => void;
  setContentLoaded: (contentLoaded: boolean) => void;
  addFile: (file: FileData) => void;
  removeFile: (fileId: string) => void;
  updateFile: (fileId: string, file: FileData) => void;
}

export const useFilesStore = create<FilesStore>()((set) => ({
  files: [],
  contentLoaded: false,
  addFiles: (files) =>
    set((state) => {
      const existingFileIds = new Set(state.files.map((file) => file.id));

      const newFiles = files.filter((file) => !existingFileIds.has(file.id));

      return { files: [...state.files, ...newFiles], contentLoaded: true };
    }),
  setContentLoaded: (contentLoaded) => set({ contentLoaded }),
  addFile: (file) => set((state) => ({ files: [...state.files, file] })),
  removeFile: (fileId) => set((state) => ({ files: state.files.filter((file) => file.id !== fileId) })),
  updateFile: (fileId, file) => set((state) => ({ files: state.files.map((f) => (f.id === fileId ? file : f)) })),
}));
