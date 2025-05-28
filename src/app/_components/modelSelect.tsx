"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/app/_components/ui/select";
import { useModelsStore } from "~/app/stores/modelsStore";

export default function ModelSelect() {
  const { preferredModels, selectedModel, setSelectedModel } = useModelsStore();

  return (
    <Select value={selectedModel} onValueChange={(value) => setSelectedModel(value)}>
      <SelectTrigger>
        <SelectValue placeholder="Select a model" />
      </SelectTrigger>
      <SelectContent>
        {preferredModels.map((model) => (
          <SelectItem key={model.id} value={model.id}>
            {model.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
