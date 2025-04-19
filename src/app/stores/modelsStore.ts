import { create } from "zustand";
import type { Model } from "~/lib/types/model";

interface ModelsStore {
  allModels: Model[];
  preferredModels: Model[];
  setAllModels: (models: Model[]) => void;
  setPreferredModels: (models: Model[]) => void;
  addPreferredModel: (model: Model) => void;
  removePreferredModel: (model: Model) => void;
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
      preferredModels: state.preferredModels.filter((m) => m.id !== model.id),
    })),
}));
