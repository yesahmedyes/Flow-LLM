"use client";

import React, { useRef, useCallback } from "react";
import { useChat } from "@ai-sdk/react";
import ChatBox from "./chatBox";
import FullChat from "./fullChat";
import { useChatsStore } from "../../stores/chatsStore";
import type { Message } from "ai";
import { useUser } from "@clerk/nextjs";
import { useModelsStore } from "~/app/stores/modelsStore";
import { useAgentStore } from "~/app/stores/agentStore";

interface ChatInterfaceProps {
  id: string;
  initialMessages: Message[];
}

export default function ChatInterface({ id, initialMessages }: ChatInterfaceProps) {
  const { user } = useUser();

  const agentSelected = useRef(false);

  const { agent } = useAgentStore();

  const { selectedModel } = useModelsStore();

  const { messages, status, stop, append, setMessages } = useChat({
    id: id as string,
    initialMessages: initialMessages,
    sendExtraMessageFields: true,
    experimental_throttle: 100,
    onFinish: (_) => {
      updateChatById(id as string, messages as Message[], user!.id as string);
    },
  });

  const handleSubmit = useCallback(
    async (message: string) => {
      if (message.length === 0) {
        return;
      }

      if (messages.length === 0) {
        updateChatName(id as string, message);
      }

      const body = {
        model: selectedModel,
        agent: agentSelected.current ? agent : undefined,
      };

      // Use the append function from useChat to add messages
      await append({ role: "user", content: message }, { body });
    },
    [selectedModel, agentSelected, agent, append],
  );

  const updateChatById = useChatsStore((state) => state.updateChatById);
  const updateChatName = useChatsStore((state) => state.updateChatName);

  const onEditMessage = (messageId: string, content: string) => {
    const messageIndex = messages.findIndex((msg) => msg.id === messageId);

    if (messageIndex === -1) return;

    const message = messages[messageIndex]!;

    if (message.role !== "user") return;

    const messagesUpToEdit = messages.slice(0, messageIndex);

    setMessages([...messagesUpToEdit]);

    void handleSubmit(content);
  };

  return (
    <div className="flex w-full mx-auto flex-col items-center h-full overflow-y-auto">
      <FullChat messages={messages as Message[]} onEditMessage={onEditMessage} />

      <ChatBox
        messagesPresent={messages.length > 0}
        onSubmit={handleSubmit}
        isLoading={status === "streaming" || status === "submitted"}
        stop={stop}
        setAgentSelected={(value: boolean) => (agentSelected.current = value)}
      />
    </div>
  );
}
