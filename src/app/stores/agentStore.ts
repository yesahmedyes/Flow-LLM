import { create } from "zustand";

export type Agent = {
  queryRewrite: boolean;
  chainOfThought: boolean;
  memory: boolean;
  webSearch: boolean;
  rag: boolean;
  chunkReranking: boolean;
  critique: boolean;
};

interface AgentStore {
  agent: Agent;
  contentLoaded: boolean;
  setAgent: (agent: Agent) => void;
  setContentLoaded: (contentLoaded: boolean) => void;
}

export const useAgentStore = create<AgentStore>()((set) => ({
  agent: {
    queryRewrite: false,
    chainOfThought: false,
    memory: false,
    webSearch: false,
    rag: false,
    chunkReranking: false,
    critique: false,
  },
  contentLoaded: false,
  setAgent: (agent) => {
    set({ agent });

    localStorage.setItem("agentPreferences", JSON.stringify(agent));
  },
  setContentLoaded: (contentLoaded) => set({ contentLoaded }),
}));
