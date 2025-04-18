"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import * as Select from "@radix-ui/react-select";
import { availableModels, Message } from "../../server/openrouter";

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "system",
      content:
        "You are a helpful AI assistant powered by OpenRouter. Answer as concisely as possible.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState(availableModels[0].id);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          modelId: selectedModel,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get response");
      }

      const data = await response.json();
      setMessages((prev) => [...prev, data.message]);
    } catch (err) {
      console.error("Error:", err);
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto flex h-full max-w-3xl flex-col">
      <div className="mb-4">
        <ModelSelector
          selectedModel={selectedModel}
          onModelChange={setSelectedModel}
        />
      </div>

      <div className="mb-4 flex-grow overflow-auto rounded-md border border-gray-200 bg-white p-4">
        {messages.slice(1).map((message, index) => (
          <div
            key={index}
            className={`mb-4 rounded-lg p-3 ${
              message.role === "user"
                ? "ml-auto max-w-[80%] bg-blue-100"
                : "mr-auto max-w-[80%] bg-gray-100"
            }`}
          >
            <div className="mb-1 font-semibold">
              {message.role === "user" ? "You" : "AI"}
            </div>
            <div className="prose prose-sm">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="mr-auto mb-4 max-w-[80%] rounded-lg bg-gray-100 p-3">
            <div className="mb-1 font-semibold">AI</div>
            <div>Thinking...</div>
          </div>
        )}
        {error && (
          <div className="mb-4 w-full rounded-lg bg-red-100 p-3 text-red-700">
            Error: {error}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          disabled={isLoading}
          className="flex-grow rounded-md border border-gray-300 p-2"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="rounded-md bg-blue-600 px-4 py-2 text-white disabled:bg-blue-300"
        >
          Send
        </button>
      </form>
    </div>
  );
}

interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
}

function ModelSelector({ selectedModel, onModelChange }: ModelSelectorProps) {
  return (
    <div className="flex items-center">
      <label htmlFor="model-select" className="mr-2 font-medium">
        Model:
      </label>
      <Select.Root value={selectedModel} onValueChange={onModelChange}>
        <Select.Trigger
          id="model-select"
          className="inline-flex min-w-[220px] items-center justify-between rounded border border-gray-300 bg-white px-3 py-2"
        >
          <Select.Value />
        </Select.Trigger>
        <Select.Portal>
          <Select.Content
            position="popper"
            className="max-h-[400px] min-w-[220px] overflow-hidden overflow-y-auto rounded-md border border-gray-200 bg-white shadow-lg"
          >
            <Select.Viewport>
              {availableModels.map((model) => (
                <Select.Item
                  key={model.id}
                  value={model.id}
                  className="cursor-pointer px-3 py-2 outline-none hover:bg-gray-100 data-[highlighted]:bg-gray-100"
                >
                  <Select.ItemText>{model.name}</Select.ItemText>
                </Select.Item>
              ))}
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    </div>
  );
}
