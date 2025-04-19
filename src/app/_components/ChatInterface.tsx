"use client";

import React from "react";
import { useChat } from "@ai-sdk/react";
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
    <div className="flex">
      <div className="flex w-10/12 mx-auto flex-col">
        <div className="flex flex-1 flex-col items-center justify-between overflow-auto px-4 pt-4 h-[calc(100vh-100px)]">
          {messages.length === 0 && (
            <div className="mt-52 text-2xl font-semibold text-white">What can I help you with?</div>
          )}

          <FullChat messages={messages} isLoading={status === "streaming" || status === "submitted"} />

          <ChatBox
            messagesPresent={messages.length > 0}
            onSubmit={handleSubmit}
            isLoading={status === "streaming" || status === "submitted"}
            stop={stop}
          />
        </div>
      </div>
    </div>
  );
}
