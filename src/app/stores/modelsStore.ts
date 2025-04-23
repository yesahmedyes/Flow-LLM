import { create } from "zustand";
import type { Model } from "~/lib/types/model";

interface ModelsStore {
  allModels: Model[];
  preferredModels: string[];
  selectedModel: string;
  setAllModels: (models: Model[]) => void;
  setPreferredModels: (models: string[]) => void;
  setSelectedModel: (model: string) => void;
}

export const useModelsStore = create<ModelsStore>()((set) => ({
  allModels: [],
  preferredModels: [],
  selectedModel: "gpt-4o-mini",
  setAllModels: (models) => set({ allModels: models }),
  setPreferredModels: (models) => {
    set({ preferredModels: models });
  },
  setSelectedModel: (model) => {
    set({ selectedModel: model });
  },
}));
