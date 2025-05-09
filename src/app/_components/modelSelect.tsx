"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/app/_components/ui/select";
import { useModelsStore } from "~/app/stores/modelsStore";
import { DEFAULT_MODEL } from "~/lib/types/model";

export default function ModelSelect() {
  const { preferredModels, selectedModel, setSelectedModel } = useModelsStore();

  return (
    <Select value={selectedModel} onValueChange={(value) => setSelectedModel(value)}>
      <SelectTrigger>
        <SelectValue placeholder="Select a model" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={DEFAULT_MODEL.id}>{DEFAULT_MODEL.name}</SelectItem>
        {preferredModels.map((model) => (
          <SelectItem key={model.id} value={model.id}>
            {model.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
