import { create } from "zustand";
import type { Model } from "~/lib/types/model";

interface ModelsStore {
  allModels: Model[];
  preferredModels: Model[];
  selectedModel: string;
  setAllModels: (models: Model[]) => void;
  setPreferredModels: (models: Model[]) => void;
  setSelectedModel: (model: string) => void;
}

export const useModelsStore = create<ModelsStore>()((set) => ({
  allModels: [],
  preferredModels: [],
  selectedModel: "openai/gpt-4o-mini",
  setAllModels: (models) => set({ allModels: models }),
  setPreferredModels: (models) => {
    set({ preferredModels: models });
  },
  setSelectedModel: (modelId) => {
    set({ selectedModel: modelId });
  },
}));
