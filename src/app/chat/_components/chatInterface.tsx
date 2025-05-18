"use client";

import React, { useRef, useCallback, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import ChatBox from "./chatBox";
import FullChat from "./fullChat";
import { useChatsStore } from "../../stores/chatsStore";
import type { Message, UIMessage } from "ai";
import { useUser } from "@clerk/nextjs";
import { useModelsStore } from "~/app/stores/modelsStore";
import { useAgentStore } from "~/app/stores/agentStore";
import type { UploadedFile } from "../../../hooks/useFileUpload";

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
  });

  const handleSubmit = useCallback(
    async (message: string, uploadedFiles?: UploadedFile[]) => {
      if (message.length === 0 && (!uploadedFiles || uploadedFiles.length === 0)) {
        return;
      }

      if (messages.length === 0) {
        updateChatName(id as string, message);
      }

      const body = {
        model: selectedModel,
        agent: agentSelected.current ? agent : undefined,
      };

      await append({ role: "user", content: message }, { body, experimental_attachments: uploadedFiles });
    },
    [selectedModel, agentSelected, agent, append],
  );

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

  const { updateChatById } = useChatsStore();

  const totalMessages = useRef(messages.length);

  useEffect(() => {
    if (messages.length > totalMessages.current) {
      updateChatById(id as string, messages, user!.id as string);

      totalMessages.current = messages.length;
    }
  }, [messages.length]);

  console.log(messages);

  return (
    <div className="flex w-full mx-auto flex-col items-center h-full overflow-y-auto">
      <FullChat
        messages={messages as UIMessage[]}
        onEditMessage={onEditMessage}
        isLoading={status === "streaming" || status === "submitted"}
      />

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
