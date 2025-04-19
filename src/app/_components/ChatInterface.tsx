"use client";

import React from "react";
import { useChat, type Message } from "@ai-sdk/react";
import ChatBox from "./chatBox";
import FullChat from "./fullChat";

export default function ChatInterface() {
  const { messages, append, stop, status } = useChat({
    api: "/api/chat",
  });

  const handleSubmit = async (message: string) => {
    // Use the append function from useChat to add messages
    await append({
      role: "user",
      content: message,
    });
  };

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
