"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
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

  const [agentSelected, setAgentSelected] = useState(false);
  const { agent } = useAgentStore();

  const { selectedModel } = useModelsStore();

  const initialMessageCount = useRef(initialMessages.length);

  const { messages, status, stop, append } = useChat({
    id: id as string,
    initialMessages: initialMessages,
    sendExtraMessageFields: true,
  });

  const handleSubmit = useCallback(
    async (message: string) => {
      if (message.length === 0) {
        return;
      }

      const body = {
        model: selectedModel,
        agent: agentSelected ? agent : undefined,
      };

      // Use the append function from useChat to add messages
      await append({ role: "user", content: message }, { body });
    },
    [selectedModel, agentSelected, agent, append],
  );

  const updateChatById = useChatsStore((state) => state.updateChatById);
  const updateChatName = useChatsStore((state) => state.updateChatName);

  useEffect(() => {
    if (messages) {
      console.log("messages", messages);
    }
  }, [messages]);

  useEffect(() => {
    // Only update the chat if messages have actually changed (new messages added)
    if (messages.length > 0 && messages.length !== initialMessageCount.current) {
      updateChatById(id as string, messages as Message[], user!.id as string);

      initialMessageCount.current = messages.length;
    }

    if (messages.length === 1 && initialMessageCount.current === 0) {
      updateChatName(id as string, messages[0]!.content as string);
    }
  }, [messages, id, updateChatById, updateChatName, user]);

  return (
    <div className="flex w-full mx-auto flex-col items-center">
      <FullChat messages={messages as Message[]} isLoading={status === "streaming" || status === "submitted"} />

      <ChatBox
        messagesPresent={messages.length > 0}
        onSubmit={handleSubmit}
        isLoading={status === "streaming" || status === "submitted"}
        stop={stop}
        agentSelected={agentSelected}
        setAgentSelected={setAgentSelected}
      />
    </div>
  );
}
