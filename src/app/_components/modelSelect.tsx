"use client";

import { useMemo } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/app/_components/ui/select";
import { useModelsStore } from "~/app/stores/modelsStore";

export default function ModelSelect() {
  const { preferredModels, selectedModel, setSelectedModel } = useModelsStore();

  const allPreferredModels = useMemo(() => Array.from(new Set([...preferredModels, "gpt-4o-mini"])), [preferredModels]);

  return allPreferredModels.length > 0 ? (
    <Select value={selectedModel} onValueChange={setSelectedModel}>
      <SelectTrigger>
        <SelectValue placeholder="Select a model" />
      </SelectTrigger>
      <SelectContent>
        {allPreferredModels.map((model) => (
          <SelectItem key={model} value={model}>
            {model}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  ) : null;
}
