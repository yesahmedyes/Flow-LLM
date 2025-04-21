"use client";

import React, { useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import ChatBox from "./chatBox";
import FullChat from "./fullChat";
import { useChatsStore } from "../stores/chatsStore";
import type { Message } from "ai";

interface ChatInterfaceProps {
  id: string;
  initialMessages: Message[];
}

export default function ChatInterface({ id, initialMessages }: ChatInterfaceProps) {
  const { messages, status, stop, append } = useChat({
    id: id as string,
    initialMessages: initialMessages,
    sendExtraMessageFields: true,
  });

  const handleSubmit = async (message: string) => {
    if (message.length === 0) {
      return;
    }

    // Use the append function from useChat to add messages
    await append({
      role: "user",
      content: message,
    });
  };

  const updateChatById = useChatsStore((state) => state.updateChatById);

  useEffect(() => {
    if (messages.length > 0) {
      updateChatById(id as string, messages as Message[]);
    }
  }, [messages]);

  return (
    <div className="flex w-full mx-auto flex-col items-center">
      <FullChat messages={messages as Message[]} isLoading={status === "streaming" || status === "submitted"} />

      <ChatBox
        messagesPresent={messages.length > 0}
        onSubmit={handleSubmit}
        isLoading={status === "streaming" || status === "submitted"}
        stop={stop}
      />
    </div>
  );
}
