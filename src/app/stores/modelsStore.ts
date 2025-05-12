import { create } from "zustand";
import type { Model } from "~/lib/types/model";

interface ModelsStore {
  allModels: Model[];
  preferredModels: Model[];
  selectedModel: string;
  contentLoaded: boolean;
  setAllModels: (models: Model[]) => void;
  setPreferredModels: (models: Model[]) => void;
  setSelectedModel: (model: string) => void;
  setContentLoaded: (contentLoaded: boolean) => void;
}

export const useModelsStore = create<ModelsStore>()((set) => ({
  allModels: [],
  preferredModels: [],
  contentLoaded: false,
  selectedModel: "openai/gpt-4o-mini",
  setAllModels: (models) => set({ allModels: models }),
  setPreferredModels: (models) => {
    set({ preferredModels: models });

    localStorage.setItem("preferredModels", JSON.stringify(models));
  },
  setSelectedModel: (modelId) => {
    set({ selectedModel: modelId });
  },
  setContentLoaded: (contentLoaded) => {
    set({ contentLoaded });
  },
}));
