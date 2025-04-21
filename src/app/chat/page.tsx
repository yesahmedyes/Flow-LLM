"use client";

import { nanoid } from "nanoid";
import ChatInterface from "../_components/chatInterface";
import { useEffect } from "react";
import { useChatsStore } from "../stores/chatsStore";

export default function ChatPage() {
  const id = nanoid();

  const addChat = useChatsStore((state) => state.addChat);

  useEffect(() => {
    addChat({
      id,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }, []);

  return <ChatInterface id={id} initialMessages={[]} />;
}
