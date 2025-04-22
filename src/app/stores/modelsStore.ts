import { create } from "zustand";
import type { Model } from "~/lib/types/model";

interface ModelsStore {
  allModels: Model[];
  preferredModels: string[];
  setAllModels: (models: Model[]) => void;
  setPreferredModels: (models: string[]) => void;
  addPreferredModel: (model: string) => void;
  removePreferredModel: (model: string) => void;
}

export const useModelsStore = create<ModelsStore>()((set) => ({
  allModels: [],
  preferredModels: [],
  setAllModels: (models) => set({ allModels: models }),
  setPreferredModels: (models) => set({ preferredModels: models }),
  addPreferredModel: (model) =>
    set((state) => ({
      preferredModels: [...state.preferredModels, model],
    })),
  removePreferredModel: (model) =>
    set((state) => ({
      preferredModels: state.preferredModels.filter((m) => m !== model),
    })),
}));
