"use client";

import { api } from "~/trpc/react";
import { useState } from "react";
import { Textarea } from "../_components/ui/textarea";
import { toast } from "sonner";
import { GraphPage } from "./_components/graphPage";

export default function MemoriesPage() {
  const { data: triplets, isLoading } = api.memory.getGraphTriplets.useQuery();

  const addMemoryMutation = api.memory.addMemoryToGraph.useMutation({
    onMutate: () => {
      toast.info("New memory is being added.");
    },
    onSuccess: () => {
      toast.info("Refresh the page in a few minutes to see the updated graph.");
    },
  });

  const [newMemory, setNewMemory] = useState<string>("");

  const handleSubmit = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();

      addMemoryMutation.mutate({ memory: newMemory });

      setNewMemory("");
    }
  };

  return (
    <div className="flex w-full mx-auto flex-col items-center h-full">
      <GraphPage triplets={triplets?.triplets ?? []} isLoading={isLoading} />

      <div className={`fixed flex flex-col items-center w-full bottom-12`}>
        <div
          className={`flex flex-col justify-between rounded-2xl border bg-background border-foreground/10 px-2 py-2 w-4xl`}
        >
          <div className="flex items-center">
            <Textarea
              placeholder="Ask New Memory"
              className={`border-none focus-visible:ring-0 pr-6`}
              value={newMemory}
              onChange={(e) => setNewMemory(e.target.value)}
              onKeyDown={handleSubmit}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
