"use client";

import { nanoid } from "nanoid";
import ChatInterface from "../_components/chatInterface";
import { useState } from "react";

export default function ChatPage() {
  const [id, _] = useState<string>(nanoid());

  return <ChatInterface id={id} initialMessages={[]} />;
}
