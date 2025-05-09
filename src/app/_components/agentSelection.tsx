import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Switch } from "./ui/switch";
import { useAgentStore, type Agent } from "~/app/stores/agentStore";
import { api } from "~/trpc/react";
import { useRef, useCallback } from "react";

interface AgentSelectionProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export default function AgentSelection(props: AgentSelectionProps) {
  const { agent, setAgent } = useAgentStore();

  const changeAgentMutation = api.prefs.setAgentPreferences.useMutation();

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const changeAgent = useCallback(
    (key: keyof Agent, value: boolean) => {
      const newAgent = { ...agent, [key]: value };

      setAgent(newAgent);

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        changeAgentMutation.mutate({ agent: newAgent });
      }, 500);
    },
    [agent, setAgent, changeAgentMutation],
  );

  return (
    <Dialog open={props.open} onOpenChange={props.setOpen}>
      <DialogContent className="w-sm">
        <DialogHeader>
          <DialogTitle>Agent Selection</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-6 pt-4 pb-1">
          <div className="flex flex-row justify-between items-center">
            <div className="text-sm font-medium">Query Rewrite</div>
            <Switch
              checked={agent.queryRewrite}
              onCheckedChange={() => changeAgent("queryRewrite", !agent.queryRewrite)}
            />
          </div>
          <div className="flex flex-row justify-between items-center">
            <div className="text-sm font-medium">Chain of Thought</div>
            <Switch
              checked={agent.chainOfThought}
              onCheckedChange={() => changeAgent("chainOfThought", !agent.chainOfThought)}
            />
          </div>
          <div className="flex flex-row justify-between items-center">
            <div className="text-sm font-medium">Memory</div>
            <Switch checked={agent.memory} onCheckedChange={() => changeAgent("memory", !agent.memory)} />
          </div>
          <div className="flex flex-row justify-between items-center">
            <div className="text-sm font-medium">Web Search</div>
            <Switch checked={agent.webSearch} onCheckedChange={() => changeAgent("webSearch", !agent.webSearch)} />
          </div>
          <div className="flex flex-row justify-between items-center">
            <div className="text-sm font-medium">RAG</div>
            <Switch checked={agent.rag} onCheckedChange={() => changeAgent("rag", !agent.rag)} />
          </div>
          <div className="flex flex-row justify-between items-center">
            <div className="text-sm font-medium">Chunk Reranking</div>
            <Switch
              checked={agent.chunkReranking}
              onCheckedChange={() => changeAgent("chunkReranking", !agent.chunkReranking)}
            />
          </div>
          {/* <div className="flex flex-row justify-between items-center">
            <div className="text-sm font-medium">Critique</div>
            <Switch checked={agent.critique} onCheckedChange={() => changeAgent("critique", !agent.critique)} />
          </div> */}
        </div>
      </DialogContent>
    </Dialog>
  );
}
