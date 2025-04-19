"use client";

import React, { useEffect, useRef } from "react";
import { useChat, type Message } from "@ai-sdk/react";
import ChatBox from "./chatBox";
import FullChat from "./fullChat";

export default function ChatInterface() {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const prevMessagesLengthRef = useRef<number>(0);
  const lastContentLengthRef = useRef<number>(0);

  const { messages, append, stop, status } = useChat({
    api: "/api/chat",
  });

  useEffect(() => {
    // Check if number of messages has increased
    if (messages.length > prevMessagesLengthRef.current) {
      if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
      }

      prevMessagesLengthRef.current = messages.length;
    }
    // Or if the last message's content length has increased substantially
    else if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];

      const currentContentLength = lastMessage?.content.length ?? 0;

      // Only scroll if content length increased by at least 300 characters
      if (currentContentLength > lastContentLengthRef.current + 300) {
        if (scrollAreaRef.current) {
          scrollAreaRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
        }
        lastContentLengthRef.current = currentContentLength;
      }
    }
  }, [messages]);

  const handleSubmit = async (message: string) => {
    if (message.length === 0) {
      return;
    }

    // Use the append function from useChat to add messages
    await append({
      role: "user",
      content: message,
    });

    // Reset the last content length when a new message is submitted
    lastContentLengthRef.current = 0;
  };

  return (
    <div ref={scrollAreaRef} className="flex w-full mx-auto flex-col items-center">
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
