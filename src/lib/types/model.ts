export interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface Model {
  id: string;
  name: string;
  description?: string;
  context_length: number;
  pricing: {
    prompt: number;
    completion: number;
  };
}

export interface ModelsResponse {
  data: Model[];
}
