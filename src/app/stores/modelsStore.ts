import { create } from "zustand";
import { DEFAULT_MODEL, type Model } from "~/lib/types/model";

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
  preferredModels: [DEFAULT_MODEL],
  contentLoaded: false,
  selectedModel: DEFAULT_MODEL.id,
  setAllModels: (models) => set({ allModels: models }),
  setPreferredModels: (models) => {
    const modelsWithDefault = [DEFAULT_MODEL, ...models];
    const newModels = Array.from(new Map(modelsWithDefault.map((model) => [model.id, model])).values());

    set({ preferredModels: newModels });

    localStorage.setItem("preferredModels", JSON.stringify(models));
  },
  setSelectedModel: (modelId) => {
    set({ selectedModel: modelId });
  },
  setContentLoaded: (contentLoaded) => {
    set({ contentLoaded });
  },
}));
